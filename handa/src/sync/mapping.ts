/**
 * The ONE place that knows how local (camelCase, Dexie) rows map to remote
 * (snake_case, Postgres) rows. Keep the column lists in step with
 * supabase/schema.sql and src/domain/types.ts.
 *
 * Only top-level keys are renamed. Nested JSON (`specialNeeds`, `categories`,
 * `answers`) is user data / catalogue ids and is copied verbatim.
 */
import type { Household, InventoryRow, Run, Score, SurveyAnswer } from '@/domain/types';
import type { OutboxOp } from '@/store/db';

export type SyncTable = OutboxOp['table'];
export const SYNC_TABLES: readonly SyncTable[] = ['households', 'runs', 'inventory', 'scores', 'surveys'];

export type LocalRow = Household | Run | InventoryRow | Score | SurveyAnswer;
export type LocalRowOf<T extends SyncTable> =
  T extends 'households' ? Household :
  T extends 'runs' ? Run :
  T extends 'inventory' ? InventoryRow :
  T extends 'scores' ? Score :
  SurveyAnswer;

/** A row as PostgREST sends/receives it. */
export type RemoteRow = Record<string, unknown> & { id: string; user_id?: string; updated_at: number };

/**
 * Local (camelCase) keys that exist as columns remotely, per table. Anything
 * not listed is never sent (PostgREST rejects unknown columns with a 400).
 */
const COLUMNS: Record<SyncTable, readonly string[]> = {
  households: ['id', 'userId', 'name', 'adults', 'kids', 'babies', 'seniors', 'pets', 'specialNeeds', 'region', 'city', 'createdAt', 'updatedAt'],
  runs: ['id', 'userId', 'householdId', 'scenario', 'duration', 'startedAt', 'finishedAt', 'readinessPct', 'daysCovered', 'updatedAt'],
  inventory: ['id', 'userId', 'householdId', 'catalogId', 'qty', 'unit', 'expiresAt', 'slot', 'note', 'createdAt', 'updatedAt'],
  scores: ['id', 'userId', 'runId', 'householdId', 'scenario', 'duration', 'pct', 'daysCovered', 'categories', 'at', 'updatedAt'],
  surveys: ['id', 'userId', 'answers', 'at', 'updatedAt'],
};

export function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}
export function snakeToCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Local -> remote. Every listed column is present (missing optional values
 * become `null`) so a batch upsert has a uniform key set, which PostgREST
 * requires. `user_id` falls back to the given user so pre-sign-in rows upload
 * under the right owner.
 */
export function toRemote(table: SyncTable, row: LocalRow, userId?: string): RemoteRow {
  const src = row as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of COLUMNS[table]) {
    const v = src[key];
    out[camelToSnake(key)] = v === undefined ? null : v;
  }
  if (out.user_id == null && userId) out.user_id = userId;
  return out as RemoteRow;
}

/**
 * Remote -> local. Nulls are dropped so optional fields come back as
 * `undefined`, exactly as the domain types expect. `user_id` stays as `userId`.
 */
export function toLocal<T extends SyncTable>(table: T, row: RemoteRow): LocalRowOf<T> {
  const allowed = new Set(COLUMNS[table]);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === null || v === undefined) continue;
    const key = snakeToCamel(k);
    if (allowed.has(key)) out[key] = v;
  }
  // Defensive defaults for array/object columns.
  if (table === 'households' && !Array.isArray(out.specialNeeds)) out.specialNeeds = [];
  if (table === 'scores' && typeof out.categories !== 'object') out.categories = {};
  if (table === 'surveys' && typeof out.answers !== 'object') out.answers = {};
  return out as unknown as LocalRowOf<T>;
}
