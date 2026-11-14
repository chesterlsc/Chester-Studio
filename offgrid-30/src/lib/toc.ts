import toc from '../data/toc.json';
import { url } from './url';

export type TocPage = { id: string; p: number; title: string; has3d: boolean; slug: string; review?: boolean };
export type TocChapter = { n: number; title: string; slug: string; section: string; part: number; pages: TocPage[] };

export const chapters = toc.chapters as TocChapter[];
export const parts = toc.parts as { n: number; title: string; sections: { key: string; title: string; part: number; chapters: number[] }[] }[];

export const getChapter = (n: number) => chapters.find((c) => c.n === n)!;

export const getPage = (id: string) => {
  const [c, p] = id.split('.').map(Number);
  const ch = getChapter(c);
  return ch ? { chapter: ch, page: ch.pages.find((x) => x.p === p)! } : undefined;
};

export const pageHref = (id: string) => {
  const hit = getPage(id);
  return hit ? url(`/c/${hit.chapter.slug}/${hit.page.slug}/`) : '#';
};

/** Flat reading order of every page in the book. */
export const allPages = chapters.flatMap((c) => c.pages.map((p) => ({ ...p, chapter: c })));

export const neighbours = (id: string) => {
  const i = allPages.findIndex((p) => p.id === id);
  return { prev: allPages[i - 1], next: allPages[i + 1] };
};
