import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowLeft, BookOpen, Mic, Pause, Play, Trash2, Headphones } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VoiceNote {
  id: number;
  topicId: number;
  subjectId: number | null;
  audioUrl: string;
  durationSeconds: number;
  sizeBytes: number;
  title: string | null;
  transcript: string | null;
  transcriptLang: string | null;
  transcriptStatus: string | null;
  createdAt: string;
  topicName: string | null;
  topicNameAf: string | null;
  subjectName: string | null;
  subjectNameAf: string | null;
}

function fmt(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* Guideline pastel cycle for repeated subject groups. */
const PASTELS = ["#9FF5E8", "#9FD8FF", "#FFB7E5", "#C5B3FF", "#FFE29A", "#94F7C5"] as const;

const halo = (hex: string, a = 0.32) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const marker = (color: string, size = 16): CSSProperties => ({
  fontFamily: "'Permanent Marker',cursive",
  fontSize: size,
  color,
  transform: "rotate(-2deg)",
  display: "inline-block",
  textShadow: `0 0 10px ${halo(color, 0.45)}`,
});

export default function MyNotesPage() {
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ voiceNotes: VoiceNote[] }>({
    queryKey: ["/api/voice-notes"],
    refetchInterval: (q) => {
      const list = (q.state.data as { voiceNotes?: VoiceNote[] } | undefined)?.voiceNotes ?? [];
      const hasPending = list.some((n) => n.transcriptStatus === "pending" || n.transcriptStatus === "processing");
      return hasPending ? 4000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/voice-notes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/voice-notes"] });
      toast({ title: isAf ? "Verwyder" : "Deleted" });
    },
  });

  function togglePlay(note: VoiceNote) {
    if (!audioRef.current) return;
    if (playingId === note.id) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current.src = note.audioUrl;
    audioRef.current.play().then(() => setPlayingId(note.id)).catch(() => setPlayingId(null));
  }

  const notes = data?.voiceNotes ?? [];
  const grouped = notes.reduce<Record<string, VoiceNote[]>>((acc, n) => {
    const key = (isAf ? n.subjectNameAf : n.subjectName) || (isAf ? "Ander" : "Other");
    (acc[key] = acc[key] || []).push(n);
    return acc;
  }, {});

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}
    >
      {/* ── Sticky street header ── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(5,5,8,.94)", backdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,.08)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/subjects">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10 shrink-0"
                  style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }}
                  data-testid="button-back-subjects"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">{isAf ? "Terug na vakke" : "Back to subjects"}</span>
                </button>
              </Link>
              <span className="hidden sm:inline truncate" style={marker("#9FF5E8")} data-testid="my-notes-page-header">
                {isAf ? "My Klanknotas" : "My Voice Notes"}
              </span>
            </div>
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10"
              style={{ color: "#C5B3FF", border: "1.5px solid #C5B3FF" }}
              data-testid="button-language-toggle"
            >
              {language === "en" ? "EN" : "AF"}
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Ambient pastel auras */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full blur-[120px] opacity-40"
          style={{ background: "#C5B3FF" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-48 -right-24 w-[340px] h-[340px] rounded-full blur-[120px] opacity-30"
          style={{ background: "#9FF5E8" }}
        />

        {/* ── Hero ── */}
        <section className="relative space-y-3" style={{ animation: "bt-fadeup .5s both" }}>
          <div className="inline-flex items-center gap-2">
            <Headphones
              className="w-4 h-4"
              style={{ color: "#C5B3FF", filter: "drop-shadow(0 0 4px #C5B3FF)" }}
            />
            <span style={marker("#C5B3FF")}>{isAf ? "Praat dit uit! 🎙️" : "Say it out loud! 🎙️"}</span>
          </div>
          <div
            role="heading"
            aria-level={1}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.95]"
            style={{
              backgroundImage:
                "linear-gradient(90deg,#FFE29A,#FFE29A,#94F7C5,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {isAf ? "My Klanknotas" : "My Voice Notes"}
          </div>
          <p className="text-white text-sm sm:text-base max-w-2xl" style={{ opacity: 0.94 }}>
            {isAf ? "Al jou opgeneemde verduidelikings" : "All your recorded explanations"}
          </p>
        </section>

        {/* ── Tip card ── */}
        <div
          className="relative p-5 overflow-hidden"
          style={{
            background: "rgba(255,255,255,.03)",
            border: "1.5px solid #C5B3FF",
            borderRadius: 20,
            boxShadow: `0 0 18px ${halo("#C5B3FF", 0.25)}`,
            animation: "bt-fadeup .5s .05s both",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-5 h-5" style={{ color: "#C5B3FF", filter: "drop-shadow(0 0 4px #C5B3FF)" }} />
            <h2 className="text-lg font-black uppercase tracking-[0.14em] text-white">
              {isAf ? "Klanknotas" : "Voice Notes"}
            </h2>
            <span
              className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.14em]"
              style={{ color: "#C5B3FF", border: "1px solid #C5B3FF", background: "rgba(255,255,255,.03)" }}
            >
              {notes.length}
            </span>
          </div>
          <p className="text-xs text-white" style={{ opacity: 0.92 }}>
            {isAf
              ? "Hardop verduideliking is een van die kragtigste leertegnieke. Hou jou notas onder 2 minute elk."
              : "Explaining concepts aloud is one of the most powerful study techniques. Keep each note under 2 minutes."}
          </p>
        </div>

        <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />

        {isLoading ? (
          <p className="text-white text-sm">{isAf ? "Laai..." : "Loading..."}</p>
        ) : notes.length === 0 ? (
          <div
            className="p-8 text-center"
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px dashed rgba(255,255,255,.18)",
              borderRadius: 20,
              animation: "bt-fadeup .5s .1s both",
            }}
            data-testid="my-notes-empty"
          >
            <Mic className="w-10 h-10 mx-auto mb-3" style={{ color: "#C5B3FF", filter: "drop-shadow(0 0 6px #C5B3FF)" }} />
            <span className="block mb-2" style={marker("#FFB7E5", 15)}>
              {isAf ? "Jou stem is jou superkrag!" : "Your voice is your superpower!"}
            </span>
            <p className="text-white text-sm font-medium">
              {isAf ? "Nog geen klanknotas nie." : "No voice notes yet."}
            </p>
            <p className="text-white text-xs mt-1" style={{ opacity: 0.92 }}>
              {isAf
                ? "Gaan na 'n vak en neem 'n notas op vir enige onderwerp."
                : "Open a subject and record a note for any topic."}
            </p>
            <Link href="/subjects">
              <button
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.14em] transition-all"
                style={{
                  background: "linear-gradient(100deg,#9FF5E8,#C5B3FF)",
                  color: "#050508",
                  border: "none",
                  borderRadius: 12,
                  boxShadow: "0 0 20px rgba(159,245,232,.35)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 0 28px rgba(159,245,232,.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(159,245,232,.35)";
                }}
                data-testid="button-go-subjects"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {isAf ? "Kies 'n vak" : "Choose a subject"}
              </button>
            </Link>
          </div>
        ) : (
          Object.entries(grouped).map(([subjectName, items], gi) => {
            const hex = PASTELS[gi % PASTELS.length];
            return (
              <section
                key={subjectName}
                className="space-y-2"
                style={{ animation: `bt-fadeup .5s ${0.1 + gi * 0.05}s both` }}
                data-testid={`my-notes-group-${subjectName}`}
              >
                <h3 className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: hex }}>
                  {subjectName}
                </h3>
                <ul className="space-y-2">
                  {items.map((note) => (
                    <li
                      key={note.id}
                      className="flex items-center gap-3 p-3 transition-all"
                      style={{
                        background: "rgba(255,255,255,.03)",
                        border: `1px solid ${hex}44`,
                        borderRadius: 18,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-6px)";
                        e.currentTarget.style.border = `1px solid ${hex}`;
                        e.currentTarget.style.boxShadow = `0 0 20px ${halo(hex, 0.3)}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.border = `1px solid ${hex}44`;
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      data-testid={`my-note-${note.id}`}
                    >
                      <button
                        onClick={() => togglePlay(note)}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 shrink-0"
                        style={{
                          background: "rgba(5,5,8,.6)",
                          border: `1.5px solid ${hex}`,
                          boxShadow: `0 0 10px ${halo(hex, 0.33)}`,
                        }}
                        aria-label={playingId === note.id ? "Pause" : "Play"}
                        data-testid={`button-play-mynote-${note.id}`}
                      >
                        {playingId === note.id
                          ? <Pause className="w-4 h-4" style={{ color: hex }} />
                          : <Play className="w-4 h-4 ml-0.5" style={{ color: hex }} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {note.title || (isAf ? (note.topicNameAf || note.topicName) : note.topicName) || (isAf ? "Klanknotas" : "Voice note")}
                        </p>
                        <p className="text-[11px] text-white" style={{ opacity: 0.9 }}>
                          {fmt(note.durationSeconds)} · {new Date(note.createdAt).toLocaleString()}
                        </p>
                        {(note.transcriptStatus === "pending" || note.transcriptStatus === "processing") && (
                          <p className="mt-1 text-[10px] text-white" style={{ opacity: 0.9 }} data-testid={`mynote-transcript-pending-${note.id}`}>
                            {isAf ? "Transkribeer..." : "Transcribing..."}
                          </p>
                        )}
                        {note.transcriptStatus === "ready" && note.transcript && (
                          <p
                            className="mt-2 text-[11px] leading-relaxed text-white whitespace-pre-wrap rounded-md p-2"
                            style={{ background: "rgba(5,5,8,.6)", border: `1px dashed ${hex}33` }}
                            data-testid={`mynote-transcript-${note.id}`}
                          >
                            <span
                              className="font-bold uppercase tracking-[0.14em] text-[9px] block mb-1"
                              style={{ color: hex }}
                            >
                              {isAf ? "Transkripsie" : "Transcript"}
                            </span>
                            {note.transcript}
                          </p>
                        )}
                        {note.transcriptStatus === "failed" && (
                          <p className="mt-1 text-[10px] font-semibold" style={{ color: "#FF8DA1" }} data-testid={`mynote-transcript-failed-${note.id}`}>
                            {isAf ? "Transkripsie het misluk." : "Transcription failed."}
                          </p>
                        )}
                        {note.transcriptStatus === "empty" && (
                          <p className="mt-1 text-[10px] text-white" style={{ opacity: 0.9 }} data-testid={`mynote-transcript-empty-${note.id}`}>
                            {isAf ? "Geen spraak gevind nie." : "No speech detected."}
                          </p>
                        )}
                      </div>
                      {note.subjectId && (
                        <Link href={`/subject/${note.subjectId}#audio`}>
                          <button
                            className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-[0.14em] hover:scale-[1.04] transition-all"
                            style={{ color: "#9FD8FF", border: "1px solid #9FD8FF55", background: "rgba(255,255,255,.03)" }}
                            data-testid={`button-open-topic-${note.id}`}
                          >
                            {isAf ? "Open" : "Open"}
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(note.id)}
                        disabled={deleteMutation.isPending}
                        className="w-9 h-9 rounded-md flex items-center justify-center text-white transition-colors"
                        style={{ background: "rgba(255,255,255,.03)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#FF8DA1"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                        aria-label="Delete"
                        data-testid={`button-delete-mynote-${note.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </main>
    </div>
  );
}
