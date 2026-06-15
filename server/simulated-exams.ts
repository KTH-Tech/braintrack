/**
 * SIMULATED NSC EXAMS - ORIGINAL CAPS-ALIGNED QUESTIONS
 * 
 * LEGAL COMPLIANCE:
 * - All questions are ORIGINAL and SIMULATED
 * - Not copied from DBE past papers
 * - Aligned with CAPS curriculum and NSC exam format
 * - DBE content only via external links
 * 
 * Structure: Each subject has Paper 1 and/or Paper 2
 * Each paper has sections with questions following NSC format
 */

export interface SimulatedQuestion {
  id: string;
  questionNumber: string;
  questionText: string;
  questionTextAf: string;
  marks: number;
  cognitiveLevel: "knowledge" | "application" | "higher_order";
  commandVerbs: string[];
  memoText: string;
  memoTextAf: string;
  markingSteps: { step: string; marks: number }[];
  commonErrors: string[];
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

// Student-friendly cognitive level labels
export const COGNITIVE_LEVEL_LABELS = {
  knowledge: {
    simple: "Remember & Recall",
    simpleAf: "Ken jou feite",
    description: "Can you remember the facts?",
    descriptionAf: "Het jy dit geleer? Wys wat jy weet!",
    icon: "📚"
  },
  application: {
    simple: "Use What You Know",
    simpleAf: "Sit jou kennis in werking",
    description: "Can you apply your knowledge to solve problems?",
    descriptionAf: "Gebruik wat jy weet om die probleem op te los — dit is waar dit interessant raak!",
    icon: "🔧"
  },
  higher_order: {
    simple: "Think & Analyse",
    simpleAf: "Dink dieper",
    description: "Can you analyse, evaluate and create new ideas?",
    descriptionAf: "Hier dink jy soos 'n wenner — analiseer, evalueer en bou jou eie argument!",
    icon: "💡"
  }
};

// Helper function to get student-friendly label
export function getCognitiveLevelLabel(level: "knowledge" | "application" | "higher_order", language: "en" | "af" = "en") {
  const labels = COGNITIVE_LEVEL_LABELS[level];
  return {
    label: language === "af" ? labels.simpleAf : labels.simple,
    description: language === "af" ? labels.descriptionAf : labels.description,
    icon: labels.icon
  };
}

export interface SimulatedPaper {
  subjectCode: string;
  subjectName: string;
  subjectNameAf: string;
  paperNumber: number;
  totalMarks: number;
  duration: string;
  // Official DBE past paper links for reference
  dbeLinks: {
    year: number;
    questionPaper: string;
    memo: string;
    supplementary?: string;
  };
  sections: {
    name: string;
    nameAf: string;
    instructions: string;
    instructionsAf: string;
    questions: SimulatedQuestion[];
  }[];
}

// Official DBE Past Paper Base URLs
const DBE_BASE_2023 = "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers";
const DBE_BASE_2022 = "https://www.education.gov.za/Portals/0/CD/2022%20NSC%20Exam%20Papers";
const DBE_BASE_2021 = "https://www.education.gov.za/Portals/0/CD/2021%20NSC%20Exam%20Papers";

// Helper to construct DBE links
function makeDbeLinks(subject: string, paper: number, year: number = 2023) {
  const base = year === 2023 ? DBE_BASE_2023 : year === 2022 ? DBE_BASE_2022 : DBE_BASE_2021;
  const paperStr = `P${paper}`;
  return {
    year,
    questionPaper: `${base}/${subject}%20${paperStr}%20${year}%20Eng.pdf`,
    memo: `${base}/${subject}%20${paperStr}%20${year}%20Memo%20Eng.pdf`
  };
}

// MATHEMATICS PAPER 1 - Algebra, Functions, Calculus
export const MATH_PAPER_1: SimulatedPaper = {
  subjectCode: "MATH",
  subjectName: "Mathematics",
  subjectNameAf: "Wiskunde",
  paperNumber: 1,
  totalMarks: 150,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Mathematics%20P1%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Mathematics%20P1%20Nov%202023%20Memo%20Eng.pdf"
  },
  sections: [
    {
      name: "Section A: Short Questions",
      nameAf: "Afdeling A: Kort Vrae",
      instructions: "Answer ALL questions. Show all working.",
      instructionsAf: "Beantwoord ALLE vrae. Toon alle berekeninge.",
      questions: [
        {
          id: "MATH-P1-Q1.1",
          questionNumber: "1.1",
          questionText: "Solve for x: 2x² + 5x - 3 = 0",
          questionTextAf: "Los op vir x: 2x² + 5x - 3 = 0",
          marks: 3,
          cognitiveLevel: "application",
          commandVerbs: ["solve"],
          memoText: "Using the quadratic formula or factorisation:\n2x² + 5x - 3 = 0\n(2x - 1)(x + 3) = 0\nx = ½ or x = -3",
          memoTextAf: "Deur die kwadratiese formule of faktorisering:\n2x² + 5x - 3 = 0\n(2x - 1)(x + 3) = 0\nx = ½ of x = -3",
          markingSteps: [
            { step: "Correct factorisation or formula setup", marks: 1 },
            { step: "x = ½", marks: 1 },
            { step: "x = -3", marks: 1 }
          ],
          commonErrors: ["Sign errors in factorisation", "Forgetting second root"],
          topic: "Algebra - Quadratic Equations",
          difficulty: "easy"
        },
        {
          id: "MATH-P1-Q1.2",
          questionNumber: "1.2",
          questionText: "Simplify: (3^(x+2) × 9^x) / 27^(x-1)",
          questionTextAf: "Vereenvoudig: (3^(x+2) × 9^x) / 27^(x-1)",
          marks: 4,
          cognitiveLevel: "application",
          commandVerbs: ["simplify"],
          memoText: "= (3^(x+2) × 3^(2x)) / 3^(3x-3)\n= 3^(x+2+2x) / 3^(3x-3)\n= 3^(3x+2) / 3^(3x-3)\n= 3^(3x+2-3x+3)\n= 3^5\n= 243",
          memoTextAf: "= (3^(x+2) × 3^(2x)) / 3^(3x-3)\n= 3^(x+2+2x) / 3^(3x-3)\n= 3^(3x+2) / 3^(3x-3)\n= 3^(3x+2-3x+3)\n= 3^5\n= 243",
          markingSteps: [
            { step: "Converting to base 3", marks: 1 },
            { step: "Correct exponent addition in numerator", marks: 1 },
            { step: "Correct exponent subtraction", marks: 1 },
            { step: "Final answer = 243", marks: 1 }
          ],
          commonErrors: ["Not converting all terms to same base", "Exponent law errors"],
          topic: "Algebra - Exponents",
          difficulty: "medium"
        },
        {
          id: "MATH-P1-Q1.3",
          questionNumber: "1.3",
          questionText: "Solve simultaneously: y = 2x - 1 and x² + y² = 10",
          questionTextAf: "Los gelyktydig op: y = 2x - 1 en x² + y² = 10",
          marks: 5,
          cognitiveLevel: "application",
          commandVerbs: ["solve"],
          memoText: "Substitute y = 2x - 1 into x² + y² = 10:\nx² + (2x-1)² = 10\nx² + 4x² - 4x + 1 = 10\n5x² - 4x - 9 = 0\n(5x - 9)(x + 1) = 0\nx = 9/5 or x = -1\nWhen x = 9/5: y = 2(9/5) - 1 = 13/5\nWhen x = -1: y = 2(-1) - 1 = -3",
          memoTextAf: "Vervang y = 2x - 1 in x² + y² = 10:\nx² + (2x-1)² = 10\nx² + 4x² - 4x + 1 = 10\n5x² - 4x - 9 = 0\n(5x - 9)(x + 1) = 0\nx = 9/5 of x = -1\nWanneer x = 9/5: y = 2(9/5) - 1 = 13/5\nWanneer x = -1: y = 2(-1) - 1 = -3",
          markingSteps: [
            { step: "Correct substitution", marks: 1 },
            { step: "Simplification to standard form", marks: 1 },
            { step: "Solving for x values", marks: 1 },
            { step: "Finding corresponding y values", marks: 2 }
          ],
          commonErrors: ["Expansion errors", "Forgetting to find y values"],
          topic: "Algebra - Simultaneous Equations",
          difficulty: "medium"
        },
        {
          id: "MATH-P1-Q1.4",
          questionNumber: "1.4",
          questionText: "Given the arithmetic sequence: 5; 11; 17; ...\n1.4.1 Determine the nth term.\n1.4.2 Which term equals 101?",
          questionTextAf: "Gegee die rekenkundige ry: 5; 11; 17; ...\n1.4.1 Bepaal die nde term.\n1.4.2 Watter term is gelyk aan 101?",
          marks: 5,
          cognitiveLevel: "application",
          commandVerbs: ["determine"],
          memoText: "1.4.1: a = 5, d = 6\nTn = a + (n-1)d\nTn = 5 + (n-1)(6)\nTn = 5 + 6n - 6\nTn = 6n - 1\n\n1.4.2: 6n - 1 = 101\n6n = 102\nn = 17\nThe 17th term equals 101.",
          memoTextAf: "1.4.1: a = 5, d = 6\nTn = a + (n-1)d\nTn = 5 + (n-1)(6)\nTn = 5 + 6n - 6\nTn = 6n - 1\n\n1.4.2: 6n - 1 = 101\n6n = 102\nn = 17\nDie 17de term is gelyk aan 101.",
          markingSteps: [
            { step: "Identifying a = 5 and d = 6", marks: 1 },
            { step: "Correct formula application", marks: 1 },
            { step: "Tn = 6n - 1", marks: 1 },
            { step: "Setting up equation 6n - 1 = 101", marks: 1 },
            { step: "n = 17", marks: 1 }
          ],
          commonErrors: ["Incorrect common difference", "Formula errors"],
          topic: "Patterns - Arithmetic Sequences",
          difficulty: "easy"
        }
      ]
    },
    {
      name: "Section B: Functions",
      nameAf: "Afdeling B: Funksies",
      instructions: "Answer ALL questions. Draw graphs on graph paper.",
      instructionsAf: "Beantwoord ALLE vrae. Teken grafieke op grafiekpapier.",
      questions: [
        {
          id: "MATH-P1-Q2",
          questionNumber: "2",
          questionText: "Given f(x) = -x² + 4x + 5\n2.1 Determine the coordinates of the turning point.\n2.2 Write down the equation of the axis of symmetry.\n2.3 Determine the x-intercepts.\n2.4 Sketch the graph of f, showing all intercepts and the turning point.\n2.5 For which values of x is f(x) > 0?",
          questionTextAf: "Gegee f(x) = -x² + 4x + 5\n2.1 Bepaal die koördinate van die draaipunt.\n2.2 Skryf die vergelyking van die simmetrie-as neer.\n2.3 Bepaal die x-afsnitte.\n2.4 Skets die grafiek van f, en toon alle afsnitte en die draaipunt.\n2.5 Vir watter waardes van x is f(x) > 0?",
          marks: 14,
          cognitiveLevel: "application",
          commandVerbs: ["determine", "write", "sketch"],
          memoText: "2.1: x = -b/2a = -4/(2×-1) = 2\nf(2) = -(2)² + 4(2) + 5 = -4 + 8 + 5 = 9\nTurning point: (2; 9)\n\n2.2: x = 2\n\n2.3: -x² + 4x + 5 = 0\nx² - 4x - 5 = 0\n(x - 5)(x + 1) = 0\nx = 5 or x = -1\n\n2.4: Graph showing:\n- y-intercept at (0; 5)\n- x-intercepts at (-1; 0) and (5; 0)\n- Turning point at (2; 9)\n- Parabola opens downward\n\n2.5: -1 < x < 5",
          memoTextAf: "2.1: x = -b/2a = -4/(2×-1) = 2\nf(2) = -(2)² + 4(2) + 5 = -4 + 8 + 5 = 9\nDraaipunt: (2; 9)\n\n2.2: x = 2\n\n2.3: -x² + 4x + 5 = 0\nx² - 4x - 5 = 0\n(x - 5)(x + 1) = 0\nx = 5 of x = -1\n\n2.4: Grafiek wat toon:\n- y-afsnit by (0; 5)\n- x-afsnitte by (-1; 0) en (5; 0)\n- Draaipunt by (2; 9)\n- Parabool wys na onder\n\n2.5: -1 < x < 5",
          markingSteps: [
            { step: "2.1: x-coordinate of turning point", marks: 1 },
            { step: "2.1: y-coordinate of turning point", marks: 2 },
            { step: "2.2: Axis of symmetry", marks: 1 },
            { step: "2.3: x-intercepts", marks: 3 },
            { step: "2.4: Correct shape and direction", marks: 2 },
            { step: "2.4: All intercepts and turning point labelled", marks: 3 },
            { step: "2.5: Correct inequality", marks: 2 }
          ],
          commonErrors: ["Sign error in turning point formula", "Not labelling all points on graph"],
          topic: "Functions - Parabola",
          difficulty: "medium"
        },
        {
          id: "MATH-P1-Q3",
          questionNumber: "3",
          questionText: "The graph shows f(x) = a.2^x + q passing through points A(0; 4) and B(2; 13).\n3.1 Determine the values of a and q.\n3.2 Write down the equation of the asymptote.\n3.3 Determine the range of f.",
          questionTextAf: "Die grafiek toon f(x) = a.2^x + q wat deur punte A(0; 4) en B(2; 13) gaan.\n3.1 Bepaal die waardes van a en q.\n3.2 Skryf die vergelyking van die asimptoot neer.\n3.3 Bepaal die waardeversameling van f.",
          marks: 8,
          cognitiveLevel: "higher_order",
          commandVerbs: ["determine", "write"],
          memoText: "3.1: At A(0; 4): 4 = a.2⁰ + q → 4 = a + q ... (1)\nAt B(2; 13): 13 = a.2² + q → 13 = 4a + q ... (2)\n(2) - (1): 9 = 3a → a = 3\nFrom (1): 4 = 3 + q → q = 1\n\n3.2: y = 1 (horizontal asymptote)\n\n3.3: y > 1 or (1; ∞)",
          memoTextAf: "3.1: By A(0; 4): 4 = a.2⁰ + q → 4 = a + q ... (1)\nBy B(2; 13): 13 = a.2² + q → 13 = 4a + q ... (2)\n(2) - (1): 9 = 3a → a = 3\nVan (1): 4 = 3 + q → q = 1\n\n3.2: y = 1 (horisontale asimptoot)\n\n3.3: y > 1 of (1; ∞)",
          markingSteps: [
            { step: "Setting up first equation", marks: 1 },
            { step: "Setting up second equation", marks: 1 },
            { step: "Solving for a = 3", marks: 2 },
            { step: "Solving for q = 1", marks: 1 },
            { step: "Asymptote y = 1", marks: 1 },
            { step: "Range y > 1", marks: 2 }
          ],
          commonErrors: ["Substitution errors", "Confusing asymptote with y-intercept"],
          topic: "Functions - Exponential",
          difficulty: "hard"
        }
      ]
    },
    {
      name: "Section C: Calculus",
      nameAf: "Afdeling C: Differensiaalrekening",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "MATH-P1-Q4",
          questionNumber: "4",
          questionText: "4.1 Differentiate: y = 3x⁴ - 2x² + 5x - 7\n4.2 Determine f'(x) if f(x) = (2x - 3)²\n4.3 Determine dy/dx if y = (x³ - 4)/x",
          questionTextAf: "4.1 Differensieer: y = 3x⁴ - 2x² + 5x - 7\n4.2 Bepaal f'(x) as f(x) = (2x - 3)²\n4.3 Bepaal dy/dx as y = (x³ - 4)/x",
          marks: 9,
          cognitiveLevel: "application",
          commandVerbs: ["differentiate", "determine"],
          memoText: "4.1: dy/dx = 12x³ - 4x + 5\n\n4.2: f(x) = (2x - 3)² = 4x² - 12x + 9\nf'(x) = 8x - 12\n\n4.3: y = (x³ - 4)/x = x² - 4x⁻¹\ndy/dx = 2x + 4x⁻² = 2x + 4/x²",
          memoTextAf: "4.1: dy/dx = 12x³ - 4x + 5\n\n4.2: f(x) = (2x - 3)² = 4x² - 12x + 9\nf'(x) = 8x - 12\n\n4.3: y = (x³ - 4)/x = x² - 4x⁻¹\ndy/dx = 2x + 4x⁻² = 2x + 4/x²",
          markingSteps: [
            { step: "4.1: Correct differentiation", marks: 3 },
            { step: "4.2: Expanding the bracket", marks: 1 },
            { step: "4.2: Correct derivative", marks: 2 },
            { step: "4.3: Rewriting as separate terms", marks: 1 },
            { step: "4.3: Correct derivative", marks: 2 }
          ],
          commonErrors: ["Power rule errors", "Forgetting to expand before differentiating"],
          topic: "Calculus - Differentiation",
          difficulty: "medium"
        },
        {
          id: "MATH-P1-Q5",
          questionNumber: "5",
          questionText: "A rectangular box has a square base with side x and height h. The total surface area is 150 cm².\n5.1 Express h in terms of x.\n5.2 Show that the volume V = (75x - x³)/2\n5.3 Calculate the dimensions that give maximum volume.",
          questionTextAf: "ʼn Reghoekige boks het ʼn vierkantige basis met sy x en hoogte h. Die totale oppervlakte is 150 cm².\n5.1 Druk h uit in terme van x.\n5.2 Toon dat die volume V = (75x - x³)/2\n5.3 Bereken die afmetings wat maksimum volume gee.",
          marks: 12,
          cognitiveLevel: "higher_order",
          commandVerbs: ["express", "show", "calculate"],
          memoText: "5.1: Surface area = 2x² + 4xh = 150\n4xh = 150 - 2x²\nh = (150 - 2x²)/(4x) = (75 - x²)/(2x)\n\n5.2: V = x²h = x² × (75 - x²)/(2x)\nV = x(75 - x²)/2 = (75x - x³)/2\n\n5.3: V = (75x - x³)/2\ndV/dx = (75 - 3x²)/2 = 0\n75 - 3x² = 0\nx² = 25\nx = 5 cm (x > 0)\nh = (75 - 25)/(2×5) = 50/10 = 5 cm\nDimensions: 5 cm × 5 cm × 5 cm (cube)",
          memoTextAf: "5.1: Oppervlakte = 2x² + 4xh = 150\n4xh = 150 - 2x²\nh = (150 - 2x²)/(4x) = (75 - x²)/(2x)\n\n5.2: V = x²h = x² × (75 - x²)/(2x)\nV = x(75 - x²)/2 = (75x - x³)/2\n\n5.3: V = (75x - x³)/2\ndV/dx = (75 - 3x²)/2 = 0\n75 - 3x² = 0\nx² = 25\nx = 5 cm (x > 0)\nh = (75 - 25)/(2×5) = 50/10 = 5 cm\nAfmetings: 5 cm × 5 cm × 5 cm (kubus)",
          markingSteps: [
            { step: "5.1: Setting up surface area equation", marks: 1 },
            { step: "5.1: Solving for h", marks: 2 },
            { step: "5.2: Substituting into volume formula", marks: 2 },
            { step: "5.2: Simplifying to given form", marks: 1 },
            { step: "5.3: Differentiating volume", marks: 2 },
            { step: "5.3: Setting derivative = 0 and solving", marks: 2 },
            { step: "5.3: Finding both dimensions", marks: 2 }
          ],
          commonErrors: ["Surface area formula wrong", "Not verifying maximum"],
          topic: "Calculus - Optimisation",
          difficulty: "hard"
        }
      ]
    }
  ]
};

// MATHEMATICS PAPER 2 - Geometry, Trigonometry, Statistics
export const MATH_PAPER_2: SimulatedPaper = {
  subjectCode: "MATH",
  subjectName: "Mathematics",
  subjectNameAf: "Wiskunde",
  paperNumber: 2,
  totalMarks: 150,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Mathematics%20P2%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Mathematics%20P2%20Nov%202023%20Memo%20Eng.pdf"
  },
  sections: [
    {
      name: "Section A: Statistics",
      nameAf: "Afdeling A: Statistiek",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "MATH-P2-Q1",
          questionNumber: "1",
          questionText: "The marks (out of 50) of 10 learners are: 23, 28, 32, 35, 37, 38, 40, 42, 45, 48\n1.1 Calculate the mean.\n1.2 Calculate the standard deviation.\n1.3 How many learners scored within one standard deviation of the mean?",
          questionTextAf: "Die punte (uit 50) van 10 leerders is: 23, 28, 32, 35, 37, 38, 40, 42, 45, 48\n1.1 Bereken die gemiddeld.\n1.2 Bereken die standaardafwyking.\n1.3 Hoeveel leerders het binne een standaardafwyking van die gemiddeld behaal?",
          marks: 8,
          cognitiveLevel: "application",
          commandVerbs: ["calculate"],
          memoText: "1.1: Mean = (23+28+32+35+37+38+40+42+45+48)/10 = 368/10 = 36.8\n\n1.2: Using calculator or formula:\nσ = √[Σ(x-x̄)²/n] = 7.16 (to 2 decimal places)\n\n1.3: Range: 36.8 - 7.16 to 36.8 + 7.16 = 29.64 to 43.96\nLearners in range: 32, 35, 37, 38, 40, 42 = 6 learners",
          memoTextAf: "1.1: Gemiddeld = (23+28+32+35+37+38+40+42+45+48)/10 = 368/10 = 36.8\n\n1.2: Met sakrekenaar of formule:\nσ = √[Σ(x-x̄)²/n] = 7.16 (tot 2 desimale plekke)\n\n1.3: Reikwydte: 36.8 - 7.16 tot 36.8 + 7.16 = 29.64 tot 43.96\nLeerders in reikwydte: 32, 35, 37, 38, 40, 42 = 6 leerders",
          markingSteps: [
            { step: "1.1: Correct mean = 36.8", marks: 2 },
            { step: "1.2: Correct standard deviation", marks: 3 },
            { step: "1.3: Calculating range", marks: 1 },
            { step: "1.3: Correct count = 6", marks: 2 }
          ],
          commonErrors: ["Using n-1 instead of n", "Counting errors"],
          topic: "Statistics - Mean and Standard Deviation",
          difficulty: "medium"
        }
      ]
    },
    {
      name: "Section B: Trigonometry",
      nameAf: "Afdeling B: Trigonometrie",
      instructions: "Answer ALL questions. Round to 2 decimal places unless stated otherwise.",
      instructionsAf: "Beantwoord ALLE vrae. Rond af tot 2 desimale plekke tensy anders vermeld.",
      questions: [
        {
          id: "MATH-P2-Q2",
          questionNumber: "2",
          questionText: "2.1 Prove that (sin θ + cos θ)² = 1 + sin 2θ\n2.2 Hence, or otherwise, solve for θ ∈ [0°; 360°]: (sin θ + cos θ)² = 1.5",
          questionTextAf: "2.1 Bewys dat (sin θ + cos θ)² = 1 + sin 2θ\n2.2 Gebruik hierdie, of andersins, om op te los vir θ ∈ [0°; 360°]: (sin θ + cos θ)² = 1.5",
          marks: 10,
          cognitiveLevel: "higher_order",
          commandVerbs: ["prove", "solve"],
          memoText: "2.1: LHS = (sin θ + cos θ)²\n= sin²θ + 2sinθcosθ + cos²θ\n= (sin²θ + cos²θ) + 2sinθcosθ\n= 1 + 2sinθcosθ\n= 1 + sin 2θ = RHS\n\n2.2: 1 + sin 2θ = 1.5\nsin 2θ = 0.5\n2θ = 30° or 2θ = 150° or 2θ = 390° or 2θ = 510°\nθ = 15° or 75° or 195° or 255°",
          memoTextAf: "2.1: LK = (sin θ + cos θ)²\n= sin²θ + 2sinθcosθ + cos²θ\n= (sin²θ + cos²θ) + 2sinθcosθ\n= 1 + 2sinθcosθ\n= 1 + sin 2θ = RK\n\n2.2: 1 + sin 2θ = 1.5\nsin 2θ = 0.5\n2θ = 30° of 2θ = 150° of 2θ = 390° of 2θ = 510°\nθ = 15° of 75° of 195° of 255°",
          markingSteps: [
            { step: "2.1: Expanding LHS", marks: 1 },
            { step: "2.1: Using Pythagorean identity", marks: 1 },
            { step: "2.1: Using double angle formula", marks: 2 },
            { step: "2.2: Isolating sin 2θ", marks: 1 },
            { step: "2.2: Reference angle 30°", marks: 1 },
            { step: "2.2: All four answers", marks: 4 }
          ],
          commonErrors: ["Missing solutions", "Not using identity correctly"],
          topic: "Trigonometry - Identities and Equations",
          difficulty: "hard"
        },
        {
          id: "MATH-P2-Q3",
          questionNumber: "3",
          questionText: "In triangle PQR, PQ = 8 cm, QR = 12 cm and angle Q = 65°.\n3.1 Calculate the length of PR.\n3.2 Calculate the area of triangle PQR.",
          questionTextAf: "In driehoek PQR, PQ = 8 cm, QR = 12 cm en hoek Q = 65°.\n3.1 Bereken die lengte van PR.\n3.2 Bereken die oppervlakte van driehoek PQR.",
          marks: 7,
          cognitiveLevel: "application",
          commandVerbs: ["calculate"],
          memoText: "3.1: Using cosine rule:\nPR² = PQ² + QR² - 2(PQ)(QR)cos Q\nPR² = 64 + 144 - 2(8)(12)cos 65°\nPR² = 208 - 192(0.4226)\nPR² = 208 - 81.14 = 126.86\nPR = 11.27 cm\n\n3.2: Area = ½(PQ)(QR)sin Q\n= ½(8)(12)sin 65°\n= 48(0.9063)\n= 43.50 cm²",
          memoTextAf: "3.1: Met die cosinusreël:\nPR² = PQ² + QR² - 2(PQ)(QR)cos Q\nPR² = 64 + 144 - 2(8)(12)cos 65°\nPR² = 208 - 192(0.4226)\nPR² = 208 - 81.14 = 126.86\nPR = 11.27 cm\n\n3.2: Oppervlakte = ½(PQ)(QR)sin Q\n= ½(8)(12)sin 65°\n= 48(0.9063)\n= 43.50 cm²",
          markingSteps: [
            { step: "3.1: Cosine rule setup", marks: 1 },
            { step: "3.1: Correct substitution", marks: 2 },
            { step: "3.1: PR = 11.27 cm", marks: 1 },
            { step: "3.2: Area formula", marks: 1 },
            { step: "3.2: Correct answer", marks: 2 }
          ],
          commonErrors: ["Using wrong rule", "Calculator in wrong mode"],
          topic: "Trigonometry - Sine and Cosine Rules",
          difficulty: "medium"
        }
      ]
    },
    {
      name: "Section C: Euclidean Geometry",
      nameAf: "Afdeling C: Euklidiese Meetkunde",
      instructions: "Answer ALL questions. Give reasons for all statements.",
      instructionsAf: "Beantwoord ALLE vrae. Gee redes vir alle stellings.",
      questions: [
        {
          id: "MATH-P2-Q4",
          questionNumber: "4",
          questionText: "In the diagram, O is the centre of the circle. A, B, C and D are points on the circle. AOC is a diameter. Angle BAC = 35°.\n4.1 Determine the size of angle BCA.\n4.2 Determine the size of angle BOC.\n4.3 Determine the size of angle BDC.",
          questionTextAf: "In die diagram is O die middelpunt van die sirkel. A, B, C en D is punte op die sirkel. AOC is 'n deursnee. Hoek BAC = 35°.\n4.1 Bepaal die grootte van hoek BCA.\n4.2 Bepaal die grootte van hoek BOC.\n4.3 Bepaal die grootte van hoek BDC.",
          marks: 9,
          cognitiveLevel: "application",
          commandVerbs: ["determine"],
          memoText: "4.1: Angle ABC = 90° (angle in semi-circle)\nIn triangle ABC: BCA = 180° - 90° - 35° = 55°\n\n4.2: Angle BOC = 2 × angle BAC (angle at centre = 2 × angle at circumference)\nBOC = 2 × 35° = 70°\n\n4.3: Angle BDC = angle BAC = 35° (angles subtended by same arc BC)",
          memoTextAf: "4.1: Hoek ABC = 90° (hoek in 'n halfsirkel)\nIn driehoek ABC: BCA = 180° - 90° - 35° = 55°\n\n4.2: Hoek BOC = 2 × hoek BAC (hoek by middelpunt = 2 × hoek by omtrek)\nBOC = 2 × 35° = 70°\n\n4.3: Hoek BDC = hoek BAC = 35° (hoeke onderspann deur dieselfde boog BC)",
          markingSteps: [
            { step: "4.1: Angle in semi-circle = 90°", marks: 2 },
            { step: "4.1: BCA = 55°", marks: 1 },
            { step: "4.2: Centre-circumference relationship", marks: 2 },
            { step: "4.2: BOC = 70°", marks: 1 },
            { step: "4.3: Same arc theorem", marks: 2 },
            { step: "4.3: BDC = 35°", marks: 1 }
          ],
          commonErrors: ["Forgetting reasons", "Confusing theorems"],
          topic: "Geometry - Circle Theorems",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// PHYSICAL SCIENCES PAPER 1 - Physics
export const PHYSICS_PAPER_1: SimulatedPaper = {
  subjectCode: "PHYS",
  subjectName: "Physical Sciences",
  subjectNameAf: "Fisiese Wetenskappe",
  paperNumber: 1,
  totalMarks: 150,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Physical%20Sciences%20P1%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Physical%20Sciences%20P1%20Nov%202023%20Memo%20Eng.pdf"
  },
  sections: [
    {
      name: "Section A: Multiple Choice",
      nameAf: "Afdeling A: Meervoudige Keuse",
      instructions: "Choose the correct answer for each question.",
      instructionsAf: "Kies die korrekte antwoord vir elke vraag.",
      questions: [
        {
          id: "PHYS-P1-Q1.1",
          questionNumber: "1.1",
          questionText: "A ball is thrown vertically upwards. At the highest point of its motion, the acceleration of the ball is:\nA. Zero\nB. 9.8 m·s⁻² downwards\nC. 9.8 m·s⁻² upwards\nD. Dependent on the initial velocity",
          questionTextAf: "'n Bal word vertikaal opwaarts gegooi. Op die hoogste punt van sy beweging is die versnelling van die bal:\nA. Nul\nB. 9.8 m·s⁻² afwaarts\nC. 9.8 m·s⁻² opwaarts\nD. Afhanklik van die aanvanklike snelheid",
          marks: 2,
          cognitiveLevel: "knowledge",
          commandVerbs: ["choose"],
          memoText: "B. 9.8 m·s⁻² downwards\nThe acceleration due to gravity is constant and always acts downwards, regardless of the velocity of the object.",
          memoTextAf: "B. 9.8 m·s⁻² afwaarts\nDie versnelling as gevolg van swaartekrag is konstant en werk altyd afwaarts, ongeag die snelheid van die voorwerp.",
          markingSteps: [
            { step: "Correct answer: B", marks: 2 }
          ],
          commonErrors: ["Thinking acceleration is zero at highest point"],
          topic: "Mechanics - Free Fall",
          difficulty: "easy"
        },
        {
          id: "PHYS-P1-Q1.2",
          questionNumber: "1.2",
          questionText: "Two charges of +2 μC and -4 μC are placed 0.3 m apart. The electrostatic force between them is:\nA. Attractive and 0.8 N\nB. Repulsive and 0.8 N\nC. Attractive and 80 N\nD. Repulsive and 80 N",
          questionTextAf: "Twee ladings van +2 μC en -4 μC word 0.3 m van mekaar geplaas. Die elektrostatiese krag tussen hulle is:\nA. Aantrekkend en 0.8 N\nB. Afstotend en 0.8 N\nC. Aantrekkend en 80 N\nD. Afstotend en 80 N",
          marks: 2,
          cognitiveLevel: "application",
          commandVerbs: ["choose"],
          memoText: "A. Attractive and 0.8 N\nF = kQ₁Q₂/r² = (9×10⁹)(2×10⁻⁶)(4×10⁻⁶)/(0.3)² = 0.8 N\nOpposite charges attract.",
          memoTextAf: "A. Aantrekkend en 0.8 N\nF = kQ₁Q₂/r² = (9×10⁹)(2×10⁻⁶)(4×10⁻⁶)/(0.3)² = 0.8 N\nTeenoorgestelde ladings trek mekaar aan.",
          markingSteps: [
            { step: "Correct answer: A", marks: 2 }
          ],
          commonErrors: ["Forgetting to convert micro to standard units", "Wrong sign interpretation"],
          topic: "Electrostatics - Coulomb's Law",
          difficulty: "medium"
        }
      ]
    },
    {
      name: "Section B: Mechanics",
      nameAf: "Afdeling B: Meganika",
      instructions: "Answer ALL questions. Show all working and formulae used.",
      instructionsAf: "Beantwoord ALLE vrae. Toon alle berekeninge en formules.",
      questions: [
        {
          id: "PHYS-P1-Q2",
          questionNumber: "2",
          questionText: "A 1500 kg car accelerates uniformly from rest to 25 m·s⁻¹ in 10 seconds on a horizontal road.\n2.1 Calculate the acceleration of the car.\n2.2 Calculate the net force acting on the car.\n2.3 If the frictional force is 500 N, calculate the driving force of the engine.\n2.4 Calculate the work done by the engine over the 10 seconds.",
          questionTextAf: "'n 1500 kg motor versnel eweredig van rus tot 25 m·s⁻¹ in 10 sekondes op 'n horisontale pad.\n2.1 Bereken die versnelling van die motor.\n2.2 Bereken die netto krag wat op die motor inwerk.\n2.3 As die wrywingskrag 500 N is, bereken die dryfkrag van die enjin.\n2.4 Bereken die arbeid gedoen deur die enjin oor die 10 sekondes.",
          marks: 14,
          cognitiveLevel: "application",
          commandVerbs: ["calculate"],
          memoText: "2.1: a = (v - u)/t = (25 - 0)/10 = 2.5 m·s⁻²\n\n2.2: Fnet = ma = (1500)(2.5) = 3750 N\n\n2.3: Fengine - Ffriction = Fnet\nFengine = 3750 + 500 = 4250 N\n\n2.4: Distance: s = ut + ½at² = 0 + ½(2.5)(10)² = 125 m\nWork by engine: W = Fs = (4250)(125) = 531 250 J = 531.25 kJ",
          memoTextAf: "2.1: a = (v - u)/t = (25 - 0)/10 = 2.5 m·s⁻²\n\n2.2: Fnetto = ma = (1500)(2.5) = 3750 N\n\n2.3: Fenjin - Fwrywing = Fnetto\nFenjin = 3750 + 500 = 4250 N\n\n2.4: Afstand: s = ut + ½at² = 0 + ½(2.5)(10)² = 125 m\nArbeid deur enjin: W = Fs = (4250)(125) = 531 250 J = 531.25 kJ",
          markingSteps: [
            { step: "2.1: Correct formula", marks: 1 },
            { step: "2.1: a = 2.5 m·s⁻²", marks: 2 },
            { step: "2.2: Newton's second law", marks: 1 },
            { step: "2.2: Fnet = 3750 N", marks: 2 },
            { step: "2.3: Force analysis", marks: 1 },
            { step: "2.3: Fengine = 4250 N", marks: 2 },
            { step: "2.4: Distance calculation", marks: 2 },
            { step: "2.4: Work = 531.25 kJ", marks: 3 }
          ],
          commonErrors: ["Forgetting friction in force analysis", "Using wrong kinematic equation"],
          topic: "Mechanics - Newton's Laws and Work",
          difficulty: "medium"
        },
        {
          id: "PHYS-P1-Q3",
          questionNumber: "3",
          questionText: "A 0.5 kg ball is dropped from a height of 20 m. Ignore air resistance.\n3.1 State the law of conservation of mechanical energy.\n3.2 Calculate the velocity of the ball just before it hits the ground using energy principles.\n3.3 The ball bounces back to a height of 15 m. Calculate the energy lost during the bounce.",
          questionTextAf: "'n 0.5 kg bal word van 'n hoogte van 20 m laat val. Ignoreer lugweerstand.\n3.1 Formuleer die wet van behoud van meganiese energie.\n3.2 Bereken die snelheid van die bal net voor dit die grond tref deur energiebeginsels te gebruik.\n3.3 Die bal bons terug na 'n hoogte van 15 m. Bereken die energie verloor tydens die bons.",
          marks: 12,
          cognitiveLevel: "application",
          commandVerbs: ["state", "calculate"],
          memoText: "3.1: In an isolated system, the total mechanical energy remains constant. (Or: The sum of kinetic and potential energy remains constant in the absence of non-conservative forces.)\n\n3.2: EP(top) = EK(bottom)\nmgh = ½mv²\nv² = 2gh = 2(9.8)(20) = 392\nv = 19.8 m·s⁻¹\n\n3.3: Energy before = mgh₁ = (0.5)(9.8)(20) = 98 J\nEnergy after = mgh₂ = (0.5)(9.8)(15) = 73.5 J\nEnergy lost = 98 - 73.5 = 24.5 J",
          memoTextAf: "3.1: In 'n geïsoleerde stelsel bly die totale meganiese energie konstant. (Of: Die som van kinetiese en potensiële energie bly konstant in die afwesigheid van nie-konserwatiewe kragte.)\n\n3.2: EP(bo) = EK(onder)\nmgh = ½mv²\nv² = 2gh = 2(9.8)(20) = 392\nv = 19.8 m·s⁻¹\n\n3.3: Energie voor = mgh₁ = (0.5)(9.8)(20) = 98 J\nEnergie na = mgh₂ = (0.5)(9.8)(15) = 73.5 J\nEnergie verloor = 98 - 73.5 = 24.5 J",
          markingSteps: [
            { step: "3.1: Correct statement of law", marks: 2 },
            { step: "3.2: Energy conversion equation", marks: 1 },
            { step: "3.2: Correct substitution", marks: 2 },
            { step: "3.2: v = 19.8 m·s⁻¹", marks: 2 },
            { step: "3.3: Initial energy calculation", marks: 2 },
            { step: "3.3: Final energy calculation", marks: 1 },
            { step: "3.3: Energy lost = 24.5 J", marks: 2 }
          ],
          commonErrors: ["Not stating law correctly", "Forgetting to take square root"],
          topic: "Mechanics - Conservation of Energy",
          difficulty: "medium"
        }
      ]
    },
    {
      name: "Section C: Electricity and Magnetism",
      nameAf: "Afdeling C: Elektrisiteit en Magnetisme",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "PHYS-P1-Q4",
          questionNumber: "4",
          questionText: "A circuit contains a 12 V battery with internal resistance 0.5 Ω connected to two resistors: R₁ = 3 Ω and R₂ = 6 Ω in parallel.\n4.1 Calculate the equivalent resistance of the external circuit.\n4.2 Calculate the current through the battery.\n4.3 Calculate the power dissipated in R₂.\n4.4 Calculate the potential difference across the external circuit.",
          questionTextAf: "'n Stroombaan bevat 'n 12 V battery met interne weerstand 0.5 Ω verbind aan twee resistors: R₁ = 3 Ω en R₂ = 6 Ω in parallel.\n4.1 Bereken die ekwivalente weerstand van die eksterne stroombaan.\n4.2 Bereken die stroom deur die battery.\n4.3 Bereken die drywing gedissipeer in R₂.\n4.4 Bereken die potensiaalverskil oor die eksterne stroombaan.",
          marks: 14,
          cognitiveLevel: "application",
          commandVerbs: ["calculate"],
          memoText: "4.1: 1/Rp = 1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2\nRp = 2 Ω\n\n4.2: Total R = Rp + r = 2 + 0.5 = 2.5 Ω\nI = ε/Rtotal = 12/2.5 = 4.8 A\n\n4.3: V across parallel = IR = (4.8)(2) = 9.6 V\nPower in R₂ = V²/R₂ = (9.6)²/6 = 15.36 W\n\n4.4: Vexternal = ε - Ir = 12 - (4.8)(0.5) = 12 - 2.4 = 9.6 V",
          memoTextAf: "4.1: 1/Rp = 1/3 + 1/6 = 2/6 + 1/6 = 3/6 = 1/2\nRp = 2 Ω\n\n4.2: Totale R = Rp + r = 2 + 0.5 = 2.5 Ω\nI = ε/Rtotaal = 12/2.5 = 4.8 A\n\n4.3: V oor parallel = IR = (4.8)(2) = 9.6 V\nDrywing in R₂ = V²/R₂ = (9.6)²/6 = 15.36 W\n\n4.4: Vekstern = ε - Ir = 12 - (4.8)(0.5) = 12 - 2.4 = 9.6 V",
          markingSteps: [
            { step: "4.1: Parallel formula", marks: 1 },
            { step: "4.1: Rp = 2 Ω", marks: 2 },
            { step: "4.2: Total resistance", marks: 1 },
            { step: "4.2: Current = 4.8 A", marks: 2 },
            { step: "4.3: Voltage across parallel", marks: 2 },
            { step: "4.3: Power = 15.36 W", marks: 2 },
            { step: "4.4: EMF equation", marks: 2 },
            { step: "4.4: Vexternal = 9.6 V", marks: 2 }
          ],
          commonErrors: ["Forgetting internal resistance", "Using wrong power formula"],
          topic: "Electricity - Circuits with Internal Resistance",
          difficulty: "hard"
        }
      ]
    }
  ]
};

// ACCOUNTING
export const ACCOUNTING_PAPER: SimulatedPaper = {
  subjectCode: "ACC",
  subjectName: "Accounting",
  subjectNameAf: "Rekeningkunde",
  paperNumber: 1,
  totalMarks: 300,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Accounting%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Accounting%20Nov%202023%20Memo%20Eng.pdf"
  },
  sections: [
    {
      name: "Section A: Financial Statements",
      nameAf: "Afdeling A: Finansiële State",
      instructions: "Answer ALL questions. Show all workings.",
      instructionsAf: "Beantwoord ALLE vrae. Toon alle werkings.",
      questions: [
        {
          id: "ACC-Q1",
          questionNumber: "1",
          questionText: "The following information relates to Thando Traders for the year ended 28 February 2026:\n\nStock: 1 March 2025: R45 000; 28 February 2026: R52 000\nCost of sales: R380 000\nGross profit: R190 000\nOperating expenses: R95 000\n\n1.1 Calculate the stock turnover rate.\n1.2 Comment on whether this rate is satisfactory if the industry average is 8 times.\n1.3 Suggest TWO ways to improve this rate.",
          questionTextAf: "Die volgende inligting het betrekking op Thando Handelaars vir die jaar geëindig 28 Februarie 2026:\n\nVoorraad: 1 Maart 2025: R45 000; 28 Februarie 2026: R52 000\nKoste van verkope: R380 000\nBruto wins: R190 000\nBedryfsuitgawes: R95 000\n\n1.1 Bereken die voorraadmomloopsnelheid.\n1.2 Lewer kommentaar of hierdie koers bevredigend is as die bedryfsgemiddeld 8 keer is.\n1.3 Stel TWEE maniere voor om hierdie koers te verbeter.",
          marks: 12,
          cognitiveLevel: "application",
          commandVerbs: ["calculate", "comment", "suggest"],
          memoText: "1.1: Average stock = (45 000 + 52 000) / 2 = R48 500\nStock turnover rate = Cost of sales / Average stock\n= 380 000 / 48 500 = 7.84 times\n\n1.2: The rate of 7.84 times is slightly below the industry average of 8 times. This indicates that the business is holding stock for slightly longer than competitors, which could tie up working capital unnecessarily.\n\n1.3: Ways to improve:\n• Reduce order quantities and order more frequently\n• Identify and discount slow-moving stock items\n• Improve stock control systems\n• Negotiate faster delivery from suppliers\n• Use just-in-time inventory management",
          memoTextAf: "1.1: Gemiddelde voorraad = (45 000 + 52 000) / 2 = R48 500\nVoorraadmomloopsnelheid = Koste van verkope / Gemiddelde voorraad\n= 380 000 / 48 500 = 7.84 keer\n\n1.2: Die koers van 7.84 keer is effens onder die bedryfsgemiddeld van 8 keer. Dit dui aan dat die besigheid voorraad effens langer hou as mededingers, wat bedryfskapitaal onnodig kan vasmaak.\n\n1.3: Maniere om te verbeter:\n• Verminder bestellingshoeveelhede en bestel meer gereeld\n• Identifiseer en gee afslag op stadigbewegende voorraadartikels\n• Verbeter voorraadbeheerstelsels\n• Onderhandel vinniger aflewering van verskaffers\n• Gebruik net-betyds voorraadbestuur",
          markingSteps: [
            { step: "1.1: Average stock calculation", marks: 2 },
            { step: "1.1: Stock turnover formula", marks: 1 },
            { step: "1.1: Answer = 7.84 times", marks: 2 },
            { step: "1.2: Comparison with industry average", marks: 2 },
            { step: "1.2: Interpretation of result", marks: 2 },
            { step: "1.3: Two valid suggestions", marks: 3 }
          ],
          commonErrors: ["Using closing stock instead of average", "Not linking to industry average"],
          topic: "Financial Statements - Ratio Analysis",
          difficulty: "medium"
        }
      ]
    },
    {
      name: "Section B: Reconciliations",
      nameAf: "Afdeling B: Rekonsiliasies",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "ACC-Q2",
          questionNumber: "2",
          questionText: "The following information relates to the Bank Reconciliation of Sizwe Stores on 30 April 2026:\n\nBank statement balance (credit): R18 450\nCash book balance (debit): R15 200\n\nThe following differences were identified:\n1. Deposit of R2 500 not yet credited by bank\n2. Unpresented cheque no. 245: R1 800\n3. Bank charges of R150 not recorded in cash book\n4. Direct deposit from debtor M. Nkosi R3 200 not in cash book\n5. Cheque from debtor dishonoured: R600\n\n2.1 Prepare the Bank Reconciliation Statement.\n2.2 Calculate the correct cash book balance.",
          questionTextAf: "Die volgende inligting het betrekking op die Bankrekonsiliasie van Sizwe Stores op 30 April 2026:\n\nBankstaatsaldo (krediet): R18 450\nKontantboeksaldo (debiet): R15 200\n\nDie volgende verskille is geïdentifiseer:\n1. Deposito van R2 500 nog nie deur bank gekrediteer nie\n2. Uitstaande tjek no. 245: R1 800\n3. Bankkoste van R150 nie in kontantboek aangeteken nie\n4. Direkte deposito van debiteur M. Nkosi R3 200 nie in kontantboek nie\n5. Tjek van debiteur gedishonoreer: R600\n\n2.1 Berei die Bankrekonsiliasie-staat voor.\n2.2 Bereken die korrekte kontantboeksaldo.",
          marks: 16,
          cognitiveLevel: "application",
          commandVerbs: ["prepare", "calculate"],
          memoText: "2.1 Bank Reconciliation Statement on 30 April 2026\n\nBalance per bank statement (Cr): R18 450\nAdd: Outstanding deposit: R2 500\n= R20 950\nLess: Unpresented cheque: (R1 800)\nBalance per corrected cash book: R19 150\n\n2.2 Cash Book Corrections:\nBalance per cash book: R15 200\nAdd: Direct deposit from M. Nkosi: R3 200\n= R18 400\nLess: Bank charges: (R150)\nLess: Dishonoured cheque: (R600)\nCorrected cash book balance: R17 650\n\nNote: There is still a difference of R1 500 to be investigated.",
          memoTextAf: "2.1 Bankrekonsiliasie-staat op 30 April 2026\n\nSaldo per bankstaat (Kr): R18 450\nPlus: Uitstaande deposito: R2 500\n= R20 950\nMinus: Uitstaande tjek: (R1 800)\nSaldo per gekorrigeerde kontantboek: R19 150\n\n2.2 Kontantboek Regstellings:\nSaldo per kontantboek: R15 200\nPlus: Direkte deposito van M. Nkosi: R3 200\n= R18 400\nMinus: Bankkoste: (R150)\nMinus: Gedishonoreerde tjek: (R600)\nGekorrigeerde kontantboeksaldo: R17 650\n\nNota: Daar is steeds 'n verskil van R1 500 om te ondersoek.",
          markingSteps: [
            { step: "2.1: Starting with bank statement balance", marks: 1 },
            { step: "2.1: Adding outstanding deposit", marks: 2 },
            { step: "2.1: Subtracting unpresented cheque", marks: 2 },
            { step: "2.1: Correct format", marks: 2 },
            { step: "2.2: Starting with cash book balance", marks: 1 },
            { step: "2.2: Adding direct deposit", marks: 2 },
            { step: "2.2: Subtracting bank charges", marks: 2 },
            { step: "2.2: Subtracting dishonoured cheque", marks: 2 },
            { step: "2.2: Correct final balance", marks: 2 }
          ],
          commonErrors: ["Mixing up which items affect bank vs cash book", "Wrong signs"],
          topic: "Reconciliations - Bank Reconciliation",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// LIFE SCIENCES
export const LIFE_SCIENCES_PAPER_1: SimulatedPaper = {
  subjectCode: "LIFE",
  subjectName: "Life Sciences",
  subjectNameAf: "Lewenswetenskappe",
  paperNumber: 1,
  totalMarks: 150,
  duration: "2.5 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Life%20Sciences%20P1%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Life%20Sciences%20P1%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Short Questions",
      nameAf: "Afdeling A: Kort Vrae",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "LIFE-P1-Q1.1",
          questionNumber: "1.1",
          questionText: "Study the diagram showing cell division.\n\n1.1.1 Identify the type of cell division shown.\n1.1.2 Name the phase shown in diagram B.\n1.1.3 How many chromosomes would be present in the daughter cells?",
          questionTextAf: "Bestudeer die diagram wat seldeling toon.\n\n1.1.1 Identifiseer die tipe seldeling wat getoon word.\n1.1.2 Noem die fase wat in diagram B getoon word.\n1.1.3 Hoeveel chromosome sal in die dogtenselle teenwoordig wees?",
          marks: 6,
          cognitiveLevel: "knowledge",
          commandVerbs: ["identify", "name"],
          memoText: "1.1.1: Mitosis\n\n1.1.2: Metaphase (chromosomes aligned at cell equator/metaphase plate)\n\n1.1.3: Same number as parent cell (diploid/2n). If parent cell has 46, daughter cells have 46 each.",
          memoTextAf: "1.1.1: Mitose\n\n1.1.2: Metafase (chromosome in lyn by selekwator/metafaseplaat)\n\n1.1.3: Dieselfde getal as ouerselle (diploïed/2n). As ouersel 46 het, het dogtenselle elk 46.",
          markingSteps: [
            { step: "1.1.1: Mitosis", marks: 2 },
            { step: "1.1.2: Metaphase", marks: 2 },
            { step: "1.1.3: Same as parent/diploid", marks: 2 }
          ],
          commonErrors: ["Confusing mitosis with meiosis", "Not specifying diploid number"],
          topic: "Cell Division - Mitosis",
          difficulty: "easy"
        },
        {
          id: "LIFE-P1-Q1.2",
          questionNumber: "1.2",
          questionText: "Match the terms in COLUMN A with the descriptions in COLUMN B:\n\nCOLUMN A:\n1.2.1 Genotype\n1.2.2 Phenotype\n1.2.3 Allele\n1.2.4 Homozygous\n\nCOLUMN B:\nA. Physical expression of genes\nB. Genetic makeup of an organism\nC. Different forms of the same gene\nD. Having two identical alleles\nE. Having two different alleles",
          questionTextAf: "Pas die terme in KOLOM A by die beskrywings in KOLOM B:\n\nKOLOM A:\n1.2.1 Genotipe\n1.2.2 Fenotipe\n1.2.3 Alleel\n1.2.4 Homosigoties\n\nKOLOM B:\nA. Fisiese uitdrukking van gene\nB. Genetiese samestelling van 'n organisme\nC. Verskillende vorme van dieselfde geen\nD. Het twee identiese allele\nE. Het twee verskillende allele",
          marks: 8,
          cognitiveLevel: "knowledge",
          commandVerbs: ["match"],
          memoText: "1.2.1 B - Genotype is the genetic makeup\n1.2.2 A - Phenotype is physical expression\n1.2.3 C - Allele is different forms of same gene\n1.2.4 D - Homozygous means two identical alleles",
          memoTextAf: "1.2.1 B - Genotipe is die genetiese samestelling\n1.2.2 A - Fenotipe is fisiese uitdrukking\n1.2.3 C - Alleel is verskillende vorme van dieselfde geen\n1.2.4 D - Homosigoties beteken twee identiese allele",
          markingSteps: [
            { step: "1.2.1: B", marks: 2 },
            { step: "1.2.2: A", marks: 2 },
            { step: "1.2.3: C", marks: 2 },
            { step: "1.2.4: D", marks: 2 }
          ],
          commonErrors: ["Confusing genotype and phenotype", "Confusing homozygous with heterozygous"],
          topic: "Genetics - Basic Terminology",
          difficulty: "easy"
        }
      ]
    },
    {
      name: "Section B: Genetics",
      nameAf: "Afdeling B: Genetika",
      instructions: "Answer ALL questions. Show genetic crosses clearly.",
      instructionsAf: "Beantwoord ALLE vrae. Toon genetiese kruisings duidelik.",
      questions: [
        {
          id: "LIFE-P1-Q2",
          questionNumber: "2",
          questionText: "In humans, brown eyes (B) is dominant over blue eyes (b). A brown-eyed man whose mother had blue eyes marries a blue-eyed woman.\n\n2.1 What is the genotype of the man? Give a reason.\n2.2 What is the genotype of the woman?\n2.3 Using a genetic cross, determine the probability of this couple having a blue-eyed child.\n2.4 If this couple has 4 children, predict how many are likely to have brown eyes.",
          questionTextAf: "In mense is bruin oë (B) dominant oor blou oë (b). 'n Bruinoog man wie se ma blou oë gehad het, trou met 'n blouoog vrou.\n\n2.1 Wat is die genotipe van die man? Gee 'n rede.\n2.2 Wat is die genotipe van die vrou?\n2.3 Deur 'n genetiese kruising te gebruik, bepaal die waarskynlikheid dat hierdie egpaar 'n blouoog kind sal hê.\n2.4 As hierdie egpaar 4 kinders het, voorspel hoeveel waarskynlik bruin oë sal hê.",
          marks: 14,
          cognitiveLevel: "application",
          commandVerbs: ["determine", "predict"],
          memoText: "2.1: Bb (heterozygous)\nReason: He has brown eyes (must have at least one B), but his mother had blue eyes (bb), so he inherited one b allele from her.\n\n2.2: bb (homozygous recessive)\nBlue eyes only possible with two recessive alleles.\n\n2.3: \nParents: Bb × bb\nGametes: B, b × b, b\n\nPunnett Square:\n       b      b\nB     Bb     Bb\nb     bb     bb\n\nOffspring: 50% Bb (brown), 50% bb (blue)\nProbability of blue-eyed child = 50% or 1/2 or 0.5\n\n2.4: Expected: 2 brown-eyed and 2 blue-eyed children\n(50% of 4 = 2)",
          memoTextAf: "2.1: Bb (heterosigoties)\nRede: Hy het bruin oë (moet ten minste een B hê), maar sy ma het blou oë gehad (bb), so hy het een b-alleel van haar geërf.\n\n2.2: bb (homosigoties resessief)\nBlou oë slegs moontlik met twee resessiewe allele.\n\n2.3:\nOuers: Bb × bb\nGamete: B, b × b, b\n\nPunnett-vierkant:\n       b      b\nB     Bb     Bb\nb     bb     bb\n\nNageslag: 50% Bb (bruin), 50% bb (blou)\nWaarskynlikheid van blouoog kind = 50% of 1/2 of 0.5\n\n2.4: Verwag: 2 bruinoog en 2 blouoog kinders\n(50% van 4 = 2)",
          markingSteps: [
            { step: "2.1: Correct genotype Bb", marks: 2 },
            { step: "2.1: Valid reasoning about mother", marks: 2 },
            { step: "2.2: Correct genotype bb with reason", marks: 2 },
            { step: "2.3: Correct Punnett square", marks: 4 },
            { step: "2.3: Correct probability", marks: 2 },
            { step: "2.4: Correct prediction (2)", marks: 2 }
          ],
          commonErrors: ["Not explaining why man is heterozygous", "Punnett square errors"],
          topic: "Genetics - Monohybrid Crosses",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// ENGLISH HOME LANGUAGE PAPER 1 - Comprehension & Language
export const ENGLISH_HL_PAPER_1: SimulatedPaper = {
  subjectCode: "ENG_HL",
  subjectName: "English Home Language",
  subjectNameAf: "Engels Huistaal",
  paperNumber: 1,
  totalMarks: 70,
  duration: "2 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/English%20HL%20P1%20Nov%202023.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/English%20HL%20P1%20Nov%202023%20Memo.pdf"
  },
    sections: [
    {
      name: "Section A: Comprehension",
      nameAf: "Afdeling A: Begripstoets",
      instructions: "Read the passage carefully and answer all questions.",
      instructionsAf: "Lees die teks noukeurig en beantwoord alle vrae.",
      questions: [
        {
          id: "ENG-HL-P1-Q1.1",
          questionNumber: "1.1",
          questionText: "Refer to paragraph 1. Explain how the author creates a sense of urgency in the opening lines. Quote from the text to support your answer.",
          questionTextAf: "Verwys na paragraaf 1. Verduidelik hoe die outeur 'n gevoel van dringendheid in die openingsreëls skep. Haal aan uit die teks om jou antwoord te ondersteun.",
          marks: 3,
          cognitiveLevel: "higher_order",
          commandVerbs: ["explain", "quote"],
          memoText: "The author uses short, punchy sentences ✓ creating a staccato rhythm that conveys panic ✓ Quote must be relevant showing urgency ✓",
          memoTextAf: "Die outeur gebruik kort, kragtige sinne ✓ wat 'n stakkato ritme skep wat paniek oordra ✓ Aanhaling moet relevant wees wat dringendheid toon ✓",
          markingSteps: [
            { step: "Identification of technique (short sentences/punctuation)", marks: 1 },
            { step: "Explanation of effect on reader", marks: 1 },
            { step: "Relevant quotation from text", marks: 1 }
          ],
          commonErrors: ["Quoting without explaining", "Vague analysis without specific techniques"],
          topic: "Comprehension - Literary Analysis",
          difficulty: "medium"
        },
        {
          id: "ENG-HL-P1-Q1.2",
          questionNumber: "1.2",
          questionText: "Identify the figure of speech in the phrase 'time crawled like a wounded animal' and explain its effectiveness.",
          questionTextAf: "Identifiseer die stylfiguur in die frase 'tyd het gekruip soos 'n gewonde dier' en verduidelik die doeltreffendheid daarvan.",
          marks: 3,
          cognitiveLevel: "application",
          commandVerbs: ["identify", "explain"],
          memoText: "Simile ✓ Comparing time to a wounded animal suggests slow, painful progression ✓ Creates empathy/tension for the character's waiting ✓",
          memoTextAf: "Vergelyking ✓ Vergelyk tyd met 'n gewonde dier wat stadige, pynlike vordering voorstel ✓ Skep empatie/spanning vir die karakter se wagting ✓",
          markingSteps: [
            { step: "Correct identification: Simile", marks: 1 },
            { step: "Explain comparison meaning", marks: 1 },
            { step: "Explain effect on reader/mood", marks: 1 }
          ],
          commonErrors: ["Confusing simile with metaphor", "Not explaining the effect"],
          topic: "Comprehension - Figures of Speech",
          difficulty: "easy"
        }
      ]
    },
    {
      name: "Section B: Summary",
      nameAf: "Afdeling B: Opsomming",
      instructions: "Summarise the main points in 90 words. Write in point form.",
      instructionsAf: "Som die hoofpunte op in 90 woorde. Skryf in puntvorm.",
      questions: [
        {
          id: "ENG-HL-P1-Q2",
          questionNumber: "2",
          questionText: "Summarise the seven key steps for effective time management mentioned in the passage. Your summary must be in point form and not exceed 90 words.",
          questionTextAf: "Som die sewe sleutelstappe vir doeltreffende tydbestuur op wat in die teks genoem word. Jou opsomming moet in puntvorm wees en nie 90 woorde oorskry nie.",
          marks: 10,
          cognitiveLevel: "application",
          commandVerbs: ["summarise"],
          memoText: "Award 1 mark per valid point (max 7 points). Deduct 1 mark for exceeding word limit. Points must be: prioritization, goal-setting, avoiding procrastination, delegation, scheduling, taking breaks, reviewing progress.",
          memoTextAf: "Ken 1 punt per geldige punt toe (maks 7 punte). Trek 1 punt af as woordlimiet oorskry word. Punte moet wees: prioritisering, doelwitstelling, uitstel vermy, delegering, skedulering, pouses neem, vordering hersien.",
          markingSteps: [
            { step: "Point 1: Prioritization", marks: 1 },
            { step: "Point 2: Goal-setting", marks: 1 },
            { step: "Point 3: Avoiding procrastination", marks: 1 },
            { step: "Point 4: Delegation", marks: 1 },
            { step: "Point 5: Scheduling", marks: 1 },
            { step: "Point 6: Taking breaks", marks: 1 },
            { step: "Point 7: Reviewing progress", marks: 1 },
            { step: "Language and format (3 marks)", marks: 3 }
          ],
          commonErrors: ["Exceeding word limit", "Not using point form", "Copying verbatim from text"],
          topic: "Summary Writing",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// ENGLISH HOME LANGUAGE PAPER 2 - Literature
export const ENGLISH_HL_PAPER_2: SimulatedPaper = {
  subjectCode: "ENG_HL",
  subjectName: "English Home Language",
  subjectNameAf: "Engels Huistaal",
  paperNumber: 2,
  totalMarks: 80,
  duration: "2.5 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/English%20HL%20P2%20Nov%202023.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/English%20HL%20P2%20Nov%202023%20Memo.pdf"
  },
    sections: [
    {
      name: "Section A: Poetry",
      nameAf: "Afdeling A: Poësie",
      instructions: "Answer on TWO poems. Contextual questions are compulsory.",
      instructionsAf: "Beantwoord oor TWEE gedigte. Kontekstuele vrae is verpligtend.",
      questions: [
        {
          id: "ENG-HL-P2-Q1",
          questionNumber: "1",
          questionText: "Refer to the poem 'Still I Rise' by Maya Angelou.\n\n1.1 What is the speaker's attitude towards her oppressors? Support your answer with evidence. (3)\n1.2 Explain the significance of the repeated phrase 'I rise'. (2)\n1.3 Discuss how the poet uses imagery to convey the theme of resilience. (5)",
          questionTextAf: "Verwys na die gedig 'Still I Rise' deur Maya Angelou.\n\n1.1 Wat is die spreker se houding teenoor haar onderdrukkers? Ondersteun jou antwoord met bewyse. (3)\n1.2 Verduidelik die betekenis van die herhaalde frase 'I rise'. (2)\n1.3 Bespreek hoe die digter beeldspraak gebruik om die tema van veerkragtigheid oor te dra. (5)",
          marks: 10,
          cognitiveLevel: "higher_order",
          commandVerbs: ["refer", "explain", "discuss"],
          memoText: "1.1 Defiant/confident attitude ✓ Evidence of mocking oppressors ✓ Relevant quote ✓\n1.2 Repetition emphasises determination ✓ Creates powerful refrain of triumph ✓\n1.3 Imagery analysis (5): natural imagery (dust, sun, moon) ✓ connection to rising ✓ link to theme ✓ example ✓ effect on reader ✓",
          memoTextAf: "1.1 Uitdagende/selfversekerde houding ✓ Bewys van spot met onderdrukkers ✓ Relevante aanhaling ✓\n1.2 Herhaling beklemtoon vasberadenheid ✓ Skep kragtige refrein van triomf ✓\n1.3 Beeldspraak analise (5): natuurlike beelde (stof, son, maan) ✓ verbinding met opstaan ✓ skakel met tema ✓ voorbeeld ✓ effek op leser ✓",
          markingSteps: [
            { step: "1.1 Attitude identified correctly", marks: 1 },
            { step: "1.1 Evidence from text", marks: 1 },
            { step: "1.1 Relevant quotation", marks: 1 },
            { step: "1.2 Significance of repetition", marks: 1 },
            { step: "1.2 Link to triumph/determination", marks: 1 },
            { step: "1.3 Imagery identification", marks: 2 },
            { step: "1.3 Theme connection", marks: 2 },
            { step: "1.3 Effect analysis", marks: 1 }
          ],
          commonErrors: ["Surface-level analysis", "Not linking devices to meaning", "Insufficient textual evidence"],
          topic: "Poetry Analysis",
          difficulty: "hard"
        }
      ]
    }
  ]
};

// ENGLISH HOME LANGUAGE PAPER 3 - Creative Writing
export const ENGLISH_HL_PAPER_3: SimulatedPaper = {
  subjectCode: "ENG_HL",
  subjectName: "English Home Language",
  subjectNameAf: "Engels Huistaal",
  paperNumber: 3,
  totalMarks: 100,
  duration: "2.5 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/English%20HL%20P3%20Nov%202023.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/English%20HL%20P3%20Nov%202023%20Memo.pdf"
  },
    sections: [
    {
      name: "Section A: Essays",
      nameAf: "Afdeling A: Opstelle",
      instructions: "Write an essay of 400-450 words on ONE of the following topics.",
      instructionsAf: "Skryf 'n opstel van 400-450 woorde oor EEN van die volgende onderwerpe.",
      questions: [
        {
          id: "ENG-HL-P3-Q1",
          questionNumber: "1",
          questionText: "Write a narrative essay with the title: 'The day I discovered my true strength'",
          questionTextAf: "Skryf 'n verhalende opstel met die titel: 'Die dag toe ek my ware krag ontdek het'",
          marks: 50,
          cognitiveLevel: "higher_order",
          commandVerbs: ["write"],
          memoText: "Content (30): Original ideas ✓ Clear narrative arc ✓ Character development ✓ Theme exploration ✓\nLanguage (15): Grammar ✓ Vocabulary ✓ Sentence variety ✓\nStructure (5): Introduction ✓ Body paragraphs ✓ Conclusion ✓",
          memoTextAf: "Inhoud (30): Oorspronklike idees ✓ Duidelike narratiewe boog ✓ Karakterontwikkeling ✓ Tema-verkenning ✓\nTaal (15): Grammatika ✓ Woordeskat ✓ Sinsverskeidenheid ✓\nStruktuur (5): Inleiding ✓ Liggaamsparagrawe ✓ Slot ✓",
          markingSteps: [
            { step: "Content: Originality and creativity", marks: 10 },
            { step: "Content: Narrative development", marks: 10 },
            { step: "Content: Theme and message", marks: 10 },
            { step: "Language: Grammar and spelling", marks: 8 },
            { step: "Language: Vocabulary and expression", marks: 7 },
            { step: "Structure: Organization", marks: 5 }
          ],
          commonErrors: ["Weak introduction", "Underdeveloped conflict", "Rushed ending", "Grammatical errors"],
          topic: "Creative Writing - Narrative Essay",
          difficulty: "hard"
        }
      ]
    }
  ]
};

// AFRIKAANS HOME LANGUAGE PAPER 1
export const AFRIKAANS_HL_PAPER_1: SimulatedPaper = {
  subjectCode: "AFR_HL",
  subjectName: "Afrikaans Home Language",
  subjectNameAf: "Afrikaans Huistaal",
  paperNumber: 1,
  totalMarks: 80,
  duration: "2 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Afrikaans%20HT%20V1%20Nov%202023.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Afrikaans%20HT%20V1%20Nov%202023%20Memo.pdf"
  },
    sections: [
    {
      name: "Afdeling A: Begripstoets",
      nameAf: "Afdeling A: Begripstoets",
      instructions: "Beantwoord alle vrae. Gee volsinne waar nodig.",
      instructionsAf: "Beantwoord alle vrae. Gee volsinne waar nodig.",
      questions: [
        {
          id: "AFR-HL-P1-Q1.1",
          questionNumber: "1.1",
          questionText: "Verwys na paragraaf 1. Watter indruk kry jy van die hoofkarakter se gemoedstemming? Haal aan ter stawing.",
          questionTextAf: "Verwys na paragraaf 1. Watter indruk kry jy van die hoofkarakter se gemoedstemming? Haal aan ter stawing.",
          marks: 3,
          cognitiveLevel: "application",
          commandVerbs: ["verwys", "haal aan"],
          memoText: "Gemoedstemming: angstig/bekommerd/onseker ✓ Verduideliking van hoe dit blyk ✓ Relevante aanhaling ✓",
          memoTextAf: "Gemoedstemming: angstig/bekommerd/onseker ✓ Verduideliking van hoe dit blyk ✓ Relevante aanhaling ✓",
          markingSteps: [
            { step: "Identifisering van gemoedstemming", marks: 1 },
            { step: "Verduideliking", marks: 1 },
            { step: "Toepaslike aanhaling", marks: 1 }
          ],
          commonErrors: ["Oppervlakkige antwoord", "Geen aanhaling", "Verkeerde interpretasie"],
          topic: "Begrip - Karakteranalise",
          difficulty: "medium"
        }
      ]
    },
    {
      name: "Afdeling B: Opsomming",
      nameAf: "Afdeling B: Opsomming",
      instructions: "Som die teks op in hoogstens 70 woorde.",
      instructionsAf: "Som die teks op in hoogstens 70 woorde.",
      questions: [
        {
          id: "AFR-HL-P1-Q2",
          questionNumber: "2",
          questionText: "Som die vyf hoofargumente in die teks op rakende die invloed van sosiale media op jongmense.",
          questionTextAf: "Som die vyf hoofargumente in die teks op rakende die invloed van sosiale media op jongmense.",
          marks: 10,
          cognitiveLevel: "application",
          commandVerbs: ["som op"],
          memoText: "1 punt per geldige argument (maks 5). Taalgebruik (2). Formaat (3). Trek af vir woordoorskryding.",
          memoTextAf: "1 punt per geldige argument (maks 5). Taalgebruik (2). Formaat (3). Trek af vir woordoorskryding.",
          markingSteps: [
            { step: "Argument 1", marks: 1 },
            { step: "Argument 2", marks: 1 },
            { step: "Argument 3", marks: 1 },
            { step: "Argument 4", marks: 1 },
            { step: "Argument 5", marks: 1 },
            { step: "Taalgebruik", marks: 2 },
            { step: "Formaat en lengte", marks: 3 }
          ],
          commonErrors: ["Woordlimiet oorskry", "Nie puntvorm nie", "Kopieer direk uit teks"],
          topic: "Opsomming",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// BUSINESS STUDIES PAPER 1
export const BUSINESS_STUDIES_PAPER_1: SimulatedPaper = {
  subjectCode: "BUS",
  subjectName: "Business Studies",
  subjectNameAf: "Besigheidstudies",
  paperNumber: 1,
  totalMarks: 150,
  duration: "2 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Business%20Studies%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Business%20Studies%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Short Questions",
      nameAf: "Afdeling A: Kort Vrae",
      instructions: "Answer ALL questions. Write the answer next to the question number.",
      instructionsAf: "Beantwoord ALLE vrae. Skryf die antwoord langs die vraagnommer.",
      questions: [
        {
          id: "BUS-P1-Q1.1",
          questionNumber: "1.1",
          questionText: "Various options are given as possible answers. Choose the correct answer and write only the letter (A-D) next to the question number.\n\n1.1.1 The function of management that involves setting goals and determining actions is:\nA. Organising\nB. Planning\nC. Leading\nD. Controlling\n\n1.1.2 A partnership agreement that limits liability is called:\nA. General partnership\nB. Limited partnership\nC. Close corporation\nD. Sole trader",
          questionTextAf: "Verskeie opsies word as moontlike antwoorde gegee. Kies die korrekte antwoord en skryf slegs die letter (A-D) langs die vraagnommer.\n\n1.1.1 Die bestuursfunksie wat doelwitte stel en aksies bepaal is:\nA. Organisering\nB. Beplanning\nC. Leiding\nD. Beheer\n\n1.1.2 'n Vennootskapsooreenkoms wat aanspreeklikheid beperk word genoem:\nA. Algemene vennootskap\nB. Beperkte vennootskap\nC. Beslote korporasie\nD. Alleeneienaar",
          marks: 10,
          cognitiveLevel: "knowledge",
          commandVerbs: ["choose"],
          memoText: "1.1.1 B (Planning) ✓\n1.1.2 B (Limited partnership) ✓",
          memoTextAf: "1.1.1 B (Beplanning) ✓\n1.1.2 B (Beperkte vennootskap) ✓",
          markingSteps: [
            { step: "1.1.1 Correct answer: B", marks: 2 },
            { step: "1.1.2 Correct answer: B", marks: 2 }
          ],
          commonErrors: ["Confusing planning with organising", "Not knowing partnership types"],
          topic: "Business Operations - Management Functions",
          difficulty: "easy"
        }
      ]
    },
    {
      name: "Section B: Business Environments",
      nameAf: "Afdeling B: Besigheidsomgewings",
      instructions: "Answer any THREE questions from this section.",
      instructionsAf: "Beantwoord enige DRIE vrae uit hierdie afdeling.",
      questions: [
        {
          id: "BUS-P1-Q2",
          questionNumber: "2",
          questionText: "2.1 Explain the impact of the macro environment on business operations. (8)\n2.2 Discuss THREE challenges faced by South African businesses in the global market. (6)\n2.3 Recommend strategies that businesses can use to adapt to technological changes. (6)",
          questionTextAf: "2.1 Verduidelik die impak van die makro-omgewing op besigheidsbedrywighede. (8)\n2.2 Bespreek DRIE uitdagings wat Suid-Afrikaanse besighede in die globale mark in die gesig staar. (6)\n2.3 Beveel strategieë aan wat besighede kan gebruik om by tegnologiese veranderinge aan te pas. (6)",
          marks: 20,
          cognitiveLevel: "application",
          commandVerbs: ["explain", "discuss", "recommend"],
          memoText: "2.1 PESTLE factors (2 marks each, max 8): Political stability ✓ Economic conditions ✓ Social trends ✓ Technological advancement ✓\n2.2 Challenges (2 marks each): Currency fluctuations ✓ Trade barriers ✓ Competition ✓ Infrastructure ✓\n2.3 Strategies (2 marks each): Investment in R&D ✓ Staff training ✓ Digital transformation ✓",
          memoTextAf: "2.1 PESTLE faktore (2 punte elk, maks 8): Politieke stabiliteit ✓ Ekonomiese toestande ✓ Sosiale tendense ✓ Tegnologiese vooruitgang ✓\n2.2 Uitdagings (2 punte elk): Geldskommeling ✓ Handelsversperrings ✓ Mededinging ✓ Infrastruktuur ✓\n2.3 Strategieë (2 punte elk): Belegging in N&O ✓ Personeelopleiding ✓ Digitale transformasie ✓",
          markingSteps: [
            { step: "2.1 Macro environment factors explained", marks: 8 },
            { step: "2.2 Three challenges discussed", marks: 6 },
            { step: "2.3 Strategies recommended", marks: 6 }
          ],
          commonErrors: ["Confusing macro and micro environments", "Vague explanations", "Not providing South African context"],
          topic: "Business Environments",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// ECONOMICS PAPER 1
export const ECONOMICS_PAPER_1: SimulatedPaper = {
  subjectCode: "ECO",
  subjectName: "Economics",
  subjectNameAf: "Ekonomie",
  paperNumber: 1,
  totalMarks: 150,
  duration: "2 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Economics%20P1%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Economics%20P1%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Multiple Choice and Short Questions",
      nameAf: "Afdeling A: Meervoudige Keuse en Kort Vrae",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "ECO-P1-Q1.1",
          questionNumber: "1.1",
          questionText: "Choose the correct answer:\n\n1.1.1 The study of the economy as a whole is called:\nA. Microeconomics\nB. Macroeconomics\nC. Normative economics\nD. Positive economics\n\n1.1.2 GDP stands for:\nA. Gross Domestic Production\nB. Gross Domestic Product\nC. General Domestic Product\nD. Government Development Plan",
          questionTextAf: "Kies die korrekte antwoord:\n\n1.1.1 Die studie van die ekonomie as 'n geheel word genoem:\nA. Mikro-ekonomie\nB. Makro-ekonomie\nC. Normatiewe ekonomie\nD. Positiewe ekonomie\n\n1.1.2 BBP staan vir:\nA. Bruto Binnelandse Produksie\nB. Bruto Binnelandse Produk\nC. Algemene Binnelandse Produk\nD. Regering Ontwikkelingsplan",
          marks: 8,
          cognitiveLevel: "knowledge",
          commandVerbs: ["choose"],
          memoText: "1.1.1 B (Macroeconomics) ✓\n1.1.2 B (Gross Domestic Product) ✓",
          memoTextAf: "1.1.1 B (Makro-ekonomie) ✓\n1.1.2 B (Bruto Binnelandse Produk) ✓",
          markingSteps: [
            { step: "1.1.1 Correct: B", marks: 2 },
            { step: "1.1.2 Correct: B", marks: 2 }
          ],
          commonErrors: ["Confusing micro and macro economics"],
          topic: "Economic Concepts",
          difficulty: "easy"
        }
      ]
    },
    {
      name: "Section B: Macroeconomics",
      nameAf: "Afdeling B: Makro-ekonomie",
      instructions: "Answer any TWO questions.",
      instructionsAf: "Beantwoord enige TWEE vrae.",
      questions: [
        {
          id: "ECO-P1-Q2",
          questionNumber: "2",
          questionText: "2.1 Define the following terms:\n   (a) Inflation (2)\n   (b) Unemployment rate (2)\n\n2.2 Explain the relationship between inflation and interest rates. (6)\n\n2.3 Discuss the causes of structural unemployment in South Africa. (8)\n\n2.4 Evaluate the effectiveness of monetary policy in controlling inflation. (8)",
          questionTextAf: "2.1 Definieer die volgende terme:\n   (a) Inflasie (2)\n   (b) Werkloosheidskoers (2)\n\n2.2 Verduidelik die verhouding tussen inflasie en rentekoerse. (6)\n\n2.3 Bespreek die oorsake van strukturele werkloosheid in Suid-Afrika. (8)\n\n2.4 Evalueer die doeltreffendheid van monetêre beleid in die beheer van inflasie. (8)",
          marks: 26,
          cognitiveLevel: "higher_order",
          commandVerbs: ["define", "explain", "discuss", "evaluate"],
          memoText: "2.1(a) Inflation: sustained increase in general price level ✓✓\n2.1(b) Unemployment rate: percentage of labour force without work ✓✓\n2.2 Higher inflation → higher interest rates (SARB response) ✓ Relationship explained ✓✓\n2.3 Causes: skills mismatch ✓✓ declining industries ✓✓ technological change ✓✓ education gaps ✓✓\n2.4 Evaluation: Effectiveness of repo rate changes ✓✓ Limitations ✓✓ Time lags ✓✓ Conclusion ✓✓",
          memoTextAf: "2.1(a) Inflasie: volgehoue toename in algemene prysvlak ✓✓\n2.1(b) Werkloosheidskoers: persentasie van arbeidsmag sonder werk ✓✓\n2.2 Hoër inflasie → hoër rentekoerse (SARB reaksie) ✓ Verhouding verduidelik ✓✓\n2.3 Oorsake: vaardigheidswanpassing ✓✓ dalende industrieë ✓✓ tegnologiese verandering ✓✓ onderwys gapings ✓✓\n2.4 Evaluering: Doeltreffendheid van repokoers veranderinge ✓✓ Beperkings ✓✓ Tydvertragings ✓✓ Gevolgtrekking ✓✓",
          markingSteps: [
            { step: "2.1 Definitions correct", marks: 4 },
            { step: "2.2 Relationship explained", marks: 6 },
            { step: "2.3 Causes discussed", marks: 8 },
            { step: "2.4 Evaluation with conclusion", marks: 8 }
          ],
          commonErrors: ["Incomplete definitions", "Not linking to South African context", "No evaluation in 2.4"],
          topic: "Macroeconomics - Inflation and Unemployment",
          difficulty: "hard"
        }
      ]
    }
  ]
};

// ECONOMICS PAPER 2
export const ECONOMICS_PAPER_2: SimulatedPaper = {
  subjectCode: "ECO",
  subjectName: "Economics",
  subjectNameAf: "Ekonomie",
  paperNumber: 2,
  totalMarks: 150,
  duration: "2 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Economics%20P2%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Economics%20P2%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Microeconomics",
      nameAf: "Afdeling A: Mikro-ekonomie",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "ECO-P2-Q1",
          questionNumber: "1",
          questionText: "1.1 Use the diagram below to answer questions on market equilibrium.\n[Diagram shows supply and demand curves]\n\n(a) Identify the equilibrium price and quantity. (2)\n(b) What happens when price is set above equilibrium? Explain. (4)\n(c) Illustrate the effect of a decrease in supply on the diagram. (4)",
          questionTextAf: "1.1 Gebruik die diagram hieronder om vrae oor markewewig te beantwoord.\n[Diagram toon vraag en aanbod kurwes]\n\n(a) Identifiseer die ewwigsprys en hoeveelheid. (2)\n(b) Wat gebeur as die prys bo ewewig gestel word? Verduidelik. (4)\n(c) Illustreer die effek van 'n afname in aanbod op die diagram. (4)",
          marks: 10,
          cognitiveLevel: "application",
          commandVerbs: ["identify", "explain", "illustrate"],
          memoText: "(a) Equilibrium at intersection point ✓✓\n(b) Price above equilibrium creates surplus ✓ Quantity supplied > demanded ✓ Explanation of adjustment ✓✓\n(c) Supply curve shifts left ✓ New equilibrium shown ✓ Higher price, lower quantity ✓✓",
          memoTextAf: "(a) Ewewig by snypunt ✓✓\n(b) Prys bo ewewig skep oorskot ✓ Hoeveelheid aangebied > gevra ✓ Verduideliking van aanpassing ✓✓\n(c) Aanbodkromme skuif links ✓ Nuwe ewewig getoon ✓ Hoër prys, laer hoeveelheid ✓✓",
          markingSteps: [
            { step: "(a) Equilibrium identified", marks: 2 },
            { step: "(b) Surplus explained", marks: 4 },
            { step: "(c) Supply shift illustrated", marks: 4 }
          ],
          commonErrors: ["Not labelling diagram correctly", "Confusing surplus and shortage"],
          topic: "Market Equilibrium",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// GEOGRAPHY PAPER 1 - Physical Geography
export const GEOGRAPHY_PAPER_1: SimulatedPaper = {
  subjectCode: "GEO",
  subjectName: "Geography",
  subjectNameAf: "Geografie",
  paperNumber: 1,
  totalMarks: 150,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Geography%20P1%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Geography%20P1%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Climate and Weather",
      nameAf: "Afdeling A: Klimaat en Weer",
      instructions: "Study the synoptic weather map and answer all questions.",
      instructionsAf: "Bestudeer die sinoptiese weerkaart en beantwoord alle vrae.",
      questions: [
        {
          id: "GEO-P1-Q1",
          questionNumber: "1",
          questionText: "1.1 Study the synoptic weather map for Southern Africa.\n\n(a) Identify the pressure system labelled H. (1)\n(b) Describe the weather conditions associated with this system. (4)\n(c) Explain why the coastal areas of the Western Cape experience winter rainfall. (6)\n(d) Predict the weather for Johannesburg for the next 24 hours, using evidence from the map. (4)",
          questionTextAf: "1.1 Bestudeer die sinoptiese weerkaart vir Suider-Afrika.\n\n(a) Identifiseer die drukstelsel gemerk H. (1)\n(b) Beskryf die weerstoestande wat met hierdie stelsel geassosieer word. (4)\n(c) Verduidelik waarom die kusgebiede van die Wes-Kaap winterreënval ervaar. (6)\n(d) Voorspel die weer vir Johannesburg vir die volgende 24 uur, met behulp van bewyse uit die kaart. (4)",
          marks: 15,
          cognitiveLevel: "application",
          commandVerbs: ["identify", "describe", "explain", "predict"],
          memoText: "(a) High pressure system/anticyclone ✓\n(b) Clear skies ✓ calm winds ✓ dry conditions ✓ stable atmosphere ✓\n(c) Cold fronts from Atlantic ✓ Mediterranean climate ✓ Position of high pressure in summer ✓ Movement of westerlies ✓ Orographic effect ✓✓\n(d) Based on cold front position ✓ Weather prediction with reasoning ✓✓✓",
          memoTextAf: "(a) Hoëdrukstelsel/antisikloon ✓\n(b) Helder lug ✓ kalm wind ✓ droë toestande ✓ stabiele atmosfeer ✓\n(c) Kouefronts van Atlantiese ✓ Mediterreense klimaat ✓ Posisie van hoë druk in somer ✓ Beweging van westewind ✓ Orografiese effek ✓✓\n(d) Gebaseer op kouefront posisie ✓ Weervoorspelling met redenasie ✓✓✓",
          markingSteps: [
            { step: "(a) High pressure identified", marks: 1 },
            { step: "(b) Weather conditions described", marks: 4 },
            { step: "(c) Winter rainfall explained", marks: 6 },
            { step: "(d) Weather prediction with evidence", marks: 4 }
          ],
          commonErrors: ["Confusing high and low pressure", "Not using map evidence", "Incomplete explanation of frontal systems"],
          topic: "Climate and Weather - Synoptic Weather Maps",
          difficulty: "medium"
        }
      ]
    },
    {
      name: "Section B: Geomorphology",
      nameAf: "Afdeling B: Geomorfologie",
      instructions: "Answer any TWO questions.",
      instructionsAf: "Beantwoord enige TWEE vrae.",
      questions: [
        {
          id: "GEO-P1-Q2",
          questionNumber: "2",
          questionText: "2.1 Define the term 'weathering'. (2)\n2.2 Distinguish between mechanical and chemical weathering. Use examples. (6)\n2.3 Explain how climate influences the rate of weathering. (8)\n2.4 Discuss the economic importance of weathering for agriculture in South Africa. (4)",
          questionTextAf: "2.1 Definieer die term 'verwering'. (2)\n2.2 Onderskei tussen meganiese en chemiese verwering. Gebruik voorbeelde. (6)\n2.3 Verduidelik hoe klimaat die tempo van verwering beïnvloed. (8)\n2.4 Bespreek die ekonomiese belangrikheid van verwering vir landbou in Suid-Afrika. (4)",
          marks: 20,
          cognitiveLevel: "higher_order",
          commandVerbs: ["define", "distinguish", "explain", "discuss"],
          memoText: "2.1 Breaking down of rocks in situ ✓ by physical/chemical processes ✓\n2.2 Mechanical: physical breakdown ✓ Examples: frost action, exfoliation ✓✓ Chemical: change in composition ✓ Examples: oxidation, hydrolysis ✓✓\n2.3 Temperature (freeze-thaw) ✓✓ Rainfall (chemical weathering) ✓✓ Humidity ✓✓ Vegetation cover ✓✓\n2.4 Soil formation ✓ Nutrient release ✓ Agricultural productivity ✓ Examples from SA ✓",
          memoTextAf: "2.1 Afbreking van rotse in situ ✓ deur fisiese/chemiese prosesse ✓\n2.2 Meganies: fisiese afbreking ✓ Voorbeelde: vorsaksie, afskilfering ✓✓ Chemies: verandering in samestelling ✓ Voorbeelde: oksidasie, hidrolise ✓✓\n2.3 Temperatuur (vries-dooi) ✓✓ Reënval (chemiese verwering) ✓✓ Humiditeit ✓✓ Plantbedekking ✓✓\n2.4 Grondvorming ✓ Voedingstofvrystelling ✓ Landbouproduktiwiteit ✓ Voorbeelde uit SA ✓",
          markingSteps: [
            { step: "2.1 Definition complete", marks: 2 },
            { step: "2.2 Both types with examples", marks: 6 },
            { step: "2.3 Climate factors explained", marks: 8 },
            { step: "2.4 Agricultural importance", marks: 4 }
          ],
          commonErrors: ["Confusing weathering with erosion", "No examples given", "Not linking to South Africa"],
          topic: "Geomorphology - Weathering",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// GEOGRAPHY PAPER 2 - Human Geography
export const GEOGRAPHY_PAPER_2: SimulatedPaper = {
  subjectCode: "GEO",
  subjectName: "Geography",
  subjectNameAf: "Geografie",
  paperNumber: 2,
  totalMarks: 75,
  duration: "1.5 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Geography%20P2%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Geography%20P2%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Map Work",
      nameAf: "Afdeling A: Kaartwerk",
      instructions: "Study the topographical map and orthophoto provided.",
      instructionsAf: "Bestudeer die topografiese kaart en ortofoto wat verskaf word.",
      questions: [
        {
          id: "GEO-P2-Q1",
          questionNumber: "1",
          questionText: "1.1 Calculate the distance in kilometres from point A to point B using the scale. (2)\n1.2 Determine the magnetic bearing from the school to the church. (3)\n1.3 Draw a cross-section from X to Y and describe the relief. (5)\n1.4 Identify the settlement pattern visible on the orthophoto and give reasons for this pattern. (5)",
          questionTextAf: "1.1 Bereken die afstand in kilometer van punt A na punt B met behulp van die skaal. (2)\n1.2 Bepaal die magnetiese peiling van die skool na die kerk. (3)\n1.3 Teken 'n deursnit van X na Y en beskryf die reliëf. (5)\n1.4 Identifiseer die nedersettingspatroon sigbaar op die ortofoto en gee redes vir hierdie patroon. (5)",
          marks: 15,
          cognitiveLevel: "application",
          commandVerbs: ["calculate", "determine", "draw", "identify"],
          memoText: "1.1 Correct measurement ✓ Correct conversion using scale ✓\n1.2 True bearing calculated ✓ Magnetic declination applied ✓ Correct answer ✓\n1.3 Cross-section accurately drawn ✓✓ Relief described (valley, slope, plateau) ✓✓✓\n1.4 Pattern identified (linear/nucleated/dispersed) ✓✓ Reasons related to geography ✓✓✓",
          memoTextAf: "1.1 Korrekte meting ✓ Korrekte omskakeling met skaal ✓\n1.2 Ware peiling bereken ✓ Magnetiese deklinasie toegepas ✓ Korrekte antwoord ✓\n1.3 Deursnit akkuraat geteken ✓✓ Reliëf beskryf (vallei, helling, plato) ✓✓✓\n1.4 Patroon geïdentifiseer (lineêr/kernagtig/verspreide) ✓✓ Redes verwant aan geografie ✓✓✓",
          markingSteps: [
            { step: "1.1 Distance calculation", marks: 2 },
            { step: "1.2 Bearing with declination", marks: 3 },
            { step: "1.3 Cross-section and description", marks: 5 },
            { step: "1.4 Settlement pattern analysis", marks: 5 }
          ],
          commonErrors: ["Not applying magnetic declination", "Inaccurate cross-section", "Not giving reasons for patterns"],
          topic: "Map Work - Calculations and Interpretation",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// HISTORY PAPER 1 - Source-Based Questions
export const HISTORY_PAPER_1: SimulatedPaper = {
  subjectCode: "HIS",
  subjectName: "History",
  subjectNameAf: "Geskiedenis",
  paperNumber: 1,
  totalMarks: 150,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/History%20P1%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/History%20P1%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Source-Based Questions",
      nameAf: "Afdeling A: Brongebaseerde Vrae",
      instructions: "Read the sources carefully and answer ALL questions.",
      instructionsAf: "Lees die bronne noukeurig en beantwoord ALLE vrae.",
      questions: [
        {
          id: "HIS-P1-Q1",
          questionNumber: "1",
          questionText: "Topic: The Cold War\n\nSource 1A: Extract from a speech by Winston Churchill, March 1946 (Iron Curtain Speech)\n\n'From Stettin in the Baltic to Trieste in the Adriatic, an iron curtain has descended across the Continent.'\n\n1.1.1 Explain the term 'iron curtain' as used in Source 1A. (2)\n1.1.2 Why did Churchill make this speech in 1946? (2)\n1.1.3 Using Source 1A and your own knowledge, explain how this speech contributed to Cold War tensions. (4)\n1.1.4 Evaluate the reliability of Source 1A as a historical source. (4)",
          questionTextAf: "Onderwerp: Die Koue Oorlog\n\nBron 1A: Uittreksel uit 'n toespraak deur Winston Churchill, Maart 1946 (Ystergordyn Toespraak)\n\n'Van Stettin in die Baltiese see tot Triëst in die Adriatiese see het 'n ystergordyn oor die Vasteland gedaal.'\n\n1.1.1 Verduidelik die term 'ystergordyn' soos in Bron 1A gebruik. (2)\n1.1.2 Waarom het Churchill hierdie toespraak in 1946 gemaak? (2)\n1.1.3 Gebruik Bron 1A en jou eie kennis, verduidelik hoe hierdie toespraak tot Koue Oorlog-spanning bygedra het. (4)\n1.1.4 Evalueer die betroubaarheid van Bron 1A as 'n historiese bron. (4)",
          marks: 12,
          cognitiveLevel: "higher_order",
          commandVerbs: ["explain", "evaluate"],
          memoText: "1.1.1 Metaphor for division of Europe ✓ Separation between communist East and democratic West ✓\n1.1.2 Soviet expansion in Eastern Europe ✓ Growing tensions between former allies ✓\n1.1.3 Marked public acknowledgement of division ✓ Influenced Western perception of USSR ✓ Used source evidence ✓ Own knowledge added ✓\n1.1.4 Primary source ✓ From key political figure ✓ Limitations: Western bias ✓ Reliability assessment ✓",
          memoTextAf: "1.1.1 Metafoor vir verdeling van Europa ✓ Skeiding tussen kommunistiese Ooste en demokratiese Weste ✓\n1.1.2 Sowjet-uitbreiding in Oos-Europa ✓ Groeiende spanning tussen voormalige bondgenote ✓\n1.1.3 Het openbare erkenning van verdeling gemerk ✓ Westerse persepsie van USSR beïnvloed ✓ Bronbewys gebruik ✓ Eie kennis bygevoeg ✓\n1.1.4 Primêre bron ✓ Van sleutel politieke figuur ✓ Beperkings: Westerse vooroordeel ✓ Betroubaarheidsassessering ✓",
          markingSteps: [
            { step: "1.1.1 Term explained", marks: 2 },
            { step: "1.1.2 Context provided", marks: 2 },
            { step: "1.1.3 Source and own knowledge used", marks: 4 },
            { step: "1.1.4 Reliability evaluated", marks: 4 }
          ],
          commonErrors: ["Not using source evidence", "Ignoring bias assessment", "Superficial explanations"],
          topic: "Cold War - Origins",
          difficulty: "medium"
        }
      ]
    },
    {
      name: "Section B: Extended Writing",
      nameAf: "Afdeling B: Uitgebreide Skryfwerk",
      instructions: "Answer ONE question from this section.",
      instructionsAf: "Beantwoord EEN vraag uit hierdie afdeling.",
      questions: [
        {
          id: "HIS-P1-Q2",
          questionNumber: "2",
          questionText: "Write an essay of approximately 400 words:\n\nThe Berlin Wall was both a symbol and a tool of the Cold War.\n\nDiscuss the significance of the Berlin Wall in the context of Cold War tensions between 1961 and 1989.",
          questionTextAf: "Skryf 'n opstel van ongeveer 400 woorde:\n\nDie Berlynse Muur was beide 'n simbool en 'n instrument van die Koue Oorlog.\n\nBespreek die betekenis van die Berlynse Muur in die konteks van Koue Oorlog-spanning tussen 1961 en 1989.",
          marks: 30,
          cognitiveLevel: "higher_order",
          commandVerbs: ["discuss"],
          memoText: "Introduction: Clear thesis ✓✓\nBody: Reasons for construction ✓✓ Symbol of division ✓✓ Human impact ✓✓ Key events (Kennedy visit, escape attempts) ✓✓ Fall of wall ✓✓\nConclusion: Significance assessed ✓✓\nStructure and language: ✓✓✓✓",
          memoTextAf: "Inleiding: Duidelike tesis ✓✓\nHoofinhoud: Redes vir konstruksie ✓✓ Simbool van verdeling ✓✓ Menslike impak ✓✓ Sleutelgebeure (Kennedy besoek, ontsnappingspogings) ✓✓ Val van muur ✓✓\nGevolgtrekking: Betekenis geassesseer ✓✓\nStruktuur en taal: ✓✓✓✓",
          markingSteps: [
            { step: "Introduction with thesis", marks: 4 },
            { step: "Historical context", marks: 6 },
            { step: "Analysis of significance", marks: 10 },
            { step: "Evidence and examples", marks: 6 },
            { step: "Conclusion", marks: 4 }
          ],
          commonErrors: ["No clear argument", "Narrative instead of analysis", "Missing key events"],
          topic: "Cold War - Berlin Wall",
          difficulty: "hard"
        }
      ]
    }
  ]
};

// HISTORY PAPER 2 - Source-Based (Apartheid and Civil Rights)
export const HISTORY_PAPER_2: SimulatedPaper = {
  subjectCode: "HIS",
  subjectName: "History",
  subjectNameAf: "Geskiedenis",
  paperNumber: 2,
  totalMarks: 150,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/History%20P2%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/History%20P2%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Civil Rights Movement",
      nameAf: "Afdeling A: Burgerregte Beweging",
      instructions: "Answer ALL source-based questions.",
      instructionsAf: "Beantwoord ALLE brongebaseerde vrae.",
      questions: [
        {
          id: "HIS-P2-Q1",
          questionNumber: "1",
          questionText: "Topic: The US Civil Rights Movement\n\nSource 2A: Extract from Martin Luther King Jr.'s 'I Have a Dream' speech, August 1963\n\n1.1.1 What was the occasion for this speech? (2)\n1.1.2 Explain TWO methods of non-violent protest used by the Civil Rights Movement. (4)\n1.1.3 Using Source 2A and your own knowledge, assess the impact of King's leadership on the Civil Rights Movement. (6)",
          questionTextAf: "Onderwerp: Die Amerikaanse Burgerregte Beweging\n\nBron 2A: Uittreksel uit Martin Luther King Jr. se 'I Have a Dream' toespraak, Augustus 1963\n\n1.1.1 Wat was die geleentheid vir hierdie toespraak? (2)\n1.1.2 Verduidelik TWEE metodes van nie-gewelddadige protes wat deur die Burgerregte Beweging gebruik is. (4)\n1.1.3 Gebruik Bron 2A en jou eie kennis, assesseer die impak van King se leierskap op die Burgerregte Beweging. (6)",
          marks: 12,
          cognitiveLevel: "higher_order",
          commandVerbs: ["explain", "assess"],
          memoText: "1.1.1 March on Washington ✓ Civil rights protest/demonstration ✓\n1.1.2 Methods (2 marks each): Sit-ins ✓ Boycotts ✓ Freedom rides ✓ Marches ✓\n1.1.3 Impact: Inspired movement ✓ Gained national attention ✓ Influenced legislation ✓ Source evidence ✓ Own knowledge ✓ Assessment ✓",
          memoTextAf: "1.1.1 Mars op Washington ✓ Burgerregte protes/demonstrasie ✓\n1.1.2 Metodes (2 punte elk): Sit-stakings ✓ Boikotte ✓ Vryheidsritte ✓ Marse ✓\n1.1.3 Impak: Beweging geïnspireer ✓ Nasionale aandag gekry ✓ Wetgewing beïnvloed ✓ Bronbewys ✓ Eie kennis ✓ Assessering ✓",
          markingSteps: [
            { step: "1.1.1 Occasion identified", marks: 2 },
            { step: "1.1.2 Two methods explained", marks: 4 },
            { step: "1.1.3 Impact assessed with evidence", marks: 6 }
          ],
          commonErrors: ["Not using source evidence", "Describing instead of assessing"],
          topic: "Civil Rights Movement - Leadership",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// PHYSICAL SCIENCES PAPER 2 - Chemistry
export const PHYSICS_PAPER_2: SimulatedPaper = {
  subjectCode: "PHYS",
  subjectName: "Physical Sciences",
  subjectNameAf: "Fisiese Wetenskappe",
  paperNumber: 2,
  totalMarks: 150,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Physical%20Sciences%20P2%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Physical%20Sciences%20P2%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Multiple Choice",
      nameAf: "Afdeling A: Meervoudige Keuse",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "PHYS-P2-Q1",
          questionNumber: "1",
          questionText: "1.1 Which of the following represents a Lewis acid?\nA. NH₃\nB. BF₃\nC. OH⁻\nD. H₂O\n\n1.2 The functional group -COOH represents:\nA. An aldehyde\nB. A ketone\nC. A carboxylic acid\nD. An ester",
          questionTextAf: "1.1 Watter van die volgende verteenwoordig 'n Lewis-suur?\nA. NH₃\nB. BF₃\nC. OH⁻\nD. H₂O\n\n1.2 Die funksionele groep -COOH verteenwoordig:\nA. 'n Aldehied\nB. 'n Ketoon\nC. 'n Karboksielsuur\nD. 'n Ester",
          marks: 10,
          cognitiveLevel: "knowledge",
          commandVerbs: ["identify"],
          memoText: "1.1 B (BF₃ - electron pair acceptor) ✓\n1.2 C (Carboxylic acid) ✓",
          memoTextAf: "1.1 B (BF₃ - elektronpaarontvanger) ✓\n1.2 C (Karboksielsuur) ✓",
          markingSteps: [
            { step: "1.1 Correct: B", marks: 2 },
            { step: "1.2 Correct: C", marks: 2 }
          ],
          commonErrors: ["Confusing Lewis and Brønsted acids", "Not knowing functional groups"],
          topic: "Chemistry - Acids and Organic Chemistry",
          difficulty: "easy"
        }
      ]
    },
    {
      name: "Section B: Organic Chemistry",
      nameAf: "Afdeling B: Organiese Chemie",
      instructions: "Answer ALL questions. Show all working.",
      instructionsAf: "Beantwoord ALLE vrae. Toon alle berekeninge.",
      questions: [
        {
          id: "PHYS-P2-Q2",
          questionNumber: "2",
          questionText: "2.1 Name the following compound using IUPAC nomenclature: CH₃CH₂CH(CH₃)CH₂OH (2)\n\n2.2 Draw the structural formula of propan-2-ol. (2)\n\n2.3 Explain why ethanol has a higher boiling point than ethane. (4)\n\n2.4 Write a balanced equation for the combustion of ethanol. (3)",
          questionTextAf: "2.1 Noem die volgende verbinding met IUPAC-nomenklatuur: CH₃CH₂CH(CH₃)CH₂OH (2)\n\n2.2 Teken die strukturele formule van propan-2-ol. (2)\n\n2.3 Verduidelik waarom etanol 'n hoër kookpunt as etaan het. (4)\n\n2.4 Skryf 'n gebalanseerde vergelyking vir die verbranding van etanol. (3)",
          marks: 11,
          cognitiveLevel: "application",
          commandVerbs: ["name", "draw", "explain", "write"],
          memoText: "2.1 3-methylbutan-1-ol ✓✓\n2.2 Correct structure with OH on middle carbon ✓✓\n2.3 Hydrogen bonding in ethanol ✓ vs weak van der Waals in ethane ✓ H-bonds need more energy to break ✓ Higher boiling point ✓\n2.4 C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O ✓✓✓",
          memoTextAf: "2.1 3-metielbutan-1-ol ✓✓\n2.2 Korrekte struktuur met OH op middelste koolstof ✓✓\n2.3 Waterstofbinding in etanol ✓ vs swak van der Waals in etaan ✓ H-bindings benodig meer energie om te breek ✓ Hoër kookpunt ✓\n2.4 C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O ✓✓✓",
          markingSteps: [
            { step: "2.1 IUPAC name correct", marks: 2 },
            { step: "2.2 Structural formula correct", marks: 2 },
            { step: "2.3 Hydrogen bonding explained", marks: 4 },
            { step: "2.4 Balanced equation", marks: 3 }
          ],
          commonErrors: ["Wrong IUPAC numbering", "Unbalanced equations", "Not mentioning intermolecular forces"],
          topic: "Organic Chemistry - Alcohols",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// LIFE SCIENCES PAPER 2
export const LIFE_SCIENCES_PAPER_2: SimulatedPaper = {
  subjectCode: "LIFE",
  subjectName: "Life Sciences",
  subjectNameAf: "Lewenswetenskappe",
  paperNumber: 2,
  totalMarks: 150,
  duration: "2.5 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Life%20Sciences%20P2%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Life%20Sciences%20P2%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Evolution",
      nameAf: "Afdeling A: Evolusie",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "LIFE-P2-Q1",
          questionNumber: "1",
          questionText: "1.1 Define the term 'natural selection'. (2)\n\n1.2 Explain THREE pieces of evidence that support the theory of evolution. (6)\n\n1.3 Distinguish between homologous and analogous structures. Give an example of each. (4)\n\n1.4 Discuss how antibiotic resistance in bacteria demonstrates evolution in action. (6)",
          questionTextAf: "1.1 Definieer die term 'natuurlike seleksie'. (2)\n\n1.2 Verduidelik DRIE bewysstukke wat die evolusieteorie ondersteun. (6)\n\n1.3 Onderskei tussen homoloë en analoë strukture. Gee 'n voorbeeld van elk. (4)\n\n1.4 Bespreek hoe antibiotiese weerstandigheid in bakterieë evolusie in aksie demonstreer. (6)",
          marks: 18,
          cognitiveLevel: "higher_order",
          commandVerbs: ["define", "explain", "distinguish", "discuss"],
          memoText: "1.1 Process where organisms with favourable traits ✓ survive and reproduce more successfully ✓\n1.2 Evidence (2 each): Fossil record ✓✓ Comparative anatomy ✓✓ Molecular biology/DNA ✓✓ Biogeography ✓✓\n1.3 Homologous: same origin, different function ✓ Example: limb bones ✓ Analogous: different origin, same function ✓ Example: wings ✓\n1.4 Mutation occurs ✓ Selective pressure from antibiotics ✓ Resistant bacteria survive ✓ Reproduce and pass on resistance ✓ Population becomes resistant ✓ Real-world example ✓",
          memoTextAf: "1.1 Proses waar organismes met gunstige eienskappe ✓ oorleef en meer suksesvol voortplant ✓\n1.2 Bewyse (2 elk): Fossielveldtog ✓✓ Vergelykende anatomie ✓✓ Molekulêre biologie/DNS ✓✓ Biogeografie ✓✓\n1.3 Homoloog: dieselfde oorsprong, verskillende funksie ✓ Voorbeeld: ledemate bene ✓ Analoog: verskillende oorsprong, dieselfde funksie ✓ Voorbeeld: vlerke ✓\n1.4 Mutasie vind plaas ✓ Selektiewe druk van antibiotika ✓ Weerstandige bakterieë oorleef ✓ Plant voort en dra weerstand oor ✓ Populasie word weerstandig ✓ Werklike voorbeeld ✓",
          markingSteps: [
            { step: "1.1 Natural selection defined", marks: 2 },
            { step: "1.2 Three pieces of evidence", marks: 6 },
            { step: "1.3 Structures distinguished with examples", marks: 4 },
            { step: "1.4 Antibiotic resistance explained", marks: 6 }
          ],
          commonErrors: ["Confusing homologous and analogous", "Not linking evidence to evolution", "Incomplete explanation of resistance"],
          topic: "Evolution - Natural Selection",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// INFORMATION TECHNOLOGY PAPER 1 - Theory
export const IT_PAPER_1: SimulatedPaper = {
  subjectCode: "IT",
  subjectName: "Information Technology",
  subjectNameAf: "Inligtingstegnologie",
  paperNumber: 1,
  totalMarks: 150,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Information%20Technology%20P1%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Information%20Technology%20P1%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Short Questions",
      nameAf: "Afdeling A: Kort Vrae",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "IT-P1-Q1",
          questionNumber: "1",
          questionText: "1.1 Define the following terms:\n   (a) Algorithm (2)\n   (b) Syntax error (2)\n   (c) Variable (2)\n\n1.2 State TWO advantages of using object-oriented programming. (2)\n\n1.3 Explain the difference between a class and an object in OOP. (4)",
          questionTextAf: "1.1 Definieer die volgende terme:\n   (a) Algoritme (2)\n   (b) Sintaksfout (2)\n   (c) Veranderlike (2)\n\n1.2 Noem TWEE voordele van objekgeoriënteerde programmering. (2)\n\n1.3 Verduidelik die verskil tussen 'n klas en 'n objek in OOP. (4)",
          marks: 12,
          cognitiveLevel: "knowledge",
          commandVerbs: ["define", "state", "explain"],
          memoText: "1.1(a) Step-by-step procedure ✓ to solve a problem ✓\n1.1(b) Error in code structure ✓ detected by compiler ✓\n1.1(c) Named storage location ✓ that holds a value ✓\n1.2 Advantages: Code reusability ✓ Easier maintenance ✓ Modularity ✓ (any 2)\n1.3 Class: blueprint/template ✓ Object: instance of class ✓ Class defines structure ✓ Object has actual values ✓",
          memoTextAf: "1.1(a) Stap-vir-stap prosedure ✓ om 'n probleem op te los ✓\n1.1(b) Fout in kodestruktuur ✓ deur samesteller opgespoor ✓\n1.1(c) Benoemde stoorplek ✓ wat 'n waarde bevat ✓\n1.2 Voordele: Kode herbruikbaarheid ✓ Makliker onderhoud ✓ Modulariteit ✓ (enige 2)\n1.3 Klas: bloudruk/sjabloon ✓ Objek: instansie van klas ✓ Klas definieer struktuur ✓ Objek het werklike waardes ✓",
          markingSteps: [
            { step: "1.1 Definitions correct", marks: 6 },
            { step: "1.2 Two advantages", marks: 2 },
            { step: "1.3 Class vs object explained", marks: 4 }
          ],
          commonErrors: ["Incomplete definitions", "Confusing class and object"],
          topic: "Programming Concepts",
          difficulty: "easy"
        }
      ]
    },
    {
      name: "Section B: Programming",
      nameAf: "Afdeling B: Programmering",
      instructions: "Study the code and answer questions.",
      instructionsAf: "Bestudeer die kode en beantwoord vrae.",
      questions: [
        {
          id: "IT-P1-Q2",
          questionNumber: "2",
          questionText: "Study the following Delphi code segment:\n\n```\nfunction Calculate(num: Integer): Integer;\nbegin\n  if num <= 1 then\n    Result := 1\n  else\n    Result := num * Calculate(num - 1);\nend;\n```\n\n2.1 What programming concept is demonstrated in this code? (1)\n2.2 Trace the output when Calculate(4) is called. Show all steps. (4)\n2.3 Identify a potential problem with this function and suggest a solution. (3)",
          questionTextAf: "Bestudeer die volgende Delphi-kodesegment:\n\n```\nfunction Calculate(num: Integer): Integer;\nbegin\n  if num <= 1 then\n    Result := 1\n  else\n    Result := num * Calculate(num - 1);\nend;\n```\n\n2.1 Watter programmeringskonsep word in hierdie kode gedemonstreer? (1)\n2.2 Spoor die uitset na wanneer Calculate(4) geroep word. Toon alle stappe. (4)\n2.3 Identifiseer 'n potensiële probleem met hierdie funksie en stel 'n oplossing voor. (3)",
          marks: 8,
          cognitiveLevel: "application",
          commandVerbs: ["identify", "trace", "suggest"],
          memoText: "2.1 Recursion ✓\n2.2 Calculate(4) = 4 * Calculate(3) ✓\n    = 4 * 3 * Calculate(2) ✓\n    = 4 * 3 * 2 * Calculate(1) ✓\n    = 4 * 3 * 2 * 1 = 24 ✓\n2.3 Problem: Stack overflow with negative numbers ✓ or large numbers ✓\n    Solution: Input validation ✓ or iterative version ✓",
          memoTextAf: "2.1 Rekursie ✓\n2.2 Calculate(4) = 4 * Calculate(3) ✓\n    = 4 * 3 * Calculate(2) ✓\n    = 4 * 3 * 2 * Calculate(1) ✓\n    = 4 * 3 * 2 * 1 = 24 ✓\n2.3 Probleem: Stapeloorvloei met negatiewe getalle ✓ of groot getalle ✓\n    Oplossing: Invoervalidering ✓ of iteratiewe weergawe ✓",
          markingSteps: [
            { step: "2.1 Recursion identified", marks: 1 },
            { step: "2.2 Trace showing all steps", marks: 4 },
            { step: "2.3 Problem and solution", marks: 3 }
          ],
          commonErrors: ["Not showing trace steps", "Missing recursive calls"],
          topic: "Programming - Recursion",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// TOURISM
export const TOURISM_PAPER: SimulatedPaper = {
  subjectCode: "TOUR",
  subjectName: "Tourism",
  subjectNameAf: "Toerisme",
  paperNumber: 1,
  totalMarks: 200,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Tourism%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Tourism%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Short Questions",
      nameAf: "Afdeling A: Kort Vrae",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "TOUR-Q1",
          questionNumber: "1",
          questionText: "1.1 Define the term 'sustainable tourism'. (2)\n\n1.2 List THREE negative impacts of tourism on the environment. (3)\n\n1.3 Explain TWO ways in which communities can benefit from tourism. (4)\n\n1.4 Calculate the time in London when it is 14:30 in Johannesburg. Show all working. (London is GMT, SA is GMT+2) (3)",
          questionTextAf: "1.1 Definieer die term 'volhoubare toerisme'. (2)\n\n1.2 Lys DRIE negatiewe impakte van toerisme op die omgewing. (3)\n\n1.3 Verduidelik TWEE maniere waarop gemeenskappe by toerisme kan baat. (4)\n\n1.4 Bereken die tyd in Londen wanneer dit 14:30 in Johannesburg is. Toon alle berekeninge. (Londen is GMT, SA is GMT+2) (3)",
          marks: 12,
          cognitiveLevel: "application",
          commandVerbs: ["define", "list", "explain", "calculate"],
          memoText: "1.1 Tourism that meets current needs ✓ without compromising future generations ✓\n1.2 Impacts: Pollution ✓ Habitat destruction ✓ Water usage ✓ Carbon emissions ✓ (any 3)\n1.3 Employment opportunities ✓✓ Cultural preservation ✓✓ Infrastructure development ✓✓ (any 2 explained)\n1.4 SA is 2 hours ahead ✓ 14:30 - 2 hours ✓ = 12:30 in London ✓",
          memoTextAf: "1.1 Toerisme wat huidige behoeftes bevredig ✓ sonder om toekomstige geslagte te benadeel ✓\n1.2 Impakte: Besoedeling ✓ Habitat vernietiging ✓ Waterverbruik ✓ Koolstofvrystellings ✓ (enige 3)\n1.3 Werksgeleenthede ✓✓ Kulturele bewaring ✓✓ Infrastruktuurontwikkeling ✓✓ (enige 2 verduidelik)\n1.4 SA is 2 uur voor ✓ 14:30 - 2 ure ✓ = 12:30 in Londen ✓",
          markingSteps: [
            { step: "1.1 Definition complete", marks: 2 },
            { step: "1.2 Three impacts listed", marks: 3 },
            { step: "1.3 Two benefits explained", marks: 4 },
            { step: "1.4 Time calculation correct", marks: 3 }
          ],
          commonErrors: ["Incomplete definition", "Not showing time calculation", "Listing instead of explaining"],
          topic: "Sustainable Tourism and Time Zones",
          difficulty: "easy"
        }
      ]
    },
    {
      name: "Section B: Tourism Sectors",
      nameAf: "Afdeling B: Toerisme Sektore",
      instructions: "Answer any TWO questions.",
      instructionsAf: "Beantwoord enige TWEE vrae.",
      questions: [
        {
          id: "TOUR-Q2",
          questionNumber: "2",
          questionText: "2.1 Name FOUR types of accommodation available for tourists. (4)\n\n2.2 Discuss the advantages and disadvantages of using Airbnb compared to traditional hotels. (6)\n\n2.3 Explain how the hospitality industry contributes to the South African economy. (6)",
          questionTextAf: "2.1 Noem VIER tipes akkommodasie beskikbaar vir toeriste. (4)\n\n2.2 Bespreek die voordele en nadele van die gebruik van Airbnb in vergelyking met tradisionele hotelle. (6)\n\n2.3 Verduidelik hoe die gasvryheidsbedryf tot die Suid-Afrikaanse ekonomie bydra. (6)",
          marks: 16,
          cognitiveLevel: "application",
          commandVerbs: ["name", "discuss", "explain"],
          memoText: "2.1 Types: Hotels ✓ Guest houses ✓ B&Bs ✓ Hostels ✓ Resorts ✓ Camping ✓ (any 4)\n2.2 Advantages of Airbnb: Cheaper ✓ Local experience ✓ More space ✓\n    Disadvantages: Less consistent ✓ No services ✓ Safety concerns ✓\n2.3 Contribution: Job creation ✓ Foreign exchange ✓ Tax revenue ✓ Skills development ✓ Supporting local businesses ✓ Infrastructure investment ✓",
          memoTextAf: "2.1 Tipes: Hotelle ✓ Gastehuise ✓ B&Bs ✓ Jeugherberge ✓ Oorde ✓ Kampering ✓ (enige 4)\n2.2 Voordele van Airbnb: Goedkoper ✓ Plaaslike ervaring ✓ Meer ruimte ✓\n    Nadele: Minder konsekwent ✓ Geen dienste ✓ Veiligheidskwessies ✓\n2.3 Bydrae: Werkskepping ✓ Buitelandse valuta ✓ Belastinginkomste ✓ Vaardigheidsontwikkeling ✓ Ondersteuning van plaaslike besighede ✓ Infrastruktuur belegging ✓",
          markingSteps: [
            { step: "2.1 Four accommodation types", marks: 4 },
            { step: "2.2 Advantages and disadvantages", marks: 6 },
            { step: "2.3 Economic contributions", marks: 6 }
          ],
          commonErrors: ["Not balancing advantages and disadvantages", "Not linking to South African context"],
          topic: "Accommodation and Hospitality",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// AGRICULTURAL SCIENCES PAPER 1
export const AGRIC_PAPER_1: SimulatedPaper = {
  subjectCode: "AGRIC",
  subjectName: "Agricultural Sciences",
  subjectNameAf: "Landbouwetenskappe",
  paperNumber: 1,
  totalMarks: 150,
  duration: "2.5 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Agricultural%20Sciences%20P1%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Agricultural%20Sciences%20P1%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Short Questions",
      nameAf: "Afdeling A: Kort Vrae",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "AGRIC-Q1",
          questionNumber: "1",
          questionText: "1.1 Define the term 'soil pH'. (2)\n\n1.2 Explain why soil testing is important for crop production. (4)\n\n1.3 A farmer notices yellowing of leaves (chlorosis) on his maize crop. Identify TWO possible nutrient deficiencies and explain how each causes chlorosis. (6)",
          questionTextAf: "1.1 Definieer die term 'grond-pH'. (2)\n\n1.2 Verduidelik waarom grondtoetsing belangrik is vir gewasproduksie. (4)\n\n1.3 'n Boer sien geelwording van blare (chlorose) op sy mieliegewas. Identifiseer TWEE moontlike voedingstoftekorte en verduidelik hoe elkeen chlorose veroorsaak. (6)",
          marks: 12,
          cognitiveLevel: "application",
          commandVerbs: ["define", "explain", "identify"],
          memoText: "1.1 Measure of acidity or alkalinity ✓ of soil on a scale of 0-14 ✓\n1.2 Determines nutrient availability ✓ Guides fertilizer application ✓ Identifies soil problems ✓ Cost-effective farming ✓\n1.3 Nitrogen deficiency: affects chlorophyll production ✓ older leaves yellow first ✓\n    Iron deficiency: needed for chlorophyll synthesis ✓ younger leaves affected ✓\n    Magnesium deficiency: central atom in chlorophyll ✓ interveinal chlorosis ✓",
          memoTextAf: "1.1 Maatstaf van suurheid of alkaliteit ✓ van grond op 'n skaal van 0-14 ✓\n1.2 Bepaal voedingstofbeskikbaarheid ✓ Lei kunsmistoediening ✓ Identifiseer grondprobleme ✓ Kostedoeltreffende boerdery ✓\n1.3 Stikstof tekort: beïnvloed chlorofilproduksie ✓ ouer blare word eers geel ✓\n    Ystertekort: nodig vir chlorofilsintese ✓ jonger blare geraak ✓\n    Magnesiumtekort: sentrale atoom in chlorofil ✓ interveinale chlorose ✓",
          markingSteps: [
            { step: "1.1 pH defined", marks: 2 },
            { step: "1.2 Importance explained", marks: 4 },
            { step: "1.3 Two deficiencies with explanations", marks: 6 }
          ],
          commonErrors: ["Incomplete definition", "Not explaining mechanism of chlorosis"],
          topic: "Soil Science and Plant Nutrition",
          difficulty: "medium"
        }
      ]
    },
    {
      name: "Section B: Animal Husbandry",
      nameAf: "Afdeling B: Veeteelt",
      instructions: "Answer any TWO questions.",
      instructionsAf: "Beantwoord enige TWEE vrae.",
      questions: [
        {
          id: "AGRIC-Q2",
          questionNumber: "2",
          questionText: "2.1 Name the FOUR compartments of a ruminant's stomach and state the function of each. (8)\n\n2.2 Explain the importance of colostrum for newborn calves. (4)\n\n2.3 Discuss THREE factors that affect milk production in dairy cattle. (6)",
          questionTextAf: "2.1 Noem die VIER kompartemente van 'n herkouerdier se maag en verduidelik die funksie van elk. (8)\n\n2.2 Verduidelik die belangrikheid van biesmelk vir pasgebore kalwers. (4)\n\n2.3 Bespreek DRIE faktore wat melkproduksie in melkbeeste beïnvloed. (6)",
          marks: 18,
          cognitiveLevel: "application",
          commandVerbs: ["name", "state", "explain", "discuss"],
          memoText: "2.1 Rumen: fermentation chamber ✓✓\n    Reticulum: traps foreign objects ✓✓\n    Omasum: absorbs water and nutrients ✓✓\n    Abomasum: true stomach, enzymatic digestion ✓✓\n2.2 Antibodies for immunity ✓ High energy and nutrients ✓ Laxative effect ✓ Essential first 24 hours ✓\n2.3 Factors: Nutrition/feeding ✓✓ Genetics/breed ✓✓ Health and disease ✓✓ Stage of lactation ✓✓ (any 3)",
          memoTextAf: "2.1 Rumen: fermentasiekamer ✓✓\n    Netmaag: vang vreemde voorwerpe ✓✓\n    Boekmaag: absorbeer water en voedingstowwe ✓✓\n    Lebmaag: ware maag, ensiematiese vertering ✓✓\n2.2 Teenliggame vir immuniteit ✓ Hoë energie en voedingstowwe ✓ Lakseereffek ✓ Noodsaaklik eerste 24 ure ✓\n2.3 Faktore: Voeding ✓✓ Genetika/ras ✓✓ Gesondheid en siekte ✓✓ Stadium van laktasie ✓✓ (enige 3)",
          markingSteps: [
            { step: "2.1 Four compartments with functions", marks: 8 },
            { step: "2.2 Colostrum importance", marks: 4 },
            { step: "2.3 Three factors discussed", marks: 6 }
          ],
          commonErrors: ["Wrong order of stomach compartments", "Not explaining functions fully"],
          topic: "Animal Nutrition and Production",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// CONSUMER STUDIES
export const CONSUMER_STUDIES_PAPER: SimulatedPaper = {
  subjectCode: "CONS",
  subjectName: "Consumer Studies",
  subjectNameAf: "Verbruikerstudies",
  paperNumber: 1,
  totalMarks: 200,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Consumer%20Studies%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Consumer%20Studies%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Consumer Rights",
      nameAf: "Afdeling A: Verbruikersregte",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "CONS-Q1",
          questionNumber: "1",
          questionText: "1.1 State FIVE consumer rights as outlined in the Consumer Protection Act (CPA). (5)\n\n1.2 Explain how the National Credit Act protects consumers from reckless lending. (4)\n\n1.3 A consumer bought a cell phone that stopped working after two weeks. Discuss the options available to this consumer under the CPA. (6)",
          questionTextAf: "1.1 Noem VYF verbruikersregte soos uiteengesit in die Wet op Verbruikersbeskerming (WVB). (5)\n\n1.2 Verduidelik hoe die Nasionale Kredietwet verbruikers teen roekelose uitlening beskerm. (4)\n\n1.3 'n Verbruiker het 'n selfoon gekoop wat na twee weke ophou werk het. Bespreek die opsies beskikbaar vir hierdie verbruiker onder die WVB. (6)",
          marks: 15,
          cognitiveLevel: "application",
          commandVerbs: ["state", "explain", "discuss"],
          memoText: "1.1 Rights: Right to choose ✓ Right to information ✓ Right to fair value ✓ Right to privacy ✓ Right to return goods ✓ Right to honest dealing ✓ (any 5)\n1.2 NCA: Affordability assessment ✓ Debt counselling ✓ Disclosure requirements ✓ Prevention of over-indebtedness ✓\n1.3 Options: Return for refund ✓ Exchange for similar item ✓ Repair at no cost ✓ 6-month implied warranty ✓ Complaint to NCT ✓ Consumer's choice ✓",
          memoTextAf: "1.1 Regte: Reg om te kies ✓ Reg op inligting ✓ Reg op billike waarde ✓ Reg op privaatheid ✓ Reg om goedere terug te gee ✓ Reg op eerlike handel ✓ (enige 5)\n1.2 NKW: Bekostigbaarheidsbeoordeling ✓ Skuldberading ✓ Openbaarmakingsvereistes ✓ Voorkoming van oormatige skuld ✓\n1.3 Opsies: Terugbetaling ✓ Omruiling vir soortgelyke item ✓ Herstel teen geen koste ✓ 6-maande geïmpliseerde waarborg ✓ Klagte by NKT ✓ Verbruiker se keuse ✓",
          markingSteps: [
            { step: "1.1 Five rights stated", marks: 5 },
            { step: "1.2 NCA protection explained", marks: 4 },
            { step: "1.3 Consumer options discussed", marks: 6 }
          ],
          commonErrors: ["Confusing consumer rights", "Not knowing 6-month warranty rule"],
          topic: "Consumer Rights and Protection",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// MATHEMATICAL LITERACY PAPER 1
export const MATH_LIT_PAPER_1: SimulatedPaper = {
  subjectCode: "MATHL",
  subjectName: "Mathematical Literacy",
  subjectNameAf: "Wiskundige Geletterdheid",
  paperNumber: 1,
  totalMarks: 100,
  duration: "2 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Mathematical%20Literacy%20P1%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Mathematical%20Literacy%20P1%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Basic Skills",
      nameAf: "Afdeling A: Basiese Vaardighede",
      instructions: "Answer ALL questions. Calculators may be used.",
      instructionsAf: "Beantwoord ALLE vrae. Sakrekenaars mag gebruik word.",
      questions: [
        {
          id: "MATHL-P1-Q1",
          questionNumber: "1",
          questionText: "1.1 Calculate 15% of R2 450. (2)\n\n1.2 A dress costs R599. If there is a 20% discount, calculate the sale price. (3)\n\n1.3 Convert 2.5 hours to hours and minutes. (2)\n\n1.4 The exchange rate is R18.50 = $1. Calculate how many US dollars you would get for R5 000. (2)",
          questionTextAf: "1.1 Bereken 15% van R2 450. (2)\n\n1.2 'n Rok kos R599. As daar 'n 20% afslag is, bereken die verkoopprys. (3)\n\n1.3 Skakel 2,5 ure om na ure en minute. (2)\n\n1.4 Die wisselkoers is R18,50 = $1. Bereken hoeveel Amerikaanse dollars jy vir R5 000 sal kry. (2)",
          marks: 9,
          cognitiveLevel: "application",
          commandVerbs: ["calculate", "convert"],
          memoText: "1.1 15/100 × 2450 ✓ = R367.50 ✓\n1.2 Discount = 20/100 × 599 = R119.80 ✓ Sale price = 599 - 119.80 ✓ = R479.20 ✓\n1.3 2 hours ✓ and 30 minutes ✓\n1.4 5000 ÷ 18.50 ✓ = $270.27 ✓",
          memoTextAf: "1.1 15/100 × 2450 ✓ = R367,50 ✓\n1.2 Afslag = 20/100 × 599 = R119,80 ✓ Verkoopprys = 599 - 119,80 ✓ = R479,20 ✓\n1.3 2 ure ✓ en 30 minute ✓\n1.4 5000 ÷ 18,50 ✓ = $270,27 ✓",
          markingSteps: [
            { step: "1.1 Percentage calculation", marks: 2 },
            { step: "1.2 Discount and sale price", marks: 3 },
            { step: "1.3 Time conversion", marks: 2 },
            { step: "1.4 Currency conversion", marks: 2 }
          ],
          commonErrors: ["Not subtracting discount from original", "Multiplying instead of dividing for currency"],
          topic: "Financial Mathematics",
          difficulty: "easy"
        }
      ]
    },
    {
      name: "Section B: Finance",
      nameAf: "Afdeling B: Finansies",
      instructions: "Answer ALL questions. Show all calculations.",
      instructionsAf: "Beantwoord ALLE vrae. Toon alle berekeninge.",
      questions: [
        {
          id: "MATHL-P1-Q2",
          questionNumber: "2",
          questionText: "Study the table showing electricity tariffs:\n\nUsage (kWh) | Rate per kWh\n0-50        | R0.85\n51-350      | R1.25\n351-600     | R1.65\n>600        | R2.10\n\n2.1 Calculate the cost of using 420 kWh of electricity. (5)\n\n2.2 A household's monthly electricity bill was R475. Estimate the number of kWh used. (4)",
          questionTextAf: "Bestudeer die tabel wat elektrisiteitstariewe toon:\n\nVerbruik (kWh) | Tarief per kWh\n0-50          | R0,85\n51-350        | R1,25\n351-600       | R1,65\n>600          | R2,10\n\n2.1 Bereken die koste van 420 kWh elektrisiteit gebruik. (5)\n\n2.2 'n Huishouding se maandelikse elektrisiteitsrekening was R475. Skat die aantal kWh gebruik. (4)",
          marks: 9,
          cognitiveLevel: "application",
          commandVerbs: ["calculate", "estimate"],
          memoText: "2.1 First 50 kWh: 50 × R0.85 = R42.50 ✓\n    Next 300 kWh: 300 × R1.25 = R375.00 ✓\n    Remaining 70 kWh: 70 × R1.65 = R115.50 ✓\n    Total = 42.50 + 375 + 115.50 ✓ = R533.00 ✓\n2.2 Systematic calculation or estimation ✓✓ showing reasoning ✓ approximately 330-350 kWh ✓",
          memoTextAf: "2.1 Eerste 50 kWh: 50 × R0,85 = R42,50 ✓\n    Volgende 300 kWh: 300 × R1,25 = R375,00 ✓\n    Oorblywende 70 kWh: 70 × R1,65 = R115,50 ✓\n    Totaal = 42,50 + 375 + 115,50 ✓ = R533,00 ✓\n2.2 Sistematiese berekening of skatting ✓✓ wat redenasie toon ✓ ongeveer 330-350 kWh ✓",
          markingSteps: [
            { step: "2.1 Each tier calculated correctly", marks: 4 },
            { step: "2.1 Total correct", marks: 1 },
            { step: "2.2 Estimation with reasoning", marks: 4 }
          ],
          commonErrors: ["Not using tiered calculation", "Adding instead of applying rates per tier"],
          topic: "Finance - Tariff Calculations",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// MATHEMATICAL LITERACY PAPER 2
export const MATH_LIT_PAPER_2: SimulatedPaper = {
  subjectCode: "MATHL",
  subjectName: "Mathematical Literacy",
  subjectNameAf: "Wiskundige Geletterdheid",
  paperNumber: 2,
  totalMarks: 100,
  duration: "2.5 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Mathematical%20Literacy%20P2%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Mathematical%20Literacy%20P2%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Measurement",
      nameAf: "Afdeling A: Meting",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "MATHL-P2-Q1",
          questionNumber: "1",
          questionText: "A rectangular room has the following dimensions:\nLength: 5.2 m\nWidth: 4.3 m\nHeight: 2.8 m\n\n1.1 Calculate the floor area of the room. (2)\n\n1.2 If tiles measuring 30 cm × 30 cm are used, calculate how many tiles are needed for the floor. (3)\n\n1.3 Calculate the volume of the room in cubic metres. (2)\n\n1.4 A tin of paint covers 8 m². How many tins are needed to paint all four walls? (5)",
          questionTextAf: "'n Reghoekige kamer het die volgende afmetings:\nLengte: 5,2 m\nBreedte: 4,3 m\nHoogte: 2,8 m\n\n1.1 Bereken die vloeroppervlakte van die kamer. (2)\n\n1.2 As teëls van 30 cm × 30 cm gebruik word, bereken hoeveel teëls nodig is vir die vloer. (3)\n\n1.3 Bereken die volume van die kamer in kubieke meter. (2)\n\n1.4 'n Blik verf bedek 8 m². Hoeveel blikke is nodig om al vier mure te verf? (5)",
          marks: 12,
          cognitiveLevel: "application",
          commandVerbs: ["calculate"],
          memoText: "1.1 Area = 5.2 × 4.3 ✓ = 22.36 m² ✓\n1.2 Tile area = 0.3 × 0.3 = 0.09 m² ✓\n    Number of tiles = 22.36 ÷ 0.09 ✓ = 249 tiles (round up to 249) ✓\n1.3 Volume = 5.2 × 4.3 × 2.8 ✓ = 62.61 m³ ✓\n1.4 Wall area = 2(5.2 × 2.8) + 2(4.3 × 2.8) ✓\n    = 2(14.56) + 2(12.04) = 29.12 + 24.08 ✓ = 53.20 m² ✓\n    Tins needed = 53.20 ÷ 8 ✓ = 7 tins (round up) ✓",
          memoTextAf: "1.1 Oppervlakte = 5,2 × 4,3 ✓ = 22,36 m² ✓\n1.2 Teëloppervlakte = 0,3 × 0,3 = 0,09 m² ✓\n    Aantal teëls = 22,36 ÷ 0,09 ✓ = 249 teëls (rond op na 249) ✓\n1.3 Volume = 5,2 × 4,3 × 2,8 ✓ = 62,61 m³ ✓\n1.4 Muuroppervlakte = 2(5,2 × 2,8) + 2(4,3 × 2,8) ✓\n    = 2(14,56) + 2(12,04) = 29,12 + 24,08 ✓ = 53,20 m² ✓\n    Blikke nodig = 53,20 ÷ 8 ✓ = 7 blikke (rond op) ✓",
          markingSteps: [
            { step: "1.1 Floor area calculated", marks: 2 },
            { step: "1.2 Tiles calculated (with rounding)", marks: 3 },
            { step: "1.3 Volume calculated", marks: 2 },
            { step: "1.4 Wall area and tins calculated", marks: 5 }
          ],
          commonErrors: ["Not converting cm to m", "Not rounding up for tiles/paint", "Missing walls in calculation"],
          topic: "Measurement - Area and Volume",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// DRAMATIC ARTS
export const DRAMA_PAPER: SimulatedPaper = {
  subjectCode: "DRAMA",
  subjectName: "Dramatic Arts",
  subjectNameAf: "Dramatiese Kunste",
  paperNumber: 1,
  totalMarks: 150,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Dramatic%20Arts%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Dramatic%20Arts%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Theatre History",
      nameAf: "Afdeling A: Teatergeskiedenis",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "DRAMA-Q1",
          questionNumber: "1",
          questionText: "1.1 Define the term 'Greek tragedy'. (2)\n\n1.2 Explain THREE characteristics of Greek theatre. (6)\n\n1.3 Compare the role of the chorus in Greek tragedy to a modern musical. (4)",
          questionTextAf: "1.1 Definieer die term 'Griekse tragedie'. (2)\n\n1.2 Verduidelik DRIE kenmerke van Griekse teater. (6)\n\n1.3 Vergelyk die rol van die koor in Griekse tragedie met 'n moderne musiekblyspel. (4)",
          marks: 12,
          cognitiveLevel: "application",
          commandVerbs: ["define", "explain", "compare"],
          memoText: "1.1 Drama form depicting a protagonist's downfall ✓ often due to a fatal flaw (hamartia) ✓\n1.2 Characteristics (2 each): Use of masks ✓✓ Amphitheatre design ✓✓ Religious origins (Dionysus) ✓✓ All-male performers ✓✓ Unities of time, place, action ✓✓\n1.3 Greek: commentary, moral guidance ✓ Musical: ensemble support, entertainment ✓ Similarities in group performance ✓ Differences in function ✓",
          memoTextAf: "1.1 Dramavorm wat 'n protagonis se ondergang uitbeeld ✓ dikwels weens 'n fatale fout (hamartia) ✓\n1.2 Kenmerke (2 elk): Gebruik van maskers ✓✓ Amfiteater-ontwerp ✓✓ Religieuse oorsprong (Dionysus) ✓✓ Slegs manlike opvoerders ✓✓ Eenhede van tyd, plek, aksie ✓✓\n1.3 Grieks: kommentaar, morele leiding ✓ Musiekblyspel: ensemble ondersteuning, vermaak ✓ Ooreenkomste in groepoptrede ✓ Verskille in funksie ✓",
          markingSteps: [
            { step: "1.1 Definition complete", marks: 2 },
            { step: "1.2 Three characteristics explained", marks: 6 },
            { step: "1.3 Comparison made", marks: 4 }
          ],
          commonErrors: ["Confusing tragedy and comedy", "Not explaining characteristics fully"],
          topic: "Theatre History - Greek Theatre",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// VISUAL ARTS
export const VISUAL_ARTS_PAPER: SimulatedPaper = {
  subjectCode: "VISUAL",
  subjectName: "Visual Arts",
  subjectNameAf: "Visuele Kunste",
  paperNumber: 1,
  totalMarks: 100,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Visual%20Arts%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Visual%20Arts%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Art History",
      nameAf: "Afdeling A: Kunsgeskiedenis",
      instructions: "Answer ALL questions. Refer to the artworks provided.",
      instructionsAf: "Beantwoord ALLE vrae. Verwys na die kunswerke wat verskaf word.",
      questions: [
        {
          id: "VISUAL-Q1",
          questionNumber: "1",
          questionText: "Study Artwork A: 'The Persistence of Memory' by Salvador Dalí\n\n1.1 Identify the art movement this work belongs to. (1)\n\n1.2 Describe THREE surrealist elements visible in this artwork. (6)\n\n1.3 Explain how Dalí uses symbolism to convey meaning in this painting. (5)\n\n1.4 Compare Dalí's approach to reality with that of a Realist painter. (4)",
          questionTextAf: "Bestudeer Kunswerk A: 'The Persistence of Memory' deur Salvador Dalí\n\n1.1 Identifiseer die kunsvloei waaraan hierdie werk behoort. (1)\n\n1.2 Beskryf DRIE surrealistiese elemente sigbaar in hierdie kunswerk. (6)\n\n1.3 Verduidelik hoe Dalí simboliek gebruik om betekenis in hierdie skildery oor te dra. (5)\n\n1.4 Vergelyk Dalí se benadering tot realiteit met dié van 'n Realistiese skilder. (4)",
          marks: 16,
          cognitiveLevel: "higher_order",
          commandVerbs: ["identify", "describe", "explain", "compare"],
          memoText: "1.1 Surrealism ✓\n1.2 Elements (2 each): Melting clocks - distortion of time ✓✓ Dreamlike landscape ✓✓ Juxtaposition of unrelated objects ✓✓ Distorted self-portrait ✓✓\n1.3 Symbolism: Melting clocks - relativity of time ✓ Ants - decay ✓ Barren landscape - subconscious ✓ Soft forms - instability ✓ Overall interpretation ✓\n1.4 Surrealism: subconscious, dreams, irrational ✓✓ Realism: observable reality, accurate depiction ✓✓",
          memoTextAf: "1.1 Surrealisme ✓\n1.2 Elemente (2 elk): Smeltende horlosies - vervorming van tyd ✓✓ Droomagtige landskap ✓✓ Saamstelling van onverwante voorwerpe ✓✓ Vervormde selfportret ✓✓\n1.3 Simboliek: Smeltende horlosies - relatiwiteit van tyd ✓ Miere - verval ✓ Kaal landskap - onderbewussyn ✓ Sagte vorms - onstabiliteit ✓ Algehele interpretasie ✓\n1.4 Surrealisme: onderbewussyn, drome, irrasioneel ✓✓ Realisme: waarneembare werklikheid, akkurate uitbeelding ✓✓",
          markingSteps: [
            { step: "1.1 Movement identified", marks: 1 },
            { step: "1.2 Three elements described", marks: 6 },
            { step: "1.3 Symbolism explained", marks: 5 },
            { step: "1.4 Comparison made", marks: 4 }
          ],
          commonErrors: ["Describing without analysing", "Not linking to surrealist theory"],
          topic: "Art History - Surrealism",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// MUSIC
export const MUSIC_PAPER: SimulatedPaper = {
  subjectCode: "MUSIC",
  subjectName: "Music",
  subjectNameAf: "Musiek",
  paperNumber: 1,
  totalMarks: 100,
  duration: "3 hours",
  dbeLinks: {
    year: 2023,
    questionPaper: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Music%20Nov%202023%20Eng.pdf",
    memo: "https://www.education.gov.za/Portals/0/CD/2023%20NSC%20Exam%20Papers/Music%20Nov%202023%20Memo%20Eng.pdf"
  },
    sections: [
    {
      name: "Section A: Music Theory",
      nameAf: "Afdeling A: Musiekteorie",
      instructions: "Answer ALL questions.",
      instructionsAf: "Beantwoord ALLE vrae.",
      questions: [
        {
          id: "MUSIC-Q1",
          questionNumber: "1",
          questionText: "1.1 Write the following scales in the treble clef:\n   (a) G major (ascending) (2)\n   (b) D harmonic minor (ascending and descending) (3)\n\n1.2 Name the interval between:\n   (a) C and E (1)\n   (b) F and C (above) (1)\n   (c) D and B♭ (1)\n\n1.3 Identify the chord progression: I - IV - V - I (2)",
          questionTextAf: "1.1 Skryf die volgende toonlere in die treble sleutel:\n   (a) G majeur (stygende) (2)\n   (b) D harmoniese mineur (stygende en dalende) (3)\n\n1.2 Noem die interval tussen:\n   (a) C en E (1)\n   (b) F en C (bo) (1)\n   (c) D en B♭ (1)\n\n1.3 Identifiseer die akkoordprogressie: I - IV - V - I (2)",
          marks: 10,
          cognitiveLevel: "application",
          commandVerbs: ["write", "name", "identify"],
          memoText: "1.1(a) G A B C D E F# G ✓✓ (correct notes and F#)\n1.1(b) D E F G A B♭ C# D | D C♮ B♭ A G F E D ✓✓✓ (raised 7th ascending, natural descending)\n1.2(a) Major third ✓\n1.2(b) Perfect fifth ✓\n1.2(c) Minor sixth ✓\n1.3 Tonic - Subdominant - Dominant - Tonic ✓ (perfect/authentic cadence pattern) ✓",
          memoTextAf: "1.1(a) G A B C D E F# G ✓✓ (korrekte note en F#)\n1.1(b) D E F G A B♭ C# D | D C♮ B♭ A G F E D ✓✓✓ (verhoogde 7de stygende, natuurlik dalende)\n1.2(a) Majeur derde ✓\n1.2(b) Perfekte vyfde ✓\n1.2(c) Mineur sesde ✓\n1.3 Tonika - Subdominant - Dominant - Tonika ✓ (perfekte/outentieke kadens patroon) ✓",
          markingSteps: [
            { step: "1.1 Scales written correctly", marks: 5 },
            { step: "1.2 Intervals named", marks: 3 },
            { step: "1.3 Progression identified", marks: 2 }
          ],
          commonErrors: ["Missing accidentals in scales", "Confusing interval quality"],
          topic: "Music Theory - Scales and Intervals",
          difficulty: "medium"
        }
      ]
    }
  ]
};

// ---------------------------------------------------------------
// Launch-coverage stubs — minimum viable papers for subjects without a
// full simulated paper yet. Ensures every launch-blocking subject has at
// least one practice question while richer content is built out.
// ---------------------------------------------------------------
function makeStubPaper(opts: {
  code: string;
  name: string;
  nameAf: string;
  questionId: string;
  questionText: string;
  questionTextAf: string;
  memoText: string;
  memoTextAf: string;
  topic: string;
}): SimulatedPaper {
  return {
    subjectCode: opts.code,
    subjectName: opts.name,
    subjectNameAf: opts.nameAf,
    paperNumber: 1,
    totalMarks: 10,
    duration: "1 hour (practice stub)",
    dbeLinks: { year: 2023, questionPaper: "", memo: "" },
    sections: [{
      name: "Section A: Practice Stub",
      nameAf: "Afdeling A: Oefenstompie",
      instructions: "This is a practice stub while the full paper is built. Answer the question and self-mark against the memo.",
      instructionsAf: "Hierdie is 'n oefenstompie terwyl die volle vraestel gebou word. Beantwoord die vraag en merk self met die memo.",
      questions: [{
        id: opts.questionId,
        questionNumber: "1.1",
        questionText: opts.questionText,
        questionTextAf: opts.questionTextAf,
        marks: 10,
        cognitiveLevel: "higher_order",
        commandVerbs: ["discuss"],
        memoText: opts.memoText,
        memoTextAf: opts.memoTextAf,
        markingSteps: [{ step: "Self-mark against the memo (5-band rubric)", marks: 10 }],
        commonErrors: ["Insufficient detail", "Off-topic response"],
        topic: opts.topic,
        difficulty: "medium",
      }],
    }],
  };
}

const ENGLISH_FAL_STUB = makeStubPaper({
  code: "ENGF",
  name: "English First Additional Language",
  nameAf: "Engels Eerste Addisionele Taal",
  questionId: "ENGF-P1-Q1.1",
  questionText: "Write a short essay (150-200 words) describing a person who has influenced your life. Include why they matter to you.",
  questionTextAf: "Skryf 'n kort opstel (150-200 woorde) wat 'n persoon beskryf wat jou lewe beïnvloed het. Sluit in waarom hulle vir jou belangrik is.",
  memoText: "5-band rubric: content (4), language (3), structure (3). Award marks for clear introduction, supporting detail, and a concluding reflection. Vocabulary and sentence variety in language band.",
  memoTextAf: "5-band-rubriek: inhoud (4), taal (3), struktuur (3). Ken punte toe vir duidelike inleiding, ondersteunende besonderhede, en 'n slotreflektsie.",
  topic: "Writing - Descriptive Essay",
});

const AFRIKAANS_FAL_STUB = makeStubPaper({
  code: "AFRF",
  name: "Afrikaans First Additional Language",
  nameAf: "Afrikaans Eerste Addisionele Taal",
  questionId: "AFRF-P1-Q1.1",
  questionText: "Skryf 'n kort opstel (150-200 woorde) oor jou gunsteling vakansie. Beskryf waar jy was en wat jy gedoen het.",
  questionTextAf: "Skryf 'n kort opstel (150-200 woorde) oor jou gunsteling vakansie. Beskryf waar jy was en wat jy gedoen het.",
  memoText: "5-band rubric: inhoud (4), taal (3), struktuur (3). Reward concrete detail, idiomatic Afrikaans, and a clear narrative arc.",
  memoTextAf: "5-band-rubriek: inhoud (4), taal (3), struktuur (3). Beloon konkrete besonderhede, idiomatiese Afrikaans, en 'n duidelike narratiewe boog.",
  topic: "Skryfwerk - Beskrywende Opstel",
});

const LIFE_ORIENTATION_STUB = makeStubPaper({
  code: "LO",
  name: "Life Orientation",
  nameAf: "Lewensoriëntering",
  questionId: "LO-P1-Q1.1",
  questionText: "Discuss TWO ways in which goal-setting helps a Grade 12 learner manage exam stress. Refer to short-term and long-term goals.",
  questionTextAf: "Bespreek TWEE maniere waarop doelwitstelling 'n Graad 12 leerder help om eksamenstres te bestuur. Verwys na korttermyn- en langtermyndoelwitte.",
  memoText: "Award up to 5 marks per way. Look for: (a) breaks pressure into manageable steps, (b) provides clear sense of progress, (c) links daily action to long-term outcomes. Reference short-term (daily revision) and long-term (final NSC outcome).",
  memoTextAf: "Ken tot 5 punte per manier toe. Soek na: (a) breek druk in hanteerbare stappe op, (b) verskaf 'n duidelike gevoel van vordering, (c) verbind daaglikse aksie met langtermynuitkomste.",
  topic: "Stress Management - Goal Setting",
});

const CAT_STUB = makeStubPaper({
  code: "CAT",
  name: "Computer Applications Technology",
  nameAf: "Rekenaartoepassingstegnologie",
  questionId: "CAT-P1-Q1.1",
  questionText: "Explain THREE differences between RAM and ROM, and give an everyday example of each.",
  questionTextAf: "Verduidelik DRIE verskille tussen RAM en ROM, en gee 'n alledaagse voorbeeld van elk.",
  memoText: "RAM: volatile, read/write, used for active programs (e.g. browser tabs). ROM: non-volatile, read-only, stores firmware (e.g. BIOS). Award marks for: volatility, access type, typical use, and one valid example each.",
  memoTextAf: "RAM: vlugtig, lees/skryf, vir aktiewe programme. ROM: nie-vlugtig, lees-alleen, vir firmware. Ken punte toe vir: vlugtigheid, toegang, tipiese gebruik, en een geldige voorbeeld elk.",
  topic: "Hardware - Memory",
});

// Export all simulated papers
export const SIMULATED_PAPERS: SimulatedPaper[] = [
  MATH_PAPER_1,
  MATH_PAPER_2,
  PHYSICS_PAPER_1,
  PHYSICS_PAPER_2,
  ACCOUNTING_PAPER,
  LIFE_SCIENCES_PAPER_1,
  LIFE_SCIENCES_PAPER_2,
  ENGLISH_HL_PAPER_1,
  ENGLISH_HL_PAPER_2,
  ENGLISH_HL_PAPER_3,
  AFRIKAANS_HL_PAPER_1,
  BUSINESS_STUDIES_PAPER_1,
  ECONOMICS_PAPER_1,
  ECONOMICS_PAPER_2,
  GEOGRAPHY_PAPER_1,
  GEOGRAPHY_PAPER_2,
  HISTORY_PAPER_1,
  HISTORY_PAPER_2,
  IT_PAPER_1,
  TOURISM_PAPER,
  AGRIC_PAPER_1,
  CONSUMER_STUDIES_PAPER,
  MATH_LIT_PAPER_1,
  MATH_LIT_PAPER_2,
  DRAMA_PAPER,
  VISUAL_ARTS_PAPER,
  MUSIC_PAPER,
  // Launch-coverage stubs
  ENGLISH_FAL_STUB,
  AFRIKAANS_FAL_STUB,
  LIFE_ORIENTATION_STUB,
  CAT_STUB,
];

// Get simulated paper by subject code and paper number
export function getSimulatedPaper(subjectCode: string, paperNumber: number): SimulatedPaper | null {
  return SIMULATED_PAPERS.find(
    p => p.subjectCode === subjectCode && p.paperNumber === paperNumber
  ) || null;
}

// Get all questions for a subject
export function getQuestionsForSubject(subjectCode: string): SimulatedQuestion[] {
  const papers = SIMULATED_PAPERS.filter(p => p.subjectCode === subjectCode);
  const questions: SimulatedQuestion[] = [];
  
  for (const paper of papers) {
    for (const section of paper.sections) {
      questions.push(...section.questions);
    }
  }
  
  return questions;
}

// Get question by ID
export function getQuestionById(questionId: string): SimulatedQuestion | null {
  for (const paper of SIMULATED_PAPERS) {
    for (const section of paper.sections) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) return question;
    }
  }
  return null;
}

export function getSubjectCodeForQuestion(questionId: string): string | null {
  for (const paper of SIMULATED_PAPERS) {
    for (const section of paper.sections) {
      if (section.questions.find(q => q.id === questionId)) {
        return paper.subjectCode;
      }
    }
  }
  return null;
}

// Get available subjects with simulated exams
export function getAvailableSubjects(): { code: string; name: string; nameAf: string; papers: number[] }[] {
  const subjectMap = new Map<string, { name: string; nameAf: string; papers: number[] }>();
  
  for (const paper of SIMULATED_PAPERS) {
    if (!subjectMap.has(paper.subjectCode)) {
      subjectMap.set(paper.subjectCode, {
        name: paper.subjectName,
        nameAf: paper.subjectNameAf,
        papers: []
      });
    }
    subjectMap.get(paper.subjectCode)!.papers.push(paper.paperNumber);
  }
  
  return Array.from(subjectMap.entries()).map(([code, data]) => ({
    code,
    ...data
  }));
}
