import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen, Target, BarChart3, Trophy, Wrench, Users,
  Check, Copy, Share2, Gift, Linkedin,
} from "lucide-react";
import { ConfettiBurst } from "@/components/confetti-burst";
import { rizzMascot } from "@/components/rizz-brand";

/** Shape returned by GET /api/referral/my-link (server/routes.ts:6700). */
type ReferralLinkResp = {
  code: string | null;
  link: string | null;
  threshold: number;
  pendingReferrals: number;
  paidReferrals: number;
  towardNextReward: number;
  monthsEarned: number;
};

const PASTEL = {
  mint: "#9FF5E8",
  sky: "#9FD8FF",
  pink: "#FFB7E5",
  violet: "#C5B3FF",
  butter: "#FFE29A",
  lime: "#94F7C5",
};

/** The six value props from the printed thank-you poster, in poster order. */
const BENEFITS = [
  { icon: BookOpen,  color: PASTEL.violet, en: ["CAPS-ALIGNED", "CONTENT"],        af: ["KABV-BELYNDE", "INHOUD"],         enSub: "Study smarter with trusted resources.",  afSub: "Studeer slimmer met betroubare bronne." },
  { icon: Target,    color: PASTEL.pink,   en: ["PERSONALISED", "STUDY PLANS"],    af: ["PERSOONLIKE", "STUDIEPLANNE"],    enSub: "Your goals. Your plan. Your success.",   afSub: "Jou doelwitte. Jou plan. Jou sukses." },
  { icon: BarChart3, color: PASTEL.mint,   en: ["TRACK YOUR", "PROGRESS"],         af: ["VOLG JOU", "VORDERING"],          enSub: "See how you're improving every day.",    afSub: "Sien hoe jy elke dag verbeter." },
  { icon: Trophy,    color: PASTEL.butter, en: ["REWARDS &", "ACHIEVEMENTS"],      af: ["BELONINGS &", "PRESTASIES"],      enSub: "Stay motivated and level up!",          afSub: "Bly gemotiveerd en klim vlakke!" },
  { icon: Wrench,    color: PASTEL.sky,    en: ["STUDY TOOLS", "& SUPPORT"],       af: ["STUDIEHULPMIDDELS", "& STEUN"],   enSub: "Everything you need to ace Matric.",    afSub: "Alles wat jy nodig het vir Matriek." },
  { icon: Users,     color: PASTEL.lime,   en: ["PARENT", "INSIGHTS"],             af: ["OUER-", "INSIGTE"],               enSub: "We'll keep you informed every step.",    afSub: "Ons hou jou elke stap ingelig." },
];

/**
 * Post-payment thank-you screen, built to the printed BrainTrack poster.
 *
 * Deliberately breaks the app's pure-black rule for this one surface: the
 * poster is a pastel wall and this is the single celebratory moment in the
 * funnel, so the bright treatment is the point. Every other surface stays
 * black.
 *
 * Copy is held to what the server actually does — pay-now: the learner is
 * charged in full at checkout and access begins immediately. Full access from
 * the first payment; no "day 14" language here.
 */
export function PaymentThankYou({
  isAf,
  navigate,
  learnerName,
  variant = "access_live",
}: {
  isAf: boolean;
  navigate: (to: string) => void;
  learnerName?: string | null;
  /** `access_live` = generic "full access is live" confirmation (kept for
   *  the null-billing-method path). `subscription_active` = a paid subscriber
   *  (monthly or once-off). Both are pay-now. */
  variant?: "access_live" | "subscription_active";
}) {
  const [copied, setCopied] = useState(false);
  const isGenericAccess = variant === "access_live";

  const { data: referral } = useQuery<ReferralLinkResp>({
    queryKey: ["/api/referral/my-link"],
    // The code is minted lazily on first read, so a miss here just means the
    // share block stays hidden — never blocks the thank-you itself.
    retry: false,
  });

  const shareLink = referral?.link ?? null;
  const shareText = isAf
    ? `Ek gebruik BrainTrack vir Matriek — regte NSS-vraestelle, memo's en 'n KI-tutor. Sluit by my aan: ${shareLink}`
    : `I'm using BrainTrack for Matric — real NSC papers, memos and an AI tutor. Join me: ${shareLink}`;

  async function copyLink() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked (insecure context / permission) — the input below
         is still selectable, so the user can copy manually. */
    }
  }

  return (
    <div
      data-testid="payment-thank-you"
      style={{
        minHeight: "100vh",
        // Pastel wall, matching the poster's airy gradient.
        background:
          "linear-gradient(135deg,#FFE9F5 0%,#E8F6FF 26%,#EAFBF4 52%,#F3ECFF 78%,#FFF4E0 100%)",
        padding: "clamp(20px,5vw,56px) clamp(16px,4vw,32px) 64px",
        fontFamily: "'Poppins',system-ui,sans-serif",
        color: "#161018",
      }}
    >
      <ConfettiBurst />

      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        {/* ── Masthead ─────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div
            style={{
              fontFamily: "'Permanent Marker',cursive",
              fontSize: "clamp(30px,7vw,54px)",
              lineHeight: 1,
              letterSpacing: -1,
            }}
          >
            <span style={{ color: "#FF4FA3" }}>Brain</span>
            <span style={{ color: "#2BC7B4" }}>Track</span>
          </div>
          <p
            style={{
              fontSize: "clamp(9px,1.9vw,12px)",
              fontWeight: 800,
              letterSpacing: 2,
              margin: "6px 0 0",
              textTransform: "uppercase",
            }}
          >
            {isAf ? (
              <>Matrieksukses. Ontsluit <span style={{ color: "#FF4FA3" }}>jou</span> toekoms.</>
            ) : (
              <>Matric success. Unlock <span style={{ color: "#FF4FA3" }}>your</span> future.</>
            )}
          </p>
        </div>

        {/* ── Hero: THANK YOU + Rizz ───────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(8px,3vw,32px)",
            flexWrap: "wrap",
            margin: "clamp(12px,3vw,28px) 0",
          }}
        >
          <div style={{ flex: "1 1 300px", minWidth: 260, textAlign: "left" }}>
            <div
              role="heading"
              aria-level={1}
              data-testid="thank-you-heading"
              style={{
                fontFamily: "'Permanent Marker',cursive",
                fontSize: "clamp(56px,15vw,124px)",
                lineHeight: 0.82,
                letterSpacing: -2,
                transform: "rotate(-2deg)",
              }}
            >
              <span style={{ display: "block", color: "#9B6BFF" }}>
                {isAf ? "DANKIE" : "THANK"}
              </span>
              <span style={{ display: "block", color: "#2BC7B4" }}>
                {isAf ? "!" : "YOU!"}
              </span>
            </div>
            <div
              style={{
                display: "inline-block",
                marginTop: 12,
                background: "#161018",
                color: "#fff",
                fontWeight: 900,
                fontSize: "clamp(13px,2.6vw,19px)",
                letterSpacing: 1,
                padding: "7px 18px",
                borderRadius: 4,
                transform: "rotate(-1deg)",
                textTransform: "uppercase",
              }}
            >
              {isAf ? "vir jou betaling" : "for your payment"}
            </div>
          </div>

          <img
            src={rizzMascot}
            alt=""
            aria-hidden
            style={{
              flex: "0 1 260px",
              width: "clamp(150px,34vw,300px)",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>

        {/* ── All set card ─────────────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            border: "3px solid #161018",
            borderRadius: 20,
            boxShadow: "7px 7px 0 0 #9B6BFF",
            padding: "clamp(18px,3.5vw,28px)",
            display: "flex",
            gap: 18,
            alignItems: "flex-start",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              flex: "none",
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#2BC7B4,#9B6BFF)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Check style={{ width: 30, height: 30, color: "#fff", strokeWidth: 3.5 }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontFamily: "'Permanent Marker',cursive",
                fontSize: "clamp(19px,3.6vw,25px)",
                margin: "0 0 8px",
              }}
            >
              <span style={{ color: "#FF4FA3" }}>{isAf ? "JIPPIE!" : "YAY!"}</span>{" "}
              {isAf ? "Alles is reg." : "You're all set."}
            </p>
            <p style={{ fontSize: "clamp(14px,2.4vw,16px)", lineHeight: 1.6, margin: 0 }}>
              {isGenericAccess ? (
                isAf ? (
                  <>
                    Jou betaling was suksesvol en jou{" "}
                    <strong style={{ color: "#9B6BFF" }}>VOLLE TOEGANG</strong>{" "}
                    is nou lewendig!
                  </>
                ) : (
                  <>
                    Your payment was successful and your{" "}
                    <strong style={{ color: "#9B6BFF" }}>FULL ACCESS</strong> is now
                    live!
                  </>
                )
              ) : isAf ? (
                <>
                  Jou betaling was suksesvol — jou{" "}
                  <strong style={{ color: "#9B6BFF" }}>Student Life</strong> is nou aktief.
                </>
              ) : (
                <>
                  Your payment was successful — your{" "}
                  <strong style={{ color: "#9B6BFF" }}>Student Life</strong> is now active.
                </>
              )}
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: "10px 0 0", opacity: 0.78 }}>
              {isGenericAccess
                ? isAf
                  ? "Jou toegang begin dadelik. Verskyn op jou staat as KTH-TECH."
                  : "Your access begins immediately. Appears on your statement as KTH-TECH."
                : isAf
                  ? "R169/maand · Kanselleer enige tyd in die app. Verskyn op jou staat as KTH-TECH."
                  : "R169/month · Cancel anytime in the app. Appears on your statement as KTH-TECH."}
            </p>
          </div>
        </div>

        {/* ── Shareable learner link ───────────────────────────────── */}
        {shareLink && (
          <div
            data-testid="thank-you-referral"
            style={{
              background: "#161018",
              border: "3px solid #161018",
              borderRadius: 20,
              boxShadow: `7px 7px 0 0 ${PASTEL.mint}`,
              padding: "clamp(18px,3.5vw,28px)",
              marginBottom: 32,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Gift style={{ width: 22, height: 22, color: PASTEL.mint, flex: "none" }} />
              <p
                style={{
                  fontFamily: "'Permanent Marker',cursive",
                  fontSize: "clamp(17px,3.2vw,22px)",
                  color: PASTEL.mint,
                  margin: 0,
                }}
              >
                {isAf ? "Jou deelskakel" : "Your share link"}
              </p>
            </div>
            <p style={{ color: "#fff", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>
              {isAf ? (
                <>
                  Stuur dit aan klasmaats. Wanneer{" "}
                  <strong style={{ color: PASTEL.butter }}>{referral?.threshold ?? 2}</strong>{" "}
                  van hulle betalende lede word, kry jy{" "}
                  <strong style={{ color: PASTEL.butter }}>1 maand gratis</strong>.
                </>
              ) : (
                <>
                  Send this to classmates. When{" "}
                  <strong style={{ color: PASTEL.butter }}>{referral?.threshold ?? 2}</strong> of
                  them become paying members, you get{" "}
                  <strong style={{ color: PASTEL.butter }}>1 month free</strong>.
                </>
              )}
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "stretch" }}>
              <input
                readOnly
                value={shareLink}
                onFocus={(e) => e.currentTarget.select()}
                data-testid="referral-link-input"
                aria-label={isAf ? "Jou verwysingskakel" : "Your referral link"}
                style={{
                  flex: "1 1 240px",
                  minWidth: 0,
                  background: "#fff",
                  border: `2px solid ${PASTEL.mint}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 13.5,
                  fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace",
                  color: "#161018",
                }}
              />
              <button
                type="button"
                onClick={copyLink}
                data-testid="button-copy-referral"
                style={{
                  flex: "0 0 auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  background: copied ? PASTEL.lime : PASTEL.mint,
                  color: "#161018",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 18px",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                {copied ? <Check style={{ width: 16, height: 16 }} /> : <Copy style={{ width: 16, height: 16 }} />}
                {copied ? (isAf ? "Gekopieer" : "Copied") : (isAf ? "Kopieer" : "Copy")}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-share-whatsapp"
                style={{
                  flex: "0 0 auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  background: "#25D366",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "12px 18px",
                  fontWeight: 800,
                  fontSize: 14,
                  textDecoration: "none",
                  minHeight: 44,
                }}
              >
                <Share2 style={{ width: 16, height: 16 }} />
                WhatsApp
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="button-share-linkedin"
                style={{
                  flex: "0 0 auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  background: "#0A66C2",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "12px 18px",
                  fontWeight: 800,
                  fontSize: 14,
                  textDecoration: "none",
                  minHeight: 44,
                }}
              >
                <Linkedin style={{ width: 16, height: 16 }} />
                LinkedIn
              </a>
            </div>
          </div>
        )}

        {/* ── Benefits strip ───────────────────────────────────────── */}
        <div
          style={{
            display: "inline-block",
            background: "#161018",
            color: "#fff",
            fontFamily: "'Permanent Marker',cursive",
            fontSize: "clamp(13px,2.5vw,18px)",
            padding: "9px 22px",
            borderRadius: 6,
            transform: "rotate(-1deg)",
            marginBottom: 18,
          }}
        >
          {isAf ? "Hier is wat jy kry met BrainTrack" : "Here's what you get with BrainTrack"}
        </div>

        <div
          style={{
            background: "#fff",
            border: "3px solid #161018",
            borderRadius: 20,
            boxShadow: `7px 7px 0 0 ${PASTEL.sky}`,
            padding: "clamp(18px,3.5vw,28px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
            gap: "clamp(16px,3vw,22px)",
            marginBottom: 32,
          }}
        >
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            const title = isAf ? b.af : b.en;
            return (
              <div key={b.en.join(" ")} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    margin: "0 auto 10px",
                    borderRadius: 14,
                    background: b.color,
                    border: "2.5px solid #161018",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon style={{ width: 26, height: 26, color: "#161018" }} />
                </div>
                <p
                  style={{
                    fontWeight: 900,
                    fontSize: 12.5,
                    letterSpacing: 0.4,
                    lineHeight: 1.25,
                    margin: "0 0 5px",
                    textTransform: "uppercase",
                  }}
                >
                  {title[0]}
                  <br />
                  {title[1]}
                </p>
                <p style={{ fontSize: 12, lineHeight: 1.45, margin: 0, opacity: 0.75 }}>
                  {isAf ? b.afSub : b.enSub}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Closing + CTA ────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 22,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontFamily: "'Permanent Marker',cursive",
              fontSize: "clamp(20px,4vw,30px)",
              lineHeight: 1.15,
              transform: "rotate(-1.5deg)",
              flex: "1 1 240px",
            }}
          >
            {isAf ? (
              <>Die reis na jou beste begin <span style={{ color: "#FF4FA3" }}>NOU!</span></>
            ) : (
              <>The journey to your best starts <span style={{ color: "#FF4FA3" }}>NOW!</span></>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            data-testid="button-thank-you-dashboard"
            style={{
              flex: "0 0 auto",
              background: "#161018",
              color: "#fff",
              border: "3px solid #161018",
              borderRadius: 12,
              boxShadow: `6px 6px 0 0 ${PASTEL.pink}`,
              padding: "16px 34px",
              fontWeight: 900,
              fontSize: 16,
              cursor: "pointer",
              minHeight: 48,
            }}
          >
            {isAf
              ? `Kom ons begin${learnerName ? `, ${learnerName}` : ""} →`
              : `Let's go${learnerName ? `, ${learnerName}` : ""} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
