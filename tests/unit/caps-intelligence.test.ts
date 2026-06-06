import { describe, it, expect } from "vitest";
import {
  calculateMasteryScore,
  getMasteryBand,
  getRecommendedAction,
  calculateTopicPriority,
} from "../../server/caps-intelligence";
import type { Topic } from "@shared/schema";

const mockTopic: Topic = {
  id: 1,
  subjectId: 1,
  name: "Algebra",
  nameAfrikaans: "Algebra",
  capsWeighting: "high",
  tenYearFrequency: "very_high",
  cognitiveLevel: "application",
  createdAt: new Date(),
  description: null,
  descriptionAfrikaans: null,
  examPaperSection: null,
  paperNumber: null,
  typicalMarks: null,
} as Topic;

describe("calculateMasteryScore", () => {
  it("returns 100 for perfect scores with no errors", () => {
    const score = calculateMasteryScore(100, 100, 100, 0, 0, 0, 10);
    expect(score).toBe(100);
  });

  it("returns low score for all-zero inputs (error penalty still contributes 10%)", () => {
    const score = calculateMasteryScore(0, 0, 0, 0, 0, 0, 0);
    expect(score).toBeLessThanOrEqual(10);
  });

  it("applies weighted formula: accuracy 35%, marks 35%, time 20%, errors 10%", () => {
    const score = calculateMasteryScore(80, 60, 70, 0, 0, 0, 10);
    const expected = Math.round(80 * 0.35 + 60 * 0.35 + 70 * 0.20 + 100 * 0.10);
    expect(score).toBe(expected);
  });

  it("clamps output to 0-100 range", () => {
    const high = calculateMasteryScore(150, 150, 150, 0, 0, 0, 5);
    expect(high).toBe(100);
    const low = calculateMasteryScore(-50, -50, -50, 100, 100, 100, 1);
    expect(low).toBe(0);
  });

  it("error penalty reduces score for many errors", () => {
    const noErrors = calculateMasteryScore(70, 70, 70, 0, 0, 0, 10);
    const manyErrors = calculateMasteryScore(70, 70, 70, 10, 10, 10, 10);
    expect(noErrors).toBeGreaterThan(manyErrors);
  });

  it("handles zero totalAttempts without dividing by zero", () => {
    const score = calculateMasteryScore(80, 80, 80, 5, 0, 0, 0);
    expect(typeof score).toBe("number");
    expect(isNaN(score)).toBe(false);
  });
});

describe("getMasteryBand", () => {
  it("returns 'red' for scores below 60", () => {
    expect(getMasteryBand(0)).toBe("red");
    expect(getMasteryBand(59)).toBe("red");
    expect(getMasteryBand(45)).toBe("red");
  });

  it("returns 'amber' for scores 60-75 inclusive", () => {
    expect(getMasteryBand(60)).toBe("amber");
    expect(getMasteryBand(70)).toBe("amber");
    expect(getMasteryBand(75)).toBe("amber");
  });

  it("returns 'green' for scores above 75", () => {
    expect(getMasteryBand(76)).toBe("green");
    expect(getMasteryBand(90)).toBe("green");
    expect(getMasteryBand(100)).toBe("green");
  });

  it("handles boundary values exactly", () => {
    expect(getMasteryBand(59)).toBe("red");
    expect(getMasteryBand(60)).toBe("amber");
    expect(getMasteryBand(75)).toBe("amber");
    expect(getMasteryBand(76)).toBe("green");
  });
});

describe("getRecommendedAction", () => {
  it("returns 'teach' for red band", () => {
    expect(getRecommendedAction("red")).toBe("teach");
  });

  it("returns 'practice' for amber band", () => {
    expect(getRecommendedAction("amber")).toBe("practice");
  });

  it("returns 'challenge' for green band", () => {
    expect(getRecommendedAction("green")).toBe("challenge");
  });
});

describe("calculateTopicPriority", () => {
  it("returns a priority object with topicId, topicName, and numeric priority", () => {
    const result = calculateTopicPriority(mockTopic, 50, 90);
    expect(result.topicId).toBe(mockTopic.id);
    expect(result.topicName).toBe(mockTopic.name);
    expect(typeof result.priority).toBe("number");
    expect(result.priority).toBeGreaterThan(0);
  });

  it("high CAPS weighting + very_high frequency + low mastery = high priority", () => {
    const lowMastery = calculateTopicPriority(mockTopic, 20, 90);
    const highMastery = calculateTopicPriority(mockTopic, 90, 90);
    expect(lowMastery.priority).toBeGreaterThan(highMastery.priority);
  });

  it("exam proximity factor amplifies priority when <30 days to exam", () => {
    const farExam = calculateTopicPriority(mockTopic, 50, 120);
    const nearExam = calculateTopicPriority(mockTopic, 50, 15);
    expect(nearExam.priority).toBeGreaterThan(farExam.priority);
  });

  it("sets recommendedAction based on mastery band", () => {
    const redResult = calculateTopicPriority(mockTopic, 30, 90);
    expect(redResult.recommendedAction).toBe("teach");

    const greenResult = calculateTopicPriority(mockTopic, 90, 90);
    expect(greenResult.recommendedAction).toBe("challenge");
  });

  it("returns examProximityFactor >= 1.0", () => {
    const result = calculateTopicPriority(mockTopic, 50, 90);
    expect(result.examProximityFactor).toBeGreaterThanOrEqual(1.0);
  });
});
