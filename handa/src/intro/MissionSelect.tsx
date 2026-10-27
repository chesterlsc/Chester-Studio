import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/ui';
import { SCENARIO_ORDER, SCENARIOS } from '@/domain/scenarios';
import type { ScenarioId } from '@/domain/types';
import { ScenarioVignette } from './Vignettes';
import { S, THREAT, introLang } from './strings';

/** Game-poster grid: one toon vignette per scenario, threat bar, "what you'll face" on select. */
export function MissionSelect({ selected, onPick }: { selected: ScenarioId | null; onPick: (id: ScenarioId) => void }) {
  const { t, i18n } = useTranslation();
  const L = S[introLang(i18n.language)];
  const grid = useRef<HTMLDivElement>(null);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'];
    if (!keys.includes(e.key) || !grid.current) return;
    const btns = Array.from(grid.current.querySelectorAll<HTMLButtonElement>('button'));
    const i = btns.indexOf(document.activeElement as HTMLButtonElement); if (i < 0) return;
    const cols = window.matchMedia('(min-width: 760px)').matches ? 4 : 2;
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowDown' ? cols : -cols;
    const n = btns[i + d]; if (n) { e.preventDefault(); n.focus(); }
  };

  return (
    <div className="in-posters" ref={grid} onKeyDown={onKey} role="group" aria-label={L.mission}>
      {SCENARIO_ORDER.map((id, i) => {
        const on = selected === id; const p = SCENARIOS[id]; const th = THREAT[id];
        return (
          <button key={id} type="button" className={`in-poster ${on ? 'in-poster--on' : ''}`} style={{ '--hue': p.hue, '--i': i } as CSSProperties} onClick={() => onPick(id)} aria-pressed={on} aria-describedby={`in-face-${id}`}>
            <div className="in-poster__art">
              <ScenarioVignette id={id} />
              <span className="in-poster__num">{String(i + 1).padStart(2, '0')}</span>
              {on ? <span className="in-poster__check"><Icon name="check" size={15} /></span> : p.game && <span className="in-poster__tag">{t('scenario.zombieTag')}</span>}
            </div>
            <div className="in-poster__body">
              <div className="in-poster__title">{t(`scenario.${id}`)}</div>
              <div className="in-poster__sub">{t(`scenario.${id}Sub`)}</div>
              <div className="in-threat" aria-label={`${L.threat}: ${L.threatLevels[th - 1]}`}>
                <span className="in-threat__pips" aria-hidden="true">{[1, 2, 3, 4, 5].map((k) => <i key={k} className={k <= th ? 'on' : ''} />)}</span>
                <span className="in-threat__lbl">{L.threatLevels[th - 1]}</span>
              </div>
              <div className="in-poster__face" id={`in-face-${id}`}>
                <ul>{L.faceLines[id].map((line) => <li key={line}>{line}</li>)}</ul>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
