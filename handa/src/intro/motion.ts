import { useEffect, useState } from 'react';
import { useSettings } from '@/store/useSettings';

const MQ = '(prefers-reduced-motion: reduce)';

/** Reactive "fancy motion allowed": settings (motion off / low data) and the OS preference. */
export function useMotionOK(): boolean {
  const motion = useSettings((s) => s.motion);
  const lowData = useSettings((s) => s.lowData);
  const [reduce, setReduce] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(MQ).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(MQ); if (!mq) return;
    const on = () => setReduce(mq.matches);
    mq.addEventListener('change', on); return () => mq.removeEventListener('change', on);
  }, []);
  return motion !== 'off' && !lowData && !reduce;
}

/** Number that eases toward `target` (rAF, ~ms long). Instant when motion is off. */
export function useCountUp(target: number, ms = 520, ok = true): number {
  const [v, setV] = useState(target);
  useEffect(() => {
    if (!ok) { setV(target); return; }
    let raf = 0; const from = v; const t0 = performance.now();
    if (from === target) return;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms); const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(from + (target - from) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, ms, ok]);
  return v;
}
