import type { DurationId, ScenarioId } from '@/domain/types';
import { HERO } from './hero.strings';

/**
 * Intro copy (onboarding cinematic, mission select, difficulty, squad, match start, landing hero).
 * Scenario names, durations and household labels keep using the existing i18n keys.
 */
export type IntroLang = 'en' | 'tl';

interface Beat { eyebrow: string; title: string; body: string }

interface IntroStrings {
  beats: [Beat, Beat, Beat];
  tap: string;
  skipAria: string;
  readiness: string;
  titleCard: string;
  titleSub: string;
  step: string;
  of: string;
  mission: string;
  difficulty: string;
  squad: string;
  threat: string;
  threatLevels: [string, string, string, string, string];
  face: string;
  fun: string;
  select: string;
  selected: string;
  tier: string;
  preview: string;
  water: string;
  meals: string;
  days: string;
  people: string;
  forPeople: string;
  tierLine: Record<DurationId, string>;
  tierRank: Record<DurationId, string>;
  roster: string;
  members: string;
  none: string;
  more: string;
  briefing: string;
  needs: string;
  start: string;
  startSub: string;
  starting: string;
  loadingHouse: string;
  tapSkip: string;
  goodLuck: string;
  pressStart: string;
  heroBadge: string;
  faceLines: Record<ScenarioId, [string, string, string]>;
}

export const S: Record<IntroLang, IntroStrings> = {
  en: {
    beats: [
      { eyebrow: 'Tonight', title: 'The storm is coming.', body: 'Signal No. 3 over the city. Wind, rain, and days without power.' },
      { eyebrow: 'Lights out', title: 'But the house is ready.', body: 'The pantry is stocked, the water is stored, the go-bag waits by the door.' },
      { eyebrow: 'Your turn', title: 'Handa ka na ba?', body: 'Pick a scenario, stock your house room by room, and see how many days your family can last.' },
    ],
    tap: 'Tap to continue',
    skipAria: 'Skip intro',
    readiness: 'Readiness',
    titleCard: 'HANDA KA NA BA?',
    titleSub: 'Are you ready?',
    step: 'Step',
    of: 'of',
    mission: 'Mission select',
    difficulty: 'Difficulty',
    squad: 'Your squad',
    threat: 'Threat',
    threatLevels: ['Low', 'Moderate', 'High', 'Severe', 'Extreme'],
    face: "What you'll face",
    fun: 'Fun',
    select: 'Select',
    selected: 'Selected',
    tier: 'Tier',
    preview: 'Your needs',
    water: 'Water',
    meals: 'Meals',
    days: 'Days',
    people: 'People',
    forPeople: 'for {{n}} in the house',
    tierLine: {
      '1d': 'One night without power. Light, water, a charged phone.',
      '1w': 'The PAGASA standard. Food and water for a week, meds, cash.',
      '1m': 'Roads cut for weeks. Rice sacks, drums, a real medicine cabinet.',
      '1y': 'The Big One. Everything above, stored properly, rotated.',
    },
    tierRank: { '1d': 'Easy', '1w': 'Normal', '1m': 'Hard', '1y': 'Nightmare' },
    roster: 'Roster',
    members: '{{n}} in the house',
    none: 'None',
    more: 'more',
    briefing: 'Mission briefing',
    needs: 'About {{liters}} L of water · {{meals}} meals',
    start: 'START',
    startSub: 'Press start to open the house',
    starting: 'Starting',
    loadingHouse: 'Opening the house',
    tapSkip: 'Tap to skip',
    goodLuck: 'Good luck!',
    ...HERO.en,
    faceLines: {
      typhoon: ['Signal No. 3 winds for a night', '2–4 days without power', 'Roads and shops closed'],
      flood: ['Water rising to the second step', 'Tap water unsafe to drink', 'Stuck at home for days'],
      heat: ['38 °C days, no fan at noon', 'Water rationed in your barangay', 'Seniors and babies at risk'],
      brownout: ['No power for 12–72 hours', 'Fridge food spoils by day 2', 'Phones and lights run dry'],
      water: ['No tap water for 3–7 days', 'Cooking, washing, flushing', 'Long queues at the tanker'],
      earthquake: ['Magnitude 7.2, aftershocks all week', 'Cracked pipes and wires', 'Rescue may take days'],
      unrest: ['Stay indoors for a week', 'Shops shuttered, ATMs down', 'Keep the family calm and fed'],
      zombie: ['Boarded windows, locked doors', 'Weeks without resupply', 'Same skills, more fun'],
    },
  },
  tl: {
    beats: [
      { eyebrow: 'Ngayong gabi', title: 'Paparating ang bagyo.', body: 'Signal No. 3 sa buong lungsod. Hangin, ulan, at ilang araw na walang kuryente.' },
      { eyebrow: 'Brownout', title: 'Pero handa ang bahay.', body: 'Puno ang pantry, nakaimbak ang tubig, nakaabang ang go-bag sa may pinto.' },
      { eyebrow: 'Ikaw naman', title: 'Handa ka na ba?', body: 'Pumili ng scenario, punuin ang bahay kuwarto-kuwarto, at alamin kung ilang araw tatagal ang pamilya mo.' },
    ],
    tap: 'I-tap para magpatuloy',
    skipAria: 'Laktawan ang intro',
    readiness: 'Readiness',
    titleCard: 'HANDA KA NA BA?',
    titleSub: 'Ready ka na?',
    step: 'Hakbang',
    of: 'sa',
    mission: 'Pumili ng misyon',
    difficulty: 'Antas ng hirap',
    squad: 'Ang iyong squad',
    threat: 'Banta',
    threatLevels: ['Mababa', 'Katamtaman', 'Mataas', 'Matindi', 'Pinakamatindi'],
    face: 'Ang haharapin mo',
    fun: 'Fun',
    select: 'Piliin',
    selected: 'Napili',
    tier: 'Antas',
    preview: 'Kailangan mo',
    water: 'Tubig',
    meals: 'Kainan',
    days: 'Araw',
    people: 'Tao',
    forPeople: 'para sa {{n}} sa bahay',
    tierLine: {
      '1d': 'Isang gabing walang kuryente. Ilaw, tubig, charged na phone.',
      '1w': 'Ang pamantayan ng PAGASA. Pagkain at tubig para sa isang linggo, gamot, cash.',
      '1m': 'Ilang linggong sarado ang daan. Sako ng bigas, drum, tunay na gamutan.',
      '1y': 'The Big One. Lahat ng nasa itaas, maayos na nakaimbak at pinapalitan.',
    },
    tierRank: { '1d': 'Madali', '1w': 'Normal', '1m': 'Mahirap', '1y': 'Bangungot' },
    roster: 'Roster',
    members: '{{n}} sa bahay',
    none: 'Wala',
    more: 'pa',
    briefing: 'Briefing ng misyon',
    needs: 'Mga {{liters}} L ng tubig · {{meals}} kainan',
    start: 'START',
    startSub: 'Pindutin ang start para buksan ang bahay',
    starting: 'Sinisimulan',
    loadingHouse: 'Binubuksan ang bahay',
    tapSkip: 'I-tap para laktawan',
    goodLuck: 'Good luck!',
    ...HERO.tl,
    faceLines: {
      typhoon: ['Hangin ng Signal No. 3 magdamag', '2–4 araw na walang kuryente', 'Sarado ang daan at tindahan'],
      flood: ['Tubig hanggang ikalawang baitang', 'Hindi ligtas inumin ang gripo', 'Ilang araw na stuck sa bahay'],
      heat: ['38 °C, walang bentilador sa tanghali', 'Rasyon ng tubig sa barangay', 'Delikado para sa matatanda at sanggol'],
      brownout: ['Walang kuryente ng 12–72 oras', 'Nasisira ang laman ng ref sa ikalawang araw', 'Nauubusan ng charge at ilaw'],
      water: ['Walang tubig sa gripo ng 3–7 araw', 'Pagluluto, paglalaba, pag-flush', 'Mahabang pila sa tanker'],
      earthquake: ['Magnitude 7.2, aftershock buong linggo', 'Sirang tubo at kable', 'Ilang araw bago dumating ang rescue'],
      unrest: ['Manatili sa loob ng isang linggo', 'Sarado ang tindahan, walang ATM', 'Panatilihing kalmado at busog ang pamilya'],
      zombie: ['Nakapakong bintana, nakakandadong pinto', 'Ilang linggong walang resupply', 'Parehong skills, mas masaya'],
    },
  },
};

/** Threat level per scenario, 1..5, used for the poster bars and the match-start card. */
export const THREAT: Record<ScenarioId, 1 | 2 | 3 | 4 | 5> = {
  typhoon: 4, flood: 4, heat: 3, brownout: 2, water: 3, earthquake: 5, unrest: 3, zombie: 5,
};

/** Difficulty rank per duration, 1..4, and its colour. */
export const TIER: Record<DurationId, { rank: 1 | 2 | 3 | 4; color: string }> = {
  '1d': { rank: 1, color: '#3ddc97' },
  '1w': { rank: 2, color: '#ffc247' },
  '1m': { rank: 3, color: '#ff6a1a' },
  '1y': { rank: 4, color: '#ff5d6c' },
};

export function introLang(l: string | undefined): IntroLang { return l === 'tl' ? 'tl' : 'en'; }
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(vars[k] ?? ''));
}
