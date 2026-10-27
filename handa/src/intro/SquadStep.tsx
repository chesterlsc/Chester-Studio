import { useEffect, useRef, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Icon, Stepper } from '@/ui';
import { SCENARIOS } from '@/domain/scenarios';
import type { DurationId, ScenarioId } from '@/domain/types';
import type { useSession } from '@/store/useSession';
import { Avatar, type AvatarKind } from './toon';
import { ScenarioVignette } from './Vignettes';
import { needsFor } from './DurationStep';
import { S, THREAT, TIER, fmt, introLang } from './strings';

type Session = ReturnType<typeof useSession.getState>;
const ROWS: Array<{ key: AvatarKind; max: number }> = [{ key: 'adults', max: 12 }, { key: 'kids', max: 10 }, { key: 'babies', max: 5 }, { key: 'seniors', max: 8 }, { key: 'pets', max: 10 }];
const SHOW = 6;

/** Household as a squad roster: avatars pop in/out with the counts, chips, name, mission briefing, sticky START. */
export function SquadStep({ s, special, canStart, busy, onStart }: { s: Session; special: string[]; canStart: boolean; busy: boolean; onStart: () => void }) {
  const { t, i18n } = useTranslation();
  const L = S[introLang(i18n.language)];
  const wrap = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLDivElement>(null);
  // the sticky footer never covers content: its measured height becomes the content's bottom padding
  useEffect(() => {
    const f = foot.current, w = wrap.current; if (!f || !w) return;
    const apply = () => w.style.setProperty('--in-cta-h', `${f.offsetHeight}px`);
    apply();
    const ro = new ResizeObserver(apply); ro.observe(f);
    return () => ro.disconnect();
  }, []);

  const scenario: ScenarioId = s.scenario ?? 'typhoon';
  const d: DurationId = s.duration;
  const n = needsFor(s.draft, s.scenario, d);
  const hue = SCENARIOS[scenario].hue;
  const total = n.people + s.draft.pets;

  return (
    <div className="in-squad" ref={wrap}>
      <div className="in-squad__main">
        <section className="in-roster" aria-label={L.roster}>
          <header className="in-roster__head"><span className="in-eyebrow">{L.roster}</span><span className="in-roster__n">{fmt(L.members, { n: total })}</span></header>
          {ROWS.map((r) => {
            const v = s.draft[r.key];
            return (
              <div className="in-rrow" key={r.key}>
                <div className="in-rrow__lbl">{t(`household.${r.key}`)}</div>
                <Stepper value={v} min={0} max={r.max} onChange={(val) => s.setDraft({ [r.key]: val })} label={t(`household.${r.key}`)} />
                <div className="in-avas" aria-hidden="true">
                  {v === 0 && <span className="in-avas__empty">{L.none}</span>}
                  {Array.from({ length: Math.min(v, SHOW) }).map((_, i) => <span className="in-ava" key={`${r.key}${i}`}><Avatar kind={r.key} i={i} size={34} /></span>)}
                  {v > SHOW && <span className="in-avas__more">+{v - SHOW}</span>}
                </div>
              </div>
            );
          })}
        </section>

        <section className="in-block">
          <div className="in-block__head"><span className="in-block__t">{t('household.special')}</span><span className="xs muted">{t('common.optional')}</span></div>
          <div className="in-chips">
            {special.map((opt) => {
              const on = s.draft.specialNeeds.includes(opt);
              return <Chip key={opt} on={on} onClick={() => s.setDraft({ specialNeeds: on ? s.draft.specialNeeds.filter((x) => x !== opt) : [...s.draft.specialNeeds, opt] })}>{opt}</Chip>;
            })}
          </div>
          <p className="xs muted">{t('household.specialHint')}</p>
        </section>

        <label className="field">
          <span className="field__label">{t('household.name')}</span>
          <input className="input" value={s.draft.name} placeholder={t('household.namePh')} onChange={(e) => s.setDraft({ name: e.target.value })} maxLength={40} />
        </label>
      </div>

      <aside className="in-mission" style={{ '--hue': hue } as CSSProperties} aria-label={L.briefing}>
        <div className="in-mission__art"><ScenarioVignette id={scenario} /></div>
        <div className="in-mission__txt">
          <span className="in-eyebrow">{L.briefing}</span>
          <div className="in-mission__t">{t(`scenario.${scenario}`)}</div>
          <div className="in-mission__m">{t(`duration.${d}`)} · {t(`duration.${d}Sub`)} · {t('household.summary', { people: n.people, days: n.days })}</div>
          <div className="in-mission__row">
            <span className="in-threat__pips" aria-hidden="true" style={{ '--hue': hue } as CSSProperties}>{[1, 2, 3, 4, 5].map((k) => <i key={k} className={k <= THREAT[scenario] ? 'on' : ''} />)}</span>
            <span className="in-threat__lbl">{L.threat}: {L.threatLevels[THREAT[scenario] - 1]}</span>
            <span className="in-mission__rank" style={{ color: TIER[d].color }}>{L.tierRank[d]}</span>
          </div>
          <div className="in-mission__needs"><Icon name="drop" size={14} />{fmt(L.needs, { liters: n.liters.toLocaleString(), meals: n.meals.toLocaleString() })}</div>
        </div>
      </aside>

      <div className="in-cta" ref={foot}>
        <div className="in-cta__in">
          <div className="in-cta__wrap">
            <i className="in-cta__glow" aria-hidden="true" />
            <button type="button" className="in-start" disabled={!canStart || busy} onClick={onStart} aria-busy={busy}>{L.start}</button>
          </div>
          <span className="in-cta__sub">{canStart ? L.startSub : t('household.sub')}</span>
        </div>
      </div>
    </div>
  );
}
