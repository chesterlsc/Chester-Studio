import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui';
import type { DurationId, ScenarioId } from '@/domain/types';
import { headcount } from '@/domain/readiness';
import { useSession } from '@/store/useSession';
import { sfx } from '@/lib/sound';
import { MissionSelect } from '@/intro/MissionSelect';
import { DurationStep } from '@/intro/DurationStep';
import { SquadStep } from '@/intro/SquadStep';
import { MatchStart } from '@/intro/MatchStart';
import { useMotionOK } from '@/intro/motion';
import { S, introLang } from '@/intro/strings';
import '@/intro/intro.css';
import './screens.css';

type Step = 0 | 1 | 2;
const MATCH_START_MS = 900;

/** Game-menu flow: mission select → difficulty → squad → START (match-start card) → /house. */
export default function Play() {
  const { t, i18n } = useTranslation();
  const L = S[introLang(i18n.language)];
  const nav = useNavigate();
  const s = useSession();
  const motion = useMotionOK();
  const [step, setStep] = useState<Step>(s.scenario ? 1 : 0);
  const [busy, setBusy] = useState(false);
  const [launch, setLaunch] = useState(false);
  const [saved, setSaved] = useState(false);
  const [minDone, setMinDone] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const adv = useRef(0);
  const special = t('household.specialOptions', { returnObjects: true }) as string[];
  const people = headcount(s.draft);

  useEffect(() => () => window.clearTimeout(adv.current), []);
  // warm the house chunks while the squad is being set up so START lands on /house right after the card
  useEffect(() => { if (step === 2) { void import('@/screens/HouseRoute'); void import('@/game/GameScreen'); } }, [step]);
  // the match-start card plays ≤ 1 s; we leave once the run is saved and (the card finished | tap | no motion)
  useEffect(() => { if (launch && saved && (minDone || skipped || !motion)) nav('/house'); }, [launch, saved, minDone, skipped, motion, nav]);

  const go = (next: Step, delay: number) => { window.clearTimeout(adv.current); adv.current = window.setTimeout(() => { setStep(next); window.scrollTo({ top: 0 }); }, delay); };
  const pick = (id: ScenarioId) => { sfx.tap(); try { navigator.vibrate?.(8); } catch { /* ignore */ } s.setScenario(id); go(1, motion ? 620 : 120); };
  const pickDur = (d: DurationId) => { sfx.tap(); try { navigator.vibrate?.(8); } catch { /* ignore */ } s.setDuration(d); go(2, motion ? 480 : 120); };
  const start = async () => {
    if (busy || !s.scenario || people === 0) return;
    setBusy(true); sfx.pop(); try { navigator.vibrate?.([10, 30, 20]); } catch { /* ignore */ }
    setLaunch(true);
    window.setTimeout(() => setMinDone(true), MATCH_START_MS);
    try { await s.start(); setSaved(true); }
    catch { setLaunch(false); setBusy(false); }
  };

  const eyebrow = step === 0 ? L.mission : step === 1 ? L.difficulty : L.squad;
  const title = step === 0 ? t('scenario.title') : step === 1 ? t('duration.title') : t('household.title');
  const sub = step === 0 ? t('scenario.sub') : step === 1 ? t('duration.sub') : t('household.sub');

  return (
    <div className="page page--wide in-play">
      <header className="in-head" key={`h${step}`}>
        <div className="in-head__row">
          {step > 0 && <button type="button" className="in-back" aria-label={t('common.back')} onClick={() => setStep((step - 1) as Step)}><Icon name="back" size={20} /></button>}
          <span className="in-eyebrow"><b>{L.step} {step + 1} {L.of} 3</b>{eyebrow}</span>
        </div>
        <h1 className="in-title">{title}</h1>
        <p className="in-sub">{sub}</p>
        <div className="in-prog" aria-hidden="true">{[0, 1, 2].map((k) => <span key={k} className={k <= step ? 'on' : ''} />)}</div>
      </header>

      {step === 0 && <div className="in-step" key="s0"><MissionSelect selected={s.scenario} onPick={pick} /></div>}
      {step === 1 && <div className="in-step" key="s1"><DurationStep value={s.duration} draft={s.draft} scenario={s.scenario} onPick={pickDur} /></div>}
      {step === 2 && <SquadStep key="s2" s={s} special={special} canStart={!!s.scenario && people > 0} busy={busy} onStart={start} />}

      {launch && motion && s.scenario && <MatchStart scenario={s.scenario} duration={s.duration} people={people} onSkip={() => setSkipped(true)} />}
    </div>
  );
}
