import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { useLocation, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type MysteryReward = { type: "coins" | "theme"; amount?: number; themeKey?: string; label: string; labelAf: string };
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Coins, Lock, Loader2, Check, ShoppingBag, Palette, Sparkles, Star,
  Home, LogOut, Globe, Crown, Shield, Zap, Trophy, Frame, User, Gem,
  Rocket, Brain, GraduationCap, Heart,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useTheme, type ThemeMode } from "@/hooks/use-theme";

interface StoreItem {
  key: string;
  name: string;
  nameAf: string;
  description: string;
  descriptionAf: string;
  type: string;                       // theme | power_up | cosmetic | avatar_item | badge_frame | title
  coinCost: number;
  subscriptionTier: string | null;
  themeKey: ThemeMode | null;
  tier: "free" | "unlockable" | "premium";
  palette: string[] | null;
}

type TabKey = "all" | "power_up" | "theme" | "cosmetic" | "title";

const TAB_DEF: { key: TabKey; en: string; af: string; icon: any; types: string[] }[] = [
  { key: "all",       en: "All",        af: "Alles",         icon: ShoppingBag,    types: ["theme", "power_up", "cosmetic", "avatar_item", "badge_frame", "title"] },
  { key: "power_up",  en: "Power-Ups",  af: "Hupstote",      icon: Rocket,         types: ["power_up"] },
  { key: "theme",     en: "Themes",     af: "Temas",         icon: Palette,        types: ["theme"] },
  { key: "cosmetic",  en: "Cosmetics",  af: "Kosmetika",     icon: Gem,            types: ["cosmetic", "avatar_item", "badge_frame"] },
  { key: "title",     en: "Titles",     af: "Titels",        icon: Crown,          types: ["title"] },
];

const ITEM_ICONS: Record<string, any> = {
  theme:        Palette,
  badge_frame:  Frame,
  avatar_item:  User,
  cosmetic:     Sparkles,
  power_up:     Rocket,
  title:        Crown,
};

// Type-specific icon overrides for known product keys.
const KEY_ICONS: Record<string, any> = {
  "streak-freeze":     Shield,
  "rizz-boost":        Brain,
  "double-coins":      Rocket,
  "mystery-box":       Sparkles,
  "title-scholar":     GraduationCap,
  "title-rising-star": Star,
  "title-matric-hero": Trophy,
  "avatar-frame-gold": Heart,
  "avatar-hat-wizard": User,
  "avatar-halo-star":  Star,
};

const PRODUCT_GRADIENTS: Record<string, string> = {
  "streak-freeze":          "from-cyan-400 to-blue-600",
  "rizz-boost":             "from-blue-400 to-indigo-600",
  "double-coins":           "from-amber-400 to-orange-600",
  "mystery-box":            "from-fuchsia-400 to-purple-600",
  "title-scholar":          "from-amber-400 to-yellow-600",
  "title-rising-star":      "from-yellow-300 to-amber-500",
  "title-matric-hero":      "from-orange-400 to-red-600",
  "avatar-frame-gold":      "from-yellow-400 to-amber-500",
  "avatar-hat-wizard":      "from-cyan-500 to-blue-700",
  "avatar-halo-star":       "from-yellow-300 to-amber-500",
  "cosmetic-sparkle-trail": "from-pink-400 to-cyan-500",
  "badge-frame-gold":       "from-yellow-400 to-amber-500",
  "badge-frame-neon":       "from-cyan-400 to-cyan-500",
  "badge-frame-fire":       "from-orange-400 to-red-600",
};

const TIER_LABEL: Record<string, { en: string; af: string }> = {
  free:       { en: "Free",       af: "Gratis"     },
  unlockable: { en: "Unlockable", af: "Ontsluitbaar" },
  premium:    { en: "Premium",    af: "Premium"    },
};

const OWNED_EFFECT: Record<string, { en: string; af: string }> = {
  "streak-freeze":     { en: "Shield ready",        af: "Skild gereed"            },
  "rizz-boost":        { en: "Boost active",        af: "Hupstoot aktief"         },
  "double-coins":      { en: "2x active",           af: "2x aktief"               },
  "mystery-box":       { en: "Box opened",          af: "Kas oopgemaak"           },
  "title-scholar":     { en: "Title equipped",      af: "Titel toegerus"          },
  "title-rising-star": { en: "Title equipped",      af: "Titel toegerus"          },
  "title-matric-hero": { en: "Title equipped",      af: "Titel toegerus"          },
};

// Fallback owned-effect labels by item type so every owned card shows
// a clear "what you get" line, not just keys present in OWNED_EFFECT.
const TYPE_OWNED_EFFECT: Record<string, { en: string; af: string }> = {
  theme:        { en: "Theme available",    af: "Tema beskikbaar"     },
  power_up:     { en: "Power-up ready",     af: "Hupstoot gereed"     },
  cosmetic:     { en: "Cosmetic unlocked",  af: "Kosmetika ontsluit"  },
  avatar_item:  { en: "Avatar unlocked",    af: "Avatar ontsluit"     },
  badge_frame:  { en: "Frame equipped",     af: "Raam toegerus"       },
  title:        { en: "Title equipped",     af: "Titel toegerus"      },
};

const T = {
  en: {
    pageTitle: "Learner Store",
    heroTitle: "Your Learner Store",
    heroSubtitle: "One place for it all — themes, power-ups, cosmetics, and titles.",
    homeTitle: "Home",
    signOutTitle: "Sign Out",
    purchaseConfirmed: "Purchase confirmed!",
    itemUnlocked: "Item unlocked.",
    notEnoughCoins: "Not enough coins",
    couldNotUnlock: "Could not unlock",
    tryAgain: "Please try again.",
    themeApplied: "Theme applied!",
    earnCoins: "Earn coins by answering questions, building streaks, and completing challenges.",
    viewRewards: "View your rewards →",
    confirmPurchase: "Confirm purchase",
    cancel: "Cancel",
    confirm: "Confirm",
    noItemsInCategory: "No items in this category.",
    activeLabel: "Active",
    applyLabel: "Apply",
    ownedLabel: "Owned",
    subscribeLabel: "Subscribe",
    tooFewLabel: "Too few",
    unlockLabel: "Unlock",
    premiumLabel: "Premium",
    freeLabel: "Free",
  },
  af: {
    pageTitle: "Leerderwinkel",
    heroTitle: "Jou Leerderwinkel",
    heroSubtitle: "Een plek vir alles — temas, hupstote, kosmetika en titels.",
    homeTitle: "Tuis",
    signOutTitle: "Uitteken",
    purchaseConfirmed: "Aankoop bevestig!",
    itemUnlocked: "Item ontsluit.",
    notEnoughCoins: "Nie genoeg munte nie",
    couldNotUnlock: "Kon nie ontsluit nie",
    tryAgain: "Probeer asseblief weer.",
    themeApplied: "Tema toegepas!",
    earnCoins: "Verdien munte deur vrae te beantwoord, reekse te bou en uitdagings te voltooi.",
    viewRewards: "Sien jou belonings →",
    confirmPurchase: "Bevestig aankoop",
    cancel: "Kanselleer",
    confirm: "Bevestig",
    noItemsInCategory: "Geen items in hierdie kategorie nie.",
    activeLabel: "Aktief",
    applyLabel: "Pas toe",
    ownedLabel: "Eie",
    subscribeLabel: "Inskryf",
    tooFewLabel: "Te min",
    unlockLabel: "Ontsluit",
    premiumLabel: "Premium",
    freeLabel: "Gratis",
  },
} as const;

export default function StorePage() {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [, navigate] = useLocation();
  const isAf = language === "af";
  const t = T[language];
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme: activeTheme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<StoreItem | null>(null);
  const [ownership, setOwnership] = useState<"any" | "owned" | "locked">("any");
  const [sortBy, setSortBy] = useState<"recommended" | "price-asc" | "price-desc">("recommended");

  if (user?.role === "parent") {
    navigate("/parent");
    return null;
  }

  const [mysteryReward, setMysteryReward] = useState<MysteryReward | null>(null);

  const { data: storeData, isLoading } = useQuery<{
    items: StoreItem[];
    userUnlocks: string[];
    coinBalance: number;
    subscriptionTier: string | null;
    activePowerUps: Record<string, { active: boolean; expiresAt?: string }>;
  }>({ queryKey: ["/api/store/items"] });

  const unlockMutation = useMutation({
    mutationFn: async ({ itemKey, method }: { itemKey: string; method: string }) =>
      apiRequest("POST", "/api/store/unlock", { itemKey, method }),
    onSuccess: (data: any, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/coins"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/themes"] });
      setUnlocking(null);
      setConfirmItem(null);
      if (vars.itemKey === "mystery-box" && data?.reward) {
        setMysteryReward(data.reward as MysteryReward);
        return;
      }
      const item = storeData?.items.find((i) => i.key === vars.itemKey);
      toast({
        title: t.purchaseConfirmed,
        description: item
          ? (isAf ? `${item.nameAf} is in jou versameling.` : `${item.name} is in your collection.`)
          : t.itemUnlocked,
      });
    },
    onError: (err: any) => {
      const msg = err?.message || "";
      const isInsufficient = /insufficient|too few|nie genoeg|munte/i.test(msg);
      toast({
        title: isInsufficient ? t.notEnoughCoins : t.couldNotUnlock,
        description: msg || t.tryAgain,
        variant: "destructive",
      });
      setUnlocking(null);
      setConfirmItem(null);
    },
  });

  const items = storeData?.items ?? [];
  const userUnlocks = useMemo(() => new Set(storeData?.userUnlocks ?? []), [storeData?.userUnlocks]);
  const balance = storeData?.coinBalance ?? 0;
  const subTier = storeData?.subscriptionTier;
  const activePowerUps = storeData?.activePowerUps ?? {};

  // Double-coins: compute hours remaining for display
  const doubleCoinsExpiresAt = activePowerUps["double-coins"]?.expiresAt;
  const doubleCoinsHoursLeft = doubleCoinsExpiresAt
    ? Math.max(0, Math.ceil((new Date(doubleCoinsExpiresAt).getTime() - Date.now()) / 3_600_000))
    : 0;

  const tabCounts = useMemo(() => {
    const c: Record<TabKey, number> = { all: 0, power_up: 0, theme: 0, cosmetic: 0, title: 0 };
    for (const def of TAB_DEF) {
      c[def.key] = items.filter((i) => def.types.includes(i.type)).length;
    }
    return c;
  }, [items]);

  const visibleItems = useMemo(() => {
    const def = TAB_DEF.find((t) => t.key === activeTab)!;
    return items.filter((i) => def.types.includes(i.type));
  }, [items, activeTab]);

  const isOwned = (item: StoreItem) =>
    userUnlocks.has(item.key) || (item.themeKey ? userUnlocks.has(item.themeKey) : false);
  const isActiveTheme = (item: StoreItem) => item.type === "theme" && item.themeKey === activeTheme;
  const canAfford = (item: StoreItem) => balance >= item.coinCost;
  const requiresSubscription = (item: StoreItem) => item.tier === "premium" && !subTier;

  const applyOwnershipAndSort = (list: StoreItem[]): StoreItem[] => {
    let filtered = list;
    if (ownership === "owned") filtered = filtered.filter(isOwned);
    else if (ownership === "locked") filtered = filtered.filter((i) => !isOwned(i));
    if (sortBy === "price-asc") filtered = [...filtered].sort((a, b) => a.coinCost - b.coinCost);
    else if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => b.coinCost - a.coinCost);
    return filtered;
  };

  const requestUnlock = (item: StoreItem) => {
    if (item.key !== "mystery-box" && isOwned(item)) return;
    if (!canAfford(item)) {
      toast({
        title: t.notEnoughCoins,
        description: isAf
          ? `Jy het ${balance} munte. Hierdie kos ${item.coinCost}.`
          : `You have ${balance} coins. This costs ${item.coinCost}.`,
        variant: "destructive",
      });
      return;
    }
    setConfirmItem(item);
  };

  const confirmUnlock = () => {
    if (!confirmItem) return;
    setUnlocking(confirmItem.key);
    unlockMutation.mutate({ itemKey: confirmItem.key, method: "coins" });
  };

  const applyTheme = (item: StoreItem) => {
    if (!item.themeKey) return;
    setTheme(item.themeKey);
    toast({
      title: t.themeApplied,
      description: isAf ? item.nameAf : item.name,
    });
  };

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 ">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00E5FF] via-[#006BFF] to-[#8A2BFF] flex items-center justify-center shadow-lg shadow-[#00E5FF]/30">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white">
              {t.pageTitle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFE600]/10 border border-[#FFE600]/40 text-xs font-bold text-[#FFE600]"
              data-testid="coin-balance-header"
            >
              <Coins className="w-3.5 h-3.5" />
              {balance}
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white transition-colors text-xs font-semibold border border-white/10 hover:bg-white/5"
              data-testid="button-language-toggle"
            >
              <Globe className="h-3.5 w-3.5" />
              {language === "en" ? "EN" : "AF"}
            </button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/dashboard")} title={t.homeTitle} data-testid="button-home">
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => logout()} title={t.signOutTitle} data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <PageHeader
          icon={ShoppingBag}
          title={t.heroTitle}
          subtitle={t.heroSubtitle}
        />

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {TAB_DEF.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isActive
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "border-white/10 text-white hover:border-white/20 hover:bg-white/5"
                }`}
                data-testid={`tab-${t.key}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {isAf ? t.af : t.en}
                <span className="ml-1 text-[10px] opacity-70 tabular-nums">{tabCounts[t.key]}</span>
              </button>
            );
          })}
        </div>

        {/* Filter & Sort controls */}
        {!isLoading && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <div className="flex items-center gap-1 border border-white/10 rounded-xl p-1" data-testid="filter-ownership">
              {[
                { v: "any" as const,    en: "All",    af: "Alle"     },
                { v: "owned" as const,  en: "Owned",  af: "Besit"    },
                { v: "locked" as const, en: "Locked", af: "Gesluit"  },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => setOwnership(o.v)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    ownership === o.v
                      ? "bg-primary/20 text-primary"
                      : "text-white hover:bg-white/5"
                  }`}
                  data-testid={`filter-ownership-${o.v}`}
                >
                  {isAf ? o.af : o.en}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 border border-white/10 rounded-xl p-1" data-testid="sort-price">
              {[
                { v: "recommended" as const, en: "Recommended", af: "Aanbeveel" },
                { v: "price-asc" as const,   en: "Price ↑",     af: "Prys ↑"  },
                { v: "price-desc" as const,  en: "Price ↓",     af: "Prys ↓"  },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => setSortBy(o.v)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    sortBy === o.v
                      ? "bg-primary/20 text-primary"
                      : "text-white hover:bg-white/5"
                  }`}
                  data-testid={`sort-${o.v}`}
                >
                  {isAf ? o.af : o.en}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden animate-pulse">
                <div className="h-28 bg-white/5" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-2/3 rounded bg-white/10" />
                  <div className="h-2 w-full rounded bg-white/5" />
                  <div className="h-7 rounded bg-white/5 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "theme" ? (
          <ThemeGroups
            items={applyOwnershipAndSort(visibleItems)}
            isAf={isAf}
            t={t}
            isOwned={isOwned}
            isActiveTheme={isActiveTheme}
            canAfford={canAfford}
            requiresSubscription={requiresSubscription}
            onApply={applyTheme}
            onUnlock={requestUnlock}
            onSubscribe={() => navigate("/subscribe")}
            unlockingKey={unlocking}
          />
        ) : applyOwnershipAndSort(visibleItems).length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {applyOwnershipAndSort(visibleItems).map((item) => {
              const ownedEffectOverride =
                item.key === "double-coins" && isOwned(item) && doubleCoinsHoursLeft > 0
                  ? { en: `2x active — ${doubleCoinsHoursLeft}h left`, af: `2x aktief — ${doubleCoinsHoursLeft}u oor` }
                  : undefined;
              return (
                <ItemCard
                  key={item.key}
                  item={item}
                  isAf={isAf}
                  t={t}
                  owned={isOwned(item)}
                  isActive={isActiveTheme(item)}
                  affordable={canAfford(item)}
                  requiresSub={requiresSubscription(item)}
                  isUnlocking={unlocking === item.key}
                  onApply={applyTheme}
                  onUnlock={requestUnlock}
                  onSubscribe={() => navigate("/subscribe")}
                  ownedEffectOverride={ownedEffectOverride}
                />
              );
            })}
          </div>
        )}

        <div className="text-center pt-4 pb-2">
          <p className="text-xs text-white">
            {t.earnCoins}
          </p>
          <Link href="/rewards">
            <button className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 underline underline-offset-2 transition-colors" data-testid="link-to-rewards">
              {t.viewRewards}
            </button>
          </Link>
        </div>
      </main>

      <AlertDialog open={!!confirmItem} onOpenChange={(o) => !o && setConfirmItem(null)}>
        <AlertDialogContent data-testid="confirm-purchase-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.confirmPurchase}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmItem && (isAf
                ? `Spandeer ${confirmItem.coinCost} munte om "${confirmItem.nameAf}" te ontsluit? Jou saldo na die aankoop: ${Math.max(0, balance - confirmItem.coinCost)} munte.`
                : `Spend ${confirmItem.coinCost} coins to unlock "${confirmItem.name}"? Your balance after: ${Math.max(0, balance - confirmItem.coinCost)} coins.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="confirm-cancel">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnlock} disabled={unlockMutation.isPending} data-testid="confirm-purchase">
              {unlockMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mystery Box Reward Reveal */}
      <AlertDialog open={!!mysteryReward} onOpenChange={(o) => !o && setMysteryReward(null)}>
        <AlertDialogContent data-testid="mystery-reward-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-fuchsia-400" />
              {isAf ? "Raaiselkas Beloning!" : "Mystery Box Reward!"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base pt-2">
              {mysteryReward && (
                <span className="font-bold text-white text-lg">
                  {isAf ? mysteryReward.labelAf : mysteryReward.label}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setMysteryReward(null)} data-testid="mystery-reward-close">
              {isAf ? "Dankie!" : "Nice!"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyState({ t }: { t: typeof T["en"] | typeof T["af"] }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <ShoppingBag className="w-12 h-12 text-white" />
      <p className="text-white text-sm">
        {t.noItemsInCategory}
      </p>
    </div>
  );
}

function ItemCard({
  item, isAf, t, owned, isActive, affordable, requiresSub, isUnlocking,
  onApply, onUnlock, onSubscribe, ownedEffectOverride,
}: {
  item: StoreItem;
  isAf: boolean;
  t: typeof T["en"] | typeof T["af"];
  owned: boolean;
  isActive: boolean;
  affordable: boolean;
  requiresSub: boolean;
  isUnlocking: boolean;
  onApply: (i: StoreItem) => void;
  onUnlock: (i: StoreItem) => void;
  onSubscribe: () => void;
  ownedEffectOverride?: { en: string; af: string };
}) {
  const Icon = KEY_ICONS[item.key] ?? ITEM_ICONS[item.type] ?? Sparkles;
  const palette = item.palette;

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
        isActive
          ? "border-primary/60 bg-primary/10 shadow-[0_0_20px_rgba(6,182,212,0.18)]"
          : owned
            ? "border-primary/40 bg-primary/5"
            : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07] hover:-translate-y-0.5"
      }`}
      data-testid={`store-item-${item.key}`}
    >
      <PreviewSwatch item={item} Icon={Icon} palette={palette} owned={owned} isActive={isActive} requiresSub={requiresSub} t={t} />

      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-sm text-white leading-tight">
              {isAf ? item.nameAf : item.name}
            </p>
            <TierPill tier={item.tier} isAf={isAf} />
          </div>
          <p className="text-[11px] text-white mt-0.5 leading-tight line-clamp-2">
            {isAf ? item.descriptionAf : item.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          {requiresSub ? (
            <Badge variant="outline" className="text-[10px] gap-1 border-[#8A2BFF]/40 text-[#8A2BFF]">
              <Crown className="w-3 h-3" />
              {t.premiumLabel}
            </Badge>
          ) : item.coinCost > 0 ? (
            <Badge variant="outline" className="text-[10px] gap-1 border-[#FFE600]/40 text-[#FFE600]">
              <Coins className="w-3 h-3" />
              {item.coinCost}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] gap-1 border-emerald-500/40 text-emerald-500">
              {t.freeLabel}
            </Badge>
          )}

          <ActionButton
            item={item} t={t} owned={owned} isActive={isActive}
            affordable={affordable} requiresSub={requiresSub} isUnlocking={isUnlocking}
            onApply={onApply} onUnlock={onUnlock} onSubscribe={onSubscribe}
          />
        </div>

        {owned && (() => {
          const effect = ownedEffectOverride ?? OWNED_EFFECT[item.key] ?? TYPE_OWNED_EFFECT[item.type];
          if (!effect) return null;
          return (
            <p className="text-[10px] text-primary/80 font-semibold flex items-center gap-1" data-testid={`owned-effect-${item.key}`}>
              <Check className="w-3 h-3" />
              {isAf ? effect.af : effect.en}
            </p>
          );
        })()}
      </div>
    </div>
  );
}

function PreviewSwatch({
  item, Icon, palette, owned, isActive, requiresSub, t,
}: {
  item: StoreItem;
  Icon: any;
  palette: string[] | null;
  owned: boolean;
  isActive: boolean;
  requiresSub: boolean;
  t: typeof T["en"] | typeof T["af"];
}) {
  const fallback = PRODUCT_GRADIENTS[item.key] ?? "from-[#00E5FF] via-[#006BFF] to-[#8A2BFF]";

  return (
    <div className="h-28 relative overflow-hidden">
      {palette && palette.length > 0 ? (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${palette[0]} 0%, ${palette[1] ?? palette[0]} 50%, ${palette[2] ?? palette[1] ?? palette[0]} 100%)`,
          }}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${fallback}`} />
      )}
      <div className="absolute inset-0 bg-black/10 -[1px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="w-10 h-10 text-white drop-shadow-lg" />
      </div>
      {isActive && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg flex items-center gap-1">
          <Check className="w-3 h-3" />
          {t.activeLabel}
        </div>
      )}
      {!isActive && owned && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <Check className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      )}
      {requiresSub && !owned && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-bold text-[#FFE600]">
          <Crown className="w-3 h-3" />
          {t.premiumLabel}
        </div>
      )}
      {/* palette swatches strip */}
      {palette && palette.length > 0 && (
        <div className="absolute bottom-2 left-2 flex gap-1">
          {palette.slice(0, 3).map((c, i) => (
            <span key={i} className="w-3 h-3 rounded-full border border-white/40 shadow" style={{ backgroundColor: c }} />
          ))}
        </div>
      )}
    </div>
  );
}

function TierPill({ tier, isAf }: { tier: StoreItem["tier"]; isAf: boolean }) {
  const lbl = TIER_LABEL[tier];
  if (!lbl) return null;
  const cls =
    tier === "premium" ? "border-[#8A2BFF]/40 text-[#8A2BFF]" :
    tier === "free"    ? "border-emerald-500/40 text-emerald-500" :
                         "border-white/15 text-white";
  return (
    <span className={`text-[9px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded border ${cls}`}>
      {isAf ? lbl.af : lbl.en}
    </span>
  );
}

function ActionButton({
  item, t, owned, isActive, affordable, requiresSub, isUnlocking,
  onApply, onUnlock, onSubscribe,
}: {
  item: StoreItem;
  t: typeof T["en"] | typeof T["af"];
  owned: boolean;
  isActive: boolean;
  affordable: boolean;
  requiresSub: boolean;
  isUnlocking: boolean;
  onApply: (i: StoreItem) => void;
  onUnlock: (i: StoreItem) => void;
  onSubscribe: () => void;
}) {
  if (owned) {
    if (item.type === "theme") {
      if (isActive) {
        return (
          <span className="text-[10px] font-semibold text-primary flex items-center gap-1 px-2 py-1 rounded">
            <Check className="w-3 h-3" />
            {t.activeLabel}
          </span>
        );
      }
      return (
        <Button
          size="sm"
          className="h-7 text-[10px] bg-primary/80 hover:bg-primary"
          onClick={() => onApply(item)}
          data-testid={`btn-apply-${item.key}`}
        >
          <Palette className="w-3 h-3 mr-1" />
          {t.applyLabel}
        </Button>
      );
    }
    return (
      <span className="text-[10px] font-semibold text-primary flex items-center gap-1">
        <Check className="w-3 h-3" />
        {t.ownedLabel}
      </span>
    );
  }

  if (requiresSub) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-[10px] border-amber-500/30 hover:bg-amber-500/10"
        onClick={onSubscribe}
        data-testid={`btn-subscribe-${item.key}`}
      >
        {t.subscribeLabel}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      className="h-7 text-[10px] bg-primary/80 hover:bg-primary"
      disabled={!affordable || isUnlocking}
      onClick={() => onUnlock(item)}
      data-testid={`btn-unlock-${item.key}`}
    >
      {isUnlocking ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : !affordable ? (
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          {t.tooFewLabel}
        </span>
      ) : (
        t.unlockLabel
      )}
    </Button>
  );
}

function ThemeGroups({
  items, isAf, t, isOwned, isActiveTheme, canAfford, requiresSubscription,
  onApply, onUnlock, onSubscribe, unlockingKey,
}: {
  items: StoreItem[];
  isAf: boolean;
  t: typeof T["en"] | typeof T["af"];
  isOwned: (i: StoreItem) => boolean;
  isActiveTheme: (i: StoreItem) => boolean;
  canAfford: (i: StoreItem) => boolean;
  requiresSubscription: (i: StoreItem) => boolean;
  onApply: (i: StoreItem) => void;
  onUnlock: (i: StoreItem) => void;
  onSubscribe: () => void;
  unlockingKey: string | null;
}) {
  const groups: { key: StoreItem["tier"]; en: string; af: string; subEn: string; subAf: string }[] = [
    { key: "free",       en: "Free",       af: "Gratis",       subEn: "Always available",          subAf: "Altyd beskikbaar" },
    { key: "unlockable", en: "Unlockable", af: "Ontsluitbaar", subEn: "Buy with coins",            subAf: "Koop met munte"   },
    { key: "premium",    en: "Premium",    af: "Premium",      subEn: "Top-tier collectible",      subAf: "Boonste-vlak"     },
  ];

  return (
    <div className="space-y-8">
      {groups.map((g) => {
        const groupItems = items.filter((i) => i.tier === g.key);
        if (groupItems.length === 0) return null;
        return (
          <section key={g.key} className="space-y-3" data-testid={`theme-group-${g.key}`}>
            <div className="flex items-baseline justify-between border-b border-white/5 pb-2">
              <div>
                <h3 className="text-sm font-bold text-white">{isAf ? g.af : g.en}</h3>
                <p className="text-[11px] text-white">{isAf ? g.subAf : g.subEn}</p>
              </div>
              <span className="text-[11px] text-white tabular-nums">{groupItems.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupItems.map((item) => (
                <ItemCard
                  key={item.key}
                  item={item}
                  isAf={isAf}
                  t={t}
                  owned={isOwned(item)}
                  isActive={isActiveTheme(item)}
                  affordable={canAfford(item)}
                  requiresSub={requiresSubscription(item)}
                  isUnlocking={unlockingKey === item.key}
                  onApply={onApply}
                  onUnlock={onUnlock}
                  onSubscribe={onSubscribe}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
