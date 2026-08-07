import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";
import { PublicNav } from "@/components/public-nav";
import { PublicFooter } from "@/components/public-footer";

const WORDMARK_GRADIENT =
  "linear-gradient(95deg,#9FD8FF,#94F7C5,#FFE29A,#FFB7E5,#C5B3FF)";

// 404 — always noindex so a crawler that hits a mistyped URL never sends the
// 404 page itself into the index. On-brand "lost" page: keeps the matric-flavoured
// tone, mounts the shared public shell, and points visitors back to the two
// highest-intent public routes (home + sign in).
export default function NotFound() {
  const { language } = useLanguage();
  const isAf = language === "af";

  useSEO({
    title: "Page not found | BrainTrack",
    description:
      "The page you're looking for isn't here. Head back to BrainTrack for Grade 12 matric past papers, memos and study plans.",
    canonical: "https://braintrack.tech/",
    noIndex: true,
  });

  return (
    <div
      className="min-h-screen"
      style={{ background: "#050508", color: "#fff" }}
      data-testid="page-not-found"
    >
      {/* keyframes must be bt-prefixed or a global switch kills them */}
      <style>{`
        @keyframes bt-nf-bob {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50%      { transform: translateY(-10px) rotate(-2deg); }
        }
        .bt-nf-sticker {
          transition: transform .14s ease, box-shadow .14s ease;
        }
        .bt-nf-sticker:hover {
          transform: translate(-3px, -3px);
        }
        .bt-nf-sticker:active {
          transform: translate(0, 0);
        }
      `}</style>

      <PublicNav />

      <main
        style={{
          paddingTop: 64,
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 640,
            margin: "0 auto",
            padding: "56px 20px 72px",
            textAlign: "center",
          }}
        >
          {/* Giant graffiti 404 glyph */}
          <div
            aria-hidden
            style={{
              fontFamily: "'Bebas Neue', system-ui, sans-serif",
              fontSize: "clamp(88px, 26vw, 200px)",
              lineHeight: 0.9,
              letterSpacing: "-2px",
              backgroundImage: WORDMARK_GRADIENT,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
              animation: "bt-nf-bob 3.4s ease-in-out infinite",
            }}
          >
            404
          </div>

          {/* Real (single) h1 — keeps the required copy */}
          <h1
            style={{
              fontFamily: "'Bebas Neue', system-ui, sans-serif",
              fontSize: "clamp(24px, 6vw, 40px)",
              color: "#fff",
              margin: "10px 0 0",
              lineHeight: 1.1,
            }}
          >
            {isAf ? "404 — Bladsy nie gevind nie" : "404 — Page not found"}
          </h1>

          {/* Witty matric-flavoured line */}
          <p
            style={{
              color: "#fff",
              fontSize: "clamp(15px, 3.5vw, 18px)",
              fontWeight: 700,
              maxWidth: 460,
              margin: "16px auto 0",
              lineHeight: 1.5,
            }}
          >
            {isAf
              ? "Hierdie bladsy is soos daai vraag wat jy oorgeslaan het — nêrens te vinde nie. Kom ons kry jou terug op koers vir matriek."
              : "This page pulled a disappearing act, like that one question you skipped — nowhere on the paper. Let's get you back on track for matric."}
          </p>

          {/* Big sticker buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
              marginTop: 32,
            }}
          >
            <Link href="/">
              <span
                className="pub-btn"
                data-testid="link-404-home"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              >
                {isAf ? "Terug na tuisblad" : "Back to home"}
              </span>
            </Link>

            <Link href="/signin">
              <span
                className="pub-btn-outline"
                data-testid="link-404-signin"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              >
                {isAf ? "Kom in" : "Sign in"}
              </span>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
