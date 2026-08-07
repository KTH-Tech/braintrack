// BrainTrack landing — Rizz interactive mini-demo
// Three real-flavour Grade-12 MCQs (Maths, Life Sciences, Business Studies),
// bilingual EN/AF, hard-coded. On a correct answer the card shows a green
// "Correct!" explanation AND mounts <ConfettiBurst /> once via portal for the
// pop celebration. Wrong answers show a hint tied to the concept and let the
// learner try again.
//
// Every animation is inline `bt-…` so it survives the global kill-switch in
// index.css. Local keyframes are injected via a <style> block (allowed —
// index.css is another agent's file).
import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Sparkles,
  Check,
  X,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Leaf,
  Briefcase,
} from "lucide-react";
import {
  RizzFace,
  RizzWordmark,
  RizzBrandStyles,
} from "@/components/rizz-brand";
import { ConfettiBurst } from "@/components/confetti-burst";

type Option = { key: "A" | "B" | "C" | "D"; label: { en: string; af: string } };
type Question = {
  id: string;
  subject: { en: string; af: string };
  subjectColor: string;
  icon: React.ReactNode;
  prompt: { en: string; af: string };
  options: Option[];
  correct: "A" | "B" | "C" | "D";
  explain: { en: string; af: string };
  hint: { en: string; af: string };
};

// ── Three hard-coded Grade-12 MCQs — kept bite-sized so the learner can taste
// the product without reading a wall of maths. Answers checked below.
const QUESTIONS: Question[] = [
  {
    id: "maths-arith-seq",
    subject: { en: "Mathematics", af: "Wiskunde" },
    subjectColor: "#9FD8FF",
    icon: <BookOpen size={18} strokeWidth={2.3} aria-hidden />,
    prompt: {
      en: "The nᵗʰ term of an arithmetic sequence is Tₙ = 4n − 1. What is T₅?",
      af: "Die nde term van 'n rekenkundige ry is Tₙ = 4n − 1. Wat is T₅?",
    },
    options: [
      { key: "A", label: { en: "15", af: "15" } },
      { key: "B", label: { en: "19", af: "19" } },
      { key: "C", label: { en: "20", af: "20" } },
      { key: "D", label: { en: "24", af: "24" } },
    ],
    correct: "B",
    explain: {
      en: "T₅ = 4(5) − 1 = 20 − 1 = 19. Substitute n = 5 into the formula.",
      af: "T₅ = 4(5) − 1 = 20 − 1 = 19. Vervang n = 5 in die formule.",
    },
    hint: {
      en: "Substitute n = 5 into 4n − 1 — do the multiplication before the subtraction.",
      af: "Vervang n = 5 in 4n − 1 — doen die vermenigvuldiging voor die aftrekking.",
    },
  },
  {
    id: "life-sci-gametes",
    subject: { en: "Life Sciences", af: "Lewenswetenskappe" },
    subjectColor: "#94F7C5",
    icon: <Leaf size={18} strokeWidth={2.3} aria-hidden />,
    prompt: {
      en: "In humans, how many chromosomes are in a normal gamete (sex cell)?",
      af: "In mense, hoeveel chromosome is in 'n normale gameet (geslagsel)?",
    },
    options: [
      { key: "A", label: { en: "22", af: "22" } },
      { key: "B", label: { en: "23", af: "23" } },
      { key: "C", label: { en: "44", af: "44" } },
      { key: "D", label: { en: "46", af: "46" } },
    ],
    correct: "B",
    explain: {
      en: "Somatic cells have 46 chromosomes (23 pairs). Meiosis halves that — gametes are haploid with 23.",
      af: "Somatiese selle het 46 chromosome (23 pare). Meiose halveer dit — gamete is haploïed met 23.",
    },
    hint: {
      en: "Somatic cells have 46 (23 pairs). Meiosis halves the count for reproduction.",
      af: "Somatiese selle het 46 (23 pare). Meiose halveer dit vir voortplanting.",
    },
  },
  {
    id: "biz-macro-env",
    subject: { en: "Business Studies", af: "Besigheidstudies" },
    subjectColor: "#FFB7E5",
    icon: <Briefcase size={18} strokeWidth={2.3} aria-hidden />,
    prompt: {
      en: "Which of the following is an EXTERNAL environment factor a business cannot control?",
      af: "Watter van die volgende is 'n EKSTERNE omgewingsfaktor wat 'n besigheid nie kan beheer nie?",
    },
    options: [
      {
        key: "A",
        label: { en: "Employee training", af: "Werknemer-opleiding" },
      },
      { key: "B", label: { en: "Product pricing", af: "Produkprys" } },
      { key: "C", label: { en: "Interest rates", af: "Rentekoerse" } },
      {
        key: "D",
        label: { en: "Marketing budget", af: "Bemarkingsbegroting" },
      },
    ],
    correct: "C",
    explain: {
      en: "Interest rates are set by the Reserve Bank — the macro environment. The others are internal decisions management controls.",
      af: "Rentekoerse word deur die Reserwebank bepaal — die makro-omgewing. Die ander is interne besluite wat bestuur beheer.",
    },
    hint: {
      en: "Think: which of these does management NOT decide? The macro environment sits outside the business.",
      af: "Dink: watter van hierdie besluit bestuur NIE oor nie? Die makro-omgewing lê buite die besigheid.",
    },
  },
];

type Status = "idle" | "wrong" | "correct";

export function RizzDemo({ language }: { language: "en" | "af" }) {
  const en = language === "en";
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const q = QUESTIONS[qIdx];
  const isLast = qIdx === QUESTIONS.length - 1;

  // Section copy
  const eye = en ? "try rizz right here" : "probeer rizz hier";
  const head1 = en ? "Meet " : "Ontmoet ";
  const head2 = en ? "your matric buddy" : "jou matriek-maat";
  const sub = en
    ? "Three real Grade-12 questions. Rizz gives the feedback — like it works inside BrainTrack."
    : "Drie regte Graad 12-vrae. Rizz gee die terugvoer — net soos dit binne BrainTrack werk.";
  const rizzPrompt = en
    ? "Hey! Pick an answer — I'll tell you if it lands."
    : "Haai! Kies 'n antwoord — ek sê jou of dit tel.";
  const correctTitle = en ? "Correct! Here's why:" : "Reg! Hoekom:";
  const wrongTitle = en ? "Not quite — try again:" : "Nie heeltemal nie — probeer weer:";
  const tryAgain = en ? "Try again" : "Probeer weer";
  const nextQ = en ? "Next question" : "Volgende vraag";
  const doneCtaLbl = en ? "See plans — from R169" : "Sien planne — vanaf R169";
  const doneMsg = en
    ? "Nice work — that's just three questions. Rizz has thousands more waiting."
    : "Mooi werk — dit was net drie vrae. Rizz het duisende meer wat wag.";
  const qLabel = (i: number) =>
    en ? `Question ${i + 1} of ${QUESTIONS.length}` : `Vraag ${i + 1} van ${QUESTIONS.length}`;

  const handlePick = (key: "A" | "B" | "C" | "D") => {
    if (status === "correct") return; // freeze after correct until next
    setSelected(key);
    if (key === q.correct) {
      setStatus("correct");
    } else {
      setStatus("wrong");
    }
  };

  const handleTryAgain = () => {
    setSelected(null);
    setStatus("idle");
  };

  const handleNext = () => {
    setQIdx((i) => (i + 1) % QUESTIONS.length);
    setSelected(null);
    setStatus("idle");
  };

  // Stable expression for Rizz — happy while idle, thinking on wrong, party on correct.
  const rizzExpr = useMemo(() => {
    if (status === "correct") return "party" as const;
    if (status === "wrong") return "thinking" as const;
    return "cheeky" as const;
  }, [status]);

  return (
    <div
      className="btl-sec"
      style={{ maxWidth: 1100, margin: "116px auto 0", padding: "0 32px" }}
      data-testid="section-rizz-demo"
    >
      <RizzBrandStyles />
      {/* Local keyframes for feedback pop + option press. All bt-* so exempt. */}
      <style>{`
        @keyframes bt-rizzq-in {
          0%   { opacity: 0; transform: translateY(10px) scale(.98); }
          100% { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes bt-rizzq-shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-6px); }
          40%     { transform: translateX(6px); }
          60%     { transform: translateX(-4px); }
          80%     { transform: translateX(4px); }
        }
        @keyframes bt-rizzq-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        @keyframes bt-rizzq-glowring {
          0%,100% { box-shadow: 0 0 0 0 rgba(148,247,197,.55); }
          50%     { box-shadow: 0 0 0 10px rgba(148,247,197,0);   }
        }
        .bt-rizzq-opt {
          transition: transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease;
        }
        .bt-rizzq-opt:hover:not(:disabled) {
          transform: translateY(-2px);
          background: #14111c !important;
          border-color: #9FD8FF !important;
        }
        .bt-rizzq-opt:disabled { cursor: default; }
      `}</style>

      {/* Section header */}
      <div style={{ textAlign: "center", marginBottom: 34 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "'Bebas Neue', system-ui, sans-serif",
            color: "#C5B3FF",
            fontSize: 17,
            letterSpacing: ".5px",
            transform: "rotate(-2deg)",
          }}
        >
          <Sparkles size={20} strokeWidth={2.4} color="#C5B3FF" aria-hidden />
          <span>{eye}</span>
        </div>
        <div
          className="btl-sec-head"
          style={{
            fontSize: 40,
            fontWeight: 900,
            letterSpacing: "-1.3px",
            lineHeight: 1.14,
            marginTop: 10,
            color: "#fff",
          }}
        >
          {head1}
          <span
            style={{
              background:
                "linear-gradient(95deg,#9FD8FF,#9FF5E8,#C5B3FF,#FFB7E5)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
            }}
          >
            {head2}
          </span>
        </div>
        <div
          className="btl-sec-sub"
          style={{
            marginTop: 12,
            fontSize: 15.5,
            lineHeight: 1.6,
            color: "#fff",
            opacity: 0.92,
            maxWidth: 640,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {sub}
        </div>
      </div>

      {/* Demo card */}
      <div
        data-testid="rizz-demo-card"
        style={{
          position: "relative",
          background:
            "linear-gradient(160deg,rgba(197,179,255,.09),rgba(159,216,255,.06) 55%,rgba(255,183,229,.08))",
          border: "1.5px solid rgba(197,179,255,.35)",
          borderRadius: 28,
          padding: "30px 30px 26px",
          boxShadow: "0 24px 60px rgba(197,179,255,.15)",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -160,
            left: "50%",
            transform: "translateX(-50%)",
            width: 640,
            height: 320,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse,rgba(197,179,255,.16),transparent 70%)",
            filter: "blur(28px)",
            animation: "bt-glowpulse 6s ease-in-out infinite",
          }}
        />

        {/* Header row: Rizz face + wordmark + speech bubble */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flex: "none",
            }}
          >
            <RizzFace expression={rizzExpr} size={54} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <RizzWordmark size={22} />
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#C5B3FF",
                  letterSpacing: "1.4px",
                  textTransform: "uppercase",
                  marginTop: 4,
                }}
              >
                {en ? "live demo" : "lewende demo"}
              </span>
            </div>
          </div>
          <div
            style={{
              position: "relative",
              flex: "1 1 260px",
              background: "rgba(5,5,8,.55)",
              border: "1.5px solid rgba(197,179,255,.4)",
              borderRadius: 16,
              padding: "12px 16px",
              fontSize: 14,
              color: "#fff",
              lineHeight: 1.5,
              animation: "bt-rizzq-in .6s cubic-bezier(.22,.75,.3,1) both",
            }}
          >
            {status === "correct"
              ? en
                ? "Yesss! You cracked it — I'll show you why."
                : "Jaaa! Jy het dit gekraak — ek wys jou hoekom."
              : status === "wrong"
                ? en
                  ? "Almost! Have another look — you've got this."
                  : "Amper! Kyk weer — jy kry dit."
                : rizzPrompt}
          </div>
        </div>

        {/* Subject chip + question progress */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <div
            data-testid="rizz-demo-subject"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              fontWeight: 800,
              color: q.subjectColor,
              border: `1.5px solid ${q.subjectColor}`,
              borderRadius: 999,
              padding: "6px 12px",
              letterSpacing: ".4px",
            }}
          >
            <span style={{ color: q.subjectColor, display: "inline-flex" }}>
              {q.icon}
            </span>
            <span>{en ? q.subject.en : q.subject.af}</span>
          </div>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: "#fff",
              opacity: 0.72,
              letterSpacing: ".4px",
            }}
          >
            {qLabel(qIdx)}
          </span>
        </div>

        {/* Question prompt */}
        <div
          key={q.id}
          data-testid="rizz-demo-prompt"
          style={{
            position: "relative",
            fontSize: 18.5,
            fontWeight: 800,
            lineHeight: 1.45,
            letterSpacing: "-.2px",
            color: "#fff",
            marginBottom: 18,
            animation: "bt-rizzq-in .5s cubic-bezier(.22,.75,.3,1) both",
          }}
        >
          {en ? q.prompt.en : q.prompt.af}
        </div>

        {/* Options grid */}
        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 10,
            marginBottom: 18,
          }}
          className="bt-rizzq-grid"
        >
          {q.options.map((opt) => {
            const isCorrectOpt = opt.key === q.correct;
            const isSelectedOpt = opt.key === selected;
            const revealCorrect =
              status !== "idle" && (isCorrectOpt || (status === "wrong" && isSelectedOpt));
            const borderColor = revealCorrect
              ? isCorrectOpt
                ? "#94F7C5"
                : "#FFB7E5"
              : "#9FD8FF";
            const bg = revealCorrect
              ? isCorrectOpt
                ? "rgba(148,247,197,.14)"
                : "rgba(255,183,229,.12)"
              : "#0e0d12";
            const textColor = revealCorrect
              ? isCorrectOpt
                ? "#94F7C5"
                : "#FFB7E5"
              : "#fff";
            const anim =
              status === "wrong" && isSelectedOpt
                ? "bt-rizzq-shake .4s cubic-bezier(.22,.75,.3,1) both"
                : status === "correct" && isSelectedOpt
                  ? "bt-rizzq-pop .5s ease both, bt-rizzq-glowring 1.6s ease-in-out infinite"
                  : undefined;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handlePick(opt.key)}
                disabled={status === "correct"}
                data-testid={`rizz-demo-opt-${opt.key}`}
                className="bt-rizzq-opt"
                style={{
                  fontFamily: "'Poppins',sans-serif",
                  textAlign: "left",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: `1.5px solid ${borderColor}`,
                  background: bg,
                  color: textColor,
                  fontWeight: 700,
                  fontSize: 15,
                  lineHeight: 1.4,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: status === "correct" ? "default" : "pointer",
                  animation: anim,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flex: "none",
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 900,
                    color: revealCorrect
                      ? "#050508"
                      : "#fff",
                    background: revealCorrect
                      ? isCorrectOpt
                        ? "#94F7C5"
                        : "#FFB7E5"
                      : "#050508",
                  }}
                >
                  {revealCorrect ? (
                    isCorrectOpt ? (
                      <Check size={16} strokeWidth={3} />
                    ) : (
                      <X size={16} strokeWidth={3} />
                    )
                  ) : (
                    opt.key
                  )}
                </span>
                <span>{en ? opt.label.en : opt.label.af}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback panel */}
        {status !== "idle" && (
          <div
            data-testid={`rizz-demo-feedback-${status}`}
            style={{
              position: "relative",
              padding: "14px 16px",
              borderRadius: 14,
              border: `1.5px solid ${status === "correct" ? "#94F7C5" : "#FFB7E5"}`,
              background:
                status === "correct"
                  ? "linear-gradient(120deg,rgba(148,247,197,.14),rgba(148,247,197,.05))"
                  : "linear-gradient(120deg,rgba(255,183,229,.12),rgba(255,183,229,.04))",
              color: "#fff",
              fontSize: 14.5,
              lineHeight: 1.55,
              animation: "bt-rizzq-in .45s cubic-bezier(.22,.75,.3,1) both",
            }}
          >
            <div
              style={{
                fontWeight: 900,
                fontSize: 13.5,
                color: status === "correct" ? "#94F7C5" : "#FFB7E5",
                letterSpacing: ".3px",
                marginBottom: 6,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {status === "correct" ? (
                <Check size={16} strokeWidth={3} aria-hidden />
              ) : (
                <RotateCcw size={16} strokeWidth={2.6} aria-hidden />
              )}
              {status === "correct" ? correctTitle : wrongTitle}
            </div>
            <div>
              {status === "correct"
                ? en
                  ? q.explain.en
                  : q.explain.af
                : en
                  ? q.hint.en
                  : q.hint.af}
            </div>
          </div>
        )}

        {/* Action row */}
        <div
          style={{
            position: "relative",
            marginTop: 22,
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {status === "wrong" && (
            <button
              type="button"
              onClick={handleTryAgain}
              data-testid="rizz-demo-try-again"
              style={{
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 800,
                fontSize: 14,
                color: "#FFB7E5",
                background: "transparent",
                border: "1.5px solid #FFB7E5",
                borderRadius: 10,
                padding: "10px 18px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <RotateCcw size={16} strokeWidth={2.6} /> {tryAgain}
            </button>
          )}
          {status === "correct" && !isLast && (
            <button
              type="button"
              onClick={handleNext}
              data-testid="rizz-demo-next"
              style={{
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 800,
                fontSize: 14,
                color: "#050508",
                background: "#94F7C5",
                border: "none",
                borderRadius: 10,
                padding: "11px 20px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {nextQ} <ChevronRight size={16} strokeWidth={2.8} />
            </button>
          )}
          {status === "correct" && isLast && (
            <>
              <span
                data-testid="rizz-demo-done-msg"
                style={{
                  fontSize: 13.5,
                  color: "#fff",
                  opacity: 0.9,
                  marginRight: "auto",
                }}
              >
                {doneMsg}
              </span>
              <button
                type="button"
                onClick={handleNext}
                data-testid="rizz-demo-restart"
                style={{
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "#9FF5E8",
                  background: "transparent",
                  border: "1.5px solid #9FF5E8",
                  borderRadius: 10,
                  padding: "10px 18px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <RotateCcw size={16} strokeWidth={2.6} />{" "}
                {en ? "Play again" : "Speel weer"}
              </button>
              <Link href="/signin">
                <button
                  type="button"
                  data-testid="rizz-demo-cta"
                  className="pub-btn"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  {doneCtaLbl} <ArrowRight size={16} strokeWidth={2.8} />
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Confetti — mounted only while status === "correct". Status resets to
          "idle" on Next / Try again, so subsequent correct answers get a fresh
          <ConfettiBurst> mount (its useEffect fires each time on mount). No
          `key` prop needed — this mirrors how exam-full / boost-session mount
          the same component. */}
      {status === "correct" && <ConfettiBurst />}
    </div>
  );
}
