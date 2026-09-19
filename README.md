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

   `POSTGRES_URL`, `NEON_DATABASE_URL`, `DATABASE_URL_UNPOOLED` and
   `POSTGRES_URL_NON_POOLING` are read too, in that order of preference, since
   those are the names Vercel's own database integrations create. Failing all
   of those, any variable whose name mentions Postgres or Neon and whose value
   begins `postgresql://` is used — Vercel prefixes the variables it creates
   with the store's name, so the same database can arrive as
   `MY_STORE_POSTGRES_URL`. Adding a database from the Vercel dashboard
   therefore needs no variable set by hand, whatever the store was called.

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

### Turning on reminders (optional)

The app works fully without this; skip it and Settings will say *not configured
on the server* rather than pretending. Three variables arm it:

| Variable | Value |
| --- | --- |
| `VAPID_PUBLIC_KEY` | the public half of a VAPID key pair |
| `VAPID_PRIVATE_KEY` | the private half — server-side only, never prefixed `VITE_` |
| `CRON_SECRET` | any long random string |

Generate the pair once with `npx web-push generate-vapid-keys`. Without both
keys `GET /api/push/status` answers `{"configured": false}` and the Settings
card says so; without `CRON_SECRET` the job endpoint returns 503 rather than
running unauthenticated on a public URL.

`vercel.json` already schedules `/api/push/run` daily at 18:00 UTC. Vercel sends
that as a **GET** with `Authorization: Bearer $CRON_SECRET`, which is what the
endpoint expects; it also accepts POST, so the same job can be triggered by
anything else that can hold the secret.

**On an iPhone the app has to be installed.** iOS exposes no `PushManager` in a
Safari tab at all, so: open the URL in Safari → *Share* → *Add to Home Screen* →
open it from the Home Screen icon → *Settings* → *Turn on reminders*. Until
then the card says to install it, which is the only thing that would help.


### Turning on explanations (optional)

One variable, and the app is unchanged without it:

| Variable | Value |
| --- | --- |
| `ANTHROPIC_API_KEY` | a key from [the Claude Console](https://console.anthropic.com). Server-side only — never prefixed `VITE_`. |
| `SATZWERK_AI_MODEL` | optional. Defaults to `claude-opus-5`. |
| `SATZWERK_AI_PROVIDER` | optional. Set to `none` to keep the feature off even where a key exists — a key on the host for something else is not consent to spend it here. |

`GET /api/coach/status` reports what is actually on. With no key it answers
`aiAvailable: false`, the *Why was this wrong?* button is not rendered at all,
and the Coach's checks stay exactly as deterministic as they were.

Cost is small and bounded by design: one request only when the button is
pressed, `effort: medium` (a wrong grammar explanation teaches wrong German, so
this is not the place to economise on reasoning) and a deliberately low output
ceiling, because the prompt asks for three or four sentences.

### Checking a deployment

`npm run smoke -- <url>` probes a running or deployed copy over HTTP and says
whether each answer came from the app or from the platform. That distinction is
the point: every hosting failure this project has had looked like a plausible
HTTP response and was in fact a crash page, a platform 404 or nothing at all,
and none of them were visible from inside the test suite — tests call the code
directly and never involve a router.

It probes paths one, two and four segments deep, because depth is what one of
those failures turned on. It needs no password: an unauthenticated probe is
*supposed* to be refused, and a refusal that carries the app's own
`x-satzwerk` header already proves the request reached our code. That header is
the test, not the shape of the body — a platform's access-control refusal is
JSON too, and on this check's first real run two probes passed on JSON that
Vercel had written rather than us.

Set `SMOKE_PASSWORD` to also prove the deep routes exist rather than only that
they are guarded, and `VERCEL_BYPASS_TOKEN` to get past Deployment Protection,
which Vercel applies to preview deployments by default and which otherwise
answers with its own login page. Worth knowing beyond this script: while that
protection is on, the app is only reachable by someone signed in to Vercel, so
a phone or a second browser meets the login wall rather than SatzWerk.

`.github/workflows/ci.yml` runs it against every deployment the platform
reports ready, and runs the suite — including against a real Postgres — on
every push.

### When the hosted app will not load

Open `/api/health` on the deployment. `api/health.ts` is a function that
imports nothing at all — not the router, not the database, not a type — so it
cannot be broken by anything in this project. It is public and reports only
whether the variables exist, never what is in them. That separates the two
failures that look identical from the outside:

- **It answers JSON** (`{"ok":true,...}`) — the deployment runs code. Look at
  `databaseUrl`: `set` means the variable reached this environment, `missing`
  means it did not, `blank` means it was saved with an empty value. Preview and
  Production are configured separately in Vercel, and a variable set for only
  one of them is the usual cause. `databaseVariables` lists every
  database-shaped variable name the deployment can see — which is how you spot
  a typo, or a database added from Vercel's dashboard that created
  `POSTGRES_URL` instead.
- **It does not answer at all** — nothing of ours is even running. The route is
  not reaching a function, deployment protection is in front of it, or the
  runtime is failing to boot; Vercel's runtime logs for the deployment say
  which.

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

**A1 is finished too: six units, eighteen lessons, six unit checkpoints and a
level checkpoint.**

| Unit | Lessons | What it teaches |
| --- | --- | --- |
| 1. People and family | My family, your family · Subject and object: the accusative · His family, her family | grandparents, aunts, uncles, siblings; mein and dein with the endings of ein; the accusative as a rule about German rather than a rule about *haben*, with kennen, sehen, suchen, brauchen and besuchen; why nothing changes after *sein*; sein and ihr, where the word names the owner and the ending names the thing owned |
| 2. Home and daily life | Your home · Your day, and verbs that split · Can, must, want | rooms and furniture, the compound-gender rule, *es gibt* and the object it takes; separable verbs and the sentence bracket; frequency adverbs and why *nie* needs no *nicht*; können, müssen and wollen, with the second verb waiting at the end |
| 3. Food, cafés and shopping | Food and drink · In a café · At the supermarket | everyday food and drink and the genders that decide how you order them; *möchten* as the polite ask and *gern* for what you like; a whole café visit from menu to bill; the formal imperative you will hear before you can say it; quantity phrases, which are the one construction a Bulgarian speaker can translate word for word |
| 4. Work, study and free time | Work and study · Free time, and what you prefer · Joining two sentences | *als* with no article and when *studieren* is wrong; hobbies, and the last stem-changing verbs (du liest, du fährst, du triffst); *gern* and *lieber* for what you like and prefer; und, aber, oder and denn — the four joining words that change nothing, and why each half still needs its own subject |
| 5. Getting around town | Places in town · Getting there: mit dem Bus zum Bahnhof · Asking the way | the places and their genders, learnt before they are needed; the dative kept deliberately small — *mit*, *zu* and *neben*, singular only — with feminine *der* named as the trap it is; *zum* and *zur*; gehen versus fahren; asking the way and understanding the answer |
| 6. Appointments, health and weather | Making an appointment · Saying what is wrong · The weather, and the subject German invents | making, moving and cancelling an appointment, with *bei* and *beim* giving the dative a third preposition; body parts, the *-schmerzen* compound and *tut weh*; the impersonal *es* — the one place German invents a subject because a sentence cannot go without one, which is where a Bulgarian speaker's „Вали." has no equivalent at all |
| | **Six unit checkpoints** | each mixes vocabulary, grammar, listening and writing from its own unit |
| | **A1 level checkpoint** | all six units with no hints, 80% to pass, with the accusative and the dative asked for side by side |

**A2 is finished: five units, fifteen lessons, five unit checkpoints and a
level checkpoint.**

| Unit | Lessons | What it teaches |
| --- | --- | --- |
| 1. Last weekend: the Perfekt | What you did: haben and the participle · Where you went: the verbs that take sein · war, hatte, and telling the whole story | the past tense built from verbs the learner already owns — the helper second, the participle last, which is the bracket from A1 Unit 2 in its third disguise; ge- … -t and the three groups that do it differently; which verbs take *sein* and why the Bulgarian instinct („работил съм“) produces *Ich bin gearbeitet* every time; *war*, *hatte* and *es gab*, the three places spoken German keeps the simple past |
| 2. Home, city and services | Where things are: wo and the dative · Putting things: wohin and the accusative · When something is broken: weil | the nine two-way prepositions, and the one question — *wo* or *wohin* — that decides the case; the verb pairs *stellen*/*stehen* and *legen*/*liegen*, learnt together so the pair carries the case and it never has to be decided twice; *weil*, the first word that sends a verb to the end of its clause, taught where it is actually needed — a phone call about a broken heater |
| 3. Work and education | What you think: dass · Courses and conditions: wenn · Plans: the future, and becoming something | *dass* and *wenn*, which do to the verb exactly what *weil* already did — so the unit says so in its first line rather than presenting a second rule; what is genuinely new is the consequence, that a *wenn*-clause in first position pushes the main verb to just after the comma, which neither English nor Bulgarian does; and the future, which is mostly the present tense with a time word |

| 4. Health and advice | How you feel: reflexive verbs · Giving advice: sollen and the imperative · At the doctor: the whole visit | reflexive verbs, which is the clearest case in the course of the two paths needing *opposite* advice — Bulgarian has „се“ and puts it in the same places, so the warning is that German's changes with the person, while English forbids the word outright („I feel myself well“), so the instinct is to delete it; both mistakes are authored as traps in the same exercise; plus *sollen*, a fifth modal that behaves like the four already known, and the du-imperative, which is the du-form with two things taken off |

| 5. Travel and problems | Faster, cheaper: comparing two things · The best of all: am besten · When it goes wrong: delays and missed trains | comparison, the one topic in A2 where German is *simpler* than English (every adjective takes -er, however long — there is no *mehr interessant*) and harder than Bulgarian (whose „по-“ never touches the word, while German adds umlauts); the superlative in both its shapes; and one deliberately small corner of the adjective endings — definite article, nominative and accusative, five of whose six forms are -e |
| | **A2 level checkpoint** | all five units with no hints, 80% to pass, built around the two decisions B1 assumes: which helper a verb takes, and which case a two-way preposition wants |

**B1 has begun.** The level where the course stops teaching German in general
and starts teaching Germany in particular.

| Unit | Lessons | What it teaches |
| --- | --- | --- |
| 1. Finding and renting a flat | The flat that has a balcony · A bright flat with a big balcony · The flat I live in | relative clauses, the structure that separates A2 German from B1 German — and the sharpest divergence between the two paths anywhere in the course, because English has dismantled its relative pronouns (*that* covers everything, and it is dropped outright in "the flat I saw") while Bulgarian has kept the whole system, agreement and all, so the English path is taught something it no longer has and the Bulgarian path is told plainly that it already owns nine tenths of it and has one new thing to learn: the verb goes to the end. Plus the adjective endings after *ein*, taught as a reason rather than a table — *ein* cannot show the gender, so the adjective does — where Bulgarian again has a real head start, because it already moves the definite marker onto the adjective (*голям апартамент* → *големият апартамент*). And the vocabulary of a German rental contract, where *Kaution*, *Nebenkosten* and *Kaltmiete* are legal objects before they are words |
| 2. Authorities and paperwork | The form is filled in: the passive · In order to register: zu and um … zu · At the counter, and the letter afterwards | the unit that flips the advantage back. The passive is the voice the German state writes in — a letter from an Amt almost never names who does anything — and each path gets its own predicted error rather than a shared warning: English builds the passive with *be*, so *Das Formular ist ausgefüllt* comes out (correct German, wrong sentence), while Bulgarian avoids the construction entirely and uses the reflexive (*формулярът се попълва*), so the instinct is a *sich* with nowhere to go. Both are authored as traps in the same exercise. Then the infinitive with *zu*, where the English path gets an almost free ride — English has the construction nearly exactly — and the Bulgarian path has real work, because Bulgarian has no infinitive at all and says „да“ plus a conjugated verb; it gets a translation rule it can apply, and the boundary where *dass* really is needed |

| 3. Health and insurance | I would like an appointment · If I were you: advice and hypotheses · Could you tell me whether … | the one topic in the course where *neither* path is at a disadvantage, and the course says so rather than inventing a difficulty: English has "I would like" and "could you", Bulgarian has „бих искал“ and „бихте ли“. What is taught instead is the single place German breaks the pattern both languages follow — and both paths produce *ich würde haben* for opposite reasons. English builds the conditional analytically for most verbs; Bulgarian builds it that way for *all* of them, with „бих“ and no exceptions at all. German keeps real one-word forms for exactly the verbs you use most: hätte, wäre, könnte, müsste, wüsste. Plus indirect questions, where it is Bulgarian that transfers cleanly („дали“ is *ob*) and English speakers keep a question word order German cannot have |

| 4. Work and applications | The applicant’s CV: the genitive · Although, therefore, all the same · I am applying for: verbs and their prepositions | the unit built around one document — a German *Bewerbung* — with the grammar chosen to serve it. The genitive is taught honestly, which means admitting that spoken German is abandoning it: *das Auto von meinem Bruder* is what people say, *das Auto meines Bruders* is what people write, so the Bulgarian path is told its instinctive *von* is not an error but the wrong register. Then the three connector families, where German sorts joining words by what they do to the verb rather than by meaning, so *obwohl* and *trotzdem* — nearly synonymous — land in different families and neither starting language makes the split. And the fixed prepositions, the rare topic that is equally hard for everyone: "apply for" and „кандидатствам за“ both point at *für*, and German chose *um* |

Across those 63 lessons that is 515 vocabulary entries, 60 grammar concepts, 503 exercises and **1475
answer tasks** (including all twenty-four checkpoints), across 317 teaching sections,
all authored in both paths. Only 1.4% of those tasks are multiple choice; the
rest require typing German. 136 of them carry an authored trap answer — a
specific wrong form the learner is likely to produce, with an explanation
written for it. B1 has begun; B2 exists as structure and outline only, and the
UI labels every unit that is not authored as planned.

**A2 Unit 1 teaches almost no new words, on purpose.** The learner finished A1
owning forty-three verbs; the unit gives them a second form of those rather than
more verbs to carry, so seventeen new entries are enough — the time expressions
a past tense needs, two verbs that take *sein* and had no reason to exist
before, and the nouns a weekend story is made of. Every verb in the course now
carries its Perfekt as data (`hat gemacht`, `ist gegangen`), because German
participles cannot be derived: *gemacht* is regular, *gegangen* is not,
*studiert* has no ge- at all and *eingekauft* puts it in the middle. The word
page shows it, and the validator counts the participle as a word the course
teaches rather than calling it a typo.

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
streak is counted backwards over days that actually contain answers.

**Speaking, and what it honestly checks.** After an answer is already correct,
the app offers *Say it*. The browser's own recogniser — iOS Safari and Chrome
both ship one — listens, and the transcript goes through **the same validator
the typing loop uses**: a wrong case is a wrong case whether you wrote it or
said it, and it gets the same authored explanation.

Two rules make it honest:

- **Nothing you cannot hear is ever marked wrong.** A recogniser invents its
  own punctuation (nobody pronounces a full stop) and capitalises by its own
  rules, so both are normalised away before judging, and `capitalization` and
  `punctuation` are stripped from the verdict if they survive. Marking those
  would be telling a learner they mispronounced a capital letter.
- **There is no score.** What is shown is the words it heard beside the words
  that were wanted, and a line saying what that means: *this checks whether a
  speech recogniser understood your words; it is not a score for your accent,
  and it can mishear you.* A percentage there would read as an accent grade,
  which is not what a recogniser measures.

It is offered **after** the answer is right, never before, so a missing
microphone, a noisy room or a mishearing costs nothing. Where the browser has
no recogniser the control is not rendered at all — not greyed out, not
"coming soon".

It is also **not counted as progress**, and the dashboard says so. Speaking
happens after the mark is already banked, so folding it into accuracy would
distort the one number the app promises is real. The skills row used to read
"Planned — not built yet"; that became false the moment speaking shipped, so it
now describes what is there and claims nothing.

**Asking why an answer was wrong.** Every lesson here is written by hand, and
so are the traps: produce a wrong form somebody anticipated and you get an
explanation somebody wrote for exactly that form. But you can produce a wrong
form nobody anticipated, and until now the app could only show the right answer
again, which explains nothing.

With `ANTHROPIC_API_KEY` set, a *Why was this wrong?* button appears under a
wrong answer. Three things keep it from undermining the rest of the app:

- **It comes after the verdict.** The validator has already marked the answer
  and banked it. Nothing the model says can change whether you were right, so a
  model that is slow, unreachable or wrong costs you nothing you had.
- **It is labelled, above the text rather than below it.** The panel says a
  language model wrote it and that it can be wrong. If a generated paragraph sat
  unlabelled beside an authored one, the authored one would be worth less —
  you could no longer tell which was which.
- **It is asked for.** It does not fire on every slip. A generated paragraph
  pushed at you after every mistake would be noise, and would cost a request
  each time.

The **two teaching paths stay two**. The English prompt tells the model that
English has no grammatical gender to lean on and a fixed word order; the
Bulgarian prompt tells it that Bulgarian *does* have gender, that the definite
article is on the end of the word (`къща` → `къщата`) and that word order is
free. They are written separately, in the language they teach in, exactly like
the authored content — and a test fails if one ever becomes a translation of the
other. An explanation is therefore generated **once, for one path**: the API
returns a plain string plus the language it is in, not a bilingual pair it would
have had to translate itself into.

The **Coach's writing review** gains the same treatment: the deterministic
checks run first and always, the model only adds findings it was told not to
duplicate, and every added finding is marked as the model's. If the call fails
the rule-based result is still returned — it is a real result — rather than the
whole request failing.

**What is deliberately not generated:** practice sentences and conversation.
`generatePractice` and `converse` report `available: false` with a reason, and
the coach status says `not-generated` rather than `planned`, because "planned"
would promise something that is not coming. Every German sentence in this app
has been read by a person, and that is worth more than a limitless supply of
sentences that have not.

**A reason to come back, without nagging.** Spaced repetition only works if
somebody actually comes back on the day, so the app can send one push
notification — *"3 words are due"* — and it is governed by three rules:

- **Only when something is really due.** The job reads `review_items` and sends
  nothing when the count is zero. There is no "keep your streak" notification,
  because a streak is not a reason to study and a reminder about nothing is how
  people turn reminders off.
- **At most one a day.** `last_sent_at` is stamped per subscription and a second
  run on the same UTC day is a no-op, so a cron misfire cannot produce two.
- **It says the real number.** The text comes from the same query the Review
  page counts, in the learner's own teaching language.

It is off until it is switched on from Settings, from a real tap — a permission
prompt on page load is both bad manners and ignored by Safari. The card names
the actual obstacle rather than failing generically: *add the app to your Home
Screen* on an iPhone (iOS exposes no `PushManager` in a Safari tab, so nothing
else will work), *notifications are blocked for this site*, or *not configured
on the server*. With no VAPID keys set the feature reports itself as not
configured and the API answers `{"configured": false}` — it never pretends to
be armed. And when the browser's push service simply never answers — a blocked
host returns no error, the promise just never settles — the attempt is given
twenty seconds and then the card says so, rather than leaving a dead switch
that looks like a broken app.

Delivery is `web-push` with VAPID and RFC 8291 payload encryption; the private
key never leaves the server. `public/sw.js` handles `push` and
`notificationclick` **and caches nothing** — a stale cached copy of your own
progress would be worse than no offline mode. A subscription that the push
service rejects as gone (404/410) is deleted; any other failure is kept and
retried tomorrow, because a network blip is not an unsubscribe.

**Audio** through a replaceable `TtsProvider`, with a `de-DE` browser
SpeechSynthesis implementation and a null provider that hides the buttons when
the browser has no German voice. Nothing in the app calls
`window.speechSynthesis` directly.

---

## The interface, and how it moves

The app is used on a phone more than anywhere else, so the phone layout is the
real one rather than a fallback.

- **The navigation is at the bottom**, under a thumb, translucent over the
  content it scrolls past. Eight destinations still do not fit across a phone,
  so it scrolls sideways — but it no longer takes a line from the top of a
  screen whose whole job is one German sentence and a field to type it in.
- **Safe areas are respected**: `viewport-fit=cover` plus `env(safe-area-inset-*)`,
  so nothing hides under the notch or the home indicator.
- **It installs.** A web manifest, an apple-touch-icon and the standalone meta
  tags mean *Add to Home Screen* gives an app with its own icon and no browser
  chrome.
- **The special letters fit on one row** on a phone (they stay 44px wide, which
  is what a thumb needs; the gaps give way instead), and the `Alt+a` hint is
  hidden on a touch device, because there is no Alt key on an iPhone.
- **The whole lesson row is the tap target**, not the title text inside it.

Motion follows one rule: **it may confirm what happened, and it may never be in
the way.** Nothing between pressing Enter and the answer being judged is
animated, because delay there is felt as slowness however pretty it is. What
does move:

| Moment | What happens | Why |
| --- | --- | --- |
| A new question | The card rises in, keyed to the step id | A question replacing another one in the same box is easy to miss |
| Correct | A tick draws itself, and a ring pushes out once behind it | It lands in the same moment the word does, and it says the verdict in a shape as well as a colour |
| Wrong | The panel rises in, then shakes once | Small enough to read as "no" rather than as a fault |
| A finished round | A ring fills to the score over half a second | The one place where motion is the point: it is what makes finishing feel like finishing |
| Progress, meters | Travel to the value instead of jumping | One step in a bar of thirty is invisible without the movement |
| Any tap | The control moves under the finger | iOS's own grey tap box is turned off, so something has to replace it |

Every duration is a token (`--dur-1` … `--dur-4`), and
`prefers-reduced-motion: reduce` collapses all of them in one place while
`--motion-shift: 0` takes the travel out of the keyframes that move rather than
fade — so a card still appears, it just does not fly. All of it lives in one
`Motion` section at the bottom of `src/styles.css`, so the whole motion budget
can be read, and changed, in one place.

One piece of behaviour rather than decoration: when an answer is judged, the
feedback is scrolled into view (`block: 'nearest'`, so a verdict already on
screen does not jump). On a phone it often opens below the fold, and without
this the app looks like it did nothing. It is guarded with an optional call
because jsdom has no `scrollIntoView` at all — which took the whole player down
the first time, and is now covered by a test both ways.

---

## Architectural preparation, not finished features

Stated plainly, because a feature that looks done and is not is worse than one
that is openly planned:

| Area | Status |
| --- | --- |
| **Writing review in the Coach** | **Real.** Deterministic rule-based checks on the server: noun capitalisation, missing verb, `aus`/`von`, verb-second, du/Sie mixing, subject–verb agreement, digraph spellings. It lists the checks it applied and the words it did not understand, and says it is not a language model. |
| AI mistake explanation | **Real, when a key is set.** `server/ai-claude.ts` implements `AiProvider` against the Claude API. With no `ANTHROPIC_API_KEY` the app behaves exactly as before and says so. The key is read server-side only and is not prefixed `VITE_`, so it cannot reach the client bundle. See below. |
| Generated practice, conversation | **Decided against, not planned.** `generatePractice` and `converse` stay `available: false` with a reason, and the API says `not-generated` rather than `planned`. Every German sentence in this app has been read by a person; a generated one sitting beside an authored one with no way to tell them apart would end that quietly. |
| Phoneme-level pronunciation scoring | **Not built, and not claimed.** Speaking *is* real (see below) — the app checks whether a recogniser understood your words. Scoring an accent is a different thing and needs a different engine; `AudioRecorder` / `SpeechToText` in `src/services/speech/index.ts` remain the interfaces a server-side recogniser would implement. |
| Real Life scenarios | **Roadmap only.** 13 scenarios are modelled with their CEFR staging and register, and the page presents them as a roadmap with no playable content. Where a scenario's language is already taught, it links to the lesson that teaches it. |
| B1–B2 content | **Outline only.** Topics, grammar progression, "I can" outcomes and planned unit titles for both levels; no authored lessons. The level map marks them planned. Pre-A1, A1 and A2 are written. |
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
src/services/     Replaceable boundaries: TTS, speech, push, the API client.
src/ui/           React components and pages. One component tree, two paths.
server/           Node HTTP server, SQLite schema and migrations, the API,
                  push delivery, and the AI provider seam with its Claude
                  implementation.
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
- multiple choice stays under 15% of all answer tasks (it is currently 1.9%).

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
using it. So every one of the 18 Pre-A1 lessons and all 7 of its checkpoints has
also been driven in Chromium, on both teaching paths, answering all 484 tasks
with the authored answer and checking that each one is accepted, that the task
says what it wants, and that the run releases. Each A1 unit was driven the same
way as it was written — its lessons opened in both paths, a wrong answer
answered first to see the explanation, then the authored one — and the A1 level
checkpoint was played to the end in both paths, all 37 steps accepted. Then the
37 Pre-A1 steps carrying an authored trap were driven a second time with the
wrong form the author predicted, checking
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
3. **Course.** All five levels are listed. Pre-A1 and A1 each show six linked
   units and a level checkpoint, A2 five; B1–B2 show "Това ниво е планирано, но
   още не е написано" with their topic and grammar outlines.
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

**Milestone 5 — B1.** Pre-A1, A1 and A2 are all finished, and the shape has held
for three levels: units of three lessons, a checkpoint per unit, a level
checkpoint with no hints, and authored traps feeding targeted practice.

B1 is outlined already, and the grammar it needs is mostly the other half of
what A2 opened: the full adjective-ending system rather than one corner of it,
the genitive, relative clauses, the passive, and *würde* and the subjunctive. A2
ends where it should — a learner who passes its level checkpoint can choose
between *haben* and *sein* without thinking, and can put a verb at the end of a
clause on purpose.

A1 ends where it should: a learner who passes its level checkpoint can tell the
accusative from the dative, which is the one thing A2 assumes and cannot
re-teach. A2 Unit 1 starts where it should too — it asks for no new verbs at
all, only a second form of the ones already owned.

Two pieces of machinery still waiting on content rather than on code:

- **Dictation without replay**, which the exercise model already supports via
  `audio.hideText` and a replay budget, but which only becomes a fair test once
  there is enough heard-but-not-seen vocabulary behind it.
- **Interleaved review across units**, now that there are twelve units to
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
