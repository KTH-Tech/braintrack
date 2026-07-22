import { describe, it, expect } from "vitest";
import { layoutPageText, COLUMN_SEPARATOR, type TextItemLike } from "../../server/pdf-text-layout";

/**
 * Builds a pdf.js-shaped text item. pdf.js reports y in PDF user space, where
 * larger y is HIGHER on the page.
 */
function item(str: string, x: number, y: number, height = 12, width?: number): TextItemLike {
  return {
    str,
    transform: [height, 0, 0, height, x, y],
    height,
    width: width ?? str.length * height * 0.5,
  };
}

describe("layoutPageText", () => {
  it("orders items by visual position, not document order", () => {
    // Deliberately shuffled: this is what a PDF content stream looks like when
    // the typesetter emits an equation glyph group by glyph group.
    const items = [
      item("world", 60, 700),
      item("second line", 10, 680),
      item("Hello", 10, 700),
    ];
    expect(layoutPageText(items)).toBe("Hello world\nsecond line");
  });

  it("reconstructs a positioned equation that document order scrambles", () => {
    // Real failure from the 2025 Mathematics P2 marking guideline: document
    // order yields "0 10 2   = + −   y x" for what is visually "2x − y + 10 = 0".
    const documentOrder: TextItemLike[] = [
      item("0", 150, 500),
      item("10", 120, 500),
      item("2", 10, 500),
      item("=", 135, 500),
      item("+", 105, 500),
      item("−", 75, 500),
      item("y", 90, 500),
      item("x", 25, 500),
    ];
    expect(layoutPageText(documentOrder)).toBe("2 x − y + 10 = 0");
  });

  it("keeps top-to-bottom order across many lines", () => {
    const items = [
      item("third", 10, 600),
      item("first", 10, 700),
      item("fourth", 10, 550),
      item("second", 10, 650),
    ];
    expect(layoutPageText(items).split("\n")).toEqual(["first", "second", "third", "fourth"]);
  });

  it("treats a small baseline drift as the same visual line (superscripts)", () => {
    // Exponents sit a couple of points above the baseline but read inline.
    const items = [item("(RT)", 10, 500), item("2", 34, 505), item("= 125", 45, 500)];
    expect(layoutPageText(items)).toBe("(RT) 2 = 125");
  });

  it("does not merge two distinct lines that are close together", () => {
    const items = [item("line one", 10, 512), item("line two", 10, 500)];
    expect(layoutPageText(items).split("\n")).toHaveLength(2);
  });

  it("marks a wide horizontal gap as a column boundary", () => {
    // Side-by-side columns must not be silently glued into one run of prose.
    const items = [item("English text", 10, 700, 12, 60), item("Afrikaanse teks", 400, 700, 12, 60)];
    const out = layoutPageText(items);
    expect(out).toContain(COLUMN_SEPARATOR);
    expect(out).toBe(`English text${COLUMN_SEPARATOR}Afrikaanse teks`);
  });

  it("uses a single space between normally-spaced words", () => {
    const items = [item("two", 10, 700, 12, 20), item("words", 32, 700, 12, 30)];
    expect(layoutPageText(items)).toBe("two words");
  });

  it("derives its line tolerance from glyph height rather than a fixed value", () => {
    // Same 6pt vertical delta: with 8pt text these are separate lines, with
    // 40pt text they are one line. A hardcoded tolerance cannot do both.
    const small = [item("a", 10, 506, 8), item("b", 10, 500, 8)];
    const large = [item("a", 10, 506, 40), item("b", 30, 500, 40)];
    expect(layoutPageText(small).split("\n")).toHaveLength(2);
    expect(layoutPageText(large).split("\n")).toHaveLength(1);
  });

  it("ignores whitespace-only and malformed items", () => {
    const items = [
      item("kept", 10, 700),
      item("   ", 50, 700),
      { str: "no transform", transform: undefined as unknown as number[] },
    ];
    expect(layoutPageText(items)).toBe("kept");
  });

  it("returns an empty string for an empty page", () => {
    expect(layoutPageText([])).toBe("");
  });
});
