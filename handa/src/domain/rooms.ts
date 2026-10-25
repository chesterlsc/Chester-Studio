import type { CategoryId } from './types';

/**
 * Storage rooms. Each category has ONE home room, chosen by how the thing
 * should actually be stored (cool/dry/dark, off the floor, away from kids,
 * near the exit) rather than by where it is used.
 */
export type RoomId =
  | 'kitchen'    // Kitchen & pantry: food, preserving. Cool, dry, dark, off the floor, FIFO.
  | 'water'      // Water station (dirty kitchen / laundry): drums & gallons out of sunlight, off concrete.
  | 'bedroom'    // Bedroom: medicine + baby supplies. Cool, dry, high, locked. NOT the bathroom.
  | 'bathroom'   // Bathroom (CR): hygiene & sanitation.
  | 'sala'       // Sala: power & light station. Batteries in packaging, power banks topped up.
  | 'study'      // Study / library: documents, cash, radio & comms, the family plan.
  | 'entry'      // Entryway: go-bags by the door, rain gear, headlamp.
  | 'bodega'     // Garage / bodega: shelter & repair, tools, pet supplies.
  | 'saferoom';  // Guest / upper room: security & shelter-in-place, fire extinguisher, blackout.

export const ROOM_ORDER: RoomId[] = ['kitchen', 'water', 'bedroom', 'bathroom', 'sala', 'study', 'entry', 'bodega', 'saferoom'];

export const CATEGORY_ROOM: Record<CategoryId, RoomId> = {
  food: 'kitchen',
  canning: 'kitchen',
  water: 'water',
  medicine: 'bedroom',
  baby: 'bedroom',
  hygiene: 'bathroom',
  power: 'sala',
  comms: 'study',
  cash: 'study',
  edc: 'entry',
  shelter: 'bodega',
  pets: 'bodega',
  security: 'saferoom',
};

export function roomCategories(room: RoomId): CategoryId[] {
  return (Object.keys(CATEGORY_ROOM) as CategoryId[]).filter((c) => CATEGORY_ROOM[c] === room);
}

/** Storage conditions each room is expected to provide (used by rules + recommendations). */
export interface RoomMeta {
  id: RoomId;
  /** Ideal storage climate, plain words. */
  climate: 'cool-dry-dark' | 'dry-shaded' | 'cool-dry-high' | 'humid-ok' | 'room-temp' | 'dry-secure' | 'by-the-exit' | 'ventilated' | 'upper-floor';
  /** Accent used for the room chip and map tile. */
  hue: string;
}

export const ROOMS: Record<RoomId, RoomMeta> = {
  kitchen: { id: 'kitchen', climate: 'cool-dry-dark', hue: '#ffb24a' },
  water: { id: 'water', climate: 'dry-shaded', hue: '#4fb8ff' },
  bedroom: { id: 'bedroom', climate: 'cool-dry-high', hue: '#ff6f8d' },
  bathroom: { id: 'bathroom', climate: 'humid-ok', hue: '#6fe3dc' },
  sala: { id: 'sala', climate: 'room-temp', hue: '#ffe25a' },
  study: { id: 'study', climate: 'dry-secure', hue: '#7f9bff' },
  entry: { id: 'entry', climate: 'by-the-exit', hue: '#b9c2d6' },
  bodega: { id: 'bodega', climate: 'ventilated', hue: '#8fd3a3' },
  saferoom: { id: 'saferoom', climate: 'upper-floor', hue: '#ff8a66' },
};
