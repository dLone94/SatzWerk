import { describe, expect, it } from 'vitest';
import { GRAMMAR_CONCEPTS, allLessons, describeNoun, sectionBlocks } from '../../src/content/index.ts';
import type { Block } from '../../src/content/types.ts';
import { genderParts } from '../../src/ui/components/Gender.tsx';

/*
 * A grammar table's German cells have their articles coloured one bold run
 * at a time. A run reading "der Arbeitnehmer" after other words is a
 * genitive (or dative) plural whenever the noun's plural is spelt like its
 * singular: that "der" is not a masculine gender, and colouring it blue
 * would teach the wrong one, in the row that teaches "plural takes der".
 */

function tables(): Array<Extract<Block, { t: 'table' }>> {
  const blocks: Block[] = [
    ...GRAMMAR_CONCEPTS.flatMap((concept) => concept.blocks),
    ...allLessons().flatMap((lesson) =>
      (['en', 'bg'] as const).flatMap((lang) => [
        ...lesson.sections.flatMap((section) => sectionBlocks(section, lang)),
        ...(lesson.summary ?? []),
      ]),
    ),
  ];
  return blocks.filter((block): block is Extract<Block, { t: 'table' }> => block.t === 'table');
}

const sameInPlural = (noun: string) => {
  const info = describeNoun(noun);
  return info?.gender === 'm' && info.plural?.replace(/^die\s+/u, '').toLowerCase() === noun.toLowerCase();
};

describe('a grammar table\'s bold runs', () => {
  it('never colour "der" before a plural spelt like its singular once other words come first', () => {
    const checked: string[] = [];
    const wrong: string[] = [];
    for (const table of tables()) {
      for (const row of table.rows) {
        for (const cell of row) {
          if (typeof cell !== 'string') continue;
          for (const line of cell.split('\n')) {
            const pieces = line.split(/\*\*(.+?)\*\*/g);
            pieces.forEach((piece, index) => {
              const noun = /^der\s+([A-ZÄÖÜ][\p{L}-]*)/u.exec(piece)?.[1];
              const before = pieces.slice(0, index).join('');
              if (index % 2 === 0 || !noun || !sameInPlural(noun) || !/\p{L}/u.test(before)) return;
              checked.push(line);
              if (genderParts(piece, describeNoun, undefined, before).some((part) => typeof part !== 'string')) wrong.push(line);
            });
          }
        }
      }
    }
    // The genitive table's plural row is one of them, so the check is not empty.
    expect(checked).toContain('die Rechte **der Arbeitnehmer**');
    expect(wrong).toEqual([]);
  });
});
