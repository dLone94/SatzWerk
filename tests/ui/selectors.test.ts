import { describe, expect, it } from 'vitest';
import { allCheckpoints, availableLessons, lessonsInOrder } from '../../src/content/index.ts';
import type { LessonProgress, StepOutcome } from '../../src/core/progress/lesson.ts';
import { createReviewItem, type ReviewItem } from '../../src/core/srs/scheduler.ts';
import type { CheckpointResult, MistakeRecord } from '../../src/services/api/client.ts';
import { buildQueue, buildVocabViews, mistakeMatchesVocab, nextAction } from '../../src/ui/selectors.ts';
import { vocabById } from '../../src/content/index.ts';

/**
 * The selectors that decide what the learner is sent to next, and what the
 * vocabulary and review screens say about their words. Checked against the
 * real course, because the defects were in how the course was read.
 */

function outcome(stepId: string): StepOutcome {
  return { stepId, attempts: 1, firstTryCorrect: true, bestCredit: 1, resolved: true, hintsUsed: 0, revealed: false };
}

/** A lesson with every requirement met: read, practised, final check passed. */
function completed(lessonId: string): LessonProgress {
  const lesson = lessonsInOrder().find((candidate) => candidate.id === lessonId)!;
  return {
    lessonId,
    sectionsSeen: lesson.sections.map((section) => section.id),
    practice: Object.fromEntries(
      lesson.exercises.flatMap((exercise) => exercise.steps.map((step) => [step.id, outcome(step.id)])),
    ),
    mastery: { attempts: 1, bestAccuracy: 1, passed: true },
    recoveryRounds: 0,
    completedAt: '2026-01-01T00:00:00.000Z',
  };
}

function mistake(expected: string, extra: Partial<MistakeRecord> = {}): MistakeRecord {
  return {
    id: `m-${expected}`,
    category: 'spelling',
    expected,
    lastGiven: 'x',
    stepId: null,
    lessonId: null,
    occurrences: 1,
    correctedCount: 0,
    firstSeenAt: '2026-01-01T00:00:00.000Z',
    lastSeenAt: '2026-01-01T00:00:00.000Z',
    resolvedAt: null,
    ...extra,
  };
}

describe('what Today sends the learner to next', () => {
  /*
   * A learner placed at A2 who finished A2 Unit 1 Lesson 1 was sent back to
   * Pre-A1 Unit 1 Lesson 1 — on Today and on the lesson-complete "Up next"
   * card — and after every later lesson again.
   */
  it('goes on from where the learner is, not from the start of the course', () => {
    const progress = { 'a2-u1-l1': completed('a2-u1-l1') };
    const action = nextAction(progress, [], [], true);
    expect(action.kind).toBe('start-lesson');
    expect(action.to).toBe('/lesson/a2-u1-l2');
  });

  it('still starts a new learner at the very first lesson', () => {
    const action = nextAction({}, [], [], true);
    const first = lessonsInOrder().find((lesson) => availableLessons().includes(lesson))!;
    expect(action.to).toBe(`/lesson/${first.id}`);
  });

  it('offers the lessons left behind once the end of the course is reached', () => {
    const order = lessonsInOrder().filter((lesson) => lesson.status === 'available');
    const last = order[order.length - 1]!;
    const action = nextAction({ [last.id]: completed(last.id) }, [], [], true);
    expect(action.to).toBe(`/lesson/${order[0]!.id}`);
  });

  describe('once every lesson is done', () => {
    const everything = Object.fromEntries(
      lessonsInOrder()
        .filter((lesson) => lesson.status === 'available')
        .map((lesson) => [lesson.id, completed(lesson.id)]),
    );
    const passed = (id: string): CheckpointResult => ({
      checkpointId: id,
      accuracy: 1,
      passed: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    });

    /*
     * The first checkpoint was offered forever, passed or not, because
     * nextAction knew nothing about checkpoint results.
     */
    it('offers the first checkpoint not yet passed', () => {
      const [first, second] = allCheckpoints();
      const action = nextAction(everything, [], [], true, [passed(first!.id)]);
      expect(action.kind).toBe('checkpoint');
      expect(action.to).toBe(`/checkpoint/${second!.id}`);
    });

    /*
     * …and it was offered ahead of reviews that were due, so a learner who had
     * finished the course never saw "1 item is due" as the next step.
     */
    it('clears what is due before offering a checkpoint, and reviews once all are passed', () => {
      const now = new Date('2026-04-01T09:00:00.000Z');
      const due: ReviewItem[] = [
        createReviewItem({ id: 'r1', kind: 'vocab', refId: 'v-hallo', level: 'pre-a1', lessonId: undefined, now }),
      ];
      expect(nextAction(everything, due, [], true, [], now).kind).toBe('review');
      const allPassed = allCheckpoints().map((checkpoint) => passed(checkpoint.id));
      expect(nextAction(everything, [], [], true, allPassed, now).kind).toBe('idle');
    });
  });
});

describe('which words a mistake is counted against', () => {
  /*
   * A mistake used to count against every word whose German appeared anywhere
   * in the expected answer, even inside another word: "das Ei" collected
   * mistakes from "heiße", "zwei" and "eine", "er" from "Eltern".
   */
  const count = (expected: string, id: string, extra: Partial<MistakeRecord> = {}) =>
    buildVocabViews([], [mistake(expected, extra)], []).find((view) => view.entry.id === id)!.mistakes;

  it('matches whole words, not letters inside other words', () => {
    expect(count('Meine Eltern wohnen in Bulgarien.', 'v-er')).toBe(0);
    expect(count('Meine Eltern wohnen in Bulgarien.', 'v-ei')).toBe(0);
    expect(count('Meine Eltern wohnen in Bulgarien.', 'v-die-eltern')).toBe(1);
    expect(count('Ich heiße Anna.', 'v-ei')).toBe(0);
    expect(count('Ich heiße Anna.', 'v-heiss')).toBe(0);
    expect(count('Wo ist die Arbeit?', 'v-bei')).toBe(0);
  });

  it('keeps words of more than one token', () => {
    expect(count('Heute arbeite ich zu Hause.', 'v-zu-hause')).toBe(1);
  });

  it('trusts what the step says it practises when it says so', () => {
    // u2l3-ex1-1 practises heißen; its answer is "heiße", which no token rule
    // would tie to the infinitive.
    expect(count('heiße', 'v-heissen', { stepId: 'u2l3-ex1-1' })).toBe(1);
    expect(mistakeMatchesVocab(mistake('heiße', { stepId: 'u2l3-ex1-1' }), vocabById('v-heiss')!)).toBe(false);
  });
});

describe('the review queue', () => {
  /*
   * Only vocabulary was looked up, so a due sentence pattern was listed by its
   * raw id — "p-ich-komme-aus" — with no German, no audio and no translation.
   */
  it('shows a pattern as its German sentence, not its id', () => {
    const now = new Date('2026-04-01T09:00:00.000Z');
    const items: ReviewItem[] = [
      createReviewItem({ id: 'r1', kind: 'pattern', refId: 'p-ich-komme-aus', level: 'pre-a1', lessonId: undefined, now }),
    ];
    const [entry] = buildQueue(items, now);
    expect(entry!.label).not.toBe('p-ich-komme-aus');
    expect(entry!.label).toMatch(/Ich komme aus/);
    expect(entry!.german).toBe(true);
  });

  it('shows a grammar item by its title, and does not mark it as German', () => {
    const now = new Date('2026-04-01T09:00:00.000Z');
    const grammar = lessonsInOrder()[0]!.grammarIds[0]!;
    const [entry] = buildQueue(
      [createReviewItem({ id: 'r1', kind: 'grammar', refId: grammar, level: 'pre-a1', lessonId: undefined, now })],
      now,
    );
    expect(entry!.label).not.toBe(grammar);
    expect(entry!.title).toBeDefined();
    expect(entry!.german).toBe(false);
  });
});
