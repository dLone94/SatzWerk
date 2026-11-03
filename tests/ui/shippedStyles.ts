import { readFileSync } from 'node:fs';
import { transform } from 'lightningcss';

/**
 * The app's stylesheet as a phone or a desktop browser would apply it, for
 * tests that run in jsdom.
 *
 * Three things stand between the CSS files and what a learner sees, and jsdom
 * does none of them. The build runs the three layers through Vite's own
 * minifier (lightningcss), and that minifier has dropped a declaration
 * before. The media queries decide which rules apply, and jsdom ignores
 * every rule inside one. And the colours are tokens, which
 * jsdom leaves as var(). So the files are minified here exactly as the build
 * does it, the media queries are settled for one viewport and colour scheme,
 * and values are read back with their tokens filled in.
 *
 * jsdom does cascade what is left by specificity and order, which is what
 * these tests are about: which rule wins. It has no layout, so nothing here
 * measures a box. Its selector matching has gaps of its own: an element
 * matches `:nth-child(n+2)` only when it is the second child, for one.
 */

/** In the order src/main.tsx imports them, which is the order they ship in. */
const LAYERS = ['src/styles.css', 'src/studio.css', 'src/playful.css'];

/**
 * The browsers the build writes its CSS for, in Vite's own terms: Vite's
 * default ("baseline widely available"), which vite.config.ts leaves alone.
 * Written down rather than read from Vite, because Vite only works it out
 * asynchronously while loading its config. tests/ui/shippedStyles.test.ts
 * holds this, the minifier and its copy of lightningcss against what Vite
 * resolves, so a new Vite or a target set in the config fails there instead
 * of leaving these tests checking CSS the build no longer ships.
 */
export const BUILD_CSS_TARGET = ['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4'];

/** The same list as lightningcss takes it, converted the way Vite converts it. */
const BROWSERS: Record<string, string> = { chrome: 'chrome', edge: 'edge', firefox: 'firefox', safari: 'safari', ios: 'ios_saf', opera: 'opera' };
const TARGETS = Object.fromEntries(
  BUILD_CSS_TARGET.map((entry) => {
    const [, browser, major, minor = '0'] = entry.match(/^([a-z]+)(\d+)(?:\.(\d+))?$/)!;
    return [BROWSERS[browser!]!, (Number(major) << 16) | (Number(minor) << 8)];
  }),
);

let shipped: string | undefined;

/** The CSS the build writes to dist/assets. */
export function shippedCss(): string {
  if (shipped === undefined) {
    const source = LAYERS.map((path) => readFileSync(path, 'utf8')).join('\n');
    shipped = new TextDecoder().decode(
      transform({ filename: 'index.css', code: Buffer.from(source), minify: true, targets: TARGETS }).code,
    );
  }
  return shipped;
}

export interface Viewer {
  /** CSS pixels. */
  width: number;
  dark?: boolean;
}

const REM = 16;

const length = (value: string) => (value.endsWith('rem') ? parseFloat(value) * REM : parseFloat(value));

/** Whether one media query list matches. Only the features the app's CSS uses are understood. */
function matches(media: string, viewer: Viewer): boolean {
  return media.split(',').some((query) =>
    query.split(/\band\b/).every((part) => {
      const feature = part.replace(/[()\s]/g, '');
      let found: RegExpMatchArray | null;
      if ((found = feature.match(/^width(<=|>=|<|>)([\d.]+(?:px|rem))$/))) {
        const limit = length(found[2]!);
        return { '<=': viewer.width <= limit, '>=': viewer.width >= limit, '<': viewer.width < limit, '>': viewer.width > limit }[
          found[1] as '<=' | '>=' | '<' | '>'
        ];
      }
      if ((found = feature.match(/^(max|min)-width:([\d.]+(?:px|rem))$/))) {
        const limit = length(found[2]!);
        return found[1] === 'max' ? viewer.width <= limit : viewer.width >= limit;
      }
      if (feature === 'prefers-color-scheme:dark') return Boolean(viewer.dark);
      if (feature === 'prefers-color-scheme:light') return !viewer.dark;
      // A browser tab with a mouse and no reduced-motion setting.
      if (/^(prefers-reduced-motion:reduce|display-mode:standalone|pointer:coarse)$/.test(feature)) return false;
      throw new Error(`shippedStyles does not understand the media feature "${part.trim()}"`);
    }),
  );
}

/**
 * The shipped CSS with every media query settled: matching blocks unwrapped
 * in place, the rest removed.
 *
 * Tokens that only :root defines are also written in. jsdom throws away a
 * shorthand such as `border: 2px solid var(--line)` whole, so without this a
 * border drawn with a token would look like no border at all. A token that
 * some element redefines for its own content is left for `value()` to
 * resolve, element by element.
 */
function settled(viewer: Viewer): string {
  const probe = document.createElement('style');
  probe.textContent = shippedCss();
  document.head.append(probe);
  const flatten = (rules: CSSRuleList): CSSRule[] =>
    [...rules].flatMap((rule) =>
      rule instanceof CSSMediaRule ? (matches(rule.media.mediaText, viewer) ? flatten(rule.cssRules) : []) : [rule],
    );
  const rules = flatten(probe.sheet!.cssRules);
  const atRoot = new Map<string, string>();
  const elsewhere = new Set<string>();
  for (const rule of rules) {
    if (!(rule instanceof CSSStyleRule)) continue;
    for (const property of [...rule.style].filter((name) => name.startsWith('--'))) {
      if (rule.selectorText === ':root') atRoot.set(property, rule.style.getPropertyValue(property).trim());
      else elsewhere.add(property);
    }
  }
  let text = rules.map((rule) => rule.cssText).join('\n');
  for (let round = 0; round < 10; round++) {
    const next = text.replace(/var\((--[\w-]+)(?:,\s*[^()]*)?\)/g, (whole, name: string) =>
      atRoot.has(name) && !elsewhere.has(name) ? atRoot.get(name)! : whole,
    );
    if (next === text) break;
    text = next;
  }
  probe.remove();
  return text;
}

/**
 * Puts `html` in the page under the app's styles as `viewer` would see them,
 * replacing whatever an earlier call put there.
 */
export function styledPage(viewer: Viewer, html: string) {
  document.getElementById('shipped-styles')?.remove();
  const style = document.createElement('style');
  style.id = 'shipped-styles';
  style.textContent = settled(viewer);
  document.head.append(style);
  document.body.innerHTML = html;

  const element = (target: string | Element) => {
    const found = typeof target === 'string' ? document.querySelector(target) : target;
    if (!found) throw new Error(`Nothing matches ${String(target)}`);
    return found;
  };

  /** A custom property as the element inherits it. */
  const token = (from: Element, name: string): string => {
    for (let at: Element | null = from; at; at = at.parentElement) {
      const value = getComputedStyle(at).getPropertyValue(name).trim();
      if (value) return value;
    }
    return '';
  };

  /** The computed value with every var() replaced, the way a browser substitutes them. */
  const value = (target: string | Element, property: string): string => {
    const at = element(target);
    let text = getComputedStyle(at).getPropertyValue(property).trim();
    for (let round = 0; round < 10 && text.includes('var('); round++) {
      text = text.replace(/var\((--[\w-]+)(?:,\s*([^()]*))?\)/g, (_, name: string, fallback?: string) => token(at, name) || fallback || '');
    }
    return text;
  };

  /** A length in pixels: plain px or rem, or a calc() that adds them. */
  const px = (target: string | Element, property: string): number => {
    const text = value(target, property);
    const terms = text.replace(/^calc\((.*)\)$/, '$1').split(/\s*\+\s*/);
    return terms.reduce((sum, term) => {
      if (!/^-?[\d.]+(px|rem)$/.test(term)) throw new Error(`${property} is "${text}", not a length this can add up`);
      return sum + length(term);
    }, 0);
  };

  /**
   * What the last rule for exactly this selector writes, as written. For the
   * cases where the unit matters: jsdom turns rem into px when it computes.
   */
  const declared = (selector: string, property: string): string => {
    const rules = [...style.sheet!.cssRules].filter(
      (rule): rule is CSSStyleRule => rule instanceof CSSStyleRule && rule.selectorText === selector,
    );
    return rules.map((rule) => rule.style.getPropertyValue(property).trim()).filter(Boolean).at(-1) ?? '';
  };

  return { element, value, px, declared };
}

/** sRGB colour from #rgb, #rrggbb or rgb()/rgba(). */
export function rgb(colour: string): [number, number, number] {
  const text = colour.trim().toLowerCase();
  const hex = text.match(/^#([\da-f]{3}|[\da-f]{6})$/);
  if (hex) {
    const digits = hex[1]!.length === 3 ? [...hex[1]!].map((d) => d + d) : hex[1]!.match(/../g)!;
    return digits.map((d) => parseInt(d, 16)) as [number, number, number];
  }
  const fn = text.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (fn) return [Number(fn[1]), Number(fn[2]), Number(fn[3])];
  throw new Error(`Not a colour this can read: "${colour}"`);
}

/** WCAG relative luminance: 0 for black, 1 for white. */
export function luminance(colour: string): number {
  const [r, g, b] = rgb(colour).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two opaque colours. */
export function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}
