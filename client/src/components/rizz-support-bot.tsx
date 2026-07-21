// Rizz support bot — the app-wide chat PANEL plus an exportable header LAUNCHER.
//
// Layout (owner request): Rizz is NOT a floating bubble. The launcher is a
// rectangular header pill (<RizzHeaderButton/>) that pages drop into their own
// header row. The chat PANEL still mounts app-wide (in App.tsx) but now anchors
// top-right, below the header — never bottom-right. Both talk to each other via
// the existing window CustomEvent "bt:rizz-toggle".
//
// Wiring: everyone (learner / parent / admin / visitor) chats through the new
// role-aware endpoint POST /api/rizz/ask. The server resolves the role from the
// session, so the client never sends a role. Visitors get honest, no-personal-
// data answers from the same endpoint; the canned presets remain as a graceful
// offline fallback.
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { apiRequest } from "@/lib/queryClient";
import {
  RIZZ,
  RIZZ_USER_GRADIENT,
  RizzFace,
  RizzWordmark,
  RizzBrandStyles,
  rizzLoadingLine,
  rizzAvatar,
  type RizzExpression,
} from "@/components/rizz-brand";

interface RizzMessage {
  role: "bot" | "me";
  text: string;
}

// Words that mark a positive / correct exchange → brief celebratory micro-anim.
const POSITIVE_RE =
  /\b(nice|exactly|well done|correct|spot on|lekker|perfect|great work|you got it|mooi|presies|reg so|korrek|welgedaan|glad reg)\b/i;

const COPY = {
  en: {
    greeting:
      "Hey! I'm Rizz 👋 your BrainTrack study buddy. Ask me anything — CAPS topics, exam tips, how the app works, or if something's broken and you need a hand. Let's get it! 🔥",
    online: "online",
    subtitle: "Your AI study buddy & support",
    placeholder: "Ask Rizz anything…",
    launcher: "Ask Rizz",
    trialCta: "Start free trial →",
    errorOffline:
      "Can't reach my brain right now 📡 check your connection and try again — meanwhile, the Classroom tab has flashcards & the daily quiz ready to go.",
    presets: [
      { label: "Explain photosynthesis 🌱", q: "Explain photosynthesis for Grade 12 Life Sciences, with the equation and both phases." },
      { label: "Solve a quadratic ➗", q: "Show me step by step how to solve the quadratic equation x² − 5x + 6 = 0." },
      { label: "I can't log in 🔐", q: "I can't log in to my account. What should I do?" },
      { label: "My subjects are wrong 📚", q: "My subjects are wrong / missing. How do I fix them?" },
    ],
    fallbackFreeform:
      "I go full power once you're signed in 🧠 — live tutoring, past papers, the lot. For now: BrainTrack is R169/month with a 14-day free trial, CAPS-aligned, with 10 years of NSC past papers + memos and parent reports. Tap below to start! 🔥",
  },
  af: {
    greeting:
      "Haai! Ek's Rizz 👋 jou BrainTrack-studiemaat. Vra my enigiets — KABV-onderwerpe, eksamenwenke, hoe die app werk, of as iets stukkend is en jy hulp nodig het. Kom ons wen! 🔥",
    online: "aanlyn",
    subtitle: "Jou KI-studiemaat & ondersteuning",
    placeholder: "Vra Rizz enigiets…",
    launcher: "Vra Rizz",
    trialCta: "Begin gratis proeftydperk →",
    errorOffline:
      "Kan nie nou my brein bereik nie 📡 kyk na jou verbinding en probeer weer — intussen wag die Klaskamer-oortjie met flitskaarte & die daaglikse vasvra.",
    presets: [
      { label: "Verduidelik fotosintese 🌱", q: "Verduidelik fotosintese vir Graad 12 Lewenswetenskappe, met die vergelyking en albei fases." },
      { label: "Los 'n kwadratiese op ➗", q: "Wys my stap vir stap hoe om die kwadratiese vergelyking x² − 5x + 6 = 0 op te los." },
      { label: "Ek kan nie inteken nie 🔐", q: "Ek kan nie by my rekening inteken nie. Wat moet ek doen?" },
      { label: "My vakke is verkeerd 📚", q: "My vakke is verkeerd / ontbreek. Hoe maak ek dit reg?" },
    ],
    fallbackFreeform:
      "Ek gaan op volle krag sodra jy ingeteken is 🧠 — lewendige tutorhulp, vraestelle, alles. Vir nou: BrainTrack is R169/maand met 'n gratis 14-dae proeftydperk, KABV-belyn, met 10 jaar se NSS-vraestelle + memo's en ouerverslae. Tik hieronder om te begin! 🔥",
  },
} as const;

// ── Header launcher — a rectangular pill, sized like other header buttons ────
export function RizzHeaderButton({ compact = false }: { compact?: boolean }) {
  const { language } = useLanguage();
  const t = COPY[language];
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("bt:rizz-toggle"))}
      className="btr-header-btn"
      data-testid="button-rizz-launcher"
      aria-label={t.launcher}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        // Solid pastel fill (owner request): soft pink→purple wash with dark
        // ink, matching the app's pastel CTA language rather than dark glass.
        background: "linear-gradient(100deg,#FFB7E5,#C5B3FF)",
        border: "none",
        borderRadius: 10,
        padding: compact ? "8px 13px 8px 9px" : "9px 16px 9px 10px",
        cursor: "pointer",
        color: "#050508",
        fontFamily: "'Poppins',sans-serif",
        fontWeight: 800,
        fontSize: 14,
        whiteSpace: "nowrap",
        transition: "transform .18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
      }}
    >
      <img
        src={rizzAvatar}
        alt=""
        aria-hidden
        style={{ width: 24, height: 24, borderRadius: 7, objectFit: "cover", flex: "none" }}
      />
      {t.launcher}
    </button>
  );
}

// ── App-wide chat panel ─────────────────────────────────────────────────────
export function RizzSupportBot() {
  const { isAuthenticated } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const t = COPY[language];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<RizzMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadTick, setLoadTick] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Any page (header button, landing card) can open the bot via this event.
  useEffect(() => {
    const onToggle = () => setOpen((o) => !o);
    window.addEventListener("bt:rizz-toggle", onToggle);
    return () => window.removeEventListener("bt:rizz-toggle", onToggle);
  }, []);

  // Seed the greeting the first time the panel opens.
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "bot", text: t.greeting }]);
    }
  }, [open, messages.length, t.greeting]);

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      // Prior turns give the role-aware agent conversational memory. The server
      // treats history as untrusted content, never as instructions.
      const history = messages.slice(-8).map((m) => ({ role: m.role, text: m.text }));
      const response = await apiRequest("POST", "/api/rizz/ask", {
        question,
        language: isAf ? "afrikaans" : "english",
        history,
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      return result as { answer: string; role: string };
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "bot", text: data.answer }]);
      if (POSITIVE_RE.test(data.answer)) {
        setCelebrate(true);
        window.setTimeout(() => setCelebrate(false), 1100);
      }
    },
    onError: () => {
      // Server allows visitors, so an error here is a genuine network/outage —
      // fall back to canned copy so the user is never left hanging.
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: isAuthenticated ? t.errorOffline : t.fallbackFreeform },
      ]);
    },
  });
  const busy = askMutation.isPending;

  const send = (preset?: { q: string }) => {
    const text = (preset?.q ?? draft).trim();
    if (!text || busy) return;
    setMessages((prev) => [...prev, { role: "me", text }]);
    setDraft("");
    setLoadTick((n) => n + 1);
    askMutation.mutate(text);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const headerExpression: RizzExpression = celebrate
    ? "party"
    : busy
    ? "thinking"
    : "happy";

  return (
    <div
      style={{
        position: "fixed",
        right: 22,
        // Anchored top-right, BELOW the header — never bottom-right.
        top: 84,
        zIndex: 400,
        fontFamily: "'Poppins',sans-serif",
        pointerEvents: "none",
      }}
      data-testid="rizz-support-bot"
    >
      <RizzBrandStyles />
      <style>{`
        .btr-send { transition: transform .2s; }
        .btr-send:hover { transform: translateY(-2px); }
        .btr-input { border: 1.5px solid rgba(255,255,255,.15); }
        .btr-input:focus { border-color: ${RIZZ.cyan} !important; box-shadow: 0 0 0 2px rgba(110,231,249,.25); }
        .btr-preset { transition: background .2s; }
        .btr-preset:hover { background: rgba(110,231,249,.12); }
        .btr-close:hover { border-color: #FF8DA1 !important; color: #FF8DA1 !important; transform: scale(1.08); }
        .btr-cta { transition: transform .2s; }
        .btr-cta:hover { transform: translateY(-2px); }
      `}</style>

      {open && (
        <div
          style={{
            width: 372,
            maxWidth: "calc(100vw - 40px)",
            height: 540,
            maxHeight: "calc(100vh - 120px)",
            background: RIZZ.nearBlack,
            border: "1.5px solid rgba(179,136,255,.45)",
            borderRadius: 22,
            boxShadow: "0 24px 60px rgba(179,136,255,.28)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            pointerEvents: "auto",
            animation: "bt-rizz-slidein .22s ease-out",
          }}
          data-testid="rizz-panel"
        >
          {/* ── Header — purple/pink gradient, avatar + RIZZ wordmark ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              background: "linear-gradient(100deg,rgba(179,136,255,.28),rgba(255,126,198,.2))",
              borderBottom: "1px solid rgba(255,255,255,.08)",
            }}
          >
            <div style={{ animation: celebrate ? "bt-rizz-celebrate 1s ease-out" : "none" }}>
              <RizzFace expression={headerExpression} size={42} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                <RizzWordmark size={19} />
                <span style={{ fontSize: 11, fontWeight: 700, color: RIZZ.mint, whiteSpace: "nowrap" }}>
                  ● {t.online}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: RIZZ.white }}>{t.subtitle}</div>
            </div>
            <span
              onClick={toggleLanguage}
              data-testid="button-rizz-lang"
              style={{
                cursor: "pointer",
                userSelect: "none",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: ".5px",
                color: isAf ? RIZZ.nearBlack : RIZZ.mint,
                background: isAf ? RIZZ.mint : "transparent",
                border: `1.5px solid ${RIZZ.mint}`,
                borderRadius: 999,
                padding: "5px 11px",
                whiteSpace: "nowrap",
              }}
            >
              {isAf ? "AF ✓" : "AF"}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btr-close"
              data-testid="button-rizz-close"
              title={isAf ? "Maak toe" : "Close"}
              aria-label="Close Rizz chat"
              style={{
                cursor: "pointer",
                fontSize: 24,
                lineHeight: 1,
                color: RIZZ.white,
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                flex: "none",
                padding: 0,
                fontWeight: 700,
                fontFamily: "'Poppins',sans-serif",
                background: "rgba(255,255,255,.12)",
                border: "1.5px solid rgba(255,255,255,.55)",
                transition: "all .15s",
              }}
            >
              ×
            </button>
          </div>

          {/* ── Messages ── */}
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12, background: RIZZ.nearBlack }}
            data-testid="rizz-messages"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "me" ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                  background: m.role === "me" ? RIZZ_USER_GRADIENT : "rgba(179,136,255,.16)",
                  color: m.role === "me" ? RIZZ.nearBlack : RIZZ.white,
                  border: m.role === "me" ? "1px solid transparent" : "1px solid rgba(179,136,255,.42)",
                  borderRadius: 16,
                  padding: "11px 14px",
                  fontSize: 14,
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  // Purple-tinted glass for bot bubbles.
                  backdropFilter: m.role === "bot" ? "blur(6px)" : undefined,
                }}
              >
                {m.text}
              </div>
            ))}
            {busy && (
              <div
                style={{
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 15,
                  color: RIZZ.purple,
                  fontWeight: 700,
                  fontFamily: "'Permanent Marker',cursive",
                }}
              >
                <span style={{ display: "inline-flex", gap: 3 }} aria-hidden>
                  <i style={{ width: 6, height: 6, borderRadius: "50%", background: RIZZ.pink, animation: "bt-rizz-dot 1s ease-in-out infinite" }} />
                  <i style={{ width: 6, height: 6, borderRadius: "50%", background: RIZZ.purple, animation: "bt-rizz-dot 1s ease-in-out .15s infinite" }} />
                  <i style={{ width: 6, height: 6, borderRadius: "50%", background: RIZZ.cyan, animation: "bt-rizz-dot 1s ease-in-out .3s infinite" }} />
                </span>
                {rizzLoadingLine(isAf ? "af" : "en", loadTick)}
              </div>
            )}
          </div>

          {/* ── Preset chips ── */}
          <div
            style={{
              padding: "10px 12px",
              borderTop: "1px solid rgba(255,255,255,.08)",
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
              background: RIZZ.nearBlack,
            }}
          >
            {t.presets.map((p) => (
              <span
                key={p.label}
                onClick={() => send(p)}
                className="btr-preset"
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: RIZZ.cyan,
                  border: "1px solid rgba(110,231,249,.4)",
                  borderRadius: 999,
                  padding: "6px 11px",
                  cursor: "pointer",
                  userSelect: "none",
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
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: RIZZ.nearBlack,
                    background: RIZZ_USER_GRADIENT,
                    borderRadius: 999,
                    padding: "7px 12px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.trialCta}
                </span>
              </Link>
            )}
          </div>

          {/* ── Input row ── */}
          <div
            style={{
              padding: 12,
              borderTop: "1px solid rgba(255,255,255,.08)",
              display: "flex",
              gap: 8,
              alignItems: "center",
              background: RIZZ.card,
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
                flex: 1,
                minWidth: 0,
                background: "rgba(255,255,255,.05)",
                borderRadius: 12,
                padding: "12px 14px",
                color: RIZZ.white,
                fontFamily: "'Poppins',sans-serif",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={() => send()}
              className="btr-send"
              data-testid="button-rizz-send"
              aria-label="Send"
              style={{
                flex: "none",
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "none",
                background: RIZZ_USER_GRADIENT,
                color: RIZZ.nearBlack,
                fontSize: 18,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RizzSupportBot;
