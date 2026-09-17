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
import { tokenize } from '../../src/core/validation/text.ts';

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
      // Open writing has no single canonical answer, so there is nothing to
      // retype; the Coach handles that feedback instead.
      if (exercise.kind === 'freeWriting') continue;
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
    const englishOnly = / (the|you|your|with|and|from|this|that|for|of|are|was) /i;
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
