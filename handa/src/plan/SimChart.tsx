import { useTranslation } from 'react-i18next';
import { Icon } from '@/design/icons/Icon';
import { CAT_COLOR } from '@/scene/palette';
import { dayTicks, type Simulation } from './simulation';

/** Burn-down chart drawn on blueprint grid paper. */
export function SimChart({ sim }: { sim: Simulation }) {
  const { t } = useTranslation();
  const W = 640, H = 300, L = 44, R = 16, T = 18, B = 34;
  const pw = W - L - R, ph = H - T - B;
  const x = (d: number) => L + (d / sim.days) * pw;
  const y = (v: number) => T + ph - Math.min(1, v) * ph;
  const ticks = dayTicks(sim.days);
  return (
    <div className="sim">
      <div className="sim__big"><b>{sim.survivesTo}</b><span>{t('plan.sim.survive', { days: sim.days })}</span></div>
      <svg className="sim__chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('plan.sim.title')}>
        <defs><pattern id="simgrid" width={32} height={30} patternUnits="userSpaceOnUse"><path d="M32 0H0V30" fill="none" stroke="var(--bp-grid)" strokeWidth={1} /></pattern></defs>
        <rect x={L} y={T} width={pw} height={ph} fill="url(#simgrid)" stroke="var(--bp-panel-line)" />
        {[0, .25, .5, .75, 1].map((v) => <g key={v}><path d={`M${L} ${y(v)}h${pw}`} stroke="var(--bp-grid-major)" strokeDasharray="2 4" /><text x={L - 6} y={y(v) + 4} textAnchor="end" className="bp-text" fontSize={10}>{Math.round(v * 100)}%</text></g>)}
        {ticks.map((d) => <g key={d}><path d={`M${x(d)} ${T + ph}v6`} stroke="var(--bp-ink-3)" /><text x={x(d)} y={T + ph + 20} textAnchor="middle" className="bp-text" fontSize={10}>D{d}</text></g>)}
        {sim.series.map((s) => {
          const pts = s.days.map((v, d) => `${x(d).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
          const c = CAT_COLOR[s.category];
          return (
            <g key={s.category}>
              {s.consumable && <polygon points={`${x(0)},${y(0)} ${pts} ${x(sim.days)},${y(0)}`} fill={c} opacity={.08} />}
              <polyline points={pts} fill="none" stroke={c} strokeWidth={s.consumable ? 2.2 : 1.2} strokeDasharray={s.consumable ? undefined : '6 4'} strokeLinejoin="round" />
              {s.runsOutDay !== null && <g><circle cx={x(s.runsOutDay)} cy={y(0)} r={5} fill={c} stroke="var(--bp-bg)" strokeWidth={2} /><path d={`M${x(s.runsOutDay)} ${T}V${y(0)}`} stroke={c} strokeDasharray="3 4" opacity=".6" /></g>}
            </g>
          );
        })}
        {sim.survivesTo < sim.days && <g><rect x={x(sim.survivesTo)} y={T} width={Math.max(0, x(sim.days) - x(sim.survivesTo))} height={ph} fill="var(--bad)" opacity={.07} /><text x={x(sim.survivesTo) + 6} y={T + 14} className="bp-text" fontSize={10} fill="var(--bad)">{t('plan.sim.gap')}</text></g>}
      </svg>
      <div className="sim__legend">{sim.series.map((s) => <span key={s.category}><i style={{ background: CAT_COLOR[s.category] }} />{t(`cat.${s.category}`)}</span>)}</div>
      <div className="sim__events">
        {sim.events.length === 0 && <div className="sim__ev sim__ev--low" style={{ background: 'var(--ok-dim)', borderColor: 'var(--ok)' }}><b><Icon name="check" size={14} /></b><span>{t('plan.sim.none')}</span></div>}
        {sim.events.slice(0, 6).map((e, i) => (
          <div key={i} className={`sim__ev ${e.kind === 'low' ? 'sim__ev--low' : ''}`}>
            <b>{t('plan.sim.day', { n: e.day })}</b>
            <span>{t(e.kind === 'out' ? 'plan.sim.out' : 'plan.sim.low', { cat: t(`cat.${e.category}`) })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
