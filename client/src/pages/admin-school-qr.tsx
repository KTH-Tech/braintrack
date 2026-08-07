import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { AdminTopNav } from "@/components/admin-top-nav";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/hooks/use-toast";
import { Download, Copy, Printer, CheckCircle2, Loader2, QrCode, Plus, X } from "lucide-react";

type Partner = {
  id: number;
  schoolName: string;
  schoolCode: string;
  isActive: boolean;
  totalReferrals: number;
};

const NEON = "#9FF5E8";

function hexToRgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function PartnerQRCard({ partner, baseUrl }: { partner: Partner; baseUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const url = `${baseUrl}/join/${partner.schoolCode}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 220,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).catch(console.error);
  }, [url]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `BrainTrack-QR-${partner.schoolCode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: url, variant: "destructive" });
    }
  }

  return (
    <div
      className="qr-card flex flex-col items-center rounded-2xl p-6 gap-4"
      style={{
        background: "#0a0a0a",
        border: `1px solid ${hexToRgba(NEON, 0.22)}`,
      }}
    >
      {/* Partner name */}
      <div className="w-full text-center">
        <p className="font-bold text-white text-base leading-snug">{partner.schoolName}</p>
        <p className="text-[11px] mt-1 font-mono" style={{ color: hexToRgba(NEON, 0.65) }}>
          /join/{partner.schoolCode}
        </p>
      </div>

      {/* QR canvas */}
      <div className="rounded-xl overflow-hidden p-3 print-qr" style={{ background: "#ffffff" }}>
        <canvas ref={canvasRef} width={220} height={220} aria-label={`QR code for ${partner.schoolName}`} />
      </div>

      {/* Code badge */}
      <div
        className="px-3 py-1 rounded-full text-[12px] font-mono font-bold tracking-widest uppercase"
        style={{ background: hexToRgba(NEON, 0.08), color: NEON, border: `1px solid ${hexToRgba(NEON, 0.2)}` }}
      >
        {partner.schoolCode}
      </div>

      {/* Referral count */}
      <p className="text-[11px] text-white">
        {partner.totalReferrals} learner{partner.totalReferrals !== 1 ? "s" : ""} joined
      </p>

      {/* Actions */}
      <div className="flex gap-2 w-full no-print">
        <button
          onClick={download}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: hexToRgba(NEON, 0.1), color: NEON, border: `1px solid ${hexToRgba(NEON, 0.25)}` }}
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
        <button
          onClick={copyLink}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: hexToRgba("#C5B3FF", 0.1), color: "#C5B3FF", border: `1px solid ${hexToRgba("#C5B3FF", 0.25)}` }}
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

function AddPartnerForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/partner-schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          schoolName: name.trim(),
          schoolCode: code.trim().toUpperCase(),
          isActive: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create partner");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner-schools"] });
      toast({ title: "Partner added" });
      onClose();
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const codeSlug = code || name.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 8);

  return (
    <div
      className="rounded-2xl p-5 mb-8"
      style={{ background: "#0a0a0a", border: `1px solid ${hexToRgba(NEON, 0.3)}` }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">New partner</p>
        <button onClick={onClose} className="text-white hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Partner name (e.g. D6 Education)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-xl bg-[#0e0d12] text-sm text-white placeholder:text-white focus:outline-none"
          style={{ border: `1px solid ${hexToRgba(NEON, 0.2)}` }}
        />
        <input
          type="text"
          placeholder="Code (e.g. D6)"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^a-z0-9]/gi, "").toUpperCase())}
          className="w-full sm:w-36 px-3 py-2.5 rounded-xl bg-[#0e0d12] text-sm text-white font-mono uppercase placeholder:text-white focus:outline-none"
          style={{ border: `1px solid ${hexToRgba(NEON, 0.2)}` }}
          maxLength={20}
        />
        <Button
          onClick={() => mutation.mutate()}
          disabled={!name.trim() || mutation.isPending}
          variant="primary"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
        </Button>
      </div>
      {(code || name) && (
        <p className="text-[11px] mt-3 font-mono" style={{ color: hexToRgba(NEON, 0.5) }}>
          QR will link to: /join/{code || codeSlug}
        </p>
      )}
    </div>
  );
}

export default function AdminSchoolQRPage() {
  const { language } = useLanguage();
  const isAf = language === "af";
  const [showAdd, setShowAdd] = useState(false);
  const baseUrl = window.location.origin;

  const { data: all = [], isLoading } = useQuery<Partner[]>({
    queryKey: ["/api/partner-schools"],
    queryFn: async () => {
      const res = await fetch("/api/partner-schools", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load partners");
      return res.json();
    },
  });

  // One QR per partner: show only root-level codes (no hyphen = partner channel, not individual school)
  const partners = all.filter((p) => p.isActive && !p.schoolCode.includes("-"));

  return (
    <>
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .qr-card {
            border: 1px solid #050508 !important;
            box-shadow: none !important;
            background: white !important;
            page-break-inside: avoid;
          }
          .qr-card p, .qr-card span { color: #050508 !important; }
        }
      `}</style>

      <div className="min-h-screen text-white" style={{ background: "#050508", fontFamily: "'Poppins', system-ui, sans-serif" }}>
        <AdminTopNav current="schools" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: hexToRgba(NEON, 0.1), border: `1px solid ${hexToRgba(NEON, 0.25)}` }}
              >
                <QrCode className="w-5 h-5" style={{ color: NEON }} />
              </div>
              <div>
                <div role="heading" aria-level={1} className="text-xl font-bold text-white">
                  {isAf ? "Vennoot QR-kodes" : "Partner QR Codes"}
                </div>
                <p className="text-sm text-white">
                  {partners.length} {isAf ? "aktiewe vennote" : "active partners"}
                </p>
              </div>
            </div>

            <div className="no-print flex gap-2">
              <button
                onClick={() => setShowAdd((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: hexToRgba(NEON, 0.1), color: NEON, border: `1px solid ${hexToRgba(NEON, 0.25)}` }}
              >
                <Plus className="w-4 h-4" />
                {isAf ? "Nuwe vennoot" : "New partner"}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: hexToRgba("#FFE29A", 0.1), color: "#FFE29A", border: `1px solid ${hexToRgba("#FFE29A", 0.25)}` }}
              >
                <Printer className="w-4 h-4" />
                {isAf ? "Druk alles" : "Print all"}
              </button>
            </div>
          </div>

          {/* Add partner form */}
          {showAdd && <AddPartnerForm onClose={() => setShowAdd(false)} />}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: NEON }} />
            </div>
          )}

          {/* Empty */}
          {!isLoading && partners.length === 0 && (
            <div className="text-center py-20">
              <QrCode className="w-10 h-10 mx-auto mb-3 text-white" />
              <p className="text-white text-sm mb-4">
                {isAf ? "Geen vennote gevind nie" : "No partners yet"}
              </p>
              <Button
                onClick={() => setShowAdd(true)}
                variant="primary"
                className="no-print"
              >
                <Plus className="w-4 h-4" />
                {isAf ? "Voeg eerste vennoot by" : "Add first partner"}
              </Button>
            </div>
          )}

          {/* Partner grid */}
          {partners.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <PartnerQRCard key={partner.id} partner={partner} baseUrl={baseUrl} />
              ))}
            </div>
          )}

          {/* URL note */}
          {!isLoading && partners.length > 0 && (
            <p className="no-print text-center text-[11px] text-white mt-10">
              {isAf
                ? `Leerders sluit aan via ${baseUrl}/join/CODE`
                : `Learners join at ${baseUrl}/join/CODE`}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
