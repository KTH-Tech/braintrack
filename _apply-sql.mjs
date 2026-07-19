// Apply a SQL file to the target DB (used for the NSC timetable correction).
import pg from "pg";
import fs from "fs";
const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const sqlText = fs.readFileSync(process.argv[2], "utf8");
await c.query(sqlText);
const r = await c.query("SELECT COUNT(*)::int rows, MIN(exam_date)::text first_exam, MAX(exam_date)::text last_exam FROM nsc_timetable WHERE year=2026 AND session='November'");
console.log("November 2026 session now:", JSON.stringify(r.rows[0]));
const m = await c.query("SELECT exam_date::text, start_time FROM nsc_timetable WHERE subject_name='Mathematics' AND paper_number=1 AND session='November'");
console.log("Mathematics P1:", JSON.stringify(m.rows));
await c.end();
process.exit(0);
