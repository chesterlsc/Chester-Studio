// Turn-by-turn navigation session: snapping, step progress, voice, re-routing, arrival.
import { cumulative, project, distance, sayDistance } from './geo.js';
import { Voice } from './device.js';

const OFF_ROUTE_M = 40;
const OFF_ROUTE_MS = 3500;
const ARRIVE_M = 25;

export class NavSession {
  /**
   * @param {object} o
   * @param o.route   Route from the router
   * @param o.to      [lon, lat] destination
   * @param o.toName  destination label
   * @param o.router  Router (for re-routing) or null
   * @param o.onUpdate(state), o.onReroute(route|null, phase), o.onArrive()
   */
  constructor(o) {
    Object.assign(this, o);
    this.setRoute(o.route);
    this.offSince = 0;
    this.rerouting = false;
    this.lastRerouteFail = 0;
    this.arrived = false;
    this.state = null;
  }

  setRoute(route) {
    this.route = route;
    this.coords = route.geometry;
    this.cum = cumulative(this.coords);
    this.total = this.cum[this.cum.length - 1];
    this.stepStart = route.steps.map((s) => this.cum[Math.min(this.coords.length - 1, Math.max(0, s.geometryIndex ?? 0))]);
    this.lastIndex = 0;
    this.lastAlong = 0;
    this.spoken = new Set();
    this.stepIdx = 0;
  }

  get modeNear() {
    return this.route.mode === 'walk' ? { far: 120, near: 25 } : { far: 450, near: 110 };
  }

  /** Speak the opening instruction. */
  announceStart() {
    const s0 = this.route.steps[0];
    const s1 = this.route.steps[1];
    let text = s0?.instruction || 'Starting route';
    if (s1 && s1.maneuver !== 'arrive' && (this.stepStart[1] ?? 0) < 300) text += `, then ${lowerFirst(s1.instruction)}`;
    Voice.speak(text);
  }

  /** Feed a GPS fix. Returns the display state. */
  update(fix) {
    const p = [fix.lon, fix.lat];
    // Windowed snap (ahead of last progress), falling back to a full search.
    let hiIdx = this.lastIndex;
    while (hiIdx < this.coords.length - 1 && this.cum[hiIdx] < this.lastAlong + 600) hiIdx++;
    let pr = project(this.coords, this.cum, p, Math.max(0, this.lastIndex - 2), hiIdx + 1);
    if (pr.dist > OFF_ROUTE_M) {
      const g = project(this.coords, this.cum, p);
      if (g.dist < pr.dist - 10) pr = g;
    }
    const onRoute = pr.dist <= OFF_ROUTE_M || (fix.accuracy > 60 && pr.dist <= fix.accuracy);
    if (onRoute) {
      this.lastIndex = pr.index;
      this.lastAlong = pr.along;
      this.offSince = 0;
    } else if (!this.offSince) {
      this.offSince = Date.now();
    }
    const along = this.lastAlong;

    // Current step: the last maneuver we've passed.
    let k = 0;
    for (let i = 0; i < this.stepStart.length; i++) if (this.stepStart[i] <= along + 3) k = i;
    if (k > this.stepIdx) this.stepIdx = k;
    k = this.stepIdx;
    const steps = this.route.steps;
    const next = steps[k + 1] || null;
    const distToNext = next ? Math.max(0, this.stepStart[k + 1] - along) : Math.max(0, this.total - along);

    // Remaining time: rest of current step (pro rata) + following steps.
    const curStart = this.stepStart[k] ?? 0;
    const curEnd = this.stepStart[k + 1] ?? this.total;
    const frac = curEnd > curStart ? Math.min(1, Math.max(0, (curEnd - along) / (curEnd - curStart))) : 0;
    let remTime = (steps[k]?.duration || 0) * frac;
    for (let i = k + 1; i < steps.length; i++) remTime += steps[i].duration || 0;
    const remDist = Math.max(0, this.total - along);

    // Segment bearing for a stable camera.
    const segA = this.coords[pr.index], segB = this.coords[Math.min(this.coords.length - 1, pr.index + 1)];
    const routeBearing = segA && segB && (segA[0] !== segB[0] || segA[1] !== segB[1]) ? bearingOf(segA, segB) : null;

    this.state = {
      onRoute,
      snapped: onRoute ? pr.point : p,
      rawDist: pr.dist,
      heading: onRoute && routeBearing != null ? routeBearing : fix.course,
      stepIndex: k,
      step: steps[k],
      next,
      after: steps[k + 2] || null,
      distToNext,
      remDist,
      remTime,
      along,
    };

    this._voice(k, next, distToNext, fix);

    // Arrival.
    const dDest = distance(p, this.to);
    if (!this.arrived && (remDist < ARRIVE_M || (dDest < ARRIVE_M && along > this.total * 0.5))) {
      this.arrived = true;
      Voice.speak(`You have arrived${this.toName ? ` at ${this.toName}` : ''}.`);
      this.onArrive?.();
    }

    // Off route → re-route.
    if (!this.arrived && this.offSince && Date.now() - this.offSince > OFF_ROUTE_MS) this._reroute(p);

    this.onUpdate?.(this.state);
    return this.state;
  }

  _voice(k, next, d, fix) {
    if (!next || this.arrived) return;
    const { far, near } = this.modeNear;
    const speed = fix.speed || 0;
    const nearD = Math.max(near, this.route.mode === 'walk' ? 0 : speed * 7);
    const id = k + 1;
    const instr = next.maneuver === 'arrive' ? 'you will arrive at your destination' : lowerFirst(next.instruction || '');
    if (d <= nearD) {
      if (!this.spoken.has(`n${id}`)) {
        this.spoken.add(`n${id}`); this.spoken.add(`f${id}`);
        const after = this.route.steps[k + 2];
        let t = next.maneuver === 'arrive' ? 'Your destination is ahead' : next.instruction;
        if (after && after.maneuver !== 'arrive' && (this.stepStart[k + 2] - this.stepStart[k + 1]) < 80) t += `, then ${lowerFirst(after.instruction)}`;
        Voice.speak(t);
      }
    } else if (d <= far && d > nearD * 1.8) {
      if (!this.spoken.has(`f${id}`)) {
        this.spoken.add(`f${id}`);
        Voice.speak(`In ${sayDistance(d)}, ${instr}`);
      }
    }
  }

  async _reroute(p) {
    if (this.rerouting || !this.router || Date.now() - this.lastRerouteFail < 10000) return;
    this.rerouting = true;
    this.onReroute?.(null, 'start');
    Voice.speak('Rerouting');
    try {
      const r = await this.router.route({ from: p, to: this.to, mode: this.route.mode });
      if (r && r.geometry?.length > 1) {
        this.setRoute(r);
        this.offSince = 0;
        this.onReroute?.(r, 'done');
      } else {
        this.lastRerouteFail = Date.now();
        this.onReroute?.(null, 'fail');
      }
    } catch (e) {
      console.warn('reroute failed', e);
      this.lastRerouteFail = Date.now();
      this.onReroute?.(null, 'fail');
    } finally {
      this.rerouting = false;
    }
  }
}

function bearingOf(a, b) {
  const toRad = Math.PI / 180;
  const y = Math.sin((b[0] - a[0]) * toRad) * Math.cos(b[1] * toRad);
  const x = Math.cos(a[1] * toRad) * Math.sin(b[1] * toRad) - Math.sin(a[1] * toRad) * Math.cos(b[1] * toRad) * Math.cos((b[0] - a[0]) * toRad);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function lowerFirst(s) { return s ? s[0].toLowerCase() + s.slice(1) : s; }
