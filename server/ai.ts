import type { Bilingual, ErrorCategory } from '../src/content/types.ts';
import { LEXICON } from '../src/content/index.ts';
import { lower, tokenize } from '../src/core/validation/text.ts';

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
}

export interface MistakeExplanation {
  available: boolean;
  explanation?: Bilingual;
}

export interface GeneratedPractice {
  available: boolean;
  items?: Array<{ prompt: Bilingual; answer: string }>;
}

export interface ConversationTurn {
  available: boolean;
  reply?: string;
  correction?: string;
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
    language: 'en' | 'bg';
  }): Promise<MistakeExplanation>;
  evaluateWriting(input: { text: string; language: 'en' | 'bg'; level: string }): Promise<WritingEvaluation>;
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
    if (verbIndex >= 0) {
      const subjectIndex = lowered.findIndex((token) => SUBJECT_PRONOUNS.has(token));
      const subject = subjectIndex >= 0 ? lowered[subjectIndex]! : undefined;
      const analyses = LEXICON.verbForms.get(lowered[verbIndex]!) ?? [];
      if (subject && analyses.length > 0) {
        const wantedPerson = EXPECTED_PERSON[subject];
        const isFormalSie = tokens[subjectIndex] === 'Sie';
        const person = isFormalSie ? 'sie' : wantedPerson;
        const agrees = analyses.some((analysis) => analysis.person === person || analysis.person === 'infinitive');
        if (person && !agrees) {
          const lemma = analyses[0]!.lemma;
          findings.push({
            category: 'verb-conjugation',
            excerpt: tokens[verbIndex]!,
            message: bi(
              `"${tokens[verbIndex]}" does not match the subject "${tokens[subjectIndex]}". Check the ${lemma} forms.`,
              `„${tokens[verbIndex]}“ не съответства на подлога „${tokens[subjectIndex]}“. Провери формите на ${lemma}.`,
            ),
          });
        }
      }
    }

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
 * Resolve the provider for this process.
 *
 * A future provider is selected here from server-side environment variables.
 * Because this module only ever runs in the Node process, no key can leak into
 * the browser bundle.
 */
export function createProvider(env: NodeJS.ProcessEnv = process.env): AiProvider {
  const configured = env.SATZWERK_AI_PROVIDER;
  if (!configured || configured === 'none') return unavailableProvider;
  // No provider is implemented yet. Failing loudly beats pretending.
  console.warn(
    `[satzwerk] SATZWERK_AI_PROVIDER="${configured}" is set, but no provider implementation is wired up yet. ` +
      'Falling back to rule-based checks.',
  );
  return unavailableProvider;
}
