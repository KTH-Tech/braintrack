import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/lib/language-context";
import { LearnerHeader } from "@/components/learner-header";
import { GraffitiSplats, GraffitiMark } from "@/components/graffiti-splats";
import {
  ArrowLeft,
  Brain,
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

// Street-pastel tokens — the graffiti palette. Reviewed cards stamp the "tag
// wall" cycling through these so a finished deck reads as a colourful wall.
const STREET_PASTELS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"] as const;

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
    // Grading only fires once the card has actually been flipped — swiping
    // on the front (before the answer is visible) must never silently grade
    // a card the learner hasn't seen the answer to yet.
    if (!flipped) return;
    if (delta > SWIPE_THRESHOLD) {
      handleGrade(5);
    } else if (delta < -SWIPE_THRESHOLD) {
      handleGrade(1);
    }
  }, [swipeDelta, flipped, handleGrade]);

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
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center space-y-3" style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508", animation: "bt-fadeup .4s both" }}>
        <Layers className="w-10 h-10 mx-auto" style={{ color: "#9FD8FF", animation: "bt-pulse 1.6s ease-in-out infinite" }} />
        <p className="text-sm text-white">
          {isAf ? "Laai amptelike DBE-flitskaarte..." : "Loading official DBE flashcards..."}
        </p>
        <style>{`@keyframes bt-pulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }`}</style>
      </div>
    );
  }

  if (noneEnrolled) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center space-y-3" style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508" }}>
        <Layers className="w-10 h-10 mx-auto" style={{ color: "#C5B3FF" }} />
        <h3 className="text-lg font-bold text-white">{isAf ? "Geen flitskaarte gereed nie" : "No flashcards ready yet"}</h3>
        <p className="text-sm text-white max-w-sm mx-auto">
          {isAf
            ? "Kies eers jou vakke in Instellings. Flitskaarte verskyn sodra die amptelike DBE-vrae vir jou vakke vrygestel is."
            : "Pick your subjects in Settings. Flashcards appear once the official DBE questions for your subjects have been released."}
        </p>
        <Link href="/settings">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)", color: "#050508", fontWeight: 800 }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            {isAf ? "Gaan na Instellings" : "Go to Settings"}
          </button>
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
      <div className="flex flex-col items-center justify-center py-12 space-y-6" style={{ animation: "bt-fadeup .5s both" }}>
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508", border: "1.5px solid #FFE29A", boxShadow: "0 0 0 1.5px rgba(255,226,154,0.45), 0 12px 26px rgba(0,0,0,0.5)" }}
        >
          <Trophy className="w-10 h-10" style={{ color: "#FFE29A" }} />
        </div>
        <div className="text-center space-y-2">
          <span
            style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: "#94F7C5", transform: "rotate(-2deg)", display: "inline-block" }}
          >
            {isAf ? "Jy het dit gekraak! 🔥" : "You smashed it! 🔥"}
          </span>
          <h2 className="text-2xl font-bold text-white">
            {isReviewMissedPass
              ? (isAf ? "Hersieningsbeurt Klaar!" : "Review Pass Done!")
              : (isAf ? "Sessie Voltooi!" : "Session Complete!")}
          </h2>
          <p className="text-white">
            {isAf ? `Jy het ${totalReviewed} kaarte hersien` : `You reviewed ${totalReviewed} cards`}
          </p>
          {isReviewMissedPass && (
            <p className="text-xs" style={{ color: "#9FD8FF" }}>
              {isAf ? "Gekombineerde resultate vir beide rondes" : "Combined results across both passes"}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="rounded-xl p-4 text-center" style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508", border: "1.5px solid #94F7C5" }}>
            <p className="text-3xl font-bold" style={{ color: "#94F7C5" }}>{totalGot}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: "#94F7C5" }}>{isAf ? "Geweet ✓" : "Got it ✓"}</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508", border: "1.5px solid #FF8DA1" }}>
            <p className="text-3xl font-bold" style={{ color: "#FF8DA1" }}>{totalMissed}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: "#FF8DA1" }}>{isAf ? "Gemis ✗" : "Missed ✗"}</p>
          </div>
        </div>

        {/* Graffiti tag wall — every card you reviewed slaps a tag on the wall:
            colourful stars for wins, pink sparks for misses (shape-coded so it
            reads regardless of colour). Each tag stamps on with a bt- pop. */}
        {(totalGot + totalMissed) > 0 && (
          <div className="w-full max-w-xs space-y-1.5">
            <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFB7E5", transform: "rotate(-2deg)", display: "inline-block" }}>
              {isAf ? "Jou muur 🧱" : "Your wall 🧱"}
            </span>
            <div
              className="flex flex-wrap gap-1.5 justify-center rounded-xl p-3"
              style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508", border: "1.5px dashed rgba(159,245,232,0.4)" }}
              data-testid="stamp-wall"
            >
              {Array.from({ length: Math.min(totalGot, 40) }).map((_, i) => (
                <span key={"g" + i} style={{ display: "inline-block", transform: `rotate(${(i % 3 - 1) * 11}deg)` }}>
                  <span style={{ display: "inline-block", animation: "bt-stamp-pop .4s both", animationDelay: `${Math.min(i, 24) * 32}ms` }}>
                    <GraffitiMark kind="star" color={STREET_PASTELS[i % STREET_PASTELS.length]} size={20} />
                  </span>
                </span>
              ))}
              {Array.from({ length: Math.min(totalMissed, 40) }).map((_, i) => (
                <span key={"m" + i} style={{ display: "inline-block", transform: `rotate(${(i % 3 - 1) * 11}deg)` }}>
                  <span style={{ display: "inline-block", animation: "bt-stamp-pop .4s both", animationDelay: `${Math.min(totalGot + i, 24) * 32}ms` }}>
                    <GraffitiMark kind="spark" color="#FF8DA1" size={20} />
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

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
                background: pct >= 70 ? "linear-gradient(90deg,#94F7C5,#9FF5E8)" : pct >= 40 ? "linear-gradient(90deg,#FFE29A,#FFB7E5)" : "linear-gradient(90deg,#FF8DA1,#FFB7E5)",
              }}
            />
          </div>
        </div>
        <p className="text-sm text-white">
          {isAf ? `Kaarte vir môre: ${dueTomorrow}` : `Cards due tomorrow: ${dueTomorrow}`}
        </p>
        {!isReviewMissedPass && missedCards.length > 0 && (
          <button
            type="button"
            onClick={startMissedReview}
            className="w-full max-w-xs inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-sm bg-white/[.03] hover:bg-white/10 transition-all"
            style={{ color: "#FF8DA1", border: "1.5px solid #FF8DA1" }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isAf ? `Hersien Gemiste (${missedCards.length})` : `Review Missed (${missedCards.length})`}
          </button>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setSessionStarted(false); setSessionComplete(false); setIsReviewMissedPass(false); }}
            className="inline-flex items-center px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-transparent hover:bg-white/10 transition-all"
            style={{ border: "1.5px solid rgba(255,255,255,.2)" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isAf ? "Terug" : "Back"}
          </button>
          <button
            type="button"
            onClick={() => startSession()}
            className="inline-flex items-center px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)", color: "#050508", fontWeight: 800 }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isAf ? "Weer Begin" : "Start Again"}
          </button>
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
              { icon: Target, value: serverStats?.totalReviewed ?? stats.totalReviewed, label: isAf ? "Hersien"     : "Reviewed",     hex: "#9FF5E8" },
              { icon: Zap,    value: serverStats?.dueToday ?? dueCardIds.length,        label: isAf ? "Vandag Reg"  : "Due Today",    hex: "#9FD8FF" },
              { icon: Layers, value: serverStats?.dueTomorrow ?? dueTomorrow,           label: isAf ? "Môre Reg"    : "Due Tomorrow", hex: "#FFB7E5" },
              { icon: Trophy, value: serverStats?.cardsMastered ?? 0,                   label: isAf ? "Bemeester"   : "Mastered",     hex: "#C5B3FF" },
            ] as const).map(({ icon: Icon, value, label, hex }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508", border: `1px solid ${hex}55` }}>
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: hex }} />
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-[10px] text-white font-semibold uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
          {serverStats && (serverStats.currentStreak > 0 || serverStats.longestStreak > 0) && (
            <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508", border: "1px solid rgba(255,226,154,.4)" }}>
              <div className="flex items-center gap-2 text-sm text-white">
                <Zap className="w-4 h-4" style={{ color: "#FFE29A" }} />
                <span>{isAf ? "Huidige reeks" : "Current streak"}: <strong>{serverStats.currentStreak}</strong> {isAf ? "dae" : "days"} 🔥</span>
              </div>
              <div className="text-xs text-white">
                {isAf ? "Beste" : "Best"}: <strong className="text-white">{serverStats.longestStreak}</strong>
              </div>
            </div>
          )}

          {/* Subject cards */}
          <div className="space-y-2">
            <p style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFE29A", transform: "rotate(-2deg)", display: "inline-block" }}>
              {isAf ? "Kies 'n Vak" : "Choose a Subject"}
            </p>
            {subjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center space-y-1.5" style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508" }}>
                <Layers className="w-7 h-7 mx-auto" style={{ color: "#C5B3FF" }} />
                <p className="text-sm font-semibold text-white">
                  {isAf ? "Geen vakke gereed nie" : "No subjects available"}
                </p>
              </div>
            ) : subjects.map((sub, subIdx) => {
              void gradeTick;
              const subCards = allCards.filter(c => c.subjectCode === sub.code);
              const reviewed = subCards.filter(c => getCardState(c.id).lastReview !== null).length;
              const pct = subCards.length > 0 ? Math.round((reviewed / subCards.length) * 100) : 0;
              const topicCount = new Set(subCards.map(c => c.topicCode)).size;
              const hex = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"][subIdx % 6];
              return (
                <button
                  key={sub.code}
                  onClick={() => { setSelectedSubject(sub.code); setSelectedTopic("all"); }}
                  className="w-full text-left rounded-2xl transition-all p-4"
                  style={{
                    background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508",
                    border: pct > 0 ? `1.5px solid ${hex}` : "1px solid rgba(255,255,255,.08)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = hex; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = pct > 0 ? hex : "rgba(255,255,255,.08)"; }}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">{sub.name}</p>
                      <p className="text-[11px] mt-0.5 text-white">
                        {subCards.length} {isAf ? "kaarte" : "cards"} · {topicCount} {isAf ? "onderwerpe" : "topics"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black" style={{ color: pct > 0 ? hex : "#ffffff" }}>
                        {pct}%
                      </span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 80
                          ? "linear-gradient(90deg,#94F7C5,#9FF5E8)"
                          : "linear-gradient(90deg,#9FF5E8,#C5B3FF)",
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
          className="flex items-center gap-1.5 text-sm font-bold transition-colors"
          style={{ color: "#9FD8FF" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={e => (e.currentTarget.style.color = "#9FD8FF")}
        >
          <ArrowLeft className="w-4 h-4" />
          {isAf ? "Alle Vakke" : "All Subjects"}
        </button>

        {/* Subject header */}
        <div className="rounded-2xl p-4 space-y-2.5"
          style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508", border: "1.5px solid #9FD8FF" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white">{selectedSubjectName}</h2>
            <span className="text-xs font-black" style={{ color: "#9FD8FF" }}>
              {subjectReviewed}/{subjectAllCards.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${subjectPct}%`, background: "linear-gradient(90deg,#9FF5E8,#C5B3FF)" }}
            />
          </div>
          {subjectAllCards.length > 0 && (
            <button
              type="button"
              onClick={() => startSession(subjectAllCards)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all"
              style={{ background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)", color: "#050508", fontWeight: 800 }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              <Brain className="w-4 h-4 mr-1.5" />
              {isAf
                ? `Hersien Alles (${subjectAllCards.length} kaarte)`
                : `Review All (${subjectAllCards.length} cards)`}
            </button>
          )}
        </div>

        {/* Topic list */}
        {!dbDeck ? (
          <div className="py-8 text-center" style={{ animation: "bt-fadeup .3s both" }}>
            <Layers className="w-7 h-7 mx-auto mb-2" style={{ color: "#9FD8FF", animation: "bt-pulse 1.6s ease-in-out infinite" }} />
            <p className="text-sm text-white">
              {isAf ? "Laai onderwerpe..." : "Loading topics..."}
            </p>
            <style>{`@keyframes bt-pulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }`}</style>
          </div>
        ) : (
          <div className="space-y-2">
            <p style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#FFB7E5", transform: "rotate(-2deg)", display: "inline-block" }}>
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
                  className="w-full text-left rounded-2xl transition-all p-3.5 disabled:opacity-40"
                  style={{
                    background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508",
                    border: pct === 100 ? "1.5px solid #94F7C5" : pct > 0 ? "1.5px solid rgba(159,216,255,.55)" : "1px solid rgba(255,255,255,.08)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{topicLabel}</p>
                      {t.hasNotes && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded mt-0.5 inline-block"
                          style={{ color: "#9FD8FF", border: "1px solid rgba(159,216,255,0.4)", background: "rgba(159,216,255,0.08)" }}>
                          {isAf ? "Gekureer" : "Curated"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-white">
                        {rev}/{tot}
                      </span>
                      {pct === 100
                        ? <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: "rgba(148,247,197,0.2)", color: "#94F7C5" }}>✓</span>
                        : <ArrowRight className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: pct === 100 ? "linear-gradient(90deg,#94F7C5,#9FF5E8)" : "linear-gradient(90deg,#9FF5E8,#C5B3FF)",
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
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <button onClick={() => { setSessionStarted(false); setFlipped(false); }} className="flex items-center gap-1 text-sm text-white hover:bg-white/5 px-1 rounded transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {isAf ? "Verlaat" : "Exit"}
          </button>
          <div className="flex items-center gap-2.5">
            {isReviewMissedPass && (
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                style={{
                  color: "#FF8DA1",
                  background: "rgba(255,141,161,0.12)",
                  borderColor: "rgba(255,141,161,0.45)",
                }}
                data-testid="badge-redrill"
              >
                {isAf ? "Her-oefen" : "Re-drill"}
              </span>
            )}
            {/* Marker count — graffiti tag-count accent (≥15px per legibility rule) */}
            <span
              style={{
                fontFamily: "'Permanent Marker',cursive",
                fontSize: 18,
                lineHeight: 1,
                color: isReviewMissedPass ? "#FF8DA1" : "#9FF5E8",
                transform: "rotate(-3deg)",
                display: "inline-block",
              }}
              data-testid="text-card-count"
            >
              {currentIndex + 1}/{reviewQueue.length}
            </span>
          </div>
        </div>

        {/* Graffiti tag wall — each reviewed card stamps a coloured tag; the
            wall "fills up" as you work through the deck. Falls back to a spray
            strip for very large decks so it never overwhelms the header. */}
        {reviewQueue.length <= 26 ? (
          <div className="flex flex-wrap items-center gap-[3px]" data-testid="progress-tagwall" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemax={reviewQueue.length}>
            {Array.from({ length: reviewQueue.length }).map((_, i) => {
              const col = isReviewMissedPass ? "#FF8DA1" : STREET_PASTELS[i % STREET_PASTELS.length];
              if (i < currentIndex) {
                // reviewed — a solid slapped tag
                return (
                  <span
                    key={i}
                    style={{ width: 11, height: 11, borderRadius: 3, background: col, transform: `rotate(${i % 2 ? 9 : -9}deg)`, display: "inline-block", boxShadow: "0 1px 2px rgba(0,0,0,0.55)" }}
                  />
                );
              }
              if (i === currentIndex) {
                // current — a fresh tag with a ring
                return (
                  <span
                    key={i}
                    style={{ width: 13, height: 13, borderRadius: 3, background: col, transform: "rotate(-6deg)", display: "inline-block", boxShadow: `0 0 0 2px #050508, 0 0 0 3.5px ${col}` }}
                  />
                );
              }
              // upcoming — an empty outlined slot
              return (
                <span key={i} style={{ width: 9, height: 9, borderRadius: 2.5, border: `1.5px solid ${col}`, display: "inline-block", opacity: 1 }} />
              );
            })}
          </div>
        ) : (
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.1)" }} data-testid="progress-redrill">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / reviewQueue.length) * 100}%`,
                background: isReviewMissedPass ? "linear-gradient(90deg,#FF8DA1,#FFE29A)" : "linear-gradient(90deg,#9FF5E8,#C5B3FF)",
              }}
            />
          </div>
        )}
      </div>

      {/* Topic tag — a graffiti sticker slapped on the wall: solid pastel,
          dark ink, marker face, peeled at a tilt. Dark-on-bright = high
          contrast so the topic stays instantly readable. */}
      <div className="text-center mb-3">
        <span
          className="inline-block px-3 py-1 rounded-lg max-w-[88%] align-middle"
          style={{
            fontFamily: "'Permanent Marker',cursive",
            fontSize: 15,
            lineHeight: 1.2,
            color: "#050508",
            background: "#FFE29A",
            transform: "rotate(-2deg)",
            boxShadow: "0 3px 0 rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.45)",
          }}
          data-testid="text-card-topic"
        >
          {currentCard.topic}
        </span>
      </div>

      {/* Swipe direction hints */}
      <div className="flex justify-between items-center px-1 mb-1 select-none pointer-events-none">
        <div
          className="flex items-center gap-1 text-xs font-bold transition-opacity duration-150"
          style={{ color: "#FF8DA1", opacity: swipeDelta < -20 ? Math.min(1, (Math.abs(swipeDelta) - 20) / 60) : 0.18 }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isAf ? "Weet nie" : "Don't know"}
        </div>
        <div
          className="flex items-center gap-1 text-xs font-bold transition-opacity duration-150"
          style={{ color: "#94F7C5", opacity: swipeDelta > 20 ? Math.min(1, (swipeDelta - 20) / 60) : 0.18 }}
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
            minHeight: "300px",
          }}
        >
          {/* FRONT face — opaque #050508 ground so the background graffiti can
              never bleed through and muddy the question text. */}
          <div
            className="absolute inset-0 rounded-2xl border-2 p-6 sm:p-8 flex flex-col items-center justify-center overflow-y-auto"
            style={{
              background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508",
              boxShadow: "0 16px 34px rgba(0,0,0,0.55)",
              backfaceVisibility: "hidden",
              borderColor: swipeDelta > 30 ? "rgba(148,247,197,0.7)" : swipeDelta < -30 ? "rgba(255,141,161,0.7)" : "rgba(159,245,232,0.45)",
              transition: swipeDelta !== 0 ? "border-color 0.1s" : "border-color 0.3s",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* sticker corner — marker tag peeled on the card */}
            <div className="absolute top-3 left-3 z-10">
              <span
                className="inline-block px-2 py-0.5 rounded-md"
                style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, lineHeight: 1, color: "#050508", background: "#9FF5E8", transform: "rotate(-5deg)", boxShadow: "0 2px 0 rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.4)" }}
              >
                {isAf ? "VOOR" : "FRONT"}
              </span>
            </div>
            {currentCard.type === "cloze" && (
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-block px-2 py-0.5 rounded-md" style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, lineHeight: 1, color: "#050508", background: "#FFE29A", transform: "rotate(4deg)", boxShadow: "0 2px 0 rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.4)" }}>CLOZE</span>
              </div>
            )}
            {/* decorative corner tag — reuses the page graffiti art, kept BEHIND
                the study text (zIndex -1) so it can never obscure the question. */}
            <GraffitiMark kind="star" color="#C5B3FF" size={30} rotate={-14} style={{ position: "absolute", bottom: 12, right: 12, zIndex: -1 }} />
            <p className="text-lg sm:text-xl font-semibold text-white text-center leading-relaxed whitespace-pre-line px-1">
              {currentCard.front.replace(/\{\{___\}\}/g, "______")}
            </p>
            {/* TAP TO FLIP — marker accent with a hand-drawn arrow */}
            <span className="mt-7 inline-flex items-center gap-1.5" style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, lineHeight: 1, color: "#9FF5E8", transform: "rotate(-1.5deg)" }}>
              <GraffitiMark kind="arrow" color="#9FF5E8" size={22} rotate={-6} />
              {isAf ? "TIK OM TE DRAAI" : "TAP TO FLIP"}
            </span>
          </div>

          {/* BACK face — same opaque ground; the answer is the study content, so
              it stays large, pure-white and high-contrast (graffiti only frames). */}
          <div
            className="absolute inset-0 rounded-2xl border-2 p-6 sm:p-8 flex flex-col items-center justify-center overflow-y-auto"
            style={{
              background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508",
              boxShadow: "0 16px 34px rgba(0,0,0,0.55)",
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderColor: swipeDelta > 30 ? "rgba(148,247,197,0.7)" : swipeDelta < -30 ? "rgba(255,141,161,0.7)" : "rgba(148,247,197,0.5)",
              transition: swipeDelta !== 0 ? "border-color 0.1s" : "border-color 0.3s",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="absolute top-3 left-3 z-10">
              <span
                className="inline-block px-2 py-0.5 rounded-md"
                style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, lineHeight: 1, color: "#050508", background: "#94F7C5", transform: "rotate(-5deg)", boxShadow: "0 2px 0 rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.4)" }}
              >
                {isAf ? "ANTW" : "ANSWER"}
              </span>
            </div>
            <GraffitiMark kind="spark" color="#9FD8FF" size={28} rotate={12} style={{ position: "absolute", bottom: 12, right: 12, zIndex: -1 }} />
            {/* spray-tag reveal — the answer sprays on when the card is flipped */}
            <div className="w-full" style={{ animation: flipped ? "bt-spray-reveal .5s both" : "none" }}>
              <p className="text-base sm:text-lg font-medium text-white text-center leading-relaxed whitespace-pre-line px-1">
                {currentCard.back}
              </p>
            </div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="space-y-3" style={{ animation: "bt-fadeup .25s both" }}>
          <p className="text-xs text-center text-white font-semibold">
            {isAf ? "Hoe goed het jy dit geken?" : "How well did you know this?"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { quality: 1, label: isAf ? "Weer" : "Again", labelShort: "1", hex: "#FF8DA1", desc: isAf ? "<1 min" : "<1 min" },
              { quality: 2, label: isAf ? "Moeilik" : "Hard", labelShort: "2", hex: "#FFE29A", desc: isAf ? "1 dag" : "1 day" },
              { quality: 3, label: isAf ? "Goed" : "Good", labelShort: "3", hex: "#94F7C5", desc: cardState.I > 0 ? `${Math.max(1, Math.round(cardState.I * cardState.EF))}d` : "6d" },
              { quality: 5, label: isAf ? "Maklik" : "Easy", labelShort: "4", hex: "#9FD8FF", desc: cardState.I > 0 ? `${Math.max(1, Math.round(cardState.I * cardState.EF * 1.3))}d` : "10d" },
            ].map(({ quality, label, labelShort, hex, desc }) => (
              <button
                key={quality}
                onClick={() => handleGrade(quality)}
                className="flex flex-col items-center gap-0.5 p-3 rounded-xl transition-all active:scale-95 hover:scale-[1.02]"
                style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508", border: `2px solid ${hex}` }}
              >
                <span className="font-bold text-sm" style={{ color: hex }}>{label}</span>
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
  const { language } = useLanguage();
  const isAf = language === "af";

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
      <GraffitiSplats variant="full" opacity={0.4} />
      <LearnerHeader
        backHref="/dashboard"
        backLabel={isAf ? "Tuis" : "Home"}
        title={isAf ? "Flitskaarte" : "Flashcards"}
        titleColor="#9FF5E8"
        maxWidthClassName="max-w-7xl"
      />

      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-1">
          <span
            style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#9FF5E8", transform: "rotate(-2deg)", display: "inline-block" }}
          >
            {isAf ? "Gespaseerde herhaling" : "Spaced repetition"}
          </span>
          <div
            role="heading"
            aria-level={1}
            className="text-3xl font-black tracking-tight leading-[0.98]"
            style={{
              backgroundImage: "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {isAf ? "Flitskaarte" : "Flashcards"}
          </div>
          <p className="text-sm text-white">
            {isAf ? "Hersien slim, onthou langer 🧠" : "Review smart, remember longer 🧠"}
          </p>
        </div>

        <FlashcardReview isAf={isAf} />

        <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center space-y-2" style={{ background: "linear-gradient(rgba(255,255,255,.05), rgba(255,255,255,.05)), #050508" }}>
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
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10 transition-all"
                style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }}
              >
                {isAf ? "Vakke" : "Subjects"}
              </button>
            </Link>
            <Link href="/daily-challenge">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-sm transition-all"
                style={{ background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)", color: "#050508", fontWeight: 800 }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                {isAf ? "Daaglikse Uitdaging" : "Daily Challenge"}
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
