// DESIGN DEMO model: an upside-down bottle filter built layer by layer.
import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { steps } from './layeredFilter.meta';

type Layer = { step: number; y0: number; y1: number; r0: number; r1: number; color: string; rough?: number };
// y0/y1 = bottom/top height, r0/r1 = radius at bottom/top (bottle is upside down: neck at y=0).
const LAYERS: Layer[] = [
  { step: 2, y0: 0.02, y1: 0.24, r0: 0.15, r1: 0.15, color: '#f4f1ea' },              // cotton plug
  { step: 3, y0: 0.24, y1: 0.72, r0: 0.17, r1: 0.52, color: '#8d8a83', rough: 1 },     // gravel
  { step: 4, y0: 0.72, y1: 1.05, r0: 0.52, r1: 0.52, color: '#b98f55' },              // coarse sand
  { step: 5, y0: 1.05, y1: 1.38, r0: 0.52, r1: 0.52, color: '#2a2a2a' },              // charcoal
  { step: 6, y0: 1.38, y1: 1.78, r0: 0.52, r1: 0.52, color: '#e2c68c' },              // fine sand
  { step: 7, y0: 1.78, y1: 1.84, r0: 0.53, r1: 0.53, color: '#7fa7c9' },              // cloth
];

function bottleGeometry() {
  const pts = [
    [0.17, -0.12], [0.17, 0.2], [0.24, 0.3], [0.42, 0.45], [0.53, 0.62], [0.55, 0.75], [0.55, 2.15],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 48);
}

export default function LayeredFilter({ step }: { step: number }) {
  const invalidate = useThree((s) => s.invalidate);
  const bottle = useMemo(bottleGeometry, []);
  const all = step === 0 || step >= steps.length - 1;
  useEffect(() => { invalidate(); }, [step, invalidate]);

  return (
    <group position={[0, 0, 0]}>
      {/* Bottle (visible from step 1) */}
      {(all || step >= 1) && (
        <mesh geometry={bottle}>
          <meshPhysicalMaterial color="#cfe8f5" transparent opacity={0.28} roughness={0.15} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}

      {LAYERS.map((l) => {
        const shown = all || step >= l.step;
        if (!shown) return null;
        const current = step === l.step;
        const h = l.y1 - l.y0;
        return (
          <group key={l.step} position={[0, l.y0 + h / 2 + (current ? 0.06 : 0), 0]}>
            <mesh>
              <cylinderGeometry args={[l.r1, l.r0, h, 48, 1, false]} />
              <meshStandardMaterial color={l.color} roughness={l.rough ?? 0.9} emissive={current ? '#ffffff' : '#000000'} emissiveIntensity={current ? 0.08 : 0} />
            </mesh>
            {current && (
              <Html position={[0.62, 0, 0]} center={false} style={{ pointerEvents: 'none' }}>
                <div className="m3d-label"><b>{l.step}</b>{steps[l.step].label}</div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Collecting jar */}
      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.85, 40, 1, true]} />
        <meshPhysicalMaterial color="#dfeef6" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {(all || step >= 8) && (
        <mesh position={[0, -0.86, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.36, 40]} />
          <meshStandardMaterial color="#6fb6e6" transparent opacity={0.8} />
        </mesh>
      )}
      {step === 8 && (
        <Html position={[0.5, -0.8, 0]} style={{ pointerEvents: 'none' }}>
          <div className="m3d-label m3d-label--warn">▲ Clearer, not safe: boil or bleach</div>
        </Html>
      )}
    </group>
  );
}
