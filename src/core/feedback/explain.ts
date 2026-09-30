import type { Bilingual, ErrorCategory, Gender } from '../../content/types.ts';
import type { GermanLexicon } from '../validation/lexicon.ts';
import { lower } from '../validation/text.ts';
import { categorizePair, type ValidationResult } from '../validation/validate.ts';

/**
 * Turns a validation result into an explanation in the learner's language.
 *
 * The rule from the product brief: never just say "Wrong." Every message names
 * what went wrong, why German works that way, and what the correct sentence is.
 */

export type FeedbackTone = 'success' | 'note' | 'almost' | 'error';

export interface FeedbackMessage {
  tone: FeedbackTone;
  headline: Bilingual;
  /** One or more short explanatory paragraphs. */
  lines: Bilingual[];
  /** The German the learner should end up with. */
  correction: string;
  askRetype: boolean;
}

export interface NounInfo {
  /** "die Tochter" */
  display: string;
  gender: Gender;
  /** "die Töchter" */
  plural?: string;
}

export interface FeedbackContext {
  lexicon: GermanLexicon;
  describeNoun?: (noun: string) => NounInfo | undefined;
}

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

const GENDER_NAME: Record<Gender, Bilingual> = {
  m: bi('masculine', 'мъжки род'),
  f: bi('feminine', 'женски род'),
  n: bi('neuter', 'среден род'),
};

const DEFINITE_FOR_GENDER: Record<Gender, string> = { m: 'der', f: 'die', n: 'das' };

const HEADLINES: Record<FeedbackTone, Bilingual> = {
  success: bi('Correct.', 'Вярно.'),
  note: bi('Accepted — with one note.', 'Приема се — с една забележка.'),
  almost: bi('Almost right.', 'Почти правилно.'),
  error: bi('Not quite.', 'Не съвсем.'),
};

interface Change {
  expected: string;
  given: string;
  /** Where the change sits in the diff. */
  index: number;
}

/**
 * The substitution a category of mistake is about. Each line quotes the word
 * its own mistake is in: taking the first changed word for every category
 * told "Das Tisch sind groß." that the verb ending was "Der", not "Das".
 */
function changeFor(category: ErrorCategory, result: ValidationResult, ctx: FeedbackContext): Change | undefined {
  const entries = result.diff
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => (entry.status === 'changed' || entry.status === 'case') && entry.expected && entry.given);
  const toChange = ({ entry, index }: (typeof entries)[number]): Change => ({
    expected: entry.expected!,
    given: entry.given!,
    index,
  });
  if (category === 'capitalization') {
    const cased = entries.find(({ entry }) => entry.status === 'case');
    return cased ? toChange(cased) : undefined;
  }
  const own = entries.find(({ entry, index }) => {
    if (entry.status === 'case') return category === 'pronoun' && lower(entry.expected!) === 'sie';
    const next = result.diff.slice(index + 1).find((later) => later.expected)?.expected;
    return categorizePair(entry.expected!, entry.given!, ctx.lexicon, next).includes(category);
  });
  if (own) return toChange(own);
  // A mistake the lexicon cannot place (an authored trap, say) still has its
  // word when the answer changed only one.
  const changed = entries.filter(({ entry }) => entry.status === 'changed');
  return changed.length === 1 ? toChange(changed[0]!) : undefined;
}

function missingWord(result: ValidationResult): string | undefined {
  return result.diff.find((d) => d.status === 'missing')?.expected;
}

function extraWord(result: ValidationResult): string | undefined {
  return result.diff.find((d) => d.status === 'extra')?.given;
}

/**
 * The nominative of the article or determiner `form` for a noun of `gender`:
 * dem → das for a neuter noun, keinen → kein, meine stays meine. Undefined for
 * a word that is not one.
 */
function nominativeOf(form: string, gender: Gender): string | undefined {
  const word = lower(form);
  if (/^(der|die|das|den|dem|des)$/.test(word)) return matchInitial(form, DEFINITE_FOR_GENDER[gender]);
  const stem = /^(ein|kein|mein|dein|sein|ihr|unser|euer|eur)(e|en|em|er|es)?$/.exec(word)?.[1];
  if (!stem) return undefined;
  const base = stem === 'eur' ? 'euer' : stem;
  return matchInitial(form, gender === 'f' ? `${stem === 'euer' ? 'eur' : stem}e` : base);
}

/** `word` with the first letter in the case of `model`'s. */
function matchInitial(model: string, word: string): string {
  return model[0] === model[0]!.toUpperCase() ? word[0]!.toUpperCase() + word.slice(1) : word;
}

/** The noun that follows an article, used for gender explanations. */
function nounAfter(result: ValidationResult, index: number): string | undefined {
  for (let i = index + 1; i < result.diff.length; i += 1) {
    const expected = result.diff[i]?.expected;
    if (expected) return expected;
  }
  return undefined;
}

function explainCategory(
  category: ErrorCategory,
  result: ValidationResult,
  ctx: FeedbackContext,
): Bilingual[] {
  const change = changeFor(category, result, ctx);
  const expected = change?.expected ?? '';
  const given = change?.given ?? '';

  switch (category) {
    case 'gender':
    case 'article': {
      if (!change) {
        return [bi('Check the article in front of the noun.', 'Провери члена пред съществителното.')];
      }
      const noun = nounAfter(result, change.index);
      const info = noun ? ctx.describeNoun?.(noun) : undefined;
      const gender = info?.gender ?? (noun ? ctx.lexicon.nounGender.get(lower(noun)) : undefined);
      if (!noun || !gender) {
        return [
          bi(
            `The article has to be "${expected}" here, not "${given}".`,
            `Членът тук трябва да е „${expected}“, а не „${given}“.`,
          ),
        ];
      }
      // The form to use is the one in the answer ("dem Auto", "Meine Oma",
      // "keinen Bruder"). Rebuilding it from the gender always gave the
      // nominative, and "mit das Auto" was told to use "das Auto".
      const lines: Bilingual[] = [];
      // A noun used only in the plural (die Eltern) has no gender to learn.
      const pluralOnly = info?.plural !== undefined && lower(info.plural) === lower(info.display);
      const namesGender = result.categories.includes('gender') || category === 'gender';
      if (namesGender) {
        lines.push(
          pluralOnly
            ? bi(`"${noun}" is plural: ${info!.display}.`, `„${noun}“ е в множествено число: ${info!.display}.`)
            : bi(
                `"${noun}" is ${GENDER_NAME[gender].en}: ${DEFINITE_FOR_GENDER[gender]} ${noun}.`,
                `„${noun}“ е от ${GENDER_NAME[gender].bg}: ${DEFINITE_FOR_GENDER[gender]} ${noun}.`,
              ),
        );
      }
      // "So" follows from the gender line; on its own the line starts plainly.
      lines.push(
        namesGender
          ? bi(
              `So here German uses "${expected} ${noun}", not "${given} ${noun}".`,
              `Затова тук на немски се използва „${expected} ${noun}“, а не „${given} ${noun}“.`,
            )
          : bi(
              `Here German uses "${expected} ${noun}", not "${given} ${noun}".`,
              `Тук на немски се използва „${expected} ${noun}“, а не „${given} ${noun}“.`,
            ),
      );
      // Right gender, wrong case: say that the article changes with the case.
      const nominative = pluralOnly ? undefined : nominativeOf(expected, gender);
      if (nominative && lower(nominative) !== lower(expected)) {
        lines.push(
          bi(
            `"${nominative} ${noun}" changes its article with the case: here it is "${expected} ${noun}".`,
            `„${nominative} ${noun}“ сменя члена си според падежа: тук е „${expected} ${noun}“.`,
          ),
        );
      }
      return lines;
    }

    case 'verb-conjugation': {
      if (!change) {
        return [
          bi(
            'Check the verb ending: it changes with the person.',
            'Провери окончанието на глагола: то се сменя според лицето.',
          ),
        ];
      }
      const analysis = ctx.lexicon.verbForms.get(lower(expected))?.[0];
      const lemma =
        analysis?.lemma ??
        ctx.lexicon.inflections
          .get(lower(expected))
          ?.find((word) => word.startsWith('verb:'))
          ?.slice('verb:'.length);
      return [
        bi(
          lemma
            ? `The verb "${lemma}" changes its ending with the person. Here you need "${expected}", not "${given}".`
            : `The verb ending is wrong: "${expected}", not "${given}".`,
          lemma
            ? `Глаголът „${lemma}“ сменя окончанието си според лицето. Тук трябва „${expected}“, а не „${given}“.`
            : `Окончанието на глагола е грешно: „${expected}“, а не „${given}“.`,
        ),
      ];
    }

    case 'adjective-ending':
      return [
        bi(
          change
            ? `The adjective ending is wrong: "${expected}", not "${given}". The ending follows the article, the gender and the case.`
            : 'Check the adjective ending: it follows the article, the gender and the case.',
          change
            ? `Окончанието на прилагателното е грешно: „${expected}“, а не „${given}“. Окончанието зависи от члена, рода и падежа.`
            : 'Провери окончанието на прилагателното: то зависи от члена, рода и падежа.',
        ),
      ];

    case 'verb-tense':
      if (!change) return [bi('Right verb, wrong tense.', 'Правилен глагол, но грешно време.')];
      return [
        bi(
          `Right verb, wrong tense: use "${expected}" here.`,
          `Правилен глагол, но грешно време: тук се използва „${expected}“.`,
        ),
      ];

    case 'auxiliary-verb':
      if (!change) {
        return [bi('Check the auxiliary verb: haben or sein.', 'Провери спомагателния глагол: haben или sein.')];
      }
      return [
        bi(
          `This sentence needs the auxiliary "${expected}".`,
          `Това изречение изисква спомагателния глагол „${expected}“.`,
        ),
      ];

    case 'word-order': {
      // The verb-second rule is only the explanation when the learner broke
      // it. "In Hamburg wohne ich." keeps the verb second; telling it
      // otherwise taught the opposite of the rule it had just applied.
      const order = result.wordOrder;
      if (order?.verbSecond) {
        return [
          bi(
            `All your words are right and the verb is in second place, but this sentence starts with "${order.opening}".`,
            `Всички думи са верни и глаголът е на второ място, но това изречение започва с „${order.opening}“.`,
          ),
        ];
      }
      if (order) {
        return [
          bi(
            'All your words are right, but German puts them in a different order. In a German main clause the conjugated verb stands in second position.',
            'Всички думи са верни, но немският ги подрежда иначе. В немското главно изречение спрегнатият глагол стои на второ място.',
          ),
        ];
      }
      return [
        bi(
          'All your words are right, but German puts them in a different order here.',
          'Всички думи са верни, но тук немският ги подрежда иначе.',
        ),
      ];
    }

    case 'preposition':
      if (!change) {
        return [
          bi(
            'Check the preposition. Prepositions rarely map one-to-one, so they are worth learning with the phrase.',
            'Провери предлога. Предлозите почти никога не си съответстват едно към едно, затова се учат заедно с израза.',
          ),
        ];
      }
      return [
        bi(
          `German uses "${expected}" here, not "${given}". Prepositions rarely map one-to-one, so they are worth learning with the phrase.`,
          `Немският използва „${expected}“ тук, а не „${given}“. Предлозите почти никога не си съответстват едно към едно, затова се учат заедно с израза.`,
        ),
      ];

    case 'pronoun': {
      // Only a Sie written as sie (or the other way round) is about the
      // capital; "du" for "Sie" is the wrong kind of "you".
      if (lower(expected) === 'sie' && lower(given) === 'sie') {
        return [
          bi(
            'Capitalisation matters here: "Sie" is the formal "you", while "sie" means "she" or "they".',
            'Главната буква тук е важна: „Sie“ е учтивото „Вие“, а „sie“ означава „тя“ или „те“.',
          ),
        ];
      }
      if (!change) return [bi('Check the pronoun.', 'Провери местоимението.')];
      // Inside the sentence a capital Sie can only be the formal "you".
      const opens = change.index === result.diff.findIndex((d) => d.expected !== undefined);
      if (expected === 'Sie' && !opens) {
        return [
          bi(
            `Here German needs the formal "Sie", not "${given}".`,
            `Тук немският изисква учтивото „Sie“, а не „${given}“.`,
          ),
        ];
      }
      return [
        bi(
          `The pronoun should be "${expected}", not "${given}".`,
          `Местоимението трябва да е „${expected}“, а не „${given}“.`,
        ),
      ];
    }

    case 'plural': {
      if (!change) return [bi('Watch the number: singular or plural.', 'Внимавай с числото: единствено или множествено.')];
      const info = ctx.describeNoun?.(expected);
      return [
        bi(
          info?.plural
            ? `Watch the number: singular ${info.display}, plural ${info.plural}. Here you need "${expected}".`
            : `Here German needs "${expected}", not "${given}".`,
          info?.plural
            ? `Внимавай с числото: единствено ${info.display}, множествено ${info.plural}. Тук трябва „${expected}“.`
            : `Тук немският изисква „${expected}“, а не „${given}“.`,
        ),
      ];
    }

    case 'capitalization': {
      if (result.verdict === 'accepted-with-note') {
        // A capital added to a word that stands on its own ("Der Tisch") is
        // fine German; the note only says how it is written inside a sentence.
        const raised = result.diff.find(
          (d) => d.status === 'case' && d.given && d.expected && d.given[0] !== d.expected[0] && d.expected[0] === lower(d.expected[0]!),
        );
        if (raised) {
          return [
            bi(
              `Fine on its own. Inside a sentence it is written "${result.target}".`,
              `Така е добре самостоятелно. В изречение се пише „${result.target}“.`,
            ),
          ];
        }
        return [
          bi(
            'Small thing: a German sentence starts with a capital letter.',
            'Малка подробност: немското изречение започва с главна буква.',
          ),
        ];
      }
      // A lowercase noun is the lesson; the sentence's first word is not.
      const cased = result.diff.filter((d) => d.status === 'case').map((d) => d.expected ?? '');
      const noun = cased.find((word) => ctx.lexicon.nounGender.has(lower(word))) ?? cased[0];
      const isNoun = noun ? ctx.lexicon.nounGender.has(lower(noun)) : false;
      return [
        bi(
          isNoun
            ? `German writes every noun with a capital letter: "${noun}".`
            : 'Check the capital letters — German capitalises every noun and the first word of a sentence.',
          isNoun
            ? `В немския всяко съществително се пише с главна буква: „${noun}“.`
            : 'Провери главните букви — в немския всяко съществително и първата дума в изречението се пишат с главна буква.',
        ),
      ];
    }

    case 'umlaut': {
      // The dots left off altogether: say which letter, since that letter is
      // the whole lesson.
      if (result.verdict === 'almost') {
        const word =
          result.diff.find((d) => d.expected && /[äöüß]/i.test(d.expected) && d.given !== d.expected)?.expected ??
          result.target;
        const letters = [...new Set(word.match(/[äöüß]/gi) ?? [])];
        const dots = letters.some((letter) => letter.toLowerCase() !== 'ß');
        return [
          bi(
            `"${word}" is written with ${letters.join(', ')}.${dots ? ' The dots change the sound, and sometimes the meaning.' : ''}`,
            `„${word}“ се пише с ${letters.join(', ')}.${dots ? ' Точките променят звука, а понякога и смисъла.' : ''}`,
          ),
        ];
      }
      // The headline already says the meaning is right, so this line only has
      // to explain the spelling.
      return [
        bi(
          'In standard German spelling this word uses the special letter, so write it that way — the buttons under the field insert them.',
          'В стандартния немски правопис тази дума се пише със специалната буква, така че я напиши така — бутоните под полето я вписват.',
        ),
      ];
    }

    case 'punctuation':
      return [
        bi('Small thing: the punctuation at the end.', 'Малка подробност: пунктуацията в края.'),
      ];

    case 'spelling':
      if (!change) {
        return [bi('Close — check the spelling.', 'Почти — провери правописа.')];
      }
      return [
        bi(
          `Close — "${expected}" is spelled slightly differently from what you typed.`,
          `Почти — „${expected}“ се пише малко по-различно от това, което написа.`,
        ),
      ];

    case 'missing-word': {
      const word = missingWord(result);
      return [
        bi(
          word ? `One word is missing: "${word}".` : 'One word is missing.',
          word ? `Липсва една дума: „${word}“.` : 'Липсва една дума.',
        ),
      ];
    }

    case 'extra-word': {
      const word = extraWord(result);
      return [
        bi(
          word ? `German does not need "${word}" here.` : 'There is one word too many.',
          word ? `Немският не се нуждае от „${word}“ тук.` : 'Има една дума в повече.',
        ),
      ];
    }

    case 'vocabulary':
      return [
        bi(
          expected
            ? `The word German uses here is "${expected}".`
            : 'One of the words is not the one German uses here.',
          expected
            ? `Думата, която немският използва тук, е „${expected}“.`
            : 'Една от думите не е тази, която немският използва тук.',
        ),
      ];

    case 'case':
      if (!change) return [bi('Check the case ending.', 'Провери падежното окончание.')];
      return [
        bi(
          `The case ending is wrong: "${expected}", not "${given}".`,
          `Падежното окончание е грешно: „${expected}“, а не „${given}“.`,
        ),
      ];

    default:
      return [];
  }
}

function dedupeLines(lines: Bilingual[]): Bilingual[] {
  const seen = new Set<string>();
  return lines.filter((line) => {
    if (seen.has(line.en)) return false;
    seen.add(line.en);
    return true;
  });
}

/** Build the feedback the learner sees after submitting an answer. */
export function buildFeedback(result: ValidationResult, ctx: FeedbackContext): FeedbackMessage {
  if (result.verdict === 'empty') {
    return {
      tone: 'almost',
      headline: bi('Have a go first.', 'Първо опитай.'),
      lines: [
        bi(
          'Type what you think it is. A wrong attempt teaches you more than a revealed answer.',
          'Напиши какво мислиш, че е. Грешният опит учи повече от разкрит отговор.',
        ),
      ],
      correction: result.target,
      askRetype: false,
    };
  }

  if (result.verdict === 'correct') {
    return {
      tone: 'success',
      headline: HEADLINES.success,
      lines: [],
      correction: result.target,
      askRetype: false,
    };
  }

  if (result.verdict === 'accepted-variant') {
    return {
      tone: 'note',
      headline: bi('Correct — that is good German too.', 'Вярно — това също е добър немски.'),
      lines: [
        bi(
          `The form this lesson practises is "${result.target}".`,
          `Формата, която този урок упражнява, е „${result.target}“.`,
        ),
      ],
      correction: result.target,
      askRetype: false,
    };
  }

  if (result.trapFeedback) {
    return {
      tone: 'error',
      headline: HEADLINES.error,
      lines: [result.trapFeedback],
      correction: result.target,
      askRetype: result.requireRetype,
    };
  }

  // An "almost" can carry notes as well (the dots left off beside a capital),
  // and the learner should hear about both.
  const categories =
    result.verdict === 'accepted-with-note' ? result.notes : [...result.categories, ...result.notes];
  // Several categories can share one explanation (article and gender describe
  // the same slip), so the same paragraph must not be printed twice.
  const lines = dedupeLines(categories.flatMap((category) => explainCategory(category, result, ctx)));

  const tone: FeedbackTone =
    result.verdict === 'accepted-with-note' ? 'note' : result.verdict === 'almost' ? 'almost' : 'error';

  const headline =
    result.verdict === 'accepted-with-note'
      ? bi('Meaning is correct.', 'Смисълът е правилен.')
      : HEADLINES[tone];

  // The answer itself is not repeated here: the feedback panel already shows
  // it beside what was typed, and saying it twice only pushed Continue further
  // down the screen.
  if (result.verdict === 'accepted-with-note') {
    lines.push(
      bi(`Standard spelling: ${result.target}`, `Стандартен правопис: ${result.target}`),
    );
  }

  return {
    tone,
    headline,
    lines,
    correction: result.target,
    askRetype: result.requireRetype,
  };
}
