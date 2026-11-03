import { describe, expect, it } from 'vitest';
import { allCheckpoints, allUnits, availableLessons, lessonsInOrder } from '../../src/content/index.ts';
import type { LessonProgress, StepOutcome } from '../../src/core/progress/lesson.ts';
import { createReviewItem, type ReviewItem } from '../../src/core/srs/scheduler.ts';
import type { CheckpointResult, MistakeRecord } from '../../src/services/api/client.ts';
import { inferredPracticeLevel } from '../../src/ui/components/LearningPreferences.tsx';
import {
  buildQueue,
  buildVocabViews,
  mistakeMatchesVocab,
  nextAction,
  standingPlacement,
  vocabMatches,
} from '../../src/ui/selectors.ts';
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

describe('where a placed learner starts', () => {
  /*
   * The placement result was kept only on its own screen. A learner told
   * "Start at B1" who left it by the nav, or by its own "See the whole
   * course", was sent to Pre-A1 lesson 1 on Today, the course page and in
   * daily practice; nothing read the level it stored.
   */
  const placedAt = '2026-05-01T10:00:00.000Z';
  const placement = (targetId: string, createdAt = placedAt): CheckpointResult => ({
    checkpointId: 'placement',
    targetId,
    accuracy: 0.6,
    passed: false,
    createdAt,
  });
  const firstOf = (level: string) => lessonsInOrder().find((lesson) => lesson.level === level && lesson.status === 'available')!;
  const opened = (lessonId: string, at: string): LessonProgress => ({
    lessonId,
    sectionsSeen: [firstOf('pre-a1').sections[0]!.id],
    practice: {},
    mastery: { attempts: 0, bestAccuracy: 0, passed: false },
    recoveryRounds: 0,
    startedAt: at,
    lastActiveAt: at,
  });

  it('starts at the first lesson of the level the check recommended', () => {
    const action = nextAction({}, [], [], true, [placement('b1')]);
    expect(action).toMatchObject({ kind: 'start-lesson', to: `/lesson/${firstOf('b1').id}` });
    expect(standingPlacement({}, [placement('b1')])).toBe('b1');
    expect(inferredPracticeLevel({}, [placement('b1')])).toBe('b1');
  });

  it('takes the latest check, and lets a lesson below it that was opened earlier wait', () => {
    const earlier = { [firstOf('pre-a1').id]: opened(firstOf('pre-a1').id, '2026-04-01T10:00:00.000Z') };
    const results = [placement('b2', '2026-03-01T10:00:00.000Z'), placement('a2')];
    expect(nextAction(earlier, [], [], true, results).to).toBe(`/lesson/${firstOf('a2').id}`);
  });

  it('gives way to what the learner does after it', () => {
    // The result also offers the level below; starting there overrules it.
    const a2 = firstOf('a2').id;
    const after = { [a2]: { ...completed(a2), lastActiveAt: '2026-05-02T10:00:00.000Z' } };
    expect(standingPlacement(after, [placement('b1')])).toBeUndefined();
    expect(nextAction(after, [], [], true, [placement('b1')]).to).not.toBe(`/lesson/${firstOf('b1').id}`);
    expect(inferredPracticeLevel(after, [placement('b1')])).toBe('a2');
  });

  it('ignores a result that names no level the course has', () => {
    expect(standingPlacement({}, [placement('pre-a1-u1')])).toBeUndefined();
  });
});

describe('the end of a unit', () => {
  /*
   * The course promises a checkpoint at the end of every unit, but nothing
   * offered one until every lesson in the course was done: after unit 1 the
   * lesson-complete card, Today and the course page all went on to unit 2.
   */
  const unit = allUnits().find((candidate) => candidate.checkpoint && candidate.lessons.length > 1)!;
  const done = Object.fromEntries(unit.lessons.map((lesson) => [lesson.id, completed(lesson.id)]));
  const result = (passed: boolean): CheckpointResult => ({
    checkpointId: unit.checkpoint!.id,
    targetId: unit.id,
    accuracy: passed ? 1 : 0.4,
    passed,
    createdAt: '2026-01-02T00:00:00.000Z',
  });

  it('offers its checkpoint before the next unit begins', () => {
    expect(nextAction(done, [], [], true)).toMatchObject({ kind: 'checkpoint', to: `/checkpoint/${unit.checkpoint!.id}` });
  });

  it('goes on to the next lesson once it is passed', () => {
    expect(nextAction(done, [], [], true, [result(true)]).kind).toBe('start-lesson');
  });

  it('does not hold back a learner who has gone on to the next unit', () => {
    const next = lessonsInOrder().filter((lesson) => lesson.status === 'available')
      .find((lesson) => lesson.unitId !== unit.id && lessonsInOrder().indexOf(lesson) > lessonsInOrder().indexOf(unit.lessons.at(-1)!))!;
    const moved = { ...done, [next.id]: completed(next.id) };
    expect(nextAction(moved, [], [], true).kind).toBe('start-lesson');
  });

  it('is not offered in the middle of a unit', () => {
    const [first] = unit.lessons;
    expect(nextAction({ [first!.id]: completed(first!.id) }, [], [], true).kind).toBe('start-lesson');
  });

  /*
   * It used to be the level's oldest checkpoint not passed: with unit 1's
   * skipped, the end of unit 2 offered unit 1's, and so did every boundary
   * after it; a failed one stood in front of the next lesson until passed.
   */
  const level = allUnits().filter((candidate) => candidate.level === unit.level);
  const through = (count: number) => Object.fromEntries(level.slice(0, count)
    .flatMap((candidate) => candidate.lessons).map((lesson) => [lesson.id, completed(lesson.id)]));
  const tried = (checkpointId: string, passed = false): CheckpointResult =>
    ({ checkpointId, targetId: '', accuracy: passed ? 1 : 0.4, passed, createdAt: '2026-01-02T00:00:00.000Z' });

  it('offers the checkpoint of the unit just finished, not one skipped before it', () => {
    expect(nextAction(through(2), [], [], true)).toMatchObject({ to: `/checkpoint/${level[1]!.checkpoint!.id}` });
  });

  it('goes on to the next lesson once it has been tried, passed or not', () => {
    expect(nextAction(done, [], [], true, [result(false)]).kind).toBe('start-lesson');
  });

  it('offers the level checkpoint after the level’s last unit and its checkpoint', () => {
    const last = level.at(-1)!;
    const all = through(level.length);
    expect(nextAction(all, [], [], true)).toMatchObject({ to: `/checkpoint/${last.checkpoint!.id}` });
    const levelCheckpoint = allCheckpoints().find((checkpoint) => checkpoint.scope === 'level' && checkpoint.targetId === unit.level)!;
    expect(nextAction(all, [], [], true, [tried(last.checkpoint!.id)])).toMatchObject({ to: `/checkpoint/${levelCheckpoint.id}` });
    expect(nextAction(all, [], [], true, [tried(last.checkpoint!.id), tried(levelCheckpoint.id)]).kind).toBe('start-lesson');
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
    // Its gloss translates the pattern, blank included, so the pattern comes too.
    expect(entry!.template).toBe('Ich komme aus ___.');
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

describe('vocabulary search', () => {
  /*
   * The first lesson says ae, oe, ue and ss are fine on a keyboard without
   * German letters, and the checker accepts them — but the search found
   * nothing for "strasse", "tschuess" or "Madchen".
   */
  const find = (query: string) =>
    buildVocabViews([], [], [])
      .filter((view) => vocabMatches(view.entry, query))
      .map((view) => view.entry.german);

  it('finds German words typed without umlauts or ß', () => {
    for (const query of ['strasse', 'Straße', 'STRASSE']) expect(find(query)).toContain('Straße');
    for (const query of ['tschuess', 'tschuss', 'Tschüss']) expect(find(query)).toContain('Tschüss');
    for (const query of ['Maedchen', 'madchen', 'Mädchen']) expect(find(query)).toContain('Mädchen');
  });

  it('still searches the translations, Cyrillic untouched', () => {
    expect(find('girl')).toContain('Mädchen');
    expect(find('момиче')).toContain('Mädchen');
  });
});
