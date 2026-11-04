import { useState, type ReactNode } from 'react';
import { useApp } from '../../state/AppState.tsx';
import { WoodScene } from '../three/WoodScene.tsx';
import type { WoodBlock } from '../three/sceneData.ts';
import { ROW_GAP, TOWER_GAP, completeTower, towerBlockWidth, towerLayout, type TowerWord } from '../three/tower.ts';
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
 * same way. Without one, a flat drawing of the same tower stands in: in its
 * box while three.js is fetched, so the box is never an empty patch of sand,
 * and for good where the tower cannot be drawn, so nothing jumps.
 */
export function FinishTower({ words, className = '', fallback }: { words: TowerWord[]; className?: string; fallback?: ReactNode }) {
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
  const sketch = <TowerSketch words={tower.spec.words} />;
  return (
    <>
      {paper ? <Confetti /> : null}
      <WoodScene
        spec={tower.spec}
        label={label}
        className={className}
        fallback={fallback ?? <div className={`wood-scene wood-scene--complete wood-scene--sketch ${className}`}>{sketch}</div>}
        placeholder={fallback ? undefined : sketch}
        onStatic={() => setPaper(true)}
      />
    </>
  );
}

/** One unit of the scene, in the drawing's pixels. */
const U = 40;

/**
 * The tower as a flat drawing: the same blocks in the same rows and colours
 * on a walnut plinth, a gold star on top, no lettering. A picture of what
 * the label beside the scene says, so it is hidden from assistive technology.
 */
export function TowerSketch({ words }: { words: WoodBlock[] }) {
  const { rows, widths, heights } = towerLayout(words);
  const widest = Math.max(...widths);
  const plinth = Math.max(3.4, widest + 0.64);
  const plinthH = 0.32;
  const top = heights.reduce((sum, h) => sum + h + ROW_GAP, 0);
  const starR = 0.5;
  const height = plinthH + top + starR * 2 + 0.35;
  const width = plinth + 0.6;
  const x0 = width / 2;
  const base = height - plinthH;
  const star = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? starR * 0.45 : starR;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    return `${((x0 + Math.cos(a) * r) * U).toFixed(1)},${((base - top - starR - 0.12 + Math.sin(a) * r) * U).toFixed(1)}`;
  }).join(' ');
  return (
    <svg className="tower-sketch" viewBox={`0 0 ${(width * U).toFixed(0)} ${(height * U).toFixed(0)}`} aria-hidden="true" focusable="false">
      <rect className="tower-sketch__plinth" x={(x0 - plinth / 2) * U} y={base * U} width={plinth * U} height={plinthH * U} rx={0.16 * U} />
      {rows.map((row, ri) => {
        let x = x0 - widths[ri]! / 2;
        const bottom = base - heights.slice(0, ri + 1).reduce((sum, h) => sum + h + ROW_GAP, 0);
        return row.map((index) => {
          const w = towerBlockWidth(words[index]!.text);
          const left = x;
          x += w + TOWER_GAP;
          return (
            <rect key={index} className={`tower-sketch__block tower-sketch__block--${words[index]!.tone}`}
              x={left * U} y={bottom * U} width={w * U} height={heights[ri]! * U} rx={0.14 * U} />
          );
        });
      })}
      <polygon className="tower-sketch__star" points={star} />
    </svg>
  );
}
