// App shell: map, floating controls, bottom sheet and screen switching.
import { createMap, Overlays } from '../map/mapview.js';
import { Puck } from '../map/puck.js';
import { Follow } from '../nav/follow.js';
import { Location, errorMessage } from '../nav/location.js';
import { svg, logoSvg } from '../assets/icons.js';
import { html } from './dom.js';
import { Sheet } from './sheet.js';
import { Back } from './back.js';
import { toast } from './feedback.js';
import { loadEngines } from './engines.js';
import { showHome } from './home.js';
import { showPlace, placeFromPoint, placeFromFeature } from './place.js';
import { openSettings } from './settings.js';
import { tap } from '../nav/device.js';

export async function startApp(root, bundle) {
  const shell = html(`
    <div class="app">
      <div class="map" id="map"></div>
      <div class="map-attrib">© OpenStreetMap contributors</div>
      <div class="top-controls">
        <button class="fab fab-menu" aria-label="Menu and map data">${svg('menu', { size: 22 })}</button>
        <div class="brand-pill" aria-hidden="true">${logoSvg(22)}<b>Manila Maps</b><span>Offline</span></div>
        <div class="top-right">
          <button class="fab fab-compass" aria-label="Reset to north">
            <svg class="needle" width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
              <path d="M13 2.5 17 13H9z" fill="#E5484D"/><path d="M13 23.5 9 13h8z" fill="#b9bec5"/>
              <circle cx="13" cy="13" r="1.8" fill="#fff"/></svg>
          </button>
        </div>
      </div>
      <div class="fab-stack">
        <button class="fab fab-tilt" aria-label="Toggle 3D"><span>3D</span></button>
        <button class="fab fab-locate" aria-label="My location">${svg('locate', { size: 24 })}</button>
      </div>
      <button class="recenter" hidden>${svg('navigate', { size: 18 })}<span>Re-center</span></button>
      <div class="gps-banner" hidden></div>
    </div>`);
  root.appendChild(shell);

  const { map, maplibregl } = createMap(shell.querySelector('#map'), bundle);
  const overlays = new Overlays(map, maplibregl);
  const puck = new Puck(maplibregl, map);
  const follow = new Follow(map, puck, Location);
  const sheet = new Sheet(shell);
  const engines = loadEngines(bundle);

  const app = {
    root: shell, bundle, map, maplibregl, overlays, puck, follow, sheet, engines,
    loc: Location,
    screen: null,
    cleanup: null,
    pitchPref: 60,
    topOcclusion: 0,
    navActive: false,
    settings: { simulate: false },

    /** Last GPS fix as [lon, lat] (fresh within 5 min), else null. */
    myPos() {
      const f = Location.last;
      if (!f || Date.now() - f.time > 5 * 60 * 1000) return null;
      return [f.lon, f.lat];
    },
    /** Point to rank search results by: GPS, else map centre. */
    nearPoint() {
      const p = app.myPos();
      if (p) return p;
      const c = map.getCenter();
      return [c.lng, c.lat];
    },
    myLocationPlace() {
      const p = app.myPos();
      return p ? { name: 'Your location', subtitle: '', lon: p[0], lat: p[1], kind: 'place', isMyLocation: true } : null;
    },
    padding(extra = {}) {
      const H = shell.clientHeight;
      const top = Math.max(app.topOcclusion, safeTop() + 64) + 24;
      const bottom = Math.min(H * 0.6, sheet.hidden ? 0 : sheet.visible) + 32;
      return { top, bottom, left: 36, right: 36, ...extra };
    },
    setScreen(name, cleanup) {
      try { app.cleanup?.(); } catch (e) { console.error(e); }
      app.screen = name;
      app.cleanup = cleanup || null;
      app.lostFollow = false;
      recenterBtn.hidden = true;
      shell.dataset.screen = name;
    },
    setTopOcclusion(px) { app.topOcclusion = px; sheet.topLimit = px ? px + 8 : 0; },
    fitCoords(coords, opts = {}) {
      if (!coords?.length) return;
      let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
      for (const [x, y] of coords) { w = Math.min(w, x); e = Math.max(e, x); s = Math.min(s, y); n = Math.max(n, y); }
      const pad = app.padding();
      const H = shell.clientHeight, W = shell.clientWidth;
      // Keep padding sane on tiny screens.
      if (pad.top + pad.bottom > H - 80) { const k = (H - 80) / (pad.top + pad.bottom); pad.top *= k; pad.bottom *= k; }
      if (pad.left + pad.right > W - 80) { pad.left = pad.right = 20; }
      map.fitBounds([[w, s], [e, n]], { padding: pad, maxZoom: opts.maxZoom ?? 17, duration: opts.duration ?? 800, bearing: 0, pitch: opts.pitch ?? 0 });
    },
    flyToPlace(p, zoom = 16) {
      map.flyTo({ center: [p.lon, p.lat], zoom: Math.max(zoom, Math.min(map.getZoom(), 18)), padding: app.padding(), duration: 900, essential: true });
    },
    home() { showHome(app); },
  };
  window.__mm = app; // handy for QA in a desktop browser

  // ---------- sheet → floating controls ----------
  let padTimer = 0;
  sheet.onChange((h) => {
    shell.style.setProperty('--sheet-h', `${Math.round(h)}px`);
    shell.classList.toggle('sheet-tall', h > shell.clientHeight * 0.62);
    // Keep the followed dot above the sheet.
    clearTimeout(padTimer);
    padTimer = setTimeout(() => { if (!app.navActive) follow.refreshPadding(); }, 120);
  });

  // ---------- controls ----------
  const compassBtn = shell.querySelector('.fab-compass');
  const needle = compassBtn.querySelector('.needle');
  const tiltBtn = shell.querySelector('.fab-tilt');
  const locateBtn = shell.querySelector('.fab-locate');
  const recenterBtn = shell.querySelector('.recenter');
  const gpsBanner = shell.querySelector('.gps-banner');

  const syncCompass = () => {
    needle.style.transform = `rotate(${-map.getBearing()}deg)`;
    const rotated = Math.abs(map.getBearing()) > 0.5 || map.getPitch() > 1;
    compassBtn.classList.toggle('dim', !rotated);
    tiltBtn.firstElementChild.textContent = map.getPitch() > 10 ? '2D' : '3D';
  };
  map.on('rotate', syncCompass);
  map.on('pitch', syncCompass);
  syncCompass();

  compassBtn.addEventListener('click', () => {
    tap();
    if (follow.mode === 'follow') follow.exit('compass');
    map.easeTo({ bearing: 0, duration: 500 });
  });
  tiltBtn.addEventListener('click', () => {
    tap();
    const flat = map.getPitch() > 10;
    app.pitchPref = flat ? 0 : 60;
    if (follow.mode !== 'off') follow.setPitch(app.pitchPref);
    else map.easeTo({ pitch: app.pitchPref, duration: 600, zoom: !flat && map.getZoom() < 15.5 ? 16 : undefined });
  });

  const syncLocate = () => {
    locateBtn.classList.toggle('active', follow.mode !== 'off');
    locateBtn.classList.toggle('follow', follow.mode === 'follow');
    locateBtn.innerHTML = svg(follow.mode === 'follow' ? 'navigate' : 'locate', { size: follow.mode === 'follow' ? 20 : 24 });
    locateBtn.classList.toggle('no-fix', !Location.last);
    if (follow.mode !== 'off') app.lostFollow = false;
    recenterBtn.hidden = !(follow.mode === 'off' && (app.navActive || app.lostFollow));
  };
  let prevMode = 'off';
  follow.onChange((mode, reason) => {
    // Panning away from the heading-up camera offers a one-tap way back.
    if (mode === 'off' && reason === 'user' && prevMode === 'follow') app.lostFollow = true;
    prevMode = mode;
    syncLocate();
  });
  follow.paddingFor = (mode) => {
    const H = shell.clientHeight;
    if (mode === 'follow') {
      // Put the dot ~70% down the visible map area (lower third), like navigation apps.
      const occ = app.navActive ? (shell.querySelector('.nav-bottom')?.offsetHeight || 100) : (sheet.hidden ? 0 : Math.min(sheet.visible, H * 0.6));
      const visible = H - occ;
      return { top: Math.round(visible * 0.4), bottom: Math.round(occ), left: 0, right: 0 };
    }
    return app.padding();
  };

  locateBtn.addEventListener('click', async () => {
    tap();
    if (!Location.last) {
      if (Location.error) {
        showGpsBanner(errorMessage(Location.error));
        Location.restart();
      } else {
        toast('Finding your location…');
        Location.start();
      }
      app.pendingLocate = true;
      return;
    }
    if (follow.mode === 'off') follow.enter('track', { zoom: 16 });
    else if (follow.mode === 'track') follow.enter('follow', { pitch: app.pitchPref || 60, zoom: 17 });
    else {
      follow.enter('track');
      map.easeTo({ bearing: 0, pitch: 0, duration: 600 });
      app.pitchPref = 0;
    }
  });
  recenterBtn.addEventListener('click', () => {
    tap();
    follow.enter('follow', { pitch: app.pitchPref || 60, zoom: 17 });
  });

  // ---------- GPS ----------
  let firstFix = true;
  const [bw, bs, be, bn] = bundle.manifest.bounds || [120.9, 14.34, 121.14, 14.79];
  const inside = (f) => f.lon > bw - 0.05 && f.lon < be + 0.05 && f.lat > bs - 0.05 && f.lat < bn + 0.05;
  function showGpsBanner(msg) {
    gpsBanner.innerHTML = `${svg('info', { size: 18 })}<span>${msg}</span><button aria-label="Dismiss">${svg('close', { size: 16 })}</button>`;
    gpsBanner.hidden = false;
    gpsBanner.querySelector('button').onclick = () => { gpsBanner.hidden = true; };
  }
  Location.on('position', (f) => {
    gpsBanner.hidden = true;
    if (!app.navActive) puck.update({ lon: f.lon, lat: f.lat, accuracy: f.accuracy, heading: Location.heading() });
    if (firstFix) {
      firstFix = false;
      syncLocate();
      if (inside(f)) {
        if (app.screen === 'home' && follow.mode === 'off') map.jumpTo({ center: [f.lon, f.lat], zoom: 15, padding: app.padding() });
      } else {
        toast('You’re outside Metro Manila — this offline map covers Metro Manila only.', { ms: 5000 });
      }
    }
    if (app.pendingLocate) {
      app.pendingLocate = false;
      follow.enter('track', { zoom: 16 });
    }
  });
  let lastCompass = 0;
  Location.on('compass', () => {
    const now = performance.now();
    if (now - lastCompass < 80 || app.navActive) return;
    lastCompass = now;
    puck.setHeading(Location.heading());
  });
  Location.on('error', (e) => {
    syncLocate();
    if (app.pendingLocate || !Location.last) showGpsBanner(e.message);
    app.pendingLocate = false;
  });

  // ---------- map gestures: long-press drops a pin, tapping a POI opens it ----------
  let pressTimer = 0, pressAt = null, lastPress = 0;
  const longPress = (lngLat) => {
    if (app.navActive || Date.now() - lastPress < 800) return;
    lastPress = Date.now();
    tap('medium');
    showPlace(app, placeFromPoint(app, lngLat.lng, lngLat.lat), { fly: false });
  };
  map.on('touchstart', (e) => {
    clearTimeout(pressTimer);
    if (e.originalEvent.touches.length !== 1) return;
    pressAt = e.point;
    const ll = e.lngLat;
    pressTimer = setTimeout(() => longPress(ll), 550);
  });
  map.on('touchmove', (e) => {
    if (pressAt && (Math.abs(e.point.x - pressAt.x) > 10 || Math.abs(e.point.y - pressAt.y) > 10)) clearTimeout(pressTimer);
  });
  map.on('touchend', () => clearTimeout(pressTimer));
  map.on('touchcancel', () => clearTimeout(pressTimer));
  map.on('movestart', (e) => { if (e.originalEvent) clearTimeout(pressTimer); });
  map.on('contextmenu', (e) => longPress(e.lngLat));
  map.on('click', (e) => {
    if (app.navActive) return;
    const feats = map.queryRenderedFeatures([[e.point.x - 10, e.point.y - 10], [e.point.x + 10, e.point.y + 10]], { layers: ['poi'] });
    if (feats.length) {
      tap();
      showPlace(app, placeFromFeature(app, feats[0]), { fly: true });
    }
  });
  map.on('mouseenter', 'poi', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'poi', () => { map.getCanvas().style.cursor = ''; });

  // ---------- back / settings ----------
  Back.install();
  Back.setFallback(() => app.back?.() || false);
  shell.querySelector('.fab-menu').addEventListener('click', () => { tap(); openSettings(app); });

  // ---------- go ----------
  await new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    map.once('load', () => { map.once('idle', finish); setTimeout(finish, 2500); });
    map.on('error', (e) => console.warn('map error', e?.error || e));
    setTimeout(finish, 8000);
  });
  showHome(app);
  Location.start();
  return app;
}

function safeTop() {
  return (window.__insets?.top || 0);
}
