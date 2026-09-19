/**
 * Difficulty adaptation.
 *
 * The app always wants the learner back at full production. Support is added
 * when they struggle and removed again as soon as they succeed, following the
 * fallback ladder:
 *
 *   full production -> first word -> first letters -> word bank
 *                   -> fill in the blank -> show the concept -> try again later
 */

export const SUPPORT_LADDER = [
  'full-production',
  'first-word',
  'first-letters',
  'word-bank',
  'fill-blank',
  'show-concept',
  'defer',
] as const;

export type SupportLevel = (typeof SUPPORT_LADDER)[number];

export type AttemptOutcome = 'clean' | 'partial' | 'wrong';

export interface AdaptationState {
  support: SupportLevel;
  /** Consecutive clean answers at the current support level. */
  cleanStreak: number;
  /** Consecutive wrong answers. */
  wrongStreak: number;
}

export function initialAdaptation(support: SupportLevel = 'full-production'): AdaptationState {
  return { support, cleanStreak: 0, wrongStreak: 0 };
}

function indexOf(level: SupportLevel): number {
  return SUPPORT_LADDER.indexOf(level);
}

function atIndex(index: number): SupportLevel {
  const clamped = Math.min(SUPPORT_LADDER.length - 1, Math.max(0, index));
  return SUPPORT_LADDER[clamped]!;
}

/** Number of clean answers needed before support is withdrawn again. */
export const CLEAN_STREAK_TO_ADVANCE = 2;

export function adapt(state: AdaptationState, outcome: AttemptOutcome): AdaptationState {
  if (outcome === 'wrong') {
    const wrongStreak = state.wrongStreak + 1;
    // One mistake is normal. Two in a row means the learner needs more support.
    if (wrongStreak >= 2) {
      // Reset the streak after adding support, so each further step down the
      // ladder also costs two mistakes. Without this, a bad run would drop the
      // learner to the bottom of the ladder almost immediately.
      return { support: atIndex(indexOf(state.support) + 1), cleanStreak: 0, wrongStreak: 0 };
    }
    return { support: state.support, cleanStreak: 0, wrongStreak };
  }

  if (outcome === 'partial') {
    return { ...state, cleanStreak: 0, wrongStreak: 0 };
  }

  const cleanStreak = state.cleanStreak + 1;
  if (cleanStreak >= CLEAN_STREAK_TO_ADVANCE && indexOf(state.support) > 0) {
    return { support: atIndex(indexOf(state.support) - 1), cleanStreak: 0, wrongStreak: 0 };
  }
  return { ...state, cleanStreak, wrongStreak: 0 };
}

/**
 * How much scaffolding should the exercise renderer show?
 * `hintsUnlocked` is how many authored hints are revealed up front.
 */
export interface SupportPresentation {
  showWordBank: boolean;
  showScaffold: boolean;
  /** Reveal the first word of the answer. */
  showFirstWord: boolean;
  /** Reveal the first two letters of each word. */
  showFirstLetters: boolean;
  hintsUnlocked: number;
  deferred: boolean;
}

export function presentationFor(support: SupportLevel): SupportPresentation {
  switch (support) {
    case 'full-production':
      return { showWordBank: false, showScaffold: false, showFirstWord: false, showFirstLetters: false, hintsUnlocked: 0, deferred: false };
    case 'first-word':
      return { showWordBank: false, showScaffold: false, showFirstWord: true, showFirstLetters: false, hintsUnlocked: 0, deferred: false };
    case 'first-letters':
      return { showWordBank: false, showScaffold: false, showFirstWord: true, showFirstLetters: true, hintsUnlocked: 0, deferred: false };
    case 'word-bank':
      return { showWordBank: true, showScaffold: false, showFirstWord: false, showFirstLetters: false, hintsUnlocked: 1, deferred: false };
    case 'fill-blank':
      return { showWordBank: true, showScaffold: true, showFirstWord: false, showFirstLetters: false, hintsUnlocked: 1, deferred: false };
    case 'show-concept':
      return { showWordBank: true, showScaffold: true, showFirstWord: true, showFirstLetters: true, hintsUnlocked: 2, deferred: false };
    case 'defer':
      return { showWordBank: true, showScaffold: true, showFirstWord: true, showFirstLetters: true, hintsUnlocked: 3, deferred: true };
    default:
      return presentationFor('full-production');
  }
}

/** Build the "first letters" cue for an answer: "Ich w... i... H..." */
export function firstLetterCue(answer: string, letters = 1): string {
  return answer
    .split(/\s+/)
    .map((word) => {
      const visible = word.slice(0, letters);
      const hidden = ' '.repeat(0) + '_'.repeat(Math.max(0, word.replace(/[.,!?]/g, '').length - letters));
      return visible + hidden;
    })
    .join(' ');
}

/** Reveal only the first word of the answer. */
export function firstWordCue(answer: string): string {
  const [first = '', ...rest] = answer.split(/\s+/);
  return [first, ...rest.map((word) => '_'.repeat(word.replace(/[.,!?]/g, '').length))].join(' ');
}
