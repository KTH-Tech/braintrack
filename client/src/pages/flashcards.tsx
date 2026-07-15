import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  LogOut,
  Layers,
  RotateCcw,
  Zap,
  Trophy,
  Target,
  ArrowRight,
} from "lucide-react";
import type { FlashcardDef } from "@/lib/flashcard-data";
import {
  getCardState,
  gradeCard,
  getDueCards,
  getCardsDueTomorrow,
  getStats,
  incrementReviewCount,
  completeSession,
  sortByDueDate,
  syncProgressFromServer,
  type SM2State,
} from "@/lib/sm2";

const MAX_NEW_CARDS_PER_SESSION = 20;

function FlashcardReview({ isAf }: { isAf: boolean }) {
  // Task #428 — support deep links from /subjects/:id pages: ?subject=MATH&topic=MATH-1
  const initialFilters = (() => {
    if (typeof window === "undefined") return { subject: "all", topic: "all" };
    const params = new URLSearchParams(window.location.search);
    return {
      subject: params.get("subject") ?? "all",
      topic: params.get("topic") ?? "all",
    };
  })();
  const [selectedSubject, setSelectedSubject] = useState<string>(initialFilters.subject);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialFilters.topic);
  const [reviewQueue, setReviewQueue] = useState<FlashcardDef[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [sessionGot, setSessionGot] = useState(0);
  const [sessionMissed, setSessionMissed] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [gradeTick, setGradeTick] = useState(0);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const [missedCards, setMissedCards] = useState<FlashcardDef[]>([]);
  const [isReviewMissedPass, setIsReviewMissedPass] = useState(false);
  const [cumulativeGot, setCumulativeGot] = useState(0);
  const [cumulativeMissed, setCumulativeMissed] = useState(0);

  // Pre-seeded deck sourced from dbe_verbatim_questions, scoped server-side
  // to the learner's onboarding-selected subjects.
  const { data: deckData, isLoading: deckLoading } = useQuery<{ cards: FlashcardDef[] }>({
    queryKey: ["/api/flashcards/deck", isAf ? "af" : "en"],
    queryFn: async () => {
      const r = await fetch(`/api/flashcards/deck?lang=${isAf ? "af" : "en"}`, { credentials: "include" });
      if (!r.ok) throw new Error(`Deck load failed: ${r.status}`);
      return r.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const allCards = deckData?.cards ?? [];

  const subjects = useMemo(() => {
    const seen = new Set<string>();
    const result: { code: string; name: string }[] = [];
    for (const c of allCards) {
      if (!seen.has(c.subjectCode)) {
        seen.add(c.subjectCode);
        result.push({ code: c.subjectCode, name: c.subject });
      }
    }
    return result;
  }, [allCards]);
  const allowedCodes = useMemo(() => new Set(subjects.map((s) => s.code)), [subjects]);
  // Map static subject code → DB subject id (the API needs the numeric id).
  const { data: dbSubjects } = useQuery<Array<{ id: number; code: string; name: string }>>({
    queryKey: ["/api/subjects"],
  });
  const subjectIdByCode = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of dbSubjects ?? []) m.set(s.code, s.id);
    return m;
  }, [dbSubjects]);

  // Reset selection if it falls outside the learner's available subjects.
  useEffect(() => {
    if (!deckLoading && selectedSubject !== "all" && !allowedCodes.has(selectedSubject)) {
      setSelectedSubject("all");
      setSelectedTopic("all");
    }
  }, [deckLoading, selectedSubject, allowedCodes]);

  // Task #428 — when a specific subject is selected, fetch topic decks from the
  // database via the new topic_flashcards endpoint (EN+AF aware). The cross-
  // subject `/api/flashcards/deck` query above (allCards) remains the source
  // of truth for "All subjects" mode.
  const selectedSubjectId = subjectIdByCode.get(selectedSubject);
  const selectedSubjectName = subjects.find(s => s.code === selectedSubject)?.name ?? selectedSubject;
  const { data: dbDeck } = useQuery<{
    subjectId: number;
    language: string;
    topics: { topicId: number; capsCode: string; name: string; nameAfrikaans: string | null; hasNotes: boolean; cards: { id: string; front: string; back: string; type: string; orderIndex: number }[] }[];
    totalCards: number;
  }>({
    queryKey: [`/api/subjects/${selectedSubjectId}/topic-flashcards`, isAf ? "af" : "en"],
    queryFn: () =>
      fetch(`/api/subjects/${selectedSubjectId}/topic-flashcards?lang=${isAf ? "af" : "en"}`, { credentials: "include" })
        .then(r => r.json()),
    enabled: selectedSubject !== "all" && !!selectedSubjectId,
  });

  // Topics dropdown: prefer DB topics from the per-subject deck when available,
  // otherwise derive from the cross-subject allCards (HEAD behaviour).
  const topics = useMemo(() => {
    if (selectedSubject === "all") return [];
    if (dbDeck?.topics?.length) {
      return dbDeck.topics.map(t => ({
        code: t.capsCode,
        name: isAf ? (t.nameAfrikaans || t.name) : t.name,
        hasNotes: t.hasNotes ?? false,
      }));
    }
    const seen = new Set<string>();
    const result: { code: string; name: string; hasNotes: boolean }[] = [];
    for (const c of allCards) {
      if (c.subjectCode === selectedSubject && !seen.has(c.topicCode)) {
        seen.add(c.topicCode);
        result.push({ code: c.topicCode, name: c.topic, hasNotes: false });
      }
    }
    return result;
  }, [selectedSubject, dbDeck, isAf, allCards]);

  const stats = getStats();

  // Task #748 — server-aggregated cross-device stats. Falls back to the
  // localStorage values above when the request is in flight or fails.
  const { data: serverStats } = useQuery<{
    totalReviewed: number;
    cardsMastered: number;
    dueToday: number;
    dueTomorrow: number;
    currentStreak: number;
    longestStreak: number;
    perSubject: Record<string, { total: number; reviewed: number; mastered: number; dueToday: number; dueTomorrow: number }>;
  }>({
    queryKey: ["/api/flashcards/stats", gradeTick],
    queryFn: async () => {
      const r = await fetch("/api/flashcards/stats", { credentials: "include" });
      if (!r.ok) throw new Error(`stats load failed: ${r.status}`);
      return r.json();
    },
    staleTime: 30 * 1000,
  });

  // Task #604 — sync SM2 state from server on mount so progress survives
  // device switches and browser-data clears. Runs once per component mount;
  // forces a gradeTick refresh so due-card counts update after the merge.
  useEffect(() => {
    syncProgressFromServer().then(() => {
      setGradeTick(t => t + 1);
    });
  }, []);

  const availableCards = useMemo<FlashcardDef[]>(() => {
    if (selectedSubject !== "all") {
      // Subject-specific mode is fully DB-backed (EN+AF aware). When dbDeck
      // hasn't loaded yet (or returns no topics), return [] — never silently
      // widen to the cross-subject deck, which would start the wrong session.
      if (!dbDeck) return [];
      const flat: FlashcardDef[] = [];
      for (const t of dbDeck.topics) {
        if (selectedTopic !== "all" && t.capsCode !== selectedTopic) continue;
        const topicLabel = isAf ? (t.nameAfrikaans || t.name) : t.name;
        for (const c of t.cards) {
          flat.push({
            id: c.id,
            subject: selectedSubjectName,
            subjectCode: selectedSubject,
            topic: topicLabel,
            topicCode: t.capsCode,
            front: c.front,
            back: c.back,
            type: (c.type === "cloze" || c.type === "reversed") ? (c.type as "cloze" | "reversed") : "basic",
          });
        }
      }
      return flat;
    }
    // "All subjects" mode — cross-subject mixed deck from /api/flashcards/deck.
    return allCards;
  }, [selectedSubject, selectedTopic, dbDeck, allCards, isAf, selectedSubjectName]);

  const noneEnrolled = !deckLoading && allCards.length === 0;

  const dueCardIds = useMemo(() => {
    void gradeTick;
    return getDueCards(availableCards.map(c => c.id));
  }, [availableCards, gradeTick]);

  const dueTomorrow = useMemo(() => {
    void gradeTick;
    return getCardsDueTomorrow(availableCards.map(c => c.id));
  }, [availableCards, gradeTick]);

  const sessionSize = useMemo(() => {
    const now = Date.now();
    // Truly due: cards that have been reviewed before (lastReview != null) and whose
    // interval has elapsed. getDueCards also returns unseen cards (no state → true),
    // so we filter those out here to keep the cap logic correct.
    const trulyDueCards = availableCards.filter(c => {
      const state = getCardState(c.id);
      return state.lastReview !== null && state.due <= now;
    });
    // Unseen: cards that have never been reviewed — capped at MAX_NEW_CARDS_PER_SESSION.
    const unseenCards = availableCards
      .filter(c => !getCardState(c.id).lastReview)
      .slice(0, MAX_NEW_CARDS_PER_SESSION);
    const combined = [...trulyDueCards, ...unseenCards];
    return combined.length === 0 ? Math.min(availableCards.length, 10) : combined.length;
  }, [availableCards, gradeTick]);

  const startSession = useCallback((cardsOverride?: FlashcardDef[]) => {
    const cards = cardsOverride ?? availableCards;
    const now = Date.now();
    const trulyDueCards = cards.filter(c => {
      const state = getCardState(c.id);
      return state.lastReview !== null && state.due <= now;
    });
    const unseenCards = cards
      .filter(c => !getCardState(c.id).lastReview)
      .slice(0, MAX_NEW_CARDS_PER_SESSION);
    const combined = [...trulyDueCards, ...unseenCards];
    let queue: FlashcardDef[];
    if (combined.length === 0) {
      queue = cards.slice(0, 10);
    } else {
      queue = combined;
    }
    const sortedIds = sortByDueDate(queue.map(c => c.id));
    const idToCard = new Map(queue.map(c => [c.id, c]));
    const sorted = sortedIds.map(id => idToCard.get(id)!).filter(Boolean);
    setReviewQueue(sorted);
    setCurrentIndex(0);
    setFlipped(false);
    setSessionReviewed(0);
    setSessionGot(0);
    setSessionMissed(0);
    setSwipeDelta(0);
    setSessionStarted(true);
    setSessionComplete(false);
    setMissedCards([]);
    setIsReviewMissedPass(false);
    setCumulativeGot(0);
    setCumulativeMissed(0);
  }, [availableCards]);

  const currentCard = reviewQueue[currentIndex];

  const handleGrade = useCallback((quality: number) => {
    if (!currentCard) return;
    gradeCard(currentCard.id, quality);
    incrementReviewCount();
    setSessionReviewed(prev => prev + 1);
    if (quality >= 3) {
      setSessionGot(prev => prev + 1);
    } else {
      setSessionMissed(prev => prev + 1);
      if (!isReviewMissedPass) {
        setMissedCards(prev => [...prev, currentCard]);
      }
    }
    setGradeTick(prev => prev + 1);
    setFlipped(false);
    setSwipeDelta(0);

    if (currentIndex + 1 >= reviewQueue.length) {
      completeSession();
      setSessionComplete(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentCard, currentIndex, reviewQueue.length, isReviewMissedPass]);

  const startMissedReview = useCallback(() => {
    if (missedCards.length === 0) return;
    setCumulativeGot(prev => prev + sessionGot);
    setCumulativeMissed(prev => prev + sessionMissed);
    setReviewQueue(missedCards);
    setMissedCards([]);
    setCurrentIndex(0);
    setFlipped(false);
    setSessionReviewed(0);
    setSessionGot(0);
    setSessionMissed(0);
    setSwipeDelta(0);
    setIsReviewMissedPass(true);
    setSessionComplete(false);
  }, [missedCards, sessionGot, sessionMissed]);

  const handleFlip = useCallback(() => {
    setFlipped(prev => !prev);
  }, []);

  const SWIPE_THRESHOLD = 60;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = false;
    setSwipeDelta(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    isDragging.current = Math.abs(delta) > 8;
    setSwipeDelta(delta);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null) return;
    const delta = swipeDelta;
    const wasDragging = isDragging.current;
    touchStartX.current = null;
    isDragging.current = false;
    setSwipeDelta(0);
    if (!wasDragging) return;
    if (delta > SWIPE_THRESHOLD) {
      handleGrade(5);
    } else if (delta < -SWIPE_THRESHOLD) {
      handleGrade(1);
    }
  }, [swipeDelta, handleGrade]);

  useEffect(() => {
    if (!sessionStarted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      }
      if (flipped) {
        if (e.key === "1") handleGrade(1);
        if (e.key === "2") handleGrade(2);
        if (e.key === "3") handleGrade(3);
        if (e.key === "4") handleGrade(5);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sessionStarted, flipped, handleFlip, handleGrade]);

  if (deckLoading) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center space-y-3">
        <Layers className="w-10 h-10 mx-auto text-white animate-pulse" />
        <p className="text-sm text-white">
          {isAf ? "Laai amptelike DBE-flitskaarte..." : "Loading official DBE flashcards..."}
        </p>
      </div>
    );
  }

  if (noneEnrolled) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center space-y-3">
        <Layers className="w-10 h-10 mx-auto text-white" />
        <h3 className="text-lg font-bold">{isAf ? "Geen flitskaarte gereed nie" : "No flashcards ready yet"}</h3>
        <p className="text-sm text-white max-w-sm mx-auto">
          {isAf
            ? "Kies eers jou vakke in Instellings. Flitskaarte verskyn sodra die amptelike DBE-vrae vir jou vakke vrygestel is."
            : "Pick your subjects in Settings. Flashcards appear once the official DBE questions for your subjects have been released."}
        </p>
        <Link href="/settings">
          <Button size="sm">{isAf ? "Gaan na Instellings" : "Go to Settings"}</Button>
        </Link>
      </div>
    );
  }

  if (sessionComplete) {
    const totalGot = isReviewMissedPass ? cumulativeGot + sessionGot : sessionGot;
    const totalMissed = isReviewMissedPass ? cumulativeMissed + sessionMissed : sessionMissed;
    const totalReviewed = isReviewMissedPass ? cumulativeGot + cumulativeMissed + sessionReviewed : sessionReviewed;
    const pct = totalReviewed > 0 ? Math.round((totalGot / totalReviewed) * 100) : 0;
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div
          className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center"
          style={{ border: "1.5px solid #00E5FF", boxShadow: "0 0 0 1px rgba(0,229,255,0.25), 0 0 28px rgba(0,229,255,0.55), inset 0 0 18px rgba(0,0,0,0.6)" }}
        >
          <Trophy className="w-10 h-10" style={{ color: "#00E5FF", filter: "drop-shadow(0 0 6px #00E5FF)" }} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {isReviewMissedPass
              ? (isAf ? "Hersieningsbeurt Klaar!" : "Review Pass Done!")
              : (isAf ? "Sessie Voltooi!" : "Session Complete!")}
          </h2>
          <p className="text-white">
            {isAf ? `Jy het ${totalReviewed} kaarte hersien` : `You reviewed ${totalReviewed} cards`}
          </p>
          {isReviewMissedPass && (
            <p className="text-xs text-cyan-400">
              {isAf ? "Gekombineerde resultate vir beide rondes" : "Combined results across both passes"}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="rounded-xl border-2 border-emerald-400/40 bg-emerald-950/30 p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{totalGot}</p>
            <p className="text-xs font-semibold text-emerald-300 mt-1">{isAf ? "Geweet ✓" : "Got it ✓"}</p>
          </div>
          <div className="rounded-xl border-2 border-red-400/40 bg-red-950/30 p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{totalMissed}</p>
            <p className="text-xs font-semibold text-red-300 mt-1">{isAf ? "Gemis ✗" : "Missed ✗"}</p>
          </div>
        </div>
        <div className="w-full max-w-xs space-y-1">
          <div className="flex justify-between text-xs text-white">
            <span>{isAf ? "Telling" : "Score"}</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 70 ? "linear-gradient(90deg,#10b981,#34d399)" : pct >= 40 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#ef4444,#f87171)",
              }}
            />
          </div>
        </div>
        <p className="text-sm text-white">
          {isAf ? `Kaarte vir môre: ${dueTomorrow}` : `Cards due tomorrow: ${dueTomorrow}`}
        </p>
        {!isReviewMissedPass && missedCards.length > 0 && (
          <Button
            onClick={startMissedReview}
            variant="outline"
            className="w-full max-w-xs border-red-400/50 text-red-400 hover:bg-red-950/30 hover:border-red-400"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isAf ? `Hersien Gemiste (${missedCards.length})` : `Review Missed (${missedCards.length})`}
          </Button>
        )}
        <div className="flex gap-3">
          <Button onClick={() => { setSessionStarted(false); setSessionComplete(false); setIsReviewMissedPass(false); }} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isAf ? "Terug" : "Back"}
          </Button>
          <Button onClick={() => startSession()}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {isAf ? "Weer Begin" : "Start Again"}
          </Button>
        </div>
      </div>
    );
  }

  if (!sessionStarted) {
    // ── Subject selection screen ─────────────────────────────────────────────
    if (selectedSubject === "all") {
      return (
        <div className="space-y-5">
          {/* Summary strip — Task #748: server-aggregated cross-device counts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([
              { icon: Target, value: serverStats?.totalReviewed ?? stats.totalReviewed, label: isAf ? "Hersien"     : "Reviewed"   },
              { icon: Zap,    value: serverStats?.dueToday ?? dueCardIds.length,        label: isAf ? "Vandag Reg"  : "Due Today"  },
              { icon: Layers, value: serverStats?.dueTomorrow ?? dueTomorrow,           label: isAf ? "Môre Reg"    : "Due Tomorrow" },
              { icon: Trophy, value: serverStats?.cardsMastered ?? 0,                   label: isAf ? "Bemeester"   : "Mastered"   },
            ] as const).map(({ icon: Icon, value, label }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <Icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
          {serverStats && (serverStats.currentStreak > 0 || serverStats.longestStreak > 0) && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-white">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{isAf ? "Huidige reeks" : "Current streak"}: <strong>{serverStats.currentStreak}</strong> {isAf ? "dae" : "days"}</span>
              </div>
              <div className="text-xs text-white/60">
                {isAf ? "Beste" : "Best"}: <strong className="text-white">{serverStats.longestStreak}</strong>
              </div>
            </div>
          )}

          {/* Subject cards */}
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
              {isAf ? "Kies 'n Vak" : "Choose a Subject"}
            </p>
            {subjects.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>
                {isAf ? "Geen vakke gereed nie" : "No subjects available"}
              </p>
            ) : subjects.map(sub => {
              void gradeTick;
              const subCards = allCards.filter(c => c.subjectCode === sub.code);
              const reviewed = subCards.filter(c => getCardState(c.id).lastReview !== null).length;
              const pct = subCards.length > 0 ? Math.round((reviewed / subCards.length) * 100) : 0;
              const topicCount = new Set(subCards.map(c => c.topicCode)).size;
              return (
                <button
                  key={sub.code}
                  onClick={() => { setSelectedSubject(sub.code); setSelectedTopic("all"); }}
                  className="w-full text-left rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99] p-4"
                  style={{
                    background: pct > 0 ? "rgba(0,229,255,0.06)" : "rgba(255,255,255,0.04)",
                    borderColor: pct > 0 ? "rgba(0,229,255,0.35)" : "rgba(255,255,255,0.10)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">{sub.name}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {subCards.length} {isAf ? "kaarte" : "cards"} · {topicCount} {isAf ? "onderwerpe" : "topics"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black" style={{ color: pct > 0 ? "#00E5FF" : "rgba(255,255,255,0.3)" }}>
                        {pct}%
                      </span>
                      <ArrowRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 80
                          ? "linear-gradient(90deg,#10b981,#34d399)"
                          : pct >= 40
                            ? "linear-gradient(90deg,#00E5FF,#8A2BFF)"
                            : "linear-gradient(90deg,#006BFF,#00E5FF)",
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // ── Topic drill-down screen ──────────────────────────────────────────────
    const subjectAllCards: FlashcardDef[] = (() => {
      if (!dbDeck) return [];
      const flat: FlashcardDef[] = [];
      for (const t of dbDeck.topics) {
        const topicLabel = isAf ? (t.nameAfrikaans || t.name) : t.name;
        for (const c of t.cards) {
          flat.push({
            id: c.id,
            subject: selectedSubjectName,
            subjectCode: selectedSubject,
            topic: topicLabel,
            topicCode: t.capsCode,
            front: c.front,
            back: c.back,
            type: (c.type === "cloze" || c.type === "reversed") ? (c.type as "cloze" | "reversed") : "basic",
          });
        }
      }
      return flat;
    })();

    void gradeTick;
    const subjectReviewed = subjectAllCards.filter(c => getCardState(c.id).lastReview !== null).length;
    const subjectPct = subjectAllCards.length > 0 ? Math.round((subjectReviewed / subjectAllCards.length) * 100) : 0;

    return (
      <div className="space-y-4">
        {/* Back to subjects */}
        <button
          onClick={() => { setSelectedSubject("all"); setSelectedTopic("all"); }}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
        >
          <ArrowLeft className="w-4 h-4" />
          {isAf ? "Alle Vakke" : "All Subjects"}
        </button>

        {/* Subject header */}
        <div className="rounded-xl border p-4 space-y-2.5"
          style={{ background: "rgba(0,229,255,0.06)", borderColor: "rgba(0,229,255,0.3)" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white">{selectedSubjectName}</h2>
            <span className="text-xs font-black" style={{ color: "#00E5FF" }}>
              {subjectReviewed}/{subjectAllCards.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${subjectPct}%`, background: "linear-gradient(90deg,#00E5FF,#8A2BFF)" }}
            />
          </div>
          {subjectAllCards.length > 0 && (
            <Button onClick={() => startSession(subjectAllCards)} size="sm" className="w-full">
              <Brain className="w-4 h-4 mr-1.5" />
              {isAf
                ? `Hersien Alles (${subjectAllCards.length} kaarte)`
                : `Review All (${subjectAllCards.length} cards)`}
            </Button>
          )}
        </div>

        {/* Topic list */}
        {!dbDeck ? (
          <div className="py-8 text-center">
            <Layers className="w-7 h-7 mx-auto mb-2 animate-pulse" style={{ color: "rgba(255,255,255,0.3)" }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              {isAf ? "Laai onderwerpe..." : "Loading topics..."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
              {isAf ? "Onderwerpe" : "Topics"}
            </p>
            {dbDeck.topics.map(t => {
              const topicLabel = isAf ? (t.nameAfrikaans || t.name) : t.name;
              const topicCards: FlashcardDef[] = t.cards.map(c => ({
                id: c.id,
                subject: selectedSubjectName,
                subjectCode: selectedSubject,
                topic: topicLabel,
                topicCode: t.capsCode,
                front: c.front,
                back: c.back,
                type: (c.type === "cloze" || c.type === "reversed") ? (c.type as "cloze" | "reversed") : "basic",
              }));
              void gradeTick;
              const rev = topicCards.filter(c => getCardState(c.id).lastReview !== null).length;
              const tot = topicCards.length;
              const pct = tot > 0 ? Math.round((rev / tot) * 100) : 0;
              return (
                <button
                  key={t.capsCode}
                  onClick={() => startSession(topicCards)}
                  disabled={tot === 0}
                  className="w-full text-left rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99] p-3.5 disabled:opacity-40"
                  style={{
                    background: pct === 100 ? "rgba(16,185,129,0.07)" : pct > 0 ? "rgba(0,229,255,0.05)" : "rgba(255,255,255,0.03)",
                    borderColor: pct === 100 ? "rgba(16,185,129,0.4)" : pct > 0 ? "rgba(0,229,255,0.25)" : "rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{topicLabel}</p>
                      {t.hasNotes && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded mt-0.5 inline-block"
                          style={{ color: "#00E5FF", border: "1px solid rgba(0,229,255,0.4)", background: "rgba(0,229,255,0.08)" }}>
                          {isAf ? "Gekureer" : "Curated"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {rev}/{tot}
                      </span>
                      {pct === 100
                        ? <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.2)", color: "#10b981" }}>✓</span>
                        : <ArrowRight className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />}
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: pct === 100 ? "linear-gradient(90deg,#10b981,#34d399)" : "linear-gradient(90deg,#00E5FF,#8A2BFF)",
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (!currentCard) return null;

  const cardState = getCardState(currentCard.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => { setSessionStarted(false); setFlipped(false); }} className="flex items-center gap-1 text-sm text-white hover:bg-white/5 px-1 rounded transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {isAf ? "Verlaat" : "Exit"}
        </button>
        <div className="flex items-center gap-3">
          {isReviewMissedPass && (
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
              style={{
                color: "#fca5a5",
                background: "rgba(239,68,68,0.12)",
                borderColor: "rgba(239,68,68,0.45)",
              }}
              data-testid="badge-redrill"
            >
              {isAf ? "Her-oefen" : "Re-drill"}
            </span>
          )}
          <span className="text-xs text-white font-semibold">
            {currentIndex + 1} / {reviewQueue.length}
          </span>
          {isReviewMissedPass ? (
            <div
              className="w-24 h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(239,68,68,0.15)" }}
              data-testid="progress-redrill"
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / reviewQueue.length) * 100}%`,
                  background: "linear-gradient(90deg,#ef4444,#f59e0b)",
                }}
              />
            </div>
          ) : (
            <Progress value={((currentIndex + 1) / reviewQueue.length) * 100} className="w-24 h-2" />
          )}
        </div>
      </div>

      <div className="text-center mb-2">
        <span className="text-xs text-white bg-black border border-white/15 px-2 py-1 rounded-full">
          {currentCard.topic}
        </span>
      </div>

      {/* Swipe direction hints */}
      <div className="flex justify-between items-center px-1 mb-1 select-none pointer-events-none">
        <div
          className="flex items-center gap-1 text-xs font-bold transition-opacity duration-150"
          style={{ color: "#ef4444", opacity: swipeDelta < -20 ? Math.min(1, (Math.abs(swipeDelta) - 20) / 60) : 0.18 }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isAf ? "Weet nie" : "Don't know"}
        </div>
        <div
          className="flex items-center gap-1 text-xs font-bold transition-opacity duration-150"
          style={{ color: "#10b981", opacity: swipeDelta > 20 ? Math.min(1, (swipeDelta - 20) / 60) : 0.18 }}
        >
          {isAf ? "Het dit!" : "Got it!"}
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      <div
        className="cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={!isDragging.current ? handleFlip : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative w-full"
          style={{
            transformStyle: "preserve-3d",
            transform: (() => {
              const tilt = Math.min(12, Math.abs(swipeDelta) * 0.08) * (swipeDelta < 0 ? -1 : 1);
              const flip = flipped ? "rotateY(180deg)" : "rotateY(0deg)";
              const drag = swipeDelta !== 0 ? `translateX(${swipeDelta * 0.3}px) rotateZ(${tilt}deg)` : "";
              return drag ? `${flip} ${drag}` : flip;
            })(),
            transition: swipeDelta !== 0 ? "none" : "transform 0.5s ease",
            minHeight: "280px",
          }}
        >
          <div
            className="absolute inset-0 rounded-2xl border-2 bg-card p-6 sm:p-8 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              borderColor: swipeDelta > 30 ? "rgba(16,185,129,0.6)" : swipeDelta < -30 ? "rgba(239,68,68,0.6)" : "rgba(var(--primary),0.2)",
              transition: swipeDelta !== 0 ? "border-color 0.1s" : "border-color 0.3s",
            }}
          >
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-bold text-primary/60 uppercase">{isAf ? "Voorkant" : "Front"}</span>
            </div>
            {currentCard.type === "cloze" && (
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Cloze</span>
              </div>
            )}
            <p className="text-lg sm:text-xl font-semibold text-white text-center leading-relaxed whitespace-pre-line">
              {currentCard.front.replace(/\{\{___\}\}/g, "______")}
            </p>
            <p className="text-xs text-white mt-6">
              {isAf ? "Tik of sleep om te beoordeel" : "Tap to flip · swipe to grade"}
            </p>
          </div>

          <div
            className="absolute inset-0 rounded-2xl border-2 bg-card p-6 sm:p-8 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderColor: swipeDelta > 30 ? "rgba(16,185,129,0.6)" : swipeDelta < -30 ? "rgba(239,68,68,0.6)" : "rgba(52,211,153,0.4)",
              transition: swipeDelta !== 0 ? "border-color 0.1s" : "border-color 0.3s",
            }}
          >
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-bold text-emerald-500/60 uppercase">{isAf ? "Antwoord" : "Answer"}</span>
            </div>
            <p className="text-base sm:text-lg font-medium text-white text-center leading-relaxed whitespace-pre-line">
              {currentCard.back}
            </p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-xs text-center text-white font-semibold">
            {isAf ? "Hoe goed het jy dit geken?" : "How well did you know this?"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { quality: 1, label: isAf ? "Weer" : "Again", labelShort: "1", color: "text-red-500 border-red-200 hover:bg-red-50", desc: isAf ? "<1 min" : "<1 min" },
              { quality: 2, label: isAf ? "Moeilik" : "Hard", labelShort: "2", color: "text-amber-500 border-amber-200 hover:bg-amber-50", desc: isAf ? "1 dag" : "1 day" },
              { quality: 3, label: isAf ? "Goed" : "Good", labelShort: "3", color: "text-emerald-500 border-emerald-200 hover:bg-emerald-50", desc: cardState.I > 0 ? `${Math.max(1, Math.round(cardState.I * cardState.EF))}d` : "6d" },
              { quality: 5, label: isAf ? "Maklik" : "Easy", labelShort: "4", color: "text-cyan-500 border-cyan-200 hover:bg-cyan-50", desc: cardState.I > 0 ? `${Math.max(1, Math.round(cardState.I * cardState.EF * 1.3))}d` : "10d" },
            ].map(({ quality, label, labelShort, color, desc }) => (
              <button
                key={quality}
                onClick={() => handleGrade(quality)}
                className={`flex flex-col items-center gap-0.5 p-3 rounded-xl border-2 ${color} transition-all active:scale-95 hover:scale-[1.02]`}
              >
                <span className="font-bold text-sm">{label}</span>
                <span className="text-[10px] text-white">{desc}</span>
                <span className="text-[9px] text-white">({labelShort})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


export default function FlashcardsPage() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            <div className="flex items-center gap-3">
              <nav className="hidden md:flex items-center gap-0.5">
                <Link href="/dashboard">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:bg-white/5 transition-all">
                    <BookOpen className="w-3.5 h-3.5" />
                    {isAf ? "Tuis" : "Home"}
                  </button>
                </Link>
                <Link href="/subjects">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:bg-white/5 transition-all">
                    <Layers className="w-3.5 h-3.5" />
                    {isAf ? "Vakke" : "Subjects"}
                  </button>
                </Link>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary transition-all">
                  <Brain className="w-3.5 h-3.5" />
                  {isAf ? "Flitskaarte" : "Flashcards"}
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleLanguage}
                className="text-xs font-bold text-white px-2 py-1 rounded-lg border border-white/20 hover:border-white/30 hover:bg-white/5 transition-all"
              >
                {language === "en" ? "EN" : "AF"}
              </button>
              <button
                onClick={() => logout()}
                className="text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                title={isAf ? "Uitteken" : "Sign Out"}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              {isAf ? "Terug" : "Back"}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isAf ? "Flitskaarte" : "Flashcards"}
            </h1>
            <p className="text-sm text-white">
              {isAf ? "Hersien met gespaseerde herhaling" : "Review with spaced repetition"}
            </p>
          </div>
        </div>

        <FlashcardReview isAf={isAf} />

        <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center space-y-2">
          <p className="text-sm font-semibold text-white">
            {isAf ? "Soek jy 'n vasvra?" : "Looking for a quiz?"}
          </p>
          <p className="text-xs text-white max-w-md mx-auto">
            {isAf
              ? "Doen amptelike DBE-vrae per vak — gaan na Vakke en kies 'n Boost-vasvraag of 'n Daaglikse Uitdaging."
              : "Practice with official DBE-seeded questions — open Subjects and pick a Boost Quiz, or take today's Daily Challenge."}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Link href="/subjects">
              <Button size="sm" variant="outline">{isAf ? "Vakke" : "Subjects"}</Button>
            </Link>
            <Link href="/daily-challenge">
              <Button size="sm">{isAf ? "Daaglikse Uitdaging" : "Daily Challenge"}</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
