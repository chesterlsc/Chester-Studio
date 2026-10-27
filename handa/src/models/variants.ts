import type { ItemShape } from '@/domain/types';

/**
 * "Stored properly" sprite / model variants, keyed by the suffix used in file
 * names (`<itemId>--6.webp`). Kept three-free so the sprite helper stays light.
 */
export type Variant = '' | '6' | '3';

export function variantFor(shape: ItemShape, qty = 1): Variant {
  if (shape === 'bottle' && qty >= 6) return '6';   // shrink-wrapped six-pack on a tray
  if (shape === 'can' && qty >= 3) return '3';      // row of three cans, labels out
  return '';
}
