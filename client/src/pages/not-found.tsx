import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";

// 404 — always noindex so a crawler that hits a mistyped URL never sends the
// 404 page itself into the index. The friendly copy points visitors back to
// the highest-intent public pages (landing, past papers, subscribe).
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
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "#050508" }}
    >
      <Card
        className="w-full max-w-md mx-4"
        style={{
          background: "rgba(255,255,255,.03)",
          border: "1px solid rgba(255,255,255,.09)",
          borderRadius: 22,
        }}
      >
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8" style={{ color: "#FFB7E5" }} />
            <h1
              className="text-2xl font-semibold"
              style={{ color: "#fff" }}
            >
              {isAf ? "404 — Bladsy nie gevind nie" : "404 — Page not found"}
            </h1>
          </div>

          <p className="mt-4 text-sm" style={{ color: "#fff" }}>
            {isAf
              ? "Die bladsy wat jy soek bestaan nie of het geskuif. Probeer een van hierdie:"
              : "The page you're looking for doesn't exist or has moved. Try one of these:"}
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <Link href="/">
              <span
                data-testid="link-404-home"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  color: "#9FF5E8", fontWeight: 700, cursor: "pointer",
                }}
              >
                <Home size={16} />
                {isAf ? "Terug na tuisblad" : "Back to home"}
              </span>
            </Link>
            <Link href="/past-papers">
              <span
                data-testid="link-404-past-papers"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  color: "#9FD8FF", fontWeight: 700, cursor: "pointer",
                }}
              >
                <ArrowLeft size={16} />
                {isAf ? "NSC vraestelle & memo's" : "NSC past papers & memos"}
              </span>
            </Link>
            <Link href="/subscribe">
              <span
                data-testid="link-404-subscribe"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  color: "#FFB7E5", fontWeight: 700, cursor: "pointer",
                }}
              >
                <ArrowLeft size={16} />
                {isAf ? "Begin 14-dae proeftydperk" : "Start 14-day free trial"}
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
