import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HOUSE, CAT_COLOR } from './palette';
import { L, SLOTS } from './slots';
import type { CategoryId, SlotId } from '@/domain/types';
import { CATEGORY_SLOT } from '@/domain/types';

type V3 = [number, number, number];

function Box({ p, s, c, r, e = 0, o }: { p: V3; s: V3; c: string; r?: V3; e?: number; o?: number }) {
  return (
    <mesh position={p} rotation={r} scale={s}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={c} roughness={.92} metalness={0} flatShading emissive={e ? c : '#000'} emissiveIntensity={e} transparent={o !== undefined} opacity={o ?? 1} />
    </mesh>
  );
}

function Cyl({ p, r = .2, h = 1, c, seg = 10, rot }: { p: V3; r?: number; h?: number; c: string; seg?: number; rot?: V3 }) {
  return (
    <mesh position={p} rotation={rot}>
      <cylinderGeometry args={[r, r, h, seg]} />
      <meshStandardMaterial color={c} roughness={.9} flatShading />
    </mesh>
  );
}

/** Window: frame + glass pane sitting in a wall. */
function Window({ p, w = .9, h = .9, rotY = 0, lit }: { p: V3; w?: number; h?: number; rotY?: number; lit: boolean }) {
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <Box p={[0, 0, 0]} s={[w + .12, h + .12, .08]} c={HOUSE.trim} />
      <mesh position={[0, 0, .02]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={lit ? '#ffe9b0' : HOUSE.glass} emissive={lit ? '#ffd27a' : '#000'} emissiveIntensity={lit ? .6 : 0} roughness={.4} />
      </mesh>
      <Box p={[0, 0, .04]} s={[.05, h, .03]} c={HOUSE.trim} />
      <Box p={[0, 0, .04]} s={[w, .05, .03]} c={HOUSE.trim} />
    </group>
  );
}

function Tree({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, .6, 0]} r={.12} h={1.2} c="#7a5230" seg={7} />
      <mesh position={[0, 1.6, 0]}>
        <icosahedronGeometry args={[.8, 0]} />
        <meshStandardMaterial color="#5fae63" flatShading roughness={.95} />
      </mesh>
      <mesh position={[.35, 2.1, .1]}>
        <icosahedronGeometry args={[.55, 0]} />
        <meshStandardMaterial color="#6cc271" flatShading roughness={.95} />
      </mesh>
    </group>
  );
}

/** Pulsing floor patch for a room. Glows when its categories are missing. */
function RoomGlow({ slot, color, active, onClick, intensity }: { slot: SlotId; color: string; active: boolean; onClick: () => void; intensity: number }) {
  const def = SLOTS[slot];
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!mat.current) return;
    const t = clock.getElapsedTime();
    const pulse = active ? .35 + .3 * (Math.sin(t * 3 + def.center.x) + 1) / 2 : 0.08;
    mat.current.opacity = active ? pulse : intensity > .99 ? .18 : .06;
    mat.current.emissiveIntensity = active ? 1.4 : intensity > .99 ? 1 : .3;
  });
  return (
    <mesh position={[def.center.x, def.center.y + .012, def.center.z]} rotation={[-Math.PI / 2, 0, 0]} onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = ''; }}>
      <planeGeometry args={def.glowSize} />
      <meshStandardMaterial ref={mat} color={color} emissive={intensity > .99 ? '#3ddc97' : color} transparent opacity={.1} depthWrite={false} />
    </mesh>
  );
}

export interface HouseProps {
  lightsOn: boolean;
  categoryPct: Partial<Record<CategoryId, number>>;
  missing: CategoryId[];
  onSelectSlot: (slot: SlotId) => void;
  boarded?: boolean;
}

export function House({ lightsOn, categoryPct, missing, onSelectSlot, boarded }: HouseProps) {
  const { w, d, h1, h2, floorT, wallT } = L;
  const hx = w / 2, hz = d / 2;
  const y2 = h1 + floorT; // second floor base
  const roofY = h1 + h2 + floorT * 2;

  // slot → representative color + missing state
  const slotInfo = useMemo(() => {
    const info: Record<SlotId, { color: string; missing: boolean; pct: number }> = {} as never;
    for (const slot of Object.keys(SLOTS) as SlotId[]) {
      const cats = (Object.keys(CATEGORY_SLOT) as CategoryId[]).filter((c) => CATEGORY_SLOT[c] === slot);
      const relevant = cats.filter((c) => categoryPct[c] !== undefined);
      const avg = relevant.length ? relevant.reduce((n, c) => n + (categoryPct[c] ?? 0), 0) / relevant.length : 0;
      const miss = cats.some((c) => missing.includes(c));
      const main = cats.find((c) => missing.includes(c)) ?? cats[0];
      info[slot] = { color: CAT_COLOR[main], missing: miss, pct: avg };
    }
    return info;
  }, [categoryPct, missing]);

  const lightInt = lightsOn ? 1 : 0;

  return (
    <group>
      {/* ---------- LOT ---------- */}
      <mesh position={[-.6, -.3, .4]} receiveShadow>
        <boxGeometry args={[15.5, .6, 12.5]} />
        <meshStandardMaterial color={HOUSE.grass} flatShading roughness={1} />
      </mesh>
      <mesh position={[-.6, -.62, .4]}>
        <boxGeometry args={[15.9, .08, 12.9]} />
        <meshStandardMaterial color="#2c3a2e" roughness={1} />
      </mesh>
      {/* path to door */}
      <Box p={[3.9, .005, 3.6]} s={[1.3, .04, 4.4]} c={HOUSE.path} />
      <Box p={[3.9, .005, 1.95]} s={[2.8, .04, 1.1]} c={HOUSE.path} />
      {/* fence */}
      {Array.from({ length: 14 }).map((_, i) => (
        <Box key={`f${i}`} p={[-8.2 + i * 1.15, .45, 6.5]} s={[.1, .9, .1]} c="#e8dcc8" />
      ))}
      <Box p={[-.6, .7, 6.5]} s={[15.2, .08, .06]} c="#e8dcc8" />
      <Box p={[-.6, .3, 6.5]} s={[15.2, .08, .06]} c="#e8dcc8" />
      <Tree p={[6.3, 0, 4.8]} s={1.1} />
      <Tree p={[-7.2, 0, 4.2]} s={.9} />
      <Tree p={[6.4, 0, -4.4]} s={.8} />

      {/* ---------- GROUND FLOOR ---------- */}
      <Box p={[0, floorT / 2, 0]} s={[w, floorT, d]} c={HOUSE.floor} />
      {/* floor planks suggestion */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={`pl${i}`} p={[-hx + .6 + i * 1.15, floorT + .004, 0]} s={[.03, .005, d - .2]} c={HOUSE.floorDark} />
      ))}
      {/* kitchen tiles */}
      <Box p={[(-hx + L.kitchenX) / 2, floorT + .006, 0]} s={[L.kitchenX + hx - .1, .005, d - .2]} c="#e9e4d6" />

      {/* back wall */}
      <Box p={[0, h1 / 2 + floorT, -hz]} s={[w + wallT, h1, wallT]} c={HOUSE.wall} />
      {/* left wall */}
      <Box p={[-hx, h1 / 2 + floorT, 0]} s={[wallT, h1, d + wallT]} c={HOUSE.wall} />
      {/* right wall with door opening */}
      <Box p={[hx, h1 / 2 + floorT, -1.0]} s={[wallT, h1, d - 2.2 + wallT]} c={HOUSE.wall} />
      <Box p={[hx, h1 - .35 + floorT, 1.9]} s={[wallT, .7, 1.2]} c={HOUSE.wall} />
      <Box p={[hx, h1 / 2 + floorT, 2.5 + wallT / 2]} s={[wallT, h1, .2]} c={HOUSE.wall} />
      {/* door (open) */}
      <group position={[hx + .09, floorT, 1.3]} rotation={[0, -1.15, 0]}>
        <Box p={[0, (h1 - .7) / 2, .5]} s={[.08, h1 - .7, 1.0]} c={HOUSE.door} />
        <mesh position={[.06, 1.1, .85]}><sphereGeometry args={[.05, 8, 8]} /><meshStandardMaterial color="#e2b65a" metalness={.6} roughness={.3} /></mesh>
      </group>
      {/* door frame */}
      <Box p={[hx, (h1 - .7) / 2 + floorT, 1.3]} s={[.22, h1 - .7, .08]} c={HOUSE.trim} />
      <Box p={[hx, (h1 - .7) / 2 + floorT, 2.5]} s={[.22, h1 - .7, .08]} c={HOUSE.trim} />
      <Box p={[hx, h1 - .7 + floorT, 1.9]} s={[.22, .08, 1.26]} c={HOUSE.trim} />
      {/* go-bag hooks */}
      {[0, 1].map((i) => <Box key={`hook${i}`} p={[2.5 + i * .45, 1.9, -0.1 + 2.2]} s={[.05, .05, .12]} c="#c7cdd8" />)}
      <Box p={[2.7, 1.95, 2.25]} s={[1.0, .08, .06]} c={HOUSE.wood} />

      {/* kitchen half-wall / breakfast counter */}
      <Box p={[L.kitchenX, .55 + floorT, -0.4]} s={[wallT, 1.1, 3.6]} c={HOUSE.wallDark} />
      <Box p={[L.kitchenX, 1.14 + floorT, -0.4]} s={[.5, .08, 3.7]} c={HOUSE.wood} />
      {[0, 1].map((i) => <Cyl key={`stool${i}`} p={[L.kitchenX + .5, .35 + floorT, -1.2 + i * 1.2]} r={.16} h={.06} c={HOUSE.wood} />)}
      {[0, 1].map((i) => <Cyl key={`stoolleg${i}`} p={[L.kitchenX + .5, .17 + floorT, -1.2 + i * 1.2]} r={.03} h={.34} c={HOUSE.wood} />)}

      {/* back-wall windows ground floor */}
      <Window p={[1.6, 1.65 + floorT, -hz + wallT / 2 + .05]} w={1.3} lit={lightsOn} />
      <Window p={[-2.1, 1.75 + floorT, -hz + wallT / 2 + .05]} w={1.0} h={.7} lit={lightsOn} />
      {/* left-wall window (kitchen) */}
      <Window p={[-hx + wallT / 2 + .05, 1.6 + floorT, .8]} rotY={Math.PI / 2} w={1.0} lit={lightsOn} />

      {boarded && (
        <>
          {[0, 1, 2].map((i) => <Box key={`b${i}`} p={[1.6, 1.25 + i * .4 + floorT, -hz + wallT / 2 + .12]} s={[1.6, .18, .05]} c="#8a6a45" r={[0, 0, (i % 2 ? -1 : 1) * .06]} />)}
          {[0, 1].map((i) => <Box key={`bk${i}`} p={[-2.1, 1.55 + i * .4 + floorT, -hz + wallT / 2 + .12]} s={[1.3, .18, .05]} c="#8a6a45" r={[0, 0, (i % 2 ? 1 : -1) * .07]} />)}
        </>
      )}

      {/* ---- Kitchen: counter, stove, sink, pantry shelves ---- */}
      <Box p={[-2.6, .45 + floorT, -2.0]} s={[1.5, .9, .7]} c="#dfe4ea" />
      <Box p={[-2.6, .92 + floorT, -2.0]} s={[1.6, .06, .76]} c="#6e7b8a" />
      <Box p={[-2.2, .97 + floorT, -2.0]} s={[.5, .04, .4]} c="#2b3240" />
      {[0, 1].map((i) => <Cyl key={`burner${i}`} p={[-2.32 + i * .25, 1.0 + floorT, -2.0]} r={.07} h={.02} c="#6b7280" />)}
      <Box p={[-3.0, .95 + floorT, -2.0]} s={[.45, .03, .35]} c="#9aa6b5" />
      <Cyl p={[-3.0, 1.12 + floorT, -2.15]} r={.02} h={.3} c="#9aa6b5" />
      {/* kitchen window above the sink stays on the back wall */}
      {/* pantry shelves (3) on the left wall, facing the room */}
      {[0, 1, 2].map((i) => (
        <Box key={`shelf${i}`} p={[-hx + .35, .62 + i * .6 + floorT, 0.7]} s={[.5, .05, 2.8]} c={HOUSE.shelf} />
      ))}
      <Box p={[-hx + .35, 1.3 + floorT, -0.75]} s={[.5, 1.9, .06]} c={HOUSE.shelf} />
      <Box p={[-hx + .35, 1.3 + floorT, 2.15]} s={[.5, 1.9, .06]} c={HOUSE.shelf} />
      <Box p={[-hx + .35, 2.27 + floorT, 0.7]} s={[.5, .05, 2.8]} c={HOUSE.shelf} />
      {/* fridge next to the counter */}
      <Box p={[-1.45, .95 + floorT, -2.05]} s={[.7, 1.9, .7]} c="#eef2f6" />
      <Box p={[-1.45, 1.2 + floorT, -1.68]} s={[.04, .5, .03]} c="#8c97a6" />

      {/* ---- Sala: sofa, table (power station), TV ---- */}
      <Box p={[0.9, .3 + floorT, -1.7]} s={[2.2, .6, .9]} c="#3b6ea8" />
      <Box p={[0.9, .72 + floorT, -2.05]} s={[2.2, .5, .25]} c="#2f5a8a" />
      {[0, 1, 2].map((i) => <Box key={`cush${i}`} p={[0.2 + i * .7, .62 + floorT, -1.6]} s={[.62, .14, .7]} c="#4a80bf" />)}
      {/* low table = power station */}
      <Box p={[1.0, .7 + floorT, .95]} s={[2.4, .08, .95]} c={HOUSE.table} />
      {[[-1.05, .35], [1.05, .35], [-1.05, -.35], [1.05, -.35]].map(([dx, dz], i) => (
        <Box key={`leg${i}`} p={[1.0 + dx, .33 + floorT, .95 + dz]} s={[.08, .66, .08]} c={HOUSE.table} />
      ))}
      <Box p={[1.0, .25 + floorT, .95]} s={[2.3, .05, .8]} c={HOUSE.table} />
      {/* rug */}
      <Box p={[1.0, floorT + .008, .2]} s={[3.2, .01, 2.6]} c="#b25a4a" />
      <Box p={[1.0, floorT + .012, .2]} s={[2.6, .01, 2.0]} c="#d07a66" />

      {/* ---- Stairs on the back wall ---- */}
      {Array.from({ length: 9 }).map((_, i) => (
        <Box key={`st${i}`} p={[L.stairX - 1.0 + i * .26, floorT + .15 + i * .3, -hz + .5]} s={[.3, .3, .9]} c={HOUSE.stair} />
      ))}
      <Box p={[L.stairX + .1, floorT + 1.5, -hz + .95]} s={[2.6, .04, .04]} c={HOUSE.wood} r={[0, 0, Math.atan2(2.4, 2.1)]} />

      {/* ---- Tool wall pegboard right side ---- */}
      <Box p={[2.4, 1.3 + floorT, -hz + wallT / 2 + .03]} s={[2.0, 2.0, .05]} c="#8a6a45" />
      {Array.from({ length: 12 }).map((_, i) => (
        <Box key={`peg${i}`} p={[1.6 + (i % 4) * .5, .7 + Math.floor(i / 4) * .6 + floorT, -hz + wallT / 2 + .1]} s={[.04, .04, .1]} c="#5a4530" />
      ))}
      {[0, 1, 2].map((i) => <Box key={`tsh${i}`} p={[2.45, .64 + i * .64 + floorT - .32, -hz + .3]} s={[1.9, .05, .5]} c={HOUSE.shelf} />)}

      {/* ---------- SECOND FLOOR ---------- */}
      <Box p={[-0.7, y2 + floorT / 2, 0]} s={[w - 1.4 - 0, floorT, d]} c={HOUSE.floor2} />
      <Box p={[hx - .7, y2 + floorT / 2, 0]} s={[1.4, floorT, d]} c={HOUSE.floor2} />
      {/* stair opening railing */}
      {[0, 1, 2, 3, 4].map((i) => <Box key={`rail${i}`} p={[-0.4 + i * .6, y2 + floorT + .45, -hz + 1.05]} s={[.05, .9, .05]} c={HOUSE.wood} />)}
      <Box p={[0.8, y2 + floorT + .9, -hz + 1.05]} s={[2.6, .06, .06]} c={HOUSE.wood} />
      {/* walls */}
      <Box p={[0, y2 + floorT + h2 / 2, -hz]} s={[w + wallT, h2, wallT]} c={HOUSE.wall} />
      <Box p={[-hx, y2 + floorT + h2 / 2, 0]} s={[wallT, h2, d + wallT]} c={HOUSE.wall} />
      <Box p={[hx, y2 + floorT + h2 / 2, 0]} s={[wallT, h2, d + wallT]} c={HOUSE.wall} />
      {/* partition between bedroom and CR */}
      <Box p={[0.3, y2 + floorT + h2 / 2, -0.4]} s={[wallT, h2, d - 1.6]} c={HOUSE.wallDark} />
      <Window p={[-2.0, y2 + floorT + 1.45, -hz + wallT / 2 + .05]} w={1.2} lit={lightsOn} />
      <Window p={[2.0, y2 + floorT + 1.6, -hz + wallT / 2 + .05]} w={.7} h={.6} lit={lightsOn} />
      {boarded && [0, 1, 2].map((i) => <Box key={`b2${i}`} p={[-2.0, y2 + floorT + 1.05 + i * .4, -hz + wallT / 2 + .12]} s={[1.5, .18, .05]} c="#8a6a45" r={[0, 0, (i % 2 ? -1 : 1) * .06]} />)}

      {/* ---- Bedroom: bed, crib, shelf (baby corner) ---- */}
      <Box p={[-1.0, y2 + floorT + .3, .8]} s={[1.6, .4, 2.2]} c="#8c5a34" />
      <Box p={[-1.0, y2 + floorT + .55, .9]} s={[1.5, .18, 2.0]} c="#f3f0e8" />
      <Box p={[-1.0, y2 + floorT + .62, 1.5]} s={[1.3, .12, .5]} c="#d9e6f5" />
      <Box p={[-1.0, y2 + floorT + .62, .4]} s={[1.5, .1, 1.2]} c="#e9906b" />
      <Box p={[-1.0, y2 + floorT + .8, -.25]} s={[1.7, 1.0, .1]} c="#7a4a2a" />
      {/* crib */}
      <Box p={[-2.9, y2 + floorT + .4, 1.2]} s={[.8, .12, 1.3]} c="#f0e2c8" />
      {Array.from({ length: 5 }).map((_, i) => <Box key={`crib${i}`} p={[-2.52, y2 + floorT + .65, .65 + i * .28]} s={[.04, .6, .04]} c="#e7d2b0" />)}
      {Array.from({ length: 5 }).map((_, i) => <Box key={`cribb${i}`} p={[-3.28, y2 + floorT + .65, .65 + i * .28]} s={[.04, .6, .04]} c="#e7d2b0" />)}
      <Box p={[-2.9, y2 + floorT + .95, 1.2]} s={[.84, .05, 1.34]} c="#e7d2b0" />
      <Box p={[-2.9, y2 + floorT + .52, 1.2]} s={[.7, .12, 1.2]} c="#cfe6ff" />
      {/* baby shelves on back wall */}
      {[0, 1].map((i) => <Box key={`bsh${i}`} p={[-2.2, y2 + floorT + .02 + i * .6 - .03, -2.0]} s={[2.4, .05, .5]} c="#efe3cf" />)}
      <Box p={[-2.2, y2 + floorT + .6, -2.26]} s={[2.5, 1.25, .04]} c="#f8dcdc" />

      {/* ---- CR: sink, toilet, mirror cabinet (medicine) ---- */}
      <Box p={[1.7, y2 + floorT + .01, -0.4]} s={[2.5, .02, 4.2]} c="#dfe8ee" />
      <Box p={[2.6, y2 + floorT + .42, .9]} s={[.5, .84, .5]} c="#f4f7fa" />
      <Box p={[2.6, y2 + floorT + .3, 1.3]} s={[.44, .45, .6]} c="#f4f7fa" />
      <Box p={[1.5, y2 + floorT + .45, 1.6]} s={[.7, .9, .5]} c="#f4f7fa" />
      <Box p={[1.5, y2 + floorT + .92, 1.6]} s={[.76, .06, .54]} c="#c9d4de" />
      {/* med cabinet box on back wall, open */}
      <Box p={[2.0, y2 + floorT + 1.35, -2.1]} s={[2.1, 1.7, .36]} c={HOUSE.cabinet} />
      <Box p={[2.0, y2 + floorT + 1.35, -1.92]} s={[2.0, 1.6, .02]} c="#f7fafc" />
      {[0, 1, 2].map((i) => <Box key={`msh${i}`} p={[2.0, y2 + floorT + .72 + i * .5 - .03, -2.02]} s={[2.0, .04, .3]} c="#b9c5d1" />)}
      <Box p={[1.0, y2 + floorT + 1.35, -1.9]} s={[.04, 1.6, .5]} c="#f7fafc" />
      <Box p={[1.0, y2 + floorT + 1.35, -1.68]} s={[.04, 1.6, .02]} c="#ff6f8d" />
      <Box p={[3.0, y2 + floorT + 1.35, -1.9]} s={[.04, 1.6, .5]} c="#f7fafc" />
      {/* red cross sign */}
      <Box p={[2.0, y2 + floorT + 2.1, -2.26]} s={[.5, .14, .04]} c="#ff6f8d" />
      <Box p={[2.0, y2 + floorT + 2.1, -2.26]} s={[.14, .5, .04]} c="#ff6f8d" />

      {/* ---------- ROOF (back half only — cut-away) ---------- */}
      <group position={[0, roofY, 0]}>
        {/* back slope */}
        <mesh position={[0, L.roofH / 2, -hz / 2]} rotation={[Math.atan2(L.roofH, hz), 0, 0]}>
          <boxGeometry args={[w + 1.2, .14, Math.hypot(L.roofH, hz) + .5]} />
          <meshStandardMaterial color={HOUSE.roof} flatShading roughness={.8} />
        </mesh>
        {/* ridge beam + cut-edge fascia (this is an architectural section, front half removed) */}
        <Box p={[0, L.roofH + .02, 0]} s={[w + 1.3, .18, .26]} c={HOUSE.roofEdge} />
        <Box p={[0, L.roofH - .06, .08]} s={[w + 1.3, .3, .06]} c="#e9d9c0" />
        {/* eave board at the back */}
        <Box p={[0, -.02, -hz - .55]} s={[w + 1.3, .14, .12]} c={HOUSE.roofEdge} />
        {/* gable triangles (left/right) */}
        {[-1, 1].map((sgn) => (
          <mesh key={`gable${sgn}`} position={[sgn * hx, 0, 0]} rotation={[0, -Math.PI / 2 * sgn, 0]}>
            <shapeGeometry args={[new THREE.Shape([new THREE.Vector2(-hz, 0), new THREE.Vector2(0, L.roofH), new THREE.Vector2(hz, 0)])]} />
            <meshStandardMaterial color={HOUSE.wallDark} side={THREE.DoubleSide} flatShading />
          </mesh>
        ))}
        {/* roof ribs along back slope */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`rib${i}`} position={[-hx + .5 + i * .9, L.roofH / 2 + .09, -hz / 2]} rotation={[Math.atan2(L.roofH, hz), 0, 0]}>
            <boxGeometry args={[.08, .06, Math.hypot(L.roofH, hz) + .4]} />
            <meshStandardMaterial color={HOUSE.roofEdge} flatShading />
          </mesh>
        ))}
      </group>

      {/* ---------- WATER CORNER (outside, left) with awning ---------- */}
      <Box p={[-4.9, .02, .4]} s={[2.2, .06, 3.6]} c={HOUSE.concrete} />
      {[[-5.85, -1.2], [-5.85, 2.0]].map(([x, z], i) => <Box key={`post${i}`} p={[x, 1.3, z]} s={[.1, 2.6, .1]} c={HOUSE.wood} />)}
      <mesh position={[-4.9, 2.6, .4]} rotation={[0, 0, .18]}>
        <boxGeometry args={[2.4, .08, 3.6]} />
        <meshStandardMaterial color="#6b7d8c" flatShading />
      </mesh>
      {/* faucet */}
      <Cyl p={[-3.7, .6, -1.0]} r={.03} h={1.2} c={HOUSE.metal} />
      <Box p={[-3.85, 1.2, -1.0]} s={[.3, .06, .06]} c={HOUSE.metal} />

      {/* ---------- Interior lights ---------- */}
      <pointLight position={[-1.8, h1 - .3, -0.5]} intensity={6 * lightInt} distance={7} color="#ffe2b0" decay={2} />
      <pointLight position={[1.4, h1 - .3, .2]} intensity={6 * lightInt} distance={7} color="#ffe2b0" decay={2} />
      <pointLight position={[-1.6, roofY - .4, -0.2]} intensity={5 * lightInt} distance={6} color="#ffe2b0" decay={2} />
      <pointLight position={[2.0, roofY - .4, -0.2]} intensity={4 * lightInt} distance={6} color="#eaf4ff" decay={2} />
      {/* ceiling lamps */}
      {[[-1.8, h1 - .15, -0.5], [1.4, h1 - .15, .2], [-1.6, roofY - .2, -0.2], [2.0, roofY - .2, -0.2]].map(([x, y, z], i) => (
        <mesh key={`lamp${i}`} position={[x, y, z]}>
          <sphereGeometry args={[.12, 8, 6]} />
          <meshStandardMaterial color="#fff6dc" emissive="#ffd98a" emissiveIntensity={lightsOn ? 2.2 : 0} />
        </mesh>
      ))}

      {/* ---------- Room glows ---------- */}
      {(Object.keys(SLOTS) as SlotId[]).map((slot) => (
        <RoomGlow key={slot} slot={slot} color={slotInfo[slot].color} active={slotInfo[slot].missing} intensity={slotInfo[slot].pct} onClick={() => onSelectSlot(slot)} />
      ))}
    </group>
  );
}
