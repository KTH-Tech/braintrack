import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/language-context";
import { formatDate } from "@/lib/formatters";
import {
  Send,
  Loader2,
  Sparkles,
  User,
  MessageCircle,
  BookOpen,
  Eye,
  Ear,
  Hand,
  FileText,
  Layers,
  NotebookPen,
  ThumbsUp,
  ThumbsDown,
  Network,
  AlertCircle,
  RotateCcw
} from "lucide-react";
import type { Subject, OnboardingResult, Topic } from "@shared/schema";
import { TopicMindmap } from "@/components/topic-mindmap";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { RizzFace, RizzWordmark, RizzBrandStyles, rizzMascot, RIZZ_USER_GRADIENT, RIZZ_RAINBOW, RIZZ_LINES, type RizzExpression } from "@/components/rizz-brand";
import type { CSSProperties } from "react";

/** Rotated speech-bubble callout beside the hero mascot (mirrors journey.tsx). */
const tutorSticker = (color: string, rotate: number, pos: CSSProperties): CSSProperties => ({
  position: "absolute",
  ...pos,
  zIndex: 3,
  transform: `rotate(${rotate}deg)`,
  fontFamily: "'Permanent Marker',cursive",
  fontSize: 16,
  lineHeight: 1.2,
  color,
  background: "rgba(5,5,8,.88)",
  border: `1.5px solid ${color}`,
  borderRadius: 14,
  padding: "6px 11px",
  whiteSpace: "nowrap",
});
import brandLogo from "@assets/Logo_01_1779989960628.jpeg";
import { LearnerHeader } from "@/components/learner-header";

const TUTOR_AVATARS: Record<string, { icon: any }> = {
  visual: { icon: Eye },
  auditory: { icon: Ear },
  kinesthetic: { icon: Hand },
  reading: { icon: FileText },
  mixed: { icon: Layers },
};

// Subtle hand-placed tilts for "sticker" chips — small so paragraph-length
// suggestions stay readable; hover straightens them back out (see .tutor-sticker).
const STICKER_TILTS = [-1.5, 1, -1, 1.5, -1, 1.5];

interface DiagramEntry {
  label: string;
  ascii: string;
  caption: string;
}

interface CitedExample {
  exampleIndex: number;
  stepIndex: number | null;
  title: string | null;
  problem: string | null;
  stepText: string | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  diagrams?: DiagramEntry[];
  citedExamples?: CitedExample[];
  studyNotesUrl?: string | null;
  topicName?: string | null;
}

const T = {
  en: {
    homeLabel: "Home",
    // Sticker callouts around the hero mascot — same graffiti language as the
    // journey page's stickers.
    sticker1: "Ask me anything!",
    sticker2: "No dumb questions ⚡",
    sticker3: "I explain till it clicks 🧠",
    chatTab: "Chat",
    notesTab: "Study Notes",
    pageTitle: "Smart Tutor",
    pageSubtitle: "AI-powered help with past paper questions, memos and explanations.",
    subjectPlaceholder: "Select subject...",
    generateNotes: "Generate Notes",
    generatingNotes: "Generating...",
    topicPlaceholder: "Enter topic name...",
    notesLanguageLabel: "Notes language",
    mindMapLabel: "Mind Map",
    notesLabel: "Notes",
    sendPlaceholder: "Ask a question about your work...",
    sendBtn: "Send",
    feedbackLabel: "Was this helpful?",
    limitReached: "Daily limit reached",
    limitReachedDesc: "You've used all your tutor interactions for today. Come back tomorrow!",
    sessionError: "Session Error",
    sessionErrorDesc: "Could not start tutor session. Please try again.",
    notesError: "Notes Error",
    notesErrorDesc: "Could not generate notes. Please try again.",
    feedbackSent: "Feedback sent",
    feedbackSentDesc: "Thank you for your feedback!",
    oops: "Oops!",
    shortTitle: "Too short!",
    shortDesc: "Type a longer topic",
    shortQuestionDesc: "Type a longer question",
    helpfulLabel: "Helpful",
    notHelpfulLabel: "Not helpful",
    tutorHeading: "Your AI Tutor",
    askMeAnything: "Ask me anything!",
    topicsHeading: "CAPS Gr.12 Topics — Pick one:",
    trySuggestions: "Or try these:",
    selectSubjectPlaceholder: "Select a subject (optional)",
    capsTopicsLabel: "CAPS Gr.12 Topics:",
    topicNotesPlaceholder: "Enter a topic e.g. 'Photosynthesis', 'Differentiation', 'Balance sheets'",
    couldNotGenerateNotes: "Couldn't generate notes",
    retryBtn: "Retry",
    studyNotesHeading: "Your Study Notes",
    printBtn: "Print",
    generalLabel: "General",
    selectSubjectFirst: "Select a subject to see the mindmap",
    highExamWeighting: "High exam weighting",
    notesGeneratedTitle: "Notes generated!",
    notesGeneratedDesc: "Your study notes are ready",
    thankYouTitle: "Thank you!",
    thankYouDesc: "Your feedback helps us improve.",
    generateStudyNotesHeading: "Generate Study Notes",
    notesViewLabel: "Notes",
    mindmapViewLabel: "Mindmap",
    selectSubjectMindmapPlaceholder: "Select a subject",
    generatingNotesLabel: "Generating notes...",
    generateNotesBtn: "Generate Notes",
    sendingLabel: "Sending...",
    sendLabel: "Send",
    skipLabel: "Skip",
    feedbackPlaceholder: "Tell us more (optional)...",
    couldNotGetResponse: "Couldn't get a response. Try again!",
    thinkingLabel: "Thinking...",
    selectSubjectBottomPlaceholder: "Select subject (optional)",
    chatPlaceholder: "Type your question here...",
    subjectFallback: "Subject",
    introParagraph: "I'll help you with any Grade 12 CAPS question. Type your question below!",
    footerDisclaimer: "Rizz is CAPS-aligned and helps with Grade 12 questions",
    suggestedQ1: "How does differentiation work in Maths?",
    suggestedQ2: "Explain photosynthesis for Life Sciences",
    suggestedQ3: "What caused the Great Depression?",
    suggestedQ4: "How do I balance chemical equations?",
    focusTimePrefix: "Focus:",
    prefersStudyingIn: "Prefers studying in the",
    varkVisual: "Visual Learner",
    varkAuditory: "Auditory Learner",
    varkKinesthetic: "Kinesthetic Learner",
    varkReading: "Reading/Writing Learner",
    varkMixed: "Mixed Learner",
    printStudyNotes: "Grade 12 Study Notes",
    printCaps: "NSC CAPS",
    printConfidential: "Confidential",
    printPersonalUse: "Generated for personal use only",
  },
  af: {
    homeLabel: "Tuis",
    sticker1: "Vra my enigiets!",
    sticker2: "Geen dom vrae ⚡",
    sticker3: "Ek verduidelik tot dit klik 🧠",
    chatTab: "Gesels",
    notesTab: "Studienotas",
    pageTitle: "Slimmer Tutor",
    pageSubtitle: "KI-hulp met vorige vraestelvrae, memos en verduidelikings.",
    subjectPlaceholder: "Kies vak...",
    generateNotes: "Genereer Notas",
    generatingNotes: "Besig...",
    topicPlaceholder: "Voer onderwerpnaam in...",
    notesLanguageLabel: "Notataal",
    mindMapLabel: "Gedagtekaart",
    notesLabel: "Notas",
    sendPlaceholder: "Vra 'n vraag oor jou werk...",
    sendBtn: "Stuur",
    feedbackLabel: "Was dit nuttig?",
    limitReached: "Daaglikse limiet bereik",
    limitReachedDesc: "Jy het al jou tutorinteraksies vir vandag gebruik. Kom môre terug!",
    sessionError: "Sessie Fout",
    sessionErrorDesc: "Kon nie tutorsessie begin nie. Probeer asseblief weer.",
    notesError: "Notas Fout",
    notesErrorDesc: "Kon nie notas genereer nie. Probeer asseblief weer.",
    feedbackSent: "Terugvoer gestuur",
    feedbackSentDesc: "Dankie vir jou terugvoer!",
    oops: "Oeps!",
    shortTitle: "Te kort!",
    shortDesc: "Tik 'n langer onderwerp",
    shortQuestionDesc: "Tik 'n langer vraag",
    helpfulLabel: "Nuttig",
    notHelpfulLabel: "Nie nuttig nie",
    tutorHeading: "Jou KI-tutor",
    askMeAnything: "Vra my enigiets!",
    topicsHeading: "KABV Gr.12 Onderwerpe — Kies een:",
    trySuggestions: "Probeer een van hierdie:",
    selectSubjectPlaceholder: "Kies 'n vak (opsioneel)",
    capsTopicsLabel: "KABV Gr.12 Onderwerpe:",
    topicNotesPlaceholder: "Tik 'n onderwerp bv. 'Fotosintese', 'Differensiasie', 'Balansstate'",
    couldNotGenerateNotes: "Kon nie notas genereer nie",
    retryBtn: "Probeer Weer",
    studyNotesHeading: "Jou Studienotas",
    printBtn: "Druk",
    generalLabel: "Algemeen",
    selectSubjectFirst: "Kies 'n vak om die gedagtekaart te sien",
    highExamWeighting: "Hoë gewig in eksamen",
    notesGeneratedTitle: "Notas gegenereer!",
    notesGeneratedDesc: "Jou studienotas is gereed",
    thankYouTitle: "Dankie!",
    thankYouDesc: "Jou terugvoer help ons elke keer beter word.",
    generateStudyNotesHeading: "Genereer Studienotas",
    notesViewLabel: "Notas",
    mindmapViewLabel: "Gedagtekaart",
    selectSubjectMindmapPlaceholder: "Kies 'n vak",
    generatingNotesLabel: "Genereer notas...",
    generateNotesBtn: "Genereer Notas",
    sendingLabel: "Stuur...",
    sendLabel: "Stuur",
    skipLabel: "Slaan oor",
    feedbackPlaceholder: "Vertel ons meer (opsioneel)...",
    couldNotGetResponse: "Kon nie 'n antwoord kry nie. Probeer weer!",
    thinkingLabel: "Besig om te dink...",
    selectSubjectBottomPlaceholder: "Kies vak (opsioneel)",
    chatPlaceholder: "Tik jou vraag hier...",
    subjectFallback: "Vak",
    introParagraph: "Ek help jou met enige Gr. 12 KABV vraag — tik jou vraag hieronder!",
    footerDisclaimer: "Rizz is KABV-gerig en help met Graad 12 vrae",
    suggestedQ1: "Hoe werk differensiasie in Wisk?",
    suggestedQ2: "Kan jy fotosintese vir my verduidelik?",
    suggestedQ3: "Wat het die Groot Depressie veroorsaak?",
    suggestedQ4: "Hoe balanseer ek chemiese vergelykings?",
    focusTimePrefix: "Fokustyd:",
    prefersStudyingIn: "Studeer graag in die",
    varkVisual: "Visuele Leerder",
    varkAuditory: "Ouditiewe Leerder",
    varkKinesthetic: "Kinestetiese Leerder",
    varkReading: "Lees/Skryf Leerder",
    varkMixed: "Gemengde Leerder",
    printStudyNotes: "Grade 12 Studienotas",
    printCaps: "NSC KABV",
    printConfidential: "Vertroulik",
    printPersonalUse: "Hierdie dokument is gegenereer vir persoonlike gebruik",
  },
} as const;

export default function TutorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isAf = language === "af";
  const t = T[language];
  const searchParams = new URLSearchParams(useSearch());
  const questionId = searchParams.get("question");
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [mode, setMode] = useState<"chat" | "notes">("chat");
  const [notesView, setNotesView] = useState<"notes" | "mindmap">("notes");
  const [notesTopic, setNotesTopic] = useState("");
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [notesLang, setNotesLang] = useState(language);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<number, boolean>>({});
  const [pendingFeedback, setPendingFeedback] = useState<Record<number, number>>({});
  const [feedbackText, setFeedbackText] = useState<Record<number, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: profile } = useQuery<OnboardingResult>({
    queryKey: ["/api/user/onboarding"],
  });

  const { data: subjects, isError: subjectsFailed } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
    // Guard the shape: this endpoint returns an array on success but an
    // { error } object on a 500. Anything non-array becomes [] so the
    // pickers show an honest empty state instead of throwing.
    select: (data: any) => (Array.isArray(data) ? data : []),
  });

  const { data: capsTopics } = useQuery<Topic[]>({
    queryKey: ["/api/subjects", selectedSubject, "topics"],
    queryFn: async () => {
      const res = await fetch(`/api/subjects/${selectedSubject}/topics`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch topics");
      return res.json();
    },
    enabled: !!selectedSubject,
  });

  const askMutation = useMutation({
    mutationFn: async (data: { question: string; subject?: string }) => {
      const response = await apiRequest("POST", "/api/ai/tutor/ask", {
        ...data,
        language: isAf ? "afrikaans" : "english",
        learningStyle: profile?.learningStyle || "mixed",
        sessionId: sessionId || undefined
      });
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      return result as {
        answer: string;
        question: string;
        subject?: string;
        sessionId: number;
        diagrams?: DiagramEntry[];
        citedExamples?: CitedExample[];
        studyNotesUrl?: string | null;
        topicName?: string | null;
      };
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
        timestamp: new Date().toISOString(),
        diagrams: data.diagrams && data.diagrams.length > 0 ? data.diagrams : undefined,
        citedExamples: data.citedExamples && data.citedExamples.length > 0 ? data.citedExamples : undefined,
        studyNotesUrl: data.studyNotesUrl ?? null,
        topicName: data.topicName ?? null,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error: any) => {
      const errorMessage = error?.message || t.couldNotGetResponse;
      // Remove the last user message if it was filtered or off-topic
      if (errorMessage.includes("appropriate") || errorMessage.includes("clean") || 
          errorMessage.includes("skoon") || errorMessage.includes("studies")) {
        setMessages((prev) => prev.slice(0, -1));
      }
      toast({
        title: t.oops,
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const notesMutation = useMutation({
    mutationFn: async (data: { topic: string; subject?: string }) => {
      const response = await apiRequest("POST", "/api/ai/tutor/notes", {
        ...data,
        language: isAf ? "afrikaans" : "english",
        learningStyle: profile?.learningStyle || "mixed",
        studyPreference: profile?.studyPreference || null,
        focusDuration: profile?.focusDuration || null,
        planningStyle: (profile?.rawAnswersJson as any)?.planning_style || null,
        practiceMethod: (profile?.rawAnswersJson as any)?.practice_method || null,
      });
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      return result as { notes: string; topic: string; subject?: string; learningStyle: string };
    },
    onSuccess: (data) => {
      setGeneratedNotes(data.notes);
      toast({
        title: t.notesGeneratedTitle,
        description: t.notesGeneratedDesc,
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || t.couldNotGenerateNotes;
      toast({
        title: t.oops,
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleGenerateNotes = () => {
    if (!notesTopic.trim() || notesTopic.trim().length < 3) {
      toast({
        title: t.shortTitle,
        description: t.shortDesc,
        variant: "destructive",
      });
      return;
    }
    const subjectName = subjects?.find(s => s.id.toString() === selectedSubject)?.name;
    notesMutation.mutate({ topic: notesTopic, subject: subjectName });
  };

  useEffect(() => {
    if (language !== notesLang && generatedNotes) {
      setGeneratedNotes(null);
      setNotesLang(language);
    }
  }, [language, notesLang, generatedNotes]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    if (inputValue.trim().length < 5) {
      toast({
        title: t.shortTitle,
        description: t.shortQuestionDesc,
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const subjectName = subjects?.find(s => s.id.toString() === selectedSubject)?.name;
    
    askMutation.mutate({
      question: inputValue,
      subject: subjectName,
    });

    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [t.suggestedQ1, t.suggestedQ2, t.suggestedQ3, t.suggestedQ4];

  const feedbackMutation = useMutation({
    mutationFn: async (data: { messageIndex: number; rating: number; suggestion?: string }) => {
      if (!sessionId) return;
      await apiRequest("POST", "/api/tutor/feedback", {
        ...data,
        sessionId
      });
    },
    onSuccess: (_, variables) => {
      setFeedbackSubmitted(prev => ({ ...prev, [variables.messageIndex]: true }));
      toast({
        title: t.thankYouTitle,
        description: t.thankYouDesc,
      });
    },
  });

  const handleFeedback = (index: number, rating: number) => {
    setPendingFeedback(prev => ({ ...prev, [index]: rating }));
    setFeedbackText(prev => ({ ...prev, [index]: "" }));
  };

  const submitFeedback = (index: number, skipSuggestion: boolean = false) => {
    const rating = pendingFeedback[index];
    const suggestion = skipSuggestion ? undefined : feedbackText[index];
    feedbackMutation.mutate({ 
      messageIndex: index, 
      rating, 
      suggestion: suggestion || undefined 
    });
    setPendingFeedback(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    setFeedbackText(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  // /api/subjects is ALREADY scoped to the learner's onboarded subjects
  // server-side (routes.ts — "A learner sees ONLY their onboarded subjects").
  // This used to intersect it a second time against profile.selectedSubjects,
  // which could only ever shrink the list — and when the two sources
  // disagreed (stale onboarding_results, ids that no longer resolve) the
  // intersection came back EMPTY, so the Study Notes and tutor subject
  // dropdowns rendered zero options with no explanation. Trust the server.
  const filteredSubjects = subjects;
  // Distinguish "still loading" from "genuinely none" so the pickers can say
  // which, instead of silently showing an empty menu.
  const subjectsLoading = subjects === undefined && !subjectsFailed;
  const noSubjects = Array.isArray(subjects) && subjects.length === 0;

  return (
    <div className="min-h-screen flex flex-col text-white overflow-x-hidden relative" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
      <GraffitiSplats variant="band" opacity={0.6} />
      <style>{`
        .tutor-sticker { transition: transform .18s ease, box-shadow .18s ease; }
        .tutor-sticker:hover { transform: rotate(0deg) translateY(-3px) scale(1.02) !important; }
        @media (prefers-reduced-motion: reduce) {
          .tutor-sticker:hover { transform: none !important; }
        }
      `}</style>
      <div aria-hidden style={{ height: 3, background: RIZZ_RAINBOW, backgroundSize: "200% 100%", animation: "bt-rainbow 6s linear infinite" }} />
      <LearnerHeader
        backLabel={t.homeLabel}
        title={t.pageTitle}
        maxWidthClassName="max-w-4xl"
        titleExtra={
          <>
            {/* Rizz, alive — expression tracks whether he's working. */}
            <RizzBrandStyles />
            <div className="flex items-center gap-2 min-w-0">
              <RizzFace
                expression={
                  (askMutation.isPending || notesMutation.isPending
                    ? "thinking"
                    : "happy") as RizzExpression
                }
                size={34}
              />
              <span className="hidden sm:inline-flex">
                <RizzWordmark size={20} />
              </span>
            </div>
          </>
        }
      />

      <div className="max-w-4xl mx-auto w-full px-4 pt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-white/[.03] w-full sm:w-auto" style={{ border: "1px solid rgba(197,179,255,0.4)" }}>
          <button
            onClick={() => setMode("chat")}
            className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-none"
            style={
              mode === "chat"
                ? { background: "#6EE7F9", color: "#050508" }
                : { color: "#C5B3FF", border: "1.5px solid #C5B3FF", background: "#000" }
            }
            data-testid="button-mode-chat"
          >
            <MessageCircle className="w-4 h-4" />
            {t.chatTab}
          </button>
          <button
            onClick={() => { setMode("notes"); setGeneratedNotes(null); }}
            className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-none"
            style={
              mode === "notes"
                ? { background: "#6EE7F9", color: "#050508" }
                : { color: "#6EE7F9", border: "1.5px solid #6EE7F9", background: "#000" }
            }
            data-testid="button-mode-notes"
          >
            <NotebookPen className="w-4 h-4" />
            {t.notesTab}
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4">
        {mode === "notes" ? (
          <div className="flex-1 flex flex-col">
            <div
              className="mb-4 pb-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
            >
              <div>
                <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <NotebookPen className="w-5 h-5" style={{ color: "#6EE7F9" }} />
                    {t.generateStudyNotesHeading}
                  </h2>
                  {profile?.learningStyle === "visual" && (
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[.03]" style={{ border: "1px solid rgba(197,179,255,0.4)" }}>
                      <button
                        onClick={() => setNotesView("notes")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-none"
                        style={notesView === "notes"
                          ? { background: "#6EE7F9", color: "#050508" }
                          : { color: "#6EE7F9", border: "1.5px solid #6EE7F9", background: "#000" }}
                        data-testid="button-notes-view-notes"
                      >
                        <NotebookPen className="w-3.5 h-3.5" />{t.notesViewLabel}
                      </button>
                      <button
                        onClick={() => setNotesView("mindmap")}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-none"
                        style={notesView === "mindmap"
                          ? { background: "#6EE7F9", color: "#050508" }
                          : { color: "#C5B3FF", border: "1.5px solid #C5B3FF", background: "#000" }}
                        data-testid="button-notes-view-mindmap"
                      >
                        <Network className="w-3.5 h-3.5" />{t.mindmapViewLabel}
                      </button>
                    </div>
                  )}
                </div>

                {notesView === "mindmap" && profile?.learningStyle === "visual" && (
                  <div>
                    <div className="mb-3">
                      <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger
                          style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid rgba(255,255,255,.18)", color: "#fff" }}
                          data-testid="select-subject-mindmap"
                        >
                          <SelectValue placeholder={t.selectSubjectMindmapPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {(subjects ?? []).map((subject) => (
                            <SelectItem key={subject.id} value={subject.id.toString()}>
                              {isAf ? subject.nameAfrikaans : subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedSubject && capsTopics && capsTopics.length > 0 ? (
                      <TopicMindmap
                        subject={(() => { const s = subjects?.find(s => s.id.toString() === selectedSubject); return s ? (isAf ? s.nameAfrikaans : s.name) : t.subjectFallback; })()}
                        topics={capsTopics}
                        isAf={isAf}
                      />
                    ) : (
                      <div className="text-center py-8" style={{ color:"#ffffff" }}>
                        <Network className="w-8 h-8 mx-auto mb-2" style={{ color: "#C5B3FF" }} />
                        <p className="text-sm">{t.selectSubjectFirst}</p>
                      </div>
                    )}
                  </div>
                )}
                {(notesView !== "mindmap" || profile?.learningStyle !== "visual") && <>

                {(() => {
                  const style = profile?.learningStyle || "mixed";
                  const avatarInfo = TUTOR_AVATARS[style] || TUTOR_AVATARS.mixed;
                  const StyleIcon = avatarInfo.icon;
                  const STYLE_NAMES: Record<string, { en: string; af: string; descEn: string; descAf: string }> = {
                    visual:      { en: "Visual Learner",          af: "Visuele Leerder",          descEn: "Notes include diagrams, charts, visual hierarchy and colour-coding suggestions.", descAf: "Notas sluit diagramme, kaarte, visuele hiërargie en kleurkoderingvoorstelle in." },
                    auditory:    { en: "Auditory Learner",         af: "Ouditiewe Leerder",         descEn: "Notes are written conversationally with mnemonics, rhymes and read-aloud prompts.", descAf: "Notas is geskrewe in 'n gespreksstyl met geheue-truuks en hardop-lees-aanwysings." },
                    kinesthetic: { en: "Kinesthetic Learner",      af: "Kinestetiese Leerder",      descEn: "Notes include hands-on activities, real-world examples and step-by-step practice.", descAf: "Notas sluit praktiese aktiwiteite, werklike voorbeelde en stap-vir-stap oefening in." },
                    reading:     { en: "Reading/Writing Learner",  af: "Lees/Skryf Leerder",        descEn: "Notes use detailed text, precise definitions, numbered lists and structured outlines.", descAf: "Notas gebruik gedetailleerde teks, presiese definisies, genommerde lyste en uitlyne." },
                    mixed:       { en: "Mixed/Multimodal Learner", af: "Gemengde Leerder",          descEn: "Notes combine diagrams, explanations and practical activities for a balanced approach.", descAf: "Notas kombineer diagramme, verduidelikings en praktiese aktiwiteite." },
                  };
                  const meta = STYLE_NAMES[style] || STYLE_NAMES.mixed;
                  const focusMin = profile?.focusDuration;
                  const studyTime = profile?.studyPreference;
                  const studyTimeLabel: Record<string, { en: string; af: string }> = {
                    morning:   { en: "morning", af: "oggend" },
                    afternoon: { en: "afternoon", af: "middag" },
                    evening:   { en: "evening", af: "aand" },
                  };
                  const timeLabel = studyTime ? (isAf ? studyTimeLabel[studyTime]?.af : studyTimeLabel[studyTime]?.en) : null;
                  return (
                    <div
                      className="flex items-start gap-3 pb-3 mb-4"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg bg-white/[.03] flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ border: "1px solid #C5B3FF" }}
                      >
                        <StyleIcon className="w-5 h-5" style={{ color: "#C5B3FF" }} />
                      </div>
                      <div>
                        <p className="text-sm font-black mb-0.5" style={{ color: "#C5B3FF" }}>{isAf ? meta.af : meta.en}</p>
                        <p className="text-xs leading-relaxed" style={{ color:"#ffffff" }}>{isAf ? meta.descAf : meta.descEn}</p>
                        {(focusMin || timeLabel) && (
                          <p className="text-xs mt-1" style={{ color:"#ffffff" }}>
                            {focusMin && `${t.focusTimePrefix} ${focusMin} min`}
                            {focusMin && timeLabel && " · "}
                            {timeLabel && `${t.prefersStudyingIn} ${timeLabel}`}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-3">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger
                      style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid rgba(110,231,249,0.5)", color: "#fff" }}
                      data-testid="select-subject-notes"
                    >
                      <SelectValue placeholder={t.selectSubjectPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Never render a silently empty menu — say why. */}
                      {subjectsLoading && (
                        <div className="px-3 py-2 text-sm" style={{ color: "#fff" }}>
                          {isAf ? "Laai vakke…" : "Loading subjects…"}
                        </div>
                      )}
                      {subjectsFailed && (
                        <div className="px-3 py-2 text-sm" style={{ color: "#FF8DA1" }}>
                          {isAf ? "Kon nie vakke laai nie." : "Couldn't load subjects."}
                        </div>
                      )}
                      {noSubjects && (
                        <div className="px-3 py-2 text-sm" style={{ color: "#fff" }}>
                          {isAf ? "Kies eers jou vakke in Instellings." : "Pick your subjects in Settings first."}
                        </div>
                      )}
                      {filteredSubjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {isAf ? subject.nameAfrikaans : subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedSubject && capsTopics && capsTopics.length > 0 && (
                    <div>
                      <p className="text-[11px] font-black mb-2 uppercase tracking-[0.22em]" style={{ color: "#FFE29A" }}>
                        {t.capsTopicsLabel}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {capsTopics.map((topic, i) => {
                          const palette = ["#6EE7F9", "#9FD8FF", "#C5B3FF", "#C5B3FF", "#FFB7E5", "#FFE29A", "#FFE29A", "#FFE29A"];
                          const hex = palette[i % palette.length];
                          const isSelected = notesTopic === (isAf ? topic.nameAfrikaans : topic.name);
                          return (
                            <button
                              key={topic.id}
                              onClick={() => setNotesTopic(isAf ? topic.nameAfrikaans : topic.name)}
                              className="text-sm font-bold px-4 py-2 rounded-xl bg-white/[.03] transition-none"
                              style={isSelected
                                ? { background: hex, color: "#050508", border: `1.5px solid ${hex}` }
                                : { color: hex, border: `1.5px solid ${hex}` }}
                              data-testid={`topic-chip-notes-${topic.id}`}
                            >
                              {isAf ? topic.nameAfrikaans : topic.name}
                              {topic.capsWeighting === "high" && (
                                <span className="ml-1" style={{ color: "#FFE29A" }} title={t.highExamWeighting}>★</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Textarea
                    value={notesTopic}
                    onChange={(e) => setNotesTopic(e.target.value)}
                    placeholder={t.topicNotesPlaceholder}
                    className="min-h-[80px]"
                    style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid rgba(110,231,249,0.5)", color: "#fff" }}
                    data-testid="input-notes-topic"
                  />
                  <button 
                    onClick={handleGenerateNotes} 
                    disabled={notesMutation.isPending || !notesTopic.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-bold text-sm transition-none disabled:opacity-40"
                    style={{ background: "#6EE7F9", color: "#050508" }}
                    data-testid="button-generate-notes"
                  >
                    {notesMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t.generatingNotesLabel}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {t.generateNotesBtn}
                      </>
                    )}
                  </button>

                  {notesMutation.isError && !notesMutation.isPending && (
                    <div
                      className="rounded-xl p-3 flex items-start gap-3 text-xs"
                      style={{ background: "rgba(255,141,161,0.08)", border: "1.5px solid rgba(255,141,161,0.55)", color: "#fff" }}
                      data-testid="notes-generation-error"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#FFE29A" }} />
                      <div className="flex-1 leading-snug">
                        <p className="font-bold">
                          {t.couldNotGenerateNotes}
                        </p>
                        <p className="mt-0.5">
                          {(notesMutation.error instanceof Error && notesMutation.error.message) ||
                            (isAf
                              ? "Iets het kort gegaan. Probeer asseblief weer."
                              : "Something went wrong. Please try again.")}
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateNotes}
                        disabled={notesMutation.isPending || !notesTopic.trim()}
                        className="flex-shrink-0 inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold bg-black disabled:opacity-40"
                        style={{ border: "1.5px solid #FFE29A", color: "#FFE29A" }}
                        data-testid="button-retry-notes"
                      >
                        <RotateCcw className="w-3 h-3" />
                        {t.retryBtn}
                      </button>
                    </div>
                  )}
                </div>
                </>}
              </div>
            </div>

            {generatedNotes && (
              <div
                className="flex-1 overflow-hidden rounded-2xl bg-[#050508] bg-[linear-gradient(rgba(255,255,255,.05),rgba(255,255,255,.05))]"
                style={{ border: "1.5px solid #FFB7E5" }}
              >
                <div className="p-4 h-full flex flex-col">
                  <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
                    <h3
                      className="text-lg tracking-tight"
                      style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 18, color: "#FFB7E5", transform: "rotate(-2deg)" }}
                    >
                      {t.studyNotesHeading}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-sm font-bold"
                        style={{ color: "#6EE7F9", border: "1.5px solid #6EE7F9" }}
                        onClick={() => {
                          const printWindow = window.open('', '_blank');
                          if (!printWindow) return;

                          const learnerName = user
                            ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || (user as any).email || 'Learner'
                            : 'Learner';
                          const subjectLabel = subjects?.find(s => s.id.toString() === selectedSubject)
                            ? (isAf
                                ? subjects.find(s => s.id.toString() === selectedSubject)!.nameAfrikaans
                                : subjects.find(s => s.id.toString() === selectedSubject)!.name)
                            : t.generalLabel;
                          const topicLabel = notesTopic;
                          const dateStr = formatDate(new Date(), language, {
                            day: 'numeric', month: 'long', year: 'numeric',
                          });
                          // Absolute URL so the logo resolves inside the about:blank print window.
                          const brandLogoUrl = `${window.location.origin}${brandLogo}`;
                          const mdToHtml = (md: string) => md
                            // strip fenced code blocks — render content as preformatted text
                            .replace(/```[\w]*\r?\n?([\s\S]*?)```/g, (_m, code) => `<pre class="code-block">${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`) // nosemgrep: javascript.lang.security.html-in-template-string -- code block content is AI-generated text, not user HTML; < > are entity-escaped
                            // strip inline code
                            .replace(/`([^`]+)`/g, '<code>$1</code>')
                            .replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>')
                            .replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>')
                            .replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
                            .replace(/^#{4,6}\s+(.+)$/gm, '<h4>$1</h4>')
                            .replace(/\*{2}([^*]+)\*{2}/g, '<strong>$1</strong>')
                            .replace(/_{2}([^_]+)_{2}/g, '<strong>$1</strong>')
                            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                            .replace(/_([^_]+)_/g, '<em>$1</em>')
                            .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
                            .replace(/^(\d+)\.\s+(.+)$/gm, '<li>$2</li>')
                            .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
                            .replace(/\n{2,}/g, '</p><p>')
                            .replace(/^(?!<[hul])(.+)$/gm, (m) => m.startsWith('<') ? m : `<p>${m}</p>`); // nosemgrep: javascript.lang.security.html-in-template-string -- wrapping text nodes in <p> tags during markdown rendering; not injecting user HTML

                          const htmlContent = mdToHtml(generatedNotes);

                          const learningStyleLabel: Record<string, string> = {
                            visual: t.varkVisual,
                            auditory: t.varkAuditory,
                            kinesthetic: t.varkKinesthetic,
                            reading: t.varkReading,
                            mixed: t.varkMixed,
                          };
                          const styleLabel = learningStyleLabel[profile?.learningStyle || 'mixed'] || '';
                          // Pre-compute safe HTML fragments before the template (nosemgrep-safe positions)
                          const styleLabelHtml = styleLabel
                            ? `<span class="chip cyan">${styleLabel}</span>` : ''; // nosemgrep: javascript.lang.security.html-in-template-string -- styleLabel is a predefined enum label from the learningStyleLabel map, not user-controlled content

                          printWindow.document.write(/* nosemgrep: javascript.lang.security.html-in-template-string -- template generates a sandboxed print document; variables are app-state values (dates, predefined labels) or AI markdown converted to HTML, never raw user DOM input */ `<!DOCTYPE html>
<html lang="${isAf ? 'af' : 'en'}">
<head>
  <meta charset="UTF-8" />
  <title>BrainTrack™ — ${topicLabel}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 20mm 18mm 22mm 18mm; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12pt;
      color: #1a1a1a;
      line-height: 1.7;
      background: #fff;
      position: relative;
    }

    /* ── Watermark ── */
    body::after {
      content: 'BrainTrack';
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 72pt;
      font-weight: 900;
      letter-spacing: 4px;
      color: rgba(59, 130, 246,0.07);
      white-space: nowrap;
      pointer-events: none;
      z-index: 0;
    }

    /* ── Header ── */
    .doc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .doc-header .logo-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .doc-header .brand {
      font-size: 20pt;
      font-weight: 900;
      background: linear-gradient(135deg, #ef4444 0%, #f97316 20%, #eab308 40%, #22c55e 60%, #3b82f6 80%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.1;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .doc-header .brand .kth {
      font-size: 7.5pt;
      font-weight: 600;
      background: none;
      -webkit-text-fill-color: #9ca3af;
      display: block;
      letter-spacing: 1px;
      margin-top: 2px;
    }
    .doc-header .brand .grade-label {
      font-size: 8pt;
      font-weight: 600;
      background: none;
      -webkit-text-fill-color: #6b7280;
      display: block;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 1px;
    }
    .doc-header .brand-svg {
      flex-shrink: 0;
    }
    .doc-header .brand-logo {
      height: 48px;
      width: auto;
      flex-shrink: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .doc-header .meta {
      text-align: right;
      font-size: 8.5pt;
      color: #6b7280;
      line-height: 1.6;
    }
    .doc-header .meta strong {
      color: #1a1a1a;
      font-size: 9pt;
    }

    /* ── Title block ── */
    .doc-title-block {
      background: linear-gradient(135deg, #f0f0ff 0%, #ecfeff 100%);
      border-left: 4px solid #3b82f6;
      border-radius: 0 8px 8px 0;
      padding: 14px 18px;
      margin-bottom: 22px;
    }
    .doc-title-block h1 {
      font-size: 16pt;
      font-weight: 800;
      color: #1e40af;
      margin-bottom: 4px;
      border: none;
      padding: 0;
    }
    .doc-title-block .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .chip {
      background: #3b82f6;
      color: #fff;
      font-size: 8pt;
      font-weight: 700;
      border-radius: 20px;
      padding: 3px 10px;
      letter-spacing: 0.5px;
    }
    .chip.green { background: #059669; }
    .chip.cyan { background: #0891b2; }

    /* ── Content ── */
    .doc-body {
      position: relative;
      z-index: 1;
    }
    .doc-body h1 { font-size: 14pt; font-weight: 800; color: #1e40af; border-bottom: 1.5px solid #dbeafe; padding-bottom: 6px; margin: 20px 0 10px; }
    .doc-body h2 { font-size: 13pt; font-weight: 700; color: #2563eb; margin: 18px 0 8px; }
    .doc-body h3 { font-size: 12pt; font-weight: 700; color: #3b82f6; margin: 14px 0 6px; }
    .doc-body h4 { font-size: 11pt; font-weight: 600; color: #0e7490; margin: 12px 0 4px; }
    .doc-body p { margin: 8px 0; }
    .doc-body ul { margin: 8px 0 8px 22px; list-style: disc; }
    .doc-body ol { margin: 8px 0 8px 22px; }
    .doc-body li { margin: 4px 0; }
    .doc-body strong { font-weight: 700; color: #1a1a1a; }
    .doc-body em { font-style: italic; color: #374151; }
    .doc-body table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt; }
    .doc-body th { background: #3b82f6; color: #fff; padding: 7px 10px; font-weight: 700; text-align: left; }
    .doc-body td { border: 1px solid #e5e7eb; padding: 6px 10px; }
    .doc-body tr:nth-child(even) td { background: #f8f8ff; }
    .code-block {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-left: 3px solid #3b82f6;
      border-radius: 4px;
      padding: 10px 14px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 9.5pt;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 10px 0;
      color: #1e293b;
    }
    code {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 3px;
      padding: 1px 5px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 9.5pt;
      color: #1e40af;
    }

    /* ── Footer ── */
    .doc-footer {
      margin-top: 32px;
      padding-top: 10px;
      border-top: 1.5px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 7.5pt;
      color: #9ca3af;
    }
    .doc-footer strong { color: #3b82f6; font-weight: 700; }
    .confidential {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 7pt;
      font-weight: 700;
      color: #dc2626;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    @media print {
      body::after { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .doc-header, .doc-title-block, .chip, th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="doc-header">
    <div class="logo-wrap">
      <img class="brand-logo" src="${brandLogoUrl}" alt="BrainTrack" />
      <div class="brand">
        <span class="kth">Powered by KTH Tech</span>
        <span class="grade-label">${t.printStudyNotes}</span>
      </div>
    </div>
    <div class="meta">
      <strong>${learnerName}</strong><br/>
      ${subjectLabel}<br/>
      ${dateStr}
    </div>
  </div>

  <div class="doc-title-block">
    <h1>${topicLabel}</h1>
    <div class="chips">
      <span class="chip">${subjectLabel}</span>
      ${styleLabelHtml}
      <span class="chip green">${t.printCaps}</span>
    </div>
  </div>

  <div class="doc-body">
    ${htmlContent}
  </div>

  <div class="doc-footer">
    <div>
      <strong>BrainTrack™</strong> &mdash; learn@kth-tech.com
    </div>
    <div>
      <span class="confidential">&#9632; ${t.printConfidential}</span>
      &nbsp;&nbsp;${t.printPersonalUse}
    </div>
  </div>
</body>
</html>`);
                          printWindow.document.close();
                          setTimeout(() => printWindow.print(), 400);
                        }}
                        data-testid="button-print-notes"
                      >
                        <FileText className="w-4 h-4" />
                        {t.printBtn}
                      </button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 pr-4">
                    <div
                      className="text-sm text-white leading-relaxed prose prose-invert prose-sm max-w-none [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:mb-0.5 [&_strong]:text-[#6EE7F9] [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-3 [&_blockquote]:text-white"
                      data-testid="text-generated-notes"
                      onContextMenu={e => e.preventDefault()}
                      data-nosnippet
                    >
                      <ReactMarkdown>{generatedNotes}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        ) : messages.length === 0 ? (
          <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-10">
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 w-[360px] h-[360px] rounded-full opacity-35 blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(197,179,255,0.45), transparent 70%)" }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 w-[360px] h-[360px] rounded-full opacity-35 blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(110,231,249,0.4), transparent 70%)" }}
            />
            {(() => {
              const learningStyle = profile?.learningStyle || "mixed";
              const tutorAvatar = TUTOR_AVATARS[learningStyle] || TUTOR_AVATARS.mixed;
              const TutorIcon = tutorAvatar.icon;
              return (
                // Rizz's own page — he gets the full standing mascot at hero
                // scale with floating animation and sticker callouts, matching
                // the journey page's treatment. He was previously a 108px
                // avatar crop with no callouts, which read as a chat icon
                // rather than the character the page is named after.
                <div className="relative mb-5 w-[190px] h-[190px] sm:w-[240px] sm:h-[240px]">
                  {/* Purple blur-halo removed — pure glow. */}
                  <img
                    src={rizzMascot}
                    alt={isAf ? "Rizz, jou studiemaat" : "Rizz, your study buddy"}
                    className="relative"
                    style={{
                      zIndex: 2,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      animation: "bt-float 6s ease-in-out infinite",
                    }}
                  />
                  <span className="hidden sm:inline-flex" style={tutorSticker("#9FF5E8", -8, { top: 2, left: -26 })}>
                    {t.sticker1}
                  </span>
                  <span className="hidden lg:inline-flex" style={tutorSticker("#FFE29A", 7, { top: 44, right: -66 })}>
                    {t.sticker2}
                  </span>
                  <span className="hidden lg:inline-flex" style={tutorSticker("#FFB7E5", -6, { bottom: 22, left: -52 })}>
                    {t.sticker3}
                  </span>
                  <span
                    aria-hidden
                    className="absolute bottom-3 left-3 w-4 h-4 rounded-full"
                    style={{ zIndex: 3, background: "#94F7C5", border: "2.5px solid #050508" }}
                  />
                  <span
                    className="absolute bottom-1 right-1 w-9 h-9 rounded-lg bg-black flex items-center justify-center"
                    style={{ zIndex: 3, border: "1.5px solid #C5B3FF" }}
                    title={isAf ? "Jou leerstyl" : "Your learning style"}
                  >
                    <TutorIcon className="w-4 h-4" style={{ color: "#C5B3FF" }} />
                  </span>
                </div>
              );
            })()}
            <span
              className="relative inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] px-4 py-1.5 rounded-full bg-white/[.03] mb-4"
              style={{ color: "#6EE7F9", border: "1px solid rgba(110,231,249,0.55)" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.tutorHeading}
            </span>
            <div
              role="heading"
              aria-level={1}
              className="relative text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.05] mb-3"
              style={{
                backgroundImage: "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {t.askMeAnything}
            </div>
            <div
              className="relative mb-3 text-base"
              style={{ fontFamily: "'Permanent Marker',cursive", color: "#FFB7E5", transform: "rotate(-2deg)" }}
            >
              {RIZZ_LINES[language].tagline}
            </div>
            <p className="relative text-sm sm:text-base text-white max-w-md mb-8">
              {t.introParagraph}
            </p>

            <div className="relative w-full max-w-lg space-y-3">
              {selectedSubject && capsTopics && capsTopics.length > 0 ? (
                <>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: "#FFE29A" }}>
                    {t.topicsHeading}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {capsTopics.map((topic, i) => {
                      const palette = ["#6EE7F9", "#9FD8FF", "#C5B3FF", "#C5B3FF", "#FFB7E5", "#FFE29A", "#FFE29A"];
                      const hex = palette[i % palette.length];
                      const tilt = STICKER_TILTS[i % STICKER_TILTS.length];
                      return (
                        <button
                          key={topic.id}
                          onClick={() => {
                            const subjectName = subjects?.find(s => s.id.toString() === selectedSubject)?.name || "";
                            const topicName = isAf ? topic.nameAfrikaans : topic.name;
                            setInputValue(isAf ? `Verduidelik ${topicName} vir ${subjectName}` : `Explain ${topicName} for ${subjectName}`);
                          }}
                          className="tutor-sticker inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full bg-white/[.03]"
                          style={{ color: hex, border: `1.5px solid ${hex}`, transform: `rotate(${tilt}deg)`, boxShadow: `0 3px 0 ${hex}44` }}
                          data-testid={`topic-chip-chat-${topic.id}`}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          {isAf ? topic.nameAfrikaans : topic.name}
                          {topic.capsWeighting === "high" && <span className="ml-0.5" style={{ color: "#FFE29A" }}>★</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: "#FFE29A" }}>
                    {t.trySuggestions}
                  </p>
                  <div className="grid gap-2.5">
                    {suggestedQuestions.map((q, i) => {
                      const palette = ["#6EE7F9", "#C5B3FF", "#FFB7E5", "#FFE29A"];
                      const hex = palette[i % palette.length];
                      const tilt = STICKER_TILTS[i % STICKER_TILTS.length];
                      return (
                        <button
                          key={i}
                          onClick={() => setInputValue(q)}
                          className="tutor-sticker text-left flex items-start gap-2.5 p-3.5 rounded-2xl text-sm font-bold"
                          style={{
                            color: "#fff",
                            background: `linear-gradient(135deg, ${hex}22, rgba(255,255,255,.02))`,
                            border: `1.5px solid ${hex}`,
                            boxShadow: `0 4px 0 ${hex}55, 0 4px 14px rgba(0,0,0,.35)`,
                            transform: `rotate(${tilt}deg)`,
                          }}
                          data-testid={`suggested-question-${i}`}
                        >
                          <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: hex }} />
                          <span>{q}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4 py-4">
              {messages.map((msg, i) => {
                return (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <RizzFace expression="happy" size={32} radius={9} />
                    )}
                    <div className="flex flex-col gap-1 min-w-0 max-w-[calc(100%-44px)] sm:max-w-[80%]">
                      <div
                        className="px-4 py-3"
                        style={msg.role === "user"
                          ? { background: RIZZ_USER_GRADIENT, border: "1px solid transparent", borderRadius: "18px 18px 4px 18px" }
                          : { background: "rgba(179,136,255,.16)", backdropFilter: "blur(6px)", border: "1.5px solid rgba(197,179,255,0.6)", borderRadius: "18px 18px 18px 4px" }
                        }
                        data-testid={`message-${msg.role}-${i}`}
                        onContextMenu={msg.role === "assistant" ? e => e.preventDefault() : undefined}
                        data-nosnippet={msg.role === "assistant" ? "" : undefined}
                      >
                        <div className={`break-words text-sm leading-relaxed prose prose-sm max-w-none [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:mb-0.5 [&_p]:mb-1 [&_p:last-child]:mb-0 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_blockquote]:border-l-2 [&_blockquote]:pl-3 ${
                          msg.role === "user"
                            ? "[&_*]:!text-[#0D0D14] [&_code]:bg-black/10 [&_blockquote]:border-black/25"
                            : "prose-invert [&_strong]:text-[#6EE7F9] [&_code]:bg-white/10 [&_blockquote]:border-white/20 [&_blockquote]:text-white text-white"
                        }`}>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                      {msg.role === "assistant" && msg.citedExamples && msg.citedExamples.length > 0 && (
                        <div
                          className="mt-2 rounded-xl bg-white/[.03] px-3 py-2.5"
                          style={{
                            border: "1px solid rgba(255,226,154,0.45)",
                          }}
                          data-testid={`citations-${i}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <BookOpen className="w-3 h-3 shrink-0" style={{ color: "#FFE29A" }} />
                            <span
                              className="text-[10px] font-black uppercase tracking-widest"
                              style={{ color: "#FFE29A" }}
                            >
                              {isAf ? "Uit jou studieaantekeninge" : "From your study notes"}
                            </span>
                          </div>
                          <ul className="space-y-1.5">
                            {msg.citedExamples.map((c, ci) => {
                              const label = isAf
                                ? `Voorbeeld ${c.exampleIndex}${c.stepIndex ? `, Stap ${c.stepIndex}` : ""}`
                                : `Example ${c.exampleIndex}${c.stepIndex ? `, Step ${c.stepIndex}` : ""}`;
                              const quoted = c.stepText || c.problem || c.title;
                              return (
                                <li
                                  key={ci}
                                  className="text-xs leading-snug"
                                  style={{ color: "#fff" }}
                                  data-testid={`citation-${i}-${ci}`}
                                >
                                  <span className="font-semibold" style={{ color: "#FFE29A" }}>{label}</span>
                                  {quoted ? (
                                    <>
                                      {": "}
                                      <em style={{ color: "#fff" }}>“{quoted}”</em>
                                    </>
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                          {msg.studyNotesUrl && (
                            <Link href={msg.studyNotesUrl}>
                              <a
                                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold transition-colors hover:underline"
                                style={{ color: "#FFE29A" }}
                                data-testid={`citation-link-${i}`}
                              >
                                {isAf
                                  ? `Sien volledige voorbeeld in studieaantekeninge${msg.topicName ? ` (${msg.topicName})` : ""} →`
                                  : `View full example in Study Notes${msg.topicName ? ` (${msg.topicName})` : ""} →`}
                              </a>
                            </Link>
                          )}
                        </div>
                      )}
                      {msg.role === "assistant" && msg.diagrams && msg.diagrams.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {msg.diagrams.map((diagram, di) => (
                            <div
                              key={di}
                              className="rounded-xl overflow-hidden bg-white/[.03]"
                              style={{ border: "1px solid rgba(110,231,249,0.45)" }}
                              data-testid={`diagram-${i}-${di}`}
                            >
                              <div
                                className="px-3 py-1.5 flex items-center gap-2"
                                style={{ borderBottom: "1px solid rgba(110,231,249,0.25)", background: "rgba(110,231,249,0.07)" }}
                              >
                                <BookOpen className="w-3 h-3 shrink-0" style={{ color: "#6EE7F9" }} />
                                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#6EE7F9" }}>
                                  {diagram.label}
                                </span>
                              </div>
                              <pre
                                className="px-3 py-3 text-xs overflow-x-auto leading-snug"
                                style={{ fontFamily: "'Courier New', Courier, monospace", color: "#fff", whiteSpace: "pre", margin: 0 }}
                              >
                                {diagram.ascii}
                              </pre>
                              {diagram.caption && (
                                <div
                                  className="px-3 py-1.5 text-[11px] leading-snug"
                                  style={{ borderTop: "1px solid rgba(110,231,249,0.2)", color: "#fff" }}
                                >
                                  {diagram.caption}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {sessionId && !feedbackSubmitted[i] && !pendingFeedback[i] && (
                            <div className="flex items-center gap-1 ml-auto">
                              <button
                                onClick={() => handleFeedback(i, 1)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-black transition-colors"
                                style={{ color: "#94F7C5", border: "1.5px solid #94F7C5" }}
                                title={t.helpfulLabel}
                                data-testid={`button-feedback-up-${i}`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleFeedback(i, -1)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-black transition-colors"
                                style={{ color: "#FFB7E5", border: "1.5px solid #FFB7E5" }}
                                title={t.notHelpfulLabel}
                                data-testid={`button-feedback-down-${i}`}
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {pendingFeedback[i] && (
                            <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2 w-full">
                              <div className="text-xs font-medium text-white">
                                {pendingFeedback[i] === 1
                                  ? t.helpfulLabel
                                  : t.notHelpfulLabel}
                              </div>
                              <Textarea
                                placeholder={t.feedbackPlaceholder}
                                value={feedbackText[i] || ""}
                                onChange={(e) => setFeedbackText(prev => ({ ...prev, [i]: e.target.value }))}
                                className="resize-none text-xs h-16"
                                style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid rgba(197,179,255,0.3)", color: "#fff" }}
                                data-testid={`textarea-feedback-suggestion-${i}`}
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => submitFeedback(i, false)}
                                  className="px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40"
                                  style={{ background: "#6EE7F9", color: "#050508" }}
                                  disabled={feedbackMutation.isPending}
                                  data-testid={`button-feedback-submit-${i}`}
                                >
                                  {feedbackMutation.isPending ? t.sendingLabel : t.sendLabel}
                                </button>
                                <button
                                  onClick={() => submitFeedback(i, true)}
                                  className="px-4 py-2 rounded-xl bg-black text-sm font-bold transition-colors disabled:opacity-40"
                                  style={{ color: "#C5B3FF", border: "1.5px solid #C5B3FF" }}
                                  disabled={feedbackMutation.isPending}
                                  data-testid={`button-feedback-skip-${i}`}
                                >
                                  {t.skipLabel}
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {feedbackSubmitted[i] && (
                            <span className="ml-auto text-[10px] font-semibold text-white bg-white/[.03] border border-white/15 px-2 py-0.5 rounded-full">
                              {t.feedbackSent}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div
                        className="w-8 h-8 rounded-lg bg-white/[.03] flex items-center justify-center flex-shrink-0"
                        style={{ border: "1.5px solid #6EE7F9" }}
                      >
                        <User className="w-4 h-4" style={{ color: "#6EE7F9" }} />
                      </div>
                    )}
                  </div>
                );
              })}
              {askMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  {/* Rizz himself, thinking — expression state made visible. */}
                  <RizzFace expression="thinking" size={32} radius={9} />
                  <div
                    className="rounded-2xl px-4 py-3 bg-white/[.03]"
                    style={{ border: "1.5px solid rgba(197,179,255,0.6)" }}
                  >
                    <div className="flex items-center gap-2 text-sm" style={{ color: "#C5B3FF" }}>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.thinkingLabel}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="pt-4 mt-auto" style={{ borderTop: "1px solid rgba(197,179,255,0.3)" }}>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 shrink-0" style={{ color: "#FFE29A" }} />
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger
                className="w-full sm:w-48 h-8 text-xs"
                style={{ background: "rgba(5,5,8,.6)", border: "1.5px solid rgba(255,226,154,0.4)", color: "#FFE29A" }}
                data-testid="select-subject"
              >
                <SelectValue placeholder={t.selectSubjectBottomPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {subjectsLoading && (
                  <div className="px-3 py-2 text-xs" style={{ color: "#fff" }}>
                    {isAf ? "Laai vakke…" : "Loading subjects…"}
                  </div>
                )}
                {subjectsFailed && (
                  <div className="px-3 py-2 text-xs" style={{ color: "#FF8DA1" }}>
                    {isAf ? "Kon nie vakke laai nie." : "Couldn't load subjects."}
                  </div>
                )}
                {noSubjects && (
                  <div className="px-3 py-2 text-xs" style={{ color: "#fff" }}>
                    {isAf ? "Kies eers jou vakke." : "Pick your subjects first."}
                  </div>
                )}
                {filteredSubjects?.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {isAf ? s.nameAfrikaans : s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedSubject && capsTopics && capsTopics.length > 0 && messages.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-thin">
              {capsTopics.slice(0, 8).map((topic, i) => {
                const palette = ["#6EE7F9", "#9FD8FF", "#C5B3FF", "#C5B3FF", "#FFB7E5", "#FFE29A", "#FFE29A", "#FFE29A"];
                const hex = palette[i % palette.length];
                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      const subjectName = subjects?.find(s => s.id.toString() === selectedSubject)?.name || "";
                      const topicName = isAf ? topic.nameAfrikaans : topic.name;
                      setInputValue(isAf ? `Verduidelik ${topicName} vir ${subjectName}` : `Explain ${topicName} for ${subjectName}`);
                    }}
                    className="text-sm font-bold px-4 py-2 rounded-xl bg-white/[.03] whitespace-nowrap transition-none flex-shrink-0"
                    style={{ color: hex, border: `1.5px solid ${hex}` }}
                    data-testid={`topic-quick-${topic.id}`}
                  >
                    {isAf ? topic.nameAfrikaans : topic.name}
                  </button>
                );
              })}
            </div>
          )}
          
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.chatPlaceholder}
              className="min-h-[60px] max-h-32 resize-none flex-1"
              style={{
                background: "rgba(5,5,8,.6)",
                border: "1.5px solid rgba(110,231,249,0.5)",
                color: "#fff",
              }}
              disabled={askMutation.isPending}
              data-testid="input-question"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || askMutation.isPending}
              className="shrink-0 w-12 sm:w-auto sm:px-5 rounded-xl font-bold text-sm transition-none disabled:opacity-40 flex items-center justify-center"
              style={{ background: "#6EE7F9", color: "#050508" }}
              data-testid="button-send"
            >
              {askMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <p className="text-[10px] text-center mt-2" style={{ color:"#ffffff" }}>
            {t.footerDisclaimer}
          </p>
        </div>
      </main>
    </div>
  );
}
