import {
  SENTENCE_PATTERNS,
  VOCABULARY,
  allCheckpoints,
  allLessons,
  patternById,
  vocabById,
} from '../content/browser.ts';
import { bi, dictation, exercise, fillBlank, typeIt } from '../content/authoring.ts';
import type { Exercise, ExerciseStep, TeachingLanguage, VocabEntry } from '../content/types.ts';
import type { ReviewItem } from '../core/srs/scheduler.ts';

/**
 * Turns review items into real typing exercises.
 *
 * The queue is not a flashcard pile: a due word comes back as a prompt in the
 * teaching language that the learner has to *type* in German, with the article
 * where the word is a noun. Every third item comes back as dictation instead, so
 * listening stays in the rotation.
 */

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The example sentence with the word cut out of it, or null when the word does
 * not appear in it as written. The answer keeps the sentence's own spelling, so
 * "Die Katze" at the start of a sentence is asked for with its capital. `bare`
 * says a noun was found without its article: "Ich habe eine ___." wants
 * "Tochter", because the sentence has its own article.
 */
function exampleGap(entry: VocabEntry): { scaffold: string; answer: string; bare: boolean } | null {
  const sentence = entry.example?.de;
  if (!sentence || !entry.example.gloss?.en) return null;
  for (const form of [entry.display, entry.german]) {
    const word = form.replace(/[.!?]+$/, '').trim();
    if (!word) continue;
    // Whole words only: "Ei" is not in "eine". The gap starts the sentence or
    // follows a space, because anything typed against it ("„___") would be
    // read as the first letters of the answer. No lookbehind, which older
    // Safari cannot compile; the space is matched and kept instead.
    const found = new RegExp(`(^|\\s)(${escapeRegExp(word)})(?!\\p{L})`, 'iu').exec(sentence);
    if (found) {
      const start = found.index + found[1]!.length;
      const answer = found[2]!;
      return {
        scaffold: `${sentence.slice(0, start)}___${sentence.slice(start + answer.length)}`,
        answer,
        bare: form !== entry.display,
      };
    }
  }
  return null;
}

function vocabExercise(entry: VocabEntry, index: number, item: Pick<ReviewItem, 'kind' | 'successCount'>): Exercise {
  const needsArticle = entry.wordType === 'noun' && Boolean(entry.article);
  const accepted = [entry.display];
  // A noun may also be typed bare, but that is not the taught form, so it only
  // counts as an alternative and the learner is shown "der Tisch" afterwards.
  const alternatives = needsArticle && item.kind !== 'noun-article' ? [entry.german] : undefined;

  /*
   * The word in its authored example sentence, with the word itself as the gap.
   *
   * This asked for the whole sentence back, "recalled", though no lesson ever
   * shows the examples (only the word page does), and they are written with
   * words the course has not reached: "Gute Nacht, schlaf gut!" two lessons
   * in, with "schlaf" not taught until A1. A learner who knew "Gute Nacht"
   * was marked wrong and the word lapsed. Now the sentence is shown and only
   * the word is asked for, so the card tests the word it schedules. An
   * example that does not contain the word as written (a verb conjugated,
   * say) leaves the plain card below.
   *
   * A noun's gap says whether its article goes in too. Two thirds of the
   * examples bring their own ("Mein ___ ist Teo."), and the taught form typed
   * there, "der Name", was refused and the word lapsed; a hint reading "the
   * name" pointed the same way. Where the gap is the noun alone, the card says
   * so and its hint is the first letter.
   */
  const gap = index % 3 === 1 && item.kind === 'vocab' && item.successCount > 0 ? exampleGap(entry) : null;
  if (gap) {
    const instruction = !needsArticle
      ? bi('Fill the gap with the word you are practising.', 'Попълни празното място с думата, която упражняваш.')
      : gap.bare
        ? bi('Type the noun alone, without der, die or das.', 'Напиши само съществителното, без der, die или das.')
        : bi('Type the noun with its article.', 'Напиши съществителното с члена.');
    const hint = needsArticle && gap.bare
      ? bi(`It starts with "${gap.answer.slice(0, 1)}".`, `Започва с „${gap.answer.slice(0, 1)}“.`)
      : bi(`It means "${entry.translation.en}".`, `Означава „${entry.translation.bg}“.`);
    return { ...fillBlank(`rv-${entry.id}-context`, bi('Use it in a sentence', 'Използвай го в изречение'), [{
      id: `rv-${entry.id}-context-s1`, prompt: entry.example.gloss, scaffold: gap.scaffold,
      instruction, answer: gap.answer, reviewTargets: [entry.id], hints: [hint],
    }]), level: entry.level };
  }

  // Listening rotation.
  if (index % 3 === 2) {
    return dictation(`rv-${entry.id}-dict`, bi('Listen and type', 'Слушай и напиши'), [
      {
        id: `rv-${entry.id}-dict-s1`,
        instruction: bi('Type the German you hear.', 'Напиши немския, който чуваш.'),
        answer: accepted,
        shape: needsArticle ? 'phrase' : entry.wordType === 'phrase' ? 'phrase' : 'word',
        reviewTargets: [entry.id],
        hints: [
          bi(
            `It means "${entry.translation.en}".`,
            `Означава „${entry.translation.bg}“.`,
          ),
        ],
      },
    ]);
  }

  return typeIt(`rv-${entry.id}`, bi('Recall and type', 'Припомни си и напиши'), [
    {
      id: `rv-${entry.id}-s1`,
      prompt: entry.translation,
      instruction: needsArticle
        ? bi('Type the noun with its article.', 'Напиши съществителното с члена.')
        : bi('Type the German.', 'Напиши немското съответствие.'),
      answer: accepted,
      alternatives,
      shape: needsArticle || entry.german.includes(' ') ? 'phrase' : 'word',
      reviewTargets: [entry.id],
      hints: [
        bi(
          `It starts with "${entry.german.slice(0, 1)}".`,
          `Започва с „${entry.german.slice(0, 1)}“.`,
        ),
        ...(needsArticle
          ? [bi('Do not forget der, die or das.', 'Не забравяй der, die или das.')]
          : []),
      ],
    },
  ]);
}

function patternExercise(patternId: string): Exercise | null {
  const pattern = patternById(patternId);
  if (!pattern) return null;
  return { ...typeIt(`rv-${pattern.id}`, bi('Produce the sentence', 'Създай изречението'), [
    {
      id: `rv-${pattern.id}-s1`,
      prompt: pattern.gloss,
      instruction: bi('Type the whole German sentence.', 'Напиши цялото немско изречение.'),
      answer: pattern.example,
      alternatives: pattern.alternatives,
      shape: 'sentence',
      reviewTargets: [pattern.id],
      hints: [
        bi(`The pattern is "${pattern.template}".`, `Моделът е „${pattern.template}“.`),
      ],
    },
  ]), level: pattern.level, only: pattern.only };
}

export interface ReviewBuild {
  exercises: Exercise[];
  /** Items that cannot be reviewed by typing; graded by self-assessment. */
  conceptItems: ReviewItem[];
}

export function reviewItemsForPath(items: ReviewItem[], lang: TeachingLanguage): ReviewItem[] {
  return items.filter(item => {
    const pattern = patternById(item.refId);
    return !pattern?.only || pattern.only.includes(lang);
  });
}

export function buildReviewExercises(items: ReviewItem[], lang?: TeachingLanguage): ReviewBuild {
  const exercises: Exercise[] = [];
  const conceptItems: ReviewItem[] = [];
  let typedIndex = 0;

  for (const item of lang ? reviewItemsForPath(items, lang) : items) {
    if (item.kind === 'vocab' || item.kind === 'noun-article') {
      const entry = vocabById(item.refId);
      if (!entry) continue;
      exercises.push(vocabExercise(entry, typedIndex, item));
      typedIndex += 1;
      continue;
    }
    if (item.kind === 'pattern' || item.kind === 'sentence') {
      const built = patternExercise(item.refId);
      if (built) {
        exercises.push(built);
        typedIndex += 1;
      }
      continue;
    }
    conceptItems.push(item);
  }

  return { exercises, conceptItems };
}

/**
 * Every authored step, by id, with its exercise: lesson practice, final checks
 * and unit and level checkpoints.
 *
 * The placement check is left out. It files no mistakes, and its content is
 * only loaded on its own page, so anywhere else its steps are catalog
 * metadata with no prompt and no answer: replayed from the mistake bank, an
 * old placement guess became a blank card that no answer could pass.
 */
let stepIndex: Map<string, { exercise: Exercise; step: ExerciseStep }> | null = null;
export function authoredStep(id: string): { exercise: Exercise; step: ExerciseStep } | undefined {
  if (!stepIndex) {
    stepIndex = new Map();
    const exercises = [
      ...allLessons().flatMap((lesson) => [...lesson.exercises, ...lesson.mastery.exercises]),
      ...allCheckpoints()
        .filter((checkpoint) => checkpoint.scope !== 'placement')
        .flatMap((checkpoint) => checkpoint.exercises),
    ];
    for (const exercise of exercises) for (const step of exercise.steps) stepIndex.set(step.id, { exercise, step });
  }
  return stepIndex.get(id);
}

/** What practice needs to know about a row of the mistake bank. */
export interface PractisedMistake {
  id: string;
  expected: string;
  lastGiven: string;
  category: string;
  stepId?: string | null;
  occurrences?: number;
}

/**
 * The exercise id a mistake's practice card carries. The server reads it back:
 * a clean right answer on that card puts the mistake away (recordAttempt in
 * server/store.ts), and nothing else in an attempt says which mistake a card
 * was for. A card with an id of its own, the daily round's variation say,
 * keeps it in front.
 */
export function mistakePracticeId(mistakeId: string, card?: string): string {
  return card ? `${card}-mp-${mistakeId}` : `mp-${mistakeId}`;
}

/**
 * Practice built from the mistake bank: the question that went wrong, asked
 * again.
 *
 * Every card used to read "You wrote "der" here. Type the correct German." and
 * nothing else. An article mistake was a guess between the two articles left,
 * three answers of "ich weiß nicht" made three cards worded the same that
 * wanted three different answers, and the only hint ("It starts with "die"")
 * was the whole answer. The mistake row keeps the step it came from, so the
 * authored question comes back instead, with its prompt, gap, choices and
 * hints, and what the learner answered last time beside it. A step that is
 * not authored, a review card say, is rebuilt from the word or sentence it
 * asked for; only when nothing is known is the bare correction left.
 *
 * The step keeps its own id, so a slip here counts as that mistake happening
 * again rather than as a new mistake about a practice card. Its review
 * targets stay behind: this is the mistake bank, not the review schedule.
 */
export function buildMistakePractice(mistakes: PractisedMistake[]): Exercise[] {
  const out: Exercise[] = [];
  const seen = new Set<string>();
  for (const mistake of mistakes) {
    // One question filed under two categories is still one question.
    const key = `${mistake.stepId ?? mistake.id}|${mistake.expected}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(mistakeExercise(mistake));
    if (out.length === 12) break;
  }
  return out;
}

function mistakeExercise(mistake: PractisedMistake): Exercise {
  // Made once, it is a mistake to fix; only a second time makes it recurring.
  const objective =
    (mistake.occurrences ?? 1) > 1
      ? bi('Practise a recurring mistake', 'Упражни повтаряща се грешка')
      : bi('Fix a mistake', 'Поправи грешка');
  const stepId = mistake.stepId ?? `mp-${mistake.id}-s1`;
  // An answer that was a whole sentence brings its own full stop.
  const stop = /[.!?…]$/.test(mistake.lastGiven.trim()) ? '' : '.';
  const lastTime = bi(
    `Last time you answered "${mistake.lastGiven}"${stop}`,
    `Миналия път отговори „${mistake.lastGiven}“${stop}`,
  );
  const asMistake = (card: Exercise, step: ExerciseStep): Exercise => {
    const replay: ExerciseStep = {
      ...step,
      id: stepId,
      instruction: step.instruction
        ? bi(`${step.instruction.en} ${lastTime.en}`.trim(), `${step.instruction.bg} ${lastTime.bg}`.trim())
        : lastTime,
    };
    delete replay.reviewTargets;
    return { ...card, id: mistakePracticeId(mistake.id), objective, steps: [replay] };
  };

  // A daily round asks an authored step under its own prefixed id. A step
  // whose level has not been loaded has no answers yet, and replayed it could
  // never be passed, so it is rebuilt below like any other.
  const authored = mistake.stepId ? authoredStep(mistake.stepId.replace(/^daily-target-/, '')) : undefined;
  if (authored && authored.step.answer.accepted.length > 0) return asMistake(authored.exercise, authored.step);

  const entry = VOCABULARY.find((candidate) => candidate.display === mistake.expected || candidate.german === mistake.expected);
  if (entry) {
    const card = vocabExercise(entry, 0, { kind: 'vocab', successCount: 0 });
    return asMistake(card, card.steps[0]!);
  }
  const pattern = SENTENCE_PATTERNS.find((candidate) => candidate.example === mistake.expected);
  const sentence = pattern ? patternExercise(pattern.id) : null;
  if (sentence) return asMistake(sentence, sentence.steps[0]!);

  // Nothing to rebuild the question from. The hint gives at most a third of
  // the answer, so a three-letter article is not handed over whole.
  const start = mistake.expected.slice(0, Math.max(1, Math.floor(mistake.expected.length / 3)));
  return exercise({
    id: mistakePracticeId(mistake.id),
    kind: 'type',
    objective,
    steps: [
      {
        id: stepId,
        prompt: bi(
          `You wrote "${mistake.lastGiven}" here. Type the correct German.`,
          `Тук написа „${mistake.lastGiven}“. Напиши правилния немски.`,
        ),
        answer: mistake.expected,
        shape: mistake.expected.includes(' ') ? 'sentence' : 'word',
        hints: [bi(`It starts with "${start}".`, `Започва с „${start}“.`)],
      },
    ],
  });
}
