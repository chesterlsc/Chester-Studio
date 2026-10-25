import { memo } from 'react';
import type { ItemShape } from '@/domain/types';

/**
 * CAD block symbols. Plan symbols are top-down (what an architect would draw
 * on a plan); section symbols are front elevations. Both are pure line art in
 * the category colour with a faint fill, drawn in a 100×100 box centred at 0.
 */
const S = 50; // half-size

function PlanShape({ shape }: { shape: ItemShape }) {
  switch (shape) {
    case 'bottle': return <><circle r={18} /><circle r={5} /></>;
    case 'gallon': return <><circle r={30} /><circle r={11} /><path d="M-20-20 20 20" opacity=".5" /></>;
    case 'drum': return <><circle r={44} /><circle r={36} /><path d="M-26-26 26 26M-26 26 26-26" opacity=".6" /></>;
    case 'can': return <><circle r={20} /><circle r={14} opacity=".6" /></>;
    case 'sack': return <><rect x={-30} y={-24} width={60} height={48} rx={14} /><path d="M-18 10 18-10" opacity=".5" /></>;
    case 'box': return <><rect x={-28} y={-28} width={56} height={56} /><path d="M-28-28 28 28M-28 28 28-28" opacity=".55" /></>;
    case 'pouch': return <><rect x={-18} y={-26} width={36} height={52} rx={4} /><path d="M-18-16h36" opacity=".6" /></>;
    case 'jar': return <><circle r={22} /><rect x={-10} y={-10} width={20} height={20} opacity=".6" /></>;
    case 'lamp': return <><circle r={16} /><path d="M0-30v8M0 22v8M-30 0h8M22 0h8M-21-21l6 6M15 15l6 6M-21 21l6-6M15-15l6-6" /></>;
    case 'battery': return <><rect x={-22} y={-14} width={18} height={28} rx={3} /><rect x={4} y={-14} width={18} height={28} rx={3} /><path d="M-16-18v-4M10-18v-4" /></>;
    case 'radio': return <><rect x={-30} y={-18} width={60} height={36} rx={4} /><circle cx={-14} r={9} opacity=".7" /><path d="M8-8h14M8 0h14M8 8h14M18-18l10-16" /></>;
    case 'powerbank': return <><rect x={-30} y={-14} width={60} height={28} rx={6} /><path d="M2-9-6 1h8l-4 8" /></>;
    case 'panel': return <><rect x={-34} y={-24} width={68} height={48} /><path d="M-11-24v48M11-24v48M-34-8h68M-34 8h68" opacity=".6" /></>;
    case 'bag': return <><rect x={-24} y={-20} width={48} height={44} rx={8} /><path d="M-12-20a12 12 0 0 1 24 0" /></>;
    case 'kit': return <><rect x={-28} y={-22} width={56} height={44} rx={4} /><path d="M0-12v24M-12 0h24" /></>;
    case 'roll': return <><circle r={22} /><circle r={7} /></>;
    case 'rope': return <><circle r={26} /><circle r={17} opacity=".7" /><circle r={8} opacity=".5" /></>;
    case 'tarp': return <><rect x={-34} y={-24} width={68} height={48} rx={3} /><path d="M-34-8h68M-34 8h68" opacity=".5" /></>;
    case 'tool': return <><path d="M-26 26 10-10" /><rect x={4} y={-30} width={28} height={16} rx={3} transform="rotate(45 18 -22)" /></>;
    case 'cash': return <><rect x={-30} y={-16} width={60} height={32} rx={3} /><circle r={9} /><path d="M-22-8v16M22-8v16" opacity=".5" /></>;
    case 'doc': return <><rect x={-22} y={-28} width={44} height={56} rx={2} /><path d="M-12-14h24M-12-2h24M-12 10h14" opacity=".7" /></>;
    case 'bowl': return <><circle r={24} /><circle r={14} opacity=".5" /></>;
    case 'whistle': return <><circle cx={-10} r={12} /><path d="M2-8h26v14H2z" /></>;
    case 'mask': return <><rect x={-28} y={-16} width={56} height={32} rx={6} /><path d="M-28-6l-10-6M28-6l10-6M-28 6l-10 6M28 6l10 6" opacity=".7" /></>;
    case 'lock': return <><rect x={-20} y={-6} width={40} height={32} rx={4} /><path d="M-12-6v-10a12 12 0 0 1 24 0v10" /></>;
    default: return <rect x={-24} y={-24} width={48} height={48} />;
  }
}

/** Front-view (section) outline of the item, base on y=50, fits 100×100. */
function SectionShape({ shape }: { shape: ItemShape }) {
  switch (shape) {
    case 'bottle': return <><path d="M-14 50V-6c0-8 6-10 6-18v-10h16v10c0 8 6 10 6 18v56z" /><path d="M-8-34h16" /><path d="M-14 12h28" opacity=".5" /></>;
    case 'gallon': return <><path d="M-26 50V-20h52v70z" /><path d="M-10-20v-14h20v14" /><path d="M-26 0h52" opacity=".5" /></>;
    case 'drum': return <><rect x={-36} y={-50} width={72} height={100} rx={6} /><path d="M-36-30h72M-36 20h72" /><path d="M-36-5h72" opacity=".4" /></>;
    case 'can': return <><rect x={-20} y={-24} width={40} height={74} rx={3} /><path d="M-20-10h40M-20 36h40" opacity=".6" /><ellipse cy={-24} rx={20} ry={5} /></>;
    case 'sack': return <><path d="M-30 50V0c0-18 12-26 30-26S30-18 30 0v50z" /><path d="M-10-26l-4-14h28l-4 14" /></>;
    case 'box': return <><rect x={-32} y={-6} width={64} height={56} /><path d="M-32 14h64" opacity=".6" /><path d="M0-6v56" opacity=".35" /></>;
    case 'pouch': return <><path d="M-20 50V-20h40v70z" /><path d="M-20-8h40" opacity=".6" /><path d="M-14-20v-10h28v10" /></>;
    case 'jar': return <><rect x={-22} y={-18} width={44} height={68} rx={6} /><rect x={-20} y={-30} width={40} height={12} rx={2} /><path d="M-22 10h44" opacity=".4" /></>;
    case 'lamp': return <><rect x={-16} y={-30} width={32} height={60} rx={4} /><path d="M-14-30a14 10 0 0 1 28 0" /><path d="M-26 50h52M-16 30l-8 20M16 30l8 20" /><path d="M-10-18h20M-10-6h20M-10 6h20" opacity=".5" /></>;
    case 'battery': return <><rect x={-24} y={-20} width={20} height={70} rx={3} /><rect x={4} y={-20} width={20} height={70} rx={3} /><path d="M-18-20v-6h8v6M10-20v-6h8v6" /></>;
    case 'radio': return <><rect x={-34} y={0} width={68} height={50} rx={4} /><circle cx={-16} cy={25} r={11} /><path d="M8 14h18M8 24h18M8 34h18" opacity=".6" /><path d="M20 0 36-40" /></>;
    case 'powerbank': return <><rect x={-34} y={20} width={68} height={30} rx={6} /><path d="M6 26l-8 10h8l-4 10" /></>;
    case 'panel': return <><path d="M-40 50 -30 -10h70L30 50z" /><path d="M-18-10 -22 50M8-10 12 50M-34 10h66M-37 30h72" opacity=".5" /></>;
    case 'bag': return <><path d="M-26 50V-10h52v60z" /><path d="M-10-10v-12h20v12" /><path d="M-26 20h52" opacity=".4" /><rect x={-14} y={8} width={28} height={22} rx={3} opacity=".6" /></>;
    case 'kit': return <><rect x={-32} y={-6} width={64} height={56} rx={4} /><path d="M-10-6v-10h20v10" /><path d="M0 12v20M-10 22h20" /></>;
    case 'roll': return <><rect x={-34} y={10} width={68} height={40} /><ellipse cx={-34} cy={30} rx={8} ry={20} /><ellipse cx={34} cy={30} rx={8} ry={20} /><circle cx={34} cy={30} r={6} /></>;
    case 'rope': return <><ellipse cy={18} rx={30} ry={32} /><ellipse cy={18} rx={20} ry={22} opacity=".6" /><path d="M-30 18h60" opacity=".3" /></>;
    case 'tarp': return <><rect x={-36} y={10} width={72} height={40} rx={3} /><path d="M-36 24h72M-36 36h72" opacity=".5" /><path d="M-20 10v-8h40v8" /></>;
    case 'tool': return <><path d="M-6 50V-10" /><rect x={-26} y={-34} width={52} height={24} rx={3} /></>;
    case 'cash': return <><rect x={-32} y={30} width={64} height={20} rx={2} /><rect x={-30} y={14} width={64} height={20} rx={2} /><rect x={-32} y={-2} width={64} height={20} rx={2} /><circle cy={8} r={6} opacity=".7" /></>;
    case 'doc': return <><rect x={-22} y={-30} width={44} height={80} /><path d="M-12-14h24M-12 0h24M-12 14h24M-12 28h12" opacity=".6" /></>;
    case 'bowl': return <><path d="M-34 10q0 40 34 40t34-40z" /><path d="M-34 10h68" /></>;
    case 'whistle': return <><rect x={-28} y={10} width={48} height={22} rx={5} /><circle cx={-18} cy={2} r={12} /><path d="M20 16h10" /></>;
    case 'mask': return <><rect x={-30} y={0} width={60} height={40} rx={6} /><path d="M-30 12q-16-8-16 10M30 12q16-8 16 10" /><path d="M-18 14h36M-18 24h36" opacity=".5" /></>;
    case 'lock': return <><rect x={-24} y={6} width={48} height={44} rx={5} /><path d="M-14 6v-14a14 14 0 0 1 28 0v14" /><circle cy={28} r={5} opacity=".7" /></>;
    default: return <rect x={-30} y={-10} width={60} height={60} />;
  }
}

export interface SymbolProps { shape: ItemShape; color: string; size: number; x?: number; y?: number; view?: 'plan' | 'section'; dim?: boolean }

/** A CAD block: drawn with vector-effect so strokes stay crisp at any zoom. */
export const Symbol = memo(function Symbol({ shape, color, size, x = 0, y = 0, view = 'plan', dim }: SymbolProps) {
  const k = size / (S * 2);
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} fill={color} fillOpacity={dim ? .08 : .22} stroke={color} strokeWidth={2.4 / k} strokeLinejoin="round" strokeLinecap="round" opacity={dim ? .45 : 1} vectorEffect="non-scaling-stroke">
      {view === 'plan' ? <PlanShape shape={shape} /> : <SectionShape shape={shape} />}
    </g>
  );
});

/** Fixtures on the plan (furniture) in thin neutral line work. */
export function FixtureGlyph({ kind, rect }: { kind: string; rect: { x: number; y: number; w: number; h: number } }) {
  const { x, y, w, h } = rect;
  const common = { fill: 'var(--bp-fix-fill)', stroke: 'var(--bp-fix)', strokeWidth: 1.4, vectorEffect: 'non-scaling-stroke' as const };
  switch (kind) {
    case 'bed': return <g {...common}><rect x={x} y={y} width={w} height={h} rx={6} /><rect x={x + 10} y={y + 10} width={w / 2 - 15} height={h * .22} rx={5} /><rect x={x + w / 2 + 5} y={y + 10} width={w / 2 - 15} height={h * .22} rx={5} /><path d={`M${x} ${y + h * .4}h${w}`} /></g>;
    case 'crib': return <g {...common}><rect x={x} y={y} width={w} height={h} rx={6} /><path d={`M${x + 10} ${y + 10}h${w - 20}v${h - 20}h${-w + 20}z`} strokeDasharray="4 4" /></g>;
    case 'sofa': return <g {...common}><rect x={x} y={y} width={w} height={h} rx={10} /><path d={`M${x + 14} ${y + 12}h${w - 28}v${h - 24}h${-w + 28}z`} /><path d={`M${x + w / 3} ${y + 12}v${h - 24}M${x + 2 * w / 3} ${y + 12}v${h - 24}`} /></g>;
    case 'table': case 'desk': return <g {...common}><rect x={x} y={y} width={w} height={h} rx={4} /></g>;
    case 'counter': return <g {...common}><rect x={x} y={y} width={w} height={h} /><path d={`M${x + 6} ${y + 6}h${w - 12}v${h - 12}h${-w + 12}z`} strokeDasharray="3 5" /></g>;
    case 'stove': return <g {...common}><rect x={x} y={y} width={w} height={h} rx={3} /><circle cx={x + w * .3} cy={y + h * .3} r={w * .14} /><circle cx={x + w * .7} cy={y + h * .3} r={w * .14} /><circle cx={x + w * .3} cy={y + h * .7} r={w * .14} /><circle cx={x + w * .7} cy={y + h * .7} r={w * .14} /></g>;
    case 'sink': return <g {...common}><rect x={x} y={y} width={w} height={h} rx={6} /><circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) * .3} /><circle cx={x + w / 2} cy={y + h / 2} r={3} /></g>;
    case 'toilet': return <g {...common}><rect x={x} y={y} width={w} height={h * .32} rx={4} /><ellipse cx={x + w / 2} cy={y + h * .66} rx={w * .42} ry={h * .32} /></g>;
    case 'shower': return <g {...common}><rect x={x} y={y} width={w} height={h} /><path d={`M${x} ${y}L${x + w} ${y + h}M${x + w} ${y}L${x} ${y + h}`} opacity=".4" /><circle cx={x + w / 2} cy={y + h / 2} r={6} /></g>;
    case 'chair': return <g {...common}><rect x={x} y={y} width={w} height={h} rx={8} /><path d={`M${x} ${y + 8}h${w}`} /></g>;
    case 'fridge': return <g {...common}><rect x={x} y={y} width={w} height={h} rx={4} /><path d={`M${x} ${y + h * .35}h${w}`} /></g>;
    case 'washer': return <g {...common}><rect x={x} y={y} width={w} height={h} rx={4} /><circle cx={x + w / 2} cy={y + h / 2} r={w * .34} /><circle cx={x + w / 2} cy={y + h / 2} r={w * .2} strokeDasharray="3 3" /></g>;
    case 'stairs': { const n = 9; const sh = h / n; return <g {...common}><rect x={x} y={y} width={w} height={h} />{Array.from({ length: n - 1 }).map((_, i) => <path key={i} d={`M${x} ${y + sh * (i + 1)}h${w}`} />)}<path d={`M${x + w / 2} ${y + h - 6}V${y + 14}M${x + w / 2 - 8} ${y + 22}l8-8 8 8`} strokeWidth={2} /></g>; }
    case 'wardrobe': return <g {...common}><rect x={x} y={y} width={w} height={h} /><path d={`M${x + w / 2} ${y}v${h}`} /><path d={`M${x} ${y + h}L${x + w / 2} ${y}L${x + w} ${y + h}`} opacity=".35" /></g>;
    case 'tv': return <g {...common}><rect x={x} y={y} width={w} height={h} rx={2} /><path d={`M${x + w / 2 - 20} ${y + h}v8h40v-8`} /></g>;
    case 'mat': return <g {...common}><rect x={x} y={y} width={w} height={h} rx={10} strokeDasharray="6 5" /><path d={`M${x + 12} ${y + 14}h${w - 24}`} opacity=".5" /></g>;
    case 'shoe-rack': return <g {...common}><rect x={x} y={y} width={w} height={h} /><path d={`M${x + w / 3} ${y}v${h}M${x + 2 * w / 3} ${y}v${h}`} /></g>;
    case 'bookshelf': return <g {...common}><rect x={x} y={y} width={w} height={h} />{Array.from({ length: 10 }).map((_, i) => <path key={i} d={`M${x + 8 + i * ((w - 16) / 10)} ${y + 4}v${h - 8}`} opacity=".6" />)}</g>;
    case 'motorbike': return <g {...common}><rect x={x + w * .3} y={y} width={w * .4} height={h} rx={w * .2} /><circle cx={x + w / 2} cy={y + h * .18} r={w * .18} /><circle cx={x + w / 2} cy={y + h * .82} r={w * .18} /><path d={`M${x} ${y + h * .32}h${w}`} /></g>;
    case 'planter': return <g {...common}><rect x={x} y={y} width={w} height={h} rx={3} /><circle cx={x + w / 2} cy={y + h * .25} r={w * .3} opacity=".7" /><circle cx={x + w / 2} cy={y + h * .7} r={w * .3} opacity=".7" /></g>;
    default: return <rect x={x} y={y} width={w} height={h} {...common} />;
  }
}
