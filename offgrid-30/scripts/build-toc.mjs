// Builds src/data/toc.json from docs/PLAN.md so navigation never drifts from the plan.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const plan = readFileSync(resolve(root, 'docs/PLAN.md'), 'utf8').split('\n');

const SECTION_KEYS = {
  'Water': 'water',
  'Food & farming': 'food',
  'Cooking & preservation': 'cooking',
  'Shelter & building': 'shelter',
  'Fire & heat': 'fire',
  'Power alternatives': 'power',
  'Tools & DIY': 'tools',
  'Medicine & first aid': 'medicine',
  'Herbal & field medicine': 'herbal',
  'Hygiene & sanitation': 'hygiene',
  'Babies & kids': 'kids',
  "Women's health & hygiene": 'women',
  'Elderly care': 'elderly',
  'Dogs & pets': 'pets',
  'Home security & defense': 'security',
  'Scavenging & salvage (abandoned / legal)': 'salvage',
  'Trade & barter': 'trade',
  'Navigation': 'navigation',
  'Communication (radio)': 'radio',
  'Mental health': 'mind',
  'Community & leadership': 'community',
  '30-year long-term strategy': 'strategy',
};

export const slugify = (s) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const toc = { parts: [], chapters: [] };
let part = null, section = null, chapter = null, inToc = false;

for (const line of plan) {
  if (line.startsWith('## 6. Full table of contents')) inToc = true;
  if (!inToc) continue;
  let m;
  if ((m = line.match(/^## PART (\d+) — (.+?) \(/))) {
    part = { n: +m[1], title: m[2], sections: [] };
    toc.parts.push(part);
  } else if ((m = line.match(/^### Section: (.+)$/))) {
    const key = SECTION_KEYS[m[1].trim()];
    if (!key) throw new Error(`Unknown section: ${m[1]}`);
    section = { key, title: m[1].replace(/ \(.*\)$/, ''), part: part.n, chapters: [] };
    part.sections.push(section);
  } else if ((m = line.match(/^\*\*Ch (\d+)\. (.+)\*\*$/))) {
    const n = +m[1];
    chapter = { n, title: m[2], slug: `${String(n).padStart(2, '0')}-${slugify(m[2])}`, section: section.key, part: part.n, pages: [] };
    section.chapters.push(n);
    toc.chapters.push(chapter);
  } else if (chapter && (m = line.match(/^(\d)\. (.+)$/))) {
    const p = +m[1];
    const has3d = m[2].includes('[3D]');
    const title = m[2].replace(/\s*\*\*\[3D\]\*\*/, '').trim();
    chapter.pages.push({ id: `${chapter.n}.${p}`, p, title, has3d, slug: `${String(p).padStart(2, '0')}-${slugify(title)}` });
    if (p === 9) {
      chapter.pages.push({ id: `${chapter.n}.10`, p: 10, title: 'Review: checklist, quiz & references', has3d: false, slug: '10-review', review: true });
    }
  }
}

if (toc.chapters.length !== 105) throw new Error(`Expected 105 chapters, got ${toc.chapters.length}`);
for (const c of toc.chapters) if (c.pages.length !== 10) throw new Error(`Ch ${c.n} has ${c.pages.length} pages`);

const out = resolve(root, 'src/data/toc.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(toc, null, 1));
console.log(`toc.json: ${toc.parts.length} parts, ${toc.chapters.length} chapters, ${toc.chapters.length * 10} pages`);
