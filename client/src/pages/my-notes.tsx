import { Link } from "wouter";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";

// The voice-notes / audio feature has been removed from the app entirely
// (per owner decision). This page is kept as a lightweight, valid route so
// any stale links (nav, deep links) land on a clean fallback instead of a
// broken page.
export default function MyNotesPage() {
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}
    >
      {/* ── Sticky street header ── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(5,5,8,.94)", backdropFilter: "blur(10px)", borderColor: "rgba(255,255,255,.08)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/subjects">
                <button
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10 shrink-0"
                  style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }}
                  data-testid="button-back-subjects"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">{isAf ? "Terug na vakke" : "Back to subjects"}</span>
                </button>
              </Link>
            </div>
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10 shrink-0"
              style={{ color: "#C5B3FF", border: "1.5px solid #C5B3FF" }}
              data-testid="button-language-toggle"
            >
              {language === "en" ? "EN" : "AF"}
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div
          className="p-8 text-center"
          style={{
            background: "rgba(255,255,255,.03)",
            border: "1px dashed rgba(255,255,255,.18)",
            borderRadius: 20,
          }}
          data-testid="my-notes-unavailable"
        >
          <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: "#9FD8FF" }} />
          <p className="text-white text-sm font-medium">
            {isAf ? "Hierdie funksie is nie meer beskikbaar nie." : "This feature is no longer available."}
          </p>
          <Link href="/subjects">
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              data-testid="button-go-subjects"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {isAf ? "Kies 'n vak" : "Choose a subject"}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
