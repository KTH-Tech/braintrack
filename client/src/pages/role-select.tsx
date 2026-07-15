import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Users, Loader2, Sparkles, Globe, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RoleSelectPage() {
  const { language, toggleLanguage } = useLanguage();
  const { toast } = useToast();
  const isAf = language === "af";
  const [selected, setSelected] = useState<"learner" | "parent" | null>(null);

  const roleMutation = useMutation({
    mutationFn: (role: "learner" | "parent") =>
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

  const handleSelect = (role: "learner" | "parent") => {
    if (!roleMutation.isPending) setSelected(role);
  };

  const handleConfirm = () => {
    if (!selected) return;
    roleMutation.mutate(selected);
  };

  return (
    <div className="dark min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Aurora glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 w-[520px] h-[520px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(0,229,255,0.4), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 w-[520px] h-[520px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(138,43,255,0.35), transparent 70%)" }}
      />

      <div className="relative w-full max-w-lg space-y-8">
        <div className="flex justify-end mb-2">
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-[11px] font-black focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[#8A2BFF]"
            style={{ color: "#8A2BFF", border: "1px solid rgba(138,43,255,0.55)", boxShadow: "0 0 10px rgba(138,43,255,0.35)" }}
            data-testid="button-language-toggle"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{language === "en" ? "EN" : "AF"}</span>
          </button>
        </div>

        <div className="text-center space-y-3">
          <p
            className="text-[11px] font-black uppercase tracking-[0.24em]"
            style={{ color: "#00E5FF", textShadow: "0 0 8px rgba(0,229,255,0.5)" }}
          >
            {isAf ? "Stap 1 van 3" : "Step 1 of 3"}
          </p>
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.05]"
            style={{
              background: "linear-gradient(90deg, #FF8A00, #FFE600, #00E5FF, #006BFF, #8A2BFF, #FF2BD6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 18px rgba(0,229,255,0.3))",
            }}
          >
            {isAf ? "Welkom! Wie is jy?" : "Welcome! Who are you?"}
          </h1>
          <p className="text-white max-w-md mx-auto leading-relaxed text-sm sm:text-base">
            {isAf
              ? "Kies jou rol hieronder. Jy kan dit verander voor jy bevestig."
              : "Select your role below. You can change it before confirming."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* LEARNER — cyan neon */}
          <button
            onClick={() => handleSelect("learner")}
            disabled={roleMutation.isPending}
            className="relative flex flex-col items-center gap-4 p-7 rounded-2xl bg-black text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[#00E5FF] transition-transform min-h-[12rem] disabled:opacity-60"
            style={{
              border: selected === "learner" ? "1.75px solid #00E5FF" : "1.5px solid rgba(0,229,255,0.45)",
              boxShadow:
                selected === "learner"
                  ? "0 0 28px rgba(0,229,255,0.55), inset 0 0 16px rgba(0,229,255,0.2)"
                  : "0 0 14px rgba(0,229,255,0.22), inset 0 0 14px rgba(0,0,0,0.6)",
              transform: selected === "learner" ? "scale(1.02)" : "scale(1)",
            }}
            data-testid="button-role-learner"
          >
            <div
              className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center"
              style={{ border: "1.5px solid #00E5FF", boxShadow: "0 0 16px rgba(0,229,255,0.45), inset 0 0 12px rgba(0,229,255,0.18)" }}
            >
              <GraduationCap className="w-8 h-8" style={{ color: "#00E5FF", filter: "drop-shadow(0 0 6px rgba(0,229,255,0.7))" }} />
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-white mb-1" style={{ textShadow: "0 0 10px rgba(0,229,255,0.4)" }}>
                {isAf ? "Ek is 'n Leerder" : "I'm a Learner"}
              </p>
              <p className="text-xs text-white leading-snug">
                {isAf
                  ? "Studeer slimmer, volg my vordering en slaag my matriek-eksamens"
                  : "Study smarter, track my progress, and ace my matric exams"}
              </p>
            </div>
            {selected === "learner" && (
              <span
                className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black flex items-center justify-center"
                style={{ border: "1.5px solid #00E5FF", boxShadow: "0 0 10px rgba(0,229,255,0.6)" }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#00E5FF" }} />
              </span>
            )}
            <span aria-hidden className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: "#00E5FF" }} />
            <span aria-hidden className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: "#00E5FF" }} />
          </button>

          {/* PARENT — purple neon */}
          <button
            onClick={() => handleSelect("parent")}
            disabled={roleMutation.isPending}
            className="relative flex flex-col items-center gap-4 p-7 rounded-2xl bg-black text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[#8A2BFF] transition-transform min-h-[12rem] disabled:opacity-60"
            style={{
              border: selected === "parent" ? "1.75px solid #8A2BFF" : "1.5px solid rgba(138,43,255,0.45)",
              boxShadow:
                selected === "parent"
                  ? "0 0 28px rgba(138,43,255,0.55), inset 0 0 16px rgba(138,43,255,0.2)"
                  : "0 0 14px rgba(138,43,255,0.22), inset 0 0 14px rgba(0,0,0,0.6)",
              transform: selected === "parent" ? "scale(1.02)" : "scale(1)",
            }}
            data-testid="button-role-parent"
          >
            <div
              className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center"
              style={{ border: "1.5px solid #8A2BFF", boxShadow: "0 0 16px rgba(138,43,255,0.45), inset 0 0 12px rgba(138,43,255,0.18)" }}
            >
              <Users className="w-8 h-8" style={{ color: "#8A2BFF", filter: "drop-shadow(0 0 6px rgba(138,43,255,0.7))" }} />
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-white mb-1" style={{ textShadow: "0 0 10px rgba(138,43,255,0.4)" }}>
                {isAf ? "Ek is 'n Ouer" : "I'm a Parent"}
              </p>
              <p className="text-xs text-white leading-snug">
                {isAf
                  ? "Teken in vir my kind en hou hulle vordering dop"
                  : "Subscribe for my child and keep track of their progress"}
              </p>
            </div>
            {selected === "parent" && (
              <span
                className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black flex items-center justify-center"
                style={{ border: "1.5px solid #8A2BFF", boxShadow: "0 0 10px rgba(138,43,255,0.6)" }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#8A2BFF" }} />
              </span>
            )}
            <span aria-hidden className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: "#8A2BFF" }} />
            <span aria-hidden className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: "#8A2BFF" }} />
          </button>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected || roleMutation.isPending}
          className="w-full h-14 rounded-2xl bg-black font-black uppercase tracking-[0.14em] text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-white"
          style={{
            color: selected === "parent" ? "#8A2BFF" : "#00E5FF",
            border: `1.75px solid ${selected === "parent" ? "#8A2BFF" : "#00E5FF"}`,
            boxShadow: selected
              ? `0 0 18px ${selected === "parent" ? "rgba(138,43,255,0.5)" : "rgba(0,229,255,0.5)"}, inset 0 0 12px ${selected === "parent" ? "rgba(138,43,255,0.15)" : "rgba(0,229,255,0.15)"}`
              : "0 0 8px rgba(255,255,255,0.05)",
          }}
          data-testid="button-confirm-role"
        >
          {roleMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isAf ? "Besig…" : "Setting up…"}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {isAf
                ? `Bevestig — Ek is 'n ${selected === "learner" ? "Leerder" : selected === "parent" ? "Ouer" : "…"}`
                : `Confirm — I'm a ${selected === "learner" ? "Learner" : selected === "parent" ? "Parent" : "…"}`}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-white leading-relaxed">
          {isAf
            ? "Hierdie sal jou ervaring aanpas. Administrateurs word deur die skool gestel."
            : "This personalises your experience. Admin accounts are set by the school."}
        </p>
      </div>
    </div>
  );
}
