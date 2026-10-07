import type { ScenarioScript, SentencePattern } from './types.ts';
import { phraseFrame } from './phraseFrames.ts';

export const dailyPatternId = (stepId: string) => `p-daily-${stepId}`;

/** Reuse authored conversation lines; do not generate or translate German. */
export function scenarioPhrasePatterns(scripts: ScenarioScript[]): SentencePattern[] {
  return scripts.flatMap(script => {
    const turns = script.beats.filter(beat => beat.who === 'you');
    const selected = new Map<string, SentencePattern>();
    for (const lang of ['en', 'bg'] as const) {
      let count = 0;
      for (const beat of turns) {
        if (beat.exercise.only && !beat.exercise.only.includes(lang)) continue;
        for (const step of beat.exercise.steps) {
          if (step.only && !step.only.includes(lang)) continue;
          if (count++ >= 3) break;
          const only = step.only ?? beat.exercise.only;
          selected.set(step.id, { id: dailyPatternId(step.id), template: phraseFrame(step.answer.accepted[0]!)?.template ?? step.answer.accepted[0]!,
            example: step.answer.accepted[0]!, gloss: step.prompt ?? step.instruction ?? beat.exercise.objective,
            alternatives: step.answer.alternatives, level: script.level, only });
        }
        if (count >= 3) break;
      }
    }
    return [...selected.values()];
  });
}
