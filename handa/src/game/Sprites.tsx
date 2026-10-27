import { memo, type CSSProperties } from 'react';
import type { ItemShape } from '@/domain/types';

/**
 * TOON STYLE RULES (Saga-style cartoon; shared by Sprites, Furniture, RoomScene, HouseMap)
 * - Ink: every solid object is outlined in warm near-black `INK` (#2a1812) with rounded joins.
 *   Outlines are plain strokes drawn BEHIND the fill (`className="ink"` → CSS `paint-order: stroke`),
 *   so a stroke-width of 6 reads as a 3-unit line in the 1000-wide room. Sprites scale, so `Sprite`
 *   sets `--sw` = 6 / scale to keep the visible weight constant. Mini rooms multiply `--sw` by 1.7 in CSS.
 *   Inner detail lines use `className="ink2"` (thin, 1.5) or an explicit thin INK stroke; keep them few.
 *   No SVG outline filters anywhere: strokes only (9 mini rooms must stay cheap).
 * - Cel shading: flat saturated base colour + ONE hard shadow band (`SH`, warm ink at 22 %, right/bottom
 *   third, helpers `bandR`/`bandB`) + ONE hard highlight (`HL`, a rounded white stripe top-left, `className="fx"`).
 *   Light comes from the top-left. Gradients are only for glows, glass gleam and light pools.
 * - Details that only matter at full size (highlights, grain, hardware, text) get `className="fx"` or `ink2`:
 *   both are hidden in `.room--mini` so thumbnails read as chunky silhouettes.
 * - Shapes are chunky and rounded (rx 6–12), labels are big with 1–4 letters.
 * Item box is 100 × 110, base at y = 50 (unchanged).
 */
export const INK = '#2a1812';
export const SH = 'rgba(42,24,18,.22)';
export const HL = 'rgba(255,255,255,.5)';
export const dk = (hex: string, k = .72) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`; };
export const lt = (hex: string, k = .35) => { const n = parseInt(hex.slice(1), 16); const f = (c: number) => Math.round(c + (255 - c) * k); return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`; };

/** Right third of a rounded rect (hard shadow band). */
export function bandR(x: number, y: number, w: number, h: number, r = 0, f = .34): string {
  r = Math.min(r, w / 2, h / 2); const bx = x + w * (1 - f);
  return `M${bx} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${bx}z`;
}
/** Bottom third of a rounded rect (hard shadow band). */
export function bandB(x: number, y: number, w: number, h: number, r = 0, f = .3): string {
  r = Math.min(r, w / 2, h / 2); const by = y + h * (1 - f);
  return `M${x} ${by}V${y + h - r}Q${x} ${y + h} ${x + r} ${y + h}H${x + w - r}Q${x + w} ${y + h} ${x + w} ${y + h - r}V${by}z`;
}
/** Hard highlight stripe (hidden in mini). */
export function Stripe({ x, y, h, w = 7 }: { x: number; y: number; h: number; w?: number }) {
  return <rect className="fx" x={x} y={y} width={w} height={h} rx={w / 2} fill={HL} />;
}
/** Inked, cel-shaded rounded box: base + one shadow band + one highlight. */
export function Cel({ x, y, w, h, r = 6, c, f = .34, band = 'r', hl = true, sh = SH }: { x: number; y: number; w: number; h: number; r?: number; c: string; f?: number; band?: 'r' | 'b' | 'none'; hl?: boolean; sh?: string }) {
  return (
    <g>
      <rect className="ink" x={x} y={y} width={w} height={h} rx={r} fill={c} />
      {band === 'r' && <path d={bandR(x, y, w, h, r, f)} fill={sh} />}
      {band === 'b' && <path d={bandB(x, y, w, h, r, f)} fill={sh} />}
      {hl && w > 18 && h > 18 && <Stripe x={x + Math.min(w * .12, 10)} y={y + Math.min(h * .12, 10)} h={Math.min(h * .45, 40)} w={Math.min(7, w * .14)} />}
    </g>
  );
}

function Label({ x, y, w, h, c, text, dark }: { x: number; y: number; w: number; h: number; c: string; text?: string; dark?: boolean }) {
  return (
    <g>
      <rect className="ink" x={x} y={y} width={w} height={h} rx={3} fill="#fff8ec" style={{ strokeWidth: 'calc(var(--sw, 6) * .6)' }} />
      <rect x={x} y={y} width={w} height={h * .3} rx={2} fill={c} />
      {text && <text className="fx" x={x + w / 2} y={y + h * .74} textAnchor="middle" fontSize={h * .36} fontWeight={800} fontFamily="Sora, system-ui" fill={dark ? INK : dk(c, .5)} letterSpacing=".03em">{text}</text>}
    </g>
  );
}

const BOTTLE = 'M-16 44Q-16 50 -10 50H10Q16 50 16 44V-4Q16 -14 8 -20V-30H-8V-20Q-16 -14 -16 -4z';
function Bottle({ c }: { c: string }) {
  return (
    <g>
      <path className="ink" d={BOTTLE} fill="#bfe4ff" />
      <path d="M-16 44Q-16 50 -10 50H10Q16 50 16 44V4H-16z" fill={c} opacity=".9" />
      <path d="M5 -30H8V-20Q16 -14 16 -4V44Q16 50 10 50H5z" fill={SH} />
      <Cel x={-12} y={-44} w={24} h={15} r={5} c="#1f63b3" hl={false} />
      <Label x={-12} y={12} w={24} h={22} c={c} text="H2O" dark />
      <Stripe x={-11} y={-14} h={22} w={5} />
    </g>
  );
}
/** A shrink-wrapped six-pack: how bottled water is actually stored. */
function SixPack({ c }: { c: string }) {
  return (
    <g>
      {[-26, -6, 14].map((x, i) => <g key={`b${i}`} transform={`translate(${x + 10} 4) scale(.62)`}><Bottle c={c} /></g>)}
      {[-30, -10, 10].map((x, i) => <g key={i} transform={`translate(${x + 10} 10) scale(.62)`}><Bottle c={c} /></g>)}
      <rect className="ink" x={-42} y={-6} width={84} height={56} rx={8} fill="rgba(170,220,255,.28)" />
      <path className="fx" d="M-34 2q22-8 34 14" stroke={HL} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
}
function Gallon({ c }: { c: string }) {
  return (
    <g>
      <rect className="ink" x={-28} y={-26} width={56} height={76} rx={10} fill="#8fcbff" />
      <rect x={-28} y={6} width={56} height={44} rx={10} fill={c} opacity=".8" /><rect x={-28} y={6} width={56} height={20} fill={c} opacity=".8" />
      <path d={bandR(-28, -26, 56, 76, 10)} fill={SH} />
      <rect className="ink" x={-10} y={-40} width={20} height={16} rx={4} fill="#8fcbff" />
      <Cel x={-13} y={-50} w={26} h={12} r={4} c="#1f63b3" hl={false} />
      <path d="M8-24a12 12 0 0 1 18 12" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" /><path d="M8-24a12 12 0 0 1 18 12" stroke="#1f63b3" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Label x={-18} y={10} w={36} h={26} c={c} text="19 L" dark />
      <Stripe x={-21} y={-16} h={40} w={6} />
    </g>
  );
}
function Drum({ c }: { c: string }) {
  return (
    <g>
      <rect className="ink" x={-40} y={-46} width={80} height={96} rx={8} fill={c} />
      <path d={bandR(-40, -46, 80, 96, 8)} fill={SH} />
      {[-30, 2, 34].map((y) => <rect key={y} className="ink" x={-43} y={y} width={86} height={9} rx={4} fill={dk(c, .82)} style={{ strokeWidth: 'calc(var(--sw, 6) * .7)' }} />)}
      <ellipse className="ink" cy={-46} rx={40} ry={10} fill={lt(c, .3)} />
      <ellipse cy={-47} rx={11} ry={4} fill={dk(c, .55)} />
      <g className="fx" transform="translate(14 -10)"><rect x={-16} y={-8} width={34} height={18} rx={3} fill="#fff8ec" stroke={INK} strokeWidth={2} /><text x={1} y={5} textAnchor="middle" fontSize={8.5} fontWeight={800} fontFamily="JetBrains Mono, monospace" fill={INK}>FILLED</text></g>
      <Stripe x={-32} y={-34} h={70} w={7} />
    </g>
  );
}
function Can({ c, label }: { c: string; label?: string }) {
  return (
    <g>
      <rect className="ink" x={-22} y={-24} width={44} height={74} rx={6} fill="#dde3ea" />
      <rect x={-22} y={-10} width={44} height={44} fill={c} />
      <path d={bandR(-22, -24, 44, 74, 6)} fill={SH} />
      <ellipse className="ink" cy={-24} rx={22} ry={7} fill="#f1f4f7" /><ellipse cy={-24} rx={14} ry={3.5} fill="#b7c1cc" />
      <Label x={-14} y={-4} w={28} h={30} c={c} text={label ?? ''} />
      <Stripe x={-17} y={-16} h={56} w={5} />
    </g>
  );
}
/** Three cans, labels out, the way a pantry is faced. */
function CanRow({ c }: { c: string }) {
  return <g>{[-26, 0, 26].map((x, i) => <g key={i} transform={`translate(${x} 0) scale(.78)`}><Can c={c} label={['SARDI', 'CORN', 'BEAN'][i % 3]} /></g>)}</g>;
}
const SACK = 'M-34 44Q-34 50 -28 50H28Q34 50 34 44V6C34 -16 20 -26 0 -26S-34 -16 -34 6z';
function Sack({ c }: { c: string }) {
  return (
    <g>
      <path className="ink" d={SACK} fill="#f0dcb0" />
      <path className="fx" d={SACK} fill="url(#weave)" opacity=".3" />
      <path d="M10 -24Q34 -16 34 6V44Q34 50 28 50H10z" fill={SH} />
      <path className="ink" d="M-14 -24l-6 -16h40l-6 16q-14 4 -28 0z" fill="#e3cc9c" /><rect className="ink" x={-17} y={-46} width={34} height={9} rx={4} fill={c} />
      <Label x={-24} y={2} w={48} h={30} c={c} text="RICE" />
      <Stripe x={-26} y={-6} h={44} w={7} />
    </g>
  );
}
function Box({ c }: { c: string }) {
  return (
    <g>
      <path className="ink" d="M-38-6l10-14h56l10 14z" fill="#f0c98a" />
      <rect className="ink" x={-38} y={-6} width={76} height={56} rx={4} fill="#e2a95f" />
      <path d={bandR(-38, -6, 76, 56, 4)} fill={SH} />
      <rect x={-38} y={12} width={76} height={9} fill="#b67a3a" opacity=".7" />
      <rect x={-11} y={-6} width={22} height={56} fill={c} opacity=".9" /><path d="M-11 -6l4 -14h14l4 14z" fill={c} opacity=".7" />
      <g className="fx"><rect x={-32} y={24} width={24} height={16} rx={2} fill="#fff8ec" stroke={INK} strokeWidth={1.5} /><path d="M-28 30h16M-28 35h10" stroke="#9a7a50" strokeWidth={2} strokeLinecap="round" /></g>
      <path className="fx" d="M20 28l10-4" stroke={INK} strokeWidth={3} strokeLinecap="round" /><circle className="fx" cx={27} cy={38} r={3} fill={INK} />
      <Stripe x={-32} y={2} h={16} w={6} />
    </g>
  );
}
function Pouch({ c }: { c: string }) {
  return (
    <g>
      <rect className="ink" x={-24} y={-24} width={48} height={74} rx={9} fill={c} />
      <path d={bandR(-24, -24, 48, 74, 9)} fill={SH} />
      <rect className="ink" x={-24} y={-24} width={48} height={13} rx={4} fill="#fff8ec" style={{ strokeWidth: 'calc(var(--sw, 6) * .7)' }} /><path className="ink2" d="M-19-17.5h38" strokeDasharray="3 3" />
      <Label x={-18} y={0} w={36} h={34} c={c} text="PACK" />
      <Stripe x={-18} y={-6} h={40} w={6} />
    </g>
  );
}
function Jar({ c }: { c: string }) {
  return (
    <g>
      <rect className="ink" x={-24} y={-20} width={48} height={70} rx={11} fill="#e7f5ff" />
      <rect x={-22} y={-2} width={44} height={50} rx={9} fill={c} opacity=".9" />
      <path d={bandR(-24, -20, 48, 70, 11)} fill={SH} />
      <Cel x={-27} y={-34} w={54} h={16} r={6} c="#c9873a" />
      <Label x={-18} y={8} w={36} h={24} c={c} text="JAR" />
      <Stripe x={-18} y={-10} h={46} w={6} />
    </g>
  );
}
function Lamp({ c }: { c: string }) {
  return (
    <g>
      <rect className="ink" x={-18} y={-30} width={36} height={62} rx={8} fill="#fff6dc" /><rect x={-18} y={-30} width={36} height={62} rx={8} fill="url(#lampglow)" />
      <rect x={-11} y={-20} width={22} height={40} rx={4} fill="#ffd56a" opacity=".75" />
      <Cel x={-23} y={-44} w={46} h={16} r={6} c="#3a4a5c" />
      <Cel x={-25} y={30} w={50} h={20} r={7} c="#3a4a5c" />
      <path d="M-12-44q12-20 24 0" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" /><path d="M-12-44q12-20 24 0" fill="none" stroke="#3a4a5c" strokeWidth={4} strokeLinecap="round" />
      <circle cx={14} cy={40} r={3.5} fill={c} />
    </g>
  );
}
function Battery({ c }: { c: string }) {
  return (
    <g>
      <rect className="ink" x={-36} y={-28} width={72} height={78} rx={7} fill="#f6f1e6" />
      <path d={bandR(-36, -28, 72, 78, 7)} fill={SH} />
      <rect x={-36} y={-28} width={72} height={18} rx={7} fill={c} /><rect x={-36} y={-18} width={72} height={8} fill={c} />
      <text className="fx" x={0} y={-14} textAnchor="middle" fontSize={10.5} fontWeight={800} fontFamily="Sora, system-ui" fill={INK}>AA ×4</text>
      {[-27, -9, 9].map((x) => <g key={x}><rect className="ink" x={x} y={-4} width={17} height={46} rx={4} fill="#3a4a5c" style={{ strokeWidth: 'calc(var(--sw, 6) * .7)' }} /><rect x={x} y={9} width={17} height={22} fill={c} /><rect x={x + 5} y={-9} width={7} height={6} rx={1.5} fill="#cfd6de" stroke={INK} strokeWidth={1.5} /><Stripe x={x + 3} y={0} h={14} w={3} /></g>)}
    </g>
  );
}
function Radio({ c }: { c: string }) {
  return (
    <g>
      <Cel x={-38} y={-2} w={76} h={52} r={9} c="#3a4a5c" />
      <rect className="ink" x={-33} y={5} width={34} height={40} rx={6} fill="#26313f" style={{ strokeWidth: 'calc(var(--sw, 6) * .6)' }} /><g className="fx" fill="#4e5b6c">{Array.from({ length: 5 }).map((_, i) => <rect key={i} x={-29} y={10 + i * 7} width={26} height={3} rx={1.5} />)}</g>
      <rect className="ink" x={6} y={9} width={27} height={13} rx={3} fill="#9fe8ff" style={{ strokeWidth: 'calc(var(--sw, 6) * .6)' }} /><rect x={9} y={13} width={10} height={2.5} fill="#26313f" />
      <circle className="ink" cx={13} cy={35} r={6.5} fill="#cfd6de" style={{ strokeWidth: 'calc(var(--sw, 6) * .6)' }} /><circle className="ink" cx={28} cy={35} r={6.5} fill={c} style={{ strokeWidth: 'calc(var(--sw, 6) * .6)' }} />
      <path d="M22-2l16-38" stroke={INK} strokeWidth={8} strokeLinecap="round" /><path d="M22-2l16-38" stroke="#cfd6de" strokeWidth={3.5} strokeLinecap="round" /><circle cx={38} cy={-40} r={4.5} fill="#cfd6de" stroke={INK} strokeWidth={2} />
    </g>
  );
}
function Powerbank({ c }: { c: string }) {
  return (
    <g>
      <Cel x={-38} y={14} w={76} h={36} r={11} c="#3a4a5c" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-30 + i * 12} y={27} width={9} height={6} rx={2} fill={i < 3 ? '#3ddc97' : '#26313f'} stroke={INK} strokeWidth={1.2} />)}
      <path d="M26 22l-7 9h7l-5 9" stroke={c} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <rect className="fx" x={-20} y={41} width={10} height={5} rx={1.5} fill="#111" />
    </g>
  );
}
function Panel({ c }: { c: string }) {
  return (
    <g>
      <path className="ink" d="M-46 50 -32 -16h78L32 50z" fill="#1d3a7a" />
      <path d="M-40 44 -28 -10h70L28 44z" fill="#2e5cc0" />
      <path d="M8 -10h34L28 44H-2z" fill={SH} />
      <path className="ink2" d="M-18-10 -24 44M6-10 0 44M-31 8h62M-35 26h72" />
      <path className="fx" d="M-26-4l12-2" stroke={HL} strokeWidth={4} strokeLinecap="round" />
      <Cel x={-11} y={-30} w={22} h={14} r={4} c={c} hl={false} />
    </g>
  );
}
function Bag({ c }: { c: string }) {
  return (
    <g>
      <rect className="ink" x={-30} y={-12} width={60} height={62} rx={15} fill={c} />
      <path d={bandR(-30, -12, 60, 62, 15)} fill={SH} />
      <rect className="ink" x={-20} y={10} width={40} height={28} rx={9} fill={dk(c, .78)} style={{ strokeWidth: 'calc(var(--sw, 6) * .7)' }} />
      <path className="ink2" d="M-16 17h32" />
      <rect className="ink" x={-15} y={-8} width={30} height={11} rx={5.5} fill={dk(c, .78)} style={{ strokeWidth: 'calc(var(--sw, 6) * .7)' }} />
      <path d="M-12-12q12-20 24 0" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" /><path d="M-12-12q12-20 24 0" fill="none" stroke="#3a4a5c" strokeWidth={5} strokeLinecap="round" />
      <rect x={-8} y={21} width={16} height={5} rx={2} fill="#ff7a1a" />
      <Stripe x={-24} y={0} h={30} w={6} />
    </g>
  );
}
function Kit({ c }: { c: string }) {
  return (
    <g>
      <Cel x={-36} y={-8} w={72} h={58} r={9} c="#fbf7ef" />
      <rect className="ink" x={-15} y={-22} width={30} height={15} rx={6} fill="#3a4a5c" />
      <rect x={-36} y={8} width={72} height={5} fill="#d8cdb8" /><rect x={-30} y={7} width={9} height={7} rx={1.5} fill="#8f9bab" stroke={INK} strokeWidth={1.5} /><rect x={21} y={7} width={9} height={7} rx={1.5} fill="#8f9bab" stroke={INK} strokeWidth={1.5} />
      <path className="ink" d="M-6 16h12v8h8v12h-8v8H-6v-8h-8V24h8z" fill={c} style={{ strokeWidth: 'calc(var(--sw, 6) * .6)' }} />
    </g>
  );
}
function Roll({ c }: { c: string }) {
  return (
    <g>
      <rect className="ink" x={-38} y={10} width={76} height={40} fill={c} />
      <path d="M-38 36h76v14h-76z" fill={SH} />
      <ellipse className="ink" cx={-38} cy={30} rx={11} ry={20} fill={dk(c, .8)} /><ellipse className="ink" cx={38} cy={30} rx={11} ry={20} fill={lt(c, .25)} />
      <ellipse cx={38} cy={30} rx={6} ry={12} fill="#e2a95f" stroke={INK} strokeWidth={2} /><ellipse cx={38} cy={30} rx={3} ry={6} fill={INK} />
      <path className="fx" d="M-22 17h44" stroke={HL} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
}
function Rope({ c }: { c: string }) {
  return (
    <g>
      <circle className="ink" cy={18} r={32} fill={c} />
      <path d="M8 -12a32 32 0 0 1 0 60z" fill={SH} />
      <circle className="fx" cy={18} r={32} fill="url(#ropewind)" opacity=".45" />
      <circle className="ink" cy={18} r={11} fill="#5a3f28" style={{ strokeWidth: 'calc(var(--sw, 6) * .7)' }} />
      <path d="M-6 50q10-14 22-6" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" /><path d="M-6 50q10-14 22-6" stroke={dk(c, .8)} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path className="fx" d="M-20 2q6-10 16-12" stroke={HL} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
}
function Tarp({ c }: { c: string }) {
  return (
    <g>
      <Cel x={-40} y={6} w={80} h={44} r={6} c={c} band="b" />
      <path className="ink2" d="M-40 20h80M-40 34h80" />
      <path className="fx" d="M-30 8l6 40M0 8l4 40M30 8l-6 40" stroke={INK} strokeWidth={1.5} opacity=".25" />
      <rect className="ink" x={-24} y={-6} width={48} height={14} rx={5} fill="#3a4a5c" /><circle cx={-16} cy={1} r={2.5} fill="#cfd6de" /><circle cx={16} cy={1} r={2.5} fill="#cfd6de" />
    </g>
  );
}
function Tool({ c }: { c: string }) {
  return (
    <g>
      <rect className="ink" x={-7} y={-6} width={14} height={56} rx={5} fill="#a06a3a" />
      <rect x={-7} y={26} width={14} height={16} rx={3} fill={c} /><path d="M2 -6h5v56h-5z" fill={SH} />
      <path className="ink" d="M-28-34h40q10 0 14 10v6h-54z" fill="#aab4c0" />
      <path d="M-28 -34h54v6h-54z" fill="#e2e8ee" /><path d="M8 -34h4q10 0 14 10v6H8z" fill={SH} />
    </g>
  );
}
function Cash({ c }: { c: string }) {
  return (
    <g>
      <Cel x={-34} y={-10} w={68} h={60} r={7} c="#f4e3bd" />
      <path className="ink2" d="M-34-10l34 24 34-24" />
      <rect className="ink" x={-28} y={6} width={56} height={28} rx={4} fill={c} />
      <path d={bandR(-28, 6, 56, 28, 4)} fill={SH} />
      <circle cy={20} r={8} fill="#fff8ec" stroke={INK} strokeWidth={1.5} /><text className="fx" y={24} textAnchor="middle" fontSize={10} fontWeight={800} fontFamily="JetBrains Mono, monospace" fill={INK}>₱</text>
      <rect x={-34} y={36} width={68} height={14} rx={4} fill="#e8d2a0" />
    </g>
  );
}
function Doc({ c }: { c: string }) {
  return (
    <g>
      <rect className="ink" x={-30} y={-30} width={60} height={80} rx={7} fill="rgba(207,227,255,.55)" />
      <rect className="ink" x={-24} y={-22} width={48} height={66} rx={4} fill="#fff8ec" style={{ strokeWidth: 'calc(var(--sw, 6) * .7)' }} />
      <path d={bandR(-24, -22, 48, 66, 4, .25)} fill={SH} />
      <g className="fx"><rect x={-16} y={-12} width={32} height={5} rx={2} fill="#8f9bab" /><rect x={-16} y={-2} width={32} height={5} rx={2} fill="#8f9bab" /><rect x={-16} y={8} width={22} height={5} rx={2} fill="#8f9bab" /></g>
      <rect x={-16} y={20} width={32} height={18} rx={3} fill={c} stroke={INK} strokeWidth={1.5} />
      <rect className="ink" x={-30} y={-30} width={60} height={11} rx={4} fill="#3a7bd5" style={{ strokeWidth: 'calc(var(--sw, 6) * .7)' }} />
    </g>
  );
}
function Bowl({ c }: { c: string }) {
  return (
    <g>
      <path className="ink" d="M-36 12q0 38 36 38t36-38z" fill={c} />
      <path d="M14 12q0 30 -14 38q36 0 36-38z" fill={SH} />
      <ellipse className="ink" cy={12} rx={36} ry={9} fill={lt(c, .3)} /><ellipse cy={12} rx={28} ry={5.5} fill="#5bc0ff" /><ellipse className="fx" cx={-7} cy={11} rx={10} ry={2} fill={HL} />
      <path d="M18 2l16-30" stroke={INK} strokeWidth={12} strokeLinecap="round" /><path d="M18 2l16-30" stroke="#ff8a66" strokeWidth={7} strokeLinecap="round" />
    </g>
  );
}
function Whistle({ c }: { c: string }) {
  return (
    <g>
      <path d="M-22-10q-24-20-4-40" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <rect className="ink" x={-30} y={10} width={52} height={24} rx={9} fill={c} />
      <circle className="ink" cx={-18} cy={4} r={15} fill={c} />
      <path d="M-18 -11a15 15 0 0 1 10 26H-8z" fill={SH} /><path d={bandR(-30, 10, 52, 24, 9)} fill={SH} />
      <circle className="fx" cx={-22} cy={0} r={4.5} fill={HL} />
      <rect className="ink" x={21} y={15} width={12} height={13} rx={3} fill={dk(c, .7)} style={{ strokeWidth: 'calc(var(--sw, 6) * .7)' }} />
    </g>
  );
}
function Mask({ c }: { c: string }) {
  return (
    <g>
      <Cel x={-36} y={-20} w={72} h={70} r={7} c="#f6f1e6" />
      <rect x={-36} y={-20} width={72} height={17} rx={7} fill={c} /><rect x={-36} y={-11} width={72} height={8} fill={c} />
      <text className="fx" y={-7} textAnchor="middle" fontSize={9.5} fontWeight={800} fontFamily="Sora, system-ui" fill={INK}>N95 ×10</text>
      <path className="ink" d="M-24 10h48q4 0 4 4v18q0 8-14 10l-14 2-14-2q-14-2-14-10V14q0-4 4-4z" fill="#fff" style={{ strokeWidth: 'calc(var(--sw, 6) * .6)' }} />
      <path className="ink2" d="M-24 14q-10-6-12 10M24 14q10-6 12 10" />
      <rect x={-16} y={22} width={32} height={3} rx={1.5} fill="#d9dee6" />
    </g>
  );
}
function Lock({ c }: { c: string }) {
  return (
    <g>
      <path d="M-16 6v-16a16 16 0 0 1 32 0v16" fill="none" stroke={INK} strokeWidth={13} /><path d="M-16 6v-16a16 16 0 0 1 32 0v16" fill="none" stroke="#b8c2cd" strokeWidth={8} />
      <Cel x={-26} y={4} w={52} h={46} r={9} c={c} />
      <circle cy={24} r={7} fill={INK} /><rect x={-3} y={24} width={6} height={12} rx={2} fill={INK} />
    </g>
  );
}

/** Choose the sprite for a shape and quantity ("stored properly" variants). */
function Body({ shape, c, qty }: { shape: ItemShape; c: string; qty: number }) {
  switch (shape) {
    case 'bottle': return qty >= 6 ? <SixPack c={c} /> : <Bottle c={c} />;
    case 'gallon': return <Gallon c={c} />;
    case 'drum': return <Drum c={c} />;
    case 'can': return qty >= 3 ? <CanRow c={c} /> : <Can c={c} label="CAN" />;
    case 'sack': return <Sack c={c} />;
    case 'box': return <Box c={c} />;
    case 'pouch': return <Pouch c={c} />;
    case 'jar': return <Jar c={c} />;
    case 'lamp': return <Lamp c={c} />;
    case 'battery': return <Battery c={c} />;
    case 'radio': return <Radio c={c} />;
    case 'powerbank': return <Powerbank c={c} />;
    case 'panel': return <Panel c={c} />;
    case 'bag': return <Bag c={c} />;
    case 'kit': return <Kit c={c} />;
    case 'roll': return <Roll c={c} />;
    case 'rope': return <Rope c={c} />;
    case 'tarp': return <Tarp c={c} />;
    case 'tool': return <Tool c={c} />;
    case 'cash': return <Cash c={c} />;
    case 'doc': return <Doc c={c} />;
    case 'bowl': return <Bowl c={c} />;
    case 'whistle': return <Whistle c={c} />;
    case 'mask': return <Mask c={c} />;
    case 'lock': return <Lock c={c} />;
    default: return <Cel x={-30} y={-10} w={60} h={60} r={9} c={c} />;
  }
}

export const Sprite = memo(function Sprite({ shape, color, size = 64, x = 0, y = 0, className, qty = 1, shadow = true }: { shape: ItemShape; color: string; size?: number; x?: number; y?: number; className?: string; qty?: number; shadow?: boolean }) {
  const k = size / 100;
  // keep the ink weight constant in room units whatever the sprite scale
  const style = { '--sw': `${(6 / k).toFixed(2)}`, '--sw2': `${(1.5 / k).toFixed(2)}` } as CSSProperties;
  return (
    <g className={className} transform={`translate(${x} ${y}) scale(${k})`} style={style}>
      {shadow && <ellipse cy={50} rx={38} ry={7} fill={INK} opacity=".2" />}
      <Body shape={shape} c={color} qty={qty} />
    </g>
  );
});

/** Shared defs for sprites and rooms. Mount once per SVG. */
export function GameDefs() {
  return (
    <defs>
      <linearGradient id="shade-cyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity=".28" /><stop offset=".22" stopColor="#fff" stopOpacity=".28" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".32" /></linearGradient>
      <linearGradient id="shade-box" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".22" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".22" /></linearGradient>
      <linearGradient id="shade-top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".45" /><stop offset="1" stopColor="#000" stopOpacity=".15" /></linearGradient>
      <radialGradient id="contact" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#2a1812" stopOpacity=".38" /><stop offset="1" stopColor="#2a1812" stopOpacity="0" /></radialGradient>
      <radialGradient id="lampglow" cx=".5" cy=".5" r=".6"><stop offset="0" stopColor="#ffe08a" stopOpacity=".95" /><stop offset=".5" stopColor="#ffd56a" stopOpacity=".35" /><stop offset="1" stopColor="#ffe08a" stopOpacity="0" /></radialGradient>
      <radialGradient id="lamppool" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffe3a6" stopOpacity=".5" /><stop offset="1" stopColor="#ffe3a6" stopOpacity="0" /></radialGradient>
      <linearGradient id="lightcone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe8b0" stopOpacity=".3" /><stop offset="1" stopColor="#ffe8b0" stopOpacity="0" /></linearGradient>
      <linearGradient id="winshaft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".2" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      <linearGradient id="ao-left" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a1f14" stopOpacity=".26" /><stop offset="1" stopColor="#3a1f14" stopOpacity="0" /></linearGradient>
      <linearGradient id="ao-right" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#3a1f14" stopOpacity=".26" /><stop offset="1" stopColor="#3a1f14" stopOpacity="0" /></linearGradient>
      <linearGradient id="ao-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a1f14" stopOpacity=".22" /><stop offset="1" stopColor="#3a1f14" stopOpacity="0" /></linearGradient>
      <linearGradient id="ao-ceiling" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#3a1f14" stopOpacity=".16" /><stop offset="1" stopColor="#3a1f14" stopOpacity="0" /></linearGradient>
      <linearGradient id="solar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b73d6" /><stop offset=".5" stopColor="#1e3f8a" /><stop offset="1" stopColor="#2f5fc0" /></linearGradient>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".4" stopColor="#fff" stopOpacity=".08" /><stop offset="1" stopColor="#fff" stopOpacity=".3" /></linearGradient>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8f9bab" /><stop offset=".35" stopColor="#e3e9f0" /><stop offset=".6" stopColor="#b6c1cd" /><stop offset="1" stopColor="#7f8b9b" /></linearGradient>
      <pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3h6M3 0v6" stroke="#000" strokeWidth=".8" opacity=".5" /></pattern>
      <pattern id="ropewind" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="10" height="4" fill="#000" opacity=".22" /></pattern>
      <pattern id="tile" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="none" stroke="#fff" strokeWidth="2" opacity=".8" /></pattern>
      <pattern id="pegs" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="2.4" fill="#2a1812" opacity=".4" /></pattern>
      <pattern id="wood" width="120" height="22" patternUnits="userSpaceOnUse"><path d="M0 21h120" stroke="rgba(0,0,0,.16)" strokeWidth="2" /><path d="M60 0v21" stroke="rgba(0,0,0,.1)" strokeWidth="2" /><path d="M8 8q20-3 40 2M70 12q20-4 44 1" stroke="rgba(255,255,255,.12)" strokeWidth="1.2" fill="none" /></pattern>
      <pattern id="woodgrain" width="60" height="14" patternUnits="userSpaceOnUse"><path d="M0 7q15-5 30 0t30 0" stroke="rgba(42,24,18,.14)" strokeWidth="1.4" fill="none" /></pattern>
      <pattern id="wallpaper" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1.6" fill="rgba(255,255,255,.35)" /><circle cx="0" cy="0" r="1.6" fill="rgba(255,255,255,.25)" /></pattern>
      {/* toon extras */}
      <pattern id="planks" width="140" height="26" patternUnits="userSpaceOnUse"><path d="M0 25.5h140" stroke="rgba(42,24,18,.35)" strokeWidth="2.2" /><path d="M70 0v25" stroke="rgba(42,24,18,.3)" strokeWidth="2.2" /><path d="M10 9q22-3 44 2M80 16q20-4 46 1" stroke="rgba(255,255,255,.14)" strokeWidth="2" fill="none" strokeLinecap="round" /></pattern>
      <pattern id="toontile" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="none" stroke="rgba(42,24,18,.28)" strokeWidth="2.4" /><rect x="5" y="5" width="12" height="12" rx="3" fill="rgba(255,255,255,.22)" /></pattern>
      <pattern id="gingham" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="9" height="18" fill="rgba(255,255,255,.28)" /><rect width="18" height="9" fill="rgba(255,255,255,.28)" /></pattern>
      <pattern id="banig" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="rgba(42,24,18,.18)" /><rect x="8" y="8" width="8" height="8" fill="rgba(42,24,18,.18)" /></pattern>
      <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="3" fill="rgba(255,255,255,.35)" /></pattern>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" /></filter>
      <filter id="blur4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" /></filter>
      <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" result="n" /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncA type="linear" slope=".09" /></feComponentTransfer></filter>
      <radialGradient id="vignette" cx=".5" cy=".45" r=".75"><stop offset=".55" stopColor="#2a1812" stopOpacity="0" /><stop offset="1" stopColor="#2a1812" stopOpacity=".3" /></radialGradient>
    </defs>
  );
}
