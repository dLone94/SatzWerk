import { describe, expect, it } from 'vitest';
import {
  CURRICULUM,
  LEXICON,
  SCENARIOS,
  SCENARIO_SCRIPTS,
  allLessons,
  lessonById,
  resolveTarget,
  scenarioStatus,
  scriptAnswerCount,
  scriptById,
  scriptFor,
} from '../../src/content/index.ts';
import type { Bilingual, ScenarioScript, TeachingLanguage } from '../../src/content/types.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';
import { segmentsOf } from '../../src/ui/components/ScenarioPlayer.tsx';

/**
 * The Real Life scenarios, held to the same standard as the course.
 *
 * A conversation that cannot be finished is worse than one that does not
 * exist: the learner is stuck mid-sentence in a room they came to practise.
 * So every authored answer is typed into the real validator here, every trap
 * is confirmed to be rejected, and every script is confirmed to be playable
 * from beginning to end in both teaching paths.
 */

const opts = { lexicon: LEXICON };
const LANGS: TeachingLanguage[] = ['en', 'bg'];

function stepsOf(script: ScenarioScript) {
  return script.beats.flatMap((beat) =>
    beat.who === 'you' ? beat.exercise.steps.map((step) => ({ exercise: beat.exercise, step })) : [],
  );
}

function isBilingual(value: unknown): value is Bilingual {
  if (typeof value !== 'object' || value === null) return false;
  const keys = Object.keys(value);
  return keys.length === 2 && keys.includes('en') && keys.includes('bg');
}

function collectBilinguals(node: unknown, out: Bilingual[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectBilinguals(item, out);
    return;
  }
  if (typeof node !== 'object' || node === null) return;
  if (isBilingual(node)) {
    out.push(node);
    return;
  }
  for (const value of Object.values(node as Record<string, unknown>)) collectBilinguals(value, out);
}

describe('scenario scripts', () => {
  it('has at least one playable conversation', () => {
    expect(SCENARIO_SCRIPTS.length).toBeGreaterThan(0);
  });

  it('uses unique ids, for scripts and for every answer step', () => {
    const scriptIds = SCENARIO_SCRIPTS.map((script) => script.id);
    expect(new Set(scriptIds).size).toBe(scriptIds.length);

    const stepIds = SCENARIO_SCRIPTS.flatMap((script) => stepsOf(script).map(({ step }) => step.id));
    expect(new Set(stepIds).size).toBe(stepIds.length);

    // Not merely unique among themselves: unique against the course, because
    // step ids are the key that progress and the mistake bank are stored under.
    const lessonStepIds = new Set(
      allLessons().flatMap((lesson) =>
        [...lesson.exercises, ...lesson.mastery.exercises].flatMap((exercise) =>
          exercise.steps.map((step) => step.id),
        ),
      ),
    );
    expect(stepIds.filter((id) => lessonStepIds.has(id))).toEqual([]);
  });

  it('belongs to a scenario and a level that the outline declares', () => {
    for (const script of SCENARIO_SCRIPTS) {
      const scenario = SCENARIOS.find((entry) => entry.id === script.scenarioId);
      expect(scenario, `${script.id} points at an unknown scenario`).toBeDefined();
      const stage = scenario!.stages.find((entry) => entry.level === script.level);
      expect(stage, `${script.id} is at a level the scenario has no stage for`).toBeDefined();
      expect(CURRICULUM.some((level) => level.id === script.level)).toBe(true);
    }
  });

  it('keeps the register the scenario says it is in', () => {
    for (const script of SCENARIO_SCRIPTS) {
      const scenario = SCENARIOS.find((entry) => entry.id === script.scenarioId)!;
      if (scenario.register === 'both') continue;
      expect(script.register, `${script.id}`).toBe(scenario.register);
    }
  });

  it('never uses the wrong pronoun in a canonical answer', () => {
    // A "Sie" conversation whose model answer says "du" would teach the exact
    // mistake the scenario exists to prevent.
    const offenders: string[] = [];
    for (const script of SCENARIO_SCRIPTS) {
      const banned = script.register === 'Sie' ? /\b(du|dich|dir|dein\w*)\b/ : /\bSie\b/;
      for (const { step } of stepsOf(script)) {
        for (const answer of step.answer.accepted) {
          if (banned.test(answer)) offenders.push(`${step.id}: ${answer}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('points every review target and lesson link at something real', () => {
    const missing: string[] = [];
    for (const script of SCENARIO_SCRIPTS) {
      for (const id of script.lessonIds ?? []) {
        if (!lessonById(id)) missing.push(`${script.id} -> lesson ${id}`);
      }
      for (const { step } of stepsOf(script)) {
        for (const target of step.reviewTargets ?? []) {
          if (!resolveTarget(target)) missing.push(`${step.id} -> ${target}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('accepts every canonical answer as fully correct', () => {
    const failures: string[] = [];
    for (const script of SCENARIO_SCRIPTS) {
      for (const { step } of stepsOf(script)) {
        for (const answer of step.answer.accepted) {
          const result = validateAnswer(answer, step.answer, opts);
          if (result.credit < 1) failures.push(`${step.id}: "${answer}" -> ${result.verdict}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('credits every authored alternative without making it the target', () => {
    const failures: string[] = [];
    for (const script of SCENARIO_SCRIPTS) {
      for (const { step } of stepsOf(script)) {
        for (const alternative of step.answer.alternatives ?? []) {
          const result = validateAnswer(alternative, step.answer, opts);
          if (result.credit < 1) failures.push(`${step.id}: "${alternative}" -> ${result.verdict}`);
          if (result.target !== step.answer.accepted[0]) {
            failures.push(`${step.id}: "${alternative}" changed the taught form`);
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('rejects every authored trap with its own explanation', () => {
    const failures: string[] = [];
    for (const script of SCENARIO_SCRIPTS) {
      for (const { step } of stepsOf(script)) {
        for (const trap of step.answer.trapAnswers ?? []) {
          const result = validateAnswer(trap.answer, step.answer, opts);
          if (result.credit >= 1) failures.push(`${step.id}: trap "${trap.answer}" was accepted`);
          if (!result.categories.includes(trap.category)) {
            failures.push(`${step.id}: trap "${trap.answer}" lost its category ${trap.category}`);
          }
          for (const lang of LANGS) {
            expect(trap.feedback[lang].trim(), `${step.id} trap (${lang})`).not.toBe('');
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('is playable to the end in both teaching paths', () => {
    for (const script of SCENARIO_SCRIPTS) {
      for (const lang of LANGS) {
        const segments = segmentsOf(script, lang);
        expect(segments.length, `${script.id} (${lang}) has no segments`).toBeGreaterThan(0);
        expect(
          scriptAnswerCount(script, lang),
          `${script.id} (${lang}) asks the learner to say nothing`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('gives the learner a way past every step without guessing', () => {
    // Either a hint ladder or an authored alternative. A step with neither is
    // a dead end for anyone who does not already know the sentence.
    const bare: string[] = [];
    for (const script of SCENARIO_SCRIPTS) {
      for (const { step } of stepsOf(script)) {
        if (step.hints.length === 0 && (step.answer.alternatives ?? []).length === 0) {
          bare.push(step.id);
        }
      }
    }
    expect(bare).toEqual([]);
  });

  it('never nests quotation marks inside a task prompt', () => {
    /*
     * The player wraps a Bulgarian prompt in „…“, because in a lesson the
     * prompt is the sentence to produce. In a scenario it is an instruction,
     * and a prompt that quotes something itself came out as
     * „… като „без ядки“. Попитай …“ — two openings, one closing, unreadable.
     * Instructions and hints are not wrapped, so they may quote freely; this
     * only constrains the prompt.
     */
    const offenders: string[] = [];
    for (const script of SCENARIO_SCRIPTS) {
      for (const { step } of stepsOf(script)) {
        if (!step.prompt) continue;
        if (/[„“]/.test(step.prompt.bg)) offenders.push(`${step.id}: ${step.prompt.bg}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('writes both paths, in the scripts the course teaches in', () => {
    const ALLOWED_PUNCTUATION = new Set([...'—–…„“”‘’•→·×°²½€«»№']);
    const problems: string[] = [];
    for (const script of SCENARIO_SCRIPTS) {
      const texts: Bilingual[] = [];
      collectBilinguals(script, texts);
      for (const text of texts) {
        for (const lang of LANGS) {
          if (text[lang].trim() === '') problems.push(`${script.id}: empty ${lang}`);
          for (const character of text[lang]) {
            if (character.codePointAt(0)! < 128) continue;
            if (ALLOWED_PUNCTUATION.has(character)) continue;
            if (/[À-ɏЀ-ӿ]/.test(character)) continue;
            problems.push(`${script.id} (${lang}): ${JSON.stringify(character)}`);
          }
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it('writes the Bulgarian path in Cyrillic rather than copying the English', () => {
    const suspicious: string[] = [];
    const cyrillic = /[Ѐ-ӿ]/;
    const englishOnly = / (the|you|your|with|and|from|this|that|for|of|are) /i;
    for (const script of SCENARIO_SCRIPTS) {
      const texts: Bilingual[] = [];
      collectBilinguals(script, texts);
      for (const text of texts) {
        const bg = text.bg.trim();
        if (bg.length === 0) continue;
        const shared = bg === text.en.trim();
        if (!cyrillic.test(bg) && !shared) {
          suspicious.push(`${script.id}: Latin-script bg -> "${bg.slice(0, 48)}"`);
        } else if (shared && englishOnly.test(` ${bg} `)) {
          suspicious.push(`${script.id}: English copied into bg -> "${bg.slice(0, 48)}"`);
        }
      }
    }
    expect(suspicious).toEqual([]);
  });

  it('teaches, rather than translating: the two paths differ where the languages do', () => {
    // At least some of the notes and prompts must say different things, or one
    // path is being run through a translator.
    let differing = 0;
    for (const script of SCENARIO_SCRIPTS) {
      for (const beat of script.beats) {
        if (beat.who !== 'them' || !beat.note) continue;
        if (beat.note.en !== beat.note.bg) differing += 1;
      }
    }
    expect(differing).toBeGreaterThan(0);
  });
});

describe('scenario status', () => {
  it('is derived from the scripts, never asserted', () => {
    for (const scenario of SCENARIOS) {
      const written = scenario.stages.filter((stage) => scriptFor(scenario.id, stage.level)).length;
      const expected = written === 0 ? 'planned' : written === scenario.stages.length ? 'available' : 'partial';
      expect(scenarioStatus(scenario), scenario.id).toBe(expected);
    }
  });

  it('finds every script by its id', () => {
    for (const script of SCENARIO_SCRIPTS) {
      expect(scriptById(script.id)).toBe(script);
    }
    expect(scriptById('sc-nothing-here')).toBeUndefined();
  });
});

/** Every scenario answer step, by id. */
function scenarioStep(id: string) {
  for (const script of SCENARIO_SCRIPTS) {
    const found = stepsOf(script).find(({ step }) => step.id === id);
    if (found) return found.step;
  }
  throw new Error(`no scenario step ${id}`);
}

/** The rule the exercise player uses to count an answer as right. */
function isClean(given: string, id: string): boolean {
  const result = validateAnswer(given, scenarioStep(id).answer, opts);
  return (
    result.verdict === 'correct' ||
    result.verdict === 'accepted-variant' ||
    (result.verdict === 'accepted-with-note' && !result.requireRetype)
  );
}

describe('scenario answers without a filler nobody asked for', () => {
  /*
   * Many model answers open with "Ja,", "Guten Tag," or "Gut,", and the same
   * sentence without it used to be a missing-word mistake with no credit. The
   * prompt "Say that you will stay on the line." rejected "Ich bleibe am
   * Telefon."; "Thursday works." rejected "Das passt mir gut.". Where the
   * prompt or the instruction asks for the yes, the greeting or the thanks
   * ("Yes, for two weeks.", "Greet first"), the turn stays strict; these do
   * not ask for it.
   */
  const WITHOUT_FILLER: Record<string, string[]> = {
    'sc-bakery-b1-t1-s1': ['Ich glaube, da ist ein Fehler passiert.', 'Da stimmt etwas nicht.'],
    'sc-restaurant-b1-t1-s1': ['Die Suppe ist leider nicht warm.'],
    'sc-restaurant-b1-t4-s1': ['Vielen Dank!'],
    'sc-supermarket-a2-t1-s1': ['Wo ist die Milch?'],
    'sc-supermarket-a2-t4-s1': ['Vielen Dank!'],
    'sc-doctor-a1-t1-s1': ['Ich möchte einen Termin machen.', 'Ich hätte gern einen Termin.'],
    'sc-doctor-a1-t4-s1': ['Das passt mir gut.', 'Das passt.', 'Donnerstag um zehn passt mir.'],
    'sc-doctor-a2-t2-s1': ['Gestern hatte ich achtunddreißig Grad.', 'Gestern hatte ich 38 Grad.'],
    'sc-doctor-b1-t1-s1': ['Die Beschwerden sind seitdem nicht besser geworden.'],
    'sc-doctor-b1-t2-s1': ['Ich nehme seit einer Woche ein Schmerzmittel.', 'Ein Schmerzmittel, seit einer Woche.'],
    'sc-pharmacy-a1-t4-s1': ['Das nehme ich. Vielen Dank!'],
    'sc-pharmacy-a2-t1-s1': ['Ich habe ein Rezept.', 'Hier ist mein Rezept.'],
    'sc-pharmacy-a2-t4-s1': ['Vielen Dank!'],
    'sc-pharmacy-b1-t4-s1': ['Dann nehme ich das. Vielen Dank für die Beratung!'],
    'sc-emergency-a1-t3-s1': ['Er antwortet, aber sehr leise.'],
    'sc-emergency-a1-t4-s1': ['Ich bleibe am Telefon.', 'Ich bleibe dran.'],
    'sc-emergency-a2-t4-s1': ['Sie antwortet, aber sie hat starke Schmerzen.'],
    'sc-neighbours-a2-t2-s1': ['Ich bin den ganzen Nachmittag zu Hause.'],
    'sc-neighbours-a2-t3-s1': ['Jonas, dein Paket ist bei mir. Komm einfach vorbei!'],
    'sc-buergeramt-a2-t1-s1': ['Ich brauche einen Termin für die Anmeldung.'],
    'sc-work-a2-t1-s1': ['Ich bin Martin. Ich arbeite in der Buchhaltung.'],
    'sc-work-b2-t4-s1': ['Ich halte das im Protokoll fest.'],
    'sc-kita-b1-t4-s1': ['Dann lesen wir ihm öfter vor.', 'Das machen wir.'],
    'sc-kita-b2-t1-s1': ['Ich wollte das Thema Betreuungsschlüssel ansprechen.'],
  };

  it('accepts the sentence without it', () => {
    const rejected: string[] = [];
    for (const [id, answers] of Object.entries(WITHOUT_FILLER)) {
      for (const answer of answers) if (!isClean(answer, id)) rejected.push(`${id}: ${answer}`);
    }
    expect(rejected).toEqual([]);
  });

  it('still asks for the yes where the prompt does', () => {
    expect(isClean('Seit zwei Wochen.', 'sc-bank-a2-t2-s1')).toBe(false);
    expect(isClean('Ich möchte einen Tisch reservieren.', 'sc-restaurant-a2-t1-s1')).toBe(false);
  });
});
