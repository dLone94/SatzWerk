import type { TeachingLanguage } from '../src/content/types.ts';
import type { RecallGrade } from '../src/core/srs/scheduler.ts';
import { createProvider, type AiProvider } from './ai.ts';
import type { Db } from './db.ts';
import * as store from './store.ts';

/**
 * The HTTP API, expressed as a pure function of (method, path, body).
 *
 * Keeping the router free of node:http means the whole API can be exercised in
 * tests against an in-memory database, with no ports and no fetch.
 */

export interface ApiRequest {
  method: string;
  path: string;
  body?: unknown;
}

export interface ApiResponse {
  status: number;
  body: unknown;
}

export interface ApiContext {
  db: Db;
  provider?: AiProvider;
}

const TEACHING_LANGUAGES = new Set<string>(['en', 'bg']);
const GRADES = new Set<string>(['again', 'hard', 'good', 'easy']);

function ok(body: unknown): ApiResponse {
  return { status: 200, body };
}

function badRequest(message: string): ApiResponse {
  return { status: 400, body: { error: message } };
}

function notFound(message = 'Not found'): ApiResponse {
  return { status: 404, body: { error: message } };
}

function asRecord(body: unknown): Record<string, unknown> {
  return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
}

/** Everything the client needs to render the whole app, in one round trip. */
export function fullState(db: Db) {
  return {
    profile: store.getProfile(db),
    lessons: store.getAllLessonProgress(db),
    reviewItems: store.listReviewItems(db),
    mistakes: store.listMistakes(db),
    favorites: store.listFavorites(db),
    stats: store.getStats(db),
    studyDays: store.listStudyDays(db, 60),
    checkpointResults: store.listCheckpointResults(db),
    serverTime: new Date().toISOString(),
  };
}

export async function handleRequest(ctx: ApiContext, request: ApiRequest): Promise<ApiResponse> {
  const { db } = ctx;
  const provider = ctx.provider ?? createProvider();
  const { method } = request;
  const path = request.path.replace(/\/+$/, '') || '/';
  const segments = path.split('/').filter(Boolean);

  // /api/...
  if (segments[0] !== 'api') return notFound();
  const route = segments.slice(1);

  if (route.length === 1 && route[0] === 'health' && method === 'GET') {
    return ok({ ok: true, time: new Date().toISOString() });
  }

  if (route.length === 1 && route[0] === 'state' && method === 'GET') {
    return ok(fullState(db));
  }

  if (route.length === 1 && route[0] === 'profile') {
    if (method === 'GET') return ok(store.getProfile(db));
    if (method === 'PUT' || method === 'PATCH') {
      const body = asRecord(request.body);
      const patch: store.ProfilePatch = {};
      if (body.teachingLanguage !== undefined) {
        if (!TEACHING_LANGUAGES.has(String(body.teachingLanguage))) {
          return badRequest('teachingLanguage must be "en" or "bg"');
        }
        patch.teachingLanguage = String(body.teachingLanguage) as TeachingLanguage;
      }
      if (body.dailyTargetMinutes !== undefined) {
        const minutes = Number(body.dailyTargetMinutes);
        if (!Number.isFinite(minutes)) return badRequest('dailyTargetMinutes must be a number');
        patch.dailyTargetMinutes = minutes;
      }
      if (body.displayName !== undefined) {
        patch.displayName = body.displayName === null ? null : String(body.displayName).slice(0, 80);
      }
      if (body.onboarded !== undefined) patch.onboarded = Boolean(body.onboarded);
      return ok(store.updateProfile(db, patch));
    }
  }

  if (route.length === 1 && route[0] === 'attempts' && method === 'POST') {
    const body = asRecord(request.body);
    const validation = validateAttempt(body);
    if ('error' in validation) return badRequest(validation.error);
    const result = store.recordAttempt(db, validation.input);
    return ok({ ...result, stats: store.getStats(db) });
  }

  if (route[0] === 'lessons' && route[1]) {
    const lessonId = decodeURIComponent(route[1]);
    if (route.length === 2 && method === 'GET') {
      return ok(store.getLessonProgress(db, lessonId));
    }
    if (route.length === 4 && route[2] === 'sections' && method === 'POST') {
      return ok(store.markSectionSeen(db, lessonId, decodeURIComponent(route[3]!)));
    }
    if (route.length === 3 && route[2] === 'mastery' && method === 'POST') {
      const body = asRecord(request.body);
      const accuracy = Number(body.accuracy);
      const passAccuracy = Number(body.passAccuracy);
      if (!Number.isFinite(accuracy) || !Number.isFinite(passAccuracy)) {
        return badRequest('accuracy and passAccuracy are required numbers');
      }
      return ok(store.recordMastery(db, lessonId, accuracy, passAccuracy));
    }
    if (route.length === 3 && route[2] === 'recovery' && method === 'POST') {
      return ok(store.recordRecoveryRound(db, lessonId));
    }
    if (route.length === 3 && route[2] === 'complete' && method === 'POST') {
      return ok(store.completeLesson(db, lessonId));
    }
  }

  if (route[0] === 'reviews') {
    if (route.length === 1 && method === 'GET') return ok(store.listReviewItems(db));
    if (route.length === 2 && route[1] === 'ensure' && method === 'POST') {
      const body = asRecord(request.body);
      const targets = Array.isArray(body.targets) ? (body.targets as store.TargetSpec[]) : [];
      const created = store.ensureReviewItems(db, targets);
      return ok({ created, reviewItems: store.listReviewItems(db) });
    }
    if (route.length === 3 && route[2] === 'grade' && method === 'POST') {
      const body = asRecord(request.body);
      const grade = String(body.grade);
      if (!GRADES.has(grade)) return badRequest('grade must be again, hard, good or easy');
      const item = store.gradeReviewItem(db, decodeURIComponent(route[1]!), grade as RecallGrade);
      if (!item) return notFound('Review item not found');
      return ok(item);
    }
  }

  if (route[0] === 'mistakes') {
    if (route.length === 1 && method === 'GET') {
      return ok(store.listMistakes(db, true));
    }
    if (route.length === 3 && route[2] === 'resolve' && method === 'POST') {
      store.resolveMistake(db, decodeURIComponent(route[1]!));
      return ok(store.listMistakes(db));
    }
  }

  if (route[0] === 'vocabulary' && route.length === 3 && route[2] === 'favorite' && method === 'POST') {
    const body = asRecord(request.body);
    store.setFavorite(db, decodeURIComponent(route[1]!), Boolean(body.favorite));
    return ok({ favorites: store.listFavorites(db) });
  }

  if (route.length === 1 && route[0] === 'checkpoints' && method === 'POST') {
    const body = asRecord(request.body);
    if (!body.checkpointId) return badRequest('checkpointId is required');
    store.recordCheckpointResult(db, {
      checkpointId: String(body.checkpointId),
      scope: String(body.scope ?? 'unit'),
      targetId: String(body.targetId ?? ''),
      accuracy: Number(body.accuracy ?? 0),
      passed: Boolean(body.passed),
      detail: body.detail,
    });
    return ok({ results: store.listCheckpointResults(db) });
  }

  if (route.length === 1 && route[0] === 'study' && method === 'POST') {
    const body = asRecord(request.body);
    const seconds = Number(body.seconds ?? 0);
    if (!Number.isFinite(seconds)) return badRequest('seconds must be a number');
    store.addStudyTime(db, seconds);
    return ok({ stats: store.getStats(db), studyDays: store.listStudyDays(db, 60) });
  }

  if (route.length === 1 && route[0] === 'attempts-recent' && method === 'GET') {
    return ok(store.listRecentAttempts(db, 50));
  }

  if (route[0] === 'coach') {
    if (route.length === 2 && route[1] === 'status' && method === 'GET') {
      return ok({
        aiAvailable: provider.available,
        provider: provider.name,
        features: {
          writingReview: 'rule-based',
          explainMistake: provider.available ? 'ai' : 'planned',
          generatePractice: provider.available ? 'ai' : 'planned',
          conversation: provider.available ? 'ai' : 'planned',
          speechEvaluation: 'planned',
        },
      });
    }
    if (route.length === 2 && route[1] === 'writing' && method === 'POST') {
      const body = asRecord(request.body);
      const text = String(body.text ?? '').slice(0, 4000);
      if (text.trim().length === 0) return badRequest('text is required');
      const language = TEACHING_LANGUAGES.has(String(body.language)) ? String(body.language) : 'en';
      const evaluation = await provider.evaluateWriting({
        text,
        language: language as TeachingLanguage,
        level: String(body.level ?? 'pre-a1'),
      });
      return ok(evaluation);
    }
    if (route.length === 2 && route[1] === 'conversation' && method === 'POST') {
      const body = asRecord(request.body);
      const turn = await provider.converse({
        scenarioId: String(body.scenarioId ?? ''),
        history: Array.isArray(body.history) ? body.history.map(String) : [],
        level: String(body.level ?? 'pre-a1'),
      });
      return ok(turn);
    }
  }

  if (route.length === 1 && route[0] === 'reset' && method === 'POST') {
    store.resetAll(db);
    return ok(fullState(db));
  }

  return notFound(`No route for ${method} ${path}`);
}

type AttemptValidation = { input: store.AttemptInput } | { error: string };

const CONTEXTS = new Set(['lesson', 'mastery', 'review', 'checkpoint', 'practice']);
const VERDICTS = new Set([
  'correct',
  'accepted-variant',
  'accepted-with-note',
  'almost',
  'incorrect',
  'empty',
]);

function validateAttempt(body: Record<string, unknown>): AttemptValidation {
  const stepId = String(body.stepId ?? '');
  if (!stepId) return { error: 'stepId is required' };
  const verdict = String(body.verdict ?? '');
  if (!VERDICTS.has(verdict)) return { error: `verdict "${verdict}" is not recognised` };
  const context = String(body.context ?? 'lesson');
  if (!CONTEXTS.has(context)) return { error: `context "${context}" is not recognised` };

  const credit = Number(body.credit ?? 0);
  if (!Number.isFinite(credit) || credit < 0 || credit > 1) {
    return { error: 'credit must be between 0 and 1' };
  }

  const categories = Array.isArray(body.categories) ? body.categories.map(String) : [];
  const targets = Array.isArray(body.reviewTargets) ? body.reviewTargets : [];

  return {
    input: {
      context: context as store.AttemptContext,
      lessonId: body.lessonId ? String(body.lessonId) : undefined,
      exerciseId: body.exerciseId ? String(body.exerciseId) : undefined,
      stepId,
      prompt: body.prompt ? String(body.prompt).slice(0, 500) : undefined,
      expected: String(body.expected ?? '').slice(0, 500),
      given: String(body.given ?? '').slice(0, 500),
      verdict: verdict as store.AttemptInput['verdict'],
      credit,
      categories: categories as store.AttemptInput['categories'],
      hintsUsed: Math.max(0, Number(body.hintsUsed ?? 0)) || 0,
      revealed: Boolean(body.revealed),
      isRetype: Boolean(body.isRetype),
      resolved: Boolean(body.resolved),
      durationMs: body.durationMs === undefined ? undefined : Number(body.durationMs),
      reviewTargets: targets.map((target) => {
        const record = asRecord(target);
        return {
          refId: String(record.refId ?? ''),
          kind: String(record.kind ?? 'vocab') as store.TargetSpec['kind'],
          level: String(record.level ?? 'pre-a1') as store.TargetSpec['level'],
          lessonId: record.lessonId ? String(record.lessonId) : undefined,
          difficulty: record.difficulty === undefined ? undefined : Number(record.difficulty),
        };
      }).filter((target) => target.refId.length > 0),
    },
  };
}
