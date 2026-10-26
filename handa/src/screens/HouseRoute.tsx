import { lazy, Suspense } from 'react';
import { useSettings } from '@/store/useSettings';

const GameScreen = lazy(() => import('@/game/GameScreen'));
const PlanScreen = lazy(() => import('@/plan/PlanScreen'));
const HouseScreen = lazy(() => import('@/screens/HouseScreen'));

/** The 2D room game is the default; blueprint and 3D stay behind a setting. */
export default function HouseRoute() {
  const view = useSettings((s) => s.houseView);
  return <Suspense fallback={<div className="page" aria-busy="true" />}>{view === '3d' ? <HouseScreen /> : view === 'plan' ? <PlanScreen /> : <GameScreen />}</Suspense>;
}
