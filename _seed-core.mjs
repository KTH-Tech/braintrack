import { register } from "tsx/esm/api";
register();
const { storage } = await import("./server/storage.ts");
const { seedNscTimetableIfEmpty } = await import("./server/nsc-timetable.ts");

console.log("[seed] seedSubjects (subjects + topics)...");
await storage.seedSubjects();
console.log("[seed] seedExamPapers...");
try { await storage.seedExamPapers(); } catch (e) { console.log("  exam papers seed skipped:", e?.message ?? e); }
console.log("[seed] seedMockExams...");
try { await storage.seedMockExams(); } catch (e) { console.log("  mock exams seed skipped:", e?.message ?? e); }
console.log("[seed] NSC timetable...");
try { await seedNscTimetableIfEmpty(); } catch (e) { console.log("  timetable seed skipped:", e?.message ?? e); }
console.log("[seed] DONE");
process.exit(0);
