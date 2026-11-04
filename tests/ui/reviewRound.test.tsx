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
import { CATCH_UP_SIZE, catchUpExercises, earlyReviewExercises } from '../../src/ui/selectors.ts';
import { play, stepIdOnScreen, stubState } from './playerStub.tsx';

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

/*
 * Due grammar was a card with the rule written out beside Again, Hard, Good
 * and Easy: graded with the answer in view and nothing attempted. It is asked
 * now, as one of the course's own steps, and the rule follows the answer.
 */
describe('grammar in review', () => {
  const at = new Date('2026-04-01T09:00:00.000Z');
  const dueGrammar = (refId: string, reviews = 1): ReviewItem => ({
    ...createReviewItem({ id: `grammar:${refId}`, kind: 'grammar', refId, level: 'a1', now: at }),
    state: 'learning',
    intervalDays: 2,
    learningStep: 2,
    successCount: reviews,
  });

  it('is asked as an authored step that practises it, and schedules only the concept', () => {
    const { exercises, conceptItems } = buildReviewExercises([dueGrammar('g-accusative')], 'en');
    expect(conceptItems).toEqual([]);
    expect(exercises).toHaveLength(1);
    const card = exercises[0]!;
    expect(['type', 'fillBlank', 'partialRecall', 'articleRecall', 'conjugation']).toContain(card.kind);
    const step = card.steps[0]!;
    expect(step.answer.accepted.length).toBeGreaterThan(0);
    expect(step.reviewTargets).toEqual(['g-accusative']);
    // The authored id stays, so a slip is filed against the real question.
    expect(step.id.startsWith('rv-')).toBe(false);
    expect(card.reminder).toEqual({ title: grammarById('g-accusative')!.title, body: grammarById('g-accusative')!.summary });
  });

  it('asks a different step at the next review', () => {
    const first = buildReviewExercises([dueGrammar('g-accusative', 1)], 'en').exercises[0]!.steps[0]!.id;
    const next = buildReviewExercises([dueGrammar('g-accusative', 2)], 'en').exercises[0]!.steps[0]!.id;
    expect(next).not.toBe(first);
  });

  it('never asks the same step twice in one round', () => {
    const ids = buildReviewExercises([dueGrammar('g-accusative'), dueGrammar('g-possessives')], 'en')
      .exercises.map((card) => card.steps[0]!.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('falls back to the old card only for a concept the course never asks for', () => {
    const silent = lessonsInOrder()[0]!.grammarIds.find((id) => grammarById(id)) ?? 'g-noun-capitals';
    const { exercises, conceptItems } = buildReviewExercises([dueGrammar(silent)], 'en');
    expect(exercises).toEqual([]);
    expect(conceptItems.map((item) => item.refId)).toEqual([silent]);
  });

  it.each(['en', 'bg'] as const)('hides the rule until the answer is in, in %s', async (lang) => {
    const items = [{ ...dueGrammar('g-accusative'), dueAt: new Date(Date.now() - 86_400_000).toISOString() }];
    const step = buildReviewExercises(items, lang).exercises[0]!.steps[0]!;
    const concept = grammarById('g-accusative')!;
    const attempts: unknown[] = [];
    const user = userEvent.setup();
    const state = stubState({
      reviewItems: items,
      submitAttempt: async (payload) => {
        attempts.push(payload);
        return undefined;
      },
    }, lang);
    render(
      <AppStateContext.Provider value={state}>
        <MemoryRouter initialEntries={['/review']}>
          <ReviewPage />
        </MemoryRouter>
      </AppStateContext.Provider>,
    );
    // No self-grading, and no rule in view before anything is typed.
    expect(screen.queryByRole('button', { name: tr('reviewGradeEasy', lang) })).toBeNull();
    await user.click(screen.getByRole('button', { name: tr('reviewStart', lang) }));
    expect(document.querySelector(`[data-step-id="${step.id}"]`)).not.toBeNull();
    expect(screen.queryByText(concept.summary[lang])).toBeNull();

    // Enter on an empty field opens the feedback panel ("Try first") but
    // leaves the question open, and the rule there would be the answer.
    await user.type(screen.getByRole('textbox'), '{Enter}');
    expect(document.querySelector('.feedback')).not.toBeNull();
    expect(screen.queryByText(concept.summary[lang])).toBeNull();
    expect(attempts).toHaveLength(0);

    await user.type(screen.getByRole('textbox'), `${step.answer.accepted[0]}{Enter}`);
    expect(await screen.findByText(concept.summary[lang])).toBeInTheDocument();
    // Focus moves to Continue, and Continue is described by the rule too, so
    // a screen reader hears why the card was there.
    const reminder = screen.getByText(concept.summary[lang]).closest('.feedback__reminder')!;
    const described = screen.getByRole('button', { name: tr('exerciseContinue', lang) }).getAttribute('aria-describedby') ?? '';
    expect(described.split(' ')).toContain(reminder.id);
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({ context: 'review', stepId: step.id });
    expect((attempts[0] as { reviewTargets: Array<{ refId: string; kind: string }> }).reviewTargets)
      .toEqual([expect.objectContaining({ refId: 'g-accusative', kind: 'grammar' })]);
  });
});

/*
 * The warm-up Today offers after a break: the items most at risk, a dozen at
 * most, started as the page opens, and then back to the day, with the rest of
 * the pile left for the days after rather than pressed as the next thing.
 */
describe.each(['en', 'bg'] as const)('the warm-up after a break, in %s', (lang) => {
  const back = (index: number, state: ReviewItem['state']): ReviewItem => ({
    ...createReviewItem({ id: `vocab:${VOCABULARY[index]!.id}`, kind: 'vocab', refId: VOCABULARY[index]!.id, level: 'pre-a1',
      now: new Date(Date.now() - 9 * 86_400_000) }),
    state, intervalDays: state === 'known' ? 5 : 2, successCount: 2, lapses: state === 'lapsed' ? 1 : 0,
    dueAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
  });
  const pile = Array.from({ length: 30 }, (_, index) => back(index, index % 10 === 9 ? 'lapsed' : 'known'));

  function open(items: ReviewItem[], path = '/review?catch-up') {
    return render(
      <AppStateContext.Provider value={stubState({ reviewItems: items }, lang)}>
        <MemoryRouter initialEntries={[path]}>
          <ReviewPage />
        </MemoryRouter>
      </AppStateContext.Provider>,
    );
  }

  it('starts at once with a dozen, the forgotten first', () => {
    open(pile);
    expect(screen.getByText(tr('catchUpRound', lang, { n: CATCH_UP_SIZE }))).toBeInTheDocument();
    expect(document.querySelector('.player__count')!.textContent)
      .toBe(tr('exerciseProgress', lang, { done: 1, total: CATCH_UP_SIZE }));
    const first = catchUpExercises(pile, lang)[0]!.steps[0]!;
    expect(stepIdOnScreen()).toBe(first.id);
    expect(pile.find((item) => item.refId === first.reviewTargets![0])!.state).toBe('lapsed');
  });

  it('is the ordinary review page without the warm-up asked for', () => {
    open(pile, '/review');
    expect(screen.queryByText(tr('catchUpRound', lang, { n: CATCH_UP_SIZE }))).toBeNull();
    expect(screen.getByRole('button', { name: tr('reviewStart', lang) })).toHaveClass('btn--primary');
  });

  // Played through in English: the helper that plays knows the English buttons.
  it.runIf(lang === 'en')('hands back to the day once done, and leaves the rest of the pile unpressed', async () => {
    const few = pile.slice(7, 10);
    const user = userEvent.setup();
    open(few);
    await play(user, catchUpExercises(few, lang), { right: () => true });
    expect(screen.getByText(tr('catchUpDone', lang))).toBeInTheDocument();
    const onward = screen.getByRole('link', { name: tr('catchUpOnward', lang) });
    expect(onward).toHaveAttribute('href', '/');
    expect([...document.querySelectorAll('.btn--primary')]).toEqual([onward]);
  });
});
