import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/design/icons/Icon';
import type { IconName } from '@/design/icons/names';
import './ui.css';

/* ---------- Button ---------- */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  iconOnly?: boolean;
}
export function Button({ variant = 'secondary', size = 'md', block, icon, iconRight, iconOnly, className = '', children, ...rest }: ButtonProps) {
  const cls = ['btn', `btn--${variant}`, size !== 'md' && `btn--${size}`, block && 'btn--block', iconOnly && 'btn--icon', className].filter(Boolean).join(' ');
  const isz = size === 'sm' ? 18 : 20;
  return (
    <button type="button" className={cls} {...rest}>
      {icon && <Icon name={icon} size={isz} />}
      {!iconOnly && children}
      {iconRight && <Icon name={iconRight} size={isz} />}
    </button>
  );
}

/* ---------- Chip ---------- */
export function Chip({ on, color, children, ...rest }: { on?: boolean; color?: string; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`chip ${on ? 'chip--on' : ''} ${color ? 'chip--dot' : ''}`} style={color ? ({ '--chip-color': color } as React.CSSProperties) : undefined} aria-pressed={on} {...rest}>
      {children}
    </button>
  );
}

/* ---------- Meter ---------- */
export function Meter({ value, color, size, label }: { value: number; color?: string; size?: 'sm' | 'lg'; label?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`meter ${size ? `meter--${size}` : ''}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="meter__fill" style={{ width: `${pct}%`, ...(color ? ({ '--meter-color': color } as React.CSSProperties) : {}) }} />
    </div>
  );
}

/* ---------- Ring ---------- */
export function Ring({ value, size = 160, stroke = 12, color, children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="ring" style={{ width: size, height: size, ...(color ? ({ '--ring-color': color } as React.CSSProperties) : {}) }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle className="ring__track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle className="ring__fill" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} />
      </svg>
      <div className="ring__label">{children}</div>
    </div>
  );
}

/* ---------- Stepper ---------- */
export function Stepper({ value, onChange, min = 0, max = 20, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" className="stepper__btn" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label} −`}><Icon name="minus" size={18} /></button>
      <span className="stepper__val" aria-live="polite">{value}</span>
      <button type="button" className="stepper__btn" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} +`}><Icon name="plus" size={18} /></button>
    </div>
  );
}

/* ---------- Segmented ---------- */
export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: Array<{ value: T; label: ReactNode }>; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={o.value === value} className={`seg__opt ${o.value === value ? 'seg__opt--on' : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Toggle ---------- */
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className="toggle" onClick={() => onChange(!on)} />;
}

/* ---------- Sheet ---------- */
export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet__grab" />
        {title && <h3 style={{ marginBottom: 'var(--s-4)' }}>{title}</h3>}
        {children}
      </div>
    </>,
    document.body,
  );
}

/* ---------- Toasts ---------- */
type Toast = { id: number; text: string; kind?: 'ok' | 'warn'; icon?: IconName };
let toastListeners: Array<(t: Toast) => void> = [];
let toastId = 0;
export function toast(text: string, kind?: 'ok' | 'warn', icon?: IconName) {
  const t: Toast = { id: ++toastId, text, kind, icon };
  toastListeners.forEach((l) => l(t));
}
export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const l = (t: Toast) => {
      setItems((s) => [...s.slice(-2), t]);
      setTimeout(() => setItems((s) => s.filter((x) => x.id !== t.id)), 2600);
    };
    toastListeners.push(l);
    return () => { toastListeners = toastListeners.filter((x) => x !== l); };
  }, []);
  return (
    <div className="toasts" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.kind ? `toast--${t.kind}` : ''}`}>
          {t.icon && <Icon name={t.icon} size={18} />}
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ---------- Empty ---------- */
export function Empty({ icon, title, body, action }: { icon: IconName; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty__icon"><Icon name={icon} size={28} /></div>
      <h3 style={{ color: 'var(--fg)' }}>{title}</h3>
      {body && <p className="small">{body}</p>}
      {action}
    </div>
  );
}

/* ---------- Hint ---------- */
export function Hint({ id, children }: { id: string; children: ReactNode }) {
  const [seen, setSeen] = useState(() => {
    try { return localStorage.getItem(`handa.hint.${id}`) === '1'; } catch { return false; }
  });
  if (seen) return null;
  return (
    <div className="hint rise" role="note">
      <Icon name="bulb" size={18} style={{ flex: 'none', marginTop: 2, color: 'var(--info)' }} />
      <div>{children}</div>
      <button type="button" className="hint__x" aria-label="Dismiss" onClick={() => { setSeen(true); try { localStorage.setItem(`handa.hint.${id}`, '1'); } catch { /* ignore */ } }}><Icon name="close" size={18} /></button>
    </div>
  );
}

/* ---------- Badge ---------- */
export function Badge({ kind, children }: { kind?: 'ok' | 'warn' | 'bad' | 'brand'; children: ReactNode }) {
  return <span className={`badge ${kind ? `badge--${kind}` : ''}`}>{children}</span>;
}

/* ---------- TopBar ---------- */
export function TopBar({ title, onBack, right, eyebrow }: { title: ReactNode; onBack?: () => void; right?: ReactNode; eyebrow?: string }) {
  return (
    <div className="topbar">
      {onBack && <Button variant="ghost" iconOnly icon="back" aria-label="Back" onClick={onBack} />}
      <div className="grow">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 style={{ fontSize: 'var(--fs-xl)' }}>{title}</h2>
      </div>
      {right}
    </div>
  );
}

export { Icon };
