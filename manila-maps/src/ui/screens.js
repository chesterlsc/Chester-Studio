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

/** Shown in the web build opened from Files when no map has been imported yet. */
export function showWelcome(root, { onPick, onReady }) {
  const el = html(`
    <div class="screen welcome">
      <div class="welcome-card">
        <div class="splash-logo">${logoSvg(76)}</div>
        <h1>Welcome to Manila Maps</h1>
        <p>This offline version needs the map file <b>manila.mmap</b> once. Pick it from your files and it will be kept in this browser’s storage — no internet needed afterwards.</p>
        <button class="btn btn-primary btn-block btn-lg" data-a="pick">Open map file (.mmap)</button>
        <div class="welcome-progress" hidden>
          <div class="progress"><div class="progress-bar"></div></div>
          <p class="welcome-msg"></p>
        </div>
        <p class="welcome-error" hidden></p>
        <p class="fine">Map data © OpenStreetMap contributors (ODbL)</p>
      </div>
    </div>`);
  root.appendChild(el);
  const btn = el.querySelector('[data-a="pick"]');
  const prog = el.querySelector('.welcome-progress');
  const bar = prog.querySelector('.progress-bar');
  const msg = prog.querySelector('.welcome-msg');
  const err = el.querySelector('.welcome-error');
  btn.addEventListener('click', async () => {
    err.hidden = true;
    btn.disabled = true;
    const onProgress = (p) => {
      prog.hidden = false;
      msg.textContent = progressText(p) + (p?.total ? ` (${fmtBytes(p.total)})` : '');
      if (p?.total) bar.style.width = `${Math.min(100, (p.loaded / p.total) * 100)}%`;
    };
    try {
      const r = await onPick(onProgress);
      if (r?.ok) {
        msg.textContent = 'Map ready. Opening…';
        bar.style.width = '100%';
        // Open right away (no reload): on file:// the browser may only keep the
        // file for this session.
        setTimeout(() => { el.remove(); onReady(); }, 250);
        return;
      }
      if (!r?.cancelled) { err.textContent = r?.error || 'That file could not be opened.'; err.hidden = false; }
    } catch (e) {
      err.textContent = e?.message || String(e);
      err.hidden = false;
    }
    prog.hidden = true;
    btn.disabled = false;
  });
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
