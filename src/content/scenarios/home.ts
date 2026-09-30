import { bi } from '../authoring.ts';
import type { ScenarioScript } from '../types.ts';
import { narrator, registerTrap, script, them, you } from './authoring.ts';

/**
 * The flat, and the people on the other side of its walls.
 *
 * The neighbours scenario is the one place in Real Life where the register
 * actually changes between stages, because that is what happens in a German
 * stairwell: Sie with the woman downstairs, du with the person your own age
 * who asked you to take a parcel, and Sie again the moment it is a complaint.
 */

const APARTMENT_A2 = script({
  id: 'sc-apartment-a2',
  scenarioId: 'sc-apartment',
  level: 'a2',
  register: 'Sie',
  partner: bi('the letting agent', 'брокерът'),
  goal: bi('At the viewing: find out the rent, the size and when it is free.', 'На огледа: разбери наема, размера и кога е свободен.'),
  lessonIds: ['b1-u1-l1'],
  outro: bi(
    'Three questions, three numbers. The one that catches people out is the first: a German rent is quoted cold, and the real figure is somewhere above it.',
    'Три въпроса, три числа. Първият изненадва хората: немският наем се обявява „студен“, а истинската сума е някъде над него.',
  ),
  beats: [
    them('Guten Tag, Sie kommen wegen der Wohnung?', bi('Hello, you are here about the flat?', 'Добър ден, идвате за жилището?')),
    you(
      'sc-apartment-a2-t1',
      bi('Ask what the rent is', 'Попитай какъв е наемът'),
      [
        {
          id: 'sc-apartment-a2-t1-s1',
          instruction: bi(
            'German asks how "high" a rent is, not how much it is. Same for a price, a salary and a fee.',
            'Немският пита колко „висок“ е наемът, а не колко е. Същото важи за цена, заплата и такса.',
          ),
          prompt: bi('Ask what the rent is.', 'Попитай какъв е наемът.'),
          answer: 'Wie hoch ist die Miete?',
          alternatives: ['Was kostet die Wohnung?', 'Wie hoch ist die Kaltmiete?'],
          shape: 'sentence',
          reviewTargets: ['v-die-miete'],
          hints: [
            bi('The adjective is the one you use for a tall building.', 'Прилагателното е това, което използваш за висока сграда.'),
            bi('Wie h___ ist die Miete?', 'Wie h___ ist die Miete?'),
          ],
        },
      ],
      'a2',
    ),
    them(
      'Sechshundert kalt, plus zweihundert Nebenkosten.',
      bi('Six hundred cold, plus two hundred in additional costs.', 'Шестстотин „студен“ плюс двеста допълнителни разходи.'),
      {
        note: bi(
          'Kaltmiete is the rent with nothing in it; Warmmiete has the heating and the rest on top. An advert always shows the cold one, because it is the smaller number.',
          'Kaltmiete е наемът без нищо в него; Warmmiete включва отоплението и останалото. Обявата винаги показва студения, защото е по-малкото число.',
        ),
      },
    ),
    you(
      'sc-apartment-a2-t2',
      bi('Ask how big it is', 'Попитай колко е голямо'),
      [
        {
          id: 'sc-apartment-a2-t2-s1',
          prompt: bi('Ask how big the flat is.', 'Попитай колко е голямо жилището.'),
          answer: 'Und wie groß ist die Wohnung?',
          alternatives: ['Wie groß ist die Wohnung?', 'Wie viele Quadratmeter hat die Wohnung?'],
          shape: 'sentence',
          reviewTargets: ['v-wohnung', 'v-gross'],
          hints: [bi('wie + adjective + ist …', '„wie“ + прилагателно + „ist“ …')],
        },
      ],
      'a2',
    ),
    them(
      'Zweiundsechzig Quadratmeter, zwei Zimmer, mit Balkon.',
      bi('Sixty-two square metres, two rooms, with a balcony.', 'Шейсет и два квадратни метра, две стаи, с балкон.'),
    ),
    you(
      'sc-apartment-a2-t3',
      bi('Ask when it is available', 'Попитай откога е свободно'),
      [
        {
          id: 'sc-apartment-a2-t3-s1',
          instruction: bi(
            'ab wann is "from when" — the question for a date something starts, not for a point in time.',
            '„ab wann“ е „от кога“ — въпросът за дата, от която нещо започва, а не за момент във времето.',
          ),
          prompt: bi('Ask from when it is free.', 'Попитай от кога е свободно.'),
          answer: 'Ab wann ist sie frei?',
          alternatives: ['Ab wann ist die Wohnung frei?', 'Ab wann kann man einziehen?'],
          shape: 'sentence',
          reviewTargets: ['v-frei', 'v-einziehen'],
          hints: [
            bi('Two words, then the verb.', 'Две думи, после глаголът.'),
            bi('A_ w___ ist sie frei?', 'A_ w___ ist sie frei?'),
          ],
        },
      ],
      'a2',
    ),
    them('Ab dem ersten Mai.', bi('From the first of May.', 'От първи май.')),
    you(
      'sc-apartment-a2-t4',
      bi('Say that suits you', 'Кажи, че ти е удобно'),
      [
        {
          id: 'sc-apartment-a2-t4-s1',
          prompt: bi('That works for you. Say so and thank him.', 'Това ти върши работа. Кажи го и благодари.'),
          answer: 'Das passt mir gut, vielen Dank!',
          alternatives: ['Das passt, vielen Dank!', 'Perfekt, vielen Dank!'],
          shape: 'sentence',
          reviewTargets: ['v-passt'],
          traps: [registerTrap('Das passt mir gut, danke dir!', 'Sie')],
          hints: [bi('passen with a dative person: das passt mir.', '„passen“ с човек в дателен падеж: das passt mir.')],
        },
      ],
      'a2',
    ),
  ],
});

const APARTMENT_B1 = script({
  id: 'sc-apartment-b1',
  scenarioId: 'sc-apartment',
  level: 'b1',
  register: 'Sie',
  partner: bi('the landlord', 'наемодателят'),
  goal: bi(
    'Convince him you are a safe tenant, and find out what the extra costs actually cover.',
    'Убеди го, че си сигурен наемател, и разбери какво всъщност покриват допълнителните разходи.',
  ),
  lessonIds: ['b1-u1-l2'],
  outro: bi(
    'A German landlord is deciding one thing: will the rent arrive every month. Steady job, permanent contract, two adults — that is the whole pitch, and it is three facts rather than a personality.',
    'Немският наемодател решава едно: ще идва ли наемът всеки месец. Стабилна работа, безсрочен договор, двама възрастни — това е цялата презентация и са три факта, а не характер.',
  ),
  beats: [
    them(
      'Erzählen Sie doch kurz etwas über sich.',
      bi('Do tell me a little about yourself.', 'Разкажете ми накратко за себе си.'),
    ),
    you(
      'sc-apartment-b1-t1',
      bi('Give the facts that matter to him', 'Кажи фактите, които са важни за него'),
      [
        {
          id: 'sc-apartment-b1-t1-s1',
          instruction: bi(
            'als plus a job takes no article at all: ich arbeite als Krankenpflegerin.',
            '„als“ плюс професия не иска никакъв член: ich arbeite als Krankenpflegerin.',
          ),
          prompt: bi(
            'You are a nurse, three years in the job, on a permanent contract.',
            'Медицинска сестра си, от три години на работа, с безсрочен договор.',
          ),
          answer: 'Ich arbeite seit drei Jahren als Krankenpflegerin und habe einen unbefristeten Vertrag.',
          alternatives: [
            'Ich bin seit drei Jahren Krankenpflegerin und habe einen unbefristeten Vertrag.',
            'Ich arbeite seit drei Jahren als Krankenpflegerin, mein Vertrag ist unbefristet.',
            'Seit drei Jahren arbeite ich als Krankenpflegerin und habe einen unbefristeten Vertrag.',
            'Seit drei Jahren bin ich Krankenpflegerin und habe einen unbefristeten Vertrag.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-arbeiten', 'v-als', 'v-befristet'],
          traps: [
            {
              answer: 'Ich arbeite seit drei Jahren als eine Krankenpflegerin und habe einen unbefristeten Vertrag.',
              category: 'article',
              feedback: bi(
                'No article after als for a job: ich arbeite als Krankenpflegerin, er ist Lehrer, sie arbeitet als Ingenieurin.',
                'Няма член след „als“ за професия: ich arbeite als Krankenpflegerin, er ist Lehrer, sie arbeitet als Ingenieurin.',
              ),
            },
          ],
          hints: [
            bi('seit + dative for how long, als + bare job.', '„seit“ + дателен падеж за откога, „als“ + професия без член.'),
            bi('Ich arbeite seit drei Jahren a__ Krankenpflegerin …', 'Ich arbeite seit drei Jahren a__ Krankenpflegerin …'),
          ],
        },
      ],
      'b1',
    ),
    them('Und wie viele Personen würden einziehen?', bi('And how many people would be moving in?', 'И колко души биха се нанесли?')),
    you(
      'sc-apartment-b1-t2',
      bi('Say how many of you there are', 'Кажи колко сте'),
      [
        {
          id: 'sc-apartment-b1-t2-s1',
          instruction: bi(
            '"zu zweit" is the set phrase for a party of two — not "wir sind zwei Personen", which counts you like furniture.',
            '„zu zweit“ е устойчивата фраза за двама — не „wir sind zwei Personen“, което те брои като мебели.',
          ),
          prompt: bi('You and your husband.', 'Ти и съпругът ти.'),
          answer: 'Wir sind zu zweit, mein Mann und ich.',
          alternatives: ['Wir sind zu zweit.', 'Nur wir zwei, mein Mann und ich.'],
          shape: 'sentence',
          reviewTargets: ['v-der-mann'],
          hints: [
            bi('zu + the number with -t.', '„zu“ + числото с „-t“.'),
            bi('Wir sind zu z_____, mein Mann und ich.', 'Wir sind zu z_____, mein Mann und ich.'),
          ],
        },
      ],
      'b1',
    ),
    them('Gut. Haben Sie noch Fragen?', bi('Good. Do you have any questions?', 'Добре. Имате ли въпроси?')),
    you(
      'sc-apartment-b1-t3',
      bi('Ask what the extra costs include', 'Попитай какво включват допълнителните разходи'),
      [
        {
          id: 'sc-apartment-b1-t3-s1',
          instruction: bi(
            'enthalten sein in is the phrase for what a price covers, and in takes the dative here.',
            '„enthalten sein in“ е фразата за това, което цената покрива, а „in“ тук иска дателен падеж.',
          ),
          prompt: bi('Ask what is included in the additional costs.', 'Попитай какво е включено в допълнителните разходи.'),
          answer: 'Was ist in den Nebenkosten enthalten?',
          alternatives: [
            'Was ist alles in den Nebenkosten enthalten?',
            'Welche Kosten sind in den Nebenkosten enthalten?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-die-nebenkosten'],
          hints: [
            bi('Nebenkosten is plural, so the dative article is den.', '„Nebenkosten“ е в мн. ч., затова дателният член е „den“.'),
            bi('Was ist in d__ Nebenkosten enthalten?', 'Was ist in d__ Nebenkosten enthalten?'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Heizung, Wasser und Müll. Strom läuft separat über Ihren eigenen Vertrag.',
      bi('Heating, water and rubbish. Electricity runs separately on your own contract.', 'Отопление, вода и боклук. Токът върви отделно по Ваш собствен договор.'),
    ),
    you(
      'sc-apartment-b1-t4',
      bi('Ask about the end-of-year bill', 'Попитай за изравняването в края на годината'),
      [
        {
          id: 'sc-apartment-b1-t4-s1',
          instruction: bi(
            'Nachzahlung is the bill that arrives when your monthly advance turned out to be too small. It is normal, annual, and worth knowing about before you sign.',
            '„Nachzahlung“ е сметката, която идва, когато месечният аванс се окаже малък. Нормална е, годишна е и е добре да знаеш за нея, преди да подпишеш.',
          ),
          prompt: bi(
            'Ask whether there is usually a top-up payment at the end of the year.',
            'Попитай дали обикновено има доплащане в края на годината.',
          ),
          answer: 'Gibt es am Jahresende normalerweise eine Nachzahlung?',
          alternatives: [
            'Gibt es am Jahresende eine Nachzahlung?',
            'Kommt am Jahresende meistens eine Nachzahlung?',
          ],
          shape: 'sentence',
          hints: [
            bi('es gibt + accusative.', '„es gibt“ + винителен падеж.'),
            bi('G___ es am Jahresende normalerweise eine Nachzahlung?', 'G___ es am Jahresende normalerweise eine Nachzahlung?'),
          ],
        },
      ],
      'b1',
    ),
  ],
});

const APARTMENT_B2 = script({
  id: 'sc-apartment-b2',
  scenarioId: 'sc-apartment',
  level: 'b2',
  register: 'Sie',
  partner: bi('the property management', 'домоуправлението'),
  goal: bi(
    'You have reported the mould twice. Get a date, and put it on the record.',
    'Съобщил си за мухъла два пъти. Вземи дата и го запиши официално.',
  ),
  lessonIds: ['b2-u4-l2'],
  outro: bi(
    'Everything that makes this work is B2 machinery: wegen with the genitive, a deadline expressed as bis Ende des Monats, and a closing sentence that records the conversation without threatening anybody.',
    'Всичко, което го прави успешно, е B2 механика: „wegen“ с родителен падеж, срок, изразен като „bis Ende des Monats“, и заключително изречение, което записва разговора, без да заплашва никого.',
  ),
  beats: [
    narrator(
      bi(
        'Mould in the bedroom corner, growing since February. You have called twice and nothing has come of it.',
        'Мухъл в ъгъла на спалнята, расте от февруари. Обаждал си се два пъти и нищо не е станало.',
      ),
    ),
    them('Hausverwaltung Berger, guten Tag.', bi('Berger property management, hello.', 'Домоуправление „Бергер“, добър ден.')),
    you(
      'sc-apartment-b2-t1',
      bi('Say what this is about, and that it is not the first time', 'Кажи за какво се обаждаш и че не е за пръв път'),
      [
        {
          id: 'sc-apartment-b2-t1-s1',
          instruction: bi(
            'wegen takes the genitive: wegen des Schimmels. The -s on the masculine noun is part of the case, not a plural.',
            '„wegen“ иска родителен падеж: wegen des Schimmels. Окончанието „-s“ при мъжкия род е част от падежа, не множествено число.',
          ),
          prompt: bi(
            'You are calling about the mould, and you have reported it twice already.',
            'Обаждаш се за мухъла и вече си съобщил два пъти.',
          ),
          answer: 'Ich rufe wegen des Schimmels an. Ich habe den Mangel bereits zweimal gemeldet.',
          alternatives: [
            'Ich rufe wegen des Schimmels in der Wohnung an. Ich habe den Mangel bereits zweimal gemeldet.',
            'Es geht um den Schimmel in der Wohnung. Ich habe den Mangel bereits zweimal gemeldet.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-der-schimmel', 'v-der-mangel', 'v-anrufen'],
          traps: [
            {
              answer: 'Ich rufe wegen dem Schimmel an. Ich habe den Mangel bereits zweimal gemeldet.',
              category: 'case',
              feedback: bi(
                'You will hear "wegen dem" constantly in speech, and it is exactly what a written complaint should not contain. Written German keeps the genitive: wegen des Schimmels.',
                'Ще чуваш „wegen dem“ постоянно в говора и точно това не бива да стои в писмено оплакване. Писменият немски пази родителния падеж: wegen des Schimmels.',
              ),
            },
          ],
          hints: [
            bi('wegen + genitive, and der Schimmel takes -s.', '„wegen“ + родителен падеж, а „der Schimmel“ получава „-s“.'),
            bi('Ich rufe wegen d__ Schimmel_ an.', 'Ich rufe wegen d__ Schimmel_ an.'),
          ],
        },
      ],
      'b2',
    ),
    them(
      'Da ist bei uns wohl etwas untergegangen. Ich sehe im System nach.',
      bi('Something must have got lost at our end. I will check the system.', 'Явно нещо ни се е изгубило. Ще проверя в системата.'),
    ),
    you(
      'sc-apartment-b2-t2',
      bi('Ask for it to be fixed by a date', 'Поискай да бъде отстранено до определена дата'),
      [
        {
          id: 'sc-apartment-b2-t2-s1',
          instruction: bi(
            '"Ich bitte Sie, … zu …" is the formal request that does not sound like begging or like a threat. The deadline uses bis plus a genitive phrase.',
            '„Ich bitte Sie, … zu …“ е официалната молба, която не звучи нито като молене, нито като заплаха. Срокът използва „bis“ плюс израз в родителен падеж.',
          ),
          prompt: bi('Ask him to have the defect fixed by the end of the month.', 'Помоли повредата да бъде отстранена до края на месеца.'),
          answer: 'Ich bitte Sie, den Mangel bis Ende des Monats zu beheben.',
          alternatives: [
            'Ich bitte Sie, den Schaden bis Ende des Monats zu beheben.',
            'Ich möchte Sie bitten, den Mangel bis Ende des Monats zu beheben.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-beheben', 'v-die-frist'],
          traps: [
            {
              answer: 'Ich bitte Sie, den Mangel bis Ende des Monats beheben.',
              category: 'missing-word',
              feedback: bi(
                'An infinitive in this construction needs zu in front of it: … zu beheben.',
                'Инфинитивът в тази конструкция иска „zu“ пред себе си: … zu beheben.',
              ),
            },
          ],
          hints: [
            bi('The infinitive at the end needs zu.', 'Инфинитивът накрая иска „zu“.'),
            bi('Ich bitte Sie, den Mangel bis Ende des Monats z_ beheben.', 'Ich bitte Sie, den Mangel bis Ende des Monats z_ beheben.'),
          ],
        },
      ],
      'b2',
    ),
    them(
      'Wir versuchen, bis dahin einen Handwerker zu bekommen. Versprechen kann ich es nicht.',
      bi('We will try to get a tradesman by then. I cannot promise it.', 'Ще опитаме да намерим майстор дотогава. Не мога да обещая.'),
    ),
    you(
      'sc-apartment-b2-t3',
      bi('Put it in writing without making a threat', 'Запиши го писмено, без да заплашваш'),
      [
        {
          id: 'sc-apartment-b2-t3-s1',
          instruction: bi(
            'damit introduces a purpose and sends its verb to the end. It is what turns "I will write this down" from a threat into an administrative courtesy.',
            '„damit“ въвежда цел и изпраща глагола накрая. Точно то превръща „ще го запиша“ от заплаха в административна любезност.',
          ),
          prompt: bi(
            'Say you will confirm this in writing so that both of you have the same record.',
            'Кажи, че ще го потвърдиш писмено, за да имате и двамата еднакво записано.',
          ),
          answer: 'Ich fasse das noch einmal schriftlich zusammen, damit wir beide denselben Stand haben.',
          alternatives: [
            'Ich schicke Ihnen das noch einmal schriftlich, damit wir beide denselben Stand haben.',
            'Ich halte das noch einmal schriftlich fest, damit wir beide denselben Stand haben.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-zusammenfassen', 'v-das-schreiben'],
          hints: [
            bi('The damit-clause ends with its verb.', 'Частта с „damit“ завършва с глагола си.'),
            bi('…, damit wir beide denselben Stand h_____.', '…, damit wir beide denselben Stand h_____.'),
          ],
        },
      ],
      'b2',
    ),
    them('Das ist in Ordnung. Ich melde mich diese Woche.', bi('That is fine. I will be in touch this week.', 'Добре. Ще се свържа тази седмица.')),
    you(
      'sc-apartment-b2-t4',
      bi('Close it', 'Затвори разговора'),
      [
        {
          id: 'sc-apartment-b2-t4-s1',
          instruction: bi(
            'Thanking somebody for their trouble is what keeps a complaint from becoming a relationship problem with the person who controls your heating.',
            'Благодарността за усилието е това, което спира оплакването да се превърне в проблем с човека, който управлява отоплението ти.',
          ),
          prompt: bi('Thank him and say you look forward to hearing from him.', 'Благодари му и кажи, че очакваш да се чуете.'),
          answer: 'Vielen Dank, ich warte auf Ihre Rückmeldung.',
          alternatives: [
            'Vielen Dank, ich warte auf Ihre Nachricht.',
            'Danke, dann warte ich auf Ihre Rückmeldung.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-sich-melden'],
          hints: [bi('warten auf + accusative.', '„warten auf“ + винителен падеж.')],
        },
      ],
      'b2',
    ),
  ],
});

const NEIGHBOURS_A1 = script({
  id: 'sc-neighbours-a1',
  scenarioId: 'sc-neighbours',
  level: 'a1',
  register: 'Sie',
  partner: bi('the woman from the ground floor', 'жената от партера'),
  goal: bi('Meet a neighbour on the stairs and introduce yourself.', 'Срещни съседка на стълбите и се представи.'),
  outro: bi(
    'Three sentences and you are a person rather than "the new people in number four". In a German building that is worth more than it sounds.',
    'Три изречения и вече си човек, а не „новите от номер четири“. В немска кооперация това струва повече, отколкото звучи.',
  ),
  beats: [
    them('Guten Tag! Sie sind neu hier, oder?', bi('Hello! You are new here, aren’t you?', 'Добър ден! Нов сте тук, нали?')),
    you(
      'sc-neighbours-a1-t1',
      bi('Confirm and say where you live', 'Потвърди и кажи къде живееш'),
      [
        {
          id: 'sc-neighbours-a1-t1-s1',
          instruction: bi(
            'A floor takes in + dative: im zweiten Stock.',
            'Етажът иска „in“ + дателен падеж: im zweiten Stock.',
          ),
          prompt: bi('Yes — you are Maria, on the second floor.', 'Да — ти си Мария, на втория етаж.'),
          answer: 'Ja, guten Tag. Ich bin Maria, ich wohne im zweiten Stock.',
          alternatives: [
            'Ja, ich bin Maria. Ich wohne im zweiten Stock.',
            'Ja, guten Tag. Ich heiße Maria und wohne im zweiten Stock.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-wohnen', 'v-der-stock'],
          hints: [
            bi('in + dem becomes im.', '„in“ + „dem“ става „im“.'),
            bi('… ich wohne i_ zweiten Stock.', '… ich wohne i_ zweiten Stock.'),
          ],
        },
      ],
      'a1',
    ),
    them(
      'Schön! Ich bin Frau Kessler, aus dem Erdgeschoss.',
      bi('Lovely! I am Mrs Kessler, from the ground floor.', 'Чудесно! Аз съм госпожа Кеслер, от партера.'),
      {
        note: bi(
          'Germans introduce themselves to a neighbour by surname with Frau or Herr. First names come later, if at all.',
          'Германците се представят на съсед с фамилията и „Frau“ или „Herr“. Малките имена идват по-късно, ако изобщо.',
        ),
      },
    ),
    you(
      'sc-neighbours-a1-t2',
      bi('Say you are pleased to meet her', 'Кажи, че ти е приятно'),
      [
        {
          id: 'sc-neighbours-a1-t2-s1',
          instruction: bi(
            'The full sentence is "es freut mich", and everyone drops the first two words.',
            'Пълното изречение е „es freut mich“, а всички изпускат първите две думи.',
          ),
          prompt: bi('Say it is nice to meet her.', 'Кажи, че ти е приятно да се запознаете.'),
          answer: 'Freut mich!',
          alternatives: ['Sehr erfreut!', 'Es freut mich!', 'Freut mich, Frau Kessler!'],
          shape: 'phrase',
          hints: [bi('Two words.', 'Две думи.')],
        },
      ],
      'a1',
    ),
    them(
      'Wenn Sie etwas brauchen, klingeln Sie einfach.',
      bi('If you need anything, just ring the bell.', 'Ако Ви трябва нещо, просто позвънете.'),
    ),
    you(
      'sc-neighbours-a1-t3',
      bi('Thank her', 'Благодари ѝ'),
      [
        {
          id: 'sc-neighbours-a1-t3-s1',
          prompt: bi('Say that is very kind.', 'Кажи, че е много мило.'),
          answer: 'Danke, das ist sehr nett!',
          alternatives: ['Vielen Dank, das ist sehr nett!', 'Danke, das ist sehr freundlich!'],
          shape: 'sentence',
          reviewTargets: ['v-nett'],
          traps: [registerTrap('Danke dir, das ist sehr nett!', 'Sie')],
          hints: [bi('"That is very nice" — with the German word for nice.', '„Това е много мило“ — с немската дума за мило.')],
        },
      ],
      'a1',
    ),
  ],
});

const NEIGHBOURS_A2 = script({
  id: 'sc-neighbours-a2',
  scenarioId: 'sc-neighbours',
  level: 'a2',
  register: 'du',
  partner: bi('Jonas from the flat opposite', 'Йонас от отсрещния апартамент'),
  goal: bi('Take in a parcel for the neighbour your own age.', 'Приеми колет за съседа на твоята възраст.'),
  outro: bi(
    'The register changed and nothing else did. Same building, same politeness, different pronoun — and the only thing that decided it was that he opened with du.',
    'Регистърът се смени и нищо друго. Същата сграда, същата учтивост, друго местоимение — и единственото, което го реши, беше, че той започна с „du“.',
  ),
  beats: [
    narrator(
      bi(
        'The man from the flat opposite, roughly your age, catches you at the letterboxes. He opens with du, so du it is.',
        'Мъжът от отсрещния апартамент, горе-долу на твоята възраст, те хваща при пощенските кутии. Започва с „du“, значи е „du“.',
      ),
    ),
    them('Hey! Kannst du kurz ein Paket für mich annehmen?', bi('Hey! Could you take in a parcel for me?', 'Ей! Можеш ли да приемеш един колет за мен?')),
    you(
      'sc-neighbours-a2-t1',
      bi('Agree, informally', 'Съгласи се, неофициално'),
      [
        {
          id: 'sc-neighbours-a2-t1-s1',
          instruction: bi(
            'klar is the everyday yes between people who say du to each other. It is not slang and it is not rude.',
            '„klar“ е всекидневното „да“ между хора, които си говорят на „du“. Не е жаргон и не е грубо.',
          ),
          prompt: bi('Yes, no problem.', 'Да, няма проблем.'),
          answer: 'Klar, kein Problem.',
          alternatives: ['Ja klar, kein Problem.', 'Klar, mache ich.'],
          shape: 'phrase',
          reviewTargets: ['v-das-problem'],
          traps: [registerTrap('Selbstverständlich, sehr gern geschehen.', 'du')],
          hints: [bi('Two words, both short.', 'Две думи, и двете къси.')],
        },
      ],
      'a2',
    ),
    them('Super, danke! Ich bin bis sechs weg.', bi('Great, thanks! I am out until six.', 'Супер, благодаря! Няма ме до шест.')),
    you(
      'sc-neighbours-a2-t2',
      bi('Tell him when you are in', 'Кажи му кога си вкъщи'),
      [
        {
          id: 'sc-neighbours-a2-t2-s1',
          instruction: bi(
            'zu Hause means at home, and it never takes an article.',
            '„zu Hause“ значи вкъщи и никога не иска член.',
          ),
          prompt: bi('You are home all afternoon.', 'Вкъщи си цял следобед.'),
          answer: 'Alles klar, ich bin den ganzen Nachmittag zu Hause.',
          alternatives: [
            'Alles klar, ich bin heute Nachmittag zu Hause.',
            'Kein Problem, ich bin den ganzen Nachmittag da.',
            'Ich bin den ganzen Nachmittag zu Hause.',
            'Ich bin heute Nachmittag zu Hause.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-zu-hause'],
          hints: [
            bi('A stretch of time takes the accusative: den ganzen Nachmittag.', 'Отрязък от време иска винителен падеж: den ganzen Nachmittag.'),
            bi('… ich bin d__ ganzen Nachmittag zu Hause.', '… ich bin d__ ganzen Nachmittag zu Hause.'),
          ],
        },
      ],
      'a2',
    ),
    narrator(
      bi('At half past three the courier rings. You sign and put the parcel in your hallway.', 'В три и половина куриерът звъни. Подписваш и слагаш колета в антрето.'),
    ),
    you(
      'sc-neighbours-a2-t3',
      bi('Write him a note for his door', 'Напиши му бележка за вратата'),
      [
        {
          id: 'sc-neighbours-a2-t3-s1',
          instruction: bi(
            'A note keeps the du and drops everything it can: no greeting formula, no full sentences where a short one does.',
            'Бележката запазва „du“ и изхвърля всичко излишно: без формули за поздрав, без пълни изречения, където стига късо.',
          ),
          prompt: bi(
            'Write that the parcel is at yours and he can come by any time.',
            'Напиши, че колетът е при теб и може да мине по всяко време.',
          ),
          answer: 'Dein Paket ist bei mir. Komm einfach vorbei!',
          alternatives: [
            'Hallo Jonas, dein Paket ist bei mir. Komm einfach vorbei!',
            'Dein Paket liegt bei mir. Komm einfach vorbei!',
            'Jonas, dein Paket ist bei mir. Komm einfach vorbei!',
          ],
          shape: 'sentence',
          reviewTargets: ['v-vorbeikommen'],
          traps: [
            {
              answer: 'Dein Paket ist bei mir. Kommen Sie einfach vorbei!',
              category: 'pronoun',
              feedback: bi(
                'Half the note is in du and half in Sie. Once you are on du with somebody, the imperative loses its pronoun entirely: komm.',
                'Половината бележка е на „du“, половината на „Sie“. Щом си на „du“ с някого, повелителното наклонение изпуска местоимението напълно: komm.',
              ),
            },
          ],
          hints: [
            bi('The du-imperative is the verb stem, with no pronoun.', 'Повелителното за „du“ е основата на глагола, без местоимение.'),
            bi('… K____ einfach vorbei!', '… K____ einfach vorbei!'),
          ],
        },
      ],
      'a2',
    ),
    them('Mega, danke dir! Ich klingel gleich.', bi('Brilliant, thanks! I will ring in a minute.', 'Супер, благодаря ти! Ще звънна след малко.')),
    you(
      'sc-neighbours-a2-t4',
      bi('Say it was nothing', 'Кажи, че няма нищо'),
      [
        {
          id: 'sc-neighbours-a2-t4-s1',
          prompt: bi('Tell him it was no trouble.', 'Кажи му, че не е проблем.'),
          answer: 'Gern, kein Ding!',
          alternatives: ['Gern geschehen!', 'Kein Ding!', 'Gern, jederzeit!'],
          shape: 'phrase',
          hints: [
            bi('"Kein Ding" is the informal "no worries" — save it for du.', '„Kein Ding“ е неофициалното „няма проблем“ — пази го за „du“.'),
          ],
        },
      ],
      'a2',
    ),
  ],
});

const NEIGHBOURS_B1 = script({
  id: 'sc-neighbours-b1',
  scenarioId: 'sc-neighbours',
  level: 'b1',
  register: 'Sie',
  partner: bi('the neighbour upstairs', 'съседът отгоре'),
  goal: bi(
    'Raise the noise problem in a way that leaves you still able to share a stairwell.',
    'Повдигни проблема с шума така, че пак да можете да делите едно стълбище.',
  ),
  outro: bi(
    'Notice what this never did: it never said the word Hausordnung and never mentioned the police. The ask was one small favour for next time, which is the version people actually agree to.',
    'Забележи какво не направи този разговор: не каза думата „Hausordnung“ и не спомена полиция. Молбата беше една малка услуга за следващия път — версията, с която хората наистина се съгласяват.',
  ),
  beats: [
    narrator(
      bi(
        'Saturday night, music until two. You are at his door on Sunday afternoon, which is late enough to be calm and soon enough to matter.',
        'Събота вечер, музика до два. В неделя следобед си пред вратата му — достатъчно късно, за да си спокоен, и достатъчно скоро, за да има смисъл.',
      ),
    ),
    them('Ja bitte?', bi('Yes?', 'Да, моля?')),
    you(
      'sc-neighbours-b1-t1',
      bi('Open softly and name the subject', 'Започни меко и назови темата'),
      [
        {
          id: 'sc-neighbours-b1-t1-s1',
          instruction: bi(
            'wollte — the past of wollen — is the standard softener for raising something: "I wanted to", not "I want to".',
            '„wollte“ — миналото на „wollen“ — е стандартният смекчител при повдигане на тема: „исках да“, а не „искам да“.',
          ),
          prompt: bi(
            'Apologise for disturbing him, and say you wanted to talk about the music.',
            'Извини се за безпокойството и кажи, че си искал да поговорите за музиката.',
          ),
          answer: 'Entschuldigen Sie die Störung. Ich wollte kurz wegen der Musik mit Ihnen sprechen.',
          alternatives: [
            'Entschuldigung, ich wollte kurz wegen der Musik mit Ihnen sprechen.',
            'Entschuldigen Sie die Störung. Ich wollte kurz mit Ihnen über die Musik sprechen.',
          ],
          shape: 'sentence',
          reviewTargets: ['v-der-laerm', 'v-musik'],
          traps: [
            {
              answer: 'Entschuldigen Sie die Störung. Ich will kurz wegen der Musik mit Ihnen sprechen.',
              category: 'verb-tense',
              feedback: bi(
                'The present "ich will" makes it a demand. German softens exactly this with the past: ich wollte.',
                'Сегашното „ich will“ го прави искане. Немският смекчава точно това с миналото: ich wollte.',
              ),
            },
          ],
          hints: [
            bi('Past tense of wollen.', 'Минало време на „wollen“.'),
            bi('Ich w_____ kurz wegen der Musik mit Ihnen sprechen.', 'Ich w_____ kurz wegen der Musik mit Ihnen sprechen.'),
          ],
        },
      ],
      'b1',
    ),
    them('Oh. War es zu laut?', bi('Oh. Was it too loud?', 'О. Твърде силно ли беше?')),
    you(
      'sc-neighbours-b1-t2',
      bi('Say yes, with the detail that makes it real', 'Кажи „да“ с детайла, който го прави реално'),
      [
        {
          id: 'sc-neighbours-b1-t2-s1',
          instruction: bi(
            'man hört is the impersonal "you can hear" — it reports a fact about the building rather than an accusation about him.',
            '„man hört“ е безличното „чува се“ — съобщава факт за сградата, а не обвинение към него.',
          ),
          prompt: bi(
            'Say that after ten you could hear it clearly at yours.',
            'Кажи, че след десет се е чувало ясно при вас.',
          ),
          answer: 'Ehrlich gesagt ja, nach zehn hat man es bei uns deutlich gehört.',
          alternatives: [
            'Ehrlich gesagt ja, nach zweiundzwanzig Uhr hat man es bei uns deutlich gehört.',
            'Ja, nach zehn konnte man es bei uns deutlich hören.',
          ],
          shape: 'sentence',
          hints: [
            bi('Start with the honest-to-say phrase, then the fact.', 'Започни с фразата „честно казано“, после фактът.'),
            bi('Ehrlich gesagt ja, nach zehn h__ man es bei uns deutlich gehört.', 'Ehrlich gesagt ja, nach zehn h__ man es bei uns deutlich gehört.'),
          ],
        },
      ],
      'b1',
    ),
    them(
      'Das tut mir wirklich leid. Das war der Geburtstag meiner Tochter.',
      bi('I am really sorry. It was my daughter’s birthday.', 'Наистина съжалявам. Беше рожденият ден на дъщеря ми.'),
    ),
    you(
      'sc-neighbours-b1-t3',
      bi('Let it go, then ask for one small thing', 'Остави го и поискай едно малко нещо'),
      [
        {
          id: 'sc-neighbours-b1-t3-s1',
          instruction: bi(
            'Bescheid sagen — to let somebody know — is one of the most useful fixed phrases in German, and Bescheid always takes a capital.',
            '„Bescheid sagen“ — да предупредиш някого — е една от най-полезните устойчиви фрази в немския, а „Bescheid“ винаги е с главна буква.',
          ),
          prompt: bi(
            'Say it happens, and ask him to let you know next time.',
            'Кажи, че се случва, и го помоли следващия път да те предупреди.',
          ),
          answer: 'Kein Problem, das kann passieren. Könnten Sie beim nächsten Mal kurz Bescheid sagen?',
          alternatives: [
            'Das kann passieren. Könnten Sie beim nächsten Mal kurz Bescheid sagen?',
            'Kein Problem. Sagen Sie beim nächsten Mal einfach kurz Bescheid?',
          ],
          shape: 'sentence',
          reviewTargets: ['v-bescheid-sagen', 'v-passieren'],
          hints: [
            bi('Konjunktiv II of können for the request.', 'Konjunktiv II на „können“ за молбата.'),
            bi('K_______ Sie beim nächsten Mal kurz Bescheid sagen?', 'K_______ Sie beim nächsten Mal kurz Bescheid sagen?'),
          ],
        },
      ],
      'b1',
    ),
    them('Mache ich, versprochen.', bi('I will, promise.', 'Ще го направя, обещавам.')),
    you(
      'sc-neighbours-b1-t4',
      bi('Leave on good terms', 'Тръгни си в добри отношения'),
      [
        {
          id: 'sc-neighbours-b1-t4-s1',
          prompt: bi('Thank him and wish him a good rest of the Sunday.', 'Благодари му и му пожелай приятна останала неделя.'),
          answer: 'Danke, dann noch einen schönen Sonntag!',
          alternatives: ['Vielen Dank, noch einen schönen Sonntag!', 'Danke, schönen Sonntag noch!'],
          shape: 'sentence',
          reviewTargets: ['v-sonntag'],
          hints: [bi('"einen schönen Sonntag" — accusative, because it is a wish you are giving.', '„einen schönen Sonntag“ — винителен падеж, защото е пожелание, което даваш.')],
        },
      ],
      'b1',
    ),
  ],
});

export const HOME_SCRIPTS: ScenarioScript[] = [
  APARTMENT_A2,
  APARTMENT_B1,
  APARTMENT_B2,
  NEIGHBOURS_A1,
  NEIGHBOURS_A2,
  NEIGHBOURS_B1,
];
