/**
 * client/src/components/share-qr.tsx — a SCANNABLE QR code for a share link.
 *
 * Why this exists / what "define QR generator better" means: a QR rendered in
 * the app's palette (pale modules on the #050508 ground, a 2-module margin)
 * does NOT reliably scan — phone cameras expect DARK modules on a LIGHT field
 * with a real quiet zone. So the QR is the ONE deliberate exception to the dark
 * palette: dark ink (#050508) on a WHITE card, a 4-module quiet zone, and a
 * high-DPI render so it stays crisp on screen and in print/PNG.
 *
 * It encodes ONLY the value passed in (the single-use activation link) — never
 * a password and never any child personal data.
 */
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode as QrIcon } from "lucide-react";

interface ShareQrProps {
  /** The URL/text to encode — the single-use activation link. */
  value: string;
  /** Accessible label + the visible "what scanning does" caption. */
  scanLabel: string;
  /** Download button copy. */
  downloadLabel: string;
  /** PNG filename (no extension). */
  downloadName?: string;
  /** On-screen render size in CSS px (default 200 — ample for a phone camera). */
  size?: number;
  /** Accent for the download button (a design-system pastel). */
  accent?: string;
}

/** Rendered at high resolution so the on-screen QR and the downloaded PNG both
 *  stay sharp — display size is controlled separately via CSS. */
const RENDER_PX = 640;

export function ShareQr({
  value,
  scanLabel,
  downloadLabel,
  downloadName = "BrainTrack-signin-QR",
  size = 200,
  accent = "#9FF5E8",
}: ShareQrProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const text = (value ?? "").trim();
    if (!text) {
      setError(true);
      return;
    }
    QRCode.toCanvas(
      canvas,
      text,
      {
        width: RENDER_PX,
        margin: 4, // real quiet zone — non-negotiable for scannability
        errorCorrectionLevel: "M",
        // Dark modules on WHITE. This is what makes it scan.
        color: { dark: "#050508", light: "#FFFFFF" },
      },
      (err) => setError(!!err),
    );
  }, [value]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas || error) return;
    const link = document.createElement("a");
    link.download = `${downloadName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-3" data-testid="share-qr">
      {/* White quiet-zone card — the QR's deliberate light exception. Opaque. */}
      <div className="rounded-2xl p-3" style={{ background: "#FFFFFF", border: "1px solid #1b1922" }}>
        <canvas
          ref={canvasRef}
          aria-label={scanLabel}
          role="img"
          data-testid="share-qr-canvas"
          style={{ width: size, height: size, display: "block", imageRendering: "crisp-edges" }}
        />
      </div>
      <p className="text-[11px] font-semibold text-white text-center leading-snug" style={{ maxWidth: 240 }}>
        {scanLabel}
      </p>
      <button
        type="button"
        onClick={download}
        disabled={error}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-40"
        style={{ color: accent, border: `1.5px solid ${accent}`, background: "transparent" }}
        data-testid="share-qr-download"
      >
        <Download className="w-3.5 h-3.5" />
        {downloadLabel}
      </button>
      {error && (
        <p className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: "#FFB7E5" }}>
          <QrIcon className="w-3.5 h-3.5" />
          QR unavailable
        </p>
      )}
    </div>
  );
}
