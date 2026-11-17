// "Simulate drive": a fake GPS that travels along a route geometry. For QA on a desktop.
import { cumulative, pointAlong } from './geo.js';

const SPEED = { car: 13, motorcycle: 12, walk: 3 }; // m/s (walk is sped up for testing)

export class Simulator {
  constructor(location, { coords, mode = 'car', speedFactor = 1, interval = 1000 }) {
    this.loc = location;
    this.coords = coords;
    this.cum = cumulative(coords);
    this.speed = (SPEED[mode] || 12) * speedFactor;
    this.interval = interval;
    this.along = 0;
    this.timer = null;
  }

  /** Replace the route (after a re-route) and keep driving from its start. */
  setRoute(coords) {
    this.coords = coords;
    this.cum = cumulative(coords);
    this.along = 0;
  }

  start() {
    this.loc.setSimulator(this);
    this._tick();
    this.timer = setInterval(() => this._tick(), this.interval);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
    if (this.loc.sim === this) this.loc.setSimulator(null);
  }

  _tick() {
    const total = this.cum[this.cum.length - 1];
    const p = pointAlong(this.coords, this.cum, this.along);
    this.loc.pushSimulated({ lon: p.point[0], lat: p.point[1], course: p.bearing, speed: this.along >= total ? 0 : this.speed });
    if (this.along >= total) { this.stop(); return; }
    this.along = Math.min(total, this.along + this.speed * (this.interval / 1000));
  }
}
