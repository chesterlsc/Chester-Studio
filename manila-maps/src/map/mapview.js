// Creates the MapLibre map from the bundle and manages app overlays
// (route line, selected-place pin, route endpoints).
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerSource from 'maplibre-gl/dist/maplibre-gl-worker.mjs?raw';
import { registerBundle } from '../core/protocol.js';
import { buildStyle, OVERLAY_BEFORE } from './style.js';
import { addMapImages } from './icons.js';

let workerReady = false;
function setupWorker() {
  if (workerReady) return;
  // Ship the worker inside our bundle (works in the APK, the single-file build and file://).
  const url = URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
  maplibregl.setWorkerUrl(url);
  workerReady = true;
}

const EMPTY = { type: 'FeatureCollection', features: [] };

export function createMap(container, bundle) {
  setupWorker();
  const { sources, glyphs } = registerBundle(maplibregl, bundle);
  const m = bundle.manifest;
  const [w, s, e, n] = m.bounds || [120.9, 14.34, 121.14, 14.79];
  const margin = 0.12;
  const map = new maplibregl.Map({
    container,
    style: buildStyle({ sources, glyphs }),
    center: m.center || [(w + e) / 2, (s + n) / 2],
    zoom: 12,
    minZoom: 9,
    maxZoom: 19,
    maxPitch: 70,
    maxBounds: [[w - margin, s - margin], [e + margin, n + margin]],
    attributionControl: false,
    dragRotate: true,
    pitchWithRotate: true,
    touchPitch: true,
    fadeDuration: 180,
    renderWorldCopies: false,
    validateStyle: false,
    cancelPendingTileRequestsWhileZooming: true,
  });
  map.touchZoomRotate.enableRotation();
  addMapImages(map);
  return { map, maplibregl };
}

/** Overlays drawn by the app on top of the base map. */
export class Overlays {
  constructor(map, maplibregl) {
    this.map = map;
    this.ml = maplibregl;
    this.pin = null;
    this.startMarker = null;
    this.endMarker = null;
    const add = () => this._addLayers();
    if (map.isStyleLoaded()) add(); else map.once('load', add);
  }

  _addLayers() {
    const map = this.map;
    const before = map.getLayer(OVERLAY_BEFORE) ? OVERLAY_BEFORE : undefined;
    map.addSource('route', { type: 'geojson', data: EMPTY, lineMetrics: false });
    map.addSource('route-done', { type: 'geojson', data: EMPTY });
    map.addSource('route-alt', { type: 'geojson', data: EMPTY });
    const w = (k) => ['interpolate', ['exponential', 1.5], ['zoom'], 10, 4 * k, 14, 7 * k, 17, 12 * k, 19, 22 * k];
    map.addLayer({ id: 'route-alt-casing', type: 'line', source: 'route-alt', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': w(1.25) } }, before);
    map.addLayer({ id: 'route-alt', type: 'line', source: 'route-alt', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#9fd9bf', 'line-width': w(0.9) } }, before);
    map.addLayer({ id: 'route-done', type: 'line', source: 'route-done', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#b8bfc7', 'line-width': w(0.85), 'line-opacity': 0.9 } }, before);
    map.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': w(1.35) } }, before);
    map.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['case', ['==', ['get', 'mode'], 'walk'], '#0B9E6A', '#0B9E6A'], 'line-width': w(1) } }, before);
    map.addLayer({
      id: 'route-walk-dots', type: 'line', source: 'route',
      filter: ['==', ['get', 'mode'], 'walk'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': w(0.35), 'line-dasharray': [0.1, 2.2], 'line-opacity': 0.95 },
    }, before);
    map.addLayer({
      id: 'route-arrows', type: 'symbol', source: 'route', minzoom: 14,
      layout: {
        'symbol-placement': 'line', 'symbol-spacing': 90, 'icon-image': 'route-arrow',
        'icon-size': ['interpolate', ['linear'], ['zoom'], 14, 0.5, 18, 0.8],
        'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true,
      },
      paint: { 'icon-opacity': 0.9 },
    }, before);
    this.ready = true;
    if (this._pending) { const p = this._pending; this._pending = null; this.setRoute(...p); }
  }

  setRoute(coords, mode = 'car') {
    if (!this.ready) { this._pending = [coords, mode]; return; }
    const data = coords && coords.length > 1
      ? { type: 'Feature', properties: { mode }, geometry: { type: 'LineString', coordinates: coords } }
      : EMPTY;
    this.map.getSource('route').setData(data);
    if (!coords) this.setRouteDone(null);
    // Brighter arrows on the green route.
    try { this.map.setPaintProperty('route-arrows', 'icon-opacity', mode === 'walk' ? 0 : 0.9); } catch { /* ignore */ }
  }

  setRouteDone(coords) {
    if (!this.ready) return;
    this.map.getSource('route-done').setData(coords && coords.length > 1
      ? { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }
      : EMPTY);
  }

  _marker(cls, html, lngLat, anchor = 'bottom') {
    const el = document.createElement('div');
    el.className = cls;
    el.innerHTML = html;
    return new this.ml.Marker({ element: el, anchor }).setLngLat(lngLat).addTo(this.map);
  }

  setPin(lngLat) {
    this.clearPin();
    if (!lngLat) return;
    this.pin = this._marker('map-pin drop', PIN_SVG, lngLat);
  }

  clearPin() { this.pin?.remove(); this.pin = null; }

  setEndpoints(from, to) {
    this.startMarker?.remove(); this.endMarker?.remove();
    this.startMarker = this.endMarker = null;
    if (from) this.startMarker = this._marker('route-start', '<div></div>', from, 'center');
    if (to) this.endMarker = this._marker('map-pin end', PIN_SVG, to);
  }

  clearRoute() {
    this.setRoute(null);
    this.setEndpoints(null, null);
  }
}

const PIN_SVG = `<svg width="38" height="48" viewBox="0 0 38 48" aria-hidden="true">
  <ellipse cx="19" cy="45" rx="6" ry="2.2" fill="rgba(0,0,0,.22)"/>
  <path d="M19 1.5C9.3 1.5 1.8 8.9 1.8 18.3c0 11.8 15.1 26 16.4 27.2a1.2 1.2 0 0 0 1.6 0c1.3-1.2 16.4-15.4 16.4-27.2C36.2 8.9 28.7 1.5 19 1.5z" fill="#0B9E6A" stroke="#fff" stroke-width="2.4"/>
  <circle cx="19" cy="18" r="6.2" fill="#fff"/>
</svg>`;
