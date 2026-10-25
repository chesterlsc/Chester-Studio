import type { IconName } from './names';

/**
 * HANDA icon set. One stroke weight (2), round caps and joins, 24×24 grid,
 * simple geometry. Fills only via `fill="currentColor"` on small accents.
 */
const P: Record<IconName, string> = {
  // --- nav / system ---
  home: '<path d="M4 11 12 4l8 7v9H4z"/><path d="M10 20v-6h4v6"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  learn: '<path d="M4 6a2 2 0 0 1 2-2h5v16H6a2 2 0 0 1-2-2z"/><path d="M20 6a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 0 2-2z"/>',
  inventory: '<path d="M4 8h16v12H4z"/><path d="M8 8V5h8v3"/><path d="M4 13h16"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
  share: '<path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v8h14v-8"/>',
  download: '<path d="M12 3v12"/><path d="M8 11l4 4 4-4"/><path d="M5 20h14"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  volume: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
  'volume-off': '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l4 6M21 9l-4 6"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  flag: '<path d="M5 21V4h12l-2 4 2 4H5"/>',
  warning: '<path d="M12 3 2.5 20h19z"/><path d="M12 9v5"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".6" fill="currentColor"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  external: '<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v6H4V6h6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4l11-11-4-4L4 16z"/><path d="M13 7l4 4"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>',
  cloud: '<path d="M7 18a4 4 0 0 1-.6-7.9A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/>',
  'cloud-off': '<path d="M7 18a4 4 0 0 1-.6-7.9A6 6 0 0 1 16.5 7.5M18 9a4.5 4.5 0 0 1 1.3 8.4"/><path d="M4 4l16 16"/>',
  'wifi-off': '<path d="M2 8.5a15 15 0 0 1 6-3M12 5c3.5 0 6.8 1.3 10 3.5M5 12.5a10 10 0 0 1 3.5-2M12 10c2.5 0 4.9.8 7 2.5M8.5 16.5a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r=".8" fill="currentColor"/><path d="M3 3l18 18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 15a5 5 0 0 1 5.5 5"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
  print: '<path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/>',
  qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2v2"/>',

  // --- scenarios ---
  typhoon: '<circle cx="12" cy="12" r="3"/><path d="M12 3a9 9 0 0 0-9 9"/><path d="M12 21a9 9 0 0 0 9-9"/><path d="M15 12a3 3 0 0 0-3-3"/><path d="M9 12a3 3 0 0 0 3 3"/>',
  flood: '<path d="M4 9 12 3l8 6"/><path d="M6 9v4M18 9v4"/><path d="M2 16c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><path d="M2 20c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/>',
  heat: '<circle cx="12" cy="10" r="4"/><path d="M12 2v2M20 10h2M2 10h2M18 4l-1.4 1.4M6 4l1.4 1.4"/><path d="M4 19c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/>',
  brownout: '<path d="M13 2 5 14h6l-1 8 9-13h-6z"/>',
  water: '<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/><path d="M9 14a3 3 0 0 0 3 3"/>',
  earthquake: '<path d="M2 14h4l2-6 3 10 3-14 2 8 2-3 2 5h2"/>',
  unrest: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  zombie: '<path d="M7 20V9a5 5 0 0 1 10 0v11"/><path d="M7 20h10"/><path d="M9 11h2M13 11h2"/><path d="M10 15h4"/><path d="M12 15v3"/>',

  // --- categories ---
  'cat-water': '<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/>',
  'cat-food': '<path d="M5 8h14v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M5 8a7 7 0 0 1 14 0"/><path d="M9 12h6"/>',
  'cat-canning': '<path d="M8 4h8v3H8z"/><path d="M6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M6 12h12"/>',
  'cat-medicine': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3"/><path d="M12 11v5M9.5 13.5h5"/>',
  'cat-baby': '<circle cx="12" cy="13" r="7"/><path d="M12 6V3"/><path d="M9.5 13h.01M14.5 13h.01" stroke-width="2.5"/><path d="M10 16c1 1 3 1 4 0"/>',
  'cat-power': '<path d="M13 2 5 14h6l-1 8 9-13h-6z"/>',
  'cat-shelter': '<path d="M3 12 12 4l9 8"/><path d="M6 11v9h12v-9"/><path d="M10 20v-5h4v5"/>',
  'cat-hygiene': '<path d="M8 3h8l1 5H7z"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M9 14c0 3 1 5 3 7 2-2 3-4 3-7"/>',
  'cat-comms': '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8l10-5"/><circle cx="8" cy="14" r="2"/><path d="M13 12h5M13 16h5"/>',
  'cat-cash': '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01" stroke-width="2.5"/>',
  'cat-edc': '<path d="M6 8h12l1 13H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M9 13h6"/>',
  'cat-pets': '<circle cx="7" cy="9" r="2"/><circle cx="12" cy="6.5" r="2"/><circle cx="17" cy="9" r="2"/><path d="M12 11c-3 0-6 3-6 6 0 2 1.5 3 3 3 1 0 2-.5 3-.5s2 .5 3 .5c1.5 0 3-1 3-3 0-3-3-6-6-6z"/>',
  'cat-security': '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><rect x="9" y="11" width="6" height="5" rx="1"/><path d="M10.5 11V9.5a1.5 1.5 0 0 1 3 0V11"/>',

  // --- household ---
  adult: '<circle cx="12" cy="6" r="3"/><path d="M6 21v-6a6 6 0 0 1 12 0v6"/>',
  kid: '<circle cx="12" cy="8" r="3"/><path d="M7 21v-4a5 5 0 0 1 10 0v4"/>',
  baby: '<circle cx="12" cy="9" r="4"/><path d="M8 21v-3a4 4 0 0 1 8 0v3"/><path d="M12 5V3"/>',
  senior: '<circle cx="11" cy="6" r="3"/><path d="M5 21v-6a6 6 0 0 1 11-3"/><path d="M18 12v9"/>',
  pet: '<circle cx="7" cy="9" r="2"/><circle cx="12" cy="6.5" r="2"/><circle cx="17" cy="9" r="2"/><path d="M12 11c-3 0-6 3-6 6 0 2 1.5 3 3 3 1 0 2-.5 3-.5s2 .5 3 .5c1.5 0 3-1 3-3 0-3-3-6-6-6z"/>',
  wheelchair: '<circle cx="13" cy="4" r="2"/><path d="M11 8v6h6l3 6"/><circle cx="9" cy="17" r="4"/><path d="M11 8h5"/>',

  // --- content ---
  book: '<path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8 3v18M12 8h5M12 12h5"/>',
  tool: '<path d="M14.5 5.5a4 4 0 0 0 5 5L9 21l-5-5z"/><path d="M15 9l3 3"/>',
  dumbbell: '<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M8 13a6 6 0 1 1 8 0c-1 1-1.5 2-1.5 3h-5c0-1-.5-2-1.5-3z"/>',
  bandage: '<rect x="2" y="9" width="20" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M11 11h.01M13 13h.01M11 13h.01M13 11h.01" stroke-width="2.5"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  bag: '<path d="M6 8h12l1 13H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  radio: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8l10-5"/><circle cx="8" cy="14" r="2"/><path d="M13 12h5M13 16h5"/>',
  drop: '<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/>',
  bolt: '<path d="M13 2 5 14h6l-1 8 9-13h-6z"/>',
  fire: '<path d="M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 1-3 0 2 1 3 2 3 1-2-1-5 1-9z"/><path d="M8 14c-2 2-2 7 4 7s6-5 4-7"/>',
  eye: '<path d="M2 12c3-5 7-7 10-7s7 2 10 7c-3 5-7 7-10 7S5 17 2 12z"/><circle cx="12" cy="12" r="3"/>',
  ear: '<path d="M6 10a6 6 0 0 1 12 0c0 3-2 4-3 6s-1 5-4 5a3 3 0 0 1-3-3"/><path d="M10 10a2 2 0 0 1 4 0c0 2-2 2-2 4"/>',
  hand: '<path d="M8 12V5a1.5 1.5 0 0 1 3 0v6M11 10V4a1.5 1.5 0 0 1 3 0v7M14 10V5a1.5 1.5 0 0 1 3 0v8"/><path d="M8 12V8a1.5 1.5 0 0 0-3 0v7a7 7 0 0 0 14 0v-2"/>',
  footsteps: '<ellipse cx="8" cy="7" rx="2.5" ry="4"/><path d="M6 13h4v3a2 2 0 0 1-4 0z"/><ellipse cx="16" cy="12" rx="2.5" ry="4"/><path d="M14 18h4v1a2 2 0 0 1-4 0z"/>',
  door: '<path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17"/><path d="M3 21h18"/><circle cx="15" cy="12" r=".8" fill="currentColor"/>',
  window: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M12 4v16M4 12h16"/>',
  'house-cut': '<path d="M3 11 12 4l9 7"/><path d="M6 10v10h12V10"/><path d="M6 15h12M12 10v10"/>',
  trophy: '<path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3"/><path d="M12 13v4M8 21h8M9 17h6"/>',
  medal: '<circle cx="12" cy="15" r="5"/><path d="M8 3h8l-2 7M8 3l2 7"/>',
  streak: '<path d="M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 1-3 0 2 1 3 2 3 1-2-1-5 1-9z"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  title?: string;
}

export function Icon({ name, size = 24, title, ...rest }: IconProps) {
  const d = P[name] ?? P.help;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
      dangerouslySetInnerHTML={{ __html: (title ? `<title>${title}</title>` : '') + d }}
    />
  );
}
