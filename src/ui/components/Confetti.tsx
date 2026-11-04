import type { CSSProperties } from 'react';

/**
 * A handful of paper scraps that fall once when a lesson or the day's
 * practice is finished. Pure CSS, over in about a second, and gone entirely
 * under reduced motion: the score and the words already say it, this only
 * makes it land. The card it falls in must be positioned and isolated.
 */
export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => (
        <span key={index} style={{ '--i': index } as CSSProperties} />
      ))}
    </div>
  );
}
