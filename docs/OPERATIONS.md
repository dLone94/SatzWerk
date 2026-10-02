# Verification and diagnostics

Use Node 22.18 or later. `npm ci` installs the locked dependencies. `npm run
dev` starts the local API and Vite; `npm run build` checks types, regenerates
navigation metadata from authored content, and builds production assets.
`npm start` serves the production build. The full curriculum remains available
from `src/content/index.ts` for server, audio generation and content tests;
browser routes use `src/content/browser.ts` and await authored content before
mounting a player. Generated metadata is not playable teaching material.

## Checks

```sh
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:browser
```

`test:browser` starts its own server on port 8790 (override with
`SATZWERK_E2E_PORT`), uses a disposable SQLite database and cleans it up. It
never inherits production database or password configuration. An occupied
port fails rather than using another application's database. For a system
Chromium installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its executable.
Reports, performance measurements and screenshots go to `artifacts/browser`.
The separate CI browser job uploads those files even on failure.

The browser script exercises both languages and color schemes, 320–390 px
mobile layouts and desktop dashboard/course layouts, keyboard route focus,
onboarding, a lesson with a correction and mastery, a checkpoint, Bulgarian
conversation, dropped acknowledgements, learner handover, level downloads,
offline continuation/reopening/recovery, and failed content downloads.

Set `TEST_DATABASE_URL` to a **disposable database** to include PostgreSQL
parity tests. Those tests recreate its public schema. See `AUDIT.md` for the
checks and measurements made during this work.

## Download budgets

The generated `dist/asset-manifest.json` distinguishes all emitted files from
`precache`, the startup dependency graph plus styles/fonts. The build fails
if startup precaching exceeds **2 MiB**, and browser checks fail if initial
JavaScript exceeds **1,400,000 bytes**. The service worker keeps the shell,
visited assets and recordings; it never caches API responses. Each course
level has a manifest-approved download group. Other levels are downloaded
only when needed or explicitly saved. Browser eviction and new builds can
remove saved assets. Fresh offline opening still needs a connection to load
actual progress; an already-open lesson can continue with queued answers.

## Receipts

```sh
npm run diagnostics
npm run diagnostics -- --compact
```

These commands target the database selected by `SATZWERK_DB` or the existing
PostgreSQL environment variables. The default is the local SQLite database.
The first reports receipt count, stored text characters and oldest receipt.
The second losslessly compresses older large JSON acknowledgements. New large
acknowledgements are compressed automatically with a versioned `br1:` prefix;
old JSON acknowledgements remain readable.

**No receipt key or fingerprint expires.** An old queue can retry safely:
the exact original acknowledgement is reconstructed without performing the
write again. Explicit learner progress reset removes that learner's receipts
through the existing reset operation. Compaction neither resets progress nor
changes the response returned to a client. Stored-character counts are not
physical database sizes; PostgreSQL also adds row/index overhead.

## Request diagnostics

Both HTTP adapters supply a server-generated `X-Request-Id`. JSON diagnostics
include request refusals/duration, failures, database unavailability, replayed
writes, fingerprint conflicts and refused writes. The browser records delayed
or refused synchronization with pending count, queue age when known, HTTP
status and request ID. Old queues without timestamps still work; their age is
unknown. Match request IDs between the Network panel and server logs.

Diagnostic fields exclude answers, passwords, cookies, raw request URLs,
learner names, idempotency keys and raw exception messages. Do not add private
payloads to logs while investigating an incident. Live AI, phone hardware and
push delivery require separate checks in `DEVICE_CHECKS.md`; a qualified
teaching review is tracked in `TEACHING_REVIEW.md`.
