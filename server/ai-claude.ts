import type { ErrorCategory, TeachingLanguage } from '../src/content/types.ts';
import type {
  AiProvider,
  CoachFinding,
  GeneratedPractice,
  MistakeExplanation,
  WritingEvaluation,
} from './ai.ts';
import { ruleBasedWritingReview } from './ai.ts';

/**
 * A real provider behind `AiProvider`, talking to the Claude API.
 *
 * ## What it is for, and what it is deliberately not for
 *
 * This app's teaching content is authored, in two separately written paths,
 * and that is the whole point of it. A model is not used to write lessons, to
 * invent practice sentences or to mark answers — the validator does the
 * marking, deterministically, and it is the thing the learner's progress is
 * built on.
 *
 * What a model is genuinely better at is the question authored content cannot
 * anticipate: *why was the thing I wrote wrong?* A learner can produce a wrong
 * form nobody wrote a trap for, and until now the app could only repeat the
 * correct answer. That gap is what this fills, and it fills it **after** the
 * verdict, never instead of it.
 *
 * So `explainMistake` and `evaluateWriting` are implemented, and
 * `generatePractice` and `converse` are not — not because they are hard, but
 * because generated German would be unreviewed German presented beside
 * authored German, and the learner would have no way to tell which was which.
 * Both keep reporting `available: false`, with a reason.
 *
 * ## Honesty rules this file keeps
 *
 * 1. An explanation is written **in one language**, for one teaching path.
 *    `Bilingual` is for authored content; a generated explanation that claimed
 *    to be both would be a translation of itself, which is exactly what the
 *    two paths exist to avoid.
 * 2. Nothing generated is ever silently merged with authored text. The API
 *    marks it, and the UI labels it.
 * 3. A failure says so. An empty panel after a learner asks a question is the
 *    same lie as a wrong answer, only quieter.
 * 4. The key is read from the server environment and used here only. It is not
 *    prefixed `VITE_`, so it cannot reach the client bundle.
 */

/** The model this app asks. Chosen deliberately, not inherited from a default. */
export const CLAUDE_MODEL = 'claude-opus-5';

/**
 * Effort, and why it is not the default.
 *
 * A learner is waiting for this, so it is latency-sensitive; but a wrong
 * grammar explanation actively teaches wrong German, which is worse than no
 * explanation at all. `medium` is the deliberate middle: enough reasoning for
 * a case or word-order question, fast enough that the answer arrives while the
 * mistake is still in mind.
 */
export const CLAUDE_EFFORT = 'medium';

/**
 * Deliberately small. These outputs are three or four sentences by
 * instruction; a large ceiling here would not make them better, and a runaway
 * answer is a bug rather than a feature worth paying for.
 */
const MAX_TOKENS = 1500;

/** How long to wait before telling the learner it did not answer. */
export const CLAUDE_TIMEOUT_MS = 30_000;

export interface ClaudeConfig {
  apiKey: string;
  model: string;
}

/**
 * Read the key from the server environment.
 *
 * Whitespace is trimmed because a key pasted into a hosting dashboard very
 * often arrives with a trailing newline, and the failure that produces is a
 * 401 that looks like a wrong key.
 */
export function claudeConfig(env: NodeJS.ProcessEnv = process.env): ClaudeConfig | null {
  const apiKey = env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;
  return { apiKey, model: env.SATZWERK_AI_MODEL?.trim() || CLAUDE_MODEL };
}

/** One request to the model, reduced to what this app actually needs. */
export interface ClaudeRequest {
  system: string;
  user: string;
  /** The JSON schema the answer must satisfy. */
  schema: Record<string, unknown>;
}

/**
 * The seam. Everything above this line is prompt and policy; everything below
 * is one network call. Tests drive the policy through a stub rather than
 * mocking an SDK, and the SDK is loaded only when a call is actually made.
 */
export type ClaudeCaller = (request: ClaudeRequest) => Promise<string>;

/** Raised when the model declined or the call failed. Carries a learner-safe reason. */
export class ClaudeFailure extends Error {
  readonly reason: 'refused' | 'unreachable' | 'malformed';

  constructor(reason: 'refused' | 'unreachable' | 'malformed', message: string) {
    super(message);
    this.name = 'ClaudeFailure';
    this.reason = reason;
  }
}

/**
 * The real caller.
 *
 * The SDK is imported here rather than at module scope so that a deployment
 * with no key configured never pays to load it — the hosted app is a function
 * that cold-starts, and the coach is not on the path most requests take.
 */
export function createClaudeCaller(config: ClaudeConfig): ClaudeCaller {
  let client: unknown;

  return async (request) => {
    if (!client) {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      client = new Anthropic({ apiKey: config.apiKey, timeout: CLAUDE_TIMEOUT_MS });
    }
    const anthropic = client as import('@anthropic-ai/sdk').default;

    let response: Awaited<ReturnType<typeof anthropic.beta.messages.create>>;
    try {
      response = await anthropic.beta.messages.create({
        model: config.model,
        max_tokens: MAX_TOKENS,
        // Server-side fallback: if a safety classifier declines the request,
        // the API re-runs it on a fallback model inside the same call instead
        // of the learner getting nothing. A grammar question is not the kind
        // of thing that gets declined, but the cost of having it on is zero
        // until it is needed.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: {
          effort: CLAUDE_EFFORT,
          format: { type: 'json_schema', schema: request.schema },
        },
        system: request.system,
        messages: [{ role: 'user', content: request.user }],
      });
    } catch (cause) {
      throw new ClaudeFailure('unreachable', (cause as Error).message);
    }

    // Checked before the content is read, because on a refusal the content is
    // not the answer to the question that was asked.
    if (response.stop_reason === 'refusal') {
      throw new ClaudeFailure('refused', 'The model declined to answer.');
    }

    const text = response.content
      .filter((block): block is typeof block & { type: 'text'; text: string } => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();
    if (!text) throw new ClaudeFailure('malformed', 'The answer was empty.');
    return text;
  };
}

/* ------------------------------------------------------------------ *
 * Prompts
 * ------------------------------------------------------------------ */

/**
 * The two teaching paths, kept apart here exactly as they are kept apart in
 * the authored content.
 *
 * The Bulgarian prompt is not the English one translated. It tells the model
 * what a Bulgarian speaker already has — grammatical gender, a definite
 * article, free word order — and what German will therefore feel like from
 * there. An English speaker meeting German cases has no such scaffolding and
 * needs a different explanation of the same rule, which is the whole reason
 * this app has two paths rather than one and a translator.
 */
const VOICE: Record<TeachingLanguage, string> = {
  en: `You are explaining German to an adult English speaker who is learning it.

Write in English. Lean on what English already gives them and be explicit where it does not:
- English has no grammatical gender, so der/die/das has no equivalent to lean on and must be learnt with the noun.
- English word order is fixed subject-verb-object; German puts the conjugated verb second and moves the subject behind it when something else opens the sentence.
- English marks case only on pronouns (he/him), so accusative and dative on articles is a genuinely new idea rather than a familiar one spelt differently.
- English does not capitalise nouns; German capitalises every one of them.`,
  bg: `Обясняваш немски на възрастен българин, който го учи.

Пиши на български. Ползвай това, което българският вече дава, и казвай ясно къде двата езика се разминават:
- Българският има граматичен род, затова der/die/das не е нова идея — новото е, че родът често не съвпада с българския.
- Определителният член в българския е в края на думата (къща → къщата), а в немския стои пред нея като отделна дума.
- Българският няма падежна система за съществителните, затова Akkusativ и Dativ наистина са ново нещо.
- Словоредът в българския е свободен; в немския спрегнатият глагол стои на второ място и подлогът минава зад него.
- Българският не пише съществителните с главна буква, а немският пише всяко.`,
};

/** Shared rules. A teaching tool that pads or praises is wasting the learner's attention. */
const DISCIPLINE = `Rules:
- Three or four sentences. No greeting, no praise, no sign-off.
- Explain THIS mistake specifically. Name the rule it breaks, then show the correct form.
- Never invent German. If you are not certain a form is standard, do not use it.
- Do not tell the learner they were close, or encourage them. They came for the reason, not for reassurance.
- Write at the level given. A Pre-A1 learner has not met cases yet; do not explain one with another.`;

const EXPLANATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['explanation'],
  properties: {
    explanation: {
      type: 'string',
      description: 'Three or four sentences explaining why the learner’s answer is wrong.',
    },
  },
} as const;

export function explainPrompt(input: {
  expected: string;
  given: string;
  categories: ErrorCategory[];
  language: TeachingLanguage;
  level?: string;
}): ClaudeRequest {
  const categories = input.categories.length > 0 ? input.categories.join(', ') : 'not classified';
  return {
    system: `${VOICE[input.language]}\n\n${DISCIPLINE}`,
    user: [
      `Level: ${(input.level ?? 'pre-a1').toUpperCase()}`,
      `The learner was asked to produce: ${input.expected}`,
      `They wrote: ${input.given}`,
      // The validator has already classified this. Passing its verdict keeps
      // the explanation about the same error the app just marked, rather than
      // a second opinion that contradicts the mark the learner was given.
      `The app's own validator classified the error as: ${categories}`,
      '',
      'Explain why what they wrote is wrong.',
    ].join('\n'),
    schema: EXPLANATION_SCHEMA,
  };
}

const REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['category', 'excerpt', 'message'],
        properties: {
          category: {
            type: 'string',
            enum: [
              'word-order',
              'case',
              'gender',
              'verb-conjugation',
              'preposition',
              'pronoun',
              'missing-word',
              'extra-word',
              'spelling',
              'vocabulary',
            ],
          },
          excerpt: { type: 'string', description: 'The exact fragment of the learner’s text.' },
          message: { type: 'string', description: 'One or two sentences. What is wrong and what it should be.' },
          suggestion: { type: 'string', description: 'The corrected fragment, if there is a single clear one.' },
        },
      },
    },
  },
} as const;

export function reviewPrompt(input: {
  text: string;
  language: TeachingLanguage;
  level: string;
  alreadyFound: CoachFinding[];
}): ClaudeRequest {
  const already =
    input.alreadyFound.length > 0
      ? input.alreadyFound.map((finding) => `- ${finding.category}: ${finding.excerpt ?? ''}`).join('\n')
      : '- (none)';
  return {
    system: `${VOICE[input.language]}

You are reviewing a short piece of German written by a learner.

Rules:
- Report only mistakes you are certain about. An uncertain finding is worse than a missed one, because the learner cannot tell the difference.
- Do not repeat anything in the list of findings already reported.
- At most six findings. If the text is correct, return an empty list.
- Each message is one or two sentences and names the rule.
- Never invent German.`,
    user: [
      `Level: ${input.level.toUpperCase()}`,
      '',
      'The learner wrote:',
      input.text,
      '',
      'Deterministic checks have already reported these, so do not repeat them:',
      already,
    ].join('\n'),
    schema: REVIEW_SCHEMA,
  };
}

/* ------------------------------------------------------------------ *
 * Reading the answer back
 * ------------------------------------------------------------------ */

/**
 * Structured output makes the shape very likely, not certain — and "very
 * likely" is not a thing to hand a learner unchecked. Anything that does not
 * parse or does not fit is treated as a failure, which the learner is told
 * about, rather than rendered as a half-empty panel.
 */
export function readExplanation(raw: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ClaudeFailure('malformed', 'The answer was not valid JSON.');
  }
  const explanation = (parsed as { explanation?: unknown }).explanation;
  if (typeof explanation !== 'string' || explanation.trim().length === 0) {
    throw new ClaudeFailure('malformed', 'The answer had no explanation in it.');
  }
  return explanation.trim();
}

const CATEGORIES: ReadonlySet<string> = new Set<ErrorCategory>([
  'word-order',
  'case',
  'gender',
  'verb-conjugation',
  'preposition',
  'pronoun',
  'missing-word',
  'extra-word',
  'spelling',
  'vocabulary',
]);

export function readFindings(raw: string): CoachFinding[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ClaudeFailure('malformed', 'The answer was not valid JSON.');
  }
  const findings = (parsed as { findings?: unknown }).findings;
  if (!Array.isArray(findings)) {
    throw new ClaudeFailure('malformed', 'The answer had no findings array in it.');
  }

  const out: CoachFinding[] = [];
  for (const candidate of findings) {
    const row = candidate as Record<string, unknown>;
    const category = String(row.category ?? '');
    const message = String(row.message ?? '').trim();
    // A finding whose category the app does not know cannot be rendered or
    // counted, and a finding with no message says nothing. Both are dropped
    // rather than coerced into something that looks complete.
    if (!CATEGORIES.has(category) || message.length === 0) continue;
    const excerpt = String(row.excerpt ?? '').trim();
    const suggestion = String(row.suggestion ?? '').trim();
    out.push({
      category: category as ErrorCategory,
      // Written once, in the language it was asked for, and carried in both
      // slots of the pair. The learner only ever sees their own path, and
      // producing the other side here would mean machine-translating it —
      // exactly what two separately authored paths exist to avoid. What
      // language it is actually in travels alongside, on the evaluation.
      message: { en: message, bg: message },
      ...(excerpt ? { excerpt } : {}),
      ...(suggestion ? { suggestion } : {}),
    });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * The provider
 * ------------------------------------------------------------------ */

const bi = (en: string, bg: string) => ({ en, bg });

const FAILURE_NOTE: Record<ClaudeFailure['reason'], { en: string; bg: string }> = {
  unreachable: bi(
    'The explanation service could not be reached. Nothing else about your answer has changed.',
    'Услугата за обяснения не можа да бъде достигната. Нищо друго по отговора ти не се е променило.',
  ),
  refused: bi(
    'The model declined to answer this one. That is about the request, not about you.',
    'Моделът отказа да отговори на това. Това е за заявката, не за теб.',
  ),
  malformed: bi(
    'The explanation came back in a shape this app could not read, so it is not being shown.',
    'Обяснението се върна във вид, който приложението не можа да прочете, затова не се показва.',
  ),
};

/** Why the two unimplemented operations stay unimplemented, said out loud. */
export const NOT_GENERATED_NOTE = bi(
  'Practice sentences and conversation are authored, not generated, so that every German sentence in this app has been checked by a person.',
  'Изреченията за упражнение и разговорът са написани, а не генерирани, за да е проверено от човек всяко немско изречение в това приложение.',
);

const AI_CHECK = bi(
  'A language model reviewed what the deterministic checks could not. It can be wrong.',
  'Езиков модел прегледа това, което детерминистичните проверки не могат. Може да сгреши.',
);

export function createClaudeProvider(config: ClaudeConfig, call?: ClaudeCaller): AiProvider {
  const ask = call ?? createClaudeCaller(config);

  return {
    name: `claude:${config.model}`,
    available: true,

    async explainMistake(input): Promise<MistakeExplanation> {
      try {
        const raw = await ask(explainPrompt(input));
        return {
          available: true,
          explanation: readExplanation(raw),
          language: input.language,
          generated: true,
        };
      } catch (cause) {
        const reason = cause instanceof ClaudeFailure ? cause.reason : 'unreachable';
        console.error('[satzwerk] explainMistake failed:', (cause as Error).message);
        return { available: true, error: FAILURE_NOTE[reason] };
      }
    },

    /**
     * The rule-based review runs first and always. Its findings are the ones
     * the app can stand behind, and they are never dropped in favour of the
     * model's — the model is only ever adding to them.
     */
    async evaluateWriting(input): Promise<WritingEvaluation> {
      const base = ruleBasedWritingReview(input.text);
      try {
        const raw = await ask(
          reviewPrompt({
            text: input.text,
            language: input.language,
            level: input.level,
            alreadyFound: base.findings,
          }),
        );
        const extra = readFindings(raw);
        return {
          ...base,
          engine: 'ai',
          findings: [...base.findings, ...extra.map((finding) => ({ ...finding, generated: true }))],
          checksApplied: [...base.checksApplied, AI_CHECK],
          // Which language the generated findings are actually in. They are
          // written once, for the path that asked; this is what lets the UI
          // avoid showing English findings to someone reading Bulgarian.
          generatedLanguage: input.language,
          note: bi(
            'The listed checks are deterministic. Anything marked as written by a model is not, and may be wrong.',
            'Изброените проверки са детерминистични. Всичко, отбелязано като написано от модел, не е и може да е грешно.',
          ),
        };
      } catch (cause) {
        console.error('[satzwerk] evaluateWriting fell back to rules:', (cause as Error).message);
        // The rule-based result is a real result. Returning it, labelled as
        // what it is, beats failing the whole request because the extra step
        // did not work.
        return base;
      }
    },

    async generatePractice(): Promise<GeneratedPractice> {
      return { available: false, reason: NOT_GENERATED_NOTE };
    },

    async converse() {
      return { available: false, reason: NOT_GENERATED_NOTE };
    },
  };
}
