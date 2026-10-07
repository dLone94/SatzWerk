// @vitest-environment jsdom
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { typeIt } from '../../src/content/authoring.ts';
import type { Exercise } from '../../src/content/types.ts';
import { createReviewItem } from '../../src/core/srs/scheduler.ts';
import type { AttemptPayload } from '../../src/services/api/client.ts';
import * as outbox from '../../src/services/api/outbox.ts';
import { AppStateProvider, useApp, type AppStateValue } from '../../src/state/AppState.tsx';
import { ExercisePlayer } from '../../src/ui/components/ExercisePlayer.tsx';
import type { DailyRun } from '../../src/core/progress/daily.ts';

/**
 * How the app's state and the outbox work together when the server is slow,
 * failing, or has signed the learner out. Each block below is a way work was
 * lost or shown wrongly before.
 */

const bi = (en: string, bg: string) => ({ en, bg });
let savedDailyRows: DailyRun[] = [];

function freshSnapshot() {
  return {
    profile: {
      teachingLanguage: 'en',
      dailyTargetMinutes: 20,
      displayName: null,
      onboarded: true,
      createdAt: new Date().toISOString(),
    },
    lessons: [] as unknown[],
    reviewItems: [
      createReviewItem({
        id: 'rv-1',
        kind: 'grammar',
        refId: 'g-word-order',
        level: 'pre-a1',
        now: new Date('2026-09-01T08:00:00.000Z'),
      }),
    ],
    mistakes: [],
    favorites: [],
    stats: {
      totalAnswers: 0,
      correctAnswers: 0,
      accuracy: 0,
      totalStudySeconds: 0,
      studyDays: 0,
      streak: 0,
      categoryCounts: [],
      retypedCorrections: 0,
    },
    studyDays: [],
    checkpointResults: [],
    scenarioRuns: [],
    dailyRuns: savedDailyRows,
    serverTime: new Date().toISOString(),
  };
}

interface Sent {
  url: string;
  body: Record<string, unknown>;
  key: string | null;
}

/**
 * The server, as each test wants it. `write` decides what happens to every
 * POST; returning undefined means "the normal answer".
 */
let write: (url: string, body: Record<string, unknown>) => Response | Promise<Response | undefined> | undefined;
let signedIn = true;
const sent: Sent[] = [];
const originalFetch = globalThis.fetch;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function lessonBody(lessonId: string) {
  return {
    lessonId,
    sectionsSeen: [],
    practice: {},
    mastery: { attempts: 0, bestAccuracy: 0, passed: false },
    recoveryRounds: 0,
  };
}

function normalAnswer(url: string, body: Record<string, unknown>): Response {
  if (url.endsWith('/api/attempts')) {
    return json({ attemptId: sent.length, reviewItems: [], grade: 'good', stats: freshSnapshot().stats });
  }
  if (url.includes('/api/reviews/')) return json({ ...freshSnapshot().reviewItems[0], state: 'known' });
  if (url.endsWith('/api/study')) return json({ stats: freshSnapshot().stats, studyDays: [] });
  if (url.endsWith('/api/daily-runs')) {
    savedDailyRows = [{ ...body, updatedAt: new Date().toISOString() } as unknown as DailyRun];
    return json({ dailyRuns: savedDailyRows });
  }
  if (url.includes('/api/lessons/')) return json(lessonBody(String(url.split('/')[5])));
  return json(body);
}

beforeEach(() => {
  outbox.reset();
  sent.length = 0;
  savedDailyRows = [];
  signedIn = true;
  write = () => undefined;

  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/api/session')) return json({ required: true, signedIn });
    if (url.endsWith('/api/login')) {
      signedIn = true;
      return json({ required: true, signedIn: true });
    }
    if (url.endsWith('/api/state')) return json(freshSnapshot());
    if (url.endsWith('/api/coach/status')) return json({ aiAvailable: false, provider: 'none', features: {} });
    if (url.endsWith('/api/learners')) {
      return json({ learners: [{ id: 1, name: 'me', createdAt: '2026-09-01' }], studyingAs: 1 });
    }
    if (init?.method === 'POST') {
      const body = JSON.parse(String(init.body ?? '{}')) as Record<string, unknown>;
      const headers = new Headers(init.headers);
      sent.push({ url, body, key: headers.get('Idempotency-Key') });
      if (!signedIn) return json({ error: 'Not signed in.' }, 401);
      return (await write(url, body)) ?? normalAnswer(url, body);
    }
    throw new Error(`unexpected request: ${url}`);
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  outbox.reset();
});

/** Mounts the provider and hands back the live state, re-read on each call. */
async function mountState(): Promise<() => AppStateValue> {
  let latest: AppStateValue | null = null;
  function Probe() {
    const app = useApp();
    latest = app;
    if (!app.ready) return <p>loading</p>;
    return <p>session: {app.session.signedIn ? 'in' : 'out'}</p>;
  }
  render(
    <AppStateProvider>
      <Probe />
    </AppStateProvider>,
  );
  await screen.findByText(/session:/);
  return () => latest!;
}

function answer(stepId: string, extra: Partial<AttemptPayload> = {}): AttemptPayload {
  return {
    context: 'lesson',
    lessonId: 'l1',
    stepId,
    expected: 'Hallo',
    given: 'Hallo',
    verdict: 'correct',
    credit: 1,
    categories: [],
    hintsUsed: 0,
    revealed: false,
    isRetype: false,
    resolved: true,
    ...extra,
  };
}

const attemptsSent = () => sent.filter((item) => item.url.endsWith('/api/attempts'));

describe('adding a learner while work is waiting', () => {
  it('keeps the current learner until their queued answer can be saved', async () => {
    const state = await mountState();
    write = (url) => url.endsWith('/api/attempts') ? json({ error: 'Database unavailable' }, 503) : undefined;
    await act(async () => { await state().submitAttempt(answer('waiting-before-new-learner')); });
    await waitFor(() => expect(outbox.queuedCount()).toBe(1));
    let outcome: string | undefined;
    await act(async () => { outcome = await state().addLearner('Papa'); });
    expect(outcome).toBe('answers-waiting');
    expect(sent.filter(item => item.url.endsWith('/api/learners'))).toHaveLength(0);
    expect(state().studyingAs).toBe(1);
    expect(outbox.queuedCount()).toBe(1);
  });
});

/*
 * An expired session threw queued answers away.
 *
 * A 401 on the next flush moved every waiting answer to "refused", the login
 * screen did not come up, and signing in again sent none of them.
 */
describe('when the session has ended', () => {
  it('keeps the answers, asks for the password, and sends them after signing in', async () => {
    const app = await mountState();
    signedIn = false;

    await act(async () => {
      await app().submitAttempt(answer('s1'));
      await app().submitAttempt(answer('s2'));
    });

    await screen.findByText('session: out');
    expect(outbox.queuedCount()).toBe(2);
    expect(app().sync.refused).toBe(0);

    await act(async () => {
      await app().signIn('secret');
    });
    await waitFor(() => expect(outbox.queuedCount()).toBe(0));
    const delivered = attemptsSent().filter((item) => item.key !== null);
    // Refused while signed out, then delivered once each after signing in.
    expect(delivered.slice(-2).map((item) => item.body.stepId)).toEqual(['s1', 's2']);
    expect(app().sync.refused).toBe(0);
  });

  it('holds a lesson result the server turned away for want of a session', async () => {
    const app = await mountState();
    signedIn = false;
    let progress;
    await act(async () => {
      progress = await app().recordMastery('l1', 1, 0.8);
    });
    // Shown as the rule says, held, and not reported as refused.
    expect(progress!.mastery.passed).toBe(true);
    expect(outbox.queuedCount()).toBe(1);
    expect(app().sync.refused).toBe(0);
    await screen.findByText('session: out');
  });
});

/*
 * A 500 was treated as a refusal: a database hiccup threw the answer away,
 * and a 100% final check came back as "Not passed yet".
 */
describe('when the server fails for a moment', () => {
  it('holds the answer rather than refusing it', async () => {
    const app = await mountState();
    write = (url) => (url.endsWith('/api/attempts') ? json({ error: 'database is locked' }, 500) : undefined);

    await act(async () => {
      await app().submitAttempt(answer('s1'));
    });
    await waitFor(() => expect(app().sync.pending).toBe(1));
    expect(app().sync.refused).toBe(0);

    write = () => undefined;
    await act(async () => {
      await app().syncAnswers();
    });
    expect(outbox.queuedCount()).toBe(0);
  });

  it('shows a passed final check as passed', async () => {
    const app = await mountState();
    write = (url) =>
      url.endsWith('/mastery') ? json({ error: 'Connection terminated unexpectedly' }, 500) : undefined;
    let progress;
    await act(async () => {
      progress = await app().recordMastery('l1', 1, 0.8);
    });
    expect(progress!.mastery.passed).toBe(true);
    expect(outbox.queuedCount()).toBe(1);
  });
});

/*
 * The verdict waited for the server. On a stalled connection the choices
 * stayed disabled and nothing was judged for 30 seconds.
 */
describe('on a connection that does not answer', () => {
  const exercise: Exercise = typeIt('t-origin', bi('Origin', 'Произход'), [
    { id: 't-origin-s1', prompt: bi('I come from Bulgaria.', 'Аз съм от България.'), answer: 'Ich komme aus Bulgarien.' },
  ]);

  it('shows the verdict at once', async () => {
    function Player() {
      const { ready } = useApp();
      if (!ready) return <p>loading</p>;
      return <ExercisePlayer exercises={[exercise]} context="lesson" level="pre-a1" lessonId="l1" onFinish={() => {}} />;
    }
    render(
      <AppStateProvider>
        <Player />
      </AppStateProvider>,
    );
    await screen.findByRole('textbox');
    // A request that never comes back.
    write = (url) => (url.endsWith('/api/attempts') ? new Promise<Response>(() => {}) : undefined);

    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), 'Ich komme aus Bulgarien.');
    await user.keyboard('{Enter}');
    expect(await screen.findByText(/Correct\./, undefined, { timeout: 500 })).toBeInTheDocument();
  });

  it('still sends answers given in quick succession in order', async () => {
    const app = await mountState();
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    write = async (url) => {
      if (url.endsWith('/api/attempts')) await gate;
      return undefined;
    };

    await act(async () => {
      await app().submitAttempt(answer('s1'));
      await app().submitAttempt(answer('s2'));
      await app().submitAttempt(answer('s3'));
    });
    // Only the first is in flight; the others wait behind it.
    expect(attemptsSent().map((item) => item.body.stepId)).toEqual(['s1']);

    await act(async () => {
      release();
    });
    await waitFor(() => expect(outbox.queuedCount()).toBe(0));
    expect(attemptsSent().map((item) => item.body.stepId)).toEqual(['s1', 's2', 's3']);
  });
});

/*
 * A response lost on the way back made the answer be saved twice: the
 * resend looked like a new answer. Each write now carries one key on every
 * try, for the server to recognise a copy it already has.
 */
describe('a write sent again after its answer was lost', () => {
  it('carries the same key both times', async () => {
    const app = await mountState();
    write = (url) => (url.endsWith('/api/attempts') ? Promise.reject(new TypeError('Failed to fetch')) : undefined);
    await act(async () => {
      await app().submitAttempt(answer('s1'));
    });
    await waitFor(() => expect(app().sync.pending).toBe(1));

    write = () => undefined;
    await act(async () => {
      await app().syncAnswers();
    });
    const keys = attemptsSent().map((item) => item.key);
    expect(keys.length).toBeGreaterThanOrEqual(2);
    expect(keys[0]).toBeTruthy();
    expect(new Set(keys).size).toBe(1);
  });

  it('keeps the key of a lesson write that had to wait', async () => {
    const app = await mountState();
    write = (url) => (url.endsWith('/complete') ? Promise.reject(new TypeError('Failed to fetch')) : undefined);
    await act(async () => {
      await app().completeLesson('l1');
    });
    write = () => undefined;
    await act(async () => {
      await app().syncAnswers();
    });
    // At least the failed send and the one that went through; a retry timer
    // firing in between may add another, which must carry the same key too.
    const keys = sent.filter((item) => item.url.endsWith('/complete')).map((item) => item.key);
    expect(keys.length).toBeGreaterThanOrEqual(2);
    expect(keys[0]).toBeTruthy();
    expect(new Set(keys).size).toBe(1);
  });
});

/*
 * Finishing a lesson offline said "Complete every exercise 0 / 9": held
 * answers never reached the lesson's practice record in the browser.
 */
describe('answers held while the server is away', () => {
  it('count towards the lesson straight away', async () => {
    const app = await mountState();
    write = () => Promise.reject(new TypeError('Failed to fetch'));

    await act(async () => {
      await app().submitAttempt(answer('s1'));
      await app().submitAttempt(answer('s2', { verdict: 'incorrect', credit: 0, resolved: false }));
    });

    const progress = app().lessonProgress('l1');
    expect(Object.keys(progress.practice).sort()).toEqual(['s1', 's2']);
    expect(progress.practice.s1!.firstTryCorrect).toBe(true);
    expect(progress.practice.s2!.firstTryCorrect).toBe(false);
  });

  it('close a step on a successful retype without changing its first try', async () => {
    const app = await mountState();
    write = () => Promise.reject(new TypeError('Failed to fetch'));
    await act(async () => {
      await app().submitAttempt(answer('s1', { verdict: 'incorrect', credit: 0, resolved: false }));
      await app().submitAttempt(answer('s1', { isRetype: true, resolved: true }));
    });
    const step = app().lessonProgress('l1').practice.s1!;
    expect(step.resolved).toBe(true);
    expect(step.firstTryCorrect).toBe(false);
    expect(step.attempts).toBe(1);
  });

  it('leave final-check answers out of the practice record', async () => {
    // A final-check question is judged by the mastery result; filed as a
    // practice step, a failed check lowered the first-try score.
    const app = await mountState();
    write = () => Promise.reject(new TypeError('Failed to fetch'));
    await act(async () => {
      await app().submitAttempt(answer('m1', { context: 'mastery', verdict: 'incorrect', credit: 0 }));
    });
    expect(app().lessonProgress('l1').practice).toEqual({});
  });
});

/*
 * A flush that was already running fetched the server's state after it
 * finished, and that state did not have the result just held on the device:
 * "Lesson complete" next to an unticked "Pass the final check".
 */
describe('a flush already running when the lesson ends', () => {
  it('does not take back the result held on the device', async () => {
    const app = await mountState();
    // Study minutes queued when the app was put away, sent on a slow line.
    outbox.enqueue({ kind: 'studyTime', seconds: 60, at: new Date().toISOString() });
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let lessonWritesFail = true;
    write = async (url) => {
      if (url.endsWith('/api/study')) await gate;
      if (lessonWritesFail && url.includes('/api/lessons/')) throw new TypeError('Failed to fetch');
      return undefined;
    };

    let flush: Promise<void> = Promise.resolve();
    await act(async () => {
      flush = app().syncAnswers();
    });
    await act(async () => {
      await app().recordMastery('l1', 1, 0.8);
      await app().completeLesson('l1');
    });
    expect(app().lessonProgress('l1').mastery.passed).toBe(true);

    // The line drops for the lesson writes: the pass stops with them still
    // held, and the state it fetches (which lacks them) must not win.
    await act(async () => {
      release();
      await flush;
    });
    await waitFor(() => expect(sent.some((item) => item.url.endsWith('/mastery'))).toBe(true));
    const progress = app().lessonProgress('l1');
    expect(progress.mastery.passed).toBe(true);
    expect(progress.completedAt).toBeTruthy();
    expect(app().lessons.l1?.mastery.passed).toBe(true);
    lessonWritesFail = false;
  });

  // The state the server sends on opening the app does not have a result that
  // is still waiting on this device; shown as it came, the lesson's final
  // check read as not passed until the held write finally went through.
  it('lays what is still waiting over the state the server sends', async () => {
    outbox.enqueue({ kind: 'mastery', lessonId: 'l1', accuracy: 1, passAccuracy: 0.8 });
    write = (url) => (url.endsWith('/mastery') ? json({ error: 'boom' }, 500) : undefined);
    const app = await mountState();
    await waitFor(() => expect(sent.some((item) => item.url.endsWith('/mastery'))).toBe(true));
    expect(outbox.queuedCount()).toBe(1);
    expect(app().lessons.l1?.mastery.passed).toBe(true);
  });
});

/*
 * A review grade given offline was scheduled from the moment it was sent,
 * hours later, instead of the moment it was given.
 */
describe('a review grade', () => {
  it('carries the time it was given, on the first try and on the retry', async () => {
    const app = await mountState();
    write = (url) => (url.includes('/api/reviews/') ? Promise.reject(new TypeError('Failed to fetch')) : undefined);
    const before = new Date().toISOString();
    await act(async () => {
      await app().gradeReview('rv-1', 'good');
    });
    const held = outbox.snapshot().queued[0]!.write;
    expect(held.kind === 'reviewGrade' && held.gradedAt).toBeTruthy();

    write = () => undefined;
    await act(async () => {
      await app().syncAnswers();
    });
    // The direct send, the retry that went through, and possibly a retry the
    // held grade set off while the line was still down: all the same moment.
    const grades = sent.filter((item) => item.url.includes('/api/reviews/'));
    expect(grades.length).toBeGreaterThanOrEqual(2);
    expect(typeof grades[0]!.body.gradedAt).toBe('string');
    expect(new Set(grades.map((item) => item.body.gradedAt)).size).toBe(1);
    expect(String(grades[0]!.body.gradedAt) >= before).toBe(true);
  });
});

/*
 * Study minutes were counted as answers: one answer typed offline showed as
 * "2 answers are waiting" after a reload.
 */
describe('what the app says is waiting', () => {
  it('does not count study minutes as work', async () => {
    outbox.enqueue({ kind: 'attempt', payload: answer('s1') });
    outbox.enqueue({ kind: 'studyTime', seconds: 120, at: new Date().toISOString() });
    // Nothing can be sent in this test: every write fails.
    write = () => Promise.reject(new TypeError('Failed to fetch'));
    const app = await mountState();
    await waitFor(() => expect(app().sync.pending).toBe(1));
    expect(app().sync.other).toBe(0);
    expect(outbox.queuedCount()).toBe(2);
  });
});

describe('daily practice with a lost connection', () => {
  it('keeps the completed part across a snapshot refresh and retries the same write ID', async () => {
    const app = await mountState();
    write = () => Promise.reject(new TypeError('Failed to fetch'));
    const payload = { id: 'daily-offline', day: '2026-10-07', scriptId: 'sc-bakery-pre-a1', goal: 'everyday' as const,
      stage: 2, total: 4, firstTryCorrect: 3, listeningCompleted: false };
    await act(async () => { await app().recordDailyRun(payload); });
    expect(app().dailyRuns[0]).toMatchObject(payload);
    expect(app().sync.other).toBe(1);
    await act(async () => { await app().reload(); });
    expect(app().dailyRuns[0]).toMatchObject(payload);
    write = () => undefined;
    await act(async () => { await app().syncAnswers(); });
    await waitFor(() => expect(outbox.queuedCount()).toBe(0));
    expect(app().dailyRuns[0]).toMatchObject(payload);
    const copies = sent.filter(item => item.url.endsWith('/api/daily-runs'));
    expect(copies.length).toBeGreaterThanOrEqual(2);
    expect(new Set(copies.map(copy => copy.key)).size).toBe(1);
  });
});
