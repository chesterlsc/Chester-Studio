import { create } from 'zustand';
/** Auto-plays the core loop for screen recordings (see /press). */
export const usePresentation = create<{ active: boolean; set: (v: boolean) => void }>((set) => ({ active: false, set: (active) => set({ active }) }));
