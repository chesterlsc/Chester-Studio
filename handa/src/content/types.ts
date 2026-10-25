import type { ScenarioId } from '@/domain/types';

/** Bilingual string. Simple words. Taglish OK in tl. */
export type L = { en: string; tl: string };

export type GuideLevel = 'basic' | 'intermediate' | 'pro';
export type GuideSection =
  | 'learn'      // core preparedness
  | 'diy'        // water filtering, rain catchment, canning, solar, storm-proofing, lights
  | 'workout'    // preparedness fitness
  | 'tips'       // quick wins
  | 'firstaid'   // first aid & home care (flagged for professional review)
  | 'baby'       // baby & child
  | 'safety';    // staying safe from people with bad intentions

export interface QuizQuestion {
  q: L;
  choices: L[];
  /** index into choices */
  answer: number;
  why: L;
}

export interface GuideCard {
  /** One idea per card. 1 short heading + 1–3 short lines. */
  title: L;
  body: L;
  /** Optional one-line "do this now". */
  action?: L;
  /** Icon name from the HANDA icon set (see src/design/icons/names.ts). */
  icon?: string;
}

export interface Guide {
  id: string;
  section: GuideSection;
  level: GuideLevel;
  title: L;
  blurb: L;
  /** Estimated seconds to read: 30–90. */
  seconds: number;
  scenarios: ScenarioId[];
  cards: GuideCard[];
  quiz: QuizQuestion[];
  /** Official sources to link out to (NDRRMC, PAGASA, DOH, PRC, PHIVOLCS...). */
  sources: Array<{ label: string; url: string }>;
  /** Health pages: forces the "for review by a licensed professional" banner and the when-to-get-help block. */
  health?: { whenToGetHelp: L[] };
}

export interface Hotline {
  region: string;          // e.g. 'National', 'NCR', 'Region VII'
  city?: string;
  org: L;
  numbers: string[];
  url?: string;
}

export interface AffiliateLink {
  /** Matches CatalogItem.buy */
  slug: string;
  shopee?: string;
  lazada?: string;
  tiktok?: string;
  amazon?: string;
}
