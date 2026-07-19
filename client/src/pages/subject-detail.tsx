import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { GraffitiSplats } from "@/components/graffiti-splats";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  ChevronRight,
  LogOut,
  Shield,
  Star,
  Target,
  TrendingUp,
  Award,
  Flame,
  Zap,
  GraduationCap,
  Trophy,
  Clock,
  Sparkles,
  Calendar,
  ExternalLink,
  BarChart2,
  ShieldCheck,
  BookMarked,
  Check,
  Globe,
  FileText,
  Layers,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useMemo, useState, useEffect, useRef } from "react";
import { SubjectBoostPack } from "@/components/performance-packs";
import { AudioLessonPlayer } from "@/components/audio-lesson-player";
import { VoiceNoteRecorder } from "@/components/voice-note-recorder";
import type { Subject, OnboardingResult, UserBadge } from "@shared/schema";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { useLanguage } from "@/lib/language-context";
import { apiRequest, queryClient as qc } from "@/lib/queryClient";
import { isLiteratureSubject, getLiteratureForSubject } from "@/lib/literature-caps";
import { getSubjectLucide, getSubjectHex } from "@/lib/subject-visuals";
import type { LiteratureWork } from "@/lib/literature-caps";
import { useToast } from "@/hooks/use-toast";

const BADGE_INFO: Record<string, { name: string; nameAfrikaans: string; icon: any; color: string }> = {
  streak_3: { name: "3-Day Streak", nameAfrikaans: "3-Dag Reeks", icon: Flame, color: "text-orange-500" },
  streak_7: { name: "7-Day Streak", nameAfrikaans: "7-Dag Reeks", icon: Flame, color: "text-orange-600" },
  streak_14: { name: "14-Day Streak", nameAfrikaans: "14-Dag Reeks", icon: Flame, color: "text-red-500" },
  streak_30: { name: "30-Day Streak", nameAfrikaans: "30-Dag Reeks", icon: Flame, color: "text-red-600" },
  questions_10: { name: "10 Questions", nameAfrikaans: "10 Vrae", icon: Star, color: "text-yellow-500" },
  questions_50: { name: "50 Questions", nameAfrikaans: "50 Vrae", icon: Star, color: "text-yellow-600" },
  questions_100: { name: "100 Questions", nameAfrikaans: "100 Vrae", icon: Zap, color: "text-blue-500" },
  questions_500: { name: "500 Questions", nameAfrikaans: "500 Vrae", icon: Zap, color: "text-blue-600" },
  accuracy_70: { name: "70% Accuracy", nameAfrikaans: "70% Akkuraatheid", icon: Target, color: "text-green-500" },
  accuracy_80: { name: "80% Accuracy", nameAfrikaans: "80% Akkuraatheid", icon: Target, color: "text-green-600" },
  accuracy_90: { name: "90% Accuracy", nameAfrikaans: "90% Akkuraatheid", icon: Trophy, color: "text-cyan-500" },
  subject_mastery: { name: "Subject Master", nameAfrikaans: "Vak Meester", icon: GraduationCap, color: "text-blue-500" },
  exam_complete: { name: "Exam Ready", nameAfrikaans: "Eksamen Gereed", icon: Award, color: "text-emerald-500" },
  first_paper: { name: "First Paper", nameAfrikaans: "Eerste Vraestel", icon: BookOpen, color: "text-cyan-500" },
};

interface TopicMasteryData {
  id: number;
  name: string;
  nameAfrikaans: string | null;
  capsCode: string | null;
  masteryScore: number;
  masteryBand: string;
  questionsAttempted: number;
  questionsCorrect: number;
  totalMarksEarned: number;
  totalMarksAvailable: number;
  consecutiveCorrect: number;
  confidenceLevel: number;
  lastAttemptAt: string | null;
  cardCount?: number;
  hasNotes?: boolean;
  quizQuestionCount?: number;
}

interface SubjectMastery {
  subjectId: number;
  totalMastery: number;
  overallBand: string;
  topics: TopicMasteryData[];
  progress: {
    papersCompleted: number;
    questionsAttempted: number;
    correctAnswers: number;
    accuracy: number;
  };
}

const BAND_HEX: Record<string, string> = {
  star: "#FFE29A",
  green: "#4ADE80",
  amber: "#FFE29A",
  red: "#FFB7E5",
};

function getBandHex(band: string): string {
  return BAND_HEX[band] ?? "#C5B3FF";
}

function getBandColor(_band: string) {
  return "text-foreground";
}

function getBandBg(band: string) {
  const hex = getBandHex(band);
  return `bg-background border`;
}

type CosmicColor = "cyan" | "emerald" | "amber" | "red" | "yellow" | "blue" | "purple" | "pink" | "orange";
const COSMIC_HEX: Record<CosmicColor, string> = {
  cyan: "#6EE7F9",
  emerald: "#4ADE80",
  amber: "#FFE29A",
  red: "#FFB7E5",
  yellow: "#FFE29A",
  blue: "#9FD8FF",
  purple: "#C5B3FF",
  pink: "#FFB7E5",
  orange: "#FFE29A",
};

function CosmicCard({ children, color = "cyan", className = "" }: { children: React.ReactNode; color?: CosmicColor; className?: string }) {
  const hex = COSMIC_HEX[color];
  return (
    <div
      className={`relative rounded-2xl bg-background overflow-hidden ${className}`}
      style={{ border: `1.5px solid ${hex}`, boxShadow: `0 0 18px ${hex}55, inset 0 0 14px rgba(0,0,0,0.55)` }}
    >
      <span aria-hidden className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: hex }} />
      <span aria-hidden className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: hex }} />
      <span aria-hidden className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: hex }} />
      <span aria-hidden className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: hex }} />
      {children}
    </div>
  );
}

function NeonBadge({ children, color = "cyan" }: { children: React.ReactNode; color?: CosmicColor }) {
  const hex = COSMIC_HEX[color];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-background uppercase tracking-[0.18em]"
      style={{ color: hex, border: `1px solid ${hex}`, boxShadow: `0 0 10px ${hex}55` }}
    >
      {children}
    </span>
  );
}

function TopicMediaPanel({
  topicId,
  topicName,
  isAf,
  accentHex,
}: {
  topicId: number;
  topicName: string;
  isAf: boolean;
  accentHex: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div id={`audio-${topicId}`} className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full inline-flex items-center justify-between gap-2 px-4 py-2 rounded-xl bg-background text-sm font-bold transition-all hover:scale-[1.005]"
        style={{
          color: accentHex,
          border: `1.5px solid ${accentHex}`,
        }}
        data-testid={`button-topic-media-${topicId}`}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" />
          {isAf ? "Klank & Stemnotas" : "Audio & Voice Notes"}
        </span>
        <span className="text-[10px]" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <AudioLessonPlayer
            topicId={topicId}
            topicName={topicName}
            language={isAf ? "af" : "en"}
            isAf={isAf}
          />
          <VoiceNoteRecorder topicId={topicId} isAf={isAf} />
        </div>
      )}
    </div>
  );
}

function NeonStat({ hex, icon: Icon, value, label }: { hex: string; icon: any; value: React.ReactNode; label: string }) {
  return (
    <div
      className="relative rounded-2xl bg-background p-4 text-center overflow-hidden"
      style={{ border: `1px solid ${hex}66`, boxShadow: `0 0 16px ${hex}33, inset 0 0 12px ${hex}15` }}
    >
      <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: hex, filter: `drop-shadow(0 0 4px ${hex})` }} />
      <p className="text-2xl font-bold text-foreground tabular-nums" style={{ textShadow: `0 0 10px ${hex}aa` }}>{value}</p>
      <p className="text-[10px] text-foreground mt-0.5 uppercase tracking-[0.14em]">{label}</p>
    </div>
  );
}

// =============================================================================
// Task #428 — Per-Topic Content Drawer (Notes + Practice Cards)
// =============================================================================
type WorkedExampleEntry = {
  question: string;
  steps?: string[];
  solution: string;
  commonErrors?: string[];
};

type DiagramEntry = {
  label: string;
  ascii: string;
  caption: string;
};

type TopicNotesPayload = {
  topicId: number;
  language: string;
  summary: string;
  keyConcepts: string[];
  workedExamples: WorkedExampleEntry[];
  diagrams?: DiagramEntry[];
  available: boolean;
};
type TopicFlashcardsPayload = {
  topicId: number;
  language: string;
  count: number;
  cards: { id: string; front: string; back: string; type: string; orderIndex: number }[];
};

function TopicContentDrawer({
  topicId, topicName, subjectCode, capsCode, isAf, open, onOpenChange,
}: {
  topicId: number;
  topicName: string;
  subjectCode: string;
  capsCode: string | null;
  isAf: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const lang = isAf ? "af" : "en";
  const { data: notes, isLoading: notesLoading } = useQuery<TopicNotesPayload>({
    queryKey: [`/api/topics/${topicId}/notes`, lang],
    queryFn: () => fetch(`/api/topics/${topicId}/notes?lang=${lang}`, { credentials: "include" }).then(r => r.json()),
    enabled: open,
  });
  const { data: deck, isLoading: deckLoading } = useQuery<TopicFlashcardsPayload>({
    queryKey: [`/api/topics/${topicId}/flashcards`, lang],
    queryFn: () => fetch(`/api/topics/${topicId}/flashcards?lang=${lang}`, { credentials: "include" }).then(r => r.json()),
    enabled: open,
  });

  const lsKey = `bt_flashcard_pos_${topicId}`;

  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // Track whether the server-stored position has been hydrated so we don't
  // overwrite the server value with the initial local default during the
  // race between the drawer opening and the GET response landing.
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    hydratedRef.current = false;
    // 1) Optimistic read from localStorage for instant render / offline use.
    let localIdx = 0;
    let localFlp = false;
    try {
      const saved = localStorage.getItem(lsKey);
      if (saved) {
        const { idx, flp } = JSON.parse(saved);
        if (typeof idx === "number") localIdx = idx;
        if (typeof flp === "boolean") localFlp = flp;
      }
    } catch {}
    setCardIdx(localIdx);
    setFlipped(localFlp);

    // 2) Authoritative read from the server (cross-device source of truth).
    const ctrl = new AbortController();
    fetch(`/api/topics/${topicId}/flashcard-position`, {
      credentials: "include",
      signal: ctrl.signal,
    })
      .then(r => (r.ok ? r.json() : null))
      .then((data: { position?: { cardIdx: number; flipped: boolean } | null } | null) => {
        const pos = data?.position;
        if (pos && typeof pos.cardIdx === "number") {
          setCardIdx(pos.cardIdx);
          setFlipped(Boolean(pos.flipped));
        }
        hydratedRef.current = true;
      })
      .catch(() => {
        // Offline / server unreachable — keep localStorage value, allow saves
        // back to local cache.
        hydratedRef.current = true;
      });
    return () => ctrl.abort();
  }, [open, topicId, lsKey]);

  // Persist to localStorage immediately (offline cache) and debounce server save.
  useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem(lsKey, JSON.stringify({ idx: cardIdx, flp: flipped }));
    } catch {}
    if (!hydratedRef.current) return;
    const timer = setTimeout(() => {
      fetch(`/api/topics/${topicId}/flashcard-position`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardIdx, flipped }),
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [cardIdx, flipped, open, lsKey, topicId]);

  const cards = deck?.cards ?? [];

  useEffect(() => {
    if (cards.length > 0 && cardIdx >= cards.length) {
      setCardIdx(cards.length - 1);
    }
  }, [cards.length, cardIdx]);

  const currentCard = cards[cardIdx];

  const deepLinkHref = capsCode
    ? `/flashcards?subject=${encodeURIComponent(subjectCode)}&topic=${encodeURIComponent(capsCode)}&lang=${lang}`
    : `/flashcards?lang=${lang}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background border-cyan-400/40 text-foreground" data-testid={`topic-content-dialog-${topicId}`}>
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: "#6EE7F9" }} />
            {topicName}
          </DialogTitle>
          <DialogDescription className="text-foreground text-xs">
            {isAf
              ? "CAPS-belynde notas en oefenkaarte vir hierdie onderwerp."
              : "CAPS-aligned notes and practice cards for this topic."}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="notes" className="mt-2">
          <TabsList className="grid grid-cols-2 bg-background border border-white/10">
            <TabsTrigger value="notes" data-testid="tab-topic-notes">
              <FileText className="w-4 h-4 mr-1.5" />{isAf ? "Notas" : "Notes"}
            </TabsTrigger>
            <TabsTrigger value="cards" data-testid="tab-topic-cards">
              <Layers className="w-4 h-4 mr-1.5" />{isAf ? "Kaarte" : "Cards"}
              {cards.length > 0 && <span className="ml-1.5 text-[10px] opacity-70">({cards.length})</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-4 max-h-[55vh] overflow-y-auto">
            {notesLoading ? (
              <div className="space-y-2"><Skeleton className="h-4" /><Skeleton className="h-4 w-2/3" /></div>
            ) : !notes || !notes.available ? (
              <p className="text-sm text-foreground py-4 text-center">
                {isAf ? "Notas vir hierdie onderwerp word nog voorberei." : "Notes for this topic are still being prepared."}
              </p>
            ) : (
              <div className="space-y-4">
                {/* Audio lesson — sits at the top of the Notes tab so learners can
                    listen to a spoken version of the same material. */}
                <AudioLessonPlayer
                  topicId={topicId}
                  topicName={topicName}
                  language={lang}
                  isAf={isAf}
                />
                <p className="text-sm text-foreground leading-relaxed" data-testid="topic-notes-summary">{notes.summary}</p>
                {notes.keyConcepts.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300 mb-2">
                      {isAf ? "Sleutelkonsepte" : "Key Concepts"}
                    </p>
                    <ul className="space-y-1.5">
                      {notes.keyConcepts.map((c, i) => (
                        <li key={i} className="text-xs text-foreground flex gap-2" data-testid={`topic-concept-${i}`}>
                          <span className="text-cyan-400">▸</span><span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {notes.workedExamples.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300 mb-2">
                      {isAf ? "Uitgewerkte Voorbeelde" : "Worked Examples"}
                    </p>
                    <div className="space-y-3">
                    {notes.workedExamples.map((ex, i) => (
                      <div key={i} className="rounded-xl bg-white/5 p-3 border border-white/10 space-y-2" data-testid={`topic-example-${i}`}>
                        <p className="text-xs font-semibold text-cyan-200">
                          <span className="text-cyan-400">{isAf ? "V" : "Q"}{i + 1}:</span> {ex.question}
                        </p>
                        {ex.steps && ex.steps.length > 0 && (
                          <div className="space-y-1 pl-2 border-l border-white/20">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                              {isAf ? "Stappe" : "Steps"}
                            </p>
                            {ex.steps.map((step, si) => (
                              <p key={si} className="text-xs text-foreground flex gap-1.5">
                                <span className="text-purple-400 shrink-0">{si + 1}.</span>
                                <span>{step}</span>
                              </p>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-foreground flex gap-1.5">
                          <span className="font-bold text-cyan-300 shrink-0">{isAf ? "Ant:" : "Ans:"}</span>
                          <span>{ex.solution}</span>
                        </p>
                        {ex.commonErrors && ex.commonErrors.length > 0 && (
                          <div className="rounded-lg bg-red-950/40 border border-red-700/30 p-2 space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                              {isAf ? "Algemene Foute" : "Common Errors"}
                            </p>
                            {ex.commonErrors.map((err, ei) => (
                              <p key={ei} className="text-xs text-red-200/80 flex gap-1.5">
                                <span className="text-red-400 shrink-0">⚠</span>
                                <span>{err}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    </div>
                  </div>
                )}
                {notes.diagrams && notes.diagrams.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300 mb-2">
                      {isAf ? "Diagramme" : "Diagrams"}
                    </p>
                    <div className="space-y-3">
                      {notes.diagrams.map((diagram, di) => (
                        <div key={di} className="rounded-xl bg-white/5 border border-cyan-400/20 overflow-hidden" data-testid={`topic-diagram-${di}`}>
                          <div className="px-3 pt-2.5 pb-1 border-b border-white/10">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">
                              {diagram.label}
                            </p>
                          </div>
                          <pre
                            className="px-3 py-2.5 text-[11px] leading-snug text-emerald-200 font-mono overflow-x-auto whitespace-pre"
                            style={{ background: "rgba(0,255,180,0.03)" }}
                          >
                            {diagram.ascii}
                          </pre>
                          {diagram.caption && (
                            <div className="px-3 pb-2.5 pt-1 border-t border-white/10">
                              <p className="text-[11px] text-foreground leading-relaxed">
                                <span className="text-cyan-400 mr-1">→</span>
                                {diagram.caption}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cards" className="mt-4">
            {deckLoading ? (
              <Skeleton className="h-40" />
            ) : cards.length === 0 ? (
              <p className="text-sm text-foreground py-6 text-center">
                {isAf ? "Geen kaarte nog beskikbaar nie." : "No cards available yet."}
              </p>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setFlipped(f => !f)}
                  className="w-full min-h-[180px] rounded-2xl bg-background border border-cyan-400/40 p-5 text-left transition-all hover:border-cyan-400/80"
                  data-testid="topic-flashcard-face"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300 mb-2">
                    {flipped ? (isAf ? "Antwoord" : "Answer") : (isAf ? "Vraag" : "Question")}
                    <span className="ml-2 text-foreground">{cardIdx + 1} / {cards.length}</span>
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-line">{flipped ? currentCard?.back : currentCard?.front}</p>
                  <p className="text-[10px] text-foreground mt-3">
                    {isAf ? "Klik om te draai" : "Click to flip"}
                  </p>
                </button>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-background text-sm font-bold disabled:opacity-40"
                    style={{ color: "#6EE7F9", border: "1.5px solid #6EE7F9" }}
                    onClick={() => { setCardIdx(i => Math.max(0, i - 1)); setFlipped(false); }}
                    disabled={cardIdx === 0}
                    data-testid="button-card-prev"
                  >← {isAf ? "Vorige" : "Prev"}</button>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-background text-sm font-bold"
                    style={{ color: "#C5B3FF", border: "1.5px solid #C5B3FF" }}
                    onClick={() => {
                      try { localStorage.removeItem(lsKey); } catch {}
                      // Suppress the next debounced POST so the reset state
                      // {0,false} does NOT immediately recreate the row we
                      // just deleted. hydratedRef is re-enabled once the
                      // DELETE settles, so any subsequent card navigation in
                      // this same drawer session continues to sync.
                      hydratedRef.current = false;
                      const reenable = () => { hydratedRef.current = true; };
                      fetch(`/api/topics/${topicId}/flashcard-position`, {
                        method: "DELETE",
                        credentials: "include",
                      }).then(reenable, reenable);
                      setCardIdx(0);
                      setFlipped(false);
                    }}
                    data-testid="button-card-reset"
                  ><RotateCcw className="w-3 h-3 mr-1" />{isAf ? "Van Voor Af" : "Start Over"}</button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-background text-sm font-bold disabled:opacity-40"
                    style={{ color: "#6EE7F9", border: "1.5px solid #6EE7F9" }}
                    onClick={() => { setCardIdx(i => Math.min(cards.length - 1, i + 1)); setFlipped(false); }}
                    disabled={cardIdx >= cards.length - 1}
                    data-testid="button-card-next"
                  >{isAf ? "Volgende" : "Next"} →</button>
                </div>
                <Link href={deepLinkHref}>
                  <button
                    className="w-full px-4 py-2 rounded-xl bg-background text-sm font-bold transition-all hover:scale-[1.02]"
                    style={{ color: "#6EE7F9", border: "1.5px solid #6EE7F9" }}
                    data-testid="button-open-flashcards-page"
                  >
                    {isAf ? "Begin volle hersieningssessie →" : "Start full review session →"}
                  </button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// Task #428 — Literature Work Detail Dialog
// =============================================================================
type LiteratureWorkApi = {
  id: number;
  externalId: string;
  title: string;
  titleAfrikaans: string | null;
  author: string;
  workType: string;
};
type LiteratureNotesPayload = {
  work: { id: number; title: string; author: string; workType: string };
  language: string;
  summary: string;
  themes: string[];
  characters: { name: string; description: string }[];
  literaryDevices: { name: string; explanation: string }[];
  essayFrameworks: { prompt: string; outline: string[] }[];
  available: boolean;
};

function LiteratureWorkDialog({
  workId, workTitle, isAf, open, onOpenChange,
}: {
  workId: number | null;
  workTitle: string;
  isAf: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const lang = isAf ? "af" : "en";
  const { data, isLoading } = useQuery<LiteratureNotesPayload>({
    queryKey: [`/api/literature-works/${workId}/notes`, lang],
    queryFn: () => fetch(`/api/literature-works/${workId}/notes?lang=${lang}`, { credentials: "include" }).then(r => r.json()),
    enabled: open && !!workId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background border-cyan-400/40 text-foreground" data-testid={`literature-dialog-${workId}`}>
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <BookMarked className="w-5 h-5" style={{ color: "#6EE7F9" }} />
            {workTitle}
          </DialogTitle>
          <DialogDescription className="text-foreground text-xs">
            {data?.work.author && <span>{data.work.author} · </span>}
            {isAf ? "Voorgeskrewe werk · CAPS notas" : "Prescribed work · CAPS notes"}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-2"><Skeleton className="h-4" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-32" /></div>
        ) : !data ? (
          <p className="text-sm text-foreground py-4 text-center">
            {isAf ? "Notas onbeskikbaar." : "Notes unavailable."}
          </p>
        ) : (
          <Tabs defaultValue="overview" className="mt-2">
            <TabsList className="grid grid-cols-4 bg-background border border-white/10">
              <TabsTrigger value="overview" data-testid="tab-lit-overview">{isAf ? "Oorsig" : "Overview"}</TabsTrigger>
              <TabsTrigger value="characters" data-testid="tab-lit-characters">{isAf ? "Karakters" : "Characters"}</TabsTrigger>
              <TabsTrigger value="devices" data-testid="tab-lit-devices">{isAf ? "Tegnieke" : "Devices"}</TabsTrigger>
              <TabsTrigger value="essays" data-testid="tab-lit-essays">{isAf ? "Opstelle" : "Essays"}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 max-h-[55vh] overflow-y-auto space-y-4">
              <p className="text-sm text-foreground leading-relaxed" data-testid="lit-summary">{data.summary}</p>
              {data.themes.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300 mb-2">
                    {isAf ? "Temas" : "Themes"}
                  </p>
                  <ul className="space-y-1.5">
                    {data.themes.map((t, i) => (
                      <li key={i} className="text-xs text-foreground flex gap-2"><span className="text-cyan-400">▸</span><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="characters" className="mt-4 max-h-[55vh] overflow-y-auto space-y-3">
              {data.characters.length === 0 ? (
                <p className="text-sm text-foreground py-4 text-center">{isAf ? "Karakters word nog voorberei." : "Characters being prepared."}</p>
              ) : data.characters.map((c, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3" data-testid={`lit-character-${i}`}>
                  <p className="text-sm font-bold text-cyan-300">{c.name}</p>
                  <p className="text-xs text-foreground mt-1">{c.description}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="devices" className="mt-4 max-h-[55vh] overflow-y-auto space-y-3">
              {data.literaryDevices.length === 0 ? (
                <p className="text-sm text-foreground py-4 text-center">{isAf ? "Tegnieke word nog voorberei." : "Literary devices being prepared."}</p>
              ) : data.literaryDevices.map((d, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3" data-testid={`lit-device-${i}`}>
                  <p className="text-sm font-bold text-cyan-300">{d.name}</p>
                  <p className="text-xs text-foreground mt-1">{d.explanation}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="essays" className="mt-4 max-h-[55vh] overflow-y-auto space-y-4">
              {data.essayFrameworks.length === 0 ? (
                <p className="text-sm text-foreground py-4 text-center">{isAf ? "Opsteleraamwerke kom binnekort." : "Essay frameworks coming soon."}</p>
              ) : data.essayFrameworks.map((e, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3" data-testid={`lit-essay-${i}`}>
                  <p className="text-sm font-bold text-foreground">"{e.prompt}"</p>
                  <ul className="mt-2 space-y-1">
                    {e.outline.map((step, j) => (
                      <li key={j} className="text-xs text-foreground flex gap-2"><span className="text-cyan-400">{j + 1}.</span><span>{step}</span></li>
                    ))}
                  </ul>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getBandLabel(band: string, isAf: boolean) {
  switch (band) {
    case "star":  return isAf ? "Ster" : "Star";
    case "green": return isAf ? "Op Koers" : "Locked In";
    case "amber": return isAf ? "Bou" : "Building";
    default:      return isAf ? "Inhaal" : "Catch Up";
  }
}

function getBandIcon(band: string) {
  switch (band) {
    case "star":  return <Trophy className="w-4 h-4" style={{ color: "#FFE29A" }} />;
    case "green": return <ShieldCheck className="w-4 h-4" style={{ color: "#4ADE80" }} />;
    case "amber": return <BarChart2 className="w-4 h-4" style={{ color: "#FFE29A" }} />;
    default:      return <BookOpen className="w-4 h-4" style={{ color: "#FFB7E5" }} />;
  }
}

function getProgressColor(band: string) {
  switch (band) {
    case "star":  return "[&>div]:bg-[#FFE29A]";
    case "green": return "[&>div]:bg-[#4ADE80]";
    case "amber": return "[&>div]:bg-[#FFE29A]";
    default:      return "[&>div]:bg-[#FFB7E5]";
  }
}

const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_AF = ["Ma", "Di", "Wo", "Do", "Vr", "Sa", "So"];

function generatePersonalizedPlan(topics: TopicMasteryData[], subjectName: string, isAf: boolean) {
  const weakTopics = topics
    .filter(t => t.masteryBand === "red" || t.masteryBand === "amber")
    .sort((a, b) => a.masteryScore - b.masteryScore);

  const strongTopics = topics
    .filter(t => t.masteryBand === "green" || t.masteryBand === "star");

  const days = isAf ? DAYS_AF : DAYS_EN;
  const plan: { day: string; task: string; focus: string; duration: number; priority: string }[] = [];

  if (weakTopics.length === 0 && strongTopics.length === 0) {
    plan.push({ day: days[0], task: isAf ? "Begin met Eksamentyd oefeneksamen" : "Start with Crunch Time mock exam", focus: subjectName, duration: 30, priority: "medium" });
    plan.push({ day: days[2], task: isAf ? "Rizz sessie" : "Rizz session", focus: subjectName, duration: 20, priority: "medium" });
    plan.push({ day: days[4], task: isAf ? "Hersien kernonderwerpe" : "Review core topics", focus: subjectName, duration: 25, priority: "medium" });
    return plan;
  }

  if (weakTopics.length > 0) {
    const t1 = weakTopics[0];
    plan.push({
      day: days[0],
      task: isAf ? `Fokus: ${t1.nameAfrikaans || t1.name} (${t1.masteryScore}%)` : `Focus: ${t1.name} (${t1.masteryScore}%)`,
      focus: isAf ? "Swakste onderwerp - doen 20 MCQ's" : "Weakest topic - do 20 MCQs",
      duration: 15,
      priority: "high",
    });
  }

  if (weakTopics.length > 1) {
    const t2 = weakTopics[1];
    plan.push({
      day: days[1],
      task: isAf ? `Fokus: ${t2.nameAfrikaans || t2.name} (${t2.masteryScore}%)` : `Focus: ${t2.name} (${t2.masteryScore}%)`,
      focus: isAf ? "Gevallestudie oefening" : "Case study practice",
      duration: 25,
      priority: "high",
    });
  }

  plan.push({
    day: days[2],
    task: isAf ? "Gemengde oefening - alle onderwerpe" : "Mixed practice - all topics",
    focus: isAf ? "Tydsgebonde gemengde oefening (40 punte)" : "Timed mixed practice (40 marks)",
    duration: 25,
    priority: "medium",
  });

  if (weakTopics.length > 2) {
    const t3 = weakTopics[2];
    plan.push({
      day: days[3],
      task: isAf ? `Fokus: ${t3.nameAfrikaans || t3.name} (${t3.masteryScore}%)` : `Focus: ${t3.name} (${t3.masteryScore}%)`,
      focus: isAf ? "Opstelstruktuuroefening" : "Essay structure practice",
      duration: 20,
      priority: "high",
    });
  }

  plan.push({
    day: days[4],
    task: isAf ? "Mini-proefeksamen" : "Mini mock exam",
    focus: isAf ? "Eksamentyd - 80 punte proefeksamen" : "Crunch Time - 80 mark mock exam",
    duration: 55,
    priority: "medium",
  });

  if (strongTopics.length > 0) {
    plan.push({
      day: days[5],
      task: isAf ? "Hersien sterk onderwerpe" : "Review strong topics",
      focus: isAf ? "Handhaaf bemeestering - vinnige hersiening" : "Maintain mastery - quick revision",
      duration: 15,
      priority: "low",
    });
  }

  return plan;
}

function TopicQuizDrawer({
  subjectId, subjectName, topicName, isAf, open, onOpenChange,
}: {
  subjectId: number;
  subjectName: string;
  topicName: string;
  isAf: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl bg-background border-[#6EE7F9]/40 text-foreground overflow-y-auto max-h-[90vh]"
        data-testid="topic-quiz-drawer"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: "#6EE7F9" }} />
            {isAf ? "Kwis" : "Quiz"}: {topicName}
          </DialogTitle>
          <DialogDescription className="text-foreground text-xs">
            {isAf
              ? `KABV-vrae gefokus op ${topicName} vir ${subjectName}.`
              : `CAPS questions focused on ${topicName} for ${subjectName}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <SubjectBoostPack
            subjectId={subjectId}
            subjectName={subjectName}
            isAf={isAf}
            topicFocus={topicName}
            autoStart
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();

  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";

  const { data: subject, isLoading: subjectLoading } = useQuery<Subject>({
    queryKey: ["/api/subjects", id],
  });

  const { data: mastery, isLoading: masteryLoading } = useQuery<SubjectMastery>({
    queryKey: ["/api/subjects", id, "mastery", language],
    queryFn: () => fetch(`/api/subjects/${id}/mastery?lang=${language}`, { credentials: "include" }).then(r => { if (!r.ok) throw new Error(`mastery fetch failed: ${r.status}`); return r.json(); }),
  });

  const { data: profile } = useQuery<OnboardingResult>({
    queryKey: ["/api/user/onboarding"],
  });

  const { data: badges } = useQuery<UserBadge[]>({
    queryKey: ["/api/user/badges"],
  });

  const { toast } = useToast();
  const litQC = useQueryClient();

  const { data: literatureData } = useQuery<Record<string, Record<string, string>>>({
    queryKey: ["/api/user/literature"],
    enabled: !!subject && isLiteratureSubject(subject.code ?? ""),
  });

  const subjectCode = subject?.code ?? "";
  const savedSelections: Record<string, string> = (literatureData?.[subjectCode] as any) ?? {};

  const [litSelections, setLitSelections] = useState<Record<string, string>>(savedSelections);
  const [litSaved, setLitSaved] = useState(false);
  const [recommendedTopicFocus, setRecommendedTopicFocus] = useState<string | null>(null);

  // Task #428 — drawer state for per-topic notes/cards and literature work detail
  const [topicDrawer, setTopicDrawer] = useState<{ id: number; name: string; capsCode: string | null } | null>(null);
  // Task #758 — Smart Tutor cited-example deep link: open ?topic=N automatically
  // once mastery has loaded so the named topic's notes drawer appears.
  const searchParamsRaw = useSearch();
  const deepLinkTopicId = (() => {
    const sp = new URLSearchParams(searchParamsRaw);
    const raw = sp.get("topic");
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  })();
  const deepLinkAppliedRef = useRef(false);
  // Task #740 — bump on drawer close (and storage events) to re-read saved
  // flashcard positions from localStorage for the "Ready to Study" chips.
  const [flashcardPosBump, setFlashcardPosBump] = useState(0);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith("bt_flashcard_pos_")) {
        setFlashcardPosBump(b => b + 1);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const readSavedFlashcardIdx = (topicId: number): number | null => {
    try {
      const raw = localStorage.getItem(`bt_flashcard_pos_${topicId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const rawIdx = parsed?.idx;
      if (typeof rawIdx !== "number" || !Number.isFinite(rawIdx)) return null;
      const idx = Math.floor(rawIdx);
      if (idx < 0) return null;
      return idx;
    } catch {
      return null;
    }
  };
  // Task #740 — `freshnessKey` is the `flashcardPosBump` value. It isn't read
  // inside the function body; it exists only to thread the reactive
  // dependency through React's render so callers that bump the key force a
  // fresh localStorage scan.
  const buildSavedFlashcardIdxMap = (
    topics: { id: number; cardCount?: number | null }[],
    _freshnessKey: number,
  ): Map<number, number> => {
    const map = new Map<number, number>();
    for (const t of topics) {
      if ((t.cardCount ?? 0) <= 0) continue;
      const idx = readSavedFlashcardIdx(t.id);
      if (idx !== null) map.set(t.id, idx);
    }
    return map;
  };
  const [litWorkDialog, setLitWorkDialog] = useState<{ id: number; title: string } | null>(null);

  // Task #532 — inline quiz drawer state
  const [quizTopicDrawer, setQuizTopicDrawer] = useState<{ id: number; name: string; subjectId: number; subjectName: string } | null>(null);

  // Task #428 — fetch literature works (DB rows) so we can link CAPS externalIds → DB ids.
  const { data: literatureWorksApi } = useQuery<{ subjectId: number; works: LiteratureWorkApi[] }>({
    queryKey: ["/api/subjects", subject?.id, "literature"],
    queryFn: () => fetch(`/api/subjects/${subject!.id}/literature`, { credentials: "include" }).then(r => r.json()),
    enabled: !!subject && isLiteratureSubject(subject.code ?? ""),
  });
  const litWorksByExternalId = useMemo(() => {
    const map = new Map<string, LiteratureWorkApi>();
    for (const w of literatureWorksApi?.works ?? []) map.set(w.externalId, w);
    return map;
  }, [literatureWorksApi]);

  useEffect(() => {
    if (literatureData && subjectCode) {
      setLitSelections((literatureData[subjectCode] as any) ?? {});
    }
  }, [literatureData, subjectCode]);

  // Task #758 — once mastery has loaded, auto-open the topic drawer named
  // by the ?topic=<id> query param (used by Smart Tutor study-note citations).
  useEffect(() => {
    if (deepLinkAppliedRef.current) return;
    if (!deepLinkTopicId || !mastery) return;
    const match = mastery.topics.find((t) => t.id === deepLinkTopicId);
    if (!match) return;
    deepLinkAppliedRef.current = true;
    setTopicDrawer({ id: match.id, name: match.name, capsCode: match.capsCode });
  }, [deepLinkTopicId, mastery]);

  const saveLitMutation = useMutation({
    mutationFn: (selections: Record<string, string>) =>
      apiRequest("PATCH", "/api/user/literature", { subjectCode, selections }),
    onSuccess: () => {
      litQC.invalidateQueries({ queryKey: ["/api/user/literature"] });
      setLitSaved(true);
      setTimeout(() => setLitSaved(false), 2500);
      toast({ title: isAf ? "Gered!" : "Saved!", description: isAf ? "Jou literatuurkeuses is gestoor." : "Your literature selections have been saved." });
    },
  });
  const isBST = subject?.code === "BUS";

  const targetScore = 70;
  const currentScore = mastery?.totalMastery ?? 0;
  const scoreDiff = currentScore - targetScore;

  const readinessScore = useMemo(() => {
    if (!mastery) return 0;
    const accuracyWeight = mastery.progress.accuracy * 0.4;
    const masteryWeight = mastery.totalMastery * 0.4;
    const activityWeight = Math.min(100, mastery.progress.questionsAttempted * 2) * 0.2;
    return Math.round(accuracyWeight + masteryWeight + activityWeight);
  }, [mastery]);

  const personalizedPlan = useMemo(() => {
    if (!mastery || !subject) return [];
    return generatePersonalizedPlan(mastery.topics, subject.name, isAf);
  }, [mastery, subject, isAf]);

  const loading = subjectLoading || masteryLoading;

  const pageSessionIdRef = useRef<number | null>(null);
  const pageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRunIdRef = useRef<symbol | null>(null);

  useEffect(() => {
    const thisRun = Symbol();
    pageRunIdRef.current = thisRun;
    if (!id) return;
    const subjectIdNum = parseInt(id);
    pageTimerRef.current = setTimeout(() => {
      if (pageRunIdRef.current !== thisRun) return;
      apiRequest("POST", "/api/study-sessions/start", { subjectId: subjectIdNum, context: "subject_page" })
        .then(r => r.json())
        .then((s: { sessionId: number }) => {
          if (pageRunIdRef.current !== thisRun) {
            apiRequest("PATCH", `/api/study-sessions/${s.sessionId}/end`, {}).catch(() => {});
            return;
          }
          pageSessionIdRef.current = s.sessionId;
        })
        .catch(() => {});
    }, 30000);
    return () => {
      pageRunIdRef.current = null;
      if (pageTimerRef.current) {
        clearTimeout(pageTimerRef.current);
        pageTimerRef.current = null;
      }
      if (pageSessionIdRef.current !== null) {
        const invalidateProgress = () => {
          qc.invalidateQueries({ queryKey: ["/api/learner/readiness"] });
          qc.invalidateQueries({ queryKey: ["/api/learner/goals"] });
        };
        apiRequest("PATCH", `/api/study-sessions/${pageSessionIdRef.current}/end`, {})
          .then(invalidateProgress)
          .catch(invalidateProgress);
        pageSessionIdRef.current = null;
      }
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <GraffitiSplats variant="corner" opacity={0.3} />
      <header className="sticky top-0 z-50 bg-background/95 relative" style={{ borderBottom: "2px solid rgba(110,231,249,0.5)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-xl gradient-text hidden sm:inline">{isAf ? "Klaskamer" : "Classroom"}</span>
            </div>
            <nav className="flex items-center gap-1.5 flex-wrap">
              <Link href="/dashboard">
                <button className="px-4 py-2 rounded-xl bg-background text-sm font-bold" style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }} data-testid="link-home">
                  {isAf ? "Dashboard" : "Dashboard"}
                </button>
              </Link>
              <Link href="/exam-mode">
                <button className="px-4 py-2 rounded-xl bg-background text-sm font-bold" style={{ color: "#FFE29A", border: "1.5px solid #FFE29A" }} data-testid="link-crunch-time">{isAf ? "Eksamentyd" : "Crunch Time"}</button>
              </Link>
              <Link href="/flashcards">
                <button className="px-4 py-2 rounded-xl bg-background text-sm font-bold" style={{ color: "#94F7C5", border: "1.5px solid #94F7C5" }} data-testid="link-flashcards">
                  {isAf ? "Flitskaarte" : "Flashcards"}
                </button>
              </Link>
              <button onClick={toggleLanguage} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-background text-sm font-bold transition-colors" style={{ color: "#C5B3FF", border: "1.5px solid #C5B3FF" }} data-testid="button-language-toggle">
                <Globe className="h-4 w-4" />
                <span>{language === "en" ? "EN" : "AF"}</span>
              </button>
              <button onClick={() => logout()} data-testid="button-logout" className="inline-flex items-center px-4 py-2 rounded-xl bg-background text-sm font-bold" style={{ color: "#FFB7E5", border: "1.5px solid #FFB7E5" }}>
                <LogOut className="w-4 h-4 mr-1" />
                {isAf ? "Uitteken" : "Sign Out"}
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        <div className="space-y-6">
          <Link href="/subjects">
            <button data-testid="button-back" className="inline-flex items-center px-4 py-2 rounded-xl bg-background text-sm font-bold" style={{ color: "#6EE7F9", border: "1.5px solid #6EE7F9" }}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              {isAf ? "Alle Vakke" : "All Subjects"}
            </button>
          </Link>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-background p-6 sm:p-8">
              <div className="flex items-center gap-5">
                <Skeleton className="w-20 h-20 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          ) : subject ? (() => {
            const hex = getSubjectHex(subject.code || subject.name);
            const Icon = getSubjectLucide(subject.name);
            const masteryHex = mastery ? getBandHex(mastery.overallBand) : hex;
            return (
              <div
                className="relative overflow-hidden rounded-3xl border bg-background p-6 sm:p-8"
                style={{
                  borderColor: `${hex}44`,
                  boxShadow: `0 0 40px ${hex}22, inset 0 0 60px ${hex}08`,
                }}
                data-testid="subject-hero"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30"
                  style={{ background: `radial-gradient(circle, ${hex}, transparent 70%)` }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-32 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20"
                  style={{ background: `radial-gradient(circle, ${masteryHex}, transparent 70%)` }}
                />

                <div className="relative flex items-start gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
                  <div
                    className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center bg-background"
                    style={{
                      border: `1.5px solid ${hex}`,
                      boxShadow: `0 0 24px ${hex}66, inset 0 0 20px ${hex}22`,
                    }}
                  >
                    <Icon
                      className="w-8 h-8 sm:w-10 sm:h-10"
                      style={{ color: hex, filter: `drop-shadow(0 0 8px ${hex})` }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-background"
                        style={{ color: hex, border: `1px solid ${hex}55` }}
                      >
                        {subject.code}
                      </span>
                      <span className="text-[11px] text-foreground uppercase tracking-[0.14em]">
                        {isAf ? "Graad 12 NSS" : "Grade 12 NSC"}
                      </span>
                    </div>
                    <h1
                      className="text-3xl sm:text-4xl font-black leading-tight text-foreground truncate"
                      data-testid="text-subject-name"
                      style={{ textShadow: `0 0 24px ${hex}55` }}
                    >
                      {isAf ? subject.nameAfrikaans || subject.name : subject.name}
                    </h1>
                    {subject.nameAfrikaans && subject.nameAfrikaans !== subject.name && (
                      <p className="text-sm text-foreground mt-1" data-testid="text-subject-code">
                        {isAf ? subject.name : subject.nameAfrikaans}
                      </p>
                    )}
                  </div>

                  {mastery && (
                    <div
                      className="shrink-0 flex flex-col items-center justify-center gap-0.5 px-5 py-3 rounded-2xl bg-background"
                      style={{
                        border: `1.5px solid ${masteryHex}`,
                        boxShadow: `0 0 20px ${masteryHex}66`,
                      }}
                      data-testid="badge-overall-mastery"
                    >
                      <div className="flex items-center gap-1.5">
                        {getBandIcon(mastery.overallBand)}
                        <span
                          className="font-black text-2xl text-foreground tabular-nums leading-none"
                          style={{ textShadow: `0 0 10px ${masteryHex}aa` }}
                        >
                          {mastery.totalMastery}%
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.16em]"
                        style={{ color: masteryHex }}
                      >
                        {getBandLabel(mastery.overallBand, isAf)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })() : (
            <div className="rounded-3xl border border-white/10 bg-background p-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
                {isAf ? "Vak Nie Gevind" : "Subject Not Found"}
              </h1>
            </div>
          )}

          {subject && (() => {
            const weakestTopicForShortcut = mastery && mastery.topics.length > 0
              ? [...mastery.topics].sort((a, b) => a.masteryScore - b.masteryScore)[0]
              : null;
            const weakestTopicLabel = weakestTopicForShortcut
              ? (isAf ? (weakestTopicForShortcut.nameAfrikaans || weakestTopicForShortcut.name) : weakestTopicForShortcut.name)
              : null;
            const miniMockHref = weakestTopicForShortcut
              ? `/exam/mini-mock?subject=${encodeURIComponent(subject.name)}&topic=${encodeURIComponent(weakestTopicForShortcut.name)}`
              : `/exam/mini-mock?subject=${encodeURIComponent(subject.name)}`;
            return (
            <div className="grid gap-3 sm:grid-cols-2" data-testid="exam-shortcuts">
              <Link href={miniMockHref}>
                <button
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-background text-left transition-all hover:scale-[1.01]"
                  style={{ border: "1.5px solid #FFE29A" }}
                  data-testid="button-mini-mock-shortcut"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5" style={{ color: "#FFE29A", filter: "drop-shadow(0 0 4px #FFE29A)" }} />
                    <div>
                      <p className="font-black text-sm text-foreground uppercase tracking-[0.14em]">
                        {isAf ? "Mini Mock" : "Mini Mock"}
                      </p>
                      <p className="text-[11px] text-foreground" data-testid="text-mini-mock-shortcut-subtitle">
                        {weakestTopicLabel
                          ? (isAf
                            ? `Fokus op swakste onderwerp: ${weakestTopicLabel}`
                            : `Focus on weakest topic: ${weakestTopicLabel}`)
                          : (isAf ? "Vinnige memo-gemerkte oefening" : "Quick memo-marked practice")}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: "#FFE29A" }} />
                </button>
              </Link>
              <Link href={`/exam/full?subject=${encodeURIComponent(subject.name)}`}>
                <button
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-background text-left transition-all hover:scale-[1.01]"
                  style={{ border: "1.5px solid #C5B3FF" }}
                  data-testid="button-full-exam-shortcut"
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5" style={{ color: "#C5B3FF", filter: "drop-shadow(0 0 4px #C5B3FF)" }} />
                    <div>
                      <p className="font-black text-sm text-foreground uppercase tracking-[0.14em]">
                        {isAf ? "Volle Eksamen" : "Full Exam"}
                      </p>
                      <p className="text-[11px] text-foreground">
                        {isAf ? "Volledige DBE vraestel — getyd" : "Full DBE paper — timed"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: "#C5B3FF" }} />
                </button>
              </Link>
            </div>
            );
          })()}

          {mastery && (() => {
            const BAND_PRIORITY: Record<string, number> = { red: 0, amber: 1, green: 2, star: 3 };
            const readyTopics = [...mastery.topics]
              .filter(t => (t.cardCount ?? 0) > 0 || t.hasNotes)
              .sort((a, b) => {
                const pa = BAND_PRIORITY[a.masteryBand] ?? 2;
                const pb = BAND_PRIORITY[b.masteryBand] ?? 2;
                if (pa !== pb) return pa - pb;
                return a.masteryScore - b.masteryScore;
              })
              .slice(0, 4);
            if (readyTopics.length === 0) return null;
            const priorityBands = new Set(["red", "amber"]);
            // Task #740 — build a map of saved flashcard positions for the
            // visible chips. Passing `flashcardPosBump` as the freshness key
            // makes drawer-close and cross-tab storage events trigger a
            // fresh re-read on the next render.
            const savedFlashcardIdxByTopic = buildSavedFlashcardIdxMap(
              readyTopics,
              flashcardPosBump,
            );
            return (
              <div data-testid="ready-to-study-strip">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: "#6EE7F9" }}>
                  {isAf ? "Gereed om te studeer" : "Ready to Study"}
                </p>
                <div
                  className="flex gap-2 overflow-x-auto pb-1"
                  style={{ scrollbarWidth: "none" }}
                  data-testid="ready-to-study-chips"
                >
                  {readyTopics.map((topic, idx) => {
                    const cards = topic.cardCount ?? 0;
                    const label = isAf ? (topic.nameAfrikaans || topic.name) : topic.name;
                    const sublabel = [
                      `${cards} ${isAf ? "kaarte" : "cards"}`,
                      topic.hasNotes ? (isAf ? "notas" : "notes") : null,
                    ].filter(Boolean).join(" · ");
                    const bandHex = getBandHex(topic.masteryBand);
                    const isPriority = idx < 2 && priorityBands.has(topic.masteryBand);
                    // Task #740 — show saved flashcard position so learners
                    // know they have progress to resume before opening the
                    // drawer. Hidden once deck is reset (idx 0) or finished.
                    const savedIdx = savedFlashcardIdxByTopic.get(topic.id) ?? null;
                    // Hide once the deck is reset (idx 0 / null) or once the
                    // learner has reached the last card (savedIdx === cards-1).
                    const showResume =
                      savedIdx !== null && savedIdx > 0 && savedIdx < cards - 1;
                    const resumeLabel = showResume
                      ? `${(savedIdx as number) + 1} / ${cards}`
                      : null;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setTopicDrawer({
                          id: topic.id,
                          name: label,
                          capsCode: topic.capsCode,
                        })}
                        className="shrink-0 flex flex-col items-start gap-0.5 px-3 py-2 rounded-xl bg-background transition-all hover:scale-[1.02] active:scale-[0.98] text-left relative"
                        style={{ border: `1.5px solid ${bandHex}` }}
                        data-testid={`chip-ready-topic-${topic.id}`}
                      >
                        {isPriority && (
                          <span
                            className="absolute -top-2 -right-1 text-[8px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-full"
                            style={{ background: bandHex, color: "#000", boxShadow: `0 0 6px ${bandHex}99` }}
                            data-testid={`chip-priority-badge-${topic.id}`}
                          >
                            {isAf ? "Prioriteit" : "Priority"}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-foreground leading-tight max-w-[10rem] truncate">{label}</span>
                        <span className="text-[10px] font-medium" style={{ color: bandHex }}>{sublabel} · {getBandLabel(topic.masteryBand, isAf)}</span>
                        {resumeLabel && (
                          <span
                            className="mt-0.5 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full"
                            style={{ background: "#6EE7F922", color: "#6EE7F9", border: "1px solid #6EE7F955" }}
                            data-testid={`chip-resume-badge-${topic.id}`}
                            title={isAf ? "Hervat waar jy laas opgehou het" : "Resume where you left off"}
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            {isAf ? "Hervat" : "Resume"} {resumeLabel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {mastery && (
            <>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4" data-testid="stat-grid">
                <div data-testid="stat-papers"><NeonStat hex="#FFE29A"  icon={Shield}   value={mastery.progress.papersCompleted}   label={isAf ? "Eksamens" : "Exams"} /></div>
                <div data-testid="stat-questions"><NeonStat hex="#FFE29A" icon={Brain}    value={mastery.progress.questionsAttempted} label={isAf ? "Vrae" : "Questions"} /></div>
                <div data-testid="stat-accuracy"><NeonStat hex="#FFE29A" icon={Target}   value={`${mastery.progress.accuracy}%`}     label={isAf ? "Akkuraatheid" : "Accuracy"} /></div>
                <div data-testid="stat-readiness"><NeonStat hex="#C5B3FF" icon={Zap}      value={`${readinessScore}%`}                 label={isAf ? "Gereedheid" : "Readiness"} /></div>
              </div>

              <CosmicCard color="cyan" className="p-5" data-testid="current-vs-target">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5" style={{ color: "#6EE7F9", filter: "drop-shadow(0 0 4px #6EE7F9)" }} />
                    <h3 className="font-bold text-base text-foreground">{isAf ? "Huidige vs Teiken Telling" : "Current vs Target Score"}</h3>
                  </div>
                  <NeonBadge color={scoreDiff >= 0 ? "emerald" : "pink"}>
                    {scoreDiff >= 0 ? '+' : ''}{scoreDiff}%
                  </NeonBadge>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-xl bg-background" style={{ border: `1px solid ${getBandHex(mastery.overallBand)}55`, boxShadow: `inset 0 0 10px ${getBandHex(mastery.overallBand)}20` }}>
                    <p className="text-3xl font-black text-foreground tabular-nums" style={{ textShadow: `0 0 10px ${getBandHex(mastery.overallBand)}aa` }}>{currentScore}%</p>
                    <p className="text-[10px] text-foreground uppercase tracking-[0.14em] mt-1">{isAf ? "Huidige" : "Current"}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <ChevronRight className="w-8 h-8" style={{ color: scoreDiff >= 0 ? "#4ADE80" : "#FFB7E5", filter: `drop-shadow(0 0 6px ${scoreDiff >= 0 ? "#4ADE80" : "#FFB7E5"})` }} />
                      <p className="text-[10px] text-foreground">{scoreDiff >= 0 ? (isAf ? 'Op Koers' : 'On Track') : (isAf ? 'Moet Verbeter' : 'Needs Work')}</p>
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-background" style={{ border: "1px solid #6EE7F955", boxShadow: "inset 0 0 10px #6EE7F920" }}>
                    <p className="text-3xl font-black text-foreground tabular-nums" style={{ textShadow: "0 0 10px #6EE7F9aa" }}>{targetScore}%</p>
                    <p className="text-[10px] text-foreground uppercase tracking-[0.14em] mt-1">{isAf ? "Teiken" : "Target"}</p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden mt-3" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, currentScore))}%`, background: "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #6EE7F9, #9FD8FF, #C5B3FF, #FFB7E5)", boxShadow: "0 0 10px rgba(110,231,249,0.6)" }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-foreground">0%</span>
                  <span className="text-[10px] font-semibold" style={{ color: "#6EE7F9" }}>{isAf ? 'Teiken' : 'Target'}: {targetScore}%</span>
                  <span className="text-[10px] text-foreground">100%</span>
                </div>
              </CosmicCard>
            </>
          )}

          {/* ── Tab-based main content (replaces broken lg:grid-cols-3) ── */}
          <Tabs defaultValue="practice" className="w-full">
            <TabsList
              className="w-full h-auto p-1 rounded-2xl flex gap-1 flex-wrap justify-start bg-transparent"
              style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              {([
                { value: "practice", en: "Practice", af: "Oefen",      Icon: Zap,      hex: "#FFE29A" },
                { value: "topics",   en: "Topics",   af: "Onderwerpe", Icon: Brain,    hex: "#6EE7F9" },
                { value: "plan",     en: "Plan",      af: "Plan",       Icon: Calendar, hex: "#9FD8FF" },
                { value: "sources",  en: "Sources",   af: "Bronne",     Icon: BookOpen, hex: "#C5B3FF" },
              ] as const).map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 min-w-[72px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.12em] transition-all border-0 shadow-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:text-foreground hover:text-foreground data-[state=active]:shadow-none"
                >
                  <tab.Icon className="w-3.5 h-3.5" />
                  {isAf ? tab.af : tab.en}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── PRACTICE tab ── */}
            <TabsContent value="practice" className="space-y-6 mt-6">
              {/* Quick-action pill buttons */}
              {subject && (
                <div className="flex gap-2 flex-wrap">
                  {isBST && (
                    <Link href="/bst-exam">
                      <button
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-background text-sm font-bold transition-all hover:scale-[1.02]"
                        style={{ border: "1.5px solid #FFE29A", color: "#FFE29A" }}
                        data-testid="button-crunch-time"
                      >
                        <Shield className="w-3.5 h-3.5" /> Crunch Time
                      </button>
                    </Link>
                  )}
                  <Link href="/exam-mode">
                    <button
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-background text-sm font-bold transition-all hover:scale-[1.02]"
                      style={{ border: "1.5px solid #FFE29A", color: "#FFE29A" }}
                      data-testid="button-exam-mode"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      {isAf ? "Alle Eksamens" : "All Exams"}
                    </button>
                  </Link>
                  <Link href={`/tutor?subject=${id}`}>
                    <button
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-background text-sm font-bold transition-all hover:scale-[1.02]"
                      style={{ border: "1.5px solid #C5B3FF", color: "#C5B3FF" }}
                      data-testid="button-smart-tutor"
                    >
                      <Brain className="w-3.5 h-3.5" /> Rizz
                    </button>
                  </Link>
                </div>
              )}

              {/* Recommended Quiz + Revision Mode */}
              {subject && mastery && mastery.topics.length > 0 && (() => {
                const weakestTopic = [...mastery.topics].sort((a, b) => a.masteryScore - b.masteryScore)[0];
                const wrongCountEst = mastery.topics.reduce((s, t) => s + Math.max(0, t.questionsAttempted - t.questionsCorrect), 0);
                return (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <CosmicCard color="yellow" className="p-5 space-y-3" data-testid="recommended-quiz-card">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5" style={{ color: "#FFE29A", filter: "drop-shadow(0 0 4px #FFE29A)" }} />
                        <span className="font-black text-sm text-foreground uppercase tracking-[0.14em]">
                          {isAf ? "Aanbevole Vasvraag" : "Recommended Quiz"}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-snug">
                        {isAf
                          ? `Fokus op jou swakste onderwerp: ${weakestTopic.nameAfrikaans || weakestTopic.name} (${weakestTopic.masteryScore}%)`
                          : `Focus on your weakest topic: ${weakestTopic.name} (${weakestTopic.masteryScore}%)`}
                      </p>
                      <button
                        className="w-full px-4 py-2 rounded-xl bg-background text-sm font-bold transition-all hover:scale-[1.02]"
                        style={{ color: "#FFE29A", border: "1.5px solid #FFE29A" }}
                        onClick={() => {
                          setRecommendedTopicFocus(weakestTopic.name);
                          const el = document.getElementById("boost-quiz-section");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        data-testid="button-recommended-quiz"
                      >
                        {isAf ? "Begin Vasvraag" : "Start Quiz"} →
                      </button>
                    </CosmicCard>

                    <CosmicCard color="purple" className="p-5 space-y-3" data-testid="revision-mode-card">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" style={{ color: "#C5B3FF", filter: "drop-shadow(0 0 4px #C5B3FF)" }} />
                        <span className="font-black text-sm text-foreground uppercase tracking-[0.14em]">
                          {isAf ? "Hersien Verkeerde Antwoorde" : "Revise Wrong Answers"}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-snug">
                        {wrongCountEst > 0
                          ? (isAf
                            ? `Jy het ±${wrongCountEst} verkeerde antwoorde. Hersien dit om jou bemeestering te verbeter.`
                            : `You have ~${wrongCountEst} wrong answers. Revise them to improve mastery.`)
                          : (isAf ? "Doen vrae om jou hersiening te bou." : "Do some quizzes to build your revision list.")}
                      </p>
                      <Link href={`/revision/${subject.id}`}>
                        <button
                          className="w-full px-4 py-2 rounded-xl bg-background text-sm font-bold transition-all hover:scale-[1.02]"
                          style={{ color: "#C5B3FF", border: "1.5px solid #C5B3FF" }}
                          data-testid="button-revision-mode"
                        >
                          {isAf ? "Begin Hersiening" : "Start Revision"} →
                        </button>
                      </Link>
                    </CosmicCard>
                  </div>
                );
              })()}

              {/* Daily Quiz */}
              {subject && (
                <div id="boost-quiz-section">
                  <SubjectBoostPack
                    key={recommendedTopicFocus ?? "default"}
                    subjectId={subject.id}
                    subjectName={isAf ? (subject.nameAfrikaans || subject.name) : subject.name}
                    isAf={isAf}
                    topicFocus={recommendedTopicFocus ?? undefined}
                    autoStart={!!recommendedTopicFocus}
                  />
                </div>
              )}
            </TabsContent>

            {/* ── TOPICS tab ── */}
            <TabsContent value="topics" className="mt-6">
              <div id="audio" />
              <CosmicCard color="cyan" className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5" style={{ color: "#6EE7F9", filter: "drop-shadow(0 0 4px #6EE7F9)" }} />
                  <h3 className="font-bold text-base text-foreground">{isAf ? "Onderwerp Bemeestering" : "Topic Mastery"}</h3>
                  {mastery && mastery.topics.length > 0 && <NeonBadge color="cyan">{mastery.topics.length}</NeonBadge>}
                </div>
                {masteryLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
                  </div>
                ) : mastery && mastery.topics.length > 0 ? (
                  <div className="space-y-3">
                    {mastery.topics.map((topic) => {
                      const tHex = getBandHex(topic.masteryBand);
                      return (
                        <div
                          key={topic.id}
                          className="p-4 rounded-xl bg-background transition-all duration-200 hover:-translate-y-px"
                          style={{ border: `1px solid ${tHex}55`, boxShadow: `inset 0 0 12px ${tHex}15` }}
                          data-testid={`topic-mastery-${topic.id}`}
                        >
                          <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                {getBandIcon(topic.masteryBand)}
                                <p className="font-semibold text-foreground truncate">
                                  {isAf ? (topic.nameAfrikaans || topic.name) : topic.name}
                                </p>
                                {topic.capsCode && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-background" style={{ color: tHex, border: `1px solid ${tHex}55` }}>{topic.capsCode}</span>
                                )}
                                {topic.hasNotes && (
                                  <span
                                    className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-[0.14em]"
                                    style={{ color: "#6EE7F9", border: "1px solid #6EE7F955", background: "#6EE7F910" }}
                                    data-testid={`badge-curated-${topic.id}`}
                                  >
                                    {isAf ? "Gekureer" : "Curated"}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-foreground mt-1">
                                {isAf
                                  ? `${topic.questionsAttempted} vrae · ${topic.questionsCorrect} korrek`
                                  : `${topic.questionsAttempted} attempted · ${topic.questionsCorrect} correct`
                                }
                                {topic.consecutiveCorrect > 0 && (
                                  <span className="ml-2" style={{ color: "#FFE29A" }}>
                                    🔥 {topic.consecutiveCorrect}x {isAf ? "reeks" : "streak"}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-lg text-foreground tabular-nums" style={{ textShadow: `0 0 8px ${tHex}aa` }}>
                                {topic.masteryScore}%
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-background uppercase tracking-[0.14em]" style={{ color: tHex, border: `1px solid ${tHex}` }}>
                                {getBandLabel(topic.masteryBand, isAf)}
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-background overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${topic.masteryScore}%`, background: tHex, boxShadow: `0 0 8px ${tHex}aa` }} />
                          </div>
                          {topic.confidenceLevel > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <Zap className="w-3 h-3" style={{ color: "#6EE7F9" }} />
                              <span className="text-[10px] text-foreground">
                                {isAf ? "Vertroue" : "Confidence"}: {topic.confidenceLevel}%
                              </span>
                            </div>
                          )}
                          <TopicMediaPanel
                            topicId={topic.id}
                            topicName={isAf ? (topic.nameAfrikaans || topic.name) : topic.name}
                            isAf={isAf}
                            accentHex={tHex}
                          />
                          {(() => {
                            const cards = topic.cardCount ?? 0;
                            const notes = topic.hasNotes ?? false;
                            const hasContent = cards > 0 || notes;
                            const badgeLabel = hasContent
                              ? [
                                  cards > 0 ? `${cards} ${isAf ? "kaarte" : "cards"}` : null,
                                  notes ? (isAf ? "notas gereed" : "notes ready") : null,
                                ].filter(Boolean).join(" · ")
                              : (isAf ? "Inhoud word voorberei" : "Content being prepared");
                            return (
                              <button
                                type="button"
                                onClick={() => hasContent && setTopicDrawer({
                                  id: topic.id,
                                  name: isAf ? (topic.nameAfrikaans || topic.name) : topic.name,
                                  capsCode: topic.capsCode,
                                })}
                                disabled={!hasContent}
                                className={`mt-3 w-full inline-flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl bg-background text-[11px] font-black uppercase tracking-[0.18em] transition-all ${hasContent ? "hover:scale-[1.01] cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                                style={{ color: tHex, border: `1.5px solid ${tHex}` }}
                                data-testid={`button-topic-content-${topic.id}`}
                              >
                                <span className="flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5" />
                                  {isAf ? "Notas & Oefenkaarte" : "Notes & Practice Cards"}
                                </span>
                                <span className={`text-[9px] font-semibold normal-case tracking-normal ${hasContent ? "opacity-70" : "opacity-50"}`}>
                                  {badgeLabel}
                                </span>
                              </button>
                            );
                          })()}
                          {(() => {
                            const qCount = topic.quizQuestionCount ?? 0;
                            const quizBadgeLabel = qCount > 0
                              ? `${qCount} ${isAf ? "vrae beskikbaar" : "questions available"}`
                              : (isAf ? "Vrae word voorberei" : "Coming soon");
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  if (!subject) return;
                                  setQuizTopicDrawer({
                                    id: topic.id,
                                    name: isAf ? (topic.nameAfrikaans || topic.name) : topic.name,
                                    subjectId: subject.id,
                                    subjectName: isAf ? (subject.nameAfrikaans || subject.name) : subject.name,
                                  });
                                }}
                                className="mt-2 w-full inline-flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl bg-background text-[11px] font-black uppercase tracking-[0.18em] transition-all hover:scale-[1.01] cursor-pointer"
                                style={{ color: tHex, border: `1.5px solid ${tHex}` }}
                                data-testid={`button-quiz-topic-${topic.id}`}
                              >
                                <span className="flex items-center gap-2">
                                  <Zap className="w-3.5 h-3.5" />
                                  {isAf ? "Kwis Hierdie Onderwerp" : "Quiz this topic"}
                                </span>
                                <span className="text-[9px] font-semibold normal-case tracking-normal opacity-70">
                                  {quizBadgeLabel}
                                </span>
                              </button>
                            );
                          })()}
                        </div>
                      );
                    })}

                    <div className="mt-4 p-4 rounded-xl bg-background" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                      <p className="text-[10px] font-bold mb-2 uppercase tracking-[0.18em] text-foreground">{isAf ? "Bemeestering Bande" : "Mastery Bands"}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        {[
                          { hex: "#FFB7E5", label: isAf ? "Inhaal" : "Catch Up", range: "0-59%" },
                          { hex: "#FFE29A", label: isAf ? "Bou" : "Building", range: "60-74%" },
                          { hex: "#4ADE80", label: isAf ? "Op Koers" : "Locked In", range: "75-84%" },
                          { hex: "#FFE29A", label: isAf ? "Ster" : "Star", range: "85-100%" },
                        ].map(b => (
                          <div key={b.label} className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: b.hex, boxShadow: `0 0 6px ${b.hex}` }} />
                            <span className="text-[10px] text-foreground">{b.label} <span className="text-foreground">{b.range}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">{isAf ? "Nog geen bemeestering data nie" : "No mastery data yet"}</p>
                    <p className="text-sm mt-1">{isAf ? "Begin 'n Eksamentyd-eksamen om jou vordering te sien" : "Start a Crunch Time exam to see your progress"}</p>
                  </div>
                )}
              </CosmicCard>
            </TabsContent>

            {/* ── PLAN tab ── */}
            <TabsContent value="plan" className="space-y-6 mt-6">
              <CosmicCard color="blue" className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5" style={{ color: "#9FD8FF", filter: "drop-shadow(0 0 4px #9FD8FF)" }} />
                  <h3 className="font-bold text-base text-foreground">{isAf ? "Persoonlike Studieplan" : "Personalized Study Plan"}</h3>
                  <NeonBadge color="blue">{isAf ? "7 Dae" : "7 Day"}</NeonBadge>
                </div>
                {masteryLoading && personalizedPlan.length === 0 ? (
                  <div className="space-y-2" data-testid="plan-loading">
                    {[0,1,2].map(i => (
                      <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background:"rgba(159,216,255,0.08)", border:"1px solid rgba(159,216,255,0.15)" }} />
                    ))}
                  </div>
                ) : personalizedPlan.length > 0 ? (
                  <div className="space-y-2">
                    {personalizedPlan.map((item, idx) => {
                      const pHex = item.priority === "high" ? "#FFB7E5" : item.priority === "low" ? "#4ADE80" : "#9FD8FF";
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-background transition-all duration-200 hover:-translate-y-px"
                          style={{ border: `1px solid ${pHex}55`, boxShadow: `inset 0 0 10px ${pHex}15` }}
                          data-testid={`plan-item-${idx}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 bg-background uppercase tracking-[0.14em]"
                              style={{ border: `1.5px solid ${pHex}`, color: pHex, boxShadow: `0 0 10px ${pHex}55` }}>
                              {item.day}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{item.task}</p>
                              <p className="text-[11px] text-foreground truncate">{item.focus}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-background inline-flex items-center gap-1" style={{ color: "#6EE7F9", border: "1px solid #6EE7F955" }}>
                              <Clock className="w-3 h-3" /> {item.duration}min
                            </span>
                            {item.priority === "high" && <NeonBadge color="pink">{isAf ? "Prioriteit" : "Priority"}</NeonBadge>}
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-[10px] text-foreground mt-3 px-1">
                      {isAf
                        ? "Hierdie plan is gepersonaliseer op grond van jou bemeesteringsdata. Fokus eers op rooi en amber onderwerpe."
                        : "This plan is personalized based on your mastery data. Focus on red and amber topics first."
                      }
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-foreground">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{isAf ? "Studieplan sal genereer word sodra jy begin oefen" : "Study plan will generate once you start practicing"}</p>
                  </div>
                )}
              </CosmicCard>

              {badges && badges.length > 0 && (
                <CosmicCard color="yellow" className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5" style={{ color: "#FFE29A", filter: "drop-shadow(0 0 4px #FFE29A)" }} />
                    <h3 className="font-bold text-base text-foreground">{isAf ? "Prestasies" : "Achievements"}</h3>
                    <NeonBadge color="yellow">{badges.length}</NeonBadge>
                  </div>
                  <div className="space-y-2">
                    {badges.map((badge) => {
                      const info = BADGE_INFO[badge.badgeCode];
                      if (!info) return null;
                      const IconComp = info.icon;
                      return (
                        <div
                          key={badge.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background"
                          style={{ border: "1px solid #FFE29A44", boxShadow: "inset 0 0 8px #FFE29A15" }}
                          data-testid={`badge-${badge.badgeCode}`}
                        >
                          <IconComp className="w-4 h-4" style={{ color: "#FFE29A", filter: "drop-shadow(0 0 3px #FFE29A)" }} />
                          <span className="text-sm font-semibold text-foreground">
                            {isAf ? info.nameAfrikaans : info.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CosmicCard>
              )}
            </TabsContent>

            {/* ── SOURCES tab ── */}
            <TabsContent value="sources" className="space-y-6 mt-6">
              {subject && isLiteratureSubject(subject.code ?? "") && (() => {
                const litCategories = getLiteratureForSubject(subject.code ?? "");
                const hasAnySelection = litCategories.some(cat => litSelections[cat.type]);
                return (
                  <CosmicCard color="cyan" className="p-5" data-testid="card-literature-selection">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                      <h3 className="flex items-center gap-2 font-bold text-base text-foreground">
                        <BookMarked className="w-5 h-5" style={{ color: "#6EE7F9", filter: "drop-shadow(0 0 4px #6EE7F9)" }} />
                        {isAf ? "Jou Voorgeskryfde Werke" : "Your Prescribed Works"}
                      </h3>
                      <button
                        onClick={() => saveLitMutation.mutate(litSelections)}
                        disabled={saveLitMutation.isPending}
                        data-testid="button-save-literature"
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-background text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-60"
                        style={{ color: "#6EE7F9", border: "1.5px solid #6EE7F9" }}
                      >
                        {litSaved ? (
                          <><Check className="w-3.5 h-3.5" /> {isAf ? "Gestoor" : "Saved"}</>
                        ) : saveLitMutation.isPending ? (
                          isAf ? "Stoor..." : "Saving..."
                        ) : (
                          isAf ? "Stoor Keuses" : "Save Selections"
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-foreground mt-1 mb-4">
                      {isAf
                        ? "Kies die werke wat jou skool vir elke kategorie gebruik. Dit help Rizz om jou beter voor te berei."
                        : "Select the works your school uses for each category. This helps Rizz prepare you more accurately."}
                    </p>

                    {/* Browse-all card grid — every prescribed work in this subject
                        listed by category. Clicking "Notes" opens the literature
                        dialog directly without forcing the learner to pick a school
                        selection first. */}
                    <div className="space-y-4 mb-5">
                      {litCategories.map((cat) => (
                        <div key={`browse-${cat.type}`} data-testid={`lit-browse-${cat.type}`}>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300 mb-2">
                            {isAf ? cat.labelAf : cat.label}
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {cat.works.map((w) => {
                              const dbWork = litWorksByExternalId.get(w.id);
                              return (
                                <div
                                  key={w.id}
                                  className="flex items-start justify-between gap-2 rounded-xl bg-background p-3"
                                  style={{ border: "1px solid #6EE7F933" }}
                                  data-testid={`lit-work-card-${w.id}`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-foreground truncate">{w.title}</p>
                                    {w.author !== "Various" && w.author !== "Verskeie digters" && w.author !== "Verskeie outeurs" && (
                                      <p className="text-[11px] text-foreground truncate">— {w.author}</p>
                                    )}
                                  </div>
                                  {dbWork ? (
                                    <button
                                      type="button"
                                      onClick={() => setLitWorkDialog({ id: dbWork.id, title: dbWork.title })}
                                      className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-background text-sm font-bold transition-all hover:scale-[1.02]"
                                      style={{ color: "#6EE7F9", border: "1.5px solid #6EE7F9" }}
                                      data-testid={`button-notes-${w.id}`}
                                    >
                                      <FileText className="w-3 h-3" />
                                      {isAf ? "Notas" : "Notes"}
                                    </button>
                                  ) : (
                                    <span className="shrink-0 text-[10px] text-foreground italic">
                                      {isAf ? "Word voorberei" : "Preparing"}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {litCategories.map((cat) => {
                          const selectedId = litSelections[cat.type] ?? "";
                          const selectedWork = cat.works.find(w => w.id === selectedId);
                          return (
                            <div key={cat.type} className="space-y-2" data-testid={`lit-category-${cat.type}`}>
                              <p className="text-sm font-semibold text-foreground uppercase tracking-wide">
                                {isAf ? cat.labelAf : cat.label}
                              </p>
                              <Select
                                value={selectedId}
                                onValueChange={(val) => setLitSelections(prev => ({ ...prev, [cat.type]: val }))}
                              >
                                <SelectTrigger data-testid={`select-lit-${cat.type}`} className="w-full">
                                  <SelectValue placeholder={isAf ? "Kies 'n werk..." : "Select a work..."} />
                                </SelectTrigger>
                                <SelectContent>
                                  {cat.works.map((work) => (
                                    <SelectItem key={work.id} value={work.id} data-testid={`option-lit-${work.id}`}>
                                      <span className="font-medium">{work.title}</span>
                                      {work.author !== "Various" && work.author !== "Verskeie digters" && work.author !== "Verskeie outeurs" && (
                                        <span className="text-foreground ml-1 text-xs">— {work.author}</span>
                                      )}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {selectedWork && (
                                <div className="flex items-center justify-between gap-2 pl-1">
                                  <p className="text-xs text-foreground" data-testid={`text-lit-selected-${cat.type}`}>
                                    <span className="font-medium">{isAf ? "Gekies" : "Selected"}:</span> {selectedWork.title}
                                    {selectedWork.author !== "Various" && selectedWork.author !== "Verskeie digters" && selectedWork.author !== "Verskeie outeurs" && ` — ${selectedWork.author}`}
                                  </p>
                                  {(() => {
                                    const dbWork = litWorksByExternalId.get(selectedWork.id);
                                    if (!dbWork) return null;
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => setLitWorkDialog({ id: dbWork.id, title: dbWork.title })}
                                        className="shrink-0 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-background text-sm font-bold transition-all hover:scale-[1.02]"
                                        style={{ color: "#6EE7F9", border: "1.5px solid #6EE7F9" }}
                                        data-testid={`button-view-lit-${cat.type}`}
                                      >
                                        <FileText className="w-3 h-3" />
                                        {isAf ? "Notas" : "Notes"}
                                      </button>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {hasAnySelection && (
                        <div className="mt-4 p-3 rounded-xl bg-background" style={{ border: "1px solid #6EE7F955", boxShadow: "inset 0 0 8px #6EE7F915" }}>
                          <p className="text-xs text-foreground flex items-center gap-2">
                            <BookMarked className="w-4 h-4 shrink-0" style={{ color: "#6EE7F9" }} />
                            {isAf
                              ? "Rizz sal jou vrae, opsommings en ontledings rig rondom hierdie werke."
                              : "Rizz will direct your questions, summaries and analysis around these prescribed works."}
                          </p>
                        </div>
                      )}
                    </div>
                  </CosmicCard>
                );
              })()}

              <CosmicCard color="blue" className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ExternalLink className="w-5 h-5" style={{ color: "#9FD8FF", filter: "drop-shadow(0 0 4px #9FD8FF)" }} />
                  <h3 className="font-bold text-base text-foreground">{isAf ? "Amptelike Bronne" : "Official Sources"}</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { href: "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS).aspx", label: "CAPS Curriculum", tid: "link-caps" },
                    { href: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx", label: isAf ? "NSC Vorige Vraestelle" : "NSC Past Exam Papers", tid: "link-past-papers" },
                    { href: "https://www.education.gov.za/2024NSCNovemberpastpapers.aspx", label: isAf ? "2024 NSC Vraestelle" : "2024 NSC Papers", tid: "link-2024-papers" },
                  ].map((lnk) => (
                    <a
                      key={lnk.tid}
                      href={lnk.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-background text-sm font-semibold text-foreground hover:text-foreground transition-all hover:-translate-y-px"
                      style={{ border: "1px solid #9FD8FF55", boxShadow: "inset 0 0 8px #9FD8FF15" }}
                      data-testid={lnk.tid}
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" style={{ color: "#9FD8FF" }} />
                      <span>{lnk.label}</span>
                    </a>
                  ))}
                  <div className="mt-3 p-3 rounded-xl bg-background" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p className="text-[11px] text-foreground leading-relaxed">
                      {isAf
                        ? "Hierdie vakpaneel is KABV-belyn en gebaseer op ontleding van NSC-eksamenpatrone (10-jaar venster). Alle vrae is oorspronklik en gesimuleer."
                        : "This subject dashboard is CAPS-aligned and informed by analysis of NSC examination patterns (10-year window). All questions are original and simulated."
                      }
                    </p>
                    <p className="text-[11px] mt-1 font-black tracking-[0.14em]" style={{ background: "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #6EE7F9, #9FD8FF, #C5B3FF, #FFB7E5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      BrainTrack™
                    </p>
                  </div>
                </div>
              </CosmicCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Task #428 — per-topic content & literature dialogs */}
      {topicDrawer && subject && (
        <TopicContentDrawer
          topicId={topicDrawer.id}
          topicName={topicDrawer.name}
          subjectCode={subject.code ?? ""}
          capsCode={topicDrawer.capsCode}
          isAf={isAf}
          open={!!topicDrawer}
          onOpenChange={(v) => {
            if (!v) {
              setTopicDrawer(null);
              setFlashcardPosBump(b => b + 1);
            }
          }}
        />
      )}
      {/* Task #532 — inline quiz drawer opened from Topic Mastery list */}
      {quizTopicDrawer && (
        <TopicQuizDrawer
          subjectId={quizTopicDrawer.subjectId}
          subjectName={quizTopicDrawer.subjectName}
          topicName={quizTopicDrawer.name}
          isAf={isAf}
          open={!!quizTopicDrawer}
          onOpenChange={(v) => { if (!v) setQuizTopicDrawer(null); }}
        />
      )}
      {litWorkDialog && (
        <LiteratureWorkDialog
          workId={litWorkDialog.id}
          workTitle={litWorkDialog.title}
          isAf={isAf}
          open={!!litWorkDialog}
          onOpenChange={(v) => { if (!v) setLitWorkDialog(null); }}
        />
      )}
    </div>
  );
}
