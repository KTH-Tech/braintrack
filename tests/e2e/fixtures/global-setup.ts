import { request as pw } from "@playwright/test";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const TOKENS_FILE = path.join("/tmp", "bt-test-tokens.json");
const NONCE_FILE = "/tmp/bt-test-nonce";

export default async function globalSetup() {
  const BASE = process.env.BASE_URL || "http://localhost:5000";

  const nonce = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(NONCE_FILE, nonce, { encoding: "utf-8" });

  const ctx = await pw.newContext({ baseURL: BASE });
  const res = await ctx.post("/api/test/setup", {
    headers: { "X-Test-Harness-Secret": nonce },
  });
  const body = await res.text();
  await ctx.dispose();

  if (!res.ok()) {
    throw new Error(`Test setup endpoint failed (${res.status()}): ${body}`);
  }

  const data = JSON.parse(body);
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(data));
}
