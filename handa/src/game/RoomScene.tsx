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
  onTapItem?: (p: PlacedSprite) => void;
  onTapUnit?: (u: Unit) => void;
  unitLabel?: (u: Unit) => string;
}

export const RoomScene = memo(function RoomScene({ room, placed, weather, lightsOn, flicker, mini, freshKeys, selectedKey, highlightUnit, accent, onTapItem, onTapUnit, unitLabel }: RoomSceneProps) {
  const L = LAYOUTS[room];
  const byUnit = useMemo(() => { const m = new Map<string, PlacedSprite[]>(); for (const p of placed) m.set(p.unitId, [...(m.get(p.unitId) ?? []), p]); return m; }, [placed]);
  const lamps = placed.filter((p) => p.shape === 'lamp');
  return (
    <svg viewBox="0 0 1000 620" preserveAspectRatio={mini ? 'xMidYMid slice' : 'xMidYMid meet'} className={`room ${mini ? 'room--mini' : ''}`} role={mini ? undefined : 'img'}>
      {!mini && <GameDefs />}
      {/* wall */}
      <rect x={0} y={0} width={1000} height={470} fill={L.wall} />
      <rect x={0} y={0} width={1000} height={470} fill="url(#wallpaper)" opacity={.5} />
      <rect x={0} y={0} width={1000} height={90} fill={L.wallDark} opacity={.35} />
      {/* floor */}
      <rect x={0} y={470} width={1000} height={150} fill={L.floor} />
      <rect x={0} y={470} width={1000} height={150} fill="url(#wood)" />
      <rect x={0} y={600} width={1000} height={20} fill={L.floorDark} />
      <rect x={0} y={462} width={1000} height={12} fill={L.trim} />
      {/* windows + lamps (behind furniture) */}
      {L.windows.map((w, i) => <Window key={i} w={w} weather={weather} lightsOn={lightsOn} />)}
      {L.lamps.map((l, i) => <Lamp key={i} x={l.x} y={l.y} on={lightsOn} flicker={flicker} />)}
      {/* furniture */}
      {L.furniture.map((f, i) => <FurnitureGlyph key={i} f={f} />)}
      {/* units + items */}
      {L.units.map((u) => (
        <g key={u.id} className={`unit ${highlightUnit === u.id ? 'unit--hl' : ''}`} onClick={() => onTapUnit?.(u)}>
          <UnitGlyph u={u} accent={accent} />
          {highlightUnit === u.id && <rect x={u.x - 8} y={u.y - 8} width={u.w + 16} height={u.h + 16} rx={14} fill="none" stroke={accent} strokeWidth={5} className="unit__ring" />}
          {!mini && unitLabel && <g transform={`translate(${u.x} ${u.y - 14})`}><rect x={0} y={-16} width={unitLabel(u).length * 7.2 + 20} height={22} rx={11} fill="rgba(0,0,0,.42)" /><text x={10} y={0} fontSize={12} fontFamily="Inter Tight, system-ui" fontWeight={600} fill="#fff" letterSpacing=".02em">{unitLabel(u)}</text></g>}
          {(byUnit.get(u.id) ?? []).map((p) => {
            const s = slotAt(u, p.slot);
            const size = Math.min(s.w, s.h) * (u.kind === 'floor' ? 1.15 : .98);
            const k = Math.floor(p.slot / (u.cols * u.rows));
            const x = s.x + k * 8, y = s.y - k * 6;
            const fresh = freshKeys?.has(p.key);
            const sel = selectedKey === p.key;
            return (
              <g key={p.key} className={`sprite ${fresh ? 'sprite--land' : ''} ${sel ? 'sprite--sel' : ''}`} style={{ transformOrigin: `${x}px ${y}px` }} onClick={(e) => { e.stopPropagation(); onTapItem?.(p); }}>
                <title>{p.name} ×{p.qty}</title>
                {p.qty >= 3 && <Sprite shape={p.shape} color={p.color} size={size * .92} x={x - size * .22} y={y - 3} className="sprite__ghost" />}
                {p.qty >= 2 && <Sprite shape={p.shape} color={p.color} size={size * .96} x={x + size * .2} y={y - 2} className="sprite__ghost" />}
                <Sprite shape={p.shape} color={p.color} size={size} x={x} y={y} />
                {p.qty > 1 && <g transform={`translate(${x + size * .36} ${y - size * .56})`}><rect x={-16} y={-11} width={32} height={20} rx={10} fill={p.color} stroke="#fff" strokeWidth={2} /><text y={4} textAnchor="middle" fontSize={12} fontWeight={800} fontFamily="JetBrains Mono, monospace" fill="#1a0d05">×{p.qty > 99 ? '99+' : p.qty}</text></g>}
                {sel && <circle cx={x} cy={y} r={size * .62} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="8 6" className="sprite__ring" />}
              </g>
            );
          })}
        </g>
      ))}
      {/* darkness + lamp glow */}
      {!lightsOn && <rect x={0} y={0} width={1000} height={620} fill="#0a0f24" opacity={.62} style={{ pointerEvents: 'none' }} />}
      {!lightsOn && lamps.map((p) => { const u = L.units.find((x) => x.id === p.unitId); if (!u) return null; const s = slotAt(u, p.slot); return <circle key={`g${p.key}`} cx={s.x} cy={s.y - 20} r={170} fill="url(#lampglow)" style={{ pointerEvents: 'none' }} />; })}
      {/* vignette */}
      {!mini && <rect x={0} y={0} width={1000} height={620} fill="url(#vignette)" style={{ pointerEvents: 'none' }} />}
    </svg>
  );
});
