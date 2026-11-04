import { useState, type ReactNode } from 'react';
import { useApp } from '../../state/AppState.tsx';
import { WoodScene, useSceneMode } from '../three/WoodScene.tsx';
import type { WoodBlock } from '../three/sceneData.ts';
import { ROW_GAP, TOWER_GAP, completeTower, labelLines, towerBlockWidth, towerLayout, type TowerWord } from '../three/tower.ts';
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
 * same way. Without one, a flat drawing of the same tower stands in where
 * the tower cannot be drawn, with the description beside it that the scene
 * would have had. While three.js is fetched the box is never an empty patch
 * of sand: it holds what the scene's first frame will show — the plinth
 * alone where the blocks are about to tumble onto it, the finished tower
 * where the scene stands still — so nothing vanishes to be built again.
 */
export function FinishTower({ words, className = '', fallback }: { words: TowerWord[]; className?: string; fallback?: ReactNode }) {
  const { t } = useApp();
  const mode = useSceneMode();
  const tower = completeTower(words);
  const [paper, setPaper] = useState(!tower);
  if (!tower) return <><Confetti />{fallback}</>;
  // The sentence is in the learner's language and the words in German, each
  // marked so a screen reader says it with a German voice. Phrases lose
  // their own full stop, and a semicolon parts them: "Gut, danke" is one. A
  // question or an exclamation keeps its mark, which says how it is said;
  // the sentence's own full stop is not added after it.
  const shown = tower.spec.words.map((word) => word.text.replace(/[.…]+$/u, ''));
  const german = shown.map((text, index) => (
    <span key={index}>{index > 0 ? '; ' : ''}<span lang="de">{text}</span></span>
  ));
  const template = tower.total > tower.spec.words.length
    ? t('sceneCompleteSomeLabel', { shown: tower.spec.words.length, n: tower.total, words: WORDS })
    : t('sceneCompleteLabel', { n: tower.total, words: WORDS });
  const [head, rest = ''] = template.split(WORDS);
  const tail = /[?!]$/u.test(shown.at(-1) ?? '') && rest.startsWith('.') ? rest.slice(1) : rest;
  const label = <>{head}{german}{tail}</>;
  const sketch = <TowerSketch words={tower.spec.words} />;
  return (
    <>
      {paper ? <Confetti /> : null}
      <WoodScene
        spec={tower.spec}
        label={label}
        className={className}
        fallback={fallback ?? (
          <div className={`wood-scene wood-scene--complete wood-scene--sketch ${className}`}>
            {sketch}
            <p className="visually-hidden wood-scene__label">{label}</p>
          </div>
        )}
        placeholder={fallback ? undefined : mode === 'animate' ? <TowerSketch words={tower.spec.words} bare /> : sketch}
        onStatic={() => setPaper(true)}
      />
    </>
  );
}

/** One unit of the scene, in the drawing's pixels. */
const U = 40;

/** The width of a lettering's average character, in ems (the scene's bold rounded face). */
const CHAR_EM = 0.62;

/**
 * The tower as a flat drawing: the same blocks in the same rows, colours
 * and lettering on a walnut plinth, a gold star on top. A picture of what
 * the label beside it says, so it is hidden from assistive technology.
 *
 * `bare`: the plinth alone, seen from a little above as the scene's first
 * frame shows it, before any block has landed.
 */
export function TowerSketch({ words, bare = false }: { words: WoodBlock[]; bare?: boolean }) {
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
  if (bare) {
    // The scene's walnut disc, seen from a little above, as its first frame
    // frames it on a phone: nearly the slot's width, its top a flat ellipse
    // low in the slot. In a wider slot it keeps its shape, at the foot.
    return (
      <svg className="tower-sketch tower-sketch--bare" viewBox="0 0 130 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
        <path className="tower-sketch__plinth-side" d="M 1 55 v 10 a 64 14 0 0 0 128 0 v -10 Z" />
        <ellipse className="tower-sketch__plinth" cx="65" cy="55" rx="60" ry="13" />
      </svg>
    );
  }
  return (
    <svg className="tower-sketch" viewBox={`0 0 ${(width * U).toFixed(0)} ${(height * U).toFixed(0)}`} aria-hidden="true" focusable="false">
      <rect className="tower-sketch__plinth" x={(x0 - plinth / 2) * U} y={base * U} width={plinth * U} height={plinthH * U} rx={0.16 * U} />
      {rows.map((row, ri) => {
        let x = x0 - widths[ri]! / 2;
        const bottom = base - heights.slice(0, ri + 1).reduce((sum, h) => sum + h + ROW_GAP, 0);
        const h = heights[ri]!;
        return row.map((index) => {
          const word = words[index]!;
          const w = towerBlockWidth(word.text);
          const left = x;
          x += w + TOWER_GAP;
          // As the scene letters it: each line as large as the block's
          // height allows, smaller only where the line would not fit across.
          const lines = labelLines(word.text);
          const longest = Math.max(...lines.map((line) => line.length));
          const size = Math.min(h * (lines.length > 1 ? 0.4 : 0.56), (w * 0.84) / (longest * CHAR_EM));
          return (
            <g key={index}>
              <rect className={`tower-sketch__block tower-sketch__block--${word.tone}`}
                x={left * U} y={bottom * U} width={w * U} height={h * U} rx={0.14 * U} />
              <text className={`tower-sketch__text tower-sketch__text--${word.tone}`} x={(left + w / 2) * U} y={(bottom + h / 2) * U}
                fontSize={(size * U).toFixed(1)} textAnchor="middle" dominantBaseline="central">
                {lines.map((line, li) => (
                  <tspan key={li} x={(left + w / 2) * U} dy={li === 0 ? `${(-(lines.length - 1) / 2) * 1.02}em` : '1.02em'}>{line}</tspan>
                ))}
              </text>
            </g>
          );
        });
      })}
      <polygon className="tower-sketch__star" points={star} />
    </svg>
  );
}
