import {
  CURRICULUM,
  GRAMMAR_CONCEPTS,
  PLACEMENT_CHECKPOINT,
  VOCABULARY,
  allCheckpoints,
  availableLessons,
  grammarById,
  lessonExercises,
  lessonsInOrder,
  patternById,
  practiceForCategory,
  unitById,
  unitForLesson,
  vocabById,
} from '../content/browser.ts';
import {
  CEFR_ORDER,
  type Bilingual,
  type CefrLevel,
  type Checkpoint,
  type Exercise,
  type ExerciseStep,
  type Lesson,
  type Level,
  type TeachingLanguage,
  type Unit,
  type VocabEntry,
} from '../content/types.ts';
import type { DailyRun } from '../core/progress/daily.ts';
import { todayHere } from '../core/progress/days.ts';
import { allStepIds, isLessonComplete, lessonRequirements, type LessonProgress } from '../core/progress/lesson.ts';
import type { SessionSources } from '../core/progress/session.ts';
import { dueItems, dueReason, orderQueue, type ReviewItem } from '../core/srs/scheduler.ts';
import { toDigraphs } from '../core/validation/text.ts';
import { CATEGORY_LABELS, type UiKey } from '../i18n.ts';
import type { CheckpointResult, MistakeRecord } from '../services/api/client.ts';
import { authoredStep, buildMistakePractice, buildReviewExercises } from './reviewBuilder.ts';

/**
 * Everything the dashboard, vocabulary page and review queue show is derived
 * here from real progress rows. No figure in the UI is invented or hard-coded.
 */

export type VocabLearningState = 'new' | 'learning' | 'known' | 'lapsed';

export interface VocabView {
  entry: VocabEntry;
  item?: ReviewItem;
  state: VocabLearningState;
  due: boolean;
  mistakes: number;
  favorite: boolean;
}

export function buildVocabViews(
  reviewItems: ReviewItem[],
  mistakes: MistakeRecord[],
  favorites: string[],
  now = new Date(),
): VocabView[] {
  const byRef = new Map(reviewItems.filter((item) => item.kind === 'vocab').map((item) => [item.refId, item]));
  const favoriteSet = new Set(favorites);

  // Each mistake is read once and names its own words. Trying every mistake
  // against every word instead, with the step looked up again for each pair,
  // froze a phone for a second or two once the bank held a hundred or so.
  const mistakeCounts = new Map<string, number>();
  for (const mistake of mistakes) {
    for (const id of vocabOfMistake(mistake)) {
      mistakeCounts.set(id, (mistakeCounts.get(id) ?? 0) + mistake.occurrences);
    }
  }

  return VOCABULARY.map((entry) => {
    const item = byRef.get(entry.id);
    return {
      entry,
      item,
      state: item ? item.state : 'new',
      due: item ? new Date(item.dueAt).getTime() <= now.getTime() : false,
      mistakes: mistakeCounts.get(entry.id) ?? 0,
      favorite: favoriteSet.has(entry.id),
    };
  });
}

const stepById = (id: string): ExerciseStep | undefined => authoredStep(id)?.step;

/** Lower-case words, split on anything that is not a letter (umlauts and ß are letters). */
function words(text: string): string[] {
  return text.toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
}

/**
 * Whether a mistake was made on this word — shared by the vocabulary list and
 * the word page, so the count on one matches the history on the other.
 *
 * It used to be a substring test on the expected answer, which blamed "das Ei"
 * for every "heiße", "zwei" and "eine", and "er" for every "Eltern". Now the
 * step the mistake came from decides, when it names the words it practises;
 * failing that, the word has to appear in the answer as whole words, in order
 * ("zu Hause" still counts, "Ei" inside "eine" does not). The price is that an
 * inflected form ("heiße") no longer counts against its dictionary form when
 * the step does not say so — better silent than wrong.
 */
export function mistakeMatchesVocab(mistake: MistakeRecord, entry: VocabEntry): boolean {
  return vocabOfMistake(mistake).has(entry.id);
}

/** The ids of the words a mistake counts against, by the rule above. */
function vocabOfMistake(mistake: MistakeRecord): Set<string> {
  const step = mistake.stepId ? stepById(mistake.stepId) : undefined;
  const known = vocabIds();
  const vocabTargets = (step?.reviewTargets ?? []).filter((id) => known.has(id));
  if (vocabTargets.length > 0) return new Set(vocabTargets);

  // Only the words that begin with a token of the answer are worth trying.
  const answer = words(mistake.expected);
  const found = new Set<string>();
  for (let start = 0; start < answer.length; start += 1) {
    for (const { id, tokens } of vocabByFirstWord().get(answer[start]!) ?? []) {
      if (tokens.every((token, offset) => answer[start + offset] === token)) found.add(id);
    }
  }
  return found;
}

let vocabIdSet: Set<string> | null = null;
function vocabIds(): Set<string> {
  vocabIdSet ??= new Set(VOCABULARY.map((entry) => entry.id));
  return vocabIdSet;
}

/** Every word's German as tokens, filed under its first token. A word with none is never matched. */
let firstWordIndex: Map<string, Array<{ id: string; tokens: string[] }>> | null = null;
function vocabByFirstWord() {
  if (!firstWordIndex) {
    firstWordIndex = new Map();
    for (const entry of VOCABULARY) {
      const tokens = words(entry.german);
      if (tokens.length === 0) continue;
      const list = firstWordIndex.get(tokens[0]!) ?? [];
      list.push({ id: entry.id, tokens });
      firstWordIndex.set(tokens[0]!, list);
    }
  }
  return firstWordIndex;
}

/*
 * Vocabulary search, as forgiving as the answer checker.
 *
 * The first lesson tells a learner without a German keyboard that ae, oe, ue
 * and ss are fine, and the checker accepts them — but the search did not, so
 * "strasse", "tschuess" and "Madchen" found nothing. German fields are folded
 * two ways, to digraphs (ä → ae) and to bare letters (ä → a), and the query is
 * folded the same way. The Bulgarian translation is left alone: taking marks
 * off Cyrillic would turn й into и.
 */
const toBare = (text: string) =>
  text.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss');

const searchFields = new WeakMap<VocabEntry, { digraph: string[]; bare: string[]; plain: string[] }>();
function fieldsOf(entry: VocabEntry) {
  let fields = searchFields.get(entry);
  if (!fields) {
    const german = [entry.german, entry.display, entry.plural ?? '', entry.translation.en].map((field) =>
      field.toLowerCase(),
    );
    fields = {
      digraph: german.map(toDigraphs),
      bare: german.map(toBare),
      plain: [...german, entry.translation.bg.toLowerCase()],
    };
    searchFields.set(entry, fields);
  }
  return fields;
}

export function vocabMatches(entry: VocabEntry, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return true;
  const fields = fieldsOf(entry);
  const digraph = toDigraphs(needle);
  const bare = toBare(needle);
  return (
    fields.plain.some((field) => field.includes(needle)) ||
    fields.digraph.some((field) => field.includes(digraph)) ||
    fields.bare.some((field) => field.includes(bare))
  );
}

export interface LessonView {
  lesson: Lesson;
  progress: LessonProgress;
  started: boolean;
  complete: boolean;
  /** 0..1 over the lesson's completion requirements. */
  readiness: number;
  unitTitle: Bilingual;
}

export function buildLessonViews(lessons: Record<string, LessonProgress>): LessonView[] {
  return lessonsInOrder()
    .filter((lesson) => lesson.status === 'available')
    .map((lesson) => {
      const progress = lessons[lesson.id] ?? {
        lessonId: lesson.id,
        sectionsSeen: [],
        practice: {},
        mastery: { attempts: 0, bestAccuracy: 0, passed: false },
        recoveryRounds: 0,
      };
      const requirements = lessonRequirements(lesson, progress);
      const satisfied = requirements.filter((requirement) => requirement.satisfied).length;
      return {
        lesson,
        progress,
        started: progress.sectionsSeen.length > 0 || Object.keys(progress.practice).length > 0,
        complete: isLessonComplete(lesson, progress),
        readiness: requirements.length > 0 ? satisfied / requirements.length : 0,
        unitTitle: unitForLesson(lesson.id)?.title ?? { en: '', bg: '' },
      };
    });
}

/**
 * The lessons whose teaching the learner has been through: finished, or
 * practised in. Practice drawn from the course stays inside these.
 */
export function taughtLessons(lessons: Record<string, LessonProgress>): Set<string> {
  return new Set(
    buildLessonViews(lessons)
      .filter((view) => view.complete || Object.keys(view.progress.practice).length > 0)
      .map((view) => view.lesson.id),
  );
}

export type NextActionKind = 'onboard' | 'continue-lesson' | 'start-lesson' | 'review' | 'mistakes' | 'checkpoint' | 'idle';

export interface NextAction {
  kind: NextActionKind;
  /** Route to navigate to. */
  to: string;
  title: Bilingual;
  detail: Bilingual;
  estimatedMinutes: number;
}

const bi = (en: string, bg: string): Bilingual => ({ en, bg });

/**
 * The single most useful thing to do right now.
 *
 * Priority: finish what is started, then clear what is due, then practise the
 * mistakes that keep coming back, then start something new.
 */
export function nextAction(
  lessons: Record<string, LessonProgress>,
  reviewItems: ReviewItem[],
  mistakes: MistakeRecord[],
  onboarded: boolean,
  checkpointResults: CheckpointResult[] = [],
  now = new Date(),
): NextAction {
  if (!onboarded) {
    return {
      kind: 'onboard',
      to: '/welcome',
      title: bi('Choose your teaching language', 'Избери език на обучение'),
      detail: bi('One question, then you can start.', 'Един въпрос и можеш да започнеш.'),
      estimatedMinutes: 1,
    };
  }

  const views = buildLessonViews(lessons);
  const placed = standingPlacement(lessons, checkpointResults);
  const inProgress = lessonInProgress(views, placed);
  const due = dueItems(reviewItems, now);
  const allComplete = views.length > 0 && views.every((view) => view.complete);

  if (inProgress) {
    return {
      kind: 'continue-lesson',
      to: `/lesson/${inProgress.lesson.id}`,
      title: inProgress.lesson.title,
      detail: bi('You are part-way through this lesson.', 'Този урок е започнат и недовършен.'),
      estimatedMinutes: Math.max(3, Math.round(inProgress.lesson.estimatedMinutes * (1 - inProgress.readiness))),
    };
  }

  if (due.length >= 5) {
    return {
      kind: 'review',
      to: '/review',
      title: bi(`${due.length} items are due`, `${due.length} елемента са за повторение`),
      detail: bi('Clear the queue before taking on new material.', 'Изчисти опашката, преди да поемеш нов материал.'),
      estimatedMinutes: Math.max(2, Math.round(due.length * 0.4)),
    };
  }

  /*
   * The end of a unit: its checkpoint, before the next unit begins.
   *
   * The course promises a checkpoint at the end of every unit, but none was
   * offered until all 84 lessons were done, so nobody was ever sent to one
   * while working through the course. It is offered while the furthest lesson
   * reached is the one that finished a unit, once: a learner who has tried it
   * goes on, and so does one who would rather start the next lesson. The
   * course page still has it.
   */
  const boundary = placed || allComplete ? undefined : unitCheckpointDue(views, lessons, checkpointResults);
  if (boundary) {
    return {
      kind: 'checkpoint',
      to: `/checkpoint/${boundary.id}`,
      title: boundary.title,
      detail: boundary.description,
      estimatedMinutes: 10,
    };
  }

  const next = nextNewLesson(views, placed);
  if (next) {
    return {
      kind: 'start-lesson',
      to: `/lesson/${next.lesson.id}`,
      title: next.lesson.title,
      detail: next.lesson.objective,
      estimatedMinutes: next.lesson.estimatedMinutes,
    };
  }

  if (due.length > 0) {
    return {
      kind: 'review',
      to: '/review',
      title: bi(`${due.length} items are due`, `${due.length} елемента са за повторение`),
      detail: bi('A short review round.', 'Кратък кръг повторение.'),
      estimatedMinutes: Math.max(2, Math.round(due.length * 0.4)),
    };
  }

  // Every authored lesson is done and nothing is due: the checkpoints not yet
  // passed, in course order. It used to be the first checkpoint, always —
  // passed or not, and ahead of anything due.
  const passed = new Set(checkpointResults.filter((result) => result.passed).map((result) => result.checkpointId));
  const checkpoint = allCheckpoints().find(
    (candidate) => candidate.status === 'available' && !passed.has(candidate.id),
  );
  if (allComplete && checkpoint) {
    return {
      kind: 'checkpoint',
      to: `/checkpoint/${checkpoint.id}`,
      title: checkpoint.title,
      detail: checkpoint.description,
      estimatedMinutes: 10,
    };
  }

  // A kind of mistake that keeps coming back is worth more than the individual
  // sentences, so the dominant category is suggested by name.
  const dominant = dominantCategory(mistakes);
  if (dominant) {
    return {
      kind: 'mistakes',
      to: '/mistakes',
      title: bi(
        `Practise ${CATEGORY_LABELS[dominant.category].en.toLowerCase()} mistakes`,
        `Упражнявай грешки: ${CATEGORY_LABELS[dominant.category].bg.toLowerCase()}`,
      ),
      detail: bi(
        `That has gone wrong ${dominant.count} times, and the course has ${dominant.tasks} tasks for it.`,
        `Това се е случило ${dominant.count} пъти, а курсът има ${dominant.tasks} задачи за него.`,
      ),
      estimatedMinutes: 5,
    };
  }

  const recurring = mistakes.filter((mistake) => mistake.occurrences > 1);
  if (recurring.length > 0) {
    return {
      kind: 'mistakes',
      to: '/mistakes',
      title: bi('Practise your recurring mistakes', 'Упражнявай повтарящите се грешки'),
      detail: bi(
        `${recurring.length} mistakes have happened more than once.`,
        `${recurring.length} грешки са се случили повече от веднъж.`,
      ),
      estimatedMinutes: 5,
    };
  }

  return {
    kind: 'idle',
    to: '/course',
    title: bi('You are up to date', 'Всичко е наред'),
    detail: bi('Nothing is due. Reviewing early is still an option.', 'Нищо не е за повторение. Можеш да повториш предварително.'),
    estimatedMinutes: 0,
  };
}

/**
 * More due than today's practice reviews on its own (it takes at most six), so
 * clearing them is worth a step of its own before anything new.
 */
export const REVIEW_BACKLOG = 10;

/** The daily practice's five parts, in order: a run's stage is an index into these. */
export const DAILY_STAGES: UiKey[] = ['dailyLearn', 'dailyReview', 'dailyRecall', 'dailyConversation', 'dailyListen'];

export type TodayStepKind = Exclude<NextActionKind, 'idle'> | 'daily' | 'continue-daily' | 'done';

export interface TodayInput {
  lessons: Record<string, LessonProgress>;
  /** Only the items on the learner's teaching path. */
  reviewItems: ReviewItem[];
  mistakes: MistakeRecord[];
  onboarded: boolean;
  checkpointResults: CheckpointResult[];
  dailyRuns: DailyRun[];
  minutesToday: number;
  targetMinutes: number;
  now?: Date;
}

export interface TodayStep {
  kind: TodayStepKind;
  to: string;
  /** What the course offers next, whatever leads today. */
  course: NextAction;
  /** Today's daily practice: not begun, begun and unfinished, or finished. */
  practice: 'todo' | 'open' | 'done';
  /** Today's unfinished practice, when there is one. */
  run?: DailyRun;
  due: number;
  goalMet: boolean;
  /**
   * The one thing offered after the first step, as a quiet link: the course
   * after today's practice, the practice after a lesson, and once the day is
   * done, a way to keep going.
   */
  then?: 'daily' | 'course';
}

/**
 * Today's first step, and the only one Today shows as a button.
 *
 * Today used to open on four starts of equal weight: the daily practice, the
 * lesson, the round and early review, and nothing said which came first. The
 * day is now one loop. A practice begun today is finished first, then
 * whatever the course has under way (a lesson part-done, a checkpoint just
 * earned), then a backlog of reviews, then today's practice, then the course's
 * next step. Once the daily goal in minutes is met, or the practice is done
 * and the course has nothing waiting, the day is done, and nothing nags: what
 * comes next is offered, never pressed.
 */
export function todayStep(input: TodayInput): TodayStep {
  const now = input.now ?? new Date();
  const day = todayHere(now);
  const course = nextAction(input.lessons, input.reviewItems, input.mistakes, input.onboarded, input.checkpointResults, now);
  const runs = input.dailyRuns.filter((candidate) => candidate.day === day);
  const run = runs.find((candidate) => candidate.stage < 5);
  const practice = runs.some((candidate) => candidate.stage >= 5) ? 'done' : run ? 'open' : 'todo';
  const due = dueItems(input.reviewItems, now).length;
  const goalMet = input.minutesToday >= Math.max(1, input.targetMinutes);
  const base = { course, practice, run: practice === 'open' ? run : undefined, due, goalMet } as const;
  const courseLeads = course.kind !== 'idle' && course.kind !== 'onboard';
  const afterCourse = practice === 'done' ? undefined : ('daily' as const);

  if (!input.onboarded) return { ...base, kind: 'onboard', to: course.to };
  if (goalMet || (practice === 'done' && !courseLeads)) {
    return { ...base, kind: 'done', to: '/', then: practice !== 'done' ? 'daily' : courseLeads ? 'course' : undefined };
  }
  if (practice === 'open') return { ...base, kind: 'continue-daily', to: '/daily', then: courseLeads ? 'course' : undefined };
  if (course.kind === 'continue-lesson' || course.kind === 'checkpoint') {
    return { ...base, kind: course.kind, to: course.to, then: afterCourse };
  }
  if (due >= REVIEW_BACKLOG) return { ...base, kind: 'review', to: '/review', then: afterCourse };
  if (practice === 'todo') return { ...base, kind: 'daily', to: '/daily', then: courseLeads ? 'course' : undefined };
  return { ...base, kind: course.kind as TodayStepKind, to: course.to, then: afterCourse };
}

/**
 * Where the placement check said to start, while that still stands.
 *
 * The check stored its recommendation and nothing read it back, so a learner
 * told "Start at B1" who left the result any way but its first button was sent
 * to Pre-A1 lesson 1 on Today, on the course page and in daily practice. The
 * latest result counts until the learner does lesson work after it: opening
 * the lesson it recommends, or the level above or below that the result
 * offers instead, puts them somewhere real, and from then on the lessons
 * themselves say where they are.
 */
export function standingPlacement(
  lessons: Record<string, LessonProgress>,
  checkpointResults: CheckpointResult[],
): CefrLevel | undefined {
  let latest: CheckpointResult | undefined;
  for (const result of checkpointResults) {
    if (result.checkpointId !== PLACEMENT_CHECKPOINT.id) continue;
    if (!CEFR_ORDER.includes(result.targetId as CefrLevel)) continue;
    if (!latest || Date.parse(result.createdAt) > Date.parse(latest.createdAt)) latest = result;
  }
  if (!latest) return undefined;
  const placedAt = Date.parse(latest.createdAt);
  const workedSince = Object.values(lessons).some(
    (progress) => Date.parse(progress.lastActiveAt ?? progress.startedAt ?? '') > placedAt,
  );
  return workedSince ? undefined : (latest.targetId as CefrLevel);
}

/** Where the learner's part of the course begins: the placed level's first lesson, or the first of all. */
function placedIndex(views: LessonView[], placed?: CefrLevel): number {
  return placed ? Math.max(0, views.findIndex((view) => view.lesson.level === placed)) : 0;
}

/**
 * A lesson started and not finished. While a placement stands, one below the
 * placed level does not count: the learner was sent past it after opening it.
 */
export function lessonInProgress(views: LessonView[], placed?: CefrLevel): LessonView | undefined {
  return views.slice(placedIndex(views, placed)).find((view) => view.started && !view.complete);
}

/**
 * The next lesson not yet started, counted on from where the learner is.
 *
 * The first unstarted lesson in the whole course sent a learner placed at A2
 * back to Pre-A1 lesson 1 after every lesson they finished. So the search
 * starts after the furthest lesson already started or finished, or at the
 * placed level while a placement stands; the lessons left behind (below a
 * placement, or skipped) come round once the end of the course is reached.
 */
export function nextNewLesson(views: LessonView[], placed?: CefrLevel): LessonView | undefined {
  let furthest = placedIndex(views, placed) - 1;
  if (!placed) {
    views.forEach((view, index) => {
      if (view.started || view.complete) furthest = index;
    });
  }
  return views.slice(furthest + 1).find((view) => !view.started) ?? views.find((view) => !view.started);
}

/**
 * The checkpoint a level offers next: the first not yet passed among its
 * finished units, then the level's own once every unit is finished. A unit
 * with lessons still only planned is not finished.
 */
export function checkpointToTake(
  level: Level,
  lessons: Record<string, LessonProgress>,
  checkpointResults: CheckpointResult[],
): Checkpoint | undefined {
  const passed = new Set(checkpointResults.filter((result) => result.passed).map((result) => result.checkpointId));
  const finished = level.units.filter((unit) =>
    unit.lessons.every((lesson) => isLessonComplete(lesson, lessons[lesson.id] ?? emptyProgress(lesson.id))),
  );
  const open = (checkpoint?: Checkpoint) => checkpoint && checkpoint.status === 'available' && !passed.has(checkpoint.id);
  const unitCheckpoint = finished.map((unit) => unit.checkpoint).find(open);
  if (unitCheckpoint) return unitCheckpoint;
  return finished.length === level.units.length && open(level.checkpoint) ? level.checkpoint : undefined;
}

/**
 * The checkpoint at a unit boundary: the furthest lesson reached has just
 * finished its unit. It is that unit's own checkpoint, and after the level's
 * last unit the level's, each only until it has been tried.
 *
 * It used to be the level's oldest checkpoint not passed, so one skipped in
 * unit 1 came back at every boundary after, and a failed one stood between
 * Today and the next lesson until it was passed. A skipped or failed
 * checkpoint is still on the course page, with its best score.
 */
function unitCheckpointDue(
  views: LessonView[],
  lessons: Record<string, LessonProgress>,
  checkpointResults: CheckpointResult[],
): Checkpoint | undefined {
  const furthest = views.filter((view) => view.started || view.complete).at(-1);
  if (!furthest?.complete) return undefined;
  const unit = unitById(furthest.lesson.unitId);
  const level = CURRICULUM.find((entry) => entry.id === furthest.lesson.level);
  if (!unit || !level) return undefined;
  const finished = (candidate: Unit) =>
    candidate.lessons.every((lesson) => isLessonComplete(lesson, lessons[lesson.id] ?? emptyProgress(lesson.id)));
  if (!finished(unit)) return undefined;
  const tried = new Set(checkpointResults.map((result) => result.checkpointId));
  const untried = (checkpoint?: Checkpoint) =>
    checkpoint?.status === 'available' && !tried.has(checkpoint.id) ? checkpoint : undefined;
  const own = untried(unit.checkpoint);
  if (own) return own;
  return unit.id === level.units.at(-1)?.id && level.units.every(finished) ? untried(level.checkpoint) : undefined;
}

/** The level a checkpoint belongs to; none for the placement check. */
export function checkpointLevel(checkpoint: Checkpoint): CefrLevel | undefined {
  if (checkpoint.scope === 'unit') return unitById(checkpoint.targetId)?.level;
  return checkpoint.scope === 'level' ? (checkpoint.targetId as CefrLevel) : undefined;
}

/**
 * The error category that is costing the learner most, provided the course
 * actually has tasks to practise it with. Needs at least three occurrences, so
 * a single slip never becomes the headline.
 */
export function dominantCategory(
  mistakes: MistakeRecord[],
): { category: MistakeRecord['category']; count: number; tasks: number } | undefined {
  const counts = new Map<MistakeRecord['category'], number>();
  for (const mistake of mistakes) {
    counts.set(mistake.category, (counts.get(mistake.category) ?? 0) + mistake.occurrences);
  }
  const ranked = [...counts]
    .map(([category, count]) => ({ category, count, tasks: practiceForCategory(category).length }))
    .filter((entry) => entry.count >= 3 && entry.tasks > 0)
    .sort((a, b) => b.count - a.count);
  return ranked[0];
}

export interface PlanItem {
  label: Bilingual;
  to: string;
  minutes: number;
  available: boolean;
}

/**
 * Today's suggested sequence, trimmed to the learner's daily target.
 * Only steps that are genuinely available are included.
 */
export function studyPlan(
  lessons: Record<string, LessonProgress>,
  reviewItems: ReviewItem[],
  mistakes: MistakeRecord[],
  targetMinutes: number,
  now = new Date(),
): PlanItem[] {
  const due = dueItems(reviewItems, now);
  const views = buildLessonViews(lessons);
  const lesson = views.find((view) => view.started && !view.complete) ?? nextNewLesson(views);
  const listening = due.filter((item) => item.kind === 'sentence' || item.kind === 'pattern').length;

  const candidates: PlanItem[] = [];

  if (due.length > 0) {
    candidates.push({
      label: bi(`Review ${due.length} due items`, `Повтори ${due.length} дължими елемента`),
      to: '/review',
      minutes: Math.max(2, Math.round(due.length * 0.4)),
      available: true,
    });
  }

  if (lesson) {
    candidates.push({
      label: lesson.started
        ? bi(`Continue: ${lesson.lesson.title.en}`, `Продължи: ${lesson.lesson.title.bg}`)
        : bi(`Lesson: ${lesson.lesson.title.en}`, `Урок: ${lesson.lesson.title.bg}`),
      to: `/lesson/${lesson.lesson.id}`,
      minutes: lesson.lesson.estimatedMinutes,
      available: true,
    });
  }

  if (listening > 0) {
    candidates.push({
      label: bi('Listen and type', 'Слушай и пиши'),
      to: '/review',
      minutes: 4,
      available: true,
    });
  }

  const recurring = mistakes.filter((mistake) => mistake.occurrences > 1);
  if (recurring.length > 0) {
    candidates.push({
      label: bi('Practise recurring mistakes', 'Упражнявай повтарящи се грешки'),
      to: '/mistakes',
      minutes: 4,
      available: true,
    });
  }

  // Trim to the daily target, but always keep at least one step.
  const plan: PlanItem[] = [];
  let budget = Math.max(5, targetMinutes);
  for (const candidate of candidates) {
    if (plan.length > 0 && candidate.minutes > budget) continue;
    plan.push(candidate);
    budget -= candidate.minutes;
  }
  return plan;
}

/**
 * What a daily round can be built out of, right now.
 *
 * The three sources are deliberately different in kind: the review queue is
 * what the schedule says has decayed, the mistake bank is what this learner
 * specifically keeps getting wrong, and the lesson is the new material. A round
 * made only of the first two never teaches anything; one made only of the third
 * lets everything already learnt rot.
 */
export interface SessionBuild {
  sources: SessionSources;
  /** The lesson the third part came from, when there is one. */
  lesson?: LessonView;
  /**
   * The lesson is started and every practice step in it is already answered
   * correctly, so what is left is the mastery check — which is a test, taken
   * in one sitting on the lesson page, not a slice of a mixed round.
   */
  lessonAwaitsMastery: boolean;
  /** Due items that cannot be typed; they are graded on the review page. */
  conceptItems: ReviewItem[];
}

export function sessionBuild(
  lessons: Record<string, LessonProgress>,
  reviewItems: ReviewItem[],
  mistakes: MistakeRecord[],
  now = new Date(),
  lang?: TeachingLanguage,
): SessionBuild {
  /*
   * Ordered, not merely filtered.
   *
   * The review page has always gone through `orderQueue`; the daily round took
   * whatever order the database handed back. That meant the one screen used
   * every day got neither the urgency ordering — forgotten words before merely
   * scheduled ones — nor the interleaving that keeps twenty words from the
   * same lesson out of a single run.
   */
  const review = buildReviewExercises(orderQueue(reviewItems, now), lang);

  // A mistake made once may have been a slip. Twice is a pattern, and a
  // pattern is worth spending a daily round on.
  const recurring = mistakes.filter((mistake) => mistake.occurrences > 1);

  const views = buildLessonViews(lessons);
  const lesson = views.find((view) => view.started && !view.complete);

  let lessonExercisesLeft: Exercise[] = [];
  let lessonAwaitsMastery = false;
  if (lesson) {
    lessonExercisesLeft = unresolvedPractice(lesson.lesson, lesson.progress, lang);
    // Read from the steps themselves: an empty list also means "not read yet",
    // which is not the same as only the final check being left.
    lessonAwaitsMastery = allStepIds(lesson.lesson).every((id) => lesson.progress.practice[id]?.resolved ?? false);
  }

  return {
    sources: {
      review: review.exercises,
      mistakes: buildMistakePractice(recurring),
      lesson: lessonExercisesLeft,
    },
    ...(lesson ? { lesson } : {}),
    lessonAwaitsMastery,
    conceptItems: review.conceptItems,
  };
}

/**
 * The practice steps of a lesson that the learner has not yet got right.
 *
 * Steps are dropped rather than whole exercises, because an exercise is often a
 * table of six conjugations of which two are still wrong — and retyping the
 * four that are already right is how a daily round turns into a chore. Step ids
 * are kept, so an answer here counts towards the same lesson progress and the
 * same review items as it would inside the lesson.
 *
 * A round must never ask for German that the course has not taught yet. So the
 * lesson is drawn on only once every section on the learner's path has been
 * read — opening a lesson marks its first section as seen, and that alone used
 * to put all of its exercises into the round — or once the learner has chosen
 * to start the exercises themselves. Without the teaching language, only the
 * sections both paths share are asked for.
 */
function unresolvedPractice(lesson: Lesson, progress: LessonProgress, lang?: TeachingLanguage): Exercise[] {
  const onPath = lesson.sections.filter((section) =>
    lang ? !section.only || section.only.includes(lang) : !section.only,
  );
  const read = onPath.every((section) => progress.sectionsSeen.includes(section.id));
  const practising = Object.keys(progress.practice).length > 0;
  if (progress.sectionsSeen.length === 0 || !(read || practising)) return [];
  const out: Exercise[] = [];
  for (const exercise of lesson.exercises) {
    const steps = exercise.steps.filter((step) => !(progress.practice[step.id]?.resolved ?? false));
    if (steps.length === 0) continue;
    out.push(steps.length === exercise.steps.length ? exercise : { ...exercise, steps });
  }
  return out;
}

export interface SkillProgress {
  key: 'vocabulary' | 'grammar' | 'listening' | 'writing' | 'reading' | 'speaking';
  /** null when the skill is not implemented yet, so the UI can say so. */
  value: number | null;
  done: number;
  total: number;
}

/** Progress per skill, each measured against authored content. */
export function skillProgress(
  lessons: Record<string, LessonProgress>,
  reviewItems: ReviewItem[],
): SkillProgress[] {
  const knownVocab = reviewItems.filter((item) => item.kind === 'vocab' && item.state === 'known').length;

  const available = availableLessons();
  const completedLessonIds = new Set(
    available.filter((lesson) => isLessonComplete(lesson, lessons[lesson.id] ?? emptyProgress(lesson.id))).map((l) => l.id),
  );
  const coveredGrammar = new Set(
    available.filter((lesson) => completedLessonIds.has(lesson.id)).flatMap((lesson) => lesson.grammarIds),
  );

  let listeningTotal = 0;
  let listeningDone = 0;
  let writingTotal = 0;
  let writingDone = 0;
  let readingTotal = 0;
  let readingDone = 0;

  for (const lesson of available) {
    const progress = lessons[lesson.id] ?? emptyProgress(lesson.id);
    readingTotal += lesson.sections.length;
    readingDone += lesson.sections.filter((section) => progress.sectionsSeen.includes(section.id)).length;

    for (const exercise of lessonExercises(lesson)) {
      const listening = exercise.kind === 'dictation' || exercise.kind === 'listenChoose';
      for (const step of exercise.steps) {
        const resolved = progress.practice[step.id]?.resolved ?? false;
        if (listening) {
          listeningTotal += 1;
          if (resolved) listeningDone += 1;
        }
        if (step.answer.shape === 'sentence') {
          writingTotal += 1;
          if (resolved) writingDone += 1;
        }
      }
    }
  }

  const ratio = (done: number, total: number) => (total > 0 ? done / total : 0);

  return [
    { key: 'vocabulary', value: ratio(knownVocab, VOCABULARY.length), done: knownVocab, total: VOCABULARY.length },
    {
      key: 'grammar',
      value: ratio(coveredGrammar.size, GRAMMAR_CONCEPTS.length),
      done: coveredGrammar.size,
      total: GRAMMAR_CONCEPTS.length,
    },
    { key: 'listening', value: ratio(listeningDone, listeningTotal), done: listeningDone, total: listeningTotal },
    { key: 'writing', value: ratio(writingDone, writingTotal), done: writingDone, total: writingTotal },
    { key: 'reading', value: ratio(readingDone, readingTotal), done: readingDone, total: readingTotal },
    // Speaking has interfaces but no implementation. Reporting a number here
    // would be inventing progress.
    { key: 'speaking', value: null, done: 0, total: 0 },
  ];
}

function emptyProgress(lessonId: string): LessonProgress {
  return {
    lessonId,
    sectionsSeen: [],
    practice: {},
    mastery: { attempts: 0, bestAccuracy: 0, passed: false },
    recoveryRounds: 0,
  };
}

export interface QueueEntry {
  item: ReviewItem;
  reason: ReturnType<typeof dueReason>;
  /** German for words and sentences; the raw id only when nothing resolves. */
  label: string;
  /** Whether `label` is German, to be marked lang="de" and played. */
  german: boolean;
  /** A grammar item's title, shown in the teaching language instead of `label`. */
  title?: Bilingual;
  /** What the German means, when the content says. */
  gloss?: Bilingual;
  /**
   * A pattern's own German, with its blank. The gloss translates this, not
   * the example sentence in `label`, so it is shown beside the gloss.
   */
  template?: string;
  entry?: VocabEntry;
}

/**
 * The review queue as the learner sees it. Only vocabulary used to be looked
 * up, so a due sentence pattern was listed as "p-ich-komme-aus".
 */
export function buildQueue(reviewItems: ReviewItem[], now = new Date()): QueueEntry[] {
  return orderQueue(reviewItems, now).map((item) => {
    const reason = dueReason(item, now);
    const entry = vocabById(item.refId);
    if (entry) return { item, reason, label: entry.display, german: true, gloss: entry.translation, entry };
    const pattern = patternById(item.refId);
    if (pattern) {
      return { item, reason, label: pattern.example, german: true, gloss: pattern.gloss, template: pattern.template };
    }
    const concept = grammarById(item.refId);
    if (concept) return { item, reason, label: concept.title.en, german: false, title: concept.title };
    return { item, reason, label: item.refId, german: false };
  });
}

/**
 * What "Practise early" plays: the soonest items not yet due that can be
 * typed. Empty for a learner with nothing learnt yet, and then nothing may
 * offer it: the dashboard and the empty review page promised early practice
 * to a brand-new learner and the review page had no way to give it.
 */
export function earlyReviewExercises(reviewItems: ReviewItem[], now = new Date(), limit = 10): Exercise[] {
  const ahead = reviewItems
    .filter((item) => new Date(item.dueAt).getTime() > now.getTime())
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  // Built from the front until there are enough, not for every item ahead:
  // Today asks for one on each render, only to know whether there is one.
  // A longer front gives the same cards first, so nothing changes but the
  // work.
  for (let end = limit; ; end += limit) {
    const built = buildReviewExercises(ahead.slice(0, end)).exercises;
    if (built.length >= limit || end >= ahead.length) return built.slice(0, limit);
  }
}

export function reasonKey(reason: ReturnType<typeof dueReason>): TeachingLanguageKey {
  switch (reason) {
    case 'new':
      return 'reviewReasonNew';
    case 'learning':
      return 'reviewReasonLearning';
    case 'lapsed':
      return 'reviewReasonLapsed';
    case 'overdue':
      return 'reviewReasonOverdue';
    default:
      return 'reviewReasonScheduled';
  }
}

type TeachingLanguageKey =
  | 'reviewReasonNew'
  | 'reviewReasonLearning'
  | 'reviewReasonLapsed'
  | 'reviewReasonOverdue'
  | 'reviewReasonScheduled';

export type { TeachingLanguage };
