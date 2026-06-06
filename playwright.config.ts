import { defineConfig, devices } from "@playwright/test";

const CHROMIUM_EXEC =
  process.env.CHROMIUM_PATH ||
  "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium";

const LAUNCH_OPTS = {
  executablePath: CHROMIUM_EXEC,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
};

export default defineConfig({
  globalSetup: "./tests/e2e/fixtures/global-setup.ts",
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }], ["line"]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:5000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: "page-and-public",
      testMatch: [
        "**/accessibility.spec.ts",
        "**/performance.spec.ts",
        "**/quiz.spec.ts",
        "**/regression.spec.ts",
        "**/exam.spec.ts",
        "**/print.spec.ts",
        "**/layout.spec.ts",
        "**/study-plan.spec.ts",
        "**/study-readiness.spec.ts",
        "**/mindmap.spec.ts",
        "**/school-portal.spec.ts",
        "**/payments.spec.ts",
        "**/subscribe.spec.ts",
      ],
      use: {
        ...devices["Desktop Chrome"],
        extraHTTPHeaders: { "X-Forwarded-For": "10.20.1.1" },
        launchOptions: LAUNCH_OPTS,
      },
    },
    {
      name: "module-flows",
      testMatch: [
        "**/onboarding.spec.ts",
        "**/admin.spec.ts",
        "**/dashboard.spec.ts",
      ],
      use: {
        ...devices["Desktop Chrome"],
        extraHTTPHeaders: { "X-Forwarded-For": "10.20.1.3" },
        launchOptions: LAUNCH_OPTS,
      },
    },
    {
      name: "auth-protected",
      testMatch: [
        "**/audio.spec.ts",
        "**/parent.spec.ts",
        "**/linking.spec.ts",
        "**/gamification.spec.ts",
        "**/ai-notes.spec.ts",
        "**/auth.spec.ts",
        "**/security.spec.ts",
      ],
      use: {
        ...devices["Desktop Chrome"],
        extraHTTPHeaders: { "X-Forwarded-For": "10.20.1.2" },
        launchOptions: LAUNCH_OPTS,
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5000",
    reuseExistingServer: true,
    timeout: 60000,
  },
});
