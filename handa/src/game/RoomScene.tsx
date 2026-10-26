import { memo, useMemo } from 'react';
import type { CategoryId, ItemShape } from '@/domain/types';
import type { RoomId } from '@/domain/rooms';
import { LAYOUTS, slotAt, type Unit } from './layouts';
import { FurnitureGlyph, Lamp, UnitGlyph, Window } from './Furniture';
import { GameDefs, Sprite } from './Sprites';

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
}

/** One-point perspective box: back wall 60..940 × 30..470, floor to 620. */
const P = { x0: 60, x1: 940, y0: 30, y1: 470, W: 1000, H: 620 };
const dk = (hex: string, k = .78) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`; };

function wrap(s: string, n = 34): string[] { const out: string[] = []; let line = ''; for (const w of s.split(' ')) { if ((line + ' ' + w).trim().length > n) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); } if (line) out.push(line); return out; }

export const RoomScene = memo(function RoomScene({ room, placed, weather, lightsOn, flicker, mini, freshKeys, selectedKey, highlightUnit, accent, info, onTapItem, onTapUnit, unitLabel, unitNote }: RoomSceneProps) {
  const L = LAYOUTS[room];
  const byUnit = useMemo(() => { const m = new Map<string, PlacedSprite[]>(); for (const p of placed) m.set(p.unitId, [...(m.get(p.unitId) ?? []), p]); return m; }, [placed]);
  const lamps = placed.filter((p) => p.shape === 'lamp');
  const daylight = !['dark', 'dusk'].includes(weather);
  const grade: Record<string, string> = { rain: 'rgba(70,110,170,.16)', flood: 'rgba(60,120,150,.16)', heat: 'rgba(255,160,60,.16)', dark: 'rgba(20,30,70,.3)', dry: 'rgba(255,250,230,.08)', shake: 'rgba(120,100,70,.14)', dusk: 'rgba(120,70,160,.2)', fog: 'rgba(60,140,100,.18)' };
  return (
    <svg viewBox={`0 0 ${P.W} ${P.H}`} preserveAspectRatio={mini ? 'xMidYMid slice' : 'xMidYMid meet'} className={`room ${mini ? 'room--mini' : ''}`} role={mini ? undefined : 'img'}>
      {!mini && <GameDefs />}
      {/* ceiling */}
      <path d={`M0 0H${P.W}L${P.x1} ${P.y0}H${P.x0}z`} fill={dk(L.wall, .9)} /><path d={`M0 0H${P.W}L${P.x1} ${P.y0}H${P.x0}z`} fill="url(#ao-ceiling)" />
      {/* side walls */}
      <path d={`M0 0L${P.x0} ${P.y0}V${P.y1}L0 ${P.H}z`} fill={dk(L.wall, .82)} /><path d={`M0 0L${P.x0} ${P.y0}V${P.y1}L0 ${P.H}z`} fill="url(#ao-left)" />
      <path d={`M${P.W} 0L${P.x1} ${P.y0}V${P.y1}L${P.W} ${P.H}z`} fill={dk(L.wall, .74)} /><path d={`M${P.W} 0L${P.x1} ${P.y0}V${P.y1}L${P.W} ${P.H}z`} fill="url(#ao-right)" />
      {/* back wall */}
      <rect x={P.x0} y={P.y0} width={P.x1 - P.x0} height={P.y1 - P.y0} fill={L.wall} />
      <rect x={P.x0} y={P.y0} width={P.x1 - P.x0} height={P.y1 - P.y0} fill="url(#wallpaper)" opacity={.45} />
      <rect x={P.x0} y={P.y0} width={P.x1 - P.x0} height={70} fill="url(#ao-ceiling)" style={{ transform: 'scaleY(-1)', transformOrigin: `0 ${P.y0 + 35}px` }} />
      <rect x={P.x0} y={P.y0} width={90} height={P.y1 - P.y0} fill="url(#ao-left)" opacity=".8" /><rect x={P.x1 - 90} y={P.y0} width={90} height={P.y1 - P.y0} fill="url(#ao-right)" opacity=".8" />
      {/* floor */}
      <path d={`M${P.x0} ${P.y1}H${P.x1}L${P.W} ${P.H}H0z`} fill={L.floor} />
      <path d={`M${P.x0} ${P.y1}H${P.x1}L${P.W} ${P.H}H0z`} fill="url(#wood)" opacity=".9" />
      {Array.from({ length: 9 }).map((_, i) => { const t = i / 8; const xb = P.x0 + (P.x1 - P.x0) * t; const xf = P.W * t; return <path key={i} d={`M${xb} ${P.y1}L${xf} ${P.H}`} stroke="rgba(0,0,0,.14)" strokeWidth={2} />; })}
      <path d={`M${P.x0} ${P.y1}H${P.x1}L${P.W} ${P.H}H0z`} fill="url(#ao-floor)" />
      <rect x={0} y={P.H - 22} width={P.W} height={22} fill={L.floorDark} opacity=".8" />
      {/* baseboard with shadow line */}
      <rect x={P.x0} y={P.y1 - 12} width={P.x1 - P.x0} height={14} fill={L.trim} /><rect x={P.x0} y={P.y1 - 12} width={P.x1 - P.x0} height={14} fill="url(#shade-top)" />
      <rect x={P.x0} y={P.y1 + 2} width={P.x1 - P.x0} height={10} fill="rgba(0,0,0,.25)" />
      {/* outlet + light switch, little props */}
      <g transform={`translate(${P.x1 - 60} ${P.y1 - 40})`}><rect width={22} height={16} rx={3} fill="#f3f0e8" /><circle cx={7} cy={8} r={2} fill="#444" /><circle cx={15} cy={8} r={2} fill="#444" /></g>
      {/* windows + light shafts */}
      {L.windows.map((w, i) => <Window key={i} w={w} weather={weather} lightsOn={lightsOn} />)}
      {daylight && !mini && L.windows.map((w, i) => Array.from({ length: 10 }).map((_, k) => <circle key={`m${i}${k}`} className="mote" style={{ animationDelay: `${(k * 331) % 3000}ms`, animationDuration: `${5 + (k % 4)}s` }} cx={w.x + 20 + ((k * 97) % (w.w + 160))} cy={w.y + 40 + ((k * 61) % 360)} r={1.6} fill="#fff" opacity=".55" />))}
      {daylight && L.windows.map((w, i) => <path key={`s${i}`} d={`M${w.x} ${w.y}L${w.x + w.w} ${w.y}L${w.x + w.w + 220} ${P.H}L${w.x - 60} ${P.H}z`} fill="url(#winshaft)" opacity={lightsOn ? .9 : .5} style={{ pointerEvents: 'none' }} />)}
      {/* lamps behind furniture */}
      {L.lamps.map((l, i) => <Lamp key={i} x={l.x} y={l.y} on={lightsOn} flicker={flicker} />)}
      {lightsOn && L.lamps.map((l, i) => <ellipse key={`pool${i}`} cx={l.x} cy={P.H - 70} rx={360} ry={90} fill="url(#lamppool)" style={{ pointerEvents: 'none' }} />)}
      {/* furniture */}
      {L.furniture.map((f, i) => <FurnitureGlyph key={i} f={f} />)}
      {/* units + items */}
      {L.units.map((u) => (
        <g key={u.id} className={`unit ${highlightUnit === u.id ? 'unit--hl' : ''}`} onClick={() => onTapUnit?.(u)}>
          <UnitGlyph u={u} accent={accent} />
          {highlightUnit === u.id && <rect x={u.x - 10} y={u.y - 10} width={u.w + 20} height={u.h + 20} rx={14} fill="none" stroke={accent} strokeWidth={5} className="unit__ring" />}
          {!mini && unitLabel && <g transform={`translate(${u.x} ${u.y - 18})`}><rect x={0} y={-16} width={unitLabel(u).length * 7.2 + 22} height={24} rx={12} fill="rgba(10,12,20,.55)" /><text x={11} y={1} fontSize={12} fontFamily="Inter Tight, system-ui" fontWeight={600} fill="#fff" letterSpacing=".02em">{unitLabel(u)}</text></g>}
          {(byUnit.get(u.id) ?? []).map((p) => {
            const s = slotAt(u, p.slot);
            const size = u.kind === 'floor' ? Math.min(s.h * 1.1, s.w * 1.25) : u.kind === 'hooks' ? Math.min(s.h * .9, s.w * 1.1) : Math.min(s.h * 1.05, s.w * 1.28);
            const k = Math.floor(p.slot / (u.cols * u.rows));
            const x = s.x + k * 8, y = s.y - k * 6 - size * .5;
            const fresh = freshKeys?.has(p.key);
            const sel = selectedKey === p.key;
            const hung = u.kind === 'hooks';
            return (
              <g key={p.key} className={`sprite ${fresh ? 'sprite--land' : ''} ${sel ? 'sprite--sel' : ''}`} style={{ transformOrigin: `${x}px ${y}px` }} onClick={(e) => { e.stopPropagation(); onTapItem?.(p); }}>
                <title>{p.name} ×{p.qty}</title>
                {hung && Array.from({ length: Math.min(p.qty, Math.max(1, u.cols - s.col)) }).map((_, i) => <g key={i}><path d={`M${x + i * s.w} ${y - size * .62}v-14`} stroke="#8a93a4" strokeWidth={3} /><Sprite shape={p.shape} color={p.color} size={size} x={x + i * s.w} y={y} qty={1} shadow={false} /></g>)}
                {!hung && u.kind === 'floor' && (p.shape === 'drum' || p.shape === 'gallon') && Array.from({ length: Math.min(p.qty, 3) - 1 }).map((_, i) => <Sprite key={i} shape={p.shape} color={p.color} size={size * (.94 - i * .04)} x={x + (i + 1) * size * .28} y={y - (i + 1) * 5} className="sprite__ghost" qty={1} />)}
                {!hung && u.kind !== 'floor' && p.qty >= 2 && !['bottle', 'can'].includes(p.shape) && <Sprite shape={p.shape} color={p.color} size={size * .96} x={x + size * .18} y={y - 3} className="sprite__ghost" qty={1} />}
                {!hung && <Sprite shape={p.shape} color={p.color} size={size} x={x} y={y} qty={p.qty} />}
                {p.qty > 1 && <g transform={`translate(${x + size * .4} ${y - size * .58})`}><rect x={-17} y={-11} width={34} height={21} rx={10} fill="#0b0d12" opacity=".75" /><rect x={-17} y={-11} width={34} height={21} rx={10} fill="none" stroke={p.color} strokeWidth={2} /><text y={4} textAnchor="middle" fontSize={12} fontWeight={800} fontFamily="JetBrains Mono, monospace" fill="#fff">×{p.qty > 99 ? '99+' : p.qty}</text></g>}
                {sel && <circle cx={x} cy={y} r={size * .62} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="8 6" className="sprite__ring" />}
              </g>
            );
          })}
        </g>
      ))}
      {/* signage: small stickers with the storage rule in one line */}
      {!mini && L.signs?.map((sg, i) => (
        <g key={`sign${i}`} transform={`translate(${sg.x} ${sg.y})`} style={{ pointerEvents: 'none' }}>
          <rect x={0} y={0} width={sg.text.length * 6.4 + 16} height={20} rx={4} fill={sg.color ?? '#ffc247'} /><rect x={0} y={0} width={sg.text.length * 6.4 + 16} height={20} rx={4} fill="url(#shade-top)" />
          <text x={8} y={14} fontSize={10.5} fontFamily="JetBrains Mono, monospace" fontWeight={800} fill="#1a0d05" letterSpacing=".04em">{sg.text}</text>
        </g>
      ))}
      {info && !mini && unitNote && L.units.map((u, i) => { const lines = wrap(unitNote(u)); const bw = Math.max(...lines.map((l) => l.length)) * 6.6 + 24; const bh = lines.length * 15 + 16; const right = u.x + u.w + 14 + bw < P.x1 - 10; const bx = right ? u.x + u.w + 14 : Math.max(P.x0 + 10, u.x + u.w - bw); const by = right ? u.y + 10 : u.y - bh - 34; const ax = u.x + u.w, ay = u.y + 20; return (
        <g key={`co${i}`} className="callout" style={{ pointerEvents: 'none' }}>
          <path d={`M${ax} ${ay}L${right ? bx : bx + bw - 20} ${right ? by + 14 : by + bh}`} stroke={accent} strokeWidth={2} /><circle cx={ax} cy={ay} r={5} fill={accent} stroke="#fff" strokeWidth={1.5} />
          <rect x={bx} y={by} width={bw} height={bh} rx={8} fill="rgba(10,12,20,.86)" stroke={accent} strokeWidth={1.5} />
          {lines.map((l, k) => <text key={k} x={bx + 12} y={by + 20 + k * 15} fontSize={11.5} fontFamily="Inter Tight, system-ui" fill="#fff">{l}</text>)}
        </g>
      ); })}
      {/* colour grade + darkness + lamp glow */}
      <rect x={0} y={0} width={P.W} height={P.H} fill={grade[weather] ?? 'transparent'} style={{ pointerEvents: 'none', mixBlendMode: 'multiply' }} />
      {!lightsOn && <rect x={0} y={0} width={P.W} height={P.H} fill="#070b1c" opacity={.66} style={{ pointerEvents: 'none' }} />}
      {!lightsOn && lamps.map((p) => { const u = L.units.find((x) => x.id === p.unitId); if (!u) return null; const s = slotAt(u, p.slot); return <g key={`g${p.key}`} style={{ pointerEvents: 'none' }}><circle cx={s.x} cy={s.y - 20} r={190} fill="url(#lampglow)" /><circle cx={s.x} cy={s.y - 20} r={60} fill="#ffe08a" opacity=".25" filter="url(#soft)" /></g>; })}
      {/* grain + vignette */}
      {!mini && <rect x={0} y={0} width={P.W} height={P.H} filter="url(#grain)" style={{ pointerEvents: 'none', mixBlendMode: 'overlay' }} />}
      {!mini && <rect x={0} y={0} width={P.W} height={P.H} fill="url(#vignette)" style={{ pointerEvents: 'none' }} />}
    </svg>
  );
});
