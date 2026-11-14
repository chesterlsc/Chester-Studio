// Section → part, color and icon. Colors live in tokens.css as --part-N vars.
export type SectionKey =
  | 'water' | 'food' | 'cooking' | 'shelter' | 'fire' | 'power' | 'tools'
  | 'medicine' | 'herbal' | 'hygiene' | 'kids' | 'women' | 'elderly' | 'pets'
  | 'security' | 'salvage' | 'trade' | 'navigation' | 'radio' | 'mind' | 'community' | 'strategy';

export const PARTS: Record<number, { name: string; short: string }> = {
  1: { name: 'Water', short: 'Water' },
  2: { name: 'Food', short: 'Food' },
  3: { name: 'Shelter & Energy', short: 'Shelter' },
  4: { name: 'Health', short: 'Health' },
  5: { name: 'Family & Care', short: 'Family' },
  6: { name: 'Safety & Resources', short: 'Safety' },
  7: { name: 'Find Your Way', short: 'Wayfinding' },
  8: { name: 'Mind & Future', short: 'Future' },
};

export const SECTIONS: Record<SectionKey, { title: string; part: number; icon: string }> = {
  water: { title: 'Water', part: 1, icon: 'water' },
  food: { title: 'Food & farming', part: 2, icon: 'food' },
  cooking: { title: 'Cooking & preservation', part: 2, icon: 'cooking' },
  shelter: { title: 'Shelter & building', part: 3, icon: 'shelter' },
  fire: { title: 'Fire & heat', part: 3, icon: 'fire' },
  power: { title: 'Power alternatives', part: 3, icon: 'power' },
  tools: { title: 'Tools & DIY', part: 3, icon: 'tools' },
  medicine: { title: 'Medicine & first aid', part: 4, icon: 'medicine' },
  herbal: { title: 'Herbal & field medicine', part: 4, icon: 'herbal' },
  hygiene: { title: 'Hygiene & sanitation', part: 4, icon: 'hygiene' },
  kids: { title: 'Babies & kids', part: 5, icon: 'kids' },
  women: { title: "Women's health", part: 5, icon: 'women' },
  elderly: { title: 'Elderly care', part: 5, icon: 'elderly' },
  pets: { title: 'Dogs & pets', part: 5, icon: 'pets' },
  security: { title: 'Home security', part: 6, icon: 'security' },
  salvage: { title: 'Scavenging & salvage', part: 6, icon: 'salvage' },
  trade: { title: 'Trade & barter', part: 6, icon: 'trade' },
  navigation: { title: 'Navigation', part: 7, icon: 'navigation' },
  radio: { title: 'Communication', part: 7, icon: 'radio' },
  mind: { title: 'Mental health', part: 8, icon: 'mind' },
  community: { title: 'Community & leadership', part: 8, icon: 'community' },
  strategy: { title: '30-year strategy', part: 8, icon: 'strategy' },
};
