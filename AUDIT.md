# SatzWerk app audit

Audit of `dLone94/SatzWerk`, starting from `main` at `6dfccf0`, on 2026-10-02.

SatzWerk teaches German through active production: reading short teaching
sections, answering authored exercises, retyping corrections, passing mastery
checks, and revisiting words and grammar through spaced repetition. English
and Bulgarian are separate teaching paths. Progress belongs to a household
learner and lives in SQLite locally or PostgreSQL when hosted. The curriculum
currently includes 84 lessons across Pre-A1–B2, 654 vocabulary entries, and
13 playable real-life conversations.

The strongest parts are the correction loop, the authored curriculum, durable
progress, and the clear mobile learning screen. The most consequential bugs
found in this audit involved retries and concurrent writes, rather than the
normal single-request path. Those bugs are fixed in this change.

## Verified bugs fixed

| Issue | How it failed | Change and regression coverage |
| --- | --- | --- |
| Retried learning writes counted twice | If the server saved an answer but its acknowledgement was lost, the outbox retried its write ID. Both HTTP adapters dropped that ID, and the API saved the same work again. | Both adapters forward `Idempotency-Key`. Schema migration 7 adds per-learner receipts. The work and successful acknowledgement commit together; matching retries return that acknowledgement. Tests cover parallel retries, different payloads using the same key, learner isolation, rollback, reopening the database, Node/Vercel adapters, and separate PostgreSQL instances. |
| Initial password could be overwritten | Two setup requests could both accept the unconfigured account and both return success, leaving only the second password valid. | The first password uses an atomic conditional update. Only one request succeeds; the other receives 409. The winning password and session remain valid. Tested on SQLite and across PostgreSQL instances. |
| Independent settings changes erased each other | Concurrent language and daily-target changes each read the old profile and replaced the entire row. | Profile patches update only the fields supplied. Tests preserve independent language, target, name, and onboarding changes on both databases. |
| Simultaneous review grades lost progress | Two requests read the same review item and each replaced its schedule and counts. Initialization could also overwrite a schedule created by another request. | Review grading locks the item before reading within a transaction. Initialization creates or locks without replacing an existing schedule. Six simultaneous grades preserve all six successes, including across PostgreSQL instances. |
| Adding a learner could move unsaved work to them | Adding someone immediately selected their cookie, bypassing the existing switch guard. A partial minute of study could also remain in memory when switching. | Adding and switching first keep the current learner's partial minute and flush their queue. Pending work blocks the handover. Settings explains the wait and preserves the entered name if adding fails. Tests verify no learner-creation request is sent while an answer is waiting, and that the partial minute stays with its learner. |
| Missing assets became cached HTML | A removed JavaScript bundle or audio recording received the SPA's HTML with status 200, making it eligible for the service worker's static cache. | Missing asset paths return 404 and `Cache-Control: no-store` locally; Vercel’s SPA rewrite also excludes static assets and APIs. App routes still receive the SPA document. HTTP regression tests cover missing scripts, recordings, fonts, and the asset manifest. |
| Advanced review used beginner metadata | A mixed review round supplied a generic Pre-A1 level, giving a B2 word beginner dictation replay limits and beginner AI explanation context. | The player resolves the current step's target level for replay limits and explanations. A real B2 vocabulary target is tested with the advanced replay budget. |

Requests without a write ID remain compatible. Receipts apply to learning
writes, not account-management or AI requests. They do not retrospectively
repair duplicate work saved before this change. Receipts are retained until
that learner's progress is reset; no time-based expiry is introduced, because
an old offline queue may still retry a write.

## Design and usability changes

The app now has a German studio design: forest green, warm paper and citrus
highlights, a desktop sidebar, a mobile bottom bar, clearer typography, and a
postcard illustration on the next-lesson card. Dark mode uses the same visual
hierarchy. Dashboard rhythm and goal cards use actual stored study data.

The course opens the current unit, summarizes closed units with completion and
checkpoint status, and offers a direct jump to the next lesson or eligible
checkpoint. Keyboard forward navigation focuses the new page heading,
including lazily loaded routes; browser Back retains its existing behavior.

Study time now counts visible teaching, exercise, conversation, vocabulary and
writing screens. Account/navigation screens do not count. Hidden time is
excluded; inactivity pauses credit after two minutes. Partial minutes use the
same durable queue as answers and must be sent before learner handover. The
policy is described in Settings and the desktop timer state is visible.

## Validation

- **1,076 tests passed across 78 files**, with PostgreSQL tests enabled against
  a disposable local PostgreSQL 16.14 instance. No database tests were skipped.
- **`npm run build` passed**, including TypeScript checking.
- **Production HTTP smoke checks passed**, including nested lesson and review
  routes.
- **`npm audit` reported zero known dependency vulnerabilities** at audit time.
- **64 browser page variants passed** automated WCAG 2 A/AA and WCAG 2.1 AA
  checks: 15 routes in both teaching languages and both color schemes, at
  320–390 px mobile widths, plus desktop dashboard/course variants. Each had one page title and no horizontal overflow.
- Browser journeys completed an English lesson with a wrong answer, required
  correction, and mastery check; a unit checkpoint; and a Bulgarian bakery
  conversation. Deliberately dropping the first answer's acknowledgement
  caused two sends of the same write ID and only one stored answer. No browser
  JavaScript errors were observed.
- Keyboard activation of a navigation link focused the new page title in
  Chromium. Eleven desktop routes also fit without horizontal overflow at
  1280 px.
- A real Chromium browser verified that the installed service worker reopens
  the app offline, shows the connection screen, and automatically loads
  progress when the connection returns.

Two existing test timing problems were also corrected: the player test helper
now waits for a scheduled choice submission before interacting again, and the
automatic-retry test completes asynchronous timer updates before asserting.

Run the regression checks with Node 22.18 or later; this audit used Node
22.23.3, matching the project's Node 22 CI runtime:

```sh
npm test -- --maxWorkers=3
npm run build
npm audit
npm run smoke -- http://localhost:8787
```

To include PostgreSQL checks, set `TEST_DATABASE_URL` to a **disposable test
database** before running the tests. The parity tests recreate its public
schema. The production smoke command requires a running app at the supplied
URL. Migration 7 runs through the existing startup migration mechanism.

## Follow-up implementation

| Improvement | Result |
| --- | --- |
| Startup JavaScript | Route components, curriculum levels, vocabulary, grammar and scenarios load on demand. Generated navigation/progress metadata is checked against authored content. Initial JavaScript fell from 2,503,698 to about 1,202,000 bytes (52% less). Under 150 ms latency, 200,000 bytes/s download and 4× CPU throttling, the first usable dashboard fell from 15.3 s to about 8.8 s. These are controlled Chromium measurements, not physical-phone timings. |
| Offline downloads | Startup precaching covers 14 assets / about 1.54 MB and has a 2 MiB build budget. Course controls explicitly save one level. Visited assets and recordings still cache; APIs never do. The browser startup JavaScript budget is 1,400,000 bytes. Fresh offline opening shows connection guidance; an open lesson keeps answers. |
| Browser CI | A permanent Chromium job covers onboarding, correction/retyping/mastery, checkpoint, Bulgarian conversation, lost acknowledgements, learner handover, offline downloads/continuation/reopening/recovery, failed content downloads, keyboard focus and both-language light/dark accessibility. Reports and screenshots are retained as CI artifacts. |
| Daily study metric | Learning screens, background exclusion and a two-minute idle cutoff are implemented and tested, including durable partial minutes and handover. |
| Course navigation | Collapsible unit summaries, contextual opening and lesson/checkpoint jumps are implemented; checkpoint selection is tested in both teaching languages. |
| Receipts and diagnostics | Exact acknowledgements are losslessly compressed; legacy receipts remain readable and can be compacted explicitly. Keys/fingerprints never expire. Aggregate storage reporting, request IDs and structured retry/refusal/conflict/database/queue-age diagnostics exclude private payloads. |
| Teaching content | Representative B1/B2 and Bulgarian explanations were reviewed. Incorrect subject/verb-omission guidance and overgeneralized formal-request/genitive claims were corrected. Structural/answer checks remain automatic. A qualified educator's sign-off remains pending; see [the review record](docs/TEACHING_REVIEW.md). |
| Phone speech and reminders | Automated error-path coverage and a concrete iOS/Android release matrix are available. Physical phones, microphone hardware, installed-app behavior and real push delivery remain unverified; see [device checks](docs/DEVICE_CHECKS.md). |

Use [the operations guide](docs/OPERATIONS.md) for browser setup, download
budgets, safe request diagnostics and receipt maintenance. No deployment or
live reminders were triggered.

## Daily practice addition — 2026-10-07

The dashboard now opens a guided practice flow: meet three useful phrases,
review due items and recurring mistakes, recall and adapt a sentence frame,
rehearse an authored conversation, then listen and repeat. Learners choose an
everyday, travel, work or exam goal and a level from Pre-A1 to B2. The flow
reuses the existing curriculum and conversations, with distinct exercise IDs
so practice does not falsely complete a course lesson.

Whole phrases enter spaced review. Vocabulary reviews also use authored
example sentences once a word has been recalled successfully, and noun/article
drills require the article. English-only and Bulgarian-only phrases stay on
their teaching path. Short grammar reminders support corrections in both
languages. Seven authored sentence frames provide useful substitutions without
assuming that arbitrary words fit a gap.

The new screens use the studio design in both color schemes and on phones.
Weekly goals count actual answer days; practical progress reports conversations
rehearsed and their first-try practice results. Optional microphone recordings
stay in temporary browser blobs and are released on exit. Speech recognition
reports what it heard and does not award an accent score. Audio permission or
availability cannot block the typing path.

Migration 8 adds learner preferences and daily runs on SQLite and PostgreSQL.
Completed parts survive reopening through the durable, idempotent outbox.
Out-of-order saves cannot rewind progress; learner handover waits for pending
writes. Retrying a failed part save does not count its conversation twice.
An unfinished part can restart, while its individual answers remain recorded.
Exam practice exercises language skills rather than simulating an official exam.

- **1,104 tests passed across 81 files**, including PostgreSQL checks against a
  disposable PostgreSQL 16.14 database. No database tests were skipped.
- **Production build and TypeScript checks passed** on Node 22.23.3.
- **72 browser page variants passed** automated accessibility and layout checks
  across both languages, both themes, mobile and desktop. Ten browser journeys
  completed, including daily practice, local recording with a synthetic
  microphone, resume, correction and offline recovery. No browser JavaScript
  errors or automated accessibility violations were observed.
- Initial JavaScript remains below the 1,400,000-byte budget at **1,274,324
  bytes**. The controlled cold-start measurement was **8.9 seconds** at 150 ms
  latency, 200,000 bytes/s download and 4× CPU throttling; this is not a
  physical-phone timing.
- Regression coverage includes both teaching paths, every goal and level,
  phrase transfer, recurring-mistake variations, strict progress validation,
  retries, offline queues, resume, learner isolation, and progress reset.

## Playful illustrated revision — 2026-10-07

The user's selected direction replaces the muted studio presentation with an
illustrated dachshund and neighbourhood scene, sunny yellow, blue and coral.
Dashboard, practice, onboarding, course navigation, brand and home-screen
icons now share the character. Practice uses speech bubbles and coloured
milestones; course lessons follow a winding trail with their real saved states.
Readability, correction and keyboard interactions remain the learning focus.
The asset and theme details are documented in [the design notes](docs/DESIGN.md).

The production illustration is a transparent WebP of approximately 526 KB.
Missing illustration/WebP requests return missing-asset responses locally and
are excluded from Vercel's SPA rewrite. Existing network-first caching keeps
visited artwork; illustrations are not added to automatic startup precaching.

- **171 relevant regression tests passed** across six files, covering learning,
  navigation, daily practice, correction, static image serving and Vercel routing.
- **Production build and TypeScript checks passed.**
- **72 browser variants and 10 journeys passed**, with no browser JavaScript
  errors or automated accessibility violations. Nine additional design previews
  covered phone/desktop screens, both languages and dark mode; a dark-mode
  lesson-time contrast defect found in those previews was corrected.
- Initial JavaScript was **1,275,407 bytes**, below the existing 1,400,000-byte
  budget. Controlled cold startup was **10.0 seconds** under the same 150 ms
  latency, 200,000 bytes/s download and 4× CPU throttling conditions. These are
  controlled browser measurements, not physical-phone results.

## Scope and limits

The review covered the frontend routes and player, progress and review engine,
content validation, learner ownership, password/session handling, HTTP adapters,
database drivers and migrations, outbox behavior, service worker, and responsive
accessibility. It combined source review, the existing suite, new regression
tests, production HTTP requests, and browser checks. It is not a guarantee that
every possible defect has been eliminated.

Live Anthropic calls, delivery through real push services, microphone hardware,
Safari/iOS behavior, and an actual hosted Vercel deployment were not exercised.
The serverless adapter and PostgreSQL behavior were tested locally. The app is
a shared household tutor, not an independently authenticated multi-tenant
service; learner selection is not a separate security boundary.
