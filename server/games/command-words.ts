/**
 * Memory Match — "Command Words" static deck.
 *
 * HALLUCINATION-SAFE BY CONSTRUCTION. This is a hand-verified, static seed of
 * the DBE/NSC exam command (action) words paired with what the examiner
 * actually expects when a question opens with that word. Nothing here is
 * generated at play time, and no model is ever consulted — the arcade's
 * Memory Match "Command Words" pairs come verbatim from this array.
 *
 * The set is UNIVERSAL across every Grade 12 subject (the command words are
 * defined the same way in every NSC subject-assessment guideline), so this
 * deck is served with a NULL subject.
 *
 * Each entry:
 *   term / termAf  — the command word as it appears in a question stem.
 *   expects / expectsAf — the short, factual statement of what earns the marks.
 *
 * Keep both sides SHORT (they are printed on small memory-match cards) and
 * FACTUAL. Do not add a command word here unless its meaning is unambiguous
 * across subjects.
 */

export interface CommandWordPair {
  term: string;
  termAf: string;
  expects: string;
  expectsAf: string;
}

export const COMMAND_WORDS: CommandWordPair[] = [
  {
    term: "Name / State",
    termAf: "Noem / Gee",
    expects: "One word or phrase. No explanation needed.",
    expectsAf: "Een woord of frase. Geen verduideliking nodig nie.",
  },
  {
    term: "List",
    termAf: "Lys",
    expects: "Write items one after another. No sentences required.",
    expectsAf: "Skryf items een na die ander. Geen sinne nodig nie.",
  },
  {
    term: "Define",
    termAf: "Definieer",
    expects: "Give the exact meaning of the term.",
    expectsAf: "Gee die presiese betekenis van die term.",
  },
  {
    term: "Identify",
    termAf: "Identifiseer",
    expects: "Pick out and name the correct item from the source.",
    expectsAf: "Kies en noem die korrekte item uit die bron.",
  },
  {
    term: "Describe",
    termAf: "Beskryf",
    expects: "Say what happens, in the right order. No reasons needed.",
    expectsAf: "Sê wat gebeur, in die regte volgorde. Geen redes nodig nie.",
  },
  {
    term: "Explain",
    termAf: "Verduidelik",
    expects: "Say how or why, giving clear reasons.",
    expectsAf: "Sê hoe of hoekom, met duidelike redes.",
  },
  {
    term: "Discuss",
    termAf: "Bespreek",
    expects: "Give both sides / points, then reach a verdict.",
    expectsAf: "Gee albei kante / punte, kom dan tot 'n gevolgtrekking.",
  },
  {
    term: "Evaluate",
    termAf: "Evalueer",
    expects: "Judge using evidence, then conclude for or against.",
    expectsAf: "Oordeel met bewyse, sluit dan af vir of teen.",
  },
  {
    term: "Analyse",
    termAf: "Ontleed",
    expects: "Break it into parts and show how they relate.",
    expectsAf: "Breek dit op in dele en wys hoe hulle verband hou.",
  },
  {
    term: "Compare",
    termAf: "Vergelyk",
    expects: "Give similarities AND differences between both.",
    expectsAf: "Gee ooreenkomste EN verskille tussen albei.",
  },
  {
    term: "Distinguish / Differentiate",
    termAf: "Onderskei",
    expects: "Show a clear difference between the two.",
    expectsAf: "Wys 'n duidelike verskil tussen die twee.",
  },
  {
    term: "Calculate",
    termAf: "Bereken",
    expects: "Show all working, then give the final number.",
    expectsAf: "Wys alle werk, gee dan die finale getal.",
  },
  {
    term: "Motivate / Justify",
    termAf: "Motiveer / Regverdig",
    expects: "Give reasons that back up your answer.",
    expectsAf: "Gee redes wat jou antwoord ondersteun.",
  },
  {
    term: "Suggest / Recommend",
    termAf: "Stel voor / Beveel aan",
    expects: "Offer a sensible idea and say why it works.",
    expectsAf: "Bied 'n sinvolle idee en sê hoekom dit werk.",
  },
  {
    term: "Tabulate",
    termAf: "Tabuleer",
    expects: "Set the answer out in a table with headings.",
    expectsAf: "Stel die antwoord in 'n tabel met opskrifte voor.",
  },
  {
    term: "Draw / Sketch / Label",
    termAf: "Teken / Skets / Benoem",
    expects: "Make a neat diagram and label the parts.",
    expectsAf: "Maak 'n netjiese diagram en benoem die dele.",
  },
];
