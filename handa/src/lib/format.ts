import i18n from '@/i18n';

export function fmtDays(days: number): string {
  const n = days >= 10 ? Math.round(days) : Math.round(days * 10) / 10;
  return i18n.t('common.days', { count: n });
}
export function fmtDate(ts?: number): string {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString(i18n.language === 'tl' ? 'fil-PH' : 'en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}
export function daysUntil(ts?: number): number | null {
  if (!ts) return null;
  return Math.ceil((ts - Date.now()) / 86400000);
}
export function readinessColor(pct: number): string {
  if (pct >= 80) return 'var(--ok)';
  if (pct >= 50) return 'var(--warn)';
  return 'var(--bad)';
}
export function readinessLevel(pct: number): 0 | 1 | 2 | 3 | 4 {
  if (pct >= 95) return 4;
  if (pct >= 80) return 3;
  if (pct >= 55) return 2;
  if (pct >= 25) return 1;
  return 0;
}
