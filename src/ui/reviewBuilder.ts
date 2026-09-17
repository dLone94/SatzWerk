import { patternById, vocabById } from '../content/index.ts';
import { bi, dictation, exercise, typeIt } from '../content/authoring.ts';
import type { Exercise, VocabEntry } from '../content/types.ts';
import type { ReviewItem } from '../core/srs/scheduler.ts';

/**
 * Turns review items into real typing exercises.
 *
 * The queue is not a flashcard pile: a due word comes back as a prompt in the
 * teaching language that the learner has to *type* in German, with the article
 * where the word is a noun. Every third item comes back as dictation instead, so
 * listening stays in the rotation.
 */

function vocabExercise(entry: VocabEntry, index: number): Exercise {
  const needsArticle = entry.wordType === 'noun' && Boolean(entry.article);
  const accepted = [entry.display];
  // A noun may also be typed bare, but that is not the taught form, so it only
  // counts as an alternative and the learner is shown "der Tisch" afterwards.
  const alternatives = needsArticle ? [entry.german] : undefined;

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
  return typeIt(`rv-${pattern.id}`, bi('Produce the sentence', 'Създай изречението'), [
    {
      id: `rv-${pattern.id}-s1`,
      prompt: pattern.gloss,
      instruction: bi('Type the whole German sentence.', 'Напиши цялото немско изречение.'),
      answer: pattern.example,
      shape: 'sentence',
      reviewTargets: [pattern.id],
      hints: [
        bi(`The pattern is "${pattern.template}".`, `Моделът е „${pattern.template}“.`),
      ],
    },
  ]);
}

export interface ReviewBuild {
  exercises: Exercise[];
  /** Items that cannot be reviewed by typing; graded by self-assessment. */
  conceptItems: ReviewItem[];
}

export function buildReviewExercises(items: ReviewItem[]): ReviewBuild {
  const exercises: Exercise[] = [];
  const conceptItems: ReviewItem[] = [];
  let typedIndex = 0;

  for (const item of items) {
    if (item.kind === 'vocab' || item.kind === 'noun-article') {
      const entry = vocabById(item.refId);
      if (!entry) continue;
      exercises.push(vocabExercise(entry, typedIndex));
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
 * Practice built from the mistake bank: retype the correct German for each
 * recurring mistake, with the correction visible as the last hint only.
 */
export function buildMistakePractice(
  mistakes: Array<{ id: string; expected: string; lastGiven: string; category: string }>,
): Exercise[] {
  return mistakes.slice(0, 12).map((mistake) =>
    exercise({
      id: `mp-${mistake.id}`,
      kind: 'type',
      objective: bi('Practise a recurring mistake', 'Упражни повтаряща се грешка'),
      steps: [
        {
          id: `mp-${mistake.id}-s1`,
          prompt: bi(
            `You wrote "${mistake.lastGiven}" here. Type the correct German.`,
            `Тук написа „${mistake.lastGiven}“. Напиши правилния немски.`,
          ),
          answer: mistake.expected,
          shape: mistake.expected.includes(' ') ? 'sentence' : 'word',
          hints: [
            bi(
              `It starts with "${mistake.expected.slice(0, 3)}".`,
              `Започва с „${mistake.expected.slice(0, 3)}“.`,
            ),
          ],
        },
      ],
    }),
  );
}
