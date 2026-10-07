import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { CURRICULUM, SCENARIO_SCRIPTS, VOCABULARY } from '../src/content/index.ts';
import { tr } from '../src/i18n.ts';
import { dailyListening, phraseRecall } from '../src/ui/dailyBuilder.ts';

// Always use an isolated, disposable database. No deployment or learner data
// is involved. CI installs Chromium; local runs can point to system Chromium.
const port = process.env.SATZWERK_E2E_PORT || '8790';
const base = `http://127.0.0.1:${port}`;
const report = 'artifacts/browser';
await mkdir(report, { recursive: true });
const temporary = await mkdtemp(join(tmpdir(), 'satzwerk-browser-'));
const server = spawn(process.execPath, ['server/main.ts'], {
  env: { PATH: process.env.PATH, TZ: 'UTC', PORT: port, HOST: '127.0.0.1', SATZWERK_DB: join(temporary, 'test.db') },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', data => { serverLog += data.toString(); });
server.stderr.on('data', data => { serverLog += data.toString(); });
for (let attempt = 0; ; attempt++) {
  // Never mistake another app already using this port for our test server.
  if (server.exitCode !== null) { await rm(temporary, { recursive: true, force: true }); throw new Error('Browser server exited: ' + serverLog); }
  try { if (serverLog.includes('[satzwerk] listening on') && (await fetch(base + '/api/health')).ok) break; } catch {}
  if (attempt === 100) { server.kill(); throw new Error('Browser server did not start: ' + serverLog); }
  await new Promise(resolve => setTimeout(resolve, 100));
}
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, headless: true,
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] }).catch(async error => {
  server.kill('SIGTERM');
  await new Promise(resolve => server.once('exit', resolve));
  await rm(temporary, { recursive: true, force: true });
  throw error;
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('requestfailed', request => console.log('Network failure', request.url(), request.failure()?.errorText));
const observations = [];
const writes = new Map();
let loseAcknowledgement = false;
let lostKey;
let copies = 0;
await page.route('**/api/attempts', async route => {
  const request = route.request();
  const key = request.headers()['idempotency-key'];
  const body = request.postDataJSON();
  writes.set(key, body);
  if (key === lostKey) copies++;
  if (loseAcknowledgement && !body.isRetype) {
    loseAcknowledgement = false;
    lostKey = key;
    copies = 1;
    const response = await route.fetch();
    assert.equal(response.status(), 200);
    await route.abort('failed');
  } else await route.continue();
});

async function open(path) {
  await page.goto(base + path);
  await page.locator('#main').waitFor();
  await page.locator('.boot__skeleton').waitFor({ state: 'hidden' });
  await page.locator('.route-loading').waitFor({ state: 'hidden' });
  await page.locator('#main h1').waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function eventually(check) {
  for (let count = 0; count < 100; count++) {
    if (await check()) return;
    await page.waitForTimeout(100);
  }
  throw new Error('Expected browser state did not arrive');
}
async function play(exercises, lang, finished, wrongOnce = false) {
  const steps = new Map(exercises.flatMap(exercise => exercise.steps.map(step => [step.id, { step, kind: exercise.kind }])));
  let slipped = false;
  let answered = 0;
  for (let action = 0; action < 250; action++) {
    if (await finished()) return { answered, slipped };
    const continuation = page.getByRole('button', { name: tr('exerciseContinue', lang), exact: true });
    if (await continuation.count()) {
      await continuation.click();
      continue;
    }
    const task = page.locator('[data-step-id]');
    if (!await task.count()) {
      await eventually(async () => await finished() || await task.count() > 0 || await continuation.count() > 0);
      continue;
    }
    const id = await task.getAttribute('data-step-id');
    const entry = steps.get(id);
    assert.ok(entry, 'Authored step exists: ' + id);
    const { step, kind } = entry;
    const retyping = await page.locator('.feedback__retype-label').count() > 0;
    const textbox = page.getByRole('textbox');
    if (await textbox.count()) {
      let answer = step.answer.accepted[0];
      if (retyping) answer = await page.locator('#player-retype-target').innerText();
      else if (wrongOnce && !slipped && kind !== 'freeWriting') {
        answer = 'völlig falsch';
        slipped = true;
      }
      await textbox.fill(answer);
      await textbox.press(kind === 'freeWriting' ? 'Control+Enter' : 'Enter');
    } else {
      const choice = step.choices.find(choice => choice.id === step.correctChoiceId);
      await task.locator('.choice').filter({ has: page.locator('.choice__de', { hasText: choice.de }) }).click();
    }
    answered++;
    await eventually(async () => await finished() || await continuation.count() > 0 ||
      (!retyping && await page.locator('.feedback__retype-label').count() > 0));
  }
  throw new Error('Learning flow exceeded 250 actions');
}

try {
  await open('/');
  if (await page.getByRole('button', { name: tr('onboardingStart', 'en'), exact: true }).count()) {
    await page.getByRole('button', { name: tr('onboardingStart', 'en'), exact: true }).click();
  }
  assert.equal((await (await context.request.get(base + '/api/state')).json()).profile.onboarded, true);
  observations.push({ journey: 'Onboarding', passed: true });
  const lesson = CURRICULUM[0].units[0].lessons[0];
  const checkpoint = CURRICULUM[0].units[0].checkpoint;
  const scenario = SCENARIO_SCRIPTS[0];
  const routes = ['/', '/daily', '/course', '/review', '/session', '/vocabulary', '/mistakes', '/coach', '/settings',
    '/real-life', '/placement', '/more', '/lesson/' + lesson.id, '/checkpoint/' + checkpoint.id,
    '/scenario/' + scenario.id, '/vocabulary/' + VOCABULARY[0].id];
  for (const lang of ['en', 'bg']) {
    const response = await context.request.patch(base + '/api/profile', {
      headers: { 'X-Requested-With': 'SatzWerk' }, data: { teachingLanguage: lang },
    });
    assert.equal(response.status(), 200);
    for (const dark of [false, true]) {
      await page.emulateMedia({ colorScheme: dark ? 'dark' : 'light' });
      for (const path of routes) {
        await page.setViewportSize({ width: dark ? 390 : 320, height: 844 });
        await open(path);
        assert.equal(await page.locator('html').getAttribute('lang'), lang);
        assert.equal(await page.locator('h1').count(), 1, path + ' has a page title');
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        assert.equal(overflow, false, path + ' has no horizontal overflow');
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        observations.push({ lang, dark, width: dark ? 390 : 320, path, violations: axe.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => node.target) })) });
      }
      console.log('Page checks finished:', lang, dark ? 'dark' : 'light');
    }
  }
  await context.request.patch(base + '/api/profile', { headers: { 'X-Requested-With': 'SatzWerk' }, data: { teachingLanguage: 'en' } });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.setViewportSize({ width: 390, height: 844 });
  // A daily session uses real API writes, survives a reload between parts,
  // and rehearses whole phrases without claiming course-lesson completion.
  await open('/daily');
  await page.getByRole('button', { name: tr('dailyStart', 'en'), exact: true }).click();
  await page.getByRole('button', { name: tr('dailyNextPhrase', 'en'), exact: true }).waitFor();
  await page.screenshot({ path: report + '/daily-phrase-mobile.png', fullPage: true });
  const dailyPhraseAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  observations.push({ path: '/daily#phrases', violations: dailyPhraseAxe.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })) });
  for (let phrase = 0; phrase < 2; phrase++) await page.getByRole('button', { name: tr('dailyNextPhrase', 'en'), exact: true }).click();
  await page.getByRole('button', { name: tr('dailyPutToUse', 'en'), exact: true }).click();
  await page.locator('[data-step-id]').waitFor();
  await page.reload();
  await page.getByRole('button', { name: tr('dailyResume', 'en'), exact: true }).waitFor();
  await page.getByRole('button', { name: tr('dailyResume', 'en'), exact: true }).click();
  const dailyExercises = [...phraseRecall(scenario, 'en'),
    ...scenario.beats.filter(beat => beat.who === 'you').map(beat => beat.exercise), ...dailyListening(scenario, 'en')];
  const dailyResult = await play(dailyExercises, 'en', async () => await page.getByRole('button', { name: tr('dailyFinish', 'en'), exact: true }).count() > 0, true);
  const shadowAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  observations.push({ path: '/daily#shadow', violations: shadowAxe.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })) });
  await page.getByRole('button', { name: tr('recorderStart', 'en'), exact: true }).click();
  await page.getByRole('button', { name: tr('recorderStop', 'en'), exact: true }).waitFor();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: tr('recorderStop', 'en'), exact: true }).click();
  await page.locator('.shadow-recorder audio').waitFor();
  assert.ok((await page.locator('.shadow-recorder audio').getAttribute('src')).startsWith('blob:'), 'Voice rehearsal remains local');
  await page.getByRole('button', { name: tr('dailyFinish', 'en'), exact: true }).click();
  await page.getByRole('heading', { name: tr('dailyFinished', 'en'), exact: true }).waitFor();
  await eventually(async () => (await (await context.request.get(base + '/api/state')).json()).dailyRuns.some(run => run.stage === 5));
  const dailyState = await (await context.request.get(base + '/api/state')).json();
  assert.equal(dailyState.dailyRuns[0].stage, 5);
  assert.equal(dailyState.dailyRuns[0].listeningCompleted, true);
  assert.equal(dailyState.lessons.length, 0, 'Daily rehearsal does not complete a lesson');
  assert.ok(dailyState.reviewItems.some(item => item.refId.startsWith('p-daily-')), 'Whole phrases enter spaced review');
  observations.push({ journey: 'Daily practice, reload and resume, wrong answer and correction, conversation, listening, local voice recording', result: dailyResult, passed: true });

  await open('/lesson/' + lesson.id);
  await page.locator('.section-nav .btn--primary').click();
  for (let section = 0; section < lesson.sections.length; section++) {
    await page.locator('.section-nav .btn--primary').click();
  }
  loseAcknowledgement = true;
  const result = await play([...lesson.exercises, ...lesson.mastery.exercises], 'en', async () => await page.locator('.done-hero').count() > 0, true);
  assert.equal(result.slipped, true);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await eventually(async () => copies >= 2);
  const state = await (await context.request.get(base + '/api/state')).json();
  assert.equal(state.stats.totalAnswers, writes.size);
  assert.ok(state.lessons.find(item => item.lessonId === lesson.id).completedAt);
  await page.screenshot({ path: report + '/lesson-complete.png', fullPage: true });
  observations.push({ journey: 'English lesson, wrong answer and retype, mastery, lost acknowledgement retry', result, receiptCopies: copies, uniqueAttempts: writes.size });
  await open('/checkpoint/' + checkpoint.id);
  await page.locator('.btn--primary').last().click();
  const checkpointResult = await play(checkpoint.exercises, 'en', async () => await page.locator('.score-ring').count() > 0);
  observations.push({ journey: 'English unit checkpoint', result: checkpointResult });
  await context.request.patch(base + '/api/profile', { headers: { 'X-Requested-With': 'SatzWerk' }, data: { teachingLanguage: 'bg' } });
  await open('/scenario/' + scenario.id);
  await page.getByRole('button', { name: tr('scenarioStart', 'bg'), exact: true }).click();
  const scenarioResult = await play(scenario.beats.filter(beat => beat.who === 'you').map(beat => beat.exercise), 'bg', async () => await page.locator('.score-ring').count() > 0);
  observations.push({ journey: 'Bulgarian real-life conversation', result: scenarioResult });
  await open('/course');
  await page.screenshot({ path: report + '/course-mobile.png', fullPage: true });
  // Compact units open in context, and keyboard navigation moves focus to
  // the new page's heading even when that page arrives as a lazy chunk.
  assert.equal(await page.locator('.unit-path[open]').count(), 1);
  await page.getByRole('link', { name: tr('navToday', 'bg'), exact: true }).first().click();
  await page.locator('#main h1').waitFor();
  await eventually(async () => await page.locator('#main h1').evaluate(element => element === document.activeElement));
  await page.setViewportSize({ width: 1440, height: 1050 });
  for (const colorScheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme });
    for (const path of ['/', '/course', '/daily']) {
      await open(path);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      observations.push({ path, desktop: true, colorScheme, violations: axe.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })) });
      await page.screenshot({ path: report + `/${path === '/' ? 'dashboard' : path.slice(1)}-desktop-${colorScheme}.png`, fullPage: true });
    }
  }
  // The browser is online again before changing learners; each handover gets
  // an independent profile and progress snapshot.
  await context.request.patch(base + '/api/profile', { headers: { 'X-Requested-With': 'SatzWerk' }, data: { teachingLanguage: 'en' } });
  await open('/settings');
  await page.getByLabel(tr('learnersAdd', 'en')).fill('Second learner');
  await page.getByRole('button', { name: tr('learnersSave', 'en'), exact: true }).click();
  await page.getByRole('button', { name: tr('onboardingStart', 'en'), exact: true }).waitFor();
  const handed = await (await context.request.get(base + '/api/state')).json();
  assert.equal(handed.stats.totalAnswers, 0);
  assert.equal(handed.profile.onboarded, false);
  await page.getByRole('button', { name: tr('onboardingStart', 'en'), exact: true }).click();
  observations.push({ journey: 'Learner handover isolates progress', passed: true });

  // A real service worker, cache and lost connection, rather than a mocked
  // fetch: an open lesson keeps answers, and a new learner cannot inherit them.
  const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const offlinePage = await offlineContext.newPage();
  offlinePage.on('pageerror', error => errors.push(error.message));
  await offlinePage.goto(base + '/course');
  await offlinePage.locator('.route-loading').waitFor({ state: 'hidden' });
  await offlinePage.getByRole('button', { name: tr('offlineLevel', 'en'), exact: true }).click();
  await offlinePage.getByRole('button', { name: tr('offlineSaved', 'en'), exact: true }).waitFor();
  const cacheFiles = await offlinePage.evaluate(async () => {
    const keys = await (await caches.open('satzwerk-app-v1')).keys();
    return keys.map(key => new URL(key.url).pathname);
  });
  assert.ok(cacheFiles.some(path => /pre-a1-/.test(path)));
  assert.ok(!cacheFiles.some(path => /\/b2-/.test(path)), 'Saving one level does not download the others');
  // Visit the account screen while online so its complete import graph is
  // cached. Warming a single chunk misses shared components after splitting.
  await offlinePage.goto(base + '/settings');
  await offlinePage.getByLabel(tr('learnersAdd', 'en')).waitFor();
  await offlinePage.goto(base + '/lesson/' + lesson.id);
  await offlinePage.locator('.route-loading').waitFor({ state: 'hidden' });
  await offlinePage.locator('.section-nav .btn--primary').click();
  for (let section = 0; section < lesson.sections.length; section++) await offlinePage.locator('.section-nav .btn--primary').click();
  const stepId = await offlinePage.locator('[data-step-id]').getAttribute('data-step-id');
  const firstStep = lesson.exercises.flatMap(exercise => exercise.steps).find(step => step.id === stepId);
  await offlineContext.setOffline(true);
  if (await offlinePage.getByRole('textbox').count()) {
    await offlinePage.getByRole('textbox').fill(firstStep.answer.accepted[0]);
    await offlinePage.getByRole('textbox').press('Enter');
  } else {
    const choice = firstStep.choices.find(choice => choice.id === firstStep.correctChoiceId);
    await offlinePage.locator('.choice').filter({ has: offlinePage.locator('.choice__de', { hasText: choice.de }) }).click();
  }
  await offlinePage.getByRole('button', { name: tr('exerciseContinue', 'en'), exact: true }).waitFor();
  await offlinePage.locator('.topbar__who').click();
  await offlinePage.getByLabel(tr('learnersAdd', 'en')).fill('Must wait');
  await offlinePage.getByRole('button', { name: tr('learnersSave', 'en'), exact: true }).click();
  await eventually(async () => (await offlinePage.locator('.task__warn').allTextContents()).some(text => text.includes('waiting')));
  assert.ok(await offlinePage.getByLabel(tr('learnersAdd', 'en')).isVisible());
  await offlineContext.setOffline(false);
  await offlinePage.evaluate(() => window.dispatchEvent(new Event('online')));
  await eventually(async () => !(await offlinePage.evaluate(() => {
    const held = localStorage.getItem('satzwerk.outbox.v2');
    return held && JSON.parse(held).queued.length;
  })));
  observations.push({ journey: 'Offline level download, held answer, blocked handover, reconnect', passed: true });
  await offlineContext.setOffline(true);
  await offlinePage.goto(base + '/course');
  await offlinePage.getByRole('heading', { name: tr('offlineTitle', 'en'), exact: true }).waitFor();
  assert.equal(await offlinePage.locator('.today-hero').count(), 0, 'Offline reopening does not invent progress');
  await offlineContext.setOffline(false);
  await offlinePage.evaluate(() => window.dispatchEvent(new Event('online')));
  await offlinePage.locator('#main h1').waitFor();
  observations.push({ journey: 'Fresh offline reopening and automatic recovery', passed: true });
  await offlineContext.close();
  const failedChunk = await browser.newContext({ serviceWorkers: 'block' });
  const failedPage = await failedChunk.newPage();
  await failedPage.route('**/assets/b2-*.js', route => route.abort('failed'));
  await failedPage.goto(base + '/lesson/b2-u1-l1');
  await failedPage.locator('.route-failure').waitFor();
  assert.equal(await failedPage.locator('[data-step-id]').count(), 0, 'Missing content cannot render placeholder answers');
  await failedPage.unroute('**/assets/b2-*.js');
  await failedPage.locator('.route-failure button').click();
  await failedPage.locator('#main h1').waitFor();
  await failedPage.locator('.route-failure').waitFor({ state: 'hidden' });
  observations.push({ journey: 'Missing content download fails safely and retries', passed: true });
  await failedChunk.close();
  // Reproducible cold-start measurement: no worker/cache, modest connection,
  // CPU throttling. The build enforces a separate offline startup byte budget.
  const cold = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const coldPage = await cold.newPage();
  const cdp = await cold.newCDPSession(coldPage);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 90000 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const started = Date.now();
  await coldPage.goto(base + '/');
  await coldPage.locator('.today-hero__cta').waitFor();
  const firstUsableMs = Date.now() - started;
  const resources = await coldPage.evaluate(() => performance.getEntriesByType('resource').filter(entry => entry.name.endsWith('.js')).map(entry => ({ name: entry.name.split('/').pop(), bytes: entry.decodedBodySize })));
  const javascriptBytes = resources.reduce((bytes, resource) => bytes + resource.bytes, 0);
  assert.ok(javascriptBytes < 1_400_000, 'Initial JavaScript stays below the startup budget');
  const metrics = { firstUsableMs, javascriptBytes, resources, conditions: { latencyMs: 150, downloadBytesPerSecond: 200000, cpuSlowdown: 4 } };
  await writeFile(report + '/performance.json', JSON.stringify(metrics, null, 2));
  observations.push({ journey: 'Throttled cold startup', ...metrics });
  await cold.close();
  assert.deepEqual(errors, []);
  assert.equal(observations.filter(item => item.violations?.length).length, 0);
  console.log(JSON.stringify({ checkedPages: observations.filter(item => item.path).length, errors, journeys: observations.filter(item => item.journey) }, null, 2));
} catch (error) {
  console.log('Page at failure:', page.url(), await page.locator('body').innerText());
  await page.screenshot({ path: report + '/failure.png', fullPage: true });
  throw error;
} finally {
  await writeFile(report + '/results.json', JSON.stringify({ observations, errors }, null, 2));
  await browser.close();
  server.kill('SIGTERM');
  await new Promise(resolve => server.once('exit', resolve));
  await writeFile(report + '/server.log', serverLog);
  await rm(temporary, { recursive: true, force: true });
}
