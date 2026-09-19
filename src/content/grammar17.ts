import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * B1 Unit 4 grammar: the genitive, connectors, and verbs with fixed
 * prepositions.
 *
 * **The genitive** is the fourth case, and the honest thing to say about it is
 * that spoken German is quietly abandoning it. *Das Auto von meinem Bruder* is
 * what people say; *das Auto meines Bruders* is what people write. A course
 * that taught the genitive as obligatory everywhere would be teaching a
 * register the learner will rarely hear — and a course that skipped it would
 * leave them unable to read a contract. So it is taught as what it is: the
 * written register, required in exactly the documents this unit is about.
 *
 * The two paths start from different places. English has two constructions —
 * *my brother's car* and *the car of my brother* — so the idea of a possessive
 * marker is familiar, and the trap is the apostrophe, which German does not
 * use. Bulgarian has no genitive case at all: it lost its case system and uses
 * „на“, an analytic preposition, for everything. A Bulgarian speaker's
 * instinct is therefore *von* everywhere, which is not wrong in speech and is
 * wrong in an application letter — a distinction worth making explicitly
 * rather than marking as an error.
 *
 * **Connectors** are where B1 word order finally has to be systematic. German
 * sorts them into three families by what they do to the verb, and the family
 * matters more than the meaning: *obwohl* and *trotzdem* mean almost the same
 * thing and behave completely differently. English blurs this — "however" and
 * "although" feel like near-synonyms and neither moves a verb far. Bulgarian
 * blurs it more, because Bulgarian word order does not depend on conjunctions
 * at all.
 *
 * **Verbs with fixed prepositions** are, unusually, equally hard for both
 * paths and the course says so. *sich bewerben um* is not *für* however you
 * arrive at it — "apply for" and „кандидатствам за“ both point the wrong way.
 * There is no rule to give; there is only the pairing, learnt together.
 */

/* ------------------------------------------------------------------ *
 * The genitive
 * ------------------------------------------------------------------ */

const genitiveBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'The genitive says that one thing belongs to another. It is the case of written German — contracts, applications, official letters — and it is the fourth and last case you need.',
      'Родителният падеж казва, че едно нещо принадлежи на друго. Това е падежът на писмения немски — договори, кандидатури, официални писма — и е четвъртият и последен падеж, който ти трябва.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Gender', 'Род'), bi('Article', 'Член'), bi('Example', 'Пример')],
    rows: [
      [bi('masculine', 'мъжки'), 'des …s', 'der Lebenslauf **des Bewerbers**'],
      [bi('neuter', 'среден'), 'des …s', 'der Titel **des Schreibens**'],
      [bi('feminine', 'женски'), 'der', 'der Leiter **der Abteilung**'],
      [bi('plural', 'мн. число'), 'der', 'die Rechte **der Arbeitnehmer**'],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Two things to notice', 'Две неща, които да забележиш'),
    text: bi(
      'Masculine and neuter nouns take an -s as well as the article — des Bewerbers, des Vertrags. Feminine and plural nouns take only der, and the noun itself does not change.\n\nSo half the work is one article and half is one letter.',
      'Съществителните от мъжки и среден род взимат -s освен члена — des Bewerbers, des Vertrags. Женският род и множественото число взимат само der, а самото съществително не се мени.\n\nТоест половината работа е един член, а другата половина — една буква.',
    ),
  },
  {
    t: 'p',
    text: bi(
      'A name simply takes -s, with no apostrophe and no article.',
      'Собственото име просто взима -s, без апостроф и без член.',
    ),
  },
  {
    t: 'de',
    de: 'Peters Lebenslauf ist sehr gut.',
    gloss: bi('Peter’s CV is very good.', 'Автобиографията на Петер е много добра.'),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('Some prepositions demand it', 'Някои предлози го изискват'),
    text: bi(
      'wegen, während, trotz and innerhalb take the genitive, and they are common in exactly the documents where it matters: **während der** Probezeit, **wegen des** Wetters, **innerhalb von** zwei Wochen.',
      'wegen, während, trotz и innerhalb искат родителен падеж и се срещат точно в документите, където това има значение: **während der** Probezeit, **wegen des** Wetters, **innerhalb von** zwei Wochen.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('Two English shapes, one German case — and no apostrophe', ''),
    text: bi(
      'English has two ways of doing this: "my brother\'s car" and "the car of my brother". German has one case that covers both, and it looks more like the second: das Auto **meines Bruders**.\n\nThe trap is the apostrophe. German does not use one in the genitive:\n\n• **Peters** Lebenslauf — correct\n• *Peter\'s Lebenslauf* — wrong, and a mistake Germans themselves make often enough that it has a nickname (der Deppenapostroph)\n\nThe other thing worth knowing is that spoken German mostly avoids the genitive: people say *das Auto von meinem Bruder*. That is not slang, it is ordinary speech — but it does not belong in an application letter, which is what this unit is about.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('', 'Български „на“ срещу немски родителен падеж'),
    text: bi(
      '',
      'Българският няма родителен падеж. Изгубил е падежната система и използва „на“ — предлог, който върши цялата работа: колата **на** брат ми, автобиографията **на** кандидата, правата **на** работниците.\n\nНемският има и двете възможности, но те принадлежат на различни регистри:\n\n• **von** + Dativ — das Auto **von meinem Bruder**. Това е точният аналог на твоето „на“ и е напълно нормален говорим немски.\n• **Genitiv** — das Auto **meines Bruders**. Това е писменият регистър.\n\nЗатова von не е грешка — просто не е това, което се пише в договор, в кандидатура или в официално писмо. А точно тези неща пише този раздел.\n\nПрактическото правило: когато говориш, ползвай von и няма да сбъркаш. Когато пишеш официално, превключи на Genitiv — des при мъжки и среден род (плюс -s на самата дума), der при женски и множествено число.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * Connectors, sorted by what they do to the verb
 * ------------------------------------------------------------------ */

const connectorBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German sorts joining words into three families, and the family decides where the verb goes. The meaning does not: obwohl and trotzdem mean almost the same thing and behave completely differently.',
      'Немският подрежда свързващите думи в три семейства, а семейството решава къде отива глаголът. Значението — не: obwohl и trotzdem значат почти едно и също, а се държат напълно различно.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Family', 'Семейство'), bi('Words', 'Думи'), bi('What happens to the verb', 'Какво става с глагола')],
    rows: [
      [
        bi('1. Joiners', '1. Съчинителни'),
        'und, aber, oder, denn, sondern',
        bi('Nothing. The sentence after them is a normal sentence.', 'Нищо. Изречението след тях е обикновено изречение.'),
      ],
      [
        bi('2. Subordinators', '2. Подчинителни'),
        'weil, dass, wenn, obwohl, damit',
        bi('The verb goes to the very end.', 'Глаголът отива най-накрая.'),
      ],
      [
        bi('3. Adverbs', '3. Наречия'),
        'trotzdem, deshalb, außerdem, danach',
        bi('They take position one, so the verb comes second and the subject moves behind it.', 'Те заемат първа позиция, затова глаголът идва втори, а подлогът минава зад него.'),
      ],
    ],
  },
  {
    t: 'list',
    items: [
      bi(
        'Ich habe wenig Erfahrung, **aber** ich lerne schnell. — nothing moves',
        'Ich habe wenig Erfahrung, **aber** ich lerne schnell. — нищо не се мести',
      ),
      bi(
        '**Obwohl** ich wenig Erfahrung **habe**, lerne ich schnell. — verb at the end',
        '**Obwohl** ich wenig Erfahrung **habe**, lerne ich schnell. — глаголът в края',
      ),
      bi(
        'Ich habe wenig Erfahrung. **Trotzdem lerne ich** schnell. — verb second, subject behind',
        'Ich habe wenig Erfahrung. **Trotzdem lerne ich** schnell. — глаголът втори, подлогът зад него',
      ),
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('The pair worth learning together', 'Двойката, която си струва да се учи заедно'),
    text: bi(
      'obwohl and trotzdem are the same idea in two different families, and mixing them up is the commonest B1 word-order mistake. obwohl sends the verb to the end; trotzdem pulls it forward to second place.',
      'obwohl и trotzdem са една и съща идея в две различни семейства, а бъркането им е най-честата грешка в словореда на ниво B1. obwohl изпраща глагола в края; trotzdem го издърпва напред на второ място.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('English lets you feel your way. German does not.', ''),
    text: bi(
      'In English, "although", "however" and "nevertheless" feel like near-synonyms you can swap around, and none of them moves a verb very far: "Although I have little experience, I learn quickly" and "I have little experience; however, I learn quickly" are both ordinary sentences with ordinary word order.\n\nGerman splits them by grammar rather than by meaning, and the split is not optional:\n\n• **Obwohl** ich wenig Erfahrung **habe**, … — the verb goes to the end\n• **Trotzdem lerne ich** schnell. — the verb comes second, before the subject\n\nThe error to expect is *Trotzdem ich lerne schnell*, keeping the English order. trotzdem is not a conjunction at all — it is an adverb standing in position one, and anything in position one pushes the verb to second place. That rule has been true since Pre-A1; this is only a new set of words obeying it.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('', 'В българския свързващата дума не мести нищо'),
    text: bi(
      '',
      'Българските съюзи не пипат словореда. „Въпреки че имам малко опит, уча бързо“ и „Имам малко опит, но уча бързо“ и „Имам малко опит. Въпреки това уча бързо“ — и в трите глаголът си стои на мястото.\n\nВ немския думата решава всичко, и то по граматика, а не по значение:\n\n• **Obwohl** ich wenig Erfahrung **habe**, … — глаголът отива най-накрая (както при weil и dass, които вече знаеш)\n• **Trotzdem lerne ich** schnell. — глаголът идва втори, а подлогът минава зад него\n\nВторото е познатото правило от самото начало: каквото и да стои на първа позиция, глаголът е на втора. Просто сега на първа позиция стои trotzdem.\n\nПолезен начин да ги запомниш: сложи obwohl при weil и dass (изпращат глагола в края), а trotzdem и deshalb при heute и dann (заемат първо място и бутат глагола на второ).',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * Verbs with a fixed preposition
 * ------------------------------------------------------------------ */

const verbPrepositionBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Some verbs come with a preposition attached, and the preposition is not negotiable. It has to be learnt with the verb, as one item.',
      'Някои глаголи идват с прикачен предлог и предлогът не подлежи на договаряне. Учи се заедно с глагола, като едно цяло.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Verb', 'Глагол'), bi('Case', 'Падеж'), bi('Example', 'Пример')],
    rows: [
      ['sich bewerben **um**', 'Akkusativ', 'Ich bewerbe mich um die Stelle.'],
      ['sich interessieren **für**', 'Akkusativ', 'Ich interessiere mich für diese Stelle.'],
      ['sich freuen **auf**', 'Akkusativ', 'Ich freue mich auf Ihre Antwort.'],
      ['warten **auf**', 'Akkusativ', 'Ich warte auf eine Antwort.'],
      ['denken **an**', 'Akkusativ', 'Ich denke an die Bewerbung.'],
      ['teilnehmen **an**', 'Dativ', 'Ich nehme an einer Fortbildung teil.'],
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('This one is equally hard for everyone', 'Това е еднакво трудно за всички'),
    text: bi(
      'There is no rule here and no pattern to find — not from English, not from Bulgarian, not from logic. "Apply for" says für; „кандидатствам за“ says für; German says **um**. All three languages chose differently, and German chose the one neither of the others points at.\n\nThe only thing that works is learning the preposition as part of the word: not bewerben, but sich bewerben um.',
      'Тук няма правило и няма модел за откриване — нито от английския, нито от българския, нито от логиката. „Apply for“ сочи für; „кандидатствам за“ сочи für; немският казва **um**. И трите езика са избрали различно, а немският е избрал точно това, към което другите две не сочат.\n\nЕдинственото, което работи, е предлогът да се учи като част от думата: не bewerben, а sich bewerben um.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Two you will write down', 'Две, които ще напишеш'),
    text: bi(
      'Ich bewerbe mich um die Stelle. Ich freue mich auf Ihre Antwort. Those two sentences open and close a German cover letter, and between them they carry both prepositions.',
      'Ich bewerbe mich um die Stelle. Ich freue mich auf Ihre Antwort. Тези две изречения отварят и затварят немското мотивационно писмо и заедно носят и двата предлога.',
    ),
  },
];

export const GRAMMAR_CONCEPTS_17: GrammarConcept[] = [
  {
    id: 'g-genitiv',
    title: bi('The genitive: des and der', 'Родителен падеж: des и der'),
    level: 'b1',
    summary: bi(
      'des plus -s for masculine and neuter, der for feminine and plural — the case of written German.',
      'des плюс -s при мъжки и среден род, der при женски и множествено число — падежът на писмения немски.',
    ),
    tags: ['case', 'gender'],
    blocks: genitiveBlocks,
  },
  {
    id: 'g-konnektoren',
    title: bi('obwohl, trotzdem, deshalb: three families', 'obwohl, trotzdem, deshalb: три семейства'),
    level: 'b1',
    summary: bi(
      'The family a joining word belongs to decides where the verb goes — and obwohl and trotzdem are in different families.',
      'Семейството на свързващата дума решава къде отива глаголът — а obwohl и trotzdem са в различни семейства.',
    ),
    tags: ['word-order'],
    blocks: connectorBlocks,
  },
  {
    id: 'g-verb-praeposition',
    title: bi('Verbs with a fixed preposition', 'Глаголи с фиксиран предлог'),
    level: 'b1',
    summary: bi(
      'sich bewerben um, sich freuen auf — learnt as one item, because no language predicts the German choice.',
      'sich bewerben um, sich freuen auf — учат се като едно цяло, защото никой език не предсказва немския избор.',
    ),
    tags: ['preposition', 'case'],
    blocks: verbPrepositionBlocks,
  },
];
