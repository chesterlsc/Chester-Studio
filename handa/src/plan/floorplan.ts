import type { RoomId } from '@/domain/rooms';

/**
 * The drawing. Units are centimetres, origin top-left, y grows downward
 * (so the "front" of the house, the street, is at the bottom of each plan).
 * Two plans sit on one sheet like a real A1: ground floor on the left,
 * second floor on the right. A title block sits bottom-right.
 */
export interface Rect { x: number; y: number; w: number; h: number }
export type Wall = 'n' | 's' | 'e' | 'w';

export interface StorageUnit {
  id: string;
  room: RoomId;
  /** Footprint in plan view (absolute sheet cm). */
  rect: Rect;
  /** Wall the unit stands against (items line up along it). */
  wall: Wall;
  /** Plan-view slot grid (cols along the wall, rows away from it). */
  cols: number;
  rows: number;
  /** Section view: number of shelves, total height, shelf depth. */
  shelves: number;
  heightCm: number;
  depthCm: number;
  /** Label in the drawing, e.g. "PANTRY SHELF 300×40". */
  tag: string;
  /** If true, it's a floor pad (drums, big things) rather than shelving. */
  floor?: boolean;
  /** Height of the lowest shelf off the floor (cm); shown as a dimension. */
  offFloorCm?: number;
}

export type FixtureKind = 'bed' | 'crib' | 'sofa' | 'table' | 'counter' | 'stove' | 'sink' | 'toilet' | 'shower' | 'desk' | 'chair' | 'fridge' | 'washer' | 'stairs' | 'wardrobe' | 'tv' | 'mat' | 'shoe-rack' | 'bookshelf' | 'motorbike' | 'planter';
export interface Fixture { kind: FixtureKind; rect: Rect; rot?: 0 | 90 | 180 | 270 }
export interface Door { x: number; y: number; w: number; wall: Wall; swing?: 1 | -1 }
export interface Win { x: number; y: number; w: number; wall: Wall }

export interface RoomPlan {
  id: RoomId;
  floor: 0 | 1;
  rect: Rect;
  code: string;          // drawing code, e.g. "G-03"
  areaLabel: string;     // e.g. "KITCHEN · 10.5 m²"
  units: StorageUnit[];
  fixtures: Fixture[];
  doors: Door[];
  windows: Win[];
}

export interface Exterior { id: string; rect: Rect; label: string; floor: 0 | 1 }

export const WALL = { ext: 18, int: 10 };
export const FLOOR_W = 900;
export const FLOOR_H = 800;
export const FLOOR_GAP = 220;
export const F1X = FLOOR_W + FLOOR_GAP; // x offset of the second floor plan
export const SHEET = { x: -180, y: -200, w: FLOOR_W * 2 + FLOOR_GAP + 360, h: FLOOR_H + 620 };
export const TITLE_BLOCK: Rect = { x: SHEET.x + SHEET.w - 980, y: FLOOR_H + 150, w: 940, h: 230 };

const r = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h });
const m2 = (rc: Rect) => `${((rc.w * rc.h) / 10000).toFixed(1)} m²`;

export const ROOM_PLANS: RoomPlan[] = [
  // ---------------- GROUND FLOOR ----------------
  {
    id: 'water', floor: 0, rect: r(0, 0, 300, 300), code: 'G-01', areaLabel: m2(r(0, 0, 300, 300)),
    units: [
      { id: 'water-pad', room: 'water', rect: r(20, 40, 120, 240), wall: 'w', cols: 2, rows: 4, shelves: 1, heightCm: 100, depthCm: 60, tag: 'WATER PAD · PALLET +12', floor: true, offFloorCm: 12 },
      { id: 'water-shelf', room: 'water', rect: r(160, 20, 120, 50), wall: 'n', cols: 3, rows: 1, shelves: 2, heightCm: 120, depthCm: 45, tag: 'TREATMENT SHELF 120×45', offFloorCm: 40 },
    ],
    fixtures: [{ kind: 'washer', rect: r(220, 220, 60, 60) }, { kind: 'sink', rect: r(160, 230, 50, 50) }, { kind: 'planter', rect: r(250, 90, 30, 90) }],
    doors: [{ x: 300, y: 200, w: 80, wall: 'e', swing: 1 }],
    windows: [{ x: 160, y: 0, w: 100, wall: 'n' }],
  },
  {
    id: 'kitchen', floor: 0, rect: r(300, 0, 350, 300), code: 'G-02', areaLabel: m2(r(300, 0, 350, 300)),
    units: [
      { id: 'pantry', room: 'kitchen', rect: r(320, 20, 240, 45), wall: 'n', cols: 6, rows: 1, shelves: 4, heightCm: 200, depthCm: 40, tag: 'PANTRY 240×40 · 4 SHELVES', offFloorCm: 15 },
      { id: 'preserve', room: 'kitchen', rect: r(320, 80, 45, 160), wall: 'w', cols: 1, rows: 4, shelves: 3, heightCm: 160, depthCm: 35, tag: 'PRESERVING RACK 160×35', offFloorCm: 15 },
    ],
    fixtures: [{ kind: 'counter', rect: r(590, 20, 60, 260) }, { kind: 'stove', rect: r(595, 60, 50, 60) }, { kind: 'sink', rect: r(595, 170, 50, 50) }, { kind: 'fridge', rect: r(520, 215, 65, 65) }, { kind: 'table', rect: r(400, 150, 110, 70) }],
    doors: [{ x: 300, y: 200, w: 80, wall: 'w', swing: -1 }, { x: 440, y: 300, w: 100, wall: 's' }],
    windows: [{ x: 650, y: 100, w: 110, wall: 'e' }],
  },
  {
    id: 'bathroom', floor: 0, rect: r(650, 0, 250, 300), code: 'G-03', areaLabel: m2(r(650, 0, 250, 300)),
    units: [
      { id: 'hygiene', room: 'bathroom', rect: r(845, 30, 40, 170), wall: 'e', cols: 1, rows: 4, shelves: 4, heightCm: 180, depthCm: 30, tag: 'HYGIENE SHELF 170×30', offFloorCm: 30 },
    ],
    fixtures: [{ kind: 'toilet', rect: r(680, 30, 50, 70) }, { kind: 'sink', rect: r(680, 130, 50, 50) }, { kind: 'shower', rect: r(680, 200, 90, 90) }],
    doors: [{ x: 790, y: 300, w: 80, wall: 's', swing: -1 }],
    windows: [{ x: 720, y: 0, w: 60, wall: 'n' }],
  },
  {
    id: 'bodega', floor: 0, rect: r(0, 300, 300, 500), code: 'G-04', areaLabel: m2(r(0, 300, 300, 500)),
    units: [
      { id: 'tool-wall', room: 'bodega', rect: r(20, 320, 45, 320), wall: 'w', cols: 1, rows: 8, shelves: 4, heightCm: 200, depthCm: 40, tag: 'TOOL WALL 320×40', offFloorCm: 20 },
      { id: 'pet-rack', room: 'bodega', rect: r(20, 660, 120, 60), wall: 's', cols: 3, rows: 1, shelves: 2, heightCm: 120, depthCm: 50, tag: 'PET RACK 120×50', offFloorCm: 15 },
    ],
    fixtures: [{ kind: 'motorbike', rect: r(160, 480, 100, 200) }],
    doors: [{ x: 300, y: 420, w: 90, wall: 'e', swing: 1 }, { x: 110, y: 800, w: 240, wall: 's' }],
    windows: [{ x: 0, y: 680, w: 80, wall: 'w' }],
  },
  {
    id: 'sala', floor: 0, rect: r(300, 300, 600, 320), code: 'G-05', areaLabel: m2(r(300, 300, 600, 320)),
    units: [
      { id: 'power-station', room: 'sala', rect: r(560, 320, 240, 45), wall: 'n', cols: 6, rows: 1, shelves: 2, heightCm: 90, depthCm: 40, tag: 'POWER STATION 240×40 · CONSOLE', offFloorCm: 45 },
    ],
    fixtures: [{ kind: 'sofa', rect: r(360, 480, 220, 80) }, { kind: 'table', rect: r(600, 470, 110, 60) }, { kind: 'tv', rect: r(360, 330, 150, 20) }, { kind: 'stairs', rect: r(810, 380, 80, 230) }],
    doors: [],
    windows: [{ x: 900, y: 340, w: 120, wall: 'e' }],
  },
  {
    id: 'entry', floor: 0, rect: r(300, 620, 300, 180), code: 'G-06', areaLabel: m2(r(300, 620, 300, 180)),
    units: [
      { id: 'go-bag-rack', room: 'entry', rect: r(320, 640, 45, 140), wall: 'w', cols: 1, rows: 4, shelves: 3, heightCm: 180, depthCm: 35, tag: 'GO-BAG HOOKS · BY EXIT', offFloorCm: 0 },
    ],
    fixtures: [{ kind: 'shoe-rack', rect: r(500, 760, 90, 30) }],
    doors: [{ x: 420, y: 800, w: 90, wall: 's', swing: 1 }],
    windows: [],
  },
  // ---------------- SECOND FLOOR ----------------
  {
    id: 'bedroom', floor: 1, rect: r(F1X + 0, 0, 450, 450), code: 'S-01', areaLabel: m2(r(0, 0, 450, 450)),
    units: [
      { id: 'med-cabinet', room: 'bedroom', rect: r(F1X + 30, 20, 180, 35), wall: 'n', cols: 4, rows: 1, shelves: 3, heightCm: 70, depthCm: 25, tag: 'MED CABINET · H 160 · LOCKED', offFloorCm: 160 },
      { id: 'baby-shelf', room: 'bedroom', rect: r(F1X + 20, 230, 40, 200), wall: 'w', cols: 1, rows: 5, shelves: 3, heightCm: 150, depthCm: 35, tag: 'BABY SHELF 200×35', offFloorCm: 20 },
    ],
    fixtures: [{ kind: 'bed', rect: r(F1X + 220, 120, 200, 220) }, { kind: 'crib', rect: r(F1X + 80, 290, 80, 130) }, { kind: 'wardrobe', rect: r(F1X + 250, 20, 180, 55) }],
    doors: [{ x: F1X + 450, y: 360, w: 80, wall: 'e', swing: -1 }],
    windows: [{ x: F1X + 0, y: 90, w: 110, wall: 'w' }],
  },
  {
    id: 'study', floor: 1, rect: r(F1X + 450, 0, 450, 300), code: 'S-02', areaLabel: m2(r(0, 0, 450, 300)),
    units: [
      { id: 'doc-safe', room: 'study', rect: r(F1X + 855, 40, 35, 200), wall: 'e', cols: 1, rows: 5, shelves: 3, heightCm: 120, depthCm: 35, tag: 'DOC SAFE + COMMS 200×35', offFloorCm: 40 },
    ],
    fixtures: [{ kind: 'desk', rect: r(F1X + 500, 190, 200, 70) }, { kind: 'chair', rect: r(F1X + 580, 130, 45, 45) }, { kind: 'bookshelf', rect: r(F1X + 480, 20, 300, 35) }],
    doors: [{ x: F1X + 600, y: 300, w: 80, wall: 's', swing: 1 }],
    windows: [{ x: F1X + 900, y: 60, w: 100, wall: 'e' }],
  },
  {
    id: 'saferoom', floor: 1, rect: r(F1X + 450, 300, 450, 350), code: 'S-03', areaLabel: m2(r(0, 0, 450, 350)),
    units: [
      { id: 'safe-shelf', room: 'saferoom', rect: r(F1X + 470, 600, 320, 40), wall: 's', cols: 8, rows: 1, shelves: 3, heightCm: 180, depthCm: 35, tag: 'STAY-IN SHELF 320×35', offFloorCm: 15 },
    ],
    fixtures: [{ kind: 'mat', rect: r(F1X + 500, 340, 110, 200) }, { kind: 'mat', rect: r(F1X + 640, 340, 110, 200) }],
    doors: [{ x: F1X + 450, y: 420, w: 80, wall: 'w', swing: 1 }],
    windows: [{ x: F1X + 900, y: 420, w: 100, wall: 'e' }],
  },
];

export const EXTERIORS: Exterior[] = [
  { id: 'porch', rect: r(600, 620, 300, 180), label: 'CARPORT / PORCH', floor: 0 },
  { id: 'hall', rect: r(F1X + 0, 450, 450, 350), label: 'HALL · STAIRS', floor: 1 },
  { id: 'hall2', rect: r(F1X + 450, 650, 450, 150), label: 'HALL', floor: 1 },
];
export const STAIRS_UP: Fixture = { kind: 'stairs', rect: r(F1X + 300, 500, 80, 230) };

export const FLOORS = [
  { floor: 0 as const, rect: r(0, 0, FLOOR_W, FLOOR_H), title: 'GROUND FLOOR PLAN', code: 'A-101' },
  { floor: 1 as const, rect: r(F1X, 0, FLOOR_W, FLOOR_H), title: 'SECOND FLOOR PLAN', code: 'A-102' },
];

export const roomPlan = (id: RoomId): RoomPlan => ROOM_PLANS.find((p) => p.id === id)!;
export const unitsOf = (id: RoomId): StorageUnit[] => roomPlan(id).units;

/** Slot centre (sheet cm) for the i-th slot of a unit, filling along the wall first. */
export function unitSlot(u: StorageUnit, i: number): { cx: number; cy: number; w: number; h: number } {
  const along = u.wall === 'n' || u.wall === 's' ? u.rect.w : u.rect.h;
  const deep = u.wall === 'n' || u.wall === 's' ? u.rect.h : u.rect.w;
  const sw = along / u.cols, sd = deep / u.rows;
  const col = i % u.cols, row = Math.floor(i / u.cols) % u.rows;
  if (u.wall === 'n' || u.wall === 's') {
    const cx = u.rect.x + sw * (col + .5);
    const cy = u.wall === 'n' ? u.rect.y + sd * (row + .5) : u.rect.y + u.rect.h - sd * (row + .5);
    return { cx, cy, w: sw, h: sd };
  }
  const cy = u.rect.y + sw * (col + .5);
  const cx = u.wall === 'w' ? u.rect.x + sd * (row + .5) : u.rect.x + u.rect.w - sd * (row + .5);
  return { cx, cy, w: sd, h: sw };
}

export function padRect(rc: Rect, p: number): Rect { return { x: rc.x - p, y: rc.y - p, w: rc.w + p * 2, h: rc.h + p * 2 }; }
export function unionRect(a: Rect, b: Rect): Rect { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }; }
