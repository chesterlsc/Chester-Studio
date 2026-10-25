/**
 * Outbox replay + pull. Local-first sync engine.
 *
 *   startSync(userId?)  subscribe to online/visibility, flush outbox, pull.
 *   stopSync()          unsubscribe, cancel retries.
 *   syncNow()           one flush + pull cycle (used by a "Sync now" button).
 *
 * Push: outbox ops are grouped by table, collapsed to the latest op per row,
 * upserted with `onConflict: 'id'` / deleted with `.in('id', ids)`, then the
 * replayed outbox rows are removed. The server's LWW trigger ignores pushes
 * older than what it already holds.
 *
 * Pull: per table, `updated_at > sync.lastPulledAt` for this user; a remote row
 * is written locally only when it is newer than the local copy (LWW). Pulled
 * rows are written with `db.table.put` directly so they do not re-enter the outbox.
 *
 * Everything no-ops when `supabase` is null (guest mode).
 */
import { liveQuery, type EntityTable, type Subscription } from 'dexie';
import { create } from 'zustand';
import { db, getSetting, setSetting, type OutboxOp } from '@/store/db';
import { supabase } from './supabase';
import { SYNC_TABLES, toLocal, toRemote, type LocalRow, type RemoteRow, type SyncTable } from './mapping';

// ---------------------------------------------------------------------------
// Status store
// ---------------------------------------------------------------------------
export type SyncState = 'idle' | 'syncing' | 'offline' | 'error';
export interface SyncStatus {
  state: SyncState;
  /** Outbox ops waiting to be pushed. */
  pending: number;
  /** Epoch ms of the last fully successful cycle. */
  lastSyncAt?: number;
  /** Last error message, when state === 'error'. */
  error?: string;
}
export const useSyncStatus = create<SyncStatus>()(() => ({ state: 'idle', pending: 0 }));

const LAST_PULLED_KEY = 'sync.lastPulledAt';
const LAST_SYNC_KEY = 'sync.lastSyncAt';
const PAGE = 500;                 // PostgREST default max is 1000
const BASE_DELAY = 2_000;
const MAX_DELAY = 5 * 60_000;
const PERIODIC_MS = 5 * 60_000;   // pull while the tab is visible

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------
let active = false;
let currentUserId: string | undefined;
let attempt = 0;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let periodicTimer: ReturnType<typeof setInterval> | undefined;
let pendingSub: Subscription | undefined;
let inFlight: Promise<void> | undefined;

function isOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

async function resolveUserId(): Promise<string | undefined> {
  if (currentUserId) return currentUserId;
  if (!supabase) return undefined;
  const { data } = await supabase.auth.getSession();
  currentUserId = data.session?.user.id;
  return currentUserId;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Begin syncing for the signed-in user. Safe to call repeatedly. */
export function startSync(userId?: string): void {
  if (!supabase) return; // guest mode
  if (userId) currentUserId = userId;
  if (active) {
    void syncNow();
    return;
  }
  active = true;
  attempt = 0;

  if (typeof window !== 'undefined') {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisibility);
    periodicTimer = setInterval(() => {
      if (document.visibilityState === 'visible') void syncNow();
    }, PERIODIC_MS);
  }
  watchPending();
  void syncNow();
}

/** Stop syncing (sign-out, account deletion). Local data is untouched. */
export function stopSync(): void {
  active = false;
  currentUserId = undefined;
  attempt = 0;
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = undefined;
  if (periodicTimer) clearInterval(periodicTimer);
  periodicTimer = undefined;
  if (typeof window !== 'undefined') {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
    document.removeEventListener('visibilitychange', onVisibility);
  }
  useSyncStatus.setState({ state: 'idle', error: undefined });
}

/** One flush + pull cycle. Resolves (never rejects) when the cycle ends. */
export function syncNow(): Promise<void> {
  if (!supabase || !active) return Promise.resolve();
  if (inFlight) return inFlight;
  inFlight = runCycle().finally(() => { inFlight = undefined; });
  return inFlight;
}

// ---------------------------------------------------------------------------
// Cycle + retry
// ---------------------------------------------------------------------------
async function runCycle(): Promise<void> {
  if (!isOnline()) {
    useSyncStatus.setState({ state: 'offline' });
    return;
  }
  const userId = await resolveUserId();
  if (!userId) return; // session gone; useAuth will call stopSync()

  useSyncStatus.setState({ state: 'syncing', error: undefined });
  try {
    await flushOutbox(userId);
    await pullAll(userId);
    attempt = 0;
    const now = Date.now();
    await setSetting(LAST_SYNC_KEY, now);
    useSyncStatus.setState({ state: 'idle', lastSyncAt: now, error: undefined });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[handa/sync] cycle failed', message);
    useSyncStatus.setState({ state: isOnline() ? 'error' : 'offline', error: message });
    scheduleRetry();
  }
}

function scheduleRetry(): void {
  if (!active || retryTimer) return;
  const delay = Math.min(MAX_DELAY, BASE_DELAY * 2 ** attempt) * (0.75 + Math.random() * 0.5);
  attempt += 1;
  retryTimer = setTimeout(() => {
    retryTimer = undefined;
    void syncNow();
  }, delay);
}

function onOnline(): void {
  attempt = 0;
  if (retryTimer) { clearTimeout(retryTimer); retryTimer = undefined; }
  void syncNow();
}
function onOffline(): void {
  useSyncStatus.setState({ state: 'offline' });
}
function onVisibility(): void {
  if (document.visibilityState === 'visible') void syncNow();
}

function watchPending(): void {
  if (pendingSub) return;
  try {
    pendingSub = liveQuery(() => db.outbox.count()).subscribe({
      next: (pending) => useSyncStatus.setState({ pending }),
      error: () => { /* IndexedDB unavailable; pending stays at last known value */ },
    });
  } catch {
    /* liveQuery not available in this environment */
  }
}

// ---------------------------------------------------------------------------
// Push
// ---------------------------------------------------------------------------
interface Collapsed {
  upserts: Map<string, LocalRow>;   // rowId -> latest payload
  deletes: Set<string>;
  opIds: number[];                  // outbox ids covered by this batch
}

/** Replay every queued op. Exported for tests / manual "push now". */
export async function flushOutbox(userId?: string): Promise<void> {
  if (!supabase) return;
  const uid = userId ?? (await resolveUserId());
  if (!uid) return;

  const ops = await db.outbox.orderBy('at').toArray();
  if (!ops.length) return;

  const byTable = new Map<SyncTable, Collapsed>();
  const drop: number[] = [];       // ops we must never send (foreign owner)

  for (const op of ops) {
    if (op.id == null) continue;
    const owner = (op.payload as { userId?: string } | undefined)?.userId;
    if (op.op === 'upsert' && owner && owner !== uid) {
      // Row belongs to another account that used this device. RLS would
      // reject it forever; discard the op (the local row itself is kept).
      drop.push(op.id);
      continue;
    }
    let c = byTable.get(op.table);
    if (!c) { c = { upserts: new Map(), deletes: new Set(), opIds: [] }; byTable.set(op.table, c); }
    c.opIds.push(op.id);
    if (op.op === 'delete') {
      c.upserts.delete(op.rowId);
      c.deletes.add(op.rowId);
    } else {
      c.deletes.delete(op.rowId);
      if (op.payload) c.upserts.set(op.rowId, op.payload as LocalRow);
      else c.upserts.set(op.rowId, { id: op.rowId } as LocalRow); // resolved below
    }
  }
  if (drop.length) await db.outbox.bulkDelete(drop);

  for (const [table, c] of byTable) {
    // Ops without a payload: use the current local row, if it still exists.
    for (const [rowId, row] of c.upserts) {
      if (Object.keys(row).length > 1) continue;
      const local = (await db.table(table).get(rowId)) as LocalRow | undefined;
      if (local) c.upserts.set(rowId, local);
      else c.upserts.delete(rowId);
    }

    if (c.upserts.size) {
      const rows = [...c.upserts.values()].map((r) => toRemote(table, r, uid));
      const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(`${table} upsert: ${error.message}`);
    }
    if (c.deletes.size) {
      const { error } = await supabase.from(table).delete().in('id', [...c.deletes]);
      if (error) throw new Error(`${table} delete: ${error.message}`);
    }
    await db.outbox.bulkDelete(c.opIds);
  }
}

// ---------------------------------------------------------------------------
// Pull
// ---------------------------------------------------------------------------

/** Fetch rows newer than the cursor and merge them locally (LWW). */
export async function pullAll(userId?: string): Promise<void> {
  if (!supabase) return;
  const uid = userId ?? (await resolveUserId());
  if (!uid) return;

  const since = await getSetting<number>(LAST_PULLED_KEY, 0);
  let cursor = since;

  for (const table of SYNC_TABLES) {
    const t = db.table(table) as unknown as EntityTable<LocalRow, 'id'>;
    let from = 0;
    for (;;) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', uid)
        .gt('updated_at', since)
        .order('updated_at', { ascending: true })
        .order('id', { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) throw new Error(`${table} pull: ${error.message}`);
      const rows = (data ?? []) as RemoteRow[];
      if (!rows.length) break;

      await db.transaction('rw', t, async () => {
        for (const remote of rows) {
          const local = await t.get(remote.id);
          if (!local || remote.updated_at > local.updatedAt) {
            await t.put(toLocal(table, remote));
          }
          if (remote.updated_at > cursor) cursor = remote.updated_at;
        }
      });

      if (rows.length < PAGE) break;
      from += PAGE;
    }
  }

  if (cursor !== since) await setSetting(LAST_PULLED_KEY, cursor);
}

/** Force the next pull to re-read everything (e.g. after a different user signs in). */
export async function resetPullCursor(): Promise<void> {
  await setSetting(LAST_PULLED_KEY, 0);
}

export type { OutboxOp };
