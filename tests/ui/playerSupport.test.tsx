// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { conjugate, dictation, fillBlank, multipleChoice, typeIt } from '../../src/content/authoring.ts';
import type { Exercise } from '../../src/content/types.ts';
import { tr } from '../../src/i18n.ts';
import type { AttemptPayload } from '../../src/services/api/client.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { ExercisePlayer, type ExercisePlayerProps } from '../../src/ui/components/ExercisePlayer.tsx';
import { silentVoice, stepIdOnScreen, stubState, type User } from './playerStub.tsx';

/**
 * What the player shows around a question: the support it adds when the
 * learner struggles, and what a screen reader hears.
 */

const bi = (en: string, bg: string) => ({ en, bg });

function mount(props: Partial<ExercisePlayerProps> & { exercises: Exercise[] }, overrides: Partial<AppStateValue> = {}): { attempts: AttemptPayload[] } {
  const attempts: AttemptPayload[] = [];
  const value = stubState({
    submitAttempt: async (payload) => {
      attempts.push(payload);
    },
    ...overrides,
  });
  const node: ReactElement = (
    <AppStateContext.Provider value={value}>
      <MemoryRouter>
        <ExercisePlayer context="lesson" level="pre-a1" onFinish={() => {}} {...props} />
      </MemoryRouter>
    </AppStateContext.Provider>
  );
  render(node);
  return { attempts };
}

/** Sentences with a hint each: plenty to get wrong, and hints to open. */
const sentences: Exercise = typeIt(
  'sup',
  bi('Sentences', 'Изречения'),
  Array.from({ length: 12 }, (_, index) => ({
    id: `sup-${index + 1}`,
    prompt: bi(`Sentence ${index + 1}`, `Изречение ${index + 1}`),
    answer: 'Ich wohne in Hamburg.',
    hints: [bi('Start with Ich.', 'Започни с Ich.')],
  })),
);

const field = () => screen.getByRole('textbox');

async function answerWrong(user: User) {
  await user.clear(field());
  await user.type(field(), 'völlig falsch{Enter}');
  await user.type(field(), 'Ich wohne in Hamburg.{Enter}');
  await user.click(screen.getByRole('button', { name: tr('exerciseContinue', 'en') }));
}

async function answerRight(user: User, answer = 'Ich wohne in Hamburg.') {
  await user.clear(field());
  await user.type(field(), `${answer}{Enter}`);
  await user.click(screen.getByRole('button', { name: tr('exerciseContinue', 'en') }));
}

describe('support in a check without hints', () => {
  /*
   * The support ladder ran in final checks, checkpoints and the placement
   * check too. Two slips put the first word of the answer on screen, six
   * handed over every word as chips, and the answers still counted as right
   * first time.
   */
  it('never shows a cue or a word bank', async () => {
    const user = userEvent.setup();
    mount({ exercises: [sentences], context: 'checkpoint', allowHints: false });
    for (let i = 0; i < 8; i++) {
      await answerWrong(user);
      expect(document.querySelector('.task__cue')).toBeNull();
      expect(document.querySelector('.bank')).toBeNull();
      expect(document.querySelector('.hints')).toBeNull();
      expect(screen.queryByText(tr('exerciseSupportAdded', 'en'))).toBeNull();
    }
  });
});

describe('support in practice', () => {
  /*
   * For a one-word answer "the first word" is the answer. The cue printed it:
   * "heißt …" above an empty box.
   */
  it('does not print a one-word answer as its cue', async () => {
    const user = userEvent.setup();
    const verb = conjugate('sup-heissen', 'heißen', bi('heißen', 'heißen'), ['heiße', 'heißt', 'heißt', 'heißen', 'heißt', 'heißen']);
    mount({ exercises: [sentences, verb], onlyStepIds: ['sup-1', 'sup-2', 'sup-heissen-2'] });
    await answerWrong(user);
    await answerWrong(user);
    expect(stepIdOnScreen()).toBe('sup-heissen-2');
    const cue = document.querySelector('.task__cue');
    expect(cue).not.toBeNull();
    expect(cue!.textContent).not.toContain('heißt');
    expect(cue!.textContent).toBe('h____');
  });

  /*
   * From the word-bank rung on, the ladder opens a hint by itself. That hint
   * was charged as one the learner asked for, so no answer could count as
   * clean: the ladder never came back down, and every right answer went to
   * the recovery round with a hint penalty.
   */
  it('does not charge the learner for a hint it opened itself, and steps back down', async () => {
    const user = userEvent.setup();
    const { attempts } = mount({ exercises: [sentences] });
    for (let i = 0; i < 6; i++) await answerWrong(user);
    // At the word-bank rung: a hint is open without being asked for.
    expect(document.querySelector('.hints')).not.toBeNull();

    await answerRight(user);
    await user.clear(field());
    await user.type(field(), 'Ich wohne in Hamburg.{Enter}');
    expect(screen.getByText(tr('exerciseSupportRemoved', 'en'))).toBeInTheDocument();

    const right = attempts.filter((attempt) => attempt.verdict === 'correct' && !attempt.isRetype);
    expect(right).toHaveLength(2);
    for (const attempt of right) {
      expect(attempt.hintsUsed).toBe(0);
      expect(attempt.credit).toBe(1);
    }
  });

  it('still charges for a hint the learner opens', async () => {
    const user = userEvent.setup();
    const { attempts } = mount({ exercises: [sentences] });
    await user.click(screen.getByRole('button', { name: tr('exerciseHintCount', 'en', { n: 1, total: 1 }) }));
    await user.type(field(), 'Ich wohne in Hamburg.{Enter}');
    expect(attempts[0]!.hintsUsed).toBe(1);
    expect(attempts[0]!.credit).toBeLessThan(1);
  });
});

describe('what a screen reader hears', () => {
  const heard = dictation('sr-dict', bi('Listen', 'Слушай'), [
    { id: 'sr-dict-s1', audio: 'Guten Morgen, Frau Weber!', answer: 'Guten Morgen, Frau Weber!' },
  ]);

  /*
   * Every play button was named "Play: <the German>", the dictation's too, so
   * a screen reader read out the answer the learner was meant to write down.
   */
  it('does not read out a dictation through its play buttons', () => {
    mount({ exercises: [heard] }, { tts: silentVoice });
    const buttons = screen.getAllByRole('button', { name: /Play|Slow/ });
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    for (const button of buttons) {
      expect(button).not.toHaveAccessibleName(/Guten Morgen/);
    }
  });

  it('does not name the right option in a listen-and-choose', () => {
    const choose = multipleChoice(
      'sr-choose',
      bi('Listen and choose', 'Слушай и избери'),
      [
        {
          id: 'sr-choose-s1',
          audio: { text: 'vier', hideText: true },
          answer: 'vier',
          choices: [
            { id: 'a', de: 'vier', gloss: bi('four', 'четири') },
            { id: 'b', de: 'wir', gloss: bi('we', 'ние') },
          ],
          correct: 'a',
        },
      ],
      'listenChoose',
    );
    mount({ exercises: [choose] }, { tts: silentVoice });
    for (const button of screen.getAllByRole('button', { name: /Play|Slow/ })) {
      expect(button).not.toHaveAccessibleName(/vier/);
    }
  });

  /*
   * The words around a gap were hidden from screen readers, so the field was
   * just "Type your answer": a learner who could not see "___ Kind ist
   * klein." typed the whole sentence and was marked wrong.
   */
  it('describes the field by the sentence around the gap', () => {
    const gap = fillBlank('sr-gap', bi('Articles', 'Членове'), [
      { id: 'sr-gap-s1', prompt: bi('The child is small.', 'Детето е малко.'), scaffold: '___ Kind ist klein.', answer: 'Das' },
    ]);
    mount({ exercises: [gap] });
    expect(field()).toHaveAccessibleDescription(/blank Kind ist klein\./);
  });

  /*
   * The verdict's live region arrived together with its text, and focus moved
   * to Continue at the same moment, so "Right" or "Not quite" was never read.
   */
  it('announces the verdict through a region that was there all along', async () => {
    const user = userEvent.setup();
    mount({ exercises: [sentences] });
    const region = document.querySelector('[role="status"][aria-live="polite"]');
    expect(region).not.toBeNull();
    expect(region!.textContent).toBe('');

    await user.type(field(), 'Ich wohne in Hamburg.{Enter}');
    const headline = document.querySelector('.feedback__headline')!.textContent!;
    await waitFor(() => expect(region!.textContent).toContain(headline));
    expect(screen.getByRole('button', { name: tr('exerciseContinue', 'en') })).toHaveAccessibleDescription(headline);
  });

  it('reads the correction to a learner who has to retype it', async () => {
    const user = userEvent.setup();
    mount({ exercises: [sentences] });
    await user.type(field(), 'Ich wohne im Hamburg.{Enter}');
    const region = document.querySelector('[role="status"][aria-live="polite"]')!;
    await waitFor(() => expect(region.textContent).toContain('Ich wohne in Hamburg.'));
    expect(field()).toHaveAccessibleDescription(/Ich wohne in Hamburg\./);
  });
});

/** The player's own polite region, which outlives every question. */
const liveRegion = () => document.querySelector('.player > [role="status"][aria-live="polite"]')!;

describe('a new question, for a keyboard and a screen reader', () => {
  const choose = multipleChoice('sr-pick', bi('Pick the greeting', 'Избери поздрава'), [
    {
      id: 'sr-pick-s1',
      prompt: bi('It is 8 in the morning.', 'Осем сутринта е.'),
      answer: 'Guten Morgen',
      choices: [
        { id: 'a', de: 'Guten Abend' },
        { id: 'b', de: 'Guten Morgen' },
      ],
      correct: 'b',
    },
    {
      id: 'sr-pick-s2',
      prompt: bi('You are going to bed.', 'Лягаш си.'),
      answer: 'Gute Nacht',
      choices: [
        { id: 'a', de: 'Gute Nacht' },
        { id: 'b', de: 'Guten Tag' },
      ],
      correct: 'a',
    },
  ]);
  const choices = () => screen.getByRole('group', { name: tr('exerciseChoose', 'en') });

  /*
   * Only a text field was ever focused. On a choice question nothing was, so
   * focus fell to the page: Enter did nothing, a screen reader was not taken
   * to the question, and it took four or five Tabs to reach the options.
   */
  it('lands on the options of a choice question, and on the next one after Continue', async () => {
    const user = userEvent.setup();
    const { attempts } = mount({ exercises: [choose] });
    expect(choices()).toHaveFocus();
    // A stray Enter on the question picks nothing.
    await user.keyboard('{Enter}');
    expect(attempts).toHaveLength(0);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Guten Abend' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Guten Morgen' }));
    await user.click(await screen.findByRole('button', { name: tr('exerciseContinue', 'en') }));
    expect(stepIdOnScreen()).toBe('sr-pick-s2');
    await waitFor(() => expect(choices()).toHaveFocus());
  });

  /*
   * The field a learner lands in was named "Type your answer in German" and
   * described as "Enter to check" at every step, the same words each time:
   * nothing said the question had changed, or what it asked.
   */
  it('describes the field by the question it answers, and the options too', async () => {
    const user = userEvent.setup();
    mount({ exercises: [sentences, choose], onlyStepIds: ['sup-1', 'sup-2', 'sr-pick-s1'] });
    expect(field()).toHaveAccessibleDescription(/^1 of 3 Sentence 1 Enter to check$/);

    await answerRight(user);
    await waitFor(() => expect(field()).toHaveAccessibleDescription(/^2 of 3 Sentence 2 Enter to check$/));

    await answerRight(user);
    expect(choices()).toHaveAccessibleDescription('3 of 3 It is 8 in the morning.');
  });

  it('describes a dictation by its instruction, not by the sentence it hides', () => {
    const heard = dictation('sr-heard', bi('Listen', 'Слушай'), [
      {
        id: 'sr-heard-s1',
        instruction: bi('Type the whole greeting you hear.', 'Напиши целия поздрав, който чуваш.'),
        prompt: bi('Good night!', 'Лека нощ!'),
        audio: 'Gute Nacht!',
        answer: 'Gute Nacht!',
      },
    ]);
    mount({ exercises: [heard] }, { tts: silentVoice });
    expect(field()).toHaveAccessibleDescription(/^1 of 1 Type the whole greeting you hear\. Enter to check$/);
  });
});

describe('help asked for, and a correction typed', () => {
  const twoHints: Exercise = typeIt('sr-hints', bi('Spelling', 'Правопис'), [
    {
      id: 'sr-hints-s1',
      prompt: bi('Rewrite: heisse', 'Напиши: heisse'),
      answer: 'heiße',
      shape: 'word',
      hints: [bi('Replace ss with one letter.', 'Замени ss с една буква.'), bi('Use the ß button.', 'Използвай бутона ß.')],
    },
  ]);

  /*
   * A hint appeared silently below the controls, and opening the last one
   * disabled the very button that had focus, so focus fell to the page.
   */
  it('reads each hint out, and moves on to the field after the last one', async () => {
    const user = userEvent.setup();
    mount({ exercises: [twoHints] });
    await user.click(screen.getByRole('button', { name: tr('exerciseHintCount', 'en', { n: 1, total: 2 }) }));
    await waitFor(() => expect(liveRegion().textContent).toContain('Replace ss with one letter.'));
    expect(screen.getByRole('button', { name: tr('exerciseHintCount', 'en', { n: 2, total: 2 }) })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: tr('exerciseHintCount', 'en', { n: 2, total: 2 }) }));
    await waitFor(() => expect(liveRegion().textContent).toContain('Use the ß button.'));
    expect(field()).toHaveFocus();
    expect(field()).toHaveAccessibleDescription(/Replace ss with one letter\..*Use the ß button\./);
  });

  it('tells the field what the shown answer is', async () => {
    const user = userEvent.setup();
    mount({ exercises: [twoHints] });
    await user.click(screen.getByRole('button', { name: tr('exerciseReveal', 'en') }));
    expect(field()).toHaveFocus();
    expect(field()).toHaveAccessibleDescription(/heiße/);
  });

  /*
   * The last replay disabled the play button that had focus. The replay
   * count said so, but focus was on the page, and the next key did nothing.
   */
  it('moves on to the field when the last replay of a dictation is spent', async () => {
    const user = userEvent.setup();
    const heard = dictation('sr-replay', bi('Listen', 'Слушай'), [
      { id: 'sr-replay-s1', audio: 'Gute Nacht!', answer: 'Gute Nacht!' },
    ]);
    mount({ exercises: [heard], level: 'a1' }, { tts: silentVoice });
    const play = screen.getByRole('button', { name: tr('exercisePlayAudio', 'en') });
    play.focus();
    await user.keyboard('{Enter}');
    expect(play).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(play).toBeDisabled();
    expect(field()).toHaveFocus();
  });

  /*
   * A wrong retype showed "Type the correction to continue." to the eye only,
   * and a right one moved to Continue still described as "Not quite.", with
   * nothing on screen saying the correction had been taken.
   */
  it('says a retype is still wrong, and says so again when it is accepted', async () => {
    const user = userEvent.setup();
    mount({ exercises: [sentences] });
    await user.type(field(), 'völlig falsch{Enter}');
    await waitFor(() => expect(document.querySelector('.feedback__retype-target')).not.toBeNull());

    await user.type(field(), 'noch falsch{Enter}');
    await waitFor(() => expect(liveRegion().textContent).toBe(tr('exerciseRetypeLocked', 'en')));
    expect(field()).toHaveAccessibleDescription(new RegExp(tr('exerciseRetypeLocked', 'en')));

    await user.clear(field());
    await user.type(field(), 'Ich wohne in Hamburg.{Enter}');
    const continueButton = await screen.findByRole('button', { name: tr('exerciseContinue', 'en') });
    expect(continueButton).toHaveFocus();
    expect(continueButton).toHaveAccessibleDescription(tr('exerciseRetypeDone', 'en'));
    expect(screen.getByText(tr('exerciseRetypeDone', 'en'))).toBeVisible();
    await waitFor(() => expect(liveRegion().textContent).toBe(tr('exerciseRetypeDone', 'en')));
    // The field holds the accepted correction, so it no longer says "wrong".
    expect(field()).not.toHaveClass('answer-field--error');
  });
});
