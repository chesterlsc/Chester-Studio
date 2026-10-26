import type { CategoryId, DurationId, Household, InventoryRow, Readiness, ScenarioId } from '@/domain/types';
import { CATEGORY_ROOM, roomCategories, type RoomId } from '@/domain/rooms';
import { CATALOG } from '@/domain/catalog';
import type { CatalogItem } from '@/domain/types';
import { nextSuggestion, targetQty } from '@/domain/readiness';
import { SCENARIOS } from '@/domain/scenarios';

/** A mission is one concrete, checkable goal inside a room. */
export interface Mission {
  id: string;
  room: RoomId;
  category: CategoryId;
  kind: 'stock' | 'complete-category' | 'complete-room';
  item?: CatalogItem;
  need: number;
  have: number;
  xp: number;
  done: boolean;
}

export function missionsFor(h: Household, scenario: ScenarioId, duration: DurationId, inventory: InventoryRow[], readiness: Readiness): Mission[] {
  const profile = SCENARIOS[scenario];
  const qty = new Map<string, number>();
  for (const r of inventory) qty.set(r.catalogId, (qty.get(r.catalogId) ?? 0) + r.qty);
  const out: Mission[] = [];
  const relevant = (c: CategoryId) => readiness.categories[c]?.relevant;
  for (const cat of Object.keys(CATEGORY_ROOM) as CategoryId[]) {
    if (!relevant(cat)) continue;
    const room = CATEGORY_ROOM[cat];
    const pct = readiness.categories[cat].pct;
    // category completion
    out.push({ id: `cat:${scenario}:${cat}`, room, category: cat, kind: 'complete-category', need: 100, have: Math.round(pct * 100), xp: 60 + Math.round((profile.weights[cat] ?? 1) * 20), done: pct >= .99 });
    // the single best item to stock in this category
    const item = nextSuggestion(cat, h, scenario, duration, inventory);
    if (item) {
      const need = targetQty(item, h, scenario, duration); const have = Math.min(need, qty.get(item.id) ?? 0);
      out.push({ id: `item:${scenario}:${item.id}`, room, category: cat, kind: 'stock', item, need, have, xp: 25, done: have >= need });
    }
  }
  // room completion
  for (const room of new Set(out.map((m) => m.room))) {
    const cats = roomCategories(room).filter(relevant);
    const pct = cats.length ? cats.reduce((n, c) => n + readiness.categories[c].pct, 0) / cats.length : 1;
    out.push({ id: `room:${scenario}:${room}`, room, category: cats[0], kind: 'complete-room', need: 100, have: Math.round(pct * 100), xp: 150, done: pct >= .99 });
  }
  return out;
}

export function roomMissions(all: Mission[], room: RoomId): Mission[] {
  return all.filter((m) => m.room === room).sort((a, b) => Number(a.done) - Number(b.done) || (a.kind === 'stock' ? -1 : 1));
}

/** Items a room can hold for this household. */
export function roomItems(room: RoomId, h: Household, readiness: Readiness): CatalogItem[] {
  const cats = roomCategories(room).filter((c) => readiness.categories[c]?.relevant);
  return CATALOG.filter((i) => cats.includes(i.category) && (!i.requires?.length || i.requires.some((k) => (h[k] ?? 0) > 0)));
}
