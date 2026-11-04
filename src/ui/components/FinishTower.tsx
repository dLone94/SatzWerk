import { useState, type ReactNode } from 'react';
import { useApp } from '../../state/AppState.tsx';
import { WoodScene } from '../three/WoodScene.tsx';
import { completeTower, type TowerWord } from '../three/tower.ts';
import { Confetti } from './Confetti.tsx';

/**
 * A finish, celebrated: the session's new words stacked into a wooden tower
 * with a star on top, and wooden chips for confetti.
 *
 * The paper confetti falls only where the tower is not drawn — no WebGL, a
 * slow phone, no new words to stack — so a finish never gets both. The
 * `fallback` (the cheering dachshund, where there was one) stands in the
 * same way.
 */
export function FinishTower({ words, className = '', fallback = null }: { words: TowerWord[]; className?: string; fallback?: ReactNode }) {
  const { t } = useApp();
  const tower = completeTower(words);
  const [paper, setPaper] = useState(!tower);
  if (!tower) return <><Confetti />{fallback}</>;
  const list = tower.spec.words.map((word) => word.text).join(', ');
  const label = tower.total > tower.spec.words.length
    ? t('sceneCompleteSomeLabel', { shown: tower.spec.words.length, n: tower.total, words: list })
    : t('sceneCompleteLabel', { n: tower.total, words: list });
  return (
    <>
      {paper ? <Confetti /> : null}
      <WoodScene spec={tower.spec} label={label} className={className} fallback={fallback} onStatic={() => setPaper(true)} />
    </>
  );
}
