/**
 * The rail scenes' words: a question's sentence either side of its gap, and
 * the one word a wrong answer got wrong. Plain functions of what is on
 * screen, so they can be tested, and so the answer is never an input.
 */
import type { SceneSpec, WoodBlock } from './sceneData.ts';

type DescribeNoun = (noun: string) => { display: string; gender: 'm' | 'f' | 'n'; plural?: string } | undefined;

const ARTICLE_OF = { m: 'der', f: 'die', n: 'das' } as const;

/** The most blocks one rail holds and stays legible on a phone. */
export const MAX_RAIL_BLOCKS = 7;

/**
 * Words as blocks. A token that is only punctuation ("–", "/", "…") is not a
 * block of its own; it rides on the word before it.
 */
export function railTokens(text: string): string[] {
  const out: string[] = [];
  for (const token of text.split(/\s+/).filter(Boolean)) {
    if (!/\p{L}|\p{N}/u.test(token) && out.length > 0) out[out.length - 1] += ` ${token}`;
    else out.push(token);
  }
  return out;
}

/** Whether a token is a word at all, rather than a lone mark. */
function isWord(token: string): boolean {
  return /\p{L}|\p{N}/u.test(token);
}

function bare(token: string): string {
  return token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

/**
 * Paint a row of words. A noun is coloured only when the words on screen
 * already say its gender: its own nominative article right before it ("das
 * Brot"), which is the rule the rest of the app colours by. Both blocks take
 * the colour. Anything else stays birch — the colour may add nothing the
 * learner cannot already read, and must never hint at a gap's answer.
 */
export function paintRow(tokens: string[], describeNoun: DescribeNoun): WoodBlock[] {
  const blocks: WoodBlock[] = tokens.map((text) => ({ text, tone: 'birch' }));
  for (let index = 0; index + 1 < tokens.length; index++) {
    const article = bare(tokens[index]!).toLowerCase();
    if (article !== 'der' && article !== 'die' && article !== 'das') continue;
    // Punctuation between them ends the phrase: "die, Haus" is not one.
    if (/[^\p{L}]$/u.test(tokens[index]!)) continue;
    const noun = bare(tokens[index + 1]!);
    if (!/^\p{Lu}/u.test(noun)) continue;
    const info = describeNoun(noun);
    if (!info) continue;
    // As genderParts does: an entry that is only ever plural ("die Eltern")
    // has no gender to show. "die Lehrer" fails on its article below; "der
    // Kuchen" and "das Zimmer" are coloured like everywhere else.
    if (info.plural !== undefined && info.plural.toLowerCase() === info.display.toLowerCase()) continue;
    if (ARTICLE_OF[info.gender] !== article) continue;
    blocks[index]!.tone = article;
    blocks[index + 1]!.tone = article;
  }
  return blocks;
}

/** A question step, as much of it as the scene needs. */
export interface QuestionStepLike {
  kind: string;
  scaffold?: string;
  hideText?: boolean;
}

/**
 * The rail for a question: the words the screen shows either side of the
 * gap, and an empty slot between them that only ever holds what the learner
 * types (see `ghostText`). The answer is not an input to this at all.
 *
 * Only steps that complete a German sentence get one: a fill-in-the-gap or a
 * partial recall with at least two words showing. A single word, a
 * conjugation drill, an article for one noun, a listening task, a choice or
 * a free translation has no sentence on screen to build, and gets no scene
 * rather than an empty box. A sentence too long for one rail on a phone is
 * left as text.
 */
export function questionBlocks(step: QuestionStepLike, describeNoun: DescribeNoun): Extract<SceneSpec, { scene: 'question' }> | null {
  if (step.kind !== 'fillBlank' && step.kind !== 'partialRecall') return null;
  if (!step.scaffold || step.hideText) return null;
  const match = /(\S*?)_{2,}(\S*)/u.exec(step.scaffold);
  if (!match) return null;
  const beforeText = step.scaffold.slice(0, match.index);
  const tail = match[2] ?? '';
  const afterText = step.scaffold.slice(match.index + match[0].length);
  const before = railTokens(beforeText);
  const after = railTokens(afterText);
  const words = [...before, ...after].filter(isWord).length;
  if (words < 2) return null;
  if (before.length + after.length + 1 > MAX_RAIL_BLOCKS) return null;
  // Each side on its own: an article before the gap and a noun after it are
  // not a pair, since what the gap holds may change whose article it is.
  return { scene: 'question', before: paintRow(before, describeNoun), after: paintRow(after, describeNoun), tail };
}

/** What the slot shows: the learner's own typing, or a question mark. Never the answer. */
export function ghostText(typed: string, tail: string): string {
  const text = typed.trim();
  return text ? `${text}${tail}` : '?';
}

function comparable(token: string): string {
  return bare(token).toLowerCase();
}

/**
 * Where a wrong answer and the right one differ by exactly one word.
 *
 * Both are whole sentences as the learner sees them. Case and punctuation do
 * not count as a difference (they have their own feedback); a different word
 * does, and only one may. Returns the shared words either side, the word
 * that was typed and the word that belongs there — or null, when the answer
 * was wrong in some other way and swapping one block would explain nothing.
 */
export function feedbackSwap(
  given: string,
  expected: string,
): { before: string[]; wrong: string; right: string; after: string[] } | null {
  const a = railTokens(given);
  const b = railTokens(expected);
  if (a.length !== b.length || b.length === 0) return null;
  let at = -1;
  for (let index = 0; index < b.length; index++) {
    if (comparable(a[index]!) === comparable(b[index]!)) continue;
    if (at !== -1) return null;
    at = index;
  }
  if (at === -1) return null;
  const wrong = bare(a[at]!);
  const right = bare(b[at]!);
  if (!wrong || !right) return null;
  return { before: b.slice(0, at), wrong, right, after: b.slice(at + 1) };
}

/**
 * The feedback scene for a wrong answer, or null. A sentence needs words
 * around the swap — two at least — to be a sentence on a rail, and must fit
 * on one.
 */
export function feedbackScene(
  given: string,
  expected: string,
  describeNoun: DescribeNoun,
): Extract<SceneSpec, { scene: 'feedback' }> | null {
  const swap = feedbackSwap(given, expected);
  if (!swap) return null;
  const context = swap.before.length + swap.after.length;
  if (context < 2 || context + 1 > MAX_RAIL_BLOCKS) return null;
  const painted = paintRow([...swap.before, swap.right, ...swap.after], describeNoun);
  const at = swap.before.length;
  return {
    scene: 'feedback',
    before: painted.slice(0, at),
    wrong: swap.wrong,
    right: swap.right,
    after: painted.slice(at + 1),
  };
}
