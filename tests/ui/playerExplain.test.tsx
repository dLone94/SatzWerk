// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { typeIt } from '../../src/content/authoring.ts';
import { tr } from '../../src/i18n.ts';
import { AppStateContext } from '../../src/state/AppState.tsx';
import { stubState } from './playerStub.tsx';

/**
 * "Why was this wrong?" inside the player, asked about the answer the learner
 * actually gave.
 */

const { explainMistake } = vi.hoisted(() => ({ explainMistake: vi.fn() }));

vi.mock('../../src/services/api/client.ts', () => ({
  api: { explainMistake },
  ApiError: class extends Error {},
}));

const { ExercisePlayer } = await import('../../src/ui/components/ExercisePlayer.tsx');

const bi = (en: string, bg: string) => ({ en, bg });

describe('asking why an answer was wrong', () => {
  /*
   * A wrong answer goes straight to the retype, which clears the field, and
   * the panel sent the field. The model was asked to explain an empty answer,
   * or the half-typed correction, instead of the mistake on screen.
   */
  it('sends what the learner submitted, not the retype field', async () => {
    const user = userEvent.setup();
    explainMistake.mockResolvedValue({ available: true, explanation: 'Because.' });
    const exercise = typeIt('why', bi('Origin', 'Произход'), [
      { id: 'why-s1', prompt: bi('I come from Bulgaria.', 'Аз съм от България.'), answer: 'Ich komme aus Bulgarien.' },
    ]);
    render(
      <AppStateContext.Provider value={stubState({ coach: { aiAvailable: true } as never })}>
        <ExercisePlayer exercises={[exercise]} context="lesson" level="pre-a1" onFinish={() => {}} />
      </AppStateContext.Provider>,
    );
    await user.type(screen.getByRole('textbox'), 'Ich komme von Bulgarien.{Enter}');
    expect(document.querySelector('.feedback__retype-label')).not.toBeNull();
    await user.type(screen.getByRole('textbox'), 'Ich komme');
    await user.click(screen.getByRole('button', { name: tr('explainAsk', 'en') }));

    expect(explainMistake).toHaveBeenCalledTimes(1);
    expect(explainMistake.mock.calls[0]![0]).toMatchObject({
      given: 'Ich komme von Bulgarien.',
      expected: 'Ich komme aus Bulgarien.',
    });
  });
});
