import type { ReactElement } from 'react';
import type { ScenarioId } from '@/domain/types';
import { INK, SH, ink } from './toon';

/**
 * Scenario poster vignettes: 200×160 toon scenes, 10–25 shapes each, static (no animation inside
 * the SVG). Hard cel bands, warm ink outlines, one little house per scene so the posters read as
 * "the same house in eight weathers".
 */
function Sky({ a, b, curve = true }: { a: string; b: string; curve?: boolean }) {
  return <><rect width={200} height={160} fill={a} />{curve ? <path d="M0 78q50-16 100 0t100 0V160H0z" fill={b} /> : <rect y={78} width={200} height={82} fill={b} />}</>;
}
function Ground({ c = '#5aa75f', y = 122 }: { c?: string; y?: number }) {
  return <><path d={`M-4 ${y}H204V164H-4z`} fill={c} {...ink(3)} /><rect x={0} y={y + 18} width={200} height={30} fill={SH} /></>;
}
function House({ x = 70, y = 76, w = 62, h = 46, win = '#ffd166', tilt = 0, boards = false, shutters = false, wall = '#f3e3bd' }: { x?: number; y?: number; w?: number; h?: number; win?: string; tilt?: number; boards?: boolean; shutters?: boolean; wall?: string }) {
  const wx = x + 9, wy = y + 10;
  return (
    <g transform={tilt ? `rotate(${tilt} ${x + w / 2} ${y + h})` : undefined}>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={wall} {...ink(3)} />
      <path d={`M${x + w * .62} ${y}h${w * .38}v${h}h-${w * .38}z`} fill={SH} />
      <path d={`M${x - 7} ${y} L${x + w / 2} ${y - 28} L${x + w + 7} ${y}z`} fill="#b94a3d" {...ink(3)} />
      <path d={`M${x + w / 2} ${y - 28} L${x + w + 7} ${y}H${x + w / 2 + 12}z`} fill="#8a2f28" opacity=".6" />
      <rect x={wx} y={wy} width={18} height={15} rx={3} fill={win} {...ink(2.2)} />
      <path d={`M${wx + 9} ${wy}v15M${wx} ${wy + 7.5}h18`} {...ink(1.6)} />
      {shutters && <><rect x={wx - 1} y={wy - 1} width={9} height={17} rx={2} fill="#8a5a36" {...ink(1.8)} /><rect x={wx + 10} y={wy - 1} width={9} height={17} rx={2} fill="#8a5a36" {...ink(1.8)} /></>}
      {boards && <><path d={`M${wx - 3} ${wy + 2}l24 10`} stroke="#8a5a36" strokeWidth={5} strokeLinecap="round" /><path d={`M${wx - 3} ${wy + 12}l24-10`} stroke="#8a5a36" strokeWidth={5} strokeLinecap="round" /><path d={`M${wx - 3} ${wy + 2}l24 10M${wx - 3} ${wy + 12}l24-10`} stroke={INK} strokeWidth={1.4} /></>}
      <rect x={x + w - 24} y={y + h - 26} width={16} height={26} rx={3} fill="#8a5a36" {...ink(2.2)} />
      <circle cx={x + w - 11} cy={y + h - 12} r={1.6} fill="#ffd166" />
    </g>
  );
}
function Rain({ n = 7, c = '#cfe3ff' }: { n?: number; c?: string }) {
  return <g stroke={c} strokeWidth={3} strokeLinecap="round" opacity=".85">{Array.from({ length: n }).map((_, i) => <path key={i} d={`M${14 + i * 27} ${12 + (i % 3) * 18}l-6 16`} />)}</g>;
}

export const VIGNETTES: Record<ScenarioId, () => ReactElement> = {
  typhoon: () => (
    <>
      <Sky a="#1d2a55" b="#34508a" />
      <path d="M150 38c18-4 32 8 30 24-2 14-18 22-30 16-10-5-10-18 0-22 7-3 14 2 12 8" fill="none" stroke="#dbe8ff" strokeWidth={6} strokeLinecap="round" opacity=".9" />
      <Rain />
      <Ground c="#3f7f45" />
      <House />
      {/* bent palm */}
      <path d="M44 122c2-26 0-44-14-56" fill="none" {...ink(5)} /><path d="M44 122c2-26 0-44-14-56" fill="none" stroke="#9a6a3a" strokeWidth={2.5} />
      <path d="M30 66c-10-14-26-12-32 2 12-4 20 2 32 10z M30 66c10-14 26-10 30 4-12-2-20 4-30 8z M30 66c-2-16 6-28 18-30-6 10-6 20-6 30z" fill="#3f8a4a" {...ink(2.4)} />
      <path d="M160 118l12-6M166 126l14-8" stroke="#dbe8ff" strokeWidth={2.4} strokeLinecap="round" opacity=".7" />
    </>
  ),
  flood: () => (
    <>
      <Sky a="#4a6a8a" b="#7aa3b8" />
      <Rain n={6} />
      <Ground c="#6a8f5a" y={118} />
      <House win="#2a3350" />
      <path d="M-4 104q20-8 40 0t40 0 40 0 40 0 40 0 10 0V164H-4z" fill="#3d8fb5" opacity=".9" />
      <path d="M-4 104q20-8 40 0t40 0 40 0 40 0 40 0 10 0" fill="none" {...ink(3)} />
      <path d="M10 118q16-6 32 0M120 124q16-6 32 0" fill="none" stroke="#cfe9ff" strokeWidth={2.4} strokeLinecap="round" />
      {/* floating bucket + tire */}
      <path d="M26 98l4 14h16l4-14z" fill="#ff6a1a" {...ink(2.4)} />
      <circle cx="166" cy="110" r="10" fill="#2a1812" /><circle cx="166" cy="110" r="4" fill="#3d8fb5" />
    </>
  ),
  heat: () => (
    <>
      <Sky a="#ff9a3d" b="#ffd9a0" curve={false} />
      {Array.from({ length: 8 }).map((_, i) => <path key={i} transform={`rotate(${i * 45} 150 44)`} d="M150 10v12" stroke="#fff4b0" strokeWidth={4} strokeLinecap="round" />)}
      <circle cx="150" cy="44" r="22" fill="#ffd166" {...ink(3)} /><circle cx="142" cy="36" r="6" fill="rgba(255,255,255,.6)" />
      <Ground c="#e0b36a" />
      <path d="M20 134l14 6 8-4 12 8M150 130l10 6 12-4" fill="none" {...ink(2)} opacity=".6" />
      <House />
      <path d="M40 60q4-8 0-16M50 56q4-8 0-16" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" opacity=".7" />
      {/* thermometer */}
      <rect x="14" y="70" width="10" height="46" rx="5" fill="#fff" {...ink(2.4)} /><circle cx="19" cy="122" r="8" fill="#ff5d6c" {...ink(2.4)} /><rect x="16.5" y="82" width="5" height="34" fill="#ff5d6c" />
      {/* wilted plant */}
      <path d="M176 122c0-12 6-20 14-22M176 122c0-10-6-16-12-16" fill="none" stroke="#7a9a3a" strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  brownout: () => (
    <>
      <Sky a="#0a0e22" b="#1e2440" />
      <circle cx="160" cy="34" r="16" fill="#fff4cc" {...ink(3)} /><circle cx="154" cy="30" r="3" fill="#e8dcb0" />
      {[20, 60, 100, 128].map((x, i) => <circle key={i} cx={x} cy={14 + (i % 2) * 14} r={2} fill="#fff" />)}
      <Ground c="#1f3a2a" />
      <House win="#2a3350" />
      {/* one candle window */}
      <rect x="99" y="87" width="7" height="6" rx="1.5" fill="#ffd166" /><circle cx="102.5" cy="85" r="2" fill="#ffb347" />
      {/* pole with cut wire */}
      <path d="M30 122V46M18 56h24" {...ink(4)} />
      <path d="M42 56c14 4 28 4 40 0" fill="none" {...ink(2.4)} />
      <path d="M82 56c6 6 10 14 12 22" fill="none" {...ink(2.4)} />
      <path d="M94 78l4-4-2 6 5-3" fill="none" stroke="#ffd23f" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  water: () => (
    <>
      <Sky a="#4fa8e0" b="#cfeaf8" />
      <Ground c="#e0b36a" />
      <path d="M30 136l12 6 8-4M130 138l14 6" fill="none" {...ink(2)} opacity=".5" />
      <House x={112} y={80} w={56} h={42} />
      {/* faucet */}
      <rect x="30" y="52" width="40" height="14" rx="7" fill="#9fb3c8" {...ink(3)} />
      <rect x="62" y="56" width="14" height="24" rx="4" fill="#9fb3c8" {...ink(3)} />
      <rect x="44" y="36" width="12" height="18" rx="4" fill="#6f8aa8" {...ink(3)} />
      <path d="M38 36h24" {...ink(4)} />
      <path d="M69 86c-3 4-3 8 0 8s3-4 0-8z" fill="#56c5ff" {...ink(2)} />
      {/* empty bucket */}
      <path d="M52 100l5 24h24l5-24z" fill="#ff6a1a" {...ink(3)} /><path d="M52 100h34" {...ink(3)} /><path d="M58 100c0-8 22-8 22 0" fill="none" {...ink(2.4)} />
      <path d="M14 112l10-10M22 114l6-6" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" opacity=".6" />
    </>
  ),
  earthquake: () => (
    <>
      <Sky a="#857c6a" b="#d6c9ae" />
      <Ground c="#8a7a5a" />
      <House tilt={-6} />
      <path d="M-4 128l40 4 18 10 30-6 24 8 36-4 26 6 34-6" fill="none" {...ink(4)} />
      <path d="M46 132l12 6 14-4-8 14-22-2z" fill="#2a1812" opacity=".8" />
      <path d="M8 78l-6-4M8 88l-6 4M186 78l6-4M186 88l6 4" {...ink(3)} />
      <circle cx="150" cy="118" r="7" fill="#e9dcc4" opacity=".9" /><circle cx="160" cy="112" r="5" fill="#e9dcc4" opacity=".8" /><circle cx="40" cy="116" r="6" fill="#e9dcc4" opacity=".8" />
    </>
  ),
  unrest: () => (
    <>
      <Sky a="#452f6b" b="#9a6fc4" />
      <circle cx="40" cy="36" r="12" fill="#fff4cc" {...ink(3)} />
      <Ground c="#4f4a6a" />
      <House shutters win="#2a3350" />
      {/* padlock on door */}
      <rect x="104" y="106" width="12" height="10" rx="2" fill="#ffd23f" {...ink(2.2)} /><path d="M106.5 106v-4a3.5 3.5 0 0 1 7 0v4" fill="none" {...ink(2)} />
      {/* barricade */}
      <path d="M150 124l-10-20M160 124l10-20M140 110h40" fill="none" {...ink(3.4)} />
      <path d="M140 110h40" stroke="#ffd23f" strokeWidth={2} strokeDasharray="6 4" />
      <path d="M20 124l-8-18M30 124l8-18M10 112h40" fill="none" {...ink(3.4)} />
    </>
  ),
  zombie: () => (
    <>
      <Sky a="#234a36" b="#5f8f73" />
      <circle cx="154" cy="36" r="16" fill="#e9f7c0" {...ink(3)} />
      <Ground c="#3f6b4a" />
      <House boards win="#2a3350" />
      <ellipse cx="60" cy="112" rx="50" ry="8" fill="#cfeedd" opacity=".35" /><ellipse cx="150" cy="128" rx="46" ry="7" fill="#cfeedd" opacity=".3" />
      {/* zombie peeking */}
      <circle cx="34" cy="118" r="18" fill="#7bd36a" {...ink(3)} />
      <path d="M34 100a18 18 0 0 1 18 18 18 18 0 0 1-6 13c2-10 0-20-12-31z" fill={SH} />
      <path d="M26 114l6 6M32 114l-6 6M38 114l6 6M44 114l-6 6" {...ink(2.2)} />
      <path d="M26 128q8 2 16-2" fill="none" {...ink(2)} />
      <path d="M18 100c-2-6 0-10 4-10M52 100c2-6 0-10-4-10" fill="none" stroke="#2a1812" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M64 124v-10l4-2v12M70 124v-14l4 2v12" fill="#7bd36a" {...ink(2)} />
    </>
  ),
};

export function ScenarioVignette({ id, className }: { id: ScenarioId; className?: string }) {
  const V = VIGNETTES[id];
  return <svg viewBox="0 0 200 160" className={className} aria-hidden="true" focusable="false"><V /></svg>;
}
