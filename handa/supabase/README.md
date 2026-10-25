# HANDA — Supabase setup

Supabase is optional. Without it the app runs as a guest (everything stays in
the device's IndexedDB). With it, users get magic-link / Google sign-in and a
per-user mirror of their data. All of this fits the free tier.

## 1. Create the project

1. <https://supabase.com/dashboard> → **New project**.
   Name `handa`, region **Southeast Asia (Singapore)**, generate a strong
   database password and store it in your password manager (needed for backups).
2. Wait for the project to finish provisioning.

## 2. Run the schema

1. Dashboard → **SQL Editor** → **New query**.
2. Paste the whole of [`schema.sql`](./schema.sql) and **Run**.
   It is idempotent; re-run it after any edit.
3. Check **Table Editor**: `profiles`, `households`, `runs`, `inventory`,
   `scores`, `surveys`, `keepalive` exist and show the RLS shield.
4. Check **Database → Functions**: `export_my_data`, `delete_my_data`, `ping`,
   `handle_new_user`, `lww_guard`.

## 3. Auth providers

**Authentication → Providers**

- **Email**: enabled. Turn **Confirm email** on (magic links need it). You can
  leave passwords disabled; the app only uses OTP/magic links.
  Optional: Authentication → Email Templates → *Magic Link* — brand the copy.
- **Google** (optional):
  1. In Google Cloud Console create an **OAuth 2.0 Client ID** (Web application).
     Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
  2. Paste Client ID + Secret into the Supabase Google provider and enable it.
  3. Set `VITE_GOOGLE_AUTH=1` in the app env.

**Authentication → URL Configuration**

- **Site URL**: `https://prepare.ph` (or `http://localhost:5173` while developing).
- **Redirect URLs**, add every origin you use, each with `/auth/callback`:
  - `http://localhost:5173/auth/callback`
  - `https://prepare.ph/auth/callback`
  - your preview host, e.g. `https://*.pages.dev/auth/callback`

The app redirects to `window.location.origin + '/auth/callback'`; the Supabase
client (PKCE flow, `detectSessionInUrl: true`) completes the sign-in on that
route, so the route only needs to render a spinner and then navigate home.

Rate-limit tip (free tier sends 2 auth emails/hour on the built-in SMTP):
Authentication → SMTP Settings → add a free Resend/Brevo account for production.

## 4. App environment

Dashboard → **Project Settings → API**. Copy into `.env.local`
(see [`.env.example`](../.env.example)):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
VITE_GOOGLE_AUTH=1          # only if you enabled Google
VITE_SITE_URL=https://prepare.ph
```

Add the same variables to your host (Cloudflare Pages / Netlify → environment).
Never ship the `service_role` key or the DB password to the client.

## 5. GitHub secrets for the workflows

Repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value | Used by |
|---|---|---|
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` | `keepalive.yml` |
| `SUPABASE_ANON_KEY` | anon public key | `keepalive.yml` |
| `SUPABASE_DB_URL` | **Session pooler** URI from Dashboard → *Connect* → *Session pooler* (port 5432). Fill in the DB password. The direct host is IPv6-only and GitHub runners cannot reach it. | `backup.yml` |
| `BACKUP_PASSPHRASE` | a long random string (`openssl rand -base64 32`). Dumps are GPG-encrypted with it because workflow artifacts are readable by anyone who can read the repo. | `backup.yml` |

Both workflows skip themselves (green run with a notice) when their secrets
are missing, so it is safe to merge them before the project exists.

## 6. Enable the workflows

- The files are in `.github/workflows/keepalive.yml` and `backup.yml`.
  GitHub only reads workflows from the **repository root**. If `handa/` is a
  sub-folder of a larger repo, copy both files to `<repo-root>/.github/workflows/`.
- Repo → **Actions** → pick each workflow → **Enable workflow** if prompted,
  then **Run workflow** once to verify:
  - *Supabase keep-alive* should print `pinged at "2026-…"`.
  - *Supabase weekly backup* should upload `handa-db-backup-<date>`.
- Schedules: keep-alive daily 03:17 UTC; backup Sundays 02:23 UTC.
  Scheduled workflows are paused automatically after 60 days without commits
  on a repo — a manual **Run workflow** re-enables them.

Restore a backup:

```sh
gpg --batch --passphrase "$BACKUP_PASSPHRASE" -d handa-2026-10-25.sql.gz.gpg | gunzip | psql "$SUPABASE_DB_URL"
```

## 7. Viewing survey responses

There is no separate view; responses are rows in `surveys`. Table Editor →
`surveys` shows them (the dashboard bypasses RLS). For insight work join
profiles **only where consent is true**:

```sql
select s.at, s.answers, p.region, p.city, p.how_found
from public.surveys s
join public.profiles p on p.id = s.user_id
where p.consent
order by s.at desc;
```

## 8. Security model (what to re-check after any schema change)

- RLS **enabled and forced** on every table; four policies per table, all
  `auth.uid() = user_id` (`= id` on `profiles`).
- `anon` has no table privileges; it can only execute `ping()`.
- `export_my_data()` / `delete_my_data()` are `security definer` but filter by
  `auth.uid()` and refuse anonymous callers.
- `tier` on `profiles` cannot be changed by the client (trigger restores it).
  Payments are off; grant Plus manually in the Table Editor if ever needed.
- Quick test in SQL editor as an authenticated user: Dashboard → Table Editor →
  *Impersonate* a user and confirm you only see that user's rows.
