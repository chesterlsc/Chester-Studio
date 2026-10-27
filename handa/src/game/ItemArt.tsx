import { Suspense, lazy } from 'react';
import type { ItemShape } from '@/domain/types';
import { useSettings } from '@/store/useSettings';
import { spriteFor, spriteUrl } from '@/models/useSprite';
import { GameDefs, Sprite } from './Sprites';
import './art.css';

const ItemViewer = lazy(() => import('@/models/ItemViewer'));

/** Whether the pre-rendered 3D cartoon art is active (setting + not low-data). */
export function use3dArt(): boolean {
  const art = useSettings((s) => s.itemArt);
  const lowData = useSettings((s) => s.lowData);
  return art === '3d' && !lowData;
}

/**
 * Item thumbnail for trays, lists and cards: the pre-rendered 3D cartoon
 * sprite when available, else the vector sprite.
 */
export function ItemArt({ itemId, shape, color, qty = 1, size = 60, alt = '' }: { itemId: string; shape: ItemShape; color: string; qty?: number; size?: number; alt?: string }) {
  const td = use3dArt();
  const entry = td ? spriteFor(itemId, qty) : undefined;
  if (entry) return <img className="iart" src={spriteUrl(entry)} width={size} height={Math.round(size * entry.h / entry.w)} alt={alt} draggable={false} loading="lazy" decoding="async" />;
  return <svg viewBox="-50 -62 100 120" width={size} height={Math.round(size * 1.07)} aria-label={alt || undefined} role={alt ? 'img' : undefined}><GameDefs /><Sprite shape={shape} color={color} size={100} qty={qty} /></svg>;
}

/** Hero art for the inspect sheet: a live, draggable 3D model, or the sprite. */
export function ItemHero({ itemId, shape, color, label, qty = 1 }: { itemId: string; shape: ItemShape; color: string; label: string; qty?: number }) {
  const td = use3dArt();
  const fallback = <ItemArt itemId={itemId} shape={shape} color={color} qty={qty} size={96} alt={label} />;
  if (!td) return <div className="ihero">{fallback}</div>;
  return (
    <div className="ihero ihero--3d">
      <Suspense fallback={fallback}><ItemViewer shape={shape} color={color} label={label} className="ihero__canvas" /></Suspense>
    </div>
  );
}
