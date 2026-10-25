import Dexie, { type EntityTable } from 'dexie';
import type { Household, InventoryRow, Run, Score, SurveyAnswer } from '@/domain/types';
import { cloudEnabled } from '@/sync/supabase';

export interface OutboxOp {
  id?: number;
  table: 'households' | 'runs' | 'inventory' | 'scores' | 'surveys';
  op: 'upsert' | 'delete';
  rowId: string;
  payload?: unknown;
  at: number;
}
export interface Setting { key: string; value: unknown }

/** Local-first database. This is the source of truth on the device. */
export class HandaDB extends Dexie {
  households!: EntityTable<Household, 'id'>;
  runs!: EntityTable<Run, 'id'>;
  inventory!: EntityTable<InventoryRow, 'id'>;
  scores!: EntityTable<Score, 'id'>;
  surveys!: EntityTable<SurveyAnswer, 'id'>;
  settings!: EntityTable<Setting, 'key'>;
  outbox!: EntityTable<OutboxOp, 'id'>;

  constructor() {
    super('handa');
    this.version(1).stores({
      households: 'id, updatedAt, userId',
      runs: 'id, householdId, scenario, startedAt, updatedAt, userId',
      inventory: 'id, householdId, catalogId, [householdId+catalogId], slot, expiresAt, updatedAt, userId',
      scores: 'id, runId, householdId, at, updatedAt, userId',
      surveys: 'id, at, updatedAt, userId',
      settings: 'key',
      outbox: '++id, at, table',
    });
  }
}

export const db = new HandaDB();

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Write locally and queue for sync. Every mutation goes through here. */
export async function upsert<T extends { id: string; updatedAt: number }>(
  table: OutboxOp['table'],
  row: T,
): Promise<T> {
  const t = db.table(table) as EntityTable<T, 'id'>;
  if (!cloudEnabled) { await t.put(row); return row; }
  await db.transaction('rw', t, db.outbox, async () => {
    await t.put(row);
    await db.outbox.add({ table, op: 'upsert', rowId: row.id, payload: row, at: Date.now() });
  });
  return row;
}
export async function remove(table: OutboxOp['table'], id: string): Promise<void> {
  if (!cloudEnabled) { await db.table(table).delete(id); return; }
  await db.transaction('rw', db.table(table), db.outbox, async () => {
    await db.table(table).delete(id);
    await db.outbox.add({ table, op: 'delete', rowId: id, at: Date.now() });
  });
}

/** Bulk upsert in one transaction (kits, demo data). */
export async function upsertMany<T extends { id: string; updatedAt: number }>(table: OutboxOp['table'], rows: T[]): Promise<void> {
  if (!rows.length) return;
  const t = db.table(table) as EntityTable<T, 'id'>;
  await db.transaction('rw', t, db.outbox, async () => {
    await t.bulkPut(rows);
    if (cloudEnabled) await db.outbox.bulkAdd(rows.map((row) => ({ table, op: 'upsert' as const, rowId: row.id, payload: row, at: Date.now() })));
  });
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const r = await db.settings.get(key);
  return (r?.value as T) ?? fallback;
}
export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}
