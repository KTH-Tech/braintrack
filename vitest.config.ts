import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    // Several suites import server/routes.ts inside beforeAll to exercise the
    // real route wiring. That file is ~18k lines and a cold transform can
    // exceed the 10s default, so the same suite fails one run and passes the
    // next untouched. A flaky suite gets ignored, and an ignored suite protects
    // nothing — these are the payment-webhook and rate-limiter tests.
    hookTimeout: 60000,
    testTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./shared"),
      "@server": path.resolve(__dirname, "./server"),
      "@client": path.resolve(__dirname, "./client/src"),
    },
  },
});
