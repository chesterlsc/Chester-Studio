// Device helpers: voice prompts, keep-awake, haptics. All guarded — failures are silent.
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const isNative = Capacitor.isNativePlatform();
const LS_MUTE = 'mm.voiceMuted';

function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } }

export const Voice = {
  muted: lsGet(LS_MUTE) === '1',
  available: isNative || (typeof window !== 'undefined' && 'speechSynthesis' in window),

  setMuted(m) {
    this.muted = !!m;
    lsSet(LS_MUTE, m ? '1' : '0');
    if (m) this.stop();
  },

  async speak(text) {
    if (this.muted || !text) return;
    try {
      if (isNative) {
        await TextToSpeech.speak({ text, lang: 'en-US', rate: 1.0, pitch: 1.0, volume: 1.0, category: 'playback', queueStrategy: 0 });
      } else if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    } catch { /* no TTS engine: stay quiet */ }
  },

  stop() {
    try {
      if (isNative) TextToSpeech.stop().catch(() => {});
      else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch { /* ignore */ }
  },
};

let wakeLock = null;
export const Awake = {
  async on() {
    try {
      if (isNative) { await KeepAwake.keepAwake(); return; }
      if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    } catch { /* ignore */ }
  },
  async off() {
    try {
      if (isNative) { await KeepAwake.allowSleep(); return; }
      await wakeLock?.release();
      wakeLock = null;
    } catch { /* ignore */ }
  },
};

export function tap(style = 'light') {
  if (!isNative) return;
  try {
    Haptics.impact({ style: style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => {});
  } catch { /* ignore */ }
}
