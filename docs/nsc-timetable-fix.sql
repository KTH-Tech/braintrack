-- NSC Oct/Nov 2026 timetable correction — production fix
-- Generated 2026-07-19 from the official DBE timetable PDF, revision FINAL — February 2026:
-- https://www.westerncape.gov.za/education/files/wcg-blob-files?file=2026-03%2Foct-nov-2026-nsc-timetable-final-february-2026.pdf&type=file
-- See docs/nsc-timetable-verification-2026.md for the audit trail.
--
-- The previously seeded November 2026 session was fabricated ("standard pattern") and
-- almost every row was wrong. This script replaces the entire November 2026 session.
-- Preliminary-session rows are left untouched.
--
-- AFTER RUNNING THIS SCRIPT you MUST regenerate learner schedules (the deleted
-- learner_exam_schedule rows reference the old nsc_timetable ids):
--   call regenerateAllLearnerSchedules() via the admin endpoint, or let
--   getLearnerSchedule() rebuild lazily (it rebuilds when a learner's schedule is empty).
-- The deploy carrying the updated server/data/nsc-2026-timetable.ts also backfills the
-- four new timetable_subject_mapping rows (Technical Mathematics, Technical Sciences,
-- Design, Dance Studies) idempotently at startup.

BEGIN;

-- 1. Drop learner schedule rows built from the wrong November rows (FK: nsc_timetable_id)
DELETE FROM learner_exam_schedule
WHERE nsc_timetable_id IN (
  SELECT id FROM nsc_timetable WHERE year = 2026 AND session = 'November'
);

-- 2. Drop the fabricated November session
DELETE FROM nsc_timetable WHERE year = 2026 AND session = 'November';

-- 3. Insert the official November 2026 session (FINAL — February 2026 revision)
INSERT INTO nsc_timetable
  (year, session, exam_date, start_time, duration_minutes, subject_name, paper_number, is_non_examination_day, notes, source)
VALUES
  -- Week 1: 12–16 October
  (2026, 'November', '2026-10-13', '09:00', 180, 'Computer Applications Technology', 1, false, 'Practical', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-14', '09:00', 180, 'Information Technology', 1, false, 'Practical', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-15', '09:00', 180, 'English Home Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-15', '09:00', 150, 'English First Additional Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-16', '09:00', 120, 'Economics', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-16', '09:00', 180, 'Mechanical Technology', 1, false, 'Single paper covering all specialisations', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-16', '14:00', 180, 'Design', 1, false, NULL, 'DBE_OFFICIAL'),
  -- Week 2: 19–23 October
  (2026, 'November', '2026-10-19', '09:00', 180, 'IsiZulu Home Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-19', '09:00', 180, 'IsiXhosa Home Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-19', '09:00', 180, 'Siswati Home Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-19', '09:00', 180, 'IsiNdebele Home Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-19', '09:00', 150, 'IsiZulu First Additional Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-19', '14:00', 150, 'Agricultural Sciences', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-20', '09:00', 180, 'Afrikaans Home Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-20', '09:00', 150, 'Afrikaans First Additional Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-20', '14:00', 180, 'History', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-21', '09:00', 180, 'Sepedi Home Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-21', '09:00', 180, 'Sesotho Home Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-21', '09:00', 180, 'Setswana Home Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-21', '09:00', 180, 'Xitsonga Home Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-21', '09:00', 180, 'Tshivenda Home Language', 3, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-21', '14:00', 180, 'Information Technology', 2, false, 'Theory', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-22', '09:00', 120, 'Accounting', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-22', '14:00', 180, 'Engineering Graphics and Design', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-23', '09:00', 180, 'Mathematics', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-23', '09:00', 180, 'Mathematical Literacy', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-23', '09:00', 180, 'Technical Mathematics', 1, false, NULL, 'DBE_OFFICIAL'),
  -- Week 3: 26–30 October
  (2026, 'November', '2026-10-26', '09:00', 180, 'Mathematics', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-26', '09:00', 180, 'Mathematical Literacy', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-26', '09:00', 180, 'Technical Mathematics', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-27', '09:00', 120, 'Sepedi Home Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-27', '09:00', 120, 'Sesotho Home Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-27', '09:00', 120, 'Setswana Home Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-27', '09:00', 120, 'Xitsonga Home Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-27', '09:00', 120, 'Tshivenda Home Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-27', '14:00', 180, 'Engineering Graphics and Design', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-28', '09:00', 120, 'English Home Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-28', '09:00', 120, 'English First Additional Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-28', '14:00', 120, 'Accounting', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-29', '09:00', 180, 'Geography', 1, false, 'Climate and Weather, Geomorphology and Map Work', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-29', '14:00', 180, 'Computer Applications Technology', 2, false, 'Theory', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-30', '09:00', 180, 'Physical Sciences', 1, false, 'Physics', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-30', '09:00', 180, 'Technical Sciences', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-10-30', '14:00', 180, 'Tourism', 1, false, NULL, 'DBE_OFFICIAL'),
  -- Week 4: 2–6 November
  (2026, 'November', '2026-11-02', '09:00', 180, 'Physical Sciences', 2, false, 'Chemistry', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-02', '09:00', 90, 'Technical Sciences', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-02', '14:00', 120, 'Religion Studies', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-03', '09:00', 0, 'Non-Examination Day', 0, true, 'Catch-up and planning day', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-04', '09:00', 0, 'Non-Examination Day', 0, true, 'Catch-up and planning day', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-05', '09:00', 0, 'Non-Examination Day', 0, true, 'Catch-up and planning day', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-06', '09:00', 120, 'IsiZulu Home Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-06', '09:00', 120, 'IsiXhosa Home Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-06', '09:00', 120, 'Siswati Home Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-06', '09:00', 120, 'IsiNdebele Home Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-06', '09:00', 120, 'IsiZulu First Additional Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-06', '14:00', 180, 'Consumer Studies', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-06', '14:00', 180, 'Hospitality Studies', 1, false, NULL, 'DBE_OFFICIAL'),
  -- Week 5: 9–13 November
  (2026, 'November', '2026-11-09', '09:00', 0, 'Non-Examination Day', 0, true, 'Catch-up and planning day', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-10', '09:00', 150, 'IsiZulu Home Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-10', '09:00', 150, 'IsiXhosa Home Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-10', '09:00', 150, 'Siswati Home Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-10', '09:00', 150, 'IsiNdebele Home Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-10', '09:00', 150, 'IsiZulu First Additional Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-10', '14:00', 180, 'Electrical Technology', 1, false, 'Single paper covering all specialisations', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-11', '09:00', 120, 'Afrikaans Home Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-11', '09:00', 120, 'Afrikaans First Additional Language', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-11', '14:00', 120, 'Business Studies', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-12', '09:00', 180, 'Geography', 2, false, 'Rural and Urban Settlements, Economic Geography of SA and Map Work', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-12', '14:00', 120, 'Religion Studies', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-13', '09:00', 150, 'Life Sciences', 1, false, NULL, 'DBE_OFFICIAL'),
  -- Week 6: 16–20 November
  (2026, 'November', '2026-11-16', '09:00', 150, 'Life Sciences', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-16', '14:00', 180, 'Drama', 1, false, 'Official DBE subject name: Dramatic Arts', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-16', '14:00', 180, 'Civil Technology', 1, false, 'Single paper covering all specialisations', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-17', '09:00', 150, 'Sepedi Home Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-17', '09:00', 150, 'Sesotho Home Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-17', '09:00', 150, 'Setswana Home Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-17', '09:00', 150, 'Xitsonga Home Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-17', '09:00', 150, 'Tshivenda Home Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-17', '14:00', 150, 'Agricultural Sciences', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-18', '09:00', 120, 'Business Studies', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-18', '14:00', 180, 'Visual Arts', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-19', '09:00', 150, 'English Home Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-19', '09:00', 150, 'English First Additional Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-19', '14:00', 180, 'History', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-20', '09:00', 150, 'Afrikaans Home Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-20', '09:00', 150, 'Afrikaans First Additional Language', 2, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-20', '14:00', 120, 'Economics', 2, false, NULL, 'DBE_OFFICIAL'),
  -- Week 7: 23–27 November
  (2026, 'November', '2026-11-23', '14:00', 180, 'Music', 1, false, 'Theory', 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-24', '14:00', 180, 'Dance Studies', 1, false, NULL, 'DBE_OFFICIAL'),
  (2026, 'November', '2026-11-25', '09:00', 90, 'Music', 2, false, 'Comprehension', 'DBE_OFFICIAL');

COMMIT;

-- Sanity checks (expected: 90 rows total, 86 papers, 4 non-exam days)
-- SELECT count(*) FROM nsc_timetable WHERE year = 2026 AND session = 'November';
-- SELECT count(*) FROM nsc_timetable WHERE year = 2026 AND session = 'November' AND is_non_examination_day = false;
-- SELECT min(exam_date), max(exam_date) FROM nsc_timetable WHERE year = 2026 AND session = 'November';  -- 2026-10-13 .. 2026-11-25
