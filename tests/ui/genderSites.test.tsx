// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { CURRICULUM, SCENARIO_SCRIPTS, describeNoun } from '../../src/content/index.ts';
import type { Block, Exercise, ExerciseKind, ScenarioScript } from '../../src/content/types.ts';
import type { MistakeRecord } from '../../src/services/api/client.ts';
import { tr } from '../../src/i18n.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { Blocks } from '../../src/ui/components/bits.tsx';
import { ExercisePlayer } from '../../src/ui/components/ExercisePlayer.tsx';
import { answerWords, genderParts } from '../../src/ui/components/Gender.tsx';
import { ScenarioPlayer } from '../../src/ui/components/ScenarioPlayer.tsx';
import { DashboardPage } from '../../src/ui/pages/DashboardPage.tsx';
import { MistakesPage } from '../../src/ui/pages/MistakesPage.tsx';
import { WordPage } from '../../src/ui/pages/WordPage.tsx';
import { play, silentVoice, stubState } from './playerStub.tsx';

/*
 * Der, die, das in colour wherever German with articles is shown to be read:
 * teaching, a word's page, the correct forms of mistakes, a conversation, an
 * answer once it is shown. Never before a question is answered, where the
 * colour would tell the learner the gender it asks for. The colour is
 * visual only: the text, its language and what a screen reader hears stay
 * exactly what they were.
 */

afterEach(cleanup);

function mount(node: ReactElement, overrides: Partial<AppStateValue> = {}, path = '/') {
  return render(
    <AppStateContext.Provider value={stubState({ tts: silentVoice, ...overrides })}>
      <MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>
    </AppStateContext.Provider>,
  );
}

/** The coloured articles inside `root`, as [article, text]. */
const coloured = (root: ParentNode) =>
  [...root.querySelectorAll('.gender')].map((span) => [span.className.replace('gender gender--', ''), span.textContent]);

function mistake(id: string, expected: string, lastGiven: string): MistakeRecord {
  return {
    id, category: 'article', expected, lastGiven, stepId: null, lessonId: null, occurrences: 2, correctedCount: 0,
    firstSeenAt: '2026-01-01T00:00:00.000Z', lastSeenAt: '2026-01-01T00:00:00.000Z', resolvedAt: null,
  };
}

describe('a lesson\'s teaching', () => {
  const blocks: Block[] = [
    { t: 'de', de: 'Der Hund schläft.', gloss: { en: 'The dog sleeps.', bg: 'Кучето спи.' } },
    { t: 'contrast', de: 'Ich gebe der Tochter das Buch.', other: { en: 'I give my daughter the book.', bg: 'Давам на дъщерята книгата.' } },
    {
      t: 'table',
      headers: [{ en: 'One', bg: 'Едно' }, { en: 'Many', bg: 'Много' }],
      rows: [['der Tisch', 'die Tische'], ['das Mädchen', 'die Mädchen'], ['**die** Tochter', 'die Töchter']],
    },
    { t: 'breakdown', de: 'Die Tochter liest.', parts: [{ de: 'Die Tochter', gloss: { en: 'the daughter', bg: 'дъщерята' } }, { de: 'liest', gloss: { en: 'reads', bg: 'чете' } }] },
  ];

  it('colours each noun\'s own article in examples, contrasts, tables and breakdowns', () => {
    const { container } = mount(<Blocks blocks={blocks} />);
    expect(coloured(container.querySelector('.example__de')!)).toEqual([['der', 'Der']]);
    // "der Tochter" is a dative: not a gender.
    expect(coloured(container.querySelector('.contrast__de')!)).toEqual([['das', 'das']]);
    const cells = [...container.querySelectorAll('tbody td')];
    expect(coloured(cells[0]!)).toEqual([['der', 'der']]);
    expect(coloured(cells[2]!)).toEqual([['das', 'das']]);
    // Plurals keep a plain "die", even "die Mädchen", whose noun is neuter.
    for (const plural of [cells[1]!, cells[3]!, cells[5]!]) expect(coloured(plural)).toEqual([]);
    // An article written in bold is still not a noun's when the noun is outside the bold.
    expect(cells[4]!.querySelector('strong')).toHaveTextContent('die');
    expect(coloured(container.querySelector('.breakdown__sentence')!)).toEqual([['die', 'Die']]);
    const parts = [...container.querySelectorAll('.breakdown__de')];
    expect(coloured(parts[0]!)).toEqual([['die', 'Die']]);
    expect(coloured(parts[1]!)).toEqual([]);
  });

  it('keeps the German text and its language exactly as they were', () => {
    const { container } = mount(<Blocks blocks={blocks} />);
    expect(container.querySelector('.example__de')).toHaveAttribute('lang', 'de');
    expect(container.querySelector('.example__de')!.textContent).toBe('Der Hund schläft.');
    expect(container.querySelector('.contrast__de')!.textContent).toBe('Ich gebe der Tochter das Buch.');
    expect([...container.querySelectorAll('tbody td')].map((cell) => cell.getAttribute('lang'))).toEqual(Array(6).fill('de'));
    expect(container.querySelector('tbody td')!.textContent).toContain('der Tisch');
    expect(container.querySelector('.breakdown__sentence')).toHaveAttribute('lang', 'de');
    // The colour is a class on a span: nothing is added for a screen reader to say.
    for (const span of container.querySelectorAll('.gender')) {
      expect(span.getAttributeNames().sort()).toEqual(['class']);
    }
  });
});

describe('a word\'s page', () => {
  const page = (id: string, overrides: Partial<AppStateValue> = {}) => mount(
    <Routes><Route path="/vocabulary/:wordId" element={<WordPage />} /></Routes>, overrides, `/vocabulary/${id}`);

  it('colours the example sentence, and the related words that are nouns', () => {
    const { container } = page('v-junge');
    // "Der Junge ist mein Sohn."
    expect(coloured(container.querySelector('.example__de')!)).toEqual([['der', 'Der']]);
    expect(container.querySelector('.example__de')!.textContent).toBe('Der Junge ist mein Sohn.');
    const related = screen.getByRole('link', { name: 'das Mädchen' });
    expect(related).toHaveAttribute('lang', 'de');
    expect(coloured(related)).toEqual([['das', 'das']]);
  });

  it('leaves a related word that is not a noun plain', () => {
    const { container } = page('v-arbeit');
    expect(screen.getByRole('link', { name: 'arbeiten' }).querySelector('.gender')).toBeNull();
    expect(coloured(container.querySelector('.example__de')!)).toEqual([['die', 'Die']]);
  });

  it('colours a phrase the word goes with when it has the noun\'s own article', () => {
    const { container } = page('v-der-flug');
    // "Der Flug war billiger als der Zug."
    expect(coloured(container.querySelector('.example__de')!)).toEqual([['der', 'Der'], ['der', 'der']]);
    const collocations = page('v-der-antrag').container.querySelector('.collocations')!;
    // "einen Antrag stellen": no definite article, nothing coloured.
    expect(collocations).toHaveTextContent('einen Antrag stellen');
    expect(coloured(collocations)).toEqual([]);
  });

  it('colours the correct form in the word\'s own mistakes, never what was written', () => {
    const { container } = page('v-die-tochter', { mistakes: [mistake('m1', 'die Tochter', 'der Tochter')] });
    expect(coloured(container.querySelector('.mistake-list__right')!)).toEqual([['die', 'die']]);
    expect(coloured(container.querySelector('.mistake-list__wrong')!)).toEqual([]);
  });
});

describe('the mistake bank and Today', () => {
  const mistakes = [mistake('m1', 'die Tochter', 'das Tochter'), mistake('m2', 'Ich gebe der Tochter das Buch.', 'Ich gebe die Tochter das Buch.'), mistake('m3', 'die Eltern', 'der Eltern')];

  it('colours each correct form\'s nominative article, and nothing the learner wrote', () => {
    const { container } = mount(<MistakesPage />, { mistakes });
    const right = [...container.querySelectorAll('.mistake-list__right')];
    expect(right.map((span) => coloured(span))).toEqual([[['die', 'die']], [['das', 'das']], []]);
    expect(right.map((span) => span.getAttribute('lang'))).toEqual(['de', 'de', 'de']);
    expect(right[0]!.textContent).toBe('die Tochter');
    expect(coloured(container.querySelectorAll('.mistake-list__wrong')[0]!.parentElement!.querySelector('.mistake-list__wrong')!)).toEqual([]);
    for (const wrong of container.querySelectorAll('.mistake-list__wrong')) expect(coloured(wrong)).toEqual([]);
  });

  it('shows no colour once practice starts: the questions stand alone', async () => {
    const user = userEvent.setup();
    const { container } = mount(<MistakesPage />, { mistakes });
    await user.click(screen.getByRole('button', { name: tr('mistakesPractise', 'en') }));
    expect(container.querySelector('[data-step-id]')).not.toBeNull();
    expect(container.querySelector('.gender')).toBeNull();
  });

  it('colours Today\'s mistake card the same way', () => {
    const { container } = mount(<DashboardPage />, { mistakes });
    const card = container.querySelector('.mistake-mini')!;
    expect([...card.querySelectorAll('.mistake-mini__right')].map((span) => coloured(span))).toEqual([[['die', 'die']], [['das', 'das']], []]);
    for (const wrong of card.querySelectorAll('.mistake-mini__wrong')) expect(coloured(wrong)).toEqual([]);
  });
});

describe('a conversation', () => {
  const station = SCENARIO_SCRIPTS.find((script) => script.id === 'sc-transport-pre-a1')!;

  it('colours the lines said, the learner\'s own included, once their turn is past', async () => {
    const user = userEvent.setup();
    const { container } = mount(<ScenarioPlayer script={station} onFinish={() => {}} onExit={() => {}} />);
    const turns = station.beats.flatMap((beat) => (beat.who === 'you' ? [beat.exercise] : []));
    // "Entschuldigung!", then "Wo ist der Bahnhof?": the answer to "Der Bahnhof? Immer geradeaus…".
    await play(user, turns, { right: () => true, done: () => Boolean(container.querySelector('.chat__live .chat__de')?.textContent?.startsWith('Der Bahnhof')) });
    const line = container.querySelector('.chat__live .chat__de')!;
    expect(line).toHaveAttribute('lang', 'de');
    expect(coloured(line)).toEqual([['der', 'Der']]);
    expect(line.textContent).toBe('Der Bahnhof? Immer geradeaus, dann links. Zehn Minuten.');
    const said = [...container.querySelectorAll('.chat__bubble--you .chat__de')].map((p) => p.textContent);
    expect(said).toContain('Wo ist der Bahnhof?');
    const mine = [...container.querySelectorAll('.chat__bubble--you .chat__de')].find((p) => p.textContent === 'Wo ist der Bahnhof?')!;
    expect(coloured(mine)).toEqual([['der', 'der']]);
  });

  it('keeps plain, on every line, a noun the open turn asks for', () => {
    // The table is offered, and the learner is to ask for it: its colour
    // would say "der" before they do.
    const script: ScenarioScript = {
      ...station,
      id: 'sc-test-table',
      beats: [
        { who: 'them', de: 'Der Tisch am Fenster ist frei. Das Buch liegt dort.', gloss: { en: '', bg: '' } },
        { who: 'you', exercise: { ...turnAsking('Ich nehme den Tisch.') } },
      ],
    } as ScenarioScript;
    const { container } = mount(<ScenarioPlayer script={script} onFinish={() => {}} onExit={() => {}} />);
    const line = container.querySelector('.chat__live .chat__de')!;
    expect(coloured(line)).toEqual([['das', 'Das']]);
    expect(line.textContent).toBe('Der Tisch am Fenster ist frei. Das Buch liegt dort.');
  });

  it('knows the words of a turn\'s answers, choices and gap', () => {
    const words = answerWords([{ answer: { accepted: ['Ich nehme den Tisch.'] }, choices: [{ de: 'die Suppe' }], scaffold: '___ Brot' }]);
    for (const word of ['tisch', 'suppe', 'brot', 'ich']) expect(words.has(word)).toBe(true);
    expect(genderParts('Der Tisch und das Brot.', describeNoun, words)).toEqual(['Der Tisch und das Brot.']);
  });
});

function turnAsking(answer: string): Exercise {
  return {
    id: 'ex-turn',
    kind: 'type',
    level: 'a1',
    objective: { en: 'Ask for the table', bg: 'Поискай масата' },
    steps: [{ id: 'turn-s1', prompt: { en: 'Take the table.', bg: 'Вземи масата.' }, answer: { accepted: [answer], shape: 'sentence' }, hints: [] }],
  } as unknown as Exercise;
}

describe('a question', () => {
  /*
   * One of every kind the course has, chosen with a noun and its article
   * in it where there is one: before it is answered, nothing on screen has
   * a gender colour — not the prompt, the choices, the word bank, the gap
   * or the sentence read out.
   */
  const every = [
    ...CURRICULUM.flatMap((level) => level.units.flatMap((unit) => [
      ...unit.lessons.flatMap((lesson) => [...lesson.exercises, ...lesson.mastery.exercises]),
      ...(unit.checkpoint?.exercises ?? []),
    ])),
    ...SCENARIO_SCRIPTS.flatMap((script) => script.beats.flatMap((beat) => (beat.who === 'you' ? [beat.exercise] : []))),
  ];
  const withNoun = (exercise: Exercise) => JSON.stringify(exercise.steps).match(/\b(der|die|das|Der|Die|Das) [A-ZÄÖÜ]/) !== null;
  const kinds = [...new Set(every.map((exercise) => exercise.kind))] as ExerciseKind[];
  const sample = kinds.flatMap((kind) => {
    const ofKind = every.filter((exercise) => exercise.kind === kind);
    return [...ofKind.filter(withNoun).slice(0, 3), ...ofKind.slice(0, 1)];
  });

  it('covers every kind of question', () => {
    expect(kinds.length).toBeGreaterThanOrEqual(11);
    expect(new Set(sample.map((exercise) => exercise.kind)).size).toBe(kinds.length);
  });

  it.each(sample.map((exercise) => [exercise.kind, exercise.id, exercise] as const))('%s %s shows no colour before it is answered', (_kind, _id, exercise) => {
    const { container } = mount(<ExercisePlayer exercises={[exercise]} context="lesson" level={exercise.level} onFinish={() => {}} />);
    expect(container.querySelector('[data-step-id]')).not.toBeNull();
    expect(container.querySelector('.gender')).toBeNull();
  });

  it('colours the answer once the learner has asked to see it', async () => {
    const user = userEvent.setup();
    const exercise = turnAsking('Der Hund und die Tochter lesen.');
    const { container } = mount(<ExercisePlayer exercises={[exercise]} context="lesson" level={exercise.level} onFinish={() => {}} />);
    const step = exercise.steps.find((candidate) => candidate.id === container.querySelector('[data-step-id]')!.getAttribute('data-step-id'))!;
    expect(container.querySelector('.gender')).toBeNull();
    await user.click(screen.getByRole('button', { name: tr('exerciseReveal', 'en') }));
    const shown = container.querySelector('.hints__answer')!;
    expect(shown).toHaveAttribute('lang', 'de');
    expect(shown.textContent).toBe(step.answer.accepted[0]);
    const parts = genderParts(step.answer.accepted[0]!, describeNoun).filter((part) => typeof part !== 'string');
    expect(coloured(shown)).toEqual(parts.map((part) => [part.article, part.text]));
    expect(parts.length).toBeGreaterThan(0);
    // The field and the prompt above it are still plain.
    expect(within(container.querySelector('[data-step-id]')!).queryAllByRole('textbox')[0]!.closest('.gender')).toBeNull();
  });
});
