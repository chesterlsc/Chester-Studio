import type { RoomId } from '@/domain/rooms';
import type { IconName } from '@/design/icons/names';
import type { L } from './types';

/** One storage rule shown in a room's "Store it right" sheet. */
export interface StorageRule {
  icon: IconName;
  title: L;    // ≤ 6 words
  body: L;     // 1–2 short sentences, factual
}

export interface RoomStorageGuide {
  room: RoomId;
  /** One line: what this room is for, in plain words. */
  purpose: L;
  /** The climate rule in one sentence (e.g. "Cool, dry, dark, off the floor."). */
  climate: L;
  rules: StorageRule[];        // 4–6
  never: L[];                  // 2–4 "never do this" lines
  /** Rotation / check cadence, e.g. "Check expiry every 3 months." */
  cadence: L;
  sources: Array<{ label: string; url: string }>;
}

/** Per-item storage tip (catalogId → tip). Short and specific. */
export type ItemStoreTips = Record<string, L>;
