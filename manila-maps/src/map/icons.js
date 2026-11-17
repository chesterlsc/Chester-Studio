// Map images drawn at runtime (no sprite downloads): POI badges, one-way arrows,
// highway shields.
import { ICONS, iconColor } from '../assets/icons.js';

export const POI_CLASSES = [
  'mall', 'shop', 'supermarket', 'convenience', 'market', 'food', 'cafe', 'bar', 'bank', 'atm',
  'hospital', 'clinic', 'pharmacy', 'school', 'university', 'church', 'mosque', 'temple', 'park',
  'hotel', 'fuel', 'charging', 'parking', 'bus', 'train', 'airport', 'ferry', 'government',
  'police', 'fire', 'post', 'museum', 'attraction', 'cinema', 'gym', 'sports', 'library',
  'toilet', 'other',
];

function canvas(w, h, ratio) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * ratio);
  c.height = Math.round(h * ratio);
  const ctx = c.getContext('2d');
  ctx.scale(ratio, ratio);
  return { c, ctx };
}

function toImage(c, ctx) {
  return ctx.getImageData(0, 0, c.width, c.height);
}

/** Draw an icon glyph (24-grid) into ctx at (x, y) with given size. */
export function drawGlyph(ctx, name, x, y, size, color, lineWidth = 2.4) {
  const ic = ICONS[name] || ICONS.other;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  if (ic.text) {
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ic.text, 12, 12.5);
  } else {
    const p = new Path2D(ic.d);
    if (ic.fill) ctx.fill(p);
    else {
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke(p);
    }
  }
  ctx.restore();
}

function poiBadge(name, ratio) {
  const S = 22; // css px
  const { c, ctx } = canvas(S, S, ratio);
  const r = S / 2 - 1.5;
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, r + 1.3, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, r, 0, Math.PI * 2);
  ctx.fillStyle = iconColor(name);
  ctx.fill();
  drawGlyph(ctx, name, S / 2 - 6.5, S / 2 - 6.5, 13, '#ffffff', 2.6);
  return toImage(c, ctx);
}

function onewayArrow(ratio, color = '#7d828a') {
  const W = 20, H = 12;
  const { c, ctx } = canvas(W, H, ratio);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(2, H / 2); ctx.lineTo(W - 3, H / 2);
  ctx.moveTo(W - 8, 2); ctx.lineTo(W - 3, H / 2); ctx.lineTo(W - 8, H - 2);
  ctx.stroke();
  return toImage(c, ctx);
}

function shield(ratio) {
  // Stretchable rounded box for refs (icon-text-fit).
  const S = 20;
  const { c, ctx } = canvas(S, S, ratio);
  ctx.fillStyle = '#fff3d6';
  ctx.strokeStyle = '#e0a64a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(1, 1, S - 2, S - 2, 4);
  ctx.fill();
  ctx.stroke();
  return { img: toImage(c, ctx), stretch: { stretchX: [[6 * ratio, 14 * ratio]], stretchY: [[6 * ratio, 14 * ratio]], content: [5 * ratio, 5 * ratio, 15 * ratio, 15 * ratio] } };
}

export function addMapImages(map) {
  const ratio = Math.min(3, Math.max(1, Math.round(window.devicePixelRatio || 1)));
  for (const cls of POI_CLASSES) {
    if (!map.hasImage(`poi-${cls}`)) map.addImage(`poi-${cls}`, poiBadge(cls, ratio), { pixelRatio: ratio });
  }
  if (!map.hasImage('oneway')) map.addImage('oneway', onewayArrow(ratio), { pixelRatio: ratio });
  if (!map.hasImage('route-arrow')) map.addImage('route-arrow', onewayArrow(ratio, '#ffffff'), { pixelRatio: ratio });
  if (!map.hasImage('shield')) {
    const s = shield(ratio);
    map.addImage('shield', s.img, { pixelRatio: ratio, ...s.stretch });
  }
  // Unknown POI classes fall back to the generic badge.
  map.on('styleimagemissing', (e) => {
    if (e.id.startsWith('poi-') && !map.hasImage(e.id)) {
      map.addImage(e.id, poiBadge('other', ratio), { pixelRatio: ratio });
    }
  });
}
