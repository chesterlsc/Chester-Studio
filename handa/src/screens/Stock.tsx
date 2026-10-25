import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Empty, Hint, Icon, Sheet, Stepper, Toggle, toast, TopBar } from '@/ui';
import { useSession } from '@/store/useSession';
import { clearHouseholdInventory, removeItem, setExpiry, setQty, useInventory } from '@/store/useInventory';
import { catalogById } from '@/domain/catalog';
import type { InventoryRow } from '@/domain/types';
import { CATEGORY_ROOM, ROOM_ORDER, type RoomId } from '@/domain/rooms';
import { linksFor, AFFILIATE_DISCLOSURE } from '@/content';
import { pick } from '@/i18n';
import { daysUntil, fmtDate } from '@/lib/format';
import { CAT_COLOR } from '@/scene/palette';
import { kv } from '@/native/storage';
import { requestNotifyPermission } from '@/native/notify';
import './screens.css';


export default function Stock() {
  const { t } = useTranslation();
  const householdId = useSession((s) => s.householdId);
  const inventory = useInventory(householdId);
  const [buy, setBuy] = useState<InventoryRow | null>(null);
  const [reminders, setReminders] = useState(kv.get('handa.reminders') === '1');

  const expiring = useMemo(() => inventory.filter((r) => { const d = daysUntil(r.expiresAt); return d !== null && d <= 30; }).sort((a, b) => (a.expiresAt ?? 0) - (b.expiresAt ?? 0)), [inventory]);
  const bySlot = useMemo(() => {
    const m = new Map<RoomId, InventoryRow[]>();
    for (const r of inventory) { const item = catalogById(r.catalogId); if (!item) continue; const room = CATEGORY_ROOM[item.category]; m.set(room, [...(m.get(room) ?? []), r]); }
    return m;
  }, [inventory]);

  const toggleReminders = async (v: boolean) => {
    if (v) { const ok = await requestNotifyPermission(); if (!ok) { toast(t('me.lowDataSub'), 'warn'); } }
    kv.set('handa.reminders', v ? '1' : '0'); setReminders(v);
    toast(v ? t('stock.remindersOn') : t('stock.remindersOff'), v ? 'ok' : undefined, 'bell');
  };

  const Row = ({ r }: { r: InventoryRow }) => {
    const item = catalogById(r.catalogId);
    if (!item) return null;
    const d = daysUntil(r.expiresAt);
    const expCls = d === null ? '' : d < 0 ? 'stock-row__exp--bad' : d <= 30 ? 'stock-row__exp--warn' : '';
    return (
      <div className="stock-row">
        <span className="lrow__icon" style={{ '--row-color': CAT_COLOR[item.category], color: CAT_COLOR[item.category] } as React.CSSProperties}><Icon name={`cat-${item.category}`} /></span>
        <div className="grow" style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pick(item.name)}</div>
          <div className="row" style={{ gap: 'var(--s-2)', flexWrap: 'wrap' }}>
            <label className={`stock-row__exp ${expCls}`}>
              <Icon name="calendar" size={12} />
              {r.expiresAt ? (d !== null && d < 0 ? t('stock.expired') : fmtDate(r.expiresAt)) : t('stock.noExpiry')}
              <input type="date" aria-label={t('stock.setExpiry')} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} value={r.expiresAt ? new Date(r.expiresAt).toISOString().slice(0, 10) : ''} onChange={(e) => void setExpiry(r, e.target.value ? new Date(e.target.value).getTime() : undefined)} />
            </label>
            {item.buy && <button type="button" className="xs" style={{ color: 'var(--info)', fontWeight: 600 }} onClick={() => setBuy(r)}>{t('stock.where')}</button>}
            <button type="button" className="xs" style={{ color: 'var(--fg-3)' }} onClick={() => void removeItem(r)} aria-label={t('common.remove')}><Icon name="trash" size={14} /></button>
          </div>
        </div>
        <Stepper value={r.qty} min={0} max={999} onChange={(v) => void setQty(r, v)} label={t('stock.qty')} />
      </div>
    );
  };

  return (
    <div className="page">
      <TopBar title={t('stock.title')} right={inventory.length > 0 ? <Button size="sm" variant="ghost" icon="trash" onClick={() => { if (householdId && confirm(t('stock.clearConfirm'))) void clearHouseholdInventory(householdId); }}>{t('stock.clear')}</Button> : undefined} />
      <p className="muted" style={{ marginBottom: 'var(--s-4)' }}>{t('stock.sub')}</p>

      <div className="stack">
        <Link to="/plan" className="card row" style={{ gap: 'var(--s-4)' }}>
          <span className="lrow__icon" style={{ color: 'var(--brand)' }}><Icon name="card" /></span>
          <span className="grow"><b>{t('stock.plan')}</b><br /><span className="small muted">{t('stock.planSub')}</span></span>
          <Icon name="chevron" style={{ color: 'var(--fg-3)' }} />
        </Link>
        <div className="card setting" style={{ border: '1px solid var(--line)' }}>
          <div className="setting__l"><b>{t('stock.reminders')}</b><small>{t('stock.remindersSub')}</small></div>
          <Toggle on={reminders} onChange={(v) => void toggleReminders(v)} label={t('stock.reminders')} />
        </div>
      </div>

      {inventory.length === 0 ? (
        <Empty icon="inventory" title={t('stock.empty')} body={t('stock.emptyBody')} action={<Link to="/play"><Button variant="primary" icon="play">{t('landing.cta')}</Button></Link>} />
      ) : (
        <>
          <div style={{ marginTop: 'var(--s-5)' }}><Hint id="fifo">{t('stock.fifo')}</Hint></div>
          {expiring.length > 0 && (
            <div className="card" style={{ marginTop: 'var(--s-4)', borderColor: 'var(--warn)' }}>
              <div className="row" style={{ marginBottom: 'var(--s-2)' }}><Badge kind="warn">{t('stock.expiring')}</Badge></div>
              {expiring.map((r) => <Row key={r.id} r={r} />)}
            </div>
          )}
          <div className="eyebrow" style={{ marginTop: 'var(--s-6)' }}>{t('stock.byLocation')}</div>
          {ROOM_ORDER.filter((s) => bySlot.has(s)).map((slot) => (
            <div key={slot}>
              <div className="loc-head"><Icon name="house-cut" size={16} style={{ color: 'var(--fg-2)' }} /><h4>{t(`room.${slot}`)}</h4><span className="xs mono muted">{bySlot.get(slot)!.length}</span></div>
              <div className="card" style={{ marginTop: 'var(--s-2)', paddingTop: 0, paddingBottom: 0 }}>{bySlot.get(slot)!.map((r) => <Row key={r.id} r={r} />)}</div>
            </div>
          ))}
        </>
      )}

      <Sheet open={!!buy} onClose={() => setBuy(null)} title={t('stock.where')}>
        {buy && (() => {
          const item = catalogById(buy.catalogId);
          const links = item?.buy ? linksFor(item.buy) : undefined;
          const entries = links ? ([['Shopee', links.shopee], ['Lazada', links.lazada], ['TikTok Shop', links.tiktok], ['Amazon', links.amazon]] as Array<[string, string | undefined]>).filter((e) => e[1]) : [];
          return (
            <div className="stack">
              <p style={{ fontWeight: 600 }}>{item ? pick(item.name) : ''}</p>
              <div className="buy-links">
                {entries.map(([label, url]) => <a key={label} className="buy-link" href={url} target="_blank" rel="noopener noreferrer sponsored">{label}<Icon name="external" size={18} style={{ color: 'var(--fg-3)' }} /></a>)}
              </div>
              <p className="xs muted">{pick(AFFILIATE_DISCLOSURE)}</p>
            </div>
          );
        })()}
      </Sheet>
    </div>
  );
}
