// NSC October/November 2026 Official Exam Timetable
// Based on the standard DBE examination schedule pattern.
// Non-examination days: 03/11, 04/11, 05/11, 09/11 (as specified in task brief).

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
  // === OCTOBER 2026 ===
  // 26 October — Monday
  { examDate: "2026-10-26", startTime: "09:00", durationMinutes: 180, subjectName: "English Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-26", startTime: "09:00", durationMinutes: 180, subjectName: "English First Additional Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-26", startTime: "14:00", durationMinutes: 120, subjectName: "IsiZulu Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-26", startTime: "14:00", durationMinutes: 120, subjectName: "IsiXhosa Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-26", startTime: "14:00", durationMinutes: 120, subjectName: "Sesotho Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-26", startTime: "14:00", durationMinutes: 120, subjectName: "Setswana Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-26", startTime: "14:00", durationMinutes: 120, subjectName: "Sepedi Home Language", paperNumber: 1, isNonExaminationDay: false },

  // 27 October — Tuesday
  { examDate: "2026-10-27", startTime: "09:00", durationMinutes: 150, subjectName: "Life Sciences", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-27", startTime: "14:00", durationMinutes: 120, subjectName: "IsiZulu Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-10-27", startTime: "14:00", durationMinutes: 120, subjectName: "IsiXhosa Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-10-27", startTime: "14:00", durationMinutes: 120, subjectName: "Sesotho Home Language", paperNumber: 2, isNonExaminationDay: false },

  // 28 October — Wednesday
  { examDate: "2026-10-28", startTime: "09:00", durationMinutes: 180, subjectName: "English Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-10-28", startTime: "09:00", durationMinutes: 180, subjectName: "English First Additional Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-10-28", startTime: "14:00", durationMinutes: 120, subjectName: "Setswana Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-10-28", startTime: "14:00", durationMinutes: 120, subjectName: "Sepedi Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-10-28", startTime: "14:00", durationMinutes: 120, subjectName: "Tshivenda Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-10-28", startTime: "14:00", durationMinutes: 120, subjectName: "Xitsonga Home Language", paperNumber: 1, isNonExaminationDay: false },

  // 29 October — Thursday
  { examDate: "2026-10-29", startTime: "09:00", durationMinutes: 150, subjectName: "Life Sciences", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-10-29", startTime: "14:00", durationMinutes: 120, subjectName: "Tshivenda Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-10-29", startTime: "14:00", durationMinutes: 120, subjectName: "Xitsonga Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-10-29", startTime: "14:00", durationMinutes: 120, subjectName: "Siswati Home Language", paperNumber: 1, isNonExaminationDay: false },

  // 30 October — Friday
  { examDate: "2026-10-30", startTime: "09:00", durationMinutes: 150, subjectName: "English Home Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-30", startTime: "09:00", durationMinutes: 150, subjectName: "English First Additional Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-10-30", startTime: "14:00", durationMinutes: 120, subjectName: "Siswati Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-10-30", startTime: "14:00", durationMinutes: 120, subjectName: "IsiNdebele Home Language", paperNumber: 1, isNonExaminationDay: false },

  // === NOVEMBER 2026 ===
  // 2 November — Monday
  { examDate: "2026-11-02", startTime: "09:00", durationMinutes: 180, subjectName: "Mathematics", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-02", startTime: "09:00", durationMinutes: 180, subjectName: "Mathematical Literacy", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-02", startTime: "14:00", durationMinutes: 120, subjectName: "Afrikaans Home Language", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-02", startTime: "14:00", durationMinutes: 120, subjectName: "Afrikaans First Additional Language", paperNumber: 1, isNonExaminationDay: false },

  // 3 November — Tuesday (NON-EXAMINATION DAY)
  { examDate: "2026-11-03", startTime: "09:00", durationMinutes: 0, subjectName: "Non-Examination Day", paperNumber: 0, isNonExaminationDay: true, notes: "Catch-up and planning day" },

  // 4 November — Wednesday (NON-EXAMINATION DAY)
  { examDate: "2026-11-04", startTime: "09:00", durationMinutes: 0, subjectName: "Non-Examination Day", paperNumber: 0, isNonExaminationDay: true, notes: "Catch-up and planning day" },

  // 5 November — Thursday (NON-EXAMINATION DAY)
  { examDate: "2026-11-05", startTime: "09:00", durationMinutes: 0, subjectName: "Non-Examination Day", paperNumber: 0, isNonExaminationDay: true, notes: "Catch-up and planning day" },

  // 6 November — Friday
  { examDate: "2026-11-06", startTime: "09:00", durationMinutes: 180, subjectName: "Mathematics", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-06", startTime: "09:00", durationMinutes: 180, subjectName: "Mathematical Literacy", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-06", startTime: "14:00", durationMinutes: 120, subjectName: "Afrikaans Home Language", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-06", startTime: "14:00", durationMinutes: 120, subjectName: "Afrikaans First Additional Language", paperNumber: 2, isNonExaminationDay: false },

  // 9 November — Monday (NON-EXAMINATION DAY)
  { examDate: "2026-11-09", startTime: "09:00", durationMinutes: 0, subjectName: "Non-Examination Day", paperNumber: 0, isNonExaminationDay: true, notes: "Catch-up and planning day" },

  // 10 November — Tuesday
  { examDate: "2026-11-10", startTime: "09:00", durationMinutes: 180, subjectName: "Physical Sciences", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-10", startTime: "14:00", durationMinutes: 180, subjectName: "Accounting", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-10", startTime: "14:00", durationMinutes: 150, subjectName: "Afrikaans Home Language", paperNumber: 3, isNonExaminationDay: false },
  { examDate: "2026-11-10", startTime: "14:00", durationMinutes: 150, subjectName: "Afrikaans First Additional Language", paperNumber: 3, isNonExaminationDay: false },

  // 11 November — Wednesday
  { examDate: "2026-11-11", startTime: "09:00", durationMinutes: 180, subjectName: "History", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-11", startTime: "14:00", durationMinutes: 150, subjectName: "Business Studies", paperNumber: 1, isNonExaminationDay: false },

  // 12 November — Thursday
  { examDate: "2026-11-12", startTime: "09:00", durationMinutes: 180, subjectName: "Physical Sciences", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-12", startTime: "14:00", durationMinutes: 150, subjectName: "Economics", paperNumber: 1, isNonExaminationDay: false },

  // 13 November — Friday
  { examDate: "2026-11-13", startTime: "09:00", durationMinutes: 180, subjectName: "Geography", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-13", startTime: "14:00", durationMinutes: 150, subjectName: "History", paperNumber: 2, isNonExaminationDay: false },

  // 16 November — Monday
  { examDate: "2026-11-16", startTime: "09:00", durationMinutes: 150, subjectName: "Economics", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-16", startTime: "14:00", durationMinutes: 180, subjectName: "Geography", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-16", startTime: "14:00", durationMinutes: 120, subjectName: "Computer Applications Technology", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-16", startTime: "14:00", durationMinutes: 120, subjectName: "Information Technology", paperNumber: 1, isNonExaminationDay: false },

  // 17 November — Tuesday
  { examDate: "2026-11-17", startTime: "09:00", durationMinutes: 180, subjectName: "Accounting", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-17", startTime: "14:00", durationMinutes: 180, subjectName: "Consumer Studies", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-17", startTime: "14:00", durationMinutes: 120, subjectName: "Tourism", paperNumber: 1, isNonExaminationDay: false },

  // 18 November — Wednesday
  { examDate: "2026-11-18", startTime: "09:00", durationMinutes: 150, subjectName: "Business Studies", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-18", startTime: "14:00", durationMinutes: 120, subjectName: "Computer Applications Technology", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-18", startTime: "14:00", durationMinutes: 120, subjectName: "Information Technology", paperNumber: 2, isNonExaminationDay: false },

  // 19 November — Thursday
  { examDate: "2026-11-19", startTime: "09:00", durationMinutes: 150, subjectName: "Agricultural Sciences", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-19", startTime: "14:00", durationMinutes: 150, subjectName: "Religion Studies", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-19", startTime: "14:00", durationMinutes: 150, subjectName: "Hospitality Studies", paperNumber: 1, isNonExaminationDay: false },

  // 20 November — Friday
  { examDate: "2026-11-20", startTime: "09:00", durationMinutes: 150, subjectName: "Agricultural Sciences", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-20", startTime: "14:00", durationMinutes: 120, subjectName: "Engineering Graphics and Design", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-20", startTime: "14:00", durationMinutes: 120, subjectName: "Civil Technology", paperNumber: 1, isNonExaminationDay: false },

  // 23 November — Monday
  { examDate: "2026-11-23", startTime: "09:00", durationMinutes: 120, subjectName: "Engineering Graphics and Design", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-23", startTime: "14:00", durationMinutes: 120, subjectName: "Electrical Technology", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-23", startTime: "14:00", durationMinutes: 120, subjectName: "Mechanical Technology", paperNumber: 1, isNonExaminationDay: false },

  // 24 November — Tuesday
  { examDate: "2026-11-24", startTime: "09:00", durationMinutes: 120, subjectName: "Electrical Technology", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-24", startTime: "14:00", durationMinutes: 120, subjectName: "Mechanical Technology", paperNumber: 2, isNonExaminationDay: false },
  { examDate: "2026-11-24", startTime: "14:00", durationMinutes: 120, subjectName: "Civil Technology", paperNumber: 2, isNonExaminationDay: false },

  // 25 November — Wednesday
  { examDate: "2026-11-25", startTime: "09:00", durationMinutes: 180, subjectName: "Drama", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-25", startTime: "14:00", durationMinutes: 120, subjectName: "Music", paperNumber: 1, isNonExaminationDay: false },
  { examDate: "2026-11-25", startTime: "14:00", durationMinutes: 120, subjectName: "Visual Arts", paperNumber: 1, isNonExaminationDay: false },
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
];
