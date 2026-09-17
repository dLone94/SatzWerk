import type {
  AnswerShape,
  AnswerSpec,
  Bilingual,
  CefrLevel,
  ErrorCategory,
  Exercise,
  ExerciseKind,
  ExerciseStep,
  TeachingLanguage,
} from './types.ts';

/**
 * Authoring helpers.
 *
 * Lesson files are data, and this module keeps them readable. Nothing here adds
 * behaviour: it only fills in the defaults that every authored exercise would
 * otherwise repeat (shape inference, mandatory retyping for sentences, step ids).
 */

export const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/** Bulgarian-only text, for explanations that only make sense in that path. */
export const bgOnly = (bg: string): Bilingual => ({ en: '', bg });

export interface StepInit {
  id?: string;
  /** Prompt in the teaching language. */
  prompt?: Bilingual | null;
  promptDe?: string;
  instruction?: Bilingual;
  /** "Ich ___ in Hamburg." or "Ich w___ in Hamburg." */
  scaffold?: string;
  wordBank?: string[];
  /** The answer, or several answers that all count as fully correct. */
  answer: string | string[];
  /** Valid German that is not the taught form. Credited, with a note. */
  alternatives?: string[];
  shape?: AnswerShape;
  hints?: Bilingual[];
  /** Text to speak. A string means "play it and show the text". */
  audio?: string | { text: string; hideText?: boolean };
  traps?: Array<{ answer: string; category: ErrorCategory; feedback: Bilingual }>;
  reviewTargets?: string[];
  requiredTokens?: string[];
  enforceCapitalization?: boolean;
  choices?: Array<{ id: string; de: string; gloss?: Bilingual }>;
  correct?: string;
  only?: TeachingLanguage[];
}

function inferShape(answer: string): AnswerShape {
  const words = answer.trim().split(/\s+/).length;
  if (words === 1) return 'word';
  if (/[.!?]$/.test(answer.trim()) || words > 3) return 'sentence';
  return 'phrase';
}

function buildAnswerSpec(init: StepInit): AnswerSpec {
  const accepted = Array.isArray(init.answer) ? init.answer : [init.answer];
  const primary = accepted[0] ?? '';
  const spec: AnswerSpec = {
    accepted,
    shape: init.shape ?? inferShape(primary),
  };
  if (init.alternatives?.length) spec.alternatives = init.alternatives;
  if (init.traps?.length) spec.trapAnswers = init.traps;
  if (init.requiredTokens?.length) spec.requiredTokens = init.requiredTokens;
  if (init.enforceCapitalization !== undefined) spec.enforceCapitalization = init.enforceCapitalization;
  return spec;
}

function buildStep(exerciseId: string, index: number, init: StepInit): ExerciseStep {
  const audio =
    typeof init.audio === 'string' ? { text: init.audio } : init.audio ? { ...init.audio } : undefined;

  const step: ExerciseStep = {
    id: init.id ?? `${exerciseId}-s${index + 1}`,
    prompt: init.prompt ?? null,
    answer: buildAnswerSpec(init),
    hints: init.hints ?? [],
  };
  if (init.promptDe) step.promptDe = init.promptDe;
  if (init.instruction) step.instruction = init.instruction;
  if (init.scaffold) step.scaffold = init.scaffold;
  if (init.wordBank) step.wordBank = init.wordBank;
  if (init.choices) step.choices = init.choices;
  if (init.correct) step.correctChoiceId = init.correct;
  if (audio) step.audio = audio;
  if (init.reviewTargets) step.reviewTargets = init.reviewTargets;
  if (init.only) step.only = init.only;
  return step;
}

export interface ExerciseInit {
  id: string;
  kind: ExerciseKind;
  level?: CefrLevel;
  objective: Bilingual;
  steps: StepInit[];
  mandatoryRetype?: boolean;
  grammarIds?: string[];
  only?: TeachingLanguage[];
}

const SENTENCE_KINDS: ReadonlySet<ExerciseKind> = new Set<ExerciseKind>([
  'type',
  'sentenceBuild',
  'wordOrder',
  'dictation',
  'fillBlank',
  'partialRecall',
]);

export function exercise(init: ExerciseInit): Exercise {
  const steps = init.steps.map((step, index) => buildStep(init.id, index, step));
  const shouldRetype =
    init.mandatoryRetype ??
    (SENTENCE_KINDS.has(init.kind) || steps.some((s) => s.answer.shape !== 'word'));

  const result: Exercise = {
    id: init.id,
    kind: init.kind,
    level: init.level ?? 'pre-a1',
    objective: init.objective,
    steps,
    mandatoryRetype: shouldRetype,
  };
  if (init.grammarIds) result.grammarIds = init.grammarIds;
  if (init.only) result.only = init.only;
  return result;
}

/* ------------------------------------------------------------------ *
 * Shorthands for the exercise shapes the course uses most
 * ------------------------------------------------------------------ */

/** Full production: prompt in the teaching language, learner types German. */
export function typeIt(id: string, objective: Bilingual, steps: StepInit[], grammarIds?: string[]): Exercise {
  return exercise({ id, kind: 'type', objective, steps, grammarIds });
}

/** Guided typing with a gap in the sentence. */
export function fillBlank(id: string, objective: Bilingual, steps: StepInit[]): Exercise {
  return exercise({ id, kind: 'fillBlank', objective, steps });
}

/** Partial recall: the gap already shows the first letters. */
export function partialRecall(id: string, objective: Bilingual, steps: StepInit[]): Exercise {
  return exercise({ id, kind: 'partialRecall', objective, steps });
}

/**
 * The full conjugation of one verb, one input per person.
 * `forms` is ordered ich, du, er/sie/es, wir, ihr, sie/Sie.
 */
export function conjugate(
  id: string,
  verb: string,
  objective: Bilingual,
  forms: [string, string, string, string, string, string],
  reviewTargets?: string[],
): Exercise {
  const persons: Array<[string, Bilingual]> = [
    ['ich', bi('I', 'аз')],
    ['du', bi('you (informal)', 'ти')],
    ['er / sie / es', bi('he / she / it', 'той / тя / то')],
    ['wir', bi('we', 'ние')],
    ['ihr', bi('you (plural)', 'вие')],
    ['sie / Sie', bi('they / you (formal)', 'те / Вие')],
  ];
  return exercise({
    id,
    kind: 'conjugation',
    objective,
    mandatoryRetype: false,
    steps: persons.map(([person, gloss], index) => ({
      id: `${id}-${index + 1}`,
      prompt: bi(`${person} — ${gloss.en}`, `${person} — ${gloss.bg}`),
      scaffold: `${person} ___`,
      answer: forms[index]!,
      shape: 'word' as AnswerShape,
      reviewTargets,
      hints: [
        bi(`The verb is "${verb}".`, `Глаголът е „${verb}“.`),
        bi(`It starts with "${forms[index]!.slice(0, 2)}".`, `Започва с „${forms[index]!.slice(0, 2)}“.`),
      ],
    })),
  });
}

/** Two stages: the bare noun, then the noun with its article. */
export function nounWithArticle(
  id: string,
  objective: Bilingual,
  items: Array<{ prompt: Bilingual; bare: string; withArticle: string; vocabId: string; hint?: Bilingual }>,
): Exercise {
  return exercise({
    id,
    kind: 'nounWithArticle',
    objective,
    steps: items.flatMap((item, index) => [
      {
        id: `${id}-${index + 1}a`,
        prompt: item.prompt,
        instruction: bi('Type the German noun.', 'Напиши немското съществително.'),
        answer: item.bare,
        shape: 'word' as AnswerShape,
        reviewTargets: [item.vocabId],
        hints: [
          bi(`It starts with "${item.bare.slice(0, 1)}".`, `Започва с „${item.bare.slice(0, 1)}“.`),
        ],
      },
      {
        id: `${id}-${index + 1}b`,
        prompt: item.prompt,
        instruction: bi(
          'Correct. Now write the full noun with its article.',
          'Вярно. Сега напиши цялото съществително с члена.',
        ),
        answer: item.withArticle,
        shape: 'phrase' as AnswerShape,
        reviewTargets: [item.vocabId],
        hints: [
          item.hint ??
            bi(
              'Remember the gender of this noun.',
              'Спомни си рода на това съществително.',
            ),
        ],
      },
    ]),
  });
}

/** Audio only, learner types what they hear. */
export function dictation(id: string, objective: Bilingual, steps: StepInit[]): Exercise {
  return exercise({
    id,
    kind: 'dictation',
    objective,
    steps: steps.map((step) => ({
      ...step,
      audio:
        typeof step.audio === 'string'
          ? { text: step.audio, hideText: true }
          : step.audio ?? {
              text: Array.isArray(step.answer) ? step.answer[0]! : step.answer,
              hideText: true,
            },
    })),
  });
}

/** Arrange the word bank, then retype the sentence without it. */
export function wordOrder(
  id: string,
  objective: Bilingual,
  items: Array<{ prompt: Bilingual; bank: string[]; answer: string; hints?: Bilingual[] }>,
): Exercise {
  return exercise({
    id,
    kind: 'wordOrder',
    objective,
    steps: items.flatMap((item, index) => [
      {
        id: `${id}-${index + 1}a`,
        prompt: item.prompt,
        instruction: bi('Put the words in the right order.', 'Подреди думите в правилния ред.'),
        wordBank: item.bank,
        answer: item.answer,
        hints: item.hints ?? [],
      },
      {
        id: `${id}-${index + 1}b`,
        prompt: item.prompt,
        instruction: bi(
          'Now type the whole sentence, without the word bank.',
          'Сега напиши цялото изречение, без помощните думи.',
        ),
        answer: item.answer,
        hints: item.hints ?? [],
      },
    ]),
  });
}

/** Build a sentence up chunk by chunk, then type the whole thing. */
export function sentenceBuild(
  id: string,
  objective: Bilingual,
  item: { prompt: Bilingual; chunks: string[]; answer: string; hints?: Bilingual[] },
): Exercise {
  const steps: StepInit[] = item.chunks.map((chunk, index) => ({
    id: `${id}-step${index + 1}`,
    prompt: item.prompt,
    instruction:
      index === 0
        ? bi('Start the sentence. Type the first part.', 'Започни изречението. Напиши първата част.')
        : bi('Extend it. Type this much of the sentence.', 'Продължи. Напиши дотук от изречението.'),
    answer: chunk,
    shape: 'phrase' as AnswerShape,
    hints: [],
  }));
  steps.push({
    id: `${id}-full`,
    prompt: item.prompt,
    instruction: bi('Now type the whole sentence.', 'Сега напиши цялото изречение.'),
    answer: item.answer,
    shape: 'sentence',
    hints: item.hints ?? [],
  });
  return exercise({ id, kind: 'sentenceBuild', objective, steps });
}

/** "___ Tisch" -> "der". Used sparingly: active recall, not multiple choice. */
export function articleRecall(
  id: string,
  objective: Bilingual,
  items: Array<{ noun: string; article: string; vocabId: string; gloss: Bilingual }>,
): Exercise {
  return exercise({
    id,
    kind: 'articleRecall',
    objective,
    mandatoryRetype: false,
    steps: items.map((item, index) => ({
      id: `${id}-${index + 1}`,
      prompt: item.gloss,
      instruction: bi('Type the article only.', 'Напиши само члена.'),
      scaffold: `___ ${item.noun}`,
      answer: item.article,
      shape: 'word' as AnswerShape,
      reviewTargets: [item.vocabId],
      hints: [
        bi(
          'Think of the noun as you learnt it, with its article attached.',
          'Спомни си съществителното така, както си го учил — заедно с члена.',
        ),
      ],
    })),
  });
}

/** Multiple choice. Only for first exposure and listening recognition. */
export function multipleChoice(
  id: string,
  objective: Bilingual,
  steps: StepInit[],
  kind: Extract<ExerciseKind, 'multipleChoice' | 'listenChoose'> = 'multipleChoice',
): Exercise {
  return exercise({ id, kind, objective, steps, mandatoryRetype: false });
}

/** Open writing, checked only for required elements. */
export function freeWriting(id: string, objective: Bilingual, steps: StepInit[]): Exercise {
  return exercise({ id, kind: 'freeWriting', objective, steps, mandatoryRetype: false });
}
