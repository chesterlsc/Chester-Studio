// Home: "Where to?" sheet with quick category chips and recent places.
import { svg } from '../assets/icons.js';
import { html } from './dom.js';
import { CHIPS, resultRow } from './places.js';
import { getRecents, clearRecents } from './recents.js';
import { openSearch } from './search.js';
import { showPlace } from './place.js';
import { tap } from '../nav/device.js';

export function showHome(app) {
  app.overlays.clearPin();
  app.overlays.clearRoute();
  app.setTopOcclusion(0);
  const recents = getRecents();
  const my = app.myPos();
  const el = html(`
    <div class="home">
      <div class="home-peek">
        <button class="searchbar" aria-label="Search">
          ${svg('search', { size: 20 })}<span>Where to?</span>
        </button>
        <div class="chips no-drag">
          ${CHIPS.map((c) => `<button class="chip" data-chip="${c.id}">${svg(c.icon, { size: 16 })}<span>${c.label}</span></button>`).join('')}
        </div>
      </div>
      <div class="home-more">
        ${recents.length ? `
          <div class="section-head"><h3>Recent</h3><button class="link" data-a="clear">Clear</button></div>
          <ul class="list recents">${recents.map((p, i) => resultRow(p, my, { icon: 'clock', i })).join('')}</ul>`
        : `<div class="empty-hint">${svg('search', { size: 22 })}<p>Search streets, malls, barangays and places across Metro Manila — no internet needed.</p></div>`}
        <div class="home-tip">${svg('pin', { size: 18 })}<span>Tip: long-press the map to drop a pin.</span></div>
        <p class="home-foot">Manila Maps · offline · © OpenStreetMap contributors</p>
      </div>
    </div>`);

  el.querySelector('.searchbar').addEventListener('click', () => {
    tap();
    openSearch(app, { purpose: 'go', onPick: (p) => showPlace(app, p, { fly: true }) });
  });
  el.querySelector('.chips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-chip]');
    if (!b) return;
    tap();
    const chip = CHIPS.find((c) => c.id === b.dataset.chip);
    openSearch(app, { purpose: 'go', chip, onPick: (p) => showPlace(app, p, { fly: true }) });
  });
  el.querySelector('.recents')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    tap();
    showPlace(app, recents[Number(b.dataset.i)], { fly: true });
  });
  el.querySelector('[data-a="clear"]')?.addEventListener('click', () => {
    clearRecents();
    showHome(app);
  });

  app.setScreen('home');
  app.back = () => {
    if (app.sheet.snap !== 'peek') { app.sheet.setSnap('peek'); return true; }
    return false;
  };
  app.sheet.onDismiss = null;
  app.sheet.show(el, { snaps: ['peek', 'half', 'full'], snap: 'peek', peekEl: el.querySelector('.home-peek'), cls: 'sheet-home' });
}
