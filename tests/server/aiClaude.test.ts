import { describe, expect, it, vi } from 'vitest';
import {
  CLAUDE_MODEL,
  ClaudeFailure,
  claudeConfig,
  createClaudeProvider,
  explainPrompt,
  readExplanation,
  readFindings,
  reviewPrompt,
  type ClaudeCaller,
} from '../../server/ai-claude.ts';
import { createProvider, unavailableProvider } from '../../server/ai.ts';

/**
 * The Claude provider, driven through its seam.
 *
 * Nothing here talks to the network. What is worth pinning is not that an HTTP
 * call can be made — it is the policy around it: that the two teaching paths
 * stay two, that a failure is reported rather than swallowed, that a malformed
 * answer never reaches a learner, and that the deterministic checks survive a
 * model that is unreachable, wrong-shaped or slow.
 */

const config = { apiKey: 'test-key', model: CLAUDE_MODEL };

const answering = (payload: unknown): ClaudeCaller =>
  vi.fn(async () => (typeof payload === 'string' ? payload : JSON.stringify(payload)));

const failing = (reason: 'refused' | 'unreachable' | 'malformed'): ClaudeCaller =>
  vi.fn(async () => {
    throw new ClaudeFailure(reason, 'stub failure');
  });

describe('reading the key', () => {
  it('is off unless a key is actually set', () => {
    expect(claudeConfig({})).toBeNull();
    expect(claudeConfig({ ANTHROPIC_API_KEY: '' })).toBeNull();
    // A key that is only whitespace is not a key. This is the shape a value
    // pasted into a hosting dashboard arrives in.
    expect(claudeConfig({ ANTHROPIC_API_KEY: '   \n' })).toBeNull();
  });

  it('trims the key, because a trailing newline reads as a wrong key', () => {
    expect(claudeConfig({ ANTHROPIC_API_KEY: 'sk-test\n' })).toEqual({
      apiKey: 'sk-test',
      model: CLAUDE_MODEL,
    });
  });
});

describe('choosing a provider', () => {
  it('stays on rule-based checks with no key, without complaining', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(createProvider({})).toBe(unavailableProvider);
    // No key is the ordinary supported state, not a misconfiguration.
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('honours an explicit opt-out even when a key is present', () => {
    // A key in the environment for something else is not consent to spend it
    // here.
    expect(createProvider({ ANTHROPIC_API_KEY: 'sk-test', SATZWERK_AI_PROVIDER: 'none' })).toBe(
      unavailableProvider,
    );
  });

  it('reports availability from the environment alone, loading nothing', () => {
    const provider = createProvider({ ANTHROPIC_API_KEY: 'sk-test' });
    expect(provider.available).toBe(true);
    expect(provider.name).toBe(`claude:${CLAUDE_MODEL}`);
  });

  it('says so when the switch is on but the key is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(createProvider({ SATZWERK_AI_PROVIDER: 'claude' })).toBe(unavailableProvider);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe('the two teaching paths stay two', () => {
  /**
   * The Bulgarian prompt is not the English one translated, and this is the
   * check that keeps it that way. If someone ever "simplifies" this file by
   * writing one prompt and translating it, the whole premise of the app goes
   * with it.
   */
  it('gives each path a genuinely different explanation of German', () => {
    const en = explainPrompt({
      expected: 'Ich komme aus Bulgarien.',
      given: 'Ich komme von Bulgarien.',
      categories: ['preposition'],
      language: 'en',
    });
    const bg = explainPrompt({
      expected: 'Ich komme aus Bulgarien.',
      given: 'Ich komme von Bulgarien.',
      categories: ['preposition'],
      language: 'bg',
    });

    expect(en.system).not.toBe(bg.system);
    // The English path has to be told there is no grammatical gender to lean
    // on; the Bulgarian path has to be told the opposite, and where the
    // article sits.
    expect(en.system).toMatch(/no grammatical gender/i);
    expect(bg.system).toMatch(/граматичен род/);
    expect(bg.system).toMatch(/къщата/);
    // And each one is written in the language it teaches in.
    expect(bg.system).toMatch(/[а-яА-Я]/);
    expect(en.system).not.toMatch(/[а-яА-Я]/);
  });

  it('tells the model what the app already decided, so the two do not disagree', () => {
    const prompt = explainPrompt({
      expected: 'Ich sehe den Mann.',
      given: 'Ich sehe der Mann.',
      categories: ['case', 'gender'],
      language: 'en',
      level: 'a1',
    });
    expect(prompt.user).toContain('Ich sehe den Mann.');
    expect(prompt.user).toContain('Ich sehe der Mann.');
    expect(prompt.user).toContain('case, gender');
    expect(prompt.user).toContain('A1');
  });

  it('does not ask the model to repeat what the rules already found', () => {
    const prompt = reviewPrompt({
      text: 'Ich komme von Bulgarien.',
      language: 'en',
      level: 'a1',
      alreadyFound: [
        { category: 'preposition', excerpt: 'von Bulgarien', message: { en: 'x', bg: 'x' } },
      ],
    });
    expect(prompt.user).toContain('von Bulgarien');
    expect(prompt.system).toMatch(/do not repeat/i);
  });
});

describe('reading the answer back', () => {
  it('accepts a well-formed explanation', () => {
    expect(readExplanation('{"explanation":"  aus is used for origin.  "}')).toBe(
      'aus is used for origin.',
    );
  });

  it('refuses anything it cannot actually read', () => {
    for (const bad of ['not json', '{}', '{"explanation":""}', '{"explanation":123}', '[]']) {
      expect(() => readExplanation(bad), bad).toThrow(ClaudeFailure);
    }
  });

  it('drops a finding the app could not render rather than half-rendering it', () => {
    const findings = readFindings(
      JSON.stringify({
        findings: [
          { category: 'case', excerpt: 'der Mann', message: 'Accusative takes den.' },
          // An unknown category cannot be shown or counted.
          { category: 'vibes', excerpt: 'x', message: 'Something feels off.' },
          // A finding with no message says nothing at all.
          { category: 'case', excerpt: 'y', message: '   ' },
        ],
      }),
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ category: 'case', excerpt: 'der Mann' });
  });

  it('treats a missing findings array as a failure, not as "no mistakes"', () => {
    // These mean completely different things to a learner, and defaulting to
    // the reassuring one would be the worst possible guess.
    expect(() => readFindings('{"ok":true}')).toThrow(ClaudeFailure);
    expect(() => readFindings('nonsense')).toThrow(ClaudeFailure);
    expect(readFindings('{"findings":[]}')).toEqual([]);
  });
});

describe('explaining a mistake', () => {
  it('returns the explanation in one language, marked as generated', async () => {
    const provider = createClaudeProvider(
      config,
      answering({ explanation: 'German uses aus for the country you come from.' }),
    );
    const result = await provider.explainMistake({
      expected: 'Ich komme aus Bulgarien.',
      given: 'Ich komme von Bulgarien.',
      categories: ['preposition'],
      language: 'en',
    });

    expect(result.available).toBe(true);
    expect(result.explanation).toContain('aus');
    expect(result.language).toBe('en');
    // The learner has to be able to tell this apart from authored text.
    expect(result.generated).toBe(true);
  });

  it.each(['unreachable', 'refused', 'malformed'] as const)(
    'says what went wrong when the call fails (%s)',
    async (reason) => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const provider = createClaudeProvider(config, failing(reason));
      const result = await provider.explainMistake({
        expected: 'a',
        given: 'b',
        categories: [],
        language: 'bg',
      });

      // Not an empty panel: an explanation that silently does not appear reads
      // as the app being broken.
      expect(result.explanation).toBeUndefined();
      expect(result.error?.en.length ?? 0).toBeGreaterThan(0);
      expect(result.error?.bg).toMatch(/[а-яА-Я]/);
      error.mockRestore();
    },
  );
});

describe('reviewing writing', () => {
  const text = 'ich komme von Bulgarien.';

  it('adds to the deterministic checks and never replaces them', async () => {
    const provider = createClaudeProvider(
      config,
      answering({
        findings: [{ category: 'word-order', excerpt: text, message: 'The verb belongs second.' }],
      }),
    );
    const review = await provider.evaluateWriting({ text, language: 'en', level: 'a1' });

    const rulesOnly = await unavailableProvider.evaluateWriting({ text, language: 'en', level: 'a1' });
    // Every rule finding survives, in place.
    for (const finding of rulesOnly.findings) {
      expect(review.findings).toContainEqual(expect.objectContaining({ category: finding.category }));
    }
    // And the added one is marked as the model's.
    const generated = review.findings.filter((finding) => finding.generated);
    expect(generated).toHaveLength(1);
    expect(review.engine).toBe('ai');
    expect(review.generatedLanguage).toBe('en');
    // The claim about what was checked grows with what actually ran.
    expect(review.checksApplied.length).toBe(rulesOnly.checksApplied.length + 1);
  });

  it('falls back to the real rule-based result when the model cannot be reached', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const provider = createClaudeProvider(config, failing('unreachable'));
    const review = await provider.evaluateWriting({ text, language: 'en', level: 'a1' });

    // A genuine result, labelled as what it is — not an error page, and not a
    // model result with nothing in it.
    expect(review.engine).toBe('rules');
    expect(review.findings.length).toBeGreaterThan(0);
    expect(review.findings.every((finding) => !finding.generated)).toBe(true);
    error.mockRestore();
  });

  it('keeps the rules when the model answers with nonsense', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const provider = createClaudeProvider(config, answering('{"not":"findings"}'));
    const review = await provider.evaluateWriting({ text, language: 'en', level: 'a1' });
    expect(review.engine).toBe('rules');
    error.mockRestore();
  });
});

describe('what is deliberately not generated', () => {
  /**
   * These are a decision, not a backlog item. Every German sentence in this
   * app has been read by a person, and a generated one sitting beside an
   * authored one with no way to tell them apart would end that quietly.
   */
  it('refuses to generate practice or converse, and says why', async () => {
    const provider = createClaudeProvider(config, answering({ explanation: 'unused' }));

    const practice = await provider.generatePractice({ focus: 'cases', level: 'a1', count: 5 });
    expect(practice.available).toBe(false);
    expect(practice.items).toBeUndefined();
    expect(practice.reason?.en).toMatch(/authored, not generated/i);

    const turn = await provider.converse({ scenarioId: 'cafe', history: [], level: 'a1' });
    expect(turn.available).toBe(false);
    expect(turn.reply).toBeUndefined();
    expect(turn.reason?.bg).toMatch(/[а-яА-Я]/);
  });
});
