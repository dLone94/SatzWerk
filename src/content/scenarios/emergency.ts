import { bi } from '../authoring.ts';
import type { ScenarioScript } from '../types.ts';
import { narrator, script, them, you } from './authoring.ts';

/**
 * Emergencies.
 *
 * The one part of the course where being slow is the actual danger, so the
 * scripts drill the order a German emergency call happens in — place first,
 * then what happened, then who — and the fact that you do not hang up.
 *
 * Everything here is Sie, and there are no jokes in it.
 */

const A1 = script({
  id: 'sc-emergency-a1',
  scenarioId: 'sc-emergency',
  level: 'a1',
  register: 'Sie',
  partner: bi('the emergency operator', 'диспечерът на спешния телефон'),
  goal: bi('Call 112 and get help to the right address.', 'Обади се на 112 и изпрати помощ на верния адрес.'),
  outro: bi(
    'The address comes first, before anything else, because if the line drops that is the one thing that still sends an ambulance. And you never hang up first.',
    'Адресът е първи, преди всичко друго, защото ако връзката прекъсне, само той пак ще прати линейка. И никога не затваряш пръв.',
  ),
  beats: [
    narrator(
      bi(
        'Someone has fallen in the hallway. You dial 112 — the same number everywhere in Europe, free, from any phone.',
        'Някой е паднал в коридора. Набираш 112 — същият номер навсякъде в Европа, безплатен, от всеки телефон.',
      ),
    ),
    them('Notruf 112. Wo genau ist der Notfall?', bi('Emergency, 112. Where exactly is the emergency?', 'Спешен телефон 112. Къде точно е спешният случай?'), {
      note: bi(
        'They ask for the place first, not for what happened. If the call breaks off, the address is the only thing that still gets help moving.',
        'Питат първо за мястото, не за случилото се. Ако разговорът прекъсне, адресът е единственото, което пак ще задвижи помощта.',
      ),
    }),
    you(
      'sc-emergency-a1-t1',
      bi('Give the address', 'Кажи адреса'),
      [
        {
          id: 'sc-emergency-a1-t1-s1',
          instruction: bi(
            'Street and number, then the town. In German the number comes after the street name.',
            'Улица и номер, после градът. На немски номерът идва след името на улицата.',
          ),
          prompt: bi('Hauptstrasse 12, in Cologne.', 'Хауптщрасе 12, в Кьолн.'),
          answer: 'Hauptstraße zwölf, in Köln.',
          alternatives: ['Hauptstraße 12, in Köln.', 'In der Hauptstraße zwölf, in Köln.'],
          shape: 'phrase',
          reviewTargets: ['v-strasse'],
          hints: [
            bi('Street first, number second.', 'Първо улицата, после номерът.'),
            bi('Hauptstraße z____, in Köln.', 'Hauptstraße z____, in Köln.'),
          ],
        },
      ],
      'a1',
    ),
    them('Was ist passiert?', bi('What has happened?', 'Какво се е случило?')),
    you(
      'sc-emergency-a1-t2',
      bi('Say what happened', 'Кажи какво се е случило'),
      [
        {
          id: 'sc-emergency-a1-t2-s1',
          instruction: bi(
            'fallen takes sein in the Perfekt, like every verb of movement.',
            '„fallen“ иска „sein“ в Perfekt, както всеки глагол за движение.',
          ),
          prompt: bi('Your husband has fallen.', 'Мъжът ти е паднал.'),
          answer: 'Mein Mann ist gefallen.',
          alternatives: ['Mein Mann ist gestürzt.', 'Mein Mann ist hingefallen.'],
          shape: 'sentence',
          reviewTargets: ['v-der-mann'],
          traps: [
            {
              answer: 'Mein Mann hat gefallen.',
              category: 'auxiliary-verb',
              feedback: bi(
                'fallen is movement, so it takes sein: mein Mann ist gefallen.',
                '„fallen“ е движение, затова иска „sein“: mein Mann ist gefallen.',
              ),
            },
          ],
          hints: [
            bi('Perfekt with sein.', 'Perfekt със „sein“.'),
            bi('Mein Mann i__ gefallen.', 'Mein Mann i__ gefallen.'),
          ],
        },
      ],
      'a1',
    ),
    them('Ist er bei Bewusstsein? Antwortet er Ihnen?', bi('Is he conscious? Is he answering you?', 'В съзнание ли е? Отговаря ли Ви?')),
    you(
      'sc-emergency-a1-t3',
      bi('Answer', 'Отговори'),
      [
        {
          id: 'sc-emergency-a1-t3-s1',
          prompt: bi('He is answering, but very quietly.', 'Отговаря, но много тихо.'),
          answer: 'Ja, aber sehr leise.',
          alternatives: [
            'Ja, er antwortet, aber sehr leise.',
            'Ja, er spricht, aber leise.',
            'Er antwortet, aber sehr leise.',
            'Er spricht, aber leise.',
          ],
          shape: 'phrase',
          hints: [bi('Yes, plus one contrast word.', '„Да“ плюс една противопоставителна дума.')],
        },
      ],
      'a1',
    ),
    them('Bleiben Sie bitte am Telefon.', bi('Please stay on the line.', 'Моля, останете на телефона.')),
    you(
      'sc-emergency-a1-t4',
      bi('Confirm', 'Потвърди'),
      [
        {
          id: 'sc-emergency-a1-t4-s1',
          instruction: bi(
            'Never hang up on 112. They end the call when they are ready.',
            'Никога не затваряй на 112. Те прекратяват разговора, когато са готови.',
          ),
          prompt: bi('Say that you will stay on the line.', 'Кажи, че ще останеш на телефона.'),
          answer: 'Ja, ich bleibe am Telefon.',
          alternatives: [
            'Ja, ich bleibe dran.',
            'Ja, ich bleibe hier.',
            'Ich bleibe am Telefon.',
            'Ich bleibe dran.',
            'Ich bleibe hier.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-bleiben'],
          hints: [bi('Repeat his verb back.', 'Повтори неговия глагол.')],
        },
      ],
      'a1',
    ),
  ],
});

const A2 = script({
  id: 'sc-emergency-a2',
  scenarioId: 'sc-emergency',
  level: 'a2',
  register: 'Sie',
  partner: bi('the emergency operator', 'диспечерът на спешния телефон'),
  goal: bi(
    'Report an accident that happened to someone else, with enough detail to send the right help.',
    'Съобщи за инцидент, случил се с друг човек, с достатъчно детайли, за да пратят вярната помощ.',
  ),
  outro: bi(
    'Age and whether the person responds are not small talk: they decide which vehicle leaves the station. Saying them without being asked is the difference a level makes.',
    'Възрастта и дали човекът отговаря не са любезности: те решават коя кола ще тръгне. Да ги кажеш, без да те питат, е разликата, която прави едно ниво.',
  ),
  beats: [
    narrator(
      bi(
        'Your neighbour fell on the stairs between the second and third floor. She is conscious and in pain.',
        'Съседката ти падна на стълбите между втория и третия етаж. В съзнание е и я боли.',
      ),
    ),
    them('Notruf 112. Wo ist der Notfall?', bi('Emergency, 112. Where is the emergency?', 'Спешен телефон 112. Къде е спешният случай?')),
    you(
      'sc-emergency-a2-t1',
      bi('Give the address and the floor', 'Кажи адреса и етажа'),
      [
        {
          id: 'sc-emergency-a2-t1-s1',
          instruction: bi(
            'A street you are located in takes in + dative: in der Lindenstraße.',
            'Улица, на която се намираш, иска „in“ + дателен падеж: in der Lindenstraße.',
          ),
          prompt: bi('Lindenstrasse 8, third floor, in the stairwell.', 'Линденщрасе 8, трети етаж, на стълбището.'),
          answer: 'In der Lindenstraße acht, dritter Stock, im Treppenhaus.',
          alternatives: [
            'Lindenstraße acht, dritter Stock, im Treppenhaus.',
            'In der Lindenstraße 8, im dritten Stock, im Treppenhaus.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-strasse', 'v-der-stock'],
          hints: [
            bi('in + dative for the street, then the floor.', '„in“ + дателен падеж за улицата, после етажът.'),
            bi('In d__ Lindenstraße acht, dritter Stock …', 'In d__ Lindenstraße acht, dritter Stock …'),
          ],
        },
      ],
      'a2',
    ),
    them('Was ist passiert?', bi('What happened?', 'Какво се е случило?')),
    you(
      'sc-emergency-a2-t2',
      bi('Say what happened and to whom', 'Кажи какво се е случило и с кого'),
      [
        {
          id: 'sc-emergency-a2-t2-s1',
          instruction: bi(
            'Two clauses: the event in the Perfekt, then what is true now in the present.',
            'Две части: събитието в Perfekt, после какво е вярно сега — в сегашно време.',
          ),
          prompt: bi('Your neighbour fell on the stairs and cannot get up.', 'Съседката ти падна на стълбите и не може да стане.'),
          answer: 'Meine Nachbarin ist auf der Treppe gestürzt und kann nicht aufstehen.',
          alternatives: [
            'Meine Nachbarin ist auf der Treppe gefallen und kann nicht aufstehen.',
            'Meine Nachbarin ist gestürzt und kann nicht aufstehen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-nachbar', 'v-aufstehen'],
          hints: [
            bi('stürzen takes sein, and aufstehen goes to the end after kann.', '„stürzen“ иска „sein“, а „aufstehen“ отива накрая след „kann“.'),
            bi('Meine Nachbarin i__ auf der Treppe gestürzt und k___ nicht aufstehen.', 'Meine Nachbarin i__ auf der Treppe gestürzt und k___ nicht aufstehen.'),
          ],
        },
      ],
      'a2',
    ),
    them('Wie alt ist sie ungefähr?', bi('Roughly how old is she?', 'На колко години е приблизително?')),
    you(
      'sc-emergency-a2-t3',
      bi('Estimate her age', 'Прецени възрастта ѝ'),
      [
        {
          id: 'sc-emergency-a2-t3-s1',
          prompt: bi('She is about seventy.', 'Тя е около седемдесет.'),
          answer: 'Sie ist etwa siebzig.',
          alternatives: ['Sie ist ungefähr siebzig.', 'Etwa siebzig Jahre alt.'],
          shape: 'sentence',
          reviewTargets: ['v-siebzig', 'v-alt'],
          hints: [bi('etwa and ungefähr both mean "about".', '„etwa“ и „ungefähr“ значат „около“.')],
        },
      ],
      'a2',
    ),
    them('Ist sie ansprechbar?', bi('Is she responsive?', 'Реагира ли?')),
    you(
      'sc-emergency-a2-t4',
      bi('Describe her state', 'Опиши състоянието ѝ'),
      [
        {
          id: 'sc-emergency-a2-t4-s1',
          instruction: bi(
            'starke Schmerzen — strong pains, in the plural, is how German says severe pain.',
            '„starke Schmerzen“ — силни болки, в множествено число, е немският начин за силна болка.',
          ),
          prompt: bi('She answers, but she is in a lot of pain.', 'Тя отговаря, но има силни болки.'),
          answer: 'Ja, sie antwortet, aber sie hat starke Schmerzen.',
          alternatives: [
            'Ja, sie ist ansprechbar, aber sie hat starke Schmerzen.',
            'Ja, sie spricht, hat aber starke Schmerzen.',
            'Sie antwortet, aber sie hat starke Schmerzen.',
            'Sie ist ansprechbar, aber sie hat starke Schmerzen.',
            'Sie spricht, hat aber starke Schmerzen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-schmerzen'],
          hints: [
            bi('Schmerzen is plural, so the adjective ends in -e.', '„Schmerzen“ е в мн. ч., затова прилагателното завършва на „-e“.'),
            bi('…, aber sie hat s______ Schmerzen.', '…, aber sie hat s______ Schmerzen.'),
          ],
        },
      ],
      'a2',
    ),
  ],
});

const B1 = script({
  id: 'sc-emergency-b1',
  scenarioId: 'sc-emergency',
  level: 'b1',
  register: 'Sie',
  partner: bi('the police officer', 'полицаят'),
  goal: bi(
    'Report a break-in clearly enough to be written down, and get the paper your insurer will want.',
    'Опиши взлом достатъчно ясно, за да бъде записан, и вземи документа, който застрахователят ще поиска.',
  ),
  outro: bi(
    'A statement is not a story. What the officer needs is the order things happened in, what you saw as opposed to what you assume, and what is missing — and the difference between those last two is the whole skill.',
    'Показанията не са разказ. На полицая му трябват редът, в който се е случило, какво си видял за разлика от това, което предполагаш, и какво липсва — а разликата между последните две е цялото умение.',
  ),
  beats: [
    narrator(
      bi(
        'You came home to an open flat door. Nothing is broken, but two things are gone.',
        'Прибрал си се и си заварил вратата отворена. Нищо не е счупено, но две неща ги няма.',
      ),
    ),
    them(
      'Können Sie mir bitte schildern, was genau passiert ist?',
      bi('Could you describe to me exactly what happened?', 'Може ли да ми опишете какво точно се е случило?'),
    ),
    you(
      'sc-emergency-b1-t1',
      bi('Give the sequence, in order', 'Разкажи последователността по ред'),
      [
        {
          id: 'sc-emergency-b1-t1-s1',
          instruction: bi(
            'Two clauses joined by und: the first in the Perfekt for what you did, the second in the simple past for what was already the case.',
            'Две части, свързани с „und“: Perfekt за това, което си направил, и просто минало за това, което вече е било така.',
          ),
          prompt: bi('You got home around eight, and the door was open.', 'Прибрал си се около осем и вратата е била отворена.'),
          answer: 'Ich bin gegen acht nach Hause gekommen, und die Wohnungstür war offen.',
          alternatives: [
            'Ich bin gegen acht nach Hause gekommen, und da war die Wohnungstür offen.',
            'Gegen acht bin ich nach Hause gekommen, und die Wohnungstür war offen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-zu-hause', 'v-tuer'],
          traps: [
            {
              answer: 'Ich habe gegen acht nach Hause gekommen, und die Wohnungstür war offen.',
              category: 'auxiliary-verb',
              feedback: bi(
                'kommen is movement from one place to another, so it takes sein: ich bin gekommen.',
                '„kommen“ е движение от едно място към друго, затова иска „sein“: ich bin gekommen.',
              ),
            },
          ],
          hints: [
            bi('kommen takes sein; war is the past of sein.', '„kommen“ иска „sein“; „war“ е миналото на „sein“.'),
            bi('Ich b__ gegen acht nach Hause gekommen …', 'Ich b__ gegen acht nach Hause gekommen …'),
          ],
        },
      ],
      'b1',
    ),
    them('Haben Sie jemanden gesehen?', bi('Did you see anybody?', 'Видяхте ли някого?')),
    you(
      'sc-emergency-b1-t2',
      bi('Separate what you saw from what you heard', 'Раздели видяното от чутото'),
      [
        {
          id: 'sc-emergency-b1-t2-s1',
          instruction: bi(
            'Answer the question asked, then add the thing you do know. Guessing helps nobody and ends up in the file.',
            'Отговори на зададения въпрос, после добави това, което наистина знаеш. Предположенията не помагат на никого и влизат в преписката.',
          ),
          prompt: bi('You saw nobody, but you heard steps in the stairwell.', 'Не си видял никого, но си чул стъпки на стълбището.'),
          answer: 'Nein, aber ich habe Schritte im Treppenhaus gehört.',
          alternatives: [
            'Nein, niemanden. Aber ich habe Schritte im Treppenhaus gehört.',
            'Gesehen habe ich niemanden, aber ich habe Schritte gehört.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-hoeren'],
          hints: [
            bi('hören is regular: gehört, with haben.', '„hören“ е правилен: gehört, с „haben“.'),
            bi('Nein, aber ich habe Schritte im Treppenhaus g_____.', 'Nein, aber ich habe Schritte im Treppenhaus g_____.'),
          ],
        },
      ],
      'b1',
    ),
    them('Was fehlt Ihnen?', bi('What is missing?', 'Какво липсва?'), {
      note: bi(
        'The same "fehlen" a doctor uses, in its literal sense here: what is missing from you. One verb, two very different rooms.',
        'Същото „fehlen“, което лекарят използва, тук в буквалния му смисъл: какво Ви липсва. Един глагол, две много различни стаи.',
      ),
    }),
    you(
      'sc-emergency-b1-t3',
      bi('List what is gone', 'Изброй какво липсва'),
      [
        {
          id: 'sc-emergency-b1-t3-s1',
          instruction: bi(
            'With fehlen, the missing things are the subject and the person is in the dative — so the verb agrees with the laptop and the camera, not with you.',
            'При „fehlen“ липсващите неща са подлог, а човекът е в дателен падеж — затова глаголът се съгласува с лаптопа и камерата, не с теб.',
          ),
          prompt: bi('Your laptop and your camera.', 'Лаптопът и камерата ти.'),
          answer: 'Mein Laptop und meine Kamera fehlen.',
          alternatives: [
            'Mir fehlen mein Laptop und meine Kamera.',
            'Mein Laptop und meine Kamera sind weg.',
          ],
          shape: 'sentence',
          traps: [
            {
              answer: 'Mein Laptop und meine Kamera fehlt.',
              category: 'verb-conjugation',
              feedback: bi(
                'Two things are missing, so the verb is plural: fehlen.',
                'Липсват две неща, значи глаголът е в множествено число: fehlen.',
              ),
            },
          ],
          hints: [
            bi('Two subjects, so a plural verb.', 'Два подлога, значи глагол в множествено число.'),
            bi('Mein Laptop und meine Kamera f_____.', 'Mein Laptop und meine Kamera f_____.'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Ich nehme das auf. Sie bekommen eine Bestätigung der Anzeige.',
      bi('I will record this. You will get confirmation of the report.', 'Ще го запиша. Ще получите потвърждение за сигнала.'),
    ),
    you(
      'sc-emergency-b1-t4',
      bi('Check that it covers the insurer', 'Провери дали важи за застрахователя'),
      [
        {
          id: 'sc-emergency-b1-t4-s1',
          instruction: bi(
            'A yes/no question with brauchen: what you need, and what for.',
            'Въпрос с „да/не“ и „brauchen“: какво ти трябва и за какво.',
          ),
          prompt: bi(
            'Ask whether your insurer needs that confirmation.',
            'Попитай дали това потвърждение трябва на застрахователя.',
          ),
          answer: 'Brauche ich die Bestätigung für die Versicherung?',
          alternatives: [
            'Reicht die Bestätigung für die Versicherung?',
            'Brauche ich das Aktenzeichen für die Versicherung?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-bestaetigung', 'v-die-versicherung'],
          hints: [
            bi('für + accusative: für die Versicherung.', '„für“ + винителен падеж: für die Versicherung.'),
            bi('B______ ich die Bestätigung für die Versicherung?', 'B______ ich die Bestätigung für die Versicherung?'),
          ],
        },
      ],
      'b1',
    ),
  ],
});

export const EMERGENCY_SCRIPTS: ScenarioScript[] = [A1, A2, B1];
