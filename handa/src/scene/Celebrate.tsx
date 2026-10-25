import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface Burst { id: number; position: THREE.Vector3; color: string }

const N = 26;
function OneBurst({ burst, onDone }: { burst: Burst; onDone: (id: number) => void }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const t = useRef(0);
  const vel = useMemo(() => Array.from({ length: N }, () => new THREE.Vector3((Math.random() - .5) * 4, 2.5 + Math.random() * 3, (Math.random() - .5) * 4)), []);
  const spin = useMemo(() => Array.from({ length: N }, () => new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8)), []);
  const done = useRef(false);
  useFrame((_, dt) => {
    t.current += dt;
    const life = 1.5;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const v = vel[i];
      v.y -= 9.8 * dt;
      m.position.addScaledVector(v, dt);
      m.rotation.x += spin[i].x * dt; m.rotation.y += spin[i].y * dt; m.rotation.z += spin[i].z * dt;
      const k = Math.max(0, 1 - t.current / life);
      m.scale.setScalar(k);
    });
    if (t.current > life && !done.current) { done.current = true; onDone(burst.id); }
  });
  return (
    <group position={burst.position}>
      {Array.from({ length: N }).map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) refs.current[i] = el; }}>
          <boxGeometry args={[.12, .06, .02]} />
          <meshStandardMaterial color={i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? burst.color : '#ffd23f'} emissive={burst.color} emissiveIntensity={.5} />
        </mesh>
      ))}
    </group>
  );
}

export function Celebrate({ bursts, onDone }: { bursts: Burst[]; onDone: (id: number) => void }) {
  return <>{bursts.map((b) => <OneBurst key={b.id} burst={b} onDone={onDone} />)}</>;
}
