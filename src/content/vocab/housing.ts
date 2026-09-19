import type { VocabEntry } from '../types.ts';

/**
 * Finding and renting a flat (B1 Unit 1).
 *
 * B1 is where the course stops teaching German and starts teaching Germany.
 * Nothing here is vocabulary for its own sake: every word below appears in a
 * real flat advertisement, a real rental contract or a real conversation with
 * a landlord, and several of them have no equivalent in English or Bulgarian
 * at all — *Kaution*, *Nebenkosten*, *Kaltmiete* and *Hausordnung* are legal
 * objects in Germany before they are words.
 *
 * The rooms themselves — Wohnung, Küche, Bad, Schlafzimmer, Fenster, Heizung —
 * were learnt at A1 and are not taught again. What is new is everything that
 * happens *around* a flat: looking at one, paying for one, and complaining
 * about one.
 *
 * The adjectives are chosen for the grammar they are about to carry. A flat ad
 * is the densest source of adjective-before-noun in everyday German — "helle
 * 3-Zimmer-Wohnung mit großem Balkon" — which is why *hell*, *dunkel* and
 * *möbliert* arrive one lesson before the endings that decline them, and join
 * the *ruhig*, *groß* and *teuer* the learner already owns.
 */

const U = 'b1-u1';
const L1 = 'b1-u1-l1';
const L2 = 'b1-u1-l2';
const L3 = 'b1-u1-l3';

/* ------------------------------------------------------------------ *
 * Lesson 1 — the advertisement and the viewing
 * ------------------------------------------------------------------ */

const SEARCHING: VocabEntry[] = [
  {
    id: 'v-die-anzeige',
    german: 'Anzeige',
    display: 'die Anzeige',
    article: 'die',
    gender: 'f',
    plural: 'die Anzeigen',
    wordType: 'noun',
    translation: { en: 'advertisement, listing', bg: 'обява' },
    pronunciation: { en: 'AN-tsy-guh', bg: 'АН-цай-ге' },
    example: {
      de: 'Ich habe die Anzeige im Internet gefunden.',
      gloss: {
        en: 'I found the listing on the internet.',
        bg: 'Намерих обявата в интернет.',
      },
    },
    tags: ['housing'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    collocations: [
      { de: 'auf eine Anzeige antworten', gloss: { en: 'to answer a listing', bg: 'да отговоря на обява' } },
    ],
  },
  {
    id: 'v-die-besichtigung',
    german: 'Besichtigung',
    display: 'die Besichtigung',
    article: 'die',
    gender: 'f',
    plural: 'die Besichtigungen',
    wordType: 'noun',
    translation: { en: 'viewing', bg: 'оглед' },
    pronunciation: { en: 'buh-ZIKH-ti-goong', bg: 'бе-ЗИХ-ти-гунг' },
    example: {
      de: 'Die Besichtigung ist am Samstag um zehn.',
      gloss: {
        en: 'The viewing is on Saturday at ten.',
        bg: 'Огледът е в събота в десет.',
      },
    },
    tags: ['housing'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-besichtigen'],
    notes: {
      en: 'In a German city a viewing is often a group event with twenty other applicants, not a private appointment. "Massenbesichtigung" is a real word people use with a sigh.',
      bg: 'В немските градове огледът често е групово събитие с още двайсет кандидати, а не личен час. „Massenbesichtigung“ е истинска дума, която хората казват с въздишка.',
    },
  },
  {
    id: 'v-besichtigen',
    german: 'besichtigen',
    display: 'besichtigen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'besichtigt' },
    translation: { en: 'to view, to look round', bg: 'оглеждам, разглеждам' },
    pronunciation: { en: 'buh-ZIKH-ti-gen', bg: 'бе-ЗИХ-ти-ген' },
    example: {
      de: 'Wir haben gestern drei Wohnungen besichtigt.',
      gloss: {
        en: 'We viewed three flats yesterday.',
        bg: 'Вчера огледахме три апартамента.',
      },
    },
    tags: ['housing'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    related: ['v-die-besichtigung'],
    notes: {
      en: 'No ge- in the participle: verbs beginning be- never take one. besichtigt, not *gebesichtigt*.',
      bg: 'Няма ge- в причастието: глаголите, започващи с be-, никога не взимат. besichtigt, не *gebesichtigt*.',
    },
  },
  {
    id: 'v-der-quadratmeter',
    german: 'Quadratmeter',
    display: 'der Quadratmeter',
    article: 'der',
    gender: 'm',
    plural: 'die Quadratmeter',
    wordType: 'noun',
    translation: { en: 'square metre', bg: 'квадратен метър' },
    pronunciation: { en: 'kva-DRAHT-may-ter', bg: 'ква-ДРАТ-ме-тер' },
    example: {
      de: 'Die Wohnung hat sechzig Quadratmeter.',
      gloss: {
        en: 'The flat is sixty square metres.',
        bg: 'Апартаментът е шейсет квадратни метра.',
      },
    },
    tags: ['housing'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    notes: {
      en: 'Written m² in every advertisement and said "Quadratmeter" out loud. The plural is identical to the singular, so "sechzig Quadratmeter" has no ending.',
      bg: 'Пише се m² във всяка обява и се казва „Quadratmeter“ на глас. Множественото число е същото като единственото, затова „sechzig Quadratmeter“ няма окончание.',
    },
  },
  {
    id: 'v-hell',
    german: 'hell',
    display: 'hell',
    wordType: 'adjective',
    translation: { en: 'bright, light', bg: 'светъл' },
    pronunciation: { en: 'hel', bg: 'хел' },
    example: {
      de: 'Das Wohnzimmer ist sehr hell.',
      gloss: { en: 'The living room is very bright.', bg: 'Всекидневната е много светла.' },
    },
    tags: ['housing', 'description'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 1,
    related: ['v-dunkel'],
  },
  {
    id: 'v-dunkel',
    german: 'dunkel',
    display: 'dunkel',
    wordType: 'adjective',
    translation: { en: 'dark', bg: 'тъмен' },
    pronunciation: { en: 'DOON-kel', bg: 'ДУН-кел' },
    example: {
      de: 'Die Küche ist leider dunkel.',
      gloss: { en: 'The kitchen is unfortunately dark.', bg: 'Кухнята за съжаление е тъмна.' },
    },
    tags: ['housing', 'description'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 2,
    related: ['v-hell'],
    notes: {
      en: 'The -e- disappears when an ending is added: ein dunkles Zimmer, not *ein dunkeles Zimmer*. teuer does the same — ein teures Zimmer.',
      bg: 'Едно -e- изчезва, когато се добави окончание: ein dunkles Zimmer, не *ein dunkeles Zimmer*. teuer прави същото — ein teures Zimmer.',
    },
  },
  {
    id: 'v-moebliert',
    german: 'möbliert',
    display: 'möbliert',
    wordType: 'adjective',
    translation: { en: 'furnished', bg: 'обзаведен' },
    pronunciation: { en: 'mer-BLEERT', bg: 'мьо-БЛИРТ' },
    example: {
      de: 'Wir suchen eine möblierte Wohnung.',
      gloss: { en: 'We are looking for a furnished flat.', bg: 'Търсим обзаведен апартамент.' },
    },
    tags: ['housing'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 3,
    notes: {
      en: 'Worth knowing what it usually does *not* mean: an unfurnished German flat often has no kitchen at all — no cupboards, no cooker, sometimes no sink. "Einbauküche vorhanden" in an advertisement is the line that says otherwise.',
      bg: 'Струва си да знаеш какво обикновено *не* означава: необзаведеният немски апартамент често е без кухня изобщо — без шкафове, без котлони, понякога без мивка. „Einbauküche vorhanden“ в обявата е редът, който казва обратното.',
    },
  },
  {
    id: 'v-der-balkon',
    german: 'Balkon',
    display: 'der Balkon',
    article: 'der',
    gender: 'm',
    plural: 'die Balkone',
    wordType: 'noun',
    translation: { en: 'balcony', bg: 'балкон' },
    pronunciation: { en: 'bal-KOHN', bg: 'бал-КОН' },
    example: {
      de: 'Die Wohnung hat einen großen Balkon.',
      gloss: { en: 'The flat has a big balcony.', bg: 'Апартаментът има голям балкон.' },
    },
    tags: ['housing'],
    level: 'b1',
    unitId: U,
    lessonId: L1,
    difficulty: 1,
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 2 — what it actually costs
 * ------------------------------------------------------------------ */

const CONTRACT: VocabEntry[] = [
  {
    id: 'v-der-mietvertrag',
    german: 'Mietvertrag',
    display: 'der Mietvertrag',
    article: 'der',
    gender: 'm',
    plural: 'die Mietverträge',
    wordType: 'noun',
    translation: { en: 'rental contract, lease', bg: 'договор за наем' },
    pronunciation: { en: 'MEET-fer-trahk', bg: 'МИТ-фер-траг' },
    example: {
      de: 'Ich habe den Mietvertrag noch nicht unterschrieben.',
      gloss: {
        en: 'I have not signed the rental contract yet.',
        bg: 'Още не съм подписал договора за наем.',
      },
    },
    tags: ['housing', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
    related: ['v-die-miete', 'v-unterschreiben'],
    notes: {
      en: 'Miete + Vertrag. German builds words by gluing them together and the last part decides the gender: der Vertrag, so der Mietvertrag. That rule alone will get you the article for hundreds of B1 nouns.',
      bg: 'Miete + Vertrag. Немският слепва думите и последната част решава рода: der Vertrag, значи der Mietvertrag. Само това правило ти дава члена на стотици думи на ниво B1.',
    },
  },
  {
    id: 'v-die-kaution',
    german: 'Kaution',
    display: 'die Kaution',
    article: 'die',
    gender: 'f',
    plural: 'die Kautionen',
    wordType: 'noun',
    translation: { en: 'deposit', bg: 'депозит' },
    pronunciation: { en: 'kow-TSYOHN', bg: 'кау-ЦИОН' },
    example: {
      de: 'Die Kaution beträgt drei Kaltmieten.',
      gloss: {
        en: 'The deposit comes to three months’ base rent.',
        bg: 'Депозитът е в размер на три базови наема.',
      },
    },
    tags: ['housing', 'money'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'Legally capped at three times the Kaltmiete, and you get it back when you move out — minus whatever the landlord decides you damaged. Three months of rent up front is the single largest surprise for anyone moving to Germany.',
      bg: 'По закон е най-много три базови наема и си го получаваш обратно при изнасяне — минус това, което наемодателят реши, че си повредил. Три наема предварително е най-голямата изненада за всеки, който се мести в Германия.',
    },
  },
  {
    id: 'v-die-nebenkosten',
    german: 'Nebenkosten',
    display: 'die Nebenkosten',
    article: 'die',
    gender: 'f',
    plural: 'die Nebenkosten',
    wordType: 'noun',
    translation: { en: 'additional costs, utilities', bg: 'консумативи, допълнителни разходи' },
    pronunciation: { en: 'NAY-ben-kos-ten', bg: 'НЕ-бен-кос-тен' },
    example: {
      de: 'Die Nebenkosten sind in der Miete nicht enthalten.',
      gloss: {
        en: 'The utilities are not included in the rent.',
        bg: 'Консумативите не са включени в наема.',
      },
    },
    tags: ['housing', 'money'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'Plural only — there is no *die Nebenkost*. It covers heating, water, rubbish collection and the caretaker, and once a year a Nebenkostenabrechnung arrives telling you whether you owe more or get some back.',
      bg: 'Само в множествено число — няма *die Nebenkost*. Покрива отопление, вода, боклук и домоуправител, а веднъж годишно идва Nebenkostenabrechnung, която ти казва дали дължиш още, или ще получиш обратно.',
    },
  },
  {
    id: 'v-die-kaltmiete',
    german: 'Kaltmiete',
    display: 'die Kaltmiete',
    article: 'die',
    gender: 'f',
    plural: 'die Kaltmieten',
    wordType: 'noun',
    translation: { en: 'base rent (excluding utilities)', bg: 'базов наем (без консумативи)' },
    pronunciation: { en: 'KALT-mee-tuh', bg: 'КАЛТ-ми-те' },
    example: {
      de: 'Die Kaltmiete ist achthundert Euro.',
      gloss: { en: 'The base rent is eight hundred euros.', bg: 'Базовият наем е осемстотин евро.' },
    },
    tags: ['housing', 'money'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    related: ['v-die-nebenkosten', 'v-die-miete'],
    notes: {
      en: '"Cold rent" is the rent with nothing in it. Warmmiete is Kaltmiete plus Nebenkosten, and it is the number that actually leaves your account. An advertisement almost always shows the smaller one.',
      bg: '„Студен наем“ е наемът без нищо в него. Warmmiete е Kaltmiete плюс Nebenkosten и това е числото, което наистина излиза от сметката ти. Обявата почти винаги показва по-малкото.',
    },
  },
  {
    id: 'v-der-stock',
    german: 'Stock',
    display: 'der Stock',
    article: 'der',
    gender: 'm',
    plural: 'die Stockwerke',
    wordType: 'noun',
    translation: { en: 'floor, storey', bg: 'етаж' },
    pronunciation: { en: 'shtok', bg: 'щок' },
    example: {
      de: 'Die Wohnung liegt im dritten Stock.',
      gloss: { en: 'The flat is on the third floor.', bg: 'Апартаментът е на третия етаж.' },
    },
    tags: ['housing'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'German counts like British English, not American: the ground floor is Erdgeschoss and the first floor above it is der erste Stock. "Third floor" in a German advertisement means four flights of stairs.',
      bg: 'Немският брои като българския: партерът е Erdgeschoss, а първият етаж над него е der erste Stock. „Трети етаж“ в немска обява означава четири стълбища.',
    },
  },
  {
    id: 'v-der-aufzug',
    german: 'Aufzug',
    display: 'der Aufzug',
    article: 'der',
    gender: 'm',
    plural: 'die Aufzüge',
    wordType: 'noun',
    translation: { en: 'lift, elevator', bg: 'асансьор' },
    pronunciation: { en: 'OWF-tsook', bg: 'АУФ-цуг' },
    example: {
      de: 'Das Haus hat leider keinen Aufzug.',
      gloss: { en: 'The building unfortunately has no lift.', bg: 'Сградата за съжаление няма асансьор.' },
    },
    tags: ['housing'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 2,
  },
  {
    id: 'v-unterschreiben',
    german: 'unterschreiben',
    display: 'unterschreiben',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'unterschrieben' },
    translation: { en: 'to sign', bg: 'подписвам' },
    pronunciation: { en: 'oon-ter-SHRY-ben', bg: 'ун-тер-ШРАЙ-бен' },
    example: {
      de: 'Bitte unterschreiben Sie den Vertrag hier.',
      gloss: { en: 'Please sign the contract here.', bg: 'Моля, подпишете договора тук.' },
    },
    tags: ['housing', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L2,
    difficulty: 3,
    notes: {
      en: 'unter + schreiben, "to write underneath", and the unter- does not detach: Ich unterschreibe den Vertrag, never *Ich schreibe den Vertrag unter*. Compare umziehen, which does detach — Ich ziehe um.',
      bg: 'unter + schreiben, „пиша отдолу“, и unter- не се отделя: Ich unterschreibe den Vertrag, никога *Ich schreibe den Vertrag unter*. Сравни с umziehen, което се отделя — Ich ziehe um.',
    },
  },
];

/* ------------------------------------------------------------------ *
 * Lesson 3 — living there, and what goes wrong
 * ------------------------------------------------------------------ */

const LIVING: VocabEntry[] = [
  {
    id: 'v-die-hausverwaltung',
    german: 'Hausverwaltung',
    display: 'die Hausverwaltung',
    article: 'die',
    gender: 'f',
    plural: 'die Hausverwaltungen',
    wordType: 'noun',
    translation: { en: 'property management', bg: 'домоуправление' },
    pronunciation: { en: 'HOWS-fer-val-toong', bg: 'ХАУС-фер-вал-тунг' },
    example: {
      de: 'Ich habe die Hausverwaltung schon zweimal angerufen.',
      gloss: {
        en: 'I have already phoned the property management twice.',
        bg: 'Вече два пъти се обадих на домоуправлението.',
      },
    },
    tags: ['housing'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    related: ['v-der-vermieter'],
    notes: {
      en: 'Often not the same people as the landlord. The Vermieter owns the flat; the Hausverwaltung is the company that answers the phone about it — and they are the ones to write to when the heating fails.',
      bg: 'Често не са същите хора като наемодателя. Vermieter притежава апартамента; Hausverwaltung е фирмата, която вдига телефона за него — и на нея се пише, когато отоплението спре.',
    },
  },
  {
    id: 'v-der-schimmel',
    german: 'Schimmel',
    display: 'der Schimmel',
    article: 'der',
    gender: 'm',
    wordType: 'noun',
    translation: { en: 'mould', bg: 'мухъл' },
    pronunciation: { en: 'SHIM-el', bg: 'ШИ-мел' },
    example: {
      de: 'Im Bad ist Schimmel an der Wand.',
      gloss: { en: 'There is mould on the bathroom wall.', bg: 'В банята има мухъл по стената.' },
    },
    tags: ['housing', 'problem'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'Worth the word: mould is the most common German rental dispute, and the landlord will say you did not ventilate enough. "Lüften" — airing the flat by opening a window wide for ten minutes — is the thing you will be told to do.',
      bg: 'Струва си думата: мухълът е най-честият спор при наем в Германия и наемодателят ще каже, че не си проветрявал достатъчно. „Lüften“ — отваряне на прозореца широко за десет минути — е това, което ще ти кажат да правиш.',
    },
  },
  {
    id: 'v-sich-beschweren',
    german: 'sich beschweren',
    display: 'sich beschweren',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'beschwert' },
    translation: { en: 'to complain', bg: 'оплаквам се' },
    pronunciation: { en: 'zikh buh-SHVAY-ren', bg: 'зих бе-ШВЕ-рен' },
    example: {
      de: 'Ich möchte mich über den Lärm beschweren.',
      gloss: {
        en: 'I would like to complain about the noise.',
        bg: 'Бих искал да се оплача от шума.',
      },
    },
    tags: ['housing', 'problem'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: 'Reflexive, and the thing complained about takes über + accusative: sich über etwas beschweren. Not *von* — that is the mistake to expect.',
      bg: 'Възвратен, а това, от което се оплакваш, идва с über + винителен: sich über etwas beschweren. Не *von* — това е грешката, която се очаква.',
    },
  },
  {
    id: 'v-kuendigen',
    german: 'kündigen',
    display: 'kündigen',
    wordType: 'verb',
    perfect: { auxiliary: 'haben', participle: 'gekündigt' },
    translation: { en: 'to give notice, to terminate', bg: 'прекратявам, предизвестявам' },
    pronunciation: { en: 'KUEN-di-gen', bg: 'КЮН-ди-ген' },
    example: {
      de: 'Ich muss die Wohnung drei Monate vorher kündigen.',
      gloss: {
        en: 'I have to give three months’ notice on the flat.',
        bg: 'Трябва да предизвестя за апартамента три месеца по-рано.',
      },
    },
    tags: ['housing', 'paperwork'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 4,
    notes: {
      en: 'The same verb for ending a tenancy and ending a job, and in both cases three months is the usual notice. It must be in writing, on paper, signed — an email does not legally count.',
      bg: 'Същият глагол за прекратяване на наем и на работа, и в двата случая три месеца е обичайното предизвестие. Трябва да е писмено, на хартия, подписано — имейл юридически не се брои.',
    },
  },
  {
    id: 'v-einziehen',
    german: 'einziehen',
    display: 'einziehen',
    wordType: 'verb',
    perfect: { auxiliary: 'sein', participle: 'eingezogen' },
    translation: { en: 'to move in', bg: 'нанасям се' },
    pronunciation: { en: 'EYN-tsee-en', bg: 'АЙН-ци-ен' },
    example: {
      de: 'Wir sind letzten Monat eingezogen.',
      gloss: { en: 'We moved in last month.', bg: 'Нанесохме се миналия месец.' },
    },
    tags: ['housing', 'movement'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    related: ['v-ausziehen', 'v-umziehen'],
  },
  {
    id: 'v-ausziehen',
    german: 'ausziehen',
    display: 'ausziehen',
    wordType: 'verb',
    perfect: { auxiliary: 'sein', participle: 'ausgezogen' },
    translation: { en: 'to move out', bg: 'изнасям се' },
    pronunciation: { en: 'OWS-tsee-en', bg: 'АУС-ци-ен' },
    example: {
      de: 'Die Nachbarn sind im Sommer ausgezogen.',
      gloss: { en: 'The neighbours moved out in the summer.', bg: 'Съседите се изнесоха през лятото.' },
    },
    tags: ['housing', 'movement'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    related: ['v-einziehen', 'v-umziehen'],
    notes: {
      en: 'Three related verbs worth keeping apart: einziehen into a flat, ausziehen out of one, umziehen from one to another. All three take sein, because all three are a change of place.',
      bg: 'Три сродни глагола, които си струва да се разграничат: einziehen — нанасям се, ausziehen — изнасям се, umziehen — местя се от едно на друго. И трите взимат sein, защото и трите са промяна на мястото.',
    },
  },
  {
    id: 'v-der-laerm',
    german: 'Lärm',
    display: 'der Lärm',
    article: 'der',
    gender: 'm',
    wordType: 'noun',
    translation: { en: 'noise', bg: 'шум' },
    pronunciation: { en: 'lehrm', bg: 'лерм' },
    example: {
      de: 'Der Lärm aus der Wohnung über mir ist unerträglich.',
      gloss: {
        en: 'The noise from the flat above me is unbearable.',
        bg: 'Шумът от апартамента над мен е непоносим.',
      },
    },
    tags: ['housing', 'problem'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 2,
    notes: {
      en: 'Attached to a real rule: Ruhezeiten, the legally quiet hours, are usually 22:00–06:00 plus all of Sunday. Drilling a hole on a Sunday afternoon is not a cultural faux pas, it is a complaint.',
      bg: 'Свързано с истинско правило: Ruhezeiten — часовете на законна тишина — обикновено са 22:00–06:00 плюс цялата неделя. Да пробиваш дупка в неделя следобед не е културен гаф, а повод за оплакване.',
    },
  },
  {
    id: 'v-die-hausordnung',
    german: 'Hausordnung',
    display: 'die Hausordnung',
    article: 'die',
    gender: 'f',
    plural: 'die Hausordnungen',
    wordType: 'noun',
    translation: { en: 'house rules', bg: 'домов правилник' },
    pronunciation: { en: 'HOWS-ord-noong', bg: 'ХАУС-орд-нунг' },
    example: {
      de: 'In der Hausordnung steht, wann man waschen darf.',
      gloss: {
        en: 'The house rules say when you are allowed to do laundry.',
        bg: 'В домовия правилник пише кога може да се пере.',
      },
    },
    tags: ['housing'],
    level: 'b1',
    unitId: U,
    lessonId: L3,
    difficulty: 3,
    notes: {
      en: 'Part of the contract, not a suggestion. It typically covers quiet hours, whose turn it is to clean the stairwell, and where bicycles may stand.',
      bg: 'Част от договора, а не предложение. Обикновено урежда часовете на тишина, чий ред е да чисти стълбището и къде могат да стоят велосипедите.',
    },
  },
];

export const HOUSING_VOCAB: VocabEntry[] = [...SEARCHING, ...CONTRACT, ...LIVING];
