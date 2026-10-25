import { CATALOG } from '@/domain/catalog';
import type { AffiliateLink, L } from './types';

/**
 * Search URLs (never product links) for every distinct `buy` slug in the
 * catalog. Derived at module load so it can never drift from catalog.ts.
 */
function searchLinks(slug: string): AffiliateLink {
  const q = encodeURIComponent(slug);
  return {
    slug,
    shopee: `https://shopee.ph/search?keyword=${q}`,
    lazada: `https://www.lazada.com.ph/catalog/?q=${q}`,
    tiktok: `https://www.tiktok.com/shop/s/${q}`,
    amazon: `https://www.amazon.com/s?k=${q}`,
  };
}

const slugs: string[] = [];
for (const item of CATALOG) {
  if (item.buy && !slugs.includes(item.buy)) slugs.push(item.buy);
}

export const AFFILIATES: AffiliateLink[] = slugs.map(searchLinks);

const bySlug = new Map(AFFILIATES.map((a) => [a.slug, a]));

export function linksFor(slug: string): AffiliateLink | undefined {
  return bySlug.get(slug);
}

export const AFFILIATE_DISCLOSURE: L = {
  en: 'Some links earn us a small commission. Prices don\'t change for you.',
  tl: 'May maliit na komisyon kami sa ilang link. Hindi nagbabago ang presyo para sa iyo.',
};
