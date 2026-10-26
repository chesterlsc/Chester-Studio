import type { Furniture as F, FurnitureKind, Unit, Win } from './layouts';

/**
 * Cartoon furniture, flat vector with a darker base tone and a light top
 * highlight. No outlines; shapes read through value contrast.
 */
const dk = (hex: string, k = .78) => { const n = parseInt(hex.slice(1), 16); const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k); return `rgb(${r},${g},${b})`; };
const lt = (hex: string, k = .2) => { const n = parseInt(hex.slice(1), 16); const f = (c: number) => Math.round(c + (255 - c) * k); return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`; };

export function Shadow({ x, y, w, h = 14 }: { x: number; y: number; w: number; h?: number }) {
  return <ellipse cx={x + w / 2} cy={y} rx={w / 2} ry={h / 2} fill="rgba(20,16,10,.18)" />;
}

function R({ x, y, w, h, c, r = 6 }: { x: number; y: number; w: number; h: number; c: string; r?: number }) { return <rect x={x} y={y} width={w} height={h} rx={r} fill={c} />; }

export function FurnitureGlyph({ f }: { f: F }) {
  const { x, y, w, h } = f;
  const c = f.tint ?? '#c58a52';
  switch (f.kind) {
    case 'counter': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={h} c="#d9dee6" r={8} /><R x={x} y={y} w={w} h={14} c="#8e98a8" r={6} /><R x={x + 12} y={y + 30} w={w / 2 - 20} h={h - 46} c="#c6ccd6" r={6} /><R x={x + w / 2 + 8} y={y + 30} w={w / 2 - 20} h={h - 46} c="#c6ccd6" r={6} /><circle cx={x + w / 4 + 2} cy={y + h / 2 + 6} r={5} fill="#8e98a8" /><circle cx={x + 3 * w / 4 - 2} cy={y + h / 2 + 6} r={5} fill="#8e98a8" /></g>;
    case 'stove': return <g><R x={x} y={y} w={w} h={h} c="#3a414d" r={6} />{[0, 1, 2].map((i) => <g key={i}><circle cx={x + 20 + i * (w - 40) / 2} cy={y + h / 2} r={9} fill="#2a2f38" /><circle cx={x + 20 + i * (w - 40) / 2} cy={y + h / 2} r={5} fill="#5a6270" /></g>)}</g>;
    case 'sink': return <g><R x={x} y={y} w={w} h={h} c="#b9c3cf" r={8} /><R x={x + 10} y={y + 6} w={w - 20} h={h - 10} c="#8f9bab" r={6} /><rect x={x + w / 2 - 3} y={y - 34} width={6} height={36} rx={3} fill="#9aa5b3" /><rect x={x + w / 2 - 3} y={y - 34} width={30} height={6} rx={3} fill="#9aa5b3" /></g>;
    case 'fridge': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={h} c="#eef2f6" r={10} /><R x={x} y={y} w={w} h={h * .36} c="#f7f9fb" r={10} /><rect x={x + w - 18} y={y + 24} width={5} height={h * .22} rx={2} fill="#9aa5b3" /><rect x={x + w - 18} y={y + h * .42} width={5} height={h * .36} rx={2} fill="#9aa5b3" /><rect x={x} y={y + h * .36 - 2} width={w} height={4} fill="#d6dde6" /></g>;
    case 'table': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={16} c={c} r={6} /><rect x={x + 10} y={y + 14} width={12} height={h - 14} fill={dk(c)} /><rect x={x + w - 22} y={y + 14} width={12} height={h - 14} fill={dk(c)} /></g>;
    case 'stool': return <g><R x={x} y={y} w={w} h={10} c={c} r={5} /><rect x={x + 6} y={y + 8} width={6} height={h - 8} fill={dk(c)} /><rect x={x + w - 12} y={y + 8} width={6} height={h - 8} fill={dk(c)} /></g>;
    case 'washer': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={h} c="#f2f4f7" r={10} /><R x={x} y={y} w={w} h={22} c="#dfe4ea" r={8} /><circle cx={x + w / 2} cy={y + h / 2 + 12} r={w * .32} fill="#8fa2b8" /><circle cx={x + w / 2} cy={y + h / 2 + 12} r={w * .24} fill="#5b7390" /><circle cx={x + w / 2 - 6} cy={y + h / 2 + 4} r={w * .1} fill="#8fb6d6" opacity=".6" /><circle cx={x + w - 20} cy={y + 11} r={5} fill="#5b7390" /></g>;
    case 'laundry-sink': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={h} c="#cfd6de" r={8} /><R x={x + 8} y={y + 8} w={w - 16} h={h * .45} c="#9fb0c4" r={6} /><rect x={x + w / 2 - 3} y={y - 30} width={6} height={32} rx={3} fill="#9aa5b3" /><rect x={x + w / 2 - 3} y={y - 30} width={26} height={6} rx={3} fill="#9aa5b3" /></g>;
    case 'pallet': return <g>{[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={x + i * (w / 6) + 4} y={y} width={w / 6 - 8} height={14} rx={3} fill="#b78f5c" />)}<rect x={x} y={y + 16} width={w} height={10} rx={3} fill="#8c6a40" /><rect x={x + 10} y={y + 26} width={20} height={h - 26} fill="#7a5a34" /><rect x={x + w / 2 - 10} y={y + 26} width={20} height={h - 26} fill="#7a5a34" /><rect x={x + w - 30} y={y + 26} width={20} height={h - 26} fill="#7a5a34" /></g>;
    case 'bed': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y - 60} w={w * .28} h={h + 60} c="#8c5a34" r={10} /><R x={x} y={y + 30} w={w} h={h - 30} c="#f3eee4" r={12} /><R x={x} y={y + h - 50} w={w} h={50} c="#e4866c" r={10} /><R x={x + 20} y={y + 36} w={w * .3} h={38} c="#fff" r={10} /><R x={x + w * .36} y={y + 36} w={w * .3} h={38} c="#fff" r={10} /><rect x={x} y={y + h - 14} width={w} height={14} rx={6} fill="#6f4628" /></g>;
    case 'crib': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y + h - 24} w={w} h={16} c="#f0dfc5" r={6} />{Array.from({ length: 7 }).map((_, i) => <rect key={i} x={x + 8 + i * ((w - 16) / 6) - 3} y={y} width={6} height={h - 20} rx={3} fill="#e4ccab" />)}<R x={x} y={y} w={w} h={8} c="#f0dfc5" r={4} /><R x={x + 8} y={y + h * .5} w={w - 16} h={h * .22} c="#cfe6ff" r={6} /><rect x={x + 10} y={y + h - 8} width={10} height={14} fill="#d9c2a0" /><rect x={x + w - 20} y={y + h - 8} width={10} height={14} fill="#d9c2a0" /></g>;
    case 'wardrobe': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={h} c="#9c6b45" r={8} /><rect x={x + w / 2 - 2} y={y + 10} width={4} height={h - 20} fill="#7a5234" /><circle cx={x + w / 2 - 12} cy={y + h / 2} r={4} fill="#e9c46a" /><circle cx={x + w / 2 + 12} cy={y + h / 2} r={4} fill="#e9c46a" /></g>;
    case 'nightstand': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={h} c="#a97451" r={8} /><rect x={x + 10} y={y + 14} width={w - 20} height={h * .3} rx={4} fill="#8c5a34" /><rect x={x + 10} y={y + h * .55} width={w - 20} height={h * .3} rx={4} fill="#8c5a34" /><R x={x + w * .3} y={y - 50} w={w * .4} h={34} c="#ffe8b0" r={6} /><rect x={x + w / 2 - 3} y={y - 16} width={6} height={16} fill="#6d5a3a" /></g>;
    case 'toilet': return <g><Shadow x={x} y={y + h} w={w} /><R x={x + w * .15} y={y} w={w * .7} h={h * .45} c="#f7fafc" r={10} /><ellipse cx={x + w / 2} cy={y + h * .68} rx={w * .5} ry={h * .22} fill="#f7fafc" /><ellipse cx={x + w / 2} cy={y + h * .66} rx={w * .36} ry={h * .14} fill="#dbe6ee" /><rect x={x + w * .38} y={y + h * .72} width={w * .24} height={h * .28} fill="#eef3f7" /><circle cx={x + w * .7} cy={y + h * .14} r={5} fill="#b9c5d1" /></g>;
    case 'basin': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={34} c="#f7fafc" r={14} /><ellipse cx={x + w / 2} cy={y + 18} rx={w * .34} ry={10} fill="#dbe6ee" /><R x={x + w * .3} y={y + 34} w={w * .4} h={h - 34} c="#eef3f7" r={8} /><rect x={x + w / 2 - 3} y={y - 26} width={6} height={28} rx={3} fill="#9aa5b3" /><rect x={x + w / 2 - 3} y={y - 26} width={22} height={6} rx={3} fill="#9aa5b3" /></g>;
    case 'mirror': return <g><R x={x} y={y} w={w} h={h} c="#dde8f0" r={12} /><R x={x + 8} y={y + 8} w={w - 16} h={h - 16} c="#bcd7ea" r={10} /><path d={`M${x + 20} ${y + h - 20}L${x + w - 20} ${y + 20}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity=".5" /></g>;
    case 'shower': return <g><R x={x} y={y} w={w} h={h} c="#cfe8e3" r={12} /><rect x={x} y={y} width={w} height={h} fill="url(#tile)" opacity=".35" rx={12} /><rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx={10} fill="none" stroke="#fff" strokeWidth={4} opacity=".7" /><rect x={x + w / 2 - 4} y={y + 20} width={8} height={70} rx={4} fill="#9aa5b3" /><R x={x + w / 2 - 28} y={y + 86} w={56} h={14} c="#9aa5b3" r={7} />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${x + w / 2 - 20 + i * 10} ${y + 104}v${h - 170}`} stroke="#8fc9e8" strokeWidth={2} strokeDasharray="6 10" opacity=".7" />)}<R x={x + 10} y={y + h - 24} w={w - 20} h={14} c="#b9c5d1" r={6} /></g>;
    case 'sofa': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={h - 10} c="#3f6fb0" r={16} /><R x={x + 16} y={y + 40} w={(w - 48) / 3} h={h - 80} c="#5a8ad0" r={10} /><R x={x + 24 + (w - 48) / 3} y={y + 40} w={(w - 48) / 3} h={h - 80} c="#5a8ad0" r={10} /><R x={x + 32 + 2 * (w - 48) / 3} y={y + 40} w={(w - 48) / 3} h={h - 80} c="#5a8ad0" r={10} /><R x={x} y={y + 30} w={24} h={h - 50} c="#2f5a94" r={10} /><R x={x + w - 24} y={y + 30} w={24} h={h - 50} c="#2f5a94" r={10} /><rect x={x + 20} y={y + h - 10} width={14} height={10} fill="#5a3c22" /><rect x={x + w - 34} y={y + h - 10} width={14} height={10} fill="#5a3c22" /><R x={x + w * .3} y={y + 50} w={60} h={44} c="#f2b56b" r={10} /></g>;
    case 'tv': return <g><R x={x} y={y} w={w} h={h} c="#1d2330" r={10} /><R x={x + 8} y={y + 8} w={w - 16} h={h - 26} c="#2b3a52" r={6} /><path d={`M${x + 20} ${y + h - 40}q${w / 2} -${h * .7} ${w - 40} 0`} fill="none" stroke="#5ea8ff" strokeWidth={4} opacity=".5" /><rect x={x + w / 2 - 30} y={y + h} width={60} height={8} rx={3} fill="#1d2330" /></g>;
    case 'console': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={h} c="#7a5234" r={10} /><rect x={x + 14} y={y + 16} width={w - 28} height={h / 2 - 20} rx={6} fill="#6a4529" /><rect x={x + 14} y={y + h / 2 + 4} width={w - 28} height={h / 2 - 20} rx={6} fill="#6a4529" /></g>;
    case 'rug': return <g><ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="#c9604e" opacity=".9" /><ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2 - 16} ry={h / 2 - 8} fill="none" stroke="#e8927f" strokeWidth={4} /></g>;
    case 'plant': return <g><Shadow x={x} y={y + h} w={w} h={8} /><path d={`M${x + w * .2} ${y + h}h${w * .6}l-6 -${h * .35}h-${w * .6 - 12}z`} fill="#c0633f" /><circle cx={x + w / 2} cy={y + h * .4} r={w * .45} fill="#4f9d5a" /><circle cx={x + w * .3} cy={y + h * .5} r={w * .3} fill="#63b56e" /><circle cx={x + w * .7} cy={y + h * .25} r={w * .3} fill="#63b56e" /></g>;
    case 'desk': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={18} c="#9c6b45" r={6} /><R x={x + w - 110} y={y + 18} w={100} h={h - 18} c="#8a5c3a" r={6} /><rect x={x + w - 95} y={y + 34} width={70} height={10} rx={4} fill="#6f4628" /><rect x={x + w - 95} y={y + 60} width={70} height={10} rx={4} fill="#6f4628" /><rect x={x + 10} y={y + 18} width={14} height={h - 18} fill="#7a5234" /><R x={x + 40} y={y - 70} w={110} h={70} c="#1d2330" r={8} /><R x={x + 46} y={y - 64} w={98} h={52} c="#2b3a52" r={5} /><rect x={x + 85} y={y - 4} width={20} height={6} fill="#1d2330" /></g>;
    case 'chair': return <g><R x={x} y={y} w={w} h={16} c="#2f3542" r={8} /><rect x={x + w / 2 - 5} y={y + 14} width={10} height={h - 30} fill="#2f3542" /><R x={x + 6} y={y + h - 16} w={w - 12} h={10} c="#2f3542" r={5} /><R x={x + 10} y={y - 60} w={w - 20} h={64} c="#3d4556" r={10} /></g>;
    case 'bookshelf': return <g><R x={x} y={y} w={w} h={h} c="#8a5c3a" r={8} /></g>;
    case 'safe': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={h} c="#3d4556" r={10} /><R x={x + 10} y={y + 10} w={w - 20} h={h - 20} c="#4b5468" r={8} /><circle cx={x + w / 2} cy={y + h / 2} r={14} fill="#2a303c" /><circle cx={x + w / 2} cy={y + h / 2} r={6} fill="#c9d1dc" /><rect x={x + w - 26} y={y + h / 2 - 14} width={8} height={28} rx={3} fill="#c9d1dc" /></g>;
    case 'door': return <g><R x={x} y={y} w={w} h={h} c="#efe7d8" r={10} /><R x={x + 14} y={y + 14} w={w - 28} h={h - 14} c="#7a4a2a" r={6} /><rect x={x + 30} y={y + 40} width={w - 60} height={(h - 100) / 2 - 10} rx={6} fill="#8c5a34" /><rect x={x + 30} y={y + 40 + (h - 100) / 2 + 10} width={w - 60} height={(h - 100) / 2 - 10} rx={6} fill="#8c5a34" /><circle cx={x + w - 40} cy={y + h / 2 + 10} r={7} fill="#e9c46a" /><R x={x + 20} y={y + 20} w={w - 40} h={8} c="#e9dcc6" r={4} /></g>;
    case 'shoe-rack': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={h} c="#a97451" r={6} /><rect x={x + 6} y={y + h / 2 - 3} width={w - 12} height={6} fill="#8c5a34" />{[0, 1, 2].map((i) => <R key={i} x={x + 10 + i * 28} y={y + 10} w={22} h={14} c={['#e76f51', '#2a9d8f', '#264653'][i]} r={5} />)}</g>;
    case 'bench': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={16} c="#9c6b45" r={6} /><rect x={x + 12} y={y + 14} width={12} height={h - 14} fill="#7a5234" /><rect x={x + w - 24} y={y + 14} width={12} height={h - 14} fill="#7a5234" /></g>;
    case 'coat-hooks': return <g><R x={x} y={y} w={w} h={14} c="#9c6b45" r={5} /></g>;
    case 'motorbike': return <g><Shadow x={x} y={y + h} w={w} /><circle cx={x + w * .2} cy={y + h * .78} r={h * .22} fill="#2a2f38" /><circle cx={x + w * .2} cy={y + h * .78} r={h * .1} fill="#9aa5b3" /><circle cx={x + w * .8} cy={y + h * .78} r={h * .22} fill="#2a2f38" /><circle cx={x + w * .8} cy={y + h * .78} r={h * .1} fill="#9aa5b3" /><path d={`M${x + w * .2} ${y + h * .78}L${x + w * .42} ${y + h * .45}L${x + w * .68} ${y + h * .45}L${x + w * .8} ${y + h * .78}`} fill="none" stroke="#c0392b" strokeWidth={10} strokeLinejoin="round" /><R x={x + w * .38} y={y + h * .3} w={w * .32} h={h * .2} c="#e74c3c" r={10} /><R x={x + w * .5} y={y + h * .5} w={w * .2} h={h * .14} c="#2a2f38" r={6} /><path d={`M${x + w * .7} ${y + h * .42}l${w * .12} -${h * .18}`} stroke="#5a6270" strokeWidth={6} strokeLinecap="round" /><circle cx={x + w * .84} cy={y + h * .22} r={8} fill="#ffe8b0" /></g>;
    case 'workbench': return <g><Shadow x={x} y={y + h} w={w} /><R x={x} y={y} w={w} h={20} c="#b78f5c" r={5} /><rect x={x + 12} y={y + 18} width={16} height={h - 18} fill="#8c6a40" /><rect x={x + w - 28} y={y + 18} width={16} height={h - 18} fill="#8c6a40" /><rect x={x + 40} y={y + 36} width={w - 80} height={14} rx={4} fill="#8c6a40" /></g>;
    case 'mats': return <g>{[0, 1, 2].map((i) => <g key={i}><R x={x + i * (w / 3)} y={y + 30} w={w / 3 - 12} h={h - 30} c={['#d7b98c', '#c8a46f', '#d7b98c'][i]} r={10} /><R x={x + i * (w / 3) + 8} y={y + 8} w={w / 3 - 28} h={30} c="#f3eee4" r={10} /></g>)}</g>;
    case 'boards': return <g>{[0, 1, 2].map((i) => <rect key={i} x={x - 16} y={y + 20 + i * (h / 3)} width={w + 32} height={26} rx={4} fill="#a67c52" transform={`rotate(${i % 2 ? -3 : 3} ${x + w / 2} ${y + 30 + i * (h / 3)})`} />)}{[0, 1, 2].map((i) => <g key={`n${i}`}><circle cx={x - 4} cy={y + 33 + i * (h / 3)} r={3} fill="#4a3620" /><circle cx={x + w + 4} cy={y + 33 + i * (h / 3)} r={3} fill="#4a3620" /></g>)}</g>;
    case 'curtain': return <g><rect x={x} y={y} width={w} height={10} rx={4} fill="#4a3620" /><path d={`M${x} ${y + 10}h${w * .22}q-6 ${h * .5} 0 ${h - 10}h-${w * .22}z`} fill="#2b2d3a" /><path d={`M${x + w} ${y + 10}h-${w * .22}q6 ${h * .5} 0 ${h - 10}h${w * .22}z`} fill="#2b2d3a" /></g>;
    case 'fan': return <g><circle cx={x + w / 2} cy={y + h * .3} r={w * .45} fill="#dfe4ea" /><circle cx={x + w / 2} cy={y + h * .3} r={w * .35} fill="none" stroke="#9aa5b3" strokeWidth={3} strokeDasharray="4 4" /><rect x={x + w / 2 - 4} y={y + h * .6} width={8} height={h * .3} fill="#9aa5b3" /><R x={x + 6} y={y + h - 10} w={w - 12} h={10} c="#9aa5b3" r={5} /></g>;
    case 'frame': return <g><R x={x} y={y} w={w} h={h} c="#9c6b45" r={6} /><R x={x + 8} y={y + 8} w={w - 16} h={h - 16} c="#9fd3ff" r={3} /><path d={`M${x + 10} ${y + h - 12}l${w * .3} -${h * .4}l${w * .2} ${h * .2}l${w * .15} -${h * .15}l${w * .2} ${h * .35}z`} fill="#4f9d5a" /><circle cx={x + w - 20} cy={y + 20} r={6} fill="#ffd166" /></g>;
    case 'clock': return <g><circle cx={x + w / 2} cy={y + h / 2} r={w / 2} fill="#fff" /><circle cx={x + w / 2} cy={y + h / 2} r={w / 2} fill="none" stroke="#2f3542" strokeWidth={4} /><path d={`M${x + w / 2} ${y + h / 2}v-${h * .32}M${x + w / 2} ${y + h / 2}h${w * .22}`} stroke="#2f3542" strokeWidth={3} strokeLinecap="round" /></g>;
    case 'calendar': return <g><R x={x} y={y} w={w} h={h} c="#fff" r={6} /><R x={x} y={y} w={w} h={16} c="#e76f51" r={6} /></g>;
    case 'drum-rack': return <g><R x={x} y={y} w={w} h={h} c="#8c6a40" r={4} /></g>;
    default: return <R x={x} y={y} w={w} h={h} c={c} />;
  }
}

/** Storage unit chrome (shelves, cabinet doors, pegboard, hooks) drawn under the items. */
export function UnitGlyph({ u, wood = '#a97451', accent }: { u: Unit; wood?: string; accent: string }) {
  const { x, y, w, h, cols, rows } = u;
  const pad = u.kind === 'hooks' ? 10 : 14;
  const rowH = (h - pad * 2) / rows;
  switch (u.kind) {
    case 'shelf': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <rect x={x} y={y} width={w} height={h} rx={8} fill={dk(wood, .7)} />
        <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx={6} fill={lt(wood, .55)} />
        <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx={6} fill="url(#wood)" opacity=".5" />
        {Array.from({ length: rows + 1 }).map((_, i) => <g key={i}><rect x={x} y={y + pad + rowH * i - 6} width={w} height={10} rx={3} fill={i === rows ? dk(wood, .7) : wood} /><rect x={x + 4} y={y + pad + rowH * i + 4} width={w - 8} height={6} fill="rgba(0,0,0,.14)" /></g>)}
        <rect x={x} y={y} width={8} height={h} rx={3} fill={dk(wood, .7)} /><rect x={x + w - 8} y={y} width={8} height={h} rx={3} fill={dk(wood, .7)} />
      </g>
    );
    case 'cabinet': return (
      <g>
        <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={10} fill={dk(wood, .7)} />
        <rect x={x} y={y} width={w} height={h} rx={8} fill={lt(wood, .5)} />
        {Array.from({ length: rows + 1 }).map((_, i) => <rect key={i} x={x} y={y + pad + rowH * i - 6} width={w} height={8} rx={3} fill={lt(wood, .15)} />)}
        {/* open doors on the sides */}
        <rect x={x - 30} y={y - 2} width={28} height={h + 4} rx={6} fill={lt(wood, .05)} /><rect x={x + w + 2} y={y - 2} width={28} height={h + 4} rx={6} fill={lt(wood, .05)} />
        {u.locked && <g transform={`translate(${x + w - 22} ${y + h + 10})`}><rect x={-12} y={0} width={24} height={18} rx={4} fill={accent} /><path d="M-7 0v-6a7 7 0 0 1 14 0v6" fill="none" stroke={accent} strokeWidth={3} /><circle cy={9} r={2.5} fill="#1a0d05" /></g>}
        {u.high && <g transform={`translate(${x + 10} ${y + h + 10})`}><rect width={70} height={18} rx={9} fill="rgba(0,0,0,.35)" /><text x={35} y={13} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fill="#fff" fontWeight={700}>H 1.60 m</text></g>}
      </g>
    );
    case 'rack': return (
      <g>
        {Array.from({ length: rows + 1 }).map((_, i) => <rect key={i} x={x} y={y + pad + rowH * i - 6} width={w} height={8} rx={3} fill={dk(wood, .7)} />)}
        <rect x={x} y={y} width={6} height={h} fill={dk(wood, .6)} /><rect x={x + w - 6} y={y} width={6} height={h} fill={dk(wood, .6)} />
      </g>
    );
    case 'pegboard': return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={10} fill="#b78f5c" />
        <rect x={x} y={y} width={w} height={h} rx={10} fill="url(#pegs)" />
        {Array.from({ length: rows + 1 }).map((_, i) => <rect key={i} x={x + 10} y={y + pad + rowH * i - 4} width={w - 20} height={6} rx={3} fill="#8c6a40" />)}
      </g>
    );
    case 'hooks': return (
      <g>
        <rect x={x} y={y} width={w} height={16} rx={6} fill={wood} />
        {Array.from({ length: cols }).map((_, i) => { const cx = x + pad + ((w - pad * 2) / cols) * (i + .5); return <g key={i}><rect x={cx - 3} y={y + 14} width={6} height={18} rx={3} fill="#5a6270" /><circle cx={cx} cy={y + 34} r={5} fill="#5a6270" /></g>; })}
      </g>
    );
    case 'floor': return (
      <g>
        <rect x={x} y={y + h - 8} width={w} height={8} rx={4} fill="rgba(0,0,0,.12)" />
        {Array.from({ length: cols }).map((_, i) => { const sw = (w - pad * 2) / cols; return <ellipse key={i} cx={x + pad + sw * (i + .5)} cy={y + h - 6} rx={sw * .4} ry={6} fill="rgba(0,0,0,.08)" />; })}
      </g>
    );
    default: return null;
  }
}

/** Window with sky + scenario weather. */
export function Window({ w, weather, lightsOn }: { w: Win; weather: string; lightsOn: boolean }) {
  const { x, y, w: ww, h } = w;
  const sky: Record<string, [string, string]> = { rain: ['#2b3f6b', '#5b7aa8'], flood: ['#2a4a60', '#6f95ab'], heat: ['#ff9a3d', '#ffd9a0'], dark: ['#0b0e1a', '#1a1f33'], dry: ['#5aa9d6', '#d7ecf7'], shake: ['#7d7667', '#cfc3aa'], dusk: ['#3b2a5c', '#8a62b5'], fog: ['#1e3a2c', '#4f7d63'] };
  const [top, bottom] = sky[weather] ?? sky.dry;
  const id = `sky-${x}-${y}`;
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient><clipPath id={`${id}-clip`}><rect x={x} y={y} width={ww} height={h} rx={10} /></clipPath></defs>
      <rect x={x - 10} y={y - 10} width={ww + 20} height={h + 20} rx={14} fill="#fff" />
      <rect x={x} y={y} width={ww} height={h} rx={10} fill={`url(#${id})`} />
      <g clipPath={`url(#${id}-clip)`} className={`wx wx--${weather}`}>
        {weather === 'rain' || weather === 'flood' ? Array.from({ length: 14 }).map((_, i) => <path key={i} className="wx-drop" style={{ animationDelay: `${(i * 137) % 900}ms` }} d={`M${x + 8 + i * (ww / 14)} ${y - 20}l-8 30`} stroke="#cfe9ff" strokeWidth={3} strokeLinecap="round" opacity=".8" />) : null}
        {weather === 'heat' && <circle cx={x + ww * .72} cy={y + h * .3} r={h * .18} fill="#fff4cc" />}
        {weather === 'dark' || weather === 'dusk' ? Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={x + ((i * 61) % ww)} cy={y + ((i * 37) % (h * .6))} r={1.8} fill="#fff" className="wx-star" style={{ animationDelay: `${(i * 211) % 1500}ms` }} />) : null}
        {weather === 'fog' && <rect x={x} y={y + h * .4} width={ww} height={h * .6} fill="#9fd3b0" opacity=".35" />}
        {weather === 'flood' && <rect x={x} y={y + h * .7} width={ww} height={h * .3} fill="#3d8fb5" opacity=".8" className="wx-water" />}
        {/* far house silhouette */}
        <path d={`M${x} ${y + h}v-${h * .32}l${ww * .18} -${h * .14}l${ww * .18} ${h * .14}v${h * .32}z`} fill="rgba(0,0,0,.25)" />
      </g>
      <rect x={x + ww / 2 - 4} y={y} width={8} height={h} fill="#fff" /><rect x={x} y={y + h / 2 - 4} width={ww} height={8} fill="#fff" />
      {!lightsOn && <rect x={x} y={y} width={ww} height={h} rx={10} fill="rgba(0,0,0,.25)" />}
    </g>
  );
}

export function Lamp({ x, y, on, flicker }: { x: number; y: number; on: boolean; flicker?: boolean }) {
  return (
    <g className={flicker ? 'lamp lamp--flicker' : 'lamp'}>
      <rect x={x - 2} y={y} width={4} height={40} fill="#5a6270" />
      <path d={`M${x - 40} ${y + 78}l12 -38h56l12 38z`} fill="#f2b56b" />
      {on && <><ellipse cx={x} cy={y + 80} rx={38} ry={8} fill="#ffe8b0" opacity=".9" /><path d={`M${x - 40} ${y + 78}L${x - 230} ${y + 470}h460L${x + 40} ${y + 78}z`} fill="url(#lightcone)" /></>}
    </g>
  );
}

export const FURNITURE_KINDS: FurnitureKind[] = ['counter'];
