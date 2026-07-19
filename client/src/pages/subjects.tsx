import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import type { OnboardingResult, Subject } from "@shared/schema";
import {
  BookOpen,
  Search,
  ChevronRight,
  ArrowLeft,
  LogOut,
  Settings,
  GraduationCap,
  Sparkles,
  ArrowUpDown,
  Target,
  FileText,
  Sigma,
  Ruler,
  FlaskConical,
  Leaf,
  Calculator,
  Briefcase,
  Coins,
  Globe2,
  ScrollText,
  MessageSquare,
  PenLine,
  Laptop,
  Cpu,
  Palette,
  Music2,
  Drama,
  Camera,
  Utensils,
  Hammer,
  Shirt,
  Church,
  HeartHandshake,
  Wrench,
  Zap,
  Building2,
  TreePine,
  Dumbbell,
  Plus,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { SUBJECT_CATEGORIES } from "@/lib/constants";
import { useLanguage } from "@/lib/language-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GraffitiSplats } from "@/components/graffiti-splats";

function getSubjectLucide(name: string): LucideIcon {
  const n = (name || "").toLowerCase();
  if (n.includes("mathematical literacy")) return Calculator;
  if (n.includes("technical math")) return Ruler;
  if (n.includes("math")) return Sigma;
  if (n.includes("physical science")) return FlaskConical;
  if (n.includes("life science")) return Leaf;
  if (n.includes("natural science")) return Leaf;
  if (n.includes("accounting")) return Coins;
  if (n.includes("business")) return Briefcase;
  if (n.includes("economics")) return Coins;
  if (n.includes("geography")) return Globe2;
  if (n.includes("history")) return ScrollText;
  if (n.includes("tourism")) return Globe2;
  if (n.includes("afrikaans")) return MessageSquare;
  if (n.includes("english")) return PenLine;
  if (n.includes("zulu") || n.includes("xhosa") || n.includes("sotho") || n.includes("tswana") || n.includes("venda") || n.includes("tsonga") || n.includes("ndebele") || n.includes("swati") || n.includes("sepedi") || n.includes("pedi")) return MessageSquare;
  if (n.includes("information technology")) return Laptop;
  if (n.includes("computer applications") || /\bcat\b/.test(n)) return Cpu;
  if (n.includes("visual art")) return Palette;
  if (n.includes("design")) return Palette;
  if (n.includes("music")) return Music2;
  if (n.includes("dramatic") || n.includes("drama")) return Drama;
  if (n.includes("dance")) return Drama;
  if (n.includes("consumer")) return Utensils;
  if (n.includes("hospitality")) return Utensils;
  if (n.includes("engineering graphic") || n.includes("egd")) return Hammer;
  if (n.includes("mechanical technology")) return Wrench;
  if (n.includes("electrical technology")) return Zap;
  if (n.includes("civil technology")) return Building2;
  if (n.includes("agricultural")) return TreePine;
  if (n.includes("religion")) return Church;
  if (n.includes("life orientation")) return HeartHandshake;
  if (n.includes("physical education") || n.includes("sport")) return Dumbbell;
  if (n.includes("fashion") || n.includes("textile")) return Shirt;
  if (n.includes("media") || n.includes("photograph")) return Camera;
  return BookOpen;
}

const RAINBOW = [
  "#9FF5E8",
  "#9FD8FF",
  "#FFB7E5",
  "#C5B3FF",
  "#FFE29A",
  "#94F7C5",
];

type SortMode = "alpha" | "weak" | "practiced";

interface SubjectProgress {
  subjectId: number;
  subjectName: string;
  accuracy: number;
  questionsAttempted: number;
  papersCompleted: number;
}
interface ProgressStats {
  subjectProgress?: SubjectProgress[];
}

const T = {
  en: {
    homeLabel: "Home",
    subjectsLabel: "Subjects",
    flashcardsLabel: "Flashcards",
    signOut: "Sign Out",
    capsLabel: "Grade 12 · CAPS",
    heroHeading: "Your classroom.",
    heroSubtitle: "Pick a subject and jump in. Real NSC papers, memos and practice — all in one place.",
    noSubjectsTitle: "No subjects selected yet",
    noSubjectsDesc: "Head to Settings to pick the subjects you're writing.",
    settingsLink: "Settings",
    searchPlaceholder: "Search subjects...",
    sortAlpha: "A–Z",
    sortWeak: "Weakest",
    sortPracticed: "Most practiced",
    allSubjects: "All Subjects",
    noSubjectsFound: "No subjects found",
    tryDifferentSearch: "Try a different search term",
    subjectsWillAppear: "Subjects will appear here once imported",
    browseAllTitle: "Browse all subjects",
    availableToAdd: "available to add",
    subjectSingular: "subject",
    subjectPlural: "subjects",
    closeBtn: "Close",
    browseBtnLabel: "Add / Browse subjects",
    addSubjectsBtn: "Add subjects",
    noSubjectsDescBrowse: "Add your subjects below, or head to Settings to pick the subjects you're writing.",
    subjectAddedTitle: "Subject added!",
    subjectAddedDesc: "The subject has been added to your profile.",
    errorTitle: "Error",
    errorAddSubject: "Could not add subject. Please try again.",
    searchBrowsePlaceholder: "Search all NSC subjects...",
    addingBtn: "Adding...",
    addBtn: "Add",
    notStarted: "Not started",
    strong: "Strong",
    progressing: "Progressing",
    keepPractising: "Keep practising",
    weakSpot: "Weak spot",
    questionsUnit: "Qs",
    papersUnit: "papers",
  },
  af: {
    homeLabel: "Tuis",
    subjectsLabel: "Vakke",
    flashcardsLabel: "Flitskaarte",
    signOut: "Uitteken",
    capsLabel: "Graad 12 · KABV",
    heroHeading: "Jou klaskamer.",
    heroSubtitle: "Kies 'n vak en duik in. Egte NSS-vraestelle, memos en oefening — alles op een plek.",
    noSubjectsTitle: "Geen vakke gekies nie",
    noSubjectsDesc: "Gaan na Instellings om jou vakke te kies.",
    settingsLink: "Instellings",
    searchPlaceholder: "Soek vakke...",
    sortAlpha: "A–Z",
    sortWeak: "Swakste eerste",
    sortPracticed: "Mees geoefen",
    allSubjects: "Alle Vakke",
    noSubjectsFound: "Geen vakke gevind",
    tryDifferentSearch: "Probeer 'n ander soekterm",
    subjectsWillAppear: "Vakke sal hier verskyn sodra dit ingevoer is",
    browseAllTitle: "Blaai deur alle vakke",
    availableToAdd: "beskikbaar om by te voeg",
    subjectSingular: "vak",
    subjectPlural: "vakke",
    closeBtn: "Sluit",
    browseBtnLabel: "Voeg / Blaai vakke",
    addSubjectsBtn: "Voeg vakke by",
    noSubjectsDescBrowse: "Voeg jou vakke hieronder by, of gaan na Instellings.",
    subjectAddedTitle: "Vak bygevoeg!",
    subjectAddedDesc: "Die vak is by jou profiel gevoeg.",
    errorTitle: "Fout",
    errorAddSubject: "Kon nie vak byvoeg nie. Probeer weer.",
    searchBrowsePlaceholder: "Soek alle NSS vakke...",
    addingBtn: "Besig...",
    addBtn: "Voeg by",
    notStarted: "Nog nie begin nie",
    strong: "Sterk",
    progressing: "Vorder",
    keepPractising: "Oefen meer",
    weakSpot: "Swak punt",
    questionsUnit: "vrae",
    papersUnit: "vraestelle",
  },
} as const;

export default function SubjectsPage() {
  const { logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAf = language === "af";
  const t = T[language];
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("alpha");
  const [showBrowseAll, setShowBrowseAll] = useState(false);
  const [browseSearch, setBrowseSearch] = useState("");
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());

  const { data: profile } = useQuery<OnboardingResult>({
    queryKey: ["/api/user/onboarding"],
  });

  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: progressStats } = useQuery<ProgressStats>({
    queryKey: ["/api/user/progress"],
    staleTime: 30_000,
  });

  const progressBySubject = useMemo(() => {
    const m = new Map<number, SubjectProgress>();
    (progressStats?.subjectProgress ?? []).forEach((p) => m.set(p.subjectId, p));
    return m;
  }, [progressStats]);

  const selectedIds = useMemo<number[]>(
    () =>
      Array.isArray(profile?.selectedSubjects)
        ? (profile!.selectedSubjects as number[])
        : [],
    [profile?.selectedSubjects]
  );

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // ── Base set (subjects the learner is writing) ──
  const subjectsToShow = useMemo(
    () => subjects?.filter((s) => selectedIdSet.has(s.id)) ?? [],
    [subjects, selectedIdSet]
  );

  // ── Subjects not yet in the learner's list (for the Browse & Add panel) ──
  const unselectedSubjects = useMemo(
    () => subjects?.filter((s) => !selectedIdSet.has(s.id)) ?? [],
    [subjects, selectedIdSet]
  );

  // ── Category counts over the learner's set ──
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: subjectsToShow.length };
    for (const s of subjectsToShow) counts[s.category] = (counts[s.category] ?? 0) + 1;
    return counts;
  }, [subjectsToShow]);

  // ── Search + category filter ──
  const filteredSubjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = subjectsToShow.filter((subject) => {
      const matchesSearch =
        !q ||
        subject.name.toLowerCase().includes(q) ||
        subject.nameAfrikaans.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "all" || subject.category === activeCategory;
      return matchesSearch && matchesCategory;
    });

    const sorted = [...filtered];
    if (sortMode === "alpha") {
      sorted.sort((a, b) =>
        (isAf ? a.nameAfrikaans : a.name).localeCompare(
          isAf ? b.nameAfrikaans : b.name
        )
      );
    } else if (sortMode === "weak") {
      sorted.sort((a, b) => {
        const pa = progressBySubject.get(a.id);
        const pb = progressBySubject.get(b.id);
        const sa = pa && pa.questionsAttempted > 0 ? pa.accuracy : 101;
        const sb = pb && pb.questionsAttempted > 0 ? pb.accuracy : 101;
        return sa - sb;
      });
    } else if (sortMode === "practiced") {
      sorted.sort((a, b) => {
        const pa = progressBySubject.get(a.id)?.questionsAttempted ?? 0;
        const pb = progressBySubject.get(b.id)?.questionsAttempted ?? 0;
        return pb - pa;
      });
    }
    return sorted;
  }, [subjectsToShow, searchQuery, activeCategory, sortMode, isAf, progressBySubject]);

  // ── Filtered unselected subjects for the browse panel ──
  const filteredUnselected = useMemo(() => {
    const q = browseSearch.trim().toLowerCase();
    if (!q) return unselectedSubjects;
    return unselectedSubjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nameAfrikaans.toLowerCase().includes(q)
    );
  }, [unselectedSubjects, browseSearch]);

  const getCategoryLabel = (categoryId: string) => {
    const cat = SUBJECT_CATEGORIES.find((c) => c.id === categoryId);
    return cat ? (isAf ? cat.labelAf : cat.labelEn) : categoryId;
  };

  const noSubjectsSelected = !isLoading && selectedIds.length === 0;

  // ── Mutation: add subject(s) to learner profile ──
  const addSubjectMutation = useMutation({
    mutationFn: (subjectId: number) =>
      apiRequest("PATCH", "/api/user/subjects", { subjectIds: [subjectId] }),
    onMutate: (subjectId) => {
      setAddingIds((prev) => new Set(prev).add(subjectId));
    },
    onSuccess: (_data, subjectId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/onboarding"] });
      toast({
        title: t.subjectAddedTitle,
        description: t.subjectAddedDesc,
      });
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(subjectId);
        return next;
      });
    },
    onError: (_err, subjectId) => {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(subjectId);
        return next;
      });
      toast({
        title: t.errorTitle,
        description: t.errorAddSubject,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
      <GraffitiSplats variant="corner" opacity={0.35} />
      {/* Header — deep black, no wordmark */}
      <header className="sticky top-0 z-50 border-b" style={{ background: "rgba(5,5,8,.94)", backdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,.08)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/dashboard">
                <button
                  data-testid="link-home"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10 shrink-0"
                  style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">{t.homeLabel}</span>
                </button>
              </Link>
              <span
                className="hidden sm:inline truncate"
                style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: "#9FF5E8", transform: "rotate(-2deg)", textShadow: "0 0 10px rgba(159,245,232,.45)" }}
              >
                {t.subjectsLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleLanguage()}
                className="px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10"
                style={{ color: "#C5B3FF", border: "1.5px solid #C5B3FF" }}
                data-testid="button-language-toggle"
              >
                {isAf ? "AF" : "EN"}
              </button>
              <button
                onClick={() => logout()}
                data-testid="button-logout"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10"
                style={{ color: "#FFB7E5", border: "1.5px solid #FFB7E5" }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t.signOut}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Ambient auras */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[120px] opacity-40"
          style={{ background: "#9FF5E8" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 -right-24 w-[380px] h-[380px] rounded-full blur-[120px] opacity-30"
          style={{ background: "#FFB7E5" }}
        />

        {/* Cosmic hero */}
        <section className="relative space-y-5 mb-10">
          <div className="inline-flex items-center gap-2">
            <GraduationCap
              className="w-4 h-4"
              style={{
                color: "#9FF5E8",
                filter: "drop-shadow(0 0 4px #9FF5E8)",
              }}
            />
            <span
              style={{
                fontFamily: "'Permanent Marker',cursive",
                fontSize: 16,
                color: "#9FF5E8",
                transform: "rotate(-2deg)",
                display: "inline-block",
                textShadow: "0 0 12px rgba(159,245,232,.5)",
              }}
            >
              {t.capsLabel}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <div
                role="heading"
                aria-level={1}
                className="font-black leading-[0.95] tracking-tight text-3xl sm:text-4xl md:text-5xl"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {t.heroHeading}
              </div>
              <p className="text-white text-base sm:text-lg max-w-2xl mt-4" style={{ opacity: 0.94 }}>
                {t.heroSubtitle}
              </p>
            </div>

            {/* Add subjects button */}
            {!isLoading && (
              <button
                type="button"
                data-testid="button-browse-all"
                onClick={() => {
                  setShowBrowseAll((v) => !v);
                  setBrowseSearch("");
                }}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={
                  showBrowseAll
                    ? {
                        background: "transparent",
                        border: "1.5px solid #9FF5E8",
                        color: "#9FF5E8",
                      }
                    : {
                        background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
                        border: "none",
                        color: "#050508",
                        boxShadow: "0 0 20px rgba(159,245,232,.35)",
                      }
                }
                onMouseEnter={(e) => { if (!showBrowseAll) e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
              >
                {showBrowseAll ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    {t.closeBtn}
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    {t.browseBtnLabel}
                  </>
                )}
              </button>
            )}
          </div>
        </section>

        {/* Empty state — no subjects selected */}
        {noSubjectsSelected && !showBrowseAll && (
          <div
            className="relative p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 overflow-hidden"
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 22,
            }}
          >
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)",
              }}
            />
            <Settings
              className="w-6 h-6 shrink-0"
              style={{
                color: "#FFE29A",
                filter: "drop-shadow(0 0 6px #FFE29A)",
              }}
            />
            <div className="flex-1">
              <p className="font-semibold text-white">
                {t.noSubjectsTitle}
              </p>
              <p className="text-sm text-white mt-0.5">
                {t.noSubjectsDescBrowse}{" "}
                <Link
                  href="/settings"
                  className="underline underline-offset-2"
                  style={{ color: "#9FF5E8" }}
                >
                  {t.settingsLink}
                </Link>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowBrowseAll(true)}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
                border: "none",
                color: "#050508",
                boxShadow: "0 0 20px rgba(159,245,232,.35)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              <Plus className="w-3.5 h-3.5" />
              {t.addSubjectsBtn}
            </button>
          </div>
        )}

        {/* Browse & Add panel */}
        {showBrowseAll && (
          <div
            className="relative overflow-hidden mb-10"
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 24,
              boxShadow: "0 0 40px rgba(159,245,232,0.08)",
            }}
          >
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, #FFE29A, #FFE29A, #94F7C5, #9FF5E8, #9FD8FF, #C5B3FF, #FFB7E5)",
              }}
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-black text-lg text-white">
                    {t.browseAllTitle}
                  </h2>
                  <p className="text-xs text-white mt-0.5">
                    {unselectedSubjects.length} {unselectedSubjects.length === 1 ? t.subjectSingular : t.subjectPlural} {t.availableToAdd}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBrowseAll(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[.03] hover:bg-white/10 transition-colors"
                  style={{ color: "#9FF5E8", border: "1.5px solid #9FF5E8" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Browse search */}
              <div className="relative mb-5">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#9FF5E8" }}
                />
                <Input
                  placeholder={t.searchBrowsePlaceholder}
                  value={browseSearch}
                  onChange={(e) => setBrowseSearch(e.target.value)}
                  data-testid="input-browse-search"
                  className="pl-11 h-12 bg-white/5 border-white/15 text-white placeholder:text-white rounded-xl focus-visible:border-[#9FF5E8] focus-visible:ring-[#9FF5E8]/30"
                />
              </div>

              {filteredUnselected.length === 0 ? (
                <div className="text-center py-8">
                  {unselectedSubjects.length === 0 ? (
                    <p className="text-sm text-white">
                      {isAf
                        ? "Jy het al die vakke bygevoeg!"
                        : "You've added all available subjects!"}
                    </p>
                  ) : (
                    <p className="text-sm text-white">
                      {isAf
                        ? "Geen vakke gevind vir hierdie soekterm"
                        : "No subjects found for that search"}
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredUnselected.map((subject, idx) => {
                    const Icon = getSubjectLucide(subject.name);
                    const hex = RAINBOW[idx % RAINBOW.length];
                    const isAdding = addingIds.has(subject.id);
                    return (
                      <button
                        key={subject.id}
                        type="button"
                        data-testid={`browse-subject-${subject.id}`}
                        onClick={() => addSubjectMutation.mutate(subject.id)}
                        disabled={isAdding}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[.03] text-left transition-all hover:bg-white/5 disabled:opacity-60"
                        style={{
                          border: `1px solid ${hex}33`,
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: `${hex}11`,
                            border: `1px solid ${hex}44`,
                          }}
                        >
                          <Icon
                            className="w-4 h-4"
                            style={{ color: hex }}
                            strokeWidth={2}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{ color: hex }}
                          >
                            {isAf ? subject.nameAfrikaans : subject.name}
                          </p>
                          <p className="text-[10px] text-white truncate">
                            {getCategoryLabel(subject.category)}
                          </p>
                        </div>
                        <div
                          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={{
                            background: isAdding ? `${hex}22` : "rgba(255,255,255,0.05)",
                            border: `1px solid ${isAdding ? hex : "rgba(255,255,255,0.12)"}`,
                          }}
                        >
                          {isAdding ? (
                            <div
                              className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                              style={{ borderColor: hex, borderTopColor: "transparent" }}
                            />
                          ) : (
                            <Plus className="w-3 h-3" style={{ color: "#ffffff" }} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Only show the grid/filters when not browsing-only or has subjects */}
        {(subjectsToShow.length > 0 || (!noSubjectsSelected && !isLoading)) && (
          <>
            {/* Search + sort */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#9FF5E8" }}
                />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 bg-white/5 border-white/15 text-white placeholder:text-white rounded-xl focus-visible:border-[#9FF5E8] focus-visible:ring-[#9FF5E8]/30"
                  data-testid="input-search"
                />
              </div>

              <div
                className="flex items-center gap-1 rounded-xl bg-white/[.03] p-1"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                data-testid="sort-group"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-white ml-2 shrink-0" />
                <SortChip
                  active={sortMode === "alpha"}
                  label={t.sortAlpha}
                  hex="#FFE29A"
                  onClick={() => setSortMode("alpha")}
                  testId="sort-alpha"
                />
                <SortChip
                  active={sortMode === "weak"}
                  label={t.sortWeak}
                  hex="#FFB7E5"
                  onClick={() => setSortMode("weak")}
                  testId="sort-weak"
                />
                <SortChip
                  active={sortMode === "practiced"}
                  label={t.sortPracticed}
                  hex="#9FF5E8"
                  onClick={() => setSortMode("practiced")}
                  testId="sort-practiced"
                />
              </div>
            </div>

            {/* Category pills with counts */}
            <div className="flex flex-wrap gap-2 mb-5">
              <CategoryPill
                active={activeCategory === "all"}
                label={t.allSubjects}
                count={categoryCounts.all ?? 0}
                onClick={() => setActiveCategory("all")}
                testId="tab-all"
                hex="#ffffff"
              />
              {SUBJECT_CATEGORIES.map((cat, i) => {
                const count = categoryCounts[cat.id] ?? 0;
                if (count === 0) return null;
                return (
                  <CategoryPill
                    key={cat.id}
                    active={activeCategory === cat.id}
                    label={isAf ? cat.labelAf : cat.labelEn}
                    count={count}
                    onClick={() => setActiveCategory(cat.id)}
                    testId={`tab-${cat.id.toLowerCase()}`}
                    hex={RAINBOW[i % RAINBOW.length]}
                  />
                );
              })}
            </div>

            {/* Results counter */}
            {!isLoading && subjectsToShow.length > 0 && (
              <p className="text-[11px] uppercase tracking-[0.22em] font-black text-white mb-5" data-testid="result-count">
                {filteredSubjects.length}{" "}
                {isAf
                  ? filteredSubjects.length === 1 ? "vak gevind" : "vakke gevind"
                  : filteredSubjects.length === 1 ? "subject" : "subjects"}
              </p>
            )}

            {/* Subject grid */}
            {filteredSubjects.length > 0 ? (
              <div
                key={language}
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filteredSubjects.map((subject, idx) => {
                  const Icon = getSubjectLucide(subject.name);
                  const hex = RAINBOW[idx % RAINBOW.length];
                  const prog = progressBySubject.get(subject.id);
                  return (
                    <Link key={subject.id} href={`/subject/${subject.id}`}>
                      <SubjectNeonCard
                        title={isAf ? subject.nameAfrikaans : subject.name}
                        altTitle={isAf ? subject.name : subject.nameAfrikaans}
                        category={getCategoryLabel(subject.category)}
                        Icon={Icon}
                        hex={hex}
                        accuracy={prog?.accuracy ?? 0}
                        questionsAttempted={prog?.questionsAttempted ?? 0}
                        papersCompleted={prog?.papersCompleted ?? 0}
                        curatedTopicCount={(subject as any).curatedTopicCount ?? 0}
                        isAf={isAf}
                        t={t}
                        testId={`subject-card-${subject.id}`}
                        animDelay={Math.min(idx, 8) * 0.05}
                      />
                    </Link>
                  );
                })}
              </div>
            ) : subjectsToShow.length > 0 ? (
              <div
                className="relative text-center py-16 rounded-[22px] bg-white/[.03] overflow-hidden"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Sparkles
                  className="w-12 h-12 mx-auto mb-4"
                  style={{
                    color: "#C5B3FF",
                    filter: "drop-shadow(0 0 10px #C5B3FF)",
                  }}
                />
                <p className="text-lg text-white font-semibold">
                  {t.noSubjectsFound}
                </p>
                <p className="text-sm text-white mt-1">
                  {searchQuery ? t.tryDifferentSearch : t.subjectsWillAppear}
                </p>
              </div>
            ) : null}
          </>
        )}

        {/* Loading skeleton — the main grid above only renders once data is in,
            so this is the only surface shown while subjects load. (The grid was
            previously duplicated here unconditionally, rendering every subject
            card twice — that duplication is removed.) */}
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SortChip({
  active,
  label,
  hex,
  onClick,
  testId,
}: {
  active: boolean;
  label: string;
  hex: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="px-4 py-2 rounded-xl text-sm font-bold transition-colors"
      style={{
        color: active ? "#0a0a0a" : hex,
        background: active ? hex : "rgba(255,255,255,.03)",
        border: `1.5px solid ${hex}`,
      }}
    >
      {label}
    </button>
  );
}

function CategoryPill({
  active,
  label,
  count,
  onClick,
  testId,
  hex,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  testId: string;
  hex: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
      style={{
        border: `1.5px solid ${hex}`,
        background: active ? hex : "rgba(255,255,255,.03)",
        color: active ? "#0a0a0a" : hex,
      }}
    >
      <span>{label}</span>
      <span
        className="text-[9px] px-1.5 py-0.5 rounded-full tabular-nums"
        style={{
          background: active ? "rgba(0,0,0,0.15)" : `${hex}22`,
          color: active ? "#0a0a0a" : hex,
        }}
      >
        {count}
      </span>
    </button>
  );
}

function SubjectNeonCard({
  title,
  altTitle,
  category,
  Icon,
  hex,
  accuracy,
  questionsAttempted,
  papersCompleted,
  curatedTopicCount,
  isAf,
  t,
  testId,
  animDelay = 0,
}: {
  title: string;
  altTitle: string;
  category: string;
  Icon: LucideIcon;
  hex: string;
  accuracy: number;
  questionsAttempted: number;
  papersCompleted: number;
  curatedTopicCount?: number;
  isAf: boolean;
  t: typeof T["en"] | typeof T["af"];
  testId: string;
  animDelay?: number;
}) {
  const hasProgress = questionsAttempted > 0;
  const pct = Math.max(0, Math.min(100, Math.round(accuracy)));

  const strengthHex =
    !hasProgress ? "#ffffff"
    : pct >= 75 ? "#94F7C5"
    : pct >= 55 ? "#9FF5E8"
    : pct >= 35 ? "#FFE29A"
    : "#FF8DA1";
  const strengthLabel =
    !hasProgress ? t.notStarted
    : pct >= 75 ? t.strong
    : pct >= 55 ? t.progressing
    : pct >= 35 ? t.keepPractising
    : t.weakSpot;

  return (
    <div
      data-testid={testId}
      className="group relative overflow-hidden cursor-pointer transition-all hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 22,
        transition: "transform .25s, box-shadow .25s",
        animation: `bt-fadeup .45s cubic-bezier(.22,1,.36,1) ${animDelay}s both`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 14px 44px -18px ${hex}, 0 0 24px ${hex}33`)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* 2px top bar */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: hex, boxShadow: `0 0 10px ${hex}` }}
      />
      {/* Corner brackets */}
      <span aria-hidden className="absolute top-2 left-2 w-3 h-3 border-t border-l" style={{ borderColor: hex }} />
      <span aria-hidden className="absolute top-2 right-2 w-3 h-3 border-t border-r" style={{ borderColor: hex }} />
      <span aria-hidden className="absolute bottom-2 left-2 w-3 h-3 border-b border-l" style={{ borderColor: hex }} />
      <span aria-hidden className="absolute bottom-2 right-2 w-3 h-3 border-b border-r" style={{ borderColor: hex }} />
      {/* Aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-30 transition-opacity group-hover:opacity-50"
        style={{ background: hex }}
      />

      <div className="relative p-5 sm:p-6 flex flex-col gap-4">
        {/* Top row */}
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(5,5,8,.6)",
              border: `1px solid ${hex}`,
              boxShadow: `0 0 14px ${hex}55, inset 0 0 10px ${hex}22`,
            }}
          >
            <Icon
              className="w-6 h-6"
              style={{ color: hex, filter: `drop-shadow(0 0 6px ${hex})` }}
              strokeWidth={2}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-base sm:text-lg truncate"
              style={{ color: hex, textShadow: `0 0 10px ${hex}33` }}
            >
              {title}
            </h3>
            <p className="text-xs text-white truncate">{altTitle}</p>
            <p
              className="text-[10px] uppercase tracking-[0.2em] font-black mt-1.5"
              style={{ color:"#ffffff" }}
            >
              {category}
            </p>
          </div>
          <ChevronRight
            className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-0.5"
            style={{ color: hex }}
          />
        </div>

        {/* Progress strip */}
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-black mb-1.5">
            <span style={{ color: strengthHex, textShadow: `0 0 6px ${strengthHex}66` }}>
              {strengthLabel}
            </span>
            <span
              className="font-black tabular-nums"
              style={{ color: strengthHex, textShadow: `0 0 8px ${strengthHex}88` }}
              data-testid={`${testId}-accuracy`}
            >
              {hasProgress ? `${pct}%` : "—"}
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: hasProgress ? `${pct}%` : "0%",
                background: strengthHex,
                boxShadow: hasProgress ? `0 0 8px ${strengthHex}` : "none",
              }}
            />
          </div>
          <div className="mt-2 flex items-center gap-4 text-[11px] text-white">
            <span className="flex items-center gap-1.5" data-testid={`${testId}-questions`}>
              <Target className="w-3 h-3" style={{ color: hex }} />
              <span className="tabular-nums text-white">{questionsAttempted}</span>
              <span>{t.questionsUnit}</span>
            </span>
            <span className="flex items-center gap-1.5" data-testid={`${testId}-papers`}>
              <FileText className="w-3 h-3" style={{ color: hex }} />
              <span className="tabular-nums text-white">{papersCompleted}</span>
              <span>{t.papersUnit}</span>
            </span>
            {(curatedTopicCount ?? 0) > 0 && (
              <span
                className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-[0.12em]"
                style={{ color: "#9FF5E8", border: "1px solid #9FF5E855", background: "#9FF5E810" }}
                data-testid={`${testId}-curated`}
              >
                <Sparkles className="w-2.5 h-2.5" />
                {isAf ? `${curatedTopicCount} Gekureer` : `${curatedTopicCount} Curated`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
