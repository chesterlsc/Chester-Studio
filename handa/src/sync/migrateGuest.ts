/**
 * Guest -> account migration.
 *
 * Everything a guest did lives in Dexie without a `userId`. When they sign in
 * for the first time on this device we tag those rows with their id and queue
 * one `upsert` outbox op per row so startSync() uploads them.
 *
 * Rules:
 *   * Never deletes local data. The local copy stays the source of truth.
 *   * Writes with `db.table.put` directly (NOT `upsert()`) so each row gets
 *     exactly one outbox op instead of two.
 *   * Idempotent: rows that already carry a userId are skipped, so calling it
 *     twice (or after a crash midway) is safe.
 *   * Rows owned by a *different* userId (someone else signed in on this device
 *     earlier) are left untouched — they are not ours to re-tag.
 */
import type { EntityTable } from 'dexie';
import { db } from '@/store/db';
import { SYNC_TABLES, type SyncTable } from './mapping';

type Taggable = { id: string; updatedAt: number; userId?: string };

export interface MigrationResult {
  /** Rows tagged and queued, per table. */
  migrated: Record<SyncTable, number>;
  total: number;
}

export async function migrateGuestData(userId: string): Promise<MigrationResult> {
  const migrated = { households: 0, runs: 0, inventory: 0, scores: 0, surveys: 0 } as Record<SyncTable, number>;
  if (!userId) return { migrated, total: 0 };

  const tables = SYNC_TABLES.map((t) => db.table(t));
  await db.transaction('rw', [...tables, db.outbox], async () => {
    const now = Date.now();

    // Guest-era upsert ops (payload without a userId) are superseded by the
    // full snapshot we queue below; drop them so nothing uploads twice.
    // Delete ops are kept: replaying a delete for a never-uploaded id is a no-op.
    const stale = await db.outbox
      .filter((op) => op.op === 'upsert' && !(op.payload as Taggable | undefined)?.userId)
      .primaryKeys();
    if (stale.length) await db.outbox.bulkDelete(stale);

    for (const table of SYNC_TABLES) {
      const t = db.table(table) as unknown as EntityTable<Taggable, 'id'>;
      const rows = await t.filter((r) => !r.userId).toArray();
      if (!rows.length) continue;

      const tagged = rows.map((r) => ({ ...r, userId }));
      await t.bulkPut(tagged);
      await db.outbox.bulkAdd(
        tagged.map((row) => ({ table, op: 'upsert' as const, rowId: row.id, payload: row, at: now })),
      );
      migrated[table] = tagged.length;
    }
  });

  const total = Object.values(migrated).reduce((a, b) => a + b, 0);
  return { migrated, total };
}
