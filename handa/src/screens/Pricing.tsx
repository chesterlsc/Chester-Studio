import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Icon, Sheet, toast, TopBar } from '@/ui';
import { TIERS } from '@/domain/tiers';
import { useAuth } from '@/sync/useAuth';
import { kv } from '@/native/storage';
import './screens.css';

export default function Pricing() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const tier = useAuth((s) => s.tier);
  const [soon, setSoon] = useState(false);
  const feats = (k: string) => t(k, { returnObjects: true }) as string[];
  const Tier = ({ id, title, price, features, hi }: { id: string; title: string; price: React.ReactNode; features: string[]; hi?: boolean }) => (
    <div className={`tier ${hi ? 'tier--hi' : ''}`}>
      <div className="row row--between"><h3>{title}</h3>{tier === id && <Badge kind="ok">{t('pricing.current')}</Badge>}</div>
      <div className="tier__price">{price}</div>
      <ul>{features.map((f) => <li key={f}><Icon name="check" size={16} />{f}</li>)}</ul>
      {hi && <Button variant="primary" block onClick={() => setSoon(true)}>{t('pricing.cta')}</Button>}
    </div>
  );
  return (
    <div className="page page--wide">
      <TopBar title={t('pricing.title')} onBack={() => nav(-1)} />
      <p className="muted" style={{ marginBottom: 'var(--s-6)' }}>{t('pricing.sub')}</p>
      <div className="tiers stack">
        <Tier id="guest" title={t('pricing.guest')} price={t('pricing.guestPrice')} features={feats('pricing.guestF')} />
        <Tier id="free" title={t('pricing.free')} price={t('pricing.freePrice')} features={feats('pricing.freeF')} />
        <Tier id="plus" hi title={t('pricing.plus')} price={<>₱{TIERS.plus.price.monthly}<small>{t('pricing.mo')}</small> · ₱{TIERS.plus.price.yearly}<small>{t('pricing.yr')}</small></>} features={feats('pricing.plusF')} />
      </div>
      <div className="card row" style={{ marginTop: 'var(--s-6)', gap: 'var(--s-4)' }}>
        <span className="lrow__icon" style={{ color: 'var(--brand)' }}><Icon name="book" /></span>
        <span className="grow"><b>{t('pricing.books')}</b><br /><span className="small muted">{t('pricing.booksSub')}</span></span>
        <Badge>{t('common.soon')}</Badge>
      </div>
      <Sheet open={soon} onClose={() => setSoon(false)} title={t('pricing.plus')}>
        <div className="stack">
          <p>{t('pricing.ctaSoon')}</p>
          <Button variant="primary" block icon="bell" onClick={() => { kv.set('handa.plusInterest', String(Date.now())); toast(t('pricing.notified'), 'ok', 'bell'); setSoon(false); }}>{t('pricing.notify')}</Button>
        </div>
      </Sheet>
    </div>
  );
}
