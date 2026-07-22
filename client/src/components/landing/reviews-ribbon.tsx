// BrainTrack landing — reviews ribbon
// A marquee-style horizontal scroller of short learner/parent testimonial cards.
// Uses the global `bt-marquee` keyframe (already exempt from the animation
// kill-switch via the [style*="bt-"] selector in index.css). Duplicates the
// content twice to loop seamlessly; pauses on hover via an inline
// `animationPlayState` toggle so we don't fight the kill-switch with a CSS rule.
//
// NOTE: these are *sample* testimonials, not real endorsements — the section
// header explicitly labels them as pilot-cohort samples. Names are first-name
// + initial only so no real person is attributed. Bilingual EN/AF.
import { useState } from "react";
import { Star, MessageCircle, Sparkles } from "lucide-react";

type Review = {
  name: string;
  role: { en: string; af: string };
  subject: { en: string; af: string };
  quote: { en: string; af: string };
  stars: number;
  color: string; // pastel accent
  glow: string; // matching rgba glow
};

// 8 sample testimonials — SA learners + one parent. Each is illustrative of a
// real-world BrainTrack outcome; none are attributed to a real person.
const REVIEWS: Review[] = [
  {
    name: "Thabo M.",
    role: { en: "Grade 12 · Gauteng", af: "Graad 12 · Gauteng" },
    subject: { en: "Mathematics", af: "Wiskunde" },
    quote: {
      en: "Rizz explains stuff in ways my textbook never did. My marks went from 52% to 71% in three months.",
      af: "Rizz verduidelik op maniere wat my handboek nooit kon nie. My punte het van 52% tot 71% in drie maande gespring.",
    },
    stars: 5,
    color: "#9FF5E8",
    glow: "rgba(159,245,232,.35)",
  },
  {
    name: "Ayesha K.",
    role: { en: "Grade 12 · KZN", af: "Graad 12 · KZN" },
    subject: { en: "Life Sciences", af: "Lewenswetenskappe" },
    quote: {
      en: "The AF-EN switch is a lifesaver. I study in Afrikaans and ask Rizz questions in English — same content, same day.",
      af: "Die AF-EN-wissel is 'n redder. Ek studeer in Afrikaans en vra Rizz vrae in Engels — dieselfde inhoud, dieselfde dag.",
    },
    stars: 5,
    color: "#9FD8FF",
    glow: "rgba(159,216,255,.35)",
  },
  {
    name: "Sizwe D.",
    role: { en: "Grade 12 · Eastern Cape", af: "Graad 12 · Oos-Kaap" },
    subject: { en: "Physical Sciences", af: "Fisiese Wetenskappe" },
    quote: {
      en: "Past papers with real memos, all in one place. No more tab-hopping at midnight looking for answers.",
      af: "Vraestelle met regte memo's, alles op een plek. Nie meer laatnag-oortoggie op soek na antwoorde nie.",
    },
    stars: 5,
    color: "#FFB7E5",
    glow: "rgba(255,183,229,.35)",
  },
  {
    name: "Chloé v.d. B.",
    role: { en: "Grade 12 · Western Cape", af: "Graad 12 · Wes-Kaap" },
    subject: { en: "Accounting", af: "Rekeningkunde" },
    quote: {
      en: "The weak-spot radar found gaps I didn't know I had. My prelim jumped 14% after two weeks of drills.",
      af: "Die swakplek-radar het gapings uitgewys wat ek nie geweet het nie. My proef het 14% opgestoot na twee weke se drille.",
    },
    stars: 5,
    color: "#C5B3FF",
    glow: "rgba(197,179,255,.35)",
  },
  {
    name: "Ntando J.",
    role: { en: "Grade 12 · Limpopo", af: "Graad 12 · Limpopo" },
    subject: { en: "Geography", af: "Aardrykskunde" },
    quote: {
      en: "My parents can actually see if I studied. Less nagging, more 'well done, keep going.'",
      af: "My ouers kan sien of ek geleer het. Minder gesanik, meer 'goed gedoen, hou aan.'",
    },
    stars: 5,
    color: "#FFE29A",
    glow: "rgba(255,226,154,.35)",
  },
  {
    name: "Karabo S.",
    role: { en: "Parent · Cape Town", af: "Ouer · Kaapstad" },
    subject: { en: "Parent view", af: "Ouer-perspektief" },
    quote: {
      en: "The weekly report is one clean page. I finally understand where my son is losing marks — and what he's about to nail.",
      af: "Die weeklikse verslag is een skoon bladsy. Ek verstaan uiteindelik waar my seun punte verloor — en waar hy nou-nou gaan wen.",
    },
    stars: 5,
    color: "#94F7C5",
    glow: "rgba(148,247,197,.35)",
  },
  {
    name: "Reneilwe P.",
    role: { en: "Grade 12 · Free State", af: "Graad 12 · Vrystaat" },
    subject: { en: "Business Studies", af: "Besigheidstudies" },
    quote: {
      en: "Streaks work. I'm on day 34 and my Business grade went from a Level 5 to Level 7.",
      af: "Reekse werk. Ek is op dag 34 en my Besigheids-punt het van Vlak 5 na Vlak 7 gegaan.",
    },
    stars: 5,
    color: "#9FF5E8",
    glow: "rgba(159,245,232,.35)",
  },
  {
    name: "Andiswa N.",
    role: { en: "Grade 12 · Gauteng", af: "Graad 12 · Gauteng" },
    subject: { en: "English HL", af: "Engels HT" },
    quote: {
      en: "Rizz coaches me through essay structures at 11pm on a Sunday. Zero judgement, all guidance.",
      af: "Rizz help my met opstelstruktuur om 23:00 op 'n Sondag. Geen oordeel nie, net leiding.",
    },
    stars: 4,
    color: "#FFB7E5",
    glow: "rgba(255,183,229,.35)",
  },
];

export function ReviewsRibbon({ language }: { language: "en" | "af" }) {
  const en = language === "en";
  const [paused, setPaused] = useState(false);

  // Section copy
  const eye = en ? "voices from the pilot" : "stemme van die proefloop";
  const head = en ? "What learners are saying" : "Wat leerders sê";
  const sampleTag = en ? "Sample" : "Voorbeeld";
  const subHead = en
    ? "Illustrative testimonials from our pilot cohort — real reviews go live as learners publish them."
    : "Illustratiewe getuienis van ons proefkohort — regte resensies gaan lewend soos leerders dit publiseer.";

  // Duplicate list for a seamless marquee loop.
  const loop = [...REVIEWS, ...REVIEWS];

  return (
    <div
      className="btl-sec"
      style={{ maxWidth: 1240, margin: "116px auto 0", padding: "0 32px" }}
      data-testid="section-reviews-ribbon"
    >
      {/* Local keyframes — hover-pause helper. bt-marquee itself is defined
          globally in index.css and is already kill-switch-exempt. */}
      <style>{`
        .bt-review-card {
          transition: transform .32s cubic-bezier(.22,.75,.3,1),
                      box-shadow .32s ease, border-color .32s ease;
        }
        .bt-review-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 22px 46px var(--rglow, rgba(255,255,255,.15));
          border-color: var(--rc, #9FD8FF) !important;
        }
      `}</style>

      {/* Section header — icon + Permanent Marker eyebrow */}
      <div style={{ textAlign: "center", marginBottom: 34 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "'Permanent Marker',cursive",
            color: "#FFB7E5",
            fontSize: 17,
            letterSpacing: ".5px",
            transform: "rotate(-2deg)",
          }}
        >
          <MessageCircle size={20} strokeWidth={2.4} color="#FFB7E5" aria-hidden />
          <span>{eye}</span>
        </div>
        <div
          className="btl-sec-head"
          style={{
            fontSize: 38,
            fontWeight: 900,
            letterSpacing: "-1.2px",
            lineHeight: 1.14,
            marginTop: 10,
            color: "#fff",
          }}
        >
          {head}
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
          {subHead}
        </div>
      </div>

      {/* Marquee track — mask fade at edges, hover-pause via inline animPlayState */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "6px 0 10px",
          WebkitMaskImage:
            "linear-gradient(90deg,transparent 0,#000 8%,#000 92%,transparent 100%)",
          maskImage:
            "linear-gradient(90deg,transparent 0,#000 8%,#000 92%,transparent 100%)",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          data-testid="reviews-marquee-track"
          style={{
            display: "flex",
            gap: 20,
            width: "max-content",
            // Inline "bt-marquee" is exempt from the global kill-switch.
            animation: "bt-marquee 55s linear infinite",
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {loop.map((r, i) => {
            const roleTxt = en ? r.role.en : r.role.af;
            const subjTxt = en ? r.subject.en : r.subject.af;
            const quoteTxt = en ? r.quote.en : r.quote.af;
            return (
              <div
                key={`${r.name}-${i}`}
                className="bt-review-card"
                data-testid={`review-card-${i % REVIEWS.length}`}
                style={
                  {
                    "--rc": r.color,
                    "--rglow": r.glow,
                    flex: "0 0 auto",
                    width: 320,
                    boxSizing: "border-box",
                    background:
                      "linear-gradient(160deg,rgba(255,255,255,.06),rgba(255,255,255,.015))",
                    border: `1.5px solid ${r.color}`,
                    borderRadius: 20,
                    padding: "22px 22px 20px",
                    boxShadow: `0 12px 30px ${r.glow}`,
                  } as React.CSSProperties
                }
              >
                {/* Header row: name + sample chip */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: "#fff",
                        letterSpacing: "-.2px",
                      }}
                    >
                      {r.name}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: r.color,
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      {roleTxt}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: ".8px",
                      color: "#050508",
                      background: r.color,
                      borderRadius: 6,
                      padding: "3px 7px",
                      textTransform: "uppercase",
                    }}
                  >
                    {sampleTag}
                  </span>
                </div>
                {/* Stars + subject */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "inline-flex", gap: 2 }}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        size={14}
                        strokeWidth={2.2}
                        aria-hidden
                        style={{
                          color: s < r.stars ? "#FFE29A" : "rgba(255,255,255,.22)",
                          fill: s < r.stars ? "#FFE29A" : "transparent",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                      opacity: 0.86,
                    }}
                  >
                    · {subjTxt}
                  </span>
                </div>
                {/* Quote */}
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "#fff",
                    fontStyle: "italic",
                  }}
                >
                  <Sparkles
                    size={12}
                    strokeWidth={2.4}
                    color={r.color}
                    aria-hidden
                    style={{
                      display: "inline",
                      verticalAlign: "-1px",
                      marginRight: 5,
                    }}
                  />
                  {`"${quoteTxt}"`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
