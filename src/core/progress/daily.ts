import type { Bilingual, CefrLevel } from '../../content/types.ts';
import { todayHere } from './days.ts';

export const LEARNING_GOALS = ['everyday', 'travel', 'work', 'exams'] as const;
export type LearningGoal = typeof LEARNING_GOALS[number];
export const PRACTICE_LEVELS = ['pre-a1', 'a1', 'a2', 'b1', 'b2'] as const satisfies readonly CefrLevel[];
export const GOAL_LABELS: Record<LearningGoal, Bilingual> = {
  everyday: { en: 'Everyday life', bg: 'Ежедневие' },
  travel: { en: 'Travel', bg: 'Пътуване' },
  work: { en: 'Work', bg: 'Работа' },
  exams: { en: 'Exam practice', bg: 'Подготовка за изпит' },
};

/** A completed part is banked separately from the answers it contains. */
export interface DailyRunInput {
  id: string;
  day: string;
  scriptId: string;
  goal: LearningGoal;
  /** 0: learn, 1: review, 2: recall, 3: conversation, 4: listen, 5: finished. */
  stage: number;
  total: number;
  firstTryCorrect: number;
  listeningCompleted: boolean;
}
export interface DailyRun extends DailyRunInput { updatedAt: string }

export function mergeDailyRun(runs: DailyRun[], next: DailyRun): DailyRun[] {
  const prior = runs.find(run => run.id === next.id);
  if (prior && prior.stage > next.stage) return runs;
  return [next, ...runs.filter(run => run.id !== next.id)]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id)).slice(0, 100);
}

/** Flexible weekly goals count days with actual answers, rather than a streak. */
export function weeklyPractice(days: Array<{ day: string; answers: number }>, target: number, now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const today = todayHere(now);
  const start = todayHere(monday);
  const done = new Set(days.filter(day => day.answers > 0 && day.day >= start && day.day <= today).map(day => day.day)).size;
  const goal = Math.max(1, Math.min(7, Math.round(target)));
  return { done, goal, left: Math.max(0, goal - done), start };
}

export function isCalendarDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
