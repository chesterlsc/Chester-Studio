import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ScenarioProfile } from '@/domain/types';

function Particles({ count, box, speed, color, size, dir, opacity = .8, drift = 0 }: { count: number; box: [number, number, number, number, number, number]; speed: number; color: string; size: number; dir: 'down' | 'up'; opacity?: number; drift?: number }) {
  const [x0, y0, z0, x1, y1, z1] = box;
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = x0 + Math.random() * (x1 - x0);
      pos[i * 3 + 1] = y0 + Math.random() * (y1 - y0);
      pos[i * 3 + 2] = z0 + Math.random() * (z1 - z0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, x0, y0, z0, x1, y1, z1]);
  const ref = useRef<THREE.Points>(null);
  useFrame((_, dt) => {
    const a = geo.attributes.position as THREE.BufferAttribute;
    const arr = a.array as Float32Array;
    const t = performance.now() / 1000;
    for (let i = 0; i < count; i++) {
      let y = arr[i * 3 + 1] + (dir === 'down' ? -speed : speed) * dt * (0.7 + ((i * 7919) % 100) / 160);
      if (dir === 'down' && y < y0) y = y1;
      if (dir === 'up' && y > y1) y = y0;
      arr[i * 3 + 1] = y;
      if (drift) arr[i * 3] += Math.sin(t + i) * drift * dt;
    }
    a.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={color} size={size} transparent opacity={opacity} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Streaks({ count, speed, len, color, opacity, slant = .25 }: { count: number; speed: number; len: number; color: string; opacity: number; slant?: number }) {
  const [x0, y0, z0, x1, y1, z1] = [-11, 0, -9, 11, 13, 11];
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const x = x0 + Math.random() * (x1 - x0), y = y0 + Math.random() * (y1 - y0), z = z0 + Math.random() * (z1 - z0);
      pos.set([x, y, z, x - slant * len, y + len, z], i * 6);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return g;
  }, [count, len, slant]);
  useFrame((_, dt) => {
    const a = geo.attributes.position as THREE.BufferAttribute; const arr = a.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const k = 0.75 + ((i * 7919) % 100) / 200;
      let y = arr[i * 6 + 1] - speed * k * dt; let x = arr[i * 6] - speed * k * dt * slant;
      if (y < y0) { y = y1; x = x0 + Math.random() * (x1 - x0); }
      arr[i * 6] = x; arr[i * 6 + 1] = y; arr[i * 6 + 3] = x - slant * len; arr[i * 6 + 4] = y + len;
    }
    a.needsUpdate = true;
  });
  return <lineSegments geometry={geo}><lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} /></lineSegments>;
}

function Rain() {
  return (
    <group>
      <Streaks count={700} speed={16} len={.7} color="#cfe9ff" opacity={.55} />
      <Streaks count={300} speed={22} len={1.1} color="#ffffff" opacity={.35} />
    </group>
  );
}

function Flood() {
  const ref = useRef<THREE.Mesh>(null);
  const start = useRef(performance.now());
  useFrame(() => {
    if (!ref.current) return;
    const t = (performance.now() - start.current) / 1000;
    const rise = Math.min(1, t / 7);
    ref.current.position.y = -.2 + rise * .62 + Math.sin(t * 1.4) * .02;
  });
  return (
    <group>
      <mesh ref={ref} position={[-.6, -.2, .4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40, 1, 1]} />
        <meshStandardMaterial color="#3d8fb5" transparent opacity={.62} roughness={.15} metalness={.1} />
      </mesh>
      <Streaks count={400} speed={14} len={.6} color="#cfe9ff" opacity={.45} slant={.1} />
    </group>
  );
}

function Heat() {
  return (
    <group>
      <Particles count={220} box={[-9, 0, -7, 9, 9, 8]} speed={.9} color="#ffe6b8" size={.14} dir="up" opacity={.22} drift={.4} />
      <mesh position={[-14, 16, -22]}>
        <sphereGeometry args={[2.6, 16, 12]} />
        <meshBasicMaterial color="#fff1c2" />
      </mesh>
    </group>
  );
}

function Stars() {
  return <Particles count={220} box={[-30, 10, -30, 30, 28, 10]} speed={0} color="#ffffff" size={.12} dir="up" opacity={.8} />;
}

function Dust({ color = '#e8dcc0' }: { color?: string }) {
  return <Particles count={160} box={[-8, 0, -6, 8, 7, 7]} speed={.35} color={color} size={.09} dir="down" opacity={.35} drift={.6} />;
}

function Fireflies() {
  return <Particles count={70} box={[-8, .3, -6, 8, 4, 7]} speed={.25} color="#ffb347" size={.16} dir="up" opacity={.9} drift={.9} />;
}

function Mist() {
  const refs = useRef<THREE.Mesh[]>([]);
  useFrame(() => {
    const t = performance.now() / 1000;
    refs.current.forEach((m, i) => { if (m) { m.position.x = Math.sin(t * .12 + i * 2) * 3 - .6; m.position.z = 2 + Math.cos(t * .1 + i) * 1.5; } });
  });
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => { if (el) refs.current[i] = el; }} position={[0, .4 + i * .35, 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[18, 14]} />
          <meshBasicMaterial color="#7fd0a0" transparent opacity={.08} depthWrite={false} />
        </mesh>
      ))}
      <Particles count={120} box={[-9, 0, -7, 9, 5, 8]} speed={.3} color="#b5ffd0" size={.1} dir="up" opacity={.3} drift={.5} />
    </group>
  );
}

export function Weather({ profile, reduced }: { profile: ScenarioProfile; reduced: boolean }) {
  if (reduced) return null;
  switch (profile.weather) {
    case 'rain': return <Rain />;
    case 'flood': return <Flood />;
    case 'heat': return <Heat />;
    case 'dark': return <Stars />;
    case 'dry': return <Dust />;
    case 'shake': return <Dust color="#d9cdb4" />;
    case 'dusk': return <><Stars /><Fireflies /></>;
    case 'fog': return <Mist />;
    default: return null;
  }
}
