// NSC October/November 2026 Official Exam Timetable
// VERIFIED 2026-07-19 against the official DBE timetable PDF:
//   "OCTOBER/NOVEMBER 2026 NATIONAL SENIOR CERTIFICATE (NSC) EXAMINATIONS TIMETABLE"
//   Revision: FINAL — February 2026
//   Source: https://www.westerncape.gov.za/education/files/wcg-blob-files?file=2026-03%2Foct-nov-2026-nsc-timetable-final-february-2026.pdf&type=file
// Every date, session (09:00/14:00) and duration below is transcribed from that PDF.
// Scope: subjects BrainTrack supports (see SUBJECT_NAME_MAPPINGS). Rare languages
// (Hindi, German, Portuguese, Latin, SASL, etc.) and niche subjects (Maritime
// Economics, Nautical Science, Equine Studies, ...) are intentionally omitted.
// CAT/IT P1 rewrite practicals (26/11) and LO CAT (1 Sep / 12 Oct) are also omitted.
// Finals window: first paper Tue 13 Oct 2026 09:00; last seeded paper Wed 25 Nov 2026.
// Non-examination days: 03/11, 04/11, 05/11, 09/11 (per the official PDF).
// Naming: "Drama" below corresponds to the official DBE subject "Dramatic Arts".

export interface TimetableEntry {
  examDate: string; // YYYY-MM-DD
  startTime: string; // "09:00" or "14:00"
  durationMinutes: number;
  subjectName: string;
  paperNumber: number;
  isNonExaminationDay: boolean;
  notes?: string;
  session?: "November" | "Preliminary";
}

export const NON_EXAMINATION_DAYS_2026 = [
  "2026-11-03",
  "2026-11-04",
  "2026-11-05",
  "2026-11-09",
];

export const NSC_2026_TIMETABLE: TimetableEntry[] = [
  // === WEEK 1: 12–16 October 2026 ===
  // Tuesday 13 October
  { examDate: "2026-10-13", startTime: "09:00", durationMinutes: 180, subjectName: "Computer Applications Technology", paperNumber: 1, isNonExaminationDay: false, notes: "Practical" },

  // Wednesday 14 October
  { examDate: "2026-10-14", startTime: "09:00", durationMinutes: 180, subjectName: "Information Technology", paperNumber: 1, isNonExaminationDay: false, notes: "Practical" },

  // Thursday 15 October
  { examDate: "2026-10-15", startTime: "09:00", durationMinutes: 180, subjectName: "English Home Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-15", startTime: "09:00", durationMinutes: 150, subjectName: "English First Additional Language", paperNumber: 3, isNonExaminationDay: false },

  // Friday 16 October
  { examDate: "2026-10-16", startTime: "09:00", durationMinutes: 120, subjectName: "Economics", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-16", startTime: "09:00", durationMinutes: 180, subjectName: "Mechanical Technology", paperNumber: 1, isNonExaminationDay: false, notes: "Single paper covering all specialisations" },
  { examDate: "2026-10-16", startTime: "14:00", durationMinutes: 180, subjectName: "Design", paperNumber: 1, isNonExaminationDay: false },

  // === WEEK 2: 19–23 October 2026 ===
  // Monday 19 October
  { examDate: "2026-10-19", startTime: "09:00", durationMinutes: 180, subjectName: "IsiZulu Home Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-19", startTime: "09:00", durationMinutes: 180, subjectName: "IsiXhosa Home Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-19", startTime: "09:00", durationMinutes: 180, subjectName: "Siswati Home Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-19", startTime: "09:00", durationMinutes: 180, subjectName: "IsiNdebele Home Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-19", startTime: "09:00", durationMinutes: 150, subjectName: "IsiZulu First Additional Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-19", startTime: "14:00", durationMinutes: 150, subjectName: "Agricultural Sciences", paperNumber: 1, isNonExaminationDay: false },

  // Tuesday 20 October
  { examDate: "2026-10-20", startTime: "09:00", durationMinutes: 180, subjectName: "Afrikaans Home Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-20", startTime: "09:00", durationMinutes: 150, subjectName: "Afrikaans First Additional Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-20", startTime: "14:00", durationMinutes: 180, subjectName: "History", paperNumber: 1, isNonExaminationDay: false },

  // Wednesday 21 October
  { examDate: "2026-10-21", startTime: "09:00", durationMinutes: 180, subjectName: "Sepedi Home Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-21", startTime: "09:00", durationMinutes: 180, subjectName: "Sesotho Home Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-21", startTime: "09:00", durationMinutes: 180, subjectName: "Setswana Home Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-21", startTime: "09:00", durationMinutes: 180, subjectName: "Xitsonga Home Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-21", startTime: "09:00", durationMinutes: 180, subjectName: "Tshivenda Home Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-21", startTime: "14:00", durationMinutes: 180, subjectName: "Information Technology", paperNumber: 2, isNonExaminationDay: false, notes: "Theory" },

  // Thursday 22 October
  { examDate: "2026-10-22", startTime: "09:00", durationMinutes: 120, subjectName: "Accounting", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-22", startTime: "14:00", durationMinutes: 180, subjectName: "Engineering Graphics and Design", paperNumber: 1, isNonExaminationDay: false },

  // Friday 23 October
  { examDate: "2026-10-23", startTime: "09:00", durationMinutes: 180, subjectName: "Mathematics", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-23", startTime: "09:00", durationMinutes: 180, subjectName: "Mathematical Literacy", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-23", startTime: "09:00", durationMinutes: 180, subjectName: "Technical Mathematics", paperNumber: 1, isNonExaminationDay: false },

  // === WEEK 3: 26–30 October 2026 ===
  // Monday 26 October
  { examDate: "2026-10-26", startTime: "09:00", durationMinutes: 180, subjectName: "Mathematics", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-10-26", startTime: "09:00", durationMinutes: 180, subjectName: "Mathematical Literacy", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-10-26", startTime: "09:00", durationMinutes: 180, subjectName: "Technical Mathematics", paperNumber: 2, isNonExaminationDay: false },

  // Tuesday 27 October
  { examDate: "2026-10-27", startTime: "09:00", durationMinutes: 120, subjectName: "Sepedi Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-27", startTime: "09:00", durationMinutes: 120, subjectName: "Sesotho Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-27", startTime: "09:00", durationMinutes: 120, subjectName: "Setswana Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-27", startTime: "09:00", durationMinutes: 120, subjectName: "Xitsonga Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-27", startTime: "09:00", durationMinutes: 120, subjectName: "Tshivenda Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-27", startTime: "14:00", durationMinutes: 180, subjectName: "Engineering Graphics and Design", paperNumber: 2, isNonExaminationDay: false },

  // Wednesday 28 October
  { examDate: "2026-10-28", startTime: "09:00", durationMinutes: 120, subjectName: "English Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-28", startTime: "09:00", durationMinutes: 120, subjectName: "English First Additional Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-28", startTime: "14:00", durationMinutes: 120, subjectName: "Accounting", paperNumber: 2, isNonExaminationDay: false },

  // Thursday 29 October
  { examDate: "2026-10-29", startTime: "09:00", durationMinutes: 180, subjectName: "Geography", paperNumber: 1, isNonExaminationDay: false, notes: "Climate and Weather, Geomorphology and Map Work" },
  { examDate: "2026-10-29", startTime: "14:00", durationMinutes: 180, subjectName: "Computer Applications Technology", paperNumber: 2, isNonExaminationDay: false, notes: "Theory" },

  // Friday 30 October
  { examDate: "2026-10-30", startTime: "09:00", durationMinutes: 180, subjectName: "Physical Sciences", paperNumber: 1, isNonExaminationDay: false, notes: "Physics" },
  { examDate: "2026-10-30", startTime: "09:00", durationMinutes: 180, subjectName: "Technical Sciences", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-30", startTime: "14:00", durationMinutes: 180, subjectName: "Tourism", paperNumber: 1, isNonExaminationDay: false },

  // === WEEK 4: 2–6 November 2026 ===
  // Monday 2 November
  { examDate: "2026-11-02", startTime: "09:00", durationMinutes: 180, subjectName: "Physical Sciences", paperNumber: 2, isNonExaminationDay: false, notes: "Chemistry" },
  { examDate: "2026-11-02", startTime: "09:00", durationMinutes: 90, subjectName: "Technical Sciences", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-02", startTime: "14:00", durationMinutes: 120, subjectName: "Religion Studies", paperNumber: 1, isNonExaminationDay: false },

  // 3 November — Tuesday (NON-EXAMINATION DAY)
  { examDate: "2026-11-03", startTime: "09:00", durationMinutes: 0, subjectName: "Non-Examination Day", paperNumber: 0, isNonExaminationDay: true, notes: "Catch-up and planning day" },

  // 4 November — Wednesday (NON-EXAMINATION DAY)
  { examDate: "2026-11-04", startTime: "09:00", durationMinutes: 0, subjectName: "Non-Examination Day", paperNumber: 0, isNonExaminationDay: true, notes: "Catch-up and planning day" },

  // 5 November — Thursday (NON-EXAMINATION DAY)
  { examDate: "2026-11-05", startTime: "09:00", durationMinutes: 0, subjectName: "Non-Examination Day", paperNumber: 0, isNonExaminationDay: true, notes: "Catch-up and planning day" },

  // Friday 6 November
  { examDate: "2026-11-06", startTime: "09:00", durationMinutes: 120, subjectName: "IsiZulu Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-06", startTime: "09:00", durationMinutes: 120, subjectName: "IsiXhosa Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-06", startTime: "09:00", durationMinutes: 120, subjectName: "Siswati Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-06", startTime: "09:00", durationMinutes: 120, subjectName: "IsiNdebele Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-06", startTime: "09:00", durationMinutes: 120, subjectName: "IsiZulu First Additional Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-06", startTime: "14:00", durationMinutes: 180, subjectName: "Consumer Studies", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-06", startTime: "14:00", durationMinutes: 180, subjectName: "Hospitality Studies", paperNumber: 1, isNonExaminationDay: false },

  // === WEEK 5: 9–13 November 2026 ===
  // 9 November — Monday (NON-EXAMINATION DAY)
  { examDate: "2026-11-09", startTime: "09:00", durationMinutes: 0, subjectName: "Non-Examination Day", paperNumber: 0, isNonExaminationDay: true, notes: "Catch-up and planning day" },

  // Tuesday 10 November
  { examDate: "2026-11-10", startTime: "09:00", durationMinutes: 150, subjectName: "IsiZulu Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-10", startTime: "09:00", durationMinutes: 150, subjectName: "IsiXhosa Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-10", startTime: "09:00", durationMinutes: 150, subjectName: "Siswati Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-10", startTime: "09:00", durationMinutes: 150, subjectName: "IsiNdebele Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-10", startTime: "09:00", durationMinutes: 150, subjectName: "IsiZulu First Additional Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-10", startTime: "14:00", durationMinutes: 180, subjectName: "Electrical Technology", paperNumber: 1, isNonExaminationDay: false, notes: "Single paper covering all specialisations" },

  // Wednesday 11 November
  { examDate: "2026-11-11", startTime: "09:00", durationMinutes: 120, subjectName: "Afrikaans Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-11", startTime: "09:00", durationMinutes: 120, subjectName: "Afrikaans First Additional Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-11", startTime: "14:00", durationMinutes: 120, subjectName: "Business Studies", paperNumber: 1, isNonExaminationDay: false },

  // Thursday 12 November
  { examDate: "2026-11-12", startTime: "09:00", durationMinutes: 180, subjectName: "Geography", paperNumber: 2, isNonExaminationDay: false, notes: "Rural and Urban Settlements, Economic Geography of SA and Map Work" },
  { examDate: "2026-11-12", startTime: "14:00", durationMinutes: 120, subjectName: "Religion Studies", paperNumber: 2, isNonExaminationDay: false },

  // Friday 13 November
  { examDate: "2026-11-13", startTime: "09:00", durationMinutes: 150, subjectName: "Life Sciences", paperNumber: 1, isNonExaminationDay: false },

  // === WEEK 6: 16–20 November 2026 ===
  // Monday 16 November
  { examDate: "2026-11-16", startTime: "09:00", durationMinutes: 150, subjectName: "Life Sciences", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-16", startTime: "14:00", durationMinutes: 180, subjectName: "Drama", paperNumber: 1, isNonExaminationDay: false, notes: "Official DBE subject name: Dramatic Arts" },
  { examDate: "2026-11-16", startTime: "14:00", durationMinutes: 180, subjectName: "Civil Technology", paperNumber: 1, isNonExaminationDay: false, notes: "Single paper covering all specialisations" },

  // Tuesday 17 November
  { examDate: "2026-11-17", startTime: "09:00", durationMinutes: 150, subjectName: "Sepedi Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-17", startTime: "09:00", durationMinutes: 150, subjectName: "Sesotho Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-17", startTime: "09:00", durationMinutes: 150, subjectName: "Setswana Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-17", startTime: "09:00", durationMinutes: 150, subjectName: "Xitsonga Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-17", startTime: "09:00", durationMinutes: 150, subjectName: "Tshivenda Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-17", startTime: "14:00", durationMinutes: 150, subjectName: "Agricultural Sciences", paperNumber: 2, isNonExaminationDay: false },

  // Wednesday 18 November
  { examDate: "2026-11-18", startTime: "09:00", durationMinutes: 120, subjectName: "Business Studies", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-18", startTime: "14:00", durationMinutes: 180, subjectName: "Visual Arts", paperNumber: 1, isNonExaminationDay: false },

  // Thursday 19 November
  { examDate: "2026-11-19", startTime: "09:00", durationMinutes: 150, subjectName: "English Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-19", startTime: "09:00", durationMinutes: 150, subjectName: "English First Additional Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-19", startTime: "14:00", durationMinutes: 180, subjectName: "History", paperNumber: 2, isNonExaminationDay: false },

  // Friday 20 November
  { examDate: "2026-11-20", startTime: "09:00", durationMinutes: 150, subjectName: "Afrikaans Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-20", startTime: "09:00", durationMinutes: 150, subjectName: "Afrikaans First Additional Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-20", startTime: "14:00", durationMinutes: 120, subjectName: "Economics", paperNumber: 2, isNonExaminationDay: false },

  // === WEEK 7: 23–27 November 2026 ===
  // Monday 23 November
  { examDate: "2026-11-23", startTime: "14:00", durationMinutes: 180, subjectName: "Music", paperNumber: 1, isNonExaminationDay: false, notes: "Theory" },

  // Tuesday 24 November
  { examDate: "2026-11-24", startTime: "14:00", durationMinutes: 180, subjectName: "Dance Studies", paperNumber: 1, isNonExaminationDay: false },

  // Wednesday 25 November
  { examDate: "2026-11-25", startTime: "09:00", durationMinutes: 90, subjectName: "Music", paperNumber: 2, isNonExaminationDay: false, notes: "Comprehension" },
];

// === PRELIMINARY EXAMS (AUG–SEPT 2026) ===
// Source: SACAI 2026 FINAL PRELIMINARY EXAMINATION TIMETABLE GR 12
// Registration No. 2011/100445/08 — sacai.org.za
// Corrections applied: English HL P1, English FAL P1, IT P2 moved to 25 Aug.
export const NSC_2026_PRELIMINARY_TIMETABLE: TimetableEntry[] = [
  // === WEEK 1: 17–21 August 2026 ===
  // Mon 17 Aug
  { session: "Preliminary", examDate: "2026-08-17", startTime: "09:00", durationMinutes: 180, subjectName: "Computer Applications Technology", paperNumber: 1, isNonExaminationDay: false, notes: "PRACTICAL" },
  { session: "Preliminary", examDate: "2026-08-17", startTime: "14:00", durationMinutes: 180, subjectName: "Information Technology", paperNumber: 1, isNonExaminationDay: false, notes: "PRACTICAL" },
  // Tue 18 Aug
  { session: "Preliminary", examDate: "2026-08-18", startTime: "09:00", durationMinutes: 180, subjectName: "Afrikaans Home Language", paperNumber: 3, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-08-18", startTime: "09:00", durationMinutes: 150, subjectName: "Afrikaans First Additional Language", paperNumber: 3, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-08-18", startTime: "14:00", durationMinutes: 180, subjectName: "Tourism", paperNumber: 1, isNonExaminationDay: false },
  // Wed 19 Aug
  { session: "Preliminary", examDate: "2026-08-19", startTime: "09:00", durationMinutes: 120, subjectName: "Business Studies", paperNumber: 1, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-08-19", startTime: "14:00", durationMinutes: 180, subjectName: "Geography", paperNumber: 1, isNonExaminationDay: false },
  // Thu 20 Aug
  { session: "Preliminary", examDate: "2026-08-20", startTime: "09:00", durationMinutes: 180, subjectName: "English Home Language", paperNumber: 3, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-08-20", startTime: "09:00", durationMinutes: 150, subjectName: "English First Additional Language", paperNumber: 3, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-08-20", startTime: "14:00", durationMinutes: 180, subjectName: "Computer Applications Technology", paperNumber: 2, isNonExaminationDay: false, notes: "THEORY" },
  // Fri 21 Aug
  { session: "Preliminary", examDate: "2026-08-21", startTime: "09:00", durationMinutes: 180, subjectName: "Physical Sciences", paperNumber: 1, isNonExaminationDay: false },

  // === WEEK 2: 24–28 August 2026 ===
  // Mon 24 Aug
  { session: "Preliminary", examDate: "2026-08-24", startTime: "09:00", durationMinutes: 180, subjectName: "Physical Sciences", paperNumber: 2, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-08-24", startTime: "14:00", durationMinutes: 180, subjectName: "History", paperNumber: 1, isNonExaminationDay: false },
  // Tue 25 Aug — CORRECTIONS: English P1 and IT P2 moved here
  { session: "Preliminary", examDate: "2026-08-25", startTime: "09:00", durationMinutes: 180, subjectName: "Information Technology", paperNumber: 2, isNonExaminationDay: false, notes: "THEORY" },
  { session: "Preliminary", examDate: "2026-08-25", startTime: "14:00", durationMinutes: 120, subjectName: "English Home Language", paperNumber: 1, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-08-25", startTime: "14:00", durationMinutes: 120, subjectName: "English First Additional Language", paperNumber: 1, isNonExaminationDay: false },
  // Wed 26 Aug
  { session: "Preliminary", examDate: "2026-08-26", startTime: "09:00", durationMinutes: 120, subjectName: "Economics", paperNumber: 1, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-08-26", startTime: "14:00", durationMinutes: 180, subjectName: "Consumer Studies", paperNumber: 1, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-08-26", startTime: "14:00", durationMinutes: 180, subjectName: "Hospitality Studies", paperNumber: 1, isNonExaminationDay: false },
  // Thu 27 Aug
  { session: "Preliminary", examDate: "2026-08-27", startTime: "09:00", durationMinutes: 150, subjectName: "Life Orientation", paperNumber: 1, isNonExaminationDay: false },
  // Fri 28 Aug
  { session: "Preliminary", examDate: "2026-08-28", startTime: "09:00", durationMinutes: 180, subjectName: "Mathematics", paperNumber: 1, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-08-28", startTime: "09:00", durationMinutes: 180, subjectName: "Mathematical Literacy", paperNumber: 1, isNonExaminationDay: false },

  // === WEEK 3: 31 August – 4 September 2026 ===
  // Mon 31 Aug
  { session: "Preliminary", examDate: "2026-08-31", startTime: "09:00", durationMinutes: 180, subjectName: "Mathematics", paperNumber: 2, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-08-31", startTime: "09:00", durationMinutes: 180, subjectName: "Mathematical Literacy", paperNumber: 2, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-08-31", startTime: "14:00", durationMinutes: 150, subjectName: "IsiZulu First Additional Language", paperNumber: 3, isNonExaminationDay: false },
  // Tue 1 Sep
  { session: "Preliminary", examDate: "2026-09-01", startTime: "09:00", durationMinutes: 150, subjectName: "English Home Language", paperNumber: 2, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-09-01", startTime: "09:00", durationMinutes: 150, subjectName: "English First Additional Language", paperNumber: 2, isNonExaminationDay: false },
  // Wed 2 Sep
  { session: "Preliminary", examDate: "2026-09-02", startTime: "09:00", durationMinutes: 120, subjectName: "Business Studies", paperNumber: 2, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-09-02", startTime: "14:00", durationMinutes: 180, subjectName: "History", paperNumber: 2, isNonExaminationDay: false },
  // Thu 3 Sep
  { session: "Preliminary", examDate: "2026-09-03", startTime: "09:00", durationMinutes: 120, subjectName: "Afrikaans Home Language", paperNumber: 1, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-09-03", startTime: "09:00", durationMinutes: 120, subjectName: "Afrikaans First Additional Language", paperNumber: 1, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-09-03", startTime: "14:00", durationMinutes: 120, subjectName: "Accounting", paperNumber: 1, isNonExaminationDay: false },
  // Fri 4 Sep
  { session: "Preliminary", examDate: "2026-09-04", startTime: "09:00", durationMinutes: 150, subjectName: "Life Sciences", paperNumber: 1, isNonExaminationDay: false },

  // === WEEK 4: 7–10 September 2026 ===
  // Mon 7 Sep
  { session: "Preliminary", examDate: "2026-09-07", startTime: "09:00", durationMinutes: 150, subjectName: "Life Sciences", paperNumber: 2, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-09-07", startTime: "14:00", durationMinutes: 120, subjectName: "IsiZulu First Additional Language", paperNumber: 1, isNonExaminationDay: false },
  // Tue 8 Sep
  { session: "Preliminary", examDate: "2026-09-08", startTime: "09:00", durationMinutes: 150, subjectName: "Afrikaans Home Language", paperNumber: 2, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-09-08", startTime: "09:00", durationMinutes: 150, subjectName: "Afrikaans First Additional Language", paperNumber: 2, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-09-08", startTime: "14:00", durationMinutes: 180, subjectName: "Geography", paperNumber: 2, isNonExaminationDay: false },
  // Wed 9 Sep
  { session: "Preliminary", examDate: "2026-09-09", startTime: "09:00", durationMinutes: 120, subjectName: "Economics", paperNumber: 2, isNonExaminationDay: false },
  // Thu 10 Sep
  { session: "Preliminary", examDate: "2026-09-10", startTime: "09:00", durationMinutes: 150, subjectName: "IsiZulu First Additional Language", paperNumber: 2, isNonExaminationDay: false },
  { session: "Preliminary", examDate: "2026-09-10", startTime: "14:00", durationMinutes: 120, subjectName: "Accounting", paperNumber: 2, isNonExaminationDay: false },
];

// Subject name mappings: timetable name → internal BrainTrack name variations
// These help auto-match when building learner schedules
export const SUBJECT_NAME_MAPPINGS: Array<{ timetableName: string; aliases: string[] }> = [
  { timetableName: "Mathematics", aliases: ["Mathematics", "Maths", "Math", "Wiskunde"] },
  { timetableName: "Mathematical Literacy", aliases: ["Mathematical Literacy", "Maths Literacy", "Math Literacy", "Wiskundige Geletterdheid"] },
  { timetableName: "Physical Sciences", aliases: ["Physical Sciences", "Physical Science", "Fisiese Wetenskappe"] },
  { timetableName: "Life Sciences", aliases: ["Life Sciences", "Life Science", "Lewenswetenskappe", "Biology"] },
  { timetableName: "Accounting", aliases: ["Accounting", "Rekeningkunde"] },
  { timetableName: "Business Studies", aliases: ["Business Studies", "Besigheidstudies"] },
  { timetableName: "Economics", aliases: ["Economics", "Ekonomie"] },
  { timetableName: "Geography", aliases: ["Geography", "Geografie"] },
  { timetableName: "History", aliases: ["History", "Geskiedenis"] },
  { timetableName: "English Home Language", aliases: ["English Home Language", "English HL", "Engels Huistaal"] },
  { timetableName: "English First Additional Language", aliases: ["English First Additional Language", "English FAL", "Engels EAT"] },
  { timetableName: "Afrikaans Home Language", aliases: ["Afrikaans Home Language", "Afrikaans HL", "Afrikaans Huistaal"] },
  { timetableName: "Afrikaans First Additional Language", aliases: ["Afrikaans First Additional Language", "Afrikaans FAL", "Afrikaans EAT"] },
  { timetableName: "Computer Applications Technology", aliases: ["Computer Applications Technology", "CAT", "Rekenaartoepassingstegnologie"] },
  { timetableName: "Information Technology", aliases: ["Information Technology", "IT", "Inligtingstegnologie"] },
  { timetableName: "Tourism", aliases: ["Tourism", "Toerisme"] },
  { timetableName: "Consumer Studies", aliases: ["Consumer Studies", "Verbruikerstudies"] },
  { timetableName: "Agricultural Sciences", aliases: ["Agricultural Sciences", "Landbouwetenskappe"] },
  { timetableName: "Engineering Graphics and Design", aliases: ["Engineering Graphics and Design", "EGD"] },
  { timetableName: "Hospitality Studies", aliases: ["Hospitality Studies", "Gasvryheid Studie"] },
  { timetableName: "Music", aliases: ["Music", "Musiek"] },
  { timetableName: "Visual Arts", aliases: ["Visual Arts", "Visuele Kuns"] },
  { timetableName: "IsiZulu Home Language", aliases: ["IsiZulu Home Language", "IsiZulu HL", "Zulu"] },
  { timetableName: "IsiZulu First Additional Language", aliases: ["IsiZulu First Additional Language", "IsiZulu FAL", "isiZulu FAL", "Zulu FAL"] },
  { timetableName: "IsiXhosa Home Language", aliases: ["IsiXhosa Home Language", "IsiXhosa HL", "Xhosa"] },
  { timetableName: "Sesotho Home Language", aliases: ["Sesotho Home Language", "Sesotho HL"] },
  { timetableName: "Setswana Home Language", aliases: ["Setswana Home Language", "Setswana HL"] },
  { timetableName: "Sepedi Home Language", aliases: ["Sepedi Home Language", "Sepedi HL"] },
  { timetableName: "Tshivenda Home Language", aliases: ["Tshivenda Home Language", "Tshivenda HL"] },
  { timetableName: "Xitsonga Home Language", aliases: ["Xitsonga Home Language", "Xitsonga HL"] },
  { timetableName: "Siswati Home Language", aliases: ["Siswati Home Language", "Siswati HL"] },
  { timetableName: "IsiNdebele Home Language", aliases: ["IsiNdebele Home Language", "IsiNdebele HL"] },
  { timetableName: "Electrical Technology", aliases: ["Electrical Technology", "Elektriese Tegnologie"] },
  { timetableName: "Mechanical Technology", aliases: ["Mechanical Technology", "Meganiese Tegnologie"] },
  { timetableName: "Civil Technology", aliases: ["Civil Technology", "Siviele Tegnologie"] },
  { timetableName: "Religion Studies", aliases: ["Religion Studies", "Godsdienstudies"] },
  { timetableName: "Drama", aliases: ["Drama", "Dramatic Arts", "Dramatiese Kunste"] },
  { timetableName: "Technical Mathematics", aliases: ["Technical Mathematics", "Tegniese Wiskunde"] },
  { timetableName: "Technical Sciences", aliases: ["Technical Sciences", "Tegniese Wetenskappe"] },
  { timetableName: "Design", aliases: ["Design", "Ontwerp"] },
  { timetableName: "Dance Studies", aliases: ["Dance Studies", "Dansstudies"] },
];
