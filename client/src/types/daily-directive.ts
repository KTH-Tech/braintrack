export interface DailyDirective {
  hasExam: boolean;
  subjectName: string;
  subjectNameAf: string;
  subjectId: number | null;
  paperNumber: number | null;
  paperLabel: string | null;
  examDate: string | null;
  startTime: string | null;
  daysUntil: number | null;
  urgencyState: string;
  urgencyLabel: string;
  urgencyLabelAf: string;
  urgencyColor: string;
  message: string;
  messageAf: string;
  deepLink: string;
  weakTopic: { id: number; name: string; nameAfrikaans: string | null; masteryScore: number } | null;
  isExamToday: boolean;
}
