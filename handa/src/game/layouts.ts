import type { RoomId } from '@/domain/rooms';

/**
 * 2D room scenes. Canvas is 1000 × 620: wall from y=0..470, floor 470..620.
 * Coordinates are SVG user units. Each storage unit has a slot grid; items
 * fill slots left→right, bottom shelf first.
 */
export type FurnitureKind =
  | 'counter' | 'stove' | 'fridge' | 'sink' | 'table' | 'stool' | 'washer' | 'laundry-sink' | 'pallet' | 'bed' | 'crib' | 'wardrobe' | 'nightstand'
  | 'toilet' | 'basin' | 'mirror' | 'shower' | 'sofa' | 'tv' | 'console' | 'rug' | 'plant' | 'desk' | 'chair' | 'bookshelf' | 'safe' | 'door' | 'shoe-rack' | 'bench' | 'coat-hooks'
  | 'motorbike' | 'pegboard' | 'workbench' | 'mats' | 'boards' | 'curtain' | 'fan' | 'drum-rack' | 'frame' | 'clock' | 'calendar';

export interface Furniture { kind: FurnitureKind; x: number; y: number; w: number; h: number; tint?: string }
export type UnitKind = 'shelf' | 'cabinet' | 'hooks' | 'floor' | 'pegboard' | 'rack';
export interface Unit {
  id: string;
  kind: UnitKind;
  x: number; y: number; w: number; h: number;   // outer box
  cols: number; rows: number;                     // slots (rows = shelves, bottom row first)
  label: string;                                  // i18n key suffix under game.unit
  locked?: boolean;                               // draws a padlock (medicine)
  high?: boolean;                                 // "keep it high" badge
}
export interface Win { x: number; y: number; w: number; h: number; boards?: boolean }
export interface RoomLayout {
  id: RoomId;
  wall: string; wallDark: string; floor: string; floorDark: string; trim: string;
  windows: Win[];
  lamps: Array<{ x: number; y: number }>;
  furniture: Furniture[];
  units: Unit[];
  /** which unit an item category goes to (default: first) */
  unitFor?: Partial<Record<string, string>>;
}

export const LAYOUTS: Record<RoomId, RoomLayout> = {
  kitchen: {
    id: 'kitchen', wall: '#fde9c9', wallDark: '#f1d5a8', floor: '#d7c2a0', floorDark: '#b89b73', trim: '#f8f1e3',
    windows: [{ x: 700, y: 70, w: 180, h: 150 }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'counter', x: 600, y: 330, w: 380, h: 140 }, { kind: 'stove', x: 640, y: 318, w: 120, h: 24 }, { kind: 'sink', x: 820, y: 318, w: 110, h: 26 },
      { kind: 'fridge', x: 470, y: 230, w: 110, h: 240 }, { kind: 'rug', x: 80, y: 560, w: 360, h: 40 }, { kind: 'plant', x: 20, y: 400, w: 50, h: 70 },
      { kind: 'clock', x: 560, y: 60, w: 50, h: 50 },
    ],
    units: [
      { id: 'pantry', kind: 'shelf', x: 60, y: 110, w: 380, h: 360, cols: 5, rows: 4, label: 'pantry' },
      { id: 'preserve', kind: 'cabinet', x: 610, y: 60, w: 70, h: 180, cols: 1, rows: 3, label: 'preserve' },
    ],
    unitFor: { canning: 'preserve', food: 'pantry' },
  },
  water: {
    id: 'water', wall: '#dff0f7', wallDark: '#bfdde9', floor: '#c9ccd1', floorDark: '#9ea3ab', trim: '#f4fbff',
    windows: [{ x: 80, y: 60, w: 200, h: 160 }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'washer', x: 760, y: 330, w: 130, h: 140 }, { kind: 'laundry-sink', x: 610, y: 340, w: 130, h: 130 },
      { kind: 'pallet', x: 60, y: 440, w: 520, h: 40 }, { kind: 'plant', x: 920, y: 380, w: 60, h: 90 },
    ],
    units: [
      { id: 'water-pad', kind: 'floor', x: 70, y: 260, w: 500, h: 180, cols: 5, rows: 2, label: 'waterPad' },
      { id: 'water-shelf', kind: 'shelf', x: 330, y: 70, w: 260, h: 160, cols: 3, rows: 2, label: 'treatment' },
    ],
  },
  bedroom: {
    id: 'bedroom', wall: '#f6dfe6', wallDark: '#e9c4cf', floor: '#c9a27a', floorDark: '#a67f5b', trim: '#fff5f7',
    windows: [{ x: 560, y: 70, w: 180, h: 160 }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'bed', x: 520, y: 300, w: 300, h: 170 }, { kind: 'nightstand', x: 840, y: 390, w: 90, h: 80 }, { kind: 'crib', x: 330, y: 330, w: 170, h: 140 },
      { kind: 'rug', x: 540, y: 550, w: 300, h: 40 }, { kind: 'frame', x: 870, y: 120, w: 70, h: 60 },
    ],
    units: [
      { id: 'med-cabinet', kind: 'cabinet', x: 60, y: 60, w: 260, h: 170, cols: 4, rows: 2, label: 'medCabinet', locked: true, high: true },
      { id: 'baby-shelf', kind: 'shelf', x: 60, y: 300, w: 250, h: 170, cols: 3, rows: 2, label: 'babyShelf' },
    ],
    unitFor: { baby: 'baby-shelf', medicine: 'med-cabinet' },
  },
  bathroom: {
    id: 'bathroom', wall: '#d8f1ee', wallDark: '#b6e0da', floor: '#e3e9ec', floorDark: '#b9c5cb', trim: '#f6fffd',
    windows: [{ x: 420, y: 60, w: 120, h: 100 }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'shower', x: 60, y: 60, w: 230, h: 410 }, { kind: 'toilet', x: 330, y: 330, w: 110, h: 140 }, { kind: 'basin', x: 470, y: 320, w: 160, h: 150 }, { kind: 'mirror', x: 470, y: 180, w: 160, h: 120 },
    ],
    units: [
      { id: 'hygiene', kind: 'shelf', x: 680, y: 100, w: 280, h: 370, cols: 3, rows: 4, label: 'hygiene' },
    ],
  },
  sala: {
    id: 'sala', wall: '#fbe7d6', wallDark: '#efcfb8', floor: '#c8a47c', floorDark: '#a3825f', trim: '#fff7ef',
    windows: [{ x: 80, y: 60, w: 220, h: 170 }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'sofa', x: 60, y: 320, w: 360, h: 150 }, { kind: 'rug', x: 80, y: 540, w: 480, h: 50 }, { kind: 'tv', x: 560, y: 90, w: 300, h: 170 },
      { kind: 'console', x: 520, y: 280, w: 420, h: 190 }, { kind: 'plant', x: 930, y: 380, w: 60, h: 90 }, { kind: 'fan', x: 450, y: 380, w: 60, h: 90 },
    ],
    units: [
      { id: 'power-station', kind: 'rack', x: 540, y: 285, w: 380, h: 180, cols: 5, rows: 2, label: 'powerStation' },
    ],
  },
  study: {
    id: 'study', wall: '#e4e7f6', wallDark: '#c9cfea', floor: '#b48a62', floorDark: '#8f6a48', trim: '#f6f7ff',
    windows: [{ x: 720, y: 60, w: 180, h: 150 }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'desk', x: 600, y: 330, w: 340, h: 140 }, { kind: 'chair', x: 700, y: 380, w: 90, h: 90 }, { kind: 'safe', x: 480, y: 360, w: 100, h: 110 }, { kind: 'rug', x: 500, y: 560, w: 440, h: 40 },
    ],
    units: [
      { id: 'doc-safe', kind: 'shelf', x: 60, y: 80, w: 390, h: 390, cols: 4, rows: 4, label: 'library' },
    ],
  },
  entry: {
    id: 'entry', wall: '#ece6da', wallDark: '#d6cdbb', floor: '#cfc3ad', floorDark: '#a69a85', trim: '#fbf8f2',
    windows: [],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'door', x: 620, y: 60, w: 240, h: 410 }, { kind: 'shoe-rack', x: 880, y: 380, w: 100, h: 90 }, { kind: 'bench', x: 80, y: 380, w: 300, h: 90 }, { kind: 'rug', x: 560, y: 560, w: 360, h: 40 }, { kind: 'frame', x: 420, y: 90, w: 120, h: 90 },
    ],
    units: [
      { id: 'go-bag-rack', kind: 'hooks', x: 60, y: 130, w: 480, h: 150, cols: 5, rows: 1, label: 'hooks' },
      { id: 'bench-under', kind: 'floor', x: 80, y: 285, w: 300, h: 95, cols: 3, rows: 1, label: 'bench' },
    ],
  },
  bodega: {
    id: 'bodega', wall: '#dcdcd4', wallDark: '#c1c1b6', floor: '#9d9d99', floorDark: '#7b7b78', trim: '#ecece6',
    windows: [{ x: 60, y: 60, w: 140, h: 110 }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'motorbike', x: 560, y: 300, w: 300, h: 170 }, { kind: 'workbench', x: 60, y: 360, w: 260, h: 110 },
    ],
    units: [
      { id: 'tool-wall', kind: 'pegboard', x: 240, y: 70, w: 460, h: 270, cols: 5, rows: 3, label: 'toolWall' },
      { id: 'pet-rack', kind: 'shelf', x: 760, y: 70, w: 200, h: 200, cols: 2, rows: 2, label: 'petRack' },
    ],
    unitFor: { pets: 'pet-rack', shelter: 'tool-wall' },
  },
  saferoom: {
    id: 'saferoom', wall: '#e7ead9', wallDark: '#cdd2bb', floor: '#c6b596', floorDark: '#a08f72', trim: '#f7f9ee',
    windows: [{ x: 620, y: 70, w: 200, h: 160, boards: true }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'mats', x: 560, y: 380, w: 380, h: 90 }, { kind: 'curtain', x: 600, y: 55, w: 240, h: 190 }, { kind: 'boards', x: 620, y: 70, w: 200, h: 160 },
    ],
    units: [
      { id: 'safe-shelf', kind: 'shelf', x: 60, y: 80, w: 440, h: 390, cols: 4, rows: 4, label: 'stayIn' },
    ],
  },
};

/** Slot centre + size for the i-th item in a unit (bottom shelf first, left → right). */
export function slotAt(u: Unit, i: number): { x: number; y: number; w: number; h: number; row: number; col: number } {
  const cap = u.cols * u.rows;
  const k = i % cap;
  const row = Math.floor(k / u.cols);          // 0 = bottom
  const col = k % u.cols;
  const pad = u.kind === 'hooks' ? 10 : 14;
  const w = (u.w - pad * 2) / u.cols;
  const h = (u.h - pad * 2) / u.rows;
  const x = u.x + pad + w * col + w / 2;
  const base = u.kind === 'hooks' ? u.y + pad + h * (row + 1) - 10 : u.y + u.h - pad - h * row - 6;
  return { x, y: base, w, h, row, col };
}

/** Rooms arranged as a dollhouse: 3 floors × 3 rooms. */
export const HOUSE_GRID: RoomId[][] = [
  ['bedroom', 'study', 'saferoom'],
  ['kitchen', 'sala', 'bathroom'],
  ['water', 'bodega', 'entry'],
];
