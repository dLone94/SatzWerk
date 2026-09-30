import { bi } from '../authoring.ts';
import type { ScenarioScript } from '../types.ts';
import { narrator, registerTrap, script, them, you } from './authoring.ts';

/**
 * The Bürgeramt, and the bank.
 *
 * Two counters where the German is not hard but the *procedure* is, and where
 * the sentence that gets you through is usually the one that names a document.
 * Everything here is Sie, and every stage ends with you knowing what happens
 * next — which is the actual goal of an appointment at a German authority.
 */

const BUERGERAMT_A2 = script({
  id: 'sc-buergeramt-a2',
  scenarioId: 'sc-buergeramt',
  level: 'a2',
  register: 'Sie',
  partner: bi('the clerk on the phone', 'служителката по телефона'),
  goal: bi(
    'Get an appointment for registering your address, when the online calendar is empty.',
    'Вземи час за адресна регистрация, когато онлайн календарът е празен.',
  ),
  lessonIds: ['b1-u2-l1'],
  outro: bi(
    'The useful part was not the appointment. It was the list at the end: three documents, and now you know them before you are standing at the counter without one.',
    'Полезното не беше часът. Беше списъкът накрая: три документа, и сега ги знаеш, преди да си застанал на гишето без един от тях.',
  ),
  beats: [
    narrator(
      bi(
        'The online calendar has shown "keine Termine verfügbar" for eleven days. You call instead.',
        'Онлайн календарът показва „keine Termine verfügbar“ от единайсет дни. Вместо това се обаждаш.',
      ),
    ),
    them('Bürgeramt Mitte, Sie sprechen mit Frau Lange.', bi('Mitte registration office, Ms Lange speaking.', 'Гражданска служба „Мите“, на телефона е госпожа Ланге.')),
    you(
      'sc-buergeramt-a2-t1',
      bi('Say what you need', 'Кажи какво ти трябва'),
      [
        {
          id: 'sc-buergeramt-a2-t1-s1',
          instruction: bi(
            'für plus the accusative for the purpose of an appointment.',
            '„für“ плюс винителен падеж за целта на часа.',
          ),
          prompt: bi('You need an appointment to register your address.', 'Трябва ти час за адресна регистрация.'),
          answer: 'Guten Tag, ich brauche einen Termin für die Anmeldung.',
          alternatives: [
            'Guten Tag, ich hätte gern einen Termin für die Anmeldung.',
            'Guten Tag, ich möchte mich anmelden und brauche einen Termin.',
            'Ich brauche einen Termin für die Anmeldung.',
            'Ich hätte gern einen Termin für die Anmeldung.',
            'Ich möchte mich anmelden und brauche einen Termin.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-das-buergeramt', 'v-die-anmeldung', 'v-termin'],
          hints: [
            bi('der Termin, accusative after brauchen.', '„der Termin“, винителен падеж след „brauchen“.'),
            bi('… ich brauche ein__ Termin für die Anmeldung.', '… ich brauche ein__ Termin für die Anmeldung.'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Online sind leider bis Mitte Juni keine Termine frei.',
      bi('Unfortunately there are no appointments online until mid-June.', 'За съжаление онлайн няма свободни часове до средата на юни.'),
    ),
    you(
      'sc-buergeramt-a2-t2',
      bi('Ask whether there is another way', 'Попитай дали има друг начин'),
      [
        {
          id: 'sc-buergeramt-a2-t2-s1',
          instruction: bi(
            'Asking for an alternative rather than arguing with the answer is what moves a German counter.',
            'Да поискаш алтернатива, вместо да спориш с отговора, е това, което задвижва немското гише.',
          ),
          prompt: bi('Ask whether there is another possibility.', 'Попитай дали има друга възможност.'),
          answer: 'Gibt es eine andere Möglichkeit?',
          alternatives: ['Gibt es noch eine andere Möglichkeit?', 'Was kann ich sonst machen?'],
          shape: 'sentence',
          reviewTargets: ['v-die-moeglichkeit'],
          hints: [
            bi('es gibt + accusative.', '„es gibt“ + винителен падеж.'),
            bi('G___ es eine andere Möglichkeit?', 'G___ es eine andere Möglichkeit?'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Schauen Sie morgens um sieben noch einmal. Dann werden neue Termine freigegeben.',
      bi('Have another look at seven in the morning. New appointments are released then.', 'Погледнете пак сутрин в седем. Тогава пускат нови часове.'),
    ),
    you(
      'sc-buergeramt-a2-t3',
      bi('Ask what to bring', 'Попитай какво да носиш'),
      [
        {
          id: 'sc-buergeramt-a2-t3-s1',
          instruction: bi(
            'mitbringen is separable, so with müssen it stays whole at the end: … mitbringen.',
            '„mitbringen“ е делим, но с „müssen“ остава цял накрая: … mitbringen.',
          ),
          prompt: bi('Ask what you have to bring to the appointment.', 'Попитай какво трябва да носиш на часа.'),
          answer: 'Was muss ich zum Termin mitbringen?',
          alternatives: ['Welche Unterlagen muss ich mitbringen?', 'Was brauche ich für den Termin?'],
          shape: 'sentence',
          reviewTargets: ['v-die-unterlagen'],
          hints: [
            bi('zu + dem becomes zum.', '„zu“ + „dem“ става „zum“.'),
            bi('Was muss ich z__ Termin mitbringen?', 'Was muss ich z__ Termin mitbringen?'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Ausweis, Mietvertrag und die Wohnungsgeberbestätigung vom Vermieter.',
      bi('ID, tenancy agreement and the landlord’s confirmation of residence.', 'Лична карта, договор за наем и потвърждение от наемодателя.'),
      {
        note: bi(
          'The Wohnungsgeberbestätigung is a form your landlord signs to say you really live there. No other country asks for it, and without it nothing else in the appointment happens.',
          '„Wohnungsgeberbestätigung“ е формуляр, който наемодателят подписва, за да потвърди, че наистина живееш там. Никъде другаде не го искат, а без него нищо друго на часа не се случва.',
        ),
      },
    ),
    you(
      'sc-buergeramt-a2-t4',
      bi('Check the last one', 'Провери последното'),
      [
        {
          id: 'sc-buergeramt-a2-t4-s1',
          instruction: bi(
            'Repeating the hard word back is not a weakness. It is how you find out you heard it right.',
            'Да повториш трудната дума не е слабост. Така разбираш, че си я чул правилно.',
          ),
          prompt: bi(
            'Ask whether your landlord has to sign that confirmation.',
            'Попитай дали наемодателят трябва да подпише това потвърждение.',
          ),
          answer: 'Muss mein Vermieter die Bestätigung unterschreiben?',
          alternatives: [
            'Die Wohnungsgeberbestätigung unterschreibt der Vermieter?',
            'Muss der Vermieter die Bestätigung unterschreiben?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-der-vermieter', 'v-unterschreiben', 'v-die-bescheinigung'],
          hints: [
            bi('Modal first, verb at the end.', 'Първо модалният глагол, глаголът накрая.'),
            bi('M___ mein Vermieter die Bestätigung unterschreiben?', 'M___ mein Vermieter die Bestätigung unterschreiben?'),
          ],
        },
      ],
      'a2',
    ),
  ],
});

const BUERGERAMT_B1 = script({
  id: 'sc-buergeramt-b1',
  scenarioId: 'sc-buergeramt',
  level: 'b1',
  register: 'Sie',
  partner: bi('the clerk at the counter', 'служителят на гишето'),
  goal: bi('Register your address, and answer what is asked without padding.', 'Регистрирай адреса си и отговаряй на въпросите без излишни думи.'),
  lessonIds: ['b1-u2-l2'],
  outro: bi(
    'An Anmeldung is six questions and four documents. The German is easy; what makes it go wrong is not knowing which answer they need, and now you do.',
    'Адресната регистрация е шест въпроса и четири документа. Немският е лесен; обърква се от това да не знаеш кой отговор им трябва — а сега знаеш.',
  ),
  beats: [
    them('Sie möchten sich anmelden? Ihren Ausweis, bitte.', bi('You want to register? Your ID, please.', 'Искате да се регистрирате? Личната карта, моля.')),
    you(
      'sc-buergeramt-b1-t1',
      bi('Hand it over and give the date you moved in', 'Подай я и кажи датата на нанасяне'),
      [
        {
          id: 'sc-buergeramt-b1-t1-s1',
          instruction: bi(
            'einziehen is movement into a place, so its Perfekt takes sein, and a date takes am with an ordinal.',
            '„einziehen“ е движение навътре, затова Perfekt иска „sein“, а датата иска „am“ с поредно число.',
          ),
          prompt: bi('Here it is — you moved in on the first of March.', 'Заповядай — нанесъл си се на първи март.'),
          answer: 'Hier, bitte. Ich bin am ersten März eingezogen.',
          alternatives: [
            'Bitte schön. Ich bin am ersten März eingezogen.',
            'Hier ist mein Ausweis. Ich bin am ersten März eingezogen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-der-ausweis', 'v-einziehen', 'v-maerz'],
          traps: [
            {
              answer: 'Hier, bitte. Ich habe am ersten März eingezogen.',
              category: 'auxiliary-verb',
              feedback: bi(
                'Moving in is movement into somewhere, so it takes sein: ich bin eingezogen.',
                'Нанасянето е движение навътре, затова иска „sein“: ich bin eingezogen.',
              ),
            },
          ],
          hints: [
            bi('Perfekt with sein, and the prefix joins the participle: eingezogen.', 'Perfekt със „sein“, а представката се слива с причастието: eingezogen.'),
            bi('Ich b__ am ersten März e_________.', 'Ich b__ am ersten März e_________.'),
          ],
        },
      ],
      'b1',
    ),
    them('Haben Sie die Wohnungsgeberbestätigung dabei?', bi('Do you have the landlord’s confirmation with you?', 'Носите ли потвърждението от наемодателя?')),
    you(
      'sc-buergeramt-b1-t2',
      bi('Confirm, and say it is signed', 'Потвърди и кажи, че е подписано'),
      [
        {
          id: 'sc-buergeramt-b1-t2-s1',
          instruction: bi(
            'Volunteering that it is signed saves the question he was about to ask.',
            'Да кажеш сам, че е подписано, спестява въпроса, който той тъкмо е щял да зададе.',
          ),
          prompt: bi('Yes, and your landlord has signed it.', 'Да, и наемодателят го е подписал.'),
          answer: 'Ja, hier. Mein Vermieter hat sie unterschrieben.',
          alternatives: [
            'Ja, hier ist sie. Mein Vermieter hat sie unterschrieben.',
            'Ja, die habe ich dabei, unterschrieben.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-der-vermieter', 'v-unterschreiben'],
          hints: [
            bi('unterschreiben is inseparable: no ge- in the participle.', '„unterschreiben“ е неделим: няма „ge-“ в причастието.'),
            bi('Mein Vermieter hat sie u____________.', 'Mein Vermieter hat sie u____________.'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Waren Sie vorher schon einmal in Deutschland gemeldet?',
      bi('Have you been registered in Germany before?', 'Били ли сте регистрирани в Германия преди?'),
    ),
    you(
      'sc-buergeramt-b1-t3',
      bi('Say this is the first time', 'Кажи, че е за пръв път'),
      [
        {
          id: 'sc-buergeramt-b1-t3-s1',
          instruction: bi(
            'zuziehen — to move into an area — is the word the form itself uses, and it also takes sein.',
            '„zuziehen“ — да се преселиш в район — е думата, която самият формуляр използва, и също иска „sein“.',
          ),
          prompt: bi('No, you have only just moved here.', 'Не, току-що си се преместил тук.'),
          answer: 'Nein, ich bin gerade erst zugezogen.',
          alternatives: ['Nein, das ist das erste Mal.', 'Nein, ich bin neu zugezogen.'],
          shape: 'sentence',
          hints: [
            bi('gerade erst is "only just".', '„gerade erst“ значи „едва сега“.'),
            bi('Nein, ich b__ gerade erst zugezogen.', 'Nein, ich b__ gerade erst zugezogen.'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Gut. Ihre Steuer-Identifikationsnummer bekommen Sie dann per Post.',
      bi('Good. You will receive your tax identification number by post.', 'Добре. Данъчният Ви идентификационен номер ще получите по пощата.'),
    ),
    you(
      'sc-buergeramt-b1-t4',
      bi('Ask how long that takes', 'Попитай колко време отнема'),
      [
        {
          id: 'sc-buergeramt-b1-t4-s1',
          instruction: bi(
            'You need this number before you can be paid, so it is the right question, not a polite one.',
            'Този номер ти трябва, преди да ти платят заплата, така че това е верният въпрос, а не любезен.',
          ),
          prompt: bi('Ask roughly how long that takes.', 'Попитай приблизително колко време отнема.'),
          answer: 'Wie lange dauert das ungefähr?',
          alternatives: ['Wie lange dauert das etwa?', 'Wann bekomme ich die ungefähr?'],
          shape: 'sentence',
          reviewTargets: ['v-wie-lange'],
          traps: [registerTrap('Wie lange dauert das bei dir ungefähr?', 'Sie')],
          hints: [bi('dauern, with an "about" word at the end.', '„dauern“ и дума за „приблизително“ накрая.')],
        },
      ],
      'b1',
    ),
  ],
});

const BUERGERAMT_B2 = script({
  id: 'sc-buergeramt-b2',
  scenarioId: 'sc-buergeramt',
  level: 'b2',
  register: 'Sie',
  partner: bi('the clerk at the counter', 'служителят на гишето'),
  goal: bi(
    'One document is missing and the deadline is running. Get it accepted later, or get to somebody who can allow that.',
    'Един документ липсва, а срокът тече. Издействай да го донесеш по-късно или стигни до някого, който може да го разреши.',
  ),
  lessonIds: ['b2-u4-l1'],
  outro: bi(
    'Escalating politely is a skill with a shape: agree with the rule, give the reason, ask for the exception by name, and only then ask for the person. Nothing in that sequence is a complaint.',
    'Учтивата ескалация има форма: съгласи се с правилото, дай причината, поискай изключението по име и едва тогава поискай човека. Нищо в тази последователност не е оплакване.',
  ),
  beats: [
    narrator(
      bi(
        'You are at the counter. The landlord’s confirmation is not in your folder, and the two-week registration deadline runs out on Friday.',
        'На гишето си. Потвърждението от наемодателя не е в папката ти, а двуседмичният срок за регистрация изтича в петък.',
      ),
    ),
    them(
      'Ohne die Wohnungsgeberbestätigung kann ich die Anmeldung nicht vornehmen.',
      bi('Without the landlord’s confirmation I cannot carry out the registration.', 'Без потвърждението от наемодателя не мога да извърша регистрацията.'),
    ),
    you(
      'sc-buergeramt-b2-t1',
      bi('Agree with the rule, then give the reason', 'Съгласи се с правилото, после дай причината'),
      [
        {
          id: 'sc-buergeramt-b2-t1-s1',
          instruction: bi(
            'allerdings is the polite "however": it concedes the point and then turns it, without the flat contradiction of aber.',
            '„allerdings“ е учтивото „обаче“: признава тезата и после я обръща, без плоското противопоставяне на „aber“.',
          ),
          prompt: bi(
            'You understand — but your landlord is abroad and sends it next week.',
            'Разбираш — но наемодателят ти е в чужбина и ще я изпрати другата седмица.',
          ),
          answer: 'Das verstehe ich. Mein Vermieter ist allerdings im Ausland und schickt sie erst nächste Woche.',
          alternatives: [
            'Das verstehe ich. Mein Vermieter ist allerdings im Ausland und schickt sie mir erst nächste Woche.',
            'Das ist mir klar. Mein Vermieter ist allerdings im Ausland und schickt sie erst nächste Woche.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-allerdings', 'v-der-vermieter'],
          traps: [
            {
              answer: 'Das verstehe ich. Aber mein Vermieter ist im Ausland und schickt sie erst nächste Woche.',
              category: 'vocabulary',
              feedback: bi(
                'Understandable, and it opens the second sentence by contradicting him. allerdings does the same work from inside the sentence, which is why officialdom prefers it.',
                'Разбираемо е — и започва второто изречение с противопоставяне. „allerdings“ върши същата работа отвътре в изречението и затова администрацията го предпочита.',
              ),
            },
          ],
          hints: [
            bi('The connector goes in third position, after the verb.', 'Свързващата дума е на трето място, след глагола.'),
            bi('Mein Vermieter ist a_________ im Ausland …', 'Mein Vermieter ist a_________ im Ausland …'),
          ],
        },
      ],
      'b2',
    ),
    them(
      'Dann müssten Sie leider einen neuen Termin vereinbaren.',
      bi('Then you would unfortunately have to make a new appointment.', 'Тогава за съжаление ще трябва да запишете нов час.'),
    ),
    you(
      'sc-buergeramt-b2-t2',
      bi('Ask for the exception by its name', 'Поискай изключението с точната му дума'),
      [
        {
          id: 'sc-buergeramt-b2-t2-s1',
          instruction: bi(
            'nachreichen is the official word for handing a document in afterwards. Asking for it by name tells the clerk you are asking for something the rules already allow.',
            '„nachreichen“ е официалната дума за подаване на документ допълнително. Да я използваш, показва на служителя, че искаш нещо, което правилата вече позволяват.',
          ),
          prompt: bi(
            'Ask whether there is any possibility of submitting the confirmation later.',
            'Попитай дали има възможност потвърждението да бъде подадено по-късно.',
          ),
          answer: 'Gibt es die Möglichkeit, die Bestätigung nachzureichen?',
          alternatives: [
            'Besteht die Möglichkeit, die Bestätigung nachzureichen?',
            'Könnte ich die Bestätigung nachreichen?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-moeglichkeit', 'v-einreichen'],
          traps: [
            {
              answer: 'Gibt es die Möglichkeit, die Bestätigung nachreichen?',
              category: 'missing-word',
              feedback: bi(
                'A separable verb in a zu-infinitive puts the zu inside the word: nachzureichen.',
                'Делимият глагол в инфинитив със „zu“ слага „zu“ вътре в думата: nachzureichen.',
              ),
            },
          ],
          hints: [
            bi('The zu goes between the prefix and the verb.', '„zu“ отива между представката и глагола.'),
            bi('…, die Bestätigung nach________?', '…, die Bestätigung nach________?'),
          ],
        },
      ],
      'b2',
    ),
    them(
      'Das entscheide ich nicht. Das müsste der Sachgebietsleiter genehmigen.',
      bi('That is not my decision. The section head would have to approve it.', 'Това не го решавам аз. Ще трябва ръководителят на отдела да го одобри.'),
    ),
    you(
      'sc-buergeramt-b2-t3',
      bi('Ask for the person, with the reason attached', 'Поискай човека, като посочиш причината'),
      [
        {
          id: 'sc-buergeramt-b2-t3-s1',
          instruction: bi(
            'ablaufen is what a deadline does, and putting it after sonst turns the request into a consequence rather than a demand.',
            '„ablaufen“ е това, което прави срокът, а поставено след „sonst“, превръща молбата в последица, а не в искане.',
          ),
          prompt: bi(
            'Ask whether you could speak to him, because otherwise your deadline runs out.',
            'Попитай дали може да говориш с него, защото иначе срокът ти изтича.',
          ),
          answer: 'Könnte ich ihn kurz sprechen? Sonst läuft mir die Frist ab.',
          alternatives: [
            'Könnte ich kurz mit ihm sprechen? Sonst läuft mir die Frist ab.',
            'Wäre es möglich, ihn kurz zu sprechen? Sonst läuft mir die Frist ab.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-frist', 'v-zustaendig'],
          hints: [
            bi('Konjunktiv II of können, then the consequence with sonst.', 'Konjunktiv II на „können“, после последицата със „sonst“.'),
            bi('K_____ ich ihn kurz sprechen? Sonst läuft mir die Frist a_.', 'K_____ ich ihn kurz sprechen? Sonst läuft mir die Frist a_.'),
          ],
        },
      ],
      'b2',
    ),
    them(
      'Einen Moment, ich frage nach. — Er sagt, Sie können sie bis Freitag per E-Mail nachreichen.',
      bi('One moment, I will ask. — He says you can submit it by email by Friday.', 'Един момент, ще попитам. — Казва, че може да я изпратите по имейл до петък.'),
    ),
    you(
      'sc-buergeramt-b2-t4',
      bi('Confirm what you now owe them', 'Потвърди какво дължиш оттук нататък'),
      [
        {
          id: 'sc-buergeramt-b2-t4-s1',
          instruction: bi(
            'Repeating the arrangement back is what closes an official conversation cleanly, and fristgerecht is the word for "within the deadline".',
            'Повтарянето на уговорката е това, което затваря официалния разговор чисто, а „fristgerecht“ е думата за „в срок“.',
          ),
          prompt: bi(
            'Thank him and say you will send it by Friday.',
            'Благодари му и кажи, че ще я изпратиш до петък.',
          ),
          answer: 'Vielen Dank! Ich schicke sie Ihnen fristgerecht bis Freitag.',
          alternatives: [
            'Vielen Dank! Ich reiche sie fristgerecht bis Freitag nach.',
            'Vielen Dank, ich schicke sie bis Freitag per E-Mail.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-fristgerecht'],
          hints: [bi('Thanks, then what you will do and by when.', 'Благодарност, после какво ще направиш и докога.')],
        },
      ],
      'b2',
    ),
  ],
});

const BANK_A2 = script({
  id: 'sc-bank-a2',
  scenarioId: 'sc-bank',
  level: 'a2',
  register: 'Sie',
  partner: bi('the bank adviser', 'банковият консултант'),
  goal: bi('Open a current account.', 'Открий разплащателна сметка.'),
  outro: bi(
    'An account is the thing everything else waits for: the landlord, the employer and the phone contract all need the number. Two sentences opened it.',
    'Сметката е нещото, което всичко останало чака: наемодателят, работодателят и телефонният договор искат номера. Две изречения я откриха.',
  ),
  beats: [
    them('Guten Tag, was kann ich für Sie tun?', bi('Hello, what can I do for you?', 'Добър ден, какво мога да направя за Вас?')),
    you(
      'sc-bank-a2-t1',
      bi('Say what you want to open', 'Кажи какво искаш да откриеш'),
      [
        {
          id: 'sc-bank-a2-t1-s1',
          instruction: bi(
            'eröffnen is the verb for opening an account, not aufmachen, which is for doors and windows.',
            '„eröffnen“ е глаголът за откриване на сметка, не „aufmachen“, което е за врати и прозорци.',
          ),
          prompt: bi('You want to open an account.', 'Искаш да откриеш сметка.'),
          answer: 'Ich möchte ein Konto eröffnen.',
          alternatives: ['Ich würde gern ein Konto eröffnen.', 'Ich möchte ein Girokonto eröffnen.'],
          shape: 'sentence',
          reviewTargets: ['v-bank'],
          traps: [
            {
              answer: 'Ich möchte ein Konto aufmachen.',
              category: 'vocabulary',
              feedback: bi(
                'aufmachen opens a door. An account, a shop and a procedure are all eröffnet.',
                '„aufmachen“ отваря врата. Сметка, магазин и процедура се „eröffnet“.',
              ),
            },
          ],
          hints: [
            bi('The verb goes to the end after möchte.', 'Глаголът отива накрая след „möchte“.'),
            bi('Ich möchte ein Konto e________.', 'Ich möchte ein Konto e________.'),
          ],
        },
      ],
      'a2',
    ),
    them('Gern. Sind Sie in Deutschland gemeldet?', bi('Of course. Are you registered in Germany?', 'С удоволствие. Регистриран ли сте в Германия?')),
    you(
      'sc-bank-a2-t2',
      bi('Answer with how long', 'Отговори с откога'),
      [
        {
          id: 'sc-bank-a2-t2-s1',
          instruction: bi(
            'seit + dative, and the present tense, because you still are.',
            '„seit“ + дателен падеж и сегашно време, защото още си.',
          ),
          prompt: bi('Yes, for two weeks.', 'Да, от две седмици.'),
          answer: 'Ja, seit zwei Wochen.',
          alternatives: ['Ja, seit zwei Wochen bin ich angemeldet.', 'Ja, ich bin seit zwei Wochen gemeldet.'],
          shape: 'phrase',
          reviewTargets: ['v-sich-anmelden', 'v-die-woche'],
          hints: [bi('Four words.', 'Четири думи.')],
        },
      ],
      'a2',
    ),
    them(
      'Dann brauche ich Ihren Ausweis und die Anmeldebestätigung.',
      bi('Then I need your ID and the registration confirmation.', 'Тогава ми трябват личната Ви карта и удостоверението за регистрация.'),
    ),
    you(
      'sc-bank-a2-t3',
      bi('Ask what it costs per month', 'Попитай колко струва на месец'),
      [
        {
          id: 'sc-bank-a2-t3-s1',
          instruction: bi(
            'A monthly rate is im Monat — in the month — with the dative.',
            'Месечната такса е „im Monat“ — в месеца — с дателен падеж.',
          ),
          prompt: bi('Ask what the account costs per month.', 'Попитай колко струва сметката на месец.'),
          answer: 'Was kostet das Konto im Monat?',
          alternatives: ['Wie viel kostet das Konto im Monat?', 'Was kostet die Kontoführung?'],
          shape: 'sentence',
          reviewTargets: ['v-kosten', 'v-der-monat'],
          hints: [
            bi('in + dem becomes im.', '„in“ + „dem“ става „im“.'),
            bi('Was kostet das Konto i_ Monat?', 'Was kostet das Konto i_ Monat?'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Das Girokonto ist kostenlos, solange ein Gehalt eingeht.',
      bi('The current account is free as long as a salary comes in.', 'Разплащателната сметка е безплатна, докато постъпва заплата.'),
      {
        note: bi(
          'solange keeps its verb at the end, like every subordinating conjunction — and the condition it names is on most German free accounts.',
          '„solange“ държи глагола накрая, като всеки подчинителен съюз — а условието, което въвежда, стои на повечето безплатни немски сметки.',
        ),
      },
    ),
    you(
      'sc-bank-a2-t4',
      bi('Say that works and ask what happens next', 'Кажи, че става, и попитай какво следва'),
      [
        {
          id: 'sc-bank-a2-t4-s1',
          prompt: bi('That is fine. Ask when you get the card.', 'Това е добре. Попитай кога ще получиш картата.'),
          answer: 'Das passt. Wann bekomme ich die Karte?',
          alternatives: ['Gut. Wann bekomme ich die Karte?', 'Das passt mir. Wann kommt die Karte?'],
          shape: 'sentence',
          reviewTargets: ['v-wann'],
          hints: [bi('wann + verb + ich.', '„wann“ + глагол + „ich“.')],
        },
      ],
      'a2',
    ),
  ],
});

const BANK_B1 = script({
  id: 'sc-bank-b1',
  scenarioId: 'sc-bank',
  level: 'b1',
  register: 'Sie',
  partner: bi('the insurance adviser', 'консултантът по осигуровки'),
  goal: bi('Switch health insurer, and say why without being asked twice.', 'Смени здравната каса и кажи защо, без да те питат два пъти.'),
  lessonIds: ['b1-u3-l3'],
  outro: bi(
    'Two reasons, one sentence, joined by und: German is perfectly happy with a plain list of causes and does not expect the apology English speakers tend to attach.',
    'Две причини, едно изречение, свързани с „und“: немският е напълно доволен от обикновено изброяване на причини и не очаква извинението, което англоговорящите обикновено прикачват.',
  ),
  beats: [
    them('Sie möchten die Krankenkasse wechseln?', bi('You want to change health insurer?', 'Искате да смените здравната каса?')),
    you(
      'sc-bank-b1-t1',
      bi('Say yes, and give both reasons', 'Кажи „да“ и дай и двете причини'),
      [
        {
          id: 'sc-bank-b1-t1-s1',
          instruction: bi(
            'zufrieden goes with mit plus the dative, and steigen takes sein in the Perfekt.',
            '„zufrieden“ върви с „mit“ плюс дателен падеж, а „steigen“ иска „sein“ в Perfekt.',
          ),
          prompt: bi(
            'You are not happy with the service, and the extra contribution has gone up.',
            'Не си доволен от обслужването, а допълнителната вноска се е вдигнала.',
          ),
          answer: 'Ja, ich bin mit dem Service nicht zufrieden, und der Zusatzbeitrag ist gestiegen.',
          alternatives: [
            'Ja, ich bin mit dem Service nicht zufrieden und der Beitrag ist gestiegen.',
            'Ja, der Service ist schlecht und der Zusatzbeitrag ist gestiegen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-krankenkasse', 'v-steigen'],
          traps: [
            {
              answer: 'Ja, ich bin mit dem Service nicht zufrieden, und der Zusatzbeitrag hat gestiegen.',
              category: 'auxiliary-verb',
              feedback: bi(
                'steigen is a change of state going upward, so it takes sein: der Beitrag ist gestiegen.',
                '„steigen“ е промяна на състояние нагоре, затова иска „sein“: der Beitrag ist gestiegen.',
              ),
            },
          ],
          hints: [
            bi('mit + dative, then a Perfekt with sein.', '„mit“ + дателен падеж, после Perfekt със „sein“.'),
            bi('… und der Zusatzbeitrag i__ gestiegen.', '… und der Zusatzbeitrag i__ gestiegen.'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Sie müssen mindestens zwölf Monate dort versichert gewesen sein.',
      bi('You must have been insured there for at least twelve months.', 'Трябва да сте били осигурен там поне дванайсет месеца.'),
    ),
    you(
      'sc-bank-b1-t2',
      bi('Say how long you have been there', 'Кажи откога си там'),
      [
        {
          id: 'sc-bank-b1-t2-s1',
          instruction: bi(
            'versichert sein is a state, so seit plus the present says it is still true.',
            '„versichert sein“ е състояние, затова „seit“ плюс сегашно време казва, че още е така.',
          ),
          prompt: bi('Two years.', 'Две години.'),
          answer: 'Ich bin seit zwei Jahren dort versichert.',
          alternatives: ['Seit zwei Jahren bin ich dort versichert.', 'Ich bin dort seit zwei Jahren versichert.'],
          shape: 'sentence',
          reviewTargets: ['v-versichert', 'v-das-jahr'],
          hints: [
            bi('seit + dative plural: seit zwei Jahren.', '„seit“ + дателен падеж, мн. ч.: seit zwei Jahren.'),
            bi('Ich bin seit zwei J_____ dort versichert.', 'Ich bin seit zwei J_____ dort versichert.'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Gut, dann kündigen wir das für Sie. Das übernehmen wir.',
      bi('Good, then we will give notice for you. We take care of that.', 'Добре, тогава ние ще прекратим вместо Вас. Ние поемаме това.'),
    ),
    you(
      'sc-bank-b1-t3',
      bi('Ask about your employer', 'Попитай за работодателя си'),
      [
        {
          id: 'sc-bank-b1-t3-s1',
          instruction: bi(
            'Bescheid sagen takes a dative person: ich sage meinem Arbeitgeber Bescheid.',
            '„Bescheid sagen“ иска човек в дателен падеж: ich sage meinem Arbeitgeber Bescheid.',
          ),
          prompt: bi(
            'Ask whether you have to tell your employer.',
            'Попитай дали трябва да съобщиш на работодателя си.',
          ),
          answer: 'Muss ich meinem Arbeitgeber Bescheid sagen?',
          alternatives: [
            'Muss ich das meinem Arbeitgeber mitteilen?',
            'Muss ich meinen Arbeitgeber informieren?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-bescheid-sagen', 'v-der-arbeitgeber'],
          traps: [
            {
              answer: 'Muss ich meinen Arbeitgeber Bescheid sagen?',
              category: 'case',
              feedback: bi(
                'You say Bescheid *to* somebody, so the person is dative: meinem Arbeitgeber. Compare informieren, which takes the accusative.',
                'Казваш „Bescheid“ *на* някого, значи човекът е в дателен падеж: meinem Arbeitgeber. Сравни с „informieren“, което иска винителен.',
              ),
            },
          ],
          hints: [
            bi('The person receiving the news is dative.', 'Човекът, който получава новината, е в дателен падеж.'),
            bi('Muss ich mein__ Arbeitgeber Bescheid sagen?', 'Muss ich mein__ Arbeitgeber Bescheid sagen?'),
          ],
        },
      ],
      'b1',
    ),
    them('Nein, das läuft automatisch über uns.', bi('No, that runs automatically through us.', 'Не, това минава автоматично през нас.')),
    you(
      'sc-bank-b1-t4',
      bi('Ask when the change takes effect', 'Попитай откога влиза в сила'),
      [
        {
          id: 'sc-bank-b1-t4-s1',
          instruction: bi(
            'gelten is the verb for a rule or a policy being in force.',
            '„gelten“ е глаголът за правило или полица, която е в сила.',
          ),
          prompt: bi('Ask from when the new insurance applies.', 'Попитай от кога важи новата осигуровка.'),
          answer: 'Ab wann gilt die neue Versicherung?',
          alternatives: ['Ab wann bin ich bei Ihnen versichert?', 'Ab welchem Datum gilt das?'],
          shape: 'sentence',
          reviewTargets: ['v-die-versicherung'],
          hints: [
            bi('The verb changes its vowel: gelten becomes gilt.', 'Глаголът сменя гласната: „gelten“ става „gilt“.'),
            bi('Ab wann g___ die neue Versicherung?', 'Ab wann g___ die neue Versicherung?'),
          ],
        },
      ],
      'b1',
    ),
  ],
});

const BANK_B2 = script({
  id: 'sc-bank-b2',
  scenarioId: 'sc-bank',
  level: 'b2',
  register: 'Sie',
  partner: bi('the bank adviser', 'банковият консултант'),
  goal: bi(
    'A payment you never agreed to left your account. Get it reversed and get that in writing.',
    'От сметката ти е излязло плащане, за което не си давал съгласие. Издействай връщането му и го получи писмено.',
  ),
  lessonIds: ['b2-u4-l1'],
  outro: bi(
    'The sentence that does the work is the relative clause: eine Abbuchung, der ich nicht zugestimmt habe. zustimmen takes a dative, so the relative pronoun is der even though the debit is feminine — and that one ending is the difference between a complaint and a claim.',
    'Изречението, което върши работата, е подчиненото определително: eine Abbuchung, der ich nicht zugestimmt habe. „zustimmen“ иска дателен падеж, затова относителното местоимение е „der“, макар тегленето да е от женски род — и точно това окончание е разликата между оплакване и претенция.',
  ),
  beats: [
    narrator(
      bi(
        'Forty-nine euros, on the twelfth, to a company you have never heard of.',
        'Четирийсет и девет евро, на дванайсети, към фирма, за която не си чувал.',
      ),
    ),
    them('Worum geht es denn?', bi('What is it about?', 'За какво става дума?')),
    you(
      'sc-bank-b2-t1',
      bi('Name the problem precisely', 'Назови проблема точно'),
      [
        {
          id: 'sc-bank-b2-t1-s1',
          instruction: bi(
            'zustimmen takes the dative, so a relative clause built on it uses the dative pronoun: der, not die.',
            '„zustimmen“ иска дателен падеж, затова относителното изречение с него използва дателното местоимение: „der“, не „die“.',
          ),
          prompt: bi(
            'There is a debit on your statement that you did not agree to.',
            'В извлечението ти има теглене, за което не си давал съгласие.',
          ),
          answer: 'Auf meinem Kontoauszug ist eine Abbuchung, der ich nicht zugestimmt habe.',
          alternatives: [
            'Auf meinem Kontoauszug steht eine Abbuchung, der ich nicht zugestimmt habe.',
            'Es gibt eine Abbuchung auf meinem Konto, der ich nicht zugestimmt habe.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-reklamation'],
          traps: [
            {
              answer: 'Auf meinem Kontoauszug ist eine Abbuchung, die ich nicht zugestimmt habe.',
              category: 'case',
              feedback: bi(
                'The relative pronoun takes the case the verb inside the clause demands, not the case of the thing outside it. zustimmen is dative, so: der ich nicht zugestimmt habe.',
                'Относителното местоимение взима падежа, който иска глаголът вътре в изречението, а не падежа на нещото отвън. „zustimmen“ е с дателен падеж, значи: der ich nicht zugestimmt habe.',
              ),
            },
          ],
          hints: [
            bi('Which case does zustimmen take?', 'Кой падеж иска „zustimmen“?'),
            bi('…, d__ ich nicht zugestimmt habe.', '…, d__ ich nicht zugestimmt habe.'),
          ],
        },
      ],
      'b2',
    ),
    them('Wann wurde sie ausgeführt?', bi('When was it carried out?', 'Кога е била извършена?'), {
      note: bi(
        'A passive in the past: wurde + participle. The bank does not say who did it, because that is exactly what is in question.',
        'Страдателен залог в минало време: „wurde“ + причастие. Банката не казва кой го е направил, защото точно това е под въпрос.',
      ),
    }),
    you(
      'sc-bank-b2-t2',
      bi('Give the date and the amount', 'Кажи датата и сумата'),
      [
        {
          id: 'sc-bank-b2-t2-s1',
          instruction: bi(
            'An amount takes über: eine Abbuchung über neunundvierzig Euro.',
            'Сумата иска „über“: eine Abbuchung über neunundvierzig Euro.',
          ),
          prompt: bi('The twelfth of March, forty-nine euros.', 'Дванайсети март, четирийсет и девет евро.'),
          answer: 'Am zwölften März, über neunundvierzig Euro.',
          alternatives: [
            'Am zwölften März, über 49 Euro.',
            'Am zwölften März, es ging um neunundvierzig Euro.',
          ],
          shape: 'phrase',
          reviewTargets: ['v-maerz', 'v-der-euro'],
          hints: [
            bi('am + ordinal for a date.', '„am“ + поредно число за дата.'),
            bi('A_ zwölften März, über neunundvierzig Euro.', 'A_ zwölften März, über neunundvierzig Euro.'),
          ],
        },
      ],
      'b2',
    ),
    them(
      'Eine Lastschrift können Sie innerhalb von acht Wochen zurückgeben.',
      bi('You can return a direct debit within eight weeks.', 'Директен дебит може да бъде върнат в рамките на осем седмици.'),
    ),
    you(
      'sc-bank-b2-t3',
      bi('Ask for it, and ask for it in writing', 'Поискай го и поискай го писмено'),
      [
        {
          id: 'sc-bank-b2-t3-s1',
          instruction: bi(
            'Two requests in one sentence, joined by und: the action, and the proof that it happened.',
            'Две молби в едно изречение, свързани с „und“: действието и доказателството, че е станало.',
          ),
          prompt: bi(
            'You want the debit returned and written confirmation of it.',
            'Искаш тегленето да бъде върнато и да получиш писмено потвърждение.',
          ),
          answer: 'Dann möchte ich die Lastschrift zurückgeben und eine schriftliche Bestätigung bekommen.',
          alternatives: [
            'Dann möchte ich die Lastschrift zurückgeben und das schriftlich bestätigt bekommen.',
            'Ich möchte die Lastschrift zurückgeben und eine schriftliche Bestätigung erhalten.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-bestaetigung', 'v-die-rueckerstattung'],
          hints: [
            bi('Both infinitives land at the end, in order.', 'И двата инфинитива са накрая, по ред.'),
            bi('… die Lastschrift zurückgeben u__ eine schriftliche Bestätigung bekommen.', '… die Lastschrift zurückgeben u__ eine schriftliche Bestätigung bekommen.'),
          ],
        },
      ],
      'b2',
    ),
    them(
      'Mache ich. Das Geld ist morgen wieder auf Ihrem Konto.',
      bi('I will do that. The money will be back in your account tomorrow.', 'Ще го направя. Парите ще са обратно по сметката Ви утре.'),
    ),
    you(
      'sc-bank-b2-t4',
      bi('Ask what to do about the source', 'Попитай какво да правиш с източника'),
      [
        {
          id: 'sc-bank-b2-t4-s1',
          instruction: bi(
            'empfehlen takes a dative person and an accusative thing: was empfehlen Sie mir?',
            '„empfehlen“ иска човек в дателен падеж и нещо във винителен: was empfehlen Sie mir?',
          ),
          prompt: bi(
            'Ask what he advises so that it does not happen again.',
            'Попитай какво препоръчва, за да не се повтори.',
          ),
          answer: 'Was empfehlen Sie mir, damit das nicht wieder passiert?',
          alternatives: [
            'Was raten Sie mir, damit das nicht wieder passiert?',
            'Wie kann ich verhindern, dass das wieder passiert?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-passieren', 'v-vermeiden'],
          hints: [
            bi('The damit-clause ends with its verb.', 'Частта с „damit“ завършва с глагола си.'),
            bi('…, damit das nicht wieder p_______?', '…, damit das nicht wieder p_______?'),
          ],
        },
      ],
      'b2',
    ),
  ],
});

export const OFFICE_SCRIPTS: ScenarioScript[] = [
  BUERGERAMT_A2,
  BUERGERAMT_B1,
  BUERGERAMT_B2,
  BANK_A2,
  BANK_B1,
  BANK_B2,
];
