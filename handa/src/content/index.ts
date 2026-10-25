import type { Guide, GuideLevel, GuideSection } from './types';
import { GUIDES } from './guides';

export * from './types';
export { GUIDES } from './guides';
export { HOTLINES, REGIONS, hotlinesByRegion } from './hotlines';
export { AFFILIATES, AFFILIATE_DISCLOSURE, linksFor } from './affiliates';

const byId = new Map(GUIDES.map((g) => [g.id, g]));

export function guidesBySection(section: GuideSection): Guide[] {
  return GUIDES.filter((g) => g.section === section);
}

export function guideById(id: string): Guide | undefined {
  return byId.get(id);
}

export function guidesByLevel(level: GuideLevel): Guide[] {
  return GUIDES.filter((g) => g.level === level);
}

/** The "Basic" deck: every basic-level guide across all sections. */
export function basicGuides(): Guide[] {
  return guidesByLevel('basic');
}
