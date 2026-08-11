// BrainTrack "For Schools" — reframed as a DISTRIBUTION-CHANNEL pitch, not
// enterprise/admin software. BrainTrack is a consumer app for SA Grade 12
// LEARNERS; on this page the school is simply the fastest way to get that app
// into their matrics' hands. Learner benefit leads; the school's role is three
// simple steps. Pure-black street-graffiti design: sticker cards with hard
// offset shadows (zero blur), pure #fff/#050508 text (no grey, no faded white),
// bt- prefixed keyframes. Bilingual EN/AF. Shared PublicNav + PublicFooter.
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/lib/language-context";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const WORDMARK_GRADIENT =
  "linear-gradient(95deg,#9FD8FF,#94F7C5,#FFE29A,#FFB7E5,#C5B3FF)";
const CONTACT_EMAIL = "learn@kth-tech.com";
// Primary and secondary CTAs both mail the same address, but with distinct
// pre-filled subjects so the two buttons open genuinely different intents
// (apply-to-partner vs. ask-a-question) instead of duplicating each other.
const PARTNER_SUBJECT = "We'd like to partner with BrainTrack";
const QUESTION_SUBJECT = "Question about BrainTrack for our school";

type Card = { icon: string; color: string; title: string; body: string };
type Step = { color: string; title: string; body: string };

const COPY = {
  en: {
    badge: "🎓 For principals, HODs & Grade 12 teams",
    eyebrow: "put the app in their hands",
    h1: "Give your matrics the app that gets them ready",
    sub: "BrainTrack is the matric app your Grade 12s actually study on — CAPS-aligned diagnostics, real NSC past papers, worked memos and a 24/7 AI tutor. Your school's only job is getting it into their hands. We handle everything else.",
    ctaPrimary: "Partner with BrainTrack →",
    ctaSecondary: "Ask us a question",
    proof: "Launching with 63 pilot schools across South Africa.",
    facts: [
      "No cost to the school",
      "Zero admin for staff",
      "POPIA-aligned by design",
      "EN + AF, every subject",
      "Onboarded in minutes",
    ],
    appEyebrow: "the learner's app",
    appHead: "What lands in your learners' hands",
    appSub: "It's not admin software for your office — it's the app your matrics open at 9pm the night before a test.",
    appCards: [
      { icon: "📅", color: "#9FF5E8", title: "Dynamic study plans", body: "Rebuilt daily around exactly what each learner got wrong." },
      { icon: "📊", color: "#9FD8FF", title: "A decade of DBE data", body: "Ten years of NSC trends showing where matrics lose marks." },
      { icon: "📝", color: "#FFB7E5", title: "Past papers + memos", body: "Exam-style questions with worked memos, drilled topic by topic." },
      { icon: "🤖", color: "#C5B3FF", title: "Rizz, the 24/7 AI tutor", body: "EN + AF, any hour. Explains it until it finally clicks." },
      { icon: "🏆", color: "#FFE29A", title: "XP, streaks & rewards", body: "Motivation mechanics that keep learners coming back." },
      { icon: "👀", color: "#94F7C5", title: "Reports parents read", body: "Weekly progress updates families actually open." },
    ] as readonly Card[],
    stepEyebrow: "your three steps",
    stepHead: "Your part is simple",
    stepSub: "No new systems, no teacher training, no marking. Three steps and your Grade 12s are in.",
    steps: [
      { color: "#9FD8FF", title: "Say yes", body: "Fill in one partnership form. We set your school up with a unique join code and QR poster." },
      { color: "#FFB7E5", title: "Share it", body: "Learners scan the QR or enter the code — and they're onboarded onto the app in minutes." },
      { color: "#94F7C5", title: "See the cohort", body: "Optional, anonymised class insights show engagement and exam readiness per subject." },
    ] as readonly Step[],
    trustEyebrow: "the fine print, unfined",
    trustHead: "Zero risk. Zero admin.",
    trustSub: "The pitch is helping your matrics win — not selling your office another dashboard to manage.",
    trust: [
      { color: "#9FF5E8", title: "No cost, no contract", body: "No licence fee, no exclusivity, no lock-in. Take part for as long as it makes sense." },
      { color: "#C5B3FF", title: "POPIA-aligned by design", body: "Secure by design. Schools only ever see anonymised, school-level reporting." },
      { color: "#FFE29A", title: "We carry the load", body: "Onboarding, tech, learner support and comms are handled by the BrainTrack team, centrally." },
    ] as readonly Step[],
    closeEyebrow: "put the app in their hands",
    closeHead: "Ready to get your matrics ready?",
    closeBody: "Join the 63 pilot schools launching with BrainTrack. Get the matric app into your Grade 12s' hands — we'll handle the rest.",
    closeCtaPrimary: "Partner with BrainTrack →",
    closeCtaSecondary: "Ask us a question",
  },
  af: {
    badge: "🎓 Vir skoolhoofde, departementshoofde & Graad 12-spanne",
    eyebrow: "sit die app in hul hande",
    h1: "Gee jou matrieks die app wat hulle gereed kry",
    sub: "BrainTrack is die matriek-app waarop jou Graad 12's werklik studeer — KABV-belynde diagnostiek, regte NSS-vraestelle, uitgewerkte memo's en 'n 24/7 KI-tutor. Jou skool se enigste taak is om dit in hul hande te kry. Ons hanteer al die res.",
    ctaPrimary: "Vennoot met BrainTrack →",
    ctaSecondary: "Vra ons 'n vraag",
    proof: "Ons begin met 63 loodsskole regoor Suid-Afrika.",
    facts: [
      "Geen koste vir die skool nie",
      "Geen administrasie vir personeel nie",
      "POPIA-belyn per ontwerp",
      "EN + AF, elke vak",
      "Binne minute aan boord",
    ],
    appEyebrow: "die leerder se app",
    appHead: "Wat in jou leerders se hande beland",
    appSub: "Dis nie admin-sagteware vir jou kantoor nie — dis die app wat jou matrieks om 9nm die aand voor 'n toets oopmaak.",
    appCards: [
      { icon: "📅", color: "#9FF5E8", title: "Dinamiese studieplanne", body: "Daagliks herbou rondom presies wat elke leerder verkeerd gekry het." },
      { icon: "📊", color: "#9FD8FF", title: "'n Dekade se DBE-data", body: "Tien jaar se NSS-neigings wat wys waar matrieks punte verloor." },
      { icon: "📝", color: "#FFB7E5", title: "Vraestelle + memo's", body: "Eksamenstyl-vrae met uitgewerkte memo's, onderwerp vir onderwerp gedril." },
      { icon: "🤖", color: "#C5B3FF", title: "Rizz, die 24/7 KI-tutor", body: "EN + AF, enige uur. Verduidelik totdat dit uiteindelik klik." },
      { icon: "🏆", color: "#FFE29A", title: "XP, reekse & belonings", body: "Motiveringsmeganika wat leerders laat terugkom." },
      { icon: "👀", color: "#94F7C5", title: "Verslae wat ouers lees", body: "Weeklikse vorderingsopdaterings wat gesinne werklik oopmaak." },
    ] as readonly Card[],
    stepEyebrow: "jou drie stappe",
    stepHead: "Jou deel is eenvoudig",
    stepSub: "Geen nuwe stelsels, geen onderwyseropleiding, geen nasien nie. Drie stappe en jou Graad 12's is in.",
    steps: [
      { color: "#9FD8FF", title: "Sê ja", body: "Vul een vennootskapsvorm in. Ons stel jou skool op met 'n unieke aansluitkode en QR-plakkaat." },
      { color: "#FFB7E5", title: "Deel dit", body: "Leerders skandeer die QR of voer die kode in — en hulle is binne minute op die app aan boord." },
      { color: "#94F7C5", title: "Sien die kohort", body: "Opsionele, geanonimiseerde klasinsigte wys betrokkenheid en eksamengereedheid per vak." },
    ] as readonly Step[],
    trustEyebrow: "die kleingedrukte, sonder slaggate",
    trustHead: "Geen risiko. Geen administrasie.",
    trustSub: "Die doel is om jou matrieks te help wen — nie om jou kantoor nog 'n dashboard te verkoop om te bestuur nie.",
    trust: [
      { color: "#9FF5E8", title: "Geen koste, geen kontrak", body: "Geen lisensiefooi, geen eksklusiwiteit, geen vasknel nie. Neem deel so lank as wat dit sin maak." },
      { color: "#C5B3FF", title: "POPIA-belyn per ontwerp", body: "Veilig per ontwerp. Skole sien slegs geanonimiseerde verslagdoening op skoolvlak." },
      { color: "#FFE29A", title: "Ons dra die las", body: "Aanboord, tegniek, leerderondersteuning en kommunikasie word sentraal deur die BrainTrack-span hanteer." },
    ] as readonly Step[],
    closeEyebrow: "sit die app in hul hande",
    closeHead: "Gereed om jou matrieks gereed te kry?",
    closeBody: "Sluit aan by die 63 loodsskole wat met BrainTrack begin. Kry die matriek-app in jou Graad 12's se hande — ons hanteer die res.",
    closeCtaPrimary: "Vennoot met BrainTrack →",
    closeCtaSecondary: "Vra ons 'n vraag",
  },
} as const;

export default function ForSchoolsPage() {
  const { language } = useLanguage();
  const t = COPY[language];
  const en = language === "en";

  useSEO({
    title: "For Schools | BrainTrack Matric App for Your Grade 12s",
    description:
      "Partner with BrainTrack to give your Grade 12s the CAPS-aligned matric app — past papers, memos and a 24/7 AI tutor. No cost, no admin, POPIA-aligned.",
    canonical: "https://braintrack.tech/for-schools",
    ogTitle: "For Schools — Get the Matric App to Your Grade 12s | BrainTrack™",
    ogDescription:
      "The matric app your Grade 12s study on — diagnostics, past papers, memos and a 24/7 AI tutor. Your school's only job is getting it into their hands. No cost, no admin.",
    ogUrl: "https://braintrack.tech/for-schools",
    locale: en ? "en_ZA" : "af_ZA",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://braintrack.tech/" },
          { "@type": "ListItem", position: 2, name: "For Schools", item: "https://braintrack.tech/for-schools" },
        ],
      },
    ],
  });

  const palette = ["#9FD8FF", "#94F7C5", "#9FF5E8", "#FFE29A", "#FFB7E5", "#C5B3FF"];

  return (
    <div
      className="min-h-screen"
      style={{ background: "#050508", color: "#fff", overflowX: "hidden" }}
      data-testid="page-for-schools"
    >
      <style>{`
        .btfs-sticker { transition: transform .18s ease, box-shadow .18s ease; }
        .btfs-sticker:hover { transform: translate(-3px,-3px); box-shadow: 9px 9px 0 0 var(--sh); }
        .btfs-btn { transition: transform .18s ease, box-shadow .18s ease; }
        .btfs-btn:hover { transform: translate(-3px,-3px); box-shadow: 9px 9px 0 0 var(--sh); }
        .btfs-chip { animation: bt-fs-pop .5s cubic-bezier(.34,1.56,.64,1) backwards; animation-delay: calc(var(--i,0) * .06s); transition: transform .18s ease; }
        .btfs-chip:hover { transform: translate(-2px,-2px); }
        .btfs-in { animation: bt-fs-up .55s cubic-bezier(.22,.75,.3,1) backwards; animation-delay: var(--d,0s); }
        @keyframes bt-fs-up { from { opacity: 0; transform: translateY(24px); } }
        @keyframes bt-fs-pop { 0% { opacity: 0; transform: scale(.5) rotate(-6deg); } 70% { opacity: 1; transform: scale(1.1) rotate(2deg); } }
        @media (prefers-reduced-motion: reduce) {
          .btfs-in, .btfs-chip { opacity: 1; animation: none !important; }
          .btfs-sticker, .btfs-btn { transition: none !important; }
        }
      `}</style>

      <PublicNav />

      <main style={{ paddingTop: 64 }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "clamp(40px,7vw,72px) 20px 96px" }}>

          {/* ── Hero ─────────────────────────────────────────── */}
          <section style={{ textAlign: "center" }}>
            <div
              className="btfs-in"
              style={{ ["--d" as string]: ".04s", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase", color: "#050508", background: "#94F7C5", border: "2.5px solid #050508", boxShadow: "5px 5px 0 0 #94F7C5", borderRadius: 999, padding: "9px 18px", marginBottom: 22 }}
            >
              {t.badge}
            </div>
            <div
              className="btfs-in"
              style={{ ["--d" as string]: ".12s", fontFamily: "'Bebas Neue', system-ui, sans-serif", color: "#FFB7E5", fontSize: "clamp(16px,4vw,20px)", transform: "rotate(-2deg)", marginBottom: 6 }}
            >
              {t.eyebrow}
            </div>
            <h1
              className="btfs-in"
              data-testid="text-forschools-title"
              style={{ ["--d" as string]: ".2s", fontSize: "clamp(34px,7vw,62px)", fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.04, margin: "0 auto 18px", maxWidth: 900, fontFamily: "'Poppins',sans-serif", color: "#fff" }}
            >
              {t.h1}
            </h1>
            <p
              className="btfs-in"
              data-testid="text-forschools-subtitle"
              style={{ ["--d" as string]: ".3s", fontSize: "clamp(15px,2.4vw,19px)", color: "#fff", maxWidth: 680, margin: "0 auto", lineHeight: 1.6 }}
            >
              {t.sub}
            </p>

            <div
              className="btfs-in"
              style={{ ["--d" as string]: ".4s", display: "flex", justifyContent: "center", gap: 14, marginTop: 30, flexWrap: "wrap" }}
            >
              <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(PARTNER_SUBJECT)}`} style={{ textDecoration: "none" }}>
                <button
                  className="pub-btn"
                  data-testid="button-hero-apply"
                >
                  {t.ctaPrimary}
                </button>
              </a>
              <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(QUESTION_SUBJECT)}`} style={{ textDecoration: "none" }}>
                <button
                  className="pub-btn-outline"
                  data-testid="button-hero-email"
                >
                  {t.ctaSecondary}
                </button>
              </a>
            </div>
          </section>

          {/* ── Social proof: 63 pilot schools ───────────────── */}
          <div
            style={{ marginTop: 40, background: "#050508", border: "2.5px solid #FFE29A", boxShadow: "6px 6px 0 0 #FFE29A", borderRadius: 18, padding: "18px 22px", textAlign: "center", transform: "rotate(-.4deg)" }}
          >
            <span style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", fontSize: "clamp(17px,3.4vw,24px)", color: "#FFE29A" }}>
              {t.proof}
            </span>
          </div>

          {/* Quick-fact chips */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 24 }}>
            {t.facts.map((fact, i) => {
              const color = palette[i % palette.length];
              return (
                <span
                  key={fact}
                  className="btfs-chip"
                  data-testid={`chip-quickfact-${i}`}
                  style={{ ["--i" as string]: i, fontSize: 13, fontWeight: 800, color, background: "#050508", border: `2px solid ${color}`, borderRadius: 999, padding: "9px 16px" }}
                >
                  {fact}
                </span>
              );
            })}
          </div>

          {/* ── What learners get ────────────────────────────── */}
          <section style={{ marginTop: 84 }}>
            <div style={{ textAlign: "center", marginBottom: 34 }}>
              <div style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", color: "#9FF5E8", fontSize: "clamp(15px,3vw,19px)", transform: "rotate(-1.5deg)", marginBottom: 8 }}>
                {t.appEyebrow}
              </div>
              <h2 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 900, letterSpacing: "-1.2px", color: "#fff", margin: "0 0 12px", lineHeight: 1.08 }}>
                {t.appHead}
              </h2>
              <p style={{ fontSize: "clamp(14px,2.2vw,17px)", color: "#fff", maxWidth: 620, margin: "0 auto", lineHeight: 1.55 }}>
                {t.appSub}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 18 }}>
              {t.appCards.map((c, i) => (
                <div
                  key={c.title}
                  className="btfs-sticker"
                  data-testid={`card-app-${i}`}
                  style={{ ["--sh" as string]: c.color, background: "#050508", border: `2.5px solid ${c.color}`, boxShadow: `6px 6px 0 0 ${c.color}`, borderRadius: 18, padding: "24px 22px" }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "#050508", border: `2px solid ${c.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 14 }}>
                    {c.icon}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-.4px", color: c.color, marginBottom: 6 }}>{c.title}</div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#fff", margin: 0 }}>{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── The school's simple role ─────────────────────── */}
          <section style={{ marginTop: 84 }}>
            <div style={{ textAlign: "center", marginBottom: 34 }}>
              <div style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", color: "#FFB7E5", fontSize: "clamp(15px,3vw,19px)", transform: "rotate(-1.5deg)", marginBottom: 8 }}>
                {t.stepEyebrow}
              </div>
              <h2 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 900, letterSpacing: "-1.2px", color: "#fff", margin: "0 0 12px", lineHeight: 1.08 }}>
                {t.stepHead}
              </h2>
              <p style={{ fontSize: "clamp(14px,2.2vw,17px)", color: "#fff", maxWidth: 620, margin: "0 auto", lineHeight: 1.55 }}>
                {t.stepSub}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 18 }}>
              {t.steps.map((s, i) => (
                <div
                  key={s.title}
                  className="btfs-sticker"
                  data-testid={`card-step-${i}`}
                  style={{ ["--sh" as string]: s.color, background: "#050508", border: `2.5px solid ${s.color}`, boxShadow: `6px 6px 0 0 ${s.color}`, borderRadius: 18, padding: "26px 22px" }}
                >
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: s.color, color: "#050508", border: "2.5px solid #050508", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', system-ui, sans-serif", fontSize: 22, marginBottom: 16 }}>
                    {i + 1}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 19, letterSpacing: "-.4px", color: "#fff", marginBottom: 6 }}>{s.title}</div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#fff", margin: 0 }}>{s.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Zero risk / trust ────────────────────────────── */}
          <section style={{ marginTop: 84 }}>
            <div style={{ textAlign: "center", marginBottom: 34 }}>
              <div style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", color: "#C5B3FF", fontSize: "clamp(15px,3vw,19px)", transform: "rotate(-1.5deg)", marginBottom: 8 }}>
                {t.trustEyebrow}
              </div>
              <h2 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 900, letterSpacing: "-1.2px", color: "#fff", margin: "0 0 12px", lineHeight: 1.08 }}>
                {t.trustHead}
              </h2>
              <p style={{ fontSize: "clamp(14px,2.2vw,17px)", color: "#fff", maxWidth: 620, margin: "0 auto", lineHeight: 1.55 }}>
                {t.trustSub}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 18 }}>
              {t.trust.map((c, i) => (
                <div
                  key={c.title}
                  className="btfs-sticker"
                  data-testid={`card-trust-${i}`}
                  style={{ ["--sh" as string]: c.color, background: "#050508", border: `2.5px solid ${c.color}`, boxShadow: `6px 6px 0 0 ${c.color}`, borderRadius: 18, padding: "24px 22px" }}
                >
                  <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-.4px", color: c.color, marginBottom: 6 }}>{c.title}</div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#fff", margin: 0 }}>{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Closing sticker CTA ──────────────────────────── */}
          <section
            style={{ marginTop: 88, background: "#050508", border: "2.5px solid #fff", boxShadow: "8px 8px 0 0 #FFB7E5", borderRadius: 24, padding: "clamp(32px,6vw,52px) clamp(22px,5vw,44px)", textAlign: "center" }}
          >
            <div style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", color: "#FFB7E5", fontSize: "clamp(15px,3vw,19px)", transform: "rotate(-2deg)", marginBottom: 10 }}>
              {t.closeEyebrow}
            </div>
            <h2 style={{ fontSize: "clamp(26px,5.5vw,44px)", fontWeight: 900, letterSpacing: "-1.4px", color: "#fff", margin: "0 0 16px", lineHeight: 1.06 }}>
              {t.closeHead}
            </h2>
            <p style={{ fontSize: "clamp(15px,2.4vw,18px)", color: "#fff", maxWidth: 640, margin: "0 auto 30px", lineHeight: 1.6 }}>
              {t.closeBody}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(PARTNER_SUBJECT)}`} style={{ textDecoration: "none" }}>
                <button
                  className="pub-btn"
                  data-testid="button-cta-apply"
                >
                  {t.closeCtaPrimary}
                </button>
              </a>
              <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(QUESTION_SUBJECT)}`} style={{ textDecoration: "none" }}>
                <button
                  className="pub-btn-outline"
                  data-testid="button-cta-email"
                >
                  {t.closeCtaSecondary}
                </button>
              </a>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
