export interface TopicWeight {
  topic: string;
  topicAf: string;
  frequencyScore: number;
  averageMarks: number;
  rotationFactor: number;
  probabilityWeight: number;
  tier: "very_high" | "high" | "medium";
  capsStrand: string;
  paper: 1 | 2;
}

export const BUSINESS_STUDIES_TOPIC_WEIGHTS: TopicWeight[] = [
  {
    topic: "Business Environments",
    topicAf: "Besigheidsomgewings",
    frequencyScore: 0.95,
    averageMarks: 30,
    rotationFactor: 0.95,
    probabilityWeight: 0.95,
    tier: "very_high",
    capsStrand: "Business Environments",
    paper: 1
  },
  {
    topic: "Business Operations",
    topicAf: "Besigheidsbedrywighede",
    frequencyScore: 0.90,
    averageMarks: 28,
    rotationFactor: 0.90,
    probabilityWeight: 0.92,
    tier: "very_high",
    capsStrand: "Business Operations",
    paper: 1
  },
  {
    topic: "Legislation",
    topicAf: "Wetgewing",
    frequencyScore: 0.92,
    averageMarks: 30,
    rotationFactor: 0.88,
    probabilityWeight: 0.92,
    tier: "very_high",
    capsStrand: "Business Ventures",
    paper: 2
  },
  {
    topic: "Leadership & Management",
    topicAf: "Leierskap en Bestuur",
    frequencyScore: 0.90,
    averageMarks: 28,
    rotationFactor: 0.90,
    probabilityWeight: 0.90,
    tier: "very_high",
    capsStrand: "Business Roles",
    paper: 2
  },
  {
    topic: "Quality of Performance",
    topicAf: "Kwaliteit van Prestasie",
    frequencyScore: 0.88,
    averageMarks: 26,
    rotationFactor: 0.85,
    probabilityWeight: 0.88,
    tier: "very_high",
    capsStrand: "Business Operations",
    paper: 1
  },
  {
    topic: "Business Strategies",
    topicAf: "Besigheidstrategieë",
    frequencyScore: 0.80,
    averageMarks: 22,
    rotationFactor: 0.82,
    probabilityWeight: 0.82,
    tier: "high",
    capsStrand: "Business Ventures",
    paper: 2
  },
  {
    topic: "Human Resources",
    topicAf: "Menslike Hulpbronne",
    frequencyScore: 0.78,
    averageMarks: 20,
    rotationFactor: 0.80,
    probabilityWeight: 0.80,
    tier: "high",
    capsStrand: "Business Roles",
    paper: 2
  },
  {
    topic: "Ethics, Professionalism & Corporate Governance",
    topicAf: "Etiek, Professionalisme en Korporatiewe Bestuur",
    frequencyScore: 0.65,
    averageMarks: 18,
    rotationFactor: 0.70,
    probabilityWeight: 0.68,
    tier: "medium",
    capsStrand: "Business Roles",
    paper: 2
  },
  {
    topic: "Creative Thinking & Problem Solving",
    topicAf: "Kreatiewe Denke en Probleemoplossing",
    frequencyScore: 0.60,
    averageMarks: 16,
    rotationFactor: 0.72,
    probabilityWeight: 0.65,
    tier: "medium",
    capsStrand: "Business Ventures",
    paper: 1
  },
  {
    topic: "Presentation & Data Response",
    topicAf: "Aanbieding en Datareaksie",
    frequencyScore: 0.55,
    averageMarks: 14,
    rotationFactor: 0.68,
    probabilityWeight: 0.60,
    tier: "medium",
    capsStrand: "Business Operations",
    paper: 1
  }
];

export const MASTERY_THRESHOLDS = {
  red: { min: 0, max: 59, label: "Catch Up", labelAf: "Inhaal", color: "text-red-500", samplingBoost: 0.40, difficulty: "easy" },
  amber: { min: 60, max: 74, label: "Building", labelAf: "Bou", color: "text-amber-500", samplingBoost: 0.20, difficulty: "medium" },
  green: { min: 75, max: 84, label: "Locked In", labelAf: "Op Koers", color: "text-green-500", samplingBoost: 0, difficulty: "exam" },
  mastery: { min: 85, max: 100, label: "Star", labelAf: "Ster", color: "text-cyan-400", samplingBoost: -0.20, difficulty: "hard" }
} as const;

export const EXAM_STRUCTURE = {
  totalMarks: 150,
  duration: 180,
  sections: {
    A: { name: "Multiple Choice", nameAf: "Meervoudige Keuse", marks: 40, questions: 20, marksPerQ: 2 },
    B: { name: "Case Studies", nameAf: "Gevallestudies", marks: 80, questions: 3, breakdown: [30, 25, 25] },
    C: { name: "Essay", nameAf: "Opstel", marks: 30, questions: 2, choose: 1 }
  }
} as const;

export const REFERENCES = {
  disclaimer: "This mock examination is CAPS-aligned and informed by analysis of DBE NSC Business Studies examination papers (2016\u20132025). All questions are original and simulated based on 10 years of DBE patterns.",
  disclaimerAf: "Hierdie proefeksamen is CAPS-belyn en ingelig deur ontleding van DBO NSC Besigheidstudies eksamenvraestelle (2016\u20132025). Alle vrae is oorspronklik en gesimuleer gebaseer op 10 jaar se DBO-patrone.",
  sources: [
    "https://www.education.gov.za/Curriculum/CAPS.aspx",
    "https://www.education.gov.za/Examinations/PastExamPapers.aspx",
    "https://www.education.gov.za/2024NSCNovemberpastpapers.aspx"
  ]
};
