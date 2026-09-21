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

    expect(outcome).toEqual({ sent: 1, rejected: 0, remaining: 2 });
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
