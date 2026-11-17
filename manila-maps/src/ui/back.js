// Back navigation: a stack of handlers (topmost runs first). Android hardware back
// via @capacitor/app; Escape on desktop. Empty stack → fallback, then exit.
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

const stack = [];
let fallback = null;

export const Back = {
  push(fn) { stack.push(fn); },
  pop(fn) {
    const i = stack.lastIndexOf(fn);
    if (i >= 0) stack.splice(i, 1);
  },
  /** Called when the stack is empty; return true if handled. */
  setFallback(fn) { fallback = fn; },
  handle() {
    const fn = stack.pop();
    if (fn) { fn(); return true; }
    if (fallback && fallback()) return true;
    return false;
  },
  install() {
    if (Capacitor.isNativePlatform()) {
      App.addListener('backButton', () => {
        if (!Back.handle()) App.exitApp();
      }).catch(() => {});
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') Back.handle();
    });
  },
};
