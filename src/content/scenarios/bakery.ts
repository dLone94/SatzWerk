import { bi } from '../authoring.ts';
import type { ScenarioScript } from '../types.ts';
import { narrator, registerTrap, script, them, you } from './authoring.ts';

/**
 * At the bakery.
 *
 * The first German counter most people ever stand at, and the one where the
 * gap between "I have done a hundred exercises" and "I can do this" is widest.
 * The stages are the same counter four times, at four levels of what you can
 * afford to want: survive it, order from it, ask it a question, and tell it
 * that it got something wrong.
 */

const PRE_A1 = script({
  id: 'sc-bakery-pre-a1',
  scenarioId: 'sc-bakery',
  level: 'pre-a1',
  register: 'Sie',
  partner: bi('the woman behind the counter', 'жената зад щанда'),
  goal: bi(
    'Get through your first German counter without English. You are allowed to point.',
    'Мини през първия си немски щанд без английски. Позволено ти е да посочиш.',
  ),
  lessonIds: ['pre-a1-u2-l1', 'pre-a1-u2-l2'],
  outro: bi(
    'That is the whole exchange: a greeting, a please, a thank you and a goodbye. You did not need a single word of grammar.',
    'Това е целият разговор: поздрав, „моля“, „благодаря“ и „довиждане“. Не ти трябваше нито едно граматично правило.',
  ),
  beats: [
    narrator(
      bi(
        'Ten past eight. One person ahead of you, then the counter is yours.',
        'Осем и десет. Един човек пред теб, после щандът е твой.',
      ),
    ),
    them('Guten Morgen!', bi('Good morning!', 'Добро утро!')),
    you(
      'sc-bakery-pre-a1-t1',
      bi('Greet her back', 'Поздрави я в отговор'),
      [
        {
          id: 'sc-bakery-pre-a1-t1-s1',
          prompt: bi('She has said good morning. Say it back.', 'Тя ти каза добро утро. Кажи го и ти.'),
          answer: 'Guten Morgen!',
          alternatives: ['Guten Tag!', 'Hallo!'],
          shape: 'phrase',
          reviewTargets: ['v-guten-morgen'],
          hints: [
            bi('Two words, both with a capital letter.', 'Две думи, и двете с главна буква.'),
            bi('Morgen is the morning, and the greeting keeps it.', '„Morgen“ е утро и поздравът го съдържа.'),
          ],
        },
      ],
      'pre-a1',
    ),
    them('Bitte schön?', bi('Yes? What can I get you?', 'Да? Заповядайте?'), {
      note: bi(
        'There is no English for this. "Bitte schön?" with a rising tone is the counter saying "you are next, go ahead" — you will hear it before you hear a question.',
        'Точно „Заповядайте?“ — същата дума, същото място в разговора. Немският използва „bitte“ там, където българският използва „заповядайте“, и това е първата от няколко такива употреби.',
      ),
    }),
    narrator(
      bi(
        'You do not have the words for what you want yet. You point at a loaf of bread.',
        'Още нямаш думите за това, което искаш. Посочваш един хляб.',
      ),
    ),
    you(
      'sc-bakery-pre-a1-t2',
      bi('Point, and make it a request', 'Посочи и го направи молба'),
      [
        {
          id: 'sc-bakery-pre-a1-t2-s1',
          instruction: bi(
            'Two words turn a pointed finger into a polite request.',
            'Две думи превръщат посочения пръст в учтива молба.',
          ),
          prompt: bi('You are pointing at the bread. Ask for it.', 'Сочиш хляба. Поискай го.'),
          answer: 'Das, bitte.',
          alternatives: ['Das hier, bitte.'],
          shape: 'phrase',
          reviewTargets: ['v-bitte'],
          hints: [
            bi('"Das" is "that one". Then a comma, then the magic word.', '„Das“ е „това“. После запетая и вълшебната дума.'),
            bi('Das, b___.', 'Das, b___.'),
          ],
        },
      ],
      'pre-a1',
    ),
    them('Zwei Euro zehn, bitte.', bi('Two euros ten, please.', 'Два евро и десет, моля.')),
    narrator(
      bi(
        'You put the coins on the little rubber tray, not in her hand. That tray is there on purpose.',
        'Слагаш монетите на малката гумена подложка, не в ръката ѝ. Подложката е там нарочно.',
      ),
    ),
    them('Danke schön. Einen schönen Tag noch!', bi('Thank you. Have a nice day!', 'Благодаря. Приятен ден!')),
    you(
      'sc-bakery-pre-a1-t3',
      bi('Thank her, and leave properly', 'Благодари ѝ и си тръгни както трябва'),
      [
        {
          id: 'sc-bakery-pre-a1-t3-s1',
          prompt: bi('Say thank you.', 'Кажи благодаря.'),
          answer: 'Danke!',
          alternatives: ['Danke schön!', 'Vielen Dank!', 'Danke sehr!'],
          shape: 'word',
          reviewTargets: ['v-danke'],
          hints: [bi('Five letters.', 'Пет букви.')],
        },
        {
          id: 'sc-bakery-pre-a1-t3-s2',
          instruction: bi('She used Sie with you.', 'Тя ти говори на „Sie“.'),
          prompt: bi('Now say goodbye, formally.', 'Сега се сбогувай официално.'),
          answer: 'Auf Wiedersehen!',
          alternatives: ['Tschüss!', 'Schönen Tag noch!'],
          shape: 'phrase',
          reviewTargets: ['v-auf-wiedersehen'],
          hints: [
            bi('Three words, and the last one is one long word.', 'Две думи, като втората е една дълга дума.'),
            bi('Auf W___.', 'Auf W___.'),
          ],
        },
      ],
      'pre-a1',
    ),
  ],
});

const A1 = script({
  id: 'sc-bakery-a1',
  scenarioId: 'sc-bakery',
  level: 'a1',
  register: 'Sie',
  partner: bi('the woman behind the counter', 'жената зад щанда'),
  goal: bi(
    'Order two rolls and a coffee, and pay for them.',
    'Поръчай две хлебчета и едно кафе и плати.',
  ),
  lessonIds: ['a1-u1-l1'],
  outro: bi(
    'You ordered two different things, answered a question you did not choose, and paid. That is a complete transaction in German.',
    'Поръча две различни неща, отговори на въпрос, който не си избрал, и плати. Това е завършена сделка на немски.',
  ),
  beats: [
    them('Guten Morgen! Was darf es sein?', bi('Good morning! What can I get you?', 'Добро утро! Какво да бъде?')),
    you(
      'sc-bakery-a1-t1',
      bi('Order two rolls', 'Поръчай две хлебчета'),
      [
        {
          id: 'sc-bakery-a1-t1-s1',
          instruction: bi(
            'In German you say the number and the thing, then "please" — no verb at all.',
            'На немски казваш числото и нещото, после „моля“ — без никакъв глагол.',
          ),
          prompt: bi('Order two rolls.', 'Поръчай две хлебчета.'),
          answer: 'Zwei Brötchen, bitte.',
          alternatives: ['Ich hätte gern zwei Brötchen.', 'Ich möchte zwei Brötchen, bitte.'],
          shape: 'phrase',
          reviewTargets: ['v-zwei', 'v-bitte'],
          traps: [
            {
              answer: 'Ich will zwei Brötchen.',
              category: 'vocabulary',
              feedback: bi(
                '"Ich will" is grammatically perfect and socially wrong: it is "I want", flat, the way a child demands. At a counter it is "Zwei Brötchen, bitte" or "Ich hätte gern".',
                '„Ich will“ е граматически безупречно и социално неуместно: това е „искам“, плоско, както настоява дете. На щанда е „Zwei Brötchen, bitte“ или „Ich hätte gern“.',
              ),
            },
            {
              answer: 'Zwei Brötchens, bitte.',
              category: 'plural',
              feedback: bi(
                'Brötchen does not change in the plural. Words ending in -chen never do: ein Brötchen, zwei Brötchen.',
                '„Brötchen“ не се променя в множествено число. Думите на -chen никога не се променят: ein Brötchen, zwei Brötchen.',
              ),
            },
          ],
          hints: [
            bi('Number, noun, please. No "I would like" needed.', 'Число, съществително, „моля“. Не ти трябва „бих искал“.'),
            bi('Zwei B___, bitte.', 'Zwei B___, bitte.'),
          ],
        },
      ],
      'a1',
    ),
    them('Gerne. Sonst noch etwas?', bi('Sure. Anything else?', 'Разбира се. Друго нещо?')),
    you(
      'sc-bakery-a1-t2',
      bi('Add a coffee', 'Добави едно кафе'),
      [
        {
          id: 'sc-bakery-a1-t2-s1',
          instruction: bi(
            'Watch the article: the coffee is the object of what you want, not the subject.',
            'Внимавай с члена: кафето е обектът на желанието ти, не подлогът.',
          ),
          prompt: bi('Yes — and a coffee.', 'Да — и едно кафе.'),
          answer: 'Ja, einen Kaffee, bitte.',
          alternatives: ['Einen Kaffee, bitte.', 'Ja, ich hätte gern einen Kaffee.'],
          shape: 'phrase',
          reviewTargets: ['v-kaffee'],
          traps: [
            {
              answer: 'Ja, ein Kaffee, bitte.',
              category: 'case',
              feedback: bi(
                'Almost. "Kaffee" is masculine and it is what you are asking for, so the article takes the accusative -en: einen Kaffee. English marks this only on pronouns (he / him) and never on nouns, which is why there is nothing here to carry over.',
                'Почти. „Kaffee“ е от мъжки род и е това, което искаш, затова членът е във винителен падеж: einen Kaffee. Българският е загубил падежите при съществителните, но ги пази при местоименията (той / него) — немският слага падежа върху члена.',
              ),
            },
          ],
          hints: [
            bi('der Kaffee, but not after "I would like".', '„der Kaffee“, но не и след „бих искал“.'),
            bi('Ja, ein__ Kaffee, bitte.', 'Ja, ein__ Kaffee, bitte.'),
          ],
        },
      ],
      'a1',
    ),
    them('Zum Mitnehmen?', bi('To take away?', 'За вкъщи?'), {
      note: bi(
        'Literally "for taking-with". You will meet this nominalised infinitive everywhere: zum Essen, zum Trinken, zum Mitnehmen.',
        'Буквално „за взимане-със-себе-си“. Ще срещаш този субстантивиран инфинитив навсякъде: zum Essen, zum Trinken, zum Mitnehmen.',
      ),
    }),
    you(
      'sc-bakery-a1-t3',
      bi('Answer her question', 'Отговори на въпроса ѝ'),
      [
        {
          id: 'sc-bakery-a1-t3-s1',
          instruction: bi(
            'Answering with the other person\u2019s own words is the safest reply in a language you are still building.',
            'Да отговориш с думите на другия е най-сигурният отговор на език, който още изграждаш.',
          ),
          prompt: bi('Yes, to take away.', 'Да, за вкъщи.'),
          answer: 'Ja, zum Mitnehmen, bitte.',
          alternatives: ['Zum Mitnehmen, bitte.', 'Ja, bitte.'],
          shape: 'phrase',
          hints: [bi('Repeat what she said, with a "ja" in front.', 'Повтори това, което каза тя, с „ja“ отпред.')],
        },
      ],
      'a1',
    ),
    them('Das macht vier Euro achtzig.', bi('That comes to four euros eighty.', 'Това прави четири евро и осемдесет.')),
    you(
      'sc-bakery-a1-t4',
      bi('Ask whether you can pay by card', 'Попитай дали можеш да платиш с карта'),
      [
        {
          id: 'sc-bakery-a1-t4-s1',
          instruction: bi(
            'The verb goes first in a yes/no question.',
            'Глаголът е на първо място при въпрос с „да/не“.',
          ),
          prompt: bi(
            'You have no cash. Ask whether you can pay by card.',
            'Нямаш кеш. Попитай дали можеш да платиш с карта.',
          ),
          answer: 'Kann ich mit Karte zahlen?',
          alternatives: ['Kann ich mit Karte bezahlen?', 'Geht das mit Karte?'],
          shape: 'sentence',
          reviewTargets: ['v-koennen', 'v-bezahlen'],
          traps: [
            {
              answer: 'Ich kann mit Karte zahlen?',
              category: 'word-order',
              feedback: bi(
                'That is a statement with a question mark. A German yes/no question starts with the verb: Kann ich …?',
                'Това е твърдение с въпросителен знак. Немският въпрос с „да/не“ започва с глагола: Kann ich …?',
              ),
            },
          ],
          hints: [
            bi('Start with the modal verb.', 'Започни с модалния глагол.'),
            bi('K___ ich mit Karte zahlen?', 'K___ ich mit Karte zahlen?'),
          ],
        },
      ],
      'a1',
    ),
    them('Nur bar, tut mir leid.', bi('Cash only, sorry.', 'Само в брой, съжалявам.'), {
      note: bi(
        'Not a rare answer. Plenty of German bakeries are still cash-only, and the sign saying so is often small.',
        'Не е рядък отговор. Много немски пекарни все още работят само в брой, а табелката за това често е малка.',
      ),
    }),
    narrator(bi('You find a five-euro note.', 'Намираш банкнота от пет евро.')),
    them('Zwanzig Cent zurück. Schönen Tag noch!', bi('Twenty cents change. Have a nice day!', 'Двайсет цента ресто. Приятен ден!')),
    you(
      'sc-bakery-a1-t5',
      bi('Close the conversation', 'Затвори разговора'),
      [
        {
          id: 'sc-bakery-a1-t5-s1',
          prompt: bi('Thank her and wish her the same.', 'Благодари ѝ и ѝ пожелай същото.'),
          answer: 'Danke, Ihnen auch!',
          alternatives: ['Danke, gleichfalls!', 'Danke schön, Ihnen auch!'],
          shape: 'phrase',
          reviewTargets: ['v-danke'],
          traps: [registerTrap('Danke, dir auch!', 'Sie')],
          hints: [
            bi('"To you too" — with the formal you.', '„И на теб/Вас също“ — с официалното обръщение.'),
            bi('Danke, I____ auch!', 'Danke, I____ auch!'),
          ],
        },
      ],
      'a1',
    ),
  ],
});

const A2 = script({
  id: 'sc-bakery-a2',
  scenarioId: 'sc-bakery',
  level: 'a2',
  register: 'Sie',
  partner: bi('the baker', 'пекарят'),
  goal: bi(
    'Find out what is in the bread, whether it contains nuts, and whether it is from today.',
    'Разбери какво има в хляба, дали съдържа ядки и дали е от днес.',
  ),
  outro: bi(
    'You asked three questions and changed your order because of the answers. That is the point where a counter stops being a wall.',
    'Зададе три въпроса и промени поръчката си заради отговорите. Точно тук щандът спира да бъде стена.',
  ),
  beats: [
    narrator(
      bi(
        'Someone in your household cannot eat nuts. This is not curiosity; you need the answer.',
        'Някой вкъщи не може да яде ядки. Това не е любопитство; трябва ти отговорът.',
      ),
    ),
    them('Guten Tag! Was kann ich Ihnen geben?', bi('Hello! What can I give you?', 'Добър ден! Какво да Ви дам?')),
    you(
      'sc-bakery-a2-t1',
      bi('Ask what is in the dark bread', 'Попитай какво има в тъмния хляб'),
      [
        {
          id: 'sc-bakery-a2-t1-s1',
          instruction: bi(
            '"in" with a location takes the dative here, because nothing is moving into anything.',
            '„in“ за място иска дателен падеж, защото нищо не влиза в нищо.',
          ),
          prompt: bi('Ask what is in the dark bread.', 'Попитай какво има в тъмния хляб.'),
          answer: 'Was ist in dem Brot?',
          alternatives: ['Was ist da drin?', 'Was ist in diesem Brot?'],
          shape: 'sentence',
          reviewTargets: ['v-brot', 'v-was'],
          traps: [
            {
              answer: 'Was ist in das Brot?',
              category: 'case',
              feedback: bi(
                'Accusative would mean something is going into the bread. You are asking where the ingredients are, not where they are heading: in dem Brot.',
                'Винителният падеж би значел, че нещо влиза в хляба. Ти питаш къде са съставките, не накъде отиват: in dem Brot.',
              ),
            },
          ],
          hints: [
            bi('"in" + a place you are not moving to = dative.', '„in“ + място, към което не се движиш = дателен.'),
            bi('Was ist in d__ Brot?', 'Was ist in d__ Brot?'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Roggen, Weizen, Wasser, Salz und Sonnenblumenkerne.',
      bi('Rye, wheat, water, salt and sunflower seeds.', 'Ръж, пшеница, вода, сол и слънчогледови семки.'),
    ),
    you(
      'sc-bakery-a2-t2',
      bi('Ask the question that actually matters', 'Задай въпроса, който наистина има значение'),
      [
        {
          id: 'sc-bakery-a2-t2-s1',
          prompt: bi(
            'He did not mention nuts, but that is not the same as "no nuts". Ask directly whether there are nuts in it.',
            'Той не спомена ядки, но това не значи, че няма. Попитай направо дали има ядки вътре.',
          ),
          answer: 'Sind da Nüsse drin?',
          alternatives: ['Sind Nüsse in dem Brot?', 'Enthält das Brot Nüsse?'],
          shape: 'sentence',
          hints: [
            bi('"drin" is the everyday short form of "darin" — in there.', '„drin“ е всекидневната кратка форма на „darin“ — вътре.'),
            bi('S___ da Nüsse drin?', 'S___ da Nüsse drin?'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Nein, in dem Brot sind keine Nüsse. Aber im Nussbrot daneben schon.',
      bi('No, there are no nuts in that bread. But in the nut bread next to it, yes.', 'Не, в този хляб няма ядки. Но в ядковия хляб до него — да.'),
      {
        note: bi(
          'Note "schon" at the end doing the work of a whole clause: "in that one, however, there are". German leans on these small words constantly.',
          'Забележи как „schon“ накрая върши работата на цяло изречение: „в онзи обаче има“. Немският постоянно разчита на такива малки думи.',
        ),
      },
    ),
    you(
      'sc-bakery-a2-t3',
      bi('Ask whether it is fresh', 'Попитай дали е пресен'),
      [
        {
          id: 'sc-bakery-a2-t3-s1',
          prompt: bi(
            'It is four in the afternoon. Ask whether the bread is from today.',
            'Четири следобед е. Попитай дали хлябът е от днес.',
          ),
          answer: 'Ist das Brot von heute?',
          alternatives: ['Ist das Brot frisch?', 'Ist das von heute?'],
          shape: 'sentence',
          reviewTargets: ['v-heute'],
          traps: [registerTrap('Hast du das Brot von heute?', 'Sie')],
          hints: [
            bi('"von heute" — of today. Verb first, it is a yes/no question.', '„von heute“ — от днес. Глаголът е пръв, това е въпрос с „да/не“.'),
            bi('I__ das Brot von heute?', 'I__ das Brot von heute?'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Das da ist von gestern, das hier ist von heute.',
      bi('That one is from yesterday, this one is from today.', 'Онзи е от вчера, този е от днес.'),
    ),
    you(
      'sc-bakery-a2-t4',
      bi('Change your mind out loud', 'Промени решението си на глас'),
      [
        {
          id: 'sc-bakery-a2-t4-s1',
          instruction: bi(
            'When a sentence starts with anything but the subject, the verb still comes second.',
            'Когато изречението започва с нещо различно от подлога, глаголът пак е втори.',
          ),
          prompt: bi(
            'Take the one from today. Start it with the word dann.',
            'Вземи този от днес — започни с думата dann.',
          ),
          answer: 'Dann nehme ich das von heute.',
          alternatives: ['Dann nehme ich das frische, bitte.', 'Ich nehme das von heute.'],
          shape: 'sentence',
          reviewTargets: ['v-nehmen'],
          traps: [
            {
              answer: 'Dann ich nehme das von heute.',
              category: 'word-order',
              feedback: bi(
                'The verb is second, always. "Dann" took first place, so "nehme" comes next and "ich" moves behind it.',
                'Глаголът е винаги на второ място. „Dann“ зае първото, значи следва „nehme“, а „ich“ минава след него.',
              ),
            },
          ],
          hints: [
            bi('Dann ___ ich …', 'Dann ___ ich …'),
            bi('The verb is nehmen, and it changes its vowel: ich nehme.', 'Глаголът е „nehmen“ и сменя гласната: ich nehme.'),
          ],
        },
      ],
      'a2',
    ),
  ],
});

const B1 = script({
  id: 'sc-bakery-b1',
  scenarioId: 'sc-bakery',
  level: 'b1',
  register: 'Sie',
  partner: bi('the baker', 'пекарят'),
  goal: bi(
    'You were given the wrong thing. Say so, prove it, and get it fixed without the temperature rising.',
    'Дали са ти грешното. Кажи го, докажи го и оправи нещата, без тонът да се покачва.',
  ),
  outro: bi(
    'A complaint in four moves: open softly, state the facts, produce the evidence, accept the fix. Nothing in it was aggressive and nothing in it was vague.',
    'Оплакване в четири хода: започни меко, изложи фактите, покажи доказателството, приеми решението. Нищо в него не беше агресивно и нищо не беше мъгляво.',
  ),
  beats: [
    narrator(
      bi(
        'You are back ten minutes later. The bag has a cheese roll in it. You ordered ham.',
        'Връщаш се десет минути по-късно. В плика има хлебче със сирене. Ти поръча с шунка.',
      ),
    ),
    them('Ja bitte? Oh — Sie waren doch gerade schon da.', bi('Yes? Oh — you were just here.', 'Да, моля? О — Вие току-що бяхте тук.')),
    you(
      'sc-bakery-b1-t1',
      bi('Open without accusing anyone', 'Започни, без да обвиняваш никого'),
      [
        {
          id: 'sc-bakery-b1-t1-s1',
          instruction: bi(
            'German opens a complaint impersonally — a mistake happened — rather than "you gave me".',
            'Немският започва оплакване безлично — станала е грешка — вместо „Вие ми дадохте“.',
          ),
          prompt: bi('Open the complaint.', 'Започни оплакването.'),
          answer: 'Entschuldigung, ich glaube, da ist ein Fehler passiert.',
          alternatives: [
            'Entschuldigung, ich glaube, hier ist ein Fehler passiert.',
            'Entschuldigung, da stimmt etwas nicht.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-entschuldigung', 'v-glauben', 'v-passieren'],
          traps: [
            {
              answer: 'Entschuldigung, Sie haben mir das Falsche gegeben.',
              category: 'vocabulary',
              feedback: bi(
                'Grammatically correct and strategically poor: it names a culprit in the first sentence. The German move is to let the mistake be nobody’s — "da ist ein Fehler passiert" — and it gets fixed faster.',
                'Граматически вярно и стратегически слабо: посочва виновник още в първото изречение. Немският ход е грешката да не е ничия — „da ist ein Fehler passiert“ — и така се оправя по-бързо.',
              ),
            },
          ],
          hints: [
            bi('"ein Fehler passiert" — a mistake happened, with sein as the auxiliary.', '„ein Fehler passiert“ — станала е грешка, с „sein“ като спомагателен глагол.'),
            bi('Entschuldigung, ich glaube, da ist ein Fehler p_______.', 'Entschuldigung, ich glaube, da ist ein Fehler p_______.'),
          ],
        },
      ],
      'b1',
    ),
    them('Oh, was ist denn los?', bi('Oh, what is the matter?', 'О, какво става?')),
    you(
      'sc-bakery-b1-t2',
      bi('State both facts in one sentence', 'Изложи и двата факта в едно изречение'),
      [
        {
          id: 'sc-bakery-b1-t2-s1',
          instruction: bi(
            'Perfekt for the order, present for what is in front of you, joined with "aber".',
            'Perfekt за поръчката, сегашно за това пред теб, свързани с „aber“.',
          ),
          prompt: bi(
            'Say what you ordered and what is in the bag.',
            'Кажи какво си поръчал и какво има в плика.',
          ),
          answer: 'Ich habe ein Schinkenbrötchen bestellt, aber hier ist ein Käsebrötchen.',
          alternatives: [
            'Ich habe ein Schinkenbrötchen bestellt, aber im Beutel ist ein Käsebrötchen.',
            'Ich hatte ein Schinkenbrötchen bestellt, aber hier ist ein Käsebrötchen.',
          ],
          shape: 'sentence',
          traps: [
            {
              answer: 'Ich habe ein Schinkenbrötchen bestellt, aber hier ist ein Käsebrötchen gewesen.',
              category: 'verb-tense',
              feedback: bi(
                'The cheese roll is not a past event — it is in your hand right now. Present tense: hier ist ein Käsebrötchen.',
                'Хлебчето със сирене не е минало събитие — то е в ръката ти в момента. Сегашно време: hier ist ein Käsebrötchen.',
              ),
            },
          ],
          hints: [
            bi('bestellen is regular: bestellt, with haben.', '„bestellen“ е правилен глагол: bestellt, с „haben“.'),
            bi('Ich habe ein Schinkenbrötchen b_______, aber …', 'Ich habe ein Schinkenbrötchen b_______, aber …'),
          ],
        },
      ],
      'b1',
    ),
    them('Das tut mir leid. Haben Sie den Bon dabei?', bi('I am sorry. Do you have the receipt with you?', 'Съжалявам. Носите ли касовата бележка?')),
    you(
      'sc-bakery-b1-t3',
      bi('Produce the receipt', 'Покажи бележката'),
      [
        {
          id: 'sc-bakery-b1-t3-s1',
          prompt: bi('You do have it. Say so and hand it over.', 'Имаш я. Кажи го и я подай.'),
          answer: 'Ja, hier ist der Bon.',
          alternatives: ['Ja, den habe ich hier.', 'Ja, hier bitte.'],
          shape: 'sentence',
          hints: [bi('der Bon — masculine, and it is the subject of your sentence.', '„der Bon“ — мъжки род, и е подлог в изречението ти.')],
        },
      ],
      'b1',
    ),
    them(
      'Danke. Möchten Sie das Schinkenbrötchen, oder soll ich Ihnen das Geld zurückgeben?',
      bi('Thank you. Would you like the ham roll, or shall I give you your money back?', 'Благодаря. Искате ли хлебчето с шунка, или да Ви върна парите?'),
    ),
    you(
      'sc-bakery-b1-t4',
      bi('Choose, politely', 'Избери, учтиво'),
      [
        {
          id: 'sc-bakery-b1-t4-s1',
          instruction: bi(
            '"Ich hätte gern" is the softener that keeps a complaint from ending badly.',
            '„Ich hätte gern“ е смекчителят, който не позволява на оплакването да завърши зле.',
          ),
          prompt: bi('Take the ham roll.', 'Вземи хлебчето с шунка.'),
          answer: 'Ich hätte gern das Schinkenbrötchen.',
          alternatives: ['Ich nehme gern das Schinkenbrötchen.', 'Das Schinkenbrötchen, bitte.'],
          shape: 'sentence',
          traps: [
            {
              answer: 'Ich will das Schinkenbrötchen.',
              category: 'vocabulary',
              feedback: bi(
                'You are in the right here, which is exactly when "Ich will" costs you the goodwill you still need. "Ich hätte gern" concedes nothing and softens everything.',
                'Прав си в случая — и точно тогава „Ich will“ ти коства доброжелателността, която още ти трябва. „Ich hätte gern“ не отстъпва нищо, но смекчава всичко.',
              ),
            },
          ],
          hints: [
            bi('Konjunktiv II of haben: ich h____.', 'Konjunktiv II на „haben“: ich h____.'),
            bi('Ich hätte g___ das Schinkenbrötchen.', 'Ich hätte g___ das Schinkenbrötchen.'),
          ],
        },
      ],
      'b1',
    ),
    them('Natürlich. Entschuldigen Sie bitte die Umstände.', bi('Of course. Sorry for the trouble.', 'Разбира се. Извинете за неудобството.')),
    you(
      'sc-bakery-b1-t5',
      bi('Let him off the hook', 'Освободи го от вината'),
      [
        {
          id: 'sc-bakery-b1-t5-s1',
          prompt: bi(
            'He has apologised twice. Close it warmly — you will be back here tomorrow.',
            'Той се извини два пъти. Затвори топло — утре пак ще си тук.',
          ),
          answer: 'Kein Problem, danke schön!',
          alternatives: ['Kein Problem, vielen Dank!', 'Alles gut, danke!', 'Das macht nichts, danke!'],
          shape: 'phrase',
          reviewTargets: ['v-das-problem'],
          hints: [bi('"No problem" is almost word for word in German.', '„Няма проблем“ е почти дума по дума на немски.')],
        },
      ],
      'b1',
    ),
  ],
});

export const BAKERY_SCRIPTS: ScenarioScript[] = [PRE_A1, A1, A2, B1];
