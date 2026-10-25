import type { ScenarioId, ScenarioProfile } from './types';

export const SCENARIO_ORDER: ScenarioId[] = [
  'typhoon', 'flood', 'heat', 'brownout', 'water', 'earthquake', 'unrest', 'zombie',
];

export const SCENARIOS: Record<ScenarioId, ScenarioProfile> = {
  typhoon: {
    id: 'typhoon',
    weights: { water: 3, food: 3, power: 2.5, medicine: 2, shelter: 2, comms: 2, hygiene: 1.5, cash: 1, edc: 1, baby: 1.5, pets: 1, security: .5, canning: .5 },
    critical: ['water', 'food', 'power'],
    waterLpd: 4, foodFactor: 1,
    weather: 'rain', hue: '#4f7cff', game: false,
  },
  flood: {
    id: 'flood',
    weights: { water: 3, food: 2.5, comms: 2.5, shelter: 2, medicine: 2, hygiene: 2, edc: 2, cash: 1.5, power: 1.5, baby: 1.5, pets: 1, security: .5, canning: .5 },
    critical: ['water', 'food', 'hygiene'],
    waterLpd: 4, foodFactor: 1,
    weather: 'flood', hue: '#3aa7c9', game: false,
  },
  heat: {
    id: 'heat',
    weights: { water: 4, power: 2, medicine: 2, food: 1.5, hygiene: 1.5, shelter: 1, baby: 1.5, pets: 1.5, comms: .5, cash: .5, edc: .5, security: .3, canning: .5 },
    critical: ['water', 'power'],
    waterLpd: 5.5, foodFactor: .9,
    weather: 'heat', hue: '#ff9a3d', game: false,
  },
  brownout: {
    id: 'brownout',
    weights: { power: 4, food: 2.5, water: 2, comms: 2, cash: 1.5, medicine: 1.5, hygiene: 1, canning: 1, baby: 1, pets: .5, edc: .5, shelter: .5, security: .5 },
    critical: ['power', 'food', 'water'],
    waterLpd: 3.5, foodFactor: 1,
    weather: 'dark', hue: '#ffd23f', game: false,
  },
  water: {
    id: 'water',
    weights: { water: 5, hygiene: 3, food: 1.5, medicine: 1.5, baby: 1.5, pets: 1, power: .5, comms: .5, cash: .5, edc: .3, shelter: .3, security: .3, canning: .5 },
    critical: ['water', 'hygiene'],
    waterLpd: 4.5, foodFactor: .9,
    weather: 'dry', hue: '#56c5ff', game: false,
  },
  earthquake: {
    id: 'earthquake',
    weights: { edc: 3, water: 3, medicine: 3, food: 2, comms: 2.5, shelter: 2.5, power: 1.5, cash: 1.5, hygiene: 1, baby: 1.5, pets: 1, security: .5, canning: .3 },
    critical: ['water', 'medicine', 'edc'],
    waterLpd: 4, foodFactor: 1,
    weather: 'shake', hue: '#c0a070', game: false,
  },
  unrest: {
    id: 'unrest',
    weights: { security: 3, food: 2.5, water: 2.5, cash: 2.5, comms: 2.5, medicine: 2, edc: 2, power: 1.5, shelter: 1.5, hygiene: 1, baby: 1, pets: .5, canning: 1 },
    critical: ['food', 'water', 'security'],
    waterLpd: 4, foodFactor: 1,
    weather: 'dusk', hue: '#9b6bff', game: false,
  },
  zombie: {
    id: 'zombie',
    weights: { security: 3, food: 3, water: 3, medicine: 2.5, edc: 2.5, power: 2, shelter: 2, comms: 1.5, canning: 2, hygiene: 1, cash: .5, baby: 1, pets: 1 },
    critical: ['food', 'water', 'security', 'medicine'],
    waterLpd: 4, foodFactor: 1.1,
    weather: 'fog', hue: '#5cff8a', game: true,
  },
};
