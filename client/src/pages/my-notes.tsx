import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useRef, useState } from "react";
import { ArrowLeft, BookOpen, Mic, Pause, Play, Trash2, Headphones } from "lucide-react";
import { PageHeader } from "@/components/page-header";
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

export default function MyNotesPage() {
  const { language } = useLanguage();
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
    <div className="min-h-screen text-white">
      <PageHeader
        icon={Headphones}
        title={isAf ? "My Klanknotas" : "My Voice Notes"}
        subtitle={isAf ? "Al jou opgeneemde verduidelikings" : "All your recorded explanations"}
        testId="my-notes-page-header"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Link href="/subjects">
          <button
            className="inline-flex items-center gap-2 text-sm text-white hover:text-white"
            data-testid="button-back-subjects"
          >
            <ArrowLeft className="w-4 h-4" />
            {isAf ? "Terug na vakke" : "Back to subjects"}
          </button>
        </Link>

        <div
          className="rounded-2xl bg-black p-5"
          style={{ border: "1.5px solid #C6A4FF", boxShadow: "0 0 18px #C6A4FF55, inset 0 0 12px rgba(198,164,255,0.10)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-5 h-5" style={{ color: "#C6A4FF", filter: "drop-shadow(0 0 4px #C6A4FF)" }} />
            <h2 className="text-lg font-black uppercase tracking-[0.14em]">
              {isAf ? "Klanknotas" : "Voice Notes"}
            </h2>
            <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-black uppercase tracking-[0.14em]" style={{ color: "#C6A4FF", border: "1px solid #C6A4FF" }}>
              {notes.length}
            </span>
          </div>
          <p className="text-xs text-white">
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
            className="rounded-2xl bg-black p-8 text-center"
            style={{ border: "1px dashed rgba(255,255,255,0.18)" }}
            data-testid="my-notes-empty"
          >
            <Mic className="w-10 h-10 mx-auto mb-3 text-white" />
            <p className="text-white text-sm font-medium">
              {isAf ? "Nog geen klanknotas nie." : "No voice notes yet."}
            </p>
            <p className="text-white text-xs mt-1">
              {isAf
                ? "Gaan na 'n vak en neem 'n notas op vir enige onderwerp."
                : "Open a subject and record a note for any topic."}
            </p>
            <Link href="/subjects">
              <button
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.14em] bg-black"
                style={{ color: "#C6A4FF", border: "1.5px solid #C6A4FF", boxShadow: "0 0 12px #C6A4FF55" }}
                data-testid="button-go-subjects"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {isAf ? "Kies 'n vak" : "Choose a subject"}
              </button>
            </Link>
          </div>
        ) : (
          Object.entries(grouped).map(([subjectName, items]) => (
            <section key={subjectName} className="space-y-2" data-testid={`my-notes-group-${subjectName}`}>
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white">{subjectName}</h3>
              <ul className="space-y-2">
                {items.map((note) => (
                  <li
                    key={note.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-black"
                    style={{ border: "1px solid #C6A4FF44" }}
                    data-testid={`my-note-${note.id}`}
                  >
                    <button
                      onClick={() => togglePlay(note)}
                      className="w-10 h-10 rounded-full bg-black flex items-center justify-center transition-all hover:scale-105 shrink-0"
                      style={{ border: "1.5px solid #C6A4FF", boxShadow: "0 0 10px #C6A4FF55" }}
                      aria-label={playingId === note.id ? "Pause" : "Play"}
                      data-testid={`button-play-mynote-${note.id}`}
                    >
                      {playingId === note.id
                        ? <Pause className="w-4 h-4" style={{ color: "#C6A4FF" }} />
                        : <Play className="w-4 h-4 ml-0.5" style={{ color: "#C6A4FF" }} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {note.title || (isAf ? (note.topicNameAf || note.topicName) : note.topicName) || (isAf ? "Klanknotas" : "Voice note")}
                      </p>
                      <p className="text-[11px] text-white">
                        {fmt(note.durationSeconds)} · {new Date(note.createdAt).toLocaleString()}
                      </p>
                      {(note.transcriptStatus === "pending" || note.transcriptStatus === "processing") && (
                        <p className="mt-1 text-[10px] text-white" data-testid={`mynote-transcript-pending-${note.id}`}>
                          {isAf ? "Transkribeer..." : "Transcribing..."}
                        </p>
                      )}
                      {note.transcriptStatus === "ready" && note.transcript && (
                        <p
                          className="mt-2 text-[11px] leading-relaxed text-white whitespace-pre-wrap rounded-md p-2 bg-black/40"
                          style={{ border: "1px dashed #C6A4FF33" }}
                          data-testid={`mynote-transcript-${note.id}`}
                        >
                          <span className="font-bold uppercase tracking-[0.14em] text-[9px] text-[#C6A4FF] block mb-1">
                            {isAf ? "Transkripsie" : "Transcript"}
                          </span>
                          {note.transcript}
                        </p>
                      )}
                      {note.transcriptStatus === "failed" && (
                        <p className="mt-1 text-[10px] text-amber-300/80" data-testid={`mynote-transcript-failed-${note.id}`}>
                          {isAf ? "Transkripsie het misluk." : "Transcription failed."}
                        </p>
                      )}
                      {note.transcriptStatus === "empty" && (
                        <p className="mt-1 text-[10px] text-white" data-testid={`mynote-transcript-empty-${note.id}`}>
                          {isAf ? "Geen spraak gevind nie." : "No speech detected."}
                        </p>
                      )}
                    </div>
                    {note.subjectId && (
                      <Link href={`/subject/${note.subjectId}#audio`}>
                        <button
                          className="text-[10px] font-bold px-2 py-1 rounded-md bg-black uppercase tracking-[0.14em] hover:scale-[1.04] transition-all"
                          style={{ color: "#7FEFFF", border: "1px solid #7FEFFF55" }}
                          data-testid={`button-open-topic-${note.id}`}
                        >
                          {isAf ? "Open" : "Open"}
                        </button>
                      </Link>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(note.id)}
                      disabled={deleteMutation.isPending}
                      className="w-9 h-9 rounded-md bg-black flex items-center justify-center text-white hover:text-red-400 transition-colors"
                      aria-label="Delete"
                      data-testid={`button-delete-mynote-${note.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
