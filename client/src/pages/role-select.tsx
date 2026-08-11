// BrainTrack role select — restyled to the Claude Design handoff
// "Luxury Street Graffiti EdTech" comp (BrainTrack.dc.html, FIRST SCREEN —
// WHO ARE YOU). Near-black #050508 ground, floating icon + rainbow wordmark,
// marker eyebrow, accent-bordered glowing role cards. Restyle only — the
// role-confirm mutation/navigation logic is unchanged.
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import iconTransparent from "@/assets/handoff/icon-transparent.png";

type Role = "learner" | "parent";

const ROLE_STYLES: Record<Role, { accent: string; emoji: string }> = {
  learner: { accent: "#9FF5E8", emoji: "🎓" },
  parent: { accent: "#C5B3FF", emoji: "🫶" },
};

// Solid Permanent-Marker glyphs — no blur, no glow. Replaces the old blurred
// ambient radial glow behind the hero.
const SCATTER: Array<{ glyph: string; color: string; size: number; rotate: number; style: React.CSSProperties }> = [
  { glyph: "★", color: "#FFE29A", size: 26, rotate: -14, style: { top: "8%", left: "10%" } },
  { glyph: "⚡", color: "#9FF5E8", size: 24, rotate: 10, style: { top: "14%", right: "9%" } },
  { glyph: "✦", color: "#C5B3FF", size: 22, rotate: 8, style: { bottom: "18%", left: "7%" } },
  { glyph: "☻", color: "#FFB7E5", size: 22, rotate: -8, style: { bottom: "12%", right: "8%" } },
];

export default function RoleSelectPage() {
  const { language, toggleLanguage } = useLanguage();
  const { toast } = useToast();
  const isAf = language === "af";
  const en = language === "en";
  const [selected, setSelected] = useState<Role | null>(null);

  const roleMutation = useMutation({
    mutationFn: (role: Role) =>
      apiRequest("POST", "/api/auth/set-role", { role }),
    onSuccess: (_data, role) => {
      if (role === "parent") {
        window.location.href = "/parent-onboarding";
      } else {
        window.location.href = "/onboarding";
      }
    },
    onError: (err: any) => {
      if (err?.message?.includes("already confirmed")) {
        window.location.href = "/dashboard";
      } else {
        toast({
          title: isAf ? "Fout" : "Error",
          description: isAf ? "Kon nie rol stel nie. Probeer asseblief weer." : "Could not set role. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleSelect = (role: Role) => {
    if (!roleMutation.isPending) setSelected(role);
  };

  const handleConfirm = () => {
    if (!selected) return;
    roleMutation.mutate(selected);
  };

  const cards: Array<{ role: Role; label: string; desc: string }> = [
    {
      role: "learner",
      label: isAf ? "Ek is 'n Leerder" : "I'm a Learner",
      desc: isAf
        ? "Studeer slimmer, volg my vordering en slaag my matriek-eksamens"
        : "Study smarter, track my progress, and ace my matric exams",
    },
    {
      role: "parent",
      label: isAf ? "Ek is 'n Ouer" : "I'm a Parent",
      desc: isAf
        ? "Teken in vir my kind en hou hulle vordering dop"
        : "Subscribe for my child and keep track of their progress",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh", background: "#050508", color: "#fff",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "40px 20px",
        position: "relative", overflow: "hidden",
        fontFamily: "'Poppins',sans-serif",
      }}
    >
      <style>{`
        .btrs-card { transition: transform .2s, box-shadow .2s, border-color .2s; }
        .btrs-card:hover:not(:disabled) { transform: translateY(-6px); }
        .btrs-cta { transition: transform .2s, opacity .2s; }
        .btrs-cta:hover:not(:disabled) { transform: translateY(-2px); }
      `}</style>

      {/* Solid scatter glyphs — zero blur/glow, replaces the old ambient wash. */}
      {SCATTER.map((s, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute", fontFamily: "'Bebas Neue', system-ui, sans-serif",
            fontSize: s.size, color: s.color, transform: `rotate(${s.rotate}deg)`,
            pointerEvents: "none", zIndex: 0,
            animation: `bt-float ${7 + i}s ease-in-out infinite`,
            ...s.style,
          }}
        >
          {s.glyph}
        </span>
      ))}

      {/* Language toggle */}
      <button
        onClick={toggleLanguage}
        data-testid="button-language-toggle"
        style={{
          position: "absolute", top: 20, right: 20, zIndex: 3,
          display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 800,
          fontFamily: "'Poppins',sans-serif", background: "transparent",
          border: "1.5px solid #9FD8FF", borderRadius: 8,
          overflow: "hidden", cursor: "pointer", userSelect: "none", padding: 0,
        }}
      >
        <span style={{ padding: "6px 10px", background: en ? "#9FF5E8" : "transparent", color: en ? "#050508" : "#fff" }}>EN</span>
        <span style={{ padding: "6px 10px", background: en ? "transparent" : "#9FF5E8", color: en ? "#fff" : "#050508" }}>AF</span>
      </button>

      <img
        src={iconTransparent}
        alt="BrainTrack"
        style={{
          width: 120, height: 120, objectFit: "contain",
          position: "relative", zIndex: 2,
          animation: "bt-float 6s ease-in-out infinite",
        }}
      />
      <span className="bt-wordmark" style={{ fontSize: 40, letterSpacing: "-1px", marginTop: 14, position: "relative", zIndex: 2 }}>
        BrainTrack
      </span>
      <div
        style={{
          fontFamily: "'Bebas Neue', system-ui, sans-serif", fontSize: 18, color: "#9FF5E8",
          transform: "rotate(-2deg)", margin: "8px 0 18px", position: "relative", zIndex: 2,
        }}
      >
        {isAf ? "stap 1 van 3 — wie teken vandag in?" : "step 1 of 3 — who's tagging in today?"}
      </div>

      <div style={{ textAlign: "center", position: "relative", zIndex: 2, maxWidth: 520 }}>
        <div
          role="heading"
          aria-level={1}
          style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.1, color: "#fff" }}
        >
          {isAf ? "Welkom! Wie is jy?" : "Welcome! Who are you?"}
        </div>
        <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.6, color: "#fff" }}>
          {isAf
            ? "Kies jou rol hieronder. Jy kan dit verander voor jy bevestig."
            : "Select your role below. You can change it before confirming."}
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", position: "relative", zIndex: 2, margin: "26px 0 24px" }}>
        {cards.map(({ role, label, desc }) => {
          const s = ROLE_STYLES[role];
          const isSel = selected === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => handleSelect(role)}
              disabled={roleMutation.isPending}
              className="btrs-card"
              data-testid={`button-role-${role}`}
              style={{
                width: 220,
                background: "#0e0d12",
                border: `2.5px solid ${s.accent}`,
                boxShadow: isSel ? `6px 6px 0 0 ${s.accent}` : "none",
                borderRadius: 18, padding: "26px 20px", textAlign: "center",
                cursor: roleMutation.isPending ? "default" : "pointer",
                color: "#fff", fontFamily: "'Poppins',sans-serif",
                opacity: roleMutation.isPending ? 0.6 : 1,
              }}
            >
              <div
                style={{
                  width: 52, height: 52, margin: "0 auto 12px", borderRadius: 14,
                  background: "#0e0d12", border: `1.5px solid ${s.accent}`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 24,
                }}
              >
                {s.emoji}
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, color: s.accent }}>{label}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#fff", marginTop: 6 }}>{desc}</div>
              {isSel && (
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: s.accent, marginTop: 8 }}>
                  ● {isAf ? "GEKIES" : "SELECTED"}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selected || roleMutation.isPending}
        className="pub-btn btrs-cta"
        data-testid="button-confirm-role"
        style={{
          width: 340, maxWidth: "92vw", position: "relative", zIndex: 2,
          whiteSpace: "nowrap",
          opacity: !selected || roleMutation.isPending ? 0.45 : 1,
          cursor: !selected || roleMutation.isPending ? "default" : "pointer",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {roleMutation.isPending ? (
            <>
              <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
              {isAf ? "Besig…" : "Setting up…"}
            </>
          ) : (
            <>
              {isAf
                ? `Bevestig — Ek is 'n ${selected === "learner" ? "Leerder" : selected === "parent" ? "Ouer" : "…"}`
                : `Confirm — I'm a ${selected === "learner" ? "Learner" : selected === "parent" ? "Parent" : "…"}`}
              {" →"}
            </>
          )}
        </span>
      </button>

      <div style={{ marginTop: 20, fontSize: 12.5, color: "#fff", textAlign: "center", position: "relative", zIndex: 2, maxWidth: 420, lineHeight: 1.6 }}>
        {isAf
          ? "Hierdie sal jou ervaring aanpas. Administrateurs word deur die skool gestel."
          : "This personalises your experience. Admin accounts are set by the school."}
      </div>
    </div>
  );
}
