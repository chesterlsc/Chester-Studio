import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Icon } from '@/ui';
import { SCENARIO_ORDER } from '@/domain/scenarios';
import { useSession } from '@/store/useSession';
import { useSettings } from '@/store/useSettings';
import { HouseArt } from './HouseArt';
import './screens.css';

export default function Landing() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const runId = useSession((s) => s.runId);
  const scenario = useSession((s) => s.scenario);
  const setScenario = useSession((s) => s.setScenario);
  const lang = useSettings((s) => s.lang);
  const setLang = useSettings((s) => s.setLang);

  return (
    <div className="page page--wide">
      <header className="row row--between" style={{ paddingTop: 'var(--safe-t)' }}>
        <div className="row" style={{ gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true"><path d="M8 32 32 10l24 22v22H8z" fill="#ff6a1a" /><path d="M26 54V36h12v18" fill="var(--bg)" /></svg>
          <span className="display" style={{ fontWeight: 800, letterSpacing: '.08em' }}>HANDA</span>
        </div>
        <Button size="sm" variant="ghost" icon="globe" onClick={() => setLang(lang === 'en' ? 'tl' : 'en')}>
          {lang === 'en' ? 'Tagalog' : 'English'}
        </Button>
      </header>

      <section className="hero">
        <div className="stack-6 rise">
          <div className="eyebrow">{t('landing.eyebrow')}</div>
          <h1 className="hero__title">
            <span>{t('landing.h1a')}</span>
            <span>{t('landing.h1b')}</span>
            <span className="accent">{t('landing.h1c')}</span>
          </h1>
          <p className="hero__lead">{t('landing.lead')}</p>
          <div className="hero__cta">
            <Button variant="primary" size="lg" icon="play" onClick={() => nav('/play')}>{t('landing.cta')}</Button>
            <span className="hero__ctasub">{t('landing.ctaSub')} · {t('app.tagline')}</span>
          </div>
          <div className="trust">
            <span><Icon name="shield" size={16} />{t('landing.trust1')}</span>
            <span><Icon name="wifi-off" size={16} />{t('landing.trust2')}</span>
            <span><Icon name="lock" size={16} />{t('landing.trust3')}</span>
          </div>
        </div>
        <div className="hero__art pop"><HouseArt /></div>
      </section>

      {runId && scenario && (
        <Link to="/house" className="card continue rise" style={{ marginBottom: 'var(--s-6)' }}>
          <div className="opt__icon" style={{ '--opt-color': 'var(--brand)' } as React.CSSProperties}><Icon name={scenario} /></div>
          <div className="grow">
            <div style={{ fontWeight: 700 }}>{t('landing.continueRun')}</div>
            <div className="small muted">{t(`scenario.${scenario}`)}</div>
          </div>
          <Icon name="chevron" />
        </Link>
      )}

      <section className="stack" style={{ marginBottom: 'var(--s-10)' }} id="how">
        <div className="eyebrow">{t('landing.secondary')}</div>
        <div className="steps stagger">
          {[1, 2, 3].map((n) => (
            <div className="step" key={n}>
              <div className="step__n">{n}</div>
              <div>
                <h2 style={{ fontSize: 'var(--fs-lg)' }}>{t(`landing.how${n}t`)}</h2>
                <p className="small muted">{t(`landing.how${n}b`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="stack" style={{ marginBottom: 'var(--s-10)' }}>
        <div className="eyebrow">{t('landing.scenarios')}</div>
        <div className="scen-rail no-scrollbar">
          {SCENARIO_ORDER.map((s) => (
            <Chip key={s} onClick={() => { setScenario(s); nav('/play'); }}>
              <Icon name={s} size={18} />{t(`scenario.${s}`)}
            </Chip>
          ))}
        </div>
      </section>

      <footer className="footer">
        <span>{t('landing.sources')}</span>
        <span className="row" style={{ gap: 'var(--s-3)' }}>
          <Link to="/learn">{t('nav.learn')}</Link>
          <Link to="/pricing">{t('me.pricing')}</Link>
          <Link to="/press">{t('me.press')}</Link>
          <span>{t('landing.footer')}</span>
        </span>
      </footer>
    </div>
  );
}
