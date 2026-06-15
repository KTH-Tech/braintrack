import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatDateTime } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  LifeBuoy, Send, Loader2, CheckCircle2, Clock, MessageSquare,
  AlertTriangle, BookOpen, TrendingDown, Wrench, Heart, Phone,
  CreditCard, Eye, ChevronDown, XCircle,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  "stuck-on-topic": BookOpen,
  "marks-dropping": TrendingDown,
  "technical-issue": Wrench,
  "need-motivation": Heart,
  "report-problem": AlertTriangle,
  "child-not-studying": Clock,
  "child-struggling": TrendingDown,
  "billing-issue": CreditCard,
  "cant-see-progress": Eye,
  "request-callback": Phone,
};

interface Category {
  key: string;
  label: string;
  labelAf: string;
}

export function GetHelpButton({ isAf, variant = "outline" }: { isAf: boolean; variant?: "outline" | "default" | "ghost" }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"pick" | "write" | "done">("pick");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [message, setMessage] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery<{ categories: Category[] }>({
    queryKey: ["/api/help/categories"],
  });

  const submitMutation = useMutation({
    mutationFn: (body: { category: string; subject?: string; message: string }) =>
      apiRequest("POST", "/api/help/escalate", body),
    onSuccess: () => {
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["/api/help/my-tickets"] });
      toast({ title: isAf ? "Hulpversoek gestuur!" : "Help request sent!" });
    },
    onError: (err: any) => toast({ title: isAf ? "Kon nie stuur nie" : "Failed to send", description: err.message, variant: "destructive" }),
  });

  const resetDialog = () => {
    setStep("pick");
    setSelectedCategory(null);
    setMessage("");
    setSubjectName("");
  };

  const categories = categoriesData?.categories ?? [];
  const needsSubject = selectedCategory?.key === "stuck-on-topic" || selectedCategory?.key === "child-struggling";

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetDialog(); }}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className="gap-2" data-testid="btn-get-help">
          <LifeBuoy className="w-4 h-4" />
          {isAf ? "Kry Hulp" : "Get Help"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-primary" />
            {isAf ? "Hoe kan ons help?" : "How can we help?"}
          </DialogTitle>
          <DialogDescription>
            {isAf ? "Kies 'n kategorie en beskryf jou probleem" : "Pick a category and describe your issue"}
          </DialogDescription>
        </DialogHeader>

        {step === "pick" && (
          <div className="space-y-2 mt-2">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.key] ?? MessageSquare;
              return (
                <button
                  key={cat.key}
                  onClick={() => { setSelectedCategory(cat); setStep("write"); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
                  data-testid={`help-cat-${cat.key}`}
                >
                  <Icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="font-medium text-sm">{isAf ? cat.labelAf : cat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {step === "write" && selectedCategory && (
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-2 text-sm text-white">
              <Badge variant="outline" className="text-xs">{isAf ? selectedCategory.labelAf : selectedCategory.label}</Badge>
              <button onClick={() => setStep("pick")} className="text-xs underline" data-testid="help-back">
                {isAf ? "Verander" : "Change"}
              </button>
            </div>
            {needsSubject && (
              <input
                type="text"
                placeholder={isAf ? "Watter vak? (bv. Wiskunde)" : "Which subject? (e.g. Mathematics)"}
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
                data-testid="help-subject-input"
              />
            )}
            <Textarea
              placeholder={isAf ? "Vertel ons meer..." : "Tell us more..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
              data-testid="help-message-input"
            />
            <Button
              className="w-full gap-2"
              disabled={!message.trim() || submitMutation.isPending}
              onClick={() => submitMutation.mutate({
                category: selectedCategory.key,
                subject: subjectName || undefined,
                message: message.trim(),
              })}
              data-testid="help-submit"
            >
              {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isAf ? "Stuur" : "Send"}
            </Button>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-center font-medium">
              {isAf ? "Ons het jou versoek ontvang! Ons sal so gou moontlik reageer." : "We've received your request! We'll respond as soon as possible."}
            </p>
            <Button variant="outline" onClick={() => { setOpen(false); resetDialog(); }} data-testid="help-close">
              {isAf ? "Sluit" : "Close"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function MyTickets({ isAf }: { isAf: boolean }) {
  const { data } = useQuery<{ tickets: any[] }>({ queryKey: ["/api/help/my-tickets"] });
  const tickets = data?.tickets ?? [];
  if (tickets.length === 0) return null;

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="w-4 h-4 text-primary" />
          {isAf ? "My Hulpversoeke" : "My Help Requests"}
          {tickets.filter(t => t.status === "open").length > 0 && (
            <Badge className="bg-amber-500 text-white text-[10px]">{tickets.filter(t => t.status === "open").length} {isAf ? "oop" : "open"}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tickets.slice(0, 5).map((t) => (
          <div key={t.id} className="flex items-start gap-3 p-2 rounded-lg border text-sm">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant={t.status === "open" ? "default" : "outline"} className="text-[10px]">{t.status}</Badge>
                <span className="text-xs text-white">{t.category}</span>
              </div>
              <p className="text-xs text-white mt-1 truncate">{t.message}</p>
              {t.adminNote && (
                <p className="text-xs text-foreground mt-1">↳ {t.adminNote}</p>
              )}
            </div>
            <span className="text-[10px] text-white shrink-0">
              {formatDate(t.createdAt, isAf ? "af" : "en", {})}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AdminEscalationPanel({ isAf = false }: { isAf?: boolean } = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState<Record<number, string>>({});

  const { data, isLoading } = useQuery<{ tickets: any[]; total: number; open: number }>({
    queryKey: ["/api/admin/escalations", filter === "all" ? undefined : filter],
    queryFn: () => fetch(`/api/admin/escalations${filter !== "all" ? `?status=${filter}` : ""}`).then(r => r.json()),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: number; status?: string; adminNote?: string }) =>
      apiRequest("PATCH", `/api/admin/escalations/${id}`, { status, adminNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/escalations"] });
      toast({ title: "Ticket updated" });
    },
  });

  const tickets = data?.tickets ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <LifeBuoy className="w-5 h-5 text-primary" />
            Help Escalations
            {(data?.open ?? 0) > 0 && (
              <Badge className="bg-red-500 text-white">{data?.open} open</Badge>
            )}
          </CardTitle>
          <div className="flex gap-1">
            {(["open", "all", "resolved"] as const).map(f => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "ghost"}
                className="h-7 text-xs"
                onClick={() => setFilter(f)}
                data-testid={`esc-filter-${f}`}
              >
                {f === "open" ? "Open" : f === "all" ? "All" : "Resolved"}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>
        ) : tickets.length === 0 ? (
          <p className="text-center text-sm text-white py-6">No escalations found</p>
        ) : (
          <div className="space-y-2">
            {tickets.map((t) => {
              const Icon = CATEGORY_ICONS[t.category] ?? MessageSquare;
              const isOpen = expandedId === t.id;
              return (
                <div key={t.id} className={`border rounded-lg overflow-hidden ${t.status === "open" ? "border-amber-500/50" : "border-border"}`}>
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30"
                    onClick={() => setExpandedId(isOpen ? null : t.id)}
                    data-testid={`esc-row-${t.id}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${t.status === "open" ? "text-amber-500" : "text-white"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{t.userName || "Unknown"}</span>
                        <Badge variant="outline" className="text-[10px]">{t.userRole}</Badge>
                        <Badge variant={t.status === "open" ? "default" : "secondary"} className="text-[10px]">{t.status}</Badge>
                      </div>
                      <p className="text-xs text-white truncate">{t.category} · {t.message.slice(0, 60)}{t.message.length > 60 ? "..." : ""}</p>
                    </div>
                    <span className="text-[10px] text-white shrink-0">
                      {formatDateTime(t.createdAt, isAf ? "af" : "en", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                  {isOpen && (
                    <div className="border-t bg-muted/10 p-3 space-y-3">
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Category:</span> {t.category}</p>
                        {t.subject && <p><span className="font-medium">Subject:</span> {t.subject}</p>}
                        <p><span className="font-medium">Message:</span> {t.message}</p>
                      </div>
                      {t.adminNote && (
                        <div className="bg-primary/5 rounded-lg p-2 text-sm">
                          <span className="font-medium">Admin note:</span> {t.adminNote}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Add a note..."
                          value={noteText[t.id] ?? ""}
                          onChange={(e) => setNoteText(prev => ({ ...prev, [t.id]: e.target.value }))}
                          className="flex-1 px-3 py-1.5 text-sm border rounded-lg bg-background"
                          data-testid={`esc-note-${t.id}`}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          disabled={updateMutation.isPending}
                          onClick={() => {
                            updateMutation.mutate({ id: t.id, adminNote: noteText[t.id] || undefined });
                            setNoteText(prev => ({ ...prev, [t.id]: "" }));
                          }}
                          data-testid={`esc-save-note-${t.id}`}
                        >
                          Save Note
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        {t.status === "open" && (
                          <>
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => updateMutation.mutate({ id: t.id, status: "in-progress", adminNote: noteText[t.id] || undefined })}
                              disabled={updateMutation.isPending}
                              data-testid={`esc-progress-${t.id}`}
                            >
                              <Clock className="w-3.5 h-3.5" /> In Progress
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1 border-green-500/40 text-foreground"
                              onClick={() => updateMutation.mutate({ id: t.id, status: "resolved", adminNote: noteText[t.id] || undefined })}
                              disabled={updateMutation.isPending}
                              data-testid={`esc-resolve-${t.id}`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Resolve
                            </Button>
                          </>
                        )}
                        {t.status === "in-progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1 border-green-500/40 text-foreground"
                            onClick={() => updateMutation.mutate({ id: t.id, status: "resolved", adminNote: noteText[t.id] || undefined })}
                            disabled={updateMutation.isPending}
                            data-testid={`esc-resolve-${t.id}`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Resolve
                          </Button>
                        )}
                        {t.status === "resolved" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1"
                            onClick={() => updateMutation.mutate({ id: t.id, status: "open" })}
                            disabled={updateMutation.isPending}
                            data-testid={`esc-reopen-${t.id}`}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reopen
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
