export interface LiteratureWork {
  id: string;
  title: string;
  author: string;
  titleAf?: string;
  authorAf?: string;
  type: "novel" | "drama" | "poetry" | "short_stories";
  typeLabel: string;
  typeLabelAf: string;
}

export interface LiteratureCategory {
  type: LiteratureWork["type"];
  label: string;
  labelAf: string;
  works: LiteratureWork[];
}

export const CAPS_LITERATURE: Record<string, LiteratureCategory[]> = {

  ENGH: [
    {
      type: "novel",
      label: "Novel",
      labelAf: "Roman",
      works: [
        { id: "engh-nov-1", title: "Animal Farm", author: "George Orwell", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engh-nov-2", title: "Cry, the Beloved Country", author: "Alan Paton", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engh-nov-3", title: "The Great Gatsby", author: "F. Scott Fitzgerald", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engh-nov-4", title: "Lord of the Flies", author: "William Golding", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engh-nov-5", title: "Purple Hibiscus", author: "Chimamanda Ngozi Adichie", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engh-nov-6", title: "To Kill a Mockingbird", author: "Harper Lee", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engh-nov-7", title: "Disgrace", author: "J.M. Coetzee", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engh-nov-8", title: "Half of a Yellow Sun", author: "Chimamanda Ngozi Adichie", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engh-nov-9", title: "Americanah", author: "Chimamanda Ngozi Adichie", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engh-nov-10", title: "When Rain Clouds Gather", author: "Bessie Head", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engh-nov-11", title: "Tsotsi", author: "Athol Fugard", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engh-nov-12", title: "The Kite Runner", author: "Khaled Hosseini", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
      ],
    },
    {
      type: "drama",
      label: "Drama",
      labelAf: "Drama",
      works: [
        { id: "engh-dr-1", title: "Death of a Salesman", author: "Arthur Miller", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engh-dr-2", title: "Othello", author: "William Shakespeare", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engh-dr-3", title: "A Raisin in the Sun", author: "Lorraine Hansberry", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engh-dr-4", title: "The Crucible", author: "Arthur Miller", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engh-dr-5", title: "Hamlet", author: "William Shakespeare", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engh-dr-6", title: "Macbeth", author: "William Shakespeare", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engh-dr-7", title: "Blood Brothers", author: "Willy Russell", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engh-dr-8", title: "Woza Albert!", author: "Mbongeni Ngema & Percy Mtwa", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engh-dr-9", title: "Master Harold... and the Boys", author: "Athol Fugard", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engh-dr-10", title: "The Road", author: "Wole Soyinka", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
      ],
    },
    {
      type: "poetry",
      label: "Poetry Anthology",
      labelAf: "Poësie-Antologie",
      works: [
        { id: "engh-po-1", title: "Tides (DBE Anthology)", author: "Various", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
        { id: "engh-po-2", title: "Groundwork (DBE Anthology)", author: "Various", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
        { id: "engh-po-3", title: "Via Afrika English HL Poetry", author: "Various", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
        { id: "engh-po-4", title: "Oxford SA Poetry Collection", author: "Various", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
      ],
    },
    {
      type: "short_stories",
      label: "Short Story Collection",
      labelAf: "Kortverhale-Versameling",
      works: [
        { id: "engh-ss-1", title: "DBE Short Story Anthology", author: "Various", typeLabel: "Short Stories", typeLabelAf: "Kortverhale", type: "short_stories" },
        { id: "engh-ss-2", title: "Via Afrika Short Stories Collection", author: "Various", typeLabel: "Short Stories", typeLabelAf: "Kortverhale", type: "short_stories" },
        { id: "engh-ss-3", title: "Shuter & Shooter Short Stories", author: "Various", typeLabel: "Short Stories", typeLabelAf: "Kortverhale", type: "short_stories" },
      ],
    },
  ],

  ENGF: [
    {
      type: "novel",
      label: "Novel",
      labelAf: "Roman",
      works: [
        { id: "engf-nov-1", title: "Animal Farm", author: "George Orwell", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engf-nov-2", title: "Lord of the Flies", author: "William Golding", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engf-nov-3", title: "Purple Hibiscus", author: "Chimamanda Ngozi Adichie", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engf-nov-4", title: "To Kill a Mockingbird", author: "Harper Lee", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engf-nov-5", title: "When Rain Clouds Gather", author: "Bessie Head", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engf-nov-6", title: "A Grain of Wheat", author: "Ngũgĩ wa Thiong'o", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engf-nov-7", title: "The Great Gatsby", author: "F. Scott Fitzgerald", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engf-nov-8", title: "Cry, the Beloved Country", author: "Alan Paton", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engf-nov-9", title: "The Herd Boy's Bride", author: "Various", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "engf-nov-10", title: "Mine Boy", author: "Peter Abrahams", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
      ],
    },
    {
      type: "drama",
      label: "Drama",
      labelAf: "Drama",
      works: [
        { id: "engf-dr-1", title: "Death of a Salesman", author: "Arthur Miller", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engf-dr-2", title: "Othello", author: "William Shakespeare", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engf-dr-3", title: "A Raisin in the Sun", author: "Lorraine Hansberry", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engf-dr-4", title: "The Crucible", author: "Arthur Miller", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engf-dr-5", title: "Woza Albert!", author: "Mbongeni Ngema & Percy Mtwa", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
        { id: "engf-dr-6", title: "The Imaginary Invalid", author: "Molière (trans.)", typeLabel: "Drama", typeLabelAf: "Drama", type: "drama" },
      ],
    },
    {
      type: "poetry",
      label: "Poetry Anthology",
      labelAf: "Poësie-Antologie",
      works: [
        { id: "engf-po-1", title: "DBE English FAL Poetry Anthology", author: "Various", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
        { id: "engf-po-2", title: "Via Afrika English FAL Poetry", author: "Various", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
        { id: "engf-po-3", title: "Pelican Series Poetry", author: "Various", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
      ],
    },
    {
      type: "short_stories",
      label: "Short Story Collection",
      labelAf: "Kortverhale-Versameling",
      works: [
        { id: "engf-ss-1", title: "DBE English FAL Short Stories", author: "Various", typeLabel: "Short Stories", typeLabelAf: "Kortverhale", type: "short_stories" },
        { id: "engf-ss-2", title: "New Contrast Short Stories", author: "Various", typeLabel: "Short Stories", typeLabelAf: "Kortverhale", type: "short_stories" },
      ],
    },
  ],

  AFRH: [
    {
      type: "novel",
      label: "Roman",
      labelAf: "Roman",
      works: [
        { id: "afrh-nov-1", title: "Fiela se kind", author: "Dalene Matthee", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrh-nov-2", title: "Kringe in 'n bos", author: "Dalene Matthee", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrh-nov-3", title: "Waterslot", author: "Henrietta Rose-Innes", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrh-nov-4", title: "Buys: 'n Grensroman", author: "Willem Anker", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrh-nov-5", title: "Roepman", author: "Jan van Tonder", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrh-nov-6", title: "Spitsuur", author: "Deon Meyer", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrh-nov-7", title: "Hoe ek van 'n meisie 'n seun geword het", author: "Deon Opperman", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrh-nov-8", title: "Die sideboard", author: "Engela van Rooyen", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrh-nov-9", title: "Nagswart", author: "Lien Botha", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrh-nov-10", title: "Toorberg", author: "Karel Schoeman", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
      ],
    },
    {
      type: "drama",
      label: "Toneelstuk",
      labelAf: "Toneelstuk",
      works: [
        { id: "afrh-dr-1", title: "Ons vir jou", author: "Reza de Wet", typeLabel: "Drama", typeLabelAf: "Toneelstuk", type: "drama" },
        { id: "afrh-dr-2", title: "Die rebellie van Lafras Verwey", author: "P.G. du Plessis", typeLabel: "Drama", typeLabelAf: "Toneelstuk", type: "drama" },
        { id: "afrh-dr-3", title: "Ag, Pleez Deddy", author: "Johan Rademeyer", typeLabel: "Drama", typeLabelAf: "Toneelstuk", type: "drama" },
        { id: "afrh-dr-4", title: "Waar die hart is", author: "Lize Beekman", typeLabel: "Drama", typeLabelAf: "Toneelstuk", type: "drama" },
        { id: "afrh-dr-5", title: "Die Romeinse keiser", author: "Various", typeLabel: "Drama", typeLabelAf: "Toneelstuk", type: "drama" },
        { id: "afrh-dr-6", title: "Kaburu", author: "Deon Opperman", typeLabel: "Drama", typeLabelAf: "Toneelstuk", type: "drama" },
        { id: "afrh-dr-7", title: "Stille nag, heilige nag", author: "Various", typeLabel: "Drama", typeLabelAf: "Toneelstuk", type: "drama" },
      ],
    },
    {
      type: "poetry",
      label: "Poësie",
      labelAf: "Poësie",
      works: [
        { id: "afrh-po-1", title: "Groot verseboek (Keuse)", author: "Verskeie digters", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
        { id: "afrh-po-2", title: "Nuwe stemme (DBE Antologie)", author: "Verskeie digters", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
        { id: "afrh-po-3", title: "Via Afrika Afrikaans HL Poësie", author: "Verskeie digters", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
        { id: "afrh-po-4", title: "Oxford Afrikaans Poësie-antologie", author: "Verskeie digters", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
      ],
    },
    {
      type: "short_stories",
      label: "Kortverhale",
      labelAf: "Kortverhale",
      works: [
        { id: "afrh-ss-1", title: "DBE Afrikaans HL Kortverhale", author: "Verskeie outeurs", typeLabel: "Short Stories", typeLabelAf: "Kortverhale", type: "short_stories" },
        { id: "afrh-ss-2", title: "Nuwe Afrikaanse Kortverhale (NAK)", author: "Verskeie outeurs", typeLabel: "Short Stories", typeLabelAf: "Kortverhale", type: "short_stories" },
        { id: "afrh-ss-3", title: "Via Afrika Kortverhale-Versameling", author: "Verskeie outeurs", typeLabel: "Short Stories", typeLabelAf: "Kortverhale", type: "short_stories" },
      ],
    },
  ],

  AFRF: [
    {
      type: "novel",
      label: "Roman",
      labelAf: "Roman",
      works: [
        { id: "afrf-nov-1", title: "Fiela se kind", author: "Dalene Matthee", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrf-nov-2", title: "Kringe in 'n bos", author: "Dalene Matthee", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrf-nov-3", title: "Roepman", author: "Jan van Tonder", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrf-nov-4", title: "Hoe ek van 'n meisie 'n seun geword het", author: "Deon Opperman", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrf-nov-5", title: "Paljas", author: "Katinka Heyns", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrf-nov-6", title: "Fees van die ongenooides", author: "Koos Kombuis", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrf-nov-7", title: "Die hart van ons huis", author: "Ingrid Winterbach", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
      ],
    },
    {
      type: "drama",
      label: "Toneelstuk",
      labelAf: "Toneelstuk",
      works: [
        { id: "afrf-dr-1", title: "Ag, Pleez Deddy", author: "Johan Rademeyer", typeLabel: "Drama", typeLabelAf: "Toneelstuk", type: "drama" },
        { id: "afrf-dr-2", title: "Waar die hart is", author: "Lize Beekman", typeLabel: "Drama", typeLabelAf: "Toneelstuk", type: "drama" },
        { id: "afrf-dr-3", title: "Die rebellie van Lafras Verwey", author: "P.G. du Plessis", typeLabel: "Drama", typeLabelAf: "Toneelstuk", type: "drama" },
        { id: "afrf-dr-4", title: "Siener in die suburbs", author: "P.G. du Plessis", typeLabel: "Drama", typeLabelAf: "Toneelstuk", type: "drama" },
      ],
    },
    {
      type: "poetry",
      label: "Poësie",
      labelAf: "Poësie",
      works: [
        { id: "afrf-po-1", title: "DBE Afrikaans FAL Poësie-Antologie", author: "Verskeie digters", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
        { id: "afrf-po-2", title: "Via Afrika Afrikaans FAL Poësie", author: "Verskeie digters", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
      ],
    },
    {
      type: "short_stories",
      label: "Kortverhale",
      labelAf: "Kortverhale",
      works: [
        { id: "afrf-ss-1", title: "DBE Afrikaans FAL Kortverhale", author: "Verskeie outeurs", typeLabel: "Short Stories", typeLabelAf: "Kortverhale", type: "short_stories" },
        { id: "afrf-ss-2", title: "Via Afrika Afrikaans FAL Kortverhale", author: "Verskeie outeurs", typeLabel: "Short Stories", typeLabelAf: "Kortverhale", type: "short_stories" },
      ],
    },
  ],

  AFRS: [
    {
      type: "novel",
      label: "Roman",
      labelAf: "Roman",
      works: [
        { id: "afrs-nov-1", title: "Fiela se kind", author: "Dalene Matthee", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrs-nov-2", title: "Kringe in 'n bos", author: "Dalene Matthee", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
        { id: "afrs-nov-3", title: "Roepman", author: "Jan van Tonder", typeLabel: "Novel", typeLabelAf: "Roman", type: "novel" },
      ],
    },
    {
      type: "drama",
      label: "Toneelstuk",
      labelAf: "Toneelstuk",
      works: [
        { id: "afrs-dr-1", title: "Ag, Pleez Deddy", author: "Johan Rademeyer", typeLabel: "Drama", typeLabelAf: "Toneelstuk", type: "drama" },
        { id: "afrs-dr-2", title: "Waar die hart is", author: "Lize Beekman", typeLabel: "Drama", typeLabelAf: "Toneelstuk", type: "drama" },
      ],
    },
    {
      type: "poetry",
      label: "Poësie",
      labelAf: "Poësie",
      works: [
        { id: "afrs-po-1", title: "DBE Afrikaans SAL Poësie-Antologie", author: "Verskeie digters", typeLabel: "Poetry", typeLabelAf: "Poësie", type: "poetry" },
      ],
    },
    {
      type: "short_stories",
      label: "Kortverhale",
      labelAf: "Kortverhale",
      works: [
        { id: "afrs-ss-1", title: "DBE Afrikaans SAL Kortverhale", author: "Verskeie outeurs", typeLabel: "Short Stories", typeLabelAf: "Kortverhale", type: "short_stories" },
      ],
    },
  ],
};

export const LITERATURE_SUBJECT_CODES = ["ENGH", "ENGF", "AFRH", "AFRF", "AFRS"] as const;

export function isLiteratureSubject(code: string): boolean {
  return LITERATURE_SUBJECT_CODES.includes(code as any);
}

export function getLiteratureForSubject(code: string): LiteratureCategory[] {
  return CAPS_LITERATURE[code] ?? [];
}
