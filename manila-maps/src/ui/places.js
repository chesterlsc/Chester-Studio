// Place helpers shared by search, home and the place card.
import { svg, iconName, iconColor } from '../assets/icons.js';
import { esc } from './dom.js';
import { distance, fmtDistance } from '../nav/geo.js';

export const CHIPS = [
  { id: 'mall', label: 'Malls', icon: 'mall', cats: ['mall'], terms: ['mall', 'sm', 'robinsons', 'ayala'] },
  { id: 'food', label: 'Food', icon: 'food', cats: ['food', 'cafe'], terms: ['restaurant', 'jollibee', 'mcdonald', 'chowking', 'cafe', 'coffee'] },
  { id: 'hospital', label: 'Hospitals', icon: 'hospital', cats: ['hospital', 'clinic'], terms: ['hospital', 'medical center'], weights: { clinic: 4 } },
  { id: 'fuel', label: 'Gas', icon: 'fuel', cats: ['fuel'], terms: ['petron', 'shell', 'caltex', 'seaoil', 'phoenix', 'gas station'] },
  { id: 'atm', label: 'ATMs', icon: 'atm', cats: ['atm', 'bank'], terms: ['atm', 'bdo', 'bpi', 'metrobank', 'landbank'], weights: { bank: 1.5 } },
  { id: 'train', label: 'MRT/LRT', icon: 'train', cats: ['train'], kinds: ['station'], terms: ['mrt', 'lrt', 'station'] },
  { id: 'pharmacy', label: 'Pharmacy', icon: 'pharmacy', cats: ['pharmacy'], terms: ['mercury drug', 'pharmacy', 'watsons', 'southstar', 'generika'] },
  { id: 'hotel', label: 'Hotels', icon: 'hotel', cats: ['hotel'], terms: ['hotel', 'inn', 'suites'] },
];

const CATEGORY_LABEL = {
  mall: 'Shopping mall', shop: 'Shop', supermarket: 'Supermarket', convenience: 'Convenience store',
  market: 'Market', food: 'Restaurant', cafe: 'Café', bar: 'Bar', bank: 'Bank', atm: 'ATM',
  hospital: 'Hospital', clinic: 'Clinic', pharmacy: 'Pharmacy', school: 'School', university: 'University',
  church: 'Church', mosque: 'Mosque', temple: 'Temple', park: 'Park', hotel: 'Hotel', fuel: 'Gas station',
  charging: 'EV charging', parking: 'Parking', bus: 'Bus stop', train: 'Train station', airport: 'Airport',
  ferry: 'Ferry terminal', government: 'Government office', police: 'Police', fire: 'Fire station',
  post: 'Post office', museum: 'Museum', attraction: 'Attraction', cinema: 'Cinema', gym: 'Gym',
  sports: 'Sports', library: 'Library', toilet: 'Restroom',
};
const KIND_LABEL = { street: 'Street', barangay: 'Barangay', city: 'City', place: 'Place', station: 'Station' };

export function typeLabel(p) {
  return CATEGORY_LABEL[p.category] || KIND_LABEL[p.kind] || '';
}

export function placeIcon(p, size = 20) {
  const name = p.isMyLocation ? 'locate' : iconName(p.kind, p.category);
  const color = p.isMyLocation ? '#1f6fe5' : iconColor(name);
  return `<span class="ricon" style="--ic:${color}">${svg(name, { size })}</span>`;
}

export function distTo(p, my) {
  if (!my || p.isMyLocation) return null;
  return distance(my, [p.lon, p.lat]);
}

export function resultRow(p, my, { icon = null, i = 0 } = {}) {
  const d = distTo(p, my);
  const sub = [p.subtitle].filter(Boolean).join(' · ');
  return `<li><button class="row" data-i="${i}">
    ${icon ? `<span class="ricon ricon-muted">${svg(icon, { size: 20 })}</span>` : placeIcon(p)}
    <span class="row-text"><span class="row-title">${esc(p.name)}</span>${sub ? `<span class="row-sub">${esc(sub)}</span>` : ''}</span>
    ${d != null ? `<span class="row-dist">${fmtDistance(d)}</span>` : ''}
  </button></li>`;
}

/**
 * Category search near a point: engine text search filtered by category, plus POIs
 * from the tiles already loaded on screen.
 */
export function categorySearch({ chip, search, map, near }) {
  const out = [];
  const seen = [];
  const push = (p) => {
    if (!p?.name) return;
    for (const q of seen) {
      if (q.name === p.name && Math.abs(q.lon - p.lon) < 0.0008 && Math.abs(q.lat - p.lat) < 0.0008) return;
    }
    seen.push(p);
    out.push(p);
  };
  const ok = (r) => chip.cats.includes(r.category) || (chip.kinds || []).includes(r.kind);
  if (search) {
    for (const t of chip.terms) {
      try {
        for (const r of search.search(t, { near, limit: 40 }) || []) if (ok(r)) push(r);
      } catch { /* ignore */ }
    }
  }
  try {
    const feats = map.querySourceFeatures('osm', {
      sourceLayer: 'poi',
      filter: ['in', ['get', 'class'], ['literal', chip.cats]],
    });
    for (const f of feats) {
      const g = f.geometry;
      if (g?.type !== 'Point') continue;
      push({ id: `tile-${f.id ?? f.properties.name}`, name: f.properties.name, kind: 'poi', category: f.properties.class, subtitle: '', lon: g.coordinates[0], lat: g.coordinates[1] });
    }
  } catch { /* ignore */ }
  if (near) {
    const score = (p) => distance(near, [p.lon, p.lat]) * ((chip.weights || {})[p.category] || 1);
    out.sort((a, b) => score(a) - score(b));
  }
  return out.slice(0, 40);
}
