import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

// BASE lets the book live under a sub-path (e.g. /offgrid-30/) on any static host.
export default defineConfig({
  site: process.env.SITE || 'https://example.org',
  base: process.env.BASE || '/',
  trailingSlash: 'always',
  integrations: [mdx(), react({ include: ['**/three/**'] })],
  build: { inlineStylesheets: 'auto' },
  vite: { build: { chunkSizeWarningLimit: 900 } },
});
