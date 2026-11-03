// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { multipleChoice, typeIt } from '../../src/content/authoring.ts';
import type { TeachingLanguage } from '../../src/content/types.ts';
import type { AttemptPayload } from '../../src/services/api/client.ts';
import { AppStateContext } from '../../src/state/AppState.tsx';
import { ExercisePlayer } from '../../src/ui/components/ExercisePlayer.tsx';
import { stubState } from './playerStub.tsx';

/**
 * How the player reads an answer that is not a German mistake at all: the
 * right German typed with a Bulgarian keyboard, and a sound misheard in a
 * listening exercise.
 */

const bi = (en: string, bg: string) => ({ en, bg });
const attempts: AttemptPayload[] = [];

function mount(exercises: Parameters<typeof ExercisePlayer>[0]['exercises'], lang: TeachingLanguage = 'bg') {
  const state = stubState({ submitAttempt: async (payload) => void attempts.push(payload) }, lang);
  return render(
    <AppStateContext.Provider value={state}>
      <ExercisePlayer exercises={exercises} context="lesson" level="pre-a1" onFinish={() => {}} />
    </AppStateContext.Provider>,
  );
}

beforeEach(() => {
  attempts.length = 0;
});

describe('an answer typed in Cyrillic letters', () => {
  /*
   * "Гутен Морген" is "Guten Morgen" on a keyboard still set to Bulgarian. It
   * was graded wrong, stored as a vocabulary mistake and counted against the
   * first try.
   */
  it('is not saved or graded, and stays in the field to be typed again', async () => {
    const user = userEvent.setup();
    const greet = typeIt('cyr', bi('Greet', 'Поздрав'), [
      { id: 'cyr-s1', prompt: bi('Say good morning.', 'Кажи добро утро.'), answer: 'Guten Morgen!' },
    ]);
    mount([greet]);
    const field = screen.getByRole('textbox');
    await user.type(field, 'Гутен Морген{Enter}');

    expect(attempts).toEqual([]);
    expect(screen.getByText('Първо превключи клавиатурата.')).toBeInTheDocument();
    expect(screen.getByText(/Отговорът ти е на кирилица/)).toBeInTheDocument();
    expect(document.querySelector('.feedback__tags')).toBeNull();
    expect(document.querySelector('.feedback__retype-label')).toBeNull();
    expect(screen.getByRole('textbox')).toHaveValue('Гутен Морген');

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Guten Morgen!{Enter}');
    await waitFor(() => expect(attempts).toHaveLength(1));
    expect(attempts[0]).toMatchObject({ verdict: 'correct', credit: 1, categories: [] });
  });
});

describe('a wrong choice in a listening exercise', () => {
  /*
   * The learner's first exercise: hear "die Töchter", tap what was said.
   * Tapping "die Tochter" was answered with plural grammar and the plural
   * tip, and filed as a plural mistake.
   */
  it('is explained by the sound and filed as the umlaut it is', async () => {
    const user = userEvent.setup();
    const listen = multipleChoice(
      'hear',
      bi('First listening', 'Първо слушане'),
      [
        {
          id: 'hear-s1',
          prompt: bi('Listen. Which word did you hear?', 'Слушай. Коя дума чу?'),
          audio: { text: 'die Töchter', hideText: true },
          choices: [
            { id: 'a', de: 'die Tochter', gloss: bi('the daughter', 'дъщерята') },
            { id: 'b', de: 'die Töchter', gloss: bi('the daughters', 'дъщерите') },
          ],
          correct: 'b',
          answer: 'die Töchter',
          shape: 'phrase',
        },
      ],
      'listenChoose',
    );
    mount([listen], 'en');
    await user.click(screen.getByText('die Tochter'));
    await waitFor(() => expect(attempts).toHaveLength(1));

    expect(attempts[0]).toMatchObject({ verdict: 'incorrect', credit: 0, categories: ['umlaut'] });
    const lines = document.querySelector('.feedback__lines')?.textContent ?? '';
    expect(lines).toContain('with ö');
    expect(lines).not.toContain('Here German needs');
    expect(document.querySelector('.micro-tip')).toBeNull();
    expect(document.querySelector('.tag--plural')).toBeNull();
  });
});
