import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import '@/i18n';
import '@/design/global.css';
import { router } from '@/app/router';
import { useSettings } from '@/store/useSettings';

// apply persisted theme/motion before first paint
const s = useSettings.getState();
document.documentElement.dataset.theme = s.theme;
document.documentElement.dataset.motion = s.motion;
document.documentElement.dataset.lowdata = s.lowData ? '1' : '0';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

// register the service worker (vite-plugin-pwa autoUpdate)
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true })).catch(() => { /* dev */ });
}
