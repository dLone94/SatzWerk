import { exercise } from '../authoring.ts';
import type {
  Bilingual,
  CefrLevel,
  ScenarioBeat,
  ScenarioScript,
  TeachingLanguage,
} from '../types.ts';
import type { StepInit } from '../authoring.ts';

/**
 * Authoring helpers for scenario scripts.
 *
 * Same principle as the lesson helpers: the script files are data and this
 * module only fills in defaults. Nothing here validates or marks anything —
 * `you()` builds an ordinary `Exercise`, so a scenario turn is graded by the
 * one validator the rest of the app uses.
 */

/** A line the other person says. The meaning stays behind a reveal. */
export function them(
  de: string,
  gloss: Bilingual,
  extra?: { note?: Bilingual; only?: TeachingLanguage[] },
): ScenarioBeat {
  const beat: ScenarioBeat = { who: 'them', de, gloss };
  if (extra?.note) beat.note = extra.note;
  if (extra?.only) beat.only = extra.only;
  return beat;
}

/** A stage direction: what happened, what you can see, what you are holding. */
export function narrator(text: Bilingual, only?: TeachingLanguage[]): ScenarioBeat {
  return only ? { who: 'narrator', text, only } : { who: 'narrator', text };
}

/**
 * Your turn.
 *
 * `task` is the objective — what you have to achieve, not the sentence. The
 * steps are ordinary answer steps, so hints, traps, review targets and
 * mandatory retyping all work exactly as they do in a lesson.
 *
 * `only` scopes the whole turn to one teaching path. It exists for the places
 * where the sentence a learner would actually say depends on which household
 * they are in — the language spoken at home, for instance — rather than on
 * their German.
 */
export function you(
  id: string,
  task: Bilingual,
  steps: StepInit[],
  level?: CefrLevel,
  only?: TeachingLanguage[],
): ScenarioBeat {
  return {
    who: 'you',
    exercise: exercise({ id, kind: 'type', objective: task, steps, level, only }),
  };
}

export interface ScriptInit {
  id: string;
  scenarioId: string;
  level: CefrLevel;
  register: 'du' | 'Sie';
  partner: Bilingual;
  goal: Bilingual;
  outro: Bilingual;
  beats: ScenarioBeat[];
  lessonIds?: string[];
}

export function script(init: ScriptInit): ScenarioScript {
  const result: ScenarioScript = {
    id: init.id,
    scenarioId: init.scenarioId,
    level: init.level,
    register: init.register,
    partner: init.partner,
    goal: init.goal,
    beats: init.beats,
    outro: init.outro,
  };
  if (init.lessonIds) result.lessonIds = init.lessonIds;
  return result;
}

/**
 * The trap every scenario needs, authored once.
 *
 * Saying "du" to a stranger behind a counter is the mistake that costs a
 * learner something socially while being invisible grammatically — the
 * sentence is perfect German. So it is a trap answer with its own explanation
 * rather than a generic "not quite", and it is worded from the room: not
 * "wrong form" but "that is how you'd talk to a friend, and this is not one".
 */
export function registerTrap(answer: string, register: 'du' | 'Sie') {
  return {
    answer,
    category: 'pronoun' as const,
    feedback:
      register === 'Sie'
        ? {
            en: 'Right words, wrong person. You are talking to someone behind a counter, so it is "Sie" — that sentence is what you would say to a friend.',
            bg: 'Правилни думи, грешен човек. Говориш с някого зад гише, значи е „Sie“ — това изречение е за приятел.',
          }
        : {
            en: 'This one is "du". "Sie" here sounds like you are addressing a stranger, and you are not.',
            bg: 'Тук е „du“. „Sie“ звучи, сякаш се обръщаш към непознат, а не е така.',
          },
  };
}
