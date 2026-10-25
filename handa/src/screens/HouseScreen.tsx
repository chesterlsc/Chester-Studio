import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { Button, Icon, Meter, Sheet, toast } from '@/ui';
import { CATALOG } from '@/domain/catalog';
import { CATEGORIES, CATEGORY_SLOT, DURATION_DAYS, type CatalogItem, type CategoryId, type SlotId } from '@/domain/types';
import { SCENARIOS } from '@/domain/scenarios';
import { computeReadiness, headcount, nextSuggestion, targetQty } from '@/domain/readiness';
import { KITS } from '@/domain/kits';
import { useSession } from '@/store/useSession';
import { useSettings, motionAllowed } from '@/store/useSettings';
import { addItem, applyKit, setQty, useHousehold, useInventory } from '@/store/useInventory';
import { uid, upsert } from '@/store/db';
import { usePresentation } from '@/store/usePresentation';
import { pick } from '@/i18n';
import { sfx } from '@/lib/sound';
import { fmtDays, readinessColor } from '@/lib/format';
import { CAT_COLOR } from '@/scene/palette';
import { SLOTS } from '@/scene/slots';
import type { Burst } from '@/scene/Celebrate';
import type { IconName } from '@/design/icons/names';
import './screens.css';

const HouseScene = lazy(() => import('@/scene/HouseScene').then((m) => ({ default: m.HouseScene })));

const CAT_ICON: Record<CategoryId, IconName> = {
  water: 'cat-water', food: 'cat-food', canning: 'cat-canning', medicine: 'cat-medicine', baby: 'cat-baby', power: 'cat-power', shelter: 'cat-shelter', hygiene: 'cat-hygiene', comms: 'cat-comms', cash: 'cat-cash', edc: 'cat-edc', pets: 'cat-pets', security: 'cat-security',
};

export default function HouseScreen() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { scenario, duration, householdId, runId, finish } = useSession();
  const lowData = useSettings((s) => s.lowData);
  const bumpRuns = useSettings((s) => s.bumpRuns);
  const presentation = usePresentation((s) => s.active);
  const household = useHousehold(householdId);
  const inventory = useInventory(householdId);
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [kitsOpen, setKitsOpen] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [hintSeen, setHintSeen] = useState(false);
  const [doneBadge, setDoneBadge] = useState<string | null>(null);
  const prevPct = useRef<Partial<Record<CategoryId, number>>>({});
  const burstId = useRef(0);
  const [reduced] = useState(() => !motionAllowed());

  useEffect(() => { if (!scenario || !householdId) nav('/play', { replace: true }); }, [scenario, householdId, nav]);

  const readiness = useMemo(() => (household && scenario ? computeReadiness(household, scenario, duration, inventory) : null), [household, scenario, duration, inventory]);
  const relevantCats = useMemo(() => CATEGORIES.filter((c) => readiness?.categories[c]?.relevant), [readiness]);
  const categoryPct = useMemo(() => {
    const o: Partial<Record<CategoryId, number>> = {};
    for (const c of relevantCats) o[c] = readiness?.categories[c]?.pct ?? 0;
    return o;
  }, [readiness, relevantCats]);

  // default category = biggest gap
  useEffect(() => { if (!cat && readiness) setCat(readiness.missing[0] ?? relevantCats[0] ?? null); }, [cat, readiness, relevantCats]);

  // celebrate category completion
  useEffect(() => {
    if (!readiness) return;
    for (const c of relevantCats) {
      const now = readiness.categories[c].pct;
      const before = prevPct.current[c];
      if (before !== undefined && before < .99 && now >= .99) {
        const slot = CATEGORY_SLOT[c];
        const center = SLOTS[slot].center.clone().add(new THREE.Vector3(0, .9, 0));
        setBursts((b) => [...b, { id: ++burstId.current, position: center, color: CAT_COLOR[c] }]);
        setDoneBadge(t('house.categoryDone', { cat: t(`cat.${c}`) }));
        setTimeout(() => setDoneBadge(null), 2200);
        sfx.complete();
      }
      prevPct.current[c] = now;
    }
  }, [readiness, relevantCats, t]);

  const trayItems: CatalogItem[] = useMemo(() => {
    if (!cat || !household) return [];
    return CATALOG.filter((i) => i.category === cat && (!i.requires?.length || i.requires.some((r) => (household[r] ?? 0) > 0)));
  }, [cat, household]);
  const qtyOf = useCallback((id: string) => inventory.filter((r) => r.catalogId === id).reduce((n, r) => n + r.qty, 0), [inventory]);

  const add = async (item: CatalogItem) => {
    if (!householdId) return;
    sfx.drop();
    await addItem(householdId, item);
  };
  const minus = async (item: CatalogItem) => {
    const row = inventory.find((r) => r.catalogId === item.id);
    if (!row) return;
    sfx.tap();
    await setQty(row, Math.max(0, row.qty - (item.step ?? 1)));
  };

  const onSelectSlot = (slot: SlotId) => {
    const cats = relevantCats.filter((c) => CATEGORY_SLOT[c] === slot);
    const target = cats.find((c) => readiness?.missing.includes(c)) ?? cats[0];
    if (target) { setCat(target); sfx.tap(); }
  };

  const doKit = async (kitId: string) => {
    if (!householdId || !household) return;
    const n = await applyKit(householdId, kitId, headcount(household));
    setKitsOpen(false);
    sfx.pop();
    toast(t('house.kitAdded', { n }), 'ok', 'check');
  };

  const finishRun = async () => {
    if (!readiness || !runId || !householdId || !scenario) return;
    const now = Date.now();
    const categories: Partial<Record<CategoryId, number>> = {};
    for (const c of relevantCats) categories[c] = readiness.categories[c].pct;
    await upsert('scores', { id: uid(), runId, householdId, scenario, duration, pct: readiness.pct, daysCovered: readiness.daysCovered, categories, at: now, updatedAt: now });
    await finish(readiness.pct, readiness.daysCovered);
    bumpRuns();
    sfx.win();
    nav('/score');
  };

  // presentation mode: auto-stock
  useEffect(() => {
    if (!presentation || !household || !scenario || !readiness) return;
    if (readiness.pct >= 88) { const id = setTimeout(() => void finishRun(), 1600); return () => clearTimeout(id); }
    const id = setTimeout(async () => {
      const c = readiness.missing[0] ?? relevantCats[0];
      if (!c) return;
      setCat(c);
      const item = nextSuggestion(c, household, scenario, duration, inventory);
      if (item && householdId) await addItem(householdId, item, Math.max(item.step ?? 1, Math.ceil(targetQty(item, household, scenario, duration) / 3)));
    }, 520);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presentation, readiness]);

  if (!scenario || !household || !readiness) return <div className="house"><div className="house__loading">{t('common.loading')}</div></div>;
  const profile = SCENARIOS[scenario];
  const pct = readiness.pct;
  const focusSlot = cat ? CATEGORY_SLOT[cat] : null;
  const kits = KITS.filter((k) => k.scenarios.includes(scenario) && k.items.every((i) => CATALOG.some((c) => c.id === i.id)));

  return (
    <div className="house" onPointerDown={() => setHintSeen(true)}>
      <div className="house__top">
        <Button variant="secondary" iconOnly icon="back" aria-label={t('common.back')} onClick={() => nav('/play')} />
        <div className="house__meter">
          <div className="house__meter-row">
            <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t(`scenario.${scenario}`)} · {fmtDays(DURATION_DAYS[duration])}</span>
            <span style={{ whiteSpace: 'nowrap' }} title={t('house.days')}><Icon name="clock" size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} /><b className="mono">{fmtDays(readiness.daysCovered)}</b></span>
          </div>
          <Meter value={pct} color={readinessColor(pct)} size="lg" label={t('house.ready')} />
        </div>
        <div className="house__pct">{pct}%</div>
        <Button variant="secondary" iconOnly icon="help" aria-label={t('common.learnMore')} onClick={() => toast(t('house.tap3d'), undefined, 'bulb')} />
      </div>

      {lowData ? (
        <div className="house__list">
          <div className="hint" style={{ marginBottom: 'var(--s-4)' }}><Icon name="info" size={18} />{t('house.fallback2d')}</div>
          {relevantCats.map((c) => (
            <div key={c} className="lrow">
              <span className="lrow__icon" style={{ '--row-color': CAT_COLOR[c] } as React.CSSProperties}><Icon name={CAT_ICON[c]} /></span>
              <div className="grow"><div style={{ fontWeight: 600 }}>{t(`cat.${c}`)}</div><Meter value={(categoryPct[c] ?? 0) * 100} color={CAT_COLOR[c]} size="sm" /></div>
              <Button size="sm" onClick={() => setCat(c)}>{t('house.view')}</Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="house__canvas" style={{ background: profile.hue }}>
          <Suspense fallback={<div className="house__loading"><Icon name="house-cut" size={40} style={{ color: 'var(--brand)', animation: 'pulse 1.2s ease-in-out infinite' }} />{t('house.loading3d')}</div>}>
            <HouseScene scenario={scenario} inventory={inventory} categoryPct={categoryPct} missing={readiness.missing} focusSlot={focusSlot} onSelectSlot={onSelectSlot} reduced={reduced} bursts={bursts} onBurstDone={(id) => setBursts((b) => b.filter((x) => x.id !== id))} />
          </Suspense>
          {!hintSeen && <div className="house__hint"><Icon name="hand" size={14} />{t('house.rotate')} · {t('house.tap3d')}</div>}
          {doneBadge && <div className="fly-badge"><Icon name="check" size={16} />{doneBadge}</div>}
        </div>
      )}

      <div className="house__panel">
        <div className="cats no-scrollbar" role="tablist" aria-label={t('house.ready')}>
          {relevantCats.map((c) => {
            const p = Math.round((categoryPct[c] ?? 0) * 100);
            const done = p >= 99;
            return (
              <button key={c} type="button" role="tab" aria-selected={cat === c} className={`cat ${cat === c ? 'cat--on' : ''} ${done ? 'cat--done' : ''}`} style={{ '--cat-color': CAT_COLOR[c], '--p': p } as React.CSSProperties} onClick={() => { setCat(c); sfx.tap(); }}>
                <span className="cat__ring"><Icon name={done ? 'check' : CAT_ICON[c]} size={14} /></span>
                {t(`cat.${c}`)}
              </button>
            );
          })}
        </div>
        <div className="tray no-scrollbar">
          {trayItems.map((item) => {
            const have = qtyOf(item.id);
            const need = targetQty(item, household, scenario, duration);
            const done = have >= need;
            return (
              <div key={item.id} className={`item ${done ? 'item--done' : ''}`} style={{ '--cat-color': CAT_COLOR[item.category] } as React.CSSProperties}>
                <button type="button" className="item__add" aria-label={`${t('common.add')} ${pick(item.name)}`} onClick={() => void add(item)}><Icon name={done ? 'check' : 'plus'} size={18} /></button>
                <div className="item__top"><span className="item__shape"><Icon name={CAT_ICON[item.category]} size={18} /></span></div>
                <div className="item__name">{pick(item.name)}</div>
                <div className="item__have">
                  <span><b>{have}</b> / {need} {item.unit === 'php' ? '×₱500' : item.unit}</span>
                  {have > 0 && <button type="button" className="item__minus" aria-label={`${t('common.remove')} ${pick(item.name)}`} onClick={() => void minus(item)}><Icon name="minus" size={14} /></button>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="house__actions">
          <Button icon="bag" onClick={() => setKitsOpen(true)}>{t('house.kits')}</Button>
          <Button variant="primary" block icon="trophy" onClick={() => void finishRun()}>{t('house.finish')}</Button>
        </div>
      </div>

      <Sheet open={kitsOpen} onClose={() => setKitsOpen(false)} title={t('house.kits')}>
        <div className="stack">
          {kits.map((k) => (
            <div key={k.id} className="card row" style={{ gap: 'var(--s-4)' }}>
              <div className="opt__icon" style={{ '--opt-color': 'var(--brand)' } as React.CSSProperties}><Icon name="bag" /></div>
              <div className="grow">
                <div style={{ fontWeight: 700 }}>{pick(k.name)} {k.tier === 'plus' && <span className="badge badge--brand">Handa+</span>}</div>
                <div className="small muted">{pick(k.blurb)}</div>
              </div>
              <Button size="sm" variant="primary" onClick={() => void doKit(k.id)}>{t('common.add')}</Button>
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

