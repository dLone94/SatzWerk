// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { styledPage, type Viewer } from './shippedStyles.ts';

/**
 * What the stylesheet decides: which of its three layers wins, in the CSS the
 * build ships, on a phone and on a desktop, light and dark. Each of these was
 * seen in a real browser first; jsdom has no layout, so what is checked here
 * is the rule that decides it, after the cascade and the minifier.
 */

const PHONE: Viewer = { width: 390 };
const DESKTOP: Viewer = { width: 1280 };
const name = (viewer: Viewer) => `${viewer.width}px${viewer.dark ? ' dark' : ''}`;
/** Each viewer with its name, for it.each. */
const named = (...viewers: Viewer[]) => viewers.map((viewer) => [name(viewer), viewer] as const);
const EVERY = named(PHONE, { ...PHONE, dark: true }, DESKTOP, { ...DESKTOP, dark: true });

const SHELL = `<div class="shell">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="topbar"><a class="topbar__brand" href="/">SatzWerk</a></header>
  <nav class="nav"><a class="nav__item" href="/"><span class="nav__label">Today</span></a></nav>
  <main id="main" class="main"><h1>Today</h1></main>
</div>`;

describe('the skip link', () => {
  /*
   * It took focus on the first Tab of every page and could not be seen: its
   * z-index of 10 put it under the sticky top bar (30), and on a desktop under
   * the fixed brand (30) and the sidebar (20) as well.
   */
  it.each(EVERY)('is drawn above the top bar when it has focus (%s)', (_, viewer) => {
    const page = styledPage(viewer, SHELL);
    (page.element('.skip-link') as HTMLElement).focus();
    expect(page.value('.skip-link', 'position')).toBe('absolute');
    const above = Number(page.value('.skip-link', 'z-index'));
    for (const cover of ['.topbar', '.topbar__brand', '.nav']) {
      expect(above, `${name(viewer)}: above ${cover}`).toBeGreaterThan(Number(page.value(cover, 'z-index')) || 0);
    }
  });
});

describe('the sticky top bar', () => {
  /*
   * Tabbing backwards brought each control to the top edge of the screen,
   * which is behind the bar: on /course at 390px the level buttons took focus
   * at 16–54px under a 74px bar, and the focus ring could not be seen at all.
   */
  it.each([390, 800, 1280])('is kept clear of by every scroll that brings something into view (%ipx)', (width) => {
    const page = styledPage({ width }, SHELL);
    expect(page.value('.topbar', 'position')).toBe('sticky');
    expect(page.px('html', 'scroll-padding-top')).toBeGreaterThanOrEqual(page.px('.topbar', 'min-height'));
  });
});
