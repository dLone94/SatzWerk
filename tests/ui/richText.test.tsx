// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GRAMMAR_CONCEPTS } from '../../src/content/index.ts';
import { RichText } from '../../src/ui/components/bits.tsx';

/**
 * The two markup conventions the authored lessons use.
 *
 * Both had been in the content from early on and neither reached the learner:
 * `**endings**` arrived with the asterisks still attached, and a callout
 * written as three short paragraphs arrived as one long one, because HTML
 * collapses newlines. The explanations written that way are the hardest ones
 * in the course, which is the worst possible place to lose the formatting.
 */

describe('lesson text markup', () => {
  it('turns **this** into emphasis rather than showing the asterisks', () => {
    const { container } = render(<RichText text="ein hell**er** Raum" />);
    expect(container.textContent).toBe('ein heller Raum');
    expect(container.textContent).not.toContain('*');
    expect(container.querySelector('strong')?.textContent).toBe('er');
  });

  it('keeps a blank line as a paragraph break', () => {
    const { container } = render(<RichText text={'First point.\n\nSecond point.'} />);
    const paragraphs = container.querySelectorAll('.rich__para');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]!.textContent).toBe('First point.');
    expect(paragraphs[1]!.textContent).toBe('Second point.');
  });

  it('keeps a single newline as a line break, not a space', () => {
    // The callouts use it for parallel examples, one comparison per line.
    // Collapsing them into a run-on line is what HTML does by default and it
    // makes a list of comparisons nearly unreadable.
    const { container } = render(
      <RichText text={'• това е едно\n• това е второ'} />,
    );
    expect(container.querySelectorAll('br')).toHaveLength(1);
    expect(container.textContent).toBe('• това е едно• това е второ');
  });

  it('leaves ordinary text exactly as written', () => {
    // Including a lone asterisk, which authored content uses for a wrong form
    // (*mehr interessant*) and must not be eaten.
    const plain = 'German never does that — *mehr interessant* is the mistake.';
    render(<RichText text={plain} />);
    expect(screen.getByText(plain)).toBeInTheDocument();
  });

  it('handles several emphases in one line', () => {
    const { container } = render(<RichText text="**der** and **das** and **den**" />);
    expect(container.querySelectorAll('strong')).toHaveLength(3);
    expect(container.textContent).toBe('der and das and den');
  });

  /**
   * The check that matters most: no authored lesson anywhere should be able to
   * leak a stray asterisk pair to a learner because it was written before this
   * renderer existed.
   */
  it('leaves no unrendered ** anywhere in the authored grammar', () => {
    const offenders: string[] = [];
    const scan = (value: unknown, where: string) => {
      if (typeof value === 'string') {
        const { container } = render(<RichText text={value} />);
        if (container.textContent?.includes('**')) offenders.push(`${where}: ${value.slice(0, 60)}`);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item, index) => scan(item, `${where}[${index}]`));
        return;
      }
      if (value && typeof value === 'object') {
        for (const [key, inner] of Object.entries(value)) scan(inner, `${where}.${key}`);
      }
    };
    for (const concept of GRAMMAR_CONCEPTS) scan(concept.blocks, concept.id);
    expect(offenders).toEqual([]);
  });
});
