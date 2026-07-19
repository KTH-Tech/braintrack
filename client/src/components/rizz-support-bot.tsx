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
      { label: "Explain photosynthesis 🌱", q: "Explain photosynthesis for Grade 12 Life Sciences, with the equation and both phases." },
      { label: "Solve a quadratic ➗", q: "Show me step by step how to solve the quadratic equation x² − 5x + 6 = 0." },
      { label: "What is inflation? 💰", q: "Explain inflation for Grade 12 Economics, with how it is measured in South Africa." },
      { label: "Explain osmosis 🔬", q: "Explain osmosis for Grade 12 Life Sciences, with an example." },
    ],
    fallbackPresets: [
      {
        label: "Explain photosynthesis 🌱",
        q: "Explain photosynthesis 🌱",
        a: `PHOTOSYNTHESIS — Life Sciences Gr 12 🌱

Definition: the process in which green plants use light energy, trapped by chlorophyll in the chloroplasts, to convert carbon dioxide and water into glucose and oxygen.

Balanced equation:
6CO₂ + 12H₂O --light / chlorophyll--> C₆H₁₂O₆ + 6O₂ + 6H₂O

Stage 1 — Light phase (in the grana): chlorophyll absorbs light → water is split by photolysis → O₂ is released, and ATP + NADPH are formed.
Stage 2 — Dark phase / Calvin cycle (in the stroma): CO₂ is fixed and reduced using that ATP + NADPH → glucose.

Exam tip: markers look for "photolysis" and the correct site of each phase (grana vs stroma). Never write "plants make energy" — they convert light energy into chemical energy. 🔥`,
      },
      {
        label: "Solve a quadratic ➗",
        q: "Solve a quadratic ➗",
        a: `SOLVING A QUADRATIC — Mathematics Gr 12 ➗

Worked example: solve x² − 5x + 6 = 0

Step 1: Make the equation equal to 0 ✔ (it already is).
Step 2: Factorise — find two numbers that multiply to +6 and add to −5 → −2 and −3, so (x − 2)(x − 3) = 0.
Step 3: Zero-product rule — if a product is 0, one factor is 0: x − 2 = 0 or x − 3 = 0.
Step 4: x = 2 or x = 3.

If it won't factorise, use the formula: x = [−b ± √(b² − 4ac)] ÷ 2a

Exam tip: always get everything on one side (= 0) before you factorise, and substitute your roots back in to check. Only round to 2 decimals if the question asks for it. 🔥`,
      },
      {
        label: "What is inflation? 💰",
        q: "What is inflation? 💰",
        a: `INFLATION — Economics Gr 12 💰

Definition: a sustained and considerable rise in the general price level of goods and services over time, which means money loses purchasing power — each rand buys less.

How SA measures it: Stats SA prices a fixed "basket" of goods each month to build the Consumer Price Index (CPI). The inflation rate is the % change in CPI year on year.
Quick example: the basket costs R1 000 this year and R1 060 next year → (60 ÷ 1 000) × 100 = 6% inflation.

Two main causes: demand-pull (too much spending chasing too few goods) and cost-push (rising input costs like fuel or wages).
Control: the SA Reserve Bank raises the repo rate to cool spending — its target band is 3–6%.

Exam tip: the words "sustained" and "general price level" earn the definition mark. One product getting more expensive is NOT inflation. 🔥`,
      },
      {
        label: "Explain osmosis 🔬",
        q: "Explain osmosis 🔬",
        a: `OSMOSIS — Life Sciences Gr 12 🔬

Definition: the movement of water molecules from a region of high water potential (a dilute solution) to a region of low water potential (a concentrated solution), through a selectively permeable membrane. It is passive — no energy is used.

Worked example: place a potato strip in strong salt water. The salt solution has a lower water potential than the cell sap, so water moves out of the cells → they become flaccid and eventually plasmolysed, and the strip goes limp and loses mass. In pure water the reverse happens: water moves in and the cells become turgid.

Diffusion vs osmosis: diffusion is any particle moving down its concentration gradient; osmosis is water only, and it needs a membrane.

Exam tip: use the phrases "water potential" and "selectively permeable membrane" — those are the mark-earning words. 🔥`,
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
      { label: "Verduidelik fotosintese 🌱", q: "Verduidelik fotosintese vir Graad 12 Lewenswetenskappe, met die vergelyking en albei fases." },
      { label: "Los 'n kwadratiese op ➗", q: "Wys my stap vir stap hoe om die kwadratiese vergelyking x² − 5x + 6 = 0 op te los." },
      { label: "Wat is inflasie? 💰", q: "Verduidelik inflasie vir Graad 12 Ekonomie, en hoe dit in Suid-Afrika gemeet word." },
      { label: "Verduidelik osmose 🔬", q: "Verduidelik osmose vir Graad 12 Lewenswetenskappe, met 'n voorbeeld." },
    ],
    fallbackPresets: [
      {
        label: "Verduidelik fotosintese 🌱",
        q: "Verduidelik fotosintese 🌱",
        a: `FOTOSINTESE — Lewenswetenskappe Gr 12 🌱

Definisie: die proses waarin groen plante ligenergie, wat deur chlorofil in die chloroplaste opgevang word, gebruik om koolstofdioksied en water om te skakel na glukose en suurstof.

Gebalanseerde vergelyking:
6CO₂ + 12H₂O --lig / chlorofil--> C₆H₁₂O₆ + 6O₂ + 6H₂O

Fase 1 — Ligfase (in die grana): chlorofil absorbeer lig → water word deur fotolise gesplits → O₂ word vrygestel en ATP + NADPH word gevorm.
Fase 2 — Donkerfase / Calvin-siklus (in die stroma): CO₂ word vasgelê en gereduseer met daardie ATP + NADPH → glukose.

Eksamenwenk: nasieners soek die woord "fotolise" en die korrekte plek van elke fase (grana vs stroma). Moenie skryf "plante maak energie" nie — hulle skakel ligenergie om na chemiese energie. 🔥`,
      },
      {
        label: "Los 'n kwadratiese op ➗",
        q: "Los 'n kwadratiese op ➗",
        a: `KWADRATIESE VERGELYKINGS — Wiskunde Gr 12 ➗

Uitgewerkte voorbeeld: los op x² − 5x + 6 = 0

Stap 1: Maak die vergelyking gelyk aan 0 ✔ (dit is reeds so).
Stap 2: Faktoriseer — soek twee getalle wat +6 gee as jy hulle vermenigvuldig en −5 as jy hulle optel → −2 en −3, dus (x − 2)(x − 3) = 0.
Stap 3: Nul-produk-reël — as 'n produk 0 is, is een faktor 0: x − 2 = 0 of x − 3 = 0.
Stap 4: x = 2 of x = 3.

As dit nie faktoriseer nie, gebruik die formule: x = [−b ± √(b² − 4ac)] ÷ 2a

Eksamenwenk: kry altyd alles aan een kant (= 0) voordat jy faktoriseer, en vervang jou wortels terug om te toets. Rond net af tot 2 desimale as die vraag dit vra. 🔥`,
      },
      {
        label: "Wat is inflasie? 💰",
        q: "Wat is inflasie? 💰",
        a: `INFLASIE — Ekonomie Gr 12 💰

Definisie: 'n volgehoue en aansienlike styging in die algemene prysvlak van goedere en dienste oor tyd, wat beteken geld verloor koopkrag — elke rand koop minder.

Hoe SA dit meet: Stats SA bepaal elke maand die prys van 'n vaste "mandjie" goedere om die Verbruikersprysindeks (VPI) op te stel. Die inflasiekoers is die % verandering in die VPI van jaar tot jaar.
Vinnige voorbeeld: die mandjie kos vanjaar R1 000 en volgende jaar R1 060 → (60 ÷ 1 000) × 100 = 6% inflasie.

Twee hoofoorsake: vraagaangedrewe (te veel besteding jaag te min goedere) en koste-gedrewe (stygende insetkoste soos brandstof of lone).
Beheer: die SA Reserwebank verhoog die repokoers om besteding af te koel — die teikenband is 3–6%.

Eksamenwenk: die woorde "volgehoue" en "algemene prysvlak" verdien die definisiepunt. Een produk wat duurder word, is NIE inflasie nie. 🔥`,
      },
      {
        label: "Verduidelik osmose 🔬",
        q: "Verduidelik osmose 🔬",
        a: `OSMOSE — Lewenswetenskappe Gr 12 🔬

Definisie: die beweging van watermolekules vanaf 'n gebied met 'n hoë waterpotensiaal ('n verdunde oplossing) na 'n gebied met 'n lae waterpotensiaal ('n gekonsentreerde oplossing), deur 'n selektief deurlaatbare membraan. Dit is passief — geen energie word gebruik nie.

Uitgewerkte voorbeeld: sit 'n aartappelstrokie in sterk soutwater. Die soutoplossing het 'n laer waterpotensiaal as die selsap, dus beweeg water uit die selle → hulle word slap en uiteindelik geplasmoliseer, en die strokie word pap en verloor massa. In suiwer water gebeur die teenoorgestelde: water beweeg in en die selle word turgied.

Diffusie vs osmose: diffusie is enige deeltjie wat teen sy konsentrasiegradiënt afbeweeg; osmose is net water, en dit het 'n membraan nodig.

Eksamenwenk: gebruik die terme "waterpotensiaal" en "selektief deurlaatbare membraan" — dít is die woorde wat punte verdien. 🔥`,
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
        .btr-close { opacity: 1; }
        .btr-close:hover { border-color: #FF8DA1 !important; color: #FF8DA1 !important; transform: scale(1.08); }
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
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btr-close"
              data-testid="button-rizz-close"
              title={isAf ? "Maak toe" : "Close"}
              aria-label="Close Rizz chat"
              style={{
                cursor: "pointer", fontSize: 24, lineHeight: 1, color: "#fff",
                width: 34, height: 34, display: "flex", alignItems: "center",
                justifyContent: "center", borderRadius: "50%", flex: "none",
                padding: 0, fontWeight: 700, fontFamily: "'Poppins',sans-serif",
                background: "rgba(255,255,255,.12)",
                border: "1.5px solid rgba(255,255,255,.55)",
                transition: "all .15s",
              }}
            >
              ×
            </button>
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
