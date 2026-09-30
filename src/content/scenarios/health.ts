import { bi } from '../authoring.ts';
import type { ScenarioScript } from '../types.ts';
import { script, them, you } from './authoring.ts';

/**
 * At the doctor, and at the pharmacy.
 *
 * Both scenarios turn on one piece of German that English has no version of
 * and Bulgarian has almost exactly: the person who hurts is not the subject of
 * the sentence. Mir tut der Hals weh — the throat does the hurting, and I am
 * in the dative, which is the same shape as „боли ме гърлото“ and nothing like
 * "my throat hurts". Each path is told which of those it is standing on.
 */

const DOCTOR_A1 = script({
  id: 'sc-doctor-a1',
  scenarioId: 'sc-doctor',
  level: 'a1',
  register: 'Sie',
  partner: bi('the receptionist', 'служителката на рецепцията'),
  goal: bi('Get an appointment as a new patient.', 'Запиши час като нов пациент.'),
  outro: bi(
    'Two facts hide in that call: a German practice asks whether you have been before, because new patients need a slot twice as long, and the insurance card is the first thing they will ask for at the desk.',
    'В това обаждане се крият два факта: немската практика пита дали си бил преди, защото новите пациенти искат двойно по-дълъг час, а здравната карта е първото нещо, което ще поискат на гишето.',
  ),
  beats: [
    them('Praxis Dr. Weber, guten Tag!', bi('Dr Weber’s practice, hello!', 'Практика „Д-р Вебер“, добър ден!')),
    you(
      'sc-doctor-a1-t1',
      bi('Say why you are calling', 'Кажи защо се обаждаш'),
      [
        {
          id: 'sc-doctor-a1-t1-s1',
          instruction: bi(
            'An appointment is something you "make" in German too, with machen or vereinbaren.',
            'Часът и на немски се „прави“ — с „machen“ или „vereinbaren“.',
          ),
          prompt: bi('You want an appointment.', 'Искаш час.'),
          answer: 'Guten Tag, ich möchte einen Termin machen.',
          alternatives: [
            'Guten Tag, ich hätte gern einen Termin.',
            'Guten Tag, ich möchte einen Termin vereinbaren.',
            'Ich möchte einen Termin machen.',
            'Ich hätte gern einen Termin.',
            'Ich möchte einen Termin vereinbaren.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-termin', 'v-praxis'],
          traps: [
            {
              answer: 'Guten Tag, ich möchte ein Termin machen.',
              category: 'case',
              feedback: bi(
                'der Termin is masculine and it is what you want, so the article goes accusative: einen Termin.',
                '„der Termin“ е от мъжки род и е това, което искаш, затова членът е във винителен падеж: einen Termin.',
              ),
            },
          ],
          hints: [
            bi('der Termin, in the accusative.', '„der Termin“, във винителен падеж.'),
            bi('… ich möchte ein__ Termin machen.', '… ich möchte ein__ Termin machen.'),
          ],
        },
      ],
      'a1',
    ),
    them('Waren Sie schon einmal bei uns?', bi('Have you been to us before?', 'Били ли сте вече при нас?')),
    you(
      'sc-doctor-a1-t2',
      bi('Say you are new', 'Кажи, че си нов'),
      [
        {
          id: 'sc-doctor-a1-t2-s1',
          prompt: bi('This is your first time.', 'За пръв път ти е.'),
          answer: 'Nein, ich bin neu hier.',
          alternatives: [
            'Nein, ich war noch nie hier.',
            'Nein, zum ersten Mal.',
            'Ich bin neu hier.',
            'Ich war noch nie hier.',
            'Zum ersten Mal.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-neu'],
          hints: [bi('"I am new here" works word for word.', '„Нов съм тук“ работи дума по дума.')],
        },
      ],
      'a1',
    ),
    them('Alles klar. Wie heißen Sie?', bi('All right. What is your name?', 'Добре. Как се казвате?')),
    you(
      'sc-doctor-a1-t3',
      bi('Give your name', 'Кажи името си'),
      [
        {
          id: 'sc-doctor-a1-t3-s1',
          instruction: bi(
            'heißen is the verb for being called, and it needs no article and no "my name is".',
            '„heißen“ е глаголът за „казвам се“ и не иска нито член, нито „моето име е“.',
          ),
          prompt: bi('Your name is Maria Petrowa.', 'Казваш се Мария Петрова.'),
          answer: 'Ich heiße Maria Petrowa.',
          alternatives: ['Mein Name ist Maria Petrowa.', 'Petrowa, Maria Petrowa.'],
          shape: 'sentence',
          reviewTargets: ['v-heissen'],
          hints: [bi('One verb, then the name.', 'Един глагол, после името.')],
        },
      ],
      'a1',
    ),
    them(
      'Geht Donnerstag um zehn? Bringen Sie bitte Ihre Versichertenkarte mit.',
      bi('Does Thursday at ten work? Please bring your insurance card.', 'Става ли в четвъртък в десет? Моля, носете здравната си карта.'),
    ),
    you(
      'sc-doctor-a1-t4',
      bi('Accept the slot', 'Приеми часа'),
      [
        {
          id: 'sc-doctor-a1-t4-s1',
          instruction: bi(
            'passen is the verb for a time that suits you. It takes a dative person: das passt mir.',
            '„passen“ е глаголът за час, който ти е удобен. Иска човек в дателен падеж: das passt mir.',
          ),
          prompt: bi('Thursday works.', 'Четвъртък става.'),
          answer: 'Ja, das passt mir gut.',
          alternatives: [
            'Ja, das passt.',
            'Ja, Donnerstag um zehn passt mir.',
            'Das passt mir gut.',
            'Das passt.',
            'Donnerstag um zehn passt mir.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-passt', 'v-donnerstag'],
          // dir here is not the register: it says the time suits the
          // receptionist. Sent to Sie, the learner would write "das passt
          // Ihnen", which is the same mistake.
          traps: [
            {
              answer: 'Ja, das passt dir gut.',
              category: 'pronoun',
              feedback: bi(
                'passen takes the person the time suits, and that is you: das passt mir. dir would mean it suits the person you are talking to.',
                '„passen“ иска човека, на когото часът е удобен, а това си ти: das passt mir. dir би значело, че е удобно на човека, с когото говориш.',
              ),
            },
            {
              answer: 'Ja, das passt Ihnen gut.',
              category: 'pronoun',
              feedback: bi(
                'passen takes the person the time suits, and that is you: das passt mir. Ihnen would mean it suits the person you are talking to.',
                '„passen“ иска човека, на когото часът е удобен, а това си ти: das passt mir. Ihnen би значело, че е удобно на човека, с когото говориш.',
              ),
            },
          ],
          hints: [bi('das passt ___ gut — the person goes in the dative.', 'das passt ___ gut — човекът е в дателен падеж.')],
        },
      ],
      'a1',
    ),
  ],
});

const DOCTOR_A2 = script({
  id: 'sc-doctor-a2',
  scenarioId: 'sc-doctor',
  level: 'a2',
  register: 'Sie',
  partner: bi('the doctor', 'лекарят'),
  goal: bi('Say what hurts, since when, and how bad it is.', 'Кажи какво те боли, откога и колко е зле.'),
  outro: bi(
    'Three pieces of information and a doctor can work: what, since when, and what makes it worse. The German for the first of them puts you in the dative and the body part in charge.',
    'Три неща и лекарят може да работи: какво, откога и кога се влошава. Немският за първото от тях поставя теб в дателен падеж, а частта от тялото — в ролята на подлог.',
  ),
  beats: [
    them('Was fehlt Ihnen denn?', bi('What seems to be the trouble?', 'Какво Ви има?'), {
      note: bi(
        'Literally "what is missing to you". English has no version of this at all; it is simply the phrase a German doctor opens with.',
        'Буквално „какво Ви липсва“. Българският прави същия ход с „Какво Ви е?“ — човекът пак е в косвена форма, а не подлог.',
      ),
    }),
    you(
      'sc-doctor-a2-t1',
      bi('Say what hurts and since when', 'Кажи какво те боли и откога'),
      [
        {
          id: 'sc-doctor-a2-t1-s1',
          instruction: bi(
            'seit means "since" and takes the dative — and German uses the present tense with it, because the sore throat is still going on.',
            '„seit“ значи „от“ и иска дателен падеж — и немският го използва със сегашно време, защото болката още продължава.',
          ),
          prompt: bi('Your throat has hurt for three days.', 'Гърлото те боли от три дни.'),
          answer: 'Ich habe seit drei Tagen Halsschmerzen.',
          alternatives: [
            'Seit drei Tagen habe ich Halsschmerzen.',
            'Mir tut seit drei Tagen der Hals weh.',
            'Mein Hals tut seit drei Tagen weh.',
            'Seit drei Tagen tut mein Hals weh.',
            'Seit drei Tagen tut mir der Hals weh.',
            'Ich habe seit 3 Tagen Halsschmerzen.',
            'Seit 3 Tagen habe ich Halsschmerzen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-hals', 'v-schmerzen'],
          traps: [
            {
              answer: 'Ich hatte seit drei Tagen Halsschmerzen.',
              category: 'verb-tense',
              feedback: bi(
                'It still hurts, so German stays in the present: ich habe seit drei Tagen. The past tense would mean it stopped.',
                'Още те боли, затова немският остава в сегашно време: ich habe seit drei Tagen. Миналото би значело, че е спряло.',
              ),
            },
          ],
          hints: [
            bi('seit + dative plural: seit drei Tagen.', '„seit“ + дателен падеж, мн. ч.: seit drei Tagen.'),
            bi('Ich habe s___ drei Tagen Halsschmerzen.', 'Ich habe s___ drei Tagen Halsschmerzen.'),
          ],
        },
      ],
      'a2',
    ),
    them('Haben Sie auch Fieber?', bi('Do you have a temperature as well?', 'Имате ли и температура?')),
    you(
      'sc-doctor-a2-t2',
      bi('Give the number', 'Кажи числото'),
      [
        {
          id: 'sc-doctor-a2-t2-s1',
          instruction: bi(
            'Yesterday is a finished day, so this one really is the past — and haben takes hatte.',
            'Вчера е приключил ден, така че тук наистина е минало време — и „haben“ става „hatte“.',
          ),
          prompt: bi('Yesterday it was 38 degrees.', 'Вчера беше 38 градуса.'),
          answer: 'Ja, gestern hatte ich achtunddreißig Grad.',
          alternatives: [
            'Ja, gestern hatte ich 38 Grad.',
            'Ja, gestern waren es achtunddreißig Grad.',
            'Gestern hatte ich achtunddreißig Grad.',
            'Gestern hatte ich 38 Grad.',
            'Gestern waren es achtunddreißig Grad.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-fieber', 'v-gestern'],
          hints: [
            bi('Start with gestern, so the verb comes straight after.', 'Започни с „gestern“, значи глаголът идва веднага след него.'),
            bi('Ja, gestern h____ ich achtunddreißig Grad.', 'Ja, gestern h____ ich achtunddreißig Grad.'),
          ],
        },
      ],
      'a2',
    ),
    them('Tut das Schlucken weh?', bi('Does swallowing hurt?', 'Боли ли Ви при преглъщане?')),
    you(
      'sc-doctor-a2-t3',
      bi('Say when it is worst', 'Кажи кога е най-зле'),
      [
        {
          id: 'sc-doctor-a2-t3-s1',
          instruction: bi(
            'A time of day used as a habit is lower case and takes an -s: morgens, abends, nachts.',
            'Част от деня, използвана като навик, се пише с малка буква и получава „-s“: morgens, abends, nachts.',
          ),
          prompt: bi('Yes, especially in the mornings.', 'Да, особено сутрин.'),
          answer: 'Ja, besonders morgens.',
          alternatives: ['Ja, vor allem morgens.', 'Ja, morgens ist es am schlimmsten.'],
          shape: 'phrase',
          hints: [
            bi('The adverb is morgens, not Morgen.', 'Наречието е „morgens“, не „Morgen“.'),
            bi('Ja, besonders m_______.', 'Ja, besonders m_______.'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Machen Sie bitte den Mund auf. — Das ist entzündet, aber nicht schlimm.',
      bi('Please open your mouth. — That is inflamed, but not serious.', 'Моля, отворете устата. — Възпалено е, но не е страшно.'),
    ),
    you(
      'sc-doctor-a2-t4',
      bi('Ask what you should do', 'Попитай какво да правиш'),
      [
        {
          id: 'sc-doctor-a2-t4-s1',
          instruction: bi(
            'sollen is for what somebody else thinks you should do — exactly right when asking a doctor.',
            '„sollen“ е за това, което някой друг смята, че трябва да направиш — точно вярното при въпрос към лекар.',
          ),
          prompt: bi('Ask what you should do now.', 'Попитай какво да правиш сега.'),
          answer: 'Was soll ich jetzt machen?',
          alternatives: ['Was soll ich tun?', 'Und was mache ich jetzt am besten?'],
          shape: 'sentence',
          reviewTargets: ['v-sollen'],
          hints: [bi('Question word, modal, ich, verb at the end.', 'Въпросителна дума, модален глагол, „ich“, глагол накрая.')],
        },
      ],
      'a2',
    ),
  ],
});

const DOCTOR_B1 = script({
  id: 'sc-doctor-b1',
  scenarioId: 'sc-doctor',
  level: 'b1',
  register: 'Sie',
  partner: bi('the doctor', 'лекарят'),
  goal: bi(
    'Describe how it has developed, and sort out the sick note for work.',
    'Опиши как се е развило и уреди болничния за работата.',
  ),
  outro: bi(
    'The difference from A2 is that none of these sentences describe a moment: they describe a course of events over two weeks, and that is what Perfekt plus seitdem is for.',
    'Разликата с A2 е, че нито едно от тези изречения не описва момент: описват развитие в продължение на две седмици, а точно за това са Perfekt и „seitdem“.',
  ),
  beats: [
    them(
      'Sie waren vor zwei Wochen schon einmal hier, richtig?',
      bi('You were here two weeks ago, is that right?', 'Бяхте тук преди две седмици, нали?'),
    ),
    you(
      'sc-doctor-b1-t1',
      bi('Say that it has not improved', 'Кажи, че не се е подобрило'),
      [
        {
          id: 'sc-doctor-b1-t1-s1',
          instruction: bi(
            'werden in the Perfekt takes sein, and "not got better" is the standard way to report a course that has stalled.',
            '„werden“ в Perfekt иска „sein“, а „не се е подобрило“ е стандартният начин да опишеш състояние, което не е мръднало.',
          ),
          prompt: bi('The symptoms have not got better since then.', 'Оплакванията оттогава не са се подобрили.'),
          answer: 'Ja, aber die Beschwerden sind seitdem nicht besser geworden.',
          alternatives: [
            'Ja, die Beschwerden sind seitdem nicht besser geworden.',
            'Ja, aber es ist seitdem nicht besser geworden.',
            'Die Beschwerden sind seitdem nicht besser geworden.',
            'Es ist seitdem nicht besser geworden.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-beschwerden', 'v-besser'],
          traps: [
            {
              answer: 'Ja, aber die Beschwerden haben seitdem nicht besser geworden.',
              category: 'auxiliary-verb',
              feedback: bi(
                'werden is a sein verb: nothing was done, a state changed — or in this case failed to. Die Beschwerden sind … geworden.',
                '„werden“ е глагол със „sein“: нищо не е извършено, а състояние се е променило — или в случая не се е. Die Beschwerden sind … geworden.',
              ),
            },
          ],
          hints: [
            bi('Perfekt of werden, with sein.', 'Perfekt на „werden“, със „sein“.'),
            bi('… die Beschwerden s___ seitdem nicht besser geworden.', '… die Beschwerden s___ seitdem nicht besser geworden.'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Dann machen wir einen Bluttest. Nehmen Sie zurzeit Medikamente?',
      bi('Then we will do a blood test. Are you taking any medication at the moment?', 'Тогава ще направим кръвен тест. Взимате ли в момента лекарства?'),
    ),
    you(
      'sc-doctor-b1-t2',
      bi('Say what you are taking', 'Кажи какво взимаш'),
      [
        {
          id: 'sc-doctor-b1-t2-s1',
          instruction: bi(
            'seit einer Woche — feminine Woche goes dative after seit, so the article is einer.',
            '„seit einer Woche“ — женският род „Woche“ е в дателен падеж след „seit“, затова членът е „einer“.',
          ),
          prompt: bi('A painkiller, for the past week.', 'Обезболяващо, от една седмица.'),
          answer: 'Ja, ich nehme seit einer Woche ein Schmerzmittel.',
          alternatives: [
            'Ja, seit einer Woche nehme ich ein Schmerzmittel.',
            'Ja, ein Schmerzmittel, seit einer Woche.',
            'Ich nehme seit einer Woche ein Schmerzmittel.',
            'Seit einer Woche nehme ich ein Schmerzmittel.',
            'Ein Schmerzmittel, seit einer Woche.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-das-medikament', 'v-einnehmen'],
          hints: [
            bi('seit + dative: eine Woche becomes einer Woche.', '„seit“ + дателен падеж: „eine Woche“ става „einer Woche“.'),
            bi('… seit ein__ Woche ein Schmerzmittel.', '… seit ein__ Woche ein Schmerzmittel.'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Gut. Ich schreibe Sie erst einmal bis Freitag krank.',
      bi('Good. I will sign you off sick until Friday for now.', 'Добре. Засега Ви пускам в болничен до петък.'),
      {
        note: bi(
          '"jemanden krankschreiben" is one verb doing a whole institution: it is the doctor issuing the sick note your employer needs.',
          '„jemanden krankschreiben“ е един глагол, който върши работата на цяла институция: лекарят издава болничния, който работодателят ти иска.',
        ),
      },
    ),
    you(
      'sc-doctor-b1-t3',
      bi('Ask about the paperwork for work', 'Попитай за документа за работата'),
      [
        {
          id: 'sc-doctor-b1-t3-s1',
          instruction: bi(
            'für + accusative for the person a document is meant for.',
            '„für“ + винителен падеж за човека, за когото е документът.',
          ),
          prompt: bi('Ask whether you need the sick note for your employer too.', 'Попитай дали ти трябва болничният и за работодателя.'),
          answer: 'Brauche ich die Krankmeldung auch für meinen Arbeitgeber?',
          alternatives: [
            'Brauche ich die Krankschreibung auch für meinen Arbeitgeber?',
            'Muss ich die Krankmeldung selbst an meinen Arbeitgeber schicken?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-krankmeldung', 'v-der-arbeitgeber'],
          traps: [
            {
              answer: 'Brauche ich die Krankmeldung auch für mein Arbeitgeber?',
              category: 'case',
              feedback: bi(
                'für always takes the accusative, and der Arbeitgeber is masculine: für meinen Arbeitgeber.',
                '„für“ винаги иска винителен падеж, а „der Arbeitgeber“ е от мъжки род: für meinen Arbeitgeber.',
              ),
            },
          ],
          hints: [
            bi('für + accusative.', '„für“ + винителен падеж.'),
            bi('… auch für mein__ Arbeitgeber?', '… auch für mein__ Arbeitgeber?'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Nein, die geht elektronisch direkt an die Krankenkasse.',
      bi('No, that goes electronically straight to the health insurer.', 'Не, той отива по електронен път направо в здравната каса.'),
    ),
    you(
      'sc-doctor-b1-t4',
      bi('Ask when to come back', 'Попитай кога да дойдеш пак'),
      [
        {
          id: 'sc-doctor-b1-t4-s1',
          instruction: bi(
            'wiederkommen is separable, so the prefix goes to the end of the question.',
            '„wiederkommen“ е делим, затова представката отива в края на въпроса.',
          ),
          prompt: bi('Ask when you should come back.', 'Попитай кога да дойдеш пак.'),
          answer: 'Wann soll ich wiederkommen?',
          alternatives: ['Wann komme ich wieder?', 'Wann soll ich mich wieder vorstellen?'],
          shape: 'sentence',
          reviewTargets: ['v-wann'],
          hints: [bi('wann + sollen + ich + the verb at the end.', '„wann“ + „sollen“ + „ich“ + глаголът накрая.')],
        },
      ],
      'b1',
    ),
  ],
});

const PHARMACY_A1 = script({
  id: 'sc-pharmacy-a1',
  scenarioId: 'sc-pharmacy',
  level: 'a1',
  register: 'Sie',
  partner: bi('the pharmacist', 'фармацевтът'),
  goal: bi('Ask for something for a headache and pay for it.', 'Поискай нещо за главоболие и го плати.'),
  outro: bi(
    'One preposition carries this whole conversation: gegen, with the accusative, for what a medicine is against.',
    'Един предлог носи целия този разговор: „gegen“ с винителен падеж, за това, срещу което е лекарството.',
  ),
  beats: [
    them('Guten Tag, was kann ich für Sie tun?', bi('Hello, what can I do for you?', 'Добър ден, какво мога да направя за Вас?')),
    you(
      'sc-pharmacy-a1-t1',
      bi('Ask for something for a headache', 'Поискай нещо за главоболие'),
      [
        {
          id: 'sc-pharmacy-a1-t1-s1',
          instruction: bi(
            'A medicine is "against" the complaint in German, never "for" it, and gegen always takes the accusative.',
            'Лекарството на немски е „срещу“ оплакването, никога „за“ него, а „gegen“ винаги иска винителен падеж.',
          ),
          prompt: bi('You have a headache and no prescription.', 'Имаш главоболие и нямаш рецепта.'),
          answer: 'Ich hätte gern etwas gegen Kopfschmerzen.',
          alternatives: [
            'Haben Sie etwas gegen Kopfschmerzen?',
            'Ich brauche etwas gegen Kopfschmerzen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-kopf', 'v-schmerzen'],
          traps: [
            {
              answer: 'Ich hätte gern etwas für Kopfschmerzen.',
              category: 'preposition',
              feedback: bi(
                'für would mean the pills are there to give you a headache. What you want is something against it: gegen Kopfschmerzen.',
                '„für“ би значело, че хапчетата са, за да ти докарат главоболие. Ти искаш нещо срещу него: gegen Kopfschmerzen.',
              ),
            },
          ],
          hints: [
            bi('The preposition means "against".', 'Предлогът значи „срещу“.'),
            bi('… etwas g____ Kopfschmerzen.', '… etwas g____ Kopfschmerzen.'),
          ],
        },
      ],
      'a1',
    ),
    them(
      'Nehmen Sie andere Medikamente?',
      bi('Are you taking any other medication?', 'Взимате ли други лекарства?'),
    ),
    you(
      'sc-pharmacy-a1-t2',
      bi('Say no', 'Кажи „не“'),
      [
        {
          id: 'sc-pharmacy-a1-t2-s1',
          prompt: bi('You are not taking anything.', 'Не взимаш нищо.'),
          answer: 'Nein, im Moment nichts.',
          alternatives: ['Nein, nichts.', 'Nein, zurzeit nicht.'],
          shape: 'phrase',
          reviewTargets: ['v-nein'],
          hints: [bi('nichts is "nothing"; nicht is "not".', '„nichts“ е „нищо“; „nicht“ е „не“.')],
        },
      ],
      'a1',
    ),
    them(
      'Dann nehmen Sie das hier. Eine Tablette, höchstens dreimal am Tag.',
      bi('Then take this one. One tablet, at most three times a day.', 'Тогава вземете това. Едно хапче, най-много три пъти дневно.'),
    ),
    you(
      'sc-pharmacy-a1-t3',
      bi('Ask the price', 'Попитай цената'),
      [
        {
          id: 'sc-pharmacy-a1-t3-s1',
          instruction: bi(
            'kosten is used without a preposition: was kostet das, not "how much is it for".',
            '„kosten“ се използва без предлог: was kostet das, а не „колко е за“.',
          ),
          prompt: bi('Ask what it costs.', 'Попитай колко струва.'),
          answer: 'Was kostet das?',
          alternatives: ['Wie viel kostet das?', 'Was macht das?'],
          shape: 'sentence',
          reviewTargets: ['v-kosten', 'v-wie-viel'],
          hints: [bi('Three words.', 'Три думи.')],
        },
      ],
      'a1',
    ),
    them('Fünf Euro neunzig.', bi('Five euros ninety.', 'Пет евро и деветдесет.')),
    you(
      'sc-pharmacy-a1-t4',
      bi('Pay and leave', 'Плати и си тръгни'),
      [
        {
          id: 'sc-pharmacy-a1-t4-s1',
          prompt: bi('Say you will take it, and thank her.', 'Кажи, че го взимаш, и ѝ благодари.'),
          answer: 'Gut, das nehme ich. Vielen Dank!',
          alternatives: [
            'Das nehme ich, danke!',
            'Gut, ich nehme das. Danke schön!',
            'Das nehme ich. Vielen Dank!',
            'Ich nehme das. Danke schön!',
          ],
          shape: 'sentence',
          reviewTargets: ['v-nehmen'],
          hints: [bi('Start with das, so the verb comes second.', 'Започни с „das“, значи глаголът е втори.')],
        },
      ],
      'a1',
    ),
  ],
});

const PHARMACY_A2 = script({
  id: 'sc-pharmacy-a2',
  scenarioId: 'sc-pharmacy',
  level: 'a2',
  register: 'Sie',
  partner: bi('the pharmacist', 'фармацевтът'),
  goal: bi('Hand in a prescription and understand how to take the medicine.', 'Подай рецепта и разбери как да взимаш лекарството.'),
  outro: bi(
    'The dosage answers all come in the same shape — a number word ending in -mal, then when. Dreimal täglich, zweimal am Tag, einmal abends.',
    'Отговорите за дозировката идват в една и съща форма — число, завършващо на „-mal“, после кога. Dreimal täglich, zweimal am Tag, einmal abends.',
  ),
  beats: [
    them('Guten Tag!', bi('Hello!', 'Добър ден!')),
    you(
      'sc-pharmacy-a2-t1',
      bi('Hand in the prescription', 'Подай рецептата'),
      [
        {
          id: 'sc-pharmacy-a2-t1-s1',
          prompt: bi('You have a prescription from the doctor.', 'Имаш рецепта от лекаря.'),
          answer: 'Guten Tag, ich habe ein Rezept.',
          alternatives: [
            'Guten Tag, ich möchte dieses Rezept einlösen.',
            'Guten Tag, hier ist mein Rezept.',
            'Ich habe ein Rezept.',
            'Ich möchte dieses Rezept einlösen.',
            'Hier ist mein Rezept.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-das-rezept'],
          hints: [
            bi('"ein Rezept einlösen" is the exact phrase, but plain haben works.', '„ein Rezept einlösen“ е точната фраза, но и просто „haben“ върши работа.'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Danke. Einen Moment bitte. — So, hier ist Ihr Antibiotikum.',
      bi('Thank you. One moment. — Here is your antibiotic.', 'Благодаря. Един момент. — Ето Вашия антибиотик.'),
    ),
    you(
      'sc-pharmacy-a2-t2',
      bi('Ask how often to take it', 'Попитай колко често да го взимаш'),
      [
        {
          id: 'sc-pharmacy-a2-t2-s1',
          instruction: bi(
            'wie oft is the question for frequency, and müssen sends nehmen to the end.',
            '„wie oft“ е въпросът за честота, а „müssen“ изпраща „nehmen“ накрая.',
          ),
          prompt: bi('Ask how often you have to take it.', 'Попитай колко често трябва да го взимаш.'),
          answer: 'Wie oft muss ich das nehmen?',
          alternatives: ['Wie oft soll ich das einnehmen?', 'Wie oft am Tag nehme ich das?'],
          shape: 'sentence',
          reviewTargets: ['v-oft', 'v-einnehmen'],
          hints: [bi('Two question words, then the modal.', 'Две въпросителни думи, после модалният глагол.')],
        },
      ],
      'a2',
    ),
    them(
      'Dreimal täglich, jeweils nach dem Essen.',
      bi('Three times a day, each time after food.', 'Три пъти дневно, всеки път след ядене.'),
      {
        note: bi(
          'jeweils means "in each case" — it is the word that stops "after food" from sounding like one single occasion.',
          '„jeweils“ значи „всеки път“ — думата, която спира „след ядене“ да звучи като един-единствен случай.',
        ),
      },
    ),
    you(
      'sc-pharmacy-a2-t3',
      bi('Ask about finishing the pack', 'Попитай за довършването на опаковката'),
      [
        {
          id: 'sc-pharmacy-a2-t3-s1',
          instruction: bi(
            'auch wenn introduces a concession — "even if" — and sends its verb to the end.',
            '„auch wenn“ въвежда отстъпка — „дори ако“ — и изпраща глагола си накрая.',
          ),
          prompt: bi(
            'Ask whether you must finish the pack even if you feel better.',
            'Попитай дали трябва да довършиш опаковката, дори ако се почувстваш по-добре.',
          ),
          answer: 'Muss ich die Packung ganz nehmen, auch wenn es mir besser geht?',
          alternatives: [
            'Muss ich die Packung zu Ende nehmen, auch wenn es mir besser geht?',
            'Soll ich die Packung ganz aufbrauchen?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-besser'],
          hints: [
            bi('"es geht mir besser" is how German says you feel better — impersonal, with a dative you.', '„es geht mir besser“ е немският начин да кажеш, че си по-добре — безлично, с теб в дателен падеж.'),
            bi('…, auch wenn es mir besser g___?', '…, auch wenn es mir besser g___?'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Unbedingt. Nehmen Sie die Packung zu Ende, sonst kommt es zurück.',
      bi('Absolutely. Finish the pack, otherwise it comes back.', 'Задължително. Довършете опаковката, иначе ще се върне.'),
    ),
    you(
      'sc-pharmacy-a2-t4',
      bi('Thank her', 'Благодари ѝ'),
      [
        {
          id: 'sc-pharmacy-a2-t4-s1',
          prompt: bi('Say thank you for the explanation.', 'Благодари за обяснението.'),
          answer: 'Alles klar, vielen Dank!',
          alternatives: ['Gut zu wissen, danke!', 'Danke für die Erklärung!', 'Vielen Dank!'],
          shape: 'phrase',
          hints: [bi('"Gut zu wissen" — good to know.', '„Gut zu wissen“ — добре е да се знае.')],
        },
      ],
      'a2',
    ),
  ],
});

const PHARMACY_B1 = script({
  id: 'sc-pharmacy-b1',
  scenarioId: 'sc-pharmacy',
  level: 'b1',
  register: 'Sie',
  partner: bi('the pharmacist', 'фармацевтът'),
  goal: bi(
    'Your medicine is out of stock. Find out what the alternative is and whether it is safe with what you already take.',
    'Лекарството ти го няма. Разбери каква е алтернативата и дали е безопасна с това, което вече взимаш.',
  ),
  outro: bi(
    'Two words make this conversation possible: Wirkstoff, the active ingredient that two different boxes can share, and Wechselwirkung, what one medicine does to another.',
    'Две думи правят този разговор възможен: „Wirkstoff“ — активното вещество, което две различни кутии могат да споделят, и „Wechselwirkung“ — какво прави едно лекарство с друго.',
  ),
  beats: [
    them(
      'Das Medikament ist zurzeit leider nicht lieferbar.',
      bi('That medication is unfortunately not available at the moment.', 'Това лекарство за съжаление в момента не се доставя.'),
    ),
    you(
      'sc-pharmacy-b1-t1',
      bi('Ask for an equivalent', 'Попитай за еквивалент'),
      [
        {
          id: 'sc-pharmacy-b1-t1-s1',
          instruction: bi(
            'derselbe declines on both halves: mit demselben Wirkstoff, in the dative after mit.',
            '„derselbe“ се скланя и в двете си части: mit demselben Wirkstoff, в дателен падеж след „mit“.',
          ),
          prompt: bi('Ask whether there is another product with the same active ingredient.', 'Попитай дали има друг продукт със същото активно вещество.'),
          answer: 'Gibt es ein anderes Präparat mit demselben Wirkstoff?',
          alternatives: [
            'Gibt es ein Generikum mit demselben Wirkstoff?',
            'Haben Sie etwas anderes mit dem gleichen Wirkstoff?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-das-medikament'],
          traps: [
            {
              answer: 'Gibt es ein anderes Präparat mit derselbe Wirkstoff?',
              category: 'case',
              feedback: bi(
                'mit takes the dative, and derselbe changes with it: mit demselben Wirkstoff.',
                '„mit“ иска дателен падеж, а „derselbe“ се променя с него: mit demselben Wirkstoff.',
              ),
            },
          ],
          hints: [
            bi('mit + dative, and the word is written as one.', '„mit“ + дателен падеж, а думата се пише слято.'),
            bi('… mit d_________ Wirkstoff?', '… mit d_________ Wirkstoff?'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Ja, ein Generikum. Der Wirkstoff ist identisch, nur der Hersteller ist ein anderer.',
      bi('Yes, a generic. The active ingredient is identical, only the manufacturer is different.', 'Да, генерик. Активното вещество е идентично, различен е само производителят.'),
    ),
    you(
      'sc-pharmacy-b1-t2',
      bi('Ask about interactions', 'Попитай за взаимодействия'),
      [
        {
          id: 'sc-pharmacy-b1-t2-s1',
          instruction: bi(
            'sich vertragen is used of medicines as well as of people: things that get along together.',
            '„sich vertragen“ се използва и за лекарства, и за хора: неща, които се разбират помежду си.',
          ),
          prompt: bi('You take a blood pressure tablet. Ask whether they go together.', 'Взимаш хапче за кръвно. Попитай дали се понасят.'),
          answer: 'Verträgt sich das mit meinem Blutdruckmittel?',
          alternatives: [
            'Gibt es eine Wechselwirkung mit meinem Blutdruckmittel?',
            'Kann ich das zusammen mit meinem Blutdruckmittel nehmen?',
          ],
          shape: 'sentence',
          hints: [
            bi('Reflexive: the sich comes straight after the verb.', 'Възвратен глагол: „sich“ идва веднага след глагола.'),
            bi('V_______ sich das mit meinem Blutdruckmittel?', 'V_______ sich das mit meinem Blutdruckmittel?'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Da ist keine Wechselwirkung bekannt. Achten Sie trotzdem auf Schwindel.',
      bi('No interaction is known there. Still, watch out for dizziness.', 'Не е известно взаимодействие. Все пак внимавайте за замайване.'),
      {
        note: bi(
          'Wechselwirkung is literally "exchange-effect": two substances acting on each other. German builds its technical words out of parts you already know.',
          '„Wechselwirkung“ е буквално „взаимо-действие“ — точно както българската дума. Немският строи техническите си думи от части, които вече знаеш.',
        ),
      },
    ),
    you(
      'sc-pharmacy-b1-t3',
      bi('Ask who pays', 'Попитай кой плаща'),
      [
        {
          id: 'sc-pharmacy-b1-t3-s1',
          instruction: bi(
            'übernehmen is the verb for an insurer covering a cost — literally taking it over.',
            '„übernehmen“ е глаголът за каса, която поема разход — буквално „поема го“.',
          ),
          prompt: bi('Ask whether your health insurer covers it.', 'Попитай дали здравната каса го покрива.'),
          answer: 'Übernimmt die Krankenkasse das?',
          alternatives: [
            'Zahlt die Krankenkasse das?',
            'Übernimmt meine Krankenkasse die Kosten?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-krankenkasse'],
          hints: [
            bi('The verb changes its vowel in the third person: übernehmen becomes übernimmt.', 'Глаголът сменя гласната в трето лице: „übernehmen“ става „übernimmt“.'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Ja, Sie zahlen nur die gesetzliche Zuzahlung, fünf Euro.',
      bi('Yes, you only pay the statutory co-payment, five euros.', 'Да, плащате само законовата доплата — пет евро.'),
    ),
    you(
      'sc-pharmacy-b1-t4',
      bi('Close it', 'Затвори разговора'),
      [
        {
          id: 'sc-pharmacy-b1-t4-s1',
          prompt: bi('Take it and thank her for the advice.', 'Вземи го и ѝ благодари за съвета.'),
          answer: 'Gut, dann nehme ich das. Vielen Dank für die Beratung!',
          alternatives: [
            'Dann nehme ich das Generikum. Vielen Dank!',
            'Gut, das nehme ich. Danke für die Beratung!',
            'Dann nehme ich das. Vielen Dank für die Beratung!',
            'Das nehme ich. Danke für die Beratung!',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-zuzahlung'],
          hints: [bi('Beratung is advice given professionally.', '„Beratung“ е съвет, даден професионално.')],
        },
      ],
      'b1',
    ),
  ],
});

export const HEALTH_SCRIPTS: ScenarioScript[] = [
  DOCTOR_A1,
  DOCTOR_A2,
  DOCTOR_B1,
  PHARMACY_A1,
  PHARMACY_A2,
  PHARMACY_B1,
];
