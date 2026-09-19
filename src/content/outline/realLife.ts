import type { Bilingual, CefrLevel, ContentStatus } from '../types.ts';

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * The Real Life section.
 *
 * Milestone 1 ships the *plan* for these scenarios, not the scenarios. Each one
 * records which CEFR level it belongs at and what the task actually is, so the
 * UI can show an honest roadmap instead of empty buttons. `relatedLessonIds`
 * points at authored lessons that already teach the language a scenario needs.
 */

export interface ScenarioStage {
  level: CefrLevel;
  task: Bilingual;
}

export interface Scenario {
  id: string;
  title: Bilingual;
  /** Where this happens, in one line. */
  setting: Bilingual;
  status: ContentStatus;
  /** The same setting, scaled across levels. */
  stages: ScenarioStage[];
  /** Authored lessons that already cover part of the language needed. */
  relatedLessonIds?: string[];
  register: 'du' | 'Sie' | 'both';
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'sc-bakery',
    title: bi('At the bakery', 'В пекарната'),
    setting: bi('A German Bäckerei, morning queue.', 'Немска Bäckerei, сутрешна опашка.'),
    status: 'planned',
    register: 'Sie',
    relatedLessonIds: ['pre-a1-u2-l1', 'pre-a1-u2-l2'],
    stages: [
      { level: 'pre-a1', task: bi('Greet, and say thank you and goodbye.', 'Поздрави и кажи благодаря и довиждане.') },
      { level: 'a1', task: bi('Order two rolls and a coffee, and pay.', 'Поръчай две хлебчета и кафе и плати.') },
      { level: 'a2', task: bi('Ask what is in something and whether it is fresh.', 'Попитай какво има в нещо и дали е свежо.') },
      { level: 'b1', task: bi('Send back a wrong order politely.', 'Върни учтиво грешна поръчка.') },
    ],
  },
  {
    id: 'sc-restaurant',
    title: bi('At the restaurant', 'В ресторанта'),
    setting: bi('Table service, evening.', 'Обслужване на маса, вечер.'),
    status: 'planned',
    register: 'Sie',
    relatedLessonIds: ['pre-a1-u2-l2'],
    stages: [
      { level: 'a1', task: bi('Order food and drinks and ask for the bill.', 'Поръчай храна и напитки и поискай сметката.') },
      { level: 'a2', task: bi('Book a table by phone.', 'Резервирай маса по телефона.') },
      { level: 'b1', task: bi('Complain that the food is wrong or cold.', 'Оплачи се, че храната е грешна или студена.') },
      { level: 'b2', task: bi('Resolve a disputed bill and ask for a formal receipt.', 'Реши спор за сметката и поискай официална касова бележка.') },
    ],
  },
  {
    id: 'sc-supermarket',
    title: bi('At the supermarket', 'В супермаркета'),
    setting: bi('Checkout and shelves.', 'Каса и рафтове.'),
    status: 'planned',
    register: 'Sie',
    stages: [
      { level: 'a1', task: bi('Find an item and pay.', 'Намери продукт и плати.') },
      { level: 'a2', task: bi('Ask where something is and about a deposit.', 'Попитай къде е нещо и за депозита.') },
      { level: 'b1', task: bi('Return a faulty product.', 'Върни дефектен продукт.') },
    ],
  },
  {
    id: 'sc-transport',
    title: bi('Public transport and the station', 'Градски транспорт и гарата'),
    setting: bi('U-Bahn, bus, Deutsche Bahn.', 'U-Bahn, автобус, Deutsche Bahn.'),
    status: 'planned',
    register: 'Sie',
    stages: [
      { level: 'a1', task: bi('Buy a ticket and ask which platform.', 'Купи билет и попитай от кой коловоз.') },
      { level: 'a2', task: bi('Ask about a connection and a delay.', 'Попитай за връзка и за закъснение.') },
      { level: 'b1', task: bi('Claim compensation for a cancelled train.', 'Поискай компенсация за отменен влак.') },
    ],
  },
  {
    id: 'sc-doctor',
    title: bi('At the doctor', 'При лекаря'),
    setting: bi('Reception and consultation.', 'Рецепция и консултация.'),
    status: 'planned',
    register: 'Sie',
    stages: [
      { level: 'a1', task: bi('Make an appointment and give your name.', 'Запиши час и кажи името си.') },
      { level: 'a2', task: bi('Describe simple symptoms.', 'Опиши прости симптоми.') },
      { level: 'b1', task: bi('Describe a history, ask about treatment and a sick note.', 'Опиши анамнеза, попитай за лечение и болничен.') },
    ],
  },
  {
    id: 'sc-pharmacy',
    title: bi('At the pharmacy', 'В аптеката'),
    setting: bi('Apotheke counter.', 'Гише в Apotheke.'),
    status: 'planned',
    register: 'Sie',
    stages: [
      { level: 'a1', task: bi('Ask for something for a headache.', 'Поискай нещо за главоболие.') },
      { level: 'a2', task: bi('Hand in a prescription and ask about dosage.', 'Подай рецепта и попитай за дозировката.') },
      { level: 'b1', task: bi('Discuss an alternative and an interaction.', 'Обсъди алтернатива и взаимодействие.') },
    ],
  },
  {
    id: 'sc-buergeramt',
    title: bi('Bürgeramt and Anmeldung', 'Bürgeramt и Anmeldung'),
    setting: bi('Registering your address.', 'Регистрация на адрес.'),
    status: 'planned',
    register: 'Sie',
    stages: [
      { level: 'a2', task: bi('Book an appointment online and confirm it.', 'Запази час онлайн и го потвърди.') },
      { level: 'b1', task: bi('Complete the Anmeldung and answer questions about documents.', 'Направи Anmeldung и отговори на въпроси за документите.') },
      { level: 'b2', task: bi('Resolve a missing-document problem and escalate politely.', 'Реши проблем с липсващ документ и ескалирай учтиво.') },
    ],
  },
  {
    id: 'sc-apartment',
    title: bi('Apartment viewing and the landlord', 'Оглед на жилище и наемодателят'),
    setting: bi('Wohnungsbesichtigung and later the Vermieter.', 'Wohnungsbesichtigung и по-късно Vermieter.'),
    status: 'planned',
    register: 'Sie',
    stages: [
      { level: 'a2', task: bi('Ask about rent, size and availability.', 'Попитай за наем, размер и наличност.') },
      { level: 'b1', task: bi('Present yourself as a tenant and ask about the Nebenkosten.', 'Представи се като наемател и попитай за Nebenkosten.') },
      { level: 'b2', task: bi('Report a defect in writing and insist on a repair.', 'Опиши дефект писмено и настоявай за ремонт.') },
    ],
  },
  {
    id: 'sc-work',
    title: bi('At work and the job interview', 'На работа и на интервю'),
    setting: bi('Office, team meeting, Bewerbungsgespräch.', 'Офис, екипна среща, Bewerbungsgespräch.'),
    status: 'planned',
    register: 'both',
    stages: [
      { level: 'a2', task: bi('Say what you do and ask a colleague for help.', 'Кажи какво работиш и помоли колега за помощ.') },
      { level: 'b1', task: bi('Answer standard interview questions.', 'Отговори на стандартни въпроси на интервю.') },
      { level: 'b2', task: bi('Disagree in a meeting and negotiate a deadline.', 'Изрази несъгласие на среща и договори срок.') },
    ],
  },
  {
    id: 'sc-kita',
    title: bi('Kindergarten and school', 'Детска градина и училище'),
    setting: bi('Kita handover, parents’ evening.', 'Предаване в Kita, родителска среща.'),
    status: 'planned',
    register: 'both',
    stages: [
      { level: 'a2', task: bi('Report that your child is ill.', 'Съобщи, че детето ти е болно.') },
      { level: 'b1', task: bi('Discuss your child’s development with an educator.', 'Обсъди развитието на детето си с възпитател.') },
      { level: 'b2', task: bi('Raise a concern at a parents’ evening.', 'Постави проблем на родителска среща.') },
    ],
  },
  {
    id: 'sc-bank',
    title: bi('Bank and insurance', 'Банка и осигуровки'),
    setting: bi('Opening an account, Krankenkasse.', 'Откриване на сметка, Krankenkasse.'),
    status: 'planned',
    register: 'Sie',
    stages: [
      { level: 'a2', task: bi('Open a current account.', 'Открий разплащателна сметка.') },
      { level: 'b1', task: bi('Change your health insurance and explain why.', 'Смени здравната си каса и обясни защо.') },
      { level: 'b2', task: bi('Dispute a charge in writing.', 'Оспори такса писмено.') },
    ],
  },
  {
    id: 'sc-neighbours',
    title: bi('Neighbours and the phone', 'Съседи и телефон'),
    setting: bi('Hausflur, Hausordnung, a phone call.', 'Hausflur, Hausordnung, телефонен разговор.'),
    status: 'planned',
    register: 'both',
    stages: [
      { level: 'a1', task: bi('Greet a neighbour and introduce yourself.', 'Поздрави съсед и се представи.') },
      { level: 'a2', task: bi('Accept a parcel and leave a note.', 'Приеми колет и остави бележка.') },
      { level: 'b1', task: bi('Raise a noise problem without escalating it.', 'Повдигни проблем с шум, без да го ескалираш.') },
    ],
  },
  {
    id: 'sc-emergency',
    title: bi('Emergencies', 'Спешни ситуации'),
    setting: bi('112, urgent help.', '112, спешна помощ.'),
    status: 'planned',
    register: 'Sie',
    stages: [
      { level: 'a1', task: bi('Call for help and give your address.', 'Извикай помощ и кажи адреса си.') },
      { level: 'a2', task: bi('Describe what happened to whom.', 'Опиши какво се е случило и с кого.') },
      { level: 'b1', task: bi('Give a clear account to the police.', 'Дай ясни показания на полицията.') },
    ],
  },
];

export function scenariosForLevel(level: CefrLevel): Scenario[] {
  return SCENARIOS.filter((scenario) => scenario.stages.some((stage) => stage.level === level));
}
