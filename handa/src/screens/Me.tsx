import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Badge, Button, Icon, Segmented, Sheet, Toggle, toast, TopBar } from '@/ui';
import { db } from '@/store/db';
import { useSettings } from '@/store/useSettings';
import { useAuth } from '@/sync/useAuth';
import { useSyncStatus } from '@/sync/outbox';
import { cloudEnabled, GOOGLE_ENABLED } from '@/sync/supabase';
import { exportAllLocal, exportFilename, deleteEverything } from '@/sync/exportData';
import { BADGES, earnedBadges } from '@/domain/badges';
import { REGIONS } from '@/content';
import { downloadBlob } from '@/native/share';
import { fmtDate } from '@/lib/format';
import type { IconName } from '@/design/icons/names';
import type { Score as ScoreRow } from '@/domain/types';

const EMPTY_SCORES: ScoreRow[] = [];
import './screens.css';

type InstallEvt = Event & { prompt: () => Promise<void> };

export default function Me() {
  const { t } = useTranslation();
  const s = useSettings();
  const auth = useAuth();
  const sync = useSyncStatus();
  const scores = useLiveQuery<ScoreRow[]>(async () => db.scores.orderBy('at').toArray(), []) ?? EMPTY_SCORES;
  const [signIn, setSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [del, setDel] = useState(false);
  const [delText, setDelText] = useState('');
  const [install, setInstall] = useState<InstallEvt | null>(null);
  const badges = useMemo(() => earnedBadges(scores, s.streakDays), [scores, s.streakDays]);
  const howFound = t('me.howFoundOptions', { returnObjects: true }) as string[];

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setInstall(e as InstallEvt); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  const magic = async () => {
    const r = await auth.signInWithEmail(email.trim());
    if (r.ok) { setSent(true); toast(t('me.magicSent'), 'ok', 'cloud'); } else toast(r.error ?? t('common.retry'), 'warn');
  };
  const exportData = async () => { downloadBlob(await exportAllLocal(), exportFilename()); toast(t('me.exported'), 'ok', 'download'); };
  const destroy = async () => {
    try { await deleteEverything(); localStorage.clear(); toast(t('me.deleted'), 'ok'); setDel(false); setTimeout(() => location.reload(), 600); }
    catch { toast(t('me.offlineSync'), 'warn'); }
  };

  const signedIn = auth.status === 'signedIn';
  const Row = ({ to, icon, label }: { to: string; icon: IconName; label: string }) => (
    <Link to={to} className="linkrow"><Icon name={icon} style={{ color: 'var(--fg-2)' }} /><span className="linkrow__t">{label}</span><Icon name="chevron" /></Link>
  );

  return (
    <div className="page">
      <TopBar title={t('me.title')} />
      <div className="stack-6">
        {/* account */}
        <div className="card acct">
          <div className="acct__avatar"><Icon name={signedIn ? 'cloud' : 'user'} size={26} /></div>
          <div className="grow">
            <div className="acct__name">
              <b>{signedIn ? auth.user?.email ?? t('me.account') : t('me.guest')}</b>
              <Badge kind={auth.tier === 'plus' ? 'brand' : signedIn ? 'ok' : undefined}>{auth.tier === 'plus' ? t('me.plus') : signedIn ? t('me.account') : t('me.guest')}</Badge>
            </div>
            <div className="small muted">
              {signedIn ? (sync.state === 'syncing' ? t('me.syncing') : sync.state === 'offline' ? t('me.offlineSync') : sync.pending > 0 ? t('me.pending', { n: sync.pending }) : t('me.synced')) : t('me.guestSub')}
            </div>
          </div>
          {signedIn ? <Button size="sm" onClick={() => void auth.signOut()}>{t('common.signOut')}</Button> : <Button size="sm" variant="primary" onClick={() => setSignIn(true)}>{t('common.signIn')}</Button>}
        </div>
        {!signedIn && (
          <div className="hint"><Icon name="cloud-off" size={18} style={{ color: 'var(--info)', flex: 'none' }} /><span>{t('common.savedLocal')} {cloudEnabled ? t('common.backUp') : t('me.cloudNotSet')}</span></div>
        )}
        {install && (
          <button type="button" className="card row" style={{ gap: 'var(--s-4)', textAlign: 'left', width: '100%' }} onClick={() => void install.prompt()}>
            <span className="lrow__icon" style={{ color: 'var(--brand)' }}><Icon name="download" /></span>
            <span className="grow"><b>{t('me.install')}</b><br /><span className="small muted">{t('me.installSub')}</span></span>
          </button>
        )}

        {/* progress */}
        <section className="stack-2">
          <div className="row row--between" style={{ flexWrap: 'wrap', rowGap: 2 }}><div className="eyebrow">{t('me.badges')}</div><span className="xs mono muted">{t('me.streak', { n: s.streakDays })} · {t('me.runs', { n: s.runsCompleted })}</span></div>
          <div className="badges">
            {BADGES.map((b) => <div key={b.id} className={`badge-tile ${badges.has(b.id) ? 'badge-tile--on' : ''}`} title={t(`badges.${b.id}-sub`)}><span className="badge-tile__i"><Icon name={b.icon} /></span>{t(`badges.${b.id}`)}</div>)}
          </div>
        </section>
        <section className="card stack-2">
          <div className="eyebrow">{t('me.history')}</div>
          {scores.length === 0 ? <p className="small muted">{t('me.noHistory')}</p> : (
            <>
              <div className="history" aria-hidden="true">{scores.slice(-14).map((sc) => <span key={sc.id} style={{ height: `${Math.max(6, sc.pct)}%`, background: sc.pct >= 80 ? 'var(--ok)' : sc.pct >= 50 ? 'var(--warn)' : 'var(--bad)' }} title={`${sc.pct}%`} />)}</div>
              <div className="xs muted mono history__dates"><span>{fmtDate(scores[0]?.at)}</span>{scores.length > 1 && fmtDate(scores[0]?.at) !== fmtDate(scores[scores.length - 1]?.at) && <span>{fmtDate(scores[scores.length - 1]?.at)}</span>}</div>
            </>
          )}
        </section>

        {/* profile (marketing insight, consented) */}
        {signedIn && (
          <section className="card stack">
            <label className="row" style={{ alignItems: 'flex-start', gap: 'var(--s-3)' }}>
              <input type="checkbox" checked={auth.profile.consent} onChange={(e) => void auth.updateProfile({ consent: e.target.checked })} style={{ width: 20, height: 20, marginTop: 2 }} />
              <span className="small">{t('me.consent')}</span>
            </label>
            {auth.profile.consent && (
              <div className="stack-2 rise">
                <label className="field"><span className="field__label">{t('me.region')}</span>
                  <select className="input" value={auth.profile.region ?? ''} onChange={(e) => void auth.updateProfile({ region: e.target.value })}><option value="">—</option>{REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}</select></label>
                <label className="field"><span className="field__label">{t('me.city')}</span><input className="input" defaultValue={auth.profile.city ?? ''} onBlur={(e) => void auth.updateProfile({ city: e.target.value })} /></label>
                <label className="field"><span className="field__label">{t('me.howFound')}</span>
                  <select className="input" value={auth.profile.howFound ?? ''} onChange={(e) => void auth.updateProfile({ howFound: e.target.value })}><option value="">—</option>{howFound.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>
              </div>
            )}
          </section>
        )}

        {/* settings */}
        <section className="card">
          <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>{t('me.settings')}</div>
          <div className="setting"><div className="setting__l"><b>{t('me.language')}</b></div><Segmented value={s.lang} options={[{ value: 'en', label: 'English' }, { value: 'tl', label: 'Tagalog' }]} onChange={s.setLang} label={t('me.language')} /></div>
          <div className="setting"><div className="setting__l"><b>{t('me.theme')}</b></div><Segmented value={s.theme} options={[{ value: 'dark', label: t('me.dark') }, { value: 'light', label: t('me.light') }]} onChange={s.setTheme} label={t('me.theme')} /></div>
          <div className="setting"><div className="setting__l"><b>{t('me.sound')}</b></div><Toggle on={s.sound} onChange={() => s.toggleSound()} label={t('me.sound')} /></div>
          <div className="setting"><div className="setting__l"><b>{t('me.motion')}</b></div><Segmented value={s.motion} options={[{ value: 'auto', label: t('me.motionAuto') }, { value: 'off', label: t('me.motionOff') }]} onChange={s.setMotion} label={t('me.motion')} /></div>
          <div className="setting"><div className="setting__l"><b>{t('me.lowData')}</b><small>{t('me.lowDataSub')}</small></div><Toggle on={s.lowData} onChange={s.setLowData} label={t('me.lowData')} /></div>
          <div className="setting"><div className="setting__l"><b>{t('me.houseView')}</b></div><Segmented value={s.houseView} options={[{ value: 'game', label: t('me.houseViewGame') }, { value: 'plan', label: t('me.houseViewPlan') }, { value: '3d', label: t('me.houseView3d') }]} onChange={s.setHouseView} label={t('me.houseView')} /></div>
          <div className="setting"><div className="setting__l"><b>{t('me.itemArt')}</b><span className="xs muted">{t('me.itemArtHint')}</span></div><Segmented value={s.itemArt} options={[{ value: '3d', label: t('me.itemArt3d') }, { value: 'vector', label: t('me.itemArtVector') }]} onChange={(v) => s.setItemArt(v as '3d' | 'vector')} label={t('me.itemArt')} /></div>
        </section>

        {/* links */}
        <section className="card" style={{ padding: 'var(--s-2)' }}>
          <Row to="/pricing" icon="star" label={t('me.pricing')} />
          <Row to="/survey" icon="edit" label={t('me.feedback')} />
          <Row to="/hotlines" icon="phone" label={t('hotlines.title')} />
          <Row to="/plan" icon="card" label={t('plan.card')} />
          <Row to="/press" icon="eye" label={t('me.press')} />
        </section>

        {/* data */}
        <section className="card stack-2">
          <div className="eyebrow">{t('me.data')}</div>
          <div className="actions-2">
            <Button icon="download" onClick={() => void exportData()}>{t('me.export')}</Button>
            <Button variant="danger" icon="trash" onClick={() => setDel(true)}>{t('me.delete')}</Button>
          </div>
          <p className="xs muted">{t('me.about')} · {t('me.version')} 0.1.0 · prepare.ph</p>
        </section>
      </div>

      <Sheet open={signIn} onClose={() => setSignIn(false)} title={t('me.signInTitle')}>
        <div className="stack">
          <p className="small muted">{t('me.signInSub')}</p>
          {!cloudEnabled ? <div className="hint"><Icon name="cloud-off" size={18} />{t('me.cloudNotSet')}</div> : (
            <>
              <label className="field"><span className="field__label">{t('me.email')}</span><input className="input" type="email" inputMode="email" autoComplete="email" placeholder={t('me.emailPh')} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
              <Button variant="primary" block icon="cloud" disabled={!email.includes('@') || sent} onClick={() => void magic()}>{sent ? t('me.magicSent') : t('me.magic')}</Button>
              {GOOGLE_ENABLED && (<><div className="xs muted" style={{ textAlign: 'center' }}>{t('common.or')}</div><Button block onClick={() => void auth.signInWithGoogle()}>{t('me.google')}</Button></>)}
            </>
          )}
        </div>
      </Sheet>
      <Sheet open={del} onClose={() => setDel(false)} title={t('me.delete')}>
        <div className="stack">
          <p className="small">{t('me.deleteConfirm')}</p>
          <input className="input" value={delText} onChange={(e) => setDelText(e.target.value)} aria-label="DELETE" />
          <Button variant="danger" block disabled={delText !== 'DELETE'} onClick={() => void destroy()}>{t('me.delete')}</Button>
        </div>
      </Sheet>
    </div>
  );
}
