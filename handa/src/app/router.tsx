import { lazy, Suspense } from 'react';
import { createBrowserRouter, createHashRouter, Outlet } from 'react-router-dom';
import { Shell } from './Shell';

const lazyPage = (f: () => Promise<{ default: React.ComponentType }>) => {
  const C = lazy(f);
  return (
    <Suspense fallback={<div className="page" aria-busy="true" />}>
      <C />
    </Suspense>
  );
};

/** Hash routing is used only for hosted previews (e.g. the claude.ai artifact) where path routes cannot be served. */
const makeRouter = import.meta.env.VITE_ROUTER === 'hash' ? createHashRouter : createBrowserRouter;

export const router = makeRouter([
  {
    path: '/',
    element: <Shell><Outlet /></Shell>,
    children: [
      { index: true, element: lazyPage(() => import('@/screens/Landing')) },
      { path: 'play', element: lazyPage(() => import('@/screens/Play')) },
      { path: 'house', element: lazyPage(() => import('@/screens/HouseScreen')) },
      { path: 'score', element: lazyPage(() => import('@/screens/Score')) },
      { path: 'learn', element: lazyPage(() => import('@/screens/Learn')) },
      { path: 'learn/:id', element: lazyPage(() => import('@/screens/LearnDeck')) },
      { path: 'hotlines', element: lazyPage(() => import('@/screens/Hotlines')) },
      { path: 'stock', element: lazyPage(() => import('@/screens/Stock')) },
      { path: 'plan', element: lazyPage(() => import('@/screens/PlanCard')) },
      { path: 'me', element: lazyPage(() => import('@/screens/Me')) },
      { path: 'pricing', element: lazyPage(() => import('@/screens/Pricing')) },
      { path: 'survey', element: lazyPage(() => import('@/screens/Survey')) },
      { path: 'press', element: lazyPage(() => import('@/screens/Press')) },
      { path: 'auth/callback', element: lazyPage(() => import('@/screens/AuthCallback')) },
      { path: '*', element: lazyPage(() => import('@/screens/NotFound')) },
    ],
  },
]);
