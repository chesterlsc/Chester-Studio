import { useEffect, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/design/icons/Icon';
import type { IconName } from '@/design/icons/names';
import { Toaster } from '@/ui';
import { useSettings } from '@/store/useSettings';
import { Onboarding } from '@/screens/Onboarding';
import { useOnline } from '@/lib/useOnline';

const TABS: Array<{ to: string; icon: IconName; key: string }> = [
  { to: '/', icon: 'home', key: 'nav.home' },
  { to: '/play', icon: 'play', key: 'nav.play' },
  { to: '/learn', icon: 'learn', key: 'nav.learn' },
  { to: '/stock', icon: 'inventory', key: 'nav.stock' },
  { to: '/me', icon: 'profile', key: 'nav.me' },
];

/** Routes that take the whole screen (no tab bar). */
const FULLSCREEN = ['/house', '/score', '/learn/', '/press', '/auth'];

export function Shell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const loc = useLocation();
  const online = useOnline();
  const onboarded = useSettings((s) => s.onboarded);
  const touchStreak = useSettings((s) => s.touchStreak);
  useEffect(() => {
    touchStreak();
    // auth + sync are loaded after first paint so the landing stays light
    const start = () => { void import('@/sync/useAuth').then((m) => m.useAuth.getState().init()); };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 1500 }); else setTimeout(start, 300);
  }, [touchStreak]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [loc.pathname]);

  const full = FULLSCREEN.some((p) => loc.pathname.startsWith(p)) && loc.pathname !== '/learn';
  const showOnboarding = !onboarded && loc.pathname !== '/' && !loc.pathname.startsWith('/auth') && !loc.pathname.startsWith('/press');

  return (
    <div className={full ? '' : 'with-rail'}>
      {!online && (
        <div role="status" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 80, padding: `calc(6px + var(--safe-t)) var(--gutter) 6px`, background: 'var(--warn)', color: '#1a1200', fontSize: 'var(--fs-xs)', fontWeight: 600, textAlign: 'center', display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="wifi-off" size={14} /> {t('common.offline')}
        </div>
      )}
      <main id="main">{children}</main>
      {!full && (
        <nav className="tabbar" aria-label="Main">
          {TABS.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.to === '/'} className={({ isActive }) => `tabbar__tab ${isActive ? 'tabbar__tab--on' : ''}`}>
              <Icon name={tab.icon} size={24} />
              <span>{t(tab.key)}</span>
            </NavLink>
          ))}
        </nav>
      )}
      <Toaster />
      {showOnboarding && <Onboarding />}
    </div>
  );
}
