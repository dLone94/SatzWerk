// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from 'vitest';
import { contrast, styledPage, type Viewer } from './shippedStyles.ts';

/**
 * Every text and background pair the Holzwerk palette puts together, in the
 * CSS the build ships, light and dark. Body text needs 4.5:1; an edge or an
 * icon that has to be seen (a focus ring, a control's outline, a block of
 * colour that marks a gender) needs 3:1.
 *
 * Yellow is in here only as a fill behind ink: as text on paper it is 1.9:1,
 * and the palette never uses it that way.
 */

const TEXT: Array<[string, string]> = [
  ...['--ink', '--ink-soft', '--ink-faint'].flatMap((ink) =>
    ['--paper', '--surface', '--surface-alt', '--sand', '--accent-soft'].map((bg) => [ink, bg] as [string, string]),
  ),
  ['--accent-ink', '--paper'],
  ['--accent-ink', '--surface'],
  ['--accent-ink', '--accent-soft'],
  ['--on-accent', '--accent'],
  ['--on-hero', '--hero'],
  ['--on-hero-soft', '--hero'],
  ['--on-highlight', '--highlight'],
  ['--good', '--paper'],
  ['--good', '--surface'],
  ['--good', '--good-soft'],
  ['--good-ink', '--good-soft'],
  ['--bad', '--paper'],
  ['--bad', '--surface'],
  ['--bad', '--bad-soft'],
  ['--warn', '--warn-soft'],
  ['--warn', '--paper'],
  ['--warn', '--surface'],
  ['--ink', '--good-soft'],
  ['--ink', '--bad-soft'],
  ['--ink', '--warn-soft'],
  ...['--der-ink', '--die-ink', '--das-ink'].flatMap((ink) =>
    ['--paper', '--surface', '--surface-alt'].map((bg) => [ink, bg] as [string, string]),
  ),
  ['--bar-ink', '--bar'],
  ['--bar-active', '--bar'],
  // The active tab's pill: always dark ink on the yellow, in both schemes.
  ['--on-hero', '--yellow'],
];

const EDGES: Array<[string, string]> = [
  ['--focus', '--paper'],
  ['--focus', '--surface'],
  ['--line-strong', '--paper'],
  ['--line-strong', '--surface'],
  ['--accent', '--paper'],
  ['--accent', '--surface'],
  // The active tab's pill on the bar. (The bar itself is set off from the
  // page by its drop and, in the dark, a ring; its tabs carry the contrast.)
  ['--yellow', '--bar'],
  ['--focus-on-bar', '--bar'],
  // The gender blocks beside their article.
  ...['--der', '--die', '--das'].flatMap((fill) => ['--surface', '--paper'].map((bg) => [fill, bg] as [string, string])),
  // White icons on the coloured chips.
  ['--blue', '#ffffff'],
  ['--red', '#ffffff'],
  ['--green', '#ffffff'],
];

describe.each([
  ['light', { width: 390 }],
  ['dark', { width: 390, dark: true }],
] as Array<[string, Viewer]>)('the Holzwerk palette (%s)', (_, viewer) => {
  let page: ReturnType<typeof styledPage>;
  beforeAll(() => {
    page = styledPage(viewer, '<div id="probe"></div>');
  });
  const read = (name: string) => (name.startsWith('#') ? name : page.value('#probe', name));

  it.each(TEXT)('%s on %s reads at 4.5:1', (fg, bg) => {
    expect(contrast(read(fg), read(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(EDGES)('%s against %s shows at 3:1', (fg, bg) => {
    expect(contrast(read(fg), read(bg))).toBeGreaterThanOrEqual(3);
  });
});
