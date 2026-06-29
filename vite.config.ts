import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

function swCacheVersionPlugin() {
  return {
    name: "sw-cache-version",
    closeBundle() {
      const outDir = path.resolve(import.meta.dirname, "dist/public");
      const swPath = path.join(outDir, "sw.js");
      if (!fs.existsSync(swPath)) return;

      const hasher = crypto.createHash("sha256");

      const assetsDir = path.join(outDir, "assets");
      if (fs.existsSync(assetsDir)) {
        const assetFiles = fs.readdirSync(assetsDir).sort();
        for (const name of assetFiles) {
          hasher.update(name);
        }
      }

      const rootFiles = ["offline.html", "manifest.json", "sw.js"];
      for (const name of rootFiles) {
        const filePath = path.join(outDir, name);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, "utf-8");
          hasher.update(content);
        }
      }

      const hash = hasher.digest("hex").slice(0, 8);
      const version = `braintrack-${hash}`;
      const swContent = fs.readFileSync(swPath, "utf-8");
      const updated = swContent.replace(/__SW_CACHE_VERSION__/g, version);
      fs.writeFileSync(swPath, updated, "utf-8");

      if (updated === swContent) {
        console.warn("[sw-cache-version] WARNING: __SW_CACHE_VERSION__ placeholder was not found in sw.js");
      } else {
        console.log(`[sw-cache-version] Cache version set to: ${version}`);
      }
    },
  };
}

// Dev-only plugin: mocks /api/auth/user + onboarding + subscription so the
// learner portal is accessible locally without a real Replit session.
// Only active when NODE_ENV=development AND REPL_ID is not set (i.e. not on Replit).
function devAuthMockPlugin() {
  const isLocal = process.env.NODE_ENV !== "production" && !process.env.REPL_ID;
  if (!isLocal) return null;

  const MOCK_USER = {
    id: "dev-preview-001",
    email: "dev@braintrack.local",
    firstName: "Dev",
    lastName: "Preview",
    profileImageUrl: null,
    role: "admin",
    schoolId: null,
    theme: "dark",
    preferredLanguage: "en",
    isLocked: false,
    lockReason: null,
    lockedAt: null,
    lockedUntil: null,
    failedLoginAttempts: 0,
    lastLoginAt: new Date().toISOString(),
    selectedSubjects: ["mathematics", "physical-sciences", "life-sciences", "english-home-language"],
    preferencesJson: null,
    phone: null,
    firstTouchSource: "local-dev",
    roleConfirmed: true,
    varkPrimary: "visual",
    varkSecondary: "reading",
    varkConfidence: null,
    parentEmail: null,
    parentConsentGranted: true,
    parentConsentRequestedAt: null,
    parentConsentGrantedAt: null,
    schoolName: "BrainTrack Dev School",
    grade: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    name: "dev-auth-mock",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const json = (data: unknown) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
        };

        if (req.url === "/api/auth/user") return json(MOCK_USER);
        if (req.url === "/api/user/onboarding-status") return json(true);
        if (req.url === "/api/user/subscription-status") {
          return json({ active: true, status: "active", trialEndsAt: null });
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    swCacheVersionPlugin(),
    devAuthMockPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core — smallest possible initial chunk
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor-react";
          }
          // Routing + data fetching
          if (id.includes("node_modules/wouter") || id.includes("node_modules/@tanstack/react-query")) {
            return "vendor-router";
          }
          // Radix UI primitives (large — split out)
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }
          // Lucide icons (large — split out)
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          // Socket.io client
          if (id.includes("node_modules/socket.io-client") || id.includes("node_modules/engine.io-client")) {
            return "vendor-socket";
          }
          // Everything else from node_modules
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
