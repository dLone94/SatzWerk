import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { handleRequest } from '../../server/api.ts';
import { openDatabase, SCHEMA_VERSION, type Db } from '../../server/db.ts';
import * as store from '../../server/store.ts';
import { ruleBasedWritingReview, unavailableProvider } from '../../server/ai.ts';

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

    const mistakes = await store.listMistakes(db);
    expect(mistakes).toHaveLength(1);
    expect(mistakes[0]).toMatchObject({ category: 'article', expected: 'eine', occurrences: 1, correctedCount: 0 });
  });

  it('counts a repeated mistake instead of duplicating it', async () => {
    await call('POST', '/api/attempts', wrongAttempt);
    await call('POST', '/api/attempts', wrongAttempt);
    const mistakes = await store.listMistakes(db);
    expect(mistakes).toHaveLength(1);
    expect(mistakes[0]!.occurrences).toBe(2);
  });

  it('separates the original mistake from the successful retyping', async () => {
    await call('POST', '/api/attempts', wrongAttempt);
    await call('POST', '/api/attempts', retypeAttempt);

    const mistakes = await store.listMistakes(db);
    expect(mistakes).toHaveLength(1);
    // The mistake is still on record, and the correction is recorded beside it.
    expect(mistakes[0]!.occurrences).toBe(1);
    expect(mistakes[0]!.correctedCount).toBe(1);

    // The retyping resolves the step but must not repair the first-try record.
    const progress = await store.getLessonProgress(db, 'pre-a1-u1-l2');
    const outcome = progress.practice['u1l2-ex4-s2']!;
    expect(outcome.resolved).toBe(true);
    expect(outcome.firstTryCorrect).toBe(false);
    expect(outcome.attempts).toBe(1);
  });

  it('does not let a retyping reschedule the review item', async () => {
    await call('POST', '/api/attempts', wrongAttempt);
    const afterWrong = (await store.getReviewItem(db, 'vocab:v-die-tochter'))!;
    const response = await call('POST', '/api/attempts', retypeAttempt);
    expect((response.body as { reviewItems: unknown[] }).reviewItems).toHaveLength(0);
    const afterRetype = (await store.getReviewItem(db, 'vocab:v-die-tochter'))!;
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
    const outcome = (await store.getLessonProgress(db, 'pre-a1-u1-l2')).practice['u1l2-ex4-s2']!;
    expect(outcome.firstTryCorrect).toBe(true);
    expect(await store.listMistakes(db)).toHaveLength(0);
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
    const id = (await store.listMistakes(db))[0]!.id;
    await call('POST', `/api/mistakes/${id}/resolve`);
    expect(await store.listMistakes(db)).toHaveLength(0);
    expect(await store.listMistakes(db, true)).toHaveLength(1);
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
    const before = (await store.getReviewItem(db, 'vocab:v-hallo'))!;
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
    const stats = await store.getStats(db);
    // One first attempt, which was wrong.
    expect(stats.accuracy).toBe(0);
    expect(stats.retypedCorrections).toBe(1);
    expect(stats.totalAnswers).toBe(2);
  });

  it('counts a streak only over days with real answers', async () => {
    expect(await store.computeStreak(db)).toBe(0);
    const today = new Date('2026-03-10T12:00:00Z');
    const insert = (day: string) =>
      db.run('INSERT INTO study_days (day, seconds_active, answers, correct) VALUES (?, 60, 3, 2)', day);
    await insert('2026-03-10');
    await insert('2026-03-09');
    await insert('2026-03-08');
    // Gap on the 7th.
    await insert('2026-03-06');
    expect(await store.computeStreak(db, today)).toBe(3);
  });

  it('adds study time without inventing answers', async () => {
    await call('POST', '/api/study', { seconds: 120 });
    const stats = await store.getStats(db);
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
    expect((await store.listCheckpointResults(db))[0]).toMatchObject({ passed: true, accuracy: 0.8 });
  });

  it('stores favourites', async () => {
    await call('POST', '/api/vocabulary/v-hallo/favorite', { favorite: true });
    expect(await store.listFavorites(db)).toEqual(['v-hallo']);
    await call('POST', '/api/vocabulary/v-hallo/favorite', { favorite: false });
    expect(await store.listFavorites(db)).toEqual([]);
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
