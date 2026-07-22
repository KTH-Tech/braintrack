/**
 * Unit tests for the VARK questionnaire scoring function
 * (client/src/lib/vark.ts::scoreVarkAnswers).
 *
 * The contract under test: 12 questions x 4 options -> primary + optional
 * secondary. Secondary is returned ONLY when it is within 20% of the primary
 * (i.e. runner-up score >= ceil(primary * 0.8)). Ties break in canonical
 * V -> A -> R -> K order, so results are deterministic and reproducible.
 */
import { describe, it, expect } from "vitest";
import {
  scoreVarkAnswers,
  VARK_QUESTIONS,
  VARK_STYLES,
  type VarkStyle,
} from "../../client/src/lib/vark";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Pick a specific style's option for question `q` (throws if missing). */
function optionValue(questionIndex: number, style: VarkStyle): string {
  const q = VARK_QUESTIONS[questionIndex];
  const opt = q.options.find((o) => o.style === style);
  if (!opt) {
    throw new Error(`Question ${q.id} is missing an option for style ${style}`);
  }
  return opt.value;
}

/** Build an answer map choosing `style` for every one of the 12 questions. */
function allOfStyle(style: VarkStyle): Record<string, string> {
  const answers: Record<string, string> = {};
  VARK_QUESTIONS.forEach((q, i) => {
    answers[q.id] = optionValue(i, style);
  });
  return answers;
}

/** Build an answer map with an explicit count per style, filling in order. */
function mixOfStyles(counts: Partial<Record<VarkStyle, number>>): Record<string, string> {
  const answers: Record<string, string> = {};
  let idx = 0;
  const push = (style: VarkStyle, n: number) => {
    for (let i = 0; i < n && idx < VARK_QUESTIONS.length; i++, idx++) {
      answers[VARK_QUESTIONS[idx].id] = optionValue(idx, style);
    }
  };
  push("visual", counts.visual ?? 0);
  push("auditory", counts.auditory ?? 0);
  push("read", counts.read ?? 0);
  push("kinesthetic", counts.kinesthetic ?? 0);
  return answers;
}

// ── Shape of the questionnaire ─────────────────────────────────────────────

describe("VARK_QUESTIONS shape", () => {
  it("has exactly 12 questions", () => {
    expect(VARK_QUESTIONS).toHaveLength(12);
  });

  it("every question has 4 options, one per VARK style, both languages populated", () => {
    for (const q of VARK_QUESTIONS) {
      expect(q.options).toHaveLength(4);
      const styles = new Set(q.options.map((o) => o.style));
      expect(styles).toEqual(new Set<VarkStyle>(["visual", "auditory", "read", "kinesthetic"]));
      for (const o of q.options) {
        expect(o.labelEn.trim().length).toBeGreaterThan(0);
        expect(o.labelAf.trim().length).toBeGreaterThan(0);
        expect(o.value).toMatch(/^vark_/);
      }
      expect(q.promptEn.trim().length).toBeGreaterThan(0);
      expect(q.promptAf.trim().length).toBeGreaterThan(0);
    }
  });

  it("every option value is globally unique (no key collisions across questions)", () => {
    const seen = new Set<string>();
    for (const q of VARK_QUESTIONS) {
      for (const o of q.options) {
        expect(seen.has(o.value)).toBe(false);
        seen.add(o.value);
      }
    }
    expect(seen.size).toBe(48); // 12 x 4
  });

  it("every style has a matching VARK_STYLES metadata entry (icons, labels)", () => {
    const styles: VarkStyle[] = ["visual", "auditory", "read", "kinesthetic"];
    for (const s of styles) {
      expect(VARK_STYLES[s]).toBeDefined();
      expect(VARK_STYLES[s].icon).toBeTruthy();
    }
  });
});

// ── Pure scoring behaviour ─────────────────────────────────────────────────

describe("scoreVarkAnswers — clear-winner cases", () => {
  it("all 12 answers weighted visual -> primary visual, no secondary", () => {
    const result = scoreVarkAnswers(allOfStyle("visual"));
    expect(result.primary).toBe("visual");
    expect(result.secondary).toBeNull();
    expect(result.scores).toEqual({ visual: 12, auditory: 0, read: 0, kinesthetic: 0 });
  });

  it("all 12 answers weighted auditory -> primary auditory, no secondary", () => {
    const result = scoreVarkAnswers(allOfStyle("auditory"));
    expect(result.primary).toBe("auditory");
    expect(result.secondary).toBeNull();
  });

  it("all 12 answers weighted read -> primary read, no secondary", () => {
    const result = scoreVarkAnswers(allOfStyle("read"));
    expect(result.primary).toBe("read");
    expect(result.secondary).toBeNull();
  });

  it("all 12 answers weighted kinesthetic -> primary kinesthetic, no secondary", () => {
    const result = scoreVarkAnswers(allOfStyle("kinesthetic"));
    expect(result.primary).toBe("kinesthetic");
    expect(result.secondary).toBeNull();
  });
});

describe("scoreVarkAnswers — 20% secondary rule", () => {
  it("runner-up within 20% of primary -> secondary returned", () => {
    // 5 visual, 4 auditory, 2 read, 1 kinesthetic. Threshold = ceil(5*0.8)=4,
    // auditory hits it exactly. Secondary = auditory.
    const result = scoreVarkAnswers(mixOfStyles({ visual: 5, auditory: 4, read: 2, kinesthetic: 1 }));
    expect(result.primary).toBe("visual");
    expect(result.secondary).toBe("auditory");
    expect(result.scores).toEqual({ visual: 5, auditory: 4, read: 2, kinesthetic: 1 });
  });

  it("runner-up just below the 20% threshold -> no secondary", () => {
    // 6 kinesthetic, 4 read, 1 visual, 1 auditory. Threshold = ceil(6*0.8)=5,
    // read only reaches 4 -> below threshold, no secondary.
    const result = scoreVarkAnswers(mixOfStyles({ visual: 1, auditory: 1, read: 4, kinesthetic: 6 }));
    expect(result.primary).toBe("kinesthetic");
    expect(result.secondary).toBeNull();
  });

  it("runner-up equal to threshold (ceil-based) -> secondary returned", () => {
    // 5 visual, 4 read, 2 auditory, 1 kinesthetic. Same threshold as above,
    // read hits 4 exactly -> qualifies.
    const result = scoreVarkAnswers(mixOfStyles({ visual: 5, auditory: 2, read: 4, kinesthetic: 1 }));
    expect(result.primary).toBe("visual");
    expect(result.secondary).toBe("read");
  });

  it("runner-up with zero votes never becomes a secondary", () => {
    // 12 visual, everything else 0. Threshold = ceil(12*0.8)=10 anyway, but
    // even a 0-vote runner-up must never qualify.
    const result = scoreVarkAnswers(allOfStyle("visual"));
    expect(result.secondary).toBeNull();
  });
});

describe("scoreVarkAnswers — tiebreak order", () => {
  it("primary tie: visual beats auditory (canonical V -> A -> R -> K order)", () => {
    const result = scoreVarkAnswers(mixOfStyles({ visual: 6, auditory: 6, read: 0, kinesthetic: 0 }));
    expect(result.primary).toBe("visual");
    // The loser of the tie is 6 votes, which is >= ceil(6*0.8)=5, so it
    // qualifies as secondary.
    expect(result.secondary).toBe("auditory");
  });

  it("primary tie: auditory beats read when visual is absent", () => {
    const result = scoreVarkAnswers(mixOfStyles({ visual: 0, auditory: 5, read: 5, kinesthetic: 2 }));
    expect(result.primary).toBe("auditory");
    expect(result.secondary).toBe("read");
  });

  it("primary tie: read beats kinesthetic when V/A are absent", () => {
    const result = scoreVarkAnswers(mixOfStyles({ visual: 0, auditory: 0, read: 4, kinesthetic: 4 }));
    expect(result.primary).toBe("read");
    expect(result.secondary).toBe("kinesthetic");
  });

  it("three-way primary tie: canonical order still wins (visual first)", () => {
    const result = scoreVarkAnswers(mixOfStyles({ visual: 4, auditory: 4, read: 4, kinesthetic: 0 }));
    expect(result.primary).toBe("visual");
    // Runner-up (auditory, 4 votes) is >= ceil(4*0.8)=4 -> qualifies.
    expect(result.secondary).toBe("auditory");
  });
});

describe("scoreVarkAnswers — partial / degenerate input", () => {
  it("empty answers -> visual primary (canonical tiebreak on all-zero), null secondary", () => {
    // Every style is 0; canonical order gives visual. Runner-up also 0 votes,
    // which never qualifies as secondary.
    const result = scoreVarkAnswers({});
    expect(result.primary).toBe("visual");
    expect(result.secondary).toBeNull();
    expect(result.scores).toEqual({ visual: 0, auditory: 0, read: 0, kinesthetic: 0 });
  });

  it("skips unknown question ids, undefined and non-string answers", () => {
    const answers: Record<string, string | undefined | null> = {
      [VARK_QUESTIONS[0].id]: optionValue(0, "kinesthetic"),
      [VARK_QUESTIONS[1].id]: undefined,
      [VARK_QUESTIONS[2].id]: null,
      not_a_real_question_id: "vark_directions_v",
    };
    const result = scoreVarkAnswers(answers);
    expect(result.scores.kinesthetic).toBe(1);
    expect(result.scores.visual).toBe(0);
    expect(result.primary).toBe("kinesthetic");
    expect(result.secondary).toBeNull();
  });

  it("skips option values that don't match any option on the referenced question", () => {
    const result = scoreVarkAnswers({
      // Legitimate q1 id, but the value belongs to q2 -> ignored (must match
      // the specific question's option set to count).
      [VARK_QUESTIONS[0].id]: optionValue(1, "visual"),
      [VARK_QUESTIONS[1].id]: optionValue(1, "read"),
    });
    expect(result.scores).toEqual({ visual: 0, auditory: 0, read: 1, kinesthetic: 0 });
  });

  it("same inputs -> same output (deterministic, no hidden state)", () => {
    const answers = mixOfStyles({ visual: 3, auditory: 3, read: 3, kinesthetic: 3 });
    const a = scoreVarkAnswers(answers);
    const b = scoreVarkAnswers(answers);
    expect(a).toEqual(b);
  });
});
