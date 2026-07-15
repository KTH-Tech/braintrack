/**
 * Convert the official DBE EMIS National Schools Masterlist (xlsx) into
 * server/data/sa-high-schools.json — the dataset behind the school dropdown.
 *
 * Source: education.gov.za → Programmes → EMIS → Schools Masterlist Data →
 * "National". Filters to OPEN schools whose phase includes Grade 12 teaching
 * (SECONDARY + COMBINED + INTERMEDIATE/FINISHING variants that reach Gr 12).
 *
 * Run:  npx tsx scripts/import-sa-schools.ts <path-to-masterlist.xlsx>
 */
import ExcelJS from "exceljs";
import { writeFileSync } from "fs";

const SRC = process.argv[2] || "_masterlist.bin";
const OUT = "server/data/sa-high-schools.json";

const PROVINCE_NAMES: Record<string, string> = {
  EC: "Eastern Cape", FS: "Free State", GT: "Gauteng", KZN: "KwaZulu-Natal",
  LP: "Limpopo", MP: "Mpumalanga", NC: "Northern Cape", NW: "North West", WC: "Western Cape",
};

// Phases that teach up to Grade 12 (BrainTrack's audience). COMBINED schools
// run Gr R–12; SECONDARY run Gr 8–12; "FINISHING" schools are matric-focused.
const HIGH_SCHOOL_PHASES = /SECONDARY|COMBINED|FINISHING/i;

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\b(Of|And|The|Vir|Van|Der|De|Du|La|Le)\b/g, (m) => m.toLowerCase())
    .replace(/^([a-z])/, (m) => m.toUpperCase())
    .trim();
}

(async () => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(SRC);
  const ws = wb.worksheets[0];

  type School = { id: number; name: string; province: string; town: string };
  const schools: School[] = [];
  const seen = new Set<number>();

  ws.eachRow((row, rowNo) => {
    if (rowNo === 1) return; // header
    const status = String(row.getCell(6).value ?? "");
    const phase = String(row.getCell(9).value ?? "");
    if (status.toUpperCase() !== "OPEN") return;
    if (!HIGH_SCHOOL_PHASES.test(phase)) return;

    const natEmis = Number(row.getCell(1).value);
    if (!natEmis || seen.has(natEmis)) return;
    seen.add(natEmis);

    const rawName = String(row.getCell(5).value ?? "").replace(/\s+/g, " ").trim();
    if (!rawName) return;
    const provinceCd = String(row.getCell(3).value ?? "").toUpperCase();
    const town = String(row.getCell(30).value ?? "").replace(/^99$/, "").trim();

    schools.push({
      id: natEmis,
      name: titleCase(rawName),
      province: PROVINCE_NAMES[provinceCd] ?? provinceCd,
      town: town && town !== "99" ? titleCase(town) : "",
    });
  });

  schools.sort((a, b) => a.name.localeCompare(b.name));
  writeFileSync(OUT, JSON.stringify(schools));
  const byProv: Record<string, number> = {};
  for (const s of schools) byProv[s.province] = (byProv[s.province] ?? 0) + 1;
  console.log(`Wrote ${schools.length} high schools -> ${OUT}`);
  console.log("By province:", JSON.stringify(byProv, null, 2));
})().catch((e) => { console.error("FATAL", e?.message ?? e); process.exit(1); });
