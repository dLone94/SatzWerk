import { dirname } from 'node:path';
import { createRequire } from 'node:module';
import { resolveConfig } from 'vite';
import { describe, expect, it } from 'vitest';
import viteConfig from '../../vite.config.ts';
import { BUILD_CSS_TARGET } from './shippedStyles.ts';

/**
 * The tests that read "the shipped CSS" minify it themselves, the way the
 * build does. That is only true while it stays true: a missed declaration in
 * the minifier's output was a real bug once, and a helper that drifted from
 * the build would go on passing while checking CSS nobody is sent.
 */
describe('the shipped-CSS helper', () => {
  it('minifies for the browsers, with the minifier and the options, that the build uses', async () => {
    const config = await resolveConfig({ ...viteConfig, configFile: false, logLevel: 'silent' }, 'build');
    expect(config.build.cssTarget).toEqual(BUILD_CSS_TARGET);
    // Vite minifies CSS with lightningcss unless it is told to use esbuild.
    expect(config.build.cssMinify).toBeTruthy();
    expect(config.build.cssMinify).not.toBe('esbuild');
    // The helper passes lightningcss no options of its own, so the build must not either.
    expect(config.css.lightningcss).toBeUndefined();
  });

  it('uses the copy of lightningcss that Vite uses', () => {
    const here = createRequire(import.meta.url);
    const vite = createRequire(here.resolve('vite/package.json'));
    expect(dirname(here.resolve('lightningcss'))).toBe(dirname(vite.resolve('lightningcss')));
  });
});
