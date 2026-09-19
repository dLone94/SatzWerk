import { describe, expect, it } from 'vitest';
import {
  CURRICULUM,
  GRAMMAR_CONCEPTS,
  LEXICON,
  VOCABULARY,
  allCheckpoints,
  allLessons,
  allUnits,
  availableLessons,
  contentStats,
  grammarById,
  lessonExercises,
  resolveTarget,
  vocabById,
} from '../../src/content/index.ts';
import type { Bilingual, Exercise, TeachingLanguage } from '../../src/content/types.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';
import { splitScaffold, tokenize } from '../../src/core/validation/text.ts';

const opts = { lexicon: LEXICON };

function allExercises(): Array<{ lessonId: string; exercise: Exercise }> {
  const out: Array<{ lessonId: string; exercise: Exercise }> = [];
  for (const lesson of availableLessons()) {
    for (const exercise of lessonExercises(lesson)) out.push({ lessonId: lesson.id, exercise });
  }
  for (const checkpoint of allCheckpoints()) {
    for (const exercise of checkpoint.exercises) out.push({ lessonId: checkpoint.id, exercise });
  }
  return out;
}

function isBilingual(value: unknown): value is Bilingual {
  if (typeof value !== 'object' || value === null) return false;
  const keys = Object.keys(value);
  return keys.length === 2 && keys.includes('en') && keys.includes('bg');
}

/** Collect every Bilingual in a tree, tracking which paths it is scoped to. */
function collectBilinguals(
  node: unknown,
  scope: TeachingLanguage[],
  out: Array<{ text: Bilingual; scope: TeachingLanguage[] }>,
): void {
  if (Array.isArray(node)) {
    for (const item of node) collectBilinguals(item, scope, out);
    return;
  }
  if (typeof node !== 'object' || node === null) return;
  if (isBilingual(node)) {
    out.push({ text: node, scope });
    return;
  }
  const record = node as Record<string, unknown>;
  const only = Array.isArray(record.only) ? (record.only as TeachingLanguage[]) : undefined;
  const nextScope = only ?? scope;
  for (const [key, value] of Object.entries(record)) {
    if (key === 'only') continue;
    collectBilinguals(value, nextScope, out);
  }
}

describe('curriculum structure', () => {
  it('covers Pre-A1 through B2 and marks unauthored levels as planned', () => {
    expect(CURRICULUM.map((l) => l.id)).toEqual(['pre-a1', 'a1', 'a2', 'b1', 'b2']);
    for (const level of CURRICULUM) {
      if (level.units.length === 0) expect(level.status).toBe('planned');
      expect(level.outcomes.length).toBeGreaterThan(0);
      expect(level.outline?.topics.length).toBeGreaterThan(0);
      expect(level.outline?.grammar.length).toBeGreaterThan(0);
    }
  });

  it('has at least one fully authored unit with several lessons', () => {
    const authored = allUnits().filter((u) => u.status === 'available');
    expect(authored.length).toBeGreaterThanOrEqual(1);
    const withMany = authored.filter((u) => u.lessons.length >= 3);
    expect(withMany.length).toBeGreaterThanOrEqual(1);
    expect(withMany[0]!.checkpoint).toBeDefined();
  });

  it('uses unique ids everywhere', () => {
    const ids: string[] = [];
    for (const level of CURRICULUM) {
      ids.push(level.id);
      for (const unit of level.units) {
        ids.push(unit.id);
        if (unit.checkpoint) ids.push(unit.checkpoint.id);
        for (const lesson of unit.lessons) {
          ids.push(lesson.id);
          for (const section of lesson.sections) ids.push(section.id);
        }
      }
    }
    for (const { exercise } of allExercises()) {
      ids.push(exercise.id);
      for (const step of exercise.steps) ids.push(step.id);
    }
    ids.push(...VOCABULARY.map((v) => v.id));
    ids.push(...GRAMMAR_CONCEPTS.map((g) => g.id));

    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    expect(duplicates).toEqual([]);
  });

  it('gives every authored lesson an objective, outcomes and a mastery check', () => {
    for (const lesson of availableLessons()) {
      expect(lesson.objective.en.length).toBeGreaterThan(10);
      expect(lesson.objective.bg.length).toBeGreaterThan(10);
      expect(lesson.outcomes.length).toBeGreaterThan(0);
      expect(lesson.sections.length).toBeGreaterThan(0);
      expect(lesson.exercises.length).toBeGreaterThan(0);
      expect(lesson.mastery.exercises.length).toBeGreaterThan(0);
      expect(lesson.mastery.passAccuracy).toBeGreaterThan(0.5);
    }
  });

  it('resolves every referenced vocabulary, grammar and review-target id', () => {
    const problems: string[] = [];
    for (const lesson of allLessons()) {
      for (const id of lesson.vocabIds) {
        if (!vocabById(id)) problems.push(`${lesson.id} vocabIds -> ${id}`);
      }
      for (const id of lesson.grammarIds) {
        if (!grammarById(id)) problems.push(`${lesson.id} grammarIds -> ${id}`);
      }
      for (const section of lesson.sections) {
        for (const id of section.vocabIds ?? []) {
          if (!vocabById(id)) problems.push(`${section.id} vocabIds -> ${id}`);
        }
        if (section.grammarId && !grammarById(section.grammarId)) {
          problems.push(`${section.id} grammarId -> ${section.grammarId}`);
        }
      }
    }
    for (const { exercise } of allExercises()) {
      for (const id of exercise.grammarIds ?? []) {
        if (!grammarById(id)) problems.push(`${exercise.id} grammarIds -> ${id}`);
      }
      for (const step of exercise.steps) {
        for (const id of step.reviewTargets ?? []) {
          if (!resolveTarget(id)) problems.push(`${step.id} reviewTargets -> ${id}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('authored answers are consistent with the validator', () => {
  it('accepts every canonical answer as fully correct', () => {
    const failures: string[] = [];
    for (const { exercise } of allExercises()) {
      for (const step of exercise.steps) {
        const canonical = step.answer.accepted[0];
        if (!canonical) {
          failures.push(`${step.id}: no accepted answer`);
          continue;
        }
        const result = validateAnswer(canonical, step.answer, opts);
        if (result.verdict !== 'correct' || result.credit !== 1) {
          failures.push(`${step.id}: "${canonical}" -> ${result.verdict} (${result.credit})`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('accepts every extra accepted answer at full credit', () => {
    const failures: string[] = [];
    for (const { exercise } of allExercises()) {
      for (const step of exercise.steps) {
        for (const accepted of step.answer.accepted.slice(1)) {
          const result = validateAnswer(accepted, step.answer, opts);
          if (result.credit !== 1) failures.push(`${step.id}: "${accepted}" -> ${result.credit}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('credits every authored alternative but keeps the taught form as the target', () => {
    const failures: string[] = [];
    for (const { exercise } of allExercises()) {
      for (const step of exercise.steps) {
        for (const alt of step.answer.alternatives ?? []) {
          const result = validateAnswer(alt, step.answer, opts);
          if (result.credit !== 1) {
            failures.push(`${step.id}: alternative "${alt}" -> ${result.verdict} (${result.credit})`);
          }
          if (result.target !== step.answer.accepted[0]) {
            failures.push(`${step.id}: alternative "${alt}" changed the target`);
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('rejects every authored trap answer with its authored explanation', () => {
    const failures: string[] = [];
    let traps = 0;
    for (const { exercise } of allExercises()) {
      for (const step of exercise.steps) {
        for (const trap of step.answer.trapAnswers ?? []) {
          traps += 1;
          const result = validateAnswer(trap.answer, step.answer, opts);
          if (result.credit !== 0) failures.push(`${step.id}: trap "${trap.answer}" earned credit`);
          if (!result.categories.includes(trap.category)) {
            failures.push(`${step.id}: trap "${trap.answer}" lost its category`);
          }
          if (!result.trapFeedback) failures.push(`${step.id}: trap "${trap.answer}" lost its feedback`);
          if (!result.requireRetype) failures.push(`${step.id}: trap "${trap.answer}" did not require a retype`);
        }
      }
    }
    expect(failures).toEqual([]);
    expect(traps).toBeGreaterThan(5);
  });

  it('keeps word banks consistent with their answers', () => {
    const failures: string[] = [];
    for (const { exercise } of allExercises()) {
      for (const step of exercise.steps) {
        if (!step.wordBank) continue;
        const bank = step.wordBank.flatMap((chunk) => tokenize(chunk)).sort();
        const answer = tokenize(step.answer.accepted[0] ?? '').sort();
        if (bank.join(' ') !== answer.join(' ')) {
          failures.push(`${step.id}: bank [${bank.join(', ')}] vs answer [${answer.join(', ')}]`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('seeds partial-recall scaffolds with a real prefix of the answer', () => {
    const failures: string[] = [];
    for (const { exercise } of allExercises()) {
      for (const step of exercise.steps) {
        if (!step.scaffold) continue;
        const match = /(\S*?)_{2,}/.exec(step.scaffold);
        const seed = match?.[1] ?? '';
        if (!seed) continue;
        const answer = step.answer.accepted[0] ?? '';
        if (!answer.toLowerCase().startsWith(seed.toLowerCase())) {
          failures.push(`${step.id}: seed "${seed}" is not a prefix of "${answer}"`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('accepts both word orders when an answer fronts a time phrase', () => {
    // German allows "Am Montag arbeite ich" and "Ich arbeite am Montag", and
    // both are right. A typing task that takes only one of them marks correct
    // German wrong, so any answer starting with a time phrase needs the
    // subject-first order as an alternative. Dictation is exempt (the learner
    // hears one exact sentence) and so is free writing (checked by tokens).
    const fronted = /^(Am |Im |Um |Heute |Morgen |Jetzt )/;
    const failures: string[] = [];
    for (const { exercise } of allExercises()) {
      if (exercise.kind !== 'type' && exercise.kind !== 'fillBlank' && exercise.kind !== 'partialRecall') continue;
      for (const step of exercise.steps) {
        const answer = step.answer.accepted[0] ?? '';
        // A question has to front its question word, and a gap fixes the order.
        if (!fronted.test(answer) || answer.endsWith('?') || step.scaffold) continue;
        if ((step.answer.alternatives ?? []).length === 0) {
          failures.push(`${step.id}: ${JSON.stringify(answer)} has no subject-first alternative`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('never glues a scaffold tail onto the gap', () => {
    // The player renders "before [input] after" and seeds the input with the
    // scaffold's leading letters, so whatever the learner types is graded as the
    // whole answer. A tail glued straight onto the gap therefore contradicts the
    // answer: "ein___zwanzig" graded against "einundzwanzig" would show the word
    // and then "zwanzig" again. A tail separated by a space is fine, because it
    // is surrounding sentence context ("Wo ___ du?").
    const failures: string[] = [];
    for (const { exercise } of allExercises()) {
      for (const step of exercise.steps) {
        if (!step.scaffold) continue;
        const { after, seed } = splitScaffold(step.scaffold);
        if (after && !/^[\s.,!?]/.test(after)) {
          failures.push(`${step.id}: scaffold "${step.scaffold}" glues "${after}" onto the gap`);
        }
        // A seed that is the entire answer leaves nothing to recall.
        for (const answer of step.answer.accepted) {
          if (seed && seed.length >= answer.length) {
            failures.push(`${step.id}: seed "${seed}" gives away the whole answer "${answer}"`);
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('gives multiple-choice steps a correct option that matches the answer', () => {
    const failures: string[] = [];
    for (const { exercise } of allExercises()) {
      if (exercise.kind !== 'multipleChoice' && exercise.kind !== 'listenChoose') continue;
      for (const step of exercise.steps) {
        if (!step.choices || step.choices.length < 2) {
          failures.push(`${step.id}: needs at least two choices`);
          continue;
        }
        const correct = step.choices.find((choice) => choice.id === step.correctChoiceId);
        if (!correct) failures.push(`${step.id}: correctChoiceId does not exist`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('gives every dictation step audio with hidden text', () => {
    const failures: string[] = [];
    for (const { exercise } of allExercises()) {
      if (exercise.kind !== 'dictation') continue;
      for (const step of exercise.steps) {
        if (!step.audio?.text) failures.push(`${step.id}: no audio`);
        else if (!step.audio.hideText) failures.push(`${step.id}: dictation must hide its text`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('requires a retype for every sentence-level exercise', () => {
    const failures: string[] = [];
    for (const { exercise } of allExercises()) {
      // Some exercises have nothing to retype: open writing has no single
      // canonical answer, and a multiple-choice answer was clicked, not typed.
      if (
        exercise.kind === 'freeWriting' ||
        exercise.kind === 'multipleChoice' ||
        exercise.kind === 'listenChoose'
      ) {
        continue;
      }
      const hasSentence = exercise.steps.some((step) => step.answer.shape === 'sentence');
      if (hasSentence && exercise.mandatoryRetype === false) {
        failures.push(`${exercise.id}: sentences must trigger a retype`);
      }
    }
    expect(failures).toEqual([]);
  });
});

describe('both teaching paths are authored, not translated placeholders', () => {
  it('has non-empty English and Bulgarian text wherever a path is active', () => {
    const problems: string[] = [];
    const check = (label: string, node: unknown) => {
      const found: Array<{ text: Bilingual; scope: TeachingLanguage[] }> = [];
      collectBilinguals(node, ['en', 'bg'], found);
      for (const { text, scope } of found) {
        for (const lang of scope) {
          if (text[lang].trim().length === 0) {
            problems.push(`${label}: empty ${lang} in ${JSON.stringify(text).slice(0, 80)}`);
          }
        }
      }
    };
    for (const lesson of availableLessons()) check(lesson.id, lesson);
    for (const checkpoint of allCheckpoints()) check(checkpoint.id, checkpoint);
    for (const entry of VOCABULARY) check(entry.id, entry);
    for (const concept of GRAMMAR_CONCEPTS) check(concept.id, concept);
    expect(problems).toEqual([]);
  });

  it('writes Bulgarian in Cyrillic, never as copied English', () => {
    const suspicious: string[] = [];
    const cyrillic = /[\u0400-\u04FF]/;
    // Words that only appear in English prose. A Bulgarian field containing one
    // of these was copied from the English path rather than written.
    // Deliberately excludes words that exist in German too ("was", "die",
    // "in"), which would otherwise flag legitimate shared German text.
    const englishOnly = / (the|you|your|with|and|from|this|that|for|of|are) /i;
    const targets: Array<{ id: string; node: unknown }> = [
      ...availableLessons().map((lesson) => ({ id: lesson.id, node: lesson as unknown })),
      ...allCheckpoints().map((cp) => ({ id: cp.id, node: cp as unknown })),
      ...GRAMMAR_CONCEPTS.map((g) => ({ id: g.id, node: g as unknown })),
      ...VOCABULARY.map((v) => ({ id: v.id, node: v as unknown })),
    ];
    for (const { id, node } of targets) {
      const texts: Array<{ text: Bilingual; scope: TeachingLanguage[] }> = [];
      collectBilinguals(node, ['en', 'bg'], texts);
      for (const { text, scope } of texts) {
        if (!scope.includes('bg')) continue;
        const bg = text.bg.trim();
        if (bg.length === 0) continue;
        const hasCyrillic = cyrillic.test(bg);
        // Shared German or neutral text (an example sentence, a verb form, a
        // table of articles) is legitimately identical in both paths.
        const sharedWithEn = bg === text.en.trim();
        if (!hasCyrillic && !sharedWithEn) {
          suspicious.push(`${id}: Latin-script bg that differs from en -> "${bg.slice(0, 48)}"`);
        } else if (sharedWithEn && englishOnly.test(` ${bg} `)) {
          suspicious.push(`${id}: English prose copied into bg -> "${bg.slice(0, 48)}"`);
        }
      }
    }
    expect(suspicious).toEqual([]);
  });

  it('includes explanations that exist only in one path', () => {
    const scoped = GRAMMAR_CONCEPTS.flatMap((concept) => concept.blocks).filter((block) => block.only);
    const bgOnly = scoped.filter((block) => block.only?.includes('bg') && !block.only.includes('en'));
    const enOnly = scoped.filter((block) => block.only?.includes('en') && !block.only.includes('bg'));
    expect(bgOnly.length).toBeGreaterThan(3);
    expect(enOnly.length).toBeGreaterThan(3);
  });
});

describe('vocabulary', () => {
  it('teaches nouns with their article', () => {
    const failures: string[] = [];
    for (const entry of VOCABULARY) {
      if (entry.wordType !== 'noun' || !entry.article) continue;
      if (!entry.display.startsWith(`${entry.article} `)) {
        failures.push(`${entry.id}: display "${entry.display}" lacks "${entry.article}"`);
      }
      if (!entry.gender) failures.push(`${entry.id}: article without gender`);
    }
    expect(failures).toEqual([]);
  });

  it('gives every entry a translation, pronunciation and example in both paths', () => {
    for (const entry of VOCABULARY) {
      expect(entry.translation.en.length, entry.id).toBeGreaterThan(0);
      expect(entry.translation.bg.length, entry.id).toBeGreaterThan(0);
      expect(entry.example.de.length, entry.id).toBeGreaterThan(0);
      expect(entry.example.gloss.en.length, entry.id).toBeGreaterThan(0);
      expect(entry.example.gloss.bg.length, entry.id).toBeGreaterThan(0);
    }
  });

  it('feeds the validator lexicon with genders and plurals', () => {
    expect(LEXICON.nounGender.get('tochter')).toBe('f');
    expect(LEXICON.nounGender.get('haus')).toBe('n');
    expect(LEXICON.nounGender.get('tisch')).toBe('m');
    expect(LEXICON.pluralOf.get('tochter')).toBe('töchter');
  });

  /**
   * The Perfekt is data, not a rule that can be applied.
   *
   * gemacht is regular, gegangen is not, studiert has no ge- at all and
   * eingekauft puts it in the middle — so the form is carried on the verb and
   * these checks are what stop a typo in that data from becoming a wrong
   * answer the learner is asked to produce.
   */
  it('gives every verb its Perfekt, except the modals the course does not teach it for', () => {
    const verbs = VOCABULARY.filter((entry) => entry.wordType === 'verb');
    const without = verbs.filter((entry) => !entry.perfect).map((entry) => entry.german);
    // The modals, and only the modals: the course teaches their present tense
    // and leaves their Perfekt to B1, so a form nothing teaches has no business
    // on a page that says what you have learnt.
    expect(without.sort()).toEqual(['können', 'möchten', 'müssen', 'sollen', 'wollen'].sort());
    expect(verbs.length - without.length).toBeGreaterThan(30);
  });

  it('builds those participles in one of the shapes German allows', () => {
    const failures: string[] = [];
    for (const entry of VOCABULARY) {
      const perfect = entry.perfect;
      if (!perfect) continue;
      const p = perfect.participle;
      const shaped =
        // ge…t / ge…en, the two regular shapes
        /^ge.+(t|en)$/.test(p) ||
        // an inseparable prefix takes no ge-: besucht, bezahlt
        /^(be|er|ver|ent|emp|ge|miss|zer)/.test(p) ||
        // durch, über, um, unter, hinter and wider are the awkward ones: they
        // are separable on some verbs and inseparable on others, and when they
        // are inseparable there is no ge- either. umziehen separates and gives
        // umgezogen; unterschreiben does not and gives unterschrieben. Both
        // are real participles, so the shape check has to allow both.
        /^(durch|über|um|unter|hinter|wider).+(t|en)$/.test(p) ||
        // -ieren verbs take no ge- either: studiert
        /iert$/.test(p) ||
        // a separable prefix puts it in the middle: eingekauft, aufgestanden
        /ge.+(t|en)$/.test(p);
      if (!shaped) failures.push(`${entry.id}: "${p}" is not a participle shape`);
      if (p.includes(' ')) failures.push(`${entry.id}: "${p}" should be the participle alone`);
    }
    expect(failures).toEqual([]);
  });

  it('teaches the auxiliary too, and sein only for movement or a change of state', () => {
    const sein = VOCABULARY.filter((entry) => entry.perfect?.auxiliary === 'sein').map((e) => e.german);
    // The whole list, so adding a verb to it is a decision rather than a typo.
    expect(sein.sort()).toEqual(
      [
        // Movement.
        'kommen', 'gehen', 'fahren', 'fliegen', 'schwimmen', 'aufstehen',
        // Movement into and out of somewhere you then live. Added with B1
        // Unit 1: they are the same motion as umziehen and take sein for the
        // same reason.
        'einziehen', 'ausziehen',
        // Change of state.
        'passieren', 'umziehen', 'umsteigen',
        // The three with no reason behind them.
        'sein', 'bleiben', 'werden',
      ].sort(),
    );
  });

  it('lets the validator recognise a participle rather than calling it a typo', () => {
    for (const form of ['gegangen', 'gemacht', 'gewesen', 'eingekauft', 'studiert']) {
      expect(LEXICON.knownWords.has(form), form).toBe(true);
    }
  });
});

describe('content statistics are real', () => {
  it('reports counts that match the authored content', () => {
    const stats = contentStats();
    expect(stats.levels).toBe(5);
    expect(stats.lessons).toBe(availableLessons().length);
    expect(stats.lessons).toBeGreaterThanOrEqual(5);
    expect(stats.answerSteps).toBeGreaterThan(80);
    expect(stats.vocabulary).toBe(VOCABULARY.length);
    expect(stats.checkpoints).toBeGreaterThanOrEqual(1);
  });

  it('keeps typing exercises dominant over multiple choice', () => {
    const exercises = allExercises().map((e) => e.exercise);
    const choiceSteps = exercises
      .filter((e) => e.kind === 'multipleChoice' || e.kind === 'listenChoose')
      .reduce((sum, e) => sum + e.steps.length, 0);
    const totalSteps = exercises.reduce((sum, e) => sum + e.steps.length, 0);
    // The defining characteristic of the app: the learner produces German.
    expect(choiceSteps / totalSteps).toBeLessThan(0.15);
  });
});
