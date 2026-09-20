import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * B2 Unit 5 grammar: the German nobody writes down.
 *
 * The last grammar of the course, and the one that admits what the previous
 * eighty lessons could not. A learner who has done all of them can read a
 * contract and still lose the thread at a lunch table — not because the
 * grammar changes, but because speech deletes, contracts and reorders things
 * that writing keeps.
 *
 * Three concepts, and all three are taught for **listening first**. Production
 * is optional throughout, and the lessons say so: nobody has ever been thought
 * rude for speaking in full forms, while failing to understand *Haste mal
 * kurz?* stops a conversation dead.
 *
 * **Reduction** is the mechanical part: du fuses onto its verb (hast du →
 * haste), eine loses its front ('ne), unstressed -e disappears (ich hab, ich
 * geh), and preposition plus article contract far beyond the im/zum a learner
 * already knows.
 *
 * **Spoken syntax** is the structural part: German drops the pronoun in the
 * first slot (*Hab ich nicht gesehen*), adds an afterthought at the end (*Der
 * ist echt gut, der Film*), and closes a sentence with a tag that asks for
 * agreement (*oder?*, *ne?*).
 *
 * Here the two paths sit differently. English drops subjects in the same
 * casual way ("Didn't see it") so that instinct transfers; but English has no
 * right-dislocation of this kind, and its tag questions are built by rule
 * ("isn't it?", "didn't you?") where German has one invariant *ne?*. Bulgarian
 * has invariant tags too — „нали?“ — which is an exact match, and it moves
 * constituents freely, so the afterthought construction is familiar; what
 * Bulgarian lacks is the verb-second frame the deletions happen inside.
 */

/* ------------------------------------------------------------------ *
 * The spoken register: which words get swapped
 * ------------------------------------------------------------------ */

const umgangsspracheBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Spoken German quietly replaces a set of textbook verbs with shorter ones. The grammar is identical; only the word changes, and nobody ever announces the swap.',
      'Говоримият немски тихо заменя група учебникарски глаголи с по-кратки. Граматиката е същата; сменя се само думата и никой никога не обявява замяната.',
    ),
  },
  {
    t: 'table',
    headers: [bi('You learnt', 'Научил си'), bi('People say', 'Хората казват'), bi('Still write', 'В писмен вид')],
    rows: [
      ['bekommen', 'kriegen', bi('bekommen, erhalten', 'bekommen, erhalten')],
      ['sehen, schauen', 'gucken', bi('sehen', 'sehen')],
      ['funktionieren', 'klappen', bi('funktionieren', 'funktionieren')],
      ['sehr, wirklich', 'echt, total', bi('sehr', 'sehr')],
      ['die Sachen', 'das Zeug', bi('die Sachen', 'die Sachen')],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Understanding is compulsory, using them is not', 'Разбирането е задължително, употребата — не'),
    text: bi(
      'Nobody has ever been thought rude for saying *bekommen*. But if *Hast du meine Nachricht gekriegt?* does not land, the conversation stops.\n\nSo learn these to hear them. Use them when they start coming out on their own.',
      'Никой не е бил смятан за груб, защото е казал *bekommen*. Но ако *Hast du meine Nachricht gekriegt?* не ти стигне, разговорът спира.\n\nЗатова ги учи, за да ги чуваш. Използвай ги, когато сами започнат да излизат.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('Do not take them into a letter', 'Не ги внасяй в писмо'),
    text: bi(
      'This is Unit 4 in reverse. *Ich habe Ihre Nachricht gekriegt* in a formal email is as wrong as *Ich bitte um Bescheid* at a kitchen table — the words are fine, the room is not.',
      'Това е раздел 4 наобратно. *Ich habe Ihre Nachricht gekriegt* в официален имейл е толкова неуместно, колкото *Ich bitte um Bescheid* на кухненската маса — думите са наред, обстановката не е.',
    ),
  },
  {
    t: 'de',
    de: 'Hast du meine Nachricht gekriegt?',
    gloss: bi('Did you get my message?', 'Получи ли съобщението ми?'),
    audio: true,
  },
  {
    t: 'de',
    de: 'Hat mit dem Termin alles geklappt?',
    gloss: bi('Did everything work out with the appointment?', 'Всичко ли се получи с часа?'),
    audio: true,
  },
];

const UMGANGSSPRACHE: GrammarConcept = {
  id: 'g-umgangssprache',
  title: bi('kriegen, gucken, klappen', 'kriegen, gucken, klappen'),
  level: 'b2',
  summary: bi(
    'Spoken German swaps the word, not the grammar. Learn them to hear them; keep the textbook forms for writing.',
    'Говоримият немски сменя думата, не граматиката. Учи ги, за да ги чуваш; за писане пази учебникарските форми.',
  ),
  blocks: umgangsspracheBlocks,
  tags: ['spoken', 'register', 'vocabulary'],
};

/* ------------------------------------------------------------------ *
 * Reduction and contraction
 * ------------------------------------------------------------------ */

const reduktionBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Speech runs words together. None of this is sloppy or regional — every German does it, all the time, and a textbook simply never writes it down.',
      'Речта слива думите. Нищо от това не е немарливо или диалектно — всеки германец го прави постоянно, а учебникът просто не го записва.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Written', 'Писмено'), bi('Spoken', 'Говоримо'), bi('What happened', 'Какво се е случило')],
    rows: [
      ['Hast du …', 'Haste …', bi('du fuses onto the verb', 'du се слива с глагола')],
      ['Kannst du …', 'Kannste …', bi('the same fusion', 'същото сливане')],
      ['eine Frage', '’ne Frage', bi('eine loses its front', 'eine губи началото си')],
      ['einen Moment', '’nen Moment', bi('einen loses its front', 'einen губи началото си')],
      ['Ich habe', 'Ich hab', bi('unstressed -e drops', 'неударено -e отпада')],
      ['Es gibt', 'Gibt’s', bi('es fuses backwards', 'es се слива назад')],
      ['auf dem Tisch', 'aufm Tisch', bi('preposition plus article', 'предлог плюс член')],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('You already accept four of these', 'Четири от тях вече ги приемаш'),
    text: bi(
      'im, zum, zur, am, ans, beim — these are contractions too, and they are so standard that they are compulsory in writing. aufm and unterm are the same process caught one step earlier, before the spelling caught up.',
      'im, zum, zur, am, ans, beim — това също са сливания и са толкова стандартни, че в писмен вид са задължителни. aufm и unterm са същият процес, уловен една стъпка по-рано, преди правописът да го догони.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('For the ear, not for the pen', 'За ухото, не за писалката'),
    text: bi(
      'Do not write haste, ’ne or gibt’s outside of a chat message to a friend. The point of learning them is that when somebody says **Haste mal kurz?** you hear *Hast du mal kurz?* without stopping to decode it.',
      'Не пиши haste, ’ne или gibt’s извън съобщение до приятел. Смисълът да ги научиш е, че когато някой каже **Haste mal kurz?**, ти чуваш *Hast du mal kurz?*, без да спираш да го разшифроваш.',
    ),
  },
  {
    t: 'de',
    de: 'Haste mal kurz? Ich hab ’ne Frage.',
    gloss: bi('Got a second? I have a question.', 'Имаш ли момент? Имам един въпрос.'),
    audio: true,
  },
  {
    t: 'de',
    de: 'Gibt’s noch Kaffee?',
    gloss: bi('Is there any coffee left?', 'Има ли още кафе?'),
    audio: true,
  },
];

const REDUKTION: GrammarConcept = {
  id: 'g-reduktion',
  title: bi('Haste mal kurz?', 'Haste mal kurz?'),
  level: 'b2',
  summary: bi(
    'du fuses onto its verb, eine loses its front, unstressed -e drops. Learn it to hear it, not to write it.',
    'du се слива с глагола, eine губи началото си, неудареното -e отпада. Учи го, за да го чуваш, не за да го пишеш.',
  ),
  blocks: reduktionBlocks,
  tags: ['spoken', 'listening', 'pronunciation'],
};

/* ------------------------------------------------------------------ *
 * Spoken syntax
 * ------------------------------------------------------------------ */

const gesprocheneSyntaxBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Speech also rearranges sentences — and unlike the contractions, these are structures rather than sounds.',
      'Речта пренарежда и изреченията — и за разлика от сливанията, това са структури, а не звуци.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Move', 'Ход'), bi('Example', 'Пример'), bi('Full form', 'Пълна форма')],
    rows: [
      [
        bi('Drop the first pronoun', 'Изпускане на първото местоимение'),
        'Hab ich nicht gesehen.',
        'Das habe ich nicht gesehen.',
      ],
      [
        bi('Afterthought at the end', 'Допълнение накрая'),
        'Der ist echt gut, der Film.',
        'Der Film ist echt gut.',
      ],
      [
        bi('Tag asking for agreement', 'Въпросна частица за съгласие'),
        'Das machen wir morgen, ne?',
        'Machen wir das morgen?',
      ],
      [
        bi('Opening filler', 'Начална частица'),
        'Also, ich würde sagen …',
        'Ich würde sagen …',
      ],
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('The verb still comes second', 'Глаголът пак е втори'),
    text: bi(
      'Dropping the pronoun does not move the verb — it removes what was in front of it. *Hab ich nicht gesehen* still has the verb in position one only because position one has been deleted, and everything after it is in the usual order.\n\nSo this is not a licence to reorder. It is one deletion, and the frame underneath is the frame you already know.',
      'Изпускането на местоимението не мести глагола — премахва онова, което е стояло пред него. В *Hab ich nicht gesehen* глаголът е пръв само защото първата позиция е изтрита, а всичко след него е в обичайния ред.\n\nЗатова това не е разрешение за пренареждане. Това е едно изтриване, а рамката отдолу е същата, която вече знаеш.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('One of the three transfers', 'One of the three transfers'),
    text: bi(
      'English drops subjects in exactly this casual way — "Didn\'t see it", "Sounds good" — so that instinct carries over cleanly.\n\nThe other two do not. English has no afterthought of the *der Film* kind, and English tag questions are built by rule, agreeing with the verb and the subject: "isn\'t it?", "didn\'t you?", "can\'t we?". German has one invariant tag — **ne?** — which is far less work and feels, at first, far too easy.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('„Нали?“ е точно ne?', '„Нали?“ е точно ne?'),
    text: bi(
      '',
      'Българското „нали?“ е неизменяемо и стои в края — точно като немското **ne?**. Това е пълно съвпадение и англоговорящите нямат такъв ориентир: техните въпросни частици се менят според глагола и подлога.\n\nИ допълнението накрая — „Много е добър, филмът“ — ти е познато, защото българският мести частите на изречението свободно.\n\nВнимавай с другото: в немския тези изтривания стават вътре в рамката „глаголът е втори“. Свободата е в това *какво* се изпуска, не в реда на останалото.',
    ),
  },
  {
    t: 'de',
    de: 'Hab ich nicht gesehen. Der ist echt gut, der Film.',
    gloss: bi(
      'Didn’t see it. It’s really good, that film.',
      'Не съм го гледал. Много е добър, филмът.',
    ),
    audio: true,
  },
  {
    t: 'de',
    de: 'Das machen wir morgen, ne?',
    gloss: bi('We will do that tomorrow, right?', 'Ще го направим утре, нали?'),
    audio: true,
  },
];

const GESPROCHENE_SYNTAX: GrammarConcept = {
  id: 'g-gesprochene-syntax',
  title: bi('Hab ich nicht gesehen', 'Hab ich nicht gesehen'),
  level: 'b2',
  summary: bi(
    'Speech deletes the first pronoun, adds afterthoughts, and asks for agreement with an invariant ne?',
    'Речта изтрива първото местоимение, добавя допълнения накрая и иска съгласие с неизменяемото ne?',
  ),
  blocks: gesprocheneSyntaxBlocks,
  tags: ['spoken', 'word-order', 'listening'],
};

export const GRAMMAR_CONCEPTS_24: GrammarConcept[] = [
  UMGANGSSPRACHE,
  REDUKTION,
  GESPROCHENE_SYNTAX,
];
