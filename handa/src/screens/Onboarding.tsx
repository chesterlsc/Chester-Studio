import { lazy, Suspense } from 'react';
import { useSettings } from '@/store/useSettings';

/** First-launch cinematic (src/intro/Cinematic). Lazy so the landing bundle never pays for it. */
const Cinematic = lazy(() => import('@/intro/Cinematic'));

export function Onboarding() {
  const setOnboarded = useSettings((s) => s.setOnboarded);
  return (
    <Suspense fallback={<div style={{ position: 'fixed', inset: 0, zIndex: 85, background: '#0b0d12' }} aria-busy="true" />}>
      <Cinematic onDone={() => setOnboarded(true)} />
    </Suspense>
  );
}
