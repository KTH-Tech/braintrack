import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AdminTopNav } from "@/components/admin-top-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Package, CreditCard, Zap, LogOut, CheckCircle, XCircle, ShoppingBag, Settings, Minus, Plus, PlusCircle } from "lucide-react";
import { Link } from "wouter";
import { BrainTrackLogo } from "@/components/braintrack-logo";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";

interface Plan {
  id: number;
  slug: string;
  name_en: string;
  name_af: string;
  monthly_price_rands: number;
  season_price_rands: number;
  tier: number;
  is_active: boolean;
  daily_questions_limit: number;
  daily_full_solutions_limit: number;
  features: string[];
  max_level_en: string;
}

interface Product {
  id: number;
  slug: string;
  name_en: string;
  name_af: string;
  description_en: string;
  description_af?: string;
  price_rands: number;
  category: string;
  is_active: boolean;
}

const tierLabel: Record<number, { en: string; af: string; color: string }> = {
  0: { en: "Free", af: "Gratis", color: "bg-muted text-white" },
  1: { en: "Brain Boost", af: "Brein-aansporing", color: "bg-cyan-500/10 border border-cyan-500/30 text-cyan-700" },
  2: { en: "Pro", af: "Pro", color: "bg-cyan-500/10 border border-cyan-500/30 text-cyan-700" },
  3: { en: "Elite", af: "Elite", color: "bg-amber-500/10 border border-amber-500/30 text-amber-700" },
};

export default function AdminProductsPage() {
  const { logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAf = language === "af";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tr = {
    navCaps: isAf ? "KABV-vraestelle" : "CAPS Papers",
    navAdvanced: isAf ? "Gevorderd" : "Advanced",
    navReports: isAf ? "Verslae" : "Reports",
    navProducts: isAf ? "Produkte" : "Products",
    navClassroom: isAf ? "Klaskamer" : "Classroom",
    signOut: isAf ? "Teken Uit" : "Sign Out",
    plansTab: isAf ? "Intekenpakkette" : "Subscription Plans",
    productsTab: isAf ? "Digitale Produkte" : "Digital Products",
    settingsTab: isAf ? "Platform-instellings" : "Platform Settings",
    loadingPlans: isAf ? "Laai pakkette…" : "Loading plans…",
    noPlans: isAf ? "Geen pakkette gevind nie" : "No plans found",
    noPlansHelp: isAf ? "Pakkette word vanaf die databasis ge-saai. Voer" : "Plans are seeded from the database. Run",
    ifEmpty: isAf ? "as dit leeg is." : "if empty.",
    perMonth: isAf ? "/maand" : "/mo",
    season: isAf ? "seisoen" : "season",
    dailyQ: isAf ? "Daaglikse vrae" : "Daily Questions",
    fullSols: isAf ? "Volledige oplossings" : "Full Solutions",
    unlimited: isAf ? "Onbeperk" : "Unlimited",
    perDay: isAf ? "/dag" : "/day",
    more: isAf ? "meer" : "more",
    active: isAf ? "Aktief" : "Active",
    inactive: isAf ? "Onaktief" : "Inactive",
    loadingProducts: isAf ? "Laai produkte…" : "Loading products…",
    noProducts: isAf ? "Geen digitale produkte gevind nie" : "No digital products found",
    addViaDb: isAf ? "Voeg produkte by via die databasis of API." : "Add products via the database or API.",
    installNudge: isAf ? "Installasie-nudge" : "Install Nudge",
    installNudgeHelp: isAf
      ? "Beheer hoeveel besoeke 'n aangemelde gebruiker moet voltooi voordat die \"Voeg by tuisblad\" -baniek verskyn. Laer waardes wys die baniek vroeër; hoër waardes nudge slegs hoogs betrokke gebruikers."
      : "Controls how many visits a logged-in user must complete before the \"Add to Home Screen\" banner appears. Lower values show the banner sooner; higher values only nudge highly-engaged users.",
    sessionThreshold: isAf ? "Sessie-drempel" : "Session threshold",
    showAfter: isAf ? "Wys baniek na hierdie aantal besoeke (verstek: 2)" : "Show banner after this many visits (default: 2)",
    unsavedPrefix: isAf ? "Nie gestoor — huidige lewende waarde is" : "Unsaved — current live value is",
    cancel: isAf ? "Kanselleer" : "Cancel",
    save: isAf ? "Stoor" : "Save",
    saving: isAf ? "Stoor…" : "Saving…",
    toastPlan: isAf ? "Pakket bygewerk" : "Plan updated",
    toastProduct: isAf ? "Produk bygewerk" : "Product updated",
    toastSetting: isAf ? "Instelling gestoor" : "Setting saved",
    toastFailUpdate: isAf ? "Bywerking misluk" : "Update failed",
    toastFailSave: isAf ? "Stoor het misluk" : "Save failed",
    toggleTitle: isAf ? "Wissel taal" : "Toggle Language",
  };

  const { data: plansData, isLoading: plansLoading } = useQuery<{ plans: Plan[] }>({
    queryKey: ["/api/admin/plans"],
  });

  const { data: productsData, isLoading: productsLoading } = useQuery<{ products: Product[] }>({
    queryKey: ["/api/admin/products"],
  });

  const { data: platformConfig, isLoading: configLoading } = useQuery<{ installNudgeSessionThreshold: number }>({
    queryKey: ["/api/config"],
    staleTime: 0,
  });

  const [nudgeThresholdInput, setNudgeThresholdInput] = useState<number | null>(null);
  const currentThreshold = nudgeThresholdInput ?? platformConfig?.installNudgeSessionThreshold ?? 2;

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const blankForm = { nameEn: "", nameAf: "", slug: "", descriptionEn: "", descriptionAf: "", priceRands: "", category: "", isActive: true };
  const [form, setForm] = useState(blankForm);

  function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function setField(k: keyof typeof blankForm, v: string | boolean) {
    setForm(prev => {
      const next = { ...prev, [k]: v };
      if (k === "nameEn") next.slug = slugify(v as string);
      return next;
    });
  }

  const togglePlanMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest("PATCH", `/api/admin/plans/${id}`, { isActive }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: tr.toastPlan });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
    },
    onError: (e: any) => toast({ title: tr.toastFailUpdate, description: e.message, variant: "destructive" }),
  });

  const toggleProductMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest("PATCH", `/api/admin/products/${id}`, { isActive }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: tr.toastProduct });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
    },
    onError: (e: any) => toast({ title: tr.toastFailUpdate, description: e.message, variant: "destructive" }),
  });

  const createProductMutation = useMutation({
    mutationFn: (body: typeof blankForm) =>
      apiRequest("POST", "/api/admin/products", {
        nameEn: body.nameEn,
        nameAf: body.nameAf,
        slug: body.slug,
        descriptionEn: body.descriptionEn,
        descriptionAf: body.descriptionAf,
        priceRands: parseInt(body.priceRands) || 0,
        category: body.category,
        isActive: body.isActive,
      }).then(r => r.json()),
    onSuccess: (data: any) => {
      if (data.error) { toast({ title: data.error, variant: "destructive" }); return; }
      toast({ title: isAf ? "Produk geskep!" : "Product created!" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setShowCreateDialog(false);
      setForm(blankForm);
    },
    onError: (e: any) => toast({ title: e.message, variant: "destructive" }),
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      apiRequest("PATCH", "/api/admin/config", { key, value }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: tr.toastSetting });
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      setNudgeThresholdInput(null);
    },
    onError: (e: any) => toast({ title: tr.toastFailSave, description: e.message, variant: "destructive" }),
  });

  const plans = plansData?.plans ?? [];
  const products = productsData?.products ?? [];
  const categories = Array.from(new Set(products.map(p => p.category))).sort();

  return (
    <div className="min-h-screen">
      <AdminTopNav current="products" />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Tabs defaultValue="plans">
          <TabsList className="mb-6 p-1.5 rounded-2xl h-auto flex-wrap bg-black border border-[#28c9d6]/30 shadow-[0_0_14px_rgba(40,201,214,0.18)]">
            <TabsTrigger value="plans" className="rounded-xl gap-2 text-xs px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-[#28c9d6] data-[state=active]:border data-[state=active]:border-[#28c9d6] data-[state=active]:shadow-[0_0_14px_rgba(40,201,214,0.45)] data-[state=active]:font-black text-white hover:text-white transition-colors"><CreditCard className="w-3.5 h-3.5" />{tr.plansTab} ({plans.length})</TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl gap-2 text-xs px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-[#28c9d6] data-[state=active]:border data-[state=active]:border-[#28c9d6] data-[state=active]:shadow-[0_0_14px_rgba(40,201,214,0.45)] data-[state=active]:font-black text-white hover:text-white transition-colors"><ShoppingBag className="w-3.5 h-3.5" />{tr.productsTab} ({products.length})</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl gap-2 text-xs px-4 py-2 data-[state=active]:bg-black data-[state=active]:text-[#28c9d6] data-[state=active]:border data-[state=active]:border-[#28c9d6] data-[state=active]:shadow-[0_0_14px_rgba(40,201,214,0.45)] data-[state=active]:font-black text-white hover:text-white transition-colors"><Settings className="w-3.5 h-3.5" />{tr.settingsTab}</TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plansLoading ? (
                <p className="text-sm text-white col-span-3">{tr.loadingPlans}</p>
              ) : plans.length === 0 ? (
                <div className="col-span-3 text-center py-16 text-white">
                  <CreditCard className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">{tr.noPlans}</p>
                  <p className="text-xs mt-1">{tr.noPlansHelp} <code className="bg-muted px-1 rounded text-xs">npm run db:seed</code> {tr.ifEmpty}</p>
                </div>
              ) : plans.map(plan => {
                const tierEntry = tierLabel[plan.tier] ?? { en: `Tier ${plan.tier}`, af: `Vlak ${plan.tier}`, color: "bg-muted text-white" };
                const tier = { label: isAf ? tierEntry.af : tierEntry.en, color: tierEntry.color };
                const featureList: string[] = Array.isArray(plan.features) ? plan.features as string[] : [];
                return (
                  <Card key={plan.id} className={`rounded-2xl border-border/50 transition-opacity ${!plan.is_active ? "opacity-60" : ""}`}>
                    <div className={`h-1 rounded-t-2xl ${plan.is_active ? "bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-500" : "bg-muted"}`} />
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base font-semibold">{isAf ? plan.name_af : plan.name_en}</CardTitle>
                          <Badge className={`text-[10px] mt-1 ${tier.color}`}>{tier.label}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">R{plan.monthly_price_rands}<span className="text-xs font-normal text-white">{tr.perMonth}</span></div>
                          {plan.season_price_rands > 0 && <div className="text-[10px] text-white">R{plan.season_price_rands} {tr.season}</div>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <div className="text-white">{tr.dailyQ}</div>
                          <div className="font-semibold text-white">{plan.daily_questions_limit === -1 ? tr.unlimited : plan.daily_questions_limit}</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <div className="text-white">{tr.fullSols}</div>
                          <div className="font-semibold text-white">{plan.daily_full_solutions_limit === -1 ? tr.unlimited : `${plan.daily_full_solutions_limit}${tr.perDay}`}</div>
                        </div>
                      </div>
                      {featureList.length > 0 && (
                        <ul className="space-y-1">
                          {featureList.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px] text-white">
                              <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                              {typeof f === "string" ? f : JSON.stringify(f)}
                            </li>
                          ))}
                          {featureList.length > 4 && <li className="text-[10px] text-white ml-4.5">+{featureList.length - 4} {tr.more}</li>}
                        </ul>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          {plan.is_active
                            ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /><span className="text-xs text-emerald-600 font-medium">{tr.active}</span></>
                            : <><XCircle className="w-3.5 h-3.5 text-white" /><span className="text-xs text-white">{tr.inactive}</span></>
                          }
                        </div>
                        <Switch
                          checked={plan.is_active}
                          onCheckedChange={(checked) => togglePlanMutation.mutate({ id: plan.id, isActive: checked })}
                          disabled={togglePlanMutation.isPending}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-white/60">{products.length} {isAf ? "produkte" : "products"}</p>
              <button
                onClick={() => { setForm(blankForm); setShowCreateDialog(true); }}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition-transform hover:scale-[1.02]"
                style={{ background: "linear-gradient(90deg,#28c9d6,#4f8cd9)", color: "#000", boxShadow: "0 0 18px rgba(40,201,214,0.5)" }}
                data-testid="button-add-product"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {isAf ? "Voeg produk by" : "Add Product"}
              </button>
            </div>
            {productsLoading ? (
              <p className="text-sm text-white">{tr.loadingProducts}</p>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-white">
                <Package className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">{tr.noProducts}</p>
                <button
                  onClick={() => { setForm(blankForm); setShowCreateDialog(true); }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.12em]"
                  style={{ background: "linear-gradient(90deg,#28c9d6,#4f8cd9)", color: "#000", boxShadow: "0 0 18px rgba(40,201,214,0.5)" }}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {isAf ? "Skep eerste produk" : "Create first product"}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {categories.map(cat => (
                  <div key={cat}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" />{cat}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {products.filter(p => p.category === cat).map(product => (
                        <Card key={product.id} className={`rounded-xl border-border/50 transition-opacity ${!product.is_active ? "opacity-60" : ""}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{isAf ? product.name_af : product.name_en}</p>
                                <p className="text-[11px] text-white mt-0.5 line-clamp-2">{(isAf && product.description_af) ? product.description_af : product.description_en}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-base font-bold text-white">R{product.price_rands}</div>
                                <Badge variant="outline" className="text-[9px] mt-1">{product.slug}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                              <div className="flex items-center gap-1.5">
                                {product.is_active
                                  ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /><span className="text-xs text-emerald-600 font-medium">{tr.active}</span></>
                                  : <><XCircle className="w-3.5 h-3.5 text-white" /><span className="text-xs text-white">{tr.inactive}</span></>
                                }
                              </div>
                              <Switch
                                checked={product.is_active}
                                onCheckedChange={(checked) => toggleProductMutation.mutate({ id: product.id, isActive: checked })}
                                disabled={toggleProductMutation.isPending}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-sm font-semibold mb-1">{tr.installNudge}</h2>
                <p className="text-xs text-white mb-4">
                  {tr.installNudgeHelp}
                </p>
                <Card className="rounded-2xl border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">{tr.sessionThreshold}</p>
                        <p className="text-[11px] text-white mt-0.5">
                          {tr.showAfter}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          aria-label="Decrease threshold"
                          onClick={() => setNudgeThresholdInput(Math.max(1, currentThreshold - 1))}
                          disabled={currentThreshold <= 1 || configLoading}
                          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-white hover:text-white hover:border-border/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-base font-bold tabular-nums">
                          {configLoading ? "…" : currentThreshold}
                        </span>
                        <button
                          aria-label="Increase threshold"
                          onClick={() => setNudgeThresholdInput(Math.min(100, currentThreshold + 1))}
                          disabled={currentThreshold >= 100 || configLoading}
                          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-white hover:text-white hover:border-border/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {nudgeThresholdInput !== null && nudgeThresholdInput !== platformConfig?.installNudgeSessionThreshold && (
                      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between gap-3">
                        <p className="text-[11px] text-amber-600 font-medium">
                          {tr.unsavedPrefix} {platformConfig?.installNudgeSessionThreshold ?? 2}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs !rounded-lg"
                            onClick={() => setNudgeThresholdInput(null)}
                          >
                            {tr.cancel}
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 text-xs !rounded-lg"
                            disabled={updateConfigMutation.isPending}
                            onClick={() =>
                              updateConfigMutation.mutate({
                                key: "install_nudge_session_threshold",
                                value: nudgeThresholdInput,
                              })
                            }
                          >
                            {updateConfigMutation.isPending ? tr.saving : tr.save}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ── Create Product Dialog ─────────────────────────────── */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg rounded-2xl bg-black border border-[#28c9d6]/40 shadow-[0_0_40px_rgba(40,201,214,0.25)] p-0 overflow-hidden">
          <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg,#28c9d6,#4f8cd9,#8e7cdc,#e6519c)" }} />
          <div className="p-6">
            <DialogHeader className="mb-5">
              <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5" style={{ color: "#28c9d6" }} />
                {isAf ? "Nuwe Produk" : "New Product"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-white/70">Name (EN)</Label>
                  <Input
                    value={form.nameEn}
                    onChange={e => setField("nameEn", e.target.value)}
                    placeholder="e.g. Brain Boost Pack"
                    className="rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus-visible:ring-[#28c9d6]/50 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-white/70">Name (AF)</Label>
                  <Input
                    value={form.nameAf}
                    onChange={e => setField("nameAf", e.target.value)}
                    placeholder="e.g. Brein-aansporing-pak"
                    className="rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus-visible:ring-[#28c9d6]/50 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Slug + Category + Price */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5 col-span-1">
                  <Label className="text-xs font-bold uppercase tracking-widest text-white/70">Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={e => setField("slug", slugify(e.target.value))}
                    placeholder="brain-boost-pack"
                    className="rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus-visible:ring-[#28c9d6]/50 h-9 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-white/70">Category</Label>
                  <Input
                    value={form.category}
                    onChange={e => setField("category", e.target.value)}
                    placeholder={categories[0] || "power-up"}
                    list="category-list"
                    className="rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus-visible:ring-[#28c9d6]/50 h-9 text-sm"
                  />
                  <datalist id="category-list">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-white/70">Price (R)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.priceRands}
                    onChange={e => setField("priceRands", e.target.value)}
                    placeholder="49"
                    className="rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus-visible:ring-[#28c9d6]/50 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Description EN */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-white/70">Description (EN)</Label>
                <Textarea
                  value={form.descriptionEn}
                  onChange={e => setField("descriptionEn", e.target.value)}
                  placeholder="Short English description…"
                  rows={2}
                  className="rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus-visible:ring-[#28c9d6]/50 text-sm resize-none"
                />
              </div>

              {/* Description AF */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-widest text-white/70">Description (AF)</Label>
                <Textarea
                  value={form.descriptionAf}
                  onChange={e => setField("descriptionAf", e.target.value)}
                  placeholder="Kort Afrikaanse beskrywing…"
                  rows={2}
                  className="rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/30 focus-visible:ring-[#28c9d6]/50 text-sm resize-none"
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={v => setField("isActive", v)}
                  id="new-product-active"
                />
                <Label htmlFor="new-product-active" className="text-sm text-white cursor-pointer">
                  {isAf ? "Aktief (sigbaar in die winkel)" : "Active (visible in the store)"}
                </Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-white/70 hover:text-white"
                onClick={() => setShowCreateDialog(false)}
                disabled={createProductMutation.isPending}
              >
                {tr.cancel}
              </Button>
              <button
                onClick={() => createProductMutation.mutate(form)}
                disabled={createProductMutation.isPending || !form.nameEn || !form.nameAf || !form.slug || !form.descriptionEn || !form.descriptionAf || !form.category || !form.priceRands}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-black uppercase tracking-[0.12em] disabled:opacity-40 disabled:cursor-not-allowed transition-transform hover:scale-[1.02]"
                style={{ background: "linear-gradient(90deg,#28c9d6,#4f8cd9)", color: "#000", boxShadow: "0 0 18px rgba(40,201,214,0.45)" }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {createProductMutation.isPending ? (isAf ? "Skep…" : "Creating…") : (isAf ? "Skep Produk" : "Create Product")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
