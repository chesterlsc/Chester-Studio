import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/sync/useAuth';
import { toast } from '@/ui';

export default function AuthCallback() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const status = useAuth((s) => s.status);
  const init = useAuth((s) => s.init);
  useEffect(() => { void init(); }, [init]);
  useEffect(() => {
    if (status === 'signedIn') { toast(t('auth.migrated'), 'ok', 'cloud'); nav('/me', { replace: true }); }
    else if (status === 'guest') {
      const id = setTimeout(() => { toast(t('auth.callbackFail'), 'warn'); nav('/me', { replace: true }); }, 4000);
      return () => clearTimeout(id);
    }
  }, [status, nav, t]);
  return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '70dvh' }}>
      <p className="muted">{t('auth.callbackTitle')}</p>
    </div>
  );
}
