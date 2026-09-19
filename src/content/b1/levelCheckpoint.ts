import { bi, dictation, exercise, freeWriting, typeIt } from '../authoring.ts';
import type { Checkpoint } from '../types.ts';

/**
 * The B1 level checkpoint.
 *
 * Harder than any B1 unit checkpoint, with no hints, and built around the
 * three things that actually separate a B1 speaker from an A2 one.
 *
 * **The first is the relative clause.** Everything below B1 can be said in
 * short sentences joined with und, aber and weil. A relative clause is the
 * first tool for saying two things about one noun without stopping, and it is
 * tested here in all three cases — nominative, accusative and after a
 * preposition — because a learner who can only manage the easy one has not
 * got the structure.
 *
 * **The second is register.** B1 is the level at which German stops being one
 * language and becomes two: *von meinem Bruder* against *meines Bruders*,
 * *ich bin gegangen* against *ich ging*, *ich will* against *ich hätte gern*.
 * None of those pairs differ in meaning. All of them differ in where they
 * belong, and choosing wrongly is the most audible mark of a learner. So the
 * checkpoint asks for the same content in both registers and marks the
 * difference.
 *
 * **The third is word order under pressure.** B1 introduced three families of
 * connector, and the family decides the verb's position rather than the
 * meaning. obwohl and trotzdem are nearly synonymous and behave completely
 * differently; getting them the wrong way round is the commonest B1 mistake in
 * either teaching path, so both appear here, adjacent, without hints.
 *
 * The pass mark is 80%, as at A2 — higher than a unit checkpoint, because
 * this one decides whether B2 would be survivable.
 */
export const B1_LEVEL_CHECKPOINT: Checkpoint = {
  id: 'b1-level-checkpoint',
  scope: 'level',
  targetId: 'b1',
  status: 'available',
  passAccuracy: 0.8,
  title: bi('Level checkpoint: B1', 'Проверка на нивото: B1'),
  description: bi(
    'All six units with no hints: relative clauses in three cases, the passive, Konjunktiv II, the genitive, the connector families and the written past. 80% is needed to pass.',
    'И шестте раздела, без подсказки: относителни изречения в три падежа, страдателен залог, Konjunktiv II, родителен падеж, семействата свързващи думи и писменото минало. За успех са нужни 80%.',
  ),
  exercises: [
    typeIt('b1-lcp-1', bi('Relative clauses, all three cases', 'Относителни изречения, и трите падежа'), [
      {
        prompt: bi('That is the flat that has a balcony.', 'Това е апартаментът, който има балкон.'),
        answer: 'Das ist die Wohnung, die einen Balkon hat.',
        hints: [],
      },
      {
        prompt: bi('That is the landlord I called.', 'Това е наемодателят, когото потърсих.'),
        answer: 'Das ist der Vermieter, den ich angerufen habe.',
        hints: [],
      },
      {
        prompt: bi('That is the flat I live in.', 'Това е апартаментът, в който живея.'),
        answer: 'Das ist die Wohnung, in der ich wohne.',
        hints: [],
      },
      {
        prompt: bi(
          'The people we share the building with are very quiet.',
          'Хората, с които живеем в сградата, са много тихи.',
        ),
        answer: 'Die Leute, mit denen wir im Haus wohnen, sind sehr ruhig.',
        hints: [],
      },
    ]),

    typeIt('b1-lcp-2', bi('The official voice', 'Официалният глас'), [
      {
        prompt: bi('The form is filled in at the counter.', 'Формулярът се попълва на гишето.'),
        answer: 'Das Formular wird am Schalter ausgefüllt.',
        hints: [],
      },
      {
        prompt: bi('The application has to be submitted by Friday.', 'Заявлението трябва да бъде подадено до петък.'),
        answer: 'Der Antrag muss bis Freitag eingereicht werden.',
        hints: [],
      },
      {
        prompt: bi(
          'I am going to the citizens’ office in order to register.',
          'Отивам в гражданската служба, за да се регистрирам.',
        ),
        answer: 'Ich gehe zum Bürgeramt, um mich anzumelden.',
        hints: [],
      },
    ]),

    typeIt('b1-lcp-3', bi('Politeness and hypothesis', 'Учтивост и предположение'), [
      {
        prompt: bi('I would like an appointment with the family doctor.', 'Бих искал час при личния лекар.'),
        answer: 'Ich hätte gern einen Termin beim Hausarzt.',
        hints: [],
      },
      {
        prompt: bi('Could you tell me whether the insurance pays for that?', 'Бихте ли ми казали дали осигуровката го покрива?'),
        answer: 'Könnten Sie mir sagen, ob die Versicherung das zahlt?',
        hints: [],
      },
      {
        prompt: bi('If I had more time, I would go to the doctor.', 'Ако имах повече време, бих отишъл на лекар.'),
        answer: 'Wenn ich mehr Zeit hätte, würde ich zum Arzt gehen.',
        hints: [],
      },
    ]),

    /*
     * The pair that gets mixed up, adjacent and without hints. Nearly the same
     * meaning, opposite word order, and the commonest B1 mistake in either
     * path — so if it is going to fail, it should fail here rather than in
     * front of a German.
     */
    typeIt('b1-lcp-4', bi('obwohl and trotzdem, side by side', 'obwohl и trotzdem, едно до друго'), [
      {
        prompt: bi(
          'Although I have little experience, I learn quickly.',
          'Въпреки че имам малко опит, уча бързо.',
        ),
        answer: 'Obwohl ich wenig Erfahrung habe, lerne ich schnell.',
        hints: [],
      },
      {
        prompt: bi('All the same, I would like to do further training.', 'Въпреки това искам да мина квалификация.'),
        answer: 'Trotzdem möchte ich eine Fortbildung machen.',
        hints: [],
      },
      {
        prompt: bi(
          'The contract is fixed-term, so I am looking for something new.',
          'Договорът е срочен, затова търся нещо ново.',
        ),
        answer: 'Der Vertrag ist befristet, deshalb suche ich etwas Neues.',
        hints: [],
      },
    ]),

    /*
     * Register, tested directly. The same fact in the voice it belongs in —
     * and the genitive, which is the clearest single marker of written German.
     */
    exercise({
      id: 'b1-lcp-5',
      kind: 'fillBlank',
      level: 'b1',
      objective: bi('The written register', 'Писменият регистър'),
      steps: [
        {
          prompt: bi('der Bewerber — the applicant’s CV', 'der Bewerber — автобиографията на кандидата'),
          scaffold: 'der Lebenslauf ___ Bewerbers',
          answer: 'des',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('die Abteilung — the head of the department', 'die Abteilung — ръководителят на отдела'),
          scaffold: 'der Leiter ___ Abteilung',
          answer: 'der',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('wohnen, in writing — we lived there', 'wohnen, в писмен вид — живеехме там'),
          scaffold: 'Damals ___ wir noch in Bulgarien.',
          answer: 'wohnten',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('after the salutation comma', 'след запетаята на обръщението'),
          scaffold: 'Sehr geehrte Frau Weber, ___ schreibe Ihnen wegen der Wohnung.',
          answer: 'ich',
          shape: 'word',
          hints: [],
        },
      ],
    }),

    exercise({
      id: 'b1-lcp-6',
      kind: 'fillBlank',
      level: 'b1',
      objective: bi('The small words that decide it', 'Малките думи, които решават'),
      steps: [
        {
          prompt: bi('once, in the past', 'веднъж, в миналото'),
          scaffold: '___ ich zehn war, kam ich aufs Gymnasium.',
          answer: 'Als',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('every time', 'всеки път'),
          scaffold: '___ ich Zeit hatte, spielte ich Fußball.',
          answer: 'Wenn',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('applying for a position', 'кандидатстване за позиция'),
          scaffold: 'Ich bewerbe mich ___ die Stelle.',
          answer: 'um',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('looking forward to a reply', 'очакване на отговор'),
          scaffold: 'Ich freue mich ___ Ihre Antwort.',
          answer: 'auf',
          shape: 'word',
          hints: [],
        },
        {
          prompt: bi('a yes-or-no question inside a sentence', 'въпрос с „да/не“ вътре в изречение'),
          scaffold: 'Ich wollte fragen, ___ die Kasse das zahlt.',
          answer: 'ob',
          shape: 'word',
          hints: [],
        },
      ],
    }),

    typeIt('b1-lcp-7', bi('Telling it, and writing it', 'Разказано и написано'), [
      {
        prompt: bi('Back then we still lived in Bulgaria.', 'Тогава още живеехме в България.'),
        answer: 'Damals wohnten wir noch in Bulgarien.',
        alternatives: ['Wir wohnten damals noch in Bulgarien.'],
        hints: [],
      },
      {
        prompt: bi('When I was ten I went to the Gymnasium.', 'Когато бях на десет, отидох в гимназия.'),
        answer: 'Als ich zehn war, kam ich aufs Gymnasium.',
        hints: [],
      },
      {
        prompt: bi(
          'After we had moved, I found a new school.',
          'След като се бяхме преместили, намерих ново училище.',
        ),
        answer: 'Nachdem wir umgezogen waren, fand ich eine neue Schule.',
        hints: [],
      },
    ]),

    typeIt('b1-lcp-8', bi('An argument, and a letter', 'Аргумент и писмо'), [
      {
        prompt: bi('In my opinion that is not a good idea.', 'По мое мнение това не е добра идея.'),
        answer: 'Meiner Meinung nach ist das keine gute Idee.',
        hints: [],
      },
      {
        prompt: bi(
          'On the one hand it is practical, on the other it is expensive.',
          'От една страна е практично, от друга е скъпо.',
        ),
        answer: 'Einerseits ist es praktisch, andererseits ist es teuer.',
        hints: [],
      },
      {
        prompt: bi(
          'I hereby inform you that I have to cancel the appointment.',
          'С настоящото ви съобщавам, че трябва да отменя часа.',
        ),
        answer: 'Hiermit teile ich Ihnen mit, dass ich den Termin absagen muss.',
        hints: [],
      },
    ]),

    dictation('b1-lcp-9', bi('Listening, at speed', 'Слушане, с темпо'), [
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Das ist die Wohnung, die einen Balkon hat.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Der Antrag muss bis Freitag eingereicht werden.',
        shape: 'sentence',
        hints: [],
      },
      {
        instruction: bi('Type what you hear.', 'Напиши каквото чуваш.'),
        answer: 'Wenn ich mehr Zeit hätte, würde ich zum Arzt gehen.',
        shape: 'sentence',
        hints: [],
      },
    ]),

    /*
     * The level ends by asking for the thing B1 is defined by: a position,
     * held and defended in writing. Checked for the connectives rather than
     * for a model answer, because there is no single right one.
     */
    freeWriting('b1-lcp-10', bi('Hold a position', 'Защити позиция'), [
      {
        prompt: bi(
          'Write four sentences about working from home: your position, one advantage, one disadvantage, and a conclusion. Use Meiner Meinung nach, Einerseits and Andererseits.',
          'Напиши четири изречения за работата от вкъщи: твоята позиция, едно предимство, един недостатък и заключение. Използвай Meiner Meinung nach, Einerseits и Andererseits.',
        ),
        answer:
          'Meiner Meinung nach ist Homeoffice eine gute Möglichkeit. Einerseits spart man Zeit, andererseits hat man weniger Kontakt. Zusammenfassend kann man sagen, dass beides Vorteile hat.',
        requiredTokens: ['Meinung', 'Einerseits'],
        shape: 'sentence',
        hints: [],
      },
    ]),
  ],
};
