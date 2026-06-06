export type DownloadOutcome = "downloaded" | "shared" | "opened" | "failed";

interface IOSNavigatorExtras {
  standalone?: boolean;
  platform?: string;
  maxTouchPoints?: number;
  userAgent?: string;
}

interface ShareData {
  files?: File[];
  title?: string;
  text?: string;
  url?: string;
}

interface ShareNavigatorExtras {
  canShare?: (data: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
}

type ExtendedNavigator = Navigator & IOSNavigatorExtras & ShareNavigatorExtras;

function getNav(): ExtendedNavigator {
  return navigator as ExtendedNavigator;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = getNav();
  const ua = nav.userAgent || "";
  const platform = nav.platform || "";
  const maxTouchPoints = nav.maxTouchPoints ?? 0;
  const iPad = platform === "MacIntel" && maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(ua) || iPad;
}

function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  const matchStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
  const iosStandalone = (window.navigator as Navigator & IOSNavigatorExtras).standalone === true;
  return matchStandalone || iosStandalone;
}

async function trySharePDF(blob: Blob, filename: string): Promise<boolean> {
  try {
    const nav = getNav();
    if (typeof nav.canShare !== "function" || typeof nav.share !== "function") return false;
    const file = new File([blob], filename, { type: blob.type || "application/octet-stream" });
    if (!nav.canShare({ files: [file] })) return false;
    await nav.share({ files: [file], title: filename });
    return true;
  } catch {
    return false;
  }
}

/**
 * Cross-platform download that works in installed PWAs (incl. iOS standalone),
 * mobile browsers, and desktop. Falls back to Web Share API on iOS PWAs where
 * anchor[download] blob clicks are unreliable, and finally opens the blob in a
 * new tab so the user can save/share manually.
 */
export async function downloadBlob(blob: Blob, filename: string): Promise<DownloadOutcome> {
  const url = URL.createObjectURL(blob);
  const cleanup = () => {
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const standalone = isStandalonePWA();
  const ios = isIOS();

  if (ios) {
    const shared = await trySharePDF(blob, filename);
    if (shared) {
      cleanup();
      return "shared";
    }
    const opened = window.open(url, "_blank");
    if (opened) {
      cleanup();
      return "opened";
    }
    // ACCEPTED RISK: `url` is always a `blob:` URL produced by
    // URL.createObjectURL(blob) above — it is a locally-generated,
    // same-origin object URL, never derived from user input or server data.
    // isSafeInternalPath() intentionally rejects blob: URLs (they don't
    // start with "/"), so guarding this line with it would break the
    // iOS PWA fallback download entirely.  The risk of an open-redirect
    // via this code path is therefore nil.
    window.location.href = url; // nosemgrep: no-raw-window-location-href-variable
    cleanup();
    return "opened";
  }

  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.target = "_self";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    cleanup();
    return "downloaded";
  } catch {
    if (standalone) {
      const shared = await trySharePDF(blob, filename);
      if (shared) {
        cleanup();
        return "shared";
      }
    }
    const opened = window.open(url, "_blank");
    if (opened) {
      cleanup();
      return "opened";
    }
    cleanup();
    return "failed";
  }
}
