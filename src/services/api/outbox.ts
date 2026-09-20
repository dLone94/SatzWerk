import { ApiError, type AttemptPayload } from './client.ts';

/**
 * Answers that have not reached the server yet.
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
 * This is deliberately not an offline mode. Nothing here pretends to know what
 * the dashboard would say, and no progress number is invented while the queue
 * is full; the counts simply stay as they were, and the app says out loud how
 * many answers are waiting. What is promised is only this: nothing typed is
 * thrown away.
 */

const KEY = 'satzwerk.outbox.v1';

/**
 * Enough for a very long stretch without signal — a full lesson is well under
 * a hundred answers. The cap exists so a broken server cannot grow the queue
 * until the browser refuses to store anything at all.
 */
export const MAX_QUEUED = 500;

/** Kept so a refusal can be reported; older ones fall off the end. */
const MAX_REJECTED = 20;

export interface QueuedAttempt {
  /** Local, so the same answer is never sent twice from two tabs. */
  id: string;
  payload: AttemptPayload;
}

export interface RejectedAttempt {
  id: string;
  /** What the server said when it refused this one. */
  reason: string;
  at: string;
}

export interface OutboxState {
  queued: QueuedAttempt[];
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
  try {
    const raw = store.getItem(KEY);
    if (raw === null) return durable ? EMPTY : memory;
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

function write(state: OutboxState): void {
  // The in-memory copy is written first and unconditionally, so it is the one
  // the rest of this session reads even if the store below refuses.
  memory = state;
  const store = storage();
  if (!store) return;
  try {
    store.setItem(KEY, JSON.stringify(state));
  } catch {
    // Quota exhausted, or site data blocked. The session carries on against
    // memory; only a reload would lose what is held.
    durable = false;
  }
}

function isQueued(value: unknown): value is QueuedAttempt {
  if (!value || typeof value !== 'object') return false;
  const record = value as Partial<QueuedAttempt>;
  return typeof record.id === 'string' && Boolean(record.payload) && typeof record.payload === 'object';
}

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

export function snapshot(): OutboxState {
  return read();
}

export function queuedCount(): number {
  return read().queued.length;
}

/**
 * Hold an answer. Returns false only when the queue is full, and then the
 * caller must tell the learner — the alternative is dropping the oldest work
 * to make room for the newest, which loses a sentence somebody typed without
 * ever saying so.
 */
export function enqueue(payload: AttemptPayload): boolean {
  const state = read();
  if (state.queued.length >= MAX_QUEUED) return false;
  write({ ...state, queued: [...state.queued, { id: nextId(), payload }] });
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
}

/** Send what is waiting, oldest first. Safe to call when nothing is. */
export async function flush(
  send: (payload: AttemptPayload) => Promise<unknown>,
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

    try {
      await send(item.payload);
      sent += 1;
      drop(id);
    } catch (cause) {
      if (isUnreachable(cause)) {
        // Stop rather than skip. Order is not a nicety: the review schedule is
        // computed from one attempt to the next, so sending Tuesday's answer
        // after Wednesday's would schedule the wrong thing.
        return { sent, rejected, remaining: read().queued.length };
      }
      // A server that refuses an answer — a 400 it will never accept, a 401
      // after sign-out — would wedge every later answer behind it if it were
      // retried forever. So it comes out of the queue, with the reason kept
      // for the app to report. It is never dropped in silence.
      rejected += 1;
      drop(id, cause instanceof Error ? cause.message : String(cause));
    }
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
 * said no". Only the first is worth queueing: a request the server actively
 * rejected will be rejected again in an hour, and holding it would be a promise
 * the app cannot keep.
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
