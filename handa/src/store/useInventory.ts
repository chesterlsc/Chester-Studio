import { useLiveQuery } from 'dexie-react-hooks';
import { CATEGORY_SLOT, type CatalogItem, type Household, type InventoryRow } from '@/domain/types';
import { catalogById } from '@/domain/catalog';
import { KITS } from '@/domain/kits';
import { db, uid, upsert, upsertMany, remove } from './db';

const EMPTY_ROWS: InventoryRow[] = [];
export function useInventory(householdId: string | null): InventoryRow[] {
  const rows = useLiveQuery<InventoryRow[]>(
    async () => (householdId ? db.inventory.where('householdId').equals(householdId).toArray() : []),
    [householdId],
  );
  return rows ?? EMPTY_ROWS;
}

export function useHousehold(householdId: string | null) {
  return useLiveQuery<Household | undefined>(async () => (householdId ? db.households.get(householdId) : undefined), [householdId]);
}

/** Add `qty` of an item. Merges into the existing row for that catalog item. */
export async function addItem(householdId: string, item: CatalogItem, qty = item.step ?? 1): Promise<InventoryRow> {
  const now = Date.now();
  const existing = await db.inventory.where({ householdId, catalogId: item.id }).first();
  if (existing) {
    return upsert('inventory', { ...existing, qty: existing.qty + qty, updatedAt: now });
  }
  const row: InventoryRow = {
    id: uid(), householdId, catalogId: item.id, qty, unit: item.unit,
    slot: CATEGORY_SLOT[item.category],
    expiresAt: item.shelfLifeDays ? now + item.shelfLifeDays * 86400000 : undefined,
    createdAt: now, updatedAt: now,
  };
  return upsert('inventory', row);
}

export async function setQty(row: InventoryRow, qty: number): Promise<void> {
  if (qty <= 0) return remove('inventory', row.id);
  await upsert('inventory', { ...row, qty, updatedAt: Date.now() });
}

export async function setExpiry(row: InventoryRow, expiresAt: number | undefined): Promise<void> {
  await upsert('inventory', { ...row, expiresAt, updatedAt: Date.now() });
}

export async function removeItem(row: InventoryRow): Promise<void> {
  await remove('inventory', row.id);
}

/** Add many items in one transaction. Merges into existing rows. Returns units added. */
export async function addItems(householdId: string, list: Array<{ item: CatalogItem; qty: number }>): Promise<number> {
  const now = Date.now();
  const existing = await db.inventory.where('householdId').equals(householdId).toArray();
  const byCatalog = new Map(existing.map((r) => [r.catalogId, r]));
  const rows: InventoryRow[] = [];
  let added = 0;
  for (const { item, qty } of list) {
    const prev = byCatalog.get(item.id);
    const row: InventoryRow = prev
      ? { ...prev, qty: prev.qty + qty, updatedAt: now }
      : { id: uid(), householdId, catalogId: item.id, qty, unit: item.unit, slot: CATEGORY_SLOT[item.category], expiresAt: item.shelfLifeDays ? now + item.shelfLifeDays * 86400000 : undefined, createdAt: now + rows.length, updatedAt: now };
    byCatalog.set(item.id, row);
    rows.push(row);
    added += qty;
  }
  await upsertMany('inventory', rows);
  return added;
}

export async function applyKit(householdId: string, kitId: string, headcount: number): Promise<number> {
  const kit = KITS.find((k) => k.id === kitId);
  if (!kit) return 0;
  const list = kit.items.flatMap((k) => { const item = catalogById(k.id); return item ? [{ item, qty: k.perPerson ? k.qty * Math.max(1, headcount) : k.qty }] : []; });
  return addItems(householdId, list);
}

export async function clearHouseholdInventory(householdId: string): Promise<void> {
  const rows = await db.inventory.where('householdId').equals(householdId).toArray();
  for (const r of rows) await remove('inventory', r.id);
}
