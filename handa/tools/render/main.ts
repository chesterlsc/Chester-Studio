/**
 * Offline sprite + GLB renderer for the HANDA item models.
 * Served by `npx vite --port 5180` at /tools/render/index.html and driven by
 * scripts/build-models.mjs through `window.__render` / `window.__exportGlb`.
 *
 * Camera: orthographic 3/4 view (azimuth 32° to the right, 24° above), light from
 * the top-left-front like the 2D rooms. Output: 256 px wide WebP with alpha, the
 * object (including its ink outline) filling ~85 % of the width or height,
 * whichever is tighter. `base` is the y of the object's contact point
 * (model origin) as a fraction of the image height.
 */
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CATALOG } from '@/domain/catalog';
import type { ItemShape } from '@/domain/types';
import { CAT_COLOR } from '@/scene/palette';
import { buildModel, SHAPES, variantFor } from '@/models/build';
import { addOutline, LIGHT, placeLight } from '@/models/toon';

const W = 256;           // sprite width
const FILL = .85;        // object fills this fraction of the width (or height)
const OUT_PX = 7;        // ink outline thickness at 256 px
const PAD = 12;          // transparent padding above / below
const SS = 2;            // supersampling factor
const NEUTRAL = '#b9c2d6';

export interface RenderResult { dataUrl: string; w: number; h: number; base: number }
export interface ItemInfo { id: string; shape: ItemShape; color: string; variants: string[] }

const gl = document.getElementById('gl') as HTMLCanvasElement;
const out = document.getElementById('out') as HTMLCanvasElement;
const info = document.getElementById('info') as HTMLElement;

const renderer = new THREE.WebGLRenderer({ canvas: gl, alpha: true, antialias: true, preserveDrawingBuffer: true, premultipliedAlpha: true });
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const ambient = new THREE.AmbientLight('#ffffff', LIGHT.ambient);
const sun = new THREE.DirectionalLight('#ffffff', LIGHT.direct);
scene.add(ambient, sun, sun.target);

const AZ = THREE.MathUtils.degToRad(32), EL = THREE.MathUtils.degToRad(24);
const camDir = new THREE.Vector3(Math.sin(AZ) * Math.cos(EL), Math.sin(EL), Math.cos(AZ) * Math.cos(EL));
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
camera.position.copy(camDir).multiplyScalar(10);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld(true);
placeLight(sun, camera, new THREE.Vector3(0, 0, 0));

const items: ItemInfo[] = CATALOG.map((it) => ({
  id: it.id, shape: it.shape, color: CAT_COLOR[it.category],
  variants: it.shape === 'bottle' ? ['6'] : it.shape === 'can' ? ['3'] : [],
}));

/** View-space bounding box of all real (non-outline) mesh vertices. */
function viewBounds(group: THREE.Object3D): THREE.Box3 {
  group.updateMatrixWorld(true);
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || o.userData.__outline) return;
    const pos = m.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
      box.expandByPoint(v);
    }
  });
  return box;
}

function renderModel(model: THREE.Group): RenderResult {
  scene.add(model);
  const b = viewBounds(model);
  const bw = b.max.x - b.min.x, bh = b.max.y - b.min.y;
  const content = W * FILL;
  const s = (content - 2 * OUT_PX) / Math.max(bw, bh); // px per world unit (at 1×)
  const t = OUT_PX / s;
  addOutline(model, t);
  const H = Math.round((bh + 2 * t) * s + 2 * PAD);
  const cx = (b.min.x + b.max.x) / 2;
  camera.left = cx - (W / 2) / s; camera.right = cx + (W / 2) / s;
  camera.top = b.max.y + t + PAD / s; camera.bottom = camera.top - H / s;
  camera.updateProjectionMatrix();
  renderer.setSize(W * SS, H * SS, false);
  renderer.render(scene, camera);
  scene.remove(model);
  // origin (contact point) in view space
  const o = new THREE.Vector3(0, 0, 0).applyMatrix4(camera.matrixWorldInverse);
  const base = (camera.top - o.y) / (camera.top - camera.bottom);
  out.width = W; out.height = H;
  const ctx = out.getContext('2d')!;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(gl, 0, 0, W, H);
  const dataUrl = out.toDataURL('image/webp', .9);
  disposeGroup(model);
  return { dataUrl, w: W, h: H, base: Math.round(base * 1000) / 1000 };
}

function disposeGroup(g: THREE.Object3D) {
  g.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.geometry.dispose(); });
}

function render(itemId: string, variant = ''): RenderResult {
  const it = items.find((i) => i.id === itemId);
  if (!it) throw new Error(`unknown item ${itemId}`);
  const qty = variant === '6' ? 6 : variant === '3' ? 3 : 1;
  const model = buildModel(it.shape, { color: it.color, qty });
  const r = renderModel(model);
  info.textContent = `${itemId}${variant ? '--' + variant : ''}  ${r.w}×${r.h}  base ${r.base}  ${(r.dataUrl.length * 3 / 4 / 1024).toFixed(1)} KB`;
  return r;
}

/** Export one shape (neutral colour, no outlines, no UVs) as a binary GLB, base64. */
async function exportGlb(shape: ItemShape): Promise<string> {
  const model = buildModel(shape, { color: NEUTRAL });
  const swapped = new Map<THREE.Material, THREE.Material>();
  model.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    let g = m.geometry.clone();
    g.deleteAttribute('uv');
    g.deleteAttribute('normal'); // viewer recomputes smooth normals; halves the GLB
    g = mergeVertices(g, 1e-5);
    m.geometry = g;
    const src = m.material as THREE.MeshToonMaterial;
    let dst = swapped.get(src);
    if (!dst) {
      dst = new THREE.MeshStandardMaterial({ color: src.color, name: src.name, transparent: src.transparent, opacity: src.opacity, roughness: 1, metalness: 0 });
      swapped.set(src, dst);
    }
    m.material = dst;
  });
  const exporter = new GLTFExporter();
  const buf = await exporter.parseAsync(model, { binary: true, onlyVisible: true }) as ArrayBuffer;
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

// ---------------------------------------------------------------- manual UI
const sel = document.getElementById('item') as HTMLSelectElement;
const vsel = document.getElementById('variant') as HTMLSelectElement;
for (const it of items) { const o = document.createElement('option'); o.value = it.id; o.textContent = `${it.id} (${it.shape})`; sel.append(o); }
document.getElementById('go')!.addEventListener('click', () => render(sel.value, vsel.value));
document.getElementById('all')!.addEventListener('click', () => contactSheet());

function contactSheet() {
  const sheet = document.getElementById('sheet')!;
  sheet.innerHTML = '';
  const seen = new Set<string>();
  for (const it of items) {
    for (const v of ['', ...it.variants]) {
      const key = `${it.shape}${v}`;
      if (seen.has(key) && it.shape !== 'bottle' && it.shape !== 'can') continue;
      seen.add(key);
      const r = render(it.id, v);
      const fig = document.createElement('figure');
      const img = new Image(); img.src = r.dataUrl;
      fig.append(img, document.createTextNode(`${it.id}${v ? '--' + v : ''} ${r.h}px b${r.base}`));
      sheet.append(fig);
    }
  }
}

declare global {
  interface Window {
    __ready: boolean;
    __items: () => ItemInfo[];
    __shapes: () => ItemShape[];
    __render: (itemId: string, variant?: string) => RenderResult;
    __renderShape: (shape: ItemShape, color: string, qty?: number) => RenderResult;
    __exportGlb: (shape: ItemShape) => Promise<string>;
    __variantFor: (shape: ItemShape, qty: number) => string;
    __contactSheet: () => void;
  }
}
window.__items = () => items;
window.__shapes = () => SHAPES;
window.__render = render;
window.__renderShape = (shape, color, qty = 1) => renderModel(buildModel(shape, { color, qty }));
window.__exportGlb = exportGlb;
window.__variantFor = (shape, qty) => variantFor(shape, qty);
window.__contactSheet = contactSheet;
window.__ready = true;

// first paint so the page is not blank
render(items[0].id);
