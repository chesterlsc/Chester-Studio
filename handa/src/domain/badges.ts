import type { Score } from './types';
import type { IconName } from '@/design/icons/names';

export interface Badge { id: string; icon: IconName }
export const BADGES: Badge[] = [
  { id: 'first-run', icon: 'flag' },
  { id: 'ready-80', icon: 'medal' },
  { id: 'all-cats', icon: 'house-cut' },
  { id: 'week', icon: 'calendar' },
  { id: 'three-scen', icon: 'map' },
  { id: 'streak-3', icon: 'streak' },
  { id: 'zombie', icon: 'zombie' },
];

export function earnedBadges(scores: Score[], streakDays: number): Set<string> {
  const e = new Set<string>();
  if (scores.length) e.add('first-run');
  if (scores.some((s) => s.pct >= 80)) e.add('ready-80');
  if (scores.some((s) => Object.values(s.categories).every((v) => (v ?? 0) >= 0.99) && Object.keys(s.categories).length >= 8)) e.add('all-cats');
  if (scores.some((s) => s.daysCovered >= 7)) e.add('week');
  if (new Set(scores.map((s) => s.scenario)).size >= 3) e.add('three-scen');
  if (streakDays >= 3) e.add('streak-3');
  if (scores.some((s) => s.scenario === 'zombie' && s.pct >= 50)) e.add('zombie');
  return e;
}
