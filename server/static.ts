import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Hashed assets (JS, CSS bundles) — immutable, cache for 1 year
  app.use(
    "/assets",
    express.static(path.join(distPath, "assets"), {
      maxAge: "1y",
      immutable: true,
    })
  );

  // Service worker must not be cached — browsers need the latest copy every visit
  app.use("/sw.js", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });

  // Static public files with sensible cache durations
  app.use(
    express.static(distPath, {
      maxAge: 0,
      setHeaders: (res, filePath) => {
        const f = filePath.toLowerCase();

        if (f.endsWith(".html")) {
          // HTML — never cache so deploys take effect immediately
          res.setHeader("Cache-Control", "no-cache, must-revalidate");
        } else if (f.endsWith("sw.js")) {
          // Service worker — no cache (handled above but belt-and-suspenders)
          res.setHeader("Cache-Control", "no-store");
        } else if (
          f.endsWith(".png") ||
          f.endsWith(".jpg") ||
          f.endsWith(".jpeg") ||
          f.endsWith(".webp") ||
          f.endsWith(".svg") ||
          f.endsWith(".ico") ||
          f.endsWith(".gif")
        ) {
          // Icons and images — cache for 30 days (no content hash so keep short)
          res.setHeader("Cache-Control", "public, max-age=2592000, stale-while-revalidate=86400");
        } else if (f.endsWith("manifest.json")) {
          // PWA manifest — cache for 1 day
          res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
        } else if (f.endsWith("robots.txt") || f.endsWith("sitemap.xml")) {
          // Crawl files — cache for 1 day
          res.setHeader("Cache-Control", "public, max-age=86400");
        } else if (f.endsWith(".woff") || f.endsWith(".woff2") || f.endsWith(".ttf")) {
          // Self-hosted fonts — cache for 1 year
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          // Everything else — short cache
          res.setHeader("Cache-Control", "public, max-age=3600");
        }
      },
    })
  );

  app.get("/{*path}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
