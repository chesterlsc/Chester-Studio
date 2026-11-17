// Place card: name, subtitle, distance, Directions / Set as start.
import { svg } from '../assets/icons.js';
import { html, esc } from './dom.js';
import { placeIcon, distTo, typeLabel } from './places.js';
import { fmtDistance } from '../nav/geo.js';
import { showHome } from './home.js';
import { showRoute } from './route.js';
import { addRecent } from './recents.js';
import { tap } from '../nav/device.js';

function coordLabel(lon, lat) {
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

/** Place for a long-pressed point, labelled with the nearest street/place. */
export function placeFromPoint(app, lon, lat) {
  const p = { name: 'Dropped pin', subtitle: coordLabel(lon, lat), lon, lat, kind: 'place', dropped: true };
  const label = (s) => {
    try {
      const r = s?.reverse(lon, lat);
      if (r?.name) { p.name = r.name; p.subtitle = r.subtitle || coordLabel(lon, lat); return true; }
    } catch { /* ignore */ }
    return false;
  };
  if (!label(app.engines.search)) {
    // Fill in once search finishes loading.
    p.pending = app.engines.searchReady.then((s) => label(s));
  }
  return p;
}

export function placeFromFeature(app, f) {
  const [lon, lat] = f.geometry.coordinates;
  const props = f.properties || {};
  const p = { name: props.name || 'Place', subtitle: '', lon, lat, kind: 'poi', category: props.class || 'other' };
  try {
    const r = app.engines.search?.reverse(lon, lat);
    if (r) p.subtitle = r.name && r.name !== p.name ? [r.name, r.subtitle].filter(Boolean).join(', ') : (r.subtitle || '');
  } catch { /* ignore */ }
  return p;
}

export function showPlace(app, place, { fly = true } = {}) {
  app.overlays.clearRoute();
  app.overlays.setPin([place.lon, place.lat]);
  app.setTopOcclusion(0);
  if (!place.dropped) addRecent(place);

  const render = () => {
    const d = distTo(place, app.myPos());
    const type = typeLabel(place);
    const meta = [d != null ? `${fmtDistance(d)} away` : '', type && place.kind !== 'place' ? type : ''].filter(Boolean).join(' · ');
    return html(`
      <div class="place">
        <div class="place-head">
          ${placeIcon(place, 22)}
          <div class="place-title">
            <h2>${esc(place.name)}</h2>
            ${place.subtitle ? `<p class="place-sub">${esc(place.subtitle)}</p>` : ''}
            ${meta ? `<p class="place-meta">${esc(meta)}</p>` : ''}
          </div>
          <button class="icon-btn close" data-a="close" aria-label="Close">${svg('close', { size: 18 })}</button>
        </div>
        <div class="place-actions">
          <button class="btn btn-primary btn-lg" data-a="dir">${svg('directions', { size: 20 })}<span>Directions</span></button>
          <button class="btn btn-soft btn-lg" data-a="start">${svg('start', { size: 18 })}<span>Set as start</span></button>
        </div>
      </div>`);
  };

  let el = render();
  const wire = () => {
    el.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (!a) return;
      tap();
      if (a === 'close') showHome(app);
      else if (a === 'dir') showRoute(app, { from: app.myLocationPlace(), to: place, back: () => showPlace(app, place, { fly: false }) });
      else if (a === 'start') showRoute(app, { from: place, to: null, back: () => showPlace(app, place, { fly: false }) });
    });
  };
  wire();

  app.setScreen('place', () => app.overlays.clearPin());
  app.back = () => { showHome(app); return true; };
  app.sheet.onDismiss = () => showHome(app);
  app.sheet.show(el, { snaps: ['auto'], cls: 'sheet-place' });
  if (fly) app.flyToPlace(place);

  // Dropped pin: update the label when reverse geocoding becomes available.
  place.pending?.then((changed) => {
    if (changed && app.screen === 'place') {
      el = render(); wire();
      app.sheet.show(el, { snaps: ['auto'], cls: 'sheet-place' });
    }
  });
}
