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
  { prefix: 'Ich hätte gern', template: 'Ich hätte gern ___.', examples: [
    { de: 'Ich hätte gern einen Kaffee.', gloss: bi('I would like a coffee.', 'Едно кафе, моля.'), alternatives: ['Ich möchte einen Kaffee.'] },
    { de: 'Ich hätte gern ein Wasser.', gloss: bi('I would like a water.', 'Една вода, моля.'), alternatives: ['Ich möchte ein Wasser.'] },
  ] },
  { prefix: 'Ich möchte ', template: 'Ich möchte ___.', examples: [
    { de: 'Ich möchte einen Kaffee.', gloss: bi('I would like a coffee.', 'Едно кафе, моля.'), alternatives: ['Ich hätte gern einen Kaffee.'] },
    { de: 'Ich möchte ein Wasser.', gloss: bi('I would like a water.', 'Една вода, моля.'), alternatives: ['Ich hätte gern ein Wasser.'] },
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
  { prefix: 'Ich heiße ', template: 'Ich heiße ___.', examples: [
    { de: 'Ich heiße Anna.', gloss: bi('My name is Anna.', 'Казвам се Ана.'), alternatives: ['Ich bin Anna.', 'Mein Name ist Anna.'] },
    { de: 'Ich heiße Teo.', gloss: bi('My name is Teo.', 'Казвам се Тео.'), alternatives: ['Ich bin Teo.', 'Mein Name ist Teo.'] },
  ] },
  // Last, so that a line opening with a greeting is matched by what it goes on to say.
  { prefix: 'Guten ', template: 'Guten ___!', examples: [
    { de: 'Guten Tag!', gloss: bi('Good day!', 'Добър ден!') },
    { de: 'Guten Abend!', gloss: bi('Good evening!', 'Добър вечер!') },
  ] },
];

/** A line's clauses: its beginning, and what follows each comma or full stop, capitalised as a sentence would be. */
const clauses = (german: string) => german.split(/(?<=[,.!?])\s+/)
  .map(clause => clause.charAt(0).toUpperCase() + clause.slice(1));

/**
 * A finite set of authored swaps, rather than assuming any word fits a gap.
 *
 * A frame used to fit only a line that began with it, and lines rarely do:
 * "Guten Tag, ich brauche einen Termin für die Anmeldung." and "Ja, ich
 * möchte …" open with a greeting or a yes, so of the seven frames only three
 * were ever shown. A frame now fits at the start of any clause of the line.
 */
export function phraseFrame(german: string): PhraseFrame | undefined {
  const parts = clauses(german);
  return FRAMES.find(frame => parts.some(part => part.startsWith(frame.prefix)));
}
