// Route planner: from/to, Car / Motorcycle / Walk, route on map, summary + steps, Start.
import { svg } from '../assets/icons.js';
import { html, esc, lsGet, lsSet } from './dom.js';
import { openSearch } from './search.js';
import { showHome } from './home.js';
import { startNav } from './nav.js';
import { toast } from './feedback.js';
import { fmtDistance, fmtDuration, fmtClock } from '../nav/geo.js';
import { maneuverSvg } from '../nav/maneuvers.js';
import { tap } from '../nav/device.js';

const MODES = [
  { id: 'car', label: 'Car', icon: 'car' },
  { id: 'motorcycle', label: 'Motorcycle', icon: 'motorcycle' },
  { id: 'walk', label: 'Walk', icon: 'walk' },
];
const MODE_NOTE = {
  car: '',
  motorcycle: 'Avoids expressways (not allowed for most motorcycles)',
  walk: 'Uses footpaths and stairs; one-way rules don’t apply',
};

export function showRoute(app, { from = null, to = null, back = null, mode = null } = {}) {
  const st = {
    from, to,
    mode: mode || lsGet('mm.mode', 'car'),
    cache: new Map(), // key -> Promise<Route|null>
    token: 0,
  };
  if (!MODES.some((m) => m.id === st.mode)) st.mode = 'car';

  const top = html(`
    <div class="route-top">
      <div class="route-card">
        <button class="icon-btn" data-a="back" aria-label="Back">${svg('back', { size: 22 })}</button>
        <div class="route-fields">
          <button class="rf" data-f="from"><span class="rf-dot start"></span><span class="rf-text"></span></button>
          <div class="rf-sep"></div>
          <button class="rf" data-f="to"><span class="rf-dot end"></span><span class="rf-text"></span></button>
        </div>
        <button class="icon-btn" data-a="swap" aria-label="Swap start and destination">${svg('swap', { size: 20 })}</button>
      </div>
      <div class="mode-tabs" role="tablist">
        ${MODES.map((m) => `<button class="mode-tab" role="tab" data-mode="${m.id}" aria-label="${m.label}" title="${m.label}">${svg(m.icon, { size: 20 })}<span class="mt-label">${m.label}</span><span class="mt-time"></span></button>`).join('')}
      </div>
    </div>`);
  app.root.appendChild(top);
  requestAnimationFrame(() => top.classList.add('show'));

  const syncTop = () => {
    const f = top.querySelector('[data-f="from"]');
    const t = top.querySelector('[data-f="to"]');
    f.querySelector('.rf-text').textContent = st.from ? st.from.name : 'Choose starting point';
    f.classList.toggle('empty', !st.from);
    f.classList.toggle('me', !!st.from?.isMyLocation);
    t.querySelector('.rf-text').textContent = st.to ? st.to.name : 'Choose destination';
    t.classList.toggle('empty', !st.to);
    for (const b of top.querySelectorAll('.mode-tab')) b.classList.toggle('active', b.dataset.mode === st.mode);
    app.setTopOcclusion(top.getBoundingClientRect().bottom);
  };

  const key = (m) => `${m}|${st.from?.lon},${st.from?.lat}|${st.to?.lon},${st.to?.lat}`;
  const getRoute = (m) => {
    const k = key(m);
    if (!st.cache.has(k)) {
      st.cache.set(k, (async () => {
        await app.engines.routerReady;
        const router = app.engines.router;
        if (!router) throw Object.assign(new Error('Routing isn’t available in this map file yet.'), { code: 'NO_ROUTER' });
        return router.route({ from: [st.from.lon, st.from.lat], to: [st.to.lon, st.to.lat], mode: m });
      })());
    }
    return st.cache.get(k);
  };

  const sheetMsg = (title, text = '', { spinner = false, action = null } = {}) => {
    const el = html(`<div class="route-msg">
        ${spinner ? '<div class="spinner"></div>' : svg('info', { size: 22 })}
        <div><b>${esc(title)}</b>${text ? `<p>${esc(text)}</p>` : ''}</div>
        ${action ? `<button class="btn btn-soft" data-a="msg">${esc(action.label)}</button>` : ''}
      </div>`);
    if (action) el.querySelector('[data-a="msg"]').onclick = action.run;
    app.sheet.show(el, { snaps: ['auto'], cls: 'sheet-route' });
  };

  const fillTimes = () => {
    for (const m of MODES) {
      const span = top.querySelector(`[data-mode="${m.id}"] .mt-time`);
      span.textContent = '';
      if (!st.from || !st.to) continue;
      getRoute(m.id).then((r) => { if (span.isConnected) span.textContent = r ? fmtDuration(r.duration) : '—'; }, () => {});
    }
  };

  let current = null;
  const compute = async () => {
    syncTop();
    current = null;
    app.overlays.setRoute(null);
    app.overlays.setEndpoints(st.from ? [st.from.lon, st.from.lat] : null, st.to ? [st.to.lon, st.to.lat] : null);
    if (!st.from || !st.to) {
      const missing = !st.from ? 'from' : 'to';
      sheetMsg(missing === 'from' ? 'Where are you starting from?' : 'Where do you want to go?',
        missing === 'from' && !app.myPos() ? 'Your location isn’t available. Choose a starting point.' : 'Pick a place to see the route.',
        { action: { label: missing === 'from' ? 'Choose start' : 'Choose destination', run: () => pickField(missing) } });
      const p = st.from || st.to;
      if (p) app.flyToPlace(p, 15);
      return;
    }
    const token = ++st.token;
    sheetMsg('Finding the best route…', '', { spinner: true });
    fillTimes();
    let r = null;
    try {
      r = await getRoute(st.mode);
    } catch (e) {
      if (token !== st.token) return;
      return sheetMsg('Can’t make a route', e?.message || String(e));
    }
    if (token !== st.token || app.screen !== 'route') return;
    if (!r || !r.geometry?.length) {
      app.fitCoords([[st.from.lon, st.from.lat], [st.to.lon, st.to.lat]]);
      return sheetMsg(`No ${MODES.find((m) => m.id === st.mode).label.toLowerCase()} route found`, 'Try another mode, or a point closer to a road.');
    }
    current = r;
    app.overlays.setRoute(r.geometry, st.mode);
    renderSummary(r);
    app.fitCoords(r.geometry);
  };

  const renderSummary = (r) => {
    const eta = fmtClock(new Date(Date.now() + r.duration * 1000));
    const via = viaName(r);
    const el = html(`
      <div class="route-sheet">
        <div class="route-sum">
          <div class="sum-line">
            <div>
              <div class="sum-main"><span class="sum-dur">${fmtDuration(r.duration)}</span><span class="sum-dist">${fmtDistance(r.distance)}</span></div>
              <div class="sum-eta">Arrive ${eta}${via ? ` · via ${esc(via)}` : ''}</div>
            </div>
            <button class="btn btn-primary btn-lg start-btn" data-a="start">${svg('navigate', { size: 18 })}<span>Start</span></button>
          </div>
          ${MODE_NOTE[st.mode] ? `<p class="sum-note">${esc(MODE_NOTE[st.mode])}</p>` : ''}
          ${app.settings.simulate ? '<p class="sum-note dev">Simulation is on: Start will drive the route for you.</p>' : ''}
        </div>
        <div class="steps">
          <div class="section-head"><h3>Steps</h3><span class="muted">${r.steps.length} steps</span></div>
          <ol class="step-list">
            ${r.steps.map((s) => `<li class="step">
              <span class="step-ic">${maneuverSvg(s.maneuver, s.modifier, 26)}</span>
              <span class="step-text">${esc(s.instruction || '')}${s.distance > 0 && s.maneuver !== 'arrive' ? `<span class="step-dist">${fmtDistance(s.distance)}</span>` : ''}</span>
            </li>`).join('')}
          </ol>
        </div>
      </div>`);
    const startBtn = el.querySelector('[data-a="start"]');
    let pressT = 0, longFired = false;
    startBtn.addEventListener('pointerdown', () => {
      longFired = false;
      pressT = setTimeout(() => { longFired = true; tap('medium'); begin(true); }, 650);
    });
    const cancel = () => clearTimeout(pressT);
    startBtn.addEventListener('pointerup', cancel);
    startBtn.addEventListener('pointerleave', cancel);
    startBtn.addEventListener('pointercancel', cancel);
    startBtn.addEventListener('contextmenu', (e) => e.preventDefault());
    startBtn.addEventListener('click', () => { if (!longFired) { tap(); begin(app.settings.simulate); } });
    app.sheet.show(el, { snaps: ['peek', 'full'], snap: 'peek', peekEl: el.querySelector('.route-sum'), cls: 'sheet-route' });
  };

  const begin = (simulate) => {
    if (!current) return;
    if (!simulate && !app.myPos()) {
      toast('Turn on location to navigate. (Long-press Start to simulate the drive.)', { ms: 4500 });
      return;
    }
    const routeState = { from: st.from, to: st.to, mode: st.mode, back };
    startNav(app, {
      route: current, to: st.to, simulate,
      onExit: () => showRoute(app, routeState),
      onDone: () => showHome(app),
    });
  };

  const pickField = (field) => {
    openSearch(app, {
      purpose: field,
      onPick: (p) => {
        st[field] = p;
        compute();
      },
    });
  };

  top.addEventListener('click', (e) => {
    const f = e.target.closest('[data-f]');
    if (f) { tap(); pickField(f.dataset.f); return; }
    const m = e.target.closest('[data-mode]');
    if (m) {
      tap();
      st.mode = m.dataset.mode;
      lsSet('mm.mode', st.mode);
      compute();
      return;
    }
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'back') { tap(); goBack(); }
    if (a === 'swap') {
      tap();
      [st.from, st.to] = [st.to, st.from];
      compute();
    }
  });

  const goBack = () => { if (back) back(); else showHome(app); };

  app.setScreen('route', () => {
    top.classList.remove('show');
    setTimeout(() => top.remove(), 200);
    app.overlays.clearRoute();
    app.setTopOcclusion(0);
  });
  app.back = () => { goBack(); return true; };
  app.sheet.onDismiss = null;
  app.overlays.clearPin();
  compute();
  if (!st.to) setTimeout(() => app.screen === 'route' && !st.to && pickField('to'), 250);
  else if (!st.from && !app.myPos()) setTimeout(() => app.screen === 'route' && !st.from && pickField('from'), 250);
}

function viaName(r) {
  let best = null;
  for (const s of r.steps) {
    if (!s.name || s.maneuver === 'arrive') continue;
    if (!best || s.distance > best.distance) best = s;
  }
  return best?.name || '';
}
