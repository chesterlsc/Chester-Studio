/**
 * Throwaway test page for src/models/ItemViewer.tsx — served by
 * `npx vite --port 5180` at /tools/viewer/index.html. Not part of the app build.
 * Query: ?shapes=bottle,drum&colors=%234fb8ff,%23ff6f8d&spin=0
 */
import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import type { ItemShape } from '@/domain/types';
import { CAT_COLOR } from '@/scene/palette';
import { spriteFor, spriteUrl } from '@/models/useSprite';

const ItemViewer = lazy(() => import('@/models/ItemViewer'));

const q = new URLSearchParams(location.search);
const shapes = (q.get('shapes')?.split(',') ?? ['bottle', 'drum', 'can', 'bag', 'kit', 'radio', 'lamp', 'lock']) as ItemShape[];
const colors = q.get('colors')?.split(',') ?? [CAT_COLOR.water, CAT_COLOR.medicine];
const spin = Number(q.get('spin') ?? '0.6');

function App() {
  return (
    <>
      <div className="grid">
        {shapes.flatMap((shape) => colors.map((color) => (
          <div className="cell" key={shape + color}>
            <div className="v">
              <Suspense fallback={<p>loading…</p>}>
                <ItemViewer shape={shape} color={color} label={`${shape} ${color}`} spin={spin} />
              </Suspense>
            </div>
            <p>{shape} · {color}</p>
          </div>
        )))}
      </div>
      <h1>spriteFor() picks</h1>
      <div className="sprites">
        {[['water-bottle-1l', 1], ['water-bottle-1l', 6], ['canned-sardines', 1], ['canned-sardines', 3], ['water-drum', 1], ['go-bag', 1]].map(([id, qty]) => {
          const s = spriteFor(id as string, qty as number);
          return s ? <img key={`${id}-${qty}`} src={spriteUrl(s)} alt={`${id} ×${qty}`} title={`${s.w}×${s.h} base ${s.base}`} /> : null;
        })}
      </div>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
