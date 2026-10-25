import { forwardRef, useMemo } from 'react';
import type { CategoryId, ItemShape } from '@/domain/types';
import { type RoomId, ROOMS } from '@/domain/rooms';
import { EXTERIORS, FLOORS, FLOOR_H, FLOOR_W, F1X, ROOM_PLANS, SHEET, STAIRS_UP, TITLE_BLOCK, WALL, padRect, unitSlot, type Rect, type RoomPlan, type StorageUnit } from './floorplan';
import { FixtureGlyph, Symbol } from './Symbols';
import { Viewport, wasDrag, type ViewportHandle } from './Viewport';

export interface PlacedBlock { key: string; unitId: string; slot: number; shape: ItemShape; color: string; qty: number; category: CategoryId; catalogId: string; name: string }

export interface BlueprintProps {
  placed: PlacedBlock[];
  selectedRoom: RoomId | null;
  onSelectRoom: (id: RoomId) => void;
  attention: Set<RoomId>;              // rooms with missing categories → revision cloud
  roomPct: Partial<Record<RoomId, number>>;
  hidden: Set<CategoryId>;             // layer visibility
  roomLabel: (id: RoomId) => string;
  title: { project: string; client: string; scenario: string; duration: string; readiness: number; date: string; sheet: string };
  onInteract?: () => void;
  onCursor?: (p: { x: number; y: number } | null) => void;
  /** Static hero mode: fit this region, no chrome text. */
  region?: Rect;
}

/* ---------- drawing helpers ---------- */
function DimH({ x1, x2, y, label, flip }: { x1: number; x2: number; y: number; label: string; flip?: boolean }) {
  const ty = flip ? y + 14 : y - 6;
  return (
    <g className="bp-dimline">
      <path d={`M${x1} ${y}H${x2}`} />
      <path d={`M${x1} ${y - 8}v16M${x2} ${y - 8}v16`} />
      <path d={`M${x1 - 5} ${y + 5}l10-10M${x2 - 5} ${y + 5}l10-10`} />
      <text x={(x1 + x2) / 2} y={ty} textAnchor="middle" className="bp-text bp-text--dim" fontSize={12} stroke="none">{label}</text>
    </g>
  );
}
function DimV({ y1, y2, x, label }: { y1: number; y2: number; x: number; label: string }) {
  return (
    <g className="bp-dimline">
      <path d={`M${x} ${y1}V${y2}`} />
      <path d={`M${x - 8} ${y1}h16M${x - 8} ${y2}h16`} />
      <path d={`M${x - 5} ${y1 + 5}l10-10M${x - 5} ${y2 + 5}l10-10`} />
      <text x={x - 8} y={(y1 + y2) / 2} textAnchor="middle" className="bp-text bp-text--dim" fontSize={12} stroke="none" transform={`rotate(-90 ${x - 8} ${(y1 + y2) / 2})`}>{label}</text>
    </g>
  );
}
/** Architect's revision cloud around a rect. */
function cloudPath(rc: Rect, r = 18): string {
  const pts: string[] = [];
  const step = r * 1.6;
  const { x, y, w, h } = rc;
  let d = `M${x} ${y}`;
  for (let px = x; px < x + w; px += step) { const nx = Math.min(x + w, px + step); pts.push(`A${r} ${r} 0 0 1 ${nx} ${y}`); }
  for (let py = y; py < y + h; py += step) { const ny = Math.min(y + h, py + step); pts.push(`A${r} ${r} 0 0 1 ${x + w} ${ny}`); }
  for (let px = x + w; px > x; px -= step) { const nx = Math.max(x, px - step); pts.push(`A${r} ${r} 0 0 1 ${nx} ${y + h}`); }
  for (let py = y + h; py > y; py -= step) { const ny = Math.max(y, py - step); pts.push(`A${r} ${r} 0 0 1 ${x} ${ny}`); }
  d += pts.join('');
  return d + 'Z';
}

function Walls({ plan }: { plan: RoomPlan }) {
  const { x, y, w, h } = plan.rect;
  return <rect x={x} y={y} width={w} height={h} fill="none" stroke="var(--bp-wall)" strokeWidth={WALL.int} />;
}
function Openings({ plan }: { plan: RoomPlan }) {
  return (
    <g>
      {plan.windows.map((wn, i) => {
        const horiz = wn.wall === 'n' || wn.wall === 's';
        const t = WALL.ext + 2;
        return horiz
          ? <g key={`w${i}`}><rect x={wn.x} y={wn.y - t / 2} width={wn.w} height={t} className="bp-win" /><path d={`M${wn.x} ${wn.y - 3}h${wn.w}M${wn.x} ${wn.y + 3}h${wn.w}`} className="bp-win" fill="none" /></g>
          : <g key={`w${i}`}><rect x={wn.x - t / 2} y={wn.y} width={t} height={wn.w} className="bp-win" /><path d={`M${wn.x - 3} ${wn.y}v${wn.w}M${wn.x + 3} ${wn.y}v${wn.w}`} className="bp-win" fill="none" /></g>;
      })}
      {plan.doors.map((dr, i) => {
        const t = WALL.ext + 4; const s = dr.swing ?? 1;
        if (dr.wall === 'n' || dr.wall === 's') {
          const dir = dr.wall === 'n' ? 1 : -1; // swing into the room
          return <g key={`d${i}`}><rect x={dr.x} y={dr.y - t / 2} width={dr.w} height={t} fill="var(--bp-bg)" /><path d={`M${dr.x} ${dr.y}v${dir * dr.w}`} className="bp-door" /><path d={`M${dr.x} ${dr.y + dir * dr.w}A${dr.w} ${dr.w} 0 0 ${dir * s > 0 ? 0 : 1} ${dr.x + dr.w} ${dr.y}`} className="bp-door" /></g>;
        }
        const dir = dr.wall === 'w' ? 1 : -1;
        return <g key={`d${i}`}><rect x={dr.x - t / 2} y={dr.y} width={t} height={dr.w} fill="var(--bp-bg)" /><path d={`M${dr.x} ${dr.y}h${dir * dr.w}`} className="bp-door" /><path d={`M${dr.x + dir * dr.w} ${dr.y}A${dr.w} ${dr.w} 0 0 ${dir * s > 0 ? 1 : 0} ${dr.x} ${dr.y + dr.w}`} className="bp-door" /></g>;
      })}
    </g>
  );
}

function Unit({ u, selected, blocks, hidden }: { u: StorageUnit; selected: boolean; blocks: PlacedBlock[]; hidden: Set<CategoryId> }) {
  const slots = u.cols * u.rows;
  const cell = unitSlot(u, 0);
  const size = Math.min(cell.w, cell.h) * (u.floor ? .8 : .78);
  const horiz = u.wall === 'n' || u.wall === 's';
  const tagX = horiz ? u.rect.x : u.rect.x + u.rect.w + 6;
  const tagY = horiz ? (u.wall === 'n' ? u.rect.y + u.rect.h + 11 : u.rect.y - 5) : u.rect.y + 9;
  return (
    <g>
      <rect x={u.rect.x} y={u.rect.y} width={u.rect.w} height={u.rect.h} className={`bp-unit ${selected ? 'bp-unit--sel' : ''}`} />
      {Array.from({ length: slots }).map((_, i) => { const c = unitSlot(u, i); return <rect key={i} x={c.cx - c.w / 2 + 1.5} y={c.cy - c.h / 2 + 1.5} width={c.w - 3} height={c.h - 3} className="bp-slot" />; })}
      <text x={tagX} y={tagY} className="bp-text bp-text--faint" fontSize={8} transform={horiz ? undefined : `rotate(90 ${tagX} ${tagY})`}>{u.tag}</text>
      {blocks.filter((b) => !hidden.has(b.category)).map((b) => {
        const cap = u.cols * u.rows;
        const k = Math.floor(b.slot / cap);
        const c0 = unitSlot(u, b.slot % cap);
        const c = { ...c0, cx: c0.cx + k * 7, cy: c0.cy - k * 7 };
        return (
          <g key={b.key} className="bp-block">
            <title>{`${b.name} ×${b.qty}`}</title>
            <Symbol shape={b.shape} color={b.color} size={size} x={c.cx} y={c.cy} />
            {b.qty > 1 && (
              <g transform={`translate(${c.cx + c.w / 2 - 4} ${c.cy - c.h / 2 + 4})`}>
                <rect x={-16} y={-7} width={20} height={11} rx={3} fill={b.color} />
                <text x={-6} y={2} textAnchor="middle" className="bp-badge" fontSize={8} fill="#0b0d12">×{b.qty > 999 ? '999' : b.qty}</text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

function TitleBlock({ t }: { t: BlueprintProps['title'] }) {
  const { x, y, w, h } = TITLE_BLOCK;
  const col = w / 4;
  const F = ({ i, k, v, big }: { i: number; k: string; v: string; big?: boolean }) => (
    <g transform={`translate(${x + col * i + 14} ${y + 24})`}>
      <text className="bp-text bp-text--faint" fontSize={9}>{k}</text>
      <text y={big ? 36 : 24} className="bp-text bp-text--ink" fontSize={big ? 26 : 14} style={{ letterSpacing: big ? '-.01em' : '.04em', textTransform: 'none', fontWeight: big ? 700 : 500 }}>{v}</text>
    </g>
  );
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} className="bp-tb" />
      <path d={`M${x} ${y + h / 2}h${w}M${x + col} ${y}v${h}M${x + col * 2} ${y}v${h}M${x + col * 3} ${y}v${h}`} className="bp-tb" />
      <g transform={`translate(${x + 14} ${y + 16})`}>
        <path d="M0 22 16 7l16 15v14H0z" fill="var(--brand)" /><path d="M12 36V24h8v12" fill="var(--bp-sheet)" />
        <text x={44} y={14} className="bp-text bp-text--ink" fontSize={16} style={{ fontWeight: 800, letterSpacing: '.2em' }}>HANDA</text>
        <text x={44} y={30} className="bp-text" fontSize={9}>READINESS DRAWING SET · prepare.ph</text>
      </g>
      <g transform={`translate(0 ${h / 2})`}>
        <F i={0} k="PROJECT" v={t.project} />
        <F i={1} k="CLIENT" v={t.client} />
        <F i={2} k="SCENARIO" v={`${t.scenario} · ${t.duration}`} />
        <F i={3} k="READINESS" v={`${t.readiness}%`} big />
      </g>
      <g>
        <F i={1} k="SCALE" v="1 : 50" />
        <F i={2} k="DATE" v={t.date} />
        <F i={3} k="SHEET" v={t.sheet} />
      </g>
    </g>
  );
}

function NorthArrow({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="bp-dimline">
      <circle r={30} />
      <path d="M0-26 10 10 0 2-10 10z" fill="var(--bp-ink)" stroke="none" />
      <text y={-36} textAnchor="middle" className="bp-text bp-text--ink" fontSize={12} stroke="none">N</text>
    </g>
  );
}
function ScaleBar({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={i * 100} y={0} width={100} height={8} fill={i % 2 ? 'var(--bp-ink)' : 'none'} stroke="var(--bp-ink)" strokeWidth={1} vectorEffect="non-scaling-stroke" />)}
      {[0, 1, 2, 3, 4, 5].map((i) => <text key={i} x={i * 100} y={22} textAnchor="middle" className="bp-text" fontSize={10}>{i}</text>)}
      <text x={520} y={9} className="bp-text" fontSize={10}>M</text>
    </g>
  );
}

export const Blueprint = forwardRef<ViewportHandle, BlueprintProps>(function Blueprint({ placed, selectedRoom, onSelectRoom, attention, roomPct, hidden, roomLabel, title, onInteract, onCursor, region }, ref) {
  const byUnit = useMemo(() => { const m = new Map<string, PlacedBlock[]>(); for (const b of placed) m.set(b.unitId, [...(m.get(b.unitId) ?? []), b]); return m; }, [placed]);
  const initial = useMemo(() => region ?? { x: SHEET.x, y: SHEET.y, w: SHEET.w, h: SHEET.h }, [region]);

  return (
    <Viewport ref={ref} initial={initial} className="ed__svg" onInteract={onInteract} onCursor={onCursor}>
      <defs>
        <pattern id="grid-minor" width={50} height={50} patternUnits="userSpaceOnUse"><circle cx={0} cy={0} r={1.2} fill="var(--bp-grid-major)" /></pattern>
        <pattern id="grid-major" width={100} height={100} patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="var(--bp-grid)" strokeWidth={1} /></pattern>
        <pattern id="hatch-ext" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v14" stroke="var(--bp-ext)" strokeWidth={1.2} /></pattern>
        <pattern id="hatch-wall" width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v8" stroke="var(--bp-wall)" strokeWidth={1} opacity=".55" /></pattern>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* sheet */}
      <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} className="bp-sheet" />
      <rect x={SHEET.x + 24} y={SHEET.y + 24} width={SHEET.w - 48} height={SHEET.h - 48} fill="url(#grid-major)" stroke="var(--bp-sheet-edge)" strokeWidth={.8} vectorEffect="non-scaling-stroke" />
      <rect x={SHEET.x + 24} y={SHEET.y + 24} width={SHEET.w - 48} height={SHEET.h - 48} fill="url(#grid-minor)" />
      <text x={SHEET.x + 48} y={SHEET.y + 70} className="bp-text bp-text--ink" fontSize={22} style={{ fontWeight: 700, letterSpacing: '.18em' }}>HOUSEHOLD READINESS PLAN</text>
      <text x={SHEET.x + 48} y={SHEET.y + 96} className="bp-text" fontSize={11}>STORAGE LAYOUT · SUPPLY BLOCKS · SECTIONS · {title.client.toUpperCase()}</text>
      <NorthArrow x={SHEET.x + SHEET.w - 110} y={SHEET.y + 90} />
      <ScaleBar x={SHEET.x + 48} y={FLOOR_H + 200} />
      <TitleBlock t={title} />

      {FLOORS.map((f) => (
        <g key={f.floor}>
          {/* exterior wall poché */}
          <rect x={f.rect.x - WALL.ext / 2} y={f.rect.y - WALL.ext / 2} width={f.rect.w + WALL.ext} height={f.rect.h + WALL.ext} fill="none" stroke="var(--bp-wall-fill)" strokeWidth={WALL.ext} />
          <rect x={f.rect.x - WALL.ext / 2} y={f.rect.y - WALL.ext / 2} width={f.rect.w + WALL.ext} height={f.rect.h + WALL.ext} fill="none" stroke="url(#hatch-wall)" strokeWidth={WALL.ext} />
          <text x={f.rect.x} y={f.rect.y + f.rect.h + 92} className="bp-text bp-text--ink" fontSize={18} style={{ fontWeight: 700, letterSpacing: '.16em' }}>{f.title}</text>
          <text x={f.rect.x} y={f.rect.y + f.rect.h + 112} className="bp-text" fontSize={10}>{f.code} · SCALE 1:50 · ALL DIMENSIONS IN METRES</text>
          <DimH x1={f.rect.x} x2={f.rect.x + f.rect.w} y={f.rect.y + f.rect.h + 58} label={(f.rect.w / 100).toFixed(2)} flip />
          <DimV y1={f.rect.y} y2={f.rect.y + f.rect.h} x={f.rect.x - 58} label={(f.rect.h / 100).toFixed(2)} />
        </g>
      ))}

      {EXTERIORS.map((e) => (
        <g key={e.id}>
          <rect x={e.rect.x} y={e.rect.y} width={e.rect.w} height={e.rect.h} className="bp-ext" />
          <text x={e.rect.x + 12} y={e.rect.y + 22} className="bp-text bp-text--faint" fontSize={10}>{e.label}</text>
        </g>
      ))}
      <FixtureGlyph kind="stairs" rect={STAIRS_UP.rect} />

      {/* rooms: fills + walls first, then openings, fixtures, units, labels */}
      {ROOM_PLANS.map((p) => (
        <rect key={`fill-${p.id}`} x={p.rect.x} y={p.rect.y} width={p.rect.w} height={p.rect.h} className={`bp-room ${selectedRoom === p.id ? 'bp-room--sel' : ''}`} onClick={(e) => { if (!wasDrag(e)) onSelectRoom(p.id); }} />
      ))}
      {ROOM_PLANS.map((p) => <Walls key={`wall-${p.id}`} plan={p} />)}
      {ROOM_PLANS.map((p) => <Openings key={`open-${p.id}`} plan={p} />)}
      {ROOM_PLANS.map((p) => (
        <g key={`in-${p.id}`} style={{ pointerEvents: 'none' }}>
          {p.fixtures.map((f, i) => <FixtureGlyph key={i} kind={f.kind} rect={f.rect} />)}
          {p.units.map((u) => <Unit key={u.id} u={u} selected={selectedRoom === p.id} blocks={byUnit.get(u.id) ?? []} hidden={hidden} />)}
          {/* room label */}
          <g transform={`translate(${p.rect.x + 14} ${p.rect.y + p.rect.h - 34})`}>
            <text className="bp-text bp-text--ink" fontSize={13} style={{ fontWeight: 700 }}>{roomLabel(p.id)}</text>
            <text y={13} className="bp-text" fontSize={9}>{p.code} · {p.areaLabel} · {Math.round((roomPct[p.id] ?? 0) * 100)}%</text>
            <rect x={0} y={18} width={120} height={3} fill="var(--bp-grid-major)" />
            <rect x={0} y={18} width={120 * (roomPct[p.id] ?? 0)} height={3} fill={ROOMS[p.id].hue} />
          </g>
          {attention.has(p.id) && p.units.map((u) => <path key={`cloud-${u.id}`} d={cloudPath(padRect(u.rect, 18), 16)} className="bp-cloud" filter="url(#glow)" />)}
          {selectedRoom === p.id && <rect x={p.rect.x + 4} y={p.rect.y + 4} width={p.rect.w - 8} height={p.rect.h - 8} fill="none" stroke="var(--bp-sel)" strokeWidth={1.5} strokeDasharray="10 6" vectorEffect="non-scaling-stroke" />}
        </g>
      ))}

      {/* room width dimensions along the top of the ground floor */}
      {[[0, 300], [300, 650], [650, 900]].map(([a, b]) => <DimH key={a} x1={a} x2={b} y={-50} label={((b - a) / 100).toFixed(2)} />)}
      {[[F1X, F1X + 450], [F1X + 450, F1X + 900]].map(([a, b]) => <DimH key={a} x1={a} x2={b} y={-50} label={((b - a) / 100).toFixed(2)} />)}
      <DimV y1={0} y2={300} x={FLOOR_W + 58} label="3.00" />
      <DimV y1={300} y2={620} x={FLOOR_W + 58} label="3.20" />
      <DimV y1={620} y2={800} x={FLOOR_W + 58} label="1.80" />
    </Viewport>
  );
});
