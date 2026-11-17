// Toasts and confirm dialogs.
import { html, esc } from './dom.js';
import { Back } from './back.js';

let toastEl = null;
let toastTimer = 0;

export function toast(msg, { ms = 3200, kind = '' } = {}) {
  if (!toastEl) {
    toastEl = html('<div class="toast" role="status" aria-live="polite"></div>');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.className = `toast show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.className = 'toast'; }, ms);
}

/** Confirm dialog. Resolves true/false. */
export function confirmDialog({ title, message, ok = 'OK', cancel = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    const el = html(`
      <div class="dialog-backdrop">
        <div class="dialog" role="dialog" aria-modal="true">
          <h2>${esc(title)}</h2>
          <p>${esc(message)}</p>
          <div class="dialog-actions">
            ${cancel ? `<button class="btn btn-ghost" data-a="cancel">${esc(cancel)}</button>` : ''}
            <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-a="ok">${esc(ok)}</button>
          </div>
        </div>
      </div>`);
    const done = (v) => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 200);
      Back.pop(onBack);
      resolve(v);
    };
    const onBack = () => done(false);
    el.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a) done(a === 'ok');
      else if (e.target === el && cancel) done(false);
    });
    document.body.appendChild(el);
    Back.push(onBack);
    requestAnimationFrame(() => el.classList.add('show'));
  });
}
