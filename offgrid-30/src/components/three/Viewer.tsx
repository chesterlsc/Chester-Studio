import { Suspense, lazy, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitImpl } from 'three-stdlib';

// Registry: each model is its own chunk.
const MODELS: Record<string, React.LazyExoticComponent<(p: { step: number }) => React.JSX.Element>> = {
  'layered-filter': lazy(() => import('./models/LayeredFilter')),
};

export default function Viewer({ model, step, resetKey }: { model: string; step: number; resetKey: number }) {
  const Model = MODELS[model];
  const controls = useRef<OrbitImpl>(null);
  useEffect(() => { controls.current?.reset(); }, [resetKey]);
  if (!Model) return <p>Model not found: {model}</p>;
  return (
    <Canvas
      frameloop="demand"                 // only draws when something changes: saves battery
      dpr={[1, 1.75]}
      camera={{ position: [2.6, 2.2, 3.4], fov: 40 }}
      gl={{ antialias: true, powerPreference: 'low-power', alpha: true }}
      style={{ touchAction: 'none' }}
    >
      <hemisphereLight intensity={1.15} color="#ffffff" groundColor="#8a7f6a" />
      <directionalLight position={[3, 5, 2]} intensity={1.6} />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} />
      <Suspense fallback={null}>
        <Model step={step} />
      </Suspense>
      <OrbitControls ref={controls as never} makeDefault enablePan={false} minDistance={2.2} maxDistance={8} target={[0, 0.75, 0]} />
    </Canvas>
  );
}
