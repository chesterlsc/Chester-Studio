import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DurationId, Household, ScenarioId } from '@/domain/types';

/** The run being set up / played. Household draft lives here until START. */
interface Session {
  scenario: ScenarioId | null;
  duration: DurationId;
  householdId: string | null;
  draft: Pick<Household, 'adults' | 'kids' | 'babies' | 'seniors' | 'pets' | 'specialNeeds' | 'name'>;
  runId: string | null;
  setScenario: (s: ScenarioId) => void;
  setDuration: (d: DurationId) => void;
  setDraft: (patch: Partial<Session['draft']>) => void;
  /** Persist the household (create or update) and start a run. Returns runId. */
  start: () => Promise<string>;
  finish: (pct: number, days: number) => Promise<void>;
  reset: () => void;
}

export const useSession = create<Session>()(
  persist(
    (set, get) => ({
      scenario: null,
      duration: '1w',
      householdId: null,
      draft: { name: 'Home', adults: 2, kids: 1, babies: 0, seniors: 0, pets: 0, specialNeeds: [] },
      runId: null,
      setScenario: (scenario) => set({ scenario }),
      setDuration: (duration) => set({ duration }),
      setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      start: async () => {
        const { scenario, duration, draft } = get();
        if (!scenario) throw new Error('no scenario');
        const { db, uid, upsert } = await import('./db');
        const now = Date.now();
        let { householdId } = get();
        const existing = householdId ? await db.households.get(householdId) : undefined;
        const household: Household = existing
          ? { ...existing, ...draft, updatedAt: now }
          : { id: uid(), ...draft, createdAt: now, updatedAt: now };
        await upsert('households', household);
        householdId = household.id;
        const runId = uid();
        await upsert('runs', { id: runId, householdId, scenario, duration, startedAt: now, updatedAt: now });
        set({ householdId, runId });
        return runId;
      },
      finish: async (pct, days) => {
        const { runId } = get();
        if (!runId) return;
        const { db, upsert } = await import('./db');
        const run = await db.runs.get(runId);
        if (!run) return;
        const now = Date.now();
        await upsert('runs', { ...run, finishedAt: now, readinessPct: pct, daysCovered: days, updatedAt: now });
      },
      reset: () => set({ scenario: null, runId: null }),
    }),
    { name: 'handa.session' },
  ),
);
