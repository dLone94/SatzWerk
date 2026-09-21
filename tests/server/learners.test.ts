import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { handleRequest, LEARNER_COOKIE } from '../../server/api.ts';
import { openDatabase, type Db } from '../../server/db.ts';
import * as store from '../../server/store.ts';
import { unavailableProvider } from '../../server/ai.ts';

/**
 * A household is not one person.
 *
 * The database was built for one learner and grew a `user_id` column early,
 * against the day a second one arrived. That column turned out to be necessary
 * and not sufficient — the *keys* were still single-learner — so what these
 * tests pin down is the thing that actually matters: two people can use this
 * app without standing in each other's progress.
 */

let db: Db;

const ctx = () => ({ db, provider: unavailableProvider });

/** A request from a browser that is studying as `learner`. */
const as = (learner: number, method: string, path: string, body?: unknown) =>
  handleRequest(ctx(), {
    method,
    path,
    body,
    headers: { cookie: `${LEARNER_COOKIE}=${learner}` },
  });

const answer = (stepId: string, given: string, verdict = 'correct') => ({
  context: 'lesson',
  lessonId: 'pre-a1-u1-l1',
  stepId,
  expected: given,
  given,
  verdict,
  credit: verdict === 'correct' ? 1 : 0,
  categories: verdict === 'correct' ? [] : ['vocabulary'],
  hintsUsed: 0,
  revealed: false,
  isRetype: false,
  resolved: verdict === 'correct',
});

beforeEach(async () => {
  db = await openDatabase({ path: ':memory:' });
});

afterEach(async () => {
  await db.close();
});

describe('who is studying', () => {
  it('starts as the learner the existing progress belongs to', async () => {
    const response = await handleRequest(ctx(), { method: 'GET', path: '/api/learners' });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ studyingAs: 1 });
    expect((response.body as { learners: unknown[] }).learners).toHaveLength(1);
  });

  it('adds somebody, and hands them the app', async () => {
    const response = await handleRequest(ctx(), { method: 'POST', path: '/api/learners', body: { name: 'Papa' } });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ studyingAs: 2 });
    // The cookie is set, because adding a learner is what you do before
    // handing over the phone.
    expect(response.headers?.['set-cookie']).toContain(`${LEARNER_COOKIE}=2`);
  });

  it('refuses a learner with no name, and an unknown one', async () => {
    expect((await handleRequest(ctx(), { method: 'POST', path: '/api/learners', body: { name: '  ' } })).status).toBe(400);
    expect((await handleRequest(ctx(), { method: 'POST', path: '/api/learners/select', body: { id: 99 } })).status).toBe(400);
  });

  it('falls back to the first learner when the cookie is nonsense', async () => {
    // A stale cookie from a learner who was removed, or a hand-edited one.
    const response = await handleRequest(ctx(), {
      method: 'GET',
      path: '/api/learners',
      headers: { cookie: `${LEARNER_COOKIE}=nonsense` },
    });
    expect(response.body).toMatchObject({ studyingAs: 1 });
  });
});

describe('two learners in one database', () => {
  beforeEach(async () => {
    await store.createLearner(db, 'Papa');
  });

  it('keeps answers, streaks and mistakes apart', async () => {
    await as(1, 'POST', '/api/attempts', answer('u1l1-ex1-s1', 'Guten Morgen'));
    await as(1, 'POST', '/api/attempts', answer('u1l1-ex1-s2', 'falsch', 'incorrect'));
    await as(2, 'POST', '/api/attempts', answer('u1l1-ex1-s1', 'Guten Morgen'));

    const mine = (await as(1, 'GET', '/api/state')).body as {
      stats: { totalAnswers: number };
      mistakes: unknown[];
    };
    const theirs = (await as(2, 'GET', '/api/state')).body as {
      stats: { totalAnswers: number };
      mistakes: unknown[];
    };

    expect(mine.stats.totalAnswers).toBe(2);
    expect(theirs.stats.totalAnswers).toBe(1);
    expect(mine.mistakes).toHaveLength(1);
    expect(theirs.mistakes).toHaveLength(0);
  });

  it('lets both work on the same lesson at once', async () => {
    // The thing the old primary keys made impossible: one row per lesson, so
    // the second learner's first answer would have collided with the first's.
    await as(1, 'POST', '/api/lessons/pre-a1-u1-l1/mastery', { accuracy: 1, passAccuracy: 0.67 });
    await as(2, 'POST', '/api/lessons/pre-a1-u1-l1/mastery', { accuracy: 0, passAccuracy: 0.67 });

    const mine = await store.getLessonProgress({ db, userId: 1 }, 'pre-a1-u1-l1');
    const theirs = await store.getLessonProgress({ db, userId: 2 }, 'pre-a1-u1-l1');
    expect(mine.mastery.passed).toBe(true);
    expect(theirs.mastery.passed).toBe(false);
  });

  it('gives each of them their own teaching path', async () => {
    // The whole point for this household: German through English for one
    // person and through Bulgarian for another, at the same time.
    await as(1, 'PUT', '/api/profile', { teachingLanguage: 'en' });
    await as(2, 'PUT', '/api/profile', { teachingLanguage: 'bg' });

    expect((await as(1, 'GET', '/api/profile')).body).toMatchObject({ teachingLanguage: 'en' });
    expect((await as(2, 'GET', '/api/profile')).body).toMatchObject({ teachingLanguage: 'bg' });
  });

  it('keeps review schedules and favourites apart', async () => {
    await as(1, 'POST', '/api/reviews/ensure', {
      targets: [{ refId: 'v-der-tisch', kind: 'vocab', level: 'pre-a1' }],
    });
    await as(1, 'POST', '/api/vocabulary/v-der-tisch/favorite', { favorite: true });

    expect((await as(1, 'GET', '/api/reviews')).body).toHaveLength(1);
    expect((await as(2, 'GET', '/api/reviews')).body).toHaveLength(0);
    expect((await as(1, 'GET', '/api/state')).body).toMatchObject({ favorites: ['v-der-tisch'] });
    expect((await as(2, 'GET', '/api/state')).body).toMatchObject({ favorites: [] });
  });

  it('starts one of them again without touching the other', async () => {
    await as(1, 'POST', '/api/attempts', answer('u1l1-ex1-s1', 'Guten Morgen'));
    await as(2, 'POST', '/api/attempts', answer('u1l1-ex1-s1', 'Guten Morgen'));

    await as(2, 'POST', '/api/reset');

    expect(((await as(1, 'GET', '/api/state')).body as { stats: { totalAnswers: number } }).stats.totalAnswers).toBe(1);
    expect(((await as(2, 'GET', '/api/state')).body as { stats: { totalAnswers: number } }).stats.totalAnswers).toBe(0);
    // And the learner is still here: it was their progress that went, not them.
    expect(await store.listLearners(db)).toHaveLength(2);
  });
});

describe('no query may forget whose row it is', () => {
  /**
   * A derived guard rather than a list.
   *
   * The refactor that scoped these queries touched forty-odd statements, and
   * the failure mode of missing one is not a crash — it is one learner quietly
   * reading another's progress. So the source is scanned: every statement that
   * names a per-learner table has to mention `user_id`, and a statement added
   * later is covered the day it is written.
   */
  const scopedTables = [
    'profile',
    'lesson_state',
    'step_outcomes',
    'review_items',
    'attempts',
    'mistakes',
    'study_days',
    'checkpoint_results',
    'word_flags',
    'scenario_runs',
  ];

  function statementsIn(file: string): string[] {
    const source = readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8');
    // Every SQL string in the file, backticked or quoted.
    return [...source.matchAll(/`([^`]*)`|'([^']*)'/g)]
      .map((match) => match[1] ?? match[2] ?? '')
      .filter((text) => /\b(SELECT|INSERT INTO|UPDATE|DELETE FROM)\b/i.test(text));
  }

  // The minimum is there so a scanner that quietly matches nothing fails
  // rather than passing: store.ts holds most of the SQL, push.ts a handful.
  for (const [file, atLeast] of [
    ['../../server/store.ts', 25],
    ['../../server/push.ts', 3],
  ] as const) {
    it(`scopes every learner query in ${file.split('/').pop()}`, () => {
      const statements = statementsIn(file);
      expect(statements.length).toBeGreaterThanOrEqual(atLeast);

      for (const statement of statements) {
        const table = scopedTables.find((name) => new RegExp(`\\b${name}\\b`).test(statement));
        if (!table) continue;
        expect(statement.includes('user_id'), `${table}: ${statement.replace(/\s+/g, ' ').slice(0, 90)}`).toBe(true);
      }
    });
  }
});
