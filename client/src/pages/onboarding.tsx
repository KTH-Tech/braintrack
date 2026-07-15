import { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ONBOARDING_QUESTIONS, GRADE_12_SUBJECTS } from "@/lib/constants";
import { ArrowLeft, ArrowRight, Brain, Loader2, Globe, BookOpen, Check, Sparkles } from "lucide-react";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { type VarkStyle, VARK_STYLES } from "@/lib/vark";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";

interface SubjectMark {
  subjectCode: string;
  subjectName: string;
  mark: number;
}

type Answers = Record<string, string | string[] | number>;

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
  subjectMarks: SubjectMark[];
  selectedSubjects: string[];
  schoolName?: string;
  schoolId?: number | null;
  grade?: number | null;
  parentEmail?: string;
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
    const grade = typeof obj.grade === "number" ? obj.grade : null;
    const parentEmail = typeof obj.parentEmail === "string" ? obj.parentEmail : undefined;

    return {
      currentStep,
      phase,
      language,
      answers,
      varkPrimary,
      varkSecondary,
      subjectMarks,
      selectedSubjects,
      schoolName,
      schoolId,
      grade,
      parentEmail,
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
    consentSent: "Consent link sent!",
    consentSentDesc: "We emailed your parent. Ask them to approve your account.",
    consentNotConfigured: "Email not configured",
    consentNotConfiguredDesc: "Ask your parent to visit braintrack.co.za/parent to register.",
    consentFailed: "Could not send link",
    consentFailedDesc: "Please ask your parent to register directly at braintrack.co.za/parent.",
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
    selectSubjectsHint: "Select 4+ subjects and enter your latest marks (%)",
    schoolGradeHeading: "Your School & Grade",
    schoolSearchHint: "Search for your school below. If we don't have it yet, just type the name and we'll add it as pending.",
    schoolNameLabel: "School name",
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
    consentSent: "Toestemmingsskakel gestuur!",
    consentSentDesc: "Ons het jou ouer ge-epos. Vra hulle om jou rekening goed te keur.",
    consentNotConfigured: "E-pos nie opgestel nie",
    consentNotConfiguredDesc: "Vra jou ouer om by braintrack.co.za/parent te registreer.",
    consentFailed: "Kon nie skakel stuur nie",
    consentFailedDesc: "Vra jou ouer asseblief om direk by braintrack.co.za/parent te registreer.",
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
    selectSubjectsHint: "Kies 4+ vakke en voer jou nuutste punte (%) in",
    schoolGradeHeading: "Jou Skool & Graad",
    schoolSearchHint: "Soek jou skool hieronder. As ons dit nog nie het nie, tik die naam en ons sal dit as hangend byvoeg.",
    schoolNameLabel: "Skoolnaam",
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
  },
} as const;

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const persisted = useRef<PersistedState | null>(loadPersistedState()).current;
  const [hydrated, setHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(persisted?.currentStep ?? 0);
  const [phase, setPhase] = useState<Phase>(persisted?.phase ?? "questions");
  // Task #43 — School linking + parent contact captured during onboarding.
  const [schoolName, setSchoolName] = useState<string>(persisted?.schoolName ?? "");
  const [schoolId, setSchoolId] = useState<number | null>(persisted?.schoolId ?? null);
  const [grade, setGrade] = useState<number | null>(persisted?.grade ?? 12);
  const [schoolQuery, setSchoolQuery] = useState<string>(persisted?.schoolName ?? "");
  const [schoolResults, setSchoolResults] = useState<Array<{ id: number; name: string; province: string | null }>>([]);
  const [schoolSearching, setSchoolSearching] = useState(false);
  const [parentEmail, setParentEmail] = useState<string>(persisted?.parentEmail ?? "");
  const [consentLink, setConsentLink] = useState<string | null>(null);
  const [consentDelivery, setConsentDelivery] = useState<"sent" | "not_configured" | "failed" | null>(null);
  const { language, setLanguage } = useLanguage();
  const isAf = language === "af";
  const t = T[language];
  const { isAuthenticated } = useAuth();
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
  const [subjectMarks, setSubjectMarks] = useState<SubjectMark[]>(persisted?.subjectMarks ?? []);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(
    new Set(persisted?.selectedSubjects ?? [])
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      const state: PersistedState = {
        currentStep,
        phase,
        language,
        answers,
        varkPrimary,
        varkSecondary,
        subjectMarks,
        selectedSubjects: Array.from(selectedSubjects),
        schoolName,
        schoolId,
        grade,
        parentEmail,
      };
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors (quota, private mode)
    }
  }, [hydrated, currentStep, phase, language, answers, varkPrimary, varkSecondary, subjectMarks, selectedSubjects, schoolName, schoolId, grade, parentEmail]);

  // Task #43 — Debounced school name search against partnerSchools.
  useEffect(() => {
    if (phase !== "school") return;
    const q = schoolQuery.trim();
    if (q.length < 2) { setSchoolResults([]); return; }
    setSchoolSearching(true);
    const t = setTimeout(async () => {
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
    return () => clearTimeout(t);
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

  const submitMutation = useMutation({
    mutationFn: async () => {
      const traits = calculateTraits(answers);
      const recommendations = calculateRecommendations(answers, traits);
      return apiRequest("POST", "/api/onboarding", {
        learningStyle: varkPrimary || answers.learning_style || "mixed",
        studyPreference: answers.study_time || "evening",
        focusDuration: answers.focus_duration || 45,
        challenges: [],
        goals: answers.goals || [],
        preferredLanguage: language === "af" ? "afrikaans" : "english",
        rawAnswersJson: { ...answers, subjectMarks, varkPrimary, varkSecondary, schoolName, schoolId, grade },
        traitsJson: traits,
        recommendationsJson: recommendations,
        varkPrimary: varkPrimary || "kinesthetic",
        varkSecondary: varkSecondary || null,
        // Task #43 — extra profile fields
        ...(schoolName.trim() ? { schoolName: schoolName.trim() } : {}),
        ...(schoolId ? { schoolId } : {}),
        ...(grade ? { grade } : {}),
        ...(parentEmail.trim() ? { parentEmail: parentEmail.trim() } : {}),
      });
    },
    onSuccess: () => {
      try { window.localStorage.removeItem(ONBOARDING_STORAGE_KEY); } catch { /* ignore */ }
      queryClient.invalidateQueries({ queryKey: ["/api/user/onboarding"] });
      const tStr = T[language];
      toast({
        title: tStr.profileCreated,
        description: tStr.profileCreatedDesc,
      });
      setLocation("/subscribe");
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
    mutationFn: () => apiRequest("POST", "/api/auth/reset-role"),
    onSuccess: () => {
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

  const handleSingleSelect = (value: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

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

  const canProceed = () => {
    if (phase === "subjects") {
      return subjectMarks.length >= 4;
    }
    if (phase === "vark") {
      return varkPrimary !== null;
    }
    if (phase === "school") {
      return schoolName.trim().length >= 2 && grade !== null;
    }
    if (phase === "parent_consent") {
      // POPIA compliance — learner must at minimum send a consent request before
      // continuing. consentLink is set once the mutation succeeds (email sent or
      // manual-share link generated), so this acts as a soft gate: send → proceed.
      return consentLink !== null;
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
    if (phase === "questions") {
      if (currentStep < ONBOARDING_QUESTIONS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        setPhase("vark");
      }
    } else if (phase === "vark") {
      setPhase("subjects");
    } else if (phase === "subjects") {
      setPhase("school");
    } else if (phase === "school") {
      setPhase("parent_consent");
    } else {
      submitMutation.mutate();
    }
  };

  const handleBack = () => {
    if (phase === "parent_consent") {
      setPhase("school");
    } else if (phase === "school") {
      setPhase("subjects");
    } else if (phase === "subjects") {
      setPhase("vark");
    } else if (phase === "vark") {
      setPhase("questions");
    } else if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Task #43 — Send the parent consent email (best-effort). The endpoint
  // always returns the link so we can offer a manual-share fallback if email
  // delivery isn't configured in this environment.
  const consentMutation = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/onboarding/parent-consent/request", {
        parentEmail: parentEmail.trim(),
        language: language === "af" ? "af" : "en",
      });
      return r as unknown as { ok: boolean; url: string; delivery: "sent" | "not_configured" | "failed" };
    },
    onSuccess: (data) => {
      setConsentLink(data.url);
      setConsentDelivery(data.delivery);
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border py-4 bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {phase === "questions" && (
              <button
                onClick={() => resetRoleMutation.mutate()}
                disabled={resetRoleMutation.isPending}
                className="inline-flex items-center gap-1 text-xs text-white hover:text-white transition-colors ml-2 disabled:opacity-50 min-h-[44px] px-2 rounded"
                data-testid="button-change-role"
              >
                <ArrowLeft className="w-3 h-3" />
                {T[language].changeRole}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-full p-1 border border-border">
            <Button
              variant={language === "en" ? "default" : "ghost"}
              size="sm"
              className={`rounded-full px-4 font-semibold ${language === "en" ? "bg-foreground text-background shadow-md" : "text-white"}`}
              onClick={() => setLanguage("en")}
              data-testid="button-lang-en"
            >
              <Globe className="w-4 h-4 mr-1" />
              EN
            </Button>
            <Button
              variant={language === "af" ? "default" : "ghost"}
              size="sm"
              className={`rounded-full px-4 font-semibold ${language === "af" ? "bg-foreground text-background shadow-md" : "text-white"}`}
              onClick={() => setLanguage("af")}
              data-testid="button-lang-af"
            >
              AF
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-card shadow-xl border border-border mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              {phase === "questions" ? <Brain className="w-10 h-10 text-primary" /> : <BookOpen className="w-10 h-10 text-primary" />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight" data-testid="onboarding-heading">
              {phase === "questions"
                ? t.pageTitle
                : phase === "vark"
                ? t.varkHeading
                : phase === "subjects"
                ? t.selectSubjectsHeading
                : phase === "school"
                ? t.schoolGradeHeading
                : t.parentConsentHeading}
            </h1>
            <p className="text-white font-medium text-lg">
              {phase === "questions"
                ? t.questionsSubtitle
                : phase === "vark"
                ? t.varkSubtitle
                : t.subjectsSubtitle}
            </p>
            {phase === "questions" && (
              <div className="inline-block px-4 py-1.5 rounded-full bg-foreground text-background text-xs font-semibold uppercase tracking-widest mt-4 shadow-md">
                {isAf ? categoryLabels[category].af : categoryLabels[category].en}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-white uppercase tracking-widest px-1">
              <span>{Math.round(progress)}% {t.completeLabel}</span>
              <span>{t.progressBarLabel}</span>
            </div>
            <Progress value={progress} className="h-3 bg-muted" />
          </div>

          {phase === "questions" && currentQuestion && (
            <Card className="border bg-black shadow-[0_0_30px_rgba(0,229,255,0.25)] rounded-3xl overflow-hidden" data-testid="card-onboarding">
              <div aria-hidden className="h-[3px]" style={{ background: "linear-gradient(90deg, #FF8A00, #FF8A00, #FFE600, #FFE600, #00E5FF, #006BFF, #8A2BFF, #8A2BFF, #FF2BD6)" }} />
              <CardHeader className="pb-2 pt-8 px-8">
                <CardTitle className="text-sm font-semibold text-white uppercase tracking-widest flex items-center justify-between">
                  <span>
                    {t.questionLabel} {currentStep + 1} {t.ofLabel} {ONBOARDING_QUESTIONS.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <h2 className="text-lg sm:text-xl font-semibold text-white leading-tight">{questionText}</h2>

                {currentQuestion.type === "single" && currentQuestion.options && (
                  <RadioGroup
                    value={(answers[currentQuestion.id] as string) || ""}
                    onValueChange={handleSingleSelect}
                    className="grid grid-cols-1 gap-3"
                  >
                    {currentQuestion.options.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 p-5 rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] ${
                          answers[currentQuestion.id] === option.value ? "border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_18px_rgba(0,229,255,0.4)]" : "border-white/15 bg-black hover:border-[#00E5FF]/60 hover:bg-white/[0.03]"
                        }`}
                        onClick={() => handleSingleSelect(option.value)}
                        data-testid={`option-${option.value}`}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer text-lg font-semibold text-white">
                          {language === "en" ? option.labelEn : option.labelAf}
                        </Label>
                        {answers[currentQuestion.id] === option.value && <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white"><Check className="w-4 h-4" /></div>}
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === "multiple" && currentQuestion.options && (
                  <div className="grid grid-cols-1 gap-3">
                    <p className="text-xs font-semibold text-white uppercase tracking-widest mb-2">
                      {t.selectAllThatApply}
                    </p>
                    {currentQuestion.options.map((option) => {
                      const isChecked = ((answers[currentQuestion.id] as string[]) || []).includes(option.value);
                      return (
                        <div
                          key={option.value}
                          className={`flex items-center space-x-3 p-5 rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] ${
                            isChecked ? "border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_18px_rgba(0,229,255,0.4)]" : "border-white/15 bg-black hover:border-[#00E5FF]/60 hover:bg-white/[0.03]"
                          }`}
                          onClick={() => handleMultiSelect(option.value, !isChecked)}
                          data-testid={`option-${option.value}`}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => handleMultiSelect(option.value, !!checked)}
                            id={option.value}
                            className="sr-only"
                          />
                          <Label htmlFor={option.value} className="flex-1 cursor-pointer text-lg font-semibold text-white">
                            {language === "en" ? option.labelEn : option.labelAf}
                          </Label>
                          {isChecked && <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white"><Check className="w-4 h-4" /></div>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === "slider" && (
                  <div className="space-y-10 py-8">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full border-8 border-border flex items-center justify-center">
                          <span className="text-4xl font-semibold text-white">
                            {(answers[currentQuestion.id] as number) || currentQuestion.min}
                          </span>
                        </div>
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
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
                    <div className="flex justify-between text-xs font-semibold text-white uppercase tracking-widest px-1">
                      <span>{currentQuestion.min} min</span>
                      <span>{currentQuestion.max} min</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-8 gap-4">
                  <Button
                    variant="outline"
                    className="h-14 px-8 text-lg font-semibold border-2 border-border hover:bg-muted rounded-2xl flex-1 md:flex-none"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {t.backBtn}
                  </Button>
                  <Button
                    className="h-14 px-10 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-xl flex-1 md:flex-none"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    data-testid="button-next"
                  >
                    {t.nextBtn}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {phase === "vark" && (
            <Card className="border bg-black shadow-[0_0_30px_rgba(0,229,255,0.25)] rounded-3xl overflow-hidden" data-testid="card-vark">
              <div aria-hidden className="h-[3px]" style={{ background: "linear-gradient(90deg, #FF8A00, #FF8A00, #FFE600, #FFE600, #00E5FF, #006BFF, #8A2BFF, #8A2BFF, #FF2BD6)" }} />
              <CardHeader className="pb-2 pt-8 px-8">
                <CardTitle className="text-sm font-semibold text-white uppercase tracking-widest">
                  {t.primaryStyleLabel}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(VARK_STYLES) as [VarkStyle, typeof VARK_STYLES[VarkStyle]][]).map(([key, style]) => {
                    const isPrimary = varkPrimary === key;
                    const isSecondary = varkSecondary === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          if (isPrimary) {
                            setVarkPrimary(null);
                          } else {
                            setVarkPrimary(key);
                            if (varkSecondary === key) setVarkSecondary(null);
                          }
                        }}
                        data-testid={`vark-primary-${key}`}
                        className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] ${
                          isPrimary
                            ? "border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_22px_rgba(0,229,255,0.5)]"
                            : "border-white/15 bg-black hover:border-[#00E5FF]/60 hover:bg-white/[0.03]"
                        }`}
                      >
                        {isPrimary && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                        <span className="text-3xl block mb-2">{style.icon}</span>
                        <p className="font-bold text-white text-sm">{language === "en" ? style.label : style.labelAf}</p>
                        <p className="text-white text-xs mt-0.5">{language === "en" ? style.tagline : style.taglineAf}</p>
                      </button>
                    );
                  })}
                </div>

                {varkPrimary && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-white uppercase tracking-widest">
                      {t.secondaryStyleLabel}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.entries(VARK_STYLES) as [VarkStyle, typeof VARK_STYLES[VarkStyle]][])
                        .filter(([key]) => key !== varkPrimary)
                        .map(([key, style]) => {
                          const isSelected = varkSecondary === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setVarkSecondary(isSelected ? null : key)}
                              data-testid={`vark-secondary-${key}`}
                              className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                                isSelected
                                  ? "border-[#00E5FF] bg-[#00E5FF]/10"
                                  : "border-white/15 bg-black hover:border-[#00E5FF]/60"
                              }`}
                            >
                              <span className="text-2xl block">{style.icon}</span>
                              <p className="text-xs font-semibold text-white mt-1">{language === "en" ? style.label : style.labelAf}</p>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-14 px-8 text-lg font-semibold border-2 border-border hover:bg-muted rounded-2xl flex-1 md:flex-none"
                    onClick={handleBack}
                    data-testid="button-back-vark"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {t.backBtn}
                  </Button>
                  <Button
                    className="h-14 px-10 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-xl flex-1 md:flex-none"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    data-testid="button-next-vark"
                  >
                    {t.nextBtn}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {phase === "subjects" && (
            <Card className="border bg-black shadow-[0_0_30px_rgba(0,229,255,0.25)] rounded-3xl overflow-hidden" data-testid="card-subjects">
              <div aria-hidden className="h-[3px]" style={{ background: "linear-gradient(90deg, #FF8A00, #FF8A00, #FFE600, #FFE600, #00E5FF, #006BFF, #8A2BFF, #8A2BFF, #FF2BD6)" }} />
              <CardHeader className="pb-2 pt-8 px-8">
                <CardTitle className="text-2xl font-semibold text-white">
                  {t.selectSubjectsHeading}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <p className="text-white font-medium">
                  {t.selectSubjectsHint}
                </p>
                {subjectMarks.length > 0 && subjectMarks.length < 4 && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-600 font-medium">
                    <span>
                      {(() => {
                        const n = 4 - subjectMarks.length;
                        return t.selectMoreMsg
                          .replace("{count}", String(n))
                          .replace("{plural}", n > 1 ? t.selectMorePlural : "");
                      })()}
                    </span>
                  </div>
                )}
                
                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {GRADE_12_SUBJECTS.map((subject) => {
                    const isSelected = selectedSubjects.has(subject.code);
                    const mark = subjectMarks.find(s => s.subjectCode === subject.code)?.mark || 50;
                    
                    return (
                      <div
                        key={subject.code}
                        className={`p-4 rounded-2xl border transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm ${isSelected ? "border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_18px_rgba(0,229,255,0.4)]" : "border-white/15 bg-black hover:border-[#00E5FF]/60 hover:bg-white/[0.03]"}`}
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSubject(subject.code, subject.name)}
                            id={subject.code}
                            className="w-6 h-6 border-2"
                            data-testid={`subject-${subject.code}`}
                          />
                          <Label htmlFor={subject.code} className="flex-1 cursor-pointer text-base font-semibold text-white">
                            {language === "en" ? subject.name : subject.nameAfrikaans}
                          </Label>
                          {isSelected && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={mark}
                                onChange={(e) => updateMark(subject.code, parseInt(e.target.value) || 0)}
                                className="w-20 h-10 text-center font-semibold text-lg border-2 border-primary/20 bg-card focus-visible:ring-primary"
                                data-testid={`mark-${subject.code}`}
                              />
                              <span className="text-lg font-semibold text-white">%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-8 gap-4">
                  <Button
                    variant="outline"
                    className="h-14 px-8 text-lg font-semibold border-2 border-border hover:bg-muted rounded-2xl flex-1 md:flex-none"
                    onClick={handleBack}
                    data-testid="button-back-subjects"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {t.backBtn}
                  </Button>
                  <Button
                    className="h-14 px-10 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-xl flex-1 md:flex-none"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    data-testid="button-subjects-next"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    {t.nextBtn}
                  </Button>
                </div>
                <p className="text-center text-xs text-white pt-2 leading-relaxed">
                  {t.termsAgree}{" "}
                  <Link href="/terms" className="underline hover:text-white transition-colors">{t.termsLink}</Link>
                  {" "}{t.termsAnd}{" "}
                  <Link href="/privacy" className="underline hover:text-white transition-colors">{t.privacyLink}</Link>.
                </p>
              </CardContent>
            </Card>
          )}

          {phase === "school" && (
            <Card className="border bg-black shadow-[0_0_30px_rgba(0,229,255,0.25)] rounded-3xl overflow-hidden" data-testid="card-school">
              <div aria-hidden className="h-[3px]" style={{ background: "linear-gradient(90deg, #FF8A00, #FF8A00, #FFE600, #FFE600, #00E5FF, #006BFF, #8A2BFF, #8A2BFF, #FF2BD6)" }} />
              <CardHeader className="pb-2 pt-8 px-8">
                <CardTitle className="text-2xl font-semibold text-white">
                  {t.schoolGradeHeading}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <p className="text-white font-medium">
                  {t.schoolSearchHint}
                </p>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t.schoolNameLabel}</Label>
                  <Input
                    value={schoolQuery}
                    onChange={(e) => {
                      setSchoolQuery(e.target.value);
                      setSchoolName(e.target.value);
                      setSchoolId(null);
                    }}
                    placeholder={t.schoolPlaceholder}
                    className="h-12 bg-background"
                    data-testid="input-school-name"
                  />
                  {schoolSearching && (
                    <p className="text-xs text-white">{t.schoolSearchingLabel}</p>
                  )}
                  {schoolResults.length > 0 && (
                    <div className="rounded-xl border border-border bg-card divide-y divide-border max-h-56 overflow-y-auto">
                      {schoolResults.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSchoolId(s.id);
                            setSchoolName(s.name);
                            setSchoolQuery(s.name);
                            setSchoolResults([]);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-muted ${schoolId === s.id ? "bg-primary/10" : ""}`}
                          data-testid={`school-result-${s.id}`}
                        >
                          <div className="font-semibold text-white">{s.name}</div>
                          {s.province && <div className="text-xs text-white">{s.province}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                  {schoolId && (
                    <p className="text-xs text-emerald-500" data-testid="text-school-linked">
                      {t.schoolLinkedLabel}
                    </p>
                  )}
                  {!schoolId && schoolName.trim().length >= 2 && (
                    <p className="text-xs text-white">
                      {t.schoolPendingLabel}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t.gradeLabel}</Label>
                  <div className="flex gap-2 flex-wrap">
                    {[10, 11, 12].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrade(g)}
                        className={`px-5 h-11 rounded-xl border-2 font-semibold ${grade === g ? "border-primary bg-primary/10 text-white" : "border-border text-white hover:border-primary/40"}`}
                        data-testid={`button-grade-${g}`}
                      >
                        {t.gradeLabel} {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4 gap-4">
                  <Button variant="outline" className="h-14 px-8 text-lg font-semibold border-2 border-border rounded-2xl flex-1 md:flex-none" onClick={handleBack} data-testid="button-back-school">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {T[language].backBtn}
                  </Button>
                  <Button
                    className="h-14 px-10 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-xl flex-1 md:flex-none"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    data-testid="button-next-school"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    {T[language].nextBtn}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {phase === "parent_consent" && (
            <Card className="border bg-black shadow-[0_0_30px_rgba(0,229,255,0.25)] rounded-3xl overflow-hidden" data-testid="card-parent-consent">
              <div aria-hidden className="h-[3px]" style={{ background: "linear-gradient(90deg, #FF8A00, #FF8A00, #FFE600, #FFE600, #00E5FF, #006BFF, #8A2BFF, #8A2BFF, #FF2BD6)" }} />
              <CardHeader className="pb-2 pt-8 px-8">
                <CardTitle className="text-2xl font-semibold text-white">
                  {t.parentConsentHeading}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <p className="text-white font-medium">
                  {t.parentConsentHint}
                </p>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">{t.parentEmailLabel}</Label>
                  <Input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder={t.parentEmailPlaceholder}
                    className="h-12 bg-background"
                    data-testid="input-parent-email"
                  />
                </div>

                <Button
                  variant="outline"
                  className="h-12 px-6 font-semibold rounded-xl"
                  onClick={() => consentMutation.mutate()}
                  disabled={!/.+@.+\..+/.test(parentEmail.trim()) || consentMutation.isPending}
                  data-testid="button-send-consent"
                >
                  {consentMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {consentLink ? t.resendBtn : t.sendConsentEmailBtn}
                </Button>

                {consentLink && (
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2" data-testid="consent-link-block">
                    <p className="text-xs font-semibold text-white uppercase tracking-wide">
                      {consentDelivery === "sent" ? t.emailSentLabel : t.manualShareLabel}
                    </p>
                    <p className="text-xs break-all text-white select-all" data-testid="consent-link-url">{consentLink}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => navigator.clipboard?.writeText(consentLink).catch(() => {})}
                      data-testid="button-copy-consent-link"
                    >
                      {t.copyLinkBtn}
                    </Button>
                  </div>
                )}

                {consentLink ? (
                  <p className="text-xs text-green-400/80">
                    {t.consentSkipHint}
                  </p>
                ) : (
                  <p className="text-xs text-amber-400/80">
                    {language === "af"
                      ? "Stuur eers die toestemmings-e-pos om voort te gaan."
                      : "Please send a consent request to your parent/guardian to continue."}
                  </p>
                )}

                <div className="flex justify-between pt-4 gap-4">
                  <Button variant="outline" className="h-14 px-8 text-lg font-semibold border-2 border-border rounded-2xl flex-1 md:flex-none" onClick={handleBack} data-testid="button-back-parent-consent">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    {T[language].backBtn}
                  </Button>
                  <Button
                    className="h-14 px-10 text-lg font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-2xl shadow-xl flex-1 md:flex-none"
                    onClick={handleNext}
                    disabled={submitMutation.isPending}
                    data-testid="button-complete"
                  >
                    {submitMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                    {T[language].submitBtn}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {submitMutation.isPending && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" data-testid="onboarding-loading-overlay">
              <div className="rounded-2xl border border-border bg-card p-8 text-center max-w-sm">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">
                  {t.preparingClassroomTitle}
                </h3>
                <p className="text-sm text-white">
                  {t.preparingClassroomDesc}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
