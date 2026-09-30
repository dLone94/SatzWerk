import { describe, expect, it } from 'vitest';
import {
  CURRICULUM,
  LEXICON,
  SCENARIO_SCRIPTS,
  allCheckpoints,
  availableLessons,
  lessonExercises,
} from '../../src/content/index.ts';
import type { ExerciseStep } from '../../src/content/types.ts';
import { VOCABULARY } from '../../src/content/vocabulary.ts';
import { checkFreeWriting, validateAnswer } from '../../src/core/validation/validate.ts';

/**
 * A2, B1 and B2 content that used to grade correct German as a mistake.
 *
 * Each block below names what went wrong. The answers are typed into the real
 * validator, and "right" means what the exercise player counts as a first
 * try right: correct, an accepted variant, or a note that asks for no retype.
 */

const opts = { lexicon: LEXICON };

const STEPS = new Map<string, ExerciseStep>();
for (const exercise of [
  ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
  ...allCheckpoints().flatMap((checkpoint) => checkpoint.exercises),
  ...SCENARIO_SCRIPTS.flatMap((script) =>
    script.beats.flatMap((beat) => (beat.who === 'you' ? [beat.exercise] : [])),
  ),
]) {
  for (const step of exercise.steps) STEPS.set(step.id, step);
}

function step(id: string): ExerciseStep {
  const found = STEPS.get(id);
  if (!found) throw new Error(`no step ${id}`);
  return found;
}

function isRight(given: string, id: string): boolean {
  const result = validateAnswer(given, step(id).answer, opts);
  return (
    result.verdict === 'correct' ||
    result.verdict === 'accepted-variant' ||
    (result.verdict === 'accepted-with-note' && !result.requireRetype)
  );
}

/** Every [step, answer] pair that is not right, for one readable failure. */
function rejected(cases: Record<string, string[]>): string[] {
  const out: string[] = [];
  for (const [id, answers] of Object.entries(cases)) {
    for (const answer of answers) if (!isRight(answer, id)) out.push(`${id}: ${answer}`);
  }
  return out;
}

describe('traps that call correct German correct', () => {
  /*
   * A2 Unit 1 Lesson 2 teaches "Ich bin in Berlin gewesen" as the model for
   * the sein verbs; the next lesson gave the same sentence no credit as a
   * verb-tense mistake and said "Not wrong, but nobody says it". B1 marked
   * "Ich hoffe, dass ich bald einen Termin bekomme." as a word-order mistake
   * while its own feedback said "Grammatically correct", and the final check
   * rejected it too. "Pfand zurückbekommen" is ordinary German and was an
   * extra word.
   */
  it('credits them, and still shows the form being taught', () => {
    expect(
      rejected({
        'a2u1l3-ex2-s1': [
          'Letztes Wochenende bin ich in Berlin gewesen.',
          'Ich bin letztes Wochenende in Berlin gewesen.',
        ],
        'b1u2l2-ex2-s1': ['Ich hoffe, dass ich bald einen Termin bekomme.'],
        'b1u2l2-m1-s1': ['Ich hoffe, dass ich bald einen Termin bekomme.'],
        'sc-supermarket-a2-t2-s1': [
          'Bekomme ich für diese Flaschen Pfand zurück?',
          'Bekomme ich für diese Flaschen das Pfand zurück?',
        ],
      }),
    ).toEqual([]);
    const result = validateAnswer('Ich bin letztes Wochenende in Berlin gewesen.', step('a2u1l3-ex2-s1').answer, opts);
    expect(result.target).toBe('Letztes Wochenende war ich in Berlin.');
  });

  it('keeps a trap that admits the German is correct only where it means something else here', () => {
    // Each of these was read on purpose: the sentence is real German, but for
    // another meaning (ist ausgefüllt), another register (von + dative in a
    // written application) or another move (naming a culprit).
    const reviewed = new Set(['b1u2l1-ex3-s1', 'b1u4l1-ex2-s1', 'sc-bakery-b1-t1-s1']);
    const admitting = /not wrong|grammatically correct|correct german/i;
    const found: string[] = [];
    for (const [id, entry] of STEPS) {
      for (const trap of entry.answer.trapAnswers ?? []) {
        if (admitting.test(trap.feedback.en) && !reviewed.has(id)) found.push(`${id}: ${trap.answer}`);
      }
    }
    expect(found).toEqual([]);
  });
});

describe('A2 accepts what it teaches', () => {
  /*
   * The future lesson teaches "Ich werde Deutsch lernen" and then marked
   * "Morgen werde ich Deutsch lernen." as a vocabulary mistake, in the final
   * check and the unit checkpoint too. The same "I think that …" needed
   * glaube in one step and denke in the next, each rejecting the other,
   * although the lesson teaches both. And "Du solltest viel Tee trinken.",
   * the ordinary way to give advice, was wrong everywhere, the level
   * checkpoint included.
   */
  it('takes the werden future, either verb of thinking, and solltest', () => {
    expect(
      rejected({
        'a2u3l3-ex1-s1': ['Morgen werde ich Deutsch lernen.', 'Ich werde morgen Deutsch lernen.'],
        'a2u3l3-m1-s1': ['Morgen werde ich Deutsch lernen.'],
        'cp-a2u3-3-s3': ['Morgen werde ich Deutsch lernen.'],
        'a2u3l1-ex2-s1': ['Ich denke, dass Deutsch schwer ist.'],
        'a2u3l1-ex2-s2': ['Ich glaube, dass das gut ist.'],
        'a2u3l1-m1-s1': ['Ich denke, dass Deutsch schwer ist.'],
        'cp-a2u3-1-s1': ['Ich denke, dass Deutsch schwer ist.'],
        'a2-lcp-2-s2': ['Ich denke, dass Deutsch schwer ist.'],
        'a2u4l2-ex2-s1': ['Du solltest viel Tee trinken.'],
        'a2u4l2-m1-s1': ['Du solltest viel Tee trinken.'],
        'cp-a2u4-2-s1': ['Du solltest viel Tee trinken.'],
        'a2-lcp-4-s3': ['Du solltest viel Tee trinken.'],
        'a2u4l3-ex2-s3': ['Sie sollten sich ausruhen.'],
      }),
    ).toEqual([]);
  });
});

describe('the same prompt, the same answers', () => {
  /*
   * A lesson, its final check, the unit checkpoint and the level checkpoint
   * often ask the very same question. When one of them accepts a sentence
   * and another rejects it, the learner is marked wrong for what the course
   * taught them a page earlier. Typed steps with the same English prompt must
   * accept each other's answers. (The placement check is left out: it
   * measures rather than teaches, so it is deliberately the more generous.)
   */
  it('holds across A2, B1 and B2', () => {
    const byPrompt = new Map<string, ExerciseStep[]>();
    const typed = [
      ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
      ...allCheckpoints()
        .filter((checkpoint) => checkpoint.scope !== 'placement')
        .flatMap((checkpoint) => checkpoint.exercises),
    ].filter(
      (exercise) =>
        ['a2', 'b1', 'b2'].includes(exercise.level) &&
        !['multipleChoice', 'listenChoose', 'dictation', 'freeWriting', 'wordOrder', 'sentenceBuild'].includes(exercise.kind),
    );
    for (const exercise of typed) {
      for (const entry of exercise.steps) {
        if (!entry.prompt || entry.scaffold || entry.wordBank) continue;
        const key = entry.prompt.en.toLowerCase().replace(/[^a-z ]/g, '').trim();
        byPrompt.set(key, [...(byPrompt.get(key) ?? []), entry]);
      }
    }
    const out: string[] = [];
    for (const group of byPrompt.values()) {
      for (const a of group) {
        for (const b of group) {
          if (a === b) continue;
          for (const answer of [...b.answer.accepted, ...(b.answer.alternatives ?? [])]) {
            if (!isRight(answer, a.id)) out.push(`${a.id} rejects "${answer}" (right in ${b.id})`);
          }
        }
      }
    }
    expect([...new Set(out)]).toEqual([]);
  });
});

describe('the Bulgarian prompt asks for the register the answer is in', () => {
  /*
   * Six B1 steps, one of them in a unit checkpoint, said "ти" in Bulgarian
   * ("За специалиста ти трябва направление.") while only the Sie form was
   * accepted, so a Bulgarian-path learner who translated faithfully wrote du
   * and was marked wrong. English "you" is neutral; Bulgarian is not.
   */
  it('never says ти where only Sie is accepted', () => {
    const informal = /(?<!\p{L})(ти|твой|твоя|твое|твоите|имаш|можеш|искаш|знаеш)(?!\p{L})/iu;
    const formal = /(^|[^.!?]\s)(Sie|Ihnen|Ihr\w*)\b|^(Können|Könnten|Würden|Haben|Sind|Möchten|Brauchen)\s+Sie\b/;
    const du = /\b(du|dich|dir|dein\w*)\b/i;
    const out: string[] = [];
    const exercises = [
      ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
      ...allCheckpoints().flatMap((checkpoint) => checkpoint.exercises),
    ].filter((exercise) => ['a2', 'b1', 'b2'].includes(exercise.level) && exercise.kind !== 'freeWriting');
    for (const exercise of exercises) {
      for (const entry of exercise.steps) {
        if (!entry.prompt?.bg) continue;
        const answers = [...entry.answer.accepted, ...(entry.answer.alternatives ?? [])];
        const onlySie = answers.some((answer) => formal.test(answer)) && !answers.some((answer) => du.test(answer));
        if (onlySie && informal.test(entry.prompt.bg)) out.push(`${entry.id}: ${entry.prompt.bg}`);
      }
    }
    expect(out).toEqual([]);
  });
});

describe('both ways of saying something hurts', () => {
  /*
   * Bulgarian says "Боли ме гърбът" for both "I have back pain" and "My back
   * hurts", so a Bulgarian-path learner cannot tell which German shape a step
   * wants, and the other one, equally correct, was marked wrong: in the A2
   * final check and unit checkpoint too. The A2 doctor scenario, whose prompt
   * is literally "Your throat has hurt", rejected "Mein Hals tut … weh".
   */
  it('accepts -schmerzen and tut weh alike', () => {
    expect(
      rejected({
        'a2u4l3-ex1-s1': ['Mein Rücken tut weh.'],
        'a2u4l3-ex1-s2': ['Ich habe Zahnschmerzen.', 'Mir tut der Zahn weh.'],
        'a2u4l3-m1-s1': ['Mein Rücken tut weh.'],
        'cp-a2u4-3-s1': ['Mein Rücken tut weh.', 'Mir tut der Rücken weh.'],
        'sc-doctor-a2-t1-s1': ['Mein Hals tut seit drei Tagen weh.', 'Seit drei Tagen tut mein Hals weh.'],
      }),
    ).toEqual([]);
  });

  it('keeps the same Bulgarian prompt answerable the same way across A2, B1 and B2', () => {
    // The English prompts differ ("I have back pain" / "My back hurts"); the
    // Bulgarian ones do not, so they are compared on their own.
    const byPrompt = new Map<string, ExerciseStep[]>();
    const typed = [
      ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
      ...allCheckpoints()
        .filter((checkpoint) => checkpoint.scope !== 'placement')
        .flatMap((checkpoint) => checkpoint.exercises),
    ].filter((exercise) => ['a2', 'b1', 'b2'].includes(exercise.level) && exercise.kind === 'type');
    for (const exercise of typed) {
      for (const entry of exercise.steps) {
        if (!entry.prompt?.bg || entry.scaffold || entry.wordBank) continue;
        const key = entry.prompt.bg.toLowerCase().replace(/[^\p{L} ]/gu, '').trim();
        byPrompt.set(key, [...(byPrompt.get(key) ?? []), entry]);
      }
    }
    const out: string[] = [];
    for (const group of byPrompt.values()) {
      for (const a of group) {
        for (const b of group) {
          if (a === b) continue;
          for (const answer of b.answer.accepted) {
            if (!isRight(answer, a.id)) out.push(`${a.id} rejects "${answer}" (right in ${b.id})`);
          }
        }
      }
    }
    expect([...new Set(out)]).toEqual([]);
  });
});

describe('a time phrase may come first', () => {
  /*
   * Putting a time phrase first and the verb second is the central rule of
   * A1, and it was a word-order mistake whenever the model answer happened
   * not to front it: "Letzten Monat sind wir eingezogen.", "Zweimal pro Woche
   * arbeite ich im Homeoffice.", "Seit fünf Jahren arbeite ich in der
   * Logistik …". The same went for ordinary reorderings of the middle of the
   * sentence at B1 and B2.
   */
  it('accepts the fronted order wherever the answer starts with subject, verb, time', () => {
    const TIME = String.raw`(heute|morgen|gestern|jetzt|bald|um \S+ Uhr|letzte[nm]? (?:Woche|Monat|Jahr|Wochenende)|nächste[nm]? (?:Woche|Monat|Jahr|Wochenende)|seit (?:\S+ )?(?:Tagen|Wochen|Monaten|Jahren)|zweimal pro Woche|jeden (?:Tag|Morgen|Abend))`;
    const pattern = new RegExp(String.raw`^(Ich|Wir|Er|Du|Ihr) ([^\s,]+) ${TIME} (.+)$`);
    const typed = [
      ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
      ...allCheckpoints()
        .filter((checkpoint) => checkpoint.scope !== 'placement')
        .flatMap((checkpoint) => checkpoint.exercises),
      ...SCENARIO_SCRIPTS.flatMap((script) =>
        script.beats.flatMap((beat) => (beat.who === 'you' ? [beat.exercise] : [])),
      ),
    ].filter((exercise) => ['a2', 'b1', 'b2'].includes(exercise.level) && exercise.kind === 'type');
    const out: string[] = [];
    let checked = 0;
    for (const exercise of typed) {
      for (const entry of exercise.steps) {
        if (entry.scaffold || entry.wordBank) continue;
        const match = pattern.exec(entry.answer.accepted[0]!);
        if (!match) continue;
        const [, subject, verb, time, rest] = match;
        const fronted = `${time![0]!.toUpperCase()}${time!.slice(1)} ${verb} ${subject === 'Ich' ? 'ich' : subject!.toLowerCase()} ${rest}`;
        checked += 1;
        if (!isRight(fronted, entry.id)) out.push(`${entry.id}: ${fronted}`);
      }
    }
    expect(checked).toBeGreaterThan(5);
    expect(out).toEqual([]);
  });

  it('accepts the ordinary middle-field orders it used to call word-order mistakes', () => {
    expect(
      rejected({
        'b1u6l1-ex2-s4': ['Ich stimme dir da zu.'],
        'b1u6l1-m1-s3': ['Ich stimme dir da zu.'],
        'b2u1l2-ex3-s1': ['Ich würde vorschlagen, dass wir die Zahlen zuerst prüfen.'],
        'b2u1l2-m1-s1': ['Ich würde vorschlagen, dass wir die Zahlen zuerst prüfen.'],
        'cp-b2u1-3-s1': ['Ich würde vorschlagen, dass wir die Zahlen zuerst prüfen.'],
        'b2u2l3-m1-s2': ['Ich hätte da Bedenken.'],
      }),
    ).toEqual([]);
  });
});

describe('answers that contradicted their own prompt or the course', () => {
  /*
   * "ends at four o'clock" accepted only "um sechzehn Uhr"; "Die Lieferung ist
   * beschädigt angekommen." was a missing word although a later model answer
   * says exactly that; "I request a refund" rejected "eine Rückerstattung";
   * "the schedule is tight" rejected eng, which B2 Unit 1 taught for it; the
   * bakery turn that teaches in + dative rejected "im Brot"; the Präteritum
   * unit rejected a Präteritum; "Rising rents" rejected "Steigende Mieten";
   * and "nach dem Feierabend" was the only answer where German says "nach
   * Feierabend".
   */
  it('accepts them', () => {
    expect(
      rejected({
        'b1u5l3-ex3-s2': ['Die Betreuung endet um vier Uhr.', 'Die Betreuung endet um 16 Uhr.'],
        'b1u5l3-ex3-s4': ['Meine Mutter kümmerte sich um uns.'],
        'b1u3l1-m1-s1': ['Ich möchte einen Termin.', 'Ich hätte gerne einen Termin.'],
        'b2u4l1-ex3-s1': ['Die Lieferung ist beschädigt angekommen.'],
        'b2u4l1-m1-s1': ['Die Lieferung ist beschädigt angekommen.'],
        'b2u4l1-ex3-s4': ['Ich bitte um eine Rückerstattung des Kaufpreises.'],
        'b2u2l3-ex2-s2': ['Ich räume ein, dass der Zeitplan eng ist.'],
        'b2u2l3-m1-s3': ['Ich räume ein, dass der Zeitplan eng ist.'],
        'sc-bakery-a2-t1-s1': ['Was ist im Brot?', 'Was ist im dunklen Brot?'],
        'b2u3l1-ex4-s2': ['Steigende Mieten sind das Hauptthema der Woche.'],
        'b2u5l2-ex3-s4': ['Ich melde mich nach Feierabend.'],
      }),
    ).toEqual([]);
    expect(step('b2u5l2-ex3-s4').answer.accepted[0]).toBe('Ich melde mich nach Feierabend.');
  });
});

describe('free writing asks for what the task says', () => {
  /*
   * Free writing will not move on until every required word is there, and
   * the required words went beyond the instructions: "ask whether it can be
   * repaired" refused "Kann die Heizung repariert werden?" for want of
   * "kaputt" and "reparieren"; "a Perfekt" had to be "verpasst"; "one -bar
   * adjective" had to be "machbar" (absehbar, from the same lesson, failed);
   * "a genitive preposition" had to be "Aufgrund"; "a sein-participle" had to
   * use "bin". And two model answers, shown to the learner afterwards, did
   * not do what their own task asked.
   */
  const writing = [
    ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
    ...allCheckpoints().flatMap((checkpoint) => checkpoint.exercises),
  ].filter((exercise) => exercise.kind === 'freeWriting' && ['a2', 'b1', 'b2'].includes(exercise.level));

  it('lets every model answer through its own check', () => {
    const out: string[] = [];
    for (const exercise of writing) {
      for (const entry of exercise.steps) {
        const result = checkFreeWriting(entry.answer.accepted[0]!, entry.answer);
        if (!result.satisfied) out.push(`${entry.id}: missing ${result.missingRequired.join(', ')}`);
      }
    }
    expect(writing.length).toBeGreaterThan(5);
    expect(out).toEqual([]);
  });

  it('lets through a text that does what the instruction asks in other words', () => {
    const texts: Record<string, string> = {
      'a2u2l3-ex5-s1':
        'Die Heizung funktioniert nicht. Ich rufe an, weil es in der Wohnung kalt ist. Kann die Heizung repariert werden?',
      'a2u5l3-ex5-s1':
        'Wir sind nach Hamburg gefahren. Das Auto ist stehen geblieben, weil es sehr alt war. Wir haben lange gewartet. Im Sommer war die Fahrt besser.',
      'a2u1l3-ex5-s1':
        'Letztes Wochenende war ich in Köln. Wir haben viel gegessen. Wir sind ins Kino gegangen. Es war schön.',
      'a2-lcp-8-s1':
        'Letztes Wochenende sind wir nach Wien gefahren. Wir haben ein Museum besucht. Das Hotel war laut, weil die Straße voll war. Im Mai war es besser. Es hat trotzdem Spaß gemacht.',
      'b2u1l3-ex4-s1':
        'Die Tests sind abgeschlossen worden. Die Durchführung der Schulung dauert länger als geplant.',
      'b2u3l3-ex4-s1':
        'Die Reform wurde beschlossen. Sie hat Auswirkungen auf viele Familien. Die Folgen sind noch nicht absehbar.',
      'b2u4l3-ex3-s1':
        'Ich schreibe Ihnen wegen der beschädigten Lieferung. Trotz zweier Anrufe hat sich nichts geändert. Ich bitte um Ersatz bis zum 15. Mai. Andernfalls trete ich vom Kauf zurück.',
    };
    const out: string[] = [];
    for (const [id, text] of Object.entries(texts)) {
      const result = checkFreeWriting(text, step(id).answer);
      if (!result.satisfied) out.push(`${id}: missing ${result.missingRequired.join(', ')}`);
    }
    expect(out).toEqual([]);
  });

  it('shows model answers that do what their task asks', () => {
    // "Use at least one relative clause."
    expect(step('b1u1l3-ex4-s1').answer.accepted[0]).toMatch(/, (der|die|das) /);
    // A damaged delivery and two phone calls, not a letter nobody sent.
    const complaint = step('b2u4l3-ex3-s1').answer.accepted[0]!;
    expect(complaint).not.toContain('Ihr Schreiben');
    expect(complaint).toMatch(/Anruf/);
  });
});

describe('the B2 Unit 5 checkpoint says to write the full form', () => {
  /*
   * The prompt was only 'You hear: "Haste mal kurz?"', under "Write out what
   * was said" / "Запиши казаното", so a learner who wrote down what was said
   * was marked wrong for it. The level checkpoint says "write it out in full"
   * for the same task.
   */
  it('asks for the full form in both languages', () => {
    for (const id of ['cp-b2u5-2-s1', 'cp-b2u5-2-s2', 'cp-b2u5-2-s3']) {
      expect(step(id).prompt!.en, id).toContain('write it out in full');
      expect(step(id).prompt!.bg, id).toContain('напиши го изцяло');
    }
  });
});

describe('scenario hints and wording', () => {
  /*
   * Hints counted the wrong number of words ("Three words" for "Auf
   * Wiedersehen!", "Two words, both short" for "Klar, kein Problem."); a
   * formal goodbye accepted "Tschüss!" at full credit; an instruction said
   * "both in the Perfekt … then a plain past"; and a Bulgarian outro began
   * with a word written half in Latin and half in Cyrillic letters.
   */
  it('counts the words it says it counts', () => {
    const count = (id: string) =>
      step(id).answer.accepted[0]!.split(/\s+/).filter((word) => /\p{L}/u.test(word)).length;
    expect(count('sc-bakery-pre-a1-t3-s2')).toBe(2);
    expect(step('sc-bakery-pre-a1-t3-s2').hints[0]!.en).toMatch(/^Two words/);
    expect(count('sc-neighbours-a2-t1-s1')).toBe(3);
    expect(step('sc-neighbours-a2-t1-s1').hints[0]!.en).toMatch(/^Three /);
    expect(step('sc-neighbours-a2-t1-s1').hints[0]!.bg).toMatch(/^Три /);
    expect(count('sc-bank-a2-t2-s1')).toBe(4);
    expect(step('sc-bank-a2-t2-s1').hints[0]!.en).toMatch(/^Four words/);
    expect(step('sc-bank-a2-t2-s1').hints[0]!.bg).toMatch(/^Четири думи/);
  });

  it('does not give full credit for an informal goodbye when a formal one is asked for', () => {
    const result = validateAnswer('Tschüss!', step('sc-bakery-pre-a1-t3-s2').answer, opts);
    expect(result.credit).toBe(0);
    expect(result.trapFeedback?.en).toMatch(/informal/);
  });

  it('describes the tenses the answer uses', () => {
    const instruction = step('sc-emergency-b1-t1-s1').instruction!.en;
    expect(instruction).not.toMatch(/both in the Perfekt/);
    expect(instruction).toMatch(/Perfekt/);
    expect(instruction).toMatch(/simple past/);
  });

  it('never writes a word in two alphabets at once', () => {
    const mixed = /[A-Za-z][Ѐ-ӿ]|[Ѐ-ӿ][A-Za-z]/;
    const found: string[] = [];
    const seen = new Set<unknown>();
    const walk = (node: unknown): void => {
      if (typeof node === 'string') {
        if (mixed.test(node)) found.push(node.slice(0, 80));
        return;
      }
      if (typeof node !== 'object' || node === null || seen.has(node)) return;
      seen.add(node);
      for (const value of Object.values(node)) walk(value);
    };
    walk(SCENARIO_SCRIPTS);
    walk(CURRICULUM);
    expect(found).toEqual([]);
  });
});

describe('register traps say what is actually wrong', () => {
  /*
   * "Ja, das passt dir gut." is a mir/dir slip, and its feedback said it was
   * the wrong register and should be Sie, which leads to "das passt Ihnen",
   * just as wrong. A trap on the informal neighbour said "Sie sounds like
   * you are addressing a stranger" about a sentence with no Sie in it. And
   * the shared text said "someone behind a counter" to a neighbour on the
   * stairs and a job interviewer.
   */
  it('explains the mir/dir slip as a mir/dir slip', () => {
    const result = validateAnswer('Ja, das passt dir gut.', step('sc-doctor-a1-t4-s1').answer, opts);
    expect(result.credit).toBe(0);
    expect(result.trapFeedback?.en).toContain('das passt mir');
    expect(result.trapFeedback?.en).not.toContain('"Sie"');
  });

  it('only calls a sentence too formal when it says Sie', () => {
    for (const trap of step('sc-neighbours-a2-t1-s1').answer.trapAnswers ?? []) {
      expect(trap.answer).toMatch(/\bSie\b|\bIhnen\b/);
    }
  });

  it('does not put every formal partner behind a counter', () => {
    const counter: string[] = [];
    for (const script of SCENARIO_SCRIPTS) {
      for (const beat of script.beats) {
        if (beat.who !== 'you') continue;
        for (const entry of beat.exercise.steps) {
          for (const trap of entry.answer.trapAnswers ?? []) {
            // The shared register trap, which is used whoever the partner is.
            if (!trap.feedback.en.startsWith('Right words, wrong person.')) continue;
            if (/counter/.test(trap.feedback.en) || /гише/.test(trap.feedback.bg)) {
              counter.push(`${entry.id} (${script.partner.en})`);
            }
          }
        }
      }
    }
    expect(counter).toEqual([]);
  });
});

describe('a word is displayed as German only', () => {
  /*
   * "finden (= to think)" was the display of a B1 opinion word, and display
   * is what the word page plays, what the recorded voice read out (English
   * gloss and all), and what the pronunciation check compares with, so a
   * correctly spoken "finden" was judged a missing word.
   */
  it('keeps glosses out of every display', () => {
    const glossed = VOCABULARY.filter((entry) => /[(=]/.test(entry.display)).map((entry) => `${entry.id}: ${entry.display}`);
    expect(glossed).toEqual([]);
  });
});

describe('figures written as digits', () => {
  /*
   * The B2 lesson on reporting figures writes "um 10 %" and "30 %" in its own
   * table, and then marked "um 10 Prozent" and "um 10 %" as vocabulary
   * mistakes; at B1 "um 10 Uhr" and "5 Euro" were wrong too. Where a B1 or B2
   * answer spells out a percentage, an amount of euros or a clock time, the
   * digits are right as well (and a heard number can be written either way).
   */
  const WORDS: Record<string, string> = {
    fünf: '5',
    zehn: '10',
    zwölf: '12',
    sechzehn: '16',
    dreißig: '30',
    neunhundert: '900',
  };
  const figure = new RegExp(`\\b(${Object.keys(WORDS).join('|')}) (Prozent|Euro|Uhr)\\b`);

  it('accepts the digits wherever a percentage, a price or a time is spelled out', () => {
    const exercises = [
      ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
      ...allCheckpoints()
        .filter((checkpoint) => checkpoint.scope !== 'placement')
        .flatMap((checkpoint) => checkpoint.exercises),
    ].filter(
      (exercise) =>
        ['b1', 'b2'].includes(exercise.level) &&
        ['type', 'dictation', 'partialRecall'].includes(exercise.kind),
    );
    const out: string[] = [];
    let checked = 0;
    for (const exercise of exercises) {
      for (const entry of exercise.steps) {
        const answer = entry.answer.accepted[0]!;
        const match = figure.exec(answer);
        if (!match || entry.scaffold) continue;
        const digits = answer.replace(figure, `${WORDS[match[1]!]} ${match[2]}`);
        const forms = match[2] === 'Prozent' ? [digits, digits.replace(' Prozent', ' %')] : [digits];
        for (const form of forms) {
          checked += 1;
          if (!isRight(form, entry.id)) out.push(`${entry.id}: ${form}`);
        }
      }
    }
    expect(checked).toBeGreaterThan(5);
    expect(out).toEqual([]);
  });

  it('accepts the number spelled out where the answer has digits', () => {
    expect(
      rejected({
        'b2u3l2-ex3-s3': ['Die Miete beträgt durchschnittlich neunhundert Euro.'],
        'b2u3l2-ex4-s2': ['Die Miete beträgt durchschnittlich neunhundert Euro.'],
      }),
    ).toEqual([]);
  });
});
