import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One MDX file per book page: src/content/pages/<chapter-slug>/<page-slug>.mdx
const pages = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/pages' }),
  schema: z.object({
    id: z.string().regex(/^\d+\.\d+$/),
    chapter: z.number().int().min(1).max(105),
    page: z.number().int().min(1).max(10),
    section: z.string(),
    title: z.string().max(60),
    why: z.string().max(110),
    tags: z.array(z.string()).default([]),
    visual: z.object({
      type: z.enum(['svg', 'image', '3d']),
      alt: z.string(),
    }).optional(),
    sources: z.array(z.string()).default([]),
    seeAlso: z.array(z.string()).default([]),
    status: z.enum(['draft', 'checked', 'done']).default('draft'),
    lastChecked: z.coerce.date().optional(),
  }),
});

export const collections = { pages };
