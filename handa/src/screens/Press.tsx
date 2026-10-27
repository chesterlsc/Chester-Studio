import { lazy, Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Icon, TopBar, toast } from '@/ui';
import { db, uid, upsert } from '@/store/db';
import { useSession } from '@/store/useSession';
import { usePresentation } from '@/store/usePresentation';
import { addItems } from '@/store/useInventory';
import { catalogById } from '@/domain/catalog';
import { HouseArt } from './HouseArt';
import './screens.css';

const GameHero = lazy(() => import('./GameHero').then((m) => ({ default: m.GameHero })));

const DEMO: Array<[string, number]> = [
  ['water-bottle-1l', 12], ['water-gallon-5', 3], ['water-drum', 1], ['rice-kg', 5], ['canned-sardines', 12], ['canned-meat', 6], ['instant-noodles', 10], ['biscuits', 6],
  ['first-aid-kit', 1], ['paracetamol', 2], ['ors', 4], ['flashlight', 2], ['batteries', 3], ['powerbank', 2], ['solar-panel', 1], ['radio', 1], ['documents', 1], ['whistle', 3], ['cash-small', 10], ['go-bag', 3], ['tarp', 1], ['rope', 1], ['duct-tape', 2], ['soap', 2], ['tissue', 8], ['diapers', 2], ['formula', 2], ['fire-extinguisher', 1],
];

async function loadDemo(): Promise<string> {
  const now = Date.now();
  const id = 'demo-household';
  await upsert('households', { id, name: 'Demo home', adults: 2, kids: 1, babies: 1, seniors: 1, pets: 1, specialNeeds: [], createdAt: now, updatedAt: now });
  await db.inventory.where('householdId').equals(id).delete();
  await addItems(id, DEMO.flatMap(([cid, qty]) => { const item = catalogById(cid); return item ? [{ item, qty }] : []; }));
  return id;
}

export default function Press() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const session = useSession();
  const setPresentation = usePresentation((s) => s.set);

  const demo = async () => {
    const id = await loadDemo();
    useSession.setState({ householdId: id, scenario: 'typhoon', duration: '1w', draft: { name: 'Demo home', adults: 2, kids: 1, babies: 1, seniors: 1, pets: 1, specialNeeds: [] } });
    const runId = uid(); const now = Date.now();
    await upsert('runs', { id: runId, householdId: id, scenario: 'typhoon', duration: '1w', startedAt: now, updatedAt: now });
    useSession.setState({ runId });
    toast(t('press.demo'), 'ok', 'check');
    nav('/house');
  };
  const present = async () => {
    const now = Date.now();
    const id = 'demo-household';
    await upsert('households', { id, name: 'Demo home', adults: 2, kids: 1, babies: 1, seniors: 1, pets: 1, specialNeeds: [], createdAt: now, updatedAt: now });
    await db.inventory.where('householdId').equals(id).delete();
    const runId = uid();
    await upsert('runs', { id: runId, householdId: id, scenario: session.scenario ?? 'typhoon', duration: '1w', startedAt: now, updatedAt: now });
    useSession.setState({ householdId: id, scenario: session.scenario ?? 'typhoon', duration: '1w', runId });
    setPresentation(true);
    nav('/house');
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPresentation(false); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [setPresentation]);

  return (
    <div className="page page--wide">
      <TopBar title={t('press.title')} onBack={() => nav('/')} />
      <p className="muted" style={{ marginBottom: 'var(--s-6)' }}>{t('press.sub')}</p>
      <div className="actions-2" style={{ marginBottom: 'var(--s-8)' }}>
        <Button variant="primary" size="lg" icon="inventory" onClick={() => void demo()}>{t('press.demo')}</Button>
        <Button size="lg" icon="play" onClick={() => void present()}>{t('press.present')}</Button>
      </div>
      <p className="xs muted" style={{ marginTop: 'calc(-1 * var(--s-6))', marginBottom: 'var(--s-8)' }}>{t('press.presentSub')}</p>

      <div className="devices">
        <div className="device">
          <div className="device__screen game-hero__box" style={{ borderRadius: 0, aspectRatio: 'auto', display: 'grid', placeItems: 'center' }}>
            <Suspense fallback={null}><GameHero /></Suspense>
          </div>
        </div>
        <div className="device">
          <div className="device__screen" style={{ background: 'var(--bg)', padding: '64px 20px 20px', display: 'grid', alignContent: 'start', gap: 16 }}>
            <div className="eyebrow">{t('landing.eyebrow')}</div>
            <h2 className="device__h2">{t('landing.h1a')}<br />{t('landing.h1b')}<br /><span style={{ color: 'var(--brand)' }}>{t('landing.h1c')}</span></h2>
            <HouseArt />
            <Button variant="primary" size="lg" icon="play">{t('landing.cta')}</Button>
          </div>
        </div>
      </div>

      <section className="card stack-2" style={{ marginTop: 'var(--s-8)' }}>
        <div className="eyebrow">{t('press.facts')}</div>
        {['f1', 'f2', 'f3', 'f4'].map((k) => <div key={k} className="row small"><Icon name="check" size={16} style={{ color: 'var(--ok)' }} />{t(`press.${k}`)}</div>)}
        <div className="row" style={{ marginTop: 'var(--s-3)', gap: 'var(--s-4)' }}>
          <svg width="56" height="56" viewBox="0 0 64 64" aria-label={t('press.logo')}><path d="M8 32 32 10l24 22v22H8z" fill="#ff6a1a" /><path d="M26 54V36h12v18" fill="var(--bg)" /></svg>
          <div className="small muted">{t('press.contact')}: <a href="mailto:hello@prepare.ph" className="press__mail">hello@prepare.ph</a></div>
        </div>
      </section>
    </div>
  );
}
