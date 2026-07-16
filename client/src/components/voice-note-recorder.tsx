import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mic, MicOff, Pause, Play, Square, Trash2, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VoiceNote {
  id: number;
  topicId: number;
  audioUrl: string;
  durationSeconds: number;
  title: string | null;
  transcript: string | null;
  transcriptLang: string | null;
  transcriptStatus: string | null;
  createdAt: string;
}

interface VoiceNoteRecorderProps {
  topicId: number;
  isAf: boolean;
}

const MAX_DURATION = 120; // 2 minutes

function fmt(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function VoiceNoteRecorder({ topicId, isAf }: VoiceNoteRecorderProps) {
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [supported, setSupported] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!navigator?.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setSupported(false);
    }
    return () => {
      stopStream();
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const { data, isLoading } = useQuery<{ voiceNotes: VoiceNote[] }>({
    queryKey: [`/api/topics/${topicId}/voice-notes`],
    refetchInterval: (q) => {
      const list = (q.state.data as { voiceNotes?: VoiceNote[] } | undefined)?.voiceNotes ?? [];
      const hasPending = list.some((n) => n.transcriptStatus === "pending" || n.transcriptStatus === "processing");
      return hasPending ? 4000 : false;
    },
  });
  const notes = data?.voiceNotes ?? [];

  const uploadMutation = useMutation({
    mutationFn: async ({ blob, durationSeconds }: { blob: Blob; durationSeconds: number }) => {
      const fd = new FormData();
      fd.append("audio", blob, `note-${topicId}-${Date.now()}.webm`);
      fd.append("durationSeconds", String(durationSeconds));
      const r = await fetch(`/api/topics/${topicId}/voice-notes`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/topics/${topicId}/voice-notes`] });
      qc.invalidateQueries({ queryKey: ["/api/voice-notes"] });
      toast({ title: isAf ? "Klanknotas gestoor" : "Voice note saved" });
    },
    onError: () => {
      toast({ title: isAf ? "Stoor het misluk" : "Could not save", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/voice-notes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/topics/${topicId}/voice-notes`] });
      qc.invalidateQueries({ queryKey: ["/api/voice-notes"] });
    },
  });

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function start() {
    setPermError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4"
        : "";
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const dur = elapsedRef.current;
        if (blob.size > 0 && dur > 0) {
          uploadMutation.mutate({ blob, durationSeconds: dur });
        }
        stopStream();
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
      setElapsed(0);
      elapsedRef.current = 0;
      tickRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= MAX_DURATION) stop();
      }, 1000);
    } catch (e: any) {
      setPermError(isAf ? "Mikrofoon toegang geweier." : "Microphone permission denied.");
      setRecording(false);
    }
  }

  const elapsedRef = useRef(0);

  function stop() {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    setRecording(false);
    try { recRef.current?.stop(); } catch {}
    recRef.current = null;
  }

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

  return (
    <div
      className="rounded-2xl bg-black p-4"
      style={{ border: "1.5px solid #C6A4FF", boxShadow: "0 0 16px #C6A4FF55, inset 0 0 10px rgba(198,164,255,0.10)" }}
      data-testid={`voice-recorder-${topicId}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5" style={{ color: "#C6A4FF", filter: "drop-shadow(0 0 4px #C6A4FF)" }} />
          <span className="font-bold text-sm text-white uppercase tracking-[0.14em]">
            {isAf ? "My Klanknotas" : "My Voice Notes"}
          </span>
          <span className="text-[10px] text-white">{isAf ? "(privaat, max 2 min)" : "(private, max 2 min)"}</span>
        </div>
        {supported ? (
          recording ? (
            <button
              onClick={stop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-xs font-black uppercase tracking-[0.14em] transition-all hover:scale-[1.02]"
              style={{ color: "#FF9FE5", border: "1.5px solid #FF9FE5", boxShadow: "0 0 12px #FF9FE555" }}
              data-testid={`button-stop-recording-${topicId}`}
            >
              <Square className="w-3.5 h-3.5" />
              {isAf ? "Stop" : "Stop"} {fmt(elapsed)}
            </button>
          ) : (
            <button
              onClick={start}
              disabled={uploadMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-xs font-black uppercase tracking-[0.14em] transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ color: "#C6A4FF", border: "1.5px solid #C6A4FF", boxShadow: "0 0 12px #C6A4FF55" }}
              data-testid={`button-start-recording-${topicId}`}
            >
              {uploadMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mic className="w-3.5 h-3.5" />}
              {uploadMutation.isPending ? (isAf ? "Stoor..." : "Saving...") : (isAf ? "Neem Op" : "Record")}
            </button>
          )
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-white">
            <MicOff className="w-3 h-3" /> {isAf ? "Nie ondersteun nie" : "Not supported"}
          </span>
        )}
      </div>

      {permError && <p className="text-[11px] text-red-400 mb-2">{permError}</p>}

      {recording && (
        <div className="mb-3">
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full transition-all duration-1000 linear"
              style={{ width: `${(elapsed / MAX_DURATION) * 100}%`, background: "#FF9FE5", boxShadow: "0 0 6px #FF9FE5" }}
            />
          </div>
          <p className="text-[10px] text-white mt-1 tabular-nums">
            {fmt(elapsed)} / {fmt(MAX_DURATION)}
          </p>
        </div>
      )}

      <audio ref={audioRef} onEnded={() => setPlayingId(null)} onPause={() => setPlayingId((p) => p)} className="hidden" />

      {isLoading ? (
        <p className="text-[11px] text-white">{isAf ? "Laai..." : "Loading..."}</p>
      ) : notes.length === 0 ? (
        <p className="text-[11px] text-white" data-testid={`voice-notes-empty-${topicId}`}>
          {isAf
            ? "Nog geen notas nie. Verduidelik 'n konsep hardop om dit beter te onthou."
            : "No notes yet. Explain a concept aloud to help yourself remember it."}
        </p>
      ) : (
        <ul className="space-y-2" data-testid={`voice-notes-list-${topicId}`}>
          {notes.map((note) => (
            <li
              key={note.id}
              className="p-2 rounded-lg bg-black"
              style={{ border: "1px solid #C6A4FF44" }}
              data-testid={`voice-note-${note.id}`}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePlay(note)}
                  className="w-8 h-8 rounded-full bg-black flex items-center justify-center transition-all hover:scale-105"
                  style={{ border: "1px solid #C6A4FF", boxShadow: "0 0 8px #C6A4FF55" }}
                  aria-label={playingId === note.id ? "Pause" : "Play"}
                  data-testid={`button-play-note-${note.id}`}
                >
                  {playingId === note.id ? <Pause className="w-3.5 h-3.5" style={{ color: "#C6A4FF" }} /> : <Play className="w-3.5 h-3.5 ml-0.5" style={{ color: "#C6A4FF" }} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">
                    {note.title || (isAf ? "Klanknotas" : "Voice note")} · {fmt(note.durationSeconds)}
                  </p>
                  <p className="text-[10px] text-white">{new Date(note.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(note.id)}
                  disabled={deleteMutation.isPending}
                  className="w-8 h-8 rounded-md bg-black flex items-center justify-center text-white hover:text-red-400 transition-colors"
                  aria-label="Delete"
                  data-testid={`button-delete-note-${note.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {(note.transcriptStatus === "pending" || note.transcriptStatus === "processing") && (
                <p className="mt-2 text-[10px] text-white flex items-center gap-1.5" data-testid={`voice-note-transcript-pending-${note.id}`}>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {isAf ? "Transkribeer..." : "Transcribing..."}
                </p>
              )}
              {note.transcriptStatus === "ready" && note.transcript && (
                <p
                  className="mt-2 text-[11px] leading-relaxed text-white whitespace-pre-wrap rounded-md p-2 bg-black/40"
                  style={{ border: "1px dashed #C6A4FF33" }}
                  data-testid={`voice-note-transcript-${note.id}`}
                >
                  <span className="font-bold uppercase tracking-[0.14em] text-[9px] text-[#C6A4FF] block mb-1">
                    {isAf ? "Transkripsie" : "Transcript"}
                  </span>
                  {note.transcript}
                </p>
              )}
              {note.transcriptStatus === "failed" && (
                <p className="mt-2 text-[10px] text-amber-300/80" data-testid={`voice-note-transcript-failed-${note.id}`}>
                  {isAf ? "Transkripsie het misluk." : "Transcription failed."}
                </p>
              )}
              {note.transcriptStatus === "empty" && (
                <p className="mt-2 text-[10px] text-white" data-testid={`voice-note-transcript-empty-${note.id}`}>
                  {isAf ? "Geen spraak gevind nie." : "No speech detected."}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
