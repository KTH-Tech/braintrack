import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Viewport coords for the portalled dropdown. The panel used to be
  // `position:absolute` inside the header, which meant any ancestor with
  // `overflow:hidden` clipped it out of existence — `.bt-dash-main` on the
  // learner dashboard does exactly that to contain the graffiti splats, so
  // the bell appeared to do nothing. z-index cannot beat overflow clipping;
  // the fix is to render outside the clipping ancestor entirely.
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);
  const queryClient = useQueryClient();

  const positionPanel = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setAnchor({
      top: r.bottom + 8,
      // Distance from the viewport's right edge, so the panel stays
      // right-aligned to the bell exactly as it did when absolute.
      right: Math.max(8, window.innerWidth - r.right),
    });
  }, []);

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

  // Close on outside click. The panel now lives in a portal, so a click
  // inside it is NOT inside panelRef — check both the trigger wrapper and
  // the portalled panel before closing, or the dropdown would slam shut on
  // its own buttons ("mark all read" etc.).
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (dropdownRef.current?.contains(t)) return;
      setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Keep the portalled panel pinned to the bell while it's open, and let
  // Escape dismiss it.
  useEffect(() => {
    if (!open) return;
    positionPanel();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", positionPanel);
      window.removeEventListener("scroll", positionPanel, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, positionPanel]);

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
        ref={buttonRef}
        onClick={() => { positionPanel(); setOpen((v) => !v); }}
        className="relative flex items-center justify-center w-11 h-11 rounded-lg border border-border text-white hover:text-foreground hover:bg-muted/50 transition-all"
        aria-label={isAf ? "Kennisgewings" : "Notifications"}
        aria-expanded={open}
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

      {createPortal(
      <AnimatePresence>
        {open && anchor && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            data-testid="notifications-dropdown"
            style={{
              position: "fixed",
              top: anchor.top,
              right: anchor.right,
              // Never wider than the viewport on a 375px phone.
              width: "min(20rem, calc(100vw - 16px))",
              // Keep the list inside the screen no matter where the bell sits.
              maxHeight: `calc(100vh - ${anchor.top + 16}px)`,
            }}
            className="rounded-2xl border border-border bg-background shadow-2xl z-[200] overflow-hidden flex flex-col"
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

            {/* flex-1 + min-h-0 lets the list shrink inside the panel's
                viewport-aware maxHeight instead of overflowing it on short
                screens; max-h-80 still caps it on tall ones. */}
            <div className="max-h-80 flex-1 min-h-0 overflow-y-auto">
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
      </AnimatePresence>,
      document.body,
      )}
    </div>
  );
}
