// Maneuver arrow icons (48×48, drawn for the right-hand case and mirrored for left).
const HEAD = {
  up: 'M14 19 24 9l10 10',
  right: 'M27 9l9 9-9 9',
  slight: 'M22 12h12v12',
  sharp: 'M34 24v10H24',
  down: 'M24 27l8 8 8-8',
};

const SHAPES = {
  straight: { d: `M24 41V10 ${HEAD.up}` },
  right: { d: `M17 41V27a9 9 0 0 1 9-9h10 ${HEAD.right}` },
  slight: { d: `M19 41V29l14-15 ${HEAD.slight}` },
  sharp: { d: `M17 41V15l16 18 ${HEAD.sharp}` },
  uturn: { d: `M14 41V20a9 9 0 0 1 18 0v14 ${HEAD.down}` },
  merge: { d: `M24 41V10 ${HEAD.up}`, ghost: 'M13 41c0-10 4-14 11-18' },
  fork: { d: `M19 41V29l14-15 ${HEAD.slight}`, ghost: 'M19 30 12 18' },
  roundabout: { d: 'M24 41V30', circle: true, exit: `M28 15l6-6 ${'M27 8h8v8'}` },
  depart: { d: `M24 36V10 ${HEAD.up}`, dot: true },
  arrive: { flag: true },
};

export function maneuverSvg(maneuver, modifier, size = 44) {
  const mod = modifier || '';
  // U-turns in the Philippines (right-hand traffic) swing left unless told otherwise.
  const left = mod.includes('left') || ((maneuver === 'uturn' || mod === 'uturn') && !mod.includes('right'));
  let key;
  switch (maneuver) {
    case 'arrive': key = 'arrive'; break;
    case 'depart': key = 'depart'; break;
    case 'roundabout': key = 'roundabout'; break;
    case 'uturn': key = 'uturn'; break;
    case 'merge': key = 'merge'; break;
    case 'fork': key = mod.includes('left') || mod.includes('right') ? 'fork' : 'straight'; break;
    default:
      if (mod === 'uturn') key = 'uturn';
      else if (mod.startsWith('sharp')) key = 'sharp';
      else if (mod.startsWith('slight')) key = 'slight';
      else if (mod === 'left' || mod === 'right') key = 'right';
      else key = 'straight';
  }
  const s = SHAPES[key];
  const stroke = 'fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"';
  let inner = '';
  if (s.flag) {
    inner = `<path d="M15 42V8" ${stroke}/><path d="M15 9h20l-5 7 5 7H15z" fill="currentColor"/>`;
  } else {
    if (s.ghost) inner += `<path d="${s.ghost}" fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="4.5" stroke-linecap="round"/>`;
    if (s.circle) inner += `<circle cx="24" cy="21" r="8" fill="none" stroke="currentColor" stroke-width="4.5"/><path d="${s.exit}" ${stroke}/>`;
    inner += `<path d="${s.d}" ${stroke}/>`;
    if (s.dot) inner += '<circle cx="24" cy="41" r="4" fill="currentColor"/>';
  }
  const flip = left && key !== 'arrive' && key !== 'straight' && key !== 'depart' ? ' transform="matrix(-1 0 0 1 48 0)"' : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true"><g${flip}>${inner}</g></svg>`;
}
