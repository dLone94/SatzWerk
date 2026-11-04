// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tr } from '../../src/i18n.ts';
import { AppStateContext } from '../../src/state/AppState.tsx';
import type { TowerWord } from '../../src/ui/three/tower.ts';
import { stubState } from './playerStub.tsx';

/**
 * The finished session's tower, as the page sees it: what the picture is
 * said to show, which language each part is in, and the one celebration a
 * finish gets — the wooden chips of a drawn tower, or the paper confetti and
 * a flat drawing where no tower is drawn.
 */

const env = vi.hoisted(() => ({ webgl: true, reducedMotion: false }));
const engine = vi.hoisted(() => ({ mounted: 0, fail: false, hold: false, release: () => {} }));

vi.mock('../../src/ui/three/sceneMode.ts', async (original) => ({
  ...(await original<typeof import('../../src/ui/three/sceneMode.ts')>()),
  readHints: () => ({ reducedMotion: env.reducedMotion }),
  canUseWebgl: () => env.webgl,
}));
vi.mock('../../src/services/loading.ts', () => ({ whenQuiet: () => Promise.resolve(), track: <T,>(work: Promise<T>) => work }));
vi.mock('../../src/ui/three/engine/index.ts', () => ({
  mountScene: (host: HTMLElement, _spec: unknown, options: { onReady: () => void }) => {
    if (engine.fail) throw new Error('no context');
    engine.mounted++;
    const canvas = document.createElement('canvas');
    host.appendChild(canvas);
    // Held: the first frame has not been drawn yet.
    if (engine.hold) engine.release = () => options.onReady();
    else options.onReady();
    return { setGhost: () => {}, replay: () => {}, settle: () => {}, dispose: () => canvas.remove() };
  },
}));

const { FinishTower } = await import('../../src/ui/components/FinishTower.tsx');

const words = (...displays: string[]): TowerWord[] => displays.map((display) => ({ display }));

function show(list: TowerWord[], lang: 'en' | 'bg' = 'en', fallback?: React.ReactNode) {
  return render(
    <AppStateContext.Provider value={stubState({}, lang)}>
      <section className="done-hero">
        <FinishTower words={list} className="done-hero__tower" fallback={fallback} />
      </section>
    </AppStateContext.Provider>,
  );
}

beforeEach(() => {
  env.webgl = true;
  env.reducedMotion = false;
  engine.mounted = 0;
  engine.fail = false;
  engine.hold = false;
});
afterEach(cleanup);

const label = (container: HTMLElement) => waitFor(() => {
  const found = container.querySelector<HTMLElement>('.wood-scene__label');
  if (!found) throw new Error('not drawn yet');
  return found;
});

describe('what the tower is said to show', () => {
  it('names every word when all of them are stacked', async () => {
    const { container } = show(words('der Hund', 'die Katze', 'das Haus'));
    const said = await label(container);
    expect(said.textContent).toBe(tr('sceneCompleteLabel', 'en', { n: 3, words: 'der Hund; die Katze; das Haus' }));
  });

  it('says "6 of the 9" when the tower is capped', async () => {
    const { container } = show(words('eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'));
    const said = await label(container);
    expect(said.textContent).toBe(tr('sceneCompleteSomeLabel', 'en', { shown: 6, n: 9, words: 'eins; zwei; drei; vier; fünf; sechs' }));
    expect(said.textContent).toContain('6 of the 9');
    expect(said.querySelectorAll('[lang="de"]')).toHaveLength(6);
  });

  it('speaks of one word in the singular, in both languages', async () => {
    const en = await label(show(words('das Brot')).container);
    expect(en.textContent).toBe(tr('sceneCompleteLabelOne', 'en', { n: 1, words: 'das Brot' }));
    expect(en.textContent).toContain('1 new word sits');
    cleanup();
    const bg = await label(show(words('das Brot'), 'bg').container);
    expect(bg.textContent).toBe(tr('sceneCompleteLabelOne', 'bg', { n: 1, words: 'das Brot' }));
  });

  it('marks each German word as German, parts them with a semicolon and drops their full stops', async () => {
    const said = await label(show(words('Woher kommst du?', 'Gut, danke.', 'Hallo!', 'Moment…', 'die Katze')).container);
    const german = [...said.querySelectorAll('[lang="de"]')].map((span) => span.textContent);
    expect(german).toEqual(['Woher kommst du', 'Gut, danke', 'Hallo', 'Moment', 'die Katze']);
    expect(said.textContent).toContain('Woher kommst du; Gut, danke; Hallo; Moment; die Katze');
    // Only the words are German: the sentence round them is the learner's.
    expect(said.closest('[lang="de"]')).toBeNull();
  });
});

describe('the one celebration a finish gets', () => {
  it('drops the paper confetti where the tower is drawn: its chips are the confetti', async () => {
    const { container } = show(words('der Hund', 'die Katze'));
    await label(container);
    expect(container.querySelector('.confetti')).toBeNull();
    expect(container.querySelector('.wood-scene--complete.is-live')).not.toBeNull();
  });

  it('lets the paper fall, with a flat drawing of the tower, where no tower is drawn', async () => {
    env.webgl = false;
    const { container } = show(words('der Hund', 'die Katze'));
    await waitFor(() => expect(container.querySelector('.confetti')).not.toBeNull());
    expect(engine.mounted).toBe(0);
    const sketch = container.querySelector('.wood-scene--sketch.done-hero__tower .tower-sketch')!;
    expect(sketch).toHaveAttribute('aria-hidden', 'true');
    // One block per word, in its gender's colour where it has one.
    expect(sketch.querySelectorAll('.tower-sketch__block')).toHaveLength(2);
  });

  it('falls back the same way when the scene cannot start', async () => {
    engine.fail = true;
    const { container } = show(words('der Hund'));
    await waitFor(() => expect(container.querySelector('.confetti')).not.toBeNull());
    expect(container.querySelector('.tower-sketch')).not.toBeNull();
    expect(container.querySelector('.wood-scene__label')).toBeNull();
  });

  it('has nothing to stack without new words: the paper and the page\'s own picture', () => {
    const { container } = show([], 'en', <p className="dackel">Dackel</p>);
    expect(container.querySelector('.confetti')).not.toBeNull();
    expect(container.querySelector('.dackel')).not.toBeNull();
    expect(container.querySelector('.wood-scene')).toBeNull();
  });

  it('keeps the page\'s own picture, where it has one, in place of the drawing', async () => {
    env.webgl = false;
    const { container } = show(words('der Hund'), 'en', <p className="dackel">Dackel</p>);
    await waitFor(() => expect(container.querySelector('.confetti')).not.toBeNull());
    expect(container.querySelector('.dackel')).not.toBeNull();
    expect(container.querySelector('.tower-sketch')).toBeNull();
  });
});

describe('while three.js is on its way', () => {
  /*
   * A lesson's finish showed an empty patch of sand for seconds while the
   * engine was fetched: the box is held for the tower, so nothing jumps.
   */
  it('stands a flat drawing of the tower in the box until the first frame', async () => {
    engine.hold = true;
    const { container } = show(words('der Hund', 'die Katze', 'das Haus'));
    const box = container.querySelector('.wood-scene--complete')!;
    expect(box).toHaveClass('is-waiting');
    expect(box.querySelector('.wood-scene__fallback .tower-sketch')).not.toBeNull();
    expect(box.querySelectorAll('.tower-sketch__block--der, .tower-sketch__block--die, .tower-sketch__block--das')).toHaveLength(0);
    await waitFor(() => expect(engine.mounted).toBe(1));
    engine.release();
    await waitFor(() => expect(box).toHaveClass('is-live'));
    // Drawn: the drawing is hidden under the canvas, and the paper never fell.
    expect(container.querySelector('.confetti')).toBeNull();
  });

  it('colours the drawing\'s blocks as the scene does', () => {
    engine.hold = true;
    const { container } = show([{ display: 'der Hund', article: 'der' }, { display: 'die Katze', article: 'die' }, { display: 'Hallo' }]);
    const blocks = [...container.querySelectorAll('.tower-sketch__block')].map((block) => block.getAttribute('class'));
    expect(blocks.sort()).toEqual(['tower-sketch__block tower-sketch__block--birch', 'tower-sketch__block tower-sketch__block--der', 'tower-sketch__block tower-sketch__block--die']);
  });
});
