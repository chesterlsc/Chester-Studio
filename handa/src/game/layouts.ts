import type { RoomId } from '@/domain/rooms';

/**
 * 2D room scenes. Canvas is 1000 × 620: wall from y=0..470, floor 470..620.
 * Coordinates are SVG user units. Each storage unit has a slot grid; items
 * fill slots left→right, bottom shelf first.
 */
export type FurnitureKind =
  | 'counter' | 'stove' | 'fridge' | 'sink' | 'table' | 'stool' | 'washer' | 'laundry-sink' | 'pallet' | 'bed' | 'crib' | 'wardrobe' | 'nightstand'
  | 'toilet' | 'basin' | 'mirror' | 'shower' | 'sofa' | 'tv' | 'console' | 'rug' | 'plant' | 'desk' | 'chair' | 'bookshelf' | 'safe' | 'door' | 'shoe-rack' | 'bench' | 'coat-hooks'
  | 'motorbike' | 'pegboard' | 'workbench' | 'mats' | 'boards' | 'curtain' | 'fan' | 'drum-rack' | 'frame' | 'clock' | 'calendar'
  // toon props (visual-novel dressing; never placed over a unit's box)
  | 'poster' | 'kubo' | 'corkboard' | 'garland' | 'capiz' | 'jeepney' | 'pricesign' | 'petbed' | 'clothesline' | 'utensils' | 'towels' | 'bucket' | 'umbrellas' | 'doormat' | 'broom' | 'books' | 'hose' | 'lantern' | 'wainscot';

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
  /** i18n key suffix under game.note (storage rule callout). */
  note: string;
}
export interface Win { x: number; y: number; w: number; h: number; boards?: boolean; /** tied-back curtain colour (toon dressing) */ curtain?: string }
export interface Sign { x: number; y: number; text: string; color?: string }
export interface RoomLayout {
  id: RoomId;
  /** In-scene stickers with one-line storage rules. */
  signs?: Sign[];
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
    id: 'kitchen', wall: '#ffe4b8', wallDark: '#f3cf98', floor: '#dfb985', floorDark: '#b98a56', trim: '#fff3dc',
    windows: [{ x: 700, y: 70, w: 180, h: 150, curtain: '#f2b744' }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'wainscot', x: 590, y: 248, w: 350, h: 90, tint: '#ffd9a6' }, { kind: 'counter', x: 600, y: 330, w: 330, h: 140 }, { kind: 'stove', x: 640, y: 318, w: 120, h: 24 }, { kind: 'sink', x: 800, y: 318, w: 100, h: 26 },
      { kind: 'fridge', x: 470, y: 230, w: 110, h: 240 }, { kind: 'rug', x: 80, y: 560, w: 360, h: 40 }, { kind: 'plant', x: 72, y: 400, w: 50, h: 70 },
      { kind: 'clock', x: 560, y: 60, w: 50, h: 50 }, { kind: 'calendar', x: 482, y: 150, w: 56, h: 60, tint: '#e76f51' },
      { kind: 'utensils', x: 780, y: 248, w: 130, h: 70 }, { kind: 'pricesign', x: 592, y: 254, w: 90, h: 42 },
    ],
    units: [
      { id: 'pantry', kind: 'shelf', x: 80, y: 110, w: 370, h: 360, cols: 5, rows: 3, label: 'pantry', note: 'pantry' },
      { id: 'preserve', kind: 'cabinet', x: 610, y: 60, w: 70, h: 180, cols: 1, rows: 3, label: 'preserve', note: 'preserve' },
    ],
    unitFor: { canning: 'preserve', food: 'pantry' },
    signs: [{ x: 300, y: 140, text: 'FIFO · OLD IN FRONT' }, { x: 590, y: 300, text: '< 24 °C · AWAY FROM STOVE', color: '#ffe08a' }],
  },
  water: {
    id: 'water', wall: '#cfeaf6', wallDark: '#a9d3e6', floor: '#cfc9bd', floorDark: '#a39b8d', trim: '#f0fbff',
    windows: [{ x: 100, y: 60, w: 200, h: 160, curtain: '#5fb3e0' }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'wainscot', x: 60, y: 320, w: 880, h: 150, tint: '#b9dde9' }, { kind: 'washer', x: 780, y: 330, w: 130, h: 140 }, { kind: 'laundry-sink', x: 630, y: 340, w: 130, h: 130 },
      { kind: 'pallet', x: 70, y: 440, w: 520, h: 40 }, { kind: 'plant', x: 870, y: 380, w: 60, h: 90 },
      { kind: 'clothesline', x: 650, y: 70, w: 270, h: 80 }, { kind: 'poster', x: 700, y: 180, w: 76, h: 96, tint: '#3a86d6' }, { kind: 'bucket', x: 600, y: 500, w: 46, h: 56, tint: '#e8503f' },
    ],
    units: [
      { id: 'water-pad', kind: 'floor', x: 80, y: 250, w: 500, h: 190, cols: 5, rows: 2, label: 'waterPad', note: 'waterPad' },
      { id: 'water-shelf', kind: 'shelf', x: 340, y: 70, w: 260, h: 160, cols: 3, rows: 2, label: 'treatment', note: 'treatment' },
    ],
    signs: [{ x: 90, y: 215, text: 'DRINKING · SEALED', color: '#9fd3ff' }, { x: 640, y: 300, text: 'FLUSH / WASH ONLY', color: '#ffc247' }, { x: 100, y: 240, text: 'OUT OF SUN · ROTATE 6 MO' }],
  },
  bedroom: {
    id: 'bedroom', wall: '#fbd9e2', wallDark: '#f0bccb', floor: '#d3a677', floorDark: '#ad8256', trim: '#fff1f4',
    windows: [{ x: 560, y: 70, w: 180, h: 160, curtain: '#f08aa6' }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'bed', x: 520, y: 300, w: 300, h: 170 }, { kind: 'nightstand', x: 830, y: 390, w: 90, h: 80 }, { kind: 'crib', x: 330, y: 330, w: 170, h: 140 },
      { kind: 'rug', x: 540, y: 550, w: 300, h: 40, tint: '#d98aa0' }, { kind: 'frame', x: 840, y: 120, w: 70, h: 60 },
      { kind: 'kubo', x: 420, y: 84, w: 110, h: 90 }, { kind: 'garland', x: 404, y: 190, w: 140, h: 26 }, { kind: 'jeepney', x: 150, y: 530, w: 96, h: 54 },
    ],
    units: [
      { id: 'med-cabinet', kind: 'cabinet', x: 110, y: 60, w: 250, h: 170, cols: 4, rows: 2, label: 'medCabinet', note: 'medCabinet', locked: true, high: true },
      { id: 'baby-shelf', kind: 'shelf', x: 80, y: 300, w: 250, h: 170, cols: 3, rows: 2, label: 'babyShelf', note: 'babyShelf' },
    ],
    unitFor: { baby: 'baby-shelf', medicine: 'med-cabinet' },
    signs: [{ x: 330, y: 252, text: 'LOCKED · KIDS CAN\'T REACH', color: '#ff9fb1' }],
  },
  bathroom: {
    id: 'bathroom', wall: '#c9f0ea', wallDark: '#a4e0d6', floor: '#e6ebe6', floorDark: '#b8c6c2', trim: '#f2fffb',
    windows: [{ x: 420, y: 60, w: 120, h: 100 }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'wainscot', x: 60, y: 290, w: 880, h: 180, tint: '#a9e2d9' }, { kind: 'shower', x: 80, y: 60, w: 220, h: 410 }, { kind: 'toilet', x: 330, y: 330, w: 110, h: 140 }, { kind: 'basin', x: 470, y: 320, w: 160, h: 150 }, { kind: 'mirror', x: 470, y: 180, w: 160, h: 120 },
      { kind: 'towels', x: 330, y: 190, w: 110, h: 100 }, { kind: 'bucket', x: 110, y: 500, w: 60, h: 70 }, { kind: 'plant', x: 330, y: 70, w: 44, h: 60 },
    ],
    units: [
      { id: 'hygiene', kind: 'shelf', x: 660, y: 100, w: 270, h: 370, cols: 3, rows: 3, label: 'hygiene', note: 'hygiene' },
    ],
    signs: [{ x: 300, y: 470, text: 'NO MEDICINE HERE · STEAM', color: '#ff9fb1' }],
  },
  sala: {
    id: 'sala', wall: '#ffe2c8', wallDark: '#f5c9a6', floor: '#d2a877', floorDark: '#aa8457', trim: '#fff4e8',
    windows: [{ x: 100, y: 60, w: 220, h: 170, curtain: '#e8734f' }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'sofa', x: 80, y: 320, w: 350, h: 150 }, { kind: 'rug', x: 80, y: 540, w: 480, h: 50 }, { kind: 'tv', x: 560, y: 90, w: 300, h: 170 },
      { kind: 'console', x: 520, y: 280, w: 420, h: 190 }, { kind: 'plant', x: 880, y: 380, w: 50, h: 80 }, { kind: 'fan', x: 450, y: 380, w: 60, h: 90 },
      { kind: 'frame', x: 360, y: 80, w: 150, h: 110 }, { kind: 'clock', x: 400, y: 210, w: 56, h: 56 }, { kind: 'capiz', x: 880, y: 60, w: 50, h: 110 },
    ],
    units: [
      { id: 'power-station', kind: 'rack', x: 540, y: 285, w: 380, h: 180, cols: 5, rows: 2, label: 'powerStation', note: 'powerStation' },
    ],
    signs: [{ x: 560, y: 240, text: 'POWER BANKS 50–80 % · TOP UP MONTHLY', color: '#ffe08a' }],
  },
  study: {
    id: 'study', wall: '#dfe3fb', wallDark: '#c1c8f2', floor: '#bf8f60', floorDark: '#956c46', trim: '#f4f5ff',
    windows: [{ x: 720, y: 60, w: 180, h: 150, curtain: '#6f8fe0' }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'desk', x: 580, y: 330, w: 340, h: 140 }, { kind: 'chair', x: 700, y: 380, w: 90, h: 90 }, { kind: 'safe', x: 480, y: 360, w: 100, h: 110 }, { kind: 'rug', x: 500, y: 560, w: 440, h: 40, tint: '#4f7fc4' },
      { kind: 'corkboard', x: 496, y: 80, w: 190, h: 150 }, { kind: 'calendar', x: 508, y: 250, w: 62, h: 74, tint: '#3a86d6' }, { kind: 'books', x: 850, y: 290, w: 60, h: 40 },
    ],
    units: [
      { id: 'doc-safe', kind: 'shelf', x: 80, y: 80, w: 380, h: 390, cols: 4, rows: 3, label: 'library', note: 'library' },
    ],
    signs: [{ x: 480, y: 330, text: 'IDs: POUCH + PHONE PHOTOS', color: '#b7c8ff' }],
  },
  entry: {
    id: 'entry', wall: '#f4e6cf', wallDark: '#e6d1ad', floor: '#d8c6a4', floorDark: '#ad9a78', trim: '#fdf8ee',
    windows: [],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'door', x: 620, y: 60, w: 240, h: 410 }, { kind: 'shoe-rack', x: 830, y: 380, w: 100, h: 90 }, { kind: 'bench', x: 90, y: 380, w: 290, h: 90 }, { kind: 'doormat', x: 600, y: 540, w: 280, h: 52 }, { kind: 'frame', x: 440, y: 40, w: 90, h: 70 },
      { kind: 'umbrellas', x: 548, y: 360, w: 56, h: 110, tint: '#8a5a36' }, { kind: 'garland', x: 630, y: 62, w: 220, h: 30 }, { kind: 'clock', x: 556, y: 240, w: 50, h: 50 },
    ],
    units: [
      { id: 'go-bag-rack', kind: 'hooks', x: 80, y: 130, w: 460, h: 150, cols: 5, rows: 1, label: 'hooks', note: 'hooks' },
      { id: 'bench-under', kind: 'floor', x: 90, y: 285, w: 290, h: 95, cols: 3, rows: 1, label: 'bench', note: 'bench' },
    ],
    signs: [{ x: 560, y: 100, text: 'ONE BAG PER PERSON · BY THE EXIT' }],
  },
  bodega: {
    id: 'bodega', wall: '#e3dccb', wallDark: '#cbc1a8', floor: '#aaa49a', floorDark: '#857f76', trim: '#efe9db',
    windows: [{ x: 90, y: 60, w: 140, h: 110 }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'motorbike', x: 560, y: 300, w: 290, h: 170 }, { kind: 'workbench', x: 80, y: 360, w: 250, h: 110 },
      { kind: 'hose', x: 130, y: 210, w: 90, h: 90 }, { kind: 'broom', x: 860, y: 300, w: 70, h: 170 }, { kind: 'petbed', x: 860, y: 500, w: 100, h: 60 }, { kind: 'lantern', x: 95, y: 200, w: 26, h: 60 },
    ],
    units: [
      { id: 'tool-wall', kind: 'pegboard', x: 250, y: 70, w: 450, h: 270, cols: 5, rows: 3, label: 'toolWall', note: 'toolWall' },
      { id: 'pet-rack', kind: 'shelf', x: 740, y: 70, w: 190, h: 200, cols: 2, rows: 2, label: 'petRack', note: 'petRack' },
    ],
    unitFor: { pets: 'pet-rack', shelter: 'tool-wall' },
    signs: [{ x: 250, y: 350, text: 'BOARDS PRE-CUT · LABEL PER WINDOW' }, { x: 740, y: 280, text: 'NO FUEL INDOORS', color: '#ff9f8a' }],
  },
  saferoom: {
    id: 'saferoom', wall: '#e6ebcf', wallDark: '#cdd5ab', floor: '#d0bb95', floorDark: '#a99472', trim: '#f7f9e8',
    windows: [{ x: 620, y: 70, w: 200, h: 160, boards: true }],
    lamps: [{ x: 500, y: 20 }],
    furniture: [
      { kind: 'mats', x: 540, y: 380, w: 380, h: 90 }, { kind: 'curtain', x: 600, y: 55, w: 240, h: 190 }, { kind: 'boards', x: 620, y: 70, w: 200, h: 160 },
      { kind: 'poster', x: 860, y: 90, w: 70, h: 110, tint: '#2a9d8f' }, { kind: 'clock', x: 540, y: 96, w: 50, h: 50 }, { kind: 'lantern', x: 866, y: 230, w: 30, h: 70 }, { kind: 'rug', x: 100, y: 548, w: 380, h: 44, tint: '#b5894f' },
    ],
    units: [
      { id: 'safe-shelf', kind: 'shelf', x: 80, y: 80, w: 430, h: 390, cols: 4, rows: 3, label: 'stayIn', note: 'stayIn' },
    ],
    signs: [{ x: 540, y: 250, text: 'UPPER FLOOR · FLOOD SAFE', color: '#9fd3ff' }],
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
