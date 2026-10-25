import { forwardRef, useMemo } from 'react';
import type { CategoryId } from '@/domain/types';
import type { RoomId } from '@/domain/rooms';
import { unitsOf, type Rect, type StorageUnit } from './floorplan';
import { Symbol } from './Symbols';
import { Viewport, type ViewportHandle } from './Viewport';
import type { PlacedBlock } from './Blueprint';

export interface ElevationProps {
  room: RoomId;
  placed: PlacedBlock[];
  hidden: Set<CategoryId>;
  title: string;          // e.g. "SECTION A-A · KITCHEN & PANTRY"
  climate: string;        // one line
  notes: string[];        // CAD notes (facts, rules)
  onInteract?: () => void;
}

const GAP = 80;
const GROUND_Y = 0;

function unitAlong(u: StorageUnit) { return u.wall === 'n' || u.wall === 's' ? u.rect.w : u.rect.h; }

function UnitSection({ u, x0, blocks, hidden }: { u: StorageUnit; x0: number; blocks: PlacedBlock[]; hidden: Set<CategoryId> }) {
  const along = unitAlong(u);
  const off = u.offFloorCm ?? 0;
  const top = GROUND_Y - off - u.heightCm;
  const shelfH = u.heightCm / u.shelves;
  const colW = along / u.cols;
  const size = Math.min(colW, shelfH) * .8;
  return (
    <g>
      {/* posts */}
      <rect x={x0} y={top} width={6} height={u.heightCm + off} className="bp-shelf" />
      <rect x={x0 + along - 6} y={top} width={6} height={u.heightCm + off} className="bp-shelf" />
      {/* shelves */}
      {Array.from({ length: u.shelves + 1 }).map((_, k) => (
        <rect key={k} x={x0} y={top + k * shelfH - 3} width={along} height={u.floor && k === u.shelves ? 8 : 5} className="bp-shelf" />
      ))}
      {/* back hatch */}
      <rect x={x0 + 6} y={top} width={along - 12} height={u.heightCm} fill="url(#hatch-back)" opacity=".5" />
      {/* slot guides */}
      {Array.from({ length: u.cols * u.shelves }).map((_, i) => { const c = i % u.cols, l = Math.floor(i / u.cols); return <rect key={i} x={x0 + c * colW + 3} y={top + l * shelfH + 3} width={colW - 6} height={shelfH - 8} className="bp-slot" />; })}
      {/* items */}
      {blocks.filter((b) => !hidden.has(b.category)).map((b) => {
        const c = b.slot % u.cols, l = Math.floor(b.slot / u.cols) % u.shelves;
        const cx = x0 + c * colW + colW / 2;
        const base = top + (l + 1) * shelfH - 4;
        const copies = Math.min(3, b.qty);
        return (
          <g key={b.key}>
            {Array.from({ length: copies }).map((_, i) => (
              <Symbol key={i} shape={b.shape} color={b.color} size={size} x={cx + (i - (copies - 1) / 2) * size * .22} y={base - size / 2} view="section" dim={i < copies - 1} />
            ))}
            {b.qty > 1 && <g transform={`translate(${cx + colW / 2 - 6} ${top + l * shelfH + 10})`}><rect x={-20} y={-7} width={24} height={12} rx={3} fill={b.color} /><text x={-8} y={2.5} textAnchor="middle" className="bp-badge" fontSize={9} fill="#0b0d12">×{b.qty}</text></g>}
          </g>
        );
      })}
      {/* tag + dimensions */}
      <text x={x0} y={top - 14} className="bp-text bp-text--ink" fontSize={10}>{u.tag}</text>
      <g className="bp-dimline">
        <path d={`M${x0 + along + 24} ${top}V${GROUND_Y}`} /><path d={`M${x0 + along + 16} ${top}h16M${x0 + along + 16} ${GROUND_Y}h16`} />
        <text x={x0 + along + 34} y={(top + GROUND_Y) / 2} className="bp-text bp-text--dim" fontSize={10} stroke="none" transform={`rotate(-90 ${x0 + along + 34} ${(top + GROUND_Y) / 2})`} textAnchor="middle">{((u.heightCm + off) / 100).toFixed(2)}</text>
        {off > 0 && <><path d={`M${x0 - 24} ${GROUND_Y - off}V${GROUND_Y}`} /><path d={`M${x0 - 32} ${GROUND_Y - off}h16M${x0 - 32} ${GROUND_Y}h16`} /><text x={x0 - 30} y={GROUND_Y - off / 2 + 3} textAnchor="end" className="bp-text bp-text--dim" fontSize={9} stroke="none">+{off}</text></>}
      </g>
    </g>
  );
}

export const Elevation = forwardRef<ViewportHandle, ElevationProps>(function Elevation({ room, placed, hidden, title, climate, notes, onInteract }, ref) {
  const units = unitsOf(room);
  const layout = useMemo(() => { let x = 0; return units.map((u) => { const x0 = x; x += unitAlong(u) + GAP; return { u, x0 }; }); }, [units]);
  const totalW = layout.reduce((n, l) => Math.max(n, l.x0 + unitAlong(l.u)), 0);
  const maxH = units.reduce((n, u) => Math.max(n, u.heightCm + (u.offFloorCm ?? 0)), 100);
  const notesX = totalW + 120;
  const initial: Rect = useMemo(() => ({ x: -80, y: -maxH - 110, w: notesX + 420, h: maxH + 230 }), [maxH, notesX]);
  const byUnit = useMemo(() => { const m = new Map<string, PlacedBlock[]>(); for (const b of placed) m.set(b.unitId, [...(m.get(b.unitId) ?? []), b]); return m; }, [placed]);
  const wrap = (s: string, n = 46) => { const out: string[] = []; let line = ''; for (const w of s.split(' ')) { if ((line + ' ' + w).trim().length > n) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); } if (line) out.push(line); return out; };

  return (
    <Viewport ref={ref} initial={initial} className="ed__svg" onInteract={onInteract} key={room}>
      <defs>
        <pattern id="hatch-back" width={10} height={10} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v10" stroke="var(--bp-grid-major)" strokeWidth={1} /></pattern>
        <pattern id="hatch-ground" width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v12" stroke="var(--bp-ink-3)" strokeWidth={1.2} /></pattern>
        <pattern id="grid-major-s" width={100} height={100} patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="var(--bp-grid)" strokeWidth={1} /></pattern>
      </defs>
      <rect x={initial.x - 400} y={initial.y - 400} width={initial.w + 800} height={initial.h + 800} fill="url(#grid-major-s)" />
      <text x={0} y={-maxH - 70} className="bp-text bp-text--ink" fontSize={18} style={{ fontWeight: 700, letterSpacing: '.16em' }}>{title}</text>
      <text x={0} y={-maxH - 50} className="bp-text" fontSize={10}>SCALE 1:20 · HEIGHTS IN METRES · {climate.toUpperCase()}</text>
      {/* ground */}
      <path d={`M-60 ${GROUND_Y}H${totalW + 60}`} className="bp-floor" />
      <rect x={-60} y={GROUND_Y} width={totalW + 120} height={16} fill="url(#hatch-ground)" />
      <text x={totalW + 70} y={GROUND_Y + 12} className="bp-text bp-text--faint" fontSize={9}>FFL ±0.00</text>
      {layout.map(({ u, x0 }) => <UnitSection key={u.id} u={u} x0={x0} blocks={byUnit.get(u.id) ?? []} hidden={hidden} />)}
      {/* notes column */}
      <g transform={`translate(${notesX} ${-maxH - 20})`}>
        <text className="bp-text bp-text--ink" fontSize={11} style={{ fontWeight: 700 }}>GENERAL NOTES</text>
        <path d="M0 8h300" stroke="var(--bp-ink-3)" />
        {notes.slice(0, 8).reduce<{ y: number; el: React.ReactNode[] }>((acc, n, i) => {
          const lines = wrap(n);
          acc.el.push(
            <g key={i} transform={`translate(0 ${acc.y})`}>
              <circle cx={6} cy={-4} r={7} fill="none" stroke="var(--bp-dim)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <text x={6} y={-1} textAnchor="middle" className="bp-note" fill="var(--bp-dim)" fontSize={8}>{i + 1}</text>
              {lines.map((l, k) => <text key={k} x={20} y={k * 13} className="bp-note">{l}</text>)}
            </g>,
          );
          acc.y += lines.length * 13 + 12;
          return acc;
        }, { y: 28, el: [] }).el}
      </g>
    </Viewport>
  );
});
