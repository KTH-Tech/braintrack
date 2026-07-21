import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/lib/language-context";

export function AdminPreviewBanner() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const qc = useQueryClient();

  const { data } = useQuery<{ active: boolean }>({
    queryKey: ["/api/admin/preview/status"],
    refetchOnWindowFocus: false,
    retry: false,
  });

  const exitMutation = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/admin/preview/exit", {});
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries();
      window.location.href = "/dashboard";
    },
  });

  if (!data?.active) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] bg-black px-4 py-2 flex items-center justify-between gap-3"
      style={{
        borderBottom: "1px solid #FFE29A",
      }}
      data-testid="admin-preview-banner"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Eye
          className="w-4 h-4 shrink-0"
          style={{ color: "#FFE29A" }}
        />
        <span
          className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] truncate"
          style={{ color: "#FFE29A" }}
        >
          {isAf
            ? "Voorskou-modus · Jy sien die leerderervaring"
            : "Preview mode · You're seeing the learner experience"}
        </span>
      </div>
      <button
        onClick={() => exitMutation.mutate()}
        disabled={exitMutation.isPending}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-[10px] font-black uppercase tracking-[0.18em] disabled:opacity-60"
        style={{
          border: "1px solid #FFE29A",
          color: "#FFE29A",
        }}
        data-testid="button-exit-preview"
      >
        <LogOut className="w-3 h-3" />
        {isAf ? "Verlaat" : "Exit Preview"}
      </button>
    </div>
  );
}
