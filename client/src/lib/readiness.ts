export interface ReadinessStats {
  accuracy?: number | null;
  studyStreak?: number | null;
  questionsAnswered?: number | null;
}

export function calcReadiness(stats: ReadinessStats | null | undefined): number {
  const acc = Math.max(0, Math.min(100, Number(stats?.accuracy ?? 0) || 0));
  const streak = Math.max(0, Number(stats?.studyStreak ?? 0) || 0);
  const qAnswered = Math.max(0, Number(stats?.questionsAnswered ?? 0) || 0);

  const streakPart =
    streak >= 7 ? 35 :
    streak >= 3 ? 25 :
    streak >= 1 ? 15 : 0;
  const questionsPart = Math.min(35, qAnswered / 3);
  const accuracyPart = Math.min(30, acc * 0.3);

  return Math.min(100, Math.round(streakPart + questionsPart + accuracyPart));
}

export function readinessBand(score: number): "red" | "amber" | "green" {
  if (score >= 75) return "green";
  if (score >= 55) return "amber";
  return "red";
}

export function readinessBandLabel(score: number, isAf: boolean): string {
  const b = readinessBand(score);
  if (b === "green") return isAf ? "Goed" : "Good";
  if (b === "amber") return isAf ? "Matig" : "Fair";
  return isAf ? "Swak" : "Weak";
}
