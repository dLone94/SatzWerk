import { bi } from '../authoring.ts';
import type { ScenarioScript } from '../types.ts';
import { narrator, registerTrap, script, them, you } from './authoring.ts';

/**
 * At the restaurant.
 *
 * Four stages that are four different rooms wearing the same name: a table on
 * the night, a telephone, a complaint made while somebody is still holding
 * your plate, and a bill you have to argue with in writing-grade German.
 */

const A1 = script({
  id: 'sc-restaurant-a1',
  scenarioId: 'sc-restaurant',
  level: 'a1',
  register: 'Sie',
  partner: bi('the waiter', 'сервитьорът'),
  goal: bi('Order a drink and a meal, then get the bill.', 'Поръчай напитка и ядене, после поискай сметката.'),
  lessonIds: ['a1-u3-l1', 'a1-u3-l2'],
  outro: bi(
    'Ordering is four sentences and none of them are hard. The one that catches people out is the last: in Germany the bill comes when you ask for it, and not a minute before.',
    'Поръчването е четири изречения и нито едно не е трудно. Това, което изненадва хората, е последното: в Германия сметката идва, когато я поискаш, и нито минута по-рано.',
  ),
  beats: [
    them('Guten Abend! Haben Sie reserviert?', bi('Good evening! Do you have a reservation?', 'Добър вечер! Имате ли резервация?')),
    you(
      'sc-restaurant-a1-t1',
      bi('Say that you have not booked', 'Кажи, че нямаш резервация'),
      [
        {
          id: 'sc-restaurant-a1-t1-s1',
          instruction: bi(
            'German answers this with the verb, not with a bare no.',
            'Немският отговаря на това с глагола, не само с „не“.',
          ),
          prompt: bi('You have not booked. Say so.', 'Нямаш резервация. Кажи го.'),
          answer: 'Nein, wir haben nicht reserviert.',
          alternatives: ['Nein, leider nicht.', 'Nein, ich habe nicht reserviert.'],
          shape: 'sentence',
          hints: [
            bi('Perfekt: haben + reserviert.', 'Perfekt: haben + reserviert.'),
            bi('Nein, wir haben nicht r__________.', 'Nein, wir haben nicht r__________.'),
          ],
        },
      ],
      'a1',
    ),
    them(
      'Kein Problem. Der Tisch am Fenster ist frei. Was möchten Sie trinken?',
      bi('No problem. The table by the window is free. What would you like to drink?', 'Няма проблем. Масата до прозореца е свободна. Какво бихте искали да пиете?'),
    ),
    you(
      'sc-restaurant-a1-t2',
      bi('Order a glass of water', 'Поръчай чаша вода'),
      [
        {
          id: 'sc-restaurant-a1-t2-s1',
          instruction: bi(
            'A container and what is in it are simply placed side by side in German: ein Glas Wasser. Nothing goes between them — no word for "of".',
            'Съдът и съдържанието му просто стоят едно до друго: ein Glas Wasser. Точно както казваш „чаша вода“, без нищо между двете.',
          ),
          prompt: bi('Ask for a glass of water.', 'Поискай чаша вода.'),
          answer: 'Ein Glas Wasser, bitte.',
          alternatives: ['Ich hätte gern ein Glas Wasser.', 'Ein Wasser, bitte.'],
          shape: 'phrase',
          reviewTargets: ['v-glas', 'v-das-wasser'],
          traps: [
            {
              answer: 'Ein Glas von Wasser, bitte.',
              category: 'preposition',
              feedback: bi(
                'English needs "of" and German needs nothing: ein Glas Wasser, eine Tasse Kaffee, eine Flasche Wein. The two nouns just stand together.',
                'Тук немският работи като българския: „чаша вода“, ein Glas Wasser. Двете съществителни просто стоят едно до друго, без предлог.',
              ),
            },
          ],
          hints: [
            bi('Two nouns, nothing between them.', 'Две съществителни, нищо между тях.'),
            bi('Ein Glas W____, bitte.', 'Ein Glas W____, bitte.'),
          ],
        },
      ],
      'a1',
    ),
    them('Und zu essen?', bi('And to eat?', 'А за ядене?')),
    you(
      'sc-restaurant-a1-t3',
      bi('Order the soup', 'Поръчай супата'),
      [
        {
          id: 'sc-restaurant-a1-t3-s1',
          instruction: bi(
            'A dish you have picked off the menu is a known thing, so it takes the definite article.',
            'Ястие, което си избрал от менюто, е познато нещо, затова е с определителен член.',
          ),
          prompt: bi('You want the soup.', 'Искаш супата.'),
          answer: 'Ich nehme die Suppe.',
          alternatives: ['Ich hätte gern die Suppe.', 'Die Suppe, bitte.'],
          shape: 'sentence',
          reviewTargets: ['v-suppe', 'v-nehmen'],
          hints: [
            bi('"nehmen" is what Germans order with: ich nehme …', 'Германците поръчват с „nehmen“: ich nehme …'),
            bi('Ich n____ die Suppe.', 'Ich n____ die Suppe.'),
          ],
        },
      ],
      'a1',
    ),
    narrator(bi('Forty minutes later. The plates are empty.', 'Четирийсет минути по-късно. Чиниите са празни.')),
    them('Hat es geschmeckt?', bi('Did you enjoy it?', 'Хареса ли Ви?')),
    you(
      'sc-restaurant-a1-t4',
      bi('Say that it was good', 'Кажи, че е било вкусно'),
      [
        {
          id: 'sc-restaurant-a1-t4-s1',
          prompt: bi('It was. Say so and thank him.', 'Беше. Кажи го и благодари.'),
          answer: 'Ja, sehr gut, danke!',
          alternatives: ['Ja, es war sehr lecker, danke!', 'Ja, sehr lecker!'],
          shape: 'phrase',
          reviewTargets: ['v-lecker'],
          hints: [bi('Three words and a thank you.', 'Три думи и едно благодаря.')],
        },
      ],
      'a1',
    ),
    you(
      'sc-restaurant-a1-t5',
      bi('Ask for the bill', 'Поискай сметката'),
      [
        {
          id: 'sc-restaurant-a1-t5-s1',
          instruction: bi(
            'Nobody will bring it unprompted. Sitting and waiting for it is how an evening becomes an hour longer.',
            'Никой няма да я донесе сам. Да седиш и да чакаш е начинът вечерта да стане с час по-дълга.',
          ),
          prompt: bi('Ask him to bring the bill.', 'Помоли го да донесе сметката.'),
          answer: 'Die Rechnung, bitte.',
          alternatives: ['Wir möchten bitte zahlen.', 'Können wir bitte zahlen?', 'Zahlen, bitte.'],
          shape: 'phrase',
          reviewTargets: ['v-rechnung'],
          traps: [registerTrap('Kannst du mir die Rechnung bringen?', 'Sie')],
          hints: [
            bi('Two words are enough.', 'Две думи стигат.'),
            bi('Die R________, bitte.', 'Die R________, bitte.'),
          ],
        },
      ],
      'a1',
    ),
    them('Zusammen oder getrennt?', bi('Together or separately?', 'Заедно или отделно?'), {
      note: bi(
        'You will be asked this every single time, and splitting a bill four ways at the table is completely normal here rather than an imposition.',
        'Ще те питат това всеки път, и да разделиш сметката на четири на масата е напълно нормално тук, не е нахалство.',
      ),
    }),
    you(
      'sc-restaurant-a1-t6',
      bi('Answer', 'Отговори'),
      [
        {
          id: 'sc-restaurant-a1-t6-s1',
          prompt: bi('Pay together.', 'Плащате заедно.'),
          answer: 'Zusammen, bitte.',
          alternatives: ['Zusammen.', 'Alles zusammen, bitte.'],
          shape: 'phrase',
          reviewTargets: ['v-zusammen-getrennt'],
          hints: [bi('One of the two words he just said.', 'Една от двете думи, които той току-що каза.')],
        },
      ],
      'a1',
    ),
  ],
});

const A2 = script({
  id: 'sc-restaurant-a2',
  scenarioId: 'sc-restaurant',
  level: 'a2',
  register: 'Sie',
  partner: bi('the voice on the phone', 'гласът по телефона'),
  goal: bi('Book a table for four on Saturday evening.', 'Резервирай маса за четирима в събота вечер.'),
  outro: bi(
    'A phone call is the hardest thing at this level, because there is no face to read and no menu to point at. You just did one, including the part where the answer was no.',
    'Телефонният разговор е най-трудното на това ниво, защото няма лице, което да четеш, нито меню, което да посочиш. Току-що направи един, включително частта, в която отговорът беше „не“.',
  ),
  beats: [
    narrator(
      bi(
        'It rings twice. There is no picture, no menu, and no time to think.',
        'Звъни два пъти. Няма картина, няма меню и няма време за мислене.',
      ),
    ),
    them('Restaurant Adler, guten Tag!', bi('Restaurant Adler, hello!', 'Ресторант „Адлер“, добър ден!')),
    you(
      'sc-restaurant-a2-t1',
      bi('Say why you are calling', 'Кажи защо се обаждаш'),
      [
        {
          id: 'sc-restaurant-a2-t1-s1',
          instruction: bi(
            'Greet first, then say what you want in one sentence. On the phone, the greeting buys you the half second you need.',
            'Първо поздрави, после кажи какво искаш в едно изречение. По телефона поздравът ти купува половината секунда, която ти трябва.',
          ),
          prompt: bi('You want to reserve a table.', 'Искаш да резервираш маса.'),
          answer: 'Guten Tag, ich möchte einen Tisch reservieren.',
          alternatives: [
            'Guten Tag, ich würde gern einen Tisch reservieren.',
            'Guten Tag, ich hätte gern einen Tisch.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-guten-tag', 'v-der-tisch'],
          traps: [
            {
              answer: 'Guten Tag, ich möchte ein Tisch reservieren.',
              category: 'case',
              feedback: bi(
                'der Tisch is masculine, and it is what you want, so the article goes accusative: einen Tisch.',
                '„der Tisch“ е от мъжки род и е това, което искаш, затова членът е във винителен падеж: einen Tisch.',
              ),
            },
          ],
          hints: [
            bi('möchten sends its second verb to the end.', '„möchten“ изпраща втория глагол накрая.'),
            bi('… ich möchte ein__ Tisch r_________.', '… ich möchte ein__ Tisch r_________.'),
          ],
        },
      ],
      'a2',
    ),
    them('Gerne. Für wann und für wie viele Personen?', bi('Of course. For when, and for how many people?', 'С удоволствие. За кога и за колко души?')),
    you(
      'sc-restaurant-a2-t2',
      bi('Give the day, the time and the number', 'Кажи деня, часа и броя'),
      [
        {
          id: 'sc-restaurant-a2-t2-s1',
          instruction: bi(
            'A clock time takes um, a weekday takes am, and a number of people takes für.',
            'Часът иска „um“, денят от седмицата иска „am“, а броят хора иска „für“.',
          ),
          prompt: bi('Saturday, eight in the evening, four people.', 'Събота, осем вечерта, четирима души.'),
          answer: 'Am Samstag um acht Uhr, für vier Personen.',
          alternatives: [
            'Für Samstag um acht Uhr, für vier Personen.',
            'Samstag um acht, vier Personen.',
            'Am Samstag um 8 Uhr, für vier Personen.',
            'Am Samstag um 20 Uhr, für vier Personen.',
            'Am Samstag um 20 Uhr, für 4 Personen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-samstag', 'v-um', 'v-person'],
          hints: [
            bi('Day first, then the clock, then the people.', 'Първо денят, после часът, после хората.'),
            bi('A_ Samstag u_ acht Uhr, f__ vier Personen.', 'A_ Samstag u_ acht Uhr, f__ vier Personen.'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Um acht ist leider alles voll. Um halb sieben oder um neun hätten wir noch etwas.',
      bi('Eight is fully booked, I am afraid. At half past six or at nine we would still have something.', 'В осем за съжаление е пълно. В шест и половина или в девет бихме имали още нещо.'),
      {
        note: bi(
          '"halb sieben" is half past six, not half past seven: German counts towards the coming hour, not back from the last one.',
          '„halb sieben“ е шест и половина, не седем и половина: немският брои към идващия час, не назад от изминалия.',
        ),
      },
    ),
    you(
      'sc-restaurant-a2-t3',
      bi('Take the later one', 'Вземи по-късния час'),
      [
        {
          id: 'sc-restaurant-a2-t3-s1',
          instruction: bi(
            'Starting with dann puts the verb straight after it, and the subject behind that.',
            'Започването с „dann“ поставя глагола веднага след него, а подлога — след глагола.',
          ),
          prompt: bi('Nine o’clock works.', 'Девет часа става.'),
          answer: 'Dann nehmen wir neun Uhr.',
          alternatives: [
            'Dann kommen wir um neun.',
            'Um neun, bitte.',
            'Dann nehmen wir 9 Uhr.',
            'Dann nehmen wir 21 Uhr.',
            'Dann kommen wir um 9.',
          ],
          shape: 'sentence',
          traps: [
            {
              answer: 'Dann wir nehmen neun Uhr.',
              category: 'word-order',
              feedback: bi(
                'Second place belongs to the verb. Dann took first, so nehmen comes next and wir goes behind it.',
                'Второто място е на глагола. „Dann“ зае първото, значи следва „nehmen“, а „wir“ минава след него.',
              ),
            },
          ],
          hints: [bi('Dann ______ wir neun Uhr.', 'Dann ______ wir neun Uhr.')],
        },
      ],
      'a2',
    ),
    them('Auf welchen Namen?', bi('Under what name?', 'На чие име?')),
    you(
      'sc-restaurant-a2-t4',
      bi('Give the name', 'Кажи името'),
      [
        {
          id: 'sc-restaurant-a2-t4-s1',
          instruction: bi(
            'He asked with auf + accusative, so the answer keeps it: auf den Namen …',
            'Той пита с „auf“ + винителен падеж, затова отговорът го запазва: auf den Namen …',
          ),
          prompt: bi('The booking is under Petrow.', 'Резервацията е на името Петров.'),
          answer: 'Auf den Namen Petrow.',
          alternatives: ['Petrow.', 'Der Name ist Petrow.'],
          shape: 'phrase',
          reviewTargets: ['v-der-name'],
          hints: [
            bi('Answer in the same shape as the question.', 'Отговори в същата форма, в която е въпросът.'),
            bi('Auf d__ Namen Petrow.', 'Auf d__ Namen Petrow.'),
          ],
        },
      ],
      'a2',
    ),
    them('Alles klar. Bis Samstag!', bi('All set. See you Saturday!', 'Готово. До събота!')),
    you(
      'sc-restaurant-a2-t5',
      bi('Close the call', 'Затвори разговора'),
      [
        {
          id: 'sc-restaurant-a2-t5-s1',
          prompt: bi('Thank him and say the same back.', 'Благодари му и повтори същото.'),
          answer: 'Vielen Dank, bis Samstag!',
          alternatives: ['Danke schön, bis Samstag!', 'Vielen Dank, auf Wiederhören!'],
          shape: 'phrase',
          hints: [
            bi('On the phone, the goodbye is Wiederhören rather than Wiedersehen — you hear each other, you do not see.', 'По телефона сбогуването е „Wiederhören“, не „Wiedersehen“ — чувате се, не се виждате.'),
          ],
        },
      ],
      'a2',
    ),
  ],
});

const B1 = script({
  id: 'sc-restaurant-b1',
  scenarioId: 'sc-restaurant',
  level: 'b1',
  register: 'Sie',
  partner: bi('the waiter', 'сервитьорът'),
  goal: bi('The soup is cold. Say so without spoiling the evening.', 'Супата е студена. Кажи го, без да разваляш вечерта.'),
  outro: bi(
    'The whole complaint fits in one sentence with leider in it. What made it work was that you said it at once, to the person in front of you, instead of at the end to nobody.',
    'Цялото оплакване се побира в едно изречение с „leider“. Проработи, защото го каза веднага, на човека пред теб, вместо накрая и на никого.',
  ),
  beats: [
    narrator(
      bi(
        'The soup arrived lukewarm. The waiter is passing your table now — this is the moment, not twenty minutes from now.',
        'Супата дойде хладка. Сервитьорът минава покрай масата ти точно сега — това е моментът, не след двайсет минути.',
      ),
    ),
    them('Ist alles in Ordnung?', bi('Is everything all right?', 'Всичко наред ли е?')),
    you(
      'sc-restaurant-b1-t1',
      bi('Say what is wrong', 'Кажи какво не е наред'),
      [
        {
          id: 'sc-restaurant-b1-t1-s1',
          instruction: bi(
            'leider is the whole trick. It turns a complaint into a shared misfortune, and it costs one word.',
            '„leider“ е целият трик. Превръща оплакването в обща беда и струва една дума.',
          ),
          prompt: bi('The soup is cold.', 'Супата е студена.'),
          answer: 'Entschuldigung, die Suppe ist leider kalt.',
          alternatives: [
            'Die Suppe ist leider kalt.',
            'Entschuldigung, die Suppe ist leider nicht warm.',
            'Die Suppe ist leider nicht warm.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-suppe', 'v-kalt'],
          traps: [
            {
              answer: 'Die Suppe ist kalt!',
              category: 'vocabulary',
              feedback: bi(
                'True, and it lands like an accusation. One leider makes the same sentence something he can fix rather than something he has to defend.',
                'Вярно е — и звучи като обвинение. Едно „leider“ превръща същото изречение в нещо, което той може да оправи, вместо в нещо, от което трябва да се защитава.',
              ),
            },
          ],
          hints: [
            bi('Apologise first, then the fact, with leider in the middle.', 'Първо извинение, после фактът, а „leider“ по средата.'),
            bi('Entschuldigung, die Suppe ist l_____ kalt.', 'Entschuldigung, die Suppe ist l_____ kalt.'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Oh, das tut mir leid! Soll ich sie in die Küche zurückbringen?',
      bi('Oh, I am sorry! Shall I take it back to the kitchen?', 'О, съжалявам! Да я върна ли в кухнята?'),
    ),
    you(
      'sc-restaurant-b1-t2',
      bi('Ask for a fresh one', 'Помоли за нова'),
      [
        {
          id: 'sc-restaurant-b1-t2-s1',
          instruction: bi(
            'Könnten Sie is the Konjunktiv II of können, and it is the most useful politeness in German: it turns an order into a question.',
            '„Könnten Sie“ е Konjunktiv II на „können“ и е най-полезната учтивост в немския: превръща заповедта във въпрос.',
          ),
          prompt: bi('You would rather have a fresh one than the same one reheated.', 'Предпочиташ нова пред същата, претоплена.'),
          answer: 'Könnten Sie mir bitte eine neue bringen?',
          alternatives: [
            'Könnten Sie mir bitte eine frische bringen?',
            'Ja, gern. Könnten Sie mir eine neue bringen?',
          ],
          shape: 'sentence',
          traps: [registerTrap('Kannst du mir bitte eine neue bringen?', 'Sie')],
          hints: [
            bi('Start with the Konjunktiv II form of können.', 'Започни с формата в Konjunktiv II на „können“.'),
            bi('K_______ Sie mir bitte eine neue bringen?', 'K_______ Sie mir bitte eine neue bringen?'),
          ],
        },
      ],
      'b1',
    ),
    them('Selbstverständlich. Es dauert ein paar Minuten.', bi('Of course. It will take a few minutes.', 'Разбира се. Ще отнеме няколко минути.')),
    you(
      'sc-restaurant-b1-t3',
      bi('Tell him it is fine', 'Кажи му, че няма проблем'),
      [
        {
          id: 'sc-restaurant-b1-t3-s1',
          prompt: bi('You are not in a hurry.', 'Не бързаш.'),
          answer: 'Kein Problem, wir haben Zeit.',
          alternatives: ['Das macht nichts, wir haben Zeit.', 'Kein Problem, danke.'],
          shape: 'sentence',
          reviewTargets: ['v-das-problem', 'v-zeit'],
          hints: [bi('"We have time" is the German way of saying it.', '„Имаме време“ е немският начин да го кажеш.')],
        },
      ],
      'b1',
    ),
    narrator(bi('The new soup arrives steaming.', 'Новата супа пристига димяща.')),
    them('Die Suppe geht selbstverständlich aufs Haus.', bi('The soup is on the house, of course.', 'Супата естествено е от заведението.'), {
      note: bi(
        '"aufs Haus" is "on the house" almost word for word — one of the rare idioms that transfers straight across.',
        '„aufs Haus“ значи „от заведението“. Фразата е буквално „за сметка на къщата“ — картинка, която българският не използва.',
      ),
    }),
    you(
      'sc-restaurant-b1-t4',
      bi('Accept it graciously', 'Приеми любезно'),
      [
        {
          id: 'sc-restaurant-b1-t4-s1',
          prompt: bi('Say that is kind of him.', 'Кажи, че е много любезно от негова страна.'),
          answer: 'Das ist sehr freundlich, vielen Dank!',
          alternatives: ['Das ist sehr nett, vielen Dank!', 'Oh, vielen Dank!', 'Vielen Dank!'],
          shape: 'sentence',
          reviewTargets: ['v-freundlich'],
          hints: [bi('"That is very kind" — then thank him.', '„Това е много любезно“ — и после благодари.')],
        },
      ],
      'b1',
    ),
  ],
});

const B2 = script({
  id: 'sc-restaurant-b2',
  scenarioId: 'sc-restaurant',
  level: 'b2',
  register: 'Sie',
  partner: bi('the manager', 'управителят'),
  goal: bi(
    'The bill is wrong, and you need a receipt made out to your company.',
    'Сметката е грешна, а ти трябва фактура на фирмата.',
  ),
  outro: bi(
    'Two different registers in one conversation: the correction, which has to be precise without being hostile, and the request, which is the language a company expects on a piece of paper.',
    'Два различни регистъра в един разговор: поправката, която трябва да е точна, без да е враждебна, и молбата, която е езикът, очакван от фирма върху лист хартия.',
  ),
  beats: [
    narrator(
      bi(
        'The bill lists two bottles of wine. You had one. You are also here on the company card, which means the paperwork has to be right.',
        'Сметката изброява две бутилки вино. Вие имахте една. Освен това си тук с фирмената карта, което значи, че документът трябва да е верен.',
      ),
    ),
    them('So, hat alles gepasst?', bi('So, was everything all right?', 'Е, всичко наред ли беше?')),
    you(
      'sc-restaurant-b2-t1',
      bi('Point out the error without accusing anyone', 'Посочи грешката, без да обвиняваш никого'),
      [
        {
          id: 'sc-restaurant-b2-t1-s1',
          instruction: bi(
            'What is written on a document "steht" there — the verb is stehen, not sein, and the bill becomes the subject rather than a person.',
            'Написаното в документ „stehen“ там — глаголът е „stehen“, не „sein“, и подлогът става сметката, а не човек.',
          ),
          prompt: bi('Two bottles are on the bill; you had one.', 'В сметката има две бутилки; вие имахте една.'),
          answer: 'Auf der Rechnung stehen zwei Flaschen Wein, wir hatten aber nur eine.',
          alternatives: [
            'Auf der Rechnung stehen zwei Flaschen Wein, wir hatten allerdings nur eine.',
            'Hier stehen zwei Flaschen Wein, wir hatten aber nur eine.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-rechnung', 'v-flasche', 'v-stehen'],
          traps: [
            {
              answer: 'Auf die Rechnung stehen zwei Flaschen Wein, wir hatten aber nur eine.',
              category: 'case',
              feedback: bi(
                'Nothing is moving onto the bill; the wine is already printed there. Location, so dative: auf der Rechnung.',
                'Нищо не се движи към сметката; виното вече е отпечатано там. Място, значи дателен падеж: auf der Rechnung.',
              ),
            },
          ],
          hints: [
            bi('Start with the bill, not with yourself.', 'Започни със сметката, не със себе си.'),
            bi('Auf d__ Rechnung s______ zwei Flaschen Wein …', 'Auf d__ Rechnung s______ zwei Flaschen Wein …'),
          ],
        },
      ],
      'b2',
    ),
    them(
      'Einen Moment, ich schaue nach. — Sie haben recht, das war der Nachbartisch. Ich korrigiere das sofort.',
      bi('One moment, I will check. — You are right, that was the next table. I will correct it right away.', 'Момент, ще проверя. — Прав сте, това беше съседната маса. Поправям го веднага.'),
    ),
    you(
      'sc-restaurant-b2-t2',
      bi('Ask for an invoice made out to the company', 'Поискай фактура на фирмата'),
      [
        {
          id: 'sc-restaurant-b2-t2-s1',
          instruction: bi(
            'Issuing a document is ausstellen — a fixed pairing, like "to issue an invoice". Nothing else fits here.',
            'Издаването на документ е „ausstellen“ — устойчиво съчетание, точно като „издавам фактура“. Нищо друго не пасва тук.',
          ),
          prompt: bi('You need it in the company name.', 'Трябва ти на името на фирмата.'),
          answer: 'Könnten Sie mir bitte eine Rechnung auf die Firma ausstellen?',
          alternatives: [
            'Könnten Sie die Rechnung bitte auf die Firma ausstellen?',
            'Ich bräuchte bitte eine Rechnung auf die Firma.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-firma', 'v-rechnung'],
          traps: [
            {
              answer: 'Könnten Sie mir bitte eine Rechnung auf die Firma machen?',
              category: 'vocabulary',
              feedback: bi(
                'machen is understood everywhere and belongs nowhere official. A document is ausgestellt, and using the right verb is half of sounding like someone who has done this before.',
                '„machen“ се разбира навсякъде и не е на място в нищо официално. Документът се „ausgestellt“, а правилният глагол е половината от това да звучиш като човек, който вече го е правил.',
              ),
            },
          ],
          hints: [
            bi('The verb goes to the end, and it is not machen.', 'Глаголът отива накрая и не е „machen“.'),
            bi('… eine Rechnung auf die Firma a________?', '… eine Rechnung auf die Firma a________?'),
          ],
        },
      ],
      'b2',
    ),
    them(
      'Natürlich. Brauchen Sie die Anschrift der Firma mit auf der Rechnung?',
      bi('Of course. Do you need the company address on the invoice as well?', 'Разбира се. Трябва ли и адресът на фирмата да е върху фактурата?'),
    ),
    you(
      'sc-restaurant-b2-t3',
      bi('Say yes and offer the details', 'Кажи да и предложи данните'),
      [
        {
          id: 'sc-restaurant-b2-t3-s1',
          instruction: bi(
            'Writing something down for somebody is aufschreiben, and the prefix goes to the end.',
            'Да запишеш нещо за някого е „aufschreiben“, а представката отива накрая.',
          ),
          prompt: bi('Yes — and you will write the address down for him.', 'Да — и ще му запишеш адреса.'),
          answer: 'Ja, bitte. Ich schreibe Ihnen die Anschrift auf.',
          alternatives: [
            'Ja, bitte. Ich schreibe Ihnen die Adresse auf.',
            'Ja, gern. Ich gebe Ihnen die Anschrift.',
          ],
          shape: 'sentence',
          hints: [
            bi('Separable verb: the auf lands at the end.', 'Делим глагол: „auf“ се озовава накрая.'),
            bi('Ich schreibe Ihnen die Anschrift a__.', 'Ich schreibe Ihnen die Anschrift a__.'),
          ],
        },
      ],
      'b2',
    ),
    them('Alles korrigiert. Bitte schön.', bi('All corrected. Here you are.', 'Всичко е поправено. Заповядайте.')),
    you(
      'sc-restaurant-b2-t4',
      bi('Thank him for the trouble', 'Благодари за усилието'),
      [
        {
          id: 'sc-restaurant-b2-t4-s1',
          instruction: bi(
            'Mühe is effort somebody went to on your behalf. Thanking for it is the standard close after somebody has fixed something.',
            '„Mühe“ е усилието, което някой е положил заради теб. Благодарността за него е стандартният завършек, след като някой е оправил нещо.',
          ),
          prompt: bi('Close it properly.', 'Затвори разговора както трябва.'),
          answer: 'Vielen Dank für Ihre Mühe!',
          alternatives: ['Herzlichen Dank für Ihre Mühe!', 'Vielen Dank, das ist sehr freundlich!'],
          shape: 'phrase',
          hints: [bi('für + possessive + Mühe.', '„für“ + притежателно + „Mühe“.')],
        },
      ],
      'b2',
    ),
  ],
});

export const RESTAURANT_SCRIPTS: ScenarioScript[] = [A1, A2, B1, B2];
