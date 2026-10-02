import '@testing-library/jest-dom/vitest';

// Direct component tests don't enter through App's content-loading boundary.
// Give them authored content; browser journeys verify the real lazy boundary.
const content = await import('../src/content/browser.ts');
await Promise.all([content.ensureContent('/session'), content.ensureContent('/placement'),
  content.ensureContent(`/scenario/${content.SCENARIO_SCRIPTS[0]!.id}`)]);
