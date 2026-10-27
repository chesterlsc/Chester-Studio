import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Chip, Empty, Hint, Icon, TopBar } from '@/ui';
import { GUIDES } from '@/content';
import type { GuideLevel, GuideSection } from '@/content/types';
import { canAccessLevel, PAYMENTS_ENABLED } from '@/domain/tiers';
import { useAuth } from '@/sync/useAuth';
import { pick } from '@/i18n';
import type { IconName } from '@/design/icons/names';
import './screens.css';

const SECTIONS: Array<{ id: GuideSection; icon: IconName }> = [
  { id: 'learn', icon: 'book' }, { id: 'firstaid', icon: 'bandage' }, { id: 'baby', icon: 'baby' }, { id: 'safety', icon: 'shield' }, { id: 'diy', icon: 'tool' }, { id: 'workout', icon: 'dumbbell' }, { id: 'tips', icon: 'bulb' },
];
const LEVELS: GuideLevel[] = ['basic', 'intermediate', 'pro'];

export default function Learn() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const tier = useAuth((s) => s.tier);
  const [section, setSection] = useState<GuideSection>('learn');
  const [level, setLevel] = useState<GuideLevel | 'all'>('all');
  const list = useMemo(() => GUIDES.filter((g) => g.section === section && (level === 'all' || g.level === level)), [section, level]);

  return (
    <div className="page">
      <TopBar title={t('learn.title')} right={<Link to="/hotlines"><Button size="sm" icon="phone">{t('learn.hotlines')}</Button></Link>} />
      <p className="muted" style={{ marginBottom: 'var(--s-4)' }}>{t('learn.sub')}</p>
      <div className="scen-rail no-scrollbar" style={{ marginBottom: 'var(--s-3)' }}>
        {SECTIONS.map((s) => <Chip key={s.id} on={section === s.id} onClick={() => setSection(s.id)}><Icon name={s.icon} size={18} />{t(`learn.sections.${s.id}`)}</Chip>)}
      </div>
      <div className="chips" style={{ marginBottom: 'var(--s-5)' }}>
        <Chip on={level === 'all'} onClick={() => setLevel('all')}>{t('common.seeAll')}</Chip>
        {LEVELS.map((l) => <Chip key={l} on={level === l} onClick={() => setLevel(l)}>{t(`learn.levels.${l}`)}{l !== 'basic' && PAYMENTS_ENABLED && !canAccessLevel(tier, l) && <Icon name="lock" size={14} />}</Chip>)}
      </div>
      <Hint id="learn">{t('learn.sub')} {t('learn.lockedSub')}</Hint>
      <div className="stack stagger" style={{ marginTop: 'var(--s-4)' }}>
        {list.length === 0 && <Empty icon="book" title={t('learn.empty')} />}
        {list.map((g) => {
          const locked = PAYMENTS_ENABLED && !canAccessLevel(tier, g.level);
          return (
            <button key={g.id} type="button" className="guide" onClick={() => (locked ? nav('/pricing') : nav(`/learn/${g.id}`))}>
              <span className="guide__i"><Icon name={(g.cards[0]?.icon as IconName) ?? 'book'} /></span>
              <span style={{ minWidth: 0 }}>
                <span style={{ fontWeight: 700, display: 'block' }}>{pick(g.title)}</span>
                <span className="small muted" style={{ display: 'block' }}>{pick(g.blurb)}</span>
                <span className="guide__meta" style={{ marginTop: 6 }}>
                  <Badge kind={g.level === 'basic' ? 'ok' : g.level === 'intermediate' ? 'warn' : 'brand'}>{t(`learn.levels.${g.level}`)}</Badge>
                  <span><Icon name="clock" size={12} />{g.seconds}{t('common.sec')}</span>
                  <span>{t('learn.cards', { count: g.cards.length })}</span>
                </span>
              </span>
              <Icon name={locked ? 'lock' : 'chevron'} style={{ color: 'var(--fg-3)', flex: 'none' }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
