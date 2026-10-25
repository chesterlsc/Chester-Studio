import { CATEGORIES, DURATION_DAYS, type CategoryId, type DurationId, type Household, type InventoryRow, type ScenarioId } from '@/domain/types';
import { SCENARIOS } from '@/domain/scenarios';
import { CATALOG } from '@/domain/catalog';
import { neededPersonDays, neededQty } from '@/domain/readiness';

/**
 * Day-by-day burn-down for a scenario: how much of each consumable category
 * remains after each day, and when it runs out. Checklist categories (tools,
 * documents…) are flat lines at their coverage. This is what "Simulate" shows.
 */
export interface SimSeries { category: CategoryId; color?: string; days: number[]; runsOutDay: number | null; coverage: number; consumable: boolean }
export interface SimEvent { day: number; category: CategoryId; kind: 'out' | 'low' }
export interface Simulation { days: number; series: SimSeries[]; events: SimEvent[]; survivesTo: number }

export function simulate(h: Household, scenario: ScenarioId, duration: DurationId, inventory: InventoryRow[]): Simulation {
  const days = DURATION_DAYS[duration];
  const qty = new Map<string, number>();
  for (const r of inventory) qty.set(r.catalogId, (qty.get(r.catalogId) ?? 0) + r.qty);
  const profile = SCENARIOS[scenario];
  const series: SimSeries[] = [];
  const events: SimEvent[] = [];
  let survivesTo = days;
  const members = (req?: Array<'babies' | 'kids' | 'seniors' | 'pets'>) => !req?.length || req.some((k) => (h[k] ?? 0) > 0);

  for (const cat of CATEGORIES) {
    if (!(profile.weights[cat] ?? 0)) continue;
    const items = CATALOG.filter((i) => i.category === cat && members(i.requires));
    if (!items.length) continue;
    const cov = items.filter((i) => i.personDaysPerUnit);
    if (cov.length) {
      const need = neededPersonDays(cat, h, scenario, duration);
      if (need <= 0) continue;
      const perDay = need / days;
      const have = cov.reduce((n, i) => n + (qty.get(i.id) ?? 0) * (i.personDaysPerUnit ?? 0), 0);
      const pts: number[] = [];
      let out: number | null = null;
      for (let d = 0; d <= days; d++) {
        const left = Math.max(0, have - perDay * d);
        pts.push(need ? Math.min(1.5, left / need) : 0);
        if (out === null && left <= 0 && d > 0) out = d;
      }
      if (out !== null) { events.push({ day: out, category: cat, kind: 'out' }); if (profile.critical.includes(cat)) survivesTo = Math.min(survivesTo, out - 1); }
      else if (have / need < .35) events.push({ day: Math.floor(days * .5), category: cat, kind: 'low' });
      series.push({ category: cat, days: pts, runsOutDay: out, coverage: Math.min(1, have / need), consumable: true });
    } else {
      let acc = 0, ws = 0;
      for (const i of items) { const n = neededQty(i, h, duration); const w = i.scenarioWeight?.[scenario] ?? 1; acc += Math.min(1, (qty.get(i.id) ?? 0) / n) * w; ws += w; }
      const c = ws ? acc / ws : 0;
      series.push({ category: cat, days: Array.from({ length: days + 1 }, () => c), runsOutDay: null, coverage: c, consumable: false });
      if (c < .35 && profile.critical.includes(cat)) events.push({ day: 1, category: cat, kind: 'low' });
    }
  }
  events.sort((a, b) => a.day - b.day);
  return { days, series, events, survivesTo: Math.max(0, survivesTo) };
}

/** Compact day labels for the x axis: every day up to 7, then sensible steps. */
export function dayTicks(days: number): number[] {
  if (days <= 7) return Array.from({ length: days + 1 }, (_, i) => i);
  if (days <= 30) return [0, 5, 10, 15, 20, 25, 30].filter((d) => d <= days);
  return [0, 30, 60, 90, 120, 180, 240, 300, 365].filter((d) => d <= days);
}
