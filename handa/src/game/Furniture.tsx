import type { Furniture as F, Unit, Win } from './layouts';
import { INK, SH, HL, dk, lt, bandR, bandB, Cel, Stripe } from './Sprites';

/**
 * Toon furniture, storage units, windows and the ceiling lamp. Same rules as
 * Sprites.tsx: `className="ink"` = thick warm outline behind the fill (CSS
 * paint-order), one hard shadow band (`SH`), one hard highlight (`Stripe`,
 * hidden in mini), `ink2`/`fx` for inner detail that disappears in mini.
 * Room units: default `--sw` 6 → a 3-unit visible line in the 1000-wide room.
 */
const WOOD = '#c98a4b', WOOD_DK = '#8a5a34', STEEL = '#9aa5b3', NAVY = '#3a4a5c';
const thin = { strokeWidth: 'calc(var(--sw, 6) * .6)' } as const;

/** Flat hard contact shadow (toon: no blur). */
export function Shadow({ x, y, w, h = 18 }: { x: number; y: number; w: number; h?: number }) {
  return <ellipse cx={x + w / 2} cy={y} rx={w / 2 + 8} ry={h / 2} fill={INK} opacity=".18" />;
}
/** A box with a lighter top face and a darker right face, all inked. */
function Block({ x, y, w, h, c, d = 10, r = 6, grain }: { x: number; y: number; w: number; h: number; c: string; d?: number; r?: number; grain?: boolean }) {
  return (
    <g>
      {d > 0 && <path className="ink" d={`M${x} ${y}l${d} ${-d}h${w}l${-d} ${d}z`} fill={lt(c, .35)} />}
      {d > 0 && <path className="ink" d={`M${x + w} ${y}l${d} ${-d}v${h}l${-d} ${d}z`} fill={dk(c, .62)} />}
      <rect className="ink" x={x} y={y} width={w} height={h} rx={r} fill={c} />
      {grain && <rect className="fx" x={x} y={y} width={w} height={h} rx={r} fill="url(#woodgrain)" />}
      <path d={bandR(x, y, w, h, r, .22)} fill={SH} />
      {w > 40 && h > 30 && <Stripe x={x + 10} y={y + 9} h={Math.min(h * .4, 50)} />}
    </g>
  );
}
function Handle({ x, y, w = 22, vertical }: { x: number; y: number; w?: number; vertical?: boolean }) {
  return vertical ? <rect className="ink" x={x - 4} y={y} width={8} height={w} rx={4} fill={STEEL} style={thin} /> : <rect className="ink" x={x} y={y - 4} width={w} height={8} rx={4} fill={STEEL} style={thin} />;
}
/** Thick inked stroke: an INK line under a coloured one. */
function Line({ d, c, w = 5 }: { d: string; c: string; w?: number }) {
  return <><path d={d} stroke={INK} strokeWidth={w + 5} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" /></>;
}
function Leaf({ cx, cy, r, c }: { cx: number; cy: number; r: number; c: string }) {
  return <><circle className="ink" cx={cx} cy={cy} r={r} fill={c} /><path d={`M${cx + r * .3} ${cy - r * .95}a${r} ${r} 0 0 1 0 ${r * 1.9}z`} fill={SH} /></>;
}
function Pot({ x, y, w, h, c = '#d4683f' }: { x: number; y: number; w: number; h: number; c?: string }) {
  return <><path className="ink" d={`M${x + w * .14} ${y + h}h${w * .72}l${w * .1} -${h}h-${w * .92}z`} fill={c} /><path d={`M${x + w * .62} ${y}h${w * .34}l-${w * .1} ${h}h-${w * .18}z`} fill={SH} /><rect className="ink" x={x} y={y - 4} width={w} height={14} rx={5} fill={lt(c, .15)} style={thin} /></>;
}
function Picture({ x, y, w, h, frame = WOOD_DK, kind = 'hills' }: { x: number; y: number; w: number; h: number; frame?: string; kind?: 'hills' | 'kubo' | 'family' | 'jeep' | 'map' }) {
  const ix = x + 9, iy = y + 9, iw = w - 18, ih = h - 18;
  return (
    <g>
      <rect className="ink" x={x} y={y} width={w} height={h} rx={5} fill={frame} />
      <path d={bandR(x, y, w, h, 5, .2)} fill={SH} />
      <rect x={ix} y={iy} width={iw} height={ih} rx={2} fill={kind === 'map' ? '#f3e7c6' : kind === 'family' ? '#ffd9a8' : '#9fd9ff'} stroke={INK} strokeWidth={2} />
      {kind === 'hills' && <g className="fx"><path d={`M${ix} ${iy + ih}l${iw * .3} -${ih * .45}l${iw * .2} ${ih * .2}l${iw * .18} -${ih * .22}l${iw * .32} ${ih * .47}z`} fill="#5cae63" /><circle cx={ix + iw - 14} cy={iy + 13} r={6} fill="#ffd166" /></g>}
      {kind === 'kubo' && <g className="fx"><rect x={ix} y={iy + ih * .62} width={iw} height={ih * .38} fill="#6cbf6a" /><path d={`M${ix + iw * .22} ${iy + ih * .55}l${iw * .28} -${ih * .32}l${iw * .28} ${ih * .32}z`} fill="#b57a3c" stroke={INK} strokeWidth={1.5} /><rect x={ix + iw * .28} y={iy + ih * .55} width={iw * .44} height={ih * .22} fill="#d9a85f" stroke={INK} strokeWidth={1.5} /><path d={`M${ix + iw * .36} ${iy + ih * .77}v${ih * .14}M${ix + iw * .64} ${iy + ih * .77}v${ih * .14}`} stroke={INK} strokeWidth={2} /></g>}
      {kind === 'family' && <g className="fx">{[.3, .5, .7].map((t, i) => <g key={i}><circle cx={ix + iw * t} cy={iy + ih * (i === 1 ? .38 : .48)} r={ih * .13} fill="#f5c9a2" stroke={INK} strokeWidth={1.5} /><path d={`M${ix + iw * t - ih * .2} ${iy + ih}v-${ih * .25}q${ih * .2} -${ih * .2} ${ih * .4} 0v${ih * .25}z`} fill={['#e76f51', '#2a9d8f', '#f4a261'][i]} stroke={INK} strokeWidth={1.5} /></g>)}</g>}
      {kind === 'jeep' && <g className="fx"><rect x={ix + iw * .15} y={iy + ih * .35} width={iw * .7} height={ih * .35} rx={6} fill="#ff6a1a" stroke={INK} strokeWidth={1.5} /><rect x={ix + iw * .15} y={iy + ih * .28} width={iw * .7} height={ih * .12} rx={4} fill="#ffd166" stroke={INK} strokeWidth={1.5} /><circle cx={ix + iw * .3} cy={iy + ih * .74} r={ih * .1} fill={INK} /><circle cx={ix + iw * .7} cy={iy + ih * .74} r={ih * .1} fill={INK} /></g>}
      {kind === 'map' && <g className="fx"><path d={`M${ix + 8} ${iy + ih - 10}q${iw * .3} -${ih * .6} ${iw * .5} -${ih * .3}t${iw * .4} -${ih * .5}`} stroke="#e76f51" strokeWidth={3} fill="none" strokeDasharray="6 5" /><circle cx={ix + 8} cy={iy + ih - 10} r={5} fill="#2a9d8f" stroke={INK} strokeWidth={1.5} /><path d={`M${ix + iw - 10} ${iy + 8}l-6 12h12z`} fill="#ff5d6c" stroke={INK} strokeWidth={1.5} /></g>}
    </g>
  );
}

export function FurnitureGlyph({ f }: { f: F }) {
  const { x, y, w, h } = f;
  const c = f.tint ?? WOOD;
  switch (f.kind) {
    case 'counter': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <Block x={x} y={y} w={w} h={h} c="#e9e3d6" d={8} r={6} />
        <Cel x={x - 6} y={y - 6} w={w + 12} h={18} r={5} c="#7a8597" band="b" hl={false} />
        {[0, 1].map((i) => <g key={i}><Cel x={x + 14 + i * (w / 2 - 4)} y={y + 30} w={w / 2 - 24} h={h - 46} r={7} c="#d8d1c2" f={.2} /><Handle x={x + w / 4 - 11 + i * (w / 2 - 4)} y={y + h / 2 + 6} /></g>)}
        <rect x={x} y={y + h - 10} width={w} height={10} fill={INK} opacity=".35" />
      </g>
    );
    case 'stove': return <g><Cel x={x} y={y} w={w} h={h} r={6} c={NAVY} band="b" hl={false} />{[0, 1, 2].map((i) => <g key={i}><circle className="ink" cx={x + 20 + i * (w - 40) / 2} cy={y + h / 2} r={10} fill="#1f262f" style={thin} /><circle cx={x + 20 + i * (w - 40) / 2} cy={y + h / 2} r={5} fill="none" stroke="#6a7484" strokeWidth={2.5} /></g>)}</g>;
    case 'sink': return <g><Cel x={x} y={y} w={w} h={h} r={9} c="#d6dde6" band="b" hl={false} /><rect className="ink" x={x + 10} y={y + 6} width={w - 20} height={h - 10} rx={6} fill="#8f9bab" style={thin} /><Line d={`M${x + w / 2} ${y - 36}v34`} c="#c7d0da" w={6} /><Line d={`M${x + w / 2} ${y - 36}h26q8 0 8 8`} c="#c7d0da" w={6} /></g>;
    case 'fridge': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <Block x={x} y={y} w={w} h={h} c="#f3f5f7" d={9} r={10} />
        <path className="ink2" d={`M${x + 2} ${y + h * .36}h${w - 4}`} />
        <Handle x={x + w - 16} y={y + 22} w={h * .22} vertical /><Handle x={x + w - 16} y={y + h * .42} w={h * .36} vertical />
        <g className="fx"><rect x={x + 12} y={y + h * .42} width={22} height={16} rx={3} fill="#ffd166" stroke={INK} strokeWidth={1.5} /><rect x={x + 14} y={y + h * .52} width={26} height={18} rx={3} fill="#9fd9ff" stroke={INK} strokeWidth={1.5} /></g>
      </g>
    );
    case 'table': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={16} c={c} d={8} r={5} grain />{[x + 10, x + w - 24].map((lx) => <rect key={lx} className="ink" x={lx} y={y + 14} width={14} height={h - 14} rx={4} fill={dk(c, .75)} />)}</g>;
    case 'stool': return <g><Block x={x} y={y} w={w} h={10} c={c} d={5} r={4} />{[x + 6, x + w - 14].map((lx) => <rect key={lx} className="ink" x={lx} y={y + 8} width={8} height={h - 8} rx={3} fill={dk(c, .75)} />)}</g>;
    case 'washer': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <Block x={x} y={y} w={w} h={h} c="#f4f5f7" d={9} r={10} />
        <rect className="ink" x={x} y={y} width={w} height={24} rx={8} fill="#dfe4ea" style={thin} /><circle className="ink" cx={x + w - 22} cy={y + 12} r={6} fill="#5b7390" style={thin} /><rect x={x + 12} y={y + 8} width={40} height={8} rx={4} fill="#b9c5d1" stroke={INK} strokeWidth={1.5} />
        <circle className="ink" cx={x + w / 2} cy={y + h / 2 + 12} r={w * .34} fill="#b4c0cf" />
        <circle className="ink" cx={x + w / 2} cy={y + h / 2 + 12} r={w * .25} fill="#3f5c7e" style={thin} />
        <path d={`M${x + w / 2 + w * .25} ${y + h / 2 + 12}a${w * .25} ${w * .25} 0 0 1 -${w * .25} ${w * .25}a${w * .34} ${w * .34} 0 0 0 ${w * .34} -${w * .34}z`} fill={SH} />
        <circle className="fx" cx={x + w / 2 - w * .09} cy={y + h / 2 + 2} r={w * .08} fill={HL} />
      </g>
    );
    case 'laundry-sink': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={h} c="#dde3ea" d={8} r={8} /><rect className="ink" x={x + 8} y={y + 8} width={w - 16} height={h * .45} rx={6} fill="#8fa2b8" style={thin} /><Line d={`M${x + w / 2} ${y - 30}v30`} c="#c7d0da" w={6} /><Line d={`M${x + w / 2} ${y - 30}h22q8 0 8 8`} c="#c7d0da" w={6} /></g>;
    case 'pallet': return (
      <g>
        <Shadow x={x} y={y + h} w={w} h={14} />
        {Array.from({ length: 7 }).map((_, i) => <g key={i}><rect className="ink" x={x + i * (w / 7) + 3} y={y} width={w / 7 - 6} height={14} rx={3} fill="#d4a86a" /><path d={bandB(x + i * (w / 7) + 3, y, w / 7 - 6, 14, 3, .4)} fill={SH} /></g>)}
        <rect className="ink" x={x} y={y + 16} width={w} height={8} rx={2} fill="#8c6a40" />
        {[x + 10, x + w / 2 - 10, x + w - 30].map((bx) => <rect key={bx} className="ink" x={bx} y={y + 24} width={20} height={h - 24} fill="#6f5232" />)}
        <g className="fx" transform={`translate(${x + w - 70} ${y - 26})`}><rect width={66} height={20} rx={5} fill="#ffc247" stroke={INK} strokeWidth={2.5} /><text x={33} y={14} textAnchor="middle" fontSize={11} fontWeight={800} fontFamily="JetBrains Mono, monospace" fill={INK}>+12 cm</text></g>
      </g>
    );
    case 'bed': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <rect className="ink" x={x} y={y - 60} width={w * .28} height={h + 60} rx={16} fill="#9a6238" /><path d={bandR(x, y - 60, w * .28, h + 60, 16, .3)} fill={SH} /><rect className="ink" x={x + 12} y={y - 46} width={w * .28 - 24} height={70} rx={10} fill="#b57c54" style={thin} />
        <Block x={x} y={y + 30} w={w} h={h - 30} c="#f6f0e4" d={8} r={10} />
        <Cel x={x} y={y + h - 54} w={w} h={54} r={12} c="#e0684f" band="b" f={.25} />
        <path className="fx" d={`M${x + 12} ${y + h - 40}q${w / 2 - 12} 16 ${w - 24} 0`} fill="none" stroke={HL} strokeWidth={4} strokeLinecap="round" />
        <rect className="fx" x={x + 20} y={y + h - 30} width={w - 40} height={8} fill="url(#dots)" />
        {[x + 20, x + w * .36].map((px) => <g key={px}><rect className="ink" x={px} y={y + 36} width={w * .3} height={38} rx={12} fill="#fff" /><path d={bandB(px, y + 36, w * .3, 38, 12, .3)} fill={SH} /></g>)}
        <rect className="ink" x={x} y={y + h - 14} width={w} height={14} rx={6} fill="#6a4225" />
      </g>
    );
    case 'crib': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <rect className="ink" x={x} y={y + h - 26} width={w} height={18} rx={6} fill="#f1dfc4" />
        <rect x={x + 8} y={y + h * .5} width={w - 16} height={h * .24} rx={6} fill="#cfe6fb" stroke={INK} strokeWidth={2} />
        {Array.from({ length: 8 }).map((_, i) => <rect key={i} className="ink" x={x + 8 + i * ((w - 16) / 7) - 3} y={y} width={7} height={h - 20} rx={3.5} fill="#e8cfa6" style={thin} />)}
        <Cel x={x} y={y} w={w} h={10} r={5} c="#f1dfc4" band="b" hl={false} />
        {[x + 10, x + w - 20].map((lx) => <rect key={lx} className="ink" x={lx} y={y + h - 8} width={10} height={14} rx={3} fill="#d2b58e" style={thin} />)}
        <path d={`M${x + w / 2} ${y - 16}v18`} stroke={INK} strokeWidth={2} /><circle className="ink" cx={x + w / 2} cy={y - 26} r={11} fill="#ffd166" style={thin} /><circle className="fx" cx={x + w / 2 - 3} cy={y - 29} r={3} fill={HL} />
      </g>
    );
    case 'wardrobe': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={h} c="#a8744a" d={10} r={8} grain /><path className="ink2" d={`M${x + w / 2} ${y + 10}v${h - 20}`} />{[x + w / 2 - 14, x + w / 2 + 14].map((hx) => <circle key={hx} className="ink" cx={hx} cy={y + h / 2} r={5} fill={STEEL} style={thin} />)}</g>;
    case 'nightstand': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={h} c="#b57c54" d={8} r={8} grain />{[y + 14, y + h * .55].map((dy) => <g key={dy}><rect className="ink" x={x + 10} y={dy} width={w - 20} height={h * .3} rx={4} fill="#95613a" style={thin} /><Handle x={x + w / 2 - 8} y={dy + h * .15} w={16} /></g>)}<g><path className="ink" d={`M${x + w * .3} ${y - 16}l${w * .08} -36h${w * .24}l${w * .08} 36z`} fill="#ffcf7a" /><path d={`M${x + w * .54} ${y - 52}h${w * .08}l${w * .08} 36h-${w * .1}z`} fill={SH} /><rect className="ink" x={x + w / 2 - 3} y={y - 16} width={6} height={16} fill="#6d5a3a" style={thin} /></g></g>;
    case 'toilet': return <g><Shadow x={x} y={y + h} w={w} /><Cel x={x + w * .15} y={y} w={w * .7} h={h * .45} r={10} c="#fbfdff" f={.25} /><ellipse className="ink" cx={x + w / 2} cy={y + h * .68} rx={w * .5} ry={h * .22} fill="#fbfdff" /><ellipse cx={x + w / 2} cy={y + h * .64} rx={w * .36} ry={h * .14} fill="#cfe0ec" stroke={INK} strokeWidth={2} /><rect className="ink" x={x + w * .38} y={y + h * .72} width={w * .24} height={h * .28} fill="#eef3f7" style={thin} /><rect className="ink" x={x + w * .6} y={y + h * .1} width={14} height={9} rx={3} fill={STEEL} style={thin} /></g>;
    case 'basin': return <g><Shadow x={x} y={y + h} w={w} /><Cel x={x} y={y} w={w} h={38} r={16} c="#fbfdff" band="b" f={.3} hl={false} /><ellipse cx={x + w / 2} cy={y + 18} rx={w * .34} ry={10} fill="#cfe0ec" stroke={INK} strokeWidth={2} /><rect className="ink" x={x + w * .3} y={y + 36} width={w * .4} height={h - 36} rx={8} fill="#eef3f7" /><path d={bandR(x + w * .3, y + 36, w * .4, h - 36, 8, .3)} fill={SH} /><Line d={`M${x + w / 2} ${y - 26}v26`} c="#c7d0da" w={5} /><Line d={`M${x + w / 2} ${y - 26}h20q6 0 6 6`} c="#c7d0da" w={5} /></g>;
    case 'mirror': return <g><rect className="ink" x={x} y={y} width={w} height={h} rx={12} fill="#e8dcc8" /><rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={10} fill="#bfe0f5" stroke={INK} strokeWidth={2} /><path className="fx" d={`M${x + 24} ${y + h - 22}L${x + w - 24} ${y + 24}`} stroke={HL} strokeWidth={10} strokeLinecap="round" /><path className="fx" d={`M${x + w - 34} ${y + h - 18}L${x + w - 20} ${y + h - 32}`} stroke={HL} strokeWidth={5} strokeLinecap="round" /></g>;
    case 'shower': return (
      <g>
        <rect className="ink" x={x} y={y} width={w} height={h} rx={12} fill="#cfeee6" /><rect className="fx" x={x} y={y} width={w} height={h} rx={12} fill="url(#toontile)" opacity=".7" />
        <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx={10} fill="rgba(255,255,255,.28)" stroke="#fff" strokeWidth={3} opacity=".8" />
        <Line d={`M${x + w / 2} ${y + 20}v70`} c="#c7d0da" w={6} /><Cel x={x + w / 2 - 30} y={y + 84} w={60} h={16} r={8} c="#c7d0da" hl={false} />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} className="fx" d={`M${x + w / 2 - 20 + i * 10} ${y + 106}v${h - 172}`} stroke="#8fc9e8" strokeWidth={2.5} strokeDasharray="6 10" opacity=".7" />)}
        <rect className="ink" x={x + 10} y={y + h - 26} width={w - 20} height={16} rx={6} fill="#b9c5d1" style={thin} /><circle cx={x + w / 2} cy={y + h - 18} r={4} fill={INK} />
      </g>
    );
    case 'sofa': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <rect className="ink" x={x} y={y} width={w} height={h - 10} rx={18} fill="#3d6bb0" />
        <path d={bandR(x, y, w, h - 10, 18, .18)} fill={SH} />
        {[0, 1, 2].map((i) => <g key={i}><rect className="ink" x={x + 16 + i * ((w - 48) / 3 + 8)} y={y + 40} width={(w - 48) / 3} height={h - 80} rx={14} fill="#5f90d6" style={thin} /><path d={bandB(x + 16 + i * ((w - 48) / 3 + 8), y + 40, (w - 48) / 3, h - 80, 14, .3)} fill={SH} /><Stripe x={x + 26 + i * ((w - 48) / 3 + 8)} y={y + 48} h={16} /></g>)}
        <rect className="ink" x={x} y={y + 30} width={26} height={h - 50} rx={13} fill="#2f5a94" /><rect className="ink" x={x + w - 26} y={y + 30} width={26} height={h - 50} rx={13} fill="#2f5a94" />
        {[x + 20, x + w - 34].map((lx) => <rect key={lx} className="ink" x={lx} y={y + h - 10} width={14} height={10} rx={3} fill="#5a3620" style={thin} />)}
        <g><Cel x={x + w * .3} y={y + 48} w={64} h={48} r={11} c="#f4b86c" f={.3} /><rect className="fx" x={x + w * .3 + 8} y={y + 56} width={48} height={32} rx={6} fill="url(#banig)" /></g>
      </g>
    );
    case 'tv': return <g><rect className="ink" x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={12} fill="#1f242e" /><rect x={x} y={y} width={w} height={h - 18} rx={6} fill="#223a5e" stroke={INK} strokeWidth={2} /><g className="fx"><path d={`M${x} ${y + h - 18}v-${h * .32}l${w * .18} -${h * .16}l${w * .14} ${h * .1}l${w * .2} -${h * .22}l${w * .22} ${h * .2}l${w * .26} -${h * .1}v${h * .5}z`} fill="#2f6f8f" /><circle cx={x + w * .72} cy={y + h * .28} r={h * .12} fill="#ffe08a" /><path d={`M${x + w * .2} ${y + h * .2}a${h * .08} ${h * .08} 0 0 1 ${h * .16} 0h${h * .06}a${h * .06} ${h * .06} 0 0 1 0 ${h * .12}h-${h * .26}a${h * .06} ${h * .06} 0 0 1 0 -${h * .12}z`} fill="#fff" opacity=".9" /><rect x={x + 10} y={y + h - 42} width={w * .42} height={16} rx={4} fill="#e8503f" /><rect x={x + 16} y={y + h - 37} width={w * .3} height={6} rx={3} fill="#fff" opacity=".85" /></g><circle cx={x + w / 2} cy={y + h - 10} r={3} fill="#3ddc97" /><rect className="ink" x={x + w / 2 - 40} y={y + h + 4} width={80} height={9} rx={4} fill="#1f242e" style={thin} /></g>;
    case 'console': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={h} c="#8a5a36" d={10} r={10} grain /><rect className="ink" x={x + 14} y={y + 16} width={w - 28} height={h / 2 - 20} rx={6} fill="#6a4226" style={thin} /><rect className="ink" x={x + 14} y={y + h / 2 + 4} width={w - 28} height={h / 2 - 20} rx={6} fill="#6a4226" style={thin} /></g>;
    case 'rug': return <g><ellipse className="ink" cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill={f.tint ?? '#c75a46'} /><ellipse className="fx" cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="url(#banig)" opacity=".5" /><ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2 - 18} ry={h / 2 - 9} fill="none" stroke="#fde3b0" strokeWidth={4} opacity=".85" /><ellipse className="fx" cx={x + w / 2} cy={y + h / 2} rx={w / 2 - 44} ry={h / 2 - 18} fill="none" stroke="#fde3b0" strokeWidth={2.5} opacity=".6" /></g>;
    case 'plant': return <g><Shadow x={x} y={y + h} w={w} h={10} /><Pot x={x + w * .1} y={y + h * .6} w={w * .8} h={h * .4} /><Leaf cx={x + w * .5} cy={y + h * .36} r={w * .5} c="#43944f" /><Leaf cx={x + w * .24} cy={y + h * .5} r={w * .3} c="#5fae63" /><Leaf cx={x + w * .74} cy={y + h * .22} r={w * .32} c="#6cc271" /><Leaf cx={x + w * .5} cy={y + h * .1} r={w * .22} c="#8ad68f" /></g>;
    case 'desk': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={18} c="#a8744a" d={8} r={5} grain /><Block x={x + w - 110} y={y + 18} w={100} h={h - 18} c="#95613a" d={6} r={6} grain />{[y + 34, y + 60].map((dy) => <Handle key={dy} x={x + w - 75} y={dy + 5} w={30} />)}<rect className="ink" x={x + 10} y={y + 18} width={16} height={h - 18} fill="#8a5a36" /><g><rect className="ink" x={x + 40} y={y - 72} width={120} height={72} rx={8} fill="#1f242e" /><rect x={x + 46} y={y - 66} width={108} height={54} rx={5} fill="#28406a" stroke={INK} strokeWidth={2} /><g className="fx"><rect x={x + 54} y={y - 58} width={40} height={6} rx={3} fill="#9fd9ff" /><rect x={x + 54} y={y - 46} width={70} height={4} rx={2} fill="#5ea8ff" opacity=".7" /><rect x={x + 54} y={y - 38} width={56} height={4} rx={2} fill="#5ea8ff" opacity=".5" /></g><rect className="ink" x={x + 88} y={y - 4} width={24} height={6} fill="#1f242e" style={thin} /></g><g className="fx"><Cel x={x + 8} y={y - 30} w={26} h={30} r={5} c="#3a4a5c" hl={false} /><path d={`M${x + 14} ${y - 30}v-14M${x + 21} ${y - 30}v-18M${x + 28} ${y - 30}v-12`} stroke={INK} strokeWidth={4} strokeLinecap="round" /><path d={`M${x + 14} ${y - 30}v-14M${x + 21} ${y - 30}v-18M${x + 28} ${y - 30}v-12`} stroke="#ffd166" strokeWidth={2} strokeLinecap="round" /></g></g>;
    case 'chair': return <g><Cel x={x + 10} y={y - 60} w={w - 20} h={64} r={11} c="#3d4556" f={.25} /><Cel x={x} y={y} w={w} h={18} r={9} c="#2f3542" band="b" hl={false} /><rect className="ink" x={x + w / 2 - 5} y={y + 14} width={10} height={h - 30} fill="#2f3542" /><rect className="ink" x={x + 6} y={y + h - 16} width={w - 12} height={10} rx={5} fill="#2f3542" /></g>;
    case 'bookshelf': return <g><Block x={x} y={y} w={w} h={h} c="#95613a" d={6} grain /></g>;
    case 'safe': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={h} c="#3d4556" d={9} r={10} /><rect className="ink" x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx={8} fill="#4b5468" style={thin} /><circle className="ink" cx={x + w / 2} cy={y + h / 2} r={15} fill={STEEL} /><circle cx={x + w / 2} cy={y + h / 2} r={5} fill={INK} /><rect className="ink" x={x + w - 26} y={y + h / 2 - 16} width={8} height={32} rx={3} fill={STEEL} style={thin} /></g>;
    case 'door': return <g><rect className="ink" x={x} y={y} width={w} height={h} rx={10} fill="#f2e9d8" /><Block x={x + 14} y={y + 14} w={w - 28} h={h - 14} c="#8a5230" d={0} r={6} grain />{[y + 40, y + 40 + (h - 100) / 2 + 10].map((py) => <rect key={py} className="ink" x={x + 30} y={py} width={w - 60} height={(h - 100) / 2 - 10} rx={6} fill="#9a6038" style={thin} />)}<circle className="ink" cx={x + w - 40} cy={y + h / 2 + 10} r={9} fill="#e0b24a" style={thin} /><rect className="ink" x={x + w - 44} y={y + h / 2 - 20} width={8} height={14} rx={2} fill="#e0b24a" style={thin} /><rect x={x + 20} y={y + 20} width={w - 40} height={8} rx={4} fill="#e4d6bf" /></g>;
    case 'shoe-rack': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={h} c="#b57c54" d={6} r={6} grain /><rect className="ink" x={x + 6} y={y + h / 2 - 4} width={w - 12} height={8} fill="#95613a" style={thin} />{['#e76f51', '#2a9d8f', '#264653'].map((col, i) => <g key={col}><rect className="ink" x={x + 10 + i * 28} y={y + 10} width={22} height={14} rx={6} fill={col} style={thin} /></g>)}{['#ffd166', '#8ecae6'].map((col, i) => <rect key={col} className="ink" x={x + 14 + i * 36} y={y + h / 2 + 10} width={26} height={14} rx={6} fill={col} style={thin} />)}</g>;
    case 'bench': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={16} c="#a8744a" d={8} r={5} grain />{[x + 12, x + w - 26].map((lx) => <rect key={lx} className="ink" x={lx} y={y + 14} width={14} height={h - 14} rx={4} fill="#8a5a36" />)}</g>;
    case 'coat-hooks': return <g><Block x={x} y={y} w={w} h={14} c="#a8744a" d={4} r={4} grain /></g>;
    case 'motorbike': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        {[x + w * .2, x + w * .8].map((cx) => <g key={cx}><circle className="ink" cx={cx} cy={y + h * .78} r={h * .22} fill="#2a2f38" /><circle className="ink" cx={cx} cy={y + h * .78} r={h * .12} fill={STEEL} style={thin} /><circle cx={cx} cy={y + h * .78} r={h * .04} fill={INK} /></g>)}
        <Line d={`M${x + w * .2} ${y + h * .78}L${x + w * .42} ${y + h * .45}L${x + w * .68} ${y + h * .45}L${x + w * .8} ${y + h * .78}`} c="#c0392b" w={10} />
        <Cel x={x + w * .38} y={y + h * .3} w={w * .32} h={h * .2} r={11} c="#e8503f" f={.3} />
        <Cel x={x + w * .5} y={y + h * .5} w={w * .2} h={h * .14} r={6} c="#2a2f38" hl={false} />
        <Line d={`M${x + w * .7} ${y + h * .42}l${w * .12} -${h * .18}`} c="#c7d0da" w={6} /><circle className="ink" cx={x + w * .84} cy={y + h * .22} r={9} fill="#ffe8b0" style={thin} />
      </g>
    );
    case 'workbench': return <g><Shadow x={x} y={y + h} w={w} /><Block x={x} y={y} w={w} h={20} c="#c2965f" d={8} r={4} grain />{[x + 12, x + w - 28].map((lx) => <rect key={lx} className="ink" x={lx} y={y + 18} width={16} height={h - 18} fill="#8c6a40" />)}<rect className="ink" x={x + 40} y={y + 36} width={w - 80} height={14} rx={4} fill="#8c6a40" style={thin} /><Cel x={x + w - 60} y={y - 14} w={30} h={14} r={3} c="#5a6270" hl={false} /><g className="fx"><rect x={x + 30} y={y - 22} width={40} height={22} rx={4} fill="#e8503f" stroke={INK} strokeWidth={2.5} /><rect x={x + 34} y={y - 30} width={32} height={9} rx={2} fill="#ffd166" stroke={INK} strokeWidth={2} /></g></g>;
    case 'mats': return <g>{[0, 1, 2].map((i) => <g key={i}><rect className="ink" x={x + i * (w / 3)} y={y + 30} width={w / 3 - 12} height={h - 30} rx={10} fill={['#dcbf90', '#cfa972', '#dcbf90'][i]} /><rect className="fx" x={x + i * (w / 3)} y={y + 30} width={w / 3 - 12} height={h - 30} rx={10} fill="url(#banig)" opacity=".6" /><path d={bandB(x + i * (w / 3), y + 30, w / 3 - 12, h - 30, 10, .3)} fill={SH} /><Cel x={x + i * (w / 3) + 8} y={y + 8} w={w / 3 - 28} h={30} r={11} c={['#f6f0e4', '#ffd9c4', '#dff1ff'][i]} band="b" f={.3} /></g>)}</g>;
    case 'boards': return <g>{[0, 1, 2].map((i) => <g key={i} transform={`rotate(${i % 2 ? -3 : 3} ${x + w / 2} ${y + 30 + i * (h / 3)})`}><rect className="ink" x={x - 16} y={y + 20 + i * (h / 3)} width={w + 32} height={26} rx={4} fill="#b5894f" /><rect className="fx" x={x - 16} y={y + 20 + i * (h / 3)} width={w + 32} height={26} rx={4} fill="url(#woodgrain)" /><path d={bandB(x - 16, y + 20 + i * (h / 3), w + 32, 26, 4, .35)} fill={SH} /><circle cx={x - 4} cy={y + 33 + i * (h / 3)} r={3.5} fill={INK} /><circle cx={x + w + 4} cy={y + 33 + i * (h / 3)} r={3.5} fill={INK} /></g>)}</g>;
    case 'curtain': return <g><rect className="ink" x={x} y={y} width={w} height={10} rx={5} fill="#5a3a22" /><path className="ink" d={`M${x} ${y + 10}h${w * .22}q-6 ${h * .5} 0 ${h - 10}h-${w * .22}z`} fill="#2f3142" /><path className="ink" d={`M${x + w} ${y + 10}h-${w * .22}q6 ${h * .5} 0 ${h - 10}h${w * .22}z`} fill="#2f3142" /><path d={`M${x + w * .14} ${y + 10}h${w * .08}q-6 ${h * .5} 0 ${h - 10}h-${w * .08}z`} fill={SH} /><path d={`M${x + w - w * .14} ${y + 10}h-${w * .08}q6 ${h * .5} 0 ${h - 10}h${w * .08}z`} fill={SH} /></g>;
    case 'fan': return <g><circle className="ink" cx={x + w / 2} cy={y + h * .3} r={w * .48} fill="#e6ebf0" /><circle cx={x + w / 2} cy={y + h * .3} r={w * .36} fill="none" stroke={INK} strokeWidth={2.5} strokeDasharray="4 5" /><circle className="ink" cx={x + w / 2} cy={y + h * .3} r={w * .09} fill="#6f7a8c" style={thin} /><rect className="ink" x={x + w / 2 - 5} y={y + h * .6} width={10} height={h * .3} fill={STEEL} style={thin} /><rect className="ink" x={x + 6} y={y + h - 10} width={w - 12} height={10} rx={5} fill={STEEL} /></g>;
    case 'frame': return <Picture x={x} y={y} w={w} h={h} kind={w > 100 ? 'family' : 'hills'} />;
    case 'clock': return <g><circle className="ink" cx={x + w / 2} cy={y + h / 2} r={w / 2} fill="#fff8ec" /><circle cx={x + w / 2} cy={y + h / 2} r={w / 2 - 6} fill="none" stroke="#e0b24a" strokeWidth={3} /><g className="fx">{[0, 1, 2, 3].map((i) => <circle key={i} cx={x + w / 2 + Math.sin(i * Math.PI / 2) * (w / 2 - 11)} cy={y + h / 2 - Math.cos(i * Math.PI / 2) * (w / 2 - 11)} r={1.8} fill={INK} />)}</g><path d={`M${x + w / 2} ${y + h / 2}v-${h * .3}M${x + w / 2} ${y + h / 2}h${w * .22}`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" /><circle cx={x + w / 2} cy={y + h / 2} r={3} fill="#ff6a1a" /></g>;
    case 'calendar': return <g><rect className="ink" x={x} y={y} width={w} height={h} rx={6} fill="#fff8ec" /><rect x={x} y={y} width={w} height={h * .26} rx={6} fill={f.tint ?? '#e76f51'} /><rect x={x} y={y + h * .14} width={w} height={h * .12} fill={f.tint ?? '#e76f51'} /><path className="ink2" d={`M${x} ${y + h * .26}h${w}`} />{[x + w * .25, x + w * .75].map((hx) => <rect key={hx} x={hx - 3} y={y - 6} width={6} height={12} rx={3} fill={STEEL} stroke={INK} strokeWidth={1.5} />)}<g className="fx">{Array.from({ length: 12 }).map((_, i) => <rect key={i} x={x + 8 + (i % 4) * ((w - 16) / 4)} y={y + h * .36 + Math.floor(i / 4) * (h * .19)} width={(w - 16) / 4 - 5} height={h * .12} rx={2} fill={i === 5 ? '#ff6a1a' : 'rgba(42,24,18,.18)'} />)}</g></g>;
    case 'drum-rack': return <g><rect className="ink" x={x} y={y} width={w} height={h} rx={4} fill="#8c6a40" /></g>;
    /* ---- toon props (visual-novel dressing; placed in layouts so they never cover units) ---- */
    case 'poster': return <Picture x={x} y={y} w={w} h={h} frame={f.tint ?? '#e0b24a'} kind={h > w ? 'map' : 'family'} />;
    case 'kubo': return <Picture x={x} y={y} w={w} h={h} frame={f.tint ?? '#8a5a36'} kind="kubo" />;
    case 'corkboard': return (
      <g>
        <rect className="ink" x={x} y={y} width={w} height={h} rx={6} fill="#8a5a36" /><rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={3} fill="#d9a86c" stroke={INK} strokeWidth={2} />
        <rect className="fx" x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={3} fill="url(#pegs)" opacity=".5" />
        {[['#fff8ec', .12, .26, .36, .34], ['#ffe08a', .54, .24, .32, .28], ['#9fd9ff', .16, .64, .3, .24], ['#ffb4c4', .52, .58, .36, .3]].map(([col, nx, ny, nw, nh], i) => <g key={i} transform={`rotate(${i % 2 ? 3 : -2} ${x + w * (Number(nx) + Number(nw) / 2)} ${y + h * Number(ny)})`}><rect x={x + w * Number(nx)} y={y + h * Number(ny)} width={w * Number(nw)} height={h * Number(nh)} rx={2} fill={String(col)} stroke={INK} strokeWidth={2} /><g className="fx"><path d={`M${x + w * Number(nx) + 6} ${y + h * Number(ny) + 10}h${w * Number(nw) - 12}M${x + w * Number(nx) + 6} ${y + h * Number(ny) + 18}h${w * Number(nw) * .6}`} stroke="rgba(42,24,18,.4)" strokeWidth={2} strokeLinecap="round" /><circle cx={x + w * (Number(nx) + Number(nw) / 2)} cy={y + h * Number(ny) + 1} r={4} fill="#ff5d6c" stroke={INK} strokeWidth={1.5} /></g></g>)}
        {w > 150 && <g className="fx"><path d={`M${x + w * .3} ${y + h * .42}L${x + w * .68} ${y + h * .66}`} stroke="#e76f51" strokeWidth={2.5} /><rect x={x + w * .22} y={y + 10} width={w * .56} height={18} rx={4} fill="#e8503f" stroke={INK} strokeWidth={2} /><text x={x + w / 2} y={y + 23} textAnchor="middle" fontSize={11} fontWeight={800} fontFamily="JetBrains Mono, monospace" fill="#fff8ec" letterSpacing=".08em">FAMILY PLAN</text></g>}
      </g>
    );
    case 'garland': return <g><path d={`M${x} ${y}q${w / 2} ${h} ${w} 0`} fill="none" stroke="#2f7a45" strokeWidth={4} />{Array.from({ length: Math.max(3, Math.round(w / 22)) }).map((_, i, a) => { const t = (i + .5) / a.length; const px = x + w * t, py = y + 4 * h * t * (1 - t) + 2; return <g key={i}><circle className="ink" cx={px} cy={py} r={6} fill="#fff8ec" style={thin} /><circle cx={px} cy={py} r={2} fill="#ffd166" /></g>; })}</g>;
    case 'capiz': return <g><path d={`M${x + w / 2} ${y}v${h * .25}`} stroke={INK} strokeWidth={3} /><Cel x={x} y={y + h * .25} w={w} h={h * .2} r={6} c="#8a5a36" hl={false} />{Array.from({ length: 5 }).map((_, i) => <g key={i}><path d={`M${x + 8 + i * ((w - 16) / 4)} ${y + h * .45}v${h * .5 - (i % 2) * 10}`} stroke={INK} strokeWidth={1.5} /><circle className="ink" cx={x + 8 + i * ((w - 16) / 4)} cy={y + h * .95 - (i % 2) * 10} r={7} fill={['#fff3d6', '#ffe8f0', '#e8f6ff'][i % 3]} style={thin} /></g>)}</g>;
    case 'jeepney': return (
      <g>
        <Shadow x={x} y={y + h} w={w} h={8} />
        <rect className="ink" x={x} y={y + h * .3} width={w} height={h * .5} rx={h * .14} fill="#ff6a1a" />
        <path d={bandR(x, y + h * .3, w, h * .5, h * .14, .25)} fill={SH} />
        <rect className="ink" x={x + w * .08} y={y + h * .1} width={w * .84} height={h * .26} rx={h * .1} fill="#ffd166" style={thin} />
        <rect x={x + w * .14} y={y + h * .36} width={w * .55} height={h * .2} rx={3} fill="#9fd9ff" stroke={INK} strokeWidth={2} />
        <path className="fx" d={`M${x + w * .16} ${y + h * .62}h${w * .6}`} stroke="#ffd166" strokeWidth={3} strokeLinecap="round" />
        <circle className="ink" cx={x + w * .24} cy={y + h * .82} r={h * .16} fill="#2a2f38" style={thin} /><circle className="ink" cx={x + w * .76} cy={y + h * .82} r={h * .16} fill="#2a2f38" style={thin} />
        <circle className="fx" cx={x + w * .96} cy={y + h * .5} r={h * .08} fill="#ffe08a" stroke={INK} strokeWidth={1.5} />
      </g>
    );
    case 'pricesign': return (
      <g>
        <rect className="ink" x={x} y={y} width={w} height={h} rx={6} fill="#2f5a3a" />
        <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx={3} fill="none" stroke="#fde3b0" strokeWidth={2} opacity=".8" />
        <g className="fx" fontFamily="JetBrains Mono, monospace" fontWeight={800} fill="#fde3b0"><text x={x + w / 2} y={y + h * .34} textAnchor="middle" fontSize={h * .22}>SARI·SARI</text><text x={x + 12} y={y + h * .62} fontSize={h * .16}>TUBIG ₱25</text><text x={x + 12} y={y + h * .84} fontSize={h * .16}>KANDILA ₱10</text></g>
      </g>
    );
    case 'petbed': return (
      <g>
        <Shadow x={x} y={y + h} w={w} h={8} />
        <path className="ink" d={`M${x} ${y + h}v-${h * .5}q0 -${h * .5} ${w * .5} -${h * .5}t${w * .5} ${h * .5}v${h * .5}z`} fill="#c27a4a" />
        <ellipse cx={x + w / 2} cy={y + h * .6} rx={w * .36} ry={h * .22} fill="#f3dcc0" stroke={INK} strokeWidth={2} />
        <g className="fx"><ellipse cx={x + w / 2} cy={y + h * .62} rx={w * .2} ry={h * .14} fill="#8f6a4a" stroke={INK} strokeWidth={2} /><circle cx={x + w / 2 + w * .16} cy={y + h * .56} r={h * .11} fill="#8f6a4a" stroke={INK} strokeWidth={2} /><path d={`M${x + w / 2 + w * .1} ${y + h * .47}l3 -8 5 7M${x + w / 2 + w * .2} ${y + h * .47}l3 -8 5 7`} fill="#8f6a4a" stroke={INK} strokeWidth={1.5} /></g>
        <path d={bandB(x, y + h * .5, w, h * .5, 0, .35)} fill={SH} />
      </g>
    );
    case 'clothesline': return (
      <g>
        <path d={`M${x} ${y}q${w / 2} ${h * .25} ${w} 0`} fill="none" stroke={INK} strokeWidth={3} />
        {[['#ff8a66', .08, .26], ['#9fd9ff', .36, .22], ['#ffd166', .62, .24], ['#c88cff', .84, .14]].map(([col, t, cw], i) => { const tt = Number(t), ww = w * Number(cw); const py = y + h * .25 * 4 * tt * (1 - tt) + 2; return <g key={i}><path className="ink" d={i % 2 ? `M${x + w * tt - ww / 2} ${py}h${ww}v${h * .55}q-${ww / 2} 12 -${ww} 0z` : `M${x + w * tt - ww / 2} ${py}h${ww}l6 ${h * .6}h-${ww + 12}z`} fill={String(col)} style={thin} /><rect x={x + w * tt - ww / 2 + 4} y={py - 5} width={5} height={10} rx={2} fill="#e0b24a" stroke={INK} strokeWidth={1.5} /><rect x={x + w * tt + ww / 2 - 9} y={py - 5} width={5} height={10} rx={2} fill="#e0b24a" stroke={INK} strokeWidth={1.5} /></g>; })}
      </g>
    );
    case 'utensils': return (
      <g>
        <rect className="ink" x={x} y={y} width={w} height={8} rx={4} fill={STEEL} />
        {[['#e8503f', 'pan'], ['#c7d0da', 'ladle'], ['#8a5a36', 'spoon'], ['#2a9d8f', 'pot']].map(([col, kind], i) => { const px = x + 14 + i * ((w - 28) / 3); return <g key={i}><path d={`M${px} ${y + 8}v10`} stroke={INK} strokeWidth={2} />{kind === 'pan' && <><rect className="ink" x={px - 3} y={y + 18} width={6} height={28} rx={3} fill="#6b4a2b" style={thin} /><circle className="ink" cx={px} cy={y + 58} r={13} fill={String(col)} style={thin} /></>}{kind === 'ladle' && <><rect className="ink" x={px - 2.5} y={y + 18} width={5} height={30} rx={2.5} fill={String(col)} style={thin} /><path className="ink" d={`M${px - 9} ${y + 48}h18a9 9 0 0 1 -18 0z`} fill={String(col)} style={thin} /></>}{kind === 'spoon' && <><rect className="ink" x={px - 2.5} y={y + 18} width={5} height={28} rx={2.5} fill={String(col)} style={thin} /><ellipse className="ink" cx={px} cy={y + 52} rx={7} ry={9} fill={String(col)} style={thin} /></>}{kind === 'pot' && <><Cel x={px - 14} y={y + 26} w={28} h={24} r={5} c={String(col)} hl={false} /><rect className="ink" x={px - 17} y={y + 22} width={34} height={7} rx={3} fill={INK} style={thin} /></>}</g>; })}
      </g>
    );
    case 'towels': return <g><rect className="ink" x={x} y={y} width={w} height={8} rx={4} fill={STEEL} />{['#ffb4c4', '#9fd9ff'].map((col, i) => <g key={col}><path className="ink" d={`M${x + 10 + i * (w / 2)} ${y + 8}h${w / 2 - 20}v${h - 20}q-${w / 4 - 10} 10 -${w / 2 - 20} 0z`} fill={col} /><path d={`M${x + 10 + i * (w / 2) + (w / 2 - 20) * .66} ${y + 8}h${(w / 2 - 20) * .34}v${h - 20}q-${(w / 2 - 20) * .2} 6 -${(w / 2 - 20) * .34} 4z`} fill={SH} /><path className="fx" d={`M${x + 16 + i * (w / 2)} ${y + h * .6}h${w / 2 - 32}`} stroke="#fff" strokeWidth={4} opacity=".5" /></g>)}</g>;
    case 'bucket': return (
      <g>
        <Shadow x={x} y={y + h} w={w} h={8} />
        <path className="ink" d={`M${x + w * .06} ${y + h * .25}h${w * .88}l-${w * .1} ${h * .75}h-${w * .68}z`} fill={f.tint ?? '#3a86d6'} />
        <path d={`M${x + w * .66} ${y + h * .25}h${w * .28}l-${w * .1} ${h * .75}h-${w * .22}z`} fill={SH} />
        <ellipse className="ink" cx={x + w / 2} cy={y + h * .25} rx={w * .46} ry={h * .08} fill={lt(f.tint ?? '#3a86d6', .3)} />
        <path d={`M${x + w * .1} ${y + h * .25}q${w * .4} -${h * .5} ${w * .8} 0`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" /><path d={`M${x + w * .1} ${y + h * .25}q${w * .4} -${h * .5} ${w * .8} 0`} fill="none" stroke={STEEL} strokeWidth={3} strokeLinecap="round" />
        <g className="fx"><ellipse className="ink" cx={x + w * 1.1} cy={y + h * .9} rx={w * .22} ry={h * .1} fill="#ff6a1a" style={thin} /><rect className="ink" x={x + w * 1.1 - 3} y={y + h * .5} width={6} height={h * .4} rx={3} fill="#ff6a1a" style={thin} /></g>
        <Stripe x={x + w * .18} y={y + h * .38} h={h * .4} />
      </g>
    );
    case 'umbrellas': return (
      <g>
        <Shadow x={x} y={y + h} w={w} h={8} />
        {[['#e76f51', .3, -8], ['#2a9d8f', .55, 4], ['#ffd166', .75, -3]].map(([col, t, rot], i) => <g key={i} transform={`rotate(${rot} ${x + w * Number(t)} ${y + h * .5})`}><rect x={x + w * Number(t) - 2} y={y + h * .1} width={4} height={h * .5} fill={INK} /><path className="ink" d={`M${x + w * Number(t) - w * .14} ${y + h * .32}q${w * .14} -${h * .26} ${w * .28} 0q-${w * .07} ${h * .5} -${w * .14} ${h * .5}z`} fill={String(col)} style={thin} /><path d={`M${x + w * Number(t) - w * .14} ${y + h * .32}l${w * .14} -${h * .3}`} stroke={INK} strokeWidth={1.5} /></g>)}
        <Cel x={x} y={y + h * .5} w={w} h={h * .5} r={8} c={f.tint ?? '#8a5a36'} f={.3} />
      </g>
    );
    case 'doormat': return <g><rect className="ink" x={x} y={y} width={w} height={h} rx={6} fill={f.tint ?? '#b27a44'} /><rect className="fx" x={x} y={y} width={w} height={h} rx={6} fill="url(#banig)" /><rect x={x + 8} y={y + 7} width={w - 16} height={h - 14} rx={3} fill="none" stroke="#fde3b0" strokeWidth={3} /><text className="fx" x={x + w / 2} y={y + h / 2 + 6} textAnchor="middle" fontSize={16} fontWeight={800} fontFamily="Sora, system-ui" fill="#fde3b0" letterSpacing=".2em">MABUHAY</text></g>;
    case 'broom': return (
      <g>
        <g transform={`rotate(8 ${x + w * .3} ${y + h})`}><rect className="ink" x={x + w * .3 - 4} y={y} width={8} height={h * .62} rx={4} fill="#c98a4b" /><path className="ink" d={`M${x + w * .3 - 10} ${y + h * .6}h20l${w * .2} ${h * .4}h-${w * .4 + 20}z`} fill="#e0b24a" /><path className="ink2" d={`M${x + w * .3 - 4} ${y + h * .7}l-${w * .06} ${h * .25}M${x + w * .3 + 4} ${y + h * .7}l${w * .06} ${h * .25}M${x + w * .3} ${y + h * .7}v${h * .26}`} /><rect x={x + w * .3 - 12} y={y + h * .62} width={24} height={8} rx={3} fill="#e76f51" stroke={INK} strokeWidth={2} /></g>
        <g transform={`rotate(-6 ${x + w * .7} ${y + h})`}><rect className="ink" x={x + w * .7 - 4} y={y + h * .05} width={8} height={h * .62} rx={4} fill="#9aa5b3" /><path className="ink" d={`M${x + w * .7 - 12} ${y + h * .64}h24q6 ${h * .2} 0 ${h * .36}h-24q-6 -${h * .16} 0 -${h * .36}z`} fill="#dfe6ee" /><path className="fx" d={`M${x + w * .7 - 6} ${y + h * .7}v${h * .26}M${x + w * .7 + 6} ${y + h * .7}v${h * .26}`} stroke="#aab4c0" strokeWidth={3} strokeLinecap="round" /></g>
      </g>
    );
    case 'books': return <g>{[['#e76f51', 0, 0], ['#2a9d8f', 1, 2], ['#ffd166', 2, -2], ['#3a86d6', 3, 1]].map(([col, i, off], k) => <g key={k}><rect className="ink" x={x + Number(off)} y={y + h - (Number(i) + 1) * (h / 4)} width={w} height={h / 4} rx={3} fill={String(col)} style={thin} /><path className="fx" d={`M${x + Number(off) + 8} ${y + h - (Number(i) + .5) * (h / 4)}h${w - 16}`} stroke="rgba(255,255,255,.5)" strokeWidth={2} strokeLinecap="round" /></g>)}</g>;
    case 'hose': return <g><circle className="ink" cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) / 2} fill="#3f8f4e" /><circle className="ink" cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) / 2 - 8} fill="none" style={{ strokeWidth: 2.5 }} /><circle className="ink" cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) / 2 - 16} fill="none" style={{ strokeWidth: 2.5 }} /><circle className="ink" cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) * .18} fill={lt('#3f8f4e', .5)} style={thin} /><path d={`M${x + w / 2 + Math.min(w, h) * .3} ${y + h / 2 - Math.min(w, h) * .4}a${Math.min(w, h) / 2} ${Math.min(w, h) / 2} 0 0 1 0 ${Math.min(w, h) * .8}z`} fill={SH} /><rect className="ink" x={x + w / 2 - 6} y={y - 10} width={12} height={16} rx={3} fill={STEEL} style={thin} /></g>;
    case 'wainscot': return <g><rect x={x} y={y} width={w} height={h} fill={f.tint ?? '#ffd9a6'} /><rect className="fx" x={x} y={y} width={w} height={h} fill="url(#toontile)" opacity=".8" /><rect className="ink" x={x - 2} y={y - 6} width={w + 4} height={12} rx={3} fill={lt(f.tint ?? '#ffd9a6', .4)} style={thin} /></g>;
    case 'lantern': return <g><path d={`M${x + w / 2} ${y}v${h * .12}`} stroke={INK} strokeWidth={3} /><rect className="ink" x={x + w * .2} y={y + h * .1} width={w * .6} height={h * .14} rx={4} fill={NAVY} /><rect className="ink" x={x + w * .1} y={y + h * .24} width={w * .8} height={h * .6} rx={6} fill="#fff1c8" /><rect x={x + w * .2} y={y + h * .3} width={w * .6} height={h * .48} rx={4} fill="#ffd56a" /><rect className="ink" x={x + w * .15} y={y + h * .82} width={w * .7} height={h * .16} rx={5} fill={NAVY} /><Stripe x={x + w * .22} y={y + h * .32} h={h * .3} w={5} /></g>;
    default: return <rect className="ink" x={x} y={y} width={w} height={h} rx={6} fill={c} />;
  }
}

/** Storage units: thick inked frames, flat back panel, one hard shadow band under each shelf. */
export function UnitGlyph({ u, wood = WOOD, accent }: { u: Unit; wood?: string; accent: string }) {
  const { x, y, w, h, cols, rows } = u;
  const pad = u.kind === 'hooks' ? 10 : 14;
  const rowH = (h - pad * 2) / rows;
  const back = lt(wood, .5);
  switch (u.kind) {
    case 'shelf': return (
      <g>
        <Shadow x={x} y={y + h} w={w} />
        <path className="ink" d={`M${x} ${y}l10-10h${w}l-10 10z`} fill={lt(wood, .3)} /><path className="ink" d={`M${x + w} ${y}l10-10v${h}l-10 10z`} fill={dk(wood, .55)} />
        <rect className="ink" x={x} y={y} width={w} height={h} rx={4} fill={dk(wood, .72)} />
        <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={3} fill={back} /><rect className="fx" x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={3} fill="url(#planks)" opacity=".5" />
        {Array.from({ length: rows }).map((_, i) => <rect key={`sh${i}`} x={x + 8} y={y + pad + rowH * i} width={w - 16} height={rowH * .32} fill={SH} />)}
        {Array.from({ length: rows + 1 }).map((_, i) => <g key={i}><rect className="ink" x={x} y={y + pad + rowH * i - 7} width={w} height={12} rx={3} fill={i === rows ? dk(wood, .72) : wood} /><rect x={x + 6} y={y + pad + rowH * i - 3} width={w - 12} height={5} fill={SH} /></g>)}
        <rect className="ink" x={x} y={y} width={10} height={h} rx={3} fill={dk(wood, .72)} /><rect className="ink" x={x + w - 10} y={y} width={10} height={h} rx={3} fill={dk(wood, .72)} />
        <Stripe x={x + 2} y={y + 10} h={Math.min(60, h * .3)} w={5} />
      </g>
    );
    case 'cabinet': return (
      <g>
        <path className="ink" d={`M${x - 4} ${y - 4}l10-10h${w + 8}l-10 10z`} fill={lt(wood, .3)} /><path className="ink" d={`M${x + w + 4} ${y - 4}l10-10v${h + 8}l-10 10z`} fill={dk(wood, .55)} />
        <rect className="ink" x={x - 4} y={y - 4} width={w + 8} height={h + 8} rx={8} fill={dk(wood, .72)} />
        <rect x={x} y={y} width={w} height={h} rx={6} fill={back} /><rect className="fx" x={x} y={y} width={w} height={h} rx={6} fill="url(#planks)" opacity=".4" />
        {Array.from({ length: rows }).map((_, i) => <rect key={`sh${i}`} x={x} y={y + pad + rowH * i} width={w} height={rowH * .3} fill={SH} />)}
        {Array.from({ length: rows + 1 }).map((_, i) => <g key={i}><rect className="ink" x={x} y={y + pad + rowH * i - 6} width={w} height={10} rx={3} fill={wood} style={thin} /></g>)}
        {/* open glass doors */}
        {[x - 36, x + w + 4].map((dx, i) => <g key={i}><rect className="ink" x={dx} y={y - 2} width={32} height={h + 4} rx={6} fill={wood} /><rect x={dx + 6} y={y + 5} width={20} height={h - 10} rx={3} fill="rgba(191,228,255,.55)" stroke={INK} strokeWidth={2} /><path className="fx" d={`M${dx + 10} ${y + h - 14}L${dx + 22} ${y + 12}`} stroke={HL} strokeWidth={4} strokeLinecap="round" /><circle className="ink" cx={i ? dx + 8 : dx + 24} cy={y + h / 2} r={4} fill="#e0b24a" style={thin} /></g>)}
        {u.locked && <g transform={`translate(${x + w / 2} ${y + h + 14})`}><path d="M-8 0v-7a8 8 0 0 1 16 0v7" fill="none" stroke={INK} strokeWidth={8} /><path d="M-8 0v-7a8 8 0 0 1 16 0v7" fill="none" stroke="#c7d0da" strokeWidth={4} /><rect className="ink" x={-14} y={0} width={28} height={21} rx={6} fill={accent} /><circle cy={10} r={3.5} fill={INK} /></g>}
        {u.high && <g transform={`translate(${x + 8} ${y + h + 12})`}><rect width={78} height={21} rx={10.5} fill="#1f242e" stroke={INK} strokeWidth={2} /><text x={39} y={14.5} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fill="#fff" fontWeight={700}>H 1.60 m</text></g>}
      </g>
    );
    case 'rack': return (
      <g>
        {Array.from({ length: rows + 1 }).map((_, i) => <g key={i}><rect className="ink" x={x} y={y + pad + rowH * i - 7} width={w} height={11} rx={3} fill="#b4bfcb" /><rect x={x + 6} y={y + pad + rowH * i - 2} width={w - 12} height={5} fill={SH} /></g>)}
        {[x, x + w - 8].map((px) => <rect key={px} className="ink" x={px} y={y} width={8} height={h} rx={3} fill="#8f9bab" />)}
      </g>
    );
    case 'pegboard': return (
      <g>
        <path className="ink" d={`M${x + w} ${y}l8-8v${h}l-8 8z`} fill={dk(wood, .55)} />
        <rect className="ink" x={x} y={y} width={w} height={h} rx={8} fill="#d9ad6c" /><rect className="fx" x={x} y={y} width={w} height={h} rx={8} fill="url(#pegs)" />
        <rect x={x} y={y} width={w} height={h} rx={8} fill="none" stroke={dk(wood, .6)} strokeWidth={8} /><rect x={x} y={y} width={w} height={h} rx={8} fill="none" stroke={INK} strokeWidth={2} />
        {Array.from({ length: rows + 1 }).map((_, i) => <g key={i}><rect className="ink" x={x + 12} y={y + pad + rowH * i - 4} width={w - 24} height={8} rx={4} fill="#b4bfcb" style={thin} />{Array.from({ length: cols }).map((_, c) => <path key={c} d={`M${x + pad + ((w - pad * 2) / cols) * (c + .5)} ${y + pad + rowH * i - 4}v-10`} stroke={INK} strokeWidth={4} strokeLinecap="round" />)}</g>)}
      </g>
    );
    case 'hooks': return (
      <g>
        <Block x={x} y={y} w={w} h={18} c={wood} d={6} r={5} grain />
        {Array.from({ length: cols }).map((_, i) => { const cx = x + pad + ((w - pad * 2) / cols) * (i + .5); return <g key={i}><rect className="ink" x={cx - 4} y={y + 16} width={8} height={22} rx={3} fill="#b4bfcb" style={thin} /><Line d={`M${cx - 10} ${y + 38}a10 10 0 0 0 20 0`} c="#b4bfcb" w={5} /></g>; })}
      </g>
    );
    case 'floor': return (
      <g>
        {Array.from({ length: cols }).map((_, i) => { const sw = (w - pad * 2) / cols; return <ellipse key={i} cx={x + pad + sw * (i + .5)} cy={y + h - 6} rx={sw * .42} ry={8} fill={INK} opacity=".14" />; })}
      </g>
    );
    default: return null;
  }
}

/** Window: chunky inked frame, flat two-tone sky, weather, cute tied-back curtains. */
/** `fx`: draw static rain/stars/water inside the window (mini rooms). Full rooms animate these in RoomFx instead. */
export function Window({ w, weather, lightsOn, fx }: { w: Win; weather: string; lightsOn: boolean; fx?: boolean }) {
  const { x, y, w: ww, h } = w;
  const sky: Record<string, [string, string]> = { rain: ['#2b4470', '#6a8ab8'], flood: ['#2e5470', '#7aa3b8'], heat: ['#ff9a3d', '#ffd9a0'], dark: ['#0a0e22', '#1e2440'], dry: ['#4fa8e0', '#cfeaf8'], shake: ['#857c6a', '#d6c9ae'], dusk: ['#452f6b', '#9a6fc4'], fog: ['#234a36', '#5f8f73'] };
  const [top, bottom] = sky[weather] ?? sky.dry;
  const id = `sky-${x}-${y}`;
  const cur = w.curtain;
  return (
    <g>
      <defs><clipPath id={`${id}-clip`}><rect x={x} y={y} width={ww} height={h} rx={6} /></clipPath></defs>
      <rect className="ink" x={x - 14} y={y - 14} width={ww + 28} height={h + 28} rx={10} fill="#f8f1e2" />
      <path d={bandR(x - 14, y - 14, ww + 28, h + 28, 10, .12)} fill={SH} />
      <rect x={x - 8} y={y - 8} width={ww + 16} height={h + 16} rx={6} fill="#dccfb8" stroke={INK} strokeWidth={2} />
      <rect x={x} y={y} width={ww} height={h} rx={6} fill={top} />
      <g clipPath={`url(#${id}-clip)`} className={`wx wx--${weather}`}>
        <rect x={x} y={y + h * .55} width={ww} height={h * .45} fill={bottom} />
        {/* hard-edged clouds */}
        {weather !== 'dark' && <g className="fx" fill={weather === 'rain' || weather === 'flood' ? '#8ea6c8' : '#fff'} opacity=".9"><circle cx={x + ww * .25} cy={y + h * .22} r={h * .1} /><circle cx={x + ww * .33} cy={y + h * .18} r={h * .13} /><circle cx={x + ww * .42} cy={y + h * .23} r={h * .09} /><rect x={x + ww * .18} y={y + h * .22} width={ww * .3} height={h * .09} rx={h * .045} /></g>}
        <path d={`M${x} ${y + h}v-${h * .34}l${ww * .14} -${h * .1}l${ww * .12} ${h * .08}l${ww * .14} -${h * .16}l${ww * .2} ${h * .2}l${ww * .14} -${h * .06}l${ww * .26} ${h * .12}v${h * .3}z`} fill="#3f6b52" stroke={INK} strokeWidth={2} opacity=".9" />
        <path d={`M${x} ${y + h}v-${h * .2}q${ww * .3} -${h * .1} ${ww * .5} 0t${ww * .5} 0v${h * .2}z`} fill="#5a9a62" />
        {fx && (weather === 'rain' || weather === 'flood') && Array.from({ length: 14 }).map((_, i) => <path key={i} className="wx-drop" style={{ animationDelay: `${(i * 137) % 900}ms` }} d={`M${x + 6 + i * (ww / 14)} ${y - 20}l-8 30`} stroke="#dff1ff" strokeWidth={3} strokeLinecap="round" opacity=".75" />)}
        {weather === 'heat' && <><circle cx={x + ww * .72} cy={y + h * .3} r={h * .18} fill="#fff4cc" stroke={INK} strokeWidth={2} /><circle cx={x + ww * .72} cy={y + h * .3} r={h * .3} fill="#fff4cc" opacity=".25" /></>}
        {fx && (weather === 'dark' || weather === 'dusk') && Array.from({ length: 10 }).map((_, i) => <circle key={i} cx={x + ((i * 61) % ww)} cy={y + ((i * 37) % (h * .6))} r={1.8} fill="#fff" className="wx-star" style={{ animationDelay: `${(i * 211) % 1500}ms` }} />)}
        {(weather === 'dark' || weather === 'dusk') && <circle cx={x + ww * .75} cy={y + h * .25} r={h * .12} fill="#fff4cc" stroke={INK} strokeWidth={2} />}
        {weather === 'fog' && <rect x={x} y={y + h * .35} width={ww} height={h * .65} fill="#9fd3b0" opacity=".45" />}
        {fx && weather === 'flood' && <rect x={x} y={y + h * .7} width={ww} height={h * .3} fill="#3d8fb5" opacity=".85" />}
        <path className="fx" d={`M${x + ww * .06} ${y + h * .9}L${x + ww * .3} ${y + h * .08}h${ww * .08}L${x + ww * .14} ${y + h * .9}z`} fill="#fff" opacity=".22" />
      </g>
      <rect x={x} y={y} width={ww} height={h} rx={6} fill="none" stroke={INK} strokeWidth={2.5} />
      <rect x={x + ww / 2 - 5} y={y} width={10} height={h} fill="#f8f1e2" stroke={INK} strokeWidth={2} /><rect x={x} y={y + h / 2 - 5} width={ww} height={10} fill="#f8f1e2" stroke={INK} strokeWidth={2} />
      <rect className="ink" x={x - 18} y={y + h + 10} width={ww + 36} height={12} rx={4} fill="#ece2cf" />
      {cur && (
        <g>
          <rect className="ink" x={x - 16} y={y - 24} width={ww + 32} height={10} rx={5} fill="#8a5a36" /><circle className="ink" cx={x - 18} cy={y - 19} r={7} fill="#e0b24a" style={thin} /><circle className="ink" cx={x + ww + 18} cy={y - 19} r={7} fill="#e0b24a" style={thin} />
          <path className="ink" d={`M${x - 10} ${y - 16}h${ww * .26}q-${ww * .04} ${h * .45} -${ww * .16} ${h * .55}q${ww * .14} ${h * .1} ${ww * .2} ${h * .62}H${x - 10}z`} fill={cur} />
          <path className="ink" d={`M${x + ww + 10} ${y - 16}h-${ww * .26}q${ww * .04} ${h * .45} ${ww * .16} ${h * .55}q-${ww * .14} ${h * .1} -${ww * .2} ${h * .62}H${x + ww + 10}z`} fill={cur} />
          <path d={`M${x + ww + 10} ${y - 16}h-${ww * .1}q${ww * .02} ${h * .5} ${ww * .08} ${h * .55}q-${ww * .05} ${h * .15} -${ww * .06} ${h * .62}H${x + ww + 10}z`} fill={SH} />
          <rect className="fx" x={x - 10} y={y - 16} width={ww * .26} height={h + 20} fill="url(#gingham)" opacity=".7" style={{ clipPath: `url(#${id}-clip)` }} />
          <rect className="ink" x={x - 2} y={y + h * .55 - 6} width={ww * .14} height={12} rx={6} fill="#e0b24a" style={thin} /><rect className="ink" x={x + ww - ww * .12} y={y + h * .55 - 6} width={ww * .14} height={12} rx={6} fill="#e0b24a" style={thin} />
        </g>
      )}
      {!lightsOn && <rect x={x} y={y} width={ww} height={h} rx={6} fill="rgba(0,0,0,.2)" />}
    </g>
  );
}

/** Ceiling pendant lamp: chunky cone shade, warm cel shading, soft light cone (gradient allowed). */
export function Lamp({ x, y, on, flicker }: { x: number; y: number; on: boolean; flicker?: boolean }) {
  return (
    <g className={flicker ? 'lamp lamp--flicker' : 'lamp'}>
      <rect className="ink" x={x - 3} y={y} width={6} height={44} fill="#3a4250" style={thin} />
      <path className="ink" d={`M${x - 46} ${y + 84}l16 -42h60l16 42z`} fill="#f0a24a" />
      <path d={`M${x + 12} ${y + 42}h18l16 42h-26z`} fill={SH} />
      <path className="fx" d={`M${x - 30} ${y + 50}l-8 24`} stroke={HL} strokeWidth={5} strokeLinecap="round" />
      <rect className="ink" x={x - 50} y={y + 80} width={100} height={10} rx={5} fill="#c9722a" style={thin} />
      <ellipse cx={x} cy={y + 88} rx={34} ry={6} fill={on ? '#fff1c8' : '#e8dcc8'} stroke={INK} strokeWidth={2} />
      {on && <path d={`M${x - 46} ${y + 86}L${x - 260} ${y + 470}h520L${x + 46} ${y + 86}z`} fill="url(#lightcone)" />}
    </g>
  );
}
