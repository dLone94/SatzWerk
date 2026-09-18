# SatzWerk

A personal German tutor built around one idea: **you learn German by producing German.**

SatzWerk teaches from absolute beginner towards CEFR B2, with two separately
authored teaching paths — **English → German** and **Bulgarian → German** — and a
learning loop that always ends in the learner typing German:

```
LEARN → RECALL → TYPE → FEEDBACK → CORRECT → TYPE AGAIN → REVIEW LATER
```

This repository contains **Milestone 2**: the whole Pre-A1 level, authored in
both paths, on top of the Milestone 1 engine.

---

## Quick start

Requires **Node 22.18 or newer** (it runs the TypeScript directly, and uses the
built-in `node:sqlite` driver — no native modules to compile). Nothing else to
install and nothing to configure; see [Hosting it on Vercel](#hosting-it-on-vercel)
if you want it on the internet instead.

```bash
npm install

# Development: Vite on :5173, API server on :8787, proxied together.
npm run dev

# Production-style: build, then one process serves the app and the API on :8787.
npm run preview
```

Then open <http://localhost:5173> (dev) or <http://localhost:8787> (preview).

```bash
npm test          # 224 tests
npm run typecheck # tsc, no emit
npm run build     # type-check + production bundle
```

Your progress lives in a SQLite file at `data/satzwerk.db` (override with
`SATZWERK_DB`). It is a real database on disk, so progress survives a refresh, a
server restart and a cleared browser cache.

---

## Hosting it on Vercel

The app runs locally with no setup at all. Hosting it needs two things it does
not need locally: a database that survives a cold start, and a password.

**Why the database changes.** A Vercel function has no persistent disk, so the
SQLite file would be recreated empty every time a function goes cold —
silently losing exactly the progress this app exists to keep. Hosted
deployments therefore use Postgres. `openDatabase` picks it whenever
`DATABASE_URL` is set and SQLite otherwise, so nothing about local development
or the tests changes.

**Why the password.** Hosted, the app is on a public URL, and
`POST /api/reset` deletes everything. So a hosted deployment with no password
configured refuses every request with a 503 that names what is missing. It
never quietly serves an open app.

1. **Create a free Postgres database.** [Neon](https://neon.tech) works well
   with Vercel and has a free tier. Copy the connection string; it starts
   `postgresql://`.

2. **Set one environment variable** in the Vercel project, for Production and
   Preview both:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | the Neon connection string |

   It is read server-side only, and is not prefixed `VITE_`, so it cannot reach
   the client bundle.

3. **Deploy.** `vercel.json` builds with `npm run build`, serves `dist` as
   static files, and routes `/api/*` to one function. Migrations run on the
   first request after a deploy.

4. **Open the URL and choose a password.** A hosted deployment with no password
   serves one thing and one thing only: a screen asking you to set one. Nothing
   private is reachable until you have, so there is no window in which a fresh
   deployment is readable by whoever finds the address. Afterwards you are
   signed in straight away, and you can change the password under *Settings*.

That is the whole of it — no terminal, and no secrets to copy around. Requiring
a local command to set a password is a poor bargain for something you are meant
to just open in a browser.

### When the hosted app will not load

Open `/api/health` on the deployment. It is public, it is answered before the
database is touched, and it contains no secrets — so it separates the two
failures that look identical from the outside:

- **It answers JSON** (`{"ok":true,...}`) — the function is running. Look at
  `database` in that answer: `postgres` means `DATABASE_URL` is set, `missing`
  means it is not set for *this* environment. Preview and Production are
  configured separately in Vercel, and a variable set for only one of them is
  the usual cause.
- **It does not answer at all** — the function itself is failing to start, and
  Vercel's runtime logs for the deployment say why.

Any request that does need the database now fails within about eight seconds
with a sentence saying so, rather than hanging until the browser gives up.
`SATZWERK_PG_TRANSPORT=http` switches to Neon's HTTP driver if TCP is ever the
problem.

### If you would rather configure it yourself

Two optional variables override the above, for anyone who prefers secrets to
live in the hosting provider rather than the database:

| Variable | Effect |
| --- | --- |
| `SATZWERK_PASSWORD_HASH` | Used instead of the stored password. `npm run hash-password` prints one; it reads the password from stdin rather than an argument, so it stays out of your shell history. The in-app change-password form is disabled when this is set, since it could not take effect. |
| `SATZWERK_SESSION_SECRET` | Used instead of the generated one. |

The session secret is otherwise generated on first run and kept in the
database, so sessions survive a redeploy. Changing the password rotates it,
which signs out every other device.

### One learner, by design

`profile` and `users` each hold one row. Migration 2 adds a `user_id` column to
every progress table so that supporting a second person later is a query change
rather than a migration over live data — but **the queries do not filter by it
yet**, so a second row in `users` would share one set of progress. Nothing
creates one. Until that query pass happens, two people means two deployments
with two databases.

---

## What actually works

Everything in this section has been run and is covered by tests.

**Two teaching paths, authored separately.** Choose English or Bulgarian at
first run; switch any time in Settings or from the header without losing
progress. The Bulgarian path is **not** a translation of the English one. Blocks
of content can be scoped to one path (`only: ['bg']`), so the Bulgarian path
explains German through Bulgarian grammar — the postfixed definite article
(`къща` → `къщата` versus `Haus` → `das Haus`), gender mismatches, the absence of a
German-style case system, the free Bulgarian word order versus German
verb-second — while the English path talks about noun capitalisation, the lack of
grammatical gender and fixed subject–verb order instead.

**Pre-A1 is finished: six units, eighteen lessons, six unit checkpoints and a
level checkpoint.**

| Unit | Lessons | What it teaches |
| --- | --- | --- |
| 1. Welcome to German | Sounds and four extra letters · Nouns: capital letters and der / die / das | ä ö ü ß, w/v/z/s, ei versus ie, typing the special letters; noun capitalisation, three genders, ein/eine, article + noun as one unit |
| 2. First words, first sentences | Hello and goodbye · Please, thank you, excuse me · Introducing yourself · Where you come from, where you live | greetings by time of day, formal versus informal farewells; danke, bitte's three jobs, Entschuldigung; heißen and sein, du versus Sie; kommen/wohnen, aus versus von, wo versus woher, verb in second position |
| 3. Numbers and quantities | Zero to twenty · Twenty to a hundred · Age, prices and phone numbers | 0–20 including the irregular sechzehn and siebzehn; the tens, and why 21 is *einundzwanzig*; sein with an age, wie viel versus wie viele, kosten, reading a number out over the phone |
| 4. Personal information | Countries and languages · Nationality and work · Family, and the verb haben | country names with and without an article (aus der Schweiz); *Ich bin Lehrer* with no article, and how the -in form is built; haben, and *ein* → *einen* in the accusative |
| 5. Time and calendar | Days of the week · Months and birthdays · Telling the time | all seven days (all masculine), am Montag and the verb back in second place; months, im Mai, Wann hast du Geburtstag?; Wie viel Uhr ist es?, and why *halb acht* is 7:30 |
| 6. First grammar consolidation | All the pronouns, sein and haben · Plurals and saying no · Asking questions | all nine pronouns in one table with sein and haben, and why er/sie/es follow the article; plurals and their die, nicht versus kein/keine/keinen; W-questions versus yes/no inversion |
| | **Six unit checkpoints** | each mixes vocabulary, grammar, listening and writing from its own unit |
| | **Pre-A1 level checkpoint** | draws on all six units, 80% to pass, and offers no hints at all |

Across those 18 lessons that is 155 vocabulary entries, 18 grammar concepts, 163 exercises and **484
answer tasks** (including all seven checkpoints), across 94 teaching sections,
all authored in both paths. Only 3.5% of those tasks are multiple choice; the
rest require typing German. 44 of them carry an authored trap answer — a
specific wrong form the learner is likely to produce, with an explanation
written for it. Levels A1–B2 exist as structure and outline only, and the UI
labels them as planned.

**Practice targeted at a kind of mistake, not just at sentences.** Once the
mistake bank shows a real pattern (three or more of the same error category),
the dashboard and the mistakes page offer a round drilling that category,
assembled from the authored trap answers across the whole level. Related skills
are pulled in so a round is never thin — asking for article practice also draws
on gender and case, because they are the same skill. The steps keep their
original ids, so an attempt inside a targeted round counts towards the same
review item and the same mistake as it would in its lesson.

**The scaffolding ladder**, exactly as specified: learn → guided typing with a
gap → partial recall from the first letters → full production → delayed recall →
spaced repetition. Lesson 2.4 walks through all four visible stages explicitly,
and unit 3 lesson 1 runs the same ladder over the numbers.

**Deterministic answer validation** that separates typing from grammar:

| Learner types | Expected | Verdict | Credit | Retype |
| --- | --- | --- | --- | --- |
| `Ich wohne in Hamburg.` | same | correct | 1.0 | no |
| `Ich lebe in Hamburg.` | `Ich wohne in Hamburg.` | accepted variant | 1.0 | no |
| `Ich wohne in Hamburg` | with full stop | punctuation note | 0.95 | no |
| `Ich heisse Theo.` | `Ich heiße Theo.` | orthography note | 0.75 | **yes** |
| `der tisch` | `der Tisch` | capitalisation | 0.50 | **yes** |
| `Entschuldigng` | `Entschuldigung` | spelling | 0.45 | **yes** |
| `Ich habe ein Tochter.` | `eine Tochter` | article + gender | **0** | **yes** |
| `Ich komme von Bulgarien.` | `aus Bulgarien` | preposition | **0** | **yes** |
| `Du wohne in Deutschland.` | `Du wohnst …` | verb conjugation | **0** | **yes** |
| `Ich arbeite heute zu Hause.` | `Heute arbeite ich …` | word order | **0** | **yes** |
| `Wie heißen sie?` | `Wie heißen Sie?` | pronoun | **0** | **yes** |

A grammar mistake never receives credit, no matter how close the spelling is.
Typo tolerance is deliberately narrow: it never applies to a word that is a
grammatical choice (article, pronoun, preposition, verb form), never to a word
shorter than four letters, and never when the learner's word is itself a real
German word the app knows. `eine` for `ein` is one edit apart and is always an
article mistake, never a typo.

**Mistakes are explained, never just marked wrong.** Every category produces a
real explanation in the learner's language, built from the lexicon. For a wrong
article it names the noun's gender and derives the right form:

> „Tochter“ е от женски род: die Tochter.
> Затова тук на немски се използва „eine Tochter“, а не „ein Tochter“.

Lesson authors can also attach a specific explanation to a known wrong turn
(`trapAnswers`), which then wins over the generic one.

**Mandatory retyping.** A meaningful mistake blocks progress: there is no
Continue button until the learner has typed the correct German. A second wrong
attempt does not release the gate. The retyping is recorded separately from the
original mistake, so it resolves the step without repairing the first-try
accuracy record.

**Keyboard-first flow.** Autofocus, Enter to check, Enter again to continue,
focus returns to the input, no page reloads. ä ö ü ß buttons insert at the caret
(not at the end), and Alt+a/o/u/s does the same from the keyboard. Touch targets
are at least 40px and the layout works at phone width.

**Progressive hints and adaptive support.** Hints reveal one at a time and cost
mastery credit gently (1.0 / 0.85 / 0.7 / 0.55); revealing the answer costs all
of it and forces the item back into the queue. Two mistakes in a row add one
rung of support (first word → first letters → word bank → fill in the blank);
two clean answers take it away again, so the learner returns to full recall.

**Lesson completion is earned.** `lessonRequirements()` returns the live state of
every condition, and the UI shows it as a checklist: read all sections, resolve
every exercise, recall the key words, type the key sentences, reach 60% first-try
accuracy, pass the mastery check. Scrolling through completes nothing. If
practice accuracy falls below 70%, a short recovery round on just the missed
steps is inserted automatically before the mastery check.

**A real review queue.** A documented SM-2 derivative (see the header comment in
`src/core/srs/scheduler.ts`): learning steps of 10 minutes and one day, then
`interval × ease × gradeFactor` with ease clamped to [1.3, 2.8]. Recall quality
is derived from the verdict, hint usage and whether the answer was revealed — an
answer produced only after revealing the solution can never grade better than
`again`. Due items come back as **typing** tasks, not flashcards: a due noun is
prompted in the teaching language and must be typed *with its article*, and every
third item comes back as dictation. Grammar concepts, which cannot be typed, get
explicit Again / Hard / Good / Easy buttons.

**A mistake bank driven by real attempts.** Grouped by the 15+ error categories,
showing what was written, what was correct, how many times it happened and how
many times it was retyped correctly — and it can be practised either as a round
of exactly those sentences, or as a round drilling the whole category.

**An honest dashboard.** Every figure is derived from database rows. A fresh
profile shows `—` and "No data yet", not a zero dressed up as progress. The
streak is counted backwards over days that actually contain answers. Speaking
progress shows "Planned — not built yet" rather than a number, because there is
no speaking feature yet.

**Audio** through a replaceable `TtsProvider`, with a `de-DE` browser
SpeechSynthesis implementation and a null provider that hides the buttons when
the browser has no German voice. Nothing in the app calls
`window.speechSynthesis` directly.

---

## Architectural preparation, not finished features

Stated plainly, because a feature that looks done and is not is worse than one
that is openly planned:

| Area | Status |
| --- | --- |
| **Writing review in the Coach** | **Real.** Deterministic rule-based checks on the server: noun capitalisation, missing verb, `aus`/`von`, verb-second, du/Sie mixing, subject–verb agreement, digraph spellings. It lists the checks it applied and the words it did not understand, and says it is not a language model. |
| AI mistake explanation, generated practice, conversation | **Interface only.** `AiProvider` in `server/ai.ts` defines `explainMistake`, `evaluateWriting`, `generatePractice` and `converse`. No provider is wired up; the API returns `available: false` and the UI labels them planned. Keys would be read server-side only — nothing reaches the client bundle. |
| Recording, speech-to-text, pronunciation scoring | **Interface only.** `src/services/speech/` defines `AudioRecorder`, `SpeechToText` and `PronunciationScorer`, all reporting `available: false`. Recording audio the app cannot evaluate would be a fake feature, so it is left out. |
| Real Life scenarios | **Roadmap only.** 13 scenarios are modelled with their CEFR staging and register, and the page presents them as a roadmap with no playable content. Where a scenario's language is already taught, it links to the lesson that teaches it. |
| A1–B2 content | **Outline only.** Topics, grammar progression, "I can" outcomes and planned unit titles for every level; no authored lessons. The level map marks them planned. |
| C1 / C2 | Not implemented, but `CefrLevel` already includes them, so adding them is content, not a refactor. |

---

## How it is put together

```
src/content/      The curriculum as typed data: types, vocabulary, grammar,
                  authoring helpers, the Pre-A1 lessons, level outlines.
src/core/         Pure, DOM-free domain logic — the part worth testing hardest.
  validation/     Normalisation, the German lexicon, the answer validator.
  feedback/       Turning a verdict into an explanation in the learner's language.
  srs/            The review scheduler.
  progress/       Lesson mastery rules and difficulty adaptation.
src/services/     Replaceable boundaries: TTS, speech, the API client.
src/ui/           React components and pages. One component tree, two paths.
server/           Node HTTP server, SQLite schema and migrations, the API,
                  and the AI provider seam.
tests/            Core, content, server and UI suites.
```

Three decisions worth knowing about:

**German is stored once.** Teaching-language text lives in `{ en, bg }` beside
it. Any block, section or exercise may be scoped to one path with
`only: ['bg']`, which is what lets the two paths differ pedagogically instead of
being translations. There is one component tree for both.

**Exercises are lists of answer steps.** That single shape covers full
production, fill-in-the-blank, a six-person conjugation table, progressive
sentence building and the "noun, then noun with article" drill — so the player,
the validator and the scheduler only ever deal with steps.

**Scheduling happens on the server.** The client and the server share the same
pure functions, but the database decides what is due. Nothing important lives in
browser memory.

### Content integrity is tested, not proof-read

`tests/core/content.test.ts` checks the authored content against the engine that
will grade it:

- every canonical answer validates as `correct` with full credit;
- every authored alternative earns full credit and still shows the taught form;
- every trap answer is rejected, with its category and its explanation intact;
- word banks contain exactly the tokens of their answer, partial-recall seeds
  are real prefixes that do not give the answer away, and no gap exercise glues
  a visible tail onto the input;
- every referenced vocabulary, grammar and review-target id resolves;
- both paths have non-empty text wherever a path is active, Bulgarian is in
  Cyrillic, and no English prose has been copied into a Bulgarian field;
- both paths carry explanations that exist only in that path;
- nouns are taught with their article;
- multiple choice stays under 15% of all answer tasks (it is currently 3.5%).

This caught four real bugs during the build: a capitalisation trap answer whose
case-insensitive shape matched the correct answer and swallowed it; duplicated
explanation lines when one mistake carried two categories; a partial-recall cue
whose seed letters were computed but never put in the input; and a gap exercise
that rendered `ein___zwanzig` while grading the whole word `einundzwanzig`, so
the tail appeared twice. Each of those now has a test that fails without the
fix.

`tests/core/i18n.test.ts` does the same for the interface strings: both paths
filled in for every key, the same placeholders in both, nothing left
unsubstituted, and counters that read `1 ден` rather than `1 дни`.

`tests/core/readme.test.ts` ties this file to the content it describes: every
authored lesson title has to appear here, and the totals quoted above have to
match the content. It exists because this README once advertised unit 3 and 4
lessons that did not exist.

### Every lesson has been played end to end

The test suite grades content against the engine, which is not the same as
using it. So every one of the 18 lessons and all 7 checkpoints has also been
driven in Chromium, on both teaching paths, answering all 484 tasks with the
authored answer and checking that each one is accepted, that the task says what
it wants, and that the run releases. Then the 37 steps carrying an authored trap
were driven a second time with the wrong form the author predicted, checking
that the right category is tagged, an explanation appears in the learner's
language, the correction shows the taught form, and the retype gate engages and
then releases. Both passes finish clean with no console errors.

`.task` carries `data-step-id`, `data-exercise-id` and `data-kind` so a harness
can tell which authored step is on screen instead of predicting the sequence the
adaptive ladder produces.

That pass found what the test suite structurally could not: a partial-recall cue
whose seed letters were never shown, a gap exercise that rendered its answer
twice, counters reading "1 дни", and — in the content itself — a `nicht` example
that contradicted the rule printed two lines above it, a claim that three
irregular tens were "two", a rule for building feminine job titles that did not
produce two of the three forms the exercises demand, a checkpoint that marked
the correct `Ich bin aus Bulgarien` wrong, and the description of Bulgarian
clock-telling being backwards.

---

## Manual walkthrough

Run `npm run dev`, open <http://localhost:5173>, and:

1. **Onboarding.** Pick *Обяснявай ми немския на български*. The screen switches
   to Bulgarian immediately. Choose 20 minutes and start.
2. **Dashboard.** "Следващата ти полезна стъпка" suggests the first lesson.
   Accuracy shows `—` with "Още няма данни", not 0%. Speaking reads
   "Планирано — още не е направено".
3. **Course.** All five levels are listed. Pre-A1 shows six linked lessons and a
   checkpoint; A1–B2 show "Това ниво е планирано, но още не е написано" with
   their topic and grammar outlines.
4. **Lesson.** Open *Откъде си и къде живееш*. The requirement checklist shows
   0/6 sections, 0/24 exercises and so on. Work through the six teaching
   sections — note the Bulgarian-only comparison of free Bulgarian word order
   with German verb-second.
5. **Type German.** Answer the `wohnen` conjugation table, then the guided gap
   (`Ich ___ in Hamburg.`), then the partial recall (`Ich w___ in Hamburg.`),
   then full production. Use only the keyboard: Enter checks, Enter continues.
6. **Get it wrong on purpose.** At „Аз съм от България.“ type
   `Ich komme von Bulgarien.` You get the specific `aus`/`von` explanation in
   Bulgarian, the wrong word underlined in a word-by-word diff, a *Предлог* tag,
   and no Continue button. Type the wrong answer again — still blocked. Type
   `Ich komme aus Bulgarien.` and it releases.
7. **Test the umlaut handling.** On a `heißen` task type `heisse`: accepted with
   a note, reduced credit, and a request to retype the standard spelling. The
   ä ö ü ß buttons insert at the caret; so does Alt+s.
8. **Check it was recorded.** *Грешки* shows the preposition mistake with
   "1×" and "пренаписано правилно 1×". *Речник* shows live counts per tab.
9. **Reload, and switch to English.** Progress, the mistake and the review
   schedule are all still there, now explained in English. Stop the server
   (`Ctrl-C`), start it again, reload: still there.
10. **Coach.** Paste `Ich komme von Bulgarien. Der tisch ist gross.` It reports
    the preposition, the lowercase noun and the `ss`/`ß` spelling, lists the
    checks it ran, and says no AI provider is connected.

---

## Next milestone

**Milestone 3 — A1, and its assessment progression.** Pre-A1 now has the shape
the rest of the course can copy: units of three lessons, a checkpoint per unit,
a level checkpoint with no hints, and authored traps feeding targeted practice.
A1 is outlined already — the plural system in earnest, the accusative across all
genders, modal verbs, separable verbs, the perfect tense, and dative
prepositions — and needs the same treatment.

Two pieces of machinery still waiting on content rather than on code:

- **Dictation without replay**, which the exercise model already supports via
  `audio.hideText` and a replay budget, but which only becomes a fair test once
  there is enough heard-but-not-seen vocabulary behind it.
- **Interleaved review across units**, now that there are six units to
  interleave rather than two.

The AI Coach, conversation mode and speech evaluation stay where they are —
behind interfaces — until the core course is worth talking about.

---

## Notes and known limits

- **Answer validation is lexicon-bound.** The validator diagnoses precisely for
  the words the course teaches, plus a hand-written list of function words and
  the present-tense paradigms of the taught verbs. Outside that vocabulary it
  falls back to "vocabulary mistake" rather than guessing. It gets sharper
  automatically as content is added, because the lexicon is built from the
  vocabulary file.
- **Digraph folding has one known ambiguity.** `compareUmlauts` only accepts a
  digraph where the *answer* has the special letter, which avoids treating
  `Masse` and `Maße` as equivalent. Accepting the reverse direction would hide a
  real spelling distinction, so it is reported as a spelling mistake instead.
- **Single learner.** The `profile` table has one row by design. It is a table
  rather than a key-value blob so that multi-user support is an added column
  rather than a rewrite.
- **Postgres is reached over TCP, including on Neon.** Neon's HTTP driver is
  the usual advice for serverless and was the default here until it hung a real
  deployment: its one-shot endpoint cannot run multi-statement DDL or hold a
  transaction, so the migrations fell through to its WebSocket pool, which
  needs a WebSocket implementation wired up explicitly in Node. The request
  never settled and the app sat on "Loading". TCP is what the parity tests
  cover, so it is the default; `SATZWERK_PG_TRANSPORT=http` opts back in. The
  reason to want HTTP is connection exhaustion, which one learner will not
  cause — and where it matters, Neon's pooler endpoint solves it for TCP too.
- **There is no CI yet**, so the test, typecheck and build results quoted here
  were produced locally rather than on a runner.
- **The bundle is a single chunk** (~730 kB, 206 kB gzipped — the whole
  curriculum is typed data compiled into it). Fine for a
  personal app on localhost; route-level code splitting is the obvious first
  step if this ever ships publicly.
