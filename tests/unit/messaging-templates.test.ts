/**
 * Unit tests for the Twilio message template renderer.
 *
 * The renderer sits behind every trial-lifecycle push — welcome, first quiz
 * completed, day-3/7/12 nudges, payment success/failure, prelim countdown,
 * streak broken. A silent regression here (unrendered placeholder, wrong
 * language) would leak straight to a real parent, so pin the contract down.
 */
import { describe, it, expect } from "vitest";
import {
  MESSAGE_TEMPLATES,
  renderTemplate,
  type TemplateKey,
} from "../../server/messaging/twilio-messaging";

describe("MESSAGE_TEMPLATES", () => {
  it("declares all nine required templates", () => {
    const expected = [
      "welcome",
      "first_quiz_completed",
      "day_3_youre_rolling",
      "day_7_checkpoint",
      "day_12_two_days_left",
      "payment_success",
      "payment_failed",
      "prelim_countdown_7d",
      "streak_broken",
    ];
    expect(Object.keys(MESSAGE_TEMPLATES).sort()).toEqual(expected.sort());
  });

  it("categorises transactional templates as UTILITY and growth ones as MARKETING", () => {
    const utilities: TemplateKey[] = [
      "welcome",
      "first_quiz_completed",
      "day_3_youre_rolling",
      "day_7_checkpoint",
      "day_12_two_days_left",
      "payment_success",
      "payment_failed",
    ];
    for (const k of utilities) {
      expect(MESSAGE_TEMPLATES[k].category).toBe("UTILITY");
    }
    expect(MESSAGE_TEMPLATES.prelim_countdown_7d.category).toBe("MARKETING");
    expect(MESSAGE_TEMPLATES.streak_broken.category).toBe("MARKETING");
  });

  it("has a non-empty EN and AF body for every template", () => {
    for (const k of Object.keys(MESSAGE_TEMPLATES) as TemplateKey[]) {
      const t = MESSAGE_TEMPLATES[k];
      expect(t.en.length).toBeGreaterThan(0);
      expect(t.af.length).toBeGreaterThan(0);
    }
  });
});

describe("renderTemplate — variable substitution", () => {
  it("replaces all {{variable}} placeholders in the welcome template", () => {
    const out = renderTemplate("welcome", "en", {
      parent_first: "Thandi",
      learner_first: "Sipho",
      app_link: "https://app.braintrack.tech",
    });
    expect(out).toContain("Thandi");
    expect(out).toContain("Sipho");
    expect(out).toContain("https://app.braintrack.tech");
    expect(out).not.toContain("{{"); // no unrendered placeholder
  });

  it("substitutes numeric variables without losing precision", () => {
    const out = renderTemplate("day_3_youre_rolling", "en", {
      parent_first: "Sam",
      learner_first: "Ava",
      questions_answered: 47,
      streak: 3,
      days_left: 11,
      app_link: "https://app.braintrack.tech",
    });
    expect(out).toContain("47 questions");
    expect(out).toContain("Streak: 3");
    expect(out).toContain("11 days");
  });

  it("collapses missing / null variables to empty string rather than leaving {{name}} visible", () => {
    const out = renderTemplate("welcome", "en", {
      parent_first: "Thandi",
      // learner_first missing
      app_link: "https://app.braintrack.tech",
    });
    expect(out).not.toContain("{{learner_first}}");
    expect(out).not.toContain("{{");
  });

  it("tolerates null and undefined values", () => {
    const out = renderTemplate("welcome", "en", {
      parent_first: null,
      learner_first: undefined,
      app_link: "https://app.braintrack.tech",
    });
    expect(out).not.toContain("{{");
    expect(out).toContain("https://app.braintrack.tech");
  });

  it("accepts placeholders with whitespace inside the braces", () => {
    // Regex allows `{{ parent_first }}` — future-proofs for a designer who
    // pastes with spaces.
    const templated = "Hi {{ parent_first }}!";
    // Re-use the exposed renderer by monkey-injecting via a real template
    // key; if we ever refactor to purity-only, this still exercises the
    // substitution logic.
    const key = "welcome" satisfies TemplateKey;
    const original = MESSAGE_TEMPLATES[key].en;
    try {
      (MESSAGE_TEMPLATES[key] as any).en = templated;
      const out = renderTemplate(key, "en", { parent_first: "Zoe" });
      expect(out).toBe("Hi Zoe!");
    } finally {
      (MESSAGE_TEMPLATES[key] as any).en = original;
    }
  });
});

describe("renderTemplate — language selection", () => {
  it("uses AF copy for AF language selection", () => {
    const en = renderTemplate("welcome", "en", {
      parent_first: "P",
      learner_first: "L",
      app_link: "https://x",
    });
    const af = renderTemplate("welcome", "af", {
      parent_first: "P",
      learner_first: "L",
      app_link: "https://x",
    });
    expect(en).not.toEqual(af);
    // AF template starts "Jy's in"; EN starts "You're in".
    expect(af.startsWith("Jy's in")).toBe(true);
    expect(en.startsWith("You're in")).toBe(true);
  });

  it("falls back to EN when the AF body is missing at runtime", () => {
    // Simulate an incomplete new template that only shipped EN copy.
    const key = "welcome" satisfies TemplateKey;
    const originalAf = MESSAGE_TEMPLATES[key].af;
    try {
      (MESSAGE_TEMPLATES[key] as any).af = undefined;
      const out = renderTemplate(key, "af", {
        parent_first: "P",
        learner_first: "L",
        app_link: "https://x",
      });
      expect(out).toContain("You're in"); // EN fallback body
    } finally {
      (MESSAGE_TEMPLATES[key] as any).af = originalAf;
    }
  });
});
