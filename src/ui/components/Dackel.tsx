/**
 * Decorative brand artwork. Learning instructions remain real, localised text.
 * The dog greets by default; a finished practice has it cheer instead, since
 * "Hallo!" at the end of something read as the start of it.
 */
export function DackelScene({ className = '', bubble = 'Hallo!' }: { className?: string; bubble?: string }) {
  return <div className={`dackel-scene ${className}`} aria-hidden="true">
    <img src="/illustrations/dackel-day.webp" alt="" width="1536" height="1024" decoding="async" />
    <span className="dackel-scene__hello" lang="de">{bubble}</span>
  </div>;
}

/**
 * A small ink drawing keeps the character recognisable at navigation size.
 * It brings its own yellow disc: the ink is near-black, and on a dark card with
 * nothing behind it the ears and outline disappeared, leaving a floating face.
 */
export function DackelMark({ className = '' }: { className?: string }) {
  return <svg className={`dackel-mark ${className}`} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle cx="32" cy="32" r="32" fill="#F2B630" />
    <path d="M17 19C8 15 5 27 8 40c2 8 9 9 12 1l3-19M47 19c9-4 12 8 9 21-2 8-9 9-12 1l-3-19" fill="#1E1B17" stroke="#1E1B17" strokeWidth="3" />
    <path d="M17 27c0-15 30-15 30 0v12c0 18-30 18-30 0V27Z" fill="#C98650" stroke="#1E1B17" strokeWidth="3" />
    <path d="M18 30c-2-16 31-16 29 0l-8-5-7 6-7-6-7 5Z" fill="#1E1B17" />
    <ellipse cx="25" cy="34" rx="2" ry="3" fill="#1E1B17" /><ellipse cx="39" cy="34" rx="2" ry="3" fill="#1E1B17" />
    <path d="M27 43c0 6 10 6 10 0" stroke="#1E1B17" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M28 39c0-4 8-4 8 0l-4 3-4-3Z" fill="#1E1B17" />
    <path d="m21 51 11 4 11-4-4 10H25l-4-10Z" fill="#D9473B" stroke="#1E1B17" strokeWidth="2" />
  </svg>;
}
