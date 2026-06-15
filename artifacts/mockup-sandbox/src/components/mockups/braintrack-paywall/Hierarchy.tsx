import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Sparkles,
  MessageSquare,
  Lightbulb,
  Languages,
  LineChart,
  Zap,
  CalendarDays,
  Lock,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Mail,
  ChevronLeft,
  BookOpen,
  GraduationCap,
  Pencil,
  Calculator,
  Ruler,
  FlaskConical,
  Globe2,
  Atom,
  Backpack,
  Microscope,
  Notebook,
  Beaker,
  PenTool,
  Compass,
  Brain,
  School,
  Home,
} from "lucide-react";

type Lang = "EN" | "AF";
type View = "plan" | "checkout";

const RAINBOW_LETTERS: { ch: string; color: string }[] = [
  { ch: "B", color: "#FF3B3B" },
  { ch: "r", color: "#FF7A1F" },
  { ch: "a", color: "#FFC83D" },
  { ch: "i", color: "#A6FF3D" },
  { ch: "n", color: "#3DFF85" },
  { ch: "T", color: "#3DE6FF" },
  { ch: "r", color: "#3D8BFF" },
  { ch: "a", color: "#9C5BFF" },
  { ch: "c", color: "#E14BFF" },
  { ch: "k", color: "#FF4BB1" },
];

// Tile colours derived from the per-letter "BrainTrack" wordmark hues.
const TILE_COLORS = [
  { ring: "#FF3B3B", glow: "rgba(255,59,59,0.35)",   bg: "rgba(255,59,59,0.10)"   }, // B
  { ring: "#FF7A1F", glow: "rgba(255,122,31,0.35)",  bg: "rgba(255,122,31,0.10)"  }, // r
  { ring: "#FFC83D", glow: "rgba(255,200,61,0.35)",  bg: "rgba(255,200,61,0.10)"  }, // a
  { ring: "#3DBE2E", glow: "rgba(61,190,46,0.40)",   bg: "rgba(61,190,46,0.12)"   }, // i
  { ring: "#3DFF85", glow: "rgba(61,255,133,0.35)",  bg: "rgba(61,255,133,0.10)"  }, // n
  { ring: "#3DE6FF", glow: "rgba(61,230,255,0.35)",  bg: "rgba(61,230,255,0.10)"  }, // T
  { ring: "#9C5BFF", glow: "rgba(156,91,255,0.35)",  bg: "rgba(156,91,255,0.10)"  }, // a
  { ring: "#E14BFF", glow: "rgba(225,75,255,0.35)",  bg: "rgba(225,75,255,0.10)"  }, // c
];

const FEATURES = [
  { icon: FileText,       en: "NSC Past Papers + Memos (2015–2025)", af: "NSC Vorige Vraestelle + Memo's (2015–2025)" },
  { icon: Sparkles,       en: "Rizz AI Tutor (CAPS-aligned)",        af: "Rizz KI-Tutor (KABV-belyn)" },
  { icon: MessageSquare,  en: "50 Tutor Questions a day",            af: "50 Tutor-vrae per dag" },
  { icon: Lightbulb,      en: "Unlimited Questions",                 af: "Onbeperkte Vrae" },
  { icon: Languages,      en: "English & Afrikaans",                 af: "Engels & Afrikaans" },
  { icon: LineChart,      en: "Progress Tracking & Analytics",       af: "Vorderingsopvolging & Analise" },
  { icon: Zap,            en: "Crunch Time Adaptive Drills",         af: "Eksamentyd Aanpasbare Drille" },
  { icon: CalendarDays,   en: "Study Calendar & Planner",            af: "Studiekalender & Beplanner" },
];

const COPY = {
  EN: {
    saPill: "Made for South Africa · Grade 12 · CAPS · NSC",
    plan: "Matrix 26",
    tagline: "Everything you need to crush Grade 12 — papers, AI tutor, plan.",
    perMonth: "/ month",
    trial: "Start trial now",
    trialSub: "No card charged until day 15.",
    energy: "PRACTISE  ·  IMPROVE  ·  ACHIEVE",
    cta: "Start free trial",
    autoCancel: "Cancel anytime from settings.",
    autoCancelDetail: "If you cancel, your access continues for 30 days from your last billing date. No emails, no forms.",
    secure: "Secure checkout via Paystack",
    securePay: "Card · instant EFT · USSD",
    back: "Back",
    checkoutTitle: "One last step",
    checkoutSub: "Use your school email if you want your reports tracked.",
    emailLabel: "Email for receipts",
    emailPlaceholder: "you@school.co.za",
    finalCta: "Start my 14-day trial",
    afterTrial: "Then R169/month. Cancel from settings, anytime.",
    switchLang: "Skakel na Afrikaans",
  },
  AF: {
    saPill: "Gemaak vir Suid-Afrika · Graad 12 · KABV · NSS",
    plan: "Matrix 26",
    tagline: "Alles wat jy nodig het om Graad 12 te klop — vraestelle, KI-tutor, plan.",
    perMonth: "/ maand",
    trial: "Begin proeftydperk nou",
    trialSub: "Geen kaart gehef voor dag 15 nie.",
    energy: "OEFEN  ·  VERBETER  ·  PRESTEER",
    cta: "Begin gratis proeftydperk",
    autoCancel: "Kanselleer enige tyd in instellings.",
    autoCancelDetail: "As jy kanselleer, hou jou toegang aan vir 30 dae vanaf jou laaste faktureringsdatum. Geen e-posse, geen vorms nie.",
    secure: "Veilige betaling via Paystack",
    securePay: "Kaart · kits-EFT · USSD",
    back: "Terug",
    checkoutTitle: "Een laaste stap",
    checkoutSub: "Gebruik jou skool-e-pos as jy wil hê jou verslae moet opgespoor word.",
    emailLabel: "E-pos vir bewyse",
    emailPlaceholder: "jy@skool.co.za",
    finalCta: "Begin my 14-dae proeftydperk",
    afterTrial: "Dan R169/maand. Kanselleer vanaf instellings, enige tyd.",
    switchLang: "Switch to English",
  },
} as const;

function RainbowWordmark({ size = "text-5xl sm:text-6xl" }: { size?: string }) {
  return (
    <h1 className={`${size} font-extrabold tracking-tight inline-flex`} style={{ fontFamily: "Sora, Inter, system-ui, sans-serif" }}>
      {RAINBOW_LETTERS.map((l, i) => (
        <span key={i} style={{ color: l.color, textShadow: `0 0 18px ${l.color}55, 0 0 4px ${l.color}88` }}>{l.ch}</span>
      ))}
      <span className="ml-1 text-slate-400 text-base align-top mt-2">™</span>
    </h1>
  );
}

const BRAINTRACK_GLOW_KEYFRAMES = `
@keyframes braintrackGlow {
  0%   { box-shadow: 0 0 18px 2px rgba(255,59,59,0.55),  0 0 36px 6px rgba(255,59,59,0.35),  0 0 0 1px rgba(255,255,255,0.08) inset; }
  16%  { box-shadow: 0 0 18px 2px rgba(255,122,31,0.55), 0 0 36px 6px rgba(255,200,61,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset; }
  33%  { box-shadow: 0 0 18px 2px rgba(166,255,61,0.55), 0 0 36px 6px rgba(61,255,133,0.4),  0 0 0 1px rgba(255,255,255,0.08) inset; }
  50%  { box-shadow: 0 0 18px 2px rgba(61,230,255,0.55), 0 0 36px 6px rgba(61,139,255,0.4),  0 0 0 1px rgba(255,255,255,0.08) inset; }
  66%  { box-shadow: 0 0 18px 2px rgba(156,91,255,0.55), 0 0 36px 6px rgba(225,75,255,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset; }
  83%  { box-shadow: 0 0 18px 2px rgba(255,75,177,0.55), 0 0 36px 6px rgba(255,59,59,0.4),   0 0 0 1px rgba(255,255,255,0.08) inset; }
  100% { box-shadow: 0 0 18px 2px rgba(255,59,59,0.55),  0 0 36px 6px rgba(255,59,59,0.35),  0 0 0 1px rgba(255,255,255,0.08) inset; }
}
.braintrack-cta { animation: braintrackGlow 6s linear infinite; }

@keyframes mathFloat {
  0%   { transform: translate3d(0,0,0) rotate(0deg); }
  50%  { transform: translate3d(0,-14px,0) rotate(2deg); }
  100% { transform: translate3d(0,0,0) rotate(0deg); }
}
@keyframes mathPulse {
  0%, 100% { opacity: 0.22; filter: blur(0.2px); }
  50%      { opacity: 0.42; filter: blur(0px); }
}
.math-symbol { animation: mathFloat 9s ease-in-out infinite, mathPulse 5s ease-in-out infinite; will-change: transform, opacity; }
`;

export function Hierarchy() {
  const [lang, setLang] = useState<Lang>("EN");
  const [view, setView] = useState<View>("plan");
  const t = COPY[lang];

  return (
    <div className="min-h-screen relative overflow-hidden text-slate-800 font-sans" style={{ background: "#FFFFFF" }}>
      <style dangerouslySetInnerHTML={{ __html: BRAINTRACK_GLOW_KEYFRAMES }} />
      {/* Soft pastel glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-15%] left-[5%] w-[700px] h-[700px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 65%)" }} />
        <div className="absolute top-[5%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-25" style={{ background: "radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 65%)" }} />
        <div className="absolute bottom-[-15%] left-[35%] w-[600px] h-[600px] rounded-full opacity-25" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 65%)" }} />
      </div>
      {/* Subtle neon school icons */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        {[
          { Icon: BookOpen,       top: "5%",  left: "4%",  size: 36, color: "#FF3B3B" },
          { Icon: GraduationCap,  top: "10%", left: "88%", size: 40, color: "#9C5BFF" },
          { Icon: Pencil,         top: "18%", left: "12%", size: 30, color: "#3DE6FF" },
          { Icon: Calculator,     top: "22%", left: "78%", size: 34, color: "#34D399" },
          { Icon: Ruler,          top: "30%", left: "5%",  size: 32, color: "#FFC83D" },
          { Icon: FlaskConical,   top: "34%", left: "92%", size: 36, color: "#E14BFF" },
          { Icon: Globe2,         top: "42%", left: "10%", size: 38, color: "#FF7A1F" },
          { Icon: Atom,           top: "46%", left: "82%", size: 36, color: "#22D3EE" },
          { Icon: Backpack,       top: "54%", left: "3%",  size: 36, color: "#A78BFA" },
          { Icon: Microscope,     top: "58%", left: "88%", size: 34, color: "#FB7185" },
          { Icon: Notebook,       top: "66%", left: "14%", size: 32, color: "#3DFF85" },
          { Icon: Beaker,         top: "70%", left: "76%", size: 30, color: "#38BDF8" },
          { Icon: PenTool,        top: "78%", left: "6%",  size: 32, color: "#FBBF24" },
          { Icon: Compass,        top: "82%", left: "84%", size: 36, color: "#FF4BB1" },
          { Icon: Brain,          top: "88%", left: "22%", size: 34, color: "#3DBE2E" },
          { Icon: School,         top: "92%", left: "62%", size: 36, color: "#9C5BFF" },
          { Icon: BookOpen,       top: "38%", left: "48%", size: 28, color: "#FF7A1F" },
          { Icon: Pencil,         top: "8%",  left: "50%", size: 26, color: "#22D3EE" },
        ].map((s, i) => {
          const I = s.Icon;
          return (
            <span
              key={i}
              className="absolute math-symbol inline-flex"
              style={{
                top: s.top,
                left: s.left,
                color: s.color,
                filter: `drop-shadow(0 0 6px ${s.color}) drop-shadow(0 0 14px ${s.color}aa)`,
                animationDelay: `${(i * 0.4).toFixed(2)}s, ${(i * 0.3).toFixed(2)}s`,
                animationDuration: `${8 + (i % 5)}s, ${4 + (i % 3)}s`,
              }}
            >
              <I style={{ width: s.size, height: s.size }} strokeWidth={1.6} />
            </span>
          );
        })}
      </div>

      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => { window.location.href = "/"; }}
            aria-label={lang === "EN" ? "Back to home" : "Terug na tuis"}
            className="h-12 w-12 rounded-2xl border-0 inline-flex items-center justify-center text-black transition-transform hover:-translate-y-0.5"
            style={{
              background: "#FF3B3B",
              boxShadow: "0 0 22px 2px rgba(255,59,59,0.55), 0 0 48px 8px rgba(255,59,59,0.35)",
            }}
          >
            <Home className="w-5 h-5" />
          </button>
          <button
            onClick={() => setLang(lang === "EN" ? "AF" : "EN")}
            className="h-12 px-5 text-sm font-extrabold text-black rounded-2xl border-0 tracking-wide inline-flex items-center gap-2 transition-transform hover:-translate-y-0.5"
            style={{
              background: "#3DFF85",
              boxShadow: "0 0 22px 2px rgba(61,255,133,0.55), 0 0 48px 8px rgba(61,255,133,0.35)",
            }}
          >
            <Languages className="w-4 h-4" />
            {t.switchLang}
          </button>
        </header>

        {view === "plan" ? (
          <>
            {/* Hero */}
            <div className="text-center mb-10">
              <RainbowWordmark />
              <p className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">{t.plan}</p>
              <p className="text-slate-600 text-base sm:text-lg max-w-md mx-auto mt-2">{t.tagline}</p>

              {/* SA pill */}
              <div className="mt-5 flex justify-center">
                <span
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-black"
                  style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 8px 30px rgba(0,0,0,0.25)" }}
                >
                  <span className="text-2xl leading-none shrink-0" aria-hidden="true">🇿🇦</span>
                  <span
                    className="text-base sm:text-lg font-extrabold tracking-wide"
                    style={{
                      color: "#FBBF24",
                      textShadow: "0 0 14px rgba(251,191,36,0.55), 0 0 28px rgba(251,191,36,0.35)",
                    }}
                  >
                    {t.saPill}
                  </span>
                </span>
              </div>

              {/* Price */}
              <div className="mt-6 flex items-baseline justify-center gap-2">
                <span className="text-6xl font-extrabold text-slate-900 tracking-tight">R169</span>
                <span className="text-lg text-slate-500 font-medium">{t.perMonth}</span>
              </div>
              <div className="mt-5 flex justify-center">
                <Button
                  onClick={() => setView("checkout")}
                  className="h-12 px-7 text-base font-extrabold rounded-2xl group border-0 tracking-wide text-black transition-transform hover:-translate-y-0.5"
                  style={{
                    background: "#1E3A8A",
                    boxShadow: "0 0 22px 2px rgba(30,58,138,0.55), 0 0 48px 8px rgba(30,58,138,0.35)",
                  }}
                >
                  {t.trial}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Energy line */}
            <div className="text-center mb-6">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-[0.18em] bg-clip-text text-transparent" style={{
                backgroundImage: "linear-gradient(90deg, #FF3B3B, #FF7A1F, #FBBF24, #34D399, #22D3EE, #9C5BFF, #E14BFF)"
              }}>
                {t.energy}
              </span>
            </div>

            {/* Tiles — neon tickets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                const c = TILE_COLORS[i % TILE_COLORS.length];
                return (
                  <div
                    key={f.en}
                    className="rounded-2xl p-4 bg-white transition-transform hover:-translate-y-1"
                    style={{
                      boxShadow: `inset 0 0 0 1.5px ${c.ring}, 0 0 0 1px ${c.ring}33, 0 0 22px ${c.glow}, 0 0 44px ${c.glow}, 0 6px 18px rgba(15,23,42,0.06)`,
                    }}
                  >
                    <span
                      className="inline-flex h-10 w-10 rounded-xl items-center justify-center mb-3"
                      style={{
                        background: c.bg,
                        boxShadow: `inset 0 0 0 1.5px ${c.ring}, 0 0 18px ${c.glow}`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: c.ring, filter: `drop-shadow(0 0 6px ${c.ring}cc)` }} />
                    </span>
                    <p className="text-[13px] leading-snug text-black font-semibold">
                      {lang === "EN" ? f.en : f.af}
                    </p>
                  </div>
                );
              })}
            </div>

          </>
        ) : (
          <>
            <button
              onClick={() => setView("plan")}
              className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {t.back}
            </button>

            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">{t.checkoutTitle}</h2>
              <p className="text-slate-400">{t.checkoutSub}</p>
            </div>

            {/* Order summary */}
            <Card className="bg-white/[0.03] border-white/10 p-5 rounded-2xl mb-6 flex items-center gap-4">
              <span className="inline-flex h-12 w-12 rounded-xl items-center justify-center" style={{
                background: "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.25))",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
              }}>
                <Sparkles className="w-5 h-5 text-fuchsia-300" />
              </span>
              <div className="flex-1">
                <div className="font-semibold text-white text-base">{t.plan}</div>
                <div className="text-xs text-slate-400">{t.trial}</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">R0.00</div>
                <div className="text-[11px] text-slate-500">today</div>
              </div>
            </Card>

            {/* Email */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="email" className="text-slate-200 text-sm font-medium inline-flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {t.emailLabel}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t.emailPlaceholder}
                className="bg-white/[0.04] border-white/10 text-white h-12 rounded-xl placeholder:text-slate-600 focus-visible:ring-fuchsia-400/40"
              />
            </div>

            {/* Single payment rail */}
            <Card className="p-4 rounded-2xl mb-6 flex items-center gap-3" style={{
              background: "linear-gradient(135deg, rgba(34,211,238,0.08), rgba(168,85,247,0.08))",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
            }}>
              <span className="inline-flex h-10 w-10 rounded-lg bg-white/5 ring-1 ring-white/15 items-center justify-center">
                <Lock className="w-4 h-4 text-cyan-300" />
              </span>
              <div className="flex-1">
                <div className="font-medium text-white text-sm">{t.secure}</div>
                <div className="text-xs text-slate-400">{t.securePay}</div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </Card>

            {/* Final CTA */}
            <Button className="w-full h-14 text-base font-bold rounded-2xl text-[#04020a] group border-0" style={{
              background: "linear-gradient(90deg, #FF7A1F, #FBBF24, #34D399, #22D3EE, #9C5BFF, #E14BFF)",
              boxShadow: "0 8px 30px rgba(236,72,153,0.35)",
            }}>
              {t.finalCta}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>

            <div className="mt-5 space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <CalendarDays className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-300" />
                <span>{t.afterTrial}</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-300" />
                <span>{t.autoCancelDetail}</span>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t.autoCancel}</span>
        </footer>
      </div>
    </div>
  );
}
