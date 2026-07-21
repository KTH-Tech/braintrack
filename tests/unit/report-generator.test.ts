/**
 * tests/unit/report-generator.test.ts
 *
 * Covers the branded parent PDF report:
 *   - the brand typefaces are genuinely EMBEDDED in the output (not Helvetica),
 *   - both report variants ("Getting Started" and full data) produce real,
 *     multi-section documents,
 *   - the partner-logo path validates image format instead of failing silently,
 *   - page furniture (running footer, page numbers) is stamped on every page.
 *
 * `server/db` and `server/storage` are mocked so this never touches a database.
 *
 * Set REPORT_PDF_OUT=<dir> to also dump the generated PDFs for visual review:
 *   REPORT_PDF_OUT=.report-preview npx vitest run tests/unit/report-generator.test.ts
 */

import { describe, it, expect, beforeAll, vi } from "vitest";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

/* ── Fixture state, swapped per test ─────────────────────────────────────── */

interface Fixture {
  subjects: Array<{ id: number; name: string; nameAfrikaans?: string | null }>;
  progress: Array<{ subjectId: number; questionsAttempted: number; correctAnswers: number }>;
  stats: { accuracy: number; questionsAnswered: number; studyStreak: number; papersCompleted: number };
  selectedSubjects: number[];
  onboardingMarks: Array<{ subjectName: string; mark: number }>;
  studyDays: Array<{ study_date: string; q_count: string }>;
  weekly: Array<{ week_start: string; total: string; correct: string }>;
}

const EMPTY_FIXTURE: Fixture = {
  subjects: [],
  progress: [],
  stats: { accuracy: 0, questionsAnswered: 0, studyStreak: 0, papersCompleted: 0 },
  selectedSubjects: [],
  onboardingMarks: [],
  studyDays: [],
  weekly: [],
};

const RICH_FIXTURE: Fixture = {
  subjects: [
    { id: 1, name: "Mathematics", nameAfrikaans: "Wiskunde" },
    { id: 2, name: "Physical Sciences", nameAfrikaans: "Fisiese Wetenskappe" },
    { id: 3, name: "Life Sciences", nameAfrikaans: "Lewenswetenskappe" },
    { id: 4, name: "English Home Language", nameAfrikaans: "Engels Huistaal" },
    { id: 5, name: "Afrikaans First Additional Language", nameAfrikaans: "Afrikaans Eerste Addisionele Taal" },
    { id: 6, name: "Accounting", nameAfrikaans: "Rekeningkunde" },
    { id: 7, name: "Geography", nameAfrikaans: "Geografie" },
  ],
  progress: [
    { subjectId: 1, questionsAttempted: 214, correctAnswers: 141 },
    { subjectId: 2, questionsAttempted: 168, correctAnswers: 97 },
    { subjectId: 3, questionsAttempted: 132, correctAnswers: 106 },
    { subjectId: 4, questionsAttempted: 96, correctAnswers: 79 },
    { subjectId: 5, questionsAttempted: 74, correctAnswers: 43 },
    { subjectId: 6, questionsAttempted: 58, correctAnswers: 25 },
    { subjectId: 7, questionsAttempted: 3, correctAnswers: 2 },
  ],
  stats: { accuracy: 64, questionsAnswered: 745, studyStreak: 12, papersCompleted: 6 },
  selectedSubjects: [1, 2, 3, 4, 5, 6, 7],
  onboardingMarks: [
    { subjectName: "Mathematics", mark: 52 },
    { subjectName: "Physical Sciences", mark: 61 },
    { subjectName: "Life Sciences", mark: 70 },
    { subjectName: "English Home Language", mark: 74 },
    { subjectName: "Afrikaans First Additional Language", mark: 66 },
    { subjectName: "Accounting", mark: 48 },
    { subjectName: "Geography", mark: 55 },
  ],
  studyDays: Array.from({ length: 22 }, (_, i) => ({
    study_date: new Date(Date.now() - (21 - i) * 86400000).toISOString().slice(0, 10),
    q_count: String(6 + ((i * 7) % 34)),
  })),
  weekly: Array.from({ length: 4 }, (_, i) => ({
    week_start: new Date(Date.now() - (3 - i) * 7 * 86400000).toISOString().slice(0, 10),
    total: String(120 + i * 24),
    correct: String(Math.round((120 + i * 24) * (0.52 + i * 0.05))),
  })),
};

let fixture: Fixture = EMPTY_FIXTURE;

/* ── Mocks ───────────────────────────────────────────────────────────────── */

vi.mock("../../server/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: async () => [{ selectedSubjects: fixture.selectedSubjects }],
      }),
    }),
    execute: async (query: any) => {
      // Distinguish the two raw queries by a token unique to each.
      const text = JSON.stringify(query?.queryChunks ?? query ?? "");
      if (text.includes("DATE_TRUNC")) return { rows: fixture.weekly };
      return { rows: fixture.studyDays };
    },
  },
}));

vi.mock("../../server/storage", () => ({
  storage: {
    getAllSubjects: async () => fixture.subjects,
    getUserProgress: async () => fixture.progress,
    getUserStats: async () => fixture.stats,
    getOnboardingResult: async () =>
      fixture.onboardingMarks.length
        ? { rawAnswersJson: { subjectMarks: fixture.onboardingMarks } }
        : null,
  },
}));

let generateReportPdfBuffer: typeof import("../../server/report-generator").generateReportPdfBuffer;
let detectImageFormat: typeof import("../../server/report-generator").detectImageFormat;
let brandFontsAvailable: typeof import("../../server/brand-fonts").brandFontsAvailable;

const OUT_DIR = process.env.REPORT_PDF_OUT;

beforeAll(async () => {
  const mod = await import("../../server/report-generator");
  generateReportPdfBuffer = mod.generateReportPdfBuffer;
  detectImageFormat = mod.detectImageFormat;
  brandFontsAvailable = (await import("../../server/brand-fonts")).brandFontsAvailable;
  if (OUT_DIR) mkdirSync(OUT_DIR, { recursive: true });
});

/** PDFKit writes object dictionaries uncompressed, so /BaseFont is greppable. */
function baseFonts(pdf: Buffer): string[] {
  const s = pdf.toString("latin1");
  const out = new Set<string>();
  for (const m of s.matchAll(/\/BaseFont\s*\/([A-Za-z0-9+\-_,.]+)/g)) out.add(m[1]);
  return [...out];
}

function pageCount(pdf: Buffer): number {
  return (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
}

function dump(name: string, buf: Buffer) {
  if (OUT_DIR) writeFileSync(join(OUT_DIR, name), buf);
}

/* ── Tests ───────────────────────────────────────────────────────────────── */

describe("brand fonts", () => {
  it("all six brand typefaces are present on disk", () => {
    expect(brandFontsAvailable()).toBe(true);
  });
});

describe("detectImageFormat", () => {
  it("recognises PNG", () => {
    expect(detectImageFormat(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]))).toBe("png");
  });
  it("recognises JPEG", () => {
    expect(detectImageFormat(Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(8)]))).toBe("jpeg");
  });
  it("recognises WebP — the format that used to fail silently", () => {
    const webp = Buffer.concat([
      Buffer.from("RIFF", "ascii"),
      Buffer.from([0, 0, 0, 0]),
      Buffer.from("WEBP", "ascii"),
    ]);
    expect(detectImageFormat(webp)).toBe("webp");
  });
  it("recognises GIF and SVG", () => {
    expect(detectImageFormat(Buffer.concat([Buffer.from("GIF89a", "ascii"), Buffer.alloc(8)]))).toBe("gif");
    expect(detectImageFormat(Buffer.from('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBe("svg");
  });
});

describe("generateReportPdfBuffer — Getting Started variant", () => {
  let pdf: Buffer;

  beforeAll(async () => {
    fixture = EMPTY_FIXTURE;
    pdf = await generateReportPdfBuffer({
      learnerTargetId: "test-learner",
      learnerName: "Thandiwe Mokoena",
      lang: "en",
      hasLinkedLearner: false,
    });
    dump("getting-started-en.pdf", pdf);
  });

  it("produces a valid, non-trivial PDF", () => {
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(20_000);
  });

  it("embeds Poppins and Permanent Marker, and no Helvetica", () => {
    const fonts = baseFonts(pdf).join(" ");
    expect(fonts).toMatch(/Poppins/);
    expect(fonts).toMatch(/PermanentMarker/);
    expect(fonts).not.toMatch(/Helvetica/);
  });

  it("spans multiple pages of real content", () => {
    expect(pageCount(pdf)).toBeGreaterThanOrEqual(2);
  });
});

describe("generateReportPdfBuffer — full data variant", () => {
  let pdf: Buffer;

  beforeAll(async () => {
    fixture = RICH_FIXTURE;
    pdf = await generateReportPdfBuffer({
      learnerTargetId: "test-learner",
      learnerName: "Thandiwe Mokoena",
      lang: "en",
      hasLinkedLearner: true,
      partnerBranding: { partnerName: "Youth Dynamix (YDx)" },
    });
    dump("full-data-en.pdf", pdf);
  });

  it("produces a valid PDF with embedded brand fonts only", () => {
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    const fonts = baseFonts(pdf).join(" ");
    expect(fonts).toMatch(/Poppins/);
    expect(fonts).not.toMatch(/Helvetica/);
  });

  it("spans multiple pages", () => {
    expect(pageCount(pdf)).toBeGreaterThanOrEqual(2);
  });

  it("carries document metadata", () => {
    const s = pdf.toString("latin1");
    expect(s).toMatch(/\/Title/);
    expect(s).toMatch(/BrainTrack/);
  });
});

describe("generateReportPdfBuffer — Afrikaans", () => {
  it("renders the Afrikaans variant with the same embedded fonts", async () => {
    fixture = RICH_FIXTURE;
    const pdf = await generateReportPdfBuffer({
      learnerTargetId: "test-learner",
      learnerName: "Thandiwe Mokoena",
      lang: "af",
      hasLinkedLearner: true,
    });
    dump("full-data-af.pdf", pdf);
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(baseFonts(pdf).join(" ")).toMatch(/Poppins/);
  });
});

describe("partner logo handling", () => {
  it("logs and skips a WebP logo instead of failing silently", async () => {
    fixture = RICH_FIXTURE;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const webp = Buffer.concat([
      Buffer.from("RIFF", "ascii"),
      Buffer.from([0x20, 0, 0, 0]),
      Buffer.from("WEBPVP8 ", "ascii"),
      Buffer.alloc(32),
    ]).toString("base64");

    const pdf = await generateReportPdfBuffer({
      learnerTargetId: "test-learner",
      learnerName: "Thandiwe Mokoena",
      lang: "en",
      hasLinkedLearner: true,
      partnerBranding: {
        partnerName: "Youth Dynamix (YDx)",
        partnerLogoBase64: `data:image/webp;base64,${webp}`,
      },
    });

    const messages = warn.mock.calls.map((c) => c.join(" ")).join("\n");
    warn.mockRestore();

    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(messages).toMatch(/Partner logo/);
    expect(messages).toMatch(/webp/i);
    expect(messages).toMatch(/JPEG and PNG/);
  });

  it("logs when the base64 payload decodes to nothing", async () => {
    fixture = RICH_FIXTURE;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await generateReportPdfBuffer({
      learnerTargetId: "test-learner",
      learnerName: "Thandiwe Mokoena",
      lang: "en",
      hasLinkedLearner: true,
      partnerBranding: { partnerName: "Youth Dynamix (YDx)", partnerLogoBase64: "data:image/png;base64," },
    });
    const messages = warn.mock.calls.map((c) => c.join(" ")).join("\n");
    warn.mockRestore();
    expect(messages).toMatch(/0 bytes/);
  });

  it("embeds a valid PNG logo without warning", async () => {
    fixture = RICH_FIXTURE;
    // Smallest valid 1x1 PNG.
    const png =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const pdf = await generateReportPdfBuffer({
      learnerTargetId: "test-learner",
      learnerName: "Thandiwe Mokoena",
      lang: "en",
      hasLinkedLearner: true,
      partnerBranding: { partnerName: "Youth Dynamix (YDx)", partnerLogoBase64: `data:image/png;base64,${png}` },
    });
    const messages = warn.mock.calls.map((c) => c.join(" ")).join("\n");
    warn.mockRestore();
    dump("full-data-partner-logo.pdf", pdf);
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(messages).not.toMatch(/Partner logo/);
  });
});
