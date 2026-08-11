import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { LearnerHeader } from "@/components/learner-header";
import { Button } from "@/components/ui/button";

// The voice-notes / audio feature has been removed from the app entirely
// (per owner decision). This page is kept as a lightweight, valid route so
// any stale links (nav, deep links) land on a clean fallback instead of a
// broken page.
export default function MyNotesPage() {
  const { language } = useLanguage();
  const isAf = language === "af";

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}
    >
      <LearnerHeader
        backHref="/subjects"
        backLabel={isAf ? "Terug na vakke" : "Back to subjects"}
        title={isAf ? "My Notas" : "My Notes"}
        titleColor="#9FD8FF"
        maxWidthClassName="max-w-4xl"
      />

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div
          className="p-8 text-center"
          style={{
            background: "#0e0d12",
            border: "1px dashed #1b1922",
            borderRadius: 18,
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
