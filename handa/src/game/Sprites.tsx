import { memo } from 'react';
import type { ItemShape } from '@/domain/types';

/**
 * Illustrated item sprites, AA-style: every body gets a cylindrical/box shade
 * overlay (so colours stay data-driven), a specular highlight, real labels,
 * and "stored properly" variants (six-pack of bottles, rows of cans, hung bags).
 * Box is 100 × 110, base at y = 50.
 */
const dk = (hex: string, k = .72) => { const n = parseInt(hex.slice(1), 16); return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`; };
const lt = (hex: string, k = .35) => { const n = parseInt(hex.slice(1), 16); const f = (c: number) => Math.round(c + (255 - c) * k); return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`; };

/** Cylindrical shading overlay: paint over any shape with the same path. */
const CYL = 'url(#shade-cyl)';
const BOX = 'url(#shade-box)';
const TOP = 'url(#shade-top)';

function Label({ x, y, w, h, c, text, dark }: { x: number; y: number; w: number; h: number; c: string; text?: string; dark?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill="#fff" />
      <rect x={x} y={y} width={w} height={h * .32} rx={3} fill={c} />
      {text && <text x={x + w / 2} y={y + h * .72} textAnchor="middle" fontSize={h * .36} fontWeight={800} fontFamily="Sora, system-ui" fill={dark ? '#1a0d05' : dk(c, .55)} letterSpacing=".04em">{text}</text>}
    </g>
  );
}

function Bottle({ c }: { c: string }) {
  return (
    <g>
      <path d="M-15 50V-6c0-8 6-10 6-18v-10h18v10c0 8 6 10 6 18v56z" fill="#cfe8ff" />
      <path d="M-15 50V6h30v44z" fill={c} opacity=".9" />
      <path d="M-15 50V-6c0-8 6-10 6-18v-10h18v10c0 8 6 10 6 18v56z" fill={CYL} />
      <rect x={-11} y={-44} width={22} height={12} rx={4} fill="#1f63b3" /><rect x={-11} y={-44} width={22} height={12} rx={4} fill={CYL} />
      <Label x={-12} y={12} w={24} h={22} c={c} text="H2O" dark />
      <path d="M-10-6v44" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity=".55" />
    </g>
  );
}
/** A shrink-wrapped six-pack: how bottled water is actually stored. */
function SixPack({ c }: { c: string }) {
  return (
    <g>
      {[-30, -10, 10].map((x, i) => <g key={i} transform={`translate(${x + 10} 10) scale(.62)`}><Bottle c={c} /></g>)}
      {[-26, -6, 14].map((x, i) => <g key={`b${i}`} transform={`translate(${x + 10} 4) scale(.62)`} opacity=".85"><Bottle c={c} /></g>)}
      <rect x={-42} y={-6} width={84} height={56} rx={8} fill="#9fd3ff" opacity=".22" />
      <rect x={-42} y={-6} width={84} height={56} rx={8} fill="none" stroke="#dff1ff" strokeWidth={2} opacity=".7" />
      <path d="M-36 2q20-10 30 20" stroke="#fff" strokeWidth={5} opacity=".35" fill="none" strokeLinecap="round" />
    </g>
  );
}
function Gallon({ c }: { c: string }) {
  return (
    <g>
      <path d="M-28 50V-18q0-8 8-8h40q8 0 8 8v68z" fill="#8fcbff" /><path d="M-28 50V6h56v44z" fill={c} opacity=".75" />
      <path d="M-28 50V-18q0-8 8-8h40q8 0 8 8v68z" fill={CYL} />
      <rect x={-10} y={-40} width={20} height={16} rx={4} fill="#8fcbff" /><rect x={-12} y={-48} width={24} height={10} rx={4} fill="#1f63b3" />
      <path d="M10-22a10 10 0 0 1 14 12" stroke="#1f63b3" strokeWidth={5} fill="none" strokeLinecap="round" />
      <Label x={-18} y={10} w={36} h={26} c={c} text="19 L" dark />
      <path d="M-20-16v56" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity=".5" />
    </g>
  );
}
function Drum({ c }: { c: string }) {
  return (
    <g>
      <rect x={-40} y={-46} width={80} height={96} rx={6} fill={c} /><rect x={-40} y={-46} width={80} height={96} rx={6} fill={CYL} />
      {[-30, 2, 34].map((y) => <rect key={y} x={-42} y={y} width={84} height={9} rx={3} fill={dk(c, .6)} />)}
      <ellipse cy={-46} rx={40} ry={9} fill={lt(c, .25)} /><ellipse cy={-46} rx={40} ry={9} fill={TOP} />
      <ellipse cy={-46} rx={12} ry={4} fill={dk(c, .5)} />
      <g transform="translate(16 -8)"><rect x={-14} y={-8} width={30} height={18} rx={3} fill="#fff" /><text x={1} y={5} textAnchor="middle" fontSize={8} fontWeight={800} fontFamily="JetBrains Mono, monospace" fill="#1a0d05">FILLED</text></g>
      <path d="M-30-36v76" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity=".35" />
    </g>
  );
}
function Can({ c, label }: { c: string; label?: string }) {
  return (
    <g>
      <rect x={-22} y={-24} width={44} height={74} rx={5} fill="#d6dde6" /><rect x={-22} y={-24} width={44} height={74} rx={5} fill={CYL} />
      <rect x={-22} y={-10} width={44} height={44} fill={c} /><rect x={-22} y={-10} width={44} height={44} fill={CYL} />
      <ellipse cy={-24} rx={22} ry={6} fill="#eef2f6" /><ellipse cy={-24} rx={22} ry={6} fill={TOP} /><ellipse cy={-24} rx={15} ry={3.5} fill="#b4bfcb" />
      <Label x={-14} y={-4} w={28} h={30} c={c} text={label ?? ''} />
      <path d="M-16-18v62" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity=".5" />
    </g>
  );
}
/** Three cans, labels out, the way a pantry is faced. */
function CanRow({ c }: { c: string }) {
  return <g>{[-26, 0, 26].map((x, i) => <g key={i} transform={`translate(${x} 0) scale(.78)`}><Can c={c} label={['SARDINAS', 'CORNED', 'BEANS'][i % 3].slice(0, 5)} /></g>)}</g>;
}
function Sack({ c }: { c: string }) {
  return (
    <g>
      <path d="M-34 50V6c0-22 14-32 34-32s34 10 34 32v44z" fill="#ead9b5" /><path d="M-34 50V6c0-22 14-32 34-32s34 10 34 32v44z" fill={CYL} />
      <path d="M-34 50V6c0-22 14-32 34-32s34 10 34 32v44z" fill="url(#weave)" opacity=".35" />
      <path d="M-10-26l-6-16h32l-6 16" fill="#d9c7a0" /><rect x={-16} y={-45} width={32} height={8} rx={4} fill={c} />
      <Label x={-24} y={2} w={48} h={30} c={c} text="RICE" />
      <path d="M-26 0q-4 24 0 46" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity=".4" />
    </g>
  );
}
function Box({ c }: { c: string }) {
  return (
    <g>
      <path d="M-38-6l12-12h52l12 12z" fill="#e8c38f" />
      <rect x={-38} y={-6} width={76} height={56} rx={3} fill="#d9a96c" /><rect x={-38} y={-6} width={76} height={56} rx={3} fill={BOX} />
      <rect x={-38} y={10} width={76} height={10} fill="#b98a4e" opacity=".8" />
      <rect x={-12} y={-6} width={24} height={56} fill={c} opacity=".85" /><rect x={-12} y={-18} width={24} height={12} fill={c} opacity=".6" />
      <rect x={-32} y={24} width={26} height={16} rx={2} fill="#fff" /><path d="M-28 30h18M-28 35h12" stroke="#8a6a40" strokeWidth={2} />
      <path d="M22 30l10-4" stroke="#8a6a40" strokeWidth={3} strokeLinecap="round" /><circle cx={28} cy={38} r={3} fill="#8a6a40" />
    </g>
  );
}
function Pouch({ c }: { c: string }) {
  return (
    <g>
      <path d="M-24 50V-14q0-10 10-10h28q10 0 10 10v64z" fill={c} /><path d="M-24 50V-14q0-10 10-10h28q10 0 10 10v64z" fill={CYL} />
      <rect x={-24} y={-24} width={48} height={12} rx={3} fill="#fff" /><path d="M-20-18h40" stroke="#c9d1dc" strokeWidth={2} strokeDasharray="3 3" />
      <Label x={-18} y={0} w={36} h={34} c={c} text="PACK" />
      <path d="M-18-6v50" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity=".4" />
    </g>
  );
}
function Jar({ c }: { c: string }) {
  return (
    <g>
      <rect x={-24} y={-20} width={48} height={70} rx={10} fill="#e3f4ff" opacity=".85" />
      <rect x={-22} y={-6} width={44} height={54} rx={9} fill={c} opacity=".85" /><rect x={-24} y={-20} width={48} height={70} rx={10} fill={CYL} />
      <rect x={-26} y={-34} width={52} height={16} rx={5} fill="#b8792f" /><rect x={-26} y={-34} width={52} height={16} rx={5} fill={CYL} />
      <Label x={-18} y={6} w={36} h={24} c={c} text="JAR" />
      <path d="M-18-12v54" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity=".55" />
    </g>
  );
}
function Lamp({ c }: { c: string }) {
  return (
    <g>
      <rect x={-18} y={-30} width={36} height={60} rx={6} fill="#fff6dc" /><rect x={-18} y={-30} width={36} height={60} rx={6} fill="url(#lampglow)" />
      <rect x={-12} y={-20} width={24} height={40} rx={3} fill="#ffe08a" opacity=".6" />
      <rect x={-22} y={-42} width={44} height={14} rx={6} fill="#263040" /><rect x={-22} y={-42} width={44} height={14} rx={6} fill={CYL} />
      <rect x={-24} y={30} width={48} height={20} rx={6} fill="#263040" /><rect x={-24} y={30} width={48} height={20} rx={6} fill={CYL} />
      <path d="M-12-42q12-18 24 0" fill="none" stroke="#263040" strokeWidth={5} strokeLinecap="round" />
      <circle cx={14} cy={40} r={3} fill={c} />
    </g>
  );
}
function Battery({ c }: { c: string }) {
  // in the original pack
  return (
    <g>
      <rect x={-36} y={-28} width={72} height={78} rx={6} fill="#f2f5f9" /><rect x={-36} y={-28} width={72} height={78} rx={6} fill={BOX} />
      <rect x={-36} y={-28} width={72} height={18} rx={6} fill={c} />
      <text x={0} y={-15} textAnchor="middle" fontSize={10} fontWeight={800} fontFamily="Sora, system-ui" fill="#1a0d05">AA ×4</text>
      {[-27, -9, 9].map((x) => <g key={x}><rect x={x} y={-4} width={16} height={46} rx={3} fill="#263040" /><rect x={x} y={8} width={16} height={22} fill={c} /><rect x={x + 5} y={-8} width={6} height={5} rx={1} fill="#c9d1dc" /><rect x={x + 2} y={0} width={3} height={38} rx={1} fill="#fff" opacity=".35" /></g>)}
    </g>
  );
}
function Radio({ c }: { c: string }) {
  return (
    <g>
      <rect x={-38} y={-2} width={76} height={52} rx={8} fill="#263040" /><rect x={-38} y={-2} width={76} height={52} rx={8} fill={BOX} />
      <rect x={-34} y={4} width={34} height={40} rx={5} fill="#1b2330" /><g fill="#3a4556">{Array.from({ length: 5 }).map((_, i) => <rect key={i} x={-30} y={8 + i * 7} width={26} height={3} rx={1.5} />)}</g>
      <rect x={6} y={8} width={26} height={12} rx={3} fill="#9fe8ff" /><rect x={8} y={11} width={10} height={2} fill="#1b2330" />
      <circle cx={13} cy={34} r={6} fill="#c9d1dc" /><circle cx={27} cy={34} r={6} fill={c} />
      <path d="M22-2l16-38" stroke="#c9d1dc" strokeWidth={4} strokeLinecap="round" /><circle cx={38} cy={-40} r={4} fill="#c9d1dc" />
      <path d="M-34 4h34" stroke="#fff" strokeWidth={2} opacity=".2" />
    </g>
  );
}
function Powerbank({ c }: { c: string }) {
  return (
    <g>
      <rect x={-38} y={16} width={76} height={34} rx={10} fill="#263040" /><rect x={-38} y={16} width={76} height={34} rx={10} fill={BOX} />
      <rect x={-38} y={16} width={76} height={6} rx={3} fill="#fff" opacity=".12" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-30 + i * 12} y={27} width={9} height={5} rx={2} fill={i < 3 ? '#3ddc97' : '#3a4556'} />)}
      <path d="M26 24l-6 8h6l-4 8" stroke={c} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
      <rect x={-20} y={40} width={10} height={5} rx={1} fill="#111" />
    </g>
  );
}
function Panel({ c }: { c: string }) {
  return (
    <g>
      <path d="M-46 50 -32 -16h78L32 50z" fill="#101b30" />
      <path d="M-40 44 -28 -10h70L28 44z" fill="url(#solar)" />
      <path d="M-18-10 -24 44M6-10 0 44M-31 8h62M-35 26h72" stroke="#101b30" strokeWidth={2} />
      <path d="M-26-6l14-2" stroke="#fff" strokeWidth={3} opacity=".5" />
      <rect x={-10} y={-28} width={20} height={12} rx={3} fill={c} />
    </g>
  );
}
function Bag({ c }: { c: string }) {
  return (
    <g>
      <rect x={-30} y={-12} width={60} height={62} rx={14} fill={c} /><rect x={-30} y={-12} width={60} height={62} rx={14} fill={BOX} />
      <rect x={-30} y={-12} width={60} height={62} rx={14} fill="url(#weave)" opacity=".25" />
      <rect x={-20} y={8} width={40} height={28} rx={8} fill={dk(c, .6)} /><rect x={-20} y={8} width={40} height={28} rx={8} fill={BOX} />
      <rect x={-20} y={14} width={40} height={3} fill="#263040" opacity=".6" />
      <rect x={-14} y={-8} width={28} height={10} rx={5} fill={dk(c, .6)} />
      <path d="M-12-12q12-18 24 0" fill="none" stroke="#263040" strokeWidth={6} strokeLinecap="round" />
      <rect x={-8} y={20} width={16} height={5} rx={2} fill="#ff6a1a" />
      <path d="M-24-2v44" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity=".25" />
    </g>
  );
}
function Kit({ c }: { c: string }) {
  return (
    <g>
      <rect x={-36} y={-8} width={72} height={58} rx={8} fill="#f7f9fb" /><rect x={-36} y={-8} width={72} height={58} rx={8} fill={BOX} />
      <rect x={-14} y={-22} width={28} height={14} rx={5} fill="#263040" />
      <rect x={-36} y={8} width={72} height={5} fill="#dfe4ea" /><rect x={-30} y={8} width={8} height={5} fill="#9aa5b3" /><rect x={22} y={8} width={8} height={5} fill="#9aa5b3" />
      <rect x={-6} y={14} width={12} height={28} rx={2} fill={c} /><rect x={-14} y={22} width={28} height={12} rx={2} fill={c} />
      <path d="M-30-2h60" stroke="#fff" strokeWidth={2} opacity=".6" />
    </g>
  );
}
function Roll({ c }: { c: string }) {
  return (
    <g>
      <rect x={-38} y={10} width={76} height={40} rx={4} fill={c} /><rect x={-38} y={10} width={76} height={40} rx={4} fill={TOP} />
      <ellipse cx={-38} cy={30} rx={10} ry={20} fill={dk(c, .6)} /><ellipse cx={38} cy={30} rx={10} ry={20} fill={lt(c, .2)} /><ellipse cx={38} cy={30} rx={10} ry={20} fill={CYL} />
      <ellipse cx={38} cy={30} rx={6} ry={12} fill="#d9a96c" /><ellipse cx={38} cy={30} rx={3} ry={7} fill="#8a6a40" />
      <path d="M-20 16h46" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity=".4" />
    </g>
  );
}
function Rope({ c }: { c: string }) {
  return (
    <g>
      <circle cy={18} r={32} fill={c} /><circle cy={18} r={32} fill={CYL} />
      <circle cy={18} r={32} fill="url(#ropewind)" opacity=".55" />
      <circle cy={18} r={11} fill="#3a2a1a" opacity=".55" />
      <path d="M-6 50q10-14 22-6" stroke={dk(c, .6)} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
}
function Tarp({ c }: { c: string }) {
  return (
    <g>
      <rect x={-40} y={6} width={80} height={44} rx={5} fill={c} /><rect x={-40} y={6} width={80} height={44} rx={5} fill={BOX} />
      <path d="M-40 20h80M-40 34h80" stroke="#fff" strokeWidth={5} opacity=".35" />
      <path d="M-30 8l6 40M0 8l4 40M30 8l-6 40" stroke="#000" strokeWidth={2} opacity=".12" />
      <rect x={-24} y={-6} width={48} height={14} rx={4} fill="#263040" /><circle cx={-16} cy={1} r={2.5} fill="#9aa5b3" /><circle cx={16} cy={1} r={2.5} fill="#9aa5b3" />
    </g>
  );
}
function Tool({ c }: { c: string }) {
  return (
    <g>
      <rect x={-6} y={-6} width={12} height={56} rx={4} fill="#8a5a2b" /><rect x={-6} y={-6} width={12} height={56} rx={4} fill={CYL} />
      <rect x={-6} y={26} width={12} height={16} rx={3} fill={c} />
      <path d="M-28-34h40q10 0 14 10v6h-54z" fill="#9aa5b3" /><path d="M-28-34h40q10 0 14 10v6h-54z" fill={CYL} />
      <rect x={-28} y={-34} width={54} height={6} rx={3} fill="#dfe6ee" />
    </g>
  );
}
function Cash({ c }: { c: string }) {
  return (
    <g>
      <rect x={-34} y={-10} width={68} height={60} rx={6} fill="#f4e7c6" /><rect x={-34} y={-10} width={68} height={60} rx={6} fill={BOX} />
      <path d="M-34-10l34 24 34-24" fill="none" stroke="#d1b98a" strokeWidth={2} />
      <rect x={-28} y={6} width={56} height={28} rx={3} fill={c} /><rect x={-28} y={6} width={56} height={28} rx={3} fill={CYL} />
      <circle cy={20} r={8} fill="#fff" opacity=".85" /><text y={24} textAnchor="middle" fontSize={10} fontWeight={800} fontFamily="JetBrains Mono, monospace" fill={dk(c, .5)}>₱</text>
      <rect x={-34} y={36} width={68} height={14} rx={3} fill="#e8d7ae" />
    </g>
  );
}
function Doc({ c }: { c: string }) {
  // documents in a waterproof pouch, phone-photo reminder
  return (
    <g>
      <rect x={-30} y={-30} width={60} height={80} rx={6} fill="#cfe3ff" opacity=".55" />
      <rect x={-24} y={-22} width={48} height={66} rx={3} fill="#fff" /><rect x={-24} y={-22} width={48} height={66} rx={3} fill={BOX} />
      <rect x={-16} y={-12} width={32} height={5} rx={2} fill="#9aa5b3" /><rect x={-16} y={-2} width={32} height={5} rx={2} fill="#9aa5b3" /><rect x={-16} y={8} width={22} height={5} rx={2} fill="#9aa5b3" />
      <rect x={-16} y={20} width={32} height={18} rx={3} fill={c} opacity=".85" />
      <rect x={-30} y={-30} width={60} height={80} rx={6} fill="none" stroke="#9fd3ff" strokeWidth={2.5} /><rect x={-30} y={-30} width={60} height={10} rx={3} fill="#3a7bd5" />
      <path d="M-26-20v60" stroke="#fff" strokeWidth={3} opacity=".5" />
    </g>
  );
}
function Bowl({ c }: { c: string }) {
  return (
    <g>
      <path d="M-36 12q0 38 36 38t36-38z" fill={c} /><path d="M-36 12q0 38 36 38t36-38z" fill={CYL} />
      <ellipse cy={12} rx={36} ry={8} fill={lt(c, .3)} /><ellipse cy={12} rx={28} ry={5} fill="#5bc0ff" /><ellipse cx={-6} cy={11} rx={10} ry={2} fill="#fff" opacity=".5" />
      <path d="M18 2l16-30" stroke="#ff8a66" strokeWidth={8} strokeLinecap="round" /><path d="M18 2l16-30" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity=".4" />
    </g>
  );
}
function Whistle({ c }: { c: string }) {
  return (
    <g>
      <rect x={-30} y={10} width={52} height={24} rx={8} fill={c} /><rect x={-30} y={10} width={52} height={24} rx={8} fill={CYL} />
      <circle cx={-18} cy={4} r={14} fill={c} /><circle cx={-18} cy={4} r={14} fill={CYL} /><circle cx={-18} cy={4} r={5} fill="#fff" opacity=".5" />
      <rect x={22} y={16} width={12} height={12} rx={3} fill={dk(c, .6)} />
      <path d="M-22-10q-24-20-4-40" fill="none" stroke="#263040" strokeWidth={4} />
    </g>
  );
}
function Mask({ c }: { c: string }) {
  return (
    <g>
      <rect x={-36} y={-20} width={72} height={70} rx={6} fill="#f2f5f9" /><rect x={-36} y={-20} width={72} height={70} rx={6} fill={BOX} />
      <rect x={-36} y={-20} width={72} height={16} rx={6} fill={c} /><text y={-8} textAnchor="middle" fontSize={9} fontWeight={800} fontFamily="Sora, system-ui" fill="#1a0d05">N95 ×10</text>
      <path d="M-24 10h48q4 0 4 4v18q0 8-14 10l-14 2-14-2q-14-2-14-10V14q0-4 4-4z" fill="#fff" stroke="#d9dee6" strokeWidth={2} />
      <path d="M-24 14q-10-6-12 10M24 14q10-6 12 10" fill="none" stroke="#d9dee6" strokeWidth={3} />
      <rect x={-16} y={22} width={32} height={3} rx={1.5} fill="#d9dee6" />
    </g>
  );
}
function Lock({ c }: { c: string }) {
  return (
    <g>
      <rect x={-26} y={4} width={52} height={46} rx={8} fill={c} /><rect x={-26} y={4} width={52} height={46} rx={8} fill={BOX} />
      <path d="M-16 4v-14a16 16 0 0 1 32 0v14" fill="none" stroke="#b4bfcb" strokeWidth={9} /><path d="M-16 4v-14a16 16 0 0 1 32 0v14" fill="none" stroke="#fff" strokeWidth={2} opacity=".5" />
      <circle cy={24} r={7} fill="#1a0d05" /><rect x={-3} y={24} width={6} height={12} rx={2} fill="#1a0d05" />
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
    default: return <rect x={-30} y={-10} width={60} height={60} rx={8} fill={c} />;
  }
}

export const Sprite = memo(function Sprite({ shape, color, size = 64, x = 0, y = 0, className, qty = 1, shadow = true }: { shape: ItemShape; color: string; size?: number; x?: number; y?: number; className?: string; qty?: number; shadow?: boolean }) {
  const k = size / 100;
  return (
    <g className={className} transform={`translate(${x} ${y}) scale(${k})`}>
      {shadow && <ellipse cy={50} rx={38} ry={7} fill="url(#contact)" />}
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
      <radialGradient id="contact" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#000" stopOpacity=".38" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      <radialGradient id="lampglow" cx=".5" cy=".5" r=".6"><stop offset="0" stopColor="#ffe08a" stopOpacity=".95" /><stop offset=".5" stopColor="#ffd56a" stopOpacity=".35" /><stop offset="1" stopColor="#ffe08a" stopOpacity="0" /></radialGradient>
      <radialGradient id="lamppool" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffe3a6" stopOpacity=".55" /><stop offset="1" stopColor="#ffe3a6" stopOpacity="0" /></radialGradient>
      <linearGradient id="lightcone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe8b0" stopOpacity=".34" /><stop offset="1" stopColor="#ffe8b0" stopOpacity="0" /></linearGradient>
      <linearGradient id="winshaft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".22" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      <linearGradient id="ao-left" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity=".32" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
      <linearGradient id="ao-right" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#000" stopOpacity=".32" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
      <linearGradient id="ao-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity=".28" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
      <linearGradient id="ao-ceiling" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#000" stopOpacity=".18" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
      <linearGradient id="solar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b73d6" /><stop offset=".5" stopColor="#1e3f8a" /><stop offset="1" stopColor="#2f5fc0" /></linearGradient>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".4" stopColor="#fff" stopOpacity=".08" /><stop offset="1" stopColor="#fff" stopOpacity=".3" /></linearGradient>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8f9bab" /><stop offset=".35" stopColor="#e3e9f0" /><stop offset=".6" stopColor="#b6c1cd" /><stop offset="1" stopColor="#7f8b9b" /></linearGradient>
      <pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3h6M3 0v6" stroke="#000" strokeWidth=".8" opacity=".5" /></pattern>
      <pattern id="ropewind" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="10" height="4" fill="#000" opacity=".22" /></pattern>
      <pattern id="tile" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="none" stroke="#fff" strokeWidth="2" opacity=".8" /></pattern>
      <pattern id="pegs" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="2.2" fill="#000" opacity=".3" /></pattern>
      <pattern id="wood" width="120" height="22" patternUnits="userSpaceOnUse"><path d="M0 21h120" stroke="rgba(0,0,0,.16)" strokeWidth="2" /><path d="M60 0v21" stroke="rgba(0,0,0,.1)" strokeWidth="2" /><path d="M8 8q20-3 40 2M70 12q20-4 44 1" stroke="rgba(255,255,255,.12)" strokeWidth="1.2" fill="none" /></pattern>
      <pattern id="woodgrain" width="60" height="14" patternUnits="userSpaceOnUse"><path d="M0 7q15-5 30 0t30 0" stroke="rgba(0,0,0,.12)" strokeWidth="1.2" fill="none" /></pattern>
      <pattern id="wallpaper" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1.6" fill="rgba(255,255,255,.35)" /><circle cx="0" cy="0" r="1.6" fill="rgba(255,255,255,.25)" /></pattern>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" /></filter>
      <filter id="blur4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" /></filter>
      <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" result="n" /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncA type="linear" slope=".09" /></feComponentTransfer></filter>
      <radialGradient id="vignette" cx=".5" cy=".45" r=".75"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".34" /></radialGradient>
    </defs>
  );
}
