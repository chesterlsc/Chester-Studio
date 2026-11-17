// Camera that follows the GPS puck.
//   'track'  — keeps you centred, north stays where it is (first tap on my-location)
//   'follow' — navigation camera: rotates with heading, pitched, dot in the lower third
// Any pan by the user exits to 'off' (the app then shows "Re-center").
import { lerp, lerpAngle, angleDiff } from './geo.js';

export class Follow {
  constructor(map, puck, location) {
    this.map = map;
    this.puck = puck;
    this.loc = location;
    this.mode = 'off';
    this.entering = false;
    this.pitch = 60;
    this.zoom = 17;
    this.listeners = new Set();
    this.paddingFor = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
    this.headingFn = () => this.loc.heading();
    this._last = 0;
    this._token = 0;
    puck.addFrameHook((now) => this._frame(now));
    const userExit = (e) => { if (e.originalEvent && this.mode !== 'off') this.exit('user'); };
    map.on('dragstart', userExit);
    map.on('rotatestart', (e) => { if (e.originalEvent && this.mode === 'follow') this.exit('user'); });
  }

  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  _emit(reason) { for (const fn of this.listeners) fn(this.mode, reason); }

  /** Enter a mode, animating the camera there. */
  enter(mode, { pitch, zoom, duration = 900 } = {}) {
    const pos = this.puck.pos;
    if (pitch != null) this.pitch = pitch;
    if (zoom != null) this.zoom = zoom;
    this.mode = mode;
    this._emit('enter');
    if (!pos) return; // will snap on first fix
    const cam = {
      center: pos,
      padding: this.paddingFor(mode),
      duration,
      essential: true,
    };
    if (mode === 'follow') {
      cam.zoom = this.zoom;
      cam.pitch = this.pitch;
      const h = this.headingFn();
      if (h != null) cam.bearing = h;
    } else {
      cam.zoom = Math.max(this.map.getZoom(), zoom ?? 15.5);
    }
    this.entering = true;
    const token = ++this._token;
    this.map.once('moveend', () => { if (token === this._token) { this.entering = false; this.puck._kick(); } });
    this.map.easeTo(cam);
  }

  exit(reason = 'app') {
    if (this.mode === 'off') return;
    this.mode = 'off';
    this.entering = false;
    this._token++;
    this._emit(reason);
  }

  setPitch(p) {
    this.pitch = p;
    if (this.mode !== 'off') this.map.easeTo({ pitch: p, duration: 500, padding: this.paddingFor(this.mode) });
  }

  refreshPadding() {
    if (this.mode === 'off') return;
    const cam = { padding: this.paddingFor(this.mode), duration: 350 };
    if (this.puck.pos) cam.center = this.puck.pos;
    this.entering = true;
    const token = ++this._token;
    this.map.once('moveend', () => { if (token === this._token) { this.entering = false; this.puck._kick(); } });
    this.map.easeTo(cam);
  }

  _frame(now) {
    const dt = this._last ? Math.min(100, now - this._last) : 16;
    this._last = now;
    if (this.mode === 'off' || this.entering || !this.puck.pos) return false;
    const target = this.puck.pos;
    const c = this.map.getCenter();
    const cur = [c.lng, c.lat];
    const a = 1 - Math.exp(-dt / 160);
    const dx = target[0] - cur[0], dy = target[1] - cur[1];
    const off = Math.abs(dx) + Math.abs(dy);
    const cam = {};
    let moving = false;
    if (off > 1e-7) { cam.center = off > 0.02 ? target : lerp(cur, target, a); moving = true; }
    if (this.mode === 'follow') {
      const h = this.headingFn();
      if (h != null) {
        const b = this.map.getBearing();
        const d = angleDiff(b, h);
        if (Math.abs(d) > 0.3) { cam.bearing = lerpAngle(b, h, 1 - Math.exp(-dt / 280)); moving = true; }
      }
    }
    if (moving) this.map.jumpTo(cam);
    return moving;
  }
}
