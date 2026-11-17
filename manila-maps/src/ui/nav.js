// Turn-by-turn navigation screen: maneuver banner, remaining time/distance/ETA,
// follow camera, voice, re-routing, arrival, optional simulated drive.
import { svg } from '../assets/icons.js';
import { html, esc } from './dom.js';
import { NavSession } from '../nav/navigator.js';
import { Simulator } from '../nav/simulate.js';
import { Location } from '../nav/location.js';
import { Voice, Awake, tap } from '../nav/device.js';
import { maneuverSvg } from '../nav/maneuvers.js';
import { fmtDistance, fmtDuration, fmtClock, sliceFrom, sliceTo } from '../nav/geo.js';
import { confirmDialog, toast } from './feedback.js';

export function startNav(app, { route, to, simulate = false, onExit, onDone }) {
  const { map, overlays, puck, follow } = app;
  const ui = html(`
    <div class="nav-ui">
      <div class="nav-top">
        <div class="nav-banner">
          <div class="nb-icon"></div>
          <div class="nb-text">
            <div class="nb-dist"></div>
            <div class="nb-instr"></div>
          </div>
        </div>
        <div class="nav-then" hidden></div>
      </div>
      <div class="nav-side">
        <button class="fab" data-a="mute" aria-label="Voice prompts"></button>
        <button class="fab" data-a="overview" aria-label="Route overview">${svg('overview', { size: 22 })}</button>
      </div>
      <div class="nav-bottom">
        <div class="nbm-main">
          <div class="nbm-time"></div>
          <div class="nbm-sub"></div>
        </div>
        <button class="btn btn-danger btn-lg" data-a="end">End</button>
      </div>
    </div>`);
  app.root.appendChild(ui);
  const $ = (s) => ui.querySelector(s);
  const muteBtn = $('[data-a="mute"]');
  const syncMute = () => {
    muteBtn.innerHTML = svg(Voice.muted ? 'mute' : 'volume', { size: 22 });
    muteBtn.classList.toggle('muted', Voice.muted);
    muteBtn.setAttribute('aria-label', Voice.muted ? 'Unmute voice prompts' : 'Mute voice prompts');
  };
  syncMute();

  let sim = null;
  let ended = false;
  let arrived = false;

  const session = new NavSession({
    route,
    to: [to.lon, to.lat],
    toName: to.isMyLocation ? '' : to.name,
    router: app.engines.router,
    onReroute: (r, phase) => {
      if (phase === 'start') ui.classList.add('rerouting');
      else ui.classList.remove('rerouting');
      if (phase === 'start') { $('.nb-dist').textContent = 'Rerouting…'; $('.nb-instr').textContent = 'Finding a new route'; }
      if (phase === 'done' && r) { overlays.setRoute(r.geometry, r.mode); overlays.setRouteDone(null); }
      if (phase === 'fail') toast('Couldn’t find a new route yet. Head back toward the green line.');
    },
    onArrive: () => {
      arrived = true;
      tap('medium');
      showArrived();
    },
  });

  const render = (s) => {
    if (arrived || ended) return;
    const next = s.next;
    $('.nb-icon').innerHTML = maneuverSvg(next ? next.maneuver : 'arrive', next?.modifier, 46);
    $('.nb-dist').textContent = fmtDistance(s.distToNext);
    let text = next ? next.instruction : 'Continue to your destination';
    if (next?.maneuver === 'arrive') text = to.isMyLocation ? 'Arrive at your destination' : `Arrive at ${to.name}`;
    $('.nb-instr').textContent = text || '';
    const then = $('.nav-then');
    const after = s.after;
    if (next && after && session.stepStart[s.stepIndex + 2] - session.stepStart[s.stepIndex + 1] < 150) {
      then.innerHTML = `<span>Then</span>${maneuverSvg(after.maneuver, after.modifier, 22)}`;
      then.hidden = false;
    } else then.hidden = true;
    $('.nbm-time').textContent = fmtDuration(s.remTime);
    $('.nbm-sub').textContent = `${fmtDistance(s.remDist)} · ${fmtClock(new Date(Date.now() + s.remTime * 1000))}`;
    ui.classList.toggle('off-route', !s.onRoute);
  };

  let lastFix = null;
  const onFix = (fix) => {
    if (ended) return;
    lastFix = fix;
    const s = session.update(fix);
    puck.update({ lon: s.snapped[0], lat: s.snapped[1], accuracy: fix.accuracy, heading: s.heading ?? Location.heading() });
    render(s);
    if (s.onRoute) {
      const lag = Math.max(0, s.along - Math.min(25, (fix.speed || 0) * 1.0));
      overlays.setRoute(sliceFrom(session.coords, session.cum, lag), session.route.mode);
      overlays.setRouteDone(sliceTo(session.coords, session.cum, lag));
    }
  };
  const unsub = Location.on('position', onFix);

  const showArrived = () => {
    sim?.stop();
    $('.nb-icon').innerHTML = maneuverSvg('arrive', null, 46);
    $('.nb-dist').textContent = 'You have arrived';
    $('.nb-instr').textContent = to.isMyLocation ? '' : to.name;
    $('.nav-then').hidden = true;
    const bottom = $('.nav-bottom');
    bottom.innerHTML = `<div class="nbm-main"><div class="nbm-time">Arrived</div><div class="nbm-sub">${esc(fmtClock(new Date()))}</div></div>
      <button class="btn btn-primary btn-lg" data-a="done">Done</button>`;
    ui.classList.add('arrived');
  };

  const end = (toDone = false) => {
    if (ended) return;
    ended = true;
    app.cleanup = null; // we clean up here
    teardown();
    if (toDone) onDone?.(); else onExit?.();
  };

  const teardown = () => {
    unsub();
    sim?.stop();
    Awake.off();
    Voice.stop();
    app.navActive = false;
    puck.setMode('dot');
    follow.headingFn = () => Location.heading();
    follow.exit('app');
    ui.remove();
    app.root.classList.remove('navigating');
    overlays.setRouteDone(null);
    // Show the real position again if we were simulating.
    if (lastFix?.simulated) Location.last = null;
  };

  ui.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (!a) return;
    tap();
    if (a === 'end') end(false);
    else if (a === 'done') end(true);
    else if (a === 'mute') { Voice.setMuted(!Voice.muted); syncMute(); if (!Voice.muted) Voice.speak('Voice prompts on'); }
    else if (a === 'overview') {
      follow.exit('overview');
      const rest = session.state ? sliceFrom(session.coords, session.cum, session.state.along) : session.coords;
      const pad = { top: (ui.querySelector('.nav-top').getBoundingClientRect().bottom || 120) + 30, bottom: (ui.querySelector('.nav-bottom').offsetHeight || 100) + 40, left: 40, right: 70 };
      const b = rest.reduce((acc, [x, y]) => [Math.min(acc[0], x), Math.min(acc[1], y), Math.max(acc[2], x), Math.max(acc[3], y)], [Infinity, Infinity, -Infinity, -Infinity]);
      map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: pad, bearing: 0, pitch: 0, duration: 900, maxZoom: 17 });
    }
  });

  // ---- start ----
  app.setScreen('nav', () => { if (!ended) { ended = true; teardown(); } });
  app.back = () => {
    confirmDialog({ title: 'End navigation?', message: 'You can start again from the route screen.', ok: 'End', danger: true }).then((ok) => { if (ok) end(false); });
    return true;
  };
  app.navActive = true;
  app.root.classList.add('navigating');
  app.sheet.hide();
  overlays.clearPin();
  overlays.setRoute(route.geometry, route.mode);
  overlays.setEndpoints(null, [to.lon, to.lat]);
  puck.setMode('arrow');
  follow.headingFn = () => (session.state?.onRoute && session.state.heading != null ? session.state.heading : Location.heading());
  Awake.on();

  if (simulate) {
    sim = new Simulator(Location, { coords: route.geometry, mode: route.mode });
    sim.start();
    toast('Simulating the drive along your route', { ms: 2500 });
  } else {
    Location.start();
    if (Location.last) onFix(Location.last);
  }
  follow.enter('follow', { pitch: app.pitchPref > 0 ? app.pitchPref : 60, zoom: route.mode === 'walk' ? 18 : 17, duration: 1200 });
  session.announceStart();
  if (!session.state) {
    // Before the first fix: show the first maneuver.
    const s1 = route.steps[1] || route.steps[0];
    $('.nb-icon').innerHTML = maneuverSvg(s1?.maneuver || 'depart', s1?.modifier, 46);
    $('.nb-dist').textContent = fmtDistance(route.steps[0]?.distance || 0);
    $('.nb-instr').textContent = s1?.instruction || route.steps[0]?.instruction || '';
    $('.nbm-time').textContent = fmtDuration(route.duration);
    $('.nbm-sub').textContent = `${fmtDistance(route.distance)} · ${fmtClock(new Date(Date.now() + route.duration * 1000))}`;
  }
  return { end };
}
