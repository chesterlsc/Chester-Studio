import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
type OrbitControlsImpl = React.ComponentRef<typeof OrbitControls>;
import * as THREE from 'three';
import type { CategoryId, InventoryRow, ScenarioId, SlotId } from '@/domain/types';
import { CATEGORY_SLOT } from '@/domain/types';
import { SCENARIOS } from '@/domain/scenarios';
import { catalogById } from '@/domain/catalog';
import { House } from './House';
import { Items, type PlacedItem } from './Items';
import { Weather } from './Weather';
import { Celebrate, type Burst } from './Celebrate';
import { CAT_COLOR, SKY } from './palette';
import { DEFAULT_CAM, MAX_PER_SLOT, SLOTS, defaultCamera, focusCamera, fovFor } from './slots';

export interface HouseSceneProps {
  scenario: ScenarioId;
  inventory: InventoryRow[];
  categoryPct: Partial<Record<CategoryId, number>>;
  missing: CategoryId[];
  focusSlot: SlotId | null;
  onSelectSlot: (slot: SlotId) => void;
  reduced: boolean;
  bursts: Burst[];
  onBurstDone: (id: number) => void;
  onLand?: (item: PlacedItem) => void;
  /** Presentation / landing: slowly orbit. */
  autoRotate?: boolean;
}

const PER_ROW_CAP = 14;
const BIG: ReadonlySet<string> = new Set(['drum', 'gallon']);

export function placeInventory(inventory: InventoryRow[]): PlacedItem[] {
  const rows = [...inventory].sort((a, b) => a.createdAt - b.createdAt);
  const count: Partial<Record<SlotId, number>> = {};
  const out: PlacedItem[] = [];
  for (const r of rows) {
    const item = catalogById(r.catalogId);
    if (!item) continue;
    const slot = CATEGORY_SLOT[item.category];
    const n = Math.min(Math.max(1, Math.round(r.qty)), PER_ROW_CAP);
    for (let i = 0; i < n; i++) {
      const idx = count[slot] ?? 0;
      if (idx >= MAX_PER_SLOT) break;
      count[slot] = idx + 1;
      out.push({ key: `${r.id}#${i}`, shape: item.shape, color: CAT_COLOR[item.category], slot, index: idx, big: BIG.has(item.shape), lit: item.category === 'power' && item.shape === 'lamp' });
    }
  }
  return out;
}

/* ---------- Sky dome: cheap vertical gradient ---------- */
function SkyDome({ top, bottom }: { top: string; bottom: string }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { top: { value: new THREE.Color(top) }, bottom: { value: new THREE.Color(bottom) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(vP.y/60.0 + 0.25, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, smoothstep(0.0,1.0,h)), 1.0); }',
  }), []);
  useEffect(() => { mat.uniforms.top.value.set(top); mat.uniforms.bottom.value.set(bottom); }, [mat, top, bottom]);
  return <mesh material={mat} frustumCulled={false}><sphereGeometry args={[90, 16, 10]} /></mesh>;
}

/* ---------- Camera rig: eases to a slot, shakes on earthquake ---------- */
function Rig({ focusSlot, shake, autoRotate, controls }: { focusSlot: SlotId | null; shake: boolean; autoRotate: boolean; controls: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera, size } = useThree();
  const targetPos = useRef(DEFAULT_CAM.pos.clone());
  const targetLook = useRef(DEFAULT_CAM.look.clone());
  const animating = useRef(0);
  const shakeT = useRef(0);
  const nextShake = useRef(4);
  const aspect = size.width / Math.max(1, size.height);

  useEffect(() => {
    const t = focusSlot ? focusCamera(SLOTS[focusSlot], aspect) : defaultCamera(aspect);
    targetPos.current.copy(t.pos); targetLook.current.copy(t.look);
    animating.current = 1.6;
    // keep a comfortable vertical fov on tall screens
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = fovFor(aspect);
    cam.updateProjectionMatrix();
  }, [focusSlot, aspect, camera]);

  useFrame((state, dt) => {
    const c = controls.current;
    if (animating.current > 0) {
      animating.current -= dt;
      const k = 1 - Math.pow(0.001, dt); // frame-rate independent ease
      camera.position.lerp(targetPos.current, k * .9);
      if (c) { c.target.lerp(targetLook.current, k * .9); c.update(); }
    } else if (autoRotate && c) {
      const t = state.clock.getElapsedTime();
      const d = defaultCamera(aspect);
      const r = Math.hypot(d.pos.x - d.look.x, d.pos.z - d.look.z);
      const a = Math.atan2(d.pos.x - d.look.x, d.pos.z - d.look.z) + Math.sin(t * .35) * .35;
      camera.position.set(d.look.x + Math.sin(a) * r, d.pos.y, d.look.z + Math.cos(a) * r);
      c.target.copy(d.look);
      c.update();
    }
    if (shake) {
      nextShake.current -= dt;
      if (nextShake.current <= 0) { shakeT.current = .9; nextShake.current = 5 + Math.random() * 4; }
      if (shakeT.current > 0) {
        shakeT.current -= dt;
        const a = shakeT.current * .06;
        camera.position.x += (Math.random() - .5) * a;
        camera.position.y += (Math.random() - .5) * a;
      }
    }
  });
  return null;
}

/* ---------- Brownout flicker ---------- */
function Flicker({ on, children }: { on: boolean; children: (lit: boolean) => React.ReactNode }) {
  const [lit, setLit] = useState(on);
  useEffect(() => {
    if (!on) { setLit(false); return; }
    let alive = true;
    let id = 0;
    const loop = () => {
      if (!alive) return;
      setLit((v) => !v);
      id = window.setTimeout(loop, Math.random() < .7 ? 60 + Math.random() * 120 : 1400 + Math.random() * 2600);
    };
    id = window.setTimeout(loop, 1200);
    return () => { alive = false; clearTimeout(id); };
  }, [on]);
  return <>{children(on ? lit : false)}</>;
}

function SceneInner(props: HouseSceneProps) {
  const profile = SCENARIOS[props.scenario];
  const sky = SKY[props.scenario];
  const placed = useMemo(() => placeInventory(props.inventory), [props.inventory]);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = sky.fog ? new THREE.Fog(sky.fog, sky.fogNear ?? 14, sky.fogFar ?? 34) : null;
    return () => { scene.fog = null; };
  }, [scene, sky]);

  const powerItems = props.inventory.filter((r) => catalogById(r.catalogId)?.category === 'power').reduce((n, r) => n + r.qty, 0);
  const brownout = props.scenario === 'brownout';
  const baseLights = brownout ? powerItems >= 3 : true;
  const flicker = brownout && powerItems > 0 && powerItems < 3;

  return (
    <>
      <SkyDome top={sky.top} bottom={sky.bottom} />
      <hemisphereLight args={[sky.bottom, '#2c3a2e', sky.ambient * 1.6]} />
      <directionalLight position={[7, 12, 6]} intensity={sky.sun * 2.2} color={props.scenario === 'heat' ? '#ffd9a0' : '#ffffff'} />
      <directionalLight position={[-6, 6, -4]} intensity={sky.sun * .5} color={sky.top} />

      <Flicker on={flicker || (brownout && baseLights)}>
        {(lit) => (
          <House lightsOn={brownout ? (flicker ? lit : baseLights) : !['heat', 'water', 'earthquake'].includes(props.scenario)} categoryPct={props.categoryPct} missing={props.missing} onSelectSlot={props.onSelectSlot} boarded={props.scenario === 'unrest' || props.scenario === 'zombie'} />
        )}
      </Flicker>

      <Items placed={placed} reduced={props.reduced} onLand={props.onLand} />
      <Weather profile={profile} reduced={props.reduced} />
      <Celebrate bursts={props.bursts} onDone={props.onBurstDone} />

      <OrbitControls ref={controls} enablePan={false} enableDamping dampingFactor={.08} minDistance={6} maxDistance={30} minPolarAngle={.45} maxPolarAngle={1.3} minAzimuthAngle={-.5} maxAzimuthAngle={.75} target={DEFAULT_CAM.look.toArray()} makeDefault />
      <Rig focusSlot={props.focusSlot} shake={props.scenario === 'earthquake' && !props.reduced} autoRotate={!!props.autoRotate} controls={controls} />
    </>
  );
}

export function HouseScene(props: HouseSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 32, near: .1, far: 200, position: DEFAULT_CAM.pos.toArray() }}
      frameloop={props.reduced ? 'demand' : 'always'}
      style={{ touchAction: 'none' }}
    >
      <Suspense fallback={null}>
        <SceneInner {...props} />
      </Suspense>
    </Canvas>
  );
}

export { SLOTS };
