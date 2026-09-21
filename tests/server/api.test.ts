import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { attemptTime, handleRequest } from '../../server/api.ts';
import { applyMastery, applyRecoveryRound } from '../../src/core/progress/lesson.ts';
import { openDatabase, SCHEMA_VERSION, type Db } from '../../server/db.ts';
import * as store from '../../server/store.ts';
import { ruleBasedWritingReview, unavailableProvider } from '../../server/ai.ts';

/** Every store call belongs to somebody; in these tests it is the first learner. */
const scopeOf = (db: Db): store.Scope => ({ db, userId: 1 });


let db: Db;

const ctx = () => ({ db, provider: unavailableProvider });

const call = (method: string, path: string, body?: unknown) =>
  handleRequest(ctx(), { method, path, body });

beforeEach(async () => {
  db = await openDatabase({ path: ':memory:' });
});

afterEach(async () => {
  await db.close();
});

/** A typical wrong answer on the "Ich habe eine Tochter." exercise. */
const wrongAttempt = {
  context: 'lesson',
  lessonId: 'pre-a1-u1-l2',
  exerciseId: 'u1l2-ex4',
  stepId: 'u1l2-ex4-s2',
  prompt: 'I have a daughter.',
  expected: 'eine',
  given: 'ein',
  verdict: 'incorrect',
  credit: 0,
  categories: ['article', 'gender'],
  hintsUsed: 0,
  revealed: false,
  isRetype: false,
  resolved: false,
  reviewTargets: [{ refId: 'v-die-tochter', kind: 'vocab', level: 'pre-a1', difficulty: 2 }],
};

const retypeAttempt = { ...wrongAttempt, given: 'eine', verdict: 'correct', credit: 1, isRetype: true, resolved: true };

describe('schema and profile', () => {
  it('migrates to the current schema version', async () => {
    const row = await db.get<{ value: string }>('SELECT value FROM meta WHERE key = ?', 'schema_version');
    expect(Number(row!.value)).toBe(SCHEMA_VERSION);
  });

  it('starts with an English profile that has not been onboarded', async () => {
    const response = await call('GET', '/api/profile');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ teachingLanguage: 'en', onboarded: false, dailyTargetMinutes: 20 });
  });

  it('persists a switch to the Bulgarian teaching path', async () => {
    await call('PUT', '/api/profile', { teachingLanguage: 'bg', onboarded: true, dailyTargetMinutes: 30 });
    const response = await call('GET', '/api/profile');
    expect(response.body).toMatchObject({ teachingLanguage: 'bg', onboarded: true, dailyTargetMinutes: 30 });
  });

  it('rejects an unknown teaching language', async () => {
    const response = await call('PUT', '/api/profile', { teachingLanguage: 'de' });
    expect(response.status).toBe(400);
  });

  it('clamps an absurd daily target instead of storing it', async () => {
    await call('PUT', '/api/profile', { dailyTargetMinutes: 99999 });
    const response = (await call('GET', '/api/profile')).body as { dailyTargetMinutes: number };
    expect(response.dailyTargetMinutes).toBeLessThanOrEqual(180);
  });
});

describe('attempts, mistakes and the retyping distinction', () => {
  it('records a mistake and schedules the review item it touched', async () => {
    const response = await call('POST', '/api/attempts', wrongAttempt);
    expect(response.status).toBe(200);
    const result = response.body as { grade: string; reviewItems: Array<{ id: string; state: string }> };
    expect(result.grade).toBe('again');
    expect(result.reviewItems).toHaveLength(1);
    expect(result.reviewItems[0]!.id).toBe('vocab:v-die-tochter');

    const mistakes = await store.listMistakes(scopeOf(db));
    expect(mistakes).toHaveLength(1);
    expect(mistakes[0]).toMatchObject({ category: 'article', expected: 'eine', occurrences: 1, correctedCount: 0 });
  });

  it('counts a repeated mistake instead of duplicating it', async () => {
    await call('POST', '/api/attempts', wrongAttempt);
    await call('POST', '/api/attempts', wrongAttempt);
    const mistakes = await store.listMistakes(scopeOf(db));
    expect(mistakes).toHaveLength(1);
    expect(mistakes[0]!.occurrences).toBe(2);
  });

  it('separates the original mistake from the successful retyping', async () => {
    await call('POST', '/api/attempts', wrongAttempt);
    await call('POST', '/api/attempts', retypeAttempt);

    const mistakes = await store.listMistakes(scopeOf(db));
    expect(mistakes).toHaveLength(1);
    // The mistake is still on record, and the correction is recorded beside it.
    expect(mistakes[0]!.occurrences).toBe(1);
    expect(mistakes[0]!.correctedCount).toBe(1);

    // The retyping resolves the step but must not repair the first-try record.
    const progress = await store.getLessonProgress(scopeOf(db), 'pre-a1-u1-l2');
    const outcome = progress.practice['u1l2-ex4-s2']!;
    expect(outcome.resolved).toBe(true);
    expect(outcome.firstTryCorrect).toBe(false);
    expect(outcome.attempts).toBe(1);
  });

  it('does not let a retyping reschedule the review item', async () => {
    await call('POST', '/api/attempts', wrongAttempt);
    const afterWrong = (await store.getReviewItem(scopeOf(db), 'vocab:v-die-tochter'))!;
    const response = await call('POST', '/api/attempts', retypeAttempt);
    expect((response.body as { reviewItems: unknown[] }).reviewItems).toHaveLength(0);
    const afterRetype = (await store.getReviewItem(scopeOf(db), 'vocab:v-die-tochter'))!;
    expect(afterRetype.dueAt).toBe(afterWrong.dueAt);
  });

  it('keeps the first-try record when the first try was clean', async () => {
    await call('POST', '/api/attempts', {
      ...wrongAttempt,
      given: 'eine',
      verdict: 'correct',
      credit: 1,
      categories: [],
      resolved: true,
    });
    const outcome = (await store.getLessonProgress(scopeOf(db), 'pre-a1-u1-l2')).practice['u1l2-ex4-s2']!;
    expect(outcome.firstTryCorrect).toBe(true);
    expect(await store.listMistakes(scopeOf(db))).toHaveLength(0);
  });

  it('rejects a malformed attempt', async () => {
    expect((await call('POST', '/api/attempts', { stepId: '' })).status).toBe(400);
    expect((await call('POST', '/api/attempts', { stepId: 'x', verdict: 'maybe' })).status).toBe(400);
    expect(
      (await call('POST', '/api/attempts', { stepId: 'x', verdict: 'correct', credit: 42 })).status,
    ).toBe(400);
  });

  it('resolves a mistake on request', async () => {
    await call('POST', '/api/attempts', wrongAttempt);
    const id = (await store.listMistakes(scopeOf(db)))[0]!.id;
    await call('POST', `/api/mistakes/${id}/resolve`);
    expect(await store.listMistakes(scopeOf(db))).toHaveLength(0);
    expect(await store.listMistakes(scopeOf(db), true)).toHaveLength(1);
  });
});

describe('review queue', () => {
  it('creates items for newly taught material without duplicating them', async () => {
    const targets = [
      { refId: 'v-hallo', kind: 'vocab', level: 'pre-a1', difficulty: 1 },
      { refId: 'v-danke', kind: 'vocab', level: 'pre-a1', difficulty: 1 },
    ];
    const first = (await call('POST', '/api/reviews/ensure', { targets })).body as {
      created: unknown[];
      reviewItems: unknown[];
    };
    expect(first.created).toHaveLength(2);
    const second = (await call('POST', '/api/reviews/ensure', { targets })).body as {
      created: unknown[];
      reviewItems: unknown[];
    };
    expect(second.created).toHaveLength(0);
    expect(second.reviewItems).toHaveLength(2);
  });

  it('grades an item and pushes its due date out', async () => {
    await call('POST', '/api/reviews/ensure', {
      targets: [{ refId: 'v-hallo', kind: 'vocab', level: 'pre-a1' }],
    });
    const before = (await store.getReviewItem(scopeOf(db), 'vocab:v-hallo'))!;
    const response = await call('POST', '/api/reviews/vocab%3Av-hallo/grade', { grade: 'good' });
    expect(response.status).toBe(200);
    const after = response.body as { state: string; dueAt: string };
    expect(after.state).toBe('learning');
    expect(new Date(after.dueAt).getTime()).toBeGreaterThan(new Date(before.dueAt).getTime());
  });

  it('rejects an unknown grade and an unknown item', async () => {
    expect((await call('POST', '/api/reviews/vocab%3Av-hallo/grade', { grade: 'wat' })).status).toBe(400);
    expect((await call('POST', '/api/reviews/vocab%3Anope/grade', { grade: 'good' })).status).toBe(404);
  });
});

describe('lesson progress', () => {
  it('records sections, mastery attempts, recovery rounds and completion', async () => {
    await call('POST', '/api/lessons/pre-a1-u2-l1/sections/u2l1-intro');
    await call('POST', '/api/lessons/pre-a1-u2-l1/sections/u2l1-intro');
    await call('POST', '/api/lessons/pre-a1-u2-l1/sections/u2l1-vocab');
    await call('POST', '/api/lessons/pre-a1-u2-l1/mastery', { accuracy: 0.5, passAccuracy: 0.7 });
    await call('POST', '/api/lessons/pre-a1-u2-l1/recovery');
    const failed = (await call('GET', '/api/lessons/pre-a1-u2-l1')).body as {
      sectionsSeen: string[];
      mastery: { attempts: number; passed: boolean; bestAccuracy: number };
      recoveryRounds: number;
    };
    expect(failed.sectionsSeen).toEqual(['u2l1-intro', 'u2l1-vocab']);
    expect(failed.mastery).toMatchObject({ attempts: 1, passed: false });
    expect(failed.recoveryRounds).toBe(1);

    await call('POST', '/api/lessons/pre-a1-u2-l1/mastery', { accuracy: 0.9, passAccuracy: 0.7 });
    await call('POST', '/api/lessons/pre-a1-u2-l1/complete');
    const passed = (await call('GET', '/api/lessons/pre-a1-u2-l1')).body as {
      mastery: { attempts: number; passed: boolean; bestAccuracy: number };
      completedAt?: string;
    };
    expect(passed.mastery).toMatchObject({ attempts: 2, passed: true });
    expect(passed.mastery.bestAccuracy).toBeCloseTo(0.9);
    expect(passed.completedAt).toBeTruthy();
  });

  it('never un-passes a mastery check that was already passed', async () => {
    await call('POST', '/api/lessons/x/mastery', { accuracy: 1, passAccuracy: 0.7 });
    await call('POST', '/api/lessons/x/mastery', { accuracy: 0.2, passAccuracy: 0.7 });
    const progress = (await call('GET', '/api/lessons/x')).body as { mastery: { passed: boolean } };
    expect(progress.mastery.passed).toBe(true);
  });
});

describe('statistics are derived from real activity', () => {
  it('reports zero rather than an invented figure on a fresh profile', async () => {
    const state = (await call('GET', '/api/state')).body as {
      stats: { totalAnswers: number; accuracy: number; streak: number };
      reviewItems: unknown[];
    };
    expect(state.stats.totalAnswers).toBe(0);
    expect(state.stats.accuracy).toBe(0);
    expect(state.stats.streak).toBe(0);
    expect(state.reviewItems).toEqual([]);
  });

  it('computes accuracy from first attempts only, not from retypings', async () => {
    await call('POST', '/api/attempts', wrongAttempt);
    await call('POST', '/api/attempts', retypeAttempt);
    const stats = await store.getStats(scopeOf(db));
    // One first attempt, which was wrong.
    expect(stats.accuracy).toBe(0);
    expect(stats.retypedCorrections).toBe(1);
    expect(stats.totalAnswers).toBe(2);
  });

  it('counts a streak only over days with real answers', async () => {
    expect(await store.computeStreak(scopeOf(db))).toBe(0);
    const today = new Date('2026-03-10T12:00:00Z');
    const insert = (day: string) =>
      db.run('INSERT INTO study_days (day, seconds_active, answers, correct) VALUES (?, 60, 3, 2)', day);
    await insert('2026-03-10');
    await insert('2026-03-09');
    await insert('2026-03-08');
    // Gap on the 7th.
    await insert('2026-03-06');
    expect(await store.computeStreak(scopeOf(db), today)).toBe(3);
  });

  it('adds study time without inventing answers', async () => {
    await call('POST', '/api/study', { seconds: 120 });
    const stats = await store.getStats(scopeOf(db));
    expect(stats.totalStudySeconds).toBe(120);
    expect(stats.totalAnswers).toBe(0);
  });

  it('records a checkpoint result', async () => {
    const response = await call('POST', '/api/checkpoints', {
      checkpointId: 'pre-a1-u2-checkpoint',
      scope: 'unit',
      targetId: 'pre-a1-u2',
      accuracy: 0.8,
      passed: true,
    });
    expect(response.status).toBe(200);
    expect((await store.listCheckpointResults(scopeOf(db)))[0]).toMatchObject({ passed: true, accuracy: 0.8 });
  });

  /*
   * Replayed scenarios, and the reason this test exists.
   *
   * The first version of the upsert said ON CONFLICT (script_id) against a
   * table keyed on (script_id, user_id). SQLite rejects that at runtime and
   * nowhere else: every unit test passed, and the failure only appeared when a
   * conversation was actually finished in a browser. So a second run is part
   * of the test, not an afterthought — the conflict branch is the half that
   * broke.
   */
  it('records a scenario run, and keeps the best score across replays', async () => {
    const first = await call('POST', '/api/scenario-runs', {
      scriptId: 'sc-bakery-a1',
      turns: 5,
      firstTryCorrect: 5,
    });
    expect(first.status).toBe(200);
    expect((first.body as { scenarioRuns: unknown[] }).scenarioRuns).toHaveLength(1);

    const second = await call('POST', '/api/scenario-runs', {
      scriptId: 'sc-bakery-a1',
      turns: 5,
      firstTryCorrect: 3,
    });
    expect(second.status).toBe(200);

    const runs = await store.listScenarioRuns(scopeOf(db));
    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({
      scriptId: 'sc-bakery-a1',
      runs: 2,
      firstTryCorrect: 3,
      lastAccuracy: 0.6,
      bestAccuracy: 1,
    });
  });

  it('lists scenario runs in a total order, even on a tie', async () => {
    /*
     * Two conversations finished inside the same millisecond tie on
     * last_run_at, and a tie leaves the order up to the database engine.
     * SQLite and Postgres resolve it differently, which is how CI caught it:
     * the same two rows came back in opposite orders. The listing breaks the
     * tie on script_id so both agree, and so the Real Life page does not
     * reshuffle itself.
     */
    const sameInstant = new Date('2026-05-01T09:00:00.000Z');
    await store.recordScenarioRun(scopeOf(db), { scriptId: 'sc-doctor-a2', turns: 4, firstTryCorrect: 3 }, sameInstant);
    await store.recordScenarioRun(scopeOf(db), { scriptId: 'sc-bakery-a1', turns: 5, firstTryCorrect: 5 }, sameInstant);
    await store.recordScenarioRun(
      scopeOf(db),
      { scriptId: 'sc-kita-a2', turns: 4, firstTryCorrect: 4 },
      new Date('2026-05-02T09:00:00.000Z'),
    );

    const runs = await store.listScenarioRuns(scopeOf(db));
    expect(runs.map((run) => run.scriptId)).toEqual([
      // Most recent first …
      'sc-kita-a2',
      // … then the tied pair, in id order.
      'sc-bakery-a1',
      'sc-doctor-a2',
    ]);
  });

  it('refuses a scenario run with no script', async () => {
    const response = await call('POST', '/api/scenario-runs', { turns: 3, firstTryCorrect: 3 });
    expect(response.status).toBe(400);
  });

  it('reports scenario runs in the state the app boots from', async () => {
    await call('POST', '/api/scenario-runs', { scriptId: 'sc-bakery-pre-a1', turns: 4, firstTryCorrect: 4 });
    const state = await call('GET', '/api/state');
    expect((state.body as { scenarioRuns: Array<{ scriptId: string }> }).scenarioRuns[0]?.scriptId).toBe(
      'sc-bakery-pre-a1',
    );
  });

  it('stores favourites', async () => {
    await call('POST', '/api/vocabulary/v-hallo/favorite', { favorite: true });
    expect(await store.listFavorites(scopeOf(db))).toEqual(['v-hallo']);
    await call('POST', '/api/vocabulary/v-hallo/favorite', { favorite: false });
    expect(await store.listFavorites(scopeOf(db))).toEqual([]);
  });
});

describe('durability across a restart', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'satzwerk-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('keeps progress when the process is restarted', async () => {
    const path = join(dir, 'satzwerk.db');

    const first = await openDatabase({ path });
    await handleRequest({ db: first, provider: unavailableProvider }, {
      method: 'PUT',
      path: '/api/profile',
      body: { teachingLanguage: 'bg', onboarded: true },
    });
    await handleRequest({ db: first, provider: unavailableProvider }, {
      method: 'POST',
      path: '/api/attempts',
      body: wrongAttempt,
    });
    await handleRequest({ db: first, provider: unavailableProvider }, {
      method: 'POST',
      path: '/api/lessons/pre-a1-u2-l1/sections/u2l1-intro',
      body: {},
    });
    first.close();

    // A completely new connection, as after `npm start` again.
    const second = await openDatabase({ path });
    const state = (
      await handleRequest({ db: second, provider: unavailableProvider }, { method: 'GET', path: '/api/state' })
    ).body as {
      profile: { teachingLanguage: string; onboarded: boolean };
      mistakes: unknown[];
      reviewItems: unknown[];
      lessons: Array<{ lessonId: string; sectionsSeen: string[] }>;
      stats: { totalAnswers: number };
    };

    expect(state.profile).toMatchObject({ teachingLanguage: 'bg', onboarded: true });
    expect(state.mistakes).toHaveLength(1);
    expect(state.reviewItems).toHaveLength(1);
    expect(state.stats.totalAnswers).toBe(1);
    const lesson = state.lessons.find((l) => l.lessonId === 'pre-a1-u2-l1');
    expect(lesson?.sectionsSeen).toEqual(['u2l1-intro']);
    second.close();
  });
});

describe('the German Coach seam', () => {
  it('reports honestly that no AI provider is connected', async () => {
    const status = (await call('GET', '/api/coach/status')).body as {
      aiAvailable: boolean;
      features: Record<string, string>;
    };
    expect(status.aiAvailable).toBe(false);
    expect(status.features.writingReview).toBe('rule-based');
    expect(status.features.speechEvaluation).toBe('planned');
    // Not 'planned'. Generated practice and conversation are a decision, not a
    // backlog item — every German sentence in this app has been read by a
    // person — and calling them planned would promise something that is not
    // coming.
    expect(status.features.conversation).toBe('not-generated');
    expect(status.features.generatePractice).toBe('not-generated');
  });

  it('returns no fabricated reply for conversation', async () => {
    const turn = (await call('POST', '/api/coach/conversation', { scenarioId: 'sc-bakery' })).body as {
      available: boolean;
      reply?: string;
    };
    expect(turn.available).toBe(false);
    expect(turn.reply).toBeUndefined();
  });

  it('runs real rule-based checks on writing', async () => {
    const response = await call('POST', '/api/coach/writing', {
      text: 'Ich komme von Bulgarien. Ich wohne in hamburg. Heute ich arbeite.',
      language: 'en',
    });
    const evaluation = response.body as ReturnType<typeof ruleBasedWritingReview>;
    expect(evaluation.engine).toBe('rules');
    const categories = evaluation.findings.map((f) => f.category);
    expect(categories).toContain('preposition');
    expect(categories).toContain('word-order');
    expect(evaluation.checksApplied.length).toBeGreaterThan(3);
    expect(evaluation.note.en).toContain('No AI provider');
  });

  it('flags a lowercase noun and suggests the capital', () => {
    const evaluation = ruleBasedWritingReview('Der tisch ist groß.');
    const finding = evaluation.findings.find((f) => f.category === 'capitalization');
    expect(finding?.suggestion).toBe('Tisch');
  });

  it('flags a sentence with no verb', () => {
    const evaluation = ruleBasedWritingReview('Ich Teo.');
    expect(evaluation.findings.map((f) => f.category)).toContain('missing-word');
  });

  it('says which words it could not check instead of guessing', () => {
    const evaluation = ruleBasedWritingReview('Ich wohne in einem grossen zimmer.');
    expect(evaluation.unknownWords.length).toBeGreaterThan(0);
  });

  it('rejects an empty writing submission', async () => {
    expect((await call('POST', '/api/coach/writing', { text: '  ' })).status).toBe(400);
  });

  it('offers no explanation when there is no provider to ask', async () => {
    const response = await call('POST', '/api/coach/explain', {
      expected: 'Ich komme aus Bulgarien.',
      given: 'Ich komme von Bulgarien.',
      categories: ['preposition'],
      language: 'en',
    });
    expect(response.status).toBe(200);
    const body = response.body as { available: boolean; explanation?: string };
    expect(body.available).toBe(false);
    expect(body.explanation).toBeUndefined();
  });

  it('passes the learner’s language and the validator’s verdict to the provider', async () => {
    const seen: unknown[] = [];
    const spy = {
      ...unavailableProvider,
      available: true,
      name: 'spy',
      async explainMistake(input: unknown) {
        seen.push(input);
        return { available: true, explanation: 'because', language: 'bg' as const, generated: true };
      },
    };
    const response = await handleRequest(
      { db, provider: spy },
      {
        method: 'POST',
        path: '/api/coach/explain',
        body: {
          expected: 'Ich sehe den Mann.',
          given: 'Ich sehe der Mann.',
          categories: ['case'],
          language: 'bg',
          level: 'a1',
        },
      },
    );
    expect(response.status).toBe(200);
    expect(seen[0]).toMatchObject({
      expected: 'Ich sehe den Mann.',
      given: 'Ich sehe der Mann.',
      categories: ['case'],
      language: 'bg',
      level: 'a1',
    });
  });

  it('needs both halves of the comparison to explain anything', async () => {
    expect(
      (await call('POST', '/api/coach/explain', { expected: 'x', given: '   ' })).status,
    ).toBe(400);
    expect((await call('POST', '/api/coach/explain', { given: 'x' })).status).toBe(400);
  });
});

describe('routing', () => {
  it('answers health checks', async () => {
    expect((await call('GET', '/api/health')).status).toBe(200);
  });

  it('404s an unknown route', async () => {
    expect((await call('GET', '/api/nope')).status).toBe(404);
    expect((await call('GET', '/not-api')).status).toBe(404);
  });

  it('clears everything on reset', async () => {
    await call('POST', '/api/attempts', wrongAttempt);
    const state = (await call('POST', '/api/reset')).body as { mistakes: unknown[]; reviewItems: unknown[] };
    expect(state.mistakes).toEqual([]);
    expect(state.reviewItems).toEqual([]);
  });
});

describe('an answer that waited for a connection', () => {
  /**
   * The point of sending the time: a lesson done on the U-Bahn on Tuesday
   * evening and delivered on Wednesday morning is Tuesday's work. Without
   * this the streak quietly loses a day, and the dashboard says something
   * that did not happen.
   */
  it('counts for the day it was typed, not the day it arrived', async () => {
    // More than a day back, so the day it was typed is never today whatever
    // the hour this test runs at.
    const typedAt = new Date(Date.now() - 36 * 60 * 60 * 1000);
    const response = await call('POST', '/api/attempts', { ...wrongAttempt, at: typedAt.toISOString() });
    expect(response.status).toBe(200);

    const day = typedAt.toISOString().slice(0, 10);
    const row = await db.get<{ answers: number }>('SELECT answers FROM study_days WHERE day = ?', day);
    expect(Number(row?.answers)).toBe(1);

    // And today has nothing, because nothing was answered today.
    const today = await db.get('SELECT answers FROM study_days WHERE day = ?', new Date().toISOString().slice(0, 10));
    expect(today).toBeUndefined();
  });

  it('is stored with the time it was typed', async () => {
    const typedAt = new Date(Date.now() - 3 * 60 * 60 * 1000);
    await call('POST', '/api/attempts', { ...wrongAttempt, at: typedAt.toISOString() });
    const row = await db.get<{ created_at: string }>('SELECT created_at FROM attempts ORDER BY id DESC LIMIT 1');
    expect(new Date(String(row!.created_at)).toISOString()).toBe(typedAt.toISOString());
  });

  it('still records an answer that carries no time at all', async () => {
    // Every attempt written before this existed, and anything that posts by
    // hand. The server's own clock is the fallback, exactly as before.
    const response = await call('POST', '/api/attempts', wrongAttempt);
    expect(response.status).toBe(200);
    const today = await db.get<{ answers: number }>(
      'SELECT answers FROM study_days WHERE day = ?',
      new Date().toISOString().slice(0, 10),
    );
    expect(Number(today?.answers)).toBe(1);
  });
});

describe('the time an answer claims to have been typed', () => {
  const now = new Date('2026-09-20T20:00:00.000Z');

  it('is used when it is plausible', () => {
    const typed = '2026-09-19T18:30:00.000Z';
    expect(attemptTime(typed, now).toISOString()).toBe(typed);
  });

  it('is ignored when the phone says the answer is from the future', () => {
    // A clock running fast would otherwise park work where nothing shows it.
    expect(attemptTime('2026-09-21T09:00:00.000Z', now)).toBe(now);
    // A couple of minutes of skew is ordinary, and kept.
    expect(attemptTime('2026-09-20T20:01:00.000Z', now).toISOString()).toBe('2026-09-20T20:01:00.000Z');
  });

  it('is ignored when it is older than any queue could be', () => {
    // A phone that booted with a flat battery's clock, not a long tunnel.
    expect(attemptTime('2009-01-01T00:00:00.000Z', now)).toBe(now);
  });

  it('is ignored when it is not a date at all', () => {
    expect(attemptTime('gestern Abend', now)).toBe(now);
    expect(attemptTime(undefined, now)).toBe(now);
    expect(attemptTime(1758398400000, now)).toBe(now);
  });
});

describe('one mastery rule, on both sides', () => {
  /**
   * The browser has to decide "did I pass?" with no database to ask — a lesson
   * finished in a tunnel still shows its result. That decision is a rule, so
   * the rule lives in the pure core and the server applies it before writing.
   *
   * These tests exist to fail if the two ever drift apart, because a rule
   * duplicated in two places is a rule that will disagree with itself.
   */
  it('stores exactly what the shared function computes', async () => {
    const before = await store.getLessonProgress(scopeOf(db), 'pre-a1-u1-l1');

    const response = await call('POST', '/api/lessons/pre-a1-u1-l1/mastery', {
      accuracy: 0.9,
      passAccuracy: 0.8,
    });
    expect(response.status).toBe(200);

    const stored = response.body as { mastery: unknown };
    const expected = applyMastery(before, 0.9, 0.8, new Date().toISOString());
    expect(stored.mastery).toEqual(expected.mastery);
  });

  it('agrees with the shared function over a run that goes worse', async () => {
    await call('POST', '/api/lessons/pre-a1-u1-l1/mastery', { accuracy: 0.9, passAccuracy: 0.8 });
    const middle = await store.getLessonProgress(scopeOf(db), 'pre-a1-u1-l1');

    const response = await call('POST', '/api/lessons/pre-a1-u1-l1/mastery', {
      accuracy: 0.4,
      passAccuracy: 0.8,
    });
    const stored = (response.body as { mastery: unknown }).mastery;
    const expected = applyMastery(middle, 0.4, 0.8, new Date().toISOString()).mastery;

    // Still passed, best accuracy still 0.9, attempts now 2 — on both sides.
    expect(stored).toEqual(expected);
    expect(stored).toMatchObject({ attempts: 2, bestAccuracy: 0.9, passed: true });
  });

  it('agrees about a recovery round and about completing', async () => {
    const before = await store.getLessonProgress(scopeOf(db), 'pre-a1-u1-l2');

    const recovery = await call('POST', '/api/lessons/pre-a1-u1-l2/recovery', {});
    expect((recovery.body as { recoveryRounds: number }).recoveryRounds).toBe(
      applyRecoveryRound(before, new Date().toISOString()).recoveryRounds,
    );

    const first = await call('POST', '/api/lessons/pre-a1-u1-l2/complete', {});
    const completedAt = (first.body as { completedAt?: string }).completedAt;
    expect(completedAt).toBeTruthy();

    // Finishing again does not move the date, on either side.
    const again = await call('POST', '/api/lessons/pre-a1-u1-l2/complete', {});
    expect((again.body as { completedAt?: string }).completedAt).toBe(completedAt);
  });
});

describe('minutes studied without a connection', () => {
  it('count for the day they were spent', async () => {
    const spentAt = new Date(Date.now() - 36 * 60 * 60 * 1000);
    const response = await call('POST', '/api/study', { seconds: 300, at: spentAt.toISOString() });
    expect(response.status).toBe(200);

    const row = await db.get<{ seconds_active: number }>(
      'SELECT seconds_active FROM study_days WHERE day = ?',
      spentAt.toISOString().slice(0, 10),
    );
    expect(Number(row?.seconds_active)).toBe(300);
  });

  it('fall back to the server clock when no time is given', async () => {
    await call('POST', '/api/study', { seconds: 120 });
    const today = await db.get<{ seconds_active: number }>(
      'SELECT seconds_active FROM study_days WHERE day = ?',
      new Date().toISOString().slice(0, 10),
    );
    expect(Number(today?.seconds_active)).toBe(120);
  });
});

describe('numbers a client could plausibly get wrong', () => {
  /**
   * Every one of these used to end in a lost piece of work rather than a
   * corrected one. The API checks `verdict`, `context` and `credit`, and these
   * three slipped through into the database — where two of them hit a NOT NULL
   * constraint, produced a 500, and were read by the browser as "the server
   * refused this", which means dropped and never sent again.
   */
  it('accepts an answer whose duration makes no sense, and banks it', async () => {
    const response = await call('POST', '/api/attempts', { ...wrongAttempt, durationMs: 'soon' });
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect((await store.getStats(scopeOf(db))).totalAnswers).toBe(1);
  });

  it('never lets time studied run backwards', async () => {
    // A negative duration used to be passed straight through, and subtracted
    // from the minutes the learner had actually earned that day.
    await call('POST', '/api/attempts', { ...wrongAttempt, stepId: 'a', durationMs: 60_000 });
    const earned = (await store.getStats(scopeOf(db))).totalStudySeconds;
    await call('POST', '/api/attempts', { ...wrongAttempt, stepId: 'b', durationMs: -5_000 });
    expect((await store.getStats(scopeOf(db))).totalStudySeconds).toBeGreaterThanOrEqual(earned);
  });

  /**
   * A category the app has no name for used to be stored and then counted as a
   * row in the learner's own mistake statistics, labelled with whatever string
   * arrived.
   */
  it('keeps invented categories out of the mistake statistics', async () => {
    const response = await call('POST', '/api/attempts', {
      ...wrongAttempt,
      // The invented ones first, because the primary category is the one that
      // becomes a row in the mistake bank.
      categories: ['verb-form', '<script>alert(1)</script>', 'article'],
    });
    expect(response.status).toBe(200);
    const stats = await store.getStats(scopeOf(db));
    expect(stats.categoryCounts.map((row) => row.category)).toEqual(['article']);
    // And the answer itself is still banked: a label is not worth an answer.
    expect(stats.totalAnswers).toBe(1);
  });

  it('refuses a checkpoint accuracy that is not a number, in words', async () => {
    const response = await call('POST', '/api/checkpoints', {
      checkpointId: 'pre-a1-u1-checkpoint',
      scope: 'unit',
      targetId: 'pre-a1-u1',
      accuracy: 'most',
      passed: true,
    });
    // A 400 the client can read, not a 500 it treats as a refusal after the
    // row has already failed to insert.
    expect(response.status).toBe(400);
    expect(String((response.body as { error: string }).error)).toMatch(/accuracy/);
  });

  it('keeps a checkpoint accuracy inside the range it claims to be a share of', async () => {
    await call('POST', '/api/checkpoints', {
      checkpointId: 'pre-a1-u1-checkpoint',
      scope: 'unit',
      targetId: 'pre-a1-u1',
      accuracy: 7,
      passed: true,
    });
    const [result] = await store.listCheckpointResults(scopeOf(db));
    expect(result!.accuracy).toBe(1);
  });
});

describe('the day an answer belongs to', () => {
  /**
   * Three evenings running, the middle one finished at half past midnight.
   *
   * Every day used to be a UTC day, so that middle round was filed under the
   * evening before and the day it actually happened on held nothing at all.
   * The app then reported a streak of one to somebody who had studied three
   * days in a row — which is precisely the kind of number this app is not
   * allowed to get wrong.
   */
  const BERLIN = 120;

  it('files it under the learner’s own calendar day', async () => {
    for (const [step, at] of [
      ['mon', '2026-09-14T19:00:00Z'],
      ['tue', '2026-09-14T22:30:00Z'],
      ['wed', '2026-09-16T19:00:00Z'],
    ] as const) {
      const response = await call('POST', '/api/attempts', {
        ...wrongAttempt,
        stepId: step,
        at,
        tzOffsetMinutes: BERLIN,
      });
      expect(response.status).toBe(200);
    }

    const days = (await store.listStudyDays(scopeOf(db))).map((day) => day.day).sort();
    expect(days).toEqual(['2026-09-14', '2026-09-15', '2026-09-16']);
    expect(
      await store.computeStreak(scopeOf(db), new Date('2026-09-16T19:00:00Z'), BERLIN),
      'three evenings running is a streak of three',
    ).toBe(3);
  });

  it('falls back to UTC when the browser says nothing', async () => {
    await call('POST', '/api/attempts', { ...wrongAttempt, at: '2026-09-14T22:30:00Z' });
    expect((await store.listStudyDays(scopeOf(db))).map((day) => day.day)).toEqual(['2026-09-14']);
  });

  it('ignores an offset no part of the world has', async () => {
    await call('POST', '/api/attempts', {
      ...wrongAttempt,
      at: '2026-09-14T22:30:00Z',
      tzOffsetMinutes: 60 * 400,
    });
    expect((await store.listStudyDays(scopeOf(db))).map((day) => day.day)).toEqual(['2026-09-14']);
  });

  it('counts minutes studied under the same calendar', async () => {
    await handleRequest(ctx(), {
      method: 'POST',
      path: '/api/study',
      body: { seconds: 300, at: '2026-09-14T22:30:00Z', tzOffsetMinutes: BERLIN },
    });
    expect((await store.listStudyDays(scopeOf(db))).map((day) => day.day)).toEqual(['2026-09-15']);
  });
});

describe('the one request that draws the whole app', () => {
  /**
   * `fullState` is nine independent queries, and its comment said they went
   * out together. They did not: every element of the `Promise.all` array was
   * written `await store.…`, so each one was awaited while the array was being
   * built and the next was not even sent until it came back. Nine sequential
   * round trips, on every page load, to a database on the other side of the
   * Atlantic — invisible locally, where SQLite answers in microseconds.
   *
   * So the test is about time, measured against a database that is slow on
   * purpose. The margin is wide: what is being told apart is "one round trip
   * at a time" from "all of them at once", not one millisecond from two.
   */
  const LATENCY_MS = 20;

  /** A real database with a hosted one's latency bolted on. */
  function slowed(inner: Db): Db {
    const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
    return {
      dialect: inner.dialect,
      all: async (sql, ...params) => (await wait(), inner.all(sql, ...params)),
      get: async (sql, ...params) => (await wait(), inner.get(sql, ...params)),
      run: async (sql, ...params) => (await wait(), inner.run(sql, ...params)),
      exec: (sql) => inner.exec(sql),
      transaction: (body) => inner.transaction(body),
      close: () => inner.close(),
    } as Db;
  }

  it('asks its questions at the same time, not one after another', async () => {
    const { fullState } = await import('../../server/api.ts');
    const scope: store.Scope = { db: slowed(db), userId: 1 };

    // How long the slowest single branch takes, measured rather than assumed:
    // the statistics are several queries deep on their own.
    const oneBranch = Date.now();
    await store.getStats(scope);
    const slowestBranch = Date.now() - oneBranch;

    const started = Date.now();
    const state = await fullState(scope);
    const together = Date.now() - started;

    expect(state.profile.teachingLanguage).toBe('en');
    // Sequentially this is the sum of every branch; together it is the slowest
    // one plus a little. Half the sum is a threshold neither reading can reach
    // from the wrong side.
    expect(
      together,
      `fullState took ${together}ms; its slowest single branch alone takes ${slowestBranch}ms`,
    ).toBeLessThan(slowestBranch + LATENCY_MS * 4);
  }, 30_000);
});
