/** Shared toon primitives for the intro: warm ink, cel bands, avatars and the dollhouse exterior. */
export const INK = '#2a1812';
export const SH = 'rgba(42,24,18,.24)';
export const HL = 'rgba(255,255,255,.55)';

/** Stroke props for an inked silhouette (viewBox units). */
export const ink = (w = 3) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });

export type AvatarKind = 'adults' | 'kids' | 'babies' | 'seniors' | 'pets';
const SKIN = ['#f2c29b', '#dba57a', '#c4845a', '#f6d2b0'];

/** Small toon head-and-shoulders avatar, 48×48 viewBox. `i` varies skin/shirt colours. */
export function Avatar({ kind, i = 0, size = 36, className }: { kind: AvatarKind; i?: number; size?: number; className?: string }) {
  const skin = SKIN[i % SKIN.length];
  const shirts = ['#ff6a1a', '#4f7cff', '#3ddc97', '#c88cff', '#ffd23f', '#56c5ff'];
  const shirt = shirts[(i * 2 + (kind === 'kids' ? 1 : 0)) % shirts.length];
  if (kind === 'pets') {
    return (
      <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
        <path d="M10 20c-4 0-6 6-3 12l5 2z" fill="#b46a3c" {...ink(2.6)} />
        <path d="M38 20c4 0 6 6 3 12l-5 2z" fill="#b46a3c" {...ink(2.6)} />
        <circle cx="24" cy="26" r="15" fill="#d98a4c" {...ink(3)} />
        <path d="M24 11a15 15 0 0 1 15 15 15 15 0 0 1-6 12c2-8 0-18-9-27z" fill={SH} />
        <ellipse cx="24" cy="32" rx="7" ry="5" fill="#f6dcc0" />
        <circle cx="24" cy="31" r="2.6" fill={INK} />
        <circle cx="18" cy="24" r="1.8" fill={INK} /><circle cx="30" cy="24" r="1.8" fill={INK} />
        <circle cx="16" cy="19" r="3" fill={HL} />
      </svg>
    );
  }
  const senior = kind === 'seniors', baby = kind === 'babies', kid = kind === 'kids';
  const headR = baby ? 12 : kid ? 11.5 : 12;
  const cy = baby ? 24 : 21;
  const hair = senior ? '#e6e2da' : ['#2a1812', '#4a2a16', '#1a1a2a', '#6b3a1a'][i % 4];
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
      {/* shoulders */}
      <path d={`M8 48c0-9 7-13 16-13s16 4 16 13z`} fill={baby ? '#ffd9e5' : shirt} {...ink(3)} />
      <path d="M24 35c9 0 16 4 16 13H30c0-6-2-10-6-13z" fill={SH} />
      {/* head */}
      <circle cx="24" cy={cy} r={headR} fill={skin} {...ink(3)} />
      <path d={`M24 ${cy - headR}a${headR} ${headR} 0 0 1 0 ${headR * 2}c3-6 3-14 0-${headR * 2}z`} fill={SH} opacity=".7" />
      {/* hair / bonnet / cap */}
      {baby
        ? <><path d={`M12 ${cy - 2}a12 12 0 0 1 24 0z`} fill="#ff9ab8" {...ink(2.4)} /><circle cx="24" cy={cy - 13} r="2.4" fill="#ff6a8a" /></>
        : kid
          ? <><path d={`M12.5 ${cy - 3}a11.5 11.5 0 0 1 23 0z`} fill="#4f7cff" {...ink(2.4)} /><path d={`M24 ${cy - 3}h16v3H24z`} fill="#3a5fd0" {...ink(2.2)} /></>
          : <path d={`M12 ${cy}a12 12 0 0 1 24 0c-2-4-6-6-12-6s-10 2-12 6z`} fill={hair} {...ink(2.4)} />}
      {senior && <><circle cx="19" cy={cy + 1} r="4" fill="none" {...ink(1.8)} /><circle cx="29" cy={cy + 1} r="4" fill="none" {...ink(1.8)} /><path d="M23 22h2" {...ink(1.8)} /></>}
      {/* face */}
      <circle cx="19.5" cy={cy + 1} r="1.6" fill={INK} /><circle cx="28.5" cy={cy + 1} r="1.6" fill={INK} />
      <path d={`M20 ${cy + 6}q4 3 8 0`} fill="none" {...ink(1.8)} />
      <circle cx="16" cy={cy + 5} r="2" fill="#ff8a8a" opacity=".6" /><circle cx="32" cy={cy + 5} r="2" fill="#ff8a8a" opacity=".6" />
      <circle cx="18" cy={cy - 6} r="2.4" fill={HL} />
    </svg>
  );
}

/**
 * Toon dollhouse exterior (same silhouette as the in-game HouseMap: inked gable roof, cream walls,
 * two floors of warm windows, a door, fence). 520×420 viewBox, bottom at y=400.
 * `lit`: window glow on; `night`: cooler walls.
 */
export function HouseExterior({ lit = true, night = true, className }: { lit?: boolean; night?: boolean; className?: string }) {
  const wall = night ? '#e9d7b4' : '#f7e9c8';
  const wallSh = night ? '#c9b08a' : '#e0c99a';
  const win = lit ? '#ffd166' : '#2a3350';
  const winHL = lit ? '#fff2b8' : '#3a4568';
  const roof = '#b94a3d', roofSh = '#8a2f28';
  const W = ({ x, y, w = 56, h = 50 }: { x: number; y: number; w?: number; h?: number }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={win} {...ink(4)} />
      <rect x={x + 4} y={y + 4} width={w / 2 - 6} height={h / 2 - 6} rx={3} fill={winHL} opacity=".8" />
      <path d={`M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}`} {...ink(3)} />
      <rect x={x - 6} y={y + h} width={w + 12} height={6} rx={2} fill="#c98a4b" {...ink(3)} />
    </g>
  );
  return (
    <svg viewBox="0 0 520 420" className={className} aria-hidden="true">
      {/* ground shadow */}
      <ellipse cx="260" cy="404" rx="250" ry="12" fill="rgba(0,0,0,.25)" />
      {/* walls */}
      <rect x="60" y="150" width="400" height="250" rx="6" fill={wall} {...ink(6)} />
      <path d="M330 150h130v250H330z" fill={wallSh} opacity=".9" />
      <rect x="60" y="150" width="400" height="250" rx="6" fill="none" {...ink(6)} />
      {/* floor slab */}
      <rect x="52" y="268" width="416" height="12" rx="3" fill="#c98a4b" {...ink(4)} />
      {/* roof */}
      <path d="M30 156 260 36l230 120z" fill={roof} {...ink(7)} />
      <path d="M260 36 490 156H370z" fill={roofSh} opacity=".55" />
      <path d="M30 156h460l-12 12H42z" fill={roofSh} {...ink(5)} />
      {[1, 2, 3].map((i) => { const t = i / 4; const y = 156 - 120 * t; const hw = 230 * (1 - t); return <path key={i} d={`M${260 - hw} ${y}H${260 + hw}`} stroke={INK} strokeWidth={3} opacity=".5" strokeDasharray="22 6" />; })}
      {/* chimney */}
      <rect x="380" y="60" width="40" height="60" rx="4" fill="#9a4a3a" {...ink(5)} />
      <rect x="372" y="52" width="56" height="14" rx="4" fill="#6a2f24" {...ink(4)} />
      {/* attic window */}
      <circle cx="260" cy="110" r="16" fill={win} {...ink(4)} /><path d="M260 94v32M244 110h32" {...ink(3)} />
      {/* windows */}
      <W x={96} y={186} /><W x={200} y={186} /><W x={370} y={186} />
      <W x={96} y={300} /><W x={370} y={300} />
      {/* door */}
      <rect x="214" y="296" width="92" height="104" rx="10" fill="#8a5a36" {...ink(5)} />
      <rect x="228" y="310" width="30" height="34" rx="4" fill={win} {...ink(3)} />
      <rect x="264" y="310" width="30" height="34" rx="4" fill={win} {...ink(3)} />
      <circle cx="292" cy="362" r="4.5" fill="#ffd166" {...ink(2)} />
      {/* porch light */}
      <path d="M260 272v10" {...ink(4)} /><circle cx="260" cy="288" r="8" fill={lit ? '#fff2b8' : '#4a5568'} {...ink(3)} />
      {/* steps */}
      <rect x="196" y="400" width="128" height="10" rx="3" fill="#d9c39a" {...ink(4)} />
      {/* fence bits left/right */}
      {[0, 1, 2].map((i) => <path key={i} d={`M${14 + i * 18} 400v-26l6-8 6 8v26z`} fill="#fff6e0" {...ink(3)} />)}
      {[0, 1, 2].map((i) => <path key={i} d={`M${452 + i * 18} 400v-26l6-8 6 8v26z`} fill="#fff6e0" {...ink(3)} />)}
      {/* bush */}
      <g transform="translate(120 392)"><circle r="18" fill="#4f9d5a" {...ink(3)} /><circle cx="24" cy="-4" r="20" fill="#5fae63" {...ink(3)} /><circle cx="46" cy="2" r="15" fill="#4f9d5a" {...ink(3)} /><circle cx="10" cy="-8" r="3" fill="#ff6a8a" /><circle cx="34" cy="-12" r="3" fill="#ffd166" /></g>
    </svg>
  );
}

/** One palm tree, trunk base at (60,300) in a 120×300 viewBox. Animate the wrapper, not the SVG. */
export function Palm({ className }: { className?: string }) {
  const frond = (rot: number, k: number) => <path key={k} transform={`rotate(${rot} 60 70)`} d="M60 70c-30-20-60-10-70 10 25-6 45 4 70 10z" fill="#3f8a4a" {...ink(3.5)} />;
  return (
    <svg viewBox="0 0 120 300" className={className} aria-hidden="true">
      <path d="M62 300c-4-80-6-150 4-228l10 2c-6 76-4 146 0 226z" fill="#9a6a3a" {...ink(4)} />
      <path d="M66 74c-4 70-4 140 0 224h-4c-2-84-2-154 0-224z" fill={SH} />
      {[-150, -110, -70, -30, 10, 40].map((r, k) => frond(r, k))}
      <circle cx="60" cy="72" r="9" fill="#8a5a36" {...ink(3)} />
      <circle cx="54" cy="80" r="5" fill="#6a3f1f" {...ink(2)} /><circle cx="66" cy="82" r="5" fill="#6a3f1f" {...ink(2)} />
    </svg>
  );
}

/** Distant street: rooftops, a jeepney-ish shape, utility poles. 1000×240, anchored at the bottom. */
export function Skyline({ night = true, className }: { night?: boolean; className?: string }) {
  const c1 = night ? '#2a2f55' : '#f0b57a', c2 = night ? '#1d2240' : '#d99354', road = night ? '#262a3c' : '#6f6a6a';
  return (
    <svg viewBox="0 0 1000 240" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      {/* houses */}
      {[[0, 150, 70], [110, 170, 60], [700, 140, 90], [820, 160, 70], [920, 150, 90]].map(([x, y, w], i) => (
        <g key={i}><rect x={x} y={y} width={w} height={240 - y} fill={c1} {...ink(4)} /><path d={`M${x - 8} ${y} l${w / 2 + 8} -30 l${w / 2 + 8} 30z`} fill={c2} {...ink(4)} />
          <rect x={x + 14} y={y + 18} width={16} height={16} rx={3} fill={night ? '#ffd166' : '#8ab6d8'} {...ink(2.5)} /></g>
      ))}
      {/* utility pole */}
      <path d="M560 240V70M530 90h60M536 110h48" {...ink(6)} />
      <path d="M560 90c80 20 160 20 240 0" fill="none" {...ink(3)} />
      <path d="M560 90c-100 20-200 20-300 0" fill="none" {...ink(3)} />
      {/* road */}
      <rect x="0" y="212" width="1000" height="28" fill={road} />
      <path d="M0 226h1000" stroke="#ffd166" strokeWidth="3" strokeDasharray="30 22" opacity=".7" />
      {/* puddles */}
      {night && <><ellipse cx="200" cy="228" rx="50" ry="5" fill="#8ab6d8" opacity=".35" /><ellipse cx="760" cy="230" rx="70" ry="5" fill="#8ab6d8" opacity=".3" /></>}
    </svg>
  );
}
