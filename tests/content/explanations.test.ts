import { describe, expect, it } from 'vitest';
import {
  LEXICON,
  allCheckpoints,
  availableLessons,
  grammarById,
  lessonById,
  lessonExercises,
  sectionBlocks,
  unitById,
  vocabById,
} from '../../src/content/index.ts';
import type { Block, ExerciseStep, Lesson, TeachingLanguage } from '../../src/content/types.ts';
import { validateAnswer } from '../../src/core/validation/validate.ts';

/**
 * Explanations that taught something the German, or the course itself,
 * contradicts.
 *
 * Each block below was a real report: a rule stated as fact that a native
 * speaker would not recognise, or that the same lesson broke a screen later.
 * The checks read the text a learner on each path actually sees — the
 * lesson's own blocks plus the shared grammar concept it pulls in — so a
 * correction made in one place and missed in the other still fails.
 */

const PATHS: TeachingLanguage[] = ['en', 'bg'];
const opts = { lexicon: LEXICON };

function shown(block: { only?: TeachingLanguage[] }, lang: TeachingLanguage): boolean {
  return !block.only || block.only.includes(lang);
}

/** The words of one block as the given path renders them. */
function blockText(block: Block, lang: TeachingLanguage): string[] {
  if (!shown(block, lang)) return [];
  switch (block.t) {
    case 'p':
      return [block.text[lang]];
    case 'list':
      return block.items.map((item) => item[lang]);
    case 'de':
      return [block.de, block.gloss?.[lang] ?? ''];
    case 'contrast':
      return [block.de, block.other[lang], block.note?.[lang] ?? ''];
    case 'table':
      return [
        ...block.headers.map((header) => header[lang]),
        ...block.rows.flat().map((cell) => (typeof cell === 'string' ? cell : cell[lang])),
        block.caption?.[lang] ?? '',
      ];
    case 'callout':
      return [block.title?.[lang] ?? '', block.text[lang]];
    case 'breakdown':
      return [block.de, ...block.parts.flatMap((part) => [part.de, part.gloss[lang]])];
  }
}

/**
 * Everything one lesson shows on one path: its objective and outcomes, the
 * sections with the shared grammar they pull in, and the closing summary.
 */
function lessonText(id: string, lang: TeachingLanguage): string {
  const lesson = lessonById(id) as Lesson | undefined;
  if (!lesson) throw new Error(`no lesson ${id}`);
  const blocks = [
    ...lesson.sections.filter((section) => shown(section, lang)).flatMap((section) => sectionBlocks(section, lang)),
    ...(lesson.summary ?? []),
  ];
  return [
    lesson.objective[lang],
    ...lesson.outcomes.map((outcome) => outcome[lang]),
    ...blocks.flatMap((block) => blockText(block, lang)),
  ].join('\n');
}

const STEPS = new Map<string, ExerciseStep>();
for (const exercise of [
  ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
  ...allCheckpoints().flatMap((checkpoint) => checkpoint.exercises),
]) {
  for (const step of exercise.steps) STEPS.set(step.id, step);
}

function isRight(given: string, id: string): boolean {
  const step = STEPS.get(id);
  if (!step) throw new Error(`no step ${id}`);
  const result = validateAnswer(given, step.answer, opts);
  return (
    result.verdict === 'correct' ||
    result.verdict === 'accepted-variant' ||
    (result.verdict === 'accepted-with-note' && !result.requireRetype)
  );
}

describe('dass can be left out', () => {
  /*
   * The A2 lesson said "German does not: the dass has to be there", called
   * leaving it out the commonest English-speaker mistake, and the Bulgarian
   * path said че "is not dropped either". "Ich glaube, Deutsch ist schwer." is
   * standard German, and the placement check and the bakery conversation
   * already accept the same shape. The mistake is mixing the two.
   */
  it('says so on both paths, with the verb staying second', () => {
    for (const lang of PATHS) {
      const text = lessonText('a2-u3-l1', lang);
      expect(text, lang).toContain('Ich glaube, Deutsch ist schwer.');
      expect(text, lang).not.toMatch(/has to be there|make dass necessary|need it|не се изпуска|изискват/);
    }
  });

  it('credits the verb-second sentence wherever the English has no "that"', () => {
    // Every typed step whose answer is glauben, denken or finden with a dass
    // clause. B1 Unit 6 asked "I think we should do more." and rejected
    // "Ich finde, wir sollten mehr tun." at no credit, after A2 had said it
    // is right.
    const typed = [
      ...availableLessons().flatMap((lesson) => lessonExercises(lesson)),
      ...allCheckpoints().flatMap((checkpoint) => checkpoint.exercises),
    ].filter((exercise) => exercise.kind === 'type');
    const missing: string[] = [];
    let checked = 0;
    for (const entry of typed.flatMap((exercise) => exercise.steps)) {
      const clause = /^(.*\b(?:glaube|denke|finde)), dass (\S+) (.*) (\S+)\.$/.exec(entry.answer.accepted[0]!);
      if (!clause || /\bthat\b/i.test(entry.prompt?.en ?? '')) continue;
      checked += 1;
      const verbSecond = `${clause[1]}, ${clause[2]} ${clause[4]} ${clause[3]}.`;
      if (!isRight(verbSecond, entry.id)) missing.push(`${entry.id}: ${verbSecond}`);
    }
    expect(checked).toBeGreaterThanOrEqual(3);
    expect(missing).toEqual([]);
    // And any of the three verbs, as A2 teaches them, with or without dass.
    for (const id of ['b1u6l1-ex2-s1', 'b1u6l1-m1-s2', 'cp-b1u6-1-s2']) {
      for (const verb of ['denke', 'glaube']) {
        expect(isRight(`Ich ${verb}, dass wir mehr tun sollten.`, id), `${id}: ${verb}`).toBe(true);
        expect(isRight(`Ich ${verb}, wir sollten mehr tun.`, id), `${id}: ${verb}`).toBe(true);
      }
      expect(isRight('Ich finde, dass wir sollten mehr tun.', id), id).toBe(false);
    }
  });

  it('credits the dass-less sentence where the English "that" is only a pronoun', () => {
    expect(isRight('Ich denke, das ist gut.', 'a2u3l1-ex2-s2')).toBe(true);
    // Where the English does say "that", the lesson still wants the dass.
    expect(isRight('Ich glaube, dass Deutsch ist schwer.', 'a2u3l1-ex2-s1')).toBe(false);
  });
});

describe('adjective endings, the plural included', () => {
  /*
   * A2 said "after der/die/das, write -e", which gives *die schnelle Züge,
   * and promised the rest for B1. B1 then said "everywhere else the ending is
   * the one you already learnt", so no lesson ever taught the plural or the
   * dative. B2 derived "steigen → steigend → steigende" beside "die
   * steigenden Mieten", and a wrong ending on a participle was graded as a
   * spelling slip, with credit, because the validator did not know that a
   * participle takes adjective endings.
   */
  it('gives the plural its -en at A2', () => {
    for (const lang of PATHS) {
      const text = lessonText('a2-u5-l2', lang);
      expect(text, lang).toContain('die schnellen Züge');
      expect(text, lang).not.toContain('after der/die/das, write -e.');
      expect(text, lang).not.toContain('After der/die/das the ending is -e.');
      expect(text, lang).not.toContain('след der/die/das пиши -e.');
      expect(text, lang).not.toContain('След der/die/das окончанието е -e.');
    }
  });

  it('teaches the dative and the plural at B1, as A2 promised', () => {
    for (const lang of PATHS) {
      const text = lessonText('b1-u1-l2', lang);
      expect(text, lang).toContain('mit dem hellen Raum');
      expect(text, lang).toContain('die hellen Zimmer');
    }
  });

  it('derives the B2 participle with the ending the plural needs', () => {
    for (const lang of PATHS) {
      const text = lessonText('b2-u3-l1', lang);
      expect(text, lang).not.toContain('steigend → steigende.');
      expect(text, lang).toContain('steigend → die steigenden Mieten');
    }
  });

  it('grades a wrong ending on a participle as an ending, without credit', () => {
    const cases: Array<[string, string]> = [
      ['cp-b2u3-1-s2', 'steigende'],
      ['b2u3l1-ex1-s3', 'steigende'],
      ['cp-b2u3-1-s1', 'geplanten'],
      ['b2u3l1-ex1-s2', 'geplante'],
      ['cp-b2u3-1-s3', 'veröffentlichten'],
    ];
    for (const [id, given] of cases) {
      const result = validateAnswer(given, STEPS.get(id)!.answer, opts);
      expect(result.categories, `${id}: ${given}`).toEqual(['adjective-ending']);
      expect(result.credit, `${id}: ${given}`).toBe(0);
    }
  });

  /*
   * Knowing the participles as adjectives made every ending on a verb look
   * like one. A participle without ge- is also the present tense, so
   * "funktionierte" for "funktioniert" (a simple past) was told "the
   * adjective ending follows the article, the gender and the case", and so
   * was an -e left on the participle of a Perfekt.
   */
  it('grades an ending changed on a verb as the verb’s mistake', () => {
    const tense: Array<[string, string]> = [
      ['a2u2l3-ex1-s1', 'Die Heizung funktionierte nicht.'],
      ['b2u2l1-ex3-s3', 'Er behauptete, er habe die E-Mail nie bekommen.'],
      ['a1u4l1-ex2-s2', 'studierte'],
      ['a2u1l3-ex3-s1', 'passierten'],
      ['a2u5l3-ex3-s1', 'Ich habe den Zug verpasste, weil der Bus Verspätung hatte.'],
    ];
    for (const [id, given] of tense) {
      const result = validateAnswer(given, STEPS.get(id)!.answer, opts);
      expect(result.categories, `${id}: ${given}`).toEqual(['verb-tense']);
      expect(result.credit, `${id}: ${given}`).toBe(0);
    }
    const form: Array<[string, string]> = [
      ['a2u1l1-ex2-s3', 'Wir haben eine Party gemachte.'],
      ['b1u1l1-ex3-s2', STEPS.get('b1u1l1-ex3-s2')!.answer.accepted[0]!.replace('angerufen', 'angerufenen')],
    ];
    for (const [id, given] of form) {
      expect(validateAnswer(given, STEPS.get(id)!.answer, opts).categories, `${id}: ${given}`).toEqual([
        'verb-conjugation',
      ]);
    }
  });

  it('knows the participles of a reflexive verb too', () => {
    expect(LEXICON.inflections.get('angemeldeten')).toContain('adjective:angemeldet');
    expect(LEXICON.inflections.get('erkältete')).toContain('adjective:erkältet');
  });
});

describe('where the reflexive word goes, and where it comes from', () => {
  /*
   * The A2 reflexive lesson called mich, dich, uns and euch "the accusative
   * pronouns you already know" (on the Bulgarian path, "from A1"), but no
   * lesson before it teaches object pronouns. Its rule, "straight after the
   * conjugated verb … whatever else happens to the sentence", gives *Heute
   * fühle mich ich besser beside its own example "Heute fühle ich mich
   * besser", and lesson 3 then said the reflexive word goes to the end with
   * the verb after weil, which it does not.
   */
  it('does not claim the pronouns were taught before', () => {
    for (const lang of PATHS) {
      expect(lessonText('a2-u4-l1', lang), lang).not.toMatch(/already know|already had|вече знаеш|вече имаше|от A1/);
    }
  });

  it('states a position rule the lesson’s own sentences follow', () => {
    for (const lang of PATHS) {
      const text = lessonText('a2-u4-l1', lang);
      expect(text, lang).not.toMatch(/second place behind the verb|whatever else happens|каквото и да става|си остава веднага след глагола/);
      expect(text, lang).toContain('Heute fühle ich mich besser');
      expect(lessonText('a2-u4-l3', lang), lang).not.toMatch(/mich goes with it|mich върви с него/);
    }
    expect(isRight('Heute fühle mich ich besser.', 'a2u4l1-ex2-s2')).toBe(false);
  });
});

describe('a German letter may ask a question', () => {
  /*
   * docs/TEACHING_REVIEW.md records the claim that German does not use
   * questions for polite requests as corrected, but only the B2 lesson's
   * intro was changed. The shared concept it shows two screens later still
   * said "It does not ask questions, and it never says what it wants", the
   * English callout said question requests "come out either odd or weak",
   * and the summary and an outcome said "statements, not questions".
   */
  it('says so everywhere the formal-letter lesson shows it, on both paths', () => {
    for (const lang of PATHS) {
      const text = lessonText('b2-u4-l3', lang);
      expect(text, lang).toContain('Könnten Sie mir bitte');
      expect(text, lang).not.toMatch(
        /does not ask questions|never says what it wants|odd or weak|not questions|instead of asking a question|не задава въпроси|не пита|а не въпроси|вместо въпрос/,
      );
    }
    const concept = grammarById('g-schriftliche-hoeflichkeit')!;
    for (const lang of PATHS) expect(concept.summary[lang], lang).not.toMatch(/not questions|а не въпроси/);
  });
});

describe('small claims about single words', () => {
  it('does not give doppelt so viele a singular verb', () => {
    // "All three take the singular verb": true of die Zahl der and jeder
    // dritte, wrong for doppelt so viele, which is plural and takes a plural
    // verb.
    for (const lang of PATHS) {
      const text = lessonText('b2-u3-l2', lang);
      expect(text, lang).not.toMatch(/All three take the singular|И трите искат глагол в единствено/);
      expect(text, lang).toMatch(/Doppelt so viele Menschen [^.]*arbeiten/);
    }
  });

  it('shows the genitive after innerhalb, and says when von takes over', () => {
    // "innerhalb von zwei Wochen", in bold beside "während der" and "wegen
    // des", was the example of a preposition that takes the genitive.
    for (const lang of PATHS) {
      const text = lessonText('b1-u4-l1', lang);
      expect(text, lang).not.toContain('**innerhalb von**');
      expect(text, lang).toContain('**innerhalb eines** Monats');
      expect(text, lang).toContain('innerhalb von zwei Wochen');
    }
  });

  it('teaches eben as the modal particle, where the particle rule puts it', () => {
    // The table glossed eben as "exactly — that is the point" with "Eben
    // deshalb …", eben first and stressed, right above "never in first
    // position, never stressed"; the drill asked for it in first position,
    // and "Das sehe ich eben anders." was glossed "That is exactly where I
    // see it differently".
    for (const lang of PATHS) {
      const text = lessonText('b2-u2-l3', lang);
      expect(text, lang).not.toMatch(/exactly — that is the point|точно така — това е въпросът|exactly where I see it|Точно тук го виждам/);
      expect(text, lang).not.toMatch(/^Eben deshalb/m);
    }
    const drill = STEPS.get('b2u2l3-ex1-s4')!;
    expect(drill.scaffold).not.toMatch(/^___/);
    expect(isRight('eben', 'b2u2l3-ex1-s4')).toBe(true);
  });
});

describe('the word page for hängen', () => {
  it('gives the Perfekt of both meanings it says the verb has', () => {
    // The page showed only "hat gehangen" next to a note saying hängen also
    // means "to hang something up", whose Perfekt is gehängt: a learner
    // would copy *Ich habe das Bild an die Wand gehangen.
    const entry = vocabById('v-haengen')!;
    expect(entry.perfect?.participle).toBe('gehangen');
    for (const lang of PATHS) {
      expect(entry.notes?.[lang], lang).toContain('hat gehängt');
      expect(entry.notes?.[lang], lang).toContain('hat gehangen');
    }
  });
});

describe('the Bulgarian dative comparison', () => {
  it('reads as Bulgarian rather than as a calque', () => {
    // "Повече от това" is "More than that" word for word, and "което учи"
    // reads first as "which studies"; the rest of the course says "научи".
    const text = lessonText('a1-u5-l2', 'bg');
    expect(text).toContain('Нещо повече: „брат ми“, което научи още в раздел 1');
    expect(text).not.toContain('Повече от това');
  });

  it('welcomes a learner to the first unit without assuming a gender', () => {
    // The course never asks for a form of address; "Добре дошъл" is the
    // masculine singular.
    expect(unitById('pre-a1-u1')!.title.bg).toBe('Добре дошли в немския');
  });
});
