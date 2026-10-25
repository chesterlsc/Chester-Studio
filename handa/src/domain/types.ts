/** Core domain types. Everything else imports from here. */

export type ScenarioId =
  | 'typhoon' | 'flood' | 'heat' | 'brownout' | 'water' | 'earthquake' | 'unrest' | 'zombie';

export type DurationId = '1d' | '1w' | '1m' | '1y';
export const DURATION_DAYS: Record<DurationId, number> = { '1d': 1, '1w': 7, '1m': 30, '1y': 365 };

export type CategoryId =
  | 'water' | 'food' | 'canning' | 'medicine' | 'baby' | 'power' | 'shelter'
  | 'hygiene' | 'comms' | 'cash' | 'edc' | 'pets' | 'security';

export const CATEGORIES: CategoryId[] = [
  'water', 'food', 'canning', 'medicine', 'baby', 'power', 'shelter',
  'hygiene', 'comms', 'cash', 'edc', 'pets', 'security',
];

/** Where things live in the 3D house. */
export type SlotId =
  | 'pantry'        // kitchen shelves: food, canning
  | 'water-corner'  // yard / kitchen floor: drums, gallons
  | 'med-cabinet'   // CR wall: medicine, hygiene
  | 'power-station' // sala table: lights, batteries, radio
  | 'go-bag'        // by the door: edc, docs, cash
  | 'baby-corner'   // bedroom: baby, pets
  | 'tool-wall'     // under the stairs: shelter & repair, security
  ;

export const CATEGORY_SLOT: Record<CategoryId, SlotId> = {
  water: 'water-corner',
  food: 'pantry',
  canning: 'pantry',
  medicine: 'med-cabinet',
  baby: 'baby-corner',
  power: 'power-station',
  shelter: 'tool-wall',
  hygiene: 'med-cabinet',
  comms: 'go-bag',
  cash: 'go-bag',
  edc: 'go-bag',
  pets: 'baby-corner',
  security: 'tool-wall',
};

export type Unit = 'L' | 'pc' | 'pack' | 'can' | 'kg' | 'set' | 'pair' | 'roll' | 'bottle' | 'jar' | 'php';

/** Procedural 3D shape used to render the item in the house. */
export type ItemShape =
  | 'bottle' | 'gallon' | 'drum' | 'can' | 'sack' | 'box' | 'pouch' | 'jar'
  | 'lamp' | 'battery' | 'radio' | 'powerbank' | 'panel' | 'bag' | 'kit' | 'roll'
  | 'rope' | 'tarp' | 'tool' | 'cash' | 'doc' | 'bowl' | 'whistle' | 'mask' | 'lock';

export interface CatalogItem {
  id: string;
  category: CategoryId;
  /** i18n keys live in content; names here are fallback EN/TL. */
  name: { en: string; tl: string };
  unit: Unit;
  /** How many person-days one unit covers in this category (where it makes sense). */
  personDaysPerUnit?: number;
  /** For checklist items: how many are needed per household (not per person). */
  neededPerHousehold?: number;
  /** For per-person checklist items: how many are needed per person. */
  neededPerPerson?: number;
  /** If set, the needed amount is per this many days (consumables scale with duration). */
  perDays?: number;
  /** Only relevant when these household members exist. */
  requires?: Array<'babies' | 'kids' | 'seniors' | 'pets'>;
  /** Scenario relevance boost (default 1). */
  scenarioWeight?: Partial<Record<ScenarioId, number>>;
  shape: ItemShape;
  /** Typical shelf life in days, used to prefill expiry. */
  shelfLifeDays?: number;
  /** Default quantity added per tap. */
  step?: number;
  /** Affiliate search slugs (resolved against the affiliate table). */
  buy?: string;
  /** Short why-it-matters (EN/TL). */
  tip?: { en: string; tl: string };
}

export interface Household {
  id: string;
  name: string;
  adults: number;
  kids: number;     // 2–12
  babies: number;   // 0–2
  seniors: number;  // 60+
  pets: number;
  specialNeeds: string[]; // free text tags: 'maintenance meds', 'wheelchair', ...
  region?: string;
  city?: string;
  createdAt: number;
  updatedAt: number;
  userId?: string;
}

export interface Run {
  id: string;
  householdId: string;
  scenario: ScenarioId;
  duration: DurationId;
  startedAt: number;
  finishedAt?: number;
  readinessPct?: number;
  daysCovered?: number;
  updatedAt: number;
  userId?: string;
}

export interface InventoryRow {
  id: string;
  householdId: string;
  /** Items belong to the household; a run just reads them. */
  catalogId: string;
  qty: number;
  unit: Unit;
  expiresAt?: number;
  slot: SlotId;
  note?: string;
  createdAt: number;
  updatedAt: number;
  userId?: string;
}

export interface Score {
  id: string;
  runId: string;
  householdId: string;
  scenario: ScenarioId;
  duration: DurationId;
  pct: number;
  daysCovered: number;
  categories: Partial<Record<CategoryId, number>>;
  at: number;
  updatedAt: number;
  userId?: string;
}

export interface SurveyAnswer {
  id: string;
  answers: Record<string, string | number>;
  at: number;
  updatedAt: number;
  userId?: string;
}

export interface ScenarioProfile {
  id: ScenarioId;
  /** Category weight for the readiness score (sum need not be 1). */
  weights: Partial<Record<CategoryId, number>>;
  /** Which categories count for "days you can last". */
  critical: CategoryId[];
  /** Water L/person/day; food kcal/person/day modifiers. */
  waterLpd: number;
  foodFactor: number;
  weather: 'rain' | 'flood' | 'heat' | 'dark' | 'dry' | 'shake' | 'dusk' | 'fog';
  hue: string; // CSS color for the scenario sky/accent
  game: boolean;
}

export type Tier = 'guest' | 'free' | 'plus';

export interface Readiness {
  pct: number;
  daysCovered: number;
  categories: Record<CategoryId, { pct: number; have: number; need: number; relevant: boolean }>;
  missing: CategoryId[];
}
