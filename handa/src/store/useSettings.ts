import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setLang, type Lang } from '@/i18n';

export type Theme = 'dark' | 'light';
export type Motion = 'auto' | 'off';

interface Settings {
  lang: Lang;
  theme: Theme;
  sound: boolean;
  motion: Motion;
  lowData: boolean;
  onboarded: boolean;
  hintsSeen: Record<string, boolean>;
  surveyDone: boolean;
  runsCompleted: number;
  streakDays: number;
  lastActiveDay?: string;
  setLang: (l: Lang) => void;
  setTheme: (t: Theme) => void;
  toggleSound: () => void;
  setMotion: (m: Motion) => void;
  setLowData: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  markHint: (id: string) => void;
  setSurveyDone: (v: boolean) => void;
  bumpRuns: () => void;
  touchStreak: () => void;
}

function applyDom(s: Pick<Settings, 'theme' | 'motion' | 'lowData'>) {
  const root = document.documentElement;
  root.dataset.theme = s.theme;
  root.dataset.motion = s.motion;
  root.dataset.lowdata = s.lowData ? '1' : '0';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', s.theme === 'dark' ? '#0b0d12' : '#f6f7fb');
}

export const useSettings = create<Settings>()(
  persist(
    (set, get) => ({
      lang: 'en',
      theme: 'dark',
      sound: false,
      motion: 'auto',
      lowData: false,
      onboarded: false,
      hintsSeen: {},
      surveyDone: false,
      runsCompleted: 0,
      streakDays: 0,
      setLang: (lang) => { setLang(lang); set({ lang }); },
      setTheme: (theme) => { set({ theme }); applyDom({ ...get(), theme }); },
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      setMotion: (motion) => { set({ motion }); applyDom({ ...get(), motion }); },
      setLowData: (lowData) => { set({ lowData }); applyDom({ ...get(), lowData }); },
      setOnboarded: (onboarded) => set({ onboarded }),
      markHint: (id) => set((s) => ({ hintsSeen: { ...s.hintsSeen, [id]: true } })),
      setSurveyDone: (surveyDone) => set({ surveyDone }),
      bumpRuns: () => set((s) => ({ runsCompleted: s.runsCompleted + 1 })),
      touchStreak: () => {
        const today = new Date().toISOString().slice(0, 10);
        const { lastActiveDay, streakDays } = get();
        if (lastActiveDay === today) return;
        const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        set({ lastActiveDay: today, streakDays: lastActiveDay === y ? streakDays + 1 : 1 });
      },
    }),
    {
      name: 'handa.settings',
      partialize: (s) => ({
        lang: s.lang, theme: s.theme, sound: s.sound, motion: s.motion, lowData: s.lowData,
        onboarded: s.onboarded, hintsSeen: s.hintsSeen, surveyDone: s.surveyDone,
        runsCompleted: s.runsCompleted, streakDays: s.streakDays, lastActiveDay: s.lastActiveDay,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        applyDom(state);
        setLang(state.lang);
      },
    },
  ),
);

/** Low-data or OS-level reduced motion → no fancy motion. */
export function motionAllowed(): boolean {
  const s = useSettings.getState();
  if (s.lowData || s.motion === 'off') return false;
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
