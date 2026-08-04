import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ONBOARDING_QUESTIONS, GRADE_12_SUBJECTS } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Loader2, Globe, Check, Sparkles, Search, Eye, RotateCcw, ShieldCheck, MailCheck, AlertTriangle, Copy, Link2, Clock } from "lucide-react";
import iconTransparent from "@/assets/handoff/icon-transparent.png";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { type VarkStyle, VARK_STYLES, VARK_QUESTIONS, scoreVarkAnswers } from "@/lib/vark";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import {
  isOnboardingPreview,
  createPreviewGate,
  installPreviewWriteTripwire,
  ONBOARDING_PREVIEW_SAMPLE,
} from "@/lib/onboarding-preview";
import {
  type ConsentDelivery,
  parentEmailIssue,
  isValidParentEmail,
  consentShareMode,
  canLeaveConsentPhase,
} from "@/lib/parent-consent";

interface SubjectMark {
  subjectCode: string;
  subjectName: string;
  mark: number;
}

type Answers = Record<string, string | string[] | number>;

// Validate a South African ID number: exactly 13 digits, a valid YYMMDD date
// in positions 1-6, and a correct Luhn (mod-10) check digit. Citizenship and
// gender digits are intentionally NOT validated.
function isValidSaIdNumber(raw: string): boolean {
  const id = (raw ?? "").trim();
  if (!/^\d{13}$/.test(id)) return false;

  const month = parseInt(id.slice(2, 4), 10);
  const day = parseInt(id.slice(4, 6), 10);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  let sum = 0;
  let alternate = false;
  for (let i = id.length - 1; i >= 0; i--) {
    let n = id.charCodeAt(i) - 48;
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function calculateTraits(answers: Answers) {
  const traits: Record<string, string> = {};

  // Study Habits trait
  const studyFreq = answers.study_frequency;
  const noteTaking = answers.note_taking;
  if (studyFreq === "daily" && noteTaking !== "none") {
    traits.studyHabits = "excellent";
  } else if (studyFreq === "few_times" || studyFreq === "daily") {
    traits.studyHabits = "good";
  } else if (studyFreq === "weekends") {
    traits.studyHabits = "developing";
  } else {
    traits.studyHabits = "needs_work";
  }

  // Focus Level trait
  const focusDuration = answers.focus_duration as number;
  const distraction = answers.distraction_level;
  if (focusDuration >= 60 && (distraction === "rarely" || distraction === "sometimes")) {
    traits.focusLevel = "high";
  } else if (focusDuration >= 45 || distraction === "sometimes") {
    traits.focusLevel = "moderate";
  } else if (focusDuration >= 30) {
    traits.focusLevel = "low";
  } else {
    traits.focusLevel = "very_low";
  }

  // Practice Style trait
  const practiceMethod = answers.practice_method;
  const mistakeResponse = answers.mistake_response;
  if (practiceMethod === "past_papers" && (mistakeResponse === "analyze" || mistakeResponse === "redo")) {
    traits.practiceStyle = "active";
  } else if (mistakeResponse === "skip" || practiceMethod === "flashcards") {
    traits.practiceStyle = "passive";
  } else {
    traits.practiceStyle = "mixed";
  }

  // Stress Resilience trait
  const examAnxiety = answers.exam_anxiety;
  const stressMgmt = answers.stress_management;
  if (examAnxiety === "calm" || (examAnxiety === "nervous" && stressMgmt !== "nothing")) {
    traits.stressResilience = "high";
  } else if (examAnxiety === "nervous" || examAnxiety === "stressed") {
    traits.stressResilience = "moderate";
  } else {
    traits.stressResilience = "low";
  }

  // Planning Ability trait
  const planningStyle = answers.planning_style;
  const procrastination = answers.procrastination;
  if (planningStyle === "schedule" && (procrastination === "never" || procrastination === "sometimes")) {
    traits.planningAbility = "strong";
  } else if (planningStyle === "loose" || procrastination === "sometimes") {
    traits.planningAbility = "moderate";
  } else {
    traits.planningAbility = "weak";
  }

  return traits;
}

function calculateRecommendations(answers: Answers, traits: Record<string, string>) {
  const recommendations: Record<string, unknown> = {};

  // Calculate recommended session length based on focus duration and traits
  const focusDuration = answers.focus_duration as number || 45;
  const distraction = answers.distraction_level;

  let sessionLength = focusDuration;
  if (distraction === "often" || distraction === "always") {
    sessionLength = Math.min(30, focusDuration);
  } else if (distraction === "rarely") {
    sessionLength = Math.min(90, focusDuration + 15);
  }
  recommendations.sessionLength = sessionLength;
  recommendations.breakDuration = sessionLength >= 60 ? 15 : 10;

  // Calculate weekly routine based on study frequency and planning style
  const studyFreq = answers.study_frequency;
  const studyTime = answers.study_time;
  const planningStyle = answers.planning_style;

  let sessionsPerWeek = 3;
  if (studyFreq === "daily") sessionsPerWeek = 6;
  else if (studyFreq === "few_times") sessionsPerWeek = 4;
  else if (studyFreq === "weekends") sessionsPerWeek = 2;
  else sessionsPerWeek = 2;

  recommendations.weeklyRoutine = {
    sessionsPerWeek,
    preferredTime: studyTime || "evening",
    structureLevel: planningStyle === "schedule" ? "structured" : planningStyle === "loose" ? "flexible" : "minimal",
  };

  // Calculate subject risk flags based on stress, focus, and practice style
  const riskFlags: string[] = [];

  if (traits.stressResilience === "low") {
    riskFlags.push("Mathematics", "Physical Sciences"); // High-pressure subjects
  }
  if (traits.focusLevel === "low" || traits.focusLevel === "very_low") {
    riskFlags.push("Accounting", "Mathematics"); // Detail-oriented subjects
  }
  if (traits.practiceStyle === "passive") {
    riskFlags.push("Physical Sciences", "Life Sciences"); // Subjects requiring active practice
  }
  if (traits.planningAbility === "weak") {
    riskFlags.push("History", "Geography"); // Content-heavy subjects needing planning
  }
  if (answers.exam_performance === "worse") {
    riskFlags.push("English Home Language"); // Exam technique issues
  }

  // Remove duplicates
  recommendations.subjectRiskFlags = Array.from(new Set(riskFlags));

  // Study tips based on traits
  const tips: string[] = [];
  if (traits.focusLevel === "low" || traits.focusLevel === "very_low") {
    tips.push("Use the Pomodoro technique with short focused bursts");
  }
  if (traits.stressResilience === "low") {
    tips.push("Practice relaxation techniques before exams");
  }
  if (traits.planningAbility === "weak") {
    tips.push("Start with a simple weekly study timetable");
  }
  if (traits.practiceStyle === "passive") {
    tips.push("Focus more on past papers and active recall");
  }
  recommendations.studyTips = tips;

  return recommendations;
}

const ONBOARDING_STORAGE_KEY = "braintrack_onboarding_state_v1";

type Phase = "questions" | "vark" | "subjects" | "school" | "parent_consent";

type PersistedState = {
  currentStep: number;
  phase: Phase;
  language: "en" | "af";
  answers: Answers;
  varkPrimary: VarkStyle | null;
  varkSecondary: VarkStyle | null;
  // Per-question answers for the VARK questionnaire, keyed by VARK_QUESTIONS[i].id.
  // Kept alongside the committed primary/secondary so a mid-questionnaire reload
  // returns the learner to their current step rather than restarting.
  varkAnswers: Record<string, string>;
  // Position within the VARK phase. 0..VARK_QUESTIONS.length-1 = a question,
  // VARK_QUESTIONS.length = the result view.
  varkStep: number;
  subjectMarks: SubjectMark[];
  selectedSubjects: string[];
  schoolName?: string;
  schoolId?: number | null;
  grade?: number | null;
  parentEmail?: string;
  firstName?: string;
  lastName?: string;
  idNumber?: string;
};

function loadPersistedState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const obj = parsed as Record<string, unknown>;

    const validPhases = ["questions", "vark", "subjects", "school", "parent_consent"] as const;
    const validLangs = ["en", "af"] as const;
    const validVark: readonly VarkStyle[] = ["visual", "auditory", "read", "kinesthetic"];

    const isPhase = (v: unknown): v is PersistedState["phase"] =>
      typeof v === "string" && (validPhases as readonly string[]).includes(v);
    const isLang = (v: unknown): v is PersistedState["language"] =>
      typeof v === "string" && (validLangs as readonly string[]).includes(v);
    const isVark = (v: unknown): v is VarkStyle =>
      typeof v === "string" && (validVark as readonly string[]).includes(v);
    const isSubjectMark = (v: unknown): v is SubjectMark => {
      if (!v || typeof v !== "object") return false;
      const r = v as Record<string, unknown>;
      return (
        typeof r.subjectCode === "string" &&
        typeof r.subjectName === "string" &&
        typeof r.mark === "number"
      );
    };

    const phase: PersistedState["phase"] = isPhase(obj.phase) ? obj.phase : "questions";
    const language: PersistedState["language"] = isLang(obj.language) ? obj.language : "en";
    const rawStep = typeof obj.currentStep === "number" ? obj.currentStep : 0;
    const currentStep = Math.max(0, Math.min(ONBOARDING_QUESTIONS.length - 1, Math.floor(rawStep)));
    const answers: Answers =
      obj.answers && typeof obj.answers === "object" && !Array.isArray(obj.answers)
        ? (obj.answers as Answers)
        : { focus_duration: 45 };
    const varkPrimary: VarkStyle | null = isVark(obj.varkPrimary) ? obj.varkPrimary : null;
    const varkSecondary: VarkStyle | null =
      isVark(obj.varkSecondary) && obj.varkSecondary !== varkPrimary ? obj.varkSecondary : null;
    // Per-question answers: only keep entries where BOTH the key matches one
    // of our questions and the value matches one of that question's options.
    // A wildly stale draft (older question set, different values) is discarded
    // silently rather than blowing up the resume path.
    const rawVarkAnswers =
      obj.varkAnswers && typeof obj.varkAnswers === "object" && !Array.isArray(obj.varkAnswers)
        ? (obj.varkAnswers as Record<string, unknown>)
        : {};
    const varkAnswers: Record<string, string> = {};
    for (const q of VARK_QUESTIONS) {
      const val = rawVarkAnswers[q.id];
      if (typeof val === "string" && q.options.some((o) => o.value === val)) {
        varkAnswers[q.id] = val;
      }
    }
    const rawVarkStep = typeof obj.varkStep === "number" ? Math.floor(obj.varkStep) : 0;
    const varkStep = Math.max(0, Math.min(VARK_QUESTIONS.length, rawVarkStep));
    const subjectMarks: SubjectMark[] = Array.isArray(obj.subjectMarks)
      ? obj.subjectMarks.filter(isSubjectMark).map((s) => ({
          subjectCode: s.subjectCode,
          subjectName: s.subjectName,
          mark: Math.max(0, Math.min(100, Math.floor(s.mark))),
        }))
      : [];
    const selectedSubjects: string[] = Array.isArray(obj.selectedSubjects)
      ? obj.selectedSubjects.filter((s): s is string => typeof s === "string")
      : subjectMarks.map((s) => s.subjectCode);

    const schoolName = typeof obj.schoolName === "string" ? obj.schoolName : undefined;
    const schoolId = typeof obj.schoolId === "number" ? obj.schoolId : null;
    // BrainTrack is a Grade 12 / NSC product — grade is always 12.
    const grade = 12;
    const parentEmail = typeof obj.parentEmail === "string" ? obj.parentEmail : undefined;
    const firstName = typeof obj.firstName === "string" ? obj.firstName : undefined;
    const lastName = typeof obj.lastName === "string" ? obj.lastName : undefined;
    const idNumber = typeof obj.idNumber === "string" ? obj.idNumber : undefined;

    return {
      currentStep,
      phase,
      language,
      answers,
      varkPrimary,
      varkSecondary,
      varkAnswers,
      varkStep,
      subjectMarks,
      selectedSubjects,
      schoolName,
      schoolId,
      grade,
      parentEmail,
      firstName,
      lastName,
      idNumber,
    };
  } catch {
    return null;
  }
}

const T = {
  en: {
    pageTitle: "Study Profile",
    backBtn: "Back",
    nextBtn: "Next",
    submitBtn: "Finish",
    submitting: "Saving...",
    progressLabel: "Step",
    ofLabel: "of",
    changeRole: "Change role",
    grade12Label: "Grade 12",
    nscLabel: "NSC 2025",
    welcomeHeading: "Let's set up your study profile",
    welcomeSubtitle: "Answer a few quick questions so we can personalise your experience.",
    schoolLabel: "School Name",
    schoolPlaceholder: "Start typing your school…",
    schoolNotFound: "School not found? Type the full name and continue.",
    parentEmailLabel: "Parent / Guardian email",
    parentEmailPlaceholder: "parent@email.com",
    parentEmailHint: "We'll send them a link to activate your learning journey.",
    subjectsHeading: "Which subjects are you writing?",
    subjectsHint: "Select all that apply.",
    studyGoalHeading: "What is your study goal?",
    targetMarkHeading: "What target mark are you aiming for?",
    studyHoursHeading: "How many hours per day can you study?",
    varkHeading: "How do you learn best?",
    varkHint: "Select your preferred learning styles.",
    varkQuestionnaireSubtitle: "Twelve quick scenarios — pick what actually sounds like you.",
    varkScenarioProgress: "Scenario {n} of {total}",
    varkResultHeading: "Your learning profile",
    varkResultSubtitle: "Based on your 12 answers — this is how your brain likes to be taught.",
    varkPrimaryHeading: "Your primary style",
    varkSecondaryHeading: "Also strong in",
    varkNoSecondary: "Your primary style is really clear — no strong secondary this time.",
    varkRetakeBtn: "Retake questionnaire",
    varkSkipBtn: "Skip for now — you can set this later",
    consentSent: "Consent link sent!",
    consentSentDesc: "We emailed your parent. Ask them to approve your account.",
    consentNotConfigured: "Email not configured",
    consentNotConfiguredDesc: "Ask your parent to visit braintrack.tech/parent to register.",
    consentFailed: "Could not send link",
    consentFailedDesc: "Please ask your parent to register directly at braintrack.tech/parent.",
    profileCreated: "Profile created!",
    profileCreatedDesc: "Your study profile is ready. Let's go.",
    saveError: "Could not save your profile. Please try again.",
    requiredField: "This field is required.",
    error: "Error",
    cannotChangeRole: "Cannot Change Role",
    cannotChangeRoleDesc: "Role change is only available before onboarding is complete.",
    questionsSubtitle: "Let's build your personalized plan.",
    varkSubtitle: "How do you learn best? Pick your primary style.",
    subjectsSubtitle: "Tell us how you're performing currently.",
    completeLabel: "Complete",
    progressBarLabel: "Progress",
    questionLabel: "Question",
    selectAllThatApply: "Select all that apply",
    minutesLabel: "Minutes",
    primaryStyleLabel: "Primary Style (required)",
    secondaryStyleLabel: "Secondary Style (optional)",
    selectSubjectsHeading: "Select Your Subjects",
    selectSubjectsHint: "Select 6+ subjects and enter your latest marks (%)",
    schoolGradeHeading: "Your School",
    schoolSearchHint: "Search for your school below. If we don't have it yet, just type the name and we'll add it as pending.",
    schoolNameLabel: "School name",
    identityHeading: "Your details",
    firstNameLabel: "First name",
    firstNamePlaceholder: "First name",
    lastNameLabel: "Surname",
    lastNamePlaceholder: "Surname",
    idNumberLabel: "SA ID number",
    idNumberPlaceholder: "13-digit ID number",
    idNumberHint: "We use this to match your NSC results. It's kept private.",
    firstNameRequired: "Please enter your first name.",
    lastNameRequired: "Please enter your surname.",
    idNumberInvalid: "Enter a valid 13-digit South African ID number.",
    schoolSearchingLabel: "Searching…",
    schoolLinkedLabel: "✓ Linked to a partner school",
    schoolPendingLabel: "We'll save this as a pending school until we verify it.",
    gradeLabel: "Grade",
    parentConsentHeading: "Parent / Guardian Consent",
    parentConsentHint: "Add your parent or guardian's email so they can confirm you're allowed to use Smart Tutor and full exam mode. The first 3 tutor questions a day are free; after that we'll need their consent.",
    resendBtn: "Resend",
    sendConsentEmailBtn: "Send consent email",
    emailSentLabel: "Email sent",
    manualShareLabel: "Manual share — email not configured",
    copyLinkBtn: "Copy link",
    consentSkipHint: "We've sent a consent request to your parent/guardian. You can continue once they confirm — or continue now to explore the free tier.",
    // ── Parent consent, expanded ───────────────────────────────────────────
    consentWhyMinorTitle: "You're under 18, so a grown-up signs off",
    consentWhyMinorBody: "South African law (POPIA) says a parent or guardian has to approve before we can use your info for the full BrainTrack experience. One click from them and you're through.",
    consentWhyAdultTitle: "You're 18+, so this one's optional",
    consentWhyAdultBody: "You can approve your own account. If you'd still like a parent or guardian to follow your progress, add their email — otherwise skip straight ahead.",
    consentTrustTitle: "What they'll get",
    consentTrustPoint1: "One email with your name and a single Approve button.",
    consentTrustPoint2: "No signup, no password, no payment — one click and it's done.",
    consentTrustPoint3: "We only use their address for this consent and your progress reports. Never sold, never spammed.",
    parentEmailErrEmpty: "Add your parent or guardian's email address.",
    parentEmailErrInvalid: "That doesn't look like an email address yet — check for a typo.",
    parentEmailErrSelf: "That's your own address. It has to be a parent or guardian's.",
    consentSentTitle: "Sent — check with your parent",
    consentSentBody: "The approval email is on its way to {email}. Ask them to look in their inbox (and the spam folder) and tap Approve.",
    consentDidntArriveBtn: "Didn't arrive? Send them the link yourself",
    consentNotConfiguredTitle: "You'll need to send this one yourself",
    consentNotConfiguredBody: "Email isn't switched on here, so we couldn't deliver it. Copy the link below and send it to your parent or guardian on WhatsApp — it does exactly the same thing.",
    consentFailedTitle: "The email didn't go through",
    consentFailedBody: "We couldn't deliver it to {email}. Send the link below to your parent or guardian yourself, or fix the address and try again.",
    consentLinkLabel: "Your parent's approval link",
    copiedBtn: "Copied!",
    copyFailedHint: "Couldn't copy automatically — tap the link above to select it.",
    changeEmailBtn: "Use a different address",
    sendAgainBtn: "Send again",
    consentWaitingTitle: "While you wait",
    consentWaitingBody: "Nothing's on hold — finish setting up and start studying now. The moment your parent approves, Smart Tutor and full exam mode unlock automatically.",
    consentRequiredHint: "Send the request to your parent or guardian to finish setting up.",
    consentOptionalHint: "Optional — you can finish without this.",
    preparingClassroomTitle: "Preparing your classroom…",
    preparingClassroomDesc: "Saving your profile and seeding your subjects.",
    consentRequestReady: "Consent request ready",
    consentSentByEmail: "We emailed your parent/guardian a confirmation link.",
    consentManualShare: "Email isn't configured here — share the link manually.",
    couldntSend: "Couldn't send",
    checkEmailAndRetry: "Please check the email address and try again.",
    selectMoreMsg: "Select at least {count} more subject{plural} to continue. Most Grade 12 learners take 6–7 subjects.",
    selectMorePlural: "s",
    termsAgree: "By creating a profile you agree to our",
    termsAnd: "and",
    termsLink: "Terms of Service",
    privacyLink: "Privacy Policy",
    dobEyebrow: "when did you land? 🛬",
    dobLabel: "Date of birth",
    dobDayPh: "DD",
    dobMonthPh: "MM",
    dobYearPh: "YYYY",
    dobHint: "Day / month / year — we only store a scrambled fingerprint of this, never the raw date.",
    dobInvalid: "Hmm, that date doesn't look right 🤔",
    dobMismatch: "That doesn't match the first 6 digits of your ID number 👀 — double-check both.",

    // ── Rizz-hosted journey ────────────────────────────────────────────────
    rizzName: "Rizz",
    rizzHi: "Yebo! I'm Rizz — your study wingman.",
    rizzHiSub: "Smarter study. Higher score. Brighter future.",
    rizzQstudy: "First up — how you actually study. No wrong answers here.",
    rizzQfocus: "Now let's talk focus. Be honest, I've seen worse.",
    rizzQpractice: "How you practise tells me how to feed you questions.",
    rizzQstress: "Exam nerves are normal. Let's map yours.",
    rizzQplanning: "Last stretch of questions. Discipline today, success tomorrow.",
    rizzVarkLine: "Now the good part — how does your brain like to be taught?",
    rizzSubjectsLine: "Pick your subjects. Tap a card, drop your latest mark. Easy.",
    rizzSubjectsDone: "6 locked in! Add more if you're writing more. Let's get it!",
    rizzSchoolLine: "Quick admin — who are you and where do you write?",
    rizzSchoolDone: "Perfect. That's your NSC results matched automatically.",
    rizzFinalLine: "You're set up. Let's get it!",
    rizzFinalSub: "I don't do easy. I make easy happen.",
    almostThere: "almost there!",
    startHere: "let's go!",
    journeyLabel: "Your setup journey",
    phaseYou: "You",
    phaseBrain: "Brain",
    phaseSubjects: "Subjects",
    phaseSchool: "School",
    phaseDone: "Done",
    subjectFilterPh: "Search subjects…",
    allSubjectsLabel: "All",
    subjectCountLabel: "subjects locked in",
    minimumHit: "minimum unlocked",
    markLabel: "Latest mark",
    noSubjectMatches: "No subject matches that. Try a shorter word.",
    nameQ: "What should I call you?",
    nameQHint: "Exactly as it appears on your ID — that's how the NSC matches you.",
    schoolQ: "Where do you write?",
    idQ: "Your SA ID number",
    dobQ: "When did you land?",
    youreSetTitle: "You're set for the year",
    youreSetSub: "Here's what I've got on you:",
    summarySubjectsLabel: "Subjects",
    summaryStyleLabel: "Learning style",
    summarySchoolLabel: "School",
    whatsNextTitle: "What happens next",
    whatsNextMinor: "Your parent/guardian confirms the link, then your full study plan unlocks. I'll be waiting.",
    whatsNextAdult: "Pick your plan and your first study session is ready. I'll be waiting.",
    letsGetIt: "Let's get it!",
    doneTag: "done",
    optionalTag: "optional",
    tapToChange: "Tap to change",
    questionProgress: "Question {n} of {total}",
  },
  af: {
    pageTitle: "Studieprofiel",
    backBtn: "Terug",
    nextBtn: "Volgende",
    submitBtn: "Klaar",
    submitting: "Stoor...",
    progressLabel: "Stap",
    ofLabel: "van",
    changeRole: "Verander rol",
    grade12Label: "Graad 12",
    nscLabel: "NSS 2025",
    welcomeHeading: "Kom ons stel jou studieprofiel op",
    welcomeSubtitle: "Beantwoord 'n paar vinnige vrae sodat ons jou ervaring kan personaliseer.",
    schoolLabel: "Skoolnaam",
    schoolPlaceholder: "Begin tik jou skool se naam…",
    schoolNotFound: "Skool nie gevind nie? Tik die volledige naam en gaan voort.",
    parentEmailLabel: "Ouer / Voog se e-pos",
    parentEmailHint: "Ons stuur hulle 'n skakel om jou leerreis te aktiveer.",
    subjectsHeading: "Watter vakke skryf jy?",
    subjectsHint: "Kies alles wat van toepassing is.",
    studyGoalHeading: "Wat is jou studiedoelwit?",
    targetMarkHeading: "Watter teikenpersentasie mik jy op?",
    studyHoursHeading: "Hoeveel uur per dag kan jy studeer?",
    varkHeading: "Hoe leer jy die beste?",
    varkHint: "Kies jou voorkeur leermetodes.",
    varkQuestionnaireSubtitle: "Twaalf vinnige scenario's — kies wat régtig soos jy klink.",
    varkScenarioProgress: "Scenario {n} van {total}",
    varkResultHeading: "Jou leerprofiel",
    varkResultSubtitle: "Gebaseer op jou 12 antwoorde — só hou jou brein daarvan om geleer te word.",
    varkPrimaryHeading: "Jou primêre styl",
    varkSecondaryHeading: "Ook sterk in",
    varkNoSecondary: "Jou primêre styl is baie duidelik — geen sterk sekondêre keer nie.",
    varkRetakeBtn: "Doen weer",
    varkSkipBtn: "Slaan nou oor — jy kan dit later instel",
    consentSent: "Toestemmingsskakel gestuur!",
    consentSentDesc: "Ons het jou ouer ge-epos. Vra hulle om jou rekening goed te keur.",
    consentNotConfigured: "E-pos nie opgestel nie",
    consentNotConfiguredDesc: "Vra jou ouer om by braintrack.tech/parent te registreer.",
    consentFailed: "Kon nie skakel stuur nie",
    consentFailedDesc: "Vra jou ouer asseblief om direk by braintrack.tech/parent te registreer.",
    profileCreated: "Profiel geskep!",
    profileCreatedDesc: "Jou studieprofiel is gereed. Kom ons gaan.",
    saveError: "Kon nie jou profiel stoor nie. Probeer asseblief weer.",
    requiredField: "Hierdie veld is verpligtend.",
    error: "Fout",
    cannotChangeRole: "Kan nie rol verander nie",
    cannotChangeRoleDesc: "Rolverandering is slegs beskikbaar voor aanboord voltooi is.",
    questionsSubtitle: "Kom ons bou jou persoonlike plan.",
    varkSubtitle: "Hoe leer jy die beste? Kies jou primêre leerstyl.",
    subjectsSubtitle: "Vertel ons hoe jy tans presteer.",
    completeLabel: "Voltooi",
    progressBarLabel: "Vordering",
    questionLabel: "Vraag",
    selectAllThatApply: "Kies al wat van toepassing is",
    minutesLabel: "Minute",
    primaryStyleLabel: "Primêre Styl (verpligtend)",
    secondaryStyleLabel: "Sekondêre Styl (opsioneel)",
    selectSubjectsHeading: "Kies Jou Vakke",
    selectSubjectsHint: "Kies 6+ vakke en voer jou nuutste punte (%) in",
    schoolGradeHeading: "Jou Skool",
    schoolSearchHint: "Soek jou skool hieronder. As ons dit nog nie het nie, tik die naam en ons sal dit as hangend byvoeg.",
    schoolNameLabel: "Skoolnaam",
    identityHeading: "Jou besonderhede",
    firstNameLabel: "Naam",
    firstNamePlaceholder: "Naam",
    lastNameLabel: "Van",
    lastNamePlaceholder: "Van",
    idNumberLabel: "SA ID-nommer",
    idNumberPlaceholder: "13-syfer ID-nommer",
    idNumberHint: "Ons gebruik dit om jou NSS-uitslae te pas. Dit bly privaat.",
    firstNameRequired: "Voer asseblief jou naam in.",
    lastNameRequired: "Voer asseblief jou van in.",
    idNumberInvalid: "Voer 'n geldige 13-syfer Suid-Afrikaanse ID-nommer in.",
    schoolSearchingLabel: "Soek…",
    schoolLinkedLabel: "✓ Aan 'n vennootskool gekoppel",
    schoolPendingLabel: "Ons sal dit as hangend stoor totdat ons dit verifieer.",
    gradeLabel: "Graad",
    parentConsentHeading: "Toestemming van Ouer / Voog",
    parentConsentHint: "Voeg jou ouer of voog se e-pos by sodat hulle kan bevestig dat jy Smart Tutor en die volle eksamen-modus mag gebruik. Die eerste 3 vrae per dag is gratis; daarna het ons hul toestemming nodig.",
    resendBtn: "Stuur weer",
    sendConsentEmailBtn: "Stuur toestemming-e-pos",
    emailSentLabel: "E-pos gestuur",
    manualShareLabel: "Handmatige deel — e-pos nie gekonfigureer nie",
    copyLinkBtn: "Kopieer skakel",
    consentSkipHint: "Ons het 'n toestemming-versoek aan jou ouer/voog gestuur. Jy kan nou voortgaan en die gratis-vlak verken totdat hulle bevestig.",
    // ── Ouertoestemming, uitgebrei ─────────────────────────────────────────
    consentWhyMinorTitle: "Jy's onder 18, so 'n grootmens teken af",
    consentWhyMinorBody: "Suid-Afrikaanse wet (POPIA) sê 'n ouer of voog moet goedkeur voordat ons jou inligting vir die volle BrainTrack-ervaring kan gebruik. Een klik van hulle en jy's deur.",
    consentWhyAdultTitle: "Jy's 18+, so hierdie een is opsioneel",
    consentWhyAdultBody: "Jy kan jou eie rekening goedkeur. As jy nog steeds wil hê 'n ouer of voog moet jou vordering volg, voeg hul e-pos by — anders spring sommer verder.",
    consentTrustTitle: "Wat hulle gaan kry",
    consentTrustPoint1: "Een e-pos met jou naam en 'n enkele Keur Goed-knoppie.",
    consentTrustPoint2: "Geen registrasie, geen wagwoord, geen betaling nie — een klik en dis klaar.",
    consentTrustPoint3: "Ons gebruik hul adres net vir hierdie toestemming en jou vorderingsverslae. Nooit verkoop nie, nooit gespam nie.",
    parentEmailErrEmpty: "Voeg jou ouer of voog se e-posadres by.",
    parentEmailErrInvalid: "Dit lyk nog nie soos 'n e-posadres nie — kyk vir 'n tikfout.",
    parentEmailErrSelf: "Dis jou eie adres. Dit moet 'n ouer of voog s'n wees.",
    consentSentTitle: "Gestuur — gaan kyk saam met jou ouer",
    consentSentBody: "Die goedkeuring-e-pos is op pad na {email}. Vra hulle om in hul inbox (en die gemorspos-vouer) te kyk en Keur Goed te tik.",
    consentDidntArriveBtn: "Nie ontvang nie? Stuur self die skakel",
    consentNotConfiguredTitle: "Hierdie een moet jy self stuur",
    consentNotConfiguredBody: "E-pos is nie hier aangeskakel nie, so ons kon dit nie aflewer nie. Kopieer die skakel hieronder en stuur dit op WhatsApp aan jou ouer of voog — dit doen presies dieselfde ding.",
    consentFailedTitle: "Die e-pos het nie deurgekom nie",
    consentFailedBody: "Ons kon dit nie aan {email} aflewer nie. Stuur self die skakel hieronder aan jou ouer of voog, of maak die adres reg en probeer weer.",
    consentLinkLabel: "Jou ouer se goedkeuringskakel",
    copiedBtn: "Gekopieer!",
    copyFailedHint: "Kon nie outomaties kopieer nie — tik die skakel hierbo om dit te merk.",
    changeEmailBtn: "Gebruik 'n ander adres",
    sendAgainBtn: "Stuur weer",
    consentWaitingTitle: "Terwyl jy wag",
    consentWaitingBody: "Niks is op hou nie — maak klaar met opstel en begin nou studeer. Sodra jou ouer goedkeur, ontsluit Smart Tutor en die volle eksamen-modus outomaties.",
    consentRequiredHint: "Stuur die versoek aan jou ouer of voog om klaar te maak met opstel.",
    consentOptionalHint: "Opsioneel — jy kan klaarmaak sonder dit.",
    preparingClassroomTitle: "Berei jou klaskamer voor…",
    preparingClassroomDesc: "Stoor jou profiel en laai jou vakke.",
    consentRequestReady: "Toestemming-versoek gereed",
    consentSentByEmail: "Ons het 'n bevestigingsskakel aan jou ouer/voog gestuur.",
    consentManualShare: "E-pos is nie gekonfigureer nie — deel die skakel handmatig.",
    couldntSend: "Kon nie stuur nie",
    checkEmailAndRetry: "Gaan asseblief die e-posadres na en probeer weer.",
    parentEmailPlaceholder: "ouer@voorbeeld.com",
    selectMoreMsg: "Kies nog ten minste {count} vak{plural} om voort te gaan. Die meeste Graad 12-leerders neem 6–7 vakke.",
    selectMorePlural: "ke",
    termsAgree: "Deur 'n profiel te skep stem jy in tot ons",
    termsAnd: "en",
    termsLink: "Bepalings",
    privacyLink: "Privaatheidsbeleid",
    dobEyebrow: "wanneer het jy geland? 🛬",
    dobLabel: "Geboortedatum",
    dobDayPh: "DD",
    dobMonthPh: "MM",
    dobYearPh: "JJJJ",
    dobHint: "Dag / maand / jaar — ons stoor net 'n geskommelde vingerafdruk hiervan, nooit die rou datum nie.",
    dobInvalid: "Hmm, daai datum lyk nie reg nie 🤔",
    dobMismatch: "Dit pas nie by die eerste 6 syfers van jou ID-nommer nie 👀 — kontroleer albei.",

    // ── Rizz-hosted journey ────────────────────────────────────────────────
    rizzName: "Rizz",
    rizzHi: "Yebo! Ek's Rizz — jou studiemaat.",
    rizzHiSub: "Slimmer leer. Hoër punt. Helderder toekoms.",
    rizzQstudy: "Eerste ding — hoe jy régtig leer. Daar's geen verkeerde antwoord nie.",
    rizzQfocus: "Nou praat ons fokus. Wees eerlik, ek het al erger gesien.",
    rizzQpractice: "Hoe jy oefen sê my hoe om vir jou vrae te gooi.",
    rizzQstress: "Eksamensenuwees is normaal. Kom ons kyk na joune.",
    rizzQplanning: "Laaste paar vrae. Dissipline vandag, sukses môre.",
    rizzVarkLine: "Nou die lekker deel — hoe hou jou brein daarvan om geleer te word?",
    rizzSubjectsLine: "Kies jou vakke. Tik 'n kaart, gooi jou nuutste punt in. Maklik.",
    rizzSubjectsDone: "6 ingesluit! Voeg meer by as jy meer skryf. Kom ons vat dit!",
    rizzSchoolLine: "Vinnige admin — wie is jy en waar skryf jy?",
    rizzSchoolDone: "Perfek. Jou NSS-uitslae word nou outomaties gepas.",
    rizzFinalLine: "Jy's reg. Kom ons vat dit!",
    rizzFinalSub: "Ek doen nie maklik nie. Ek maak maklik gebeur.",
    almostThere: "amper daar!",
    startHere: "kom ons gaan!",
    journeyLabel: "Jou opstel-reis",
    phaseYou: "Jy",
    phaseBrain: "Brein",
    phaseSubjects: "Vakke",
    phaseSchool: "Skool",
    phaseDone: "Klaar",
    subjectFilterPh: "Soek vakke…",
    allSubjectsLabel: "Alles",
    subjectCountLabel: "vakke gekies",
    minimumHit: "minimum ontsluit",
    markLabel: "Nuutste punt",
    noSubjectMatches: "Geen vak pas daarby nie. Probeer 'n korter woord.",
    nameQ: "Wat noem ek jou?",
    nameQHint: "Presies soos op jou ID — so pas die NSS jou.",
    schoolQ: "Waar skryf jy?",
    idQ: "Jou SA ID-nommer",
    dobQ: "Wanneer het jy geland?",
    youreSetTitle: "Jy's reg vir die jaar",
    youreSetSub: "Dis wat ek van jou het:",
    summarySubjectsLabel: "Vakke",
    summaryStyleLabel: "Leerstyl",
    summarySchoolLabel: "Skool",
    whatsNextTitle: "Wat gebeur nou",
    whatsNextMinor: "Jou ouer/voog bevestig die skakel, dan ontsluit jou volle studieplan. Ek wag vir jou.",
    whatsNextAdult: "Kies jou plan en jou eerste studiesessie is gereed. Ek wag vir jou.",
    letsGetIt: "Kom ons vat dit!",
    doneTag: "klaar",
    optionalTag: "opsioneel",
    tapToChange: "Tik om te verander",
    questionProgress: "Vraag {n} van {total}",
  },
} as const;

// ── Brand palette (official Rizz brand sheet) ───────────────────────────────
// Aligned to the app-wide graffiti palette (see the other learner pages +
// index.css tokens). Onboarding used to run on its own greyer palette
// (#0D0D14 ground, #1C1C26 card, muddier pink/purple/yellow) which is why it
// read as off-brand next to every other page. Ground is now pure black per
// the house rule; card is the same near-black the dashboard cards use; the
// accents are the canonical pastels. Every `BRAND.x` reference downstream
// re-skins for free.
const BRAND = {
  pink: "#FFB7E5",
  purple: "#C5B3FF",
  cyan: "#9FD8FF",
  yellow: "#FFE29A",
  mint: "#94F7C5",
  ground: "#000000",
  card: "#050508",
} as const;

const CONFETTI_COLORS = [BRAND.pink, BRAND.purple, BRAND.cyan, BRAND.yellow, BRAND.mint];
const MARKER = "'Permanent Marker',cursive";

// Amber used by every admin preview surface (matches PASTEL.amber on the
// parent-dashboard preview banner) — the hazard colour of "this is not real".
const PREVIEW_AMBER = "#FFE29A";

// Rizz's real brand lines — used as step-completion encouragement.
const RIZZ_LINES = {
  en: [
    "Let's get it!",
    "Progress not perfection",
    "Small steps BIG results",
    "Discipline today, success tomorrow",
    "You can shine later — study now",
    "Smarter study. Higher score.",
  ],
  af: [
    "Kom ons vat dit!",
    "Vordering, nie perfeksie nie",
    "Klein treë GROOT resultate",
    "Dissipline vandag, sukses môre",
    "Jy kan later blink — leer nou",
    "Slimmer leer. Hoër punt.",
  ],
} as const;

const PHASE_CHEERS = {
  en: {
    vark: "Let's get it!",
    subjects: "Small steps BIG results",
    school: "You can shine later — study now",
    parent_consent: "Almost home 🏁",
  },
  af: {
    vark: "Kom ons vat dit!",
    subjects: "Klein treë GROOT resultate",
    school: "Jy kan later blink — leer nou",
    parent_consent: "Amper tuis 🏁",
  },
} as const;

// Per-category colour + icon so subject picking is visual, not clerical.
const SUBJECT_META: Record<string, { color: string; icon: string }> = {
  Mathematics: { color: BRAND.cyan, icon: "📐" },
  Sciences: { color: BRAND.mint, icon: "🧪" },
  Commerce: { color: BRAND.yellow, icon: "📈" },
  Humanities: { color: BRAND.pink, icon: "🌍" },
  Languages: { color: BRAND.purple, icon: "💬" },
  Arts: { color: BRAND.pink, icon: "🎨" },
  Technical: { color: BRAND.cyan, icon: "⚙️" },
  Agriculture: { color: BRAND.mint, icon: "🌱" },
  Services: { color: BRAND.yellow, icon: "🍳" },
  "Life Orientation": { color: BRAND.purple, icon: "🧭" },
};
const metaFor = (category: string) => SUBJECT_META[category] ?? { color: "#FFFFFF", icon: "📚" };

const MARK_CHIPS = [30, 40, 50, 60, 70, 80, 90];

/** Build yyyy-mm-dd from the 3 DOB fields; null if incomplete/not a real date. */
function buildIsoDob(dd: string, mm: string, yyyy: string): string | null {
  if (dd.length < 1 || mm.length < 1 || yyyy.length !== 4) return null;
  const d = parseInt(dd, 10);
  const m = parseInt(mm, 10);
  const y = parseInt(yyyy, 10);
  if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return null;
  if (y < 1900 || y > new Date().getFullYear()) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Does the DOB agree with the SA ID number's YYMMDD prefix? */
function dobMatchesIdNumber(isoDob: string, idNumber: string): boolean {
  if (!/^\d{13}$/.test(idNumber)) return true; // ID validated separately
  const yymmdd = isoDob.slice(2, 4) + isoDob.slice(5, 7) + isoDob.slice(8, 10);
  return idNumber.slice(0, 6) === yymmdd;
}

/** Age in whole years as of today. */
function ageFromIsoDob(isoDob: string): number {
  const dob = new Date(`${isoDob}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const before =
    now.getUTCMonth() < dob.getUTCMonth() ||
    (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() < dob.getUTCDate());
  if (before) age -= 1;
  return age;
}

/** Honour prefers-reduced-motion — animations off, layout unchanged. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    return undefined;
  }, []);
  return reduced;
}

// ── One "question block" for the sequenced details step ─────────────────────
function StepBlock({
  n,
  title,
  hint,
  done,
  accent,
  testId,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  done: boolean;
  accent: string;
  testId?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-testid={testId}
      className="rounded-2xl p-4 sm:p-5"
      style={{
        background: done ? "rgba(148,247,197,.05)" : BRAND.card,
        border: `1px solid ${done ? `${BRAND.mint}55` : "rgba(255,255,255,.12)"}`,
        transition: "background .3s ease, border-color .3s ease",
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="flex items-center justify-center rounded-full shrink-0 text-[13px] font-bold"
          style={{
            width: 26,
            height: 26,
            background: done ? BRAND.mint : "transparent",
            color: done ? BRAND.ground : "#FFFFFF",
            border: `1.5px solid ${done ? BRAND.mint : accent}`,
          }}
        >
          {done ? <Check className="w-3.5 h-3.5" /> : n}
        </span>
        <h3 className="text-white font-bold text-lg sm:text-xl leading-tight">{title}</h3>
      </div>
      {hint && <p className="text-white text-[13px] leading-snug mb-3 opacity-100">{hint}</p>}
      {children}
    </div>
  );
}

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const persisted = useRef<PersistedState | null>(loadPersistedState()).current;
  const reduced = usePrefersReducedMotion();
  const anim = (value: string) => (reduced ? undefined : value);
  const [hydrated, setHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(persisted?.currentStep ?? 0);
  // Date of birth is deliberately NOT persisted (privacy — see the dob state
  // below), so a learner who reloads while on the last screen comes back with
  // no age. Age now decides whether parental consent is required at all, and
  // "unknown age" must never resolve to "adult, carry on" — that would let a
  // minor skip the POPIA gate (and get routed to /subscribe) just by
  // refreshing. So a restored `parent_consent` phase without a DOB in memory
  // rewinds one step to `school`, where identity is re-collected.
  const restoredPhase: Phase = persisted?.phase ?? "questions";
  const [phase, setPhase] = useState<Phase>(
    restoredPhase === "parent_consent" ? "school" : restoredPhase,
  );
  // Task #43 — School linking + parent contact captured during onboarding.
  const [schoolName, setSchoolName] = useState<string>(persisted?.schoolName ?? "");
  const [schoolId, setSchoolId] = useState<number | null>(persisted?.schoolId ?? null);
  // BrainTrack is a Grade 12 / NSC product — grade is a hard constant (no selector).
  const grade = 12;
  const [firstName, setFirstName] = useState<string>(persisted?.firstName ?? "");
  const [lastName, setLastName] = useState<string>(persisted?.lastName ?? "");
  const [idNumber, setIdNumber] = useState<string>(persisted?.idNumber ?? "");
  // Date of birth — deliberately NOT persisted to localStorage (privacy): the
  // raw date only ever lives in memory and in the single submit request. The
  // server stores a salted hash + isMinor flag, never the plaintext date.
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  // Conversational auto-advance between the identity fields.
  const lastNameRef = useRef<HTMLInputElement>(null);
  const schoolInputRef = useRef<HTMLInputElement>(null);
  const idNumberRef = useRef<HTMLInputElement>(null);
  const dobDayRef = useRef<HTMLInputElement>(null);
  const dobMonthRef = useRef<HTMLInputElement>(null);
  const dobYearRef = useRef<HTMLInputElement>(null);
  // Step-completion micro-celebration (marker-font cheer + confetti burst).
  const [cheer, setCheer] = useState<string | null>(null);
  const cheerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebrate = (text: string) => {
    if (cheerTimer.current) clearTimeout(cheerTimer.current);
    setCheer(text);
    cheerTimer.current = setTimeout(() => setCheer(null), 1600);
  };
  useEffect(() => () => { if (cheerTimer.current) clearTimeout(cheerTimer.current); }, []);
  // Auto-advance after a single-select answer so questions feel conversational.
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);
  const [schoolQuery, setSchoolQuery] = useState<string>(persisted?.schoolName ?? "");
  const [schoolResults, setSchoolResults] = useState<Array<{ id: number; name: string; province: string | null }>>([]);
  const [schoolSearching, setSchoolSearching] = useState(false);
  const [parentEmail, setParentEmail] = useState<string>(persisted?.parentEmail ?? "");
  const [consentLink, setConsentLink] = useState<string | null>(null);
  const [consentDelivery, setConsentDelivery] = useState<ConsentDelivery | null>(null);
  // The address the request actually went to. Held separately from
  // `parentEmail` so the confirmation keeps naming the right person even after
  // the learner edits the field to try a different one.
  const [consentSentTo, setConsentSentTo] = useState<string | null>(null);
  // Has the learner asked to see the raw link on the happy path? On `sent` the
  // link is deliberately tucked away (the email is the delivery mechanism);
  // on the manual paths it is the headline and this is forced open.
  const [showConsentLink, setShowConsentLink] = useState(false);
  // Transient "Copied!" acknowledgement, and the fallback hint shown when the
  // clipboard API is unavailable (older mobile browsers, insecure contexts).
  const [linkCopied, setLinkCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);
  // Whether the learner has reopened the form to try a different address.
  const [editingParentEmail, setEditingParentEmail] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [subjectCategory, setSubjectCategory] = useState<string>("__all__");
  const { language, setLanguage } = useLanguage();
  const isAf = language === "af";
  const t = T[language];
  const { isAuthenticated, user } = useAuth();
  // ── Admin-only preview mode (?preview=1) ────────────────────────────────
  // Mirrors the /parent?preview=1 pattern (parent-dashboard.tsx +
  // server/parent-preview.ts) — but onboarding is a WRITE flow, so instead of
  // substituting reads, every mutation below is created through
  // `previewGate.mutation(real, simulated)`: in preview the real network call
  // is NEVER invoked, and a fetch tripwire additionally blocks any write to
  // /api/* that might slip past the gate. Reads (school search) stay live —
  // they're harmless and keep the preview realistic. A non-admin who adds
  // ?preview=1 by hand gets `inPreview === false` and the completely normal
  // flow. See client/src/lib/onboarding-preview.ts for the full contract.
  const inPreview = isOnboardingPreview(
    user?.role,
    typeof window !== "undefined" ? window.location.search : "",
  );
  // Prefill first name / surname from the authenticated user if we don't have
  // a value yet (persisted draft or fresh). Does not clobber user edits.
  // Skipped in preview — the admin's own name appearing in the identity step
  // would blur the "nothing here is real" line.
  useEffect(() => {
    if (!user || inPreview) return;
    setFirstName((prev) => prev || user.firstName || "");
    setLastName((prev) => prev || user.lastName || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, inPreview]);
  useEffect(() => {
    // Backend preferredLanguage (synced via LanguageSync in App.tsx) is the
    // source of truth for authenticated users. Only fall back to a persisted
    // onboarding draft when the user is unauthenticated (e.g. resuming an
    // anonymous draft before login).
    if (isAuthenticated) return;
    if (persisted?.language && persisted.language !== language) {
      setLanguage(persisted.language);
    }
    // Consume persisted language at most once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [answers, setAnswers] = useState<Answers>(persisted?.answers ?? {
    focus_duration: 45,
  });
  const [varkPrimary, setVarkPrimary] = useState<VarkStyle | null>(persisted?.varkPrimary ?? null);
  const [varkSecondary, setVarkSecondary] = useState<VarkStyle | null>(persisted?.varkSecondary ?? null);
  // Per-question answers + position within the VARK phase. Position is 0..11
  // for a specific question and VARK_QUESTIONS.length (12) for the result view
  // that renders the scored primary + secondary before advancing.
  const [varkAnswers, setVarkAnswers] = useState<Record<string, string>>(
    persisted?.varkAnswers ?? {},
  );
  const [varkStep, setVarkStep] = useState<number>(
    // Resume where the learner left off. A persisted step of VARK_QUESTIONS.length
    // means they'd already reached the result view; otherwise they were mid-quiz.
    // If neither has a persisted value but varkPrimary is set (an old draft from
    // before the questionnaire existed, or a preview seed) start at the result
    // view instead of forcing them to redo the assessment.
    persisted?.varkStep ?? (persisted?.varkPrimary ? VARK_QUESTIONS.length : 0),
  );
  const [subjectMarks, setSubjectMarks] = useState<SubjectMark[]>(persisted?.subjectMarks ?? []);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(
    new Set(persisted?.selectedSubjects ?? [])
  );

  // ── Preview plumbing (no-ops unless inPreview) ──────────────────────────
  // The single centralised write gate every mutationFn below goes through.
  const previewGate = useMemo(() => createPreviewGate(inPreview), [inPreview]);
  // Preview-only "Done" screen — stands in for the real post-submit redirect
  // to /subscribe (adults) or /waiting-for-parent (minors).
  const [previewDone, setPreviewDone] = useState(false);

  // Belt-and-braces backstop: while preview is active, window.fetch refuses
  // any write to /api/* (rejected before the network is touched). If a future
  // mutation call site forgets the gate, it trips here instead of writing.
  useEffect(() => {
    if (!inPreview || typeof window === "undefined") return;
    return installPreviewWriteTripwire(window);
  }, [inPreview]);

  const resetPreviewState = () => {
    setCurrentStep(0);
    setPhase("questions");
    setAnswers({ focus_duration: 45 });
    setVarkPrimary(null);
    setVarkSecondary(null);
    setVarkAnswers({});
    setVarkStep(0);
    setSubjectMarks([]);
    setSelectedSubjects(new Set());
    setSchoolName("");
    setSchoolQuery("");
    setSchoolId(null);
    setFirstName("");
    setLastName("");
    setIdNumber("");
    setDobDay("");
    setDobMonth("");
    setDobYear("");
    setParentEmail("");
    setConsentLink(null);
    setConsentDelivery(null);
    setPreviewDone(false);
  };

  // Entering preview always starts from a clean slate — never from a
  // persisted learner draft (and, below, never writes a draft back).
  const previewEnteredRef = useRef(false);
  useEffect(() => {
    if (!inPreview || previewEnteredRef.current) return;
    previewEnteredRef.current = true;
    resetPreviewState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inPreview]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Preview never persists a draft — the walkthrough is disposable and must
    // not leave a resumable onboarding state behind on the admin's browser.
    if (!hydrated || inPreview || typeof window === "undefined") return;
    try {
      const state: PersistedState = {
        currentStep,
        phase,
        language,
        answers,
        varkPrimary,
        varkSecondary,
        varkAnswers,
        varkStep,
        subjectMarks,
        selectedSubjects: Array.from(selectedSubjects),
        schoolName,
        schoolId,
        grade,
        parentEmail,
        firstName,
        lastName,
        idNumber,
      };
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors (quota, private mode)
    }
  }, [hydrated, inPreview, currentStep, phase, language, answers, varkPrimary, varkSecondary, varkAnswers, varkStep, subjectMarks, selectedSubjects, schoolName, schoolId, grade, parentEmail, firstName, lastName, idNumber]);

  // Task #43 — Debounced school name search against partnerSchools.
  useEffect(() => {
    if (phase !== "school") return;
    const q = schoolQuery.trim();
    if (q.length < 2) { setSchoolResults([]); return; }
    setSchoolSearching(true);
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`/api/schools/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
        const j = await r.json();
        setSchoolResults(Array.isArray(j?.results) ? j.results : []);
      } catch {
        setSchoolResults([]);
      } finally {
        setSchoolSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [schoolQuery, phase]);

  const currentQuestion = phase === "questions" ? ONBOARDING_QUESTIONS[currentStep] : null;
  const totalSteps = ONBOARDING_QUESTIONS.length + 4; // +4: vark, subjects, school, parent_consent
  const progress = phase === "questions"
    ? ((currentStep + 1) / totalSteps) * 100
    : phase === "vark"
    ? ((ONBOARDING_QUESTIONS.length + 1) / totalSteps) * 100
    : phase === "subjects"
    ? ((ONBOARDING_QUESTIONS.length + 2) / totalSteps) * 100
    : phase === "school"
    ? ((ONBOARDING_QUESTIONS.length + 3) / totalSteps) * 100
    : 100;

  const toggleSubject = (code: string, name: string) => {
    const newSelected = new Set(selectedSubjects);
    if (newSelected.has(code)) {
      newSelected.delete(code);
      setSubjectMarks(prev => prev.filter(s => s.subjectCode !== code));
    } else {
      newSelected.add(code);
      setSubjectMarks(prev => [...prev, { subjectCode: code, subjectName: name, mark: 50 }]);
    }
    setSelectedSubjects(newSelected);
  };

  const updateMark = (code: string, mark: number) => {
    setSubjectMarks(prev => prev.map(s =>
      s.subjectCode === code ? { ...s, mark: Math.max(0, Math.min(100, mark)) } : s
    ));
  };

  // Celebrate the moment the 6-subject minimum is reached (once per session).
  const hitSixRef = useRef<boolean>((persisted?.subjectMarks?.length ?? 0) >= 6);
  useEffect(() => {
    if (phase !== "subjects") return;
    if (subjectMarks.length >= 6 && !hitSixRef.current) {
      hitSixRef.current = true;
      celebrate(isAf ? "6/6 — kom ons vat dit!" : "6/6 — let's get it!");
    }
    if (subjectMarks.length < 6) hitSixRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectMarks.length, phase]);

  const submitMutation = useMutation({
    // previewGate: in preview the real POST /api/onboarding is NEVER invoked.
    // The simulated branch resolves after a short delay so the "Preparing
    // your classroom" overlay renders exactly as it does for a learner, then
    // onSuccess shows the preview Done screen instead of redirecting.
    mutationFn: previewGate.mutation(async () => {
      const traits = calculateTraits(answers);
      const recommendations = calculateRecommendations(answers, traits);
      return apiRequest("POST", "/api/onboarding", {
        learningStyle: varkPrimary || answers.learning_style || "mixed",
        studyPreference: answers.study_time || "evening",
        focusDuration: answers.focus_duration || 45,
        challenges: [],
        goals: answers.goals || [],
        // Short form only. The DB CHECK constraint (migrations/0017) requires
        // 'en'|'af'; sending the long form here is what led server code to
        // compare against 'afrikaans' and silently always resolve to English.
        preferredLanguage: language,
        rawAnswersJson: { ...answers, subjectMarks, varkPrimary, varkSecondary, schoolName, schoolId, grade, firstName, lastName },
        traitsJson: traits,
        recommendationsJson: recommendations,
        varkPrimary: varkPrimary || "kinesthetic",
        varkSecondary: varkSecondary || null,
        // Task #43 — extra profile fields
        ...(schoolName.trim() ? { schoolName: schoolName.trim() } : {}),
        ...(schoolId ? { schoolId } : {}),
        ...(grade ? { grade } : {}),
        ...(parentEmail.trim() ? { parentEmail: parentEmail.trim() } : {}),
        // Learner identity. idNumber is sensitive — it is persisted to
        // users.idNumber server-side and never returned to any client.
        ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
        ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
        ...(idNumber.trim() ? { idNumber: idNumber.trim() } : {}),
        // DOB is transmitted once and hashed server-side — it is intentionally
        // NOT part of rawAnswersJson and never persisted in plaintext.
        ...((() => {
          const isoDob = buildIsoDob(dobDay, dobMonth, dobYear);
          return isoDob ? { dateOfBirth: isoDob } : {};
        })()),
      });
    }, () => ({ preview: true }) as unknown as Response, { delayMs: 1400 }),
    onSuccess: () => {
      if (inPreview) {
        // Nothing was saved or seeded — swap the learner redirect for the
        // preview completion card (Restart preview / Back to admin).
        setPreviewDone(true);
        return;
      }
      try { window.localStorage.removeItem(ONBOARDING_STORAGE_KEY); } catch { /* ignore */ }
      // Invalidate the exact gate the app routes on. ProtectedRoute /
      // OnboardingRoute / SubscribeRoute (client/src/App.tsx) read
      // ["/api/user/onboarding-status"] to decide the redirect — NOT
      // ["/api/user/onboarding"] (the raw result). Invalidating the wrong key
      // left the completion gate reading a stale `false`, so the just-onboarded
      // learner could be bounced back to /onboarding. Also refresh the user +
      // subscription caches the downstream gates consult.
      queryClient.invalidateQueries({ queryKey: ["/api/user/onboarding-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/onboarding"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscription-status"] });
      const tStr = T[language];
      toast({
        title: tStr.profileCreated,
        description: tStr.profileCreatedDesc,
      });
      // Minors can't self-activate a trial — they wait for the parent to
      // approve + add a card; adults go on to /subscribe as before.
      // `?welcome=1` tells the landing page this is a fresh profile creation
      // — it fires ConfettiBurst once, then cleans the flag from the URL so a
      // refresh doesn't re-celebrate the same moment.
      const isoDob = buildIsoDob(dobDay, dobMonth, dobYear);
      const minor = isoDob ? ageFromIsoDob(isoDob) < 18 : false;
      // Hard-navigate (full reload) rather than SPA setLocation so the
      // destination guard re-reads onboarding/subscription state fresh from the
      // server. This mirrors the rest of the redirect design (ProtectedRoute,
      // RoleSelectRoute) and guarantees the completion gate can't read a stale
      // cached `false` after a client-side transition — the loop that stranded
      // learners on the onboarding↔subscribe boundary.
      window.location.href = (minor ? "/waiting-for-parent" : "/subscribe") + "?welcome=1";
    },
    onError: () => {
      const tStr = T[language];
      toast({
        title: tStr.error ?? "Error",
        description: tStr.saveError,
        variant: "destructive",
      });
    },
  });

  const resetRoleMutation = useMutation({
    // previewGate: never POSTs in preview — role select is a separate page
    // with its own live writes, so the preview stays inside this flow.
    mutationFn: previewGate.mutation(
      () => apiRequest("POST", "/api/auth/reset-role"),
      () => ({ preview: true }) as unknown as Response,
    ),
    onSuccess: () => {
      if (inPreview) {
        toast({
          title: isAf ? "Voorskou" : "Preview",
          description: isAf
            ? "Rolkeuse is buite hierdie voorskou — niks is verander nie."
            : "Role selection is outside this preview — nothing was changed.",
        });
        return;
      }
      try { window.localStorage.removeItem(ONBOARDING_STORAGE_KEY); } catch { /* ignore */ }
      window.location.href = "/role-select";
    },
    onError: () => {
      toast({
        title: t.cannotChangeRole,
        description: t.cannotChangeRoleDesc,
        variant: "destructive",
      });
    },
  });

  const handleMultiSelect = (value: string, checked: boolean) => {
    if (!currentQuestion) return;
    setAnswers((prev) => {
      const current = (prev[currentQuestion.id] as string[]) || [];
      if (checked) {
        return { ...prev, [currentQuestion.id]: [...current, value] };
      }
      return { ...prev, [currentQuestion.id]: current.filter((v) => v !== value) };
    });
  };

  const handleSliderChange = (value: number[]) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value[0] }));
  };

  // Age drives the whole consent branch (copy, requirement, gating), so it is
  // derived here — ahead of canProceed and the consent mutation — rather than
  // down with the render-only helpers.
  const isoDobNow = buildIsoDob(dobDay, dobMonth, dobYear);
  const isMinor = isoDobNow ? ageFromIsoDob(isoDobNow) < 18 : false;
  const learnerEmail = (user as { email?: string | null } | null | undefined)?.email ?? null;
  const parentEmailProblem = parentEmailIssue(parentEmail, learnerEmail);
  const parentEmailReady = isValidParentEmail(parentEmail, learnerEmail);

  const canProceed = () => {
    if (phase === "subjects") {
      return subjectMarks.length >= 6;
    }
    if (phase === "vark") {
      // Questionnaire mode: the current scenario must have an answer before
      // the learner can advance (auto-advance still fires as soon as they pick
      // — this gate is what enables the visible Next button).
      if (varkStep < VARK_QUESTIONS.length) {
        const q = VARK_QUESTIONS[varkStep];
        return typeof varkAnswers[q.id] === "string";
      }
      // Result view: primary must be committed (set by the useEffect below
      // when the questionnaire is complete, or from a persisted / preview seed).
      return varkPrimary !== null;
    }
    if (phase === "school") {
      const isoDob = buildIsoDob(dobDay, dobMonth, dobYear);
      return (
        schoolName.trim().length >= 2 &&
        firstName.trim().length >= 1 &&
        lastName.trim().length >= 1 &&
        isValidSaIdNumber(idNumber) &&
        isoDob !== null &&
        dobMatchesIdNumber(isoDob, idNumber)
      );
    }
    if (phase === "parent_consent") {
      // POPIA compliance — a MINOR must at minimum have sent a consent request
      // before continuing (consentLink is set once the mutation succeeds, by
      // email or manual-share link), so this is a soft gate: send → proceed.
      //
      // Adults are never gated. This previously returned `consentLink !== null`
      // unconditionally, which trapped every 18+ learner on the last screen of
      // onboarding unless they emailed a "parent" they don't need.
      return canLeaveConsentPhase({ isMinor, consentRequested: consentLink !== null });
    }
    if (!currentQuestion) return false;
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === "single") {
      return !!answer;
    }
    if (currentQuestion.type === "multiple") {
      return Array.isArray(answer) && answer.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (phase === "questions") {
      if (currentStep < ONBOARDING_QUESTIONS.length - 1) {
        // Cheer at the end of each question category (every 4th step) using
        // one of Rizz's real brand lines.
        if ((currentStep + 1) % 4 === 0) {
          const lines = RIZZ_LINES[language];
          celebrate(lines[Math.floor(currentStep / 4) % lines.length]);
        }
        setCurrentStep((prev) => prev + 1);
      } else {
        celebrate(PHASE_CHEERS[language].vark);
        setPhase("vark");
        // Entering the VARK phase — if we already have a committed primary
        // (persisted from a previous session, or a preview seed), skip to the
        // result view rather than re-asking questions the learner has already
        // answered. Otherwise start the questionnaire from question 0.
        setVarkStep(varkPrimary ? VARK_QUESTIONS.length : 0);
      }
    } else if (phase === "vark") {
      // Sub-step machine: 0..11 = a scenario, 12 = the scored result view.
      if (varkStep < VARK_QUESTIONS.length) {
        setVarkStep((prev) => prev + 1);
      } else {
        celebrate(PHASE_CHEERS[language].subjects);
        setPhase("subjects");
      }
    } else if (phase === "subjects") {
      celebrate(PHASE_CHEERS[language].school);
      setPhase("school");
    } else if (phase === "school") {
      celebrate(PHASE_CHEERS[language].parent_consent);
      setPhase("parent_consent");
    } else {
      submitMutation.mutate();
    }
  };

  // Keep a stable handle so the auto-advance timer always calls the latest
  // handleNext (which closes over currentStep/phase).
  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  });

  const handleSingleSelect = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    // Conversational auto-advance: pick → tick → next question.
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => handleNextRef.current(), 420);
  };

  const handleBack = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (phase === "parent_consent") {
      setPhase("school");
    } else if (phase === "school") {
      setPhase("subjects");
    } else if (phase === "subjects") {
      setPhase("vark");
      // Returning to VARK from a later phase — land on the result view so the
      // learner sees their profile summary rather than being dropped back into
      // question 1. Retake button still available from there.
      setVarkStep(varkPrimary ? VARK_QUESTIONS.length : 0);
    } else if (phase === "vark") {
      // Within the VARK phase: step backwards through the questionnaire (or
      // out of the result view), and only leave the phase entirely when
      // already at question 0.
      if (varkStep > 0) {
        setVarkStep((prev) => prev - 1);
      } else {
        setPhase("questions");
      }
    } else if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // ── VARK questionnaire helpers ──────────────────────────────────────────
  // Commit the scored result to varkPrimary/varkSecondary as soon as the
  // learner lands on the result view AND has actually answered at least one
  // scenario. Guarding on answer count avoids clobbering a preview-seeded
  // primary (or a persisted result) with the all-zero default from an empty
  // answers map. Re-runs when they retake: retake clears both answers and
  // committed primary, then this fires again as new answers roll in.
  const varkResultView = varkStep >= VARK_QUESTIONS.length;
  useEffect(() => {
    if (!varkResultView) return;
    if (Object.keys(varkAnswers).length === 0) return;
    const scored = scoreVarkAnswers(varkAnswers);
    setVarkPrimary(scored.primary);
    setVarkSecondary(scored.secondary);
    // Committing derived state — the answers map is what's live.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [varkResultView, varkAnswers]);

  // Pick an option for the current scenario, then auto-advance (matches the
  // conversational pattern the primary questions phase uses).
  const handleVarkSelect = (questionId: string, optionValue: string) => {
    setVarkAnswers((prev) => ({ ...prev, [questionId]: optionValue }));
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => handleNextRef.current(), 420);
  };

  const handleVarkRetake = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setVarkAnswers({});
    setVarkPrimary(null);
    setVarkSecondary(null);
    setVarkStep(0);
  };

  // Slim onboarding: the 12-scenario VARK quiz is the biggest friction before a
  // learner reaches the app, so it is skippable. Skipping advances straight to
  // the subjects phase WITHOUT committing a VARK style — varkPrimary /
  // varkSecondary stay null (the columns are nullable and the submit falls back
  // to a neutral "kinesthetic" default, so completion still succeeds). Any
  // scenario answers already picked are left untouched, so the learner can Back
  // into the quiz and finish it later. Consent gating downstream is unchanged.
  const handleSkipVark = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    celebrate(PHASE_CHEERS[language].subjects);
    setPhase("subjects");
  };

  // ── Preview phase jumping ────────────────────────────────────────────────
  // The main reason the preview exists: inspect any step directly without
  // answering everything before it. Jumping ahead seeds obviously-fake sample
  // values (from ONBOARDING_PREVIEW_SAMPLE) for the phases being skipped so
  // later screens render with representative content instead of empty
  // placeholders. The sample ID/DOB describe a minor, so the consent phase
  // shows the parental-consent branch. Seeding only fills gaps — anything the
  // admin already typed into the preview is left alone.
  const PREVIEW_PHASE_ORDER: Array<Phase | "done"> = ["questions", "vark", "subjects", "school", "parent_consent", "done"];
  const previewSeedThrough = (target: Phase | "done") => {
    const idx = PREVIEW_PHASE_ORDER.indexOf(target);
    const S = ONBOARDING_PREVIEW_SAMPLE;
    if (idx > PREVIEW_PHASE_ORDER.indexOf("vark") && !varkPrimary) {
      setVarkPrimary(S.varkPrimary as VarkStyle);
    }
    if (idx > PREVIEW_PHASE_ORDER.indexOf("subjects") && subjectMarks.length < 6) {
      setSubjectMarks(S.subjects.map((s) => ({ subjectCode: s.code, subjectName: s.name, mark: S.subjectMark })));
      setSelectedSubjects(new Set(S.subjects.map((s) => s.code)));
    }
    if (idx > PREVIEW_PHASE_ORDER.indexOf("school")) {
      if (!firstName.trim()) setFirstName(S.firstName);
      if (!lastName.trim()) setLastName(S.lastName);
      if (!schoolName.trim()) {
        setSchoolName(S.schoolName);
        setSchoolQuery(S.schoolName);
      }
      if (!idNumber.trim()) setIdNumber(S.idNumber);
      if (!dobDay && !dobMonth && !dobYear) {
        setDobDay(S.dobDay);
        setDobMonth(S.dobMonth);
        setDobYear(S.dobYear);
      }
    }
  };

  const previewJump = (target: Phase | "done") => {
    if (!inPreview) return;
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    previewSeedThrough(target);
    if (target === "done") {
      setPhase("parent_consent");
      setPreviewDone(true);
      return;
    }
    setPreviewDone(false);
    if (target === "questions") setCurrentStep(0);
    if (target === "vark") {
      // Preview jumped straight to VARK. If we seeded a primary above (or one
      // was already set), land on the result view so the admin sees the
      // finished profile screen. Otherwise start the questionnaire.
      setVarkStep(varkPrimary ? VARK_QUESTIONS.length : 0);
    }
    setPhase(target);
  };

  // Task #43 — Send the parent consent email (best-effort). The endpoint
  // always returns the link so we can offer a manual-share fallback if email
  // delivery isn't configured in this environment.
  const consentMutation = useMutation({
    // previewGate: in preview no consent email (or request) ever leaves the
    // browser — the simulated branch hands back a self-describing sample link.
    mutationFn: previewGate.mutation(
      async () => {
        const r = await apiRequest("POST", "/api/onboarding/parent-consent/request", {
          parentEmail: parentEmail.trim(),
          language: language === "af" ? "af" : "en",
        });
        // apiRequest resolves a Response — the body must be parsed. Casting it
        // straight to the payload type silently handed back the Response's own
        // `url` (the API endpoint), so a learner's "share this with your parent"
        // link pointed at /api/onboarding/parent-consent/request, and the
        // missing `delivery` field always fell through to the manual-share copy.
        return (await r.json()) as { ok: boolean; url: string; delivery: "sent" | "not_configured" | "failed" };
      },
      () => ({
        ok: true,
        url: ONBOARDING_PREVIEW_SAMPLE.consentUrl,
        delivery: "sent" as const,
      }),
    ),
    onSuccess: (data) => {
      setConsentLink(data.url);
      setConsentDelivery(data.delivery);
      setConsentSentTo(parentEmail.trim());
      setEditingParentEmail(false);
      setLinkCopied(false);
      setCopyFailed(false);
      // On the manual paths the link IS the delivery mechanism, so it opens
      // automatically; on the happy path it stays tucked behind "didn't arrive?".
      setShowConsentLink(consentShareMode(data.delivery) === "manual");
      if (inPreview) {
        toast({
          title: isAf ? "Voorskou — geen e-pos gestuur nie" : "Preview — no email was sent",
          description: isAf
            ? "Die skakel hieronder is voorbeelddata."
            : "The link below is sample data.",
        });
        return;
      }
      toast({
        title: t.consentRequestReady,
        description: data.delivery === "sent" ? t.consentSentByEmail : t.consentManualShare,
      });
    },
    onError: () => {
      toast({
        title: t.couldntSend,
        description: t.checkEmailAndRetry,
        variant: "destructive",
      });
    },
  });

  /**
   * Copy the consent link with a visible acknowledgement. `navigator.clipboard`
   * is undefined on insecure origins and older mobile browsers, so failure is
   * surfaced as a "select it yourself" hint rather than swallowed — a silent
   * no-op here would leave a learner believing they'd copied the one thing
   * standing between them and a working account.
   */
  const handleCopyConsentLink = async () => {
    if (!consentLink) return;
    if (copyTimer.current) clearTimeout(copyTimer.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(consentLink);
      setCopyFailed(false);
      setLinkCopied(true);
      copyTimer.current = setTimeout(() => setLinkCopied(false), 2200);
    } catch {
      setLinkCopied(false);
      setCopyFailed(true);
    }
  };

  const questionText = currentQuestion
    ? (language === "en" ? currentQuestion.questionEn : currentQuestion.questionAf)
    : "";

  const categoryLabels: Record<string, { en: string; af: string }> = {
    study: { en: "Study Habits", af: "Studiegewoontes" },
    focus: { en: "Focus & Concentration", af: "Fokus & Konsentrasie" },
    practice: { en: "Practice Style", af: "Oefenstyl" },
    stress: { en: "Exam Stress", af: "Eksamenstres" },
    planning: { en: "Planning & Goals", af: "Beplanning & Doelwitte" },
  };

  const getCategory = (step: number) => {
    if (step < 4) return "study";
    if (step < 8) return "focus";
    if (step < 12) return "practice";
    if (step < 15) return "stress";
    return "planning";
  };

  const category = getCategory(currentStep);

  const QUESTION_ACCENT: Record<string, string> = {
    study: BRAND.cyan,
    focus: BRAND.purple,
    practice: BRAND.yellow,
    stress: BRAND.pink,
    planning: BRAND.mint,
  };
  const accent = phase === "questions"
    ? QUESTION_ACCENT[category]
    : phase === "vark"
    ? BRAND.purple
    : phase === "subjects"
    ? BRAND.yellow
    : phase === "school"
    ? BRAND.cyan
    : BRAND.pink;

  const subjectsDone = subjectMarks.length >= 6;

  // Subject list, filtered for the picker. Default (no filter, "All") keeps
  // every subject in the DOM so nothing is hidden by default.
  const filteredSubjects = useMemo(() => {
    const q = subjectFilter.trim().toLowerCase();
    return GRADE_12_SUBJECTS.filter((s) => {
      if (subjectCategory !== "__all__" && s.category !== subjectCategory) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.nameAfrikaans.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
      );
    });
  }, [subjectFilter, subjectCategory]);

  const subjectCategoryIds = useMemo(
    () => Array.from(new Set(GRADE_12_SUBJECTS.map((s) => s.category))),
    []
  );

  const phaseOrder: Phase[] = ["questions", "vark", "subjects", "school", "parent_consent"];
  const phaseIdx = phaseOrder.indexOf(phase);
  const phaseNames = [t.phaseYou, t.phaseBrain, t.phaseSubjects, t.phaseSchool, t.phaseDone];

  // Shared button styles — large tap targets, brand gradient.
  const primaryBtn =
    "h-14 px-6 text-base font-bold rounded-2xl text-black flex-1 sm:flex-none disabled:opacity-40";
  const primaryBtnStyle = {
    background: `linear-gradient(95deg, ${BRAND.cyan}, ${BRAND.mint}, ${BRAND.yellow})`,
    // Sticker-slap: hard black offset instead of the old soft `shadow-md`
    // blur, so the CTA reads as a printed sticker pressed on the wall.
    boxShadow: "4px 4px 0 0 rgba(0,0,0,.85)",
  } as const;
  const ghostBtn =
    "h-14 px-5 text-base font-bold rounded-2xl bg-transparent text-white border border-white/25 hover:border-white/60 hover:bg-white/[0.06] flex-1 sm:flex-none";

  return (
    <div
      className="relative min-h-screen flex flex-col text-white overflow-x-hidden"
      style={{ background: BRAND.ground, fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif" }}
    >
      <GraffitiSplats variant="full" opacity={0.35} />

      {/* ── Admin preview banner — deliberately loud, impossible to mistake
          for real onboarding. Same dashed-amber hazard treatment as the
          parent-dashboard preview banner (parent-dashboard.tsx). The phase
          chips are the point of the preview: jump straight to any step. ── */}
      {inPreview && (
        <div className="relative z-50 px-4 pt-4">
          <div
            className="max-w-3xl mx-auto rounded-2xl px-5 py-4 space-y-3"
            style={{
              background: "repeating-linear-gradient(135deg, rgba(255,226,154,.16) 0 14px, rgba(255,226,154,.06) 14px 28px)",
              border: `2px dashed ${PREVIEW_AMBER}`,
            }}
            data-testid="onboarding-preview-banner"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <span
                className="inline-flex items-center shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
                style={{ background: PREVIEW_AMBER, color: "#050508" }}
              >
                <Eye className="w-3 h-3 mr-1.5" />
                {isAf ? "Voorskou" : "Preview"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">
                  {isAf
                    ? "Admin-voorskou — niks op hierdie bladsy is werklik nie."
                    : "Admin preview — nothing on this page is real."}
                </p>
                <p className="text-xs text-white mt-0.5">
                  {isAf
                    ? "Elke antwoord, punt en besonderheid word weggegooi — geen profiel, identiteit, vakke of toestemmingsversoek word gestoor nie, en geen e-pos word gestuur nie. Gebruik die fase-knoppies om na enige stap te spring."
                    : "Every answer, mark and detail is discarded — no profile, identity, subjects or consent request is saved, and no email is sent. Use the phase chips to jump to any step."}
                </p>
              </div>
              <button
                onClick={() => { window.location.href = "/learn/admin"; }}
                className="sm:ml-auto shrink-0 px-3 py-2 rounded-xl text-xs font-bold hover:bg-white/10"
                style={{ color: PREVIEW_AMBER, border: `1.5px solid ${PREVIEW_AMBER}` }}
                data-testid="onboarding-preview-exit"
              >
                {isAf ? "Terug na admin" : "Back to admin"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2" data-testid="onboarding-preview-jumps">
              {([
                { id: "questions", en: "Questions", af: "Vrae" },
                { id: "vark", en: "VARK", af: "VARK" },
                { id: "subjects", en: "Subjects", af: "Vakke" },
                { id: "school", en: "Identity & School", af: "Identiteit & Skool" },
                { id: "parent_consent", en: "Consent", af: "Toestemming" },
                { id: "done", en: "Done", af: "Klaar" },
              ] as Array<{ id: Phase | "done"; en: string; af: string }>).map((p) => {
                const active = p.id === "done" ? previewDone : !previewDone && phase === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => previewJump(p.id)}
                    data-testid={`preview-jump-${p.id}`}
                    className="rounded-full px-3.5 h-9 text-[12px] font-bold"
                    style={{
                      background: active ? PREVIEW_AMBER : "transparent",
                      color: active ? "#050508" : PREVIEW_AMBER,
                      border: `1.5px dashed ${PREVIEW_AMBER}`,
                    }}
                  >
                    {isAf ? p.af : p.en}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <header
        className="relative z-40 sticky top-0"
        style={{ background: "rgba(5,5,8,.92)", borderBottom: "1px solid rgba(255,255,255,.10)", backdropFilter: "blur(10px)" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <img src={iconTransparent} alt="BrainTrack" className="h-7 w-7 object-contain" />
            {phase === "questions" && (
              <button
                onClick={() => resetRoleMutation.mutate()}
                disabled={resetRoleMutation.isPending}
                className="inline-flex items-center gap-1 text-[11px] text-white hover:opacity-80 transition-opacity disabled:opacity-50 min-h-[44px] px-1 rounded"
                data-testid="button-change-role"
              >
                <ArrowLeft className="w-3 h-3" />
                {T[language].changeRole}
              </button>
            )}
          </div>
          <div
            className="flex items-center gap-1 rounded-full p-1 shrink-0"
            style={{ background: BRAND.card, border: "1px solid rgba(255,255,255,.14)" }}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full px-3 h-9 font-bold ${language === "en" ? "text-[#0D0D14]" : "text-white"}`}
              style={language === "en" ? { background: BRAND.cyan } : undefined}
              onClick={() => setLanguage("en")}
              data-testid="button-lang-en"
            >
              <Globe className="w-4 h-4 mr-1" />
              EN
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full px-3 h-9 font-bold ${language === "af" ? "text-[#0D0D14]" : "text-white"}`}
              style={language === "af" ? { background: BRAND.cyan } : undefined}
              onClick={() => setLanguage("af")}
              data-testid="button-lang-af"
            >
              AF
            </Button>
          </div>
        </div>

        {/* Pastel progress rail — visibly fills as the journey advances. */}
        <div className="max-w-3xl mx-auto px-4 pb-3">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white truncate">
              {phaseNames[phaseIdx]}
              {phase === "questions" && ` · ${currentStep + 1}/${ONBOARDING_QUESTIONS.length}`}
              {phase === "vark" && varkStep < VARK_QUESTIONS.length && ` · ${varkStep + 1}/${VARK_QUESTIONS.length}`}
            </span>
            <span
              className="text-[15px] shrink-0"
              style={{ fontFamily: MARKER, color: progress >= 75 ? BRAND.yellow : BRAND.mint }}
            >
              {progress >= 75 ? t.almostThere : `${Math.round(progress)}%`}
            </span>
          </div>
          <div
            className="h-2.5 rounded-full w-full overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label={t.progressBarLabel}
            style={{ background: "rgba(255,255,255,.10)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${BRAND.cyan}, ${BRAND.mint}, ${BRAND.yellow}, ${BRAND.pink}, ${BRAND.purple})`,
                transition: "width .55s cubic-bezier(.22,1,.36,1)",
              }}
            />
          </div>
          {/* Phase dots — where you are in the journey. */}
          <div className="flex items-center justify-center gap-1.5 pt-2" data-testid="onboarding-phase-dots" aria-hidden>
            {phaseOrder.map((p, i) => {
              const dotDone = i < phaseIdx;
              const dotActive = i === phaseIdx;
              return (
                <span
                  key={p}
                  style={{
                    width: dotActive ? 26 : 8,
                    height: 8,
                    borderRadius: 999,
                    transition: "all .35s cubic-bezier(.22,1,.36,1)",
                    background: dotDone
                      ? CONFETTI_COLORS[i]
                      : dotActive
                      ? `linear-gradient(90deg, ${BRAND.cyan}, ${BRAND.pink})`
                      : "rgba(255,255,255,.16)",
                    
                  }}
                />
              );
            })}
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full">
        <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-5">
          {/* ── PHASE: QUESTIONS — one big question per screen ─────────────── */}
          {!previewDone && phase === "questions" && currentQuestion && (
            <section
              key={currentQuestion.id}
              data-testid="card-onboarding"
              className="rounded-3xl overflow-hidden"
              style={{
                background: BRAND.card,
                // Sticker-slap: fat accent border + hard offset shadow (no
                // blur), the gravity move used across the app's cards.
                border: `2.5px solid ${BRAND.cyan}`,
                boxShadow: `7px 7px 0 0 ${BRAND.cyan}`,
                animation: anim("bt-fadeup .45s cubic-bezier(.22,1,.36,1) both"),
              }}
            >
              <div aria-hidden className="h-[3px]" style={{ background: `linear-gradient(95deg, ${BRAND.pink}, ${BRAND.yellow}, ${BRAND.mint}, ${BRAND.cyan}, ${BRAND.purple})` }} />
              <div className="p-5 sm:p-8 space-y-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ background: accent, color: BRAND.ground }}
                  >
                    {isAf ? categoryLabels[category].af : categoryLabels[category].en}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    {t.questionProgress
                      .replace("{n}", String(currentStep + 1))
                      .replace("{total}", String(ONBOARDING_QUESTIONS.length))}
                  </span>
                </div>

                {/* One clear question — big, confident, not a form label. */}
                <h2 data-testid="onboarding-heading" className="text-white font-extrabold leading-[1.15] text-[26px] sm:text-[34px] tracking-tight">
                  {questionText}
                </h2>

                {currentQuestion.type === "single" && currentQuestion.options && (
                  <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label={questionText}>
                    {currentQuestion.options.map((option, i) => {
                      const isSel = answers[currentQuestion.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={isSel}
                          onClick={() => handleSingleSelect(option.value)}
                          data-testid={`option-${option.value}`}
                          className="w-full text-left flex items-center gap-3 rounded-2xl px-4 py-4 min-h-[64px]"
                          style={{
                            background: isSel ? `${accent}1F` : "rgba(255,255,255,.03)",
                            border: `1.5px solid ${isSel ? accent : "rgba(255,255,255,.14)"}`,
                            
                            transition: "background .2s ease, border-color .2s ease, box-shadow .2s ease",
                            animation: anim(`bt-fadeup .4s cubic-bezier(.22,1,.36,1) ${0.04 * i}s both`),
                          }}
                        >
                          <span
                            className="shrink-0 rounded-full flex items-center justify-center"
                            style={{
                              width: 26,
                              height: 26,
                              background: isSel ? accent : "transparent",
                              border: `1.5px solid ${isSel ? accent : "rgba(255,255,255,.32)"}`,
                            }}
                          >
                            {isSel && <Check className="w-4 h-4" style={{ color: BRAND.ground }} />}
                          </span>
                          <span className="flex-1 text-white font-semibold text-[16px] sm:text-lg leading-snug">
                            {language === "en" ? option.labelEn : option.labelAf}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === "multiple" && currentQuestion.options && (
                  <div className="grid grid-cols-1 gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                      {t.selectAllThatApply}
                    </p>
                    {currentQuestion.options.map((option, i) => {
                      const isChecked = ((answers[currentQuestion.id] as string[]) || []).includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={isChecked}
                          onClick={() => handleMultiSelect(option.value, !isChecked)}
                          data-testid={`option-${option.value}`}
                          className="w-full text-left flex items-center gap-3 rounded-2xl px-4 py-4 min-h-[64px]"
                          style={{
                            background: isChecked ? `${accent}1F` : "rgba(255,255,255,.03)",
                            border: `1.5px solid ${isChecked ? accent : "rgba(255,255,255,.14)"}`,
                            
                            transition: "background .2s ease, border-color .2s ease, box-shadow .2s ease",
                            animation: anim(`bt-fadeup .4s cubic-bezier(.22,1,.36,1) ${0.04 * i}s both`),
                          }}
                        >
                          <span
                            className="shrink-0 rounded-lg flex items-center justify-center"
                            style={{
                              width: 26,
                              height: 26,
                              background: isChecked ? accent : "transparent",
                              border: `1.5px solid ${isChecked ? accent : "rgba(255,255,255,.32)"}`,
                            }}
                          >
                            {isChecked && <Check className="w-4 h-4" style={{ color: BRAND.ground }} />}
                          </span>
                          <span className="flex-1 text-white font-semibold text-[16px] sm:text-lg leading-snug">
                            {language === "en" ? option.labelEn : option.labelAf}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === "slider" && (
                  <div className="space-y-8 py-4">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div
                          className="w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center"
                          style={{
                            border: `6px solid ${accent}`,
                          }}
                        >
                          <span className="text-5xl font-extrabold text-white">
                            {(answers[currentQuestion.id] as number) || currentQuestion.min}
                          </span>
                        </div>
                        <span
                          className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.16em] px-3 py-1 rounded-full whitespace-nowrap"
                          style={{ background: accent, color: BRAND.ground }}
                        >
                          {t.minutesLabel}
                        </span>
                      </div>
                    </div>
                    <Slider
                      value={[(answers[currentQuestion.id] as number) || currentQuestion.min || 15]}
                      onValueChange={handleSliderChange}
                      min={currentQuestion.min}
                      max={currentQuestion.max}
                      step={currentQuestion.step}
                      className="w-full"
                      data-testid="slider-focus"
                    />
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                      <span>{currentQuestion.min} min</span>
                      <span>{currentQuestion.max} min</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className={ghostBtn}
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-5 h-5 mr-1.5" />
                    {t.backBtn}
                  </Button>
                  <Button
                    className={primaryBtn}
                    style={primaryBtnStyle}
                    onClick={handleNext}
                    disabled={!canProceed()}
                    data-testid="button-next"
                  >
                    {t.nextBtn}
                    <ArrowRight className="w-5 h-5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* ── PHASE: VARK ──────────────────────────────────────────────────
              A real assessment (not self-selection). Twelve SA-context
              scenarios, one per screen, tallied into a primary + optional
              secondary VARK style. When on the final result view (varkStep ==
              VARK_QUESTIONS.length) we display the profile using the same
              VARK_STYLES icons the dashboard uses so what the learner sees
              here matches what they see later. ────────────────────────────── */}
          {!previewDone && phase === "vark" && (
            <section
              data-testid="card-vark"
              className="rounded-3xl overflow-hidden"
              style={{
                background: BRAND.card,
                border: `2.5px solid ${BRAND.purple}`,
                boxShadow: `7px 7px 0 0 ${BRAND.purple}`,
                animation: anim("bt-fadeup .45s cubic-bezier(.22,1,.36,1) both"),
              }}
            >
              <div aria-hidden className="h-[3px]" style={{ background: `linear-gradient(95deg, ${BRAND.pink}, ${BRAND.yellow}, ${BRAND.mint}, ${BRAND.cyan}, ${BRAND.purple})` }} />
              <div className="p-5 sm:p-8 space-y-6">
                {/* Header + bilingual scenario progress dots (one dot per
                    question, active dot grows wider, completed dots filled). */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ background: BRAND.purple, color: BRAND.ground }}
                  >
                    {t.phaseBrain}
                  </span>
                  {varkStep < VARK_QUESTIONS.length && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                      {t.varkScenarioProgress
                        .replace("{n}", String(varkStep + 1))
                        .replace("{total}", String(VARK_QUESTIONS.length))}
                    </span>
                  )}
                </div>

                <h2 className="text-white font-extrabold leading-[1.15] text-[26px] sm:text-[34px] tracking-tight">
                  {varkStep < VARK_QUESTIONS.length
                    ? (language === "en"
                        ? VARK_QUESTIONS[varkStep].promptEn
                        : VARK_QUESTIONS[varkStep].promptAf)
                    : t.varkResultHeading}
                </h2>
                <p className="text-white text-[14px] leading-relaxed">
                  {varkStep < VARK_QUESTIONS.length ? t.varkQuestionnaireSubtitle : t.varkResultSubtitle}
                </p>

                {/* Scenario progress dots — visible on every questionnaire
                    step, hidden on the result view. */}
                {varkStep < VARK_QUESTIONS.length && (
                  <div
                    className="flex items-center justify-center gap-1.5"
                    data-testid="vark-progress-dots"
                    aria-label={t.varkScenarioProgress
                      .replace("{n}", String(varkStep + 1))
                      .replace("{total}", String(VARK_QUESTIONS.length))}
                  >
                    {VARK_QUESTIONS.map((q, i) => {
                      const isActive = i === varkStep;
                      const isAnswered = typeof varkAnswers[q.id] === "string";
                      return (
                        <span
                          key={q.id}
                          aria-hidden
                          style={{
                            width: isActive ? 24 : 8,
                            height: 8,
                            borderRadius: 999,
                            background: isActive
                              ? `linear-gradient(90deg, ${BRAND.cyan}, ${BRAND.purple})`
                              : isAnswered
                                ? BRAND.mint
                                : "rgba(255,255,255,.18)",
                            transition: "all .35s cubic-bezier(.22,1,.36,1)",
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* ── Questionnaire mode: one scenario, four options ─────── */}
                {varkStep < VARK_QUESTIONS.length && (() => {
                  const question = VARK_QUESTIONS[varkStep];
                  const selected = varkAnswers[question.id];
                  return (
                    <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label={
                      language === "en" ? question.promptEn : question.promptAf
                    }>
                      {question.options.map((option, i) => {
                        const isSel = selected === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={isSel}
                            onClick={() => handleVarkSelect(question.id, option.value)}
                            data-testid={`vark-q-${varkStep}-option-${option.style}`}
                            className="w-full text-left flex items-center gap-3 rounded-2xl px-4 py-4 min-h-[64px]"
                            style={{
                              background: isSel ? `${BRAND.purple}1F` : "rgba(255,255,255,.03)",
                              border: `1.5px solid ${isSel ? BRAND.purple : "rgba(255,255,255,.14)"}`,
                              transition: "background .2s ease, border-color .2s ease",
                              animation: anim(`bt-fadeup .4s cubic-bezier(.22,1,.36,1) ${0.04 * i}s both`),
                            }}
                          >
                            <span
                              className="shrink-0 rounded-full flex items-center justify-center"
                              style={{
                                width: 26,
                                height: 26,
                                background: isSel ? BRAND.purple : "transparent",
                                border: `1.5px solid ${isSel ? BRAND.purple : "rgba(255,255,255,.32)"}`,
                              }}
                            >
                              {isSel && <Check className="w-4 h-4" style={{ color: BRAND.ground }} />}
                            </span>
                            <span className="flex-1 text-white font-semibold text-[16px] sm:text-lg leading-snug">
                              {language === "en" ? option.labelEn : option.labelAf}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* ── Result view: primary (large) + optional secondary ──── */}
                {varkResultView && varkPrimary && (() => {
                  const primaryMeta = VARK_STYLES[varkPrimary];
                  const secondaryMeta = varkSecondary ? VARK_STYLES[varkSecondary] : null;
                  return (
                    <div className="space-y-4" data-testid="vark-result">
                      <div
                        className="rounded-2xl p-5 sm:p-6"
                        data-testid={`vark-result-primary-${varkPrimary}`}
                        style={{
                          background: `${BRAND.purple}1F`,
                          border: `1.5px solid ${BRAND.purple}`,
                          animation: anim("bt-fadeup .45s cubic-bezier(.22,1,.36,1) both"),
                        }}
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                          {t.varkPrimaryHeading}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-6xl leading-none">{primaryMeta.icon}</span>
                          <div className="min-w-0">
                            <p className="text-white font-extrabold text-[24px] sm:text-[28px] leading-tight">
                              {language === "en" ? primaryMeta.label : primaryMeta.labelAf}
                            </p>
                            <p className="text-white text-[14px] mt-1 leading-snug">
                              {language === "en" ? primaryMeta.tagline : primaryMeta.taglineAf}
                            </p>
                          </div>
                        </div>
                      </div>

                      {secondaryMeta ? (
                        <div
                          className="rounded-2xl p-4 sm:p-5"
                          data-testid={`vark-result-secondary-${varkSecondary}`}
                          style={{
                            background: `${BRAND.cyan}14`,
                            border: `1px solid ${BRAND.cyan}66`,
                            animation: anim("bt-fadeup .45s cubic-bezier(.22,1,.36,1) .08s both"),
                          }}
                        >
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                            {t.varkSecondaryHeading}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-4xl leading-none">{secondaryMeta.icon}</span>
                            <div className="min-w-0">
                              <p className="text-white font-extrabold text-[18px] leading-tight">
                                {language === "en" ? secondaryMeta.label : secondaryMeta.labelAf}
                              </p>
                              <p className="text-white text-[13px] mt-0.5 leading-snug">
                                {language === "en" ? secondaryMeta.tagline : secondaryMeta.taglineAf}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="rounded-2xl px-4 py-3"
                          data-testid="vark-result-no-secondary"
                          style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.14)" }}
                        >
                          <p className="text-white text-[13px] leading-relaxed">
                            {t.varkNoSecondary}
                          </p>
                        </div>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleVarkRetake}
                        data-testid="button-vark-retake"
                        className="w-full sm:w-auto min-h-[48px] px-5 text-[14px] font-bold rounded-2xl text-white hover:bg-white/[0.06]"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" aria-hidden />
                        {t.varkRetakeBtn}
                      </Button>
                    </div>
                  );
                })()}

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className={ghostBtn} onClick={handleBack} data-testid="button-back-vark">
                    <ArrowLeft className="w-5 h-5 mr-1.5" />
                    {t.backBtn}
                  </Button>
                  <Button
                    className={primaryBtn}
                    style={primaryBtnStyle}
                    onClick={handleNext}
                    disabled={!canProceed()}
                    data-testid="button-next-vark"
                  >
                    {t.nextBtn}
                    <ArrowRight className="w-5 h-5 ml-1.5" />
                  </Button>
                </div>

                {/* Skip the quiz — the 12 scenarios are optional. Only offered
                    while still answering; on the result view the learner has a
                    committed style so Next is the natural action. Advances
                    straight to Subjects, leaving the VARK style unset. */}
                {varkStep < VARK_QUESTIONS.length && (
                  <button
                    type="button"
                    onClick={handleSkipVark}
                    data-testid="onboarding-skip-vark"
                    className="w-full min-h-[48px] px-5 text-[14px] font-bold rounded-2xl text-white bg-transparent border border-white/25 hover:border-white/60 hover:bg-white/[0.06] transition-colors"
                  >
                    {t.varkSkipBtn}
                  </button>
                )}
              </div>
            </section>
          )}

          {/* ── PHASE: SUBJECTS — the fun part ─────────────────────────────── */}
          {!previewDone && phase === "subjects" && (
            <section
              data-testid="card-subjects"
              className="rounded-3xl overflow-hidden"
              style={{
                background: BRAND.card,
                border: `2.5px solid ${BRAND.mint}`,
                boxShadow: `7px 7px 0 0 ${BRAND.mint}`,
                animation: anim("bt-fadeup .45s cubic-bezier(.22,1,.36,1) both"),
              }}
            >
              <div aria-hidden className="h-[3px]" style={{ background: `linear-gradient(95deg, ${BRAND.pink}, ${BRAND.yellow}, ${BRAND.mint}, ${BRAND.cyan}, ${BRAND.purple})` }} />
              <div className="p-5 sm:p-8 space-y-5">
                <h2 className="text-white font-extrabold leading-[1.15] text-[26px] sm:text-[34px] tracking-tight">
                  {t.subjectsHeading}
                </h2>

                {/* Live counter — celebrates the moment 6 is hit. */}
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  data-testid="subject-counter"
                  style={{
                    background: subjectsDone ? `${BRAND.mint}1A` : "rgba(255,255,255,.04)",
                    border: `1.5px solid ${subjectsDone ? BRAND.mint : "rgba(255,255,255,.14)"}`,
                    transition: "background .3s ease, border-color .3s ease",
                  }}
                >
                  <span
                    className="shrink-0 rounded-xl flex items-center justify-center font-extrabold"
                    style={{
                      minWidth: 62,
                      height: 44,
                      fontSize: 18,
                      background: subjectsDone ? BRAND.mint : "rgba(255,255,255,.08)",
                      color: subjectsDone ? BRAND.ground : "#FFFFFF",
                      animation: subjectsDone ? anim("bt-checkpop .45s cubic-bezier(.22,1,.36,1) both") : undefined,
                    }}
                  >
                    {subjectMarks.length}/6
                  </span>
                  <div className="min-w-0">
                    {subjectsDone ? (
                      <p className="font-bold text-white text-[15px] leading-snug">
                        ✓ {t.minimumHit} — {subjectMarks.length} {t.subjectCountLabel}
                      </p>
                    ) : (
                      <p className="font-semibold text-white text-[14px] leading-snug">
                        {(() => {
                          const n = 6 - subjectMarks.length;
                          return t.selectMoreMsg
                            .replace("{count}", String(n))
                            .replace("{plural}", n > 1 ? t.selectMorePlural : "");
                        })()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Filter — search + category pills. Defaults to showing all. */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
                    <Input
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      placeholder={t.subjectFilterPh}
                      className="h-12 pl-11 rounded-2xl text-white"
                      style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.14)" }}
                      data-testid="input-subject-filter"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                    {["__all__", ...subjectCategoryIds].map((cat) => {
                      const active = subjectCategory === cat;
                      const cm = cat === "__all__" ? { color: "#FFFFFF", icon: "✨" } : metaFor(cat);
                      const label = cat === "__all__" ? t.allSubjectsLabel : cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSubjectCategory(cat)}
                          data-testid={`subject-cat-${cat}`}
                          className="shrink-0 rounded-full px-3.5 h-10 text-[13px] font-bold whitespace-nowrap"
                          style={{
                            background: active ? cm.color : "rgba(255,255,255,.05)",
                            color: active ? BRAND.ground : "#FFFFFF",
                            border: `1px solid ${active ? cm.color : "rgba(255,255,255,.14)"}`,
                          }}
                        >
                          {cm.icon} {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subject cards — tactile, colour-coded, light mark entry. */}
                <div className="grid gap-3 max-h-[58vh] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredSubjects.length === 0 && (
                    <p className="text-white text-sm py-6 text-center">{t.noSubjectMatches}</p>
                  )}
                  {filteredSubjects.map((subject) => {
                    const isSelected = selectedSubjects.has(subject.code);
                    const mark = subjectMarks.find((s) => s.subjectCode === subject.code)?.mark ?? 50;
                    const cm = metaFor(subject.category);
                    return (
                      <div
                        key={subject.code}
                        className="rounded-2xl overflow-hidden"
                        style={{
                          background: isSelected ? `${cm.color}16` : "rgba(255,255,255,.03)",
                          border: `1.5px solid ${isSelected ? cm.color : "rgba(255,255,255,.12)"}`,
                          
                          transition: "background .2s ease, border-color .2s ease, box-shadow .2s ease",
                        }}
                      >
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleSubject(subject.code, subject.name)}
                          data-testid={`subject-${subject.code}`}
                          className="w-full text-left flex items-center gap-3 px-4 py-3.5 min-h-[64px]"
                        >
                          <span
                            className="shrink-0 rounded-xl flex items-center justify-center text-xl"
                            style={{
                              width: 42,
                              height: 42,
                              background: isSelected ? cm.color : "rgba(255,255,255,.06)",
                              border: `1px solid ${isSelected ? cm.color : "rgba(255,255,255,.12)"}`,
                            }}
                          >
                            {cm.icon}
                          </span>
                          <span className="flex-1 min-w-0 text-white font-bold text-[15px] leading-snug break-words">
                            {language === "en" ? subject.name : subject.nameAfrikaans}
                          </span>
                          <span
                            className="shrink-0 rounded-full flex items-center justify-center"
                            style={{
                              width: 26,
                              height: 26,
                              background: isSelected ? cm.color : "transparent",
                              border: `1.5px solid ${isSelected ? cm.color : "rgba(255,255,255,.30)"}`,
                            }}
                          >
                            {isSelected && <Check className="w-4 h-4" style={{ color: BRAND.ground }} />}
                          </span>
                        </button>

                        {isSelected && (
                          <div
                            className="px-4 pb-4 pt-1 space-y-3"
                            style={{ animation: anim("bt-fadeup .35s cubic-bezier(.22,1,.36,1) both") }}
                          >
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                                {t.markLabel}
                              </span>
                              <div className="flex items-center gap-1.5 ml-auto">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={mark}
                                  onChange={(e) => updateMark(subject.code, parseInt(e.target.value) || 0)}
                                  className="w-[76px] h-12 text-center font-extrabold text-xl rounded-xl text-white"
                                  style={{
                                    background: "rgba(0,0,0,.35)",
                                    border: `1.5px solid ${cm.color}66`,
                                  }}
                                  data-testid={`mark-${subject.code}`}
                                />
                                <span className="text-xl font-extrabold text-white">%</span>
                              </div>
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                              {MARK_CHIPS.map((v) => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => updateMark(subject.code, v)}
                                  data-testid={`mark-chip-${subject.code}-${v}`}
                                  className="rounded-full h-10 px-3 text-[13px] font-bold"
                                  style={{
                                    background: mark === v ? cm.color : "rgba(255,255,255,.06)",
                                    color: mark === v ? BRAND.ground : "#FFFFFF",
                                    border: `1px solid ${mark === v ? cm.color : "rgba(255,255,255,.14)"}`,
                                  }}
                                >
                                  {v}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className={ghostBtn} onClick={handleBack} data-testid="button-back-subjects">
                    <ArrowLeft className="w-5 h-5 mr-1.5" />
                    {t.backBtn}
                  </Button>
                  <Button
                    className={primaryBtn}
                    style={primaryBtnStyle}
                    onClick={handleNext}
                    disabled={!canProceed()}
                    data-testid="button-subjects-next"
                  >
                    {t.nextBtn}
                    <ArrowRight className="w-5 h-5 ml-1.5" />
                  </Button>
                </div>

                <p className="text-center text-[12px] text-white pt-1 leading-relaxed">
                  {t.termsAgree}{" "}
                  <Link href="/terms" className="underline">{t.termsLink}</Link>
                  {" "}{t.termsAnd}{" "}
                  <Link href="/privacy" className="underline">{t.privacyLink}</Link>.
                </p>
              </div>
            </section>
          )}

          {/* ── PHASE: SCHOOL — sequenced, conversational detail capture ───── */}
          {!previewDone && phase === "school" && (
            <section
              data-testid="card-school"
              className="rounded-3xl overflow-hidden"
              style={{
                background: "rgba(28,28,38,.6)",
                border: "1px solid rgba(255,255,255,.12)",
                animation: anim("bt-fadeup .45s cubic-bezier(.22,1,.36,1) both"),
              }}
            >
              <div aria-hidden className="h-[3px]" style={{ background: `linear-gradient(95deg, ${BRAND.pink}, ${BRAND.yellow}, ${BRAND.mint}, ${BRAND.cyan}, ${BRAND.purple})` }} />
              <div className="p-4 sm:p-7 space-y-4">
                {/* 1 — Name */}
                <StepBlock
                  n={1}
                  title={t.nameQ}
                  hint={t.nameQHint}
                  done={firstName.trim().length >= 1 && lastName.trim().length >= 1}
                  accent={BRAND.cyan}
                  testId="school-block-name"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      id="onboarding-first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); lastNameRef.current?.focus(); } }}
                      placeholder={t.firstNamePlaceholder}
                      autoComplete="given-name"
                      aria-label={t.firstNameLabel}
                      className="h-14 rounded-2xl text-white text-base px-4"
                      style={{ background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.16)" }}
                      data-testid="input-first-name"
                    />
                    <Input
                      id="onboarding-last-name"
                      ref={lastNameRef}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); schoolInputRef.current?.focus(); } }}
                      placeholder={t.lastNamePlaceholder}
                      autoComplete="family-name"
                      aria-label={t.lastNameLabel}
                      className="h-14 rounded-2xl text-white text-base px-4"
                      style={{ background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.16)" }}
                      data-testid="input-last-name"
                    />
                  </div>
                </StepBlock>

                {/* 2 — School */}
                <StepBlock
                  n={2}
                  title={t.schoolQ}
                  hint={t.schoolSearchHint}
                  done={schoolName.trim().length >= 2}
                  accent={BRAND.purple}
                  testId="school-block-school"
                >
                  <Input
                    ref={schoolInputRef}
                    value={schoolQuery}
                    onChange={(e) => {
                      setSchoolQuery(e.target.value);
                      setSchoolName(e.target.value);
                      setSchoolId(null);
                    }}
                    placeholder={t.schoolPlaceholder}
                    aria-label={t.schoolNameLabel}
                    className="h-14 rounded-2xl text-white text-base px-4"
                    style={{ background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.16)" }}
                    data-testid="input-school-name"
                  />
                  {schoolSearching && (
                    <p className="text-[12px] text-white mt-2">{t.schoolSearchingLabel}</p>
                  )}
                  {schoolResults.length > 0 && (
                    <div
                      className="mt-2 rounded-2xl overflow-hidden max-h-56 overflow-y-auto"
                      style={{ border: "1px solid rgba(255,255,255,.14)", background: "rgba(0,0,0,.45)" }}
                    >
                      {schoolResults.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSchoolId(s.id);
                            setSchoolName(s.name);
                            setSchoolQuery(s.name);
                            setSchoolResults([]);
                            idNumberRef.current?.focus();
                          }}
                          className="w-full text-left px-4 py-3.5 min-h-[56px] hover:bg-white/[0.06]"
                          style={{ background: schoolId === s.id ? `${BRAND.cyan}1A` : undefined, borderTop: "1px solid rgba(255,255,255,.08)" }}
                          data-testid={`school-result-${s.id}`}
                        >
                          <div className="font-bold text-white text-[15px] leading-snug">{s.name}</div>
                          {s.province && <div className="text-[12px] text-white">{s.province}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                  {schoolId && (
                    <p className="text-[12px] mt-2" style={{ color: BRAND.mint }} data-testid="text-school-linked">
                      {t.schoolLinkedLabel}
                    </p>
                  )}
                  {!schoolId && schoolName.trim().length >= 2 && (
                    <p className="text-[12px] text-white mt-2">{t.schoolPendingLabel}</p>
                  )}
                </StepBlock>

                {/* 3 — SA ID */}
                <StepBlock
                  n={3}
                  title={t.idQ}
                  done={isValidSaIdNumber(idNumber)}
                  accent={BRAND.yellow}
                  testId="school-block-id"
                >
                  <Input
                    id="onboarding-id-number"
                    ref={idNumberRef}
                    value={idNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 13);
                      setIdNumber(v);
                      if (v.length === 13) dobDayRef.current?.focus();
                    }}
                    placeholder={t.idNumberPlaceholder}
                    inputMode="numeric"
                    maxLength={13}
                    aria-label={t.idNumberLabel}
                    className="h-14 rounded-2xl text-white text-lg px-4 tracking-[0.16em] font-bold"
                    style={{ background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.16)" }}
                    data-testid="input-id-number"
                  />
                  {/* 13 pips so progress is visible without counting. */}
                  <div className="flex gap-1 mt-2.5" aria-hidden>
                    {Array.from({ length: 13 }).map((_, i) => (
                      <span
                        key={i}
                        className="flex-1 rounded-full"
                        style={{
                          height: 4,
                          background: i < idNumber.length ? BRAND.yellow : "rgba(255,255,255,.14)",
                          transition: "background .2s ease",
                        }}
                      />
                    ))}
                  </div>
                  {idNumber.trim().length > 0 && !isValidSaIdNumber(idNumber) ? (
                    <p className="text-[12px] mt-2" style={{ color: BRAND.pink }} data-testid="text-id-number-error">
                      {t.idNumberInvalid}
                    </p>
                  ) : (
                    <p className="text-[12px] text-white mt-2">{t.idNumberHint}</p>
                  )}
                </StepBlock>

                {/* 4 — Date of birth (raw DOB never persisted client-side) */}
                <StepBlock
                  n={4}
                  title={t.dobQ}
                  done={(() => {
                    const iso = buildIsoDob(dobDay, dobMonth, dobYear);
                    return !!iso && dobMatchesIdNumber(iso, idNumber);
                  })()}
                  accent={BRAND.pink}
                  testId="dob-block"
                >
                  <p style={{ fontFamily: MARKER, color: BRAND.yellow, fontSize: 15, transform: "rotate(-2deg)", margin: "0 0 10px" }}>
                    {t.dobEyebrow}
                  </p>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Input
                      id="onboarding-dob-day"
                      ref={dobDayRef}
                      value={dobDay}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                        setDobDay(v);
                        if (v.length === 2) dobMonthRef.current?.focus();
                      }}
                      placeholder={t.dobDayPh}
                      inputMode="numeric"
                      maxLength={2}
                      autoComplete="bday-day"
                      aria-label={t.dobDayPh}
                      className="h-14 w-[58px] text-center text-lg font-extrabold rounded-2xl text-white px-1"
                      style={{ background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.16)" }}
                      data-testid="input-dob-day"
                    />
                    <span className="text-xl font-black shrink-0" style={{ color: BRAND.purple }}>/</span>
                    <Input
                      id="onboarding-dob-month"
                      ref={dobMonthRef}
                      value={dobMonth}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                        setDobMonth(v);
                        if (v.length === 2) dobYearRef.current?.focus();
                      }}
                      placeholder={t.dobMonthPh}
                      inputMode="numeric"
                      maxLength={2}
                      autoComplete="bday-month"
                      aria-label={t.dobMonthPh}
                      className="h-14 w-[58px] text-center text-lg font-extrabold rounded-2xl text-white px-1"
                      style={{ background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.16)" }}
                      data-testid="input-dob-month"
                    />
                    <span className="text-xl font-black shrink-0" style={{ color: BRAND.purple }}>/</span>
                    <Input
                      id="onboarding-dob-year"
                      ref={dobYearRef}
                      value={dobYear}
                      onChange={(e) => setDobYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder={t.dobYearPh}
                      inputMode="numeric"
                      maxLength={4}
                      autoComplete="bday-year"
                      aria-label={t.dobYearPh}
                      className="h-14 w-[86px] text-center text-lg font-extrabold rounded-2xl text-white px-1"
                      style={{ background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.16)" }}
                      data-testid="input-dob-year"
                    />
                    <span className="text-2xl shrink-0" aria-hidden>🎂</span>
                  </div>
                  {(() => {
                    const complete = dobDay.length >= 1 && dobMonth.length >= 1 && dobYear.length === 4;
                    if (!complete) return <p className="text-[12px] text-white mt-2">{t.dobHint}</p>;
                    const isoDob = buildIsoDob(dobDay, dobMonth, dobYear);
                    if (!isoDob) {
                      return <p className="text-[12px] mt-2" style={{ color: BRAND.pink }} data-testid="text-dob-error">{t.dobInvalid}</p>;
                    }
                    if (isValidSaIdNumber(idNumber) && !dobMatchesIdNumber(isoDob, idNumber)) {
                      return <p className="text-[12px] mt-2" style={{ color: BRAND.pink }} data-testid="text-dob-mismatch">{t.dobMismatch}</p>;
                    }
                    return <p className="text-[12px] mt-2" style={{ color: BRAND.mint }} data-testid="text-dob-ok">✓ {t.dobLabel}</p>;
                  })()}
                </StepBlock>

                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className={ghostBtn} onClick={handleBack} data-testid="button-back-school">
                    <ArrowLeft className="w-5 h-5 mr-1.5" />
                    {T[language].backBtn}
                  </Button>
                  <Button
                    className={primaryBtn}
                    style={primaryBtnStyle}
                    onClick={handleNext}
                    disabled={!canProceed()}
                    data-testid="button-next-school"
                  >
                    {T[language].nextBtn}
                    <ArrowRight className="w-5 h-5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* ── PHASE: PARENT CONSENT — finish strong ──────────────────────── */}
          {!previewDone && phase === "parent_consent" && (
            <section
              data-testid="card-parent-consent"
              className="rounded-3xl overflow-hidden"
              style={{
                background: BRAND.card,
                border: "1px solid rgba(255,255,255,.12)",
                animation: anim("bt-fadeup .45s cubic-bezier(.22,1,.36,1) both"),
              }}
            >
              <div aria-hidden className="h-[3px]" style={{ background: `linear-gradient(95deg, ${BRAND.pink}, ${BRAND.yellow}, ${BRAND.mint}, ${BRAND.cyan}, ${BRAND.purple})` }} />
              <div className="p-5 sm:p-8 space-y-6">
                <div>
                  <p style={{ fontFamily: MARKER, color: BRAND.yellow, fontSize: 20, transform: "rotate(-2deg)", margin: "0 0 6px" }}>
                    {t.letsGetIt}
                  </p>
                  <h2 className="text-white font-extrabold leading-[1.12] text-[28px] sm:text-[36px] tracking-tight">
                    {t.youreSetTitle}
                  </h2>
                  <p className="text-white text-[15px] mt-2">{t.youreSetSub}</p>
                </div>

                {/* Setup summary — makes the work feel banked. */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" data-testid="onboarding-summary">
                  {[
                    { label: t.summarySubjectsLabel, value: String(subjectMarks.length), icon: "📚", color: BRAND.yellow },
                    {
                      label: t.summaryStyleLabel,
                      value: varkPrimary ? (language === "en" ? VARK_STYLES[varkPrimary].label : VARK_STYLES[varkPrimary].labelAf) : "—",
                      icon: varkPrimary ? VARK_STYLES[varkPrimary].icon : "🧠",
                      color: BRAND.purple,
                    },
                    { label: t.summarySchoolLabel, value: schoolName.trim() || "—", icon: "🏫", color: BRAND.cyan },
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      className="rounded-2xl px-4 py-3.5"
                      style={{
                        background: `${item.color}14`,
                        border: `1px solid ${item.color}55`,
                        animation: anim(`bt-fadeup .45s cubic-bezier(.22,1,.36,1) ${0.06 * i}s both`),
                      }}
                    >
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                        {item.icon} {item.label}
                      </p>
                      <p className="text-white font-extrabold text-lg leading-tight mt-1 break-words">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* ── Parental consent ────────────────────────────────────
                    Three honest outcomes, three different screens:
                      • not sent yet  — explain WHY, then ask for the address.
                      • delivery "sent"        — reassure, link tucked away.
                      • "not_configured"/"failed" — the learner is the courier,
                        so the link becomes the headline and copy is primary.
                    Requirement is age-conditional: hard for minors (POPIA),
                    plainly optional for adults. ─────────────────────────── */}
                {(() => {
                  const shareMode = consentShareMode(consentDelivery);
                  const requested = consentLink !== null;
                  const manual = requested && shareMode === "manual";
                  const sentTo = consentSentTo ?? parentEmail.trim();
                  // Panel accent follows the outcome: mint = handled for you,
                  // yellow = your turn to act, neutral = nothing sent yet.
                  const accent = !requested ? BRAND.cyan : manual ? BRAND.yellow : BRAND.mint;
                  const showForm = !requested || editingParentEmail;

                  const emailErrorText =
                    parentEmailProblem === "invalid" ? t.parentEmailErrInvalid :
                    parentEmailProblem === "self" ? t.parentEmailErrSelf :
                    null;
                  // Only nag once they've typed something — an untouched field
                  // showing a red error is hostile, not helpful.
                  const showEmailError = emailErrorText !== null && parentEmail.trim().length > 0;

                  return (
                    <div
                      className="rounded-2xl p-4 sm:p-5"
                      style={{ background: `${accent}10`, border: `1px solid ${accent}55` }}
                      data-testid="parent-consent-panel"
                    >
                      {/* Why this exists — the part a 17-year-old actually needs. */}
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ border: `1px solid ${accent}66`, background: `${accent}14` }}
                        >
                          <ShieldCheck className="w-5 h-5" style={{ color: accent }} aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-white font-extrabold text-lg sm:text-xl leading-tight">
                            {isMinor ? t.consentWhyMinorTitle : t.consentWhyAdultTitle}
                          </h3>
                          <p className="text-white text-[14px] leading-relaxed mt-1.5">
                            {isMinor ? t.consentWhyMinorBody : t.consentWhyAdultBody}
                          </p>
                        </div>
                      </div>

                      {/* Trust: exactly what the parent receives, and that their
                          address is not used for anything else. */}
                      <div
                        className="mt-4 rounded-2xl p-4"
                        style={{ background: "rgba(0,0,0,.28)", border: "1px solid rgba(255,255,255,.12)" }}
                        data-testid="consent-trust-panel"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
                          {t.consentTrustTitle}
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {[t.consentTrustPoint1, t.consentTrustPoint2, t.consentTrustPoint3].map((point) => (
                            <li key={point} className="flex items-start gap-2 text-white text-[13px] leading-relaxed">
                              <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accent }} aria-hidden />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* ── Ask for the address ─────────────────────────── */}
                      {showForm && (
                        <div className="mt-4">
                          <label
                            htmlFor="parent-email-input"
                            className="block text-[12px] font-bold text-white mb-1.5"
                          >
                            {t.parentEmailLabel}
                            {!isMinor && (
                              <span className="font-semibold ml-1.5" style={{ color: BRAND.cyan }}>
                                {t.consentOptionalHint}
                              </span>
                            )}
                          </label>
                          <Input
                            id="parent-email-input"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            value={parentEmail}
                            onChange={(e) => setParentEmail(e.target.value)}
                            placeholder={t.parentEmailPlaceholder}
                            aria-label={t.parentEmailLabel}
                            aria-invalid={showEmailError || undefined}
                            aria-describedby={showEmailError ? "parent-email-error" : undefined}
                            className="h-14 rounded-2xl text-white text-base px-4"
                            style={{
                              background: "rgba(0,0,0,.35)",
                              border: `1px solid ${showEmailError ? "#FF8DA1" : "rgba(255,255,255,.16)"}`,
                            }}
                            data-testid="input-parent-email"
                          />
                          {showEmailError && (
                            <p
                              id="parent-email-error"
                              role="alert"
                              className="text-[12px] font-semibold mt-1.5 flex items-start gap-1.5"
                              style={{ color: "#FF8DA1" }}
                              data-testid="parent-email-error"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 mt-[2px] shrink-0" aria-hidden />
                              <span>{emailErrorText}</span>
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 mt-3">
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto min-h-[52px] px-5 text-[15px] font-bold rounded-2xl bg-transparent text-white border border-white/25 hover:bg-white/[0.06]"
                              onClick={() => consentMutation.mutate()}
                              disabled={!parentEmailReady || consentMutation.isPending}
                              data-testid="button-send-consent"
                            >
                              {consentMutation.isPending
                                ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                : <Sparkles className="w-4 h-4 mr-2" />}
                              {requested ? t.sendAgainBtn : t.sendConsentEmailBtn}
                            </Button>
                            {requested && (
                              <Button
                                variant="ghost"
                                className="w-full sm:w-auto min-h-[52px] px-4 text-[14px] font-bold rounded-2xl text-white hover:bg-white/[0.06]"
                                onClick={() => setEditingParentEmail(false)}
                                data-testid="button-cancel-change-email"
                              >
                                {T[language].backBtn}
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ── Outcome ─────────────────────────────────────── */}
                      {requested && !editingParentEmail && (
                        <div className="mt-4 space-y-3" data-testid="consent-outcome">
                          <div
                            className="rounded-2xl p-4"
                            style={{ background: "rgba(0,0,0,.28)", border: `1px solid ${accent}66` }}
                            data-testid={manual ? "consent-manual-share" : "consent-sent-confirmation"}
                          >
                            <div className="flex items-start gap-2.5">
                              {manual
                                ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accent }} aria-hidden />
                                : <MailCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: accent }} aria-hidden />}
                              <div className="min-w-0">
                                <p className="font-extrabold text-white text-[15px] leading-tight">
                                  {consentDelivery === "sent" ? t.consentSentTitle
                                    : consentDelivery === "failed" ? t.consentFailedTitle
                                    : t.consentNotConfiguredTitle}
                                </p>
                                <p className="text-white text-[13px] leading-relaxed mt-1">
                                  {(consentDelivery === "sent" ? t.consentSentBody
                                    : consentDelivery === "failed" ? t.consentFailedBody
                                    : t.consentNotConfiguredBody
                                  ).replace("{email}", sentTo)}
                                </p>
                              </div>
                            </div>

                            {/* On the happy path the link is a fallback, so it
                                hides behind a disclosure. On the manual paths
                                it is the whole point and is already open. */}
                            {!manual && !showConsentLink && (
                              <Button
                                variant="ghost"
                                className="mt-2 min-h-[44px] px-3 text-[13px] font-bold rounded-xl text-white hover:bg-white/[0.06]"
                                onClick={() => setShowConsentLink(true)}
                                data-testid="button-reveal-consent-link"
                              >
                                <Link2 className="w-4 h-4 mr-2" aria-hidden />
                                {t.consentDidntArriveBtn}
                              </Button>
                            )}

                            {(manual || showConsentLink) && (
                              <div
                                className="mt-3 rounded-xl p-3.5"
                                style={{ background: "rgba(0,0,0,.45)", border: `1px solid ${accent}55` }}
                                data-testid="consent-link-block"
                              >
                                <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
                                  {t.consentLinkLabel}
                                </p>
                                <p
                                  className="text-[12px] break-all text-white select-all mt-1.5 leading-relaxed"
                                  data-testid="consent-link-url"
                                >
                                  {consentLink}
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="mt-2.5 w-full sm:w-auto min-h-[48px] px-5 text-[14px] font-bold rounded-xl bg-transparent border"
                                  style={{ color: linkCopied ? BRAND.mint : "#ffffff", borderColor: linkCopied ? BRAND.mint : "rgba(255,255,255,.25)" }}
                                  onClick={handleCopyConsentLink}
                                  data-testid="button-copy-consent-link"
                                >
                                  {linkCopied
                                    ? <Check className="w-4 h-4 mr-2" aria-hidden />
                                    : <Copy className="w-4 h-4 mr-2" aria-hidden />}
                                  {linkCopied ? t.copiedBtn : t.copyLinkBtn}
                                </Button>
                                {copyFailed && (
                                  <p
                                    role="status"
                                    className="text-[12px] font-semibold mt-2"
                                    style={{ color: BRAND.yellow }}
                                    data-testid="consent-copy-failed"
                                  >
                                    {t.copyFailedHint}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* The simulated gate result is delivery:"sent", so
                                without this the preview panel would claim an
                                email went out — the one thing preview mode
                                promises never happens. */}
                            {inPreview && (
                              <p
                                className="text-[12px] font-bold mt-2"
                                style={{ color: PREVIEW_AMBER }}
                                data-testid="consent-preview-note"
                              >
                                {isAf
                                  ? "Voorskou — geen e-pos is gestuur nie en die skakel hierbo is voorbeelddata."
                                  : "Preview — no email was sent, and the link above is sample data."}
                              </p>
                            )}

                            <Button
                              variant="ghost"
                              className="mt-2 min-h-[44px] px-3 text-[13px] font-bold rounded-xl text-white hover:bg-white/[0.06]"
                              onClick={() => { setEditingParentEmail(true); setLinkCopied(false); setCopyFailed(false); }}
                              data-testid="button-change-parent-email"
                            >
                              {t.changeEmailBtn}
                            </Button>
                          </div>

                          {/* What the learner does while the parent decides. */}
                          <div
                            className="rounded-2xl p-4"
                            style={{ background: `${BRAND.cyan}12`, border: `1px solid ${BRAND.cyan}44` }}
                            data-testid="consent-waiting-panel"
                          >
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] flex items-center gap-1.5" style={{ color: BRAND.cyan }}>
                              <Clock className="w-3.5 h-3.5" aria-hidden />
                              {t.consentWaitingTitle}
                            </p>
                            <p className="text-white text-[13px] leading-relaxed mt-1.5">{t.consentWaitingBody}</p>
                          </div>
                        </div>
                      )}

                      {/* Requirement reminder — only ever a blocker for minors. */}
                      {isMinor && !requested && (
                        <p className="text-[12px] font-semibold mt-3" style={{ color: BRAND.yellow }} data-testid="consent-required-hint">
                          {t.consentRequiredHint}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Hand-off: what actually happens next. */}
                <div className="rounded-2xl p-4 sm:p-5" style={{ background: `${BRAND.mint}12`, border: `1px solid ${BRAND.mint}44` }}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">🚀 {t.whatsNextTitle}</p>
                  <p className="text-white text-[14px] leading-relaxed mt-1.5">
                    {isMinor ? t.whatsNextMinor : t.whatsNextAdult}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className={ghostBtn} onClick={handleBack} data-testid="button-back-parent-consent">
                    <ArrowLeft className="w-5 h-5 mr-1.5" />
                    {T[language].backBtn}
                  </Button>
                  <Button
                    className="h-16 px-6 text-lg font-extrabold rounded-2xl text-[#0D0D14] flex-1 disabled:opacity-40"
                    style={{
                      background: `linear-gradient(95deg, ${BRAND.pink}, ${BRAND.yellow}, ${BRAND.mint}, ${BRAND.cyan})`,
                    }}
                    onClick={handleNext}
                    disabled={submitMutation.isPending}
                    data-testid="button-complete"
                  >
                    {submitMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                    {t.letsGetIt}
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* ── PREVIEW-ONLY: Done — stands in for the real post-submit
              redirect to /subscribe (adults) or /waiting-for-parent (minors).
              Nothing was saved; restart the walkthrough or return to the
              admin console. Dashed amber, no glow — hazard language. ── */}
          {inPreview && previewDone && (
            <section
              data-testid="card-preview-done"
              className="rounded-3xl overflow-hidden"
              style={{
                background: BRAND.card,
                border: `2px dashed ${PREVIEW_AMBER}`,
                animation: anim("bt-fadeup .45s cubic-bezier(.22,1,.36,1) both"),
              }}
            >
              <div className="p-5 sm:p-8 space-y-6 text-center">
                <p style={{ fontFamily: MARKER, color: BRAND.yellow, fontSize: 20, transform: "rotate(-2deg)", margin: 0 }}>
                  {isAf ? "Voorskou klaar!" : "Preview complete!"}
                </p>
                <h2 className="text-white font-extrabold leading-[1.12] text-[28px] sm:text-[36px] tracking-tight">
                  {isAf ? "Dis die volle aanboordreis" : "That's the full onboarding journey"}
                </h2>
                <p className="text-white text-[15px] leading-relaxed max-w-md mx-auto">
                  {isAf
                    ? "Op hierdie punt word 'n regte leerder se profiel gestoor, hul vakke gelaai, en word hulle na die betaalmuur (volwassenes) of die ouer-wagbladsy (minderjariges) gestuur. In voorskou is niks gestoor nie."
                    : "At this point a real learner's profile is saved, their subjects are seeded, and they're redirected to the paywall (adults) or the waiting-for-parent page (minors). In preview, nothing was saved."}
                </p>
                <div className="rounded-2xl px-4 py-3 inline-block" style={{ border: `1.5px dashed ${PREVIEW_AMBER}` }}>
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: PREVIEW_AMBER }}>
                    {isAf ? "Geen data is geskryf nie" : "No data was written"}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
                  <Button
                    variant="outline"
                    className={ghostBtn}
                    onClick={resetPreviewState}
                    data-testid="button-preview-restart"
                  >
                    <RotateCcw className="w-5 h-5 mr-1.5" />
                    {isAf ? "Herbegin voorskou" : "Restart preview"}
                  </Button>
                  <Button
                    className={primaryBtn}
                    style={primaryBtnStyle}
                    onClick={() => { window.location.href = "/learn/admin"; }}
                    data-testid="button-preview-back-admin"
                  >
                    {isAf ? "Terug na admin" : "Back to admin"}
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* Step-completion micro-celebration — Rizz brand line + confetti.
              NOTE: the global animation kill-switch in index.css exempts only
              elements whose INLINE style contains "bt-" — keep these inline. */}
          {cheer && (
            <div className="fixed inset-x-0 top-28 z-50 flex justify-center pointer-events-none px-4" data-testid="onboarding-cheer">
              <div
                className="text-center max-w-[92vw]"
                style={{
                  fontFamily: MARKER,
                  fontSize: 26,
                  color: BRAND.yellow,
                  animation: anim("bt-pop .5s cubic-bezier(.22,1,.36,1) both"),
                }}
              >
                {cheer}
              </div>
              {!reduced && CONFETTI_COLORS.map((c, i) => (
                <span
                  key={i}
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: -6,
                    left: `${30 + i * 9}%`,
                    width: 9,
                    height: 9,
                    borderRadius: i % 2 ? 999 : 2,
                    background: c,
                    animation: `bt-confetti ${0.9 + i * 0.14}s ease-in ${i * 0.06}s both`,
                  }}
                />
              ))}
            </div>
          )}

          {submitMutation.isPending && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(13,13,20,.86)" }} data-testid="onboarding-loading-overlay">
              <div
                className="rounded-3xl p-7 text-center max-w-sm w-full"
                style={{ background: BRAND.card, border: `1px solid ${BRAND.cyan}55` }}
              >
                <Loader2 className="w-9 h-9 animate-spin mx-auto mb-4" style={{ color: BRAND.cyan }} />
                <h3 className="text-lg font-extrabold text-white mb-1">{t.preparingClassroomTitle}</h3>
                <p className="text-sm text-white">{t.preparingClassroomDesc}</p>
                <p className="mt-3" style={{ fontFamily: MARKER, color: BRAND.yellow, fontSize: 16 }}>{t.letsGetIt}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Keyframes for the "bt-" inline animations above (kill-switch safe). */}
      <style>{`
        @keyframes bt-pop {
          0% { opacity: 0; transform: rotate(-2deg) scale(.6) translateY(10px); }
          60% { opacity: 1; transform: rotate(-2deg) scale(1.08); }
          100% { opacity: 1; transform: rotate(-2deg) scale(1); }
        }
        @keyframes bt-confetti {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(130px) rotate(260deg); }
        }
        @keyframes bt-fadeup {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bt-checkpop {
          0% { transform: scale(.7); }
          55% { transform: scale(1.14); }
          100% { transform: scale(1); }
        }
        /* Hide the horizontal category-pill scrollbar without clipping taps. */
        [data-testid="card-subjects"] .overflow-x-auto::-webkit-scrollbar { height: 0; }
        /* prefers-reduced-motion: no motion, identical layout. */
        @media (prefers-reduced-motion: reduce) {
          [style*="bt-"] { animation: none !important; }
          [data-testid="card-onboarding"], [data-testid="card-vark"],
          [data-testid="card-subjects"], [data-testid="card-school"],
          [data-testid="card-parent-consent"] { opacity: 1 !important; transform: none !important; }
          [role="progressbar"] > div { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
