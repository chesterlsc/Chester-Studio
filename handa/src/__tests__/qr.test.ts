import { describe, expect, it } from 'vitest';
import { encodeQR } from '@/lib/qr';

describe('qr encoder', () => {
  it('produces a square matrix with finder patterns', () => {
    const q = encodeQR('https://prepare.ph/plan');
    expect(q.size).toBe(25); // version 2
    expect(q.modules).toHaveLength(q.size);
    // top-left finder: 7×7 ring
    expect(q.modules[0].slice(0, 7)).toEqual([true, true, true, true, true, true, true]);
    expect(q.modules[1].slice(0, 7)).toEqual([true, false, false, false, false, false, true]);
    expect(q.modules[3][3]).toBe(true);
  });
  it('grows to larger versions for longer text', () => {
    const q = encodeQR('x'.repeat(500));
    expect(q.size).toBeGreaterThan(50);
  });
});
