// Rizz support bot — always-on floating launcher + chat panel, built to match
// the Claude Design handoff "Luxury Street Graffiti EdTech" comp
// (BrainTrack.dc.html, RIZZ SUPPORT BOT section). Bilingual EN/AF.
//
// Wiring: logged-in users chat live via the tutor API (POST /api/ai/tutor/ask,
// same helper + patterns as pages/tutor.tsx). Logged-out visitors get the
// comp's fallback presets — canned pricing/feature Q&A with a
// "Start free trial" CTA linking /subscribe.
//
// Opens on the window CustomEvent "bt:rizz-toggle" (dispatched by landing.tsx).
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { apiRequest } from "@/lib/queryClient";
import rizzAvatar from "@/assets/handoff/rizz-avatar.png";

const RAINBOW =
  "linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)";
const ACTION_GRADIENT = "linear-gradient(100deg,#9FF5E8,#C5B3FF)";
const LAUNCHER_GRADIENT = "linear-gradient(100deg,#B388FF,#FF7EC6)";

interface RizzMessage {
  role: "bot" | "me";
  text: string;
}

const COPY = {
  en: {
    greeting:
      "Hey! I'm Rizz 👋 your BrainTrack study buddy. Ask me anything — CAPS topics, exam tips, how the app works, or how to get your parent set up. Let's get it! 🔥",
    online: "online",
    subtitle: "Your AI study buddy & support",
    placeholder: "Ask Rizz anything…",
    thinking: "Rizz is thinking…",
    launcher: "Ask Rizz 🔥",
    trialCta: "Start free trial →",
    errorOffline:
      "Can't reach my brain right now 📡 check your connection and try again — meanwhile, the Classroom tab has flashcards & the daily quiz ready to go.",
    errorAuth:
      "That one needs a signed-in account 🔐 Start your free 14-day trial and I can help with everything — CAPS topics, past papers, the works. 🔥",
    presets: [
      { label: "Explain a topic 🧠", q: "Explain differentiation from first principles simply, with a quick example." },
      { label: "Exam tips ⚡", q: "Give me 3 quick tips for the Maths P1 exam." },
      { label: "How does BrainTrack work? 👋", q: "How does BrainTrack help me get matric-ready?" },
    ],
    fallbackPresets: [
      {
        label: "How much does it cost? 💸",
        q: "How much does BrainTrack cost?",
        a: "BrainTrack is R169 per learner per month — and every plan starts with a 14-day free trial, so you can test-drive everything first. 🔥 Billing is parent-owned and you can cancel anytime in the app.",
      },
      {
        label: "What do I get? ⚡",
        q: "What features does BrainTrack have?",
        a: "The full toolkit: 10 years of real NSC past papers + memos, CAPS-aligned study plans that rebuild around your weak spots, me (your AI tutor, 24/7 in English + Afrikaans), timed Exam Mode, parent reports, and XP, streaks & rewards. 🧠⚡",
      },
      {
        label: "How does it work? 👋",
        q: "How does BrainTrack work?",
        a: "Easy: sign up, pick your subjects, and BrainTrack diagnoses your weak spots using 10 years of DBE exam data. Then you get a weekly study plan, real past papers with memos, and me to explain anything until it clicks. 👑",
      },
    ],
    fallbackFreeform:
      "I go full power once you're signed in 🧠 — live tutoring, past papers, the lot. For now I can tell you: BrainTrack is R169/month with a 14-day free trial, CAPS-aligned, with 10 years of NSC past papers + memos and parent reports. Tap below to start! 🔥",
  },
  af: {
    greeting:
      "Haai! Ek's Rizz 👋 jou BrainTrack-studiemaat. Vra my enigiets — KABV-onderwerpe, eksamenwenke, hoe die app werk, of hoe om jou ouer op te stel. Kom ons wen! 🔥",
    online: "aanlyn",
    subtitle: "Jou KI-studiemaat & ondersteuning",
    placeholder: "Vra Rizz enigiets…",
    thinking: "Rizz dink…",
    launcher: "Vra Rizz 🔥",
    trialCta: "Begin gratis proeftydperk →",
    errorOffline:
      "Kan nie nou my brein bereik nie 📡 kyk na jou verbinding en probeer weer — intussen wag die Klaskamer-oortjie met flitskaarte & die daaglikse vasvra.",
    errorAuth:
      "Daarvoor moet jy ingeteken wees 🔐 Begin jou gratis 14-dae proeftydperk en ek help met alles — KABV-onderwerpe, vraestelle, die hele pakket. 🔥",
    presets: [
      { label: "Verduidelik 'n onderwerp 🧠", q: "Verduidelik differensiasie vanuit eerste beginsels eenvoudig, met 'n vinnige voorbeeld." },
      { label: "Eksamenwenke ⚡", q: "Gee my 3 vinnige wenke vir die Wiskunde V1-eksamen." },
      { label: "Hoe werk BrainTrack? 👋", q: "Hoe help BrainTrack my om matriekgereed te word?" },
    ],
    fallbackPresets: [
      {
        label: "Wat kos dit? 💸",
        q: "Hoeveel kos BrainTrack?",
        a: "BrainTrack is R169 per leerder per maand — en elke plan begin met 'n gratis 14-dae proeftydperk sodat jy eers alles kan toets. 🔥 Betaling is ouer-besit en jy kan enige tyd in die app kanselleer.",
      },
      {
        label: "Wat kry ek? ⚡",
        q: "Watter funksies het BrainTrack?",
        a: "Die volle gereedskapstel: 10 jaar se regte NSS-vraestelle + memo's, KABV-belynde studieplanne wat rondom jou swakplekke herbou, ek (jou KI-tutor, 24/7 in Afrikaans + Engels), getyde Eksamenmode, ouerverslae, en XP, reekse & belonings. 🧠⚡",
      },
      {
        label: "Hoe werk dit? 👋",
        q: "Hoe werk BrainTrack?",
        a: "Maklik: teken in, kies jou vakke, en BrainTrack diagnoseer jou swakplekke met 10 jaar se DBE-eksamendata. Dan kry jy 'n weeklikse studieplan, regte vraestelle met memo's, en my om enigiets te verduidelik totdat dit klik. 👑",
      },
    ],
    fallbackFreeform:
      "Ek gaan op volle krag sodra jy ingeteken is 🧠 — lewendige tutorhulp, vraestelle, alles. Vir nou kan ek sê: BrainTrack is R169/maand met 'n gratis 14-dae proeftydperk, KABV-belyn, met 10 jaar se NSS-vraestelle + memo's en ouerverslae. Tik hieronder om te begin! 🔥",
  },
} as const;

export function RizzSupportBot() {
  const { isAuthenticated } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const t = COPY[language];

  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<RizzMessage[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Landing (and any page) can open the bot via this event.
  useEffect(() => {
    const onToggle = () => setOpen((o) => !o);
    window.addEventListener("bt:rizz-toggle", onToggle);
    return () => window.removeEventListener("bt:rizz-toggle", onToggle);
  }, []);

  // Seed the greeting (in the active language) the first time the panel opens.
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "bot", text: t.greeting }]);
    }
  }, [open, messages.length, t.greeting]);

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/ai/tutor/ask", {
        question,
        language: isAf ? "afrikaans" : "english",
        learningStyle: "mixed",
        sessionId: sessionId ?? undefined,
      });
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      return result as { answer: string; sessionId: number };
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { role: "bot", text: data.answer }]);
    },
    onError: (error: any) => {
      const msg = String(error?.message || "");
      const isAuthError = msg.startsWith("401") || msg.startsWith("403");
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: isAuthError ? t.errorAuth : t.errorOffline },
      ]);
    },
  });
  const busy = askMutation.isPending;

  const send = (preset?: { q: string; a?: string }) => {
    const text = (preset?.q ?? draft).trim();
    if (!text || busy) return;
    setMessages((prev) => [...prev, { role: "me", text }]);
    setDraft("");
    if (isAuthenticated) {
      askMutation.mutate(text);
    } else {
      // Visitor fallback — canned Q&A per the comp, no API call.
      const canned =
        preset?.a ??
        t.fallbackPresets.find((p) => p.q === text)?.a ??
        t.fallbackFreeform;
      setMessages((prev) => [...prev, { role: "bot", text: canned }]);
    }
  };

  // Keep the newest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const presets: readonly { label: string; q: string; a?: string }[] =
    isAuthenticated ? t.presets : t.fallbackPresets;

  return (
    <div
      style={{
        position: "fixed", right: 22, bottom: 22, zIndex: 400,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14,
        fontFamily: "'Poppins',sans-serif",
      }}
      data-testid="rizz-support-bot"
    >
      <style>{`
        @keyframes bt-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .btr-launcher { animation: bt-bob 4.5s ease-in-out infinite; transition: transform .2s; }
        .btr-launcher:hover { transform: translateY(-3px) scale(1.03); }
        .btr-send { transition: transform .2s; }
        .btr-send:hover { transform: translateY(-2px); }
        .btr-input { border: 1.5px solid rgba(255,255,255,.15); }
        .btr-input:focus { border-color: #9FF5E8 !important; box-shadow: 0 0 0 2px rgba(159,245,232,.25); }
        .btr-preset { transition: background .2s; }
        .btr-preset:hover { background: rgba(159,245,232,.12); }
        .btr-close { opacity: .8; transition: opacity .2s; }
        .btr-close:hover { opacity: 1; }
        .btr-cta { transition: transform .2s; }
        .btr-cta:hover { transform: translateY(-2px); }
        @media (prefers-reduced-motion: reduce) { .btr-launcher { animation: none; } }
      `}</style>

      {open && (
        <div
          style={{
            width: 370, maxWidth: "calc(100vw - 40px)",
            height: 520, maxHeight: "calc(100vh - 120px)",
            background: "#0b0b12",
            border: "1.5px solid rgba(179,136,255,.4)",
            borderRadius: 22,
            boxShadow: "0 24px 60px rgba(179,136,255,.25)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}
          data-testid="rizz-panel"
        >
          {/* ── Header ─────────────────────────────────────── */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "16px 18px",
              background: "linear-gradient(100deg,rgba(179,136,255,.18),rgba(255,183,229,.12))",
              borderBottom: "1px solid rgba(255,255,255,.08)",
            }}
          >
            <img
              src={rizzAvatar}
              alt="Rizz"
              style={{ width: 42, height: 42, borderRadius: 12, objectFit: "cover", border: "1.5px solid #B388FF" }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                <span
                  style={{
                    fontFamily: "'Permanent Marker',cursive",
                    fontSize: 19, letterSpacing: ".5px",
                    background: RAINBOW, backgroundSize: "200% 100%",
                    WebkitBackgroundClip: "text", backgroundClip: "text",
                    color: "transparent", WebkitTextFillColor: "transparent",
                    animation: "bt-rainbow 6s linear infinite",
                  }}
                >
                  RIZZ
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#94F7C5", whiteSpace: "nowrap" }}>
                  ● {t.online}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: "#fff" }}>{t.subtitle}</div>
            </div>
            <span
              onClick={toggleLanguage}
              data-testid="button-rizz-lang"
              style={{
                cursor: "pointer", userSelect: "none",
                fontSize: 11, fontWeight: 800, letterSpacing: ".5px",
                color: isAf ? "#050508" : "#94F7C5",
                background: isAf ? "#94F7C5" : "transparent",
                border: "1.5px solid #94F7C5", borderRadius: 999, padding: "5px 11px",
                whiteSpace: "nowrap",
              }}
            >
              {isAf ? "AF ✓" : "AF"}
            </span>
            <span
              onClick={() => setOpen(false)}
              className="btr-close"
              data-testid="button-rizz-close"
              style={{ cursor: "pointer", fontSize: 24, lineHeight: 1, color: "#fff", padding: "4px 8px" }}
            >
              ×
            </span>
          </div>

          {/* ── Messages ───────────────────────────────────── */}
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}
            data-testid="rizz-messages"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "me" ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                  background: m.role === "me" ? ACTION_GRADIENT : "rgba(179,136,255,.14)",
                  color: m.role === "me" ? "#050508" : "#fff",
                  border: m.role === "me" ? "1px solid transparent" : "1px solid rgba(179,136,255,.4)",
                  borderRadius: 16, padding: "11px 14px",
                  fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
              </div>
            ))}
            {busy && (
              <div
                style={{
                  alignSelf: "flex-start", fontSize: 13, color: "#B388FF",
                  fontWeight: 700, fontFamily: "'Permanent Marker',cursive",
                }}
              >
                {t.thinking}
              </div>
            )}
          </div>

          {/* ── Preset chips ───────────────────────────────── */}
          <div
            style={{
              padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,.08)",
              display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
            }}
          >
            {presets.map((p) => (
              <span
                key={p.label}
                onClick={() => send(p)}
                className="btr-preset"
                style={{
                  fontSize: 11.5, fontWeight: 700, color: "#9FF5E8",
                  border: "1px solid rgba(159,245,232,.4)", borderRadius: 999,
                  padding: "6px 11px", cursor: "pointer", userSelect: "none",
                }}
              >
                {p.label}
              </span>
            ))}
            {!isAuthenticated && (
              <Link href="/subscribe">
                <span
                  className="btr-cta"
                  data-testid="button-rizz-trial"
                  style={{
                    display: "inline-block",
                    fontSize: 11.5, fontWeight: 800, color: "#050508",
                    background: ACTION_GRADIENT, borderRadius: 999,
                    padding: "7px 12px", cursor: "pointer", whiteSpace: "nowrap",
                    boxShadow: "0 0 12px rgba(159,245,232,.3)",
                  }}
                >
                  {t.trialCta}
                </span>
              </Link>
            )}
          </div>

          {/* ── Input row ──────────────────────────────────── */}
          <div
            style={{
              padding: 12, borderTop: "1px solid rgba(255,255,255,.08)",
              display: "flex", gap: 8, alignItems: "center",
            }}
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={t.placeholder}
              className="btr-input"
              data-testid="input-rizz"
              style={{
                flex: 1, minWidth: 0,
                background: "rgba(255,255,255,.05)",
                borderRadius: 12, padding: "12px 14px",
                color: "#fff", fontFamily: "'Poppins',sans-serif", fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={() => send()}
              className="btr-send"
              data-testid="button-rizz-send"
              aria-label="Send"
              style={{
                flex: "none", width: 44, height: 44, borderRadius: 12, border: "none",
                background: ACTION_GRADIENT, color: "#050508",
                fontSize: 18, fontWeight: 900, cursor: "pointer",
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* ── Launcher ─────────────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="btr-launcher"
        data-testid="button-rizz-launcher"
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: LAUNCHER_GRADIENT,
          border: "none", borderRadius: 999,
          padding: "8px 15px 8px 8px", cursor: "pointer",
          boxShadow: "0 8px 22px rgba(179,136,255,.4)",
        }}
      >
        <img
          src={rizzAvatar}
          alt="Rizz"
          style={{ width: 30, height: 30, borderRadius: 9, objectFit: "cover" }}
        />
        <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 900, fontSize: 13, color: "#050508", whiteSpace: "nowrap" }}>
          {t.launcher}
        </span>
      </button>
    </div>
  );
}

export default RizzSupportBot;
