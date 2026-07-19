import { register } from "tsx/esm/api";
register();
import OpenAI from "openai";

const url = "https://www.education.gov.za/LinkClick.aspx?fileticket=JM4biRg1OIk%3d&tabid=5742&portalid=0&mid=14845";
const r = await fetch(url);
const buf = Buffer.from(await r.arrayBuffer());
console.log("PDF bytes:", buf.length, "header:", buf.slice(0, 8).toString());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const dataUrl = `data:application/pdf;base64,${buf.toString("base64")}`;
const PROMPT =
  "Transcribe ALL visible text in this PDF verbatim, preserving line breaks and any " +
  "section headings such as 'QUESTION 1', 'VRAAG 2', 'MEMORANDUM', '1.1', '2.1.1' etc. " +
  "Do not summarise, translate, or add commentary. Output ONLY the raw text.";

for (const model of ["gpt-4o", "gpt-4.1", "gpt-4o-mini"]) {
  try {
    const resp = await client.responses.create({
      model,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: PROMPT },
          { type: "input_file", filename: "paper.pdf", file_data: dataUrl },
        ],
      }],
    });
    const txt = (resp.output_text ?? "").trim();
    console.log(`\n=== ${model}: ${txt.length} chars ===`);
    console.log(txt.slice(0, 400));
  } catch (e) {
    console.log(`\n=== ${model}: ERROR ${e?.message?.slice(0, 160)}`);
  }
}
process.exit(0);
