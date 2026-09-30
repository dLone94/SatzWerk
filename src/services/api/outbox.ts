import type { RecallGrade } from '../../core/srs/scheduler.ts';
import {
  ApiError,
  type AttemptPayload,
  type CheckpointPayload,
  type ScenarioRunPayload,
} from './client.ts';

/**
 * Work that has not reached the server yet.
 *
 * This app is used on a phone: in a queue at the bakery, on the U-Bahn, in a
 * flat whose signal dies at the kitchen table. Until now every answer went
 * straight to the database, and `submitAttempt` threw if it could not — which
 * meant the learner typed a sentence, pressed enter, and nothing happened at
 * all. The answer was gone and the screen was dead.
 *
 * It does not have to be. The validator is client-side: whether the answer was
 * right is already known without asking anybody. What the server does is *bank*
 * it — the attempt row, the streak, the review schedule. So an unreachable
 * server is not a reason to refuse the answer; it is a reason to hold it and
 * send it later.
 *
 * The same is true of the things that happen at the *end* of a lesson — the
 * mastery result, the completion, a finished conversation. Those are rules
 * applied to numbers the browser already has (`applyMastery` and its
 * neighbours in `src/core/progress/lesson.ts`, which the server applies too),
 * not facts only the database could know. So they queue as well, rather than
 * leaving somebody who answered every question in a tunnel with a lesson that
 * never finished.
 *
 * This is deliberately not an offline mode. Nothing here pretends to know what
 * the dashboard would say, and no statistic is invented while the queue is
 * full; the counts simply stay as they were, and the app says out loud what is
 * waiting. What is promised is only this: nothing anybody did is thrown away.
 */

const KEY = 'satzwerk.outbox.v2';

/** The answers-only shape this queue had before it held anything else. */
const KEY_V1 = 'satzwerk.outbox.v1';

/**
 * Enough for a very long stretch without signal — a full lesson is well under
 * a hundred answers. The cap exists so a broken server cannot grow the queue
 * until the browser refuses to store anything at all.
 */
export const MAX_QUEUED = 500;

/** Kept so a refusal can be reported; older ones fall off the end. */
const MAX_REJECTED = 20;

/**
 * Everything the app writes that nobody is waiting on a *value* from.
 *
 * A read is not here and never will be: there is nothing to queue about asking
 * a question. These are the writes, in the order they happened, because that
 * order is the learner's own — the answers, then the result of the check those
 * answers were part of.
 */
export type PendingWrite =
  | { kind: 'attempt'; payload: AttemptPayload }
  /*
   * `gradedAt` is when the learner graded it, which is not when it was sent if
   * it waited for a connection: the review schedule counts from the moment of
   * recall. Optional because grades queued before it existed carry none.
   */
  | { kind: 'reviewGrade'; id: string; grade: RecallGrade; gradedAt?: string }
  | { kind: 'studyTime'; seconds: number; at: string; tzOffsetMinutes?: number }
  | { kind: 'sectionSeen'; lessonId: string; sectionId: string }
  | { kind: 'recovery'; lessonId: string }
  | { kind: 'mastery'; lessonId: string; accuracy: number; passAccuracy: number }
  | { kind: 'complete'; lessonId: string }
  | { kind: 'checkpoint'; payload: CheckpointPayload }
  | { kind: 'scenarioRun'; payload: ScenarioRunPayload };

export interface QueuedWrite {
  /**
   * Made once, when the write happens, and sent with every try as its
   * idempotency key: a request that reached the server but whose answer was
   * lost on the way back is sent again, and the key is how the server can
   * tell the second copy from a new answer.
   */
  id: string;
  write: PendingWrite;
}

export interface RejectedAttempt {
  id: string;
  /** What the server said when it refused this one. */
  reason: string;
  at: string;
}

export interface OutboxState {
  queued: QueuedWrite[];
  rejected: RejectedAttempt[];
}

const EMPTY: OutboxState = { queued: [], rejected: [] };

/**
 * Safari in private mode throws on `localStorage`, and a browser with site data
 * blocked returns nothing. Neither should cost anybody a lesson, so the queue
 * falls back to memory: it no longer survives a reload, which is worse, but it
 * still survives the tunnel, which is the common case.
 */
let memory: OutboxState = EMPTY;
let durable = true;

/** True while answers are being held in memory only — a reload would lose them. */
export function isDurable(): boolean {
  return durable;
}

/**
 * The store, or nothing when the browser will not give us one. Asking costs a
 * try/catch every time rather than once, because a browser can start refusing
 * part-way through — a quota filled by something else, site data cleared in
 * another tab — and a reference cached at startup would hide that.
 */
function storage(): Storage | null {
  try {
    const store = globalThis.localStorage;
    if (!store) {
      durable = false;
      return null;
    }
    return store;
  } catch {
    durable = false;
    return null;
  }
}

function read(): OutboxState {
  const store = storage();
  if (!store) return memory;
  // Once a write to the store has failed, the copy in it is out of date: it
  // lacks whatever was held since. Reading it back made an answer enqueued
  // after a full quota vanish while `enqueue` said it was kept. Memory is the
  // truth until a write to the store succeeds again.
  if (!durable) return memory;
  try {
    const raw = store.getItem(KEY);
    if (raw === null) return durable ? carriedOver(store) : memory;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return EMPTY;
    const record = parsed as Partial<OutboxState>;
    return {
      queued: Array.isArray(record.queued) ? record.queued.filter(isQueued) : [],
      rejected: Array.isArray(record.rejected) ? record.rejected.filter(isRejected) : [],
    };
  } catch {
    durable = false;
    return memory;
  }
}

/**
 * Answers held by the previous, answers-only version of this queue.
 *
 * Upgrading the app must not be a way to lose somebody's work: a phone that
 * went into a tunnel on the old version and came out on the new one still has
 * its answers in the old key, so they are read once, rewritten in the current
 * shape and the old key is dropped.
 */
function carriedOver(store: Storage): OutboxState {
  let raw: string | null = null;
  try {
    raw = store.getItem(KEY_V1);
  } catch {
    return EMPTY;
  }
  if (raw === null) return EMPTY;

  let queued: QueuedWrite[] = [];
  try {
    const parsed = JSON.parse(raw) as { queued?: unknown };
    if (Array.isArray(parsed.queued)) {
      queued = parsed.queued
        .filter((item): item is { id: string; payload: AttemptPayload } => {
          if (!item || typeof item !== 'object') return false;
          const record = item as { id?: unknown; payload?: unknown };
          return typeof record.id === 'string' && Boolean(record.payload);
        })
        .map((item) => ({ id: item.id, write: { kind: 'attempt', payload: item.payload } }));
    }
  } catch {
    return EMPTY;
  }

  const state: OutboxState = { queued, rejected: [] };
  write(state);
  try {
    store.removeItem(KEY_V1);
  } catch {
    // Left behind; it is only read when the current key is absent, and the
    // write above has just created it.
  }
  return state;
}

function write(state: OutboxState): void {
  // The in-memory copy is written first and unconditionally, so it is the one
  // the rest of this session reads even if the store below refuses.
  memory = state;
  const store = storage();
  if (!store) return;
  try {
    store.setItem(KEY, JSON.stringify(state));
    // The store holds everything memory does again, so it can be trusted.
    durable = true;
  } catch {
    // Quota exhausted, or site data blocked. The session carries on against
    // memory; only a reload would lose what is held.
    durable = false;
  }
}

function isQueued(value: unknown): value is QueuedWrite {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<QueuedWrite>;
  if (typeof record.id !== 'string' || !record.write || typeof record.write !== 'object') return false;
  // An unknown kind would be sent nowhere and block everything behind it, so
  // it is not accepted back out of storage at all.
  return WRITE_KINDS.has((record.write as PendingWrite).kind);
}

const WRITE_KINDS = new Set<PendingWrite['kind']>([
  'attempt',
  'reviewGrade',
  'studyTime',
  'sectionSeen',
  'recovery',
  'mastery',
  'complete',
  'checkpoint',
  'scenarioRun',
]);

function isRejected(value: unknown): value is RejectedAttempt {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<RejectedAttempt>;
  return typeof record.id === 'string' && typeof record.reason === 'string';
}

let counter = 0;

function nextId(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
}

/**
 * An id for a write, made before its first send so a direct send and every
 * later retry of it carry the same one. Random rather than counted, because
 * the server keeps them per learner and two phones must not collide.
 */
export function newWriteId(): string {
  try {
    if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  } catch {
    // An insecure context has no randomUUID; the counted id below will do.
  }
  return `${nextId()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function snapshot(): OutboxState {
  return read();
}

export function queuedCount(): number {
  return read().queued.length;
}

/** How many of the waiting writes are answers somebody typed. */
export function answersWaiting(): number {
  return read().queued.filter((item) => item.write.kind === 'attempt').length;
}

/**
 * Hold a write. Returns false only when the queue is full, and then the caller
 * must tell the learner — the alternative is dropping the oldest work to make
 * room for the newest, which loses a sentence somebody typed without ever
 * saying so.
 */
export function enqueue(write_: PendingWrite, id: string = newWriteId()): boolean {
  const state = read();
  if (state.queued.length >= MAX_QUEUED) return false;
  write({ ...state, queued: [...state.queued, { id, write: write_ }] });
  return true;
}

/**
 * Keep an answer the server refused outright — one that was sent directly
 * rather than from the queue. It was never queued, so it cannot be dropped
 * from the queue; it still must not vanish without the app being able to say
 * it happened.
 */
export function recordRefusal(reason: string): void {
  const state = read();
  write({
    ...state,
    rejected: [...state.rejected, { id: nextId(), reason, at: new Date().toISOString() }].slice(
      -MAX_REJECTED,
    ),
  });
}

export function clearRejected(): void {
  write({ ...read(), rejected: [] });
}

/** Only for tests and the "start again" button. */
export function reset(): void {
  memory = EMPTY;
  durable = true;
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(KEY);
  } catch {
    durable = false;
  }
}

export interface FlushOutcome {
  /** How many were accepted by the server in this pass. */
  sent: number;
  /** How many the server refused; they are gone from the queue. */
  rejected: number;
  /** Still waiting — the server went away again, or was never there. */
  remaining: number;
  /**
   * Why the pass stopped early, when it did: the server could not take the
   * write right now, or the session has ended and the learner has to sign in
   * again before anything more can be sent. Absent when every write planned
   * for the pass was dealt with.
   */
  stopped?: 'unreachable' | 'signedOut';
}

/**
 * Send what is waiting, oldest first. Safe to call when nothing is.
 *
 * `send` gets the write's id to pass on as its idempotency key. `onSent` hears
 * about each accepted write after it has left the queue, so whatever it does
 * with the server's answer sees only what is still waiting behind it.
 */
export async function flush(
  send: (write: PendingWrite, id: string) => Promise<unknown>,
  onSent?: (write: PendingWrite, result: unknown) => void,
): Promise<FlushOutcome> {
  return exclusively(() => pass(send, onSent));
}

/**
 * One tab at a time.
 *
 * The `online` event fires in every open tab at once, and each used to read
 * the same queue and send it: two tabs, every answer saved twice. Inside the
 * lock, the second tab re-reads the queue after the first has emptied it and
 * finds nothing to send. A browser without Web Locks (older Safari, the test
 * environment) runs the pass unguarded, as before.
 */
async function exclusively<T>(work: () => Promise<T>): Promise<T> {
  const locks = (globalThis.navigator as Navigator | undefined)?.locks;
  if (!locks || typeof locks.request !== 'function') return work();
  return locks.request('satzwerk.outbox', () => work()) as Promise<T>;
}

async function pass(
  send: (write: PendingWrite, id: string) => Promise<unknown>,
  onSent?: (write: PendingWrite, result: unknown) => void,
): Promise<FlushOutcome> {
  let sent = 0;
  let rejected = 0;

  // One pass sends what was waiting when it began, and no more. An answer
  // typed while the pass is running is left for the next one — otherwise a
  // learner answering steadily on a recovering connection would keep this loop
  // alive indefinitely, and the pass would never report a result.
  const planned = read().queued.map((item) => item.id);

  for (const id of planned) {
    const item = read().queued.find((queued) => queued.id === id);
    // Gone already: another tab, or a flush that overlapped this one.
    if (!item) continue;

    let result: unknown;
    try {
      result = await send(item.write, item.id);
    } catch (cause) {
      if (isRetryable(cause) || needsSignIn(cause)) {
        // Stop rather than skip. Order is not a nicety: the review schedule is
        // computed from one attempt to the next, so sending Tuesday's answer
        // after Wednesday's would schedule the wrong thing. A 401 is held the
        // same way: signing in again is all it takes for the server to accept
        // it, so throwing it away would lose work for an expired cookie.
        return {
          sent,
          rejected,
          remaining: read().queued.length,
          stopped: needsSignIn(cause) ? 'signedOut' : 'unreachable',
        };
      }
      // A server that refuses a write outright — a 400 it will never accept —
      // would wedge every later answer behind it if it were retried forever.
      // So it comes out of the queue, with the reason kept for the app to
      // report. It is never dropped in silence.
      rejected += 1;
      drop(id, cause instanceof Error ? cause.message : String(cause));
      continue;
    }
    sent += 1;
    drop(id);
    onSent?.(item.write, result);
  }

  return { sent, rejected, remaining: read().queued.length };
}

/**
 * Take one answer out of the queue, optionally keeping why it will never be
 * sent. Re-reads first: an answer typed while a request was in flight has been
 * appended, and writing back a copy read before that would erase it.
 */
function drop(id: string, reason?: string): void {
  const state = read();
  write({
    queued: state.queued.filter((item) => item.id !== id),
    rejected:
      reason === undefined
        ? state.rejected
        : [...state.rejected, { id, reason, at: new Date().toISOString() }].slice(-MAX_REJECTED),
  });
}

/**
 * Whether a failure means "the server was not there" rather than "the server
 * said something". This is the question the start screen asks: a tunnel gets
 * the offline screen, anything else an error.
 *
 * `ApiError` uses status 0 for a fetch that never got an answer — a dropped
 * connection or the request timing out. A 502/503/504 is a server that is
 * there but cannot answer right now (a sleeping database, a cold function),
 * which is also worth holding.
 */
export function isUnreachable(cause: unknown): boolean {
  if (cause instanceof ApiError) return cause.status === 0 || cause.status >= 502;
  // A fetch rejection that never reached our own error type — jsdom and some
  // browsers throw a plain TypeError.
  return cause instanceof TypeError;
}

/**
 * Whether a write that failed this way should be held and tried again.
 *
 * Wider than `isUnreachable`: a 500 is the server failing, not the write being
 * wrong. A database connection dropped mid-query, a pool that timed out, a
 * SQLite file locked for a moment — each came back as a 500, and each threw a
 * good answer away as "refused". Only a 4xx is the server saying this write
 * will never be accepted; everything from the server's own side is held.
 * (A 408 or 429 is the server asking to be asked later, so it is held too.)
 */
export function isRetryable(cause: unknown): boolean {
  if (isUnreachable(cause)) return true;
  if (!(cause instanceof ApiError)) return false;
  return cause.status >= 500 || cause.status === 408 || cause.status === 429;
}

/**
 * A 401: the session has ended — thirty days passed, or the password was
 * changed on another device. The write is fine; it needs the learner signed
 * in again, and then it is sent.
 */
export function needsSignIn(cause: unknown): boolean {
  return cause instanceof ApiError && cause.status === 401;
}
