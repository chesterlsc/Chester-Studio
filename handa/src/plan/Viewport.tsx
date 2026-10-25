import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, type ReactNode } from 'react';
import type { Rect } from './floorplan';

/**
 * Pan/zoom SVG viewport. Mouse drag, wheel, trackpad, pinch. Animates to a
 * target rect on demand. Exposes screen<->world helpers for fly-in effects.
 */
export interface ViewportHandle {
  fit: (rect: Rect, pad?: number, animate?: boolean) => void;
  zoomBy: (factor: number) => void;
  toScreen: (x: number, y: number) => { x: number; y: number } | null;
  getView: () => Rect;
}
interface Props { initial: Rect; children: ReactNode; className?: string; onClickBlank?: () => void; minW?: number; maxW?: number; onInteract?: () => void; onCursor?: (p: { x: number; y: number } | null) => void }

export const Viewport = forwardRef<ViewportHandle, Props>(function Viewport({ initial, children, className, onClickBlank, minW = 120, maxW = 6000, onInteract, onCursor }, ref) {
  const svg = useRef<SVGSVGElement>(null);
  const view = useRef<Rect>({ ...initial });
  const target = useRef<Rect | null>(null);
  const raf = useRef(0);
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ x: number; y: number; moved: number; view: Rect; dist?: number } | null>(null);

  const apply = useCallback(() => {
    const v = view.current; const el = svg.current; if (!el) return;
    el.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
  }, []);

  /** Make the view's aspect match the element (so world units are isotropic). */
  const aspectFix = useCallback((v: Rect): Rect => {
    const el = svg.current; if (!el) return v;
    const r = el.getBoundingClientRect(); const a = r.width / Math.max(1, r.height);
    const w = Math.max(v.w, v.h * a), h = w / a;
    return { x: v.x + (v.w - w) / 2, y: v.y + (v.h - h) / 2, w, h };
  }, []);

  const tick = useCallback(() => {
    const t = target.current; if (!t) return;
    const v = view.current; const k = .16;
    const nv = { x: v.x + (t.x - v.x) * k, y: v.y + (t.y - v.y) * k, w: v.w + (t.w - v.w) * k, h: v.h + (t.h - v.h) * k };
    view.current = nv; apply();
    if (Math.abs(t.w - nv.w) < .5 && Math.abs(t.x - nv.x) < .5 && Math.abs(t.y - nv.y) < .5) { view.current = t; apply(); target.current = null; return; }
    raf.current = requestAnimationFrame(tick);
  }, [apply]);

  const fit = useCallback((rect: Rect, pad = 60, animate = true) => {
    const v = aspectFix({ x: rect.x - pad, y: rect.y - pad, w: rect.w + pad * 2, h: rect.h + pad * 2 });
    if (!animate) { view.current = v; target.current = null; apply(); return; }
    target.current = v; cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(tick);
  }, [aspectFix, apply, tick]);

  const zoomAt = useCallback((factor: number, sx: number, sy: number) => {
    const el = svg.current; if (!el) return;
    const r = el.getBoundingClientRect(); const v = view.current;
    const px = (sx - r.left) / r.width, py = (sy - r.top) / r.height;
    const w = Math.min(maxW, Math.max(minW, v.w * factor)); const f = w / v.w; const h = v.h * f;
    view.current = { x: v.x + (v.w - w) * px, y: v.y + (v.h - h) * py, w, h };
    target.current = null; apply();
  }, [apply, minW, maxW]);

  useImperativeHandle(ref, () => ({
    fit,
    zoomBy: (f) => { const el = svg.current; if (!el) return; const r = el.getBoundingClientRect(); zoomAt(f, r.left + r.width / 2, r.top + r.height / 2); },
    toScreen: (x, y) => { const el = svg.current; if (!el) return null; const m = el.getScreenCTM(); if (!m) return null; const p = new DOMPoint(x, y).matrixTransform(m); return { x: p.x, y: p.y }; },
    getView: () => ({ ...view.current }),
  }), [fit, zoomAt]);

  useEffect(() => { fit(initial, 60, false); const ro = new ResizeObserver(() => { view.current = aspectFix(view.current); apply(); }); if (svg.current) ro.observe(svg.current); return () => { ro.disconnect(); cancelAnimationFrame(raf.current); }; }, [aspectFix, apply, fit, initial]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.current.size === 1) drag.current = { x: e.clientX, y: e.clientY, moved: 0, view: { ...view.current } };
    else if (ptrs.current.size === 2) { const [a, b] = Array.from(ptrs.current.values()); drag.current = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, moved: 0, view: { ...view.current }, dist: Math.hypot(a.x - b.x, a.y - b.y) }; }
    target.current = null; onInteract?.();
    if (svg.current) svg.current.dataset.moved = '0';
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (onCursor && svg.current) { const r = svg.current.getBoundingClientRect(); const v = view.current; onCursor({ x: v.x + ((e.clientX - r.left) / r.width) * v.w, y: v.y + ((e.clientY - r.top) / r.height) * v.h }); }
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const d = drag.current; const el = svg.current; if (!d || !el) return;
    const r = el.getBoundingClientRect(); const scale = d.view.w / r.width;
    if (ptrs.current.size >= 2 && d.dist) {
      const [a, b] = Array.from(ptrs.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y); const f = d.dist / Math.max(1, dist);
      const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      const w = Math.min(maxW, Math.max(minW, d.view.w * f)); const ff = w / d.view.w; const h = d.view.h * ff;
      const px = (d.x - r.left) / r.width, py = (d.y - r.top) / r.height;
      view.current = { x: d.view.x + (d.view.w - w) * px - (cx - d.x) * scale * ff, y: d.view.y + (d.view.h - h) * py - (cy - d.y) * scale * ff, w, h };
      d.moved = 99; if (svg.current) svg.current.dataset.moved = '99'; apply(); return;
    }
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    d.moved = Math.max(d.moved, Math.hypot(dx, dy)); if (svg.current) svg.current.dataset.moved = String(d.moved);
    view.current = { ...d.view, x: d.view.x - dx * scale, y: d.view.y - dy * scale };
    apply();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    ptrs.current.delete(e.pointerId);
    const d = drag.current;
    if (ptrs.current.size === 0) { if (d && d.moved < 6 && (e.target as Element).tagName === 'svg') onClickBlank?.(); drag.current = null; }
    else if (ptrs.current.size === 1) { const p = Array.from(ptrs.current.values())[0]; drag.current = { x: p.x, y: p.y, moved: 99, view: { ...view.current } }; }
  };
  const onWheel = (e: React.WheelEvent) => { e.preventDefault(); const f = e.ctrlKey ? Math.exp(e.deltaY * .01) : Math.exp(e.deltaY * .0016); zoomAt(f, e.clientX, e.clientY); onInteract?.(); };

  return (
    <svg ref={svg} className={className} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onPointerLeave={() => onCursor?.(null)} onWheel={onWheel}>
      {children}
    </svg>
  );
});

/** True when the last pointer gesture on the viewport was a drag (so a click should be ignored). */
export function wasDrag(e: React.MouseEvent): boolean {
  const svg = (e.currentTarget as Element).closest('svg');
  return Number(svg?.getAttribute('data-moved') ?? 0) >= 6;
}
