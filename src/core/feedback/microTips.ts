import type { Bilingual, ErrorCategory } from '../../content/types.ts';

/** Small authored reminders alongside a correction. No provider is required. */
const TIPS: Partial<Record<ErrorCategory, Bilingual>> = {
  article: { en: 'Remember the article and noun together: der Termin. German nouns have a gender even when English nouns do not.', bg: 'Запомняй члена със съществителното: der Termin. За разлика от българския немският член стои пред думата; родът може да е различен.' },
  gender: { en: 'Learn a noun as one chunk: der, die or das + the noun. Its meaning alone does not reliably tell you its gender.', bg: 'Учи съществителното като едно цяло: der, die или das + думата. Немският и българският род невинаги съвпадат.' },
  'word-order': { en: 'In a statement, the conjugated verb takes the second position: Morgen gehe ich … After weil or dass, it moves to the end.', bg: 'В съобщително изречение спрегнатият глагол е на второ място: Morgen gehe ich … Българският словоред е по-свободен. След weil или dass глаголът отива в края.' },
  case: { en: 'Check what the verb or preposition needs. Mit takes the dative: mit dem Bus. The article changes with the noun’s role.', bg: 'Провери какво изисква глаголът или предлогът. Mit изисква дателен падеж: mit dem Bus. В немския ролята на думата променя члена.' },
  'verb-conjugation': { en: 'Match the verb ending to the person: ich wohne, du wohnst, er wohnt. Say the person and verb together.', bg: 'Съгласувай глаголното окончание с лицето: ich wohne, du wohnst, er wohnt. Казвай местоимението и глагола заедно, както учиш българските окончания.' },
  plural: { en: 'Learn the singular and plural as a pair: der Termin → die Termine. German plurals have several patterns.', bg: 'Учи единственото и множественото число като двойка: der Termin → die Termine. Немският има няколко модела за множествено число.' },
  capitalization: { en: 'German nouns start with a capital letter, even in the middle of a sentence: Ich habe einen Termin.', bg: 'Немските съществителни започват с главна буква и в средата на изречението: Ich habe einen Termin. Това е различно от българския.' },
  preposition: { en: 'Learn the preposition with the phrase: zur Schule, mit dem Bus, am Montag. A word-for-word translation often misses the pattern.', bg: 'Учи предлога с цялата фраза: zur Schule, mit dem Bus, am Montag. Буквалният превод от български често не запазва модела.' },
};
export function microTip(categories: ErrorCategory[]): Bilingual | undefined {
  return categories.map(category => TIPS[category]).find(Boolean);
}
