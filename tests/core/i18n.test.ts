import { describe, expect, it } from 'vitest';
import { UI, tr } from '../../src/i18n.ts';
import type { UiKey } from '../../src/i18n.ts';
import type { TeachingLanguage } from '../../src/content/types.ts';

/**
 * The interface strings themselves. Both paths are authored, so both have to
 * read like real language: a counter that says "1 дни" or "1 days" is a bug in
 * the Bulgarian path and the English one alike.
 */

const LANGS: TeachingLanguage[] = ['en', 'bg'];

describe('interface strings', () => {
  it('has both paths filled in for every key', () => {
    for (const [key, value] of Object.entries(UI)) {
      expect(value.en.trim(), `${key} (en)`).not.toBe('');
      expect(value.bg.trim(), `${key} (bg)`).not.toBe('');
    }
  });

  it('uses the singular form when a counter reads one', () => {
    expect(tr('statStreakDays', 'en', { n: 1 })).toBe('1 day');
    expect(tr('statStreakDays', 'bg', { n: 1 })).toBe('1 ден');
    expect(tr('statStreakDays', 'en', { n: 4 })).toBe('4 days');
    expect(tr('statStreakDays', 'bg', { n: 4 })).toBe('4 дни');
    expect(tr('vocabCount', 'bg', { n: 1 })).toBe('1 дума');
    expect(tr('vocabCount', 'bg', { n: 155 })).toBe('155 думи');
    expect(tr('settingsMinutes', 'en', { n: 1 })).toBe('1 minute');
    expect(tr('wordFailures', 'bg', { n: 1 })).toBe('1 неуспешно припомняне');
  });

  it('gives every singular variant a plural to fall back to, and vice versa', () => {
    for (const key of Object.keys(UI)) {
      if (!key.endsWith('One')) continue;
      const base = key.slice(0, -'One'.length);
      expect(base in UI, `${key} has no plural sibling ${base}`).toBe(true);
      for (const lang of LANGS) {
        // A singular variant only makes sense if it still shows the number.
        expect(UI[key as UiKey][lang], `${key} (${lang})`).toContain('{n}');
      }
    }
  });

  it('leaves no placeholder unfilled once its variables are supplied', () => {
    for (const key of Object.keys(UI) as UiKey[]) {
      for (const lang of LANGS) {
        // Fill whatever the string itself asks for, so a new placeholder cannot
        // be introduced without tr being able to substitute it.
        const vars: Record<string, string | number> = {};
        for (const match of UI[key][lang].matchAll(/\{([a-zA-Z]+)\}/g)) {
          vars[match[1]!] = match[1] === 'n' ? 2 : 'x';
        }
        const text = tr(key, lang, vars);
        expect(text, `${key} (${lang})`).not.toMatch(/\{[a-zA-Z]+\}/);
      }
    }
  });

  it('asks for the same placeholders in both paths', () => {
    const names = (text: string) =>
      [...text.matchAll(/\{([a-zA-Z]+)\}/g)].map((m) => m[1]!).sort();
    for (const key of Object.keys(UI) as UiKey[]) {
      expect(names(UI[key].bg), key).toEqual(names(UI[key].en));
    }
  });
});
