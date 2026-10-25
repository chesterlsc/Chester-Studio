import type { CategoryId, ScenarioId } from '@/domain/types';

export const CAT_COLOR: Record<CategoryId, string> = {
  water: '#4fb8ff', food: '#ffb24a', canning: '#d79a62', medicine: '#ff6f8d', baby: '#c88cff',
  power: '#ffe25a', shelter: '#8fd3a3', hygiene: '#6fe3dc', comms: '#7f9bff', cash: '#a4e86e',
  edc: '#b9c2d6', pets: '#ffa178', security: '#ff8a66',
};

export const HOUSE = {
  wall: '#f4e9d8',
  wallInner: '#fff7ea',
  wallDark: '#e3d2b9',
  floor: '#c98f5c',
  floorDark: '#a9744a',
  floor2: '#d8a877',
  roof: '#2f4b5c',
  roofEdge: '#1f3340',
  trim: '#ffffff',
  door: '#7a4a2a',
  wood: '#8b5a2b',
  shelf: '#a06a3a',
  metal: '#8c97a6',
  glass: '#9fd3ff',
  grass: '#4f9d5a',
  grassDark: '#3f8249',
  path: '#c8c2b5',
  concrete: '#b9b2a6',
  stair: '#b07a48',
  table: '#6d4a2d',
  cabinet: '#e8eef5',
};

export interface Sky { top: string; bottom: string; sun: number; ambient: number; fog?: string; fogNear?: number; fogFar?: number }
export const SKY: Record<ScenarioId, Sky> = {
  typhoon:    { top: '#1b2a4a', bottom: '#4a5f86', sun: .55, ambient: .55 },
  flood:      { top: '#233a52', bottom: '#5b7d94', sun: .6, ambient: .6 },
  heat:       { top: '#ff9a3d', bottom: '#ffd9a0', sun: 1.35, ambient: .75 },
  brownout:   { top: '#07080f', bottom: '#1a1d2b', sun: .12, ambient: .22 },
  water:      { top: '#5aa9d6', bottom: '#d7ecf7', sun: 1.1, ambient: .7 },
  earthquake: { top: '#6d6a60', bottom: '#c9bfa8', sun: .8, ambient: .6 },
  unrest:     { top: '#2a1a45', bottom: '#6b4a8a', sun: .35, ambient: .45 },
  zombie:     { top: '#0d1f17', bottom: '#2f5b45', sun: .4, ambient: .45, fog: '#2f5b45', fogNear: 14, fogFar: 34 },
};
