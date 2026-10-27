import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { ItemShape } from '@/domain/types';
import { addOutline, dk, lt, LIGHT, modelBounds, placeLight, toToon } from './toon';

/**
 * Live 3D item viewer: loads public/models/<shape>.glb, swaps its materials for
 * the shared cel-shaded toon look, recolours the `body` slots, adds the ink
 * inverted-hull outline, slowly turns on a turntable and lets the user drag to
 * rotate (no zoom / pan). Transparent background. Renders on demand: frames are
 * only requested while the viewer is visible and spinning (or being dragged).
 *
 * Lazy-load it: `const ItemViewer = lazy(() => import('@/models/ItemViewer'))`.
 */
export interface ItemViewerProps {
  shape: ItemShape;
  /** Tint for the `body` material (`body-dark` / `body-light` are derived). */
  color: string;
  /** Accessible name, also shown as a tooltip. */
  label?: string;
  /** Turntable speed in rad/s (0 disables). */
  spin?: number;
  className?: string;
  style?: CSSProperties;
}

export const modelUrl = (shape: ItemShape) => `${import.meta.env.BASE_URL}models/${shape}.glb`;

const AZ = THREE.MathUtils.degToRad(32), EL = THREE.MathUtils.degToRad(24);
const VIEW_DIR = new THREE.Vector3(Math.sin(AZ) * Math.cos(EL), Math.sin(EL), Math.cos(AZ) * Math.cos(EL));

function recolour(root: THREE.Object3D, color: string) {
  root.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.MeshToonMaterial | undefined;
    if (!m || !(m as THREE.Material).isMaterial) return;
    if (m.name === 'body') m.color.set(color);
    else if (m.name === 'body-dark') m.color.set(dk(color, .72));
    else if (m.name === 'body-light') m.color.set(lt(color, .45));
  });
}

function Model({ shape, color, spin, active }: { shape: ItemShape; color: string; spin: number; active: boolean }) {
  const { scene } = useGLTF(modelUrl(shape));
  const invalidate = useThree((s) => s.invalidate);
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const light = useRef<THREE.DirectionalLight>(null!);
  const pivot = useRef<THREE.Group>(null!);
  const dragging = useRef(false);

  // one toon-shaded, outlined copy per loaded scene
  const { group, center, radius } = useMemo(() => {
    const g = scene.clone(true);
    const mats = new Map<THREE.Material, THREE.MeshToonMaterial>();
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      if (!m.geometry.attributes.normal) m.geometry.computeVertexNormals();
      const src = m.material as THREE.Material;
      let dst = mats.get(src);
      if (!dst) { dst = toToon(src, color); mats.set(src, dst); }
      m.material = dst;
    });
    const b = modelBounds(g);
    const sz = b.getSize(new THREE.Vector3());
    const maxDim = Math.max(sz.x, sz.y, sz.z);
    addOutline(g, maxDim * .02);
    // centre the footprint on the pivot, keep the base at y = 0
    g.position.set(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
    return { group: g, center: new THREE.Vector3(0, sz.y / 2, 0), radius: sz.length() / 2 };
  }, [scene]); // eslint-disable-line react-hooks/exhaustive-deps -- colour applied below

  useEffect(() => { recolour(group, color); invalidate(); }, [group, color, invalidate]);

  // frame the model from the brief's 3/4 angle
  useEffect(() => {
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * (size.width / Math.max(1, size.height)));
    const fov = Math.min(vFov, hFov);
    const dist = (radius * 1.08) / Math.sin(fov / 2);
    camera.position.copy(center).addScaledVector(VIEW_DIR, dist);
    camera.near = dist / 20; camera.far = dist * 4;
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, center, radius, invalidate]);

  useFrame((_, dt) => {
    placeLight(light.current, camera, center, radius * 6);
    if (spin > 0 && active && !dragging.current) {
      pivot.current.rotation.y += Math.min(dt, .05) * spin;
      invalidate();
    }
  });

  return (
    <>
      <ambientLight intensity={LIGHT.ambient} />
      <directionalLight ref={light} intensity={LIGHT.direct} />
      <group ref={pivot}><primitive object={group} /></group>
      <OrbitControls
        target={center}
        enableZoom={false}
        enablePan={false}
        enableDamping={false}
        rotateSpeed={.8}
        minPolarAngle={.35}
        maxPolarAngle={Math.PI / 2 + .15}
        onStart={() => { dragging.current = true; }}
        onEnd={() => { dragging.current = false; invalidate(); }}
      />
    </>
  );
}

export default function ItemViewer({ shape, color, label, spin = .6, className, style }: ItemViewerProps) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  // pause the turntable when scrolled away or the tab is hidden
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let visible = true;
    const update = () => setActive(visible && document.visibilityState !== 'hidden');
    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); }, { threshold: .05 })
      : null;
    io?.observe(el);
    document.addEventListener('visibilitychange', update);
    return () => { io?.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);

  return (
    <div ref={host} className={className} style={{ width: '100%', height: '100%', minHeight: 160, touchAction: 'none', ...style }} title={label} aria-label={label} role="img">
      <Canvas
        flat
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        camera={{ fov: 28, position: [0, 1, 4] }}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Model shape={shape} color={color} spin={spin} active={active} />
        </Suspense>
      </Canvas>
    </div>
  );
}
