import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { ItemShape } from '@/domain/types';
import { PAL, dk, lt, toonMat } from './toon';
import { variantFor } from './variants';

export { variantFor };

/**
 * Procedural low-poly cartoon models for every catalog ItemShape.
 *
 * Conventions
 * - Base of the object sits on y = 0, roughly centred on x/z, front faces +z,
 *   overall height ≈ 1 unit (chunky "Kenney" proportions, exaggerated caps & handles).
 * - Materials are flat MeshToonMaterial. Material names 'body', 'body-dark' and
 *   'body-light' are the tintable slots (the viewer / sprite renderer recolour them);
 *   everything else is a fixed palette colour from PAL.
 * - Meshes with `userData.noOutline` are skipped by the inverted-hull outline
 *   (used for transparent shrink-wrap and glows).
 * - Variants: 'bottle' with qty ≥ 6 → shrink-wrapped six-pack, 'can' with qty ≥ 3
 *   → row of three cans, 'drum' always sits on a wooden pallet.
 */
export interface BuildOpts { color: string; label?: string; qty?: number }

type Mat = THREE.MeshToonMaterial;
type P = [number, number];

/** Material cache so identical colours share one material (smaller GLB, fewer draw states). */
function matCache(tint: string) {
  const cache = new Map<string, Mat>();
  const get = (color: string, name?: string, opacity?: number): Mat => {
    const key = `${color}|${name ?? ''}|${opacity ?? 1}`;
    let m = cache.get(key);
    if (!m) { m = toonMat(color, { name, opacity }); cache.set(key, m); }
    return m;
  };
  return {
    get,
    body: () => get(tint, 'body'),
    dark: () => get(dk(tint, .72), 'body-dark'),
    light: () => get(lt(tint, .45), 'body-light'),
    fixed: (c: string, opacity?: number) => get(c, undefined, opacity),
  };
}
type MC = ReturnType<typeof matCache>;

const V2 = (p: P[]) => p.map(([x, y]) => new THREE.Vector2(x, y));
/** Lathe around y from a list of [radius, y] points (bottom → top). */
function lathe(profile: P[], segs = 18): THREE.LatheGeometry {
  return new THREE.LatheGeometry(V2(profile), segs);
}
/** Closed chunky cylinder (rBottom → rTop) with rounded rims of radius c. */
function canProfile(r0: number, r1: number, y0: number, y1: number, c = .04): P[] {
  return [[0, y0], [r0 * .5, y0], [r0 - c, y0], [r0, y0 + c], [r1, y1 - c], [r1 - c, y1], [r1 * .5, y1], [0, y1]];
}
function cyl(r0: number, r1: number, y0: number, y1: number, c = .04, segs = 18) { return lathe(canProfile(r0, r1, y0, y1, c), segs); }
/** Rounded box; segs 1 = chunky chamfer (small parts), 2 = soft (main bodies). */
function rbox(w: number, h: number, d: number, r = .05, segs = 1): RoundedBoxGeometry {
  const rr = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  return new RoundedBoxGeometry(w, h, d, segs, rr);
}
function sphere(r: number, w = 14, h = 10) { return new THREE.SphereGeometry(r, w, h); }
function torus(r: number, tube: number, arc = Math.PI * 2, seg = 10, tub = 18) { return new THREE.TorusGeometry(r, tube, seg, tub, arc); }

interface Place { x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number; sx?: number; sy?: number; sz?: number; noOutline?: boolean; name?: string }
function mesh(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: Mat, p: Place = {}): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0);
  m.rotation.set(p.rx ?? 0, p.ry ?? 0, p.rz ?? 0);
  m.scale.set(p.sx ?? 1, p.sy ?? 1, p.sz ?? 1);
  if (p.noOutline) m.userData.noOutline = true;
  if (p.name) m.name = p.name;
  parent.add(m);
  return m;
}

// ---------------------------------------------------------------- shapes

function bottle(g: THREE.Group, M: MC) {
  // fat water bottle: wide body, soft shoulder, short neck, big cap
  const body: P[] = [[0, 0], [.1, 0], [.19, .0], [.22, .04], [.22, .58], [.2, .66], [.13, .74], [.1, .78], [.1, .84], [0, .84]];
  mesh(g, lathe(body), M.body());
  mesh(g, lathe([[0, .22], [.228, .22], [.228, .48], [0, .48]]), M.fixed(PAL.paper)); // label band
  mesh(g, lathe([[0, .3], [.232, .3], [.232, .38], [0, .38]]), M.dark()); // label stripe
  mesh(g, cyl(.125, .125, .83, .98, .035), M.light()); // cap
}

function sixPack(g: THREE.Group, M: MC) {
  const s = .62;
  const xs = [-.34, 0, .34];
  for (const z of [-.17, .17]) for (const x of xs) {
    const b = new THREE.Group(); bottle(b, M); b.scale.setScalar(s); b.position.set(x, 0, z); g.add(b);
  }
  // cardboard tray + translucent shrink-wrap (wrap has no outline, it would ink the inside)
  mesh(g, rbox(1.06, .12, .72, .03), M.fixed(PAL.cardboard), { y: .06 });
  mesh(g, rbox(1.08, .05, .74, .02), M.fixed(PAL.cardboardLight), { y: .125 });
  mesh(g, rbox(1.0, .4, .66, .12, 2), M.fixed(PAL.glass, .3), { y: .36, noOutline: true });
  mesh(g, rbox(.9, .05, .14, .02), M.fixed(PAL.paper), { y: .55 }); // top strap
  mesh(g, torus(.14, .03, Math.PI), M.fixed(PAL.paper), { y: .55 }); // carry handle
}

function gallon(g: THREE.Group, M: MC) {
  const body: P[] = [[0, 0], [.2, 0], [.33, 0], [.36, .04], [.36, .62], [.33, .72], [.2, .8], [.13, .84], [.13, .9], [0, .9]];
  mesh(g, lathe(body), M.body());
  mesh(g, lathe([[0, .2], [.37, .2], [.37, .34], [0, .34]]), M.dark()); // dark ring band
  mesh(g, lathe([[0, .4], [.368, .4], [.368, .56], [0, .56]]), M.fixed(PAL.paper)); // label
  mesh(g, cyl(.16, .16, .89, 1.0, .035), M.fixed(PAL.cells)); // cap
  mesh(g, torus(.14, .04, Math.PI, 8, 14), M.fixed(PAL.cells), { x: .22, y: .78, rz: 0, ry: 0 }); // handle arc (vertical, in xy plane)
}

function pallet(g: THREE.Group, M: MC, w = 1.0, d = .8, h = .12) {
  const wood = M.fixed(PAL.wood), dark = M.fixed(PAL.woodDark);
  for (const z of [-d / 2 + .1, 0, d / 2 - .1]) mesh(g, rbox(.14, h * .5, .18, .03), dark, { x: -w / 2 + .09, y: h * .25, z });
  for (const z of [-d / 2 + .1, 0, d / 2 - .1]) mesh(g, rbox(.14, h * .5, .18, .03), dark, { x: w / 2 - .09, y: h * .25, z });
  for (const z of [-d / 2 + .1, 0, d / 2 - .1]) mesh(g, rbox(.14, h * .5, .18, .03), dark, { x: 0, y: h * .25, z });
  const n = 4, bw = w / n * .78;
  for (let i = 0; i < n; i++) mesh(g, rbox(bw, h * .5, d, .025), wood, { x: -w / 2 + (i + .5) * (w / n), y: h * .75 });
}

function drum(g: THREE.Group, M: MC) {
  pallet(g, M);
  const y0 = .12, y1 = 1.0, r = .33;
  mesh(g, cyl(r, r, y0, y1, .05), M.body());
  for (const y of [.36, .66]) mesh(g, lathe([[0, y - .035], [r + .018, y - .035], [r + .018, y + .035], [0, y + .035]]), M.dark());
  mesh(g, lathe([[0, y1 - .01], [r * .95, y1 - .01], [r * .95, y1 + .02], [0, y1 + .02]]), M.dark()); // lid rim
  mesh(g, cyl(.06, .06, y1, y1 + .05, .015), M.fixed(PAL.cells), { x: .16, z: .1 }); // bung
  mesh(g, rbox(.26, .16, .02, .02), M.fixed(PAL.paper), { x: .05, y: .52, z: r - .005, ry: 0 }); // label
}

function can(g: THREE.Group, M: MC, s = 1) {
  const r = .3 * s, h = .6 * s;
  mesh(g, cyl(r, r, 0, h, .035 * s), M.fixed(PAL.silver));
  mesh(g, lathe([[0, .1 * s], [r + .012, .1 * s], [r + .012, .5 * s], [0, .5 * s]]), M.body()); // label
  mesh(g, lathe([[0, .25 * s], [r + .016, .25 * s], [r + .016, .36 * s], [0, .36 * s]]), M.fixed(PAL.paper)); // light stripe
  mesh(g, lathe([[0, h - .005], [r * .86, h - .005], [r * .86, h + .012], [r * .7, h + .012], [r * .7, h - .005], [0, h - .005]]), M.fixed(PAL.silverDark)); // lid ring
  mesh(g, rbox(.12 * s, .05 * s, .02 * s, .01), M.fixed(PAL.silverDark), { y: h + .012, x: .04 * s }); // pull tab
}
function canRow(g: THREE.Group, M: MC) {
  for (const [i, x] of [-.62, 0, .62].entries()) {
    const c = new THREE.Group(); can(c, M, .95); c.position.set(x, 0, 0); c.rotation.y = (i - 1) * .15; g.add(c);
  }
}

function sack(g: THREE.Group, M: MC) {
  const cloth = M.fixed(PAL.cream);
  mesh(g, rbox(.78, .76, .5, .2, 2), cloth, { y: .38 });
  mesh(g, rbox(.84, .3, .5, .14, 2), cloth, { y: .18 }); // bulge at the bottom
  mesh(g, cyl(.14, .1, .74, .9, .03), cloth); // gathered neck
  mesh(g, torus(.11, .035, Math.PI * 2, 8, 14), M.dark(), { y: .84, rx: Math.PI / 2 }); // tie
  mesh(g, rbox(.22, .12, .1, .03), cloth, { x: .16, y: .9, rz: -.6 }); // ear
  mesh(g, rbox(.46, .32, .03, .02), M.body(), { y: .42, z: .255 }); // big label
  mesh(g, rbox(.3, .1, .035, .02), M.fixed(PAL.paper), { y: .38, z: .262 });
}

function box(g: THREE.Group, M: MC) {
  mesh(g, rbox(.9, .6, .64, .04), M.fixed(PAL.cardboard), { y: .3 });
  mesh(g, rbox(.92, .1, .66, .03), M.fixed(PAL.cardboardLight), { y: .6 }); // lid
  mesh(g, rbox(.2, .12, .67, .015), M.body(), { y: .605 }); // tape over the lid
  mesh(g, rbox(.2, .62, .02, .015), M.body(), { y: .3, z: .33 }); // tape down the front
  mesh(g, rbox(.26, .16, .02, .02), M.fixed(PAL.paper), { x: -.26, y: .26, z: .33 }); // shipping label
}

function pouch(g: THREE.Group, M: MC) {
  mesh(g, rbox(.6, .8, .2, .07, 2), M.body(), { y: .4 });
  mesh(g, rbox(.64, .1, .1, .03), M.fixed(PAL.paper), { y: .86 }); // seal
  mesh(g, rbox(.08, .08, .08, .02), M.dark(), { x: .25, y: .86 }); // tear notch
  mesh(g, rbox(.42, .36, .03, .04), M.fixed(PAL.paper), { y: .4, z: .105 }); // label
  mesh(g, rbox(.42, .1, .035, .03), M.dark(), { y: .52, z: .107 });
}

function jar(g: THREE.Group, M: MC) {
  const body: P[] = [[0, 0], [.16, 0], [.28, 0], [.31, .04], [.31, .6], [.28, .68], [.25, .7], [0, .7]];
  mesh(g, lathe(body), M.body());
  mesh(g, lathe([[0, .2], [.318, .2], [.318, .44], [0, .44]]), M.fixed(PAL.paper)); // label
  mesh(g, lathe([[0, .3], [.322, .3], [.322, .36], [0, .36]]), M.dark());
  mesh(g, cyl(.29, .29, .68, .86, .04), M.fixed(PAL.gold)); // lid
}

function lamp(g: THREE.Group, M: MC) {
  mesh(g, cyl(.3, .32, 0, .2, .05), M.body()); // base housing
  mesh(g, cyl(.22, .22, .2, .7, .02), M.fixed(PAL.glow)); // glowing tube
  mesh(g, cyl(.3, .3, .7, .86, .05), M.body()); // cap
  mesh(g, cyl(.08, .08, .86, .9, .01), M.dark()); // button
  mesh(g, torus(.2, .035, Math.PI, 8, 14), M.dark(), { y: .9 }); // handle arc
  mesh(g, rbox(.12, .06, .02, .01), M.fixed(PAL.paper), { y: .1, z: .31 }); // switch
}

function battery(g: THREE.Group, M: MC) {
  mesh(g, rbox(.96, .96, .06, .04), M.fixed(PAL.paper), { y: .48 }); // blister card
  mesh(g, rbox(.96, .22, .07, .04), M.dark(), { y: .85 }); // header band
  mesh(g, rbox(.14, .14, .08, .04), M.fixed(PAL.paper), { y: .87 }); // hang hole
  for (const x of [-.33, -.11, .11, .33]) {
    mesh(g, cyl(.09, .09, .1, .64, .02, 14), M.body(), { x, z: .11 });
    mesh(g, lathe([[0, .46], [.093, .46], [.093, .64], [0, .64]], 14), M.fixed(PAL.silver), { x, z: .11 });
    mesh(g, cyl(.035, .035, .64, .69, .01, 10), M.fixed(PAL.copper), { x, z: .11 });
  }
}

function radio(g: THREE.Group, M: MC) {
  mesh(g, rbox(.92, .56, .36, .07, 2), M.body(), { y: .3 });
  for (const y of [.2, .3, .4]) mesh(g, rbox(.36, .05, .04, .02), M.dark(), { x: -.2, y, z: .18 }); // speaker slats
  mesh(g, cyl(.11, .11, 0, .05, .015, 16), M.fixed(PAL.paper), { x: .24, y: .32, z: .18, rx: Math.PI / 2 }); // dial
  mesh(g, rbox(.03, .08, .03, .01), M.dark(), { x: .24, y: .37, z: .22 }); // dial needle
  mesh(g, rbox(.2, .06, .04, .02), M.fixed(PAL.paper), { x: .24, y: .14, z: .18 }); // display
  mesh(g, cyl(.025, .025, 0, .55, .01, 8), M.fixed(PAL.silverDark), { x: -.36, y: .58, z: -.08, rz: .35 }); // antenna
  mesh(g, sphere(.035, 10, 8), M.fixed(PAL.silverDark), { x: -.55, y: 1.1, z: -.08 });
  mesh(g, rbox(.06, .3, .06, .02), M.fixed(PAL.dark), { x: .52, y: .22 }); // crank arm
  mesh(g, rbox(.07, .07, .14, .03), M.fixed(PAL.paper), { x: .53, y: .07, z: .07 }); // crank knob
  mesh(g, torus(.16, .035, Math.PI, 8, 14), M.dark(), { y: .58 }); // handle
}

function powerbank(g: THREE.Group, M: MC) {
  const tilt = -.14;
  const b = new THREE.Group(); b.rotation.x = tilt; b.position.y = .02; g.add(b);
  mesh(b, rbox(.5, .94, .18, .08, 2), M.body(), { y: .47 });
  for (const [i, y] of [.74, .68, .62, .56].entries()) mesh(b, cyl(.028, .028, 0, .02, .005, 8), M.fixed(i === 0 ? PAL.cream : PAL.glow), { x: .15, y, z: .085, rx: Math.PI / 2 });
  mesh(b, rbox(.3, .34, .03, .03), M.fixed(PAL.paper), { x: -.03, y: .32, z: .09 }); // logo panel
  mesh(b, rbox(.06, .14, .03, .015), M.dark(), { x: -.06, y: .36, z: .105, rz: .5 }); // lightning bolt
  mesh(b, rbox(.06, .14, .03, .015), M.dark(), { x: .0, y: .28, z: .105, rz: .5 });
  mesh(b, rbox(.14, .05, .19, .01), M.fixed(PAL.dark), { x: -.1, y: .93 }); // port
  mesh(b, rbox(.14, .05, .19, .01), M.fixed(PAL.dark), { x: .1, y: .93 });
}

function panel(g: THREE.Group, M: MC) {
  const makeLeaf = (x: number, ry: number) => {
    const leaf = new THREE.Group(); leaf.position.set(x, 0, 0); leaf.rotation.y = ry; g.add(leaf);
    mesh(leaf, rbox(.56, .86, .06, .04), M.body(), { y: .43 });
    for (const r of [0, 1, 2]) for (const c of [0, 1]) mesh(leaf, rbox(.21, .22, .03, .02), M.fixed(PAL.cells), { x: -.115 + c * .23, y: .71 - r * .25, z: .035 });
  };
  makeLeaf(-.3, .45); makeLeaf(.3, -.45);
  mesh(g, rbox(.08, .7, .1, .03), M.dark(), { y: .4, z: -.13 }); // hinge spine
  mesh(g, rbox(.12, .05, .18, .015), M.fixed(PAL.dark), { x: .4, y: .05, z: .22 }); // usb box
}

function bag(g: THREE.Group, M: MC) {
  mesh(g, rbox(.72, .88, .42, .16, 2), M.body(), { y: .46 });
  mesh(g, rbox(.52, .4, .18, .1, 2), M.dark(), { y: .3, z: .26 }); // front pocket
  mesh(g, rbox(.56, .05, .22, .02), M.fixed(PAL.paper), { y: .52, z: .26 }); // pocket zip
  mesh(g, rbox(.72, .06, .44, .02), M.fixed(PAL.paper), { y: .74, rx: .25 }); // main zip
  mesh(g, torus(.14, .04, Math.PI, 8, 14), M.dark(), { y: .9 }); // carry loop
  for (const x of [-.22, .22]) mesh(g, rbox(.12, .6, .06, .03), M.dark(), { x, y: .4, z: -.24 }); // straps
  mesh(g, rbox(.16, .1, .02, .02), M.fixed(PAL.paper), { x: .18, y: .66, z: .215 }); // patch
}

function kit(g: THREE.Group, M: MC) {
  mesh(g, rbox(.92, .58, .34, .08, 2), M.body(), { y: .29 });
  mesh(g, rbox(.94, .07, .36, .02), M.fixed(PAL.paper), { y: .46 }); // lid seam
  mesh(g, rbox(.34, .07, .08, .025), M.dark(), { y: .66 }); // handle bar
  for (const x of [-.14, .14]) mesh(g, rbox(.06, .14, .07, .02), M.dark(), { x, y: .6 });
  mesh(g, rbox(.3, .3, .03, .02), M.fixed(PAL.paper), { y: .26, z: .17 }); // cross plaque
  mesh(g, rbox(.2, .07, .035, .015), M.fixed('#e23f4f'), { y: .26, z: .175 });
  mesh(g, rbox(.07, .2, .035, .015), M.fixed('#e23f4f'), { y: .26, z: .175 });
  mesh(g, rbox(.08, .1, .04, .02), M.fixed(PAL.silverDark), { x: -.33, y: .44, z: .17 }); // latches
  mesh(g, rbox(.08, .1, .04, .02), M.fixed(PAL.silverDark), { x: .33, y: .44, z: .17 });
}

function roll(g: THREE.Group, M: MC) {
  // hollow roll standing on its end: outer wall + core, visible from the 3/4 camera
  const R = .4, r = .14, h = .56, c = .04;
  const prof: P[] = [[r, 0], [R - c, 0], [R, c], [R, h - c], [R - c, h], [r + .01, h], [r, h - .01], [r, .01]];
  mesh(g, lathe(prof, 22), M.body());
  mesh(g, lathe([[0, .03], [r + .01, .03], [r + .01, h - .03], [0, h - .03]], 14), M.fixed(PAL.cardboard)); // core
  mesh(g, rbox(.22, h * .8, .03, .01), M.dark(), { x: R - .01, y: h / 2, z: .16, ry: -.4 }); // loose end flap
  mesh(g, rbox(.3, .14, .03, .02), M.fixed(PAL.paper), { y: h / 2, z: R + .005 }); // label
}

function rope(g: THREE.Group, M: MC) {
  const coil = new THREE.Group(); g.add(coil); coil.position.y = .46; coil.rotation.x = -.18;
  for (const [i, z] of [-.1, 0, .1].entries()) mesh(coil, torus(.34, .09, Math.PI * 2, 10, 22), M.body(), { z, ry: (i - 1) * .18, rz: i * .35 });
  mesh(coil, rbox(.2, .3, .3, .06), M.dark(), { y: .34 }); // top wrap
  mesh(coil, rbox(.18, .12, .3, .05), M.fixed(PAL.paper), { y: .22, x: -.02 }); // tag
}

function tarp(g: THREE.Group, M: MC) {
  const w = .98, d = .72;
  mesh(g, rbox(w, .14, d, .05), M.body(), { y: .07 });
  mesh(g, rbox(w * .98, .14, d * .98, .05), M.dark(), { y: .2, x: .01 });
  mesh(g, rbox(w * .96, .14, d * .96, .05), M.body(), { y: .33 });
  mesh(g, rbox(w * .5, .12, d * .94, .05), M.dark(), { y: .45, x: -w * .24 }); // half fold on top
  for (const x of [-.4, .4]) mesh(g, cyl(.045, .045, 0, .03, .01, 10), M.fixed(PAL.silverDark), { x, y: .4, z: d / 2 - .09 }); // grommets
  mesh(g, rbox(.28, .18, .03, .02), M.fixed(PAL.paper), { x: .22, y: .22, z: d / 2 + .005 }); // label
}

function tool(g: THREE.Group, M: MC) {
  mesh(g, rbox(.96, .42, .44, .06, 2), M.body(), { y: .21 });
  mesh(g, rbox(.98, .14, .46, .05), M.dark(), { y: .49 }); // lid
  for (const x of [-.26, .26]) mesh(g, rbox(.08, .18, .1, .03), M.dark(), { x, y: .63 });
  mesh(g, rbox(.6, .09, .12, .04), M.fixed(PAL.dark), { y: .72 }); // handle
  mesh(g, rbox(.12, .1, .05, .02), M.fixed(PAL.silverDark), { y: .44, z: .22 }); // latch
  mesh(g, rbox(.3, .14, .03, .02), M.fixed(PAL.paper), { x: -.22, y: .2, z: .225 }); // label
  mesh(g, rbox(.14, .14, .03, .02), M.fixed(PAL.paper), { x: .24, y: .2, z: .225 });
}

function cash(g: THREE.Group, M: MC) {
  const env = new THREE.Group(); env.rotation.x = -.22; env.position.set(0, .02, -.05); g.add(env);
  mesh(env, rbox(.92, .56, .1, .03), M.fixed(PAL.cream), { y: .28 }); // envelope
  mesh(env, rbox(.92, .3, .11, .03), M.fixed(PAL.paper), { y: .5, rz: 0 }); // flap (lighter)
  for (const [i, x] of [-.14, 0, .14].entries()) mesh(env, rbox(.56, .4, .025, .02), M.body(), { x, y: .6 + i * .02, z: -.0, rz: (i - 1) * .12 }); // bills
  mesh(env, rbox(.3, .14, .035, .02), M.light(), { y: .66, z: .03 }); // bill emblem
  // stack of coins at the right
  for (let i = 0; i < 4; i++) mesh(g, cyl(.12, .12, .05 * i, .05 * i + .05, .012, 16), M.fixed(PAL.gold), { x: .36, z: .32 });
  mesh(g, cyl(.12, .12, 0, .05, .012, 16), M.fixed(PAL.gold), { x: .16, z: .4, rz: .0 });
}

function doc(g: THREE.Group, M: MC) {
  const p = new THREE.Group(); p.rotation.x = -.16; p.position.set(0, .0, -.04); g.add(p);
  mesh(p, rbox(.56, .72, .03, .01), M.fixed(PAL.paper), { x: -.06, y: .5, z: -.03 }); // papers poking out
  mesh(p, rbox(.5, .7, .03, .01), M.fixed(PAL.cream), { x: .06, y: .48, z: -.05 });
  mesh(p, rbox(.96, .66, .1, .07, 2), M.body(), { y: .33 }); // zip pouch
  mesh(p, rbox(.98, .07, .12, .025), M.dark(), { y: .66 }); // zipper
  mesh(p, rbox(.08, .12, .06, .02), M.fixed(PAL.silverDark), { x: .4, y: .6, z: .06 }); // zip pull
  mesh(p, rbox(.44, .3, .03, .02), M.fixed(PAL.paper), { x: -.18, y: .3, z: .055 }); // window
  for (const y of [.36, .3, .24]) mesh(p, rbox(.28, .035, .03, .01), M.dark(), { x: -.18, y, z: .07 });
}

function bowl(g: THREE.Group, M: MC) {
  const R = .46, r = .3, h = .36, t = .05;
  const prof: P[] = [[0, 0], [r - .04, 0], [r, .04], [R, h - .04], [R + .02, h], [R - t, h], [R - t, h - .02], [r - .04, .1], [0, .1]];
  mesh(g, lathe(prof, 22), M.body());
  mesh(g, lathe([[0, .11], [r + .09, .11], [r + .09, .15], [0, .15]], 22), M.dark()); // contents
  mesh(g, lathe([[0, .12], [R - .01, .12], [R - .01, .2], [0, .2]], 22), M.fixed(PAL.paper)); // outer band
  mesh(g, sphere(.05, 10, 8), M.fixed(PAL.cardboard), { x: -.06, y: .16, z: .04 }); // kibble
  mesh(g, sphere(.045, 10, 8), M.fixed(PAL.cardboard), { x: .08, y: .16, z: -.05 });
}

function whistle(g: THREE.Group, M: MC) {
  const w = new THREE.Group(); w.position.y = .02; g.add(w);
  mesh(w, cyl(.26, .26, -.2, .2, .05, 20), M.body(), { x: .14, y: .28, rx: Math.PI / 2 }); // barrel (axis z)
  mesh(w, rbox(.52, .2, .34, .07, 2), M.body(), { x: -.3, y: .32 }); // mouthpiece
  mesh(w, rbox(.14, .08, .34, .03), M.dark(), { x: .14, y: .5, z: 0 }); // top slot
  mesh(w, torus(.1, .03, Math.PI * 2, 8, 14), M.fixed(PAL.silverDark), { x: .42, y: .5, rx: Math.PI / 2 }); // ring
  mesh(w, cyl(.03, .03, 0, .5, .01, 8), M.fixed(PAL.dark), { x: .5, y: .5, rz: Math.PI / 2 - .5 }); // lanyard bit
  mesh(w, lathe([[0, .19], [.1, .19], [.1, .22], [0, .22]], 16), M.fixed(PAL.paper), { x: .14, y: .28, rx: Math.PI / 2 }); // front disc
}

function mask(g: THREE.Group, M: MC) {
  const bx = new THREE.Group(); bx.position.set(.08, 0, -.12); g.add(bx);
  mesh(bx, rbox(.9, .5, .46, .05), M.fixed(PAL.paper), { y: .25 });
  mesh(bx, rbox(.92, .16, .48, .04), M.body(), { y: .17 }); // tinted band
  mesh(bx, rbox(.5, .05, .16, .02), M.fixed(PAL.dark), { y: .5 }); // dispenser slot
  mesh(bx, rbox(.4, .22, .03, .01), M.fixed(PAL.cream), { x: .0, y: .58, z: -.0, rx: -.3 }); // next mask peeking
  mesh(bx, rbox(.14, .14, .03, .02), M.fixed('#4a7bd6'), { x: -.3, y: .36, z: .235 }); // cert mark
  mesh(bx, rbox(.24, .08, .03, .02), M.dark(), { x: .22, y: .36, z: .235 }); // text block
  // cup mask leaning on the front of the box, straps looping back
  const mk = new THREE.Group(); mk.position.set(-.1, .26, .3); mk.rotation.x = -.5; g.add(mk);
  mesh(mk, sphere(.26, 16, 10), M.fixed(PAL.cream), { sx: 1.25, sy: .95, sz: .62 });
  mesh(mk, cyl(.07, .07, 0, .05, .01, 12), M.light(), { z: .16, rx: Math.PI / 2 }); // valve
  mesh(mk, rbox(.2, .05, .04, .01), M.fixed(PAL.silverDark), { y: .22, z: .04 }); // nose clip
  for (const side of [-1, 1]) mesh(mk, torus(.17, .022, Math.PI, 6, 12), M.dark(), { x: side * .3, y: -.02, ry: side * Math.PI / 2, rz: 0 });
}

function lock(g: THREE.Group, M: MC) {
  mesh(g, rbox(.64, .56, .26, .12, 2), M.body(), { y: .28 });
  mesh(g, torus(.19, .065, Math.PI, 8, 16), M.fixed(PAL.silver), { y: .58 }); // shackle
  mesh(g, cyl(.065, .065, .5, .62, .01, 10), M.fixed(PAL.silver), { x: -.19 });
  mesh(g, cyl(.065, .065, .5, .62, .01, 10), M.fixed(PAL.silver), { x: .19 });
  mesh(g, cyl(.065, .065, 0, .03, .008, 14), M.fixed(PAL.dark), { y: .26, z: .13, rx: Math.PI / 2 }); // keyhole
  mesh(g, rbox(.05, .12, .03, .01), M.fixed(PAL.dark), { y: .18, z: .135 });
  mesh(g, rbox(.4, .1, .03, .02), M.dark(), { y: .42, z: .13 }); // brand band
}

const BUILDERS: Record<ItemShape, (g: THREE.Group, M: MC) => void> = {
  bottle, gallon, drum, can, sack, box, pouch, jar, lamp, battery, radio, powerbank, panel, bag, kit, roll, rope, tarp, tool, cash, doc, bowl, whistle, mask, lock,
};

export const SHAPES: ItemShape[] = Object.keys(BUILDERS) as ItemShape[];

/**
 * Build a cartoon model. Base at y = 0, height ≈ 1. Outlines are NOT added here;
 * call `addOutline(group, thickness)` from ./toon once you know the display scale.
 */
export function buildModel(shape: ItemShape, opts: BuildOpts): THREE.Group {
  const g = new THREE.Group();
  g.name = shape;
  const M = matCache(opts.color);
  const v = variantFor(shape, opts.qty);
  if (shape === 'bottle' && v === '6') sixPack(g, M);
  else if (shape === 'can' && v === '3') canRow(g, M);
  else BUILDERS[shape](g, M);
  g.userData.shape = shape;
  g.userData.variant = v;
  if (opts.label) g.userData.label = opts.label;
  return g;
}
