export type VarkStyle = "visual" | "auditory" | "read" | "kinesthetic";

export const VARK_STYLES: Record<VarkStyle, {
  label: string;
  labelAf: string;
  icon: string;
  tagline: string;
  taglineAf: string;
  color: string;
  contentOrder: string[];
  ctaIcons: string[];
  ctaLabels: string[];
  ctaLabelsAf: string[];
}> = {
  visual: {
    label: "Visual",
    labelAf: "Visueel",
    icon: "👁",
    tagline: "See diagrams",
    taglineAf: "Sien diagramme",
    color: "blue",
    contentOrder: ["diagram", "summary", "quiz"],
    ctaIcons: ["👁", "📊", "✏", "🔊"],
    ctaLabels: ["View Map", "See Patterns", "Start Quiz", "Ask Rizz"],
    ctaLabelsAf: ["Kyk Kaart", "Sien Patrone", "Begin Toets", "Vra Rizz"],
  },
  auditory: {
    label: "Auditory",
    labelAf: "Ouditief",
    icon: "🔊",
    tagline: "Listen & explain",
    taglineAf: "Luister & verduidelik",
    color: "cyan",
    contentOrder: ["explain", "discuss", "quiz"],
    ctaIcons: ["🔊", "💬", "✏", "📊"],
    ctaLabels: ["Ask Rizz", "Discuss", "Start Quiz", "View Stats"],
    ctaLabelsAf: ["Vra Rizz", "Bespreek", "Begin Toets", "Sien Statistieke"],
  },
  read: {
    label: "Read",
    labelAf: "Lees",
    icon: "📖",
    tagline: "Read & notes",
    taglineAf: "Lees & notas",
    color: "cyan",
    contentOrder: ["notes", "summary", "quiz"],
    ctaIcons: ["📖", "📝", "✏", "📊"],
    ctaLabels: ["Study Notes", "Summaries", "Start Quiz", "View Stats"],
    ctaLabelsAf: ["Studienotas", "Opsommings", "Begin Toets", "Sien Statistieke"],
  },
  kinesthetic: {
    label: "Practice",
    labelAf: "Oefen",
    icon: "✏",
    tagline: "Learn by doing",
    taglineAf: "Leer deur te doen",
    color: "amber",
    contentOrder: ["quiz", "feedback", "explain"],
    ctaIcons: ["✏", "⚡", "📊", "🔊"],
    ctaLabels: ["Start Quiz", "Practice", "View Stats", "Ask Rizz"],
    ctaLabelsAf: ["Begin Toets", "Oefen", "Sien Statistieke", "Vra Rizz"],
  },
};

export const SUBJECT_ICONS: Record<string, string> = {
  "Mathematics": "📊",
  "Mathematical Literacy": "📐",
  "Technical Mathematics": "📐",
  "Physical Sciences": "🧪",
  "Life Sciences": "🌿",
  "Accounting": "📈",
  "Business Studies": "💼",
  "Economics": "💰",
  "Geography": "🌍",
  "History": "📜",
  "Afrikaans Home Language": "💬",
  "Afrikaans First Additional Language": "💬",
  "English Home Language": "📝",
  "English First Additional Language": "📝",
  "Information Technology": "💻",
  "Computer Applications Technology": "🖥",
  "Tourism": "✈",
  "Agricultural Sciences": "🌾",
  "Visual Arts": "🎨",
  "Music": "🎵",
  "Dramatic Arts": "🎭",
  "Life Orientation": "🧭",
  "Religion Studies": "🕊",
  "Engineering Graphics and Design": "📐",
  "Civil Technology": "🏗",
  "Electrical Technology": "⚡",
  "Mechanical Technology": "⚙",
  "Digital Technology": "💻",
};

export const STATUS_ICONS: Record<string, string> = {
  complete: "✅",
  pending: "⏳",
  action: "⚠",
  blocked: "❌",
  restricted: "🔒",
  streak: "🔥",
  achievement: "🏆",
};

export const ADMIN_ICONS: Record<string, string> = {
  schools: "🏫",
  users: "👥",
  analytics: "📊",
  settings: "⚙",
  action: "⚠",
  onboarding: "🚀",
};

export function getSubjectIcon(name: string): string {
  return SUBJECT_ICONS[name] || "📚";
}

export function getContentOrder(style: VarkStyle): string[] {
  return VARK_STYLES[style]?.contentOrder || ["summary", "quiz", "explain"];
}

export function getPrimaryCTAs(style: VarkStyle, isAf = false): Array<{ icon: string; label: string }> {
  const info = VARK_STYLES[style];
  if (!info) return [];
  return info.ctaIcons.map((icon, i) => ({
    icon,
    label: isAf ? info.ctaLabelsAf[i] : info.ctaLabels[i],
  }));
}

export function mapLearningStyleToVark(style: string): VarkStyle {
  switch (style) {
    case "visual": return "visual";
    case "auditory": return "auditory";
    case "reading": return "read";
    case "kinesthetic": return "kinesthetic";
    default: return "kinesthetic";
  }
}

// ── VARK questionnaire ─────────────────────────────────────────────────────
// A real assessment (not self-selection): 12 SA-context scenarios, each with
// four options weighted to one of Visual / Auditory / Read-Write / Kinesthetic.
// The learner answers, `scoreVarkAnswers` tallies the votes and returns a
// primary + optional secondary. This replaces the old "pick one of four cards"
// grid on the onboarding VARK phase.

export interface VarkOption {
  /** Stable key stored in learner answers (e.g. "q1_v"). */
  value: string;
  /** English option label — SA voice, plain-spoken. */
  labelEn: string;
  /** Afrikaans option label — SA voice, plain-spoken. */
  labelAf: string;
  /** Which VARK style this option weights toward. */
  style: VarkStyle;
}

export interface VarkQuestion {
  /** Stable question id, used as the answer-map key. */
  id: string;
  /** English prompt, one scenario per question. */
  promptEn: string;
  /** Afrikaans prompt. */
  promptAf: string;
  /** Exactly four options, one per VARK style, order shuffled by design. */
  options: readonly [VarkOption, VarkOption, VarkOption, VarkOption];
}

/**
 * 12 SA-context questions. Every question has exactly 4 options and every
 * VARK style appears exactly once per question — the answer's `style` is the
 * only signal `scoreVarkAnswers` uses. Option order is deliberately varied so
 * the same position isn't always the same style.
 */
export const VARK_QUESTIONS: readonly VarkQuestion[] = [
  {
    id: "vark_study_prep",
    promptEn: "You're studying for a big test — how do you prep?",
    promptAf: "Jy leer vir 'n groot toets — hoe berei jy voor?",
    options: [
      { value: "vark_study_prep_v", style: "visual",       labelEn: "Highlight my notes and draw mind maps",           labelAf: "Merk my notas en teken breinkaarte" },
      { value: "vark_study_prep_a", style: "auditory",     labelEn: "Read my notes out loud or explain them to myself", labelAf: "Lees my notas hardop of verduidelik dit vir myself" },
      { value: "vark_study_prep_r", style: "read",         labelEn: "Rewrite my notes in my own words",                labelAf: "Skryf my notas oor in my eie woorde" },
      { value: "vark_study_prep_k", style: "kinesthetic",  labelEn: "Do past-paper questions until I get them right",   labelAf: "Doen ou vraestelle totdat ek dit reg kry" },
    ],
  },
  {
    id: "vark_directions",
    promptEn: "A friend asks for directions to your school — what do you do?",
    promptAf: "'n Vriend vra vir rigtings na jou skool — wat doen jy?",
    options: [
      { value: "vark_directions_a", style: "auditory",    labelEn: "Tell them out loud, street by street",              labelAf: "Vertel hulle hardop, straat vir straat" },
      { value: "vark_directions_v", style: "visual",      labelEn: "Sketch a quick map with arrows",                    labelAf: "Skets 'n vinnige kaart met pyle" },
      { value: "vark_directions_k", style: "kinesthetic", labelEn: "Say 'I'll walk / drive with you'",                  labelAf: "Sê 'ek stap of ry saam'" },
      { value: "vark_directions_r", style: "read",        labelEn: "Type step-by-step directions on WhatsApp",          labelAf: "Tik stap-vir-stap rigtings op WhatsApp" },
    ],
  },
  {
    id: "vark_new_dance",
    promptEn: "Learning a new dance move at a school function — what works?",
    promptAf: "Jy leer 'n nuwe dansbeweging by 'n skoolfunksie — wat werk?",
    options: [
      { value: "vark_new_dance_k", style: "kinesthetic", labelEn: "Just start moving and copy the rhythm",             labelAf: "Begin sommer beweeg en volg die ritme" },
      { value: "vark_new_dance_v", style: "visual",      labelEn: "Watch someone else do it first",                    labelAf: "Kyk eers hoe iemand anders dit doen" },
      { value: "vark_new_dance_a", style: "auditory",    labelEn: "Have someone talk me through the beats",            labelAf: "Laat iemand my deur die maat praat" },
      { value: "vark_new_dance_r", style: "read",        labelEn: "Read the steps if they're written down",            labelAf: "Lees die stappe as dit neergeskryf is" },
    ],
  },
  {
    id: "vark_missed_lesson",
    promptEn: "You've missed a lesson — how do you catch up?",
    promptAf: "Jy het 'n les gemis — hoe haal jy in?",
    options: [
      { value: "vark_missed_lesson_r", style: "read",        labelEn: "Borrow a friend's notes and read through them",  labelAf: "Leen 'n vriend se notas en lees deur" },
      { value: "vark_missed_lesson_a", style: "auditory",    labelEn: "Ask a friend to explain what happened",          labelAf: "Vra 'n vriend om te verduidelik wat gebeur het" },
      { value: "vark_missed_lesson_v", style: "visual",      labelEn: "Ask for diagrams, slides or a photo of the board", labelAf: "Vra vir diagramme, skyfies of 'n foto van die bord" },
      { value: "vark_missed_lesson_k", style: "kinesthetic", labelEn: "Try the exercises and work backwards",           labelAf: "Probeer die oefeninge en werk terug" },
    ],
  },
  {
    id: "vark_group_project",
    promptEn: "In a group project meeting — what's the role you naturally take?",
    promptAf: "In 'n groep-projek vergadering — watter rol vat jy natuurlik?",
    options: [
      { value: "vark_group_project_r", style: "read",        labelEn: "Write and edit the report",                      labelAf: "Skryf en redigeer die verslag" },
      { value: "vark_group_project_a", style: "auditory",    labelEn: "Lead the discussion and do the talking",         labelAf: "Lei die bespreking en doen die praatwerk" },
      { value: "vark_group_project_v", style: "visual",      labelEn: "Design the presentation slides",                 labelAf: "Ontwerp die aanbieding-skyfies" },
      { value: "vark_group_project_k", style: "kinesthetic", labelEn: "Build the model or run the demo",                labelAf: "Bou die model of doen die demonstrasie" },
    ],
  },
  {
    id: "vark_new_app",
    promptEn: "You install a new app on your phone — how do you figure it out?",
    promptAf: "Jy laai 'n nuwe App op jou foon af — hoe leer jy dit ken?",
    options: [
      { value: "vark_new_app_k", style: "kinesthetic", labelEn: "Tap around and try things until it makes sense",     labelAf: "Tik rond en probeer dinge tot dit sin maak" },
      { value: "vark_new_app_r", style: "read",        labelEn: "Read the help pages / FAQ",                          labelAf: "Lees die hulp-blaaie / vrae-lys" },
      { value: "vark_new_app_v", style: "visual",      labelEn: "Study the icons and screenshots",                    labelAf: "Bestudeer die ikone en skermgrepe" },
      { value: "vark_new_app_a", style: "auditory",    labelEn: "Watch a TikTok or ask a friend to explain",          labelAf: "Kyk 'n TikTok of vra 'n vriend om te verduidelik" },
    ],
  },
  {
    id: "vark_hard_concept",
    promptEn: "The teacher is explaining a hard concept in class — what helps you get it?",
    promptAf: "Die onnie verduidelik 'n moeilike konsep in die klas — wat help jou dit vat?",
    options: [
      { value: "vark_hard_concept_v", style: "visual",      labelEn: "Diagrams and drawings on the board",             labelAf: "Diagramme en tekeninge op die bord" },
      { value: "vark_hard_concept_a", style: "auditory",    labelEn: "Hearing the teacher explain it out loud",        labelAf: "Om die onnie hardop te hoor verduidelik" },
      { value: "vark_hard_concept_r", style: "read",        labelEn: "A worked example in the textbook",               labelAf: "'n Uitgewerkte voorbeeld in die handboek" },
      { value: "vark_hard_concept_k", style: "kinesthetic", labelEn: "Trying a practice question myself",              labelAf: "Om self 'n oefenvraag te probeer" },
    ],
  },
  {
    id: "vark_subject_choice",
    promptEn: "Choosing which subjects to take next year — how do you decide?",
    promptAf: "Watter vakke jy volgende jaar wil vat — hoe besluit jy?",
    options: [
      { value: "vark_subject_choice_a", style: "auditory",    labelEn: "Talk to older learners and teachers",            labelAf: "Gesels met ouer leerders en onnies" },
      { value: "vark_subject_choice_r", style: "read",        labelEn: "Read the subject descriptions and pass rates",   labelAf: "Lees die vakbeskrywings en slaagsyfers" },
      { value: "vark_subject_choice_k", style: "kinesthetic", labelEn: "Try a taster class or sample paper",             labelAf: "Probeer 'n proefklas of monster-vraestel" },
      { value: "vark_subject_choice_v", style: "visual",      labelEn: "Look at graphs of marks and career flowcharts",   labelAf: "Kyk na grafieke van punte en beroeps-vloeikaarte" },
    ],
  },
  {
    id: "vark_sports_play",
    promptEn: "The coach shows a new play at practice — what makes it stick?",
    promptAf: "Die afrigter wys 'n nuwe speelbeweging by oefening — wat laat dit sit?",
    options: [
      { value: "vark_sports_play_k", style: "kinesthetic", labelEn: "Running it on the field until it clicks",         labelAf: "Om dit op die veld te oefen totdat dit klik" },
      { value: "vark_sports_play_v", style: "visual",      labelEn: "Watching the coach demonstrate step-by-step",     labelAf: "Om te kyk hoe die afrigter dit stap-vir-stap demonstreer" },
      { value: "vark_sports_play_a", style: "auditory",    labelEn: "Listening to the coach call it out",              labelAf: "Om te luister hoe die afrigter dit uitroep" },
      { value: "vark_sports_play_r", style: "read",        labelEn: "Studying the playbook on paper",                  labelAf: "Om die speelboek op papier te bestudeer" },
    ],
  },
  {
    id: "vark_poetry",
    promptEn: "Memorising a poem for a class recital — how do you do it?",
    promptAf: "Om 'n gedig vir 'n klasvoordrag uit die kop te leer — hoe doen jy dit?",
    options: [
      { value: "vark_poetry_a", style: "auditory",    labelEn: "Say it out loud until it sticks",                   labelAf: "Sê dit hardop totdat dit sit" },
      { value: "vark_poetry_v", style: "visual",      labelEn: "Picture each line as a scene in my head",           labelAf: "Sien elke reël as 'n toneel in my kop" },
      { value: "vark_poetry_k", style: "kinesthetic", labelEn: "Walk around while reciting so my body remembers",   labelAf: "Loop rond terwyl ek voordra sodat my lyf onthou" },
      { value: "vark_poetry_r", style: "read",        labelEn: "Write it out over and over by hand",                labelAf: "Skryf dit oor en oor met die hand uit" },
    ],
  },
  {
    id: "vark_load_shedding",
    promptEn: "Explaining load-shedding to a younger cousin — how would you do it?",
    promptAf: "Om beurtkrag aan 'n jonger neefie te verduidelik — hoe sou jy dit doen?",
    options: [
      { value: "vark_load_shedding_v", style: "visual",      labelEn: "Draw a picture of the grid and the outage",       labelAf: "Teken 'n prentjie van die netwerk en die onderbreking" },
      { value: "vark_load_shedding_k", style: "kinesthetic", labelEn: "Show them by flicking a switch on and off",        labelAf: "Wys hulle deur 'n skakelaar aan-en-af te druk" },
      { value: "vark_load_shedding_a", style: "auditory",    labelEn: "Tell them a story about the power going out",      labelAf: "Vertel hulle 'n storie oor hoe die krag afgaan" },
      { value: "vark_load_shedding_r", style: "read",        labelEn: "Write out a short explanation they can read",      labelAf: "Skryf 'n kort verduideliking uit wat hulle kan lees" },
    ],
  },
  {
    id: "vark_bad_result",
    promptEn: "After a bad test result — how do you improve for next time?",
    promptAf: "Ná 'n swak toets-uitslag — hoe verbeter jy vir volgende keer?",
    options: [
      { value: "vark_bad_result_k", style: "kinesthetic", labelEn: "Redo every question until I can do it",             labelAf: "Doen elke vraag oor totdat ek dit kan doen" },
      { value: "vark_bad_result_r", style: "read",        labelEn: "Read the memo and rewrite my answers",              labelAf: "Lees die memo en skryf my antwoorde oor" },
      { value: "vark_bad_result_a", style: "auditory",    labelEn: "Talk it through with the teacher",                  labelAf: "Praat dit deur met die onnie" },
      { value: "vark_bad_result_v", style: "visual",      labelEn: "Look over the paper and spot the patterns",         labelAf: "Kyk oor die vraestel en sien die patrone" },
    ],
  },
] as const;

/**
 * Deterministic tiebreak order — used when two styles share the top score.
 * Chosen to match the canonical V/A/R/K sequence so results are stable and
 * reproducible for the same answer set (the unit tests depend on this).
 */
const VARK_TIEBREAK_ORDER: readonly VarkStyle[] = ["visual", "auditory", "read", "kinesthetic"];

export interface VarkScoreResult {
  /** The style with the highest vote count (tiebroken deterministically). */
  primary: VarkStyle;
  /** The runner-up, ONLY if within 20% of the primary's votes. Otherwise null. */
  secondary: VarkStyle | null;
  /** Full per-style tallies — handy for debugging + preview inspectors. */
  scores: Record<VarkStyle, number>;
}

/**
 * Pure scoring function: turn a map of `{ questionId -> optionValue }` into a
 * VARK profile. Missing/invalid answers are skipped (they count as 0 votes),
 * which lets the caller gate proceed vs. present partial results without a
 * second code path. Ties break in canonical V→A→R→K order. Secondary is
 * returned only when it is at least 80% of the primary's vote count (the
 * "within 20%" rule from the assessment spec).
 */
export function scoreVarkAnswers(answers: Record<string, string | null | undefined>): VarkScoreResult {
  const scores: Record<VarkStyle, number> = {
    visual: 0,
    auditory: 0,
    read: 0,
    kinesthetic: 0,
  };

  for (const question of VARK_QUESTIONS) {
    const chosen = answers[question.id];
    if (typeof chosen !== "string") continue;
    const option = question.options.find((o) => o.value === chosen);
    if (!option) continue;
    scores[option.style] += 1;
  }

  // Sort styles by (score desc, tiebreak order asc). Tiebreak order is the
  // index of the style in VARK_TIEBREAK_ORDER, so lower index wins ties.
  const ranked = (Object.keys(scores) as VarkStyle[])
    .map((style) => ({ style, score: scores[style], order: VARK_TIEBREAK_ORDER.indexOf(style) }))
    .sort((a, b) => (b.score - a.score) || (a.order - b.order));

  const primary = ranked[0].style;
  const primaryScore = ranked[0].score;
  const runnerUp = ranked[1];

  // Secondary only when it's within 20% of the primary — i.e. it's genuinely
  // competitive, not just "second place with zero votes". Uses ceil so that a
  // primary of 5 still admits a secondary of 4 (5 * 0.8 = 4.0, ceil = 4).
  const threshold = Math.ceil(primaryScore * 0.8);
  const secondary =
    runnerUp && runnerUp.score > 0 && runnerUp.score >= threshold && runnerUp.style !== primary
      ? runnerUp.style
      : null;

  return { primary, secondary, scores };
}
