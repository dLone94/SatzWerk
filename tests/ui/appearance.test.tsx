// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DackelMark } from '../../src/ui/components/Dackel.tsx';
import { contrast, luminance, styledPage, type Viewer } from './shippedStyles.ts';

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

describe('buttons that are drawn with an outline', () => {
  /*
   * A ghost button, a button on the yellow hero and a danger button have no
   * fill of their own; their outline is the only thing that says "button".
   * The outline was an inset shadow, and the studio layer's `.btn {
   * box-shadow: none }` comes later in the cascade with the same weight, so
   * "Play a sample", "Practise this kind", "Record my voice" and the "Today"
   * and "Course" buttons on a finished lesson read as plain bold text.
   */
  const BUTTONS = `<div class="card">
      <button class="btn btn--ghost">Play a sample</button>
      <button class="btn btn--danger">Reset</button>
    </div>
    <div class="done-hero"><button class="btn btn--on-hero">Course</button></div>`;
  const hasEdge = (page: ReturnType<typeof styledPage>, selector: string) =>
    (page.value(selector, 'border-top-style') !== 'none' && page.px(selector, 'border-top-width') > 0) ||
    page.value(selector, 'box-shadow') !== 'none';

  it.each(EVERY)('keep their outline (%s)', (_, viewer) => {
    const page = styledPage(viewer, BUTTONS);
    for (const selector of ['.btn--ghost', '.btn--danger', '.btn--on-hero']) {
      expect(hasEdge(page, selector), `${name(viewer)}: ${selector}`).toBe(true);
    }
  });
});

describe('the sidebar on a desktop', () => {
  /*
   * playful.css switches the navigation's backdrop filter off, but it wrote
   * the plain property and then the -webkit- one, and the minifier kept only
   * the prefixed copy, which Chromium ignores. The older saturate-and-blur
   * filter stayed on, and in dark mode the sidebar showed a bluer rectangle
   * behind its links.
   */
  it.each(EVERY)('has no backdrop filter in the shipped CSS (%s)', (_, viewer) => {
    const page = styledPage(viewer, SHELL);
    expect(page.value('.nav', 'backdrop-filter')).toBe('none');
  });
});

describe('the course level tabs', () => {
  /*
   * The tabs once ran to the screen edges as a borderless scroller, which is
   * what their -1rem side margins were for. They became a bordered box and
   * kept the margins, so the box sat 16px left of every other card.
   */
  it.each(named(PHONE, DESKTOP))('line up with the cards below them (%s)', (_, viewer) => {
    const page = styledPage(viewer, '<main class="main"><div class="course"><div class="levels"></div></div></main>');
    expect(page.px('.levels', 'margin-left')).toBe(0);
    expect(page.px('.levels', 'margin-right')).toBe(0);
  });
});

describe('the finished-lesson card', () => {
  /*
   * The card is the same yellow in both themes, but the score ring and the
   * next-lesson button took the theme's green and blue, which turn pastel in
   * dark mode: 1.27:1 and 1.39:1 against the yellow, a washed-out halo and a
   * button with no edge.
   */
  const HERO = `<div class="done-hero">
    <div class="score-ring score-ring--passed"><svg class="score-ring__dial"><circle class="score-ring__value"></circle></svg></div>
    <a class="done-hero__next" href="/lesson/x"><span class="done-hero__next-title">Next</span></a>
  </div>`;

  it.each(EVERY)('keeps its ring and its next button visible on the yellow (%s)', (_, viewer) => {
    const page = styledPage(viewer, HERO);
    const card = page.value('.done-hero', 'background');
    expect(contrast(page.value('.score-ring__value', 'stroke'), card), `${name(viewer)}: ring`).toBeGreaterThanOrEqual(3);
    const next = page.value('.done-hero__next', 'background');
    expect(contrast(next, card), `${name(viewer)}: next button`).toBeGreaterThanOrEqual(3);
    expect(contrast(page.value('.done-hero__next', 'color'), next), `${name(viewer)}: next label`).toBeGreaterThanOrEqual(4.5);
  });
});

describe('the five milestones of the daily plan', () => {
  /*
   * Tiles two to five are fixed pastels; tile one took the theme's soft
   * accent, which is dark navy in dark mode. One tile of five sank into the
   * page while the others glowed, and read like a highlighted step.
   */
  const STEPS = `<ol class="daily-plan__steps">${[1, 2, 3, 4, 5]
    .map((n) => `<li><span>0${n}</span><strong>Step ${n}</strong></li>`)
    .join('')}</ol>`;

  it.each(EVERY)('are drawn alike (%s)', (_, viewer) => {
    const page = styledPage(viewer, STEPS);
    const tiles = [...document.querySelectorAll('.daily-plan__steps li > span')];
    const borders = new Set(tiles.map((tile) => page.value(tile, 'border-top-color')));
    expect(borders.size, `${name(viewer)}: one border colour`).toBe(1);
    for (const [index, tile] of tiles.entries()) {
      const fill = page.value(tile, 'background');
      const ink = page.value(tile, 'color');
      expect(contrast(fill, ink), `${name(viewer)}: tile ${index + 1} is readable`).toBeGreaterThanOrEqual(4.5);
      expect(luminance(fill), `${name(viewer)}: tile ${index + 1} is a pastel with dark ink`).toBeGreaterThan(luminance(ink));
    }
  });
});

describe('the dachshund', () => {
  /*
   * The mark is navy ink: ears, outline and face. In the top bar and the
   * sidebar it sits on a yellow disc, but beside "Give it a go!" on a phrase
   * card it sat straight on the card, and in dark mode navy on the dark card
   * is 1.14:1 — only the tan face was left.
   */
  it('brings its own yellow disc, so its ink shows on any card', () => {
    const { container } = render(<DackelMark />);
    const svg = container.querySelector('svg')!;
    const disc = svg.firstElementChild!;
    expect(disc.tagName.toLowerCase()).toBe('circle');
    // The whole drawing, not a spot behind the face.
    const viewBox = svg.getAttribute('viewBox')!.split(' ').map(Number);
    expect(Number(disc.getAttribute('r')) * 2).toBe(viewBox[2]);
    const ink = svg.querySelector('path')!.getAttribute('stroke')!;
    expect(contrast(ink, disc.getAttribute('fill')!)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('the answer comparison after a wrong answer', () => {
  /*
   * "Expected" was centred on its row. On a phone the speaker button wraps
   * under the expected sentence, the row doubles in height, and the label
   * ended up beside the button rather than the sentence — closer to "You
   * wrote" than to its own answer. The labels now sit on the first line of
   * what they label.
   */
  it.each(named(PHONE, DESKTOP))('puts each label on the first line of its answer (%s)', (_, viewer) => {
    const page = styledPage(
      viewer,
      `<dl class="feedback__compare"><dt>You wrote</dt><dd class="feedback__given">Guten Morgen</dd>
       <dt>Expected</dt><dd class="feedback__expected">Ja, einen Kaffee, bitte.<button class="audio-btn">Play</button></dd></dl>`,
    );
    for (const item of document.querySelectorAll('.feedback__compare > *')) {
      const own = page.value(item, 'align-self');
      const aligned = own === 'auto' || own === 'normal' ? page.value('.feedback__compare', 'align-items') : own;
      expect(aligned, item.textContent!).toMatch(/baseline/);
    }
  });
});

describe('the phone tab bar in Bulgarian', () => {
  /*
   * Five equal tabs on a 320–360px phone leave 50–58px for each word, and
   * "Повторение" needs 59: it showed as "Повторе…" on the most common
   * Android width. Its neighbours' words are short, so a label may now use a
   * little of the space beside it before it is cut.
   */
  it.each([320, 360])('lets a long word use some of its neighbours’ room (%ipx)', (width) => {
    const page = styledPage({ width }, SHELL);
    const room = page.value('.nav__label', 'max-width');
    expect(room).toMatch(/^calc\(100% \+ /);
    const extra = room.replace(/^calc\(100% \+ (.*)\)$/, '$1');
    // Nine pixels is what "Повторение" lacks at 320px.
    expect(extra.endsWith('rem') ? parseFloat(extra) * 16 : parseFloat(extra)).toBeGreaterThanOrEqual(9);
  });
});

describe('Settings with large text', () => {
  /*
   * With the browser's text size at 200%, the badge and the Rename button
   * grow with it, and the learner's name — which has no width of its own —
   * was squeezed to nothing; the content figures were laid out in 12rem
   * columns that no longer fit the card, so the page scrolled sideways.
   */
  it.each(named(PHONE, DESKTOP))('wraps the learner row and the figures rather than losing them (%s)', (_, viewer) => {
    const page = styledPage(
      viewer,
      `<ul class="learners"><li class="learners__row is-active"><span class="learners__name">Me</span>
        <span class="learners__badge">studying now</span><button class="btn btn--quiet btn--sm">Rename</button></li></ul>
       <ul class="content-stats"><li>Lessons written: <strong>84</strong></li></ul>`,
    );
    expect(page.value('.learners__row', 'flex-wrap')).toBe('wrap');
    // A name keeps a width that grows with the text, so it is the row that
    // wraps when the text is large, not the name that vanishes.
    expect(page.declared('.learners__name', 'min-width')).toMatch(/^[\d.]+rem$/);
    expect(page.value('.content-stats', 'grid-template-columns')).toMatch(/minmax\(min\(12rem,\s*100%\)/);
  });
});
