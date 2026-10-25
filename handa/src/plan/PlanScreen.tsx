import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Meter, Sheet, toast } from '@/ui';
import { CATALOG, catalogById } from '@/domain/catalog';
import { CATEGORIES, DURATION_DAYS, type CatalogItem, type CategoryId } from '@/domain/types';
import { SCENARIOS } from '@/domain/scenarios';
import { CATEGORY_ROOM, ROOMS, ROOM_ORDER, roomCategories, type RoomId } from '@/domain/rooms';
import { computeReadiness, headcount, nextSuggestion, targetQty } from '@/domain/readiness';
import { KITS } from '@/domain/kits';
import { useSession } from '@/store/useSession';
import { useSettings } from '@/store/useSettings';
import { addItem, applyKit, setQty, useHousehold, useInventory } from '@/store/useInventory';
import { uid, upsert } from '@/store/db';
import { usePresentation } from '@/store/usePresentation';
import { pick } from '@/i18n';
import { sfx } from '@/lib/sound';
import { fmtDays, readinessColor } from '@/lib/format';
import { CAT_COLOR } from '@/scene/palette';
import { ITEM_STORE_TIPS, ROOM_FACTS, STORAGE_GUIDES } from '@/content';
import type { IconName } from '@/design/icons/names';
import { Blueprint, type PlacedBlock } from './Blueprint';
import { Elevation } from './Elevation';
import { SimChart } from './SimChart';
import { simulate } from './simulation';
import { roomPlan, SHEET, unitSlot, unitsOf, type StorageUnit } from './floorplan';
import { Symbol } from './Symbols';
import type { ViewportHandle } from './Viewport';
import './plan.css';

const CAT_ICON: Record<CategoryId, IconName> = { water: 'cat-water', food: 'cat-food', canning: 'cat-canning', medicine: 'cat-medicine', baby: 'cat-baby', power: 'cat-power', shelter: 'cat-shelter', hygiene: 'cat-hygiene', comms: 'cat-comms', cash: 'cat-cash', edc: 'cat-edc', pets: 'cat-pets', security: 'cat-security' };

/** Which storage unit an item goes to inside its room. */
function unitFor(item: CatalogItem): StorageUnit {
  const room = CATEGORY_ROOM[item.category];
  const units = unitsOf(room);
  const by = (id: string) => units.find((u) => u.id === id) ?? units[0];
  switch (room) {
    case 'kitchen': return item.category === 'canning' ? by('preserve') : by('pantry');
    case 'water': return item.shape === 'drum' || item.shape === 'gallon' ? by('water-pad') : by('water-shelf');
    case 'bedroom': return item.category === 'baby' ? by('baby-shelf') : by('med-cabinet');
    case 'bodega': return item.category === 'pets' ? by('pet-rack') : by('tool-wall');
    default: return units[0];
  }
}

type Tab = 'items' | 'room' | 'layers' | 'sim';

export default function PlanScreen() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const { scenario, duration, householdId, runId, finish } = useSession();
  const bumpRuns = useSettings((s) => s.bumpRuns);
  const presentation = usePresentation((s) => s.active);
  const household = useHousehold(householdId);
  const inventory = useInventory(householdId);
  const [room, setRoom] = useState<RoomId | null>(null);
  const [view, setView] = useState<'plan' | 'section'>('plan');
  const [hidden, setHidden] = useState<Set<CategoryId>>(new Set());
  const [tab, setTab] = useState<Tab>('items');
  const [simOpen, setSimOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [kitsOpen, setKitsOpen] = useState(false);
  const [hintSeen, setHintSeen] = useState(false);
  const [doneBadge, setDoneBadge] = useState<string | null>(null);
  const [cine, setCine] = useState<{ i: number } | null>(null);
  const prevPct = useRef<Partial<Record<CategoryId, number>>>({});
  const vp = useRef<ViewportHandle>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoomPct, setZoomPct] = useState(100);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const autoPicked = useRef(false);

  useEffect(() => { if (!scenario || !householdId) nav('/play', { replace: true }); }, [scenario, householdId, nav]);

  const readiness = useMemo(() => (household && scenario ? computeReadiness(household, scenario, duration, inventory) : null), [household, scenario, duration, inventory]);
  const relevantCats = useMemo(() => CATEGORIES.filter((c) => readiness?.categories[c]?.relevant), [readiness]);
  const roomPct = useMemo(() => {
    const o: Partial<Record<RoomId, number>> = {};
    for (const r of ROOM_ORDER) { const cats = roomCategories(r).filter((c) => relevantCats.includes(c)); o[r] = cats.length ? cats.reduce((n, c) => n + (readiness?.categories[c]?.pct ?? 0), 0) / cats.length : 1; }
    return o;
  }, [readiness, relevantCats]);
  const attention = useMemo(() => new Set(ROOM_ORDER.filter((r) => roomCategories(r).some((c) => readiness?.missing.includes(c)))), [readiness]);

  /** inventory → CAD blocks (one block per catalog item, with its quantity). */
  const placed: PlacedBlock[] = useMemo(() => {
    const rows = [...inventory].sort((a, b) => a.createdAt - b.createdAt);
    const count = new Map<string, number>();
    const out: PlacedBlock[] = [];
    for (const r of rows) {
      const item = catalogById(r.catalogId); if (!item || r.qty <= 0) continue;
      const u = unitFor(item);
      const slot = count.get(u.id) ?? 0; count.set(u.id, slot + 1);
      out.push({ key: r.id, unitId: u.id, slot, shape: item.shape, color: CAT_COLOR[item.category], qty: Math.round(r.qty), category: item.category, catalogId: item.id, name: pick(item.name) });
    }
    return out;
  }, [inventory]);

  // default room = the one with the biggest gap
  useEffect(() => { if (!autoPicked.current && readiness) { autoPicked.current = true; if (readiness.missing[0]) setRoom(CATEGORY_ROOM[readiness.missing[0]]); } }, [readiness]);

  // camera follows the room
  useEffect(() => {
    if (view !== 'plan' || !vp.current) return;
    if (room) vp.current.fit(roomPlan(room).rect, 90); else vp.current.fit(SHEET, 20);
  }, [room, view]);

  // celebrate category completion
  useEffect(() => {
    if (!readiness) return;
    for (const c of relevantCats) {
      const now = readiness.categories[c].pct, before = prevPct.current[c];
      if (before !== undefined && before < .99 && now >= .99) { setDoneBadge(t('house.categoryDone', { cat: t(`cat.${c}`) })); setTimeout(() => setDoneBadge(null), 2200); sfx.complete(); }
      prevPct.current[c] = now;
    }
  }, [readiness, relevantCats, t]);

  const qtyOf = useCallback((id: string) => inventory.filter((r) => r.catalogId === id).reduce((n, r) => n + r.qty, 0), [inventory]);
  const paletteItems = useMemo(() => {
    if (!household) return [] as CatalogItem[];
    const cats = room ? roomCategories(room) : relevantCats;
    return CATALOG.filter((i) => cats.includes(i.category) && relevantCats.includes(i.category) && (!i.requires?.length || i.requires.some((k) => (household[k] ?? 0) > 0)));
  }, [room, relevantCats, household]);

  /** Fly a block from the palette button to its slot on the drawing. */
  const fly = (fromEl: HTMLElement | null, item: CatalogItem) => {
    const canvas = canvasRef.current; if (!canvas || !vp.current || !fromEl) return;
    const u = unitFor(item);
    const existing = placed.find((b) => b.catalogId === item.id);
    const slot = existing ? existing.slot : placed.filter((b) => b.unitId === u.id).length;
    const c = unitSlot(u, slot % (u.cols * u.rows));
    const to = vp.current.toScreen(c.cx, c.cy); if (!to) return;
    const cr = canvas.getBoundingClientRect(); const fr = fromEl.getBoundingClientRect();
    const el = document.createElement('div'); el.className = 'ed__fly';
    const glyph = fromEl.closest('.asset, .irow, .reco__item')?.querySelector('svg');
    el.innerHTML = glyph ? glyph.outerHTML.replace(/width="[^"]*"|height="[^"]*"/g, '') : `<svg viewBox="-50 -50 100 100"><circle r="30" fill="${CAT_COLOR[item.category]}" fill-opacity=".25" stroke="${CAT_COLOR[item.category]}" stroke-width="3"/></svg>`;
    const svgEl = el.querySelector('svg'); if (svgEl) { svgEl.setAttribute('width', '44'); svgEl.setAttribute('height', '44'); svgEl.style.filter = `drop-shadow(0 0 10px ${CAT_COLOR[item.category]})`; }
    canvas.appendChild(el);
    const dx = to.x - cr.left - 22, dy = to.y - cr.top - 22;
    const sx = fr.left - cr.left + fr.width / 2 - 22, sy = fr.top - cr.top + fr.height / 2 - 22;
    const anim = el.animate([
      { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 1 },
      { transform: `translate(${(sx + dx) / 2}px, ${Math.min(sy, dy) - 80}px) scale(1.2)`, opacity: 1, offset: .5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.5)`, opacity: .9 },
    ], { duration: 620, easing: 'cubic-bezier(.2,.8,.2,1)' });
    anim.onfinish = () => el.remove();
  };

  const add = async (item: CatalogItem, fromEl?: HTMLElement | null) => {
    if (!householdId) return;
    sfx.drop();
    fly(fromEl ?? null, item);
    await addItem(householdId, item);
  };
  const minus = async (item: CatalogItem) => { const row = inventory.find((r) => r.catalogId === item.id); if (!row) return; sfx.tap(); await setQty(row, Math.max(0, row.qty - (item.step ?? 1))); };
  const setExact = async (item: CatalogItem, q: number) => { if (!householdId) return; const row = inventory.find((r) => r.catalogId === item.id); if (row) await setQty(row, q); else if (q > 0) await addItem(householdId, item, q); };

  const finishRun = async () => {
    if (!readiness || !runId || !householdId || !scenario) return;
    const now = Date.now(); const categories: Partial<Record<CategoryId, number>> = {};
    for (const c of relevantCats) categories[c] = readiness.categories[c].pct;
    await upsert('scores', { id: uid(), runId, householdId, scenario, duration, pct: readiness.pct, daysCovered: readiness.daysCovered, categories, at: now, updatedAt: now });
    await finish(readiness.pct, readiness.daysCovered); bumpRuns(); sfx.win(); nav('/score');
  };

  // --- cinematic tour (also used by presentation mode) ---
  useEffect(() => {
    if (!cine) return;
    const r = ROOM_ORDER[cine.i];
    if (!r) { setCine(null); setRoom(null); setSimOpen(true); return; }
    setRoom(r); setView('plan');
    const id = setTimeout(() => setCine({ i: cine.i + 1 }), 3600);
    return () => clearTimeout(id);
  }, [cine]);
  useEffect(() => {
    if (!presentation || !household || !scenario || !readiness) return;
    if (readiness.pct >= 88) { const id = setTimeout(() => void finishRun(), 2600); return () => clearTimeout(id); }
    const id = setTimeout(async () => {
      const c = readiness.missing[0] ?? relevantCats[0]; if (!c) return;
      setRoom(CATEGORY_ROOM[c]);
      const item = nextSuggestion(c, household, scenario, duration, inventory);
      if (item && householdId) await addItem(householdId, item, Math.max(item.step ?? 1, Math.ceil(targetQty(item, household, scenario, duration) / 3)));
    }, 700);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentation, readiness]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setCine(null); setSimOpen(false); setRulesOpen(false); } if (e.key === '1') setView('plan'); if (e.key === '2' && room) setView('section'); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [room]);

  if (!scenario || !household || !readiness) return <div className="ed"><div className="page muted">{t('common.loading')}</div></div>;

  const profile = SCENARIOS[scenario];
  const pct = readiness.pct;
  const sim = simulate(household, scenario, duration, inventory);
  const guide = room ? STORAGE_GUIDES[room] : null;
  const facts = room ? ROOM_FACTS[room] : [];
  const recs = room ? roomCategories(room).filter((c) => relevantCats.includes(c)).flatMap((c) => {
    const item = nextSuggestion(c, household, scenario, duration, inventory); if (!item) return [];
    const need = targetQty(item, household, scenario, duration); const have = qtyOf(item.id);
    return have >= need ? [] : [{ item, add: need - have, w: (profile.weights[c] ?? 1) * (1 - have / need) }];
  }).sort((a, b) => b.w - a.w).slice(0, 4) : [];
  const date = new Date().toLocaleDateString(i18n.language === 'tl' ? 'fil-PH' : 'en-PH', { year: 'numeric', month: 'short', day: '2-digit' });
  const titleBlock = { project: t('plan.title'), client: household.name || 'Home', scenario: t(`scenario.${scenario}`), duration: fmtDays(DURATION_DAYS[duration]), readiness: pct, date, sheet: view === 'plan' ? 'A-101' : `A-3${room ? ROOM_ORDER.indexOf(room) + 1 : 0}` };
  const kits = KITS.filter((k) => k.scenarios.includes(scenario));

  const Layers = () => (
    <div className="pn">
      <div className="pn__h"><span>{t('plan.layers')}</span><button type="button" className="tb" style={{ minHeight: 26, padding: '0 8px' }} onClick={() => setHidden(new Set())}>{t('plan.showAll')}</button></div>
      {relevantCats.map((c) => {
        const p = Math.round((readiness.categories[c].pct) * 100);
        const on = !hidden.has(c);
        const sel = room ? roomCategories(room).includes(c) : false;
        return (
          <div key={c} className={`layer ${sel ? 'layer--sel' : ''}`} onClick={() => { setRoom(CATEGORY_ROOM[c]); setTab('items'); }} role="button" tabIndex={0}>
            <button type="button" className="layer__eye" aria-pressed={on} aria-label={t(`cat.${c}`)} onClick={(e) => { e.stopPropagation(); setHidden((h) => { const n = new Set(h); if (n.has(c)) n.delete(c); else n.add(c); return n; }); }}><Icon name="eye" size={16} /></button>
            <span className="layer__name"><i className="layer__dot" style={{ background: CAT_COLOR[c] }} /><span>{t(`cat.${c}`)}</span></span>
            <span className="layer__pct">{p}%</span>
            <Meter value={p} color={CAT_COLOR[c]} size="sm" />
          </div>
        );
      })}
    </div>
  );

  const Inspector = () => (
    <>
      {!room ? <div className="pn"><p className="small" style={{ color: 'var(--bp-ink-2)' }}>{t('plan.noRoom')}</p><p className="xs" style={{ color: 'var(--bp-ink-3)' }}>{t('plan.mapHint')}</p></div> : (
        <>
          <div className="pn">
            <div className="insp__code">{roomPlan(room).code} · {roomPlan(room).areaLabel}</div>
            <div className="insp__title">{t(`room.${room}`)}</div>
            {guide && <p className="small" style={{ color: 'var(--bp-ink-2)' }}>{pick(guide.purpose)}</p>}
            <dl className="insp__kv">
              <dt>{t('plan.climate')}</dt><dd>{guide ? pick(guide.climate) : ''}</dd>
              <dt>{t('plan.cadence')}</dt><dd>{guide ? pick(guide.cadence) : ''}</dd>
              <dt>{t('plan.ready')}</dt><dd className="mono">{Math.round((roomPct[room] ?? 0) * 100)}%</dd>
            </dl>
            <div className="row" style={{ gap: 6 }}>
              <button type="button" className="tb" onClick={() => setRulesOpen(true)}><Icon name="book" size={14} />{t('plan.rules')}</button>
              <button type="button" className={`tb ${view === 'section' ? 'tb--on' : ''}`} onClick={() => setView(view === 'section' ? 'plan' : 'section')}><Icon name="window" size={14} />{t('plan.section')}</button>
            </div>
          </div>
          <div className="pn">
            <div className="pn__h"><span>{t('plan.recs')}</span></div>
            <div className="reco">
              {recs.length === 0 && <div className="reco__item reco__item--ok"><Icon name="check" size={14} style={{ color: 'var(--ok)' }} /><span>{t('plan.allSet')}</span><span /></div>}
              {recs.map(({ item, add: n }) => (
                <div key={item.id} className="reco__item">
                  <Icon name={CAT_ICON[item.category]} size={14} style={{ color: CAT_COLOR[item.category] }} />
                  <span><b>{t('plan.add', { n })}</b> × {pick(item.name)}<br /><span style={{ color: 'var(--bp-ink-2)' }}>{pick(ITEM_STORE_TIPS[item.id])}</span></span>
                  <button type="button" className="tb" style={{ minHeight: 28, padding: '0 8px' }} onClick={(e) => void add(item, e.currentTarget)}><Icon name="plus" size={14} /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="pn">
            <div className="pn__h"><span>{t('plan.items')}</span><span>{t('plan.have')} / {t('plan.need')}</span></div>
            {paletteItems.map((item) => {
              const have = qtyOf(item.id), need = targetQty(item, household, scenario, duration);
              return (
                <div key={item.id} className={`irow ${have >= need ? 'irow--done' : ''}`}>
                  <svg viewBox="-50 -50 100 100" width={26} height={26}><Symbol shape={item.shape} color={CAT_COLOR[item.category]} size={96} view="section" /></svg>
                  <span><span style={{ display: 'block', fontSize: 'var(--fs-xs)' }}>{pick(item.name)}</span><span className="irow__have"><b>{have}</b> / {need} {item.unit}</span></span>
                  <span className="irow__btns"><button type="button" className="tb" aria-label="−" onClick={() => void minus(item)}><Icon name="minus" size={12} /></button><button type="button" className="tb" aria-label="+" onClick={(e) => void add(item, e.currentTarget)}><Icon name="plus" size={12} /></button><button type="button" className="tb" aria-label="=" title="Set to need" onClick={() => void setExact(item, need)}><Icon name="check" size={12} /></button></span>
                </div>
              );
            })}
          </div>
          {facts.length > 0 && <div className="pn"><div className="pn__h"><span>{t('plan.facts')}</span></div>{facts.map((f, i) => <p key={i} className="xs" style={{ color: 'var(--bp-ink-2)' }}>{i + 1}. {pick(f)}</p>)}</div>}
        </>
      )}
    </>
  );

  const Palette = () => (
    <div className="palette">
      {paletteItems.map((item) => {
        const have = qtyOf(item.id), need = targetQty(item, household, scenario, duration), done = have >= need;
        return (
          <div key={item.id} className={`asset ${done ? 'asset--done' : ''}`}>
            <button type="button" className="asset__add" aria-label={`${t('common.add')} ${pick(item.name)}`} onClick={(e) => void add(item, e.currentTarget)}><Icon name={done ? 'check' : 'plus'} size={16} /></button>
            <div className="asset__art"><svg viewBox="-50 -56 100 112"><Symbol shape={item.shape} color={CAT_COLOR[item.category]} size={100} view="section" /></svg></div>
            <div className="asset__name">{pick(item.name)}</div>
            <div className="asset__have"><span><b>{have}</b> / {need} {item.unit === 'php' ? '×₱500' : item.unit}</span>{have > 0 && <button type="button" className="asset__minus" aria-label={t('common.remove')} onClick={() => void minus(item)}><Icon name="minus" size={12} /></button>}</div>
          </div>
        );
      })}
      <button type="button" className="asset" style={{ display: 'grid', placeItems: 'center', gridTemplateRows: 'none' }} onClick={() => setKitsOpen(true)}><Icon name="bag" size={24} /><span className="asset__name" style={{ textAlign: 'center', minHeight: 0 }}>{t('house.kits')}</span></button>
    </div>
  );

  return (
    <div className="ed">
      {/* ---- top bar ---- */}
      <div className="ed__top">
        <button type="button" className="tb tb--icon" aria-label={t('common.back')} onClick={() => nav('/play')}><Icon name="back" size={18} /></button>
        <span className="ed__brand"><svg width="16" height="16" viewBox="0 0 64 64"><path d="M8 32 32 10l24 22v22H8z" fill="#ff6a1a" /></svg><b>HANDA</b><span> · {t('plan.title')}</span></span>
        <span className="ed__crumb"><Icon name={scenario} size={14} /><b>{t(`scenario.${scenario}`)}</b> · {fmtDays(DURATION_DAYS[duration])} · {t('common.people', { count: headcount(household) })}</span>
        <div className="ed__meter">
          <div className="ed__meter-row"><span>{t('plan.ready')} <b>{pct}%</b></span><span>{t('plan.days')} <b>{readiness.daysCovered}</b></span></div>
          <Meter value={pct} color={readinessColor(pct)} />
        </div>
        <div className="ed__tools">
          <button type="button" className={`tb ${simOpen ? 'tb--on' : ''}`} onClick={() => setSimOpen(true)} aria-label={t('plan.simulate')}><Icon name="clock" size={14} /><span>{t('plan.simulate')}</span></button>
          <button type="button" className="tb tb--icon" title={t('plan.cine.start')} onClick={() => setCine({ i: 0 })}><Icon name="play" size={14} /></button>
          <button type="button" className="tb tb--primary" onClick={() => void finishRun()}><Icon name="trophy" size={14} />{t('plan.finish')}</button>
        </div>
      </div>

      {/* ---- left: layers ---- */}
      <aside className="ed__left"><Layers /></aside>

      {/* ---- canvas ---- */}
      <div className="ed__canvas" ref={canvasRef} onPointerDown={() => setHintSeen(true)}>
        {view === 'plan' || !room ? (
          <Blueprint ref={vp} placed={placed} selectedRoom={room} onSelectRoom={(r) => { setRoom(r); setTab('items'); sfx.tap(); }} attention={attention} roomPct={roomPct} hidden={hidden} roomLabel={(id) => t(`room.${id}`)} title={titleBlock} onInteract={() => setZoomPct(Math.round((SHEET.w / (vp.current?.getView().w ?? SHEET.w)) * 100))} onCursor={setCursor} />
        ) : (
          <Elevation ref={vp} room={room} placed={placed} hidden={hidden} title={t('plan.sectionOf', { room: t(`room.${room}`) }).toUpperCase()} climate={guide ? pick(guide.climate) : ''} notes={[...(guide ? guide.rules.map((r) => pick(r.title) + ': ' + pick(r.body)) : []), ...facts.map(pick)]} />
        )}
        <div className="ed__viewtabs">
          <button type="button" className={`tb ${view === 'plan' ? 'tb--on' : ''}`} onClick={() => setView('plan')}>{t('plan.plan')}</button>
          <button type="button" className={`tb ${view === 'section' ? 'tb--on' : ''}`} disabled={!room} onClick={() => setView('section')}>{t('plan.section')}</button>
        </div>
        <div className="ed__zoom">
          <button type="button" className="tb tb--icon" aria-label={t('plan.zoomIn')} onClick={() => vp.current?.zoomBy(.7)}><Icon name="plus" size={14} /></button>
          <button type="button" className="tb tb--icon" aria-label={t('plan.zoomOut')} onClick={() => vp.current?.zoomBy(1.4)}><Icon name="minus" size={14} /></button>
          <button type="button" className="tb tb--icon" aria-label={t('plan.fitAll')} onClick={() => { setRoom(null); setView('plan'); vp.current?.fit(SHEET, 20); }}><Icon name="map" size={14} /></button>
        </div>
        {!hintSeen && !cine && <div className="ed__hint"><Icon name="hand" size={12} />{t('plan.hint')}</div>}
        {doneBadge && <div className="ed__toast"><Icon name="check" size={14} />{doneBadge}</div>}
        {cine && room && (
          <div className="cine" key={room}>
            <div className="eyebrow">{roomPlan(room).code} · {t('plan.cine.title')}</div>
            <h3>{t(`room.${room}`)}</h3>
            <p>{guide ? pick(guide.purpose) : ''} {guide ? pick(guide.climate) : ''}</p>
            <button type="button" className="tb" style={{ marginTop: 8 }} onClick={() => setCine(null)}>{t('plan.cine.stop')}</button>
          </div>
        )}
      </div>

      {/* ---- right: inspector ---- */}
      <aside className="ed__right"><Inspector /></aside>

      {/* ---- bottom: tabs (mobile) + palette + status ---- */}
      <div className="ed__bottom">
        <div className="ed__tabs">
          {(['items', 'room', 'layers', 'sim'] as Tab[]).map((k) => <button key={k} type="button" className={`tb ${tab === k ? 'tb--on' : ''}`} onClick={() => { setTab(k); if (k === 'sim') setSimOpen(true); }}>{t(k === 'items' ? 'plan.items' : k === 'room' ? 'plan.room' : k === 'layers' ? 'plan.layers' : 'plan.simulate')}</button>)}
        </div>
        {tab === 'items' || tab === 'sim' ? <Palette /> : <div className="mobile-panel">{tab === 'room' ? <Inspector /> : <Layers />}</div>}
        <div className="ed__status">
          <span><span className="dot" />{t('plan.status')}</span>
          <span>{t('plan.sheet')} <b>{titleBlock.sheet}</b></span>
          <span>{t('plan.zoom')} <b>{zoomPct}%</b></span>
          <span className="ed__cursor">{t('plan.cursor')} <b>{cursor ? `${(cursor.x / 100).toFixed(2)}, ${(cursor.y / 100).toFixed(2)}` : '—'}</b></span>
          <span className="sp" />
          <span>{t('plan.ready')} <b>{pct}%</b></span>
          <span>{t('plan.days')} <b>{readiness.daysCovered}</b></span>
          <span>{t('plan.rev')} <b>{inventory.length}</b></span>
        </div>
      </div>

      <Sheet open={simOpen} onClose={() => setSimOpen(false)} title={t('plan.sim.title')}><SimChart sim={sim} /></Sheet>
      <Sheet open={rulesOpen} onClose={() => setRulesOpen(false)} title={room ? `${t('plan.rules')} · ${t(`room.${room}`)}` : t('plan.rules')}>
        {guide && (
          <div className="stack">
            <p className="small muted">{pick(guide.climate)}</p>
            <div>{guide.rules.map((r, i) => <div key={i} className="rule"><Icon name={r.icon} size={18} style={{ color: ROOMS[room!].hue, marginTop: 2 }} /><div><b>{pick(r.title)}</b><span>{pick(r.body)}</span></div></div>)}</div>
            <div className="eyebrow">{t('plan.never')}</div>
            <div>{guide.never.map((n, i) => <div key={i} className="never"><Icon name="close" size={16} />{pick(n)}</div>)}</div>
            <p className="xs muted">{t('plan.cadence')}: {pick(guide.cadence)}</p>
            <div className="chips">{guide.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="chip">{s.label}<Icon name="external" size={12} /></a>)}</div>
          </div>
        )}
      </Sheet>
      <Sheet open={kitsOpen} onClose={() => setKitsOpen(false)} title={t('house.kits')}>
        <div className="stack">
          {kits.map((k) => (
            <div key={k.id} className="card row" style={{ gap: 'var(--s-4)' }}>
              <div className="opt__icon" style={{ '--opt-color': 'var(--brand)' } as React.CSSProperties}><Icon name="bag" /></div>
              <div className="grow"><div style={{ fontWeight: 700 }}>{pick(k.name)}</div><div className="small muted">{pick(k.blurb)}</div></div>
              <Button size="sm" variant="primary" onClick={async () => { if (!householdId) return; const n = await applyKit(householdId, k.id, headcount(household)); setKitsOpen(false); sfx.pop(); toast(t('house.kitAdded', { n }), 'ok', 'check'); }}>{t('common.add')}</Button>
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
