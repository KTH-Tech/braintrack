import { useState, useEffect } from "react";
import { X, Share, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { useAuth } from "@/hooks/use-auth";
import {
  hasReferralSession,
  isInstallBannerDismissed,
  markInstallBannerDismissed,
  markInstallCompleted,
  isRunningStandalone,
  isIOS,
  incrementSessionCount,
  isHighIntentBySessionCount,
  getReferralValues,
} from "@/lib/referral-detection";

function isEligibleForBanner(isAuthenticated: boolean, threshold: number): boolean {
  return hasReferralSession() || (isAuthenticated && isHighIntentBySessionCount(threshold));
}

function trackBannerEvent(event: "banner_shown" | "banner_dismissed" | "banner_installed"): void {
  const { btkSrc, btkRef } = getReferralValues();
  fetch("/api/track/banner", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, btkSrc, btkRef }),
  }).catch(() => {});
}

export function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const { canInstall, isInstalling, install, isInstalled } = useInstallPrompt();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: platformConfig } = useQuery<{ installNudgeSessionThreshold: number }>({
    queryKey: ["/api/config"],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const threshold = platformConfig?.installNudgeSessionThreshold ?? 1;

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      incrementSessionCount();
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    if (isRunningStandalone()) return;
    if (isInstallBannerDismissed()) return;
    if (!isEligibleForBanner(isAuthenticated, threshold)) return;

    const iosDevice = isIOS();
    setIos(iosDevice);

    if (iosDevice) {
      setVisible(true);
      trackBannerEvent("banner_shown");
    }
  }, [authLoading, isAuthenticated, threshold]);

  useEffect(() => {
    if (authLoading) return;
    if (!visible && canInstall && isEligibleForBanner(isAuthenticated, threshold) && !isInstallBannerDismissed()) {
      setVisible(true);
      trackBannerEvent("banner_shown");
    }
  }, [canInstall, visible, authLoading, isAuthenticated, threshold]);

  useEffect(() => {
    if (isInstalled) {
      markInstallCompleted();
      trackBannerEvent("banner_installed");
      setVisible(false);
    }
  }, [isInstalled]);

  function dismiss() {
    markInstallBannerDismissed();
    trackBannerEvent("banner_dismissed");
    setVisible(false);
  }

  async function handleInstall() {
    const outcome = await install();
    if (outcome === "dismissed") {
      markInstallBannerDismissed();
      trackBannerEvent("banner_dismissed");
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Install BrainTrack app"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: "0 16px 16px",
        pointerEvents: "none",
      }}
    >
      <div
        className="prismglass-panel"
        style={{
          pointerEvents: "auto",
          borderRadius: "16px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          maxWidth: "520px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            background: "linear-gradient(135deg, rgba(6, 182, 212,0.7) 0%, rgba(236,72,153,0.6) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Download size={20} color="#fff" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: "0.9rem",
              color: "#fff",
              lineHeight: 1.3,
            }}
          >
            Add BrainTrack to your Home Screen
          </p>
          {ios ? (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.78rem",
                color:"#ffffff",
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexWrap: "wrap",
              }}
            >
              Tap{" "}
              <Share
                size={13}
                style={{ display: "inline", verticalAlign: "middle", flexShrink: 0 }}
              />{" "}
              then <strong style={{ color:"#ffffff" }}>Add to Home Screen</strong>
            </p>
          ) : (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.78rem",
                color:"#ffffff",
              }}
            >
              Install for offline access &amp; faster load times
            </p>
          )}
        </div>

        {!ios && canInstall && (
          <button
            className="prismglass-btn"
            onClick={handleInstall}
            disabled={isInstalling}
            style={{
              flexShrink: 0,
              fontSize: "0.82rem",
              padding: "8px 16px",
              borderRadius: "10px",
              whiteSpace: "nowrap",
              cursor: isInstalling ? "wait" : "pointer",
              opacity: isInstalling ? 0.7 : 1,
            }}
          >
            {isInstalling ? "Installing…" : "Install"}
          </button>
        )}

        <button
          onClick={dismiss}
          aria-label="Dismiss install banner"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color:"#ffffff",
            padding: 4,
            display: "flex",
            alignItems: "center",
          }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
