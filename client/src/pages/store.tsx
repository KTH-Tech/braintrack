import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/language-context";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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
  Coins, Lock, Loader2, Check, ShoppingBag, Sparkles,
  Shield, Rocket,
} from "lucide-react";
import { LearnerHeader } from "@/components/learner-header";

type MysteryReward = { type: "coins" | "theme"; amount?: number; themeKey?: string; label: string; labelAf: string };

interface StoreItem {
  key: string;
  name: string;
  nameAf: string;
  description: string;
  descriptionAf: string;
  type: string;
  coinCost: number;
  subscriptionTier: string | null;
  themeKey: string | null;
  tier: "free" | "unlockable" | "premium";
  palette: string[] | null;
}

/* ── Reality filter ──────────────────────────────────────────────────
   The store shows ONLY power-ups with real server-side effects:
   - streak-freeze : storage.updateStreak checks it before resetting a streak
   - double-coins  : storage.awardCoins doubles earnings while active
   - mystery-box   : server rolls a random coin reward on purchase
   Everything else the API may still return (themes, titles, badge frames,
   avatar items, cosmetics, rizz-boost) has NO effect anywhere in the app
   and is deliberately not rendered. */
const REAL_POWER_UPS: Record<string, { icon: any; hex: string; tilt: number }> = {
  "streak-freeze": { icon: Shield,   hex: "#9FF5E8", tilt: -1 },
  "double-coins":  { icon: Rocket,   hex: "#FFE29A", tilt: 0.8 },
  "mystery-box":   { icon: Sparkles, hex: "#C5B3FF", tilt: -0.7 },
};

const OWNED_EFFECT: Record<string, { en: string; af: string }> = {
  "streak-freeze": { en: "Shield ready", af: "Skild gereed" },
  "double-coins":  { en: "2x active",    af: "2x aktief"    },
  "mystery-box":   { en: "Box opened",   af: "Kas oopgemaak" },
};

const T = {
  en: {
    pageTitle: "Learner Store",
    heroEyebrow: "spend those coins!",
    heroTitle: "Power-Up Store",
    heroSubtitle: "Real boosts, earned with real coins. Protect your streak, double your earnings, or roll the Mystery Box.",
    homeTitle: "Home",
    purchaseConfirmed: "Purchase confirmed!",
    itemUnlocked: "Item unlocked.",
    notEnoughCoins: "Not enough coins",
    couldNotUnlock: "Could not unlock",
    tryAgain: "Please try again.",
    earnCoins: "Earn coins by answering questions, building streaks, and completing challenges.",
    viewRewards: "View your rewards →",
    confirmPurchase: "Confirm purchase",
    cancel: "Cancel",
    confirm: "Confirm",
    ownedLabel: "Owned",
    tooFewLabel: "Too few",
    unlockLabel: "Unlock",
    coinsLabel: "coins",
    mysteryRewardTitle: "Mystery Box Reward!",
    mysteryThanks: "Nice!",
  },
  af: {
    pageTitle: "Leerderwinkel",
    heroEyebrow: "spandeer daai munte!",
    heroTitle: "Hupstoot-Winkel",
    heroSubtitle: "Egte hupstote, verdien met egte munte. Beskerm jou reeks, verdubbel jou munte, of waag die Raaiselkas.",
    homeTitle: "Tuis",
    purchaseConfirmed: "Aankoop bevestig!",
    itemUnlocked: "Item ontsluit.",
    notEnoughCoins: "Nie genoeg munte nie",
    couldNotUnlock: "Kon nie ontsluit nie",
    tryAgain: "Probeer asseblief weer.",
    earnCoins: "Verdien munte deur vrae te beantwoord, reekse te bou en uitdagings te voltooi.",
    viewRewards: "Sien jou belonings →",
    confirmPurchase: "Bevestig aankoop",
    cancel: "Kanselleer",
    confirm: "Bevestig",
    ownedLabel: "Eie",
    tooFewLabel: "Te min",
    unlockLabel: "Ontsluit",
    coinsLabel: "munte",
    mysteryRewardTitle: "Raaiselkas Beloning!",
    mysteryThanks: "Dankie!",
  },
} as const;

export default function StorePage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [, navigate] = useLocation();
  const isAf = language === "af";
  const t = T[language];
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<StoreItem | null>(null);
  const [mysteryReward, setMysteryReward] = useState<MysteryReward | null>(null);

  if (user?.role === "parent") {
    navigate("/parent");
    return null;
  }

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

  const balance = storeData?.coinBalance ?? 0;
  const userUnlocks = useMemo(() => new Set(storeData?.userUnlocks ?? []), [storeData?.userUnlocks]);
  const activePowerUps = storeData?.activePowerUps ?? {};

  // Only real, server-enforced power-ups make it onto the shelf.
  const visibleItems = useMemo(
    () => (storeData?.items ?? []).filter((i) => REAL_POWER_UPS[i.key]),
    [storeData?.items]
  );

  const doubleCoinsExpiresAt = activePowerUps["double-coins"]?.expiresAt;
  const doubleCoinsHoursLeft = doubleCoinsExpiresAt
    ? Math.max(0, Math.ceil((new Date(doubleCoinsExpiresAt).getTime() - Date.now()) / 3_600_000))
    : 0;

  const isOwned = (item: StoreItem) => userUnlocks.has(item.key);
  const canAfford = (item: StoreItem) => balance >= item.coinCost;

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

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ background: "#050508", fontFamily: "'Poppins',sans-serif" }}>
      <LearnerHeader
        backHref="/dashboard"
        backLabel={t.homeTitle}
        title={t.pageTitle}
        titleColor="#9FF5E8"
        maxWidthClassName="max-w-5xl"
        actions={
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tabular-nums"
            style={{ background: "rgba(255,226,154,.12)", border: "1.5px solid rgba(255,226,154,.5)", color: "#FFE29A" }}
            data-testid="coin-balance-header"
          >
            <Coins className="w-3.5 h-3.5" />
            {balance}
          </div>
        }
      />

      <main className="relative max-w-5xl mx-auto px-4 py-10 sm:py-14 space-y-10">
        {/* Ambient auras */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full blur-[120px] opacity-35" style={{ background: "#C5B3FF" }} />
        <div aria-hidden className="pointer-events-none absolute top-48 -right-24 w-[340px] h-[340px] rounded-full blur-[120px] opacity-30" style={{ background: "#FFE29A" }} />

        {/* Hero */}
        <section className="relative space-y-4 text-center">
          <div className="inline-flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" style={{ color: "#FFE29A", filter: "drop-shadow(0 0 4px #FFE29A)" }} />
            <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 16, color: "#FFE29A", transform: "rotate(-2deg)", display: "inline-block" }}>
              {t.heroEyebrow} 💰
            </span>
          </div>
          <div
            role="heading"
            aria-level={1}
            className="font-black leading-[0.95] tracking-tight text-3xl sm:text-4xl md:text-5xl"
            style={{
              backgroundImage: "linear-gradient(90deg,#FFE29A,#FFE29A,#94F7C5,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {t.heroTitle}
          </div>
          <p className="text-white text-base sm:text-lg max-w-2xl mx-auto" style={{ opacity: 0.94 }}>
            {t.heroSubtitle}
          </p>
        </section>

        {/* Power-up shelf */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse" style={{ height: 220, borderRadius: 22, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }} />
            ))}
          </div>
        ) : (
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-5">
            {visibleItems.map((item) => {
              const meta = REAL_POWER_UPS[item.key];
              const Icon = meta.icon;
              const hex = meta.hex;
              const owned = isOwned(item);
              const affordable = canAfford(item);
              const isUnlocking = unlocking === item.key;
              const rebuyable = item.key === "mystery-box";
              const ownedEffect =
                item.key === "double-coins" && owned && doubleCoinsHoursLeft > 0
                  ? (isAf ? `2x aktief — ${doubleCoinsHoursLeft}u oor` : `2x active — ${doubleCoinsHoursLeft}h left`)
                  : owned
                    ? (isAf ? OWNED_EFFECT[item.key]?.af : OWNED_EFFECT[item.key]?.en)
                    : null;
              return (
                <div
                  key={item.key}
                  data-testid={`store-item-${item.key}`}
                  style={{
                    background: `linear-gradient(160deg, ${hex}12, rgba(255,255,255,.02))`,
                    border: `1.5px solid ${hex}`,
                    borderRadius: 22,
                    padding: 22,
                    transform: `rotate(${meta.tilt}deg)`,
                    transition: "transform .25s",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "rotate(0deg) translateY(-6px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${meta.tilt}deg)`; }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div
                      style={{ width: 52, height: 52, borderRadius: 16, background: `${hex}26`, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Icon style={{ width: 26, height: 26, color: hex }} />
                    </div>
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tabular-nums"
                      style={{ color: "#FFE29A", border: "1px solid rgba(255,226,154,.5)", background: "rgba(255,226,154,.1)" }}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      {item.coinCost}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                      {isAf ? item.nameAf : item.name}
                    </div>
                    <p style={{ fontSize: 13.5, color: "#fff", lineHeight: 1.55, margin: "6px 0 0" }}>
                      {isAf ? item.descriptionAf : item.description}
                    </p>
                  </div>
                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    {owned && !rebuyable ? (
                      <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: hex }}>
                        <Check className="w-4 h-4" />
                        {t.ownedLabel}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="w-full px-4 py-2.5 rounded-xl text-sm disabled:opacity-40"
                        style={{
                          background: affordable ? "linear-gradient(100deg,#9FF5E8,#C5B3FF)" : "transparent",
                          color: affordable ? "#050508" : "#fff",
                          border: affordable ? "none" : "1.5px solid rgba(255,255,255,.25)",
                          fontWeight: 800,
                          cursor: affordable ? "pointer" : "not-allowed",
                          transition: "transform .2s",
                        }}
                        disabled={!affordable || isUnlocking}
                        onClick={() => requestUnlock(item)}
                        onMouseEnter={(e) => { if (affordable) e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                        data-testid={`btn-unlock-${item.key}`}
                      >
                        {isUnlocking ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : !affordable ? (
                          <span className="flex items-center justify-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            {t.tooFewLabel}
                          </span>
                        ) : (
                          t.unlockLabel
                        )}
                      </button>
                    )}
                  </div>
                  {ownedEffect && (
                    <p className="flex items-center gap-1 text-xs font-bold" style={{ color: hex, margin: 0 }} data-testid={`owned-effect-${item.key}`}>
                      <Check className="w-3.5 h-3.5" />
                      {ownedEffect}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Earn-coins footer */}
        <div
          className="relative text-center rounded-2xl px-6 py-8"
          style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)" }}
        >
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
            style={{ background: "linear-gradient(90deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }}
          />
          <span style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 15, color: "#94F7C5", transform: "rotate(-2deg)", display: "inline-block" }}>
            {isAf ? "meer munte = meer hupstote" : "more coins = more power"} ⚡
          </span>
          <p className="text-sm text-white mt-2">{t.earnCoins}</p>
          <Link href="/rewards">
            <button
              className="mt-4 px-5 py-2.5 rounded-xl bg-white/[.03] text-sm font-bold hover:bg-white/10 transition-colors"
              style={{ color: "#9FD8FF", border: "1.5px solid #9FD8FF" }}
              data-testid="link-to-rewards"
            >
              {t.viewRewards}
            </button>
          </Link>
        </div>
      </main>

      {/* Confirm purchase */}
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

      {/* Mystery Box reward reveal */}
      <AlertDialog open={!!mysteryReward} onOpenChange={(o) => !o && setMysteryReward(null)}>
        <AlertDialogContent data-testid="mystery-reward-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: "#C5B3FF" }} />
              {t.mysteryRewardTitle}
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
              {t.mysteryThanks}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
