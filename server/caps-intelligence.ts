/**
 * CAPS Intelligence Engine - Backend-only CAPS-aware tutoring system
 * 
 * This module provides:
 * - Mastery score calculation (0-100) based on accuracy, marks, time, errors
 * - Mastery band assignment (red/amber/green)
 * - Adaptive explanation generation based on mastery band
 * - Topic priority calculation using CAPS weighting and 10-year patterns
 * - Simulated NSC-style question and memo generation
 * 
 * LEGAL COMPLIANCE:
 * - All questions and memos are ORIGINAL and SIMULATED
 * - No DBE content is copied - only external links provided
 * - Official DBE reference: https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx
 */

import type { 
  TopicMastery, 
  Topic, 
  AdaptiveExplanation, 
  MasteryBand, 
  CognitiveLevel,
  TopicPriority,
  CapsWeighting,
  TenYearFrequency
} from "@shared/schema";

import { COGNITIVE_LEVEL_LABELS } from "./simulated-exams";

// Helper to get student-friendly cognitive level text
function getSimpleCognitiveLevel(level: CognitiveLevel, language: string = "english"): string {
  const labels = COGNITIVE_LEVEL_LABELS[level];
  if (language === "afrikaans") {
    return `${labels.simpleAf} - ${labels.descriptionAf}`;
  }
  return `${labels.simple} - ${labels.description}`;
}

// Official DBE Reference Link (for external linking only)
export const OFFICIAL_DBE_LINK = "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx";

// Compliance Disclaimer for all simulated content
export const SIMULATED_EXAM_DISCLAIMER = 
  "This is a simulated examination developed in alignment with the CAPS curriculum and NSC assessment standards. It is not an official DBE examination.";

/**
 * Calculate mastery score (0-100) from component metrics
 * Formula: (accuracy * 0.35) + (marksRatio * 0.35) + (timeEfficiency * 0.20) + (errorPenalty * 0.10)
 */
export function calculateMasteryScore(
  accuracyScore: number,
  marksRatio: number,
  timeEfficiency: number,
  conceptErrors: number,
  methodErrors: number,
  languageErrors: number,
  totalAttempts: number
): number {
  // Normalize scores to 0-100
  const normalizedAccuracy = Math.min(100, Math.max(0, accuracyScore));
  const normalizedMarks = Math.min(100, Math.max(0, marksRatio));
  const normalizedTime = Math.min(100, Math.max(0, timeEfficiency));
  
  // Calculate error penalty (fewer errors = higher score)
  const totalErrors = conceptErrors + methodErrors + languageErrors;
  const errorRate = totalAttempts > 0 ? (totalErrors / totalAttempts) : 0;
  const errorPenalty = Math.max(0, 100 - (errorRate * 100));
  
  // Weighted calculation
  const masteryScore = 
    (normalizedAccuracy * 0.35) +
    (normalizedMarks * 0.35) +
    (normalizedTime * 0.20) +
    (errorPenalty * 0.10);
  
  return Math.round(Math.min(100, Math.max(0, masteryScore)));
}

/**
 * Determine mastery band from score
 * RED: < 60 (Teach + Remediate)
 * AMBER: 60-75 (Guide + Practice)
 * GREEN: > 75 (Challenge + Exam Strategy)
 */
export function getMasteryBand(masteryScore: number): MasteryBand {
  if (masteryScore < 60) return "red";
  if (masteryScore <= 75) return "amber";
  return "green";
}

/**
 * Get recommended action based on mastery band
 */
export function getRecommendedAction(masteryBand: MasteryBand): "teach" | "practice" | "challenge" {
  switch (masteryBand) {
    case "red": return "teach";
    case "amber": return "practice";
    case "green": return "challenge";
    default: return "practice";
  }
}

/**
 * Calculate topic priority using the priority formula
 * priority = (CAPS_weight * 0.45) + (ten_year_frequency * 0.35) + ((1 - mastery_ratio) * 0.20)
 * Then multiply by exam proximity factor
 */
export function calculateTopicPriority(
  topic: Topic,
  masteryScore: number,
  daysToExam: number = 90
): TopicPriority {
  // Convert CAPS weighting to numeric (0-100)
  const capsWeightMap: Record<CapsWeighting, number> = {
    high: 100,
    medium: 70,
    low: 40
  };
  const capsWeight = capsWeightMap[topic.capsWeighting as CapsWeighting] || 70;
  
  // Convert 10-year frequency to numeric (0-100)
  const frequencyMap: Record<TenYearFrequency, number> = {
    very_high: 100,
    high: 80,
    medium: 60,
    low: 40,
    rare: 20
  };
  const tenYearFrequency = frequencyMap[topic.tenYearFrequency as TenYearFrequency] || 60;
  
  // Mastery ratio (inverted - lower mastery = higher priority)
  const masteryRatio = masteryScore / 100;
  
  // Base priority calculation
  let priority = 
    (capsWeight * 0.45) +
    (tenYearFrequency * 0.35) +
    ((1 - masteryRatio) * 100 * 0.20);
  
  // Exam proximity factor
  let examProximityFactor = 1.0;
  if (daysToExam > 90) examProximityFactor = 1.0;
  else if (daysToExam >= 60) examProximityFactor = 1.15;
  else if (daysToExam >= 30) examProximityFactor = 1.30;
  else examProximityFactor = 1.50;
  
  priority *= examProximityFactor;
  
  const masteryBand = getMasteryBand(masteryScore);
  
  return {
    topicId: topic.id,
    topicName: topic.name,
    priority: Math.round(priority),
    capsWeight,
    tenYearFrequency,
    masteryRatio,
    examProximityFactor,
    recommendedAction: getRecommendedAction(masteryBand)
  };
}

/**
 * Generate adaptive explanation based on mastery band
 * RED: Step-by-step, definitions, worked examples, common traps
 * AMBER: Assume basics, focus on method, highlight exam mistakes
 * GREEN: Minimal explanation, exam technique, mark-winning structure
 */
export function generateAdaptiveExplanation(
  masteryBand: MasteryBand,
  masteryScore: number,
  topic: Topic,
  questionText: string,
  memoText: string,
  learnerAnswer: string,
  cognitiveLevel: CognitiveLevel,
  language: string = "english"
): AdaptiveExplanation {
  let explanationText: string = "";
  let nextAction: string = "";
  const markingLogic: string[] = [];
  const commonTraps = topic.commonTraps || [];
  
  // Parse memo for marking points
  const memoLines = memoText.split('\n').filter(line => line.trim());
  memoLines.forEach((line, i) => {
    if (line.includes('✓') || line.includes('mark') || line.includes('Mark') || /\d/.test(line)) {
      markingLogic.push(line.trim());
    }
  });
  
  switch (masteryBand) {
    case "red":
      // Teach + Remediate: Full step-by-step explanation
      explanationText = generateRedExplanation(topic, questionText, memoText, cognitiveLevel, language);
      nextAction = language === "afrikaans"
        ? "Hersien die definisie vir hierdie onderwerp in jou handboek en probeer dan 'n soortgelyke oefenvraag. Jy het dit — stap vir stap!"
        : "Review the CAPS definition for this topic, then attempt a similar practice question. You've got this — one step at a time!";
      break;
      
    case "amber":
      // Guide + Practice: Focus on method, highlight mistakes
      explanationText = generateAmberExplanation(topic, questionText, memoText, learnerAnswer, cognitiveLevel, language);
      nextAction = language === "afrikaans"
        ? "Oefen nog 2–3 vrae oor hierdie onderwerp en fokus op die metode. Jy's op die regte pad!"
        : "Practice 2-3 more questions on this topic focusing on method. You're on the right track!";
      break;
      
    case "green":
      // Challenge + Exam Strategy: Minimal explanation, exam technique
      explanationText = generateGreenExplanation(topic, questionText, memoText, cognitiveLevel, language);
      nextAction = language === "afrikaans"
        ? "Gaan aan na 'n moeiliker vraag of 'n nuwe onderwerp. Jy beheers dit al goed — hou so aan!"
        : "Move on to a higher-order question or different topic. You're mastering this — keep going!";
      break;
  }
  
  // Return in ALL required keys for unknown frontend payload safety
  return {
    explanation: explanationText,
    feedback: explanationText,
    message: explanationText,
    memo_hint: explanationText,
    explanation_level: masteryBand,
    mastery_score: masteryScore,
    marking_logic: markingLogic,
    common_traps: commonTraps as string[],
    next_action: nextAction,
    caps_topic: topic.capsCode || topic.name,
    cognitive_level: cognitiveLevel
  };
}

function generateRedExplanation(
  topic: Topic, 
  questionText: string, 
  memoText: string, 
  cognitiveLevel: CognitiveLevel,
  language: string
): string {
  const topicName = language === "afrikaans" ? topic.nameAfrikaans : topic.name;
  const commonTraps = topic.commonTraps || [];
  const isAf = language === "afrikaans";
  
  let explanation = "";
  
  if (isAf) {
    explanation += `📚 **Kom ons verstaan ${topicName} saam**\n\n`;
    explanation += `Hierdie vraag toets jou begrip van ${topicName}. Moenie bekommerd wees nie — ons gaan dit stap vir stap deur!\n`;
    explanation += `**Vaardigheidsvlak:** ${getSimpleCognitiveLevel(cognitiveLevel, language)}\n\n`;
    
    explanation += `📝 **Stap-vir-Stap Oplossing:**\n\n`;
    
    const memoLines = memoText.split('\n').filter(line => line.trim());
    memoLines.forEach((line, i) => {
      explanation += `Stap ${i + 1}: ${line.trim()}\n`;
    });
    
    explanation += `\n💯 **Punte:**\n`;
    explanation += `Elke stap hierbo dra punte. Maak seker jy wys AL jou berekeninge — selfs al dink jy dit is te eenvoudig!\n\n`;
    
    if (commonTraps.length > 0) {
      explanation += `⚠️ **Pasop vir hierdie foute:**\n`;
      commonTraps.forEach((trap, i) => {
        explanation += `${i + 1}. ${trap}\n`;
      });
    }
    
    explanation += `\n💡 **Eksamenwenk:** ${topic.examTips || "Wys altyd jou werk en kontroleer jou eenhede. Die meester hou jou gedagtegang raak!"}\n`;
  } else {
    explanation += `📚 **Understanding ${topicName}**\n\n`;
    explanation += `This question tests your understanding of ${topicName}.\n`;
    explanation += `**Skill Level:** ${getSimpleCognitiveLevel(cognitiveLevel, language)}\n\n`;
    
    explanation += `📝 **Step-by-Step Solution:**\n\n`;
    
    const memoLines = memoText.split('\n').filter(line => line.trim());
    memoLines.forEach((line, i) => {
      explanation += `Step ${i + 1}: ${line.trim()}\n`;
    });
    
    explanation += `\n💯 **Mark Allocation:**\n`;
    explanation += `Each step above carries marks. Make sure you show ALL working.\n\n`;
    
    if (commonTraps.length > 0) {
      explanation += `⚠️ **Common Learner Errors to Avoid:**\n`;
      commonTraps.forEach((trap, i) => {
        explanation += `${i + 1}. ${trap}\n`;
      });
    }
    
    explanation += `\n💡 **Exam Tip:** ${topic.examTips || "Always show your working and check your units."}\n`;
  }
  
  return explanation;
}

function generateAmberExplanation(
  topic: Topic, 
  questionText: string, 
  memoText: string,
  learnerAnswer: string,
  cognitiveLevel: CognitiveLevel,
  language: string
): string {
  const topicName = language === "afrikaans" ? topic.nameAfrikaans : topic.name;
  const isAf = language === "afrikaans";
  
  let explanation = "";
  
  if (isAf) {
    explanation += `📋 **Metodefokus vir ${topicName}:**\n\n`;
    
    explanation += `Jy's al op dreef! Die korrekte aanpak is:\n`;
    const memoLines = memoText.split('\n').filter(line => line.trim());
    memoLines.slice(0, 3).forEach((line, i) => {
      explanation += `• ${line.trim()}\n`;
    });
    
    explanation += `\n⚠️ **Pasop vir:**\n`;
    const commonTraps = topic.commonTraps || ["Vergeet om werk te wys", "Eenheidsomskakelingfoute"];
    commonTraps.slice(0, 2).forEach(trap => {
      explanation += `• ${trap}\n`;
    });
    
    explanation += `\n✅ **Onthou net:** Fokus op die metode, nie net die antwoord nie. Die punte is in jou werkwyse!\n`;
  } else {
    explanation += `📋 **Method Focus for ${topicName}:**\n\n`;
    
    explanation += `The correct approach involves:\n`;
    const memoLines = memoText.split('\n').filter(line => line.trim());
    memoLines.slice(0, 3).forEach((line, i) => {
      explanation += `• ${line.trim()}\n`;
    });
    
    explanation += `\n⚠️ **Watch Out:**\n`;
    const commonTraps = topic.commonTraps || ["Forgetting to show working", "Unit conversion errors"];
    commonTraps.slice(0, 2).forEach(trap => {
      explanation += `• ${trap}\n`;
    });
    
    explanation += `\n✅ **Key Takeaway:** Focus on the method, not just the answer.\n`;
  }
  
  return explanation;
}

function generateGreenExplanation(
  topic: Topic, 
  questionText: string, 
  memoText: string,
  cognitiveLevel: CognitiveLevel,
  language: string
): string {
  const topicName = language === "afrikaans" ? topic.nameAfrikaans : topic.name;
  const isAf = language === "afrikaans";
  
  let explanation = "";
  
  if (isAf) {
    explanation += `✅ **${topicName} — Vinnige Kontrole:**\n\n`;
    
    explanation += `📊 **Eksamenstrategie:**\n`;
    explanation += `• Beplan jou tyd per punt (gewoonlik 1–1.5 minute per punt)\n`;
    explanation += `• Struktureer jou antwoord duidelik met stappe\n`;
    explanation += `• Sluit eenhede en korrekte beduidende syfers in\n\n`;
    
    explanation += `🎯 **Wenke om ekstra punte te kry:**\n`;
    explanation += `• Stel eers die formule/beginsel\n`;
    explanation += `• Vervang waardes met eenhede\n`;
    explanation += `• Omkring of lig jou finale antwoord uit\n\n`;
    
    if (cognitiveLevel === "higher_order") {
      explanation += `💪 **Daag jouself uit:** Kan jy verduidelik WAAROM hierdie metode werk, nie net HOE nie? Dis wat 'n A-leerder van 'n B-leerder skei!\n`;
    }
  } else {
    explanation += `✅ **${topicName} - Quick Check:**\n\n`;
    
    explanation += `📊 **Exam Technique:**\n`;
    explanation += `• Allocate time per mark (typically 1-1.5 minutes per mark)\n`;
    explanation += `• Structure your answer clearly with steps\n`;
    explanation += `• Include units and appropriate significant figures\n\n`;
    
    explanation += `🎯 **Mark-Winning Tips:**\n`;
    explanation += `• State the formula/principle first\n`;
    explanation += `• Substitute values with units\n`;
    explanation += `• Circle or box your final answer\n\n`;
    
    if (cognitiveLevel === "higher_order") {
      explanation += `💪 **Challenge Yourself:** Can you explain WHY this method works, not just HOW?\n`;
    }
  }
  
  return explanation;
}

/**
 * Calculate time efficiency score (0-100)
 * 100 = completed in expected time or less
 * Decreases as time used exceeds expected time
 */
export function calculateTimeEfficiency(
  timeSpentSeconds: number,
  expectedTimeSeconds: number
): number {
  if (expectedTimeSeconds <= 0) return 100;
  if (timeSpentSeconds <= expectedTimeSeconds) return 100;
  
  const ratio = timeSpentSeconds / expectedTimeSeconds;
  // Score decreases as ratio increases beyond 1
  const efficiency = Math.max(0, 100 - ((ratio - 1) * 50));
  return Math.round(efficiency);
}

/**
 * Update mastery score after an attempt
 * Uses exponential moving average for smooth updates
 */
export function updateMasteryAfterAttempt(
  currentMastery: TopicMastery,
  attemptCorrect: boolean,
  marksAwarded: number,
  marksAvailable: number,
  timeSpentSeconds: number,
  expectedTimeSeconds: number,
  errorType: string | null
): Partial<TopicMastery> {
  const alpha = 0.3; // Smoothing factor for EMA
  
  // Update counts
  const questionsAttempted = currentMastery.questionsAttempted + 1;
  const questionsCorrect = currentMastery.questionsCorrect + (attemptCorrect ? 1 : 0);
  const totalMarksEarned = currentMastery.totalMarksEarned + marksAwarded;
  const totalMarksAvailable = currentMastery.totalMarksAvailable + marksAvailable;
  
  // Update error counts
  let conceptErrors = currentMastery.conceptErrors;
  let methodErrors = currentMastery.methodErrors;
  let languageErrors = currentMastery.languageErrors;
  
  if (errorType === "concept") conceptErrors++;
  else if (errorType === "method") methodErrors++;
  else if (errorType === "language") languageErrors++;
  
  // Calculate new component scores
  const accuracyScore = Math.round((questionsCorrect / questionsAttempted) * 100);
  const marksRatio = Math.round((totalMarksEarned / totalMarksAvailable) * 100);
  const timeEfficiency = calculateTimeEfficiency(timeSpentSeconds, expectedTimeSeconds);
  
  // Calculate new mastery score
  const newMasteryScore = calculateMasteryScore(
    accuracyScore,
    marksRatio,
    timeEfficiency,
    conceptErrors,
    methodErrors,
    languageErrors,
    questionsAttempted
  );
  
  // Update consecutive tracking
  let consecutiveCorrect = attemptCorrect ? currentMastery.consecutiveCorrect + 1 : 0;
  let consecutiveIncorrect = attemptCorrect ? 0 : currentMastery.consecutiveIncorrect + 1;
  
  // Update confidence level based on consecutive performance
  let confidenceLevel = currentMastery.confidenceLevel;
  if (consecutiveCorrect >= 3) {
    confidenceLevel = Math.min(100, confidenceLevel + 10);
  } else if (consecutiveIncorrect >= 2) {
    confidenceLevel = Math.max(0, confidenceLevel - 15);
  }
  
  // Calculate spaced repetition interval
  const masteryBand = getMasteryBand(newMasteryScore);
  let reviewInterval = currentMastery.reviewInterval;
  
  if (masteryBand === "green" && attemptCorrect) {
    // Increase interval for mastered topics
    reviewInterval = Math.min(30, reviewInterval * 2);
  } else if (masteryBand === "red" || !attemptCorrect) {
    // Decrease interval for struggling topics
    reviewInterval = Math.max(1, Math.floor(reviewInterval / 2));
  }
  
  const now = new Date();
  const nextReviewAt = new Date(now.getTime() + reviewInterval * 24 * 60 * 60 * 1000);
  
  return {
    masteryScore: newMasteryScore,
    masteryBand,
    accuracyScore,
    marksRatio,
    timeEfficiency,
    conceptErrors,
    methodErrors,
    languageErrors,
    questionsAttempted,
    questionsCorrect,
    totalMarksEarned,
    totalMarksAvailable,
    lastAttemptAt: now,
    nextReviewAt,
    reviewInterval,
    confidenceLevel,
    consecutiveCorrect,
    consecutiveIncorrect,
    updatedAt: now
  };
}

/**
 * NSC Command Verbs for CAPS-aligned questions
 * Organized by cognitive level
 */
export const NSC_COMMAND_VERBS = {
  knowledge: [
    "Define", "State", "Name", "List", "Identify", "Label", "Describe",
    "Give", "Write", "Recall", "Select", "Match"
  ],
  application: [
    "Calculate", "Determine", "Apply", "Solve", "Use", "Demonstrate",
    "Show", "Illustrate", "Classify", "Compare", "Distinguish", "Explain"
  ],
  higher_order: [
    "Analyse", "Evaluate", "Justify", "Predict", "Discuss", "Assess",
    "Critique", "Argue", "Deduce", "Formulate", "Synthesise", "Design"
  ]
};

/**
 * Get cognitive level from command verb
 */
export function getCognitiveLevelFromVerb(verb: string): CognitiveLevel {
  const lowerVerb = verb.toLowerCase();
  
  for (const v of NSC_COMMAND_VERBS.knowledge) {
    if (v.toLowerCase() === lowerVerb) return "knowledge";
  }
  for (const v of NSC_COMMAND_VERBS.application) {
    if (v.toLowerCase() === lowerVerb) return "application";
  }
  for (const v of NSC_COMMAND_VERBS.higher_order) {
    if (v.toLowerCase() === lowerVerb) return "higher_order";
  }
  
  return "application"; // Default
}

/**
 * CAPS Topic Intelligence Data
 * Stored internally for predictive analytics (10-year patterns 2015-2025)
 */
export const CAPS_TOPIC_INTELLIGENCE: Record<string, {
  capsWeighting: CapsWeighting;
  tenYearFrequency: TenYearFrequency;
  tenYearLikelihood: number;
  paperNumber?: number;
  typicalMarks?: number;
  cognitiveKnowledge: number;
  cognitiveApplication: number;
  cognitiveHigherOrder: number;
  examTips: string;
  commonTraps: string[];
}> = {
  // Mathematics Topics
  "MATH-1": {
    capsWeighting: "high",
    tenYearFrequency: "very_high",
    tenYearLikelihood: 95,
    paperNumber: 1,
    typicalMarks: 25,
    cognitiveKnowledge: 20,
    cognitiveApplication: 50,
    cognitiveHigherOrder: 30,
    examTips: "Arithmetic and geometric sequences appear every year. Know sigma notation thoroughly.",
    commonTraps: ["Confusing arithmetic and geometric formulas", "Incorrect use of sigma notation", "Not checking if sequence converges"]
  },
  "MATH-2": {
    capsWeighting: "high",
    tenYearFrequency: "very_high",
    tenYearLikelihood: 100,
    paperNumber: 1,
    typicalMarks: 30,
    cognitiveKnowledge: 15,
    cognitiveApplication: 55,
    cognitiveHigherOrder: 30,
    examTips: "Know all function types and their inverses. Sketch graphs accurately with intercepts.",
    commonTraps: ["Forgetting domain restrictions for inverses", "Incorrect reflection of inverse graphs", "Missing asymptotes"]
  },
  "MATH-7": {
    capsWeighting: "high",
    tenYearFrequency: "very_high",
    tenYearLikelihood: 100,
    paperNumber: 1,
    typicalMarks: 35,
    cognitiveKnowledge: 15,
    cognitiveApplication: 50,
    cognitiveHigherOrder: 35,
    examTips: "Calculus is the highest-weighted topic. Master first principles, differentiation rules, and applications.",
    commonTraps: ["Forgetting to use first principles when asked", "Sign errors in derivatives", "Not interpreting turning points correctly"]
  },
  "MATH-9": {
    capsWeighting: "high",
    tenYearFrequency: "very_high",
    tenYearLikelihood: 100,
    paperNumber: 2,
    typicalMarks: 40,
    cognitiveKnowledge: 10,
    cognitiveApplication: 40,
    cognitiveHigherOrder: 50,
    examTips: "Euclidean Geometry requires strong proof skills. State all theorems clearly.",
    commonTraps: ["Not stating reasons for statements", "Circular reasoning in proofs", "Forgetting to consider all cases"]
  },
  // Physical Sciences Topics
  "PHYS-1": {
    capsWeighting: "high",
    tenYearFrequency: "very_high",
    tenYearLikelihood: 95,
    paperNumber: 1,
    typicalMarks: 25,
    cognitiveKnowledge: 20,
    cognitiveApplication: 50,
    cognitiveHigherOrder: 30,
    examTips: "Momentum and impulse questions often involve collisions. Know conservation principles.",
    commonTraps: ["Forgetting direction (vector nature)", "Not using consistent sign convention", "Confusing elastic and inelastic collisions"]
  },
  "PHYS-3": {
    capsWeighting: "high",
    tenYearFrequency: "very_high",
    tenYearLikelihood: 100,
    paperNumber: 2,
    typicalMarks: 45,
    cognitiveKnowledge: 25,
    cognitiveApplication: 45,
    cognitiveHigherOrder: 30,
    examTips: "Organic Chemistry is heavily weighted. Know functional groups, reactions, and IUPAC naming.",
    commonTraps: ["Incorrect IUPAC naming", "Confusing elimination and substitution", "Forgetting structural isomers"]
  },
  "PHYS-6": {
    capsWeighting: "high",
    tenYearFrequency: "very_high",
    tenYearLikelihood: 95,
    paperNumber: 1,
    typicalMarks: 30,
    cognitiveKnowledge: 15,
    cognitiveApplication: 55,
    cognitiveHigherOrder: 30,
    examTips: "Electric circuits combine theory and calculations. Draw circuit diagrams neatly.",
    commonTraps: ["Incorrect parallel/series combination", "Forgetting internal resistance", "Unit conversion errors"]
  },
  // Life Sciences Topics
  "LIFE-1": {
    capsWeighting: "high",
    tenYearFrequency: "very_high",
    tenYearLikelihood: 95,
    paperNumber: 1,
    typicalMarks: 45,
    cognitiveKnowledge: 30,
    cognitiveApplication: 40,
    cognitiveHigherOrder: 30,
    examTips: "DNA and genetics appear every year. Know transcription, translation, and inheritance patterns.",
    commonTraps: ["Confusing mRNA and tRNA", "Incorrect Punnett square setup", "Forgetting to consider codominance"]
  },
  // Accounting Topics
  "ACC-1": {
    capsWeighting: "high",
    tenYearFrequency: "very_high",
    tenYearLikelihood: 100,
    typicalMarks: 80,
    cognitiveKnowledge: 20,
    cognitiveApplication: 50,
    cognitiveHigherOrder: 30,
    examTips: "Financial statements are heavily weighted. Know formats and adjustments.",
    commonTraps: ["Incorrect classification of items", "Forgetting depreciation adjustments", "VAT calculation errors"]
  }
};
