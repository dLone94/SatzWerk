import { describe, expect, it } from 'vitest';
import { LEXICON, allLessons, lessonById, sectionBlocks } from '../../src/content/index.ts';
import { TEACHING_LANGUAGES } from '../../src/content/types.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';

/**
 * The first lesson anyone opens.
 *
 * It used to be six reading screens about pronunciation before the first
 * answer, and the first thing typed was "heisse" rewritten as "heiße". A
 * beginner's first German should be something they can use, and the sound
 * tables should be broken up by something to do.
 */

const L1 = lessonById('pre-a1-u1-l1')!;
const steps = (ids: string[]) => L1.exercises.filter((exercise) => ids.includes(exercise.id));

describe('lesson 1 starts with German worth saying', () => {
  it('opens on useful phrases, each with a recording', () => {
    const first = L1.sections[0]!;
    for (const lang of TEACHING_LANGUAGES) {
      const lines = sectionBlocks(first, lang).flatMap((block) => (block.t === 'de' ? [block] : []));
      expect(lines.map((line) => line.de)).toEqual(['Hallo!', 'Ich heiße Teo.', 'Danke!', 'Tschüss!']);
      expect(lines.every((line) => line.audio && line.gloss?.[lang])).toBe(true);
    }
  });

  it('has the learner type them straight after the first screen', () => {
    const tries = steps(L1.sections[0]!.tryIt ?? []);
    expect(tries.length).toBeGreaterThan(0);
    expect(tries[0]!.kind).toBe('type');
    expect(tries[0]!.steps.map((step) => step.answer.accepted[0])).toEqual(['Hallo', 'Danke', 'Ich heiße Teo.']);
  });

  it('accepts ss for ß there, and then asks for the real letter', () => {
    const name = steps(L1.sections[0]!.tryIt ?? [])[0]!.steps[2]!;
    const result = validateAnswer('Ich heisse Teo.', name.answer, { lexicon: LEXICON });
    expect(result.verdict).toBe('accepted-with-note');
    expect(result.requireRetype).toBe(true);
  });
});

describe('lesson 1 breaks its sound tables up', () => {
  it('follows every teaching screen but the summary with something to do', () => {
    for (const section of L1.sections) {
      if (section.kind === 'summary') continue;
      expect(section.tryIt?.length, section.id).toBeGreaterThan(0);
    }
  });

  it('plays every exercise somewhere in the reading, in the order it is listed', () => {
    const played = L1.sections.flatMap((section) => section.tryIt ?? []);
    expect(played).toEqual(L1.exercises.map((exercise) => exercise.id));
  });

  it('keeps the steps learners have already answered, by their ids', () => {
    const ids = L1.exercises.flatMap((exercise) => exercise.steps.map((step) => step.id));
    for (const id of [
      'u1l1-ex1-s1',
      'u1l1-ex1-s2',
      'u1l1-ex2-s1',
      'u1l1-ex2-s2',
      'u1l1-ex2-s3',
      'u1l1-ex2-s4',
      'u1l1-ex3-s1',
      'u1l1-ex3-s2',
      'u1l1-ex3-s3',
    ]) {
      expect(ids).toContain(id);
    }
    expect(L1.sections.map((section) => section.id).sort()).toEqual(
      ['u1l1-intro', 'u1l1-letters', 'u1l1-traps', 'u1l1-typing', 'u1l1-more-sounds', 'u1l1-summary'].sort(),
    );
  });

  it('still teaches what it promised, and credits the same words', () => {
    expect(L1.vocabIds).toEqual(['v-das-alphabet', 'v-der-buchstabe']);
    expect(L1.grammarIds).toEqual(['g-special-letters']);
    const outcomes = L1.outcomes.map((outcome) => outcome.en);
    for (const outcome of [
      'I can pronounce ä, ö, ü and ß.',
      'I know that w sounds like v and s can sound like z.',
      'I can read ch, sch, st, sp, au, eu and j aloud.',
      'I can type the German special letters.',
    ]) {
      expect(outcomes).toContain(outcome);
    }
  });
});

describe('a teaching section that asks for a try', () => {
  it('names only exercises of its own lesson', () => {
    for (const lesson of allLessons()) {
      const own = new Set(lesson.exercises.map((exercise) => exercise.id));
      for (const section of lesson.sections) {
        for (const id of section.tryIt ?? []) expect(own.has(id), `${lesson.id} ${section.id} ${id}`).toBe(true);
      }
    }
  });
});
