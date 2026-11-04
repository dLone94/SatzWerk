import { useState, type ReactNode } from 'react';
import { useApp } from '../../state/AppState.tsx';
import { WoodScene } from '../three/WoodScene.tsx';
import { completeTower, type TowerWord } from '../three/tower.ts';
import { Confetti } from './Confetti.tsx';

/** Where the German words go in the label's sentence. */
const WORDS = '\u0000';

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
  // The sentence is in the learner's language and the words in German, each
  // marked so a screen reader says it with a German voice. Phrases lose
  // their own full stop, and a semicolon parts them: "Gut, danke" is one.
  const german = tower.spec.words.map((word, index) => (
    <span key={index}>{index > 0 ? '; ' : ''}<span lang="de">{word.text.replace(/[.!?…]+$/u, '')}</span></span>
  ));
  const template = tower.total > tower.spec.words.length
    ? t('sceneCompleteSomeLabel', { shown: tower.spec.words.length, n: tower.total, words: WORDS })
    : t('sceneCompleteLabel', { n: tower.total, words: WORDS });
  const [head, tail = ''] = template.split(WORDS);
  const label = <>{head}{german}{tail}</>;
  return (
    <>
      {paper ? <Confetti /> : null}
      <WoodScene spec={tower.spec} label={label} className={className} fallback={fallback} onStatic={() => setPaper(true)} />
    </>
  );
}
