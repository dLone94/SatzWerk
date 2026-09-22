import { bi, exercise } from '../authoring.ts';
import type { Checkpoint } from '../types.ts';

/**
 * The placement check.
 *
 * Twenty questions, four per level, climbing. Each group is deliberately the
 * thing its level turns on rather than a fair sample of it: if you can put the
 * verb second, you have A1's central idea; if you can put it at the end after
 * "weil", you have A2's; if the participle block at B2 means anything to you,
 * you are past B1 whatever else you cannot do.
 *
 * Every exercise carries its own `level`, which is what the scorer bands the
 * answers by — so the result is derived from the content rather than from a
 * table somebody has to keep in step with it.
 *
 * No hints anywhere, and no traps. A trap is a teaching device: it catches a
 * mistake in order to explain it, and here nothing is being taught yet. What
 * is wanted is only whether the sentence arrives.
 */

const PRE_A1 = [
  exercise({
    id: 'pl-pre-a1',
    kind: 'type',
    level: 'pre-a1',
    objective: bi('The first words', 'Първите думи'),
    mandatoryRetype: false,
    steps: [
      {
        id: 'pl-pre-a1-1',
        prompt: bi('Good morning!', 'Добро утро!'),
        answer: 'Guten Morgen!',
        alternatives: ['Guten Morgen'],
        shape: 'phrase',
        hints: [],
      },
      {
        id: 'pl-pre-a1-2',
        prompt: bi('My name is Anna.', 'Казвам се Анна.'),
        answer: 'Ich heiße Anna.',
        alternatives: ['Mein Name ist Anna.'],
        shape: 'sentence',
        hints: [],
      },
      {
        id: 'pl-pre-a1-3',
        prompt: bi('the house (with its article)', 'къщата (с члена)'),
        answer: 'das Haus',
        shape: 'phrase',
        hints: [],
      },
      {
        id: 'pl-pre-a1-4',
        prompt: bi('I live in Hamburg.', 'Живея в Хамбург.'),
        answer: 'Ich wohne in Hamburg.',
        shape: 'sentence',
        hints: [],
      },
    ],
  }),
];

const A1 = [
  exercise({
    id: 'pl-a1',
    kind: 'type',
    level: 'a1',
    objective: bi('The verb in second place', 'Глаголът на второ място'),
    mandatoryRetype: false,
    steps: [
      {
        id: 'pl-a1-1',
        prompt: bi('Today I am working at home.', 'Днес работя вкъщи.'),
        answer: 'Heute arbeite ich zu Hause.',
        alternatives: ['Ich arbeite heute zu Hause.'],
        shape: 'sentence',
        hints: [],
      },
      {
        id: 'pl-a1-2',
        prompt: bi('I have a daughter.', 'Имам дъщеря.'),
        answer: 'Ich habe eine Tochter.',
        shape: 'sentence',
        hints: [],
      },
      {
        id: 'pl-a1-3',
        prompt: bi('Can you help me? (formal)', 'Може ли да ми помогнете? (официално)'),
        answer: 'Können Sie mir helfen?',
        alternatives: ['Könnten Sie mir helfen?'],
        shape: 'sentence',
        hints: [],
      },
      {
        id: 'pl-a1-4',
        prompt: bi('It is half past seven.', 'Часът е седем и половина.'),
        answer: 'Es ist halb acht.',
        shape: 'sentence',
        hints: [],
      },
    ],
  }),
];

const A2 = [
  exercise({
    id: 'pl-a2',
    kind: 'type',
    level: 'a2',
    objective: bi('The past, and the verb at the end', 'Миналото и глаголът накрая'),
    mandatoryRetype: false,
    steps: [
      {
        id: 'pl-a2-1',
        prompt: bi('Yesterday I bought bread.', 'Вчера купих хляб.'),
        answer: 'Gestern habe ich Brot gekauft.',
        alternatives: ['Ich habe gestern Brot gekauft.'],
        shape: 'sentence',
        hints: [],
      },
      {
        id: 'pl-a2-2',
        prompt: bi('I am staying at home because I am ill.', 'Оставам вкъщи, защото съм болен.'),
        answer: 'Ich bleibe zu Hause, weil ich krank bin.',
        shape: 'sentence',
        hints: [],
      },
      {
        id: 'pl-a2-3',
        prompt: bi('We went to Berlin.', 'Отидохме до Берлин.'),
        answer: 'Wir sind nach Berlin gefahren.',
        // The answer itself was in this list too, which made it both the form
        // being taught and an alternative to it.
        alternatives: ['Wir fuhren nach Berlin.'],
        shape: 'sentence',
        hints: [],
      },
      {
        id: 'pl-a2-4',
        prompt: bi('The book is on the table.', 'Книгата е на масата.'),
        answer: 'Das Buch liegt auf dem Tisch.',
        alternatives: ['Das Buch ist auf dem Tisch.'],
        shape: 'sentence',
        hints: [],
      },
    ],
  }),
];

const B1 = [
  exercise({
    id: 'pl-b1',
    kind: 'type',
    level: 'b1',
    objective: bi('Politeness, and two clauses', 'Учтивост и две изречения в едно'),
    mandatoryRetype: false,
    steps: [
      {
        id: 'pl-b1-1',
        prompt: bi('I would like to make an appointment.', 'Бих искал да запиша час.'),
        answer: 'Ich hätte gern einen Termin.',
        alternatives: ['Ich würde gern einen Termin vereinbaren.', 'Ich möchte einen Termin vereinbaren.'],
        shape: 'sentence',
        hints: [],
      },
      {
        id: 'pl-b1-2',
        prompt: bi('I think that the rent is too high.', 'Мисля, че наемът е твърде висок.'),
        answer: 'Ich finde, dass die Miete zu hoch ist.',
        alternatives: ['Ich denke, dass die Miete zu hoch ist.'],
        shape: 'sentence',
        hints: [],
      },
      {
        id: 'pl-b1-3',
        prompt: bi('If I have time, I will come along.', 'Ако имам време, ще дойда с вас.'),
        answer: 'Wenn ich Zeit habe, komme ich mit.',
        shape: 'sentence',
        hints: [],
      },
      {
        id: 'pl-b1-4',
        prompt: bi('Could you repeat that, please?', 'Бихте ли повторили, моля?'),
        answer: 'Könnten Sie das bitte wiederholen?',
        shape: 'sentence',
        hints: [],
      },
    ],
  }),
];

const B2 = [
  exercise({
    id: 'pl-b2',
    kind: 'type',
    level: 'b2',
    objective: bi('Register, and the passive', 'Регистър и страдателен залог'),
    mandatoryRetype: false,
    steps: [
      {
        id: 'pl-b2-1',
        prompt: bi('The report was submitted yesterday.', 'Докладът беше подаден вчера.'),
        answer: 'Der Bericht wurde gestern eingereicht.',
        shape: 'sentence',
        hints: [],
      },
      {
        id: 'pl-b2-2',
        prompt: bi('He says he has no time.', 'Той казва, че нямал време.'),
        answer: 'Er sagt, er habe keine Zeit.',
        shape: 'sentence',
        hints: [],
      },
      {
        id: 'pl-b2-3',
        prompt: bi('I am writing about the mould in the flat.', 'Пиша относно мухъла в жилището.'),
        answer: 'Ich schreibe wegen des Schimmels in der Wohnung.',
        alternatives: ['Ich schreibe Ihnen wegen des Schimmels in der Wohnung.'],
        shape: 'sentence',
        hints: [],
      },
      {
        id: 'pl-b2-4',
        prompt: bi('The longer we wait, the more expensive it gets.', 'Колкото по-дълго чакаме, толкова по-скъпо става.'),
        answer: 'Je länger wir warten, desto teurer wird es.',
        alternatives: ['Je länger wir warten, umso teurer wird es.'],
        shape: 'sentence',
        hints: [],
      },
    ],
  }),
];

export const PLACEMENT_CHECKPOINT: Checkpoint = {
  id: 'placement',
  scope: 'placement',
  targetId: 'course',
  status: 'available',
  /*
   * Not a pass mark.
   *
   * Every other checkpoint in the app has one, because passing a unit is a
   * real thing to have done. A placement check has nothing to pass: the score
   * is only the material the recommendation is derived from, and the result
   * screen reports the bands rather than a verdict. Zero says so honestly —
   * the alternative would be inventing a threshold that means nothing.
   */
  passAccuracy: 0,
  title: bi('Where should I start?', 'Откъде да започна?'),
  description: bi(
    'Twenty questions, four at each level, getting harder. Type what you can and skip nothing — leaving an answer blank is an answer too. At the end you get the breakdown, not a grade.',
    'Двайсет въпроса, по четири на всяко ниво, все по-трудни. Напиши каквото можеш и не прескачай — празният отговор също е отговор. Накрая получаваш разбивката, не оценка.',
  ),
  exercises: [...PRE_A1, ...A1, ...A2, ...B1, ...B2],
};
