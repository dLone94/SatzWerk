import { bi, dictation, exercise, freeWriting, typeIt } from '../authoring.ts';
import type { Checkpoint } from '../types.ts';

/**
 * The B2 level checkpoint — and the last thing in the course.
 *
 * B1's checkpoint asked whether the learner could hold a position. This one
 * asks a different question, and it is the question B2 is really about:
 * **can you tell which room you are in?**
 *
 * Every level below this one had a single right answer per prompt. At B2 the
 * same fact has two correct forms and only one of them belongs where you are
 * standing. *Ich habe Ihre Nachricht erhalten* and *Hast du meine Nachricht
 * gekriegt?* are both perfect German and neither can be swapped for the other.
 * So the checkpoint deliberately asks for the same content twice, in two
 * registers, and marks the pair rather than the sentence.
 *
 * It draws on all five units:
 *
 * 1. **Unit 1** — the passive across the tenses, and the *worden* that gives a
 *    learner away.
 * 2. **Unit 2** — Konjunktiv I, where the two paths stand furthest apart:
 *    Bulgarian has the category and English has no marker at all.
 * 3. **Unit 3** — a participial block in front of its noun, which is the
 *    hardest thing in the level to read at speed.
 * 4. **Unit 4** — the genitive prepositions and the frames a letter asks with.
 * 5. **Unit 5** — a contracted sentence written out in full, which is the only
 *    listening skill in the course that cannot be faked by grammar.
 *
 * The pass mark is 80%, as at A1, A2 and B1. It is the same bar because the
 * claim is the same: a level is finished when almost none of it is still a
 * guess.
 */
export const B2_LEVEL_CHECKPOINT: Checkpoint = {
  id: 'b2-level-checkpoint',
  scope: 'level',
  targetId: 'b2',
  status: 'available',
  passAccuracy: 0.8,
  title: bi('Level checkpoint: B2', 'Проверка на нивото: B2'),
  description: bi(
    'All five units with no hints: the passive in every tense, reported speech, a participle block, the formal letter, and spoken German written out in full. The same fact in two registers, twice. 80% is needed to pass.',
    'И петте раздела, без подсказки: страдателен залог във всички времена, преизказна реч, причастен блок, официалното писмо и говорим немски, изписан изцяло. Един и същ факт в два регистъра, два пъти. За успех са нужни 80%.',
  ),
  exercises: [
    typeIt('b2-lcp-1', bi('The passive, in every tense', 'Страдателен залог във всички времена'), [
      {
        prompt: bi('The report was submitted yesterday.', 'Докладът беше подаден вчера.'),
        answer: 'Der Bericht wurde gestern eingereicht.',
        hints: [],
      },
      {
        prompt: bi('The order was processed yesterday. (spoken)', 'Поръчката беше обработена вчера. (говоримо)'),
        answer: 'Der Auftrag ist gestern bearbeitet worden.',
        hints: [],
      },
      {
        prompt: bi('The meeting had to be postponed.', 'Срещата трябваше да бъде отложена.'),
        answer: 'Die Besprechung musste verschoben werden.',
        hints: [],
      },
      {
        prompt: bi('The order is done.', 'Поръчката е приключена.'),
        answer: 'Der Auftrag ist erledigt.',
        hints: [],
      },
    ]),

    typeIt('b2-lcp-2', bi('Somebody else’s words', 'Чужди думи'), [
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
        prompt: bi('They say they have no time.', 'Казват, че нямали време.'),
        answer: 'Sie sagen, sie hätten keine Zeit.',
        hints: [],
      },
    ]),

    typeIt('b2-lcp-3', bi('Reading the front page', 'Четене на първа страница'), [
      {
        prompt: bi('The reform planned by the government is contested.', 'Планираната от правителството реформа е спорна.'),
        answer: 'Die von der Regierung geplante Reform ist umstritten.',
        hints: [],
      },
      {
        prompt: bi('The number of applications has fallen by twelve percent.', 'Броят на заявленията е намалял с дванайсет процента.'),
        answer: 'Die Zahl der Anträge ist um zwölf Prozent gesunken.',
        alternatives: [
          'Die Zahl der Anträge ist um 12 Prozent gesunken.',
          'Die Zahl der Anträge ist um 12 % gesunken.',
          'Die Zahl der Anträge ist um 12% gesunken.',
        ],
        hints: [],
      },
      {
        prompt: bi('The consequences cannot be foreseen yet.', 'Последиците още не могат да се предвидят.'),
        answer: 'Die Folgen sind noch nicht absehbar.',
        hints: [],
      },
    ]),

    /*
     * The pair the whole level turns on: the same fact, twice, in the two
     * registers it lives in. Adjacent and unhinted, so that if the distinction
     * is going to fail it fails here rather than in an email to a landlord.
     */
    typeIt('b2-lcp-4', bi('The same fact, twice', 'Един и същ факт, два пъти'), [
      {
        prompt: bi('To a colleague: Did you get my message?', 'На колега: Получи ли съобщението ми?'),
        answer: 'Hast du meine Nachricht gekriegt?',
        alternatives: ['Hast du meine Nachricht bekommen?'],
        hints: [],
      },
      {
        prompt: bi('In a formal email: Did you receive my message?', 'В официален имейл: Получихте ли съобщението ми?'),
        answer: 'Haben Sie meine Nachricht erhalten?',
        alternatives: ['Haben Sie meine Nachricht bekommen?'],
        hints: [],
      },
      {
        prompt: bi('To a friend: Did everything work out?', 'На приятел: Всичко ли се получи?'),
        answer: 'Hat alles geklappt?',
        hints: [],
      },
      {
        prompt: bi('In a letter: I request a written confirmation.', 'В писмо: Моля за писмено потвърждение.'),
        answer: 'Ich bitte um eine schriftliche Bestätigung.',
        hints: [],
      },
    ]),

    exercise({
      id: 'b2-lcp-5',
      kind: 'fillBlank',
      level: 'b2',
      objective: bi('The written apparatus', 'Писменият апарат'),
      steps: [
        {
          prompt: bi('der Mangel — because of the defect', 'der Mangel — поради дефекта'),
          scaffold: 'aufgrund ___ Mangels',
          answer: 'des',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('die Verzögerung — despite the delay', 'die Verzögerung — въпреки забавянето'),
          scaffold: 'trotz ___ Verzögerung',
          answer: 'der',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('claim the warranty', 'да се възползвам от гаранцията'),
          scaffold: 'Ich möchte die Gewährleistung in ___ nehmen.',
          answer: 'Anspruch',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('no ge- in a passive', 'без ge- в страдателен залог'),
          scaffold: 'Der Bericht ist eingereicht ___.',
          answer: 'worden',
          shape: 'word',
          hints: [],
        },
      ],
    }),

    exercise({
      id: 'b2-lcp-6',
      kind: 'fillBlank',
      level: 'b2',
      objective: bi('The small words that decide it', 'Малките думи, които решават'),
      steps: [
        {
          prompt: bi('by ten percent', 'с десет процента'),
          scaffold: 'Die Mieten sind ___ zehn Prozent gestiegen.',
          answer: 'um',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('to 900 euros', 'до 900 евро'),
          scaffold: 'Die Miete ist ___ 900 Euro gestiegen.',
          answer: 'auf',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('after a negative', 'след отрицание'),
          scaffold: 'Wir brauchen nicht mehr Zeit, ___ mehr Leute.',
          answer: 'sondern',
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
        {
          prompt: bi('a participle in front of its noun', 'причастие пред съществителното'),
          scaffold: 'die gestern ___ Studie',
          answer: 'veröffentlichte',
          shape: 'word',
          hints: [],
        },
      ],
    }),

    typeIt('b2-lcp-7', bi('Holding a position', 'Защита на позиция'), [
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
        prompt: bi('I would like to point out that the deadline has passed.', 'Бих искал да Ви обърна внимание, че срокът е изтекъл.'),
        answer: 'Ich möchte Sie darauf hinweisen, dass die Frist abgelaufen ist.',
        hints: [],
      },
    ]),

    typeIt('b2-lcp-8', bi('What you actually heard', 'Какво наистина чу'), [
      {
        prompt: bi('You hear: "Haste mal kurz?" — write it out in full.', 'Чуваш: „Haste mal kurz?“ — напиши го изцяло.'),
        answer: 'Hast du mal kurz?',
        hints: [],
      },
      {
        prompt: bi('You hear: "Ich hab ’ne Frage." — write it out in full.', 'Чуваш: „Ich hab ’ne Frage.“ — напиши го изцяло.'),
        answer: 'Ich habe eine Frage.',
        hints: [],
      },
      {
        prompt: bi('You hear: "Hab ich nicht gesehen." — write it out in full.', 'Чуваш: „Hab ich nicht gesehen.“ — напиши го изцяло.'),
        answer: 'Das habe ich nicht gesehen.',
        hints: [],
      },
    ]),

    dictation('b2-lcp-9', bi('Listening, at speed', 'Слушане, с темпо'), [
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Die von der Regierung geplante Reform ist umstritten.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Er sagt, er habe keine Zeit.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Aufgrund der Verzögerung bitte ich um eine Rückerstattung.',
        shape: 'sentence',
        hints: [],
      },
    ]),

    /*
     * The course ends where B2 ends: the same content, written twice, once for
     * a colleague and once for a company. Checked for the register markers
     * rather than for a model answer, because there is no single right one.
     */
    freeWriting('b2-lcp-10', bi('Write it twice', 'Напиши го два пъти'), [
      {
        prompt: bi(
          'A delivery arrived damaged. Write two sentences to a colleague, then two to the company. Use gekriegt or geklappt in the first and bitte plus a genitive preposition in the second.',
          'Доставка е пристигнала повредена. Напиши две изречения до колега и после две до фирмата. Използвай gekriegt или geklappt в първите и bitte плюс предлог с родителен падеж във вторите.',
        ),
        answer:
          'Die Lieferung ist kaputt angekommen, hat überhaupt nicht geklappt. Aufgrund des Mangels bitte ich um eine Rückerstattung des Kaufpreises.',
        requiredTokens: ['geklappt', 'bitte'],
        shape: 'sentence',
        hints: [],
      },
    ]),
  ],
};
