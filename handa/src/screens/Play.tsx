import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Icon, Stepper, TopBar } from '@/ui';
import { SCENARIO_ORDER, SCENARIOS } from '@/domain/scenarios';
import { DURATION_DAYS, type DurationId, type ScenarioId } from '@/domain/types';
import { headcount, peopleEq } from '@/domain/readiness';
import { useSession } from '@/store/useSession';
import { sfx } from '@/lib/sound';
import type { IconName } from '@/design/icons/names';
import './screens.css';

const DURATIONS: DurationId[] = ['1d', '1w', '1m', '1y'];
const HH: Array<{ key: 'adults' | 'kids' | 'babies' | 'seniors' | 'pets'; icon: IconName; max: number }> = [
  { key: 'adults', icon: 'adult', max: 12 }, { key: 'kids', icon: 'kid', max: 10 }, { key: 'babies', icon: 'baby', max: 5 }, { key: 'seniors', icon: 'senior', max: 8 }, { key: 'pets', icon: 'pet', max: 10 },
];

export default function Play() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const s = useSession();
  const [step, setStep] = useState<0 | 1 | 2>(s.scenario ? 1 : 0);
  const [busy, setBusy] = useState(false);
  const special = t('household.specialOptions', { returnObjects: true }) as string[];

  const pick = (id: ScenarioId) => { sfx.tap(); s.setScenario(id); setTimeout(() => setStep(1), 180); };
  const pickDur = (d: DurationId) => { sfx.tap(); s.setDuration(d); setTimeout(() => setStep(2), 180); };
  const start = async () => {
    if (busy) return;
    setBusy(true);
    try { await s.start(); sfx.pop(); nav('/house'); } finally { setBusy(false); }
  };

  const people = headcount(s.draft);
  const days = DURATION_DAYS[s.duration];
  const liters = s.scenario ? Math.round(peopleEq(s.draft) * SCENARIOS[s.scenario].waterLpd * days) : 0;

  return (
    <div className="page">
      <TopBar
        eyebrow={`${step + 1} / 3`}
        title={step === 0 ? t('scenario.title') : step === 1 ? t('duration.title') : t('household.title')}
        onBack={step > 0 ? () => setStep((step - 1) as 0 | 1 | 2) : undefined}
      />
      <p className="muted" style={{ marginBottom: 'var(--s-5)' }}>{step === 0 ? t('scenario.sub') : step === 1 ? t('duration.sub') : t('household.sub')}</p>
      <div className="dots" style={{ marginBottom: 'var(--s-5)' }}>{[0, 1, 2].map((k) => <span key={k} className={k <= step ? 'on' : ''} />)}</div>

      {step === 0 && (
        <div className="play__grid stagger" key="s0">
          {SCENARIO_ORDER.map((id) => {
            const on = s.scenario === id;
            return (
              <button key={id} type="button" className={`opt ${on ? 'opt--on' : ''}`} style={{ '--opt-color': SCENARIOS[id].hue } as React.CSSProperties} onClick={() => pick(id)} aria-pressed={on}>
                <div className="opt__icon"><Icon name={id} size={26} /></div>
                <div>
                  <div className="opt__title">{t(`scenario.${id}`)}</div>
                  <div className="opt__sub">{t(`scenario.${id}Sub`)}</div>
                </div>
                {on ? <span className="opt__check"><Icon name="check" size={14} /></span> : SCENARIOS[id].game && <span className="opt__tag">{t('scenario.zombieTag')}</span>}
              </button>
            );
          })}
        </div>
      )}

      {step === 1 && (
        <div className="play__grid play__grid--2 stagger" key="s1">
          {DURATIONS.map((d) => {
            const on = s.duration === d;
            return (
              <button key={d} type="button" className={`opt ${on ? 'opt--on' : ''}`} onClick={() => pickDur(d)} aria-pressed={on}>
                <div className="opt__icon"><Icon name={d === '1d' ? 'clock' : 'calendar'} size={26} /></div>
                <div>
                  <div className="opt__title">{t(`duration.${d}`)}</div>
                  <div className="opt__sub">{t(`duration.${d}Sub`)}</div>
                </div>
                {on && <span className="opt__check"><Icon name="check" size={14} /></span>}
              </button>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="stack-6 rise" key="s2">
          <div className="card">
            {HH.map((h) => (
              <div className="hh-row" key={h.key}>
                <div className="hh-row__label"><span className="lrow__icon"><Icon name={h.icon} size={22} /></span>{t(`household.${h.key}`)}</div>
                <Stepper value={s.draft[h.key]} min={0} max={h.max} onChange={(v) => s.setDraft({ [h.key]: v })} label={t(`household.${h.key}`)} />
              </div>
            ))}
          </div>
          <div className="stack-2">
            <div className="row row--between"><span style={{ fontWeight: 600 }}>{t('household.special')}</span><span className="xs muted">{t('common.optional')}</span></div>
            <div className="chips">
              {special.map((opt) => {
                const on = s.draft.specialNeeds.includes(opt);
                return <Chip key={opt} on={on} onClick={() => s.setDraft({ specialNeeds: on ? s.draft.specialNeeds.filter((x) => x !== opt) : [...s.draft.specialNeeds, opt] })}>{opt}</Chip>;
              })}
            </div>
            <p className="xs muted">{t('household.specialHint')}</p>
          </div>
          <label className="field">
            <span className="field__label">{t('household.name')}</span>
            <input className="input" value={s.draft.name} placeholder={t('household.namePh')} onChange={(e) => s.setDraft({ name: e.target.value })} maxLength={40} />
          </label>
          <div className="summary">
            <Icon name={s.scenario ?? 'typhoon'} size={28} style={{ color: s.scenario ? SCENARIOS[s.scenario].hue : undefined }} />
            <div className="grow">
              <div style={{ fontWeight: 700 }}>{t('household.summary', { people, days })}</div>
              <div className="small muted">{t('household.waterNeed', { liters })}</div>
            </div>
          </div>
          <div style={{ height: 72 }} />
        </div>
      )}

      {step === 2 && (
        <div className="cta-bar">
          <div className="cta-bar__in">
            <Button variant="primary" size="lg" block className="start" disabled={!s.scenario || people === 0 || busy} onClick={start}>{t('common.start')}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
