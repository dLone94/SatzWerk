import { Fragment, type ReactNode } from 'react';
import type { DefiniteArticle, Gender, VocabEntry } from '../../content/types.ts';
import { useApp } from '../../state/AppState.tsx';

/**
 * Der, die, das in colour.
 *
 * The article of a German noun is set on a small block of its gender's
 * colour — blue der, red die, green das — with the article's own word always
 * there beside it, so the colour is a second way of seeing it and never the
 * only one. Only the nominative singular article is coloured: "die" in front
 * of a plural, or "der" in front of a feminine noun in the dative, is not a
 * gender, and colouring it would teach the wrong one.
 */

const ARTICLE_OF: Record<Gender, DefiniteArticle> = { m: 'der', f: 'die', n: 'das' };

/** The article, on its gender's block. */
export function Article({ article }: { article: DefiniteArticle }) {
  return <span className={`gender gender--${article}`}>{article}</span>;
}

/**
 * A vocabulary entry as it is taught ("das Haus"), its article coloured when
 * the entry is a noun with a gender. Plural-only nouns (die Eltern) have no
 * gender, and anything that is not a noun is shown as it is.
 */
export function NounDisplay({ entry }: { entry: Pick<VocabEntry, 'display' | 'article' | 'gender' | 'wordType' | 'plural'> }) {
  const article = nounArticle(entry);
  if (!article) return <>{entry.display}</>;
  return (
    <>
      <Article article={article} />
      {entry.display.slice(article.length)}
    </>
  );
}

/** The article to colour for an entry, if it has one. */
export function nounArticle(
  entry: Pick<VocabEntry, 'display' | 'article' | 'gender' | 'wordType' | 'plural'>,
): DefiniteArticle | undefined {
  if (entry.wordType !== 'noun' || !entry.gender || !entry.article) return undefined;
  if (entry.article !== ARTICLE_OF[entry.gender]) return undefined;
  if (entry.plural !== undefined && entry.plural.toLowerCase() === entry.display.toLowerCase()) return undefined;
  if (!entry.display.toLowerCase().startsWith(`${entry.article} `)) return undefined;
  return entry.article;
}

type DescribeNoun = (noun: string) => { display: string; gender: Gender; plural?: string } | undefined;

/** A run of a sentence: plain text, or an article to colour. */
export type GenderPart = string | { article: DefiniteArticle; text: string };

const ARTICLE_THEN_NOUN = /(^|[^\p{L}])(der|die|das|Der|Die|Das)(\s+)([A-ZÄÖÜ][\p{L}-]*)/gu;

/**
 * Words that put the article after them in the dative or the genitive, where
 * "der" in front of a plural is not a gender ("wegen der Lehrer").
 */
const DATIVE_OR_GENITIVE = new Set([
  'mit', 'von', 'zu', 'aus', 'bei', 'nach', 'seit', 'wegen', 'trotz', 'während', 'aufgrund',
  'hinsichtlich', 'innerhalb', 'außerhalb', 'statt', 'anstatt',
]);

/** Whether a noun's plural is spelt like the noun as written (Lehrer, Lehrer). */
function sameInPlural(info: { plural?: string }, noun: string): boolean {
  return info.plural?.replace(/^(der|die|das)\s+/iu, '').toLowerCase() === noun.toLowerCase();
}

/**
 * Whether "der" before a masculine noun whose plural is spelt like its
 * singular (der Lehrer, die Lehrer) may be the genitive or dative plural
 * instead: after a noun ("die Rechte der Arbeitnehmer") or after a
 * preposition that takes those cases. Then it is not shown as a gender.
 */
function mayBePluralDer(before: string): boolean {
  const match = /([\p{L}-]+)[^\p{L}]*$/u.exec(before);
  if (!match) return false;
  const word = match[1]!;
  if (DATIVE_OR_GENITIVE.has(word.toLowerCase())) return true;
  if (!/^\p{Lu}/u.test(word)) return false;
  // A capital at the start of a sentence says nothing about the word.
  const ahead = before.slice(0, match.index).trimEnd();
  return ahead !== '' && !/[.!?:;"„“»«(]$/u.test(ahead);
}

/**
 * A German sentence split so that each "der/die/das + Noun" whose article is
 * that noun's own (nominative singular) gender can be coloured.
 *
 * `withhold` names nouns (lower case) to leave plain: ones the learner is
 * about to be asked for, whose colour would tell them the gender first.
 * `before` is the text that runs into this one, when it is a piece of a
 * longer line (a bold run): what precedes an article can decide its case.
 */
export function genderParts(
  text: string,
  describeNoun: DescribeNoun,
  withhold?: ReadonlySet<string>,
  before = '',
): GenderPart[] {
  const parts: GenderPart[] = [];
  let last = 0;
  for (const match of text.matchAll(ARTICLE_THEN_NOUN)) {
    const [, lead, written, , noun] = match;
    if (withhold?.has(noun!.toLowerCase())) continue;
    const info = describeNoun(noun!);
    if (!info) continue;
    if (info.plural !== undefined && info.plural.toLowerCase() === info.display.toLowerCase()) continue;
    const article = written!.toLowerCase() as DefiniteArticle;
    if (ARTICLE_OF[info.gender] !== article) continue;
    const start = match.index! + lead!.length;
    if (article === 'der' && sameInPlural(info, noun!) && mayBePluralDer(before + text.slice(0, start))) continue;
    if (start > last) parts.push(text.slice(last, start));
    parts.push({ article, text: written! });
    last = start + written!.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/**
 * German text with the article of each noun on its gender's block.
 *
 * Only for German the learner may already know the answer to: teaching,
 * an answer once given or shown, a line of a conversation. Never for a
 * prompt, a choice or a gap, where the colour would answer a question about
 * the gender before it is asked; `withhold` keeps the nouns of the question
 * still to come plain. The colour adds nothing a screen reader needs: the
 * article's word is there either way, in the same element.
 */
export function GenderedGerman({ text, withhold, before }: { text: string; withhold?: ReadonlySet<string>; before?: string }): ReactNode {
  const { describeNoun } = useApp();
  const parts = genderParts(text, describeNoun, withhold, before);
  if (parts.every((part) => typeof part === 'string')) return text;
  return parts.map((part, index) =>
    typeof part === 'string' ? (
      <Fragment key={index}>{part}</Fragment>
    ) : (
      <span key={index} className={`gender gender--${part.article}`}>
        {part.text}
      </span>
    ),
  );
}

/**
 * The words of a question's answers and choices, lower case: what a line
 * shown before the question must not colour (see `GenderedGerman`).
 */
export function answerWords(steps: ReadonlyArray<{ answer: { accepted: string[] }; choices?: ReadonlyArray<{ de: string }>; scaffold?: string }>): Set<string> {
  const words = new Set<string>();
  for (const step of steps) {
    for (const text of [...step.answer.accepted, ...(step.choices ?? []).map((choice) => choice.de), step.scaffold ?? '']) {
      for (const word of text.split(/[^\p{L}-]+/u)) if (word) words.add(word.toLowerCase());
    }
  }
  return words;
}

/** What the three colours mean: each article beside the name of its gender. */
export function GenderLegend() {
  const { t } = useApp();
  return (
    <div className="gender-legend">
      <p className="gender-legend__title" id="gender-legend-title">
        {t('genderLegend')}
      </p>
      <ul aria-labelledby="gender-legend-title">
        {(['m', 'f', 'n'] as const).map((gender) => (
          <li key={gender}>
            <span lang="de">
              <Article article={ARTICLE_OF[gender]} />
            </span>
            {t(gender === 'm' ? 'wordGenderM' : gender === 'f' ? 'wordGenderF' : 'wordGenderN')}
          </li>
        ))}
      </ul>
    </div>
  );
}
