import type { Bilingual, ErrorCategory, TeachingLanguage } from '../src/content/types.ts';
import { LEXICON } from '../src/content/index.ts';
import { lower, tokenize } from '../src/core/validation/text.ts';
import type { Db } from './db.ts';

/**
 * The German Coach seam.
 *
 * ## What is real in Milestone 1
 *
 * `ruleBasedWritingReview` is a genuine, deterministic reviewer. It only reports
 * things it can actually establish from the lexicon and a small set of rules,
 * and it says out loud which rules it applied and which words it could not
 * check. It never guesses and never claims to understand the text.
 *
 * ## What is architecture only
 *
 * `AiProvider` is the interface a real model would implement, with the four
 * operations from the product brief. No provider is wired up: `createProvider`
 * returns the unavailable provider unless a server-side key is configured, and
 * the API reports `available: false` so the UI can label the feature as planned
 * rather than pretending.
 *
 * Keys are read from the server environment only. Nothing reaches client code.
 */

export interface CoachFinding {
  category: ErrorCategory;
  message: Bilingual;
  /** The fragment of the learner's text the finding is about. */
  excerpt?: string;
  suggestion?: string;
  /**
   * Written by a language model rather than by a deterministic check.
   *
   * It exists so the UI can mark it. A learner has to be able to tell which
   * findings the app can stand behind and which came from something that can
   * be confidently wrong — presenting them identically would make the
   * reliable ones no more trustworthy than the rest.
   */
  generated?: boolean;
}

export interface WritingEvaluation {
  /** 'rules' = deterministic local checks. 'ai' = a configured model. */
  engine: 'rules' | 'ai';
  findings: CoachFinding[];
  /** Human-readable list of the checks that were actually run. */
  checksApplied: Bilingual[];
  /** Words the checker does not know, and therefore did not judge. */
  unknownWords: string[];
  note: Bilingual;
  /**
   * The language any `generated` findings were written in.
   *
   * They are written once, for the path that asked, so both halves of their
   * `Bilingual` carry the same text. This says which language that text is.
   */
  generatedLanguage?: TeachingLanguage;
}

export interface MistakeExplanation {
  available: boolean;
  /**
   * The explanation, in one language.
   *
   * Not `Bilingual`, deliberately. Authored content is written twice, once per
   * teaching path, by someone who knows what a Bulgarian speaker already has
   * and an English speaker does not. A generated explanation is written once,
   * for the path that asked; claiming it was both would mean translating it,
   * which is the thing the two paths exist to avoid.
   */
  explanation?: string;
  /** Which language `explanation` is in. */
  language?: TeachingLanguage;
  /** True when a model wrote it, so the UI can say so. */
  generated?: boolean;
  /** Why there is no explanation. Silence would read as the app being broken. */
  error?: Bilingual;
}

export interface GeneratedPractice {
  available: boolean;
  items?: Array<{ prompt: Bilingual; answer: string }>;
  /** Why not, when not. "Planned" and "decided against" are different answers. */
  reason?: Bilingual;
}

export interface ConversationTurn {
  available: boolean;
  reply?: string;
  correction?: string;
  /** Why not, when not. */
  reason?: Bilingual;
}

/**
 * The replaceable provider interface. A future implementation runs server-side,
 * validates its structured output against these shapes, and stores the result
 * so it can be reviewed like any other feedback.
 */
export interface AiProvider {
  readonly name: string;
  readonly available: boolean;
  explainMistake(input: {
    expected: string;
    given: string;
    categories: ErrorCategory[];
    language: TeachingLanguage;
    level?: string;
  }): Promise<MistakeExplanation>;
  evaluateWriting(input: { text: string; language: TeachingLanguage; level: string }): Promise<WritingEvaluation>;
  generatePractice(input: { focus: string; level: string; count: number }): Promise<GeneratedPractice>;
  converse(input: { scenarioId: string; history: string[]; level: string }): Promise<ConversationTurn>;
}

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

const UNAVAILABLE_NOTE = bi(
  'No AI provider is connected. These are deterministic rule-based checks, not a language model.',
  'Няма свързан AI доставчик. Това са детерминистични проверки по правила, а не езиков модел.',
);

/* ------------------------------------------------------------------ *
 * The rule-based reviewer: honest, limited, and actually useful
 * ------------------------------------------------------------------ */

const CHECKS: Bilingual[] = [
  bi('Nouns are capitalised.', 'Съществителните са с главна буква.'),
  bi('The sentence contains a conjugated verb.', 'Изречението съдържа спрегнат глагол.'),
  bi('"aus" is used for countries of origin, not "von".', 'За държава на произход се използва „aus“, не „von“.'),
  bi('The conjugated verb stands in second position.', 'Спрегнатият глагол стои на второ място.'),
  bi('du and Sie are not mixed inside one sentence.', 'du и Sie не се смесват в едно изречение.'),
  bi('The subject and the verb ending agree.', 'Подлогът и окончанието на глагола си съответстват.'),
  bi('Standard spelling of the special letters.', 'Стандартен правопис на специалните букви.'),
];

const FRONTABLE_ADVERBS = new Set(['heute', 'morgen', 'gestern', 'jetzt', 'hier', 'dann']);
const SUBJECT_PRONOUNS = new Set(['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'man']);
const COUNTRIES = new Set(['deutschland', 'bulgarien', 'hamburg', 'berlin', 'sofia', 'österreich']);

/** The verb ending each subject pronoun requires for a regular verb. */
const EXPECTED_PERSON: Record<string, string> = {
  ich: 'ich',
  du: 'du',
  er: 'er',
  sie: 'sie',
  es: 'er',
  wir: 'wir',
  ihr: 'ihr',
};

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

/**
 * Which verb endings each subject pronoun can take.
 *
 * Lowercase "sie" is two words — "she" takes the er-form (sie arbeitet), "they"
 * the plural (sie arbeiten) — and a capital "Sie" opening a sentence could be
 * either of those as well as the polite form. Accepting both where German is
 * genuinely ambiguous is the difference between a check and a false alarm.
 */
function allowedPersons(token: string, index: number): string[] {
  const word = token.toLowerCase();
  if (word === 'sie') return token === 'Sie' && index > 0 ? ['sie'] : ['er', 'sie'];
  if (word === 'es' || word === 'man') return ['er'];
  return [EXPECTED_PERSON[word] ?? word];
}

/**
 * Does each subject agree with its verb?
 *
 * The check this replaces compared the first verb in a sentence with the first
 * pronoun, and counted an infinitive as agreeing with anything. Together those
 * meant it never fired: "Ich wohne in Berlin und ich arbeiten hier" was judged
 * on "ich wohne" alone, and "Ich arbeiten." passed outright, because
 * "arbeiten" is also an infinitive — which is precisely the form a beginner
 * reaches for when they have not conjugated at all. The Coach listed this
 * check as one it ran. Measured, it found nothing in eight sentences, four of
 * them wrong.
 *
 * Now every subject pronoun is paired with its own verb. The verb right after
 * it comes first (ich arbeite); a pronoun with none after it is paired with
 * the verb right before it (Heute arbeite ich) — but only when no other
 * subject has already claimed that verb, because a pronoun after a verb is as
 * often its object: in "Ich kaufe es", "es" is not the one doing the buying.
 * A pronoun joined by "und" or "oder" before any verb has appeared is half of
 * a plural subject and is left alone. Where the lexicon does not know the
 * verb, nothing is said.
 */
function agreementFindings(tokens: string[], lowered: string[]): CoachFinding[] {
  const isVerb = (index: number) => index >= 0 && index < lowered.length && LEXICON.verbForms.has(lowered[index]!);
  // "Du und ich arbeiten" is one plural subject; "Ich wohne hier und ich
  // arbeite dort" is two clauses. What tells them apart is whether a verb has
  // already appeared: a subject is not finished before its verb is.
  const firstVerb = lowered.findIndex((_, index) => isVerb(index));
  const joined = (index: number) =>
    ['und', 'oder'].includes(lowered[index - 1] ?? '') && (firstVerb === -1 || firstVerb > index);
  const isSubject = (index: number) => SUBJECT_PRONOUNS.has(lowered[index]!) && !joined(index);

  const pairs: Array<{ subject: number; verb: number }> = [];
  const claimed = new Set<number>();
  // Subject, then verb.
  lowered.forEach((_, index) => {
    if (isSubject(index) && isVerb(index + 1) && !['und', 'oder'].includes(lowered[index + 1]!)) {
      pairs.push({ subject: index, verb: index + 1 });
      claimed.add(index + 1);
    }
  });
  // Verb, then subject: only a verb nobody else has claimed.
  lowered.forEach((_, index) => {
    if (!isSubject(index) || isVerb(index + 1)) return;
    if (isVerb(index - 1) && !claimed.has(index - 1)) {
      pairs.push({ subject: index, verb: index - 1 });
      claimed.add(index - 1);
    }
  });

  const findings: CoachFinding[] = [];
  for (const { subject, verb } of pairs) {
    const analyses = LEXICON.verbForms.get(lowered[verb]!) ?? [];
    const allowed = allowedPersons(tokens[subject]!, subject);
    if (analyses.some((analysis) => allowed.includes(analysis.person))) continue;
    const lemma = analyses[0]!.lemma;
    findings.push({
      category: 'verb-conjugation',
      excerpt: tokens[verb]!,
      message: bi(
        `"${tokens[verb]}" does not match the subject "${tokens[subject]}". Check the ${lemma} forms.`,
        `„${tokens[verb]}“ не съответства на подлога „${tokens[subject]}“. Провери формите на ${lemma}.`,
      ),
    });
  }
  return findings;
}

export function ruleBasedWritingReview(text: string): WritingEvaluation {
  const findings: CoachFinding[] = [];
  const unknownWords = new Set<string>();

  for (const sentence of splitSentences(text)) {
    const tokens = tokenize(sentence);
    if (tokens.length === 0) continue;
    const lowered = tokens.map(lower);

    // 1. Noun capitalisation.
    tokens.forEach((token, index) => {
      const key = lowered[index]!;
      if (!LEXICON.nounGender.has(key)) return;
      if (/^[a-zäöüß]/.test(token)) {
        findings.push({
          category: 'capitalization',
          excerpt: token,
          suggestion: token.charAt(0).toUpperCase() + token.slice(1),
          message: bi(
            `"${token}" is a noun, so German writes it with a capital letter.`,
            `„${token}“ е съществително, затова в немския се пише с главна буква.`,
          ),
        });
      }
    });

    // 2. Is there a verb at all?
    const verbIndex = lowered.findIndex((token) => LEXICON.verbForms.has(token));
    if (verbIndex === -1) {
      findings.push({
        category: 'missing-word',
        excerpt: sentence,
        message: bi(
          'This sentence has no verb that I can recognise. German never leaves the verb out.',
          'В това изречение няма глагол, който да разпозная. Немският никога не пропуска глагола.',
        ),
      });
    }

    // 3. "von" where "aus" belongs.
    lowered.forEach((token, index) => {
      if (token !== 'von') return;
      const next = lowered[index + 1];
      if (next && COUNTRIES.has(next)) {
        findings.push({
          category: 'preposition',
          excerpt: `von ${tokens[index + 1]}`,
          suggestion: `aus ${tokens[index + 1]}`,
          message: bi(
            'For the country or town you come from, German uses "aus", not "von".',
            'За държавата или града, от който идваш, немският използва „aus“, а не „von“.',
          ),
        });
      }
    });

    // 4. Verb in second position, when something else opens the sentence.
    if (verbIndex >= 0 && FRONTABLE_ADVERBS.has(lowered[0]!) && verbIndex !== 1) {
      findings.push({
        category: 'word-order',
        excerpt: sentence,
        message: bi(
          `"${tokens[0]}" takes position one, so the conjugated verb has to come next and the subject moves behind it.`,
          `„${tokens[0]}“ заема първа позиция, затова спрегнатият глагол идва веднага след него, а подлогът минава зад глагола.`,
        ),
      });
    }

    // 5. du and Sie mixed.
    if (lowered.includes('du') && tokens.includes('Sie')) {
      findings.push({
        category: 'pronoun',
        excerpt: sentence,
        message: bi(
          'This sentence mixes informal du with formal Sie. Pick one and stay with it.',
          'Това изречение смесва неофициалното du с учтивото Sie. Избери едно и се придържай към него.',
        ),
      });
    }

    // 6. Subject-verb agreement, for the verbs the lexicon knows.
    findings.push(...agreementFindings(tokens, lowered));

    // 7. Digraphs where a special letter is standard, plus unknown words.
    lowered.forEach((token, index) => {
      if (LEXICON.knownWords.has(token)) return;
      const withSharpS = token.replace(/ss/g, 'ß');
      const withUmlauts = token.replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü');
      const candidate = [withSharpS, withUmlauts].find((form) => LEXICON.knownWords.has(form));
      if (candidate) {
        findings.push({
          category: 'umlaut',
          excerpt: tokens[index]!,
          suggestion: candidate,
          message: bi(
            `Standard German spelling is "${candidate}".`,
            `Стандартният немски правопис е „${candidate}“.`,
          ),
        });
        return;
      }
      // Proper names start with a capital and are not worth flagging.
      if (/^[A-ZÄÖÜ]/.test(tokens[index]!)) return;
      unknownWords.add(tokens[index]!);
    });
  }

  return {
    engine: 'rules',
    findings: dedupe(findings),
    checksApplied: CHECKS,
    unknownWords: [...unknownWords],
    note: UNAVAILABLE_NOTE,
  };
}

function dedupe(findings: CoachFinding[]): CoachFinding[] {
  const seen = new Set<string>();
  return findings.filter((finding) => {
    const key = `${finding.category}|${finding.excerpt ?? ''}|${finding.message.en}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ------------------------------------------------------------------ *
 * Providers
 * ------------------------------------------------------------------ */

/**
 * The default provider. Writing review falls back to the real rule-based
 * checker; everything that genuinely needs a model reports `available: false`
 * so the UI can show it as planned instead of faking a response.
 */
export const unavailableProvider: AiProvider = {
  name: 'none',
  available: false,
  async explainMistake() {
    return { available: false };
  },
  async evaluateWriting(input) {
    return ruleBasedWritingReview(input.text);
  },
  async generatePractice() {
    return { available: false };
  },
  async converse() {
    return { available: false };
  },
};

/**
 * The Claude provider, loaded only if it is going to be used.
 *
 * `createProvider` is called on every cold start of the hosted function, and a
 * deployment with no key set must not pay to load an SDK it will never call.
 * So the module is pulled in on the first actual request instead, behind a
 * wrapper that already knows it is available — the answer to "is the coach on?"
 * comes from the environment, not from having loaded anything.
 */
function lazyClaudeProvider(config: import('./ai-claude.ts').ClaudeConfig): AiProvider {
  let real: Promise<AiProvider> | undefined;
  const load = (): Promise<AiProvider> => {
    real ??= import('./ai-claude.ts').then((module) => module.createClaudeProvider(config));
    return real;
  };
  return {
    name: `claude:${config.model}`,
    available: true,
    async explainMistake(input) {
      return (await load()).explainMistake(input);
    },
    async evaluateWriting(input) {
      return (await load()).evaluateWriting(input);
    },
    async generatePractice(input) {
      return (await load()).generatePractice(input);
    },
    async converse(input) {
      return (await load()).converse(input);
    },
  };
}

/**
 * Resolve the provider for this process.
 *
 * A future provider is selected here from server-side environment variables.
 * Because this module only ever runs in the Node process, no key can leak into
 * the browser bundle.
 */
export function createProvider(env: NodeJS.ProcessEnv = process.env): AiProvider {
  // An explicit opt-out wins over a key that happens to be in the environment.
  // A key set for something else on the same host is not consent to spend it
  // here.
  if (env.SATZWERK_AI_PROVIDER === 'none') return unavailableProvider;

  const apiKey = env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    // Not a warning. No key is the ordinary, supported state: the app works,
    // the rule-based checks are real, and the UI says what is and is not there.
    if (env.SATZWERK_AI_PROVIDER && env.SATZWERK_AI_PROVIDER !== 'none') {
      console.warn(
        `[satzwerk] SATZWERK_AI_PROVIDER="${env.SATZWERK_AI_PROVIDER}" is set but ANTHROPIC_API_KEY is not, ` +
          'so the coach is running on rule-based checks only.',
      );
    }
    return unavailableProvider;
  }

  return lazyClaudeProvider({ apiKey, model: env.SATZWERK_AI_MODEL?.trim() || 'claude-opus-5' });
}

/* ------------------------------------------------------------------ *
 * A daily allowance of model calls
 * ------------------------------------------------------------------ */

/**
 * How many model calls one day may make, for the whole deployment.
 *
 * Each call is about half a cent, and nothing limited how many a signed-in
 * script could make. Counted for the household rather than per learner,
 * because learners can be added freely and a per-learner count would be one
 * more learner away from unlimited. Two hundred is far more than a person
 * studying uses; SATZWERK_AI_DAILY_LIMIT changes it. A spending cap on the API
 * key itself is still the backstop.
 */
export const AI_DAILY_LIMIT = 200;

const LIMIT_REACHED = {
  en: 'This app has used today’s allowance of explanations. They are back tomorrow; nothing else about your answer has changed.',
  bg: 'Приложението изчерпа днешния лимит за обяснения. Те се връщат утре; нищо друго по отговора ти не се е променило.',
};
function dailyLimit(env: NodeJS.ProcessEnv): number {
  const configured = Number(env.SATZWERK_AI_DAILY_LIMIT);
  return Number.isInteger(configured) && configured >= 0 ? configured : AI_DAILY_LIMIT;
}

/**
 * Count one call against today's allowance; false when it is used up.
 *
 * Kept in the database, like the wrong-password count, because hosted
 * functions share no memory. The day is UTC: this is a spending limit, not a
 * study day.
 */
async function spendOne(db: Db, env: NodeJS.ProcessEnv): Promise<boolean> {
  const key = `ai_calls:${new Date().toISOString().slice(0, 10)}`;
  await db.run(
    `INSERT INTO meta (key, value) VALUES (?, '1')
     ON CONFLICT (key) DO UPDATE SET value = CAST(CAST(meta.value AS INTEGER) + 1 AS TEXT)`,
    key,
  );
  // Yesterday's counters are of no further use.
  await db.run("DELETE FROM meta WHERE key LIKE 'ai_calls:%' AND key < ?", key);
  const row = await db.get<{ value: string }>('SELECT value FROM meta WHERE key = ?', key);
  return Number(row?.value ?? 0) <= dailyLimit(env);
}

/**
 * The same provider, except that past today's allowance it stops calling the
 * model: an explanation says why, in the learner's language, and a writing
 * review is the rule-based one, which is a real review and costs nothing.
 */
export function withDailyLimit(provider: AiProvider, db: Db, env: NodeJS.ProcessEnv = process.env): AiProvider {
  if (!provider.available) return provider;
  return {
    name: provider.name,
    available: true,
    async explainMistake(input) {
      if (!(await spendOne(db, env))) return { available: true, error: LIMIT_REACHED };
      return provider.explainMistake(input);
    },
    async evaluateWriting(input) {
      if (!(await spendOne(db, env))) return ruleBasedWritingReview(input.text);
      return provider.evaluateWriting(input);
    },
    // Neither of these calls a model.
    generatePractice: (input) => provider.generatePractice(input),
    converse: (input) => provider.converse(input),
  };
}
