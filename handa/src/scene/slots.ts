import type { SlotId } from '@/domain/types';
import * as THREE from 'three';

/**
 * House layout (meters). Origin at the center of the ground floor.
 * Footprint 7 (x) × 5 (z). Front wall (+z) is cut away so you see inside.
 */
export const L = {
  w: 7, d: 5, h1: 2.7, h2: 2.4,
  floorT: .18,
  wallT: .18,
  kitchenX: -0.9,   // wall between kitchen (left) and sala (right)
  stairX: 0.6,      // stairs sit on the back wall centre-right
  doorX: 2.6,       // front door on the right side wall
  roofH: 1.5,
};

export interface SlotDef {
  id: SlotId;
  /** Where the room highlight glows (floor patch center). */
  center: THREE.Vector3;
  /** Camera target when focused. */
  look: THREE.Vector3;
  /** First cell origin (center of the first item's base). */
  origin: THREE.Vector3;
  cols: number;        // along x (or z if `alongZ`)
  levels: number;      // vertical shelves
  depth: number;       // rows back (−z)
  cell: number;        // cell size (x/z)
  levelH: number;      // vertical step
  alongZ?: boolean;
  /** Item scale multiplier for this slot. */
  scale: number;
  glowSize: [number, number];
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export const SLOTS: Record<SlotId, SlotDef> = {
  pantry: {
    id: 'pantry',
    center: v(-2.3, 0.01, 0.0), look: v(-2.6, 1.3, 0.2),
    origin: v(-3.3, L.floorT + 0.66, -0.55), cols: 6, levels: 3, depth: 1, cell: .44, levelH: .6, alongZ: true,
    scale: .9, glowSize: [2.4, 3.2],
  },
  'water-corner': {
    id: 'water-corner',
    center: v(-4.75, 0.01, 0.4), look: v(-4.8, .6, .2),
    origin: v(-5.5, L.floorT * 0 + 0.02, 1.4), cols: 3, levels: 1, depth: 5, cell: .6, levelH: .7,
    scale: 1, glowSize: [2.1, 3.4],
  },
  'power-station': {
    id: 'power-station',
    center: v(1.0, 0.01, 0.9), look: v(1.0, .9, .6),
    origin: v(0.05, L.floorT + .78, 0.95), cols: 5, levels: 2, depth: 2, cell: .42, levelH: .5,
    scale: .85, glowSize: [2.6, 2.2],
  },
  'go-bag': {
    id: 'go-bag',
    center: v(2.75, 0.01, 1.4), look: v(2.9, 1.0, 1.4),
    origin: v(2.35, L.floorT + .02, 2.0), cols: 2, levels: 3, depth: 3, cell: .44, levelH: .62,
    scale: .9, glowSize: [1.5, 2.2],
  },
  'tool-wall': {
    id: 'tool-wall',
    center: v(2.3, 0.01, -1.4), look: v(2.6, 1.2, -2.2),
    origin: v(1.55, L.floorT + .02, -2.1), cols: 4, levels: 3, depth: 1, cell: .46, levelH: .64,
    scale: .9, glowSize: [2.0, 1.8],
  },
  'baby-corner': {
    id: 'baby-corner',
    center: v(-2.0, L.h1 + L.floorT + .01, -0.4), look: v(-2.2, L.h1 + 1.0, -1.2),
    origin: v(-3.05, L.h1 + L.floorT * 2 + .02, -1.95), cols: 5, levels: 2, depth: 2, cell: .44, levelH: .6,
    scale: .85, glowSize: [2.6, 2.6],
  },
  'med-cabinet': {
    id: 'med-cabinet',
    center: v(2.0, L.h1 + L.floorT + .01, -0.6), look: v(2.2, L.h1 + 1.3, -1.6),
    origin: v(1.1, L.h1 + L.floorT * 2 + 0.72, -2.05), cols: 5, levels: 3, depth: 1, cell: .4, levelH: .5,
    scale: .78, glowSize: [2.4, 2.4],
  },
};

/** Position for the i-th item in a slot. Fills cols → depth → levels. */
export function slotPosition(slot: SlotDef, i: number): THREE.Vector3 {
  const perLevel = slot.cols * slot.depth;
  const level = Math.floor(i / perLevel) % slot.levels;
  const r = i % perLevel;
  const col = r % slot.cols;
  const dep = Math.floor(r / slot.cols);
  const overflow = Math.floor(i / (perLevel * slot.levels)); // stack again with offset
  const p = slot.origin.clone();
  if (slot.alongZ) {
    p.z += col * slot.cell; p.x += dep * slot.cell * .9;
  } else {
    p.x += col * slot.cell; p.z += dep * slot.cell * .9;
  }
  p.y += level * slot.levelH + overflow * .12;
  p.x += overflow * .05;
  return p;
}

export const MAX_PER_SLOT = 40;
export const DEFAULT_LOOK = v(-1.0, 2.2, 0.2);
/** Camera looks from the front (the cut-away side), slightly right and above. */
export const CAM_DIR = v(0.3, 0.36, 1).normalize();
export const DEFAULT_CAM = { pos: DEFAULT_LOOK.clone().add(CAM_DIR.clone().multiplyScalar(15)), look: DEFAULT_LOOK.clone() };
/** Half-width (world units) the house needs on screen at the look depth. */
const HALF_EXTENT = 6.8;
/** Half-height (world units) that must fit vertically: two floors + roof + a bit of lot. */
const HALF_HEIGHT = 6.0;
export function fovFor(aspect: number): number { return aspect >= 1 ? 32 : Math.min(55, 32 + (1 - aspect) * 34); }
export function fitDistance(aspect: number): number {
  const fov = fovFor(aspect);
  const halfH = Math.tan((fov / 2) * Math.PI / 180);
  const halfW = halfH * aspect;
  return Math.max(12, Math.min(32, Math.max(HALF_EXTENT / halfW, HALF_HEIGHT / halfH)));
}
export function defaultCamera(aspect: number): { pos: THREE.Vector3; look: THREE.Vector3 } {
  const look = DEFAULT_LOOK.clone();
  return { pos: look.clone().add(CAM_DIR.clone().multiplyScalar(fitDistance(aspect))), look };
}
export function focusCamera(slot: SlotDef, aspect: number): { pos: THREE.Vector3; look: THREE.Vector3 } {
  // Portrait: barely move (the house must stay on screen); landscape: lean in a little.
  const portrait = aspect < 1;
  const look = slot.look.clone().lerp(DEFAULT_LOOK, portrait ? 0.75 : 0.5);
  return { pos: look.clone().add(CAM_DIR.clone().multiplyScalar(fitDistance(aspect) * (portrait ? 0.97 : 0.9))), look };
}
