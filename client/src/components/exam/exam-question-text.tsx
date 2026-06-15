import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ExamQuestionTextProps {
  text: string;
  className?: string;
}

type Segment =
  | { kind: "prose"; text: string }
  | { kind: "table"; rows: string[][]; hasHeader: boolean };

// Pipe forms: ASCII `|` and the box-drawing vertical bars commonly produced
// by PDF table extraction (`│`, `┃`).
const PIPE_CHAR = /[|│┃]/;
const PIPE_SPLIT = /[|│┃]/g;
const TAB_OR_DOUBLE_SPACE = /\t+| {2,}/;
const PIPE_SEPARATOR_ROW = /^[\s|│┃:\-—–=]+$/;
// "Strong" pipe-table signal: the line is leading/trailing pipe-bounded
// (markdown style), e.g. `| Year | Mark |` or starts/ends with `|`.
const PIPE_BOUNDED_ROW = /^\s*[|│┃].*[|│┃]\s*$/;

function splitPipeRow(line: string): string[] {
  let trimmed = line.trim();
  if (PIPE_CHAR.test(trimmed.charAt(0))) trimmed = trimmed.slice(1);
  if (PIPE_CHAR.test(trimmed.charAt(trimmed.length - 1))) trimmed = trimmed.slice(0, -1);
  return trimmed.split(PIPE_SPLIT).map((c) => c.trim());
}

function isTableBlock(lines: string[]): boolean {
  if (lines.length < 2) return false;

  // Strong pipe-table: ≥2 rows where the row is bounded by pipes on both
  // ends (classic markdown/DBE table extract). Tolerates 1 stray prose line.
  const pipeBoundedLines = lines.filter((l) => PIPE_BOUNDED_ROW.test(l)).length;
  if (pipeBoundedLines >= 2 && pipeBoundedLines >= lines.length - 1) return true;

  // Tab-delimited: real tab characters are an unambiguous tabular signal.
  const tabRows = lines.map((l) => l.split("\t"));
  const tabLines = tabRows.filter((cells) => cells.length >= 2).length;
  if (tabLines >= 2 && tabLines >= lines.length - 1) {
    const counts = tabRows.filter((c) => c.length >= 2).map((c) => c.length);
    if (counts.every((c) => c === counts[0])) return true;
  }

  // Whitespace-aligned columns: require ALL non-empty lines to split into
  // ≥2 cells by tab-or-double-space AND have the SAME column count. This
  // excludes prose that incidentally contains a double space on one line.
  const wsRows = lines.map((l) => l.trim().split(TAB_OR_DOUBLE_SPACE));
  if (wsRows.length >= 2 && wsRows.every((r) => r.length >= 2)) {
    const first = wsRows[0].length;
    if (first >= 2 && wsRows.every((r) => r.length === first)) return true;
  }

  return false;
}

function parseTableBlock(lines: string[]): { rows: string[][]; hasHeader: boolean } {
  const usePipes = lines.some((l) => PIPE_BOUNDED_ROW.test(l));
  const useTabs = !usePipes && lines.some((l) => l.includes("\t"));
  let rows: string[][];
  let hasHeader = false;
  if (usePipes) {
    const filtered = lines.filter((l) => !PIPE_SEPARATOR_ROW.test(l));
    rows = filtered.map(splitPipeRow);
    hasHeader = filtered.length !== lines.length;
  } else if (useTabs) {
    rows = lines.map((l) => l.split("\t").map((c) => c.trim()));
  } else {
    rows = lines.map((l) => l.trim().split(TAB_OR_DOUBLE_SPACE));
  }
  const cols = Math.max(...rows.map((r) => r.length));
  rows = rows.map((r) => (r.length < cols ? [...r, ...Array(cols - r.length).fill("")] : r));
  return { rows, hasHeader };
}

function parseSegments(raw: string): Segment[] {
  if (!raw) return [];
  const text = raw.replace(/\r\n/g, "\n");
  const blocks = text.split(/\n\s*\n/);
  const segments: Segment[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length === 0) continue;
    if (isTableBlock(lines)) {
      const { rows, hasHeader } = parseTableBlock(lines);
      if (rows.length >= 2 && rows[0].length >= 2) {
        segments.push({ kind: "table", rows, hasHeader });
        continue;
      }
    }
    segments.push({ kind: "prose", text: block });
  }
  return segments;
}

export function ExamQuestionText({ text, className }: ExamQuestionTextProps) {
  const segments = useMemo(() => parseSegments(text || ""), [text]);

  if (segments.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {segments.map((seg, i) => {
        if (seg.kind === "prose") {
          // whitespace-pre-wrap (not pre-line) preserves repeated spaces
          // from PDF-extracted question text — important for alignment in
          // formulas, code snippets, and accounting columns.
          return (
            <p key={i} className="whitespace-pre-wrap leading-relaxed">
              {seg.text}
            </p>
          );
        }
        const headerRow = seg.hasHeader ? seg.rows[0] : null;
        const bodyRows = seg.hasHeader ? seg.rows.slice(1) : seg.rows;
        return (
          <div key={i} className="overflow-x-auto rounded-md border border-border/60">
            <table className="w-full text-sm">
              {headerRow && (
                <thead className="bg-muted/40">
                  <tr>
                    {headerRow.map((cell, ci) => (
                      <th
                        key={ci}
                        className="px-3 py-2 text-left font-semibold border-b border-border/60 align-top"
                      >
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 1 ? "bg-muted/20" : undefined}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-2 border-b border-border/40 last:border-b-0 align-top whitespace-pre-line"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
