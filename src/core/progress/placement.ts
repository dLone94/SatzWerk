import { CEFR_ORDER, type CefrLevel } from '../../content/types.ts';

/**
 * Where to start.
 *
 * A learner arriving at SatzWerk who already speaks some German has two bad
 * options: start at Pre-A1 and spend a week being told what "Hallo" means, or
 * guess a level and discover halfway through a lesson that it was the wrong
 * one. The placement check is the third option, and its whole job is to be
 * *honest about how little it knows*.
 *
 * So it does not produce a CEFR level the way an exam does. It produces a
 * recommendation plus the evidence: how many questions it asked at each level
 * and how many you got right first time. Twenty questions cannot certify
 * anybody, and the result screen says so and links to the level above and the
 * level below, because the learner knows things about themselves that four
 * sentences per level cannot see.
 */

/** One answered placement question. */
export interface PlacementAnswer {
  stepId: string;
  level: CefrLevel;
  /** Right at the first attempt, with no hint opened and nothing revealed. */
  correct: boolean;
}

export interface PlacementBand {
  level: CefrLevel;
  asked: number;
  right: number;
  passed: boolean;
}

export interface PlacementResult {
  bands: PlacementBand[];
  /** The level the course suggests opening first. */
  startAt: CefrLevel;
  /** Highest level whose band was passed, or null when none was. */
  highestPassed: CefrLevel | null;
  /** True when every band passed — the check has nothing left to test. */
  toppedOut: boolean;
  asked: number;
  right: number;
}

/**
 * The share of a level's questions that counts as "you already have this".
 *
 * Two thirds rather than everything: a placement check that demands a clean
 * sweep sends people who are perfectly comfortable at a level back a step,
 * which is exactly the boredom it exists to prevent. And not half, because at
 * four questions a level, half is two — and two out of four is as easily luck
 * as knowledge.
 */
export const PASS_SHARE = 2 / 3;

/**
 * Score a finished placement check.
 *
 * `levelsOffered` is the course's own list, in order, so the recommendation
 * can never point at a level that does not exist.
 */
export function placementResult(
  answers: PlacementAnswer[],
  levelsOffered: CefrLevel[],
): PlacementResult {
  const ordered = levelsOffered
    .slice()
    .sort((a, b) => CEFR_ORDER.indexOf(a) - CEFR_ORDER.indexOf(b));

  const bands: PlacementBand[] = ordered.map((level) => {
    const forLevel = answers.filter((answer) => answer.level === level);
    const right = forLevel.filter((answer) => answer.correct).length;
    return {
      level,
      asked: forLevel.length,
      right,
      // A level nobody was asked about is not passed. It is unknown, and
      // treating unknown as passed would push a beginner up the course.
      passed: forLevel.length > 0 && right / forLevel.length >= PASS_SHARE,
    };
  });

  const tested = bands.filter((band) => band.asked > 0);
  const firstMissed = tested.find((band) => !band.passed);

  const highestPassed =
    [...tested].reverse().find((band) => band.passed)?.level ?? null;

  /*
   * Start at the first level you did not pass.
   *
   * Not "the level after the highest you passed": those differ when somebody
   * passes B1 and fails A2, which happens more than it sounds — a learner who
   * picked German up by ear can produce a B1 sentence and still not know an
   * article table. Sending them to B2 because of one good band would skip the
   * thing they actually need. The first gap is the honest answer, and the
   * breakdown beside it shows why.
   */
  const highestTested = tested[tested.length - 1]?.level;
  const above =
    highestTested === undefined
      ? undefined
      : (ordered[ordered.indexOf(highestTested) + 1] ?? highestTested);

  /*
   * Nothing to go on means the bottom, not the top.
   *
   * An earlier version fell back to the last level offered when no band had
   * been missed — which is also what happens when no band has been *asked*.
   * A check that asked nothing would have confidently recommended B2.
   */
  const startAt = firstMissed?.level ?? above ?? ordered[0] ?? 'pre-a1';

  /*
   * Topped out means the check has genuinely run out, not merely that
   * everything it happened to ask was answered. Passing four A1 questions is
   * not evidence about B2, so it does not get to claim the top.
   */
  const toppedOut =
    firstMissed === undefined &&
    tested.length > 0 &&
    highestTested === ordered[ordered.length - 1];

  return {
    bands,
    startAt,
    highestPassed,
    toppedOut,
    asked: answers.length,
    right: answers.filter((answer) => answer.correct).length,
  };
}
