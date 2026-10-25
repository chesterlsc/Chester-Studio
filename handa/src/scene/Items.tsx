import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ItemShape, SlotId } from '@/domain/types';
import { ItemMesh } from './ItemMesh';
import { SLOTS, slotPosition } from './slots';

export interface PlacedItem {
  key: string;        // rowId#n
  shape: ItemShape;
  color: string;
  slot: SlotId;
  index: number;      // position index within the slot
  lit?: boolean;
  big?: boolean;      // drums/gallons etc. keep scale 1
}

const UP = new THREE.Vector3(0, 1, 0);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface FlightState { t: number; from: THREE.Vector3; ctrl: THREE.Vector3; to: THREE.Vector3; delay: number; landed: number; dur: number }

function FlyingItem({ item, animate, delay, onLand }: { item: PlacedItem; animate: boolean; delay: number; onLand?: () => void }) {
  const g = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const slot = SLOTS[item.slot];
  const to = useMemo(() => slotPosition(slot, item.index), [slot, item.index]);
  const scale = item.big ? 1 : slot.scale;
  const st = useRef<FlightState | null>(null);

  useEffect(() => {
    if (!animate) { st.current = null; return; }
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const from = camera.position.clone().add(dir.multiplyScalar(5.5)).add(new THREE.Vector3(0, -2.2, 0));
    const mid = from.clone().lerp(to, .5);
    const ctrl = mid.add(UP.clone().multiplyScalar(2.2 + Math.random() * .8));
    st.current = { t: 0, from, ctrl, to, delay, landed: -1, dur: .72 + Math.random() * .12 };
    if (g.current) { g.current.position.copy(from); g.current.scale.setScalar(.01); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  useFrame((_, dt) => {
    const obj = g.current; if (!obj) return;
    const s = st.current;
    if (!s) { obj.position.copy(to); obj.scale.setScalar(scale); obj.rotation.set(0, 0, 0); return; }
    if (s.delay > 0) { s.delay -= dt; obj.position.copy(s.from); return; }
    if (s.landed < 0) {
      s.t = Math.min(1, s.t + dt / s.dur);
      const k = easeOutCubic(s.t);
      // quadratic bezier
      const a = s.from.clone().lerp(s.ctrl, k);
      const b = s.ctrl.clone().lerp(s.to, k);
      obj.position.copy(a.lerp(b, k));
      obj.rotation.y = (1 - k) * Math.PI * 2;
      obj.rotation.x = (1 - k) * .8;
      obj.scale.setScalar(scale * (0.3 + 0.7 * k));
      if (s.t >= 1) { s.landed = 0; onLand?.(); }
    } else {
      s.landed += dt;
      const q = Math.min(1, s.landed / .32);
      const squash = Math.sin(q * Math.PI) * .22;
      obj.position.copy(s.to);
      obj.rotation.set(0, 0, 0);
      obj.scale.set(scale * (1 + squash), scale * (1 - squash), scale * (1 + squash));
      if (q >= 1) { obj.scale.setScalar(scale); st.current = null; }
    }
  });

  return (
    <group ref={g} position={to.toArray()} scale={scale}>
      <ItemMesh shape={item.shape} color={item.color} lit={item.lit} />
    </group>
  );
}

export function Items({ placed, reduced, onLand }: { placed: PlacedItem[]; reduced: boolean; onLand?: (item: PlacedItem) => void }) {
  // keys seen before this render → those are not animated.
  const seen = useRef<Set<string> | null>(null);
  const firstMount = seen.current === null;
  if (seen.current === null) seen.current = new Set(placed.map((p) => p.key));
  const fresh = new Set<string>();
  let order = 0;
  const delays = new Map<string, number>();
  for (const p of placed) {
    if (!seen.current.has(p.key)) {
      fresh.add(p.key);
      delays.set(p.key, Math.min(order * .06, 1.2));
      order++;
      seen.current.add(p.key);
    }
  }
  // drop keys that disappeared so re-adding animates again
  useEffect(() => {
    const cur = new Set(placed.map((p) => p.key));
    for (const k of Array.from(seen.current ?? [])) if (!cur.has(k)) seen.current?.delete(k);
  }, [placed]);

  return (
    <group>
      {placed.map((p) => (
        <FlyingItem key={p.key} item={p} animate={!reduced && !firstMount && fresh.has(p.key)} delay={delays.get(p.key) ?? 0} onLand={onLand ? () => onLand(p) : undefined} />
      ))}
    </group>
  );
}
