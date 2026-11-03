import { describe, expect, it } from 'vitest';
import { LEXICON, SCENARIO_SCRIPTS, SENTENCE_PATTERNS } from '../../src/content/index.ts';
import { dailyPatternId } from '../../src/content/dailyPatterns.ts';
import { createReviewItem } from '../../src/core/srs/scheduler.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';
import { phraseRecall } from '../../src/ui/dailyBuilder.ts';
import { buildReviewExercises } from '../../src/ui/reviewBuilder.ts';

/*
 * A daily phrase no authored frame fits had the whole phrase as its pattern,
 * and review gives the pattern as the hint: "The pattern is "Das, bitte."".
 * When the support ladder opened that hint by itself, the learner copied the
 * answer and it was graded right first time, without a hint.
 */
describe('the pattern of a daily phrase', () => {
  const daily = SENTENCE_PATTERNS.filter((pattern) => pattern.id.startsWith(dailyPatternId('')));

  it('never is the phrase itself', () => {
    expect(daily.length).toBeGreaterThan(100);
    for (const pattern of daily) {
      expect(pattern.template, pattern.id).not.toBe(pattern.example);
      expect(pattern.template, pattern.id).toContain('___');
    }
  });

  it('keeps an authored frame where one fits', () => {
    const greeting = daily.find((pattern) => pattern.example === 'Guten Morgen!');
    expect(greeting?.template).toBe('Guten ___!');
  });

  it('cues a phrase without a frame by its first word', () => {
    const bread = daily.find((pattern) => pattern.id === dailyPatternId('sc-bakery-pre-a1-t2-s1'));
    expect(bread?.template).toBe('Das, ___.');
    const thanks = daily.find((pattern) => pattern.id === dailyPatternId('sc-bakery-pre-a1-t3-s1'));
    expect(thanks?.template).toBe('D___!');
  });

  it('does not hand over the answer as a review hint', () => {
    for (const pattern of daily) {
      const item = createReviewItem({ id: pattern.id, kind: 'pattern', refId: pattern.id, level: pattern.level });
      const step = buildReviewExercises([item]).exercises[0]!.steps[0]!;
      for (const hint of step.hints) {
        expect(hint.en, pattern.id).not.toContain(pattern.example);
        expect(hint.bg, pattern.id).not.toContain(pattern.example);
      }
    }
  });
});

/*
 * "Ich hätte gern …" and "Ich möchte …" are both "I would like …", and the
 * transfer step after each frame asks for "I would like a coffee." The
 * pharmacy refused "Ich möchte einen Kaffee." and the bank refused "Ich hätte
 * gern einen Kaffee.", each as a vocabulary mistake that went to the bank.
 */
describe('the transfer step of a phrase frame', () => {
  const transfer = (scriptId: string) => {
    const script = SCENARIO_SCRIPTS.find((candidate) => candidate.id === scriptId)!;
    return phraseRecall(script, 'en').find((exercise) => exercise.id.startsWith('daily-transfer-'))!.steps[0]!;
  };

  it('accepts the other frame for the same English, and shows the one it practises', () => {
    for (const [scriptId, practised, other] of [
      ['sc-pharmacy-a1', 'Ich hätte gern einen Kaffee.', 'Ich möchte einen Kaffee.'],
      ['sc-bank-a2', 'Ich möchte einen Kaffee.', 'Ich hätte gern einen Kaffee.'],
      ['sc-supermarket-b1', 'Ich möchte einen Kaffee.', 'Ich hätte gern einen Kaffee.'],
    ] as const) {
      const step = transfer(scriptId);
      expect(step.prompt?.en, scriptId).toBe('I would like a coffee.');
      expect(step.answer.accepted, scriptId).toEqual([practised]);
      const r = validateAnswer(other, step.answer, { lexicon: LEXICON });
      expect(r.verdict, scriptId).toBe('accepted-variant');
      expect(r.categories, scriptId).toEqual([]);
      expect(r.target, scriptId).toBe(practised);
    }
  });
});
