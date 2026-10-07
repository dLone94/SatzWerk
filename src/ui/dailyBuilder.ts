import { SCENARIO_SCRIPTS, SCENARIOS, VOCABULARY, practiceForCategory, vocabById } from '../content/browser.ts';
import type { Bilingual, CefrLevel, Exercise, ExerciseStep, ScenarioScript, TeachingLanguage, VocabEntry } from '../content/types.ts';
import { CEFR_ORDER, isVisible } from '../content/types.ts';
import type { LearningGoal } from '../core/progress/daily.ts';
import { orderQueue } from '../core/srs/scheduler.ts';
import type { ReviewItem } from '../core/srs/scheduler.ts';
import type { MistakeRecord, ScenarioRun } from '../services/api/client.ts';
import { buildMistakePractice, buildReviewExercises } from './reviewBuilder.ts';
import { dailyPatternId } from '../content/dailyPatterns.ts';
import { phraseFrame } from '../content/phraseFrames.ts';

const TOPICS: Record<LearningGoal, string[]> = {
  everyday: ['sc-bakery', 'sc-supermarket', 'sc-neighbours', 'sc-doctor', 'sc-pharmacy', 'sc-apartment', 'sc-kita', 'sc-buergeramt'],
  travel: ['sc-transport', 'sc-restaurant', 'sc-bakery', 'sc-emergency'],
  work: ['sc-work', 'sc-bank', 'sc-buergeramt', 'sc-neighbours'],
  exams: ['sc-neighbours', 'sc-work', 'sc-apartment', 'sc-restaurant', 'sc-buergeramt', 'sc-kita'],
};

/** Stay at the chosen level. Beginners share a small, useful first exchange. */
export function chooseDailyScript(goal: LearningGoal, level: CefrLevel, runs: ScenarioRun[], day: string): ScenarioScript {
  const atLevel = SCENARIO_SCRIPTS.filter(script => script.level === level);
  const available = atLevel.length > 0 ? atLevel : SCENARIO_SCRIPTS.filter(script => script.level === 'pre-a1');
  const relevant = available.filter(script => TOPICS[goal].includes(script.scenarioId));
  const candidates = relevant.length > 0 ? relevant : available;
  const seed = [...day].reduce((value, char) => value + char.charCodeAt(0), 0);
  const ranked = candidates.map((script, index) => {
    const run = runs.find(run => run.scriptId === script.id);
    // A conversation still needing practice comes back before one already clean.
    const priority = !run ? 0 : run.lastAccuracy < 0.8 ? 1 : 2;
    return { script, priority, date: run?.lastRunAt ?? '', tie: (index + seed) % candidates.length };
  }).sort((a, b) => a.priority - b.priority || a.date.localeCompare(b.date) || a.tie - b.tie);
  return ranked[0]!.script;
}

export interface PhraseCard { step: ExerciseStep; german: string; purpose: Bilingual; words: VocabEntry[] }
export function dailyPhrases(script: ScenarioScript, lang: TeachingLanguage): PhraseCard[] {
  return script.beats.flatMap(beat => beat.who === 'you' && isVisible(beat.exercise, lang)
    ? beat.exercise.steps.filter(step => isVisible(step, lang) && step.answer.accepted.length > 0).map(step => ({
      step, german: step.answer.accepted[0]!, purpose: step.prompt ?? step.instruction ?? beat.exercise.objective,
      words: [...new Set([
        ...(step.reviewTargets ?? []).map(vocabById).filter((word): word is VocabEntry => Boolean(word)),
        ...VOCABULARY.filter(word => word.wordType === 'noun' &&
          step.answer.accepted[0]!.toLowerCase().split(/[^\p{L}]+/u).includes(word.german.toLowerCase())).slice(0, 3),
      ])],
    })) : []).slice(0, 3);
}

/** Practice has distinct IDs: rehearsing a line never completes a course lesson. */
export function phraseRecall(script: ScenarioScript, lang: TeachingLanguage): Exercise[] {
  const cards = dailyPhrases(script, lang);
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
      answer: { accepted: [swap.de], shape: card.step.answer.shape },
      hints: [{ en: `The pattern is "${frame.template}".`, bg: `Моделът е „${frame.template}“.` }],
      reviewTargets: [dailyPatternId(card.step.id)] }],
  });
  return recall;
}

export function dailyListening(script: ScenarioScript, lang: TeachingLanguage): Exercise[] {
  return dailyPhrases(script, lang).slice(0, 2).map(card => ({
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
    const variation = practiceForCategory(mistake.category, 80).find(exercise =>
      CEFR_ORDER.indexOf(exercise.level) <= CEFR_ORDER.indexOf(level) && isVisible(exercise, lang) &&
      exercise.steps.some(step => isVisible(step, lang) && step.id !== mistake.stepId && !taken.has(step.id)));
    if (variation) {
      const step = variation.steps.find(step => isVisible(step, lang) && step.id !== mistake.stepId && !taken.has(step.id))!;
      taken.add(step.id);
      targeted.push({ ...variation, id: `daily-target-${variation.id}`, steps: [{ ...step, id: `daily-target-${step.id}` }] });
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
