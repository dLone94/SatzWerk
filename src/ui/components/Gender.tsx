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
 * A German sentence split so that each "der/die/das + Noun" whose article is
 * that noun's own (nominative singular) gender can be coloured.
 */
export function genderParts(text: string, describeNoun: DescribeNoun): GenderPart[] {
  const parts: GenderPart[] = [];
  let last = 0;
  for (const match of text.matchAll(ARTICLE_THEN_NOUN)) {
    const [, before, written, , noun] = match;
    const info = describeNoun(noun!);
    if (!info) continue;
    if (info.plural !== undefined && info.plural.toLowerCase() === info.display.toLowerCase()) continue;
    const article = written!.toLowerCase() as DefiniteArticle;
    if (ARTICLE_OF[info.gender] !== article) continue;
    const start = match.index! + before!.length;
    if (start > last) parts.push(text.slice(last, start));
    parts.push({ article, text: written! });
    last = start + written!.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** German text with the article of each noun on its gender's block. */
export function GenderedGerman({ text }: { text: string }): ReactNode {
  const { describeNoun } = useApp();
  const parts = genderParts(text, describeNoun);
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
