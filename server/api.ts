import type { TeachingLanguage } from '../src/content/types.ts';
import type { RecallGrade } from '../src/core/srs/scheduler.ts';
import { createProvider, type AiProvider } from './ai.ts';
import {
  authState,
  clearedCookie,
  createSession,
  hashPassword,
  isHosted,
  isSecureRequest,
  parseCookies,
  passwordProblem,
  readSession,
  sessionCookie,
  SESSION_COOKIE,
  verifyPassword,
  type AuthConfig,
} from './auth.ts';
import { findDatabaseUrl, type Db } from './db.ts';
import * as store from './store.ts';
import {
  deleteSubscription,
  pushConfig,
  saveSubscription,
  sendDueReminder,
} from './push.ts';

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
  /**
   * Lower-cased request headers. `cookie`, `x-forwarded-proto` and
   * `authorization` are read; an adapter that drops one silently disables the
   * feature that depends on it.
   */
  headers?: Record<string, string | undefined>;
  /** Whether the request arrived over HTTPS, when the adapter knows directly. */
  secure?: boolean;
}

export interface ApiResponse {
  status: number;
  body: unknown;
  /** Response headers to add, used for Set-Cookie on login and logout. */
  headers?: Record<string, string>;
}

export interface ApiContext {
  db: Db;
  provider?: AiProvider;
  /**
   * Omitted in the tests, which then get the local `open` behaviour. A hosted
   * deployment always passes one, and fails closed without the secrets.
   */
  auth?: AuthConfig;
}

const TEACHING_LANGUAGES = new Set<string>(['en', 'bg']);
const GRADES = new Set<string>(['again', 'hard', 'good', 'easy']);

/**
 * A 200 with a JSON body.
 *
 * The `never` guard is load-bearing: `body` used to be `unknown`, so passing an
 * un-awaited store call type-checked fine and then serialised as `{}`. Every
 * store function is async now, and this turns forgetting an await into a
 * compile error rather than an empty response.
 */
function ok<T>(body: T extends Promise<unknown> ? never : T): ApiResponse {
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

/**
 * Everything the client needs to render the whole app, in one round trip.
 *
 * The eight queries are independent, so they go out together. Awaiting them one
 * after another would be eight sequential round trips to a hosted database on
 * every page load.
 */
export async function fullState(db: Db) {
  const [profile, lessons, reviewItems, mistakes, favorites, stats, studyDays, checkpointResults] =
    await Promise.all([
      await store.getProfile(db),
      await store.getAllLessonProgress(db),
      await store.listReviewItems(db),
      await store.listMistakes(db),
      await store.listFavorites(db),
      await store.getStats(db),
      await store.listStudyDays(db, 60),
      await store.listCheckpointResults(db),
    ]);
  return {
    profile,
    lessons,
    reviewItems,
    mistakes,
    favorites,
    stats,
    studyDays,
    checkpointResults,
    serverTime: new Date().toISOString(),
  };
}

/**
 * Work out the credentials in force.
 *
 * An environment variable wins, so an existing deployment configured that way
 * keeps behaving exactly as it did. Otherwise the stored hash is used, which
 * is what the browser setup screen writes. The session secret is generated and
 * kept on first use, so sessions survive a restart without anyone configuring
 * anything.
 */
export async function resolveAuth(db: Db, env: NodeJS.ProcessEnv = process.env): Promise<AuthConfig> {
  const hosted = isHosted(env);
  const fromEnv = env.SATZWERK_PASSWORD_HASH || undefined;
  const stored = fromEnv ? undefined : ((await store.getPasswordHash(db)) ?? undefined);
  const passwordHash = fromEnv ?? stored;
  // No password anywhere and running locally: nothing to protect, and no
  // reason to write a secret to the database.
  const sessionSecret =
    env.SATZWERK_SESSION_SECRET ||
    (passwordHash || hosted ? await store.getOrCreateSessionSecret(db) : undefined);
  return {
    passwordHash,
    sessionSecret,
    hosted,
    ...(fromEnv ? { passwordSource: 'env' as const } : stored ? { passwordSource: 'database' as const } : {}),
  };
}

/**
 * What a deployment can say about itself without a database and without a
 * password.
 *
 * This is the one answer that must survive everything else being broken. When
 * the app shows nothing but "Loading", opening /api/health in a browser
 * separates "the function is dead" from "the function is alive and cannot
 * reach its database" — which are two completely different fixes, and are
 * otherwise indistinguishable from the outside.
 *
 * Everything here is either a constant or the *shape* of the configuration.
 * No connection string, no hash, no secret: this URL is public by design.
 */
export function healthReport(env: NodeJS.ProcessEnv = process.env): {
  ok: true;
  time: string;
  node: string;
  hosted: boolean;
  database: 'postgres' | 'sqlite' | 'missing';
  /** Which variable the connection string came from, when there is one. */
  databaseFrom?: string;
} {
  const hosted = isHosted(env);
  const found = findDatabaseUrl(env);
  const database = found
    ? ('postgres' as const)
    : env.SATZWERK_DB || !hosted
      ? ('sqlite' as const)
      : ('missing' as const);
  return {
    ok: true,
    time: new Date().toISOString(),
    node: process.version,
    hosted,
    database,
    ...(found ? { databaseFrom: found.name } : {}),
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

  // Health stays public: it must answer before a session exists, so that a
  // deployment can be checked without logging in.
  if (route.length === 1 && route[0] === 'health' && method === 'GET') {
    return ok(healthReport());
  }

  /*
   * The reminder sender, called by the platform's scheduler rather than by a
   * browser. It sits above the session guard because a cron has no cookie —
   * and it is guarded by its own secret instead, refusing outright when that
   * secret is not configured rather than running unauthenticated.
   */
  // GET as well as POST: Vercel's scheduler invokes a cron path with GET, and
  // a handler that only answered POST would simply never fire.
  if (
    route.length === 2 &&
    route[0] === 'push' &&
    route[1] === 'run' &&
    (method === 'POST' || method === 'GET')
  ) {
    const secret = process.env.CRON_SECRET?.trim();
    if (!secret) {
      return { status: 503, body: { error: 'CRON_SECRET is not set, so the reminder job is disabled.' } };
    }
    const offered = String(request.headers?.authorization ?? '');
    if (offered !== `Bearer ${secret}`) {
      return { status: 401, body: { error: 'Not authorised.' } };
    }
    const profile = await store.getProfile(db);
    return ok(await sendDueReminder(db, { lang: profile.teachingLanguage }));
  }

  const auth = ctx.auth ?? (await resolveAuth(db));
  const state = authState(auth);
  const cookies = parseCookies(request.headers?.cookie);
  // Whether the cookie may carry Secure. See sessionCookie for why this is the
  // request's protocol and not the deployment's shape.
  const secure = request.secure ?? isSecureRequest(request.headers ?? {});
  const userId =
    state === 'required' && auth.sessionSecret
      ? readSession(auth.sessionSecret, cookies[SESSION_COOKIE] ?? '')
      : null;
  const signedIn = state === 'open' || userId !== null;

  const sessionBody = {
    required: state !== 'open',
    signedIn,
    needsSetup: state === 'setup',
    canChangePassword: auth.passwordSource !== 'env',
  };

  // Public, so the app can show the right screen instead of a wall of
  // failures: a password prompt, or the one-time setup screen.
  if (route.length === 1 && route[0] === 'session' && method === 'GET') {
    return ok(sessionBody);
  }

  // Hosted, with no password chosen yet. The first visitor sets one; until
  // then nothing else is served, so the app is never briefly open.
  if (route.length === 1 && route[0] === 'setup' && method === 'POST') {
    if (state !== 'setup') {
      return { status: 409, body: { error: 'A password is already set.' } };
    }
    const password = String(asRecord(request.body).password ?? '');
    const problem = passwordProblem(password);
    if (problem) return { status: 400, body: { error: problem } };

    await store.setPasswordHash(db, hashPassword(password));
    const secret = auth.sessionSecret ?? (await store.getOrCreateSessionSecret(db));
    return {
      status: 200,
      body: { required: true, signedIn: true, needsSetup: false, canChangePassword: true },
      headers: { 'set-cookie': sessionCookie(createSession(secret, 1), secure) },
    };
  }

  if (route.length === 1 && route[0] === 'login' && method === 'POST') {
    if (state === 'open') return ok(sessionBody);
    if (state === 'setup') {
      return { status: 409, body: { error: 'No password is set yet.', needsSetup: true } };
    }
    const password = String(asRecord(request.body).password ?? '');
    if (!password || !verifyPassword(password, auth.passwordHash!)) {
      // Deliberately vague, and the same shape whether or not a password was
      // supplied, so this cannot be used to probe.
      return { status: 401, body: { error: 'That password is not right.' } };
    }
    return {
      status: 200,
      body: { ...sessionBody, signedIn: true },
      headers: { 'set-cookie': sessionCookie(createSession(auth.sessionSecret!, 1), secure) },
    };
  }

  if (route.length === 1 && route[0] === 'logout' && method === 'POST') {
    return {
      status: 200,
      body: { ...sessionBody, signedIn: false },
      headers: { 'set-cookie': clearedCookie(secure) },
    };
  }

  // Everything below touches the learner's data.
  if (!signedIn) {
    return {
      status: 401,
      body: { error: 'Not signed in.', ...sessionBody, signedIn: false },
    };
  }

  // Changing the password needs the current one, so a borrowed session cannot
  // lock the owner out.
  if (route.length === 1 && route[0] === 'password' && method === 'POST') {
    if (auth.passwordSource === 'env') {
      return {
        status: 409,
        body: {
          error:
            'The password comes from the SATZWERK_PASSWORD_HASH environment variable, so it has to be changed there.',
        },
      };
    }
    const body = asRecord(request.body);
    const current = String(body.currentPassword ?? '');
    const next = String(body.newPassword ?? '');
    if (state === 'required' && !verifyPassword(current, auth.passwordHash!)) {
      return { status: 401, body: { error: 'That password is not right.' } };
    }
    const problem = passwordProblem(next);
    if (problem) return { status: 400, body: { error: problem } };

    await store.setPasswordHash(db, hashPassword(next));
    // A new secret invalidates every existing session, including any that is
    // not the one making this request. Changing the password should end them.
    await store.clearSessionSecret(db);
    const secret = await store.getOrCreateSessionSecret(db);
    return {
      status: 200,
      body: { required: true, signedIn: true, needsSetup: false, canChangePassword: true },
      headers: { 'set-cookie': sessionCookie(createSession(secret, 1), secure) },
    };
  }

  if (route.length === 1 && route[0] === 'state' && method === 'GET') {
    return ok(await fullState(db));
  }

  if (route.length === 1 && route[0] === 'profile') {
    if (method === 'GET') return ok(await store.getProfile(db));
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
      return ok(await store.updateProfile(db, patch));
    }
  }

  if (route.length === 1 && route[0] === 'attempts' && method === 'POST') {
    const body = asRecord(request.body);
    const validation = validateAttempt(body);
    if ('error' in validation) return badRequest(validation.error);
    const result = await store.recordAttempt(db, validation.input);
    return ok({ ...result, stats: await store.getStats(db) });
  }

  if (route[0] === 'lessons' && route[1]) {
    const lessonId = decodeURIComponent(route[1]);
    if (route.length === 2 && method === 'GET') {
      return ok(await store.getLessonProgress(db, lessonId));
    }
    if (route.length === 4 && route[2] === 'sections' && method === 'POST') {
      return ok(await store.markSectionSeen(db, lessonId, decodeURIComponent(route[3]!)));
    }
    if (route.length === 3 && route[2] === 'mastery' && method === 'POST') {
      const body = asRecord(request.body);
      const accuracy = Number(body.accuracy);
      const passAccuracy = Number(body.passAccuracy);
      if (!Number.isFinite(accuracy) || !Number.isFinite(passAccuracy)) {
        return badRequest('accuracy and passAccuracy are required numbers');
      }
      return ok(await store.recordMastery(db, lessonId, accuracy, passAccuracy));
    }
    if (route.length === 3 && route[2] === 'recovery' && method === 'POST') {
      return ok(await store.recordRecoveryRound(db, lessonId));
    }
    if (route.length === 3 && route[2] === 'complete' && method === 'POST') {
      return ok(await store.completeLesson(db, lessonId));
    }
  }

  if (route[0] === 'reviews') {
    if (route.length === 1 && method === 'GET') return ok(await store.listReviewItems(db));
    if (route.length === 2 && route[1] === 'ensure' && method === 'POST') {
      const body = asRecord(request.body);
      const targets = Array.isArray(body.targets) ? (body.targets as store.TargetSpec[]) : [];
      const created = await store.ensureReviewItems(db, targets);
      return ok({ created, reviewItems: await store.listReviewItems(db) });
    }
    if (route.length === 3 && route[2] === 'grade' && method === 'POST') {
      const body = asRecord(request.body);
      const grade = String(body.grade);
      if (!GRADES.has(grade)) return badRequest('grade must be again, hard, good or easy');
      const item = await store.gradeReviewItem(db, decodeURIComponent(route[1]!), grade as RecallGrade);
      if (!item) return notFound('Review item not found');
      return ok(item);
    }
  }

  if (route[0] === 'mistakes') {
    if (route.length === 1 && method === 'GET') {
      return ok(await store.listMistakes(db, true));
    }
    if (route.length === 3 && route[2] === 'resolve' && method === 'POST') {
      await store.resolveMistake(db, decodeURIComponent(route[1]!));
      return ok(await store.listMistakes(db));
    }
  }

  if (route[0] === 'vocabulary' && route.length === 3 && route[2] === 'favorite' && method === 'POST') {
    const body = asRecord(request.body);
    await store.setFavorite(db, decodeURIComponent(route[1]!), Boolean(body.favorite));
    return ok({ favorites: await store.listFavorites(db) });
  }

  if (route.length === 1 && route[0] === 'checkpoints' && method === 'POST') {
    const body = asRecord(request.body);
    if (!body.checkpointId) return badRequest('checkpointId is required');
    await store.recordCheckpointResult(db, {
      checkpointId: String(body.checkpointId),
      scope: String(body.scope ?? 'unit'),
      targetId: String(body.targetId ?? ''),
      accuracy: Number(body.accuracy ?? 0),
      passed: Boolean(body.passed),
      detail: body.detail,
    });
    return ok({ results: await store.listCheckpointResults(db) });
  }

  if (route.length === 1 && route[0] === 'study' && method === 'POST') {
    const body = asRecord(request.body);
    const seconds = Number(body.seconds ?? 0);
    if (!Number.isFinite(seconds)) return badRequest('seconds must be a number');
    await store.addStudyTime(db, seconds);
    return ok({ stats: await store.getStats(db), studyDays: await store.listStudyDays(db, 60) });
  }

  if (route.length === 1 && route[0] === 'attempts-recent' && method === 'GET') {
    return ok(await store.listRecentAttempts(db, 50));
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

  if (route[0] === 'push') {
    // The public key is needed to subscribe and is public by design. When push
    // is unconfigured this says so, and the settings page shows that instead
    // of a switch that would silently do nothing.
    if (route.length === 2 && route[1] === 'status' && method === 'GET') {
      const config = pushConfig();
      return ok({
        configured: config !== null,
        ...(config ? { publicKey: config.publicKey } : {}),
      });
    }
    if (route.length === 2 && route[1] === 'subscribe' && method === 'POST') {
      const body = asRecord(request.body);
      const endpoint = String(body.endpoint ?? '');
      const keys = asRecord(body.keys);
      const p256dh = String(keys.p256dh ?? '');
      const auth256 = String(keys.auth ?? '');
      if (!endpoint || !p256dh || !auth256) return badRequest('endpoint and keys are required');
      await saveSubscription(db, { endpoint, p256dh, auth: auth256 });
      return ok({ subscribed: true });
    }
    if (route.length === 2 && route[1] === 'unsubscribe' && method === 'POST') {
      const body = asRecord(request.body);
      const endpoint = String(body.endpoint ?? '');
      if (!endpoint) return badRequest('endpoint is required');
      await deleteSubscription(db, endpoint);
      return ok({ subscribed: false });
    }
  }

  if (route.length === 1 && route[0] === 'reset' && method === 'POST') {
    await store.resetAll(db);
    return ok(await fullState(db));
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
