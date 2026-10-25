import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '@/ui';
import { useSettings } from '@/store/useSettings';
import type { IconName } from '@/design/icons/names';
import './screens.css';

const STEPS: Array<{ icon: IconName; color: string }> = [
  { icon: 'typhoon', color: 'var(--info)' },
  { icon: 'house-cut', color: 'var(--brand)' },
  { icon: 'card', color: 'var(--ok)' },
];

export function Onboarding() {
  const { t } = useTranslation();
  const setOnboarded = useSettings((s) => s.setOnboarded);
  const [i, setI] = useState(0);
  const last = i === STEPS.length - 1;
  return (
    <div className="onb" role="dialog" aria-modal="true" aria-label={t('onboard.s1t')}>
      <div className="row row--between">
        <div className="dots">{STEPS.map((_, k) => <span key={k} className={k <= i ? 'on' : ''} />)}</div>
        <Button variant="ghost" size="sm" onClick={() => setOnboarded(true)}>{t('common.skip')}</Button>
      </div>
      <div className="onb__art" key={i}>
        <div className="pop" style={{ width: 160, height: 160, borderRadius: 48, display: 'grid', placeItems: 'center', background: `color-mix(in srgb, ${STEPS[i].color} 18%, var(--bg-2))`, color: STEPS[i].color, border: '1px solid var(--line)' }}>
          <Icon name={STEPS[i].icon} size={84} strokeWidth={1.5} />
        </div>
      </div>
      <div className="stack-6">
        <div className="onb__body rise" key={`b${i}`}>
          <h2>{t(`onboard.s${i + 1}t`)}</h2>
          <p>{t(`onboard.s${i + 1}b`)}</p>
        </div>
        <div className="onb__foot">
          <Button variant="ghost" icon="back" disabled={i === 0} onClick={() => setI(i - 1)}>{t('common.back')}</Button>
          <Button variant="primary" size="lg" iconRight={last ? undefined : 'chevron'} onClick={() => (last ? setOnboarded(true) : setI(i + 1))}>
            {last ? t('onboard.go') : t('common.next')}
          </Button>
        </div>
      </div>
    </div>
  );
}
