/** Decorative brand artwork. Learning instructions remain real, localised text. */
export function DackelScene({ className = '' }: { className?: string }) {
  return <div className={`dackel-scene ${className}`} aria-hidden="true">
    <img src="/illustrations/dackel-day.webp" alt="" width="1536" height="1024" decoding="async" />
    <span className="dackel-scene__hello" lang="de">Hallo!</span>
  </div>;
}

/** A small ink drawing keeps the character recognisable at navigation size. */
export function DackelMark({ className = '' }: { className?: string }) {
  return <svg className={`dackel-mark ${className}`} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M17 19C8 15 5 27 8 40c2 8 9 9 12 1l3-19M47 19c9-4 12 8 9 21-2 8-9 9-12 1l-3-19" fill="#293548" stroke="#293548" strokeWidth="3" />
    <path d="M17 27c0-15 30-15 30 0v12c0 18-30 18-30 0V27Z" fill="#C98650" stroke="#293548" strokeWidth="3" />
    <path d="M18 30c-2-16 31-16 29 0l-8-5-7 6-7-6-7 5Z" fill="#293548" />
    <ellipse cx="25" cy="34" rx="2" ry="3" fill="#293548" /><ellipse cx="39" cy="34" rx="2" ry="3" fill="#293548" />
    <path d="M27 43c0 6 10 6 10 0" stroke="#293548" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M28 39c0-4 8-4 8 0l-4 3-4-3Z" fill="#293548" />
    <path d="m21 51 11 4 11-4-4 10H25l-4-10Z" fill="#F77959" stroke="#293548" strokeWidth="2" />
  </svg>;
}
