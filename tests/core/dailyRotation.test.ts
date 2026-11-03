import { describe, expect, it } from 'vitest';
import { LEXICON, SCENARIO_SCRIPTS, resolveTarget } from '../../src/content/index.ts';
import { dailyPatternId } from '../../src/content/dailyPatterns.ts';
import { otherExamples, phraseFrame } from '../../src/content/phraseFrames.ts';
import type { CefrLevel, ScenarioScript } from '../../src/content/types.ts';
import { LEARNING_GOALS, PRACTICE_LEVELS, type LearningGoal } from '../../src/core/progress/daily.ts';
import { createReviewItem, scheduleReview } from '../../src/core/srs/scheduler.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';
import { chooseDailyScript, dailyPhrases, fitsGoal, goalScripts, phraseRecall } from '../../src/ui/dailyBuilder.ts';
import type { ScenarioRun } from '../../src/services/api/client.ts';

/*
 * Pre-A1 had one conversation, so every goal got the bakery, the same three
 * phrases and "Guten Morgen!" as its first "new" phrase on every day of the
 * first month. Work at A1 had one conversation too, and "Try another
 * practice" brought back the one just finished.
 */

const DAY = 86_400_000;
const dayAfter = (day: string, days: number) =>
  new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);

const played = (script: ScenarioScript, day: string, accuracy = 1, earlier?: ScenarioRun): ScenarioRun => ({
  scriptId: script.id, runs: (earlier?.runs ?? 0) + 1, turns: 4, firstTryCorrect: 4, lastAccuracy: accuracy,
  bestAccuracy: Math.max(accuracy, earlier?.bestAccuracy ?? 0), firstRunAt: earlier?.firstRunAt ?? `${day}T12:00:00Z`,
  lastRunAt: `${day}T12:00:00Z`,
});

/** A learner who plays the daily conversation every day, some of them badly. */
function month(goal: LearningGoal, level: CefrLevel, start = '2026-11-02') {
  const runs = new Map<string, ScenarioRun>();
  const days: ScenarioScript[] = [];
  for (let index = 0; index < 28; index++) {
    const day = dayAfter(start, index);
    const script = chooseDailyScript(goal, level, [...runs.values()], day);
    days.push(script);
    runs.set(script.id, played(script, day, index % 3 === 0 ? 0.5 : 1, runs.get(script.id)));
  }
  return days;
}

describe('the conversation of the day', () => {
  it('gives every goal at least two conversations of its own at Pre-A1 and A1', () => {
    for (const level of ['pre-a1', 'a1'] as const) for (const goal of LEARNING_GOALS) {
      expect(goalScripts(goal, level).length, `${goal} at ${level}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('changes from one day to the next, and never leaves the chosen level', () => {
    for (const goal of LEARNING_GOALS) for (const level of PRACTICE_LEVELS) {
      const days = month(goal, level);
      for (const [index, script] of days.entries()) {
        expect(script.level, `${goal} ${level} day ${index}`).toBe(level);
        if (index > 0) expect(script.id, `${goal} ${level} day ${index}`).not.toBe(days[index - 1]!.id);
      }
    }
  });

  it('keeps to the goal where it has conversations of its own, and plays each before repeating one', () => {
    for (const goal of LEARNING_GOALS) for (const level of PRACTICE_LEVELS) {
      const own = goalScripts(goal, level);
      if (own.length < 2) continue;
      const days = month(goal, level);
      expect(days.every(script => fitsGoal(script, goal)), `${goal} ${level}`).toBe(true);
      expect(new Set(days.slice(0, own.length).map(script => script.id)).size, `${goal} ${level}`).toBe(own.length);
    }
  });

  it('lets the rest of the level take turns with a goal’s only conversation', () => {
    for (const goal of LEARNING_GOALS) for (const level of PRACTICE_LEVELS) {
      const own = goalScripts(goal, level);
      if (own.length !== 1) continue;
      const days = month(goal, level);
      expect(days[0]!.id, `${goal} ${level}`).toBe(own[0]!.id);
      expect(days.filter(script => script.id === own[0]!.id).length, `${goal} ${level}`).toBeGreaterThanOrEqual(10);
    }
  });

  it('differs on consecutive days for somebody who has played nothing yet', () => {
    for (const goal of LEARNING_GOALS) {
      const first = chooseDailyScript(goal, 'pre-a1', [], '2026-11-30');
      expect(chooseDailyScript(goal, 'pre-a1', [], '2026-11-30')).toBe(first);
      expect(chooseDailyScript(goal, 'pre-a1', [], '2026-12-01').id, goal).not.toBe(first.id);
    }
  });

  it('offers another conversation once today’s is played', () => {
    for (const goal of LEARNING_GOALS) {
      const first = chooseDailyScript(goal, 'pre-a1', [], '2026-11-03');
      const next = chooseDailyScript(goal, 'pre-a1', [played(first, '2026-11-03')], '2026-11-03');
      expect(next.id, goal).not.toBe(first.id);
      expect(fitsGoal(next, goal), goal).toBe(true);
    }
  });
});

describe('the phrases of the day', () => {
  it('come from the day’s conversation, and change with it', () => {
    const scripts = new Set(month('everyday', 'pre-a1').slice(0, 3));
    const firsts = new Set<string>();
    for (const script of scripts) {
      const lines = script.beats.flatMap(beat => beat.who === 'you' ? beat.exercise.steps.map(step => step.id) : []);
      const cards = dailyPhrases(script, 'en');
      expect(cards.every(card => lines.includes(card.step.id))).toBe(true);
      firsts.add(cards[0]!.german);
    }
    expect(firsts.size).toBe(scripts.size);
  });

  it('show new lines before ones already met, and say which are met again', () => {
    for (const script of SCENARIO_SCRIPTS.filter(script => script.level === 'pre-a1')) {
      for (const lang of ['en', 'bg'] as const) {
        const first = dailyPhrases(script, lang);
        const items = first.map(card => createReviewItem({ id: card.step.id, kind: 'pattern',
          refId: dailyPatternId(card.step.id), level: script.level }));
        const next = dailyPhrases(script, lang, items);
        const fresh = next.filter(card => !first.some(seen => seen.step.id === card.step.id));
        expect(fresh.length, `${script.id} ${lang}`).toBeGreaterThan(0);
        expect(next.every(card => card.again === first.some(seen => seen.step.id === card.step.id))).toBe(true);
        expect(first.every(card => !card.again)).toBe(true);
      }
    }
  });

  /*
   * Met lines were chosen by when each was last reviewed, and the review part
   * of the same round reviews them, so the cards changed under a reload.
   * Which met lines fill the cards now turns with the date alone.
   */
  it('keep the same met lines all day, whatever today’s review does, and turn with the date', () => {
    const day = '2026-11-03';
    for (const script of SCENARIO_SCRIPTS.filter(script => script.level === 'pre-a1')) {
      const lines = script.beats.flatMap(beat => beat.who === 'you' && !beat.exercise.only?.includes('bg') ? beat.exercise.steps : []);
      const items = lines.map((step, index) => scheduleReview(createReviewItem({ id: step.id, kind: 'pattern',
        refId: dailyPatternId(step.id), level: 'pre-a1', now: new Date('2026-10-20T09:00:00Z') }),
      'good', new Date(Date.parse('2026-10-25T09:00:00Z') + index * DAY)));
      const cards = dailyPhrases(script, 'en', items, day);
      const reviewed = items.map(item => scheduleReview(item, 'good', new Date(`${day}T08:00:00Z`)));
      expect(dailyPhrases(script, 'en', reviewed, day).map(card => card.step.id), script.id).toEqual(cards.map(card => card.step.id));
      const week = new Set([0, 1, 2, 3, 4, 5, 6].map(n => dailyPhrases(script, 'en', items, dayAfter(day, n))
        .map(card => card.step.id).join()));
      expect(week.size, script.id).toBeGreaterThan(1);
    }
  });

  it('counts a phrase the course already taught as met, not new', () => {
    const bakery = SCENARIO_SCRIPTS.find(script => script.id === 'sc-bakery-pre-a1')!;
    const learned = createReviewItem({ id: 'v-guten-morgen', kind: 'vocab', refId: 'v-guten-morgen', level: 'pre-a1' });
    const cards = dailyPhrases(bakery, 'en', [learned]);
    expect(cards.map(card => card.german)).not.toContain('Guten Morgen!');
  });

  it('have a review target, whichever line of whichever conversation a card shows', () => {
    const missing: string[] = [];
    for (const script of SCENARIO_SCRIPTS) for (const beat of script.beats) {
      if (beat.who !== 'you') continue;
      for (const step of beat.exercise.steps) if (!resolveTarget(dailyPatternId(step.id))) missing.push(step.id);
    }
    expect(missing).toEqual([]);
  });
});

describe('a sentence frame', () => {
  it('is reached by a conversation line, every one of them', () => {
    const lines = SCENARIO_SCRIPTS.flatMap(script => script.beats.flatMap(beat =>
      beat.who === 'you' ? beat.exercise.steps.map(step => step.answer.accepted[0]!) : []));
    const reached = new Set(lines.map(line => phraseFrame(line)?.template).filter(Boolean));
    for (const template of ['Guten ___!', 'Ich hätte gern ___.', 'Ich möchte ___.', 'Ich brauche ___.',
      'Ich wohne in ___.', 'Ich komme aus ___.', 'Wo ist ___?', 'Ich heiße ___.']) {
      expect(reached, template).toContain(template);
    }
  });

  it('shows examples that are other sentences, never the line it is shown under', () => {
    for (const script of SCENARIO_SCRIPTS) for (const beat of script.beats) {
      if (beat.who !== 'you') continue;
      for (const step of beat.exercise.steps) {
        const line = step.answer.accepted[0]!;
        const frame = phraseFrame(line);
        if (!frame) continue;
        const shown = otherExamples(frame, line);
        expect(shown.length, step.id).toBeGreaterThan(0);
        for (const example of shown) expect(line.toLowerCase(), step.id).not.toContain(example.de.toLowerCase().replace(/[.!?]$/, ''));
      }
    }
  });

  it('gives a transfer step to most Pre-A1 conversations, each one gradable', () => {
    const preA1 = SCENARIO_SCRIPTS.filter(script => script.level === 'pre-a1');
    let transfers = 0;
    for (const script of preA1) for (const lang of ['en', 'bg'] as const) {
      const transfer = phraseRecall(script, lang).find(exercise => exercise.id.startsWith('daily-transfer-'));
      if (!transfer) continue;
      transfers += 1;
      const step = transfer.steps[0]!;
      expect(validateAnswer(step.answer.accepted[0]!, step.answer, { lexicon: LEXICON }).credit).toBe(1);
    }
    expect(transfers).toBeGreaterThanOrEqual(preA1.length);
  });
});
