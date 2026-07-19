// Proves the OCR fix works through the real ingestion path
// (fetchAndParsePDF -> ocrPdfWithOpenAI), not just a direct API call.
import { register } from "tsx/esm/api";
register();
const { fetchAndParsePDF } = await import("./server/dbe-ingestion.ts");

const url = "https://www.education.gov.za/LinkClick.aspx?fileticket=JM4biRg1OIk%3d&tabid=5742&portalid=0&mid=14845";
console.log("ENABLE_OCR_FALLBACK =", process.env.ENABLE_OCR_FALLBACK);
const text = await fetchAndParsePDF(url);
const alpha = (text.match(/[A-Za-z]/g) || []).length;
console.log(`RESULT: ${text.length} chars, ${alpha} alphabetic`);
console.log("QUESTION headers found:", (text.match(/QUESTION\s+\d+/gi) || []).length);
console.log("--- first 300 ---");
console.log(text.slice(0, 300));
process.exit(0);
