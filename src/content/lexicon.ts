import { createBaseLexicon, extendLexicon, type GermanLexicon } from '../core/validation/lexicon.ts';
import type { VocabEntry } from './types.ts';

export function createContentLexicon(VOCABULARY: VocabEntry[]) {
  const LEXICON: GermanLexicon = extendLexicon(
    createBaseLexicon(),
    VOCABULARY.map((entry) => ({
      german: entry.german,
      wordType: entry.wordType,
      gender: entry.gender,
      plural: entry.plural,
      display: entry.display,
      participle: entry.perfect?.participle,
    })),
  );

  /** Noun description used by the feedback builder for gender explanations. */
  function describeNoun(noun: string):
    | { display: string; gender: NonNullable<VocabEntry['gender']>; plural?: string }
    | undefined {
    const entry = VOCABULARY.find(
      (candidate) => candidate.german.toLowerCase() === noun.toLowerCase() && candidate.gender,
    );
    if (!entry?.gender) return undefined;
    return { display: entry.display, gender: entry.gender, plural: entry.plural };
  }


  return { LEXICON, describeNoun };
}
