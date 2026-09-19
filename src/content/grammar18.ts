import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * B1 Unit 5 grammar: the Präteritum, als against wenn, and the past before
 * the past.
 *
 * **The Präteritum.** A2 taught *war*, *hatte* and *es gab* and said openly
 * that they were the three survivors of a tense spoken German has otherwise
 * given up. This is the rest of it, and the thing that actually has to be
 * taught is not the endings — they are regular and quickly learnt — but *when*
 * to use it, because German splits its two past tenses by **register** rather
 * than by meaning.
 *
 * Spoken German tells a story in the Perfekt. Written German tells it in the
 * Präteritum. The same events, the same meaning, a different tense — and
 * neither English nor Bulgarian does this.
 *
 * English has one simple past that does everything, so an English speaker
 * hears *ich ging* and *ich bin gegangen* as "I went" twice and cannot see why
 * German would care. The result is Präteritum in conversation, which sounds
 * like a narrator rather than a person.
 *
 * Bulgarian is the more interesting case, because it has *more* past tenses
 * than German rather than fewer. Its imperfect — *живеехме*, *ходех* — maps
 * remarkably well onto the Präteritum for background description, so a
 * Bulgarian speaker often has a sound instinct for when the Präteritum
 * *feels* right. What they do not have is the register rule, because Bulgarian
 * uses its aorist in conversation constantly.
 *
 * **als, wenn, wann.** English "when" covers all three. Bulgarian „когато“
 * covers two of them. German insists: *als* for one completed event in the
 * past, *wenn* for something repeated or still to come, *wann* only in a
 * question. This is equally hard from both directions and the course says so.
 *
 * **Plusquamperfekt.** The past before the past, and the one place both
 * starting languages have a genuine equivalent — English "had done",
 * Bulgarian „бях направил“ — so it is taught briefly and as a recognition
 * skill, paired with *nachdem*.
 */

/* ------------------------------------------------------------------ *
 * The Präteritum
 * ------------------------------------------------------------------ */

const praeteritumBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German has two past tenses that mean the same thing. Which one you use depends on whether you are speaking or writing.',
      'Немският има две минали времена, които значат едно и също. Кое ще използваш, зависи от това дали говориш, или пишеш.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Situation', 'Ситуация'), bi('Tense', 'Време'), bi('Example', 'Пример')],
    rows: [
      [bi('Talking to someone', 'Разговор с някого'), 'Perfekt', 'Ich habe in Hamburg gewohnt.'],
      [bi('Writing a story or a report', 'Разказ или доклад в писмен вид'), 'Präteritum', 'Ich wohnte in Hamburg.'],
      [bi('sein, haben, modals — even when speaking', 'sein, haben, модални — дори в говор'), 'Präteritum', 'Ich war dort. Ich hatte keine Zeit.'],
    ],
  },
  {
    t: 'p',
    text: bi(
      'The endings are regular and there are only two sets: one for verbs that add -te, one for verbs that change their vowel.',
      'Окончанията са правилни и наборите са само два: един за глаголите, които добавят -te, и един за тези, които сменят гласната.',
    ),
  },
  {
    t: 'table',
    headers: [
      bi('Person', 'Лице'),
      bi('wohnen → wohnte', 'wohnen → wohnte'),
      bi('gehen → ging', 'gehen → ging'),
    ],
    rows: [
      ['ich', 'wohnte', 'ging'],
      ['du', 'wohntest', 'gingst'],
      ['er / sie / es', 'wohnte', 'ging'],
      ['wir', 'wohnten', 'gingen'],
      ['ihr', 'wohntet', 'gingt'],
      ['sie / Sie', 'wohnten', 'gingen'],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('ich and er are identical', 'ich и er са еднакви'),
    text: bi(
      'In the Präteritum the ich-form and the er-form are always the same — wohnte and wohnte, ging and ging. That is one fewer thing to remember than in the present tense.',
      'В Präteritum формата за ich и тази за er винаги съвпадат — wohnte и wohnte, ging и ging. Това е едно нещо по-малко за помнене, отколкото в сегашно време.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('sein → war · haben → hatte · werden → wurde', 'sein → war · haben → hatte · werden → wurde'),
      bi('gehen → ging · kommen → kam · sehen → sah · geben → gab', 'gehen → ging · kommen → kam · sehen → sah · geben → gab'),
      bi('können → konnte · müssen → musste · wollen → wollte', 'können → konnte · müssen → musste · wollen → wollte'),
    ],
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('English has one past. German has two, split by register.', ''),
    text: bi(
      'English says "I lived in Hamburg" whether you are chatting or writing a novel. German has two forms and chooses between them by **how you are communicating**, not by what happened:\n\n• Ich **habe** in Hamburg **gewohnt**. — what you say out loud\n• Ich **wohnte** in Hamburg. — what you write down\n\nBoth mean "I lived in Hamburg". Neither is more past than the other.\n\nThe mistake to expect is using the Präteritum in conversation, because it feels like the natural translation of the English simple past. It is not wrong exactly — it sounds like you are narrating rather than talking, a bit like saying "I journeyed to the shop" in English.\n\nThe exceptions run the other way and you already know them: sein, haben and the modals use the Präteritum even in speech. *Ich bin dort gewesen* is possible but nobody says it — they say **ich war dort**.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('', 'Имаш повече минали времена от немския, не по-малко'),
    text: bi(
      '',
      'Това е рядък случай: българският е по-богат от немския тук. Имаш аорист (отидох, живях), имперфект (отивах, живеех) и перфект (отишъл съм) — три отделни форми с три различни смисъла.\n\nНемският има само две и — това е важното — не ги различава по смисъл, а по **регистър**:\n\n• Ich **habe** in Hamburg **gewohnt**. — това се казва на глас\n• Ich **wohnte** in Hamburg. — това се пише\n\nИ двете значат „живях в Хамбург“. Нито едното не е „по-минало“ от другото.\n\nЕдно нещо обаче ти е истинска помощ: българският имперфект — „живеехме“, „ходех“, „беше“ — почти точно съвпада с усещането на немския Präteritum, когато се описва фон на разказ. Damals **wohnten** wir in Sofia. Тоест интуицията ти кога Präteritum звучи добре е до голяма степен вярна.\n\nКакво ти липсва: правилото за регистъра. В българския аористът се ползва постоянно в разговор („вчера отидох на лекар“), затова инстинктът е да се сложи Präteritum и в немски разговор. Там обаче се казва **Ich bin zum Arzt gegangen**.\n\nПрактически: като говориш — Perfekt. Като пишеш разказ — Präteritum. Изключенията са sein, haben и модалните, които се казват в Präteritum и в разговор: ich **war**, ich **hatte**, ich **musste**.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * als, wenn, wann
 * ------------------------------------------------------------------ */

const alsWennBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Three German words share one English word and two Bulgarian ones. The distinction is not optional, and it is small enough to learn in one sitting.',
      'Три немски думи си поделят една английска и две български. Разграничението не е по избор и е достатъчно малко, за да се научи наведнъж.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Word', 'Дума'), bi('Use it for', 'Използва се за'), bi('Example', 'Пример')],
    rows: [
      [
        'als',
        bi('one single event or period in the past', 'едно събитие или период в миналото'),
        'Als ich zehn war, kam ich aufs Gymnasium.',
      ],
      [
        'wenn',
        bi('something repeated, or anything in the present or future', 'нещо повтарящо се или каквото и да е в сегашно/бъдеще'),
        'Wenn ich Zeit hatte, spielte ich Fußball.',
      ],
      [
        'wann',
        bi('only in a question, direct or indirect', 'само във въпрос, пряк или непряк'),
        'Wann fängt die Schule an?',
      ],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The test that works', 'Проверката, която работи'),
    text: bi(
      'Ask yourself: did it happen **once**, in the past? Then als. Did it happen **every time**? Then wenn. Am I **asking**? Then wann.\n\n"Als ich klein war" — childhood happened once. "Wenn ich klein war" would mean you were small repeatedly, which is why it is wrong.',
      'Запитай се: случило ли се е **веднъж**, в миналото? Тогава als. Случвало ли се е **всеки път**? Тогава wenn. **Питам** ли? Тогава wann.\n\n„Als ich klein war“ — детството се е случило веднъж. „Wenn ich klein war“ би значело, че си бил малък многократно — затова е грешно.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('All three send the verb to the end', 'И трите изпращат глагола в края'),
    text: bi(
      'als, wenn and an indirect wann are all subordinators. The conjugated verb goes last, exactly as after weil, dass and obwohl: Als ich zehn **war**, …',
      'als, wenn и непрякото wann са подчинителни. Спрегнатият глагол отива последен, точно както след weil, dass и obwohl: Als ich zehn **war**, …',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('One English word, three German ones', ''),
    text: bi(
      'English "when" does all of this work by itself: "when I was ten", "when I had time I played football", "when does school start?" German splits it three ways and the split is compulsory.\n\nThe expensive mistake is *wenn* for a one-off past event, because it is the word that looks like "when". "Wenn ich zehn war" is not a sentence about your tenth year — it suggests you were repeatedly ten years old.\n\nA useful crutch: English "whenever" is almost always wenn. If you can say "whenever" without changing the meaning, use wenn; if you cannot, use als.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('', '„Когато“ покрива две от трите'),
    text: bi(
      '',
      'Българското „когато“ върши работата и на als, и на wenn: „когато бях на десет“ и „когато имах време, играех футбол“ — една и съща дума за две различни немски думи. А за въпроса имаш отделна дума, „кога“, която е точно wann.\n\nТоест едната граница вече ти е ясна (въпрос или не), а другата — не:\n\n• **веднъж** в миналото → **als**. Als ich zehn war, kam ich aufs Gymnasium.\n• **всеки път** → **wenn**. Wenn ich Zeit hatte, spielte ich Fußball.\n• **въпрос** → **wann**. Wann fängt die Schule an?\n\nПолезна проверка през българския: ако можеш да кажеш „всеки път, когато“ и смисълът да се запази — това е wenn. Ако не можеш — als.\n\nИ трите пращат глагола в края, което вече го правиш след weil, dass, obwohl и относителните изречения.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * The past before the past
 * ------------------------------------------------------------------ */

const plusquamperfektBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'When two things happened in the past and you want to say which came first, German marks the earlier one with hatte or war plus the participle.',
      'Когато две неща са станали в миналото и искаш да кажеш кое е било първо, немският отбелязва по-ранното с hatte или war плюс причастие.',
    ),
  },
  {
    t: 'de',
    de: 'Nachdem wir umgezogen waren, fand ich eine neue Schule.',
    gloss: bi(
      'After we had moved, I found a new school.',
      'След като се бяхме преместили, намерих ново училище.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('hatte + participle, for verbs that take haben', 'hatte + причастие, за глаголите със haben'),
      bi('war + participle, for verbs that take sein', 'war + причастие, за глаголите със sein'),
      bi('It is the Perfekt with hatte or war instead of habe or bin.', 'Това е Perfekt, но с hatte или war вместо habe или bin.'),
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('nachdem is where you will meet it', 'nachdem е мястото, където ще го срещнеш'),
    text: bi(
      'The Plusquamperfekt lives mostly in nachdem-clauses, and the pairing is fixed: nachdem takes the earlier tense, the main clause takes the later one. Nachdem ich gegessen **hatte**, **ging** ich ins Bett.',
      'Plusquamperfekt живее основно в изречения с nachdem и двойката е закована: nachdem взима по-ранното време, главното изречение — по-късното. Nachdem ich gegessen **hatte**, **ging** ich ins Bett.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('You already have this one', 'Това вече го имаш'),
    text: bi(
      'English says "had done" and Bulgarian says „бях направил“ — both languages mark the earlier past exactly the way German does. Nothing here is a new idea; only the auxiliary has to be the right one, and you have been choosing between haben and sein since A2.',
      'Английският казва „had done“, българският — „бях направил“: и двата езика отбелязват по-ранното минало точно както немският. Тук няма нова идея; само помощният глагол трябва да е правилният, а ти избираш между haben и sein още от A2.',
    ),
  },
];

export const GRAMMAR_CONCEPTS_18: GrammarConcept[] = [
  {
    id: 'g-praeteritum',
    title: bi('The Präteritum: the written past', 'Präteritum: миналото на писмения език'),
    level: 'b1',
    summary: bi(
      'The same meaning as the Perfekt, chosen by register: Perfekt when speaking, Präteritum when writing.',
      'Същото значение като Perfekt, избирано по регистър: Perfekt в говор, Präteritum в писане.',
    ),
    tags: ['verb-conjugation'],
    blocks: praeteritumBlocks,
  },
  {
    id: 'g-als-wenn',
    title: bi('als, wenn, wann', 'als, wenn, wann'),
    level: 'b1',
    summary: bi(
      'als for one past event, wenn for something repeated, wann only in a question.',
      'als за едно минало събитие, wenn за повтарящо се, wann само във въпрос.',
    ),
    tags: ['word-order', 'vocabulary'],
    blocks: alsWennBlocks,
  },
  {
    id: 'g-plusquamperfekt',
    title: bi('The past before the past', 'Миналото преди миналото'),
    level: 'b1',
    summary: bi(
      'hatte or war plus the participle, and it lives mostly in nachdem-clauses.',
      'hatte или war плюс причастие, и живее основно в изречения с nachdem.',
    ),
    tags: ['verb-conjugation'],
    blocks: plusquamperfektBlocks,
  },
];
