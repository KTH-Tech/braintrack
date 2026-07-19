// Capture full-page screenshots of every role surface on production for the
// design-review PDF. Uses system Edge (repo Chromium is policy-blocked).
import { chromium } from "playwright";
import fs from "fs";

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const BASE = "https://braintrack-api.onrender.com";
const OUT = "C:/dev/design-shots";
fs.mkdirSync(OUT, { recursive: true });

const CREDS = {
  learner: { email: "test.learner@braintrack.tech", password: process.env.LPW },
  parent: { email: "test.parent@braintrack.tech", password: process.env.PPW },
  admin: { email: "karlit@kth-tech.com", password: process.env.APW },
};

const SHOTS = [
  { name: "01-landing", path: "/", role: null },
  { name: "02-signin", path: "/signin", role: null },
  { name: "03-learner-dashboard", path: "/dashboard", role: "learner" },
  { name: "04-learner-subjects", path: "/subjects", role: "learner" },
  { name: "05-learner-studyplan", path: "/study-calendar", role: "learner" },
  { name: "06-learner-tutor", path: "/tutor", role: "learner" },
  { name: "07-parent-dashboard", path: "/parent", role: "parent" },
  { name: "08-admin-dashboard", path: "/learn/admin", role: "admin" },
  { name: "09-admin-dbe-portal", path: "/learn/admin/dbe-portal", role: "admin" },
];

const browser = await chromium.launch({ executablePath: EDGE, headless: true });

async function loginContext(role) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  if (role) {
    const page = await ctx.newPage();
    const res = await page.request.post(`${BASE}/api/auth/login`, {
      data: CREDS[role],
    });
    if (!res.ok()) throw new Error(`${role} login failed: ${res.status()}`);
    await page.close();
  }
  return ctx;
}

const contexts = {};
for (const shot of SHOTS) {
  const key = shot.role ?? "public";
  contexts[key] ??= await loginContext(shot.role);
  const page = await contexts[key].newPage();
  try {
    await page.goto(`${BASE}${shot.path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(6000); // let data queries + reveals settle
    // dismiss cookie banner if present
    const decline = page.locator('button:has-text("Decline")');
    if (await decline.count()) await decline.first().click().catch(() => {});
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: true });
    console.log("captured", shot.name);
  } catch (e) {
    console.log("FAILED", shot.name, e.message?.slice(0, 100));
  }
  await page.close();
}
await browser.close();
console.log("done");
