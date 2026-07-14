import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  LogOut,
  Brain,
  Sparkles,
  User,
  MessageCircle,
  BookOpen,
  ArrowLeft,
  Zap,
  Volume2,
  VolumeX,
  Eye,
  Ear,
  Hand,
  FileText,
  Layers,
  NotebookPen,
  ThumbsUp,
  ThumbsDown,
  Globe,
  Network,
  AlertCircle,
  RotateCcw
} from "lucide-react";
import type { Subject, OnboardingResult, TutorMessage, Topic, TutorFeedback } from "@shared/schema";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { TopicMindmap } from "@/components/topic-mindmap";
import brandLogo from "@assets/Logo_01_1779989960628.jpeg";

const TUTOR_AVATARS: Record<string, { icon: any; color: string; bgFrom: string; bgTo: string }> = {
  visual: { icon: Eye, color: "text-cyan-400", bgFrom: "from-cyan-500", bgTo: "to-blue-500" },
  auditory: { icon: Ear, color: "text-cyan-400", bgFrom: "from-cyan-500", bgTo: "to-pink-500" },
  kinesthetic: { icon: Hand, color: "text-orange-400", bgFrom: "from-orange-500", bgTo: "to-amber-500" },
  reading: { icon: FileText, color: "text-green-400", bgFrom: "from-green-500", bgTo: "to-emerald-500" },
  mixed: { icon: Layers, color: "text-blue-400", bgFrom: "from-blue-500", bgTo: "to-cyan-500" },
};

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
    homeLabel: "Dashboard",
    signOut: "Sign Out",
    chatTab: "Chat",
    notesTab: "Study Notes",
    pageTitle: "Smart Tutor",
    pageSubtitle: "AI-powered help with past paper questions, memos and explanations.",
    subjectPlaceholder: "Select subject...",
    voiceGenderLabel: "Voice",
    voiceGirlLabel: "Girl",
    voiceBoyLabel: "Boy",
    speedLabel: "Speed",
    speedSlow: "Slow",
    speedNormal: "Normal",
    speedFast: "Fast",
    generateNotes: "Generate Notes",
    generatingNotes: "Generating...",
    topicPlaceholder: "Enter topic name...",
    notesLanguageLabel: "Notes language",
    mindMapLabel: "Mind Map",
    notesLabel: "Notes",
    sendPlaceholder: "Ask a question about your work...",
    sendBtn: "Send",
    feedbackLabel: "Was this helpful?",
    ttsNotSupported: "Text-to-speech is not supported in your browser.",
    limitReached: "Daily limit reached",
    limitReachedDesc: "You've used all your tutor interactions for today. Come back tomorrow!",
    sessionError: "Session Error",
    sessionErrorDesc: "Could not start tutor session. Please try again.",
    notesError: "Notes Error",
    notesErrorDesc: "Could not generate notes. Please try again.",
    feedbackSent: "Feedback sent",
    feedbackSentDesc: "Thank you for your feedback!",
    notSupported: "Not supported",
    oops: "Oops!",
    shortTitle: "Too short!",
    shortDesc: "Type a longer topic",
    shortQuestionDesc: "Type a longer question",
    stopLabel: "Stop",
    readAloud: "Read aloud",
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
    voiceLabel: "Rizz's voice",
    speechSpeedLabel: "Speech speed",
    slowLabel: "Slow",
    fastLabel: "Fast",
    normalLabel: "Normal",
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
    homeLabel: "Tuisbord",
    signOut: "Uitteken",
    chatTab: "Gesels",
    notesTab: "Studienotas",
    pageTitle: "Slimmer Tutor",
    pageSubtitle: "KI-hulp met vorige vraestelvrae, memos en verduidelikings.",
    subjectPlaceholder: "Kies vak...",
    voiceGenderLabel: "Stem",
    voiceGirlLabel: "Meisie",
    voiceBoyLabel: "Seun",
    speedLabel: "Spoed",
    speedSlow: "Stadig",
    speedNormal: "Normaal",
    speedFast: "Vinnig",
    generateNotes: "Genereer Notas",
    generatingNotes: "Besig...",
    topicPlaceholder: "Voer onderwerpnaam in...",
    notesLanguageLabel: "Notataal",
    mindMapLabel: "Gedagtekaart",
    notesLabel: "Notas",
    sendPlaceholder: "Vra 'n vraag oor jou werk...",
    sendBtn: "Stuur",
    feedbackLabel: "Was dit nuttig?",
    ttsNotSupported: "Teks-na-spraak word nie in jou blaaier ondersteun nie.",
    limitReached: "Daaglikse limiet bereik",
    limitReachedDesc: "Jy het al jou tutorinteraksies vir vandag gebruik. Kom môre terug!",
    sessionError: "Sessie Fout",
    sessionErrorDesc: "Kon nie tutorsessie begin nie. Probeer asseblief weer.",
    notesError: "Notas Fout",
    notesErrorDesc: "Kon nie notas genereer nie. Probeer asseblief weer.",
    feedbackSent: "Terugvoer gestuur",
    feedbackSentDesc: "Dankie vir jou terugvoer!",
    notSupported: "Nie ondersteun nie",
    oops: "Oeps!",
    shortTitle: "Te kort!",
    shortDesc: "Tik 'n langer onderwerp",
    shortQuestionDesc: "Tik 'n langer vraag",
    stopLabel: "Stop",
    readAloud: "Lees voor",
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
    voiceLabel: "Rizz se stem",
    speechSpeedLabel: "Spreekspoed",
    slowLabel: "Stadig",
    fastLabel: "Vinnig",
    normalLabel: "Normaal",
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
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const t = T[language];
  const searchParams = new URLSearchParams(useSearch());
  const questionId = searchParams.get("question");
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female");
  const [voiceRate, setVoiceRate] = useState<"slow" | "normal" | "fast">("normal");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
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

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const load = () => setAvailableVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const stripMarkdown = (text: string): string => {
    return text
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
      .replace(/_{1,3}([^_]+)_{1,3}/g, "$1")
      .replace(/`{1,3}[^`]*`{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^>\s+/gm, "")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(/---+/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const pickVoice = (lang: string, gender: "female" | "male"): SpeechSynthesisVoice | null => {
    const femaleKeys = ["female", "woman", "girl", "zira", "hazel", "susan", "samantha", "victoria", "karen", "moira", "fiona", "tessa", "nova"];
    const maleKeys   = ["male", "man", "boy", "david", "mark", "daniel", "alex", "george", "james", "reed"];
    const keywords = gender === "female" ? femaleKeys : maleKeys;
    const exact = availableVoices.filter(v => v.lang === lang);
    const broad = availableVoices.filter(v => v.lang.startsWith(lang.split("-")[0]));
    const enFallback = availableVoices.filter(v => v.lang.startsWith("en"));
    const pool = exact.length ? exact : broad.length ? broad : enFallback;
    return pool.find(v => keywords.some(k => v.name.toLowerCase().includes(k))) ?? pool[0] ?? null;
  };

  const speakText = (text: string, messageIndex: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      if (isSpeaking && speakingMessageIndex === messageIndex) {
        setIsSpeaking(false);
        setSpeakingMessageIndex(null);
        return;
      }
      
      const clean = stripMarkdown(text);
      const rateMap = { slow: 0.7, normal: 0.9, fast: 1.2 };
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = rateMap[voiceRate];
      utterance.pitch = voiceGender === "female" ? 1.1 : 0.9;
      utterance.lang = isAf ? 'af-ZA' : 'en-ZA';
      const voice = pickVoice(isAf ? 'af-ZA' : 'en-ZA', voiceGender);
      if (voice) utterance.voice = voice;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingMessageIndex(messageIndex);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageIndex(null);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMessageIndex(null);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: t.notSupported,
        description: t.ttsNotSupported,
        variant: "destructive",
      });
    }
  };

  const { data: profile } = useQuery<OnboardingResult>({
    queryKey: ["/api/user/onboarding"],
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
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

  const selectedSubjectIds = profile?.selectedSubjects || [];
  const filteredSubjects = selectedSubjectIds.length > 0 
    ? subjects?.filter(s => selectedSubjectIds.includes(s.id)) 
    : subjects;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-x-hidden">
      <header
        className="sticky top-0 z-50 backdrop-blur-xl bg-black/90"
        style={{ borderBottom: "1px solid rgba(142,124,220,0.35)" }}
      >
        <div className="max-w-4xl mx-auto px-2 min-[375px]:px-4">
          <div className="flex items-center justify-between h-14 gap-2 min-[375px]:gap-4">
            <div className="flex items-center gap-2 min-[375px]:gap-3 min-w-0">
              <Link href="/dashboard">
                <button
                  className="inline-flex items-center gap-1.5 px-2 min-[375px]:px-3 py-1.5 rounded-xl bg-black text-xs font-bold shrink-0"
                  style={{ color: "#28c9d6", border: "1.5px solid #28c9d6", boxShadow: "0 0 12px rgba(40,201,214,0.4)" }}
                  data-testid="link-back"
                >
                  <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                  <span className="max-[374px]:hidden">{t.homeLabel}</span>
                </button>
              </Link>
              <span className="hidden sm:inline text-sm font-black tracking-tight" style={{ color: "#8e7cdc", textShadow: "0 0 8px rgba(142,124,220,0.45)" }}>
                Rizz
              </span>
            </div>
            <div className="flex items-center gap-1 min-[375px]:gap-2 shrink-0">
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1 min-[375px]:gap-1.5 px-2 min-[375px]:px-3 py-1.5 rounded-full bg-black text-[11px] font-black"
                style={{ color: "#8e7cdc", border: "1px solid rgba(142,124,220,0.55)", boxShadow: "0 0 10px rgba(142,124,220,0.35)" }}
                data-testid="button-language-toggle"
                aria-label={language === "en" ? "EN" : "AF"}
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span className="max-[374px]:hidden">{language === "en" ? "EN" : "AF"}</span>
              </button>
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-1 min-[375px]:gap-1.5 px-2 min-[375px]:px-3 py-1.5 rounded-xl bg-black text-xs font-bold"
                style={{ color: "#e6519c", border: "1.5px solid rgba(230,81,156,0.55)", boxShadow: "0 0 10px rgba(230,81,156,0.35)" }}
                data-testid="button-logout"
                aria-label={t.signOut}
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="max-[374px]:hidden">{t.signOut}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full px-4 pt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-black w-full sm:w-auto" style={{ border: "1px solid rgba(142,124,220,0.4)", boxShadow: "inset 0 0 12px rgba(0,0,0,0.6)" }}>
          <button
            onClick={() => setMode("chat")}
            className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-none"
            style={
              mode === "chat"
                ? { color: "#8e7cdc", border: "1.5px solid #8e7cdc", boxShadow: "0 0 14px rgba(142,124,220,0.55), inset 0 0 8px rgba(142,124,220,0.25)", background: "#000" }
                : { color:"#ffffff", border: "1.5px solid transparent", background: "#000" }
            }
            data-testid="button-mode-chat"
          >
            <MessageCircle className="w-4 h-4" />
            {t.chatTab}
          </button>
          <button
            onClick={() => { setMode("notes"); setGeneratedNotes(null); }}
            className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-none"
            style={
              mode === "notes"
                ? { color: "#28c9d6", border: "1.5px solid #28c9d6", boxShadow: "0 0 14px rgba(40,201,214,0.55), inset 0 0 8px rgba(40,201,214,0.25)", background: "#000" }
                : { color:"#ffffff", border: "1.5px solid transparent", background: "#000" }
            }
            data-testid="button-mode-notes"
          >
            <NotebookPen className="w-4 h-4" />
            {t.notesTab}
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap sm:ml-auto">
          <div
            className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-black"
            style={{ border: "1px solid rgba(40,201,214,0.4)" }}
            title={t.voiceLabel}
          >
            <Volume2 className="w-3.5 h-3.5 ml-1" style={{ color: "#28c9d6" }} />
            <button
              onClick={() => setVoiceGender("female")}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-none"
              style={voiceGender === "female"
                ? { color: "#e6519c", border: "1px solid #e6519c", boxShadow: "0 0 10px rgba(230,81,156,0.5)" }
                : { color:"#ffffff", border: "1px solid transparent" }}
              data-testid="button-voice-female"
            >
              {t.voiceGirlLabel}
            </button>
            <button
              onClick={() => setVoiceGender("male")}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold transition-none"
              style={voiceGender === "male"
                ? { color: "#4f8cd9", border: "1px solid #4f8cd9", boxShadow: "0 0 10px rgba(79,140,217,0.5)" }
                : { color:"#ffffff", border: "1px solid transparent" }}
              data-testid="button-voice-male"
            >
              {t.voiceBoyLabel}
            </button>
          </div>
          <div
            className="flex flex-wrap items-center gap-0.5 p-1 rounded-lg bg-black"
            style={{ border: "1px solid rgba(255,216,58,0.4)" }}
            title={t.speechSpeedLabel}
          >
            {(["slow", "normal", "fast"] as const).map(r => (
              <button
                key={r}
                onClick={() => setVoiceRate(r)}
                className="px-2 py-1 rounded-md text-[11px] font-bold transition-none"
                style={voiceRate === r
                  ? { color: "#ffd83a", border: "1px solid #ffd83a", boxShadow: "0 0 10px rgba(255,216,58,0.5)" }
                  : { color:"#ffffff", border: "1px solid transparent" }}
                data-testid={`button-voice-rate-${r}`}
              >
                {r === "slow" ? t.slowLabel : r === "fast" ? t.fastLabel : t.normalLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4">
        {mode === "notes" ? (
          <div className="flex-1 flex flex-col">
            <div
              className="mb-4 rounded-2xl bg-black p-4"
              style={{ border: "1.5px solid #28c9d6", boxShadow: "0 0 0 1px rgba(40,201,214,0.25), 0 0 28px rgba(40,201,214,0.25), inset 0 0 20px rgba(0,0,0,0.6)" }}
            >
              <div>
                <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                  <h2
                    className="text-lg font-black tracking-tight"
                    style={{
                      background: "linear-gradient(90deg, #28c9d6, #8e7cdc, #e6519c)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {t.generateStudyNotesHeading}
                  </h2>
                  {profile?.learningStyle === "visual" && (
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-black" style={{ border: "1px solid rgba(142,124,220,0.4)" }}>
                      <button
                        onClick={() => setNotesView("notes")}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-none"
                        style={notesView === "notes"
                          ? { color: "#28c9d6", border: "1px solid #28c9d6", boxShadow: "0 0 10px rgba(40,201,214,0.5)" }
                          : { color:"#ffffff", border: "1px solid transparent" }}
                        data-testid="button-notes-view-notes"
                      >
                        <NotebookPen className="w-3.5 h-3.5" />{t.notesViewLabel}
                      </button>
                      <button
                        onClick={() => setNotesView("mindmap")}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-none"
                        style={notesView === "mindmap"
                          ? { color: "#8e7cdc", border: "1px solid #8e7cdc", boxShadow: "0 0 10px rgba(142,124,220,0.5)" }
                          : { color:"#ffffff", border: "1px solid transparent" }}
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
                          className="bg-black"
                          style={{ border: "1px solid rgba(142,124,220,0.5)", color: "#fff" }}
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
                        <Network className="w-8 h-8 mx-auto mb-2" style={{ color: "#8e7cdc", opacity: 0.6 }} />
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
                      className="flex items-start gap-3 p-3 rounded-xl mb-4 bg-black"
                      style={{ border: "1px solid rgba(142,124,220,0.5)", boxShadow: "0 0 16px rgba(142,124,220,0.25), inset 0 0 10px rgba(0,0,0,0.5)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg bg-black flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ border: "1px solid #8e7cdc", boxShadow: "0 0 10px rgba(142,124,220,0.5)" }}
                      >
                        <StyleIcon className="w-5 h-5" style={{ color: "#8e7cdc", filter: "drop-shadow(0 0 3px #8e7cdc)" }} />
                      </div>
                      <div>
                        <p className="text-sm font-black mb-0.5" style={{ color: "#8e7cdc" }}>{isAf ? meta.af : meta.en}</p>
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
                      className="bg-black"
                      style={{ border: "1px solid rgba(40,201,214,0.5)", color: "#fff" }}
                      data-testid="select-subject-notes"
                    >
                      <SelectValue placeholder={t.selectSubjectPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedSubject && capsTopics && capsTopics.length > 0 && (
                    <div>
                      <p className="text-[11px] font-black mb-2 uppercase tracking-[0.22em]" style={{ color: "#ffd83a" }}>
                        {t.capsTopicsLabel}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {capsTopics.map((topic, i) => {
                          const palette = ["#28c9d6", "#4f8cd9", "#8e7cdc", "#b066d6", "#e6519c", "#ffd83a", "#ff8a1f", "#ffb020"];
                          const hex = palette[i % palette.length];
                          const isSelected = notesTopic === (isAf ? topic.nameAfrikaans : topic.name);
                          return (
                            <button
                              key={topic.id}
                              onClick={() => setNotesTopic(isAf ? topic.nameAfrikaans : topic.name)}
                              className="text-xs font-bold px-2.5 py-1.5 rounded-full bg-black transition-none"
                              style={isSelected
                                ? { color: hex, border: `1.5px solid ${hex}`, boxShadow: `0 0 14px ${hex}80, inset 0 0 8px ${hex}33` }
                                : { color: hex, border: `1px solid ${hex}`, boxShadow: `0 0 6px ${hex}40` }}
                              data-testid={`topic-chip-notes-${topic.id}`}
                            >
                              {isAf ? topic.nameAfrikaans : topic.name}
                              {topic.capsWeighting === "high" && (
                                <span className="ml-1" style={{ color: "#ffd83a" }} title={t.highExamWeighting}>★</span>
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
                    className="min-h-[80px] bg-black"
                    style={{ border: "1.5px solid rgba(40,201,214,0.5)", boxShadow: "0 0 14px rgba(40,201,214,0.2), inset 0 0 10px rgba(0,0,0,0.5)", color: "#fff" }}
                    data-testid="input-notes-topic"
                  />
                  <button 
                    onClick={handleGenerateNotes} 
                    disabled={notesMutation.isPending || !notesTopic.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-black py-2.5 font-black text-sm transition-none disabled:opacity-40"
                    style={{ color: "#e6519c", border: "1.5px solid #e6519c", boxShadow: "0 0 18px rgba(230,81,156,0.55), inset 0 0 10px rgba(230,81,156,0.15)" }}
                    data-testid="button-generate-notes"
                  >
                    {notesMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t.generatingNotesLabel}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" style={{ filter: "drop-shadow(0 0 4px #e6519c)" }} />
                        {t.generateNotesBtn}
                      </>
                    )}
                  </button>

                  {notesMutation.isError && !notesMutation.isPending && (
                    <div
                      className="rounded-xl p-3 flex items-start gap-3 text-xs"
                      style={{ background: "rgba(220,38,38,0.08)", border: "1.5px solid rgba(248,113,113,0.55)", color: "#fecaca" }}
                      data-testid="notes-generation-error"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-300" />
                      <div className="flex-1 leading-snug">
                        <p className="font-bold">
                          {t.couldNotGenerateNotes}
                        </p>
                        <p className="opacity-80 mt-0.5">
                          {(notesMutation.error instanceof Error && notesMutation.error.message) ||
                            (isAf
                              ? "Iets het kort gegaan. Probeer asseblief weer."
                              : "Something went wrong. Please try again.")}
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateNotes}
                        disabled={notesMutation.isPending || !notesTopic.trim()}
                        className="flex-shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold disabled:opacity-40"
                        style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.5)", color: "#fecaca" }}
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
                className="flex-1 overflow-hidden rounded-2xl bg-black"
                style={{ border: "1.5px solid #e6519c", boxShadow: "0 0 0 1px rgba(230,81,156,0.25), 0 0 28px rgba(230,81,156,0.28), inset 0 0 20px rgba(0,0,0,0.6)" }}
              >
                <div className="p-4 h-full flex flex-col">
                  <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
                    <h3
                      className="font-black text-lg tracking-tight"
                      style={{
                        background: "linear-gradient(90deg, #e6519c, #b066d6, #8e7cdc)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {t.studyNotesHeading}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (isSpeaking) {
                            window.speechSynthesis.cancel();
                            setIsSpeaking(false);
                            setSpeakingMessageIndex(null);
                            return;
                          }
                          const clean = stripMarkdown(generatedNotes);
                          const chunks = clean.match(/[^.!?]+[.!?]+/g) || [clean];
                          let chunkIndex = 0;
                          const speakNext = () => {
                            if (chunkIndex >= chunks.length) {
                              setIsSpeaking(false);
                              setSpeakingMessageIndex(null);
                              return;
                            }
                            const rateMap2 = { slow: 0.7, normal: 0.9, fast: 1.2 };
                            const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex].trim());
                            utterance.rate = rateMap2[voiceRate];
                            utterance.pitch = voiceGender === "female" ? 1.1 : 0.9;
                            utterance.lang = isAf ? 'af-ZA' : 'en-ZA';
                            const voice = pickVoice(isAf ? 'af-ZA' : 'en-ZA', voiceGender);
                            if (voice) utterance.voice = voice;
                            utterance.onend = () => { chunkIndex++; speakNext(); };
                            utterance.onerror = () => { setIsSpeaking(false); setSpeakingMessageIndex(null); };
                            window.speechSynthesis.speak(utterance);
                          };
                          setIsSpeaking(true);
                          setSpeakingMessageIndex(-99);
                          speakNext();
                        }}
                        data-testid="button-read-notes"
                        className="gap-2"
                      >
                        {isSpeaking && speakingMessageIndex === -99 ? (
                          <><VolumeX className="w-4 h-4" />{t.stopLabel}</>
                        ) : (
                          <><Volume2 className="w-4 h-4" />{t.readAloud}</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
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
                        className="gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        {t.printBtn}
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 pr-4">
                    <div
                      className="text-sm text-white leading-relaxed prose prose-invert prose-sm max-w-none [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:mb-0.5 [&_strong]:text-[#28c9d6] [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-3 [&_blockquote]:text-white/60"
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
              style={{ background: "radial-gradient(circle, rgba(142,124,220,0.45), transparent 70%)" }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 right-0 w-[360px] h-[360px] rounded-full opacity-35 blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(40,201,214,0.4), transparent 70%)" }}
            />
            {(() => {
              const learningStyle = profile?.learningStyle || "mixed";
              const tutorAvatar = TUTOR_AVATARS[learningStyle] || TUTOR_AVATARS.mixed;
              const TutorIcon = tutorAvatar.icon;
              return (
                <div
                  className="relative w-20 h-20 rounded-2xl bg-black flex items-center justify-center mb-6"
                  style={{
                    border: "1.5px solid #8e7cdc",
                    boxShadow: "0 0 0 1px rgba(142,124,220,0.3), 0 0 28px rgba(142,124,220,0.55), inset 0 0 18px rgba(0,0,0,0.6)",
                  }}
                >
                  <TutorIcon className="w-10 h-10" style={{ color: "#8e7cdc", filter: "drop-shadow(0 0 6px #8e7cdc)" }} />
                </div>
              );
            })()}
            <span
              className="relative inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] px-4 py-1.5 rounded-full bg-black mb-4"
              style={{ color: "#28c9d6", border: "1px solid rgba(40,201,214,0.55)", boxShadow: "0 0 14px rgba(40,201,214,0.35)" }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ filter: "drop-shadow(0 0 4px #28c9d6)" }} />
              {t.tutorHeading}
            </span>
            <h1
              className="relative text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.05] mb-3"
              style={{
                background: "linear-gradient(90deg, #ff6a1f, #ffd83a, #28c9d6, #8e7cdc, #e6519c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 22px rgba(142,124,220,0.32))",
              }}
            >
              {t.askMeAnything}
            </h1>
            <p className="relative text-sm sm:text-base text-white max-w-md mb-8">
              {t.introParagraph}
            </p>

            <div className="relative w-full max-w-lg space-y-3">
              {selectedSubject && capsTopics && capsTopics.length > 0 ? (
                <>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: "#ffd83a" }}>
                    {t.topicsHeading}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {capsTopics.map((topic, i) => {
                      const palette = ["#28c9d6", "#4f8cd9", "#8e7cdc", "#b066d6", "#e6519c", "#ffd83a", "#ff8a1f"];
                      const hex = palette[i % palette.length];
                      return (
                        <button
                          key={topic.id}
                          onClick={() => {
                            const subjectName = subjects?.find(s => s.id.toString() === selectedSubject)?.name || "";
                            const topicName = isAf ? topic.nameAfrikaans : topic.name;
                            setInputValue(isAf ? `Verduidelik ${topicName} vir ${subjectName}` : `Explain ${topicName} for ${subjectName}`);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-black transition-none"
                          style={{ color: hex, border: `1px solid ${hex}`, boxShadow: `0 0 10px ${hex}55` }}
                          data-testid={`topic-chip-chat-${topic.id}`}
                        >
                          <BookOpen className="w-3.5 h-3.5" style={{ filter: `drop-shadow(0 0 3px ${hex})` }} />
                          {isAf ? topic.nameAfrikaans : topic.name}
                          {topic.capsWeighting === "high" && <span className="ml-0.5" style={{ color: "#ffd83a" }}>★</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: "#ffd83a" }}>
                    {t.trySuggestions}
                  </p>
                  <div className="grid gap-2">
                    {suggestedQuestions.map((q, i) => {
                      const palette = ["#28c9d6", "#8e7cdc", "#e6519c", "#ffd83a"];
                      const hex = palette[i % palette.length];
                      return (
                        <button
                          key={i}
                          onClick={() => setInputValue(q)}
                          className="text-left flex items-start gap-2 p-3 rounded-xl bg-black text-sm font-medium transition-none"
                          style={{ color: "#fff", border: `1px solid ${hex}`, boxShadow: `0 0 14px ${hex}40, inset 0 0 10px rgba(0,0,0,0.5)` }}
                          data-testid={`suggested-question-${i}`}
                        >
                          <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: hex, filter: `drop-shadow(0 0 4px ${hex})` }} />
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
                const learningStyle = profile?.learningStyle || "mixed";
                const tutorAvatar = TUTOR_AVATARS[learningStyle] || TUTOR_AVATARS.mixed;
                const TutorIcon = tutorAvatar.icon;
                
                return (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div
                        className="w-8 h-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0"
                        style={{ border: "1.5px solid #8e7cdc", boxShadow: "0 0 10px rgba(142,124,220,0.5)" }}
                      >
                        <TutorIcon className="w-4 h-4" style={{ color: "#8e7cdc", filter: "drop-shadow(0 0 3px #8e7cdc)" }} />
                      </div>
                    )}
                    <div className="flex flex-col gap-1 min-w-0 max-w-[calc(100%-44px)] sm:max-w-[80%]">
                      <div
                        className="rounded-2xl px-4 py-3 bg-black"
                        style={msg.role === "user"
                          ? { border: "1.5px solid #28c9d6", boxShadow: "0 0 18px rgba(40,201,214,0.35), inset 0 0 10px rgba(0,0,0,0.6)", color: "#e0fbff" }
                          : { border: "1.5px solid rgba(142,124,220,0.6)", boxShadow: "0 0 18px rgba(142,124,220,0.3), inset 0 0 10px rgba(0,0,0,0.6)" }
                        }
                        data-testid={`message-${msg.role}-${i}`}
                        onContextMenu={msg.role === "assistant" ? e => e.preventDefault() : undefined}
                        data-nosnippet={msg.role === "assistant" ? "" : undefined}
                      >
                        <div className="break-words text-sm leading-relaxed prose prose-invert prose-sm max-w-none [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:mb-0.5 [&_strong]:text-[#28c9d6] [&_p]:mb-1 [&_p:last-child]:mb-0 [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_blockquote]:border-l-2 [&_blockquote]:border-white/20 [&_blockquote]:pl-3 [&_blockquote]:text-white/60">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                      {msg.role === "assistant" && msg.citedExamples && msg.citedExamples.length > 0 && (
                        <div
                          className="mt-2 rounded-xl bg-black px-3 py-2.5"
                          style={{
                            border: "1px solid rgba(255,216,58,0.45)",
                            boxShadow: "0 0 10px rgba(255,216,58,0.18), inset 0 0 8px rgba(0,0,0,0.5)",
                          }}
                          data-testid={`citations-${i}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <BookOpen className="w-3 h-3 shrink-0" style={{ color: "#ffd83a" }} />
                            <span
                              className="text-[10px] font-black uppercase tracking-widest"
                              style={{ color: "#ffd83a" }}
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
                                  style={{ color: "rgba(224,251,255,0.92)" }}
                                  data-testid={`citation-${i}-${ci}`}
                                >
                                  <span className="font-semibold" style={{ color: "#ffd83a" }}>{label}</span>
                                  {quoted ? (
                                    <>
                                      {": "}
                                      <em style={{ color: "rgba(224,251,255,0.85)" }}>“{quoted}”</em>
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
                                style={{ color: "#ffd83a" }}
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
                              className="rounded-xl overflow-hidden bg-black"
                              style={{ border: "1px solid rgba(40,201,214,0.45)", boxShadow: "0 0 12px rgba(40,201,214,0.18), inset 0 0 8px rgba(0,0,0,0.5)" }}
                              data-testid={`diagram-${i}-${di}`}
                            >
                              <div
                                className="px-3 py-1.5 flex items-center gap-2"
                                style={{ borderBottom: "1px solid rgba(40,201,214,0.25)", background: "rgba(40,201,214,0.07)" }}
                              >
                                <BookOpen className="w-3 h-3 shrink-0" style={{ color: "#28c9d6" }} />
                                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: "#28c9d6" }}>
                                  {diagram.label}
                                </span>
                              </div>
                              <pre
                                className="px-3 py-3 text-xs overflow-x-auto leading-snug"
                                style={{ fontFamily: "'Courier New', Courier, monospace", color: "#e0fbff", whiteSpace: "pre", margin: 0 }}
                              >
                                {diagram.ascii}
                              </pre>
                              {diagram.caption && (
                                <div
                                  className="px-3 py-1.5 text-[11px] leading-snug"
                                  style={{ borderTop: "1px solid rgba(40,201,214,0.2)", color: "rgba(224,251,255,0.7)" }}
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
                          <button
                            onClick={() => speakText(msg.content, i)}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                              speakingMessageIndex === i 
                                ? "bg-primary/20 text-primary" 
                                : "text-white hover:text-primary hover:bg-primary/10"
                            }`}
                            data-testid={`button-speak-${i}`}
                          >
                            {speakingMessageIndex === i ? (
                              <>
                                <VolumeX className="w-3 h-3" />
                                <span>{t.stopLabel}</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                <span>{t.readAloud}</span>
                              </>
                            )}
                          </button>

                          {sessionId && !feedbackSubmitted[i] && !pendingFeedback[i] && (
                            <div className="flex items-center gap-1 ml-auto">
                              <button
                                onClick={() => handleFeedback(i, 1)}
                                className="p-1.5 rounded-lg text-white hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                                title={t.helpfulLabel}
                                data-testid={`button-feedback-up-${i}`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleFeedback(i, -1)}
                                className="p-1.5 rounded-lg text-white hover:text-red-500 hover:bg-red-500/10 transition-colors"
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
                                className="resize-none text-xs h-16 bg-black"
                style={{ border: "1px solid rgba(142,124,220,0.3)", color: "#fff" }}
                                data-testid={`textarea-feedback-suggestion-${i}`}
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => submitFeedback(i, false)}
                                  size="sm"
                                  className="text-xs"
                                  disabled={feedbackMutation.isPending}
                                  data-testid={`button-feedback-submit-${i}`}
                                >
                                  {feedbackMutation.isPending ? t.sendingLabel : t.sendLabel}
                                </Button>
                                <button
                                  onClick={() => submitFeedback(i, true)}
                                  className="text-xs text-white hover:bg-white/5 px-1 rounded transition-colors"
                                  disabled={feedbackMutation.isPending}
                                  data-testid={`button-feedback-skip-${i}`}
                                >
                                  {t.skipLabel}
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {feedbackSubmitted[i] && (
                            <span className="ml-auto text-[10px] font-semibold text-white bg-black border border-white/15 px-2 py-0.5 rounded-full">
                              {t.feedbackSent}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div
                        className="w-8 h-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0"
                        style={{ border: "1.5px solid #28c9d6", boxShadow: "0 0 10px rgba(40,201,214,0.5)" }}
                      >
                        <User className="w-4 h-4" style={{ color: "#28c9d6", filter: "drop-shadow(0 0 3px #28c9d6)" }} />
                      </div>
                    )}
                  </div>
                );
              })}
              {askMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  {(() => {
                    const learningStyle = profile?.learningStyle || "mixed";
                    const tutorAvatar = TUTOR_AVATARS[learningStyle] || TUTOR_AVATARS.mixed;
                    const TutorIcon = tutorAvatar.icon;
                    return (
                      <div
                        className="w-8 h-8 rounded-lg bg-black flex items-center justify-center"
                        style={{ border: "1.5px solid #8e7cdc", boxShadow: "0 0 10px rgba(142,124,220,0.5)" }}
                      >
                        <TutorIcon className="w-4 h-4" style={{ color: "#8e7cdc", filter: "drop-shadow(0 0 3px #8e7cdc)" }} />
                      </div>
                    );
                  })()}
                  <div
                    className="rounded-2xl px-4 py-3 bg-black"
                    style={{ border: "1.5px solid rgba(142,124,220,0.6)", boxShadow: "0 0 18px rgba(142,124,220,0.3)" }}
                  >
                    <div className="flex items-center gap-2 text-sm" style={{ color: "#8e7cdc" }}>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t.thinkingLabel}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <div className="pt-4 mt-auto" style={{ borderTop: "1px solid rgba(142,124,220,0.3)" }}>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 shrink-0" style={{ color: "#ffd83a" }} />
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger
                className="w-full sm:w-48 h-8 text-xs bg-black"
                style={{ border: "1px solid rgba(255,216,58,0.4)", color: "#ffd83a" }}
                data-testid="select-subject"
              >
                <SelectValue placeholder={t.selectSubjectBottomPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {filteredSubjects?.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedSubject && capsTopics && capsTopics.length > 0 && messages.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-thin">
              {capsTopics.slice(0, 8).map((topic, i) => {
                const palette = ["#28c9d6", "#4f8cd9", "#8e7cdc", "#b066d6", "#e6519c", "#ffd83a", "#ff8a1f", "#ffb020"];
                const hex = palette[i % palette.length];
                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      const subjectName = subjects?.find(s => s.id.toString() === selectedSubject)?.name || "";
                      const topicName = isAf ? topic.nameAfrikaans : topic.name;
                      setInputValue(isAf ? `Verduidelik ${topicName} vir ${subjectName}` : `Explain ${topicName} for ${subjectName}`);
                    }}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black whitespace-nowrap transition-none flex-shrink-0"
                    style={{ color: hex, border: `1px solid ${hex}`, boxShadow: `0 0 8px ${hex}55` }}
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
              className="min-h-[60px] max-h-32 resize-none bg-black flex-1"
              style={{
                border: "1.5px solid rgba(40,201,214,0.5)",
                boxShadow: "0 0 14px rgba(40,201,214,0.2), inset 0 0 10px rgba(0,0,0,0.5)",
                color: "#fff",
              }}
              disabled={askMutation.isPending}
              data-testid="input-question"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || askMutation.isPending}
              className="shrink-0 w-12 sm:w-auto sm:px-6 rounded-xl bg-black font-black transition-none disabled:opacity-40 flex items-center justify-center"
              style={{ color: "#28c9d6", border: "1.5px solid #28c9d6", boxShadow: "0 0 16px rgba(40,201,214,0.5)" }}
              data-testid="button-send"
            >
              {askMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" style={{ filter: "drop-shadow(0 0 4px #28c9d6)" }} />
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
