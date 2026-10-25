import { describe, expect, it } from 'vitest';
import { computeReadiness, neededQty, peopleEq, targetQty } from '@/domain/readiness';
import { catalogById, CATALOG } from '@/domain/catalog';
import { KITS } from '@/domain/kits';
import type { Household, InventoryRow } from '@/domain/types';

const h: Household = { id: 'h', name: 'Home', adults: 2, kids: 1, babies: 0, seniors: 0, pets: 0, specialNeeds: [], createdAt: 0, updatedAt: 0 };
const row = (catalogId: string, qty: number): InventoryRow => ({ id: catalogId, householdId: 'h', catalogId, qty, unit: 'pc', slot: 'pantry', createdAt: 0, updatedAt: 0 });

describe('readiness math', () => {
  it('starts at zero and never exceeds 100', () => {
    expect(computeReadiness(h, 'typhoon', '1w', []).pct).toBe(0);
    const everything = CATALOG.map((i) => row(i.id, 9999));
    const r = computeReadiness(h, 'typhoon', '1y', everything);
    expect(r.pct).toBe(100);
    expect(r.missing).toHaveLength(0);
  });
  it('water need scales with people, days and scenario', () => {
    const base = targetQty(catalogById('water-bottle-1l')!, h, 'typhoon', '1d');
    expect(base).toBe(Math.ceil(peopleEq(h) * 1 * 4)); // 4 L/person/day → 1 L bottles
    expect(targetQty(catalogById('water-bottle-1l')!, h, 'typhoon', '1w')).toBe(Math.ceil(peopleEq(h) * 7 * 4));
    expect(targetQty(catalogById('water-bottle-1l')!, h, 'heat', '1d')).toBeGreaterThan(base); // heat raises water
  });
  it('days covered reflects the weakest critical category', () => {
    const r = computeReadiness(h, 'typhoon', '1w', [row('water-drum', 1), row('rice-kg', 20), row('flashlight', 2), row('batteries', 2), row('powerbank', 1), row('solar-panel', 1), row('rechargeable-fan', 1), row('extension-cord', 1)]);
    expect(r.daysCovered).toBeGreaterThan(5);
    expect(r.daysCovered).toBeLessThanOrEqual(999);
  });
  it('baby and pet categories are irrelevant without babies or pets', () => {
    const r = computeReadiness({ ...h, kids: 0 }, 'flood', '1w', []);
    expect(r.categories.baby.relevant).toBe(false);
    expect(computeReadiness(h, 'flood', '1w', []).categories.baby.relevant).toBe(true); // kids count too
    expect(r.categories.pets.relevant).toBe(false);
    const withBaby = computeReadiness({ ...h, babies: 1 }, 'flood', '1w', []);
    expect(withBaby.categories.baby.relevant).toBe(true);
  });
  it('consumables scale with duration', () => {
    const tissue = catalogById('tissue')!;
    expect(neededQty(tissue, h, '1m')).toBeGreaterThan(neededQty(tissue, h, '1w'));
  });
  it('every kit item exists in the catalog', () => {
    for (const k of KITS) for (const i of k.items) expect(catalogById(i.id), `${k.id}:${i.id}`).toBeDefined();
  });
});
