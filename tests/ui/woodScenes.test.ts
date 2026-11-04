import { describe, expect, it } from 'vitest';
import { CURRICULUM, SCENARIO_SCRIPTS, describeNoun } from '../../src/content/index.ts';
import type { Exercise } from '../../src/content/types.ts';
import { splitScaffold } from '../../src/core/validation/text.ts';
import { pathBoard } from '../../src/ui/three/board.ts';
import { feedbackScene, feedbackSwap, ghostText, paintRow, questionBlocks, railTokens, MAX_RAIL_BLOCKS } from '../../src/ui/three/rails.ts';
import { todayTown } from '../../src/ui/three/sceneData.ts';
import { sceneMode } from '../../src/ui/three/sceneMode.ts';
import { MAX_TOWER_WORDS, completeTower, towerRows } from '../../src/ui/three/tower.ts';

/**
 * The wooden scenes, without WebGL: what each would draw, from the learner's
 * real data. The scenes themselves only draw what these return, so these
 * are where "never invent a number, never show the answer" is kept.
 */

const every: Exercise[] = [
  ...CURRICULUM.flatMap((level) => level.units.flatMap((unit) => [
    ...unit.lessons.flatMap((lesson) => [...lesson.exercises, ...lesson.mastery.exercises]),
    ...(unit.checkpoint?.exercises ?? []),
  ])),
  ...SCENARIO_SCRIPTS.flatMap((script) => script.beats.flatMap((beat) => (beat.who === 'you' ? [beat.exercise] : []))),
];

describe('whether a scene is drawn', () => {
  const capable = { webgl: true, reducedMotion: false, deviceMemory: 8, hardwareConcurrency: 8, saveData: false };

  it('animates on a capable browser', () => {
    expect(sceneMode(capable)).toBe('animate');
    // A hint the browser does not give is not held against it.
    expect(sceneMode({ webgl: true, reducedMotion: false })).toBe('animate');
  });

  it('draws the finished pose once under reduced motion', () => {
    expect(sceneMode({ ...capable, reducedMotion: true })).toBe('still');
  });

  it('keeps the static picture without WebGL, whatever else is true', () => {
    expect(sceneMode({ ...capable, webgl: false })).toBe('static');
    expect(sceneMode({ ...capable, webgl: false, reducedMotion: true })).toBe('static');
  });

  it('keeps the static picture on a low-end phone or when data is to be spared', () => {
    expect(sceneMode({ ...capable, deviceMemory: 2 })).toBe('static');
    expect(sceneMode({ ...capable, deviceMemory: 0.5 })).toBe('static');
    expect(sceneMode({ ...capable, deviceMemory: 4 })).toBe('animate');
    expect(sceneMode({ ...capable, hardwareConcurrency: 2 })).toBe('static');
    expect(sceneMode({ ...capable, hardwareConcurrency: 3 })).toBe('animate');
    expect(sceneMode({ ...capable, saveData: true })).toBe('static');
    // Low-end wins over reduced motion: nothing is downloaded at all.
    expect(sceneMode({ ...capable, saveData: true, reducedMotion: true })).toBe('static');
  });
});

describe('the question rail', () => {
  const step = (kind: string, scaffold: string, hideText = false) => ({ kind, scaffold, hideText });

  it('shows the words either side of the gap and an empty slot', () => {
    const spec = questionBlocks(step('fillBlank', 'Ich komme ___ Bulgarien.'), describeNoun)!;
    expect(spec.before.map((block) => block.text)).toEqual(['Ich', 'komme']);
    expect(spec.after.map((block) => block.text)).toEqual(['Bulgarien.']);
    expect(spec.tail).toBe('');
    expect(ghostText('', spec.tail)).toBe('?');
    expect(ghostText('  aus ', spec.tail)).toBe('aus');
  });

  it('carries punctuation glued to the gap onto what is typed', () => {
    const spec = questionBlocks(step('fillBlank', 'Wie geht es ___?'), describeNoun)!;
    expect(spec.tail).toBe('?');
    expect(ghostText('dir', spec.tail)).toBe('dir?');
    expect(ghostText('', spec.tail)).toBe('?');
  });

  it('is only for a sentence: two words on screen besides the gap, on one rail', () => {
    expect(questionBlocks(step('fillBlank', '___ Nacht'), describeNoun)).toBeNull();
    expect(questionBlocks(step('partialRecall', 'Auf W___'), describeNoun)).toBeNull();
    expect(questionBlocks(step('partialRecall', 'Wie h___ Sie?'), describeNoun)).not.toBeNull();
    expect(questionBlocks(step('fillBlank', 'Ich habe ___ und du hast auch eine sehr kleine Tochter.'), describeNoun)).toBeNull();
  });

  it('is not for drills, choices, translations or listening', () => {
    for (const kind of ['articleRecall', 'conjugation', 'type', 'wordOrder', 'sentenceBuild', 'multipleChoice', 'listenChoose', 'dictation', 'freeWriting', 'nounWithArticle']) {
      expect(questionBlocks(step(kind, 'Ich komme ___ Bulgarien.'), describeNoun), kind).toBeNull();
    }
    expect(questionBlocks(step('fillBlank', 'Ich komme ___ Bulgarien.', true), describeNoun)).toBeNull();
    expect(questionBlocks({ kind: 'fillBlank' }, describeNoun)).toBeNull();
  });

  it('never holds the answer: every block is a word the screen already shows', () => {
    let rails = 0;
    for (const exercise of every) {
      for (const authored of exercise.steps) {
        const spec = questionBlocks({ kind: exercise.kind, scaffold: authored.scaffold, hideText: authored.audio?.hideText }, describeNoun);
        if (!spec) continue;
        rails++;
        const { before, after } = splitScaffold(authored.scaffold!);
        const blocks = [...spec.before, ...spec.after].map((block) => block.text);
        // Exactly the words on screen either side of the field, in order.
        expect(blocks, authored.id).toEqual([...railTokens(before), ...railTokens(after.slice(spec.tail.length))]);
        expect(blocks.length + 1, authored.id).toBeLessThanOrEqual(MAX_RAIL_BLOCKS);
        // And so never the answer: an accepted answer is a block only where
        // the sentence itself shows that word as well.
        const visible = `${before} ${after}`.toLowerCase().split(/[^\p{L}]+/u);
        const words = blocks.map((text) => text.toLowerCase().replace(/[^\p{L}\s]/gu, ''));
        for (const answer of authored.answer.accepted) {
          if (visible.includes(answer.toLowerCase())) continue;
          expect(words, `${authored.id} shows ${answer}`).not.toContain(answer.toLowerCase());
        }
      }
    }
    // The rail is for real content, not an empty promise.
    expect(rails).toBeGreaterThan(100);
  });

  it('colours a noun only where its own article stands before it on screen', () => {
    const nouns = (noun: string) => ({ Brot: { display: 'das Brot', gender: 'n' as const, plural: 'die Brote' },
      Tochter: { display: 'die Tochter', gender: 'f' as const, plural: 'die Töchter' },
      Lehrer: { display: 'der Lehrer', gender: 'm' as const, plural: 'die Lehrer' } })[noun];
    expect(paintRow(['Das', 'Brot', 'ist', 'frisch.'], nouns).map((block) => block.tone)).toEqual(['das', 'das', 'birch', 'birch']);
    // The gap is the article: nothing on screen says the gender, and nothing may.
    const gap = questionBlocks({ kind: 'fillBlank', scaffold: 'Ich habe ___ Tochter.' }, nouns)!;
    expect([...gap.before, ...gap.after].map((block) => block.tone)).toEqual(['birch', 'birch', 'birch']);
    // A wrong article is not a gender; nor is "die" before a plural that looks singular.
    expect(paintRow(['der', 'Tochter'], nouns).map((block) => block.tone)).toEqual(['birch', 'birch']);
    expect(paintRow(['die', 'Lehrer'], nouns).map((block) => block.tone)).toEqual(['birch', 'birch']);
    expect(paintRow(['die,', 'Tochter'], nouns).map((block) => block.tone)).toEqual(['birch', 'birch']);
  });
});

describe('the feedback swap', () => {
  it('finds the one word that was wrong', () => {
    expect(feedbackSwap('Ich komme von Bulgarien.', 'Ich komme aus Bulgarien.'))
      .toEqual({ before: ['Ich', 'komme'], wrong: 'von', right: 'aus', after: ['Bulgarien.'] });
    // Case and punctuation are not the difference.
    expect(feedbackSwap('ich komme von Bulgarien', 'Ich komme aus Bulgarien.'))
      .toEqual({ before: ['Ich', 'komme'], wrong: 'von', right: 'aus', after: ['Bulgarien.'] });
    expect(feedbackSwap('Ich heise Anna.', 'Ich heiße Anna.')!.wrong).toBe('heise');
  });

  it('has nothing to show for any other kind of wrong', () => {
    expect(feedbackSwap('Ich komme aus Bulgarien.', 'Ich komme aus Bulgarien.')).toBeNull();
    expect(feedbackSwap('ich komme aus bulgarien', 'Ich komme aus Bulgarien.')).toBeNull();
    expect(feedbackSwap('Ich gehe von Bulgarien.', 'Ich komme aus Bulgarien.')).toBeNull();
    expect(feedbackSwap('völlig falsch', 'Hallo!')).toBeNull();
    expect(feedbackSwap('Ich komme Bulgarien.', 'Ich komme aus Bulgarien.')).toBeNull();
    expect(feedbackSwap('Komme ich aus Bulgarien?', 'Ich komme aus Bulgarien.')).toBeNull();
    expect(feedbackSwap('', 'Hallo')).toBeNull();
  });

  it('is a scene only for a sentence: words around the swap, on one rail', () => {
    expect(feedbackScene('Hund', 'Katze', describeNoun)).toBeNull();
    expect(feedbackScene('die Tisch', 'der Tisch', describeNoun)).toBeNull();
    const spec = feedbackScene('Ich komme von Bulgarien.', 'Ich komme aus Bulgarien.', describeNoun)!;
    expect(spec).toMatchObject({ scene: 'feedback', wrong: 'von', right: 'aus' });
    expect(spec.before.map((block) => block.text)).toEqual(['Ich', 'komme']);
    expect(feedbackScene('a b c d e f g h', 'a b c d x f g h', describeNoun)).toBeNull();
  });
});

describe('the finished tower', () => {
  it('stacks the session\'s real words, coloured by their gender', () => {
    const tower = completeTower([{ display: 'das Brot', article: 'das' }, { display: 'Hallo' }, { display: 'der Morgen', article: 'der' }])!;
    expect(tower.total).toBe(3);
    expect(tower.spec.words).toEqual([
      { text: 'das Brot', tone: 'das' }, { text: 'Hallo', tone: 'birch' }, { text: 'der Morgen', tone: 'der' },
    ]);
  });

  it('caps the tower at six and says how many there were', () => {
    const words = Array.from({ length: 11 }, (_, index) => ({ display: `Wort${index}` }));
    const tower = completeTower(words)!;
    expect(tower.spec.words).toHaveLength(MAX_TOWER_WORDS);
    expect(tower.spec.words[0]!.text).toBe('Wort0');
    expect(tower.total).toBe(11);
  });

  it('counts a word once, and builds nothing from nothing', () => {
    expect(completeTower([{ display: 'Hallo' }, { display: 'hallo' }, { display: ' ' }])!.total).toBe(1);
    expect(completeTower([])).toBeNull();
  });

  it('builds rows that narrow to the top', () => {
    expect([1, 2, 3, 4, 5, 6, 9].map(towerRows)).toEqual([[1], [2], [2, 1], [2, 2], [3, 2], [3, 2, 1], [3, 2, 1]]);
    for (let n = 1; n <= MAX_TOWER_WORDS; n++) expect(towerRows(n).reduce((a, b) => a + b, 0)).toBe(n);
  });
});

describe('the board game', () => {
  const lesson = (complete: boolean, current = false, available = true) => ({ complete, current, available });

  it('counts the unit\'s lessons and puts the pawn on the one the course marks next', () => {
    const board = pathBoard([lesson(true), lesson(true), lesson(false, true), lesson(false), lesson(false)])!;
    expect(board).toMatchObject({ count: 5, done: 2, current: 2 });
    expect(board.spec.stations).toEqual(['done', 'done', 'current', 'todo', 'todo']);
  });

  it('follows the course out of order, and falls back to the first open lesson', () => {
    expect(pathBoard([lesson(false), lesson(true), lesson(false, true)])!.current).toBe(2);
    expect(pathBoard([lesson(true), lesson(false), lesson(false)])!.current).toBe(1);
  });

  it('stands at the checkpoint once every lesson is done', () => {
    const board = pathBoard([lesson(true), lesson(true)])!;
    expect(board).toMatchObject({ count: 2, done: 2, current: 2 });
    expect(board.spec.stations).toEqual(['done', 'done']);
  });

  it('shows lessons not written yet as planned, never as the next one', () => {
    const board = pathBoard([lesson(true), lesson(false, false, false), lesson(false)])!;
    expect(board.current).toBe(2);
    expect(board.spec.stations).toEqual(['done', 'planned', 'current']);
    expect(pathBoard([])).toBeNull();
  });

  it('matches the real course for a new learner', () => {
    const unit = CURRICULUM[0]!.units[0]!;
    const board = pathBoard(unit.lessons.map((item, index) => lesson(false, index === 0, item.status === 'available')))!;
    expect(board.count).toBe(unit.lessons.length);
    expect(board).toMatchObject({ done: 0, current: 0 });
  });
});

describe('Today\'s town', () => {
  it('hangs out the pretzel only for the practice at the bakery', () => {
    expect(todayTown({ step: 'daily', scenarioId: 'sc-bakery' })).toMatchObject({ sign: 'bakery', done: false, bubble: 'Hallo!' });
    expect(todayTown({ step: 'continue-daily', scenarioId: 'sc-bakery' }).sign).toBe('bakery');
    expect(todayTown({ step: 'daily', scenarioId: 'sc-neighbours' }).sign).toBe('house');
    expect(todayTown({ step: 'start-lesson', scenarioId: 'sc-bakery' }).sign).toBe('house');
  });

  it('lights every window once the day is done', () => {
    expect(todayTown({ step: 'done' })).toMatchObject({ done: true, bubble: 'Geschafft!' });
  });
});

describe('the scene code outside the scene chunk', () => {
  /*
   * three is only reachable through WoodScene's dynamic import, so it is a
   * chunk of its own. A static import anywhere on the way would put it in
   * the first download; the build check in scripts/browser-check.mjs looks
   * at the built files, and this keeps the source honest too.
   */
  it('never imports three or the engine statically', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const dir = new URL('../../src/ui/three/', import.meta.url);
    for (const name of readdirSync(dir).filter((file) => /\.tsx?$/.test(file))) {
      const source = readFileSync(new URL(name, dir), 'utf8');
      expect(source, name).not.toMatch(/^import (?!type )[^;]*from 'three'/m);
      expect(source, name).not.toMatch(/^import (?!type )[^;]*from '\.\/engine\//m);
    }
    const scene = readFileSync(new URL('WoodScene.tsx', dir), 'utf8');
    expect(scene).toMatch(/import\('\.\/engine\/index\.ts'\)/);
  });
});
