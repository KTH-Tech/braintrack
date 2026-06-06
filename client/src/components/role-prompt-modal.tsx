import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, Users } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useLocation } from "wouter";

const STORAGE_KEY = "btk_role_seen";

export function useRolePromptNav() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  const handleCta = useCallback((e: React.MouseEvent) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "learner") {
      window.location.href = "/subscribe";
      return;
    }
    if (stored === "parent") {
      window.location.href = "/api/login";
      return;
    }
    e.preventDefault();
    setOpen(true);
  }, [navigate]);

  const modal = <RolePromptModal open={open} onClose={() => setOpen(false)} />;

  return { handleCta, modal };
}

export function RolePromptModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { language } = useLanguage();
  const isAf = language === "af";
  const [, navigate] = useLocation();

  const choose = (role: "learner" | "parent") => {
    localStorage.setItem(STORAGE_KEY, role);
    onClose();
    if (role === "parent") {
      window.location.href = "/api/login";
    } else {
      window.location.href = "/subscribe";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" data-testid="modal-role-prompt">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            {isAf ? "Wie is jy?" : "Who are you?"}
          </DialogTitle>
          <p className="text-center text-sm text-white mt-1">
            {isAf
              ? "Kies om voort te gaan — ons stuur jou na die regte plek."
              : "Choose to continue — we'll send you to the right place."}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <button
            onClick={() => choose("learner")}
            data-testid="button-role-learner"
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{isAf ? "Leerder" : "Learner"}</p>
              <p className="text-xs text-white mt-0.5">
                {isAf ? "Ek studeer vir matriek" : "I'm studying for matric"}
              </p>
            </div>
          </button>

          <button
            onClick={() => choose("parent")}
            data-testid="button-role-parent"
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-secondary hover:bg-secondary/5 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-secondary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{isAf ? "Ouer" : "Parent"}</p>
              <p className="text-xs text-white mt-0.5">
                {isAf ? "Ek koop vir my kind" : "I'm signing up for my child"}
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
