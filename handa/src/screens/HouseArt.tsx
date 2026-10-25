/** Static isometric house illustration for the landing / onboarding. Pure SVG, no assets. */
export function HouseArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 640 480" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b2a4a" /><stop offset="1" stopColor="#0b0d12" stopOpacity="0" /></linearGradient>
        <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ff6a1a" stopOpacity=".45" /><stop offset="1" stopColor="#ff6a1a" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="640" height="480" fill="url(#sky)" />
      <ellipse cx="320" cy="400" rx="300" ry="60" fill="url(#glow)" />
      {/* lot */}
      <path d="M80 360 320 480 560 360 320 240z" fill="#3f8249" />
      <path d="M80 360v18l240 120v-18z" fill="#2c3a2e" />
      <path d="M560 360v18L320 498v-18z" fill="#243127" />
      <path d="M80 360 320 480 560 360 320 240z" fill="#4f9d5a" />
      {/* path */}
      <path d="M420 410 470 385 500 400 450 425z" fill="#c8c2b5" />
      {/* floor slab */}
      <path d="M160 320 320 400 480 320 320 240z" fill="#c98f5c" />
      {/* back-left wall */}
      <path d="M160 320v-130l160-80v130z" fill="#f4e9d8" />
      {/* back-right wall */}
      <path d="M320 240v-130l160 80v130z" fill="#e3d2b9" />
      {/* second floor */}
      <path d="M160 190 320 270 480 190 320 110z" fill="#d8a877" opacity=".6" />
      {/* pantry shelves (left wall) */}
      {[0, 1, 2].map((i) => <path key={i} d={`M180 ${300 - i * 30}l110-55v6l-110 55z`} fill="#a06a3a" />)}
      {/* items on shelves */}
      {[[190, 280, '#4fb8ff'], [206, 272, '#4fb8ff'], [222, 264, '#ffb24a'], [238, 256, '#ffb24a'], [254, 248, '#d79a62'], [270, 240, '#ffb24a'],
        [190, 250, '#ff6f8d'], [206, 242, '#ff6f8d'], [226, 232, '#ffe25a'], [246, 222, '#ffe25a'], [266, 212, '#7f9bff'],
        [196, 218, '#c88cff'], [216, 208, '#6fe3dc'], [236, 198, '#a4e86e'], [256, 188, '#8fd3a3']].map(([x, y, c], i) => (
        <rect key={i} x={Number(x)} y={Number(y) - 18} width="12" height="18" rx="2" fill={String(c)} />
      ))}
      {/* right wall door */}
      <path d="M400 300v-70l30 15v70z" fill="#7a4a2a" />
      <circle cx="424" cy="262" r="2.5" fill="#e2b65a" />
      {/* go-bag */}
      <path d="M360 300v-28l18 9v28z" fill="#b9c2d6" /><path d="M365 272v-8l8 4v8z" fill="#2b3240" />
      {/* window right wall */}
      <path d="M340 230v-40l40 20v40z" fill="#ffe9b0" /><path d="M340 230v-40l40 20v40z" stroke="#fff" strokeWidth="3" />
      {/* roof */}
      <path d="M140 200 320 110l180 90-180 90z" fill="#2f4b5c" />
      <path d="M140 200 320 290l180-90v10l-180 90-180-90z" fill="#1f3340" />
      <path d="M320 110l180 90" stroke="#1f3340" strokeWidth="4" />
      {/* water drums outside */}
      <ellipse cx="120" cy="372" rx="16" ry="8" fill="#1f4d80" /><rect x="104" y="340" width="32" height="32" fill="#4fb8ff" /><ellipse cx="120" cy="340" rx="16" ry="8" fill="#1f4d80" />
      <ellipse cx="150" cy="388" rx="16" ry="8" fill="#1f4d80" /><rect x="134" y="356" width="32" height="32" fill="#4fb8ff" /><ellipse cx="150" cy="356" rx="16" ry="8" fill="#1f4d80" />
      {/* tree */}
      <rect x="548" y="320" width="8" height="36" fill="#7a5230" /><circle cx="552" cy="306" r="26" fill="#5fae63" /><circle cx="566" cy="292" r="16" fill="#6cc271" />
      {/* rain */}
      {Array.from({ length: 28 }).map((_, i) => <path key={i} d={`M${40 + i * 22} ${20 + (i * 37) % 120}l-6 18`} stroke="#bfe3ff" strokeWidth="2" strokeLinecap="round" opacity=".55" />)}
    </svg>
  );
}
