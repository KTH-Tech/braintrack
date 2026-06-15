/**
 * Task #428 — Per-Topic Content Layer Seeder
 *
 * Idempotent seed script. Populates:
 *   - topic_notes        (EN + AF) for the top 10 most-taken Grade 12 subjects
 *   - topic_flashcards   (EN) for the same subjects (mirrors curated FLASHCARD_DECKS
 *                         and adds a starter card per topic where none exists)
 *   - literature_works   for English HL (ENGH) and Afrikaans HL (AFRH)
 *   - literature_notes   (EN/AF) for a curated set of well-known set works
 *
 * Run: npx tsx scripts/seed-topic-content.ts
 */
import { db } from "../server/db";
import {
  subjects,
  topics,
  topicNotes,
  topicFlashcards,
  literatureWorks,
  literatureNotes,
} from "../shared/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { markSeederCompleted } from "../server/curated-topic-count-cache";
import { CAPS_TOPICS } from "../client/src/lib/constants";
import { CAPS_LITERATURE } from "../client/src/lib/literature-caps";
import { FLASHCARD_DECKS } from "../client/src/lib/flashcard-data";
import { NON_STEM_WORKED_EXAMPLES } from "./worked-examples-non-stem";
import { STEM_WORKED_EXAMPLES } from "./worked-examples-stem";

// =============================================================================
// All CAPS Grade 12 subjects (top 10 original + remaining ~24 for Task #429)
// =============================================================================
const ALL_SUBJECT_CODES = [
  // Original top 10
  "MATH", "PHYS", "LIFE", "ENGH", "AFRH",
  "MATL", "ACC", "BUS", "ECO", "GEO",
  // Remaining subjects (Task #429)
  "HIS", "ENGF", "AFRF",
  "IT", "CAT", "EGD",
  "AGR", "CON", "TOUR",
  "ART", "TMATH", "TSCI",
  "RELI", "DRAMA", "DANCE", "MUSIC", "DESIGN",
  "CIVT", "ELEC", "MECH", "DIGT",
  "AGRM", "AGRT", "HOSP", "LO",
  // African Official Languages — Home Language (Task #534)
  "ZULH", "XHOH", "SEPH", "SETH", "SESH", "TSHH", "XITH", "NDH", "SWAH",
  // African Official Languages — First Additional Language (Task #534)
  "ZULF", "XHOF", "SEPF", "SETF", "SESF", "TSHF", "XITF", "NDF", "SWAF",
  // Niche Sciences (Task #534)
  "MRSCI",
];

// Per-topic curated content keyed by capsCode.
// {summaryEn, summaryAf, conceptsEn[], conceptsAf[], example?, workedExamplesEn?, workedExamplesAf?}
type WorkedExample = {
  question: string;
  steps: string[];
  solution: string;
  commonErrors: string[];
};

type DiagramEntry = {
  label: string;
  ascii: string;
  caption: string;
};

type TopicContent = {
  summaryEn: string;
  summaryAf: string;
  conceptsEn: string[];
  conceptsAf: string[];
  exampleEn?: { question: string; solution: string };
  exampleAf?: { question: string; solution: string };
  workedExamplesEn?: WorkedExample[];
  workedExamplesAf?: WorkedExample[];
  diagramsEn?: DiagramEntry[];
  diagramsAf?: DiagramEntry[];
};

const TOPIC_CONTENT: Record<string, TopicContent> = {
  // --------------------- MATHEMATICS ---------------------
  "MATH-1": {
    summaryEn: "Recognise and use formulas for arithmetic and geometric sequences and series, including sum to infinity and sigma notation.",
    summaryAf: "Herken en gebruik formules vir rekenkundige en meetkundige rye en reekse, insluitend som tot oneindig en sigma-notasie.",
    conceptsEn: ["Tₙ = a + (n−1)d for arithmetic sequences", "Tₙ = a·rⁿ⁻¹ for geometric sequences", "S∞ = a/(1−r) when |r|<1"],
    conceptsAf: ["Tₙ = a + (n−1)d vir rekenkundige rye", "Tₙ = a·rⁿ⁻¹ vir meetkundige rye", "S∞ = a/(1−r) wanneer |r|<1"],
    exampleEn: { question: "Find the 10th term of 3, 7, 11, 15, …", solution: "a=3, d=4 → T₁₀ = 3 + 9·4 = 39" },
    exampleAf: { question: "Vind die 10de term van 3, 7, 11, 15, …", solution: "a=3, d=4 → T₁₀ = 3 + 9·4 = 39" },
    workedExamplesEn: [
      {
        question: "The 5th term of an arithmetic sequence is 23 and the 12th term is 58. Find the first term and common difference, then find S₂₀.",
        steps: [
          "Write two equations using Tₙ = a + (n−1)d: T₅ = a + 4d = 23 and T₁₂ = a + 11d = 58.",
          "Subtract the first from the second: 7d = 35, so d = 5.",
          "Substitute back: a + 4(5) = 23 → a = 3.",
          "Apply Sₙ = n/2·[2a + (n−1)d]: S₂₀ = 20/2·[2(3) + 19(5)] = 10 × 101 = 1010."
        ],
        solution: "a = 3, d = 5, S₂₀ = 1010",
        commonErrors: ["Subtracting equations the wrong way (getting negative d)", "Using Sₙ = n/2·(a + l) without finding the last term first", "Off-by-one: T₅ uses (n−1) = 4, not 5"]
      },
      {
        question: "A geometric sequence has T₂ = 6 and T₅ = 48. Find r and determine whether S∞ exists.",
        steps: [
          "Write T₂ = ar = 6 and T₅ = ar⁴ = 48.",
          "Divide: r³ = 48/6 = 8, so r = 2.",
          "Find a: a(2) = 6 → a = 3.",
          "Check: |r| = 2 > 1, so S∞ does NOT exist."
        ],
        solution: "r = 2, a = 3; S∞ does not exist because |r| ≥ 1",
        commonErrors: ["Forgetting to check |r| < 1 before applying S∞ = a/(1−r)", "Dividing T₂/T₅ instead of T₅/T₂ — this gives 1/r³"]
      },
      {
        question: "Evaluate: Σ(k=1 to 6) of (3·2^(k−1)).",
        steps: [
          "Recognise a geometric series with a = 3 and r = 2.",
          "n = 6 terms.",
          "S₆ = 3(2⁶ − 1)/(2 − 1) = 3 × 63 = 189."
        ],
        solution: "S₆ = 189",
        commonErrors: ["Computing 2⁶ as 32 instead of 64", "Misreading sigma notation as starting at k = 0"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Die 5de term van 'n rekenkundige ry is 23 en die 12de term is 58. Vind a en d, bereken dan S₂₀.",
        steps: ["T₅ = a + 4d = 23 en T₁₂ = a + 11d = 58.", "7d = 35 → d = 5; a = 3.", "S₂₀ = 10[6 + 95] = 1010."],
        solution: "a = 3, d = 5, S₂₀ = 1010",
        commonErrors: ["Verkeerde aftrekking gee negatiewe d", "Gebruik T₅ met (n−1)=5 eerder as 4"]
      },
      {
        question: "Meetkundige ry: T₂ = 6 en T₅ = 48. Vind r en bepaal of S∞ bestaan.",
        steps: ["r³ = 48/6 = 8 → r = 2; a = 3.", "|r| = 2 > 1, S∞ bestaan NIE."],
        solution: "r = 2, a = 3; S∞ bestaan nie",
        commonErrors: ["Vergeet om |r| < 1 te toets"]
      },
      {
        question: "Bereken Σ(k=1 tot 6) van (3·2^(k−1)).",
        steps: ["a = 3, r = 2, n = 6.", "S₆ = 3(64−1)/1 = 189."],
        solution: "189",
        commonErrors: ["2⁶ = 64, nie 32 nie"]
      }
    ],
  },
  "MATH-2": {
    summaryEn: "Sketch and interpret functions and their inverses; understand domain, range and one-to-one mappings.",
    summaryAf: "Skets en interpreteer funksies en hul inverses; verstaan definisieversameling, beeldversameling en een-tot-een afbeeldings.",
    conceptsEn: ["Inverse: swap x and y, then solve for y", "Reflection in y = x", "f(x) must be one-to-one for f⁻¹ to be a function"],
    conceptsAf: ["Invers: ruil x en y, los dan op vir y", "Refleksie in y = x", "f(x) moet een-tot-een wees vir f⁻¹ om 'n funksie te wees"],
    workedExamplesEn: [
      {
        question: "Given f(x) = 2x + 4, find f⁻¹(x) and state its domain and range.",
        steps: [
          "Write y = 2x + 4.",
          "Swap x and y: x = 2y + 4.",
          "Solve for y: y = (x − 4)/2, so f⁻¹(x) = (x − 4)/2.",
          "f is linear (one-to-one), so domain of f⁻¹: x ∈ ℝ; range: y ∈ ℝ."
        ],
        solution: "f⁻¹(x) = (x − 4)/2, Domain: ℝ, Range: ℝ",
        commonErrors: ["Forgetting to swap x and y — you must swap BEFORE solving for y", "Writing f⁻¹(x) = 1/(2x+4) — that is the reciprocal, not the inverse"]
      },
      {
        question: "f(x) = x² − 1 with x ≥ 0. Find f⁻¹(x) and state its domain.",
        steps: [
          "Restriction x ≥ 0 ensures f is one-to-one (right branch of parabola only).",
          "Write y = x² − 1, then swap: x = y² − 1.",
          "Solve: y² = x + 1, y = √(x + 1) (positive root because domain is x ≥ 0).",
          "f⁻¹(x) = √(x + 1), domain x ≥ −1."
        ],
        solution: "f⁻¹(x) = √(x + 1), domain x ≥ −1",
        commonErrors: ["Taking both ±√(x+1) — the domain restriction forces the positive root only", "Wrong domain for f⁻¹: the range of f becomes the domain of f⁻¹"]
      },
      {
        question: "If g(x) = 3ˣ, write down g⁻¹(x) and state its asymptote.",
        steps: [
          "Swap in y = 3ˣ: x = 3ʸ.",
          "Write in log form: y = log₃ x, so g⁻¹(x) = log₃ x.",
          "Log functions have a vertical asymptote at x = 0."
        ],
        solution: "g⁻¹(x) = log₃ x; vertical asymptote x = 0",
        commonErrors: ["Writing asymptote as y = 0 (that belongs to g, not g⁻¹)", "Domain of log₃ x is x > 0, not x ≥ 0"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Gegee f(x) = 2x + 4, vind f⁻¹(x) en stel def- en beeldversameling.",
        steps: ["y = 2x + 4 → ruil: x = 2y + 4 → f⁻¹(x) = (x − 4)/2.", "Def: ℝ, Beeld: ℝ."],
        solution: "f⁻¹(x) = (x − 4)/2",
        commonErrors: ["Vergeet om x en y te ruil", "Verwar resiproke 1/f(x) met f⁻¹(x)"]
      },
      {
        question: "f(x) = x² − 1, x ≥ 0. Vind f⁻¹(x).",
        steps: ["Ruil: x = y² − 1 → y = √(x+1).", "Def van f⁻¹: x ≥ −1."],
        solution: "f⁻¹(x) = √(x+1), x ≥ −1",
        commonErrors: ["Neem ±√ in plaas van net +√"]
      },
      {
        question: "g(x) = 3ˣ. Skryf g⁻¹(x) en die asimptoot neer.",
        steps: ["g⁻¹(x) = log₃ x.", "Asimptoot: x = 0."],
        solution: "g⁻¹(x) = log₃ x; x = 0",
        commonErrors: ["Asimptoot as y = 0 — dit behoort aan g nie g⁻¹ nie"]
      }
    ],
  },
  "MATH-3": {
    summaryEn: "Convert between exponential and logarithmic forms; apply log laws to simplify and solve equations.",
    summaryAf: "Skakel om tussen eksponensiële en logaritmiese vorme; pas logaritmewette toe om te vereenvoudig en vergelykings op te los.",
    conceptsEn: ["aˣ = b ⇔ x = logₐ b", "log(AB) = log A + log B", "log(Aⁿ) = n·log A"],
    conceptsAf: ["aˣ = b ⇔ x = logₐ b", "log(AB) = log A + log B", "log(Aⁿ) = n·log A"],
    workedExamplesEn: [
      {
        question: "Solve for x: 2^(x+1) = 5. Give your answer correct to two decimal places.",
        steps: [
          "Take log (base 10) of both sides: log 2^(x+1) = log 5.",
          "Apply the power law: (x+1)·log 2 = log 5.",
          "x + 1 = log5/log2 ≈ 0.69897/0.30103 ≈ 2.3219.",
          "x ≈ 1.32."
        ],
        solution: "x ≈ 1.32",
        commonErrors: ["Rounding intermediate values — keep full decimals until the final answer", "Applying log to each part separately: log(2) + log(x+1) ≠ (x+1)log 2"]
      },
      {
        question: "Simplify: log₂ 8 + log₂ 4 − log₂ 2.",
        steps: [
          "Apply laws: log₂(8 × 4 ÷ 2) = log₂ 16.",
          "log₂ 16 = log₂ 2⁴ = 4."
        ],
        solution: "4",
        commonErrors: ["Multiplying the base numbers: log₂ 8 × log₂ 4 ≠ log₂ 32", "Misapplying subtraction: log₂(8 + 4 − 2) = log₂ 10 is wrong"]
      },
      {
        question: "Given log 2 = 0.301 and log 3 = 0.477, find log 72 without a calculator.",
        steps: [
          "Factorise 72 = 2³ × 3².",
          "log 72 = log(2³ × 3²) = 3·log 2 + 2·log 3.",
          "= 3(0.301) + 2(0.477) = 0.903 + 0.954 = 1.857."
        ],
        solution: "log 72 = 1.857",
        commonErrors: ["Writing log(2³ + 3²) instead of log(2³ × 3²)", "Adding instead of multiplying: 3 + log 2 instead of 3·log 2"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Los op vir x: 2^(x+1) = 5 (twee desimale).",
        steps: ["(x+1)·log 2 = log 5.", "x + 1 ≈ 2.3219 → x ≈ 1.32."],
        solution: "x ≈ 1.32",
        commonErrors: ["Afronding van tussenstappe veroorsaak afwykings"]
      },
      {
        question: "Vereenvoudig: log₂ 8 + log₂ 4 − log₂ 2.",
        steps: ["log₂(8×4/2) = log₂ 16 = 4."],
        solution: "4",
        commonErrors: ["Vermenigvuldig argumente instede van bymekaartel van logaritmes"]
      },
      {
        question: "Gegee log 2 = 0.301 en log 3 = 0.477, vind log 72.",
        steps: ["72 = 2³ × 3².", "log 72 = 3(0.301) + 2(0.477) = 1.857."],
        solution: "log 72 = 1.857",
        commonErrors: ["Skryf log(2³ + 3²) in plaas van log(2³ × 3²)"]
      }
    ],
  },
  "MATH-4": {
    summaryEn: "Compound growth & decay, future and present value annuities, and effective vs nominal interest rates.",
    summaryAf: "Saamgestelde groei en verval, toekoms- en huidige waarde annuïteite, en effektiewe vs nominale rentekoerse.",
    conceptsEn: ["A = P(1+i)ⁿ for growth", "A = P(1−i)ⁿ for reducing-balance depreciation", "F = x[(1+i)ⁿ − 1] / i (future value annuity)"],
    conceptsAf: ["A = P(1+i)ⁿ vir groei", "A = P(1−i)ⁿ vir verminderingssaldo waardevermindering", "F = x[(1+i)ⁿ − 1] / i (toekomswaarde annuïteit)"],
    workedExamplesEn: [
      {
        question: "R15 000 is invested at 8% p.a. compounded quarterly for 5 years. Calculate the final amount.",
        steps: [
          "Compounded quarterly: i = 8%/4 = 2% = 0.02 per quarter.",
          "n = 5 × 4 = 20 quarters.",
          "A = 15 000 × (1.02)²⁰ ≈ 15 000 × 1.48595 ≈ R22 289."
        ],
        solution: "A ≈ R22 289",
        commonErrors: ["Using the annual rate 0.08 without dividing by 4", "Using n = 5 years instead of n = 20 quarters"]
      },
      {
        question: "Sipho saves R800 per month at the end of each month for 3 years at 6% p.a. compounded monthly. How much will he have?",
        steps: [
          "Future value annuity: x = 800, i = 6%/12 = 0.005 per month, n = 36.",
          "F = 800 × [(1.005)³⁶ − 1] / 0.005.",
          "(1.005)³⁶ ≈ 1.19668.",
          "F = 800 × (0.19668/0.005) = 800 × 39.336 ≈ R31 469."
        ],
        solution: "F ≈ R31 469",
        commonErrors: ["Using the present value formula instead of future value", "n = 3 years instead of 36 months"]
      },
      {
        question: "A car costs R200 000 and depreciates at 12% p.a. on a reducing balance. What is it worth after 4 years?",
        steps: [
          "Reducing balance: A = P(1 − i)ⁿ.",
          "A = 200 000 × (0.88)⁴ ≈ 200 000 × 0.59969 ≈ R119 938."
        ],
        solution: "A ≈ R119 938",
        commonErrors: ["Using the growth formula (1+i)ⁿ instead of (1−i)ⁿ", "Using straight-line formula A = P(1 − i·n) instead of compound"]
      }
    ],
    workedExamplesAf: [
      {
        question: "R15 000 belê teen 8% p.j. saamgestel kwartaalliks vir 5 jaar.",
        steps: ["i = 0.02 per kwartaal; n = 20.", "A = 15 000 × (1.02)²⁰ ≈ R22 289."],
        solution: "A ≈ R22 289",
        commonErrors: ["Gebruik jaarliks i sonder deling deur 4"]
      },
      {
        question: "Sipho spaar R800/maand teen 6% p.j. saamgestel maandeliks vir 3 jaar.",
        steps: ["i = 0.005; n = 36.", "F = 800 × [(1.005)³⁶ − 1]/0.005 ≈ R31 469."],
        solution: "F ≈ R31 469",
        commonErrors: ["n = 3 eerder as 36"]
      },
      {
        question: "Motor: R200 000, waardeer teen 12% p.j. verminderende saldo. Waarde na 4 jaar?",
        steps: ["A = 200 000 × (0.88)⁴ ≈ R119 938."],
        solution: "A ≈ R119 938",
        commonErrors: ["Gebruik (1+i)ⁿ in plaas van (1−i)ⁿ"]
      }
    ],
  },
  "MATH-5": {
    summaryEn: "Compound and double angle identities, trig equations, and the sine, cosine and area rules in 2D and 3D.",
    summaryAf: "Saamgestelde en dubbelhoek identiteite, trig vergelykings, en die sinus-, cosinus- en oppervlakte reëls in 2D en 3D.",
    conceptsEn: ["sin(A±B) = sinA·cosB ± cosA·sinB", "cos2A = 1 − 2sin²A", "Sine rule: a/sinA = b/sinB"],
    conceptsAf: ["sin(A±B) = sinA·cosB ± cosA·sinB", "cos2A = 1 − 2sin²A", "Sinus reël: a/sinA = b/sinB"],
    workedExamplesEn: [
      {
        question: "Prove that (sin x + cos x)² = 1 + sin 2x.",
        steps: [
          "Expand LHS: sin²x + 2sinx·cosx + cos²x.",
          "Apply sin²x + cos²x = 1 and 2sinx·cosx = sin 2x.",
          "LHS = 1 + sin 2x = RHS. ✓"
        ],
        solution: "Proven: LHS = 1 + sin 2x",
        commonErrors: ["Working on both sides simultaneously — work ONE side only in NSC proofs", "Expanding (a+b)² as a² + b²"]
      },
      {
        question: "Solve for x ∈ [0°; 360°]: 2sin²x − sinx − 1 = 0.",
        steps: [
          "Factorise: (2sinx + 1)(sinx − 1) = 0.",
          "sinx = −½ → x = 210° or 330°.",
          "sinx = 1 → x = 90°.",
          "Solution: x = 90°, 210°, 330°."
        ],
        solution: "x = 90°, 210°, 330°",
        commonErrors: ["Missing second/third quadrant answers for sinx = −½", "Dividing both sides by sinx (loses the root sinx = 0)"]
      },
      {
        question: "In triangle ABC, AB = 7 cm, AC = 9 cm and angle A = 64°. Find BC.",
        steps: [
          "Use the cosine rule: BC² = AB² + AC² − 2·AB·AC·cosA.",
          "BC² = 49 + 81 − 2(7)(9)cos64° = 130 − 126(0.4384) = 74.76.",
          "BC = √74.76 ≈ 8.65 cm."
        ],
        solution: "BC ≈ 8.65 cm",
        commonErrors: ["Using the sine rule for SAS — use the cosine rule when you have two sides and included angle", "Forgetting to take the square root at the end"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bewys: (sin x + cos x)² = 1 + sin 2x.",
        steps: ["Uitbrei: sin²x + 2sinx·cosx + cos²x = 1 + sin 2x. ✓"],
        solution: "LK = 1 + sin 2x = RK",
        commonErrors: ["Werk aan beide kante — werk net EEN kant"]
      },
      {
        question: "Los op x ∈ [0°; 360°]: 2sin²x − sinx − 1 = 0.",
        steps: ["(2sinx+1)(sinx−1)=0.", "sinx=−½ → 210°,330°; sinx=1 → 90°."],
        solution: "x = 90°, 210°, 330°",
        commonErrors: ["Mis kwadrant-3 oplossing vir sinx = −½"]
      },
      {
        question: "Driehoek ABC: AB=7, AC=9, hoek A=64°. Vind BC.",
        steps: ["BC² = 49+81−126cos64° = 74.76.", "BC ≈ 8.65 cm."],
        solution: "BC ≈ 8.65 cm",
        commonErrors: ["Gebruik sinusreël in plaas van kosinusreël vir SAS"]
      }
    ],
  },
  "MATH-6": {
    summaryEn: "Use the remainder and factor theorems to factorise cubic polynomials and solve cubic equations.",
    summaryAf: "Gebruik die res- en faktorstellings om kubieke polinome te faktoriseer en kubieke vergelykings op te los.",
    conceptsEn: ["Remainder = f(a) when divided by (x−a)", "(x−a) is a factor ⇔ f(a)=0", "Cubic ax³+bx²+cx+d factorises into (x−r)(quadratic)"],
    conceptsAf: ["Res = f(a) wanneer gedeel deur (x−a)", "(x−a) is 'n faktor ⇔ f(a)=0", "Kubieke faktoriseer in (x−r)(kwadratiese)"],
    workedExamplesEn: [
      {
        question: "Find the remainder when p(x) = 2x³ − 3x² + x − 5 is divided by (x − 2).",
        steps: [
          "By the Remainder Theorem, remainder = p(2).",
          "p(2) = 2(8) − 3(4) + 2 − 5 = 16 − 12 + 2 − 5 = 1."
        ],
        solution: "Remainder = 1",
        commonErrors: ["Substituting x = −2 instead of x = 2 (the zero of x − 2 is x = 2)", "Arithmetic errors — write out each term separately"]
      },
      {
        question: "Show that (x − 1) is a factor of f(x) = x³ + 2x² − 5x + 2, then factorise f(x) completely.",
        steps: [
          "Test x = 1: f(1) = 1 + 2 − 5 + 2 = 0. ✓ So (x − 1) is a factor.",
          "Divide: f(x) ÷ (x − 1) = x² + 3x − 2.",
          "Full factorisation: f(x) = (x − 1)(x² + 3x − 2).",
          "Quadratic roots (if needed): x = (−3 ± √17)/2."
        ],
        solution: "f(x) = (x − 1)(x² + 3x − 2)",
        commonErrors: ["Not verifying f(1) = 0 first", "Errors in long/synthetic division — expand back to check"]
      },
      {
        question: "Solve completely: x³ − 7x + 6 = 0.",
        steps: [
          "Trial: f(1) = 1 − 7 + 6 = 0. ✓ → (x − 1) is a factor.",
          "x³ − 7x + 6 = (x − 1)(x² + x − 6) = (x − 1)(x + 3)(x − 2).",
          "Solutions: x = 1, x = 2, x = −3."
        ],
        solution: "x = 1, 2, −3",
        commonErrors: ["Only trying x = 1 — also test ±1, ±2, ±3, ±6", "Sign error when coefficient of x² is 0"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Vind die res: p(x) = 2x³ − 3x² + x − 5 gedeel deur (x − 2).",
        steps: ["Res = p(2) = 16 − 12 + 2 − 5 = 1."],
        solution: "Res = 1",
        commonErrors: ["Vervang x = −2 instede van x = 2"]
      },
      {
        question: "Toon (x − 1) is 'n faktor van f(x) = x³ + 2x² − 5x + 2 en faktoriseer volledig.",
        steps: ["f(1) = 0 ✓.", "f(x) = (x − 1)(x² + 3x − 2)."],
        solution: "(x − 1)(x² + 3x − 2)",
        commonErrors: ["Toets nie faktorstelling voor deling nie"]
      },
      {
        question: "Los op: x³ − 7x + 6 = 0.",
        steps: ["f(1) = 0 ✓ → (x−1)(x+3)(x−2) = 0.", "x = 1, 2, −3."],
        solution: "x = 1, 2, −3",
        commonErrors: ["Probeer nie alle moontlike rasionele wortels nie"]
      }
    ],
  },
  "MATH-7": {
    summaryEn: "First principles, rules of differentiation, applications to gradients, tangents, and optimisation.",
    summaryAf: "Eerste beginsels, differensiasiereëls, toepassings op gradiënte, raaklyne, en optimalisering.",
    conceptsEn: ["d/dx[xⁿ] = n·xⁿ⁻¹", "f'(x)=0 at stationary points", "Concavity from f''(x)"],
    conceptsAf: ["d/dx[xⁿ] = n·xⁿ⁻¹", "f'(x)=0 by stilstandpunte", "Konkawiteit uit f''(x)"],
    exampleEn: { question: "Find the turning points of f(x)=x³−3x", solution: "f'(x)=3x²−3=0 → x=±1; turning points at (1,−2) and (−1,2)" },
    exampleAf: { question: "Vind die draaipunte van f(x)=x³−3x", solution: "f'(x)=3x²−3=0 → x=±1; draaipunte by (1,−2) en (−1,2)" },
    workedExamplesEn: [
      {
        question: "Given f(x) = x³ − 3x, find all stationary points and classify them.",
        steps: [
          "Find f'(x) = 3x² − 3.",
          "Set f'(x) = 0: 3x² − 3 = 0 → x² = 1 → x = ±1.",
          "Find y-values: f(1) = 1 − 3 = −2 and f(−1) = −1 + 3 = 2.",
          "Find f''(x) = 6x. At x = 1: f''(1) = 6 > 0 → local minimum. At x = −1: f''(−1) = −6 < 0 → local maximum."
        ],
        solution: "Local max at (−1, 2); local min at (1, −2)",
        commonErrors: ["Forgetting to find y-values — just finding x = ±1 is incomplete", "Reversing the classification: f'' > 0 means local minimum (concave up)"]
      },
      {
        question: "Find the equation of the tangent to g(x) = x² + 3x at x = 2.",
        steps: [
          "Find g(2) = 4 + 6 = 10. Point: (2, 10).",
          "Find g'(x) = 2x + 3, so g'(2) = 7. This is the gradient.",
          "Tangent: y − 10 = 7(x − 2) → y = 7x − 4."
        ],
        solution: "y = 7x − 4",
        commonErrors: ["Using the original function instead of the derivative for gradient", "Forgetting to substitute back to find y when given only x"]
      },
      {
        question: "A box with no lid has a square base of side x cm and height h cm. Total surface area = 192 cm². Express h in terms of x and find x for maximum volume.",
        steps: [
          "Surface area: x² + 4xh = 192 → h = (192 − x²)/(4x).",
          "Volume: V = x²h = x²·(192 − x²)/(4x) = x(192 − x²)/4 = 48x − x³/4.",
          "dV/dx = 48 − 3x²/4 = 0 → 3x²/4 = 48 → x² = 64 → x = 8.",
          "Verify: d²V/dx² = −3x/2 < 0 at x = 8 → maximum. ✓"
        ],
        solution: "x = 8 cm for maximum volume",
        commonErrors: ["Not verifying maximum with second derivative or sign test", "Substituting h incorrectly — simplify step by step"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Vind alle stilstandpunte van f(x) = x³ − 3x en klassifiseer.",
        steps: ["f'(x) = 3x² − 3 = 0 → x = ±1.", "f(1)=−2, f(−1)=2.", "f''(x)=6x: maks by (−1,2), min by (1,−2)."],
        solution: "Maks (−1, 2); min (1, −2)",
        commonErrors: ["Net x vind sonder y-waardes", "Klassifikasie omgekeer"]
      },
      {
        question: "Raaklyn aan g(x) = x² + 3x by x = 2.",
        steps: ["g(2)=10; g'(2)=7.", "y − 10 = 7(x − 2) → y = 7x − 4."],
        solution: "y = 7x − 4",
        commonErrors: ["Gebruik g(x) in plaas van g'(x) vir gradiënt"]
      },
      {
        question: "Boks: grondoppervlak x × x, hoogte h, SA = 192 cm². Vind x vir maks volume.",
        steps: ["h = (192−x²)/(4x).", "V = 48x − x³/4.", "dV/dx = 0 → x = 8."],
        solution: "x = 8 cm",
        commonErrors: ["Vergeet om maksimum te verifieer"]
      }
    ],
    diagramsEn: [
      {
        label: "Cubic Graph: f(x) = x³ − 3x",
        ascii: [
          "   f(x)",
          "    |  local max (−1, 2)",
          "  2 *          ",
          "   / \\         ",
          "  /   \\        ",
          "--*-----*------x",
          " −1     1      ",
          "         \\   /",
          "          \\ /  ",
          "          −2 * local min (1, −2)",
          "",
          "  f'(x) = 3x² − 3 = 0  →  x = ±1",
          "  f''(x) = 6x: negative at x=−1 (max), positive at x=1 (min)",
        ].join("\n"),
        caption: "Set f'(x) = 0 to find stationary points. Use f''(x) to classify: f'' < 0 → local max; f'' > 0 → local min.",
      },
      {
        label: "Tangent to a Curve at a Point",
        ascii: [
          "   f(x)",
          "    |        / tangent line",
          "    |       /  y = 7x − 4",
          "    |      * (2, 10) — point of tangency",
          "    |     /",
          "    |  curve",
          "    |",
          "----+-------------------x",
          "",
          "  gradient of tangent = f'(2) = g'(2) = 7",
        ].join("\n"),
        caption: "The tangent at x = a has gradient f'(a). Use point-slope form: y − f(a) = f'(a)(x − a).",
      },
    ],
    diagramsAf: [
      {
        label: "Kubieke Grafiek: f(x) = x³ − 3x",
        ascii: [
          "   f(x)",
          "    |  plaaslike maks (−1, 2)",
          "  2 *          ",
          "   / \\         ",
          "  /   \\        ",
          "--*-----*------x",
          " −1     1      ",
          "         \\   /",
          "          \\ /  ",
          "          −2 * plaaslike min (1, −2)",
          "",
          "  f'(x) = 3x² − 3 = 0  →  x = ±1",
          "  f''(x) = 6x: negatief by x=−1 (maks), positief by x=1 (min)",
        ].join("\n"),
        caption: "Stel f'(x) = 0 om stilstandpunte te vind. Gebruik f''(x) om te klassifiseer: f'' < 0 → maks; f'' > 0 → min.",
      },
      {
        label: "Raaklyn aan 'n Kurwe by 'n Punt",
        ascii: [
          "   f(x)",
          "    |        / raaklyn",
          "    |       /  y = 7x − 4",
          "    |      * (2, 10) — raaklynpunt",
          "    |     /",
          "    |  kurwe",
          "    |",
          "----+-------------------x",
          "",
          "  gradiënt van raaklyn = g'(2) = 7",
        ].join("\n"),
        caption: "Die raaklyn by x = a het gradiënt f'(a). Gebruik punthelling: y − f(a) = f'(a)(x − a).",
      },
    ],
  },
  "MATH-8": {
    summaryEn: "Distance, midpoint, gradient and equations of straight lines and circles in the Cartesian plane.",
    summaryAf: "Afstand, middelpunt, gradiënt en vergelykings van reguitlyne en sirkels in die Cartesiese vlak.",
    conceptsEn: ["d = √[(x₂−x₁)²+(y₂−y₁)²]", "m = (y₂−y₁)/(x₂−x₁)", "Circle: (x−a)²+(y−b)²=r²"],
    conceptsAf: ["d = √[(x₂−x₁)²+(y₂−y₁)²]", "m = (y₂−y₁)/(x₂−x₁)", "Sirkel: (x−a)²+(y−b)²=r²"],
    workedExamplesEn: [
      {
        question: "A(2, −1) and B(6, 7) are given. Find the equation of the perpendicular bisector of AB.",
        steps: [
          "Midpoint M = ((2+6)/2, (−1+7)/2) = (4, 3).",
          "Gradient of AB: m = (7−(−1))/(6−2) = 8/4 = 2.",
          "Perpendicular gradient: m⊥ = −½.",
          "Equation: y − 3 = −½(x − 4) → y = −½x + 5."
        ],
        solution: "y = −½x + 5",
        commonErrors: ["Using the gradient of AB instead of its negative reciprocal", "Finding the midpoint of x-coordinates only and forgetting y"]
      },
      {
        question: "Determine whether the point P(5, 1) lies inside, on, or outside the circle (x−2)² + (y+1)² = 25.",
        steps: [
          "Substitute P into the LHS: (5−2)² + (1+1)² = 9 + 4 = 13.",
          "Compare: 13 < 25, so P lies inside the circle."
        ],
        solution: "P lies inside the circle",
        commonErrors: ["Forgetting to square both differences", "Confusing < with > for inside/outside classification"]
      },
      {
        question: "Find the equation of the tangent to circle x² + y² = 50 at the point T(5, −5).",
        steps: [
          "Centre O = (0, 0). Gradient of OT: m = (−5−0)/(5−0) = −1.",
          "Tangent ⊥ radius: m_tangent = 1.",
          "Tangent through T(5, −5): y + 5 = 1(x − 5) → y = x − 10."
        ],
        solution: "y = x − 10",
        commonErrors: ["Not taking the perpendicular gradient (using gradient of radius as tangent gradient)", "Using the wrong centre if circle is not in standard form — complete the square first"]
      }
    ],
    workedExamplesAf: [
      {
        question: "A(2,−1) en B(6,7). Vind loodregte middelloodlyn van AB.",
        steps: ["M = (4,3); m_AB = 2; m⊥ = −½.", "y − 3 = −½(x−4) → y = −½x + 5."],
        solution: "y = −½x + 5",
        commonErrors: ["Gebruik gradiënt van AB in plaas van −1/m"]
      },
      {
        question: "Lê P(5,1) binne, op of buite (x−2)² + (y+1)² = 25?",
        steps: ["(5−2)² + (1+1)² = 13 < 25 → binne die sirkel."],
        solution: "Binne die sirkel",
        commonErrors: ["Vergeet om beide verskille te kwadreer"]
      },
      {
        question: "Raaklyn aan x² + y² = 50 by T(5,−5).",
        steps: ["m_OT = −1 → m_raaklyn = 1.", "y = x − 10."],
        solution: "y = x − 10",
        commonErrors: ["Gebruik radius-gradiënt as raaklyn-gradiënt"]
      }
    ],
    diagramsEn: [
      {
        label: "Circle with Centre, Radius and Tangent",
        ascii: [
          "         y",
          "         |",
          "     . . + . .       ",
          "   .     |     .     ",
          "  .      |  r   .    ",
          "  .      C------T----x",
          "  .      |      |    ",
          "   .     |    tangent (⊥ radius OT)",
          "     . . + . .       ",
          "         |",
          "",
          "  C = centre (a, b)   r = radius   T = point of tangency",
        ].join("\n"),
        caption: "The tangent at any point T is perpendicular to the radius CT. Use m_CT × m_tangent = −1 to find the tangent equation.",
      },
      {
        label: "Perpendicular Bisector of a Line Segment",
        ascii: [
          "   y",
          "   |             ↑ perp bisector",
          "   |            /",
          "   |      M(4,3)/",
          "   |      *    /",
          "   | A(2,−1) * B(6,7)",
          "   |",
          "---+------------------x",
          "",
          "  M = midpoint of AB",
          "  Slope of AB = 2  →  slope of perp bisector = −½",
        ].join("\n"),
        caption: "Midpoint M lies on the perpendicular bisector. Find M, then use gradient m⊥ = −1/m_AB.",
      },
    ],
    diagramsAf: [
      {
        label: "Sirkel met Middelpunt, Radius en Raaklyn",
        ascii: [
          "         y",
          "         |",
          "     . . + . .       ",
          "   .     |     .     ",
          "  .      |  r   .    ",
          "  .      C------T----x",
          "  .      |      |    ",
          "   .     |    raaklyn (⊥ radius CT)",
          "     . . + . .       ",
          "         |",
          "",
          "  C = middelpunt (a, b)   r = radius   T = raaklynpunt",
        ].join("\n"),
        caption: "Die raaklyn by enige punt T is loodreg op radius CT. Gebruik m_CT × m_raaklyn = −1.",
      },
      {
        label: "Loodregte Middelloodlyn van 'n Lynstuk",
        ascii: [
          "   y",
          "   |             ↑ loodregte middelloodlyn",
          "   |            /",
          "   |      M(4,3)/",
          "   |      *    /",
          "   | A(2,−1) * B(6,7)",
          "   |",
          "---+------------------x",
          "",
          "  M = middelpunt van AB",
          "  Gradiënt AB = 2  →  gradiënt loodlynlyn = −½",
        ].join("\n"),
        caption: "Middelpunt M lê op die loodregte middelloodlyn. Vind M, gebruik dan m⊥ = −1/m_AB.",
      },
    ],
  },
  "MATH-9": {
    summaryEn: "Apply the proportionality, similarity and circle theorems with formal Euclidean proofs.",
    summaryAf: "Pas die eweredigheid, gelyksoortigheid en sirkelstellings toe met formele Euklidiese bewyse.",
    conceptsEn: ["Line || one side divides the other two proportionally", "Equiangular triangles are similar", "Tangent ⊥ radius at point of contact"],
    conceptsAf: ["Lyn || een sy deel die ander twee eweredig", "Gelykhoekige driehoeke is gelyksoortig", "Raaklyn ⊥ radius by raakpunt"],
    workedExamplesEn: [
      {
        question: "In △ABC, D is on AB and E is on AC such that DE ∥ BC. AD = 4 cm, DB = 6 cm, AE = 5 cm. Find EC.",
        steps: [
          "By the Basic Proportionality Theorem (DE ∥ BC): AD/DB = AE/EC.",
          "4/6 = 5/EC.",
          "EC = 5 × 6/4 = 7.5 cm."
        ],
        solution: "EC = 7.5 cm",
        commonErrors: ["Setting up the ratio as AD/AB = AE/AC (also valid but different calculation)", "Inverting the ratio: DB/AD ≠ AE/EC"]
      },
      {
        question: "Two triangles: △PQR and △STU. ∠P = ∠S = 52°, ∠Q = ∠T = 73°. PQ = 6, QR = 9, ST = 4. Find TU.",
        steps: [
          "All three angles are equal (∠R = ∠U = 55° by angle sum), so △PQR ||| △STU.",
          "Corresponding sides are proportional: PQ/ST = QR/TU.",
          "6/4 = 9/TU → TU = 9×4/6 = 6."
        ],
        solution: "TU = 6",
        commonErrors: ["Matching sides without checking which angles correspond first", "Using ratios from non-corresponding pairs of sides"]
      },
      {
        question: "PA is a tangent to a circle at A. PBC is a secant through the circle. PA = 6, PB = 4. Find PC.",
        steps: [
          "Tangent-secant theorem: PA² = PB × PC.",
          "36 = 4 × PC.",
          "PC = 9."
        ],
        solution: "PC = 9",
        commonErrors: ["Writing PA = PB × PC instead of PA² = PB × PC", "Using chord lengths instead of the full external × secant length"]
      }
    ],
    workedExamplesAf: [
      {
        question: "In △ABC, DE ∥ BC. AD=4, DB=6, AE=5. Vind EC.",
        steps: ["AD/DB = AE/EC → 4/6 = 5/EC → EC = 7.5."],
        solution: "EC = 7.5 cm",
        commonErrors: ["Verhouding verkeerd opgestel"]
      },
      {
        question: "△PQR ∼ △STU, PQ=6, QR=9, ST=4. Vind TU.",
        steps: ["PQ/ST = QR/TU → 6/4 = 9/TU → TU = 6."],
        solution: "TU = 6",
        commonErrors: ["Ooreenstemmende sye nie gekontroleer nie"]
      },
      {
        question: "PA raaklyn, PBC sekant. PA=6, PB=4. Vind PC.",
        steps: ["PA² = PB × PC → 36 = 4PC → PC = 9."],
        solution: "PC = 9",
        commonErrors: ["Skryf PA = PB × PC in plaas van PA²"]
      }
    ],
  },
  "MATH-10": {
    summaryEn: "Measures of central tendency and dispersion, regression and correlation, and the normal distribution.",
    summaryAf: "Mate van sentrale neiging en verspreiding, regressie en korrelasie, en die normaalverdeling.",
    conceptsEn: ["σ = √[Σ(xᵢ−x̄)²/n]", "y = a + bx (least-squares regression)", "≈68% within 1 SD of the mean"],
    conceptsAf: ["σ = √[Σ(xᵢ−x̄)²/n]", "y = a + bx (kleinste-kwadrate regressie)", "≈68% binne 1 SA van die gemiddelde"],
    workedExamplesEn: [
      {
        question: "The data set is: 4, 7, 7, 10, 12. Calculate the mean and standard deviation.",
        steps: [
          "Mean x̄ = (4+7+7+10+12)/5 = 40/5 = 8.",
          "Deviations from mean: −4, −1, −1, 2, 4.",
          "Squared deviations: 16, 1, 1, 4, 16. Sum = 38.",
          "σ = √(38/5) = √7.6 ≈ 2.76."
        ],
        solution: "x̄ = 8, σ ≈ 2.76",
        commonErrors: ["Dividing by (n−1) for σ — NSC uses population SD with n", "Forgetting to take the square root at the final step"]
      },
      {
        question: "A data set is normally distributed with mean 60 and standard deviation 8. What percentage of values lie between 52 and 76?",
        steps: [
          "52 = 60 − 8 = μ − 1σ; 76 = 60 + 2σ.",
          "Percentage: 68%/2 (below mean half) + 95%/2 (above mean half)... use the rule: μ ± 1σ covers 68%, μ ± 2σ covers 95%.",
          "Between 52 (μ−1σ) and 68 (μ+1σ): 68%. Between 68 and 76 (μ+2σ): (95−68)/2 = 13.5%.",
          "Total = 68/2 + 68/2 + 13.5% = 34 + 34 + 13.5 = 81.5%."
        ],
        solution: "81.5% of values lie between 52 and 76",
        commonErrors: ["Reading 76 = μ + 2σ as covering 95% completely — 95% covers both sides symmetrically", "Forgetting the distribution is split symmetrically around the mean"]
      },
      {
        question: "Use the regression equation y = 2.3x + 5.1 to predict y when x = 7, and explain what the gradient represents.",
        steps: [
          "Substitute: y = 2.3(7) + 5.1 = 16.1 + 5.1 = 21.2.",
          "The gradient (2.3) means: for every 1 unit increase in x, y increases by 2.3 units."
        ],
        solution: "y = 21.2; gradient means y increases by 2.3 per unit increase in x",
        commonErrors: ["Saying the gradient is the y-intercept", "Using the regression equation outside the range of the data (extrapolation)"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Data: 4,7,7,10,12. Bereken x̄ en σ.",
        steps: ["x̄ = 8.", "Σ(xᵢ−x̄)² = 38.", "σ = √(38/5) ≈ 2.76."],
        solution: "x̄ = 8, σ ≈ 2.76",
        commonErrors: ["Deel deur n−1 eerder as n"]
      },
      {
        question: "Normaalverdeling: μ=60, σ=8. % waardes tussen 52 en 76?",
        steps: ["52 = μ−σ, 76 = μ+2σ.", "68/2 + 13.5 = 81.5%."],
        solution: "81.5%",
        commonErrors: ["Gebruik 95% sonder om simmetrie in ag te neem"]
      },
      {
        question: "y = 2.3x + 5.1. Voorspel y by x = 7; verduidelik die gradiënt.",
        steps: ["y = 2.3(7) + 5.1 = 21.2.", "Gradiënt: y neem met 2.3 toe per eenheid x."],
        solution: "y = 21.2",
        commonErrors: ["Gradiënt verwar met y-afsnit"]
      }
    ],
  },
  "MATH-11": {
    summaryEn: "Counting principles, permutations and combinations, mutually exclusive vs independent events.",
    summaryAf: "Telbeginsels, permutasies en kombinasies, wedersyds uitsluitend vs onafhanklike gebeurtenisse.",
    conceptsEn: ["P(A or B) = P(A)+P(B)−P(A and B)", "n! = n·(n−1)…1", "P(n,r) = n!/(n−r)!"],
    conceptsAf: ["P(A of B) = P(A)+P(B)−P(A en B)", "n! = n·(n−1)…1", "P(n,r) = n!/(n−r)!"],
    workedExamplesEn: [
      {
        question: "How many different 4-digit codes can be formed from the digits 1–9 if repetition is NOT allowed?",
        steps: [
          "First digit: 9 choices, second: 8, third: 7, fourth: 6.",
          "Total = 9 × 8 × 7 × 6 = 3024."
        ],
        solution: "3024 codes",
        commonErrors: ["Using 9⁴ = 6561 (which allows repetition)", "Using P(9,4) = 9!/5! = 3024 — correct, same as above"]
      },
      {
        question: "A committee of 3 is chosen from 7 people. How many ways can this be done?",
        steps: [
          "Order does NOT matter → use combinations: C(7, 3) = 7!/(3! × 4!).",
          "= (7 × 6 × 5)/(3 × 2 × 1) = 210/6 = 35."
        ],
        solution: "35 ways",
        commonErrors: ["Using P(7, 3) = 210 (permutations count order, giving a larger answer)", "Cancelling factorials incorrectly"]
      },
      {
        question: "P(A) = 0.4, P(B) = 0.5, P(A and B) = 0.2. Find P(A or B) and determine if A and B are independent.",
        steps: [
          "P(A or B) = P(A) + P(B) − P(A and B) = 0.4 + 0.5 − 0.2 = 0.7.",
          "Test independence: P(A) × P(B) = 0.4 × 0.5 = 0.2 = P(A and B). ✓",
          "So A and B ARE independent."
        ],
        solution: "P(A or B) = 0.7; A and B are independent",
        commonErrors: ["Confusing mutually exclusive (P(A and B)=0) with independent (P(A)·P(B)=P(A and B))", "Forgetting to subtract P(A and B) in the addition rule"]
      }
    ],
    workedExamplesAf: [
      {
        question: "4-syferkodes uit syfels 1–9 (geen herhaling). Hoeveel kodes?",
        steps: ["9 × 8 × 7 × 6 = 3024."],
        solution: "3024",
        commonErrors: ["Gebruik 9⁴ wat herhaling toelaat"]
      },
      {
        question: "Komitee van 3 uit 7 persone. Hoeveel maniere?",
        steps: ["C(7,3) = 35."],
        solution: "35",
        commonErrors: ["Gebruik permutasies P(7,3) = 210"]
      },
      {
        question: "P(A)=0.4, P(B)=0.5, P(A en B)=0.2. Vind P(A of B) en toets onafhanklikheid.",
        steps: ["P(A of B) = 0.7.", "P(A)·P(B) = 0.2 = P(A en B) → onafhanklik. ✓"],
        solution: "P(A of B) = 0.7; onafhanklik",
        commonErrors: ["Verwar wedersyds uitsluitend met onafhanklik"]
      }
    ],
  },

  // --------------------- PHYSICAL SCIENCES ---------------------
  "PHYS-1": {
    summaryEn: "Momentum p = mv, impulse Δp = FₙₑₜΔt, and conservation of momentum in collisions.",
    summaryAf: "Momentum p = mv, impuls Δp = FₙₑₜΔt, en behoud van momentum in botsings.",
    conceptsEn: ["p = mv (kg·m/s)", "Impulse = change in momentum", "Σpᵢ = Σpf in isolated systems"],
    conceptsAf: ["p = mv (kg·m/s)", "Impuls = verandering in momentum", "Σpᵢ = Σpf in geïsoleerde stelsels"],
    workedExamplesEn: [
      {
        question: "A 1 500 kg car travelling at 20 m·s⁻¹ east collides with a stationary 1 000 kg car. They stick together. Find their common velocity after the collision.",
        steps: [
          "Define east as positive. Before: p_total = 1500(20) + 1000(0) = 30 000 kg·m·s⁻¹.",
          "After: total mass = 2500 kg; p_total = 2500·vf.",
          "By conservation of momentum: 30 000 = 2500·vf → vf = 12 m·s⁻¹ east."
        ],
        solution: "vf = 12 m·s⁻¹ east",
        commonErrors: ["Forgetting to state a sign convention (direction)", "Using only one car's momentum before the collision"]
      },
      {
        question: "A 0.15 kg ball hits a wall at 10 m·s⁻¹ and bounces back at 8 m·s⁻¹. The collision lasts 0.05 s. Find the average net force on the ball.",
        steps: [
          "Take towards wall as positive. Δp = m·vf − m·vi = 0.15(−8) − 0.15(10) = −1.2 − 1.5 = −2.7 kg·m·s⁻¹.",
          "Fnet = Δp/Δt = −2.7/0.05 = −54 N.",
          "The force is 54 N away from the wall (negative direction)."
        ],
        solution: "Fnet = 54 N away from wall",
        commonErrors: ["Not reversing the sign of velocity after bounce", "Dividing Δp = m·Δv incorrectly — use vf − vi not vi − vf"]
      },
      {
        question: "Trolley A (2 kg, 4 m·s⁻¹ east) collides elastically with trolley B (2 kg, at rest). What are their velocities after the collision?",
        steps: [
          "For equal masses in a perfectly elastic collision, the velocities exchange.",
          "Conservation of momentum: 2(4) + 0 = 2·vA + 2·vB → vA + vB = 4.",
          "Elastic: kinetic energy conserved; for equal masses vA = 0 and vB = 4 m·s⁻¹ east."
        ],
        solution: "vA = 0 m·s⁻¹; vB = 4 m·s⁻¹ east",
        commonErrors: ["Assuming both objects move at 2 m·s⁻¹ (that's for perfectly inelastic)", "Not checking if KE is conserved to confirm elastic collision"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Motor A (1500 kg, 20 m·s⁻¹ oos) bots met stilstaande Motor B (1000 kg). Saam. Vf?",
        steps: ["30 000 = 2500·vf → vf = 12 m·s⁻¹ oos."],
        solution: "vf = 12 m·s⁻¹ oos",
        commonErrors: ["Vergeet tekenkonvensie (rigting)"]
      },
      {
        question: "Bal (0.15 kg) tref muur teen 10 m·s⁻¹, bons terug teen 8 m·s⁻¹. Kontaktyd 0.05 s. Fnet?",
        steps: ["Δp = 0.15(−8 − 10) = −2.7 kg·m·s⁻¹.", "Fnet = −2.7/0.05 = 54 N van muur af."],
        solution: "54 N van muur af",
        commonErrors: ["Vergeet om teken om te keer na terugpons"]
      },
      {
        question: "Twee gelyke trollies (2 kg elk), A teen 4 m·s⁻¹, B stilstaand. Elastiese botsing. Vf?",
        steps: ["Gelyke massas ruil snelhede: vA = 0, vB = 4 m·s⁻¹."],
        solution: "vA = 0; vB = 4 m·s⁻¹",
        commonErrors: ["Aanvaar albei beweeg teen 2 m·s⁻¹ (slegs vir perfek ineelasties)"]
      }
    ],
    diagramsEn: [
      {
        label: "Before and After a Perfectly Inelastic Collision",
        ascii: [
          "  BEFORE:",
          "  [A: 1500 kg] →20 m/s     [B: 1000 kg] stationary",
          "  ●●●●●●●●●●●●              ○○○○○○○○○○",
          "",
          "  AFTER (stick together):",
          "  [A+B: 2500 kg] →12 m/s",
          "  ●●●●●●●●●●●●○○○○○○○○○○",
          "",
          "  Σp before = 1500×20 + 0 = 30 000 kg·m·s⁻¹",
          "  Σp after  = 2500×vf  = 30 000  →  vf = 12 m·s⁻¹",
        ].join("\n"),
        caption: "Momentum is conserved in all collisions. Take a clear sign convention (e.g. east = positive) before calculating.",
      },
      {
        label: "Impulse–Momentum: Ball Bouncing off a Wall",
        ascii: [
          "          wall",
          "  →10 m/s  |  ←8 m/s",
          "  [ball]──►| ◄──[ball]",
          "           |",
          "",
          "  Δp = m(vf − vi) = 0.15(−8 − 10) = −2.7 kg·m·s⁻¹",
          "  Fnet = Δp / Δt = −2.7 / 0.05 = 54 N (away from wall)",
        ].join("\n"),
        caption: "Velocity reverses sign after the bounce. Always use vf − vi (not vi − vf) when applying impulse = Δp.",
      },
    ],
    diagramsAf: [
      {
        label: "Voor en Na 'n Perfek Ineelastiese Botsing",
        ascii: [
          "  VOOR:",
          "  [A: 1500 kg] →20 m/s     [B: 1000 kg] stilstaand",
          "  ●●●●●●●●●●●●              ○○○○○○○○○○",
          "",
          "  NA (saamgekoek):",
          "  [A+B: 2500 kg] →12 m/s",
          "  ●●●●●●●●●●●●○○○○○○○○○○",
          "",
          "  Σp voor  = 1500×20 + 0 = 30 000 kg·m·s⁻¹",
          "  Σp daarna = 2500×vf  = 30 000  →  vf = 12 m·s⁻¹",
        ].join("\n"),
        caption: "Momentum word in alle botsings bewaar. Kies 'n tekenkonvensie (bv. oos = positief) voor berekeninge.",
      },
      {
        label: "Impuls–Momentum: Bal Bons teen Muur",
        ascii: [
          "          muur",
          "  →10 m/s  |  ←8 m/s",
          "  [bal]──►| ◄──[bal]",
          "           |",
          "",
          "  Δp = 0.15(−8 − 10) = −2.7 kg·m·s⁻¹",
          "  Fnet = −2.7 / 0.05 = 54 N (van muur af)",
        ].join("\n"),
        caption: "Snelheid keer teken om na terugpons. Gebruik altyd vf − vi (nie vi − vf) vir impuls = Δp.",
      },
    ],
  },
  "PHYS-2": {
    summaryEn: "Vertical motion under gravity using v = u + gt, Δy = ut + ½gt², v² = u² + 2gΔy with g = 9.8 m·s⁻² downwards.",
    summaryAf: "Vertikale beweging onder swaartekrag met v = u + gt, Δy = ut + ½gt², v² = u² + 2gΔy met g = 9,8 m·s⁻² afwaarts.",
    conceptsEn: ["At max height v=0, a=g", "Sign convention: choose down or up positive consistently", "Symmetry: time up = time down (same level)"],
    conceptsAf: ["By maks hoogte v=0, a=g", "Tekenkonvensie: kies konsekwent op of af positief", "Simmetrie: tyd op = tyd af (selfde vlak)"],
    workedExamplesEn: [
      {
        question: "A ball is thrown upward at 15 m·s⁻¹ from the ground. (Take upward as positive, g = 9.8 m·s⁻²). Find the maximum height.",
        steps: [
          "At maximum height, v = 0.",
          "Use v² = u² + 2aΔy: 0 = (15)² + 2(−9.8)Δy.",
          "Δy = 225/19.6 ≈ 11.48 m."
        ],
        solution: "Maximum height ≈ 11.48 m",
        commonErrors: ["Using g = +9.8 when upward is positive — must be −9.8", "Using v = 15 instead of v = 0 at maximum height"]
      },
      {
        question: "A stone is dropped from a bridge 45 m above the water. How long does it take to reach the water? (g = 9.8 m·s⁻², downward positive)",
        steps: [
          "u = 0 (dropped), Δy = 45 m (downward = positive).",
          "Δy = ut + ½gt²: 45 = 0 + ½(9.8)t².",
          "t² = 45/4.9 ≈ 9.18 → t ≈ 3.03 s."
        ],
        solution: "t ≈ 3.03 s",
        commonErrors: ["Using Δy = −45 when downward is already defined as positive", "Forgetting u = 0 for a dropped object"]
      },
      {
        question: "A ball is projected upward at 20 m·s⁻¹. How long is it in the air before it returns to the same level?",
        steps: [
          "The time to maximum height: v = u + at → 0 = 20 − 9.8t → t = 20/9.8 ≈ 2.04 s.",
          "By symmetry, the total time in the air = 2 × 2.04 ≈ 4.08 s."
        ],
        solution: "Total time ≈ 4.08 s",
        commonErrors: ["Only finding the time to peak and forgetting to double it", "Not recognising the symmetry of vertical projectile motion"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bal opgooi teen 15 m·s⁻¹. (Op positief, g = 9.8 m·s⁻²). Maks hoogte?",
        steps: ["v=0 by top: 0 = 225 − 19.6Δy → Δy ≈ 11.48 m."],
        solution: "≈ 11.48 m",
        commonErrors: ["g = +9.8 wanneer op positief gedefinieer is"]
      },
      {
        question: "Klip val 45 m. Hoe lank? (Af positief, g = 9.8)",
        steps: ["45 = ½(9.8)t² → t ≈ 3.03 s."],
        solution: "t ≈ 3.03 s",
        commonErrors: ["Gebruik u ≠ 0 vir geval voorwerp"]
      },
      {
        question: "Bal opgooi teen 20 m·s⁻¹. Totale tyd in lug?",
        steps: ["t_top = 20/9.8 ≈ 2.04 s; totaal = 4.08 s."],
        solution: "≈ 4.08 s",
        commonErrors: ["Vergeet om te verdubbel vir totale tyd"]
      }
    ],
  },
  "PHYS-3": {
    summaryEn: "Functional groups, IUPAC naming, structural isomerism and reactions of alcohols, haloalkanes, alkenes and carboxylic acids.",
    summaryAf: "Funksionele groepe, IUPAC-benaming, struktuurisomerie en reaksies van alkohole, haloalkane, alkene en karboksielsure.",
    conceptsEn: ["Esterification: RCOOH + R′OH → RCOOR′ + H₂O", "Boiling point ↑ with chain length and stronger IMFs", "Substitution vs addition vs elimination reactions"],
    conceptsAf: ["Esterifikasie: RCOOH + R′OH → RCOOR′ + H₂O", "Kookpunt ↑ met kettinglengte en sterker IMFs", "Substitusie vs addisie vs eliminasiereaksies"],
    workedExamplesEn: [
      {
        question: "Name the compound: CH₃–CH(OH)–CH₂–CH₃.",
        steps: [
          "Longest chain through –OH carbon: 4 carbons → butanol (butan-_-ol).",
          "Locate –OH group: on C2 counting from the end nearest to –OH.",
          "Name: butan-2-ol."
        ],
        solution: "butan-2-ol",
        commonErrors: ["Numbering from the wrong end — always number to give the functional group the lowest locant", "Calling it 3-butanol instead of butan-2-ol (IUPAC prefers the lower number)"]
      },
      {
        question: "Write the equation for the esterification of ethanoic acid with methanol. Name the ester formed.",
        steps: [
          "Reaction: CH₃COOH + CH₃OH ⇌ CH₃COOCH₃ + H₂O (concentrated H₂SO₄ catalyst, heat).",
          "Ester name: ethanoic acid + methanol → methyl ethanoate (alcohol name comes first for the ester)."
        ],
        solution: "CH₃COOH + CH₃OH ⇌ CH₃COOCH₃ + H₂O; methyl ethanoate",
        commonErrors: ["Writing the ester as ethyl methanoate (reversed naming)", "Using → instead of ⇌ — esterification is reversible"]
      },
      {
        question: "Arrange in order of increasing boiling point: pentane (C₅H₁₂), pentan-1-ol (C₅H₁₁OH), pentanal (C₅H₁₀O). Explain.",
        steps: [
          "Pentane: only London (dispersion) forces — lowest boiling point.",
          "Pentanal (aldehyde): dipole–dipole interactions (C=O) but no H-bonding — intermediate.",
          "Pentan-1-ol: strong hydrogen bonding (O–H) — highest boiling point.",
          "Order: pentane < pentanal < pentan-1-ol."
        ],
        solution: "pentane < pentanal < pentan-1-ol",
        commonErrors: ["Ignoring intermolecular forces and using only molecular mass", "Confusing H-bonding with hydrogen gas — H-bonding is an IMF involving N, O, or F"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Benoem: CH₃–CH(OH)–CH₂–CH₃.",
        steps: ["4 koolstowwe: butanol.", "–OH op C2 → butaan-2-ol."],
        solution: "butaan-2-ol",
        commonErrors: ["Nommering van verkeerde kant — laagste lokantnommer vir funksioneelgroep"]
      },
      {
        question: "Esterifikasie van etaansuur met metanol. Ester-naam?",
        steps: ["CH₃COOH + CH₃OH ⇌ CH₃COOCH₃ + H₂O.", "Ester: metiel etanoaat."],
        solution: "metiel etanoaat",
        commonErrors: ["Naamorde omgekeer: alkohol eerste in esternaam"]
      },
      {
        question: "Rangskik in stygende kookpunt: pentaan, pentaan-1-ol, pentanaal.",
        steps: ["Pentaan (London) < pentanaal (dipool) < pentaan-1-ol (H-binding)."],
        solution: "pentaan < pentanaal < pentaan-1-ol",
        commonErrors: ["Ignoreer IMFs en gebruik slegs molêre massa"]
      }
    ],
  },
  "PHYS-4": {
    summaryEn: "Work–energy theorem, conservation of mechanical energy, and power as the rate of doing work.",
    summaryAf: "Arbeid–energie stelling, behoud van meganiese energie, en drywing as die tempo van arbeid verrig.",
    conceptsEn: ["W = FΔx·cosθ", "Wnet = ΔEk", "P = W/Δt; also P = Fv"],
    conceptsAf: ["W = FΔx·cosθ", "Wnet = ΔEk", "P = W/Δt; ook P = Fv"],
    workedExamplesEn: [
      {
        question: "A 5 kg block is pulled 8 m along a frictionless surface by a 20 N force at 30° to the horizontal. Calculate the work done by this force.",
        steps: [
          "W = FΔx·cosθ = 20 × 8 × cos30°.",
          "cos30° = √3/2 ≈ 0.866.",
          "W = 160 × 0.866 ≈ 138.6 J."
        ],
        solution: "W ≈ 138.6 J",
        commonErrors: ["Using sinθ instead of cosθ — always use the angle between F and displacement", "Forgetting cos when the force is at an angle (cos0° = 1 for horizontal force)"]
      },
      {
        question: "A 2 kg ball rolls off a 5 m high table (no friction). Find its speed at the bottom.",
        steps: [
          "Use conservation of mechanical energy: Ep(top) + Ek(top) = Ep(bottom) + Ek(bottom).",
          "mgh + 0 = 0 + ½mv² (taking bottom as reference level).",
          "v² = 2gh = 2(9.8)(5) = 98 → v = √98 ≈ 9.9 m·s⁻¹."
        ],
        solution: "v ≈ 9.9 m·s⁻¹",
        commonErrors: ["Including mass in v = √(2gh) — mass cancels!", "Using g = 10 unless the question specifies it"]
      },
      {
        question: "A motor lifts a 300 kg load 12 m in 20 s. Calculate the minimum power of the motor.",
        steps: [
          "Work done = mgh = 300 × 9.8 × 12 = 35 280 J.",
          "P = W/Δt = 35 280/20 = 1764 W."
        ],
        solution: "P = 1764 W",
        commonErrors: ["Using P = Fv without knowing v — rather use P = W/Δt here", "Forgetting to include g when calculating weight (using 300 J instead of mg·h)"]
      }
    ],
    workedExamplesAf: [
      {
        question: "5 kg blok getrek 8 m deur 20 N (30° met horisontaal, geen wrywing). Arbeid?",
        steps: ["W = 20 × 8 × cos30° ≈ 138.6 J."],
        solution: "W ≈ 138.6 J",
        commonErrors: ["Gebruik sinθ instede van cosθ"]
      },
      {
        question: "2 kg bal val van 5 m hoë tafel. Spoed onderaan?",
        steps: ["v = √(2gh) = √98 ≈ 9.9 m·s⁻¹."],
        solution: "v ≈ 9.9 m·s⁻¹",
        commonErrors: ["Massa nie uit kansellering gesit nie"]
      },
      {
        question: "Motor lig 300 kg last 12 m in 20 s. Min drywing?",
        steps: ["W = 300×9.8×12 = 35 280 J.", "P = 35280/20 = 1764 W."],
        solution: "1764 W",
        commonErrors: ["Vergeet g in gewig-berekening"]
      }
    ],
  },
  "PHYS-5": {
    summaryEn: "Apparent change in observed frequency due to relative motion of source/observer; applied to sound and light (red shift).",
    summaryAf: "Skynbare verandering in waargenome frekwensie weens relatiewe beweging; toegepas op klank en lig (rooi-verskuiwing).",
    conceptsEn: ["fL = fS·v/(v ± vS)", "Approaching → higher pitch", "Red shift → universe expanding"],
    conceptsAf: ["fL = fS·v/(v ± vS)", "Nader → hoër toonhoogte", "Rooi-verskuiwing → uitdyende heelal"],
    workedExamplesEn: [
      {
        question: "An ambulance moving at 25 m·s⁻¹ towards a stationary observer sounds a siren at 600 Hz. What frequency does the observer hear? (v_sound = 340 m·s⁻¹)",
        steps: [
          "Source approaches → use: fL = fS × v/(v − vS).",
          "fL = 600 × 340/(340 − 25) = 600 × 340/315 ≈ 647.6 Hz."
        ],
        solution: "fL ≈ 647.6 Hz (higher than source frequency)",
        commonErrors: ["Using (v + vS) when approaching — it should be (v − vS)", "Confusing which entity is the source and which is the observer"]
      },
      {
        question: "The same ambulance is now moving away. What frequency does the observer hear?",
        steps: [
          "Source moves away → use: fL = fS × v/(v + vS).",
          "fL = 600 × 340/(340 + 25) = 600 × 340/365 ≈ 558.9 Hz."
        ],
        solution: "fL ≈ 558.9 Hz (lower than source frequency)",
        commonErrors: ["Using (v − vS) when moving away — must use (v + vS)", "Expecting a higher pitch when the source moves away"]
      },
      {
        question: "A star's hydrogen spectral line is observed at 486.2 nm, but in the lab it is 486.1 nm. Is the star moving towards or away from Earth? Explain.",
        steps: [
          "Observed wavelength > laboratory wavelength → red shift.",
          "Red shift means the observed frequency is lower.",
          "Lower frequency → source moving AWAY from observer.",
          "The star is moving away from Earth."
        ],
        solution: "The star is moving away from Earth (red shift observed)",
        commonErrors: ["Confusing red shift (longer λ) with blue shift (shorter λ)", "Saying the star is approaching because the wavelength is 'larger'"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Ambulans beweeg nader teen 25 m·s⁻¹, sirene 600 Hz. Waarnemer hoor?",
        steps: ["fL = 600 × 340/315 ≈ 647.6 Hz."],
        solution: "≈ 647.6 Hz",
        commonErrors: ["Gebruik (v+vS) vir naderkomende bron"]
      },
      {
        question: "Dieselfde ambulans beweeg weg. Waarnemer hoor?",
        steps: ["fL = 600 × 340/365 ≈ 558.9 Hz."],
        solution: "≈ 558.9 Hz",
        commonErrors: ["Gebruik (v−vS) vir wegbewegende bron"]
      },
      {
        question: "Ster se H-lyn: 486.2 nm (lab: 486.1 nm). Beweeg ster nader of weg?",
        steps: ["Waargenome λ > lab λ → rooiverskuiwing → ster beweeg weg."],
        solution: "Ster beweeg weg",
        commonErrors: ["Verwar rooiverskuiwing (langer λ) met blouverskuiwing"]
      }
    ],
  },
  "PHYS-6": {
    summaryEn: "Ohm's law, series & parallel resistor combinations, EMF and internal resistance, and power dissipation.",
    summaryAf: "Ohm se wet, serie en parallel weerstandkombinasies, EMK en interne weerstand, en kragdissipasie.",
    conceptsEn: ["V = IR", "Series: Rₜ = ΣR; Parallel: 1/Rₜ = Σ(1/R)", "ε = IR + Ir"],
    conceptsAf: ["V = IR", "Serie: Rₜ = ΣR; Parallel: 1/Rₜ = Σ(1/R)", "ε = IR + Ir"],
    workedExamplesEn: [
      {
        question: "Three resistors 4 Ω, 6 Ω, and 12 Ω are connected in parallel. Find the equivalent resistance.",
        steps: [
          "1/Rₜ = 1/4 + 1/6 + 1/12 = 3/12 + 2/12 + 1/12 = 6/12 = 1/2.",
          "Rₜ = 2 Ω."
        ],
        solution: "Rₜ = 2 Ω",
        commonErrors: ["Adding resistors directly (gives 22 Ω — only valid for series)", "Forgetting to take the reciprocal at the end: answer is 1/Rₜ not Rₜ"]
      },
      {
        question: "A battery has EMF 12 V and internal resistance 0.5 Ω. It drives a current of 4 A through an external circuit. Find the terminal voltage.",
        steps: [
          "Terminal voltage V_terminal = ε − Ir.",
          "V = 12 − 4(0.5) = 12 − 2 = 10 V."
        ],
        solution: "Terminal voltage = 10 V",
        commonErrors: ["Using V = ε (ignoring internal resistance drop)", "Using V = ε + Ir (V terminal is always less than EMF when current flows)"]
      },
      {
        question: "A 60 W bulb operates at 220 V. Find the resistance of the bulb and the current through it.",
        steps: [
          "P = V²/R → R = V²/P = (220)²/60 = 48 400/60 ≈ 806.7 Ω.",
          "I = P/V = 60/220 ≈ 0.27 A (or I = V/R = 220/806.7 ≈ 0.27 A)."
        ],
        solution: "R ≈ 806.7 Ω; I ≈ 0.27 A",
        commonErrors: ["Using P = IV without knowing I or V first — rearrange using what you know", "Squaring current instead of voltage: P = I²R not P = V²R"]
      }
    ],
    workedExamplesAf: [
      {
        question: "4 Ω, 6 Ω, 12 Ω parallel. Ekwivalente weerstand?",
        steps: ["1/Rₜ = 3/12+2/12+1/12 = 1/2 → Rₜ = 2 Ω."],
        solution: "2 Ω",
        commonErrors: ["Tel weerstand direk op soos vir serie"]
      },
      {
        question: "Battery: EMK 12 V, r = 0.5 Ω, I = 4 A. Klemspanning?",
        steps: ["V = 12 − 4(0.5) = 10 V."],
        solution: "10 V",
        commonErrors: ["Ignoreer interne weerstand: V ≠ ε"]
      },
      {
        question: "60 W gloeilamp by 220 V. Weerstand en stroom?",
        steps: ["R = 220²/60 ≈ 806.7 Ω.", "I = 60/220 ≈ 0.27 A."],
        solution: "R ≈ 806.7 Ω; I ≈ 0.27 A",
        commonErrors: ["Gebruik P = I²R sonder om I eers te bereken"]
      }
    ],
    diagramsEn: [
      {
        label: "Series Circuit",
        ascii: [
          "  +------R1------R2------R3------+",
          "  |    (4 Ω)   (6 Ω)  (12 Ω)   |",
          " [V]                            |",
          "  |                             |",
          "  +--------------------------------+",
          "",
          "  Rₜ = 4 + 6 + 12 = 22 Ω",
          "  Same current I flows through every component.",
        ].join("\n"),
        caption: "In a series circuit total resistance is the sum of all resistors. One path only — if one component fails, the circuit breaks.",
      },
      {
        label: "Parallel Circuit",
        ascii: [
          "  +----+----------+----------+----------+",
          "  |    |          |          |          |",
          " [V]  R1(4Ω)    R2(6Ω)    R3(12Ω)    |",
          "  |    |          |          |          |",
          "  +----+----------+----------+----------+",
          "",
          "  1/Rₜ = 1/4 + 1/6 + 1/12 = 1/2  →  Rₜ = 2 Ω",
          "  Same voltage across each branch.",
        ].join("\n"),
        caption: "In a parallel circuit the reciprocal of total resistance equals the sum of reciprocals. Rₜ is always less than the smallest branch.",
      },
      {
        label: "Battery with Internal Resistance",
        ascii: [
          "   ε (EMF)",
          "  +--[r]--+--[R_ext]--+",
          "  |internal|           |",
          "  +--------+-----------+",
          "",
          "  V_terminal = ε − Ir",
          "  When I = 0 (open circuit): V_terminal = ε",
          "  When I flows: V_terminal < ε  (voltage drop across r)",
        ].join("\n"),
        caption: "The terminal voltage is always less than EMF when current flows, due to the internal resistance voltage drop (Ir).",
      },
    ],
    diagramsAf: [
      {
        label: "Seriekring",
        ascii: [
          "  +------R1------R2------R3------+",
          "  |    (4 Ω)   (6 Ω)  (12 Ω)   |",
          " [V]                            |",
          "  |                             |",
          "  +--------------------------------+",
          "",
          "  Rₜ = 4 + 6 + 12 = 22 Ω",
          "  Dieselfde stroom I vloei deur elke komponent.",
        ].join("\n"),
        caption: "In 'n seriekring is die totale weerstand die som van alle weerstande. Een pad — as een komponent misluk, breek die kring.",
      },
      {
        label: "Parallelkring",
        ascii: [
          "  +----+----------+----------+----------+",
          "  |    |          |          |          |",
          " [V]  R1(4Ω)    R2(6Ω)    R3(12Ω)    |",
          "  |    |          |          |          |",
          "  +----+----------+----------+----------+",
          "",
          "  1/Rₜ = 1/4 + 1/6 + 1/12 = 1/2  →  Rₜ = 2 Ω",
          "  Dieselfde spanning oor elke tak.",
        ].join("\n"),
        caption: "In 'n parallelkring is Rₜ altyd kleiner as die kleinste tak. Gebruik die resiproke-sommetode.",
      },
      {
        label: "Battery met Interne Weerstand",
        ascii: [
          "   ε (EMK)",
          "  +--[r]--+--[R_ekst]--+",
          "  |intern  |            |",
          "  +--------+------------+",
          "",
          "  V_klem = ε − Ir",
          "  Oop kring (I = 0): V_klem = ε",
          "  Stroom vloei: V_klem < ε  (spanning oor r)",
        ].join("\n"),
        caption: "Klemspanning is altyd kleiner as EMK wanneer stroom vloei, a.g.v. die interne spanningsval (Ir).",
      },
    ],
  },
  "PHYS-7": {
    summaryEn: "Faraday's law, AC vs DC generators, transformers and the use of RMS values.",
    summaryAf: "Faraday se wet, WS vs GS opwekkers, transformators en die gebruik van RMS-waardes.",
    conceptsEn: ["ε = −N·ΔΦ/Δt", "AC = slip rings; DC = split-ring commutator", "Vrms = Vmax/√2"],
    conceptsAf: ["ε = −N·ΔΦ/Δt", "WS = sleepringe; GS = gespletene-ring kommutator", "Vrms = Vmax/√2"],
    workedExamplesEn: [
      {
        question: "A coil of 200 turns experiences a change in flux of 0.05 Wb in 0.02 s. Calculate the induced EMF.",
        steps: [
          "ε = −N·ΔΦ/Δt (magnitude: ignore the negative sign for calculation).",
          "ε = 200 × 0.05/0.02 = 200 × 2.5 = 500 V."
        ],
        solution: "ε = 500 V",
        commonErrors: ["Forgetting to multiply by N (number of turns)", "Using ΔΦ/Δt = 0.05/0.02 without noting units"]
      },
      {
        question: "A transformer has 500 primary turns and 2 000 secondary turns. The primary voltage is 240 V. Find the secondary voltage and state whether it is a step-up or step-down transformer.",
        steps: [
          "Vs/Vp = Ns/Np → Vs = Vp × Ns/Np = 240 × 2000/500 = 960 V.",
          "Ns > Np and Vs > Vp → step-up transformer."
        ],
        solution: "Vs = 960 V; step-up transformer",
        commonErrors: ["Inverting the ratio: Vp/Vs = Np/Ns instead of Vs/Vp = Ns/Np", "Saying step-down because more turns means lower current (confusing current and voltage)"]
      },
      {
        question: "An AC generator produces a peak voltage of 311 V. Calculate the RMS voltage and the average power delivered to a 100 Ω resistor.",
        steps: [
          "Vrms = Vmax/√2 = 311/√2 ≈ 220 V.",
          "P = Vrms²/R = (220)²/100 = 48 400/100 = 484 W."
        ],
        solution: "Vrms ≈ 220 V; P = 484 W",
        commonErrors: ["Using Vmax in power calculations instead of Vrms", "Confusing Vrms = Vmax/2 (wrong) with Vrms = Vmax/√2"]
      }
    ],
    workedExamplesAf: [
      {
        question: "200 wikkelinge, ΔΦ = 0.05 Wb in 0.02 s. Geïnduseerde EMK?",
        steps: ["ε = 200 × 0.05/0.02 = 500 V."],
        solution: "500 V",
        commonErrors: ["Vergeet om met N te vermenigvuldig"]
      },
      {
        question: "Transformator: Np=500, Ns=2000, Vp=240 V. Vs?",
        steps: ["Vs = 240 × 2000/500 = 960 V (opstap)."],
        solution: "960 V; opstaptransformator",
        commonErrors: ["Verhouding omgekeer"]
      },
      {
        question: "Opwekker: Vmax = 311 V. Vrms en drywing by 100 Ω?",
        steps: ["Vrms = 311/√2 ≈ 220 V.", "P = 220²/100 = 484 W."],
        solution: "Vrms ≈ 220 V; P = 484 W",
        commonErrors: ["Gebruik Vmax in drywingsformule"]
      }
    ],
  },
  "PHYS-8": {
    summaryEn: "Photoelectric effect, work function, and the dual particle/wave nature of light.",
    summaryAf: "Foto-elektriese effek, werkfunksie, en die duale partikel/golf aard van lig.",
    conceptsEn: ["E = hf", "hf = W₀ + ½mv²(max)", "Threshold frequency f₀ depends on metal"],
    conceptsAf: ["E = hf", "hf = W₀ + ½mv²(maks)", "Drempelfrekwensie f₀ hang van metaal af"],
    workedExamplesEn: [
      {
        question: "Light of frequency 8.0 × 10¹⁴ Hz strikes a metal surface with work function 2.5 × 10⁻¹⁹ J. Find the maximum kinetic energy of the emitted photoelectrons. (h = 6.63 × 10⁻³⁴ J·s)",
        steps: [
          "Energy of photon: E = hf = 6.63 × 10⁻³⁴ × 8.0 × 10¹⁴ = 5.304 × 10⁻¹⁹ J.",
          "Apply photoelectric equation: Ek(max) = hf − W₀.",
          "Ek(max) = 5.304 × 10⁻¹⁹ − 2.5 × 10⁻¹⁹ = 2.804 × 10⁻¹⁹ J ≈ 2.80 × 10⁻¹⁹ J."
        ],
        solution: "Ek(max) ≈ 2.80 × 10⁻¹⁹ J",
        commonErrors: ["Using E = hλ instead of E = hf — check units", "Subtracting the wrong way: Ek = W₀ − hf gives a negative (impossible) value"]
      },
      {
        question: "The threshold frequency of a metal is 5.5 × 10¹⁴ Hz. Calculate the work function in joules and in eV. (h = 6.63 × 10⁻³⁴ J·s; 1 eV = 1.6 × 10⁻¹⁹ J)",
        steps: [
          "At threshold: Ek = 0, so hf₀ = W₀.",
          "W₀ = 6.63 × 10⁻³⁴ × 5.5 × 10¹⁴ = 3.647 × 10⁻¹⁹ J.",
          "In eV: W₀ = 3.647 × 10⁻¹⁹ / 1.6 × 10⁻¹⁹ ≈ 2.28 eV."
        ],
        solution: "W₀ ≈ 3.65 × 10⁻¹⁹ J ≈ 2.28 eV",
        commonErrors: ["Using frequency below f₀ expecting emission — below threshold NO electrons are emitted", "Multiplying by 1.6 × 10⁻¹⁹ to convert to eV instead of dividing"]
      },
      {
        question: "Why does increasing the intensity of light below the threshold frequency NOT cause photoelectric emission?",
        steps: [
          "Each photon carries energy E = hf.",
          "Below threshold: even at high intensity each individual photon has E < W₀.",
          "A single photon must supply enough energy to eject ONE electron — multiple photons cannot combine their energies.",
          "Therefore, no emission occurs regardless of intensity."
        ],
        solution: "No emission: each photon's energy is below the work function. Intensity adds more photons but does not increase individual photon energy.",
        commonErrors: ["Saying intensity increases photon energy — intensity only increases the NUMBER of photons", "Confusing wave model (cumulative energy) with particle (quantum) model"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Lig f = 8.0×10¹⁴ Hz, W₀ = 2.5×10⁻¹⁹ J. Ek(maks)?",
        steps: ["E = hf = 5.304×10⁻¹⁹ J.", "Ek = 5.304×10⁻¹⁹ − 2.5×10⁻¹⁹ = 2.80×10⁻¹⁹ J."],
        solution: "2.80×10⁻¹⁹ J",
        commonErrors: ["Gebruik E = hλ eerder as E = hf"]
      },
      {
        question: "Drempelfrekwensie f₀ = 5.5×10¹⁴ Hz. Werkfunksie?",
        steps: ["W₀ = hf₀ = 3.65×10⁻¹⁹ J ≈ 2.28 eV."],
        solution: "3.65×10⁻¹⁹ J / 2.28 eV",
        commonErrors: ["Vermenigvuldig eerder as deel deur 1.6×10⁻¹⁹ om na eV om te skakel"]
      },
      {
        question: "Hoekom veroorsaak intensiteitsverhoging onder drempelfrekwensie geen emissie?",
        steps: ["Elke foton het E = hf < W₀.", "Fotone kan nie energie kombineer nie.", "Geen emissie moontlik nie."],
        solution: "Elke foton se energie is minder as werkfunksie — intensiteit verhoog slegs fotontal, nie energie per foton nie",
        commonErrors: ["Sê intensiteit verhoog fotonenergie"]
      }
    ],
  },
  "PHYS-9": {
    summaryEn: "Galvanic vs electrolytic cells, half-reactions, EMF calculations and standard reduction potentials.",
    summaryAf: "Galvaniese vs elektrolitiese selle, halfreaksies, EMK-berekenings en standaard reduksie potensiale.",
    conceptsEn: ["AN-OX, RED-CAT (anode oxidises, cathode reduces)", "E°cell = E°cathode − E°anode", "Galvanic spontaneous; electrolytic forced"],
    conceptsAf: ["AN-OX, RED-KAT (anode oksideer, katode reduseer)", "E°sel = E°katode − E°anode", "Galvanies spontaan; elektrolities geforseer"],
    workedExamplesEn: [
      {
        question: "A galvanic cell is constructed with Zn and Cu electrodes. Given E°(Zn²⁺/Zn) = −0.76 V and E°(Cu²⁺/Cu) = +0.34 V, calculate the cell EMF and identify the anode and cathode.",
        steps: [
          "The electrode with the higher reduction potential is the cathode (reduction): Cu (E° = +0.34 V).",
          "Zn has the lower reduction potential → Zn is the anode (oxidation).",
          "E°cell = E°cathode − E°anode = 0.34 − (−0.76) = 1.10 V.",
          "Overall: Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)."
        ],
        solution: "E°cell = 1.10 V; anode = Zn; cathode = Cu",
        commonErrors: ["Subtracting anode − cathode instead of cathode − anode", "Saying Zn is the cathode because it has a more negative E°"]
      },
      {
        question: "Write the two half-reactions for the electrolysis of water and identify which electrode each occurs at.",
        steps: [
          "At the cathode (reduction): 4H₂O + 4e⁻ → 2H₂ + 4OH⁻ (or 4H⁺ + 4e⁻ → 2H₂ in acidic solution).",
          "At the anode (oxidation): 2H₂O → O₂ + 4H⁺ + 4e⁻.",
          "Overall: 2H₂O → 2H₂ + O₂ (electrolysis is non-spontaneous, requires external energy)."
        ],
        solution: "Cathode: H₂ produced; Anode: O₂ produced",
        commonErrors: ["Confusing anode and cathode in an electrolytic cell (both are reversed compared to a galvanic cell)", "Writing H₂ at the anode — it forms at the cathode where reduction occurs"]
      },
      {
        question: "Will a reaction occur spontaneously between Fe and Mg²⁺ ions? E°(Fe²⁺/Fe) = −0.44 V; E°(Mg²⁺/Mg) = −2.37 V.",
        steps: [
          "For a spontaneous reaction, E°cell must be positive.",
          "If Fe acts as the reducing agent (anode) and Mg²⁺ is reduced at cathode: E°cell = E°cathode − E°anode = −2.37 − (−0.44) = −1.93 V.",
          "E°cell is negative → NOT spontaneous.",
          "Rather: Mg is the stronger reducing agent (more negative E°), so Mg would reduce Fe²⁺ spontaneously."
        ],
        solution: "No: Fe cannot reduce Mg²⁺ spontaneously (E°cell = −1.93 V < 0)",
        commonErrors: ["Assuming more negative E° means the reaction is spontaneous in that direction", "Not checking the sign of E°cell — must be positive for spontaneous reaction"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Galvaniese sel: Zn en Cu. E°(Zn)=−0.76 V; E°(Cu)=+0.34 V. EMK en elektrodes?",
        steps: ["Katode = Cu (hoër E°); anode = Zn.", "E°sel = 0.34−(−0.76) = 1.10 V."],
        solution: "E°sel = 1.10 V; anode=Zn, katode=Cu",
        commonErrors: ["Aftrekking verkeerd: gebruik katode−anode"]
      },
      {
        question: "Elektrolise van water: halfreaksies?",
        steps: ["Katode (reduksie): 2H₂O + 4e⁻ → 2H₂ + 4OH⁻.", "Anode (oksidasie): 2H₂O → O₂ + 4H⁺ + 4e⁻."],
        solution: "Katode: H₂; Anode: O₂",
        commonErrors: ["Verwar anode en katode in elektrolitiese sel"]
      },
      {
        question: "Spontane reaksie: Fe en Mg²⁺? E°(Fe²⁺/Fe)=−0.44 V; E°(Mg²⁺/Mg)=−2.37 V.",
        steps: ["E°sel = −2.37−(−0.44) = −1.93 V < 0 → NIE spontaan nie."],
        solution: "Nie spontaan nie",
        commonErrors: ["Aanvaar negatiewe E° beteken spontanees"]
      }
    ],
    diagramsEn: [
      {
        label: "Galvanic (Voltaic) Cell — Zn/Cu",
        ascii: [
          "  GALVANIC CELL (spontaneous, produces electricity)",
          "",
          "   ANODE (−)          CATHODE (+)",
          "   Zn electrode        Cu electrode",
          "   (oxidation)         (reduction)",
          "   Zn → Zn²⁺ + 2e⁻   Cu²⁺ + 2e⁻ → Cu",
          "       │                    │",
          "       └──────┐   ┌─────────┘",
          "              │   │   external circuit",
          "         e⁻ flow → → → (from anode to cathode)",
          "",
          "   [Zn | ZnSO₄(aq)] ══ salt bridge ══ [CuSO₄(aq) | Cu]",
          "                    (KNO₃ / KCl)",
          "",
          "  E°cell = E°cathode − E°anode = +0.34 − (−0.76) = +1.10 V",
          "  Positive E°cell → spontaneous",
        ].join("\n"),
        caption: "In a galvanic cell, the anode is negative (oxidation occurs) and the cathode is positive (reduction occurs). Electrons flow through the external wire from anode to cathode. The salt bridge maintains electrical neutrality.",
      },
      {
        label: "Electrolytic Cell — Electrolysis of Water",
        ascii: [
          "  ELECTROLYTIC CELL (non-spontaneous, requires external power)",
          "",
          "         [+] power supply [−]",
          "          │                │",
          "          ▼                ▼",
          "       ANODE (+)        CATHODE (−)",
          "       (oxidation)      (reduction)",
          "       O₂ gas ↑         H₂ gas ↑",
          "       2H₂O →           4H₂O + 4e⁻ →",
          "       O₂+4H⁺+4e⁻      2H₂ + 4OH⁻",
          "          │                │",
          "          └────── H₂O ─────┘",
          "               (electrolyte)",
          "",
          "  Key: ANODE = positive electrode (connected to + terminal)",
          "       CATHODE = negative electrode (connected to − terminal)",
          "  In electrolytic cells this is OPPOSITE to galvanic cells!",
        ].join("\n"),
        caption: "Electrolysis forces a non-spontaneous reaction using an external power source. The anode is connected to the positive terminal; cathode to negative. H₂ forms at the cathode; O₂ at the anode.",
      },
    ],
    diagramsAf: [
      {
        label: "Galvaniese Sel — Zn/Cu",
        ascii: [
          "  GALVANIESE SEL (spontaan, lewer elektrisiteit)",
          "",
          "   ANODE (−)           KATODE (+)",
          "   Zn-elektrode         Cu-elektrode",
          "   (oksidasie)          (reduksie)",
          "   Zn → Zn²⁺ + 2e⁻    Cu²⁺ + 2e⁻ → Cu",
          "       │                    │",
          "       └──────┐   ┌─────────┘",
          "              │   │   eksterne stroombaan",
          "         e⁻ vloei → → → (van anode na katode)",
          "",
          "   [Zn | ZnSO₄(aq)] ══ soutbrug ══ [CuSO₄(aq) | Cu]",
          "                    (KNO₃ / KCl)",
          "",
          "  E°sel = E°katode − E°anode = +0.34 − (−0.76) = +1.10 V",
          "  Positiewe E°sel → spontaan",
        ].join("\n"),
        caption: "In 'n galvaniese sel is die anode negatief (oksidasie vind plaas) en die katode positief (reduksie vind plaas). Elektrone vloei deur die eksterne draad van anode na katode. Die soutbrug handhaaf elektriese neutraliteit.",
      },
      {
        label: "Elektrolitiese Sel — Elektrolise van Water",
        ascii: [
          "  ELEKTROLITIESE SEL (nie-spontaan, vereis eksterne krag)",
          "",
          "         [+] kragbron [−]",
          "          │               │",
          "          ▼               ▼",
          "       ANODE (+)       KATODE (−)",
          "       (oksidasie)     (reduksie)",
          "       O₂-gas ↑        H₂-gas ↑",
          "       2H₂O →          4H₂O + 4e⁻ →",
          "       O₂+4H⁺+4e⁻     2H₂ + 4OH⁻",
          "          │               │",
          "          └───── H₂O ─────┘",
          "               (elektroliet)",
          "",
          "  Sleutel: ANODE = positiewe elektrode (+ pool)",
          "           KATODE = negatiewe elektrode (− pool)",
          "  In elektrolitiese selle is dit OMGEKEER teenoor galvanies!",
        ].join("\n"),
        caption: "Elektrolise dwing 'n nie-spontane reaksie deur 'n eksterne kragbron. Die anode is gekoppel aan die positiewe pool; katode aan negatief. H₂ vorm by katode; O₂ by anode.",
      },
    ],
  },
  "PHYS-10": {
    summaryEn: "Industrial processes (Haber, Contact, Ostwald) and the role of fertilisers and catalysts in industry.",
    summaryAf: "Industriële prosesse (Haber, Kontak, Ostwald) en die rol van kunsmis en katalisators in die nywerheid.",
    conceptsEn: ["N₂ + 3H₂ ⇌ 2NH₃ (Haber, Fe catalyst)", "S → SO₂ → SO₃ → H₂SO₄ (Contact, V₂O₅)", "NPK fertiliser elements"],
    conceptsAf: ["N₂ + 3H₂ ⇌ 2NH₃ (Haber, Fe-katalisator)", "S → SO₂ → SO₃ → H₂SO₄ (Kontak, V₂O₅)", "NPK kunsmiselemente"],
    workedExamplesEn: [
      {
        question: "In the Haber process, N₂ + 3H₂ ⇌ 2NH₃ is exothermic. Why are conditions of ~450°C and 200 atm used rather than lower temperature and higher pressure?",
        steps: [
          "Lower temperature favours NH₃ production (Le Chatelier — exothermic forward reaction), but the reaction rate becomes too slow.",
          "Higher pressure favours NH₃ (fewer moles of gas on the right: 2 vs 4), but equipment becomes very expensive and unsafe above ~200 atm.",
          "450°C is a compromise: sufficient rate AND reasonable yield.",
          "Iron catalyst speeds up attainment of equilibrium without shifting it."
        ],
        solution: "Compromise conditions: 450°C for acceptable rate; 200 atm for acceptable yield; Fe catalyst increases rate",
        commonErrors: ["Saying the catalyst shifts the equilibrium — it only increases the rate of reaching equilibrium", "Confusing why high pressure is used (fewer moles product side) with cost"]
      },
      {
        question: "State the three stages of the Contact process for making sulfuric acid, including catalysts and conditions.",
        steps: [
          "Stage 1 — Burning sulfur: S + O₂ → SO₂.",
          "Stage 2 — Oxidation of SO₂: 2SO₂ + O₂ ⇌ 2SO₃ (V₂O₅ catalyst, 450°C).",
          "Stage 3 — Absorption: SO₃ is absorbed in concentrated H₂SO₄ to form oleum (H₂S₂O₇), then diluted with water to produce H₂SO₄."
        ],
        solution: "S → SO₂ → SO₃ → H₂SO₄; V₂O₅ catalyst; 450°C",
        commonErrors: ["Dissolving SO₃ directly in water — it produces a dangerous acid mist; use concentrated H₂SO₄ first", "Forgetting the V₂O₅ catalyst or writing V₂O₃"]
      },
      {
        question: "Explain why nitrogen, phosphorus and potassium (NPK) are important nutrients in fertilisers.",
        steps: [
          "Nitrogen (N): essential for protein and chlorophyll synthesis — promotes leaf and shoot growth.",
          "Phosphorus (P): vital for root development, DNA, ATP and seed formation.",
          "Potassium (K): regulates water uptake, enzyme activation, and disease resistance."
        ],
        solution: "N = leaf/protein growth; P = root/DNA/ATP; K = water regulation/enzyme activation",
        commonErrors: ["Saying nitrogen is found in fertilisers as N₂ gas — it must be in a soluble ionic form like NH₄⁺ or NO₃⁻", "Confusing potassium with calcium in bone/shell formation (that is Ca and P)"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Haber-proses: hoekom ~450°C en 200 atm?",
        steps: ["Laer T verbeter opbrengs maar vertraag tempo.", "200 atm: meer nageslag kante voordeel maar veilige koste.", "Kompromie."],
        solution: "Kompromie: 450°C vir tempo; 200 atm vir opbrengs; Fe-katalisator",
        commonErrors: ["Sê katalisator verskuif ewewig — dit doen dit nie"]
      },
      {
        question: "Drie stadia van die Kontakproses?",
        steps: ["S → SO₂.", "2SO₂ + O₂ ⇌ 2SO₃ (V₂O₅, 450°C).", "SO₃ + H₂SO₄ → H₂S₂O₇ → H₂SO₄."],
        solution: "S→SO₂→SO₃→H₂SO₄; V₂O₅; 450°C",
        commonErrors: ["Los SO₃ direk in water op — gevaarlike suurmis"]
      },
      {
        question: "Waarom is N, P en K belangrik in kunsmis?",
        steps: ["N: proteïen/chlorofil (loof).", "P: wortels/DNS/ATP.", "K: waterregulering/ensieme."],
        solution: "N=loof; P=wortels/DNS; K=waterregulering",
        commonErrors: ["Sê N is in N₂-gasvorm in kunsmis — moet oplosbaar wees (NH₄⁺ of NO₃⁻)"]
      }
    ],
    diagramsEn: [
      {
        label: "Dot-and-Cross Diagram: Covalent Bonding in NH₃ (Ammonia)",
        ascii: [
          "  Dot-and-Cross: NH₃ (nitrogen + 3 hydrogen atoms)",
          "",
          "        H            Each line = shared electron pair",
          "        |            (one dot from N, one cross from H)",
          "    H — N — H",
          "        |",
          "       :            (lone pair on N)",
          "",
          "  Electron diagram:",
          "          x",
          "     x  N  x       N has 5 valence electrons (dots)",
          "    x ╱ | ╲ x      H has 1 valence electron (crosses)",
          "    H   H   H",
          "",
          "  Shared pairs:  3 bonding pairs (N–H bonds)",
          "  Lone pair:     1 lone pair on nitrogen",
          "  Shape:         Trigonal pyramidal (bond angle ≈ 107°)",
          "",
          "  General rule: atoms share electrons to achieve noble gas config (8e⁻ / 2e⁻)",
        ].join("\n"),
        caption: "In a dot-and-cross diagram, dots represent electrons from one atom and crosses from the other. Each shared pair is a covalent bond. NH₃ has 3 bonding pairs and 1 lone pair on N.",
      },
      {
        label: "Haber Process Flow Diagram",
        ascii: [
          "  RAW MATERIALS",
          "  N₂ (from air)  +  3H₂ (from natural gas / Bosch process)",
          "         │                      │",
          "         └──────────┬───────────┘",
          "                    ▼",
          "            COMPRESSOR",
          "           (200 atm / 20 MPa)",
          "                    │",
          "                    ▼",
          "           REACTOR VESSEL",
          "           Iron (Fe) catalyst",
          "           Temperature: ~450°C",
          "           N₂ + 3H₂ ⇌ 2NH₃  (ΔH = −92 kJ/mol)",
          "                    │",
          "                    ▼",
          "             COOLING UNIT",
          "       NH₃ liquefies (bp −33°C), separated",
          "                    │",
          "       ┌────────────┴────────────┐",
          "       ▼                         ▼",
          "   LIQUID NH₃               Unreacted N₂ + H₂",
          "  (product, ~15% yield)       recycled back",
          "",
          "  Compromise: 450°C gives acceptable rate AND yield",
          "  Catalyst: Fe speeds equilibrium; does NOT shift it",
        ].join("\n"),
        caption: "The Haber process uses a compromise of ~450°C and ~200 atm with an iron catalyst. Higher pressure increases yield (fewer moles on product side) but increases cost. Unreacted gases are recycled.",
      },
    ],
    diagramsAf: [
      {
        label: "Punt-en-Kruisdiagram: Kovalente Binding in NH₃ (Ammoniak)",
        ascii: [
          "  Punt-en-Kruis: NH₃ (stikstof + 3 waterstofatome)",
          "",
          "        H            Elke lyn = gedeelde elektronpaar",
          "        |            (een punt van N, een kruis van H)",
          "    H — N — H",
          "        |",
          "       :            (vrye paar op N)",
          "",
          "  Elektrondiagram:",
          "          x",
          "     x  N  x       N het 5 valentie-elektrone (punte)",
          "    x ╱ | ╲ x      H het 1 valentie-elektron (kruise)",
          "    H   H   H",
          "",
          "  Gedeelde pare:  3 bindingspare (N–H-bindings)",
          "  Vrye paar:      1 vrye paar op stikstof",
          "  Vorm:           Driehoekige piramide (bindingshoek ≈ 107°)",
          "",
          "  Algemene reël: atome deel elektrone om edelgas-konfig te bereik (8e⁻ / 2e⁻)",
        ].join("\n"),
        caption: "In 'n punt-en-kruisdiagram verteenwoordig punte elektrone van een atoom en kruise van die ander. Elke gedeelde paar is 'n kovalente binding. NH₃ het 3 bindingspare en 1 vrye paar op N.",
      },
      {
        label: "Haber-Proses Vloeidiagram",
        ascii: [
          "  GRONDSTOWWE",
          "  N₂ (uit lug)  +  3H₂ (uit aardgas / Bosch-proses)",
          "         │                      │",
          "         └──────────┬───────────┘",
          "                    ▼",
          "            KOMPRESSOR",
          "           (200 atm / 20 MPa)",
          "                    │",
          "                    ▼",
          "           REAKTORVAT",
          "           Yster (Fe) katalisator",
          "           Temperatuur: ~450°C",
          "           N₂ + 3H₂ ⇌ 2NH₃  (ΔH = −92 kJ/mol)",
          "                    │",
          "                    ▼",
          "             AFKOELEENHEID",
          "       NH₃ word vloeistof (kpt −33°C), geskei",
          "                    │",
          "       ┌────────────┴────────────┐",
          "       ▼                         ▼",
          "  VLOEIBARE NH₃            Onreageerde N₂ + H₂",
          "  (produk, ~15% opbrengs)    hersirkuleer terug",
          "",
          "  Kompromie: 450°C gee aanvaarbare tempo ÉN opbrengs",
          "  Katalisator: Fe versnel ewewig; verskuif dit NIE",
        ].join("\n"),
        caption: "Die Haber-proses gebruik 'n kompromie van ~450°C en ~200 atm met 'n ysterkatalisator. Hoër druk verhoog opbrengs (minder mole aan produksy) maar verhoog koste. Onreageerde gasse word hersirkuleer.",
      },
    ],
  },

  // --------------------- LIFE SCIENCES ---------------------
  "LIFE-1": {
    summaryEn: "Structure of DNA & RNA, replication, transcription and translation.",
    summaryAf: "Struktuur van DNA en RNA, replikasie, transkripsie en translasie.",
    conceptsEn: ["Double helix; A-T, G-C base pairing", "DNA replication is semi-conservative", "Transcription in nucleus, translation at ribosome"],
    conceptsAf: ["Dubbele heliks; A-T, G-C basisparing", "DNA-replikasie is semi-konservatief", "Transkripsie in kern, translasie by ribosoom"],
    workedExamplesEn: [
      {
        question: "A section of DNA has the base sequence: 3′-TAC CGG ATT-5′. Write the complementary DNA strand, the mRNA transcript, and the tRNA anticodons.",
        steps: [
          "Complementary DNA (antiparallel, 5′→3′): ATG GCC TAA.",
          "mRNA transcript from template strand (3′-TAC CGG ATT-5′): 5′-AUG GCC UAA-3′.",
          "tRNA anticodons (complementary to mRNA codons): UAC CGG AUU.",
          "Note: UAA is a stop codon — translation terminates here."
        ],
        solution: "mRNA: 5′-AUG GCC UAA-3′; tRNA anticodons: UAC CGG (stop at UAA)",
        commonErrors: ["Forgetting that mRNA uses U (uracil) not T (thymine)", "Not reversing the strand to maintain antiparallel orientation", "Confusing codon (mRNA) with anticodon (tRNA)"]
      },
      {
        question: "Explain the semi-conservative nature of DNA replication with reference to what happens to the original strands.",
        steps: [
          "During replication, the double helix unwinds and the two strands separate.",
          "Each original (parent) strand serves as a template for a new complementary strand.",
          "Result: two new DNA molecules, each containing ONE original strand and ONE new strand.",
          "This is 'semi-conservative' — half the old molecule is conserved in each daughter molecule."
        ],
        solution: "Each new DNA double helix contains one old strand and one new strand",
        commonErrors: ["Confusing with conservative replication (both old strands stay together) or dispersive (fragments mixed throughout)", "Saying both strands are fully new — one strand per daughter molecule is the original template"]
      },
      {
        question: "What is the role of mRNA in protein synthesis? Where does transcription occur and where does translation occur in a eukaryotic cell?",
        steps: [
          "mRNA carries the genetic code from the DNA (in the nucleus) to the ribosome.",
          "Transcription: nucleus — DNA template → mRNA.",
          "mRNA exits the nucleus through nuclear pores.",
          "Translation: ribosome (in cytoplasm or on rough ER) — mRNA codons → amino acid chain."
        ],
        solution: "mRNA is the messenger; transcription in nucleus; translation at ribosome in cytoplasm",
        commonErrors: ["Saying translation occurs in the nucleus — it occurs at ribosomes in the cytoplasm", "Confusing mRNA with tRNA (tRNA carries amino acids; mRNA carries the code)"]
      }
    ],
    workedExamplesAf: [
      {
        question: "DNS-stroom: 3′-TAC CGG ATT-5′. Skryf mRNS-transkrip en tRNS-antikodon.",
        steps: ["mRNS: 5′-AUG GCC UAA-3′.", "tRNS antikodon: UAC CGG (UAA = stopkodon)."],
        solution: "mRNS: AUG GCC UAA; stop by UAA",
        commonErrors: ["Gebruik T in plaas van U in mRNS"]
      },
      {
        question: "Verduidelik semi-konserwatiewe replikasie.",
        steps: ["Spiraal losmaak.", "Elke ou string = templaat vir nuwe.", "Twee nuwe DNS: elke een 1 ou + 1 nuwe string."],
        solution: "Elke dogtermolekuul het een ou en een nuwe string",
        commonErrors: ["Verwar met konserwatiewe replikasie"]
      },
      {
        question: "Waar vind transkripsie en translasie plaas?",
        steps: ["Transkripsie: kern (DNS → mRNS).", "Translasie: ribosoom in sitoplasma."],
        solution: "Transkripsie = kern; translasie = ribosoom",
        commonErrors: ["Sê translasie vind in die kern plaas"]
      }
    ],
    diagramsEn: [
      {
        label: "DNA Double Helix & Complementary Base Pairing",
        ascii: [
          "      5'                          3'",
          "      |                            |",
          "   ---A========T---   (A-T: 2 hydrogen bonds)",
          "      |                            |",
          "   ---T========A---",
          "      |                            |",
          "   ---G≡≡≡≡≡≡≡C---   (G-C: 3 hydrogen bonds)",
          "      |                            |",
          "   ---C≡≡≡≡≡≡≡G---",
          "      |                            |",
          "   ---A========T---",
          "      |                            |",
          "      3'                          5'   ← antiparallel",
          "",
          "  Sugar-phosphate backbone runs down each side.",
          "  Base pairing rule:  A–T  and  G–C  ONLY.",
          "  The two strands are ANTIPARALLEL (5'→3' opposite 3'→5').",
        ].join("\n"),
        caption: "DNA is a double helix held together by complementary base pairs. Adenine pairs with Thymine (2 H-bonds), Guanine pairs with Cytosine (3 H-bonds). The two strands run in opposite (antiparallel) directions.",
      },
      {
        label: "Semi-Conservative DNA Replication",
        ascii: [
          "  Parent DNA molecule:",
          "        ===============",
          "        |||||||||||||||   ← double helix",
          "        ===============",
          "               |",
          "        unwinds (helicase) & strands separate",
          "               |",
          "               v",
          "    each old strand acts as a TEMPLATE",
          "    new complementary nucleotides added (A-T, G-C)",
          "               |",
          "               v",
          "  TWO daughter molecules:",
          "     ==========(old)        ==========(NEW)",
          "     ||||||||||             ||||||||||",
          "     ==========(NEW)        ==========(old)",
          "",
          "  Each daughter = 1 OLD strand + 1 NEW strand",
        ].join("\n"),
        caption: "Replication is semi-conservative: the helix unwinds, each parent strand is a template for a new strand, and every daughter molecule keeps one original strand plus one newly made strand.",
      },
      {
        label: "Protein Synthesis Flow: Transcription → Translation",
        ascii: [
          "  ┌─────────────── NUCLEUS ───────────────┐",
          "  │                                        │",
          "  │   DNA template: 3'-TAC CGG ATT-5'      │",
          "  │            |  TRANSCRIPTION             │",
          "  │            v  (RNA polymerase)          │",
          "  │   mRNA:     5'-AUG GCC UAA-3'           │",
          "  └────────────────│───────────────────────┘",
          "                   │  mRNA exits via nuclear pore",
          "                   v",
          "  ┌──────────── RIBOSOME (cytoplasm) ──────┐",
          "  │   mRNA codons:  AUG  GCC  UAA(stop)     │",
          "  │   tRNA anticodon: UAC  CGG              │",
          "  │            |  TRANSLATION               │",
          "  │            v                            │",
          "  │   amino acids: Met – Ala – [STOP]       │",
          "  │            → polypeptide chain          │",
          "  └────────────────────────────────────────┘",
        ].join("\n"),
        caption: "DNA → mRNA (transcription, in the nucleus) → protein (translation, at the ribosome). mRNA uses U (uracil) instead of T. Codons on mRNA are read in groups of three; tRNA brings the matching amino acid until a stop codon ends the chain.",
      },
    ],
    diagramsAf: [
      {
        label: "DNA Dubbele Heliks & Komplementêre Basisparing",
        ascii: [
          "      5'                          3'",
          "      |                            |",
          "   ---A========T---   (A-T: 2 waterstofbindings)",
          "      |                            |",
          "   ---T========A---",
          "      |                            |",
          "   ---G≡≡≡≡≡≡≡C---   (G-C: 3 waterstofbindings)",
          "      |                            |",
          "   ---C≡≡≡≡≡≡≡G---",
          "      |                            |",
          "      3'                          5'   ← antiparallel",
          "",
          "  Suiker-fosfaat-ruggraat loop af aan elke kant.",
          "  Basisparingsreël:  A–T  en  G–C  SLEGS.",
          "  Die twee stringe is ANTIPARALLEL (5'→3' teenoor 3'→5').",
        ].join("\n"),
        caption: "DNS is 'n dubbele heliks wat deur komplementêre basispare bymekaargehou word. Adenien paar met Timien (2 H-bindings), Guanien paar met Sitosien (3 H-bindings). Die twee stringe loop in teenoorgestelde (antiparallelle) rigtings.",
      },
      {
        label: "Semi-Konservatiewe DNS-Replikasie",
        ascii: [
          "  Ouer-DNS-molekuul:",
          "        ===============",
          "        |||||||||||||||   ← dubbele heliks",
          "        ===============",
          "               |",
          "        ontspiral (helikase) & stringe skei",
          "               |",
          "               v",
          "    elke ou string dien as 'n TEMPLAAT",
          "    nuwe komplementêre nukleotiede bygevoeg (A-T, G-C)",
          "               |",
          "               v",
          "  TWEE dogtermolekule:",
          "     ==========(oud)        ==========(NUUT)",
          "     ||||||||||             ||||||||||",
          "     ==========(NUUT)       ==========(oud)",
          "",
          "  Elke dogter = 1 OU string + 1 NUWE string",
        ].join("\n"),
        caption: "Replikasie is semi-konservatief: die heliks ontspiral, elke ouerstring is 'n templaat vir 'n nuwe string, en elke dogtermolekuul behou een oorspronklike string plus een nuutgemaakte string.",
      },
      {
        label: "Proteïensintese-Vloei: Transkripsie → Translasie",
        ascii: [
          "  ┌─────────────── KERN ───────────────────┐",
          "  │                                        │",
          "  │   DNS-templaat: 3'-TAC CGG ATT-5'      │",
          "  │            |  TRANSKRIPSIE              │",
          "  │            v  (RNA-polimerase)          │",
          "  │   mRNS:     5'-AUG GCC UAA-3'           │",
          "  └────────────────│───────────────────────┘",
          "                   │  mRNS verlaat via kernporie",
          "                   v",
          "  ┌──────────── RIBOSOOM (sitoplasma) ─────┐",
          "  │   mRNS-kodons:  AUG  GCC  UAA(stop)     │",
          "  │   tRNS-antikodon: UAC  CGG              │",
          "  │            |  TRANSLASIE                │",
          "  │            v                            │",
          "  │   aminosure: Met – Ala – [STOP]         │",
          "  │            → polipeptiedketting         │",
          "  └────────────────────────────────────────┘",
        ].join("\n"),
        caption: "DNS → mRNS (transkripsie, in die kern) → proteïen (translasie, by die ribosoom). mRNS gebruik U (urasiel) in plaas van T. Kodons op mRNS word in groepe van drie gelees; tRNS bring die ooreenstemmende aminosuur tot 'n stopkodon die ketting beëindig.",
      },
    ],
  },
  "LIFE-2": {
    summaryEn: "Cell division producing four haploid gametes; introduces genetic variation via crossing over and independent assortment.",
    summaryAf: "Seldeling wat vier haploïede gamete produseer; lei genetiese variasie deur kruising en onafhanklike assortering in.",
    conceptsEn: ["Two divisions: Meiosis I & II", "Crossing over in prophase I", "Result: 4 haploid (n) cells"],
    conceptsAf: ["Twee delings: Meiose I & II", "Kruising in profase I", "Resultaat: 4 haploïede (n) selle"],
    workedExamplesEn: [
      {
        question: "Compare the end products and genetic content of mitosis vs meiosis in a human cell starting with 46 chromosomes.",
        steps: [
          "Mitosis: 1 cell (2n=46) → 2 daughter cells, each 2n=46; genetically identical to parent.",
          "Meiosis: 1 cell (2n=46) → 4 gametes, each n=23; genetically DIFFERENT due to crossing over and independent assortment.",
          "Purpose: mitosis = growth/repair; meiosis = sexual reproduction."
        ],
        solution: "Mitosis → 2 diploid (2n=46) identical cells; Meiosis → 4 haploid (n=23) genetically varied cells",
        commonErrors: ["Saying meiosis produces 2 cells (that is only after Meiosis I)", "Forgetting that meiosis introduces variation — mitosis clones"]
      },
      {
        question: "Explain how crossing over during Prophase I of meiosis increases genetic variation.",
        steps: [
          "During Prophase I, homologous chromosomes pair up to form bivalents (tetrads).",
          "Non-sister chromatids from homologous chromosomes overlap at chiasmata.",
          "Segments of chromatids are exchanged (crossing over / recombination).",
          "Result: chromosomes now carry new combinations of alleles not present in either parent chromosome."
        ],
        solution: "Crossing over shuffles alleles between homologous chromosomes, creating new allele combinations",
        commonErrors: ["Saying crossing over occurs between sister chromatids of the SAME chromosome — it occurs between non-sister chromatids of HOMOLOGOUS chromosomes", "Placing crossing over in Prophase II — it occurs in Prophase I"]
      },
      {
        question: "A cell has 2n = 8. How many chromosomes will be in each cell at the end of: (a) Meiosis I; (b) Meiosis II?",
        steps: [
          "(a) After Meiosis I: homologous pairs separate → each cell has n = 4 chromosomes (still as sister chromatid pairs).",
          "(b) After Meiosis II: sister chromatids separate → each of the 4 cells has n = 4 individual chromosomes."
        ],
        solution: "(a) 4 chromosomes per cell after Meiosis I; (b) 4 chromosomes per cell after Meiosis II",
        commonErrors: ["Halving again after Meiosis II: chromosome NUMBER stays the same (4), but chromatids separate", "Confusing chromatids with chromosomes when counting"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Vergelyk eindprodukte van mitose en meiose (2n=46).",
        steps: ["Mitose → 2 sel (2n=46) identies.", "Meiose → 4 gamete (n=23) geneties verskillend."],
        solution: "Mitose: 2 diploïde; Meiose: 4 haploïede",
        commonErrors: ["Sê meiose produseer 2 selle — slegs na Meiose I"]
      },
      {
        question: "Verduidelik hoe kruising in Profase I variasie verhoog.",
        steps: ["Homoloog pare op by bivalente.", "Nie-suster chromatides ruil segmente by chiasma.", "Nuwe alleelkombinasies."],
        solution: "Kruising skuif allele tussen homologe → nuwe kombinasies",
        commonErrors: ["Sê kruising tussen suster-chromatide van dieselfde chromosoom"]
      },
      {
        question: "2n=8. Chromosome na (a) Meiose I; (b) Meiose II?",
        steps: ["(a) n=4 per sel.", "(b) n=4 per sel (chromatides geskei, nie chromosoomgetal nie)."],
        solution: "(a) 4; (b) 4",
        commonErrors: ["Halveer weer na Meiose II — getal bly 4"]
      }
    ],
    diagramsEn: [
      {
        label: "Overview of Meiosis I and II",
        ascii: [
          "  Diploid parent cell (2n = 4)",
          "        [●● ○○]",
          "           |",
          "       MEIOSIS I",
          "     (homologues separate)",
          "      /           \\",
          "  [●  ○]       [●  ○]  ← 2 haploid cells (n=2)",
          "      |               |",
          "  MEIOSIS II      MEIOSIS II",
          "  (chromatids separate)",
          "   /    \\          /    \\",
          " [●]   [○]       [●]   [○]",
          "",
          "  Final result: 4 haploid gametes (n)",
          "  ● = paternal chromatid   ○ = maternal chromatid",
        ].join("\n"),
        caption: "Meiosis I separates homologous chromosome pairs (2n → n). Meiosis II separates sister chromatids — no further halving of chromosome number.",
      },
      {
        label: "Crossing Over During Prophase I",
        ascii: [
          "  Homologous pair before crossing over:",
          "  |A B C D|   (paternal)",
          "  |a b c d|   (maternal)",
          "",
          "  Chiasmata form — chromatids exchange segments:",
          "  |A B c d|   (recombinant)",
          "  |a b C D|   (recombinant)",
          "",
          "  Result: new allele combinations → genetic variation",
        ].join("\n"),
        caption: "Crossing over at chiasmata shuffles alleles between homologous chromosomes. This is the main source of genetic variation in meiosis.",
      },
    ],
    diagramsAf: [
      {
        label: "Oorsig van Meiose I en II",
        ascii: [
          "  Diploïede ouersel (2n = 4)",
          "        [●● ○○]",
          "           |",
          "       MEIOSE I",
          "     (homoloog-pare geskei)",
          "      /           \\",
          "  [●  ○]       [●  ○]  ← 2 haploïede selle (n=2)",
          "      |               |",
          "  MEIOSE II       MEIOSE II",
          "  (chromatides geskei)",
          "   /    \\          /    \\",
          " [●]   [○]       [●]   [○]",
          "",
          "  Eindresultaat: 4 haploïede gamete (n)",
          "  ● = vaderlike chromatied   ○ = moederlike chromatied",
        ].join("\n"),
        caption: "Meiose I skei homologe chromosome (2n → n). Meiose II skei susserchromatides — geen verdere halvering van chromosoomgetal nie.",
      },
      {
        label: "Kruising Tydens Profase I",
        ascii: [
          "  Homoloog-paar voor kruising:",
          "  |A B C D|   (vaderlik)",
          "  |a b c d|   (moederlik)",
          "",
          "  Chiasma vorm — chromatides ruil segmente:",
          "  |A B c d|   (rekombinant)",
          "  |a b C D|   (rekombinant)",
          "",
          "  Resultaat: nuwe alleelkombinasies → genetiese variasie",
        ].join("\n"),
        caption: "Kruising by chiasma skuifel allele tussen homologe chromosome. Dit is die hoof bron van genetiese variasie in meiose.",
      },
    ],
  },
  "LIFE-3": {
    summaryEn: "Reproductive strategies in vertebrates: external vs internal fertilisation, ovipary, ovovivipary, vivipary, parental care.",
    summaryAf: "Voortplantingstrategieë by gewerweldes: eksterne vs interne bevrugting, ovipariteit, ovo­vivipariteit, vivipariteit, ouerlike sorg.",
    conceptsEn: ["External fertilisation = many eggs, low survival", "Internal fertilisation = fewer offspring, higher survival", "Parental care improves offspring fitness"],
    conceptsAf: ["Eksterne bevrugting = baie eiers, lae oorlewing", "Interne bevrugting = minder nageslag, hoër oorlewing", "Ouerlike sorg verbeter nageslag-fiksheid"],
    workedExamplesEn: [
      {
        question: "Compare external and internal fertilisation in terms of number of gametes produced, parental care and survival rate of offspring.",
        steps: [
          "External fertilisation (e.g. fish, frogs): enormous numbers of eggs and sperm released into water; minimal parental care; low survival rate due to predation and desiccation.",
          "Internal fertilisation (e.g. mammals, reptiles): fewer gametes; fertilisation inside the body; offspring better protected; higher survival rate.",
          "Trade-off: high gamete cost (external) vs low gamete cost but high parental investment (internal)."
        ],
        solution: "External: many gametes, low survival, little care. Internal: fewer gametes, higher survival, more parental investment.",
        commonErrors: ["Saying internal fertilisation always means live birth — reptiles have internal fertilisation but lay eggs (ovipary)", "Confusing ovovivipary (eggs hatch inside mother, no placenta) with vivipary (placental nourishment)"]
      },
      {
        question: "Classify each as oviparous, ovoviviparous, or viviparous: (a) chicken; (b) shark (egg hatches inside mother); (c) human.",
        steps: [
          "(a) Chicken: lays shelled eggs that develop outside the mother → oviparous.",
          "(b) Shark (some species): eggs hatch inside the female, offspring nourished by yolk (no placenta) → ovoviviparous.",
          "(c) Human: offspring develops inside uterus attached via placenta → viviparous."
        ],
        solution: "(a) Oviparous; (b) Ovoviviparous; (c) Viviparous",
        commonErrors: ["Classifying ovoviviparous as viviparous — the key is that ovoviviparous offspring are NOT nourished via a placenta", "Forgetting to check whether a placenta is involved"]
      },
      {
        question: "Explain how parental care increases the reproductive fitness of species that practice it.",
        steps: [
          "Parental care increases offspring survival rate by protecting from predators, providing food/warmth, and teaching skills.",
          "Higher survival → more offspring reach reproductive age → more alleles passed to next generation.",
          "Fitness = ability to survive AND reproduce; parental care improves both for offspring.",
          "Trade-off: energy/time cost to the parent; may reduce number of offspring (fewer but better-cared-for young)."
        ],
        solution: "Parental care increases offspring survival to reproductive age, thereby increasing the parent's genetic fitness",
        commonErrors: ["Saying parental care increases the parent's survival — it increases OFFSPRING survival", "Forgetting the trade-off: fewer offspring but higher survival per individual"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Vergelyk eksterne en interne bevrugting: gamete, sorg, oorlewing.",
        steps: ["Ekstern: baie gamete, min sorg, lae oorlewing.", "Intern: min gamete, meer sorg, hoër oorlewing."],
        solution: "Ekstern: baie gamete, lae oorlewing; Intern: min gamete, hoër oorlewing",
        commonErrors: ["Sê intern beteken altyd lewendgeboorte — reptiele is ovipaar maar het interne bevrugting"]
      },
      {
        question: "Klassifiseer: hoender, haai (eiers broei in ma), mens.",
        steps: ["Hoender: ovipaar.", "Haai: ovo­viviparous.", "Mens: viviparous."],
        solution: "(a) Ovipaar; (b) Ovo­viviparous; (c) Viviparous",
        commonErrors: ["Klassifiseer ovo­viviparous as viviparous — geen plasenta nie"]
      },
      {
        question: "Hoe verhoog ouerlike sorg reproductiewe fiksheid?",
        steps: ["Verhoog nageslag-oorlewing (beskerming, voedsel).", "Meer nageslag bereik voortplantingsouderdom → meer gene oorgedra."],
        solution: "Ouerlike sorg verhoog oorlewing van nageslag → verhoog ouers se genetiese fiksheid",
        commonErrors: ["Sê dit verhoog ouers se oorlewing — dit verhoog NAGESLAG se oorlewing"]
      }
    ],
    diagramsEn: [
      {
        label: "Grassland Food Web — Energy Flow and Trophic Levels",
        ascii: [
          "                   SUN",
          "                    |",
          "              [GRASS]  ← Producer (autotroph)",
          "             /        \\",
          "        [RABBIT]    [GRASSHOPPER]",
          "           |               |",
          "         [FOX]          [FROG]",
          "           |               |",
          "           └───→ [EAGLE] ←─┘",
          "",
          "  Arrow direction: prey → predator  (energy flows this way)",
          "  Trophic levels:",
          "    Level 1 — Producers (Grass)",
          "    Level 2 — Primary consumers / herbivores (Rabbit, Grasshopper)",
          "    Level 3 — Secondary consumers (Fox, Frog)",
          "    Level 4 — Tertiary consumer / apex predator (Eagle)",
          "",
          "  ~10% of energy passes to the next trophic level.",
          "  90% is lost as heat at each level (10% Rule).",
        ].join("\n"),
        caption: "A food web shows multiple interconnected food chains. Arrows point from the organism being eaten TO the organism doing the eating — the direction of energy transfer. Predation pressure at each trophic level shapes the reproductive strategy of prey species (high predation → r-strategy: many offspring, little care).",
      },
      {
        label: "The Nitrogen Cycle",
        ascii: [
          "  ┌─────────────────────────────────────┐",
          "  │        ATMOSPHERIC N₂ (78%)          │",
          "  └──────────────────────────────────────┘",
          "       ↑  Denitrification           ↓ Nitrogen fixation",
          "  (denitrifying bacteria)    (Rhizobium in root nodules;",
          "                              lightning; industrial — Haber)",
          "                                          ↓",
          "  Dead organisms + waste → DECOMPOSERS → NH₄⁺ (ammonium)",
          "                                          |",
          "                                 Nitrification",
          "                            (Nitrosomonas bacteria)",
          "                                          ↓",
          "                                   NO₂⁻ (nitrite)",
          "                                          |",
          "                            (Nitrobacter bacteria)",
          "                                          ↓",
          "                                   NO₃⁻ (nitrate)",
          "                                          |",
          "                               ↙ Absorbed by plant roots",
          "                         [PLANTS] → eaten by → [ANIMALS]",
          "                                          ↑",
          "                          dead matter feeds decomposers",
        ].join("\n"),
        caption: "Nitrogen cycles through atmosphere, soil, and living organisms. Key processes: Nitrogen fixation (N₂ → NH₄⁺), Nitrification (NH₄⁺ → NO₂⁻ → NO₃⁻), Absorption by plants, and Denitrification (NO₃⁻ → N₂). Bacteria drive every stage. Decomposers return nitrogen from dead organisms — including those with diverse reproductive strategies — back into the cycle.",
      },
    ],
    diagramsAf: [
      {
        label: "Grasveld Voedselweb — Energievloei en Trofiese Vlakke",
        ascii: [
          "                    SON",
          "                     |",
          "               [GRAS]  ← Produsent (autotroof)",
          "              /        \\",
          "         [KONYN]    [SPRINKAAN]",
          "            |               |",
          "          [JAKKALS]       [PADDA]",
          "            |               |",
          "            └───→ [AREND] ←─┘",
          "",
          "  Pylrigting: prooi → roofdier  (energie vloei so)",
          "  Trofiese vlakke:",
          "    Vlak 1 — Produente (Gras)",
          "    Vlak 2 — Primêre verbruikers / herbivore (Konyn, Sprinkaan)",
          "    Vlak 3 — Sekondêre verbruikers (Jakkals, Padda)",
          "    Vlak 4 — Tersiêre verbruiker / toppredator (Arend)",
          "",
          "  ~10% van energie word na die volgende trofiese vlak oorgedra.",
          "  90% word as hitte verloor (10%-reël).",
        ].join("\n"),
        caption: "ʼn Voedselweb toon onderling verbonde voedselkettings. Pyle wys van die organisme wat geëet word NA die organisme wat eet — rigting van energieoordrag. Roofdierdruk by elke trofiese vlak beïnvloed voortplantingstrategie: hoë roofdierdruk → r-strategie (baie nageslag, min sorg).",
      },
      {
        label: "Die Stikstofkringloop",
        ascii: [
          "  ┌──────────────────────────────────────┐",
          "  │        ATMOSFERIESE N₂ (78%)          │",
          "  └──────────────────────────────────────┘",
          "       ↑  Denitrifikasie            ↓ Stikstofbinding",
          "  (denitrifiserende bakterieë) (Rhizobium in wortelknobbels;",
          "                               blits; industrieel — Haber)",
          "                                           ↓",
          "  Dooie organismes + afval → ONTBINDERS → NH₄⁺ (ammonium)",
          "                                           |",
          "                                  Nitrifikasie",
          "                             (Nitrosomonas-bakterieë)",
          "                                           ↓",
          "                                    NO₂⁻ (nitriet)",
          "                                           |",
          "                             (Nitrobacter-bakterieë)",
          "                                           ↓",
          "                                    NO₃⁻ (nitraat)",
          "                                           |",
          "                                ↙ Opgeneem deur plantwortels",
          "                          [PLANTE] → geëet deur → [DIERE]",
          "                                           ↑",
          "                           dooie materie voed ontbinders",
        ].join("\n"),
        caption: "Stikstof sirkuleer deur atmosfeer, grond en lewende organismes. Sleutelprosesse: Stikstofbinding (N₂ → NH₄⁺), Nitrifikasie (NH₄⁺ → NO₂⁻ → NO₃⁻), Absorpsie deur plante, en Denitrifikasie (NO₃⁻ → N₂). Bakterieë is noodsaaklik by elke stadium.",
      },
    ],
  },
  "LIFE-4": {
    summaryEn: "Human male & female reproductive systems, gametogenesis, the menstrual cycle and fertilisation.",
    summaryAf: "Menslike manlike en vroulike voortplantingstelsels, gametogenese, die menstruasiesiklus en bevrugting.",
    conceptsEn: ["FSH → follicle development; LH → ovulation", "28-day cycle: menstrual, follicular, ovulatory, luteal", "Implantation in endometrium ~day 7 post-fertilisation"],
    conceptsAf: ["FSH → follikelontwikkeling; LH → ovulasie", "28-dag siklus: menstrueel, follikulêr, ovulatories, luteaal", "Inplanting in endometrium ~dag 7 na bevrugting"],
    workedExamplesEn: [
      {
        question: "Describe the role of FSH, LH, oestrogen and progesterone in a 28-day menstrual cycle, referencing their peak times.",
        steps: [
          "Days 1–5 (menstruation): low oestrogen and progesterone cause shedding of endometrium.",
          "Days 6–13 (follicular phase): FSH from pituitary stimulates follicle growth; rising oestrogen thickens endometrium.",
          "Day 14 (ovulation): LH surge triggers release of secondary oocyte.",
          "Days 15–28 (luteal phase): ruptured follicle becomes corpus luteum; secretes progesterone to maintain endometrium. If no fertilisation, corpus luteum degenerates, hormones fall → menstruation begins again."
        ],
        solution: "FSH → follicle; oestrogen → endometrium thickening; LH surge → ovulation; progesterone → maintain endometrium",
        commonErrors: ["Saying FSH causes ovulation — it is the LH surge that triggers ovulation", "Confusing oestrogen (thickens endometrium before ovulation) with progesterone (maintains it after ovulation)"]
      },
      {
        question: "State THREE structural differences between a sperm cell and an egg cell (oocyte) and relate each difference to function.",
        steps: [
          "Sperm: small with a long flagellum → motile to reach the egg.",
          "Sperm: acrosome (enzyme-filled cap) → penetrates zona pellucida of the egg.",
          "Egg: large with much cytoplasm and yolk → nutrient store for early embryo development.",
          "(Bonus) Sperm: many mitochondria in midpiece → energy (ATP) for swimming."
        ],
        solution: "Sperm: small/motile/acrosome; Egg: large/nutrient-rich",
        commonErrors: ["Saying the egg has a flagellum — only sperm are motile", "Forgetting to link structure to function — NSC questions always ask 'how does structure relate to function?'"]
      },
      {
        question: "Explain what happens to the corpus luteum if fertilisation occurs versus if it does not occur.",
        steps: [
          "If NO fertilisation: corpus luteum degenerates after ~12 days → progesterone and oestrogen drop → menstruation.",
          "If fertilisation OCCURS: the developing embryo secretes hCG (human chorionic gonadotrophin), which maintains the corpus luteum.",
          "Corpus luteum continues producing progesterone to maintain the endometrium until the placenta takes over (~week 12)."
        ],
        solution: "No fertilisation → degenerate → menstruation; Fertilisation → hCG maintains corpus luteum → sustained progesterone",
        commonErrors: ["Saying the corpus luteum becomes the placenta — the placenta develops separately from the chorion", "Forgetting hCG as the signal that maintains the corpus luteum in pregnancy"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Rol van FSH, LH, estrogeen en progesteroon in 28-dag siklus.",
        steps: ["FSH: follikelgroei (dag 6-13).", "LH-stoot: ovulasie (dag 14).", "Progesteroon: handhaaf endometrium (dag 15-28)."],
        solution: "FSH→follikel; LH→ovulasie; progesteroon→endometrium",
        commonErrors: ["Sê FSH veroorsaak ovulasie — dit is LH-stoot"]
      },
      {
        question: "Drie strukturele verskille: spermsel vs eiersel.",
        steps: ["Sperm: klein, flagellum (beweeglik).", "Sperm: akrosoom (ensieme, penetreer eier).", "Eiersel: groot, voedingstowwe (embrioontwikkeling)."],
        solution: "Sperm: klein/beweeglik/akrosoom; Eier: groot/voedingsryk",
        commonErrors: ["Sê eiersel het 'n flagellum"]
      },
      {
        question: "Corpus luteum: bevrugting ja vs nee?",
        steps: ["Geen bevrugting: degenereer → menstruasie.", "Bevrugting: hCG handhaaf corpus luteum → progesteroon aanhou."],
        solution: "Geen bevr: degenereer; Bevrugting: hCG → corpus luteum bly",
        commonErrors: ["Sê corpus luteum word die plasenta"]
      }
    ],
    diagramsEn: [
      {
        label: "Menstrual Cycle — Hormone Levels (28 days)",
        ascii: [
          "  Hormone",
          "  level",
          "    ^                    LH",
          "    |                    /\\  ← LH surge triggers ovulation",
          "    |               FSH /  \\",
          "    |              ___ /    \\___",
          "    |   oestrogen /          progesterone",
          "    |          __/        ___/‾‾‾‾‾\\__",
          "    |   ______/        __/           \\___",
          "    +---|----|----|----|----|----|----|--> Day",
          "        1    5    9   14   18   23   28",
          "    Menstrual  Follicular | Luteal phase",
          "    (1-5)      (6-13)   OVULATION (15-28)",
          "                          (day 14)",
          "",
          "  FSH → follicle grows → oestrogen rises (thickens endometrium)",
          "  LH SURGE (day 14) → ovulation",
          "  Corpus luteum → progesterone (maintains endometrium)",
          "  No fertilisation → hormones fall → menstruation",
        ].join("\n"),
        caption: "FSH stimulates follicle growth and oestrogen release in the first half. A mid-cycle LH surge triggers ovulation on ~day 14. The corpus luteum then secretes progesterone to maintain the endometrium; if no fertilisation, hormone levels drop and menstruation begins.",
      },
      {
        label: "Fertilisation & Implantation Pathway",
        ascii: [
          "  Ovary → releases secondary oocyte (ovulation)",
          "     |",
          "     v",
          "  Fallopian tube (oviduct)  ← FERTILISATION happens here",
          "     |   sperm + oocyte → ZYGOTE (2n)",
          "     v",
          "  Zygote divides by mitosis → morula → BLASTOCYST",
          "     |  (moves toward uterus over ~7 days)",
          "     v",
          "  Uterus → IMPLANTATION into endometrium (~day 7)",
          "",
          "   Ovary      Oviduct          Uterus",
          "   (O)====[fertilisation]====[ ( ) ]",
          "                              endometrium (thick lining)",
          "",
          "  Sperm acrosome digests zona pellucida → 1 sperm enters",
          "  → cortical reaction blocks other sperm (no polyspermy)",
        ].join("\n"),
        caption: "Fertilisation occurs in the fallopian tube where one sperm penetrates the oocyte to form a diploid zygote. The zygote divides as it travels to the uterus, becoming a blastocyst that implants into the thickened endometrium about 7 days after fertilisation.",
      },
    ],
    diagramsAf: [
      {
        label: "Menstruasiesiklus — Hormoonvlakke (28 dae)",
        ascii: [
          "  Hormoon-",
          "  vlak",
          "    ^                    LH",
          "    |                    /\\  ← LH-stoot sneller ovulasie",
          "    |               FSH /  \\",
          "    |              ___ /    \\___",
          "    |   estrogeen /          progesteroon",
          "    |          __/        ___/‾‾‾‾‾\\__",
          "    |   ______/        __/           \\___",
          "    +---|----|----|----|----|----|----|--> Dag",
          "        1    5    9   14   18   23   28",
          "    Menstrueel Follikulêr | Luteale fase",
          "    (1-5)      (6-13)   OVULASIE (15-28)",
          "                          (dag 14)",
          "",
          "  FSH → follikel groei → estrogeen styg (verdik endometrium)",
          "  LH-STOOT (dag 14) → ovulasie",
          "  Corpus luteum → progesteroon (handhaaf endometrium)",
          "  Geen bevrugting → hormone daal → menstruasie",
        ].join("\n"),
        caption: "FSH stimuleer follikelgroei en estrogeen-vrystelling in die eerste helfte. 'n LH-stoot in die middel van die siklus sneller ovulasie op ~dag 14. Die corpus luteum skei dan progesteroon af om die endometrium te handhaaf; sonder bevrugting daal die hormone en menstruasie begin.",
      },
      {
        label: "Bevrugting- & Inplanting-Roete",
        ascii: [
          "  Eierstok → laat sekondêre oösiet vry (ovulasie)",
          "     |",
          "     v",
          "  Fallopiusbuis (eierleier)  ← BEVRUGTING gebeur hier",
          "     |   sperm + oösiet → ZIGOOT (2n)",
          "     v",
          "  Zigoot deel deur mitose → morula → BLASTOSIST",
          "     |  (beweeg na uterus oor ~7 dae)",
          "     v",
          "  Uterus → INPLANTING in endometrium (~dag 7)",
          "",
          "   Eierstok   Eierleier        Uterus",
          "   (O)====[bevrugting]======[ ( ) ]",
          "                              endometrium (dik voering)",
          "",
          "  Sperm-akrosoom verteer zona pellucida → 1 sperm in",
          "  → kortikale reaksie blok ander sperms (geen polispermie)",
        ].join("\n"),
        caption: "Bevrugting vind in die eierleier plaas waar een sperm die oösiet binnedring om 'n diploïede zigoot te vorm. Die zigoot deel terwyl dit na die uterus beweeg, word 'n blastosist wat ongeveer 7 dae na bevrugting in die verdikte endometrium inplant.",
      },
    ],
  },
  "LIFE-5": {
    summaryEn: "Mendelian genetics: monohybrid and dihybrid crosses, sex-linked inheritance, blood groups, mutations.",
    summaryAf: "Mendeliese genetika: monohibriede en dihibriede kruisings, geslagsgekoppelde oorerwing, bloedgroepe, mutasies.",
    conceptsEn: ["Mendel's law of segregation", "9:3:3:1 ratio for dihybrid cross", "Sex-linked traits show on X chromosome (e.g. haemophilia)"],
    conceptsAf: ["Mendel se wet van segregasie", "9:3:3:1 verhouding vir dihibriede kruising", "Geslagsgekoppelde kenmerke verskyn op X-chromosoom (bv. hemofilie)"],
    workedExamplesEn: [
      {
        question: "In humans, brown eyes (B) are dominant over blue eyes (b). Two brown-eyed parents have a blue-eyed child. Show the cross and give the ratio of phenotypes expected.",
        steps: [
          "Blue-eyed child must be bb, so both parents must carry b → genotypes: Bb × Bb.",
          "Punnet square: BB, Bb, Bb, bb.",
          "Phenotype ratio: 3 brown (BB or Bb) : 1 blue (bb).",
          "Probability of blue-eyed child = 1/4 = 25%."
        ],
        solution: "Bb × Bb → 3 brown : 1 blue; P(blue) = 25%",
        commonErrors: ["Using BB × BB (then no blue-eyed child is possible)", "Forgetting that brown eyes can be BB or Bb — you must infer genotype from offspring"]
      },
      {
        question: "Haemophilia is X-linked recessive. A carrier mother (X^H X^h) and a normal father (X^H Y) have children. Predict the probability that a son will have haemophilia.",
        steps: [
          "Gametes: mother produces X^H and X^h; father produces X^H and Y.",
          "Punnet square: X^H X^H (normal daughter), X^H X^h (carrier daughter), X^H Y (normal son), X^h Y (haemophiliac son).",
          "Probability of haemophiliac son = 1/4 of all children = 1/2 of sons.",
          "P(haemophilia | son) = 50%."
        ],
        solution: "50% of sons will have haemophilia",
        commonErrors: ["Saying 25% of sons — that is the probability among ALL children, not just sons", "Daughters cannot have haemophilia in this cross (they always get at least one X^H from father)"]
      },
      {
        question: "What are the possible blood group genotypes of a parent with blood group AB, and what blood groups can their children have if the other parent has blood group O?",
        steps: [
          "Parent AB has genotype I^A I^B.",
          "Parent O has genotype ii.",
          "Cross I^A I^B × ii: offspring are I^A i (blood group A) or I^B i (blood group B).",
          "Possible blood groups of children: A or B only (never AB or O)."
        ],
        solution: "Children can have blood group A or B (50% each)",
        commonErrors: ["Expecting AB children — I^A I^B × ii cannot produce I^A I^B offspring", "Expecting O children — both alleles of parent AB contribute; neither i allele is present"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Bruin oë (B) dominant. Twee bruin-oë ouers het 'n blou-oë kind. Kruising en ratio?",
        steps: ["Blou kind = bb → ouers Bb × Bb.", "Punnet: 3 bruin : 1 blou."],
        solution: "Bb × Bb → 3 bruin : 1 blou; P(blou) = 25%",
        commonErrors: ["Gebruik BB × BB — dan is geen blou kind moontlik nie"]
      },
      {
        question: "Ma drakker (X^H X^h), Pa normaal (X^H Y). Seun met hemofilie?",
        steps: ["Punnet: X^H X^H, X^H X^h, X^H Y, X^h Y.", "P(hemofilie seun) = 1/4 van almal = 1/2 van seuns."],
        solution: "50% van seuns",
        commonErrors: ["Sê 25% seuns — dit is van ALLE kinders, nie net seuns nie"]
      },
      {
        question: "Ouer AB × O. Moontlike bloedgroepe van kinders?",
        steps: ["AB = I^A I^B; O = ii.", "Nageslag: I^A i (A) of I^B i (B)."],
        solution: "Kinders: bloedgroep A of B slegs",
        commonErrors: ["Verwag AB- of O-kinders — nie moontlik in hierdie kruising nie"]
      }
    ],
    diagramsEn: [
      {
        label: "Monohybrid Punnett Square: Bb × Bb (Eye Colour)",
        ascii: [
          "  Parents:  Bb (brown)  ×  Bb (brown)",
          "                          ",
          "         |   B   |   b   |",
          "  -------+-------+-------+",
          "    B    |  BB   |  Bb   |",
          "  -------+-------+-------+",
          "    b    |  Bb   |  bb   |",
          "  -------+-------+-------+",
          "",
          "  Genotype ratio:  1 BB : 2 Bb : 1 bb",
          "  Phenotype ratio: 3 brown (BB or Bb) : 1 blue (bb)",
          "  P(blue-eyed child) = 1/4 = 25%",
        ].join("\n"),
        caption: "Use a Punnett square to predict offspring ratios. The top row shows one parent's gametes; the left column shows the other parent's gametes.",
      },
      {
        label: "X-linked Punnett Square: Haemophilia (Carrier Mother)",
        ascii: [
          "  Mother: X^H X^h (carrier)  ×  Father: X^H Y",
          "",
          "           |   X^H  |   Y   |",
          "  ---------+--------+-------+",
          "  X^H      | X^H X^H| X^H Y |  normal daughter / normal son",
          "  ---------+--------+-------+",
          "  X^h      | X^H X^h| X^h Y |  carrier daughter / HAEMOPHILIAC son",
          "  ---------+--------+-------+",
          "",
          "  P(haemophiliac son) = 1/4 of all children",
          "  P(haemophilia | son) = 1/2 = 50%",
        ].join("\n"),
        caption: "For X-linked traits, only males (XY) can be affected by a recessive allele — they have no second X to mask it. Daughters need two copies to show the trait.",
      },
      {
        label: "Human Karyotype — Chromosome Pairs",
        ascii: [
          "  Normal Human Karyotype: 46 chromosomes = 23 pairs",
          "",
          "  Autosomes (pairs 1–22):",
          "  Pair 1:  ██  Pair 2:  ██  Pair 3:  ██  ...  Pair 22: ██",
          "           ██           ██           ██                  ██",
          "",
          "  Sex chromosomes (pair 23):",
          "  FEMALE:  XX        MALE:   XY",
          "           ██                ██",
          "           ██                █   ← Y is much smaller",
          "",
          "  Trisomy 21 (Down Syndrome): 47 chromosomes",
          "  Pair 21 has THREE chromosomes:  ██ ██ ██",
          "                                  ██ ██ ██",
          "",
          "  Karyotype is produced from a photomicrograph of metaphase chromosomes,",
          "  arranged by size, centromere position and banding pattern.",
        ].join("\n"),
        caption: "A karyotype arranges all chromosomes in homologous pairs by size. Humans have 22 pairs of autosomes + 1 pair of sex chromosomes (XX = female, XY = male). Trisomy (extra chromosome) and monosomy (missing chromosome) are detectable from a karyotype.",
      },
    ],
    diagramsAf: [
      {
        label: "Monohibriede Punnet-vierkant: Bb × Bb (Oogkleur)",
        ascii: [
          "  Ouers:  Bb (bruin)  ×  Bb (bruin)",
          "                          ",
          "         |   B   |   b   |",
          "  -------+-------+-------+",
          "    B    |  BB   |  Bb   |",
          "  -------+-------+-------+",
          "    b    |  Bb   |  bb   |",
          "  -------+-------+-------+",
          "",
          "  Genotipe-verhouding:  1 BB : 2 Bb : 1 bb",
          "  Fenotipe-verhouding: 3 bruin (BB of Bb) : 1 blou (bb)",
          "  P(blou-oë kind) = 1/4 = 25%",
        ].join("\n"),
        caption: "Gebruik 'n Punnet-vierkant om nageslag-verhoudings te voorspel. Boonste ry = een ouer se gamete; linkerkolom = ander ouer se gamete.",
      },
      {
        label: "X-gekoppelde Punnet-vierkant: Hemofilie (Dragende Ma)",
        ascii: [
          "  Ma: X^H X^h (drakker)  ×  Pa: X^H Y",
          "",
          "           |   X^H  |   Y   |",
          "  ---------+--------+-------+",
          "  X^H      | X^H X^H| X^H Y |  norm. dogter / norm. seun",
          "  ---------+--------+-------+",
          "  X^h      | X^H X^h| X^h Y |  drakker dogter / HEMOFILIES seun",
          "  ---------+--------+-------+",
          "",
          "  P(hemofilies seun) = 1/4 van alle kinders",
          "  P(hemofilie | seun) = 1/2 = 50%",
        ].join("\n"),
        caption: "Vir X-gekoppelde kenmerke kan slegs seuns (XY) deur 'n resessiewe alleel geaffekteer word — hulle het geen tweede X om dit te masker nie.",
      },
      {
        label: "Menslike Kariogram — Chromosoomkoppels",
        ascii: [
          "  Normale Menslike Kariogram: 46 chromosome = 23 pare",
          "",
          "  Outosoom (pare 1–22):",
          "  Paar 1: ██  Paar 2: ██  Paar 3: ██  ...  Paar 22: ██",
          "          ██          ██          ██                  ██",
          "",
          "  Geslagschromosome (paar 23):",
          "  VROULIK: XX        MANLIK:  XY",
          "           ██                ██",
          "           ██                █   ← Y is baie kleiner",
          "",
          "  Trisomie 21 (Downsindroom): 47 chromosome",
          "  Paar 21 het DRIE chromosome:  ██ ██ ██",
          "                                ██ ██ ██",
        ].join("\n"),
        caption: "ʼn Kariogram rangskik alle chromosome in homologe pare volgens grootte. Mense het 22 pare outosoom + 1 paar geslagschromosome (XX = vroulik, XY = manlik). Trisomie en monosomie is waarneembaar uit ʼn kariogram.",
      },
    ],
  },
  "LIFE-6": {
    summaryEn: "Darwinian natural selection, evidence for evolution, speciation and the punctuated vs gradual debate.",
    summaryAf: "Darwiniaanse natuurlike seleksie, bewyse vir evolusie, spesiasie en die punktualistiese vs geleidelike debat.",
    conceptsEn: ["Variation, heritability, differential survival = natural selection", "Fossil record, comparative anatomy, biogeography", "Allopatric vs sympatric speciation"],
    conceptsAf: ["Variasie, oorerflikheid, verskillende oorlewing = natuurlike seleksie", "Fossielrekord, vergelykende anatomie, biogeografie", "Allopatriese vs simpatriese spesiasie"],
    workedExamplesEn: [
      {
        question: "Explain how Darwin's four observations lead to the conclusion of natural selection.",
        steps: [
          "Observation 1: Individuals in a population show variation (differences in traits).",
          "Observation 2: Some variation is heritable (passed from parents to offspring).",
          "Observation 3: More offspring are produced than can survive (struggle for existence).",
          "Observation 4: Individuals with favourable traits survive and reproduce more (differential reproductive success).",
          "Conclusion: Favourable traits become more common over generations — natural selection."
        ],
        solution: "Variation + Heritability + Overproduction + Differential survival → Natural selection",
        commonErrors: ["Saying organisms 'choose' to change (Lamarckian thinking)", "Forgetting that natural selection acts on existing variation — it does not cause new mutations"]
      },
      {
        question: "State THREE pieces of evidence for evolution and briefly explain how each supports the theory.",
        steps: [
          "1. Fossil record: shows sequential changes in life forms over geological time; transitional fossils show intermediate forms.",
          "2. Comparative anatomy: homologous structures (e.g. pentadactyl limb in humans, whales, bats) indicate common ancestry despite different functions.",
          "3. Biogeography: related species are found in geographically adjacent regions (e.g. Galapagos finches), suggesting divergence from a common ancestor after geographic separation."
        ],
        solution: "Fossils, homologous structures, biogeographic distribution — all consistent with common ancestry",
        commonErrors: ["Confusing homologous (same origin, different function) with analogous (same function, different origin) structures", "Saying vestigial structures are evidence against evolution — they are evidence FOR it (remnants of ancestral structures)"]
      },
      {
        question: "Distinguish between allopatric and sympatric speciation with an example of each.",
        steps: [
          "Allopatric speciation: populations become geographically separated (by mountain, river, distance) → no gene flow → independent evolution → reproductive isolation → new species. Example: Galapagos finches (island isolation).",
          "Sympatric speciation: new species form within the SAME geographic area → reproductive isolation via different behaviour, time of breeding, or polyploidy. Example: cichlid fish in African lakes, or polyploid plants (e.g. allotetraploid wheat)."
        ],
        solution: "Allopatric = geographic barrier (Galapagos finches); Sympatric = same area (cichlids or polyploid plants)",
        commonErrors: ["Saying allopatric means different countries — the key is geographical/physical BARRIER preventing gene flow", "Forgetting that sympatric speciation requires reproductive isolation even without a physical barrier"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Darwin se vier waarnemings → natuurlike seleksie.",
        steps: ["Variasie + Oorerflikheid + Oorproduksie + Differensiële oorlewing → Natuurlike seleksie."],
        solution: "Variasie, Oorerflikheid, Oorproduksie, Differensiële oorlewing",
        commonErrors: ["Sê organismes 'kies' om te verander (Lamarckiaans)"]
      },
      {
        question: "Drie bewyse vir evolusie.",
        steps: ["1. Fossielrekord (oorgangsvorme).", "2. Vergelykende anatomie (homologe struktuur).", "3. Biogeografie (verwante spesies naburige gebiede)."],
        solution: "Fossiele, homologe structure, biogeografie",
        commonErrors: ["Verwar homoloog (selfde oorsprong) met analoog (selfde funksie)"]
      },
      {
        question: "Verskil: allopatriese vs simpatriese spesiasie.",
        steps: ["Allopaties: geografiese versperring → geen geenvloei → nuwe spesies (bv. Galapagos).", "Simpaties: selfde gebied, voortplantingsisolasie (bv. sigliede)."],
        solution: "Allopatries = geografiese versperring; Simpatries = selfde gebied",
        commonErrors: ["Sê allopatries beteken verskillende lande — versperring is die sleutel"]
      }
    ],
  },
  "LIFE-7": {
    summaryEn: "Hominid evolution, key fossil discoveries (Australopithecus, Homo) and African origins.",
    summaryAf: "Hominied-evolusie, sleutel fossielontdekkings (Australopithecus, Homo) en Afrika-oorsprong.",
    conceptsEn: ["Bipedalism is a key hominid trait", "Brain size increased over time", "Out-of-Africa hypothesis"],
    conceptsAf: ["Tweevoetigheid is 'n sleutel hominied-eienskap", "Breingrootte het mettertyd toegeneem", "Uit-Afrika hipotese"],
    workedExamplesEn: [
      {
        question: "List FOUR skeletal features that distinguish hominids from non-hominid primates and explain how each is linked to bipedalism.",
        steps: [
          "1. Foramen magnum is positioned centrally (under the skull) → head balanced vertically on spine for upright walking.",
          "2. S-shaped spine (lumbar curve) → absorbs shock and keeps centre of gravity over the feet.",
          "3. Broad, basin-shaped pelvis → supports the weight of internal organs during upright posture.",
          "4. Non-opposable big toe (hallux), aligned with other toes → provides a stable push-off surface for walking."
        ],
        solution: "Central foramen magnum, S-shaped spine, broad pelvis, aligned big toe — all adaptations for bipedalism",
        commonErrors: ["Saying the foramen magnum is at the BACK for bipeds — it is at the base/centre", "Confusing hominid features with general primate features"]
      },
      {
        question: "Compare Australopithecus africanus and Homo habilis in terms of brain size, tool use and diet.",
        steps: [
          "A. africanus (3–2.5 mya): brain ~450–500 cc; no confirmed stone tools; largely herbivorous/omnivorous.",
          "Homo habilis (2.4–1.5 mya): brain ~500–640 cc; associated with Oldowan stone tools; more omnivorous (meat eating increased).",
          "Trend: increased brain size, tool use, and dietary flexibility from Australopithecus → Homo."
        ],
        solution: "A. africanus: ~450–500 cc, no tools, mainly plant-based; H. habilis: ~500–640 cc, Oldowan tools, more omnivorous",
        commonErrors: ["Saying A. africanus made stone tools — current evidence shows no confirmed tools", "Mixing up H. habilis with H. erectus (H. erectus had larger brain and Acheulean tools)"]
      },
      {
        question: "Explain the Out-of-Africa hypothesis and state TWO pieces of evidence that support it.",
        steps: [
          "Hypothesis: modern Homo sapiens originated in Africa ~200 000 years ago and migrated out to populate the rest of the world.",
          "Evidence 1: Oldest H. sapiens fossils (Jebel Irhoud, Morocco, ~315 kya; Omo remains, Ethiopia) are found in Africa.",
          "Evidence 2: Mitochondrial DNA analysis shows that African populations have the greatest genetic diversity — consistent with being the oldest population."
        ],
        solution: "H. sapiens originated in Africa; supported by oldest fossils and greatest African genetic diversity",
        commonErrors: ["Confusing Out-of-Africa with the Multiregional hypothesis (where modern humans evolved in different regions simultaneously)", "Saying H. erectus supports Out-of-Africa — it migrated out earlier but is not modern H. sapiens"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Vier skeletkenmreke van hominide gekoppel aan tweevoetigheid.",
        steps: ["Senter foramen magnum → kop regop.", "S-vormige ruggraat → skok absorbeer.", "Breë pelvis → organe ondersteun.", "Uitgerykte duim → stabiele stap."],
        solution: "Senter foramen magnum, S-ruggraat, breë pelvis, uitgerykte duim",
        commonErrors: ["Sê foramen magnum is agter by tweevoetigers — dit is in die middel/basis"]
      },
      {
        question: "Vergelyk A. africanus en H. habilis: brein, gereedskap, dieet.",
        steps: ["A. africanus: ~450 cc, geen gereedskap, hoofsaaklik planteëter.", "H. habilis: ~550 cc, Oldowan-gereedskap, meer omnivories."],
        solution: "A. africanus: ~450 cc, geen gereedskap; H. habilis: ~550 cc, Oldowan",
        commonErrors: ["Sê A. africanus het gereedskap gemaak"]
      },
      {
        question: "Uit-Afrika hipotese en twee bewyse.",
        steps: ["H. sapiens ontstaan in Afrika ~200 000 jr gelede.", "Bewys 1: Oudste fossiele in Afrika.", "Bewys 2: Grootste genetiese diversiteit in Afrika (mtDNS)."],
        solution: "Oudste fossiele + grootste mtDNS-diversiteit in Afrika",
        commonErrors: ["Verwar met Multirégionale hipotese"]
      }
    ],
  },
  "LIFE-8": {
    summaryEn: "Structure and function of the human nervous system: CNS vs PNS, the reflex arc, and brain regions.",
    summaryAf: "Struktuur en funksie van die menslike senuweestelsel: SSS vs PSS, die reflex boog, en breingebiede.",
    conceptsEn: ["Neuron parts: dendrites, axon, myelin", "Reflex arc: receptor → sensory → CNS → motor → effector", "Cerebrum, cerebellum, medulla functions"],
    conceptsAf: ["Neuron dele: dendriete, akson, miëlien", "Reflex boog: reseptor → sensories → SSS → motor → effektor", "Serebrum, serebellum, medulla funksies"],
    workedExamplesEn: [
      {
        question: "Describe the pathway of a spinal reflex arc when you accidentally touch a hot surface. Name all components in order.",
        steps: [
          "1. Receptor (skin pain receptors) — detects the stimulus (heat/pain).",
          "2. Sensory (afferent) neuron — conducts impulse towards the spinal cord.",
          "3. Interneuron (relay neuron) in the spinal cord — connects sensory and motor neurons.",
          "4. Motor (efferent) neuron — conducts impulse away from the spinal cord to the effector.",
          "5. Effector (muscle) — contracts, withdrawing the hand. (Pain sensation is later interpreted by the cerebrum.)"
        ],
        solution: "Receptor → sensory neuron → interneuron (spinal cord) → motor neuron → effector (muscle)",
        commonErrors: ["Including the brain as part of the reflex arc — spinal reflexes bypass the brain (though the brain is informed afterwards)", "Reversing afferent and efferent: afferent = TOWARDS CNS; efferent = AWAY from CNS (A = Afferent = Arriving)"]
      },
      {
        question: "State the functions of the cerebrum, cerebellum, and medulla oblongata.",
        steps: [
          "Cerebrum (large, outer cortex): higher functions — conscious thought, voluntary movement, memory, speech, vision, hearing.",
          "Cerebellum (behind and below cerebrum): coordinates movement, balance and posture.",
          "Medulla oblongata (brain stem): controls involuntary/autonomic functions — breathing, heart rate, swallowing, blood pressure."
        ],
        solution: "Cerebrum = thought/voluntary; Cerebellum = coordination/balance; Medulla = involuntary (breathing, heart rate)",
        commonErrors: ["Saying the cerebellum controls thinking — that is the cerebrum", "Saying the medulla controls balance — balance is the cerebellum"]
      },
      {
        question: "Explain how the myelin sheath speeds up nerve impulse conduction.",
        steps: [
          "Myelin is a fatty (lipid) insulating layer around axons of some neurons.",
          "It prevents ion flow across the membrane except at gaps called Nodes of Ranvier.",
          "The impulse 'jumps' from node to node (saltatory conduction) instead of travelling continuously along the entire axon.",
          "Result: much faster conduction speed in myelinated fibres than unmyelinated ones."
        ],
        solution: "Myelin insulates axon; impulse jumps between Nodes of Ranvier (saltatory conduction) → faster transmission",
        commonErrors: ["Saying myelin 'carries' the impulse — it insulates to speed it up, not carry it", "Forgetting the role of Nodes of Ranvier in saltatory conduction"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Refleksboog: raak warm oppervlak. Komponente in volgorde.",
        steps: ["1. Reseptor → 2. Sensoriese neuron → 3. Interneuron (rugmurg) → 4. Motoriese neuron → 5. Effektor (spier)."],
        solution: "Reseptor → sensories → interneuron → motories → effektor",
        commonErrors: ["Sluit brein in as deel van refleksboog — rugmurgreflekse vermy brein"]
      },
      {
        question: "Funksies: serebrum, serebellum, medulla oblongata.",
        steps: ["Serebrum: bewuste denke/vrywillige beweging.", "Serebellum: koördinasie/balans.", "Medulla: onvrywillig (asemhaling, hartklop)."],
        solution: "Serebrum=denke; Serebellum=koördinasie; Medulla=onvrywillig",
        commonErrors: ["Sê serebellum beheer denke"]
      },
      {
        question: "Hoe versnel mielienomhulsel impuls?",
        steps: ["Mielien isoleer akson.", "Impuls spring van knoop tot knoop (saltatorêr).", "Vinniger as sonder mielien."],
        solution: "Saltatorêre geleiding by Ranvier-knope → vinniger",
        commonErrors: ["Sê mielien 'dra' impuls — dit isoleer net"]
      }
    ],
    diagramsEn: [
      {
        label: "Spinal Reflex Arc — Component Pathway",
        ascii: [
          "  STIMULUS (hot surface)",
          "       |",
          "  [1] RECEPTOR (skin pain receptor)",
          "       | impulse",
          "  [2] SENSORY (afferent) NEURON ─────────────────────┐",
          "       |                                              │",
          "  [3] INTERNEURON (relay neuron in spinal cord)       │ SPINAL",
          "       |                                              │ CORD",
          "  [4] MOTOR (efferent) NEURON ───────────────────────┘",
          "       | impulse",
          "  [5] EFFECTOR (muscle contracts → hand withdraws)",
          "",
          "  ↑ The whole arc happens WITHOUT the brain.",
          "  The brain is informed afterwards via ascending tracts.",
        ].join("\n"),
        caption: "Afferent = Arriving at CNS (sensory). Efferent = Exiting CNS (motor). The reflex arc is involuntary — it bypasses conscious brain processing for speed.",
      },
      {
        label: "Structure of a Motor Neuron",
        ascii: [
          "        Dendrites",
          "         \\  |  /",
          "          \\ | /",
          "       [CELL BODY] ← nucleus here",
          "            |",
          "           AXON",
          "            |    ╔══════════╗",
          "            |    ║  MYELIN  ║  (fatty insulating sheath)",
          "            |    ╚══════════╝",
          "           Node of Ranvier (gap in myelin)",
          "            |",
          "     AXON TERMINALS (synaptic knobs)",
          "         /  |  \\",
          "   → neurotransmitters cross synapse to next cell",
        ].join("\n"),
        caption: "Myelin speeds up transmission by saltatory conduction — the impulse 'jumps' from node to node instead of travelling continuously along the entire axon length.",
      },
    ],
    diagramsAf: [
      {
        label: "Spinale Refleksboog — Komponent Pad",
        ascii: [
          "  STIMULUS (warm oppervlak)",
          "       |",
          "  [1] RESEPTOR (hudpynreseptor)",
          "       | impuls",
          "  [2] SENSORIESE (afferente) NEURON ──────────────────┐",
          "       |                                              │",
          "  [3] INTERNEURON (relaai-neuron in rugmurg)          │ RUGMURG",
          "       |                                              │",
          "  [4] MOTORIESE (efferente) NEURON ───────────────────┘",
          "       | impuls",
          "  [5] EFFEKTOR (spier trek saam → hand word teruggetrek)",
          "",
          "  ↑ Die hele boog gebeur SONDER die brein.",
          "  Die brein word daarna ingelig via opklimmende bane.",
        ].join("\n"),
        caption: "Afferent = Aankomend by SSS (sensories). Efferent = Uittree uit SSS (motories). Die refleksboog is onvrywillig — dit vermy bewuste breinverwerking vir spoed.",
      },
      {
        label: "Struktuur van 'n Motoriese Neuron",
        ascii: [
          "        Dendriete",
          "         \\  |  /",
          "          \\ | /",
          "       [SELLIGGAAM] ← kern hier",
          "            |",
          "          AKSON",
          "            |    ╔══════════╗",
          "            |    ║  MIELIEN ║  (vetterige isolerende omhulsel)",
          "            |    ╚══════════╝",
          "          Ranvier-knoop (gaping in mielien)",
          "            |",
          "    AKSONTERMINALS (sinaptiese knoppe)",
          "         /  |  \\",
          "   → neurotransmiters steek sinaps oor na volgende sel",
        ].join("\n"),
        caption: "Mielien versnel geleiding deur saltatorêre geleiding — die impuls 'spring' van knoop tot knoop in plaas van deur die hele akson.",
      },
    ],
  },
  "LIFE-9": {
    summaryEn: "Major endocrine glands and hormones, including pituitary, thyroid, pancreas, adrenals, gonads.",
    summaryAf: "Hoof endokriene kliere en hormone, insluitend hipofise, tiroïed, pankreas, byniere, gonades.",
    conceptsEn: ["Insulin & glucagon regulate blood sugar", "TSH from pituitary stimulates thyroid", "Adrenaline = fight-or-flight"],
    conceptsAf: ["Insulien en glukagon reguleer bloedsuiker", "TSH uit hipofise stimuleer tiroïed", "Adrenalien = veg-of-vlug"],
    workedExamplesEn: [
      {
        question: "Describe the negative feedback loop that regulates blood glucose levels, naming all organs and hormones involved.",
        steps: [
          "Blood glucose rises (e.g. after eating) → detected by beta cells in the islets of Langerhans in the pancreas.",
          "Pancreas secretes INSULIN → liver takes up glucose and converts it to glycogen (glycogenesis); cells take up glucose.",
          "Blood glucose falls back to normal → insulin secretion decreases.",
          "If blood glucose falls too low → alpha cells secrete GLUCAGON → liver breaks down glycogen to glucose (glycogenolysis) → blood glucose rises."
        ],
        solution: "High glucose → insulin (β-cells) → glycogenesis → glucose ↓. Low glucose → glucagon (α-cells) → glycogenolysis → glucose ↑",
        commonErrors: ["Confusing insulin (lowers blood glucose) with glucagon (raises blood glucose)", "Saying the liver produces insulin — insulin is produced by the pancreas; the liver responds to it"]
      },
      {
        question: "State the role of adrenaline in the fight-or-flight response. Give FOUR physiological changes it causes.",
        steps: [
          "Source: adrenal medulla (inner part of adrenal glands above kidneys).",
          "Trigger: stress, fear, danger.",
          "Effects: (1) heart rate increases; (2) blood directed to muscles (vasodilation in muscles); (3) liver releases glucose (glycogenolysis); (4) pupils dilate for better vision; (5) bronchioles dilate for more O₂."
        ],
        solution: "Adrenaline → ↑heart rate, glucose release, muscle blood flow, pupil dilation, bronchiole dilation",
        commonErrors: ["Saying adrenaline is secreted by the adrenal cortex (it is the medulla)", "Confusing adrenaline effects with insulin effects"]
      },
      {
        question: "Explain how TSH, TRH and thyroxine form a negative feedback loop.",
        steps: [
          "Hypothalamus detects low thyroxine → releases TRH (thyrotropin-releasing hormone).",
          "TRH stimulates pituitary → releases TSH (thyroid-stimulating hormone).",
          "TSH stimulates thyroid gland → releases thyroxine.",
          "Rising thyroxine feeds back to hypothalamus and pituitary → inhibits further TRH and TSH release → negative feedback loop."
        ],
        solution: "Low thyroxine → TRH → TSH → thyroxine ↑ → negative feedback inhibits TRH/TSH",
        commonErrors: ["Confusing TRH (from hypothalamus) with TSH (from pituitary)", "Saying thyroxine stimulates more TSH — it INHIBITS TSH (negative feedback)"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Negatiewe terugvoer: bloedglukose regulering. Organe en hormone.",
        steps: ["Glukose ↑ → insulien (β-selle) → glikogenese → glukose ↓.", "Glukose ↓ → glukagon (α-selle) → glikogenolise → glukose ↑."],
        solution: "Insulien (↓ glukose) en glukagon (↑ glukose) via pankreas",
        commonErrors: ["Sê lewer produseer insulien — pankreas produseer insulien"]
      },
      {
        question: "Adrenalien: vier fisiologiese veranderinge.",
        steps: ["Hartklop ↑.", "Spiere kry meer bloed.", "Lewer vry glukose.", "Pupille vergroot."],
        solution: "↑hartklop, ↑spierbloed, glukose vry, pupille vergroot",
        commonErrors: ["Sê adrenalien uit adrenale korteks — dit is die MEDULLA"]
      },
      {
        question: "TSH, TRH, tiroksien: negatiewe terugvoer.",
        steps: ["Lae tiroksien → TRH (hipotalamus) → TSH (hipofise) → tiroksien ↑.", "Hoë tiroksien inhibeer TRH/TSH."],
        solution: "Lae tiroksien → TRH → TSH → tiroksien; hoë tiroksien inhibeer TRH/TSH",
        commonErrors: ["Sê tiroksien stimuleer TSH — dit INHIBEER dit"]
      }
    ],
    diagramsEn: [
      {
        label: "Blood Glucose Negative Feedback Loop",
        ascii: [
          "                 NORMAL blood glucose (~90 mg/dL)",
          "                  ^                        |",
          "                  |                        v",
          "   glucose ↓ back to normal       blood glucose RISES",
          "                  ^                  (after eating)",
          "                  |                        |",
          "          liver stores glucose             v",
          "          as glycogen + cells       β-cells (pancreas)",
          "          take up glucose           secrete INSULIN",
          "                  ^________________________|",
          "",
          "  -------------- opposite direction --------------",
          "",
          "                  |                        ^",
          "                  v                        |",
          "   blood glucose FALLS (fasting)   glucose ↑ to normal",
          "                  |                        ^",
          "                  v                        |",
          "          α-cells (pancreas)        liver breaks glycogen",
          "          secrete GLUCAGON  ------> into glucose",
          "",
          "  INSULIN lowers glucose | GLUCAGON raises glucose",
          "  Both from islets of Langerhans in the PANCREAS",
        ].join("\n"),
        caption: "Blood glucose is held near a set point by two opposing hormones from the pancreas. High glucose → insulin → liver stores glycogen (glucose falls). Low glucose → glucagon → liver releases glucose (glucose rises). This self-correcting cycle is negative feedback.",
      },
      {
        label: "Thyroxine Negative Feedback (Hypothalamus–Pituitary–Thyroid)",
        ascii: [
          "        HYPOTHALAMUS",
          "            |  releases TRH",
          "            v",
          "        PITUITARY gland",
          "            |  releases TSH",
          "            v",
          "        THYROID gland",
          "            |  releases THYROXINE",
          "            v",
          "     ↑ metabolic rate in body cells",
          "            |",
          "   rising thyroxine in blood",
          "            |",
          "   ( ⊖ NEGATIVE FEEDBACK )",
          "            |",
          "   inhibits  --→ HYPOTHALAMUS (less TRH)",
          "            \\--→ PITUITARY  (less TSH)",
          "",
          "  Low thyroxine → MORE TRH/TSH → thyroid makes more.",
          "  High thyroxine → LESS TRH/TSH → thyroid slows down.",
        ].join("\n"),
        caption: "The hypothalamus (TRH) drives the pituitary (TSH), which drives the thyroid (thyroxine). Rising thyroxine feeds back to inhibit both the hypothalamus and pituitary, keeping thyroxine within a narrow range — a classic negative feedback loop.",
      },
    ],
    diagramsAf: [
      {
        label: "Bloedglukose Negatiewe Terugvoerlus",
        ascii: [
          "                 NORMALE bloedglukose (~90 mg/dL)",
          "                  ^                        |",
          "                  |                        v",
          "   glukose ↓ terug na normaal     bloedglukose STYG",
          "                  ^                  (na ete)",
          "                  |                        |",
          "          lewer stoor glukose              v",
          "          as glikogeen + selle      β-selle (pankreas)",
          "          neem glukose op           skei INSULIEN af",
          "                  ^________________________|",
          "",
          "  -------------- teenoorgestelde rigting ----------",
          "",
          "                  |                        ^",
          "                  v                        |",
          "   bloedglukose DAAL (vas)         glukose ↑ na normaal",
          "                  |                        ^",
          "                  v                        |",
          "          α-selle (pankreas)        lewer breek glikogeen",
          "          skei GLUKAGON af  ------> af na glukose",
          "",
          "  INSULIEN verlaag glukose | GLUKAGON verhoog glukose",
          "  Albei uit eilandjies van Langerhans in die PANKREAS",
        ].join("\n"),
        caption: "Bloedglukose word naby 'n stelpunt gehou deur twee teenoorgestelde hormone uit die pankreas. Hoë glukose → insulien → lewer stoor glikogeen (glukose daal). Lae glukose → glukagon → lewer laat glukose vry (glukose styg). Hierdie selfkorrigerende siklus is negatiewe terugvoer.",
      },
      {
        label: "Tiroksien Negatiewe Terugvoer (Hipotalamus–Hipofise–Tiroïed)",
        ascii: [
          "        HIPOTALAMUS",
          "            |  skei TRH af",
          "            v",
          "        HIPOFISE-klier",
          "            |  skei TSH af",
          "            v",
          "        TIROÏED-klier",
          "            |  skei TIROKSIEN af",
          "            v",
          "     ↑ metaboliese tempo in liggaamselle",
          "            |",
          "   stygende tiroksien in bloed",
          "            |",
          "   ( ⊖ NEGATIEWE TERUGVOER )",
          "            |",
          "   inhibeer  --→ HIPOTALAMUS (minder TRH)",
          "            \\--→ HIPOFISE  (minder TSH)",
          "",
          "  Lae tiroksien → MEER TRH/TSH → tiroïed maak meer.",
          "  Hoë tiroksien → MINDER TRH/TSH → tiroïed vertraag.",
        ].join("\n"),
        caption: "Die hipotalamus (TRH) dryf die hipofise (TSH), wat die tiroïed (tiroksien) dryf. Stygende tiroksien gee terugvoer om beide die hipotalamus en hipofise te inhibeer, wat tiroksien binne 'n nou reeks hou — 'n klassieke negatiewe terugvoerlus.",
      },
    ],
  },
  "LIFE-10": {
    summaryEn: "Negative feedback regulation of body temperature, blood glucose and water balance (osmoregulation).",
    summaryAf: "Negatiewe terugvoer regulering van liggaamstemperatuur, bloedglukose en waterbalans (osmoregulering).",
    conceptsEn: ["Hypothalamus is the body's thermostat", "Insulin lowers, glucagon raises blood glucose", "ADH from pituitary increases water reabsorption in kidneys"],
    conceptsAf: ["Hipotalamus is die liggaam se termostaat", "Insulien verlaag, glukagon verhoog bloedglukose", "ADH uit hipofise verhoog waterabsorpsie in niere"],
    workedExamplesEn: [
      {
        question: "Describe the negative feedback responses that occur when body temperature rises above 37°C.",
        steps: [
          "Thermoreceptors in the skin and hypothalamus detect the rise.",
          "Hypothalamus (thermostat) sends nerve signals and hormonal messages to effectors.",
          "Response 1 — vasodilation: blood vessels near skin surface widen → more heat lost by radiation.",
          "Response 2 — sweating: sweat glands produce sweat → evaporation removes heat.",
          "As temperature falls back to 37°C, the hypothalamus reduces these responses (negative feedback)."
        ],
        solution: "High temp → hypothalamus → vasodilation + sweating → temperature ↓ → negative feedback",
        commonErrors: ["Saying shivering occurs when temperature is too HIGH — shivering is a response to LOW temperature", "Forgetting that BOTH vasodilation AND sweating occur (not one or the other)"]
      },
      {
        question: "Explain the role of ADH (antidiuretic hormone) in osmoregulation when the body is dehydrated.",
        steps: [
          "Dehydration → blood osmolarity increases (too concentrated).",
          "Osmoreceptors in hypothalamus detect this → hypothalamus sends signal to posterior pituitary.",
          "Posterior pituitary releases ADH into blood.",
          "ADH acts on collecting ducts in kidneys → increases permeability to water → more water reabsorbed into blood.",
          "Urine becomes small in volume and concentrated. Blood osmolarity returns to normal → ADH release decreases (negative feedback)."
        ],
        solution: "Dehydration → ADH from pituitary → kidneys reabsorb more water → concentrated urine → blood osmolarity returns to normal",
        commonErrors: ["Saying ADH is produced in the pituitary — it is PRODUCED in the hypothalamus but RELEASED from the posterior pituitary", "Saying ADH causes large volumes of dilute urine — that is what happens WITHOUT ADH (or in diabetes insipidus)"]
      },
      {
        question: "Compare the thermoregulatory mechanisms of an endotherm (bird) and an ectotherm (lizard) when placed in a cold environment.",
        steps: [
          "Endotherm (bird): generates heat internally via metabolism; responds to cold by increasing metabolic rate, shivering, fluffing feathers (insulation), reducing blood flow to extremities (vasoconstriction).",
          "Ectotherm (lizard): relies on external heat; in cold environment body temperature drops; behavioural responses: bask in sun, press against warm rocks; metabolic processes slow down significantly.",
          "Key difference: endotherms maintain constant internal temperature; ectotherms' temperature fluctuates with the environment."
        ],
        solution: "Endotherm: internal heat generation (shivering, metabolism); Ectotherm: behavioural thermoregulation (basking)",
        commonErrors: ["Calling ectotherms 'cold-blooded' — their blood is NOT cold; its temperature just matches the environment", "Saying ectotherms cannot regulate temperature at all — they use behaviour to thermoregulate"]
      }
    ],
    workedExamplesAf: [
      {
        question: "Negatiewe terugvoer as liggaamstemperatuur bo 37°C styg.",
        steps: ["Hipotalamus bespeur styging.", "Vasodilasie + sweet → hitte verloor.", "Temperatuur daal → terugvoer stop reaksie."],
        solution: "Vasodilasie + sweet → temperatuur ↓ → negatiewe terugvoer",
        commonErrors: ["Sê bewe as temperatuur TE HOOG is — bewe is by lae temperatuur"]
      },
      {
        question: "ADH se rol tydens dehidrasie.",
        steps: ["Bloed te gekonsentreerd → hipotalamus bespeur → agterhipofise vry ADH.", "Niere herborbing meer water → klein, gekonsentreerde urine.", "Osmolaliteit normaliseer → ADH daal."],
        solution: "ADH → meer waterherborging → gekonsentreerde urine → bloed normaal",
        commonErrors: ["Sê ADH word in hipofise geproduseer — dit word in hipotalamus geproduseer"]
      },
      {
        question: "Vergelyk endoterm (voël) en ektoterm (akkedis) in koue omgewing.",
        steps: ["Endoterm: interne hitte (bewe, metabolisme) → konstante temp.", "Ektoterm: gedrag (sonbasking) → temp volg omgewing."],
        solution: "Endoterm: interne hitte; Ektoterm: gedragsregulering",
        commonErrors: ["Sê ektoterme het 'koue bloed' — hul bloed is nie koud nie, net wisselend"]
      }
    ],
    diagramsEn: [
      {
        label: "Thermoregulation — Negative Feedback (Body Temp 37°C)",
        ascii: [
          "             SET POINT: body temp = 37°C",
          "             ^                         |",
          "             |                         v",
          "   temp falls back to 37°C    temp RISES above 37°C",
          "             ^                         |",
          "             |                  hypothalamus detects",
          "   heat lost from skin                 |",
          "   • VASODILATION (skin                v",
          "     vessels widen)            sends signals to skin",
          "   • SWEATING (evaporation)    • sweat glands ON",
          "             ^                  • arterioles dilate",
          "             |_________________________|",
          "",
          "  --------------- if temp DROPS below 37°C ---------------",
          "",
          "   hypothalamus detects cooling →",
          "   • VASOCONSTRICTION (skin vessels narrow → less heat lost)",
          "   • SHIVERING (muscles generate heat)",
          "   • erector muscles raise hairs (trap warm air)",
          "       → temp rises back to 37°C (negative feedback)",
        ].join("\n"),
        caption: "The hypothalamus acts as a thermostat set to 37°C. When too hot: vasodilation + sweating lose heat. When too cold: vasoconstriction + shivering generate/retain heat. Each response reverses the change — negative feedback.",
      },
      {
        label: "ADH & Osmoregulation — Negative Feedback Loop",
        ascii: [
          "          NORMAL blood water balance (osmolarity)",
          "           ^                              |",
          "           |                              v",
          "   blood osmolarity returns        DEHYDRATION:",
          "   to normal → ADH ↓               blood too concentrated",
          "           ^                              |",
          "           |                       osmoreceptors in",
          "   kidney collecting ducts         hypothalamus detect",
          "   reabsorb MORE water                    |",
          "   → small, concentrated urine            v",
          "           ^                       posterior pituitary",
          "           |                       releases ADH",
          "           |______________________________|",
          "",
          "  Opposite case (TOO MUCH water / overhydration):",
          "  low osmolarity → LESS ADH → ducts reabsorb little water",
          "  → large volume of dilute urine → balance restored",
          "",
          "  NOTE: ADH is MADE in hypothalamus, RELEASED by pituitary.",
        ].join("\n"),
        caption: "When the blood is too concentrated (dehydration), the hypothalamus signals the posterior pituitary to release ADH, making the kidneys reabsorb more water (concentrated urine). When too dilute, ADH falls and dilute urine is made. This keeps water balance steady by negative feedback.",
      },
    ],
    diagramsAf: [
      {
        label: "Termoregulering — Negatiewe Terugvoer (Liggaamstemp 37°C)",
        ascii: [
          "             STELPUNT: liggaamstemp = 37°C",
          "             ^                         |",
          "             |                         v",
          "   temp daal terug na 37°C    temp STYG bo 37°C",
          "             ^                         |",
          "             |                  hipotalamus bespeur",
          "   hitte verloor van vel               |",
          "   • VASODILASIE (velvate               v",
          "     verwyd)                   stuur seine na vel",
          "   • SWEET (verdamping)        • sweetkliere AAN",
          "             ^                  • arteriole verwyd",
          "             |_________________________|",
          "",
          "  --------------- as temp DAAL onder 37°C ---------------",
          "",
          "   hipotalamus bespeur afkoeling →",
          "   • VASOKONSTRIKSIE (velvate vernou → minder hitteverlies)",
          "   • BEWE (spiere genereer hitte)",
          "   • haarregterspiere lig hare op (vang warm lug)",
          "       → temp styg terug na 37°C (negatiewe terugvoer)",
        ].join("\n"),
        caption: "Die hipotalamus tree op as 'n termostaat ingestel op 37°C. Te warm: vasodilasie + sweet verloor hitte. Te koud: vasokonstriksie + bewe genereer/behou hitte. Elke reaksie keer die verandering om — negatiewe terugvoer.",
      },
      {
        label: "ADH & Osmoregulering — Negatiewe Terugvoerlus",
        ascii: [
          "          NORMALE bloed-waterbalans (osmolaliteit)",
          "           ^                              |",
          "           |                              v",
          "   bloed-osmolaliteit keer         DEHIDRASIE:",
          "   terug na normaal → ADH ↓        bloed te gekonsentreerd",
          "           ^                              |",
          "           |                       osmoreseptore in",
          "   nier-versamelbuise              hipotalamus bespeur",
          "   herborbeer MEER water                  |",
          "   → klein, gekonsentreerde urine         v",
          "           ^                       agter-hipofise",
          "           |                       laat ADH vry",
          "           |______________________________|",
          "",
          "  Teenoorgestelde geval (TE VEEL water / oorhidrasie):",
          "  lae osmolaliteit → MINDER ADH → buise herborbeer min water",
          "  → groot volume verdunde urine → balans herstel",
          "",
          "  LET WEL: ADH word in hipotalamus GEMAAK, deur hipofise VRYGELAAT.",
        ].join("\n"),
        caption: "Wanneer die bloed te gekonsentreerd is (dehidrasie), sein die hipotalamus die agter-hipofise om ADH vry te laat, wat die niere meer water laat herborbeer (gekonsentreerde urine). Wanneer te verdun, daal ADH en verdunde urine word gemaak. Dit hou waterbalans stabiel deur negatiewe terugvoer.",
      },
    ],
  },

  // --------------------- ENGLISH HOME LANGUAGE ---------------------
  "ENGH-1": { summaryEn: "Approaching the Grade 12 prescribed novel: plot, character, theme, narrative voice and contextual influences.", summaryAf: "Benadering van die graad 12 voorgeskrewe roman: intrige, karakter, tema, vertellersstem en kontekstuele invloede.", conceptsEn: ["Plot structure: exposition–rising action–climax–resolution", "First-person vs third-person narrators (reliable vs unreliable)", "Theme is a universal idea developed through events, characters and symbols"], conceptsAf: ["Verhaalstruktuur: ekspos­isie–stygende aksie–klimaks–resolusie", "Eerstepersoons vs derdepersoons vertellers (betroubaar vs onbetroubaar)", "Tema is 'n universele idee ontwikkel deur gebeure, karakters en simbole"] },
  "ENGH-2": { summaryEn: "Drama study: dramatic structure, dialogue, stage directions, dramatic irony and Shakespearean conventions.", summaryAf: "Dramastudie: dramatiese struktuur, dialoog, toneelaanwysings, dramatiese ironie en Shakespeariese konvensies.", conceptsEn: ["Acts and scenes structure", "Soliloquy reveals character interiority", "Dramatic irony: audience knows more than the characters"], conceptsAf: ["Bedrywe en tonele struktuur", "Aleenspraak (soliloquy) onthul karakter-binnekant", "Dramatiese ironie: gehoor weet meer as die karakters"] },
  "ENGH-3": { summaryEn: "Reading and analysing poetry: form, sound devices, figurative language, tone and theme.", summaryAf: "Lees en analise van poësie: vorm, klanktoestelle, figuurlike taal, toon en tema.", conceptsEn: ["Sonnet (14 lines), free verse, ballad", "Imagery: metaphor, simile, personification", "Sound devices: alliteration, assonance, onomatopoeia"], conceptsAf: ["Sonnet (14 reëls), vrye vers, ballade", "Beeldspraak: metafoor, vergelyking, personifikasie", "Klanktoestelle: alliterasie, assonansie, onomatopee"] },
  "ENGH-4": { summaryEn: "Short story analysis: compression, point of view, single effect and the 'show, don't tell' technique.", summaryAf: "Kortverhaal-analise: saampersing, perspektief, enkele effek en die 'wys, moenie sê nie' tegniek.", conceptsEn: ["One central conflict, brief timespan", "Setting often acts as character", "Twist endings vs reflective endings"], conceptsAf: ["Een sentrale konflik, kort tydsverloop", "Omgewing tree dikwels as karakter op", "Verrassingseinde vs reflektiewe einde"] },
  "ENGH-5": { summaryEn: "Editing skills: parts of speech, sentence structures, punctuation, concord, register and standard SA English.", summaryAf: "Redigeringsvaardighede: woordsoorte, sinstrukture, leestekens, ooreenkoms, register en standaard SA Engels.", conceptsEn: ["Subject–verb concord", "Active vs passive voice", "Direct vs indirect (reported) speech"], conceptsAf: ["Onderwerp–werkwoord ooreenkoms", "Aktiewe vs passiewe vorm", "Direkte vs indirekte (gerapporteerde) rede"] },
  "ENGH-6": { summaryEn: "Reading for understanding: skim/scan, infer, distinguish fact and opinion; summary in 60–80 words.", summaryAf: "Lees vir begrip: skim/skandeer, aflei, onderskei feit en mening; opsomming in 60–80 woorde.", conceptsEn: ["Identify topic sentences", "Infer tone from word choice", "Summary: 7 main ideas in own words"], conceptsAf: ["Identifiseer onderwerpsinne", "Lei toon af uit woordkeuse", "Opsomming: 7 hoofidees in eie woorde"] },
  "ENGH-7": { summaryEn: "Discursive, argumentative, narrative, descriptive and reflective essays of 400–450 words.", summaryAf: "Diskursiewe, argumentatiewe, narratiewe, beskrywende en reflektiewe opstelle van 400–450 woorde.", conceptsEn: ["Plan: introduction, 3 body paragraphs (PEEL), conclusion", "Vary sentence length for rhythm", "Strong thesis statement up front"], conceptsAf: ["Beplan: inleiding, 3 paragrawe (PEEL), slot", "Wissel sinslengte vir ritme", "Sterk tesisstelling voor"] },
  "ENGH-8": { summaryEn: "Letters (formal, informal, application), CVs, agendas, minutes, reports, reviews and social media posts.", summaryAf: "Briewe (formeel, informeel, aansoek), CV's, agendas, notules, verslae, resensies en sosiale media plasings.", conceptsEn: ["Match register to audience and purpose", "Layout conventions per text type", "Word count limits enforced strictly"], conceptsAf: ["Pas register by gehoor en doel aan", "Uitlegkonvensies per teks tipe", "Woordtelling perke streng afgedwing"] },

  // --------------------- AFRIKAANS HOME LANGUAGE ---------------------
  "AFRH-1": { summaryEn: "Studying the prescribed Afrikaans novel: storielyn, karakter, tema, verteller­sperspektief en konteks.", summaryAf: "Bestudering van die voorgeskrewe Afrikaanse roman: storielyn, karakter, tema, vertellersperspektief en konteks.", conceptsEn: ["Plot structure analysis", "Round vs flat characters", "Theme drawn from recurring motifs"], conceptsAf: ["Verhaalstruktuur ontleding", "Ronde vs plat karakters", "Tema afgelei uit herhalende motiewe"] },
  "AFRH-2": { summaryEn: "Drama: dramatiese struktuur, dialoog, simbole en konflik in voorgeskrewe Afrikaanse drama.", summaryAf: "Drama: dramatiese struktuur, dialoog, simbole en konflik in voorgeskrewe Afrikaanse drama.", conceptsEn: ["Bedrywe en tonele", "Innerlike en uiterlike konflik", "Toneelaanwysings (didaskalia)"], conceptsAf: ["Bedrywe en tonele", "Innerlike en uiterlike konflik", "Toneelaanwysings (didaskalia)"] },
  "AFRH-3": { summaryEn: "Poësie: vorm, klanktegnieke, beeldspraak, toon en tema in Afrikaanse gedigte.", summaryAf: "Poësie: vorm, klanktegnieke, beeldspraak, toon en tema in Afrikaanse gedigte.", conceptsEn: ["Sonnet, vrye vers, ballade", "Metafoor, vergelyking, personifikasie", "Alliterasie en assonansie"], conceptsAf: ["Sonnet, vrye vers, ballade", "Metafoor, vergelyking, personifikasie", "Alliterasie en assonansie"] },
  "AFRH-4": { summaryEn: "Kortverhale: saamgeperste vorm, enkele konflik, verteller­sperspektief en simboliek.", summaryAf: "Kortverhale: saamgeperste vorm, enkele konflik, vertellersperspektief en simboliek.", conceptsEn: ["Eenheid van effek", "Kort tydsverloop", "Slot dikwels reflektief of verrassend"], conceptsAf: ["Eenheid van effek", "Kort tydsverloop", "Slot dikwels reflektief of verrassend"] },
  "AFRH-5": { summaryEn: "Taalstrukture: woordsoorte, sinsbou, leestekens, direkte/indirekte rede en aktief/passief.", summaryAf: "Taalstrukture: woordsoorte, sinsbou, leestekens, direkte/indirekte rede en aktief/passief.", conceptsEn: ["Onderwerp–gesegde ooreenkoms", "Hoofsin en bysin", "Aktiewe → passiewe vorm transformasies"], conceptsAf: ["Onderwerp–gesegde ooreenkoms", "Hoofsin en bysin", "Aktiewe → passiewe vorm transformasies"] },
  "AFRH-6": { summaryEn: "Begripslees en opsomming: hoofgedagtes, afleidings en 7 punte in 60–70 woorde.", summaryAf: "Begripslees en opsomming: hoofgedagtes, afleidings en 7 punte in 60–70 woorde.", conceptsEn: ["Onderwerpsinne identifiseer", "Toon en register afleien", "Opsomming in eie woorde"], conceptsAf: ["Onderwerpsinne identifiseer", "Toon en register afleien", "Opsomming in eie woorde"] },
  "AFRH-7": { summaryEn: "Opstelle: betogend, beskrywend, narratief, refleksief en diskursief (400–450 woorde).", summaryAf: "Opstelle: betogend, beskrywend, narratief, refleksief en diskursief (400–450 woorde).", conceptsEn: ["Beplan voor jy skryf", "Sterk inleiding en slot", "Wissel sinstrukture"], conceptsAf: ["Beplan voor jy skryf", "Sterk inleiding en slot", "Wissel sinstrukture"] },
  "AFRH-8": { summaryEn: "Transaksionele tekste: briewe, CV, koerantberig, dagboekinskrywing, e-pos en advertensies.", summaryAf: "Transaksionele tekste: briewe, CV, koerantberig, dagboekinskrywing, e-pos en advertensies.", conceptsEn: ["Pas register aan", "Korrekte uitleg per teks tipe", "Woordtelling streng"], conceptsAf: ["Pas register aan", "Korrekte uitleg per teks tipe", "Woordtelling streng"] },

  // --------------------- MATHEMATICAL LITERACY ---------------------
  "MATL-1": {
    summaryEn: "Personal & business finance: budgets, banking, tax, loans, hire purchase, investments and inflation.",
    summaryAf: "Persoonlike en sake finansies: begrotings, bankwese, belasting, lenings, huurkoop, beleggings en inflasie.",
    conceptsEn: ["Simple interest A = P(1 + i·n)", "VAT in SA = 15%", "Tax brackets and rebates"],
    conceptsAf: ["Eenvoudige rente A = P(1 + i·n)", "BTW in SA = 15%", "Belasting kategorieë en kortings"],
    diagramsEn: [
      {
        label: "Compound Interest Timeline — R10 000 at 8% p.a. for 5 Years",
        ascii: [
          "  Formula:  A = P(1 + i)^n     P = R10 000,  i = 0.08,  n = 5",
          "",
          "  Year:    0         1         2         3         4         5",
          "           |─────────|─────────|─────────|─────────|─────────|",
          "  Value: 10 000   10 800    11 664    12 597    13 605    14 693",
          "           │         │         │         │         │         │",
          "           P       +R800    +R864    +R933   +R1 008   +R1 088",
          "                  ↑ interest grows each year (interest on interest)",
          "",
          "  Simple interest would give:  10 000 + (10 000 × 0.08 × 5) = R14 000",
          "  Compound interest gives:     10 000 × (1.08)^5         = R14 693",
          "  Difference (the 'compound bonus'):                       R693",
        ].join("\n"),
        caption: "With compound interest, each year's interest is added to the balance, so the next year's interest is calculated on a larger amount. The gap between simple and compound interest grows as time increases — this is why starting to save early matters.",
      },
      {
        label: "SARS Tax Bracket Table — 2024/25 (Individuals)",
        ascii: [
          "  TAXABLE INCOME (R)              RATE OF TAX",
          "  ──────────────────────────────  ─────────────────────────────────",
          "       0   –   237 100           18% of taxable income",
          "  237 101   –   370 500           42 678 + 26% of amount > 237 100",
          "  370 501   –   512 800           77 362 + 31% of amount > 370 500",
          "  512 801   –   673 000          121 475 + 36% of amount > 512 800",
          "  673 001   –   857 900          179 147 + 39% of amount > 673 000",
          "  857 901   – 1 817 000          251 258 + 41% of amount > 857 900",
          "  1 817 001 +                    644 489 + 45% of amount > 1 817 000",
          "",
          "  PRIMARY REBATE (under 65):  R17 235",
          "  TAX THRESHOLD (under 65):   R95 750  (no PAYE below this)",
          "",
          "  Worked example — taxable income R300 000:",
          "    Bracket 2:  42 678 + 26% × (300 000 − 237 100)",
          "             =  42 678 + 26% × 62 900",
          "             =  42 678 + 16 354",
          "             =  R59 032   (before rebate)",
          "    Less primary rebate:   −17 235",
          "    Tax payable:           R41 797",
        ].join("\n"),
        caption: "SA uses a sliding-scale (progressive) tax system. Only the portion of income inside each bracket is taxed at that bracket's rate. Always subtract the primary rebate at the end to get tax payable.",
      },
    ],
    diagramsAf: [
      {
        label: "Saamgestelde Rente Tydlyn — R10 000 teen 8% p.j. vir 5 Jaar",
        ascii: [
          "  Formule:  A = P(1 + i)^n     P = R10 000,  i = 0.08,  n = 5",
          "",
          "  Jaar:    0         1         2         3         4         5",
          "           |─────────|─────────|─────────|─────────|─────────|",
          "  Waarde:10 000   10 800    11 664    12 597    13 605    14 693",
          "           │         │         │         │         │         │",
          "           P       +R800    +R864    +R933   +R1 008   +R1 088",
          "                  ↑ rente groei elke jaar (rente op rente)",
          "",
          "  Eenvoudige rente sou gee: 10 000 + (10 000 × 0.08 × 5) = R14 000",
          "  Saamgestelde rente gee:   10 000 × (1.08)^5            = R14 693",
          "  Verskil (die 'saamgestelde bonus'):                      R693",
        ].join("\n"),
        caption: "Met saamgestelde rente word elke jaar se rente by die balans gevoeg, sodat die volgende jaar se rente op 'n groter bedrag bereken word. Die gaping tussen eenvoudige en saamgestelde rente groei met tyd — daarom maak dit saak om vroeg te begin spaar.",
      },
      {
        label: "SAID Belastingkategorie Tabel — 2024/25 (Individue)",
        ascii: [
          "  BELASBARE INKOMSTE (R)          BELASTINGKOERS",
          "  ──────────────────────────────  ─────────────────────────────────",
          "       0   –   237 100           18% van belasbare inkomste",
          "  237 101   –   370 500           42 678 + 26% van bedrag > 237 100",
          "  370 501   –   512 800           77 362 + 31% van bedrag > 370 500",
          "  512 801   –   673 000          121 475 + 36% van bedrag > 512 800",
          "  673 001   –   857 900          179 147 + 39% van bedrag > 673 000",
          "  857 901   – 1 817 000          251 258 + 41% van bedrag > 857 900",
          "  1 817 001 +                    644 489 + 45% van bedrag > 1 817 000",
          "",
          "  PRIMÊRE KORTING (onder 65):  R17 235",
          "  BELASTINGDREMPEL (onder 65): R95 750  (geen LBS hieronder nie)",
          "",
          "  Voorbeeld — belasbare inkomste R300 000:",
          "    Kategorie 2:  42 678 + 26% × (300 000 − 237 100)",
          "               =  42 678 + 16 354  =  R59 032",
          "    Minus primêre korting:         −17 235",
          "    Belasting betaalbaar:          R41 797",
        ].join("\n"),
        caption: "SA gebruik 'n progressiewe belastingstelsel. Net die deel van inkomste binne elke kategorie word teen daardie koers belas. Trek altyd die primêre korting laaste af om belasting betaalbaar te kry.",
      },
    ],
  },
  "MATL-2": {
    summaryEn: "Collecting, organising, summarising and interpreting data using tables, graphs and statistical measures.",
    summaryAf: "Insameling, organisering, opsomming en interpretasie van data deur tabelle, grafieke en statistiese mate.",
    conceptsEn: ["Mean, median, mode, range", "Box-and-whisker plots", "Misleading graphs"],
    conceptsAf: ["Gemiddeld, mediaan, modus, omvang", "Boks-en-snor plotte", "Misleidende grafieke"],
    diagramsEn: [
      {
        label: "Box-and-Whisker Plot — Reading the Five-Number Summary",
        ascii: [
          "  DATA SET (sorted): 12, 15, 18, 22, 25, 28, 30, 35, 40",
          "",
          "  Five-number summary:",
          "    Min = 12   Q1 = 18   Median = 25   Q3 = 30   Max = 40",
          "",
          "  Min        Q1       Median      Q3         Max",
          "   12        18         25        30          40",
          "   |         |          |          |           |",
          "   ├─────────╠══════════╪══════════╣───────────┤",
          "   12        18         25         30          40",
          "             └────── IQR = 12 ─────┘",
          "",
          "  Whisker ←──── Box (middle 50%) ────→ Whisker",
          "  IQR = Q3 − Q1 = 30 − 18 = 12",
          "  Outlier rule: value > Q3 + 1.5×IQR  OR  < Q1 − 1.5×IQR",
        ].join("\n"),
        caption: "The box spans the middle 50% of data (Q1 to Q3). The line inside the box is the median. Whiskers extend to the minimum and maximum (excluding outliers). Use this to compare spread and skewness between data sets.",
      },
      {
        label: "Scatter Plot — Identifying Correlation",
        ascii: [
          "  Study Hours vs Test Score",
          "",
          "  Score",
          "  100 |                              ×",
          "   90 |                         ×",
          "   80 |                    ×",
          "   70 |               ×",
          "   60 |         ×",
          "   50 |    ×",
          "   40 | ×",
          "      +─────────────────────────────────",
          "        1    2    3    4    5    6    7   Hours",
          "",
          "  POSITIVE CORRELATION: as x increases, y increases",
          "  Line of best fit: drawn through the middle of the points",
          "",
          "  Negative correlation: points slope downward (↘)",
          "  No correlation: points scattered randomly (no pattern)",
        ].join("\n"),
        caption: "A scatter plot shows the relationship between two numerical variables. Draw the line of best fit through the middle of the point cluster — roughly equal numbers of points above and below the line. Use the line to make predictions.",
      },
    ],
    diagramsAf: [
      {
        label: "Boks-en-Snor Plot — Vyf-Getalsopsomming Lees",
        ascii: [
          "  DATASTEL (gesorteer): 12, 15, 18, 22, 25, 28, 30, 35, 40",
          "",
          "  Vyf-getalsopsomming:",
          "    Min = 12   K1 = 18   Mediaan = 25   K3 = 30   Maks = 40",
          "",
          "  Min        K1       Mediaan      K3         Maks",
          "   12        18         25         30          40",
          "   |         |          |           |           |",
          "   ├─────────╠══════════╪═══════════╣───────────┤",
          "   12        18         25          30          40",
          "             └────── IKB = 12 ──────┘",
          "",
          "  Snor ←──── Boks (middelste 50%) ────→ Snor",
          "  IKB = K3 − K1 = 30 − 18 = 12",
        ].join("\n"),
        caption: "Die boks strek oor die middelste 50% van data (K1 tot K3). Die lyn binne die boks is die mediaan. Snore strek tot die minimum en maksimum. Gebruik dit om verspreiding en skeefheid tussen datastelle te vergelyk.",
      },
      {
        label: "Verstrooiingsdiagram — Korrelasie Identifiseer",
        ascii: [
          "  Studietyd vs Toetspunt",
          "",
          "  Punt",
          "  100 |                              ×",
          "   90 |                         ×",
          "   80 |                    ×",
          "   70 |               ×",
          "   60 |         ×",
          "   50 |    ×",
          "   40 | ×",
          "      +─────────────────────────────────",
          "        1    2    3    4    5    6    7   Ure",
          "",
          "  POSITIEWE KORRELASIE: soos x toeneem, neem y toe",
          "  Beste-paslyn: deur die middel van die punte",
          "",
          "  Negatiewe korrelasie: punte hel afwaarts (↘)",
          "  Geen korrelasie: punte verstrooi ewekansig",
        ].join("\n"),
        caption: "ʼn Verstrooiingsdiagram toon die verwantskap tussen twee numeriese veranderlikes. Trek die beste-paslyn deur die middel van die puntgroep — min of meer gelyke getal punte bo en onder die lyn.",
      },
    ],
  },
  "MATL-3": {
    summaryEn: "Length, area, volume, time, temperature; conversions and real-world calculations.",
    summaryAf: "Lengte, oppervlakte, volume, tyd, temperatuur; omsettings en regte-wêreld berekenings.",
    conceptsEn: ["A_circle = π·r²", "V_cylinder = π·r²·h", "°F = °C·9/5 + 32"],
    conceptsAf: ["A_sirkel = π·r²", "V_silinder = π·r²·h", "°F = °C·9/5 + 32"],
    diagramsEn: [
      {
        label: "Cylinder — Labelled Volume & Surface Area Formulas",
        ascii: [
          "                ┌─────────────┐  ← circular top (πr²)",
          "               ╱               ╲",
          "              │       •─── r ──→│",
          "               ╲               ╱",
          "                └─────────────┘",
          "                │             │",
          "                │             │",
          "                │      h      │   ← height",
          "                │             │",
          "                │             │",
          "                └─────────────┘",
          "                 ╲           ╱",
          "                  ╲_________╱   ← circular base (πr²)",
          "",
          "  VOLUME            V = π · r² · h",
          "  CURVED SURFACE    A_curve = 2 · π · r · h    (the 'unrolled' rectangle)",
          "  TOTAL SURFACE     TSA = 2πr² + 2πrh",
          "",
          "  Worked example — r = 5 cm, h = 12 cm  (use π ≈ 3.142):",
          "    V   = 3.142 × 5² × 12   = 3.142 × 25 × 12 = 942.6 cm³",
          "    TSA = 2(3.142)(5²) + 2(3.142)(5)(12)",
          "        = 157.1 + 377.0    = 534.1 cm²",
        ].join("\n"),
        caption: "A cylinder has two circular ends (each πr²) and a curved side that 'unrolls' into a rectangle of width 2πr (the circumference) and height h. Always check units: lengths in cm → area in cm², volume in cm³ (1 cm³ = 1 mℓ).",
      },
      {
        label: "Rectangular Prism (Box) — Area & Volume",
        ascii: [
          "             ┌─────────────────────┐",
          "            ╱│                    ╱│",
          "           ╱ │                   ╱ │",
          "          ╱  │                  ╱  │  ← height h",
          "         ┌─────────────────────┐   │",
          "         │   │                 │   │",
          "         │   └─────────────────│───┘",
          "         │  ╱                  │  ╱",
          "         │ ╱                   │ ╱   ← breadth b",
          "         │╱                    │╱",
          "         └─────────────────────┘",
          "                length  ℓ",
          "",
          "  VOLUME           V = ℓ × b × h",
          "  TOTAL SURFACE    TSA = 2(ℓ·b + ℓ·h + b·h)",
          "",
          "  Worked example — ℓ = 4 m, b = 3 m, h = 2 m:",
          "    V   = 4 × 3 × 2          = 24 m³",
          "    TSA = 2(4·3 + 4·2 + 3·2) = 2(12 + 8 + 6) = 52 m²",
          "",
          "  Capacity conversion:  1 m³ = 1 000 ℓ   →   24 m³ = 24 000 ℓ",
        ].join("\n"),
        caption: "Volume = length × breadth × height. Total Surface Area = sum of all 6 faces (3 pairs of identical rectangles). Remember capacity conversions: 1 m³ = 1 000 ℓ, 1 cm³ = 1 mℓ.",
      },
    ],
    diagramsAf: [
      {
        label: "Silinder — Geëtiketteerde Volume- en Oppervlakteformules",
        ascii: [
          "                ┌─────────────┐  ← sirkelvormige bokant (πr²)",
          "               ╱               ╲",
          "              │       •─── r ──→│",
          "               ╲               ╱",
          "                └─────────────┘",
          "                │             │",
          "                │             │",
          "                │      h      │   ← hoogte",
          "                │             │",
          "                │             │",
          "                └─────────────┘",
          "                 ╲           ╱",
          "                  ╲_________╱   ← sirkelvormige basis (πr²)",
          "",
          "  VOLUME              V = π · r² · h",
          "  GEBOË OPPERVLAK     A_geboë = 2 · π · r · h    (die 'afgerolde' reghoek)",
          "  TOTALE OPPERVLAK    TO = 2πr² + 2πrh",
          "",
          "  Voorbeeld — r = 5 cm, h = 12 cm  (gebruik π ≈ 3.142):",
          "    V  = 3.142 × 5² × 12   = 942.6 cm³",
          "    TO = 2(3.142)(25) + 2(3.142)(5)(12)  = 534.1 cm²",
        ].join("\n"),
        caption: "ʼn Silinder het twee sirkelvormige punte (elk πr²) en ʼn geboë sykant wat 'afrol' in ʼn reghoek met breedte 2πr (die omtrek) en hoogte h. Toets altyd eenhede: lengte in cm → oppervlakte in cm², volume in cm³ (1 cm³ = 1 mℓ).",
      },
      {
        label: "Reghoekige Prisma (Boks) — Oppervlak & Volume",
        ascii: [
          "             ┌─────────────────────┐",
          "            ╱│                    ╱│",
          "           ╱ │                   ╱ │",
          "          ╱  │                  ╱  │  ← hoogte h",
          "         ┌─────────────────────┐   │",
          "         │   │                 │   │",
          "         │   └─────────────────│───┘",
          "         │  ╱                  │  ╱",
          "         │ ╱                   │ ╱   ← breedte b",
          "         │╱                    │╱",
          "         └─────────────────────┘",
          "                lengte  ℓ",
          "",
          "  VOLUME              V = ℓ × b × h",
          "  TOTALE OPPERVLAK    TO = 2(ℓ·b + ℓ·h + b·h)",
          "",
          "  Voorbeeld — ℓ = 4 m, b = 3 m, h = 2 m:",
          "    V  = 4 × 3 × 2         = 24 m³",
          "    TO = 2(12 + 8 + 6)     = 52 m²",
          "",
          "  Kapasiteit omsetting:  1 m³ = 1 000 ℓ   →   24 m³ = 24 000 ℓ",
        ].join("\n"),
        caption: "Volume = lengte × breedte × hoogte. Totale Oppervlak = som van al 6 vlakke (3 pare identiese reghoeke). Onthou: 1 m³ = 1 000 ℓ, 1 cm³ = 1 mℓ.",
      },
    ],
  },
  "MATL-4": {
    summaryEn: "Reading and using maps, plans, scale drawings, GPS and the Cartesian plane in real-life contexts.",
    summaryAf: "Lees en gebruik van kaarte, planne, skaaltekeninge, GPS en die Cartesiese vlak in werklike kontekste.",
    conceptsEn: ["Scale ratios (e.g. 1:50 000)", "Compass directions", "Floor plans interpretation"],
    conceptsAf: ["Skaal verhoudings (bv. 1:50 000)", "Kompasrigtings", "Vloerplanne interpretasie"],
    diagramsEn: [
      {
        label: "Reading a Floor Plan at Scale 1 : 100",
        ascii: [
          "  FLOOR PLAN   Scale 1 : 100  (1 cm on plan = 100 cm = 1 m in reality)",
          "",
          "  ┌────────────────────────┬──────────┐",
          "  │                        │          │",
          "  │       LOUNGE           │ BATHROOM │",
          "  │       5 cm on plan     │  2 cm    │",
          "  │       = 5 m actual     │  = 2 m   │",
          "  │                        │          │",
          "  ├────────────────────────┴──────────┤",
          "  │                                   │",
          "  │           BEDROOM                 │",
          "  │           4 cm on plan = 4 m      │",
          "  │                                   │",
          "  └───────────────────────────────────┘",
          "",
          "  Formula:  Actual size = map measurement × scale denominator",
          "  Example:  3 cm × 100 = 300 cm = 3 m",
        ].join("\n"),
        caption: "Always multiply the plan measurement by the scale denominator to find the real-life size. To go the other way (real → plan), divide by the scale denominator.",
      },
      {
        label: "Compass Rose — 8-Point Bearings",
        ascii: [
          "                 N (000° / 360°)",
          "                 |",
          "    NW (315°) ───┼─── NE (045°)",
          "                 |",
          "  W (270°) ──────┼────── E (090°)",
          "                 |",
          "    SW (225°) ───┼─── SE (135°)",
          "                 |",
          "                 S (180°)",
          "",
          "  Bearing is always measured CLOCKWISE from North.",
          "  Written as 3 digits: e.g. 045° not 45°",
          "  'North-East of X' means X is to the SW of the point described.",
        ].join("\n"),
        caption: "The 8-point compass divides the full 360° circle into 8 equal sectors of 45° each. In Mathematical Literacy, bearings start at North and are measured clockwise. Knowing the 8 directions and their degree equivalents is essential for map questions.",
      },
    ],
    diagramsAf: [
      {
        label: "Vloerplan Lees teen Skaal 1 : 100",
        ascii: [
          "  VLOERPLAN   Skaal 1 : 100  (1 cm op plan = 100 cm = 1 m werklik)",
          "",
          "  ┌────────────────────────┬──────────┐",
          "  │                        │          │",
          "  │       SITKAMER         │ BADKAMER │",
          "  │       5 cm op plan     │  2 cm    │",
          "  │       = 5 m werklik    │  = 2 m   │",
          "  │                        │          │",
          "  ├────────────────────────┴──────────┤",
          "  │                                   │",
          "  │           SLAAPKAMER              │",
          "  │           4 cm op plan = 4 m      │",
          "  │                                   │",
          "  └───────────────────────────────────┘",
          "",
          "  Formule:  Werklike grootte = planmeting × skaalnoemer",
          "  Voorbeeld: 3 cm × 100 = 300 cm = 3 m",
        ].join("\n"),
        caption: "Vermenigvuldig altyd die planmeting met die skaalnoemer om die werklike grootte te kry. Omgekeerd (werklik → plan): deel deur die skaalnoemer.",
      },
      {
        label: "Kompasroos — 8-Punt Rigtings",
        ascii: [
          "                 N (000° / 360°)",
          "                 |",
          "    NW (315°) ───┼─── NO (045°)",
          "                 |",
          "  W (270°) ──────┼────── O (090°)",
          "                 |",
          "    SW (225°) ───┼─── SO (135°)",
          "                 |",
          "                 S (180°)",
          "",
          "  Peiling word altyd KLOKSGEWYS van Noord gemeet.",
          "  Geskryf as 3 syfers: bv. 045° nie 45° nie",
        ].join("\n"),
        caption: "Die 8-punt kompas verdeel die volle 360°-sirkel in 8 gelyke sektore van 45° elk. Peilings begin by Noord en word kloksgewys gemeet. Ken die 8 rigtings en hul graadbewaarders vir kaarte vrae.",
      },
    ],
  },
  "MATL-5": {
    summaryEn: "Probability of single and combined events; weather forecasts, games of chance, fair vs unfair.",
    summaryAf: "Waarskynlikheid van enkele en gekombineerde gebeurtenisse; weervoorspellings, kansspeletjies, billik vs onbillik.",
    conceptsEn: ["P = favourable/total", "Tree diagrams for combined events", "Theoretical vs experimental probability"],
    conceptsAf: ["P = gunstige/totaal", "Boomdiagramme vir gekombineerde gebeurtenisse", "Teoretiese vs eksperimentele waarskynlikheid"],
    diagramsEn: [
      {
        label: "Probability Tree — Tossing a Coin Twice",
        ascii: [
          "  Each branch shows P(outcome). Multiply ALONG branches, ADD between branches.",
          "",
          "             Toss 1            Toss 2          Outcome      Probability",
          "                                ½    H ───── HH            ½ × ½ = ¼",
          "                  ½   H ──────┤",
          "                              │ ½    T ───── HT            ½ × ½ = ¼",
          "         START ──┤",
          "                              │ ½    H ───── TH            ½ × ½ = ¼",
          "                  ½   T ──────┤",
          "                                ½    T ───── TT            ½ × ½ = ¼",
          "                                                          ─────────────",
          "                                                          Total = 1  ✓",
          "",
          "  P(exactly one Head)  = P(HT) + P(TH) = ¼ + ¼ = ½",
          "  P(at least one Head) = 1 − P(TT)     = 1 − ¼ = ¾",
        ].join("\n"),
        caption: "A tree diagram lists every possible outcome of a combined event. Multiply the probabilities along each branch (AND) and add the matching outcome rows (OR). The four end-probabilities must always sum to 1 — a quick check that you haven't missed a branch.",
      },
      {
        label: "Two-Way Table & Probability Scale",
        ascii: [
          "  Survey of 100 Grade 12 learners — Sport played:",
          "",
          "                  Soccer   Netball   Rugby   TOTAL",
          "  Boys  (50)        25        5       20      50",
          "  Girls (50)        10       35        5      50",
          "  TOTAL             35       40       25     100",
          "",
          "  P(girl AND netball) = 35/100 = 0.35",
          "  P(plays rugby)      = 25/100 = 0.25",
          "  P(boy | plays soccer) = 25/35 ≈ 0.71  (conditional)",
          "",
          "  PROBABILITY SCALE",
          "   0 ─────────── ¼ ─────────── ½ ─────────── ¾ ─────────── 1",
          "  Impossible    Unlikely    Even chance    Likely      Certain",
          "                                                       (e.g. sun rises)",
        ].join("\n"),
        caption: "A two-way table makes it easy to read combined probabilities — row totals, column totals and the grand total all act as denominators for different questions. Probabilities always lie between 0 (impossible) and 1 (certain).",
      },
    ],
    diagramsAf: [
      {
        label: "Waarskynlikheidsboom — Munt Twee Keer Gooi",
        ascii: [
          "  Elke tak wys P(uitkoms). Vermenigvuldig LANGS takke, TEL TUSSEN takke OP.",
          "",
          "             Gooi 1            Gooi 2          Uitkoms      Waarskynlikheid",
          "                                ½    K ───── KK            ½ × ½ = ¼",
          "                  ½   K ──────┤",
          "                              │ ½    M ───── KM            ½ × ½ = ¼",
          "        BEGIN ──┤",
          "                              │ ½    K ───── MK            ½ × ½ = ¼",
          "                  ½   M ──────┤",
          "                                ½    M ───── MM            ½ × ½ = ¼",
          "                                                          ─────────────",
          "                                                          Totaal = 1 ✓",
          "",
          "  K = Kop,  M = Munt",
          "  P(presies een Kop)    = P(KM) + P(MK) = ¼ + ¼ = ½",
          "  P(ten minste een Kop) = 1 − P(MM)     = 1 − ¼ = ¾",
        ].join("\n"),
        caption: "ʼn Boomdiagram lys elke moontlike uitkoms van ʼn gekombineerde gebeurtenis. Vermenigvuldig die waarskynlikhede langs elke tak (EN) en tel die ooreenstemmende ry-uitkomste op (OF). Die vier eindwaarskynlikhede moet altyd 1 totaal — ʼn vinnige toets dat jy nie ʼn tak gemis het nie.",
      },
      {
        label: "Tweerigting-Tabel & Waarskynlikheidskaal",
        ascii: [
          "  Opname van 100 Graad 12 leerders — Sport gespeel:",
          "",
          "                 Sokker   Netbal   Rugby   TOTAAL",
          "  Seuns  (50)      25       5       20      50",
          "  Meisies(50)      10      35        5      50",
          "  TOTAAL           35      40       25     100",
          "",
          "  P(meisie EN netbal)  = 35/100 = 0.35",
          "  P(speel rugby)       = 25/100 = 0.25",
          "  P(seun | speel sokker) = 25/35 ≈ 0.71  (voorwaardelik)",
          "",
          "  WAARSKYNLIKHEIDSKAAL",
          "   0 ─────────── ¼ ─────────── ½ ─────────── ¾ ─────────── 1",
          "  Onmoontlik   Onwaarskynlik  Gelyk      Waarskynlik    Seker",
        ].join("\n"),
        caption: "ʼn Tweerigting-tabel maak gekombineerde waarskynlikhede maklik om te lees — ry-totale, kolom-totale en die groot totaal dien as noemers vir verskillende vrae. Waarskynlikhede lê altyd tussen 0 (onmoontlik) en 1 (seker).",
      },
    ],
  },

  // --------------------- ACCOUNTING ---------------------
  "ACC-1": {
    summaryEn: "Preparation of company financial statements: Income Statement, Balance Sheet and Cash Flow Statement per IFRS for SMEs.",
    summaryAf: "Voorbereiding van maatskappy finansiële state: Inkomstestaat, Balansstaat en Kontantvloeistaat volgens IFRS vir KMOs.",
    conceptsEn: ["Income Statement = Revenue – Expenses = Profit", "Balance Sheet: Assets = Equity + Liabilities", "Cash Flow: Operating, Investing, Financing"],
    conceptsAf: ["Inkomstestaat = Inkomste – Uitgawes = Wins", "Balansstaat: Bates = Ekwiteit + Laste", "Kontantvloei: Bedryfs, Beleggings, Finansiering"],
    diagramsEn: [
      {
        label: "T-Account Layout",
        ascii: [
          "        ACCOUNT NAME",
          "  ┌─────────────────────────────┐",
          "  │   DEBIT (Dr)  │  CREDIT (Cr)│",
          "  ├───────────────┼─────────────┤",
          "  │ Opening bal   │             │",
          "  │ Assets ↑      │ Assets ↓    │",
          "  │ Expenses ↑    │ Income ↑    │",
          "  │               │ Liabilities ↑│",
          "  ├───────────────┼─────────────┤",
          "  │   Total Dr    │   Total Cr  │",
          "  └───────────────┴─────────────┘",
          "",
          "  DEBIT = left side | CREDIT = right side",
          "  Assets & Expenses increase on the DEBIT side",
          "  Liabilities, Equity & Income increase on the CREDIT side",
        ].join("\n"),
        caption: "Every transaction has a debit entry and a matching credit entry (double-entry principle). Assets and expenses increase with debits; income, liabilities and equity increase with credits.",
      },
      {
        label: "Income Statement Structure",
        ascii: [
          "  INCOME STATEMENT for year ended 28 Feb",
          "  ─────────────────────────────────────",
          "  Sales / Turnover                  xxx",
          "  Less: Cost of Sales              (xxx)",
          "                                  ─────",
          "  GROSS PROFIT                      xxx",
          "  Add: Other Income                  xx",
          "  Less: Operating Expenses          (xx)",
          "    - Salaries           xx",
          "    - Depreciation       xx",
          "    - Other expenses     xx",
          "                                  ─────",
          "  OPERATING PROFIT                   xx",
          "  Less: Interest Expense             (x)",
          "                                  ─────",
          "  NET PROFIT BEFORE TAX              xx",
          "  Less: Income Tax                   (x)",
          "                                  ─────",
          "  NET PROFIT AFTER TAX               xx",
        ].join("\n"),
        caption: "Work top-down: Sales → Gross Profit (after cost of sales) → Operating Profit (after expenses) → Net Profit (after interest and tax).",
      },
    ],
    diagramsAf: [
      {
        label: "T-Rekening Uitleg",
        ascii: [
          "        REKENINGNAAM",
          "  ┌─────────────────────────────┐",
          "  │   DEBET (Db)  │  KREDIET (Kr)│",
          "  ├───────────────┼──────────────┤",
          "  │ Openingsaldo  │              │",
          "  │ Bates ↑       │ Bates ↓      │",
          "  │ Uitgawes ↑    │ Inkomste ↑   │",
          "  │               │ Laste ↑      │",
          "  ├───────────────┼──────────────┤",
          "  │   Totaal Db   │  Totaal Kr   │",
          "  └───────────────┴──────────────┘",
          "",
          "  DEBET = linkerkant | KREDIET = regterkant",
          "  Bates en Uitgawes neem toe op die DEBET-kant",
          "  Laste, Ekwiteit en Inkomste neem toe op KREDIET-kant",
        ].join("\n"),
        caption: "Elke transaksie het 'n debietinskrywing en 'n ooreenstemmende kredieetinskrywing (dubbelinskrywingstelsel). Bates en uitgawes neem toe met debiete; inkomste, laste en ekwiteit neem toe met krediete.",
      },
      {
        label: "Inkomstestaat Struktuur",
        ascii: [
          "  INKOMSTESTAAT vir jaar geëindig 28 Feb",
          "  ────────────────────────────────────",
          "  Verkope / Omset                   xxx",
          "  Min: Koste van Verkope           (xxx)",
          "                                  ─────",
          "  BRUTOWINSTE                        xxx",
          "  Plus: Ander Inkomste               xx",
          "  Min: Bedryfsuitgawes              (xx)",
          "    - Salarisse          xx",
          "    - Waardevermindering xx",
          "    - Ander uitgawes     xx",
          "                                  ─────",
          "  BEDRYFSWINSTE                       xx",
          "  Min: Rentekostes                   (x)",
          "                                  ─────",
          "  NETTO WINS VOOR BELASTING           xx",
          "  Min: Inkomstebelasting              (x)",
          "                                  ─────",
          "  NETTO WINS NA BELASTING             xx",
        ].join("\n"),
        caption: "Werk van bo af: Verkope → Brutowinste (na koste van verkope) → Bedryfswinste (na uitgawes) → Netto Wins (na rente en belasting).",
      },
    ],
  },
  "ACC-2": {
    summaryEn: "Calculate and interpret ratios for liquidity, solvency, profitability, gearing and shareholder returns.",
    summaryAf: "Bereken en interpreteer verhoudings vir likiditeit, solvensie, winsgewendheid, hefboomwerking en aandeelhouersopbrengs.",
    conceptsEn: ["Current ratio = CA/CL", "Acid test = (CA−Inv)/CL", "Debt:Equity ratio for gearing"],
    conceptsAf: ["Bedryfsverhouding = BB/BL", "Suurtoets = (BB−Voorraad)/BL", "Skuld:Ekwiteit verhouding vir hefboom"],
    diagramsEn: [
      {
        label: "Balance Sheet (Statement of Financial Position) Layout",
        ascii: [
          "  BALANCE SHEET at 28 February",
          "  ════════════════════════════════════════",
          "  ASSETS                                  ",
          "  Non-Current Assets                  xxx ",
          "    Fixed Assets (PPE)        xxx         ",
          "    Accumulated Depreciation (xxx)         ",
          "  Current Assets                      xxx ",
          "    Inventories               xx          ",
          "    Trade Debtors             xx          ",
          "    Cash & Bank               xx          ",
          "  ────────────────────────────────────────",
          "  TOTAL ASSETS                        xxx ",
          "  ════════════════════════════════════════",
          "  EQUITY & LIABILITIES                    ",
          "  Shareholders' Equity                xxx ",
          "    Ordinary Share Capital    xx          ",
          "    Retained Income           xx          ",
          "  Non-Current Liabilities              xx ",
          "    Long-term Loan            xx          ",
          "  Current Liabilities                   xx",
          "    Trade Creditors           x           ",
          "    Bank Overdraft            x           ",
          "  ────────────────────────────────────────",
          "  TOTAL EQUITY & LIABILITIES          xxx ",
          "  (Must equal TOTAL ASSETS)               ",
        ].join("\n"),
        caption: "The Balance Sheet must always balance: Total Assets = Equity + Liabilities (the Accounting Equation). Non-current items last more than one year; current items within one year.",
      },
      {
        label: "Key Financial Ratios at a Glance",
        ascii: [
          "  LIQUIDITY (Can we pay short-term debts?)",
          "  Current Ratio   = Current Assets / Current Liabilities",
          "  Acid Test       = (Current Assets − Inventory) / Current Liabilities",
          "  (Ideal current ratio ≈ 2:1; acid test ≈ 1:1)",
          "",
          "  PROFITABILITY (How well do we earn profit?)",
          "  Gross Profit %  = Gross Profit / Sales × 100",
          "  Net Profit %    = Net Profit / Sales × 100",
          "  Return on Equity= Net Profit / Shareholders' Equity × 100",
          "",
          "  SOLVENCY / GEARING (How much debt vs equity?)",
          "  Debt:Equity     = Non-current Liabilities / Shareholders' Equity",
          "  (< 0.5 = low gearing; > 1 = high gearing = risky)",
          "",
          "  EFFICIENCY",
          "  Debtors Days    = Debtors / Sales × 365",
          "  Stock Days      = Stock / Cost of Sales × 365",
        ].join("\n"),
        caption: "Always state the ratio AND interpret it (e.g. 'The current ratio of 1.8:1 means the company can cover short-term debts 1.8 times — this is acceptable'). NSC marks both calculation and interpretation.",
      },
    ],
    diagramsAf: [
      {
        label: "Balansstaat (Staat van Finansiële Posisie) Uitleg",
        ascii: [
          "  BALANSSTAAT op 28 Februarie",
          "  ════════════════════════════════════════",
          "  BATES                                   ",
          "  Nie-bedryfsbates                    xxx ",
          "    Vaste Bates (PPE)         xxx         ",
          "    Opgehoopte Waardevermindering (xxx)    ",
          "  Bedryfsbates                        xxx ",
          "    Voorraad                  xx          ",
          "    Handeldebiteure           xx          ",
          "    Kontant & Bank            xx          ",
          "  ────────────────────────────────────────",
          "  TOTALE BATES                        xxx ",
          "  ════════════════════════════════════════",
          "  EKWITEIT EN LASTE                       ",
          "  Aandeelhouersekwiteit               xxx ",
          "    Gewone Aandeelkapitaal    xx          ",
          "    Ingehoue Inkomste         xx          ",
          "  Nie-bedryfslaste                     xx ",
          "    Langtermyn Lening         xx          ",
          "  Bedryfslaste                          xx",
          "    Handelkrediteure          x           ",
          "    Bankoortrokke             x           ",
          "  ────────────────────────────────────────",
          "  TOTALE EKWITEIT EN LASTE             xxx",
          "  (Moet gelyk wees aan TOTALE BATES)      ",
        ].join("\n"),
        caption: "Die Balansstaat moet altyd balanseer: Totale Bates = Ekwiteit + Laste (die Rekeningkundige Vergelyking). Nie-bedryfsitems duur langer as een jaar; bedryfsitems binne een jaar.",
      },
      {
        label: "Sleutelfinansieringsverhoudings in Oorsig",
        ascii: [
          "  LIKIDITEIT (Kan ons korttermyn skulde betaal?)",
          "  Bedryfsverhouding = Bedryfsbates / Bedryfslaste",
          "  Suurtoets         = (Bedryfsbates − Voorraad) / Bedryfslaste",
          "  (Ideale verhouding ≈ 2:1; suurtoets ≈ 1:1)",
          "",
          "  WINSGEWENDHEID (Hoe goed verdien ons wins?)",
          "  Bruto Wins %      = Bruto Wins / Verkope × 100",
          "  Netto Wins %      = Netto Wins / Verkope × 100",
          "  Opbrengs op Ekwiteit = Netto Wins / Ekwiteit × 100",
          "",
          "  SOLVENSIE / HEFBOOM (Hoeveel skuld vs ekwiteit?)",
          "  Skuld:Ekwiteit    = Nie-bedryfslaste / Ekwiteit",
          "  (< 0.5 = lae hefboom; > 1 = hoë hefboom = riskant)",
          "",
          "  DOELTREFFENDHEID",
          "  Debiteure Dae     = Debiteure / Verkope × 365",
          "  Voorraad Dae      = Voorraad / Koste van Verkope × 365",
        ].join("\n"),
        caption: "Meld altyd die verhouding ÉN interpreteer dit. NSC ken punte toe vir beide berekening en interpretasie.",
      },
    ],
  },
  "ACC-3": { summaryEn: "Manufacturing accounts: direct materials, direct labour and factory overheads to derive cost of production.", summaryAf: "Vervaardigingsrekeninge: direkte materiaal, direkte arbeid en fabrieksbokoste om produksiekoste af te lei.", conceptsEn: ["Prime cost = direct materials + direct labour", "Cost of production = prime cost + factory overheads", "Unit cost = total cost / units produced"], conceptsAf: ["Hoofkoste = direkte materiaal + direkte arbeid", "Produksiekoste = hoofkoste + fabrieksbokoste", "Eenheidskoste = totale koste / eenhede vervaardig"] },
  "ACC-4": { summaryEn: "Cash budgets and projected income statements; variance analysis between budgeted and actual figures.", summaryAf: "Kontant begrotings en geprojekteerde inkomstestate; afwykingsontleding tussen begroot en werklik.", conceptsEn: ["Cash budget tracks receipts and payments", "Projected Income Statement uses accruals", "Favourable vs unfavourable variances"], conceptsAf: ["Kontantbegroting hou ontvangstes en betalings dop", "Geprojekteerde Inkomstestaat gebruik opbouings", "Gunstige vs ongunstige afwykings"] },
  "ACC-5": { summaryEn: "Inventory valuation methods: FIFO, weighted average, specific identification, and impact on profit.", summaryAf: "Voorraadwaardasie metodes: EI-EU, geweegde gemiddeld, spesifieke identifikasie, en impak op wins.", conceptsEn: ["FIFO assumes oldest stock sold first", "Weighted average smooths price changes", "Closing stock affects gross profit"], conceptsAf: ["EI-EU aanvaar oudste voorraad eerste verkoop", "Geweegde gemiddeld stryk prysveranderings glad", "Sluitvoorraad beïnvloed bruto wins"] },
  "ACC-6": { summaryEn: "Bank, debtor and creditor reconciliations to identify errors, omissions and timing differences.", summaryAf: "Bank-, debiteure- en krediteure rekonsiliasies om foute, weglatings en tydverskille te identifiseer.", conceptsEn: ["Outstanding deposits, unpresented cheques", "Bank charges and direct deposits", "Debtors' age analysis"], conceptsAf: ["Uitstaande deposito's, onaangebiede tjeks", "Bankkostes en direkte deposito's", "Debiteure ouderdomsanalise"] },
  "ACC-7": { summaryEn: "Internal controls over cash, fixed assets and inventory; the audit cycle and types of audit reports.", summaryAf: "Interne beheer oor kontant, vaste bates en voorraad; die ouditsiklus en tipes ouditverslae.", conceptsEn: ["Segregation of duties", "Authorisation and approval procedures", "Unqualified vs qualified audit reports"], conceptsAf: ["Skeiding van pligte", "Magtigings- en goedkeuringsprosedures", "Onbevoegde vs gekwalifiseerde ouditverslae"] },
  "ACC-8": { summaryEn: "Apply ethical principles in accounting: King IV, fraud prevention, corporate social investment.", summaryAf: "Pas etiese beginsels in rekeningkunde toe: King IV, bedrogvoorkoming, korporatiewe sosiale belegging.", conceptsEn: ["King IV: ethical, effective leadership", "Whistleblower protection (PDA)", "CSI: triple bottom line"], conceptsAf: ["King IV: etiese, effektiewe leierskap", "Klokkluider beskerming (PDA)", "KSB: drie-vlakke onderskoor"] },

  // --------------------- BUSINESS STUDIES ---------------------
  "BUS-1": {
    summaryEn: "Micro, market and macro environments; PESTLE/SWOT analysis and the Porter five-forces framework.",
    summaryAf: "Mikro-, mark- en makro-omgewings; PESTLE/SWOT-analise en die Porter vyf-kragte raamwerk.",
    conceptsEn: ["Micro = inside the business", "Market = customers, competitors, suppliers", "Macro = political, economic, social, etc."],
    conceptsAf: ["Mikro = binne die besigheid", "Mark = kliënte, mededingers, verskaffers", "Makro = polities, ekonomies, sosiaal, ens."],
    diagramsEn: [
      {
        label: "SWOT Analysis Matrix",
        ascii: [
          "  ┌─────────────────────┬─────────────────────┐",
          "  │   INTERNAL          │   INTERNAL          │",
          "  │   STRENGTHS         │   WEAKNESSES        │",
          "  │  • Strong brand     │  • High costs       │",
          "  │  • Skilled staff    │  • Poor cash flow   │",
          "  │  • Quality product  │  • Weak online pres.│",
          "  ├─────────────────────┼─────────────────────┤",
          "  │   EXTERNAL          │   EXTERNAL          │",
          "  │   OPPORTUNITIES     │   THREATS           │",
          "  │  • Growing market   │  • New competitors  │",
          "  │  • New technology   │  • Rising inflation │",
          "  │  • Export demand    │  • Changing laws    │",
          "  └─────────────────────┴─────────────────────┘",
          "",
          "  S + O = Maxi-Maxi strategy (use strengths to grab opportunities)",
          "  S + T = Maxi-Mini strategy (use strengths to minimise threats)",
          "  W + O = Mini-Maxi strategy (overcome weaknesses with opportunities)",
          "  W + T = Mini-Mini strategy (damage limitation)",
        ].join("\n"),
        caption: "SWOT divides business factors into internal (Strengths/Weaknesses) and external (Opportunities/Threats). Match strategies to quadrant pairs for exam questions.",
      },
      {
        label: "Porter's Five Forces",
        ascii: [
          "                 [POTENTIAL ENTRANTS]",
          "                  Threat of new entry",
          "                        ↓",
          "  [SUPPLIERS] ←→ [COMPETITIVE  ] ←→ [BUYERS]",
          "  Bargaining       RIVALRY          Bargaining",
          "  power of         (existing        power of",
          "  suppliers        firms)           buyers",
          "                        ↑",
          "                 [SUBSTITUTES]",
          "                  Threat of substitute",
          "                  products/services",
          "",
          "  High force = LOW attractiveness/profitability for the industry",
          "  Low force  = HIGH attractiveness/profitability for the industry",
        ].join("\n"),
        caption: "Porter's Five Forces analyses industry attractiveness. The stronger the forces, the harder it is to earn profit. Use this alongside SWOT to justify strategic choices.",
      },
    ],
    diagramsAf: [
      {
        label: "SWOT-Ontledingsmatriks",
        ascii: [
          "  ┌─────────────────────┬─────────────────────┐",
          "  │   INTERN            │   INTERN            │",
          "  │   STERKPUNTE        │   SWAKPUNTE         │",
          "  │  • Sterk handelsmerk│  • Hoë koste        │",
          "  │  • Bekwame personeel│  • Swak kontantvloei│",
          "  │  • Kwaliteitsprodukte│ • Swak aanlyn aans. │",
          "  ├─────────────────────┼─────────────────────┤",
          "  │   EKSTERN           │   EKSTERN           │",
          "  │   GELEENTHEDE       │   BEDREIGINGS       │",
          "  │  • Groeiende mark   │  • Nuwe mededingers │",
          "  │  • Nuwe tegnologie  │  • Stygende inflasie│",
          "  │  • Uitvoervraag     │  • Veranderende wette│",
          "  └─────────────────────┴─────────────────────┘",
          "",
          "  S + G = Maksi-Maksi strategie (gebruik sterkpunte vir geleenthede)",
          "  S + B = Maksi-Mini strategie (gebruik sterkpunte teen bedreigings)",
          "  W + G = Mini-Maksi strategie (oorkom swakpunte met geleenthede)",
          "  W + B = Mini-Mini strategie (skadebeperking)",
        ].join("\n"),
        caption: "SWOT verdeel besigheidsfaktore in intern (Sterkpunte/Swakpunte) en ekstern (Geleenthede/Bedreigings). Pas strategieë op kwadrante toe vir eksamenvrae.",
      },
      {
        label: "Porter se Vyf Kragte",
        ascii: [
          "                 [POTENSIËLE TOETREDERS]",
          "                  Bedreiging van nuwe toetrede",
          "                        ↓",
          "  [VERSKAFFERS] ←→ [MEDEDINGENDE ] ←→ [KOPERS]",
          "  Bedingings-       RIVALITEIT         Bedingings-",
          "  mag van           (bestaande         mag van",
          "  verskaffers       firmas)            kopers",
          "                        ↑",
          "                 [PLAASVERVANGERS]",
          "                  Bedreiging van plaasvervangende",
          "                  produkte/dienste",
          "",
          "  Hoë krag = LAE aantreklikheid/winsgewendheid vir die bedryf",
          "  Lae krag  = HOË aantreklikheid/winsgewendheid vir die bedryf",
        ].join("\n"),
        caption: "Porter se Vyf Kragte analiseer bedryfsaantreklikheid. Hoe sterker die kragte, hoe moeiliker is dit om wins te verdien. Gebruik dit saam met SWOT vir strategiese keuses.",
      },
    ],
  },
  "BUS-2": { summaryEn: "Quality control, total quality management (TQM), continuous improvement and ISO accreditation.", summaryAf: "Kwaliteitsbeheer, totale kwaliteitbestuur (TKB), voortdurende verbetering en ISO-akkreditering.", conceptsEn: ["TQM principles: customer focus, total participation", "Quality circles", "ISO 9000 series"], conceptsAf: ["TKB beginsels: kliëntfokus, totale deelname", "Kwaliteitsirkels", "ISO 9000 reeks"] },
  "BUS-3": {
    summaryEn: "Forms of ownership, contracts, presentations and investment options including the JSE.",
    summaryAf: "Vorme van eienaarskap, kontrakte, aanbiedings en beleggingsopsies insluitend die JSE.",
    conceptsEn: ["Sole prop, partnership, Pty Ltd, Ltd, NPC", "Risk-return relationship", "Insurance: insurable vs non-insurable risks"],
    conceptsAf: ["Alleeneienaar, vennootskap, Edms Bpk, Bpk, NMR", "Risiko-opbrengs verhouding", "Versekering: verseekbare vs nie-verseekbare risiko's"],
    diagramsEn: [
      {
        label: "Forms of Ownership — Key Comparisons",
        ascii: [
          "  FORM           │ OWNERS   │ LIABILITY  │ TAX        │ CONTINUITY",
          "  ───────────────┼──────────┼────────────┼────────────┼───────────",
          "  Sole           │    1     │ Unlimited  │ Personal   │ Ends with",
          "  Proprietorship │          │ (personal  │ income tax │ owner",
          "                 │          │ assets at  │            │",
          "                 │          │ risk)      │            │",
          "  ───────────────┼──────────┼────────────┼────────────┼───────────",
          "  Partnership    │  2–20    │ Unlimited  │ Personal   │ Ends if",
          "                 │          │ (joint &   │ income tax │ partner",
          "                 │          │ several)   │ each       │ leaves",
          "  ───────────────┼──────────┼────────────┼────────────┼───────────",
          "  Private Co     │  1–50    │ LIMITED    │ Company    │ Continues",
          "  (Pty) Ltd      │          │ (shares    │ tax 28%    │ regardless",
          "  ───────────────┼──────────┼────────────┼────────────┼───────────",
          "  Public Co Ltd  │  7+      │ LIMITED    │ Company    │ Continues",
          "  (JSE listed)   │(unlimited│            │ tax 28%    │ regardless",
          "  ───────────────┼──────────┼────────────┼────────────┼───────────",
          "  NPC            │   3+     │ LIMITED    │ Tax exempt │ Continues",
          "  (non-profit)   │          │            │ (Section   │",
          "                 │          │            │ 18A PBO)   │",
        ].join("\n"),
        caption: "Limited liability is the key advantage of Pty Ltd, Ltd, and NPC — owners' personal assets are protected. Sole props and partnerships carry unlimited personal liability.",
      },
      {
        label: "Sole Proprietor → Partnership → Private Co Growth Path",
        ascii: [
          "  [SOLE PROP]",
          "  One owner, all profit",
          "  All risk personal",
          "       │",
          "       │ Needs capital/skills",
          "       ↓",
          "  [PARTNERSHIP]",
          "  2–20 partners share profit & risk",
          "  Deed of partnership governs",
          "       │",
          "       │ Needs to limit liability",
          "       │ and attract more investors",
          "       ↓",
          "  [PRIVATE COMPANY (Pty) Ltd]",
          "  Separate legal entity",
          "  Limited liability for shareholders",
          "  Can sell shares (not on JSE)",
          "       │",
          "       │ Needs large public capital",
          "       ↓",
          "  [PUBLIC COMPANY Ltd]",
          "  Listed on JSE",
          "  Shares traded publicly",
          "  Strict JSE & Companies Act reporting",
        ].join("\n"),
        caption: "Businesses typically evolve through these ownership forms as they grow. Each step brings more capital potential but also more regulation and reporting obligations.",
      },
    ],
    diagramsAf: [
      {
        label: "Vorme van Eienaarskap — Sleutelvergelykings",
        ascii: [
          "  VORM           │ EIENAARS │ AANSPR.    │ BELASTING  │ VOORTSETTING",
          "  ───────────────┼──────────┼────────────┼────────────┼─────────────",
          "  Alleeneienaar  │    1     │ Onbeperk   │ Persoonlike│ Eindig met",
          "                 │          │ (persoonl. │ inkomste-  │ eienaar",
          "                 │          │ bates      │ belasting  │",
          "                 │          │ op risiko) │            │",
          "  ───────────────┼──────────┼────────────┼────────────┼─────────────",
          "  Vennootskap    │  2–20    │ Onbeperk   │ Persoonlike│ Eindig as",
          "                 │          │ (gesamentl.│ inkomste-  │ vennoot",
          "                 │          │ & afsonderl│ belasting  │ uittree",
          "  ───────────────┼──────────┼────────────┼────────────┼─────────────",
          "  Privaat Mpy    │  1–50    │ BEPERK     │ Mpy-bel.   │ Gaan voort",
          "  (Edms) Bpk     │          │ (aandele)  │ 28%        │ ongeag",
          "  ───────────────┼──────────┼────────────┼────────────┼─────────────",
          "  Publieke Mpy   │  7+      │ BEPERK     │ Mpy-bel.   │ Gaan voort",
          "  Bpk (JSE)      │(onbeperk)│            │ 28%        │ ongeag",
          "  ───────────────┼──────────┼────────────┼────────────┼─────────────",
          "  NMR (nie-wins) │   3+     │ BEPERK     │ Belasting- │ Gaan voort",
          "                 │          │            │ vrygestel  │",
        ].join("\n"),
        caption: "Beperkte aanspreeklikheid is die sleutelvoordeel van Edms Bpk, Bpk en NMR — eienaars se persoonlike bates is beskerm. Alleeneienaars en vennootskappe dra onbeperkte persoonlike aanspreeklikheid.",
      },
      {
        label: "Alleeneienaar → Vennootskap → Privaat Maatskappy Groeipad",
        ascii: [
          "  [ALLEENEIENAAR]",
          "  Een eienaar, alle wins",
          "  Alle risiko persoonlik",
          "       │",
          "       │ Benodig kapitaal/vaardighede",
          "       ↓",
          "  [VENNOOTSKAP]",
          "  2–20 vennote deel wins en risiko",
          "  Vennootskapakte reguleer verhouding",
          "       │",
          "       │ Benodig beperkte aanspreeklikheid",
          "       │ en meer beleggers",
          "       ↓",
          "  [PRIVAAT MAATSKAPPY (Edms) Bpk]",
          "  Afsonderlike regspersoon",
          "  Beperkte aanspreeklikheid vir aandeelhouers",
          "  Kan aandele verkoop (nie op JSE nie)",
          "       │",
          "       │ Benodig groot openbare kapitaal",
          "       ↓",
          "  [PUBLIEKE MAATSKAPPY Bpk]",
          "  Op JSE gelys",
          "  Aandele openbaar verhandel",
          "  Streng JSE & Maatskappywet verslaggewing",
        ].join("\n"),
        caption: "Besighede ontwikkel tipies deur hierdie eienaarskapvorms soos hulle groei. Elke stap bring meer kapitaalpotensiaal maar ook meer regulering en verslaggewing verpligtinge.",
      },
    ],
  },
  "BUS-4": { summaryEn: "Corporate Social Responsibility (CSR), Corporate Social Investment (CSI), human rights and BEE.", summaryAf: "Korporatiewe Sosiale Verantwoordelikheid (KSV), Korporatiewe Sosiale Belegging (KSB), menseregte en SEB.", conceptsEn: ["CSR is internal; CSI is external community spending", "Triple bottom line: people, planet, profit", "B-BBEE scorecard"], conceptsAf: ["KSV is intern; KSB is eksterne gemeenskapsbesteding", "Drie-vlak onderskoor: mense, planeet, wins", "B-BBSE punteblad"] },
  "BUS-5": { summaryEn: "Recruitment, selection, induction, salary determination, BCEA, EE Act and skills development.", summaryAf: "Werwing, keuring, induksie, salarisbepaling, BCEA, EE-Wet en vaardigheidsontwikkeling.", conceptsEn: ["BCEA = Basic Conditions of Employment Act", "EEA = Employment Equity Act", "Skills Development Levies for SETA"], conceptsAf: ["BCEA = Wet op Basiese Diensvoorwaardes", "EEA = Indiensnemingsbillikheidwet", "Vaardigheidsontwikkelings­heffings vir SETA"] },
  "BUS-6": { summaryEn: "Strategic management process: vision, mission, environmental scanning, strategy formulation and evaluation.", summaryAf: "Strategiese bestuursproses: visie, missie, omgewingsverkenning, strategie­formulering en evaluering.", conceptsEn: ["Vision = future ideal; Mission = how & why", "SWOT and PESTLE inform strategy", "Defensive, intensive, integration strategies"], conceptsAf: ["Visie = toekomstige ideaal; Missie = hoe en waarom", "SWOT en PESTLE inlig strategie", "Verdedigend, intensief, integrasie strategieë"] },
  "BUS-7": { summaryEn: "Quality management practices, total quality management, and the impact of quality on customer service.", summaryAf: "Kwaliteitsbestuurpraktyke, totale kwaliteitbestuur, en die impak van kwaliteit op kliëntediens.", conceptsEn: ["Quality control vs quality assurance", "PDCA cycle (Plan–Do–Check–Act)", "Customer satisfaction = repeat sales"], conceptsAf: ["Kwaliteitsbeheer vs kwaliteits­versekering", "PDCA siklus (Beplan–Doen–Kontroleer–Optree)", "Klanttevredenheid = herhaalde verkope"] },
  "BUS-8": { summaryEn: "Professional, ethical and responsible business practices; conflict of interest; whistle-blowing.", summaryAf: "Professionele, etiese en verantwoordelike sakepraktyke; belangebotsing; klokkluiding.", conceptsEn: ["Code of ethics + corporate governance", "Conflict of interest disclosure", "Protected Disclosures Act"], conceptsAf: ["Etiese kode + korporatiewe bestuur", "Openbaarmaking van belangebotsing", "Wet op Beskermde Bekendmakings"] },

  // --------------------- ECONOMICS ---------------------
  "ECO-1": {
    summaryEn: "Macroeconomic models, the circular flow, monetary & fiscal policy, the multiplier and accelerator.",
    summaryAf: "Makro-ekonomiese modelle, die siklusvloei, monetêre en fiskale beleid, die vermenigvuldiger en versneller.",
    conceptsEn: ["Y = C + I + G + (X − M)", "Repo rate vs CPI inflation target (3–6%)", "Multiplier k = 1/(1 − MPC)"],
    conceptsAf: ["Y = C + I + G + (X − M)", "Repo-koers vs IPV-inflasiedoelwit (3–6%)", "Vermenigvuldiger k = 1/(1 − MGV)"],
    diagramsEn: [
      {
        label: "Circular Flow of Income (Five-Sector Model)",
        ascii: [
          "                  ┌──────────────┐",
          "      ┌──────────▶│  GOVERNMENT  │◀──────────┐",
          "      │  Taxes    └──────┬───────┘  Taxes    │",
          "      │           Gov spending                │",
          "      │                 ↓                     │",
          "  ┌───┴────┐      ┌─────▼──────┐      ┌─────┴───┐",
          "  │HOUSE-  │ Wages│  PRODUCT   │ Sales │  FIRMS  │",
          "  │HOLDS   │◀─────│  MARKETS   │◀──────│         │",
          "  │        │──────▶            │──────▶│         │",
          "  └───┬────┘ Spend └─────┬──────┘ Goods└─────┬───┘",
          "      │           Factor markets              │",
          "      │                 ↑                     │",
          "      │  Savings  ┌─────┴───────┐  Investment │",
          "      └──────────▶│  FINANCIAL  │─────────────┘",
          "                  │  SECTOR     │",
          "                  └──────┬──────┘",
          "                  ┌──────┴──────┐",
          "      ┌───────────│   FOREIGN   │───────────┐",
          "      │  Exports  │   SECTOR    │  Imports  │",
          "      └──────────▶└────────────┘◀──────────┘",
          "",
          "  LEAKAGES (out): Taxes (T) + Savings (S) + Imports (M)",
          "  INJECTIONS (in): Gov spending (G) + Investment (I) + Exports (X)",
          "  Equilibrium: Leakages = Injections",
        ].join("\n"),
        caption: "In the five-sector circular flow, income circulates between households, firms, government, the financial sector, and foreign sector. Equilibrium is reached when total leakages equal total injections.",
      },
      {
        label: "Monetary vs Fiscal Policy",
        ascii: [
          "  ┌─────────────────────────────────────────────────┐",
          "  │              MONETARY POLICY                    │",
          "  │  Controlled by: South African Reserve Bank      │",
          "  │  Tool: Repo rate (rate SARB lends to banks)     │",
          "  │                                                  │",
          "  │  Repo rate UP → borrowing costs rise            │",
          "  │   → less spending → lower inflation             │",
          "  │                                                  │",
          "  │  Repo rate DOWN → borrowing costs fall          │",
          "  │   → more spending → economic stimulation        │",
          "  └─────────────────────────────────────────────────┘",
          "",
          "  ┌─────────────────────────────────────────────────┐",
          "  │              FISCAL POLICY                      │",
          "  │  Controlled by: National Treasury / Government  │",
          "  │  Tools: Government spending (G) and Tax (T)     │",
          "  │                                                  │",
          "  │  Expansionary: G↑ or T↓ → boost AD → growth    │",
          "  │  Contractionary: G↓ or T↑ → reduce AD → cool   │",
          "  └─────────────────────────────────────────────────┘",
          "",
          "  Both policies aim at price stability + economic growth.",
          "  Expansionary monetary + fiscal = maximum stimulus.",
        ].join("\n"),
        caption: "Monetary policy (SARB repo rate) and fiscal policy (Treasury spending/tax) are the two main tools used to manage the macroeconomy. They can work together or pull in opposite directions.",
      },
    ],
    diagramsAf: [
      {
        label: "Kringvloei van Inkomste (Vyf-Sektor Model)",
        ascii: [
          "                  ┌──────────────┐",
          "      ┌──────────▶│   REGERING   │◀──────────┐",
          "      │  Belasting └──────┬───────┘  Belasting│",
          "      │           Owerheidsbesteding           │",
          "      │                 ↓                     │",
          "  ┌───┴────┐      ┌─────▼──────┐      ┌─────┴───┐",
          "  │HUISHOU-│ Lone │  PRODUK-   │Verkope│  FIRMAS │",
          "  │DINGS   │◀─────│  MARKTE    │◀──────│         │",
          "  │        │──────▶            │──────▶│         │",
          "  └───┬────┘ Besteding └──┬────┘ Goedere└───┬────┘",
          "      │           Faktore markte             │",
          "      │                 ↑                    │",
          "      │  Besparing ┌────┴────────┐ Belegging │",
          "      └───────────▶│  FINANSIËLE │───────────┘",
          "                   │  SEKTOR     │",
          "                   └──────┬──────┘",
          "                   ┌──────┴──────┐",
          "      ┌────────────│  BUITELAND- │───────────┐",
          "      │  Uitvoer   │  SE SEKTOR  │  Invoere  │",
          "      └───────────▶└────────────┘◀──────────┘",
          "",
          "  WEGVLOEI (uit): Belasting (B) + Besparing (S) + Invoere (M)",
          "  INSPUITINGS (in): Owerheidsbest. (G) + Belegging (I) + Uitvoere (X)",
          "  Ewewig: Wegvloei = Inspuitings",
        ].join("\n"),
        caption: "In die vyf-sektor kringvloei sirkuleer inkomste tussen huishoudings, firmas, regering, die finansiële sektor en die buitelandse sektor. Ewewig word bereik wanneer totale wegvloei gelyk is aan totale inspuitings.",
      },
      {
        label: "Monetêre vs Fiskale Beleid",
        ascii: [
          "  ┌─────────────────────────────────────────────────┐",
          "  │              MONETÊRE BELEID                    │",
          "  │  Beheer deur: Suid-Afrikaanse Reserwebank       │",
          "  │  Instrument: Repo-koers (koers waarteen SARB    │",
          "  │              aan banke leen)                    │",
          "  │                                                  │",
          "  │  Repo op ↑ → leenkoste styg                    │",
          "  │   → minder besteding → laer inflasie            │",
          "  │                                                  │",
          "  │  Repo op ↓ → leenkoste daal                    │",
          "  │   → meer besteding → ekonomiese stimulasie      │",
          "  └─────────────────────────────────────────────────┘",
          "",
          "  ┌─────────────────────────────────────────────────┐",
          "  │              FISKALE BELEID                     │",
          "  │  Beheer deur: Nasionale Tesourie / Regering     │",
          "  │  Instrumente: Owerheidsbest. (G) en Belasting   │",
          "  │                                                  │",
          "  │  Ekspansionêr: G↑ of B↓ → verhoog GV → groei   │",
          "  │  Sametrekkend: G↓ of B↑ → verlaag GV → afkoel  │",
          "  └─────────────────────────────────────────────────┘",
          "",
          "  Beide beleide mik op prysstabiliteit + ekonomiese groei.",
        ].join("\n"),
        caption: "Monetêre beleid (SARB repo-koers) en fiskale beleid (Tesourie besteding/belasting) is die twee hoofhulpmiddels vir die bestuur van die makro-ekonomie.",
      },
    ],
  },
  "ECO-2": {
    summaryEn: "Demand, supply, price elasticity and market failures; production possibilities and consumer surplus.",
    summaryAf: "Vraag, aanbod, pryselastisiteit en markmislukkings; produksiemoontlikhede en verbruikersurplus.",
    conceptsEn: ["PED = %ΔQd / %ΔP", "Externalities and public goods", "Producer vs consumer surplus"],
    conceptsAf: ["PEV = %ΔQv / %ΔP", "Eksternaliteite en openbare goedere", "Produsente vs verbruikersurplus"],
    diagramsEn: [
      {
        label: "Supply and Demand Curves — Market Equilibrium",
        ascii: [
          "  Price (P)",
          "    │",
          "  P₂┤           S (Supply — slopes up)",
          "    │          /",
          "  P*┤─────────X  ← Equilibrium (E)",
          "    │        / \\",
          "  P₁┤       /   \\",
          "    │      /     D (Demand — slopes down)",
          "    │     /       \\",
          "    └────────────────── Quantity (Q)",
          "         Q₁   Q*  Q₂",
          "",
          "  At P*: Qd = Qs → market clears, no surplus or shortage",
          "  Price above P* → surplus (supply > demand) → price falls",
          "  Price below P* → shortage (demand > supply) → price rises",
          "",
          "  Demand SHIFTS RIGHT if: income rises, substitutes costlier,",
          "                          tastes change, population grows",
          "  Supply SHIFTS RIGHT if: input costs fall, technology improves,",
          "                          subsidies given, more producers enter",
        ].join("\n"),
        caption: "The equilibrium price and quantity are set where the demand curve meets the supply curve. Shifts in either curve change the equilibrium — identify the cause (shift) and the new price/quantity outcome.",
      },
      {
        label: "Price Elasticity of Demand (PED)",
        ascii: [
          "  PED = % change in Quantity Demanded",
          "        ─────────────────────────────",
          "           % change in Price",
          "",
          "  |PED| > 1  →  ELASTIC demand",
          "   (luxury goods, many substitutes)",
          "   Price↑ → big Qd↓ → total revenue FALLS",
          "",
          "  |PED| < 1  →  INELASTIC demand",
          "   (necessities, few substitutes, addictive)",
          "   Price↑ → small Qd↓ → total revenue RISES",
          "",
          "  |PED| = 1  →  Unit elastic",
          "   Price↑ → proportional Qd↓ → revenue unchanged",
          "",
          "  |PED| = 0  →  Perfectly inelastic (vertical D curve)",
          "   e.g. life-saving medicine — any price, same quantity",
          "",
          "  |PED| = ∞  →  Perfectly elastic (horizontal D curve)",
          "   e.g. identical commodities in a perfectly competitive market",
        ].join("\n"),
        caption: "PED measures how responsive quantity demanded is to a price change. Elastic goods are sensitive to price; inelastic goods are not. Firms and governments use PED to predict revenue effects of price changes.",
      },
    ],
    diagramsAf: [
      {
        label: "Vraag- en Aanbodkurwes — Markewewig",
        ascii: [
          "  Prys (P)",
          "    │",
          "  P₂┤           A (Aanbod — styg op)",
          "    │          /",
          "  P*┤─────────X  ← Ewewig (E)",
          "    │        / \\",
          "  P₁┤       /   \\",
          "    │      /     V (Vraag — daal af)",
          "    │     /       \\",
          "    └────────────────── Hoeveelheid (H)",
          "         H₁   H*  H₂",
          "",
          "  By P*: Hv = Ha → mark klaar, geen surplus of tekort",
          "  Prys bo P* → surplus (aanbod > vraag) → prys daal",
          "  Prys onder P* → tekort (vraag > aanbod) → prys styg",
          "",
          "  Vraag VERSKUIF REGS as: inkomste styg, plaasvervangers duurder,",
          "                           smaak verander, bevolking groei",
          "  Aanbod VERSKUIF REGS as: insette goedkoper, tegnologie verbeter,",
          "                            subsidies gegee, meer produsente toetree",
        ].join("\n"),
        caption: "Die ewewigsprys en hoeveelheid word bepaal waar die vraagkurwe die aanbodkurwe sny. Verskuiwings in enige kurwe verander die ewewig — identifiseer die oorsaak en die nuwe uitkoms.",
      },
      {
        label: "Pryselastisiteit van Vraag (PEV)",
        ascii: [
          "  PEV = % verandering in Gevraagde Hoeveelheid",
          "        ────────────────────────────────────────",
          "                % verandering in Prys",
          "",
          "  |PEV| > 1  →  ELASTIES vraagelastisiteit",
          "   (luukse goedere, baie plaasvervangers)",
          "   Prys↑ → groot Hv↓ → totale inkomste DAAL",
          "",
          "  |PEV| < 1  →  ONELASTIES vraagelastisiteit",
          "   (noodsaaklikhede, min plaasvervangers, verslawendend)",
          "   Prys↑ → klein Hv↓ → totale inkomste STYG",
          "",
          "  |PEV| = 1  →  Eenheidelasties",
          "   Prys↑ → proporsionele Hv↓ → inkomste onveranderd",
          "",
          "  |PEV| = 0  →  Volmaak onelasties (vertikale V-kurwe)",
          "   bv. lewensreddende medisyne — enige prys, dieselfde hoeveelheid",
          "",
          "  |PEV| = ∞  →  Volmaak elasties (horisontale V-kurwe)",
          "   bv. identiese kommoditeite in volmaak mededingende mark",
        ].join("\n"),
        caption: "PEV meet hoe reageer gevraagde hoeveelheid op 'n prysverandering. Elastiese goedere is prysgevoelig; onelastiese goedere nie. Firmas en regerings gebruik PEV om inkomste-effekte van prysveranderings te voorspel.",
      },
    ],
  },
  "ECO-3": { summaryEn: "South African economic history, BEE, RDP, GEAR, AsgiSA and the NDP 2030.", summaryAf: "Suid-Afrikaanse ekonomiese geskiedenis, SEB, HOP, GEAR, AsgiSA en die NOP 2030.", conceptsEn: ["RDP (1994) → GEAR (1996) → AsgiSA (2006) → NDP 2030", "B-BBEE codes of good practice", "Triple challenge: poverty, inequality, unemployment"], conceptsAf: ["HOP (1994) → GEAR (1996) → AsgiSA (2006) → NOP 2030", "B-BBSE kodes van goeie praktyk", "Drievoudige uitdaging: armoede, ongelykheid, werkloosheid"] },
  "ECO-4": { summaryEn: "Inflation, unemployment, tourism, environmental sustainability and recent SA economic issues.", summaryAf: "Inflasie, werkloosheid, toerisme, omgewingsvolhoubaarheid en onlangse SA ekonomiese kwessies.", conceptsEn: ["CPI vs PPI", "Cyclical, structural, frictional unemployment", "Carbon tax and green economy"], conceptsAf: ["IPV vs PPV", "Sikliese, strukturele, friksionele werkloosheid", "Koolstofbelasting en groen ekonomie"] },
  "ECO-5": { summaryEn: "Drivers of economic growth and the difference between growth (GDP) and development (HDI).", summaryAf: "Drywers van ekonomiese groei en die verskil tussen groei (BBP) en ontwikkeling (MOI).", conceptsEn: ["Real GDP excludes inflation", "HDI = life expectancy + education + income", "Demand- vs supply-side policies"], conceptsAf: ["Reële BBP sluit inflasie uit", "MOI = lewensverwagting + opvoeding + inkomste", "Vraag- vs aanbodkant beleide"] },
  "ECO-6": { summaryEn: "Industrial development policies in SA: SEZs, IPAP, beneficiation and infrastructure investment.", summaryAf: "Nywerheidsontwikkelingsbeleide in SA: SEZ's, IPAP, voordeligmaking en infrastruktuurbelegging.", conceptsEn: ["Special Economic Zones (SEZs)", "Industrial Policy Action Plan (IPAP)", "Beneficiation = adding value before export"], conceptsAf: ["Spesiale Ekonomiese Sones (SEZ's)", "Industriële Beleids Aksieplan (IPAP)", "Voordeligmaking = waarde toevoeg voor uitvoer"] },
  "ECO-7": { summaryEn: "Globalisation: trade, capital flows, MNCs and the role of WTO, IMF and World Bank.", summaryAf: "Globalisering: handel, kapitaalvloei, MNK's en die rol van WHO, IMF en Wêreldbank.", conceptsEn: ["Comparative advantage drives trade", "Capital account vs current account", "WTO promotes free trade rules"], conceptsAf: ["Vergelykbare voordeel dryf handel", "Kapitaalrekening vs lopende rekening", "WHO bevorder vrye handel reëls"] },
  "ECO-8": { summaryEn: "Tariffs, quotas, subsidies and arguments for and against protectionism vs free trade.", summaryAf: "Tariewe, kwotas, subsidies en argumente vir en teen proteksionisme vs vrye handel.", conceptsEn: ["Tariff = import tax", "Infant industry argument", "Free trade leads to specialisation"], conceptsAf: ["Tarief = invoerbelasting", "Babanywerheid argument", "Vrye handel lei tot spesialisering"] },

  // --------------------- GEOGRAPHY ---------------------
  "GEO-1": {
    summaryEn: "Mid-latitude and tropical cyclones, subtropical anticyclones, and South African weather systems.",
    summaryAf: "Mid-breedte en tropiese siklone, subtropiese antisiklone, en Suid-Afrikaanse weerstelsels.",
    conceptsEn: ["Cold and warm fronts in mid-latitude cyclones", "Eye, eye wall and rain bands in tropical cyclones", "Berg winds = warm, dry, descending"],
    conceptsAf: ["Koue en warm fronte in mid-breedte siklone", "Oog, oogmuur en reënbande in tropiese siklone", "Bergwinde = warm, droog, dalend"],
    diagramsEn: [
      {
        label: "Mid-Latitude Cyclone: Cold and Warm Fronts (Cross-Section)",
        ascii: [
          "  Direction of travel →",
          "",
          "         WARM SECTOR",
          "   Cold  ╱──────────╲  Warm",
          "   Front╱  (mild,   ╲ Front",
          "       ╱  overcast)  ╲",
          "      ╱               ╲",
          "─────╱─────────────────╲──────",
          "  COLD air                 WARM air",
          "  (heavy showers,          (light drizzle,",
          "   cumulonimbus)            stratus cloud)",
          "",
          "  Cold front = fast-moving, steep slope → heavy rain",
          "  Warm front = gentle slope → widespread light rain",
          "  Centre (L) = low pressure, converging winds (clockwise in S. Hemisphere)",
        ].join("\n"),
        caption: "The cold front undercuts the warm sector causing heavy showers. The warm front rises gradually, producing widespread light rain. Winds rotate clockwise around a low pressure system (Southern Hemisphere — Coriolis effect).",
      },
      {
        label: "Tropical Cyclone Structure (Overhead View)",
        ascii: [
          "              Rain bands",
          "          ╭─────────────────╮",
          "        ╭─┤  spiralling     ├─╮",
          "       ╭┤ │  inward winds   │ ├╮",
          "       ││ │  ╭───────────╮  │ ││",
          "       ││ │  │  EYE WALL │  │ ││",
          "       ││ │  │ ┌───────┐ │  │ ││",
          "       ││ │  │ │  EYE  │ │  │ ││",
          "       ││ │  │ │(calm) │ │  │ ││",
          "       ││ │  │ └───────┘ │  │ ││",
          "       ││ │  │  heaviest │  │ ││",
          "       ││ │  │   rain    │  │ ││",
          "       ╰┤ │  ╰───────────╯  │ ├╯",
          "        ╰─┤                 ├─╯",
          "          ╰─────────────────╯",
          "",
          "  Warm sea (≥26°C) supplies energy via evaporation",
          "  Winds weaken on landfall (water source cut off)",
        ].join("\n"),
        caption: "Tropical cyclones are powered by warm ocean water (≥26°C). The eye is calm; the eye wall has the strongest winds and heaviest rainfall. They weaken rapidly over land or cold water.",
      },
    ],
    diagramsAf: [
      {
        label: "Mid-Breedte Sikloon: Koue en Warm Fronte (Deursnit)",
        ascii: [
          "  Bewegingsrigting →",
          "",
          "         WARM SEKTOR",
          "   Koue  ╱──────────╲  Warm",
          "   Front╱ (sag,      ╲ Front",
          "       ╱  bewolk)     ╲",
          "      ╱               ╲",
          "─────╱─────────────────╲──────",
          "  KOUE lug                 WARM lug",
          "  (swaar buie,             (ligte motrëen,",
          "   kumulonimbus)            stratus wolk)",
          "",
          "  Koue front = vinnig, steil helling → swaar reën",
          "  Warm front = geleidelik helling → wydverspreide ligte reën",
          "  Middel (L) = lae druk, naderende winde (kloksgewys in S. Halfrond)",
        ].join("\n"),
        caption: "Die koue front sny onder die warm sektor in en veroorsaak swaar buie. Die warm front styg geleidelik en produseer wydverspreide ligte reën. Winde roteer kloksgewys rondom 'n laedrukstelsel (Suidelike Halfrond — Coriolis-effek).",
      },
      {
        label: "Tropiese Sikloon Struktuur (Bovoor-aansig)",
        ascii: [
          "              Reënbande",
          "          ╭─────────────────╮",
          "        ╭─┤  spiraalvormige  ├─╮",
          "       ╭┤ │  invloei-winde   │ ├╮",
          "       ││ │  ╭───────────╮   │ ││",
          "       ││ │  │  OOGMUUR  │   │ ││",
          "       ││ │  │ ┌───────┐ │   │ ││",
          "       ││ │  │ │  OOG  │ │   │ ││",
          "       ││ │  │ │(kalm) │ │   │ ││",
          "       ││ │  │ └───────┘ │   │ ││",
          "       ││ │  │  swaarste │   │ ││",
          "       ││ │  │   reën    │   │ ││",
          "       ╰┤ │  ╰───────────╯   │ ├╯",
          "        ╰─┤                  ├─╯",
          "          ╰─────────────────╯",
          "",
          "  Warm see (≥26°C) verskaf energie deur verdamping",
          "  Winde verswak by landval (waterbron afgesluit)",
        ].join("\n"),
        caption: "Tropiese siklone word aangedryf deur warm oseaan water (≥26°C). Die oog is kalm; die oogmuur het die sterkste winde en swaarste reënval. Hulle verswak vinnig oor land of koue water.",
      },
    ],
  },
  "GEO-2": {
    summaryEn: "Drainage systems, fluvial processes, river profiles and catchment management.",
    summaryAf: "Dreineringsisteme, fluviale prosesse, rivierprofiele en opvangsbestuur.",
    conceptsEn: ["Erosion: hydraulic action, abrasion, attrition, solution", "Long profile: youth → mature → old", "Stream order (Strahler)"],
    conceptsAf: ["Erosie: hidrouliese aksie, skuring, atritie, oplossing", "Lang profiel: jong → volwasse → oud", "Stroomorde (Strahler)"],
    diagramsEn: [
      {
        label: "River Long Profile: Youth → Mature → Old Age",
        ascii: [
          "  Altitude",
          "  ▲",
          "  │ YOUTH (upper course)",
          "  │ * V-shaped valley, waterfalls",
          "  │  ╲ * steep gradient",
          "  │   ╲ * dominant process: vertical erosion",
          "  │    ╲___",
          "  │        ╲ MATURE (middle course)",
          "  │         ╲___  * meanders begin",
          "  │              ╲ * lateral erosion + deposition",
          "  │               ╲____",
          "  │                    ╲____ OLD AGE (lower course)",
          "  │                         * wide floodplain",
          "  │                         * oxbow lakes",
          "  │                         * dominant: deposition",
          "  └──────────────────────────────────────► Distance to sea",
          "",
          "  Gradient decreases from source → mouth",
          "  Energy: high near source, lowest at mouth",
        ].join("\n"),
        caption: "The long profile shows gradient change from steep (youth) to gentle (old age). Erosion dominates upstream; deposition dominates downstream as energy decreases.",
      },
      {
        label: "Rock Cycle",
        ascii: [
          "          MAGMA",
          "           │  cooling & solidification",
          "           ▼",
          "     IGNEOUS ROCK ─────────────────────────╮",
          "           │ weathering & erosion           │",
          "           ▼                                │",
          "    SEDIMENT (transported)                  │ heat",
          "           │ compaction & cementation       │ &",
          "           ▼                                │ pressure",
          "   SEDIMENTARY ROCK ──────────────────────► │",
          "           │ heat & pressure (no melting)   │",
          "           ▼                                │",
          "  METAMORPHIC ROCK ─── melting ────────────►│",
          "                                            │",
          "  All rock types → weathering → sediment ──►╯",
          "",
          "  Examples:",
          "  Igneous: granite, basalt   Sedimentary: sandstone, shale",
          "  Metamorphic: marble, slate",
        ].join("\n"),
        caption: "The rock cycle shows how rocks are continuously transformed. Key processes: weathering breaks rock down; heat/pressure converts to metamorphic; melting then cooling creates igneous rock.",
      },
    ],
    diagramsAf: [
      {
        label: "Rivier Lang Profiel: Jong → Volwasse → Ou Ouderdom",
        ascii: [
          "  Hoogte",
          "  ▲",
          "  │ JONG (bokant)",
          "  │ * V-vormige vallei, watervalle",
          "  │  ╲ * steil helling",
          "  │   ╲ * dominante proses: vertikale erosie",
          "  │    ╲___",
          "  │        ╲ VOLWASSE (middelloop)",
          "  │         ╲___  * meanders begin",
          "  │              ╲ * sywaartse erosie + afsetting",
          "  │               ╲____",
          "  │                    ╲____ OU OUDERDOM (onderkant)",
          "  │                         * breë vloedvlakte",
          "  │                         * ossebooglake",
          "  │                         * dominant: afsetting",
          "  └──────────────────────────────────────► Afstand na see",
          "",
          "  Helling neem af van bron → mond",
          "  Energie: hoog naby bron, laagste by mond",
        ].join("\n"),
        caption: "Die lang profiel toon hellingverandering van steil (jong) na sag (ou ouderdom). Erosie domineer stroomop; afsetting domineer stroomaf namate energie afneem.",
      },
      {
        label: "Gesteentesiklus",
        ascii: [
          "          MAGMA",
          "           │  afkoeling en stollling",
          "           ▼",
          "    STOLLINGSGESTEENTE ──────────────────────╮",
          "           │ verwering en erosie             │",
          "           ▼                                 │",
          "    SEDIMENT (vervoer)                       │ hitte",
          "           │ kompaksie en sementering        │ en",
          "           ▼                                 │ druk",
          "  SEDIMENTÊRE GESTEENTE ──────────────────► │",
          "           │ hitte en druk (geen smelting)   │",
          "           ▼                                 │",
          "  METAMORFIESE GESTEENTE ─ smelting ────────►│",
          "                                             │",
          "  Alle tipes → verwering → sediment ────────►╯",
          "",
          "  Voorbeelde:",
          "  Stoll: graniet, basalt   Sedimentêr: sandsteen, skalie",
          "  Metamorfies: marmer, leie",
        ].join("\n"),
        caption: "Die gesteentesiklus toon hoe gesteentes voortdurend omgeskakel word. Sleutelprosesse: verwering breek gesteente af; hitte/druk skep metamorfiese gesteente; smelting dan afkoeling skep stollingsgesteente.",
      },
    ],
  },
  "GEO-3": { summaryEn: "Rural and urban settlements, urbanisation challenges and land-use models in South Africa.", summaryAf: "Landelike en stedelike nedersettings, verstedelikingsuitdagings en grondgebruik modelle in Suid-Afrika.", conceptsEn: ["Hierarchy of settlements", "Apartheid spatial legacy", "Burgess concentric and Hoyt sector models"], conceptsAf: ["Hiërargie van nedersettings", "Apartheid ruimtelike erfenis", "Burgess konsentriese en Hoyt sektor modelle"] },
  "GEO-4": { summaryEn: "Primary, secondary, tertiary and quaternary economic sectors and their role in the SA economy.", summaryAf: "Primêre, sekondêre, tersiêre en kwartêre ekonomiese sektore en hul rol in die SA ekonomie.", conceptsEn: ["Primary = raw materials", "Secondary = manufacturing", "Quaternary = knowledge & ICT"], conceptsAf: ["Primêr = grondstowwe", "Sekondêr = vervaardiging", "Kwartêr = kennis en IKT"] },
  "GEO-5": { summaryEn: "Topographic and orthophoto map skills, magnetic declination, GIS layers and remote sensing.", summaryAf: "Topografiese en ortofoto kaart vaardighede, magnetiese deklinasie, GIS lae en afstand­waarneming.", conceptsEn: ["1:50 000 topo map standard", "Magnetic vs true bearing", "GIS = layered geographic data"], conceptsAf: ["1:50 000 topo kaart standaard", "Magnetiese vs ware peiling", "GIS = gelaagde geografiese data"] },
  "GEO-6": { summaryEn: "Water resources in South Africa: catchments, dams, transfers, demand management and water scarcity.", summaryAf: "Waterhulpbronne in Suid-Afrika: opvangs, damme, oordragte, vraagbestuur en waterskaarsheid.", conceptsEn: ["Lesotho Highlands Water Project", "Catchment Management Agencies (CMAs)", "Domestic, agricultural and industrial water use"], conceptsAf: ["Lesotho Hooglande Waterprojek", "Opvangsbestuursagentskappe (OBA's)", "Huishoudelike, landbou en industriële watergebruik"] },

  // --------------------- HISTORY ---------------------
  "HIS-1": {
    summaryEn: "Origins and development of the Cold War (1945–1991): superpower rivalry, nuclear arms race, and proxy conflicts.",
    summaryAf: "Oorsprong en ontwikkeling van die Koue Oorlog (1945–1991): supermoondheid mededinging, kernwapenwedloop, en volmag konflikte.",
    conceptsEn: ["Truman Doctrine and Marshall Plan (1947)", "Berlin Blockade/Airlift (1948–49)", "Mutually Assured Destruction (MAD)"],
    conceptsAf: ["Truman-doktrine en Marshallplan (1947)", "Berlyn-blokkade/Lugbrug (1948–49)", "Wedersydse Versekerde Vernietiging (MAD)"],
    exampleEn: { question: "Explain how the Berlin Crisis (1961) intensified Cold War tensions.", solution: "USSR erected the Berlin Wall to stop emigration; West read it as aggression; NATO forces remained on alert — symbolising the Iron Curtain made physical." },
    exampleAf: { question: "Verduidelik hoe die Berlyn-krisis (1961) Koue Oorlog spanning verskerp het.", solution: "USSR het die Berlynse Muur opgerig om emigrasie te stop; die Weste het dit as aggressie beskou; NAVO-magte was op hoë aandag — dit het die Ystergordyn fisiese vorm gegee." },
    diagramsEn: [
      {
        label: "Cold War Timeline: Key Events 1945–1991",
        ascii: [
          "  1945 ──┬── WW2 ends; USA & USSR emerge as superpowers",
          "         │   UN founded; Germany divided into zones",
          "  1947 ──┼── Truman Doctrine (contain communism)",
          "         │   Marshall Plan ($13B aid to rebuild W. Europe)",
          "  1948 ──┼── Berlin Blockade — USSR blocks W. Berlin roads",
          "  1949 ──┼── Berlin Airlift success; NATO formed",
          "         │   USSR tests atomic bomb; China goes communist",
          "  1950 ──┼── Korean War begins (proxy conflict)",
          "  1953 ──┼── Korean War ends; Stalin dies",
          "  1957 ──┼── USSR launches Sputnik (Space Race begins)",
          "  1961 ──┼── Berlin Wall erected; Bay of Pigs invasion",
          "  1962 ──┼── Cuban Missile Crisis (closest to nuclear war)",
          "  1963 ──┼── JFK assassinated; Hotline established",
          "  1969 ──┼── USA lands on moon (Apollo 11)",
          "  1972 ──┼── Nixon visits China; SALT I arms treaty",
          "  1979 ──┼── USSR invades Afghanistan",
          "  1985 ──┼── Gorbachev introduces glasnost & perestroika",
          "  1989 ──┼── Berlin Wall falls (9 Nov); Eastern Europe freed",
          "  1991 ──┴── USSR dissolves; Cold War ends",
        ].join("\n"),
        caption: "The Cold War was characterised by ideological rivalry (capitalism vs communism), arms races, and proxy wars rather than direct military conflict between the USA and USSR.",
      },
      {
        label: "Cold War Alliances Map (Simplified)",
        ascii: [
          "  ┌──────────────────────────────────────────────────┐",
          "  │             COLD WAR BLOCS                      │",
          "  ├─────────────────────┬────────────────────────────┤",
          "  │   WESTERN BLOC      │   EASTERN BLOC             │",
          "  │   (NATO)            │   (Warsaw Pact)            │",
          "  │                     │                            │",
          "  │  • USA              │  • USSR                    │",
          "  │  • UK               │  • East Germany            │",
          "  │  • France           │  • Poland                  │",
          "  │  • West Germany     │  • Czechoslovakia          │",
          "  │  • Canada           │  • Hungary                 │",
          "  │  • Turkey           │  • Romania                 │",
          "  │  • Italy            │  • Bulgaria                │",
          "  ├─────────────────────┼────────────────────────────┤",
          "  │  IDEOLOGY: Liberal  │  IDEOLOGY: Communist       │",
          "  │  democracy +        │  one-party state +         │",
          "  │  capitalism         │  state-planned economy     │",
          "  ├─────────────────────┴────────────────────────────┤",
          "  │  NON-ALIGNED MOVEMENT: countries that refused    │",
          "  │  to join either bloc (e.g. India, Egypt, Ghana)  │",
          "  └──────────────────────────────────────────────────┘",
        ].join("\n"),
        caption: "NATO (Western) vs Warsaw Pact (Eastern) divided Europe politically and militarily. The Non-Aligned Movement was a third path taken by many newly independent nations.",
      },
    ],
    diagramsAf: [
      {
        label: "Koue Oorlog Tydlyn: Sleutelgebeurtenisse 1945–1991",
        ascii: [
          "  1945 ──┬── WO2 eindig; VSA & USSR kom as supermoondede na vore",
          "         │   VN gestig; Duitsland verdeel in sones",
          "  1947 ──┼── Truman-doktrine (bevat kommunisme)",
          "         │   Marshallplan ($13B hulp vir W. Europa-heropbou)",
          "  1948 ──┼── Berlyn-blokkade — USSR blokkeer W. Berlyn-paaie",
          "  1949 ──┼── Berlyn-lugbrug sukses; NAVO gestig",
          "         │   USSR toets atoombom; Sjina word kommunisties",
          "  1950 ──┼── Koreaanse Oorlog begin (volmag konflik)",
          "  1953 ──┼── Koreaanse Oorlog eindig; Stalin sterf",
          "  1957 ──┼── USSR lanseer Spoetnik (Ruimtewedloop begin)",
          "  1961 ──┼── Berlynse Muur opgerig; Varkbaai-inval",
          "  1962 ──┼── Kubaanse Missilkrisis (naaste aan kernoorlog)",
          "  1963 ──┼── JFK vermoor; Warm lyn ingestel",
          "  1969 ──┼── VSA land op maan (Apollo 11)",
          "  1972 ──┼── Nixon besoek China; SALT I wapenverdrag",
          "  1979 ──┼── USSR val Afghanistan binne",
          "  1985 ──┼── Gorbatsjof stel glasnost & perestroika in",
          "  1989 ──┼── Berlynse Muur val (9 Nov); Oos-Europa vrygestel",
          "  1991 ──┴── USSR ontbind; Koue Oorlog eindig",
        ].join("\n"),
        caption: "Die Koue Oorlog is gekenmerk deur ideologiese mededinging (kapitalisme vs kommunisme), wapenwedlope, en volmag-oorloë eerder as direkte militêre konflik tussen die VSA en USSR.",
      },
      {
        label: "Koue Oorlog Alliansies (Vereenvoudig)",
        ascii: [
          "  ┌──────────────────────────────────────────────────┐",
          "  │             KOUE OORLOG BLOKKE                  │",
          "  ├─────────────────────┬────────────────────────────┤",
          "  │   WESTELIKE BLOK    │   OOSTELIKE BLOK           │",
          "  │   (NAVO)            │   (Warskou Pakt)           │",
          "  │                     │                            │",
          "  │  • VSA              │  • USSR                    │",
          "  │  • VK               │  • Oos-Duitsland           │",
          "  │  • Frankryk         │  • Pole                    │",
          "  │  • Wes-Duitsland    │  • Tsjeggo-Slowakye        │",
          "  │  • Kanada           │  • Hongarye                │",
          "  │  • Turkye           │  • Roemenië                │",
          "  │  • Italië           │  • Bulgarye                │",
          "  ├─────────────────────┼────────────────────────────┤",
          "  │  IDEOLOGIE: Liberale│  IDEOLOGIE: Kommunistiese  │",
          "  │  demokrasie +       │  een-party-staat +         │",
          "  │  kapitalisme        │  staatsbeplande ekonomie   │",
          "  ├─────────────────────┴────────────────────────────┤",
          "  │  NIE-VERBONDE BEWEGING: lande wat geweier het    │",
          "  │  om enige blok te sluit (bv. Indië, Egipte)     │",
          "  └──────────────────────────────────────────────────┘",
        ].join("\n"),
        caption: "NAVO (Westelik) vs Warskou Pakt (Oostelik) het Europa polities en militêr verdeel. Die Nie-verbonde Beweging was 'n derde weg vir baie nuut-onafhanklike nasies.",
      },
    ],
  },
  "HIS-2": { summaryEn: "Mass democratic movements in South Africa, Poland (Solidarity), and US civil rights in the 1970s–1980s.", summaryAf: "Massa demokratiese bewegings in Suid-Afrika, Pole (Solidariteit), en VS burgerregte in die 1970s–1980s.", conceptsEn: ["UDF (1983) and Mass Democratic Movement", "Solidarity trade union (Poland, 1980)", "Anti-apartheid international solidarity"], conceptsAf: ["UDF (1983) en Massamdemokratiese Beweging", "Solidariteits vakbond (Pole, 1980)", "Internasionale anti-apartheid solidariteit"], exampleEn: { question: "How did the UDF (1983) challenge apartheid?", solution: "The UDF united over 400 anti-apartheid organisations; used boycotts, stayaways and consumer action to make apartheid ungovernable without resorting to armed struggle." }, exampleAf: { question: "Hoe het die UDF (1983) apartheid uitgedaag?", solution: "Die UDF het meer as 400 anti-apartheidorganisasies verenig; gebruik boikotte, wegbly-aksies en verbruikersaksie om apartheid onregeerbaar te maak sonder gewapende stryd." } },
  "HIS-3": { summaryEn: "The collapse of communism in Eastern Europe, fall of the Berlin Wall (1989), and dissolution of the USSR (1991).", summaryAf: "Die ineenstorting van kommunisme in Oos-Europa, val van die Berlynse Muur (1989), en ontbinding van die USSR (1991).", conceptsEn: ["Gorbachev's glasnost and perestroika", "Fall of Berlin Wall November 1989", "Unipolar world order under US hegemony"], conceptsAf: ["Gorbatsjof se glasnost en perestroika", "Val van Berlynse Muur November 1989", "Unipolêre wêreldorde onder VSA hegemonie"], exampleEn: { question: "Why did the USSR dissolve in 1991?", solution: "Economic stagnation, nationalist movements in Soviet republics, and Gorbachev's reforms (glasnost/perestroika) weakened central control until 15 republics declared independence." }, exampleAf: { question: "Hoekom het die USSR in 1991 ontbind?", solution: "Ekonomiese stagnasie, nasionalistiese bewegings in Sowjet-republieke, en Gorbatsjof se hervormings het sentrale beheer verswak totdat 15 republieke onafhanklikheid verklaar het." } },
  "HIS-4": { summaryEn: "Globalisation: economic integration, role of TNCs, cultural homogenisation, and inequality debates.", summaryAf: "Globalisering: ekonomiese integrasie, rol van TNC's, kulturele homogenisering, en ongelykheidsdebatte.", conceptsEn: ["WTO, IMF and World Bank as globalisation drivers", "TNCs shift production to low-wage countries", "Anti-globalisation movements (e.g. Seattle 1999)"], conceptsAf: ["WTO, IMF en Wêreldbank as globaliseringsdrywers", "TNC's verskuif produksie na lae-loon lande", "Anti-globaliseringsbeweging (bv. Seattle 1999)"], exampleEn: { question: "Explain one positive and one negative impact of globalisation on developing countries.", solution: "Positive: FDI creates jobs and transfers technology. Negative: TNCs repatriate profits, so local economies don't retain the full benefit." }, exampleAf: { question: "Verduidelik een positiewe en een negatiewe impak van globalisering op ontwikkelende lande.", solution: "Positief: BDI skep werksgeleenthede en oordra tegnologie. Negatief: TNC's stuur winste terug, so plaaslike ekonomieë hou nie die volle voordeel nie." } },
  "HIS-5": { summaryEn: "Decolonisation in Africa, the Rwandan genocide (1994), and challenges of post-independence governance.", summaryAf: "Dekolonisasie in Afrika, die Rwandese volksmoord (1994), en uitdagings van post-onafhanklikheidsbestuur.", conceptsEn: ["Wind of Change speech (Macmillan, 1960)", "Rwanda: Hutu/Tutsi ethnic manipulation by Belgian colonists", "Structural Adjustment Programmes and economic dependency"], conceptsAf: ["Wind van Verandering-toespraak (Macmillan, 1960)", "Rwanda: Hutu/Tutsi etniese manipulasie deur Belgiese koloniste", "Strukturele aanpassingsprogramme en ekonomiese afhanklikheid"], exampleEn: { question: "How did Belgian colonial rule contribute to the Rwandan genocide?", solution: "Belgium institutionalised the Hutu/Tutsi divide via identity cards (1933), turning a fluid social distinction into a rigid racial hierarchy that fuelled ethnic hatred after independence." }, exampleAf: { question: "Hoe het Belgiese koloniale bewind bygedra tot die Rwandese volksmoord?", solution: "België het die Hutu/Tutsi-verdeling geïnstitusionaliseer via identiteitskaarte (1933), wat 'n vloeiende sosiale onderskeid in 'n rigiede rassehiërargie verander het wat etniese haat na onafhanklikheid aangeblaas het." } },
  "HIS-6": {
    summaryEn: "South Africa's Truth and Reconciliation Commission (TRC): amnesty, reparation, and contested healing after apartheid.",
    summaryAf: "Suid-Afrika se Waarheids- en Versoeningskommissie (WVK): amnestie, herstel, en betwiste genesing na apartheid.",
    conceptsEn: ["TRC set up under Promotion of National Unity Act (1995)", "Amnesty in exchange for full disclosure", "Criticism: justice vs reconciliation trade-off"],
    conceptsAf: ["WVK gestig onder Wet op Bevordering van Nasionale Eenheid (1995)", "Amnestie in ruil vir volledige openbaarmaking", "Kritiek: geregtigheid vs versoening afruiling"],
    exampleEn: { question: "Evaluate whether the TRC achieved justice for victims.", solution: "The TRC achieved acknowledgement of truth and symbolic reconciliation, but critics argue amnesty without prosecution denied victims retributive justice; reparations were also delayed and insufficient." },
    exampleAf: { question: "Evalueer of die WVK geregtigheid vir slagoffers bereik het.", solution: "Die WVK het erkenning van waarheid en simboliese versoening bereik, maar kritici voer aan dat amnestie sonder vervolging slagoffers vergeldende geregtigheid ontsê het; herstelbetalings was ook vertraag en onvoldoende." },
    diagramsEn: [
      {
        label: "TRC Structure: Three Committees",
        ascii: [
          "  ┌──────────────────────────────────────────────────┐",
          "  │    TRUTH & RECONCILIATION COMMISSION (TRC)       │",
          "  │    Chairperson: Archbishop Desmond Tutu          │",
          "  │    Established: 1995 (Promotion of National      │",
          "  │                       Unity and Reconciliation   │",
          "  │                       Act, Act 34 of 1995)       │",
          "  └──────────┬─────────────────┬────────────────┬───┘",
          "             │                 │                │",
          "  ┌──────────▼──────┐ ┌────────▼───────┐ ┌─────▼────────────┐",
          "  │  HUMAN RIGHTS   │ │    AMNESTY     │ │   REPARATION &   │",
          "  │  VIOLATIONS     │ │   COMMITTEE    │ │  REHABILITATION  │",
          "  │  COMMITTEE      │ │                │ │  COMMITTEE       │",
          "  │                 │ │                │ │                  │",
          "  │ • Heard victims'│ │ • Granted      │ │ • Recommended    │",
          "  │   testimonies   │ │   amnesty IF:  │ │   reparations    │",
          "  │ • Investigated  │ │   act was      │ │   to victims     │",
          "  │   gross human   │ │   political +  │ │ • Community      │",
          "  │   rights        │ │   fully        │ │   rehabilitation │",
          "  │   violations    │ │   disclosed    │ │   programs       │",
          "  └─────────────────┘ └────────────────┘ └──────────────────┘",
          "",
          "  KEY TENSION: Amnesty without prosecution vs victims' right",
          "  to retributive justice — the justice vs reconciliation debate.",
        ].join("\n"),
        caption: "The TRC had three committees with distinct roles. Perpetrators could apply for amnesty only if their act was politically motivated AND they made full disclosure. Victims received symbolic reparations but no criminal prosecution.",
      },
      {
        label: "TRC Process Flow",
        ascii: [
          "  [END OF APARTHEID]",
          "  1994 — First democratic election",
          "         Nelson Mandela elected President",
          "         ↓",
          "  [POLITICAL DECISION]",
          "  1995 — TRC established (Act 34 of 1995)",
          "         'Amnesty for Truth' framework agreed",
          "         ↓",
          "  [HEARINGS PHASE: 1996–1998]",
          "  • Human Rights Violations Committee holds",
          "    public hearings nationally",
          "  • ~21,000 victims give testimony",
          "  • 7,112 amnesty applications received",
          "         ↓",
          "  [AMNESTY DECISIONS]",
          "  • 1,512 amnesty grants (politically motivated +",
          "    full disclosure criteria both met)",
          "  • 5,392 applications REFUSED (criteria not met)",
          "         ↓",
          "  [TRC FINAL REPORT: 1998 / Vol. 6: 2003]",
          "  • Named perpetrators; documented abuses",
          "  • Recommended reparations (R30,000 per victim)",
          "         ↓",
          "  [LEGACY & CRITICISM]",
          "  • Reparations delayed and reduced by government",
          "  • Some victims felt justice was denied',",
          "  • Others see TRC as enabling peaceful transition",
        ].join("\n"),
        caption: "The TRC process moved from political decision through public hearings to amnesty decisions and a final report. Its legacy is contested: it enabled peaceful transition but left many victims feeling justice was incomplete.",
      },
    ],
    diagramsAf: [
      {
        label: "WVK Struktuur: Drie Komitees",
        ascii: [
          "  ┌──────────────────────────────────────────────────┐",
          "  │  WAARHEIDS- EN VERSOENINGSKOMMISSIE (WVK)        │",
          "  │  Voorsitter: Aartsbiskop Desmond Tutu            │",
          "  │  Gestig: 1995 (Wet op Bevordering van Nasionale  │",
          "  │               Eenheid en Versoening, Wet 34/1995)│",
          "  └──────────┬─────────────────┬────────────────┬───┘",
          "             │                 │                │",
          "  ┌──────────▼──────┐ ┌────────▼───────┐ ┌─────▼────────────┐",
          "  │  MENSEREGTE-    │ │    AMNESTIE-   │ │   HERSTEL- EN    │",
          "  │  SKENDING       │ │    KOMITEE     │ │  REHABILITASIE-  │",
          "  │  KOMITEE        │ │                │ │  KOMITEE         │",
          "  │                 │ │                │ │                  │",
          "  │ • Hoor slagoffers│ • Verleen      │ │ • Aanbeveel      │",
          "  │   getuienisse   │ │  amnestie AS: │ │  herstelbetalings│",
          "  │ • Ondersoek     │ │  daad was     │ │  aan slagoffers  │",
          "  │   growwe        │ │  polities +   │ │ • Gemeenskaps-   │",
          "  │   menseregte-   │ │  volledig     │ │  rehabilitasie   │",
          "  │   skending      │ │  openbaar     │ │  programme       │",
          "  └─────────────────┘ └────────────────┘ └──────────────────┘",
          "",
          "  KERN SPANNING: Amnestie sonder vervolging vs slagoffers se reg",
          "  op vergeldende geregtigheid — die geregtigheid vs versoening debat.",
        ].join("\n"),
        caption: "Die WVK het drie komitees met afsonderlike rolle gehad. Oortreders kon amnestie aanvra slegs as hul daad polities gemotiveer was EN hulle volledige openbaarmaking gemaak het.",
      },
      {
        label: "WVK Prosesvloei",
        ascii: [
          "  [EINDE VAN APARTHEID]",
          "  1994 — Eerste demokratiese verkiesing",
          "         Nelson Mandela as President verkies",
          "         ↓",
          "  [POLITIESE BESLUIT]",
          "  1995 — WVK gestig (Wet 34 van 1995)",
          "         'Amnestie vir Waarheid' raamwerk ooreengekom",
          "         ↓",
          "  [VERHOOR-FASE: 1996–1998]",
          "  • Menseregte-Skending Komitee hou openbare",
          "    verhore nasionaal",
          "  • ~21,000 slagoffers lê getuienis af",
          "  • 7,112 amnestie aansoeke ontvang",
          "         ↓",
          "  [AMNESTIE BESLUITE]",
          "  • 1,512 amnestie toekennings (polities gemotiveer +",
          "    volledige openbaarmaking beide voldoen)",
          "  • 5,392 aansoeke GEWEIER (kriteria nie voldoen)",
          "         ↓",
          "  [WVK FINALE VERSLAG: 1998 / Vol. 6: 2003]",
          "  • Oortreders genoem; misbruike gedokumenteer",
          "  • Aanbeveel herstelbetalings (R30,000 per slagoffer)",
          "         ↓",
          "  [NALATENSKAP & KRITIEK]",
          "  • Herstelbetalings vertraag en verminder deur regering",
          "  • Sommige slagoffers voel geregtigheid was ontsê',",
          "  • Ander sien WVK as moontlikmaking van vreedsame oorgang',",
        ].join("\n"),
        caption: "Die WVK-proses het van politiese besluit deur openbare verhore na amnestie besluite en 'n finale verslag beweeg. Sy nalatenskap is omstrede: dit het vreedsame oorgang moontlik gemaak maar baie slagoffers voel geregtigheid is onvolledig.",
      },
    ],
  },

  // --------------------- ENGLISH FIRST ADDITIONAL LANGUAGE ---------------------
  "ENGF-1": { summaryEn: "Approaching the prescribed novel: plot, character, theme and contextual influences — applying close reading to build sustained analytical responses.", summaryAf: "Benadering van die voorgeskrewe roman: intrige, karakter, tema en konteks — gebruik noukeurige lees om volgehoue analitiese antwoorde te skryf.", conceptsEn: ["Plot: exposition, rising action, climax, resolution", "Round vs flat characters; protagonist vs antagonist", "Theme emerges from repeated motifs and conflict"], conceptsAf: ["Plot: eksposisie, stygende aksie, klimaks, resolusie", "Ronde vs plat karakters; protagonis vs antagonis", "Tema kom na vore uit herhalende motiewe en konflik"], exampleEn: { question: "Write a topic sentence for a paragraph about how the antagonist drives the plot.", solution: "Through his relentless opposition to the protagonist's goals, the antagonist creates the central conflict that propels every major plot development in the novel." }, exampleAf: { question: "Skryf 'n onderwerpsin vir 'n paragraaf oor hoe die antagonis die plot dryf.", solution: "Deur sy meedoënlose weerstand teen die protagonis se doelwitte, skep die antagonis die sentrale konflik wat elke hoof-plot-ontwikkeling in die roman vooruitstuur." } },
  "ENGF-2": { summaryEn: "Drama study: dramatic structure, dialogue, stage directions and dramatic irony in the prescribed play.", summaryAf: "Dramastudie: dramatiese struktuur, dialoog, toneelaanwysings en dramatiese ironie in die voorgeskrewe drama.", conceptsEn: ["Acts and scenes organise action", "Soliloquy reveals inner thought", "Dramatic irony: audience knows more than characters"], conceptsAf: ["Bedrywe en tonele orden aksie", "Alleenspraak onthul innerlike gedagte", "Dramatiese ironie: gehoor weet meer as karakters"], exampleEn: { question: "How do stage directions contribute to meaning in drama?", solution: "Stage directions control pace (pauses, exits), reveal subtext the dialogue conceals, and signal shifts in power — e.g. a character 'turning away' can signal rejection without words." }, exampleAf: { question: "Hoe dra toneelaanwysings by tot betekenis in drama?", solution: "Toneelaanwysings beheer tempo (pouses, uitgange), onthul subteks wat dialoog verberg, en dui magsverskuiwings aan — bv. 'n karakter wat 'wegdraai' kan verwerping aandui sonder woorde." } },
  "ENGF-3": { summaryEn: "Reading and analysing poetry: form, sound devices, figurative language, tone and theme.", summaryAf: "Lees en analise van poësie: vorm, klanktoestelle, figuurlike taal, toon en tema.", conceptsEn: ["Identify the speaker and audience", "Sound devices: alliteration, assonance, rhyme scheme", "Imagery: metaphor, simile, personification"], conceptsAf: ["Identifiseer die spreker en gehoor", "Klanktoestelle: alliterasie, assonansie, rymskema", "Beeldspraak: metafoor, vergelyking, personifikasie"], exampleEn: { question: "Identify and explain the effect of alliteration in 'The fair breeze blew, the white foam flew'.", solution: "The repeated 'f' and 'b' sounds mimic the rushing movement of wind and waves, creating onomatopoeic energy that matches the scene's excitement." }, exampleAf: { question: "Identifiseer en verduidelik die effek van alliterasie in 'Die sagte seebries suus en sing'.", solution: "Die herhaalde 's'-klanke boots die rustige beweging van wind na, wat 'n onomatopoeïese kalmte skep wat by die vredige toneel pas." } },
  "ENGF-4": { summaryEn: "Short story: compression, point of view, single effect, and the 'show, don't tell' technique.", summaryAf: "Kortverhaal: saampersing, gesigspunt, enkele effek, en die 'wys, moenie sê nie' tegniek.", conceptsEn: ["Unity of effect: single dominant impression", "First-person vs limited third-person narrator", "Twist vs reflective ending"], conceptsAf: ["Eenheid van effek: enkele dominante indruk", "Eerstepersoons vs beperk-derdepersoons verteller", "Verrassingseinde vs reflektiewe einde"], exampleEn: { question: "Rewrite 'He was very angry' using 'show, don't tell'.", solution: "His jaw clenched; he gripped the table edge until his knuckles whitened and said nothing." }, exampleAf: { question: "Herskryf 'Hy was baie kwaad' met die 'wys, moenie sê nie'-tegniek.", solution: "Sy kakebeen was vas; hy het die tafelrand gedruk totdat sy kneukels wit geword het en niks gesê nie." } },
  "ENGF-5": { summaryEn: "Parts of speech, sentence construction, punctuation, concord, tense and register in Standard South African English.", summaryAf: "Woordsoorte, sinsbou, leestekens, ooreenkoms, tyd en register in Standaard Suid-Afrikaanse Engels.", conceptsEn: ["Subject–verb concord rules", "Active ↔ passive voice transformation", "Direct ↔ indirect speech transformation"], conceptsAf: ["Onderwerp–werkwoord ooreenstemmingsreëls", "Aktiewe ↔ passiewe vorm omskakeling", "Direkte ↔ indirekte rede omskakeling"], exampleEn: { question: "Change to passive: 'The teacher marked the test.'", solution: "The test was marked by the teacher." }, exampleAf: { question: "Verander na passief: 'Die onderwyser het die toets nagesien.'", solution: "Die toets is deur die onderwyser nagesien." } },
  "ENGF-6": { summaryEn: "Reading for meaning: skim, scan, infer, distinguish fact from opinion; write a summary of 60–80 words.", summaryAf: "Lees vir betekenis: skim, skandeer, aflei, onderskei feit van mening; skryf 'n opsomming van 60–80 woorde.", conceptsEn: ["Identify topic sentence of each paragraph", "7 key points for summary in own words", "Inference vs explicit information"], conceptsAf: ["Identifiseer onderwerpsin van elke paragraaf", "7 sleutelpunte vir opsomming in eie woorde", "Afleidings vs eksplisiete inligting"], exampleEn: { question: "Distinguish between a fact and an opinion: 'Cape Town is a city in South Africa' vs 'Cape Town is the most beautiful city in the world'.", solution: "The first is a fact — verifiable and objective. The second is an opinion — it is a personal judgement that cannot be objectively proven." }, exampleAf: { question: "Onderskei 'n feit van 'n mening: 'Kaapstad is 'n stad in Suid-Afrika' vs 'Kaapstad is die mooiste stad ter wêreld'.", solution: "Die eerste is 'n feit — verifieerbaar en objektief. Die tweede is 'n mening — dit is 'n persoonlike oordeel wat nie objektief bewys kan word nie." } },
  "ENGF-7": { summaryEn: "Essay writing: argumentative, discursive, descriptive, narrative and reflective forms of 350–400 words.", summaryAf: "Opstelskryf: argumentatief, diskursief, beskrywend, narratief en refleksief (350–400 woorde).", conceptsEn: ["PEEL paragraph: Point, Evidence, Explain, Link", "Thesis statement in introduction", "Vary sentence types for effect"], conceptsAf: ["PEEL paragraaf: Punt, Bewys, Verduidelik, Skakel", "Tesisstelling in inleiding", "Wissel sinstipes vir effek"], exampleEn: { question: "Write a thesis statement for an argumentative essay on: 'Social media does more harm than good.'", solution: "Despite its ability to connect people globally, social media primarily harms users by eroding mental health, spreading misinformation and fuelling social comparison." }, exampleAf: { question: "Skryf 'n tesisstelling vir 'n betogende opstel oor: 'Sosiale media doen meer skade as goed.'", solution: "Ten spyte van sy vermoë om mense wêreldwyd te verbind, skaad sosiale media gebruikers hoofsaaklik deur geestesgesondheid te ondermyn, wanpersepsie te versprei en sosiale vergelyking aan te blaas." } },
  "ENGF-8": { summaryEn: "Transactional texts: formal and informal letters, notices, advertisements, diary entries and reports.", summaryAf: "Transaksionele tekste: formele en informele briewe, kennisgewings, advertensies, dagboekinskrywings en verslae.", conceptsEn: ["Match register (formal vs informal) to purpose", "Correct layout per text type is compulsory", "Word count limits are strictly enforced"], conceptsAf: ["Pas register (formeel vs informeel) by doel aan", "Korrekte uitleg per teks tipe is verpligtend", "Woordtelling perke word streng afgedwing"], exampleEn: { question: "List three layout features required in a formal letter.", solution: "1. Sender's address (top right). 2. Date below the sender's address. 3. Recipient's address (left-aligned, below date). Plus salutation ('Dear Sir/Madam') and complimentary close ('Yours faithfully')." }, exampleAf: { question: "Lys drie uitleg-kenmerke wat in 'n formele brief vereis word.", solution: "1. Afstuurder se adres (bo regs). 2. Datum onder die afstuurder se adres. 3. Ontvanger se adres (links belyn, onder datum). Plus aanhef ('Geagte Meneer/Mevrou') en slotgroet ('Die uwe')." } },

  // --------------------- AFRIKAANS FIRST ADDITIONAL LANGUAGE ---------------------
  "AFRF-1": { summaryEn: "Studying the prescribed Afrikaans novel: story line, character, theme and narrator perspective.", summaryAf: "Bestudering van die voorgeskrewe Afrikaanse roman: storielyn, karakter, tema en vertellersperspektief.", conceptsEn: ["Plot structure analysis", "Round vs flat characters", "Theme from recurring motifs"], conceptsAf: ["Verhaalstruktuur ontleding", "Ronde vs plat karakters", "Tema uit herhalende motiewe"], exampleEn: { question: "Write a PEEL paragraph about how setting shapes the protagonist's choices.", solution: "Point: The harsh rural setting limits the protagonist's options. Evidence: She cannot leave the farm because there is no transport or money. Explain: This confinement forces her to confront her abuser directly. Link: The setting therefore drives the story's central conflict." }, exampleAf: { question: "Skryf 'n PEEL-paragraaf oor hoe die ruimte die protagonis se keuses vorm.", solution: "Punt: Die harde plattelandse omgewing beperk die protagonis se opsies. Bewys: Sy kan nie die plaas verlaat nie omdat daar geen vervoer of geld is nie. Verduidelik: Hierdie beperking dwing haar om haar belager direk te konfronteer. Skakel: Die ruimte dryf dus die sentrale konflik van die verhaal." } },
  "AFRF-2": { summaryEn: "Afrikaans drama: dramatic structure, dialogue, stage directions and conflict.", summaryAf: "Afrikaanse drama: dramatiese struktuur, dialoog, toneelaanwysings en konflik.", conceptsEn: ["Acts and scenes", "Inner and outer conflict", "Stage directions (didaskalia)"], conceptsAf: ["Bedrywe en tonele", "Innerlike en uiterlike konflik", "Toneelaanwysings (didaskalia)"], exampleEn: { question: "Explain the difference between inner and outer conflict in drama.", solution: "Outer conflict: a character clashes with another person or force (e.g. a son argues with his father). Inner conflict: a character struggles with himself — guilt, fear, or competing desires." }, exampleAf: { question: "Verduidelik die verskil tussen innerlike en uiterlike konflik in drama.", solution: "Uiterlike konflik: 'n Karakter bots met 'n ander persoon of mag (bv. 'n seun stry met sy vader). Innerlike konflik: 'n Karakter worstel met homself — skuld, vrees of teenstrydige begeertes." } },
  "AFRF-3": { summaryEn: "Afrikaans poetry: form, sound devices, imagery, tone and theme.", summaryAf: "Afrikaanse poësie: vorm, klanktegnieke, beeldspraak, toon en tema.", conceptsEn: ["Sonnet, free verse, ballad forms", "Metaphor, simile, personification", "Alliteration and assonance"], conceptsAf: ["Sonnet, vrye vers, ballade vorme", "Metafoor, vergelyking, personifikasie", "Alliterasie en assonansie"], exampleEn: { question: "Identify the figure of speech and its effect: 'Die son is 'n goue skild'.", solution: "Metaphor. The sun is directly compared to a golden shield, conveying strength and protection — suggesting the sun defends the earth or the speaker." }, exampleAf: { question: "Identifiseer die stylmiddel en effek: 'Die son is 'n goue skild'.", solution: "Metafoor. Die son word direk met 'n goue skild vergelyk, wat krag en beskerming oordra — dit stel voor dat die son die aarde of die spreker beskerm." } },
  "AFRF-4": { summaryEn: "Afrikaans short stories: compressed form, single conflict, narrator perspective and symbolism.", summaryAf: "Afrikaanse kortverhale: saamgeperste vorm, enkele konflik, vertellersperspektief en simboliek.", conceptsEn: ["Unity of effect", "Brief timespan", "Reflective or surprise ending"], conceptsAf: ["Eenheid van effek", "Kort tydsverloop", "Reflektiewe of verrassende einde"], exampleEn: { question: "How does a first-person narrator affect the reader's trust in the story?", solution: "A first-person narrator creates intimacy and immersive detail, but limits information to what that character knows and feels — making them potentially unreliable and raising questions about what is being hidden." }, exampleAf: { question: "Hoe beïnvloed 'n eerstepersoons-verteller die leser se vertroue in die verhaal?", solution: "Eerstepersoons-vertelling skep nabyheid en diepe detail, maar beperk inligting tot wat die karakter weet en voel — wat hulle potensieel onbetroubaar maak en vrae laat ontstaan oor wat versteek word." } },
  "AFRF-5": { summaryEn: "Afrikaans language structures: word classes, sentence construction, punctuation and transformations.", summaryAf: "Afrikaanse taalstrukture: woordsoorte, sinsbou, leestekens en omskakelings.", conceptsEn: ["Subject-predicate agreement", "Main clause and subordinate clause", "Active → passive transformations"], conceptsAf: ["Onderwerp-gesegde ooreenkoms", "Hoofsin en bysin", "Aktiewe → passiewe omskakeling"], exampleEn: { question: "Change to passive: 'Die hond het die kat gejaag.'", solution: "Die kat is deur die hond gejaag." }, exampleAf: { question: "Verander na passief: 'Die hond het die kat gejaag.'", solution: "Die kat is deur die hond gejaag." } },
  "AFRF-6": { summaryEn: "Afrikaans comprehension and summary: main ideas, inferences and 7 points in 60–70 words.", summaryAf: "Afrikaanse begripslees en opsomming: hoofgedagtes, afleidings en 7 punte in 60–70 woorde.", conceptsEn: ["Identify topic sentences", "Infer tone and register", "Summary in own words"], conceptsAf: ["Identifiseer onderwerpsinne", "Lei toon en register af", "Opsomming in eie woorde"], exampleEn: { question: "How do you write a summary correctly in an exam?", solution: "Identify 7 key points, write them in full sentences in your own words, link ideas logically, and stay within 60–70 words. Do not quote directly from the passage." }, exampleAf: { question: "Hoe skryf jy 'n korrekte opsomming in 'n eksamen?", solution: "Identifiseer 7 sleutelpunte, skryf hulle in volsin in eie woorde, koppel idees logies, en bly binne 60–70 woorde. Haal nie direk uit die teks aan nie." } },
  "AFRF-7": { summaryEn: "Afrikaans essay writing: argumentative, descriptive, narrative and reflective (350–400 words).", summaryAf: "Afrikaanse opstelskryf: betogend, beskrywend, narratief en refleksief (350–400 woorde).", conceptsEn: ["Plan before writing", "Strong introduction and conclusion", "Vary sentence structures"], conceptsAf: ["Beplan voor jy skryf", "Sterk inleiding en slot", "Wissel sinstrukture"], exampleEn: { question: "Write a strong concluding sentence for an argumentative essay about school uniforms.", solution: "School uniforms, though restrictive, ultimately promote equality and reduce distraction — their long-term benefits to the learning environment far outweigh the temporary discomfort they cause." }, exampleAf: { question: "Skryf 'n sterk slotsin vir 'n betogende opstel oor skooluniforme.", solution: "Skooluniforme, alhoewel beperkend, bevorder uiteindelik gelykheid en verminder afleiding — hul langtermynvoordele vir die leeromgewing weeg veel swaarder as die tydelike ongemak wat hulle veroorsaak." } },
  "AFRF-8": { summaryEn: "Afrikaans transactional texts: letters, newspaper reports, diary entries, e-mails and advertisements.", summaryAf: "Afrikaanse transaksionele tekste: briewe, koerantberigte, dagboekinskrywings, e-posse en advertensies.", conceptsEn: ["Adjust register to audience and purpose", "Correct layout per text type", "Strict word count"], conceptsAf: ["Pas register aan by gehoor en doel", "Korrekte uitleg per teks tipe", "Streng woordtelling"], exampleEn: { question: "List two features that distinguish a newspaper report from an informal letter.", solution: "Newspaper report: headline, byline, inverted pyramid structure (most important facts first). Informal letter: personal greeting ('Hallo Boeta'), casual tone, personal address block." }, exampleAf: { question: "Lys twee kenmerke wat 'n koerantberig van 'n informele brief onderskei.", solution: "Koerantberig: opskrif, naam van joernalis, omgekeerde piramied (belangrikste feite eerste). Informele brief: persoonlike groet ('Hallo Boeta'), informele toon, persoonlike adresblok." } },

  // --------------------- INFORMATION TECHNOLOGY ---------------------
  "IT-1": { summaryEn: "Software development life cycle (SDLC), algorithm design, pseudocode, flowcharts and program testing strategies.", summaryAf: "Sagteware-ontwikkelingslewensiklus (SDLC), algoritme-ontwerp, pseudokode, vloeidiagramme en programtoetsstrategieë.", conceptsEn: ["SDLC phases: analysis, design, code, test, maintain", "Pseudocode uses plain-English control structures", "White-box vs black-box testing"], conceptsAf: ["SDLC fases: analise, ontwerp, kode, toets, onderhoud", "Pseudokode gebruik gewone-Engels beheerstukture", "Witkas vs swartkastoets"], exampleEn: { question: "Write pseudocode to output all even numbers from 1 to 10.", solution: "FOR i = 1 TO 10\n  IF i MOD 2 = 0 THEN\n    OUTPUT i\n  END IF\nEND FOR" }, exampleAf: { question: "Skryf pseudokode om alle ewe getalle van 1 tot 10 uit te voer.", solution: "VIR i = 1 TOT 10\n  AS i MOD 2 = 0 DAN\n    UITVOER i\n  EINDE AS\nEINDE VIR" } },
  "IT-2": { summaryEn: "Relational databases: entity-relationship diagrams, SQL queries (SELECT, INSERT, UPDATE, DELETE), normalisation.", summaryAf: "Relasionele databasisse: entiteit-verwantskapsdiagramme, SQL-navrae (SELECT, INSERT, UPDATE, DELETE), normalisering.", conceptsEn: ["Primary and foreign keys link tables", "SELECT … FROM … WHERE … ORDER BY", "1NF: no repeating groups; 2NF: full functional dependency"], conceptsAf: ["Primêre en vreemde sleutels koppel tabelle", "SELECT … FROM … WHERE … ORDER BY", "1NF: geen herhalende groepe; 2NF: volle funksionele afhanklikheid"], exampleEn: { question: "Write SQL to list all students with marks above 60.", solution: "SELECT Name, Mark FROM Students WHERE Mark > 60 ORDER BY Mark DESC;" }, exampleAf: { question: "Skryf SQL om alle leerders met punte bo 60 te lys.", solution: "SELECT Naam, Punt FROM Leerders WHERE Punt > 60 ORDER BY Punt DESC;" } },
  "IT-3": { summaryEn: "Hardware components, operating system functions, network topologies, protocols and security measures.", summaryAf: "Hardeware-komponente, bedryfstelsel funksies, netwerktopologieë, protokolle en sekuriteitsmaatreëls.", conceptsEn: ["CPU, RAM, ROM, storage hierarchy", "TCP/IP model vs OSI model", "Firewall, encryption, biometrics"], conceptsAf: ["SVE, RAM, ROM, bergingshiërargie", "TCP/IP-model vs OSI-model", "Brandmuur, kodering, biometrie"], exampleEn: { question: "Explain the difference between RAM and ROM.", solution: "RAM (Random Access Memory) is volatile — data is lost when the computer is switched off. ROM (Read-Only Memory) is non-volatile — it stores the BIOS/boot instructions permanently." }, exampleAf: { question: "Verduidelik die verskil tussen RAM en ROM.", solution: "RAM (Ewekansige Toegangsgeheue) is vlugtig — data gaan verlore as die rekenaar afgeskakel word. ROM (Leesgeheue) is nie-vlugtig — dit stoor die BIOS/aanskakelinstruksies permanent." } },
  "IT-4": { summaryEn: "HTML5, CSS, JavaScript basics, web servers, IP addressing, e-commerce and internet security.", summaryAf: "HTML5, CSS, JavaScript grondbeginsels, websbedieners, IP-adressering, e-handel en internetsekuriteit.", conceptsEn: ["HTML tags structure content; CSS styles it", "IPv4 address = 4 octets (e.g. 192.168.1.1)", "HTTPS uses SSL/TLS encryption"], conceptsAf: ["HTML-kenmerke struktureer inhoud; CSS stileer dit", "IPv4-adres = 4 oktette (bv. 192.168.1.1)", "HTTPS gebruik SSL/TLS-kodering"], exampleEn: { question: "Write HTML to display a heading 'Welcome' and a paragraph 'Hello World'.", solution: "<h1>Welcome</h1>\n<p>Hello World</p>" }, exampleAf: { question: "Skryf HTML om 'n opskrif 'Welkom' en 'n paragraaf 'Hallo Wêreld' te vertoon.", solution: "<h1>Welkom</h1>\n<p>Hallo Wêreld</p>" } },
  "IT-5": { summaryEn: "Object-oriented programming: classes, objects, inheritance, encapsulation, polymorphism and Delphi/Java syntax.", summaryAf: "Objekgeoriënteerde programmering: klasse, objekte, erfenis, inkapseling, polimorfisme en Delphi/Java-sintaksis.", conceptsEn: ["Class = blueprint; Object = instance", "Inheritance: child class inherits parent attributes and methods", "Encapsulation: data hidden via private fields + getters/setters"], conceptsAf: ["Klas = bloudruk; Objek = instansie", "Erfenis: kind-klas erf ouer-eienskappe en metodes", "Inkapseling: data verberg via privaat velde + getters/setters"], exampleEn: { question: "In Java, write a class Dog with a private field 'name' and a getter.", solution: "public class Dog {\n  private String name;\n  public String getName() { return name; }\n}" }, exampleAf: { question: "Skryf in Java 'n klas Hond met 'n private veld 'naam' en 'n getter.", solution: "public class Hond {\n  private String naam;\n  public String getNaam() { return naam; }\n}" } },
  "IT-6": { summaryEn: "Structured problem-solving, decomposition, pattern recognition and algorithm efficiency (Big-O basics).", summaryAf: "Gestruktureerde probleemoplossing, dekomposisie, patroonherkenning en algoritme-doeltreffendheid (Big-O grondbeginsels).", conceptsEn: ["Decompose large problems into sub-problems", "Patterns reduce re-coding effort", "O(n) vs O(n²) — linear vs quadratic growth"], conceptsAf: ["Ontleed groot probleme in sub-probleme", "Patrone verminder herkodeerpoging", "O(n) vs O(n²) — lineêre vs kwadratiese groei"], exampleEn: { question: "An algorithm loops through a list once. What is its Big-O complexity?", solution: "O(n) — linear complexity. As the list doubles in size, the time taken doubles proportionally." }, exampleAf: { question: "Algoritme gaan een keer deur 'n lys. Wat is sy Big-O-kompleksiteit?", solution: "O(n) — lineêre kompleksiteit. Soos die lys in grootte verdubbel, verdubbel die tyd wat dit neem eweredig." } },

  // --------------------- COMPUTER APPLICATIONS TECHNOLOGY ---------------------
  "CAT-1": { summaryEn: "Problem solving using the input-process-output (IPO) model; software development and the systems life cycle.", summaryAf: "Probleemoplossing met die invoer-verwerk-uitvoer (IVU) model; sagteware-ontwikkeling en die stelsel-lewensiklus.", conceptsEn: ["IPO: Input → Process → Output", "SDLC phases for end-user applications", "Validation vs verification of data"], conceptsAf: ["IVU: Invoer → Verwerk → Uitvoer", "SDLC-fases vir eindgebruiker-toepassings", "Validering vs verifikasie van data"], exampleEn: { question: "Apply the IPO model to a marks-calculation system.", solution: "Input: student names and raw marks. Process: calculate percentage (mark/total×100) and assign grade. Output: report with name, percentage and grade per student." }, exampleAf: { question: "Pas die IVU-model toe op 'n punteberekeningstelsel.", solution: "Invoer: leerdernames en rou punte. Verwerk: bereken persentasie (punt/totaal×100) en wys graad toe. Uitvoer: verslag met naam, persentasie en graad per leerder." } },
  "CAT-2": { summaryEn: "Hardware, software, operating systems, storage and memory hierarchy; computer networks and data communication.", summaryAf: "Hardeware, sagteware, bedryfstelsels, berging en geheuehiërargie; rekenaarnetwerke en datakommunikasie.", conceptsEn: ["Primary vs secondary storage", "LAN, WAN, MAN", "Network protocols: TCP/IP, HTTP, FTP"], conceptsAf: ["Primêre vs sekondêre berging", "LAN, WAN, MAN", "Netwerk protokolle: TCP/IP, HTTP, FTP"], exampleEn: { question: "Give two differences between a LAN and a WAN.", solution: "LAN: small geographic area (e.g. school building), high speed, owned by one organisation. WAN: large area (e.g. country/global), slower, typically leased lines or internet connections." }, exampleAf: { question: "Gee twee verskille tussen 'n LAN en 'n WAN.", solution: "LAN: klein geografiese area (bv. skoolgebou), hoë spoed, een organisasie se eiendom. WAN: groot area (bv. land/globaal), stadiger, tipies gehuurde lyne of internetverbindings." } },
  "CAT-3": { summaryEn: "Internet concepts: browsers, e-mail, e-commerce, social media, internet security and digital citizenship.", summaryAf: "Internet-konsepte: blaaiers, e-pos, e-handel, sosiale media, internetsekuriteit en digitale burgerskap.", conceptsEn: ["URL structure: protocol://domain/path", "Phishing, malware, ransomware threats", "Digital footprint and online safety"], conceptsAf: ["URL-struktuur: protokol://domein/pad", "Uitvissing, wanware, losprysware-bedreigings", "Digitale voetspoor en aanlyn veiligheid"], exampleEn: { question: "Identify the parts of: https://www.braintrack.app/dashboard", solution: "Protocol: https | Domain: www.braintrack.app | Path: /dashboard" }, exampleAf: { question: "Identifiseer die dele van: https://www.braintrack.app/dashboard", solution: "Protokol: https | Domein: www.braintrack.app | Pad: /dashboard" } },
  "CAT-4": { summaryEn: "Information management: collecting, organising, analysing and presenting data responsibly and ethically.", summaryAf: "Inligtingsbestuur: versameling, organisering, analise en verantwoordelike, etiese aanbieding van data.", conceptsEn: ["Primary vs secondary data sources", "Copyright, plagiarism and fair use", "Data types: numeric, text, date, boolean"], conceptsAf: ["Primêre vs sekondêre databronne", "Kopiereg, plagiaat en billike gebruik", "Data-tipes: numeries, teks, datum, booleans"], exampleEn: { question: "Name two primary and two secondary data sources for a study on school sports participation.", solution: "Primary: survey of learners, observation at sports events. Secondary: school records, published research reports." }, exampleAf: { question: "Noem twee primêre en twee sekondêre databronne vir 'n studie oor skoolsportsdeelname.", solution: "Primêr: opname van leerders, waarneming by sportevenemente. Sekondêr: skoolrekords, gepubliseerde navorsingsverslae." } },
  "CAT-5": { summaryEn: "Spreadsheet functions, formulas, charts, data sorting/filtering, pivot tables and what-if analysis.", summaryAf: "Sigblaaifunksies, formules, kaarte, datasortering en -filtrering, spiltabelle en wat-as-analise.", conceptsEn: ["=SUM, =AVERAGE, =IF, =VLOOKUP", "Absolute ($A$1) vs relative (A1) referencing", "Charts: appropriate type for the data"], conceptsAf: ["=SOM, =GEMIDDELD, =AS, =VLOOKUP", "Absolute ($A$1) vs relatiewe (A1) verwysing", "Kaarte: gepaste tipe vir die data"], exampleEn: { question: "Write a formula that gives 'Pass' if B2 >= 50, else 'Fail'.", solution: "=IF(B2>=50,\"Pass\",\"Fail\")" }, exampleAf: { question: "Skryf 'n formule wat 'Slaag' gee as B2 >= 50, anders 'Druip'.", solution: "=AS(B2>=50,\"Slaag\",\"Druip\")" } },
  "CAT-6": { summaryEn: "Database design: tables, fields, data types, relationships, queries, forms and reports in MS Access.", summaryAf: "Databasontwerp: tabelle, velde, data-tipes, verwantskappe, navrae, vorms en verslae in MS Access.", conceptsEn: ["Primary key uniquely identifies each record", "One-to-many relationship between tables", "Query criteria filter records: Like, Between, And, Or"], conceptsAf: ["Primêre sleutel identifiseer elke rekord uniek", "Een-tot-baie verwantskap tussen tabelle", "Navraaikkriteria filtreer rekords: Soos, Tussen, En, Of"], exampleEn: { question: "Write an Access query criterion to find all learners with surnames starting with 'S'.", solution: "In the Surname field criteria: Like \"S*\"" }, exampleAf: { question: "Skryf 'n Access-navraaikkriteria om alle leerders met vanne wat met 'S' begin te vind.", solution: "In die Van-veld se kriteria: Soos \"S*\"" } },
  "CAT-7": { summaryEn: "Word processing: styles, tables, mail merge, track changes, headers/footers, referencing and document formatting.", summaryAf: "Woordverwerking: style, tabelle, possamevoeging, wysigingsopsporing, kop/voetlyne, verwysings en dokumentopmaak.", conceptsEn: ["Styles ensure consistent formatting", "Mail merge: data source + main document", "Track Changes for collaborative editing"], conceptsAf: ["Style verseker konsekwente opmaak", "Possamevoeging: databron + hoofopument", "Wysigingsopsporing vir samewerkende redigering"], exampleEn: { question: "List the three steps to complete a mail merge in MS Word.", solution: "1. Set up the main document with placeholders. 2. Connect to a data source (e.g. Excel file with recipient details). 3. Complete the merge — preview then print or e-mail." }, exampleAf: { question: "Lys die drie stappe om 'n possamevoeging in MS Word te voltooi.", solution: "1. Stel die hoofopument op met plekhouers. 2. Koppel aan 'n databron (bv. Excel-lêer met ontvangersbesonderhede). 3. Voltooi die samevoeging — voorskou dan druk of e-pos." } },

  // --------------------- ENGINEERING GRAPHICS AND DESIGN ---------------------
  "EGD-1": { summaryEn: "Civil/building drawing: floor plans, elevations, sections and site plans using first/third-angle projection.", summaryAf: "Siviele/boukunde tekeninge: vloerplanne, elevasies, snitte en terreinplanne met eerste/derde-hoek projeksie.", conceptsEn: ["Scale 1:100 for floor plans", "Hidden lines = dashed; outlines = solid", "North point on all site plans"], conceptsAf: ["Skaal 1:100 vir vloerplanne", "Versteekte lyne = streep; omlyning = solied", "Noordpunt op alle terreinplanne"], exampleEn: { question: "On a 1:100 floor plan, a wall measures 30 mm on paper. What is the actual wall length?", solution: "30 mm × 100 = 3 000 mm = 3 m" }, exampleAf: { question: "Op 'n 1:100 vloerplan meet 'n muur 30 mm op papier. Wat is die werklike muurlengte?", solution: "30 mm × 100 = 3 000 mm = 3 m" } },
  "EGD-2": { summaryEn: "Mechanical drawing: orthographic views (front, top, side), dimensioning, sectional views and assembly drawings.", summaryAf: "Meganiese tekening: ortografiese aansigte (voor, bo, sy), bemating, snitaansigte en samesteltekenings.", conceptsEn: ["Third-angle projection for mechanical (SANS)", "Full/half/part/revolved sections", "Dimension lines must not cross"], conceptsAf: ["Derde-hoek projeksie vir meganies (SANS)", "Volle/half/deel/omgewentelde snitte", "Bematinglese mag nie kruis nie"], exampleEn: { question: "In third-angle projection, where does the right-side view appear relative to the front view?", solution: "To the right of the front view — the view from the right side is placed on the right." }, exampleAf: { question: "In derde-hoek projeksie, waar verskyn die regterkant-aansig relatief tot die vooraansig?", solution: "Regs van die vooraansig — die aansig van die regterkant word aan die regterkant geplaas." } },
  "EGD-3": { summaryEn: "Isometric drawing: 30° axes, isometric box method, circles as ellipses and pictorial assembly representation.", summaryAf: "Isometriese tekening: 30°-asse, isometriese kas-metode, sirkels as ellipse en piktoriese samestelling.", conceptsEn: ["All isometric axes at 30° to horizontal", "Circles → ellipses on isometric planes", "True lengths only along isometric axes"], conceptsAf: ["Alle isometriese asse 30° tot horisontaal", "Sirkels → ellipse op isometriese vlakke", "Ware lengtes slegs langs isometriese asse"], exampleEn: { question: "A cube has a true length of 40 mm. Draw the isometric axes and mark the correct 40 mm measurements.", solution: "Draw two 30° lines from a base point (left and right) and a vertical line. Mark 40 mm along each axis — true lengths are only valid along these three directions." }, exampleAf: { question: "Blok het ware lengte van 40 mm. Teken die isometriese asse en merk die korrekte 40 mm-metings.", solution: "Teken twee 30°-lyne van 'n basispunt (links en regs) en 'n vertikale lyn. Merk 40 mm langs elke as — ware lengtes is slegs geldig langs hierdie drie rigtings." } },
  "EGD-4": { summaryEn: "One-point and two-point perspective drawing: vanishing points, horizon line, station point and perspective grids.", summaryAf: "Eenpunt- en tweepunt-perspektieftekening: verdwynpunte, horisontlyn, stasionpunt en perspektiefrooster.", conceptsEn: ["1-point: one VP on horizon", "2-point: two VPs for corner-on views", "All verticals remain vertical in perspective"], conceptsAf: ["1-punt: een VP op horison", "2-punt: twee VP's vir hoek-op-aansigte", "Alle vertikales bly vertikaal in perspektief"], exampleEn: { question: "In a one-point perspective drawing of a room, where do the receding lines meet?", solution: "All receding lines converge at the single vanishing point (VP) located on the horizon line at the viewer's eye level." }, exampleAf: { question: "In 'n eenpunt-perspektieftekening van 'n kamer, waar ontmoet die terugwykende lyne?", solution: "Alle terugwykende lyne konvergeer by die enkele verdwynpunt (VP) geleë op die horisontlyn op die kyker se ooghoogte." } },
  "EGD-5": { summaryEn: "Interpenetration of geometric solids and development (unfolding) of prisms, pyramids, cylinders and cones.", summaryAf: "Interpenetrasie van geometriese liggame en ontwikkeling (ontvouiing) van prismas, piramides, silinders en kegels.", conceptsEn: ["True length lines used in development", "Lines of intersection found by projection", "Development lays the surface flat"], conceptsAf: ["Ware lengtelyne gebruik in ontwikkeling", "Snyllyne gevind deur projeksie", "Ontwikkeling lê die oppervlak plat"], exampleEn: { question: "What is the development of a cylinder?", solution: "The development is a rectangle: width = circumference (2πr), height = height of the cylinder. The two circular ends are drawn separately." }, exampleAf: { question: "Wat is die ontwikkeling van 'n silinder?", solution: "Die ontwikkeling is 'n reghoek: breedte = omtrek (2πr), hoogte = hoogte van die silinder. Die twee sirkeleinde word apart geteken." } },
  "EGD-6": { summaryEn: "Loci of points: paths traced by moving points on mechanisms such as cranks, cams, gears and linkages.", summaryAf: "Lokus van punte: paaie gevolg deur bewegende punte op meganismes soos krukas, nokskywe, ratte en koppelings.", conceptsEn: ["Locus = set of positions satisfying a condition", "Crank + connecting rod → complex path", "Cam profiles designed from follower loci"], conceptsAf: ["Lokus = stel posisies wat 'n voorwaarde bevredig", "Krukas + dryfstang → komplekse pad", "Nokskyf-profiele ontwerp uit volger-lokus"], exampleEn: { question: "Describe the locus of a point on the rim of a rolling wheel.", solution: "The locus is a cycloid — a curved path that rises from the ground, peaks at the top of the wheel's diameter, and returns to the ground one full circumference along." }, exampleAf: { question: "Beskryf die lokus van 'n punt op die rand van 'n rollende wiel.", solution: "Die lokus is 'n sikloid — 'n geboë pad wat van die grond styg, 'n hoogtepunt bereik by die bokant van die wiel se deursnee, en terugkeer na die grond een volle omtrek verder." } },

  // --------------------- AGRICULTURAL SCIENCES ---------------------
  "AGR-1": { summaryEn: "Farm management: planning, organising, leading and controlling agricultural businesses for profitability.", summaryAf: "Plaasbestuur: beplanning, organisering, leiding en beheer van landbou-ondernemings vir winsgewendheid.", conceptsEn: ["POLC: Plan, Organise, Lead, Control", "Farm budget: gross margin analysis", "Risk management: insurance, diversification"], conceptsAf: ["POLC: Beplan, Organiseer, Lei, Beheer", "Plaas-begroting: bruto-marge-analise", "Risikobestuur: versekering, diversifisering"], exampleEn: { question: "A farmer grows maize. Revenue = R50 000; Variable costs = R30 000; Fixed costs = R10 000. Calculate gross margin.", solution: "Gross Margin = Revenue − Variable Costs = R50 000 − R30 000 = R20 000" }, exampleAf: { question: "Boer kweek mielies. Inkomste = R50 000; Veranderlike koste = R30 000; Vaste koste = R10 000. Bereken bruto marge.", solution: "Bruto Marge = Inkomste − Veranderlike Koste = R50 000 − R30 000 = R20 000" } },
  "AGR-2": { summaryEn: "Livestock production systems: intensive vs extensive, beef, dairy, sheep and poultry production.", summaryAf: "Veeprodukte-stelsels: intensief vs ekstensief, bees, suiwel, skaap en pluimveeproduksie.", conceptsEn: ["Intensive = feedlot; extensive = rangeland", "Beef breeds: Bonsmara, Angus, Simmentaler", "Stocking rate = animals per hectare"], conceptsAf: ["Intensief = voerkraal; ekstensief = weiveld", "Beesvleisrasse: Bonsmara, Angus, Simmentaler", "Beladingskoers = diere per hektaar"], exampleEn: { question: "A farmer has 120 cattle on 400 ha. Calculate the stocking rate.", solution: "Stocking rate = 120 ÷ 400 = 0.3 LSU/ha (livestock units per hectare)" }, exampleAf: { question: "Boer het 120 beeste op 400 ha. Bereken die beladingskoers.", solution: "Beladingskoers = 120 ÷ 400 = 0,3 GVE/ha (grootvee-eenhede per hektaar)" } },
  "AGR-3": { summaryEn: "Animal nutrition: digestive systems (monogastric vs ruminant), feed types, feed rations and supplementation.", summaryAf: "Dierevoeding: spysverteringstelsels (monogastriek vs ruminant), voertipes, voerrantsoene en aanvulling.", conceptsEn: ["Ruminant: four stomach compartments (rumen, reticulum, omasum, abomasum)", "Monogastric: single stomach (pigs, poultry)", "TDN (Total Digestible Nutrients) as energy measure"], conceptsAf: ["Ruminant: vier maagkompartemente (rumen, retikulum, omasum, abomasum)", "Monogastriek: enkele maag (varke, pluimvee)", "TDN (Totale Verteerbare Voedingstowwe) as energiemaatstaf"], exampleEn: { question: "Name two differences between ruminant and monogastric digestion.", solution: "1. Ruminants have 4 stomach chambers; monogastrics have 1. 2. Ruminants can digest cellulose via microbial fermentation in the rumen; monogastrics cannot." }, exampleAf: { question: "Noem twee verskille tussen ruminant en monogastriese vertering.", solution: "1. Ruminante het 4 maagkamers; monogastrieke het 1. 2. Ruminante kan sellulose verteer via mikrobiese fermentasie in die rumen; monogastrieke kan nie." } },
  "AGR-4": { summaryEn: "Animal reproduction: reproductive cycles, fertilisation, gestation, parturition and artificial insemination.", summaryAf: "Dierevoortplanting: reproduksiesiklusse, bevrugting, gestasjie, geboorte en kunsmatige inseminasie.", conceptsEn: ["Oestrus cycle triggers ovulation", "Gestation: cattle ≈285 days, sheep ≈150 days", "AI advantages: genetic improvement, disease control"], conceptsAf: ["Oöstrus-siklus aktiveer ovulasie", "Gestasjie: beeste ≈285 dae, skape ≈150 dae", "KI-voordele: genetiese verbetering, siektebeheersing"], exampleEn: { question: "Give two advantages of artificial insemination (AI) over natural mating in cattle.", solution: "1. One bull's semen can inseminate hundreds of cows, spreading superior genetics widely. 2. Reduces disease transmission (no direct contact between animals)." }, exampleAf: { question: "Gee twee voordele van kunsmatige inseminasie (KI) bo natuurlike paring by beeste.", solution: "1. Een bul se saad kan honderde koeie insemineer, wat superieure genetika wyd versprei. 2. Verminder siekteverspreiding (geen direkte kontak tussen diere nie)." } },
  "AGR-5": { summaryEn: "Crop production: planting, cultivation practices, irrigation, pest and disease management, and harvesting.", summaryAf: "Plantproduksie: aanplanting, verbouingspraktyke, besproeiing, plaag- en siektebestuur, en oes.", conceptsEn: ["Summer vs winter crops in SA", "Integrated Pest Management (IPM)", "Harvest index = yield / total biomass"], conceptsAf: ["Somer- vs wintergewasse in SA", "Geïntegreerde Plaagbestuur (GPB)", "Oes-indeks = opbrengs / totale biomassa"], exampleEn: { question: "Name two summer crops and two winter crops grown in South Africa.", solution: "Summer: maize, sunflower, sorghum. Winter: wheat, canola, barley." }, exampleAf: { question: "Noem twee somergewasse en twee wintergewasse wat in Suid-Afrika geplant word.", solution: "Somer: mielies, sonneblom, sorghum. Winter: koring, kanola, gars." } },
  "AGR-6": { summaryEn: "Soil science: soil formation, texture, structure, pH, nutrient cycles and soil conservation.", summaryAf: "Grondwetenskap: grondvorming, tekstuur, struktuur, pH, voedingstofkringlope en grondbewaring.", conceptsEn: ["Soil texture: sand/silt/clay proportions", "pH 6–7 optimal for most crops", "NPK: macronutrients nitrogen, phosphorus, potassium"], conceptsAf: ["Grondtekstuur: sand/slik/klei-verhoudinge", "pH 6–7 optimaal vir meeste gewasse", "NPK: makrovoedingstowwe stikstof, fosfor, kalium"], exampleEn: { question: "A soil test shows pH 5.2. What amendment is required and why?", solution: "Apply agricultural lime to raise the pH. At pH 5.2 the soil is too acidic — aluminium and manganese become toxic to crops and phosphorus availability decreases." }, exampleAf: { question: "Grondtoets toon pH 5,2. Watter aanpassing word vereis en hoekom?", solution: "Pas landboukalksteen toe om die pH te verhoog. By pH 5,2 is die grond te suur — aluminium en mangaan word giftig vir gewasse en fosfor-beskikbaarheid verminder." } },
  "AGR-7": { summaryEn: "Agricultural economics: supply and demand for farm products, marketing channels and price determination.", summaryAf: "Landbou-ekonomie: vraag en aanbod vir plaasprodukte, bemarkingskanale en prysvasstelling.", conceptsEn: ["Price elasticity of agricultural products tends to be inelastic", "Marketing channels: producer → wholesaler → retailer", "Break-even analysis for farm enterprises"], conceptsAf: ["Pryselastisiteit van landbouprodukte neig na onelasties", "Bemarkingskanale: produsent → groothandelaar → kleinhandelaar", "Gelykbreekontleding vir plaasondernemings"], exampleEn: { question: "A chicken farmer has fixed costs of R20 000/month and variable costs of R15/chicken. If each chicken sells for R25, how many must be sold to break even?", solution: "Break-even = Fixed costs ÷ (Price − Variable cost) = R20 000 ÷ (R25 − R15) = 2 000 chickens/month" }, exampleAf: { question: "Hoenderkweker het vaste koste van R20 000/maand en veranderlike koste van R15/hoender. As elke hoender vir R25 verkoop, hoeveel moet verkoop word om gelyk te breek?", solution: "Gelykbreek = Vaste koste ÷ (Prys − Veranderlike koste) = R20 000 ÷ (R25 − R15) = 2 000 hoenders/maand" } },

  // --------------------- CONSUMER STUDIES ---------------------
  "CON-1": {
    summaryEn: "Consumer rights and responsibilities under the Consumer Protection Act (CPA), personal budgeting, financial planning and understanding credit agreements.",
    summaryAf: "Verbruikersregte en -verantwoordelikhede ingevolge die Wet op Verbruikersbeskerming (WVB), persoonlike begrotings, finansiële beplanning en begrip van kredietooreenkomste.",
    conceptsEn: ["CPA gives rights: safe products, redress, information, fair value", "Budget: income − expenses = surplus/deficit; surplus saved or invested", "Inflation erodes purchasing power: CPI measures the rate", "Credit: hire purchase, personal loan, credit card — compare true cost", "Debt trap: minimum payment only covers interest; capital stays unpaid"],
    conceptsAf: ["WVB gee regte: veilige produkte, regstelling, inligting, billike waarde", "Begroting: inkomste − uitgawes = surplus/tekort; surplus gespaar of belê", "Inflasie verweer koopkrag: VPI meet die koers", "Krediet: huurkoop, persoonlike lening, kredietkaart — vergelyk ware koste", "Skuldslagval: minimumbetaling dek slegs rente; kapitaal bly onbetaald"],
    exampleEn: { question: "A consumer's monthly income is R8 000 and expenses total R9 500. Calculate the deficit and suggest one corrective action.", solution: "Deficit = R9 500 − R8 000 = R1 500. Corrective action: reduce discretionary spending (e.g. entertainment) or increase income through part-time work." },
    exampleAf: { question: "Verbruiker se maandelikse inkomste is R8 000 en uitgawes is R9 500. Bereken die tekort en stel een korrektiewe aksie voor.", solution: "Tekort = R9 500 − R8 000 = R1 500. Korrektiewe aksie: verminder diskresionêre besteding (bv. vermaak) of verhoog inkomste deur deeltydse werk." },
  },
  "CON-2": {
    summaryEn: "Nutrients (macro and micro), dietary guidelines, food labelling under R146, food safety (HACCP), preservation methods and the link between diet and lifestyle disease.",
    summaryAf: "Voedingstowwe (makro en mikro), voedingsriglyne, voedseletikettering ingevolge R146, voedselveiligheid (HACCP), bewaringsmetodes en die verband tussen dieet en lewenstylsiektes.",
    conceptsEn: ["Macronutrients: carbohydrates (energy), proteins (repair), fats (insulation)", "Micronutrients: vitamins (A, B, C, D) and minerals (Fe, Ca, Zn)", "Regulation R146: mandatory nutrition table on packaged food", "HACCP: 7-step food safety system — hazard analysis to verification", "Non-communicable diseases linked to diet: obesity, diabetes type 2, CVD"],
    conceptsAf: ["Makrovoedingstowwe: koolhidrate (energie), proteïene (herstel), vette (isolasie)", "Mikrovoedingstowwe: vitamiene (A, B, C, D) en minerale (Fe, Ca, Zn)", "Regulasie R146: verpligte voedingstabel op verpakte kos", "HACCP: 7-stap voedselveiligheidsstelsel — gevaaranalise tot verifikasie", "Nie-oordraagbare siektes gekoppel aan dieet: vetsug, diabetes tipe 2, KVS"],
    exampleEn: { question: "Name the macronutrient needed for tissue repair and its best food source.", solution: "Protein is needed for tissue repair. Best sources: meat, eggs, legumes (beans, lentils), dairy products." },
    exampleAf: { question: "Noem die makrovoedingstof wat vir weefselherstel benodig word en sy beste voedselbron.", solution: "Proteïen word vir weefselherstel benodig. Beste bronne: vleis, eiers, peulgewasse (bone, lensies), suiwelprodukte." },
  },
  "CON-3": {
    summaryEn: "Textiles and clothing: fibre types, fabric construction methods, care labelling symbols, clothing selection principles and the global fashion supply chain.",
    summaryAf: "Tekstiele en kleding: veseltipes, stofkonstruksiemetodes, versorgingsetiket-simbole, kledingkeusebeginsels en die globale modevoorsieningsketting.",
    conceptsEn: ["Natural fibres: cotton (absorbent), wool (warm), silk (lustrous), linen (cool)", "Synthetic fibres: polyester (durable), nylon (strong), acrylic (wool-like)", "Fabric construction: woven (warp/weft), knitted (looped), non-woven (bonded)", "Care labels indicate washing temp, drying, ironing and dry-cleaning symbols", "Fast fashion: low cost but high environmental cost (water, pesticides, waste)"],
    conceptsAf: ["Natuurlike vesels: katoen (absorbeer), wol (warm), sy (glansend), linne (koel)", "Sintetiese vesels: polieëster (duursaam), nylon (sterk), akriel (wollerig)", "Stofkonstruksie: geweef (skering/inslag), gebreisel (gelussel), nie-geweef (gebind)", "Sorgsetikette dui wastemp, droging, stryking en droogwassimbolies aan", "Vinnige mode: lae koste maar hoë omgewingskoste (water, plaagdoders, afval)"],
    exampleEn: { question: "Give two reasons why polyester is used in sportswear.", solution: "1. Moisture-wicking: draws sweat away from skin. 2. Durable and resilient: retains shape through repeated washing and stretching during exercise." },
    exampleAf: { question: "Gee twee redes hoekom polieëster in sportklere gebruik word.", solution: "1. Vog-afvoerend: trek sweet van die vel weg. 2. Duursaam en veerkragtig: behou vorm deur herhaalde was en rek tydens oefening." },
  },
  "CON-4": {
    summaryEn: "Housing needs and choices, elements and principles of interior design, sustainable housing features, ergonomics and household furnishing budgets.",
    summaryAf: "Behuisingsbehoeftes en -keuses, elemente en beginsels van binnehuis-ontwerp, volhoubare behuisingskenmerke, ergonomie en meubileringsbegrotings.",
    conceptsEn: ["Design elements: line, form, colour, texture, pattern, space", "Design principles: balance, emphasis, harmony, rhythm, proportion", "Green building: solar panels, grey-water recycling, insulation, passive design", "Ergonomics: furniture scaled to human body dimensions reduces strain", "Housing subsidy: RDP (government-subsidised) vs bond (mortgage) financing"],
    conceptsAf: ["Ontwerpelement: lyn, vorm, kleur, tekstuur, patroon, ruimte", "Ontwerpbeginsels: balans, klem, harmonie, ritme, proporsie", "Groen gebou: sonpanele, gryswater-hergebruik, isolasie, passiewe ontwerp", "Ergonomie: meubels geskaleer na menslike liggaamsafmetings verminder spanning", "Behuisingssubsidie: RDP (staatsgefinansierd) vs verbandfinansiering (verband)"],
    exampleEn: { question: "Explain how colour can be used to make a small room appear larger.", solution: "Use light, cool colours (white, pale blue) on walls to reflect light and visually push boundaries outward. Avoid dark colours which absorb light and make spaces feel enclosed." },
    exampleAf: { question: "Verduidelik hoe kleur gebruik kan word om 'n klein kamer groter te laat lyk.", solution: "Gebruik ligte, koeler kleure (wit, bleek blou) op mure om lig te reflekteer en grense visueel uit te druk. Vermy donker kleure wat lig absorbeer en ruimtes ingesluit laat voel." },
  },
  "CON-5": {
    summaryEn: "Entrepreneurship in consumer industries: feasibility studies, the business plan, marketing mix (4Ps), pricing strategies, break-even analysis and social entrepreneurship.",
    summaryAf: "Entrepreneurskap in verbruikersnywerhede: lewensvatbaarheidstudies, die besigheidsplan, bemarkingsmengsel (4P's), prysstrategieë, gelykbreekontleding en sosiale entrepreneurskap.",
    conceptsEn: ["Business plan: executive summary, market analysis, operations, financials", "Break-even: Fixed Costs ÷ (Selling Price − Variable Cost per unit)", "Pricing strategies: cost-plus, competitive, penetration, skimming", "Social enterprise: profit + social/environmental mission (e.g. fair trade)", "SWOT analysis: Strengths, Weaknesses, Opportunities, Threats"],
    conceptsAf: ["Besigheidsplan: bestuursopsomming, markanalise, bedrywighede, finansies", "Gelykbreek: Vaste Koste ÷ (Verkoopprys − Veranderlike Koste per eenheid)", "Prysstrategieë: koste-plus, mededingend, penetrasie, afroming", "Sosiale onderneming: wins + sosiale/omgewingsmissie (bv. billike handel)", "SWOT-analise: Sterktes, Swakhede, Geleenthede, Bedreigings"],
    exampleEn: { question: "A baking business has fixed costs of R2 000/month. Each cake costs R50 to make and sells for R120. How many cakes must be sold to break even?", solution: "Break-even = R2 000 ÷ (R120 − R50) = R2 000 ÷ R70 ≈ 29 cakes per month" },
    exampleAf: { question: "Bakkersbedryf het vaste koste van R2 000/maand. Elke koek kos R50 om te maak en verkoop vir R120. Hoeveel koeke moet verkoop word om gelyk te breek?", solution: "Gelykbreek = R2 000 ÷ (R120 − R50) = R2 000 ÷ R70 ≈ 29 koeke per maand" },
  },

  // --------------------- TOURISM ---------------------
  "TOUR-1": { summaryEn: "Tourism sectors: accommodation, transport, attractions, travel agents and tour operators — their roles and interdependence.", summaryAf: "Toerismesektore: akkommodasie, vervoer, attraksies, reisagente en toeroperateurs — hul rolle en onderlinge afhanklikheid.", conceptsEn: ["Grading system: Tourism Grading Council of SA", "IATA and airline code classifications", "Package tour = bundled sectors sold at one price"], conceptsAf: ["Graderingstelsel: Toerisme Graderingsraad van SA", "IATA en lugredery-kodeklassifikasies", "Pakkettour = gegroepeerde sektore teen een prys"], exampleEn: { question: "Explain how a travel agent and a tour operator differ.", solution: "A travel agent sells travel products to customers on behalf of suppliers (booking flights/hotels). A tour operator creates packaged tours by bundling flights, accommodation and activities, then sells them through agents or directly." }, exampleAf: { question: "Verduidelik hoe 'n reisagent en 'n toeroperateur verskil.", solution: "Reisagent verkoop reisprodukte aan kliënte namens verskaffers (bespreek vlugte/hotelle). Toeroperateur skep pakkettours deur vlugte, akkommodasie en aktiwiteite saam te voeg, dan verkoop via agente of direk." } },
  "TOUR-2": { summaryEn: "Sustainable tourism: environmental, social and economic impacts; eco-tourism, responsible tourism and heritage conservation.", summaryAf: "Volhoubare toerisme: omgewings-, sosiale en ekonomiese impakte; eko-toerisme, verantwoordelike toerisme en erfenisbewaring.", conceptsEn: ["Triple bottom line: profit, planet, people", "Carrying capacity limits visitor numbers", "UNESCO World Heritage Sites"], conceptsAf: ["Drievoudige onderskoor: wins, planeet, mense", "Drakrag beperk besoekersgetalle", "UNESCO Wêrelderfenisplekke"], exampleEn: { question: "Give two negative environmental impacts of mass tourism on a coastal destination.", solution: "1. Pollution: litter, wastewater and fuel from boats damages marine ecosystems. 2. Habitat destruction: overdevelopment of hotels and infrastructure destroys natural coastal vegetation." }, exampleAf: { question: "Gee twee negatiewe omgewingsimpakte van massakultuurstoerisme op 'n kustelike bestemming.", solution: "1. Besoedeling: rommel, rioolwater en brandstof van bote beskadig mariene ekostelsels. 2. Habitaatvernietiging: oorbouery van hotelle en infrastruktuur vernietig natuurlike kusplantegroei." } },
  "TOUR-3": { summaryEn: "Tourism marketing: the 4Ps (product, price, place, promotion), branding, digital marketing and market segmentation.", summaryAf: "Toerismebemarking: die 4P's (produk, prys, plek, bevordering), handelsmerk, digitale bemarking en marksegmentering.", conceptsEn: ["SA Tourism's brand: 'South Africa – It's Possible'", "Market segment: business, leisure, adventure, ecotourism", "Digital channels: social media, review sites, OTAs"], conceptsAf: ["SA Toerisme se handelsmerk: 'Suid-Afrika – Dit is Moontlik'", "Marksegment: sake, ontspanning, avontuur, eko-toerisme", "Digitale kanale: sosiale media, resensiesites, OTA's"], exampleEn: { question: "Apply the 4Ps to a garden-route eco-tour product.", solution: "Product: guided 3-day garden route tour. Price: R4 500/person. Place: sold online and through Cape Town agencies. Promotion: Instagram reels and TripAdvisor reviews." }, exampleAf: { question: "Pas die 4P's toe op 'n tuinroete eko-toerprodukte.", solution: "Produk: begeleide 3-dag tuinroete tour. Prys: R4 500/persoon. Plek: verkoop aanlyn en deur Kaapstad-agentskappe. Bevordering: Instagram-reels en TripAdvisor-resensies." } },
  "TOUR-4": { summaryEn: "Tourism geography of South Africa: provinces, biomes, national parks, World Heritage Sites and climate zones.", summaryAf: "Toerisme-geografie van Suid-Afrika: provinsies, biome, nasionale parke, Wêrelderfenisplekke en klimaatgebiede.", conceptsEn: ["9 provinces and their key attractions", "Kruger NP (Limpopo/Mpumalanga)", "Robben Island, Drakensberg and Cape Floral Region = World Heritage"], conceptsAf: ["9 provinsies en hul sleutels attraksies", "Kruger NP (Limpopo/Mpumalanga)", "Robbeneiland, Drakensberge en Kaapse Blom-Streek = Wêrelderfenis"], exampleEn: { question: "Name the province that borders Kruger National Park and two wildlife attractions found there.", solution: "Kruger National Park straddles Limpopo and Mpumalanga. Key attractions: Big Five game viewing and the Blyde River Canyon." }, exampleAf: { question: "Noem die provinsie wat grens aan die Kruger Nasionale Park en twee wildattraksies wat daar gevind word.", solution: "Kruger Nasionale Park strek oor Limpopo en Mpumalanga. Sleutelattraksies: Groot Vyf-wildkyk en die Blyderivierskloofnature-reservaat." } },
  "TOUR-5": { summaryEn: "Customer care: service quality, handling complaints, communication skills and cultural sensitivity in tourism.", summaryAf: "Kliëntediens: dienskwaliteit, klagte-hantering, kommunikasievaardighede en kulturele sensitiwiteit in toerisme.", conceptsEn: ["SERVQUAL dimensions: reliability, assurance, tangibles, empathy, responsiveness", "CRM builds long-term relationships", "Cross-cultural awareness reduces misunderstandings"], conceptsAf: ["SERVQUAL dimensies: betroubaarheid, versekering, tasbaarhede, empatie, responsiwiteit", "CRM bou langtermynverhoudings", "Kruiskulturele bewustheid verminder misverstande"], exampleEn: { question: "A tourist complains that their room was dirty at check-in. Describe a correct response using the LAST model.", solution: "Listen carefully without interrupting. Apologise sincerely. Solve the problem (offer a room change or immediate cleaning). Thank the guest for bringing it to your attention." }, exampleAf: { question: "Toeris kla dat sy kamer vuil was by intrek. Beskryf 'n korrekte reaksie met die LAST-model.", solution: "Luister sonder om te onderbreek. Verskoon jou opreg. Los die probleem op (bied kamerruiling of onmiddellike skoonmaak). Bedank die gas vir die terugvoer." } },
  "TOUR-6": { summaryEn: "Foreign exchange: converting currencies, exchange rates, traveller's cheques, credit cards and forex regulations.", summaryAf: "Buitelandse valuta: omskakeling van geldeenhede, wisselkoerse, reisertjeks, kredietkaarte en valutaregulasies.", conceptsEn: ["Exchange rate = price of one currency in another", "Direct (ZAR/USD) vs indirect quotation", "SARS foreign allowance limit for residents"], conceptsAf: ["Wisselkoers = prys van een geldeenheid in 'n ander", "Direkte (ZAR/USD) vs indirekte kwotasie", "SARS buitelandse toestaan-limiet vir inwoners"], exampleEn: { question: "The exchange rate is R18.50/USD. A tourist wants to exchange R5 550. How many US dollars do they receive?", solution: "USD = R5 550 ÷ R18.50 = $300" }, exampleAf: { question: "Wisselkoers is R18,50/USD. Toeris wil R5 550 omruil. Hoeveel Amerikaanse dollar ontvang hulle?", solution: "USD = R5 550 ÷ R18,50 = $300" } },
  "TOUR-7": { summaryEn: "Map reading skills: atlas maps, city plans, tourist maps, compass bearings, scale and route planning.", summaryAf: "Kaartlees vaardighede: atlaskaarte, stadsplanne, toeriste kaarte, kompasrigtings, skaal en roetebeplanning.", conceptsEn: ["Cardinal points: N, S, E, W; intercardinal: NE, NW, SE, SW", "Scale: 1 cm = x km", "Legend/key interprets symbols on tourist maps"], conceptsAf: ["Kardinalepunte: N, S, O, W; tussenpunte: NO, NW, SO, SW", "Skaal: 1 cm = x km", "Legenda/sleutel interpreteer simbole op toeriste kaarte"], exampleEn: { question: "On a map with scale 1:250 000, two towns are 8 cm apart. What is the actual distance?", solution: "8 cm × 250 000 = 2 000 000 cm = 20 km" }, exampleAf: { question: "Op 'n kaart met skaal 1:250 000 is twee dorpe 8 cm uitmekaar. Wat is die werklike afstand?", solution: "8 cm × 250 000 = 2 000 000 cm = 20 km" } },

  // --------------------- VISUAL ARTS ---------------------
  "ART-1": { summaryEn: "Visual culture studies: analysing how images convey meaning in advertising, media, fashion and popular culture.", summaryAf: "Visuele kultuurstudie: analise van hoe beelde betekenis oordra in advertensies, media, mode en populêre kultuur.", conceptsEn: ["Semiotics: signs, signifier, signified", "Gaze theory and representation", "Ideology embedded in visual media"], conceptsAf: ["Semiotiek: tekens, tekenaar, aangeduide", "Blik-teorie en representasie", "Ideologie ingebed in visuele media"], exampleEn: { question: "Analyse how a fast-food advertisement uses semiotics to persuade consumers.", solution: "Signifier: golden arches logo. Signified: convenience, happiness, familiarity. The image codes fast food as fun and affordable, embedding an ideology that positions the brand as a universal comfort food." }, exampleAf: { question: "Analiseer hoe 'n kitskos-advertensie semiotiek gebruik om verbruikers te oorreed.", solution: "Tekenaar: goue boog logo. Aangeduide: gerief, geluk, vertroudheid. Die beeld kodeer kitskos as prettig en bekostigbaar, wat 'n ideologie insluit wat die handelsmerk as universele troskos posisioneer." } },
  "ART-2": { summaryEn: "Art history: major art movements from Impressionism to Postmodernism and their socio-historical contexts.", summaryAf: "Kunsgeskiedenis: hoof kunsbewegings van Impressionisme tot Postmodernisme en hul sosio-historiese kontekste.", conceptsEn: ["Impressionism (light, broken brushwork — Monet)", "Cubism (multiple perspectives — Picasso)", "Postmodernism (appropriation, bricolage)"], conceptsAf: ["Impressionisme (lig, gebreekte penseelwerk — Monet)", "Kubisme (meervoudige perspektief — Picasso)", "Postmodernisme (toe-eiening, bricolage)"], exampleEn: { question: "How does Cubism differ from Impressionism in representing the world?", solution: "Impressionism captures a single moment of light and atmosphere with loose brushwork. Cubism simultaneously shows multiple viewpoints of an object on one picture plane, breaking traditional perspective." }, exampleAf: { question: "Hoe verskil Kubisme van Impressionisme in die voorstelling van die wêreld?", solution: "Impressionisme vang 'n enkele oomblik van lig en atmosfeer met los penseelwerk. Kubisme toon gelyktydig meervoudige sigshoeke van 'n voorwerp op een beeldvlak, en breek tradisionele perspektief." } },
  "ART-3": { summaryEn: "Art making: principles and elements of design applied to 2D and 3D media including painting, printmaking and sculpture.", summaryAf: "Kunsmaak: beginsels en elemente van ontwerp toegepas op 2D en 3D media insluitend skilderkuns, prentmaking en beeldhouwerk.", conceptsEn: ["Elements: line, shape, form, colour, texture, space, value", "Principles: balance, contrast, emphasis, unity, rhythm", "Medium and technique affect meaning"], conceptsAf: ["Elemente: lyn, vorm, gedaante, kleur, tekstuur, ruimte, waarde", "Beginsels: balans, kontras, klem, eenheid, ritme", "Medium en tegniek beïnvloed betekenis"], exampleEn: { question: "Explain how an artist uses contrast to create visual impact.", solution: "Contrast places opposing elements side by side — light against dark, rough against smooth, large against small. This difference draws the viewer's eye and creates tension or emphasis." }, exampleAf: { question: "Verduidelik hoe 'n kunstenaar kontras gebruik om visuele impak te skep.", solution: "Kontras plaas teengestelde elemente langs mekaar — lig teenoor donker, grof teenoor glad, groot teenoor klein. Hierdie verskil trek die kyker se oog en skep spanning of klem." } },
  "ART-4": { summaryEn: "Contemporary art: conceptual art, installation, performance, digital media and globalised art markets.", summaryAf: "Kontemporêre kuns: konseptuele kuns, installasie, uitvoering, digitale media en geglobaliseerde kunsemarkplate.", conceptsEn: ["Conceptual art: idea over object", "Installation occupies space the viewer enters", "Digital art and NFTs in global art market"], conceptsAf: ["Konseptuele kuns: idee bo voorwerp", "Installasie neem ruimte in wat die kyker betree", "Digitale kuns en NFT's in die globale kunsmark"], exampleEn: { question: "Why is the concept considered more important than the object in Conceptual Art?", solution: "Conceptual artists argue that art's value lies in the idea it communicates rather than in craft or material. Marcel Duchamp's 'Fountain' (a urinal) challenged the definition of art through the idea alone." }, exampleAf: { question: "Hoekom word die konsep as belangriker as die voorwerp in Konseptuele Kuns beskou?", solution: "Konseptuele kunstenaars voer aan dat kuns se waarde in die idee lê wat dit kommunikeer eerder as in vakmanskap of materiaal. Marcel Duchamp se 'Fountain' (urienkan) het die definisie van kuns net deur die idee uitgedaag." } },
  "ART-5": { summaryEn: "South African art: colonial, apartheid-era, and post-1994 works; artists such as Pierneef, Sekoto and Kentridge.", summaryAf: "Suid-Afrikaanse kuns: koloniaal, apartheid-era, en post-1994 werke; kunstenaars soos Pierneef, Sekoto en Kentridge.", conceptsEn: ["J.H. Pierneef: nationalist landscape painting", "Gerard Sekoto: township realism", "William Kentridge: charcoal and animated films"], conceptsAf: ["J.H. Pierneef: nasionalistiese landskapskuns", "Gerard Sekoto: dorpspas-realisme", "William Kentridge: houtskool en geanimeerde films"], exampleEn: { question: "How does Gerard Sekoto's work challenge the narrative of apartheid South Africa?", solution: "Sekoto painted township life (e.g. 'Yellow Houses') with dignity and warmth, countering apartheid propaganda that dehumanised Black communities. His work asserts Black humanity and belonging in a hostile system." }, exampleAf: { question: "Hoe daag Gerard Sekoto se werk die narratief van apartheid Suid-Afrika uit?", solution: "Sekoto het dorpspaslewe (bv. 'Yellow Houses') met waardigheid en warmte geskilder, wat apartheidpropaganda weerspreek het wat Swart gemeenskappe ontmenslik het. Sy werk bevestig Swart menslikheid en behoort in 'n vyandige stelsel." } },

  // --------------------- TECHNICAL MATHEMATICS ---------------------
  "TMATH-1": { summaryEn: "Arithmetic and geometric sequences and series; sigma notation and sum to infinity.", summaryAf: "Rekenkundige en meetkundige rye en reekse; sigma-notasie en som tot oneindig.", conceptsEn: ["Tₙ = a + (n−1)d for arithmetic", "Sₙ = n/2·(2a + (n−1)d)", "S∞ = a/(1−r), |r| < 1"], conceptsAf: ["Tₙ = a + (n−1)d vir rekenkundig", "Sₙ = n/2·(2a + (n−1)d)", "S∞ = a/(1−r), |r| < 1"], exampleEn: { question: "Find the 8th term of the sequence 5, 9, 13, 17, …", solution: "a = 5, d = 4. T₈ = 5 + (8−1)×4 = 5 + 28 = 33" }, exampleAf: { question: "Vind die 8ste term van die ry 5, 9, 13, 17, …", solution: "a = 5, d = 4. T₈ = 5 + (8−1)×4 = 5 + 28 = 33" } },
  "TMATH-2": { summaryEn: "Functions and graphs: linear, quadratic, hyperbola, exponential; domain, range and transformations.", summaryAf: "Funksies en grafieke: lineêr, kwadraties, hiperbool, eksponensieel; definisie- en beeldversameling en transformasies.", conceptsEn: ["Linear: y = mx + c", "Quadratic: y = a(x−p)² + q with vertex (p, q)", "Transformations: shift, reflect, stretch"], conceptsAf: ["Lineêr: y = mx + c", "Kwadraties: y = a(x−p)² + q met draaipunt (p, q)", "Transformasies: verskuif, reflekteer, rek"], exampleEn: { question: "Find the vertex of y = 2(x − 3)² + 1.", solution: "Vertex = (p, q) = (3, 1). The parabola opens upward (a = 2 > 0) with minimum at (3, 1)." }, exampleAf: { question: "Vind die draaipunt van y = 2(x − 3)² + 1.", solution: "Draaipunt = (p, q) = (3, 1). Die parabool open opwaarts (a = 2 > 0) met minimum by (3, 1)." } },
  "TMATH-3": { summaryEn: "Simple and compound interest, present and future value, hire purchase and loan repayments.", summaryAf: "Eenvoudige en saamgestelde rente, huidige en toekomswaarde, huurkoop en leningsaflossings.", conceptsEn: ["A = P(1 + in) simple interest", "A = P(1 + i)ⁿ compound growth", "HP: flat rate applied to original principal"], conceptsAf: ["A = P(1 + in) eenvoudige rente", "A = P(1 + i)ⁿ saamgestelde groei", "HK: vaste koers toegepas op oorspronklike hoofsom"], exampleEn: { question: "R10 000 is invested at 8% p.a. compound interest for 3 years. Find the accumulated amount.", solution: "A = 10 000 × (1 + 0.08)³ = 10 000 × 1.2597 = R12 597.12" }, exampleAf: { question: "R10 000 word belê teen 8% p.j. saamgestelde rente vir 3 jaar. Vind die opgehoopte bedrag.", solution: "A = 10 000 × (1 + 0,08)³ = 10 000 × 1,2597 = R12 597,12" } },
  "TMATH-4": { summaryEn: "Trigonometric ratios, graphs, identities and equations; solving right-angled and non-right-angled triangles.", summaryAf: "Trigonometriese verhoudings, grafieke, identiteite en vergelykings; oplossing van reghoek- en nie-reghoekdriehoeke.", conceptsEn: ["sin, cos, tan and their reciprocals", "Sine rule and cosine rule", "Area = ½ab·sinC"], conceptsAf: ["sin, cos, tan en hul resiproke", "Sinusreël en kosinusreël", "Oppervlakte = ½ab·sinC"], exampleEn: { question: "In triangle ABC, a = 7, b = 9, C = 60°. Find the area.", solution: "Area = ½ × 7 × 9 × sin 60° = ½ × 63 × 0.866 = 27.28 cm²" }, exampleAf: { question: "In driehoek ABC, a = 7, b = 9, C = 60°. Vind die oppervlakte.", solution: "Oppervlakte = ½ × 7 × 9 × sin 60° = ½ × 63 × 0,866 = 27,28 cm²" } },
  "TMATH-5": { summaryEn: "Euclidean geometry: properties of polygons, circle theorems and formal proofs.", summaryAf: "Euklidiese meetkunde: eienskappe van veelhoeke, sirkelstellings en formele bewyse.", conceptsEn: ["Opposite angles of cyclic quad are supplementary", "Tangent ⊥ radius", "Chord midpoint theorem"], conceptsAf: ["Teenoorgestelde hoeke van koordsyfer is aanvullend", "Raaklyn ⊥ radius", "Koordering-middelpunt-stelling"], exampleEn: { question: "ABCD is a cyclic quadrilateral. If angle A = 75°, find angle C.", solution: "Opposite angles of a cyclic quad are supplementary: angle C = 180° − 75° = 105°" }, exampleAf: { question: "ABCD is 'n koordvierhoek. As hoek A = 75°, vind hoek C.", solution: "Teenoorgestelde hoeke van 'n koordvierhoek is aanvullend: hoek C = 180° − 75° = 105°" } },
  "TMATH-6": { summaryEn: "Mensuration: area, surface area and volume of 2D shapes and 3D solids, with unit conversions.", summaryAf: "Meting: oppervlakte, oppervlakareas en volume van 2D-vorms en 3D-liggame, met eenheidsomskakeling.", conceptsEn: ["A_circle = πr²; C = 2πr", "V_cylinder = πr²h; V_cone = ⅓πr²h", "S_sphere = 4πr²; V_sphere = 4/3πr³"], conceptsAf: ["A_sirkel = πr²; U = 2πr", "V_silinder = πr²h; V_kegel = ⅓πr²h", "O_bol = 4πr²; V_bol = 4/3πr³"], exampleEn: { question: "Find the volume of a cylinder with radius 4 cm and height 10 cm.", solution: "V = π × 4² × 10 = π × 16 × 10 = 502.65 cm³" }, exampleAf: { question: "Vind die volume van 'n silinder met straal 4 cm en hoogte 10 cm.", solution: "V = π × 4² × 10 = π × 16 × 10 = 502,65 cm³" } },
  "TMATH-7": { summaryEn: "Data collection, representation, measures of central tendency and spread, regression and correlation.", summaryAf: "Data-insameling, voorstelling, mate van sentrale neiging en verspreiding, regressie en korrelasie.", conceptsEn: ["Mean, median, mode; range, IQR, variance, SD", "Pearson correlation coefficient r", "Least-squares line y = a + bx"], conceptsAf: ["Gemiddeld, mediaan, modus; omvang, IQA, variansie, SA", "Pearson-korrelasiekoëffisiënt r", "Kleinste-kwadrate lyn y = a + bx"], exampleEn: { question: "Find the mean of: 12, 15, 18, 21, 24.", solution: "Mean = (12 + 15 + 18 + 21 + 24) ÷ 5 = 90 ÷ 5 = 18" }, exampleAf: { question: "Vind die gemiddeld van: 12, 15, 18, 21, 24.", solution: "Gemiddeld = (12 + 15 + 18 + 21 + 24) ÷ 5 = 90 ÷ 5 = 18" } },
  "TMATH-8": { summaryEn: "Probability: fundamental counting principle, permutations, combinations and probability rules.", summaryAf: "Waarskynlikheid: fundamentele telbeginsels, permutasies, kombinasies en waarskynlikheidreëls.", conceptsEn: ["P(A or B) = P(A) + P(B) − P(A and B)", "nPr = n!/(n−r)!", "nCr = n!/[r!(n−r)!]"], conceptsAf: ["P(A of B) = P(A) + P(B) − P(A en B)", "nPr = n!/(n−r)!", "nCr = n!/[r!(n−r)!]"], exampleEn: { question: "How many ways can 5 people be arranged in a row?", solution: "5! = 5 × 4 × 3 × 2 × 1 = 120 arrangements" }, exampleAf: { question: "Op hoeveel maniere kan 5 mense in 'n ry gerangskik word?", solution: "5! = 5 × 4 × 3 × 2 × 1 = 120 rangskikkings" } },

  // --------------------- TECHNICAL SCIENCES ---------------------
  "TSCI-1": { summaryEn: "Mechanics: Newton's laws, vectors, resultant forces, equilibrium, friction and torque.", summaryAf: "Meganika: Newton se wette, vektore, resulterende kragte, ewewig, wrywing en wringing.", conceptsEn: ["ΣF = ma (Newton 2)", "Equilibrium: ΣFx = 0 and ΣFy = 0", "Torque τ = F × d (force × perpendicular distance)"], conceptsAf: ["ΣF = ma (Newton 2)", "Ewewig: ΣFx = 0 en ΣFy = 0", "Wringing τ = F × d (krag × loodreg afstand)"], exampleEn: { question: "A 5 kg box is pushed with a 20 N force on a frictionless surface. Find the acceleration.", solution: "a = F ÷ m = 20 N ÷ 5 kg = 4 m/s²" }, exampleAf: { question: "'n 5 kg-blokkie word met 20 N stoot op 'n wrywinglose oppervlak. Vind die versnelling.", solution: "a = F ÷ m = 20 N ÷ 5 kg = 4 m/s²" } },
  "TSCI-2": { summaryEn: "Waves, sound and light: wave properties, electromagnetic spectrum, refraction, lenses and optical instruments.", summaryAf: "Golwe, klank en lig: golfeienskappe, elektromagnetiese spektrum, breking, lense en optiese instrumente.", conceptsEn: ["v = fλ", "Refractive index n = c/v", "Lenses: converging (convex) vs diverging (concave)"], conceptsAf: ["v = fλ", "Brekingsindeks n = c/v", "Lense: konvergerend (konveks) vs divergerend (konkaaf)"], exampleEn: { question: "A wave has frequency 500 Hz and wavelength 0.68 m. Find its speed.", solution: "v = fλ = 500 × 0.68 = 340 m/s (speed of sound in air)" }, exampleAf: { question: "'n Golf het frekwensie 500 Hz en golflengte 0,68 m. Vind sy spoed.", solution: "v = fλ = 500 × 0,68 = 340 m/s (spoed van klank in lug)" } },
  "TSCI-3": { summaryEn: "Electricity and magnetism: charge, current, resistance, Ohm's law, magnetic fields and electromagnetic induction.", summaryAf: "Elektrisiteit en magnetisme: lading, stroom, weerstand, Ohm se wet, magneetvelde en elektromagnetiese induksie.", conceptsEn: ["V = IR; P = VI", "Magnetic force on conductor: F = BIL", "Faraday: changing flux induces EMF"], conceptsAf: ["V = IR; P = VI", "Magnetiese krag op geleier: F = BIL", "Faraday: veranderende vloed induseer EMK"], exampleEn: { question: "A 12 V battery drives a 4 Ω resistor. Calculate current and power.", solution: "I = V ÷ R = 12 ÷ 4 = 3 A; P = VI = 12 × 3 = 36 W" }, exampleAf: { question: "'n 12 V-battery dryf 'n 4 Ω-weerstand. Bereken stroom en krag.", solution: "I = V ÷ R = 12 ÷ 4 = 3 A; P = VI = 12 × 3 = 36 W" } },
  "TSCI-4": { summaryEn: "Matter and materials: atomic structure, periodic table trends, bonding, properties of materials and phase changes.", summaryAf: "Materie en materiale: atoomstruktuur, periodieke tabel-tendense, binding, eienskappe van materiale en faseveranderings.", conceptsEn: ["Atomic number = protons; mass number = p + n", "Metallic, ionic, covalent bonds", "Melting point, hardness, conductivity relate to bond type"], conceptsAf: ["Atoomgetal = protone; massagetal = p + n", "Metaaliese, ioniese, kovalente bindings", "Smeltpunt, hardheid, geleidingsvermoë verband hou met bindingstipe"], exampleEn: { question: "Carbon-14 has atomic number 6. How many neutrons does it have?", solution: "Neutrons = mass number − atomic number = 14 − 6 = 8 neutrons" }, exampleAf: { question: "Koolstof-14 het atoomgetal 6. Hoeveel neutrone het dit?", solution: "Neutrone = massagetal − atoomgetal = 14 − 6 = 8 neutrone" } },
  "TSCI-5": { summaryEn: "Chemical change: stoichiometry, reaction types, equilibrium, acids and bases, and electrochemistry.", summaryAf: "Chemiese verandering: stoïgiometrie, reaksietipes, ewewig, sure en basisse, en elektrochemie.", conceptsEn: ["Mole = 6.022 × 10²³ particles", "Le Chatelier's principle predicts equilibrium shift", "Acid: donates H⁺; Base: accepts H⁺ (Brønsted-Lowry)"], conceptsAf: ["Mol = 6,022 × 10²³ deeltjies", "Le Chatelier se beginsel voorspel ewewigverskuiwing", "Suur: skenk H⁺; Basis: aanvaar H⁺ (Brønsted-Lowry)"], exampleEn: { question: "How many moles in 44 g of CO₂ (M = 44 g/mol)?", solution: "n = mass ÷ molar mass = 44 ÷ 44 = 1 mol" }, exampleAf: { question: "Hoeveel mol in 44 g van CO₂ (M = 44 g/mol)?", solution: "n = massa ÷ molêre massa = 44 ÷ 44 = 1 mol" } },
  "TSCI-6": { summaryEn: "Applied technology: machines, hydraulics, pneumatics, thermal systems and energy conversion in industry.", summaryAf: "Toegepaste tegnologie: masjiene, hidrolika, pneu­matika, termiese stelsels en energieomsetting in die nywerheid.", conceptsEn: ["Mechanical advantage MA = Load/Effort", "Pascal's law: pressure transmitted equally in fluid", "Thermal efficiency η = useful output / total input"], conceptsAf: ["Meganiese voordeel MV = Las/Inspanning", "Pascal se wet: druk word gelyk in vloeistof oorgedra", "Termiese doeltreffendheid η = nuttige uitset / totale invoer"], exampleEn: { question: "A hydraulic jack has a small piston area of 10 cm² and a large piston area of 200 cm². An effort of 50 N is applied. What load can be lifted?", solution: "MA = 200 ÷ 10 = 20; Load = Effort × MA = 50 × 20 = 1 000 N" }, exampleAf: { question: "Hidrouliese domkrag het klein suier area 10 cm² en groot suier area 200 cm². 50 N inspanning word toegepas. Watter las kan gelig word?", solution: "MV = 200 ÷ 10 = 20; Las = Inspanning × MV = 50 × 20 = 1 000 N" } },

  // --------------------- RELIGION STUDIES ---------------------
  "RELI-1": { summaryEn: "Nature of religion and belief: definitions of religion, function of belief, sacred vs secular and phenomenology.", summaryAf: "Aard van godsdiens en geloof: definisies van godsdiens, funksie van geloof, heilig vs sekulêr en fenomenologie.", conceptsEn: ["Substantive vs functional definitions of religion", "Rudolf Otto: the 'numinous' (mysterium tremendum)", "Sacred (set apart) vs profane (ordinary)"], conceptsAf: ["Substantiewe vs funksionele definisies van godsdiens", "Rudolf Otto: die 'numineuze' (mysterium tremendum)", "Heilig (afgesonder) vs profaan (gewoon)"], exampleEn: { question: "Explain the difference between a substantive and a functional definition of religion.", solution: "Substantive: defines religion by its content — belief in the supernatural. Functional: defines it by what it does — providing meaning, community and moral guidance. Example: sport can be 'functional religion' if it fulfils these roles." }, exampleAf: { question: "Verduidelik die verskil tussen 'n substantiewe en funksionele definisie van godsdiens.", solution: "Substantief: definieer godsdiens deur sy inhoud — geloof in die bonatuurlike. Funksioneel: definieer dit deur wat dit doen — sin, gemeenskap en morele leiding bied. Voorbeeld: sport kan 'funksionele godsdiens' wees as dit hierdie rolle vervul." } },
  "RELI-2": { summaryEn: "Religious ethics: moral frameworks (deontology, consequentialism, virtue ethics) and their application to bioethics, environment and human rights.", summaryAf: "Godsdienstige etiek: morele raamwerke (deontologie, konsekwensialisme, deugde-etiek) en hul toepassing op bio-etiek, omgewing en menseregte.", conceptsEn: ["Deontology: duty-based (Kant's categorical imperative)", "Consequentialism: greatest good for greatest number (Mill)", "Ubuntu: 'I am because we are'"], conceptsAf: ["Deontologie: plig-gebaseer (Kant se kategoriese imperatief)", "Konsekwensialisme: grootste goed vir die meeste mense (Mill)", "Ubuntu: 'Ek is omdat ons is'"], exampleEn: { question: "Apply Ubuntu ethics to a scenario where a classmate cheats in an exam.", solution: "Ubuntu emphasises communal well-being: the cheating harms the community by undermining fairness. An Ubuntu response would involve honest dialogue and restoration, not just punishment." }, exampleAf: { question: "Pas Ubuntu-etiek toe op 'n scenario waar 'n klasmaat in 'n eksamen bedrieg.", solution: "Ubuntu beklemtoon gemeenskaplike welstand: die bedrog benadeel die gemeenskap deur billikheid te ondermyn. 'n Ubuntu-reaksie sou eerlike dialoog en herstel behels, nie net straf nie." } },
  "RELI-3": { summaryEn: "World religions: origins, sacred texts, key beliefs and practices of Hinduism, Buddhism, Judaism, Christianity and Islam.", summaryAf: "Wêreldgodsdienste: oorsprong, heilige tekste, sleuteloortuigings en praktyke van Hindoeïsme, Boeddhisme, Judaïsme, Christendom en Islam.", conceptsEn: ["Hinduism: dharma, karma, moksha, Vedas", "Buddhism: Four Noble Truths, Eightfold Path, Nirvana", "Islam: Five Pillars (Shahada, Salat, Zakat, Sawm, Hajj)"], conceptsAf: ["Hindoeïsme: dharma, karma, moksha, Vedas", "Boeddhisme: Vier Edele Waarhede, Agtledige Pad, Nirvana", "Islam: Vyf Pilare (Shahada, Salat, Zakat, Sawm, Hajj)"], exampleEn: { question: "State the Four Noble Truths of Buddhism.", solution: "1. Life involves suffering (dukkha). 2. Suffering is caused by craving (tanha). 3. Suffering can be ended. 4. The Eightfold Path is the way to end suffering." }, exampleAf: { question: "Stel die Vier Edele Waarhede van Boeddhisme.", solution: "1. Lewe behels lyding (dukkha). 2. Lyding word veroorsaak deur begeerlikheid (tanha). 3. Lyding kan beëindig word. 4. Die Agtledige Pad is die weg om lyding te beëindig." } },
  "RELI-4": { summaryEn: "Religion and society: religion's role in politics, gender, poverty, human rights and social justice in SA.", summaryAf: "Godsdiens en samelewing: die rol van godsdiens in politiek, geslag, armoede, menseregte en sosiale geregtigheid in SA.", conceptsEn: ["Liberation theology in SA anti-apartheid struggle", "Religion and LGBTQ+ rights debates", "Religious NGOs and welfare services"], conceptsAf: ["Bevrydingsteologie in SA se anti-apartheidsstryd", "Godsdiens en LGBTQ+-regstedebatte", "Godsdienstige NRO's en welsynsdienste"], exampleEn: { question: "How did liberation theology contribute to the anti-apartheid struggle in South Africa?", solution: "Liberation theologians (e.g. Archbishop Desmond Tutu) argued that God sides with the oppressed. This gave moral legitimacy to the struggle and mobilised churches as sites of resistance against apartheid." }, exampleAf: { question: "Hoe het bevrydingsteologie bygedra tot die anti-apartheidsstryd in Suid-Afrika?", solution: "Bevrydingsteoloë (bv. Aartsbiskop Desmond Tutu) het betoog dat God aan die kant van die verdruktes staan. Dit het morele legitimiteit aan die stryd gegee en kerke as terreine van weerstand teen apartheid gemobiliseer." } },
  "RELI-5": { summaryEn: "South African indigenous religions: African traditional religion, ancestor veneration, healing and ritual.", summaryAf: "Suid-Afrikaanse inheemse godsdienste: Afrika tradisionele godsdiens, voorouerverering, genesing en ritueel.", conceptsEn: ["Ancestors mediate between living and the divine", "Sangoma and inyanga roles in healing", "Ubuntu as both religious and ethical principle"], conceptsAf: ["Voorouers bemiddel tussen die lewendes en die goddelike", "Sangoma en inyanga se rolle in genesing", "Ubuntu as beide godsdienstige en etiese beginsel"], exampleEn: { question: "Explain the role of ancestors in African Traditional Religion.", solution: "Ancestors are the spirits of deceased family members who maintain a relationship with the living. They are consulted through rituals and offerings, and serve as intermediaries between humans and the Supreme Being." }, exampleAf: { question: "Verduidelik die rol van voorouers in die Afrika Tradisionele Godsdiens.", solution: "Voorouers is die geeste van oorlede familielede wat 'n verhouding met die lewendes handhaaf. Hulle word geraadpleeg deur rituele en offers, en dien as tussenganger tussen mense en die Opperwese." } },

  // --------------------- DRAMATIC ARTS ---------------------
  "DRAMA-1": { summaryEn: "Drama theory and history: Greek theatre, Elizabethan drama, Brecht, Grotowski and contemporary theatre forms.", summaryAf: "Dramateorie en -geskiedenis: Griekse teater, Elizabethaanse drama, Brecht, Grotowski en kontemporêre teatervorms.", conceptsEn: ["Greek: chorus, catharsis, tragedy vs comedy", "Brecht: Epic Theatre, Verfremdungseffekt (alienation effect)", "Grotowski: Poor Theatre, actor as central instrument"], conceptsAf: ["Grieks: koor, katarsis, tragedie vs komedie", "Brecht: Epiese Teater, Verfremdungseffekt (vervreemdingseffek)", "Grotowski: Arm Teater, akteur as sentrale instrument"], exampleEn: { question: "Explain Brecht's alienation effect (Verfremdungseffekt) and its purpose.", solution: "Brecht deliberately disrupted theatrical illusion — using signs, songs and direct address — so audiences think critically rather than emotionally identify with characters. Purpose: promote political awareness and social change." }, exampleAf: { question: "Verduidelik Brecht se vervreemdingseffek (Verfremdungseffekt) en sy doel.", solution: "Brecht het teatrale illusie doelbewus onderbreek — deur tekens, liedere en direkte aansprake — sodat die gehoor krities dink eerder as emosioneel met karakters identifiseer. Doel: bevorder politieke bewustheid en sosiale verandering." } },
  "DRAMA-2": { summaryEn: "Acting and performance: Stanislavski method, voice projection, physicality, character analysis and ensemble work.", summaryAf: "Speel en uitvoering: Stanislavski-metode, stemproeksie, fisiese spel, karakterontleding en ensembleswerk.", conceptsEn: ["Stanislavski's 'Given Circumstances' and 'Magic If'", "Voice: pitch, pace, pause, power, projection", "Physical score: movement, gesture, blocking"], conceptsAf: ["Stanislavski se 'Gegewe Omstandighede' en 'Magiese As'", "Stem: toonhoogte, tempo, pouse, krag, projeksie", "Fisiese partituur: beweging, gebaar, blokkering"], exampleEn: { question: "Apply Stanislavski's 'Magic If' to playing a character who is afraid.", solution: "'What if I were trapped in a burning building?' The actor uses this imaginary situation to generate genuine fear responses — racing heart, shallow breathing — rather than pretending to feel afraid." }, exampleAf: { question: "Pas Stanislavski se 'Magiese As' toe om 'n karakter te speel wat bang is.", solution: "'Wat as ek vasgevang was in 'n brandende gebou?' Die akteur gebruik hierdie verbeeldingsituasie om werklike vrees te genereer — jaende hart, vlak asemhaling — eerder as om te maak asof hy bang is." } },
  "DRAMA-3": { summaryEn: "Devising and playwriting: collaborative creation, dramatic structure, character, dialogue and script formats.", summaryAf: "Skepping en toneelskryf: samewerkende skeppingswerke, dramatiese struktuur, karakter, dialoog en skripsformate.", conceptsEn: ["Stimulus-to-performance devising process", "Three-act structure vs episodic structure", "Stage directions and layout conventions"], conceptsAf: ["Stimulus-tot-uitvoering skepping proses", "Drieaktige vs episodiese struktuur", "Toneelaanwysings en uitlegkonvensies"], exampleEn: { question: "Name three steps in a devising process when given a news article as stimulus.", solution: "1. Explore the stimulus through improvisation and discussion. 2. Identify themes and characters to develop. 3. Structure scenes into a dramatic arc and rehearse to a performance." }, exampleAf: { question: "Noem drie stappe in 'n skeppingsproses as 'n nuusartikel as stimulus gebruik word.", solution: "1. Verken die stimulus deur improvisasie en bespreking. 2. Identifiseer temas en karakters om te ontwikkel. 3. Struktureer tonele in 'n dramatiese boog en repeteer na 'n uitvoering." } },
  "DRAMA-4": { summaryEn: "Technical theatre: lighting design, sound design, set design, costume and stage management.", summaryAf: "Tegniese teater: beligting, klankontwerp, toneelafsetting, kostuum en verhoogbestuur.", conceptsEn: ["Key light, fill light, back light in stage lighting", "Sound plot documents all cues", "Props list, ground plan and prompt copy"], conceptsAf: ["Sleutellig, vullig, agtergrondlig in verhoogbeligting", "Klanklys dokumenteer alle lewe", "Rekwisietelys, grondplan en souffleurskopie"], exampleEn: { question: "Explain how lighting colour can affect the audience's emotional response.", solution: "Blue light suggests cold, sadness or isolation; red suggests danger, passion or violence; amber creates warmth. Designers choose colours to reinforce the emotional tone of each scene." }, exampleAf: { question: "Verduidelik hoe ligkleur die emosionele reaksie van die gehoor kan beïnvloed.", solution: "Blou lig stel koue, hartseer of isolasie voor; rooi stel gevaar, passie of geweld voor; oranjegeel skep warmte. Ontwerpers kies kleure om die emosionele toon van elke toneel te versterk." } },
  "DRAMA-5": { summaryEn: "South African drama: protest theatre, township plays, physical theatre and post-apartheid identity on stage.", summaryAf: "Suid-Afrikaanse drama: protesteater, dorpstoneel, fisiese teater en post-apartheid identiteit op die verhoog.", conceptsEn: ["Athol Fugard: intimate realism of apartheid", "Woza Albert!: two-hander physical protest", "Brett Bailey: spectacle and postcolonial identity"], conceptsAf: ["Athol Fugard: intieme realisme van apartheid", "Woza Albert!: tweepersoonstuk fisiese protes", "Brett Bailey: skouspel en postkoloniale identiteit"], exampleEn: { question: "How does Athol Fugard's 'Master Harold'… and the Boys expose apartheid's damage?", solution: "Through the relationship between white teenager Hally and Black waiters Sam and Willie, Fugard shows how apartheid infects even intimate friendships — culminating in Hally's racist act of spitting on Sam's face." }, exampleAf: { question: "Hoe bloot Athol Fugard se 'Master Harold'… and the Boys apartheid se skade?", solution: "Deur die verhouding tussen wit tiener Hally en Swart kelners Sam en Willie, wys Fugard hoe apartheid selfs intieme vriendskappe besmet — wat uitloop op Hally se rassistiese daad van spoeg op Sam se gesig." } },

  // --------------------- DANCE STUDIES ---------------------
  "DANCE-1": { summaryEn: "Dance theory and history: ancient ritual dance, ballet origins, modern dance pioneers and globalised contemporary forms.", summaryAf: "Dansteorie en -geskiedenis: antieke rituele dans, ballet-oorsprong, moderne dans-pioniers en geglobaliseerde kontemporêre vorms.", conceptsEn: ["Ballet codified in 17th-century France (Louis XIV)", "Isadora Duncan: free, expressive modern dance", "Laban Movement Analysis (LMA)"], conceptsAf: ["Ballet geformaliseer in 17de-eeuse Frankryk (Lodewyk XIV)", "Isadora Duncan: vrye, ekspressiewe moderne dans", "Laban Bewegingsanalise (LBA)"], exampleEn: { question: "How did Isadora Duncan's approach differ from classical ballet?", solution: "Ballet was codified, technical and concerned with perfect form. Duncan rejected corsets, pointe shoes and rigid positions — dancing barefoot, inspired by ancient Greek art and natural body movement." }, exampleAf: { question: "Hoe het Isadora Duncan se benadering van klassieke ballet verskil?", solution: "Ballet was geformaliseer, tegnies en besorg oor perfekte vorm. Duncan het korsette, spitskoene en rigiede posisies verwerp — kaalvoet gedans, geïnspireer deur antieke Griekse kuns en natuurlike liggaamsbeweging." } },
  "DANCE-2": { summaryEn: "African dance forms: social, ritual and ceremonial dances of South Africa (Zulu, Xhosa, Sotho, Venda traditions).", summaryAf: "Afrika-dansvorms: sosiale, rituele en seremoniële danse van Suid-Afrika (Zulu, Xhosa, Sotho, Venda tradisies).", conceptsEn: ["Gumboot dance: origins in mine compound resistance", "Reed dance (Umkhosi woMhlanga)", "Drumming and dance as inseparable in African traditions"], conceptsAf: ["Gumboots dans: oorsprong in mynkompound weerstand", "Rietdans (Umkhosi woMhlanga)", "Tromslaan en dans as onafskeidbaar in Afrika tradisies"], exampleEn: { question: "Explain the historical origins and social significance of Gumboot dance.", solution: "Gumboot dance began in gold mines where Black miners were forbidden to speak or make noise. They used stomping and slapping their rubber boots to communicate and resist in secret — transforming oppression into art." }, exampleAf: { question: "Verduidelik die historiese oorsprong en sosiale betekenis van Gumboots-dans.", solution: "Gumboots-dans het in goudmyne begin waar Swart mynwerkers verbied was om te praat of geraas te maak. Hulle het stamp en klap van hul rubberlaarse gebruik om in die geheim te kommunikeer en te weerstaan — onderdrukking in kuns omskep." } },
  "DANCE-3": { summaryEn: "Classical dance forms: ballet vocabulary, positions, barre and centre work, and classical choreographic structures.", summaryAf: "Klassieke dansvorms: ballet-woordeskat, posisies, staafwerk en middelpuntwerk, en klassieke choreografiese strukture.", conceptsEn: ["Five positions of the feet and arms", "Plié, tendu, dégagé, grand battement", "Corps de ballet, soloist, principal hierarchy"], conceptsAf: ["Vyf posisies van die voete en arms", "Plié, tendu, dégagé, grand battement", "Corps de ballet, soloïs, hoofartieshiërargie"], exampleEn: { question: "Describe a plié and explain its function in ballet training.", solution: "A plié (French: to bend) is a controlled bending of the knees while keeping the back straight and feet turned out. It warms the muscles, develops strength and is the foundation of most jumps and landings." }, exampleAf: { question: "Beskryf 'n plié en verduidelik sy funksie in balletopleiding.", solution: "Plié (Frans: buig) is 'n beheerde buig van die knieë terwyl die rug regop bly en voete uitgedraai is. Dit warm die spiere op, ontwikkel krag en is die grondslag van meeste spronge en landings." } },
  "DANCE-4": { summaryEn: "Contemporary dance: release technique, contact improvisation, site-specific dance and interdisciplinary performance.", summaryAf: "Kontemporêre dans: vrystellingstegniek, kontak improvisasie, terreinspesifieke dans en interdissiplinêre uitvoering.", conceptsEn: ["Release technique: gravity, flow, efficiency", "Contact improvisation: shared weight", "Post-modern: Judson Dance Theater, ordinary movement"], conceptsAf: ["Vrystellingstegniek: swaartekrag, vloei, doeltreffendheid", "Kontak improvisasie: gedeelde gewig", "Post-modernisties: Judson Dans Teater, gewone beweging"], exampleEn: { question: "What is contact improvisation and how does it differ from ballet?", solution: "Contact improvisation: two or more dancers share weight and respond to each other's momentum in real time — no set choreography. Ballet: fixed vocabulary, choreographed sequences, hierarchical structure." }, exampleAf: { question: "Wat is kontak improvisasie en hoe verskil dit van ballet?", solution: "Kontak improvisasie: twee of meer dansers deel gewig en reageer op mekaar se momentum in werklike tyd — geen vaste choreografie. Ballet: vaste woordeskat, gechoreografeerde reekse, hiërargiese struktuur." } },
  "DANCE-5": { summaryEn: "Choreography and composition: choreographic devices, spatial design, dynamics, structure and notating dance.", summaryAf: "Choreografie en komposisie: choreografiese toestelle, ruimtelike ontwerp, dinamika, struktuur en dansnotasie.", conceptsEn: ["Choreographic devices: unison, canon, retrograde, inversion", "Effort actions: dab, flick, glide, float, punch, slash, press, wring", "Notation systems: Laban (Labanotation) and Benesh"], conceptsAf: ["Choreografiese toestelle: unisono, kanon, terugwaarts, inversie", "Inspanningsaksies: dab, flick, glide, float, punch, slash, press, wring", "Notasiestelsels: Laban (Labanotasie) en Benesh"], exampleEn: { question: "Explain the choreographic device 'canon' and give an example of its effect.", solution: "Canon: dancers perform the same movement sequence at staggered time intervals (like a musical round). Effect: creates a rippling, wave-like visual impression and shows the movement from multiple temporal perspectives simultaneously." }, exampleAf: { question: "Verduidelik die choreografiese toestel 'kanon' en gee 'n voorbeeld van sy effek.", solution: "Kanon: dansers voer dieselfde bewegingsreeks uit in verspringende tydintervalle (soos 'n musikale ronde). Effek: skep 'n rimpelende, golfagtige visuele indruk en toon die beweging van meervoudige tydsdieptes gelyktydig." } },

  // --------------------- MUSIC ---------------------
  "MUSIC-1": { summaryEn: "Music theory: notation, rhythm, pitch, scales, intervals, chords, harmony and four-part writing.", summaryAf: "Musiekteorie: notasie, ritme, toonhoogte, toonlere, intervalle, akkoorde, harmonie en vierstemmige skryf.", conceptsEn: ["Major scale: W-W-H-W-W-W-H pattern", "Intervals: unison to octave (P1 to P8)", "Triad: root, third, fifth"], conceptsAf: ["Majeur toonleer: G-G-H-G-G-G-H patroon", "Intervalle: unisonoot tot oktaaf (R1 tot R8)", "Drieklank: grondnoot, derde, kwint"], exampleEn: { question: "Write the notes of a C major scale.", solution: "C – D – E – F – G – A – B – C (whole, whole, half, whole, whole, whole, half)" }, exampleAf: { question: "Skryf die note van 'n C-majeur toonleer.", solution: "C – D – E – F – G – A – B – C (heel, heel, half, heel, heel, heel, half)" } },
  "MUSIC-2": { summaryEn: "Music history: Baroque, Classical, Romantic, 20th-century and contemporary periods and their key composers.", summaryAf: "Musiekgeskiedenis: Barokke, Klassieke, Romantiese, 20ste-eeuse en kontemporêre periodes en hul sleutelkomponiste.", conceptsEn: ["Baroque (1600–1750): Bach, Handel, counterpoint", "Classical (1750–1820): Haydn, Mozart, sonata form", "Romantic (1820–1900): Beethoven, Brahms, programme music"], conceptsAf: ["Barokke (1600–1750): Bach, Handel, kontrapunt", "Klassiek (1750–1820): Haydn, Mozart, sonatevorm", "Romanties (1820–1900): Beethoven, Brahms, programmusiek"], exampleEn: { question: "Name two features of Baroque music.", solution: "1. Basso continuo: a continuous bass line harmonised by keyboard/lute. 2. Polyphony/counterpoint: multiple independent melodic lines woven together (e.g. Bach's fugues)." }, exampleAf: { question: "Noem twee kenmerke van Barokke musiek.", solution: "1. Basso continuo: 'n voortdurende baslyn geharminieer deur klawerbord/luit. 2. Polifonie/kontrapunt: meervoudige onafhanklike melodiese lyne saamgeweef (bv. Bach se fugas)." } },
  "MUSIC-3": { summaryEn: "Practical performance: technique, interpretation, sight-reading, ensemble skills and performance anxiety management.", summaryAf: "Praktiese uitvoering: tegniek, interpretasie, siglesing, ensemblevaardighede en bestuur van uitvoeringsangs.", conceptsEn: ["Tone production specific to each instrument/voice type", "Dynamics: pp, p, mp, mf, f, ff; crescendo/decrescendo", "Sight-reading: count silently, identify key/time signature first"], conceptsAf: ["Klankproduksie spesifiek vir elke instrument/stemtipe", "Dinamika: pp, p, mp, mf, f, ff; crescendo/decrescendo", "Siglees: tel stilsinnig, identifiseer sleutel/maatsoort eerste"], exampleEn: { question: "Name three strategies to manage performance anxiety before going on stage.", solution: "1. Controlled breathing: slow exhale calms the nervous system. 2. Positive visualisation: imagine a successful performance. 3. Thorough preparation: confidence comes from knowing the piece." }, exampleAf: { question: "Noem drie strategieë om uitvoeringsangs te bestuur voor jy op die verhoog gaan.", solution: "1. Beheerde asemhaling: stadige uitasem kalmeer die senuweestelsel. 2. Positiewe visualisering: verbeel 'n suksesvolle uitvoering. 3. Deeglike voorbereiding: vertroue kom uit die kennis van die stuk." } },
  "MUSIC-4": { summaryEn: "African music traditions: drum patterns, call-and-response, pentatonic scales, mbira, makwaya and the Cape Malay tradition.", summaryAf: "Afrika-musiek-tradisies: trompatrone, roep-en-antwoord, pentatoniese toonlere, mbira, makwaya en die Kaapse Maleise tradisie.", conceptsEn: ["Call-and-response: leader sings phrase, chorus answers", "Mbira (thumb piano): Shona tradition of Zimbabwe", "Makwaya: choral tradition blending African and Western styles"], conceptsAf: ["Roep-en-antwoord: leier sing frase, koor antwoord", "Mbira (duimpiano): Shona tradisie van Zimbabwe", "Makwaya: korustradisie wat Afrika en Westerse style meng"], exampleEn: { question: "What is call-and-response and in which South African context is it found?", solution: "Call-and-response is a musical conversation pattern where a leader sings or plays a phrase and a group answers. In SA: found in work songs, church music (umculo), gumboot dance chants and makwaya choral music." }, exampleAf: { question: "Wat is roep-en-antwoord en in watter Suid-Afrikaanse konteks word dit gevind?", solution: "Roep-en-antwoord is 'n musikale gesprekpatroon waar 'n leier 'n frase sing of speel en 'n groep antwoord. In SA: gevind in werkliedere, kerkmusiek (umculo), gumboots-sangs en makwaya-korusmusiek." } },
  "MUSIC-5": { summaryEn: "Composition and arranging: melodic development, harmonic progression, instrumentation and the compositional process.", summaryAf: "Komposisie en arrangering: melodiese ontwikkeling, harmoniese progressie, instrumentering en die komposisionele proses.", conceptsEn: ["Motive → phrase → period → section → form", "Chord progressions: I–IV–V–I (tonic–subdominant–dominant)", "Arranging: adapt an existing work for a new ensemble"], conceptsAf: ["Motief → frase → periode → afdeling → vorm", "Akkoordprogressies: I–IV–V–I (tonies–subdominant–dominant)", "Arrangering: pas 'n bestaande werk aan vir 'n nuwe ensemble"], exampleEn: { question: "Identify the chords in the I–IV–V–I progression in the key of G major.", solution: "I = G major, IV = C major, V = D major, I = G major. This is the most common harmonic cadence in Western tonal music." }, exampleAf: { question: "Identifiseer die akkoorde in die I–IV–V–I-progressie in die sleutel van G-majeur.", solution: "I = G-majeur, IV = C-majeur, V = D-majeur, I = G-majeur. Dit is die mees algemene harmoniese kadens in Westerse tonale musiek." } },

  // --------------------- DESIGN ---------------------
  "DESIGN-1": { summaryEn: "Design principles and elements: line, shape, colour, texture, space, balance, contrast, emphasis, unity and rhythm.", summaryAf: "Ontwerpbeginsels en -elemente: lyn, vorm, kleur, tekstuur, ruimte, balans, kontras, klem, eenheid en ritme.", conceptsEn: ["Colour wheel: primary, secondary, tertiary", "Complementary colours create maximum contrast", "Balance: symmetrical, asymmetrical, radial"], conceptsAf: ["Kleurwiel: primêre, sekondêre, tersiêre", "Komplementêre kleure skep maksimale kontras", "Balans: simmetries, asimmetries, radiaal"], exampleEn: { question: "Name the complementary colour of blue and explain how it would be used in design.", solution: "Orange is complementary to blue. Placed side by side, they create maximum visual contrast — useful for call-to-action buttons in web design or to make a product stand out on a shelf." }, exampleAf: { question: "Noem die komplementêre kleur van blou en verduidelik hoe dit in ontwerp gebruik sou word.", solution: "Oranje is komplementêr aan blou. Langs mekaar geplaas, skep hulle maksimale visuele kontras — nuttig vir aksie-oproepe knoppies in webontwerp of om 'n produk op 'n rak te laat uitstaan." } },
  "DESIGN-2": { summaryEn: "Design history and theory: major movements from Arts and Crafts to Postmodern and the role of context in design.", summaryAf: "Ontwerpgeskiedenis en -teorie: hoof bewegings van Kunste en Ambag tot Postmodernis en die rol van konteks in ontwerp.", conceptsEn: ["Arts & Crafts (Morris): reject industrial mass production", "Bauhaus: art + craft + technology unified", "Postmodern design: eclecticism and historical reference"], conceptsAf: ["Kunste & Ambag (Morris): verwerp industriële massaproduksie", "Bauhaus: kuns + ambag + tegnologie verenig", "Postmodernistiese ontwerp: eklektisisme en historiese verwysing"], exampleEn: { question: "Explain the key design philosophy of the Bauhaus school.", solution: "Bauhaus (1919–1933, Germany) unified fine art, craft and industrial design under one school — 'form follows function'. Its typography, furniture and architecture remain influential in modern design." }, exampleAf: { question: "Verduidelik die sleutel-ontwerpfilosofie van die Bauhaus-skool.", solution: "Bauhaus (1919–1933, Duitsland) het beeldende kuns, ambag en industriële ontwerp onder een skool verenig — 'vorm volg funksie'. Sy tipografie, meubels en argitektuur bly invloedryk in moderne ontwerp." } },
  "DESIGN-3": { summaryEn: "Communication design: typography, layout, branding, packaging, digital media and user interface design.", summaryAf: "Kommunikasieontwerp: tipografie, uitleg, handelsmerk, verpakking, digitale media en gebruikerskoppelvlakontwerp.", conceptsEn: ["Typeface anatomy: serif, sans-serif, leading, kerning", "Grid systems structure layouts", "UX principles: usability, accessibility, hierarchy"], conceptsAf: ["Lettertipe-anatomie: serif, sans-serif, interliniëring, spatiëring", "Roosterstelsels struktureer uitleg", "UX-beginsels: bruikbaarheid, toeganklikheid, hiërargie"], exampleEn: { question: "Explain the difference between a serif and sans-serif typeface and when each is used.", solution: "Serif typefaces (e.g. Times New Roman) have small decorative strokes at letter ends — traditionally used in print for readability. Sans-serif (e.g. Arial) lacks these strokes and is preferred for screens and headings." }, exampleAf: { question: "Verduidelik die verskil tussen 'n serif en sans-serif lettertipe en wanneer elkeen gebruik word.", solution: "Serif lettertipes (bv. Times New Roman) het klein dekoratiewe strepies aan letterpunte — tradisioneel gebruik in druk vir leesbaarheid. Sans-serif (bv. Arial) het nie hierdie strepies nie en is voorkeur vir skerms en opskrifte." } },
  "DESIGN-4": { summaryEn: "Environmental and industrial design: product design process, ergonomics, sustainability, materials and manufacturing.", summaryAf: "Omgewing- en industriële ontwerp: produkontwerp proses, ergonomie, volhoubaarheid, materiale en vervaardiging.", conceptsEn: ["Design process: research, ideate, prototype, test, refine", "Ergonomics: fit product to human body", "Life-cycle assessment and sustainable materials"], conceptsAf: ["Ontwerp proses: navorsing, ideer, prototipe, toets, verfyn", "Ergonomie: pas produk by menslike liggaam aan", "Lewensiklusontleding en volhoubare materiale"], exampleEn: { question: "Give two ergonomic considerations in designing a school chair.", solution: "1. Seat height: adjustable to allow feet flat on the floor. 2. Backrest angle: supports the lumbar curve to reduce lower back strain during long sitting periods." }, exampleAf: { question: "Gee twee ergonomiese oorwegings in die ontwerp van 'n skoolstoel.", solution: "1. Sithoogte: verstelbaar om voete plat op die vloer te laat. 2. Rugsteunhoek: ondersteun die lumbale kurwe om lae-rugpyn tydens lang sit periodes te verminder." } },
  "DESIGN-5": { summaryEn: "Surface design and fashion: textile design, pattern, print, fashion illustration, garment construction and trends.", summaryAf: "Oppervlakontwerp en mode: tekstielontwerp, patroon, druk, modeillustrasie, kledingstukbou en neigings.", conceptsEn: ["Repeat patterns: block, half-drop, brick, mirror", "Fashion illustration uses elongated proportions (9-head figure)", "Trend cycle: introduction, rise, peak, decline, obsolescence"], conceptsAf: ["Herhalingspatrone: blok, half-val, baksteen, spieël", "Modeillustrasie gebruik verlengde proporsies (9-kop figuur)", "Neigingsiklus: inleiding, styging, hoogtepunt, afname, veroudering"], exampleEn: { question: "Explain the 'trickle-down' theory of fashion trend adoption.", solution: "Trends originate with high-end designers (top), are copied by mid-range brands, then adopted by mass-market retailers and finally by bargain shops — each stage at a lower price point and later in time." }, exampleAf: { question: "Verduidelik die 'druppel-af' teorie van modetendens-aanvaarding.", solution: "Neigings ontstaan by hoë-end ontwerpers (bo), word gekopieer deur middel-reeks handelsmerk, dan aanvaar deur massamark-kleinhandelaars en laastens deur koopjieswinkels — elke fase teen 'n laer prys en later in tyd." } },

  // --------------------- CIVIL TECHNOLOGY ---------------------
  "CIVT-1": {
    summaryEn: "Structural loads, structural systems (beams, columns, frames), bending moment and shear force diagrams, and foundation types for civil construction.",
    summaryAf: "Strukturele laste, struktuurstelsels (draers, kolomme, rame), buigmoment- en skuifkragdiagramme, en fondamenttipes vir siviele konstruksie.",
    conceptsEn: ["Dead load (self-weight) + live load (occupants/furniture) + wind load", "Simply supported beam reactions: ΣM = 0 about each support", "Shear force diagram: constant between point loads, changes at load", "Bending moment diagram: peaks under point load; zero at pin supports", "Column buckling: slenderness ratio — tall thin columns fail first"],
    conceptsAf: ["Dooie las (eie gewig) + lewende las (beset/meubels) + windlas", "Eenvoudig gesteunde draer reaksies: ΣM = 0 om elke steun", "Skuifkragdiagram: konstant tussen puntlaste, verander by las", "Buigmomentdiagram: piek onder puntlas; nul by pen-steunings", "Kolombuiging: slankheidsverhouding — lang dun kolomme faal eerste"],
    exampleEn: { question: "A simply supported beam spans 6 m with a central point load of 12 kN. Calculate the reactions at each support.", solution: "By symmetry: RA = RB = 12 kN ÷ 2 = 6 kN at each support." },
    exampleAf: { question: "Eenvoudig gesteunde draer span 6 m met 'n sentrale puntlas van 12 kN. Bereken die reaksies by elke steun.", solution: "Deur simmetrie: RA = RB = 12 kN ÷ 2 = 6 kN by elke steun." },
  },
  "CIVT-2": {
    summaryEn: "Construction materials: properties, selection and uses of concrete, reinforced concrete, steel sections, timber, brick, mortar, plaster and modern composites.",
    summaryAf: "Boumateriaal: eienskappe, keuse en gebruike van beton, gewapende beton, staalsnitte, hout, baksteen, mortel, pleister en moderne saamgestelde materiale.",
    conceptsEn: ["Concrete: cement + fine aggregate (sand) + coarse aggregate + water", "W/C ratio: lower ratio → higher compressive strength", "Steel: excellent tensile strength; concrete: excellent compressive strength", "Reinforced concrete: rebar in tension zone combines both strengths", "Brickwork: frog always up to maximise mortar key and bond strength"],
    conceptsAf: ["Beton: sement + fyn aggregaat (sand) + growwe aggregaat + water", "W/S-verhouding: laer verhouding → hoër druksterkte", "Staal: uitstekende treksterkte; beton: uitstekende druksterkte", "Gewapende beton: rebar in trekzone kombineer albei sterktes", "Messelwerk: groef altyd op om mortelsleutel en bindkrag te maksimeer"],
    exampleEn: { question: "Why is reinforced concrete stronger than plain concrete?", solution: "Concrete is strong in compression but weak in tension. Steel reinforcement bars (rebar) are embedded in the concrete to resist tensile forces, creating a composite material with strength in both directions." },
    exampleAf: { question: "Hoekom is gewapende beton sterker as gewone beton?", solution: "Beton is sterk in druk maar swak in trek. Staalpenne (rebar) word in die beton ingebed om trekspannings te weerstaan, en skep 'n saamgestelde materiaal met krag in beide rigtings." },
  },
  "CIVT-3": {
    summaryEn: "Construction processes: site clearance, earthworks, foundation types, brickwork bonds, roof truss systems, plastering and waterproofing techniques.",
    summaryAf: "Boukonstruksieprosesse: terreinskoonmaak, grondwerk, fondamenttipes, baksteenverbandpatrone, daksparrestelsel, pleisterwerk en waterdigtingstegnieke.",
    conceptsEn: ["Foundation types: strip (load-bearing walls), pad (columns), raft (poor soil)", "Flemish bond: alternating headers and stretchers in every course", "English bond: alternate courses of headers and stretchers", "Roof truss types: king post, queen post, fink, attic (room-in-roof)", "Damp-proof course (DPC): horizontal barrier 150 mm above ground level"],
    conceptsAf: ["Fondamenttipes: strip (draermure), pad (kolomme), vlot (swak grond)", "Vlaamse verband: afwisselende koppe en strekkers in elke laag", "Engelse verband: afwisselende lae van koppe en strekkers", "Dakvaktipes: koningsbalk, koninginnebalk, fink, sotsdak (kamer-in-dak)", "Vogweringslaag (VWL): horisontale versperring 150 mm bo grondvlak"],
    exampleEn: { question: "When would a raft foundation be used instead of a strip foundation?", solution: "A raft foundation is used on soft, loose or waterlogged soils where load-bearing capacity is low. It spreads the building's weight over the entire footprint, reducing ground pressure." },
    exampleAf: { question: "Wanneer sou 'n vlot fondament gebruik word in plaas van 'n strip fondament?", solution: "Vlot fondament word gebruik op sagte, los of waterdeurdrenkte gronde waar draagkrag laag is. Dit versprei die gebou se gewig oor die hele voetstuk, wat gronddruk verminder." },
  },
  "CIVT-4": {
    summaryEn: "Technical drawing conventions for civil works: orthographic projection, plans, elevations, sections, SABS symbols, dimensions and title block requirements.",
    summaryAf: "Tegniese tekenkonvensies vir siviele werke: ortografiese projeksie, planne, elevasies, snitte, SABS-simbole, afmetings en titelblok-vereistes.",
    conceptsEn: ["Scales: 1:100 (general), 1:50 (details), 1:20 (junctions)", "First-angle (European) vs third-angle (American) projection", "Section hatching patterns: concrete (dots), steel (diagonal), timber (grain)", "Title block must include: project name, scale, date, revision, drawing number", "Dimension lines: continuous with arrowheads; leader lines for notes"],
    conceptsAf: ["Skale: 1:100 (algemeen), 1:50 (besonderhede), 1:20 (aansluitings)", "Eerste-hoek (Europees) vs derde-hoek (Amerikaans) projeksie", "Snitsarseringspatrone: beton (punte), staal (diagonaal), hout (grein)", "Titelblok moet insluit: projeknaam, skaal, datum, hersiening, tekeningnommer", "Afmetingslyne: deurlopend met pylpunte; leiderlyne vir notas"],
    exampleEn: { question: "What information must appear in a title block on a civil drawing?", solution: "Project name, drawing title, scale, date, drawn by, checked by, drawing number and revision number." },
    exampleAf: { question: "Watter inligting moet in 'n titelblok op 'n siviele tekening verskyn?", solution: "Projeknaam, tekeningstitel, skaal, datum, geteken deur, nagegaan deur, tekeningnommer en hersienommer." },
  },
  "CIVT-5": {
    summaryEn: "Civil services infrastructure: potable water supply chain, sewerage systems, stormwater drainage, electrical reticulation and integrated municipal service delivery.",
    summaryAf: "Siviele diensinfrastruktuur: drinkwatervoorsieningsketting, rioolwaterstelsels, stormwaterdreinering, elektriese retikulasie en geïntegreerde munisipale dienslewering.",
    conceptsEn: ["Water supply chain: source → dam → treatment plant → reticulation → meter", "Sewerage: gravity-flow mains to wastewater treatment works (WWTW)", "Separate system: sewer and stormwater kept in different pipes", "Stormwater: impermeable surfaces increase runoff — soakaways help", "Rising main: pumped sewer used when gravity flow is not possible"],
    conceptsAf: ["Watervoorsieningsketting: bron → dam → suiweringswerk → retikulasie → meter", "Riool: swaartekrag-hooflyne na afvalwatersuiweringswerke (AWSW)", "Aparte stelsel: riool en stormwater in verskillende pype gehou", "Stormwater: ondeurlatende oppervlakke verhoog afvloei — opweekslagte help", "Syperlyn: gepompte riool gebruik wanneer swaartekragvloei nie moontlik is nie"],
    exampleEn: { question: "Explain how sewerage differs from stormwater drainage and why they must be separated.", solution: "Sewerage carries human waste from toilets/sinks to a wastewater treatment works. Stormwater carries rainwater from roofs and roads to a river or sea. They must be separated to prevent contamination of waterways." },
    exampleAf: { question: "Verduidelik hoe rioolwater van stormwaterdreinering verskil en hoekom hulle geskei moet word.", solution: "Riool dra menslike afvalwater van toilette/opwasbakke na 'n afvalwatersuiweringswerk. Stormwater dra reënwater van dakke en paaie na 'n rivier of see. Hulle moet geskei word om besoedeling van waterweë te voorkom." },
  },

  // --------------------- ELECTRICAL TECHNOLOGY ---------------------
  "ELEC-1": {
    summaryEn: "AC and DC theory: Ohm's law, Kirchhoff's laws, reactance (XL and XC), impedance, phasor diagrams, resonance and power factor correction.",
    summaryAf: "WS en GS teorie: Ohm se wet, Kirchhoff se wette, reaktansie (XL en XC), impedansie, fasordiagramme, resonansie en kragfaktorkorreksie.",
    conceptsEn: ["Vrms = Vpeak / √2; Irms = Ipeak / √2", "Inductive reactance XL = 2πfL; capacitive XC = 1/(2πfC)", "Impedance Z = √(R² + (XL − XC)²)", "Power factor cos φ = P/S; unity PF means P = S (all real power)", "Resonance: XL = XC → Z = R (minimum), I = maximum"],
    conceptsAf: ["Vrms = Vpiek / √2; Irms = Ipiek / √2", "Induktiewe reaktansie XL = 2πfL; kapasitiewe XC = 1/(2πfC)", "Impedansie Z = √(R² + (XL − XC)²)", "Kragfaktor cos φ = P/S; eenheidskragfaktor beteken P = S (alle werklike krag)", "Resonansie: XL = XC → Z = R (minimum), I = maksimum"],
    exampleEn: { question: "An AC circuit has R = 3 Ω and XL = 4 Ω. Calculate the impedance.", solution: "Z = √(R² + XL²) = √(9 + 16) = √25 = 5 Ω" },
    exampleAf: { question: "'n WS-stroombaan het R = 3 Ω en XL = 4 Ω. Bereken die impedansie.", solution: "Z = √(R² + XL²) = √(9 + 16) = √25 = 5 Ω" },
  },
  "ELEC-2": {
    summaryEn: "Digital electronics: Boolean algebra, logic gates, De Morgan's theorems, combinational circuits (adders, multiplexers), flip-flops, counters and Karnaugh maps.",
    summaryAf: "Digitale elektronika: Booleaanse algebra, logiese hekke, De Morgan se stellings, kombinasionele stroombane (optellers, multipleksers), wentelslotte, tellers en Karnaugh-kaarte.",
    conceptsEn: ["AND, OR, NOT, NAND, NOR, XOR, XNOR truth tables", "De Morgan 1: ¬(A·B) = ¬A + ¬B; De Morgan 2: ¬(A+B) = ¬A·¬B", "SR, JK, D and T flip-flops store one bit of state", "4-bit binary counter: counts 0000 to 1111 (0–15)", "Karnaugh map: simplify Boolean expressions to minimum SOP form"],
    conceptsAf: ["EN, OF, NIE, NIE-EN, NIE-OF, OF-OF, NEOF-OF waarheidstabelle", "De Morgan 1: ¬(A·B) = ¬A + ¬B; De Morgan 2: ¬(A+B) = ¬A·¬B", "SR, JK, D en T wentelslotte berg een bis toestand", "4-bis binêre teller: tel 0000 tot 1111 (0–15)", "Karnaugh-kaart: vereenvoudig Booleaanse uitdrukkings na minimum SOP-vorm"],
    exampleEn: { question: "Complete the truth table for an AND gate with inputs A=1, B=0.", solution: "Output = A AND B = 1 AND 0 = 0. The AND gate outputs 1 only when BOTH inputs are 1." },
    exampleAf: { question: "Voltooi die waarheidstabel vir 'n EN-hek met invoere A=1, B=0.", solution: "Uitvoer = A EN B = 1 EN 0 = 0. Die EN-hek lewer 1 slegs as BEIDE invoere 1 is." },
  },
  "ELEC-3": {
    summaryEn: "Industrial electronics: op-amp configurations, oscillators, transducers (input/output), PLC ladder-logic programming and closed-loop control systems.",
    summaryAf: "Industriële elektronika: op-versterkerkonfigurasies, ossillators, transdusente (invoer/uitvoer), OLP-leerlogika-programmering en geslote-lus-beheerstelsels.",
    conceptsEn: ["Op-amp inverting: Vout = −(Rf/Rin)·Vin", "Op-amp non-inverting: Vout = (1 + Rf/Rin)·Vin", "Transducer converts physical quantity to electrical signal (e.g. thermocouple)", "PLC ladder diagram: contacts (inputs) and coils (outputs)", "Closed-loop: sensor → error signal → controller → actuator → process → sensor"],
    conceptsAf: ["Op-versterker omkerend: Vout = −(Rf/Rin)·Vin", "Op-versterker nie-omkerend: Vout = (1 + Rf/Rin)·Vin", "Transduent skakel fisiese hoeveelheid na elektriese sein om (bv. termokoppel)", "OLP leerdiagram: kontakte (invoere) en spoele (uitvoere)", "Geslote-lus: sensor → foutsein → beheerder → aktuator → proses → sensor"],
    exampleEn: { question: "Describe the three components of a basic control system with an example.", solution: "Sensor (input): temperature sensor reads room temp. Controller: thermostat compares reading to set point. Actuator (output): heater switches on or off. Example: household air conditioning system." },
    exampleAf: { question: "Beskryf die drie komponente van 'n basiese beheerstelsel met 'n voorbeeld.", solution: "Sensor (invoer): temperatuursensor lees kamertemp. Beheerder: termostaat vergelyk lesing met stelwaarde. Aktuator (uitvoer): verwarmer skakel aan of af. Voorbeeld: huishoudelike lugreëlingstelsel." },
  },
  "ELEC-4": {
    summaryEn: "Power systems: electricity generation (thermal, hydro, nuclear, renewables), transmission at high voltage, distribution, transformers, switchgear and SANS 10142 compliance.",
    summaryAf: "Kragstelsels: elektrisiteitsopwekking (termies, hidro, kern, hernubare), oordrag teen hoë spanning, verspreiding, transformators, skakeltuig en SANS 10142-nakoming.",
    conceptsEn: ["Step-up transformer: transmit at high V to reduce I²R cable losses", "3-phase power: P = √3·VL·IL·cosφ", "Transformer turns ratio: V1/V2 = N1/N2 = I2/I1", "SANS 10142-1: SA wiring code — earth leakage, breaker sizing, cable ratings", "Renewable integration: solar (PV inverter), wind (DFIG) feed the grid"],
    conceptsAf: ["Opstaptransformator: oordra teen hoë V om I²R kabelverlies te verminder", "3-fase krag: P = √3·VL·IL·cosφ", "Transformatorwindingsverhouding: V1/V2 = N1/N2 = I2/I1", "SANS 10142-1: SA bedradingskode — aardfout, stroombrekergrootte, kabelgraderings", "Hernubare integrasie: son (PV-omsetter), wind (DFIG) voed die rooster"],
    exampleEn: { question: "Why is electricity transmitted at high voltage over long distances?", solution: "High voltage reduces current (P = VI). Lower current means less power lost as heat in the cables (P_loss = I²R). Transformers step voltage up at the power station and step it back down near consumers." },
    exampleAf: { question: "Hoekom word elektrisiteit teen hoë spanning oor lang afstande oorgedra?", solution: "Hoë spanning verminder stroom (P = VI). Laer stroom beteken minder krag wat as hitte in kabels verlore gaan (P_verlies = I²R). Transformators stap spanning op by die kragstasie en stap dit weer af naby verbruikers." },
  },
  "ELEC-5": {
    summaryEn: "Motor control: DC and AC motor types, DOL and star-delta starters, contactors, thermal overload relays, variable speed drives (VSD) and motor protection.",
    summaryAf: "Motorbeheer: GS en WS motortipes, DOL en ster-delta aanlopers, kontaktors, termiese oorlas-relais, veranderlikespoed-drywers (VSD) en motorbeskerming.",
    conceptsEn: ["DOL (Direct On-Line) starter: full voltage direct — only for motors ≤ 5 kW", "Star-delta: start in star (1/√3 voltage), run in delta — reduces Istart by ⅓", "Contactor: electronically controlled switch for motor circuit", "Thermal overload relay: trips on sustained overcurrent to protect windings", "VSD (inverter drive): varies supply frequency to control motor speed smoothly"],
    conceptsAf: ["DOL (Direkte Aanlyn) aanloper: volle spanning direk — net vir motors ≤ 5 kW", "Ster-delta: begin in ster (1/√3 spanning), loop in delta — verminder Ibegin met ⅓", "Kontraktor: elektronies beheerde skakelaar vir motorstroombaan", "Termiese oorlasrelais: trip by volgehoue oorstroom om wikkelinge te beskerm", "VSD (omsetterdrywer): wissel voorsieningsfrekwensie om motorspoed glad te beheer"],
    exampleEn: { question: "Why is a star-delta starter used with large AC motors?", solution: "Large motors draw very high starting currents in DOL mode, which can trip breakers and damage windings. Star-delta reduces voltage to the motor at start (star), then switches to full voltage (delta) once running." },
    exampleAf: { question: "Hoekom word 'n ster-delta aanloper gebruik met groot WS-motors?", solution: "Groot motors trek baie hoë aanloopstrome in DOL-modus, wat brekers kan laat trip en wikkelinge beskadig. Ster-delta verminder spanning na die motor by aanloop (ster), dan skakel na volle spanning (delta) sodra dit loop." },
  },

  // --------------------- MECHANICAL TECHNOLOGY ---------------------
  "MECH-1": {
    summaryEn: "Fitting and machining: precision measurement instruments, engineering fits and tolerances, lathe operations, milling, drilling and surface finish standards.",
    summaryAf: "Passing en bewerking: presisiemeetinstrumente, ingenieurspassing en toleransies, draaibankbewerkings, fraisering, boor en oppervlakafwerkingstandaarde.",
    conceptsEn: ["Vernier caliper reads to 0.02 mm; micrometer to 0.01 mm", "Lathe operations: facing, parallel turning, taper turning, threading, boring", "Engineering fits: clearance (shaft < hole), interference (shaft > hole), transition", "Tolerance = upper limit − lower limit; bilateral tolerance: 25 ±0.02 mm", "Surface finish Ra: lower Ra value = smoother surface (Ra 0.8 = ground finish)"],
    conceptsAf: ["Vernier-meter lees tot 0,02 mm; mikrometer tot 0,01 mm", "Draaibankbewerkings: aansitvlak, paralleldraai, konus, skroefdraad, boor", "Ingenieurspassing: ruimte (spil < gat), interferensie (spil > gat), oorgangspassing", "Toleransie = boonste limiet − onderste limiet; bilaterale toleransie: 25 ±0,02 mm", "Oppervlak Ra: laer Ra-waarde = gladder oppervlak (Ra 0,8 = geslypte afwerking)"],
    exampleEn: { question: "A shaft has a nominal diameter of 25 mm with a tolerance of ±0.02 mm. What are the upper and lower limits?", solution: "Upper limit: 25 + 0.02 = 25.02 mm. Lower limit: 25 − 0.02 = 24.98 mm." },
    exampleAf: { question: "Spil het nominale deursnee van 25 mm met toleransie van ±0,02 mm. Wat is die boonste en onderste limiet?", solution: "Boonste limiet: 25 + 0,02 = 25,02 mm. Onderste limiet: 25 − 0,02 = 24,98 mm." },
  },
  "MECH-2": {
    summaryEn: "Welding processes: oxy-acetylene, SMAW (stick), MIG, TIG and resistance welding; weld joint types, symbols on drawings, distortion control and PPE.",
    summaryAf: "Sweisingsprosesse: oksie-asetileen, SMAW (staafsweis), MIG, TIG en weerstandsweising; lasnaattipes, simbole op tekeninge, vervormingsbeheer en PBT.",
    conceptsEn: ["Oxy-acetylene: fuel gas + oxygen; used for cutting and brazing", "SMAW: flux-coated electrode, AC or DC, covers and cleans weld", "MIG (GMAW): continuous wire, inert/active gas shield, high deposition rate", "TIG (GTAW): non-consumable tungsten, filler rod added separately — precise finish", "Joint types: butt, T-joint, lap, corner, edge — weld symbol on drawing shows type"],
    conceptsAf: ["Oksie-asetileen: brandgas + suurstof; gebruik vir sny en hardsoldering", "SMAW: fluksbedekte elektrode, WS of GS, bedek en reinig lasnaad", "MIG (GMAW): deurlopende draad, inerte/aktiewe gasskerming, hoë neerleggingskoers", "TIG (GTAW): nie-verbruikbare wolfram, vulstofdraad apart bygevoeg — presisiese afwerking", "Naattipes: stomp, T-naad, oortree, hoek, rand — lassimbool op tekening toon tipe"],
    exampleEn: { question: "Give two safety precautions a welder must take before starting a MIG welding job.", solution: "1. Inspect the gas hose and connections for leaks. 2. Wear appropriate PPE — welding helmet (shade 10–12), leather gloves and fire-resistant jacket." },
    exampleAf: { question: "Gee twee veiligheidsvoorsorgmaatreëls wat 'n sweiser moet neem voor 'n MIG-sweiswerk.", solution: "1. Inspekteer die gasslang en verbindings vir lekkasies. 2. Dra toepaslike PBT — sweisskerm (skaduwee 10–12), leerleer handskoene en brandwerende baadjie." },
  },
  "MECH-3": {
    summaryEn: "Automotive systems: 4-stroke petrol and diesel engine cycles, drivetrain, hydraulic brakes, suspension types, steering geometry, fuel injection and on-board diagnostics.",
    summaryAf: "Motorvoertuigstelsels: 4-slag petrol- en dieselenjiensiklusse, dryfstelsels, hidrouliese remstelsels, onderstel tipes, stuurgeometrie, brandstofinspuiting en boorddiagnostiek.",
    conceptsEn: ["4-stroke petrol cycle: intake → compression → power → exhaust", "Diesel differs: air compressed to ignition temp (no spark plug)", "Hydraulic disc brakes: Pascal's principle multiplies pedal force", "MacPherson strut: most common front suspension — compact and low cost", "OBD-II: standardised fault-code system; MIL (check engine light) triggers DTCs"],
    conceptsAf: ["4-slag petrolsiklus: inlaat → kompressie → drywing → uitlaat", "Diesel verskil: lug saamgepers tot ontbrandingstemp (geen vonkprop)", "Hidrouliese skyfremstelsel: Pascal se beginsel vermenigvuldig pedaalkrag", "MacPherson-stut: mees algemene vooronderstelling — kompak en lae koste", "OBD-II: gestandardiseerde foutkodestelsel; MIL (kyk enjin-lig) aktiveer DTC's"],
    exampleEn: { question: "Describe the four strokes of a petrol engine in order.", solution: "1. Intake: piston moves down, air-fuel mixture enters. 2. Compression: piston moves up, mixture compressed. 3. Power: spark plug fires, explosion forces piston down. 4. Exhaust: piston moves up, waste gases exit." },
    exampleAf: { question: "Beskryf die vier slae van 'n petrolenjin in volgorde.", solution: "1. Inlaat: suier beweeg af, lug-brandstofmengsel kom in. 2. Kompressie: suier beweeg op, mengsel word saamgepers. 3. Drywing: vonkprop ontsteek, ontploffing dryf suier af. 4. Uitlaat: suier beweeg op, uitlaatgasse verlaat." },
  },
  "MECH-4": {
    summaryEn: "Plumbing and pipe systems: pipe materials (CPVC, uPVC, galvanised, copper), joint types, fittings, trap seals, hot and cold water circuits, drainage falls and venting.",
    summaryAf: "Loodgieterswerk en pypstelsels: pypmateriale (CPVC, uPVC, gegalvaniseer, koper), verbindingtipes, hulpstukke, potseëls, warm en koue waterstroomstelsel, dreinering-helling en luggate.",
    conceptsEn: ["CPVC/copper: hot water systems; uPVC: cold water and drainage", "Joint types: compression (no heat), solvent weld (uPVC), capillary solder (copper)", "P-trap water seal: minimum 50 mm depth blocks sewer gases", "Venting pipe: prevents siphon breaking trap seals in soil stacks", "Fall on drainage: minimum 1:40 (horizontal) to maintain self-cleansing velocity"],
    conceptsAf: ["CPVC/koper: warm waterstelsels; uPVC: koue water en dreinering", "Verbindingtipes: kompressie (geen hitte), oplosmiddelsweis (uPVC), kapillêre soldeer (koper)", "P-pot waterseël: minimum 50 mm diepte blokkeer rioolgas", "Lugpyp: voorkom hefboom wat potseëls in grondstapels breek", "Helling op dreinering: minimum 1:40 (horisontaal) om selfskoonmaaksnelheid te behou"],
    exampleEn: { question: "Why is a P-trap (pot) installed under a sink?", solution: "The P-trap holds a water seal that blocks sewer gases (which are toxic and smelly) from entering the building through the drain. Without it, hydrogen sulphide and methane could enter the living space." },
    exampleAf: { question: "Hoekom word 'n P-pot (ger) onder 'n opwasbak geïnstalleer?", solution: "Die P-pot hou 'n waterseël wat rioolgas (giftig en vrot) verhoed om deur die drein in die gebou te kom. Sonder dit kan waterstofswawel en metaan die leefruimte binnedring." },
  },
  "MECH-5": {
    summaryEn: "Applied mechanics and hydraulics: force systems, moments, equilibrium, stress and strain, Young's modulus, hydraulic press principle and pneumatic systems.",
    summaryAf: "Toegepaste meganika en hidrolika: kragstelsel, momente, ewewig, spanning en rekking, Young se modulus, hidrouliese pers-beginsel en pneumatiese stelsels.",
    conceptsEn: ["Moment = Force × perpendicular distance; clockwise = anticlockwise for equilibrium", "Stress σ = F/A (Pa); Strain ε = ΔL/L (dimensionless)", "Young's modulus E = σ/ε — material stiffness constant", "Hydraulic press: F1/A1 = F2/A2 (Pascal) — small force → large force", "Pneumatics uses compressed air; hydraulics uses oil — both use Pascal's principle"],
    conceptsAf: ["Moment = Krag × loodreg afstand; met/teen kloksgewyse vir ewewig", "Spanning σ = F/A (Pa); Rekking ε = ΔL/L (dimensieloos)", "Young se modulus E = σ/ε — materiaal styfheidskonstante", "Hidrouliese pers: F1/A1 = F2/A2 (Pascal) — klein krag → groot krag", "Pneumatika gebruik saamgeperste lug; hidrolika gebruik olie — albei gebruik Pascal se beginsel"],
    exampleEn: { question: "A force of 200 N acts at 0.5 m from a pivot. Calculate the moment.", solution: "Moment = F × d = 200 × 0.5 = 100 N·m (Newton-metres)" },
    exampleAf: { question: "'n Krag van 200 N werk 0,5 m van 'n draaipunt af. Bereken die moment.", solution: "Moment = F × d = 200 × 0,5 = 100 N·m (Newton-meter)" },
  },

  // --------------------- DIGITAL TECHNOLOGY ---------------------
  "DIGT-1": { summaryEn: "Digital systems and networks: components, architectures, network protocols and infrastructure design.", summaryAf: "Digitale stelsels en netwerke: komponente, argitekture, netwerkprotokolle en infrastruktuurontwerp.", conceptsEn: ["OSI 7-layer model and TCP/IP 4-layer model", "Switching: circuit vs packet vs virtual circuit", "IPv6 address space vs IPv4 limitations"], conceptsAf: ["OSI 7-laag model en TCP/IP 4-laag model", "Skakel: stroombaan vs pakkie vs virtuele stroombaan", "IPv6-adresruimte vs IPv4-beperkings"], exampleEn: { question: "Name the four layers of the TCP/IP model from bottom to top.", solution: "1. Network Access (Link) 2. Internet 3. Transport 4. Application" }, exampleAf: { question: "Noem die vier lae van die TCP/IP-model van onder na bo.", solution: "1. Netwerktoegang (Skakel) 2. Internet 3. Vervoer 4. Toepassing" } },
  "DIGT-2": { summaryEn: "Programming and software development: Python/Java, OOP principles, version control and agile methodology.", summaryAf: "Programmering en sagteware-ontwikkeling: Python/Java, OOP-beginsels, weergawebeheer en agile-metodologie.", conceptsEn: ["Encapsulation, inheritance, polymorphism, abstraction", "Git: commit, branch, merge, pull request", "Agile: sprints, backlogs, retrospectives"], conceptsAf: ["Inkapseling, erfenis, polimorfisme, abstraksie", "Git: verbintenis, vertakking, samevoeging, trekversoek", "Agile: sprinte, agterstande, terugkyk-sessies"], exampleEn: { question: "In Python, write a function that returns the square of a number.", solution: "def square(n):\n    return n * n\n\nprint(square(5))  # Output: 25" }, exampleAf: { question: "In Python, skryf 'n funksie wat die kwadraat van 'n getal terugstuur.", solution: "def kwadraat(n):\n    return n * n\n\nprint(kwadraat(5))  # Uitvoer: 25" } },
  "DIGT-3": { summaryEn: "Data management and databases: SQL, NoSQL, data modelling, big data and cloud storage solutions.", summaryAf: "Databestuur en databasisse: SQL, NoSQL, datamodellering, groot data en wolkbergingoplossings.", conceptsEn: ["SQL: relational; NoSQL: document, key-value, graph", "ACID properties: Atomicity, Consistency, Isolation, Durability", "ETL (Extract, Transform, Load) for data warehouses"], conceptsAf: ["SQL: relasioneel; NoSQL: dokument, sleutel-waarde, grafiek", "ACID-eienskappe: Atomisiteit, Konsekwentheid, Isolasie, Duursaamheid", "ETL (Ekstraher, Transformeer, Laai) vir dataopslagpunte"], exampleEn: { question: "Give one advantage of NoSQL over SQL for a social media platform.", solution: "NoSQL (e.g. MongoDB) handles unstructured and varying data formats — perfect for user posts that may include text, images, videos and metadata with different fields per post." }, exampleAf: { question: "Gee een voordeel van NoSQL bo SQL vir 'n sosiale mediaplatform.", solution: "NoSQL (bv. MongoDB) hanteer ongestruktureerde en varierende dataformate — ideaal vir gebruikersboodskappe wat teks, beelde, video's en metadata met verskillende velde per boodskap kan insluit." } },
  "DIGT-4": { summaryEn: "Cybersecurity: threats, attack vectors, cryptography, access control, incident response and legal frameworks.", summaryAf: "Kuberveiligheid: bedreigings, aanvalsektore, kriptografie, toegangsbeheer, insidentreaksie en wetlike raamwerke.", conceptsEn: ["CIA triad: Confidentiality, Integrity, Availability", "Symmetric (AES) vs asymmetric (RSA) encryption", "POPIA in SA: protection of personal information"], conceptsAf: ["CIA drie-eenheid: Vertroulikheid, Integriteit, Beskikbaarheid", "Simmetriese (AES) vs asimmetriese (RSA) kodering", "POPIA in SA: beskerming van persoonlike inligting"], exampleEn: { question: "Explain the difference between symmetric and asymmetric encryption.", solution: "Symmetric: one shared key for encryption and decryption (fast, AES). Asymmetric: public key encrypts; private key decrypts (slower, RSA). HTTPS uses asymmetric to share a symmetric key securely." }, exampleAf: { question: "Verduidelik die verskil tussen simmetriese en asimmetriese kodering.", solution: "Simmetries: een gedeelde sleutel vir kodering en dekodering (vinnig, AES). Asimmetries: publieke sleutel kodeer; private sleutel dekodeer (stadiger, RSA). HTTPS gebruik asimmetries om 'n simmetriese sleutel veilig te deel." } },
  "DIGT-5": { summaryEn: "Digital communication: protocols, social media, digital media production, streaming and ethical considerations.", summaryAf: "Digitale kommunikasie: protokolle, sosiale media, digitale mediaproduksie, stroom en etiese oorwegings.", conceptsEn: ["HTTP/HTTPS, FTP, SMTP, VoIP protocols", "Digital media: compression formats (MP3, MP4, JPEG, PNG)", "Digital ethics: privacy, misinformation, digital rights"], conceptsAf: ["HTTP/HTTPS, FTP, SMTP, VoIP protokolle", "Digitale media: kompressieformate (MP3, MP4, JPEG, PNG)", "Digitale etiek: privaatheid, wanpersepsie, digitale regte"], exampleEn: { question: "Explain one ethical issue related to the use of AI-generated content on social media.", solution: "Deepfakes: AI can generate realistic fake videos of public figures saying things they never said. This spreads misinformation, violates privacy and damages reputation — raising legal and ethical questions of accountability." }, exampleAf: { question: "Verduidelik een etiese kwessie verwant aan die gebruik van KI-gegenereerde inhoud op sosiale media.", solution: "Deepfakes: KI kan realistiese nepdeo's van openbare figure skep wat goed sê wat hulle nooit gesê het nie. Dit versprei wanpersepsie, skend privaatheid en beskadig reputasie — en laat wetlike en etiese vrae van aanspreeklikheid." } },

  // --------------------- AGRICULTURAL MANAGEMENT PRACTICES ---------------------
  "AGRM-1": { summaryEn: "Farm management: planning, organising, leading and controlling farm enterprises for optimal profitability.", summaryAf: "Plaasbestuur: beplanning, organisering, leiding en beheer van plaasondernemings vir optimale winsgewendheid.", conceptsEn: ["Enterprise budget: gross income − variable costs = gross margin", "Break-even analysis for farm enterprises", "Record keeping: input/output registers"], conceptsAf: ["Ondernemingsbegroting: bruto inkomste − veranderlike koste = bruto marge", "Gelykbreekontleding vir plaasondernemings", "Rekordhouding: invoer/uitvoerregisters"], exampleEn: { question: "A vegetable farm earns R80 000 and has variable costs of R45 000 and fixed costs of R20 000. Calculate gross margin and net profit.", solution: "Gross Margin = R80 000 − R45 000 = R35 000. Net Profit = Gross Margin − Fixed Costs = R35 000 − R20 000 = R15 000." }, exampleAf: { question: "Groentepas verdien R80 000 en het veranderlike koste van R45 000 en vaste koste van R20 000. Bereken bruto marge en netto wins.", solution: "Bruto Marge = R80 000 − R45 000 = R35 000. Netto Wins = Bruto Marge − Vaste Koste = R35 000 − R20 000 = R15 000." } },
  "AGRM-2": { summaryEn: "Agricultural economics: supply and demand, price determination and marketing of farm products.", summaryAf: "Landbou-ekonomie: vraag en aanbod, prysvasstelling en bemarking van plaasprodukte.", conceptsEn: ["Inelastic demand for food commodities", "Co-operatives as collective marketing bodies", "Futures contracts reduce price risk"], conceptsAf: ["Onelastiese vraag vir voedsel­kommoditeite", "Ko-operasies as kollektiewe bemarkingsliggame", "Termynkontrakte verminder prysrisiko"], exampleEn: { question: "Explain why the demand for food is price inelastic.", solution: "Food is a necessity — people must eat regardless of price changes. A 20% price increase will not cause a 20% drop in quantity demanded. People buy slightly less or switch to cheaper alternatives but don't stop eating." }, exampleAf: { question: "Verduidelik hoekom die vraag vir voedsel prysonelasties is.", solution: "Voedsel is 'n noodsaaklikheid — mense moet eet ongeag prysveranderings. 'n 20% prysverhoging sal nie 'n 20% daling in gevraagde hoeveelheid veroorsaak nie. Mense koop effens minder of skakel oor na goedkoper alternatiewe maar stop nie om te eet nie." } },
  "AGRM-3": { summaryEn: "Marketing of agricultural products: channels, value chains, packaging, grading and agricultural marketing boards.", summaryAf: "Bemarking van landbouprodukte: kanale, waardekettings, verpakking, gradering en landboubemarkingsrade.", conceptsEn: ["Fresh Produce Markets (e.g. Johannesburg Market)", "Value chain: production → processing → retail", "PPECB (Perishable Products Export Control Board)"], conceptsAf: ["Varsproduktemarkte (bv. Johannesburgmark)", "Waardeketting: produksie → verwerking → kleinhandel", "PPECB (Perishable Products Export Control Board)"], exampleEn: { question: "Trace the value chain for a punnet of strawberries from farm to supermarket shelf.", solution: "Farm (grow/harvest) → packing shed (grade, wash, package) → cold chain transport → distribution centre → supermarket → consumer. Each step adds value and cost." }, exampleAf: { question: "Volg die waardeketting van 'n mandjie aarbeie van plaas tot supermarkrak.", solution: "Plaas (kweek/oes) → pakskuur (gradeer, was, verpak) → koue ketting vervoer → verspreidingsentrum → supermark → verbruiker. Elke stap voeg waarde en koste by." } },
  "AGRM-4": { summaryEn: "Soil management: soil health, pH correction, fertilisation programmes and soil conservation practices.", summaryAf: "Grondbestuur: grondgesondheid, pH-korreksie, bemestingsprogramme en grondbewaringspraktyke.", conceptsEn: ["Lime raises pH; sulphur lowers pH", "Soil health indicators: organic matter, biological activity", "Contour ploughing reduces erosion on slopes"], conceptsAf: ["Kalk verhoog pH; swael verlaag pH", "Grondgesondheidsaanduid: organiese materiaal, biologiese aktiwiteit", "Kontoerploeg verminder erosie op hellings"], exampleEn: { question: "A farmer's soil test shows pH 5.0 and low organic matter. Recommend two management practices.", solution: "1. Apply dolomitic lime to raise pH to 6.5 — consult lime recommendation from soil lab. 2. Add compost or plant a cover crop to increase organic matter, which improves structure and microbial activity." }, exampleAf: { question: "Boer se grondtoets toon pH 5,0 en lae organiese materiaal. Beveel twee bestuurspraktyke aan.", solution: "1. Pas dolomietkalk toe om pH na 6,5 te verhoog — raadpleeg kalkaanbeveling van grondlaboratorium. 2. Voeg kompos by of plant 'n dekgewas om organiese materiaal te verhoog, wat struktuur en mikrobiese aktiwiteit verbeter." } },
  "AGRM-5": { summaryEn: "Water management in agriculture: irrigation systems, scheduling, water-use efficiency and conservation.", summaryAf: "Waterbestuur in landbou: besproeiingstelsels, beplanning, watergebruikdoeltreffendheid en bewaring.", conceptsEn: ["Drip irrigation most water-efficient", "Evapotranspiration (ET) guides scheduling", "Water Act (SA): riparian rights and water licences"], conceptsAf: ["Druppelbesproeiing is die waterbesparendste", "Evapotranspirasie (ET) lei beplanning", "Waterwet (SA): ripariale regte en watervergunnings"], exampleEn: { question: "Compare drip irrigation and overhead sprinkler irrigation in terms of water efficiency.", solution: "Drip: delivers water directly to root zone; 90–95% efficiency; minimal evaporation loss. Overhead sprinkler: wets entire leaf area; 65–75% efficiency; higher evaporation and risk of foliar diseases." }, exampleAf: { question: "Vergelyk druppelbesproeiing en boboofse sprinklerbesproeiing in terme van waterbesparingsvermoë.", solution: "Druppel: lewer water direk na wortelsone; 90–95% doeltreffendheid; minimale verdampingsverlies. Boofse sprinkler: nat die hele blaaroppervlak; 65–75% doeltreffendheid; hoër verdamping en risiko van blaarsiektes." } },

  // --------------------- AGRICULTURAL TECHNOLOGY ---------------------
  "AGRT-1": { summaryEn: "Crop production technology: planting systems, soil preparation, weed and pest management, and harvest technology.", summaryAf: "Gewasproduksietegnologie: aanplantingstelsels, grondvoorbereiding, onkruid- en plaagbestuur, en oestegnologie.", conceptsEn: ["No-till preserves soil structure and reduces erosion", "IPM: biological, cultural, chemical control", "Combine harvester: threshing, separating, cleaning"], conceptsAf: ["No-till behou grondstruktuur en verminder erosie", "GPB: biologiese, kulturele, chemiese beheer", "Stroper: dorssteen, skeiding, skoonmaak"], exampleEn: { question: "Name the three components of Integrated Pest Management (IPM) and give one example of each.", solution: "Biological: release ladybirds to eat aphids. Cultural: crop rotation reduces soil-borne pathogens. Chemical: targeted pesticide application only when threshold is exceeded." }, exampleAf: { question: "Noem die drie komponente van Geïntegreerde Plaagbestuur (GPB) en gee een voorbeeld van elk.", solution: "Biologies: loslaat lieweheersbesies om luise te eet. Kultureel: gewasrotasie verminder grondbinding patogene. Chemies: geteikende plaagdodertoepassing slegs wanneer drempel oorskry word." } },
  "AGRT-2": { summaryEn: "Animal production technology: housing systems, feeding technology, health management and processing.", summaryAf: "Dierlike produksietegnologie: huisvestingstelsels, voertegnologie, gesondheidsbestuur en verwerking.", conceptsEn: ["Feedlot: intensive confined animal feeding", "TMR (Total Mixed Ration) for dairy cows", "HACCP: food safety in slaughterhouses"], conceptsAf: ["Voerkraal: intensiewe ingeslote dierevoer", "TMR (Totale Gemengde Rantsoen) vir melkkoeie", "HACCP: voedselveiligheid in abattoirs"], exampleEn: { question: "Explain the purpose of HACCP in an abattoir.", solution: "HACCP (Hazard Analysis Critical Control Points) identifies points in meat processing where contamination can occur (e.g. slaughter, chilling, packaging) and sets controls to prevent food safety hazards." }, exampleAf: { question: "Verduidelik die doel van HACCP in 'n abattoir.", solution: "HACCP (Gevaaranalise Kritiese Beheerpunte) identifiseer punte in vleisverwerkings waar besoedeling kan voorkom (bv. slag, verkoeling, verpakking) en stel beheermaatreëls in om voedselveiligheidsgevare te voorkom." } },
  "AGRT-3": { summaryEn: "Agricultural mechanisation: tractors, implements, maintenance, calibration and safety in mechanised farming.", summaryAf: "Landboumeganisasie: trekkers, implemente, onderhoud, kalibrasie en veiligheid in gemasjineerde boerdery.", conceptsEn: ["Tractor PTO (power take-off) drives implements", "Planter calibration: seeds per hectare", "Regular service intervals extend equipment life"], conceptsAf: ["Trekker AKO (agterkrag-aftakker) dryf implemente", "Planterkalibrering: sade per hektaar", "Gereelde onderhoudintervalle verleng toerusting se leeftyd"], exampleEn: { question: "Why must a planter be calibrated before planting season?", solution: "Calibration ensures the planter delivers the correct number of seeds per hectare for the specific crop. Over-seeding wastes expensive seed; under-seeding reduces yield. Even spacing improves crop uniformity." }, exampleAf: { question: "Hoekom moet 'n planter gekalibreer word voor die aanplantseisoen?", solution: "Kalibrering verseker dat die planter die korrekte getal sade per hektaar lewer vir die spesifieke gewas. Te veel sade mors duur saad; te min sade verminder opbrengs. Gelyke spasiëring verbeter gewas-eenvormigheid." } },
  "AGRT-4": { summaryEn: "Irrigation systems: design, installation, operation and maintenance of drip, sprinkler and flood systems.", summaryAf: "Besproeiingstelsels: ontwerp, installasie, bedryf en onderhoud van druppel-, sprinkler- en vloedstelsels.", conceptsEn: ["Drip (micro): water at root zone, minimal evaporation", "Sprinkler: suitable for wide range of crops and soils", "Scheduling: soil moisture sensors or ET-based models"], conceptsAf: ["Druppel (mikro): water by wortelsone, minimale verdamping", "Sprinkler: geskik vir wye reeks gewasse en gronde", "Beplanning: grondvogtsensors of ET-gebaseerde modelle"], exampleEn: { question: "Name two advantages and one disadvantage of drip irrigation.", solution: "Advantages: 1. Highest water use efficiency (90–95%). 2. Reduces weed growth (dry inter-rows). Disadvantage: high installation cost; emitters can block and require regular maintenance." }, exampleAf: { question: "Noem twee voordele en een nadeel van druppelbesproeiing.", solution: "Voordele: 1. Hoogste watergebruiksdoeltreffendheid (90–95%). 2. Verminder onkruidgroei (droë tussenrye). Nadeel: hoë installeringskoste; emitters kan blok en gereelde onderhoud vereis." } },
  "AGRT-5": { summaryEn: "Precision agriculture: GPS, GIS, drones, variable-rate technology and data-driven farm management.", summaryAf: "Presisielandbou: GPS, GIS, drones, veranderlike-koerstegnologie en data-gedrewe plaasbestuur.", conceptsEn: ["GPS guidance reduces overlap and input waste", "Drone imagery detects crop stress early", "Variable-rate seeding/fertilising matches field variability"], conceptsAf: ["GPS-leiding verminder oorvleueling en invoerverspilling", "Dronebeelding bespeur gewasspan­ning vroeg", "Veranderlike-koers saai/bemesting pas veldvariabiliteit aan"], exampleEn: { question: "How does variable-rate fertiliser application differ from blanket application?", solution: "Blanket: same rate of fertiliser across the entire field regardless of soil variation. Variable-rate: prescription maps from soil tests guide the applicator to apply more where deficient and less where nutrients are adequate — reducing cost and environmental impact." }, exampleAf: { question: "Hoe verskil veranderlike-koers bemesting van dekkingsbemesting?", solution: "Dekking: dieselfde koers bemesting oor die hele land ongeag grondvariasie. Veranderlike-koers: voorskrif-kaarte uit grondtoetse lei die toediener om meer toe te dien waar tekort en minder waar voedingstowwe voldoende is — verminder koste en omgewingsimpak." } },

  // --------------------- HOSPITALITY STUDIES ---------------------
  "HOSP-1": {
    summaryEn: "Food preparation: knife skills and cuts, classical stocks, the five mother sauces, moist vs dry heat cooking methods, temperature danger zone and basic kitchen hygiene.",
    summaryAf: "Voedselvoorbereiding: mesvaardighede en -snitte, klassieke fondse, die vyf moedersouse, vogtige vs droëhitte-kookmetodes, temperatuurgevaargebied en basiese kombuishigiëne.",
    conceptsEn: ["Knife cuts: julienne (matchstick), brunoise (2 mm dice), chiffonade (ribbon), paysanne (flat square)", "Five mother sauces: béchamel, velouté, espagnole, hollandaise, tomato", "Moist heat (boil, steam, poach, braise) vs dry heat (roast, bake, grill, deep-fry)", "Danger zone: 5°C–60°C — bacteria multiply rapidly; food must not stay in zone > 4 hours", "FIFO (First In First Out): older stock used before newer to prevent spoilage"],
    conceptsAf: ["Messnitte: julienne (vuurhoutjie), brunoise (2 mm blokkies), chiffonade (lint), paysanne (plat vierkant)", "Vyf moedersouse: béchamel, velouté, espagnole, hollandaise, tamatie", "Vogtighitte (kook, stoom, posjeer, smoor) vs droëhitte (rooster, bak, rooster, diepbraai)", "Gevaargebied: 5°C–60°C — bakterieë vermenigvuldig vinnig; kos mag nie > 4 ure in sone bly nie", "EVEU (Eerste Vir, Eerste Uit): ouer voorraad voor nuwer gebruik om bederf te voorkom"],
    exampleEn: { question: "Describe the julienne knife cut and give two dishes that use it.", solution: "Julienne: long, thin matchstick strips (approx. 5 cm × 2 mm × 2 mm). Used in: stir-fries (carrot, zucchini strips) and coleslaw garnish." },
    exampleAf: { question: "Beskryf die julienne messnit en gee twee geregte wat dit gebruik.", solution: "Julienne: lang, dun vuurhoutjiestepe (ca. 5 cm × 2 mm × 2 mm). Gebruik in: roerbraai (wortel, courgette stepe) en koolslaai garnering." },
  },
  "HOSP-2": {
    summaryEn: "Food and beverage service: place setting (cover), service styles (plate, silver, buffet, à la carte), wine service sequence, complaints handling and customer relations.",
    summaryAf: "Kos en drankbediening: plekopstelling (dekking), bedieningstyle (bord, silwer, buffet, à la carte), wynbedieningsvolgorde, klagte-hantering en kliënteverhoudings.",
    conceptsEn: ["Cover: cutlery placed 1 cm from edge, forks left, knives/spoons right", "Plate service (American): pre-plated in kitchen — fast, suitable for large functions", "Silver service (English): dish brought to table, food served with fork and spoon from left", "Wine service: present (label to guest) → open cleanly → taste for host → serve guests then host", "Complaint handling: listen, apologise, act, follow up — never argue with a guest"],
    conceptsAf: ["Dekking: bestek 1 cm van rand, vurke links, messe/lepels regs", "Bordbediening (Amerikaans): vooraf opgedien in kombuis — vinnig, geskik vir groot funksies", "Silwerbediening (Engels): skottel by tafel gebring, kos met vurk en lepel bedien van links", "Wynbediening: bied aan (etiket na gas) → open netjies → proe vir gasheer → bedien gaste dan gasheer", "Klagte-hantering: luister, verskoon, tree op, volg op — stry nooit met 'n gas nie"],
    exampleEn: { question: "Describe the correct procedure for presenting and opening a bottle of wine at the table.", solution: "1. Present the bottle (label facing guest) for approval. 2. Cut the foil below the second lip. 3. Insert corkscrew, extract cork cleanly. 4. Pour a small taste for the host. 5. Serve ladies first, host last." },
    exampleAf: { question: "Beskryf die korrekte prosedure vir die aanbieding en oopmaak van 'n wynbottel by die tafel.", solution: "1. Bied die bottel aan (etiket na gas) vir goedkeuring. 2. Sny die foelie onder die tweede lip. 3. Steek skroeftrek in, trek kurk skoon uit. 4. Gooi 'n klein proe vir die gasheer. 5. Bedien dames eerste, gasheer laaste." },
  },
  "HOSP-3": {
    summaryEn: "Nutrition and menu planning: macronutrients, special dietary requirements, menu types (table d'hôte vs à la carte), recipe costing, food cost percentage and menu engineering.",
    summaryAf: "Voeding en spyseniering: makrovoedingstowwe, spesiale dieetvereistes, spysenieringstipes (table d'hôte vs à la carte), resepkoste, voedselkospersentasie en spysenieringsontwerp.",
    conceptsEn: ["Macronutrients: carbohydrates (energy), proteins (repair), fats (insulation/vitamins)", "Special diets: vegetarian, vegan, kosher, halaal, diabetic, gluten-free", "Table d'hôte: set menu, fixed price; à la carte: individual dishes priced separately", "Food cost % = (ingredient cost ÷ selling price) × 100; target 28–35%", "Yield percentage: edible portion ÷ as-purchased weight × 100 — used in recipe costing"],
    conceptsAf: ["Makrovoedingstowwe: koolhidrate (energie), proteïene (herstel), vette (isolasie/vitamiene)", "Spesiale diëte: vegetariërs, veganisties, kosjeer, halaal, diabeties, glutenvry", "Table d'hôte: vasgestelde spyseniering, vaste prys; à la carte: individuele geregte apart geprijsde", "Voedselkoste % = (bestanddeelkoste ÷ verkoopprys) × 100; doelwit 28–35%", "Opbrengspersentasie: eetbare gedeelte ÷ aangekopte gewig × 100 — gebruik in resepkosteberekening"],
    exampleEn: { question: "A dish costs R28 to prepare and sells for R80. Calculate the food cost percentage.", solution: "Food cost % = (28 ÷ 80) × 100 = 35%. The industry target is typically 28–35%." },
    exampleAf: { question: "Gereg kos R28 om voor te berei en verkoop vir R80. Bereken die voedselkospesentasie.", solution: "Voedselkoste % = (28 ÷ 80) × 100 = 35%. Die bedryfsdoelwit is tipies 28–35%." },
  },
  "HOSP-4": {
    summaryEn: "Accommodation services: front office cycle (reservation → check-in → occupancy → check-out), housekeeping standards, room types, the PMS and Tourism Grading Council star ratings.",
    summaryAf: "Akkommodasiedienste: voorkantoor-siklus (bespreking → inteken → besetting → uiteken), huishoudingstandaarde, kamertipes, die EBS en Toerisme Graderingsraad ster-graderings.",
    conceptsEn: ["Guest cycle: pre-arrival → arrival → occupancy → departure → post-departure", "PMS (Property Management System): reservations, billing, housekeeping status", "Room types: single, twin, double, king, suite — differ in beds and amenities", "Housekeeping: room checklist ensures consistent standards before re-letting", "Tourism Grading Council SA: 1–5 star ratings across hotels, B&Bs, guesthouses"],
    conceptsAf: ["Gassiklus: voor-aankoms → aankoms → besetting → vertrek → na-vertrek", "EBS (Eiendomsbestuurstelsel): besprekings, rekening, huishoudingstatus", "Kamertipes: enkel, tweeling, dubbel, king, suite — verskil in beddens en geriewe", "Huishouding: kamer-kontrolelys verseker konsekwente standaarde voor hertoelating", "Toerisme Graderingsraad SA: 1–5 ster-graderings oor hotels, B&Bs, gashuise"],
    exampleEn: { question: "List three duties of a front desk receptionist at a hotel.", solution: "1. Check guests in and out using the PMS. 2. Handle reservations (phone, email, online). 3. Address guest queries and complaints promptly." },
    exampleAf: { question: "Lys drie pligte van 'n voorbalie-resepsionist by 'n hotel.", solution: "1. Gaste in- en uitregistreer met die EBS. 2. Besprekings hanteer (telefoon, e-pos, aanlyn). 3. Gastenavrae en klagtes stiptelik aanspreek." },
  },
  "HOSP-5": {
    summaryEn: "Tourism and hospitality industry: sectors, global and SA tourism trends, responsible and sustainable tourism, the impact of COVID-19 recovery and career pathways.",
    summaryAf: "Toerisme en gasvryheidsnywerheid: sektore, globale en SA-toerismetendens, verantwoordelike en volhoubare toerisme, die impak van COVID-19-herstel en loopbaanpaaie.",
    conceptsEn: ["Industry sectors: accommodation, food & beverage, transport, attractions, events", "UNWTO: global tourism body; SA Tourism: national marketing and policy", "Responsible tourism: minimise negative social, cultural and environmental impacts", "Fair Trade Tourism SA: certifies operators meeting fair-wage and community standards", "Career paths: chef, restaurant manager, hotel manager, event coordinator, sommelier"],
    conceptsAf: ["Bedryfssektore: akkommodasie, kos en drank, vervoer, besienswaardighede, geleenthede", "UNWTO: globale toerismeliggaam; SA Toerisme: nasionale bemarking en beleid", "Verantwoordelike toerisme: minimiseer negatiewe sosiale, kulturele en omgewingsimpakte", "Fair Trade Tourism SA: sertifiseer operateurs wat billike loon- en gemeenskapstandaarde nakom", "Loopbaanpaaie: sjef, restaurantbestuurder, hotelbestuurder, geleentheidskoördineerder, sommelier"],
    exampleEn: { question: "Describe two career pathways available to a Grade 12 learner with Hospitality Studies.", solution: "1. Culinary arts: enrol at a hotel school (e.g. HTA, Capsicum) to become a chef or food & beverage manager. 2. Hotel management: diploma at a tourism/hospitality institution leading to front office or operations manager roles." },
    exampleAf: { question: "Beskryf twee loopbaanpaaie beskikbaar vir 'n Graad 12-leerder met Gasvryheidstudie.", solution: "1. Kulinêre kuns: inskryf by 'n hotelskool (bv. HTA, Capsicum) om sjef of kos- en drankbestuurder te word. 2. Hotelbestuur: diploma by 'n toerisme/gasvryheidinstelling wat lei na voorbalie- of bedryfbestuursrolle." },
  },

  // --------------------- LIFE ORIENTATION ---------------------
  "LO-1": { summaryEn: "Personal development: self-awareness, emotional intelligence, goal setting, study skills and time management.", summaryAf: "Persoonlike ontwikkeling: selfbewustheid, emosionele intelligensie, doelwitstelling, studievaardighede en tydsbestuur.", conceptsEn: ["Maslow's hierarchy of needs", "SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound", "Emotional intelligence: self-awareness, regulation, empathy"], conceptsAf: ["Maslow se behoeftehiërargie", "SLIM doelwitte: Spesifiek, Meetbaar, Haalbaar, Relevant, Tydgebonde", "Emosionele intelligensie: selfbewustheid, regulering, empatie"], exampleEn: { question: "Rewrite this goal as a SMART goal: 'I want to improve my marks.'", solution: "SMART: 'I will increase my Mathematics mark from 55% to 65% by studying for 1 hour daily and completing 3 past papers per week before the June exam (6 weeks away).'" }, exampleAf: { question: "Herskryf hierdie doelwit as 'n SLIM-doelwit: 'Ek wil my punte verbeter.'", solution: "SLIM: 'Ek sal my Wiskunde punt van 55% na 65% verhoog deur daagliks 1 uur te studeer en 3 vorige vraestelle per week te voltooi voor die Junie-eksamen (6 weke later).'" } },
  "LO-2": { summaryEn: "Citizenship and democracy: the Constitution, human rights, civic responsibility and democratic participation.", summaryAf: "Burgerskap en demokrasie: die Grondwet, menseregte, burgerlike verantwoordelikheid en demokratiese deelname.", conceptsEn: ["Bill of Rights: Chapter 2 of SA Constitution (1996)", "Constitutional democracy vs authoritarian rule", "Civic responsibilities: vote, pay tax, obey law"], conceptsAf: ["Handves van Regte: Hoofstuk 2 van SA Grondwet (1996)", "Grondwetlike demokrasie vs outoritêre bewind", "Burgerlike verantwoordelikhede: stem, betaal belasting, gehoorsaam wet"], exampleEn: { question: "Name two rights in the South African Bill of Rights that are relevant to learners.", solution: "1. Right to education (Section 29): every child has the right to basic education. 2. Right to dignity (Section 10): learners cannot be subjected to degrading punishment." }, exampleAf: { question: "Noem twee regte in die Suid-Afrikaanse Handves van Regte wat vir leerders relevant is.", solution: "1. Reg op onderwys (Artikel 29): elke kind het die reg op basiese onderwys. 2. Reg op waardigheid (Artikel 10): leerders kan nie aan vernederende straf onderwerp word nie." } },
  "LO-3": { summaryEn: "Career development: career research, job application skills, CV writing, interviews and post-school pathways.", summaryAf: "Loopbaanontwikkeling: loopbaannavorsing, werkaansoekvaardighede, CV-skryf, onderhoude en na-skoolse paaie.", conceptsEn: ["Holland's RIASEC career interest categories", "CV: personal info, education, skills, experience", "Post-school: university, TVET, workplace, private colleges"], conceptsAf: ["Holland se RIASEC loopbaanbelang-kategorieë", "CV: persoonlike info, opvoeding, vaardighede, ervaring", "Na-skools: universiteit, BETV, werkplek, private kolleges"], exampleEn: { question: "List the six Holland RIASEC career types and give one career example for each.", solution: "R-Realistic: engineer. I-Investigative: scientist. A-Artistic: designer. S-Social: teacher. E-Enterprising: entrepreneur. C-Conventional: accountant." }, exampleAf: { question: "Lys die ses Holland RIASEC loopbaantipes en gee een loopbaanvoorbeeld vir elkeen.", solution: "R-Realisties: ingenieur. I-Ondersoekend: wetenskaplike. A-Artisties: ontwerper. S-Sosiaal: onderwyser. E-Ondernemend: entrepreneur. C-Konvensioneel: rekenmeesters." } },
  "LO-4": { summaryEn: "Physical education: fitness components, training principles, sport rules and healthy active lifestyles.", summaryAf: "Liggaamlike opvoeding: fiksheidskomponente, opleidingsbeginsels, sportreëls en gesonde aktiewe lewenstyle.", conceptsEn: ["FITT principle: Frequency, Intensity, Time, Type", "Health-related fitness: cardiorespiratory, muscular, flexibility, body composition", "Mental health benefits of regular exercise"], conceptsAf: ["FITT-beginsel: Frekwensie, Intensiteit, Tyd, Tipe", "Gesondheidsverband fiksheid: kardiorespiratorieë, spier, buigsaamheid, liggaamsamestelling", "Geestesgesondheidsvoordele van gereelde oefening"], exampleEn: { question: "Design a FITT plan for a Grade 12 learner wanting to improve cardiovascular fitness.", solution: "Frequency: 3–5 days/week. Intensity: 60–75% of maximum heart rate. Time: 30–45 minutes per session. Type: jogging, cycling or swimming (aerobic activity)." }, exampleAf: { question: "Ontwerp 'n FITT-plan vir 'n Graad 12-leerder wat kardiovaskulêre fiksheid wil verbeter.", solution: "Frekwensie: 3–5 dae/week. Intensiteit: 60–75% van maksimale harttempo. Tyd: 30–45 minute per sessie. Tipe: draf, fiets of swem (aërobiese aktiwiteit)." } },
  "LO-5": { summaryEn: "Health and environmental responsibility: substance abuse, reproductive health, environmental sustainability and community service.", summaryAf: "Gesondheid en omgewingsverantwoordelikheid: dwelmmisbruik, reproduktiewe gesondheid, omgewingsvolhoubaarheid en gemeenskapsdiens.", conceptsEn: ["LGBTQ+ rights in South African Constitution", "Teen pregnancy: prevention, support, rights", "Sustainable Development Goals (SDGs) — especially SDG 3, 4, 13"], conceptsAf: ["LGBTQ+-regte in die Suid-Afrikaanse Grondwet", "Tienerswangerskap: voorkoming, ondersteuning, regte", "Volhoubare Ontwikkelingsdoelwitte (VOD) — veral VOD 3, 4, 13"], exampleEn: { question: "Explain what SDG 13 (Climate Action) means and give one action a learner can take.", solution: "SDG 13 calls for urgent action to combat climate change. A learner's action: reduce single-use plastic (e.g. carry a reusable bottle/bag) to decrease ocean and landfill pollution." }, exampleAf: { question: "Verduidelik wat VOD 13 (Klimaataksie) beteken en gee een aksie wat 'n leerder kan neem.", solution: "VOD 13 roep op tot dringende aksie om klimaatsverandering te bestry. Leerder se aksie: verminder enkelmaal-plastiek (bv. dra 'n herbruikbare bottel/sak) om oseaan en stortingsterrein besoedeling te verminder." } },

  // --------------------- ISIZULU HOME LANGUAGE (Task #534) ---------------------
  "ZULH-1": { summaryEn: "Studying the prescribed isiZulu novel: plot, characterisation, theme, narrative perspective and cultural context.", summaryAf: "Bestudering van die voorgeskrewe isiZulu-roman: intrige, karakterisering, tema, vertellersp­erspektief en kulturele konteks.", conceptsEn: ["Plot structure: isiqalo (beginning), inyanga (development), isiphetho (conclusion)", "Ubuntu as a recurring theme in isiZulu literature", "Narrator perspective: first-person (ngiyakhuluma) vs third-person omniscient"], conceptsAf: ["Verhaalstruktuur: isiqalo, inyanga, isiphetho", "Ubuntu as herhalende tema in isiZulu letterkunde", "Vertellersperspektief: eerstepersoons vs alwetende derdepersoons"], exampleEn: { question: "Explain how the concept of ubuntu shapes character relationships in isiZulu literature.", solution: "Ubuntu ('I am because we are') creates characters who prioritise community harmony over individual gain. Conflicts arise when characters violate ubuntu, and resolution often restores communal bonds." }, exampleAf: { question: "Verduidelik hoe ubuntu karakterverhoudings in isiZulu letterkunde vorm.", solution: "Ubuntu ('Ek is omdat ons is') skep karakters wat gemeenskapsharmonie bo individuele wins stel. Konflikte ontstaan wanneer karakters ubuntu skend, en die oplossing herstel dikwels gemeenskapsband." } },
  "ZULH-2": { summaryEn: "Drama in isiZulu: dramatic structure, dialogue, stage directions, dramatic irony and performance conventions.", summaryAf: "Drama in isiZulu: dramatiese struktuur, dialoog, toneelaanwysings, dramatiese ironie en opvoeringskonvensies.", conceptsEn: ["Acts (izigaba) and scenes (izindima)", "Soliloquy (inkulumo yomuntu yedwa) reveals inner conflict", "Dramatic irony: audience aware of what characters are not"], conceptsAf: ["Bedrywe (izigaba) en tonele (izindima)", "Aleenspraak onthul innerlike konflik", "Dramatiese ironie: gehoor is bewus van dit wat karakters nie weet nie"], exampleEn: { question: "What is the purpose of a soliloquy in isiZulu drama?", solution: "A soliloquy allows a character to speak their private thoughts aloud to the audience, revealing inner conflict, motivation or moral dilemma that other characters cannot hear, deepening dramatic tension." }, exampleAf: { question: "Wat is die doel van 'n aleenspraak in isiZulu-drama?", solution: "'n Aleenspraak laat 'n karakter privaat gedagtes hardop aan die gehoor uitspreek, wat innerlike konflik, motivering of morele dilemma onthul wat ander karakters nie kan hoor nie." } },
  "ZULH-3": { summaryEn: "isiZulu poetry (izinkondlo): form, sound devices, figurative language, tone and cultural imagery.", summaryAf: "isiZulu poësie (izinkondlo): vorm, klanktoestelle, figuurlike taal, toon en kulturele beeldspraak.", conceptsEn: ["Izinkondlo use praise-poetry (izibongo) conventions", "Repetition (ukuphinda) for emphasis and rhythm", "Imagery drawn from nature: rivers, cattle, mountains"], conceptsAf: ["Izinkondlo gebruik lofsang (izibongo) konvensies", "Herhaling (ukuphinda) vir klem en ritme", "Beeldspraak ontleen aan natuur: riviere, beeste, berge"], exampleEn: { question: "Identify two features of izibongo (praise poetry) that appear in isiZulu poetry.", solution: "1. Parallel structure: repeating phrases in different forms to build intensity. 2. Praise names (izithakazelo): linking the subject to ancestors and heroic deeds to honour their lineage." }, exampleAf: { question: "Identifiseer twee kenmerke van izibongo (lofsange) wat in isiZulu poësie voorkom.", solution: "1. Parallelle struktuur: herhaling van frases in verskillende vorms om intensiteit op te bou. 2. Lofname (izithakazelo): die onderwerp koppel aan voorouers en heldefigure om die nageslag te vereer." } },
  "ZULH-4": { summaryEn: "isiZulu short stories (izindaba ezimfishane): compression, single effect, point of view and oral storytelling traditions.", summaryAf: "isiZulu kortverhale (izindaba ezimfishane): bondigheid, enkele effek, perspektief en mondelinge verteltradiskie.", conceptsEn: ["Single central conflict resolved in limited time", "Oral tradition influences: repetition, proverbs (izaga)", "Twist or reflective ending common in short stories"], conceptsAf: ["Enkele sentrale konflik binne beperkte tyd opgelos", "Mondelinge tradisie invloede: herhaling, spreekwoorde (izaga)", "Verrassings- of reflektiewe einde algemeen in kortverhale"] },
  "ZULH-5": { summaryEn: "isiZulu language structures: noun classes, verb tenses, concordial agreement, punctuation and register.", summaryAf: "isiZulu taalstrukture: naamwoordklasse, werkwoordstye, konkordiële ooreenkoms, leestekens en register.", conceptsEn: ["isiZulu has 15+ noun classes with prefixes that govern agreement (concord)", "Verb tenses: present (nje), past (esikhathini esidlule), future (esikhathini esizozo)", "Register: formal (izitatimende) vs informal (izingxoxo)"], conceptsAf: ["isiZulu het 15+ naamwoordklasse met voorvoegsels wat ooreenkoms (konkord) bepaal", "Werkwoordstye: teenwoordig, verlede, toekomend", "Register: formeel vs informeel"], exampleEn: { question: "Explain how noun class prefixes affect concordial agreement in isiZulu.", solution: "Each noun class has a subject prefix. E.g. class 1 (u-) → umuntu (person) uses subject concord u-: 'Umuntu uyahamba' (The person is walking). The verb prefix matches the noun class, not the word order." }, exampleAf: { question: "Verduidelik hoe naamwoordklasvoorvoegsels konkordiële ooreenkoms in isiZulu beïnvloed.", solution: "Elke naamwoordklas het 'n onderwerp-voorvoegsel. Bv. klas 1 (u-) → umuntu (persoon) gebruik onderwerps-konkord u-: 'Umuntu uyahamba' (Die persoon stap). Die werkwoordvoorvoegsel pas die naamwoordklas, nie die woordvolgorde nie." } },
  "ZULH-6": { summaryEn: "Reading for understanding: skimming, scanning, inferring meaning, identifying main ideas and writing a 60–80 word summary.", summaryAf: "Lees vir begrip: skim, skandeer, lei betekenis af, identifiseer hoofidees en skryf 'n 60–80 woord opsomming.", conceptsEn: ["Identify topic sentences (izihloko zomugqa)", "Distinguish literal (ukubona nje) from inferential (ukucabanga) meaning", "Summary: 7 main points in own words, do not copy verbatim"], conceptsAf: ["Identifiseer onderwerpsinne", "Onderskei letterlike van afleidende betekenis", "Opsomming: 7 hoofpunte in eie woorde, moenie woordeliks kopieer nie"] },
  "ZULH-7": { summaryEn: "Essay writing in isiZulu: argumentative, descriptive, narrative and reflective essays of 400–450 words.", summaryAf: "Opstelskryf in isiZulu: betogend, beskrywend, narratief en refleksief, 400–450 woorde.", conceptsEn: ["Inleiding (isethulo): hook + thesis", "Body paragraphs: PEEL (Point, Evidence, Explain, Link)", "Isiphetho (conclusion): summarise + clincher"], conceptsAf: ["Isethulo (inleiding): haak + tesisstelling", "Lyftekste: PEEL (Punt, Bewyse, Verduidelik, Koppel)", "Isiphetho (slot): vat saam + sleutelsin"], exampleEn: { question: "List the four types of essays tested in isiZulu HL and give one structural tip for each.", solution: "1. Argumentative — clear thesis, counter-argument acknowledged. 2. Descriptive — sensory details, vivid language. 3. Narrative — chronological events with a climax. 4. Reflective — personal insight and lessons learned." }, exampleAf: { question: "Lys die vier opsteltipes in isiZulu HT en gee een strukturele wenk vir elkeen.", solution: "1. Betogend — duidelike tesisstelling, teëargument erken. 2. Beskrywend — sensoriese besonderhede, lewendige taal. 3. Narratief — chronologiese gebeure met klimaks. 4. Refleksief — persoonlike insig en lesse geleer." } },
  "ZULH-8": { summaryEn: "Transactional writing in isiZulu: formal letters, reports, newspaper articles, diary entries and advertisements.", summaryAf: "Transaksionele skryf in isiZulu: formele briewe, verslae, koerantartikels, dagboekinskrywings en advertensies.", conceptsEn: ["Formal letter: sender address, date, salutation, body, closing", "Newspaper article: headline, byline, inverted pyramid structure", "Match register and tone to purpose and audience"], conceptsAf: ["Formele brief: afsendereadres, datum, aanhef, liggaam, afsluiting", "Koerantartikel: opskrif, bylyn, omgekeerde piramied", "Pas register en toon aan by doel en gehoor"] },

  // --------------------- ISIXHOSA HOME LANGUAGE (Task #534) ---------------------
  "XHOH-1": { summaryEn: "Studying the prescribed isiXhosa novel: plot, characterisation, theme, narrative perspective and cultural context.", summaryAf: "Bestudering van die voorgeskrewe isiXhosa-roman: intrige, karakterisering, tema, vertellersperspektief en kulturele konteks.", conceptsEn: ["Oral tradition (Ubuntu) shapes isiXhosa narratives", "Plot arc: ukuqala (beginning), ukuphakama (rising action), isiphelo (resolution)", "Characterisation through action, dialogue and community interaction"], conceptsAf: ["Mondelinge tradisie (Ubuntu) vorm isiXhosa-verhale", "Verhaalboë: ukuqala, ukuphakama, isiphelo", "Karakterisering deur aksie, dialoog en gemeenskapsinteraksie"] },
  "XHOH-2": { summaryEn: "isiXhosa drama: dramatic structure, dialogue, conflict types, stage directions and performance conventions.", summaryAf: "isiXhosa drama: dramatiese struktuur, dialoog, konfliksoorte, toneelaanwysings en opvoeringskonvensies.", conceptsEn: ["External conflict (umxholo wobomi) vs internal conflict (umxholo wengqondo)", "Dialogue reveals character and advances plot", "Dramatic tension built through suspense and irony"], conceptsAf: ["Uiterlike konflik vs innerlike konflik", "Dialoog onthul karakter en bevorder intrige", "Dramatiese spanning gebou deur suspense en ironie"] },
  "XHOH-3": { summaryEn: "isiXhosa poetry (iimibongo): form, sound devices, praise-poetry traditions, figurative language and tone.", summaryAf: "isiXhosa poësie (iimibongo): vorm, klanktoestelle, lofsangtradiksies, figuurlike taal en toon.", conceptsEn: ["Iimibongo (praise poetry): celebrates ancestors and heroes", "Repetition, parallelism and enumeration for rhythm", "Imagery from Xhosa culture: cattle, rivers, initiation"], conceptsAf: ["Iimibongo (lofsange): vereer voorouers en helde", "Herhaling, parallelisme en opsomming vir ritme", "Beeldspraak uit Xhosa-kultuur: beeste, riviere, inisiasie"] },
  "XHOH-4": { summaryEn: "isiXhosa short stories: compression, single conflict, oral traditions, proverbs and narrative perspective.", summaryAf: "isiXhosa kortverhale: bondigheid, enkele konflik, mondelinge tradisies, spreekwoorde en vertellersperspektief.", conceptsEn: ["Proverbs (imizekeliso) embedded in narrative", "Single setting, limited characters, quick resolution", "First-person narrator creates intimacy with reader"], conceptsAf: ["Spreekwoorde (imizekeliso) in verhaal ingebed", "Enkele omgewing, beperkte karakters, vinnige oplossing", "Eerstepersoons verteller skep intimiteit met leser"] },
  "XHOH-5": { summaryEn: "isiXhosa language structures: noun classes, tenses, concord, word order and standard written conventions.", summaryAf: "isiXhosa taalstrukture: naamwoordklasse, tye, konkord, woordvolgorde en standaard skrifkonvensies.", conceptsEn: ["Noun class system governs verb and adjective agreement", "Clicks: dental (c), alveolar (q), lateral (x) — written representation", "Formal vs informal register differences"], conceptsAf: ["Naamwoordklasstelsel bepaal werkwoord- en byvoeglike naamwoord-ooreenkoms", "Klikklanke: dentaal (c), alveolêr (q), lateraal (x) — skriftelike voorstelling", "Formele vs informele registerverskille"] },
  "XHOH-6": { summaryEn: "Comprehension and summary in isiXhosa: identifying main ideas, inferring meaning and writing a concise summary.", summaryAf: "Begrip en opsomming in isiXhosa: hoofidees identifiseer, betekenis aflei en 'n bondi­ge opsomming skryf.", conceptsEn: ["Read for gist before detail: global then local understanding", "Inference: what the text implies but does not state directly", "Summary: 7 points in own words within 60–80 words"], conceptsAf: ["Lees vir algemene idee voor detail: globale dan plaaslike begrip", "Afleiding: wat die teks impliseer maar nie direk stel nie", "Opsomming: 7 punte in eie woorde, 60–80 woorde"] },
  "XHOH-7": { summaryEn: "Essay writing in isiXhosa: argumentative, descriptive, narrative and reflective essays (400–450 words).", summaryAf: "Opstelskryf in isiXhosa: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Introduction: hook sentence + clear thesis", "Body: 3 paragraphs each with one main point supported by evidence", "Conclusion: restate thesis, summarise, strong closing sentence"], conceptsAf: ["Inleiding: aandag-sin + duidelike tesis", "Liggaam: 3 paragrawe elk met een hoofpunt gesteun deur bewyse", "Slot: tesis herhaal, vat saam, sterk afsluitsin"] },
  "XHOH-8": { summaryEn: "Transactional writing in isiXhosa: formal and informal letters, reports, newspaper articles and diary entries.", summaryAf: "Transaksionele skryf in isiXhosa: formele en informele briewe, verslae, koerantartikels en dagboekinskrywings.", conceptsEn: ["Text type conventions: layout, format and register", "Formal letter layout: address, date, reference, body, signature", "Newspaper article: headline + inverted pyramid (most important first)"], conceptsAf: ["Teks tipe konvensies: uitleg, formaat en register", "Formele brief uitleg: adres, datum, verwysing, liggaam, handtekening", "Koerantartikel: opskrif + omgekeerde piramied (belangrikste eerste)"] },

  // --------------------- SEPEDI HOME LANGUAGE (Task #534) ---------------------
  "SEPH-1": { summaryEn: "Studying the prescribed Sepedi novel: plot, characterisation, theme, narrative perspective and cultural context.", summaryAf: "Bestudering van die voorgeskrewe Sepedi-roman: intrige, karakterisering, tema, vertellersperspektief en kulturele konteks.", conceptsEn: ["Sepedi narrative tradition: oral storytelling (dinaledi) influences written fiction", "Ubuntu ethic: communal responsibility shapes character motivation", "Plot analysis: mathomong (beginning), gare (middle), mafelelong (end)"], conceptsAf: ["Sepedi verteltradiksie: mondelinge verhaalvertellings (dinaledi) beïnvloed geskrewe fiksie", "Ubuntu etiek: gemeenskaplike verantwoordelikheid vorm karaktermotivering", "Verhaalontleding: mathomong, gare, mafelelong"] },
  "SEPH-2": { summaryEn: "Sepedi drama: structure, dialogue, dramatic conflict and performance traditions.", summaryAf: "Sepedi drama: struktuur, dialoog, dramatiese konflik en opvoeringstradisies.", conceptsEn: ["Dialogue (dipuisano) carries plot and reveals character", "Conflict types: internal struggle vs community/external conflict", "Resolution restores communal harmony (kutano)"], conceptsAf: ["Dialoog (dipuisano) dra intrige en onthul karakter", "Konfliksoorte: innerlike stryd vs gemeenskap/uiterlike konflik", "Oplossing herstel gemeenskaplike harmonie (kutano)"] },
  "SEPH-3": { summaryEn: "Sepedi poetry (diithi): oral traditions, praises (dithaloganyō), rhythm, repetition and figurative language.", summaryAf: "Sepedi poësie (diithi): mondelinge tradisies, lofprysinge (dithaloganyō), ritme, herhaling en figuurlike taal.", conceptsEn: ["Praise poetry (dithoko) honours chiefs, ancestors and community values", "Rhythm through repetition and parallel structure", "Proverbs (diane) embedded in verse to teach values"], conceptsAf: ["Lofsange (dithoko) vereer hoofde, voorouers en gemeenskapswaardes", "Ritme deur herhaling en parallelle struktuur", "Spreekwoorde (diane) in verse ingebed om waardes te leer"] },
  "SEPH-4": { summaryEn: "Sepedi short stories (dikgang tše dinnye): compression, proverbs, oral tradition and single effect.", summaryAf: "Sepedi kortverhale (dikgang tše dinnye): bondigheid, spreekwoorde, mondelinge tradisie en enkele effek.", conceptsEn: ["Proverbs (diane) provide moral framework", "Stories often teach values: respect (hlompho), hard work, community", "Single conflict resolved, often with a lesson"], conceptsAf: ["Spreekwoorde (diane) bied morele raamwerk", "Stories leer dikwels waardes: respek (hlompho), harde werk, gemeenskap", "Enkele konflik opgelos, dikwels met 'n les"] },
  "SEPH-5": { summaryEn: "Sepedi language structures: noun classes, tense system, concordial agreement and register.", summaryAf: "Sepedi taalstrukture: naamwoordklasse, tydselsel, konkordiële ooreenkoms en register.", conceptsEn: ["Bantu noun class system: prefixes control verb agreement", "Three main tense markers: present (bjale), past (phakeng ya go feta), future (ka moso)", "Formal register avoids slang; uses complete verb forms"], conceptsAf: ["Bantoetaal naamwoordklasstelsel: voorvoegsels beheer werkwoordooreenkoms", "Drie hooftydmerkers: teenwoordig, verlede, toekomend", "Formele register vermy sleng; gebruik volledige werkwoordvorms"] },
  "SEPH-6": { summaryEn: "Comprehension and summary in Sepedi: identifying main ideas, inferring meaning and summarising in own words.", summaryAf: "Begrip en opsomming in Sepedi: hoofidees identifiseer, betekenis aflei en in eie woorde opsom.", conceptsEn: ["Skim for gist; scan for specific information", "Distinguish explicit (go bolelwa) from implicit (go laetšwa) meaning", "Write summary in 60–80 words using own words"], conceptsAf: ["Skim vir algemene idee; skandeer vir spesifieke inligting", "Onderskei eksplisiete (go bolelwa) van implisiete (go laetšwa) betekenis", "Skryf opsomming in 60–80 woorde in eie woorde"] },
  "SEPH-7": { summaryEn: "Essay writing in Sepedi: argumentative, descriptive, narrative and reflective writing (400–450 words).", summaryAf: "Opstelskryf in Sepedi: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Plan before writing: brainstorm, outline, draft", "Introduction: set context and state main argument", "Conclusion: summarise and leave reader with a clear final thought"], conceptsAf: ["Beplan voor skryf: dinkstorm, skets, konsep", "Inleiding: stel konteks en verklaar hoofargument", "Slot: vat saam en laat leser met 'n duidelike finale gedagte"] },
  "SEPH-8": { summaryEn: "Transactional writing in Sepedi: formal letters, reports, newspaper articles and other practical text types.", summaryAf: "Transaksionele skryf in Sepedi: formele briewe, verslae, koerantartikels en ander praktiese teks tipes.", conceptsEn: ["Each text type has fixed layout conventions", "Register: formal (go bolelana ka tshwanelo) for official texts", "Word count limits are strictly enforced in exams"], conceptsAf: ["Elke teks tipe het vaste uitlegkonvensies", "Register: formeel (go bolelana ka tshwanelo) vir amptelike tekste", "Woordtellingperke word streng afgedwing in eksamens"] },

  // --------------------- SETSWANA HOME LANGUAGE (Task #534) ---------------------
  "SETH-1": { summaryEn: "Studying the prescribed Setswana novel: plot, characterisation, theme, narrative perspective and cultural context.", summaryAf: "Bestudering van die voorgeskrewe Setswana-roman: intrige, karakterisering, tema, vertellersperspektief en kulturele konteks.", conceptsEn: ["Setswana oral tradition: folk tales (ditshomi) inform written narrative", "Communal values: botho (humanity), kagiso (peace) shape characters", "Plot stages: tshimologo (beginning), gare (middle), bokhutlo (end)"], conceptsAf: ["Setswana mondelinge tradisie: volksverhale (ditshomi) lig geskrewe narratief", "Gemeenskapswaardes: botho (menslikheid), kagiso (vrede) vorm karakters", "Verhaalstadia: tshimologo, gare, bokhutlo"] },
  "SETH-2": { summaryEn: "Setswana drama: dramatic structure, dialogue, conflict and community-centred resolution.", summaryAf: "Setswana drama: dramatiese struktuur, dialoog, konflik en gemeenskapsgerigte oplossing.", conceptsEn: ["Dialogue (puisano) reveals character values and advances plot", "Community elders (bagolo) often facilitate resolution", "Stage directions guide actors and set mood"], conceptsAf: ["Dialoog (puisano) onthul karakterwaardes en bevorder intrige", "Gemeenskapsoues (bagolo) fasiliteer dikwels die oplossing", "Toneelaanwysings lei akteurs en stel stemming"] },
  "SETH-3": { summaryEn: "Setswana poetry (dipina): praise poetry (maboko), rhythm, repetition, proverbs and figurative language.", summaryAf: "Setswana poësie (dipina): lofsange (maboko), ritme, herhaling, spreekwoorde en figuurlike taal.", conceptsEn: ["Maboko (praise poetry) celebrates people, nature and community", "Repetition and parallelism create rhythm", "Proverbs (diane) convey wisdom and cultural values"], conceptsAf: ["Maboko (lofsange) vier mense, natuur en gemeenskap", "Herhaling en parallelisme skep ritme", "Spreekwoorde (diane) dra wysheid en kulturele waardes oor"] },
  "SETH-4": { summaryEn: "Setswana short stories (dikgang tse dinnye): oral tradition influence, proverbs, single conflict and moral lesson.", summaryAf: "Setswana kortverhale (dikgang tse dinnye): mondelinge tradisie-invloed, spreekwoorde, enkele konflik en morele les.", conceptsEn: ["Stories end with a lesson (thuto) that reflects Setswana values", "Proverbs embedded to reinforce meaning", "Limited characters, single setting, short timeframe"], conceptsAf: ["Stories eindig met 'n les (thuto) wat Setswana-waardes weerspieël", "Spreekwoorde ingebed om betekenis te versterk", "Beperkte karakters, enkele omgewing, kort tydsbestek"] },
  "SETH-5": { summaryEn: "Setswana language structures: noun classes, tense, concordial agreement, punctuation and register.", summaryAf: "Setswana taalstrukture: naamwoordklasse, tyd, konkordiële ooreenkoms, leestekens en register.", conceptsEn: ["Noun class prefixes control subject and object concord on verbs", "Tense: present (jaanong), past (mo nakong e e fetileng), future (mo isagweng)", "Formal register in official writing; informal for personal texts"], conceptsAf: ["Naamwoordklasvoorvoegsels beheer onderwerp- en voorwerps-konkord op werkwoorde", "Tyd: teenwoordig (jaanong), verlede, toekomend (mo isagweng)", "Formele register in amptelike skryfwerk; informeel vir persoonlike tekste"] },
  "SETH-6": { summaryEn: "Comprehension and summary in Setswana: main ideas, inference, and concise summary writing.", summaryAf: "Begrip en opsomming in Setswana: hoofidees, afleiding, en bondige opsommingskrywing.", conceptsEn: ["Identify the main idea (kgang e kgolo) of each paragraph", "Infer implied meaning: what is suggested but not stated", "60–80 word summary capturing 7 key points in own words"], conceptsAf: ["Identifiseer die hoofidee (kgang e kgolo) van elke paragraaf", "Afleidende betekenis: wat gesuggereer word maar nie gestel word nie", "60–80 woord opsomming wat 7 sleutelpunte in eie woorde vasvang"] },
  "SETH-7": { summaryEn: "Essay writing in Setswana: argumentative, descriptive, narrative and reflective (400–450 words).", summaryAf: "Opstelskryf in Setswana: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Argumentative: clear position (kgang), evidence, counter-argument", "Descriptive: vivid sensory language painting a picture", "Narrative: chronological with a climax and resolution"], conceptsAf: ["Betogend: duidelike standpunt (kgang), bewyse, teëargument", "Beskrywend: lewendige sensoriese taal wat 'n prentjie skilder", "Narratief: chronologies met 'n klimaks en oplossing"] },
  "SETH-8": { summaryEn: "Transactional writing in Setswana: formal letters, reports, diary entries, newspaper articles and advertisements.", summaryAf: "Transaksionele skryf in Setswana: formele briewe, verslae, dagboekinskrywings, koerantartikels en advertensies.", conceptsEn: ["Each text type: fixed layout, appropriate register, correct format", "Formal letter: full address, date, subject line, signature", "Report: heading, introduction, findings, recommendations"], conceptsAf: ["Elke teks tipe: vaste uitleg, gepaste register, korrekte formaat", "Formele brief: volledige adres, datum, onderwerplyn, handtekening", "Verslag: opskrif, inleiding, bevindinge, aanbevelings"] },

  // --------------------- SESOTHO HOME LANGUAGE (Task #534) ---------------------
  "SESH-1": { summaryEn: "Studying the prescribed Sesotho novel: plot, characterisation, theme, narrative perspective and cultural context.", summaryAf: "Bestudering van die voorgeskrewe Sesotho-roman: intrige, karakterisering, tema, vertellersperspektief en kulturele konteks.", conceptsEn: ["Sesotho oral tradition (litšomo folk tales) shapes narrative conventions", "Communal values: botho (human dignity), sechaba (community) drive plots", "Narrative stages: qalo (beginning), magareng (middle), qetello (end)"], conceptsAf: ["Sesotho mondelinge tradisie (litšomo volksverhale) vorm verhaalkonvensies", "Gemeenskapswaardes: botho (menslike waardigheid), sechaba (gemeenskap) dryf intriges", "Verhaalstadia: qalo, magareng, qetello"] },
  "SESH-2": { summaryEn: "Sesotho drama: dramatic structure, dialogue, conflict types and resolution through community values.", summaryAf: "Sesotho drama: dramatiese struktuur, dialoog, konfliksoorte en oplossing deur gemeenskapswaardes.", conceptsEn: ["Acts (karolo) and scenes (palo) structure the drama", "Conflict often pits individual desire against community expectation", "Elders (baholo) and wisdom (bohlale) often resolve conflict"], conceptsAf: ["Bedrywe (karolo) en tonele (palo) struktureer die drama", "Konflik stel dikwels individuele begeerte teenoor gemeenskapsverwagtinge", "Oues (baholo) en wysheid (bohlale) los dikwels konflik op"] },
  "SESH-3": { summaryEn: "Sesotho poetry (thothokiso): oral praise traditions, rhythm, figurative language and cultural imagery.", summaryAf: "Sesotho poësie (thothokiso): mondelinge lofsangtradisies, ritme, figuurlike taal en kulturele beeldspraak.", conceptsEn: ["Lithoko (praise songs) honour chiefs, cattle and heroic ancestors", "Repetition and refrain create musical quality", "Proverbs (maele) carry wisdom within verse"], conceptsAf: ["Lithoko (lofsange) vereer hoofde, beeste en heldelike voorouers", "Herhaling en refrein skep musikale kwaliteit", "Spreekwoorde (maele) dra wysheid binne vers"] },
  "SESH-4": { summaryEn: "Sesotho short stories (lipale tse khutšoanyane): compression, moral lesson, proverbs and oral storytelling influence.", summaryAf: "Sesotho kortverhale (lipale tse khutšoanyane): bondigheid, morele les, spreekwoorde en mondelinge verhaalinvloed.", conceptsEn: ["Each story ends with a clear moral (molaetsa)", "Proverbs (maele) reinforce the lesson", "Oral storytelling patterns: repetition, direct address to audience"], conceptsAf: ["Elke verhaal eindig met 'n duidelike moraal (molaetsa)", "Spreekwoorde (maele) versterk die les", "Mondelinge vertelpatrone: herhaling, direkte aanspreking van gehoor"] },
  "SESH-5": { summaryEn: "Sesotho language structures: noun classes, tenses, concordial agreement, punctuation and register.", summaryAf: "Sesotho taalstrukture: naamwoordklasse, tye, konkordiële ooreenkoms, leestekens en register.", conceptsEn: ["Noun class system (boholo ba lentswe) controls verb agreement (tumellano)", "Tenses: present (joale), past (nakong e fetileng), future (nakong e tlang)", "Register shifts: formal writing uses full verb forms and no contractions"], conceptsAf: ["Naamwoordklasstelsel (boholo ba lentswe) beheer werkwoordooreenkoms (tumellano)", "Tye: teenwoordig (joale), verlede (nakong e fetileng), toekomend (nakong e tlang)", "Registerwisseling: formele skryfwerk gebruik volledige werkwoordvorms sonder inkorting"] },
  "SESH-6": { summaryEn: "Comprehension and summary in Sesotho: identifying main ideas, inferring meaning and writing a concise summary.", summaryAf: "Begrip en opsomming in Sesotho: hoofidees identifiseer, betekenis aflei en 'n bondige opsomming skryf.", conceptsEn: ["Read the passage twice: first for gist, second for detail", "Main idea (molaetsa o moholo) stated in topic sentence", "Summary: 7 key points in own words, 60–80 words"], conceptsAf: ["Lees die gedeelte twee keer: eerste vir algemene idee, tweede vir detail", "Hoofidee (molaetsa o moholo) in onderwerps­sin gestel", "Opsomming: 7 sleutelpunte in eie woorde, 60–80 woorde"] },
  "SESH-7": { summaryEn: "Essay writing in Sesotho: argumentative, descriptive, narrative and reflective essays (400–450 words).", summaryAf: "Opstelskryf in Sesotho: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Selelekela (introduction): engage reader, state thesis", "Body: 3 developed paragraphs, one idea each", "Qetello (conclusion): restate thesis, final thought"], conceptsAf: ["Selelekela (inleiding): boei leser, stel tesisstelling", "Liggaam: 3 ontwikkelde paragrawe, een idee elk", "Qetello (slot): herhaal tesisstelling, finale gedagte"] },
  "SESH-8": { summaryEn: "Transactional writing in Sesotho: formal letters, reports, newspaper articles and other practical texts.", summaryAf: "Transaksionele skryf in Sesotho: formele briewe, verslae, koerantartikels en ander praktiese tekste.", conceptsEn: ["Formal letter layout: address block, date, salutation, body, closing", "Report structure: heading, objective, findings, conclusion", "Register must match the purpose and intended audience"], conceptsAf: ["Formele brief uitleg: adresblok, datum, aanhef, liggaam, afsluiting", "Verslagstruktuur: opskrif, doelwit, bevindinge, gevolgtrekking", "Register moet doel en beoogde gehoor pas"] },

  // --------------------- TSHIVENDA HOME LANGUAGE (Task #534) ---------------------
  "TSHH-1": { summaryEn: "Studying the prescribed Tshivenda novel: plot, characterisation, theme, narrative perspective and cultural context.", summaryAf: "Bestudering van die voorgeskrewe Tshivenda-roman: intrige, karakterisering, tema, vertellersperspektief en kulturele konteks.", conceptsEn: ["Tshivenda oral tradition: tshifhinga (historical narratives) and ngano (folk tales)", "Values of vhuthu (dignity) and pfanelo (responsibility) embedded in plots", "Plot structure: tshivhidzo (beginning), vhukati (middle), tshifhelo (end)"], conceptsAf: ["Tshivenda mondelinge tradisie: tshifhinga (historiese narratiewe) en ngano (volksverhale)", "Waardes van vhuthu (waardigheid) en pfanelo (verantwoordelikheid) in intriges ingebed", "Verhaalstruktuur: tshivhidzo, vhukati, tshifhelo"] },
  "TSHH-2": { summaryEn: "Tshivenda drama: structure, dialogue, conflict and culturally rooted resolution.", summaryAf: "Tshivenda drama: struktuur, dialoog, konflik en kultuurgewortel oplossing.", conceptsEn: ["Dialogue (vhulayoni) moves the plot forward and reveals character", "Conflict between tradition and modernity is a common theme", "Resolution through community elders (vhamusanda) and dialogue"], conceptsAf: ["Dialoog (vhulayoni) beweeg die intrige vorentoe en onthul karakter", "Konflik tussen tradisie en moderniteit is 'n algemene tema", "Oplossing deur gemeenskapsoues (vhamusanda) en dialoog"] },
  "TSHH-3": { summaryEn: "Tshivenda poetry (nyimbo na thogomelo): praise poetry, rhythm, repetition and figurative language.", summaryAf: "Tshivenda poësie (nyimbo na thogomelo): lofsange, ritme, herhaling en figuurlike taal.", conceptsEn: ["Praise poetry (thogomelo) honours ancestors, chiefs and community", "Repetition creates rhythm and emotional intensity", "Nature imagery: Limpopo landscape, wildlife, rain and harvest"], conceptsAf: ["Lofsange (thogomelo) vereer voorouers, hoofde en gemeenskap", "Herhaling skep ritme en emosionele intensiteit", "Natuurbeeldspraak: Limpopo-landskap, wildlewe, reën en oes"] },
  "TSHH-4": { summaryEn: "Tshivenda short stories (ngano dziswa): compression, moral lesson, proverbs and oral tradition influence.", summaryAf: "Tshivenda kortverhale (ngano dziswa): bondigheid, morele les, spreekwoorde en mondelinge tradisie-invloed.", conceptsEn: ["Ngano (folk stories) teach values through animal characters or community scenarios", "Proverbs (maipfi a vhadzulapo) reinforce moral lessons", "Single central conflict; resolution teaches a clear lesson"], conceptsAf: ["Ngano (volksverhale) leer waardes deur diere-karakters of gemeenskapscenario's", "Spreekwoorde (maipfi a vhadzulapo) versterk morele lesse", "Enkele sentrale konflik; oplossing leer 'n duidelike les"] },
  "TSHH-5": { summaryEn: "Tshivenda language structures: noun classes, tense, concordial agreement and register.", summaryAf: "Tshivenda taalstrukture: naamwoordklasse, tyd, konkordiële ooreenkoms en register.", conceptsEn: ["Tshivenda noun classes use mu-/mi-, lu-/n-, etc. prefixes", "Verb agreement (u­konkoro) changes with subject noun class", "Tenses marked by tone and prefix change, not always separate words"], conceptsAf: ["Tshivenda naamwoordklasse gebruik mu-/mi-, lu-/n-, ens. voorvoegsels", "Werkwoordooreenkoms (ukoncoro) verander met onderwerpsnaamwoordklas", "Tye gemerk deur toon en voorvoegselverandering, nie altyd afsonderlike woorde nie"] },
  "TSHH-6": { summaryEn: "Comprehension and summary in Tshivenda: reading for meaning, inferring and summarising in own words.", summaryAf: "Begrip en opsomming in Tshivenda: lees vir betekenis, aflei en in eie woorde opsom.", conceptsEn: ["Global reading: identify main topic before details", "Infer: use context clues to determine unstated meaning", "Summary: 7 main points in own words, 60–80 words"], conceptsAf: ["Globale lees: identifiseer hoofdonderwerp voor besonderhede", "Aflei: gebruik kontekssleutels om ongesta­lde betekenis te bepaal", "Opsomming: 7 hoofpunte in eie woorde, 60–80 woorde"] },
  "TSHH-7": { summaryEn: "Essay writing in Tshivenda: argumentative, descriptive, narrative and reflective (400–450 words).", summaryAf: "Opstelskryf in Tshivenda: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Introduction: capture reader's attention, present central argument", "Three body paragraphs, each with one main idea and support", "Conclusion: restate argument in new words, leave strong final impression"], conceptsAf: ["Inleiding: vang leser se aandag, bied sentrale argument voor", "Drie liggaamsparagrawe, elk met een hoofidee en ondersteuning", "Slot: herformuleer argument in nuwe woorde, laat sterk finale indruk"] },
  "TSHH-8": { summaryEn: "Transactional writing in Tshivenda: formal letters, reports, newspaper articles and functional texts.", summaryAf: "Transaksionele skryf in Tshivenda: formele briewe, verslae, koerantartikels en funksionele tekste.", conceptsEn: ["Text type recognition: know the conventions for each text type", "Formal register: use polite address forms, full sentences, no slang", "Newspaper article: headline grabs attention; lead paragraph answers Who/What/When/Where"], conceptsAf: ["Teks tipe herkenning: ken die konvensies vir elke teks tipe", "Formele register: gebruik beleefde aanspreking, volledige sinne, geen sleng", "Koerantartikel: opskrif trek aandag; loodsparagraaf beantwoord Wie/Wat/Wanneer/Waar"] },

  // --------------------- XITSONGA HOME LANGUAGE (Task #534) ---------------------
  "XITH-1": { summaryEn: "Studying the prescribed Xitsonga novel: plot, characterisation, theme, narrative perspective and cultural context.", summaryAf: "Bestudering van die voorgeskrewe Xitsonga-roman: intrige, karakterisering, tema, vertellersperspektief en kulturele konteks.", conceptsEn: ["Xitsonga oral tradition: swichudeni (riddles) and ndhawu (folk tales) influence written narrative", "Values of ndzi na wena (I am because of you — ubuntu) shape character relationships", "Plot stages: swintiho (beginning), xikarhi (middle), ndzhawulo (end)"], conceptsAf: ["Xitsonga mondelinge tradisie: swichudeni (raaisels) en ndhawu (volksverhale) beïnvloed geskrewe narratief", "Waardes van ndzi na wena (ek is omdat ek met jou is) vorm karakterverhoudings", "Verhaalstadia: swintiho, xikarhi, ndzhawulo"] },
  "XITH-2": { summaryEn: "Xitsonga drama: dramatic structure, dialogue, conflict and community-grounded resolution.", summaryAf: "Xitsonga drama: dramatiese struktuur, dialoog, konflik en gemeenskapsgegronde oplossing.", conceptsEn: ["Acts (tinkarhi) and scenes (timfuwo) structure Xitsonga drama", "Dialogue (vurimi) advances plot and reveals character values", "Community leaders (vakhegula) facilitate resolution of conflict"], conceptsAf: ["Bedrywe (tinkarhi) en tonele (timfuwo) struktureer Xitsonga-drama", "Dialoog (vurimi) bevorder intrige en onthul karakterwaardes", "Gemeenskapsleiers (vakhegula) fasiliteer konflikoplossing"] },
  "XITH-3": { summaryEn: "Xitsonga poetry (timbhilu): oral praise tradition, rhythm, repetition and figurative language.", summaryAf: "Xitsonga poësie (timbhilu): mondelinge lofsangtradisie, ritme, herhaling en figuurlike taal.", conceptsEn: ["Praise songs (milawu) honour chiefs, ancestors and land", "Repetition (ku phinda-phinda) builds rhythm and emphasis", "Imagery: rivers, cattle and Limpopo landscape"], conceptsAf: ["Lofsange (milawu) vereer hoofde, voorouers en die land", "Herhaling (ku phinda-phinda) bou ritme en klem", "Beeldspraak: riviere, beeste en Limpopo-landskap"] },
  "XITH-4": { summaryEn: "Xitsonga short stories (switori): oral tradition, proverbs, single conflict and moral lesson.", summaryAf: "Xitsonga kortverhale (switori): mondelinge tradisie, spreekwoorde, enkele konflik en morele les.", conceptsEn: ["Switori rooted in oral storytelling: repetition, direct address", "Proverbs (swivulavula) reinforce the moral lesson", "Simple plot: one conflict, limited characters, clear resolution"], conceptsAf: ["Switori gewortel in mondelinge verhaalvertel: herhaling, direkte aanspreking", "Spreekwoorde (swivulavula) versterk die morele les", "Eenvoudige intrige: een konflik, beperkte karakters, duidelike oplossing"] },
  "XITH-5": { summaryEn: "Xitsonga language structures: noun classes, tenses, concordial agreement and register.", summaryAf: "Xitsonga taalstrukture: naamwoordklasse, tye, konkordiële ooreenkoms en register.", conceptsEn: ["Noun classes use prefixes (va-, ma-, xi-, ti-, etc.) controlling verb agreement", "Verb tenses: present (sweswi), past (a nga a), future (ta)", "Register: ceremonial language differs significantly from everyday speech"], conceptsAf: ["Naamwoordklasse gebruik voorvoegsels (va-, ma-, xi-, ti-, ens.) wat werkwoordooreenkoms beheer", "Werkwoordtye: teenwoordig (sweswi), verlede (a nga a), toekomend (ta)", "Register: seremoniële taal verskil beduidend van alledaagse spraak"] },
  "XITH-6": { summaryEn: "Comprehension and summary in Xitsonga: reading for meaning, inferring implied ideas and summarising.", summaryAf: "Begrip en opsomming in Xitsonga: lees vir betekenis, implisiete idees aflei en opsom.", conceptsEn: ["First reading: global comprehension; second reading: specific details", "Inference: what does the text suggest beyond what is stated?", "Summary: 7 main points, 60–80 words, own words, no copying"], conceptsAf: ["Eerste lees: globale begrip; tweede lees: spesifieke besonderhede", "Afleiding: wat suggereer die teks bo en behalwe wat gestel word?", "Opsomming: 7 hoofpunte, 60–80 woorde, eie woorde, geen kopiëring"] },
  "XITH-7": { summaryEn: "Essay writing in Xitsonga: argumentative, descriptive, narrative and reflective essays (400–450 words).", summaryAf: "Opstelskryf in Xitsonga: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Strong opening line to engage reader immediately", "Body: 3 paragraphs, each with a clear point and supporting detail", "Conclusion: wrap up, restate key idea, memorable last sentence"], conceptsAf: ["Sterk openingsreël om leser onmiddellik te boei", "Liggaam: 3 paragrawe, elk met 'n duidelike punt en ondersteunende detail", "Slot: sluit af, herhaal sleutelidee, gedenkwaardige laaste sin"] },
  "XITH-8": { summaryEn: "Transactional writing in Xitsonga: formal letters, reports, diary entries, newspaper articles and functional texts.", summaryAf: "Transaksionele skryf in Xitsonga: formele briewe, verslae, dagboekinskrywings, koerantartikels en funksionele tekste.", conceptsEn: ["Know each text type's fixed format and layout requirements", "Formal letter: address, date, salutation, signed off correctly", "Diary entry: date heading, first-person voice, personal tone"], conceptsAf: ["Ken elke teks tipe se vaste formaat en uitlegvereistes", "Formele brief: adres, datum, aanhef, korrek afgeteken", "Dagboekinskrywing: datum-opskrif, eerstepersoons stem, persoonlike toon"] },

  // --------------------- ISINDEBELE HOME LANGUAGE (Task #534) ---------------------
  "NDH-1": { summaryEn: "Studying the prescribed isiNdebele novel: plot, characterisation, theme, narrative perspective and cultural context.", summaryAf: "Bestudering van die voorgeskrewe isiNdebele-roman: intrige, karakterisering, tema, vertellersperspektief en kulturele konteks.", conceptsEn: ["isiNdebele oral tradition: izinganekwane (folk tales) and izibongo (praises) shape written fiction", "Community values: ubuntu and respect for elders (abadala) drive character choices", "Plot stages: ukuqala, isiqalo, isiphetho"], conceptsAf: ["isiNdebele mondelinge tradisie: izinganekwane (volksverhale) en izibongo (lofsange) vorm geskrewe fiksie", "Gemeenskapswaardes: ubuntu en respek vir oues (abadala) dryf karakterkeuses", "Verhaalstadia: ukuqala, isiqalo, isiphetho"] },
  "NDH-2": { summaryEn: "isiNdebele drama: structure, dialogue, conflict and resolution rooted in community and tradition.", summaryAf: "isiNdebele drama: struktuur, dialoog, konflik en oplossing gewortel in gemeenskap en tradisie.", conceptsEn: ["Acts (izigaba) and scenes structure isiNdebele drama", "Dialogue advances plot and reveals cultural values", "Conflict between tradition and new influences is a common theme"], conceptsAf: ["Bedrywe (izigaba) en tonele struktureer isiNdebele-drama", "Dialoog bevorder intrige en onthul kulturele waardes", "Konflik tussen tradisie en nuwe invloede is 'n algemene tema"] },
  "NDH-3": { summaryEn: "isiNdebele poetry (izinkondlo/izibongo): praise traditions, rhythm, repetition and figurative language.", summaryAf: "isiNdebele poësie (izinkondlo/izibongo): lofsangtradisies, ritme, herhaling en figuurlike taal.", conceptsEn: ["Izibongo (praise poetry) celebrates lineage, bravery and community values", "Sound devices: alliteration, assonance, onomatopoeia", "Imagery from isiNdebele cultural life: cattle, harvests, ceremonial dress"], conceptsAf: ["Izibongo (lofsange) vier afkoms, dapperheid en gemeenskapswaardes", "Klanktoestelle: alliterasie, assonansie, onomatopee", "Beeldspraak uit isiNdebele kulturele lewe: beeste, oeste, seremoniële drag"] },
  "NDH-4": { summaryEn: "isiNdebele short stories (izindaba ezimfishane): compression, proverbs, oral tradition and moral lesson.", summaryAf: "isiNdebele kortverhale (izindaba ezimfishane): bondigheid, spreekwoorde, mondelinge tradisie en morele les.", conceptsEn: ["Stories drawn from izinganekwane oral tradition", "Proverbs (izaga) reinforce moral messages", "Short timeframe, single setting, clear lesson at conclusion"], conceptsAf: ["Stories ontleen aan izinganekwane mondelinge tradisie", "Spreekwoorde (izaga) versterk morele boodskappe", "Kort tydsbestek, enkele omgewing, duidelike les by afsluiting"] },
  "NDH-5": { summaryEn: "isiNdebele language structures: noun classes, concordial agreement, tense and register.", summaryAf: "isiNdebele taalstrukture: naamwoordklasse, konkordiële ooreenkoms, tyd en register.", conceptsEn: ["Noun classes use prefixes controlling all agreement in the sentence", "Tenses: present, past (simple and remote), future", "Tone is phonemic in isiNdebele — same syllables, different tones = different meanings"], conceptsAf: ["Naamwoordklasse gebruik voorvoegsels wat alle ooreenkoms in die sin beheer", "Tye: teenwoordig, verlede (eenvoudig en ver), toekomend", "Toon is foneemies in isiNdebele — selfde lettergrepe, verskillende tone = verskillende betekenisse"] },
  "NDH-6": { summaryEn: "Comprehension and summary in isiNdebele: reading for meaning, inferring and summarising in own words.", summaryAf: "Begrip en opsomming in isiNdebele: lees vir betekenis, aflei en in eie woorde opsom.", conceptsEn: ["Skim for general idea; scan for specific answers", "Distinguish literal from inferred meaning", "Summary: 7 points in own words, 60–80 words"], conceptsAf: ["Skim vir algemene idee; skandeer vir spesifieke antwoorde", "Onderskei letterlike van afleiding­betekenis", "Opsomming: 7 punte in eie woorde, 60–80 woorde"] },
  "NDH-7": { summaryEn: "Essay writing in isiNdebele: argumentative, descriptive, narrative and reflective (400–450 words).", summaryAf: "Opstelskryf in isiNdebele: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Isethulo (introduction): engage reader and state position", "Body paragraphs: PEEL structure (Point, Evidence, Explain, Link)", "Isiphetho (conclusion): restate thesis, final thought"], conceptsAf: ["Isethulo (inleiding): boei leser en stel standpunt", "Lyftekste: PEEL-struktuur (Punt, Bewyse, Verduidelik, Koppel)", "Isiphetho (slot): herhaal tesisstelling, finale gedagte"] },
  "NDH-8": { summaryEn: "Transactional writing in isiNdebele: formal letters, reports, newspaper articles and functional texts.", summaryAf: "Transaksionele skryf in isiNdebele: formele briewe, verslae, koerantartikels en funksionele tekste.", conceptsEn: ["Follow layout conventions precisely for each text type", "Formal letter: address block, date, subject, body, closing", "Newspaper report: headline, byline, inverted pyramid structure"], conceptsAf: ["Volg uitlegkonvensies noukeurig vir elke teks tipe", "Formele brief: adresblok, datum, onderwerp, liggaam, afsluiting", "Koerantberig: opskrif, bylyn, omgekeerde piramied-struktuur"] },

  // --------------------- SISWATI HOME LANGUAGE (Task #534) ---------------------
  "SWAH-1": { summaryEn: "Studying the prescribed siSwati novel: plot, characterisation, theme, narrative perspective and cultural context.", summaryAf: "Bestudering van die voorgeskrewe siSwati-roman: intrige, karakterisering, tema, vertellersperspektief en kulturele konteks.", conceptsEn: ["siSwati oral tradition: tinganekwane (folk tales) and emadvutjwa (riddles) shape narrative", "Values of kubusa kahle (good governance) and umuntu ngumuntu (ubuntu) drive plots", "Plot stages: ekuqaleni (beginning), emkhatsini (middle), ekupheleni (end)"], conceptsAf: ["siSwati mondelinge tradisie: tinganekwane (volksverhale) en emadvutjwa (raaisels) vorm narratief", "Waardes van kubusa kahle (goeie bestuur) en umuntu ngumuntu (ubuntu) dryf intriges", "Verhaalstadia: ekuqaleni, emkhatsini, ekupheleni"] },
  "SWAH-2": { summaryEn: "siSwati drama: structure, dialogue, conflict and resolution grounded in Swati cultural values.", summaryAf: "siSwati drama: struktuur, dialoog, konflik en oplossing gegrond in Swati kulturele waardes.", conceptsEn: ["Acts (tikarolo) and scenes (tindzawo) structure siSwati drama", "Dialogue (kukhuluma) reveals character and cultural values", "Conflict often arises from tension between tradition and modernity"], conceptsAf: ["Bedrywe (tikarolo) en tonele (tindzawo) struktureer siSwati-drama", "Dialoog (kukhuluma) onthul karakter en kulturele waardes", "Konflik spruit dikwels voort uit spanning tussen tradisie en moderniteit"] },
  "SWAH-3": { summaryEn: "siSwati poetry (tinkondlo/tibudzeli): praise poetry (emaguqu), rhythm, repetition and figurative language.", summaryAf: "siSwati poësie (tinkondlo/tibudzeli): lofsange (emaguqu), ritme, herhaling en figuurlike taal.", conceptsEn: ["Emaguqu (praise poetry): celebrates royalty, ancestors and community heroes", "Repetition and parallelism for rhythm and emphasis", "Imagery from Swati culture: royal cattle (emahhashi), harvest, ceremonies"], conceptsAf: ["Emaguqu (lofsange): vier koningshuis, voorouers en gemeenskapsHelde", "Herhaling en parallelisme vir ritme en klem", "Beeldspraak uit Swati-kultuur: koninklike beeste (emahhashi), oes, seremonies"] },
  "SWAH-4": { summaryEn: "siSwati short stories (tinganekwane/tibancane): oral tradition, proverbs, single conflict and moral lesson.", summaryAf: "siSwati kortverhale (tinganekwane/tibancane): mondelinge tradisie, spreekwoorde, enkele konflik en morele les.", conceptsEn: ["Stories drawn from oral tinganekwane tradition", "Proverbs (ticumo) reinforce moral lessons", "Simple structure: one conflict, few characters, clear lesson at end"], conceptsAf: ["Stories ontleen aan mondelinge tinganekwane-tradisie", "Spreekwoorde (ticumo) versterk morele lesse", "Eenvoudige struktuur: een konflik, min karakters, duidelike les aan die einde"] },
  "SWAH-5": { summaryEn: "siSwati language structures: noun classes, tenses, concordial agreement and register.", summaryAf: "siSwati taalstrukture: naamwoordklasse, tye, konkordiële ooreenkoms en register.", conceptsEn: ["Noun classes (emakilasi) use prefixes that control verb and adjective agreement", "Tenses: present (manje), past (kudvulate), future (kutawuza)", "Formal register used for official and respectful communication; informal for everyday"], conceptsAf: ["Naamwoordklasse (emakilasi) gebruik voorvoegsels wat werkwoord- en byvoeglike naamwoord-ooreenkoms beheer", "Tye: teenwoordig (manje), verlede (kudvulate), toekomend (kutawuza)", "Formele register gebruik vir amptelike en respekvolle kommunikasie; informeel vir alledaagse"] },
  "SWAH-6": { summaryEn: "Comprehension and summary in siSwati: reading for meaning, inferring and summarising in own words.", summaryAf: "Begrip en opsomming in siSwati: lees vir betekenis, aflei en in eie woorde opsom.", conceptsEn: ["Read for gist first, then re-read for detail", "Infer meaning: use context to understand what is implied", "Summary: 7 key points in own words, 60–80 words"], conceptsAf: ["Lees eers vir algemene idee, dan herlees vir detail", "Aflei: gebruik konteks om te verstaan wat geïmpliseer word", "Opsomming: 7 sleutelpunte in eie woorde, 60–80 woorde"] },
  "SWAH-7": { summaryEn: "Essay writing in siSwati: argumentative, descriptive, narrative and reflective (400–450 words).", summaryAf: "Opstelskryf in siSwati: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Introduction: hook + clear thesis statement", "Three body paragraphs: point, evidence, explanation, link", "Conclusion: restate thesis, summarise, strong closing thought"], conceptsAf: ["Inleiding: haak + duidelike tesisstelling", "Drie liggaamsparagrawe: punt, bewyse, verduideliking, koppeling", "Slot: herhaal tesisstelling, vat saam, sterk afsluitende gedagte"] },
  "SWAH-8": { summaryEn: "Transactional writing in siSwati: formal letters, reports, newspaper articles and functional text types.", summaryAf: "Transaksionele skryf in siSwati: formele briewe, verslae, koerantartikels en funksionele teks tipes.", conceptsEn: ["Each text type has specific layout conventions — learn them by heart", "Formal letter: address, date, salutation, body paragraphs, signature", "Newspaper article: headline, lead paragraph (5 Ws), supporting details"], conceptsAf: ["Elke teks tipe het spesifieke uitlegkonvensies — leer hulle uit die hoof", "Formele brief: adres, datum, aanhef, liggaamsparagrawe, handtekening", "Koerantartikel: opskrif, loodsparagraaf (5 Ws), ondersteunende besonderhede"] },

  // --------------------- AFRICAN LANGUAGES FAL (Task #534) — share same 8-topic structure -----
  "ZULF-1": { summaryEn: "isiZulu FAL: Studying a prescribed novel — plot, character, theme and cultural context at First Additional Language level.", summaryAf: "isiZulu EAT: Bestudering van 'n voorgeskrewe roman — intrige, karakter, tema en kulturele konteks op Eerste Addisionele Taalvlak.", conceptsEn: ["FAL readers approach the novel as language learners: focus on accessible vocabulary and plot", "Key themes still grounded in ubuntu and community", "Character motivation examined through simplified language structures"], conceptsAf: ["EAT-lesers benader die roman as taalleerders: fokus op toeganklike woordeskat en intrige", "Sleuteltemas steeds gewortel in ubuntu en gemeenskap", "Karaktermotivering ondersoek deur vereenvoudigde taalstrukture"] },
  "ZULF-2": { summaryEn: "isiZulu FAL drama: understanding dramatic structure, dialogue and conflict at FAL level.", summaryAf: "isiZulu EAT drama: begrip van dramatiese struktuur, dialoog en konflik op EAT-vlak.", conceptsEn: ["Focus on following plot through dialogue", "Identify conflict type and how it is resolved", "Stage directions help comprehension: use them as reading aids"], conceptsAf: ["Fokus op die volg van intrige deur dialoog", "Identifiseer konfliksoorte en hoe dit opgelos word", "Toneelaanwysings help begrip: gebruik hulle as leesbylae"] },
  "ZULF-3": { summaryEn: "isiZulu FAL poetry: reading and appreciating izinkondlo with focus on meaning, imagery and tone.", summaryAf: "isiZulu EAT poësie: lees en waardeer izinkondlo met fokus op betekenis, beeldspraak en toon.", conceptsEn: ["Read the poem multiple times before analysing", "Identify one central feeling or message (isigqi)", "Figurative language: notice metaphors, similes and personification"], conceptsAf: ["Lees die gedig verskeie kere voor jy ontleed", "Identifiseer een sentrale gevoel of boodskap (isigqi)", "Figuurlike taal: let op metafore, vergelykings en personifikasie"] },
  "ZULF-4": { summaryEn: "isiZulu FAL short stories: reading for comprehension, character, plot and cultural context.", summaryAf: "isiZulu EAT kortverhale: lees vir begrip, karakter, intrige en kulturele konteks.", conceptsEn: ["Short story at FAL level: accessible language, clear plot", "Identify protagonist, antagonist and the central problem", "Cultural references explained through context clues"], conceptsAf: ["Kortverhaal op EAT-vlak: toeganklike taal, duidelike intrige", "Identifiseer hoofkarakter, antagonis en die sentrale probleem", "Kulturele verwysings verduidelik deur kontekssleutels"] },
  "ZULF-5": { summaryEn: "isiZulu FAL language structures: key grammar, noun classes, basic tense use and sentence construction.", summaryAf: "isiZulu EAT taalstrukture: sleutelgrammatika, naamwoordklasse, basiese tydgebruik en sinsbou.", conceptsEn: ["FAL focus: high-frequency grammar patterns for reading and writing", "Subject-verb agreement using noun class concord", "Avoid mother-tongue interference: isiZulu word order differs from English"], conceptsAf: ["EAT-fokus: hoogfrekwensie grammatikapatrone vir lees en skryf", "Onderwerp-werkwoordooreenkoms gebruik naamwoordklas-konkord", "Vermy moedertaalinterferensie: isiZulu woordvolgorde verskil van Engels"] },
  "ZULF-6": { summaryEn: "isiZulu FAL comprehension and summary: reading for meaning, answering questions and summarising.", summaryAf: "isiZulu EAT begrip en opsomming: lees vir betekenis, vrae beantwoord en opsom.", conceptsEn: ["Use context to guess unknown words before using a dictionary", "Comprehension questions: answer in full sentences using text evidence", "Summary: identify 7 main points; write in own words (60–80 words)"], conceptsAf: ["Gebruik konteks om onbekende woorde te raai voor 'n woordeboek", "Begripsrae: beantwoord in volledige sinne met tekstuele bewyse", "Opsomming: identifiseer 7 hoofpunte; skryf in eie woorde (60–80 woorde)"] },
  "ZULF-7": { summaryEn: "isiZulu FAL essay writing: argumentative, descriptive, narrative and reflective (400–450 words).", summaryAf: "isiZulu EAT opstelskryf: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Plan your essay before writing: mind-map or outline", "Introduction: clear thesis; body: 3 paragraphs; conclusion: summary", "Use connecting words: ngoba (because), kodwa (but), ngakho (therefore)"], conceptsAf: ["Beplan jou opstel voor skryf: gedankekaart of skets", "Inleiding: duidelike tesis; liggaam: 3 paragrawe; slot: opsomming", "Gebruik verbindingswoorde: ngoba (want), kodwa (maar), ngakho (daarom)"] },
  "ZULF-8": { summaryEn: "isiZulu FAL transactional writing: formal letters, diary entries, reports and other text types.", summaryAf: "isiZulu EAT transaksionele skryf: formele briewe, dagboekinskrywings, verslae en ander teks tipes.", conceptsEn: ["Know the layout for each text type", "Formal letter at FAL level: simple formal register, correct address block", "Diary entry: personal, first-person, date heading"], conceptsAf: ["Ken die uitleg vir elke teks tipe", "Formele brief op EAT-vlak: eenvoudige formele register, korrekte adresblok", "Dagboekinskrywing: persoonlik, eerstepersoons, datum-opskrif"] },

  "XHOF-1": { summaryEn: "isiXhosa FAL: Studying a prescribed novel at FAL level — plot, character, theme and cultural context.", summaryAf: "isiXhosa EAT: Bestudering van 'n voorgeskrewe roman op EAT-vlak — intrige, karakter, tema en kulturele konteks.", conceptsEn: ["FAL level: focus on comprehension of accessible isiXhosa narrative", "Ubuntu and community values as accessible entry points into theme", "Character analysis: motivation and how characters change"], conceptsAf: ["EAT-vlak: fokus op begrip van toeganklike isiXhosa-narratief", "Ubuntu en gemeenskapswaardes as toeganklike intoetspunte vir tema", "Karakterontleding: motivering en hoe karakters verander"] },
  "XHOF-2": { summaryEn: "isiXhosa FAL drama: following plot through dialogue, identifying conflict and understanding stage directions.", summaryAf: "isiXhosa EAT drama: intrige deur dialoog volg, konflik identifiseer en toneelaanwysings verstaan.", conceptsEn: ["Read stage directions to visualise the scene", "Identify the main conflict and note how it develops", "Characters revealed through what they say (dialogue) and do (action)"], conceptsAf: ["Lees toneelaanwysings om die toneel te visualiseer", "Identifiseer die hoofkonflik en let op hoe dit ontwikkel", "Karakters onthul deur wat hulle sê (dialoog) en doen (aksie)"] },
  "XHOF-3": { summaryEn: "isiXhosa FAL poetry: reading for meaning, identifying tone, imagery and key poetic devices.", summaryAf: "isiXhosa EAT poësie: lees vir betekenis, toon en beeldspraak identifiseer en sleutel poëtiese toestelle.", conceptsEn: ["Tone: the poet's attitude — joyful (vuyo), sad (iintlungu), angry (umsindo)", "Simile: ukutheleka (A is like B); Metaphor: A is B", "Identify one main message the poem communicates"], conceptsAf: ["Toon: die digter se houding — bly (vuyo), hartseer (iintlungu), kwaad (umsindo)", "Vergelyking (A is soos B); Metafoor: A is B", "Identifiseer een hoofboodskap wat die gedig kommunikeer"] },
  "XHOF-4": { summaryEn: "isiXhosa FAL short stories: reading for plot, character, setting and cultural meaning.", summaryAf: "isiXhosa EAT kortverhale: lees vir intrige, karakter, omgewing en kulturele betekenis.", conceptsEn: ["Plot summary: beginning, conflict, resolution in three sentences", "Setting: where and when the story takes place — note its effect on mood", "Cultural references: use context clues and notes to understand"], conceptsAf: ["Intrige-opsomming: begin, konflik, oplossing in drie sinne", "Omgewing: waar en wanneer die verhaal afspeel — let op die effek op stemming", "Kulturele verwysings: gebruik kontekssleutels en notas om te verstaan"] },
  "XHOF-5": { summaryEn: "isiXhosa FAL language structures: key grammar patterns, noun classes and basic writing conventions.", summaryAf: "isiXhosa EAT taalstrukture: sleutelgrammatika­patrone, naamwoordklasse en basiese skrifkonvensies.", conceptsEn: ["Click sounds written as c (dental), q (alveolar), x (lateral) — learn to recognise in writing", "Subject concord must agree with noun class", "Common error: using English sentence structure — isiXhosa has different word order"], conceptsAf: ["Klikklanke geskryf as c (dentaal), q (alveolêr), x (lateraal) — leer om in skryfwerk te herken", "Onderwerp-konkord moet met naamwoordklas ooreenstem", "Algemene fout: gebruik van Engelse sinstruktuur — isiXhosa het verskillende woordvolgorde"] },
  "XHOF-6": { summaryEn: "isiXhosa FAL comprehension and summary: reading for meaning and writing a concise summary.", summaryAf: "isiXhosa EAT begrip en opsomming: lees vir betekenis en 'n bondige opsomming skryf.", conceptsEn: ["Read the whole passage before answering questions", "Answer in full sentences; quote from the text for evidence", "Summary: 7 points, own words, 60–80 words"], conceptsAf: ["Lees die hele gedeelte voor jy vrae beantwoord", "Beantwoord in volledige sinne; aanhaal uit die teks as bewyse", "Opsomming: 7 punte, eie woorde, 60–80 woorde"] },
  "XHOF-7": { summaryEn: "isiXhosa FAL essay writing: argumentative, descriptive, narrative and reflective (400–450 words).", summaryAf: "isiXhosa EAT opstelskryf: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Write a plan before starting the essay", "Introduction, 3 body paragraphs, conclusion", "Use linking words: kuba (because), kodwa (but), ngoko (therefore)"], conceptsAf: ["Skryf 'n plan voor jy met die opstel begin", "Inleiding, 3 liggaamsparagrawe, slot", "Gebruik verbindingswoorde: kuba (want), kodwa (maar), ngoko (daarom)"] },
  "XHOF-8": { summaryEn: "isiXhosa FAL transactional writing: formal letters, reports, diary entries and other functional texts.", summaryAf: "isiXhosa EAT transaksionele skryf: formele briewe, verslae, dagboekinskrywings en ander funksionele tekste.", conceptsEn: ["Learn layout for formal letter, report, diary entry", "Formal register: polite, complete sentences, no slang", "Diary entry: date at top, personal voice, first person"], conceptsAf: ["Leer uitleg vir formele brief, verslag, dagboekinskrywing", "Formele register: beleef, volledige sinne, geen sleng", "Dagboekinskrywing: datum bo, persoonlike stem, eerstepersoons"] },

  "SEPF-1": { summaryEn: "Sepedi FAL: Studying a prescribed novel at FAL level — plot, character, theme and cultural context.", summaryAf: "Sepedi EAT: Bestudering van 'n voorgeskrewe roman op EAT-vlak — intrige, karakter, tema en kulturele konteks.", conceptsEn: ["FAL approach: read for story comprehension before literary analysis", "Ubuntu and community ethics as themes accessible to FAL readers", "Identify protagonist, antagonist and their goals"], conceptsAf: ["EAT benadering: lees vir verhaalsbegrip voor letterkundige analise", "Ubuntu en gemeenskapsetiek as temas toeganklik vir EAT-lesers", "Identifiseer protagonis, antagonis en hulle doelwitte"] },
  "SEPF-2": { summaryEn: "Sepedi FAL drama: understanding structure, dialogue and conflict at FAL level.", summaryAf: "Sepedi EAT drama: struktuur, dialoog en konflik op EAT-vlak verstaan.", conceptsEn: ["Follow the plot through character dialogue", "Identify the central conflict and the turning point", "Stage directions provide context: read them carefully"], conceptsAf: ["Volg die intrige deur karakterdialoog", "Identifiseer die sentrale konflik en die keerpunt", "Toneelaanwysings bied konteks: lees hulle noukeurig"] },
  "SEPF-3": { summaryEn: "Sepedi FAL poetry: reading for meaning, tone, figurative language and main message.", summaryAf: "Sepedi EAT poësie: lees vir betekenis, toon, figuurlike taal en hoofboodskap.", conceptsEn: ["Read the poem twice: first for overall feeling, second for detail", "Identify tone words and imagery", "State the main message in one clear sentence"], conceptsAf: ["Lees die gedig twee keer: eerste vir algemene gevoel, tweede vir detail", "Identifiseer toonwoorde en beeldspraak", "Verklaar die hoofboodskap in een duidelike sin"] },
  "SEPF-4": { summaryEn: "Sepedi FAL short stories: reading for plot, character and cultural context.", summaryAf: "Sepedi EAT kortverhale: lees vir intrige, karakter en kulturele konteks.", conceptsEn: ["Summarise: beginning, middle, end in three sentences", "Identify the lesson (thuto) taught by the story", "Proverbs (diane) in the text carry cultural meaning: look them up"], conceptsAf: ["Vat saam: begin, middel, einde in drie sinne", "Identifiseer die les (thuto) wat die verhaal leer", "Spreekwoorde (diane) in die teks dra kulturele betekenis: soek hulle op"] },
  "SEPF-5": { summaryEn: "Sepedi FAL language structures: key grammar, noun class agreement and sentence construction.", summaryAf: "Sepedi EAT taalstrukture: sleutelgrammatika, naamwoordklasooreenkoms en sinsbou.", conceptsEn: ["Focus on high-frequency patterns: subject concord, basic tenses", "Avoid translating directly from English — Sepedi has its own structure", "Practise with short sentences before writing paragraphs"], conceptsAf: ["Fokus op hoogfrekwensie patrone: onderwerp-konkord, basiese tye", "Vermy direkte vertaling vanuit Engels — Sepedi het sy eie struktuur", "Oefen met kort sinne voor jy paragrawe skryf"] },
  "SEPF-6": { summaryEn: "Sepedi FAL comprehension and summary: reading for meaning and summarising key points.", summaryAf: "Sepedi EAT begrip en opsomming: lees vir betekenis en sleutelpunte opsom.", conceptsEn: ["Read the whole passage first", "Answer comprehension questions using evidence from the text", "Summary: 7 main ideas, own words, 60–80 words"], conceptsAf: ["Lees eers die hele gedeelte", "Beantwoord begripsrae met bewyse uit die teks", "Opsomming: 7 hoofidees, eie woorde, 60–80 woorde"] },
  "SEPF-7": { summaryEn: "Sepedi FAL essay writing: argumentative, descriptive, narrative and reflective (400–450 words).", summaryAf: "Sepedi EAT opstelskryf: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Plan: brainstorm ideas, choose 3 main points", "Write introduction, 3 body paragraphs, conclusion", "Use connectors: ka gobane (because), fela (but), ka gona (therefore)"], conceptsAf: ["Beplan: dinkstorm idees, kies 3 hoofpunte", "Skryf inleiding, 3 liggaamsparagrawe, slot", "Gebruik verbindings: ka gobane (want), fela (maar), ka gona (daarom)"] },
  "SEPF-8": { summaryEn: "Sepedi FAL transactional writing: formal letters, reports, diary entries and other practical texts.", summaryAf: "Sepedi EAT transaksionele skryf: formele briewe, verslae, dagboekinskrywings en ander praktiese tekste.", conceptsEn: ["Formal letter: correct address block, date, subject, signed off", "Diary entry: date heading, personal first-person voice", "Report: heading, purpose, findings, recommendations"], conceptsAf: ["Formele brief: korrekte adresblok, datum, onderwerp, afgeteken", "Dagboekinskrywing: datum-opskrif, persoonlike eerstepersoons stem", "Verslag: opskrif, doel, bevindinge, aanbevelings"] },

  "SETF-1": { summaryEn: "Setswana FAL: Prescribed novel at FAL level — plot, character, theme and cultural context.", summaryAf: "Setswana EAT: Voorgeskrewe roman op EAT-vlak — intrige, karakter, tema en kulturele konteks.", conceptsEn: ["FAL level: accessible Setswana narrative; focus on story comprehension", "Botho (humanity) and community as universal themes", "Character: identify goals, obstacles and how characters change"], conceptsAf: ["EAT-vlak: toeganklike Setswana-narratief; fokus op verhaalsbegrip", "Botho (menslikheid) en gemeenskap as universele temas", "Karakter: identifiseer doelwitte, hindernisse en hoe karakters verander"] },
  "SETF-2": { summaryEn: "Setswana FAL drama: plot through dialogue, conflict identification and stage direction use.", summaryAf: "Setswana EAT drama: intrige deur dialoog, konflikidentifikasie en gebruik van toneelaanwysings.", conceptsEn: ["Dialogue reveals character intention and conflict", "Stage directions set scene and mood — use them to understand context", "Note the turning point where the conflict reaches its peak"], conceptsAf: ["Dialoog onthul karakterintensie en konflik", "Toneelaanwysings stel toneel en stemming — gebruik hulle om konteks te verstaan", "Let op die keerpunt waar die konflik sy hoogtepunt bereik"] },
  "SETF-3": { summaryEn: "Setswana FAL poetry: reading for meaning, tone, imagery and central message.", summaryAf: "Setswana EAT poësie: lees vir betekenis, toon, beeldspraak en sentrale boodskap.", conceptsEn: ["Read poem three times: meaning, technique, evaluation", "Tone: positive (lorato), negative (bohutsana), or mixed", "One-sentence summary of the poem's main idea"], conceptsAf: ["Lees gedig drie keer: betekenis, tegniek, evaluering", "Toon: positief (lorato), negatief (bohutsana), of gemengd", "Een-sin opsomming van die gedig se hoofidee"] },
  "SETF-4": { summaryEn: "Setswana FAL short stories: reading for plot, character and the moral lesson (thuto).", summaryAf: "Setswana EAT kortverhale: lees vir intrige, karakter en die morele les (thuto).", conceptsEn: ["Identify the central problem and how it is resolved", "What lesson does the story teach? State it clearly", "Note how proverbs (diane) support the story's moral"], conceptsAf: ["Identifiseer die sentrale probleem en hoe dit opgelos word", "Watter les leer die verhaal? Stel dit duidelik", "Let op hoe spreekwoorde (diane) die verhaal se moraal ondersteun"] },
  "SETF-5": { summaryEn: "Setswana FAL language structures: key grammar, noun class agreement and sentence construction.", summaryAf: "Setswana EAT taalstrukture: sleutelgrammatika, naamwoordklasooreenkoms en sinsbou.", conceptsEn: ["Subject concord must match noun class", "Common tenses: present (jaanong), past (e fetileng), future (e e tlang)", "Avoid English sentence structure when writing in Setswana"], conceptsAf: ["Onderwerp-konkord moet met naamwoordklas ooreenstem", "Algemene tye: teenwoordig (jaanong), verlede (e fetileng), toekomend (e e tlang)", "Vermy Engelse sinstruktuur wanneer jy in Setswana skryf"] },
  "SETF-6": { summaryEn: "Setswana FAL comprehension and summary: reading for meaning and writing a summary.", summaryAf: "Setswana EAT begrip en opsomming: lees vir betekenis en 'n opsomming skryf.", conceptsEn: ["Skim for gist; re-read for detail and specific answers", "Answer in full sentences using evidence from the passage", "Summary: 7 points, own words, 60–80 words"], conceptsAf: ["Skim vir algemene idee; herlees vir detail en spesifieke antwoorde", "Beantwoord in volledige sinne met bewyse uit die gedeelte", "Opsomming: 7 punte, eie woorde, 60–80 woorde"] },
  "SETF-7": { summaryEn: "Setswana FAL essay writing: argumentative, descriptive, narrative and reflective (400–450 words).", summaryAf: "Setswana EAT opstelskryf: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Plan before writing; structure your essay clearly", "Introduction + 3 body paragraphs + conclusion", "Linking words: ka gonne (because), mme (but), ka ntlha ya moo (therefore)"], conceptsAf: ["Beplan voor skryf; struktureer jou opstel duidelik", "Inleiding + 3 liggaamsparagrawe + slot", "Verbindingswoorde: ka gonne (want), mme (maar), ka ntlha ya moo (daarom)"] },
  "SETF-8": { summaryEn: "Setswana FAL transactional writing: formal letters, reports, diary entries and other text types.", summaryAf: "Setswana EAT transaksionele skryf: formele briewe, verslae, dagboekinskrywings en ander teks tipes.", conceptsEn: ["Formal letter layout: sender address, date, heading, body, closing", "Diary entry: date heading, personal first-person voice", "Register: formal for official texts; informal for personal texts"], conceptsAf: ["Formele brief uitleg: afsendereadres, datum, opskrif, liggaam, afsluiting", "Dagboekinskrywing: datum-opskrif, persoonlike eerstepersoons stem", "Register: formeel vir amptelike tekste; informeel vir persoonlike tekste"] },

  "SESF-1": { summaryEn: "Sesotho FAL: Prescribed novel at FAL level — plot, character, theme and cultural context.", summaryAf: "Sesotho EAT: Voorgeskrewe roman op EAT-vlak — intrige, karakter, tema en kulturele konteks.", conceptsEn: ["FAL approach: prioritise story comprehension over literary analysis", "Botho (dignity) and sechaba (community) as accessible themes", "Plot analysis: beginning (qalo), middle (magareng), end (qetello)"], conceptsAf: ["EAT benadering: prioritiseer verhaalsbegrip bo letterkundige analise", "Botho (waardigheid) en sechaba (gemeenskap) as toeganklike temas", "Verhaalontleding: begin (qalo), middel (magareng), einde (qetello)"] },
  "SESF-2": { summaryEn: "Sesotho FAL drama: following plot, identifying conflict and using stage directions for comprehension.", summaryAf: "Sesotho EAT drama: intrige volg, konflik identifiseer en toneelaanwysings vir begrip gebruik.", conceptsEn: ["Read stage directions to understand setting and character mood", "Follow how the conflict begins, grows and is resolved", "Note how community wisdom (bohlale) is often used to resolve conflict"], conceptsAf: ["Lees toneelaanwysings om omgewing en karakterstemming te verstaan", "Volg hoe die konflik begin, groei en opgelos word", "Let op hoe gemeenskapswysheid (bohlale) dikwels gebruik word om konflik op te los"] },
  "SESF-3": { summaryEn: "Sesotho FAL poetry: reading for meaning, tone, imagery and main message.", summaryAf: "Sesotho EAT poësie: lees vir betekenis, toon, beeldspraak en hoofboodskap.", conceptsEn: ["Identify the poem's subject and the poet's feeling about it (tone)", "Figurative language: simile (ho jewa ke), metaphor, personification", "Write one sentence stating the poem's main message"], conceptsAf: ["Identifiseer die gedig se onderwerp en die digter se gevoel (toon)", "Figuurlike taal: vergelyking (ho jewa ke), metafoor, personifikasie", "Skryf een sin wat die gedig se hoofboodskap stel"] },
  "SESF-4": { summaryEn: "Sesotho FAL short stories: plot, character, moral lesson and proverb use.", summaryAf: "Sesotho EAT kortverhale: intrige, karakter, morele les en spreekwoordgebruik.", conceptsEn: ["Identify the central problem and how it is solved", "Every story has a molaetsa (moral lesson) — state it explicitly", "Proverbs (maele) embedded in text: find and explain their meaning"], conceptsAf: ["Identifiseer die sentrale probleem en hoe dit opgelos word", "Elke verhaal het 'n molaetsa (morele les) — stel dit eksplisiet", "Spreekwoorde (maele) in teks ingebed: vind en verduidelik hulle betekenis"] },
  "SESF-5": { summaryEn: "Sesotho FAL language structures: key grammar, tense system and sentence construction.", summaryAf: "Sesotho EAT taalstrukture: sleutelgrammatika, tydstelsel en sinsbou.", conceptsEn: ["Focus on subject concord using noun class system", "Tenses: present (joale), past (nakong e fetileng), future (nakong e tlang)", "Common error: omitting the subject concord prefix on verbs"], conceptsAf: ["Fokus op onderwerp-konkord met naamwoordklasstelsel", "Tye: teenwoordig (joale), verlede (nakong e fetileng), toekomend (nakong e tlang)", "Algemene fout: weglating van die onderwerp-konkord-voorvoegsel op werkwoorde"] },
  "SESF-6": { summaryEn: "Sesotho FAL comprehension and summary: reading for meaning and writing a concise summary.", summaryAf: "Sesotho EAT begrip en opsomming: lees vir betekenis en 'n bondige opsomming skryf.", conceptsEn: ["Read the passage twice before answering questions", "Answer in complete sentences; use evidence from the text", "Summary: 7 main points in own words, 60–80 words"], conceptsAf: ["Lees die gedeelte twee keer voor jy vrae beantwoord", "Beantwoord in volledige sinne; gebruik bewyse uit die teks", "Opsomming: 7 hoofpunte in eie woorde, 60–80 woorde"] },
  "SESF-7": { summaryEn: "Sesotho FAL essay writing: argumentative, descriptive, narrative and reflective (400–450 words).", summaryAf: "Sesotho EAT opstelskryf: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Plan your essay: brainstorm, outline, draft, revise", "Introduction (selelekela) + 3 body paragraphs + conclusion (qetello)", "Linking words: hobane (because), empa (but), kahoo (therefore)"], conceptsAf: ["Beplan jou opstel: dinkstorm, skets, konsep, hersien", "Inleiding (selelekela) + 3 liggaamsparagrawe + slot (qetello)", "Verbindingswoorde: hobane (want), empa (maar), kahoo (daarom)"] },
  "SESF-8": { summaryEn: "Sesotho FAL transactional writing: formal letters, diary entries, reports and other functional texts.", summaryAf: "Sesotho EAT transaksionele skryf: formele briewe, dagboekinskrywings, verslae en ander funksionele tekste.", conceptsEn: ["Formal letter: address, date, salutation, body, closing signature", "Diary entry: date heading, personal first-person, reflective tone", "Report: heading, introduction, body, conclusion"], conceptsAf: ["Formele brief: adres, datum, aanhef, liggaam, afsluitinghandtekening", "Dagboekinskrywing: datum-opskrif, persoonlike eerstepersoons, reflektiewe toon", "Verslag: opskrif, inleiding, liggaam, gevolgtrekking"] },

  "TSHF-1": { summaryEn: "Tshivenda FAL: Prescribed novel at FAL level — plot, character, theme and cultural context.", summaryAf: "Tshivenda EAT: Voorgeskrewe roman op EAT-vlak — intrige, karakter, tema en kulturele konteks.", conceptsEn: ["FAL approach: focus on story comprehension; Tshivenda vocabulary supported by context", "Vhuthu (human dignity) and community values as accessible themes", "Plot stages: tshivhidzo (beginning), vhukati (middle), tshifhelo (end)"], conceptsAf: ["EAT benadering: fokus op verhaalsbegrip; Tshivenda-woordeskat ondersteun deur konteks", "Vhuthu (menslike waardigheid) en gemeenskapswaardes as toeganklike temas", "Verhaalstadia: tshivhidzo (begin), vhukati (middel), tshifhelo (einde)"] },
  "TSHF-2": { summaryEn: "Tshivenda FAL drama: plot through dialogue, conflict types and stage direction use.", summaryAf: "Tshivenda EAT drama: intrige deur dialoog, konfliksoorte en gebruik van toneelaanwysings.", conceptsEn: ["Use stage directions to visualise scenes and understand mood", "Track how conflict between tradition and change develops and resolves", "Dialogue: what characters say reveals their values and intentions"], conceptsAf: ["Gebruik toneelaanwysings om tonele te visualiseer en stemming te verstaan", "Volg hoe konflik tussen tradisie en verandering ontwikkel en opgelos word", "Dialoog: wat karakters sê onthul hulle waardes en bedoelings"] },
  "TSHF-3": { summaryEn: "Tshivenda FAL poetry: reading for meaning, tone, imagery and main message.", summaryAf: "Tshivenda EAT poësie: lees vir betekenis, toon, beeldspraak en hoofboodskap.", conceptsEn: ["Read the poem aloud to feel its rhythm and emotion", "Identify tone (positive, negative or reflective)", "State the central message in one clear sentence"], conceptsAf: ["Lees die gedig hardop om ritme en emosie te voel", "Identifiseer toon (positief, negatief of refleksief)", "Stel die sentrale boodskap in een duidelike sin"] },
  "TSHF-4": { summaryEn: "Tshivenda FAL short stories: reading for plot, character, proverbs and moral lesson.", summaryAf: "Tshivenda EAT kortverhale: lees vir intrige, karakter, spreekwoorde en morele les.", conceptsEn: ["Ngano stories teach values — identify the lesson at the end", "Proverbs (maipfi a vhadzulapo) embedded in narrative: find and explain", "Summarise: beginning, conflict, resolution in your own words"], conceptsAf: ["Ngano stories leer waardes — identifiseer die les aan die einde", "Spreekwoorde (maipfi a vhadzulapo) in narratief ingebed: vind en verduidelik", "Opsom: begin, konflik, oplossing in jou eie woorde"] },
  "TSHF-5": { summaryEn: "Tshivenda FAL language structures: noun classes, tense, concord and sentence construction.", summaryAf: "Tshivenda EAT taalstrukture: naamwoordklasse, tyd, konkord en sinsbou.", conceptsEn: ["Noun class prefixes (mu-, mi-, lu-, n-) control verb agreement", "Tense expressed through tone changes and prefixes — listen and practise", "Avoid English sentence patterns — Tshivenda structure differs"], conceptsAf: ["Naamwoordklasvoorvoegsels (mu-, mi-, lu-, n-) beheer werkwoordooreenkoms", "Tyd uitgedruk deur toonveranderinge en voorvoegsels — luister en oefen", "Vermy Engelse sinpatrone — Tshivenda struktuur verskil"] },
  "TSHF-6": { summaryEn: "Tshivenda FAL comprehension and summary: reading for meaning and writing a concise summary.", summaryAf: "Tshivenda EAT begrip en opsomming: lees vir betekenis en 'n bondige opsomming skryf.", conceptsEn: ["Read passage twice: global then detailed understanding", "Use text evidence to support comprehension answers", "Summary: 7 main ideas in own words, 60–80 words"], conceptsAf: ["Lees gedeelte twee keer: globale dan gedetailleerde begrip", "Gebruik teksbewys om begripsantwoorde te ondersteun", "Opsomming: 7 hoofidees in eie woorde, 60–80 woorde"] },
  "TSHF-7": { summaryEn: "Tshivenda FAL essay writing: argumentative, descriptive, narrative and reflective (400–450 words).", summaryAf: "Tshivenda EAT opstelskryf: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Plan your essay before writing — brainstorm and outline", "Introduction, 3 body paragraphs (PEEL), conclusion", "Use connectors: ngauri (because), fhedzi (but), ndi zwone (therefore)"], conceptsAf: ["Beplan jou opstel voor skryf — dinkstorm en skets", "Inleiding, 3 liggaamsparagrawe (PEEL), slot", "Gebruik verbindingswoorde: ngauri (want), fhedzi (maar), ndi zwone (daarom)"] },
  "TSHF-8": { summaryEn: "Tshivenda FAL transactional writing: formal letters, diary entries, reports and other functional texts.", summaryAf: "Tshivenda EAT transaksionele skryf: formele briewe, dagboekinskrywings, verslae en ander funksionele tekste.", conceptsEn: ["Formal letter: address block, date, subject, body paragraphs, closing", "Diary entry: date, first-person voice, personal and reflective", "Register: formal for official writing; informal for personal texts"], conceptsAf: ["Formele brief: adresblok, datum, onderwerp, liggaamsparagrawe, afsluiting", "Dagboekinskrywing: datum, eerstepersoons stem, persoonlik en refleksief", "Register: formeel vir amptelike skryfwerk; informeel vir persoonlike tekste"] },

  "XITF-1": { summaryEn: "Xitsonga FAL: Prescribed novel at FAL level — plot, character, theme and cultural context.", summaryAf: "Xitsonga EAT: Voorgeskrewe roman op EAT-vlak — intrige, karakter, tema en kulturele konteks.", conceptsEn: ["FAL approach: follow story through accessible vocabulary and context", "Ubuntu (ndzi na wena) as universal theme connecting to learner experience", "Identify protagonist, antagonist, conflict and resolution"], conceptsAf: ["EAT benadering: volg verhaal deur toeganklike woordeskat en konteks", "Ubuntu (ndzi na wena) as universele tema wat met leerder se ervaring verbind", "Identifiseer protagonis, antagonis, konflik en oplossing"] },
  "XITF-2": { summaryEn: "Xitsonga FAL drama: plot through dialogue, conflict and stage directions.", summaryAf: "Xitsonga EAT drama: intrige deur dialoog, konflik en toneelaanwysings.", conceptsEn: ["Stage directions describe setting, movement and tone — read carefully", "Follow conflict as it escalates toward the climax", "Dialogue: pay attention to what characters say vs. what they mean (subtext)"], conceptsAf: ["Toneelaanwysings beskryf omgewing, beweging en toon — lees noukeurig", "Volg konflik soos dit na die klimaks eskaleer", "Dialoog: let op wat karakters sê teenoor wat hulle bedoel (subteks)"] },
  "XITF-3": { summaryEn: "Xitsonga FAL poetry: reading for meaning, tone, imagery and central message.", summaryAf: "Xitsonga EAT poësie: lees vir betekenis, toon, beeldspraak en sentrale boodskap.", conceptsEn: ["Identify the poem's subject and the poet's attitude (tone)", "Repetition (ku phinda-phinda) builds rhythm — note its emotional effect", "Summarise the poem's central message in one sentence"], conceptsAf: ["Identifiseer die gedig se onderwerp en die digter se houding (toon)", "Herhaling (ku phinda-phinda) bou ritme — let op die emosionele effek", "Vat die gedig se sentrale boodskap saam in een sin"] },
  "XITF-4": { summaryEn: "Xitsonga FAL short stories: plot, character, proverbs (swivulavula) and moral lesson.", summaryAf: "Xitsonga EAT kortverhale: intrige, karakter, spreekwoorde (swivulavula) en morele les.", conceptsEn: ["Switori structure: problem, events, resolution, lesson", "Proverbs (swivulavula): find them in the text and explain their relevance", "State the moral lesson clearly after reading"], conceptsAf: ["Switori struktuur: probleem, gebeure, oplossing, les", "Spreekwoorde (swivulavula): vind hulle in die teks en verduidelik hulle relevansie", "Stel die morele les duidelik na lees"] },
  "XITF-5": { summaryEn: "Xitsonga FAL language structures: noun classes, tense, concordial agreement and sentence construction.", summaryAf: "Xitsonga EAT taalstrukture: naamwoordklasse, tyd, konkordiële ooreenkoms en sinsbou.", conceptsEn: ["Noun class prefixes (va-, ma-, xi-, ti-) control agreement in sentence", "Tenses: present (sweswi), past (a nga a), future (ta)", "Focus on high-frequency grammar patterns needed for writing tasks"], conceptsAf: ["Naamwoordklasvoorvoegsels (va-, ma-, xi-, ti-) beheer ooreenkoms in die sin", "Tye: teenwoordig (sweswi), verlede (a nga a), toekomend (ta)", "Fokus op hoogfrekwensie grammatikapatrone benodig vir skryftake"] },
  "XITF-6": { summaryEn: "Xitsonga FAL comprehension and summary: reading for meaning and summarising key points.", summaryAf: "Xitsonga EAT begrip en opsomming: lees vir betekenis en sleutelpunte opsom.", conceptsEn: ["Read the full passage before answering any questions", "Evidence-based answers: quote or paraphrase from the text", "Summary: 7 points, own words, within 60–80 words"], conceptsAf: ["Lees die volledige gedeelte voor enige vrae beantwoord", "Bewys-gebaseerde antwoorde: aanhaal of parafraseer uit die teks", "Opsomming: 7 punte, eie woorde, binne 60–80 woorde"] },
  "XITF-7": { summaryEn: "Xitsonga FAL essay writing: argumentative, descriptive, narrative and reflective (400–450 words).", summaryAf: "Xitsonga EAT opstelskryf: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Plan before writing: choose essay type, brainstorm, outline", "Introduction + 3 paragraphs + conclusion", "Linking words: hikuva (because), kambe (but), hikokwalaho (therefore)"], conceptsAf: ["Beplan voor skryf: kies opsteltipe, dinkstorm, skets", "Inleiding + 3 paragrawe + slot", "Verbindingswoorde: hikuva (want), kambe (maar), hikokwalaho (daarom)"] },
  "XITF-8": { summaryEn: "Xitsonga FAL transactional writing: formal letters, diary entries, reports and functional texts.", summaryAf: "Xitsonga EAT transaksionele skryf: formele briewe, dagboekinskrywings, verslae en funksionele tekste.", conceptsEn: ["Learn the correct layout for each text type", "Formal letter: address, date, salutation, body, sign-off", "Adjust register to purpose: formal for official, informal for personal"], conceptsAf: ["Leer die korrekte uitleg vir elke teks tipe", "Formele brief: adres, datum, aanhef, liggaam, afsluiting", "Pas register aan vir doel: formeel vir amptelik, informeel vir persoonlik"] },

  "NDF-1": { summaryEn: "isiNdebele FAL: Prescribed novel at FAL level — plot, character, theme and cultural context.", summaryAf: "isiNdebele EAT: Voorgeskrewe roman op EAT-vlak — intrige, karakter, tema en kulturele konteks.", conceptsEn: ["FAL approach: focus on accessible narrative comprehension", "Ubuntu and community (abazalwane) as entry-level themes", "Identify protagonist, antagonist and central conflict"], conceptsAf: ["EAT benadering: fokus op toeganklike narratiefbegrip", "Ubuntu en gemeenskap (abazalwane) as toegangsvlak-temas", "Identifiseer protagonis, antagonis en sentrale konflik"] },
  "NDF-2": { summaryEn: "isiNdebele FAL drama: following plot, identifying conflict and using stage directions.", summaryAf: "isiNdebele EAT drama: intrige volg, konflik identifiseer en toneelaanwysings gebruik.", conceptsEn: ["Stage directions: read to understand setting, mood and character position", "Track how conflict builds and is resolved", "Dialogue reveals character motivation and values"], conceptsAf: ["Toneelaanwysings: lees om omgewing, stemming en karakterposisie te verstaan", "Volg hoe konflik bou en opgelos word", "Dialoog onthul karaktermotivering en waardes"] },
  "NDF-3": { summaryEn: "isiNdebele FAL poetry: reading for meaning, tone, imagery and main message.", summaryAf: "isiNdebele EAT poësie: lees vir betekenis, toon, beeldspraak en hoofboodskap.", conceptsEn: ["Read the poem twice before attempting any analysis", "Identify tone words and figurative devices", "Write the poem's main message in one sentence"], conceptsAf: ["Lees die gedig twee keer voor enige analise", "Identifiseer toonwoorde en figuurlike toestelle", "Skryf die gedig se hoofboodskap in een sin"] },
  "NDF-4": { summaryEn: "isiNdebele FAL short stories: plot, character, proverbs and moral lesson.", summaryAf: "isiNdebele EAT kortverhale: intrige, karakter, spreekwoorde en morele les.", conceptsEn: ["Story drawn from izinganekwane tradition: identify the moral lesson", "Proverbs (izaga) in the text carry cultural wisdom", "Summarise the story: beginning, middle, end in own words"], conceptsAf: ["Verhaal ontleen aan izinganekwane tradisie: identifiseer die morele les", "Spreekwoorde (izaga) in die teks dra kulturele wysheid", "Vat die verhaal saam: begin, middel, einde in eie woorde"] },
  "NDF-5": { summaryEn: "isiNdebele FAL language structures: noun classes, tense, concord and sentence construction.", summaryAf: "isiNdebele EAT taalstrukture: naamwoordklasse, tyd, konkord en sinsbou.", conceptsEn: ["Noun class prefixes control verb and adjective agreement", "Tone is phonemic: same written syllable, different tone = different meaning", "Focus on high-frequency patterns for writing tasks"], conceptsAf: ["Naamwoordklasvoorvoegsels beheer werkwoord- en byvoeglike naamwoord-ooreenkoms", "Toon is foneemies: selfde geskrewe lettergreep, verskillende toon = verskillende betekenis", "Fokus op hoogfrekwensie patrone vir skryftake"] },
  "NDF-6": { summaryEn: "isiNdebele FAL comprehension and summary: reading for meaning and writing a concise summary.", summaryAf: "isiNdebele EAT begrip en opsomming: lees vir betekenis en 'n bondige opsomming skryf.", conceptsEn: ["Read the whole passage before answering questions", "Support answers with evidence from the text", "Summary: 7 main points in own words, 60–80 words"], conceptsAf: ["Lees die hele gedeelte voor vrae beantwoord", "Ondersteun antwoorde met bewyse uit die teks", "Opsomming: 7 hoofpunte in eie woorde, 60–80 woorde"] },
  "NDF-7": { summaryEn: "isiNdebele FAL essay writing: argumentative, descriptive, narrative and reflective (400–450 words).", summaryAf: "isiNdebele EAT opstelskryf: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Plan: mind-map or outline before writing", "Introduction (isethulo) + 3 body paragraphs + conclusion (isiphetho)", "Connecting words: ngoba (because), kodwa (but), ngakho (therefore)"], conceptsAf: ["Beplan: gedankekaart of skets voor skryf", "Inleiding (isethulo) + 3 liggaamsparagrawe + slot (isiphetho)", "Verbindingswoorde: ngoba (want), kodwa (maar), ngakho (daarom)"] },
  "NDF-8": { summaryEn: "isiNdebele FAL transactional writing: formal letters, diary entries, reports and functional texts.", summaryAf: "isiNdebele EAT transaksionele skryf: formele briewe, dagboekinskrywings, verslae en funksionele tekste.", conceptsEn: ["Formal letter: address block, date, subject line, body, signature", "Diary entry: date heading, first-person voice, personal tone", "Report: title, objective, findings, recommendations"], conceptsAf: ["Formele brief: adresblok, datum, onderwerplyn, liggaam, handtekening", "Dagboekinskrywing: datum-opskrif, eerstepersoons stem, persoonlike toon", "Verslag: titel, doelwit, bevindinge, aanbevelings"] },

  "SWAF-1": { summaryEn: "siSwati FAL: Prescribed novel at FAL level — plot, character, theme and cultural context.", summaryAf: "siSwati EAT: Voorgeskrewe roman op EAT-vlak — intrige, karakter, tema en kulturele konteks.", conceptsEn: ["FAL approach: prioritise reading comprehension over literary analysis", "Ubuntu (umuntu ngumuntu) and community values as accessible themes", "Plot stages: ekuqaleni (beginning), emkhatsini (middle), ekupheleni (end)"], conceptsAf: ["EAT benadering: prioritiseer leesbegrip bo letterkundige analise", "Ubuntu (umuntu ngumuntu) en gemeenskapswaardes as toeganklike temas", "Verhaalstadia: ekuqaleni (begin), emkhatsini (middel), ekupheleni (einde)"] },
  "SWAF-2": { summaryEn: "siSwati FAL drama: plot through dialogue, conflict identification and stage direction use.", summaryAf: "siSwati EAT drama: intrige deur dialoog, konflikidentifikasie en gebruik van toneelaanwysings.", conceptsEn: ["Stage directions: use to visualise setting and understand mood", "Track conflict between tradition and modernity as it develops", "Dialogue: what characters say reveals their values and goals"], conceptsAf: ["Toneelaanwysings: gebruik om omgewing te visualiseer en stemming te verstaan", "Volg konflik tussen tradisie en moderniteit soos dit ontwikkel", "Dialoog: wat karakters sê onthul hulle waardes en doelwitte"] },
  "SWAF-3": { summaryEn: "siSwati FAL poetry: reading for meaning, tone, imagery and main message.", summaryAf: "siSwati EAT poësie: lees vir betekenis, toon, beeldspraak en hoofboodskap.", conceptsEn: ["Emaguqu praise songs: celebrate royalty and community — identify the subject", "Identify tone: celebratory (kucula), sorrowful (kulila), or thoughtful (kucabanga)", "State the main message of the poem in one sentence"], conceptsAf: ["Emaguqu lofsange: vier koningshuis en gemeenskap — identifiseer die onderwerp", "Identifiseer toon: feesvierende (kucula), treurige (kulila), of nadenkende (kucabanga)", "Stel die hoofboodskap van die gedig in een sin"] },
  "SWAF-4": { summaryEn: "siSwati FAL short stories: plot, character, proverbs (ticumo) and moral lesson.", summaryAf: "siSwati EAT kortverhale: intrige, karakter, spreekwoorde (ticumo) en morele les.", conceptsEn: ["Tinganekwane stories: identify the lesson taught at the end", "Proverbs (ticumo): find in the text and explain their meaning", "Summarise: beginning, conflict, resolution in own words"], conceptsAf: ["Tinganekwane stories: identifiseer die les geleer aan die einde", "Spreekwoorde (ticumo): vind in die teks en verduidelik hulle betekenis", "Opsom: begin, konflik, oplossing in eie woorde"] },
  "SWAF-5": { summaryEn: "siSwati FAL language structures: noun classes, tense, concord and sentence construction.", summaryAf: "siSwati EAT taalstrukture: naamwoordklasse, tyd, konkord en sinsbou.", conceptsEn: ["Noun class prefixes (ema-, ti-, si-, li-) control all agreement in the sentence", "Tenses: present (manje), past (kudvulate), future (kutawuza)", "Practise frequently — patterns become natural through repeated reading"], conceptsAf: ["Naamwoordklasvoorvoegsels (ema-, ti-, si-, li-) beheer alle ooreenkoms in die sin", "Tye: teenwoordig (manje), verlede (kudvulate), toekomend (kutawuza)", "Oefen gereeld — patrone word natuurlik deur herhaalde lees"] },
  "SWAF-6": { summaryEn: "siSwati FAL comprehension and summary: reading for meaning and writing a concise summary.", summaryAf: "siSwati EAT begrip en opsomming: lees vir betekenis en 'n bondige opsomming skryf.", conceptsEn: ["Read passage fully before attempting questions", "Evidence-based answers: reference the text", "Summary: 7 main points, own words, 60–80 words"], conceptsAf: ["Lees gedeelte volledig voor vrae probeer beantwoord", "Bewys-gebaseerde antwoorde: verwys na die teks", "Opsomming: 7 hoofpunte, eie woorde, 60–80 woorde"] },
  "SWAF-7": { summaryEn: "siSwati FAL essay writing: argumentative, descriptive, narrative and reflective (400–450 words).", summaryAf: "siSwati EAT opstelskryf: betogend, beskrywend, narratief en refleksief (400–450 woorde).", conceptsEn: ["Plan before writing: type, audience, main point", "Structure: introduction + 3 body paragraphs + conclusion", "Linking words: ngobe (because), kodvwa (but), ngako (therefore)"], conceptsAf: ["Beplan voor skryf: tipe, gehoor, hoofpunt", "Struktuur: inleiding + 3 liggaamsparagrawe + slot", "Verbindingswoorde: ngobe (want), kodvwa (maar), ngako (daarom)"] },
  "SWAF-8": { summaryEn: "siSwati FAL transactional writing: formal letters, diary entries, reports and functional texts.", summaryAf: "siSwati EAT transaksionele skryf: formele briewe, dagboekinskrywings, verslae en funksionele tekste.", conceptsEn: ["Formal letter: address block, date, subject line, body, closing", "Diary entry: date heading, personal first-person voice", "Register: formal for official texts; informal for personal texts"], conceptsAf: ["Formele brief: adresblok, datum, onderwerplyn, liggaam, afsluiting", "Dagboekinskrywing: datum-opskrif, persoonlike eerstepersoons stem", "Register: formeel vir amptelike tekste; informeel vir persoonlike tekste"] },

  // --------------------- MARINE SCIENCES (Task #534) ---------------------
  "MRSCI-1": {
    summaryEn: "The marine environment: ocean zones, coastal ecosystems (estuaries, rocky shores, sandy beaches, coral reefs) and biodiversity.",
    summaryAf: "Die mariene omgewing: oseaangebiede, kusekostelsels (estuaria, rotsagtige kuste, sandstrande, koraalriwwe) en biodiversiteit.",
    conceptsEn: ["Ocean zones: intertidal, neritic (continental shelf), oceanic, abyssal", "Rocky shore zonation: splash, intertidal, subtidal zones", "Biodiversity hotspots: coral reefs support 25% of all marine species"],
    conceptsAf: ["Oseaangebiede: getydezone, neritiese (kontinentale rak), oseaniese, abissale sone", "Rotskus-soneëring: spatzone, getydezone, subgetydezone", "Biodiversiteitkolpunte: koraalriwwe ondersteun 25% van alle mariene spesies"],
    exampleEn: { question: "Explain why estuaries are described as 'nurseries of the sea'.", solution: "Estuaries have sheltered, nutrient-rich, brackish water. Many marine fish species spawn in open water but juveniles move into estuaries where food is abundant and predation is lower. This safe habitat allows juveniles to grow before returning to the open ocean." },
    exampleAf: { question: "Verduidelik hoekom estuaria as 'kwekeries van die see' beskryf word.", solution: "Estuaria het beskutte, voedingstofryke, brakwater. Baie mariene visspesies paaier in oop water, maar jong vissies beweeg na estuaria waar voedsel volop is en roofdiere minder is. Hierdie veilige habitat laat jong vissies groei voordat hulle na die oop oseaan terugkeer." }
  },
  "MRSCI-2": {
    summaryEn: "Ocean physics and chemistry: waves, currents, tides, salinity, temperature, density and the role of the Benguela and Agulhas currents around South Africa.",
    summaryAf: "Oseanofisika en -chemie: golwe, strome, getye, soutgehalte, temperatuur, digtheid en die rol van die Benguela- en Agulhasstrome rondom Suid-Afrika.",
    conceptsEn: ["Salinity: average 35 g/kg; affects density and organism distribution", "Benguela Current: cold, nutrient-rich upwelling on SA west coast → high fish productivity", "Agulhas Current: warm, fast-moving on SA east coast → different species distribution"],
    conceptsAf: ["Soutgehalte: gemiddeld 35 g/kg; beïnvloed digtheid en organismeverspreiding", "Benguelastroom: koud, voedingstofryk opstuwing op SA weskus → hoë visproduktiwiteit", "Agulhasstroom: warm, vinnig op SA ooskus → verskillende spesiesverspreiding"],
    exampleEn: { question: "Why does the west coast of South Africa support larger fish populations than the east coast?", solution: "The Benguela Current causes upwelling of cold, nutrient-rich water from depth on the west coast. These nutrients fuel phytoplankton growth → zooplankton → fish. The warm Agulhas Current on the east coast does not upwell; it flows fast along the surface, keeping nutrients locked in deep water." },
    exampleAf: { question: "Hoekom ondersteun die weskus van SA groter visspopulasies as die ooskus?", solution: "Die Benguelastroom veroorsaak opstuwing van koue, voedingstofryke water op die weskus. Hierdie voedingstowwe voed fitoplanktongroei → soöplankton → vis. Die warm Agulhasstroom op die ooskus doen nie opstuwing nie; dit vloei vinnig langs die oppervlak en hou voedingstowwe in diep water vasgevang." }
  },
  "MRSCI-3": {
    summaryEn: "Marine biology: classification of marine organisms, food webs, adaptations, reproduction and inter-species relationships (predation, symbiosis, competition).",
    summaryAf: "Mariene biologie: klassifikasie van mariene organismes, voedselwebbe, aanpassings, voortplanting en tussen-spesies-verhoudings (roofdierskap, simbiose, kompetisie).",
    conceptsEn: ["Marine food web: phytoplankton → zooplankton → small fish → apex predators", "Adaptations: streamlining (fish), bioluminescence (deep sea), osmoregulation (sharks)", "Symbiosis: mutualism (clownfish + anemone), parasitism (sea lice on fish)"],
    conceptsAf: ["Mariene voedselweb: fitoplankton → soöplankton → klein vis → toppredatore", "Aanpassings: stroomlyning (vis), bioluminessensie (diepsee), osmoregulering (haaie)", "Simbiose: mutualisme (kownvis + anemoon), parasitisme (seekluis op vis)"],
    exampleEn: { question: "Describe two structural adaptations of a shark that make it an effective predator.", solution: "1. Streamlined body shape reduces drag in water, allowing fast pursuit. 2. Ampullae of Lorenzini (electroreceptors) detect the electrical fields of prey hidden in sand or murky water, allowing precise location even without sight." },
    exampleAf: { question: "Beskryf twee struktuurlike aanpassings van 'n haai wat dit 'n effektiewe roofdier maak.", solution: "1. Stroomlynige liggaamsvorm verminder weerstand in water en maak vinnige agtervolging moontlik. 2. Ampulle van Lorenzini (elektroreseptore) bespeur elektriese velde van prooi wat in sand of troebel water versteek is, wat presiese ligging sonder sig moontlik maak." }
  },
  "MRSCI-4": {
    summaryEn: "Marine resources and conservation: sustainable fishing, marine pollution, marine protected areas (MPAs), and South Africa's ocean economy (Operation Phakisa).",
    summaryAf: "Mariene hulpbronne en bewaring: volhoubare visvang, mariene besoedeling, mariene beskermde gebiede (MBG's) en Suid-Afrika se seaekonomie (Operasie Phakisa).",
    conceptsEn: ["Overfishing: catches exceed maximum sustainable yield (MSY) → population collapse", "Marine Protected Areas (MPAs): no-take zones allow fish stocks to recover", "Operation Phakisa: SA government programme to develop marine economy (aquaculture, oil & gas, shipping)"],
    conceptsAf: ["Oorbevisssing: vangs oorskry maksimum volhoubare opbrengs (MVO) → populasie-ineenstorting", "Mariene beskermde gebiede (MBG's): geen-vang-sones laat visbestande herstel", "Operasie Phakisa: SA regeringsprogram om mariene ekonomie te ontwikkel (akwakultuur, olie en gas, skeepvaart)"],
    exampleEn: { question: "Explain how overfishing disrupts a marine food web. Use an example.", solution: "Removing too many sardines (a key prey species) from the Benguela Current ecosystem deprives Cape gannets, penguins and Cape fur seals of their main food source. These predator populations decline, causing trophic cascade — the whole food web is destabilised." },
    exampleAf: { question: "Verduidelik hoe oorbevisssing 'n mariene voedselweb versteur. Gebruik 'n voorbeeld.", solution: "Die verwydering van te veel sardyne (sleutelprooisosies) uit die Benguela-ekosisteem ontneem Kaapse maligas, pikkewyne en Kaapse pelsrobbe hulle hoofdkos. Hierdie roofdier­populasies daal, wat 'n trofiese waterval veroorsaak — die hele voedselweb word gedestabiliseer." }
  },
  "MRSCI-5": {
    summaryEn: "Climate change and the ocean: ocean warming, acidification, sea-level rise, coral bleaching and impacts on South African coastal communities.",
    summaryAf: "Klimaatsverandering en die oseaan: oseaanverwarming, versuring, seevlakstysing, koraalbleiking en impakte op Suid-Afrikaanse kusge­meenskappe.",
    conceptsEn: ["Ocean absorbs ~90% of excess heat from greenhouse warming → warming reduces oxygen solubility", "Ocean acidification: CO₂ + H₂O → H₂CO₃ (carbonic acid) → dissolves calcium carbonate shells and corals", "Coral bleaching: warming water stresses zooxanthellae (algal symbiont) → expelled from coral → white skeleton"],
    conceptsAf: ["Oseaan absorbeer ~90% van oortollige hitte van kweekhuisopwarming → opwarming verminder suurstofoplosbaar", "Oseaanversuring: CO₂ + H₂O → H₂CO₃ (koolsuursuur) → los kalsiumkarbonaat skulpe en koraal op", "Koraalbleiking: warm water stres soöxantellae (algesimbiont) → uitgestel uit koraal → wit skelet"],
    exampleEn: { question: "Explain how ocean acidification threatens coral reefs and the species that depend on them.", solution: "CO₂ dissolves in seawater forming carbonic acid, lowering pH. Lower pH reduces the carbonate ions available for corals to build their calcium carbonate skeletons. Weakened or dissolved coral skeletons collapse the reef structure — the habitat that 25% of marine species depend on disappears, triggering mass extinction of reef fish, invertebrates and the ecosystems that coastal communities rely on for food and shoreline protection." },
    exampleAf: { question: "Verduidelik hoe oseaanversuring koraalriwwe en die spesies wat van hulle afhang bedreig.", solution: "CO₂ los op in seewater en vorm koolsuursuur, wat die pH verlaag. Laer pH verminder die karbonaatstione wat beskikbaar is vir koraal om kalsiumkarbonaat-skelette te bou. Verswakte of opgelos koraal-skelette laat die riwstruktuur ineensak — die habitat waarvan 25% van mariene spesies afhang verdwyn, en veroorsaak massale uitwissing van riwvisse, ongewerweldes en ekostelsels waarop kusge­meenskappe vir voedsel en kuslynbeskerming staatmaak." }
  },
};

// Merge non-STEM worked examples into TOPIC_CONTENT
for (const [key, we] of Object.entries(NON_STEM_WORKED_EXAMPLES)) {
  if (TOPIC_CONTENT[key]) {
    TOPIC_CONTENT[key].workedExamplesEn = we.workedExamplesEn;
    TOPIC_CONTENT[key].workedExamplesAf = we.workedExamplesAf;
  }
}

// Merge STEM worked examples into TOPIC_CONTENT (placed after the non-STEM merge
// so the consolidated, uniformly-rich STEM set overrides any prior examples for
// MATH / PHYS / LIFE / ACC / BUS / ECO topics).
for (const [key, we] of Object.entries(STEM_WORKED_EXAMPLES)) {
  if (TOPIC_CONTENT[key]) {
    TOPIC_CONTENT[key].workedExamplesEn = we.workedExamplesEn;
    TOPIC_CONTENT[key].workedExamplesAf = we.workedExamplesAf;
  }
}

// =============================================================================
// Detailed literature notes — curated content for selected high-impact set works.
// All other works get a stub note (themes/characters/devices/essay frameworks
// arrays present but minimal) so the UI always renders something.
// =============================================================================
type LitChar = { name: string; description: string };
type LitDevice = { name: string; explanation: string };
type LitFramework = { prompt: string; outline: string[] };
type LitNoteContent = {
  summaryEn: string;
  summaryAf?: string;
  // Source-language arrays (EN for engh-* curated entries; AF for afrh-* entries
  // marked with sourceLang:"af"). The seeder writes the source-language row from
  // these and uses buildGenericLitContent for the other-language row so EN/AF
  // toggle truly switches content.
  themes: string[];
  characters: LitChar[];
  literaryDevices: LitDevice[];
  essayFrameworks: LitFramework[];
  sourceLang?: "en" | "af";
};

const LITERATURE_NOTE_LIBRARY: Record<string, LitNoteContent> = {
  "engh-nov-1": {
    summaryEn: "Animal Farm by George Orwell is a satirical allegory of the Russian Revolution, depicting how the animals of Manor Farm overthrow their owner only for the pigs to install a tyranny worse than the one they replaced.",
    summaryAf: "Animal Farm deur George Orwell is 'n satiriese allegorie van die Russiese Rewolusie, wat wys hoe die diere van Manor-plaas hul eienaar omverwerp net vir die varke om 'n tirannie te vestig erger as die een wat hulle vervang het.",
    themes: ["Power and corruption", "The betrayal of revolutionary ideals", "The role of language in propaganda", "Class and inequality", "The dangers of a passive working class"],
    characters: [
      { name: "Napoleon", description: "Boar who seizes total power; allegorical Stalin figure who uses fear (the dogs) and propaganda (Squealer) to control." },
      { name: "Snowball", description: "Idealistic boar driven out by Napoleon; allegorical Trotsky who represents the original revolutionary vision." },
      { name: "Boxer", description: "Loyal cart-horse representing the working class; his motto 'I will work harder' shows tragic blind faith in leadership." },
      { name: "Squealer", description: "Propaganda mouthpiece; manipulates statistics and language to justify the pigs' growing privileges." },
      { name: "Old Major", description: "Visionary boar whose dying speech inspires the Rebellion; allegorical Marx/Lenin figure." },
    ],
    literaryDevices: [
      { name: "Allegory", explanation: "Whole novel maps onto Russian Revolution events (1917 onward)." },
      { name: "Satire", explanation: "Mocks Stalinist Russia and revolutions that betray their own ideals." },
      { name: "Symbolism", explanation: "Windmill = industrial progress promised but corrupted; the barn commandments = mutable ideology." },
      { name: "Irony", explanation: "Final commandment 'All animals are equal but some are more equal than others' captures the entire betrayal." },
    ],
    essayFrameworks: [
      { prompt: "Discuss how language and propaganda are used as tools of power in Animal Farm.", outline: ["Intro: thesis that Squealer's manipulation of language enables Napoleon's tyranny", "Body 1: rewriting of the Seven Commandments (e.g. 'no animal shall sleep in a bed' → 'with sheets')", "Body 2: Squealer's distortion of statistics and history (Snowball's role at Battle of the Cowshed)", "Body 3: the changing meaning of 'comrade' and 'four legs good, two legs bad'", "Conclusion: the silencing of language equals the silencing of dissent"] },
      { prompt: "'Power tends to corrupt; absolute power corrupts absolutely.' Discuss with reference to Napoleon's rise.", outline: ["Intro: Acton's quote applied to Napoleon's transformation", "Body 1: equality slogan vs growing privilege", "Body 2: violence (the dogs, the executions)", "Body 3: final image — pigs indistinguishable from humans", "Conclusion: warning against unchecked authority"] },
    ],
  },
  "engh-nov-2": {
    summaryEn: "Cry, the Beloved Country by Alan Paton (1948) follows Zulu pastor Stephen Kumalo's journey to Johannesburg to find his sister and son, set against the backdrop of pre-apartheid South Africa's racial and economic injustice.",
    themes: ["Racial injustice and apartheid's roots", "Reconciliation and forgiveness", "The breakdown of tribal society", "Fatherhood and family", "Hope versus despair"],
    characters: [
      { name: "Stephen Kumalo", description: "Humble Zulu Anglican priest from Ndotsheni; embodies faith, humility and the search for healing." },
      { name: "Absalom Kumalo", description: "Stephen's son who murders Arthur Jarvis during a botched robbery; symbolises a generation lost to urban poverty." },
      { name: "James Jarvis", description: "White farmer whose son is killed; his transformation into a benefactor of Ndotsheni embodies the novel's hope." },
      { name: "Arthur Jarvis", description: "The murdered liberal whose writings on race influence his father after his death." },
    ],
    literaryDevices: [
      { name: "Lyrical prose", explanation: "Paton's biblical, rhythmic style elevates the story to a sermon-like register." },
      { name: "Symbolism", explanation: "The land of Ndotsheni vs the city of Johannesburg = innocence vs corruption." },
      { name: "Pathetic fallacy", explanation: "Drought and rain mirror despair and hope respectively." },
    ],
    essayFrameworks: [
      { prompt: "How does Paton use Stephen Kumalo's journey to critique pre-apartheid South Africa?", outline: ["Intro: Kumalo's journey as a moral and social map", "Body 1: rural decay vs urban exploitation", "Body 2: encounters with Msimangu, John Kumalo, Gertrude", "Body 3: trial as an indictment of the system", "Conclusion: Paton's plea for justice rooted in faith"] },
    ],
  },
  "engh-dr-2": {
    summaryEn: "Othello by Shakespeare is a tragedy of jealousy, manipulation and racial prejudice. The Moorish general's love for Desdemona is destroyed by Iago's deceit.",
    themes: ["Jealousy as the 'green-eyed monster'", "Racism and 'otherness'", "Manipulation and deception", "Appearance vs reality", "Patriarchy and the silencing of women"],
    characters: [
      { name: "Othello", description: "Noble Moorish general whose pride and insecurity make him susceptible to Iago's poison." },
      { name: "Iago", description: "Master manipulator and motiveless malignancy; soliloquies expose his evil intent." },
      { name: "Desdemona", description: "Othello's loyal, courageous wife unjustly accused of infidelity." },
      { name: "Cassio", description: "Othello's lieutenant whose downfall Iago engineers." },
      { name: "Emilia", description: "Iago's wife whose final truth-telling exposes the plot at the cost of her life." },
    ],
    literaryDevices: [
      { name: "Dramatic irony", explanation: "Audience knows Iago's villainy throughout, while Othello does not." },
      { name: "Soliloquy", explanation: "Iago reveals his plans directly to the audience." },
      { name: "Symbolism", explanation: "The handkerchief = Desdemona's fidelity and Othello's trust." },
      { name: "Animal imagery", explanation: "Iago's coarse imagery ('black ram', 'beast with two backs') taps racist stereotypes." },
    ],
    essayFrameworks: [
      { prompt: "Iago has been called a 'motiveless malignancy'. To what extent do you agree?", outline: ["Intro: Coleridge's phrase as starting point", "Body 1: stated motives (Cassio's promotion, suspected affair)", "Body 2: deeper resentment of Othello's success and otherness", "Body 3: pleasure in destruction itself", "Conclusion: motives multiply but none fully explain the evil"] },
      { prompt: "Discuss the role of race in Othello's tragedy.", outline: ["Intro: Othello's outsider status in Venice", "Body 1: how Brabantio and Roderigo see him", "Body 2: how Othello internalises racism", "Body 3: Iago weaponises that internalised prejudice", "Conclusion: race is not the only cause but it is the lever Iago pulls"] },
    ],
  },
  "engh-dr-6": {
    summaryEn: "Macbeth by Shakespeare is a tragedy about ambition: a Scottish thane murders King Duncan to seize the throne and is destroyed by guilt, paranoia and the consequences of his own choices.",
    themes: ["Ambition and its corruption", "Fate vs free will", "Guilt and conscience", "Appearance vs reality", "Disorder in nature mirroring disorder in the state"],
    characters: [
      { name: "Macbeth", description: "Brave warrior whose ambition, fed by the witches and Lady Macbeth, leads to tyranny and ruin." },
      { name: "Lady Macbeth", description: "Initially the driving force; ultimately undone by guilt ('Out, damned spot!')." },
      { name: "The Three Witches", description: "Symbols of fate and equivocation; their prophecies frame the play." },
      { name: "Banquo", description: "Foil to Macbeth: also tempted but resists; his ghost embodies Macbeth's guilt." },
      { name: "Macduff", description: "Loyal nobleman who avenges Duncan and his slaughtered family." },
    ],
    literaryDevices: [
      { name: "Soliloquy", explanation: "'Is this a dagger…' lays bare Macbeth's psychological state." },
      { name: "Symbolism", explanation: "Blood = guilt; sleep = innocence destroyed." },
      { name: "Equivocation", explanation: "The witches' prophecies are technically true yet misleading." },
      { name: "Pathetic fallacy", explanation: "Storms and unnatural events mirror political disorder." },
    ],
    essayFrameworks: [
      { prompt: "'Macbeth's tragedy is the result of his ambition, not the witches.' Discuss.", outline: ["Intro: temptation vs choice", "Body 1: witches plant but do not force", "Body 2: Macbeth's own soliloquies show his choice", "Body 3: Lady Macbeth as catalyst, not cause", "Conclusion: ambition + free choice produce the tragedy"] },
    ],
  },
  // Generic fallbacks for novels/dramas without curated content
  "engh-nov-3": { summaryEn: "The Great Gatsby (Fitzgerald) explores the corrupting power of wealth and the elusiveness of the American Dream in the Jazz Age.", themes: ["The American Dream", "Wealth and class", "Love and idealism", "Time and memory"], characters: [ { name: "Jay Gatsby", description: "Self-made millionaire defined by his romantic obsession with Daisy." }, { name: "Nick Carraway", description: "The novel's reflective narrator." }, { name: "Daisy Buchanan", description: "Beautiful but careless object of Gatsby's longing." } ], literaryDevices: [ { name: "Symbolism", explanation: "Green light = unreachable hope; valley of ashes = moral decay." }, { name: "First-person narration", explanation: "Nick's selective view shapes our judgement of Gatsby." } ], essayFrameworks: [ { prompt: "How does Fitzgerald critique the American Dream?", outline: ["Intro: dream defined", "Body: Gatsby's failure", "Body: Tom & Daisy's careless wealth", "Conclusion: dream as illusion"] } ] },
  "engh-nov-4": { summaryEn: "Lord of the Flies (Golding) traces the descent into savagery of British schoolboys stranded on an island, exploring innate human darkness.", themes: ["Civilisation vs savagery", "Loss of innocence", "Power and leadership", "Fear and the 'beast'"], characters: [ { name: "Ralph", description: "Elected leader who tries to maintain order." }, { name: "Jack", description: "Power-hungry rival who descends into violence." }, { name: "Piggy", description: "Voice of reason and intellect; victim of mob mentality." }, { name: "Simon", description: "Mystic who realises the beast is the boys themselves." } ], literaryDevices: [ { name: "Allegory", explanation: "Island = microcosm of society." }, { name: "Symbolism", explanation: "Conch = order; the 'beast' = inner evil." } ], essayFrameworks: [ { prompt: "Is Golding's view of human nature too pessimistic?", outline: ["Intro: argument", "Body: descent into savagery", "Body: glimmers of decency (Simon, Ralph)", "Conclusion: balanced verdict"] } ] },
  "engh-dr-1": { summaryEn: "Death of a Salesman (Miller) is a modern American tragedy about Willy Loman's failure to live up to a corrupted American Dream.", themes: ["The American Dream betrayed", "Father–son relationships", "Identity and self-deception", "Memory vs reality"], characters: [ { name: "Willy Loman", description: "Failing salesman who clings to delusion." }, { name: "Biff Loman", description: "Disillusioned eldest son trying to break free." }, { name: "Linda Loman", description: "Loyal wife who voices the play's moral centre." } ], literaryDevices: [ { name: "Expressionism", explanation: "Memory scenes blend with present action." }, { name: "Symbolism", explanation: "Stockings, seeds, Willy's cards all carry meaning." } ], essayFrameworks: [ { prompt: "Is Willy Loman a tragic hero?", outline: ["Intro: define modern tragedy", "Body: Willy's flaws and choices", "Body: dignity in Linda's defence", "Conclusion"] } ] },
  "engh-nov-5": { summaryEn: "Purple Hibiscus (Adichie) is a coming-of-age novel set in postcolonial Nigeria, exploring religious tyranny, family violence and the discovery of voice through 15-year-old Kambili.", themes: ["Religious extremism vs faith", "Domestic violence and silence", "Postcolonial identity", "Finding one's voice", "Family loyalty"], characters: [ { name: "Kambili Achike", description: "Shy 15-year-old narrator whose journey from silence to self-expression frames the novel." }, { name: "Eugene Achike (Papa)", description: "Wealthy Catholic father whose religious fanaticism masks brutal domestic abuse." }, { name: "Aunty Ifeoma", description: "Free-thinking university lecturer whose home liberates Kambili and Jaja." }, { name: "Jaja", description: "Kambili's brother whose final defiance ('I will take the blame') signals his rebellion." } ], literaryDevices: [ { name: "Symbolism", explanation: "Purple hibiscus = rare freedom; the figurine that shatters = the family's broken facade." }, { name: "First-person retrospective narration", explanation: "Adult Kambili recalls events, layering reflection over experience." } ], essayFrameworks: [ { prompt: "How does Adichie use silence and voice to develop Kambili's character?", outline: ["Intro: silence as imposed, voice as earned", "Body 1: silence at home under Papa", "Body 2: gradual voice in Nsukka with Ifeoma", "Body 3: laughter and singing as resistance", "Conclusion: voice = freedom"] } ] },
  "engh-nov-6": { summaryEn: "To Kill a Mockingbird (Lee) follows Scout Finch in 1930s Alabama as her father Atticus defends a black man falsely accused of rape, exposing entrenched racism.", themes: ["Racial injustice", "Moral education", "Loss of innocence", "Empathy and perspective", "Social class"], characters: [ { name: "Scout Finch", description: "Young narrator whose moral growth structures the novel." }, { name: "Atticus Finch", description: "Principled lawyer who defends Tom Robinson; embodies courage and integrity." }, { name: "Tom Robinson", description: "Black man wrongly convicted; the novel's mockingbird." }, { name: "Boo Radley", description: "Reclusive neighbour who saves the children; second mockingbird figure." } ], literaryDevices: [ { name: "Symbolism", explanation: "The mockingbird = innocence destroyed; the mad dog = hidden danger of racism." }, { name: "First-person narration", explanation: "Scout's child voice creates ironic distance from adult prejudice." } ], essayFrameworks: [ { prompt: "Discuss the meaning of the title To Kill a Mockingbird.", outline: ["Intro: the title's moral claim", "Body 1: Tom Robinson as mockingbird", "Body 2: Boo Radley as mockingbird", "Body 3: Atticus's lesson to Scout and Jem", "Conclusion: cruelty to the innocent is the central sin"] } ] },
  "engh-nov-7": { summaryEn: "Disgrace (Coetzee) follows disgraced Cape Town professor David Lurie to his daughter's smallholding in the Eastern Cape, where a violent attack forces a reckoning with post-apartheid South Africa.", themes: ["Post-apartheid power shifts", "Sexual politics and consent", "Shame and atonement", "Animal ethics", "Father–daughter relationships"], characters: [ { name: "David Lurie", description: "Romantic-poetry scholar whose self-justified affair triggers his fall from grace." }, { name: "Lucy Lurie", description: "David's daughter whose response to assault challenges David's worldview." }, { name: "Petrus", description: "Neighbouring farmer whose rising power embodies the post-apartheid order." } ], literaryDevices: [ { name: "Free indirect discourse", explanation: "Coetzee's narration sits inside David's consciousness while exposing its limits." }, { name: "Symbolism", explanation: "The dogs at the clinic = the costs of grace; the farm = contested South African land." } ], essayFrameworks: [ { prompt: "How does Coetzee use David Lurie to explore the meaning of 'disgrace'?", outline: ["Intro: disgrace as theme and title", "Body 1: David's professional disgrace", "Body 2: the farm attack and Lucy's response", "Body 3: the dog clinic as redemption", "Conclusion: grace earned through humility"] } ] },
  "engh-nov-8": { summaryEn: "Half of a Yellow Sun (Adichie) tracks three lives through the 1967–70 Nigerian-Biafran war, exposing colonial legacy, ethnic hatred and personal moral choices in catastrophe.", themes: ["War and its civilian cost", "Postcolonial identity", "Loyalty and betrayal", "Class and education", "The unreliability of grand narratives"], characters: [ { name: "Olanna", description: "Wealthy, idealistic woman whose romance with Odenigbo is tested by war." }, { name: "Ugwu", description: "House-boy whose education and moral journey shape the novel's voice." }, { name: "Richard", description: "British expatriate writer entwined with Olanna's family." } ], literaryDevices: [ { name: "Multi-narrator structure", explanation: "Three perspectives produce a polyphonic view of the conflict." }, { name: "Foreshadowing", explanation: "The book-within-a-book ('The Book') frames the larger narrative." } ], essayFrameworks: [ { prompt: "How does Adichie present the human cost of the Biafran war?", outline: ["Intro: war reframed through individual lives", "Body 1: Olanna's losses", "Body 2: Ugwu's compromises", "Body 3: Richard's inadequacy as outsider", "Conclusion: war's true scale is intimate"] } ] },
  "engh-nov-9": { summaryEn: "Americanah (Adichie) follows Ifemelu from Lagos to America and back, examining race, identity and the immigrant gaze on Western society.", themes: ["Race in America vs Nigeria", "Migration and return", "Hair and identity", "Romantic love across distance", "Authenticity and performance"], characters: [ { name: "Ifemelu", description: "Sharp-tongued narrator whose blog gives voice to outsider observations on race." }, { name: "Obinze", description: "Ifemelu's first love whose own diaspora story unfolds in London." }, { name: "Aunty Uju", description: "Mentor figure whose sacrifices shape Ifemelu's American expectations." } ], literaryDevices: [ { name: "Embedded blog posts", explanation: "Ifemelu's blog acts as direct social commentary inside the narrative." }, { name: "Parallel structure", explanation: "Ifemelu's American story and Obinze's UK story mirror and contrast." } ], essayFrameworks: [ { prompt: "How does Adichie use Ifemelu's hair to develop her identity?", outline: ["Intro: hair as cultural signifier", "Body 1: relaxer = assimilation", "Body 2: natural hair = self-acceptance", "Body 3: the salon as social microcosm", "Conclusion: hair traces identity arc"] } ] },
  "engh-nov-10": { summaryEn: "When Rain Clouds Gather (Bessie Head) is set in a Botswana village where exiled Makhaya finds purpose in agricultural cooperative work, exploring exile, community and renewal.", themes: ["Exile and belonging", "Tradition vs modernisation", "The dignity of labour", "Gender and power", "Healing"], characters: [ { name: "Makhaya", description: "South African political exile seeking a new life in Botswana." }, { name: "Gilbert", description: "British agricultural expert who partners with Makhaya in reform work." }, { name: "Paulina Sebeso", description: "Strong widow whose love offers Makhaya a place to belong." }, { name: "Chief Matenge", description: "Tyrannical sub-chief representing entrenched corruption." } ], literaryDevices: [ { name: "Pastoral setting", explanation: "Land and weather mirror emotional and political climate." }, { name: "Symbolism", explanation: "Rain = renewal; drought = stagnation." } ], essayFrameworks: [ { prompt: "How does Bessie Head present the link between land and identity?", outline: ["Intro: land as more than property", "Body 1: Makhaya's relationship to soil", "Body 2: Gilbert's reforms", "Body 3: Paulina's cattle post tragedy", "Conclusion: identity rooted in shared work"] } ] },
  "engh-nov-11": { summaryEn: "Tsotsi (Fugard) tracks a young Sophiatown gang leader who, after stealing a baby, is forced to confront his lost humanity over six days.", themes: ["Identity and naming", "Apartheid's social violence", "Redemption", "Memory and trauma", "The mother–child bond"], characters: [ { name: "Tsotsi (David)", description: "Hardened gang leader whose recovery of his name marks his moral awakening." }, { name: "Boston", description: "Conscience figure whose questions force Tsotsi to look inward." }, { name: "Miriam", description: "Young mother who feeds the baby and whose presence reawakens Tsotsi's empathy." } ], literaryDevices: [ { name: "Flashback", explanation: "Memories of his mother and the death of Die Aap restore Tsotsi's identity." }, { name: "Symbolism", explanation: "The baby = innocence and second chance; the ruined building = collapsed apartheid order." } ], essayFrameworks: [ { prompt: "Is Tsotsi's redemption convincing?", outline: ["Intro: redemption defined", "Body 1: triggers (Boston, the baby, Miriam)", "Body 2: gradual restoration of memory and name", "Body 3: ambiguous final scene", "Conclusion: convincing because earned, not declared"] } ] },
  "engh-nov-12": { summaryEn: "The Kite Runner (Hosseini) follows Amir's lifelong attempt to atone for betraying his Hazara friend Hassan in pre-Soviet Kabul.", themes: ["Friendship and betrayal", "Guilt and atonement", "Father–son relationships", "Class and ethnicity in Afghanistan", "Exile"], characters: [ { name: "Amir", description: "Privileged Pashtun narrator whose silent betrayal haunts his life." }, { name: "Hassan", description: "Loyal Hazara servant and friend; embodies sacrificial loyalty." }, { name: "Baba", description: "Amir's complex father whose own secret reframes the story." }, { name: "Sohrab", description: "Hassan's son whose rescue gives Amir his path to atonement." } ], literaryDevices: [ { name: "Frame narrative", explanation: "Adult Amir's call from Rahim Khan opens the retrospective story." }, { name: "Symbolism", explanation: "The kite = lost innocence and reclaimed connection." } ], essayFrameworks: [ { prompt: "Discuss how Hosseini uses Amir's journey to explore atonement.", outline: ["Intro: atonement vs apology", "Body 1: childhood betrayal", "Body 2: years of avoidance", "Body 3: rescue of Sohrab", "Conclusion: atonement is action, not words"] } ] },

  "engh-dr-3": { summaryEn: "A Raisin in the Sun (Hansberry) shows the Younger family in 1950s Chicago wrestling with dreams, pride and racism after a $10,000 insurance cheque arrives.", themes: ["Deferred dreams", "Racism and housing", "Family loyalty", "Pride and dignity", "Gender roles"], characters: [ { name: "Walter Lee Younger", description: "Frustrated chauffeur whose business dream collapses but whose final stand restores his manhood." }, { name: "Mama (Lena Younger)", description: "Matriarch whose plant symbolises her hope for the family." }, { name: "Beneatha", description: "Aspiring doctor exploring African identity." }, { name: "Ruth", description: "Walter's exhausted wife who carries the family." } ], literaryDevices: [ { name: "Symbolism", explanation: "The plant = Mama's nurturing dream; the cheque = both opportunity and curse." }, { name: "Realist dialogue", explanation: "Vernacular speech grounds the play in lived experience." } ], essayFrameworks: [ { prompt: "What does Hansberry suggest about deferred dreams?", outline: ["Intro: Hughes's poem framing the play", "Body 1: each character's deferred dream", "Body 2: Walter's collapse and recovery", "Body 3: the family's move", "Conclusion: dreams survive when carried together"] } ] },
  "engh-dr-4": { summaryEn: "The Crucible (Miller) dramatises the Salem witch trials as an allegory for McCarthyism, exposing how mass hysteria destroys reputation and life.", themes: ["Hysteria and mob justice", "Reputation and integrity", "Power and authority", "Guilt and confession", "Allegory of McCarthyism"], characters: [ { name: "John Proctor", description: "Flawed farmer whose final refusal to sign a false confession reclaims his name." }, { name: "Abigail Williams", description: "Vengeful accuser whose lies drive the trials." }, { name: "Reverend Hale", description: "Witch-hunter whose conscience reverses by the end." }, { name: "Elizabeth Proctor", description: "John's principled wife whose forgiveness frees him to die honestly." } ], literaryDevices: [ { name: "Allegory", explanation: "Salem 1692 stands in for HUAC's anti-communist hearings." }, { name: "Dramatic irony", explanation: "Audience knows accusations are false while the court does not." } ], essayFrameworks: [ { prompt: "How does Miller use The Crucible to critique mass hysteria?", outline: ["Intro: hysteria defined", "Body 1: the girls' performance in court", "Body 2: Danforth's blindness", "Body 3: Proctor's resistance", "Conclusion: hysteria collapses without truth-tellers"] } ] },
  "engh-dr-5": { summaryEn: "Hamlet (Shakespeare) is a revenge tragedy: the Danish prince delays avenging his father's murder, plunging Elsinore into corruption and death.", themes: ["Revenge and delay", "Madness real vs feigned", "Mortality and decay", "Appearance vs reality", "Corruption of the state"], characters: [ { name: "Hamlet", description: "Philosophical prince whose intellect both enables and paralyses revenge." }, { name: "Claudius", description: "Murderous uncle and king whose guilt surfaces in the play-within-the-play." }, { name: "Gertrude", description: "Hamlet's mother whose hasty remarriage triggers his disgust." }, { name: "Ophelia", description: "Polonius's daughter destroyed by Hamlet's behaviour and her father's death." } ], literaryDevices: [ { name: "Soliloquy", explanation: "'To be or not to be' lays bare Hamlet's existential paralysis." }, { name: "Play-within-a-play", explanation: "'The Mousetrap' tests Claudius's guilt." }, { name: "Imagery of disease", explanation: "'Something is rotten in the state of Denmark' anchors the moral metaphor." } ], essayFrameworks: [ { prompt: "Why does Hamlet delay his revenge?", outline: ["Intro: delay as central problem", "Body 1: doubt about the ghost", "Body 2: moral and religious conscience", "Body 3: intellectual self-questioning", "Conclusion: delay is character, not plot weakness"] } ] },
  "engh-dr-7": { summaryEn: "Blood Brothers (Russell) is a musical tragedy of twins separated at birth, raised in different classes, whose reunion ends in death — a critique of class division in Britain.", themes: ["Class and inequality", "Nature vs nurture", "Friendship and fate", "Superstition", "Maternal love"], characters: [ { name: "Mickey Johnstone", description: "Twin raised in poverty; his decline charts the costs of class." }, { name: "Edward Lyons", description: "Twin raised in privilege; his ease underlines structural unfairness." }, { name: "Mrs Johnstone", description: "Working-class mother forced to give one twin away." }, { name: "Narrator", description: "Brechtian figure whose songs frame the tragedy." } ], literaryDevices: [ { name: "Foreshadowing", explanation: "The narrator's repeated 'shoes upon the table' refrain warns of the ending." }, { name: "Parallelism", explanation: "Mickey and Edward's lives mirror and diverge by class, not by nature." } ], essayFrameworks: [ { prompt: "Is class or fate to blame for the twins' deaths?", outline: ["Intro: the play's core question", "Body 1: structural class barriers", "Body 2: superstition and the narrator", "Body 3: individual choices", "Conclusion: class operates as fate"] } ] },
  "engh-dr-8": { summaryEn: "Woza Albert! (Ngema, Mtwa, Simon) is a two-actor protest play imagining Christ's Second Coming in apartheid South Africa.", themes: ["Apartheid oppression", "Faith as resistance", "Township life", "Solidarity", "Hope and resurrection"], characters: [ { name: "Mbongeni", description: "Plays multiple township characters; his physicality drives the play." }, { name: "Percy", description: "Plays multiple white-authority figures and townspeople." }, { name: "Morena (Christ)", description: "The implied messianic figure whose return frames the action." } ], literaryDevices: [ { name: "Physical theatre", explanation: "Two actors play dozens of characters using minimal props." }, { name: "Audience address", explanation: "Direct breaking of the fourth wall draws audience into the protest." } ], essayFrameworks: [ { prompt: "How does Woza Albert! use minimalism to make a political statement?", outline: ["Intro: form mirrors content", "Body 1: minimal staging amplifies oppression", "Body 2: rapid character switches", "Body 3: graveyard finale calling on freedom fighters", "Conclusion: poverty of means, power of voice"] } ] },
  "engh-dr-9": { summaryEn: "'Master Harold'… and the Boys (Fugard) shows young Hally's racist outburst against Sam in 1950s Port Elizabeth, exposing apartheid's seepage into intimate relationships.", themes: ["Racism and friendship", "Father–son legacy", "Dignity in everyday life", "The dance as utopia", "Apartheid's micro-violence"], characters: [ { name: "Hally", description: "Seventeen-year-old white boy whose anger at his father is misdirected at Sam." }, { name: "Sam", description: "Black waiter and lifelong father-figure to Hally; embodies dignity and patience." }, { name: "Willie", description: "Sam's friend, also a waiter; preparing for a ballroom-dancing competition." } ], literaryDevices: [ { name: "Symbolism", explanation: "The ballroom dance = a 'world without collisions'; the kite = lost innocence." }, { name: "Dramatic irony", explanation: "Sam's tenderness contrasts with Hally's cruelty." } ], essayFrameworks: [ { prompt: "How does Fugard use the dance to symbolise an alternative to apartheid?", outline: ["Intro: the dance as metaphor", "Body 1: Sam's vision of harmony", "Body 2: Hally's failure to share it", "Body 3: spit-on-the-face climax breaks the dance", "Conclusion: utopia glimpsed and lost"] } ] },
  "engh-dr-10": { summaryEn: "The Road (Soyinka) is a metaphysical Nigerian play set among lorry drivers, exploring the search for the Word and the meaning of life and death.", themes: ["Death and the Word", "Postcolonial Nigeria", "Mysticism and ritual", "Class and exploitation", "Performance and identity"], characters: [ { name: "Professor", description: "Eccentric ex-clergyman seeking the metaphysical 'Word' in road accidents." }, { name: "Murano", description: "Mute palm-wine tapper whose presence invokes the god Ogun." }, { name: "Samson, Salubi, Kotonu", description: "Drivers and touts whose lives revolve around the deadly road." } ], literaryDevices: [ { name: "Ritual elements", explanation: "Yoruba ritual structures shape the play's climax." }, { name: "Symbolism", explanation: "The road = both livelihood and death; the mask = passage between worlds." } ], essayFrameworks: [ { prompt: "How does Soyinka blend Yoruba ritual with social critique?", outline: ["Intro: form merges myth and modernity", "Body 1: the Professor's quest", "Body 2: Murano as embodiment of Ogun", "Body 3: economic precarity of drivers", "Conclusion: ritual frames a real social wound"] } ] },

  // Afrikaans Home Language set works
  "afrh-nov-1": { summaryEn: "Fiela se Kind by Dalene Matthee explores identity, race and belonging between the Knysna forest and the Karoo plains in 19th-century South Africa.", summaryAf: "Fiela se Kind deur Dalene Matthee verken identiteit, ras en behoort tussen die Knysna-bos en die Karoo-vlaktes in die 19de-eeuse Suid-Afrika.", themes: ["Identiteit en behoort", "Ras en die voorlopers van apartheid", "Moederliefde", "Mens en natuur", "Bevoegdheid van die staat"], characters: [ { name: "Benjamin / Lukas van Rooyen", description: "Die seun wat tussen twee families en twee identiteite vasgevang is." }, { name: "Fiela Komoetie", description: "Die sterk Kleurling-pleegmoeder wie se onvoorwaardelike liefde die roman dryf." }, { name: "Elias van Rooyen", description: "Die biologiese vader wie se gierigheid en koppigheid Benjamin onderdruk." }, { name: "Selling Komoetie", description: "Fiela se sagmoedige man wat die balans in die huishouding bewaar." } ], literaryDevices: [ { name: "Simboliek", explanation: "Die bos = wildernis en versteekte waarhede; die Lange Kloof = afgeslote tradisie." }, { name: "Karakterisering deur kontras", explanation: "Fiela se warmte teenoor die Van Rooyens se hardheid." }, { name: "Tweetaligheid", explanation: "Wisseling tussen Afrikaans en Engels weerspieël magsverhoudings." } ], essayFrameworks: [ { prompt: "Bespreek hoe Matthee identiteit en behoort in Fiela se Kind ontwikkel.", outline: ["Inleiding: identiteit as kernvraag", "Middel: Benjamin se innerlike konflik", "Middel: Fiela vs Elias as alternatiewe ouers", "Slot: behoort gedefinieer deur liefde, nie ras nie"] } ] },
  "afrh-nov-2": { summaryEn: "Kringe in 'n Bos (Matthee) follows woodcutter Saul Barnard's relationship with the Knysna forest and the elephants, exploring environmental and social loss.", summaryAf: "Kringe in 'n Bos (Matthee) volg houtkapper Saul Barnard se verhouding met die Knysna-bos en die olifante, en verken omgewings- en sosiale verlies.", themes: ["Mens en omgewing", "Klassekonflik", "Liefde en verlies", "Tradisie vs verandering", "Geheime van die bos"], characters: [ { name: "Saul Barnard", description: "Idealistiese houtkapper wat die bos beter verstaan as die meeste mense." }, { name: "Kate Fourcade", description: "Engelse vrou wat Saul se wêreld uitdaag en sy hart wen." }, { name: "Old Foot", description: "Die wyse olifant wat die siel van die bos verteenwoordig." } ], literaryDevices: [ { name: "Personifikasie", explanation: "Die bos en olifante kry menslike eienskappe." }, { name: "Simboliek", explanation: "Die olifant = bedreigde wysheid; die kringe = tyd, herinnering en verlies." } ], essayFrameworks: [ { prompt: "Hoe gebruik Matthee die bos om verlies te ondersoek?", outline: ["Inleiding: bos as karakter", "Middel: ekonomiese uitbuiting", "Middel: Saul en Kate se romanse", "Slot: kringe wat afsluit"] } ] },
  "afrh-nov-5": { summaryEn: "Roepman (Jan van Tonder) tells of a 1960s Durban family's tragedy through the eyes of young Timus, layering politics, religion and family secrets.", summaryAf: "Roepman (Jan van Tonder) vertel van 'n 1960's Durban-gesin se tragedie deur die oë van die jong Timus, met politiek, godsdiens en familie-geheime.", themes: ["Verlies en rou", "Geloof en twyfel", "Familie-geheime", "Apartheid se erfenis", "Onskuld en kinderjare"], characters: [ { name: "Timus", description: "Jong verteller wie se onskuld geleidelik verlore gaan." }, { name: "Braam", description: "Ouer broer wie se dood die roman se as is." }, { name: "Pa en Ma", description: "Ouers wie se huwelik onder die druk van verlies kraak." } ], literaryDevices: [ { name: "Eerstepersoonsvertelling", explanation: "Timus se kinderstem skep ironie en pathos." }, { name: "Simboliek", explanation: "Die roepman = goddelike roeping en mensliker bestemming." } ], essayFrameworks: [ { prompt: "Hoe verken van Tonder geloof in Roepman?", outline: ["Inleiding: geloof as raamwerk", "Middel: Pa se geloofskrisis", "Middel: Ma se vasklou aan tradisie", "Slot: Timus se eie wording"] } ] },
  "afrh-dr-1": { summaryEn: "Ons vir Jou (Reza de Wet) is an absurdist Afrikaans drama exploring guilt, family secrets and the legacy of the past.", summaryAf: "Ons vir Jou (Reza de Wet) is 'n absurdistiese Afrikaanse drama wat skuld, familie-geheime en die nalatenskap van die verlede ondersoek.", themes: ["Skuld en geheime", "Familie en mag", "Tradisie vs vernuwing", "Magiese realisme", "Identiteit"], characters: [ { name: "Die hoofkarakters", description: "Familielede wie se interaksies die verswee verlede oopvlek." }, { name: "Die buitestander", description: "Karakter wie se aankoms die familie-orde versteur." } ], literaryDevices: [ { name: "Absurdisme", explanation: "Surreale gebeure ontwrig die naturalisme." }, { name: "Simboliek", explanation: "Voorwerpe en herhaalde aksies dra metaforiese gewig." } ], essayFrameworks: [ { prompt: "Hoe gebruik De Wet absurde elemente om die verlede uit te daag?", outline: ["Inleiding: absurdisme as kritiek", "Middel: surreale gebeure as metafoor", "Middel: dialoog as ontmaskering", "Slot: katarsis of stilte"] } ] },
  "afrh-dr-6": { summaryEn: "Kaburu (Deon Opperman) is an Afrikaans drama about a Boer family and their farm at a moment of political reckoning, examining identity, land and legacy.", summaryAf: "Kaburu (Deon Opperman) is 'n Afrikaanse drama oor 'n Boere-gesin en hul plaas op 'n oomblik van politieke afrekening, wat identiteit, grond en nalatenskap ondersoek.", themes: ["Grond en identiteit", "Familie-konflik", "Politieke verandering", "Generasie­botsing", "Trots en verlies"], characters: [ { name: "Die Patriarg", description: "Die ouer geslag wie se grondtrots botsings veroorsaak." }, { name: "Die seuns", description: "Hulle verteenwoordig botsende toekoms-visies vir die plaas." }, { name: "Die plaaswerkers", description: "Hul stem skuif die magsbalans op die toneel." } ], literaryDevices: [ { name: "Realisme", explanation: "Tipiese plaastoneel met natuurlike dialoog." }, { name: "Simboliek", explanation: "Die plaas = identiteit, geheue en stryd om voortbestaan." } ], essayFrameworks: [ { prompt: "Bespreek hoe Opperman grond as 'n simbool van identiteit gebruik.", outline: ["Inleiding: grond meer as eiendom", "Middel: konflik tussen ouer en jonger geslag", "Middel: stem van plaaswerkers", "Slot: identiteit moet aanpas"] } ] },
};

function libraryKeyForWork(litId: string): string {
  return litId; // direct map
}

// Rich generic content by work_type — keeps every literature note non-stub
// even before a school confirms its specific set work. Used as the fallback
// when LITERATURE_NOTE_LIBRARY has no curated entry for an externalId.
type GenericPayload = {
  summary: string;
  themes: string[];
  characters: LitChar[];
  literaryDevices: LitDevice[];
  essayFrameworks: LitFramework[];
};

function buildGenericLitContent(title: string, author: string, workType: string, lang: "en" | "af"): GenericPayload {
  const t = workType;
  const en: Record<string, GenericPayload> = {
    novel: {
      summary: `${title} by ${author} is a prescribed Grade 12 novel. Strong answers track plot stages, character growth, the central conflict, the narrator's reliability and the way setting shapes meaning. Use the framework cards below to plan literary essays under exam conditions.`,
      themes: ["Identity and self-discovery", "Power and conflict", "Family and belonging", "Time, memory and consequence", "Society, class and prejudice"],
      characters: [
        { name: "Protagonist", description: `Trace the protagonist of ${title} from opening to resolution: what do they want, what stops them, and what changes by the end?` },
        { name: "Antagonist / opposing force", description: "Identify who or what stands in the protagonist's way — a person, a system, or an inner flaw." },
        { name: "Foil / supporting voice", description: "Map the foil character whose contrast sharpens our understanding of the protagonist." },
        { name: "Confidant / narrator stance", description: "Decide who carries information for the reader, and whose perspective shapes our judgement." },
      ],
      literaryDevices: [
        { name: "Symbolism", explanation: "Identify 2–3 recurring objects or images and what they accumulate in meaning." },
        { name: "Narrative voice", explanation: "First-person vs third-person, reliable vs unreliable — name how this controls reader sympathy." },
        { name: "Setting", explanation: "Time and place act as pressure on the characters; quote a passage where setting drives a decision." },
        { name: "Foreshadowing & motif", explanation: "Hunt for early hints that pay off later, and motifs that bind chapters together." },
      ],
      essayFrameworks: [
        { prompt: `Discuss how the protagonist of ${title} changes from beginning to end.`, outline: ["Intro: thesis on the change", "Body 1: opening state and key wants", "Body 2: turning point(s)", "Body 3: end state and what made the change real", "Conclusion: what the change tells us about the novel's theme"] },
        { prompt: `How does the setting of ${title} shape the central conflict?`, outline: ["Intro: setting as pressure", "Body 1: physical landscape and constraints", "Body 2: social/historical context", "Body 3: setting at the climax", "Conclusion: meaning produced by place"] },
      ],
    },
    drama: {
      summary: `${title} by ${author} is a prescribed Grade 12 drama. Strong answers think in scenes: who enters, what they want, what shifts the power on stage, and how stage directions, dialogue and silences create meaning under performance conditions.`,
      themes: ["Power and authority", "Conflict (internal and external)", "Identity and choice", "Family and loyalty", "Society, class and politics"],
      characters: [
        { name: "Protagonist", description: `Track the central figure of ${title}: their objective, the obstacle, and the cost of pursuing it.` },
        { name: "Antagonist", description: "Note who or what blocks the protagonist; in modern drama this is often a system or inner flaw." },
        { name: "Foil character", description: "Find the character whose contrast lights up the protagonist's choices." },
        { name: "Chorus / commentator", description: "Note any narrator, chorus or knowing minor character whose lines guide the audience's reading." },
      ],
      literaryDevices: [
        { name: "Stage directions", explanation: "Read the parentheticals — props, lighting and silence carry as much meaning as dialogue." },
        { name: "Dramatic irony", explanation: "Spot moments where the audience knows more than a character on stage." },
        { name: "Soliloquy / aside", explanation: "Use these as windows into a character's interior thinking." },
        { name: "Symbolism", explanation: "Identify recurring stage objects or motifs that gain meaning across scenes." },
      ],
      essayFrameworks: [
        { prompt: `How does ${author} use stagecraft to develop the central conflict in ${title}?`, outline: ["Intro: stagecraft defined", "Body 1: a key entrance/exit", "Body 2: a key prop or stage direction", "Body 3: the climactic scene", "Conclusion: meaning carried by performance"] },
        { prompt: `Discuss the most important relationship in ${title} and how it shapes the play.`, outline: ["Intro: name the relationship", "Body 1: how it begins", "Body 2: pressure points", "Body 3: where it lands by the final scene", "Conclusion: what the relationship reveals about theme"] },
      ],
    },
    poetry: {
      summary: `${title} is a prescribed Grade 12 poetry collection. Approach each poem in three passes: first the literal meaning, then the form (lineation, rhyme, stanza), then the figurative layer (imagery, tone, theme). The frameworks below work for any contextual or comparison question.`,
      themes: ["Identity and voice", "Nature and place", "Love, loss and memory", "Politics and protest", "Language itself as subject"],
      characters: [
        { name: "Speaker", description: "In every poem, ask: who is speaking, to whom, and from what mood or position?" },
        { name: "Addressee", description: "Many poems are aimed at someone — a lover, a country, the dead, the reader. Naming this changes the meaning." },
        { name: "Implied audience", description: "Identify the wider audience the poem assumes — political, intimate, communal — and how that shapes register." },
      ],
      literaryDevices: [
        { name: "Form", explanation: "Sonnet, ballad, free verse, ode — each form sets expectations and can be obeyed or broken for meaning." },
        { name: "Sound devices", explanation: "Alliteration, assonance, onomatopoeia and rhyme do emotional work — quote and explain the effect." },
        { name: "Imagery & figurative language", explanation: "Metaphor, simile, personification — identify the vehicle, the tenor and what's being compared to what." },
        { name: "Tone shifts", explanation: "Mark the volta or pivot where mood changes; explain what causes the shift." },
      ],
      essayFrameworks: [
        { prompt: `Choose a poem from ${title} and discuss how form and content work together.`, outline: ["Intro: poem chosen + thesis", "Body 1: what the poem says (literal)", "Body 2: how the form (rhyme/lineation/stanza) shapes the meaning", "Body 3: imagery and tone", "Conclusion: form serves meaning"] },
        { prompt: `Compare two poems from ${title} that handle the same theme differently.`, outline: ["Intro: name the theme", "Body 1: poem A's approach", "Body 2: poem B's approach", "Body 3: what the contrast tells us about the theme", "Conclusion: synthesis"] },
      ],
    },
    short_stories: {
      summary: `${title} is a prescribed Grade 12 short-story collection. The genre rewards compression: one decisive moment, one revealing perspective, one strong ending. The frameworks below help you write contextual answers and longer literary essays on any story in the anthology.`,
      themes: ["Decisive moments and turning points", "Identity and self-knowledge", "Family, community and belonging", "Loss, regret and memory", "Power and injustice"],
      characters: [
        { name: "Protagonist", description: "Identify the central figure and the single decision or revelation that defines the story." },
        { name: "Foil / catalyst", description: "Spot the secondary character whose presence forces the protagonist's change." },
        { name: "Narrator / point of view", description: "First-person, third-limited or omniscient — name the angle and what it hides or reveals." },
      ],
      literaryDevices: [
        { name: "Single effect", explanation: "Short stories aim at one dominant impression — name it and trace how every paragraph contributes." },
        { name: "Setting", explanation: "Often acts as character; a brief landscape can carry the story's mood." },
        { name: "Symbolism & motif", explanation: "Recurring objects compress meaning the novel form would explore over chapters." },
        { name: "Twist or open ending", explanation: "Name the type of ending and explain what it asks the reader to do." },
      ],
      essayFrameworks: [
        { prompt: `Choose a story from ${title} and discuss the moment that changes the protagonist.`, outline: ["Intro: story + central change", "Body 1: opening situation", "Body 2: the decisive moment", "Body 3: aftermath and ending", "Conclusion: what the story argues"] },
        { prompt: `How does setting create meaning in two stories from ${title}?`, outline: ["Intro: setting as character", "Body 1: story A's setting", "Body 2: story B's setting", "Body 3: comparison", "Conclusion: synthesis"] },
      ],
    },
  };
  const af: Record<string, GenericPayload> = {
    novel: {
      summary: `${title} deur ${author} is 'n voorgeskrewe graad 12 roman. Sterk antwoorde volg die intrige, karakterontwikkeling, sentrale konflik, die vertroubaarheid van die verteller en hoe ruimte betekenis vorm. Gebruik die raamwerkkaarte hieronder om letterkundige opstelle onder eksamenomstandighede te beplan.`,
      themes: ["Identiteit en selfontdekking", "Mag en konflik", "Familie en behoort", "Tyd, herinnering en gevolg", "Samelewing, klas en vooroordeel"],
      characters: [
        { name: "Hoofkarakter", description: `Volg die hoofkarakter van ${title} van opening tot slot: wat wil hulle hê, wat keer hulle, en wat verander teen die einde?` },
        { name: "Teenstander / opponerende mag", description: "Identifiseer wie of wat die hoofkarakter se pad versper — 'n persoon, 'n stelsel, of 'n innerlike fout." },
        { name: "Karakter-kontras / nevenstem", description: "Karteer die karakter wie se kontras ons begrip van die hoofkarakter skerper maak." },
        { name: "Vertroueling / vertelhoek", description: "Besluit wie inligting vir die leser dra, en wie se perspektief ons oordeel vorm." },
      ],
      literaryDevices: [
        { name: "Simboliek", explanation: "Identifiseer 2–3 herhalende voorwerpe of beelde en wat hulle aan betekenis opbou." },
        { name: "Vertelstem", explanation: "Eerstepersoon vs derdepersoon, betroubaar vs onbetroubaar — noem hoe dit lesersympatie beheer." },
        { name: "Ruimte", explanation: "Tyd en plek werk as druk op die karakters; haal 'n teksgedeelte aan waar die ruimte 'n besluit dryf." },
        { name: "Vooruitwysing & motief", explanation: "Soek vroeë wenke wat later afbetaal, en motiewe wat hoofstukke saambind." },
      ],
      essayFrameworks: [
        { prompt: `Bespreek hoe die hoofkarakter van ${title} verander van begin tot einde.`, outline: ["Inleiding: tese oor die verandering", "Paragraaf 1: openingstoestand en sleuteldoelwitte", "Paragraaf 2: keerpunt(e)", "Paragraaf 3: eindtoestand en wat die verandering eg gemaak het", "Slot: wat die verandering oor die roman se tema sê"] },
        { prompt: `Hoe vorm die ruimte van ${title} die sentrale konflik?`, outline: ["Inleiding: ruimte as druk", "Paragraaf 1: fisiese landskap en beperkings", "Paragraaf 2: sosiale/historiese konteks", "Paragraaf 3: ruimte by die klimaks", "Slot: betekenis wat deur plek geskep word"] },
      ],
    },
    drama: {
      summary: `${title} deur ${author} is 'n voorgeskrewe graad 12 drama. Sterk antwoorde dink in tonele: wie kom op, wat wil hulle hê, hoe verskuif die mag op die verhoog, en hoe skep toneelaanwysings, dialoog en stiltes betekenis tydens 'n opvoering.`,
      themes: ["Mag en gesag", "Konflik (innerlik en uiterlik)", "Identiteit en keuse", "Familie en lojaliteit", "Samelewing, klas en politiek"],
      characters: [
        { name: "Hoofkarakter", description: `Volg die sentrale figuur van ${title}: hul doelwit, die hindernis, en die koste van die nastrewing daarvan.` },
        { name: "Teenstander", description: "Let op wie of wat die hoofkarakter blokkeer; in moderne drama is dit dikwels 'n stelsel of innerlike fout." },
        { name: "Kontras-karakter", description: "Vind die karakter wie se kontras die hoofkarakter se keuses verlig." },
        { name: "Koor / kommentator", description: "Let op enige verteller, koor of bewuste byrolspeler wie se woorde die gehoor se lesing rig." },
      ],
      literaryDevices: [
        { name: "Toneelaanwysings", explanation: "Lees die hakies — rekwisiete, beligting en stilte dra net soveel betekenis as dialoog." },
        { name: "Dramatiese ironie", explanation: "Spoor oomblikke op waar die gehoor meer weet as 'n karakter op die verhoog." },
        { name: "Alleenspraak / tersydepraat", explanation: "Gebruik dié as vensters op 'n karakter se innerlike denke." },
        { name: "Simboliek", explanation: "Identifiseer herhalende verhoog-voorwerpe of motiewe wat tonele oorbrug." },
      ],
      essayFrameworks: [
        { prompt: `Hoe gebruik ${author} verhoog-tegnieke om die sentrale konflik in ${title} te ontwikkel?`, outline: ["Inleiding: definieer verhoog-tegnieke", "Paragraaf 1: 'n sleutel-opkoms/afgang", "Paragraaf 2: 'n sleutel-rekwisiet of toneelaanwysing", "Paragraaf 3: die klimaktiese toneel", "Slot: betekenis wat deur opvoering gedra word"] },
        { prompt: `Bespreek die belangrikste verhouding in ${title} en hoe dit die toneelstuk vorm.`, outline: ["Inleiding: noem die verhouding", "Paragraaf 1: hoe dit begin", "Paragraaf 2: drukpunte", "Paragraaf 3: waar dit teen die slot land", "Slot: wat die verhouding oor tema onthul"] },
      ],
    },
    poetry: {
      summary: `${title} is 'n voorgeskrewe graad 12 poësie-versameling. Benader elke gedig in drie lese: eers die letterlike betekenis, dan die vorm (reëls, rym, strofe), dan die figuurlike laag (beelde, toon, tema). Die raamwerke hieronder werk vir enige kontekstuele of vergelykende vraag.`,
      themes: ["Identiteit en stem", "Natuur en plek", "Liefde, verlies en herinnering", "Politiek en protes", "Taal as onderwerp"],
      characters: [
        { name: "Spreker", description: "In elke gedig, vra: wie praat, met wie, en uit watter stemming of posisie?" },
        { name: "Aangesprokene", description: "Baie gedigte is gerig op iemand — 'n geliefde, 'n land, die dooies, die leser. Om dit te benoem verander die betekenis." },
        { name: "Gehoor (geïmpliseer)", description: "Identifiseer die wyer gehoor wat die gedig veronderstel — polities, intiem, gemeenskaplik — en hoe dit register vorm." },
      ],
      literaryDevices: [
        { name: "Vorm", explanation: "Sonnet, ballade, vrye vers, ode — elke vorm skep verwagtinge en kan gehoorsaam of gebreek word vir betekenis." },
        { name: "Klanktegnieke", explanation: "Alliterasie, assonansie, onomatopee en rym doen emosionele werk — haal aan en verduidelik die effek." },
        { name: "Beelde & figuurlike taal", explanation: "Metafoor, vergelyking, personifikasie — identifiseer die voertuig, die strekking en wat met wat vergelyk word." },
        { name: "Toonverskuiwings", explanation: "Merk die volta of swaai waar stemming verander; verduidelik wat die verskuiwing veroorsaak." },
      ],
      essayFrameworks: [
        { prompt: `Kies 'n gedig uit ${title} en bespreek hoe vorm en inhoud saamwerk.`, outline: ["Inleiding: gekose gedig + tese", "Paragraaf 1: wat die gedig sê (letterlik)", "Paragraaf 2: hoe die vorm (rym/reëls/strofe) die betekenis vorm", "Paragraaf 3: beelde en toon", "Slot: vorm dien betekenis"] },
        { prompt: `Vergelyk twee gedigte uit ${title} wat dieselfde tema verskillend hanteer.`, outline: ["Inleiding: noem die tema", "Paragraaf 1: gedig A se benadering", "Paragraaf 2: gedig B se benadering", "Paragraaf 3: wat die kontras oor die tema sê", "Slot: sintese"] },
      ],
    },
    short_stories: {
      summary: `${title} is 'n voorgeskrewe graad 12 kortverhaal-versameling. Die genre beloon saampersing: een beslissende oomblik, een onthullende perspektief, een sterk slot. Die raamwerke hieronder help jou om kontekstuele antwoorde en langer letterkundige opstelle oor enige verhaal in die antologie te skryf.`,
      themes: ["Beslissende oomblikke en keerpunte", "Identiteit en selfkennis", "Familie, gemeenskap en behoort", "Verlies, spyt en herinnering", "Mag en onreg"],
      characters: [
        { name: "Hoofkarakter", description: "Identifiseer die sentrale figuur en die enkele besluit of openbaring wat die verhaal omskryf." },
        { name: "Kontras / katalisator", description: "Spoor die sekondêre karakter op wie se teenwoordigheid die hoofkarakter se verandering forseer." },
        { name: "Verteller / vertelhoek", description: "Eerstepersoon, derdepersoon-beperk of alwetend — noem die hoek en wat dit verberg of openbaar." },
      ],
      literaryDevices: [
        { name: "Enkele effek", explanation: "Kortverhale mik na een dominante indruk — noem dit en volg hoe elke paragraaf bydra." },
        { name: "Ruimte", explanation: "Werk dikwels as karakter; 'n kort landskap kan die verhaal se stemming dra." },
        { name: "Simboliek & motief", explanation: "Herhalende voorwerpe pers betekenis saam wat 'n roman oor hoofstukke sou ontwikkel." },
        { name: "Wending of oop slot", explanation: "Noem die tipe slot en verduidelik wat dit van die leser vra." },
      ],
      essayFrameworks: [
        { prompt: `Kies 'n verhaal uit ${title} en bespreek die oomblik wat die hoofkarakter verander.`, outline: ["Inleiding: verhaal + sentrale verandering", "Paragraaf 1: openingsituasie", "Paragraaf 2: die beslissende oomblik", "Paragraaf 3: nasleep en slot", "Slot: wat die verhaal aanvoer"] },
        { prompt: `Hoe skep ruimte betekenis in twee verhale uit ${title}?`, outline: ["Inleiding: ruimte as karakter", "Paragraaf 1: verhaal A se ruimte", "Paragraaf 2: verhaal B se ruimte", "Paragraaf 3: vergelyking", "Slot: sintese"] },
      ],
    },
  };
  const set = lang === "af" ? af : en;
  return set[t] ?? set.novel;
}

// =============================================================================
// MAIN
// =============================================================================

// --dry-run: print what would be written without touching the DB.
const DRY_RUN = process.argv.includes("--dry-run");
if (DRY_RUN) console.log("[dry-run] No writes will be performed.\n");

async function upsertNotes(topicId: number, lang: "en" | "af", c: TopicContent) {
  const summary = lang === "en" ? c.summaryEn : c.summaryAf;
  const concepts = lang === "en" ? c.conceptsEn : c.conceptsAf;
  const example = lang === "en" ? c.exampleEn : c.exampleAf;
  // Prefer the richer workedExamples arrays (with steps + commonErrors) when present.
  // Fall back to the legacy single example for backward-compatible topics.
  const richExamples = lang === "en" ? c.workedExamplesEn : c.workedExamplesAf;
  const workedExamples: unknown[] = richExamples && richExamples.length > 0
    ? richExamples
    : example ? [example] : [];
  const diagrams = (lang === "en" ? c.diagramsEn : c.diagramsAf) ?? null;

  if (DRY_RUN) {
    const [existing] = await db
      .select({ source: topicNotes.source })
      .from(topicNotes)
      .where(and(eq(topicNotes.topicId, topicId), eq(topicNotes.language, lang)))
      .limit(1);
    if (existing?.source === "admin") {
      console.log(`  [dry-run] SKIP   topic_notes topicId=${topicId} lang=${lang} — admin-edited row preserved`);
    } else if (existing) {
      console.log(`  [dry-run] UPDATE topic_notes topicId=${topicId} lang=${lang} (current source=${existing.source})`);
    } else {
      console.log(`  [dry-run] INSERT topic_notes topicId=${topicId} lang=${lang}`);
    }
    return;
  }

  await db.insert(topicNotes).values({
    topicId,
    language: lang,
    summary,
    keyConcepts: concepts,
    workedExamples,
    diagrams,
    source: "caps_seed_v1",
  }).onConflictDoUpdate({
    target: [topicNotes.topicId, topicNotes.language],
    set: {
      summary,
      keyConcepts: concepts,
      workedExamples,
      diagrams,
      source: "caps_seed_v1",
      updatedAt: new Date(),
    },
    setWhere: sql`${topicNotes.source} != 'admin'`,
  });
}

async function seedTopicNotesForSubject(subjectCode: string, subjectId: number) {
  const capsTopics = CAPS_TOPICS[subjectCode] ?? [];
  let inserted = 0;
  for (const ct of capsTopics) {
    const content = TOPIC_CONTENT[ct.capsCode];
    if (!content) continue;
    const [topic] = await db.select().from(topics)
      .where(and(eq(topics.subjectId, subjectId), eq(topics.capsCode, ct.capsCode))).limit(1);
    if (!topic) continue;
    await upsertNotes(topic.id, "en", content);
    await upsertNotes(topic.id, "af", content);
    inserted++;
  }
  return inserted;
}

const MIN_CARDS_PER_TOPIC = 10;

// Build a deterministic padding deck of at least MIN_CARDS_PER_TOPIC cards
// for a single (topic, language) pair. Combines: any pre-existing cards +
// per-concept recall + worked-example variations + reverse-direction cards
// + summary-derived recall. All cards are flagged `source = "caps_seed_v1"`.
function buildPaddedDeck(opts: {
  existing: { front: string; back: string; cardType: string }[];
  topicName: string;
  isAf: boolean;
  content?: TopicContent;
}): { front: string; back: string; cardType: string }[] {
  const { existing, topicName, isAf, content } = opts;
  const deck = existing.slice();
  const seen = new Set(deck.map(c => `${c.front}||${c.back}`));
  const push = (front: string, back: string, cardType: string = "concept") => {
    const key = `${front}||${back}`;
    if (seen.has(key)) return;
    seen.add(key);
    deck.push({ front, back, cardType });
  };

  const concepts = content ? (isAf ? content.conceptsAf : content.conceptsEn) : [];
  const summary = content ? (isAf ? content.summaryAf : content.summaryEn) : "";
  const example = content ? (isAf ? content.exampleAf : content.exampleEn) : undefined;

  // 1) one card per key concept
  concepts.forEach((c, i) => {
    push(
      isAf ? `Sleutelkonsep ${i + 1} — ${topicName}` : `Key concept ${i + 1} — ${topicName}`,
      c,
    );
  });
  // 2) reverse cards (back → front)
  concepts.forEach((c, i) => {
    push(
      isAf ? `Watter konsep beskryf: "${c}"?` : `Which concept describes: "${c}"?`,
      isAf ? `Konsep ${i + 1} van ${topicName}.` : `Concept ${i + 1} of ${topicName}.`,
      "reversed",
    );
  });
  // 3) worked example as Q/A
  if (example) {
    push(example.question, example.solution, "concept");
    push(
      isAf ? `Wat is die strategie om hierdie te benader: "${example.question}"?` : `What is the strategy to approach: "${example.question}"?`,
      example.solution.split(/[.!?]/)[0] || example.solution,
      "concept",
    );
  }
  // 4) summary-derived recall: split into sentences and use as cloze-style cards
  if (summary) {
    const sentences = summary.split(/(?<=[.!?])\s+/).filter(s => s.length > 18);
    sentences.forEach((s, i) => {
      // cloze: blank out the most informative noun-ish word (longest word)
      const words = s.split(/\s+/);
      const target = [...words].sort((a, b) => b.length - a.length)[0]?.replace(/[^A-Za-zÀ-ÿ-]/g, "") || "";
      if (target.length >= 4) {
        let blanked = s;
        try {
          blanked = s.replace(new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "______");
        } catch {
          // Malformed pattern — skip the cloze blank, keep original sentence
        }
        push(blanked, target, "cloze");
      }
      push(
        isAf ? `Vertel in jou eie woorde: deel ${i + 1}` : `Recall in your own words: part ${i + 1}`,
        s,
        "concept",
      );
    });
  }
  // 5) generic "what is" + "why does it matter"
  push(
    isAf ? `Wat is ${topicName}?` : `What is ${topicName}?`,
    summary || (isAf ? `'n KABV-onderwerp in graad 12.` : `A Grade 12 CAPS topic.`),
  );
  push(
    isAf ? `Hoekom is ${topicName} belangrik in die NSC-eksamen?` : `Why does ${topicName} matter in the NSC exam?`,
    isAf
      ? `Dit verskyn herhaaldelik in die afgelope 10 jaar se vraestelle en dra wesenlike merke by.`
      : `It appears repeatedly across the past 10 years of papers and contributes meaningful marks.`,
  );
  // 6) final filler — variations of the last concept until we hit the floor
  let pad = 0;
  while (deck.length < MIN_CARDS_PER_TOPIC) {
    const c = concepts[pad % Math.max(1, concepts.length)] || (isAf ? "Hersien jou KABV-notas" : "Review your CAPS notes");
    push(
      isAf ? `Hersieningsvraag ${pad + 1}: ${topicName}` : `Recall question ${pad + 1}: ${topicName}`,
      c,
    );
    pad++;
    if (pad > 50) break; // safety
  }
  return deck;
}

async function seedTopicFlashcardsForSubject(subjectCode: string, subjectId: number) {
  const allCards = FLASHCARD_DECKS.filter(c => c.subjectCode === subjectCode);
  const subjectTopics = await db.select().from(topics).where(eq(topics.subjectId, subjectId));
  const byCaps = new Map(subjectTopics.map(t => [t.capsCode, t]));
  // Wipe existing seeded cards for this subject's topics so re-runs stay idempotent.
  // The delete intentionally targets only source="caps_seed_v1" — admin-edited cards
  // (source="admin") are left untouched.
  const topicIds = subjectTopics.map(t => t.id);
  if (!DRY_RUN && topicIds.length > 0) {
    await db.delete(topicFlashcards)
      .where(and(inArray(topicFlashcards.topicId, topicIds), eq(topicFlashcards.source, "caps_seed_v1")));
  }
  let count = 0;
  // Group static cards by topicCode (these are EN-only legacy decks)
  const byTopicCode = new Map<string, typeof allCards>();
  for (const card of allCards) {
    if (!byTopicCode.has(card.topicCode)) byTopicCode.set(card.topicCode, []);
    byTopicCode.get(card.topicCode)!.push(card);
  }

  for (const t of subjectTopics) {
    const content = TOPIC_CONTENT[t.capsCode ?? ""];
    const staticCards = byTopicCode.get(t.capsCode ?? "") ?? [];
    const topicNameEn = t.name;
    const topicNameAf = t.nameAfrikaans || t.name;

    // Skip topics that have no curated content AND no static cards (still pad
    // when we have at least one — keeps the surface honest).
    if (staticCards.length === 0 && !content) continue;

    // EN deck
    const enExisting = staticCards.map(c => ({
      front: c.front,
      back: c.back,
      cardType: c.type === "cloze" ? "cloze" : c.type === "reversed" ? "reversed" : "concept",
    }));
    const enDeck = buildPaddedDeck({ existing: enExisting, topicName: topicNameEn, isAf: false, content });
    const enRows = enDeck.map((c, idx) => ({
      topicId: t.id, language: "en" as const,
      front: c.front, back: c.back, cardType: c.cardType,
      orderIndex: idx, source: "caps_seed_v1",
    }));
    if (enRows.length > 0) {
      if (DRY_RUN) {
        console.log(`  [dry-run] WOULD INSERT ${enRows.length} EN flashcards for topicId=${t.id} (${t.capsCode})`);
      } else {
        await db.insert(topicFlashcards).values(enRows);
      }
      count += enRows.length;
    }

    // AF deck — derived purely from curated AF content (no static AF source).
    const afDeck = buildPaddedDeck({ existing: [], topicName: topicNameAf, isAf: true, content });
    const afRows = afDeck.map((c, idx) => ({
      topicId: t.id, language: "af" as const,
      front: c.front, back: c.back, cardType: c.cardType,
      orderIndex: idx, source: "caps_seed_v1",
    }));
    if (afRows.length > 0) {
      if (DRY_RUN) {
        console.log(`  [dry-run] WOULD INSERT ${afRows.length} AF flashcards for topicId=${t.id} (${t.capsCode})`);
      } else {
        await db.insert(topicFlashcards).values(afRows);
      }
      count += afRows.length;
    }
  }
  return count;
}

async function seedLiterature() {
  const litSubjectCodes = ["ENGH", "AFRH"];
  let workCount = 0, noteCount = 0;
  for (const code of litSubjectCodes) {
    const [subject] = await db.select().from(subjects).where(eq(subjects.code, code)).limit(1);
    if (!subject) {
      console.warn(`  - subject ${code} missing, skipping`);
      continue;
    }
    const categories = CAPS_LITERATURE[code] ?? [];
    for (const cat of categories) {
      for (const w of cat.works) {
        // Insert / update the work record.
        let workRow: typeof literatureWorks.$inferSelect | undefined;
        if (DRY_RUN) {
          // In dry-run mode, look up the existing row without writing.
          const [existing] = await db
            .select()
            .from(literatureWorks)
            .where(and(eq(literatureWorks.subjectId, subject.id), eq(literatureWorks.externalId, w.id)))
            .limit(1);
          if (existing) {
            console.log(`  [dry-run] UPDATE literature_works externalId=${w.id} "${w.title}"`);
            workRow = existing;
          } else {
            console.log(`  [dry-run] INSERT literature_works externalId=${w.id} "${w.title}"`);
            // Create a synthetic row so note dry-run logging can continue.
            workRow = { id: -1, subjectId: subject.id, externalId: w.id, title: w.title, titleAfrikaans: w.titleAf ?? null, author: w.author, workType: cat.type, yearPublished: null, createdAt: new Date() };
          }
        } else {
          const inserted = await db.insert(literatureWorks).values({
            subjectId: subject.id,
            externalId: w.id,
            title: w.title,
            titleAfrikaans: w.titleAf ?? null,
            author: w.author,
            workType: cat.type,
          }).onConflictDoUpdate({
            target: [literatureWorks.subjectId, literatureWorks.externalId],
            set: { title: w.title, author: w.author, workType: cat.type },
          }).returning();
          workRow = inserted[0];
        }
        if (!workRow) continue;
        workCount++;

        // Note content. Each language row gets its own arrays so the EN/AF
        // toggle truly switches content end-to-end (themes, characters,
        // devices, essay frameworks). For curated entries we treat the source
        // language as English by default; AFRH externalIds (`afrh-*`) carry
        // their curated payload as Afrikaans, with the other language sourced
        // from the rich generic-by-type fallback.
        const note = LITERATURE_NOTE_LIBRARY[libraryKeyForWork(w.id)];
        const curatedIsAf = w.id.startsWith("afrh-");
        const genericEn = buildGenericLitContent(w.title, w.author, cat.type, "en");
        const genericAf = buildGenericLitContent(w.title, w.author, cat.type, "af");

        const enPayload = (note && !curatedIsAf)
          ? { summary: note.summaryEn, themes: note.themes, characters: note.characters, literaryDevices: note.literaryDevices, essayFrameworks: note.essayFrameworks }
          : { summary: note?.summaryEn ?? genericEn.summary, themes: genericEn.themes, characters: genericEn.characters, literaryDevices: genericEn.literaryDevices, essayFrameworks: genericEn.essayFrameworks };

        const afPayload = (note && curatedIsAf)
          ? { summary: note.summaryAf ?? note.summaryEn, themes: note.themes, characters: note.characters, literaryDevices: note.literaryDevices, essayFrameworks: note.essayFrameworks }
          : { summary: note?.summaryAf ?? genericAf.summary, themes: genericAf.themes, characters: genericAf.characters, literaryDevices: genericAf.literaryDevices, essayFrameworks: genericAf.essayFrameworks };

        for (const lang of ["en", "af"] as const) {
          const p = lang === "en" ? enPayload : afPayload;
          const rowSource = note ? "caps_seed_v1" : "generic_v1";

          if (DRY_RUN) {
            const [existing] = await db
              .select({ source: literatureNotes.source })
              .from(literatureNotes)
              .where(and(eq(literatureNotes.workId, workRow.id), eq(literatureNotes.language, lang)))
              .limit(1);
            if (existing?.source === "admin") {
              console.log(`  [dry-run] SKIP   literature_notes workId=${workRow.id} lang=${lang} — admin-edited row preserved`);
            } else if (existing) {
              console.log(`  [dry-run] UPDATE literature_notes workId=${workRow.id} lang=${lang} (current source=${existing.source})`);
            } else {
              console.log(`  [dry-run] INSERT literature_notes workId=${workRow.id} lang=${lang}`);
            }
            noteCount++;
            continue;
          }

          await db.insert(literatureNotes).values({
            workId: workRow.id,
            language: lang,
            summary: p.summary,
            themes: p.themes,
            characters: p.characters,
            literaryDevices: p.literaryDevices,
            essayFrameworks: p.essayFrameworks,
            source: rowSource,
          }).onConflictDoUpdate({
            target: [literatureNotes.workId, literatureNotes.language],
            set: {
              summary: p.summary,
              themes: p.themes,
              characters: p.characters,
              literaryDevices: p.literaryDevices,
              essayFrameworks: p.essayFrameworks,
              source: rowSource,
              updatedAt: new Date(),
            },
            setWhere: sql`${literatureNotes.source} != 'admin'`,
          });
          noteCount++;
        }
      }
    }
  }
  return { workCount, noteCount };
}

async function main() {
  console.log("== Tasks #428 + #429 — seeding per-topic content for all subjects ==");

  const allSubjects = await db.select().from(subjects)
    .where(inArray(subjects.code, ALL_SUBJECT_CODES));

  let totalNotes = 0, totalCards = 0;
  for (const code of ALL_SUBJECT_CODES) {
    const subject = allSubjects.find(s => s.code === code);
    if (!subject) {
      console.warn(`  - subject ${code} missing in DB, skipping`);
      continue;
    }
    const notes = await seedTopicNotesForSubject(code, subject.id);
    const cards = await seedTopicFlashcardsForSubject(code, subject.id);
    console.log(`  ${code.padEnd(8)} → ${notes} topics with notes, ${cards} flashcards`);
    totalNotes += notes;
    totalCards += cards;
  }

  console.log("\n== Seeding literature works & notes ==");
  const lit = await seedLiterature();
  console.log(`  ${lit.workCount} literature works upserted, ${lit.noteCount} note rows written`);

  console.log(`\nDONE — ${totalNotes} topic notes, ${totalCards} cards, ${lit.workCount} works, ${lit.noteCount} lit notes.`);

  try {
    await markSeederCompleted("topic-content-seeder");
    console.log("Bumped curated-topic-count cache version in system_config.");
  } catch (e) {
    console.warn("Failed to bump curated-topic-count cache version:", e);
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
