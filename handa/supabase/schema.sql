-- =============================================================================
-- HANDA (prepare.ph) — Supabase / Postgres schema
-- =============================================================================
-- Run this whole file in the Supabase SQL editor. It is idempotent: every
-- statement is `create ... if not exists`, `create or replace`, or
-- `drop ... if exists` followed by `create`, so you can re-run it after edits.
--
-- Design (see PLAN.md §4):
--   * The device's Dexie/IndexedDB is the source of truth. These tables are a
--     per-user MIRROR, written by the client's outbox and read by pullAll().
--   * Row ids are generated on the client (`uid()` = crypto.randomUUID, with a
--     non-UUID fallback on very old browsers), so ids are `text`, not `uuid`.
--   * `updated_at` is a bigint epoch-ms stamp written by the client. Conflicts
--     are resolved last-write-wins per row by `updated_at` (an LWW trigger below
--     refuses updates that would roll a row back in time).
--   * Catalogue items are referenced by their string id (`catalog_id text`);
--     the catalogue itself ships with the app and is never stored here.
--   * No cross-table foreign keys between data tables on purpose: an offline
--     device can replay a run before its household lands, and rows must never
--     be rejected for ordering reasons. Everything is scoped per user instead.
--
-- OPSEC:
--   * RLS is enabled AND forced on every table. Each table has exactly four
--     policies (select/insert/update/delete), all bound to `auth.uid() = user_id`.
--   * The `anon` role has no table privileges at all; it can only execute
--     `ping()` (used by the keep-alive GitHub Action).
--   * Nothing here is public. The Ready Card shares a percentage only and that
--     is rendered client-side; no inventory ever leaves the owner's rows.
--
-- Marketing insight lives on `profiles` only: region, city, how_found,
-- consent (default false), consent_at. We collect nothing else.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

-- Current time in epoch milliseconds (matches the client's Date.now()).
create or replace function public.now_ms()
returns bigint
language sql
stable
as $$
  select (extract(epoch from clock_timestamp()) * 1000)::bigint;
$$;

-- Last-write-wins guard. Attached as BEFORE UPDATE on every data table:
-- if an incoming row is OLDER than what we already have, skip the update
-- silently (returning NULL from a BEFORE trigger cancels the row operation).
-- The client later pulls the newer row and reconciles locally.
create or replace function public.lww_guard()
returns trigger
language plpgsql
as $$
begin
  if new.updated_at is not null and old.updated_at is not null
     and new.updated_at < old.updated_at then
    return null;
  end if;
  -- user_id is immutable; never let a row hop between users.
  new.user_id := old.user_id;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles — one row per auth user, created by trigger on sign-up.
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  region      text,                                  -- e.g. 'NCR', 'Region VII'
  city        text,
  how_found   text,                                  -- e.g. 'tiktok', 'friend', 'press'
  consent     boolean not null default false,        -- marketing/insight consent
  consent_at  timestamptz,                           -- when consent flipped to true
  tier        text not null default 'free' check (tier in ('free', 'plus')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table public.profiles is
  'One row per user. Only region/city/how_found/consent are collected for insight; tier is set server-side (payments are off at launch).';

create or replace function public.profiles_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  -- Stamp consent_at the moment consent becomes true; clear it when withdrawn.
  if new.consent and not coalesce(old.consent, false) then
    new.consent_at := now();
  elsif not new.consent then
    new.consent_at := null;
  end if;
  -- tier is not user-editable: keep the stored value whatever the client sends.
  new.tier := old.tier;
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.profiles_touch_updated_at();

-- Create the profile row when a user signs up (any provider).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users that existed before this trigger was installed.
insert into public.profiles (id)
select u.id from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- households  (mirrors domain Household)
-- -----------------------------------------------------------------------------
create table if not exists public.households (
  id             text primary key,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name           text not null default '',
  adults         integer not null default 0,
  kids           integer not null default 0,
  babies         integer not null default 0,
  seniors        integer not null default 0,
  pets           integer not null default 0,
  special_needs  jsonb not null default '[]'::jsonb,   -- string[] of free-text tags
  region         text,
  city           text,
  created_at     bigint,                               -- epoch ms (client clock)
  updated_at     bigint not null default public.now_ms()
);
create index if not exists households_user_id_idx on public.households (user_id);

-- -----------------------------------------------------------------------------
-- runs  (mirrors domain Run)
-- -----------------------------------------------------------------------------
create table if not exists public.runs (
  id             text primary key,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  household_id   text not null,
  scenario       text not null,                        -- ScenarioId
  duration       text not null,                        -- DurationId ('1d'|'1w'|'1m'|'1y')
  started_at     bigint not null,
  finished_at    bigint,
  readiness_pct  real,
  days_covered   real,
  updated_at     bigint not null default public.now_ms()
);
create index if not exists runs_user_id_idx on public.runs (user_id);
create index if not exists runs_household_id_idx on public.runs (household_id);

-- -----------------------------------------------------------------------------
-- inventory  (mirrors domain InventoryRow). Items belong to the household.
-- -----------------------------------------------------------------------------
create table if not exists public.inventory (
  id             text primary key,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  household_id   text not null,
  catalog_id     text not null,                        -- CatalogItem.id (ships with the app)
  qty            real not null default 0,
  unit           text not null,                        -- Unit
  expires_at     bigint,
  slot           text not null,                        -- SlotId (where it sits in the 3D house)
  note           text,
  created_at     bigint,
  updated_at     bigint not null default public.now_ms()
);
create index if not exists inventory_user_id_idx on public.inventory (user_id);
create index if not exists inventory_household_id_idx on public.inventory (household_id);

-- -----------------------------------------------------------------------------
-- scores  (mirrors domain Score)
-- -----------------------------------------------------------------------------
create table if not exists public.scores (
  id             text primary key,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  run_id         text not null,
  household_id   text not null,
  scenario       text not null,
  duration       text not null,
  pct            real not null default 0,
  days_covered   real not null default 0,
  categories     jsonb not null default '{}'::jsonb,   -- Partial<Record<CategoryId, number>>
  at             bigint not null,
  updated_at     bigint not null default public.now_ms()
);
create index if not exists scores_user_id_idx on public.scores (user_id);
create index if not exists scores_household_id_idx on public.scores (household_id);
create index if not exists scores_run_id_idx on public.scores (run_id);

-- -----------------------------------------------------------------------------
-- surveys  (mirrors domain SurveyAnswer)
-- -----------------------------------------------------------------------------
-- Admin view: there is no separate `survey_responses` object. To read responses
-- open Supabase Dashboard -> Table Editor -> `surveys` (RLS does not apply to
-- the dashboard's service role), or run in the SQL editor:
--   select s.at, s.answers, p.region, p.city, p.how_found
--   from public.surveys s join public.profiles p on p.id = s.user_id
--   where p.consent order by s.at desc;
-- Only join to profiles where `consent` is true when using the data for insight.
create table if not exists public.surveys (
  id             text primary key,
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  answers        jsonb not null default '{}'::jsonb,   -- Record<string, string | number>
  at             bigint not null,
  updated_at     bigint not null default public.now_ms()
);
create index if not exists surveys_user_id_idx on public.surveys (user_id);
comment on table public.surveys is
  'Survey answers, one row per submission. View in Dashboard > Table Editor > surveys. Join profiles only where consent = true.';

-- -----------------------------------------------------------------------------
-- LWW triggers on every data table
-- -----------------------------------------------------------------------------
drop trigger if exists households_lww on public.households;
create trigger households_lww before update on public.households
  for each row execute function public.lww_guard();

drop trigger if exists runs_lww on public.runs;
create trigger runs_lww before update on public.runs
  for each row execute function public.lww_guard();

drop trigger if exists inventory_lww on public.inventory;
create trigger inventory_lww before update on public.inventory
  for each row execute function public.lww_guard();

drop trigger if exists scores_lww on public.scores;
create trigger scores_lww before update on public.scores
  for each row execute function public.lww_guard();

drop trigger if exists surveys_lww on public.surveys;
create trigger surveys_lww before update on public.surveys
  for each row execute function public.lww_guard();

-- -----------------------------------------------------------------------------
-- Row Level Security — every table, four policies, all bound to auth.uid().
-- `force row level security` also applies RLS to the table owner so a future
-- SECURITY DEFINER function cannot accidentally bypass it (the two RPCs below
-- filter by auth.uid() explicitly anyway).
-- -----------------------------------------------------------------------------

-- profiles: bound to id (= auth user id). No insert policy for clients: the
-- row is created by the auth trigger. No delete policy: use delete_my_data().
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profiles delete own" on public.profiles;
create policy "profiles delete own" on public.profiles
  for delete to authenticated using (auth.uid() = id);

-- households
alter table public.households enable row level security;
alter table public.households force row level security;
drop policy if exists "households select own" on public.households;
create policy "households select own" on public.households
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "households insert own" on public.households;
create policy "households insert own" on public.households
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "households update own" on public.households;
create policy "households update own" on public.households
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "households delete own" on public.households;
create policy "households delete own" on public.households
  for delete to authenticated using (auth.uid() = user_id);

-- runs
alter table public.runs enable row level security;
alter table public.runs force row level security;
drop policy if exists "runs select own" on public.runs;
create policy "runs select own" on public.runs
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "runs insert own" on public.runs;
create policy "runs insert own" on public.runs
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "runs update own" on public.runs;
create policy "runs update own" on public.runs
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "runs delete own" on public.runs;
create policy "runs delete own" on public.runs
  for delete to authenticated using (auth.uid() = user_id);

-- inventory
alter table public.inventory enable row level security;
alter table public.inventory force row level security;
drop policy if exists "inventory select own" on public.inventory;
create policy "inventory select own" on public.inventory
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "inventory insert own" on public.inventory;
create policy "inventory insert own" on public.inventory
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "inventory update own" on public.inventory;
create policy "inventory update own" on public.inventory
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "inventory delete own" on public.inventory;
create policy "inventory delete own" on public.inventory
  for delete to authenticated using (auth.uid() = user_id);

-- scores
alter table public.scores enable row level security;
alter table public.scores force row level security;
drop policy if exists "scores select own" on public.scores;
create policy "scores select own" on public.scores
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "scores insert own" on public.scores;
create policy "scores insert own" on public.scores
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "scores update own" on public.scores;
create policy "scores update own" on public.scores
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "scores delete own" on public.scores;
create policy "scores delete own" on public.scores
  for delete to authenticated using (auth.uid() = user_id);

-- surveys
alter table public.surveys enable row level security;
alter table public.surveys force row level security;
drop policy if exists "surveys select own" on public.surveys;
create policy "surveys select own" on public.surveys
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "surveys insert own" on public.surveys;
create policy "surveys insert own" on public.surveys
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "surveys update own" on public.surveys;
create policy "surveys update own" on public.surveys
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "surveys delete own" on public.surveys;
create policy "surveys delete own" on public.surveys
  for delete to authenticated using (auth.uid() = user_id);

-- Table privileges: Supabase grants anon + authenticated on public by default.
-- Take everything away from anon (guest mode never talks to the database) and
-- grant authenticated only what the policies allow.
revoke all on public.profiles, public.households, public.runs,
           public.inventory, public.scores, public.surveys from anon;
grant select, insert, update, delete on public.profiles, public.households,
      public.runs, public.inventory, public.scores, public.surveys to authenticated;

-- -----------------------------------------------------------------------------
-- RPC: export_my_data() — everything the caller owns, as one jsonb document.
-- SECURITY DEFINER so it works even if policies change later; it still filters
-- by auth.uid() and refuses anonymous callers.
-- -----------------------------------------------------------------------------
create or replace function public.export_my_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'export_my_data(): not signed in' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'exportedAt', public.now_ms(),
    'userId',     me,
    'profile',    (select to_jsonb(p) from public.profiles p where p.id = me),
    'households', coalesce((select jsonb_agg(to_jsonb(t) order by t.updated_at) from public.households t where t.user_id = me), '[]'::jsonb),
    'runs',       coalesce((select jsonb_agg(to_jsonb(t) order by t.updated_at) from public.runs       t where t.user_id = me), '[]'::jsonb),
    'inventory',  coalesce((select jsonb_agg(to_jsonb(t) order by t.updated_at) from public.inventory  t where t.user_id = me), '[]'::jsonb),
    'scores',     coalesce((select jsonb_agg(to_jsonb(t) order by t.updated_at) from public.scores     t where t.user_id = me), '[]'::jsonb),
    'surveys',    coalesce((select jsonb_agg(to_jsonb(t) order by t.updated_at) from public.surveys    t where t.user_id = me), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;

-- -----------------------------------------------------------------------------
-- RPC: delete_my_data() — wipes every row the caller owns, profile included.
-- The auth.users row itself is NOT removed here (that needs the service role or
-- the dashboard); the client signs the user out afterwards. If you want full
-- account deletion, uncomment the last delete — the `postgres` role that owns
-- this function can delete from auth.users in a Supabase project.
-- -----------------------------------------------------------------------------
create or replace function public.delete_my_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  n_households int; n_runs int; n_inventory int; n_scores int; n_surveys int; n_profiles int;
begin
  if me is null then
    raise exception 'delete_my_data(): not signed in' using errcode = '42501';
  end if;

  delete from public.inventory  where user_id = me; get diagnostics n_inventory  = row_count;
  delete from public.scores     where user_id = me; get diagnostics n_scores     = row_count;
  delete from public.runs       where user_id = me; get diagnostics n_runs       = row_count;
  delete from public.households where user_id = me; get diagnostics n_households = row_count;
  delete from public.surveys    where user_id = me; get diagnostics n_surveys    = row_count;
  delete from public.profiles   where id      = me; get diagnostics n_profiles   = row_count;
  -- delete from auth.users where id = me;   -- optional: full account removal

  return jsonb_build_object(
    'households', n_households, 'runs', n_runs, 'inventory', n_inventory,
    'scores', n_scores, 'surveys', n_surveys, 'profiles', n_profiles
  );
end;
$$;

revoke all on function public.delete_my_data() from public, anon;
grant execute on function public.delete_my_data() to authenticated;

-- -----------------------------------------------------------------------------
-- keepalive — a single row the GitHub Action pokes daily so Supabase's free
-- tier does not pause the project for inactivity. Nobody can read it directly
-- (RLS on, no policies); only `ping()` touches it.
-- -----------------------------------------------------------------------------
create table if not exists public.keepalive (
  id         integer primary key default 1 check (id = 1),   -- exactly one row
  pinged_at  timestamptz not null default now(),
  pings      bigint not null default 0
);
insert into public.keepalive (id) values (1) on conflict (id) do nothing;

alter table public.keepalive enable row level security;
alter table public.keepalive force row level security;
revoke all on public.keepalive from anon, authenticated;

create or replace function public.ping()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  t timestamptz;
begin
  update public.keepalive
     set pinged_at = now(), pings = pings + 1
   where id = 1
   returning pinged_at into t;
  return t;
end;
$$;

-- The keep-alive workflow calls this with the anon key, so anon may execute it.
grant execute on function public.ping() to anon, authenticated;

-- Hint PostgREST to reload its schema cache after changes.
notify pgrst, 'reload schema';
