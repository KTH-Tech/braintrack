import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifyNetcashSignature, type NetcashConfig } from "../../server/netcash";

const cfg: NetcashConfig = {
  serviceKey: "svc",
  softwareVendorKey: "vendor",
  webhookSecret: "shhh-this-is-secret",
  env: "sandbox",
};

function sign(body: string | Buffer, secret = cfg.webhookSecret): string {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
  return createHmac("sha256", secret).update(buf).digest("hex");
}

describe("verifyNetcashSignature", () => {
  const body = JSON.stringify({ Reference: "bt-card-abc-xyz", TransactionAccepted: "true" });

  it("accepts a valid HMAC-SHA256 signature", () => {
    const sig = sign(body);
    expect(verifyNetcashSignature(cfg, body, sig)).toBe(true);
  });

  it("accepts a valid signature when the body is provided as a Buffer", () => {
    const buf = Buffer.from(body);
    const sig = sign(buf);
    expect(verifyNetcashSignature(cfg, buf, sig)).toBe(true);
  });

  it("accepts a signature with surrounding whitespace and mixed case", () => {
    const sig = sign(body);
    const padded = `   ${sig.toUpperCase()}   `;
    expect(verifyNetcashSignature(cfg, body, padded)).toBe(true);
  });

  it("rejects a signature computed with a different secret", () => {
    const wrong = sign(body, "not-the-real-secret");
    expect(verifyNetcashSignature(cfg, body, wrong)).toBe(false);
  });

  it("rejects a signature when the body has been tampered with", () => {
    const sig = sign(body);
    const tampered = body.replace("true", "false");
    expect(verifyNetcashSignature(cfg, tampered, sig)).toBe(false);
  });

  it("rejects when the signature is undefined", () => {
    expect(verifyNetcashSignature(cfg, body, undefined)).toBe(false);
  });

  it("rejects when the signature is an empty string", () => {
    expect(verifyNetcashSignature(cfg, body, "")).toBe(false);
  });

  it("rejects a signature of the wrong length (no timing-safe crash)", () => {
    expect(verifyNetcashSignature(cfg, body, "deadbeef")).toBe(false);
  });

  it("rejects a malformed non-hex signature of the same length", () => {
    const sig = sign(body);
    const garbage = "z".repeat(sig.length);
    expect(verifyNetcashSignature(cfg, body, garbage)).toBe(false);
  });
});
