// Manila Maps — app entry. Splash → open the offline map (installing it on first
// run) → map UI. Web build opened from Files asks for the .mmap once.
import './styles/app.css';
import { MapStore } from './core/mapstore.js';
import { Splash, showWelcome, showError } from './ui/screens.js';
import { startApp } from './ui/app.js';

const root = document.getElementById('app');

// Expose safe-area insets as numbers for JS layout maths.
function syncInsets() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom) 0;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  document.documentElement.style.setProperty('--sat', cs.paddingTop);
  document.documentElement.style.setProperty('--sab', cs.paddingBottom);
  probe.remove();
}

async function boot() {
  syncInsets();
  const splash = new Splash(root);
  let bundle;
  try {
    bundle = await MapStore.open((p) => splash.progress(p));
  } catch (e) {
    splash.el.remove();
    if (e?.code === 'NEED_FILE') {
      showWelcome(root, { onPick: (onProgress) => MapStore.importBackup(onProgress) });
    } else {
      console.error(e);
      showError(root, e, { onRetry: boot });
    }
    return;
  }
  try {
    splash.message('Loading map…');
    await startApp(root, bundle);
    splash.hide();
  } catch (e) {
    console.error(e);
    splash.el.remove();
    root.querySelector('.app')?.remove();
    showError(root, e, { onRetry: boot });
  }
}

window.addEventListener('resize', syncInsets);
boot();
