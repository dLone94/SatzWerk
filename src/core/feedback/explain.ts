import type { Bilingual, ErrorCategory, Gender } from '../../content/types.ts';
import type { GermanLexicon } from '../validation/lexicon.ts';
import type { ValidationResult } from '../validation/validate.ts';
import { lower } from '../validation/text.ts';

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

const INDEFINITE_FOR_GENDER: Record<Gender, string> = { m: 'ein', f: 'eine', n: 'ein' };
const DEFINITE_FOR_GENDER: Record<Gender, string> = { m: 'der', f: 'die', n: 'das' };

const HEADLINES: Record<FeedbackTone, Bilingual> = {
  success: bi('Correct.', 'Вярно.'),
  note: bi('Accepted — with one note.', 'Приема се — с една забележка.'),
  almost: bi('Almost right.', 'Почти правилно.'),
  error: bi('Not quite.', 'Не съвсем.'),
};

/** Find the substitution the learner made, if there is exactly one clear one. */
function firstChange(result: ValidationResult): { expected: string; given: string } | undefined {
  const entry = result.diff.find((d) => d.status === 'changed' || d.status === 'case');
  if (entry?.expected && entry.given) return { expected: entry.expected, given: entry.given };
  return undefined;
}

function missingWord(result: ValidationResult): string | undefined {
  return result.diff.find((d) => d.status === 'missing')?.expected;
}

function extraWord(result: ValidationResult): string | undefined {
  return result.diff.find((d) => d.status === 'extra')?.given;
}

/** The noun that follows the changed article, used for gender explanations. */
function nounAfterChange(result: ValidationResult): string | undefined {
  const index = result.diff.findIndex((d) => d.status === 'changed');
  if (index < 0) return undefined;
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
  const change = firstChange(result);
  const expected = change?.expected ?? '';
  const given = change?.given ?? '';

  switch (category) {
    case 'gender':
    case 'article': {
      const noun = nounAfterChange(result);
      const info = noun ? ctx.describeNoun?.(noun) : undefined;
      const gender = info?.gender ?? (noun ? ctx.lexicon.nounGender.get(lower(noun)) : undefined);
      if (noun && gender) {
        const genderName = GENDER_NAME[gender];
        const definite = `${DEFINITE_FOR_GENDER[gender]} ${noun}`;
        const indefinite = `${INDEFINITE_FOR_GENDER[gender]} ${noun}`;
        const isIndefinite = /^(ein|eine|einen|einem|einer|kein|keine)$/i.test(expected);
        const wanted = isIndefinite ? indefinite : definite;
        return [
          bi(
            `"${noun}" is ${genderName.en}: ${definite}.`,
            `„${noun}“ е от ${genderName.bg}: ${definite}.`,
          ),
          bi(
            `So here German uses "${wanted}", not "${given} ${noun}".`,
            `Затова тук на немски се използва „${wanted}“, а не „${given} ${noun}“.`,
          ),
        ];
      }
      return [
        bi(
          `The article has to be "${expected}" here, not "${given}".`,
          `Членът тук трябва да е „${expected}“, а не „${given}“.`,
        ),
      ];
    }

    case 'verb-conjugation': {
      const analysis = ctx.lexicon.verbForms.get(lower(expected))?.[0];
      const lemma = analysis?.lemma;
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

    case 'verb-tense':
      return [
        bi(
          `Right verb, wrong tense: use "${expected}" here.`,
          `Правилен глагол, но грешно време: тук се използва „${expected}“.`,
        ),
      ];

    case 'auxiliary-verb':
      return [
        bi(
          `This sentence needs the auxiliary "${expected}".`,
          `Това изречение изисква спомагателния глагол „${expected}“.`,
        ),
      ];

    case 'word-order':
      return [
        bi(
          'All your words are right, but German puts them in a different order. In a German main clause the conjugated verb stands in second position.',
          'Всички думи са верни, но немският ги подрежда иначе. В немското главно изречение спрегнатият глагол стои на второ място.',
        ),
      ];

    case 'preposition':
      return [
        bi(
          `German uses "${expected}" here, not "${given}". Prepositions rarely map one-to-one, so they are worth learning with the phrase.`,
          `Немският използва „${expected}“ тук, а не „${given}“. Предлозите почти никога не си съответстват едно към едно, затова се учат заедно с израза.`,
        ),
      ];

    case 'pronoun': {
      if (lower(expected) === 'sie') {
        return [
          bi(
            'Capitalisation matters here: "Sie" is the formal "you", while "sie" means "she" or "they".',
            'Главната буква тук е важна: „Sie“ е учтивото „Вие“, а „sie“ означава „тя“ или „те“.',
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
      const noun = result.diff.find((d) => d.status === 'case')?.expected;
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

    case 'umlaut':
      // The headline already says the meaning is right, so this line only has
      // to explain the spelling.
      return [
        bi(
          'In standard German spelling this word uses the special letter, so write it that way — the buttons under the field insert them.',
          'В стандартния немски правопис тази дума се пише със специалната буква, така че я напиши така — бутоните под полето я вписват.',
        ),
      ];

    case 'punctuation':
      return [
        bi('Small thing: the punctuation at the end.', 'Малка подробност: пунктуацията в края.'),
      ];

    case 'spelling':
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

function correctionLine(target: string): Bilingual {
  return bi(`The correct answer is: ${target}`, `Правилният отговор е: ${target}`);
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
      lines: [result.trapFeedback, correctionLine(result.target)],
      correction: result.target,
      askRetype: result.requireRetype,
    };
  }

  const categories = result.verdict === 'accepted-with-note' ? result.notes : result.categories;
  // Several categories can share one explanation (article and gender describe
  // the same slip), so the same paragraph must not be printed twice.
  const lines = dedupeLines(categories.flatMap((category) => explainCategory(category, result, ctx)));

  const tone: FeedbackTone =
    result.verdict === 'accepted-with-note' ? 'note' : result.verdict === 'almost' ? 'almost' : 'error';

  const headline =
    result.verdict === 'accepted-with-note'
      ? bi('Meaning is correct.', 'Смисълът е правилен.')
      : HEADLINES[tone];

  if (result.verdict !== 'accepted-with-note') {
    lines.push(correctionLine(result.target));
  } else {
    lines.push(
      bi(`Standard spelling: ${result.target}`, `Стандартен правопис: ${result.target}`),
    );
  }

  return {
    tone,
    headline,
    lines: lines.length > 0 ? lines : [correctionLine(result.target)],
    correction: result.target,
    askRetype: result.requireRetype,
  };
}
