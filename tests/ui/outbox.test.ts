// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, type AttemptPayload } from '../../src/services/api/client.ts';
import * as outbox from '../../src/services/api/outbox.ts';

/**
 * What happens to an answer when the server is not there.
 *
 * The rule under test is one sentence long: nothing typed is thrown away, and
 * nothing is claimed that has not been saved. Everything below is a way of
 * failing that sentence.
 */

function attempt(stepId: string, given: string): outbox.PendingWrite {
  return { kind: 'attempt', payload: payloadFor(stepId, given) };
}

function payloadFor(stepId: string, given: string): AttemptPayload {
  return {
    context: 'lesson',
    lessonId: 'pre-a1-u1-l1',
    stepId,
    expected: given,
    given,
    verdict: 'correct',
    credit: 1,
    categories: [],
    hintsUsed: 0,
    revealed: false,
    isRetype: false,
    resolved: true,
  };
}

/** The German in a queued answer, for asserting order without a type cast. */
function textOf(item: outbox.QueuedWrite): string {
  return item.write.kind === 'attempt' ? item.write.payload.given : item.write.kind;
}

beforeEach(() => {
  outbox.reset();
  window.localStorage.removeItem('satzwerk.outbox.v1');
});

describe('the outbox', () => {
  it('holds an answer and reports how many are waiting', () => {
    expect(outbox.queuedCount()).toBe(0);
    expect(outbox.enqueue(attempt('s1', 'Guten Tag'))).toBe(true);
    expect(outbox.enqueue(attempt('s2', 'Danke'))).toBe(true);
    expect(outbox.queuedCount()).toBe(2);
  });

  it('survives a reload, because a phone closed in a tunnel is the normal case', () => {
    outbox.enqueue(attempt('s1', 'Guten Tag'));
    // What a fresh page load sees: the module state is gone, the store is not.
    const stored = window.localStorage.getItem('satzwerk.outbox.v2');
    expect(stored).toContain('Guten Tag');
    expect(textOf(outbox.snapshot().queued[0]!)).toBe('Guten Tag');
  });

  it('sends what is waiting in the order it was typed', async () => {
    outbox.enqueue(attempt('s1', 'eins'));
    outbox.enqueue(attempt('s2', 'zwei'));
    outbox.enqueue(attempt('s3', 'drei'));

    const seen: string[] = [];
    const outcome = await outbox.flush(async (write) => {
      if (write.kind === 'attempt') seen.push(write.payload.given);
    });

    // Not a detail: the review schedule is computed from one attempt to the
    // next, so out-of-order sending schedules the wrong thing.
    expect(seen).toEqual(['eins', 'zwei', 'drei']);
    expect(outcome).toEqual({ sent: 3, rejected: 0, remaining: 0 });
    expect(outbox.queuedCount()).toBe(0);
  });

  it('stops at the first answer it cannot send, and keeps the rest', async () => {
    outbox.enqueue(attempt('s1', 'eins'));
    outbox.enqueue(attempt('s2', 'zwei'));
    outbox.enqueue(attempt('s3', 'drei'));

    let calls = 0;
    const outcome = await outbox.flush(async () => {
      calls += 1;
      if (calls === 2) throw new ApiError('Could not reach the server', 0);
    });

    expect(outcome).toEqual({ sent: 1, rejected: 0, remaining: 2, stopped: 'unreachable' });
    expect(outbox.snapshot().queued.map(textOf)).toEqual(['zwei', 'drei']);
  });

  it('keeps an answer typed while the queue was being sent', async () => {
    outbox.enqueue(attempt('s1', 'eins'));

    let typedAlready = false;
    const outcome = await outbox.flush(async () => {
      // The learner answers the next step before this request comes back.
      if (typedAlready) return;
      typedAlready = true;
      outbox.enqueue(attempt('s2', 'zwei'));
    });

    // The pass sends what was waiting when it started and reports the new one
    // as still waiting, rather than chasing a queue the learner keeps filling.
    expect(outcome).toEqual({ sent: 1, rejected: 0, remaining: 1 });
    expect(outbox.snapshot().queued.map(textOf)).toEqual(['zwei']);
  });

  it('takes out an answer the server refuses, and says why', async () => {
    outbox.enqueue(attempt('s1', 'eins'));
    outbox.enqueue(attempt('s2', 'zwei'));

    let calls = 0;
    const outcome = await outbox.flush(async () => {
      calls += 1;
      if (calls === 1) throw new ApiError('verdict "verb-form" is not recognised', 400);
    });

    // Retrying a rejection forever would wedge every later answer behind it.
    expect(outcome).toEqual({ sent: 1, rejected: 1, remaining: 0 });
    expect(outbox.queuedCount()).toBe(0);
    // And it is kept, not dropped in silence.
    expect(outbox.snapshot().rejected[0]?.reason).toContain('is not recognised');
  });

  it('refuses to hold more than it can, rather than dropping the oldest', () => {
    for (let index = 0; index < outbox.MAX_QUEUED; index += 1) {
      expect(outbox.enqueue(attempt(`s${index}`, `answer ${index}`))).toBe(true);
    }
    // The caller is told, so it can tell the learner; the earliest work stays.
    expect(outbox.enqueue(attempt('one-too-many', 'zu viel'))).toBe(false);
    expect(textOf(outbox.snapshot().queued[0]!)).toBe('answer 0');
    expect(outbox.queuedCount()).toBe(outbox.MAX_QUEUED);
  });
});

describe('what counts as "the server was not there"', () => {
  it('holds a dropped connection and a timeout', () => {
    expect(outbox.isUnreachable(new ApiError('Could not reach the server', 0))).toBe(true);
    expect(outbox.isUnreachable(new TypeError('Failed to fetch'))).toBe(true);
  });

  it('holds a gateway that cannot answer right now', () => {
    // A sleeping database behind a cold function answers 502/503/504. The
    // answer is good; the moment is bad.
    expect(outbox.isUnreachable(new ApiError('Bad gateway', 502))).toBe(true);
    expect(outbox.isUnreachable(new ApiError('Service unavailable', 503))).toBe(true);
  });

  it('holds a write the server failed on, and drops only what it said no to', () => {
    // A 500 used to count as a refusal. A database connection dropped
    // mid-query, or SQLite locked for a moment, answered 500 — and a good
    // answer was thrown away as "refused", never to reach the database.
    expect(outbox.isRetryable(new ApiError('Connection terminated unexpectedly', 500))).toBe(true);
    expect(outbox.isRetryable(new ApiError('database is locked', 500))).toBe(true);
    expect(outbox.isRetryable(new ApiError('Service unavailable', 503))).toBe(true);
    expect(outbox.isRetryable(new ApiError('Too many requests', 429))).toBe(true);
    expect(outbox.isRetryable(new ApiError('Could not reach the server', 0))).toBe(true);
    // A 4xx is the server saying this write will never be accepted.
    expect(outbox.isRetryable(new ApiError('stepId is required', 400))).toBe(false);
    expect(outbox.isRetryable(new ApiError('No such lesson', 404))).toBe(false);
    expect(outbox.isRetryable(new ApiError('Not signed in', 401))).toBe(false);
  });

  it('does not hold an answer the server actively refused', () => {
    // These would be refused again in an hour. Queueing them would be a
    // promise the app cannot keep.
    expect(outbox.isUnreachable(new ApiError('stepId is required', 400))).toBe(false);
    expect(outbox.isUnreachable(new ApiError('Not signed in', 401))).toBe(false);
    expect(outbox.isUnreachable(new ApiError('Boom', 500))).toBe(false);
  });
});

describe('when the browser will not store anything', () => {
  it('still holds answers, and says they would not survive a reload', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    });

    try {
      outbox.enqueue(attempt('s1', 'eins'));
      expect(outbox.queuedCount()).toBe(1);
      expect(outbox.isDurable()).toBe(false);

      const sent: string[] = [];
      const outcome = await outbox.flush(async (write) => {
        if (write.kind === 'attempt') sent.push(write.payload.given);
      });
      expect(sent).toEqual(['eins']);
      expect(outcome.remaining).toBe(0);
    } finally {
      getItem.mockRestore();
      setItem.mockRestore();
    }
  });
});

describe('finishing a lesson without a connection', () => {
  it('keeps the answers and the result in the order they happened', async () => {
    // What a lesson in a tunnel actually looks like: answers, then the
    // mastery result, then the completion.
    outbox.enqueue(attempt('s1', 'eins'));
    outbox.enqueue(attempt('s2', 'zwei'));
    outbox.enqueue({ kind: 'mastery', lessonId: 'l1', accuracy: 1, passAccuracy: 0.8 });
    outbox.enqueue({ kind: 'complete', lessonId: 'l1' });

    const seen: string[] = [];
    const outcome = await outbox.flush(async (write) => {
      seen.push(write.kind === 'attempt' ? write.payload.given : write.kind);
    });

    // The result must not arrive before the answers it summarises.
    expect(seen).toEqual(['eins', 'zwei', 'mastery', 'complete']);
    expect(outcome).toEqual({ sent: 4, rejected: 0, remaining: 0 });
  });

  it('counts answers apart from everything else', () => {
    outbox.enqueue(attempt('s1', 'eins'));
    outbox.enqueue({ kind: 'mastery', lessonId: 'l1', accuracy: 1, passAccuracy: 0.8 });
    outbox.enqueue({ kind: 'scenarioRun', payload: { scriptId: 'bakery', turns: 4, firstTryCorrect: 3 } });

    // The strip says "1 answer is waiting", not "3 answers".
    expect(outbox.answersWaiting()).toBe(1);
    expect(outbox.queuedCount()).toBe(3);
  });

  it('holds a checkpoint result and a conversation', async () => {
    outbox.enqueue({
      kind: 'checkpoint',
      payload: { checkpointId: 'cp-1', scope: 'unit', targetId: 'u1', accuracy: 0.9, passed: true },
    });
    outbox.enqueue({ kind: 'sectionSeen', lessonId: 'l1', sectionId: 's-intro' });
    outbox.enqueue({ kind: 'recovery', lessonId: 'l1' });

    const kinds: string[] = [];
    await outbox.flush(async (write) => {
      kinds.push(write.kind);
    });
    expect(kinds).toEqual(['checkpoint', 'sectionSeen', 'recovery']);
  });

  it('refuses a write it does not recognise back out of storage', () => {
    // A queue entry from a future version of the app would be sent nowhere
    // and would block everything behind it, so it is not accepted at all.
    outbox.enqueue(attempt('s1', 'eins'));
    const raw = JSON.parse(window.localStorage.getItem('satzwerk.outbox.v2')!) as {
      queued: unknown[];
    };
    raw.queued.push({ id: 'x', write: { kind: 'somethingNew', lessonId: 'l1' } });
    window.localStorage.setItem('satzwerk.outbox.v2', JSON.stringify(raw));

    expect(outbox.queuedCount()).toBe(1);
    expect(textOf(outbox.snapshot().queued[0]!)).toBe('eins');
  });
});

describe('upgrading the app', () => {
  it('carries over answers held by the answers-only queue', async () => {
    // A phone that went into the tunnel on the old version and came out on
    // the new one. Upgrading must not be a way to lose somebody's work.
    window.localStorage.setItem(
      'satzwerk.outbox.v1',
      JSON.stringify({
        queued: [{ id: 'old-1', payload: payloadFor('s1', 'Guten Morgen') }],
        rejected: [],
      }),
    );

    expect(outbox.queuedCount()).toBe(1);
    expect(textOf(outbox.snapshot().queued[0]!)).toBe('Guten Morgen');

    const sent: string[] = [];
    await outbox.flush(async (write) => {
      if (write.kind === 'attempt') sent.push(write.payload.given);
    });
    expect(sent).toEqual(['Guten Morgen']);

    // And the old key is gone, so it cannot be read a second time.
    expect(window.localStorage.getItem('satzwerk.outbox.v1')).toBeNull();
  });

  it('ignores an old entry that is not an answer at all', () => {
    window.localStorage.setItem(
      'satzwerk.outbox.v1',
      JSON.stringify({ queued: [{ id: 'old-1' }, 'nonsense'], rejected: [] }),
    );
    expect(outbox.queuedCount()).toBe(0);
  });
});

describe('the last two writes', () => {
  it('holds a review grade and the minutes studied', async () => {
    outbox.enqueue({ kind: 'reviewGrade', id: 'r-1', grade: 'good' });
    outbox.enqueue({ kind: 'studyTime', seconds: 300, at: new Date().toISOString() });

    expect(outbox.answersWaiting()).toBe(0);
    expect(outbox.queuedCount()).toBe(2);

    const kinds: string[] = [];
    await outbox.flush(async (write) => {
      kinds.push(write.kind);
    });
    expect(kinds).toEqual(['reviewGrade', 'studyTime']);
  });
});

/*
 * A temporary server failure threw the answer away.
 *
 * Any exception on the server becomes a 500, including a Neon connection
 * dropped mid-query and SQLite's "database is locked". The queue treated every
 * 500 as a refusal: the answer came out of the queue as "refused" and never
 * reached the database, although a retry a few seconds later would have
 * worked.
 */
describe('a server error that is the server\'s fault', () => {
  it('keeps the answer and everything behind it for the next try', async () => {
    outbox.enqueue(attempt('s1', 'eins'));
    outbox.enqueue(attempt('s2', 'zwei'));

    const outcome = await outbox.flush(async () => {
      throw new ApiError('Connection terminated unexpectedly', 500);
    });

    expect(outcome).toMatchObject({ sent: 0, rejected: 0, remaining: 2, stopped: 'unreachable' });
    expect(outbox.snapshot().queued.map(textOf)).toEqual(['eins', 'zwei']);
    expect(outbox.snapshot().rejected).toEqual([]);
  });

  // Held with no limit, one write the server always failed on — a real bug in
  // the handler, not a hiccup — blocked every answer behind it for good: the
  // "waiting" count grew until the queue was full, and then answers were lost.
  it('gives up on a write that fails every time, and sends what is behind it', async () => {
    outbox.enqueue(attempt('s1', 'kaputt'));
    outbox.enqueue(attempt('s2', 'zwei'));
    const sent: string[] = [];
    const send = async (write: outbox.PendingWrite) => {
      const given = write.kind === 'attempt' ? write.payload.given : write.kind;
      if (given === 'kaputt') throw new ApiError('Cannot read properties of undefined', 500);
      sent.push(given);
    };

    for (let pass = 1; pass < outbox.MAX_SERVER_ERRORS; pass += 1) {
      expect(await outbox.flush(send)).toMatchObject({ sent: 0, stopped: 'unreachable' });
    }
    expect(outbox.queuedCount()).toBe(2);

    const outcome = await outbox.flush(send);
    expect(outcome).toEqual({ sent: 1, rejected: 1, remaining: 0 });
    expect(sent).toEqual(['zwei']);
    expect(outbox.snapshot().rejected.map((item) => item.reason)).toEqual([
      'Cannot read properties of undefined',
    ]);
  });

  it('holds a server that is away for as long as it takes', async () => {
    outbox.enqueue(attempt('s1', 'eins'));
    for (let pass = 0; pass < outbox.MAX_SERVER_ERRORS * 2; pass += 1) {
      await outbox.flush(async () => {
        throw new ApiError('Service unavailable', 503);
      });
    }
    expect(outbox.queuedCount()).toBe(1);
    expect(outbox.snapshot().rejected).toEqual([]);
  });
});

/*
 * An expired session threw every queued answer away.
 *
 * A session lasts thirty days, and a password change elsewhere ends it early.
 * If anything was waiting at that moment, each item met a 401 on the next
 * flush, was moved to "refused" and was gone for good — and signing in again
 * brought none of it back.
 */
describe('a session that has ended', () => {
  it('keeps the queue whole and says the learner has to sign in', async () => {
    outbox.enqueue(attempt('s1', 'eins'));
    outbox.enqueue(attempt('s2', 'zwei'));
    outbox.enqueue({ kind: 'mastery', lessonId: 'l1', accuracy: 1, passAccuracy: 0.8 });

    const outcome = await outbox.flush(async () => {
      throw new ApiError('Not signed in.', 401);
    });

    expect(outcome).toMatchObject({ sent: 0, rejected: 0, remaining: 3, stopped: 'signedOut' });
    expect(outbox.queuedCount()).toBe(3);
    expect(outbox.snapshot().rejected).toEqual([]);

    // Signed in again: everything goes, in order.
    const sent: string[] = [];
    await outbox.flush(async (write) => {
      sent.push(write.kind === 'attempt' ? write.payload.given : write.kind);
    });
    expect(sent).toEqual(['eins', 'zwei', 'mastery']);
  });
});

/*
 * Each write carries one id for every try, so a resend of a request whose
 * answer was lost can be recognised as the same write.
 */
describe('the key each write is sent with', () => {
  it('is the id it was queued under, the same on every try', async () => {
    outbox.enqueue(attempt('s1', 'eins'), 'write-1');
    const keys: string[] = [];
    await outbox.flush(async (_write, id) => {
      keys.push(id);
      throw new ApiError('Could not reach the server', 0);
    });
    await outbox.flush(async (_write, id) => {
      keys.push(id);
    });
    expect(keys).toEqual(['write-1', 'write-1']);
  });

  it('is made fresh for each write', () => {
    expect(outbox.newWriteId()).not.toBe(outbox.newWriteId());
  });
});

/*
 * A store that starts refusing part-way through.
 *
 * When `setItem` began to throw (a quota filled by something else), the new
 * queue was kept in memory — but the next read preferred the older copy still
 * in the store, so the answer just enqueued vanished although `enqueue` had
 * said it was kept.
 */
describe('when the store fills up part-way through', () => {
  it('still counts and sends what was held after the quota ran out', async () => {
    outbox.enqueue(attempt('s1', 'eins'));
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    });
    try {
      expect(outbox.enqueue(attempt('s2', 'zwei'))).toBe(true);
      expect(outbox.isDurable()).toBe(false);
      expect(outbox.answersWaiting()).toBe(2);

      const sent: string[] = [];
      const send = async (write: outbox.PendingWrite) => {
        if (write.kind === 'attempt') sent.push(write.payload.given);
      };
      expect((await outbox.flush(send)).remaining).toBe(0);
      // And a second pass does not send the stale stored copy again.
      await outbox.flush(send);
      expect(sent).toEqual(['eins', 'zwei']);
    } finally {
      setItem.mockRestore();
    }
  });
});

/*
 * Two tabs, one queue.
 *
 * The \`online\` event fires in every open tab at the same moment. Each tab read
 * the same queue from localStorage and sent it before either had removed
 * anything, so every waiting answer was saved twice.
 */
describe('two tabs sending at once', () => {
  it('sends each write once', async () => {
    // A small stand-in for the browser's Web Locks: one holder at a time.
    let tail: Promise<unknown> = Promise.resolve();
    const locks = {
      request: (_name: string, work: () => Promise<unknown>) => {
        const run = tail.then(work);
        tail = run.catch(() => undefined);
        return run;
      },
    };
    Object.defineProperty(navigator, 'locks', { value: locks, configurable: true });

    try {
      outbox.enqueue(attempt('s1', 'eins'));
      outbox.enqueue(attempt('s2', 'zwei'));

      // A second tab: the same storage, its own copy of the module.
      vi.resetModules();
      const otherTab = (await import('../../src/services/api/outbox.ts')) as typeof outbox;

      const sent: string[] = [];
      const slowly = async (write: outbox.PendingWrite) => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        if (write.kind === 'attempt') sent.push(write.payload.given);
      };
      await Promise.all([outbox.flush(slowly), otherTab.flush(slowly)]);

      expect(sent).toEqual(['eins', 'zwei']);
      expect(outbox.queuedCount()).toBe(0);
    } finally {
      Reflect.deleteProperty(navigator, 'locks');
    }
  });
});
