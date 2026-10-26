import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HouseMap } from '@/game/HouseMap';
import type { PlacedSprite } from '@/game/RoomScene';
import { catalogById } from '@/domain/catalog';
import { CATEGORY_ROOM, type RoomId } from '@/domain/rooms';
import { LAYOUTS } from '@/game/layouts';
import { CAT_COLOR } from '@/scene/palette';
import { pick } from '@/i18n';
import '@/game/game.css';

const DEMO: Array<[string, number]> = [['rice-kg', 5], ['canned-sardines', 12], ['canned-meat', 6], ['instant-noodles', 10], ['biscuits', 6], ['water-drum', 1], ['water-gallon-5', 3], ['water-bottle-1l', 12], ['first-aid-kit', 1], ['paracetamol', 2], ['ors', 4], ['diapers', 2], ['formula', 2], ['flashlight', 2], ['batteries', 3], ['powerbank', 2], ['solar-panel', 1], ['radio', 1], ['documents', 1], ['cash-small', 10], ['go-bag', 3], ['rain-gear', 3], ['tarp', 1], ['rope', 1], ['duct-tape', 2], ['soap', 2], ['tissue', 8], ['door-lock', 1]];

/** Static dollhouse for the landing hero. */
export function GameHero() {
  const { t } = useTranslation();
  const placedByRoom = useMemo(() => {
    const count = new Map<string, number>(); const o: Partial<Record<RoomId, PlacedSprite[]>> = {};
    for (const [cid, qty] of DEMO) {
      const item = catalogById(cid); if (!item) continue;
      const room = CATEGORY_ROOM[item.category]; const L = LAYOUTS[room];
      const pref = L.unitFor?.[item.category]; let u = (pref && L.units.find((x) => x.id === pref)) || L.units[0];
      if (room === 'water') u = ['drum', 'gallon', 'bottle'].includes(item.shape) ? L.units[0] : L.units[1];
      const slot = count.get(u.id) ?? 0; count.set(u.id, slot + 1);
      (o[room] ??= []).push({ key: cid, catalogId: cid, shape: item.shape, category: item.category, color: CAT_COLOR[item.category], unitId: u.id, slot, qty, name: pick(item.name) });
    }
    return o;
  }, []);
  return (
    <div className="game-hero" aria-hidden="true">
      <HouseMap placedByRoom={placedByRoom} roomPct={{ kitchen: .7, water: .8, bedroom: .6, bathroom: .4, sala: .75, study: .5, entry: .3, bodega: .35, saferoom: .2 }} missingCount={{ entry: 1, bodega: 1, saferoom: 2 }} weather="rain" lightsOn onSelect={() => {}} label={(r) => t(`room.${r}`)} />
    </div>
  );
}
