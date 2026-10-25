/**
 * Data portability + the big red button.
 *
 *   exportAllLocal()   -> Blob (application/json) of every local table
 *   exportCloud()      -> the caller's cloud rows via export_my_data() (or null)
 *   deleteEverything() -> wipe cloud rows (delete_my_data), clear every local
 *                         table + settings, sign out. Throws if the cloud
 *                         delete fails so the UI can ask the user to go online.
 */
import { db } from '@/store/db';
import { supabase } from './supabase';
import { stopSync } from './outbox';

export interface LocalExport {
  app: 'handa';
  version: 1;
  exportedAt: number;
  households: unknown[];
  runs: unknown[];
  inventory: unknown[];
  scores: unknown[];
  surveys: unknown[];
  settings: unknown[];
}

export async function exportAllLocal(): Promise<Blob> {
  const [households, runs, inventory, scores, surveys, settings] = await Promise.all([
    db.households.toArray(),
    db.runs.toArray(),
    db.inventory.toArray(),
    db.scores.toArray(),
    db.surveys.toArray(),
    db.settings.toArray(),
  ]);
  const payload: LocalExport = {
    app: 'handa',
    version: 1,
    exportedAt: Date.now(),
    households, runs, inventory, scores, surveys, settings,
  };
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
}

/** Everything the cloud holds for the signed-in user, or null in guest mode / signed out. */
export async function exportCloud(): Promise<unknown | null> {
  if (!supabase) return null;
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  const { data, error } = await supabase.rpc('export_my_data');
  if (error) throw new Error(`export_my_data: ${error.message}`);
  return data;
}

/** Suggested filename for a download, e.g. handa-export-2026-10-25.json */
export function exportFilename(prefix = 'handa-export'): string {
  return `${prefix}-${new Date().toISOString().slice(0, 10)}.json`;
}

export async function deleteEverything(): Promise<void> {
  // 1. Stop sync first so nothing is re-uploaded while we wipe.
  stopSync();

  // 2. Cloud rows (only when signed in). Failure here aborts: deleting the
  //    local copy while the cloud still has data would mislead the user.
  let signedIn = false;
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    signedIn = !!data.session;
    if (signedIn) {
      const { error } = await supabase.rpc('delete_my_data');
      if (error) throw new Error(`delete_my_data: ${error.message}`);
    }
  }

  // 3. Every local table, including the outbox and settings (sync cursors,
  //    migration marker, consent...).
  await db.transaction(
    'rw',
    [db.households, db.runs, db.inventory, db.scores, db.surveys, db.settings, db.outbox],
    async () => {
      await Promise.all([
        db.households.clear(),
        db.runs.clear(),
        db.inventory.clear(),
        db.scores.clear(),
        db.surveys.clear(),
        db.settings.clear(),
        db.outbox.clear(),
      ]);
    },
  );

  // 4. Sign out. useAuth's listener flips the UI back to guest.
  if (supabase && signedIn) {
    const { error } = await supabase.auth.signOut();
    if (error) console.warn('[handa/export] signOut after delete', error.message);
  }
}
