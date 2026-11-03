// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LEXICON, VOCABULARY, grammarById, lessonsInOrder, vocabById } from '../../src/content/browser.ts';
import { createReviewItem, type ReviewItem } from '../../src/core/srs/scheduler.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';
import { tr } from '../../src/i18n.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { DashboardPage } from '../../src/ui/pages/DashboardPage.tsx';
import { ReviewPage } from '../../src/ui/pages/ReviewPage.tsx';
import { buildReviewExercises } from '../../src/ui/reviewBuilder.ts';
import { earlyReviewExercises } from '../../src/ui/selectors.ts';
import { stubState } from './playerStub.tsx';

/**
 * What review asks and what it promises, each case a thing a learner met.
 */

function mount(node: ReactElement, overrides: Partial<AppStateValue> = {}, path = '/') {
  return render(
    <AppStateContext.Provider value={stubState(overrides)}>
      <MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>
    </AppStateContext.Provider>,
  );
}

describe('a familiar word in a sentence', () => {
  /*
   * The card asked for the whole example sentence, "recalled", though no
   * lesson shows the examples and they use words not yet taught: "Gute
   * Nacht, schlaf gut!" two lessons in. A learner who knew "Gute Nacht" was
   * marked wrong and the word lapsed.
   */
  const recalled = (refIds: string[]) => {
    const now = new Date('2026-04-01T09:00:00.000Z');
    return refIds.map((refId) => ({ ...createReviewItem({ id: refId, kind: 'vocab', refId, level: 'pre-a1', now }), successCount: 1 }));
  };

  it('shows the sentence and asks only for the word', () => {
    const step = buildReviewExercises(recalled(['v-hallo', 'v-gute-nacht'])).exercises[1]!.steps[0]!;
    expect(step.id).toBe('rv-v-gute-nacht-context-s1');
    expect(step.scaffold).toBe('___, schlaf gut!');
    expect(step.instruction!.en).not.toMatch(/recall/i);
    expect(validateAnswer('Gute Nacht', step.answer, { lexicon: LEXICON }).verdict).toBe('correct');
  });

  /*
   * "Mein ___ ist Teo." wanted "Name" under "Fill the gap with the word you
   * are practising" and a hint reading "the name"; the taught form, "der
   * Name", was refused and the word lapsed.
   */
  it('says when a noun goes in without its article, and does not hint at one', () => {
    const step = buildReviewExercises(recalled(['v-hallo', 'v-der-name'])).exercises[1]!.steps[0]!;
    expect(step.scaffold).toBe('Mein ___ ist Teo.');
    expect(step.instruction!.en).toBe('Type the noun alone, without der, die or das.');
    expect(step.hints.map((hint) => hint.en).join(' ')).not.toMatch(/\bthe\b/);
    expect(validateAnswer('Name', step.answer, { lexicon: LEXICON }).verdict).toBe('correct');
  });

  it('says when a noun goes in with its article', () => {
    const step = buildReviewExercises(recalled(['v-hallo', 'v-das-haus'])).exercises[1]!.steps[0]!;
    expect(step.scaffold).toBe('___ ist groß.');
    expect(step.instruction!.en).toBe('Type the noun with its article.');
    expect(validateAnswer('das Haus', step.answer, { lexicon: LEXICON }).verdict).not.toBe('incorrect');
  });

  it('keeps the plain card when the sentence does not contain the word as written', () => {
    const step = buildReviewExercises(recalled(['v-hallo', 'v-heissen'])).exercises[1]!.steps[0]!;
    expect(step.id).toBe('rv-v-heissen-s1');
    expect(step.answer.accepted).toEqual([vocabById('v-heissen')!.display]);
  });
});

describe('the review page', () => {
  const now = Date.now();
  const due = (refId: string, kind: ReviewItem['kind'], lessonId: string): ReviewItem => ({
    ...createReviewItem({ id: `${kind}:${refId}`, kind, refId, level: 'pre-a1', lessonId, now: new Date(now - 86_400_000) }),
    state: 'known',
    intervalDays: 2,
    successCount: 1,
  });

  /*
   * The round took the first twenty due items, grammar included, and grammar
   * cannot be typed: "20 in this round" over a player counting "1 of 17",
   * with three typable words left for another round.
   */
  it('fills a round with twenty things to type and says so', async () => {
    const words = VOCABULARY.filter((entry) => entry.level === 'pre-a1').slice(0, 22)
      .map((entry, index) => due(entry.id, 'vocab', `lesson-${index % 3}`));
    const grammar = lessonsInOrder().flatMap((lesson) => lesson.grammarIds).filter((id) => grammarById(id)).slice(0, 3)
      .map((id, index) => due(id, 'grammar', `lesson-${index % 3}`));
    const user = userEvent.setup();
    mount(<ReviewPage />, { reviewItems: [...grammar, ...words] }, '/review');
    await user.click(screen.getByRole('button', { name: tr('reviewStart', 'en') }));
    expect(screen.getByText(tr('reviewRoundSize', 'en', { n: 20 }))).toBeInTheDocument();
    expect(document.querySelector('.player__count')!.textContent).toBe(tr('exerciseProgress', 'en', { done: 1, total: 20 }));
  });

  /*
   * A new learner's Today said "Nothing due · Practise early", and the review
   * page it led to promised early practice with only a Course button.
   */
  it('offers early practice only when there is something to practise', () => {
    const fresh = mount(<DashboardPage />, {}, '/');
    expect(fresh.container.querySelector('.today-tile--review')!.textContent).not.toContain(tr('reviewPracticeEarly', 'en'));
    fresh.unmount();
    const empty = mount(<ReviewPage />, {}, '/review');
    expect(screen.getByText(tr('reviewNothingYetBody', 'en'))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: tr('reviewPracticeEarly', 'en') })).toBeNull();
    empty.unmount();

    const later: ReviewItem = {
      ...createReviewItem({ id: 'vocab:v-hallo', kind: 'vocab', refId: 'v-hallo', level: 'pre-a1' }),
      state: 'known', intervalDays: 2, dueAt: new Date(now + 2 * 86_400_000).toISOString(),
    };
    const learnt = mount(<DashboardPage />, { reviewItems: [later] }, '/');
    expect(within(learnt.container.querySelector<HTMLElement>('.today-tile--review')!).getByText(tr('reviewPracticeEarly', 'en'))).toBeInTheDocument();
    learnt.unmount();
    mount(<ReviewPage />, { reviewItems: [later] }, '/review');
    expect(screen.getByRole('button', { name: tr('reviewPracticeEarly', 'en') })).toBeInTheDocument();
  });

  it('builds early practice only as far as it is asked, with the same cards first', () => {
    // Today asks whether there is any on every render; grammar in front
    // cannot be typed and is passed over.
    const ahead = (refId: string, kind: ReviewItem['kind'], days: number): ReviewItem => ({
      ...createReviewItem({ id: `${kind}:${refId}`, kind, refId, level: 'pre-a1' }),
      state: 'known', intervalDays: days, dueAt: new Date(now + days * 86_400_000).toISOString(),
    });
    const grammar = lessonsInOrder()[0]!.sections.find((section) => section.grammarId)?.grammarId ?? 'g-missing';
    const items = [
      ahead(grammar, 'grammar', 1),
      ...VOCABULARY.slice(0, 25).map((entry, index) => ahead(entry.id, 'vocab', index + 2)),
    ];
    const all = earlyReviewExercises(items, new Date(now), 25);
    expect(all).toHaveLength(25);
    expect(earlyReviewExercises(items, new Date(now), 1)).toEqual(all.slice(0, 1));
    expect(earlyReviewExercises(items, new Date(now))).toEqual(all.slice(0, 10));
  });
});
