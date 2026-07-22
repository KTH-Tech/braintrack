/**
 * Runs the Content Studio generators against whatever DATABASE_URL points at.
 * Mirrors the /api/admin/content-studio/* endpoint handlers exactly, so the
 * behaviour is identical to an admin clicking Publish — just scriptable.
 *
 *   MODE=preview  → generate only, NO writes (safe dry run)
 *   MODE=publish  → generate + persist
 *
 * SUBJECTS="Geography,Economics"  (comma list)   or   SUBJECTS=all
 * KINDS="daily,flashcards,examiner,exam"         (which generators to run)
 *
 * The persist functions only ever touch their OWN output tables
 * (subject_daily_challenges, subject_study_tips, flashcards) — never the
 * released dbe_verbatim_questions bank. Deletes are per-subject, transactional.
 */
import {
  generateDailyChallengeMcqs, persistDailyChallengeMcqs,
  generateFlashcardsForSubject, persistFlashcards,
  generateExaminerTips, generateExamTips, persistStudyTips,
  DEFAULT_MODEL,
} from "../server/content-generators";

const MODE = process.env.MODE === "publish" ? "publish" : "preview";
const preview = MODE !== "publish";
const KINDS = (process.env.KINDS ?? "daily,flashcards,examiner,exam").split(",").map(s => s.trim());
const model = DEFAULT_MODEL;

async function targetSubjects(): Promise<string[]> {
  let list: string[];
  if (process.env.SUBJECTS && process.env.SUBJECTS !== "all") {
    list = process.env.SUBJECTS.split(",").map(s => s.trim()).filter(Boolean);
  } else {
    // "all" — every subject with a usable released bank
    const { subjectsWithUsableBank } = await import("../server/content-generators");
    const rows = await subjectsWithUsableBank(40);
    list = rows.map(r => r.subject);
  }
  // Optional sharding so N parallel workers split the list disjointly.
  const wc = Number(process.env.WORKER_COUNT) || 1;
  const wi = Number(process.env.WORKER_INDEX) || 0;
  if (wc > 1) list = list.filter((_, i) => i % wc === wi);
  return list;
}

const log = (...a: any[]) => console.log(`[${MODE}]`, ...a);

(async () => {
  const subjects = await targetSubjects();
  log(`MODE=${MODE} KINDS=${KINDS.join("+")} subjects=${subjects.length}`);
  const totals = { daily: 0, flashcards: 0, examiner: 0, exam: 0 };

  for (const subject of subjects) {
    try {
      if (KINDS.includes("daily")) {
        const r = await generateDailyChallengeMcqs({ subject, count: 15, model });
        const p = !preview && r.mcqs.length ? await persistDailyChallengeMcqs(subject, r.mcqs) : 0;
        totals.daily += p;
        log(`daily   ${subject}: gen=${r.rawCount} accepted=${r.mcqs.length} rejected=${r.rejected.length} persisted=${p}`);
      }
      if (KINDS.includes("flashcards")) {
        const r = await generateFlashcardsForSubject({ subject, limit: 120, model, excludeExisting: !preview });
        const p = !preview && r.rows.length ? await persistFlashcards(r.rows) : 0;
        totals.flashcards += p;
        log(`cards   ${subject}: gen=${r.rawCount} accepted=${r.accepted} rejected=${r.rejected} persisted=${p}`);
      }
      if (KINDS.includes("examiner")) {
        const r = await generateExaminerTips({ subject, count: 6, model });
        const p = !preview && r.tips.length ? await persistStudyTips(subject, "examiner", r.tips, model) : 0;
        totals.examiner += p;
        log(`examnr  ${subject}: accepted=${r.tips.length} persisted=${p}`);
      }
      if (KINDS.includes("exam")) {
        const r = await generateExamTips({ subject, count: 6, model });
        const p = !preview && r.tips.length ? await persistStudyTips(subject, "exam", r.tips, model) : 0;
        totals.exam += p;
        log(`exam    ${subject}: accepted=${r.tips.length} persisted=${p} basis=${JSON.stringify(r.basis)}`);
      }
    } catch (e: any) {
      log(`ERROR   ${subject}: ${e?.message ?? e}`);
    }
  }
  log(`DONE totals persisted: ${JSON.stringify(totals)}`);
  process.exit(0);
})().catch((e) => { console.error("FATAL", e); process.exit(1); });
