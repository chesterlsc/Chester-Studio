import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Icon, toast } from '@/ui';
import { guideById } from '@/content';
import { pick } from '@/i18n';
import { sfx } from '@/lib/sound';
import type { IconName } from '@/design/icons/names';
import './screens.css';

export default function LearnDeck() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { id } = useParams();
  const guide = id ? guideById(id) : undefined;
  const scroller = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => { if (!guide) nav('/learn', { replace: true }); }, [guide, nav]);
  if (!guide) return null;

  const total = guide.cards.length + guide.quiz.length + 1; // + result card
  const goTo = (n: number) => {
    const k = Math.max(0, Math.min(total - 1, n));
    setI(k);
    const el = scroller.current;
    if (el) el.scrollTo({ left: k * el.clientWidth, behavior: 'smooth' });
  };
  const onScroll = () => {
    const el = scroller.current; if (!el) return;
    const k = Math.round(el.scrollLeft / el.clientWidth);
    if (k !== i) setI(k);
  };
  const right = guide.quiz.reduce((n, q, k) => n + (answers[k] === q.answer ? 1 : 0), 0);
  const answered = Object.keys(answers).length;
  const isQuiz = i >= guide.cards.length && i < total - 1;
  const quizIdx = i - guide.cards.length;

  return (
    <div className="deck">
      <div className="deck__top">
        <Button variant="ghost" iconOnly icon="close" aria-label={t('common.close')} onClick={() => nav('/learn')} />
        <div className="deck__progress" aria-label={t('learn.card', { n: i + 1, total })}>{Array.from({ length: total }).map((_, k) => <span key={k} className={k <= i ? 'on' : ''} />)}</div>
        <span className="xs mono muted">{i + 1}/{total}</span>
      </div>
      <div className="deck__cards" ref={scroller} onScroll={onScroll}>
        {guide.cards.map((c, k) => (
          <section className="dcard" key={`c${k}`} aria-roledescription="card">
            <div className="dcard__in rise">
              {guide.health && k === 0 && <div className="health-banner"><Icon name="warning" size={18} style={{ flex: 'none', color: 'var(--warn)' }} />{t('learn.health')}</div>}
              <div className="dcard__icon"><Icon name={(c.icon as IconName) ?? 'book'} size={32} /></div>
              <h2 className="dcard__title">{pick(c.title)}</h2>
              <p className="dcard__body">{pick(c.body)}</p>
              {c.action && <div className="dcard__action"><Icon name="check" size={18} style={{ color: 'var(--ok)', flex: 'none', marginTop: 3 }} />{pick(c.action)}</div>}
              {guide.health && k === guide.cards.length - 1 && (
                <div className="stack-2">
                  <div className="eyebrow">{t('learn.whenHelp')}</div>
                  <ul className="stack-2">{guide.health.whenToGetHelp.map((w, j) => <li key={j} className="row small" style={{ alignItems: 'flex-start' }}><Icon name="phone" size={16} style={{ color: 'var(--bad)', flex: 'none', marginTop: 3 }} />{pick(w)}</li>)}</ul>
                </div>
              )}
            </div>
          </section>
        ))}
        {guide.quiz.map((q, k) => (
          <section className="dcard" key={`q${k}`}>
            <div className="dcard__in">
              <div className="eyebrow">{t('learn.quiz')} {k + 1}/{guide.quiz.length}</div>
              <h3 className="dcard__title" style={{ fontSize: 'var(--fs-xl)' }}>{pick(q.q)}</h3>
              <div className="stack-2">
                {q.choices.map((ch, j) => {
                  const picked = answers[k];
                  const cls = picked === undefined ? '' : j === q.answer ? 'quiz__opt--right' : picked === j ? 'quiz__opt--wrong' : '';
                  return (
                    <button key={j} type="button" className={`quiz__opt ${cls}`} disabled={picked !== undefined} onClick={() => { setAnswers((a) => ({ ...a, [k]: j })); if (j === q.answer) sfx.pop(); else sfx.warn(); }}>
                      <span className="mono xs muted">{String.fromCharCode(65 + j)}</span>{pick(ch)}
                    </button>
                  );
                })}
              </div>
              {answers[k] !== undefined && <p className="small rise" style={{ color: answers[k] === q.answer ? 'var(--ok)' : 'var(--warn)' }}><b>{answers[k] === q.answer ? t('learn.correct') : t('learn.wrong')}.</b> {pick(q.why)}</p>}
            </div>
          </section>
        ))}
        <section className="dcard" key="result">
          <div className="dcard__in" style={{ textAlign: 'center', placeItems: 'center' }}>
            <div className="dcard__icon" style={{ background: 'var(--ok-dim)', color: 'var(--ok)' }}><Icon name="trophy" size={32} /></div>
            <h2 className="dcard__title">{t('learn.done')}</h2>
            <p className="dcard__body">{guide.quiz.length ? t('learn.quizDone', { right, total: guide.quiz.length }) : pick(guide.blurb)}</p>
            {guide.sources.length > 0 && (
              <div className="stack-2" style={{ width: '100%' }}>
                <div className="eyebrow">{t('learn.sources')}</div>
                {guide.sources.map((s) => <a key={s.url} className="row small" href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info)', justifyContent: 'center' }}>{s.label}<Icon name="external" size={14} /></a>)}
              </div>
            )}
            <Button variant="primary" size="lg" onClick={() => { toast(t('learn.done'), 'ok', 'check'); nav('/learn'); }}>{t('learn.finish')}</Button>
          </div>
        </section>
      </div>
      <div className="deck__foot">
        <Button variant="ghost" icon="back" disabled={i === 0} onClick={() => goTo(i - 1)}>{t('common.back')}</Button>
        <span className="xs muted">{t('learn.swipe')}</span>
        <Button variant={i === total - 1 ? 'ghost' : 'primary'} iconRight="chevron" disabled={i === total - 1 || (isQuiz && answers[quizIdx] === undefined && answered < guide.quiz.length && quizIdx >= 0 && answers[quizIdx] === undefined)} onClick={() => goTo(i + 1)}>{t('common.next')}</Button>
      </div>
    </div>
  );
}
