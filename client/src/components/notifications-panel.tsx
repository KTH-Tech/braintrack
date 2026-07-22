import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Trophy, Flame, Target, Zap, CheckCheck, AlertCircle, FileText, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isSafeInternalPath } from "@/lib/safe-path";

const TYPE_ICONS: Record<string, any> = {
  badge_earned: Trophy,
  milestone_reached: Star,
  streak_alert: Flame,
  parent_report_ready: FileText,
  inactivity_alert: AlertCircle,
  rate_prompt: Star,
  default: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  badge_earned: "text-yellow-500",
  milestone_reached: "text-cyan-500",
  streak_alert: "text-orange-500",
  parent_report_ready: "text-cyan-500",
  inactivity_alert: "text-red-500",
  rate_prompt: "text-yellow-400",
  default: "text-white",
};

interface Notification {
  id: number;
  type: string;
  title_en: string;
  title_af: string;
  message_en: string;
  message_af: string;
  status: string;
  created_at: string;
  data?: any;
}

interface NotificationsPanelProps {
  isAf?: boolean;
}

export function NotificationsPanel({ isAf = false }: NotificationsPanelProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/user/notifications/inapp"],
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const markReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/user/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/user/notifications/inapp"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/user/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/user/notifications/inapp"] }),
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return isAf ? "Nou net" : "Just now";
    if (mins < 60) return isAf ? `${mins}m gelede` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return isAf ? `${hrs}u gelede` : `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return isAf ? `${days}d gelede` : `${days}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-11 h-11 rounded-lg border border-border text-white hover:text-foreground hover:bg-muted/50 transition-all"
        aria-label={isAf ? "Kennisgewings" : "Notifications"}
        data-testid="button-notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-background/95 shadow-2xl z-[200] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">
                {isAf ? "Kennisgewings" : "Notifications"}
              </h3>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-[10px] font-semibold text-white hover:text-foreground flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" />
                    {isAf ? "Almal gelees" : "Mark all read"}
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-white hover:text-foreground p-1 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="w-8 h-8 text-white mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-white">
                    {isAf ? "Geen kennisgewings nie" : "No notifications yet"}
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = TYPE_ICONS[notif.type] || TYPE_ICONS.default;
                  const iconColor = TYPE_COLORS[notif.type] || TYPE_COLORS.default;
                  const isUnread = notif.status === "unread";
                  return (
                    <button
                      key={notif.id}
                      onClick={() => {
                        if (isUnread) markReadMutation.mutate(notif.id);
                        const cta = notif.data?.ctaUrl as string | undefined;
                        if (cta) {
                          if (/^https?:\/\//i.test(cta)) {
                            window.open(cta, "_blank", "noopener,noreferrer");
                          } else if (isSafeInternalPath(cta)) {
                            window.location.href = cta;
                          }
                        }
                      }}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors ${isUnread ? "bg-primary/5" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isUnread ? "bg-primary/10" : "bg-muted/50"}`}>
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-tight ${isUnread ? "text-foreground" : "text-white"}`}>
                          {isAf ? notif.title_af : notif.title_en}
                        </p>
                        <p className="text-[10px] text-white mt-0.5 leading-snug line-clamp-2">
                          {isAf ? notif.message_af : notif.message_en}
                        </p>
                        <p className="text-[9px] text-white mt-1">
                          {formatTime(notif.created_at)}
                        </p>
                      </div>
                      {isUnread && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
