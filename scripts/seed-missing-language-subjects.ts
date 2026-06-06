/**
 * Inserts the 25 official-language and elective subjects that are referenced
 * in the DBE papers catalog but missing from the `subjects` table.
 * Idempotent — uses ON CONFLICT (code) DO NOTHING.
 *
 * Run:  npx tsx scripts/seed-missing-language-subjects.ts
 */
import { db } from "../server/db";
import { subjects } from "@shared/schema";

const ROWS: Array<{ name: string; nameAfrikaans: string; code: string; category: string }> = [
  { name: "Afrikaans Second Additional Language", nameAfrikaans: "Afrikaans Tweede Addisionele Taal", code: "AFRS", category: "Languages" },
  { name: "Marine Sciences",                       nameAfrikaans: "Mariene Wetenskappe",               code: "MRSCI", category: "Sciences"  },

  { name: "Sepedi Home Language",                  nameAfrikaans: "Sepedi Huistaal",                   code: "SEPH", category: "Languages" },
  { name: "Sepedi First Additional Language",      nameAfrikaans: "Sepedi Eerste Addisionele Taal",    code: "SEPF", category: "Languages" },
  { name: "Sepedi Second Additional Language",     nameAfrikaans: "Sepedi Tweede Addisionele Taal",    code: "SEPS", category: "Languages" },

  { name: "Sesotho Home Language",                 nameAfrikaans: "Sesotho Huistaal",                  code: "SESH", category: "Languages" },
  { name: "Sesotho First Additional Language",     nameAfrikaans: "Sesotho Eerste Addisionele Taal",   code: "SESF", category: "Languages" },
  { name: "Sesotho Second Additional Language",    nameAfrikaans: "Sesotho Tweede Addisionele Taal",   code: "SESS", category: "Languages" },

  { name: "Setswana Home Language",                nameAfrikaans: "Setswana Huistaal",                 code: "SETH", category: "Languages" },
  { name: "Setswana First Additional Language",    nameAfrikaans: "Setswana Eerste Addisionele Taal",  code: "SETF", category: "Languages" },
  { name: "Setswana Second Additional Language",   nameAfrikaans: "Setswana Tweede Addisionele Taal",  code: "SETS", category: "Languages" },

  { name: "Tshivenda Home Language",               nameAfrikaans: "Tshivenda Huistaal",                code: "TSHH", category: "Languages" },
  { name: "Tshivenda First Additional Language",   nameAfrikaans: "Tshivenda Eerste Addisionele Taal", code: "TSHF", category: "Languages" },

  { name: "Xitsonga Home Language",                nameAfrikaans: "Xitsonga Huistaal",                 code: "XITH", category: "Languages" },
  { name: "Xitsonga First Additional Language",    nameAfrikaans: "Xitsonga Eerste Addisionele Taal",  code: "XITF", category: "Languages" },

  { name: "isiNdebele Home Language",              nameAfrikaans: "isiNdebele Huistaal",               code: "NDH",  category: "Languages" },
  { name: "isiNdebele First Additional Language",  nameAfrikaans: "isiNdebele Eerste Addisionele Taal",code: "NDF",  category: "Languages" },
  { name: "isiNdebele Second Additional Language", nameAfrikaans: "isiNdebele Tweede Addisionele Taal",code: "NDS",  category: "Languages" },

  { name: "isiXhosa Home Language",                nameAfrikaans: "isiXhosa Huistaal",                 code: "XHOH", category: "Languages" },
  { name: "isiXhosa First Additional Language",    nameAfrikaans: "isiXhosa Eerste Addisionele Taal",  code: "XHOF", category: "Languages" },
  { name: "isiXhosa Second Additional Language",   nameAfrikaans: "isiXhosa Tweede Addisionele Taal",  code: "XHOS", category: "Languages" },

  { name: "isiZulu Home Language",                 nameAfrikaans: "isiZulu Huistaal",                  code: "ZULH", category: "Languages" },
  { name: "isiZulu First Additional Language",     nameAfrikaans: "isiZulu Eerste Addisionele Taal",   code: "ZULF", category: "Languages" },

  { name: "siSwati Home Language",                 nameAfrikaans: "siSwati Huistaal",                  code: "SWAH", category: "Languages" },
  { name: "siSwati First Additional Language",     nameAfrikaans: "siSwati Eerste Addisionele Taal",   code: "SWAF", category: "Languages" },
];

async function main() {
  const res = await db.insert(subjects).values(ROWS).onConflictDoNothing({ target: subjects.code }).returning();
  console.log(`Inserted ${res.length} new subjects (skipped ${ROWS.length - res.length} as duplicates)`);
  for (const s of res) console.log(`  + ${s.code.padEnd(6)} ${s.name}`);
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
