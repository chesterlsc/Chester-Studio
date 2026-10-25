import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, TopBar, toast } from '@/ui';
import { getSetting, setSetting } from '@/store/db';
import { QR } from '@/lib/qr';
import './screens.css';

interface Plan { meeting: string; contacts: string; medical: string }
const EMPTY: Plan = { meeting: '', contacts: '', medical: '' };

export default function PlanCard() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [plan, setPlan] = useState<Plan>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { void getSetting<Plan>('plan', EMPTY).then((p) => { setPlan(p); setLoaded(true); }); }, []);
  useEffect(() => { if (loaded) void setSetting('plan', plan); }, [plan, loaded]);

  const payload = `${location.origin}/plan#${btoa(unescape(encodeURIComponent(JSON.stringify(plan))))}`;
  useEffect(() => {
    if (location.hash.length > 1) {
      try { const p = JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(1))))) as Plan; setPlan(p); toast(t('plan.saved'), 'ok'); history.replaceState(null, '', location.pathname); } catch { /* ignore */ }
    }
  }, [t]);

  return (
    <div className="page">
      <TopBar title={t('plan.title')} onBack={() => nav(-1)} right={<Button size="sm" icon="print" onClick={() => window.print()}>{t('plan.print')}</Button>} />
      <div className="stack-6">
        <div className="stack">
          {(['meeting', 'contacts', 'medical'] as const).map((k) => (
            <label className="field" key={k}>
              <span className="field__label">{t(`plan.${k}`)}</span>
              <textarea className="input" rows={k === 'meeting' ? 2 : 3} placeholder={t(`plan.${k}Ph`)} value={plan[k]} onChange={(e) => setPlan({ ...plan, [k]: e.target.value })} />
            </label>
          ))}
          <p className="xs muted">{t('plan.saved')}</p>
        </div>
        <div className="plan-print">
          <div className="row row--between"><h2 style={{ fontSize: 22 }}>HANDA · {t('plan.title')}</h2><span className="k">prepare.ph</span></div>
          {(['meeting', 'contacts', 'medical'] as const).map((k) => <div key={k}><div className="k">{t(`plan.${k}`)}</div><div className="v">{plan[k] || ' '}</div></div>)}
          <div className="row" style={{ gap: 16, alignItems: 'center' }}>
            <QR text={payload} size={112} />
            <span className="k">{t('plan.qr')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
