// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup } from '@testing-library/react';
import { describeNoun, vocabById } from '../../src/content/browser.ts';
import { AppStateContext, type AppStateValue } from '../../src/state/AppState.tsx';
import { GenderedGerman, NounDisplay, genderParts, nounArticle } from '../../src/ui/components/Gender.tsx';
import { contrast, styledPage, type Viewer } from './shippedStyles.ts';

/*
 * Der, die, das on their colours. The article word itself is always there;
 * the colour is a second way of seeing it. Only a noun's own nominative
 * article is coloured: a plural "die", or "der" before a feminine noun in the
 * dative, is not a gender.
 */

afterEach(cleanup);

const entry = (id: string) => {
  const found = vocabById(id);
  if (!found) throw new Error(`No vocabulary entry ${id}`);
  return found;
};

describe('a noun from the vocabulary', () => {
  it.each([
    ['v-der-hund', 'der'],
    ['v-die-tochter', 'die'],
    ['v-das-alphabet', 'das'],
  ])('%s has its article on the %s block, with the article word shown', (id, article) => {
    const { container } = render(<NounDisplay entry={entry(id)} />);
    const marked = container.querySelectorAll('.gender');
    expect(marked).toHaveLength(1);
    expect(marked[0]).toHaveClass(`gender--${article}`);
    expect(marked[0]).toHaveTextContent(article);
    expect(container).toHaveTextContent(entry(id).display);
  });

  it('a word that is not a noun has no gender colour', () => {
    const { container } = render(<NounDisplay entry={entry('v-hallo')} />);
    expect(container.querySelector('.gender')).toBeNull();
    expect(container).toHaveTextContent('Hallo');
  });

  it('a plural-only noun is not coloured as feminine', () => {
    expect(nounArticle(entry('v-die-eltern'))).toBeUndefined();
    const { container } = render(<NounDisplay entry={entry('v-die-eltern')} />);
    expect(container.querySelector('.gender')).toBeNull();
    expect(container).toHaveTextContent('die Eltern');
  });
});

describe('a German sentence', () => {
  const state = { describeNoun } as unknown as AppStateValue;
  const show = (text: string) =>
    render(
      <AppStateContext.Provider value={state}>
        <p>
          <GenderedGerman text={text} />
        </p>
      </AppStateContext.Provider>,
    ).container;

  it('colours each article that is its noun’s own', () => {
    const container = show('Der Hund und die Tochter lesen das Buch.');
    const marked = [...container.querySelectorAll('.gender')];
    expect(marked.map((span) => [span.className, span.textContent])).toEqual([
      ['gender gender--der', 'Der'],
      ['gender gender--die', 'die'],
      ['gender gender--das', 'das'],
    ]);
    expect(container).toHaveTextContent('Der Hund und die Tochter lesen das Buch.');
  });

  it('leaves an article that is a case or a plural alone', () => {
    // "der Tochter" is the dative of a feminine noun; "die Eltern" a plural.
    expect(genderParts('Ich gebe der Tochter die Eltern.', describeNoun)).toEqual(['Ich gebe der Tochter die Eltern.']);
    expect(show('Ich gebe der Tochter das Buch.').querySelectorAll('.gender')).toHaveLength(1);
  });

  it('leaves "der" alone before a plural spelt like its singular, where it is a genitive or after a preposition', () => {
    // der Arbeitnehmer, die Arbeitnehmer: after a noun, "der" is the genitive plural.
    expect(genderParts('die Rechte der Arbeitnehmer', describeNoun)).toEqual(['die Rechte der Arbeitnehmer']);
    expect(genderParts('Wegen der Lehrer bleiben wir.', describeNoun)).toEqual(['Wegen der Lehrer bleiben wir.']);
    // The words before a bold run count, though they are not in it.
    expect(genderParts('der Arbeitnehmer', describeNoun, undefined, 'die Rechte ')).toEqual(['der Arbeitnehmer']);
    // In the nominative it is still the noun's own gender.
    expect(genderParts('Der Lehrer kommt.', describeNoun)).toEqual([{ article: 'der', text: 'Der' }, ' Lehrer kommt.']);
    expect(genderParts('Hier ist der Lehrer.', describeNoun)).toEqual(['Hier ist ', { article: 'der', text: 'der' }, ' Lehrer.']);
    expect(genderParts('Ja. Der Lehrer kommt.', describeNoun)).toEqual(['Ja. ', { article: 'der', text: 'Der' }, ' Lehrer kommt.']);
    expect(genderParts('der Arbeitnehmer', describeNoun)).toEqual([{ article: 'der', text: 'der' }, ' Arbeitnehmer']);
  });

  it('leaves a sentence without nouns as plain text', () => {
    const container = show('Hallo! Wie geht es?');
    expect(container.querySelector('.gender')).toBeNull();
  });
});

describe('the gender colours', () => {
  it.each([
    ['light', { width: 390 }],
    ['dark', { width: 390, dark: true }],
  ] as Array<[string, Viewer]>)('give each article its own readable colour (%s)', (_, viewer) => {
    const page = styledPage(
      viewer,
      `<div class="card"><span class="gender gender--der">der</span><span class="gender gender--die">die</span><span class="gender gender--das">das</span></div>`,
    );
    const card = page.value('.card', 'background-color');
    const colours = ['der', 'die', 'das'].map((article) => page.value(`.gender--${article}`, 'color'));
    expect(new Set(colours).size).toBe(3);
    for (const colour of colours) expect(contrast(colour, card)).toBeGreaterThanOrEqual(4.5);
    for (const article of ['der', 'die', 'das']) {
      expect(page.value(`.gender--${article}`, '--gender-fill')).toBe(page.value('.card', `--${article}`));
    }
  });
});
