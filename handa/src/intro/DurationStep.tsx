import { useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui';
import { SCENARIOS } from '@/domain/scenarios';
import { DURATION_DAYS, type DurationId, type Household, type ScenarioId } from '@/domain/types';
import { headcount, peopleEq } from '@/domain/readiness';
import { S, TIER, fmt, introLang } from './strings';
import { useCountUp, useMotionOK } from './motion';

const DURATIONS: DurationId[] = ['1d', '1w', '1m', '1y'];
type Draft = Pick<Household, 'adults' | 'kids' | 'babies' | 'seniors' | 'pets'>;

/** Needs for a run: litres of water, meals and days, from the household draft and scenario profile. */
export function needsFor(draft: Draft, scenario: ScenarioId | null, d: DurationId) {
  const days = DURATION_DAYS[d];
  const prof = scenario ? SCENARIOS[scenario] : null;
  const liters = Math.round(peopleEq(draft) * (prof?.waterLpd ?? 4) * days);
  const meals = Math.round(headcount(draft) * 3 * days * (prof?.foodFactor ?? 1));
  return { days, liters, meals, people: headcount(draft) };
}

function Stat({ k, v, unit }: { k: string; v: number; unit?: string }) {
  return <div className="in-stat"><span className="in-stat__k">{k}</span><span className="in-stat__v">{v.toLocaleString()}{unit && <small>{unit}</small>}</span></div>;
}

/** Difficulty tiers (1 day → 1 year) with a live needs gauge; hover/focus previews, click commits. */
export function DurationStep({ value, draft, scenario, onPick }: { value: DurationId; draft: Draft; scenario: ScenarioId | null; onPick: (d: DurationId) => void }) {
  const { t, i18n } = useTranslation();
  const L = S[introLang(i18n.language)];
  const motion = useMotionOK();
  const [hover, setHover] = useState<DurationId | null>(null);
  const shown = hover ?? value;
  const tier = TIER[shown];
  const n = needsFor(draft, scenario, shown);
  const days = useCountUp(n.days, 520, motion), liters = useCountUp(n.liters, 520, motion), meals = useCountUp(n.meals, 520, motion);
  const R = 62, C = 2 * Math.PI * R;

  return (
    <div className="in-duel">
      <section className="in-gauge" style={{ '--tcolor': tier.color } as CSSProperties} aria-live="polite">
        <div className="in-gauge__ring" aria-hidden="true">
          <svg viewBox="0 0 148 148"><circle className="in-gauge__track" cx="74" cy="74" r={R} fill="none" strokeWidth="12" /><circle className="in-gauge__fill" cx="74" cy="74" r={R} fill="none" strokeWidth="12" strokeDasharray={C} strokeDashoffset={C - (C * tier.rank) / 4} /></svg>
          <div className="in-gauge__num"><b>{days.toLocaleString()}</b><small>{L.days}</small></div>
        </div>
        <div className="in-stats">
          <div className="in-gauge__rank"><b style={{ color: tier.color }}>{L.tierRank[shown]}</b><span className="in-gauge__eyebrow">{L.preview}</span></div>
          <Stat k={L.water} v={liters} unit="L" />
          <Stat k={L.meals} v={meals} />
          <div className="in-gauge__for"><Icon name="users" size={14} />{fmt(L.forPeople, { n: n.people })}</div>
        </div>
      </section>
      <div className="in-tiers" role="group" aria-label={L.difficulty}>
        {DURATIONS.map((d, i) => {
          const on = value === d; const tr = TIER[d];
          return (
            <button key={d} type="button" className={`in-tier ${on ? 'in-tier--on' : ''}`} style={{ '--tcolor': tr.color, '--i': i } as CSSProperties} aria-pressed={on}
              onClick={() => onPick(d)} onMouseEnter={() => setHover(d)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(d)} onBlur={() => setHover(null)}>
              <span className="in-tier__pips" aria-hidden="true">{[1, 2, 3, 4].map((k) => <i key={k} className={k <= tr.rank ? 'on' : ''} />)}</span>
              <span className="in-tier__text">
                <span className="in-tier__rank">{L.tierRank[d]} · {L.tier} {tr.rank}</span>
                <span className="in-tier__name">{t(`duration.${d}Sub`)}<small>{t(`duration.${d}`)}</small></span>
                <span className="in-tier__line">{L.tierLine[d]}</span>
              </span>
              <span className="in-tier__go" aria-hidden="true"><Icon name={on ? 'check' : 'chevron'} size={18} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
