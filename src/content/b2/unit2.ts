import { bi, dictation, fillBlank, freeWriting, typeIt, wordOrder } from '../authoring.ts';
import type { Checkpoint, Exercise, Lesson, SentencePattern, Unit } from '../types.ts';

/**
 * B2 Unit 2 — Argument and negotiation.
 *
 * Unit 1 was about reporting work. This is about disagreeing about it, which
 * is a harder problem: at B1 a learner could say *Ich bin nicht einverstanden*
 * and be understood, and at B2 the question is whether the room still wants to
 * work with them afterwards.
 *
 * **Lesson 1 is the reason this unit exists.** Konjunktiv I — *er sagt, er
 * habe keine Zeit* — is the form German uses to report somebody else's words
 * without endorsing them, and it is the sharpest divergence between the two
 * paths anywhere in B2, in the opposite direction from the usual one.
 *
 * English has no grammatical marker for this at all. It backshifts the tense
 * and leaves the rest to context, so an English speaker writes *Er sagte, er
 * hatte keine Zeit* — grammatical German in which the speaker has quietly
 * endorsed the claim. The English path is being taught a category its language
 * does not have.
 *
 * Bulgarian has that category outright. The renarrative — „казал, че нямал
 * време“ — is a dedicated verb form meaning exactly "second hand, not my
 * claim". So the Bulgarian path is not taught the idea at all; it is handed a
 * map, told which German forms correspond, and warned about the one real
 * difference: Bulgarian uses its renarrative everywhere, including in speech,
 * while German keeps Konjunktiv I almost entirely for writing.
 *
 * **Lesson 2** is the machinery of a position: *je … desto*, which is the one
 * German comparative structure with word order in both halves and where both
 * starting languages move nothing at all, so it is drilled rather than
 * reasoned about; plus *zwar … aber* and *nicht nur … sondern auch*. Here the
 * advantage flips back to Bulgarian, which splits „а“ from „но“ exactly as
 * German splits sondern from aber, where English has only "but".
 *
 * **Lesson 3** is the modal particles — doch, mal, ja, eben, halt — the small
 * words that decide whether a disagreement lands as an invitation or as an
 * order. English has nothing equivalent and does the work with intonation;
 * Bulgarian has its own particles („я“, „нали“, „все пак“) and so needs a
 * warning about false one-to-one mapping rather than an explanation of why
 * such words exist.
 */

/** Everything in this file is B2. */
const b2 = (ex: Exercise): Exercise => ({ ...ex, level: 'b2' });

const PATTERNS: SentencePattern[] = [
  {
    id: 'p-konjunktiv1-sagt',
    template: 'Er sagt, er habe ___.',
    example: 'Er sagt, er habe keine Zeit.',
    gloss: bi('He says he has ___. (his claim)', 'Той казва, че нямал ___. (негово твърдение)'),
    level: 'b2',
    grammarIds: ['g-konjunktiv-1'],
  },
  {
    id: 'p-konjunktiv1-laut',
    template: 'Laut ___ sei ___.',
    example: 'Laut dem Bericht sei die Frist eingehalten worden.',
    gloss: bi('According to ___, ___ was ___.', 'Според ___ ___ бил ___.'),
    level: 'b2',
    grammarIds: ['g-konjunktiv-1'],
  },
  {
    id: 'p-je-desto',
    template: 'Je ___, desto ___.',
    example: 'Je länger wir warten, desto teurer wird es.',
    gloss: bi('The longer we wait, the more expensive it gets.', 'Колкото по-дълго чакаме, толкова по-скъпо става.'),
    level: 'b2',
    grammarIds: ['g-je-desto'],
  },
  {
    id: 'p-zwar-aber',
    template: '___ ist zwar ___, aber ___.',
    example: 'Der Vorschlag ist zwar teuer, aber er spart uns später Zeit.',
    gloss: bi('___ is expensive, admittedly, but ___.', '___ наистина е скъпо, но ___.'),
    level: 'b2',
    grammarIds: ['g-konzessiv-b2'],
  },
  {
    id: 'p-partikel-doch',
    template: 'Sagen Sie doch einfach, ___.',
    example: 'Sagen Sie doch einfach, was Sie denken.',
    gloss: bi('Do just say what you think.', 'Просто кажете какво мислите.'),
    level: 'b2',
    grammarIds: ['g-modalpartikeln'],
  },
];

/* ================================================================== *
 * Lesson 1 — his words, not yours
 * ================================================================== */

const lesson1: Lesson = {
  id: 'b2-u2-l1',
  unitId: 'b2-u2',
  level: 'b2',
  order: 1,
  status: 'available',
  estimatedMinutes: 32,
  title: bi('He says he has no time', 'Той казва, че нямал време'),
  objective: bi(
    'After this lesson you can report what somebody else said in the form German uses to mark it as their claim rather than your own.',
    'След този урок можеш да предадеш чужди думи във формата, с която немският ги маркира като чуждо твърдение, а не като твое.',
  ),
  outcomes: [
    bi('I can build Konjunktiv I for the third person.', 'Мога да образувам Konjunktiv I за трето лице.'),
    bi('I switch to Konjunktiv II when the form would be invisible.', 'Минавам на Konjunktiv II, когато формата не би се различавала.'),
    bi('I do not backshift the tense the way English does.', 'Не измествам времето назад, както прави английският.'),
    bi('I can use behaupten, bestreiten and laut to attribute a claim.', 'Мога да използвам behaupten, bestreiten и laut, за да припиша твърдение.'),
  ],
  vocabIds: [
    'v-behaupten',
    'v-zugeben',
    'v-bestreiten',
    'v-laut',
    'v-die-aussage',
    'v-widersprechen',
  ],
  grammarIds: ['g-konjunktiv-1'],
  sections: [
    {
      id: 'b2u2l1-intro',
      kind: 'intro',
      title: bi('A form that means "not my claim"', 'Форма, която значи „не е мое твърдение“'),
      blocks: [
        {
          t: 'p',
          text: bi(
            'Two sentences, one letter apart, and they say different things about you.',
            'Две изречения, разликата е една буква, а казват различни неща за теб.',
          ),
        },
        {
          t: 'contrast',
          de: 'Er sagt, er hat keine Zeit.',
          other: bi(
            'Ordinary present. It reads as though you believe him.',
            'Обикновено сегашно. Чете се, все едно му вярваш.',
          ),
        },
        {
          t: 'de',
          de: 'Er sagt, er habe keine Zeit.',
          gloss: bi(
            'He says he has no time — his claim, and I am not vouching for it.',
            'Той казва, че нямал време — негово твърдение, за което не гарантирам.',
          ),
          audio: true,
        },
        {
          t: 'p',
          only: ['bg'],
          text: bi(
            '',
            'Ако това ти звучи познато — така е. Немският прави с Konjunktiv I точно каквото българският прави с преизказното наклонение.',
          ),
        },
        {
          t: 'p',
          only: ['en'],
          text: bi(
            'English has no form for this. It moves the tense back instead — "he said he had no time" — and leaves the rest to context.',
            '',
          ),
        },
      ],
    },
    {
      id: 'b2u2l1-vocab',
      kind: 'vocabulary',
      title: bi('Attributing a claim', 'Как се приписва твърдение'),
      vocabIds: [
        'v-behaupten',
        'v-zugeben',
        'v-bestreiten',
        'v-laut',
        'v-die-aussage',
        'v-widersprechen',
      ],
      blocks: [
        {
          t: 'callout',
          tone: 'tip',
          title: bi('behaupten already takes a side', 'behaupten вече заема страна'),
          text: bi(
            'sagen is neutral. **behaupten** marks the claim as unproven — sometimes as untrue — which is why a careful report uses it and why it so often appears with Konjunktiv I.',
            'sagen е неутрално. **behaupten** маркира твърдението като недоказано — понякога и като невярно — затова грижливият доклад го използва и затова толкова често върви с Konjunktiv I.',
          ),
        },
      ],
    },
    {
      id: 'b2u2l1-grammar',
      kind: 'grammar',
      title: bi('Stem plus -e, and one irregular', 'Основа плюс -e и една неправилна форма'),
      blocks: [],
      grammarId: 'g-konjunktiv-1',
    },
    {
      id: 'b2u2l1-examples',
      kind: 'examples',
      title: bi('How a report attributes things', 'Как докладът приписва твърдения'),
      blocks: [
        {
          t: 'de',
          de: 'Die Kollegin sagt, sie sei noch nicht fertig.',
          gloss: bi('The colleague says she is not finished yet.', 'Колежката казва, че още не била готова.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Er behauptet, er habe die E-Mail nie bekommen.',
          gloss: bi('He claims he never received the email.', 'Той твърди, че никога не е получил имейла.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Laut dem Bericht sei die Frist eingehalten worden.',
          gloss: bi('According to the report, the deadline was met.', 'Според доклада срокът бил спазен.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Die Kollegen sagen, sie hätten keine Zeit.',
          gloss: bi('The colleagues say they have no time.', 'Колегите казват, че нямали време.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u2l1-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Third person: stem + -e. er habe, er gehe, er könne. One irregular: sei.', 'Трето лице: основа + -e. er habe, er gehe, er könne. Една неправилна: sei.'),
            bi('The missing -t is the whole signal: er hat → er habe.', 'Липсващото -t е целият сигнал: er hat → er habe.'),
            bi('If the form looks like the present, use Konjunktiv II: sie hätten.', 'Ако формата прилича на сегашно, използвай Konjunktiv II: sie hätten.'),
            bi('German does not move the tense back. The mood does the work.', 'Немският не измества времето назад. Работата я върши наклонението.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      fillBlank('b2u2l1-ex1', bi('Put it in Konjunktiv I', 'Постави го в Konjunktiv I'), [
        {
          prompt: bi('haben — he says he has no time', 'haben — той казва, че нямал време'),
          scaffold: 'Er sagt, er ___ keine Zeit.',
          answer: 'habe',
          shape: 'word',
          hints: [bi('Stem plus -e.', 'Основа плюс -e.')],
          traps: [
            {
              answer: 'hat',
              category: 'verb-tense',
              feedback: bi(
                'hat is the ordinary present and reads as though you are confirming it. The reporting form drops the -t: er habe.',
                'hat е обикновено сегашно и звучи, все едно потвърждаваш казаното. Преизказната форма изпуска -t: er habe.',
              ),
            },
          ],
        },
        {
          prompt: bi('sein — she says she is ill', 'sein — тя казва, че била болна'),
          scaffold: 'Sie sagt, sie ___ krank.',
          answer: 'sei',
          shape: 'word',
          hints: [bi('The one irregular form.', 'Единствената неправилна форма.')],
        },
        {
          prompt: bi('können — he says he cannot do it', 'können — той казва, че не можел да го направи'),
          scaffold: 'Er sagt, er ___ das nicht machen.',
          answer: 'könne',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('plural — they say they have no time', 'множествено число — казват, че нямали време'),
          scaffold: 'Sie sagen, sie ___ keine Zeit.',
          answer: 'hätten',
          shape: 'word',
          hints: [
            bi(
              'Konjunktiv I would be invisible here, so German switches.',
              'Konjunktiv I тук не би се различавал, затова немският сменя формата.',
            ),
          ],
          traps: [
            {
              answer: 'haben',
              category: 'verb-tense',
              feedback: bi(
                'sie haben is identical to the ordinary present, so it marks nothing. German uses Konjunktiv II there instead: sie hätten.',
                'sie haben съвпада с обикновеното сегашно и затова не маркира нищо. В такъв случай немският използва Konjunktiv II: sie hätten.',
              ),
            },
          ],
        },
      ]),
    ),
    b2(
      wordOrder('b2u2l1-ex2', bi('Report the claim', 'Предай твърдението'), [
        {
          prompt: bi('He claims he never received the email.', 'Той твърди, че никога не е получил имейла.'),
          bank: ['Er', 'behauptet,', 'er', 'habe', 'die', 'E-Mail', 'nie', 'bekommen.'],
          answer: 'Er behauptet, er habe die E-Mail nie bekommen.',
          hints: [bi('The participle stays at the end.', 'Причастието остава в края.')],
        },
        {
          prompt: bi('According to the report, the deadline was met.', 'Според доклада срокът бил спазен.'),
          bank: ['Laut', 'dem', 'Bericht', 'sei', 'die', 'Frist', 'eingehalten', 'worden.'],
          answer: 'Laut dem Bericht sei die Frist eingehalten worden.',
          hints: [bi('A passive inside reported speech: sei … worden.', 'Страдателен залог вътре в преизказна реч: sei … worden.')],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u2l1-ex3',
        bi('Say it without vouching for it', 'Кажи го, без да гарантираш'),
        [
          {
            prompt: bi('He says he has no time.', 'Той казва, че нямал време.'),
            answer: 'Er sagt, er habe keine Zeit.',
            reviewTargets: ['p-konjunktiv1-sagt'],
            hints: [],
            traps: [
              {
                answer: 'Er sagte, er hatte keine Zeit.',
                category: 'verb-tense',
                feedback: bi(
                  'That is the English shape: move the tense back and hope the context carries the rest. German keeps the tense and changes the mood: Er sagt, er habe keine Zeit.',
                  'Това е английската форма: измести времето назад и се надявай контекстът да свърши останалото. Немският пази времето и сменя наклонението: Er sagt, er habe keine Zeit.',
                ),
              },
            ],
          },
          {
            prompt: bi('The colleague says she is not finished yet.', 'Колежката казва, че още не била готова.'),
            answer: 'Die Kollegin sagt, sie sei noch nicht fertig.',
            reviewTargets: ['v-kollegin'],
            hints: [],
          },
          {
            prompt: bi('He claims he never received the email.', 'Той твърди, че никога не е получил имейла.'),
            answer: 'Er behauptet, er habe die E-Mail nie bekommen.',
            reviewTargets: ['v-behaupten'],
            hints: [],
          },
          {
            prompt: bi('The company denies that there was a delay.', 'Фирмата отрича, че е имало забавяне.'),
            answer: 'Die Firma bestreitet, dass es eine Verzögerung gab.',
            reviewTargets: ['v-bestreiten', 'v-die-verzoegerung'],
            hints: [bi('After dass, the verb goes last.', 'След dass глаголът отива в края.')],
          },
          {
            prompt: bi('According to the report, the deadline was met.', 'Според доклада срокът бил спазен.'),
            answer: 'Laut dem Bericht sei die Frist eingehalten worden.',
            reviewTargets: ['p-konjunktiv1-laut', 'v-laut', 'v-die-frist'],
            hints: [],
          },
        ],
        ['g-konjunktiv-1'],
      ),
    ),
    b2(
      typeIt(
        'b2u2l1-ex4',
        bi('Admitting and contradicting', 'Признаване и възразяване'),
        [
          {
            prompt: bi('I admit that I was wrong.', 'Признавам, че съм сгрешил.'),
            answer: 'Ich gebe zu, dass ich mich geirrt habe.',
            reviewTargets: ['v-zugeben'],
            hints: [bi('zugeben splits.', 'zugeben се разделя.')],
          },
          {
            prompt: bi('I would like to disagree with you there.', 'Тук бих искал да ви възразя.'),
            answer: 'Ich möchte Ihnen da widersprechen.',
            reviewTargets: ['v-widersprechen'],
            hints: [bi('widersprechen takes the dative.', 'widersprechen иска дателен падеж.')],
            traps: [
              {
                answer: 'Ich möchte Sie da widersprechen.',
                category: 'case',
                feedback: bi(
                  'widersprechen takes the dative — you contradict *to* someone: Ich möchte Ihnen da widersprechen.',
                  'widersprechen иска дателен падеж — противоречиш „на“ някого: Ich möchte Ihnen da widersprechen.',
                ),
              },
            ],
          },
          {
            prompt: bi('His statement contradicts the minutes.', 'Изказването му противоречи на протокола.'),
            answer: 'Seine Aussage widerspricht dem Protokoll.',
            reviewTargets: ['v-die-aussage', 'v-das-protokoll'],
            hints: [],
          },
        ],
        ['g-konjunktiv-1'],
      ),
    ),
    b2(
      dictation('b2u2l1-ex5', bi('Hear the missing -t', 'Чуй липсващото -t'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Er sagt, er habe keine Zeit.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Die Kollegin sagt, sie sei noch nicht fertig.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      b2(
        typeIt('b2u2l1-m1', bi('Report three claims', 'Предай три твърдения'), [
          {
            prompt: bi('He says he has no time.', 'Той казва, че нямал време.'),
            answer: 'Er sagt, er habe keine Zeit.',
            hints: [],
          },
          {
            prompt: bi('He claims he never received the email.', 'Той твърди, че никога не е получил имейла.'),
            answer: 'Er behauptet, er habe die E-Mail nie bekommen.',
            hints: [],
          },
          {
            prompt: bi('According to the report, the deadline was met.', 'Според доклада срокът бил спазен.'),
            answer: 'Laut dem Bericht sei die Frist eingehalten worden.',
            hints: [],
          },
        ]),
      ),
      b2(
        fillBlank('b2u2l1-m2', bi('The right mood', 'Правилното наклонение'), [
          {
            prompt: bi('singular — sein', 'единствено число — sein'),
            scaffold: 'Sie sagt, sie ___ krank.',
            answer: 'sei',
            shape: 'word',
            hints: [],
          },
          {
            prompt: bi('plural — haben', 'множествено число — haben'),
            scaffold: 'Sie sagen, sie ___ keine Zeit.',
            answer: 'hätten',
            shape: 'word',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 2 — holding a position
 * ================================================================== */

const lesson2: Lesson = {
  id: 'b2-u2-l2',
  unitId: 'b2-u2',
  level: 'b2',
  order: 2,
  status: 'available',
  estimatedMinutes: 30,
  title: bi('The longer we wait, the more expensive it gets', 'Колкото по-дълго чакаме, толкова по-скъпо става'),
  objective: bi(
    'After this lesson you can argue a position with structure: link two things that rise together, concede a point before objecting to it, and escalate without contradicting yourself.',
    'След този урок можеш да защитаваш позиция структурирано: да свържеш две неща, които растат заедно, да отстъпиш по точка, преди да възразиш, и да надградиш, без да си противоречиш.',
  ),
  outcomes: [
    bi('I can build je … desto with the right word order in both halves.', 'Мога да образувам je … desto с правилния словоред и в двете части.'),
    bi('I concede with zwar before I object with aber.', 'Отстъпвам със zwar, преди да възразя с aber.'),
    bi('I use sondern after a negative and aber everywhere else.', 'Използвам sondern след отрицание, а aber във всички останали случаи.'),
    bi('I can propose a compromise and name a condition.', 'Мога да предложа компромис и да назова условие.'),
  ],
  vocabIds: [
    'v-der-standpunkt',
    'v-ueberzeugen',
    'v-abwaegen',
    'v-der-kompromiss',
    'v-die-verhandlung',
    'v-verhandeln',
    'v-die-bedingung',
    'v-der-aufwand',
  ],
  grammarIds: ['g-je-desto', 'g-konzessiv-b2'],
  sections: [
    {
      id: 'b2u2l2-intro',
      kind: 'intro',
      title: bi('Two things rising together', 'Две неща, които растат заедно'),
      blocks: [
        {
          t: 'de',
          de: 'Je länger wir warten, desto teurer wird es.',
          gloss: bi(
            'The longer we wait, the more expensive it gets.',
            'Колкото по-дълго чакаме, толкова по-скъпо става.',
          ),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'Your own language says this and moves nothing. German moves the verb twice in one sentence — to the end in the first half, and to second place in the other. It is the only comparative structure that does, which is why it is worth a lesson.',
            'Твоят език го казва, без да мести нищо. Немският мести глагола два пъти в едно изречение — в края на първата част и на второ място във втората. Това е единствената сравнителна конструкция с такова поведение и затова ѝ се пада цял урок.',
          ),
        },
      ],
    },
    {
      id: 'b2u2l2-vocab',
      kind: 'vocabulary',
      title: bi('The machinery of a position', 'Механиката на една позиция'),
      vocabIds: [
        'v-der-standpunkt',
        'v-ueberzeugen',
        'v-abwaegen',
        'v-der-kompromiss',
        'v-die-verhandlung',
        'v-verhandeln',
        'v-die-bedingung',
        'v-der-aufwand',
      ],
      blocks: [],
    },
    {
      id: 'b2u2l2-grammar',
      kind: 'grammar',
      title: bi('je … desto', 'je … desto'),
      blocks: [],
      grammarId: 'g-je-desto',
    },
    {
      id: 'b2u2l2-grammar2',
      kind: 'grammar',
      title: bi('Concede, then turn', 'Отстъпи, после обърни'),
      blocks: [],
      grammarId: 'g-konzessiv-b2',
    },
    {
      id: 'b2u2l2-examples',
      kind: 'examples',
      title: bi('An argument, assembled', 'Сглобен аргумент'),
      blocks: [
        {
          t: 'de',
          de: 'Je größer der Aufwand ist, desto höher sind die Kosten.',
          gloss: bi('The greater the effort, the higher the costs.', 'Колкото по-голямо е усилието, толкова по-високи са разходите.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Der Vorschlag ist zwar teuer, aber er spart uns später Zeit.',
          gloss: bi(
            'The proposal is expensive, admittedly, but it saves us time later.',
            'Предложението наистина е скъпо, но по-късно ни спестява време.',
          ),
          audio: true,
        },
        {
          t: 'de',
          de: 'Wir brauchen nicht nur mehr Zeit, sondern auch mehr Leute.',
          gloss: bi('We need not only more time but also more people.', 'Трябват ни не само повече време, но и повече хора.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Unter dieser Bedingung können wir einen Kompromiss finden.',
          gloss: bi('On that condition we can find a compromise.', 'При това условие можем да намерим компромис.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u2l2-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('je + comparative, verb last. desto + comparative, verb second.', 'je + сравнителна, глагол накрая. desto + сравнителна, глагол втори.'),
            bi('zwar concedes and promises an aber. aber joins without moving the verb.', 'zwar отстъпва и обещава aber. aber свързва, без да мести глагола.'),
            bi('sondern only after a negative: nicht X, sondern Y.', 'sondern само след отрицание: nicht X, sondern Y.'),
            bi('nicht nur …, sondern auch … is one fixed frame.', 'nicht nur …, sondern auch … е една устойчива рамка.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      fillBlank('b2u2l2-ex1', bi('je or desto?', 'je или desto?'), [
        {
          prompt: bi('opening the pair', 'начало на двойката'),
          scaffold: '___ länger wir warten, desto teurer wird es.',
          answer: 'Je',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('closing the pair', 'край на двойката'),
          scaffold: 'Je früher wir anfangen, ___ besser.',
          answer: 'desto',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('the verb in the je-half goes where?', 'къде отива глаголът в частта с je?'),
          scaffold: 'Je größer der Aufwand ___, desto höher sind die Kosten.',
          answer: 'ist',
          shape: 'word',
          hints: [bi('Last, as in any subordinate clause.', 'Последен, както във всяко подчинено изречение.')],
        },
      ]),
    ),
    b2(
      fillBlank('b2u2l2-ex2', bi('aber or sondern?', 'aber или sondern?'), [
        {
          prompt: bi('after a negative — replacing it', 'след отрицание — със замяна'),
          scaffold: 'Wir brauchen nicht mehr Zeit, ___ mehr Leute.',
          answer: 'sondern',
          shape: 'word',
          hints: [bi('Could you say "instead"?', 'Може ли да се каже „а“?')],
        },
        {
          prompt: bi('adding a contrast to something that stands', 'контраст към нещо, което остава в сила'),
          scaffold: 'Der Vorschlag ist teuer, ___ er spart uns Zeit.',
          answer: 'aber',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('the fixed frame', 'устойчивата рамка'),
          scaffold: 'Wir brauchen nicht nur mehr Zeit, ___ auch mehr Leute.',
          answer: 'sondern',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      wordOrder('b2u2l2-ex3', bi('Both halves in order', 'И двете части в ред'), [
        {
          prompt: bi('The longer we wait, the more expensive it gets.', 'Колкото по-дълго чакаме, толкова по-скъпо става.'),
          bank: ['Je', 'länger', 'wir', 'warten,', 'desto', 'teurer', 'wird', 'es.'],
          answer: 'Je länger wir warten, desto teurer wird es.',
          hints: [bi('Verb last, then verb second.', 'Първо глагол накрая, после глагол на второ място.')],
        },
        {
          prompt: bi('The proposal is expensive, admittedly, but it saves us time later.', 'Предложението наистина е скъпо, но по-късно ни спестява време.'),
          bank: ['Der', 'Vorschlag', 'ist', 'zwar', 'teuer,', 'aber', 'er', 'spart', 'uns', 'später', 'Zeit.'],
          answer: 'Der Vorschlag ist zwar teuer, aber er spart uns später Zeit.',
          hints: [bi('zwar sits inside the first clause.', 'zwar стои вътре в първото изречение.')],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u2l2-ex4',
        bi('Argue it yourself', 'Аргументирай сам'),
        [
          {
            prompt: bi('The longer we wait, the more expensive it gets.', 'Колкото по-дълго чакаме, толкова по-скъпо става.'),
            answer: 'Je länger wir warten, desto teurer wird es.',
            reviewTargets: ['p-je-desto'],
            hints: [],
            traps: [
              {
                answer: 'Je länger wir warten, desto es wird teurer.',
                category: 'word-order',
                feedback: bi(
                  'desto and its comparative fill the first slot together, so the verb comes straight after them: desto teurer wird es.',
                  'desto и сравнителната форма заемат заедно първия слот, затова глаголът идва веднага след тях: desto teurer wird es.',
                ),
              },
            ],
          },
          {
            prompt: bi('The greater the effort, the higher the costs.', 'Колкото по-голямо е усилието, толкова по-високи са разходите.'),
            answer: 'Je größer der Aufwand ist, desto höher sind die Kosten.',
            reviewTargets: ['v-der-aufwand'],
            hints: [],
          },
          {
            prompt: bi('The proposal is expensive, admittedly, but it saves us time later.', 'Предложението наистина е скъпо, но по-късно ни спестява време.'),
            answer: 'Der Vorschlag ist zwar teuer, aber er spart uns später Zeit.',
            reviewTargets: ['p-zwar-aber', 'v-der-vorschlag'],
            hints: [],
          },
          {
            prompt: bi('We need not only more time but also more people.', 'Трябват ни не само повече време, но и повече хора.'),
            answer: 'Wir brauchen nicht nur mehr Zeit, sondern auch mehr Leute.',
            reviewTargets: ['v-zeit'],
            hints: [],
            traps: [
              {
                answer: 'Wir brauchen nicht nur mehr Zeit, aber auch mehr Leute.',
                category: 'vocabulary',
                feedback: bi(
                  'After a negative, German replaces with sondern rather than contrasting with aber: nicht nur …, sondern auch …',
                  'След отрицание немският заменя със sondern, а не противопоставя с aber: nicht nur …, sondern auch …',
                ),
              },
            ],
          },
          {
            prompt: bi('I can follow your point of view.', 'Мога да разбера вашата гледна точка.'),
            answer: 'Ich kann Ihren Standpunkt nachvollziehen.',
            reviewTargets: ['v-der-standpunkt'],
            hints: [],
          },
        ],
        ['g-je-desto', 'g-konzessiv-b2'],
      ),
    ),
    b2(
      typeIt(
        'b2u2l2-ex5',
        bi('Negotiating', 'Преговори'),
        [
          {
            prompt: bi('We have to weigh up the advantages and disadvantages.', 'Трябва да преценим предимствата и недостатъците.'),
            answer: 'Wir müssen Vorteile und Nachteile abwägen.',
            reviewTargets: ['v-abwaegen', 'v-der-vorteil', 'v-der-nachteil'],
            hints: [],
          },
          {
            prompt: bi('On that condition we can find a compromise.', 'При това условие можем да намерим компромис.'),
            answer: 'Unter dieser Bedingung können wir einen Kompromiss finden.',
            reviewTargets: ['v-die-bedingung', 'v-der-kompromiss'],
            hints: [],
          },
          {
            prompt: bi('The argument did not convince me.', 'Аргументът не ме убеди.'),
            answer: 'Das Argument hat mich nicht überzeugt.',
            reviewTargets: ['v-ueberzeugen', 'v-das-argument'],
            hints: [],
          },
        ],
        ['g-konzessiv-b2'],
      ),
    ),
    b2(
      dictation('b2u2l2-ex6', bi('Listening to an argument', 'Слушане на аргумент'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Je länger wir warten, desto teurer wird es.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Wir brauchen nicht nur mehr Zeit, sondern auch mehr Leute.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      b2(
        typeIt('b2u2l2-m1', bi('A position, in three moves', 'Позиция в три хода'), [
          {
            prompt: bi('The longer we wait, the more expensive it gets.', 'Колкото по-дълго чакаме, толкова по-скъпо става.'),
            answer: 'Je länger wir warten, desto teurer wird es.',
            hints: [],
          },
          {
            prompt: bi('The proposal is expensive, admittedly, but it saves us time later.', 'Предложението наистина е скъпо, но по-късно ни спестява време.'),
            answer: 'Der Vorschlag ist zwar teuer, aber er spart uns später Zeit.',
            hints: [],
          },
          {
            prompt: bi('We need not only more time but also more people.', 'Трябват ни не само повече време, но и повече хора.'),
            answer: 'Wir brauchen nicht nur mehr Zeit, sondern auch mehr Leute.',
            hints: [],
          },
        ]),
      ),
    ],
  },
};

/* ================================================================== *
 * Lesson 3 — the small words that decide how it lands
 * ================================================================== */

const lesson3: Lesson = {
  id: 'b2-u2-l3',
  unitId: 'b2-u2',
  level: 'b2',
  order: 3,
  status: 'available',
  estimatedMinutes: 28,
  title: bi('Do just say what you think', 'Просто кажете какво мислите'),
  objective: bi(
    'After this lesson you can disagree in a way that leaves the room intact: modal particles for tone, Konjunktiv II for distance, and the vocabulary of conceding a point.',
    'След този урок можеш да изразиш несъгласие, без да рушиш отношенията: модални частици за тон, Konjunktiv II за дистанция и лексиката на отстъпването.',
  ),
  outcomes: [
    bi('I can place doch, mal, ja and eben correctly in a sentence.', 'Мога да поставям doch, mal, ja и eben правилно в изречението.'),
    bi('I can soften an objection with Konjunktiv II.', 'Мога да смекча възражение с Konjunktiv II.'),
    bi('I can concede a point without giving up my position.', 'Мога да отстъпя по точка, без да се откажа от позицията си.'),
    bi('I know these words carry tone, not meaning.', 'Знам, че тези думи носят тон, а не значение.'),
  ],
  vocabIds: [
    'v-das-bedenken',
    'v-einraeumen',
    'v-nachgeben',
    'v-der-vorbehalt',
    'v-sich-durchsetzen',
    'v-die-mehrheit',
  ],
  grammarIds: ['g-modalpartikeln'],
  sections: [
    {
      id: 'b2u2l3-intro',
      kind: 'intro',
      title: bi('Same facts, different room', 'Същите факти, различна стая'),
      blocks: [
        {
          t: 'contrast',
          de: 'Sagen Sie, was Sie denken.',
          other: bi('An instruction. Possibly a cold one.', 'Указание. Вероятно студено.'),
        },
        {
          t: 'de',
          de: 'Sagen Sie doch einfach, was Sie denken.',
          gloss: bi('Do just say what you think.', 'Просто кажете какво мислите.'),
          audio: true,
        },
        {
          t: 'p',
          text: bi(
            'One word, and it has become an invitation. Nothing about the facts has changed.',
            'Една дума, и изречението стана покана. Във фактите не се е променило нищо.',
          ),
        },
      ],
    },
    {
      id: 'b2u2l3-vocab',
      kind: 'vocabulary',
      title: bi('Conceding without collapsing', 'Да отстъпиш, без да се предадеш'),
      vocabIds: [
        'v-das-bedenken',
        'v-einraeumen',
        'v-nachgeben',
        'v-der-vorbehalt',
        'v-sich-durchsetzen',
        'v-die-mehrheit',
      ],
      blocks: [],
    },
    {
      id: 'b2u2l3-grammar',
      kind: 'grammar',
      title: bi('doch, mal, ja, eben', 'doch, mal, ja, eben'),
      blocks: [],
      grammarId: 'g-modalpartikeln',
    },
    {
      id: 'b2u2l3-examples',
      kind: 'examples',
      title: bi('Disagreeing, softly', 'Меко несъгласие'),
      blocks: [
        {
          t: 'de',
          de: 'Da hätte ich Bedenken.',
          gloss: bi('I would have reservations about that.', 'Тук бих имал резерви.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Ich räume ein, dass der Zeitplan knapp ist.',
          gloss: bi('I concede that the schedule is tight.', 'Признавам, че графикът е стегнат.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Das sehe ich eben anders.',
          gloss: bi('That is exactly where I see it differently.', 'Точно тук го виждам различно.'),
          audio: true,
        },
        {
          t: 'de',
          de: 'Schauen Sie mal auf Seite drei.',
          gloss: bi('Have a look at page three.', 'Погледнете на страница три.'),
          audio: true,
        },
      ],
    },
    {
      id: 'b2u2l3-summary',
      kind: 'summary',
      title: bi('What to keep', 'Какво да запомниш'),
      blocks: [
        {
          t: 'list',
          items: [
            bi('Particles go in the middle, never first, never stressed.', 'Частиците стоят в средата, никога първи и никога под ударение.'),
            bi('mal makes a request small; doch pushes gently; ja assumes shared knowledge.', 'mal смалява молбата; doch настоява меко; ja предполага общо знание.'),
            bi('hätte, wäre and könnte turn an objection into a reservation.', 'hätte, wäre и könnte превръщат възражението в резерва.'),
            bi('Conceding a point (einräumen) is how a German argument earns the right to object.', 'Отстъпването по точка (einräumen) е начинът, по който немският аргумент си печели правото да възрази.'),
          ],
        },
      ],
    },
  ],
  exercises: [
    b2(
      fillBlank('b2u2l3-ex1', bi('Which particle?', 'Коя частица?'), [
        {
          prompt: bi('a small, casual request', 'малка, небрежна молба'),
          scaffold: 'Schauen Sie ___ auf Seite drei.',
          answer: 'mal',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('gentle encouragement to speak', 'меко подканване да се изкаже'),
          scaffold: 'Sagen Sie ___ einfach, was Sie denken.',
          answer: 'doch',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('we both know this already', 'и двамата вече го знаем'),
          scaffold: 'Das ist ___ nicht neu.',
          answer: 'ja',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('exactly — that is the point', 'точно така — това е въпросът'),
          scaffold: '___ deshalb brauchen wir mehr Zeit.',
          answer: 'Eben',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt(
        'b2u2l3-ex2',
        bi('Soften the objection', 'Смекчи възражението'),
        [
          {
            prompt: bi('I would have reservations about that.', 'Тук бих имал резерви.'),
            answer: 'Da hätte ich Bedenken.',
            reviewTargets: ['v-das-bedenken'],
            hints: [bi('Konjunktiv II, and the place word first.', 'Konjunktiv II, а думата за място е първа.')],
          },
          {
            prompt: bi('I concede that the schedule is tight.', 'Признавам, че графикът е стегнат.'),
            answer: 'Ich räume ein, dass der Zeitplan knapp ist.',
            reviewTargets: ['v-einraeumen', 'v-der-zeitplan'],
            hints: [bi('einräumen splits.', 'einräumen се разделя.')],
          },
          {
            prompt: bi('On this point we can give way.', 'По тази точка можем да отстъпим.'),
            answer: 'In diesem Punkt können wir nachgeben.',
            reviewTargets: ['v-nachgeben'],
            hints: [],
          },
          {
            prompt: bi('We agree with reservations.', 'Съгласяваме се с уговорка.'),
            answer: 'Wir stimmen unter Vorbehalt zu.',
            reviewTargets: ['v-der-vorbehalt', 'v-zustimmen'],
            hints: [bi('zustimmen splits, so zu goes last.', 'zustimmen се разделя, затова zu отива в края.')],
          },
        ],
        ['g-modalpartikeln'],
      ),
    ),
    b2(
      typeIt(
        'b2u2l3-ex3',
        bi('With the particle in place', 'С частицата на място'),
        [
          {
            prompt: bi('Do just say what you think.', 'Просто кажете какво мислите.'),
            answer: 'Sagen Sie doch einfach, was Sie denken.',
            reviewTargets: ['p-partikel-doch'],
            hints: [],
            traps: [
              {
                answer: 'Doch sagen Sie einfach, was Sie denken.',
                category: 'word-order',
                feedback: bi(
                  'A modal particle never takes first position and is never stressed. It belongs in the middle: Sagen Sie doch einfach, …',
                  'Модалната частица никога не заема първа позиция и никога не е под ударение. Мястото ѝ е в средата: Sagen Sie doch einfach, …',
                ),
              },
            ],
          },
          {
            prompt: bi('Have a look at page three.', 'Погледнете на страница три.'),
            answer: 'Schauen Sie mal auf Seite drei.',
            hints: [],
          },
          {
            prompt: bi('That is hardly new.', 'Това не е нещо ново.'),
            answer: 'Das ist ja nicht neu.',
            hints: [],
          },
          {
            prompt: bi('The majority was in favour of the compromise.', 'Мнозинството беше за компромиса.'),
            answer: 'Die Mehrheit war für den Kompromiss.',
            reviewTargets: ['v-die-mehrheit', 'v-der-kompromiss'],
            hints: [],
          },
        ],
        ['g-modalpartikeln'],
      ),
    ),
    b2(
      freeWriting('b2u2l3-ex4', bi('Disagree in three sentences', 'Изрази несъгласие в три изречения'), [
        {
          prompt: bi(
            'Somebody proposes cutting the schedule by two weeks. Write three sentences: concede a point, state your reservation, and propose a condition. Use einräumen and Bedenken.',
            'Някой предлага графикът да се съкрати с две седмици. Напиши три изречения: отстъпи по една точка, изкажи резервата си и предложи условие. Използвай einräumen и Bedenken.',
          ),
          answer:
            'Ich räume ein, dass wir schneller werden müssen. Trotzdem hätte ich Bedenken. Unter einer Bedingung können wir zustimmen: wir brauchen mehr Leute.',
          requiredTokens: ['räume', 'Bedenken'],
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
    b2(
      dictation('b2u2l3-ex5', bi('Hearing the tone', 'Да чуеш тона'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Sagen Sie doch einfach, was Sie denken.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Da hätte ich Bedenken.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
  mastery: {
    passAccuracy: 0.7,
    exercises: [
      b2(
        typeIt('b2u2l3-m1', bi('Disagree without breaking the room', 'Несъгласие, без да рушиш стаята'), [
          {
            prompt: bi('Do just say what you think.', 'Просто кажете какво мислите.'),
            answer: 'Sagen Sie doch einfach, was Sie denken.',
            hints: [],
          },
          {
            prompt: bi('I would have reservations about that.', 'Тук бих имал резерви.'),
            answer: 'Da hätte ich Bedenken.',
            hints: [],
          },
          {
            prompt: bi('I concede that the schedule is tight.', 'Признавам, че графикът е стегнат.'),
            answer: 'Ich räume ein, dass der Zeitplan knapp ist.',
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
  id: 'cp-b2u2',
  scope: 'unit',
  targetId: 'b2-u2',
  status: 'available',
  passAccuracy: 0.7,
  title: bi('Checkpoint: argument and negotiation', 'Проверка: аргументация и преговори'),
  description: bi(
    'Reported speech in Konjunktiv I, je … desto in both halves, sondern against aber, and the particles that set the tone.',
    'Преизказна реч в Konjunktiv I, je … desto и в двете части, sondern срещу aber и частиците, които задават тона.',
  ),
  exercises: [
    b2(
      fillBlank('cp-b2u2-1', bi('The reporting form', 'Преизказната форма'), [
        {
          prompt: bi('haben, singular', 'haben, единствено число'),
          scaffold: 'Er sagt, er ___ keine Zeit.',
          answer: 'habe',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('sein, singular', 'sein, единствено число'),
          scaffold: 'Sie sagt, sie ___ krank.',
          answer: 'sei',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('haben, plural', 'haben, множествено число'),
          scaffold: 'Sie sagen, sie ___ keine Zeit.',
          answer: 'hätten',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      fillBlank('cp-b2u2-2', bi('aber, sondern, je, desto', 'aber, sondern, je, desto'), [
        {
          prompt: bi('after a negative', 'след отрицание'),
          scaffold: 'Wir brauchen nicht mehr Zeit, ___ mehr Leute.',
          answer: 'sondern',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('a contrast that stands', 'контраст, който остава в сила'),
          scaffold: 'Der Vorschlag ist teuer, ___ er spart uns Zeit.',
          answer: 'aber',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('closing the comparative pair', 'край на сравнителната двойка'),
          scaffold: 'Je früher wir anfangen, ___ besser.',
          answer: 'desto',
          shape: 'word',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt('cp-b2u2-3', bi('Report it', 'Предай го'), [
        {
          prompt: bi('He says he has no time.', 'Той казва, че нямал време.'),
          answer: 'Er sagt, er habe keine Zeit.',
          hints: [],
        },
        {
          prompt: bi('He claims he never received the email.', 'Той твърди, че никога не е получил имейла.'),
          answer: 'Er behauptet, er habe die E-Mail nie bekommen.',
          hints: [],
        },
        {
          prompt: bi('According to the report, the deadline was met.', 'Според доклада срокът бил спазен.'),
          answer: 'Laut dem Bericht sei die Frist eingehalten worden.',
          hints: [],
        },
      ]),
    ),
    b2(
      typeIt('cp-b2u2-4', bi('Argue it', 'Аргументирай го'), [
        {
          prompt: bi('The longer we wait, the more expensive it gets.', 'Колкото по-дълго чакаме, толкова по-скъпо става.'),
          answer: 'Je länger wir warten, desto teurer wird es.',
          hints: [],
        },
        {
          prompt: bi('The proposal is expensive, admittedly, but it saves us time later.', 'Предложението наистина е скъпо, но по-късно ни спестява време.'),
          answer: 'Der Vorschlag ist zwar teuer, aber er spart uns später Zeit.',
          hints: [],
        },
        {
          prompt: bi('Do just say what you think.', 'Просто кажете какво мислите.'),
          answer: 'Sagen Sie doch einfach, was Sie denken.',
          hints: [],
        },
      ]),
    ),
    b2(
      dictation('cp-b2u2-5', bi('Listening', 'Слушане'), [
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Er sagt, er habe keine Zeit.',
          shape: 'sentence',
          hints: [],
        },
        {
          instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
          answer: 'Je länger wir warten, desto teurer wird es.',
          shape: 'sentence',
          hints: [],
        },
      ]),
    ),
  ],
};

export const B2_UNIT_2: Unit = {
  id: 'b2-u2',
  level: 'b2',
  order: 2,
  status: 'available',
  title: bi('Argument and negotiation', 'Аргументация и преговори'),
  summary: bi(
    'Konjunktiv I for reporting a claim without endorsing it — where Bulgarian already has the category and English has none — je … desto, sondern against aber, and the particles that decide whether a disagreement lands as an invitation or an order.',
    'Konjunktiv I за предаване на чуждо твърдение без ангажимент — където българският вече има категорията, а английският няма — je … desto, sondern срещу aber и частиците, които решават дали несъгласието звучи като покана, или като заповед.',
  ),
  lessons: [lesson1, lesson2, lesson3],
  checkpoint,
};

export const B2_U2_PATTERNS = PATTERNS;
