// Manila Maps — app entry. Splash → open the offline map (installing it on first
// run) → map UI. Web build opened from Files asks for the .mmap once.
import './styles/app.css';
import { MapStore } from './core/mapstore.js';
import { Splash, showWelcome, showError } from './ui/screens.js';
import { startApp } from './ui/app.js';

const root = document.getElementById('app');

// Resolve the safe-area insets (CSS vars) to pixels for JS layout maths.
function syncInsets() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;padding:var(--sat) 0 var(--sab) 0;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  window.__insets = { top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0 };
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
      showWelcome(root, {
        onPick: (onProgress) => MapStore.importBackup(onProgress),
        onDownload: e.canDownload ? (onProgress) => MapStore.download(onProgress) : null,
        onReady: boot,
      });
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

// Installable web app (iPhone/iPad/Mac): cache the app files so it opens with no internet.
if (import.meta.env.MODE === 'pwa' && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'all' }).catch(() => {});
}
boot();
