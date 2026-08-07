// BrainTrack landing — reviews ribbon
// A marquee-style horizontal scroller of testimonial cards.
// Uses the global `bt-marquee` keyframe (already exempt from the animation
// kill-switch via the [style*="bt-"] selector in index.css). Duplicates the
// content twice to loop seamlessly; pauses on hover via an inline
// `animationPlayState` toggle so we don't fight the kill-switch with a CSS rule.
//
// These are REAL quotes from BrainTrack's 2025 test cohort (~900 learners).
// No specific names, provinces, or schools are attributed — only role (learner,
// parent, school stakeholder, educator) and the cohort tag. The owner supplied
// the EN copy; AF translations are pending, so both language modes display the
// original English body with role labels localised where possible.
import { useState } from "react";
import { Star, MessageCircle, Sparkles, GraduationCap, HeartHandshake, School, BookOpen, Users } from "lucide-react";

type Role = "learner" | "parent" | "school" | "educator" | "cohort";

type Review = {
  role: Role;
  roleLabel: { en: string; af: string };
  quote: string; // EN body — see file header for the bilingual note
  stars: number;
  color: string; // pastel accent
  glow: string; // matching rgba glow
};

// 8 quotes from the 2025 Test Cohort of ~900 learners. Provided by the product
// owner from the cohort's post-programme feedback. Attribution kept to role
// only — no personal information published.
const REVIEWS: Review[] = [
  {
    role: "learner",
    roleLabel: { en: "Grade 12 Learner", af: "Graad 12 Leerder" },
    quote: "BrainTrack showed me what to study, not just how much I still had to study.",
    stars: 5,
    color: "#9FF5E8",
    glow: "rgba(159,245,232,.35)",
  },
  {
    role: "learner",
    roleLabel: { en: "Grade 12 Learner", af: "Graad 12 Leerder" },
    quote: "I stopped guessing whether I was ready and started working from a clear plan.",
    stars: 5,
    color: "#9FD8FF",
    glow: "rgba(159,216,255,.35)",
  },
  {
    role: "learner",
    roleLabel: { en: "Grade 12 Learner", af: "Graad 12 Leerder" },
    quote: "The platform turned my past-paper mistakes into focused revision.",
    stars: 5,
    color: "#FFB7E5",
    glow: "rgba(255,183,229,.35)",
  },
  {
    role: "parent",
    roleLabel: { en: "Parent", af: "Ouer" },
    quote: "The parent report helped us support our child without taking over the study process.",
    stars: 5,
    color: "#C5B3FF",
    glow: "rgba(197,179,255,.35)",
  },
  {
    role: "parent",
    roleLabel: { en: "Parent", af: "Ouer" },
    quote: "We could see progress, weaker areas and the next priorities in one place.",
    stars: 5,
    color: "#FFE29A",
    glow: "rgba(255,226,154,.35)",
  },
  {
    role: "school",
    roleLabel: { en: "School Stakeholder", af: "Skool-belanghebbende" },
    quote: "BrainTrack provided useful cohort insight without creating another manual administrative process.",
    stars: 5,
    color: "#94F7C5",
    glow: "rgba(148,247,197,.35)",
  },
  {
    role: "educator",
    roleLabel: { en: "Educator", af: "Opvoeder" },
    quote: "It gave learners structure during one of the most demanding periods of their school careers.",
    stars: 5,
    color: "#9FF5E8",
    glow: "rgba(159,245,232,.35)",
  },
  {
    role: "cohort",
    roleLabel: { en: "2025 Test Cohort", af: "2025 Toetsgroep" },
    quote: "The combination of diagnostics, targeted practice and visible progress improved learner confidence.",
    stars: 5,
    color: "#FFB7E5",
    glow: "rgba(255,183,229,.35)",
  },
];

const ROLE_ICON: Record<Role, typeof GraduationCap> = {
  learner: GraduationCap,
  parent: HeartHandshake,
  school: School,
  educator: BookOpen,
  cohort: Users,
};

export function ReviewsRibbon({ language }: { language: "en" | "af" }) {
  const en = language === "en";
  const [paused, setPaused] = useState(false);

  // Section copy — signals a real programme cohort, not a marketing invention.
  const eye = en ? "from the 2025 test cohort" : "van die 2025 toetsgroep";
  const head = en ? "What the pilot cohort said" : "Wat die proefkohort gesê het";
  const cohortChip = en ? "2025 Test Cohort" : "2025 Toetsgroep";
  const subHead = en
    ? "Feedback from ~900 Grade 12 learners, their parents and their schools who completed the BrainTrack 2025 test programme. We publish role only — no names, schools or provinces — because most participants are minors and their data is protected under South Africa's POPIA. Every voice here is real; every identity stays private."
    : "Terugvoer van ~900 Graad 12-leerders, hulle ouers en hulle skole wat die BrainTrack 2025-toetsprogramme voltooi het. Ons publiseer slegs die rol — geen name, skole of provinsies nie — omdat die meeste deelnemers minderjariges is en hulle data deur Suid-Afrika se POPIA beskerm word. Elke stem hier is eg; elke identiteit bly privaat.";

  // Duplicate list for a seamless marquee loop.
  const loop = [...REVIEWS, ...REVIEWS];

  return (
    <div
      className="btl-sec"
      /* Narrow closing band, not a full section. Sits directly above the
         footer, so the old 116px top gap and tall stacked header would have
         left a dead void between the last CTA and the wall. */
      style={{ maxWidth: 1240, margin: "56px auto 0", padding: "0 32px" }}
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
          /* Sticker-slap, not bloom — matches the global card treatment. */
          transform: translate(-3px,-3px) rotate(-.35deg);
          box-shadow: 7px 7px 0 0 var(--rc, #9FD8FF);
          border-color: var(--rc, #9FD8FF) !important;
        }
      `}</style>

      {/* Compact band header — eyebrow, headline and subhead sit on one
          centred line-wrapped row instead of three stacked blocks, so the
          whole ribbon stays short above the footer. */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "6px 14px",
          textAlign: "center",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "'Bebas Neue', system-ui, sans-serif",
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
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: "-.6px",
            lineHeight: 1.2,
            color: "#fff",
          }}
        >
          {head}
        </div>
        <div
          className="btl-sec-sub"
          style={{
            fontSize: 13.5,
            lineHeight: 1.5,
            color: "#fff",
            opacity: 0.9,
            maxWidth: 620,
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
            // Slow drift (owner: "slower") — 95s reads calm, not a scroll race.
            animation: "bt-marquee 95s linear infinite",
            animationPlayState: paused ? "paused" : "running",
          }}
        >
          {loop.map((r, i) => {
            const Icon = ROLE_ICON[r.role];
            const roleTxt = en ? r.roleLabel.en : r.roleLabel.af;
            return (
              <div
                key={`${r.role}-${i}`}
                className="bt-review-card"
                data-testid={`review-card-${i % REVIEWS.length}`}
                style={
                  {
                    "--rc": r.color,
                    "--rglow": r.glow,
                    flex: "0 0 auto",
                    // Thinner ribbon (owner): narrower cards + tighter padding
                    // + pure-black fill (no grey wash) + hard sticker edge
                    // instead of the soft bloom shadow.
                    width: 288,
                    boxSizing: "border-box",
                    background: "#050508",
                    border: `2px solid ${r.color}`,
                    borderRadius: 16,
                    padding: "14px 16px",
                    boxShadow: `4px 4px 0 0 ${r.color}`,
                  } as React.CSSProperties
                }
              >
                {/* Header row: role icon + label + cohort tag */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        display: "grid",
                        placeItems: "center",
                        background: `${r.color}22`,
                        border: `1px solid ${r.color}66`,
                        flex: "0 0 auto",
                      }}
                    >
                      <Icon size={17} strokeWidth={2.4} color={r.color} aria-hidden />
                    </div>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: "#fff",
                        letterSpacing: "-.1px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {roleTxt}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      letterSpacing: ".7px",
                      color: "#fff",
                      background: "#0e0d12",
                      border: "1px solid #9FD8FF",
                      borderRadius: 6,
                      padding: "3px 7px",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cohortChip}
                  </span>
                </div>
                {/* Stars */}
                <div
                  style={{
                    display: "inline-flex",
                    gap: 2,
                    marginBottom: 12,
                  }}
                >
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={14}
                      strokeWidth={2.2}
                      aria-hidden
                      style={{
                        color: s < r.stars ? "#FFE29A" : "#050508",
                        fill: s < r.stars ? "#FFE29A" : "transparent",
                      }}
                    />
                  ))}
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
                  {`"${r.quote}"`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
