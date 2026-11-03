import type { Bilingual } from './types.ts';

export interface PhraseFrame {
  prefix: string;
  template: string;
  /**
   * `alternatives` is other good German for the same gloss. "Ich hätte gern"
   * and "Ich möchte" both say "I would like", so the drill that asks for one
   * frame's example accepts the other's, and names the frame it practises.
   */
  examples: Array<{ de: string; gloss: Bilingual; alternatives?: string[] }>;
}
const bi = (en: string, bg: string): Bilingual => ({ en, bg });
const FRAMES: PhraseFrame[] = [
  { prefix: 'Guten Morgen', template: 'Guten ___!', examples: [
    { de: 'Guten Tag!', gloss: bi('Good day!', 'Добър ден!') },
    { de: 'Guten Abend!', gloss: bi('Good evening!', 'Добър вечер!') },
  ] },
  { prefix: 'Ich hätte gern', template: 'Ich hätte gern ___.', examples: [
    { de: 'Ich hätte gern einen Kaffee.', gloss: bi('I would like a coffee.', 'Бих искал едно кафе.'), alternatives: ['Ich möchte einen Kaffee.'] },
    { de: 'Ich hätte gern ein Wasser.', gloss: bi('I would like a water.', 'Бих искал една вода.'), alternatives: ['Ich möchte ein Wasser.'] },
  ] },
  { prefix: 'Ich möchte ', template: 'Ich möchte ___.', examples: [
    { de: 'Ich möchte einen Kaffee.', gloss: bi('I would like a coffee.', 'Бих искал едно кафе.'), alternatives: ['Ich hätte gern einen Kaffee.'] },
    { de: 'Ich möchte ein Wasser.', gloss: bi('I would like a water.', 'Бих искал една вода.'), alternatives: ['Ich hätte gern ein Wasser.'] },
  ] },
  { prefix: 'Ich brauche ', template: 'Ich brauche ___.', examples: [
    { de: 'Ich brauche einen Termin.', gloss: bi('I need an appointment.', 'Имам нужда от час.') },
    { de: 'Ich brauche Hilfe.', gloss: bi('I need help.', 'Имам нужда от помощ.') },
  ] },
  { prefix: 'Ich wohne in ', template: 'Ich wohne in ___.', examples: [
    { de: 'Ich wohne in Berlin.', gloss: bi('I live in Berlin.', 'Живея в Берлин.') },
    { de: 'Ich wohne in Hamburg.', gloss: bi('I live in Hamburg.', 'Живея в Хамбург.') },
  ] },
  { prefix: 'Ich komme aus ', template: 'Ich komme aus ___.', examples: [
    { de: 'Ich komme aus Bulgarien.', gloss: bi('I come from Bulgaria.', 'Аз съм от България.') },
    { de: 'Ich komme aus Deutschland.', gloss: bi('I come from Germany.', 'Аз съм от Германия.') },
  ] },
  { prefix: 'Wo ist ', template: 'Wo ist ___?', examples: [
    { de: 'Wo ist der Bahnhof?', gloss: bi('Where is the station?', 'Къде е гарата?') },
    { de: 'Wo ist die Toilette?', gloss: bi('Where is the toilet?', 'Къде е тоалетната?') },
  ] },
];

/** A finite set of authored swaps, rather than assuming any word fits a gap. */
export function phraseFrame(german: string): PhraseFrame | undefined {
  return FRAMES.find(frame => german.startsWith(frame.prefix));
}
