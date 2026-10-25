import type { Hotline } from './types';

/**
 * Widely published PH emergency numbers. Landline numbers are Metro Manila
 * (02) 8-digit format. Short codes (911, 143, 1555...) work nationwide from
 * any network unless noted.
 */
export const HOTLINES: Hotline[] = [
  // ---- National ----
  {
    region: 'National',
    org: { en: 'National Emergency Hotline', tl: 'National Emergency Hotline' },
    numbers: ['911'],
    url: 'https://www.officialgazette.gov.ph',
  },
  {
    region: 'National',
    org: { en: 'NDRRMC Operations Center', tl: 'NDRRMC Operations Center' },
    numbers: ['(02) 8911-1406', '(02) 8912-2665', '(02) 8912-5668'],
    url: 'https://ndrrmc.gov.ph',
  },
  {
    region: 'National',
    org: { en: 'Philippine Red Cross', tl: 'Philippine Red Cross' },
    numbers: ['143', '(02) 8790-2300'],
    url: 'https://redcross.org.ph',
  },
  {
    region: 'National',
    org: { en: 'PAGASA (weather)', tl: 'PAGASA (panahon)' },
    numbers: ['(02) 8284-0800'],
    url: 'https://www.pagasa.dost.gov.ph',
  },
  {
    region: 'National',
    org: { en: 'PHIVOLCS (earthquakes, volcanoes)', tl: 'PHIVOLCS (lindol, bulkan)' },
    numbers: ['(02) 8929-9254'],
    url: 'https://www.phivolcs.dost.gov.ph',
  },
  {
    region: 'National',
    org: { en: 'DOH Health Hotline', tl: 'DOH Health Hotline' },
    numbers: ['1555'],
    url: 'https://doh.gov.ph',
  },
  {
    region: 'National',
    org: { en: 'Bureau of Fire Protection', tl: 'Bureau of Fire Protection (bumbero)' },
    numbers: ['(02) 8426-0219', '(02) 8426-0246'],
  },
  {
    region: 'National',
    org: { en: 'Philippine National Police', tl: 'Philippine National Police (pulis)' },
    numbers: ['117', '(02) 8722-0650'],
  },

  // ---- NCR ----
  {
    region: 'NCR',
    org: { en: 'MMDA (traffic, flooding)', tl: 'MMDA (trapiko, baha)' },
    numbers: ['136'],
  },
  {
    region: 'NCR',
    org: { en: 'Manila Water (East Zone)', tl: 'Manila Water (East Zone)' },
    numbers: ['1627'],
  },
  {
    region: 'NCR',
    org: { en: 'Maynilad (West Zone)', tl: 'Maynilad (West Zone)' },
    numbers: ['1626'],
  },
  {
    region: 'NCR',
    org: { en: 'Meralco (power outages)', tl: 'Meralco (brownout)' },
    numbers: ['16211'],
  },
];

/** PH regions for the profile dropdown (NIR included as the newest region). */
export const REGIONS: string[] = [
  'NCR',
  'CAR',
  'Region I (Ilocos)',
  'Region II (Cagayan Valley)',
  'Region III (Central Luzon)',
  'Region IV-A (CALABARZON)',
  'MIMAROPA',
  'Region V (Bicol)',
  'Region VI (Western Visayas)',
  'NIR (Negros Island)',
  'Region VII (Central Visayas)',
  'Region VIII (Eastern Visayas)',
  'Region IX (Zamboanga Peninsula)',
  'Region X (Northern Mindanao)',
  'Region XI (Davao)',
  'Region XII (SOCCSKSARGEN)',
  'Region XIII (Caraga)',
  'BARMM',
];

export function hotlinesByRegion(region: string): Hotline[] {
  return HOTLINES.filter((h) => h.region === region);
}
