// Full-screen startup states: splash, first-time welcome (web build), error.
import { html, esc, fmtBytes } from './dom.js';
import { logoSvg } from '../assets/icons.js';

const PHASE = {
  copy: 'Installing offline map…',
  download: 'Downloading map…',
  verify: 'Checking map data…',
  install: 'Saving map to this device…',
};

function progressText(p) {
  const label = PHASE[p?.phase] || 'Preparing offline map…';
  if (p?.total) return `${label} ${Math.floor((p.loaded / p.total) * 100)}%`;
  return label;
}

export class Splash {
  constructor(root) {
    this.el = html(`
      <div class="screen splash">
        <div class="splash-brand">
          <div class="splash-logo">${logoSvg(88)}</div>
          <h1>Manila Maps</h1>
          <p class="by">by Chester Studio</p>
        </div>
        <div class="splash-status">
          <div class="progress indeterminate"><div class="progress-bar"></div></div>
          <p class="splash-msg">Preparing offline map…</p>
          <p class="splash-sub">Works fully offline · Metro Manila</p>
        </div>
      </div>`);
    root.appendChild(this.el);
    this.bar = this.el.querySelector('.progress');
    this.msg = this.el.querySelector('.splash-msg');
  }

  progress(p) {
    this.msg.textContent = progressText(p);
    if (p?.total) {
      this.bar.classList.remove('indeterminate');
      this.bar.firstElementChild.style.width = `${Math.min(100, (p.loaded / p.total) * 100)}%`;
    }
  }

  message(text) { this.msg.textContent = text; }

  hide() {
    this.el.classList.add('fade-out');
    setTimeout(() => this.el.remove(), 450);
  }
}

function isStandalone() {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  } catch { return false; }
}

function installHint() {
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
  const mac = /Macintosh/.test(ua) && !iOS;
  if (iOS) return 'Install first so the map is kept for good: tap <b>Share</b> → <b>Add to Home Screen</b>, then open Manila Maps from your Home Screen and download the map there.';
  if (mac) return 'Install first so the map is kept for good: in Safari choose <b>File → Add to Dock</b> (in Chrome: <b>Install</b> in the address bar), then open Manila Maps from the Dock and download the map there.';
  return 'Tip: install the app first (browser menu → <b>Install app</b> / <b>Add to Home screen</b>), then download the map inside it.';
}

/** First run of a web build: download the map (hosted app) or open a .mmap from Files. */
export function showWelcome(root, { onPick, onDownload, onReady, downloadBytes }) {
  const hosted = !!onDownload;
  const mb = downloadBytes ? `${Math.round(downloadBytes / 1e6)} MB` : '';
  const el = html(`
    <div class="screen welcome">
      <div class="welcome-card">
        <div class="splash-logo">${logoSvg(76)}</div>
        <h1>Welcome to Manila Maps</h1>
        ${hosted && !isStandalone() ? `<p class="install-hint">${installHint()}</p>` : ''}
        <p>${hosted
          ? `Download the offline map once${mb ? ` (about ${mb}, Wi-Fi recommended)` : ' (Wi-Fi recommended)'}. It stays on this device until you remove the app — after that everything works with no internet.`
          : 'This offline version needs the map file <b>manila.mmap</b> once. Pick it from your files and it will be kept on this device — no internet needed afterwards.'}</p>
        ${hosted ? `<button class="btn btn-primary btn-block btn-lg" data-a="download">Download map${mb ? ` (${mb})` : ''}</button>` : ''}
        <button class="btn ${hosted ? 'btn-soft' : 'btn-primary btn-lg'} btn-block" data-a="pick">${hosted ? 'I have the map file (.mmap)' : 'Open map file (.mmap)'}</button>
        <div class="welcome-progress" hidden>
          <div class="progress"><div class="progress-bar"></div></div>
          <p class="welcome-msg"></p>
        </div>
        <p class="welcome-error" hidden></p>
        <p class="fine">Map data © OpenStreetMap contributors (ODbL)</p>
      </div>
    </div>`);
  root.appendChild(el);
  const btns = [...el.querySelectorAll('[data-a]')];
  const prog = el.querySelector('.welcome-progress');
  const bar = prog.querySelector('.progress-bar');
  const msg = prog.querySelector('.welcome-msg');
  const err = el.querySelector('.welcome-error');
  const run = async (action) => {
    err.hidden = true;
    btns.forEach((b) => { b.disabled = true; });
    const onProgress = (p) => {
      prog.hidden = false;
      msg.textContent = progressText(p) + (p?.total ? ` (${fmtBytes(p.loaded || 0)} of ${fmtBytes(p.total)})` : '');
      if (p?.total) bar.style.width = `${Math.min(100, ((p.loaded || 0) / p.total) * 100)}%`;
    };
    try {
      const r = await action(onProgress);
      if (r?.ok) {
        msg.textContent = 'Map ready. Opening…';
        bar.style.width = '100%';
        // Open right away (no reload): on file:// the browser may only keep the file for this session.
        setTimeout(() => { el.remove(); onReady(); }, 250);
        return;
      }
      if (!r?.cancelled) { err.textContent = r?.error || 'That did not work. Please try again.'; err.hidden = false; }
    } catch (e) {
      err.textContent = e?.message || String(e);
      err.hidden = false;
    }
    prog.hidden = true;
    btns.forEach((b) => { b.disabled = false; });
  };
  el.querySelector('[data-a="pick"]').addEventListener('click', () => run(onPick));
  el.querySelector('[data-a="download"]')?.addEventListener('click', () => run(onDownload));
  return el;
}

export function showError(root, error, { onRetry }) {
  const el = html(`
    <div class="screen welcome">
      <div class="welcome-card">
        <div class="splash-logo">${logoSvg(64)}</div>
        <h1>Something went wrong</h1>
        <p>The offline map couldn’t be opened.</p>
        <p class="error-detail">${esc(error?.message || String(error))}</p>
        <button class="btn btn-primary btn-block btn-lg" data-a="retry">Try again</button>
      </div>
    </div>`);
  root.appendChild(el);
  el.querySelector('[data-a="retry"]').addEventListener('click', () => { el.remove(); onRetry(); });
  return el;
}
