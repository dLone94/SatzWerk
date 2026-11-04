import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { CURRICULUM, SCENARIO_SCRIPTS, VOCABULARY } from '../src/content/index.ts';
import { tr } from '../src/i18n.ts';
import { chooseDailyScript, dailyListening, phraseRecall } from '../src/ui/dailyBuilder.ts';
import { todayHere } from '../src/core/progress/days.ts';

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
/*
 * The first download stays what it was: three.js and the wooden scenes are a
 * chunk of their own, fetched only by WoodScene's dynamic import, never part
 * of the entry or of what the service worker downloads on install. The entry
 * was 327 kB before the scenes; they may add their small component and
 * strings to it, and no more.
 */
const ENTRY_BUDGET_BYTES = 340_000;
const builtFiles = JSON.parse(await readFile('dist/asset-manifest.json', 'utf8'));
const built = async path => readFile('dist' + path, 'utf8');
const entryPath = builtFiles.precache.find(path => /^\/assets\/index-[^/]+\.js$/.test(path));
assert.ok(entryPath, 'The build names its entry chunk');
const entrySource = await built(entryPath);
assert.ok(Buffer.byteLength(entrySource) <= ENTRY_BUDGET_BYTES, `The entry chunk is ${Buffer.byteLength(entrySource)} bytes; its budget is ${ENTRY_BUDGET_BYTES}`);
const threeChunks = [];
for (const path of builtFiles.files.filter(path => path.endsWith('.js'))) {
  if ((await built(path)).includes('WebGLRenderer')) threeChunks.push(path);
}
assert.equal(threeChunks.length, 1, 'three.js is in exactly one chunk');
assert.ok(!builtFiles.precache.includes(threeChunks[0]), 'The scene chunk is not downloaded on install');
assert.ok(entrySource.includes(threeChunks[0].split('/').pop()), 'The entry reaches the scene chunk only by name, through import()');
const bundle = { entryPath, entryBytes: Buffer.byteLength(entrySource), sceneChunk: threeChunks[0], sceneBytes: Buffer.byteLength(await built(threeChunks[0])) };

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
// `reading`: a lesson's teaching sections come between its questions, each
// with its own short try, so between questions the way on is the section's
// primary button (Next, Try it, Final check). `on` is the page to play in.
async function play(exercises, lang, finished, wrongOnce = false, reading = false, on = page) {
  const steps = new Map(exercises.flatMap(exercise => exercise.steps.map(step => [step.id, { step, kind: exercise.kind }])));
  let slipped = false;
  let answered = 0;
  for (let action = 0; action < 250; action++) {
    if (await finished()) return { answered, slipped };
    const continuation = on.getByRole('button', { name: tr('exerciseContinue', lang), exact: true });
    if (await continuation.count()) {
      await continuation.click();
      continue;
    }
    const task = on.locator('[data-step-id]');
    const onward = on.locator('.section-nav .btn--primary');
    if (reading && !await task.count() && await onward.count()) {
      await onward.click();
      continue;
    }
    if (!await task.count()) {
      await eventually(async () => await finished() || await task.count() > 0 || await continuation.count() > 0);
      continue;
    }
    const id = await task.getAttribute('data-step-id');
    const entry = steps.get(id);
    assert.ok(entry, 'Authored step exists: ' + id);
    const { step, kind } = entry;
    const retyping = await on.locator('.feedback__retype-label').count() > 0;
    const textbox = on.getByRole('textbox');
    if (await textbox.count()) {
      let answer = step.answer.accepted[0];
      if (retyping) answer = await on.locator('#player-retype-target').innerText();
      else if (wrongOnce && !slipped && kind !== 'freeWriting') {
        answer = 'völlig falsch';
        slipped = true;
      }
      await textbox.fill(answer);
      await textbox.press(kind === 'freeWriting' ? 'Control+Enter' : 'Enter');
    } else {
      const choice = step.choices.find(choice => choice.id === step.correctChoiceId);
      await task.locator('.choice').filter({ has: on.locator('.choice__de', { hasText: choice.de }) }).click();
    }
    answered++;
    await eventually(async () => await finished() || await continuation.count() > 0 ||
      (!retyping && await on.locator('.feedback__retype-label').count() > 0));
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
  // Today offers a new learner one start, and it is on the first screen of a
  // phone: it used to be the third of four, below the fold.
  await open('/');
  assert.equal(await page.locator('#main .btn--primary').count(), 1, 'Today has one primary action');
  const todayStart = page.locator('.today-plan__cta');
  assert.equal((await todayStart.innerText()).trim(), tr('todayPracticeStart', 'en'));
  const startBox = await todayStart.boundingBox();
  assert.ok(startBox.y + startBox.height < 700, `Today's start is above the fold on a phone (bottom at ${startBox.y + startBox.height})`);
  // A daily session uses real API writes, survives a reload between parts,
  // and rehearses whole phrases without claiming course-lesson completion.
  await todayStart.click();
  await page.getByRole('button', { name: tr('dailyStart', 'en'), exact: true }).click();
  await page.getByRole('button', { name: tr('dailyNextPhrase', 'en'), exact: true }).waitFor();
  await page.screenshot({ path: report + '/daily-phrase-mobile.png', fullPage: true });
  const dailyPhraseAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  observations.push({ path: '/daily#phrases', violations: dailyPhraseAxe.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })) });
  for (let phrase = 0; phrase < 2; phrase++) await page.getByRole('button', { name: tr('dailyNextPhrase', 'en'), exact: true }).click();
  await page.getByRole('button', { name: tr('dailyPutToUse', 'en'), exact: true }).click();
  // The review part, saved: due items, or the note that nothing is due.
  await page.locator('[data-step-id]').or(page.getByText(tr('dailyReviewClearNote', 'en'), { exact: true })).waitFor();
  await page.reload();
  await page.getByRole('button', { name: tr('dailyResume', 'en'), exact: true }).waitFor();
  await page.getByRole('button', { name: tr('dailyResume', 'en'), exact: true }).click();
  // The day's conversation changes from day to day; a new learner is at Pre-A1 with everyday goals.
  // Chosen from the catalog, played from the full script, which has the answers.
  const dailyId = chooseDailyScript('everyday', 'pre-a1', [], todayHere()).id;
  const daily = SCENARIO_SCRIPTS.find(script => script.id === dailyId);
  const dailyExercises = [...phraseRecall(daily, 'en'),
    ...daily.beats.filter(beat => beat.who === 'you').map(beat => beat.exercise), ...dailyListening(daily, 'en')];
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
  // The finish counts what was done, with the day's goal and week, and
  // offers the one next step Today would: for a new learner, lesson 1.
  await page.locator('.daily-finished .rhythm [aria-current="date"].rhythm__day--practised').waitFor();
  assert.equal(await page.locator('#main .btn--primary').count(), 1, 'The finish offers one next step');
  assert.equal(await page.locator('.daily-finished__next .btn--primary').getAttribute('href'), '/lesson/' + CURRICULUM[0].units[0].lessons[0].id);
  const finishAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  observations.push({ path: '/daily#finished', violations: finishAxe.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })) });
  await page.screenshot({ path: report + '/daily-finished-mobile.png', fullPage: true });
  await eventually(async () => (await (await context.request.get(base + '/api/state')).json()).dailyRuns.some(run => run.stage === 5));
  const dailyState = await (await context.request.get(base + '/api/state')).json();
  assert.equal(dailyState.dailyRuns[0].stage, 5);
  assert.equal(dailyState.dailyRuns[0].listeningCompleted, true);
  assert.equal(dailyState.lessons.length, 0, 'Daily rehearsal does not complete a lesson');
  assert.ok(dailyState.reviewItems.some(item => item.refId.startsWith('p-daily-')), 'Whole phrases enter spaced review');
  observations.push({ journey: 'Daily practice, reload and resume, wrong answer and correction, conversation, listening, local voice recording', result: dailyResult, passed: true });
  // Back on Today the practice is done, and no longer offered as the day's start.
  await open('/');
  await page.locator('.today-plan').getByText(tr('todayPracticeDone', 'en'), { exact: false }).first().waitFor();
  assert.equal(await page.getByRole('link', { name: tr('todayPracticeStart', 'en'), exact: true }).count(), 0, 'A finished practice is not offered as today\'s start');
  assert.ok(await page.locator('#main .btn--primary').count() <= 1, 'Today still has at most one primary action');
  await page.screenshot({ path: report + '/today-after-practice.png', fullPage: true });
  observations.push({ journey: 'Today leads into daily practice and moves on once it is done', passed: true });
  // The daily goal met: Today is done for the day, says what was done, and
  // offers more only as a quiet button. That card was never scanned, so it is
  // here, in both schemes, with the minutes a quick headless run cannot earn.
  const tzOffsetMinutes = await page.evaluate(() => -new Date().getTimezoneOffset());
  const studied = await context.request.post(base + '/api/study', {
    headers: { 'X-Requested-With': 'SatzWerk' }, data: { seconds: 25 * 60, tzOffsetMinutes },
  });
  assert.equal(studied.status(), 200);
  for (const colorScheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme });
    await open('/');
    await page.locator('.today-plan--done').waitFor();
    assert.equal(await page.locator('#main .btn--primary').count(), 0, 'A finished day has no primary action');
    assert.equal(await page.locator('.today-plan .btn--ghost').count(), 1, 'Keeping going is offered, quietly');
    const doneAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    observations.push({ path: '/#done', colorScheme, violations: doneAxe.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })) });
    await page.screenshot({ path: report + `/today-done-${colorScheme}.png`, fullPage: true });
  }
  await page.emulateMedia({ colorScheme: 'light' });
  observations.push({ journey: 'Today is done for the day once the goal is met', passed: true });

  await open('/lesson/' + lesson.id);
  // Lesson 1 has the learner type German on its second screen.
  await page.locator('.section-nav .btn--primary').click();
  await page.locator('.example__de', { hasText: 'Hallo!' }).waitFor();
  await page.getByRole('button', { name: tr('lessonTryIt', 'en'), exact: true }).click();
  await page.locator('[data-step-id="u1l1-ex0-s1"]').waitFor();
  loseAcknowledgement = true;
  const result = await play([...lesson.exercises, ...lesson.mastery.exercises], 'en', async () => await page.locator('.done-hero').count() > 0, true, true);
  assert.equal(result.slipped, true);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await eventually(async () => copies >= 2);
  const state = await (await context.request.get(base + '/api/state')).json();
  assert.equal(state.stats.totalAnswers, writes.size);
  assert.ok(state.lessons.find(item => item.lessonId === lesson.id).completedAt);
  await page.screenshot({ path: report + '/lesson-complete.png', fullPage: true });
  observations.push({ journey: 'English lesson 1: German typed on its second screen, tries between sections, wrong answer and retype, mastery, lost acknowledgement retry', result, receiptCopies: copies, uniqueAttempts: writes.size });
  /*
   * A finished lesson's "Next" is on the first screen of a phone, above the
   * floating tab bar, however its titles wrap: the lesson's, the next one's
   * ("Nouns: capital letters and der / die / das" is two lines) and the
   * longer Bulgarian of both. It sat under the bar on the first lesson every
   * new learner finishes.
   */
  const nextPlaces = {};
  const nextAboveTabBar = async name => {
    for (const lang of ['en', 'bg']) {
      if ((await page.locator('html').getAttribute('lang')) !== lang) {
        await page.locator(`.lang-toggle__btn[lang="${lang}"]`).click();
        await eventually(async () => (await page.locator('html').getAttribute('lang')) === lang);
      }
      for (const [width, height] of [[320, 640], [375, 667], [390, 760]]) {
        await page.setViewportSize({ width, height });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(150);
        const place = await page.evaluate(() => ({
          next: Math.round(document.querySelector('.done-hero__next').getBoundingClientRect().bottom),
          bar: Math.round(document.querySelector('nav.nav').getBoundingClientRect().top),
          tower: Math.round(document.querySelector('.done-hero__tower').getBoundingClientRect().height),
        }));
        nextPlaces[`${name} ${lang} ${width}x${height}`] = place;
        assert.ok(place.next <= place.bar, `${name} (${lang}, ${width}x${height}): "Next" ends at ${place.next}px, under the tab bar at ${place.bar}px`);
        assert.ok(place.tower >= 120, `${name} (${lang}, ${width}x${height}): the tower keeps its height (${place.tower}px)`);
      }
    }
    await page.locator('.lang-toggle__btn[lang="en"]').click();
    await eventually(async () => (await page.locator('html').getAttribute('lang')) === 'en');
    await page.setViewportSize({ width: 390, height: 844 });
  };
  await nextAboveTabBar(lesson.id);
  const secondLesson = CURRICULUM[0].units[0].lessons[1];
  await open('/lesson/' + secondLesson.id);
  await play([...secondLesson.exercises, ...secondLesson.mastery.exercises], 'en', async () => await page.locator('.done-hero').count() > 0, false, true);
  await nextAboveTabBar(secondLesson.id);
  observations.push({ journey: 'A finished lesson keeps "Next" above the tab bar on short phones, in English and Bulgarian', nextPlaces, passed: true });
  await open('/checkpoint/' + checkpoint.id);
  await page.locator('.btn--primary').last().click();
  const checkpointResult = await play(checkpoint.exercises, 'en', async () => await page.locator('.score-ring').count() > 0);
  observations.push({ journey: 'English unit checkpoint', result: checkpointResult });
  await context.request.patch(base + '/api/profile', { headers: { 'X-Requested-With': 'SatzWerk' }, data: { teachingLanguage: 'bg' } });
  await open('/scenario/' + scenario.id);
  await page.getByRole('button', { name: tr('scenarioStart', 'bg'), exact: true }).click();
  const scenarioTurns = scenario.beats.filter(beat => beat.who === 'you').map(beat => beat.exercise);
  // The learner's own lines, once one is said: dark ink on the sand bubble,
  // in both schemes. They were pale text on sand, 1.2:1.
  await play(scenarioTurns, 'bg', async () => await page.locator('.chat__bubble--you').count() > 0);
  for (const colorScheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme });
    const answeredAxe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    observations.push({ path: '/scenario#answered', colorScheme, violations: answeredAxe.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })) });
  }
  await page.emulateMedia({ colorScheme: 'light' });
  const scenarioResult = await play(scenarioTurns, 'bg', async () => await page.locator('.score-ring').count() > 0);
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
  // Read on until a question is on screen: a try between sections, or the
  // exercises after them.
  for (let screen = 0; screen < 20 && !await offlinePage.locator('[data-step-id]').count(); screen++) {
    await offlinePage.locator('.section-nav .btn--primary').click();
  }
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
  assert.equal(await offlinePage.locator('.today-plan').count(), 0, 'Offline reopening does not invent progress');
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
  await coldPage.locator('.today-plan').waitFor();
  const firstUsableMs = Date.now() - started;
  const resources = await coldPage.evaluate(() => performance.getEntriesByType('resource').filter(entry => entry.name.endsWith('.js')).map(entry => ({ name: entry.name.split('/').pop(), bytes: entry.decodedBodySize })));
  // The scene chunk is fetched once Today is usable and the page is idle; it
  // is not part of the start, and on a slow line it can land before this is
  // read. It is counted on its own, and must not have held up the page.
  const sceneName = bundle.sceneChunk.split('/').pop();
  const javascriptBytes = resources.filter(resource => resource.name !== sceneName).reduce((bytes, resource) => bytes + resource.bytes, 0);
  assert.ok(javascriptBytes < 1_400_000, 'Initial JavaScript stays below the startup budget');
  const metrics = { firstUsableMs, javascriptBytes, resources, conditions: { latencyMs: 150, downloadBytesPerSecond: 200000, cpuSlowdown: 4 } };
  await writeFile(report + '/performance.json', JSON.stringify(metrics, null, 2));
  observations.push({ journey: 'Throttled cold startup', ...metrics });
  await cold.close();

  /*
   * The wooden scenes, drawn. The browser above has no WebGL and gets the
   * pictures they replace; this one has a software renderer, and each scene
   * has to put a real frame on its canvas: Today's town, the course's board,
   * a question's rail with typing in its slot, and the swap after a wrong
   * answer one word off. Then a quick back and forth between pages, which
   * must give every WebGL context back: a browser holds about sixteen and
   * says so in the console when a page runs through them.
   */
  const glBrowser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const glContext = await glBrowser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  // Every WebGL draw call counted, to see a scene come to rest.
  await glContext.addInitScript(() => {
    window.__draws = 0;
    for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      for (const name of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
        const original = proto[name];
        if (typeof original !== 'function') continue;
        proto[name] = function (...args) { window.__draws++; return original.apply(this, args); };
      }
    }
  });
  const glPage = await glContext.newPage();
  const glErrors = [];
  glPage.on('pageerror', error => glErrors.push(error.message));
  glPage.on('console', message => {
    if (message.type() === 'error' || /WebGL|THREE/i.test(message.text())) glErrors.push(`${message.type()}: ${message.text()}`);
  });
  const glOpen = async path => {
    await glPage.goto(base + path);
    await glPage.locator('#main h1').waitFor();
    await glPage.locator('.route-loading').waitFor({ state: 'hidden' });
  };
  /** How much of a scene's canvas is drawn: distinct colours, and the share unlike its first pixel. */
  const drawn = async (selector, settle = 1500) => {
    const canvas = glPage.locator(`${selector}.is-live .wood-scene__canvas`);
    await canvas.waitFor({ timeout: 20_000 });
    await glPage.waitForTimeout(settle);
    const png = (await canvas.screenshot()).toString('base64');
    return glPage.evaluate(async data => {
      const image = new Image();
      image.src = 'data:image/png;base64,' + data;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const colours = new Set();
      let unlike = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        colours.add(((pixels[i] >> 3) << 10) | ((pixels[i + 1] >> 3) << 5) | (pixels[i + 2] >> 3));
        if (Math.abs(pixels[i] - pixels[0]) + Math.abs(pixels[i + 1] - pixels[1]) + Math.abs(pixels[i + 2] - pixels[2]) > 30) unlike++;
      }
      return { colours: colours.size, covered: unlike / (pixels.length / 4) };
    }, png);
  };
  const scenes = {};
  const expectDrawn = async (name, selector, settle) => {
    scenes[name] = await drawn(selector, settle);
    assert.ok(scenes[name].colours > 150 && scenes[name].covered > 0.1, `${name}: the scene drew a real frame (${JSON.stringify(scenes[name])})`);
  };
  await glOpen('/');
  await expectDrawn('today', '.today-plan .wood-scene');
  assert.match(await glPage.locator('.today-plan .wood-scene__label').textContent(), /\S/, 'The town is described');
  assert.equal(await glPage.locator('.today-plan .wood-scene__stage').getAttribute('aria-hidden'), 'true', 'The canvas itself says nothing');
  // The engine is fetched once the page and its content are in, and the
  // line has been quiet a while: never alongside what the learner waits for.
  const fetchOrder = await glPage.evaluate(chunk => {
    const resources = performance.getEntriesByType('resource');
    const engine = resources.find(entry => entry.name.endsWith(chunk));
    // Code fetched before it, not the engine's own pieces fetched with it.
    const others = resources.filter(entry => entry !== engine && /\.js(\?|$)/.test(entry.name) && entry.startTime < (engine?.startTime ?? 0));
    return { engineStart: engine?.startTime ?? -1, othersEnd: Math.max(...others.map(entry => entry.responseEnd)) };
  }, bundle.sceneChunk.split('/').pop());
  assert.ok(fetchOrder.engineStart >= fetchOrder.othersEnd + 1500, `The scene chunk waits for a quiet line (${JSON.stringify(fetchOrder)})`);
  await glPage.screenshot({ path: report + '/scene-today.png' });
  // Once its story is told and a few seconds have passed with nothing
  // happening, the town rests: no frame is drawn until something does.
  const settledAfter = await glPage.evaluate(async () => {
    const start = performance.now();
    while (performance.now() - start < 25_000) {
      const before = window.__draws;
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (window.__draws === before) return Math.round(performance.now() - start);
    }
    return -1;
  });
  assert.ok(settledAfter >= 0, 'Today\'s town comes to rest instead of drawing for as long as it is open');
  scenes.todaySettledAfterMs = settledAfter;
  await glOpen('/course');
  await expectDrawn('course', '.course-welcome .wood-scene');
  // The board is decoration with a name; the lessons are still the links.
  assert.ok(await glPage.locator('.trail-stop__link').count() > 0, 'The lesson list is still the way into lessons');
  await glPage.screenshot({ path: report + '/scene-course.png' });
  // "Ich komme ___ Bulgarien.": the rail, then one wrong word.
  const gapLesson = CURRICULUM[0].units.flatMap(unit => unit.lessons).find(item => item.id === 'pre-a1-u2-l4');
  await glOpen('/lesson/' + gapLesson.id);
  await play([...gapLesson.exercises, ...gapLesson.mastery.exercises], 'en',
    async () => await glPage.locator('[data-step-id="u2l4-ex2-s2"]').count() > 0, false, true, glPage);
  await glPage.getByRole('textbox').pressSequentially('au');
  await expectDrawn('question', '.wood-scene--question');
  assert.equal(await glPage.locator('.wood-scene--question .wood-scene__stage').getAttribute('aria-hidden'), 'true', 'The rail repeats the sentence beside it');
  await glPage.screenshot({ path: report + '/scene-question.png' });
  await glPage.getByRole('textbox').fill('von');
  await glPage.getByRole('textbox').press('Enter');
  await expectDrawn('feedback', '.wood-scene--feedback');
  await glPage.getByRole('button', { name: tr('sceneShowAgainLabel', 'en'), exact: true }).click();
  await glPage.screenshot({ path: report + '/scene-feedback.png', fullPage: true });
  // The lesson to its finish: its new words stacked into the tower, drawn
  // for real, with a description beside it and no paper confetti on top.
  await play([...gapLesson.exercises, ...gapLesson.mastery.exercises], 'en',
    async () => await glPage.locator('.done-hero').count() > 0, false, true, glPage);
  // Measured once the blocks have landed: the tower is built in about four seconds.
  await expectDrawn('lesson-complete', '.done-hero .wood-scene--complete', 6000);
  assert.ok(await glPage.locator('.done-hero .wood-scene__label [lang="de"]').count() > 0, 'The tower says which German words it stacks');
  assert.equal(await glPage.locator('.done-hero .wood-scene--complete .wood-scene__stage').getAttribute('aria-hidden'), 'true');
  assert.equal(await glPage.locator('.done-hero .confetti').count(), 0, 'A drawn tower has its own chips, not the paper confetti as well');
  await glPage.screenshot({ path: report + '/scene-lesson-complete.png' });
  // The day's finish, for a learner of its own: the first one has had
  // today's phrases already, and a phrase met before stacks no block.
  assert.equal((await glContext.request.post(base + '/api/learners', { headers: { 'X-Requested-With': 'SatzWerk' }, data: { name: 'Tower' } })).status(), 200);
  await glPage.goto(base + '/');
  await glPage.locator('#main h1').waitFor();
  const glOnboard = glPage.getByRole('button', { name: tr('onboardingStart', 'en'), exact: true });
  if (await glOnboard.count()) await glOnboard.click();
  await glOpen('/daily');
  await glPage.getByRole('button', { name: tr('dailyStart', 'en'), exact: true }).click();
  await glPage.getByRole('button', { name: tr('dailyNextPhrase', 'en'), exact: true }).waitFor();
  for (let phrase = 0; phrase < 2; phrase++) await glPage.getByRole('button', { name: tr('dailyNextPhrase', 'en'), exact: true }).click();
  await glPage.getByRole('button', { name: tr('dailyPutToUse', 'en'), exact: true }).click();
  await glPage.locator('[data-step-id]').or(glPage.getByText(tr('dailyReviewClearNote', 'en'), { exact: true })).waitFor();
  await glPage.reload();
  await glPage.getByRole('button', { name: tr('dailyResume', 'en'), exact: true }).click();
  await play(dailyExercises, 'en', async () => await glPage.getByRole('button', { name: tr('dailyFinish', 'en'), exact: true }).count() > 0, false, false, glPage);
  await glPage.getByRole('button', { name: tr('dailyFinish', 'en'), exact: true }).click();
  await glPage.getByRole('heading', { name: tr('dailyFinished', 'en'), exact: true }).waitFor();
  await expectDrawn('daily-finish', '.daily-finished .wood-scene--complete', 6000);
  assert.ok(await glPage.locator('.daily-finished .wood-scene__label [lang="de"]').count() > 0, 'The day\'s tower says which German words it stacks');
  assert.equal(await glPage.locator('.daily-finished .confetti').count(), 0, 'The day\'s drawn tower has no paper confetti on top');
  await glPage.screenshot({ path: report + '/scene-daily-finish.png' });
  // The day's phrases are the longest a tower carries: its box is the
  // lesson finish's size on a phone, not the dachshund's 210 x 140 thumbnail.
  for (const width of [320, 390]) {
    await glPage.setViewportSize({ width, height: 844 });
    await glPage.waitForTimeout(400);
    const box = await glPage.locator('.daily-finished .wood-scene--complete').boundingBox();
    assert.ok(box.height >= 170 && box.width >= width - 90, `The day's tower is large enough to read at ${width}px (${Math.round(box.width)} x ${Math.round(box.height)})`);
    scenes[`daily-finish-${width}`] = { width: Math.round(box.width), height: Math.round(box.height) };
    await glPage.locator('.daily-finished .wood-scene--complete').screenshot({ path: report + `/scene-daily-finish-${width}.png` });
  }
  await glPage.setViewportSize({ width: 390, height: 844 });
  // Within the app, as a learner taps between tabs: the engine is in hand
  // after the first scene, so each visit makes a context and gives it back.
  await glOpen('/');
  await glPage.locator('.today-plan .wood-scene.is-live').waitFor({ timeout: 20_000 });
  for (let visit = 0; visit < 12; visit++) {
    await glPage.locator(`a.nav__item[href="${visit % 2 ? '/' : '/course'}"]`).click();
    await glPage.waitForTimeout(400);
  }
  await expectDrawn('today-again', '.wood-scene');
  await glContext.close();
  await glBrowser.close();
  assert.deepEqual(glErrors, []);
  observations.push({ journey: 'Wooden scenes drawn with WebGL, every context given back, the first download unchanged', bundle, scenes, passed: true });
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
