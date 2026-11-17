// Blue GPS dot: accuracy circle + heading cone + dot (or a navigation arrow while
// navigating). One DOM marker lying flat on the map, animated smoothly between fixes.
import { lerp, lerpAngle } from '../nav/geo.js';

export class Puck {
  constructor(maplibregl, map) {
    this.map = map;
    const el = document.createElement('div');
    el.className = 'puck';
    el.innerHTML = `
      <div class="puck-acc"></div>
      <div class="puck-cone"></div>
      <div class="puck-dot"></div>
      <svg class="puck-arrow" viewBox="0 0 48 48" width="46" height="46" aria-hidden="true">
        <path d="M24 4 40 41 24 33 8 41z" fill="#1f6fe5" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"/>
      </svg>`;
    this.el = el;
    this.acc = el.querySelector('.puck-acc');
    this.marker = new maplibregl.Marker({ element: el, rotationAlignment: 'map', pitchAlignment: 'map' });
    this.shown = false;
    this.pos = null;       // displayed [lon, lat]
    this.heading = null;   // displayed heading
    this.from = null; this.to = null; this.t0 = 0; this.dur = 900;
    this.hFrom = null; this.hTo = null; this.hT0 = 0; this.hDur = 300;
    this.accuracy = 30;
    this.frameHooks = new Set();
    this._raf = 0;
    this._loop = this._loop.bind(this);
    map.on('zoom', () => this._sizeAccuracy());
  }

  setMode(mode) { // 'dot' | 'arrow'
    this.el.classList.toggle('is-arrow', mode === 'arrow');
  }

  setStale(stale) { this.el.classList.toggle('is-stale', !!stale); }

  /** New fix (already snapped if navigating). */
  update({ lon, lat, accuracy, heading }) {
    const p = [lon, lat];
    if (!this.shown) {
      this.marker.setLngLat(p).addTo(this.map);
      this.shown = true;
      this.pos = p;
    }
    this.from = this.pos;
    this.to = p;
    this.t0 = performance.now();
    if (heading != null) this._aimHeading(heading, 700);
    if (accuracy != null) { this.accuracy = accuracy; this._sizeAccuracy(); }
    this.el.classList.toggle('has-heading', heading != null);
    this._kick();
  }

  /** Change only the heading (compass). */
  setHeading(h) {
    if (h == null || !this.shown) return;
    this._aimHeading(h, 250);
    this.el.classList.add('has-heading');
    this._kick();
  }

  _aimHeading(h, dur) {
    this.hFrom = this.heading;
    this.hTo = h;
    this.hT0 = performance.now();
    this.hDur = dur;
  }

  addFrameHook(fn) { this.frameHooks.add(fn); this._kick(); return () => this.frameHooks.delete(fn); }

  _kick() { if (!this._raf) this._raf = requestAnimationFrame(this._loop); }

  _loop(now) {
    this._raf = 0;
    let animating = false;
    if (this.from && this.to) {
      const t = Math.min(1, (now - this.t0) / this.dur);
      this.pos = lerp(this.from, this.to, t);
      this.marker.setLngLat(this.pos);
      animating = t < 1;
    }
    if (this.hTo != null) {
      const th = Math.min(1, (now - this.hT0) / this.hDur);
      this.heading = this.hFrom == null ? this.hTo : lerpAngle(this.hFrom, this.hTo, th);
      this.marker.setRotation(this.heading);
      if (th < 1) animating = true;
    }
    let keep = animating;
    for (const fn of this.frameHooks) { if (fn(now, this) === true) keep = true; }
    if (keep) this._raf = requestAnimationFrame(this._loop);
  }

  _sizeAccuracy() {
    if (!this.pos) return;
    const lat = this.pos[1];
    const mpp = (40075016.686 * Math.cos((lat * Math.PI) / 180)) / (512 * 2 ** this.map.getZoom());
    const px = Math.min(2000, Math.max(0, (this.accuracy / mpp) * 2));
    this.acc.style.width = this.acc.style.height = `${px}px`;
    this.acc.style.display = px < 30 ? 'none' : '';
  }
}
