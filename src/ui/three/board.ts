/** A unit as a board game: where the pawn stands, and which stations are done. */
import type { SceneSpec, Station } from './sceneData.ts';

/** One lesson of a unit, as the course page knows it. */
export interface BoardLesson {
  available: boolean;
  complete: boolean;
  /** The lesson the course would send the learner to next. */
  current: boolean;
}

/**
 * The unit as a board game: one station per lesson, then the checkpoint.
 *
 * `current` is the station the pawn stands on: the lesson the course marks
 * as next, else the first one written and not finished, else — every lesson
 * done — the checkpoint at the end (index `count`).
 */
export function pathBoard(lessons: BoardLesson[]): { count: number; done: number; current: number; spec: Extract<SceneSpec, { scene: 'path' }> } | null {
  if (lessons.length === 0) return null;
  const marked = lessons.findIndex((lesson) => lesson.current && lesson.available && !lesson.complete);
  const open = lessons.findIndex((lesson) => lesson.available && !lesson.complete);
  const current = marked !== -1 ? marked : open !== -1 ? open : lessons.length;
  const stations: Station[] = lessons.map((lesson, index) =>
    !lesson.available ? 'planned' : lesson.complete ? 'done' : index === current ? 'current' : 'todo');
  return {
    count: lessons.length,
    done: lessons.filter((lesson) => lesson.complete).length,
    current,
    spec: { scene: 'path', stations, current },
  };
}
