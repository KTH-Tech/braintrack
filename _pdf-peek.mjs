import fs from "fs";
const b = fs.readFileSync(process.argv[2]);
console.log("size:", b.length, "bytes");
const s = b.toString("latin1");
const re = /\(((?:[^()\\]|\\.)*)\)/g;
const out = [];
let m;
while ((m = re.exec(s))) {
  const t = m[1].trim();
  if (t.length > 1) out.push(t);
}
console.log("--- extracted text tokens:");
console.log(out.slice(0, 120).join(" | "));
console.log("\n--- fonts/producer:");
console.log((s.match(/\/Producer\s*\(([^)]*)\)/) || [])[1] || "n/a");
console.log("pages:", (s.match(/\/Type\s*\/Page[^s]/g) || []).length);
