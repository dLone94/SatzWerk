import { describe, expect, it } from 'vitest';
import { SCENARIO_SCRIPTS, VOCABULARY, LEXICON } from '../../src/content/browser.ts';
import { LEARNING_GOALS, PRACTICE_LEVELS, isCalendarDay, mergeDailyRun, weeklyPractice, type DailyRun } from '../../src/core/progress/daily.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';
import { createReviewItem } from '../../src/core/srs/scheduler.ts';
import { chooseDailyScript, dailyListening, dailyPhrases, dailyReview, phraseRecall } from '../../src/ui/dailyBuilder.ts';
import { buildReviewExercises, reviewItemsForPath } from '../../src/ui/reviewBuilder.ts';
import type { MistakeRecord, ScenarioRun } from '../../src/services/api/client.ts';
import { microTip } from '../../src/core/feedback/microTips.ts';

describe('personal daily plans', () => {
  it('keeps language-specific conversation phrases on their authored teaching path', () => {
    const item = createReviewItem({ id: 'english-kita', kind: 'pattern', refId: 'p-daily-sc-kita-b1-t1-s1', level: 'b1' });
    expect(reviewItemsForPath([item], 'bg')).toEqual([]);
    expect(buildReviewExercises([item], 'bg').exercises).toEqual([]);
    expect(buildReviewExercises([item], 'en').exercises).toHaveLength(1);
    expect(item.state).toBe('new');
  });
  it('offers every goal at every available level without promoting a beginner', () => {
    for (const goal of LEARNING_GOALS) for (const level of PRACTICE_LEVELS) {
      const script = chooseDailyScript(goal, level, [], '2026-10-07');
      expect(script.level).toBe(level);
      for (const lang of ['en', 'bg'] as const) {
        expect(dailyPhrases(script, lang).length).toBeGreaterThan(0);
        const exercises = [...phraseRecall(script, lang), ...dailyListening(script, lang)];
        for (const exercise of exercises) for (const step of exercise.steps) {
          expect(validateAnswer(step.answer.accepted[0]!, step.answer, { lexicon: LEXICON }).credit).toBe(1);
          expect(step.id).not.toBe(dailyPhrases(script, lang)[0]?.step.id);
        }
      }
    }
  });

  it('revisits a weak conversation before an already confident one, after trying unseen topics', () => {
    const scripts = SCENARIO_SCRIPTS.filter(script => script.level === 'a1');
    const runs: ScenarioRun[] = scripts.map(script => ({ scriptId: script.id, runs: 1, turns: 3,
      firstTryCorrect: 3, lastAccuracy: 1, bestAccuracy: 1, firstRunAt: '', lastRunAt: '2026-10-01' }));
    const transport = runs.find(run => run.scriptId === 'sc-transport-a1')!;
    transport.lastAccuracy = 0.5;
    expect(chooseDailyScript('travel', 'a1', runs, '2026-10-07').id).toBe(transport.scriptId);
    expect(['sc-work', 'sc-bank', 'sc-buergeramt']).toContain(chooseDailyScript('work', 'b2', [], '2026-10-07').scenarioId);
  });

  it('reserves room for a recurring mistake and uses a different, authored prompt', () => {
    const mistake: MistakeRecord = { id: 'wrong-article', category: 'article', expected: 'der Tisch',
      lastGiven: 'die Tisch', stepId: null, lessonId: null, occurrences: 4, correctedCount: 2,
      firstSeenAt: '', lastSeenAt: '', resolvedAt: null };
    const items = VOCABULARY.slice(0, 12).map(entry => createReviewItem({ id: entry.id, kind: 'vocab', refId: entry.id, level: entry.level }));
    const round = dailyReview(items, [mistake], 'pre-a1', 'bg', 4);
    expect(round.length).toBeLessThanOrEqual(4);
    expect(round.some(exercise => exercise.id.startsWith('daily-target-'))).toBe(true);
    expect(round.at(-1)!.steps[0]!.answer.accepted).not.toEqual(['der Tisch']);
    expect(round.at(-1)!.level).toBe('pre-a1');
    expect(microTip(['article'])?.bg).toContain('българския');
  });

  it('learns noun articles and plurals together, and reviews familiar words in a sentence', () => {
    const script = SCENARIO_SCRIPTS.find(script => script.id === 'sc-bakery-a1')!;
    expect(dailyPhrases(script, 'en').some(card => card.words.some(word => word.article && word.plural))).toBe(true);
    const noun = VOCABULARY.find(entry => entry.wordType === 'noun' && entry.article)!;
    const item = createReviewItem({ id: noun.id, kind: 'noun-article', refId: noun.id, level: noun.level });
    const exercise = buildReviewExercises([item]).exercises[0]!;
    expect(validateAnswer(noun.german, exercise.steps[0]!.answer, { lexicon: LEXICON }).verdict).not.toBe('correct');
    const learned = { ...item, kind: 'vocab' as const, successCount: 3 };
    const contextual = buildReviewExercises([item, learned]).exercises[1]!;
    expect(contextual.steps[0]!.answer.accepted).toEqual([noun.example.de]);
  });
});

describe('durable progress and a forgiving rhythm', () => {
  it('counts only actual answer days in the current Monday-to-Sunday week', () => {
    const result = weeklyPractice([{ day: '2026-10-04', answers: 5 }, { day: '2026-10-05', answers: 2 },
      { day: '2026-10-05', answers: 2 }, { day: '2026-10-06', answers: 0 }, { day: '2026-10-07', answers: 3 },
      { day: '2026-10-08', answers: 4 }], 4, new Date(2026, 9, 7, 12));
    expect(result).toEqual({ done: 2, goal: 4, left: 2, start: '2026-10-05' });
  });

  it('does not rewind an optimistic finished run on a late acknowledgement', () => {
    const done: DailyRun = { id: 'run', day: '2026-10-07', scriptId: 'sc-bakery-pre-a1', goal: 'everyday',
      stage: 5, total: 8, firstTryCorrect: 6, listeningCompleted: true, updatedAt: '2026-10-07T12:00:00Z' };
    expect(mergeDailyRun([done], { ...done, stage: 1 })).toEqual([done]);
  });

  it('refuses impossible calendar dates', () => {
    expect(isCalendarDay('2026-02-30')).toBe(false);
    expect(isCalendarDay('2026-10-07')).toBe(true);
    expect(isCalendarDay('2026-1-7')).toBe(false);
  });
});
