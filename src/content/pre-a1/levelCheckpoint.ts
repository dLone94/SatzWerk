import { bi, dictation, exercise, freeWriting, typeIt } from '../authoring.ts';
import type { Checkpoint } from '../types.ts';

/**
 * The Pre-A1 level checkpoint.
 *
 * Deliberately broader and harder than a unit checkpoint: it mixes all six
 * units, runs without hints, and asks for a short piece of connected writing at
 * the end. Passing it is the honest claim that the level is done.
 */
export const PRE_A1_LEVEL_CHECKPOINT: Checkpoint = {
  id: 'pre-a1-level-checkpoint',
  scope: 'level',
  targetId: 'pre-a1',
  status: 'available',
  passAccuracy: 0.8,
  title: bi('Level checkpoint: Pre-A1', 'Проверка на нивото: Pre-A1'),
  description: bi(
    'Everything from the six units, with no hints: greetings, introductions, numbers, personal information, time, and the grammar that holds it together. 80% is needed to pass.',
    'Всичко от шестте раздела, без подсказки: поздрави, представяне, числа, лична информация, време и граматиката, която ги свързва. За успех са нужни 80%.',
  ),
  exercises: [
    typeIt('lcp-1', bi('Greetings and politeness', 'Поздрави и учтивост'), [
      {
        prompt: bi('It is 09:00. Greet a stranger politely.', '09:00 е. Поздрави учтиво непознат.'),
        answer: 'Guten Morgen',
        shape: 'phrase',
        hints: [],
      },
      {
        prompt: bi('You are going to bed.', 'Отиваш да спиш.'),
        answer: 'Gute Nacht',
        shape: 'phrase',
        hints: [],
      },
      {
        prompt: bi('Order a water politely.', 'Поръчай една вода учтиво.'),
        answer: 'Ein Wasser, bitte.',
        hints: [],
      },
    ]),

    typeIt('lcp-2', bi('Introducing yourself', 'Представяне'), [
      {
        prompt: bi('Ask an official for their name.', 'Попитай служител за името му.'),
        answer: 'Wie heißen Sie?',
        hints: [],
      },
      {
        prompt: bi('Say your name is Teo, using heißen.', 'Кажи, че се казваш Тео, с heißen.'),
        answer: 'Ich heiße Teo.',
        hints: [],
      },
      {
        prompt: bi('I come from Bulgaria.', 'Аз съм от България.'),
        answer: 'Ich komme aus Bulgarien.',
        hints: [],
      },
      {
        prompt: bi('Where do you live? (informal)', 'Къде живееш?'),
        answer: 'Wo wohnst du?',
        hints: [],
      },
    ]),

    typeIt('lcp-3', bi('Numbers', 'Числа'), [
      { prompt: bi('16', '16'), answer: 'sechzehn', shape: 'word', hints: [] },
      { prompt: bi('30', '30'), answer: 'dreißig', shape: 'word', hints: [] },
      { prompt: bi('47', '47'), answer: 'siebenundvierzig', shape: 'word', hints: [] },
      {
        prompt: bi('I am thirty-two years old.', 'Аз съм на трийсет и две години.'),
        answer: 'Ich bin zweiunddreißig Jahre alt.',
        hints: [],
      },
      {
        prompt: bi('How much does that cost?', 'Колко струва това?'),
        answer: 'Wie viel kostet das?',
        alternatives: ['Was kostet das?'],
        hints: [],
      },
    ]),

    typeIt('lcp-4', bi('Personal information', 'Лична информация'), [
      {
        prompt: bi('I speak Bulgarian and German.', 'Говоря български и немски.'),
        answer: 'Ich spreche Bulgarisch und Deutsch.',
        hints: [],
      },
      {
        prompt: bi('I am a teacher. (a woman speaking)', 'Аз съм учителка. (говори жена)'),
        answer: 'Ich bin Lehrerin.',
        hints: [],
      },
      {
        prompt: bi('What do you do for work? (informal)', 'С какво се занимаваш?'),
        answer: 'Was machst du beruflich?',
        hints: [],
      },
      {
        prompt: bi('I have a brother.', 'Имам един брат.'),
        answer: 'Ich habe einen Bruder.',
        hints: [],
      },
    ]),

    typeIt('lcp-5', bi('Time', 'Време'), [
      {
        prompt: bi('On Monday I work.', 'В понеделник работя.'),
        answer: 'Am Montag arbeite ich.',
        alternatives: ['Ich arbeite am Montag.'],
        hints: [],
      },
      {
        prompt: bi('My birthday is in May.', 'През май имам рожден ден.'),
        answer: 'Im Mai habe ich Geburtstag.',
        alternatives: ['Ich habe im Mai Geburtstag.'],
        hints: [],
      },
      {
        prompt: bi('It is 7:30.', 'Часът е седем и половина.'),
        answer: 'Es ist halb acht.',
        hints: [],
      },
      {
        prompt: bi('I work at eight o’clock.', 'Работя в осем часа.'),
        answer: 'Ich arbeite um acht Uhr.',
        hints: [],
      },
    ]),

    typeIt('lcp-6', bi('Grammar under pressure', 'Граматика под напрежение'), [
      {
        prompt: bi('I do not have a sister.', 'Нямам сестра.'),
        answer: 'Ich habe keine Schwester.',
        hints: [],
      },
      {
        prompt: bi('I do not live in Berlin.', 'Не живея в Берлин.'),
        answer: 'Ich wohne nicht in Berlin.',
        hints: [],
      },
      {
        prompt: bi('Who is that?', 'Кой е това?'),
        answer: 'Wer ist das?',
        hints: [],
      },
      {
        prompt: bi('Do you live in Hamburg? (informal)', 'Живееш ли в Хамбург?'),
        answer: 'Wohnst du in Hamburg?',
        hints: [],
      },
      {
        prompt: bi('You (all) are teachers.', 'Вие сте учители.'),
        answer: 'Ihr seid Lehrer.',
        hints: [],
      },
    ]),

    exercise({
      id: 'lcp-7',
      kind: 'articleRecall',
      objective: bi('Articles and plurals', 'Членове и множествено число'),
      mandatoryRetype: false,
      steps: [
        {
          prompt: bi('the table', 'масата'),
          instruction: bi('Type the article only.', 'Напиши само члена.'),
          scaffold: '___ Tisch',
          answer: 'der',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('the city', 'градът'),
          instruction: bi('Type the article only.', 'Напиши само члена.'),
          scaffold: '___ Stadt',
          answer: 'die',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('the water', 'водата'),
          instruction: bi('Type the article only.', 'Напиши само члена.'),
          scaffold: '___ Wasser',
          answer: 'das',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('daughters', 'дъщери'),
          instruction: bi('With the article.', 'С члена.'),
          answer: 'die Töchter',
          shape: 'phrase',
          hints: [],
        },
      ],
    }),

    dictation('lcp-8', bi('Listening', 'Слушане'), [
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Ich komme aus Deutschland.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Es ist Viertel vor neun.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Ich habe keine Geschwister.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type the number you hear.', 'Напиши числото, което чуваш.'),
        answer: 'einundzwanzig',
        shape: 'word',
        hints: [],
      },
    ]),

    freeWriting('lcp-9', bi('Connected writing', 'Свързан текст'), [
      {
        prompt: bi(
          'Introduce yourself in five sentences: greet, your name, where you come from, where you live, and what you do.',
          'Представи се в пет изречения: поздрав, име, откъде си, къде живееш и с какво се занимаваш.',
        ),
        instruction: bi(
          'This is the whole level in one paragraph. Use your own details.',
          'Това е цялото ниво в един абзац. Използвай собствените си данни.',
        ),
        answer: 'Guten Tag! Ich heiße Teo. Ich komme aus Bulgarien. Ich wohne in Hamburg. Ich bin Ingenieur.',
        shape: 'sentence',
        requiredTokens: ['heiße', 'komme', 'wohne', 'bin'],
        hints: [],
      },
    ]),
  ],
};
