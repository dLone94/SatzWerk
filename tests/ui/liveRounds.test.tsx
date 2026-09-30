// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { lessonById, vocabById } from '../../src/content/index.ts';
import type { ReviewItem } from '../../src/core/srs/scheduler.ts';
import { tr } from '../../src/i18n.ts';
import type { AttemptPayload, MistakeRecord } from '../../src/services/api/client.ts';
import { AppStateContext } from '../../src/state/AppState.tsx';
import { buildMistakePractice, buildReviewExercises } from '../../src/ui/reviewBuilder.ts';
import { MistakesPage } from '../../src/ui/pages/MistakesPage.tsx';
import { ReviewPage } from '../../src/ui/pages/ReviewPage.tsx';
import { play, stepIdOnScreen, stubState } from './playerStub.tsx';

/**
 * Rounds built from lists that every answer changes.
 *
 * Review builds its round from the due queue, and the mistake bank from the
 * mistakes. Answering moves both: a word answered is no longer due, a wrong
 * answer adds a mistake. The rounds used to follow those lists while they were
 * being played.
 */

// Whole rounds typed key by key: seconds each, more on a busy machine.
vi.setConfig({ testTimeout: 30_000 });

const DAY = 24 * 60 * 60 * 1000;
const vocabIds = lessonById('pre-a1-u1-l2')!.vocabIds.filter((id) => vocabById(id)).slice(0, 6);

function item(refId: string, dueInMs: number): ReviewItem {
  const at = new Date(Date.now() + dueInMs).toISOString();
  return {
    id: `vocab:${refId}`,
    kind: 'vocab',
    refId,
    level: 'pre-a1',
    state: 'learning',
    ease: 2.5,
    intervalDays: 0,
    dueAt: at,
    successCount: 0,
    failureCount: 0,
    lapses: 0,
    learningStep: 0,
    createdAt: new Date(Date.now() - DAY).toISOString(),
  };
}

/** Reviews whose answered items move on, as the server moves them. */
function ReviewHarness({ initial, pushBy }: { initial: ReviewItem[]; pushBy: number }) {
  const [reviewItems, setReviewItems] = useState(initial);
  const value = stubState({
    reviewItems,
    submitAttempt: async (payload: AttemptPayload) => {
      const refs = new Set((payload.reviewTargets ?? []).map((target) => target.refId));
      setReviewItems((items) =>
        items.map((entry) =>
          refs.has(entry.refId) ? { ...entry, dueAt: new Date(new Date(entry.dueAt).getTime() + pushBy).toISOString() } : entry,
        ),
      );
    },
  });
  return (
    <AppStateContext.Provider value={value}>
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>
    </AppStateContext.Provider>
  );
}

const phaseText = () => document.querySelector('.player-header__phase')?.textContent ?? '';

describe('a review round', () => {
  const items = vocabIds.map((id, index) => item(id, -DAY + index * 1000));
  const exercises = buildReviewExercises(items).exercises;

  /*
   * With ten due the counter read "1 of 10", "2 of 9", "3 of 8"… and the round
   * ended "5 of 5" with five still due: each answer took its word out of the
   * queue, the list shifted left and the cursor stepped over the next one.
   */
  it('asks every due word once, and says so at the end', async () => {
    const user = userEvent.setup();
    render(<ReviewHarness initial={items} pushBy={2 * DAY} />);
    await user.click(screen.getByRole('button', { name: tr('reviewStart', 'en') }));
    const headers = new Set<string>();
    const asked = await play(user, exercises, {
      right: () => true,
      done: () => {
        if (phaseText()) headers.add(phaseText());
        return !document.querySelector('.player');
      },
    });

    expect(asked).toHaveLength(items.length);
    expect(new Set(asked).size).toBe(items.length);
    expect([...headers]).toEqual([tr('reviewRoundSize', 'en', { n: items.length })]);
    expect(screen.getByText(tr('exerciseScore', 'en', { correct: items.length, total: items.length }))).toBeInTheDocument();
  });

  /*
   * Practising early sorted the not-yet-due words by due date after every
   * answer, so a word answered moved to the back and the same few came round
   * again while others were never asked.
   */
  it('practises each word once when practising early', async () => {
    const user = userEvent.setup();
    const later = vocabIds.map((id, index) => item(id, DAY + index * 1000));
    render(<ReviewHarness initial={later} pushBy={DAY / 2} />);
    await user.click(screen.getByRole('button', { name: tr('reviewPracticeEarly', 'en') }));
    const asked = await play(user, buildReviewExercises(later).exercises, {
      right: () => true,
      done: () => !document.querySelector('.player'),
    });
    expect(asked).toHaveLength(later.length);
    expect(new Set(asked).size).toBe(later.length);
  });

  it('takes the correction it shows after a wrong answer', async () => {
    const user = userEvent.setup();
    render(<ReviewHarness initial={items} pushBy={2 * DAY} />);
    await user.click(screen.getByRole('button', { name: tr('reviewStart', 'en') }));
    const first = stepIdOnScreen();
    await user.type(screen.getByRole('textbox'), 'völlig falsch{Enter}');
    const shown = document.querySelector('.feedback__retype-target')!.textContent!;
    await user.type(screen.getByRole('textbox'), `${shown}{Enter}`);
    expect(screen.queryByText(tr('exerciseRetypeLocked', 'en'))).toBeNull();
    expect(stepIdOnScreen()).toBe(first);
    expect(screen.getByRole('button', { name: tr('exerciseContinue', 'en') })).toBeInTheDocument();
  });
});

function mistake(id: string, expected: string, given: string): MistakeRecord {
  const at = new Date().toISOString();
  return {
    id,
    category: 'spelling',
    expected,
    lastGiven: given,
    stepId: null,
    lessonId: null,
    occurrences: 1,
    correctedCount: 0,
    firstSeenAt: at,
    lastSeenAt: at,
    resolvedAt: null,
  };
}

/** A mistake bank that grows a row, at the top, with every wrong answer. */
function MistakesHarness({ initial }: { initial: MistakeRecord[] }) {
  const [mistakes, setMistakes] = useState(initial);
  const value = stubState({
    mistakes,
    submitAttempt: async (payload: AttemptPayload) => {
      if (payload.isRetype || payload.verdict === 'correct') return;
      setMistakes((rows) => [mistake(`new-${rows.length}`, 'Das ist ganz neu.', payload.given), ...rows]);
    },
  });
  return (
    <AppStateContext.Provider value={value}>
      <MemoryRouter>
        <MistakesPage />
      </MemoryRouter>
    </AppStateContext.Provider>
  );
}

describe('practising the mistake bank', () => {
  const rows = [
    mistake('m1', 'Ich komme aus Bulgarien.', 'Ich komme von Bulgarien.'),
    mistake('m2', 'Ich wohne in Hamburg.', 'Ich wohne im Hamburg.'),
    mistake('m3', 'Guten Morgen!', 'Gute Morgen!'),
  ];

  /*
   * A wrong answer reloaded the bank, which gained a row at the top, so the
   * card under the retype became a different mistake. Typing the correction
   * on screen was refused every time.
   */
  it('keeps the card, and takes the correction it shows', async () => {
    const user = userEvent.setup();
    render(<MistakesHarness initial={rows} />);
    await user.click(screen.getByRole('button', { name: tr('mistakesPractise', 'en') }));
    const first = stepIdOnScreen();
    await user.type(screen.getByRole('textbox'), 'völlig falsch{Enter}');
    const shown = document.querySelector('.feedback__retype-target')!.textContent!;
    await user.type(screen.getByRole('textbox'), `${shown}{Enter}`);

    expect(screen.queryByText(tr('exerciseRetypeLocked', 'en'))).toBeNull();
    expect(stepIdOnScreen()).toBe(first);

    const asked = await play(user, buildMistakePractice(rows), { right: () => false, done: () => !document.querySelector('.player') });
    expect([first, ...asked]).toEqual(buildMistakePractice(rows).map((exercise) => exercise.steps[0]!.id));
  });
});
