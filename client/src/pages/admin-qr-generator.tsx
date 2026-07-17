// General-purpose QR code generator (admin tool).
// The existing /learn/admin/school-qr page only makes partner-school referral
// codes; this one turns ANY link or text into a branded, downloadable QR.
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode as QrIcon, Link2, Check } from "lucide-react";
import { AdminTopNav } from "@/components/admin-top-nav";
import { GraffitiSplats } from "@/components/graffiti-splats";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";

const PASTEL = ["#6FA8FF", "#7FEFFF", "#93FFB8", "#FFF29E", "#FFC48F", "#FF9FE5", "#C6A4FF"];

// Handy one-tap presets for the links the team shares most.
const PRESETS = [
  { label: "Home", path: "/" },
  { label: "Sign Up", path: "/subscribe" },
  { label: "Past Papers", path: "/past-papers" },
  { label: "Features", path: "/features" },
];

type Size = 256 | 512 | 1024;

export default function AdminQrGeneratorPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  useSEO({
    title: "QR Generator | BrainTrack Admin",
    description: "Generate branded, downloadable BrainTrack QR codes for any link.",
  });

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const [value, setValue] = useState(origin || "https://app.braintrack.co.za");
  const [size, setSize] = useState<Size>(512);
  const [colorIdx, setColorIdx] = useState(1); // pastel cyan
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fg = PASTEL[colorIdx];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const text = value.trim();
    if (!text) {
      setError(isAf ? "Voer 'n skakel of teks in" : "Enter a link or text");
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    setError(null);
    QRCode.toCanvas(
      canvas,
      text,
      {
        width: size,
        margin: 2,
        errorCorrectionLevel: "H", // survives a logo/sticker over the middle
        color: { dark: fg, light: "#0a0a0a" },
      },
      (err) => {
        if (err) setError(isAf ? "Kon nie QR skep nie" : "Could not generate QR");
      },
    );
  }, [value, size, fg, isAf]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas || error) return;
    const slug =
      value
        .replace(/^https?:\/\//, "")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "code";
    const link = document.createElement("a");
    link.download = `BrainTrack-QR-${slug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  const btnPrimary =
    "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40";
  const btnSecondary =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-transform hover:scale-[1.03]";

  return (
    <div className="relative min-h-screen bg-background text-white overflow-hidden">
      <div aria-hidden className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <GraffitiSplats variant="full" opacity={0.9} />
      </div>

      <div className="relative z-10">
        <AdminTopNav />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.1] text-center">
            <span className="callout-hl">{isAf ? "QR-Kodegenerator" : "QR Code Generator"}</span>
          </h1>
          <p className="mt-4 text-center text-sm text-white">
            {isAf
              ? "Verander enige skakel of teks in 'n BrainTrack QR-kode. Laai af as PNG vir plakkate, klasse of vennootskole."
              : "Turn any link or text into a BrainTrack QR code. Download as PNG for posters, classrooms or partner schools."}
          </p>

          <div className="mt-10 grid md:grid-cols-[1fr_auto] gap-10 items-start">
            {/* ── Controls ─────────────────────────────── */}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="qr-value"
                  className="block text-[10px] font-black uppercase tracking-[0.25em] text-white mb-2"
                >
                  {isAf ? "Skakel of teks" : "Link or text"}
                </label>
                <div className="flex gap-2">
                  <input
                    id="qr-value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    data-testid="input-qr-value"
                    placeholder="https://app.braintrack.co.za"
                    className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: "#0a0b12", border: "1.5px solid rgba(127,239,255,0.4)" }}
                  />
                  <button
                    onClick={copyLink}
                    className={btnSecondary}
                    style={{ background: "#000", border: "1.5px solid #7FEFFF", color: "#7FEFFF" }}
                    data-testid="button-qr-copy"
                    aria-label={isAf ? "Kopieer skakel" : "Copy link"}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                    {copied ? (isAf ? "Gekopieer" : "Copied") : (isAf ? "Kopieer" : "Copy")}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-xs font-bold" style={{ color: "#FF9FE5" }} data-testid="text-qr-error">
                    {error}
                  </p>
                )}
              </div>

              {/* Quick presets */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white mb-2">
                  {isAf ? "Vinnige skakels" : "Quick links"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p, i) => (
                    <button
                      key={p.path}
                      onClick={() => setValue(`${origin}${p.path}`)}
                      className={btnSecondary}
                      style={{
                        background: "#000",
                        border: `1.5px solid ${PASTEL[i % PASTEL.length]}`,
                        color: PASTEL[i % PASTEL.length],
                      }}
                      data-testid={`button-qr-preset-${p.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colour */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white mb-2">
                  {isAf ? "Kleur" : "Colour"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {PASTEL.map((c, i) => (
                    <button
                      key={c}
                      onClick={() => setColorIdx(i)}
                      aria-label={`Colour ${i + 1}`}
                      data-testid={`button-qr-color-${i}`}
                      className="w-9 h-9 rounded-xl transition-transform hover:scale-110"
                      style={{
                        background: c,
                        border: colorIdx === i ? "2.5px solid #fff" : "1.5px solid rgba(255,255,255,0.2)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white mb-2">
                  {isAf ? "Grootte" : "Size"}
                </p>
                <div className="flex gap-2">
                  {([256, 512, 1024] as Size[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      data-testid={`button-qr-size-${s}`}
                      className={btnSecondary}
                      style={
                        size === s
                          ? { background: "#7FEFFF", color: "#0a0a0a", border: "1.5px solid #7FEFFF" }
                          : { background: "#000", color: "#7FEFFF", border: "1.5px solid #7FEFFF" }
                      }
                    >
                      {s}px
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={download}
                disabled={!!error}
                className={btnPrimary}
                style={{ background: "#93FFB8", color: "#0a0a0a" }}
                data-testid="button-qr-download"
              >
                <Download className="w-4 h-4" />
                {isAf ? "Laai PNG af" : "Download PNG"}
              </button>
            </div>

            {/* ── Preview ──────────────────────────────── */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="rounded-2xl p-4"
                style={{ background: "#0a0a0a", border: "1.5px solid rgba(127,239,255,0.35)" }}
              >
                <canvas
                  ref={canvasRef}
                  data-testid="canvas-qr"
                  className="block"
                  style={{ width: 240, height: 240, imageRendering: "pixelated" }}
                />
              </div>
              <p className="graffiti-hand text-sm flex items-center gap-1.5" style={{ color: fg }}>
                <QrIcon className="w-4 h-4" />
                {isAf ? "Skandeer om te toets" : "Scan to test"}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
