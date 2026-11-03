import { SCENARIO_SCRIPTS, SCENARIOS, VOCABULARY, practiceForCategory, vocabById } from '../content/browser.ts';
import type { Bilingual, CefrLevel, Exercise, ExerciseStep, ScenarioScript, TeachingLanguage, VocabEntry } from '../content/types.ts';
import { CEFR_ORDER, isVisible } from '../content/types.ts';
import type { LearningGoal } from '../core/progress/daily.ts';
import { orderQueue } from '../core/srs/scheduler.ts';
import type { ReviewItem } from '../core/srs/scheduler.ts';
import type { MistakeRecord, ScenarioRun } from '../services/api/client.ts';
import { buildMistakePractice, buildReviewExercises, mistakePracticeId } from './reviewBuilder.ts';
import { dailyPatternId } from '../content/dailyPatterns.ts';
import { phraseFrame } from '../content/phraseFrames.ts';
import { todayHere } from '../core/progress/days.ts';

const TOPICS: Record<LearningGoal, string[]> = {
  everyday: ['sc-bakery', 'sc-supermarket', 'sc-neighbours', 'sc-doctor', 'sc-pharmacy', 'sc-apartment', 'sc-kita', 'sc-buergeramt'],
  travel: ['sc-transport', 'sc-restaurant', 'sc-bakery', 'sc-emergency'],
  work: ['sc-work', 'sc-bank', 'sc-buergeramt', 'sc-neighbours'],
  exams: ['sc-neighbours', 'sc-work', 'sc-apartment', 'sc-restaurant', 'sc-buergeramt', 'sc-kita'],
};

/** Whether a conversation is about what this goal is for, rather than a stand-in at its level. */
export const fitsGoal = (script: ScenarioScript, goal: LearningGoal) => TOPICS[goal].includes(script.scenarioId);

/** The conversations written for this goal at this level. */
export const goalScripts = (goal: LearningGoal, level: CefrLevel) =>
  SCENARIO_SCRIPTS.filter(script => script.level === level && fitsGoal(script, goal));

const DAY_MS = 86_400_000;
const dayNumber = (day: string) => Math.floor(Date.parse(`${day}T00:00:00Z`) / DAY_MS);

/**
 * Today's conversation: always at the chosen level, so a beginner is never
 * handed the next level's German, and not the one practised today or
 * yesterday while another one fits.
 *
 * Pre-A1 used to have a single conversation, so every goal got the bakery on
 * every day of the first month. A goal with two or more conversations of its
 * own keeps to them. A goal with only one lets the rest of its level take
 * turns with it, rather than opening the same exchange every morning. After
 * that, an unplayed conversation comes first, then one still needing
 * practice, then the one left longest; the date settles the remaining ties,
 * so two days in a row differ even for somebody who has played nothing yet.
 */
export function chooseDailyScript(goal: LearningGoal, level: CefrLevel, runs: ScenarioRun[], day: string): ScenarioScript {
  const atLevel = SCENARIO_SCRIPTS.filter(script => script.level === level);
  const available = atLevel.length > 0 ? atLevel : SCENARIO_SCRIPTS.filter(script => script.level === 'pre-a1');
  const own = available.filter(script => fitsGoal(script, goal));
  const candidates = own.length >= 2 ? own : available;
  const today = dayNumber(day);
  const ranked = candidates.map((script, index) => {
    const run = runs.find(run => run.scriptId === script.id);
    const at = run ? new Date(run.lastRunAt) : undefined;
    // The day it was played, on the same calendar as `day`: the learner's own.
    const played = at && !Number.isNaN(at.getTime()) ? dayNumber(todayHere(at)) : -Infinity;
    return {
      script,
      resting: today - played <= 1 ? 1 : 0,
      other: fitsGoal(script, goal) ? 0 : 1,
      // A conversation still needing practice comes back before one already clean.
      priority: !run ? 0 : run.lastAccuracy < 0.8 ? 1 : 2,
      date: run?.lastRunAt ?? '',
      turn: (((index - today) % candidates.length) + candidates.length) % candidates.length,
    };
  }).sort((a, b) => a.resting - b.resting || a.other - b.other || a.priority - b.priority
    || a.date.localeCompare(b.date) || a.turn - b.turn);
  return ranked[0]!.script;
}

/** `again` says the learner has met this phrase before, so its card does not present it as new. */
export interface PhraseCard { step: ExerciseStep; german: string; purpose: Bilingual; words: VocabEntry[]; again: boolean }

const bare = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/**
 * Three lines of the day's conversation to meet before it, new ones first.
 *
 * The first three, always, meant the same three on every visit, and a Pre-A1
 * learner's first "new" phrase was "Guten Morgen!", learned in a lesson weeks
 * before. A line is met when it is already in review as a daily phrase, or
 * when it is itself a phrase the course taught ("Guten Morgen!" is a word in
 * the vocabulary). Met lines fill the cards only when there are not three new
 * ones, the longest unpractised first, and the cards keep the order the
 * conversation says them in.
 */
export function dailyPhrases(script: ScenarioScript, lang: TeachingLanguage, items: readonly ReviewItem[] = []): PhraseCard[] {
  const known = new Map(items.map(item => [item.refId, item]));
  const met = (step: ExerciseStep): ReviewItem | undefined => {
    const daily = known.get(dailyPatternId(step.id));
    if (daily) return daily;
    const taught = (step.reviewTargets ?? []).find(id => known.has(id)
      && bare(vocabById(id)?.german ?? '') === bare(step.answer.accepted[0]!));
    return taught ? known.get(taught) : undefined;
  };
  const lines = script.beats.flatMap(beat => beat.who === 'you' && isVisible(beat.exercise, lang)
    ? beat.exercise.steps.filter(step => isVisible(step, lang) && step.answer.accepted.length > 0)
      .map(step => ({ step, purpose: step.prompt ?? step.instruction ?? beat.exercise.objective, seen: met(step) }))
    : []).map((line, index) => ({ ...line, index }));
  const chosen = [...lines].sort((a, b) => Number(Boolean(a.seen)) - Number(Boolean(b.seen))
    || (a.seen?.lastReviewAt ?? '').localeCompare(b.seen?.lastReviewAt ?? '') || a.index - b.index).slice(0, 3);
  return chosen.sort((a, b) => a.index - b.index).map(({ step, purpose, seen }) => ({
    step, german: step.answer.accepted[0]!, purpose, again: Boolean(seen),
    words: [...new Set([
      ...(step.reviewTargets ?? []).map(vocabById).filter((word): word is VocabEntry => Boolean(word)),
      ...VOCABULARY.filter(word => word.wordType === 'noun' &&
        step.answer.accepted[0]!.toLowerCase().split(/[^\p{L}]+/u).includes(word.german.toLowerCase())).slice(0, 3),
    ])],
  }));
}

/** Practice has distinct IDs: rehearsing a line never completes a course lesson. */
export function phraseRecall(script: ScenarioScript, lang: TeachingLanguage, cards = dailyPhrases(script, lang)): Exercise[] {
  const recall: Exercise[] = cards.map(card => ({
    id: `daily-phrase-${card.step.id}`, kind: 'type', level: script.level,
    objective: { en: 'Use your new phrase', bg: 'Използвай новата фраза' },
    steps: [{ ...card.step, id: `daily-phrase-${card.step.id}`, prompt: card.purpose, promptDe: undefined,
      audio: undefined, scaffold: undefined, wordBank: undefined, choices: undefined,
      correctChoiceId: undefined, reviewTargets: [...(card.step.reviewTargets ?? []), dailyPatternId(card.step.id)] }],
  }));
  const card = cards.find(card => phraseFrame(card.german));
  const frame = card ? phraseFrame(card.german) : undefined;
  const swap = frame?.examples.find(example => example.de !== card?.german);
  if (card && swap && frame) recall.push({ id: `daily-transfer-${card.step.id}`, kind: 'type', level: script.level,
    objective: { en: 'Use the same building block in a new sentence', bg: 'Използвай същия модел в ново изречение' },
    steps: [{ id: `daily-transfer-${card.step.id}`, prompt: swap.gloss,
      instruction: { en: 'Keep the pattern. Change what you say.', bg: 'Запази модела. Промени това, което казваш.' },
      answer: { accepted: [swap.de], alternatives: swap.alternatives, shape: card.step.answer.shape },
      hints: [{ en: `The pattern is "${frame.template}".`, bg: `Моделът е „${frame.template}“.` }],
      reviewTargets: [dailyPatternId(card.step.id)] }],
  });
  return recall;
}

export function dailyListening(script: ScenarioScript, lang: TeachingLanguage, cards = dailyPhrases(script, lang)): Exercise[] {
  return cards.slice(0, 2).map(card => ({
    id: `daily-listen-${card.step.id}`, kind: 'dictation', level: script.level,
    objective: { en: 'Recognise a useful phrase', bg: 'Разпознай полезна фраза' },
    steps: [{ id: `daily-listen-${card.step.id}`, prompt: null,
      instruction: { en: 'Listen, then type what you hear.', bg: 'Слушай и напиши това, което чуваш.' },
      answer: { accepted: [card.german], shape: card.step.answer.shape },
      audio: { text: card.german, hideText: true, replays: script.level === 'pre-a1' ? 4 : 2 },
      reviewTargets: [...(card.step.reviewTargets ?? []), dailyPatternId(card.step.id)], hints: [] }],
  }));
}

/** Keep review short enough to leave room for speaking and new material. */
export function dailyReview(items: ReviewItem[], mistakes: MistakeRecord[], level: CefrLevel, lang: TeachingLanguage, limit = 6): Exercise[] {
  const due = buildReviewExercises(orderQueue(items), lang).exercises;
  const recurring = mistakes.filter(mistake => mistake.occurrences > 1 && !mistake.resolvedAt)
    .sort((a, b) => b.occurrences - a.occurrences);
  const targeted: Exercise[] = [];
  const taken = new Set<string>();
  for (const mistake of recurring) {
    // Use an authored variation of the same skill, at or below this learner's level.
    // Got right with no help, it puts the mistake away: the skill has held in a
    // sentence that cannot have been remembered, which says more than the same
    // question again would. Made again, the mistake comes back. Before, nothing
    // practised here could put one away, so a learner who practised only here
    // met the same mistakes in every round.
    const variation = practiceForCategory(mistake.category, 80).find(exercise =>
      CEFR_ORDER.indexOf(exercise.level) <= CEFR_ORDER.indexOf(level) && isVisible(exercise, lang) &&
      exercise.steps.some(step => isVisible(step, lang) && step.id !== mistake.stepId && !taken.has(step.id)));
    if (variation) {
      const step = variation.steps.find(step => isVisible(step, lang) && step.id !== mistake.stepId && !taken.has(step.id))!;
      taken.add(step.id);
      targeted.push({ ...variation, id: mistakePracticeId(mistake.id, `daily-target-${variation.id}`),
        steps: [{ ...step, id: `daily-target-${step.id}` }] });
    }
    if (targeted.length === 2) break;
  }
  if (targeted.length === 0) targeted.push(...buildMistakePractice(recurring.slice(0, 2)));
  // Reserve two prompts for recurring mistakes; due items retain their urgency order.
  return [...due.slice(0, Math.max(0, limit - targeted.length)), ...targeted]
    .map(exercise => ({ ...exercise, steps: exercise.steps.filter(step => isVisible(step, lang)) }))
    .filter(exercise => isVisible(exercise, lang) && exercise.steps.length > 0).slice(0, limit);
}

/** Abilities are backed by completed practice, with scores described as practice. */
export function practicalAbilities(runs: ScenarioRun[]) {
  return runs.filter(run => run.turns > 0).map(run => {
    const script = SCENARIO_SCRIPTS.find(script => script.id === run.scriptId);
    const scenario = SCENARIOS.find(scenario => scenario.id === script?.scenarioId);
    return script && scenario ? { script, scenario, run } : null;
  }).filter((ability): ability is NonNullable<typeof ability> => Boolean(ability));
}
