import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Meter, Ring, Sheet, Stepper, toast } from '@/ui';
import { catalogById } from '@/domain/catalog';
import { CATEGORIES, DURATION_DAYS, type CatalogItem, type CategoryId, type InventoryRow } from '@/domain/types';
import { SCENARIOS } from '@/domain/scenarios';
import { CATEGORY_ROOM, ROOMS, ROOM_ORDER, roomCategories, type RoomId } from '@/domain/rooms';
import { computeReadiness, headcount, targetQty } from '@/domain/readiness';
import { KITS } from '@/domain/kits';
import { useSession } from '@/store/useSession';
import { useSettings, motionAllowed } from '@/store/useSettings';
import { addItem, applyKit, setExpiry, setQty, useHousehold, useInventory } from '@/store/useInventory';
import { uid, upsert } from '@/store/db';
import { usePresentation } from '@/store/usePresentation';
import { pick } from '@/i18n';
import { sfx } from '@/lib/sound';
import { fmtDate, fmtDays, readinessColor } from '@/lib/format';
import { CAT_COLOR } from '@/scene/palette';
import { ITEM_STORE_TIPS, ROOM_FACTS, STORAGE_GUIDES, linksFor, AFFILIATE_DISCLOSURE } from '@/content';
import { SimChart } from '@/plan/SimChart';
import { simulate } from '@/plan/simulation';
import type { IconName } from '@/design/icons/names';
import { LAYOUTS, slotAt, type Unit } from './layouts';
import { RoomScene, type PlacedSprite } from './RoomScene';
import { HouseMap } from './HouseMap';
import { ItemArt, ItemHero, use3dArt } from './ItemArt';
import { missionsFor, roomItems, roomMissions, type Mission } from './missions';
import { levelFor, useProgress } from './progress';
import './game.css';

const CAT_ICON: Record<CategoryId, IconName> = { water: 'cat-water', food: 'cat-food', canning: 'cat-canning', medicine: 'cat-medicine', baby: 'cat-baby', power: 'cat-power', shelter: 'cat-shelter', hygiene: 'cat-hygiene', comms: 'cat-comms', cash: 'cat-cash', edc: 'cat-edc', pets: 'cat-pets', security: 'cat-security' };
type Card = { kind: 'tip' | 'fact' | 'mistake' | 'done'; title: string; body: string; icon: IconName };

function unitFor(item: CatalogItem): Unit {
  const room = CATEGORY_ROOM[item.category]; const L = LAYOUTS[room];
  const pref = L.unitFor?.[item.category];
  let u = pref ? L.units.find((x) => x.id === pref) : undefined;
  if (room === 'water') u = ['drum', 'gallon', 'bottle'].includes(item.shape) ? L.units[0] : L.units[1];
  if (room === 'entry') u = item.shape === 'bag' || item.category === 'edc' && ['rain-gear', 'go-bag'].includes(item.id) ? L.units[0] : L.units[1];
  return u ?? L.units[0];
}

export default function GameScreen() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { scenario, duration, householdId, runId, finish } = useSession();
  const bumpRuns = useSettings((s) => s.bumpRuns);
  const presentation = usePresentation((s) => s.active);
  const prog = useProgress();
  const household = useHousehold(householdId);
  const inventory = useInventory(householdId);
  const [room, setRoom] = useState<RoomId | null>(null);
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [card, setCard] = useState<Card | null>(null);
  const [cele, setCele] = useState<{ title: string; body: string; icon: IconName } | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [inspect, setInspect] = useState<PlacedSprite | null>(null);
  const art3d = use3dArt();
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [simOpen, setSimOpen] = useState(false);
  const [kitsOpen, setKitsOpen] = useState(false);
  const [hintSeen, setHintSeen] = useState(false);
  const [lightsToggle, setLightsToggle] = useState(true);
  const [info, setInfo] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const prevDone = useRef<Set<string> | null>(null);
  const prevLevel = useRef<number | null>(null);
  const [motion] = useState(() => motionAllowed());

  useEffect(() => { if (!scenario || !householdId) nav('/play', { replace: true }); }, [scenario, householdId, nav]);
  useEffect(() => { setCard(null); }, [room]);
  useEffect(() => { if (!card) return; const id = setTimeout(() => setCard(null), card.kind === 'mistake' ? 9000 : 6500); return () => clearTimeout(id); }, [card]);

  const readiness = useMemo(() => (household && scenario ? computeReadiness(household, scenario, duration, inventory) : null), [household, scenario, duration, inventory]);
  const missions = useMemo(() => (household && scenario && readiness ? missionsFor(household, scenario, duration, inventory, readiness) : []), [household, scenario, duration, inventory, readiness]);
  const roomPct = useMemo(() => { const o: Partial<Record<RoomId, number>> = {}; for (const r of ROOM_ORDER) { const cats = roomCategories(r).filter((c) => readiness?.categories[c]?.relevant); o[r] = cats.length ? cats.reduce((n, c) => n + (readiness?.categories[c]?.pct ?? 0), 0) / cats.length : 1; } return o; }, [readiness]);
  const missingCount = useMemo(() => { const o: Partial<Record<RoomId, number>> = {}; for (const r of ROOM_ORDER) o[r] = roomCategories(r).filter((c) => readiness?.missing.includes(c)).length; return o; }, [readiness]);

  const placedByRoom = useMemo(() => {
    const rows = [...inventory].sort((a, b) => a.createdAt - b.createdAt);
    const count = new Map<string, number>(); const o: Partial<Record<RoomId, PlacedSprite[]>> = {};
    for (const r of rows) {
      const item = catalogById(r.catalogId); if (!item || r.qty <= 0) continue;
      const rm = CATEGORY_ROOM[item.category]; const u = unitFor(item);
      const slot = count.get(u.id) ?? 0; count.set(u.id, slot + 1);
      (o[rm] ??= []).push({ key: r.id, catalogId: r.catalogId, shape: item.shape, category: item.category, color: CAT_COLOR[item.category], unitId: u.id, slot, qty: Math.round(r.qty), name: pick(item.name), expiresAt: r.expiresAt });
    }
    return o;
  }, [inventory]);

  const items = useMemo(() => (room && household && readiness ? roomItems(room, household, readiness) : []), [room, household, readiness]);
  const visibleItems = cat ? items.filter((i) => i.category === cat) : items;
  const qtyOf = useCallback((id: string) => inventory.filter((r) => r.catalogId === id).reduce((n, r) => n + r.qty, 0), [inventory]);
  const level = levelFor(prog.xp);
  const profile = scenario ? SCENARIOS[scenario] : null;
  const powerUnits = inventory.filter((r) => catalogById(r.catalogId)?.category === 'power').reduce((n, r) => n + r.qty, 0);
  const brownout = scenario === 'brownout';
  const lightsOn = brownout ? powerUnits >= 3 && lightsToggle : lightsToggle;
  const flicker = brownout && powerUnits > 0 && powerUnits < 3;

  /* ---------- mission + level tracking ---------- */
  useEffect(() => {
    if (!missions.length) return;
    const done = new Set(missions.filter((m) => m.done).map((m) => m.id));
    if (prevDone.current) {
      for (const id of done) if (!prevDone.current.has(id) && !prog.missionsDone[id]) {
        const m = missions.find((x) => x.id === id)!;
        prog.completeMission(id); prog.addXp(m.xp);
        if (m.kind === 'complete-room') { sfx.win(); setConfetti((c) => c + 1); setCele({ title: t('game.roomDone'), body: t('game.roomDoneSub', { room: t(`room.${m.room}`), scenario: t(`scenario.${scenario}`), days: fmtDays(DURATION_DAYS[duration]) }), icon: 'trophy' }); }
        else if (m.kind === 'complete-category') { sfx.complete(); const fact = ROOM_FACTS[m.room]?.[0]; setCard({ kind: 'done', title: t('game.categoryDone', { cat: t(`cat.${m.category}`) }), body: `${t('game.mission.reward', { xp: m.xp })}${fact ? ' · ' + pick(fact) : ''}`, icon: 'medal' }); }
        else toast(t('game.mission.reward', { xp: m.xp }), 'ok', 'star');
      }
    }
    prevDone.current = done;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missions]);
  useEffect(() => {
    if (prevLevel.current !== null && level.level > prevLevel.current) { sfx.win(); setConfetti((c) => c + 1); setCele({ title: t('game.levelUp'), body: t('game.levelUpSub', { level: level.level }), icon: 'streak' }); }
    prevLevel.current = level.level;
  }, [level.level, t]);

  /* ---------- enter a room: mistake card the first time ---------- */
  const enterRoom = (r: RoomId) => {
    setRoom(r); setCat(null); sfx.tap(); setHintSeen(false);
    const guide = STORAGE_GUIDES[r];
    if (!prog.roomsVisited[r] && guide) {
      prog.visitRoom(r); prog.addXp(15);
      setTimeout(() => setCard({ kind: 'mistake', title: t(`room.${r}`), body: pick(guide.never[0]), icon: 'warning' }), 700);
    }
  };

  /* ---------- fly from tray to slot ---------- */
  const fly = (fromEl: HTMLElement | null, item: CatalogItem) => {
    const st = stage.current; const svg = st?.querySelector('svg.room') as SVGSVGElement | null; if (!st || !svg || !fromEl) return;
    const u = unitFor(item);
    const existing = (placedByRoom[CATEGORY_ROOM[item.category]] ?? []).find((p) => p.catalogId === item.id);
    const slot = existing ? existing.slot : (placedByRoom[CATEGORY_ROOM[item.category]] ?? []).filter((p) => p.unitId === u.id).length;
    const s = slotAt(u, slot);
    const m = svg.getScreenCTM(); if (!m) return;
    const pt = new DOMPoint(s.x, s.y - 20).matrixTransform(m);
    const sr = st.getBoundingClientRect(); const fr = fromEl.getBoundingClientRect();
    const el = document.createElement('div'); el.className = 'g__fly';
    const glyph = fromEl.closest('.gi')?.querySelector('svg');
    if (glyph) { el.innerHTML = glyph.outerHTML; const g = el.querySelector('svg')!; g.setAttribute('width', '64'); g.setAttribute('height', '70'); }
    st.appendChild(el);
    const sx = fr.left - sr.left + fr.width / 2 - 32, sy = fr.top - sr.top + fr.height / 2 - 35;
    const dx = pt.x - sr.left - 32, dy = pt.y - sr.top - 35;
    const a = el.animate([{ transform: `translate(${sx}px, ${sy}px) scale(1) rotate(0deg)`, opacity: 1 }, { transform: `translate(${(sx + dx) / 2}px, ${Math.min(sy, dy) - 120}px) scale(1.15) rotate(-12deg)`, opacity: 1, offset: .5 }, { transform: `translate(${dx}px, ${dy}px) scale(.7) rotate(0deg)`, opacity: .9 }], { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' });
    a.onfinish = () => el.remove();
    // xp float
    const xp = document.createElement('div'); xp.className = 'g__xp'; xp.textContent = t('game.placed', { xp: 10 }); xp.style.left = `${dx + 10}px`; xp.style.top = `${dy}px`;
    st.appendChild(xp); setTimeout(() => xp.remove(), 1200);
  };

  const add = async (item: CatalogItem, fromEl?: HTMLElement | null) => {
    if (!householdId) return;
    sfx.drop(); if (motion) fly(fromEl ?? null, item);
    const row = await addItem(householdId, item);
    prog.addXp(10);
    setFresh(new Set([row.id])); setTimeout(() => setFresh(new Set()), 700);
    if (!prog.tipsSeen[item.id]) { prog.seeTip(item.id); const tip = ITEM_STORE_TIPS[item.id]; if (tip) setTimeout(() => setCard({ kind: 'tip', title: pick(item.name), body: pick(tip), icon: 'bulb' }), 650); }
    try { navigator.vibrate?.(8); } catch { /* ignore */ }
  };
  const minus = async (item: CatalogItem) => { const row = inventory.find((r) => r.catalogId === item.id); if (!row) return; sfx.tap(); await setQty(row, Math.max(0, row.qty - (item.step ?? 1))); };

  const finishRun = async () => {
    if (!readiness || !runId || !householdId || !scenario) return;
    const now = Date.now(); const categories: Partial<Record<CategoryId, number>> = {};
    for (const c of CATEGORIES) if (readiness.categories[c].relevant) categories[c] = readiness.categories[c].pct;
    await upsert('scores', { id: uid(), runId, householdId, scenario, duration, pct: readiness.pct, daysCovered: readiness.daysCovered, categories, at: now, updatedAt: now });
    await finish(readiness.pct, readiness.daysCovered); bumpRuns(); prog.addXp(100); sfx.win(); nav('/score');
  };

  /* ---------- presentation: auto-play rooms ---------- */
  useEffect(() => {
    if (!presentation || !household || !scenario || !readiness) return;
    if (readiness.pct >= 85) { const id = setTimeout(() => void finishRun(), 2600); return () => clearTimeout(id); }
    const id = setTimeout(async () => {
      const m = missions.find((x) => !x.done && x.kind === 'stock'); if (!m || !m.item || !householdId) return;
      if (room !== m.room) { setRoom(m.room); return; }
      await addItem(householdId, m.item, Math.max(m.item.step ?? 1, Math.ceil((m.need - m.have) / 2)));
    }, room ? 650 : 1400);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentation, readiness, room]);

  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { setCard(null); setCele(null); if (room) setRoom(null); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [room]);

  if (!scenario || !household || !readiness || !profile) return <div className="g"><div className="page muted">{t('common.loading')}</div></div>;
  const pct = readiness.pct;
  const weather = profile.weather;
  const guide = room ? STORAGE_GUIDES[room] : null;
  const rm = room ? roomMissions(missions, room) : [];
  const nextMoves = missions.filter((m) => !m.done && m.kind === 'stock').sort((a, b) => (profile.weights[b.category] ?? 1) * (1 - b.have / b.need) - (profile.weights[a.category] ?? 1) * (1 - a.have / a.need)).slice(0, 3);
  const totalDone = missions.filter((m) => m.done).length;
  const roomCats = room ? roomCategories(room).filter((c) => readiness.categories[c]?.relevant) : [];
  const kits = KITS.filter((k) => k.scenarios.includes(scenario));

  return (
    <div className="g">
      <div className="g__hud">
        <Button variant="secondary" iconOnly icon={room ? 'home' : 'back'} aria-label={room ? t('game.back') : t('common.back')} onClick={() => (room ? setRoom(null) : nav('/play'))} />
        <div className="g__meter">
          <div className="g__meter-row"><span className="t"><Icon name={scenario} size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />{t(`scenario.${scenario}`)} · {fmtDays(DURATION_DAYS[duration])} · {t('common.people', { count: headcount(household) })}</span><span><b>{pct}%</b> <span className="xs">· {fmtDays(readiness.daysCovered)}</span></span></div>
          <Meter value={pct} color={readinessColor(pct)} />
        </div>
        <button type="button" className="g__lvl" onClick={() => setMissionsOpen(true)} aria-label={t('game.missions')}>
          <Ring value={level.pct * 100} size={30} stroke={4}><b style={{ fontSize: 11 }}>{level.level}</b></Ring>
          <span><b>{prog.xp}</b> XP</span>
        </button>
        <Button variant="primary" iconOnly icon="trophy" aria-label={t('game.finish')} onClick={() => void finishRun()} />
      </div>

      <div className={`g__stage ${room ? 'g__stage--room' : ''}`} ref={stage} onPointerDown={() => setHintSeen(true)}>
        {room ? (
          <RoomScene room={room} placed={placedByRoom[room] ?? []} weather={weather} lightsOn={lightsOn} flicker={flicker} freshKeys={fresh} selectedKey={inspect?.key ?? null} highlightUnit={cat ? unitFor(items.find((i) => i.category === cat) ?? items[0])?.id : null} accent={ROOMS[room].hue} onTapItem={(p) => { sfx.tap(); setInspect(p); }} unitLabel={(u) => t(`game.unit.${u.label}`)} unitNote={(u) => t(`game.note.${u.note}`)} info={info} art={art3d ? '3d' : 'vector'} />
        ) : (
          <HouseMap placedByRoom={placedByRoom} roomPct={roomPct} missingCount={missingCount} weather={weather} lightsOn={lightsOn} flicker={flicker} onSelect={enterRoom} art={art3d ? '3d' : 'vector'} label={(r) => t(`room.${r}`)} />
        )}
        {room && (
          <div className="g__roomname">
            <span className="pill"><Icon name="house-cut" size={16} />{t(`room.${room}`)}<span className="mono" style={{ color: readinessColor((roomPct[room] ?? 0) * 100) }}>{Math.round((roomPct[room] ?? 0) * 100)}%</span></span>
          </div>
        )}
        <div className="g__side">
          {room && <Button iconOnly icon="book" size="sm" aria-label={t('game.rules')} onClick={() => setRulesOpen(true)} />}
          {room && <Button iconOnly icon="info" size="sm" aria-label={t('game.info')} aria-pressed={info} className={info ? 'btn--on' : ''} onClick={() => setInfo((v) => !v)} />}
          <Button iconOnly icon="flag" size="sm" aria-label={t('game.missions')} onClick={() => setMissionsOpen(true)} />
          <Button iconOnly icon="clock" size="sm" aria-label={t('game.survival')} onClick={() => setSimOpen(true)} />
          <Button iconOnly icon={lightsToggle ? 'sun' : 'moon'} size="sm" aria-label={t('game.dayNight')} onClick={() => setLightsToggle((v) => !v)} />
        </div>
        {!hintSeen && !presentation && <div className={`g__hint ${room ? '' : 'g__hint--top'}`}><Icon name="hand" size={14} />{room ? t('game.hintRoom') : t('game.hint')}</div>}
        {card && (
          <div className={`pc pc--${card.kind}`} role="status" key={card.title + card.body} onClick={() => { if (room && card.kind !== 'tip') { setCard(null); setRulesOpen(true); } }}>
            <div className="pc__i"><Icon name={card.icon} size={22} /></div>
            <div><div className="pc__k">{t(card.kind === 'tip' ? 'game.tip' : card.kind === 'fact' ? 'game.fact' : card.kind === 'mistake' ? 'game.mistake' : 'game.categoryDone', { cat: '' })}</div><div className="pc__t">{card.title}</div><div className="pc__b">{card.body}</div></div>
            <button type="button" className="pc__x" aria-label={t('common.close')} onClick={(e) => { e.stopPropagation(); setCard(null); }}><Icon name="close" size={18} /></button>
          </div>
        )}
        {confetti > 0 && motion && <div className="confetti" key={confetti}>{Array.from({ length: 60 }).map((_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, background: ['#ff6a1a', '#3ddc97', '#ffc247', '#5ea8ff', '#ff6f8d', '#fff'][i % 6], animationDelay: `${(i * 41) % 600}ms`, transform: `rotate(${i * 23}deg)` }} />)}</div>}
      </div>

      {/* ---- bottom: tray or map missions ---- */}
      <div className="g__tray">
        {room ? (
          <>
            <div className="g__traytop"><span className="eyebrow">{t('game.tray')}</span><Button size="sm" variant="ghost" icon="bag" onClick={() => setKitsOpen(true)}>{t('house.kits')}</Button></div>
            {roomCats.length > 1 && (
              <div className="g__cats">
                <button type="button" className={`g__cat ${!cat ? 'g__cat--on' : ''}`} style={{ '--cat-color': ROOMS[room].hue } as React.CSSProperties} onClick={() => setCat(null)}><i />{t('common.seeAll')}</button>
                {roomCats.map((c) => <button key={c} type="button" className={`g__cat ${cat === c ? 'g__cat--on' : ''}`} style={{ '--cat-color': CAT_COLOR[c] } as React.CSSProperties} onClick={() => setCat(c)}><i />{t(`cat.${c}`)} · {Math.round(readiness.categories[c].pct * 100)}%</button>)}
              </div>
            )}
            <div className="g__items">
              {visibleItems.map((item) => {
                const have = qtyOf(item.id), need = targetQty(item, household, scenario, duration), done = have >= need;
                const hot = nextMoves[0]?.item?.id === item.id;
                return (
                  <div key={item.id} className={`gi ${done ? 'gi--done' : ''} ${hot ? 'gi--hot' : ''}`}>
                    {hot && !done && <span className="gi__hot">{t('game.nextMove')}</span>}
                    <button type="button" className="gi__add" aria-label={`${t('common.add')} ${pick(item.name)}`} onClick={(e) => void add(item, e.currentTarget)}><Icon name={done ? 'check' : 'plus'} size={16} /></button>
                    <div className="gi__art"><ItemArt itemId={item.id} shape={item.shape} color={CAT_COLOR[item.category]} size={60} /></div>
                    <div className="gi__name">{pick(item.name)}</div>
                    <div className="gi__have"><span><b>{have}</b> / {need} {item.unit === 'php' ? '×₱500' : item.unit}</span>{have > 0 && <button type="button" className="gi__minus" aria-label={t('game.remove')} onClick={() => void minus(item)}><Icon name="minus" size={12} /></button>}</div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="g__traytop"><span className="eyebrow">{t('game.nextMove')}</span><span className="xs mono muted">{t('game.progress', { done: totalDone, total: missions.length })}</span></div>
            <div className="g__items">
              {nextMoves.length === 0 && <div className="gi" style={{ width: 'auto', gridTemplateRows: 'none', alignItems: 'center' }}><Icon name="check" style={{ color: 'var(--ok)' }} /> {t('game.allDone')}</div>}
              {nextMoves.map((m) => (
                <button key={m.id} type="button" className="gi gi--hot" style={{ width: 200, gridTemplateRows: '64px auto auto' }} onClick={() => enterRoom(m.room)}>
                  <div className="gi__art"><ItemArt itemId={m.item!.id} shape={m.item!.shape} color={CAT_COLOR[m.category]} size={60} /></div>
                  <div className="gi__name">{t('game.mission.stock', { need: m.need - m.have, item: pick(m.item!.name) })}</div>
                  <div className="gi__have"><span>{t(`room.${m.room}`)}</span><span className="mi__xp">+{m.xp} XP</span></div>
                </button>
              ))}
              <button type="button" className="gi" style={{ width: 150, gridTemplateRows: 'none', placeItems: 'center' }} onClick={() => setSimOpen(true)}><Icon name="clock" size={24} /><span className="gi__name" style={{ textAlign: 'center', minHeight: 0 }}>{t('game.survival')}</span></button>
            </div>
          </>
        )}
      </div>

      {/* ---- sheets ---- */}
      <Sheet open={!!inspect} onClose={() => setInspect(null)} title={inspect?.name}>
        {inspect && (() => {
          const item = catalogById(inspect.catalogId)!; const row = inventory.find((r) => r.id === inspect.key) as InventoryRow | undefined;
          const need = targetQty(item, household, scenario, duration); const u = unitFor(item); const links = item.buy ? linksFor(item.buy) : undefined;
          return (
            <div className="stack">
              <div className="row" style={{ gap: 'var(--s-4)' }}>
                <ItemHero itemId={item.id} shape={item.shape} color={CAT_COLOR[item.category]} label={pick(item.name)} qty={row?.qty ?? 1} />
                <div className="grow stack-2">
                  <div className="row row--between"><span className="small muted">{t('plan.have')} / {t('plan.need')}</span><span className="mono"><b>{row?.qty ?? 0}</b> / {need} {item.unit}</span></div>
                  {row && <Stepper value={row.qty} min={0} max={999} onChange={(v) => void setQty(row, v)} label={t('stock.qty')} />}
                </div>
              </div>
              <div className="card stack-2" style={{ padding: 'var(--s-3) var(--s-4)' }}>
                <div className="eyebrow">{t('game.storeHere')}</div>
                <div style={{ fontWeight: 600 }}>{t(`room.${CATEGORY_ROOM[item.category]}`)} · {t(`game.unit.${u.label}`)}</div>
                <p className="small muted">{pick(ITEM_STORE_TIPS[item.id])}</p>
              </div>
              <label className="field"><span className="field__label">{t('game.expires')}</span><input type="date" className="input" value={row?.expiresAt ? new Date(row.expiresAt).toISOString().slice(0, 10) : ''} onChange={(e) => row && void setExpiry(row, e.target.value ? new Date(e.target.value).getTime() : undefined)} /><span className="xs muted">{row?.expiresAt ? fmtDate(row.expiresAt) : t('game.noExpiry')}</span></label>
              {links && <div className="stack-2"><div className="eyebrow">{t('game.buy')}</div><div className="chips">{([['Shopee', links.shopee], ['Lazada', links.lazada], ['TikTok Shop', links.tiktok]] as Array<[string, string | undefined]>).filter((x) => x[1]).map(([l, url]) => <a key={l} href={url} target="_blank" rel="noopener noreferrer sponsored" className="chip">{l}<Icon name="external" size={12} /></a>)}</div><p className="xs muted">{pick(AFFILIATE_DISCLOSURE)}</p></div>}
            </div>
          );
        })()}
      </Sheet>
      <Sheet open={missionsOpen} onClose={() => setMissionsOpen(false)} title={t('game.missions')}>
        <div className="stack">
          <div className="row row--between"><span className="small muted">{t('game.level')} {level.level} · {prog.xp} XP</span><span className="xs mono muted">{t('game.toNext', { n: Math.max(0, level.next - prog.xp) })}</span></div>
          <Meter value={level.pct * 100} />
          <div className="mis">
            {(room ? rm : missions.filter((m) => !m.done).slice(0, 12)).map((m: Mission) => (
              <button type="button" key={m.id} className={`mi ${m.done ? 'mi--done' : ''}`} onClick={() => { setMissionsOpen(false); enterRoom(m.room); }}>
                <span className="mi__chk"><Icon name={m.done ? 'check' : CAT_ICON[m.category]} size={14} /></span>
                <span style={{ textAlign: 'left', minWidth: 0 }}>
                  <span style={{ display: 'block' }}>{m.kind === 'stock' ? t('game.mission.stock', { need: m.need, item: pick(m.item!.name) }) : m.kind === 'complete-category' ? t('game.mission.cat', { cat: t(`cat.${m.category}`) }) : t('game.mission.room', { room: t(`room.${m.room}`) })}</span>
                  <span className="xs muted">{t(`room.${m.room}`)}</span>
                  <span className="mi__bar"><i style={{ width: `${Math.min(100, (m.have / m.need) * 100)}%`, background: CAT_COLOR[m.category] }} /></span>
                </span>
                <span className="mi__xp">{m.done ? t('game.mission.done') : `+${m.xp} XP`}</span>
              </button>
            ))}
          </div>
        </div>
      </Sheet>
      <Sheet open={rulesOpen} onClose={() => setRulesOpen(false)} title={room ? `${t('game.rules')} · ${t(`room.${room}`)}` : ''}>
        {guide && room && (
          <div className="stack">
            <div className="card" style={{ padding: 'var(--s-3) var(--s-4)' }}><div className="eyebrow">{t('game.climate')}</div><p>{pick(guide.climate)}</p><p className="xs muted" style={{ marginTop: 4 }}>{t('game.checks')}: {pick(guide.cadence)}</p></div>
            <div>{guide.rules.map((r, i) => <div key={i} className="rule"><Icon name={r.icon} size={18} style={{ color: ROOMS[room].hue, marginTop: 2 }} /><div><b>{pick(r.title)}</b><span>{pick(r.body)}</span></div></div>)}</div>
            <div className="eyebrow">{t('plan.never')}</div>
            <div>{guide.never.map((n, i) => <div key={i} className="never"><Icon name="close" size={16} />{pick(n)}</div>)}</div>
            <div className="eyebrow">{t('game.fact')}</div>
            <div>{ROOM_FACTS[room].map((f, i) => <p key={i} className="small" style={{ padding: '4px 0' }}>{i + 1}. {pick(f)}</p>)}</div>
            <div className="chips">{guide.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="chip">{s.label}<Icon name="external" size={12} /></a>)}</div>
          </div>
        )}
      </Sheet>
      <Sheet open={simOpen} onClose={() => setSimOpen(false)} title={t('game.survival')}><p className="small muted" style={{ marginBottom: 'var(--s-3)' }}>{t('game.survivalSub', { scenario: t(`scenario.${scenario}`) })}</p><SimChart sim={simulate(household, scenario, duration, inventory)} /></Sheet>
      <Sheet open={kitsOpen} onClose={() => setKitsOpen(false)} title={t('house.kits')}>
        <div className="stack">{kits.map((k) => (
          <div key={k.id} className="card row" style={{ gap: 'var(--s-4)' }}>
            <div className="opt__icon" style={{ '--opt-color': 'var(--brand)' } as React.CSSProperties}><Icon name="bag" /></div>
            <div className="grow"><div style={{ fontWeight: 700 }}>{pick(k.name)}</div><div className="small muted">{pick(k.blurb)}</div></div>
            <Button size="sm" variant="primary" onClick={async () => { if (!householdId) return; const n = await applyKit(householdId, k.id, headcount(household)); setKitsOpen(false); sfx.pop(); prog.addXp(5 * n); toast(t('house.kitAdded', { n }), 'ok', 'check'); }}>{t('common.add')}</Button>
          </div>
        ))}</div>
      </Sheet>
      {cele && (
        <div className="cele" onClick={() => setCele(null)}>
          <div className="cele__card" onClick={(e) => e.stopPropagation()}>
            <div className="cele__i"><Icon name={cele.icon} size={40} /></div>
            <h2>{cele.title}</h2>
            <p className="muted">{cele.body}</p>
            <Button variant="primary" onClick={() => setCele(null)}>{t('game.gotIt')}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
