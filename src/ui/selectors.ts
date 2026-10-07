import {
  GRAMMAR_CONCEPTS,
  VOCABULARY,
  allCheckpoints,
  allLessons,
  availableLessons,
  grammarById,
  lessonExercises,
  lessonsInOrder,
  patternById,
  practiceForCategory,
  unitForLesson,
  vocabById,
} from '../content/browser.ts';
import type { Bilingual, Exercise, ExerciseStep, Lesson, TeachingLanguage, VocabEntry } from '../content/types.ts';
import { allStepIds, isLessonComplete, lessonRequirements, type LessonProgress } from '../core/progress/lesson.ts';
import type { SessionSources } from '../core/progress/session.ts';
import { dueItems, dueReason, orderQueue, type ReviewItem } from '../core/srs/scheduler.ts';
import { toDigraphs } from '../core/validation/text.ts';
import { CATEGORY_LABELS } from '../i18n.ts';
import type { CheckpointResult, MistakeRecord } from '../services/api/client.ts';
import { buildMistakePractice, buildReviewExercises } from './reviewBuilder.ts';

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

  const mistakeCounts = new Map<string, number>();
  for (const mistake of mistakes) {
    for (const entry of VOCABULARY) {
      if (mistakeMatchesVocab(mistake, entry)) {
        mistakeCounts.set(entry.id, (mistakeCounts.get(entry.id) ?? 0) + mistake.occurrences);
      }
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

/** Every authored step, by id: lesson practice, final checks and checkpoints. */
let stepIndex: Map<string, ExerciseStep> | null = null;
function stepById(id: string): ExerciseStep | undefined {
  if (!stepIndex) {
    stepIndex = new Map();
    const exercises = [
      ...allLessons().flatMap((lesson) => [...lesson.exercises, ...lesson.mastery.exercises]),
      ...allCheckpoints().flatMap((checkpoint) => checkpoint.exercises),
    ];
    for (const exercise of exercises) for (const step of exercise.steps) stepIndex.set(step.id, step);
  }
  return stepIndex.get(id);
}

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
  const step = mistake.stepId ? stepById(mistake.stepId) : undefined;
  const vocabTargets = (step?.reviewTargets ?? []).filter((id) => vocabById(id));
  if (vocabTargets.length > 0) return vocabTargets.includes(entry.id);

  const answer = words(mistake.expected);
  const word = words(entry.german);
  if (word.length === 0) return false;
  for (let start = 0; start + word.length <= answer.length; start += 1) {
    if (word.every((token, offset) => answer[start + offset] === token)) return true;
  }
  return false;
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
  const inProgress = views.find((view) => view.started && !view.complete);
  const due = dueItems(reviewItems, now);

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

  const next = nextNewLesson(views);
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
  const allComplete = views.length > 0 && views.every((view) => view.complete);
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
    detail: bi('Nothing is due. Practising early is still an option.', 'Нищо не е дължимо. Можеш да упражняваш предварително.'),
    estimatedMinutes: 0,
  };
}

/**
 * The next lesson not yet started, counted on from where the learner is.
 *
 * The first unstarted lesson in the whole course sent a learner placed at A2
 * back to Pre-A1 lesson 1 after every lesson they finished. So the search
 * starts after the furthest lesson already started or finished; the lessons
 * left behind (below a placement, or skipped) come round once the end of the
 * course is reached.
 */
function nextNewLesson(views: LessonView[]): LessonView | undefined {
  let furthest = -1;
  views.forEach((view, index) => {
    if (view.started || view.complete) furthest = index;
  });
  return views.slice(furthest + 1).find((view) => !view.started) ?? views.find((view) => !view.started);
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
    const reason = dueReason(item);
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
