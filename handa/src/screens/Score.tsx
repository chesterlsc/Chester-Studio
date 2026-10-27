import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, Icon, Meter, Ring, toast } from '@/ui';
import { db } from '@/store/db';
import { useSession } from '@/store/useSession';
import { useSettings } from '@/store/useSettings';
import { usePresentation } from '@/store/usePresentation';
import { SCENARIOS } from '@/domain/scenarios';
import { BADGES, earnedBadges } from '@/domain/badges';
import type { CategoryId, Score as ScoreRow } from '@/domain/types';

const EMPTY_SCORES: ScoreRow[] = [];
import { CAT_COLOR } from '@/scene/palette';
import { canvasToBlob, renderReadyCard } from '@/lib/readyCard';
import { shareImage, downloadBlob, facebookShareUrl } from '@/native/share';
import { fmtDays, readinessColor, readinessLevel } from '@/lib/format';
import './screens.css';

const SITE = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://prepare.ph';

export default function Score() {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const { runId, scenario, reset } = useSession();
  const { surveyDone, runsCompleted, streakDays, lang } = useSettings();
  const presentation = usePresentation((s) => s.active);
  const setPresentation = usePresentation((s) => s.set);
  const score = useLiveQuery<ScoreRow | undefined>(async () => (runId ? (await db.scores.where('runId').equals(runId).reverse().sortBy('at'))[0] : undefined), [runId]);
  const allScores = useLiveQuery<ScoreRow[]>(async () => db.scores.toArray(), []) ?? EMPTY_SCORES;
  const [img, setImg] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => { if (!runId) nav('/play', { replace: true }); }, [runId, nav]);

  const level = score ? readinessLevel(score.pct) : 0;
  const badges = useMemo(() => earnedBadges(allScores, streakDays), [allScores, streakDays]);
  const prevBadges = useMemo(() => earnedBadges(allScores.filter((s) => s.id !== score?.id), streakDays), [allScores, score, streakDays]);
  const newBadges = BADGES.filter((b) => badges.has(b.id) && !prevBadges.has(b.id));

  useEffect(() => {
    if (!score || !scenario) return;
    let alive = true;
    void renderReadyCard({
      pct: score.pct, scenario, scenarioLabel: t(`scenario.${scenario}`), daysLabel: `${t('score.days')}: ${fmtDays(score.daysCovered)}`,
      levelLabel: t(`score.level.${level}`), tagline: t('score.cardCta'), readyLabel: t('score.ready'), hue: SCENARIOS[scenario].hue, lang: lang,
    }).then((c) => { if (!alive) return; canvasRef.current = c; setImg(c.toDataURL('image/png')); });
    return () => { alive = false; };
  }, [score, scenario, level, t, lang, i18n.language]);

  useEffect(() => {
    if (!presentation) return;
    const id = setTimeout(() => { setPresentation(false); nav('/press'); }, 5000);
    return () => clearTimeout(id);
  }, [presentation, nav, setPresentation]);

  const share = async () => {
    if (!canvasRef.current || !score || !scenario) return;
    const blob = await canvasToBlob(canvasRef.current);
    const text = t('score.cardLine', { pct: score.pct, scenario: t(`scenario.${scenario}`), days: fmtDays(score.daysCovered) });
    const r = await shareImage(blob, 'handa-ready-card.png', text, SITE);
    if (r === 'downloaded') { window.open(facebookShareUrl(SITE), '_blank', 'noopener'); toast(t('score.shared'), 'ok', 'share'); }
  };
  const save = async () => {
    if (!canvasRef.current) return;
    downloadBlob(await canvasToBlob(canvasRef.current), 'handa-ready-card.png');
  };

  if (!score || !scenario) return <div className="score"><p className="muted">{t('common.loading')}</p></div>;
  const gaps = (Object.entries(score.categories) as Array<[CategoryId, number]>).sort((a, b) => a[1] - b[1]).slice(0, 3);

  return (
    <div className="score">
      <div className="row row--between">
        <Button variant="ghost" iconOnly icon="close" aria-label={t('common.close')} onClick={() => { reset(); nav('/'); }} />
        <span className="eyebrow">{t('score.title')}</span>
        <span style={{ width: 48 }} />
      </div>
      <div className="score__hero pop">
        <Ring value={score.pct} size={200} stroke={16} color={readinessColor(score.pct)}>
          <div className="score__pct">{score.pct}<small>%</small></div>
        </Ring>
        <div className="score__level" style={{ color: readinessColor(score.pct) }}>{t(`score.level.${level}`)}</div>
        <div className="score__meta"><Icon name={scenario} size={16} /><span>{t(`scenario.${scenario}`)}</span><span aria-hidden="true">·</span><span>{t('score.days')}: <b className="mono" style={{ color: 'var(--fg)' }}>{fmtDays(score.daysCovered)}</b></span></div>
      </div>

      {newBadges.length > 0 && (
        <div className="card rise" style={{ borderColor: 'var(--brand)' }}>
          <div className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>{t('score.badgeNew')}</div>
          <div className="badges">
            {newBadges.map((b) => (
              <div key={b.id} className="badge-tile badge-tile--on pop"><span className="badge-tile__i"><Icon name={b.icon} /></span>{t(`badges.${b.id}`)}</div>
            ))}
          </div>
        </div>
      )}

      <div className="score__card rise">{img ? <img src={img} alt={t('score.title')} width={1200} height={630} /> : <div style={{ aspectRatio: '1200/630', background: 'var(--bg-2)' }} />}</div>
      <p className="xs muted" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="lock" size={14} style={{ flex: 'none' }} />{t('score.privacy')}</p>

      <div className="actions-2">
        <Button variant="primary" size="lg" icon="share" onClick={() => void share()}>{t('score.share')}</Button>
        <Button size="lg" icon="download" onClick={() => void save()}>{t('score.save')}</Button>
      </div>

      {gaps.length > 0 && (
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>{t('score.topMissing')}</div>
          {gaps.map(([c, p]) => (
            <div className="gap" key={c}>
              <span className="gap__label">{t(`cat.${c}`)}</span>
              <Meter value={p * 100} color={CAT_COLOR[c]} size="sm" />
              <span className="mono xs muted" style={{ minWidth: 36, textAlign: 'right' }}>{Math.round(p * 100)}%</span>
            </div>
          ))}
          <Button block icon="house-cut" style={{ marginTop: 'var(--s-4)' }} onClick={() => nav('/house')}>{t('score.improve')}</Button>
        </div>
      )}

      <div className="stack-2">
        <Button block variant="secondary" icon="play" onClick={() => { reset(); nav('/play'); }}>{t('score.again')}</Button>
        {!surveyDone && runsCompleted >= 1 && <Button block variant="ghost" icon="star" onClick={() => nav('/survey')}>{t('score.survey')}</Button>}
      </div>
    </div>
  );
}
