import { bi, dictation, exercise, freeWriting, typeIt } from '../authoring.ts';
import type { Checkpoint } from '../types.ts';

/**
 * The A1 level checkpoint.
 *
 * Six units' worth of material with no hints and no scaffolds, in the order the
 * level taught it: people, home and the day, food, work and free time, getting
 * around, and appointments. It is harder than any unit checkpoint on purpose —
 * a unit checkpoint asks whether one idea landed, and this asks whether they
 * still hold together once the lesson that introduced them is weeks behind.
 *
 * The cases are the spine of A1 and the spine of this checkpoint: the
 * accusative from Unit 1 and the dative from Unit 5 are tested next to each
 * other in the article section, because telling them apart is the one skill a
 * learner cannot fake and the one that decides whether A2 is survivable.
 */
export const A1_LEVEL_CHECKPOINT: Checkpoint = {
  id: 'a1-level-checkpoint',
  scope: 'level',
  targetId: 'a1',
  status: 'available',
  passAccuracy: 0.8,
  title: bi('Level checkpoint: A1', 'Проверка на нивото: A1'),
  description: bi(
    'All six units with no hints: family, home, the day, food, work, getting around, appointments and the weather — and the cases that hold them together. 80% is needed to pass.',
    'И шестте раздела, без подсказки: семейство, дом, ежедневие, храна, работа, придвижване, срещи и времето — и падежите, които ги свързват. За успех са нужни 80%.',
  ),
  exercises: [
    typeIt('a1-lcp-1', bi('People and family', 'Хора и семейство'), [
      {
        prompt: bi('My grandfather comes from Austria.', 'Дядо ми е от Австрия.'),
        answer: 'Mein Opa kommt aus Österreich.',
        hints: [],
      },
      {
        prompt: bi('I know your uncle. (informal)', 'Познавам чичо ти.'),
        answer: 'Ich kenne deinen Onkel.',
        traps: [
          {
            answer: 'Ich kenne dein Onkel.',
            category: 'case',
            feedback: bi(
              'kennen takes an object, so the masculine possessive needs its accusative ending: deinen Onkel.',
              'kennen иска допълнение, затова притежателното в мъжки род взима окончание за винителен падеж: deinen Onkel.',
            ),
          },
        ],
        hints: [],
      },
      {
        prompt: bi('She does not have a brother.', 'Тя няма брат.'),
        answer: 'Sie hat keinen Bruder.',
        hints: [],
      },
      {
        prompt: bi('We are visiting his sister.', 'Посещаваме сестра му.'),
        answer: 'Wir besuchen seine Schwester.',
        hints: [],
      },
    ]),

    typeIt('a1-lcp-2', bi('Home and the day', 'Дом и ежедневие'), [
      {
        prompt: bi('There is a garden.', 'Има градина.'),
        answer: 'Es gibt einen Garten.',
        traps: [
          {
            answer: 'Es gibt ein Garten.',
            category: 'case',
            feedback: bi(
              'es gibt is always followed by an object, so a masculine noun takes einen: es gibt einen Garten.',
              'След es gibt винаги идва допълнение, затова мъжкият род взима einen: es gibt einen Garten.',
            ),
          },
        ],
        hints: [],
      },
      {
        prompt: bi('I get up at seven o’clock.', 'Ставам в седем часа.'),
        answer: 'Ich stehe um sieben Uhr auf.',
        hints: [],
      },
      {
        prompt: bi('In the evening I watch television.', 'Вечер гледам телевизия.'),
        answer: 'Am Abend sehe ich fern.',
        alternatives: ['Ich sehe am Abend fern.'],
        hints: [],
      },
      {
        prompt: bi('I have to work today.', 'Днес трябва да работя.'),
        answer: 'Ich muss heute arbeiten.',
        alternatives: ['Heute muss ich arbeiten.'],
        traps: [
          {
            answer: 'Ich muss heute arbeite.',
            category: 'verb-conjugation',
            feedback: bi(
              'After a modal the second verb stays in the infinitive and goes to the end: muss … arbeiten.',
              'След модален глагол вторият глагол остава в инфинитив и отива накрая: muss … arbeiten.',
            ),
          },
        ],
        hints: [],
      },
      {
        prompt: bi('Can you cook well? (informal)', 'Можеш ли да готвиш добре?'),
        answer: 'Kannst du gut kochen?',
        hints: [],
      },
    ]),

    typeIt('a1-lcp-3', bi('Food and shopping', 'Храна и пазаруване'), [
      {
        prompt: bi('I would like a coffee, please.', 'Бих искал едно кафе, моля.'),
        answer: 'Ich möchte einen Kaffee, bitte.',
        hints: [],
      },
      {
        prompt: bi('A glass of water, please.', 'Една чаша вода, моля.'),
        answer: 'Ein Glas Wasser, bitte.',
        hints: [],
      },
      {
        prompt: bi('What does the cake cost?', 'Колко струва тортата?'),
        answer: 'Was kostet der Kuchen?',
        alternatives: ['Wie viel kostet der Kuchen?'],
        hints: [],
      },
      {
        prompt: bi('I do not eat meat.', 'Не ям месо.'),
        answer: 'Ich esse kein Fleisch.',
        hints: [],
      },
    ]),

    typeIt('a1-lcp-4', bi('Work and free time', 'Работа и свободно време'), [
      {
        prompt: bi('I work as a teacher.', 'Работя като учител.'),
        answer: 'Ich arbeite als Lehrer.',
        hints: [],
      },
      {
        prompt: bi('I like listening to music.', 'Обичам да слушам музика.'),
        answer: 'Ich höre gern Musik.',
        hints: [],
      },
      {
        prompt: bi('I would rather read.', 'Предпочитам да чета.'),
        answer: 'Ich lese lieber.',
        hints: [],
      },
      {
        prompt: bi('I am tired, because I work a lot.', 'Уморен съм, защото работя много.'),
        answer: 'Ich bin müde, denn ich arbeite viel.',
        traps: [
          {
            answer: 'Ich bin müde, denn arbeite ich viel.',
            category: 'word-order',
            feedback: bi(
              'denn joins two main clauses and changes nothing after it: subject first, then the verb — denn ich arbeite viel.',
              'denn свързва две главни изречения и не променя нищо след себе си: първо подлогът, после глаголът — denn ich arbeite viel.',
            ),
          },
        ],
        hints: [],
      },
    ]),

    typeIt('a1-lcp-5', bi('Getting around', 'Придвижване'), [
      {
        prompt: bi('Where is the station?', 'Къде е гарата?'),
        answer: 'Wo ist der Bahnhof?',
        hints: [],
      },
      {
        prompt: bi('I travel by bus to the station.', 'Пътувам с автобус до гарата.'),
        answer: 'Ich fahre mit dem Bus zum Bahnhof.',
        hints: [],
      },
      {
        prompt: bi('I am going to the post office.', 'Отивам до пощата.'),
        answer: 'Ich gehe zur Post.',
        traps: [
          {
            answer: 'Ich gehe zum Post.',
            category: 'case',
            feedback: bi(
              'die Post is feminine, and feminine takes zur: Ich gehe zur Post.',
              'die Post е от женски род, а женският взима zur: Ich gehe zur Post.',
            ),
          },
        ],
        hints: [],
      },
      {
        prompt: bi('Excuse me, how do I get to the museum? (formal)', 'Извинете, как да стигна до музея?'),
        answer: 'Entschuldigen Sie, wie komme ich zum Museum?',
        hints: [],
      },
    ]),

    typeIt('a1-lcp-6', bi('Appointments, health and weather', 'Срещи, здраве и времето'), [
      {
        prompt: bi('I have an appointment at the doctor’s.', 'Имам час при лекаря.'),
        answer: 'Ich habe einen Termin beim Arzt.',
        hints: [],
      },
      {
        prompt: bi('I have a headache.', 'Боли ме главата.'),
        answer: 'Ich habe Kopfschmerzen.',
        hints: [],
      },
      {
        prompt: bi('It is raining.', 'Вали.'),
        answer: 'Es regnet.',
        traps: [
          {
            answer: 'Regnet.',
            category: 'missing-word',
            feedback: bi(
              'A German sentence needs a subject even when nothing could be one, so es has to be there: Es regnet.',
              'Немското изречение иска подлог дори когато няма какво да бъде подлог, затова es трябва да го има: Es regnet.',
            ),
          },
        ],
        hints: [],
      },
      {
        prompt: bi('Today it is cold and windy.', 'Днес е студено и ветровито.'),
        answer: 'Heute ist es kalt und windig.',
        alternatives: ['Es ist heute kalt und windig.'],
        hints: [],
      },
    ]),

    exercise({
      id: 'a1-lcp-7',
      kind: 'articleRecall',
      level: 'a1',
      objective: bi('The cases, side by side', 'Падежите един до друг'),
      mandatoryRetype: false,
      steps: [
        {
          prompt: bi('I need the table. (object)', 'Трябва ми масата. (допълнение)'),
          instruction: bi('Type the article only.', 'Напиши само члена.'),
          scaffold: 'Ich brauche ___ Tisch.',
          answer: 'den',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('I am travelling by car.', 'Пътувам с кола.'),
          instruction: bi('Type the article only.', 'Напиши само члена.'),
          scaffold: 'Ich fahre mit ___ Auto.',
          answer: 'dem',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('The museum is next to the park.', 'Музеят е до парка.'),
          instruction: bi('Type the article only.', 'Напиши само члена.'),
          scaffold: 'Das Museum ist neben ___ Park.',
          answer: 'dem',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('I am going to the pharmacy.', 'Отивам до аптеката.'),
          instruction: bi('Type the fused form.', 'Напиши слятата форма.'),
          scaffold: 'Ich gehe ___ Apotheke.',
          answer: 'zur',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('I am at the doctor’s.', 'При лекаря съм.'),
          instruction: bi('Type the fused form.', 'Напиши слятата форма.'),
          scaffold: 'Ich bin ___ Arzt.',
          answer: 'beim',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('She has no brother.', 'Тя няма брат.'),
          instruction: bi('Type the negative article only.', 'Напиши само отрицателния член.'),
          scaffold: 'Sie hat ___ Bruder.',
          answer: 'keinen',
          shape: 'word',
          hints: [],
        },
      ],
    }),

    dictation('a1-lcp-8', bi('Listening', 'Слушане'), [
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Ich muss früh aufstehen.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Wir fahren mit dem Auto zum Kino.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Ich möchte einen Termin.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Es ist kalt und windig.',
        shape: 'sentence',
        hints: [],
      },
    ]),

    freeWriting('a1-lcp-9', bi('Connected writing', 'Свързан текст'), [
      {
        prompt: bi(
          'Write five sentences about an ordinary day: when you get up, what you have to do, what you eat, how you get there, and what you do in the evening.',
          'Напиши пет изречения за един обикновен ден: кога ставаш, какво трябва да правиш, какво ядеш, как стигаш дотам и какво правиш вечер.',
        ),
        instruction: bi(
          'Use your own details. A separable verb, a modal and mit dem or zum have to appear somewhere.',
          'Използвай собствените си данни. Някъде трябва да се появят делим глагол, модален глагол и mit dem или zum.',
        ),
        answer:
          'Ich stehe um sieben Uhr auf. Ich muss heute arbeiten. Ich esse ein Brot. Ich fahre mit dem Bus zum Büro. Am Abend sehe ich fern.',
        shape: 'sentence',
        requiredTokens: ['auf', 'muss', 'mit', 'Abend'],
        hints: [],
      },
      {
        prompt: bi(
          'Write a short message cancelling an appointment: say you are ill, what is wrong, and ask for a new appointment.',
          'Напиши кратко съобщение, с което отказваш час: кажи, че си болен, какво ти е, и поискай нов час.',
        ),
        instruction: bi(
          'Three sentences is enough. This is Unit 6 doing the work of a real errand.',
          'Три изречения стигат. Това е раздел 6, който върши работата на истинска задача.',
        ),
        answer:
          'Ich bin krank. Ich habe Fieber. Ich möchte einen neuen Termin.',
        shape: 'sentence',
        requiredTokens: ['krank', 'Termin'],
        hints: [],
      },
    ]),
  ],
};
