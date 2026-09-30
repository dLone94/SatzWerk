import { bi } from '../authoring.ts';
import type { ScenarioScript } from '../types.ts';
import { narrator, registerTrap, script, them, you } from './authoring.ts';

/**
 * At work, and at the Kita.
 *
 * These two are where register stops being a rule and starts being a
 * decision: the colleague at the coffee machine opened with du and the
 * interview panel never will, and the same person has to do both in one week.
 *
 * The Kita scripts are also the one place in Real Life where the two teaching
 * paths say genuinely different sentences, because the language spoken at home
 * is not the same sentence for both households.
 */

const WORK_A2 = script({
  id: 'sc-work-a2',
  scenarioId: 'sc-work',
  level: 'a2',
  register: 'du',
  partner: bi('Lisa from marketing', 'Лиза от маркетинга'),
  goal: bi('First day: say what you do, and get somebody to help you.', 'Първи ден: кажи какво работиш и накарай някого да ти помогне.'),
  lessonIds: ['a2-u4-l1'],
  outro: bi(
    'She opened with du, so du it stayed. The verb to watch is helfen: it takes a dative, which is why it is mir and never mich.',
    'Тя започна с „du“, значи остана „du“. Глаголът за внимание е „helfen“: иска дателен падеж, затова е „mir“ и никога „mich“.',
  ),
  beats: [
    narrator(
      bi(
        'Coffee machine, nine in the morning, day one. Somebody turns round.',
        'Кафемашината, девет сутринта, първи ден. Някой се обръща.',
      ),
    ),
    them('Du bist neu, oder? Ich bin Lisa aus dem Marketing.', bi('You are new, right? I am Lisa from marketing.', 'Ти си нов, нали? Аз съм Лиза от маркетинга.')),
    you(
      'sc-work-a2-t1',
      bi('Introduce yourself and your department', 'Представи себе си и отдела си'),
      [
        {
          id: 'sc-work-a2-t1-s1',
          instruction: bi(
            'A department takes in + dative: in der Buchhaltung, im Vertrieb, in der IT.',
            'Отделът иска „in“ + дателен падеж: in der Buchhaltung, im Vertrieb, in der IT.',
          ),
          prompt: bi('You are Martin, and you work in accounting.', 'Ти си Мартин и работиш в счетоводството.'),
          answer: 'Ja, ich bin Martin. Ich arbeite in der Buchhaltung.',
          alternatives: [
            'Ja, ich bin Martin, ich arbeite in der Buchhaltung.',
            'Ja, Martin. Ich arbeite in der Buchhaltung.',
            'Ich bin Martin. Ich arbeite in der Buchhaltung.',
            'Ich bin Martin, ich arbeite in der Buchhaltung.',
            'Martin. Ich arbeite in der Buchhaltung.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-arbeiten', 'v-die-abteilung'],
          hints: [
            bi('in + der for a feminine department.', '„in“ + „der“ за отдел от женски род.'),
            bi('Ich arbeite in d__ Buchhaltung.', 'Ich arbeite in d__ Buchhaltung.'),
          ],
        },
      ],
      'a2',
    ),
    them('Cool. Und, kommst du klar bisher?', bi('Cool. And, are you getting on all right so far?', 'Готино. И как се справяш дотук?')),
    you(
      'sc-work-a2-t2',
      bi('Ask her for help', 'Помоли я за помощ'),
      [
        {
          id: 'sc-work-a2-t2-s1',
          instruction: bi(
            'helfen takes the dative, so it is "hilf mir", never "hilf mich" — the person helped is not an object being acted on.',
            '„helfen“ иска дателен падеж, точно както българското „помогни ми“: човекът, на когото помагаш, не е пряко допълнение.',
          ),
          prompt: bi('Ask whether she can help you — you cannot find the printer.', 'Попитай дали може да ти помогне — не намираш принтера.'),
          answer: 'Kannst du mir kurz helfen? Ich finde den Drucker nicht.',
          alternatives: [
            'Kannst du mir kurz helfen? Ich finde den Drucker einfach nicht.',
            'Hilfst du mir kurz? Ich finde den Drucker nicht.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-helfen', 'v-finden'],
          traps: [
            {
              answer: 'Kannst du mich kurz helfen? Ich finde den Drucker nicht.',
              category: 'case',
              feedback: bi(
                'helfen is one of the dative verbs: mir, not mich. The same goes for danken, antworten and gehören.',
                '„helfen“ е от глаголите с дателен падеж: „mir“, не „mich“. Същото важи за „danken“, „antworten“ и „gehören“.',
              ),
            },
            registerTrap('Können Sie mir kurz helfen? Ich finde den Drucker nicht.', 'du'),
          ],
          hints: [
            bi('The pronoun after helfen is in the dative.', 'Местоимението след „helfen“ е в дателен падеж.'),
            bi('Kannst du m__ kurz helfen?', 'Kannst du m__ kurz helfen?'),
          ],
        },
      ],
      'a2',
    ),
    them('Klar, der steht hinten links, neben der Küche.', bi('Sure, it is at the back on the left, next to the kitchen.', 'Разбира се, отзад вляво, до кухнята.')),
    you(
      'sc-work-a2-t3',
      bi('Ask about the wifi', 'Попитай за безжичната мрежа'),
      [
        {
          id: 'sc-work-a2-t3-s1',
          instruction: bi(
            'Getting onto a network is "ins WLAN kommen" — movement into it, so accusative.',
            'Свързването с мрежата е „ins WLAN kommen“ — движение навътре, значи винителен падеж.',
          ),
          prompt: bi('Ask how you get onto the wifi.', 'Попитай как да влезеш в безжичната мрежа.'),
          answer: 'Und wie komme ich ins WLAN?',
          alternatives: ['Wie komme ich ins WLAN?', 'Und wie bekomme ich das WLAN-Passwort?'],
          shape: 'sentence',
          hints: [
            bi('in + das becomes ins.', '„in“ + „das“ става „ins“.'),
            bi('Und wie komme ich i__ WLAN?', 'Und wie komme ich i__ WLAN?'),
          ],
        },
      ],
      'a2',
    ),
    them('Das Passwort steht an der Pinnwand in der Küche.', bi('The password is on the noticeboard in the kitchen.', 'Паролата е на таблото в кухнята.')),
    you(
      'sc-work-a2-t4',
      bi('Thank her, informally', 'Благодари ѝ неофициално'),
      [
        {
          id: 'sc-work-a2-t4-s1',
          instruction: bi(
            '"danke dir" is the du version of "danke Ihnen", and danken takes the dative as well.',
            '„danke dir“ е версията на „danke Ihnen“ за „du“, а „danken“ също иска дателен падеж.',
          ),
          prompt: bi('Thank her.', 'Благодари ѝ.'),
          answer: 'Super, danke dir!',
          alternatives: ['Danke dir!', 'Perfekt, danke dir!'],
          shape: 'phrase',
          reviewTargets: ['v-danke'],
          hints: [bi('Dative again: dir.', 'Пак дателен падеж: „dir“.')],
        },
      ],
      'a2',
    ),
  ],
});

const WORK_B1 = script({
  id: 'sc-work-b1',
  scenarioId: 'sc-work',
  level: 'b1',
  register: 'Sie',
  partner: bi('the interviewer', 'интервюиращият'),
  goal: bi('Answer the four questions every German interview asks.', 'Отговори на четирите въпроса, които всяко немско интервю задава.'),
  lessonIds: ['b1-u4-l3'],
  outro: bi(
    'The weakness question is not a trap and not a confession: the expected answer is one real shortcoming plus what you do about it. Anything else — "I work too hard" — reads as evasion here.',
    'Въпросът за слабостта не е капан, нито изповед: очакваният отговор е един истински недостатък плюс какво правиш по въпроса. Всичко друго — „работя твърде много“ — звучи като бягство.',
  ),
  beats: [
    them(
      'Erzählen Sie uns, warum Sie sich bei uns beworben haben.',
      bi('Tell us why you applied to us.', 'Разкажете ни защо кандидатствахте при нас.'),
    ),
    you(
      'sc-work-b1-t1',
      bi('Give experience and motive in one sentence', 'Дай опита и мотива в едно изречение'),
      [
        {
          id: 'sc-work-b1-t1-s1',
          instruction: bi(
            'Verantwortung übernehmen — to take on responsibility — is the standard phrase, and it is what the question is really asking about.',
            '„Verantwortung übernehmen“ — да поемеш отговорност — е стандартната фраза и точно за нея пита въпросът.',
          ),
          prompt: bi(
            'Five years in logistics, and you want more responsibility.',
            'Пет години в логистиката и искаш повече отговорност.',
          ),
          answer: 'Ich arbeite seit fünf Jahren in der Logistik und möchte mehr Verantwortung übernehmen.',
          alternatives: [
            'Ich bin seit fünf Jahren in der Logistik und möchte mehr Verantwortung übernehmen.',
            'Ich arbeite seit fünf Jahren in der Logistik und würde gern mehr Verantwortung übernehmen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-erfahrung', 'v-sich-bewerben'],
          hints: [
            bi('seit + dative, then the infinitive at the end.', '„seit“ + дателен падеж, после инфинитивът накрая.'),
            bi('… und möchte mehr Verantwortung ü_________.', '… und möchte mehr Verantwortung ü_________.'),
          ],
        },
      ],
      'b1',
    ),
    them('Was sind Ihre Stärken?', bi('What are your strengths?', 'Кои са силните Ви страни?')),
    you(
      'sc-work-b1-t2',
      bi('Name two, without a speech', 'Назови две, без реч'),
      [
        {
          id: 'sc-work-b1-t2-s1',
          instruction: bi(
            'Two adjectives and a full stop. German interviews do not expect the extended narrative an English one sometimes does.',
            'Две прилагателни и точка. Немските интервюта не очакват дългия разказ, който понякога се очаква на английски.',
          ),
          prompt: bi('You work in a structured way and you are reliable.', 'Работиш структурирано и си надежден.'),
          answer: 'Ich arbeite sehr strukturiert und bin zuverlässig.',
          alternatives: [
            'Ich bin zuverlässig und arbeite sehr strukturiert.',
            'Ich arbeite strukturiert und bin sehr zuverlässig.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-staerke', 'v-zuverlaessig'],
          hints: [
            bi('One verb for how you work, one for what you are.', 'Един глагол за това как работиш, един за това какъв си.'),
            bi('Ich arbeite sehr strukturiert und b__ zuverlässig.', 'Ich arbeite sehr strukturiert und b__ zuverlässig.'),
          ],
        },
      ],
      'b1',
    ),
    them('Und Ihre Schwächen?', bi('And your weaknesses?', 'А слабите Ви страни?'), {
      note: bi(
        'Answer it straight. A German panel reads "I am a perfectionist" as a refusal to answer, and the refusal is what counts against you.',
        'Отговори директно. Немската комисия чете „аз съм перфекционист“ като отказ да отговориш, а отказът е това, което ти вреди.',
      ),
    }),
    you(
      'sc-work-b1-t3',
      bi('Give a real one, and what you do about it', 'Дай истинска и какво правиш по въпроса'),
      [
        {
          id: 'sc-work-b1-t3-s1',
          instruction: bi(
            'daran arbeiten — to be working on it — is the second half that turns a weakness into an answer.',
            '„daran arbeiten“ — работя по въпроса — е втората половина, която превръща слабостта в отговор.',
          ),
          prompt: bi(
            'You are impatient when things stall, and you are working on it.',
            'Нетърпелив си, когато нещата стоят на място, и работиш по въпроса.',
          ),
          answer: 'Ich bin ungeduldig, wenn Dinge liegen bleiben. Daran arbeite ich.',
          alternatives: [
            'Ich werde ungeduldig, wenn Dinge liegen bleiben. Daran arbeite ich.',
            'Ich bin ungeduldig, wenn etwas liegen bleibt. Daran arbeite ich.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-schwaeche'],
          hints: [
            bi('The wenn-clause puts its verb last.', 'Частта с „wenn“ слага глагола си последен.'),
            bi('…, wenn Dinge liegen b______. Daran arbeite ich.', '…, wenn Dinge liegen b______. Daran arbeite ich.'),
          ],
        },
      ],
      'b1',
    ),
    them('Wann könnten Sie anfangen?', bi('When could you start?', 'Кога бихте могли да започнете?')),
    you(
      'sc-work-b1-t4',
      bi('Answer with your notice period', 'Отговори със срока си на предизвестие'),
      [
        {
          id: 'sc-work-b1-t4-s1',
          instruction: bi(
            'betragen is the formal verb for an amount or a period being a certain size — the register this question expects.',
            '„betragen“ е официалният глагол за това колко е дадена сума или срок — регистърът, който въпросът очаква.',
          ),
          prompt: bi('Your notice period is three months.', 'Срокът ти на предизвестие е три месеца.'),
          answer: 'Meine Kündigungsfrist beträgt drei Monate.',
          alternatives: [
            'Ich habe drei Monate Kündigungsfrist.',
            'Meine Kündigungsfrist beträgt drei Monate, also ab dem ersten Juli.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-kuendigungsfrist', 'v-betragen'],
          traps: [registerTrap('Meine Kündigungsfrist beträgt drei Monate, passt dir das?', 'Sie')],
          hints: [
            bi('The verb changes its vowel: betragen becomes beträgt.', 'Глаголът сменя гласната: „betragen“ става „beträgt“.'),
            bi('Meine Kündigungsfrist b______ drei Monate.', 'Meine Kündigungsfrist b______ drei Monate.'),
          ],
        },
      ],
      'b1',
    ),
  ],
});

const WORK_B2 = script({
  id: 'sc-work-b2',
  scenarioId: 'sc-work',
  level: 'b2',
  register: 'Sie',
  partner: bi('the project lead', 'ръководителят на проекта'),
  goal: bi(
    'Disagree with a date in front of the room, and leave with a date you can actually hit.',
    'Възрази срещу срока пред цялата стая и си тръгни със срок, който наистина можеш да спазиш.',
  ),
  lessonIds: ['b2-u1-l2'],
  outro: bi(
    'Nothing in that was a refusal. Bedenken names a concern without naming a culprit, einplanen turns your objection into a number, and sich einigen auf is the verb that ends a negotiation rather than a fight.',
    'Нищо в това не беше отказ. „Bedenken“ назовава притеснение, без да назовава виновник, „einplanen“ превръща възражението ти в число, а „sich einigen auf“ е глаголът, който приключва преговор, а не свада.',
  ),
  beats: [
    narrator(
      bi(
        'Nine people on the call. The launch date is on the slide, and it is two weeks too early.',
        'Девет души на разговора. Датата на пускане е на слайда и е с две седмици по-рано.',
      ),
    ),
    them(
      'Wir schlagen vor, den Launch auf den fünfzehnten vorzuziehen.',
      bi('We propose bringing the launch forward to the fifteenth.', 'Предлагаме пускането да се премести напред за петнайсети.'),
    ),
    you(
      'sc-work-b2-t1',
      bi('Register the concern without attacking the plan', 'Заяви притеснението, без да атакуваш плана'),
      [
        {
          id: 'sc-work-b2-t1-s1',
          instruction: bi(
            'Bedenken haben is the professional way to disagree: it names a concern, not a fault, and nobody in the room has to defend themselves.',
            '„Bedenken haben“ е професионалният начин да не се съгласиш: назовава притеснение, а не вина, и никой в стаята не трябва да се защитава.',
          ),
          prompt: bi('You have concerns: the tests are not finished by then.', 'Имаш притеснения: тестовете няма да са готови дотогава.'),
          answer: 'Da habe ich Bedenken. Die Tests sind bis dahin nicht abgeschlossen.',
          alternatives: [
            'Da hätte ich Bedenken. Die Tests sind bis dahin nicht abgeschlossen.',
            'Ich habe da Bedenken, die Tests sind bis dahin nicht abgeschlossen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-das-bedenken', 'v-der-einwand'],
          traps: [
            {
              answer: 'Das geht nicht. Die Tests sind bis dahin nicht abgeschlossen.',
              category: 'vocabulary',
              feedback: bi(
                '"Das geht nicht" closes the discussion and makes the next three minutes about whether you are right. Bedenken opens it and keeps the same facts.',
                '„Das geht nicht“ затваря разговора и превръща следващите три минути в спор дали си прав. „Bedenken“ го отваря и запазва същите факти.',
              ),
            },
          ],
          hints: [
            bi('Start with da, so the verb comes second.', 'Започни с „da“, значи глаголът е втори.'),
            bi('Da h___ ich Bedenken.', 'Da h___ ich Bedenken.'),
          ],
        },
      ],
      'b2',
    ),
    them('Wie lange bräuchten Sie denn?', bi('How long would you need, then?', 'А колко време би Ви трябвало?')),
    you(
      'sc-work-b2-t2',
      bi('Turn the concern into a number', 'Превърни притеснението в число'),
      [
        {
          id: 'sc-work-b2-t2-s1',
          instruction: bi(
            'einplanen is to build something into a schedule. Konjunktiv II — ich würde einplanen — proposes it rather than announcing it.',
            '„einplanen“ значи да вградиш нещо в графика. Konjunktiv II — ich würde einplanen — го предлага, вместо да го обявява.',
          ),
          prompt: bi(
            'You would schedule two extra weeks, and then the quality holds.',
            'Би заложил две допълнителни седмици и тогава качеството е гарантирано.',
          ),
          answer: 'Ich würde zwei zusätzliche Wochen einplanen, dann ist die Qualität gesichert.',
          alternatives: [
            'Ich würde zwei Wochen zusätzlich einplanen, dann ist die Qualität gesichert.',
            'Ich würde zwei zusätzliche Wochen einplanen, damit die Qualität stimmt.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-der-zeitplan', 'v-die-verzoegerung'],
          hints: [
            bi('würde plus the infinitive at the end.', '„würde“ плюс инфинитив накрая.'),
            bi('Ich w____ zwei zusätzliche Wochen einplanen …', 'Ich w____ zwei zusätzliche Wochen einplanen …'),
          ],
        },
      ],
      'b2',
    ),
    them(
      'Zwei Wochen sind zu viel. Geht es auch mit einer?',
      bi('Two weeks is too much. Would one do?', 'Две седмици са много. Става ли с една?'),
    ),
    you(
      'sc-work-b2-t3',
      bi('Propose the middle, and say what it buys', 'Предложи средата и кажи какво печели тя'),
      [
        {
          id: 'sc-work-b2-t3-s1',
          instruction: bi(
            'sich einigen auf takes the accusative, and putting the verb first — einigen wir uns — makes it an invitation rather than a demand.',
            '„sich einigen auf“ иска винителен падеж, а глаголът на първо място — einigen wir uns — го прави покана, а не искане.',
          ),
          prompt: bi(
            'Suggest agreeing on ten days, which covers the important tests.',
            'Предложи да се спрете на десет дни, което покрива важните тестове.',
          ),
          answer: 'Einigen wir uns auf zehn Tage, dann schaffen wir die wichtigsten Tests.',
          alternatives: [
            'Können wir uns auf zehn Tage einigen? Dann schaffen wir die wichtigsten Tests.',
            'Einigen wir uns auf zehn Tage, dann sind die wichtigsten Tests durch.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-sich-einigen', 'v-der-kompromiss'],
          traps: [
            {
              answer: 'Einigen wir uns auf zehn Tagen, dann schaffen wir die wichtigsten Tests.',
              category: 'case',
              feedback: bi(
                'auf here is the target of an agreement, not a location, so it takes the accusative: auf zehn Tage.',
                'Тук „auf“ е целта на споразумението, а не място, затова иска винителен падеж: auf zehn Tage.',
              ),
            },
          ],
          hints: [
            bi('Verb first for the invitation, then auf + accusative.', 'Първо глаголът за поканата, после „auf“ + винителен падеж.'),
            bi('Einigen wir uns auf zehn T___ …', 'Einigen wir uns auf zehn T___ …'),
          ],
        },
      ],
      'b2',
    ),
    them('Einverstanden. Dann der fünfundzwanzigste.', bi('Agreed. The twenty-fifth, then.', 'Съгласен. Тогава двайсет и пети.')),
    you(
      'sc-work-b2-t4',
      bi('Close the loop in writing', 'Затвори кръга писмено'),
      [
        {
          id: 'sc-work-b2-t4-s1',
          instruction: bi(
            'Offering to put it in the minutes is how a German meeting makes a decision real, and it is your job now because it was your proposal.',
            'Да предложиш да го впишеш в протокола е начинът, по който немската среща прави решението реално — и е твоя работа, защото предложението беше твое.',
          ),
          prompt: bi(
            'Say you will note it in the minutes.',
            'Кажи, че ще го запишеш в протокола.',
          ),
          answer: 'Gut, ich halte das im Protokoll fest.',
          alternatives: [
            'Gut, ich nehme das ins Protokoll auf.',
            'Gut, ich schreibe das ins Protokoll.',
            'Ich halte das im Protokoll fest.',
            'Ich nehme das ins Protokoll auf.',
            'Ich schreibe das ins Protokoll.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-das-protokoll'],
          hints: [
            bi('festhalten is separable: fest goes to the end.', '„festhalten“ е делим: „fest“ отива накрая.'),
            bi('Gut, ich h____ das im Protokoll f___.', 'Gut, ich h____ das im Protokoll f___.'),
          ],
        },
      ],
      'b2',
    ),
  ],
});

const KITA_A2 = script({
  id: 'sc-kita-a2',
  scenarioId: 'sc-kita',
  level: 'a2',
  register: 'Sie',
  partner: bi('the Kita office', 'канцеларията на детската градина'),
  goal: bi('Phone in that your child is ill and will not be coming.', 'Обади се, че детето ти е болно и няма да дойде.'),
  lessonIds: ['a2-u5-l2'],
  outro: bi(
    'A German Kita expects this call before nine, every time, even for one day. It is four sentences and it is the one piece of parent German you will use most.',
    'Немската градина очаква това обаждане преди девет, всеки път, дори за един ден. Четири изречения са и са частта от родителския немски, която ще използваш най-често.',
  ),
  beats: [
    them('Kita Sonnenschein, guten Morgen!', bi('Sonnenschein nursery, good morning!', 'Детска градина „Слънчице“, добро утро!')),
    you(
      'sc-kita-a2-t1',
      bi('Say who you are and why you are calling', 'Кажи кой си и защо се обаждаш'),
      [
        {
          id: 'sc-kita-a2-t1-s1',
          instruction: bi(
            'On the phone, Germans announce themselves with "hier ist" — literally "here is" — rather than "I am".',
            'По телефона германците се представят с „hier ist“ — буквално „тук е“ — а не с „аз съм“.',
          ),
          prompt: bi('You are Mrs Petrowa. Your son Iwan is ill and is not coming today.', 'Ти си госпожа Петрова. Синът ти Иван е болен и днес няма да дойде.'),
          answer: 'Guten Morgen, hier ist Frau Petrowa. Mein Sohn Iwan ist krank und kommt heute nicht.',
          alternatives: [
            'Guten Morgen, hier Frau Petrowa. Mein Sohn Iwan ist krank und kommt heute nicht.',
            'Guten Morgen, hier ist Frau Petrowa. Iwan ist krank und kommt heute nicht.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-krank', 'v-der-sohn', 'v-die-kita'],
          hints: [
            bi('Greeting, then who, then what.', 'Поздрав, после кой, после какво.'),
            bi('Guten Morgen, h___ ist Frau Petrowa …', 'Guten Morgen, h___ ist Frau Petrowa …'),
          ],
        },
      ],
      'a2',
    ),
    them('Oh, was hat er denn?', bi('Oh, what is wrong with him?', 'О, какво му е?')),
    you(
      'sc-kita-a2-t2',
      bi('Say what is wrong', 'Кажи какво му е'),
      [
        {
          id: 'sc-kita-a2-t2-s1',
          prompt: bi('He has a temperature of 38.5.', 'Има температура 38,5.'),
          answer: 'Er hat Fieber, achtunddreißig fünf.',
          alternatives: ['Er hat Fieber.', 'Er hat Fieber, 38,5.'],
          shape: 'sentence',
          reviewTargets: ['v-fieber'],
          hints: [bi('Fieber takes no article here.', '„Fieber“ тук е без член.')],
        },
      ],
      'a2',
    ),
    them(
      'Gute Besserung! Bei Fieber darf er erst 24 Stunden fieberfrei wiederkommen.',
      bi('Get well soon! With a temperature he can only come back after 24 hours without one.', 'Оздравяване! При температура може да се върне едва след 24 часа без нея.'),
    ),
    you(
      'sc-kita-a2-t3',
      bi('Say when you expect him back', 'Кажи кога очакваш да се върне'),
      [
        {
          id: 'sc-kita-a2-t3-s1',
          instruction: bi(
            'wahrscheinlich sits right after the verb, in the same place as most sentence adverbs.',
            '„wahrscheinlich“ стои веднага след глагола, на същото място като повечето наречия за цялото изречение.',
          ),
          prompt: bi('Probably Monday.', 'Вероятно в понеделник.'),
          answer: 'Er kommt wahrscheinlich am Montag wieder.',
          alternatives: ['Wahrscheinlich am Montag.', 'Wahrscheinlich kommt er am Montag wieder.'],
          shape: 'sentence',
          reviewTargets: ['v-montag', 'v-vielleicht'],
          hints: [
            bi('wieder goes right to the end.', '„wieder“ отива в самия край.'),
            bi('Er kommt wahrscheinlich am Montag w______.', 'Er kommt wahrscheinlich am Montag w______.'),
          ],
        },
      ],
      'a2',
    ),
    you(
      'sc-kita-a2-t4',
      bi('Close the call', 'Затвори разговора'),
      [
        {
          id: 'sc-kita-a2-t4-s1',
          prompt: bi('Thank her and say goodbye on the phone.', 'Благодари ѝ и се сбогувай по телефона.'),
          answer: 'Vielen Dank, auf Wiederhören!',
          alternatives: ['Danke schön, auf Wiederhören!', 'Vielen Dank, tschüss!'],
          shape: 'phrase',
          traps: [registerTrap('Vielen Dank, bis bald bei dir!', 'Sie')],
          hints: [bi('On the phone it is hören, not sehen.', 'По телефона е „hören“, не „sehen“.')],
        },
      ],
      'a2',
    ),
  ],
});

const KITA_B1 = script({
  id: 'sc-kita-b1',
  scenarioId: 'sc-kita',
  level: 'b1',
  register: 'Sie',
  partner: bi('your child’s key worker', 'основната възпитателка на детето ти'),
  goal: bi(
    'Find out how your child is doing, and what you can do at home.',
    'Разбери как се справя детето ти и какво можеш да правиш вкъщи.',
  ),
  lessonIds: ['b1-u5-l3'],
  outro: bi(
    'The reassuring part of this conversation is real and worth having in German: a child who understands everything and says little is doing what bilingual children do, and reading at home in your own language helps the German rather than competing with it.',
    'Успокоителната част от този разговор е истинска и си струва да я чуеш на немски: дете, което разбира всичко и говори малко, прави точно това, което правят двуезичните деца, а четенето вкъщи на собствения ви език помага на немския, вместо да му пречи.',
  ),
  beats: [
    them(
      'Wie läuft es zu Hause mit dem Sprechen?',
      bi('How are things going with talking at home?', 'Как върви говоренето вкъщи?'),
    ),
    you(
      'sc-kita-b1-t1',
      bi('Say which language you speak at home', 'Кажи на какъв език говорите вкъщи'),
      [
        {
          id: 'sc-kita-b1-t1-s1',
          instruction: bi(
            'A language as the object of sprechen takes no article: wir sprechen Englisch.',
            'Езикът като допълнение на „sprechen“ не иска член: wir sprechen Bulgarisch.',
          ),
          prompt: bi('At home you speak English; he learns German here.', 'Вкъщи говорите български; немския учи тук.'),
          answer: 'Zu Hause sprechen wir Englisch, Deutsch lernt er hier.',
          alternatives: [
            'Wir sprechen zu Hause Englisch, Deutsch lernt er hier.',
            'Zu Hause sprechen wir Englisch, und Deutsch lernt er bei Ihnen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-sprechen', 'v-englisch'],
          hints: [
            bi('Start with zu Hause, so the verb comes second.', 'Започни със „zu Hause“, значи глаголът е втори.'),
            bi('Zu Hause s_______ wir Englisch …', 'Zu Hause s_______ wir Englisch …'),
          ],
          only: ['en'],
        },
      ],
      'b1',
      ['en'],
    ),
    you(
      'sc-kita-b1-t1-bg',
      bi('Say which language you speak at home', 'Кажи на какъв език говорите вкъщи'),
      [
        {
          id: 'sc-kita-b1-t1-bg-s1',
          instruction: bi(
            'A language as the object of sprechen takes no article: wir sprechen Bulgarisch.',
            'Езикът като допълнение на „sprechen“ не иска член: wir sprechen Bulgarisch.',
          ),
          prompt: bi('At home you speak Bulgarian; he learns German here.', 'Вкъщи говорите български; немския учи тук.'),
          answer: 'Zu Hause sprechen wir Bulgarisch, Deutsch lernt er hier.',
          alternatives: [
            'Wir sprechen zu Hause Bulgarisch, Deutsch lernt er hier.',
            'Zu Hause sprechen wir Bulgarisch, und Deutsch lernt er bei Ihnen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-sprechen', 'v-bulgarisch'],
          hints: [
            bi('Start with zu Hause, so the verb comes second.', 'Започни със „zu Hause“, значи глаголът е втори.'),
            bi('Zu Hause s_______ wir Bulgarisch …', 'Zu Hause s_______ wir Bulgarisch …'),
          ],
          only: ['bg'],
        },
      ],
      'b1',
      ['bg'],
    ),
    them(
      'Das ist gut so. Kinder trennen die Sprachen von allein.',
      bi('That is a good thing. Children separate the languages by themselves.', 'Така е добре. Децата сами разделят езиците.'),
    ),
    you(
      'sc-kita-b1-t2',
      bi('Ask where he stands', 'Попитай докъде е стигнал'),
      [
        {
          id: 'sc-kita-b1-t2-s1',
          instruction: bi(
            'im Vergleich zu takes the dative — the standard phrase for measuring one thing against others.',
            '„im Vergleich zu“ иска дателен падеж — стандартната фраза за сравняване на едно нещо с други.',
          ),
          prompt: bi(
            'Ask how far along he is compared with the others.',
            'Попитай докъде е в сравнение с другите.',
          ),
          answer: 'Wie weit ist er im Vergleich zu den anderen?',
          alternatives: [
            'Wo steht er im Vergleich zu den anderen Kindern?',
            'Wie weit ist er im Vergleich zu den anderen Kindern?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-weit'],
          hints: [
            bi('zu + dative plural: zu den anderen.', '„zu“ + дателен падеж, мн. ч.: zu den anderen.'),
            bi('… im Vergleich zu d__ anderen?', '… im Vergleich zu d__ anderen?'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Er versteht alles, spricht aber noch wenig. Das ist bei zweisprachigen Kindern normal.',
      bi('He understands everything but still says little. That is normal with bilingual children.', 'Разбира всичко, но още говори малко. При двуезичните деца това е нормално.'),
      {
        note: bi(
          'Note aber in second position inside the second clause, not at its front: German can put it after the verb, and it sounds calmer there.',
          'Забележи „aber“ вътре във второто изречение, а не отпред: немският може да го сложи след глагола и така звучи по-спокойно.',
        ),
      },
    ),
    you(
      'sc-kita-b1-t3',
      bi('Ask what you can do', 'Попитай какво можеш да направиш'),
      [
        {
          id: 'sc-kita-b1-t3-s1',
          instruction: bi(
            'unterstützen takes the accusative and needs no preposition: wir unterstützen ihn.',
            '„unterstützen“ иска винителен падеж и не се нуждае от предлог: wir unterstützen ihn.',
          ),
          prompt: bi('Ask how you can support him at home.', 'Попитай как можете да го подкрепяте вкъщи.'),
          answer: 'Wie können wir ihn zu Hause unterstützen?',
          alternatives: [
            'Was können wir zu Hause tun?',
            'Wie können wir ihn zu Hause am besten unterstützen?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-helfen', 'v-zu-hause'],
          hints: [
            bi('The modal sends unterstützen to the end.', 'Модалният глагол изпраща „unterstützen“ накрая.'),
            bi('Wie können wir ihn zu Hause u___________?', 'Wie können wir ihn zu Hause u___________?'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Vorlesen hilft am meisten, auch in Ihrer Sprache.',
      bi('Reading aloud helps most, in your language too.', 'Четенето на глас помага най-много, и на Вашия език.'),
    ),
    you(
      'sc-kita-b1-t4',
      bi('Say you will do that', 'Кажи, че ще го правите'),
      [
        {
          id: 'sc-kita-b1-t4-s1',
          prompt: bi('Say you will read to him more often.', 'Кажи, че ще му четете по-често.'),
          answer: 'Gut, dann lesen wir ihm öfter vor.',
          alternatives: [
            'Gut, das machen wir.',
            'Dann lesen wir ihm öfter vor, danke!',
            'Dann lesen wir ihm öfter vor.',
            'Das machen wir.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-lesen'],
          hints: [
            bi('vorlesen is separable, and the person read to is dative: ihm.', '„vorlesen“ е делим, а човекът, на когото четеш, е в дателен падеж: ihm.'),
            bi('Gut, dann lesen wir i__ öfter v__.', 'Gut, dann lesen wir i__ öfter v__.'),
          ],
        },
      ],
      'b1',
    ),
  ],
});

const KITA_B2 = script({
  id: 'sc-kita-b2',
  scenarioId: 'sc-kita',
  level: 'b2',
  register: 'Sie',
  partner: bi('the Kita head, at the parents’ evening', 'директорката на градината, на родителската среща'),
  goal: bi(
    'Raise the staffing problem in a room full of parents, without turning it into a complaint session.',
    'Повдигни проблема с персонала в стая, пълна с родители, без да го превръщаш в сбор от оплаквания.',
  ),
  lessonIds: ['b2-u2-l1'],
  outro: bi(
    'The move that makes this work is "mir geht es weniger um … als um …": it says out loud which conversation you are trying to have, before the room decides for you.',
    'Ходът, който го прави успешно, е „mir geht es weniger um … als um …“: казва на глас какъв разговор се опитваш да водиш, преди стаята да реши вместо теб.',
  ),
  beats: [
    narrator(
      bi(
        'Twenty parents, small chairs. Two staff left in March and nobody has said what happens in the autumn.',
        'Двайсет родители, малки столчета. Двама служители напуснаха през март и никой не е казал какво става наесен.',
      ),
    ),
    them('Gibt es von Ihrer Seite noch etwas?', bi('Is there anything else from your side?', 'Има ли още нещо от Ваша страна?')),
    you(
      'sc-kita-b2-t1',
      bi('Put the topic on the table', 'Сложи темата на масата'),
      [
        {
          id: 'sc-kita-b2-t1-s1',
          instruction: bi(
            'ansprechen is to raise a subject. With wollte in front of it, it announces the topic without opening the argument.',
            '„ansprechen“ значи да повдигнеш тема. С „wollte“ отпред тя се обявява, без да се отваря спорът.',
          ),
          prompt: bi(
            'You wanted to raise the subject of staffing levels.',
            'Искал си да повдигнеш темата за броя на персонала.',
          ),
          answer: 'Ja, ich wollte das Thema Betreuungsschlüssel ansprechen.',
          alternatives: [
            'Ja, ich wollte kurz das Thema Betreuungsschlüssel ansprechen.',
            'Ja, ich würde gern das Thema Betreuungsschlüssel ansprechen.',
            'Ich wollte das Thema Betreuungsschlüssel ansprechen.',
            'Ich wollte kurz das Thema Betreuungsschlüssel ansprechen.',
            'Ich würde gern das Thema Betreuungsschlüssel ansprechen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-betreuung', 'v-der-elternabend'],
          hints: [
            bi('wollte, then the separable verb whole at the end.', '„wollte“, после делимият глагол цял накрая.'),
            bi('… das Thema Betreuungsschlüssel a__________.', '… das Thema Betreuungsschlüssel a__________.'),
          ],
        },
      ],
      'b2',
    ),
    them(
      'Wir sind da gerade auf Personalsuche, das ist uns bewusst.',
      bi('We are recruiting for that at the moment; we are aware of it.', 'В момента търсим персонал, наясно сме.'),
    ),
    you(
      'sc-kita-b2-t2',
      bi('Say which conversation you want to have', 'Кажи какъв разговор искаш да водиш'),
      [
        {
          id: 'sc-kita-b2-t2-s1',
          instruction: bi(
            'es geht mir um … is "what I am after is …". The weniger … als construction contrasts two of them in one breath.',
            '„es geht mir um …“ значи „това, което ме интересува, е …“. Конструкцията „weniger … als“ противопоставя две неща наведнъж.',
          ),
          prompt: bi(
            'You are less interested in blame than in planning. Ask how the autumn looks.',
            'Интересува те по-малко вината, отколкото планирането. Попитай как изглежда есента.',
          ),
          answer: 'Mir geht es weniger um Schuld als um Planung. Wie sieht es im Herbst aus?',
          alternatives: [
            'Mir geht es weniger um Schuld als um die Planung. Wie sieht es im Herbst aus?',
            'Es geht mir weniger um Schuld als um Planung. Wie sieht es im Herbst aus?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-massnahme', 'v-abwaegen'],
          traps: [
            {
              answer: 'Mir geht es weniger um Schuld als um Planung. Wie sieht es im Herbst?',
              category: 'missing-word',
              feedback: bi(
                'aussehen is separable, and in a question the prefix still has to land at the end: Wie sieht es im Herbst aus?',
                '„aussehen“ е делим и във въпрос представката пак трябва да се озове накрая: Wie sieht es im Herbst aus?',
              ),
            },
          ],
          hints: [
            bi(
              'The shape is weniger um … als um …',
              'Формата е weniger um … als um …',
            ),
            bi('… Wie sieht es im Herbst a__?', '… Wie sieht es im Herbst a__?'),
          ],
        },
      ],
      'b2',
    ),
    them(
      'Zwei Stellen sind ausgeschrieben. Ob sie bis September besetzt sind, kann ich nicht versprechen.',
      bi('Two posts are advertised. Whether they are filled by September I cannot promise.', 'Две места са обявени. Дали ще бъдат заети до септември, не мога да обещая.'),
    ),
    you(
      'sc-kita-b2-t3',
      bi('Propose something concrete', 'Предложи нещо конкретно'),
      [
        {
          id: 'sc-kita-b2-t3-s1',
          instruction: bi(
            'vorschlagen, dass … puts the whole proposal in a subordinate clause, which is why its verb lands at the end.',
            '„vorschlagen, dass …“ слага цялото предложение в подчинено изречение и затова глаголът му е накрая.',
          ),
          prompt: bi(
            'Suggest that the parents are told again in September.',
            'Предложи родителите да бъдат информирани отново през септември.',
          ),
          answer: 'Dann würde ich vorschlagen, dass Sie die Eltern im September noch einmal informieren.',
          alternatives: [
            'Ich würde vorschlagen, dass Sie die Eltern im September noch einmal informieren.',
            'Dann schlage ich vor, dass Sie die Eltern im September noch einmal informieren.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-vorschlagen', 'v-der-vorschlag'],
          hints: [
            bi('The dass-clause ends with its verb.', 'Частта с „dass“ завършва с глагола си.'),
            bi('…, dass Sie die Eltern im September noch einmal i__________.', '…, dass Sie die Eltern im September noch einmal i__________.'),
          ],
        },
      ],
      'b2',
    ),
    them('Das machen wir. Danke für den Hinweis.', bi('We will do that. Thank you for raising it.', 'Ще го направим. Благодаря за бележката.')),
    you(
      'sc-kita-b2-t4',
      bi('Close it without a lap of honour', 'Затвори темата, без да празнуваш'),
      [
        {
          id: 'sc-kita-b2-t4-s1',
          instruction: bi(
            'Take the answer and stop. Restating your point after you have won it is how a room turns against you.',
            'Вземи отговора и спри. Да повториш тезата си, след като вече си я спечелил, е начинът стаята да се обърне срещу теб.',
          ),
          prompt: bi('Thank her and hand the floor back.', 'Благодари ѝ и върни думата.'),
          answer: 'Danke, das reicht mir völlig.',
          alternatives: ['Vielen Dank, das reicht mir.', 'Danke, damit bin ich zufrieden.'],
          shape: 'sentence',
          reviewTargets: ['v-danke'],
          hints: [bi('reichen with a dative person: das reicht mir.', '„reichen“ с човек в дателен падеж: das reicht mir.')],
        },
      ],
      'b2',
    ),
  ],
});

export const WORK_SCRIPTS: ScenarioScript[] = [
  WORK_A2,
  WORK_B1,
  WORK_B2,
  KITA_A2,
  KITA_B1,
  KITA_B2,
];
