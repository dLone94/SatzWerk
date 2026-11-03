import { createBaseLexicon, extendLexicon, type GermanLexicon } from '../core/validation/lexicon.ts';
import type { VocabEntry } from './types.ts';

/*
 * A participle in front of a noun takes adjective endings — die steigenden
 * Mieten, die geplante Reform — so both participles of every verb are also
 * known as adjectives. Without them, a wrong ending on one ("steigende" for
 * "steigenden") is a form of no taught adjective, and it fell through to a
 * spelling slip with credit instead of the ending mistake it is. Partizip I
 * is the infinitive plus -d; sein and tun, which do not end in -en, -ln or
 * -rn, are left alone rather than given a wrong one.
 */
function attributiveParticiples(entry: VocabEntry): string[] {
  if (entry.wordType !== 'verb' || /\s/.test(entry.german)) return [];
  const present = /(en|[lr]n)$/.test(entry.german) ? [`${entry.german}d`] : [];
  return [...present, ...(entry.perfect ? [entry.perfect.participle] : [])];
}

export function createContentLexicon(VOCABULARY: VocabEntry[]) {
  const LEXICON: GermanLexicon = extendLexicon(createBaseLexicon(), [
    ...VOCABULARY.map((entry) => ({
      german: entry.german,
      wordType: entry.wordType,
      gender: entry.gender,
      plural: entry.plural,
      display: entry.display,
      participle: entry.perfect?.participle,
    })),
    ...VOCABULARY.flatMap(attributiveParticiples).map((german) => ({ german, wordType: 'adjective' as const })),
  ]);

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
