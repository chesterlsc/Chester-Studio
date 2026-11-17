// GPS + compass. Native: @capacitor/geolocation. Web: navigator.geolocation.
// A simulator can take over the position stream (QA "simulate drive").
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { bearing, distance } from './geo.js';

const isNative = Capacitor.isNativePlatform();

function emitter() {
  const map = new Map();
  return {
    on(t, fn) { if (!map.has(t)) map.set(t, new Set()); map.get(t).add(fn); return () => map.get(t).delete(fn); },
    emit(t, v) { for (const fn of map.get(t) || []) { try { fn(v); } catch (e) { console.error(e); } } },
  };
}

export const ERR = {
  DENIED: 'denied',
  OFF: 'off',
  UNAVAILABLE: 'unavailable',
};

export function errorMessage(code) {
  switch (code) {
    case ERR.DENIED: return 'Location permission is off. Allow location for Manila Maps in your phone settings to see where you are.';
    case ERR.OFF: return 'Your phone’s location (GPS) is turned off. Turn it on to see where you are.';
    default: return 'Can’t get your location right now. Move to an open area and try again.';
  }
}

class LocationService {
  constructor() {
    const e = emitter();
    this.on = e.on; this.emit = e.emit;
    this.last = null;          // last real or simulated fix
    this.compass = null;       // degrees from north, or null
    this.error = null;
    this.watchId = null;
    this.sim = null;
    this.started = false;
    this._prev = null;
    this._compassOn = false;
  }

  get position() { return this.last; }
  get simulating() { return !!this.sim; }

  async start() {
    if (this.started) return;
    this.started = true;
    this.startCompass();
    try {
      if (isNative) await this._startNative();
      else this._startWeb();
    } catch (e) {
      this._fail(this._classify(e));
    }
  }

  async restart() {
    this.stop();
    this.error = null;
    await this.start();
  }

  stop() {
    this.started = false;
    if (this.watchId != null) {
      try {
        if (isNative) Geolocation.clearWatch({ id: this.watchId });
        else navigator.geolocation.clearWatch(this.watchId);
      } catch { /* ignore */ }
      this.watchId = null;
    }
  }

  _classify(err) {
    const msg = String(err?.message || err || '').toLowerCase();
    const code = err?.code;
    if (code === 'OS-PLUG-GLOC-0010') return 'timeout';
    if (code === 1 || code === 'OS-PLUG-GLOC-0003' || msg.includes('permission') || msg.includes('denied')) {
      if (code === 'OS-PLUG-GLOC-0009') return ERR.OFF;
      return ERR.DENIED;
    }
    if (['OS-PLUG-GLOC-0007', 'OS-PLUG-GLOC-0009', 'OS-PLUG-GLOC-0016', 'OS-PLUG-GLOC-0017'].includes(code)
      || msg.includes('disabled') || msg.includes('not enabled') || msg.includes('turned off')) return ERR.OFF;
    if (code === 3) return 'timeout';
    return ERR.UNAVAILABLE;
  }

  _fail(code) {
    this.error = code;
    this.emit('error', { code, message: errorMessage(code) });
  }

  async _startNative() {
    let perm = await Geolocation.checkPermissions();
    if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
      perm = await Geolocation.requestPermissions({ permissions: ['location', 'coarseLocation'] });
    }
    if (perm.location === 'denied' && perm.coarseLocation !== 'granted') return this._fail(ERR.DENIED);
    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 2000, minimumUpdateInterval: 1000 },
      (pos, err) => {
        if (err) { this._onError(err); return; }
        if (pos) this._onPosition(pos);
      },
    );
  }

  _startWeb() {
    if (!('geolocation' in navigator)) return this._fail(ERR.UNAVAILABLE);
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this._onPosition(pos),
      (err) => this._onError(err),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 2000 },
    );
  }

  _onError(err) {
    let code = this._classify(err);
    // Timeouts are transient once we have a fix.
    if (code === 'timeout') { if (this.last) return; code = ERR.UNAVAILABLE; }
    this._fail(code);
  }

  _onPosition(pos) {
    if (this.sim) return; // simulator owns the stream
    const c = pos.coords;
    const fix = {
      lon: c.longitude, lat: c.latitude,
      accuracy: c.accuracy ?? 30,
      speed: c.speed != null && c.speed >= 0 ? c.speed : null,
      course: c.heading != null && !Number.isNaN(c.heading) && c.heading >= 0 ? c.heading : null,
      time: pos.timestamp || Date.now(),
      simulated: false,
    };
    this._ingest(fix);
  }

  _ingest(fix) {
    // Derive course/speed from movement when the receiver doesn't provide them.
    const prev = this._prev;
    if (prev) {
      const d = distance([prev.lon, prev.lat], [fix.lon, fix.lat]);
      const dt = Math.max(0.001, (fix.time - prev.time) / 1000);
      if (fix.speed == null) fix.speed = d / dt;
      if (fix.course == null && d > 3) fix.course = bearing([prev.lon, prev.lat], [fix.lon, fix.lat]);
    }
    if (fix.course == null && this.last?.course != null && (fix.speed ?? 0) < 1.5) fix.course = this.last.course;
    this._prev = fix;
    this.last = fix;
    if (this.error) { this.error = null; this.emit('recovered', fix); }
    this.emit('position', fix);
  }

  /** Simulator pushes fixes through here. */
  pushSimulated(fix) {
    this._ingest({ accuracy: 5, time: Date.now(), simulated: true, ...fix });
  }
  setSimulator(sim) {
    this.sim = sim;
    if (!sim) this._prev = null;
  }

  /** Best heading for map rotation: GPS course when moving, compass when slow. */
  heading() {
    const f = this.last;
    if (f && f.course != null && ((f.speed ?? 0) > 1.5 || f.simulated)) return f.course;
    if (this.compass != null) return this.compass;
    return f?.course ?? null;
  }

  startCompass() {
    if (this._compassOn) return;
    this._compassOn = true;
    const handler = (ev) => {
      let h = null;
      if (typeof ev.webkitCompassHeading === 'number') h = ev.webkitCompassHeading;
      else if (ev.absolute && typeof ev.alpha === 'number') h = 360 - ev.alpha;
      if (h == null || Number.isNaN(h)) return;
      const so = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
      h = (h + so + 360) % 360;
      // Low-pass filter to calm jitter.
      if (this.compass == null) this.compass = h;
      else {
        let d = ((h - this.compass) % 360 + 540) % 360 - 180;
        this.compass = (this.compass + d * 0.25 + 360) % 360;
      }
      this.emit('compass', this.compass);
    };
    if ('ondeviceorientationabsolute' in window) window.addEventListener('deviceorientationabsolute', handler);
    else window.addEventListener('deviceorientation', handler);
  }
}

export const Location = new LocationService();
