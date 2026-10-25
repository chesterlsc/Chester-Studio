import type { Tier } from './types';

export interface TierDef {
  id: Tier;
  price: { monthly?: number; yearly?: number }; // PHP
  limits: { households: number; locations: number; guideLevels: Array<'basic' | 'intermediate' | 'pro'>; printable: boolean; familyShare: boolean; cloud: boolean };
}

export const TIERS: Record<Tier, TierDef> = {
  guest: { id: 'guest', price: {}, limits: { households: 1, locations: 1, guideLevels: ['basic'], printable: false, familyShare: false, cloud: false } },
  free: { id: 'free', price: {}, limits: { households: 1, locations: 1, guideLevels: ['basic'], printable: false, familyShare: false, cloud: true } },
  plus: { id: 'plus', price: { monthly: 99, yearly: 799 }, limits: { households: 5, locations: 3, guideLevels: ['basic', 'intermediate', 'pro'], printable: true, familyShare: true, cloud: true } },
};

/** Payments are off at launch: nobody is 'plus' unless a flag says so. */
export const PAYMENTS_ENABLED = false;

export function canAccessLevel(tier: Tier, level: 'basic' | 'intermediate' | 'pro'): boolean {
  // Life-safety info is always free: Basic is open to everyone, and every
  // guide's "when to get help" block renders regardless of tier.
  return TIERS[tier].limits.guideLevels.includes(level);
}
