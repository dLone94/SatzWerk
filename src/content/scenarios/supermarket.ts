import { bi } from '../authoring.ts';
import type { ScenarioScript } from '../types.ts';
import { narrator, registerTrap, script, them, you } from './authoring.ts';

/**
 * At the supermarket.
 *
 * The German checkout is faster than almost anywhere else and it asks two
 * questions nobody warns you about. The middle stage is about Pfand, which has
 * no equivalent worth calling one in either teaching language.
 */

const A1 = script({
  id: 'sc-supermarket-a1',
  scenarioId: 'sc-supermarket',
  level: 'a1',
  register: 'Sie',
  partner: bi('the cashier', 'касиерката'),
  goal: bi('Get through a German checkout without holding up the queue.', 'Мини през немска каса, без да бавиш опашката.'),
  outro: bi(
    'Four short answers and you are out. The speed is not rudeness — the belt keeps moving and everybody, including the person behind you, expects it to.',
    'Четири кратки отговора и си навън. Бързината не е грубост — лентата върви и всички, включително човекът зад теб, очакват това.',
  ),
  beats: [
    narrator(
      bi(
        'Your things are on the belt. The scanner starts before you have finished unloading.',
        'Нещата ти са на лентата. Скенерът тръгва, преди да си свършил с изваждането.',
      ),
    ),
    them('Brauchen Sie eine Tüte?', bi('Do you need a bag?', 'Трябва ли Ви торбичка?'), {
      note: bi(
        'It is not a courtesy, it is an offer to sell you one. Most people bring their own and say no without looking up.',
        'Това не е любезност, а предложение да ти продадат торбичка. Повечето хора носят своя и казват „не“, без да вдигнат поглед.',
      ),
    }),
    you(
      'sc-supermarket-a1-t1',
      bi('Decline', 'Откажи'),
      [
        {
          id: 'sc-supermarket-a1-t1-s1',
          instruction: bi(
            'In German, no plus thank you is one fixed pair and it is not rude.',
            'На немски „не“ плюс „благодаря“ е устойчива двойка и не е грубо.',
          ),
          prompt: bi('You brought your own bag.', 'Носиш си своя торба.'),
          answer: 'Nein, danke.',
          alternatives: ['Nein danke, ich habe eine.', 'Danke, nicht nötig.'],
          shape: 'phrase',
          reviewTargets: ['v-nein', 'v-danke'],
          hints: [bi('Two words.', 'Две думи.')],
        },
      ],
      'a1',
    ),
    them('Haben Sie es klein?', bi('Do you have it in change?', 'Имате ли дребни?'), {
      note: bi(
        'Literally "do you have it small". It means exact change, and it is asked constantly.',
        'Буквално „имате ли го дребно“. Значи точна сума и се пита постоянно.',
      ),
    }),
    you(
      'sc-supermarket-a1-t2',
      bi('Say you do not', 'Кажи, че нямаш'),
      [
        {
          id: 'sc-supermarket-a1-t2-s1',
          prompt: bi('You only have a note. Apologise.', 'Имаш само банкнота. Извини се.'),
          answer: 'Nein, tut mir leid.',
          alternatives: ['Leider nicht.', 'Nein, leider nicht.'],
          shape: 'phrase',
          hints: [
            bi('"tut mir leid" is the everyday apology, shorter than Entschuldigung.', '„tut mir leid“ е всекидневното извинение, по-късо от „Entschuldigung“.'),
          ],
        },
      ],
      'a1',
    ),
    them('Zwölf Euro dreiundvierzig.', bi('Twelve euros forty-three.', 'Дванайсет евро и четирийсет и три.')),
    you(
      'sc-supermarket-a1-t3',
      bi('Say how you are paying', 'Кажи как ще платиш'),
      [
        {
          id: 'sc-supermarket-a1-t3-s1',
          instruction: bi(
            'mit takes the dative, but Karte here is used without an article at all — a fixed phrase, like "by card".',
            '„mit“ иска дателен падеж, но тук „Karte“ е без никакъв член — устойчива фраза, както „с карта“.',
          ),
          prompt: bi('You are paying by card.', 'Плащаш с карта.'),
          answer: 'Ich zahle mit Karte.',
          alternatives: ['Mit Karte, bitte.', 'Ich bezahle mit Karte.'],
          shape: 'sentence',
          reviewTargets: ['v-bezahlen'],
          hints: [bi('Three words after "ich".', 'Три думи след „ich“.')],
        },
      ],
      'a1',
    ),
    them('Hat geklappt. Den Bon?', bi('That worked. Receipt?', 'Мина. Бележката?')),
    you(
      'sc-supermarket-a1-t4',
      bi('Answer and leave', 'Отговори и си тръгни'),
      [
        {
          id: 'sc-supermarket-a1-t4-s1',
          prompt: bi('Yes, take the receipt, and wish her a good day.', 'Да, вземи бележката и ѝ пожелай приятен ден.'),
          answer: 'Ja, bitte. Danke, schönen Tag!',
          alternatives: ['Ja, gern. Danke, schönen Tag!', 'Ja, bitte. Vielen Dank!'],
          shape: 'sentence',
          traps: [registerTrap('Ja, bitte. Danke, schönen Tag dir!', 'Sie')],
          hints: [bi('Yes please, thank you, nice day.', 'Да, моля; благодаря; приятен ден.')],
        },
      ],
      'a1',
    ),
  ],
});

const A2 = script({
  id: 'sc-supermarket-a2',
  scenarioId: 'sc-supermarket',
  level: 'a2',
  register: 'Sie',
  partner: bi('a shop assistant', 'служител в магазина'),
  goal: bi('Find the milk, and work out what to do with the empty bottles.', 'Намери млякото и разбери какво да правиш с празните бутилки.'),
  outro: bi(
    'Pfand is the piece of daily German life that no course mentions and everybody meets in week one. Now you can both ask about it and act on the answer.',
    'Pfand е частта от ежедневния немски живот, която никой курс не споменава и която всеки среща през първата седмица. Сега можеш и да питаш за нея, и да действаш според отговора.',
  ),
  beats: [
    them('Kann ich Ihnen helfen?', bi('Can I help you?', 'Мога ли да Ви помогна?')),
    you(
      'sc-supermarket-a2-t1',
      bi('Ask where the milk is', 'Попитай къде е млякото'),
      [
        {
          id: 'sc-supermarket-a2-t1-s1',
          instruction: bi(
            'German asks this with finden — where do I find it — rather than with "to be".',
            'Немският пита това с „finden“ — къде го намирам — а не с глагола „съм“.',
          ),
          prompt: bi('You cannot find the milk.', 'Не намираш млякото.'),
          answer: 'Entschuldigung, wo finde ich die Milch?',
          alternatives: ['Wo finde ich die Milch?', 'Entschuldigung, wo ist die Milch?', 'Wo ist die Milch?'],
          shape: 'sentence',
          reviewTargets: ['v-milch', 'v-finden'],
          hints: [
            bi('wo + verb + ich + the thing.', '„wo“ + глагол + „ich“ + нещото.'),
            bi('Entschuldigung, wo f____ ich die Milch?', 'Entschuldigung, wo f____ ich die Milch?'),
          ],
        },
      ],
      'a2',
    ),
    them('Gang drei, bei den Kühlregalen.', bi('Aisle three, by the chilled shelves.', 'Трета пътека, при хладилните рафтове.')),
    narrator(
      bi(
        'You are also carrying a bag of empty bottles you have been tripping over for a week.',
        'Носиш и торба с празни бутилки, в която се спъваш вече седмица.',
      ),
    ),
    you(
      'sc-supermarket-a2-t2',
      bi('Ask whether the bottles are worth anything', 'Попитай дали бутилките струват нещо'),
      [
        {
          id: 'sc-supermarket-a2-t2-s1',
          instruction: bi(
            'Pfand is money you already paid on the bottle and get back when you return it. There is no English word for it, so the German one is the word to learn.',
            'Pfand е депозитът, който вече си платил за бутилката и си го връщаш, когато я върнеш. Българското „депозит“ е най-близкото, но в Германия това се прави при всяка бутилка, всеки ден.',
          ),
          prompt: bi('Ask whether you get a deposit back for these bottles.', 'Попитай дали получаваш депозит за тези бутилки.'),
          answer: 'Bekomme ich für diese Flaschen Pfand?',
          // "Pfand zurückbekommen" is ordinary German, and the prompt itself
          // says "back"; it used to be a trap that called zurück an extra word.
          alternatives: [
            'Gibt es für diese Flaschen Pfand?',
            'Kann ich diese Flaschen zurückgeben?',
            'Bekomme ich für diese Flaschen Pfand zurück?',
            'Bekomme ich für diese Flaschen das Pfand zurück?',
            'Bekomme ich das Pfand zurück?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-flasche'],
          hints: [
            bi('Verb first: this is a yes/no question.', 'Първо глаголът: това е въпрос с „да/не“.'),
            bi('B_______ ich für diese Flaschen Pfand?', 'B_______ ich für diese Flaschen Pfand?'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Ja, der Automat ist am Eingang, links neben der Tür.',
      bi('Yes, the machine is at the entrance, left of the door.', 'Да, автоматът е на входа, вляво от вратата.'),
    ),
    you(
      'sc-supermarket-a2-t3',
      bi('Ask what to do with the slip', 'Попитай какво да правиш с бележката'),
      [
        {
          id: 'sc-supermarket-a2-t3-s1',
          instruction: bi(
            'The machine prints a slip; the slip is what the money actually lives on.',
            'Автоматът разпечатва бележка; парите всъщност са в нея.',
          ),
          prompt: bi('Ask what you do with the slip afterwards.', 'Попитай какво правиш с бележката после.'),
          answer: 'Und was mache ich dann mit dem Bon?',
          alternatives: ['Was mache ich mit dem Bon?', 'Und der Bon? Was mache ich damit?'],
          shape: 'sentence',
          traps: [
            {
              answer: 'Und was mache ich dann mit den Bon?',
              category: 'case',
              feedback: bi(
                'mit always takes the dative, whatever is happening: mit dem Bon.',
                '„mit“ винаги иска дателен падеж, каквото и да става: mit dem Bon.',
              ),
            },
          ],
          hints: [
            bi('mit + dative, every time.', '„mit“ + дателен падеж, всеки път.'),
            bi('… mit d__ Bon?', '… mit d__ Bon?'),
          ],
        },
      ],
      'a2',
    ),
    them('Den geben Sie einfach an der Kasse ab.', bi('You just hand that in at the till.', 'Просто я предавате на касата.')),
    you(
      'sc-supermarket-a2-t4',
      bi('Thank them', 'Благодари'),
      [
        {
          id: 'sc-supermarket-a2-t4-s1',
          prompt: bi('Say that helped.', 'Кажи, че това е помогнало.'),
          answer: 'Alles klar, vielen Dank!',
          alternatives: ['Super, vielen Dank!', 'Danke, das hilft mir!', 'Vielen Dank!'],
          shape: 'phrase',
          reviewTargets: ['v-helfen'],
          hints: [bi('"Alles klar" is the everyday "got it".', '„Alles klar“ е всекидневното „ясно“.')],
        },
      ],
      'a2',
    ),
  ],
});

const B1 = script({
  id: 'sc-supermarket-b1',
  scenarioId: 'sc-supermarket',
  level: 'b1',
  register: 'Sie',
  partner: bi('the service desk', 'информацията'),
  goal: bi('Return a toaster that stopped working after a week.', 'Върни тостер, който е спрял да работи след седмица.'),
  outro: bi(
    'A return is a small negotiation: what is wrong, what proof you have, and what you want instead. Saying all three without being asked is what makes it take two minutes rather than ten.',
    'Връщането е малко договаряне: какво е повредено, какво доказателство имаш и какво искаш вместо това. Да кажеш и трите, без да те питат, е причината да отнеме две минути, а не десет.',
  ),
  beats: [
    narrator(
      bi(
        'The toaster worked for six days. You have the box, the receipt and no patience.',
        'Тостерът работи шест дни. Имаш кутията, бележката и никакво търпение.',
      ),
    ),
    them('Guten Tag, was kann ich für Sie tun?', bi('Hello, what can I do for you?', 'Добър ден, какво мога да направя за Вас?')),
    you(
      'sc-supermarket-b1-t1',
      bi('Say what you want and why', 'Кажи какво искаш и защо'),
      [
        {
          id: 'sc-supermarket-b1-t1-s1',
          instruction: bi(
            'Two clauses: the request, then the reason. Putting the reason second stops it sounding like a story.',
            'Две части: молбата, после причината. Причината на второ място спира разказа да звучи като оплакване.',
          ),
          prompt: bi('You want to return the toaster — it does not work.', 'Искаш да върнеш тостера — не работи.'),
          answer: 'Ich möchte diesen Toaster zurückgeben, er funktioniert nicht mehr.',
          alternatives: [
            'Ich möchte diesen Toaster zurückgeben. Er funktioniert nicht.',
            'Ich würde diesen Toaster gern zurückgeben, er funktioniert nicht mehr.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-funktionieren', 'v-kaputt'],
          hints: [
            bi('zurückgeben is separable, but after möchte it stays whole at the end.', '„zurückgeben“ е делим, но след „möchte“ остава цял накрая.'),
            bi('Ich möchte diesen Toaster z__________, er …', 'Ich möchte diesen Toaster z__________, er …'),
          ],
        },
      ],
      'b1',
    ),
    them('Haben Sie den Kassenbon dabei?', bi('Do you have the receipt with you?', 'Носите ли касовата бележка?')),
    you(
      'sc-supermarket-b1-t2',
      bi('Produce it', 'Покажи я'),
      [
        {
          id: 'sc-supermarket-b1-t2-s1',
          instruction: bi(
            'Answering a dabei question with hier is what a German speaker does: the receipt is already in your hand.',
            'Отговорът на въпрос с „dabei“ с „hier“ е това, което би направил немски говорещ: бележката вече е в ръката ти.',
          ),
          prompt: bi('Yes, and the box too.', 'Да, и кутията също.'),
          answer: 'Ja, hier ist der Bon, und die Verpackung habe ich auch dabei.',
          alternatives: [
            'Ja, hier ist der Kassenbon, die Verpackung habe ich auch dabei.',
            'Ja, hier. Die Verpackung habe ich auch.',
          ],
          shape: 'sentence',
          hints: [
            bi('Second clause starts with the box, so the verb follows it.', 'Втората част започва с кутията, значи глаголът следва нея.'),
            bi('…, und die Verpackung h___ ich auch dabei.', '…, und die Verpackung h___ ich auch dabei.'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Möchten Sie ein neues Gerät oder das Geld zurück?',
      bi('Would you like a new device or your money back?', 'Искате ли нов уред или парите обратно?'),
    ),
    you(
      'sc-supermarket-b1-t3',
      bi('Choose the money', 'Избери парите'),
      [
        {
          id: 'sc-supermarket-b1-t3-s1',
          instruction: bi(
            'lieber is the comparative of gern: not "I want", but "I would rather" — a preference, which is softer than a demand.',
            '„lieber“ е сравнителната степен на „gern“: не „искам“, а „предпочитам“ — предпочитание, което е по-меко от искане.',
          ),
          prompt: bi('You would rather have the money back.', 'Предпочиташ парите обратно.'),
          answer: 'Ich hätte lieber das Geld zurück.',
          alternatives: ['Lieber das Geld zurück, bitte.', 'Ich möchte lieber das Geld zurück.'],
          shape: 'sentence',
          reviewTargets: ['v-das-geld'],
          traps: [
            {
              answer: 'Ich will das Geld zurück.',
              category: 'vocabulary',
              feedback: bi(
                'You are entitled to it, and "Ich will" still turns a routine return into a confrontation. "Ich hätte lieber" asks for exactly the same thing.',
                'Имаш право на тях — и „Ich will“ пак превръща рутинното връщане в сблъсък. „Ich hätte lieber“ иска точно същото.',
              ),
            },
          ],
          hints: [
            bi('Konjunktiv II of haben, then lieber.', 'Konjunktiv II на „haben“, после „lieber“.'),
            bi('Ich h____ l_____ das Geld zurück.', 'Ich h____ l_____ das Geld zurück.'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'In Ordnung. Ich brauche nur noch Ihre Unterschrift.',
      bi('All right. I just need your signature.', 'Добре. Трябва ми само подписът Ви.'),
    ),
    you(
      'sc-supermarket-b1-t4',
      bi('Ask where to sign', 'Попитай къде да подпишеш'),
      [
        {
          id: 'sc-supermarket-b1-t4-s1',
          instruction: bi(
            'müssen sends its partner verb to the end, even in a question.',
            '„müssen“ изпраща своя глагол накрая, дори във въпрос.',
          ),
          prompt: bi('Ask where you have to sign.', 'Попитай къде трябва да подпишеш.'),
          answer: 'Wo muss ich unterschreiben?',
          alternatives: ['Wo soll ich unterschreiben?', 'Wo unterschreibe ich?'],
          shape: 'sentence',
          reviewTargets: ['v-unterschreiben'],
          hints: [bi('wo + modal + ich + the verb at the end.', '„wo“ + модален глагол + „ich“ + глаголът накрая.')],
        },
      ],
      'b1',
    ),
  ],
});

export const SUPERMARKET_SCRIPTS: ScenarioScript[] = [A1, A2, B1];
