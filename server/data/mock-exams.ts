interface MockExamPaper {
  year: number;
  month: string;
  paperNumber: number;
  language: string;
  paperUrl: string;
  memoUrl: string;
  source: string;
  sourceLink: string;
  section: string;
  totalMarks: number;
  durationMinutes: number;
  isMock: boolean;
  titleEn: string;
  titleAf: string;
}

interface MockExamQuestion {
  questionNumber: string;
  questionTextEn: string;
  questionTextAf: string;
  marks: number;
  cognitiveLevel: string;
  difficulty: string;
  memoTextEn: string;
  memoTextAf: string;
}

interface MockExam {
  paper: MockExamPaper;
  questions: MockExamQuestion[];
}

export const MOCK_EXAMS: MockExam[] = [
  {
    paper: {
      year: 2026,
      month: "March",
      paperNumber: 1,
      language: "English",
      paperUrl: "",
      memoUrl: "",
      source: "BrainTrack Mock",
      sourceLink: "",
      section: "A",
      totalMarks: 100,
      durationMinutes: 120,
      isMock: true,
      titleEn: "Business Studies March Mock P1",
      titleAf: "Besigheidstudies Maart Skyn V1"
    },
    questions: [
      {
        questionNumber: "1.1",
        questionTextEn: "Define the term 'Business Ethics'.",
        questionTextAf: "Definieer die term 'Besigheidsetiek'.",
        marks: 2,
        cognitiveLevel: "knowledge",
        difficulty: "easy",
        memoTextEn: "Business ethics refers to the moral principles that guide the way a business behaves.",
        memoTextAf: "Besigheidsetiek verwys na die morele beginsels wat die manier waarop 'n besigheid optree, lei."
      }
    ]
  }
];
