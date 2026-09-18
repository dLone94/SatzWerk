import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * A1 grammar concepts.
 *
 * The level's spine is the accusative, and these three concepts are one idea
 * approached three times: a German article carries information about the job a
 * noun is doing in the sentence, and only the masculine shows it.
 *
 * The two paths diverge sharply here, and they should. A Bulgarian speaker
 * already owns this idea — "кой" versus "кого" is exactly der versus den, and
 * Bulgarian keeps that distinction in the same masculine corner German does.
 * An English speaker owns a weaker version of it: he/him, who/whom, and only in
 * pronouns. So the Bulgarian path is told "you already do this, here is where
 * German puts it", and the English path is told "you do this with pronouns,
 * German does it with articles too".
 */

/* ------------------------------------------------------------------ *
 * Possessives
 * ------------------------------------------------------------------ */

const possessiveBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'mein means "my" and dein means "your". The useful part is that you already know how they behave: they take exactly the same endings as ein.',
      'mein значи „мой“, а dein значи „твой“. Полезното е, че вече знаеш как се държат: вземат точно същите окончания като ein.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Gender', 'Род'), bi('with ein', 'с ein'), bi('with mein', 'с mein')],
    rows: [
      [bi('masculine', 'мъжки'), 'ein Bruder', 'mein Bruder'],
      [bi('feminine', 'женски'), 'eine Schwester', 'meine Schwester'],
      [bi('neuter', 'среден'), 'ein Kind', 'mein Kind'],
      [bi('plural', 'мн. число'), '— (no ein)', 'meine Eltern'],
    ],
    caption: bi(
      'If you can say ein or eine, you can say mein or meine. The only new thing is the plural, where ein does not exist but meine does.',
      'Ако можеш да кажеш ein или eine, можеш да кажеш mein или meine. Единственото ново е множественото число, където ein не съществува, а meine — да.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The ending follows the thing owned', 'Окончанието следва притежаваното'),
    text: bi(
      'meine Schwester is "my sister" — the e is there because Schwester is feminine, not because of anything about me. The possessive agrees with what is owned, never with the owner.',
      'meine Schwester е „сестра ми“ — окончанието -e е заради това, че Schwester е женски род, а не заради мен. Притежателното се съгласува с притежаваното, никога с притежателя.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българският има два начина: дългият („моят брат“) и късият, залепен отзад („брат ми“). Немският има само дългия. „Bruder mein“ не съществува — притежателното винаги стои отпред, като „моят“. Добрата новина е, че и българското „моят/моята/моето“ се мени по рода на притежаваното, точно както mein/meine. Навикът вече го имаш.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'English "my" is one word for everything: my brother, my sister, my parents. German has two forms for the same job, and choosing between them is not a style question — mein Schwester is simply wrong. Getting this right is mostly about knowing the gender of the noun, which is why the course always teaches nouns with their article.',
      '',
    ),
  },
  {
    t: 'de',
    de: 'Mein Bruder heißt Tom.',
    gloss: bi('My brother is called Tom.', 'Брат ми се казва Том.'),
  },
  {
    t: 'de',
    de: 'Meine Eltern wohnen in Sofia.',
    gloss: bi('My parents live in Sofia.', 'Родителите ми живеят в София.'),
  },
  {
    t: 'de',
    de: 'Ist das deine Schwester?',
    gloss: bi('Is that your sister?', 'Това сестра ти ли е?'),
  },
];

/* ------------------------------------------------------------------ *
 * The accusative
 * ------------------------------------------------------------------ */

const accusativeBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'A German sentence has someone doing something (the subject) and often something being done to (the object). German marks the difference on the article — and only when the noun is masculine.',
      'В немското изречение има някой, който върши нещо (подлог), и често нещо, върху което се върши (допълнение). Немският маркира разликата върху члена — и то само при мъжки род.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Gender', 'Род'), bi('Subject', 'Подлог'), bi('Object', 'Допълнение')],
    rows: [
      [bi('masculine', 'мъжки'), 'der / ein / mein / kein', 'den / einen / meinen / keinen'],
      [bi('feminine', 'женски'), 'die / eine / meine / keine', 'die / eine / meine / keine'],
      [bi('neuter', 'среден'), 'das / ein / mein / kein', 'das / ein / mein / kein'],
      [bi('plural', 'мн. число'), 'die / meine / keine', 'die / meine / keine'],
    ],
    caption: bi(
      'Three of the four rows are identical. Learn the masculine row and you have learnt the accusative.',
      'Три от четирите реда са еднакви. Научи реда за мъжки род и си научил винителния падеж.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('One letter, one job', 'Една буква, една работа'),
    text: bi(
      'Every masculine object form ends in -en: den, einen, meinen, deinen, keinen. It is a single sound to remember, not four separate rules.',
      'Всяка форма за мъжко допълнение завършва на -en: den, einen, meinen, deinen, keinen. Това е един звук за запомняне, а не четири отделни правила.',
    ),
  },
  {
    t: 'contrast',
    de: 'Der Bruder kennt den Nachbarn.',
    other: bi('The brother knows the neighbour.', 'Братът познава съседа.'),
    note: bi(
      'Two masculine nouns, two different articles — der for the one doing the knowing, den for the one being known.',
      'Две съществителни от мъжки род, два различни члена — der за този, който познава, den за този, когото познават.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    title: bi('', 'Кой / кого — вече го знаеш'),
    text: bi(
      '',
      'Това вече го правиш всеки ден. Българският казва „кой“ за подлог и „кого“ за допълнение: „Кой познава Иван?“ срещу „Кого познаваш?“. Немското der/den е същото разграничение, само че се вижда върху члена на съществителното, а не само върху въпросителната дума: wer / wen, der / den. И забележи къде българският го запазва — при мъжки род и при хора. Немският го запазва точно в същия ъгъл: само мъжки род се мени.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('You already do this with pronouns', ''),
    text: bi(
      'English kept case in exactly three places: he/him, she/her, who/whom. You would never say "I know he" — the object form is automatic. German does the same thing, but it shows it on the article in front of the noun rather than only on the pronoun. "Ich kenne den Bruder" is "I know him-brother", and it is just as automatic once the masculine row is learnt.',
      '',
    ),
  },
  {
    t: 'p',
    text: bi(
      'The object form is used after most verbs. You already met it with haben; these verbs behave the same way.',
      'Формата за допълнение се използва след повечето глаголи. Вече я срещна с haben; тези глаголи се държат по същия начин.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Ich habe einen Bruder. — I have a brother.', 'Ich habe einen Bruder. — Имам брат.'),
      bi('Ich kenne deinen Vater. — I know your father.', 'Ich kenne deinen Vater. — Познавам баща ти.'),
      bi('Wir besuchen meinen Onkel. — We are visiting my uncle.', 'Wir besuchen meinen Onkel. — Гостуваме на чичо ми.'),
      bi('Ich brauche keinen Stuhl. — I do not need a chair.', 'Ich brauche keinen Stuhl. — Не ми трябва стол.'),
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('sein is the exception', 'sein е изключението'),
    text: bi(
      'After sein (to be), nothing changes: "Das ist mein Bruder", not "meinen". sein links two things rather than doing something to one, so both sides stay in the subject form.',
      'След sein (съм) нищо не се мени: „Das ist mein Bruder“, а не „meinen“. sein свързва две неща, вместо да върши нещо върху едното, затова и двете страни остават във формата за подлог.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * sein and ihr
 * ------------------------------------------------------------------ */

const hisHerBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'sein means "his" and ihr means "her". They take the same endings as mein and dein, so there is only one genuinely new thing to learn: which one to reach for.',
      'sein значи „негов“, а ihr значи „неин“. Вземат същите окончания като mein и dein, така че наистина ново е само едно: кое от двете да избереш.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Owner', 'Притежател'), bi('+ Bruder (m)', '+ Bruder (м)'), bi('+ Schwester (f)', '+ Schwester (ж)'), bi('+ Kind (n)', '+ Kind (ср)')],
    rows: [
      [bi('he', 'той'), 'sein Bruder', 'seine Schwester', 'sein Kind'],
      [bi('she', 'тя'), 'ihr Bruder', 'ihre Schwester', 'ihr Kind'],
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('The trap worth naming', 'Капанът, който си заслужава да назовем'),
    text: bi(
      'The ending tells you about the thing owned; the word itself tells you about the owner. "Seine Schwester" is his sister — seine has an e because Schwester is feminine, not because a woman is involved. Read the two halves separately and this never goes wrong.',
      'Окончанието говори за притежаваното; самата дума говори за притежателя. „Seine Schwester“ е неговата сестра — seine е с -e, защото Schwester е женски род, а не защото става дума за жена. Чети двете половини поотделно и това никога няма да се обърка.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Тази разлика ти е позната: „брат му“ (негов) срещу „брат ѝ“ (неин). Българският също разграничава притежателя по пол, така че тук нямаш какво ново да усвояваш — само нова дума за стар навик. Английскоговорящите имат същото предимство; тези, които говорят турски или фински, нямат.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    text: bi(
      '',
      'Едно предупреждение обаче: ihr върши три различни работи в немския. Вече го знаеш като „вие“ (ihr wohnt), сега го учиш като „неин“, а по-късно ще го срещнеш и като „техен“. Разликата се вижда от мястото в изречението: ihr пред глагол е местоимение, ihr пред съществително е притежателно.',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['en'],
    text: bi(
      'One warning: ihr does three jobs. You already know it as "you (plural)" in "ihr wohnt"; here it is "her"; later it is also "their". Position tells them apart — ihr before a verb is a pronoun, ihr before a noun is a possessive.',
      '',
    ),
  },
  {
    t: 'de',
    de: 'Das ist Tom. Seine Schwester heißt Lena.',
    gloss: bi('That is Tom. His sister is called Lena.', 'Това е Том. Сестра му се казва Лена.'),
  },
  {
    t: 'de',
    de: 'Das ist Lena. Ihr Bruder heißt Tom.',
    gloss: bi('That is Lena. Her brother is called Tom.', 'Това е Лена. Брат ѝ се казва Том.'),
  },
];

export const GRAMMAR_CONCEPTS_3: GrammarConcept[] = [
  {
    id: 'g-possessives',
    title: bi('mein and dein', 'mein и dein'),
    level: 'a1',
    summary: bi(
      'my and your, with exactly the endings of ein.',
      'мой и твой, с точно окончанията на ein.',
    ),
    tags: ['articles', 'possessives'],
    blocks: possessiveBlocks,
  },
  {
    id: 'g-accusative',
    title: bi('The accusative: subject and object', 'Винителен падеж: подлог и допълнение'),
    level: 'a1',
    summary: bi(
      'Only masculine articles change when the noun is the object: der becomes den, ein becomes einen.',
      'Само членовете в мъжки род се менят, когато съществителното е допълнение: der става den, ein става einen.',
    ),
    tags: ['case', 'articles'],
    blocks: accusativeBlocks,
  },
  {
    id: 'g-sein-ihr',
    title: bi('sein and ihr — his and her', 'sein и ihr — негов и неин'),
    level: 'a1',
    summary: bi(
      'The word says whose; the ending says what.',
      'Думата казва чий; окончанието казва какво.',
    ),
    tags: ['articles', 'possessives'],
    blocks: hisHerBlocks,
  },
];
