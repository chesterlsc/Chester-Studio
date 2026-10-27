import { CATALOG } from '@/domain/catalog';
import { SPRITES, type SpriteEntry } from './manifest';
import { variantFor } from './variants';

/**
 * Pick the pre-rendered sprite for a catalog item at a given quantity.
 * Returns the `--6` (six-pack) / `--3` (can row) variant when the quantity
 * qualifies, the plain sprite otherwise, or undefined when nothing was rendered
 * for that id (run `pnpm models`). Pure lookup, no three.js in the bundle.
 */
export function spriteFor(itemId: string, qty = 1): SpriteEntry | undefined {
  const item = CATALOG.find((i) => i.id === itemId);
  if (!item) return SPRITES[itemId];
  const v = variantFor(item.shape, qty);
  return (v && SPRITES[`${itemId}--${v}`]) || SPRITES[itemId];
}

/** Absolute URL for a sprite entry, correct under any Vite `base` (hash router builds too). */
export function spriteUrl(entry: SpriteEntry): string {
  return `${import.meta.env.BASE_URL}${entry.src}`;
}

/**
 * CSS-ready placement for a sprite whose contact point should sit on `shelfY`
 * (px) inside a slot `slotW` px wide: returns the rendered width/height and the
 * top offset so that the object's base lands exactly on the shelf line.
 */
export function placeSprite(entry: SpriteEntry, slotW: number, shelfY: number) {
  const w = slotW, h = (entry.h / entry.w) * slotW;
  return { w, h, top: shelfY - h * entry.base };
}

export type { SpriteEntry };
