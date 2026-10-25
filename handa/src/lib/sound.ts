import { useSettings } from '@/store/useSettings';

/** Tiny synthesized sounds. No audio files. Off by default. */
let ctx: AudioContext | null = null;
function ac(): AudioContext | null {
  if (!useSettings.getState().sound) return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch { return null; }
}
function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.08, when = 0) {
  const c = ac(); if (!c) return;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime + when);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + when + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + when + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + when); o.stop(c.currentTime + when + dur + 0.02);
}
export const sfx = {
  tap: () => tone(520, 0.08, 'triangle', 0.05),
  drop: () => { tone(220, 0.12, 'square', 0.04); tone(440, 0.1, 'triangle', 0.05, 0.05); },
  pop: () => { tone(660, 0.09, 'triangle', 0.06); tone(990, 0.12, 'sine', 0.05, 0.06); },
  complete: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.06, i * 0.09)); },
  win: () => { [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.22, 'triangle', 0.06, i * 0.1)); },
  warn: () => tone(180, 0.2, 'sawtooth', 0.04),
};
