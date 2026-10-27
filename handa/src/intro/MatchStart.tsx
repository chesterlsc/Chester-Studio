import { type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { SCENARIOS } from '@/domain/scenarios';
import type { DurationId, ScenarioId } from '@/domain/types';
import { ScenarioVignette } from './Vignettes';
import { S, THREAT, introLang } from './strings';

/** Match-start card shown while the run is being saved: ≤ 1 s, tap to skip. Transform/opacity only. */
export function MatchStart({ scenario, duration, people, onSkip }: { scenario: ScenarioId; duration: DurationId; people: number; onSkip: () => void }) {
  const { t, i18n } = useTranslation();
  const L = S[introLang(i18n.language)];
  const hue = SCENARIOS[scenario].hue;
  return (
    <div className="in-ms" style={{ '--hue': hue } as CSSProperties} role="status" aria-live="polite" onClick={onSkip}>
      <i className="in-ms__burst" aria-hidden="true" />
      <i className="in-ms__bands" aria-hidden="true" />
      <div className="in-ms__card">
        <div className="in-ms__art"><ScenarioVignette id={scenario} /></div>
        <span className="in-ms__kicker">{L.starting} · {L.threat} {L.threatLevels[THREAT[scenario] - 1]}</span>
        <h2 className="in-ms__title">{t(`scenario.${scenario}`)}</h2>
        <div className="in-ms__meta"><span>{t(`duration.${duration}`)}</span><span>{t(`duration.${duration}Sub`)}</span><span>{t('common.people', { count: people })}</span></div>
        <div className="in-ms__bar" aria-hidden="true" />
        <span className="in-ms__load">{L.loadingHouse}…</span>
        <span className="in-ms__hint">{L.tapSkip}</span>
      </div>
    </div>
  );
}
