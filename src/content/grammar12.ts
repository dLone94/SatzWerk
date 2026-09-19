import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * A2 Unit 4 grammar: reflexive verbs, sollen, and the du-imperative.
 *
 * Reflexives are the clearest case in the whole course of the two paths needing
 * opposite advice, and of the Bulgarian path having the easier job.
 *
 * Bulgarian has „се" and uses it in the same places: „чувствам се", „настивам",
 * „почивам си". So the Bulgarian learner does not have to be persuaded that the
 * word belongs there — they have to be warned that German's „се" changes with
 * the person, which Bulgarian's never does. mich, dich, sich, uns, euch, sich.
 *
 * English has no reflexive here at all. "I feel myself well" is not merely
 * unusual, it is wrong and faintly comic. So the English learner's problem is
 * the opposite: they must add a word their own language forbids, and their
 * instinct will delete it every time. That is authored as a trap.
 *
 * sollen and the du-imperative are small by comparison and are taught as what
 * they are: a fifth modal that behaves exactly like the four already known, and
 * an imperative that is the du-form with its ending and its pronoun removed.
 */

/* ------------------------------------------------------------------ *
 * Reflexive verbs
 * ------------------------------------------------------------------ */

const reflexiveBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'Some German verbs need a second little word that points back at the subject. It is not optional and it is not emphasis — without it the sentence is not German.',
      'Някои немски глаголи искат втора малка дума, която сочи обратно към подлога. Тя не е по избор и не е за подчертаване — без нея изречението не е немско.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Ich fühle mich gut. — I feel well.', 'Ich fühle mich gut. — Чувствам се добре.'),
      bi('Ich ruhe mich aus. — I am resting.', 'Ich ruhe mich aus. — Почивам си.'),
      bi('Ich habe mich erkältet. — I have caught a cold.', 'Ich habe mich erkältet. — Настинах.'),
    ],
  },
  {
    t: 'table',
    headers: [bi('Person', 'Лице'), bi('Reflexive word', 'Възвратна дума'), bi('Example', 'Пример')],
    rows: [
      ['ich', 'mich', 'Ich fühle mich gut.'],
      ['du', 'dich', 'Du fühlst dich gut.'],
      ['er / sie / es', 'sich', 'Er fühlt sich gut.'],
      ['wir', 'uns', 'Wir fühlen uns gut.'],
      ['ihr', 'euch', 'Ihr fühlt euch gut.'],
      ['sie / Sie', 'sich', 'Sie fühlen sich gut.'],
    ],
    caption: bi(
      'Only the third person and the formal Sie share a form — sich. The rest are the accusative pronouns you already know.',
      'Само третото лице и учтивото Sie споделят форма — sich. Останалите са винителните местоимения, които вече знаеш.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('', 'Знаеш идеята — внимавай с формата'),
    text: bi(
      '',
      'Българското „се“ прави точно същото: „чувствам се“, „почивам си“, „настивам“. Значи не трябва да те убеждаваме, че думата е нужна — тя ти е съвсем естествена.\n\nРазликата е една и е важна: българското „се“ не се мени. Казваш „аз се чувствам“, „ти се чувстваш“, „той се чувства“ — „се“ си стои.\n\nНемското се мени по лице: mich, dich, sich, uns, euch, sich. „Ich fühle **sich** gut“ е грешката, която идва от навика да не се мени нищо. Правилното е „Ich fühle **mich** gut“.\n\nДобрата новина: това не са нови думи. Това са винителните местоимения от A1.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    title: bi('English forbids exactly what German requires', ''),
    text: bi(
      '"I feel myself well" is wrong in English, and slightly funny. So your instinct will delete the reflexive word every time — and "Ich fühle gut" is not a sentence in German.\n\nThere is no rule that predicts which verbs need it. It is part of the verb, which is why the vocabulary lists them as *sich fühlen*, *sich ausruhen*, *sich erkälten* — with the sich attached, so you learn them as one thing.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Where the word goes', 'Къде отива думата'),
    text: bi(
      'Straight after the conjugated verb: "Ich fühle mich gut", "Ich ruhe mich aus", "Ich habe mich erkältet". Even when the verb splits or the Perfekt sends a participle to the end, the reflexive word stays in second place behind the verb.',
      'Веднага след спрегнатия глагол: „Ich fühle mich gut“, „Ich ruhe mich aus“, „Ich habe mich erkältet“. Дори когато глаголът се дели или перфектът праща причастие в края, възвратната дума си остава веднага след глагола.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * sollen
 * ------------------------------------------------------------------ */

const sollenBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'sollen is the fifth modal verb, and it behaves exactly like the four you met in A1: second position, and the other verb waits at the end.',
      'sollen е петият модален глагол и се държи точно като четирите от A1: втора позиция, а другият глагол чака накрая.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Du sollst viel Tee trinken. — You should drink a lot of tea.', 'Du sollst viel Tee trinken. — Трябва да пиеш много чай.'),
      bi('Du sollst zum Arzt gehen. — You should go to the doctor.', 'Du sollst zum Arzt gehen. — Трябва да отидеш на лекар.'),
      bi('Ich soll mich ausruhen. — I am supposed to rest.', 'Ich soll mich ausruhen. — Трябва да си почивам.'),
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('sollen or müssen?', 'sollen или müssen?'),
    text: bi(
      'müssen is a necessity you feel yourself: Ich muss arbeiten. sollen is what someone else says you ought to do — a doctor, a rule, your mother. Advice is sollen.',
      'müssen е необходимост, която сам усещаш: Ich muss arbeiten. sollen е това, което някой друг казва, че е редно — лекар, правило, майка ти. Съветът е sollen.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българското „трябва“ покрива и двете, така че разликата е нова. „Трябва да работя“ (сам решаваш) е müssen; „трябва да пиеш чай“ (лекарят каза) е sollen. И помни: след модалния глагол на немски няма „да“ — вторият глагол е в инфинитив и стои в края.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * The du-imperative
 * ------------------------------------------------------------------ */

const imperativeBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'To tell a friend to do something, take the du-form, cut off the -st, and drop the du.',
      'За да кажеш на приятел да направи нещо, вземи формата за du, махни -st и махни самото du.',
    ),
  },
  {
    t: 'table',
    headers: [bi('du-form', 'Форма за du'), bi('Imperative', 'Заповедна форма'), bi('Meaning', 'Значение')],
    rows: [
      ['du trinkst', 'Trink!', bi('Drink!', 'Пий!')],
      ['du gehst', 'Geh!', bi('Go!', 'Иди!')],
      ['du nimmst', 'Nimm!', bi('Take!', 'Вземи!')],
      ['du ruhst dich aus', 'Ruh dich aus!', bi('Rest!', 'Почини си!')],
    ],
    caption: bi(
      'A stem change stays: du nimmst → Nimm! But a vowel that only gets an umlaut loses it: du fährst → Fahr!',
      'Промяната на гласната остава: du nimmst → Nimm! Но умлаут, който се появява само при du, изчезва: du fährst → Fahr!',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('You already know the formal one', 'Учтивата вече я знаеш'),
    text: bi(
      'A1 taught "Gehen Sie geradeaus" — infinitive plus Sie. This is its informal twin, and the two are all the imperative A2 needs.',
      'A1 те научи на „Gehen Sie geradeaus“ — инфинитив плюс Sie. Това е неформалният ѝ близнак и двете са цялата заповедна форма, която A2 изисква.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българският има истинска заповедна форма — „пий!“, „иди!“ — така че идеята е позната и дори по-позната, отколкото на англоговорящ. Разликата е само в строежа: немската се прави от формата за du, а не е отделна форма за учене.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'English just uses the bare verb — "Drink!", "Go!" — which is what German is doing too, once the -st is off. The one thing English does not have is a separate polite form, and German has had one since A1.',
      '',
    ),
  },
];

export const GRAMMAR_CONCEPTS_12: GrammarConcept[] = [
  {
    id: 'g-reflexive',
    title: bi('Reflexive verbs: the word that points back', 'Възвратни глаголи: думата, която сочи назад'),
    level: 'a2',
    summary: bi(
      'mich, dich, sich — part of the verb, not an extra, and it changes with the person.',
      'mich, dich, sich — част от глагола, не добавка, и се мени по лице.',
    ),
    tags: ['verbs', 'pronoun'],
    blocks: reflexiveBlocks,
  },
  {
    id: 'g-sollen',
    title: bi('sollen: what you ought to do', 'sollen: какво е редно да направиш'),
    level: 'a2',
    summary: bi(
      'The fifth modal, behaving exactly like the four from A1.',
      'Петият модален глагол, който се държи точно като четирите от A1.',
    ),
    tags: ['verbs'],
    blocks: sollenBlocks,
  },
  {
    id: 'g-imperativ-du',
    title: bi('Telling a friend: the du-imperative', 'Да кажеш на приятел: заповедна форма за du'),
    level: 'a2',
    summary: bi(
      'The du-form minus its -st and minus the du.',
      'Формата за du без -st и без самото du.',
    ),
    tags: ['verbs'],
    blocks: imperativeBlocks,
  },
];
