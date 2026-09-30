// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { checkpointById } from '../../src/content/index.ts';
import type { Checkpoint, TeachingLanguage } from '../../src/content/types.ts';
import { tr } from '../../src/i18n.ts';
import { AppStateContext } from '../../src/state/AppState.tsx';
import { CheckpointPage } from '../../src/ui/pages/CheckpointPage.tsx';
import { stubState } from './playerStub.tsx';

/**
 * A checkpoint states its own rule, not a lesson's.
 */

function mount(id: string, lang: TeachingLanguage = 'en', extra: React.ReactNode = null) {
  render(
    <AppStateContext.Provider value={stubState({}, lang)}>
      <MemoryRouter initialEntries={[`/checkpoint/${id}`]}>
        {extra}
        <Routes>
          <Route path="/checkpoint/:checkpointId" element={<CheckpointPage />} />
        </Routes>
      </MemoryRouter>
    </AppStateContext.Provider>,
  );
}

/** The questions the player will ask, counted the way the player counts them. */
function questions(checkpoint: Checkpoint, lang: TeachingLanguage): number {
  return checkpoint.exercises
    .filter((exercise) => !exercise.only || exercise.only.includes(lang))
    .flatMap((exercise) => exercise.steps)
    .filter((step) => !step.only || step.only.includes(lang)).length;
}

describe('the rule a checkpoint states', () => {
  /*
   * Every checkpoint said "A few questions from this lesson, without hints.
   * One slip is allowed." A checkpoint covers a unit or a level, is marked
   * strictly at its own pass mark, and allows from two to twenty slips, never
   * one: a learner told "one slip" gives up after the second.
   */
  for (const lang of ['en', 'bg'] as const) {
    it(`says how many questions and how many slips (${lang})`, () => {
      const checkpoint = checkpointById('pre-a1-u1-checkpoint')!;
      mount(checkpoint.id, lang);
      const n = questions(checkpoint, lang);
      const slips = n - Math.ceil(checkpoint.passAccuracy * n - 1e-9);
      expect(screen.queryByText(tr('lessonMasteryIntro', lang), { exact: false })).toBeNull();
      const foot = document.querySelector('.card__foot')!.textContent!;
      expect(foot).toContain(tr('checkpointIntroUnit', lang, { n }));
      expect(foot).toContain(tr('checkpointSlips', lang, { n: slips }));
      expect(slips).toBeGreaterThan(1);
    });
  }

  it('calls a level checkpoint a level checkpoint while it runs', async () => {
    const user = userEvent.setup();
    const checkpoint = checkpointById('a1-level-checkpoint')!;
    mount(checkpoint.id);
    expect(document.querySelector('.card__foot')!.textContent).toContain(
      tr('checkpointIntroLevel', 'en', { n: questions(checkpoint, 'en') }),
    );
    await user.click(screen.getByRole('button', { name: tr('lessonStart', 'en') }));
    expect(document.querySelector('.player-header__phase')).toHaveTextContent(tr('levelCheckpoint', 'en'));
  });

  /*
   * Like a lesson, the page kept its state when only the id in the address
   * changed: one checkpoint's result showed on the next.
   */
  it('starts another checkpoint from its own start', async () => {
    const user = userEvent.setup();
    mount('pre-a1-u1-checkpoint', 'en', <Link to="/checkpoint/pre-a1-u2-checkpoint">elsewhere</Link>);
    await user.click(screen.getByRole('button', { name: tr('lessonStart', 'en') }));
    expect(document.querySelector('[data-step-id]')).not.toBeNull();
    await user.click(screen.getByRole('link', { name: 'elsewhere' }));
    expect(document.querySelector('[data-step-id]')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(checkpointById('pre-a1-u2-checkpoint')!.title.en);
  });
});
