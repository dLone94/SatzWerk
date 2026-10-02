// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { dictation } from '../../src/content/authoring.ts';
import { VOCABULARY } from '../../src/content/index.ts';
import { tr } from '../../src/i18n.ts';
import { AppStateContext } from '../../src/state/AppState.tsx';
import { ExercisePlayer } from '../../src/ui/components/ExercisePlayer.tsx';
import { silentVoice, stubState } from './playerStub.tsx';

describe('the difficulty of mixed-level review rounds', () => {
  it('uses the advanced word’s level for the dictation replay budget', () => {
    const word = VOCABULARY.find(entry => entry.level === 'b2')!;
    const exercise = dictation('advanced-review', { en: 'Listen', bg: 'Слушай' }, [{
      answer: word.display, reviewTargets: [word.id],
    }]);
    render(
      <AppStateContext.Provider value={stubState({ tts: silentVoice })}>
        <ExercisePlayer exercises={[exercise]} context="review" level="pre-a1" onFinish={() => {}} />
      </AppStateContext.Provider>,
    );
    expect(screen.getByText(tr('exerciseReplaysLeft', 'en', { n: 2 }))).toBeInTheDocument();
    expect(screen.queryByText(tr('exerciseReplaysLeft', 'en', { n: 4 }))).not.toBeInTheDocument();
  });
});
