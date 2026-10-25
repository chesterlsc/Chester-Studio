import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Blueprint, type PlacedBlock } from '@/plan/Blueprint';
import { FLOOR_H, FLOOR_W } from '@/plan/floorplan';
import { catalogById } from '@/domain/catalog';
import { CAT_COLOR } from '@/scene/palette';
import { pick } from '@/i18n';
import '@/plan/plan.css';

const DEMO: Array<[string, string, number]> = [
  ['pantry', 'rice-kg', 5], ['pantry', 'canned-sardines', 12], ['pantry', 'canned-meat', 6], ['pantry', 'instant-noodles', 10], ['pantry', 'biscuits', 6],
  ['water-pad', 'water-drum', 1], ['water-pad', 'water-gallon-5', 3], ['water-shelf', 'water-bottle-1l', 12],
  ['power-station', 'flashlight', 2], ['power-station', 'batteries', 3], ['power-station', 'powerbank', 2], ['power-station', 'radio', 1],
  ['go-bag-rack', 'go-bag', 3], ['go-bag-rack', 'rain-gear', 3], ['tool-wall', 'tarp', 1], ['tool-wall', 'rope', 1], ['tool-wall', 'duct-tape', 2], ['hygiene', 'soap', 2], ['hygiene', 'tissue', 8],
];

/** Non-interactive ground-floor plan for the landing hero. */
export function PlanHero() {
  const { t } = useTranslation();
  const placed = useMemo<PlacedBlock[]>(() => {
    const count = new Map<string, number>();
    return DEMO.flatMap(([unitId, cid, qty]) => {
      const item = catalogById(cid); if (!item) return [];
      const slot = count.get(unitId) ?? 0; count.set(unitId, slot + 1);
      return [{ key: `${unitId}-${cid}`, unitId, slot, shape: item.shape, color: CAT_COLOR[item.category], qty, category: item.category, catalogId: cid, name: pick(item.name) }];
    });
  }, []);
  const region = useMemo(() => ({ x: -80, y: -80, w: FLOOR_W + 160, h: FLOOR_H + 170 }), []);
  return (
    <div className="plan-hero__in" aria-hidden="true">
      <Blueprint placed={placed} selectedRoom={null} onSelectRoom={() => {}} attention={new Set(['bodega', 'entry'])} roomPct={{ kitchen: .7, water: .8, bathroom: .4, sala: .75, entry: .2, bodega: .3 }} hidden={new Set()} roomLabel={(id) => t(`room.${id}`)} region={region}
        title={{ project: t('plan.title'), client: 'Demo home', scenario: t('scenario.typhoon'), duration: '7 d', readiness: 64, date: '', sheet: 'A-101' }} />
    </div>
  );
}
