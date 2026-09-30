import { ERROR_CATEGORIES, type ErrorCategory, type TeachingLanguage } from '../src/content/types.ts';
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
  sessionKey,
  sessionCookie,
  SESSION_COOKIE,
  verifyPassword,
  type AuthConfig,
} from './auth.ts';
import { plausibleOffset } from '../src/core/progress/days.ts';
import { findDatabaseUrl, type Db } from './db.ts';
import * as store from './store.ts';
import {
  deleteSubscription,
  moveSubscription,
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

/**
 * Which learner this browser is studying as.
 *
 * A cookie rather than a header, for two reasons: it survives a reload without
 * the client having to remember anything, and it is per device — so a phone
 * stays the person who holds it while the tablet on the kitchen table stays
 * somebody else.
 *
 * It is deliberately not a security boundary. Everybody in the household
 * already shares the one password; this answers "who is studying", not "who is
 * allowed in", and the UI says as much. An unknown or missing value falls back
 * to learner 1, which is whose progress a single-learner database already had.
 */
export const LEARNER_COOKIE = 'satzwerk_learner';

async function resolveLearner(db: Db, request: ApiRequest): Promise<number> {
  const raw = parseCookies(request.headers?.cookie)[LEARNER_COOKIE];
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) return 1;
  return (await store.getLearner(db, id)) ? id : 1;
}

function learnerCookie(id: number, secure: boolean): string {
  const bits = [
    `${LEARNER_COOKIE}=${id}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${60 * 60 * 24 * 365}`,
  ];
  if (secure) bits.push('Secure');
  return bits.join('; ');
}
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

/**
 * The browser sends its push endpoint, when it has one, with a switch of
 * learner, so this phone's reminders go to whoever is studying on it now.
 */
async function followedByReminders(db: Db, body: unknown, learnerId: number): Promise<void> {
  const endpoint = asRecord(body).endpoint;
  if (typeof endpoint === 'string' && endpoint.length > 0) await moveSubscription(db, endpoint, learnerId);
}

function decodable(segment: string): boolean {
  try {
    decodeURIComponent(segment);
    return true;
  } catch {
    return false;
  }
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
export async function fullState(scope: store.Scope) {
  const [
    profile,
    lessons,
    reviewItems,
    mistakes,
    favorites,
    stats,
    studyDays,
    checkpointResults,
    scenarioRuns,
  ] = await Promise.all([
    // No `await` inside this list, and that is the whole point of the list.
    // With one on each line the array elements are evaluated one at a time —
    // each query waits for the one above it to come back before it is even
    // sent — so `Promise.all` received nine promises that had already been
    // resolved in series. Nine sequential round trips to a hosted database on
    // every page load, under a comment claiming they went out together.
    store.getProfile(scope),
    store.getAllLessonProgress(scope),
    store.listReviewItems(scope),
    store.listMistakes(scope),
    store.listFavorites(scope),
    store.getStats(scope),
    store.listStudyDaysForStreak(scope, 60),
    store.listCheckpointResults(scope),
    store.listScenarioRuns(scope),
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
    scenarioRuns,
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
  // Routes decode their ids with decodeURIComponent, which throws on broken
  // percent-encoding; that surfaced as a 500 for what is a bad request.
  if (!route.every(decodable)) return badRequest('The address is not valid percent-encoding.');

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
    /*
     * One reminder per learner, each in their own language.
     *
     * A cron has no cookie, so there is no "who is studying" to read here —
     * and there should not be: a household's evening reminder is everybody's.
     * Each learner's due count comes from their own reviews and goes to the
     * subscriptions of the devices they are the one studying on (a switch of
     * learner on a device carries its subscription over).
     */
    const learners = await store.listLearners(db);
    const reports = [];
    for (const learner of learners) {
      const theirs: store.Scope = { db, userId: learner.id };
      const profile = await store.getProfile(theirs);
      reports.push({
        learner: learner.name,
        ...(await sendDueReminder(theirs, { lang: profile.teachingLanguage })),
      });
    }
    // The shape of a single report is kept at the top level for the one-learner
    // case, which is every household that has not added anybody: a smoke test
    // and a cron log should not have to learn a new shape to stay readable.
    return ok(reports.length === 1 ? { ...reports[0]!, learners: reports } : { learners: reports });
  }

  const auth = ctx.auth ?? (await resolveAuth(db));
  const state = authState(auth);
  const cookies = parseCookies(request.headers?.cookie);
  // Whether the cookie may carry Secure. See sessionCookie for why this is the
  // request's protocol and not the deployment's shape.
  const secure = request.secure ?? isSecureRequest(request.headers ?? {});
  const key = sessionKey(auth);
  const userId = state === 'required' && key ? readSession(key, cookies[SESSION_COOKIE] ?? '') : null;
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

    const passwordHash = hashPassword(password);
    await store.setPasswordHash(db, passwordHash);
    // Signed with the key the next request will check it against, which is
    // bound to the hash just stored.
    const secret = auth.sessionSecret ?? (await store.getOrCreateSessionSecret(db));
    const token = createSession(sessionKey({ sessionSecret: secret, passwordHash })!, 1);
    return {
      status: 200,
      body: { required: true, signedIn: true, needsSetup: false, canChangePassword: true },
      headers: { 'set-cookie': sessionCookie(token, secure) },
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
      headers: { 'set-cookie': sessionCookie(createSession(key!, 1), secure) },
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

  /*
   * From here on, every query is somebody's.
   *
   * Resolved once, so no route below can accidentally read a different
   * learner's rows — and typed as a `Scope`, so a store call that forgets whose
   * data it wants does not compile.
   */
  const scope: store.Scope = { db, userId: await resolveLearner(db, request) };

  // Who is here, and who else could be.
  if (route[0] === 'learners') {
    if (route.length === 1 && method === 'GET') {
      return ok({ learners: await store.listLearners(db), studyingAs: scope.userId });
    }
    if (route.length === 1 && method === 'POST') {
      const name = String(asRecord(request.body).name ?? '').trim();
      if (!name) return badRequest('A learner needs a name.');
      const learner = await store.createLearner(db, name);
      await followedByReminders(db, request.body, learner.id);
      // Created, and immediately studying as them: adding somebody is
      // something you do in order to hand them the phone.
      return {
        status: 200,
        body: { learners: await store.listLearners(db), studyingAs: learner.id },
        headers: { 'set-cookie': learnerCookie(learner.id, secure) },
      };
    }
    if (route.length === 2 && method === 'POST' && route[1] === 'select') {
      const id = Number(asRecord(request.body).id);
      if (!(await store.getLearner(db, id))) return badRequest('No such learner.');
      await followedByReminders(db, request.body, id);
      return {
        status: 200,
        body: { learners: await store.listLearners(db), studyingAs: id },
        headers: { 'set-cookie': learnerCookie(id, secure) },
      };
    }
    if (route.length === 2 && method === 'PUT') {
      const id = Number(route[1]);
      const name = String(asRecord(request.body).name ?? '').trim();
      if (!name) return badRequest('A learner needs a name.');
      const learner = await store.renameLearner(db, id, name);
      if (!learner) return notFound('No such learner.');
      return ok({ learners: await store.listLearners(db), studyingAs: scope.userId });
    }
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

    const passwordHash = hashPassword(next);
    await store.setPasswordHash(db, passwordHash);
    // Sessions are signed with a key bound to the password hash (see
    // sessionKey), so the new hash alone ends every existing session, this
    // device's included — whether the secret is stored or comes from the
    // environment. This device gets a fresh cookie under the new key.
    const token = createSession(sessionKey({ sessionSecret: auth.sessionSecret, passwordHash })!, 1);
    return {
      status: 200,
      body: { required: true, signedIn: true, needsSetup: false, canChangePassword: true },
      headers: { 'set-cookie': sessionCookie(token, secure) },
    };
  }

  if (route.length === 1 && route[0] === 'state' && method === 'GET') {
    return ok(await fullState(scope));
  }

  if (route.length === 1 && route[0] === 'profile') {
    if (method === 'GET') return ok(await store.getProfile(scope));
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
      return ok(await store.updateProfile(scope, patch));
    }
  }

  if (route.length === 1 && route[0] === 'attempts' && method === 'POST') {
    const body = asRecord(request.body);
    const validation = validateAttempt(body);
    if ('error' in validation) return badRequest(validation.error);
    const result = await store.recordAttempt(scope, validation.input, validation.at);
    return ok({ ...result, stats: await store.getStats(scope) });
  }

  if (route[0] === 'lessons' && route[1]) {
    const lessonId = decodeURIComponent(route[1]);
    if (route.length === 2 && method === 'GET') {
      return ok(await store.getLessonProgress(scope, lessonId));
    }
    if (route.length === 4 && route[2] === 'sections' && method === 'POST') {
      return ok(await store.markSectionSeen(scope, lessonId, decodeURIComponent(route[3]!)));
    }
    if (route.length === 3 && route[2] === 'mastery' && method === 'POST') {
      const body = asRecord(request.body);
      const accuracy = Number(body.accuracy);
      const passAccuracy = Number(body.passAccuracy);
      if (!Number.isFinite(accuracy) || !Number.isFinite(passAccuracy)) {
        return badRequest('accuracy and passAccuracy are required numbers');
      }
      return ok(await store.recordMastery(scope, lessonId, accuracy, passAccuracy));
    }
    if (route.length === 3 && route[2] === 'recovery' && method === 'POST') {
      return ok(await store.recordRecoveryRound(scope, lessonId));
    }
    if (route.length === 3 && route[2] === 'complete' && method === 'POST') {
      return ok(await store.completeLesson(scope, lessonId));
    }
  }

  if (route[0] === 'reviews') {
    if (route.length === 1 && method === 'GET') return ok(await store.listReviewItems(scope));
    if (route.length === 2 && route[1] === 'ensure' && method === 'POST') {
      const body = asRecord(request.body);
      const targets = Array.isArray(body.targets) ? (body.targets as store.TargetSpec[]) : [];
      const created = await store.ensureReviewItems(scope, targets);
      return ok({ created, reviewItems: await store.listReviewItems(scope) });
    }
    if (route.length === 3 && route[2] === 'grade' && method === 'POST') {
      const body = asRecord(request.body);
      const grade = String(body.grade);
      if (!GRADES.has(grade)) return badRequest('grade must be again, hard, good or easy');
      // When it was graded, which is not when it arrived if it waited in the
      // outbox: a grade given on Monday is scheduled from Monday.
      const item = await store.gradeReviewItem(
        scope,
        decodeURIComponent(route[1]!),
        grade as RecallGrade,
        gradeTime(body.gradedAt, new Date()),
      );
      if (!item) return notFound('Review item not found');
      return ok(item);
    }
  }

  if (route[0] === 'mistakes') {
    if (route.length === 1 && method === 'GET') {
      return ok(await store.listMistakes(scope, true));
    }
    if (route.length === 3 && route[2] === 'resolve' && method === 'POST') {
      await store.resolveMistake(scope, decodeURIComponent(route[1]!));
      return ok(await store.listMistakes(scope));
    }
  }

  if (route[0] === 'vocabulary' && route.length === 3 && route[2] === 'favorite' && method === 'POST') {
    const body = asRecord(request.body);
    await store.setFavorite(scope, decodeURIComponent(route[1]!), Boolean(body.favorite));
    return ok({ favorites: await store.listFavorites(scope) });
  }

  if (route.length === 1 && route[0] === 'checkpoints' && method === 'POST') {
    const body = asRecord(request.body);
    if (!body.checkpointId) return badRequest('checkpointId is required');
    const accuracy = Number(body.accuracy ?? 0);
    // Checked rather than passed through. An accuracy of NaN reached a NOT NULL
    // column, the insert failed with a 500, and a 500 is what the client reads
    // as "refused" — so a finished checkpoint was thrown away over a number
    // nobody looked at. Its neighbours all clamp; this one did not.
    if (!Number.isFinite(accuracy)) return badRequest('accuracy must be a number');
    await store.recordCheckpointResult(scope, {
      checkpointId: String(body.checkpointId),
      scope: String(body.scope ?? 'unit'),
      targetId: String(body.targetId ?? ''),
      accuracy: Math.min(1, Math.max(0, accuracy)),
      passed: Boolean(body.passed),
      detail: body.detail,
    });
    return ok({ results: await store.listCheckpointResults(scope) });
  }

  if (route.length === 1 && route[0] === 'scenario-runs' && method === 'POST') {
    const body = asRecord(request.body);
    if (!body.scriptId) return badRequest('scriptId is required');
    const turns = Number(body.turns ?? 0);
    const firstTryCorrect = Number(body.firstTryCorrect ?? 0);
    if (!Number.isFinite(turns) || !Number.isFinite(firstTryCorrect)) {
      return badRequest('turns and firstTryCorrect must be numbers');
    }
    await store.recordScenarioRun(scope, { scriptId: String(body.scriptId), turns, firstTryCorrect });
    return ok({ scenarioRuns: await store.listScenarioRuns(scope) });
  }

  if (route.length === 1 && route[0] === 'study' && method === 'POST') {
    const body = asRecord(request.body);
    const seconds = Number(body.seconds ?? 0);
    if (!Number.isFinite(seconds)) return badRequest('seconds must be a number');
    // Minutes studied in a tunnel belong to the day they were spent, under the
    // same plausibility rule as an answer's own timestamp — and to the day it
    // was where the learner was standing, not to a UTC one.
    await store.addStudyTime(
      scope,
      seconds,
      attemptTime(body.at, new Date()),
      plausibleOffset(body.tzOffsetMinutes),
    );
    return ok({ stats: await store.getStats(scope), studyDays: await store.listStudyDaysForStreak(scope, 60) });
  }

  if (route.length === 1 && route[0] === 'attempts-recent' && method === 'GET') {
    return ok(await store.listRecentAttempts(scope, 50));
  }

  if (route[0] === 'coach') {
    if (route.length === 2 && route[1] === 'status' && method === 'GET') {
      return ok({
        aiAvailable: provider.available,
        provider: provider.name,
        features: {
          // The rule-based checks always run. With a provider configured a
          // model adds to them; it never replaces them, so this stays true
          // either way.
          writingReview: provider.available ? 'rule-based+ai' : 'rule-based',
          explainMistake: provider.available ? 'ai' : 'planned',
          // Not 'planned'. These are a decision, not a backlog item: every
          // German sentence in this app has been read by a person, and
          // generated practice would break that without the learner being
          // able to tell. Saying 'planned' would promise something that is
          // not coming.
          generatePractice: 'not-generated',
          conversation: 'not-generated',
          speechEvaluation: 'planned',
        },
      });
    }

    /*
     * Why one mistake was wrong, in the learner's own language.
     *
     * This is the one thing authored content genuinely cannot cover: a learner
     * can produce a wrong form nobody wrote a trap for. It runs after the
     * verdict is already given and banked, so an unreachable model costs the
     * learner nothing they had.
     */
    if (route.length === 2 && route[1] === 'explain' && method === 'POST') {
      const body = asRecord(request.body);
      const expected = String(body.expected ?? '').slice(0, 500);
      const given = String(body.given ?? '').slice(0, 500);
      if (expected.trim().length === 0 || given.trim().length === 0) {
        return badRequest('expected and given are both required');
      }
      const language = TEACHING_LANGUAGES.has(String(body.language)) ? String(body.language) : 'en';
      const categories = Array.isArray(body.categories) ? body.categories.map(String) : [];
      const explanation = await provider.explainMistake({
        expected,
        given,
        categories: categories as ErrorCategory[],
        language: language as TeachingLanguage,
        level: String(body.level ?? 'pre-a1'),
      });
      return ok(explanation);
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
      await saveSubscription(scope, { endpoint, p256dh, auth: auth256 });
      return ok({ subscribed: true });
    }
    if (route.length === 2 && route[1] === 'unsubscribe' && method === 'POST') {
      const body = asRecord(request.body);
      const endpoint = String(body.endpoint ?? '');
      if (!endpoint) return badRequest('endpoint is required');
      await deleteSubscription(scope, endpoint);
      return ok({ subscribed: false });
    }
  }

  if (route.length === 1 && route[0] === 'reset' && method === 'POST') {
    await store.resetAll(scope);
    return ok(await fullState(scope));
  }

  return notFound(`No route for ${method} ${path}`);
}

type AttemptValidation = { input: store.AttemptInput; at: Date } | { error: string };

/**
 * How long ago an answer may claim to have been typed.
 *
 * An answer typed in a tunnel is sent when the phone finds signal again, and it
 * belongs to the day it was typed — otherwise a Tuesday evening of work lands
 * on Wednesday and the streak tells a small lie. So the client sends the time
 * and the server uses it.
 *
 * Within limits. The clock belongs to whoever is holding the phone, and a
 * device that boots with a wrong one (a flat battery, a factory reset) would
 * otherwise write attempts into 2009 or into next year, where nothing would
 * ever show them. Outside this window the server's own clock is used instead:
 * wrong by hours at worst, rather than wrong by years.
 */
export const ATTEMPT_BACKDATE_LIMIT_MS = 14 * 24 * 60 * 60 * 1000;

/** Two minutes of slack for a phone clock that runs slightly fast. */
const ATTEMPT_SKEW_MS = 2 * 60 * 1000;

export function attemptTime(raw: unknown, now: Date): Date {
  if (typeof raw !== 'string' || raw.length === 0) return now;
  const stamped = new Date(raw);
  const millis = stamped.getTime();
  if (!Number.isFinite(millis)) return now;
  if (millis > now.getTime() + ATTEMPT_SKEW_MS) return now;
  if (millis < now.getTime() - ATTEMPT_BACKDATE_LIMIT_MS) return now;
  return stamped;
}

/** How far back a queued review grade may date itself. */
export const GRADE_BACKDATE_LIMIT_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * The time a review grade was given, held to the last thirty days.
 *
 * Clamped rather than replaced, unlike an answer's time: a grade only moves a
 * schedule, and one from a phone whose clock is wrong is better placed at the
 * edge of the plausible window than at an arbitrary "now". Nothing is dated
 * in the future.
 */
export function gradeTime(raw: unknown, now: Date): Date {
  if (typeof raw !== 'string' || raw.length === 0) return now;
  const millis = new Date(raw).getTime();
  if (!Number.isFinite(millis)) return now;
  return new Date(Math.min(now.getTime(), Math.max(now.getTime() - GRADE_BACKDATE_LIMIT_MS, millis)));
}

/** A step nobody spent two hours on, and nobody finished in negative time. */
const MAX_STEP_MS = 2 * 60 * 60 * 1000;

function plausibleDuration(raw: unknown): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  const millis = Number(raw);
  if (!Number.isFinite(millis) || millis < 0) return undefined;
  return Math.min(MAX_STEP_MS, Math.round(millis));
}

const CONTEXTS = new Set(['lesson', 'mastery', 'review', 'checkpoint', 'practice', 'scenario']);
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

  /*
   * Only categories this app has a name for.
   *
   * `verdict` and `context` were checked against their sets and this was not,
   * so anything at all could be stored — and it was then counted and shown as
   * a row in the learner's own mistake statistics, under whatever string
   * arrived. Unknown ones are dropped rather than refused: the answer and its
   * verdict are the learner's work and are worth more than a label.
   */
  const known = new Set<string>(ERROR_CATEGORIES);
  const categories = (Array.isArray(body.categories) ? body.categories.map(String) : []).filter(
    (category) => known.has(category),
  );
  const targets = Array.isArray(body.reviewTargets) ? body.reviewTargets : [];

  return {
    // When the answer was typed, which is not when it arrived if it waited in
    // the client's outbox for the connection to come back.
    at: attemptTime(body.at, new Date()),
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
      // Left undefined when not sent, which an older client does not.
      requireRetype: body.requireRetype === undefined ? undefined : Boolean(body.requireRetype),
      // A duration that is not a number is no duration. It used to become NaN,
      // reach `study_days.seconds_active` through the arithmetic below it, fail
      // the NOT NULL constraint, and take the whole answer down with a 500.
      durationMs: plausibleDuration(body.durationMs),
      // Where the answer was typed, so it lands on the learner's own day.
      tzOffsetMinutes: plausibleOffset(body.tzOffsetMinutes),
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
