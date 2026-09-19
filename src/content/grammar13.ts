import type { Bilingual, Block, GrammarConcept } from './types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * A2 Unit 5 grammar: comparison, the superlative, and the first adjective
 * endings.
 *
 * Comparison is the one place in A2 where German is simpler than English and
 * harder than Bulgarian, and each path is told which.
 *
 * English splits its comparatives by length — bigger, but *more interesting* —
 * and an English speaker reliably produces *mehr interessant*. German has no
 * such split: everything takes -er, however long. That is one rule instead of
 * two, and the English path is told so.
 *
 * Bulgarian is more regular still. „по-" and „най-" are prefixes that never
 * touch the word, so a Bulgarian speaker has never had to change an adjective
 * to compare it. German changes the word itself and sometimes adds an umlaut,
 * which is the genuinely new work.
 *
 * The adjective endings are kept deliberately tiny, exactly as A1 kept the
 * dative tiny: definite article only, nominative and accusative only, and the
 * lesson says out loud that this is a first step rather than the system.
 */

/* ------------------------------------------------------------------ *
 * The comparative
 * ------------------------------------------------------------------ */

const comparativeBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'To compare two things, add -er to the adjective and join them with als.',
      'За да сравниш две неща, добави -er към прилагателното и ги свържи с als.',
    ),
  },
  {
    t: 'list',
    items: [
      bi('Der Zug ist schneller als der Bus. — The train is faster than the bus.', 'Der Zug ist schneller als der Bus. — Влакът е по-бърз от автобуса.'),
      bi('Der Flug war billiger als der Zug. — The flight was cheaper than the train.', 'Der Flug war billiger als der Zug. — Полетът беше по-евтин от влака.'),
      bi('Die Stadt ist interessanter als das Dorf. — The city is more interesting than the village.', 'Die Stadt ist interessanter als das Dorf. — Градът е по-интересен от селото.'),
    ],
  },
  {
    t: 'table',
    headers: [bi('Adjective', 'Прилагателно'), bi('Comparative', 'Сравнителна степен'), bi('Note', 'Бележка')],
    rows: [
      ['schnell', 'schneller', bi('regular', 'правилно')],
      ['billig', 'billiger', bi('regular', 'правилно')],
      ['interessant', 'interessanter', bi('long, and still -er', 'дълго, и пак -er')],
      ['groß', 'größer', bi('umlaut', 'умлаут')],
      ['alt', 'älter', bi('umlaut', 'умлаут')],
      ['gut', 'besser', bi('completely irregular', 'напълно неправилно')],
    ],
  },
  {
    t: 'callout',
    tone: 'warn',
    title: bi('als, not wie', 'als, не wie'),
    text: bi(
      'Comparing two different things uses als. wie is for saying they are the same: "so schnell wie der Zug" — as fast as the train.',
      'Сравняването на две различни неща е с als. wie е за това, че са еднакви: „so schnell wie der Zug“ — толкова бърз, колкото влака.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    title: bi('One rule instead of two', ''),
    text: bi(
      'English decides by length: "bigger", but "more interesting". German never does that — every adjective takes -er, however long. *mehr interessant* is the mistake, and it is the one English speakers make here. interessanter is correct, and so is kompliziert**er**.\n\nThis is one of the few places where German asks for less than English.',
      '',
    ),
  },
  {
    t: 'callout',
    tone: 'warn',
    only: ['bg'],
    title: bi('', 'Тук немският иска повече от българския'),
    text: bi(
      '',
      'Българското „по-“ е представка, която не пипа думата: голям → по-голям, интересен → по-интересен, добър → по-добър. Никога не се е налагало да променяш самото прилагателно.\n\nНемският го променя. Добавя -er отзад, а при късите прилагателни често слага и умлаут: groß → größer, alt → älter, jung → jünger. Това не е модел, който можеш да предскажеш от българския — трябва да се запомни при всяка дума.\n\nИ още: българското „от“ при сравнение („по-голям от“) на немски е als, не von. „größer als“, никога „größer von“.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * The superlative
 * ------------------------------------------------------------------ */

const superlativeBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'For the best of all, German has two shapes, and which one you use depends on where the word stands.',
      'За „най-“ немският има две форми и коя ще използваш зависи от това къде стои думата.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Where it stands', 'Къде стои'), bi('Shape', 'Форма'), bi('Example', 'Пример')],
    rows: [
      [bi('after the verb, on its own', 'след глагола, самостоятелно'), 'am …sten', 'Der Zug ist am schnellsten.'],
      [bi('in front of a noun', 'пред съществително'), 'der / die / das …ste', 'Das ist der schnellste Zug.'],
    ],
  },
  {
    t: 'list',
    items: [
      bi('gut → besser → am besten', 'gut → besser → am besten'),
      bi('schnell → schneller → am schnellsten', 'schnell → schneller → am schnellsten'),
      bi('groß → größer → am größten', 'groß → größer → am größten'),
    ],
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('The one to own', 'Това, което да знаеш наизуст'),
    text: bi(
      'gut, besser, am besten. It is irregular in German exactly as it is in English and Bulgarian, and it is the comparison you will use more than all the others together.',
      'gut, besser, am besten. Неправилно е на немски точно както „добър, по-добър, най-добър“ е особено и на български, и ще го използваш повече от всички останали заедно.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българското „най-“ пак е представка и пак не пипа думата. Немското „am …sten“ е две части около думата, а пред съществително се сменя изцяло с член плюс окончание. Това е втората форма, която трябва да се учи отделно — но пък и двете са напълно редовни, щом веднъж ги знаеш.',
    ),
  },
];

/* ------------------------------------------------------------------ *
 * Adjective endings, kept small
 * ------------------------------------------------------------------ */

const adjEndingBlocks: Block[] = [
  {
    t: 'p',
    text: bi(
      'An adjective standing after the verb never changes: "Der Zug ist schnell." An adjective standing in front of a noun always does: "der schnelle Zug."',
      'Прилагателно след глагола никога не се мени: „Der Zug ist schnell.“ Прилагателно пред съществително винаги се мени: „der schnelle Zug.“',
    ),
  },
  {
    t: 'contrast',
    de: 'Der Zug ist schnell. / Das ist der schnelle Zug.',
    other: bi('The train is fast. / That is the fast train.', 'Влакът е бърз. / Това е бързият влак.'),
    note: bi(
      'Nothing about the meaning changed. Only the position did, and that is what the ending is marking.',
      'Нищо в смисъла не се е променило. Само позицията — и точно това отбелязва окончанието.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    title: bi('Kept deliberately small', 'Нарочно оставено малко'),
    text: bi(
      'The full system has three genders, four cases and three kinds of article, and it is a B1 topic. A2 needs one corner of it: after der, die or das, in the nominative and the accusative. That is what is below, and it covers most of what you will want to say.',
      'Пълната система има три рода, четири падежа и три вида членове и е тема за B1. A2 има нужда само от едно ъгълче: след der, die или das, в именителен и винителен падеж. Това е по-долу и покрива повечето от това, което ще искаш да кажеш.',
    ),
  },
  {
    t: 'table',
    headers: [bi('Gender', 'Род'), bi('Subject', 'Подлог'), bi('Object', 'Допълнение')],
    rows: [
      [bi('masculine', 'мъжки'), 'der schnelle Zug', 'den schnellen Zug'],
      [bi('feminine', 'женски'), 'die schöne Stadt', 'die schöne Stadt'],
      [bi('neuter', 'среден'), 'das gute Hotel', 'das gute Hotel'],
    ],
    caption: bi(
      'Five of the six are -e. Only the masculine object is different, and it takes -en — the same place der became den in A1.',
      'Пет от шестте са -e. Само мъжкото допълнение е различно и взима -en — същото място, където der стана den в A1.',
    ),
  },
  {
    t: 'callout',
    tone: 'tip',
    text: bi(
      'A working rule for now: after der/die/das, write -e. The exception is the masculine accusative, where it is -en — and that is the one corner of German where masculine has always behaved differently.',
      'Работещо правило засега: след der/die/das пиши -e. Изключението е мъжкият винителен падеж, където е -en — и точно там мъжкият род винаги се е държал различно.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['bg'],
    text: bi(
      '',
      'Българските прилагателни също се менят пред съществително — „бърз влак“, но „бързият влак“, „бърза кола“, „бързи влакове“. Значи идеята за окончание, което зависи от рода и от определеността, ти е позната.\n\nРазликата е коя информация се носи. Българското окончание носи род, число и определеност. Немското носи род, число и падеж — а падежът е това, което твоят език не маркира. Затова тук се учи само едно ъгълче.',
    ),
  },
  {
    t: 'callout',
    tone: 'compare',
    only: ['en'],
    text: bi(
      'English adjectives never change: "the fast train", "I take the fast train". German marks position on the adjective as well as on the article, which is genuinely new work with nothing in English to hang it on — so A2 takes only the corner that covers most sentences and leaves the rest for B1.',
      '',
    ),
  },
];

export const GRAMMAR_CONCEPTS_13: GrammarConcept[] = [
  {
    id: 'g-komparativ',
    title: bi('Comparing two things: -er and als', 'Сравняване на две неща: -er и als'),
    level: 'a2',
    summary: bi(
      'Every adjective takes -er, however long — and the word for "than" is als.',
      'Всяко прилагателно взима -er, колкото и дълго да е — а думата за „от“ при сравнение е als.',
    ),
    tags: ['adjective-ending'],
    blocks: comparativeBlocks,
  },
  {
    id: 'g-superlativ',
    title: bi('The best of all: am besten', 'Най-доброто: am besten'),
    level: 'a2',
    summary: bi(
      'am …sten standing alone, der/die/das …ste in front of a noun.',
      'am …sten самостоятелно, der/die/das …ste пред съществително.',
    ),
    tags: ['adjective-ending'],
    blocks: superlativeBlocks,
  },
  {
    id: 'g-adjektivendungen',
    title: bi('The first adjective endings', 'Първите окончания на прилагателните'),
    level: 'a2',
    summary: bi(
      'After der, die or das: -e everywhere except the masculine object, which takes -en.',
      'След der, die или das: -e навсякъде освен при мъжкото допълнение, което взима -en.',
    ),
    tags: ['adjective-ending', 'case'],
    blocks: adjEndingBlocks,
  },
];
