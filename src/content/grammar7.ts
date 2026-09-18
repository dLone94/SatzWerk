import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * A1 Unit 5 grammar: the dative, kept small on purpose.
 *
 * This is the hardest step in A1 and the usual place a beginner stalls, so the
 * scope here is deliberately narrow: three prepositions that *always* take the
 * dative (mit, zu, neben when it answers "where"), and only the singular. No
 * rules about two-way prepositions, no dative plural -n, no dative pronouns.
 * A learner who can say "mit dem Bus zum Bahnhof" has everything A1 asks for,
 * and the exceptions are easier to absorb later on top of a solid habit than
 * alongside a shaky one.
 *
 * Both paths get an anchor rather than a warning, because both languages kept a
 * dative where it is least expected. Bulgarian kept it in the clitics — ми, ти,
 * му, ѝ — and the learner has been using one since Unit 1 without being told:
 * „брат ми“ is literally "brother to-me". English kept it in "give him the
 * book". So the dative is not introduced as a new idea, only as a new place for
 * an old one.
 */

/* ------------------------------------------------------------------ *
 * The dative, introduced
 * ------------------------------------------------------------------ */

const dativeBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'German has a third form of the article, used after certain prepositions. You have met der/die/das as a subject and den/die/das as an object; this is the one that turns up after mit and zu.',
      'Немският има трета форма на члена, която се използва след определени предлози. Срещна der/die/das като подлог и den/die/das като допълнение; това е формата, която идва след mit и zu.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Gender', 'Род'), bi('Subject', 'Подлог'), bi('Object', 'Допълнение'), bi('After mit / zu', 'След mit / zu')],
    rows: [
      [bi('masculine', 'мъжки'), 'der Bus', 'den Bus', 'dem Bus'],
      [bi('feminine', 'женски'), 'die Post', 'die Post', 'der Post'],
      [bi('neuter', 'среден'), 'das Auto', 'das Auto', 'dem Auto'],
    ],
    caption: bi(
      'Masculine and neuter fall together as dem. Feminine becomes der — the one form that looks like something you already know and is not it.',
      'Мъжкият и средният се сливат в dem. Женският става der — единствената форма, която прилича на нещо познато, но не е то.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('The trap in that table', 'Капанът в тази таблица'),
    text: bi(
      'Feminine der. "mit der Post" does not mean the post is masculine — it means the feminine article, after mit, is der. This is the single most confusing thing about the German dative, and knowing it is coming is most of the battle.',
      'Женското der. „mit der Post“ не значи, че пощата е мъжки род — значи, че женският член след mit е der. Това е най-объркващото нещо в немския дателен падеж и да знаеш, че идва, е половината работа.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('', 'Дателният ти е познат — от клитиките'),
    text: bi(
      '',
      'Българският е загубил падежите при съществителните, но ги е запазил при кратките местоимения: ми, ти, му, ѝ, ни, ви, им. Това са дателни форми и ти ги използваш всеки ден.\n\nПовече от това: „брат ми“, което учи още в раздел 1, буквално значи „брат на мен“ — дателна конструкция. Значи идеята не ти е чужда. Новото е само, че немският я показва върху члена на съществителното, а не само върху местоимението.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('You have one too, in one place', ''),
    text: bi(
      'English kept a dative in sentences like "give him the book" — him, not he, and it is not the object either: the book is. German does the same job with the article, and after mit and zu it does it every time.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Keep it small', 'Дръж го малко'),
    text: bi(
      'Three prepositions, singular only. mit and zu always take this form, and neben takes it when it answers "where is it". That is all A1 asks for, and "mit dem Bus zum Bahnhof" is the sentence to own.',
      'Три предлога, само единствено число. mit и zu винаги взимат тази форма, а neben я взима, когато отговаря на „къде е“. Това е всичко, което A1 иска, а „mit dem Bus zum Bahnhof“ е изречението за запомняне.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * zum and zur
 * ------------------------------------------------------------------ */

const zumZurBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'zu plus the article is always shortened, and the short form is the only one anybody uses.',
      'zu плюс членът винаги се съкращава, а късата форма е единствената, която някой използва.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Long form', 'Дълга форма'), bi('What you say', 'Това, което се казва'), bi('Example', 'Пример')],
    rows: [
      ['zu dem Bahnhof', 'zum Bahnhof', bi('to the station (masculine)', 'до гарата (мъжки)')],
      ['zu dem Kino', 'zum Kino', bi('to the cinema (neuter)', 'до киното (среден)')],
      ['zu der Post', 'zur Post', bi('to the post office (feminine)', 'до пощата (женски)')],
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Two forms, one question', 'Две форми, един въпрос'),
    text: bi(
      'zum or zur is the whole decision, and it rests on one thing: is the noun feminine? If yes, zur. If no — masculine or neuter — zum. Two thirds of the time the answer is zum.',
      'zum или zur е цялото решение и то опира до едно: женски род ли е съществителното? Ако да — zur. Ако не — мъжки или среден — zum. В два от три случая отговорът е zum.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Ich gehe zum Bahnhof. — I am going to the station.', 'Ich gehe zum Bahnhof. — Отивам до гарата.'),
      bi('Ich gehe zur Apotheke. — I am going to the pharmacy.', 'Ich gehe zur Apotheke. — Отивам до аптеката.'),
      bi('Wie komme ich zum Museum? — How do I get to the museum?', 'Wie komme ich zum Museum? — Как да стигна до музея?'),
    ],
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българският се справя с един предлог и нищо повече: „до гарата“, „до пощата“ — думата „до“ не се мени. Немският иска предлога *и* правилната форма на члена. Това е допълнителна работа, която българският не изисква, и няма как да се заобиколи — само да се упражни.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'English manages with "to the" and never changes it. German asks for the preposition and the right article fused together, which is extra work with no English equivalent — but there are only two forms to choose between.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    text: bi(
      'Going by vehicle is fahren, on foot is gehen. Both take zum and zur the same way: "Ich fahre zum Bahnhof", "Ich gehe zur Post".',
      'С превозно средство е fahren, пеша е gehen. И двата взимат zum и zur по същия начин: „Ich fahre zum Bahnhof“, „Ich gehe zur Post“.',
    ),
  },
];

export const GRAMMAR_CONCEPTS_7: GrammarConcept[] = [
  {
    id: 'g-dative-basics',
    title: bi('A third form: after mit and zu', 'Трета форма: след mit и zu'),
    level: 'a1',
    summary: bi(
      'dem for masculine and neuter, der for feminine — and feminine der is the trap.',
      'dem за мъжки и среден род, der за женски — а женското der е капанът.',
    ),
    tags: ['case', 'articles'],
    blocks: dativeBlocks,
  },
  {
    id: 'g-zum-zur',
    title: bi('zum and zur', 'zum и zur'),
    level: 'a1',
    summary: bi(
      'Feminine takes zur; masculine and neuter take zum.',
      'Женският взима zur; мъжкият и средният взимат zum.',
    ),
    tags: ['case', 'prepositions'],
    blocks: zumZurBlocks,
  },
];
