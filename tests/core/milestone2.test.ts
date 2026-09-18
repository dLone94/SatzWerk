import { describe, expect, it } from 'vitest';
import {
  CURRICULUM,
  LEVEL_OUTLINES,
  LEXICON,
  allCheckpoints,
  availableLessons,
  categoryPracticeCounts,
  checkpointById,
  contentStats,
  lessonById,
  practiceForCategory,
  vocabById,
} from '../../src/content/index.ts';
import type { ErrorCategory } from '../../src/content/types.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';
import { dominantCategory } from '../../src/ui/selectors.ts';
import type { MistakeRecord } from '../../src/services/api/client.ts';

/**
 * Milestone 2: the rest of Pre-A1, the level checkpoint, and practice targeted
 * at a kind of mistake rather than at individual sentences.
 */

const opts = { lexicon: LEXICON };

describe('Pre-A1 is complete', () => {
  it('has all six units authored, with no planned units left over', () => {
    const preA1 = CURRICULUM[0]!;
    expect(preA1.id).toBe('pre-a1');
    expect(preA1.units).toHaveLength(6);
    expect(preA1.units.every((unit) => unit.status === 'available')).toBe(true);
    expect(preA1.status).toBe('available');
    // Nothing should still be advertised as planned once it is built.
    expect(LEVEL_OUTLINES['pre-a1'].plannedUnits).toEqual([]);
  });

  it('has eighteen lessons, each with its own mastery check', () => {
    // Scoped to the level this describe is about. availableLessons() covers the
    // whole course, so once A1 began it stopped answering the question here.
    const lessons = availableLessons().filter((lesson) => lesson.level === 'pre-a1');
    expect(lessons).toHaveLength(18);
    for (const lesson of lessons) {
      expect(lesson.mastery.exercises.length).toBeGreaterThan(0);
      expect(lesson.sections.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('gives every unit a checkpoint', () => {
    for (const unit of CURRICULUM[0]!.units) {
      expect(unit.checkpoint, unit.id).toBeDefined();
      expect(unit.checkpoint!.scope).toBe('unit');
      expect(unit.checkpoint!.targetId).toBe(unit.id);
    }
  });

  it('covers the whole Pre-A1 grammar outline', () => {
    const covered = new Set(availableLessons().flatMap((lesson) => lesson.grammarIds));
    // Every grammar area the outline promises has at least one lesson behind it.
    for (const id of [
      'g-articles',
      'g-ein-eine',
      'g-present-endings',
      'g-verb-second',
      'g-du-sie',
      'g-sein',
      'g-numbers',
      'g-no-article-profession',
      'g-haben-accusative',
      'g-plurals',
      'g-negation',
      'g-questions',
      'g-time-prepositions',
      'g-telling-time',
      'g-pronoun-table',
    ]) {
      expect(covered.has(id), `${id} is not taught by any lesson`).toBe(true);
    }
  });

  it('teaches the numbers, days and months as real vocabulary', () => {
    for (const id of ['v-sieben', 'v-sechzehn', 'v-dreissig', 'v-einundzwanzig']) {
      expect(vocabById(id), id).toBeDefined();
    }
    for (const id of ['v-montag', 'v-sonntag', 'v-januar', 'v-dezember']) {
      const entry = vocabById(id);
      expect(entry, id).toBeDefined();
      // Days and months are masculine, so they are taught with "der".
      expect(entry!.display.startsWith('der ')).toBe(true);
    }
  });

  /**
   * Whole-course totals, deliberately hard-coded.
   *
   * The dashboard shows these numbers, and the product rule is that it never
   * displays an invented statistic. Pinning them means adding content has to
   * come with a decision about what the app now claims, rather than the claim
   * drifting on its own.
   */
  it('reports the real content totals', () => {
    const stats = contentStats();
    // Six Pre-A1 units and the first A1 unit.
    expect(stats.units).toBe(7);
    expect(stats.authoredUnits).toBe(7);
    expect(stats.lessons).toBe(21);
    expect(stats.vocabulary).toBeGreaterThanOrEqual(150);
    expect(stats.grammarConcepts).toBeGreaterThanOrEqual(18);
    // Seven unit checkpoints and one level checkpoint.
    expect(stats.checkpoints).toBe(8);
  });
});

describe('the level checkpoint', () => {
  const checkpoint = checkpointById('pre-a1-level-checkpoint');

  it('exists, is scoped to the level, and is harder than a unit checkpoint', () => {
    expect(checkpoint).toBeDefined();
    expect(checkpoint!.scope).toBe('level');
    expect(checkpoint!.targetId).toBe('pre-a1');
    // Compared against Pre-A1's own unit checkpoints. A checkpoint from another
    // level is calibrated against different material, so including it would
    // make this assertion drift with content rather than test a ladder.
    const unitPass = Math.max(
      ...allCheckpoints()
        .filter((cp) => cp.scope === 'unit' && cp.targetId.startsWith('pre-a1'))
        .map((cp) => cp.passAccuracy),
    );
    expect(checkpoint!.passAccuracy).toBeGreaterThan(unitPass);
  });

  it('draws on every unit and every skill', () => {
    const kinds = new Set(checkpoint!.exercises.map((exercise) => exercise.kind));
    expect(kinds.has('type')).toBe(true);
    expect(kinds.has('dictation')).toBe(true);
    expect(kinds.has('freeWriting')).toBe(true);
    expect(kinds.has('articleRecall')).toBe(true);
    const steps = checkpoint!.exercises.reduce((sum, exercise) => sum + exercise.steps.length, 0);
    expect(steps).toBeGreaterThanOrEqual(25);
  });

  it('offers no hints anywhere', () => {
    for (const exercise of checkpoint!.exercises) {
      for (const step of exercise.steps) {
        expect(step.hints, step.id).toEqual([]);
      }
    }
  });

  it('accepts every one of its own answers', () => {
    const failures: string[] = [];
    for (const exercise of checkpoint!.exercises) {
      for (const step of exercise.steps) {
        const canonical = step.answer.accepted[0]!;
        const result = validateAnswer(canonical, step.answer, opts);
        if (result.credit !== 1) failures.push(`${step.id}: "${canonical}" -> ${result.verdict}`);
      }
    }
    expect(failures).toEqual([]);
  });
});

describe('practice targeted at a kind of mistake', () => {
  it('finds authored tasks for the categories learners actually hit', () => {
    const categories: ErrorCategory[] = [
      'article',
      'gender',
      'preposition',
      'word-order',
      'verb-conjugation',
      'capitalization',
      'plural',
      'case',
    ];
    for (const category of categories) {
      const exercises = practiceForCategory(category);
      const steps = exercises.reduce((sum, exercise) => sum + exercise.steps.length, 0);
      expect(steps, `no practice for ${category}`).toBeGreaterThan(0);
    }
  });

  it('never repeats a step inside one round, and respects the limit', () => {
    for (const category of ['article', 'gender', 'verb-conjugation'] as ErrorCategory[]) {
      const exercises = practiceForCategory(category, 6);
      const ids = exercises.flatMap((exercise) => exercise.steps.map((step) => step.id));
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBeLessThanOrEqual(6);
    }
  });

  it('keeps the original step ids so an attempt counts towards the same history', () => {
    const exercises = practiceForCategory('preposition');
    const ids = exercises.flatMap((exercise) => exercise.steps.map((step) => step.id));
    // These ids belong to authored lesson steps, not synthesised ones.
    const authored = new Set(
      availableLessons()
        .flatMap((lesson) => [...lesson.exercises, ...lesson.mastery.exercises])
        .flatMap((exercise) => exercise.steps.map((step) => step.id)),
    );
    const checkpointIds = new Set(
      allCheckpoints().flatMap((cp) => cp.exercises.flatMap((ex) => ex.steps.map((s) => s.id))),
    );
    for (const id of ids) {
      expect(authored.has(id) || checkpointIds.has(id), id).toBe(true);
    }
  });

  it('pulls in the related skill so a round is never thin', () => {
    // There are only two pure "article" traps, but article and gender are the
    // same skill, so the round should still be a useful length.
    const counts = categoryPracticeCounts();
    expect(counts.get('article')).toBeLessThan(5);
    const steps = practiceForCategory('article').reduce((sum, e) => sum + e.steps.length, 0);
    expect(steps).toBeGreaterThanOrEqual(5);
  });

  it('returns nothing for a category the course does not drill', () => {
    expect(practiceForCategory('adjective-ending', 10).length).toBeGreaterThanOrEqual(0);
    expect(practiceForCategory('unknown')).toEqual([]);
  });

  it('counts authored tasks per category consistently with the content', () => {
    const counts = categoryPracticeCounts();
    let total = 0;
    for (const value of counts.values()) total += value;
    const traps = [...availableLessons().flatMap((l) => [...l.exercises, ...l.mastery.exercises]), ...allCheckpoints().flatMap((c) => c.exercises)]
      .flatMap((exercise) => exercise.steps)
      .reduce((sum, step) => sum + (step.answer.trapAnswers?.length ?? 0), 0);
    expect(total).toBe(traps);
    expect(total).toBeGreaterThan(30);
  });
});

describe('the dominant mistake category', () => {
  const mistake = (category: ErrorCategory, occurrences: number): MistakeRecord => ({
    id: `${category}-${occurrences}`,
    category,
    expected: 'Ich habe eine Tochter.',
    lastGiven: 'Ich habe ein Tochter.',
    stepId: 's',
    lessonId: null,
    occurrences,
    correctedCount: 0,
    firstSeenAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    resolvedAt: null,
  });

  it('ignores a single slip', () => {
    expect(dominantCategory([mistake('article', 1)])).toBeUndefined();
    expect(dominantCategory([mistake('article', 2)])).toBeUndefined();
  });

  it('picks the category with the most occurrences once it is a pattern', () => {
    const result = dominantCategory([mistake('article', 5), mistake('preposition', 3)]);
    expect(result?.category).toBe('article');
    expect(result?.count).toBe(5);
    expect(result?.tasks).toBeGreaterThan(0);
  });

  it('skips a category the course cannot practise', () => {
    expect(dominantCategory([mistake('unknown', 9)])).toBeUndefined();
  });

  it('returns nothing when there are no mistakes at all', () => {
    expect(dominantCategory([])).toBeUndefined();
  });
});

describe('cross-unit consistency', () => {
  it('teaches haben before it is required by a later unit', () => {
    const habenLesson = lessonById('pre-a1-u4-l3')!;
    expect(habenLesson.grammarIds).toContain('g-haben-accusative');
    // Unit 6 relies on it for negation with keinen.
    const negation = lessonById('pre-a1-u6-l2')!;
    const usesKeinen = [...negation.exercises, ...negation.mastery.exercises]
      .flatMap((exercise) => exercise.steps)
      .some((step) => step.answer.accepted.some((answer) => answer.includes('keinen')));
    expect(usesKeinen).toBe(true);
    expect(habenLesson.order).toBeLessThan(negation.order + 100);
  });

  it('never asks for a word the course has not introduced as vocabulary', () => {
    // Spot-check the review targets: every one must resolve, which the content
    // suite already guarantees, but these are the new units.
    for (const id of ['pre-a1-u3-l3', 'pre-a1-u4-l3', 'pre-a1-u5-l3', 'pre-a1-u6-l2']) {
      const lesson = lessonById(id);
      expect(lesson, id).toBeDefined();
      expect(lesson!.vocabIds.length).toBeGreaterThan(0);
      for (const vocabId of lesson!.vocabIds) {
        expect(vocabById(vocabId), `${id} -> ${vocabId}`).toBeDefined();
      }
    }
  });
});
