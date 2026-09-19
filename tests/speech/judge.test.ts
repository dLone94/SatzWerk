import { describe, expect, it } from 'vitest';
import { LEXICON } from '../../src/content/index.ts';
import type { AnswerSpec } from '../../src/content/types.ts';
import { judgeSpoken, normaliseSpoken, sameWords } from '../../src/core/validation/speech.ts';

/**
 * Judging speech is judging the speaker, not the recogniser.
 *
 * A recogniser invents punctuation, since nobody pronounces a full stop, and
 * capitalises by its own rules. Marking either wrong would tell a learner they
 * mispronounced a capital letter. Everything audible — case endings, word
 * order, the article — is judged by exactly the same validator the typing loop
 * uses, and these tests pin both halves of that.
 */

const opts = { lexicon: LEXICON };

const spec = (accepted: string[], alternatives?: string[]): AnswerSpec => ({
  accepted,
  shape: 'sentence',
  ...(alternatives ? { alternatives } : {}),
});

describe('normalising what was heard', () => {
  it('drops the punctuation a microphone cannot carry', () => {
    expect(normaliseSpoken('Ich komme aus Bulgarien.')).toBe('Ich komme aus Bulgarien');
    expect(normaliseSpoken('Wie heißen Sie?')).toBe('Wie heißen Sie');
    expect(normaliseSpoken('Ja,  bitte!')).toBe('Ja bitte');
  });

  it('matches words regardless of case and punctuation', () => {
    expect(sameWords('ich komme aus bulgarien', 'Ich komme aus Bulgarien.')).toBe(true);
    expect(sameWords('Ich komme aus Deutschland', 'Ich komme aus Bulgarien.')).toBe(false);
  });
});

describe('judging a spoken answer', () => {
  it('accepts the right sentence however the recogniser punctuated it', () => {
    const judgement = judgeSpoken('ich komme aus bulgarien', spec(['Ich komme aus Bulgarien.']), opts);
    expect(judgement.understood).toBe(true);
    expect(judgement.result.verdict).toBe('correct');
    expect(judgement.result.categories).toEqual([]);
  });

  /**
   * The point of the whole module: nobody can hear a capital letter, so a
   * lowercase noun from the recogniser is not a mistake the speaker made.
   */
  it('never reports capitalisation or punctuation against a speaker', () => {
    const judgement = judgeSpoken('das ist meine tochter', spec(['Das ist meine Tochter.']), opts);
    expect(judgement.result.categories).not.toContain('capitalization');
    expect(judgement.result.categories).not.toContain('punctuation');
    expect(judgement.result.requireRetype).toBe(false);
  });

  it('still judges everything that can be heard', () => {
    // A wrong preposition is a wrong preposition, said or written.
    const judgement = judgeSpoken('ich komme von Bulgarien', spec(['Ich komme aus Bulgarien.']), opts);
    expect(judgement.understood).toBe(false);
    expect(judgement.result.verdict).not.toBe('correct');
    expect(judgement.result.categories.length).toBeGreaterThan(0);
  });

  it('judges a case mistake exactly as the typing loop would', () => {
    const answer = spec(['Ich kenne deinen Onkel.']);
    const spoken = judgeSpoken('ich kenne dein onkel', answer, opts);
    expect(spoken.result.verdict).not.toBe('correct');
    expect(spoken.result.categories.length).toBeGreaterThan(0);
  });

  it('accepts any of several accepted answers', () => {
    const answer = spec(['Am Montag arbeite ich.', 'Ich arbeite am Montag.']);
    expect(judgeSpoken('ich arbeite am montag', answer, opts).understood).toBe(true);
    expect(judgeSpoken('am montag arbeite ich', answer, opts).understood).toBe(true);
  });

  it('reports what it heard, so a mishearing is visible as a mishearing', () => {
    const judgement = judgeSpoken('ich komme aus bulgarien', spec(['Ich komme aus Bulgarien.']), opts);
    expect(judgement.heard).toBe('ich komme aus bulgarien');
  });
});
