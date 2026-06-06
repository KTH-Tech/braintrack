const DISMISSED_KEY = "btk_install_dismissed";
const INSTALLED_KEY = "btk_install_done";
const SESSION_COUNT_KEY = "btk_session_count";
const SESSION_STARTED_KEY = "btk_session_started";

export const HIGH_INTENT_SESSION_THRESHOLD = 2;

export function hasReferralSession(): boolean {
  return !!(localStorage.getItem("btk_src") || localStorage.getItem("btk_ref"));
}

export function isInstallBannerDismissed(): boolean {
  return !!(localStorage.getItem(DISMISSED_KEY) || localStorage.getItem(INSTALLED_KEY));
}

export function markInstallBannerDismissed(): void {
  localStorage.setItem(DISMISSED_KEY, "1");
}

export function markInstallCompleted(): void {
  localStorage.setItem(INSTALLED_KEY, "1");
}

export function isRunningStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

/**
 * Increments the persistent session counter once per browser session.
 * Safe to call on every mount — uses sessionStorage to prevent double-counting.
 */
export function incrementSessionCount(): void {
  if (sessionStorage.getItem(SESSION_STARTED_KEY)) return;
  sessionStorage.setItem(SESSION_STARTED_KEY, "1");
  const current = parseInt(localStorage.getItem(SESSION_COUNT_KEY) ?? "0", 10);
  localStorage.setItem(SESSION_COUNT_KEY, String(current + 1));
}

export function getSessionCount(): number {
  return parseInt(localStorage.getItem(SESSION_COUNT_KEY) ?? "0", 10);
}

/**
 * Returns true when the visitor has accumulated at least HIGH_INTENT_SESSION_THRESHOLD
 * sessions, indicating they are an engaged user even without a referral link.
 */
export function isHighIntentBySessionCount(
  threshold = HIGH_INTENT_SESSION_THRESHOLD,
): boolean {
  return getSessionCount() >= threshold;
}

export function getReferralValues(): { btkSrc: string | null; btkRef: string | null } {
  return {
    btkSrc: localStorage.getItem("btk_src"),
    btkRef: localStorage.getItem("btk_ref"),
  };
}
