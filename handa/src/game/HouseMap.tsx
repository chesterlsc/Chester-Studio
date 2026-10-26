import type { RoomId } from '@/domain/rooms';
import { ROOMS } from '@/domain/rooms';
import { HOUSE_GRID } from './layouts';
import { RoomScene, type PlacedSprite } from './RoomScene';
import { GameDefs } from './Sprites';

export interface HouseMapProps {
  placedByRoom: Partial<Record<RoomId, PlacedSprite[]>>;
  roomPct: Partial<Record<RoomId, number>>;
  missingCount: Partial<Record<RoomId, number>>;
  weather: string;
  lightsOn: boolean;
  flicker?: boolean;
  onSelect: (room: RoomId) => void;
  label: (room: RoomId) => string;
}

const CW = 320, CH = 200, X0 = 20, Y0 = 140, SLAB = 10;
const SKY: Record<string, [string, string]> = { rain: ['#1b2a4a', '#4a5f86'], flood: ['#233a52', '#5b7d94'], heat: ['#ff9a3d', '#ffd9a0'], dark: ['#07080f', '#1a1d2b'], dry: ['#5aa9d6', '#d7ecf7'], shake: ['#6d6a60', '#c9bfa8'], dusk: ['#2a1a45', '#6b4a8a'], fog: ['#0d1f17', '#2f5b45'] };

export function HouseMap({ placedByRoom, roomPct, missingCount, weather, lightsOn, flicker, onSelect, label }: HouseMapProps) {
  const [top, bottom] = SKY[weather] ?? SKY.dry;
  return (
    <svg viewBox="0 0 1000 780" className="hmap" preserveAspectRatio="xMidYMid meet" role="img">
      <GameDefs />
      <defs><linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient></defs>
      <rect width={1000} height={780} fill="url(#hsky)" rx={24} />
      {(weather === 'rain' || weather === 'flood') && Array.from({ length: 40 }).map((_, i) => <path key={i} className="wx-drop" style={{ animationDelay: `${(i * 97) % 1000}ms` }} d={`M${(i * 53) % 1000} ${-20 - ((i * 31) % 120)}l-8 30`} stroke="#cfe9ff" strokeWidth={3} strokeLinecap="round" opacity=".7" />)}
      {weather === 'heat' && <circle cx={880} cy={70} r={46} fill="#fff4cc" />}
      {(weather === 'dark' || weather === 'dusk') && Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={(i * 131) % 1000} cy={(i * 47) % 120} r={1.8} fill="#fff" className="wx-star" style={{ animationDelay: `${(i * 173) % 1500}ms` }} />)}
      {/* ground */}
      <rect x={0} y={740} width={1000} height={40} fill="#3f8249" rx={10} />
      {weather === 'flood' && <rect x={0} y={700} width={1000} height={80} fill="#3d8fb5" opacity=".75" className="wx-water" rx={10} />}
      {/* roof */}
      <path d="M0 150 500 12 1000 150z" fill="#2f4b5c" /><path d="M14 150 500 32 986 150z" fill="#3b5d72" /><rect x={0} y={146} width={1000} height={14} rx={4} fill="#1f3340" />
      <rect x={760} y={40} width={50} height={90} fill="#8a4a3a" /><rect x={752} y={34} width={66} height={14} rx={3} fill="#5a3022" />
      <g transform="translate(500 90)"><path d="M-30 20 0-6l30 26v26h-60z" fill="var(--brand)" /><path d="M-8 46V32h16v14" fill="#2f4b5c" /></g>
      {/* outer walls */}
      <rect x={X0 - 12} y={Y0 - 6} width={12} height={3 * CH + 2 * SLAB + 12} fill="#e9dcc6" /><rect x={X0 + 3 * CW} y={Y0 - 6} width={12} height={3 * CH + 2 * SLAB + 12} fill="#e9dcc6" />
      {HOUSE_GRID.map((row, r) => (
        <g key={r}>
          {row.map((room, c) => {
            const x = X0 + c * CW, y = Y0 + r * (CH + SLAB);
            const pct = roomPct[room] ?? 0; const miss = missingCount[room] ?? 0;
            const name = label(room);
            return (
              <g key={room} className="hmap__cell" onClick={() => onSelect(room)} role="button" aria-label={name}>
                <svg x={x} y={y} width={CW} height={CH} viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice">
                  <RoomScene room={room} placed={placedByRoom[room] ?? []} weather={weather} lightsOn={lightsOn} flicker={flicker} mini accent={ROOMS[room].hue} />
                </svg>
                <rect x={x} y={y} width={CW} height={CH} className="hmap__frame" rx={2} />
                {/* label */}
                <g transform={`translate(${x + 12} ${y + CH - 16})`}>
                  <rect x={0} y={-22} width={name.length * 8.4 + 60} height={30} rx={15} fill="rgba(5,7,12,.72)" />
                  <text x={12} y={-2} fontSize={14} fontWeight={700} fontFamily="Sora, system-ui" fill="#fff">{name}</text>
                  <text x={name.length * 8.4 + 24} y={-2} fontSize={12} fontFamily="JetBrains Mono, monospace" fill={pct >= .99 ? '#3ddc97' : '#cfe6ff'} fontWeight={700}>{Math.round(pct * 100)}%</text>
                </g>
                <rect x={x} y={y + CH - 5} width={CW} height={5} fill="rgba(0,0,0,.35)" /><rect x={x} y={y + CH - 5} width={CW * pct} height={5} fill={pct >= .99 ? '#3ddc97' : ROOMS[room].hue} />
                {miss > 0 ? (
                  <g transform={`translate(${x + CW - 22} ${y + 22})`}><g className="hmap__badge"><circle r={15} fill="#ff5d6c" stroke="#fff" strokeWidth={3} /><text y={5} textAnchor="middle" fontSize={14} fontWeight={800} fontFamily="JetBrains Mono, monospace" fill="#fff">{miss}</text></g></g>
                ) : pct >= .99 ? (
                  <g transform={`translate(${x + CW - 22} ${y + 22})`}><g className="hmap__badge"><circle r={15} fill="#3ddc97" stroke="#fff" strokeWidth={3} /><path d="M-7 0l5 5 9-10" fill="none" stroke="#0b0d12" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" /></g></g>
                ) : null}
                <rect x={x} y={y} width={CW} height={CH} fill="transparent" />
              </g>
            );
          })}
          {r < 2 && <rect x={X0 - 12} y={Y0 + (r + 1) * CH + r * SLAB} width={3 * CW + 24} height={SLAB} fill="#e9dcc6" />}
        </g>
      ))}
      <rect x={X0 - 12} y={Y0 + 3 * CH + 2 * SLAB} width={3 * CW + 24} height={12} fill="#cdbfa6" />
    </svg>
  );
}
