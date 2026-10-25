import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Icon, TopBar, toast } from '@/ui';
import { uid, upsert } from '@/store/db';
import { useSettings } from '@/store/useSettings';
import { SCENARIO_ORDER } from '@/domain/scenarios';
import { sfx } from '@/lib/sound';
import './screens.css';

export default function Survey() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const setSurveyDone = useSettings((s) => s.setSurveyDone);
  const [a, setA] = useState<Record<string, string | number>>({});
  const [done, setDone] = useState(false);
  const opts = (k: string) => t(k, { returnObjects: true }) as string[];
  const set = (k: string, v: string | number) => setA((x) => ({ ...x, [k]: v }));
  const submit = async () => {
    const now = Date.now();
    await upsert('surveys', { id: uid(), answers: { ...a, lang: document.documentElement.lang, ua: navigator.userAgent.slice(0, 80) }, at: now, updatedAt: now });
    setSurveyDone(true); setDone(true); sfx.win();
  };
  if (done) {
    return (
      <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '70dvh' }}>
        <div className="stack pop" style={{ textAlign: 'center', placeItems: 'center' }}>
          <div className="empty__icon" style={{ color: 'var(--ok)' }}><Icon name="check" size={32} /></div>
          <h2>{t('survey.thanks')}</h2>
          <Button variant="primary" onClick={() => nav('/')}>{t('common.done')}</Button>
        </div>
      </div>
    );
  }
  const Q = ({ n, k, children }: { n: number; k: string; children: React.ReactNode }) => (
    <div className="card stack-2"><div className="eyebrow">{n}/5</div><b>{t(k)}</b>{children}</div>
  );
  return (
    <div className="page">
      <TopBar title={t('survey.title')} onBack={() => nav(-1)} right={<Button size="sm" variant="ghost" onClick={() => nav(-1)}>{t('survey.later')}</Button>} />
      <p className="muted" style={{ marginBottom: 'var(--s-5)' }}>{t('survey.sub')}</p>
      <div className="stack">
        <Q n={1} k="survey.q1"><div className="chips">{opts('survey.q1o').map((o) => <Chip key={o} on={a.q1 === o} onClick={() => set('q1', o)}>{o}</Chip>)}</div></Q>
        <Q n={2} k="survey.q2"><input className="input" placeholder={t('survey.q2Ph')} value={(a.q2 as string) ?? ''} onChange={(e) => set('q2', e.target.value)} maxLength={200} /></Q>
        <Q n={3} k="survey.q3"><div className="chips">{SCENARIO_ORDER.map((s) => <Chip key={s} on={a.q3 === s} onClick={() => set('q3', s)}><Icon name={s} size={16} />{t(`scenario.${s}`)}</Chip>)}</div></Q>
        <Q n={4} k="survey.q4"><div className="chips">{opts('survey.q4o').map((o) => <Chip key={o} on={a.q4 === o} onClick={() => set('q4', o)}>{o}</Chip>)}</div></Q>
        <Q n={5} k="survey.q5"><div className="chips">{opts('me.howFoundOptions').map((o) => <Chip key={o} on={a.q5 === o} onClick={() => set('q5', o)}>{o}</Chip>)}</div></Q>
        <div className="card stack-2">
          <b>{t('survey.rate')}</b>
          <div className="scale">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-pressed={a.rate === n} onClick={() => set('rate', n)}>{n}</button>)}</div>
          <div className="scale-labels"><span>{t('survey.rateLow')}</span><span>{t('survey.rateHigh')}</span></div>
        </div>
        <Button variant="primary" size="lg" block disabled={Object.keys(a).length < 3} onClick={() => { void submit(); toast(t('survey.thanks'), 'ok'); }}>{t('survey.send')}</Button>
      </div>
    </div>
  );
}
