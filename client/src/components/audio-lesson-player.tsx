import { useEffect, useRef, useState } from "react";
import { Headphones, Loader2, Pause, Play, RotateCcw, Mic, MicOff, Square, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioLessonPlayerProps {
  topicId: number;
  topicName: string;
  language: "en" | "af";
  isAf: boolean;
  onPlayed?: () => void;
}

interface LessonRecording {
  id: number;
  topicId: number;
  language: string;
  durationSeconds: number;
  sizeBytes: number;
  audioUrl: string;
  createdAt: string;
  updatedAt: string;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const MAX_RECORDING_SECS = 600; // 10 minutes — enough to read a full topic summary

function formatTime(secs: number): string {
  if (!Number.isFinite(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function AudioLessonPlayer({ topicId, topicName, language, isAf, onPlayed }: AudioLessonPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [recording, setRecording] = useState<LessonRecording | null>(null);
  const [loadingRecording, setLoadingRecording] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const playedReportedRef = useRef(false);
  const { toast } = useToast();

  // Recording state
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recElapsed, setRecElapsed] = useState(0);
  const [recSupported, setRecSupported] = useState(true);
  const [recError, setRecError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const activeUrl = recording?.audioUrl ?? null;

  // Capability check
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!navigator?.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecSupported(false);
    }
    return () => {
      stopStream();
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load learner's recording (if any) on topic/lang change
  useEffect(() => {
    let cancelled = false;
    setRecording(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setLoadingRecording(true);
    playedReportedRef.current = false;

    (async () => {
      try {
        const r = await fetch(`/api/topics/${topicId}/lesson-recording?lang=${language}`, { credentials: "include" });
        if (!r.ok) return;
        const j: LessonRecording = await r.json();
        if (cancelled) return;
        setRecording(j);
      } catch {
        /* no recording — silent */
      } finally {
        if (!cancelled) setLoadingRecording(false);
      }
    })();
    return () => { cancelled = true; };
  }, [topicId, language]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => setError(isAf ? "Kon nie speel nie." : "Could not start playback."));
    } else {
      a.pause();
    }
  }

  function changeSpeed() {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    a.currentTime = pct * duration;
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startRecording() {
    setRecError(null);
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
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const dur = elapsedRef.current;
        stopStream();
        if (blob.size > 0 && dur > 0) {
          await uploadRecording(blob, dur);
        }
      };
      rec.start();
      recRef.current = rec;
      setIsRecording(true);
      setRecElapsed(0);
      elapsedRef.current = 0;
      tickRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setRecElapsed(elapsedRef.current);
        if (elapsedRef.current >= MAX_RECORDING_SECS) stopRecording();
      }, 1000);
      // Pause playback while recording to avoid feedback loops
      if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
    } catch {
      setRecError(isAf ? "Mikrofoon toegang geweier." : "Microphone permission denied.");
      setIsRecording(false);
    }
  }

  function stopRecording() {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    setIsRecording(false);
    try { recRef.current?.stop(); } catch { /* ignore */ }
    recRef.current = null;
  }

  async function uploadRecording(blob: Blob, durationSeconds: number) {
    setUploading(true);
    setRecError(null);
    try {
      const fd = new FormData();
      fd.append("audio", blob, `lesson-${topicId}-${language}-${Date.now()}.webm`);
      fd.append("language", language);
      fd.append("durationSeconds", String(durationSeconds));
      const r = await fetch(`/api/topics/${topicId}/lesson-recording`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j: LessonRecording = await r.json();
      setRecording(j);
      toast({ title: isAf ? "Jou stem is gestoor" : "Your voice was saved" });
    } catch {
      setRecError(isAf ? "Oplaai het misluk." : "Upload failed.");
      toast({ title: isAf ? "Stoor het misluk" : "Could not save", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function deleteRecording() {
    if (!recording) return;
    if (!window.confirm(isAf
      ? "Verwyder jou opname?"
      : "Remove your recording?")) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/topics/${topicId}/lesson-recording?lang=${language}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setRecording(null);
      setIsPlaying(false);
      setProgress(0);
      setDuration(0);
      toast({ title: isAf ? "Opname verwyder" : "Recording removed" });
    } catch {
      toast({ title: isAf ? "Verwydering het misluk" : "Could not remove", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="rounded-2xl bg-black p-4"
      style={{ border: "1.5px solid #8e7cdc", boxShadow: "0 0 18px #8e7cdc55, inset 0 0 12px rgba(142,124,220,0.10)" }}
      data-testid={`audio-lesson-${topicId}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Headphones className="w-5 h-5" style={{ color: "#8e7cdc", filter: "drop-shadow(0 0 4px #8e7cdc)" }} />
        <span className="font-bold text-sm text-white uppercase tracking-[0.14em]">
          {isAf ? "My Stemles" : "My Voice Lesson"}
        </span>
        <span className="text-[10px] text-white/70 ml-1 truncate">{topicName}</span>
      </div>

      {activeUrl ? (
        <>
          <audio
            ref={audioRef}
            src={activeUrl}
            preload="metadata"
            onLoadedMetadata={(e) => setDuration((e.currentTarget as HTMLAudioElement).duration || 0)}
            onTimeUpdate={(e) => {
              const a = e.currentTarget as HTMLAudioElement;
              setProgress(a.currentTime);
              if (!playedReportedRef.current && a.currentTime > 5) {
                playedReportedRef.current = true;
                onPlayed?.();
              }
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => { setIsPlaying(false); setProgress(0); }}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={isRecording}
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
              style={{ border: "1.5px solid #8e7cdc", boxShadow: "0 0 12px #8e7cdc55" }}
              data-testid={`button-toggle-audio-${topicId}`}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" style={{ color: "#8e7cdc" }} /> : <Play className="w-4 h-4 ml-0.5" style={{ color: "#8e7cdc" }} />}
            </button>
            <div className="flex-1 min-w-0">
              <div
                className="h-2 rounded-full bg-white/10 overflow-hidden cursor-pointer"
                onClick={seek}
                data-testid={`audio-progress-${topicId}`}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${duration ? (progress / duration) * 100 : 0}%`, background: "#8e7cdc", boxShadow: "0 0 8px #8e7cdcaa" }}
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-white/70 tabular-nums">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <button
              onClick={changeSpeed}
              className="text-[10px] font-black px-2 py-1 rounded-md bg-black uppercase tracking-[0.14em]"
              style={{ color: "#8e7cdc", border: "1px solid #8e7cdc55" }}
              data-testid={`button-audio-speed-${topicId}`}
              aria-label="Playback speed"
            >
              {speed}x
            </button>
            <button
              onClick={() => { if (audioRef.current) { audioRef.current.currentTime = 0; setProgress(0); } }}
              className="w-8 h-8 rounded-md bg-black flex items-center justify-center"
              style={{ border: "1px solid #8e7cdc55" }}
              aria-label="Restart"
              data-testid={`button-audio-restart-${topicId}`}
            >
              <RotateCcw className="w-3.5 h-3.5" style={{ color: "#8e7cdc" }} />
            </button>
          </div>
        </>
      ) : (
        <div className="text-[11px] text-white/70 leading-relaxed">
          {loadingRecording
            ? (isAf ? "Laai jou opname..." : "Loading your recording...")
            : (isAf
                ? "Geen opname nog nie. Lees die notas hardop voor en neem jou eie stem op — 'n bewese leertegniek."
                : "No recording yet. Read the notes aloud and record your own voice — a proven study technique.")}
        </div>
      )}

      {/* Record / re-record controls */}
      <div className="mt-3 pt-3 border-t border-white/10">
        {recSupported ? (
          <div className="flex items-center gap-2 flex-wrap">
            {isRecording ? (
              <>
                <button
                  onClick={stopRecording}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-[11px] font-black uppercase tracking-[0.14em] transition-all hover:scale-[1.02]"
                  style={{ color: "#e6519c", border: "1.5px solid #e6519c", boxShadow: "0 0 12px #e6519c55" }}
                  data-testid={`button-stop-lesson-recording-${topicId}`}
                >
                  <Square className="w-3 h-3" />
                  {isAf ? "Stop" : "Stop"} {formatTime(recElapsed)}
                </button>
                <div className="flex-1 min-w-[80px] h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000 linear"
                    style={{ width: `${(recElapsed / MAX_RECORDING_SECS) * 100}%`, background: "#e6519c", boxShadow: "0 0 6px #e6519c" }}
                  />
                </div>
                <span className="text-[10px] text-white/70 tabular-nums">{formatTime(MAX_RECORDING_SECS)}</span>
              </>
            ) : (
              <>
                <button
                  onClick={startRecording}
                  disabled={uploading || deleting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black text-[11px] font-black uppercase tracking-[0.14em] transition-all hover:scale-[1.02] disabled:opacity-60"
                  style={{ color: "#8e7cdc", border: "1.5px solid #8e7cdc", boxShadow: "0 0 12px #8e7cdc55" }}
                  data-testid={`button-record-lesson-${topicId}`}
                >
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mic className="w-3 h-3" />}
                  {uploading
                    ? (isAf ? "Stoor..." : "Saving...")
                    : recording
                      ? (isAf ? "Neem weer op" : "Re-record")
                      : (isAf ? "Neem my stem op" : "Record my voice")}
                </button>
                {recording && (
                  <button
                    onClick={deleteRecording}
                    disabled={uploading || deleting}
                    className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-black text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 hover:text-red-400 disabled:opacity-60"
                    style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                    aria-label={isAf ? "Verwyder opname" : "Remove recording"}
                    data-testid={`button-delete-lesson-recording-${topicId}`}
                  >
                    {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                )}
                {recording && (
                  <span className="text-[10px] text-white/60 tabular-nums">
                    {formatTime(recording.durationSeconds)}
                  </span>
                )}
              </>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-white/60">
            <MicOff className="w-3 h-3" /> {isAf ? "Opneem nie ondersteun nie" : "Recording not supported"}
          </span>
        )}

        {recError && <p className="text-[11px] text-red-400 mt-1.5">{recError}</p>}
      </div>

      {error && (
        <p className="text-[11px] text-red-400 mt-2" data-testid={`audio-error-${topicId}`}>{error}</p>
      )}
    </div>
  );
}
