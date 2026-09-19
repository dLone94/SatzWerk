import type { Bilingual, CefrLevel } from '../types.ts';

export interface LevelOutline {
  id: CefrLevel;
  label: string;
  title: Bilingual;
  description: Bilingual;
  outcomes: Bilingual[];
  topics: Bilingual[];
  grammar: Bilingual[];
  /** Planned unit titles, so the level map can show the shape of the course. */
  plannedUnits: Bilingual[];
}

const b = (en: string, bg: string): Bilingual => ({ en, bg });

export const PRE_A1_OUTLINE: LevelOutline = {
  id: 'pre-a1',
  label: 'Pre-A1',
  title: b('Introduction', 'Въведение'),
  description: b(
    'The absolute beginning. German sounds and letters, your first words, and your first complete sentences about yourself.',
    'Самото начало. Звуковете и буквите на немския, първите думи и първите цели изречения за себе си.',
  ),
  outcomes: [
    b('I can read German aloud with the right sounds, including ä, ö, ü and ß.', 'Мога да чета немски на глас с правилните звукове, включително ä, ö, ü и ß.'),
    b('I can greet someone and say goodbye at the right time of day.', 'Мога да поздравя някого и да се сбогувам според часа от деня.'),
    b('I can say my name, ask for someone else’s, and use du and Sie correctly.', 'Мога да кажа името си, да попитам за чуждото и да използвам правилно du и Sie.'),
    b('I can say where I come from and where I live.', 'Мога да кажа откъде идвам и къде живея.'),
    b('I can write short German sentences with correct word order and capitalised nouns.', 'Мога да напиша кратки немски изречения с правилен словоред и главни букви при съществителните.'),
  ],
  topics: [
    b('What German sounds like', 'Как звучи немският'),
    b('The German alphabet, ä, ö, ü, ß', 'Немската азбука, ä, ö, ü, ß'),
    b('Capitalised nouns', 'Съществителните с главна буква'),
    b('Greetings and goodbyes', 'Поздрави и сбогуване'),
    b('Politeness: danke, bitte, Entschuldigung', 'Учтивост: danke, bitte, Entschuldigung'),
    b('Introducing yourself', 'Представяне'),
    b('Countries, origin, where you live', 'Държави, произход, къде живееш'),
    b('Numbers 0–100, age, phone numbers, prices', 'Числата 0–100, възраст, телефонни номера, цени'),
    b('Languages, nationalities, occupations, close family', 'Езици, националности, професии, близко семейство'),
    b('Days, months, dates, telling the time', 'Дни, месеци, дати, часът'),
  ],
  grammar: [
    b('Personal pronouns: ich, du, er, sie, es, wir, ihr, sie, Sie', 'Лични местоимения: ich, du, er, sie, es, wir, ihr, sie, Sie'),
    b('sein and haben in the present tense', 'sein и haben в сегашно време'),
    b('Regular present-tense verb endings', 'Окончания на правилните глаголи в сегашно време'),
    b('der, die, das and ein, eine', 'der, die, das и ein, eine'),
    b('Verb in second position', 'Глаголът на второ място'),
    b('Yes/no questions and W-questions', 'Въпроси с да/не и въпроси с W'),
    b('du versus Sie', 'du срещу Sie'),
  ],
  // Pre-A1 is fully authored: all six units and the level checkpoint exist,
  // so there is nothing left to list as planned.
  plannedUnits: [],
};

export const A1_OUTLINE: LevelOutline = {
  id: 'a1',
  label: 'A1',
  title: b('Everyday basics', 'Основи на всекидневието'),
  description: b(
    'Practical German for everyday situations: family, home, food, shopping, work, travel and simple written messages.',
    'Практичен немски за всекидневни ситуации: семейство, дом, храна, пазаруване, работа, пътуване и кратки писмени съобщения.',
  ),
  outcomes: [
    b('I can introduce myself and ask other people basic questions about themselves.', 'Мога да се представя и да задам основни въпроси за другия човек.'),
    b('I can say where I live, who I live with and describe my home.', 'Мога да кажа къде живея, с кого живея и да опиша дома си.'),
    b('I can order simple food and drinks and do basic shopping.', 'Мога да си поръчам проста храна и напитки и да направя основно пазаруване.'),
    b('I can talk about my daily routine, my work and my free time.', 'Мога да говоря за ежедневието, работата и свободното си време.'),
    b('I can make an appointment and ask for directions.', 'Мога да си запиша час и да попитам за посока.'),
    b('I can write a short message, note or simple email.', 'Мога да напиша кратко съобщение, бележка или прост имейл.'),
  ],
  topics: [
    b('Introductions and small talk', 'Представяне и лек разговор'),
    b('Family and relationships', 'Семейство и близки'),
    b('Daily routine', 'Ежедневие'),
    b('Home and living', 'Дом и живеене'),
    b('Food and drinks', 'Храна и напитки'),
    b('Restaurants and cafés', 'Ресторанти и кафенета'),
    b('Supermarket and shopping', 'Супермаркет и пазаруване'),
    b('Clothing', 'Облекло'),
    b('Work and occupations', 'Работа и професии'),
    b('Hobbies and free time', 'Хобита и свободно време'),
    b('Transport and directions', 'Транспорт и посоки'),
    b('Appointments', 'Срещи и часове'),
    b('Weather', 'Времето'),
    b('Health basics', 'Основи на здравето'),
    b('Hotels and travel', 'Хотели и пътуване'),
    b('Time and dates', 'Час и дати'),
    b('Invitations', 'Покани'),
    b('Simple phone calls', 'Прости телефонни разговори'),
    b('Basic written messages', 'Основни писмени съобщения'),
  ],
  grammar: [
    b('Present tense: regular and important irregular verbs', 'Сегашно време: правилни и важни неправилни глаголи'),
    b('Noun gender and plural forms', 'Род на съществителните и форми за множествено число'),
    b('Definite and indefinite articles', 'Определителни и неопределителни членове'),
    b('Nominative and accusative', 'Именителен и винителен падеж'),
    b('First steps in the dative', 'Първи стъпки в дателен падеж'),
    b('Negation with nicht and kein', 'Отрицание с nicht и kein'),
    b('Possessive articles: mein, dein, sein, ihr', 'Притежателни членове: mein, dein, sein, ihr'),
    b('Modal verbs: können, müssen, wollen, mögen', 'Модални глаголи: können, müssen, wollen, mögen'),
    b('Separable verbs', 'Делими глаголи'),
    b('Imperative basics', 'Основи на заповедната форма'),
    b('Question words', 'Въпросителни думи'),
    b('Main-clause word order and und, aber, oder, denn', 'Словоред в главно изречение и und, aber, oder, denn'),
    b('Common prepositions of place and time', 'Често използвани предлози за място и време'),
  ],
  // All six A1 units are authored, so nothing is left to list as planned.
  // This array is what is still to come, and a finished unit sitting in it
  // would be a small lie on the level map.
  plannedUnits: [],
};

export const A2_OUTLINE: LevelOutline = {
  id: 'a2',
  label: 'A2',
  title: b('Talking about your life', 'Да говориш за живота си'),
  description: b(
    'Past events, plans, advice and problems. You start joining sentences together instead of speaking in single lines.',
    'Минали събития, планове, съвети и проблеми. Започваш да свързваш изреченията, вместо да говориш с отделни редове.',
  ),
  outcomes: [
    b('I can talk about what I did yesterday, last week and last year.', 'Мога да говоря за това какво правих вчера, миналата седмица и миналата година.'),
    b('I can explain why something happened using weil and dass.', 'Мога да обясня защо нещо се е случило с weil и dass.'),
    b('I can describe experiences, plans and appointments.', 'Мога да опиша преживявания, планове и срещи.'),
    b('I can give advice and react to everyday problems.', 'Мога да дам съвет и да реагирам на всекидневни проблеми.'),
    b('I can compare things and people.', 'Мога да сравнявам неща и хора.'),
  ],
  topics: [
    b('Travel and holidays', 'Пътуване и отпуск'),
    b('Housing and moving', 'Жилище и преместване'),
    b('Employment', 'Работа и заетост'),
    b('Education and courses', 'Образование и курсове'),
    b('Hobbies and sport', 'Хобита и спорт'),
    b('Relationships', 'Взаимоотношения'),
    b('Health and the body', 'Здраве и тяло'),
    b('Services and repairs', 'Услуги и ремонти'),
    b('City life', 'Живот в града'),
    b('Plans and appointments', 'Планове и срещи'),
    b('Invitations and social situations', 'Покани и социални ситуации'),
    b('Giving advice', 'Даване на съвет'),
    b('Describing past events', 'Описание на минали събития'),
    b('Everyday problems', 'Всекидневни проблеми'),
    b('Basic bureaucracy', 'Основна администрация'),
    b('Phone conversations', 'Телефонни разговори'),
  ],
  grammar: [
    b('Perfekt with haben and sein', 'Perfekt с haben и sein'),
    b('Common Präteritum forms: war, hatte, es gab', 'Често срещани форми в Präteritum: war, hatte, es gab'),
    b('Accusative and dative expansion', 'Разширяване на винителен и дателен падеж'),
    b('Two-way prepositions: in, an, auf, unter ...', 'Двупосочни предлози: in, an, auf, unter ...'),
    b('Reflexive verbs', 'Възвратни глаголи'),
    b('Subordinate clauses with weil, dass, wenn', 'Подчинени изречения с weil, dass, wenn'),
    b('Comparative and superlative', 'Сравнителна и превъзходна степен'),
    b('Introduction to adjective endings', 'Въведение в окончанията на прилагателните'),
    b('Talking about the future', 'Говорене за бъдещето'),
    b('Modal constructions', 'Модални конструкции'),
  ],
  plannedUnits: [
    b('Last weekend: the Perfekt', 'Миналият уикенд: Perfekt'),
    b('Home, city and services', 'Дом, град и услуги'),
    b('Work and education', 'Работа и образование'),
    b('Health and advice', 'Здраве и съвети'),
    b('Travel and problems', 'Пътуване и проблеми'),
  ],
};

export const B1_OUTLINE: LevelOutline = {
  id: 'b1',
  label: 'B1',
  title: b('Living in Germany', 'Животът в Германия'),
  description: b(
    'The level that makes daily life in Germany work: flat hunting, authorities, doctors, schools, work and formal correspondence.',
    'Нивото, което прави всекидневния живот в Германия възможен: търсене на жилище, институции, лекари, училище, работа и официална кореспонденция.',
  ),
  outcomes: [
    b('I can handle an apartment viewing and communicate with a landlord.', 'Мога да се справя с оглед на жилище и да общувам с наемодател.'),
    b('I can complete an Anmeldung and deal with German authorities.', 'Мога да направя Anmeldung и да се оправям с немските институции.'),
    b('I can describe symptoms to a doctor and understand the answer.', 'Мога да опиша симптоми на лекар и да разбера отговора.'),
    b('I can write a formal email and a job application.', 'Мога да напиша официален имейл и кандидатура за работа.'),
    b('I can express and defend an opinion on a familiar topic.', 'Мога да изразя и защитя мнение по позната тема.'),
  ],
  topics: [
    b('Apartment searching and rental communication', 'Търсене на жилище и комуникация за наем'),
    b('Landlords and neighbours', 'Наемодатели и съседи'),
    b('Workplace communication', 'Общуване на работното място'),
    b('Job applications and interviews', 'Кандидатстване за работа и интервюта'),
    b('German bureaucracy and the Anmeldung', 'Немската администрация и Anmeldung'),
    b('Banking and insurance', 'Банки и осигуровки'),
    b('Doctor visits and the pharmacy', 'Посещения при лекар и аптека'),
    b('Kindergarten and school communication', 'Общуване с детска градина и училище'),
    b('Travel problems and customer service', 'Проблеми при пътуване и обслужване на клиенти'),
    b('Opinions, news, technology, environment', 'Мнения, новини, технологии, околна среда'),
    b('Formal and informal correspondence', 'Официална и неофициална кореспонденция'),
  ],
  grammar: [
    b('Relative clauses', 'Относителни изречения'),
    b('Konjunktiv II for politeness and hypotheses', 'Konjunktiv II за учтивост и хипотези'),
    b('Introduction to the passive', 'Въведение в страдателния залог'),
    b('Infinitive with zu', 'Инфинитив със zu'),
    b('Advanced subordinate clauses', 'Сложни подчинени изречения'),
    b('Full adjective declension', 'Пълно склонение на прилагателните'),
    b('Temporal and causal connectors', 'Временни и причинни съюзи'),
    b('Advanced prepositions', 'Сложни предлози'),
    b('Narrating the past', 'Разказване в минало време'),
  ],
  plannedUnits: [
    b('Finding and renting a flat', 'Намиране и наемане на жилище'),
    b('Authorities and paperwork', 'Институции и документи'),
    b('Health and insurance', 'Здраве и осигуровки'),
    b('Work and applications', 'Работа и кандидатстване'),
    b('Family, school and daily life', 'Семейство, училище и ежедневие'),
    b('Opinions and written German', 'Мнения и писмен немски'),
  ],
};

export const B2_OUTLINE: LevelOutline = {
  id: 'b2',
  label: 'B2',
  title: b('Confident and independent', 'Уверено и самостоятелно'),
  description: b(
    'Professional and abstract German: meetings, negotiation, argument, register, and natural spoken German.',
    'Професионален и абстрактен немски: срещи, преговори, аргументация, стилови нива и естествен говорим немски.',
  ),
  outcomes: [
    b('I can take part in a meeting and present a position clearly.', 'Мога да участвам в работна среща и да изложа позиция ясно.'),
    b('I can argue for and against something with structured language.', 'Мога да аргументирам за и против нещо със структуриран език.'),
    b('I can write a professional email, report or formal complaint.', 'Мога да напиша професионален имейл, доклад или официална жалба.'),
    b('I can follow news articles and longer conversations.', 'Мога да следя новинарски статии и по-дълги разговори.'),
    b('I can switch between formal and informal register appropriately.', 'Мога да преминавам подходящо между официален и неофициален стил.'),
  ],
  topics: [
    b('Professional communication and meetings', 'Професионална комуникация и срещи'),
    b('Presentations and reports', 'Презентации и доклади'),
    b('Workplace disagreements and negotiation', 'Работни спорове и преговори'),
    b('News, articles and media', 'Новини, статии и медии'),
    b('Technology, culture and society', 'Технологии, култура и общество'),
    b('Abstract topics and complex opinions', 'Абстрактни теми и сложни мнения'),
    b('Formal writing and professional emails', 'Официално писане и професионални имейли'),
    b('Interviews and longer conversations', 'Интервюта и по-дълги разговори'),
    b('Natural spoken German and idioms', 'Естествен говорим немски и идиоми'),
    b('Register differences', 'Разлики в стиловите нива'),
  ],
  grammar: [
    b('Passive structures in all tenses', 'Страдателни конструкции във всички времена'),
    b('Konjunktiv I in reported speech', 'Konjunktiv I в преизказна реч'),
    b('Konjunktiv II for nuance', 'Konjunktiv II за нюанс'),
    b('Sophisticated connectors', 'Изтънчени съюзни средства'),
    b('Nominalisation', 'Номинализация'),
    b('Advanced adjective endings', 'Сложни окончания на прилагателните'),
    b('Advanced relative clauses', 'Сложни относителни изречения'),
    b('Complex word order', 'Сложен словоред'),
    b('Modal particles: doch, mal, ja, eben', 'Модални частици: doch, mal, ja, eben'),
    b('Formal versus informal register', 'Официален срещу неофициален стил'),
  ],
  plannedUnits: [
    b('At work: meetings and projects', 'На работа: срещи и проекти'),
    b('Argument and negotiation', 'Аргументация и преговори'),
    b('Media and society', 'Медии и общество'),
    b('Formal written German', 'Официален писмен немски'),
    b('Natural spoken German', 'Естествен говорим немски'),
  ],
};

export const LEVEL_OUTLINES: Record<'pre-a1' | 'a1' | 'a2' | 'b1' | 'b2', LevelOutline> = {
  'pre-a1': PRE_A1_OUTLINE,
  a1: A1_OUTLINE,
  a2: A2_OUTLINE,
  b1: B1_OUTLINE,
  b2: B2_OUTLINE,
};
