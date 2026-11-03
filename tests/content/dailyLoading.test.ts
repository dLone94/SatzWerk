import { afterEach, expect, it, vi } from 'vitest';
import * as full from '../../src/content/index.ts';

const LEVELS = ['pre-a1', 'a1', 'a2', 'b1', 'b2'];
const scenarios = '../../src/content/scenarios/index.ts';
const level = (id: string) => `../../src/content/levels/${id}.ts`;

afterEach(() => {
  vi.doUnmock(scenarios);
  for (const id of LEVELS) vi.doUnmock(level(id));
  vi.resetModules();
});

/*
 * Daily practice waited for the conversations to arrive before it asked for
 * the levels, grammar and words, and only then for the page itself: on a slow
 * phone the first open sat on "Loading…" through three downloads in a row
 * instead of one. Nothing in the levels depends on the conversations.
 */
it('asks for the conversations and the levels together when daily practice opens', async () => {
  vi.resetModules();
  const requested: string[] = [];
  let release!: () => void;
  const conversationsArrive = new Promise<void>((resolve) => { release = resolve; });
  vi.doMock(scenarios, async (importOriginal) => {
    requested.push('scenarios');
    await conversationsArrive;
    return importOriginal();
  });
  for (const id of LEVELS) {
    vi.doMock(level(id), async (importOriginal) => {
      requested.push(id);
      return importOriginal();
    });
  }
  const browser = await import('../../src/content/browser.ts');
  const opening = browser.ensureContent('/daily');
  // Every level is on its way while the conversations are still downloading.
  await vi.waitFor(() => expect(requested).toEqual(expect.arrayContaining(['scenarios', ...LEVELS])));
  release();
  await opening;
  expect(browser.scriptById('sc-bakery-pre-a1')).toEqual(full.SCENARIO_SCRIPTS.find((script) => script.id === 'sc-bakery-pre-a1'));
  for (const id of LEVELS) {
    const lesson = full.allLessons().find((lesson) => lesson.level === id)!;
    expect(browser.lessonById(lesson.id)!.exercises[0]!.steps[0]!.answer).toEqual(lesson.exercises[0]!.steps[0]!.answer);
  }
});
