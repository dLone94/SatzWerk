import type { ScenarioScript, SentencePattern } from './types.ts';
import { phraseFrame } from './phraseFrames.ts';

export const dailyPatternId = (stepId: string) => `p-daily-${stepId}`;

/**
 * The pattern of a phrase no authored frame fits: its first word and a gap
 * ("Das, ___."), or a lone word's first letter ("D___!"). The whole phrase
 * used to stand here, and review hints "The pattern is …" with the template,
 * so the hint printed the answer to be copied.
 */
function phraseCue(german: string): string {
  const words = german.split(/\s+/);
  const close = /[.!?]+$/.exec(german)?.[0] ?? '';
  return words.length > 1 ? `${words[0]} ___${close}` : `${german[0]}___${close}`;
}

/**
 * Reuse authored conversation lines; do not generate or translate German.
 *
 * Every line of every conversation, not just the first three: the cards a
 * learner meets are chosen from the whole conversation, new lines first, and
 * whichever line a card shows, its review target has to exist.
 */
export function scenarioPhrasePatterns(scripts: ScenarioScript[]): SentencePattern[] {
  return scripts.flatMap(script => script.beats.flatMap(beat => beat.who !== 'you' ? [] : beat.exercise.steps
    .filter(step => step.answer.accepted.length > 0)
    .map((step): SentencePattern => ({ id: dailyPatternId(step.id),
      template: phraseFrame(step.answer.accepted[0]!)?.template ?? phraseCue(step.answer.accepted[0]!),
      example: step.answer.accepted[0]!, gloss: step.prompt ?? step.instruction ?? beat.exercise.objective,
      alternatives: step.answer.alternatives, level: script.level, only: step.only ?? beat.exercise.only }))));
}
