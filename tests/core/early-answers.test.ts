import { describe, expect, it } from 'vitest';
import {
  LEXICON,
  VOCABULARY,
  allCheckpoints,
  allUnits,
  availableLessons,
  lessonExercises,
} from '../../src/content/index.ts';
import type { Exercise, ExerciseStep, TeachingLanguage } from '../../src/content/types.ts';
import { checkFreeWriting, validateAnswer } from '../../src/core/validation/validate.ts';

/**
 * Pre-A1 and A1: correct German the course itself teaches must never be
 * graded as wrong.
 *
 * Every case here was a real report. A learner typed a sentence the lesson
 * had taught them (or the word card had shown them), and a step somewhere
 * else, often a checkpoint with no hints, marked it incorrect with no credit.
 */

const opts = { lexicon: LEXICON };
const EARLY = new Set(['pre-a1', 'a1']);

function earlyExercises(): Exercise[] {
  const unitLevel = new Map(allUnits().map((unit) => [unit.id, unit.level as string]));
  const out: Exercise[] = [];
  for (const lesson of availableLessons()) {
    if (EARLY.has(lesson.level)) out.push(...lessonExercises(lesson));
  }
  for (const checkpoint of allCheckpoints()) {
    const level = unitLevel.get(checkpoint.targetId) ?? checkpoint.targetId;
    if (EARLY.has(level)) out.push(...checkpoint.exercises);
  }
  return out;
}

function earlySteps(): Array<{ exercise: Exercise; step: ExerciseStep }> {
  return earlyExercises().flatMap((exercise) => exercise.steps.map((step) => ({ exercise, step })));
}

function stepById(id: string): ExerciseStep {
  const found = earlySteps().find(({ step }) => step.id === id);
  if (!found) throw new Error(`no step ${id}`);
  return found.step;
}

/** A typed answer the learner writes freely: no word bank, no gap. */
function isFreeTyping(exercise: Exercise, step: ExerciseStep): boolean {
  const typed = exercise.kind === 'type' || exercise.kind === 'fillBlank' || exercise.kind === 'partialRecall';
  return typed && !step.scaffold && !step.wordBank;
}

describe('multiple choice', () => {
  it('asks what the waiter meant with German options the answer matches', () => {
    // "Zusammen oder getrennt?" had English sentences as its options and the
    // German word "zusammen" as its answer. The player grades the tapped
    // option against the answer, so no option could ever be right: tapping
    // the correct one said "Not quite" and logged a mistake.
    const step = stepById('a1u3l2-ex4-s1');
    const correct = step.choices!.find((choice) => choice.id === step.correctChoiceId)!;
    expect(validateAnswer(correct.de, step.answer, opts).credit).toBe(1);
    for (const choice of step.choices!) {
      if (choice.id === correct.id) continue;
      expect(validateAnswer(choice.de, step.answer, opts).credit, choice.de).toBeLessThan(1);
      // The options are German now, so there is no English left in the slot
      // the player marks as German.
      expect(choice.de, choice.de).not.toMatch(/\b(whether|you|want)\b/i);
    }
  });

  it('never shows a Bulgarian learner an English option', () => {
    // "What does Bitte mean here?" offered "Bitte = please", "Bitte = here you
    // are" and "Bitte = sorry" on both paths. A Bulgarian beginner may have no
    // English at all, so the meaning has to be given in Bulgarian.
    const english = /\b(the|you|are|please|sorry|here|whether|want|she|is)\b/i;
    const failures: string[] = [];
    for (const { exercise, step } of earlySteps()) {
      if (!step.choices) continue;
      const scope: TeachingLanguage[] = step.only ?? exercise.only ?? ['en', 'bg'];
      if (!scope.includes('bg')) continue;
      for (const choice of step.choices) {
        if (english.test(choice.de)) failures.push(`${step.id}: "${choice.de}"`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('names the meaning of each Bitte option in both languages', () => {
    // The meaning now sits in the gloss, which the player shows in the
    // learner's language, and the right option still matches the answer.
    const step = stepById('u2l2-ex4-s1');
    for (const choice of step.choices!) {
      expect(choice.gloss?.en, choice.id).toBeTruthy();
      expect(choice.gloss?.bg, choice.id).toMatch(/[а-я]/);
    }
    const correct = step.choices!.find((choice) => choice.id === step.correctChoiceId)!;
    expect(validateAnswer(correct.de, step.answer, opts).credit).toBe(1);
    expect(correct.gloss?.bg).toMatch(/заповядай/);
  });
});

describe('word order', () => {
  // Pre-A1 Unit 5 teaches "time first, verb second": Am Montag arbeite ich.
  // A learner who did exactly that on a step whose stored answer put the
  // subject first got "word order" and no credit, even in checkpoints. The
  // Bulgarian prompts often start with the time word ("Днес трябва да
  // работя."), so the Bulgarian path led straight to the rejected order.
  const SUBJECT = String.raw`(Ich|Du|Er|Es|Wir|Ihr|Sie|(?:Das|Der|Die|Mein|Meine) \S+)`;
  const DAY = '(?:Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag|Wochenende|Abend|Morgen|Vormittag|Nachmittag)';
  const NUMBER = '(?:eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|halb \\S+)';
  const TIME = `(heute Abend|heute|morgen|jetzt|am ${DAY}|im \\S+|um ${NUMBER}(?: Uhr)?)`;
  const statement = new RegExp(`^${SUBJECT} (\\S+) ${TIME}((?: [^,]*)?)([.!])$`);

  it('accepts the time phrase first wherever the answer puts it after the verb', () => {
    const failures: string[] = [];
    let checked = 0;
    for (const { exercise, step } of earlySteps()) {
      if (!isFreeTyping(exercise, step)) continue;
      const answer = step.answer.accepted[0] ?? '';
      const match = statement.exec(answer);
      if (!match) continue;
      const [, subject, verb, time, rest, stop] = match as unknown as string[];
      // A pronoun goes lowercase after the verb; "Sie" and a noun keep their
      // capital, and an article in front of a noun does not.
      const moved = /^(Ich|Du|Er|Es|Wir|Ihr)$/.test(subject!)
        ? subject!.toLowerCase()
        : subject!.replace(/^(Das|Der|Die|Mein|Meine) /, (word) => word.toLowerCase());
      const fronted = `${time![0]!.toUpperCase()}${time!.slice(1)} ${verb} ${moved}${rest}${stop}`;
      checked += 1;
      if (validateAnswer(fronted, step.answer, opts).credit < 1) {
        failures.push(`${step.id}: "${fronted}" is rejected (answer "${answer}")`);
      }
    }
    expect(checked).toBeGreaterThan(5);
    expect(failures).toEqual([]);
  });

  it('accepts other correct orders the reports named', () => {
    // Questions and adverbs the pattern above does not cover.
    const cases: Array<[string, string]> = [
      ['a1u6l3-ex1-s4', 'Wie ist heute das Wetter?'],
      ['a1u2l2-ex2-s3', 'Oft kochen wir zusammen.'],
    ];
    for (const [id, answer] of cases) {
      expect(validateAnswer(answer, stepById(id).answer, opts).credit, `${id}: ${answer}`).toBe(1);
    }
  });
});

describe('answers the lessons teach', () => {
  it('gives the same prompt the same answers everywhere', () => {
    // "I have to work today." accepted "Heute muss ich arbeiten." in the level
    // checkpoint and rejected it in the lesson and the unit checkpoint; the
    // Pre-A1 level checkpoint refused "Wasser, bitte." and "Ich arbeite um
    // acht.", which the lessons accept for the very same prompt. Whatever one
    // step takes, a step with the identical prompt has to take too.
    const failures: string[] = [];
    for (const lang of ['en', 'bg'] as const) {
      const groups = new Map<string, ExerciseStep[]>();
      for (const { exercise, step } of earlySteps()) {
        if (exercise.kind !== 'type' || !isFreeTyping(exercise, step) || !step.prompt) continue;
        if (step.only && !step.only.includes(lang)) continue;
        const key = step.prompt[lang].trim().toLowerCase();
        if (!key) continue;
        groups.set(key, [...(groups.get(key) ?? []), step]);
      }
      for (const steps of groups.values()) {
        for (const from of steps) {
          for (const to of steps) {
            if (from === to) continue;
            for (const answer of [...from.answer.accepted, ...(from.answer.alternatives ?? [])]) {
              if (validateAnswer(answer, to.answer, opts).credit < 1) {
                failures.push(`${lang}: ${to.id} rejects "${answer}" (taken by ${from.id})`);
              }
            }
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('does not give full credit for the order the course calls a demand', () => {
    // "Ich will einen Kaffee, bitte." was listed as a right answer to "I would
    // like a coffee, please." in the lesson, and then copied into both
    // checkpoints to keep the prompts consistent. The course itself says it
    // sounds like a demand and is wrong at a counter, so the lesson explains
    // it and the checkpoints, which give no hints, give it no credit.
    for (const id of ['a1u3l1-ex2-s1', 'cp-a1u3-1-s1', 'a1-lcp-3-s1']) {
      const result = validateAnswer('Ich will einen Kaffee, bitte.', stepById(id).answer, opts);
      expect(result.credit, id).toBeLessThan(1);
    }
    const lesson = validateAnswer('Ich will einen Kaffee, bitte.', stepById('a1u3l1-ex2-s1').answer, opts);
    expect(lesson.trapFeedback?.en).toMatch(/möchte/);
  });

  it('accepts the sentences the lessons and word cards teach', () => {
    const cases: Array<[string, string]> = [
      // The Geburtstag card's own example, glossed "My birthday is in May."
      ['u5l2-ex3-s1', 'Mein Geburtstag ist im Mai.'],
      ['u5l2-m1-s2', 'Mein Geburtstag ist im September.'],
      ['cp-u5-3-s2', 'Mein Geburtstag ist im Mai.'],
      ['lcp-5-s2', 'Mein Geburtstag ist im Mai.'],
      // Pre-A1 teaches Entschuldigung for getting a stranger's attention.
      ['a1u5l3-ex1-s1', 'Entschuldigung, wo ist der Bahnhof?'],
      ['a1u5l3-m1-s1', 'Entschuldigung, wo ist die Apotheke?'],
      ['cp-a1u5-3-s1', 'Entschuldigung, wie komme ich zum Museum?'],
      ['a1-lcp-5-s4', 'Entschuldigung, wie komme ich zum Museum?'],
      // Taught in A1 Unit 1; the unit checkpoint takes all of them.
      ['a1-lcp-1-s1', 'Mein Großvater kommt aus Österreich.'],
      ['a1-lcp-1-s1', 'Mein Opa ist aus Österreich.'],
      // The English prompt does not say which teacher; a1/unit4 glosses
      // "Ich arbeite als Lehrerin." as exactly "I work as a teacher."
      ['a1-lcp-4-s1', 'Ich arbeite als Lehrerin.'],
      // "Wie viel kostet …?" is the Pre-A1 form.
      ['a1u3l2-m1-s2', 'Wie viel kostet der Kaffee?'],
      ['cp-a1u3-2-s1', 'Wie viel kostet der Kuchen?'],
      // The Kino card teaches "Wir gehen ins Kino."
      ['a1u5l2-ex3-s3', 'Wir fahren mit dem Auto ins Kino.'],
      ['cp-a1u5-2-s3', 'Wir fahren mit dem Auto ins Kino.'],
    ];
    for (const [id, answer] of cases) {
      expect(validateAnswer(answer, stepById(id).answer, opts).credit, `${id}: ${answer}`).toBe(1);
    }
  });

  it('takes both ways of saying what hurts, which the Bulgarian prompt cannot tell apart', () => {
    // A1 Unit 6 teaches "Ich habe Kopfschmerzen." and "Mein Kopf tut weh.",
    // and glosses the second as "Боли ме главата." Bulgarian has one sentence
    // for both, so on the Bulgarian path the learner cannot know which one a
    // step wants, and each step used to reject the other.
    const cases: Array<[string, string[]]> = [
      ['a1u6l2-ex1-s2', ['Ich habe Kopfschmerzen.', 'Mein Kopf tut weh.']],
      ['cp-a1u6-2-s2', ['Ich habe Kopfschmerzen.', 'Mein Kopf tut weh.']],
      ['a1-lcp-6-s2', ['Ich habe Kopfschmerzen.', 'Mein Kopf tut weh.']],
      ['a1u6l2-ex1-s4', ['Mein Hals tut weh.', 'Ich habe Halsschmerzen.']],
      ['cp-a1u6-2-s3', ['Mein Hals tut weh.', 'Ich habe Halsschmerzen.']],
      ['a1u6l2-m1-s2', ['Mein Bauch tut weh.', 'Ich habe Bauchschmerzen.']],
      ['a1u6l2-m1-s1', ['Ich bin krank und ich habe Halsschmerzen.', 'Ich bin krank und mein Hals tut weh.']],
    ];
    for (const [id, answers] of cases) {
      const step = stepById(id);
      expect(step.prompt?.bg, id).toMatch(/^(Болен съм и ме боли|Боли ме)/);
      for (const answer of answers) {
        expect(validateAnswer(answer, step.answer, opts).credit, `${id}: ${answer}`).toBe(1);
      }
    }
  });
});

describe('prompts say what they want', () => {
  it('says which "you" when only one is accepted', () => {
    // "You live in Germany." took only "Du wohnst …", so "Sie wohnen in
    // Deutschland." got no credit in a final check. The rest of the course
    // marks these prompts "(informal)" or "(formal)".
    const du = /\b(du|dich|dir|dein\w*)\b/i;
    const failures: string[] = [];
    for (const { exercise, step } of earlySteps()) {
      if (!isFreeTyping(exercise, step) || !step.prompt) continue;
      const en = step.prompt.en;
      if (!/\byour?\b/i.test(en) || en.includes('(')) continue;
      const answers = [...step.answer.accepted, ...(step.answer.alternatives ?? [])];
      if (answers.every((answer) => du.test(answer))) failures.push(`${step.id}: ${JSON.stringify(en)}`);
    }
    expect(failures).toEqual([]);
  });

  it('does not ask for ihr with a Bulgarian "Вие" that reads as the polite form', () => {
    // At the start of a sentence "Вие" is capitalised anyway, so "Вие сте
    // учители." reads as the polite form and "Sie sind Lehrer." is a natural
    // answer. The prompt has to say it is several people you know.
    const failures: string[] = [];
    for (const { exercise, step } of earlySteps()) {
      if (!isFreeTyping(exercise, step) || !step.prompt) continue;
      const bg = step.prompt.bg;
      if (!/^Вие /.test(bg) || bg.includes('(')) continue;
      if (step.answer.accepted.every((answer) => /^Ihr /.test(answer))) failures.push(`${step.id}: ${bg}`);
    }
    expect(failures).toEqual([]);
  });

  it('matches the prompt to the German it completes', () => {
    // The prompt said "The film starts at eight." over "Die Arbeit fängt um
    // acht ___." A beginner could take Arbeit to mean film.
    const step = stepById('a1u2l2-ex3-s3');
    expect(step.scaffold).toContain('Arbeit');
    expect(step.prompt?.en).toBe('Work starts at eight.');
    expect(step.prompt?.bg).toBe('Работата започва в осем.');
  });
});

describe('level checkpoints check what they say', () => {
  it('asks for the number as a word, and explains digits', () => {
    // "Type the number you hear." then refused "21" as a vocabulary mistake.
    const step = stepById('lcp-8-s4');
    expect(step.instruction?.en).toMatch(/as a word/);
    const result = validateAnswer('21', step.answer, opts);
    expect(result.credit).toBe(0);
    expect(result.trapFeedback?.en).toMatch(/Right number/);
  });

  it('lets the Pre-A1 introduction say where you live with lebe', () => {
    // Pre-A1 teaches leben as well as wohnen, and the unit writing takes both.
    const step = stepById('lcp-9-s1');
    const text = 'Hallo! Ich heiße Mira. Ich komme aus Bulgarien. Ich lebe in Wien. Ich bin Lehrerin.';
    expect(checkFreeWriting(text, step.answer).missingRequired).toEqual([]);
  });

  it('lets the A1 day use any modal, and zum instead of mit', () => {
    // The instruction asks for a separable verb, a modal and "mit dem or zum";
    // the check demanded exactly auf, muss and mit.
    const step = stepById('a1-lcp-9-s1');
    const text =
      'Ich stehe um sieben Uhr auf. Ich will heute Deutsch lernen. Ich esse ein Brot. Ich gehe zum Büro. Am Abend sehe ich fern.';
    expect(checkFreeWriting(text, step.answer).missingRequired).toEqual([]);
    // It still asks for a modal: a day without one is not what the task set.
    const noModal = 'Ich stehe um sieben Uhr auf. Ich esse ein Brot. Ich gehe zum Büro. Am Abend sehe ich fern.';
    expect(checkFreeWriting(noModal, step.answer).missingRequired.length).toBe(1);
    // And it still asks for a separable verb. A bare "an" matched Anna,
    // andere and Antwort, so a day with no separable verb at all passed.
    const noSeparable = 'Ich heiße Anna. Ich möchte Kaffee. Ich fahre mit dem Bus. Am Abend lese ich.';
    expect(checkFreeWriting(noSeparable, step.answer).missingRequired.length).toBe(1);
    // anfangen still counts, split or whole.
    for (const start of ['Die Arbeit fängt um acht an.', 'Ich muss um acht anfangen.']) {
      const day = `Ich esse ein Brot. Ich kann gut kochen. Ich gehe zum Büro. ${start} Am Abend lese ich.`;
      expect(checkFreeWriting(day, step.answer).missingRequired, start).toEqual([]);
    }
  });

  it('takes Entschuldigung as the polite opener in free writing', () => {
    const step = stepById('a1u5l3-ex5-s1');
    expect(checkFreeWriting('Entschuldigung! Wie komme ich zum Bahnhof?', step.answer).missingRequired).toEqual([]);
  });
});

describe('Bulgarian on the word cards', () => {
  it('writes "Във" before в and ф, and counts years as "една години"', () => {
    // The Dienstag card said "В вторник работя." and the einundzwanzig card
    // "Аз съм на двайсет и едно години." (година is feminine).
    const failures: string[] = [];
    for (const entry of VOCABULARY) {
      const bg = entry.example.gloss.bg;
      if (/(^|[\s„(])[Вв] [вфВФ]/.test(bg) || /едно години/.test(bg)) failures.push(`${entry.id}: ${bg}`);
    }
    expect(failures).toEqual([]);
  });
});
