import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from '@/ui';
import { SPRITES } from '@/models/manifest';
import { spriteUrl } from '@/models/useSprite';
import { sfx } from '@/lib/sound';
import { S, introLang } from './strings';
import { useCountUp, useMotionOK } from './motion';
import { Avatar, HouseExterior, INK, Palm, SH, Skyline, ink, type AvatarKind } from './toon';
import './intro.css';

/**
 * First-launch cinematic: three full-bleed toon beats (storm → lights out / pantry → family safe),
 * ≤ 12 s when left alone, tap / key / Skip to move on. Every continuous motion (rain, palms, flash,
 * glow, bob) lives on its own thin layer and animates transform/opacity only; the SVG scenery is
 * painted once per beat.
 */
const BEATS = [3600, 3600, 3800];
const PANTRY: Array<[string, number, number, number]> = [
  // [sprite id, x, shelf line y, width] in the 500×600 pantry box
  ['rice-kg', 54, 196, 84], ['instant-noodles', 150, 196, 78], ['canned-sardines--3', 236, 196, 110], ['biscuits', 356, 196, 86],
  ['first-aid-kit', 50, 326, 88], ['paracetamol', 150, 326, 70], ['flashlight', 228, 326, 74], ['batteries', 304, 326, 66], ['radio', 374, 326, 80],
  ['water-bottle-1l--6', 46, 456, 112], ['peanut-butter', 176, 456, 62], ['mason-jars', 250, 456, 90], ['powerbank', 356, 456, 84],
  ['water-drum', 40, 578, 118], ['water-gallon-5', 172, 578, 86], ['go-bag', 356, 578, 104],
];
const FAM: AvatarKind[] = ['adults', 'kids', 'adults', 'babies', 'seniors', 'pets'];

function Storm() {
  return (
    <>
      <div className="in-sky in-sky--storm" />
      <div className="in-layer" style={{ '--depth': 5 } as CSSProperties}><i className="in-cloud in-cloud--a" /><i className="in-cloud in-cloud--b" /><i className="in-cloud in-cloud--c" /></div>
      <div className="in-layer" style={{ '--depth': 9 } as CSSProperties}><Skyline className="in-far" night /></div>
      <div className="in-layer" style={{ '--depth': 14 } as CSSProperties}>
        <div className="in-palm in-palm--l"><Palm /></div>
        <HouseExterior className="in-house" lit night />
        <div className="in-palm in-palm--r"><Palm /></div>
      </div>
      <div className="in-rain in-rain--far" /><div className="in-rain in-rain--near" />
      <div className="in-flash" />
      <svg className="in-bolt" viewBox="0 0 60 120" aria-hidden="true"><path d="M38 0 10 66h22L18 120 54 44H30z" fill="#fff6b0" {...ink(2.5)} /></svg>
    </>
  );
}

function PantryRoom() {
  return (
    <svg viewBox="0 0 500 600" className="in-pantry" aria-hidden="true">
      <rect width={500} height={600} fill="#f1c9a0" />
      <rect x={0} y={520} width={500} height={80} fill="#b07a48" />
      <path d="M0 520h500" {...ink(5)} />
      {[80, 180, 280, 380].map((x) => <path key={x} d={`M${x} 524v76`} stroke={INK} strokeWidth={2} opacity=".25" />)}
      <rect x={0} y={506} width={500} height={16} fill="#d9a06a" {...ink(3)} />
      <rect x={0} y={0} width={500} height={22} fill="#ffe3c2" {...ink(3)} />
      {/* window with the storm outside */}
      <rect x={330} y={44} width={130} height={96} rx={8} fill="#1a2240" {...ink(4)} />
      <path d="M395 44v96M330 92h130" {...ink(3)} />
      <path d="M350 60l-5 14M372 70l-5 14M420 56l-5 14M440 84l-5 14" stroke="#cfe3ff" strokeWidth={2.4} strokeLinecap="round" opacity=".6" />
      <path d="M322 40h18v104h-18z" fill="#ff9a6a" {...ink(3)} /><path d="M460 40h18v104h-18z" fill="#ff9a6a" {...ink(3)} />
      {/* calendar + photo */}
      <rect x={60} y={50} width={70} height={84} rx={6} fill="#fff6e0" {...ink(3)} /><rect x={60} y={50} width={70} height={20} rx={6} fill="#ff6a1a" {...ink(3)} />
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={68 + c * 15} y={78 + r * 16} width={10} height={10} rx={2} fill="#2a1812" opacity=".18" />))}
      <rect x={160} y={64} width={64} height={52} rx={6} fill="#5fae63" {...ink(3)} /><circle cx={178} cy={82} r={8} fill="#ffd166" /><path d="M164 112l20-20 14 10 10-6 12 16z" fill="#3f8a4a" />
      {/* shelves */}
      {[196, 326, 456].map((y) => (
        <g key={y}>
          <path d={`M26 ${y + 14}l14-16M474 ${y + 14}l-14-16`} {...ink(4)} />
          <rect x={20} y={y} width={460} height={14} rx={4} fill="#c98a4b" {...ink(4)} />
          <rect x={20} y={y + 10} width={460} height={4} fill={SH} />
        </g>
      ))}
      {/* shelf labels on the board face */}
      {[['PANTRY', 196], ['MEDS', 326], ['WATER', 456]].map(([lbl, y]) => <text key={lbl} x={468} y={(y as number) + 11} textAnchor="end" fontFamily="var(--font-mono)" fontWeight={700} fontSize={9} letterSpacing={1} fill="#fff6e0">{lbl}</text>)}
    </svg>
  );
}

function Lantern() {
  return (
    <svg viewBox="0 0 60 170" className="in-lantern" aria-hidden="true">
      <path d="M30 0v74" {...ink(4)} />
      <path d="M18 78h24l-4-6H22z" fill="#8a5a36" {...ink(3)} />
      <rect x={16} y={78} width={28} height={50} rx={10} fill="#ffe08a" {...ink(3.5)} />
      <rect x={30} y={78} width={14} height={50} rx={10} fill="#ffc247" opacity=".7" />
      <path d="M16 103h28M30 78v50" {...ink(2)} />
      <rect x={20} y={128} width={20} height={8} rx={3} fill="#8a5a36" {...ink(3)} />
      <circle cx={24} cy={92} r={4} fill="#fff" opacity=".8" />
    </svg>
  );
}

function Pantry() {
  return (
    <>
      <div className="in-sky in-sky--room" />
      <div className="in-pbox">
        <PantryRoom />
        {PANTRY.map(([id, x, y, w], i) => {
          const e = SPRITES[id]; if (!e) return null;
          const h = w * (e.h / e.w); const top = y - h * e.base;
          return <img key={id} src={spriteUrl(e)} alt="" className="in-sprite" width={e.w} height={e.h} draggable={false} decoding="async" style={{ left: `${x / 5}%`, top: `${top / 6}%`, width: `${w / 5}%`, '--i': i } as CSSProperties} />;
        })}
        <Lantern />
        <div className="in-glow" />
        <div className="in-dark" />
      </div>
    </>
  );
}

function Dawn() {
  return (
    <>
      <div className="in-sky in-sky--dawn" />
      <i className="in-sun" />
      <div className="in-layer" style={{ '--depth': 9 } as CSSProperties}><Skyline className="in-far" night={false} /></div>
      <div className="in-layer" style={{ '--depth': 14 } as CSSProperties}>
        <div className="in-palm in-palm--l in-palm--calm"><Palm /></div>
        <HouseExterior className="in-house" lit night={false} />
        <div className="in-palm in-palm--r in-palm--calm"><Palm /></div>
      </div>
      <div className="in-fam">{FAM.map((k, i) => <div key={i} className="in-fam__a" style={{ '--i': i } as CSSProperties}><div className="in-fam__b"><Avatar kind={k} i={i} size={72} /></div></div>)}</div>
    </>
  );
}

function Meter({ label, ok }: { label: string; ok: boolean }) {
  const [target, setTarget] = useState(ok ? 0 : 100);
  useEffect(() => { if (!ok) return; const id = setTimeout(() => setTarget(100), 500); return () => clearTimeout(id); }, [ok]);
  const pct = useCountUp(target, 1600, ok);
  return (
    <div className="in-meter" role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span className="in-meter__lbl">{label}</span>
      <div className="in-meter__bar"><i style={{ '--p': pct / 100 } as CSSProperties} /></div>
      <b className="in-meter__pct">{pct}%</b>
    </div>
  );
}

function TitleCard({ text, sub }: { text: string; sub: string }) {
  const words = text.split(' ');
  let n = 0;
  return (
    <h2 className="in-tc" aria-label={text}>
      <span className="in-tc__line">
        {words.map((w, wi) => (
          <span key={wi} className={`in-tc__w ${wi === 0 ? 'in-tc__w--brand' : ''}`} aria-hidden="true">
            {w.split('').map((ch, ci) => <span key={ci} className="in-tc__c" style={{ '--i': n++ } as CSSProperties}>{ch}</span>)}
          </span>
        ))}
      </span>
      <span className="in-tc__sub">{sub}</span>
    </h2>
  );
}

export default function Cinematic({ onDone }: { onDone: () => void }) {
  const { t, i18n } = useTranslation();
  const L = S[introLang(i18n.language)];
  const motion = useMotionOK();
  const [beat, setBeat] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const last = beat === BEATS.length - 1;

  const advance = useCallback(() => {
    if (last) { onDone(); return; }
    sfx.tap();
    setBeat((b) => Math.min(BEATS.length - 1, b + 1));
  }, [last, onDone]);

  // auto-advance only when motion is on; with reduced motion the viewer drives the pace
  useEffect(() => {
    if (!motion || last) return;
    const id = setTimeout(() => setBeat((b) => Math.min(BEATS.length - 1, b + 1)), BEATS[beat]);
    return () => clearTimeout(id);
  }, [beat, motion, last]);
  useEffect(() => { root.current?.focus(); }, []);
  // warm the pantry sprites during beat 1 so beat 2 pops in with no network gaps
  useEffect(() => { for (const [id] of PANTRY) { const e = SPRITES[id]; if (e) { const im = new Image(); im.src = spriteUrl(e); } } }, []);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); advance(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setBeat((b) => Math.max(0, b - 1)); }
    else if (e.key === 'Escape') { e.preventDefault(); onDone(); }
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!motion || e.pointerType === 'touch') return;
    const x = (e.clientX / window.innerWidth - .5) * 2, y = (e.clientY / window.innerHeight - .5) * 2;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => { const el = root.current; if (!el) return; el.style.setProperty('--px', x.toFixed(3)); el.style.setProperty('--py', y.toFixed(3)); });
  };

  const B = L.beats[beat];
  return (
    <div ref={root} className={`in-cine in-cine--b${beat}`} role="dialog" aria-modal="true" aria-label={B.title} tabIndex={-1} onKeyDown={onKey} onPointerMove={onMove} onClick={advance} data-motion={motion ? 'on' : 'off'}>
      <div className="in-cine__stage" key={beat} aria-hidden="true">
        {beat === 0 ? <Storm /> : beat === 1 ? <Pantry /> : <Dawn />}
      </div>
      <div className="in-cine__top" onClick={(e) => e.stopPropagation()}>
        <div className="in-cine__prog" aria-hidden="true">
          {BEATS.map((ms, k) => <span key={`${k}-${k === beat}`} className={`in-cseg ${k < beat ? 'in-cseg--done' : k === beat ? 'in-cseg--run' : ''}`} style={{ '--beat': `${ms}ms` } as CSSProperties} />)}
        </div>
        <button type="button" className="in-cine__skip" onClick={onDone} aria-label={L.skipAria}>{t('common.skip')}</button>
      </div>
      <div className="in-cine__copy" key={`c${beat}`}>
        <div className="in-cine__eyebrow"><b>{String(beat + 1).padStart(2, '0')} / 0{BEATS.length}</b><span>{B.eyebrow}</span></div>
        {last && <Meter label={L.readiness} ok={motion} />}
        {last ? <TitleCard text={L.titleCard} sub={L.titleSub} /> : <h2 className="in-cine__title">{B.title}</h2>}
        <p className="in-cine__body">{B.body}</p>
        {last
          ? <Button variant="primary" size="lg" className="in-cine__go" iconRight="chevron" onClick={(e) => { e.stopPropagation(); sfx.pop(); onDone(); }}>{t('onboard.go')}</Button>
          : <div className="in-tap"><Icon name="hand" size={16} />{L.tap}<Icon name="chevron" size={16} /></div>}
      </div>
    </div>
  );
}
