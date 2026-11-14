import { getCollection } from 'astro:content';
/** IDs of pages that have been written (exist as MDX). */
export async function availableIds() {
  const pages = await getCollection('pages');
  return new Set(pages.map((p) => p.data.id));
}
