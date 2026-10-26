import type { Furniture as F, Unit, Win } from './layouts';

/**
 * Furniture with materials: a base tone, a gradient shade overlay, edge
 * highlights, hardware, and a blurred contact shadow. Depth comes from
 * side faces (lighter top, darker right side).
 */
const dk = (hex: string, k = .78) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`; };
const lt = (hex: string, k = .2) => { const n = parseInt(hex.slice(1), 16); const f = (c: number) => Math.round(c + (255 - c) * k); return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`; };
const BOX = 'url(#shade-box)', CYL = 'url(#shade-cyl)', TOP = 'url(#shade-top)';

export function Shadow({ x, y, w, h = 18 }: { x: number; y: number; w: number; h?: number }) {
  return <ellipse cx={x + w / 2} cy={y} rx={w / 2 + 8} ry={h / 2} fill="url(#contact)" />;
}
/** A shaded box with a top face and right face. */
function Block({ x, y, w, h, c, d = 10, r = 6, grain }: { x: number; y: number; w: number; h: number; c: string; d?: number; r?: number; grain?: boolean }) {
  return (
    <g>
      <path d={`M${x} ${y}l${d} ${-d}h${w}l${-d} ${d}z`} fill={lt(c, .35)} />
      <path d={`M${x + w} ${y}l${d} ${-d}v${h}l${-d} ${d}z`} fill={dk(c, .6)} />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={c} />
      {grain && <rect x={x} y={y} width={w} height={h} rx={r} fill="url(#woodgrain)" />}
      <rect x={x} y={y} width={w} height={h} rx={r} fill={BOX} />
    </g>
  );
}
function Handle({ x, y, w = 22, vertical }: { x: number; y: number; w?: number; vertical?: boolean }) {
  return vertical ? <rect x={x - 3} y={y} width={6} height={w} rx={3} fill="url(#metal)" /> : <rect x={x} y={y - 3} width={w} height={6} rx={3} fill="url(#metal)" />;
}

export function FurnitureGlyph({ f }: { f: F }) {
  const { x, y, w, h } = f;
  const c = f.tint ?? '#b07a4a';
  switch (f.kind) {
    case 'counter': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <Block x={x} y={y} w={w} h={h} c="#d8dee7" d={8} r={6} />
        <rect x={x - 6} y={y - 6} width={w + 12} height={16} rx={4} fill="#6f7a8c" /><rect x={x - 6} y={y - 6} width={w + 12} height={16} rx={4} fill={TOP} />
        {[0, 1].map((i) => <g key={i}><rect x={x + 14 + i * (w / 2 - 4)} y={y + 30} width={w / 2 - 24} height={h - 46} rx={6} fill="#c3cad5" /><rect x={x + 14 + i * (w / 2 - 4)} y={y + 30} width={w / 2 - 24} height={h - 46} rx={6} fill={BOX} /><Handle x={x + w / 4 - 11 + i * (w / 2 - 4)} y={y + h / 2 + 6} /></g>)}
        <rect x={x} y={y + h - 10} width={w} height={10} fill="#1c222c" opacity=".35" />
      </g>
    );
    case 'stove': return <g><rect x={x} y={y} width={w} height={h} rx={5} fill="#2b313c" /><rect x={x} y={y} width={w} height={h} rx={5} fill={TOP} />{[0, 1, 2].map((i) => <g key={i}><circle cx={x + 20 + i * (w - 40) / 2} cy={y + h / 2} r={10} fill="#171b22" /><circle cx={x + 20 + i * (w - 40) / 2} cy={y + h / 2} r={6} fill="none" stroke="#5a6270" strokeWidth={2} /></g>)}<rect x={x + 8} y={y + h - 5} width={w - 16} height={2} fill="#fff" opacity=".2" /></g>;
    case 'sink': return <g><rect x={x} y={y} width={w} height={h} rx={8} fill="#c9d2dc" /><rect x={x} y={y} width={w} height={h} rx={8} fill={TOP} /><rect x={x + 10} y={y + 6} width={w - 20} height={h - 10} rx={6} fill="#8f9bab" /><rect x={x + 10} y={y + 6} width={w - 20} height={h - 10} rx={6} fill={BOX} /><path d={`M${x + w / 2} ${y - 36}v34`} stroke="url(#metal)" strokeWidth={7} strokeLinecap="round" /><path d={`M${x + w / 2} ${y - 36}h26q8 0 8 8`} stroke="url(#metal)" strokeWidth={7} strokeLinecap="round" fill="none" /></g>;
    case 'fridge': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <Block x={x} y={y} w={w} h={h} c="#eef2f6" d={9} r={10} />
        <rect x={x} y={y} width={w} height={h} rx={10} fill="url(#glass)" opacity=".5" />
        <rect x={x + 2} y={y + h * .36 - 2} width={w - 4} height={4} fill="#c6cfda" />
        <Handle x={x + w - 16} y={y + 22} w={h * .22} vertical /><Handle x={x + w - 16} y={y + h * .42} w={h * .36} vertical />
        <rect x={x + 8} y={y + 8} width={10} height={h * .26} rx={5} fill="#fff" opacity=".6" />
      </g>
    );
    case 'table': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={16} c={c} d={8} r={4} grain />{[x + 10, x + w - 22].map((lx) => <rect key={lx} x={lx} y={y + 14} width={12} height={h - 14} rx={3} fill={dk(c, .7)} />)}</g>;
    case 'stool': return <g><Block x={x} y={y} w={w} h={10} c={c} d={5} r={4} />{[x + 6, x + w - 12].map((lx) => <rect key={lx} x={lx} y={y + 8} width={6} height={h - 8} rx={2} fill={dk(c, .7)} />)}</g>;
    case 'washer': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <Block x={x} y={y} w={w} h={h} c="#f2f4f7" d={9} r={10} />
        <rect x={x} y={y} width={w} height={22} rx={8} fill="#dfe4ea" /><circle cx={x + w - 22} cy={y + 11} r={5} fill="#5b7390" /><rect x={x + 12} y={y + 7} width={40} height={8} rx={4} fill="#b9c5d1" />
        <circle cx={x + w / 2} cy={y + h / 2 + 12} r={w * .34} fill="#aab8c8" /><circle cx={x + w / 2} cy={y + h / 2 + 12} r={w * .34} fill={CYL} />
        <circle cx={x + w / 2} cy={y + h / 2 + 12} r={w * .25} fill="#3f5c7e" /><circle cx={x + w / 2} cy={y + h / 2 + 12} r={w * .25} fill="url(#glass)" />
        <circle cx={x + w / 2 - w * .08} cy={y + h / 2 + 2} r={w * .09} fill="#fff" opacity=".45" />
      </g>
    );
    case 'laundry-sink': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={h} c="#d3dae2" d={8} r={8} /><rect x={x + 8} y={y + 8} width={w - 16} height={h * .45} rx={6} fill="#8fa2b8" /><rect x={x + 8} y={y + 8} width={w - 16} height={h * .45} rx={6} fill={BOX} /><path d={`M${x + w / 2} ${y - 30}v30`} stroke="url(#metal)" strokeWidth={7} strokeLinecap="round" /><path d={`M${x + w / 2} ${y - 30}h22q8 0 8 8`} stroke="url(#metal)" strokeWidth={7} strokeLinecap="round" fill="none" /></g>;
    case 'pallet': return (
      <g>
        <Shadow x={x} y={y + h} w={w} h={14} />
        {Array.from({ length: 7 }).map((_, i) => <g key={i}><rect x={x + i * (w / 7) + 3} y={y} width={w / 7 - 6} height={14} rx={2} fill="#c49a62" /><rect x={x + i * (w / 7) + 3} y={y} width={w / 7 - 6} height={14} rx={2} fill={TOP} /><rect x={x + i * (w / 7) + 3} y={y} width={w / 7 - 6} height={14} rx={2} fill="url(#woodgrain)" /></g>)}
        <rect x={x} y={y + 16} width={w} height={8} rx={2} fill="#8c6a40" />
        {[x + 10, x + w / 2 - 10, x + w - 30].map((bx) => <rect key={bx} x={bx} y={y + 24} width={20} height={h - 24} fill="#6f5232" />)}
        <g transform={`translate(${x + w - 70} ${y - 26})`}><rect width={66} height={20} rx={4} fill="#ffc247" /><text x={33} y={14} textAnchor="middle" fontSize={11} fontWeight={800} fontFamily="JetBrains Mono, monospace" fill="#1a0d05">+12 cm</text></g>
      </g>
    );
    case 'bed': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <Block x={x} y={y - 60} w={w * .28} h={h + 60} c="#8c5a34" d={8} r={10} grain />
        <Block x={x} y={y + 30} w={w} h={h - 30} c="#f3eee4" d={8} r={10} />
        <rect x={x} y={y + h - 54} width={w} height={54} rx={10} fill="#d96b55" /><rect x={x} y={y + h - 54} width={w} height={54} rx={10} fill={BOX} /><rect x={x} y={y + h - 54} width={w} height={54} rx={10} fill="url(#weave)" opacity=".2" />
        <path d={`M${x + 10} ${y + h - 54}q${w / 2 - 10} 14 ${w - 20} 0`} fill="none" stroke="#fff" strokeWidth={3} opacity=".35" />
        {[x + 20, x + w * .36].map((px) => <g key={px}><rect x={px} y={y + 36} width={w * .3} height={38} rx={10} fill="#fff" /><rect x={px} y={y + 36} width={w * .3} height={38} rx={10} fill={BOX} /></g>)}
        <rect x={x} y={y + h - 14} width={w} height={14} rx={6} fill="#5f3a20" />
      </g>
    );
    case 'crib': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <rect x={x} y={y + h - 26} width={w} height={18} rx={6} fill="#efdcc2" /><rect x={x} y={y + h - 26} width={w} height={18} rx={6} fill={BOX} />
        <rect x={x + 8} y={y + h * .5} width={w - 16} height={h * .24} rx={6} fill="#d6e8fb" />
        {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={x + 8 + i * ((w - 16) / 7) - 3} y={y} width={6} height={h - 20} rx={3} fill="#e1c7a2" />)}
        <rect x={x} y={y} width={w} height={9} rx={4} fill="#efdcc2" /><rect x={x} y={y} width={w} height={9} rx={4} fill={TOP} />
        {[x + 10, x + w - 20].map((lx) => <rect key={lx} x={lx} y={y + h - 8} width={10} height={14} rx={2} fill="#d2b58e" />)}
        <circle cx={x + w / 2} cy={y - 26} r={10} fill="#ffd166" /><path d={`M${x + w / 2} ${y - 16}v18`} stroke="#c9b48a" strokeWidth={2} />
      </g>
    );
    case 'wardrobe': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={h} c="#9c6b45" d={10} r={8} grain /><rect x={x + w / 2 - 2} y={y + 10} width={4} height={h - 20} fill="#6f4628" />{[x + w / 2 - 14, x + w / 2 + 14].map((hx) => <circle key={hx} cx={hx} cy={y + h / 2} r={4.5} fill="url(#metal)" />)}<rect x={x + 8} y={y + 8} width={w / 2 - 16} height={h - 16} rx={4} fill="none" stroke="#fff" strokeWidth={2} opacity=".12" /></g>;
    case 'nightstand': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={h} c="#a97451" d={8} r={8} grain />{[y + 14, y + h * .55].map((dy) => <g key={dy}><rect x={x + 10} y={dy} width={w - 20} height={h * .3} rx={4} fill="#8c5a34" /><Handle x={x + w / 2 - 8} y={dy + h * .15} w={16} /></g>)}<g><rect x={x + w * .3} y={y - 52} width={w * .4} height={36} rx={6} fill="#ffe8b0" /><rect x={x + w * .3} y={y - 52} width={w * .4} height={36} rx={6} fill="url(#lampglow)" /><rect x={x + w / 2 - 3} y={y - 16} width={6} height={16} fill="#6d5a3a" /></g></g>;
    case 'toilet': return <g><Shadow x={x} y={y + h} w={w} /><rect x={x + w * .15} y={y} width={w * .7} height={h * .45} rx={10} fill="#f7fafc" /><rect x={x + w * .15} y={y} width={w * .7} height={h * .45} rx={10} fill={BOX} /><ellipse cx={x + w / 2} cy={y + h * .68} rx={w * .5} ry={h * .22} fill="#f7fafc" /><ellipse cx={x + w / 2} cy={y + h * .68} rx={w * .5} ry={h * .22} fill={TOP} /><ellipse cx={x + w / 2} cy={y + h * .64} rx={w * .36} ry={h * .14} fill="#d4e2ec" /><rect x={x + w * .38} y={y + h * .72} width={w * .24} height={h * .28} fill="#eef3f7" /><rect x={x + w * .6} y={y + h * .1} width={12} height={8} rx={3} fill="url(#metal)" /></g>;
    case 'basin': return <g><Shadow x={x} y={y + h} w={w} /><rect x={x} y={y} width={w} height={36} rx={14} fill="#f7fafc" /><rect x={x} y={y} width={w} height={36} rx={14} fill={TOP} /><ellipse cx={x + w / 2} cy={y + 18} rx={w * .34} ry={10} fill="#d4e2ec" /><rect x={x + w * .3} y={y + 36} width={w * .4} height={h - 36} rx={8} fill="#eef3f7" /><rect x={x + w * .3} y={y + 36} width={w * .4} height={h - 36} rx={8} fill={BOX} /><path d={`M${x + w / 2} ${y - 26}v26`} stroke="url(#metal)" strokeWidth={6} strokeLinecap="round" /><path d={`M${x + w / 2} ${y - 26}h20q6 0 6 6`} stroke="url(#metal)" strokeWidth={6} fill="none" strokeLinecap="round" /></g>;
    case 'mirror': return <g><rect x={x} y={y} width={w} height={h} rx={12} fill="#dde8f0" /><rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={10} fill="#b7d4ea" /><rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={10} fill="url(#glass)" /><path d={`M${x + 24} ${y + h - 22}L${x + w - 24} ${y + 24}`} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity=".45" /></g>;
    case 'shower': return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={12} fill="#cfe8e3" /><rect x={x} y={y} width={w} height={h} rx={12} fill="url(#tile)" opacity=".45" />
        <rect x={x} y={y} width={w} height={h} rx={12} fill={BOX} />
        <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx={10} fill="url(#glass)" opacity=".7" /><rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx={10} fill="none" stroke="#fff" strokeWidth={3} opacity=".7" />
        <rect x={x + w / 2 - 4} y={y + 20} width={8} height={70} rx={4} fill="url(#metal)" /><rect x={x + w / 2 - 30} y={y + 86} width={60} height={14} rx={7} fill="url(#metal)" />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${x + w / 2 - 20 + i * 10} ${y + 104}v${h - 170}`} stroke="#8fc9e8" strokeWidth={2} strokeDasharray="6 10" opacity=".6" />)}
        <rect x={x + 10} y={y + h - 26} width={w - 20} height={16} rx={6} fill="#b9c5d1" /><circle cx={x + w / 2} cy={y + h - 18} r={4} fill="#6f7a8c" />
      </g>
    );
    case 'sofa': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <rect x={x} y={y} width={w} height={h - 10} rx={16} fill="#3b67a8" /><rect x={x} y={y} width={w} height={h - 10} rx={16} fill={BOX} /><rect x={x} y={y} width={w} height={h - 10} rx={16} fill="url(#weave)" opacity=".18" />
        {[0, 1, 2].map((i) => <g key={i}><rect x={x + 16 + i * ((w - 48) / 3 + 8)} y={y + 40} width={(w - 48) / 3} height={h - 80} rx={12} fill="#5a8ad0" /><rect x={x + 16 + i * ((w - 48) / 3 + 8)} y={y + 40} width={(w - 48) / 3} height={h - 80} rx={12} fill={BOX} /><path d={`M${x + 24 + i * ((w - 48) / 3 + 8)} ${y + h - 46}h${(w - 48) / 3 - 16}`} stroke="#2f5a94" strokeWidth={2} opacity=".5" /></g>)}
        <rect x={x} y={y + 30} width={24} height={h - 50} rx={12} fill="#2f5a94" /><rect x={x + w - 24} y={y + 30} width={24} height={h - 50} rx={12} fill="#2f5a94" />
        {[x + 20, x + w - 34].map((lx) => <rect key={lx} x={lx} y={y + h - 10} width={14} height={10} rx={2} fill="#4a2e18" />)}
        <g><rect x={x + w * .3} y={y + 50} width={62} height={46} rx={10} fill="#f2b56b" /><rect x={x + w * .3} y={y + 50} width={62} height={46} rx={10} fill={BOX} /><path d={`M${x + w * .3 + 10} ${y + 73}h42`} stroke="#d99a4e" strokeWidth={2} /></g>
      </g>
    );
    case 'tv': return <g><rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={12} fill="#141922" /><rect x={x} y={y} width={w} height={h - 18} rx={6} fill="#1d2b44" /><rect x={x} y={y} width={w} height={h - 18} rx={6} fill="url(#glass)" opacity=".35" /><path d={`M${x + 24} ${y + h - 44}q${w / 2 - 24} -${h * .8} ${w - 48} 0`} fill="none" stroke="#5ea8ff" strokeWidth={4} opacity=".55" /><circle cx={x + w / 2} cy={y + h - 10} r={3} fill="#3ddc97" /><rect x={x + w / 2 - 40} y={y + h + 4} width={80} height={8} rx={3} fill="#141922" /></g>;
    case 'console': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={h} c="#7a5234" d={10} r={10} grain /><rect x={x + 14} y={y + 16} width={w - 28} height={h / 2 - 20} rx={6} fill="#5e3f26" /><rect x={x + 14} y={y + h / 2 + 4} width={w - 28} height={h / 2 - 20} rx={6} fill="#5e3f26" /></g>;
    case 'rug': return <g><ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="#b85443" /><ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="url(#weave)" opacity=".25" /><ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2 - 18} ry={h / 2 - 9} fill="none" stroke="#e8927f" strokeWidth={4} /><ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2 - 40} ry={h / 2 - 18} fill="none" stroke="#e8927f" strokeWidth={2} opacity=".6" /></g>;
    case 'plant': return <g><Shadow x={x} y={y + h} w={w} h={10} /><path d={`M${x + w * .18} ${y + h}h${w * .64}l-7 -${h * .36}h-${w * .64 - 14}z`} fill="#b4583a" /><path d={`M${x + w * .18} ${y + h}h${w * .64}l-7 -${h * .36}h-${w * .64 - 14}z`} fill={CYL} /><rect x={x + w * .12} y={y + h * .62} width={w * .76} height={8} rx={3} fill="#c9674a" />{[[.5, .4, .5, '#3f8f4e'], [.3, .5, .32, '#5fae63'], [.7, .25, .32, '#6cc271'], [.55, .18, .2, '#8ad68f']].map(([cx, cy, r, col], i) => <circle key={i} cx={x + w * Number(cx)} cy={y + h * Number(cy)} r={w * Number(r)} fill={String(col)} />)}</g>;
    case 'desk': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={18} c="#9c6b45" d={8} r={5} grain /><Block x={x + w - 110} y={y + 18} w={100} h={h - 18} c="#8a5c3a" d={6} r={6} grain />{[y + 34, y + 60].map((dy) => <Handle key={dy} x={x + w - 75} y={dy + 5} w={30} />)}<rect x={x + 10} y={y + 18} width={14} height={h - 18} fill="#7a5234" /><g><rect x={x + 40} y={y - 72} width={120} height={72} rx={8} fill="#141922" /><rect x={x + 46} y={y - 66} width={108} height={54} rx={5} fill="#22334f" /><rect x={x + 46} y={y - 66} width={108} height={54} rx={5} fill="url(#glass)" opacity=".3" /><rect x={x + 88} y={y - 4} width={24} height={6} fill="#141922" /></g></g>;
    case 'chair': return <g><rect x={x + 10} y={y - 60} width={w - 20} height={64} rx={10} fill="#3d4556" /><rect x={x + 10} y={y - 60} width={w - 20} height={64} rx={10} fill={BOX} /><rect x={x} y={y} width={w} height={16} rx={8} fill="#2f3542" /><rect x={x} y={y} width={w} height={16} rx={8} fill={TOP} /><rect x={x + w / 2 - 5} y={y + 14} width={10} height={h - 30} fill="#2f3542" /><rect x={x + 6} y={y + h - 16} width={w - 12} height={10} rx={5} fill="#2f3542" /></g>;
    case 'bookshelf': return <g><Block x={x} y={y} w={w} h={h} c="#8a5c3a" d={6} grain /></g>;
    case 'safe': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={h} c="#3d4556" d={9} r={10} /><rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx={8} fill="#4b5468" /><rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx={8} fill={BOX} /><circle cx={x + w / 2} cy={y + h / 2} r={15} fill="url(#metal)" /><circle cx={x + w / 2} cy={y + h / 2} r={6} fill="#2a303c" /><rect x={x + w - 26} y={y + h / 2 - 16} width={8} height={32} rx={3} fill="url(#metal)" /></g>;
    case 'door': return <g><rect x={x} y={y} width={w} height={h} rx={10} fill="#efe7d8" /><rect x={x} y={y} width={w} height={h} rx={10} fill={BOX} /><Block x={x + 14} y={y + 14} w={w - 28} h={h - 14} c="#7a4a2a" d={0} r={6} grain />{[y + 40, y + 40 + (h - 100) / 2 + 10].map((py) => <rect key={py} x={x + 30} y={py} width={w - 60} height={(h - 100) / 2 - 10} rx={6} fill="#8c5a34" />)}<circle cx={x + w - 40} cy={y + h / 2 + 10} r={8} fill="url(#metal)" /><rect x={x + w - 44} y={y + h / 2 - 20} width={8} height={14} rx={2} fill="url(#metal)" /><rect x={x + 20} y={y + 20} width={w - 40} height={8} rx={4} fill="#e4d6bf" /></g>;
    case 'shoe-rack': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={h} c="#a97451" d={6} r={6} grain /><rect x={x + 6} y={y + h / 2 - 3} width={w - 12} height={6} fill="#8c5a34" />{['#e76f51', '#2a9d8f', '#264653'].map((col, i) => <g key={col}><rect x={x + 10 + i * 28} y={y + 10} width={22} height={14} rx={5} fill={col} /><rect x={x + 10 + i * 28} y={y + 10} width={22} height={14} rx={5} fill={TOP} /></g>)}</g>;
    case 'bench': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={16} c="#9c6b45" d={8} r={5} grain />{[x + 12, x + w - 24].map((lx) => <rect key={lx} x={lx} y={y + 14} width={12} height={h - 14} rx={3} fill="#7a5234" />)}</g>;
    case 'coat-hooks': return <g><Block x={x} y={y} w={w} h={14} c="#9c6b45" d={4} r={4} grain /></g>;
    case 'motorbike': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        {[x + w * .2, x + w * .8].map((cx) => <g key={cx}><circle cx={cx} cy={y + h * .78} r={h * .22} fill="#1f242c" /><circle cx={cx} cy={y + h * .78} r={h * .22} fill={CYL} /><circle cx={cx} cy={y + h * .78} r={h * .12} fill="url(#metal)" /><circle cx={cx} cy={y + h * .78} r={h * .04} fill="#2a2f38" /></g>)}
        <path d={`M${x + w * .2} ${y + h * .78}L${x + w * .42} ${y + h * .45}L${x + w * .68} ${y + h * .45}L${x + w * .8} ${y + h * .78}`} fill="none" stroke="#b7312a" strokeWidth={10} strokeLinejoin="round" />
        <rect x={x + w * .38} y={y + h * .3} width={w * .32} height={h * .2} rx={10} fill="#e0443a" /><rect x={x + w * .38} y={y + h * .3} width={w * .32} height={h * .2} rx={10} fill={BOX} />
        <rect x={x + w * .5} y={y + h * .5} width={w * .2} height={h * .14} rx={6} fill="#2a2f38" />
        <path d={`M${x + w * .7} ${y + h * .42}l${w * .12} -${h * .18}`} stroke="url(#metal)" strokeWidth={6} strokeLinecap="round" /><circle cx={x + w * .84} cy={y + h * .22} r={8} fill="#ffe8b0" /><circle cx={x + w * .84} cy={y + h * .22} r={8} fill="url(#glass)" />
      </g>
    );
    case 'workbench': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={20} c="#b78f5c" d={8} r={4} grain />{[x + 12, x + w - 28].map((lx) => <rect key={lx} x={lx} y={y + 18} width={16} height={h - 18} fill="#8c6a40" />)}<rect x={x + 40} y={y + 36} width={w - 80} height={14} rx={4} fill="#8c6a40" /><rect x={x + w - 60} y={y - 12} width={30} height={12} rx={2} fill="#5a6270" /></g>;
    case 'mats': return <g>{[0, 1, 2].map((i) => <g key={i}><rect x={x + i * (w / 3)} y={y + 30} width={w / 3 - 12} height={h - 30} rx={10} fill={['#d7b98c', '#c8a46f', '#d7b98c'][i]} /><rect x={x + i * (w / 3)} y={y + 30} width={w / 3 - 12} height={h - 30} rx={10} fill="url(#weave)" opacity=".2" /><rect x={x + i * (w / 3) + 8} y={y + 8} width={w / 3 - 28} height={30} rx={10} fill="#f3eee4" /><rect x={x + i * (w / 3) + 8} y={y + 8} width={w / 3 - 28} height={30} rx={10} fill={BOX} /></g>)}</g>;
    case 'boards': return <g>{[0, 1, 2].map((i) => <g key={i} transform={`rotate(${i % 2 ? -3 : 3} ${x + w / 2} ${y + 30 + i * (h / 3)})`}><rect x={x - 16} y={y + 20 + i * (h / 3)} width={w + 32} height={26} rx={4} fill="#a67c52" /><rect x={x - 16} y={y + 20 + i * (h / 3)} width={w + 32} height={26} rx={4} fill="url(#woodgrain)" /><rect x={x - 16} y={y + 20 + i * (h / 3)} width={w + 32} height={26} rx={4} fill={TOP} /><circle cx={x - 4} cy={y + 33 + i * (h / 3)} r={3} fill="#3a2a18" /><circle cx={x + w + 4} cy={y + 33 + i * (h / 3)} r={3} fill="#3a2a18" /></g>)}</g>;
    case 'curtain': return <g><rect x={x} y={y} width={w} height={10} rx={4} fill="#4a3620" /><path d={`M${x} ${y + 10}h${w * .22}q-6 ${h * .5} 0 ${h - 10}h-${w * .22}z`} fill="#2b2d3a" /><path d={`M${x} ${y + 10}h${w * .22}q-6 ${h * .5} 0 ${h - 10}h-${w * .22}z`} fill={CYL} /><path d={`M${x + w} ${y + 10}h-${w * .22}q6 ${h * .5} 0 ${h - 10}h${w * .22}z`} fill="#2b2d3a" /><path d={`M${x + w} ${y + 10}h-${w * .22}q6 ${h * .5} 0 ${h - 10}h${w * .22}z`} fill={CYL} /></g>;
    case 'fan': return <g><circle cx={x + w / 2} cy={y + h * .3} r={w * .45} fill="#dfe4ea" /><circle cx={x + w / 2} cy={y + h * .3} r={w * .45} fill={CYL} /><circle cx={x + w / 2} cy={y + h * .3} r={w * .36} fill="none" stroke="#9aa5b3" strokeWidth={3} strokeDasharray="4 4" /><circle cx={x + w / 2} cy={y + h * .3} r={w * .08} fill="#6f7a8c" /><rect x={x + w / 2 - 4} y={y + h * .6} width={8} height={h * .3} fill="url(#metal)" /><rect x={x + 6} y={y + h - 10} width={w - 12} height={10} rx={5} fill="#9aa5b3" /></g>;
    case 'frame': return <g><rect x={x} y={y} width={w} height={h} rx={6} fill="#9c6b45" /><rect x={x} y={y} width={w} height={h} rx={6} fill={BOX} /><rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={3} fill="#9fd3ff" /><path d={`M${x + 10} ${y + h - 12}l${w * .3} -${h * .4}l${w * .2} ${h * .2}l${w * .15} -${h * .15}l${w * .2} ${h * .35}z`} fill="#4f9d5a" /><circle cx={x + w - 20} cy={y + 20} r={6} fill="#ffd166" /></g>;
    case 'clock': return <g><circle cx={x + w / 2} cy={y + h / 2} r={w / 2} fill="#fff" /><circle cx={x + w / 2} cy={y + h / 2} r={w / 2} fill="none" stroke="#2f3542" strokeWidth={4} /><path d={`M${x + w / 2} ${y + h / 2}v-${h * .32}M${x + w / 2} ${y + h / 2}h${w * .22}`} stroke="#2f3542" strokeWidth={3} strokeLinecap="round" /><circle cx={x + w / 2} cy={y + h / 2} r={2.5} fill="#ff6a1a" /></g>;
    case 'calendar': return <g><rect x={x} y={y} width={w} height={h} rx={6} fill="#fff" /><rect x={x} y={y} width={w} height={16} rx={6} fill="#e76f51" /></g>;
    case 'drum-rack': return <g><rect x={x} y={y} width={w} height={h} rx={4} fill="#8c6a40" /></g>;
    default: return <rect x={x} y={y} width={w} height={h} fill={c} />;
  }
}

/** Storage units with depth: side panels, shelf fronts, inner shadow per bay. */
export function UnitGlyph({ u, wood = '#b07a4a', accent }: { u: Unit; wood?: string; accent: string }) {
  const { x, y, w, h, cols, rows } = u;
  const pad = u.kind === 'hooks' ? 10 : 14;
  const rowH = (h - pad * 2) / rows;
  const back = lt(wood, .55);
  switch (u.kind) {
    case 'shelf': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <path d={`M${x} ${y}l10-10h${w}l-10 10z`} fill={lt(wood, .3)} /><path d={`M${x + w} ${y}l10-10v${h}l-10 10z`} fill={dk(wood, .55)} />
        <rect x={x} y={y} width={w} height={h} rx={4} fill={dk(wood, .72)} />
        <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={3} fill={back} /><rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={3} fill="url(#wood)" opacity=".55" />
        {Array.from({ length: rows }).map((_, i) => <rect key={`ao${i}`} x={x + 8} y={y + pad + rowH * i} width={w - 16} height={rowH * .45} fill="url(#ao-ceiling)" style={{ transform: 'scaleY(-1)', transformOrigin: `${x}px ${y + pad + rowH * i + rowH * .225}px` }} opacity={.9} />)}
        {Array.from({ length: rows + 1 }).map((_, i) => <g key={i}><rect x={x} y={y + pad + rowH * i - 7} width={w} height={11} rx={2} fill={i === rows ? dk(wood, .72) : wood} /><rect x={x} y={y + pad + rowH * i - 7} width={w} height={11} rx={2} fill={TOP} /><rect x={x + 6} y={y + pad + rowH * i + 4} width={w - 12} height={7} fill="rgba(0,0,0,.22)" /></g>)}
        <rect x={x} y={y} width={9} height={h} rx={2} fill={dk(wood, .72)} /><rect x={x} y={y} width={9} height={h} rx={2} fill={CYL} /><rect x={x + w - 9} y={y} width={9} height={h} rx={2} fill={dk(wood, .72)} /><rect x={x + w - 9} y={y} width={9} height={h} rx={2} fill={CYL} />
      </g>
    );
    case 'cabinet': return (
      <g>
        <path d={`M${x - 4} ${y - 4}l10-10h${w + 8}l-10 10z`} fill={lt(wood, .3)} /><path d={`M${x + w + 4} ${y - 4}l10-10v${h + 8}l-10 10z`} fill={dk(wood, .55)} />
        <rect x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={8} fill={dk(wood, .72)} />
        <rect x={x} y={y} width={w} height={h} rx={6} fill={back} /><rect x={x} y={y} width={w} height={h} rx={6} fill="url(#wood)" opacity=".4" />
        {Array.from({ length: rows + 1 }).map((_, i) => <g key={i}><rect x={x} y={y + pad + rowH * i - 6} width={w} height={9} rx={2} fill={wood} /><rect x={x} y={y + pad + rowH * i - 6} width={w} height={9} rx={2} fill={TOP} /><rect x={x + 4} y={y + pad + rowH * i + 3} width={w - 8} height={6} fill="rgba(0,0,0,.2)" /></g>)}
        {/* open glass doors */}
        {[x - 36, x + w + 4].map((dx, i) => <g key={i}><rect x={dx} y={y - 2} width={32} height={h + 4} rx={5} fill={wood} /><rect x={dx} y={y - 2} width={32} height={h + 4} rx={5} fill={BOX} /><rect x={dx + 5} y={y + 4} width={22} height={h - 8} rx={3} fill="url(#glass)" /><circle cx={i ? dx + 8 : dx + 24} cy={y + h / 2} r={3.5} fill="url(#metal)" /></g>)}
        {u.locked && <g transform={`translate(${x + w / 2} ${y + h + 14})`}><rect x={-13} y={0} width={26} height={20} rx={5} fill={accent} /><rect x={-13} y={0} width={26} height={20} rx={5} fill={BOX} /><path d="M-8 0v-7a8 8 0 0 1 16 0v7" fill="none" stroke="url(#metal)" strokeWidth={4} /><circle cy={10} r={3} fill="#1a0d05" /></g>}
        {u.high && <g transform={`translate(${x + 8} ${y + h + 12})`}><rect width={76} height={20} rx={10} fill="rgba(0,0,0,.5)" /><text x={38} y={14} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fill="#fff" fontWeight={700}>H 1.60 m</text></g>}
      </g>
    );
    case 'rack': return (
      <g>
        {Array.from({ length: rows + 1 }).map((_, i) => <g key={i}><rect x={x} y={y + pad + rowH * i - 7} width={w} height={10} rx={3} fill={dk(wood, .75)} /><rect x={x} y={y + pad + rowH * i - 7} width={w} height={10} rx={3} fill={TOP} /><rect x={x + 6} y={y + pad + rowH * i + 3} width={w - 12} height={6} fill="rgba(0,0,0,.2)" /></g>)}
        {[x, x + w - 7].map((px) => <rect key={px} x={px} y={y} width={7} height={h} rx={2} fill="url(#metal)" />)}
      </g>
    );
    case 'pegboard': return (
      <g>
        <path d={`M${x + w} ${y}l8-8v${h}l-8 8z`} fill={dk(wood, .55)} />
        <rect x={x} y={y} width={w} height={h} rx={8} fill="#c9a26e" /><rect x={x} y={y} width={w} height={h} rx={8} fill={BOX} /><rect x={x} y={y} width={w} height={h} rx={8} fill="url(#pegs)" />
        <rect x={x} y={y} width={w} height={h} rx={8} fill="none" stroke={dk(wood, .6)} strokeWidth={6} />
        {Array.from({ length: rows + 1 }).map((_, i) => <g key={i}><rect x={x + 12} y={y + pad + rowH * i - 4} width={w - 24} height={7} rx={3} fill="url(#metal)" />{Array.from({ length: cols }).map((_, c) => <path key={c} d={`M${x + pad + ((w - pad * 2) / cols) * (c + .5)} ${y + pad + rowH * i - 4}v-10`} stroke="#8a93a4" strokeWidth={3} strokeLinecap="round" />)}</g>)}
      </g>
    );
    case 'hooks': return (
      <g>
        <Block x={x} y={y} w={w} h={18} c={wood} d={6} r={5} grain />
        {Array.from({ length: cols }).map((_, i) => { const cx = x + pad + ((w - pad * 2) / cols) * (i + .5); return <g key={i}><rect x={cx - 4} y={y + 16} width={8} height={22} rx={3} fill="url(#metal)" /><path d={`M${cx - 10} ${y + 38}a10 10 0 0 0 20 0`} fill="none" stroke="url(#metal)" strokeWidth={5} strokeLinecap="round" /></g>; })}
      </g>
    );
    case 'floor': return (
      <g>
        {Array.from({ length: cols }).map((_, i) => { const sw = (w - pad * 2) / cols; return <ellipse key={i} cx={x + pad + sw * (i + .5)} cy={y + h - 6} rx={sw * .42} ry={8} fill="url(#contact)" />; })}
      </g>
    );
    default: return null;
  }
}

/** Window: frame with depth, sky + weather, glass sheen, rain on the glass. */
export function Window({ w, weather, lightsOn }: { w: Win; weather: string; lightsOn: boolean }) {
  const { x, y, w: ww, h } = w;
  const sky: Record<string, [string, string]> = { rain: ['#223756', '#5b7aa8'], flood: ['#2a4a60', '#6f95ab'], heat: ['#ff9a3d', '#ffd9a0'], dark: ['#070a16', '#1a1f33'], dry: ['#4f9fd1', '#d7ecf7'], shake: ['#7d7667', '#cfc3aa'], dusk: ['#3b2a5c', '#8a62b5'], fog: ['#1e3a2c', '#4f7d63'] };
  const [top, bottom] = sky[weather] ?? sky.dry;
  const id = `sky-${x}-${y}`;
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient><clipPath id={`${id}-clip`}><rect x={x} y={y} width={ww} height={h} rx={6} /></clipPath></defs>
      <rect x={x - 14} y={y - 14} width={ww + 28} height={h + 28} rx={10} fill="#f6f1e6" /><rect x={x - 14} y={y - 14} width={ww + 28} height={h + 28} rx={10} fill={BOX} />
      <rect x={x - 8} y={y - 8} width={ww + 16} height={h + 16} rx={6} fill="#d9d2c2" />
      <rect x={x} y={y} width={ww} height={h} rx={6} fill={`url(#${id})`} />
      <g clipPath={`url(#${id}-clip)`} className={`wx wx--${weather}`}>
        <path d={`M${x} ${y + h}v-${h * .34}l${ww * .14} -${h * .1}l${ww * .12} ${h * .08}l${ww * .14} -${h * .16}l${ww * .2} ${h * .2}l${ww * .14} -${h * .06}l${ww * .26} ${h * .12}v${h * .3}z`} fill="rgba(0,0,0,.32)" />
        {(weather === 'rain' || weather === 'flood') && Array.from({ length: 16 }).map((_, i) => <path key={i} className="wx-drop" style={{ animationDelay: `${(i * 137) % 900}ms` }} d={`M${x + 6 + i * (ww / 16)} ${y - 20}l-8 30`} stroke="#dff1ff" strokeWidth={2.5} strokeLinecap="round" opacity=".75" />)}
        {(weather === 'rain' || weather === 'flood') && Array.from({ length: 10 }).map((_, i) => <circle key={`d${i}`} cx={x + ((i * 71) % ww)} cy={y + ((i * 43) % h)} r={2.5} fill="#fff" opacity=".35" />)}
        {weather === 'heat' && <><circle cx={x + ww * .72} cy={y + h * .3} r={h * .18} fill="#fff4cc" /><circle cx={x + ww * .72} cy={y + h * .3} r={h * .3} fill="#fff4cc" opacity=".25" /></>}
        {(weather === 'dark' || weather === 'dusk') && Array.from({ length: 12 }).map((_, i) => <circle key={i} cx={x + ((i * 61) % ww)} cy={y + ((i * 37) % (h * .6))} r={1.6} fill="#fff" className="wx-star" style={{ animationDelay: `${(i * 211) % 1500}ms` }} />)}
        {weather === 'fog' && <rect x={x} y={y + h * .35} width={ww} height={h * .65} fill="#9fd3b0" opacity=".4" />}
        {weather === 'flood' && <rect x={x} y={y + h * .7} width={ww} height={h * .3} fill="#3d8fb5" opacity=".85" className="wx-water" />}
        <rect x={x} y={y} width={ww} height={h} fill="url(#glass)" opacity=".5" />
      </g>
      <rect x={x + ww / 2 - 4} y={y} width={8} height={h} fill="#f6f1e6" /><rect x={x} y={y + h / 2 - 4} width={ww} height={8} fill="#f6f1e6" />
      <rect x={x - 16} y={y + h + 8} width={ww + 32} height={10} rx={3} fill="#e8e1d2" /><rect x={x - 16} y={y + h + 8} width={ww + 32} height={10} rx={3} fill={TOP} />
      {!lightsOn && <rect x={x} y={y} width={ww} height={h} rx={6} fill="rgba(0,0,0,.2)" />}
    </g>
  );
}

export function Lamp({ x, y, on, flicker }: { x: number; y: number; on: boolean; flicker?: boolean }) {
  return (
    <g className={flicker ? 'lamp lamp--flicker' : 'lamp'}>
      <rect x={x - 2} y={y} width={4} height={42} fill="#3a4250" />
      <path d={`M${x - 44} ${y + 82}l14 -40h60l14 40z`} fill="#e8a455" /><path d={`M${x - 44} ${y + 82}l14 -40h60l14 40z`} fill={CYL} />
      <path d={`M${x - 44} ${y + 82}h118`} stroke="#c27a33" strokeWidth={4} />
      {on && <><ellipse cx={x} cy={y + 84} rx={40} ry={7} fill="#fff1c8" /><path d={`M${x - 44} ${y + 82}L${x - 260} ${y + 470}h520L${x + 44} ${y + 82}z`} fill="url(#lightcone)" /></>}
    </g>
  );
}
