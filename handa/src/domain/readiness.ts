import { CATEGORIES, DURATION_DAYS } from './types';
import type { CatalogItem, CategoryId, DurationId, Household, InventoryRow, Readiness, ScenarioId } from './types';
import { SCENARIOS } from './scenarios';
import { CATALOG, catalogById } from './catalog';

/** Water baseline the catalog's personDaysPerUnit is expressed against (L per person per day). */
export const BASE_WATER_LPD = 4;

/** Equivalent "people" for consumption math. */
export function peopleEq(h: Pick<Household, 'adults' | 'kids' | 'babies' | 'seniors' | 'pets'>): number {
  return h.adults * 1 + h.kids * 0.8 + h.babies * 0.6 + h.seniors * 1 + h.pets * 0.3;
}
export function headcount(h: Pick<Household, 'adults' | 'kids' | 'babies' | 'seniors'>): number {
  return h.adults + h.kids + h.babies + h.seniors;
}

function itemRelevant(item: CatalogItem, h: Household): boolean {
  if (!item.requires?.length) return true;
  return item.requires.some((r) => (h[r] ?? 0) > 0);
}

function categoryNeedFactor(cat: CategoryId, scenario: ScenarioId): number {
  const s = SCENARIOS[scenario];
  if (cat === 'water') return s.waterLpd / BASE_WATER_LPD;
  if (cat === 'food') return s.foodFactor;
  return 1;
}

/** How many units of a checklist item this household needs for this run. */
export function neededQty(item: CatalogItem, h: Household, duration: DurationId): number {
  const days = DURATION_DAYS[duration];
  const people = headcount(h);
  let base = 0;
  if (item.neededPerHousehold) base += item.neededPerHousehold;
  if (item.neededPerPerson) {
    // per-person items only count the members they are for
    const members = item.requires?.length
      ? item.requires.reduce((n, r) => n + (h[r] ?? 0), 0)
      : people;
    base += item.neededPerPerson * members;
  }
  if (item.perDays) base = base * Math.max(1, Math.ceil(days / item.perDays));
  return Math.max(1, Math.round(base));
}

/** Person-days a category needs for this run (coverage items only). */
export function neededPersonDays(cat: CategoryId, h: Household, scenario: ScenarioId, duration: DurationId): number {
  const days = DURATION_DAYS[duration];
  const factor = categoryNeedFactor(cat, scenario);
  if (cat === 'pets') return h.pets * days;
  if (cat === 'baby') return h.babies * days;
  return peopleEq(h) * days * factor;
}

export function computeReadiness(
  h: Household,
  scenario: ScenarioId,
  duration: DurationId,
  inventory: InventoryRow[],
): Readiness {
  const profile = SCENARIOS[scenario];
  const qtyByCatalog = new Map<string, number>();
  for (const row of inventory) qtyByCatalog.set(row.catalogId, (qtyByCatalog.get(row.catalogId) ?? 0) + row.qty);

  const categories = {} as Readiness['categories'];
  let wSum = 0;
  let wAcc = 0;
  const missing: CategoryId[] = [];
  let daysCovered = Infinity;

  for (const cat of CATEGORIES) {
    const weight = profile.weights[cat] ?? 0;
    const items = CATALOG.filter((i) => i.category === cat && itemRelevant(i, h));
    const relevant = weight > 0 && items.length > 0;
    if (!relevant) {
      categories[cat] = { pct: 0, have: 0, need: 0, relevant: false };
      continue;
    }
    // coverage part
    const covItems = items.filter((i) => i.personDaysPerUnit);
    let covPct: number | null = null;
    let have = 0;
    let need = 0;
    if (covItems.length) {
      need = neededPersonDays(cat, h, scenario, duration);
      have = covItems.reduce((n, i) => n + (qtyByCatalog.get(i.id) ?? 0) * (i.personDaysPerUnit ?? 0), 0);
      covPct = need > 0 ? Math.min(1, have / need) : 1;
      if (profile.critical.includes(cat) && need > 0) {
        const perDay = need / DURATION_DAYS[duration];
        daysCovered = Math.min(daysCovered, have / Math.max(perDay, 1e-6));
      }
    }
    // checklist part
    const checkItems = items.filter((i) => !i.personDaysPerUnit);
    let checkPct: number | null = null;
    if (checkItems.length) {
      let acc = 0;
      let ws = 0;
      for (const i of checkItems) {
        const w = i.scenarioWeight?.[scenario] ?? 1;
        const n = neededQty(i, h, duration);
        const q = qtyByCatalog.get(i.id) ?? 0;
        acc += Math.min(1, q / n) * w;
        ws += w;
      }
      checkPct = ws > 0 ? acc / ws : 0;
    }
    let pct = 0;
    if (covPct !== null && checkPct !== null) pct = covPct * 0.65 + checkPct * 0.35;
    else pct = covPct ?? checkPct ?? 0;
    categories[cat] = { pct, have, need, relevant: true };
    wSum += weight;
    wAcc += weight * pct;
    if (pct < 0.5) missing.push(cat);
  }

  const pct = wSum > 0 ? Math.round((wAcc / wSum) * 100) : 0;
  if (!Number.isFinite(daysCovered)) daysCovered = 0;
  missing.sort((a, b) => (profile.weights[b] ?? 0) - (profile.weights[a] ?? 0));
  return { pct, daysCovered: Math.min(999, Math.floor(daysCovered * 10) / 10), categories, missing };
}

/** The item a tray should suggest next for a category: the biggest gap. */
export function nextSuggestion(cat: CategoryId, h: Household, scenario: ScenarioId, duration: DurationId, inventory: InventoryRow[]): CatalogItem | undefined {
  const qty = new Map<string, number>();
  for (const r of inventory) qty.set(r.catalogId, (qty.get(r.catalogId) ?? 0) + r.qty);
  const items = CATALOG.filter((i) => i.category === cat && itemRelevant(i, h));
  let best: CatalogItem | undefined;
  let bestGap = 0;
  for (const i of items) {
    const n = i.personDaysPerUnit ? Math.ceil(neededPersonDays(cat, h, scenario, duration) / i.personDaysPerUnit) : neededQty(i, h, duration);
    const gap = 1 - Math.min(1, (qty.get(i.id) ?? 0) / Math.max(1, n));
    const w = gap * (i.scenarioWeight?.[scenario] ?? 1);
    if (w > bestGap) { bestGap = w; best = i; }
  }
  return best;
}

export function targetQty(item: CatalogItem, h: Household, scenario: ScenarioId, duration: DurationId): number {
  if (item.personDaysPerUnit) return Math.ceil(neededPersonDays(item.category, h, scenario, duration) / item.personDaysPerUnit);
  return neededQty(item, h, duration);
}

export { catalogById };
