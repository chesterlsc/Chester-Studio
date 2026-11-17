// Draggable bottom sheet with snap points. Content is swapped per screen.
//   snaps: array of names/numbers: 'peek' (content-measured), 'half', 'full', 'auto'
//   (fits the content), or a pixel height.
export class Sheet {
  constructor(root) {
    this.el = document.createElement('section');
    this.el.className = 'sheet';
    this.el.innerHTML = '<div class="sheet-grab" aria-hidden="true"><div class="sheet-handle"></div></div><div class="sheet-body"></div>';
    root.appendChild(this.el);
    this.body = this.el.querySelector('.sheet-body');
    this.snaps = ['peek'];
    this.snap = 'peek';
    this.visible = 0;
    this.hidden = true;
    this.listeners = new Set();
    this.peekEl = null;
    this.topLimit = 0; // px from top the sheet must not cover (e.g. route card)
    this._bindDrag();
    window.addEventListener('resize', () => this.relayout());
    this.el.style.transform = 'translateY(100%)';
  }

  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  _emit() { for (const fn of this.listeners) fn(this.hidden ? 0 : this.visible, this.snap); }

  get maxH() { return this.el.parentElement.clientHeight; }

  /** Pixel height for a snap. */
  heightOf(s) {
    const H = this.maxH;
    const topGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat')) || 0;
    const full = H - Math.max(topGap + 12, this.topLimit || 0);
    if (typeof s === 'number') return Math.min(full, s);
    if (s === 'full') return full;
    if (s === 'half') return Math.round(H * 0.5);
    if (s === 'peek') {
      const mark = this.peekEl || this.body.firstElementChild;
      if (!mark) return 120;
      const bodyTop = this.body.getBoundingClientRect().top - this.el.getBoundingClientRect().top;
      const r = mark.getBoundingClientRect();
      const markBottom = r.bottom - this.body.getBoundingClientRect().top + this.body.scrollTop;
      return Math.min(full, Math.round(bodyTop + markBottom + 12 + this._sab()));
    }
    if (s === 'auto') {
      const bodyTop = this.body.getBoundingClientRect().top - this.el.getBoundingClientRect().top;
      const c = this.body.firstElementChild;
      const ch = c ? c.getBoundingClientRect().height : 0;
      const pb = parseFloat(getComputedStyle(this.body).paddingBottom) || 0;
      return Math.min(full, Math.round(bodyTop + ch + pb));
    }
    return 160;
  }

  _sab() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sab')) || 0; }

  /**
   * Show content. opts: { snaps, snap, peekEl, cls }
   */
  show(content, opts = {}) {
    this.body.replaceChildren(content);
    this.body.scrollTop = 0;
    this.snaps = opts.snaps || ['peek', 'half', 'full'];
    this.peekEl = opts.peekEl || null;
    this.el.className = `sheet ${opts.cls || ''}`;
    this.el.classList.toggle('single', this.snaps.length === 1);
    this.hidden = false;
    this.el.hidden = false;
    // Measure after layout.
    this.setSnap(opts.snap || this.snaps[0], { animate: true });
  }

  hide() {
    this.hidden = true;
    this.el.classList.add('animating');
    this.el.style.transform = 'translateY(100%)';
    this._emit();
  }

  setSnap(s, { animate = true } = {}) {
    if (!this.snaps.includes(s)) s = this.snaps[0];
    this.snap = s;
    this.el.classList.toggle('is-full', s === 'full');
    const h = this.heightOf(s);
    this._setVisible(h, animate);
    this._emit();
  }

  relayout() { if (!this.hidden) this.setSnap(this.snap, { animate: false }); }

  _setVisible(h, animate) {
    this.visible = h;
    this.el.classList.toggle('animating', !!animate);
    this.el.style.transform = `translateY(${this.maxH - h}px)`;
    this.el.style.setProperty('--sheet-h', `${h}px`);
  }

  _bindDrag() {
    let start = null;
    const el = this.el;
    const canDragFrom = (target) => {
      if (target.closest('.sheet-grab, .sheet-drag')) return true;
      if (target.closest('input, textarea, .no-drag')) return false;
      // In full state the body scrolls; drag only from the grab area.
      return this.snap !== 'full';
    };
    el.addEventListener('pointerdown', (e) => {
      if (this.hidden || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (!canDragFrom(e.target)) return;
      start = { y: e.clientY, h: this.visible, t: performance.now(), id: e.pointerId, dragging: false, lastY: e.clientY, lastT: performance.now(), v: 0 };
    });
    el.addEventListener('pointermove', (e) => {
      if (!start || e.pointerId !== start.id) return;
      const dy = e.clientY - start.y;
      if (!start.dragging) {
        if (Math.abs(dy) < 8) return;
        if (this.snaps.length === 1 && dy < 0) { start = null; return; }
        start.dragging = true;
        try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        el.classList.remove('animating');
      }
      const now = performance.now();
      start.v = (e.clientY - start.lastY) / Math.max(1, now - start.lastT);
      start.lastY = e.clientY; start.lastT = now;
      const minH = Math.min(...this.snaps.map((s) => this.heightOf(s))) * 0.6;
      const h = Math.max(minH, Math.min(this.heightOf('full'), start.h - dy));
      this._setVisible(h, false);
      this._emit();
      e.preventDefault();
    });
    const end = (e) => {
      if (!start || e.pointerId !== start.id) return;
      const s = start;
      start = null;
      if (!s.dragging) return;
      this._suppressClick = true;
      setTimeout(() => { this._suppressClick = false; }, 50);
      // Project with velocity, then snap to the nearest point.
      const projected = this.visible - s.v * 180;
      let best = this.snaps[0], bestD = Infinity;
      for (const sn of this.snaps) {
        const d = Math.abs(this.heightOf(sn) - projected);
        if (d < bestD) { bestD = d; best = sn; }
      }
      if (this.snaps.length === 1 && this.visible < this.heightOf(best) * 0.7 && this.onDismiss) {
        this.onDismiss();
        return;
      }
      this.setSnap(best);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', (e) => {
      if (this._suppressClick) { e.stopPropagation(); e.preventDefault(); }
    }, true);
  }
}
