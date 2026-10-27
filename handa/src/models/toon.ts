import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Shared cel-shading kit for the procedural item models. Used by the model
 * builder (sprite pipeline), the GLB viewer and anything else that wants the
 * same "ink + three hard bands" look.
 *
 * Shading recipe (matches the 2D art brief): flat base colour, ONE hard shadow
 * tone (base × ~0.72) on the side away from the light, ONE lighter highlight
 * band facing the light. Light comes from the top-left of the screen.
 */

/** Warm near-black ink used for every outline. */
export const INK = '#2a1812';

/** Fixed, non-tintable palette shared by all models. */
export const PAL = {
  cream: '#fff3dc',
  paper: '#fffaf0',
  cardboard: '#dca86a',
  cardboardLight: '#ecc48f',
  wood: '#c98f5c',
  woodDark: '#a9744a',
  silver: '#d3dae2',
  silverDark: '#9aa6b4',
  copper: '#e0923d',
  dark: '#3f4350',
  glow: '#fff1b4',
  glass: '#bfe3ff',
  cells: '#2a4a86',
  gold: '#f0c04a',
} as const;

const toRGB = (hex: string) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (r: number, g: number, b: number) => '#' + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
/** Darker tone of a hex colour (k = multiplier). */
export const dk = (hex: string, k = .72) => { const [r, g, b] = toRGB(hex); return toHex(r * k, g * k, b * k); };
/** Lighter tone of a hex colour (k = fraction towards white). */
export const lt = (hex: string, k = .35) => { const [r, g, b] = toRGB(hex); return toHex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k); };

/**
 * Lighting constants. MeshToonMaterial outputs base × (ambient + direct × band) / π,
 * so with these the middle band reproduces the base colour exactly, the shadow
 * band is ≈ 0.72 × base and the highlight band ≈ 1.25 × base.
 */
export const LIGHT = {
  ambient: 0.30 * Math.PI,
  direct: 0.95 * Math.PI,
  /** Light direction in *camera* space (x right, y up, z towards the viewer): top-left-front. */
  dir: new THREE.Vector3(-0.55, 0.8, 0.6).normalize(),
};

let gradient: THREE.DataTexture | null = null;
/** 3-band hard gradient map (shadow / base / highlight), built once. */
export function gradientMap(): THREE.DataTexture {
  if (gradient) return gradient;
  const N = 64;
  const data = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) {
    const dotNL = ((i + .5) / N) * 2 - 1;
    // shadow below ~8°, highlight above ~50° of facing the light
    const g = dotNL < 0.14 ? 0.442 : dotNL < 0.78 ? 0.737 : 1.0;
    const v = Math.round(g * 255);
    data.set([v, v, v, 255], i * 4);
  }
  gradient = new THREE.DataTexture(data, N, 1, THREE.RGBAFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.generateMipmaps = false;
  gradient.colorSpace = THREE.NoColorSpace;
  gradient.needsUpdate = true;
  return gradient;
}

export interface ToonOpts { name?: string; opacity?: number; emissive?: string; emissiveIntensity?: number }
/** Flat cel material. `name` 'body' / 'body-dark' are the tintable slots. */
export function toonMat(color: string, opts: ToonOpts = {}): THREE.MeshToonMaterial {
  const m = new THREE.MeshToonMaterial({ color, gradientMap: gradientMap() });
  if (opts.name) m.name = opts.name;
  if (opts.opacity !== undefined && opts.opacity < 1) { m.transparent = true; m.opacity = opts.opacity; m.depthWrite = false; }
  if (opts.emissive) { m.emissive = new THREE.Color(opts.emissive); m.emissiveIntensity = opts.emissiveIntensity ?? .6; }
  return m;
}

/** Rebuild a material of the same colour/name as a toon material (used after GLB import). */
export function toToon(src: THREE.Material, tint?: string): THREE.MeshToonMaterial {
  const s = src as THREE.MeshStandardMaterial;
  let color = s.color ? '#' + s.color.getHexString() : '#cccccc';
  if (tint) {
    if (src.name === 'body') color = tint;
    else if (src.name === 'body-dark') color = dk(tint, .72);
    else if (src.name === 'body-light') color = lt(tint, .45);
  }
  const m = toonMat(color, { name: src.name, opacity: s.transparent ? s.opacity : 1 });
  if (s.emissive && (s.emissive.r || s.emissive.g || s.emissive.b)) { m.emissive.copy(s.emissive); m.emissiveIntensity = s.emissiveIntensity ?? .6; }
  return m;
}

/** Put the directional light at the brief's top-left-front, relative to a camera. */
export function placeLight(light: THREE.DirectionalLight, camera: THREE.Camera, target: THREE.Vector3, distance = 10) {
  const d = LIGHT.dir.clone().applyQuaternion(camera.quaternion);
  light.position.copy(target).addScaledVector(d, distance);
  light.target.position.copy(target);
  light.target.updateMatrixWorld();
}

const OUTLINE_FLAG = '__outline';

/** Smooth, de-duplicated copy of a geometry pushed out along its normals. */
function hullGeometry(geo: THREE.BufferGeometry, t: number): THREE.BufferGeometry {
  let g = geo.index ? geo.clone() : geo.clone();
  g.deleteAttribute('uv'); g.deleteAttribute('normal');
  g = mergeVertices(g, 1e-4);
  g.computeVertexNormals();
  const pos = g.attributes.position as THREE.BufferAttribute;
  const nor = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(i, pos.getX(i) + nor.getX(i) * t, pos.getY(i) + nor.getY(i) * t, pos.getZ(i) + nor.getZ(i) * t);
  }
  pos.needsUpdate = true;
  g.deleteAttribute('normal');
  return g;
}

let inkMat: THREE.MeshBasicMaterial | null = null;
export function inkMaterial(): THREE.MeshBasicMaterial {
  if (!inkMat) inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide, name: 'ink' });
  return inkMat;
}

/**
 * Inverted-hull outline: for every mesh in the group add a back-face copy pushed
 * out along its (smoothed) normals by `thickness` world units, drawn in INK.
 * Meshes flagged `userData.noOutline` (transparent wraps, glows) are skipped.
 * Calling it twice first removes the previous hull.
 */
export function addOutline(group: THREE.Object3D, thickness: number): void {
  removeOutline(group);
  const targets: THREE.Mesh[] = [];
  group.traverse((o) => { if ((o as THREE.Mesh).isMesh && !o.userData[OUTLINE_FLAG] && !o.userData.noOutline) targets.push(o as THREE.Mesh); });
  for (const m of targets) {
    const hull = new THREE.Mesh(hullGeometry(m.geometry, thickness), inkMaterial());
    hull.userData[OUTLINE_FLAG] = true;
    hull.name = 'outline';
    hull.renderOrder = -1;
    m.add(hull);
  }
}

export function removeOutline(group: THREE.Object3D): void {
  const dead: THREE.Object3D[] = [];
  group.traverse((o) => { if (o.userData[OUTLINE_FLAG]) dead.push(o); });
  for (const o of dead) { o.removeFromParent(); (o as THREE.Mesh).geometry?.dispose(); }
}

/** World-space bounding box of everything that is not an outline hull. */
export function modelBounds(group: THREE.Object3D): THREE.Box3 {
  group.updateMatrixWorld(true);
  const box = new THREE.Box3();
  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || o.userData[OUTLINE_FLAG]) return;
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    const b = m.geometry.boundingBox!.clone().applyMatrix4(m.matrixWorld);
    box.union(b);
  });
  return box;
}
