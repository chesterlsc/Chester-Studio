import { memo, useMemo } from 'react';
import type { CategoryId, ItemShape } from '@/domain/types';
import type { RoomId } from '@/domain/rooms';
import { LAYOUTS, slotAt, type Unit } from './layouts';
import { FurnitureGlyph, Lamp, UnitGlyph, Window } from './Furniture';
import { spriteFor, spriteUrl } from '@/models/useSprite';
import { GameDefs, Sprite, INK, SH } from './Sprites';

export interface PlacedSprite { key: string; catalogId: string; shape: ItemShape; category: CategoryId; color: string; unitId: string; slot: number; qty: number; name: string; expiresAt?: number }

export interface RoomSceneProps {
  room: RoomId;
  placed: PlacedSprite[];
  weather: string;
  lightsOn: boolean;
  flicker?: boolean;
  mini?: boolean;
  freshKeys?: Set<string>;
  selectedKey?: string | null;
  highlightUnit?: string | null;
  accent: string;
  /** Show storage callouts pinned to each unit. */
  info?: boolean;
  onTapItem?: (p: PlacedSprite) => void;
  onTapUnit?: (u: Unit) => void;
  unitLabel?: (u: Unit) => string;
  unitNote?: (u: Unit) => string;
  /** Item art: pre-rendered 3D cartoon sprites ('3d') or vector sprites (default). */
  art?: '3d' | 'vector';
}

/**
 * TOON ROOM RULES (see Sprites.tsx for the shared ink/cel contract)
 * - The room is a one-point-perspective box drawn with FLAT warm colours: back wall, two side walls,
 *   ceiling and floor are each one tone, separated by thick INK corner lines (no soft AO on edges;
 *   the ambient-occlusion gradients that remain are faint and only soften large planes).
 * - Architecture is inked like a prop: cornice strip at the top of the back wall, baseboard with a hard
 *   shadow band under it, plank lines on the floor in warm ink at low opacity.
 * - Dressing comes from layouts.ts `furniture` (rugs, posters, plants, curtains, clocks, Filipino touches)
 *   and is positioned so it never covers a unit's box or slot grid; units are always drawn after furniture.
 * - Soft things (light shafts, lamp pools, glows, grain, vignette) are NOT outlined. Grain/vignette/motes
 *   are desktop-only (`!mini`). Mini rooms rely on CSS: `.room--mini .ink` is 1.7× thicker and `.fx`/`.ink2`
 *   details are hidden, so thumbnails read as chunky silhouettes.
 * - HUD chrome inside the SVG (unit labels, signs, callouts, qty badges) is cream/ink paper with a 2-unit ink
 *   stroke so it belongs to the drawing but stays legible over any wall colour.
 */
/** One-point perspective box: back wall 60..940 × 30..470, floor to 620. */
const P = { x0: 60, x1: 940, y0: 30, y1: 470, W: 1000, H: 620 };
const dk = (hex: string, k = .78) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`; };

function wrap(s: string, n = 34): string[] { const out: string[] = []; let line = ''; for (const w of s.split(' ')) { if ((line + ' ' + w).trim().length > n) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); } if (line) out.push(line); return out; }

/**
 * One item in a slot: the pre-rendered 3D cartoon sprite (a WebP with its own
 * ink outline and cel shading) when `art` is '3d' and the item was rendered,
 * otherwise the vector Sprite. `x`/`y` are the vector sprite's centre; its base
 * sits at y + size/2, and the image is placed so its contact point lands there.
 */
function Art({ art, catalogId, shape, color, size, x, y, qty, shadow = true, className, fit = 1.22 }: { art?: '3d' | 'vector'; catalogId: string; shape: ItemShape; color: string; size: number; x: number; y: number; qty: number; shadow?: boolean; className?: string; fit?: number }) {
  const e = art === '3d' ? spriteFor(catalogId, qty) : undefined;
  if (!e) return <Sprite shape={shape} color={color} size={size} x={x} y={y} qty={qty} shadow={shadow} className={className} />;
  const w = size * fit, h = w * e.h / e.w, base = y + size * .5;
  return (
    <g className={className}>
      {shadow && <ellipse cx={x} cy={base - 1} rx={w * .36} ry={w * .06} fill="rgba(42,24,18,.3)" />}
      <image href={spriteUrl(e)} x={x - w / 2} y={base - h * e.base} width={w} height={h} preserveAspectRatio="xMidYMid meet" style={{ pointerEvents: 'none' }} />
    </g>
  );
}

export const RoomScene = memo(function RoomScene({ room, placed, weather, lightsOn, flicker, mini, freshKeys, selectedKey, highlightUnit, accent, info, onTapItem, onTapUnit, unitLabel, unitNote, art }: RoomSceneProps) {
  const L = LAYOUTS[room];
  const byUnit = useMemo(() => { const m = new Map<string, PlacedSprite[]>(); for (const p of placed) m.set(p.unitId, [...(m.get(p.unitId) ?? []), p]); return m; }, [placed]);
  const lamps = placed.filter((p) => p.shape === 'lamp');
  const daylight = !['dark', 'dusk'].includes(weather);
  const grade: Record<string, string> = { rain: 'rgba(70,110,170,.14)', flood: 'rgba(60,120,150,.14)', heat: 'rgba(255,160,60,.16)', dark: 'rgba(40,30,80,.3)', dry: 'rgba(255,240,210,.1)', shake: 'rgba(120,100,70,.12)', dusk: 'rgba(140,70,160,.2)', fog: 'rgba(60,140,100,.16)' };
  const floorLine = 'rgba(42,24,18,.22)';
  return (
    <svg viewBox={`0 0 ${P.W} ${P.H}`} preserveAspectRatio={mini ? 'xMidYMid slice' : 'xMidYMid meet'} className={`room ${mini ? 'room--mini' : ''}`} role={mini ? undefined : 'img'}>
      {!mini && <GameDefs />}
      {/* ceiling */}
      <path d={`M0 0H${P.W}L${P.x1} ${P.y0}H${P.x0}z`} fill={dk(L.wall, .9)} />
      {/* side walls */}
      <path d={`M0 0L${P.x0} ${P.y0}V${P.y1}L0 ${P.H}z`} fill={dk(L.wall, .84)} /><path d={`M0 0L${P.x0} ${P.y0}V${P.y1}L0 ${P.H}z`} fill="url(#ao-left)" opacity=".5" />
      <path d={`M${P.W} 0L${P.x1} ${P.y0}V${P.y1}L${P.W} ${P.H}z`} fill={dk(L.wall, .76)} /><path d={`M${P.W} 0L${P.x1} ${P.y0}V${P.y1}L${P.W} ${P.H}z`} fill="url(#ao-right)" opacity=".5" />
      {/* back wall */}
      <rect x={P.x0} y={P.y0} width={P.x1 - P.x0} height={P.y1 - P.y0} fill={L.wall} />
      <rect className="fx" x={P.x0} y={P.y0} width={P.x1 - P.x0} height={P.y1 - P.y0} fill="url(#wallpaper)" opacity={.5} />
      <rect x={P.x0} y={P.y0} width={P.x1 - P.x0} height={70} fill="url(#ao-ceiling)" opacity=".6" style={{ transform: 'scaleY(-1)', transformOrigin: `0 ${P.y0 + 35}px` }} />
      {/* floor */}
      <path d={`M${P.x0} ${P.y1}H${P.x1}L${P.W} ${P.H}H0z`} fill={L.floor} />
      <path className="fx" d={`M${P.x0} ${P.y1}H${P.x1}L${P.W} ${P.H}H0z`} fill="url(#planks)" opacity=".55" />
      {Array.from({ length: 9 }).map((_, i) => { const t = i / 8; const xb = P.x0 + (P.x1 - P.x0) * t; const xf = P.W * t; return <path key={i} d={`M${xb} ${P.y1}L${xf} ${P.H}`} stroke={floorLine} strokeWidth={2.5} />; })}
      <path d={`M${P.x0} ${P.y1}H${P.x1}L${P.W} ${P.H}H0z`} fill="url(#ao-floor)" opacity=".7" />
      <rect x={0} y={P.H - 22} width={P.W} height={22} fill={L.floorDark} opacity=".85" />
      {/* cornice + baseboard (inked architecture) */}
      <rect className="ink" x={P.x0 - 2} y={P.y0 - 2} width={P.x1 - P.x0 + 4} height={14} rx={2} fill={L.trim} />
      <rect x={P.x0} y={P.y0 + 12} width={P.x1 - P.x0} height={8} fill={SH} />
      <rect className="ink" x={P.x0 - 2} y={P.y1 - 14} width={P.x1 - P.x0 + 4} height={16} rx={2} fill={L.trim} />
      <rect x={P.x0} y={P.y1 + 2} width={P.x1 - P.x0} height={12} fill={SH} />
      {/* corner ink lines */}
      <path d={`M0 0L${P.x0} ${P.y0}H${P.x1}L${P.W} 0M${P.x0} ${P.y0}V${P.y1}L0 ${P.H}M${P.x1} ${P.y0}V${P.y1}L${P.W} ${P.H}M${P.x0} ${P.y1}H${P.x1}`} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" opacity=".85" />
      {/* outlet + light switch */}
      <g className="fx" transform={`translate(${P.x1 - 64} ${P.y1 - 44})`}><rect width={26} height={18} rx={4} fill="#fff8ec" stroke={INK} strokeWidth={2} /><circle cx={8} cy={9} r={2.2} fill={INK} /><circle cx={18} cy={9} r={2.2} fill={INK} /></g>
      {/* windows + light shafts */}
      {L.windows.map((w, i) => <Window key={i} w={w} weather={weather} lightsOn={lightsOn} />)}
      {daylight && !mini && L.windows.map((w, i) => Array.from({ length: 10 }).map((_, k) => <circle key={`m${i}${k}`} className="mote" style={{ animationDelay: `${(k * 331) % 3000}ms`, animationDuration: `${5 + (k % 4)}s` }} cx={w.x + 20 + ((k * 97) % (w.w + 160))} cy={w.y + 40 + ((k * 61) % 360)} r={1.8} fill="#fff" opacity=".6" />))}
      {daylight && L.windows.map((w, i) => <path key={`s${i}`} d={`M${w.x} ${w.y}L${w.x + w.w} ${w.y}L${w.x + w.w + 220} ${P.H}L${w.x - 60} ${P.H}z`} fill="url(#winshaft)" opacity={lightsOn ? .9 : .5} style={{ pointerEvents: 'none' }} />)}
      {/* lamps behind furniture */}
      {L.lamps.map((l, i) => <Lamp key={i} x={l.x} y={l.y} on={lightsOn} flicker={flicker} />)}
      {lightsOn && L.lamps.map((l, i) => <ellipse key={`pool${i}`} cx={l.x} cy={P.H - 70} rx={360} ry={90} fill="url(#lamppool)" style={{ pointerEvents: 'none' }} />)}
      {/* furniture + props */}
      {L.furniture.map((f, i) => <FurnitureGlyph key={i} f={f} />)}
      {/* units + items */}
      {L.units.map((u) => (
        <g key={u.id} className={`unit ${highlightUnit === u.id ? 'unit--hl' : ''}`} onClick={() => onTapUnit?.(u)}>
          <UnitGlyph u={u} accent={accent} />
          {highlightUnit === u.id && <rect x={u.x - 10} y={u.y - 10} width={u.w + 20} height={u.h + 20} rx={14} fill="none" stroke={accent} strokeWidth={6} className="unit__ring" />}
          {!mini && unitLabel && <g transform={`translate(${u.x} ${u.y - 20})`}><rect x={0} y={-16} width={unitLabel(u).length * 7.2 + 24} height={26} rx={13} fill="#fff8ec" stroke={INK} strokeWidth={2.5} /><text x={12} y={2} fontSize={12.5} fontFamily="Sora, system-ui" fontWeight={700} fill={INK} letterSpacing=".01em">{unitLabel(u)}</text></g>}
          {(byUnit.get(u.id) ?? []).map((p) => {
            const s = slotAt(u, p.slot);
            const size = u.kind === 'floor' ? Math.min(s.h * 1.1, s.w * 1.25) : u.kind === 'hooks' ? Math.min(s.h * .9, s.w * 1.1) : Math.min(s.h * 1.05, s.w * 1.28);
            const k = Math.floor(p.slot / (u.cols * u.rows));
            const x = s.x + k * 8, y = s.y - k * 6 - size * .5;
            const fresh = freshKeys?.has(p.key);
            const sel = selectedKey === p.key;
            const hung = u.kind === 'hooks';
            const fit = u.kind === 'floor' ? 1.42 : hung ? 1.1 : 1.22;
            return (
              <g key={p.key} className={`sprite ${fresh ? 'sprite--land' : ''} ${sel ? 'sprite--sel' : ''}`} style={{ transformOrigin: `${x}px ${y}px` }} onClick={(e) => { e.stopPropagation(); onTapItem?.(p); }}>
                <title>{p.name} ×{p.qty}</title>
                {hung && Array.from({ length: Math.min(p.qty, Math.max(1, u.cols - s.col)) }).map((_, i) => <g key={i}><path d={`M${x + i * s.w} ${y - size * .62}v-14`} stroke={INK} strokeWidth={4} strokeLinecap="round" /><Art art={art} fit={fit} catalogId={p.catalogId} shape={p.shape} color={p.color} size={size} x={x + i * s.w} y={y} qty={1} shadow={false} /></g>)}
                {!hung && u.kind === 'floor' && (p.shape === 'drum' || p.shape === 'gallon') && Array.from({ length: Math.min(p.qty, 3) - 1 }).map((_, i) => <Art key={i} art={art} fit={fit} catalogId={p.catalogId} shape={p.shape} color={p.color} size={size * (.94 - i * .04)} x={x + (i + 1) * size * .28} y={y - (i + 1) * 5} className="sprite__ghost" qty={1} />)}
                {!hung && u.kind !== 'floor' && p.qty >= 2 && !['bottle', 'can'].includes(p.shape) && <Art art={art} fit={fit} catalogId={p.catalogId} shape={p.shape} color={p.color} size={size * .96} x={x + size * .18} y={y - 3} className="sprite__ghost" qty={1} />}
                {!hung && <Art art={art} fit={fit} catalogId={p.catalogId} shape={p.shape} color={p.color} size={size} x={x} y={y} qty={p.qty} />}
                {p.qty > 1 && <g transform={`translate(${x + size * .4} ${y - size * .58})`}><rect x={-18} y={-12} width={36} height={23} rx={11.5} fill={INK} /><rect x={-18} y={-12} width={36} height={23} rx={11.5} fill="none" stroke={p.color} strokeWidth={2.5} /><text y={4.5} textAnchor="middle" fontSize={12} fontWeight={800} fontFamily="JetBrains Mono, monospace" fill="#fff">×{p.qty > 99 ? '99+' : p.qty}</text></g>}
                {sel && <circle cx={x} cy={y} r={size * .62} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="8 6" className="sprite__ring" />}
              </g>
            );
          })}
        </g>
      ))}
      {/* signage: small stickers with the storage rule in one line */}
      {!mini && L.signs?.map((sg, i) => (
        <g key={`sign${i}`} transform={`translate(${sg.x} ${sg.y})`} style={{ pointerEvents: 'none' }}>
          <rect x={0} y={0} width={sg.text.length * 6.4 + 16} height={21} rx={5} fill={sg.color ?? '#ffc247'} stroke={INK} strokeWidth={2.5} />
          <rect x={3} y={14} width={sg.text.length * 6.4 + 10} height={4} rx={2} fill={SH} />
          <text x={8} y={14.5} fontSize={10.5} fontFamily="JetBrains Mono, monospace" fontWeight={800} fill={INK} letterSpacing=".04em">{sg.text}</text>
        </g>
      ))}
      {info && !mini && unitNote && L.units.map((u, i) => { const lines = wrap(unitNote(u)); const bw = Math.max(...lines.map((l) => l.length)) * 6.6 + 24; const bh = lines.length * 15 + 16; const right = u.x + u.w + 14 + bw < P.x1 - 10; const bx = right ? u.x + u.w + 14 : Math.max(P.x0 + 10, u.x + u.w - bw); const by = right ? u.y + 10 : Math.max(P.y0 + 14, u.y - bh - 34); const ax = u.x + u.w, ay = u.y + 20; return (
        <g key={`co${i}`} className="callout" style={{ pointerEvents: 'none' }}>
          <path d={`M${ax} ${ay}L${right ? bx : bx + bw - 20} ${right ? by + 14 : by + bh}`} stroke={INK} strokeWidth={4} /><path d={`M${ax} ${ay}L${right ? bx : bx + bw - 20} ${right ? by + 14 : by + bh}`} stroke={accent} strokeWidth={2} /><circle cx={ax} cy={ay} r={6} fill={accent} stroke={INK} strokeWidth={2} />
          <rect x={bx} y={by} width={bw} height={bh} rx={9} fill="rgba(42,24,18,.9)" stroke={accent} strokeWidth={2} />
          {lines.map((l, k) => <text key={k} x={bx + 12} y={by + 20 + k * 15} fontSize={11.5} fontFamily="Inter Tight, system-ui" fill="#fff8ec">{l}</text>)}
        </g>
      ); })}
      {/* colour grade + darkness + lamp glow */}
      <rect x={0} y={0} width={P.W} height={P.H} fill={grade[weather] ?? 'transparent'} style={{ pointerEvents: 'none', mixBlendMode: 'multiply' }} />
      {!lightsOn && <rect x={0} y={0} width={P.W} height={P.H} fill="#160c24" opacity={.66} style={{ pointerEvents: 'none' }} />}
      {!lightsOn && lamps.map((p) => { const u = L.units.find((x) => x.id === p.unitId); if (!u) return null; const s = slotAt(u, p.slot); return <g key={`g${p.key}`} style={{ pointerEvents: 'none' }}><circle cx={s.x} cy={s.y - 20} r={190} fill="url(#lampglow)" /><circle cx={s.x} cy={s.y - 20} r={60} fill="#ffe08a" opacity=".25" filter="url(#soft)" /></g>; })}
      {/* grain + vignette */}
      {!mini && <rect x={0} y={0} width={P.W} height={P.H} filter="url(#grain)" style={{ pointerEvents: 'none', mixBlendMode: 'overlay' }} />}
      {!mini && <rect x={0} y={0} width={P.W} height={P.H} fill="url(#vignette)" style={{ pointerEvents: 'none' }} />}
    </svg>
  );
});
