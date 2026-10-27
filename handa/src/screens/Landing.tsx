import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Icon } from '@/ui';
import { SCENARIO_ORDER, SCENARIOS } from '@/domain/scenarios';
import { useSession } from '@/store/useSession';
import { useSettings } from '@/store/useSettings';
import { HERO } from '@/intro/hero.strings';
import '@/intro/hero.css';
import './screens.css';
const GameHero = lazy(() => import('./GameHero').then((m) => ({ default: m.GameHero })));

/** The dollhouse hero is heavy-ish SVG; mount it after first paint so the landing stays instant. */
function useIdle(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => setReady(true);
    // decorative, so it waits for a quiet moment after first paint
    const id = setTimeout(() => { if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1500 }); else go(); }, 2200);
    return () => clearTimeout(id);
  }, []);
  return ready;
}

/** Title line painted normally (LCP-safe) and revealed by a colour bar wiping off it. */
function Wipe({ children, delay, accent }: { children: string; delay: number; accent?: boolean }) {
  return <span className={`in-wipe ${accent ? 'in-wipe--accent accent' : ''}`}>{children}<i className="in-wipe__bar" aria-hidden="true" style={{ '--d': `${delay}ms` } as CSSProperties} /></span>;
}

export default function Landing() {
  const { t, i18n } = useTranslation();
  const L = HERO[i18n.language === 'tl' ? 'tl' : 'en'];
  const nav = useNavigate();
  const runId = useSession((s) => s.runId);
  const scenario = useSession((s) => s.scenario);
  const setScenario = useSession((s) => s.setScenario);
  const lang = useSettings((s) => s.lang);
  const setLang = useSettings((s) => s.setLang);
  const idle = useIdle();
  const weather = runId && scenario ? SCENARIOS[scenario].weather : 'rain';

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
            <Wipe delay={80}>{t('landing.h1a')}</Wipe>
            <Wipe delay={220}>{t('landing.h1b')}</Wipe>
            <Wipe delay={360} accent>{t('landing.h1c')}</Wipe>
          </h1>
          <p className="hero__lead">{t('landing.lead')}</p>
          <div className="hero__cta">
            <span className="in-press"><Button variant="primary" size="lg" icon="play" onClick={() => nav('/play')}>{t('landing.cta')}</Button></span>
            <span className="hero__ctasub in-ctasub"><span className="in-ctasub__ps">▶ {L.pressStart}</span><span>{t('landing.ctaSub')} · {t('app.tagline')}</span></span>
          </div>
          <div className="trust">
            <span><Icon name="shield" size={16} />{t('landing.trust1')}</span>
            <span><Icon name="wifi-off" size={16} />{t('landing.trust2')}</span>
            <span><Icon name="lock" size={16} />{t('landing.trust3')}</span>
          </div>
        </div>
        <div className="hero__art pop">
          <div className="game-hero__box">
            {!idle && (
              <div className="in-hero-ph" aria-hidden="true">
                <i className="in-hero-ph__roof" /><i className="in-hero-ph__house"><i className="in-hero-ph__win" style={{ left: '12%', top: '22%' }} /><i className="in-hero-ph__win" style={{ right: '12%', top: '22%' }} /></i><i className="in-hero-ph__fence" />
              </div>
            )}
            {idle && <Suspense fallback={null}><GameHero weather={weather} /></Suspense>}
            <span className="in-hero-badge">{L.heroBadge}</span>
          </div>
        </div>
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
