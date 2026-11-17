// Hand-drawn icon set (24×24 grid, stroked, round caps) shared by the UI (inline
// SVG) and the map (drawn to canvas with Path2D). Our own artwork — no icon fonts,
// no downloads.
//
// Each icon: { d: 'svg path', fill?: true (filled shape instead of stroke), text?: 'WC' }

export const ICONS = {
  // ---- POI categories ----
  food: { d: 'M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17.5 21V3c-2.2 1.2-3.5 4-3.5 8h3.5' },
  cafe: { d: 'M4 9h12v4.5A5.5 5.5 0 0 1 10.5 19h-1A5.5 5.5 0 0 1 4 13.5zM16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5v2.5M12 3.5v2.5' },
  bar: { d: 'M4.5 4h15L12 12.5zM12 12.5V20M8 20h8' },
  shop: { d: 'M5 8h14l-1.2 12.5H6.2zM9 10.5V7a3 3 0 0 1 6 0v3.5' },
  mall: { d: 'M5 8h14l-1.2 12.5H6.2zM9 10.5V7a3 3 0 0 1 6 0v3.5' },
  supermarket: { d: 'M2.5 4h2.5l2.3 10.5h10.3L20 7.5H6M8.5 19.5h.01M16.5 19.5h.01' },
  convenience: { d: 'M4.5 11v9.5h15V11M3 8l1.8-4.5h14.4L21 8a2.6 2.6 0 0 1-5.4.4A2.6 2.6 0 0 1 12 10.6a2.6 2.6 0 0 1-3.6-2.2A2.6 2.6 0 0 1 3 8zM10 20.5V16h4v4.5' },
  market: { d: 'M4.5 11v9.5h15V11M3 8l1.8-4.5h14.4L21 8a2.6 2.6 0 0 1-5.4.4A2.6 2.6 0 0 1 12 10.6a2.6 2.6 0 0 1-3.6-2.2A2.6 2.6 0 0 1 3 8zM10 20.5V16h4v4.5' },
  bank: { d: 'M3 9.5 12 4l9 5.5M5.5 10.5v7M10 10.5v7M14 10.5v7M18.5 10.5v7M3 20.5h18' },
  atm: { d: 'M3 6h18v12.5H3zM3 10h18M7 15h4' },
  hospital: { d: 'M12 5.5v13M5.5 12h13' },
  clinic: { d: 'M12 5.5v13M5.5 12h13' },
  pharmacy: { d: 'M10.6 20.2 20.2 10.6a4.6 4.6 0 0 0-6.5-6.5L4.1 13.7a4.6 4.6 0 0 0 6.5 6.5zM8.9 8.9l6.2 6.2' },
  school: { d: 'M2 9.5 12 5l10 4.5-10 4.5zM6.5 11.5v4.5c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4.5M21.5 9.5v5.5' },
  university: { d: 'M2 9.5 12 5l10 4.5-10 4.5zM6.5 11.5v4.5c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4.5M21.5 9.5v5.5' },
  library: { d: 'M3.5 5h5.5a3 3 0 0 1 3 3v12a2.2 2.2 0 0 0-2.2-2.2H3.5zM20.5 5H15a3 3 0 0 0-3 3v12a2.2 2.2 0 0 1 2.2-2.2h6.3z' },
  church: { d: 'M12 2.5v5.5M9.5 4.8h5M5 21v-8.5l7-4.2 7 4.2V21zM10 21v-3.8a2 2 0 0 1 4 0V21' },
  mosque: { d: 'M19.5 14.5A8 8 0 1 1 9.5 4.5a6.4 6.4 0 0 0 10 10z', fill: true },
  temple: { d: 'M3 8.5h18L12 3.5zM6 8.5v3h12v-3M4 14h16M7 14v7M17 14v7M4 21h16' },
  park: { d: 'M12 21.5V17M12 2.5 6.5 10h3l-4 6.5h13l-4-6.5h3z' },
  hotel: { d: 'M3 18.5V5.5M3 13.5h18v5M7 10.5h.01M11 13.5V9h6.5a3.5 3.5 0 0 1 3.5 3.5v1' },
  fuel: { d: 'M4.5 21V5a2 2 0 0 1 2-2h5.5a2 2 0 0 1 2 2v16M3 21h12.5M4.5 10h9.5M14 8.5h1.8a1.7 1.7 0 0 1 1.7 1.7v6a1.5 1.5 0 0 0 3 0V8.2l-2.8-2.9' },
  charging: { d: 'M13.5 2 4.5 13.5h7L10.5 22l9-11.5h-7z', fill: true },
  parking: { d: 'M8.5 20V4.5h5a4.2 4.2 0 0 1 0 8.4h-5' },
  bus: { d: 'M6.5 3h11A2.5 2.5 0 0 1 20 5.5V17H4V5.5A2.5 2.5 0 0 1 6.5 3zM4 11h16M7 20.5V17M17 20.5V17M8 14h.01M16 14h.01' },
  train: { d: 'M7.5 3h9A3.5 3.5 0 0 1 20 6.5v7a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 13.5v-7A3.5 3.5 0 0 1 7.5 3zM4 10h16M8 21.5l2-4.5M16 21.5l-2-4.5M8.5 13.5h.01M15.5 13.5h.01' },
  station: { d: 'M7.5 3h9A3.5 3.5 0 0 1 20 6.5v7a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 13.5v-7A3.5 3.5 0 0 1 7.5 3zM4 10h16M8 21.5l2-4.5M16 21.5l-2-4.5M8.5 13.5h.01M15.5 13.5h.01' },
  airport: { d: 'M12 2.2c-.9 0-1.5.8-1.5 1.6v5.4L3 13.6v2.3l7.5-2.4v4.6l-2.3 1.6V21l3.8-1.1 3.8 1.1v-1.3l-2.3-1.6v-4.6l7.5 2.4v-2.3l-7.5-4.4V3.8c0-.8-.6-1.6-1.5-1.6z', fill: true },
  ferry: { d: 'M3 18c1.5 1.6 3.5 1.6 5 0 1.5 1.6 3.5 1.6 5 0 1.5 1.6 3.5 1.6 5 0M5 15l-1-4.5h16L19 15M8 10.5V6.5h8v4M12 3.5v3' },
  government: { d: 'M3 20.5h18M5 20.5v-9.5M19 20.5v-9.5M9.5 20.5V15h5v5.5M2.5 11 12 4.5l9.5 6.5' },
  police: { d: 'M12 2.8 19.5 5.6v5.8c0 4.8-3.2 8-7.5 9.6-4.3-1.6-7.5-4.8-7.5-9.6V5.6z' },
  fire: { d: 'M12 21.5a6.8 6.8 0 0 0 6.8-6.8c0-3.8-2.6-6-3.8-10.2-1.9 1.8-2.3 3.8-2.3 5.1-1.1-.9-1.9-2.2-2.2-3.9-2.6 2.6-5.3 5.6-5.3 9a6.8 6.8 0 0 0 6.8 6.8z' },
  post: { d: 'M3 6h18v12.5H3zM3 6.5l9 6.5 9-6.5' },
  museum: { d: 'M3 20.5h18M4 9h16M12 3.5 20.5 9h-17zM6.5 9v9M10 9v9M14 9v9M17.5 9v9M3.5 18h17' },
  attraction: { d: 'M12 2.8l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.1 6.4 20l1.1-6.2L3 9.4l6.2-.9z', fill: true },
  cinema: { d: 'M3 5h18v14H3zM10 9.2 15 12l-5 2.8z' },
  gym: { d: 'M6.5 7.5v9M3.5 10v4M17.5 7.5v9M20.5 10v4M6.5 12h11' },
  sports: { d: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18zM3.5 12h17M12 3c2.8 2.6 2.8 15.4 0 18M12 3c-2.8 2.6-2.8 15.4 0 18' },
  toilet: { text: 'WC' },
  other: { d: 'M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9z', fill: true },

  // ---- search result kinds ----
  street: { d: 'M7 3 4 21M17 3l3 18M12 4v3M12 10.5v3M12 17v3' },
  barangay: { d: 'M12 21.5s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11zM12 8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5z' },
  city: { d: 'M3 21h18M5 21V8l5-3v16M10 21V10h9v11M13 13.5h3M13 17h3M7 11h.01M7 14.5h.01M7 18h.01' },
  place: { d: 'M12 21.5s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11zM12 8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5z' },

  // ---- UI ----
  search: { d: 'M10.5 3.5a7 7 0 1 0 0 14 7 7 0 1 0 0-14zM20.5 20.5l-5-5' },
  back: { d: 'M15 4.5 7.5 12l7.5 7.5' },
  close: { d: 'M6 6l12 12M18 6 6 18' },
  clock: { d: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18zM12 7v5l3.5 2' },
  locate: { d: 'M12 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 1 0 0-15zM12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5z' },
  navigate: { d: 'M12 2.5 19.5 21 12 16.5 4.5 21z', fill: true },
  menu: { d: 'M4 6.5h16M4 12h16M4 17.5h16' },
  settings: { d: 'M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' },
  swap: { d: 'M7.5 20V5M4 8.5l3.5-3.5L11 8.5M16.5 4v15M13 15.5l3.5 3.5 3.5-3.5' },
  car: { d: 'M5 16.5V11l2-5h10l2 5v5.5M3.5 11h17v5.5h-17zM6 19.5v-3M18 19.5v-3M7.5 13.8h.01M16.5 13.8h.01' },
  motorcycle: { d: 'M5.5 13.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7zM18.5 13.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 1 0 0-7zM5.5 17h5l3.5-6h3.5l1.5 6M14 11l-1.5-3.5H10M15 7.5h3' },
  walk: { d: 'M13 2.8a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 1 0 0-3.6zM9 21l2.5-6 2.5 2.5V21M8 11.5l2.5-3.5 3.5 1 1.5 3.5 2.5 1M10.5 8l1 5.5' },
  directions: { d: 'M12 2.5 21.5 12 12 21.5 2.5 12zM9 14.5V12a1.5 1.5 0 0 1 1.5-1.5H15M13 8.5l2 2-2 2' },
  share: { d: 'M12 3v12M7.5 7.5 12 3l4.5 4.5M5 13v6.5h14V13' },
  pin: { d: 'M12 21.5s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11zM12 8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5z' },
  flag: { d: 'M5 21.5V4M5 4.5h12l-2.5 4 2.5 4H5' },
  start: { d: 'M12 6a6 6 0 1 0 0 12 6 6 0 1 0 0-12z' },
  volume: { d: 'M4 9.5h3.5L12.5 5v14l-5-4.5H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11' },
  mute: { d: 'M4 9.5h3.5L12.5 5v14l-5-4.5H4zM16.5 9.5l5 5M21.5 9.5l-5 5' },
  layers: { d: 'M12 3 2.5 8 12 13l9.5-5zM2.5 12 12 17l9.5-5M2.5 16 12 21l9.5-5' },
  download: { d: 'M12 3.5v12M7 11l5 5 5-5M4.5 20.5h15' },
  upload: { d: 'M12 16V4M7 8.5l5-5 5 5M4.5 20.5h15' },
  refresh: { d: 'M20 11.5A8 8 0 0 0 5.6 6.8L4 8.5M4 4v4.5h4.5M4 12.5a8 8 0 0 0 14.4 4.7l1.6-1.7M20 20v-4.5h-4.5' },
  info: { d: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18zM12 11v5.5M12 7.5h.01' },
  check: { d: 'M5 12.5l4.5 4.5L19 7.5' },
  overview: { d: 'M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20zM9 4v13.5M15 6.5V20' },
  phone: { d: 'M12 4.5' },
  storage: { d: 'M4 5.5c0-1.4 3.6-2.5 8-2.5s8 1.1 8 2.5v13c0 1.4-3.6 2.5-8 2.5s-8-1.1-8-2.5zM4 5.5c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5' },
  chevron: { d: 'M9 5l7 7-7 7' },
};

// POI class -> icon colour group
const GROUP = {
  food: '#EF7D22', cafe: '#EF7D22', bar: '#EF7D22',
  mall: '#5B6CF0', shop: '#5B6CF0', supermarket: '#5B6CF0', convenience: '#5B6CF0', market: '#5B6CF0',
  bank: '#3A7F93', atm: '#3A7F93',
  hospital: '#E5484D', clinic: '#E5484D', pharmacy: '#E5484D',
  school: '#A26B35', university: '#A26B35', library: '#A26B35', museum: '#A26B35',
  church: '#7B8089', mosque: '#7B8089', temple: '#7B8089',
  park: '#2E9B57', attraction: '#2E9B57', sports: '#2E9B57', gym: '#2E9B57',
  hotel: '#D24C97', cinema: '#D24C97',
  bus: '#2E7DE0', train: '#2E7DE0', station: '#2E7DE0', airport: '#2E7DE0', ferry: '#2E7DE0',
  fuel: '#2E7DE0', charging: '#2E7DE0', parking: '#2E7DE0',
  government: '#5D6B7E', police: '#5D6B7E', fire: '#5D6B7E', post: '#5D6B7E',
  toilet: '#8A8F98', other: '#8A8F98',
  street: '#8A8F98', barangay: '#0B9E6A', city: '#0B9E6A', place: '#0B9E6A',
};

export function iconColor(name) { return GROUP[name] || '#8A8F98'; }

export function iconName(kind, category) {
  if (category && ICONS[category]) return category;
  if (kind === 'station') return 'train';
  if (kind && ICONS[kind]) return kind;
  return 'place';
}

/** Inline SVG markup for an icon. */
export function svg(name, { size = 24, stroke = 2, cls = '' } = {}) {
  const ic = ICONS[name] || ICONS.other;
  const c = cls ? ` class="${cls}"` : '';
  if (ic.text) {
    return `<svg${c} width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="16" text-anchor="middle" font-size="10" font-weight="700" font-family="system-ui,sans-serif" fill="currentColor">${ic.text}</text></svg>`;
  }
  const paint = ic.fill
    ? 'fill="currentColor" stroke="none"'
    : `fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<svg${c} width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path ${paint} d="${ic.d}"/></svg>`;
}

/** Brand mark (matches the app icon): green tile, white pin, soft road curve. */
export function logoSvg(size = 72) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" aria-hidden="true">
  <defs><linearGradient id="mmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16C27F"/><stop offset="1" stop-color="#08935C"/></linearGradient></defs>
  <rect width="512" height="512" rx="110" fill="url(#mmg)"/>
  <path d="M84 436c60-30 120-30 180-26s120 6 172-32" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="26" stroke-linecap="round"/>
  <path d="M256 66c-75 0-136 59-136 133 0 92 136 245 136 245s136-153 136-245c0-74-61-133-136-133z" fill="#fff"/>
  <circle cx="256" cy="198" r="50" fill="#0B9E6A"/>
</svg>`;
}
