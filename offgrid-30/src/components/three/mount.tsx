// Mounts a 3D model into a container. Loaded on demand only (never on page load).
import { createRoot } from 'react-dom/client';
import Viewer from './Viewer';

export function mount(el: HTMLElement, model: string, step: number) {
  const root = createRoot(el);
  let current = step;
  let resetKey = 0;
  const render = () => root.render(<Viewer model={model} step={current} resetKey={resetKey} />);
  render();
  return {
    setStep(n: number) { current = n; render(); },
    reset() { resetKey++; render(); },
    unmount() { root.unmount(); },
  };
}
