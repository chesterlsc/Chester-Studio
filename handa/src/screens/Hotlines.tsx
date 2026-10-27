import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Icon, TopBar } from '@/ui';
import { HOTLINES } from '@/content';
import { pick } from '@/i18n';
import './screens.css';

export default function Hotlines() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const regions = useMemo(() => Array.from(new Set(HOTLINES.map((h) => h.region))), []);
  const [region, setRegion] = useState(regions[0] ?? 'National');
  const list = HOTLINES.filter((h) => h.region === region);
  return (
    <div className="page">
      <TopBar title={t('hotlines.title')} onBack={() => nav(-1)} />
      <p className="muted" style={{ marginBottom: 'var(--s-4)' }}>{t('hotlines.sub')}</p>
      <div className="chips" style={{ marginBottom: 'var(--s-4)' }}>{regions.map((r) => <Chip key={r} on={region === r} onClick={() => setRegion(r)}>{r}</Chip>)}</div>
      <div className="card stack-2">
        {list.map((h, i) => (
          <div className="lrow" key={i}>
            <span className="lrow__icon" style={{ '--row-color': 'var(--bad)' } as React.CSSProperties}><Icon name="phone" /></span>
            <div className="grow">
              <div style={{ fontWeight: 600 }}>{pick(h.org)}{h.city ? ` · ${h.city}` : ''}</div>
              <div className="small muted mono" style={{ overflowWrap: 'anywhere' }}>{h.numbers.join(' · ')}</div>
            </div>
            <a href={`tel:${h.numbers[0].replace(/[^\d+]/g, '')}`} className="btn btn--primary btn--sm">{t('hotlines.call')}</a>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 'var(--s-4)' }}>
        <h4 style={{ marginBottom: 'var(--s-2)' }}>{t('hotlines.evac')}</h4>
        <p className="small muted" style={{ marginBottom: 'var(--s-3)' }}>{t('hotlines.evacSub')}</p>
        <div className="chips">
          <a href="https://ndrrmc.gov.ph" target="_blank" rel="noopener noreferrer"><Button size="sm" iconRight="external">NDRRMC</Button></a>
          <a href="https://www.pagasa.dost.gov.ph" target="_blank" rel="noopener noreferrer"><Button size="sm" iconRight="external">PAGASA</Button></a>
          <a href="https://www.phivolcs.dost.gov.ph" target="_blank" rel="noopener noreferrer"><Button size="sm" iconRight="external">PHIVOLCS</Button></a>
          <a href="https://redcross.org.ph" target="_blank" rel="noopener noreferrer"><Button size="sm" iconRight="external">Red Cross</Button></a>
        </div>
      </div>
    </div>
  );
}
