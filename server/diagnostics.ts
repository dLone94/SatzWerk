import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

const context = new AsyncLocalStorage<{ requestId: string }>();
export const requestId = () => context.getStore()?.requestId;
export const diagnose = (event: string, fields: Record<string, string | number | undefined> = {}) => {
  console.info(JSON.stringify({ component: 'satzwerk', event, requestId: requestId(), ...fields }));
};

/** Deliberately excludes URLs, learner names, answers, headers and errors. */
export async function traceRequest<T>(method: string, work: (id: string) => Promise<T>, status: (result: T) => number): Promise<T> {
  const id = randomUUID();
  const started = performance.now();
  return context.run({ requestId: id }, async () => {
    try {
      const result = await work(id);
      const code = status(result);
      if (code >= 400) diagnose('request_refused', { method, status: code, durationMs: Math.round(performance.now() - started) });
      return result;
    } catch (error) {
      diagnose('request_failed', { method, durationMs: Math.round(performance.now() - started) });
      throw error;
    }
  });
}
