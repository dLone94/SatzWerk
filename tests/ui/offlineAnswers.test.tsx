// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { typeIt } from '../../src/content/authoring.ts';
import { createReviewItem, scheduleReview } from '../../src/core/srs/scheduler.ts';
import type { Exercise } from '../../src/content/types.ts';
import * as outbox from '../../src/services/api/outbox.ts';
import { AppStateProvider, useApp } from '../../src/state/AppState.tsx';
import { ExercisePlayer } from '../../src/ui/components/ExercisePlayer.tsx';
import { SyncBanner } from '../../src/ui/components/SyncBanner.tsx';

/**
 * The tunnel test.
 *
 * This app is used on a phone, and the phone loses signal: in the U-Bahn, in a
 * lift, in a flat whose corner the router does not reach. Before the outbox,
 * `submitAttempt` threw when it could not reach the server, nothing caught it,
 * and the learner sat in front of a screen that had swallowed their answer and
 * did nothing at all.
 *
 * So: the lesson carries on, the answer is kept, the app says how many are
 * waiting, and they go into the database when the connection comes back.
 */

const bi = (en: string, bg: string) => ({ en, bg });

const lesson: Exercise = typeIt('t-origin', bi('Origin', 'Произход'), [
  {
    id: 't-origin-s1',
    prompt: bi('I come from Bulgaria.', 'Аз съм от България.'),
    answer: 'Ich komme aus Bulgarien.',
  },
]);

const snapshot = {
  profile: {
    teachingLanguage: 'en',
    dailyTargetMinutes: 20,
    displayName: null,
    onboarded: true,
    createdAt: new Date().toISOString(),
  },
  lessons: [],
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
  serverTime: new Date().toISOString(),
};

/** Flipped by each test to decide what the server does with an answer. */
let attemptsBehave: 'accept' | 'unreachable' | 'refuse' = 'accept';
const posted: Array<Record<string, unknown>> = [];

const originalFetch = globalThis.fetch;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

beforeEach(() => {
  outbox.reset();
  posted.length = 0;
  attemptsBehave = 'accept';

  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url.endsWith('/api/session')) return json({ required: false, signedIn: true });
    if (url.endsWith('/api/state')) return json(snapshot);
    if (url.endsWith('/api/coach/status')) {
      return json({ aiAvailable: false, provider: 'none', features: {} });
    }
    if (url.endsWith('/api/learners')) {
      return json({ learners: [{ id: 1, name: 'me', createdAt: snapshot.serverTime }], studyingAs: 1 });
    }

    if (url.includes('/api/reviews/')) {
      posted.push({ url, ...(JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>) });
      if (attemptsBehave === 'unreachable') throw new TypeError('Failed to fetch');
      if (attemptsBehave === 'refuse') return json({ error: 'grade is not recognised' }, 400);
      return json({ ...snapshot.reviewItems[0], state: 'known', intervalDays: 3 });
    }

    if (url.includes('/api/lessons/') || url.endsWith('/api/checkpoints')) {
      posted.push({ url, ...(JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>) });
      if (attemptsBehave === 'unreachable') throw new TypeError('Failed to fetch');
      if (attemptsBehave === 'refuse') return json({ error: 'accuracy is required' }, 400);
      if (url.endsWith('/mastery')) {
        return json({
          lessonId: 'l1',
          sectionsSeen: [],
          practice: {},
          mastery: { attempts: 1, bestAccuracy: 1, passed: true },
          recoveryRounds: 0,
        });
      }
      if (url.endsWith('/checkpoints')) return json({ results: [] });
      return json({
        lessonId: 'l1',
        sectionsSeen: [],
        practice: {},
        mastery: { attempts: 0, bestAccuracy: 0, passed: false },
        recoveryRounds: 0,
      });
    }

    if (url.endsWith('/api/attempts')) {
      posted.push(JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>);
      if (attemptsBehave === 'unreachable') throw new TypeError('Failed to fetch');
      if (attemptsBehave === 'refuse') return json({ error: 'verdict is not recognised' }, 400);
      return json({ attemptId: posted.length, reviewItems: [], grade: 'good', stats: snapshot.stats });
    }

    throw new Error(`unexpected request: ${url}`);
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  outbox.reset();
});

function Harness() {
  const { ready } = useApp();
  if (!ready) return <p>loading</p>;
  return (
    <>
      <SyncBanner />
      <ExercisePlayer exercises={[lesson]} context="lesson" level="pre-a1" lessonId="l1" onFinish={() => {}} />
    </>
  );
}

async function mount() {
  render(
    <AppStateProvider>
      <Harness />
    </AppStateProvider>,
  );
  await screen.findByRole('textbox');
}

async function answer(text: string) {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox'), text);
  await user.keyboard('{Enter}');
}

describe('an answer typed while the server is unreachable', () => {
  it('is still marked, and the lesson carries on', async () => {
    await mount();
    attemptsBehave = 'unreachable';
    await answer('Ich komme aus Bulgarien.');

    // The validator lives in the browser, so the verdict never depended on
    // the server. This is the part that used to freeze.
    expect(await screen.findByText(/Correct\./)).toBeInTheDocument();
  });

  it('is kept, and the app says so', async () => {
    await mount();
    attemptsBehave = 'unreachable';
    await answer('Ich komme aus Bulgarien.');

    expect(await screen.findByText('1 answer is waiting')).toBeInTheDocument();
    expect(outbox.queuedCount()).toBe(1);
    // Nothing is claimed about it: the queue is named, not folded into a stat.
    expect(screen.getByText(/reach the database as soon as there is a connection/)).toBeInTheDocument();
  });

  it('reaches the database when the connection comes back', async () => {
    await mount();
    attemptsBehave = 'unreachable';
    await answer('Ich komme aus Bulgarien.');
    await screen.findByText('1 answer is waiting');

    attemptsBehave = 'accept';
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try now' }));

    await waitFor(() => expect(screen.queryByText('1 answer is waiting')).not.toBeInTheDocument());
    expect(outbox.queuedCount()).toBe(0);
    // Sent once while offline (and thrown away by the network), once for real.
    expect(posted.filter((body) => body.given === 'Ich komme aus Bulgarien.').length).toBe(2);
  });

  it('carries the time it was typed rather than the time it was sent', async () => {
    await mount();
    attemptsBehave = 'unreachable';
    const before = new Date().toISOString();
    await answer('Ich komme aus Bulgarien.');
    await screen.findByText('1 answer is waiting');

    attemptsBehave = 'accept';
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try now' }));
    await waitFor(() => expect(outbox.queuedCount()).toBe(0));

    const sent = posted[posted.length - 1];
    expect(typeof sent?.at).toBe('string');
    // Stamped when the answer was given, not when the queue was drained.
    expect(String(sent?.at) >= before).toBe(true);
  });
});

describe('an answer the server refuses outright', () => {
  it('does not freeze the lesson, and is reported rather than retried', async () => {
    await mount();
    attemptsBehave = 'refuse';
    await answer('Ich komme aus Bulgarien.');

    expect(await screen.findByText(/Correct\./)).toBeInTheDocument();
    expect(await screen.findByText(/The server refused 1 answer or result/)).toBeInTheDocument();
    // Not queued: it would be refused again every time it was tried.
    expect(outbox.queuedCount()).toBe(0);
  });
});


/**
 * The end of the lesson, which the answer queue alone did not cover.
 *
 * You could answer every question in a tunnel and have each one held safely —
 * and then the mastery result at the very end went straight to the server,
 * threw, and left the lesson unfinished on a dead screen. The rule that
 * decides "passed" is `applyMastery` in the pure core, which the server
 * applies too, so the browser can answer it without asking.
 */
function MasteryHarness() {
  const { ready, recordMastery, completeLesson, lessonProgress, sync } = useApp();
  const [passed, setPassed] = useState<string>('not asked');

  if (!ready) return <p>loading</p>;
  return (
    <>
      <SyncBanner />
      <p>
        result: <span data-testid="result">{passed}</span>
      </p>
      <p>
        {/* What the requirement list on the real lesson page reads. */}
        recorded: <span data-testid="recorded">{lessonProgress('l1').mastery.passed ? 'passed' : 'not yet'}</span>
      </p>
      <button
        type="button"
        onClick={() => {
          // The real end of a lesson: the result, then the completion, in one
          // tick. The second must not start from the state before the first.
          void recordMastery('l1', 1, 0.8)
            .then((progress) => {
              setPassed(progress.mastery.passed ? 'passed' : 'not yet');
              return completeLesson('l1');
            });
        }}
      >
        finish and complete
      </button>
      <p>
        waiting: <span data-testid="waiting">{`${sync.pending}+${sync.other}`}</span>
      </p>
      <button
        type="button"
        onClick={() => {
          void recordMastery('l1', 1, 0.8).then((progress) =>
            setPassed(progress.mastery.passed ? 'passed' : 'not yet'),
          );
        }}
      >
        finish the check
      </button>
    </>
  );
}

describe('finishing a lesson while the server is unreachable', () => {
  it('still says whether the check was passed, and holds the result', async () => {
    render(
      <AppStateProvider>
        <MasteryHarness />
      </AppStateProvider>,
    );
    await screen.findByRole('button', { name: 'finish the check' });

    attemptsBehave = 'unreachable';
    await userEvent.setup().click(screen.getByRole('button', { name: 'finish the check' }));

    // The verdict the learner sees is the rule applied locally, not a guess.
    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('passed'));
    // No answers waiting, one finished piece of work waiting.
    expect(screen.getByTestId('waiting')).toHaveTextContent('0+1');
    expect(await screen.findByText(/A finished piece of work is waiting too|1 finished piece/)).toBeInTheDocument();
  });

  it('sends the held result when the connection comes back', async () => {
    render(
      <AppStateProvider>
        <MasteryHarness />
      </AppStateProvider>,
    );
    await screen.findByRole('button', { name: 'finish the check' });

    attemptsBehave = 'unreachable';
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'finish the check' }));
    await waitFor(() => expect(outbox.queuedCount()).toBe(1));

    attemptsBehave = 'accept';
    await user.click(screen.getByRole('button', { name: 'Try now' }));

    await waitFor(() => expect(outbox.queuedCount()).toBe(0));
    const mastery = posted.filter((body) => String(body.url ?? '').endsWith('/mastery'));
    expect(mastery.length).toBe(2);
    expect(mastery[mastery.length - 1]).toMatchObject({ accuracy: 1, passAccuracy: 0.8 });
  });

  it('claims nothing when the server refuses the result', async () => {
    render(
      <AppStateProvider>
        <MasteryHarness />
      </AppStateProvider>,
    );
    await screen.findByRole('button', { name: 'finish the check' });

    attemptsBehave = 'refuse';
    await userEvent.setup().click(screen.getByRole('button', { name: 'finish the check' }));

    // A refusal is not a pass: the progress comes back unchanged and the
    // refusal is reported.
    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('not yet'));
    expect(await screen.findByText(/The server refused 1 answer or result/)).toBeInTheDocument();
    expect(outbox.queuedCount()).toBe(0);
  });
});

describe('finishing and completing in the same breath', () => {
  it('does not let the completion undo the result', async () => {
    // The bug this covers was visible on screen and invisible to the tests:
    // the card said "Mastery check passed" while the requirement list under it
    // still showed the check as not done, because the completion had applied
    // its rule to the progress from before the result.
    render(
      <AppStateProvider>
        <MasteryHarness />
      </AppStateProvider>,
    );
    await screen.findByRole('button', { name: 'finish and complete' });

    attemptsBehave = 'unreachable';
    await userEvent.setup().click(screen.getByRole('button', { name: 'finish and complete' }));

    await waitFor(() => expect(screen.getByTestId('result')).toHaveTextContent('passed'));
    await waitFor(() => expect(screen.getByTestId('recorded')).toHaveTextContent('passed'));
    // Both writes are held, in order.
    expect(outbox.queuedCount()).toBe(2);
  });
});

/**
 * Grading a grammar concept from memory, with no connection.
 *
 * This was the quietest of the losses: the button threw, nothing caught it,
 * and the row simply did not move. No error, no held work — the grade was
 * gone and the learner had no way to know.
 */
function GradeHarness() {
  const { ready, gradeReview, reviewItems, sync } = useApp();
  if (!ready) return <p>loading</p>;
  const item = reviewItems[0];
  return (
    <>
      <SyncBanner />
      <p>
        state: <span data-testid="state">{item?.state ?? 'none'}</span>
      </p>
      <p>
        due: <span data-testid="due">{item?.dueAt ?? 'none'}</span>
      </p>
      <p>
        waiting: <span data-testid="waiting">{`${sync.pending}+${sync.other}`}</span>
      </p>
      <button type="button" onClick={() => void gradeReview('rv-1', 'good')}>
        grade it good
      </button>
    </>
  );
}

describe('grading a review while the server is unreachable', () => {
  it('schedules it with the rule both sides share, and holds the grade', async () => {
    render(
      <AppStateProvider>
        <GradeHarness />
      </AppStateProvider>,
    );
    await screen.findByRole('button', { name: 'grade it good' });
    const before = screen.getByTestId('due').textContent;

    attemptsBehave = 'unreachable';
    await userEvent.setup().click(screen.getByRole('button', { name: 'grade it good' }));

    // The scheduler is a pure function the server uses too, so the row moves
    // to where the database will put it.
    const expected = scheduleReview(snapshot.reviewItems[0]!, 'good');
    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent(expected.state));
    expect(screen.getByTestId('due').textContent).not.toBe(before);
    expect(screen.getByTestId('waiting')).toHaveTextContent('0+1');
  });

  it('sends the held grade when the connection comes back', async () => {
    render(
      <AppStateProvider>
        <GradeHarness />
      </AppStateProvider>,
    );
    await screen.findByRole('button', { name: 'grade it good' });

    attemptsBehave = 'unreachable';
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'grade it good' }));
    await waitFor(() => expect(outbox.queuedCount()).toBe(1));

    attemptsBehave = 'accept';
    await user.click(screen.getByRole('button', { name: 'Try now' }));
    await waitFor(() => expect(outbox.queuedCount()).toBe(0));

    const grades = posted.filter((body) => String(body.url ?? '').includes('/api/reviews/'));
    expect(grades.length).toBe(2);
    expect(grades[grades.length - 1]).toMatchObject({ grade: 'good' });
  });
});
