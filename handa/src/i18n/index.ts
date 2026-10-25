import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import tl from './tl.json';

export type Lang = 'en' | 'tl';
export const LANGS: Lang[] = ['en', 'tl'];

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('handa.lang');
    if (saved === 'en' || saved === 'tl') return saved;
    const nav = navigator.language?.toLowerCase() ?? '';
    if (nav.startsWith('tl') || nav.startsWith('fil')) return 'tl';
  } catch { /* private mode */ }
  return 'en';
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, tl: { translation: tl } },
  lng: initialLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export function setLang(l: Lang) {
  void i18n.changeLanguage(l);
  try { localStorage.setItem('handa.lang', l); } catch { /* ignore */ }
  document.documentElement.lang = l === 'tl' ? 'fil' : 'en';
}

/** Pick a bilingual field by current language. */
export function pick<T extends { en: string; tl: string }>(l: T | undefined): string {
  if (!l) return '';
  return (i18n.language === 'tl' ? l.tl : l.en) || l.en;
}

export default i18n;
