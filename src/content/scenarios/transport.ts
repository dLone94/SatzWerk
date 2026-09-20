import { bi } from '../authoring.ts';
import type { ScenarioScript } from '../types.ts';
import { narrator, registerTrap, script, them, you } from './authoring.ts';

/**
 * Public transport and the station.
 *
 * Three stages that follow one journey going wrong: buying the ticket,
 * finding out the train is late, and asking for the money back afterwards.
 * The last one is the conversation most people never have, because they do
 * not know it exists.
 */

const A1 = script({
  id: 'sc-transport-a1',
  scenarioId: 'sc-transport',
  level: 'a1',
  register: 'Sie',
  partner: bi('the ticket clerk', 'служителят на гишето'),
  goal: bi('Buy a return ticket to Hamburg and find your platform.', 'Купи билет за Хамбург и обратно и намери коловоза си.'),
  outro: bi(
    'Four sentences and you are on a train. The platform question is the one worth keeping: Gleis, not Plattform, and the number comes with von.',
    'Четири изречения и си във влака. Въпросът за коловоза е този, който си струва да запомниш: Gleis, не Plattform, а номерът идва с „von“.',
  ),
  beats: [
    them('Guten Tag, was kann ich für Sie tun?', bi('Hello, what can I do for you?', 'Добър ден, какво мога да направя за Вас?')),
    you(
      'sc-transport-a1-t1',
      bi('Ask for a ticket to Hamburg', 'Поискай билет за Хамбург'),
      [
        {
          id: 'sc-transport-a1-t1-s1',
          instruction: bi(
            'A town you are travelling to takes nach, with no article.',
            'Град, към който пътуваш, иска „nach“, без член.',
          ),
          prompt: bi('One ticket to Hamburg.', 'Един билет за Хамбург.'),
          answer: 'Eine Fahrkarte nach Hamburg, bitte.',
          alternatives: ['Einmal nach Hamburg, bitte.', 'Ich hätte gern eine Fahrkarte nach Hamburg.'],
          shape: 'phrase',
          reviewTargets: ['v-die-fahrkarte'],
          traps: [
            {
              answer: 'Eine Fahrkarte zu Hamburg, bitte.',
              category: 'preposition',
              feedback: bi(
                'zu is for people and buildings; towns and countries take nach. Nach Hamburg, zum Bahnhof, zu Anna.',
                '„zu“ е за хора и сгради; градовете и държавите искат „nach“. Nach Hamburg, zum Bahnhof, zu Anna.',
              ),
            },
          ],
          hints: [
            bi('The preposition for towns is four letters.', 'Предлогът за градове е четири букви.'),
            bi('Eine Fahrkarte n___ Hamburg, bitte.', 'Eine Fahrkarte n___ Hamburg, bitte.'),
          ],
        },
      ],
      'a1',
    ),
    them('Einfach oder hin und zurück?', bi('One way or return?', 'Еднопосочен или двупосочен?'), {
      note: bi(
        '"hin und zurück" is literally "there and back" — the same picture English uses when it says "there and back again".',
        '„hin und zurück“ е буквално „натам и обратно“ — същата картина, която българският използва в „отиване и връщане“.',
      ),
    }),
    you(
      'sc-transport-a1-t2',
      bi('Answer', 'Отговори'),
      [
        {
          id: 'sc-transport-a1-t2-s1',
          prompt: bi('You are coming back on Sunday.', 'Връщаш се в неделя.'),
          answer: 'Hin und zurück, bitte.',
          alternatives: ['Hin und zurück.'],
          shape: 'phrase',
          hints: [bi('Repeat the half of his question that applies.', 'Повтори частта от въпроса му, която важи.')],
        },
      ],
      'a1',
    ),
    them('Das macht achtunddreißig Euro.', bi('That will be thirty-eight euros.', 'Това прави трийсет и осем евро.')),
    narrator(bi('You pay. He slides the ticket across.', 'Плащаш. Той плъзва билета към теб.')),
    you(
      'sc-transport-a1-t3',
      bi('Ask which platform', 'Попитай от кой коловоз'),
      [
        {
          id: 'sc-transport-a1-t3-s1',
          instruction: bi(
            'German asks from which track the train departs, not which platform it is at.',
            'Немският пита от кой коловоз тръгва влакът, а не на кой перон е.',
          ),
          prompt: bi('Ask which platform the train leaves from.', 'Попитай от кой коловоз тръгва влакът.'),
          answer: 'Von welchem Gleis fährt der Zug?',
          alternatives: ['Auf welchem Gleis fährt der Zug?', 'Welches Gleis, bitte?'],
          shape: 'sentence',
          reviewTargets: ['v-zug', 'v-fahren'],
          hints: [
            bi('von + dative: welchem, not welches.', '„von“ + дателен падеж: „welchem“, не „welches“.'),
            bi('Von w_______ Gleis fährt der Zug?', 'Von w_______ Gleis fährt der Zug?'),
          ],
        },
      ],
      'a1',
    ),
    them('Von Gleis sieben, in zwölf Minuten.', bi('From platform seven, in twelve minutes.', 'От коловоз седем, след дванайсет минути.')),
    you(
      'sc-transport-a1-t4',
      bi('Thank him and go', 'Благодари и тръгвай'),
      [
        {
          id: 'sc-transport-a1-t4-s1',
          prompt: bi('Thank him.', 'Благодари му.'),
          answer: 'Vielen Dank, auf Wiedersehen!',
          alternatives: ['Danke schön, auf Wiedersehen!', 'Danke, tschüss!'],
          shape: 'phrase',
          reviewTargets: ['v-auf-wiedersehen'],
          traps: [registerTrap('Danke dir, tschüss!', 'Sie')],
          hints: [bi('Thanks, then the formal goodbye.', 'Благодаря, после официалното сбогуване.')],
        },
      ],
      'a1',
    ),
  ],
});

const A2 = script({
  id: 'sc-transport-a2',
  scenarioId: 'sc-transport',
  level: 'a2',
  register: 'Sie',
  partner: bi('the conductor', 'кондукторът'),
  goal: bi('The train is late. Find out whether you still make your connection.', 'Влакът закъснява. Разбери дали ще хванеш връзката.'),
  outro: bi(
    'The useful discovery here is not a word but a fact: a German ticket usually stays valid on the next train when the delay was theirs. Asking is how you find that out.',
    'Полезното откритие тук не е дума, а факт: немският билет обикновено остава валиден за следващия влак, когато закъснението е тяхно. Питането е начинът да го разбереш.',
  ),
  beats: [
    narrator(
      bi(
        'A crackle, then the announcement. You catch about half of it.',
        'Пращене, после съобщението. Хващаш около половината.',
      ),
    ),
    them(
      'Der ICE nach Berlin hat voraussichtlich zwanzig Minuten Verspätung.',
      bi('The ICE to Berlin is expected to be twenty minutes late.', 'ICE за Берлин се очаква да закъснее с двайсет минути.'),
      {
        note: bi(
          'German says a train "has" a delay rather than "is" delayed — Verspätung is a thing the train carries.',
          'Немският казва, че влакът „има“ закъснение, а не че „е закъснял“ — Verspätung е нещо, което влакът носи.',
        ),
      },
    ),
    you(
      'sc-transport-a2-t1',
      bi('Ask about your connection', 'Попитай за връзката си'),
      [
        {
          id: 'sc-transport-a2-t1-s1',
          instruction: bi(
            'Anschluss is the connecting train. noch at the end means "still", and it is what turns this into a worried question rather than a neutral one.',
            '„Anschluss“ е връзката. „noch“ накрая значи „все още“ и точно то превръща това в притеснен въпрос, а не в неутрален.',
          ),
          prompt: bi('You change in Hannover. Ask whether you still make it.', 'Прекачваш се в Хановер. Попитай дали още ще я хванеш.'),
          answer: 'Erreiche ich meinen Anschluss in Hannover noch?',
          alternatives: [
            'Schaffe ich meinen Anschluss in Hannover noch?',
            'Erreiche ich den Anschluss in Hannover noch?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-umsteigen'],
          traps: [
            {
              answer: 'Erreiche ich mein Anschluss in Hannover noch?',
              category: 'case',
              feedback: bi(
                'der Anschluss is masculine and it is the object of erreichen, so the possessive takes the accusative -en: meinen Anschluss.',
                '„der Anschluss“ е от мъжки род и е допълнение на „erreichen“, затова притежателното е във винителен падеж: meinen Anschluss.',
              ),
            },
          ],
          hints: [
            bi('Verb first, then the possessive in the accusative.', 'Първо глаголът, после притежателното във винителен падеж.'),
            bi('Erreiche ich m_____ Anschluss in Hannover noch?', 'Erreiche ich m_____ Anschluss in Hannover noch?'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Das wird knapp. Der Anschlusszug wartet aber meistens ein paar Minuten.',
      bi('It will be tight. But the connecting train usually waits a few minutes.', 'Ще е на косъм. Но влакът за връзката обикновено чака няколко минути.'),
    ),
    you(
      'sc-transport-a2-t2',
      bi('Ask what happens if you miss it', 'Попитай какво става, ако я изпуснеш'),
      [
        {
          id: 'sc-transport-a2-t2-s1',
          instruction: bi(
            'wenn sends its verb to the very end of its own clause, and the main clause then starts with the verb.',
            '„wenn“ изпраща глагола в самия край на своята част, а главното изречение тогава започва с глагол.',
          ),
          prompt: bi('Ask what you should do if you miss the train.', 'Попитай какво да правиш, ако изпуснеш влака.'),
          answer: 'Was mache ich, wenn ich ihn verpasse?',
          alternatives: ['Und wenn ich ihn verpasse?', 'Was soll ich machen, wenn ich ihn verpasse?'],
          shape: 'sentence',
          reviewTargets: ['v-verpassen', 'v-wenn'],
          traps: [
            {
              answer: 'Was mache ich, wenn ich verpasse ihn?',
              category: 'word-order',
              feedback: bi(
                'After wenn, everything else comes first and the verb goes last: wenn ich ihn verpasse.',
                'След „wenn“ всичко останало е отпред, а глаголът е последен: wenn ich ihn verpasse.',
              ),
            },
          ],
          hints: [
            bi('The verb of the wenn-clause is the last word.', 'Глаголът на частта с „wenn“ е последната дума.'),
            bi('Was mache ich, wenn ich ihn v________?', 'Was mache ich, wenn ich ihn v________?'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Dann nehmen Sie einfach den nächsten. Ihre Fahrkarte gilt weiter.',
      bi('Then you just take the next one. Your ticket stays valid.', 'Тогава просто вземате следващия. Билетът Ви остава валиден.'),
    ),
    you(
      'sc-transport-a2-t3',
      bi('Check that you understood', 'Провери, че си разбрал'),
      [
        {
          id: 'sc-transport-a2-t3-s1',
          instruction: bi(
            'Repeating the fact back as a statement with also is how you confirm something in German without a tag question.',
            'Повтарянето на факта като твърдение с „also“ е начинът да потвърдиш нещо на немски, без въпросителна частица.',
          ),
          prompt: bi('So you do not have to buy a new ticket.', 'Значи не трябва да купуваш нов билет.'),
          answer: 'Ich muss also keine neue Fahrkarte kaufen?',
          alternatives: [
            'Ich brauche also keine neue Fahrkarte?',
            'Also muss ich keine neue Fahrkarte kaufen?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-kaufen', 'v-muessen'],
          hints: [
            bi('kein, not nicht, in front of a noun.', '„kein“, не „nicht“, пред съществително.'),
            bi('Ich muss also k____ neue Fahrkarte kaufen?', 'Ich muss also k____ neue Fahrkarte kaufen?'),
          ],
        },
      ],
      'a2',
    ),
    them('Genau. Gute Fahrt!', bi('Exactly. Have a good trip!', 'Точно така. Приятен път!')),
    you(
      'sc-transport-a2-t4',
      bi('Thank him', 'Благодари му'),
      [
        {
          id: 'sc-transport-a2-t4-s1',
          prompt: bi('Thank him for the help.', 'Благодари му за помощта.'),
          answer: 'Vielen Dank für die Auskunft!',
          alternatives: ['Danke für die Auskunft!', 'Vielen Dank, das hilft!'],
          shape: 'phrase',
          hints: [
            bi('Auskunft is information given at a counter — the word on every station sign.', '„Auskunft“ е информацията, която дават на гише — думата на всяка гарова табела.'),
          ],
        },
      ],
      'a2',
    ),
  ],
});

const B1 = script({
  id: 'sc-transport-b1',
  scenarioId: 'sc-transport',
  level: 'b1',
  register: 'Sie',
  partner: bi('the service point', 'гишето за обслужване'),
  goal: bi(
    'Your train was cancelled. Claim the compensation you are owed.',
    'Влакът ти беше отменен. Поискай компенсацията, която ти се полага.',
  ),
  outro: bi(
    'Most people never make this claim, and the reason is usually language rather than money. Four sentences: what happened, what you want, what you need to fill in, and how long it takes.',
    'Повечето хора никога не подават тази претенция и причината обикновено е езикът, а не парите. Четири изречения: какво се случи, какво искаш, какво трябва да попълниш и колко време отнема.',
  ),
  beats: [
    narrator(
      bi(
        'The board says Fahrt fällt aus. You got to Berlin two and a half hours late, on three different trains.',
        'Таблото казва „Fahrt fällt aus“. Стигна до Берлин с два часа и половина закъснение, с три различни влака.',
      ),
    ),
    them('Guten Tag. Wie kann ich helfen?', bi('Hello. How can I help?', 'Добър ден. Как мога да помогна?')),
    you(
      'sc-transport-b1-t1',
      bi('State the facts and the request', 'Изложи фактите и молбата'),
      [
        {
          id: 'sc-transport-b1-t1-s1',
          instruction: bi(
            'ausfallen takes sein in the Perfekt, because it is a change of state rather than an action somebody did.',
            '„ausfallen“ иска „sein“ в Perfekt, защото е промяна на състояние, а не действие, което някой върши.',
          ),
          prompt: bi(
            'Your train was cancelled and you want to claim compensation.',
            'Влакът ти беше отменен и искаш да поискаш компенсация.',
          ),
          answer: 'Mein Zug ist ausgefallen, und ich möchte eine Entschädigung beantragen.',
          alternatives: [
            'Mein Zug ist ausgefallen. Ich möchte eine Entschädigung beantragen.',
            'Mein Zug ist ausgefallen, ich würde gern eine Entschädigung beantragen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-zug', 'v-beantragen'],
          traps: [
            {
              answer: 'Mein Zug hat ausgefallen, und ich möchte eine Entschädigung beantragen.',
              category: 'auxiliary-verb',
              feedback: bi(
                'ausfallen is one of the sein verbs: the train did not do something, it stopped existing as a service. Mein Zug ist ausgefallen.',
                '„ausfallen“ е от глаголите със „sein“: влакът не е извършил нещо, а е престанал да съществува като курс. Mein Zug ist ausgefallen.',
              ),
            },
          ],
          hints: [
            bi('Perfekt with sein, then the request with möchte.', 'Perfekt със „sein“, после молбата с „möchte“.'),
            bi('Mein Zug i__ ausgefallen, und ich möchte …', 'Mein Zug i__ ausgefallen, und ich möchte …'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Dafür füllen Sie bitte das Fahrgastrechte-Formular aus.',
      bi('For that, please fill in the passenger rights form.', 'За целта попълнете формуляра за правата на пътниците.'),
    ),
    you(
      'sc-transport-b1-t2',
      bi('Ask where you get it', 'Попитай откъде да го вземеш'),
      [
        {
          id: 'sc-transport-b1-t2-s1',
          instruction: bi(
            'bekommen is the everyday verb for getting hold of something, and it is not reflexive.',
            '„bekommen“ е всекидневният глагол за сдобиване с нещо и не е възвратен.',
          ),
          prompt: bi('Ask where you can get the form.', 'Попитай откъде можеш да вземеш формуляра.'),
          answer: 'Wo bekomme ich das Formular?',
          alternatives: ['Wo finde ich das Formular?', 'Wo kann ich das Formular bekommen?'],
          shape: 'sentence',
          reviewTargets: ['v-das-formular'],
          hints: [bi('wo + verb + ich + the thing.', '„wo“ + глагол + „ich“ + нещото.')],
        },
      ],
      'b1',
    ),
    them(
      'Hier, oder online. Sie brauchen die Fahrkarte und eine Bestätigung der Verspätung.',
      bi('Here, or online. You need the ticket and confirmation of the delay.', 'Тук или онлайн. Трябват Ви билетът и потвърждение за закъснението.'),
    ),
    you(
      'sc-transport-b1-t3',
      bi('Ask what you are entitled to', 'Попитай какво ти се полага'),
      [
        {
          id: 'sc-transport-b1-t3-s1',
          instruction: bi(
            'ab plus a number means "from that point on" — the threshold at which a rule starts applying.',
            '„ab“ плюс число значи „от този момент нататък“ — прагът, от който започва да важи правилото.',
          ),
          prompt: bi('Ask from how much delay you get money back.', 'Попитай от колко закъснение получаваш пари обратно.'),
          answer: 'Ab wie viel Verspätung bekomme ich Geld zurück?',
          alternatives: [
            'Ab wann bekomme ich Geld zurück?',
            'Wie viel bekomme ich bei zwei Stunden Verspätung zurück?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-verspaetung'],
          hints: [
            bi('Start with ab.', 'Започни с „ab“.'),
            bi('A_ wie viel Verspätung bekomme ich Geld zurück?', 'A_ wie viel Verspätung bekomme ich Geld zurück?'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Ab sechzig Minuten gibt es fünfundzwanzig Prozent, ab hundertzwanzig die Hälfte.',
      bi('From sixty minutes there is twenty-five per cent, from a hundred and twenty, half.', 'От шейсет минути — двайсет и пет процента, от сто и двайсет — половината.'),
    ),
    you(
      'sc-transport-b1-t4',
      bi('Ask how long it takes', 'Попитай колко време отнема'),
      [
        {
          id: 'sc-transport-b1-t4-s1',
          instruction: bi(
            'Bearbeitung is the processing of a claim — the noun every German office uses for "we are dealing with it".',
            '„Bearbeitung“ е обработката на претенцията — съществителното, което всяка немска институция използва за „занимаваме се с това“.',
          ),
          prompt: bi('Ask how long the processing takes.', 'Попитай колко време отнема обработката.'),
          answer: 'Wie lange dauert die Bearbeitung?',
          alternatives: ['Wie lange dauert das?', 'Wann bekomme ich eine Antwort?'],
          shape: 'sentence',
          reviewTargets: ['v-wie-lange'],
          traps: [registerTrap('Wie lange dauert das bei dir?', 'Sie')],
          hints: [bi('dauern is the verb for how long something takes.', '„dauern“ е глаголът за това колко време трае нещо.')],
        },
      ],
      'b1',
    ),
  ],
});

export const TRANSPORT_SCRIPTS: ScenarioScript[] = [A1, A2, B1];
