import type { ScenarioId } from './types';

export interface Kit {
  id: string;
  name: { en: string; tl: string };
  blurb: { en: string; tl: string };
  /** catalogId → qty. Items marked `perPerson` are multiplied by headcount. */
  items: Array<{ id: string; qty: number; perPerson?: boolean }>;
  scenarios: ScenarioId[];
  tier: 'free' | 'plus';
}

export const KITS: Kit[] = [
  {
    id: 'go-bag-72h',
    name: { en: '72-hour go-bag', tl: '72-oras na go-bag' },
    blurb: { en: 'Grab-and-go for 3 days. One per person.', tl: 'Bitbit-at-alis para sa 3 araw. Isa kada tao.' },
    items: [
      { id: 'go-bag', qty: 1, perPerson: true },
      { id: 'water-bottle-1l', qty: 6, perPerson: true },
      { id: 'biscuits', qty: 3, perPerson: true },
      { id: 'canned-sardines', qty: 3, perPerson: true },
      { id: 'first-aid-kit', qty: 1 },
      { id: 'flashlight', qty: 1 },
      { id: 'batteries', qty: 1 },
      { id: 'whistle', qty: 1, perPerson: true },
      { id: 'documents', qty: 1 },
      { id: 'cash-small', qty: 3, perPerson: true },
      { id: 'rain-gear', qty: 1, perPerson: true },
      { id: 'masks-n95', qty: 1 },
      { id: 'hand-sanitizer', qty: 1 },
      { id: 'powerbank', qty: 1 },
    ],
    scenarios: ['typhoon', 'flood', 'earthquake', 'unrest', 'zombie'],
    tier: 'free',
  },
  {
    id: 'brownout-kit',
    name: { en: 'Brownout kit', tl: 'Brownout kit' },
    blurb: { en: 'Light, power and no-cook food for a dark night or three.', tl: 'Ilaw, power, at pagkaing hindi na lulutuin para sa ilang gabi.' },
    items: [
      { id: 'flashlight', qty: 2 },
      { id: 'headlamp', qty: 1 },
      { id: 'batteries', qty: 2 },
      { id: 'powerbank', qty: 1 },
      { id: 'rechargeable-fan', qty: 1 },
      { id: 'radio', qty: 1 },
      { id: 'extension-cord', qty: 1 },
      { id: 'biscuits', qty: 2, perPerson: true },
      { id: 'canned-meat', qty: 2, perPerson: true },
      { id: 'water-bottle-1l', qty: 4, perPerson: true },
      { id: 'butane-stove', qty: 1 },
      { id: 'cash-small', qty: 2, perPerson: true },
    ],
    scenarios: ['brownout', 'typhoon', 'heat'],
    tier: 'free',
  },
  {
    id: 'baby-kit',
    name: { en: 'Baby kit', tl: 'Baby kit' },
    blurb: { en: 'A week of milk, diapers and calm.', tl: 'Isang linggong gatas, diaper, at kalma.' },
    items: [
      { id: 'formula', qty: 2 },
      { id: 'diapers', qty: 2 },
      { id: 'wipes', qty: 2 },
      { id: 'kids-meds', qty: 1 },
      { id: 'bottles-sterile', qty: 1 },
      { id: 'comfort-item', qty: 1 },
      { id: 'water-bottle-1l', qty: 12 },
      { id: 'ors', qty: 2 },
    ],
    scenarios: ['typhoon', 'flood', 'brownout', 'heat', 'water', 'earthquake', 'unrest', 'zombie'],
    tier: 'free',
  },
  {
    id: 'water-week',
    name: { en: 'Water-interruption week', tl: 'Isang linggong walang tubig' },
    blurb: { en: 'Drinking, washing and flushing for 7 days.', tl: 'Pang-inom, panghugas, at pang-flush para sa 7 araw.' },
    items: [
      { id: 'water-gallon-5', qty: 2, perPerson: true },
      { id: 'water-drum', qty: 1 },
      { id: 'water-purifier-tabs', qty: 1 },
      { id: 'bucket', qty: 1 },
      { id: 'hand-sanitizer', qty: 2 },
      { id: 'wipes', qty: 2 },
      { id: 'trash-bags', qty: 1 },
      { id: 'bleach', qty: 1 },
    ],
    scenarios: ['water', 'heat', 'flood', 'typhoon'],
    tier: 'free',
  },
  {
    id: 'fortress',
    name: { en: 'Fortress week (unrest / zombie)', tl: 'Fortress week (gulo / zombie)' },
    blurb: { en: 'Stay in, stay quiet, stay stocked.', tl: 'Manatili sa loob, tahimik, at kumpleto.' },
    items: [
      { id: 'door-lock', qty: 2 },
      { id: 'blackout-curtain', qty: 3 },
      { id: 'plywood', qty: 4 },
      { id: 'fire-extinguisher', qty: 1 },
      { id: 'rice-kg', qty: 5 },
      { id: 'canned-sardines', qty: 12 },
      { id: 'canned-beans', qty: 8 },
      { id: 'water-drum', qty: 1 },
      { id: 'radio', qty: 1 },
      { id: 'first-aid-kit', qty: 1 },
      { id: 'cash-small', qty: 7, perPerson: true },
    ],
    scenarios: ['unrest', 'zombie'],
    tier: 'plus',
  },
];
