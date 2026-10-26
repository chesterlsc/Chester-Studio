import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Game layer: XP, levels, facts seen, missions done. Device-local (fun, not safety). */
export const LEVELS = [0, 120, 320, 650, 1100, 1700, 2500, 3600, 5000, 7000];
export function levelFor(xp: number): { level: number; next: number; prev: number; pct: number } {
  let level = 1;
  for (let i = 1; i < LEVELS.length; i++) if (xp >= LEVELS[i]) level = i + 1;
  const prev = LEVELS[level - 1] ?? 0; const next = LEVELS[level] ?? prev + 2000;
  return { level, next, prev, pct: Math.min(1, (xp - prev) / Math.max(1, next - prev)) };
}

interface Progress {
  xp: number;
  factsSeen: Record<string, number>;      // key → timestamp
  missionsDone: Record<string, number>;   // missionId → timestamp
  roomsVisited: Record<string, number>;
  tipsSeen: Record<string, number>;       // catalogId → timestamp
  addXp: (n: number) => void;
  seeFact: (key: string) => void;
  seeTip: (id: string) => void;
  visitRoom: (id: string) => void;
  completeMission: (id: string) => void;
}
export const useProgress = create<Progress>()(persist((set) => ({
  xp: 0, factsSeen: {}, missionsDone: {}, roomsVisited: {}, tipsSeen: {},
  addXp: (n) => set((s) => ({ xp: s.xp + n })),
  seeFact: (key) => set((s) => ({ factsSeen: { ...s.factsSeen, [key]: Date.now() } })),
  seeTip: (id) => set((s) => ({ tipsSeen: { ...s.tipsSeen, [id]: Date.now() } })),
  visitRoom: (id) => set((s) => ({ roomsVisited: { ...s.roomsVisited, [id]: Date.now() } })),
  completeMission: (id) => set((s) => ({ missionsDone: { ...s.missionsDone, [id]: Date.now() } })),
}), { name: 'handa.progress' }));
