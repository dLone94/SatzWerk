import {
  bi,
  dictation,
  exercise,
  fillBlank,
  freeWriting,
  nounWithArticle,
  partialRecall,
  typeIt,
  wordOrder,
} from '../authoring.ts';
import type { Checkpoint, Exercise, Lesson, SentencePattern, Unit } from '../types.ts';

/**
 * A1 Unit 2 — Home and daily life.
 *
 * One structural idea runs through the whole unit: the German sentence bracket.
 * Lesson 2 meets it as a separable verb (Ich stehe um sieben Uhr **auf**) and
 * Lesson 3 meets it as a modal (Ich muss heute **arbeiten**), which are the same
 * shape twice. Teaching them as two unrelated topics is the usual way and it
 * wastes the insight.
 *
 * Lesson 1 looks like plain vocabulary and is not: rooms and furniture are
 * mostly masculine and neuter, and `es gibt` takes an object, so every sentence
 * about a flat is another repetition of Unit 1's accusative. New content should
 * keep old content alive rather than replacing it.
 */

/** The shorthands default to pre-a1; everything in this file is A1. */
const a1 = (ex: Exercise): Exercise => ({ ...ex, level: 'a1' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-es-gibt',
    template: 'Es gibt ___.',
    example: 'Es gibt einen Garten.',
    gloss: bi('There is / are ___.', 'Има ___.'),
    level: 'a1',
    grammarIds: ['g-es-gibt'],
  },
  {
    id: 'p-ich-stehe-auf',
    template: 'Ich ___ um ___ Uhr ___.',
    example: 'Ich stehe um sieben Uhr auf.',
    gloss: bi('I get up at ___ o’clock.', 'Ставам в ___ часа.'),
    level: 'a1',
    grammarIds: ['g-separable-verbs'],
  },
  {
    id: 'p-ich-muss',
    template: 'Ich muss ___ ___.',
    example: 'Ich muss heute arbeiten.',
    gloss: bi('I have to ___ today.', 'Днес трябва да ___.'),
    level: 'a1',
    grammarIds: ['g-modal-verbs'],
  },
  {
    id: 'p-kannst-du',
    template: 'Kannst du ___?',
    example: 'Kannst du gut kochen?',
    gloss: bi('Can you ___?', 'Можеш ли да ___?'),
    level: 'a1',
    grammarIds: ['g-modal-verbs'],
  },
];

/* ================================================================== *
 * Lesson 1 — where you live
 * ================================================================== */

const lesson1: Lesson = {
  id: 'a1-u2-l1',
  unitId: 'a1-u2',
  level: 'a1',
  order: 1,
  status: 'available',
  estimatedMinutes: 20,
  title: bi('Your home', 'Твоят дом'),
  objective: bi(
    'After this lesson you will be able to describe where you live, name the rooms and say what there is and is not, using es gibt.',
    'След този урок ще можеш да опишеш къде живееш, да назовеш стаите и да кажеш какво има и какво няма, използвайки es gibt.',
  ),
  outcomes: [
    bi('I can name the rooms of a home.', 'Мога да назова стаите в дома.'),
    bi('I can say what there is with es gibt.', 'Мога да кажа какво има с es gibt.'),
    bi('I can describe something as big, small or new.', 'Мога да опиша нещо като голямо, малко или ново.'),
    bi('I know that a compound noun takes the gender of its last part.', 'Знам, че сложното съществително взима рода на последната си част.'),
  ],
  vocabIds: [
    'v-wohnung',
    'v-zimmer',
    'v-kueche',
    'v-bad',
    'v-schlafzimmer',
    'v-wohnzimmer',
    'v-bett',
    'v-stuhl',
    'v-schrank',
    'v-fenster',
    'v-tuer',
    'v-garten',
    'v-gross',
    'v-klein',
    'v-neu',
  ],
  grammarIds: ['g-es-gibt'],
  sections: [
    {
      id: 'a1u2l1-intro',
      kind: 'intro',
      title: bi('Somewhere to put the words', 'Място, където да сложиш думите'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Your home is the easiest thing to practise with, because you are standing in it. This lesson gives you the rooms, the furniture and one very common little phrase: es gibt.',
            'Домът ти е най-лесното нещо за упражняване, защото си вътре в него. Този урок ти дава стаите, мебелите и една много често използвана кратка фраза: es gibt.',
          ),
        },
      ],
    },
    {
      id: 'a1u2l1-vocab',
      kind: 'vocabulary',
      title: bi('Rooms and furniture', 'Стаи и мебели'),
      vocabIds: [
        'v-wohnung',
        'v-zimmer',
        'v-kueche',
        'v-bad',
        'v-schlafzimmer',
        'v-wohnzimmer',
        'v-bett',
        'v-stuhl',
        'v-schrank',
        'v-fenster',
        'v-tuer',
        'v-garten',
      ],
      blocks: [
        {
          t: 'p',
          text: bi(
            'Two of these are compound words, and they come with a rule that will save you a great deal of guessing.',
            'Две от тези думи са сложни и идват с правило, което ще ти спести много гадаене.',
          ),
        },
        {
          t: 'callout',
          tone: 'tip',
          title: bi('A compound takes the gender of its last part', 'Сложната дума взима рода на последната си част'),
          text: bi(
            'das Zimmer, so das Schlafzimmer and das Wohnzimmer. This rule has no exceptions, which makes it one of the most valuable things to know about German gender.',
            'das Zimmer, значи das Schlafzimmer и das Wohnzimmer. Това правило няма изключения, което го прави едно от най-ценните неща за немския род.',
          ),
        },
        {
          t: 'callout',
          tone: 'compare',
          only: ['bg'],
          text: bi(
            '',
            'Родовете тук се разминават често: „стая“ е женски, а das Zimmer е среден; „прозорец“ е мъжки, а das Fenster е среден. Не превеждай рода — учи члена заедно с думата.',
          ),
        },
      ],
    },
    {
      id: 'a1u2l1-grammar',
      kind: 'grammar',
      title: bi('es gibt', 'es gibt'),
      blocks: [],
      grammarId: 'g-es-gibt',
    },
    {
      id: 'a1u2l1-describe',
      kind: 'examples',
      title: bi('Big, small, new', 'Голям, малък, нов'),
      blocks: [
        { t: 'de', de: 'Meine Wohnung ist klein.', gloss: bi('My flat is small.', 'Апартаментът ми е малък.') },
        { t: 'de', de: 'Das Haus ist sehr groß.', gloss: bi('The house is very big.', 'Къщата е много голяма.') },
        { t: 'de', de: 'Der Schrank ist neu.', gloss: bi('The wardrobe is new.', 'Гардеробът е нов.') },
        {
          t: 'callout',
          tone: 'tip',
          text: bi(
            'After ist, an adjective never changes: der Schrank ist neu, die Küche ist neu, das Bett ist neu. Adjectives in front of a noun are a later lesson.',
            'След ist прилагателното никога не се мени: der Schrank ist neu, die Küche ist neu, das Bett ist neu. Прилагателните пред съществително са за по-късен урок.',
          ),
        },
      ],
    },
    {
      id: 'a1u2l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('es gibt never changes, and what follows it is an object.', 'es gibt никога не се мени, а това, което следва, е допълнение.'),
            bi('Masculine after es gibt: einen, keinen.', 'Мъжки род след es gibt: einen, keinen.'),
            bi('A compound noun takes the gender of its last part.', 'Сложното съществително взима рода на последната си част.'),
            bi('After ist, the adjective stays as it is.', 'След ist прилагателното си остава каквото е.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      nounWithArticle('a1u2l1-ex1', bi('The rooms', 'Стаите'), [
        { prompt: bi('kitchen', 'кухня'), bare: 'Küche', withArticle: 'die Küche', vocabId: 'v-kueche' },
        { prompt: bi('bedroom', 'спалня'), bare: 'Schlafzimmer', withArticle: 'das Schlafzimmer', vocabId: 'v-schlafzimmer', hint: bi('It ends in Zimmer.', 'Завършва на Zimmer.') },
        { prompt: bi('chair', 'стол'), bare: 'Stuhl', withArticle: 'der Stuhl', vocabId: 'v-stuhl' },
        { prompt: bi('window', 'прозорец'), bare: 'Fenster', withArticle: 'das Fenster', vocabId: 'v-fenster' },
      ]),
    ),
    a1(
      fillBlank('a1u2l1-ex2', bi('What is there?', 'Какво има?'), [
        {
          prompt: bi('There is a garden.', 'Има градина.'),
          scaffold: 'Es gibt ___ Garten.',
          answer: 'einen',
          shape: 'word',
          reviewTargets: ['g-es-gibt', 'v-garten', 'p-es-gibt'],
          hints: [
            bi('Garten is masculine: der Garten.', 'Garten е мъжки род: der Garten.'),
            bi('What there is, is the object.', 'Това, което го има, е допълнение.'),
          ],
          traps: [
            {
              answer: 'ein',
              category: 'case',
              feedback: bi(
                'es gibt takes an object, so a masculine noun becomes einen — the same ending you use after haben.',
                'es gibt взима допълнение, затова съществителното от мъжки род става einen — същото окончание като след haben.',
              ),
            },
          ],
        },
        {
          prompt: bi('There is no wardrobe.', 'Няма гардероб.'),
          scaffold: 'Es gibt ___ Schrank.',
          answer: 'keinen',
          shape: 'word',
          reviewTargets: ['g-es-gibt', 'v-schrank'],
          hints: [bi('kein takes the endings of ein.', 'kein взима окончанията на ein.')],
        },
        {
          prompt: bi('There is a kitchen.', 'Има кухня.'),
          scaffold: 'Es gibt ___ Küche.',
          answer: 'eine',
          shape: 'word',
          reviewTargets: ['g-es-gibt', 'v-kueche'],
          hints: [bi('Küche is feminine, which never changes.', 'Küche е женски род, който не се мени.')],
          traps: [
            {
              answer: 'einen',
              category: 'case',
              feedback: bi(
                'Only masculine takes einen. Küche is feminine, so it stays eine — object or not.',
                'Само мъжкият род взима einen. Küche е женски род, затова остава eine — независимо дали е допълнение.',
              ),
            },
          ],
        },
      ]),
    ),
    a1(
      typeIt(
        'a1u2l1-ex3',
        bi('Describe your home', 'Опиши дома си'),
        [
          {
            prompt: bi('My flat is small.', 'Апартаментът ми е малък.'),
            answer: 'Meine Wohnung ist klein.',
            reviewTargets: ['v-wohnung', 'v-klein'],
            hints: [],
          },
          {
            prompt: bi('The bathroom is very small.', 'Банята е много малка.'),
            answer: 'Das Bad ist sehr klein.',
            reviewTargets: ['v-bad'],
            hints: [],
          },
          {
            prompt: bi('There are three rooms.', 'Има три стаи.'),
            answer: 'Es gibt drei Zimmer.',
            reviewTargets: ['g-es-gibt', 'v-zimmer'],
            hints: [bi('The plural of Zimmer looks the same.', 'Множественото на Zimmer изглежда същото.')],
          },
          {
            prompt: bi('We have a garden.', 'Имаме градина.'),
            answer: 'Wir haben einen Garten.',
            reviewTargets: ['v-garten'],
            hints: [],
          },
        ],
        ['g-es-gibt'],
      ),
    ),
    a1(
      partialRecall('a1u2l1-ex4', bi('Finish the word', 'Довърши думата'), [
        {
          prompt: bi('The bed is new.', 'Леглото е ново.'),
          scaffold: 'Das B___ ist neu.',
          answer: 'Bett',
          shape: 'word',
          reviewTargets: ['v-bett'],
          hints: [],
        },
        {
          prompt: bi('The door is small.', 'Вратата е малка.'),
          scaffold: 'Die T___ ist klein.',
          answer: 'Tür',
          shape: 'word',
          reviewTargets: ['v-tuer'],
          hints: [bi('It needs an umlaut.', 'Трябва умлаут.')],
        },
      ]),
    ),
    a1(
      dictation('a1u2l1-ex5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Es gibt einen Garten.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Küche ist sehr klein.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      a1(
        typeIt('a1u2l1-m1', bi('Mastery: your home', 'Проверка: твоят дом'), [
          {
            prompt: bi('There is no garden.', 'Няма градина.'),
            answer: 'Es gibt keinen Garten.',
            hints: [],
          },
          {
            prompt: bi('My bedroom is big.', 'Спалнята ми е голяма.'),
            answer: 'Mein Schlafzimmer ist groß.',
            hints: [],
          },
          {
            prompt: bi('I need a chair.', 'Трябва ми стол.'),
            answer: 'Ich brauche einen Stuhl.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 — the day, and the separable verb
 * ================================================================== */

const lesson2: Lesson = {
  id: 'a1-u2-l2',
  unitId: 'a1-u2',
  level: 'a1',
  order: 2,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('Your day, and verbs that split', 'Твоят ден и глаголите, които се разделят'),
  objective: bi(
    'After this lesson you will be able to describe your day with separable verbs, putting the second half of the verb at the end where it belongs.',
    'След този урок ще можеш да опишеш деня си с делими глаголи, поставяйки втората половина на глагола в края, където ѝ е мястото.',
  ),
  outcomes: [
    bi('I can describe my daily routine.', 'Мога да опиша ежедневието си.'),
    bi('I can split a separable verb correctly.', 'Мога да разделя правилно делим глагол.'),
    bi('I can say how often I do something.', 'Мога да кажа колко често правя нещо.'),
    bi('I can put a time phrase first and keep the verb in second position.', 'Мога да сложа израз за време отпред и да запазя глагола на второ място.'),
  ],
  vocabIds: [
    'v-aufstehen',
    'v-einkaufen',
    'v-fernsehen',
    'v-aufraeumen',
    'v-anfangen',
    'v-schlafen',
    'v-essen',
    'v-trinken',
    'v-kochen',
    'v-fruehstueck',
    'v-am-morgen',
    'v-abend',
    'v-immer',
    'v-oft',
    'v-manchmal',
    'v-nie',
    'v-frueh',
    'v-spaet',
  ],
  grammarIds: ['g-separable-verbs'],
  sections: [
    {
      id: 'a1u2l2-intro',
      kind: 'intro',
      title: bi('A verb in two pieces', 'Глагол на две части'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'This is the lesson where German stops resembling a rearranged version of your language. Some verbs come apart, and the second half waits at the end of the sentence.',
            'Това е урокът, в който немският спира да прилича на пренаредена версия на твоя език. Някои глаголи се разделят и втората половина чака в края на изречението.',
          ),
        },
      ],
    },
    {
      id: 'a1u2l2-grammar',
      kind: 'grammar',
      title: bi('Separable verbs', 'Делими глаголи'),
      blocks: [],
      grammarId: 'g-separable-verbs',
    },
    {
      id: 'a1u2l2-vocab',
      kind: 'vocabulary',
      title: bi('Through the day', 'През деня'),
      vocabIds: [
        'v-aufstehen',
        'v-fruehstueck',
        'v-einkaufen',
        'v-kochen',
        'v-essen',
        'v-trinken',
        'v-aufraeumen',
        'v-fernsehen',
        'v-anfangen',
        'v-schlafen',
      ],
      blocks: [
        {
          t: 'p',
          text: bi(
            'Five of these verbs are separable: aufstehen, einkaufen, aufräumen, fernsehen, anfangen. You can spot them by the small word at the front.',
            'Пет от тези глаголи са делими: aufstehen, einkaufen, aufräumen, fernsehen, anfangen. Разпознаваш ги по малката дума отпред.',
          ),
        },
      ],
    },
    {
      id: 'a1u2l2-frequency',
      kind: 'examples',
      title: bi('How often', 'Колко често'),
      blocks: [
        { t: 'de', de: 'Ich stehe immer früh auf.', gloss: bi('I always get up early.', 'Винаги ставам рано.') },
        { t: 'de', de: 'Wir kochen oft zusammen.', gloss: bi('We often cook together.', 'Често готвим заедно.') },
        { t: 'de', de: 'Ich sehe nie fern.', gloss: bi('I never watch television.', 'Никога не гледам телевизия.') },
        {
          t: 'callout',
          tone: 'warn',
          only: ['bg'],
          text: bi(
            '',
            'Тук българският ще те подведе. „Никога не гледам телевизия“ има две отрицания — „никога“ и „не“. Немският слага само едно: „Ich sehe nie fern“. Добавянето на nicht е грешка.',
          ),
        },
        {
          t: 'callout',
          tone: 'tip',
          only: ['en'],
          text: bi(
            'These words sit in the middle of the sentence, between the two halves of the verb: "Ich stehe immer früh auf." English puts them in much the same place, so this one is easy.',
            '',
          ),
        },
      ],
    },
    {
      id: 'a1u2l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('The small word at the front breaks off and goes to the end.', 'Малката дума отпред се отделя и отива в края.'),
            bi('Never write the verb whole inside a sentence.', 'Никога не пиши глагола цял вътре в изречението.'),
            bi('A time phrase can come first, but then the verb is still second.', 'Изразът за време може да е отпред, но глаголът пак е втори.'),
            bi('nie is enough on its own — no nicht.', 'nie стига само по себе си — без nicht.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      wordOrder('a1u2l2-ex1', bi('Put the verb where it belongs', 'Сложи глагола на мястото му'), [
        {
          prompt: bi('I get up at seven o’clock.', 'Ставам в седем часа.'),
          bank: ['Ich', 'stehe', 'um', 'sieben', 'Uhr', 'auf'],
          answer: 'Ich stehe um sieben Uhr auf.',
          hints: [
            bi('The auf goes last.', 'auf отива най-накрая.'),
            bi('stehe is in second position, as always.', 'stehe е на второ място, както винаги.'),
          ],
        },
        {
          prompt: bi('I tidy up my room.', 'Разтребвам стаята си.'),
          bank: ['Ich', 'räume', 'mein', 'Zimmer', 'auf'],
          answer: 'Ich räume mein Zimmer auf.',
          hints: [bi('The object sits inside the bracket.', 'Допълнението стои вътре в рамката.')],
        },
        {
          prompt: bi('Work starts at eight o’clock.', 'Работата започва в осем часа.'),
          bank: ['Die', 'Arbeit', 'fängt', 'um', 'acht', 'Uhr', 'an'],
          answer: 'Die Arbeit fängt um acht Uhr an.',
          hints: [bi('anfangen is irregular: er fängt an.', 'anfangen е неправилен: er fängt an.')],
        },
      ]),
    ),
    a1(
      typeIt(
        'a1u2l2-ex2',
        bi('Your own day', 'Твоят собствен ден'),
        [
          {
            prompt: bi('I get up early.', 'Ставам рано.'),
            answer: 'Ich stehe früh auf.',
            reviewTargets: ['v-aufstehen', 'p-ich-stehe-auf'],
            hints: [],
            traps: [
              {
                answer: 'Ich aufstehe früh.',
                category: 'word-order',
                feedback: bi(
                  'The verb has to come apart: stehe in second position, auf at the end. "Ich aufstehe" is not German at all.',
                  'Глаголът трябва да се раздели: stehe на второ място, auf в края. „Ich aufstehe“ изобщо не е немски.',
                ),
              },
            ],
          },
          {
            prompt: bi('In the evening I watch television.', 'Вечер гледам телевизия.'),
            answer: 'Am Abend sehe ich fern.',
            alternatives: ['Ich sehe am Abend fern.'],
            reviewTargets: ['v-fernsehen', 'v-abend'],
            hints: [
              bi('Start with the time phrase, then the verb, then ich.', 'Започни с израза за време, после глагола, после ich.'),
            ],
            traps: [
              {
                answer: 'Am Abend ich sehe fern.',
                category: 'word-order',
                feedback: bi(
                  'When something else comes first, the verb still has to be the second thing in the sentence — so it swaps with ich: Am Abend sehe ich fern.',
                  'Когато нещо друго е отпред, глаголът пак трябва да е втората част на изречението — затова се разменя с ich: Am Abend sehe ich fern.',
                ),
              },
            ],
          },
          {
            prompt: bi('We often cook together.', 'Често готвим заедно.'),
            answer: 'Wir kochen oft zusammen.',
            reviewTargets: ['v-kochen', 'v-oft'],
            hints: [],
          },
          {
            prompt: bi('I never watch television.', 'Никога не гледам телевизия.'),
            answer: 'Ich sehe nie fern.',
            reviewTargets: ['v-nie', 'v-fernsehen'],
            hints: [bi('One negative word is enough.', 'Една отрицателна дума стига.')],
            traps: [
              {
                answer: 'Ich sehe nicht nie fern.',
                category: 'extra-word',
                feedback: bi(
                  'nie already means never, so nicht is one negative too many. German uses one: Ich sehe nie fern.',
                  'nie вече значи „никога“, така че nicht е излишно отрицание. Немският слага само едно: Ich sehe nie fern.',
                ),
              },
            ],
          },
        ],
        ['g-separable-verbs'],
      ),
    ),
    a1(
      fillBlank('a1u2l2-ex3', bi('Where does the second half go?', 'Къде отива втората половина?'), [
        {
          prompt: bi('I do the shopping on Saturday.', 'Пазарувам в събота.'),
          scaffold: 'Ich kaufe am Samstag ___.',
          answer: 'ein',
          shape: 'word',
          reviewTargets: ['v-einkaufen', 'g-separable-verbs'],
          hints: [bi('The verb is einkaufen.', 'Глаголът е einkaufen.')],
        },
        {
          prompt: bi('My sister gets up late.', 'Сестра ми става късно.'),
          scaffold: 'Meine Schwester steht spät ___.',
          answer: 'auf',
          shape: 'word',
          reviewTargets: ['v-aufstehen'],
          hints: [],
        },
        {
          prompt: bi('The film starts at eight.', 'Филмът започва в осем.'),
          scaffold: 'Die Arbeit fängt um acht ___.',
          answer: 'an',
          shape: 'word',
          reviewTargets: ['v-anfangen'],
          hints: [],
        },
      ]),
    ),
    a1(
      partialRecall('a1u2l2-ex4', bi('The verb form', 'Формата на глагола'), [
        {
          prompt: bi('She sleeps a lot. (schlafen is irregular)', 'Тя спи много. (schlafen е неправилен)'),
          scaffold: 'Sie schl___ viel.',
          answer: 'schläft',
          shape: 'word',
          reviewTargets: ['v-schlafen'],
          hints: [bi('The a takes an umlaut.', 'Гласната a взима умлаут.')],
        },
        {
          prompt: bi('He eats at one.', 'Той яде в един.'),
          scaffold: 'Er ___ um eins.',
          answer: 'isst',
          shape: 'word',
          reviewTargets: ['v-essen'],
          hints: [bi('essen is irregular: e becomes i.', 'essen е неправилен: e става i.')],
        },
      ]),
    ),
    a1(
      dictation('a1u2l2-ex5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich stehe um sieben Uhr auf.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Am Abend sehe ich fern.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      a1(
        typeIt('a1u2l2-m1', bi('Mastery: the bracket', 'Проверка: рамката'), [
          {
            prompt: bi('I get up at six o’clock.', 'Ставам в шест часа.'),
            answer: 'Ich stehe um sechs Uhr auf.',
            hints: [],
          },
          {
            prompt: bi('We tidy up the flat.', 'Разтребваме апартамента.'),
            answer: 'Wir räumen die Wohnung auf.',
            hints: [],
          },
          {
            prompt: bi('At the weekend I get up late.', 'През уикенда ставам късно.'),
            answer: 'Am Wochenende stehe ich spät auf.',
            // Both orders are correct German, and a task that takes only the
            // fronted one marks a right answer wrong.
            alternatives: ['Ich stehe am Wochenende spät auf.'],
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 — modal verbs
 * ================================================================== */

const lesson3: Lesson = {
  id: 'a1-u2-l3',
  unitId: 'a1-u2',
  level: 'a1',
  order: 3,
  status: 'available',
  estimatedMinutes: 25,
  title: bi('Can, must, want', 'Мога, трябва, искам'),
  objective: bi(
    'After this lesson you will be able to say what you can, have to and want to do, with the second verb at the end of the sentence.',
    'След този урок ще можеш да кажеш какво можеш, какво трябва и какво искаш да правиш, с втория глагол в края на изречението.',
  ),
  outcomes: [
    bi('I can use können, müssen and wollen.', 'Мога да използвам können, müssen и wollen.'),
    bi('I put the second verb at the end, unchanged.', 'Слагам втория глагол в края, непроменен.'),
    bi('I know that ich and er share one form.', 'Знам, че ich и er имат една и съща форма.'),
    bi('I can ask what someone can or has to do.', 'Мога да попитам какво може или трябва да прави някой.'),
  ],
  vocabIds: ['v-koennen', 'v-muessen', 'v-wollen', 'v-arbeit', 'v-heute-abend'],
  grammarIds: ['g-modal-verbs'],
  sections: [
    {
      id: 'a1u2l3-intro',
      kind: 'intro',
      title: bi('The same shape again', 'Същата форма отново'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'You have just spent a lesson putting half a verb at the end of the sentence. Modal verbs do the same thing with a whole verb, so the shape is already familiar even though the words are new.',
            'Току-що прекара цял урок в поставяне на половин глагол в края на изречението. Модалните глаголи правят същото с цял глагол, така че формата вече ти е позната, макар думите да са нови.',
          ),
        },
      ],
    },
    {
      id: 'a1u2l3-grammar',
      kind: 'grammar',
      title: bi('können, müssen, wollen', 'können, müssen, wollen'),
      blocks: [],
      grammarId: 'g-modal-verbs',
    },
    {
      id: 'a1u2l3-examples',
      kind: 'examples',
      title: bi('In use', 'В употреба'),
      blocks: [
        {
          t: 'breakdown',
          de: 'Ich muss früh aufstehen.',
          parts: [
            { de: 'Ich', gloss: bi('I', 'аз') },
            { de: 'muss', gloss: bi('have to — second position', 'трябва — второ място') },
            { de: 'früh', gloss: bi('early', 'рано') },
            { de: 'aufstehen', gloss: bi('get up — whole, because the end is where it was going anyway', 'ставам — цял, защото краят и без това му е мястото') },
          ],
        },
        { t: 'de', de: 'Kannst du gut kochen?', gloss: bi('Can you cook well?', 'Можеш ли да готвиш добре?') },
        { t: 'de', de: 'Heute Abend will ich fernsehen.', gloss: bi('Tonight I want to watch television.', 'Тази вечер искам да гледам телевизия.') },
      ],
    },
    {
      id: 'a1u2l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('The modal is in second position; the other verb is at the end.', 'Модалният глагол е на второ място; другият е в края.'),
            bi('The second verb never changes its form.', 'Вторият глагол никога не си мени формата.'),
            bi('ich and er take no ending: ich kann, er kann.', 'ich и er са без окончание: ich kann, er kann.'),
            bi('A separable verb after a modal stays whole.', 'Делимият глагол след модален остава цял.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    a1(
      typeIt(
        'a1u2l3-ex1',
        bi('Say what you can and must', 'Кажи какво можеш и какво трябва'),
        [
          {
            prompt: bi('I have to work today.', 'Днес трябва да работя.'),
            answer: 'Ich muss heute arbeiten.',
            reviewTargets: ['v-muessen', 'p-ich-muss'],
            hints: [bi('The second verb goes last.', 'Вторият глагол отива най-накрая.')],
            traps: [
              {
                answer: 'Ich muss heute zu arbeiten.',
                category: 'extra-word',
                feedback: bi(
                  'No zu after a modal verb. The second verb stands alone at the end: Ich muss heute arbeiten.',
                  'Без zu след модален глагол. Вторият глагол стои сам в края: Ich muss heute arbeiten. (Българското „да“ няма съответствие тук.)',
                ),
              },
              {
                answer: 'Ich muss heute arbeite.',
                category: 'verb-conjugation',
                feedback: bi(
                  'The second verb keeps its dictionary form — arbeiten, not arbeite. Only the modal changes for the person.',
                  'Вторият глагол запазва речниковата си форма — arbeiten, не arbeite. Само модалният се мени по лице.',
                ),
              },
            ],
          },
          {
            prompt: bi('I can cook well.', 'Мога да готвя добре.'),
            answer: 'Ich kann gut kochen.',
            reviewTargets: ['v-koennen', 'v-kochen'],
            hints: [],
          },
          {
            prompt: bi('We want to do the shopping today.', 'Днес искаме да пазаруваме.'),
            answer: 'Wir wollen heute einkaufen.',
            reviewTargets: ['v-wollen', 'v-einkaufen'],
            hints: [bi('einkaufen stays in one piece at the end.', 'einkaufen остава цял в края.')],
          },
          {
            prompt: bi('I have to get up early.', 'Трябва да ставам рано.'),
            answer: 'Ich muss früh aufstehen.',
            reviewTargets: ['v-muessen', 'v-aufstehen'],
            hints: [],
            traps: [
              {
                answer: 'Ich muss früh stehe auf.',
                category: 'word-order',
                feedback: bi(
                  'A separable verb only splits when it is the main verb. After a modal it sits at the end whole: muss früh aufstehen.',
                  'Делимият глагол се разделя само когато е главният глагол. След модален стои в края цял: muss früh aufstehen.',
                ),
              },
            ],
          },
        ],
        ['g-modal-verbs'],
      ),
    ),
    a1(
      fillBlank('a1u2l3-ex2', bi('The right form', 'Правилната форма'), [
        {
          prompt: bi('Can you cook? (informal)', 'Можеш ли да готвиш?'),
          scaffold: '___ du kochen?',
          answer: 'Kannst',
          shape: 'word',
          reviewTargets: ['v-koennen', 'p-kannst-du'],
          hints: [bi('du adds -st.', 'du добавя -st.')],
        },
        {
          prompt: bi('He has to work.', 'Той трябва да работи.'),
          scaffold: 'Er ___ arbeiten.',
          answer: 'muss',
          shape: 'word',
          reviewTargets: ['v-muessen'],
          hints: [bi('er takes no ending on a modal.', 'er няма окончание при модален глагол.')],
          traps: [
            {
              answer: 'musst',
              category: 'verb-conjugation',
              feedback: bi(
                'That is the du form. Modals give ich and er the same ending-free form: ich muss, er muss.',
                'Това е формата за du. При модалните ich и er имат една и съща форма без окончание: ich muss, er muss.',
              ),
            },
          ],
        },
        {
          prompt: bi('We want to eat.', 'Искаме да ядем.'),
          scaffold: 'Wir ___ essen.',
          answer: 'wollen',
          shape: 'word',
          reviewTargets: ['v-wollen'],
          hints: [],
        },
      ]),
    ),
    a1(
      wordOrder('a1u2l3-ex3', bi('Build the bracket', 'Построй рамката'), [
        {
          prompt: bi('Tonight I want to watch television.', 'Тази вечер искам да гледам телевизия.'),
          bank: ['Heute', 'Abend', 'will', 'ich', 'fernsehen'],
          answer: 'Heute Abend will ich fernsehen.',
          hints: [bi('The time phrase is first, so the verb comes second.', 'Изразът за време е отпред, затова глаголът е втори.')],
        },
        {
          prompt: bi('Do you have to work on Saturday?', 'Трябва ли да работиш в събота?'),
          bank: ['Musst', 'du', 'am', 'Samstag', 'arbeiten'],
          answer: 'Musst du am Samstag arbeiten?',
          hints: [],
        },
      ]),
    ),
    a1(
      dictation('a1u2l3-ex4', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich muss heute arbeiten.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Kannst du gut kochen?',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    a1(
      freeWriting('a1u2l3-ex5', bi('Write about tomorrow', 'Напиши за утре'), [
        {
          prompt: bi(
            'Write two sentences: one thing you have to do and one thing you want to do.',
            'Напиши две изречения: едно нещо, което трябва да направиш, и едно, което искаш.',
          ),
          answer: 'Ich muss morgen arbeiten. Ich will heute Abend fernsehen.',
          requiredTokens: ['muss', 'will'],
          shape: 'sentence',
          hints: [
            bi('Use muss in the first and will in the second.', 'Използвай muss в първото и will във второто.'),
            bi('The other verb goes at the end.', 'Другият глагол отива в края.'),
          ],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.75,
    exercises: [
      a1(
        typeIt('a1u2l3-m1', bi('Mastery: modal verbs', 'Проверка: модални глаголи'), [
          {
            prompt: bi('I have to get up early.', 'Трябва да ставам рано.'),
            answer: 'Ich muss früh aufstehen.',
            hints: [],
          },
          {
            prompt: bi('Can you cook? (informal)', 'Можеш ли да готвиш?'),
            answer: 'Kannst du kochen?',
            hints: [],
          },
          {
            prompt: bi('She wants to watch television.', 'Тя иска да гледа телевизия.'),
            answer: 'Sie will fernsehen.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Unit checkpoint
 * ================================================================== */

const checkpoint: Checkpoint = {
  id: 'cp-a1-u2',
  scope: 'unit',
  targetId: 'a1-u2',
  status: 'available',
  title: bi('Unit 2 checkpoint', 'Проверка на раздел 2'),
  description: bi(
    'Home, the day, and the sentence bracket in both its shapes.',
    'Домът, денят и рамката на изречението в двете ѝ форми.',
  ),
  passAccuracy: 0.75,
  exercises: [
    a1(
      typeIt('cp-a1u2-1', bi('Your home', 'Твоят дом'), [
        {
          prompt: bi('There is a garden.', 'Има градина.'),
          answer: 'Es gibt einen Garten.',
          hints: [],
        },
        {
          prompt: bi('My kitchen is very small.', 'Кухнята ми е много малка.'),
          answer: 'Meine Küche ist sehr klein.',
          hints: [],
        },
        {
          prompt: bi('There is no wardrobe.', 'Няма гардероб.'),
          answer: 'Es gibt keinen Schrank.',
          hints: [],
        },
      ]),
    ),
    a1(
      typeIt('cp-a1u2-2', bi('Your day', 'Твоят ден'), [
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
          prompt: bi('I never cook.', 'Никога не готвя.'),
          answer: 'Ich koche nie.',
          hints: [],
        },
      ]),
    ),
    a1(
      typeIt('cp-a1u2-3', bi('Can, must, want', 'Мога, трябва, искам'), [
        {
          prompt: bi('I have to work today.', 'Днес трябва да работя.'),
          answer: 'Ich muss heute arbeiten.',
          hints: [],
        },
        {
          prompt: bi('We want to do the shopping.', 'Искаме да пазаруваме.'),
          answer: 'Wir wollen einkaufen.',
          hints: [],
        },
        {
          prompt: bi('Can you cook well? (informal)', 'Можеш ли да готвиш добре?'),
          answer: 'Kannst du gut kochen?',
          hints: [],
        },
      ]),
    ),
    a1(
      exercise({
        id: 'cp-a1u2-4',
        kind: 'fillBlank',
        objective: bi('The missing half', 'Липсващата половина'),
        steps: [
          {
            prompt: bi('My sister gets up late.', 'Сестра ми става късно.'),
            scaffold: 'Meine Schwester steht spät ___.',
            answer: 'auf',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('He has to work.', 'Той трябва да работи.'),
            scaffold: 'Er ___ arbeiten.',
            answer: 'muss',
            shape: 'word',
            hints: [],
          },
        ],
      }),
    ),
    a1(
      dictation('cp-a1u2-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Ich muss früh aufstehen.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Es gibt drei Zimmer.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const A1_UNIT_2: Unit = {
  id: 'a1-u2',
  level: 'a1',
  order: 2,
  status: 'available',
  title: bi('Home and daily life', 'Дом и ежедневие'),
  summary: bi(
    'Rooms, routines, and the German sentence bracket — met twice, as a separable verb and as a modal.',
    'Стаи, ежедневие и рамката на немското изречение — срещната два пъти, като делим глагол и като модален.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const A1_U2_PATTERNS = PATTERNS;
