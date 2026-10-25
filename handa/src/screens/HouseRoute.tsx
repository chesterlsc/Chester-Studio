import { lazy, Suspense } from 'react';
import { useSettings } from '@/store/useSettings';

const PlanScreen = lazy(() => import('@/plan/PlanScreen'));
const HouseScreen = lazy(() => import('@/screens/HouseScreen'));

/** The blueprint editor is the default; the 3D house is kept behind a setting. */
export default function HouseRoute() {
  const view = useSettings((s) => s.houseView);
  return <Suspense fallback={<div className="page" aria-busy="true" />}>{view === '3d' ? <HouseScreen /> : <PlanScreen />}</Suspense>;
}
