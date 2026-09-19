import { bi, dictation, exercise, freeWriting, typeIt } from '../authoring.ts';
import type { Checkpoint } from '../types.ts';

/**
 * The A2 level checkpoint.
 *
 * Harder than any A2 unit checkpoint, with no hints, and built around the two
 * things that decide whether B1 is survivable.
 *
 * The first is word order. A2 taught three conjunctions that do the same thing
 * to the verb and one consequence — a clause in first position pushes the main
 * verb to just after the comma — and B1 assumes all of it silently. So weil,
 * dass and wenn are tested together, in both orders, in the same exercise.
 *
 * The second is the auxiliary. haben or sein is a decision the learner makes
 * every time they talk about the past for the rest of their German, and a
 * checkpoint that let it slide would be lying about what the level was for.
 */
export const A2_LEVEL_CHECKPOINT: Checkpoint = {
  id: 'a2-level-checkpoint',
  scope: 'level',
  targetId: 'a2',
  status: 'available',
  passAccuracy: 0.8,
  title: bi('Level checkpoint: A2', 'Проверка на нивото: A2'),
  description: bi(
    'All five units with no hints: the past tense, the three conjunctions that move the verb, the two-way prepositions, reflexive verbs and comparison. 80% is needed to pass.',
    'И петте раздела, без подсказки: минало време, трите съюза, които местят глагола, двупосочните предлози, възвратните глаголи и сравнението. За успех са нужни 80%.',
  ),
  exercises: [
    typeIt('a2-lcp-1', bi('The past, with both helpers', 'Миналото, с двата помощни глагола'), [
      {
        prompt: bi('I worked yesterday.', 'Вчера работих.'),
        answer: 'Ich habe gestern gearbeitet.',
        alternatives: ['Gestern habe ich gearbeitet.'],
        hints: [],
      },
      {
        prompt: bi('I went to Berlin.', 'Отидох до Берлин.'),
        answer: 'Ich bin nach Berlin gefahren.',
        hints: [],
      },
      {
        prompt: bi('We stayed at home.', 'Останахме вкъщи.'),
        answer: 'Wir sind zu Hause geblieben.',
        hints: [],
      },
      {
        prompt: bi('Last weekend I was in Berlin.', 'Миналия уикенд бях в Берлин.'),
        answer: 'Letztes Wochenende war ich in Berlin.',
        alternatives: ['Ich war letztes Wochenende in Berlin.'],
        hints: [],
      },
      {
        prompt: bi('There was a concert.', 'Имаше концерт.'),
        answer: 'Es gab ein Konzert.',
        hints: [],
      },
    ]),

    typeIt('a2-lcp-2', bi('The verb at the end', 'Глаголът в края'), [
      {
        prompt: bi('I am calling because the heating is broken.', 'Обаждам се, защото отоплението е счупено.'),
        answer: 'Ich rufe an, weil die Heizung kaputt ist.',
        hints: [],
      },
      {
        prompt: bi('I think that German is hard.', 'Мисля, че немският е труден.'),
        answer: 'Ich glaube, dass Deutsch schwer ist.',
        hints: [],
      },
      {
        prompt: bi('I study German when I have time.', 'Уча немски, когато имам време.'),
        answer: 'Ich lerne Deutsch, wenn ich Zeit habe.',
        hints: [],
      },
      {
        prompt: bi('When I have time, I study German.', 'Когато имам време, уча немски.'),
        answer: 'Wenn ich Zeit habe, lerne ich Deutsch.',
        hints: [],
      },
    ]),

    typeIt('a2-lcp-3', bi('Where things are, where they go', 'Къде са нещата и накъде отиват'), [
      {
        prompt: bi('The lamp is in the corner.', 'Лампата е в ъгъла.'),
        answer: 'Die Lampe steht in der Ecke.',
        hints: [],
      },
      {
        prompt: bi('I am putting the lamp in the corner.', 'Слагам лампата в ъгъла.'),
        answer: 'Ich stelle die Lampe in die Ecke.',
        hints: [],
      },
      {
        prompt: bi('The book is on the table.', 'Книгата е на масата.'),
        answer: 'Das Buch liegt auf dem Tisch.',
        hints: [],
      },
      {
        prompt: bi('I am hanging the picture on the wall.', 'Закачам картината на стената.'),
        answer: 'Ich hänge das Bild an die Wand.',
        hints: [],
      },
    ]),

    typeIt('a2-lcp-4', bi('How you feel, and what to do', 'Как се чувстваш и какво да правиш'), [
      {
        prompt: bi('I do not feel well.', 'Не се чувствам добре.'),
        answer: 'Ich fühle mich nicht gut.',
        hints: [],
      },
      {
        prompt: bi('He feels better.', 'Той се чувства по-добре.'),
        answer: 'Er fühlt sich besser.',
        hints: [],
      },
      {
        prompt: bi('You should drink a lot of tea.', 'Трябва да пиеш много чай.'),
        answer: 'Du sollst viel Tee trinken.',
        hints: [],
      },
      {
        prompt: bi('Go to the doctor!', 'Иди на лекар!'),
        answer: 'Geh zum Arzt!',
        hints: [],
      },
    ]),

    typeIt('a2-lcp-5', bi('Comparing', 'Сравняване'), [
      {
        prompt: bi('The train is faster than the bus.', 'Влакът е по-бърз от автобуса.'),
        answer: 'Der Zug ist schneller als der Bus.',
        hints: [],
      },
      {
        prompt: bi('The city is more interesting than the village.', 'Градът е по-интересен от селото.'),
        answer: 'Die Stadt ist interessanter als das Dorf.',
        hints: [],
      },
      {
        prompt: bi('That was the best hotel.', 'Това беше най-добрият хотел.'),
        answer: 'Das war das beste Hotel.',
        hints: [],
      },
      {
        prompt: bi('The train is the fastest.', 'Влакът е най-бърз.'),
        answer: 'Der Zug ist am schnellsten.',
        hints: [],
      },
    ]),

    /*
     * The two decisions A2 exists to make automatic, side by side: which helper
     * a verb takes, and which case a two-way preposition wants. Both are asked
     * for as single words, so there is nowhere to hide behind a sentence that
     * happens to sound right.
     */
    exercise({
      id: 'a2-lcp-6',
      kind: 'fillBlank',
      level: 'a2',
      objective: bi('The decisions, one word each', 'Решенията, по една дума'),
      steps: [
        {
          prompt: bi('I cooked.', 'Готвих.'),
          scaffold: 'Ich ___ gekocht.',
          answer: 'habe',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('I walked there.', 'Отидох пеша.'),
          scaffold: 'Ich ___ zu Fuß gegangen.',
          answer: 'bin',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('The lamp is in the corner.', 'Лампата е в ъгъла.'),
          instruction: bi('Type the article only.', 'Напиши само члена.'),
          scaffold: 'Die Lampe steht in ___ Ecke.',
          answer: 'der',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('I am putting the lamp into the corner.', 'Слагам лампата в ъгъла.'),
          instruction: bi('Type the article only.', 'Напиши само члена.'),
          scaffold: 'Ich stelle die Lampe in ___ Ecke.',
          answer: 'die',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('She does not feel well.', 'Тя не се чувства добре.'),
          scaffold: 'Sie fühlt ___ nicht gut.',
          answer: 'sich',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('the fast train (object) — schnell', 'бързия влак (допълнение) — schnell'),
          scaffold: 'Ich nehme den ___ Zug.',
          answer: 'schnellen',
          shape: 'word',
          hints: [],
        },
      ],
    }),

    dictation('a2-lcp-7', bi('Listening', 'Слушане'), [
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Ich bin nach Berlin gefahren.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Ich rufe an, weil die Heizung kaputt ist.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Ich fühle mich nicht gut.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Der Zug hat Verspätung.',
        shape: 'sentence',
        hints: [],
      },
    ]),

    freeWriting('a2-lcp-8', bi('Connected writing', 'Свързан текст'), [
      {
        prompt: bi(
          'Tell the story of a weekend away in five sentences: where you went, what you did, what went wrong, why, and how it compared with another time.',
          'Разкажи за един уикенд извън дома в пет изречения: къде отиде, какво прави, какво се обърка, защо и как беше в сравнение с друг път.',
        ),
        instruction: bi(
          'This is the whole level in one paragraph. Both helpers, a weil, and a comparative have to appear.',
          'Това е цялото ниво в един абзац. Трябва да се появят и двата помощни глагола, weil и сравнителна степен.',
        ),
        answer:
          'Letztes Wochenende bin ich nach München gefahren. Ich habe Freunde besucht. Ich habe den Zug verpasst, weil der Bus Verspätung hatte. Der nächste Zug war langsamer. Die Reise war schlechter als letztes Jahr.',
        shape: 'sentence',
        requiredTokens: ['bin', 'habe', 'weil', 'als'],
        hints: [],
      },
    ]),
  ],
};
