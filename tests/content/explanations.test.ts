import { describe, expect, it } from 'vitest';
import {
  LEXICON,
  allCheckpoints,
  availableLessons,
  lessonById,
  lessonExercises,
  sectionBlocks,
} from '../../src/content/index.ts';
import type { Block, ExerciseStep, Lesson, TeachingLanguage } from '../../src/content/types.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';

/**
 * Explanations that taught something the German, or the course itself,
 * contradicts.
 *
 * Each block below was a real report: a rule stated as fact that a native
 * speaker would not recognise, or that the same lesson broke a screen later.
 * The checks read the text a learner on each path actually sees — the
 * lesson's own blocks plus the shared grammar concept it pulls in — so a
 * correction made in one place and missed in the other still fails.
 */

const PATHS: TeachingLanguage[] = ['en', 'bg'];
const opts = { lexicon: LEXICON };

function shown(block: { only?: TeachingLanguage[] }, lang: TeachingLanguage): boolean {
  return !block.only || block.only.includes(lang);
}

/** The words of one block as the given path renders them. */
function blockText(block: Block, lang: TeachingLanguage): string[] {
  if (!shown(block, lang)) return [];
  switch (block.t) {
    case 'p':
      return [block.text[lang]];
    case 'list':
      return block.items.map((item) => item[lang]);
    case 'de':
      return [block.de, block.gloss?.[lang] ?? ''];
    case 'contrast':
      return [block.de, block.other[lang], block.note?.[lang] ?? ''];
    case 'table':
      return [
        ...block.headers.map((header) => header[lang]),
        ...block.rows.flat().map((cell) => (typeof cell === 'string' ? cell : cell[lang])),
        block.caption?.[lang] ?? '',
      ];
    case 'callout':
      return [block.title?.[lang] ?? '', block.text[lang]];
    case 'breakdown':
      return [block.de, ...block.parts.flatMap((part) => [part.de, part.gloss[lang]])];
  }
}

/** Everything one lesson shows on one path: sections, shared grammar and the closing summary. */
function lessonText(id: string, lang: TeachingLanguage): string {
  const lesson = lessonById(id) as Lesson | undefined;
  if (!lesson) throw new Error(`no lesson ${id}`);
  const blocks = [
    ...lesson.sections.filter((section) => shown(section, lang)).flatMap((section) => sectionBlocks(section, lang)),
    ...(lesson.summary ?? []),
  ];
  return blocks.flatMap((block) => blockText(block, lang)).join('\n');
}

const STEPS = new Map<string, ExerciseStep>();
for (const exercise of [
  ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
  ...allCheckpoints().flatMap((checkpoint) => checkpoint.exercises),
]) {
  for (const step of exercise.steps) STEPS.set(step.id, step);
}

function isRight(given: string, id: string): boolean {
  const step = STEPS.get(id);
  if (!step) throw new Error(`no step ${id}`);
  const result = validateAnswer(given, step.answer, opts);
  return (
    result.verdict === 'correct' ||
    result.verdict === 'accepted-variant' ||
    (result.verdict === 'accepted-with-note' && !result.requireRetype)
  );
}

describe('dass can be left out', () => {
  /*
   * The A2 lesson said "German does not: the dass has to be there", called
   * leaving it out the commonest English-speaker mistake, and the Bulgarian
   * path said че "is not dropped either". "Ich glaube, Deutsch ist schwer." is
   * standard German, and the placement check and the bakery conversation
   * already accept the same shape. The mistake is mixing the two.
   */
  it('says so on both paths, with the verb staying second', () => {
    for (const lang of PATHS) {
      const text = lessonText('a2-u3-l1', lang);
      expect(text, lang).toContain('Ich glaube, Deutsch ist schwer.');
      expect(text, lang).not.toMatch(/has to be there|make dass necessary|need it|не се изпуска|изискват/);
    }
  });

  it('credits the dass-less sentence where the English "that" is only a pronoun', () => {
    expect(isRight('Ich denke, das ist gut.', 'a2u3l1-ex2-s2')).toBe(true);
    // Where the English does say "that", the lesson still wants the dass.
    expect(isRight('Ich glaube, dass Deutsch ist schwer.', 'a2u3l1-ex2-s1')).toBe(false);
  });
});
