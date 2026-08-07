import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gift, Copy, Check, Share2, Linkedin } from "lucide-react";

/** GET /api/referral/my-link — server/routes.ts:6700. */
type ReferralLinkResp = {
  code: string | null;
  link: string | null;
  threshold: number;
  pendingReferrals: number;
  paidReferrals: number;
  towardNextReward: number;
  monthsEarned: number;
};

/**
 * Compact referral share card for the learner dashboard home.
 *
 * The share link previously lived only in Settings, which is effectively
 * buried — owner asked for it on the home surface where learners actually
 * are. Same endpoint and same reward rule as Settings, so the two surfaces
 * can never drift apart on what they promise.
 *
 * Reward truth (server/routes.ts:386-409): every `threshold` PAID
 * conversions extends the referrer's subscription by 30 days. It is NOT
 * coins, and it is skipped entirely unless the referrer's own subscription
 * is active — so this card stays quiet rather than over-promising when
 * there's no link to give.
 */
export function ReferralShareCard({ isAf = false }: { isAf?: boolean }) {
  const [copied, setCopied] = useState(false);

  const { data } = useQuery<ReferralLinkResp>({
    queryKey: ["/api/referral/my-link"],
    retry: false,
  });

  const link = data?.link ?? null;
  // No code yet (fresh account, or sub not in an eligible state) — render
  // nothing rather than a broken/empty share box.
  if (!link) return null;

  const threshold = data?.threshold ?? 2;
  const toward = data?.towardNextReward ?? 0;
  const earned = data?.monthsEarned ?? 0;

  const shareText = isAf
    ? `Ek gebruik BrainTrack vir Matriek — regte NSS-vraestelle, memo's en 'n KI-tutor. Sluit by my aan: ${link}`
    : `I'm using BrainTrack for Matric — real NSC papers, memos and an AI tutor. Join me: ${link}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link!);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the input stays selectable for a manual copy */
    }
  }

  return (
    <div
      data-testid="dashboard-referral-card"
      style={{
        background: "#050508",
        border: "2.5px solid #94F7C5",
        borderRadius: 24,
        boxShadow: "6px 6px 0 0 #94F7C5",
        padding: 26,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Gift style={{ width: 20, height: 20, color: "#94F7C5", flex: "none" }} />
        <div
          role="heading"
          aria-level={2}
          style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif", fontSize: 18, color: "#94F7C5" }}
        >
          {isAf ? "Bring jou tjommies" : "Bring your squad"}
        </div>
      </div>

      <p style={{ color: "#fff", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 16px" }}>
        {isAf
          ? `Elke ${threshold} vriende wat betalende lede word, gee jou 1 maand gratis.`
          : `Every ${threshold} friends who become paying members earns you 1 month free.`}
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "stretch", marginBottom: 14 }}>
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          data-testid="dashboard-referral-link"
          aria-label={isAf ? "Jou verwysingskakel" : "Your referral link"}
          style={{
            flex: "1 1 200px",
            minWidth: 0,
            background: "#fff",
            border: "2px solid #94F7C5",
            borderRadius: 10,
            padding: "11px 13px",
            fontSize: 13,
            fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace",
            color: "#050508",
          }}
        />
        <button
          type="button"
          onClick={copyLink}
          data-testid="button-dashboard-copy-referral"
          style={{
            flex: "0 0 auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: copied ? "#9FF5E8" : "#94F7C5",
            color: "#050508",
            border: "none",
            borderRadius: 10,
            padding: "11px 16px",
            fontWeight: 800,
            fontSize: 13.5,
            cursor: "pointer",
            minHeight: 44,
          }}
        >
          {copied ? <Check style={{ width: 15, height: 15 }} /> : <Copy style={{ width: 15, height: 15 }} />}
          {copied ? (isAf ? "Gekopieer" : "Copied") : (isAf ? "Kopieer" : "Copy")}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="button-dashboard-share-whatsapp"
          style={{
            flex: "0 0 auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#25D366",
            color: "#fff",
            borderRadius: 10,
            padding: "11px 16px",
            fontWeight: 800,
            fontSize: 13.5,
            textDecoration: "none",
            minHeight: 44,
          }}
        >
          <Share2 style={{ width: 15, height: 15 }} />
          WhatsApp
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="button-dashboard-share-linkedin"
          style={{
            flex: "0 0 auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "#0A66C2",
            color: "#fff",
            borderRadius: 10,
            padding: "11px 16px",
            fontWeight: 800,
            fontSize: 13.5,
            textDecoration: "none",
            minHeight: 44,
          }}
        >
          <Linkedin style={{ width: 15, height: 15 }} />
          LinkedIn
        </a>
      </div>

      {/* Progress toward the next free month. */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 5 }} aria-hidden>
          {Array.from({ length: threshold }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 26,
                height: 8,
                borderRadius: 999,
                background: i < toward ? "#94F7C5" : "transparent",
                border: "1.5px solid #94F7C5",
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 12.5, color: "#fff" }}>
          {isAf
            ? `${toward}/${threshold} na jou volgende gratis maand`
            : `${toward}/${threshold} toward your next free month`}
          {earned > 0 &&
            (isAf ? ` · ${earned} verdien` : ` · ${earned} earned`)}
        </span>
      </div>
    </div>
  );
}
