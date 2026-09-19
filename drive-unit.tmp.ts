import { chromium, type Page } from 'playwright';
const SHOT = '/tmp/claude-0/-home-user-SatzWerk/1fc4b926-e908-57d8-bf1c-a1996e6be681/scratchpad';
const base = 'http://127.0.0.1:4180';
const lang = (process.argv[2] ?? 'en') as 'en' | 'bg';
const lessons = process.argv.slice(3);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
const errors: string[] = [];
page.on('pageerror', (e) => errors.push('PAGE ERROR: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

await page.goto(base);
await page.waitForLoadState('networkidle');
const anyPath = page.getByRole('button', { name: /Explain German to me|Обяснявай ми немския/i }).first();
if (await anyPath.isVisible().catch(() => false)) {
  await anyPath.click();
  const s = page.getByRole('button', { name: /Start learning|Започни да учиш/i }).first();
  if (await s.isVisible().catch(() => false)) await s.click();
  await page.waitForLoadState('networkidle');
}
await page.goto(`${base}/settings`);
await page.waitForLoadState('networkidle');
await page.getByRole('button', { name: lang === 'en' ? 'English' : 'Български', exact: true }).first().click();
await page.waitForTimeout(600);

async function walk(page: Page, lessonId: string) {
  await page.goto(`${base}/lesson/${lessonId}`);
  await page.waitForLoadState('networkidle');
  const title = (await page.locator('h1').first().innerText().catch(() => '?')).trim();
  let typed = 0, advances = 0;
  for (let step = 0; step < 400; step += 1) {
    const textarea = page.locator('.task textarea:not([disabled])').first();
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill('Ich möchte mich um die Stelle bewerben, um mich weiterzuentwickeln. An deiner Stelle würde ich zum Hausarzt gehen, denn im Bad ist Schimmel.');
      await page.keyboard.press('Control+Enter');
      await page.waitForTimeout(280);
      typed += 1;
    }
    const input = page.locator('.task input[type="text"]:not([disabled])').first();
    if (await input.isVisible().catch(() => false)) {
      const target = page.locator('.feedback__retype-target').first();
      const retyping = await target.isVisible().catch(() => false);
      await input.fill(retyping ? ((await target.innerText()) ?? '').trim() : 'xxx');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(170);
      typed += 1;
      if (typed > 220) break;
      continue;
    }
    const choices = page.locator('.task .choice, .task button.choice');
    if ((await choices.count()) > 0) { await choices.first().click(); await page.waitForTimeout(170); }
    const next = page.getByRole('button', { name: /^(Continue|Next|Start|Продължи|Напред|Започни|Към упражненията)/i }).first();
    if (!(await next.isVisible().catch(() => false))) break;
    await next.click();
    await page.waitForTimeout(150);
    advances += 1;
  }
  console.log(`  ${lessonId} [${lang}] "${title}" — ${advances} advances, ${typed} answers`);
}

for (const id of lessons) await walk(page, id);
console.log(errors.length === 0 ? `  no page errors [${lang}]` : '  ERRORS:\n' + errors.join('\n'));
await browser.close();
