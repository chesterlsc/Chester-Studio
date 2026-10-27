import type { RoomId } from '@/domain/rooms';
import { ROOMS } from '@/domain/rooms';
import { HOUSE_GRID } from './layouts';
import { RoomScene, type PlacedSprite } from './RoomScene';
import { GameDefs, INK, SH, HL, bandR } from './Sprites';

export interface HouseMapProps {
  /** Item art passed through to the mini rooms. */
  art?: '3d' | 'vector';
  placedByRoom: Partial<Record<RoomId, PlacedSprite[]>>;
  roomPct: Partial<Record<RoomId, number>>;
  missingCount: Partial<Record<RoomId, number>>;
  weather: string;
  lightsOn: boolean;
  flicker?: boolean;
  onSelect: (room: RoomId) => void;
  label: (room: RoomId) => string;
}

/**
 * Dollhouse cut-away in the toon style: flat two-tone cartoon sky with hard clouds, a chunky
 * inked gable roof with shingle rows, cream outer walls and wood floor slabs with INK outlines,
 * and a little garden (lawn, picket fence, gate, bushes, path) under the house. The 9 mini rooms
 * are RoomScene in `mini` mode (thicker ink, no fine detail) so they read at thumbnail size.
 */
const CW = 320, CH = 190, X0 = 20, Y0 = 136, SLAB = 12, VH = 820;
const HB = Y0 + 3 * CH + 2 * SLAB; // bottom of the lowest room row (730); the garden lives below it
const SKY: Record<string, [string, string]> = { rain: ['#2b4470', '#6a8ab8'], flood: ['#2e5470', '#7aa3b8'], heat: ['#ff9a3d', '#ffd9a0'], dark: ['#0a0e22', '#1e2440'], dry: ['#4fa8e0', '#cfeaf8'], shake: ['#857c6a', '#d6c9ae'], dusk: ['#452f6b', '#9a6fc4'], fog: ['#234a36', '#5f8f73'] };

function Cloud({ x, y, s = 1, c = '#fff' }: { x: number; y: number; s?: number; c?: string }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} fill={c}><circle cx={0} cy={0} r={22} /><circle cx={26} cy={-8} r={28} /><circle cx={56} cy={2} r={20} /><rect x={-12} y={0} width={80} height={20} rx={10} /></g>;
}
function Bush({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><circle className="ink" cx={0} cy={0} r={18} fill="#4f9d5a" /><circle className="ink" cx={22} cy={-4} r={20} fill="#5fae63" /><circle className="ink" cx={42} cy={2} r={16} fill="#4f9d5a" /><path d="M30 -24a20 20 0 0 1 12 26h-10z" fill={SH} /><circle cx={8} cy={-6} r={3} fill="#ff6a8a" /><circle cx={30} cy={-12} r={3} fill="#ffd166" /><circle cx={44} cy={-4} r={3} fill="#ff6a8a" /></g>;
}

export function HouseMap({ placedByRoom, roomPct, missingCount, weather, lightsOn, flicker, onSelect, label, art }: HouseMapProps) {
  const [top, bottom] = SKY[weather] ?? SKY.dry;
  const night = weather === 'dark' || weather === 'dusk';
  const cloud = night ? '#2a3350' : (weather === 'rain' || weather === 'flood') ? '#8ea6c8' : '#fff';
  const wallL = X0 - 14, wallR = X0 + 3 * CW + 14;
  return (
    <div className="scene scene--map">
    <svg viewBox={`0 0 1000 ${VH}`} className="hmap" preserveAspectRatio="xMidYMid meet" role="img">
      <GameDefs />
      {/* sky: two hard bands + clouds */}
      <rect width={1000} height={VH} fill={top} rx={24} />
      <path d={`M0 ${VH * .42}q250 -40 500 0t500 0V${VH - 24}q0 24 -24 24H24q-24 0 -24 -24z`} fill={bottom} opacity=".75" />
      <g opacity=".95"><Cloud x={110} y={60} s={1} c={cloud} /><Cloud x={760} y={40} s={.8} c={cloud} /><Cloud x={880} y={210} s={.6} c={cloud} /><Cloud x={-10} y={230} s={.7} c={cloud} /></g>
      {(weather === 'heat' || weather === 'dry') && <g><circle cx={900} cy={70} r={56} fill="#ffe08a" opacity=".35" /><circle className="ink" cx={900} cy={70} r={40} fill="#ffd166" /><circle className="fx" cx={888} cy={58} r={9} fill={HL} /></g>}
      {night && <g><circle className="ink" cx={880} cy={70} r={34} fill="#fff4cc" /><circle cx={866} cy={62} r={6} fill="#e8dcb0" /><circle cx={892} cy={84} r={4} fill="#e8dcb0" /></g>}
      {/* garden ground */}
      <path className="ink" d={`M-6 ${HB + 8}H1006V${VH + 10}H-6z`} fill="#5aa75f" />
      <rect x={0} y={HB + 34} width={1000} height={VH - HB - 34} fill="#4a8f50" />
      <path d={`M0 ${VH - 24}h1000v24H0z`} fill="#3f7f45" />
      {/* path + gate under the entry (bottom-right room) */}
      <path className="ink" d={`M${X0 + 2 * CW + 90} ${HB + 8}h160l40 ${VH - HB - 8}H${X0 + 2 * CW + 40}z`} fill="#e3cfa6" />
      <path className="fx" d={`M${X0 + 2 * CW + 110} ${HB + 22}h120M${X0 + 2 * CW + 100} ${HB + 40}h150`} stroke="rgba(42,24,18,.25)" strokeWidth={3} strokeLinecap="round" />
      {/* picket fence (left + right of the path) */}
      {[[-4, X0 + 2 * CW + 60], [X0 + 2 * CW + 290, 1004]].map(([a, b], k) => <g key={k}>{Array.from({ length: Math.floor((b - a) / 26) }).map((_, i) => <path key={i} className="ink" d={`M${a + 6 + i * 26} ${HB + 50}v-26l6 -8 6 8v26z`} fill="#fff6e0" style={{ strokeWidth: 4 }} />)}<rect className="ink" x={a} y={HB + 26} width={b - a} height={6} rx={3} fill="#f3e3bd" style={{ strokeWidth: 4 }} /><rect className="ink" x={a} y={HB + 40} width={b - a} height={6} rx={3} fill="#f3e3bd" style={{ strokeWidth: 4 }} /></g>)}
      {/* gate */}
      <g transform={`translate(${X0 + 2 * CW + 70} ${HB + 12})`}><rect className="ink" x={0} y={0} width={14} height={40} rx={4} fill="#8a5a36" /><rect className="ink" x={206} y={0} width={14} height={40} rx={4} fill="#8a5a36" /><path d="M14 12h192M14 30h192" stroke={INK} strokeWidth={9} /><path d="M14 12h192M14 30h192" stroke="#c98a4b" strokeWidth={4} />{[40, 80, 120, 160].map((gx) => <rect key={gx} className="ink" x={gx} y={4} width={8} height={32} rx={3} fill="#c98a4b" style={{ strokeWidth: 3 }} />)}</g>
      <Bush x={60} y={HB + 36} s={.8} /><Bush x={X0 + 2 * CW - 70} y={HB + 40} s={.7} /><Bush x={940} y={HB + 40} s={.6} />
      {/* mailbox */}
      <g transform={`translate(${X0 + 2 * CW + 300} ${HB - 12})`}><rect className="ink" x={10} y={16} width={6} height={44} fill="#8a5a36" /><rect className="ink" x={-6} y={0} width={38} height={22} rx={8} fill="#e8503f" /><rect x={-6} y={0} width={14} height={22} rx={6} fill="#ffd166" stroke={INK} strokeWidth={2} /></g>
      {/* roof: gable with shingle rows */}
      <path className="ink" d="M-10 130 500 2 1010 130z" fill="#b94a3d" style={{ strokeWidth: 8 }} />
      {[0, 1, 2, 3].map((i) => { const t = i / 4; const y = 130 - (130 - 2) * t; const hw = 510 * (1 - t); return <path key={i} d={`M${500 - hw} ${y}H${500 + hw}`} stroke={INK} strokeWidth={3} opacity=".55" strokeDasharray="30 6" />; })}
      <path d="M500 2 1010 130H760z" fill={SH} />
      <path className="ink" d="M-10 130H1010l-14 12H4z" fill="#8a2f28" style={{ strokeWidth: 6 }} />
      {/* chimney + attic vent */}
      <rect className="ink" x={760} y={26} width={54} height={64} rx={4} fill="#9a4a3a" /><rect className="ink" x={750} y={18} width={74} height={16} rx={4} fill="#6a2f24" /><path d={bandR(760, 26, 54, 64, 4)} fill={SH} />
      <g className="fx"><circle cx={775} cy={6} r={9} fill="#fff" opacity=".7" /><circle cx={792} cy={-4} r={12} fill="#fff" opacity=".5" /></g>
      <g transform="translate(500 70)"><path className="ink" d="M-34 24 0-8l34 32v30h-68z" fill="#ffd166" /><path d="M0 -8l34 32v30H10z" fill={SH} /><path className="ink" d="M-8 54V36h16v18" fill="#8a2f28" style={{ strokeWidth: 4 }} /><circle cx={0} cy={22} r={8} fill="#9fd9ff" stroke={INK} strokeWidth={3} /></g>
      {/* outer walls */}
      <rect className="ink" x={wallL} y={Y0 - 8} width={16} height={HB - Y0 + 20} rx={3} fill="#f3e3bd" style={{ strokeWidth: 6 }} /><rect className="ink" x={wallR - 16} y={Y0 - 8} width={16} height={HB - Y0 + 20} rx={3} fill="#e9d2a2" style={{ strokeWidth: 6 }} />
      {HOUSE_GRID.map((row, r) => (
        <g key={r}>
          {row.map((room, c) => {
            const x = X0 + c * CW, y = Y0 + r * (CH + SLAB);
            const pct = roomPct[room] ?? 0; const miss = missingCount[room] ?? 0;
            const name = label(room);
            return (
              <g key={room} className="hmap__cell" onClick={() => onSelect(room)} role="button" aria-label={name}>
                <svg x={x} y={y} width={CW} height={CH} viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice">
                  <RoomScene room={room} placed={placedByRoom[room] ?? []} weather={weather} lightsOn={lightsOn} flicker={flicker} mini accent={ROOMS[room].hue} art={art} />
                </svg>
                <rect x={x} y={y} width={CW} height={CH} className="hmap__frame" rx={3} />
                {/* label */}
                <g transform={`translate(${x + 12} ${y + CH - 16})`}>
                  <rect x={0} y={-22} width={name.length * 8.4 + 60} height={30} rx={15} fill="#fff8ec" stroke={INK} strokeWidth={3} />
                  <text x={12} y={-2} fontSize={14} fontWeight={700} fontFamily="Sora, system-ui" fill={INK}>{name}</text>
                  <text x={name.length * 8.4 + 24} y={-2} fontSize={12} fontFamily="JetBrains Mono, monospace" fill={pct >= .99 ? '#1f9d63' : '#8a5a36'} fontWeight={800}>{Math.round(pct * 100)}%</text>
                </g>
                <rect x={x} y={y + CH - 6} width={CW} height={6} fill={INK} opacity=".4" /><rect x={x} y={y + CH - 6} width={CW * pct} height={6} fill={pct >= .99 ? '#3ddc97' : ROOMS[room].hue} />
                {miss > 0 ? (
                  <g transform={`translate(${x + CW - 22} ${y + 22})`}><g className="hmap__badge"><circle r={16} fill="#ff5d6c" stroke={INK} strokeWidth={3.5} /><text y={5.5} textAnchor="middle" fontSize={15} fontWeight={800} fontFamily="JetBrains Mono, monospace" fill="#fff">{miss}</text></g></g>
                ) : pct >= .99 ? (
                  <g transform={`translate(${x + CW - 22} ${y + 22})`}><g className="hmap__badge"><circle r={16} fill="#3ddc97" stroke={INK} strokeWidth={3.5} /><path d="M-7 0l5 5 9-10" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" /></g></g>
                ) : null}
                <rect x={x} y={y} width={CW} height={CH} fill="transparent" />
              </g>
            );
          })}
          {r < 2 && <rect className="ink" x={wallL} y={Y0 + (r + 1) * CH + r * SLAB} width={wallR - wallL} height={SLAB} fill="#c98a4b" style={{ strokeWidth: 5 }} />}
        </g>
      ))}
      <rect className="ink" x={wallL - 10} y={HB} width={wallR - wallL + 20} height={14} rx={3} fill="#b07a48" style={{ strokeWidth: 6 }} />
    </svg>
    {/* continuous weather lives in a thin overlay so the inked dollhouse is painted once */}
    <svg viewBox={`0 0 1000 ${VH}`} className="hmap hmap-fx" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {(weather === 'rain' || weather === 'flood') && Array.from({ length: 40 }).map((_, i) => <path key={i} className="wx-drop" style={{ animationDelay: `${(i * 97) % 1000}ms` }} d={`M${(i * 53) % 1000} ${-20 - ((i * 31) % 120)}l-8 30`} stroke="#cfe3ff" strokeWidth={2.5} strokeLinecap="round" opacity=".7" />)}
      {night && Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={(i * 131) % 1000} cy={(i * 47) % 120} r={2} fill="#fff" className="wx-star" style={{ animationDelay: `${(i * 173) % 1500}ms` }} />)}
      {weather === 'flood' && <rect x={0} y={HB - 10} width={1000} height={VH - HB + 20} fill="#3d8fb5" opacity=".75" className="wx-water" rx={10} />}
    </svg>
    </div>
  );
}
