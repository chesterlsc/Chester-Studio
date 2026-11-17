// Recent places (localStorage, best effort).
import { lsGet, lsSet } from './dom.js';

const KEY = 'mm.recents';
const MAX = 10;

export function getRecents() {
  const r = lsGet(KEY, []);
  return Array.isArray(r) ? r.filter((p) => p && typeof p.lon === 'number' && typeof p.lat === 'number') : [];
}

export function addRecent(place) {
  if (!place || place.isMyLocation) return;
  const item = {
    name: place.name, subtitle: place.subtitle || '', lon: place.lon, lat: place.lat,
    kind: place.kind || 'place', category: place.category || null,
  };
  const list = getRecents().filter((p) => !(p.name === item.name && Math.abs(p.lon - item.lon) < 1e-4 && Math.abs(p.lat - item.lat) < 1e-4));
  list.unshift(item);
  lsSet(KEY, list.slice(0, MAX));
}

export function clearRecents() { lsSet(KEY, []); }
