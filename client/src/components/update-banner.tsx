import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpdateBannerProps {
  updateAvailable: boolean;
  applyUpdate: () => void;
}

export function UpdateBanner({ updateAvailable, applyUpdate }: UpdateBannerProps) {
  if (!updateAvailable) return null;

  return (
    <div
      role="banner"
      aria-label="App update available"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
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
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            background: "linear-gradient(135deg, rgba(6, 182, 212,0.7) 0%, rgba(59,130,246,0.6) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <RefreshCw size={20} color="#fff" />
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
            New version available
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "0.78rem",
              color:"#ffffff",
            }}
          >
            Tap to update and get the latest improvements
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="shrink-0"
          onClick={applyUpdate}
        >
          Update
        </Button>
      </div>
    </div>
  );
}
