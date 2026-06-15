/**
 * Task #806 — Rich worked examples for the 6 core STEM subjects.
 * Provides workedExamplesEn and workedExamplesAf (3 examples each) for every topic
 * in: MATH (11), PHYS (10), LIFE (10), ACC (8), BUS (8), ECO (8) = 55 topics.
 *
 * Imported by scripts/seed-topic-content.ts and merged into TOPIC_CONTENT,
 * overriding any prior worked examples for the same capsCode so the STEM
 * content layer is consolidated and uniformly rich.
 */

export type WorkedExample = {
  question: string;
  steps: string[];
  solution: string;
  commonErrors: string[];
};

export type StemWorkedExamples = {
  workedExamplesEn: WorkedExample[];
  workedExamplesAf: WorkedExample[];
};

export const STEM_WORKED_EXAMPLES: Record<string, StemWorkedExamples> = {

  // ===================== MATHEMATICS (MATH) =====================

  "MATH-1": {
    workedExamplesEn: [
      {
        question: "The first three terms of a quadratic sequence are 4, 9, 18. Find Tₙ in the form aₙ² + bn + c.",
        steps: [
          "First differences: 9−4 = 5, 18−9 = 9. Second difference: 9−5 = 4, so 2a = 4 → a = 2.",
          "Use T₁: a + b + c = 4 → 2 + b + c = 4 → b + c = 2.",
          "Use T₂: 4a + 2b + c = 9 → 8 + 2b + c = 9 → 2b + c = 1.",
          "Subtract: (2b + c) − (b + c) = 1 − 2 → b = −1, c = 3.",
        ],
        solution: "Tₙ = 2n² − n + 3",
        commonErrors: [
          "Forgetting that the second difference equals 2a (not a).",
          "Mixing up T₁ and T₀ when substituting.",
        ],
      },
      {
        question: "Determine the value of k for which the geometric series 4 + 4k + 4k² + … converges, and find S∞ when k = ½.",
        steps: [
          "Convergence condition: |r| < 1, so |k| < 1, i.e. −1 < k < 1.",
          "When k = ½: a = 4, r = ½.",
          "S∞ = a/(1 − r) = 4/(1 − ½) = 4/(½) = 8.",
        ],
        solution: "Converges for −1 < k < 1; S∞ = 8 when k = ½",
        commonErrors: [
          "Writing k < 1 instead of |k| < 1 (forgetting the negative case).",
          "Using S∞ = a·(1 − r) instead of a/(1 − r).",
        ],
      },
      {
        question: "How many terms of the arithmetic series 5 + 8 + 11 + … must be added to give a sum of 945?",
        steps: [
          "a = 5, d = 3, Sₙ = 945.",
          "Sₙ = n/2[2a + (n − 1)d] → 945 = n/2[10 + 3(n − 1)].",
          "1890 = n(3n + 7) → 3n² + 7n − 1890 = 0.",
          "Quadratic formula: n = [−7 + √(49 + 22680)]/6 = (−7 + 151)/6 = 24.",
        ],
        solution: "n = 24 terms",
        commonErrors: [
          "Multiplying out 2a + (n−1)d incorrectly (sign on the 7).",
          "Keeping the negative root for n (n must be a positive integer).",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Die eerste drie terme van 'n kwadratiese ry is 4, 9, 18. Vind Tₙ in die vorm aₙ² + bn + c.",
        steps: [
          "Eerste verskille: 5, 9. Tweede verskil: 4 → 2a = 4 → a = 2.",
          "T₁: 2 + b + c = 4 → b + c = 2.",
          "T₂: 8 + 2b + c = 9 → 2b + c = 1, dus b = −1 en c = 3.",
        ],
        solution: "Tₙ = 2n² − n + 3",
        commonErrors: ["Vergeet dat die tweede verskil gelyk is aan 2a."],
      },
      {
        question: "Vir watter k konvergeer 4 + 4k + 4k² + …, en bereken S∞ wanneer k = ½.",
        steps: [
          "Konvergeer as |k| < 1, dus −1 < k < 1.",
          "k = ½: S∞ = 4/(1 − ½) = 8.",
        ],
        solution: "−1 < k < 1; S∞ = 8",
        commonErrors: ["Skryf k < 1 in plaas van |k| < 1."],
      },
      {
        question: "Hoeveel terme van 5 + 8 + 11 + … gee 'n som van 945?",
        steps: [
          "Sₙ = n/2[10 + 3(n−1)] = 945.",
          "3n² + 7n − 1890 = 0 → n = 24.",
        ],
        solution: "n = 24",
        commonErrors: ["Behou die negatiewe wortel as antwoord vir n."],
      },
    ],
  },

  "MATH-2": {
    workedExamplesEn: [
      {
        question: "Sketch f(x) = 2(x − 1)² − 8. State turning point, axis of symmetry, y-intercept and x-intercepts.",
        steps: [
          "Turning point: (1, −8). Axis of symmetry: x = 1.",
          "y-intercept: f(0) = 2(1) − 8 = −6.",
          "x-intercepts: 2(x − 1)² = 8 → (x − 1)² = 4 → x = 3 or x = −1.",
        ],
        solution: "TP (1, −8); axis x = 1; y-int (0, −6); x-ints (3, 0) and (−1, 0)",
        commonErrors: [
          "Reading the turning point as (−1, −8) — the sign inside the bracket flips.",
          "Forgetting the ± when taking square roots for x-intercepts.",
        ],
      },
      {
        question: "Given h(x) = 3/(x + 2) − 1, write down asymptotes, intercepts, and sketch.",
        steps: [
          "Vertical asymptote: x + 2 = 0 → x = −2.",
          "Horizontal asymptote: y = −1.",
          "y-intercept (x = 0): 3/2 − 1 = ½ → (0, ½).",
          "x-intercept (y = 0): 3/(x + 2) = 1 → x + 2 = 3 → x = 1.",
        ],
        solution: "Asymptotes x = −2 and y = −1; intercepts (0, ½) and (1, 0)",
        commonErrors: [
          "Setting the numerator (not denominator) equal to zero for the vertical asymptote.",
          "Forgetting the vertical shift when writing the horizontal asymptote.",
        ],
      },
      {
        question: "f(x) = log₂ x. Find f⁻¹(x), state the line of symmetry between f and f⁻¹, and give the domain of f⁻¹.",
        steps: [
          "Swap x and y in y = log₂ x: x = log₂ y → y = 2ˣ.",
          "Line of symmetry: y = x (always, for a function and its inverse).",
          "Domain of f⁻¹: x ∈ ℝ (since 2ˣ is defined everywhere). Range: y > 0.",
        ],
        solution: "f⁻¹(x) = 2ˣ; line y = x; domain x ∈ ℝ",
        commonErrors: [
          "Writing f⁻¹(x) = log₂(1/x) — that is not the inverse.",
          "Restricting the domain of f⁻¹ to x > 0 (that was f's domain).",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Skets f(x) = 2(x − 1)² − 8 en gee draaipunt, simmetrie-as en afsnitte.",
        steps: [
          "Draaipunt (1, −8); as x = 1.",
          "y-afsnit: f(0) = −6. x-afsnitte: x = 3, x = −1.",
        ],
        solution: "DP (1, −8); y-afsnit (0, −6); x-afsnitte (3, 0) en (−1, 0)",
        commonErrors: ["Vergeet ± by die vierkantswortel vir x-afsnitte."],
      },
      {
        question: "h(x) = 3/(x + 2) − 1. Gee asimptote en afsnitte.",
        steps: [
          "Vert. asimptoot x = −2; horis. y = −1.",
          "y-afsnit (0, ½); x-afsnit (1, 0).",
        ],
        solution: "x = −2, y = −1; (0, ½), (1, 0)",
        commonErrors: ["Stel die teller, nie die noemer nie, gelyk aan nul."],
      },
      {
        question: "f(x) = log₂ x. Bepaal f⁻¹(x) en die simmetrie-lyn.",
        steps: ["f⁻¹(x) = 2ˣ.", "Simmetrie: y = x. Def van f⁻¹: ℝ."],
        solution: "f⁻¹(x) = 2ˣ; y = x",
        commonErrors: ["Beperk f⁻¹ se def-versameling tot x > 0."],
      },
    ],
  },

  "MATH-3": {
    workedExamplesEn: [
      {
        question: "Solve for x: log₅(x + 2) + log₅(x − 2) = 1.",
        steps: [
          "Combine logs: log₅[(x + 2)(x − 2)] = 1 → (x² − 4) = 5¹ = 5.",
          "x² = 9 → x = ±3.",
          "Validity: arguments must be positive: x + 2 > 0 AND x − 2 > 0 → x > 2.",
          "Reject x = −3; accept x = 3.",
        ],
        solution: "x = 3",
        commonErrors: [
          "Keeping x = −3 (makes log₅(−1) — undefined).",
          "Forgetting to convert log₅(…) = 1 to (…) = 5.",
        ],
      },
      {
        question: "Solve for x: 3·2²ˣ − 7·2ˣ + 2 = 0.",
        steps: [
          "Let y = 2ˣ. Then 3y² − 7y + 2 = 0.",
          "Factor: (3y − 1)(y − 2) = 0 → y = ⅓ or y = 2.",
          "2ˣ = 2 → x = 1. 2ˣ = ⅓ → x = log₂(⅓) = −log₂ 3 ≈ −1.585.",
        ],
        solution: "x = 1 or x = log₂(⅓) ≈ −1.585",
        commonErrors: [
          "Treating 2²ˣ as (2x)² = 4x² instead of (2ˣ)².",
          "Discarding the negative-log answer as invalid.",
        ],
      },
      {
        question: "If log 7 = 0.845, find log 49 and log(1/7) without a calculator.",
        steps: [
          "log 49 = log 7² = 2·log 7 = 2(0.845) = 1.690.",
          "log(1/7) = log 7⁻¹ = −log 7 = −0.845.",
        ],
        solution: "log 49 = 1.690; log(1/7) = −0.845",
        commonErrors: [
          "Computing log 49 = log 7 + log 7 → answer right, but writing 0.845² is a common mis-step.",
          "Forgetting the negative sign for log(1/7).",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Los op: log₅(x + 2) + log₅(x − 2) = 1.",
        steps: [
          "log₅(x² − 4) = 1 → x² − 4 = 5 → x = ±3.",
          "Slegs x > 2 geld → x = 3.",
        ],
        solution: "x = 3",
        commonErrors: ["Behou x = −3 — gee log van negatiewe getal."],
      },
      {
        question: "Los op: 3·2²ˣ − 7·2ˣ + 2 = 0.",
        steps: [
          "Stel y = 2ˣ: 3y² − 7y + 2 = 0 → y = ⅓ of 2.",
          "x = 1 of x = log₂(⅓) ≈ −1.585.",
        ],
        solution: "x = 1 of ≈ −1.585",
        commonErrors: ["Verwar 2²ˣ met (2x)²."],
      },
      {
        question: "log 7 = 0.845. Bereken log 49 en log(1/7).",
        steps: ["log 49 = 2(0.845) = 1.690.", "log(1/7) = −0.845."],
        solution: "1.690 en −0.845",
        commonErrors: ["Vergeet die negatiewe teken vir log(1/7)."],
      },
    ],
  },

  "MATH-4": {
    workedExamplesEn: [
      {
        question: "Convert 9% per annum compounded monthly to the effective annual rate (round to 4 dp).",
        steps: [
          "Monthly rate: i_m = 0.09/12 = 0.0075.",
          "Effective annual: (1 + 0.0075)¹² − 1 = 1.09381 − 1 = 0.09381.",
          "≈ 9.3807% effective.",
        ],
        solution: "Effective rate ≈ 9.3807%",
        commonErrors: [
          "Forgetting the −1 at the end (giving the growth factor instead of the rate).",
          "Dividing by 4 instead of 12 (mixing quarterly with monthly).",
        ],
      },
      {
        question: "Thandi takes a R600 000 home loan at 11% p.a. compounded monthly over 20 years. Calculate her monthly instalment.",
        steps: [
          "Present value annuity: P = x[1 − (1 + i)⁻ⁿ]/i.",
          "i = 0.11/12 ≈ 0.009167, n = 20 × 12 = 240.",
          "(1 + i)⁻ⁿ ≈ 0.11240, so 1 − 0.11240 = 0.88760.",
          "0.88760 / 0.009167 ≈ 96.823 → x = 600 000 / 96.823 ≈ R6 197.",
        ],
        solution: "Instalment ≈ R6 197 per month",
        commonErrors: [
          "Using future value annuity (FV) instead of present value (PV) for a loan.",
          "Using n = 20 years instead of 240 months.",
        ],
      },
      {
        question: "An investment of R10 000 grows to R18 500 over 6 years compounded semi-annually. Find the nominal annual interest rate.",
        steps: [
          "n = 6 × 2 = 12 half-years; A = P(1 + i)ⁿ → 18 500 = 10 000(1 + i)¹².",
          "(1 + i)¹² = 1.85 → 1 + i = 1.85^(1/12) ≈ 1.05277.",
          "i ≈ 0.05277 per half-year → nominal annual ≈ 2 × 0.05277 ≈ 0.10554.",
        ],
        solution: "Nominal rate ≈ 10.55% p.a.",
        commonErrors: [
          "Not multiplying by 2 at the end (returning the half-year rate).",
          "Using n = 6 instead of 12.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Skakel 9% p.j. saamgestel maandeliks om na die effektiewe jaarlikse koers.",
        steps: ["i_m = 0.0075; (1.0075)¹² − 1 ≈ 0.09381.", "≈ 9.3807%."],
        solution: "≈ 9.3807%",
        commonErrors: ["Vergeet die −1 aan die einde."],
      },
      {
        question: "R600 000 lening teen 11% p.j. maandeliks vir 20 jaar. Bereken maandelikse paaiement.",
        steps: [
          "i = 0.009167, n = 240; P = x[1 − (1 + i)⁻ⁿ]/i.",
          "x ≈ R6 197.",
        ],
        solution: "≈ R6 197 p.m.",
        commonErrors: ["Gebruik FV in plaas van PV vir 'n lening."],
      },
      {
        question: "R10 000 groei tot R18 500 oor 6 jaar halfjaarliks saamgestel. Vind nominale koers.",
        steps: [
          "(1 + i)¹² = 1.85 → i ≈ 0.05277 per halfjaar.",
          "Nominaal ≈ 10.55% p.j.",
        ],
        solution: "≈ 10.55% p.j.",
        commonErrors: ["Vermenigvuldig nie met 2 op die einde nie."],
      },
    ],
  },

  "MATH-5": {
    workedExamplesEn: [
      {
        question: "Simplify completely (no calculator): sin(180° − x)·tan(360° + x) / cos(90° − x).",
        steps: [
          "sin(180° − x) = sin x.",
          "tan(360° + x) = tan x.",
          "cos(90° − x) = sin x.",
          "Combine: (sin x · tan x) / sin x = tan x.",
        ],
        solution: "tan x",
        commonErrors: [
          "Writing sin(180° − x) = −sin x (sign is positive in Quadrant II).",
          "Confusing cos(90° − x) with sin(90° − x).",
        ],
      },
      {
        question: "Solve for x in [0°; 360°]: sin 2x = cos x.",
        steps: [
          "Use double angle: 2 sin x · cos x = cos x.",
          "Move all to one side: cos x (2 sin x − 1) = 0.",
          "cos x = 0 → x = 90°, 270°.",
          "sin x = ½ → x = 30°, 150°.",
        ],
        solution: "x = 30°, 90°, 150°, 270°",
        commonErrors: [
          "Dividing both sides by cos x — this drops the cos x = 0 solutions.",
          "Missing the second-quadrant value for sin x = ½ (i.e. 150°).",
        ],
      },
      {
        question: "Triangle ABC: A = 40°, B = 60°, side b = 12 cm. Find side a using the sine rule.",
        steps: [
          "Sine rule: a / sin A = b / sin B.",
          "a / sin 40° = 12 / sin 60°.",
          "a = 12 × sin 40° / sin 60° ≈ 12 × 0.6428 / 0.8660 ≈ 8.91 cm.",
        ],
        solution: "a ≈ 8.91 cm",
        commonErrors: [
          "Inverting the ratio: writing sin A / a = b / sin B.",
          "Using the cosine rule when only two angles and one side are given.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Vereenvoudig: sin(180° − x)·tan(360° + x) / cos(90° − x).",
        steps: ["= sin x · tan x / sin x = tan x."],
        solution: "tan x",
        commonErrors: ["sin(180° − x) is +sin x, nie −sin x nie."],
      },
      {
        question: "Los op vir x ∈ [0°; 360°]: sin 2x = cos x.",
        steps: [
          "2 sin x cos x = cos x → cos x(2 sin x − 1) = 0.",
          "x = 30°, 90°, 150°, 270°.",
        ],
        solution: "30°, 90°, 150°, 270°",
        commonErrors: ["Deel deur cos x — verloor cos x = 0 oplossings."],
      },
      {
        question: "Driehoek ABC: A = 40°, B = 60°, b = 12 cm. Vind a.",
        steps: ["a = 12·sin 40°/sin 60° ≈ 8.91 cm."],
        solution: "a ≈ 8.91 cm",
        commonErrors: ["Verwar sinus- en kosinusreël."],
      },
    ],
  },

  "MATH-6": {
    workedExamplesEn: [
      {
        question: "Given p(x) = x³ + 2x² − 5x − 6. Show (x + 1) is a factor and factorise completely.",
        steps: [
          "Test x = −1: p(−1) = −1 + 2 + 5 − 6 = 0. ✓",
          "Divide p(x) ÷ (x + 1) → quotient x² + x − 6.",
          "x² + x − 6 = (x + 3)(x − 2).",
          "p(x) = (x + 1)(x + 3)(x − 2).",
        ],
        solution: "(x + 1)(x + 3)(x − 2)",
        commonErrors: [
          "Testing x = 1 instead of x = −1 for the factor (x + 1).",
          "Long-division sign error when constant term is negative.",
        ],
      },
      {
        question: "Find the value of k so that (x − 2) is a factor of f(x) = x³ − kx² + 4x − 8.",
        steps: [
          "Factor Theorem: f(2) = 0.",
          "f(2) = 8 − 4k + 8 − 8 = 8 − 4k.",
          "Set 8 − 4k = 0 → k = 2.",
        ],
        solution: "k = 2",
        commonErrors: [
          "Substituting x = −2 (zero of x − 2 is x = 2).",
          "Arithmetic slip on 2³ = 8.",
        ],
      },
      {
        question: "Solve completely: 2x³ − x² − 5x − 2 = 0.",
        steps: [
          "Try rational roots ±1, ±2, ±½. Test x = −1: −2 − 1 + 5 − 2 = 0. ✓",
          "Divide by (x + 1): 2x² − 3x − 2.",
          "Factor: (2x + 1)(x − 2).",
          "Roots: x = −1, x = −½, x = 2.",
        ],
        solution: "x = −1, −½, 2",
        commonErrors: [
          "Only testing whole-number roots — fractions like ±½ are also rational candidates when the leading coefficient is not 1.",
          "Sign error on the constant when expanding back to check.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Toon (x + 1) is 'n faktor van p(x) = x³ + 2x² − 5x − 6 en faktoriseer.",
        steps: ["p(−1) = 0 ✓; p(x) = (x + 1)(x + 3)(x − 2)."],
        solution: "(x + 1)(x + 3)(x − 2)",
        commonErrors: ["Toets x = 1 i.p.v. x = −1."],
      },
      {
        question: "Vind k sodat (x − 2) 'n faktor van f(x) = x³ − kx² + 4x − 8 is.",
        steps: ["f(2) = 8 − 4k = 0 → k = 2."],
        solution: "k = 2",
        commonErrors: ["Vervang x = −2."],
      },
      {
        question: "Los op: 2x³ − x² − 5x − 2 = 0.",
        steps: ["x = −1 wortel; (x + 1)(2x² − 3x − 2) = 0 → x = −1, −½, 2."],
        solution: "x = −1, −½, 2",
        commonErrors: ["Toets nie breukwortels nie."],
      },
    ],
  },

  "MATH-7": {
    workedExamplesEn: [
      {
        question: "Determine f'(x) from first principles for f(x) = 2x² − 3.",
        steps: [
          "f(x + h) = 2(x + h)² − 3 = 2x² + 4xh + 2h² − 3.",
          "f(x + h) − f(x) = 4xh + 2h².",
          "[f(x + h) − f(x)]/h = 4x + 2h.",
          "Take limit h → 0: f'(x) = 4x.",
        ],
        solution: "f'(x) = 4x",
        commonErrors: [
          "Forgetting to divide by h before taking the limit.",
          "Setting h = 0 too early (before cancelling the h in the numerator).",
        ],
      },
      {
        question: "Find the equation of the tangent to f(x) = x³ − 4x at x = 1.",
        steps: [
          "f(1) = 1 − 4 = −3 → point (1, −3).",
          "f'(x) = 3x² − 4 → gradient = 3(1) − 4 = −1.",
          "Tangent: y + 3 = −1(x − 1) → y = −x − 2.",
        ],
        solution: "y = −x − 2",
        commonErrors: [
          "Forgetting to substitute x = 1 to find y on the curve.",
          "Reversing the sign on the gradient when writing the equation.",
        ],
      },
      {
        question: "A rectangular pen against a wall uses 60 m of fencing on three sides (two equal widths x and one length y). Find x for maximum area.",
        steps: [
          "Fencing: 2x + y = 60 → y = 60 − 2x.",
          "Area: A = x·y = x(60 − 2x) = 60x − 2x².",
          "dA/dx = 60 − 4x = 0 → x = 15.",
          "Check: d²A/dx² = −4 < 0 → maximum. y = 30.",
        ],
        solution: "x = 15 m, y = 30 m for max area = 450 m²",
        commonErrors: [
          "Counting all four sides instead of three (wall covers one side).",
          "Confirming a minimum vs maximum without the second-derivative test.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Bepaal f'(x) uit eerste beginsels vir f(x) = 2x² − 3.",
        steps: ["f(x+h) − f(x) = 4xh + 2h².", "f'(x) = lim (4x + 2h) = 4x."],
        solution: "f'(x) = 4x",
        commonErrors: ["Stel h = 0 voor h gekanselleer is."],
      },
      {
        question: "Vind die raaklyn aan f(x) = x³ − 4x by x = 1.",
        steps: ["Punt (1, −3); gradient = −1; y = −x − 2."],
        solution: "y = −x − 2",
        commonErrors: ["Vergeet om y-waarde te bereken."],
      },
      {
        question: "60 m omheining vir 3 sye (2x + y). Maksimum oppervlakte?",
        steps: ["A = 60x − 2x²; dA/dx = 60 − 4x = 0 → x = 15, y = 30."],
        solution: "x = 15 m, y = 30 m, A = 450 m²",
        commonErrors: ["Tel al 4 sye in plaas van 3."],
      },
    ],
  },

  "MATH-8": {
    workedExamplesEn: [
      {
        question: "Find the equation of the perpendicular bisector of the line joining A(−2, 1) and B(4, 5).",
        steps: [
          "Midpoint M = ((−2 + 4)/2, (1 + 5)/2) = (1, 3).",
          "Gradient AB = (5 − 1)/(4 − (−2)) = 4/6 = 2/3.",
          "Perpendicular gradient = −3/2.",
          "Equation: y − 3 = −3/2(x − 1) → y = −3x/2 + 9/2.",
        ],
        solution: "y = −3x/2 + 9/2",
        commonErrors: [
          "Using the gradient of AB instead of its negative reciprocal.",
          "Computing midpoint by subtracting rather than averaging.",
        ],
      },
      {
        question: "Show that the points P(1, 2), Q(4, 6) and R(7, 10) are collinear.",
        steps: [
          "Gradient PQ = (6 − 2)/(4 − 1) = 4/3.",
          "Gradient QR = (10 − 6)/(7 − 4) = 4/3.",
          "Same gradient through common point Q → collinear.",
        ],
        solution: "PQ and QR share gradient 4/3 → P, Q, R are collinear",
        commonErrors: [
          "Only computing one gradient and concluding.",
          "Reversing coordinates (mixing x with y in the formula).",
        ],
      },
      {
        question: "Find the equation of the circle with centre (−3, 2) and radius 5.",
        steps: [
          "Standard form: (x − a)² + (y − b)² = r².",
          "Substitute a = −3, b = 2, r = 5.",
          "(x + 3)² + (y − 2)² = 25.",
        ],
        solution: "(x + 3)² + (y − 2)² = 25",
        commonErrors: [
          "Forgetting to square the radius.",
          "Sign error: writing (x − 3)² when the centre x-coordinate is −3.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Vind die middelloodlyn van AB met A(−2, 1) en B(4, 5).",
        steps: ["M(1, 3); gradient ⊥ = −3/2.", "y = −3x/2 + 9/2."],
        solution: "y = −3x/2 + 9/2",
        commonErrors: ["Gebruik AB se gradient i.p.v. die negatiewe wederkerige."],
      },
      {
        question: "Toon dat P(1,2), Q(4,6), R(7,10) kollineêr is.",
        steps: ["m_PQ = m_QR = 4/3 → kollineêr."],
        solution: "Kollineêr",
        commonErrors: ["Bereken slegs een gradient."],
      },
      {
        question: "Sirkel: middelpunt (−3, 2), straal 5.",
        steps: ["(x + 3)² + (y − 2)² = 25."],
        solution: "(x + 3)² + (y − 2)² = 25",
        commonErrors: ["Vergeet om straal te kwadraat."],
      },
    ],
  },

  "MATH-9": {
    workedExamplesEn: [
      {
        question: "In circle O, chord AB subtends ∠AOB = 80° at the centre. Find ∠ACB at the circumference (C on the major arc).",
        steps: [
          "Theorem: The angle at the centre is twice the angle at the circumference on the same arc.",
          "∠ACB = ½ × ∠AOB = ½ × 80° = 40°.",
        ],
        solution: "∠ACB = 40°",
        commonErrors: [
          "Doubling instead of halving (using centre = ½ × circumference).",
          "Applying the rule to a point on the minor arc — that gives the reflex relationship.",
        ],
      },
      {
        question: "PT is a tangent to a circle at T, and TQ is a chord with ∠PTQ = 35°. Find ∠TRQ where R is on the major arc.",
        steps: [
          "Tan-chord theorem: the angle between a tangent and a chord equals the angle subtended by the chord in the alternate segment.",
          "∠TRQ = ∠PTQ = 35°.",
        ],
        solution: "∠TRQ = 35°",
        commonErrors: [
          "Confusing the alternate-segment angle with the angle in the same segment as the tangent.",
          "Forgetting that the tangent and radius are perpendicular at the point of contact (different rule).",
        ],
      },
      {
        question: "ABCD is a cyclic quadrilateral with ∠A = 105°. Find ∠C.",
        steps: [
          "Opposite angles of a cyclic quadrilateral are supplementary: ∠A + ∠C = 180°.",
          "∠C = 180° − 105° = 75°.",
        ],
        solution: "∠C = 75°",
        commonErrors: [
          "Using adjacent rather than opposite angles.",
          "Adding to 360° instead of 180°.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Koord AB span ∠AOB = 80° by die middelpunt. Vind ∠ACB by omtrek.",
        steps: ["∠ACB = ½ × 80° = 40°."],
        solution: "40°",
        commonErrors: ["Verdubbel i.p.v. halveer."],
      },
      {
        question: "PT raaklyn by T, ∠PTQ = 35°. Vind ∠TRQ (R op groot boog).",
        steps: ["Raaklyn-koord stelling: ∠TRQ = 35°."],
        solution: "35°",
        commonErrors: ["Verwar met hoeke in dieselfde segment."],
      },
      {
        question: "Sikliese vierhoek ABCD, ∠A = 105°. Vind ∠C.",
        steps: ["∠C = 180° − 105° = 75°."],
        solution: "75°",
        commonErrors: ["Optel tot 360°."],
      },
    ],
  },

  "MATH-10": {
    workedExamplesEn: [
      {
        question: "The mean of 7 numbers is 12. When an 8th number is added, the mean drops to 11. What is the 8th number?",
        steps: [
          "Sum of first 7 = 7 × 12 = 84.",
          "Sum of 8 = 8 × 11 = 88.",
          "8th number = 88 − 84 = 4.",
        ],
        solution: "4",
        commonErrors: [
          "Subtracting means rather than sums.",
          "Multiplying 7 × 11 instead of 7 × 12 to get the original total.",
        ],
      },
      {
        question: "A scatter plot of hours studied (x) vs marks (y) for 8 learners gives a regression line ŷ = 4.2x + 38. Predict the mark for a learner who studies 6 hours, and comment on extrapolation to 30 hours.",
        steps: [
          "ŷ = 4.2(6) + 38 = 25.2 + 38 = 63.2 ≈ 63%.",
          "30 hours is well outside the data range — extrapolation is unreliable; the linear model may not hold.",
        ],
        solution: "Predicted ≈ 63%; extrapolating to 30 h is unreliable",
        commonErrors: [
          "Confusing the gradient and y-intercept in ŷ = mx + c.",
          "Stating an extrapolated value with full confidence.",
        ],
      },
      {
        question: "For the data set {3, 6, 7, 8, 10, 12, 13, 14, 15, 20}, determine Q1, Q3 and identify any outliers using the 1.5 × IQR rule.",
        steps: [
          "n = 10. Median = (10 + 12)/2 = 11. Lower half {3, 6, 7, 8, 10} → Q1 = 7. Upper half {12, 13, 14, 15, 20} → Q3 = 14.",
          "IQR = 14 − 7 = 7. Fences: 7 − 1.5(7) = −3.5 and 14 + 1.5(7) = 24.5.",
          "All values lie within (−3.5, 24.5) → no outliers.",
        ],
        solution: "Q1 = 7, Q3 = 14; no outliers",
        commonErrors: [
          "Including the median in both halves when finding quartiles for an even-sized data set.",
          "Forgetting the lower fence (only checking the upper).",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Gemiddeld van 7 getalle is 12; met 'n 8ste verlaag dit tot 11. Vind die 8ste getal.",
        steps: ["Sommas: 84 en 88; verskil = 4."],
        solution: "4",
        commonErrors: ["Trek gemiddeldes af i.p.v. somme."],
      },
      {
        question: "Regressielyn ŷ = 4.2x + 38. Voorspel by x = 6, kommentaar op x = 30.",
        steps: ["ŷ ≈ 63%.", "30 h is ekstrapolasie — onbetroubaar."],
        solution: "≈ 63%; ekstrapolasie onbetroubaar",
        commonErrors: ["Verwar gradient en y-afsnit."],
      },
      {
        question: "Datastel {3,6,7,8,10,12,13,14,15,20}: vind Q1, Q3 en uitskieters (1.5×IQR).",
        steps: ["Q1 = 7, Q3 = 14; IQR = 7; grense −3.5 en 24.5 → geen uitskieters."],
        solution: "Q1 = 7, Q3 = 14; geen uitskieters",
        commonErrors: ["Sluit mediaan in albei helftes in."],
      },
    ],
  },

  "MATH-11": {
    workedExamplesEn: [
      {
        question: "How many 4-letter words (no repetition) can be formed from the letters of MATHS?",
        steps: [
          "MATHS has 5 distinct letters.",
          "Choose-and-arrange 4 of 5: P(5, 4) = 5! / (5 − 4)! = 120 / 1 = 120.",
        ],
        solution: "120 arrangements",
        commonErrors: [
          "Using combinations C(5,4) = 5 — that ignores order.",
          "Allowing repetition (5⁴ = 625).",
        ],
      },
      {
        question: "A bag contains 4 red and 6 blue balls. Two balls are drawn without replacement. Find P(both red).",
        steps: [
          "P(1st red) = 4/10.",
          "P(2nd red | 1st red) = 3/9.",
          "P(both red) = 4/10 × 3/9 = 12/90 = 2/15 ≈ 0.133.",
        ],
        solution: "P = 2/15 ≈ 0.133",
        commonErrors: [
          "Not reducing the second probability (using 4/9 instead of 3/9).",
          "Treating dependent events as independent.",
        ],
      },
      {
        question: "Events A and B are independent with P(A) = 0.4 and P(B) = 0.5. Find P(A or B).",
        steps: [
          "Independent ⇒ P(A ∩ B) = P(A) × P(B) = 0.20.",
          "P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = 0.4 + 0.5 − 0.2 = 0.70.",
        ],
        solution: "P(A or B) = 0.70",
        commonErrors: [
          "Adding probabilities without subtracting the intersection.",
          "Confusing 'independent' with 'mutually exclusive' (which would give P(A ∩ B) = 0).",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Hoeveel 4-letter woorde (sonder herhaling) uit MATHS?",
        steps: ["P(5, 4) = 120."],
        solution: "120",
        commonErrors: ["Gebruik kombinasies i.p.v. permutasies."],
      },
      {
        question: "4 rooi + 6 blou balle. Twee getrek sonder vervanging. P(albei rooi)?",
        steps: ["4/10 × 3/9 = 2/15."],
        solution: "2/15",
        commonErrors: ["Behandel as onafhanklik."],
      },
      {
        question: "Onafhanklik: P(A)=0.4, P(B)=0.5. P(A of B)?",
        steps: ["P(A∩B) = 0.20; P(A∪B) = 0.70."],
        solution: "0.70",
        commonErrors: ["Verwar onafhanklik met wedersyds uitsluitend."],
      },
    ],
  },

  // ===================== PHYSICAL SCIENCES — PHYSICS (PHYS-1..7) =====================

  "PHYS-1": {
    workedExamplesEn: [
      {
        question: "A 1 200 kg car travels east at 25 m·s⁻¹. Calculate its momentum.",
        steps: [
          "p = m·v.",
          "p = 1 200 × 25 = 30 000 kg·m·s⁻¹.",
          "Direction matches velocity: east.",
        ],
        solution: "p = 3.0 × 10⁴ kg·m·s⁻¹ east",
        commonErrors: [
          "Omitting the direction in the final answer (momentum is a vector).",
          "Using weight (mg) instead of mass.",
        ],
      },
      {
        question: "A 0.15 kg ball moving at 20 m·s⁻¹ strikes a wall and rebounds at 18 m·s⁻¹ in 0.05 s. Calculate the impulse and the average force on the ball.",
        steps: [
          "Take towards the wall as positive: u = +20, v = −18.",
          "Δp = m(v − u) = 0.15 × (−18 − 20) = 0.15 × (−38) = −5.7 kg·m·s⁻¹.",
          "Impulse = Δp = 5.7 N·s away from the wall.",
          "F_avg = Δp/Δt = −5.7 / 0.05 = −114 N (i.e. 114 N away from wall).",
        ],
        solution: "Impulse = 5.7 N·s; F_avg = 114 N away from the wall",
        commonErrors: [
          "Subtracting speeds (20 − 18) instead of velocities with sign (−18 − 20).",
          "Forgetting that rebound means a change of direction (negative sign).",
        ],
      },
      {
        question: "A 3 kg trolley moving at 4 m·s⁻¹ east collides and sticks to a stationary 2 kg trolley. Find the common velocity after collision.",
        steps: [
          "Conservation of momentum: m₁u₁ + m₂u₂ = (m₁ + m₂)v.",
          "3(4) + 2(0) = (5)v → 12 = 5v.",
          "v = 2.4 m·s⁻¹ east.",
        ],
        solution: "v = 2.4 m·s⁻¹ east",
        commonErrors: [
          "Adding momenta with the wrong sign (collision direction matters).",
          "Treating an inelastic collision as if KE were also conserved.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "'n 1 200 kg motor ry 25 m·s⁻¹ oos. Momentum?",
        steps: ["p = 30 000 kg·m·s⁻¹ oos."],
        solution: "3.0 × 10⁴ kg·m·s⁻¹ oos",
        commonErrors: ["Vergeet die rigting."],
      },
      {
        question: "Bal 0.15 kg @ 20 m·s⁻¹ tref muur, terugkaats @ 18 m·s⁻¹ in 0.05 s. Impuls en F_gem?",
        steps: ["Δp = 0.15(−38) = −5.7 N·s.", "F = 114 N weg van muur."],
        solution: "Impuls 5.7 N·s; F = 114 N",
        commonErrors: ["Trek spoede af i.p.v. snelhede."],
      },
      {
        question: "3 kg @ 4 m·s⁻¹ oos bots met 2 kg in rus en plak. Gemeenskaplike snelheid?",
        steps: ["12 = 5v → v = 2.4 m·s⁻¹ oos."],
        solution: "2.4 m·s⁻¹ oos",
        commonErrors: ["Behandel onelasties as elasties."],
      },
    ],
  },

  "PHYS-2": {
    workedExamplesEn: [
      {
        question: "A stone is dropped from rest from a 45 m cliff. Take g = 9.8 m·s⁻². Find time to reach the ground and velocity on impact.",
        steps: [
          "Take down as positive. u = 0, a = 9.8, Δy = 45.",
          "Δy = u·t + ½·a·t² → 45 = 4.9t² → t² = 9.18 → t ≈ 3.03 s.",
          "v = u + at = 0 + 9.8(3.03) ≈ 29.7 m·s⁻¹ downward.",
        ],
        solution: "t ≈ 3.03 s; v ≈ 29.7 m·s⁻¹ downward",
        commonErrors: [
          "Forgetting to take the square root in the time calculation.",
          "Using v² = u² + 2as with wrong sign on a.",
        ],
      },
      {
        question: "A ball is thrown straight up at 15 m·s⁻¹. Find maximum height reached.",
        steps: [
          "At max height, v = 0. Take up as positive: a = −9.8.",
          "v² = u² + 2a·Δy → 0 = 15² + 2(−9.8)Δy.",
          "Δy = 225 / 19.6 ≈ 11.5 m.",
        ],
        solution: "h_max ≈ 11.5 m",
        commonErrors: [
          "Using a = +9.8 when up is positive.",
          "Confusing total time of flight with time to maximum height.",
        ],
      },
      {
        question: "From a 25 m roof, a ball is thrown upward at 10 m·s⁻¹. Find total time before it hits the ground (take down as positive).",
        steps: [
          "Down positive: u = −10, a = 9.8, Δy = +25.",
          "25 = −10·t + 4.9·t² → 4.9t² − 10t − 25 = 0.",
          "t = [10 ± √(100 + 490)] / 9.8 = (10 ± 24.29)/9.8.",
          "Positive root: t ≈ 3.5 s.",
        ],
        solution: "t ≈ 3.5 s",
        commonErrors: [
          "Keeping the negative root for time.",
          "Sign confusion mixing up vs down on u, a and Δy.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Klip val uit rus van 45 m krans. Vind tyd en treffsnelheid (g = 9.8).",
        steps: ["t = √(2·45/9.8) ≈ 3.03 s; v ≈ 29.7 m·s⁻¹ af."],
        solution: "3.03 s; 29.7 m·s⁻¹",
        commonErrors: ["Vergeet wortel."],
      },
      {
        question: "Bal opgegooi @ 15 m·s⁻¹. Maks hoogte?",
        steps: ["0 = 225 − 19.6·h → h ≈ 11.5 m."],
        solution: "≈ 11.5 m",
        commonErrors: ["g positief gebruik wanneer op = positief."],
      },
      {
        question: "Bal gegooi op @ 10 m·s⁻¹ van 25 m dak. Tyd tot grond (af = +).",
        steps: ["4.9t² − 10t − 25 = 0 → t ≈ 3.5 s."],
        solution: "≈ 3.5 s",
        commonErrors: ["Behou negatiewe wortel."],
      },
    ],
  },

  "PHYS-3": {
    workedExamplesEn: [
      {
        question: "Give the IUPAC name and structural formula of the alkene with molecular formula C₄H₈ that gives only one product on hydrogenation, where the double bond is between C2 and C3.",
        steps: [
          "C₄H₈ with C=C between C2 and C3: CH₃−CH=CH−CH₃.",
          "Longest chain with C=C is 4 carbons → 'but'.",
          "Lowest locant for double bond: 2.",
          "Name: but-2-ene.",
        ],
        solution: "But-2-ene, CH₃CH=CHCH₃",
        commonErrors: [
          "Naming it but-3-ene (locant must be the lowest).",
          "Writing it as butene without the locant.",
        ],
      },
      {
        question: "Identify the functional group and homologous series of CH₃COOH and give its IUPAC name.",
        steps: [
          "Functional group: −COOH (carboxyl).",
          "Homologous series: carboxylic acids.",
          "Two carbons → 'eth' + '-anoic acid'.",
          "Name: ethanoic acid.",
        ],
        solution: "Ethanoic acid; carboxyl group; carboxylic acid series",
        commonErrors: [
          "Calling it acetic acid (trivial, not IUPAC).",
          "Confusing −COOH with −OH (alcohol) or −CHO (aldehyde).",
        ],
      },
      {
        question: "Explain why pentane has a higher boiling point than 2,2-dimethylpropane (same molecular formula C₅H₁₂).",
        steps: [
          "Both are non-polar alkanes — only London (induced-dipole) forces operate.",
          "London forces depend on contact surface area between molecules.",
          "Pentane is a straight chain — large contact area → stronger London forces.",
          "2,2-dimethylpropane is spherical — minimal contact → weaker forces.",
          "Therefore pentane requires more energy to boil.",
        ],
        solution: "Pentane has a larger contact surface, giving stronger London forces and a higher boiling point.",
        commonErrors: [
          "Invoking hydrogen bonding (no O–H or N–H bonds present).",
          "Saying molar mass differs — both isomers have identical molar mass.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Naam en formule vir die alkeen C₄H₈ met dubbelbinding tussen C2 en C3.",
        steps: ["CH₃−CH=CH−CH₃; but-2-een."],
        solution: "But-2-een",
        commonErrors: ["Noem dit but-3-een."],
      },
      {
        question: "Funksionele groep en IUPAC-naam vir CH₃COOH.",
        steps: ["Karboksiel −COOH; etanoësuur."],
        solution: "Etanoësuur; karboksielsuur reeks",
        commonErrors: ["Noem dit asynsuur (nie IUPAC nie)."],
      },
      {
        question: "Hoekom kook pentaan teen hoër temperatuur as 2,2-dimetielpropaan?",
        steps: [
          "Beide alkane → slegs Londonkragte.",
          "Pentaan is lineêr → groter kontakoppervlak → sterker kragte.",
        ],
        solution: "Groter kontakoppervlak → sterker London kragte",
        commonErrors: ["Verwys na waterstofbinding."],
      },
    ],
  },

  "PHYS-4": {
    workedExamplesEn: [
      {
        question: "A 50 kg crate is pushed 8 m across a level floor by a constant 200 N horizontal force. Friction is 60 N. Calculate work done by the applied force, by friction, and net work.",
        steps: [
          "W_applied = F·d·cos 0° = 200 × 8 × 1 = 1 600 J.",
          "W_friction = f·d·cos 180° = 60 × 8 × (−1) = −480 J.",
          "W_net = 1 600 − 480 = 1 120 J.",
        ],
        solution: "W_applied = 1 600 J; W_friction = −480 J; W_net = 1 120 J",
        commonErrors: [
          "Forgetting cos 180° = −1 for friction.",
          "Including weight or normal force in horizontal work (they are perpendicular to motion).",
        ],
      },
      {
        question: "A 0.5 kg ball is dropped from 10 m. Using energy conservation, find its speed just before impact (ignore air resistance, g = 9.8).",
        steps: [
          "E_p_top = m·g·h = 0.5 × 9.8 × 10 = 49 J.",
          "All converts to KE at bottom: ½·m·v² = 49 → v² = 196.",
          "v = 14 m·s⁻¹.",
        ],
        solution: "v = 14 m·s⁻¹",
        commonErrors: [
          "Using v = √(g·h) instead of √(2·g·h).",
          "Including mass in the final velocity expression (it cancels).",
        ],
      },
      {
        question: "A motor lifts a 200 kg load vertically at constant 0.5 m·s⁻¹. Calculate the power output (g = 9.8).",
        steps: [
          "Constant speed → applied force = weight = 200 × 9.8 = 1 960 N.",
          "P = F·v = 1 960 × 0.5 = 980 W.",
        ],
        solution: "P = 980 W",
        commonErrors: [
          "Adding extra force for acceleration (constant velocity means a = 0).",
          "Using P = W/t without computing the lift force.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "50 kg krat oor 8 m, 200 N krag, wrywing 60 N. Arbeid?",
        steps: ["W_toegepas = 1 600 J; W_wrywing = −480 J; W_net = 1 120 J."],
        solution: "W_net = 1 120 J",
        commonErrors: ["Vergeet cos 180° vir wrywing."],
      },
      {
        question: "Bal 0.5 kg val 10 m. Tref-snelheid?",
        steps: ["½mv² = mgh → v = √(2·9.8·10) = 14 m·s⁻¹."],
        solution: "14 m·s⁻¹",
        commonErrors: ["Vergeet faktor 2."],
      },
      {
        question: "Motor lig 200 kg teen konstant 0.5 m·s⁻¹. Drywing?",
        steps: ["P = 1 960 × 0.5 = 980 W."],
        solution: "980 W",
        commonErrors: ["Voeg ekstra krag by vir versnelling."],
      },
    ],
  },

  "PHYS-5": {
    workedExamplesEn: [
      {
        question: "An ambulance siren emits 600 Hz and approaches a stationary observer at 30 m·s⁻¹. Speed of sound = 340 m·s⁻¹. Find the frequency heard.",
        steps: [
          "Source approaches stationary observer: f_L = f_s · v / (v − v_s).",
          "f_L = 600 × 340 / (340 − 30) = 600 × 340 / 310.",
          "f_L ≈ 658 Hz.",
        ],
        solution: "f ≈ 658 Hz",
        commonErrors: [
          "Adding v_s to v (gives the receding case).",
          "Mixing up the source and listener speeds.",
        ],
      },
      {
        question: "A car travels away from a stationary horn at 25 m·s⁻¹. The horn emits 500 Hz. Find the frequency heard inside the car (v = 340).",
        steps: [
          "Listener moving away from stationary source: f_L = f_s · (v − v_L) / v.",
          "f_L = 500 × (340 − 25) / 340 = 500 × 315/340 ≈ 463 Hz.",
        ],
        solution: "f ≈ 463 Hz",
        commonErrors: [
          "Putting v_L in the denominator instead of the numerator.",
          "Treating it like an approaching scenario (gives a higher frequency).",
        ],
      },
      {
        question: "Light from a galaxy shows a red shift. Briefly explain what this implies about the galaxy's motion.",
        steps: [
          "Observed wavelength longer than emitted → frequency lower.",
          "Frequency drop in the Doppler effect implies the source is moving away.",
          "Therefore the galaxy is receding from Earth.",
        ],
        solution: "The galaxy is moving away from Earth.",
        commonErrors: [
          "Saying red shift = source approaching (that would be blue shift).",
          "Concluding red shift implies the galaxy is hot or red-coloured.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Ambulans (600 Hz) nader stilstaande waarnemer @ 30 m·s⁻¹; v = 340.",
        steps: ["f_L = 600 · 340/310 ≈ 658 Hz."],
        solution: "≈ 658 Hz",
        commonErrors: ["Verkeerde teken op v_s."],
      },
      {
        question: "Motor beweeg weg van 500 Hz horing @ 25 m·s⁻¹.",
        steps: ["f_L = 500 · (340 − 25)/340 ≈ 463 Hz."],
        solution: "≈ 463 Hz",
        commonErrors: ["v_L in noemer plaas."],
      },
      {
        question: "Rooi-verskuiwing van sterrestelsel — wat dui dit aan?",
        steps: ["Frekwensie laer → bron beweeg weg."],
        solution: "Sterrestelsel beweeg weg van Aarde",
        commonErrors: ["Verwar rooi en blou verskuiwing."],
      },
    ],
  },

  "PHYS-6": {
    workedExamplesEn: [
      {
        question: "A battery with emf 12 V and internal resistance 0.5 Ω is connected to two parallel resistors of 6 Ω and 12 Ω. Find the current drawn from the battery.",
        steps: [
          "Parallel combination: 1/R_p = 1/6 + 1/12 = 2/12 + 1/12 = 3/12 → R_p = 4 Ω.",
          "Total: R_total = R_p + r = 4 + 0.5 = 4.5 Ω.",
          "I = emf / R_total = 12 / 4.5 ≈ 2.67 A.",
        ],
        solution: "I ≈ 2.67 A",
        commonErrors: [
          "Adding parallel resistors directly (6 + 12 = 18 — wrong).",
          "Forgetting to include internal resistance in the total.",
        ],
      },
      {
        question: "For the same circuit above, find the terminal voltage of the battery.",
        steps: [
          "V_terminal = emf − I·r = 12 − 2.67 × 0.5 ≈ 12 − 1.33 ≈ 10.67 V.",
          "Equivalently V_terminal = I·R_p = 2.67 × 4 ≈ 10.67 V.",
        ],
        solution: "V_terminal ≈ 10.67 V",
        commonErrors: [
          "Reporting emf as terminal voltage (ignores internal drop).",
          "Subtracting V·r instead of I·r.",
        ],
      },
      {
        question: "A 60 W lamp is used for 4 hours. Energy company charges R2.50 per kWh. Find the cost.",
        steps: [
          "Energy = P · t = 60 W × 4 h = 240 Wh = 0.24 kWh.",
          "Cost = 0.24 × R2.50 = R0.60.",
        ],
        solution: "Cost = R0.60",
        commonErrors: [
          "Mixing Wh and kWh (off by 1 000).",
          "Multiplying voltage by current without confirming the rated power.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "12 V battery, r = 0.5 Ω, parallelle weerstande 6 Ω en 12 Ω. Stroom uit battery?",
        steps: ["R_p = 4 Ω; R_tot = 4.5 Ω; I ≈ 2.67 A."],
        solution: "≈ 2.67 A",
        commonErrors: ["Tel parallelle weerstande direk op."],
      },
      {
        question: "Bo: terminale spanning?",
        steps: ["V = 12 − 2.67·0.5 ≈ 10.67 V."],
        solution: "≈ 10.67 V",
        commonErrors: ["Aanvaar emk = terminaal."],
      },
      {
        question: "60 W lamp, 4 h, @ R2.50/kWh.",
        steps: ["0.24 kWh × R2.50 = R0.60."],
        solution: "R0.60",
        commonErrors: ["Verwar Wh en kWh."],
      },
    ],
  },

  "PHYS-7": {
    workedExamplesEn: [
      {
        question: "A generator produces an rms voltage of 220 V. Find the peak (maximum) voltage.",
        steps: [
          "V_max = V_rms · √2 = 220 · 1.4142 ≈ 311 V.",
        ],
        solution: "V_max ≈ 311 V",
        commonErrors: [
          "Dividing by √2 (that converts max → rms, not rms → max).",
          "Using factor 2 instead of √2.",
        ],
      },
      {
        question: "Explain the difference between an AC generator and a DC generator in one sentence each, focusing on the type of contact ring used.",
        steps: [
          "AC generator: uses two slip rings — output reverses polarity each half cycle, producing alternating current.",
          "DC generator: uses a split-ring commutator — output is rectified so current flows in one direction only.",
        ],
        solution: "AC: slip rings (alternating output); DC: split-ring commutator (one-direction output)",
        commonErrors: [
          "Confusing slip rings and split-ring commutators.",
          "Saying AC generators 'have no commutator' without explaining slip rings.",
        ],
      },
      {
        question: "An AC source delivers V_rms = 110 V to a 22 Ω resistor. Calculate the average power dissipated.",
        steps: [
          "P_avg = V_rms² / R = 110² / 22 = 12 100 / 22 = 550 W.",
        ],
        solution: "P_avg = 550 W",
        commonErrors: [
          "Using V_max instead of V_rms (gives double the answer).",
          "Confusing P with energy (no time factor needed for average power).",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Effektiewe spanning 220 V. Vind piekspanning.",
        steps: ["V_maks = 220√2 ≈ 311 V."],
        solution: "≈ 311 V",
        commonErrors: ["Deel deur √2 i.p.v. vermenigvuldig."],
      },
      {
        question: "Verskil tussen WS- en GS-generator (kort).",
        steps: ["WS: glipringe; GS: gesplete-ring kommutator."],
        solution: "WS: glipringe; GS: gesplete-ring kommutator",
        commonErrors: ["Verwar glipring en kommutator."],
      },
      {
        question: "V_eff = 110 V oor 22 Ω. Gemiddelde drywing?",
        steps: ["P = 110²/22 = 550 W."],
        solution: "550 W",
        commonErrors: ["Gebruik V_maks."],
      },
    ],
  },

  "PHYS-8": {
    workedExamplesEn: [
      {
        question: "A metal has work function 3.0 × 10⁻¹⁹ J. Light of frequency 6.0 × 10¹⁴ Hz strikes it. Determine if photoelectrons are emitted (h = 6.63 × 10⁻³⁴ J·s).",
        steps: [
          "Photon energy E = h·f = 6.63 × 10⁻³⁴ × 6.0 × 10¹⁴ ≈ 3.98 × 10⁻¹⁹ J.",
          "Compare with work function: 3.98 × 10⁻¹⁹ > 3.0 × 10⁻¹⁹.",
          "E > W₀ → photoelectrons are emitted.",
        ],
        solution: "Yes — emission occurs because photon energy exceeds the work function.",
        commonErrors: [
          "Using intensity instead of frequency to decide emission.",
          "Subtracting wavelength rather than computing energy.",
        ],
      },
      {
        question: "In the same setup, calculate the maximum kinetic energy of the emitted electrons.",
        steps: [
          "E_k(max) = h·f − W₀ = 3.98 × 10⁻¹⁹ − 3.0 × 10⁻¹⁹.",
          "= 0.98 × 10⁻¹⁹ J ≈ 9.8 × 10⁻²⁰ J.",
        ],
        solution: "E_k(max) ≈ 9.8 × 10⁻²⁰ J",
        commonErrors: [
          "Adding instead of subtracting the work function.",
          "Reporting E_k as h·f without subtracting W₀.",
        ],
      },
      {
        question: "Explain in one paragraph why increasing the intensity of low-frequency light does NOT produce photoelectrons.",
        steps: [
          "Light interacts with electrons one photon at a time.",
          "Each photon's energy depends on frequency (E = h·f), not on intensity.",
          "If h·f < W₀, no single photon can free an electron — increasing the number of photons (intensity) does not change each photon's energy.",
          "Therefore no emission, regardless of intensity.",
        ],
        solution: "Photons act individually; without enough per-photon energy (frequency), more photons cannot eject electrons.",
        commonErrors: [
          "Claiming many low-energy photons can 'add up' to free an electron.",
          "Confusing intensity (brightness) with frequency (colour).",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "W₀ = 3.0 × 10⁻¹⁹ J. f = 6.0 × 10¹⁴ Hz. Word elektrone uitgeslaan?",
        steps: ["E = hf ≈ 3.98 × 10⁻¹⁹ J > W₀ → ja."],
        solution: "Ja",
        commonErrors: ["Gebruik intensiteit i.p.v. frekwensie."],
      },
      {
        question: "Maks kinetiese energie van elektrone?",
        steps: ["E_k = hf − W₀ ≈ 9.8 × 10⁻²⁰ J."],
        solution: "≈ 9.8 × 10⁻²⁰ J",
        commonErrors: ["Tel op i.p.v. trek af."],
      },
      {
        question: "Hoekom slaan meer intense laagfrekwensie lig geen elektrone uit?",
        steps: ["Foton-vir-foton interaksie; energie hang van f af, nie intensiteit."],
        solution: "Per-foton energie bly te laag",
        commonErrors: ["Beweer fotonenergie kombineer."],
      },
    ],
  },

  // ===================== PHYSICAL SCIENCES — CHEMISTRY (PHYS-9, PHYS-10) =====================

  "PHYS-9": {
    workedExamplesEn: [
      {
        question: "Write the half-reactions and net redox equation for a Zn / Cu²⁺ galvanic cell. Identify the anode and cathode.",
        steps: [
          "Zn(s) → Zn²⁺(aq) + 2e⁻  (oxidation — anode).",
          "Cu²⁺(aq) + 2e⁻ → Cu(s)  (reduction — cathode).",
          "Net: Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s).",
        ],
        solution: "Anode: Zn; Cathode: Cu. Net: Zn + Cu²⁺ → Zn²⁺ + Cu",
        commonErrors: [
          "Reversing anode and cathode (anode is always oxidation, cathode reduction).",
          "Forgetting to balance electrons (both are 2 e⁻ here).",
        ],
      },
      {
        question: "Calculate the standard emf of the cell above given E°(Zn²⁺/Zn) = −0.76 V and E°(Cu²⁺/Cu) = +0.34 V.",
        steps: [
          "E°_cell = E°_cathode − E°_anode.",
          "E°_cell = +0.34 − (−0.76) = +1.10 V.",
        ],
        solution: "E°_cell = +1.10 V",
        commonErrors: [
          "Subtracting in the wrong direction (sign of result wrong).",
          "Reversing the sign of the half-cell when written as reduction.",
        ],
      },
      {
        question: "In the electrolysis of molten NaCl, write the electrode reactions and explain why this differs from electrolysis of brine (aqueous NaCl).",
        steps: [
          "Molten NaCl: Cathode 2Na⁺ + 2e⁻ → 2Na. Anode 2Cl⁻ → Cl₂ + 2e⁻.",
          "Brine has water; reduction of H₂O is energetically preferred at the cathode → H₂(g) instead of Na.",
          "Anode in brine still gives Cl₂ (overpotential favours Cl⁻ over OH⁻).",
        ],
        solution: "Molten: Na + Cl₂. Brine: H₂ + Cl₂ (plus NaOH in solution)",
        commonErrors: [
          "Predicting Na from brine (water is reduced first).",
          "Predicting O₂ from brine (overpotential keeps Cl₂ as anode product).",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Halfreaksies en nettoreaksie van Zn/Cu²⁺ sel. Anode en katode?",
        steps: [
          "Zn → Zn²⁺ + 2e⁻ (anode); Cu²⁺ + 2e⁻ → Cu (katode).",
          "Net: Zn + Cu²⁺ → Zn²⁺ + Cu.",
        ],
        solution: "Anode Zn; Katode Cu",
        commonErrors: ["Verwissel anode en katode."],
      },
      {
        question: "Standard emk: E°(Zn²⁺/Zn) = −0.76, E°(Cu²⁺/Cu) = +0.34.",
        steps: ["E° = 0.34 − (−0.76) = +1.10 V."],
        solution: "+1.10 V",
        commonErrors: ["Verkeerde rigting van aftrekking."],
      },
      {
        question: "Vergelyk elektrolise van gesmelte NaCl en pekel.",
        steps: [
          "Gesmelt: Na + Cl₂.",
          "Pekel: H₂ + Cl₂ (water gereduseer eerder as Na⁺).",
        ],
        solution: "Gesmelt: Na+Cl₂; Pekel: H₂+Cl₂",
        commonErrors: ["Voorspel Na uit pekel."],
      },
    ],
  },

  "PHYS-10": {
    workedExamplesEn: [
      {
        question: "Write the balanced equation for the industrial production of ammonia (Haber process) and state two conditions used.",
        steps: [
          "Balanced: N₂(g) + 3H₂(g) ⇌ 2NH₃(g)  ΔH < 0 (exothermic).",
          "Conditions: high pressure (~200 atm) — drives equilibrium right; moderate temperature (~450 °C) — kinetic compromise.",
          "Catalyst: iron promoted with K₂O / Al₂O₃ to speed up the reaction.",
        ],
        solution: "N₂ + 3H₂ ⇌ 2NH₃; ~200 atm, ~450 °C, Fe catalyst",
        commonErrors: [
          "Forgetting the equilibrium arrow (the reaction is reversible).",
          "Using extremely high temperature (would push equilibrium back to reactants).",
        ],
      },
      {
        question: "Why is the temperature in the Haber process kept at ~450 °C rather than much lower, given the forward reaction is exothermic?",
        steps: [
          "Lower T favours NH₃ at equilibrium (Le Chatelier), but the rate becomes too slow.",
          "Higher T gives faster rate but lower equilibrium yield.",
          "~450 °C is a compromise between acceptable yield and acceptable rate.",
        ],
        solution: "A kinetic-thermodynamic compromise: enough yield, fast enough rate.",
        commonErrors: [
          "Saying high temperature 'increases yield' for an exothermic reaction.",
          "Ignoring rate considerations.",
        ],
      },
      {
        question: "Write the balanced equation for the conversion of ammonia to nitric acid (Ostwald process, first step) and state the catalyst.",
        steps: [
          "Step 1: 4NH₃(g) + 5O₂(g) → 4NO(g) + 6H₂O(g).",
          "Catalyst: platinum-rhodium gauze at ~850 °C.",
        ],
        solution: "4NH₃ + 5O₂ → 4NO + 6H₂O over Pt-Rh catalyst",
        commonErrors: [
          "Writing NO₂ as the direct product (forms only in step 2).",
          "Forgetting to balance H atoms after balancing N.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Gebalanseerde vergelyking en toestande vir Haber-proses.",
        steps: ["N₂ + 3H₂ ⇌ 2NH₃; ~200 atm, ~450 °C, Fe katalisator."],
        solution: "Soos hierbo",
        commonErrors: ["Vergeet ewewig pyl."],
      },
      {
        question: "Hoekom ~450 °C en nie veel laer nie?",
        steps: ["Laer T = hoër opbrengs maar te stadig; balans tussen tempo en opbrengs."],
        solution: "Kompromis tussen tempo en opbrengs",
        commonErrors: ["Sê hoë T verhoog opbrengs van eksotermiese reaksie."],
      },
      {
        question: "Eerste stap van Ostwald-proses (NH₃ → HNO₃).",
        steps: ["4NH₃ + 5O₂ → 4NO + 6H₂O; Pt-Rh katalisator."],
        solution: "Soos hierbo",
        commonErrors: ["Skryf NO₂ as direkte produk."],
      },
    ],
  },

  // ===================== LIFE SCIENCES (LIFE) =====================

  "LIFE-1": {
    workedExamplesEn: [
      {
        question: "Describe how a DNA molecule is replicated, naming the enzyme that joins new nucleotides.",
        steps: [
          "Helicase unwinds and separates the two strands at the replication fork.",
          "Each old strand acts as a template; free nucleotides pair via complementary base pairing (A-T, C-G).",
          "DNA polymerase joins nucleotides in the 5'→3' direction to form the new strand.",
          "Result: two identical DNA molecules, each with one old + one new strand (semi-conservative).",
        ],
        solution: "Semi-conservative replication using DNA polymerase to join new nucleotides.",
        commonErrors: [
          "Naming RNA polymerase (used in transcription, not replication).",
          "Saying both strands are completely new ('conservative' — wrong).",
        ],
      },
      {
        question: "Compare DNA and RNA in three ways: sugar, bases, and number of strands.",
        steps: [
          "Sugar: DNA has deoxyribose; RNA has ribose.",
          "Bases: both have A, C, G; DNA has thymine (T), RNA has uracil (U).",
          "Strands: DNA is double-stranded; RNA is single-stranded.",
        ],
        solution: "Sugar (deoxyribose vs ribose); base (T vs U); strands (double vs single).",
        commonErrors: [
          "Saying RNA has thymine.",
          "Saying both are double-stranded.",
        ],
      },
      {
        question: "If a DNA template strand reads 3'-TAC GGA TTC-5', write the mRNA produced during transcription.",
        steps: [
          "Read template 3'→5' and write mRNA 5'→3'.",
          "Pair: T→A, A→U, C→G, G→C, G→C, A→U, T→A, T→A, C→G.",
          "mRNA: 5'-AUG CCU AAG-3'.",
        ],
        solution: "5'-AUG CCU AAG-3'",
        commonErrors: [
          "Writing T instead of U in mRNA.",
          "Reading the template the wrong direction.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Beskryf DNA-replisering en noem die ensiem wat nukleotiede aanmekaar verbind.",
        steps: [
          "Helikase ontvou; elke ou string is 'n templaat; basisparing A-T, C-G.",
          "DNA-polimerase verbind nukleotiede (5'→3').",
          "Semi-konserwatief.",
        ],
        solution: "Semi-konserwatief; DNA-polimerase",
        commonErrors: ["Noem RNA-polimerase."],
      },
      {
        question: "Vergelyk DNA en RNA (suiker, basisse, strenge).",
        steps: ["DNA: deoksiribose, T, dubbel. RNA: ribose, U, enkel."],
        solution: "Soos hierbo",
        commonErrors: ["Sê RNA bevat tymien."],
      },
      {
        question: "DNA templaat 3'-TAC GGA TTC-5'. Skryf mRNA.",
        steps: ["5'-AUG CCU AAG-3'."],
        solution: "5'-AUG CCU AAG-3'",
        commonErrors: ["Skryf T i.p.v. U."],
      },
    ],
  },

  "LIFE-2": {
    workedExamplesEn: [
      {
        question: "List three differences between meiosis and mitosis.",
        steps: [
          "Number of divisions: meiosis has two; mitosis has one.",
          "Daughter cells: meiosis = 4 haploid (n); mitosis = 2 diploid (2n).",
          "Genetic variation: meiosis produces variation (crossing over + independent assortment); mitosis produces genetically identical cells.",
        ],
        solution: "2 vs 1 divisions; 4n vs 2 diploid daughters; variation vs identical clones.",
        commonErrors: [
          "Saying mitosis produces haploid cells.",
          "Confusing crossing over with non-disjunction.",
        ],
      },
      {
        question: "Explain how crossing over during prophase I increases genetic variation.",
        steps: [
          "Homologous chromosomes pair up to form bivalents.",
          "Non-sister chromatids exchange equivalent segments at chiasmata.",
          "This produces new combinations of alleles on each chromatid.",
          "Gametes carry novel allele combinations not present in either parent's original chromosomes.",
        ],
        solution: "New allele combinations form on each chromatid → unique gametes.",
        commonErrors: [
          "Saying crossing over happens between sister chromatids (it is non-sister).",
          "Confusing it with random fertilisation.",
        ],
      },
      {
        question: "A cell has 8 chromosomes before meiosis. How many chromosomes are in each of the 4 daughter cells?",
        steps: [
          "Parent diploid: 2n = 8, so n = 4.",
          "Meiosis halves the number → each gamete has n = 4 chromosomes.",
        ],
        solution: "Each daughter cell has 4 chromosomes",
        commonErrors: [
          "Saying 2 (halving twice).",
          "Reporting 8 (forgetting the halving).",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Drie verskille tussen meiose en mitose.",
        steps: [
          "Verdelings: 2 vs 1.",
          "Dogters: 4 haploïed vs 2 diploïed.",
          "Variasie: ja vs nee.",
        ],
        solution: "Soos hierbo",
        commonErrors: ["Sê mitose lewer haploïed sel op."],
      },
      {
        question: "Hoe verhoog oorkruising in profase I variasie?",
        steps: [
          "Homoloë pare vorm bivalente; nie-suster chromatide ruil dele.",
          "Nuwe alleelkombinasies in gamete.",
        ],
        solution: "Nuwe alleelkombinasies",
        commonErrors: ["Sê tussen susterchromatide."],
      },
      {
        question: "Selch met 8 chromosome — hoeveel in elke meiose-dogter?",
        steps: ["n = 4 → 4 chromosome elk."],
        solution: "4",
        commonErrors: ["Antwoord 2 of 8."],
      },
    ],
  },

  "LIFE-3": {
    workedExamplesEn: [
      {
        question: "Compare external and internal fertilisation, giving one advantage of each.",
        steps: [
          "External: gametes meet outside the body (e.g. fish, frogs). Advantage: large numbers of offspring possible.",
          "Internal: gametes meet inside the female (e.g. mammals, birds). Advantage: higher protection and survival rate per offspring.",
        ],
        solution: "External (frog) — many offspring; Internal (mammal) — better survival",
        commonErrors: [
          "Claiming external fertilisation needs no water (it does).",
          "Saying all reptiles use external fertilisation.",
        ],
      },
      {
        question: "Why do amphibians need water to reproduce while mammals do not?",
        steps: [
          "Amphibians use external fertilisation — water provides a medium for sperm to reach eggs.",
          "Amphibian eggs lack a hard shell and dry out quickly in air.",
          "Mammals use internal fertilisation and the embryo develops inside the mother, supplied by a placenta — no water needed externally.",
        ],
        solution: "External fertilisation + un-shelled eggs in amphibians require water.",
        commonErrors: [
          "Saying mammals 'do not need water at all' (they do — for cells; not for fertilisation).",
          "Confusing amphibians with reptiles (reptiles have shelled eggs).",
        ],
      },
      {
        question: "List three reproductive strategies that mammals use to maximise offspring survival.",
        steps: [
          "Internal fertilisation reduces gamete wastage and increases successful fusion.",
          "Internal development (placental gestation) protects the embryo and supplies nutrients/oxygen.",
          "Parental care after birth (milk, defence) supports the young until they are independent.",
        ],
        solution: "Internal fertilisation; placental gestation; postnatal parental care.",
        commonErrors: [
          "Listing 'large numbers of offspring' (that is an r-strategy used by fish, not most mammals).",
          "Saying mammals lay eggs (only monotremes do).",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Vergelyk eksterne en interne bevrugting; gee 'n voordeel van elk.",
        steps: [
          "Ekstern: gamete buite (visse); baie nakomelinge.",
          "Intern: gamete binne (soogdiere); beter oorlewing.",
        ],
        solution: "Soos hierbo",
        commonErrors: ["Beweer eksterne bevrugting benodig nie water nie."],
      },
      {
        question: "Hoekom benodig amfibieë water om voort te plant en soogdiere nie?",
        steps: [
          "Eksterne bevrugting + sagte eiers benodig water.",
          "Soogdier-embrio ontwikkel binne moeder via plasenta.",
        ],
        solution: "Eksterne bevrugting + ongeskaalde eiers",
        commonErrors: ["Verwar amfibieë en reptiele."],
      },
      {
        question: "Drie soogdier-voortplantingsstrategieë wat oorlewing verhoog.",
        steps: ["Interne bevrugting; plasentale dragtigheid; nasorg/melk."],
        solution: "Soos hierbo",
        commonErrors: ["Noem 'baie nakomelinge' (vis-strategie)."],
      },
    ],
  },

  "LIFE-4": {
    workedExamplesEn: [
      {
        question: "Name the four hormones of the menstrual cycle and the gland that secretes each.",
        steps: [
          "FSH — anterior pituitary — stimulates follicle development.",
          "LH — anterior pituitary — triggers ovulation.",
          "Oestrogen — ovarian follicle — rebuilds endometrium.",
          "Progesterone — corpus luteum (post-ovulation) — maintains endometrium.",
        ],
        solution: "FSH & LH (pituitary); oestrogen (follicle); progesterone (corpus luteum)",
        commonErrors: [
          "Saying the ovary secretes FSH/LH (it is the pituitary).",
          "Confusing oestrogen and progesterone in timing.",
        ],
      },
      {
        question: "Describe how the contraceptive pill prevents pregnancy.",
        steps: [
          "Contains synthetic oestrogen and progesterone.",
          "High blood levels of these hormones inhibit secretion of FSH and LH from the pituitary (negative feedback).",
          "Without LH, ovulation does not occur — no egg is released.",
          "Thicker cervical mucus also slows sperm transport.",
        ],
        solution: "Synthetic hormones suppress FSH/LH → no ovulation.",
        commonErrors: [
          "Saying the pill 'kills the egg' (it prevents ovulation entirely).",
          "Confusing it with emergency contraception.",
        ],
      },
      {
        question: "Why is implantation of a fertilised egg only possible during a narrow window each cycle?",
        steps: [
          "Endometrium must be thick and vascular — peak around days 19–23.",
          "Progesterone (from corpus luteum) maintains this state for a limited time after ovulation.",
          "If no implantation occurs, corpus luteum degenerates → progesterone falls → endometrium sheds (menstruation).",
        ],
        solution: "Endometrial readiness is hormone-dependent and lasts only ~5 days.",
        commonErrors: [
          "Saying implantation can happen at any time during the cycle.",
          "Forgetting the role of the corpus luteum.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Vier hormone van menstruele siklus en hul kliere.",
        steps: ["FSH/LH — pituïtêr; estrogeen — follikel; progesteroon — corpus luteum."],
        solution: "Soos hierbo",
        commonErrors: ["Sê ovaria skei FSH af."],
      },
      {
        question: "Hoe verhoed die pil swangerskap?",
        steps: ["Sintetiese hormone onderdruk FSH/LH → geen ovulasie."],
        solution: "Onderdruk ovulasie",
        commonErrors: ["Verwar met noodpil."],
      },
      {
        question: "Hoekom is innesteling slegs binne 'n smal venster moontlik?",
        steps: ["Endometrium gereed slegs ~dae 19–23 (progesteroon)."],
        solution: "Hormoonafhanklike vensterperiode",
        commonErrors: ["Sê dit kan enige tyd gebeur."],
      },
    ],
  },

  "LIFE-5": {
    workedExamplesEn: [
      {
        question: "In pea plants, tall (T) is dominant over short (t). Cross Tt × Tt and give the genotypic and phenotypic ratio.",
        steps: [
          "Punnett square: gametes T, t × T, t → TT, Tt, Tt, tt.",
          "Genotypic ratio: 1 TT : 2 Tt : 1 tt.",
          "Phenotypic ratio: 3 tall : 1 short.",
        ],
        solution: "Genotype 1:2:1; phenotype 3:1",
        commonErrors: [
          "Reporting 1:2:1 as the phenotypic ratio.",
          "Forgetting one of the four boxes in the Punnett square.",
        ],
      },
      {
        question: "Explain how the ABO blood group system is an example of multiple alleles and codominance.",
        steps: [
          "Three alleles: I^A, I^B, i (multiple alleles, more than two in the population).",
          "I^A and I^B are codominant — both expressed in I^A I^B individuals (blood type AB).",
          "Both are dominant over i — I^A I^A or I^A i gives type A; I^B I^B or I^B i gives type B.",
          "ii gives type O.",
        ],
        solution: "Three alleles in the population; I^A and I^B codominant; both dominant over i.",
        commonErrors: [
          "Calling AB 'incomplete dominance' (it is codominance — both expressed fully).",
          "Saying there are four alleles.",
        ],
      },
      {
        question: "Colour-blindness is X-linked recessive. A carrier mother (X^B X^b) marries a normal father (X^B Y). What is the probability of a colour-blind son?",
        steps: [
          "Mother's gametes: X^B, X^b.",
          "Father's gametes: X^B, Y.",
          "Sons receive Y from father, X from mother: X^B Y (normal) or X^b Y (colour-blind).",
          "P(colour-blind son | a son is born) = ½.",
        ],
        solution: "½ of sons (or 25% of all offspring) will be colour-blind",
        commonErrors: [
          "Reporting ¼ as 'the probability of a colour-blind son' without specifying among all offspring.",
          "Treating colour-blindness as autosomal.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Ertjieplant Tt × Tt. Genotipiese en fenotipiese verhoudings?",
        steps: ["1 TT : 2 Tt : 1 tt; 3 lank : 1 kort."],
        solution: "1:2:1 / 3:1",
        commonErrors: ["Verwar genotipe en fenotipe verhoudings."],
      },
      {
        question: "ABO bloedgroep — meervoudige allele en kodominansie.",
        steps: ["Drie allele I^A, I^B, i; I^A en I^B kodominant."],
        solution: "Soos hierbo",
        commonErrors: ["Noem dit onvolledige dominansie."],
      },
      {
        question: "Kleurblindheid X-gekoppel resessief. Draermoeder × normale pa. P(kleurblinde seun)?",
        steps: ["Seuns: ½ X^B Y, ½ X^b Y → ½ kleurblind."],
        solution: "½ van seuns",
        commonErrors: ["Behandel as outosomaal."],
      },
    ],
  },

  "LIFE-6": {
    workedExamplesEn: [
      {
        question: "State Darwin's theory of natural selection in four steps.",
        steps: [
          "Variation: individuals in a population differ in heritable traits.",
          "Overproduction: more offspring are produced than the environment can support.",
          "Struggle for existence: competition for limited resources occurs.",
          "Survival of the fittest: individuals with advantageous traits survive, reproduce and pass those traits on — over generations the population changes.",
        ],
        solution: "Variation → overproduction → struggle → differential survival/reproduction.",
        commonErrors: [
          "Saying organisms 'choose' or 'try' to evolve (Lamarckian).",
          "Skipping heritability — only heritable traits can drive evolution.",
        ],
      },
      {
        question: "Explain how antibiotic resistance in bacteria is an example of natural selection.",
        steps: [
          "Random mutations in a bacterial population produce a few resistant cells.",
          "When antibiotic is applied, susceptible cells die; resistant cells survive.",
          "Resistant cells reproduce rapidly (binary fission) — passing resistance to offspring.",
          "Over time, the population becomes predominantly resistant.",
        ],
        solution: "Antibiotic = selective pressure; resistant mutants reproduce → resistant population.",
        commonErrors: [
          "Saying bacteria 'develop' resistance in response to the antibiotic.",
          "Confusing acquired resistance via plasmid transfer with classical Lamarckism.",
        ],
      },
      {
        question: "Give three lines of evidence that support the theory of evolution.",
        steps: [
          "Fossil record: shows a sequence of change from simple to complex forms over time.",
          "Comparative anatomy: homologous structures (e.g. pentadactyl limb) indicate common ancestry.",
          "Molecular biology: DNA similarity between species (e.g. ~98% between humans and chimpanzees).",
        ],
        solution: "Fossils; homologous anatomy; DNA similarity.",
        commonErrors: [
          "Citing analogous structures as evidence of common ancestry (they are evidence of convergent evolution).",
          "Confusing 'theory' with 'guess' — evolutionary theory is supported by multiple converging lines of evidence.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Darwin se vier stappe van natuurlike seleksie.",
        steps: ["Variasie → oorproduksie → stryd → oorlewing van die geskiktes."],
        solution: "Soos hierbo",
        commonErrors: ["Sê organismes 'kies' om te evolueer."],
      },
      {
        question: "Antibiotika-weerstand as natuurlike seleksie.",
        steps: ["Mutasie → seleksiedruk → weerstandige selle plant voort."],
        solution: "Soos hierbo",
        commonErrors: ["Sê bakterieë 'ontwikkel' weerstand in reaksie."],
      },
      {
        question: "Drie bewysstroomlyne vir evolusie.",
        steps: ["Fossiele; homoloë strukture; DNA-vergelyking."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar analoog met homoloog."],
      },
    ],
  },

  "LIFE-7": {
    workedExamplesEn: [
      {
        question: "List three skeletal differences between modern humans and African apes.",
        steps: [
          "Foramen magnum: in humans it lies centrally beneath the skull (bipedal); in apes it is at the back (quadrupedal).",
          "Pelvis: humans have a broad, bowl-shaped pelvis supporting upright posture; ape pelvis is long and narrow.",
          "Spine curvature: human spine is S-shaped (lumbar lordosis); apes have a C-shaped spine.",
        ],
        solution: "Foramen magnum position; pelvic shape; spinal curvature.",
        commonErrors: [
          "Listing brain size only — that is a soft-tissue / capacity feature, not strictly skeletal in the way the question expects.",
          "Saying both have an opposable thumb (apes have one too).",
        ],
      },
      {
        question: "Outline two pieces of evidence that hominids originated in Africa.",
        steps: [
          "Oldest hominid fossils (Australopithecus, Homo habilis) all found in East/South Africa.",
          "Genetic studies show greatest genetic diversity in African human populations — consistent with longest time of human existence in Africa.",
        ],
        solution: "African fossils; African genetic diversity.",
        commonErrors: [
          "Citing only the 'Out of Africa' name without evidence.",
          "Saying fossils are equally distributed across continents.",
        ],
      },
      {
        question: "Why do anthropologists consider bipedalism a key adaptation in human evolution?",
        steps: [
          "Freed the hands for tool use and carrying food.",
          "Allowed long-distance walking with lower energy cost than knuckle-walking.",
          "Raised the head — better view above grassland vegetation, useful for detecting predators and prey.",
        ],
        solution: "Free hands; energy efficiency; improved vision over grassland.",
        commonErrors: [
          "Saying bipedalism caused brain enlargement directly (link is indirect).",
          "Claiming all primates are bipedal.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Drie skeletverskille tussen mens en Afrikaanse aap.",
        steps: ["Foramen magnum-posisie; bekken-vorm; spinaalkurwe."],
        solution: "Soos hierbo",
        commonErrors: ["Noem net breingrootte."],
      },
      {
        question: "Twee bewyse dat hominiede in Afrika ontstaan het.",
        steps: ["Oudste fossiele in Afrika; grootste genetiese diversiteit in Afrika."],
        solution: "Soos hierbo",
        commonErrors: ["Geen bewys gee nie."],
      },
      {
        question: "Hoekom is tweevoetige loop 'n sleutel-aanpassing?",
        steps: ["Vry hande; energie-doeltreffend; beter sig oor grasvelde."],
        solution: "Soos hierbo",
        commonErrors: ["Sê alle primate is tweevoetig."],
      },
    ],
  },

  "LIFE-8": {
    workedExamplesEn: [
      {
        question: "Trace the path of a reflex arc when you touch a hot object.",
        steps: [
          "Receptor (heat/pain receptors in skin) detect the stimulus.",
          "Sensory neuron carries impulse to the spinal cord.",
          "An interneuron in the spinal cord relays the signal directly to a motor neuron.",
          "Motor neuron carries the impulse to the effector muscle in the arm.",
          "Effector (biceps) contracts — hand is withdrawn before the brain processes the pain.",
        ],
        solution: "Receptor → sensory neuron → interneuron (spinal cord) → motor neuron → effector",
        commonErrors: [
          "Routing the signal through the brain (would be too slow for a reflex).",
          "Omitting the interneuron.",
        ],
      },
      {
        question: "Explain how an impulse is transmitted across a synapse.",
        steps: [
          "Impulse reaches the presynaptic terminal, triggering Ca²⁺ influx.",
          "Synaptic vesicles fuse with the membrane and release neurotransmitter into the synaptic cleft.",
          "Neurotransmitter diffuses across the cleft and binds to receptors on the postsynaptic membrane.",
          "Ion channels open, depolarising the postsynaptic neuron and (if threshold is reached) generating a new impulse.",
        ],
        solution: "Vesicles release neurotransmitter → binds postsynaptic receptors → new impulse",
        commonErrors: [
          "Saying the impulse 'jumps' across the synapse electrically.",
          "Forgetting that neurotransmitter is removed/broken down to end signalling.",
        ],
      },
      {
        question: "Compare the role of the sympathetic and parasympathetic nervous systems during a stressful event vs at rest.",
        steps: [
          "Sympathetic dominates during stress: increases heart rate, dilates pupils, diverts blood to muscles, slows digestion ('fight or flight').",
          "Parasympathetic dominates at rest: slows heart rate, constricts pupils, promotes digestion ('rest and digest').",
          "Both branches act on the same organs but produce opposite effects — homeostatic balance.",
        ],
        solution: "Sympathetic = fight-or-flight; Parasympathetic = rest-and-digest.",
        commonErrors: [
          "Treating them as anatomically separate organs (they share the autonomic system).",
          "Mixing up which branch slows the heart.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Pad van 'n refleksboog wanneer jy 'n warm voorwerp aanraak.",
        steps: ["Reseptor → sensoriese neuron → interneuron (rugmurg) → motoriese neuron → spier."],
        solution: "Soos hierbo",
        commonErrors: ["Stuur deur die brein."],
      },
      {
        question: "Hoe word 'n impuls oor 'n sinaps oorgedra?",
        steps: [
          "Ca²⁺ → blasies vrystel neurotransmitter → bind postsinaps → depolariseer.",
        ],
        solution: "Soos hierbo",
        commonErrors: ["Beweer elektriese 'sprong'."],
      },
      {
        question: "Sympatiese vs parasimpatiese tydens stres en in rus.",
        steps: ["Sympaties: veg-of-vlug. Parasympaties: rus-en-verteer."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar wie hartklop verlaag."],
      },
    ],
  },

  "LIFE-9": {
    workedExamplesEn: [
      {
        question: "Name three hormones and the gland that secretes each, with one function per hormone.",
        steps: [
          "Insulin — pancreas — lowers blood glucose by promoting cellular uptake and glycogen synthesis.",
          "Thyroxine — thyroid — regulates metabolic rate.",
          "Adrenaline — adrenal medulla — prepares body for 'fight or flight' (raises heart rate, mobilises glucose).",
        ],
        solution: "Insulin (pancreas); thyroxine (thyroid); adrenaline (adrenal medulla)",
        commonErrors: [
          "Listing pituitary as the source of every hormone.",
          "Swapping insulin and glucagon functions.",
        ],
      },
      {
        question: "Describe the negative feedback control of blood glucose after a sugary meal.",
        steps: [
          "Blood glucose rises after the meal.",
          "Beta cells of the pancreas detect this and release insulin.",
          "Insulin causes liver and muscle cells to take up glucose and store it as glycogen.",
          "Blood glucose falls back to normal — insulin secretion then decreases (negative feedback).",
        ],
        solution: "↑ glucose → insulin → uptake/storage → glucose returns to normal.",
        commonErrors: [
          "Naming alpha cells as the insulin source (alpha cells secrete glucagon).",
          "Saying glucose is excreted by the kidneys (only in diabetes, not normal regulation).",
        ],
      },
      {
        question: "Explain how the body responds when blood glucose falls below normal.",
        steps: [
          "Alpha cells of the pancreas detect the drop and release glucagon.",
          "Glucagon stimulates liver cells to break down glycogen into glucose (glycogenolysis).",
          "Glucose is released into the blood, restoring normal levels.",
        ],
        solution: "Glucagon from α-cells → glycogen → glucose released into blood.",
        commonErrors: [
          "Saying insulin is released (insulin lowers glucose — opposite effect).",
          "Confusing glycogen with glucagon.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Drie hormone, hul kliere en funksies.",
        steps: ["Insulien (pankreas) — verlaag glukose; tiroksien (skildklier) — metabolisme; adrenalien (byniermurg) — veg-of-vlug."],
        solution: "Soos hierbo",
        commonErrors: ["Lys alles onder die pituïtêre klier."],
      },
      {
        question: "Negatiewe terugvoer van bloedglukose na maaltyd.",
        steps: ["↑ glukose → β-selle vrystel insulien → opname/berging → ↓ glukose."],
        solution: "Soos hierbo",
        commonErrors: ["Noem α-selle as insulien-bron."],
      },
      {
        question: "Liggaam se reaksie op lae bloedglukose.",
        steps: ["α-selle vrystel glukagon → lewer breek glikogeen af → glukose in bloed."],
        solution: "Soos hierbo",
        commonErrors: ["Sê insulien word vrygestel."],
      },
    ],
  },

  "LIFE-10": {
    workedExamplesEn: [
      {
        question: "Describe how the body responds to dehydration to restore water balance.",
        steps: [
          "Osmoreceptors in the hypothalamus detect a rise in blood osmotic pressure.",
          "Posterior pituitary releases ADH (antidiuretic hormone) into the blood.",
          "ADH increases water reabsorption in the collecting ducts of the kidney nephrons.",
          "Urine becomes more concentrated (smaller volume) and blood water rises back to normal.",
        ],
        solution: "Osmoreceptors → ADH → ↑ reabsorption → concentrated urine.",
        commonErrors: [
          "Naming the adrenal gland as the source of ADH (it is the posterior pituitary).",
          "Saying ADH lowers reabsorption (it raises it).",
        ],
      },
      {
        question: "Explain how the skin helps maintain body temperature on a hot day.",
        steps: [
          "Thermoreceptors in skin detect rise in temperature.",
          "Sweat glands secrete sweat onto the skin — evaporation absorbs heat from the body.",
          "Arterioles in the skin dilate (vasodilation) — more blood flows near the surface, losing heat to the environment.",
          "Body temperature falls back towards normal (~37 °C).",
        ],
        solution: "Sweating + vasodilation increase heat loss.",
        commonErrors: [
          "Saying sweat itself cools (evaporation cools).",
          "Confusing vasodilation with vasoconstriction.",
        ],
      },
      {
        question: "A diabetic patient has untreated high blood glucose. Outline two physiological consequences.",
        steps: [
          "Glucose exceeds the kidneys' reabsorption capacity → glucose appears in urine (glycosuria).",
          "Glucose in tubules raises filtrate osmotic pressure → less water is reabsorbed → polyuria (excessive urination) and thirst (polydipsia).",
        ],
        solution: "Glycosuria and polyuria/thirst due to osmotic effects.",
        commonErrors: [
          "Confusing diabetes mellitus (insulin-related) with diabetes insipidus (ADH-related).",
          "Saying high glucose causes immediate ketoacidosis without explanation.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Liggaam se reaksie op dehidrasie.",
        steps: ["Osmoreseptors → ADH → ↑ herabsorpsie → meer gekonsentreerde uriene."],
        solution: "Soos hierbo",
        commonErrors: ["Sê byklier skei ADH af."],
      },
      {
        question: "Hoe handhaaf vel liggaamstemperatuur op 'n warm dag?",
        steps: ["Sweet + vasodilatasie verhoog warmteverlies."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar vasodilatasie en vasokonstriksie."],
      },
      {
        question: "Twee gevolge van onbehandelde hoë bloedglukose.",
        steps: ["Glikosurie; poliurie/dorstigheid (osmoties)."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar diabetes mellitus en insipidus."],
      },
    ],
  },

  // ===================== ACCOUNTING (ACC) =====================

  "ACC-1": {
    workedExamplesEn: [
      {
        question: "A company's trial balance shows: Sales R1 200 000; Cost of sales R720 000; Operating expenses R250 000; Interest income R8 000; Tax 28%. Prepare the abbreviated Statement of Comprehensive Income and calculate net profit after tax.",
        steps: [
          "Gross profit = Sales − Cost of sales = 1 200 000 − 720 000 = R480 000.",
          "Operating profit = Gross profit − Operating expenses = 480 000 − 250 000 = R230 000.",
          "Profit before tax = Operating profit + Interest income = 230 000 + 8 000 = R238 000.",
          "Tax = 28% × 238 000 = R66 640.",
          "Net profit after tax = 238 000 − 66 640 = R171 360.",
        ],
        solution: "Net profit after tax = R171 360",
        commonErrors: [
          "Taxing operating profit instead of profit before tax.",
          "Subtracting interest income (it is income, not an expense).",
        ],
      },
      {
        question: "Calculate retained income at year-end if opening retained income was R450 000, net profit after tax R171 360 and ordinary dividends declared R60 000.",
        steps: [
          "Closing retained income = Opening + Net profit − Dividends.",
          "= 450 000 + 171 360 − 60 000 = R561 360.",
        ],
        solution: "Closing retained income = R561 360",
        commonErrors: [
          "Adding dividends instead of subtracting.",
          "Forgetting to use the after-tax profit figure.",
        ],
      },
      {
        question: "From the year-end balances, classify each item as Equity, Non-current liability, Current liability, Non-current asset, or Current asset: ordinary share capital, mortgage loan due 2030, trade payables, vehicles at carrying value, trading inventory, bank overdraft.",
        steps: [
          "Ordinary share capital → Equity.",
          "Mortgage loan due 2030 → Non-current liability.",
          "Trade payables → Current liability.",
          "Vehicles at carrying value → Non-current asset.",
          "Trading inventory → Current asset.",
          "Bank overdraft → Current liability.",
        ],
        solution: "Equity: SC. NCL: Mortgage. CL: Trade payables, Bank overdraft. NCA: Vehicles. CA: Inventory",
        commonErrors: [
          "Placing bank overdraft under current assets (it is a current liability).",
          "Classifying mortgage as a current liability.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Verkope R1 200 000; Koste van verkope R720 000; Bedryfsuitgawes R250 000; Renteinkomste R8 000; Belasting 28%. Netto wins na belasting?",
        steps: [
          "Bruto wins = 480 000; Bedryfswins = 230 000; Wins voor bel. = 238 000.",
          "Belasting 66 640; Netto wins = R171 360.",
        ],
        solution: "R171 360",
        commonErrors: ["Belas bedryfswins i.p.v. wins voor belasting."],
      },
      {
        question: "Behoue inkomste aan jaareinde: opening R450 000, wins R171 360, dividende R60 000.",
        steps: ["450 000 + 171 360 − 60 000 = R561 360."],
        solution: "R561 360",
        commonErrors: ["Tel dividende by i.p.v. af."],
      },
      {
        question: "Klassifiseer items: aandelekapitaal, verbandlening (2030), handelskrediteure, voertuie, voorraad, bankoortrekking.",
        steps: ["Ekw / NBL / BL / NBT / BT / BL onderskeidelik."],
        solution: "Soos hierbo",
        commonErrors: ["Plaas oortrekking onder bates."],
      },
    ],
  },

  "ACC-2": {
    workedExamplesEn: [
      {
        question: "Compute the current ratio if current assets = R420 000 and current liabilities = R140 000. Comment on liquidity.",
        steps: [
          "Current ratio = 420 000 / 140 000 = 3 : 1.",
          "Norm is 2 : 1. 3 : 1 indicates strong liquidity — possibly too high (idle resources).",
        ],
        solution: "3 : 1 — strong, possibly over-liquid",
        commonErrors: [
          "Mixing acid-test (quick) with current ratio.",
          "Calling 3 : 1 'poor' (it exceeds the norm).",
        ],
      },
      {
        question: "Net profit after tax = R171 360; average shareholders' equity = R1 100 000. Calculate the return on shareholders' equity (ROSHE) and comment.",
        steps: [
          "ROSHE = (171 360 / 1 100 000) × 100 = 15.58%.",
          "Compare with risk-free rate (e.g. fixed deposit ~7%) — at 15.58%, return rewards shareholders for risk taken.",
        ],
        solution: "ROSHE ≈ 15.58% — favourable vs risk-free rate",
        commonErrors: [
          "Using profit before tax (ROSHE is based on after-tax profit).",
          "Comparing to inflation only, ignoring opportunity cost.",
        ],
      },
      {
        question: "Debt/Equity ratio is 1.2 : 1. Explain what this means and the risk.",
        steps: [
          "For every R1 of own capital, the company has R1.20 of debt.",
          "Highly geared business — more risk because interest must be paid regardless of profit.",
          "Benefit: leverage may magnify returns if profits exceed cost of debt.",
        ],
        solution: "Highly geared — high interest-burden risk; potential leverage gains.",
        commonErrors: [
          "Reading 1.2 : 1 as 'low debt'.",
          "Ignoring the relationship between gearing and interest cover.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "BT R420 000, BL R140 000. Bedryfsverhouding?",
        steps: ["3 : 1 — sterk, dalk te hoog."],
        solution: "3 : 1",
        commonErrors: ["Verwar met suursmeertoets."],
      },
      {
        question: "Wins R171 360; gem. ekwiteit R1 100 000. Opbrengs op ekwiteit?",
        steps: ["15.58% — bo risikovrye koers."],
        solution: "≈ 15.58%",
        commonErrors: ["Gebruik wins voor belasting."],
      },
      {
        question: "Skuld/Ekwiteit = 1.2 : 1 — wat beteken dit?",
        steps: ["Hoog gegear — meer risiko, ook hefboomwerking."],
        solution: "Hoog gegear",
        commonErrors: ["Sien dit as lae skuld."],
      },
    ],
  },

  "ACC-3": {
    workedExamplesEn: [
      {
        question: "A factory used R180 000 of raw materials and R120 000 of direct labour. Calculate Prime Cost.",
        steps: [
          "Prime Cost = Direct materials + Direct labour.",
          "= 180 000 + 120 000 = R300 000.",
        ],
        solution: "Prime Cost = R300 000",
        commonErrors: [
          "Including factory overheads in prime cost.",
          "Including administration salaries (these are not direct labour).",
        ],
      },
      {
        question: "Factory overheads totalled R160 000. Calculate Cost of Production and the unit cost if 5 000 units were produced.",
        steps: [
          "Cost of Production = Prime Cost + Factory overheads = 300 000 + 160 000 = R460 000.",
          "Unit cost = 460 000 / 5 000 = R92 per unit.",
        ],
        solution: "Cost of production = R460 000; Unit cost = R92",
        commonErrors: [
          "Including selling/admin costs in factory overheads.",
          "Dividing by units sold instead of units produced.",
        ],
      },
      {
        question: "Classify each as direct material, direct labour, factory overhead, or admin: wood for tables; carpenter's wage; factory rent; sales manager's salary; sandpaper used.",
        steps: [
          "Wood for tables → Direct material.",
          "Carpenter's wage → Direct labour.",
          "Factory rent → Factory overhead.",
          "Sales manager's salary → Administration / Selling (not a factory cost).",
          "Sandpaper → Indirect material → Factory overhead.",
        ],
        solution: "Wood DM; carpenter DL; rent FO; sales mgr admin; sandpaper FO",
        commonErrors: [
          "Treating indirect materials (sandpaper) as direct materials.",
          "Including sales salaries in cost of production.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Rou materiaal R180 000, direkte arbeid R120 000. Hoofkoste?",
        steps: ["R300 000."],
        solution: "R300 000",
        commonErrors: ["Sluit fabrieksbokoste in."],
      },
      {
        question: "Fabrieksbokoste R160 000; 5 000 eenhede. Produksiekoste en eenheidskoste?",
        steps: ["Prod. koste R460 000; eenheid R92."],
        solution: "R460 000 / R92",
        commonErrors: ["Deel deur verkoopte eenhede."],
      },
      {
        question: "Klassifiseer items: hout, skrynwerker, fabriekshuur, verkoopsbestuurder, skuurpapier.",
        steps: ["DM / DA / FB / Admin / FB."],
        solution: "Soos hierbo",
        commonErrors: ["Indirekte materiaal as direk klassifiseer."],
      },
    ],
  },

  "ACC-4": {
    workedExamplesEn: [
      {
        question: "Compile a Cash Budget extract for May. Opening bank balance R10 000. Cash sales R80 000; debtors' collections R45 000; cash purchases R30 000; payments to creditors R40 000; wages R25 000.",
        steps: [
          "Receipts = 80 000 + 45 000 = R125 000.",
          "Payments = 30 000 + 40 000 + 25 000 = R95 000.",
          "Net cash flow = 125 000 − 95 000 = R30 000.",
          "Closing balance = 10 000 + 30 000 = R40 000.",
        ],
        solution: "Closing bank = R40 000",
        commonErrors: [
          "Including non-cash items (e.g. depreciation) in a cash budget.",
          "Forgetting opening balance.",
        ],
      },
      {
        question: "The budgeted gross profit margin is 40%. Actual figures: Sales R600 000, Cost of sales R390 000. Calculate the actual GP margin and the variance.",
        steps: [
          "Actual GP = 600 000 − 390 000 = R210 000.",
          "Actual margin = 210 000 / 600 000 × 100 = 35%.",
          "Variance = 35% − 40% = −5% (unfavourable).",
        ],
        solution: "Actual 35% — variance 5% unfavourable",
        commonErrors: [
          "Computing margin on cost of sales instead of sales.",
          "Labelling an unfavourable variance as favourable just because there is profit.",
        ],
      },
      {
        question: "If a cash budget projects a deficit of R20 000 in July, list two corrective actions management could take.",
        steps: [
          "Negotiate later payments to creditors or arrange a short-term overdraft for July.",
          "Speed up collections from debtors (settlement discount or stricter credit terms).",
          "Defer non-essential capital expenditure to a month with surplus.",
        ],
        solution: "Delay payments / accelerate receipts / postpone capex.",
        commonErrors: [
          "Suggesting to issue more shares (not realistic for a one-month cash issue).",
          "Recommending price increases without market consideration.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Kontantbegroting Mei: open R10 000; ontvangstes R125 000; betalings R95 000.",
        steps: ["Slot = 10 000 + 30 000 = R40 000."],
        solution: "R40 000",
        commonErrors: ["Sluit waardevermindering in (nie kontant nie)."],
      },
      {
        question: "Begrote BWM = 40%. Werklike Verkope R600 000; Koste R390 000. Afwyking?",
        steps: ["Werklike BWM 35%; afwyking 5% ongunstig."],
        solution: "5% ongunstig",
        commonErrors: ["Bereken marge op koste i.p.v. verkope."],
      },
      {
        question: "Begroting toon Julie tekort R20 000 — twee oplossings?",
        steps: ["Stel betalings uit; versnel ontvangstes; verminder kapuitgawe."],
        solution: "Soos hierbo",
        commonErrors: ["Stel aandeel-uitreiking voor."],
      },
    ],
  },

  "ACC-5": {
    workedExamplesEn: [
      {
        question: "Opening stock 100 units @ R20. Purchases: 200 units @ R22, then 150 units @ R25. Sold 300 units. Calculate closing stock using FIFO.",
        steps: [
          "Units remaining = 100 + 200 + 150 − 300 = 150 units.",
          "FIFO: oldest sold first → remaining 150 are from the latest purchase @ R25.",
          "Closing stock = 150 × R25 = R3 750.",
        ],
        solution: "Closing stock = R3 750",
        commonErrors: [
          "Using weighted average prices when FIFO is required.",
          "Forgetting that FIFO retains the most recent costs in closing stock.",
        ],
      },
      {
        question: "Using the same data, compute closing stock with the weighted average method.",
        steps: [
          "Total units = 100 + 200 + 150 = 450.",
          "Total cost = 100·20 + 200·22 + 150·25 = 2 000 + 4 400 + 3 750 = R10 150.",
          "Weighted average price = 10 150 / 450 ≈ R22.56 per unit.",
          "Closing stock = 150 × 22.56 ≈ R3 384.",
        ],
        solution: "Closing stock ≈ R3 384",
        commonErrors: [
          "Averaging only the purchase prices (ignoring quantities).",
          "Using current sales price (not cost) to value stock.",
        ],
      },
      {
        question: "Why might a business choose FIFO over weighted average during a period of rising prices?",
        steps: [
          "FIFO values closing stock at the latest (highest) costs.",
          "This raises the value of inventory on the balance sheet and lowers cost of sales — increasing reported gross profit.",
          "Reflects more current replacement value of stock on the SFP.",
        ],
        solution: "FIFO gives higher closing stock value and higher reported profit during inflation.",
        commonErrors: [
          "Saying FIFO reduces tax (it actually raises taxable profit during inflation).",
          "Confusing FIFO with LIFO (LIFO is not allowed under IFRS).",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Open 100 @ R20; aankoop 200 @ R22, 150 @ R25; verkoop 300. EIEU sluitvoorraad?",
        steps: ["150 × R25 = R3 750."],
        solution: "R3 750",
        commonErrors: ["Gebruik gewig. gem. by EIEU."],
      },
      {
        question: "Gewig. gem. sluitvoorraad?",
        steps: ["Gem. = 10 150/450 ≈ R22.56; 150 × R22.56 ≈ R3 384."],
        solution: "≈ R3 384",
        commonErrors: ["Middel slegs pryse, ignoreer hoeveelhede."],
      },
      {
        question: "Hoekom EIEU bo gem. tydens prysstygings?",
        steps: ["Hoër sluitvoorraadwaarde; hoër gerapporteerde wins."],
        solution: "Hoër wins en bate-waarde",
        commonErrors: ["Beweer EIEU verminder belasting."],
      },
    ],
  },

  "ACC-6": {
    workedExamplesEn: [
      {
        question: "The bank statement shows R12 500 credit. Cash book shows R8 000 debit. Outstanding deposits R4 000; unpresented cheques R500. Reconcile.",
        steps: [
          "Start from bank statement balance: R12 500.",
          "Add outstanding deposits (not yet on bank statement): + R4 000.",
          "Subtract unpresented cheques (already on cash book): − R500.",
          "Reconciled balance = 12 500 + 4 000 − 500 = R16 000.",
          "Does not match cash book (R8 000) — investigate; likely missing entries in cash book.",
        ],
        solution: "Reconciled balance R16 000 — differs from cash book; investigate omissions.",
        commonErrors: [
          "Adding unpresented cheques and subtracting outstanding deposits (signs reversed).",
          "Assuming a difference implies fraud without investigation.",
        ],
      },
      {
        question: "A bank charge of R150 appears on the bank statement but not in the cash book. What entry is needed in the cash book?",
        steps: [
          "Bank charges are an expense and reduce the bank balance.",
          "Cash book entry: Debit bank charges; Credit bank with R150.",
        ],
        solution: "Dr Bank charges; Cr Bank R150",
        commonErrors: [
          "Adjusting the bank statement instead of the cash book.",
          "Reversing debit and credit.",
        ],
      },
      {
        question: "An age analysis shows 45% of debtors are more than 90 days old. Suggest two actions.",
        steps: [
          "Send final demand letters and consider legal action / handover.",
          "Tighten credit policy: shorter terms, settlement discount for prompt payment.",
          "Review credit limits and stop further sales to overdue accounts.",
        ],
        solution: "Demand / tighten credit / freeze accounts.",
        commonErrors: [
          "Writing off all amounts immediately without trying to recover.",
          "Doing nothing because 'sales are made' — cash flow is more important than turnover.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Bank R12 500 K; kasboek R8 000 D; uitstaande deposito R4 000; onaangebiede tjeks R500.",
        steps: ["12 500 + 4 000 − 500 = R16 000; ondersoek verskil."],
        solution: "R16 000",
        commonErrors: ["Tekens omgekeer."],
      },
      {
        question: "Bankkoste R150 nog nie in kasboek nie.",
        steps: ["Dr Bankkoste; Kr Bank R150."],
        solution: "Dr koste / Kr bank",
        commonErrors: ["Pas bankstaat aan i.p.v. kasboek."],
      },
      {
        question: "45% van debiteure > 90 dae — twee aksies.",
        steps: ["Strenger krediet, finale eis, vries verdere verkope."],
        solution: "Soos hierbo",
        commonErrors: ["Skryf alles dadelik af."],
      },
    ],
  },

  "ACC-7": {
    workedExamplesEn: [
      {
        question: "Identify three internal control weaknesses if one cashier receives money, records it, and banks it alone.",
        steps: [
          "No segregation of duties — single person can steal and conceal.",
          "No independent verification — risk of unrecorded receipts.",
          "No daily cash count by a supervisor — opportunity for theft is high.",
        ],
        solution: "No segregation; no oversight; no independent count.",
        commonErrors: [
          "Suggesting 'install cameras' alone — segregation is the structural control.",
          "Blaming the cashier rather than the control failure.",
        ],
      },
      {
        question: "Distinguish between an unqualified, qualified and disclaimer of opinion in an auditor's report.",
        steps: [
          "Unqualified: clean — financial statements fairly present in all material respects.",
          "Qualified: 'except for' — most areas are fine but specific items are misstated or unsupported.",
          "Disclaimer: auditor cannot form an opinion (e.g. limited scope, no records available).",
        ],
        solution: "Unqualified clean; qualified with reservations; disclaimer no opinion",
        commonErrors: [
          "Confusing 'qualified' (better) with 'adverse' (worse).",
          "Calling a disclaimer the same as an adverse opinion.",
        ],
      },
      {
        question: "Suggest three controls over fixed assets in a manufacturing company.",
        steps: [
          "Maintain a fixed asset register with serial numbers and locations.",
          "Conduct physical asset counts annually and reconcile with the register.",
          "Restrict authorisation for purchases or disposals to senior management.",
        ],
        solution: "Asset register; annual count; senior authorisation.",
        commonErrors: [
          "Listing only physical security (locks) without record controls.",
          "Confusing fixed assets with inventory controls.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Drie interne beheerswakhede as een kassier alles doen.",
        steps: ["Geen skeiding; geen onafh. verifikasie; geen toesigtelling."],
        solution: "Soos hierbo",
        commonErrors: ["Stel net kameras voor."],
      },
      {
        question: "Onbevoegde / gekwalifiseerde / vrywaringsopinie — verskil?",
        steps: ["Skoon / behalwe vir / kan nie opinie vorm nie."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar gekwalifiseerd en negatief."],
      },
      {
        question: "Drie beheermaatreëls vir vaste bates.",
        steps: ["Bate-register; jaarlikse telling; senior magtiging."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar met voorraadbeheer."],
      },
    ],
  },

  "ACC-8": {
    workedExamplesEn: [
      {
        question: "List three principles of King IV that promote ethical leadership.",
        steps: [
          "Integrity: directors act honestly and consistently with stated values.",
          "Competence: directors have the skills and knowledge to discharge their duties.",
          "Accountability: directors are answerable for their decisions and outcomes.",
        ],
        solution: "Integrity; competence; accountability.",
        commonErrors: [
          "Listing financial KPIs as 'principles'.",
          "Confusing King IV (governance) with the Companies Act.",
        ],
      },
      {
        question: "A junior accountant is asked by a manager to delay recording an invoice to improve quarterly figures. State the ethical issues and the correct action.",
        steps: [
          "Issue: deliberate misstatement breaches honesty and reliability of financial reports.",
          "Conflict of interest: pressure from authority vs duty to the profession and stakeholders.",
          "Correct action: refuse, document the request, and escalate via internal whistle-blower channel or the audit committee (protected under the Protected Disclosures Act).",
        ],
        solution: "Refuse and escalate via internal whistle-blower channel.",
        commonErrors: [
          "Recording the invoice anyway 'because the manager said so'.",
          "Resigning silently without reporting (concealment).",
        ],
      },
      {
        question: "Explain the triple bottom line (TBL) approach in two sentences.",
        steps: [
          "TBL measures business success on three dimensions: people (social), planet (environmental) and profit (financial).",
          "It pushes companies to balance shareholder returns with worker wellbeing and environmental impact.",
        ],
        solution: "People, planet, profit — beyond profit-only measurement.",
        commonErrors: [
          "Calling TBL only an environmental measure.",
          "Confusing TBL with the King IV principles.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Drie King IV beginsels vir etiese leierskap.",
        steps: ["Integriteit; bekwaamheid; aanspreeklikheid."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar King IV met die Maatskappywet."],
      },
      {
        question: "Bestuurder vra jou om faktuur uit te stel — etiese kwessies?",
        steps: [
          "Doelbewuste wanvoorstelling oortree integriteit.",
          "Verbied, dokumenteer en eskaleer via klokkluider-kanaal.",
        ],
        solution: "Verbied en eskaleer",
        commonErrors: ["Bedek deur dadelik te bedank."],
      },
      {
        question: "Drie-vlak onderskoor in 2 sinne.",
        steps: ["Mense, planeet, wins — balanseer drie."],
        solution: "Soos hierbo",
        commonErrors: ["Sien dit as net omgewing."],
      },
    ],
  },

  // ===================== BUSINESS STUDIES (BUS) =====================

  "BUS-1": {
    workedExamplesEn: [
      {
        question: "Distinguish between the micro, market and macro business environments, giving one example of a factor in each.",
        steps: [
          "Micro: inside the business — fully controllable. Example: staff, vision, organisational culture.",
          "Market: directly outside — partially influenceable. Example: suppliers, competitors, customers.",
          "Macro: broad external — uncontrollable. Example: legislation, inflation, technology, social trends.",
        ],
        solution: "Micro (internal); Market (immediate external); Macro (broad external)",
        commonErrors: [
          "Putting competitors in the macro environment.",
          "Saying micro factors are uncontrollable.",
        ],
      },
      {
        question: "Use PESTLE to analyse the impact of a new minimum wage law on a manufacturing firm. Briefly cover each letter.",
        steps: [
          "Political — government regulation; firm must comply.",
          "Economic — wage bill rises; possible price increase or reduced staff.",
          "Social — workers' standard of living improves; better morale.",
          "Technological — incentive to mechanise to reduce labour cost.",
          "Legal — non-compliance leads to penalties under labour law.",
          "Environmental — generally indirect, but mechanisation may shift energy use.",
        ],
        solution: "Cost ↑ (Eco/Pol/Legal); morale ↑ (Social); push to automate (Tech).",
        commonErrors: [
          "Skipping letters of PESTLE.",
          "Treating the wage law only as an economic issue.",
        ],
      },
      {
        question: "Give two strategies a business can use to respond to a threat from a new competitor in the market environment.",
        steps: [
          "Differentiation: improve product quality, service or branding to retain customers.",
          "Pricing strategy: review prices and offer value packs without unsustainable price war.",
          "Customer retention: loyalty programmes and after-sales service.",
        ],
        solution: "Differentiation; pricing review; loyalty/CRM.",
        commonErrors: [
          "Suggesting illegal collusion or predatory pricing.",
          "Ignoring the customer's perceived value.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Onderskei mikro-, mark- en makro-omgewings; gee een voorbeeld elk.",
        steps: ["Mikro: personeel. Mark: kompetisie. Makro: wetgewing."],
        solution: "Soos hierbo",
        commonErrors: ["Plaas kompetisie in makro."],
      },
      {
        question: "PESTLE-impak van nuwe minimum loon op vervaardiger.",
        steps: ["Pol/Reg-eko: hoër lone; Soc: moraal; Tech: outomatisering; Legal: nakoming."],
        solution: "Soos hierbo",
        commonErrors: ["Slaan letters oor."],
      },
      {
        question: "Twee strategieë teen nuwe mededinger.",
        steps: ["Differensiasie; pryshersiening; lojaliteit."],
        solution: "Soos hierbo",
        commonErrors: ["Stel onwettige samesweer voor."],
      },
    ],
  },

  "BUS-2": {
    workedExamplesEn: [
      {
        question: "Differentiate between quality control and quality assurance with one example each in a bakery.",
        steps: [
          "Quality control (QC) = inspection of the final product. Example: rejecting burnt loaves before packing.",
          "Quality assurance (QA) = systems and processes to prevent defects. Example: scheduled oven temperature checks every hour.",
        ],
        solution: "QC inspects outputs; QA designs processes to prevent defects",
        commonErrors: [
          "Saying QA is the same as inspection.",
          "Ignoring the prevention vs detection distinction.",
        ],
      },
      {
        question: "Outline the PDCA (Plan–Do–Check–Act) cycle and apply it to reducing customer complaints in a call centre.",
        steps: [
          "Plan: set a target (e.g. cut complaints by 20% in 3 months); analyse top causes.",
          "Do: implement changes (e.g. extra training, new script).",
          "Check: measure complaint volume vs target.",
          "Act: standardise what works; iterate on what doesn't.",
        ],
        solution: "PDCA: continuous-improvement loop for complaint reduction.",
        commonErrors: [
          "Confusing PDCA with SWOT.",
          "Skipping the 'Check' step — without measurement, the cycle is broken.",
        ],
      },
      {
        question: "Give two benefits of TQM (Total Quality Management) for a manufacturing business.",
        steps: [
          "Lower defect rates → less rework and waste → reduced cost.",
          "Higher customer satisfaction → repeat business and stronger reputation.",
          "Worker engagement: TQM involves staff in problem-solving → improved morale.",
        ],
        solution: "Lower waste; higher customer satisfaction; engaged staff.",
        commonErrors: [
          "Listing only short-term financial gains.",
          "Treating TQM as a single project rather than an ongoing culture.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "QC vs QA — bakkery-voorbeelde.",
        steps: ["QC: keur gebrande brode uit. QA: oond-temperatuur kontroles."],
        solution: "Soos hierbo",
        commonErrors: ["Sien QA as net inspeksie."],
      },
      {
        question: "PDCA-siklus en toepassing op oproepsentrum.",
        steps: ["Beplan, Doen, Kontroleer, Optree."],
        solution: "Soos hierbo",
        commonErrors: ["Slaan 'Kontroleer' oor."],
      },
      {
        question: "Twee TKB voordele.",
        steps: ["Minder defekte; hoër klanttevredenheid; betrokke personeel."],
        solution: "Soos hierbo",
        commonErrors: ["Net korttermyn-finansieel."],
      },
    ],
  },

  "BUS-3": {
    workedExamplesEn: [
      {
        question: "Compare a Private Company (Pty) Ltd with a Public Company (Ltd) in three ways.",
        steps: [
          "Shares: Pty has restricted transfer (not on JSE); Ltd lists shares on JSE.",
          "Members: Pty needs minimum 1 director; Ltd needs minimum 3 directors.",
          "Disclosure: Pty has limited public disclosure; Ltd has heavy disclosure (annual report, JSE rules).",
        ],
        solution: "Share transfer; director count; disclosure obligations.",
        commonErrors: [
          "Saying a Pty cannot have shareholders (it can).",
          "Confusing public company with personal liability company (Inc.).",
        ],
      },
      {
        question: "Suggest two ways a small business can raise R500 000 without taking on debt.",
        steps: [
          "Equity from a business partner / angel investor in exchange for a share of ownership.",
          "Crowdfunding (e.g. reward-based platform) where backers pre-order products.",
          "Retained earnings — reinvest accumulated profits.",
        ],
        solution: "Equity partner; crowdfunding; retained earnings.",
        commonErrors: [
          "Suggesting a bank loan (that is debt).",
          "Selling fixed assets needed for operations.",
        ],
      },
      {
        question: "List three contemporary forms of insurance available to a small SA business.",
        steps: [
          "Business interruption insurance — covers lost income during downtime (e.g. fire).",
          "Cyber-liability insurance — covers data-breach and hacking costs.",
          "Public liability insurance — covers claims from third parties for injury or property damage.",
        ],
        solution: "Business interruption; cyber-liability; public liability.",
        commonErrors: [
          "Listing only short-term car or fire insurance.",
          "Confusing assurance (life) with insurance (events).",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Vergelyk Pty (Edms) Bpk en Bpk (Public).",
        steps: ["Aandeel-oordrag; aantal direkteure; openbaarmaking."],
        solution: "Soos hierbo",
        commonErrors: ["Sê 'n Pty kan nie aandeelhouers hê nie."],
      },
      {
        question: "Twee maniere om R500 000 sonder skuld te bekom.",
        steps: ["Vennoot/engel; crowdfunding; behoue wins."],
        solution: "Soos hierbo",
        commonErrors: ["Stel banklening voor."],
      },
      {
        question: "Drie versekeringsvorme vir 'n klein SA besigheid.",
        steps: ["Besigheidsonderbreking; kuber; openbare aanspreeklikheid."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar versekering en versorging."],
      },
    ],
  },

  "BUS-4": {
    workedExamplesEn: [
      {
        question: "Distinguish between CSR and CSI with one example of each.",
        steps: [
          "CSR (Corporate Social Responsibility) is internal — fair pay, ethical sourcing, recycling.",
          "CSI (Corporate Social Investment) is external — money/time spent on community projects (e.g. funding a school).",
        ],
        solution: "CSR internal practices; CSI external community spending.",
        commonErrors: [
          "Using CSR and CSI interchangeably.",
          "Calling internal staff wellness 'CSI'.",
        ],
      },
      {
        question: "Apply the triple bottom line to a clothing retailer that wants to grow sustainably.",
        steps: [
          "Profit: target sustainable revenue growth (e.g. 10% per year) and cost control.",
          "People: fair wages, B-BBEE compliance, worker training, safe working conditions.",
          "Planet: source organic cotton, reduce packaging, energy-efficient stores.",
        ],
        solution: "Profit + People + Planet — balanced growth.",
        commonErrors: [
          "Treating TBL as profit only.",
          "Confusing TBL with PESTLE.",
        ],
      },
      {
        question: "Briefly state how the B-BBEE scorecard helps redress inequality.",
        steps: [
          "Measures companies on ownership, management, skills development, enterprise development, socio-economic development.",
          "Higher scores improve access to government contracts and corporate procurement.",
          "Incentivises companies to include previously disadvantaged people in ownership and management.",
        ],
        solution: "Scorecard incentivises transformation across 5 elements.",
        commonErrors: [
          "Saying B-BBEE only applies to ownership.",
          "Confusing B-BBEE with affirmative action only.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "KSV vs KSB met voorbeelde.",
        steps: ["KSV intern (regverdige lone); KSB ekstern (skoolbefondsing)."],
        solution: "Soos hierbo",
        commonErrors: ["Gebruik begrippe omruilbaar."],
      },
      {
        question: "Drie-vlak onderskoor op kledingwinkel.",
        steps: ["Wins, mense, planeet."],
        solution: "Soos hierbo",
        commonErrors: ["Sien dit as net wins."],
      },
      {
        question: "Hoe help B-BBEE punteblad ongelykheid herstel?",
        steps: ["5 elemente; toegang tot kontrakte; insluiting van benadeeldes."],
        solution: "Soos hierbo",
        commonErrors: ["Beperk B-BBEE tot eienaarskap alleen."],
      },
    ],
  },

  "BUS-5": {
    workedExamplesEn: [
      {
        question: "Outline four steps of the recruitment process from vacancy identification to shortlisting.",
        steps: [
          "Identify the vacancy and conduct a job analysis (job description + job specification).",
          "Choose recruitment source: internal (promotion, transfer) or external (advertisement, agency, LinkedIn).",
          "Receive and screen CVs against the job specification.",
          "Compile a shortlist of qualifying candidates for interview.",
        ],
        solution: "Analyse → advertise → screen → shortlist.",
        commonErrors: [
          "Starting at the interview stage (skips analysis).",
          "Confusing recruitment with selection (recruitment ends at shortlist).",
        ],
      },
      {
        question: "Name three requirements of the Employment Equity Act (EEA) for designated employers.",
        steps: [
          "Eliminate unfair discrimination in the workplace.",
          "Implement affirmative action measures for designated groups (Black people, women, people with disabilities).",
          "Submit annual Employment Equity reports to the Department of Labour.",
        ],
        solution: "No unfair discrimination; affirmative action; annual EE reports.",
        commonErrors: [
          "Confusing EEA with the Skills Development Act.",
          "Saying only government employers are bound (designated private employers also are).",
        ],
      },
      {
        question: "A new hire needs induction. List three goals of an induction programme.",
        steps: [
          "Familiarise the employee with company culture, mission and policies.",
          "Introduce them to their team and immediate workspace.",
          "Communicate role expectations, performance standards and safety procedures.",
        ],
        solution: "Culture; team; expectations.",
        commonErrors: [
          "Treating induction as a one-day tour with no follow-up.",
          "Confusing induction with technical training.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Vier stappe in werwingsproses tot kortlys.",
        steps: ["Werk-ontleding → adverteer → keur CV's → kortlys."],
        solution: "Soos hierbo",
        commonErrors: ["Begin by onderhoud."],
      },
      {
        question: "Drie EEA vereistes vir aangewese werkgewers.",
        steps: ["Geen onbillike diskriminasie; AA-maatreëls; jaarlikse verslae."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar met Vaardigheidsontw. Wet."],
      },
      {
        question: "Drie doele van induksie.",
        steps: ["Kultuur; span; verwagtinge/veiligheid."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar met tegniese opleiding."],
      },
    ],
  },

  "BUS-6": {
    workedExamplesEn: [
      {
        question: "Conduct a SWOT analysis for a small coffee shop facing a new franchise opening nearby.",
        steps: [
          "Strengths: known by locals, flexible menu, fast service.",
          "Weaknesses: limited marketing budget, small premises.",
          "Opportunities: catering for local offices, delivery via apps.",
          "Threats: new franchise's brand recognition and pricing power.",
        ],
        solution: "Internal S/W + external O/T captured.",
        commonErrors: [
          "Listing the same item as both a strength and an opportunity.",
          "Placing internal factors under O/T (external).",
        ],
      },
      {
        question: "Differentiate between defensive, intensive and integration strategies with one example each.",
        steps: [
          "Defensive: retrenchment / divestiture / liquidation (e.g. close loss-making branch).",
          "Intensive: market penetration, market development, product development (e.g. launch new flavour to existing market).",
          "Integration: forward (acquire distributor), backward (acquire supplier), horizontal (acquire competitor).",
        ],
        solution: "Defensive shrinks; intensive grows; integration adds adjacent value chain.",
        commonErrors: [
          "Confusing horizontal integration with diversification.",
          "Calling market penetration a defensive move.",
        ],
      },
      {
        question: "Outline a strategy evaluation step using two control measures.",
        steps: [
          "Compare actual outcomes to planned targets (e.g. sales vs forecast).",
          "Use balanced scorecard categories: financial, customer, internal process, learning & growth.",
          "Identify variances, root-cause analysis, and adjust strategy.",
        ],
        solution: "Compare actual vs target; balanced scorecard; adjust.",
        commonErrors: [
          "Evaluating only on profit (ignores customer and process measures).",
          "Skipping the corrective-action step.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "SWOT vir koffiewinkel met nuwe franchise.",
        steps: ["Sterk/Swak (intern) + Geleenthede/Bedreigings (ekstern)."],
        solution: "Soos hierbo",
        commonErrors: ["Plaas interne items by G/B."],
      },
      {
        question: "Verdedigend, intensief en integrasie strategieë met voorbeelde.",
        steps: ["Verminder; groei; voeg waardestroom by."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar horisontale integrasie en diversifikasie."],
      },
      {
        question: "Strategie-evaluering met twee beheermaatreëls.",
        steps: ["Werklik vs beplan; gebalanseerde puntestaat; pas aan."],
        solution: "Soos hierbo",
        commonErrors: ["Evalueer net op wins."],
      },
    ],
  },

  "BUS-7": {
    workedExamplesEn: [
      {
        question: "Distinguish between quality control and quality assurance in the context of a manufacturing factory.",
        steps: [
          "Quality control (QC): inspects products against specifications, usually at the end of production.",
          "Quality assurance (QA): builds quality into the process — supplier audits, calibrated machines, trained staff — to prevent defects.",
        ],
        solution: "QC detects defects; QA prevents them.",
        commonErrors: [
          "Using the two terms interchangeably.",
          "Claiming QC alone is enough for ISO certification.",
        ],
      },
      {
        question: "Describe two ways quality management improves customer service.",
        steps: [
          "Consistent product quality → fewer complaints and returns.",
          "Faster, predictable delivery (lean processes) → higher customer satisfaction.",
          "After-sales support and warranties build trust and repeat business.",
        ],
        solution: "Consistency; reliability; trust → loyalty.",
        commonErrors: [
          "Treating quality only as a production issue, ignoring service quality.",
          "Saying quality always raises price without considering cost savings from less rework.",
        ],
      },
      {
        question: "Outline three financial benefits of a successful TQM programme.",
        steps: [
          "Lower waste and rework costs.",
          "Lower warranty and returns expenses.",
          "Higher revenue from repeat customers and referrals.",
        ],
        solution: "Less waste; lower warranty; higher repeat revenue.",
        commonErrors: [
          "Confusing TQM with one-off cost cutting.",
          "Ignoring long-term reputational benefits.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "QC vs QA in 'n fabriek.",
        steps: ["QC keur eindprodukte; QA bou kwaliteit in proses."],
        solution: "Soos hierbo",
        commonErrors: ["Gebruik begrippe omruilbaar."],
      },
      {
        question: "Twee maniere waarop kwaliteit klantediens verbeter.",
        steps: ["Konsekwente kwaliteit; betroubaarheid; vertroue."],
        solution: "Soos hierbo",
        commonErrors: ["Beperk tot produksie alleen."],
      },
      {
        question: "Drie finansiële voordele van suksesvolle TKB.",
        steps: ["Minder vermorsing; minder waarborg-uitgawes; meer herhaalde verkope."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar TKB met kostebesparing."],
      },
    ],
  },

  "BUS-8": {
    workedExamplesEn: [
      {
        question: "Identify three elements that should appear in a company's Code of Ethics.",
        steps: [
          "Values and principles (honesty, integrity, accountability).",
          "Guidelines on conflicts of interest, gifts, confidentiality and fair dealing with stakeholders.",
          "Disciplinary procedures and reporting mechanisms for breaches.",
        ],
        solution: "Values; conduct guidelines; enforcement & reporting.",
        commonErrors: [
          "Listing only 'be honest' without concrete rules.",
          "Omitting any reporting/enforcement mechanism.",
        ],
      },
      {
        question: "Define 'conflict of interest' and give one example in business.",
        steps: [
          "When personal interests interfere with the duty to act in the employer's or stakeholders' best interest.",
          "Example: A purchasing manager awards a contract to a supplier owned by their relative without disclosure.",
        ],
        solution: "Personal vs duty conflict — e.g. relative-owned supplier.",
        commonErrors: [
          "Confusing conflict of interest with bribery (they overlap but are distinct).",
          "Saying disclosure 'solves' all conflicts (sometimes recusal is required).",
        ],
      },
      {
        question: "How does the Protected Disclosures Act (PDA) support ethical behaviour?",
        steps: [
          "Protects employees (whistle-blowers) from dismissal, harassment or victimisation when reporting wrongdoing.",
          "Encourages reporting of fraud, corruption and other unethical conduct internally and externally.",
          "Provides a legal channel for safe disclosure, strengthening internal control and governance.",
        ],
        solution: "Legal protection for whistle-blowers → safer reporting → better governance.",
        commonErrors: [
          "Saying the PDA punishes whistle-blowers.",
          "Confusing the PDA with POPIA.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Drie elemente van 'n Etiese Kode.",
        steps: ["Waardes; gedragsriglyne; verslagdoening/dissipline."],
        solution: "Soos hierbo",
        commonErrors: ["Net 'wees eerlik' sonder reëls."],
      },
      {
        question: "Definieer belangebotsing met voorbeeld.",
        steps: ["Persoonlik vs plig — bv. familie-verskaffer sonder openbaarmaking."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar met omkopery."],
      },
      {
        question: "Hoe ondersteun PDA etiese gedrag?",
        steps: ["Beskerm klokkluiders; moedig verslagdoening aan; verbeter bestuur."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar met POPIA."],
      },
    ],
  },

  // ===================== ECONOMICS (ECO) =====================

  "ECO-1": {
    workedExamplesEn: [
      {
        question: "Calculate nominal GDP if a country produces 100 units of A at R10 and 50 units of B at R20.",
        steps: [
          "Nominal GDP = ΣP·Q for all goods/services.",
          "= (100 × 10) + (50 × 20) = 1 000 + 1 000 = R2 000.",
        ],
        solution: "Nominal GDP = R2 000",
        commonErrors: [
          "Adding quantities only (ignoring price).",
          "Subtracting unrelated values (e.g. taxes) when computing GDP.",
        ],
      },
      {
        question: "Explain in 4 steps how the SARB uses interest rates to control inflation.",
        steps: [
          "Inflation rises above the 3–6% target band.",
          "SARB's Monetary Policy Committee raises the repo rate.",
          "Commercial banks raise their prime lending rates.",
          "Borrowing becomes more expensive → consumer spending and investment fall → demand-pull inflation moderates.",
        ],
        solution: "↑ repo rate → ↑ prime → ↓ borrowing/spending → ↓ inflation.",
        commonErrors: [
          "Confusing monetary policy with fiscal policy.",
          "Saying higher interest rates always cause unemployment to fall.",
        ],
      },
      {
        question: "Distinguish between fiscal and monetary policy with one tool each.",
        steps: [
          "Fiscal policy: government uses taxation and spending (e.g. raising VAT).",
          "Monetary policy: central bank uses interest rates and reserve requirements (e.g. SARB raises the repo rate).",
        ],
        solution: "Fiscal = tax/spend; Monetary = interest/reserves",
        commonErrors: [
          "Calling government bond issuance 'monetary policy'.",
          "Confusing SARB with Treasury.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Nominale BBP: 100 eenhede A @ R10 + 50 eenhede B @ R20.",
        steps: ["= R2 000."],
        solution: "R2 000",
        commonErrors: ["Tel net hoeveelhede op."],
      },
      {
        question: "Hoe gebruik SARB rentekoerse om inflasie te beheer?",
        steps: ["↑ repo → ↑ prima → ↓ besteding → ↓ inflasie."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar monetêre en fiskale beleid."],
      },
      {
        question: "Fiskale vs monetêre beleid — een instrument elk.",
        steps: ["Fiskaal: belasting/uitgawes. Monetêr: rentekoers/reserwes."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar SARB met Tesourie."],
      },
    ],
  },

  "ECO-2": {
    workedExamplesEn: [
      {
        question: "Demand schedule: at R10 demand = 100; at R8 demand = 140. Calculate price elasticity of demand using the simple percentage method, and classify.",
        steps: [
          "% Δ Q = (140 − 100)/100 × 100 = 40%.",
          "% Δ P = (8 − 10)/10 × 100 = −20%.",
          "PED = 40 / −20 = −2 (absolute value 2).",
          "|PED| > 1 → elastic demand.",
        ],
        solution: "PED = −2 → elastic",
        commonErrors: [
          "Ignoring the sign and misclassifying.",
          "Computing %Δ on the new value rather than the original.",
        ],
      },
      {
        question: "If a perfectly competitive firm produces where MC = MR = R25 and average total cost = R20 at that output, what is happening?",
        steps: [
          "MC = MR means profit-maximising output.",
          "Price (= MR in perfect competition) > ATC → economic profit per unit = R25 − R20 = R5.",
          "Firm makes a supernormal profit (short-run).",
        ],
        solution: "Profit-maximising output earning a supernormal short-run profit of R5/unit.",
        commonErrors: [
          "Saying break-even when ATC < price.",
          "Confusing AVC with ATC.",
        ],
      },
      {
        question: "Briefly explain how a monopoly differs from perfect competition in terms of price-setting power.",
        steps: [
          "Monopoly: single seller, no close substitutes — sets price (price-maker) and faces the downward-sloping market demand curve.",
          "Perfect competition: many sellers with identical products — each is a price-taker, accepting the market-clearing price.",
        ],
        solution: "Monopoly is a price-maker; perfectly competitive firms are price-takers.",
        commonErrors: [
          "Saying a monopoly always charges 'the highest possible' price (it maximises profit, not price).",
          "Confusing perfect competition with monopolistic competition.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "By R10 vraag 100; by R8 vraag 140. PED?",
        steps: ["40/−20 = −2 → elasties."],
        solution: "−2 (elasties)",
        commonErrors: ["Verwar teken en klassifikasie."],
      },
      {
        question: "Perfekte kompetisie: MC = MR = R25, ATC = R20.",
        steps: ["Wins per eenheid = R5; bo-normale wins."],
        solution: "Bo-normale wins R5/eenheid",
        commonErrors: ["Verwar AVC en ATC."],
      },
      {
        question: "Monopolie vs perfekte kompetisie (prysmag).",
        steps: ["Monopolie = prysmaker; PK = prysnemer."],
        solution: "Soos hierbo",
        commonErrors: ["Sê monopolie reken altyd hoogste prys."],
      },
    ],
  },

  "ECO-3": {
    workedExamplesEn: [
      {
        question: "Briefly compare the RDP, GEAR and NDP 2030 in terms of their primary focus.",
        steps: [
          "RDP (1994): meeting basic needs (housing, water, electricity) and redressing apartheid inequality.",
          "GEAR (1996): macroeconomic stability, deficit reduction, growth through liberalisation.",
          "NDP 2030 (2012): long-term vision — eliminate poverty and reduce inequality by 2030 through inclusive growth.",
        ],
        solution: "RDP redress; GEAR stabilise; NDP long-term transformation.",
        commonErrors: [
          "Confusing RDP and GEAR.",
          "Calling NDP a short-term budget.",
        ],
      },
      {
        question: "Outline three reasons B-BBEE is necessary in South Africa today.",
        steps: [
          "Address historical exclusion of Black South Africans from ownership and management.",
          "Reduce structural inequality and broaden economic participation.",
          "Build a stable economy with broader consumer demand and reduced social risk.",
        ],
        solution: "Historical redress; reduce inequality; broaden participation.",
        commonErrors: [
          "Saying B-BBEE is only about ownership.",
          "Confusing B-BBEE with the EE Act.",
        ],
      },
      {
        question: "Define South Africa's 'triple challenge' and give one policy response to each.",
        steps: [
          "Poverty: social grants and free basic services.",
          "Inequality: progressive taxation and B-BBEE.",
          "Unemployment: SETAs, expanded public works programme, youth employment tax incentive.",
        ],
        solution: "Poverty (grants); inequality (tax + BEE); unemployment (skills + jobs programmes).",
        commonErrors: [
          "Listing only growth as the response.",
          "Conflating poverty and inequality (they are related but distinct).",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Vergelyk HOP, GEAR en NOP 2030.",
        steps: ["HOP herstel; GEAR stabiliseer; NOP langtermyn-transformasie."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar HOP en GEAR."],
      },
      {
        question: "Drie redes hoekom B-BBEE in SA nodig is.",
        steps: ["Herstel uitsluiting; verminder ongelykheid; verbreed deelname."],
        solution: "Soos hierbo",
        commonErrors: ["Beperk tot eienaarskap alleen."],
      },
      {
        question: "Drievoudige uitdaging — een beleidsreaksie elk.",
        steps: ["Armoede: toelaes. Ongelykheid: belasting/BEE. Werkloosheid: vaardighede/PWP."],
        solution: "Soos hierbo",
        commonErrors: ["Lys net 'groei'."],
      },
    ],
  },

  "ECO-4": {
    workedExamplesEn: [
      {
        question: "Distinguish CPI from PPI and explain which is used to measure consumer inflation.",
        steps: [
          "CPI (Consumer Price Index): tracks a basket of goods/services bought by households.",
          "PPI (Producer Price Index): tracks prices producers receive for their output (factory gate).",
          "CPI is the official measure of consumer inflation; PPI is a leading indicator.",
        ],
        solution: "CPI = consumer; PPI = producer. Consumer inflation uses CPI.",
        commonErrors: [
          "Using PPI to report household inflation.",
          "Saying CPI ignores services (it includes them).",
        ],
      },
      {
        question: "Identify and briefly describe three types of unemployment in South Africa.",
        steps: [
          "Cyclical: caused by downturns in the business cycle (e.g. recession).",
          "Structural: skills/jobs mismatch (e.g. automation replaces low-skilled jobs).",
          "Frictional: short-term between jobs, including new entrants seeking first job.",
        ],
        solution: "Cyclical / Structural / Frictional.",
        commonErrors: [
          "Confusing structural with frictional unemployment.",
          "Forgetting seasonal as a fourth type.",
        ],
      },
      {
        question: "Explain how a carbon tax can help shift SA towards a greener economy.",
        steps: [
          "Carbon tax adds a cost to each tonne of CO₂ emitted.",
          "Firms face higher costs for fossil-fuel-intensive production — incentive to switch to renewables.",
          "Revenue can be earmarked for green investment, public transport and worker re-skilling.",
        ],
        solution: "Carbon price signal → cleaner production + funding for transition.",
        commonErrors: [
          "Saying a carbon tax 'bans' fossil fuels (it prices them).",
          "Ignoring the just-transition impact on coal-region workers.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "IPV vs PPV — wat meet verbruikersinflasie?",
        steps: ["IPV = verbruikersmandjie; PPV = produsenteprys. IPV vir inflasie."],
        solution: "IPV",
        commonErrors: ["Gebruik PPV vir huishoudelike inflasie."],
      },
      {
        question: "Drie tipes werkloosheid in SA.",
        steps: ["Sikliese, strukturele, friksionele."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar strukturele en friksionele."],
      },
      {
        question: "Hoe help koolstofbelasting groen ekonomie?",
        steps: ["Koolstofprys → skoner produksie; inkomste vir oorgang."],
        solution: "Soos hierbo",
        commonErrors: ["Sê dit verbied fossielbrandstof."],
      },
    ],
  },

  "ECO-5": {
    workedExamplesEn: [
      {
        question: "Distinguish economic growth from economic development and give one indicator of each.",
        steps: [
          "Economic growth: quantitative — rise in real GDP (e.g. 2% per year).",
          "Economic development: qualitative — improvement in living standards (e.g. HDI which combines life expectancy, education and income).",
        ],
        solution: "Growth = real GDP; development = HDI.",
        commonErrors: [
          "Treating growth and development as identical.",
          "Listing only GDP as a development indicator.",
        ],
      },
      {
        question: "List three demand-side and three supply-side policies the SA government can use to drive growth.",
        steps: [
          "Demand-side: tax cuts, infrastructure spending, social grants (raise aggregate demand).",
          "Supply-side: skills training, deregulation, investment incentives (raise productive capacity).",
        ],
        solution: "Demand: tax/spend/grants. Supply: skills/dereg/incentives.",
        commonErrors: [
          "Calling deregulation a demand-side tool.",
          "Confusing supply-side policy with austerity.",
        ],
      },
      {
        question: "If real GDP grew from R3 trillion to R3.15 trillion, calculate the growth rate.",
        steps: [
          "Growth = (3.15 − 3) / 3 × 100 = 0.05 × 100 = 5%.",
        ],
        solution: "5%",
        commonErrors: [
          "Dividing by the new GDP instead of the old.",
          "Forgetting to multiply by 100.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Groei vs ontwikkeling — een aanwyser elk.",
        steps: ["Groei = reële BBP; ontwikkeling = MOI."],
        solution: "Soos hierbo",
        commonErrors: ["Behandel as identies."],
      },
      {
        question: "Drie vraag- en drie aanbodkant-beleide.",
        steps: ["Vraag: belasting/uitgawes/toelaes. Aanbod: vaardighede/dereg/aansporings."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar dereg as vraagkant."],
      },
      {
        question: "Reële BBP R3T → R3.15T. Groei?",
        steps: ["= 5%."],
        solution: "5%",
        commonErrors: ["Deel deur nuwe BBP."],
      },
    ],
  },

  "ECO-6": {
    workedExamplesEn: [
      {
        question: "Define a Special Economic Zone (SEZ) and give one example of an SEZ benefit to firms.",
        steps: [
          "An SEZ is a designated area where firms operate under preferential trade, tax and regulatory rules.",
          "Benefit: reduced corporate tax (15% vs 27%) and customs duty exemptions on inputs.",
        ],
        solution: "SEZ = preferential zone; benefit = lower tax / duty exemptions.",
        commonErrors: [
          "Confusing SEZs with industrial parks (an SEZ has special legal status).",
          "Saying SEZs have no labour law (they do — full SA labour law applies).",
        ],
      },
      {
        question: "Explain what 'beneficiation' means with one mining-sector example.",
        steps: [
          "Beneficiation: adding value to raw materials before export.",
          "Example: instead of exporting raw iron ore, the country processes it into steel domestically — higher export value and local jobs.",
        ],
        solution: "Adding value before export — e.g. iron ore → steel locally.",
        commonErrors: [
          "Calling primary extraction 'beneficiation'.",
          "Listing only mineral examples (it applies to agricultural products too).",
        ],
      },
      {
        question: "How does the Industrial Policy Action Plan (IPAP) support manufacturing?",
        steps: [
          "Targets priority sectors (automotive, clothing, agro-processing).",
          "Provides incentives such as grants, low-interest loans and tariff protection.",
          "Encourages localisation: government procurement favours locally manufactured goods.",
        ],
        solution: "Sector targeting + incentives + localisation.",
        commonErrors: [
          "Confusing IPAP with NDP (NDP is broader and longer-term).",
          "Saying IPAP is voluntary for all sectors.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Wat is 'n SEZ en gee een voordeel.",
        steps: ["Voorkeursone; laer korporatiewe belasting."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar met gewone nywerheidspark."],
      },
      {
        question: "Verklaar voordeligmaking met mynvoorbeeld.",
        steps: ["Waarde toevoeg voor uitvoer — bv. yster → staal in SA."],
        solution: "Soos hierbo",
        commonErrors: ["Noem rou-ontginning as voordeligmaking."],
      },
      {
        question: "Hoe ondersteun IPAP vervaardiging?",
        steps: ["Prioriteit-sektore; aansporings; lokalisering."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar IPAP en NOP."],
      },
    ],
  },

  "ECO-7": {
    workedExamplesEn: [
      {
        question: "Country X can produce 10 cars OR 50 tonnes of wheat. Country Y can produce 4 cars OR 30 tonnes of wheat. Determine comparative advantage for each.",
        steps: [
          "Opportunity cost in X: 1 car = 5 tonnes wheat (50/10). 1 tonne wheat = 0.2 cars.",
          "Opportunity cost in Y: 1 car = 7.5 tonnes wheat (30/4). 1 tonne wheat = 0.13 cars.",
          "X gives up less wheat per car (5 < 7.5) → comparative advantage in cars.",
          "Y gives up fewer cars per tonne of wheat (0.13 < 0.2) → comparative advantage in wheat.",
        ],
        solution: "X specialises in cars; Y specialises in wheat.",
        commonErrors: [
          "Confusing comparative with absolute advantage.",
          "Specialising both countries in the same good.",
        ],
      },
      {
        question: "Distinguish between the current account and capital account in the Balance of Payments.",
        steps: [
          "Current account: trade in goods and services + primary income (dividends, interest) + transfers (remittances).",
          "Capital account: financial assets — direct investment, portfolio flows, reserve changes (often called the financial account in modern SA BoP).",
        ],
        solution: "Current = trade/income flows. Capital/financial = asset flows.",
        commonErrors: [
          "Putting FDI in the current account.",
          "Treating transfers as part of the capital account.",
        ],
      },
      {
        question: "Name three roles of the World Trade Organization (WTO).",
        steps: [
          "Negotiates and enforces multilateral trade agreements (e.g. tariff reductions).",
          "Provides a dispute-settlement mechanism between member countries.",
          "Monitors trade policies and publishes reports to promote transparency.",
        ],
        solution: "Negotiation; dispute resolution; trade-policy monitoring.",
        commonErrors: [
          "Confusing the WTO with the IMF or World Bank.",
          "Saying the WTO sets exchange rates.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "X: 10 motors / 50 t koring; Y: 4 motors / 30 t koring. Vergelykbare voordeel?",
        steps: ["X = motors (5 < 7.5); Y = koring."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar met absolute voordeel."],
      },
      {
        question: "Lopende vs kapitaalrekening (BVB).",
        steps: ["Lopend: handel/inkomste. Kapitaal: bates."],
        solution: "Soos hierbo",
        commonErrors: ["Plaas DBI in lopende rekening."],
      },
      {
        question: "Drie rolle van WHO (WTO).",
        steps: ["Onderhandel; geskilbeslegting; monitor."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar met IMF/Wêreldbank."],
      },
    ],
  },

  "ECO-8": {
    workedExamplesEn: [
      {
        question: "Give two arguments in favour of protectionism and two against it.",
        steps: [
          "For: protect infant industries; safeguard jobs in vulnerable sectors.",
          "Against: higher prices for consumers; risk of trade-war retaliation reducing exports.",
        ],
        solution: "For: infant industry + jobs. Against: higher prices + retaliation.",
        commonErrors: [
          "Listing the same argument twice.",
          "Saying free trade always leads to job loss.",
        ],
      },
      {
        question: "If a country imposes a 30% tariff on imported steel, identify three immediate effects.",
        steps: [
          "Imported steel price rises by 30% → demand for imports falls.",
          "Domestic steel producers gain market share (higher domestic price umbrella).",
          "Steel-using industries (e.g. construction) face higher input costs → may raise final-product prices.",
        ],
        solution: "Imports ↓; domestic producers ↑; downstream costs ↑.",
        commonErrors: [
          "Forgetting the downstream effect on industries that use steel.",
          "Assuming consumer prices fall after a tariff.",
        ],
      },
      {
        question: "Briefly explain the difference between tariffs, quotas and subsidies as trade-policy tools.",
        steps: [
          "Tariff: tax on imports (raises import price).",
          "Quota: quantity limit on imports (restricts supply).",
          "Subsidy: payment to domestic producers (lowers their cost / makes them more competitive).",
        ],
        solution: "Tariff = tax; Quota = quantity cap; Subsidy = producer support.",
        commonErrors: [
          "Confusing tariffs with quotas.",
          "Saying subsidies only apply to exports.",
        ],
      },
    ],
    workedExamplesAf: [
      {
        question: "Twee argumente vir en twee teen proteksionisme.",
        steps: ["Vir: babanywerheid, werk. Teen: hoër pryse, vergelding."],
        solution: "Soos hierbo",
        commonErrors: ["Sê vrye handel veroorsaak altyd werksverlies."],
      },
      {
        question: "30% tarief op staal — drie effekte.",
        steps: ["Invoere ↓; plaaslike produsente ↑; afstroomkoste ↑."],
        solution: "Soos hierbo",
        commonErrors: ["Vergeet afstroom-effekte."],
      },
      {
        question: "Verskil: tariewe, kwotas, subsidies.",
        steps: ["Tarief belasting; kwota hoeveelheidsperk; subsidie produsentehulp."],
        solution: "Soos hierbo",
        commonErrors: ["Verwar tariewe en kwotas."],
      },
    ],
  },
};
