/**
 * Unit tests for the admin-only onboarding preview gate
 * (client/src/lib/onboarding-preview.ts).
 *
 * The contract under test: with preview active, NO write request can reach
 * the network — enforced centrally by (1) the gate that wraps every
 * mutationFn and (2) the fetch tripwire that blocks writes to /api/*.
 */
import { describe, it, expect, vi } from "vitest";
import {
  isOnboardingPreview,
  isWriteMethod,
  isApiUrl,
  createPreviewGate,
  installPreviewWriteTripwire,
  resolveRequestMethod,
  resolveRequestUrl,
  PreviewWriteBlockedError,
  ONBOARDING_PREVIEW_SAMPLE,
} from "../../client/src/lib/onboarding-preview";

describe("isOnboardingPreview", () => {
  it("is true only for an admin with ?preview=1", () => {
    expect(isOnboardingPreview("admin", "?preview=1")).toBe(true);
    expect(isOnboardingPreview("admin", "?foo=bar&preview=1")).toBe(true);
  });

  it("is false for admins without the flag or with the wrong value", () => {
    expect(isOnboardingPreview("admin", "")).toBe(false);
    expect(isOnboardingPreview("admin", "?preview=0")).toBe(false);
    expect(isOnboardingPreview("admin", "?preview=true")).toBe(false);
  });

  it("is false for every non-admin role even with the flag (they get the normal flow)", () => {
    expect(isOnboardingPreview("learner", "?preview=1")).toBe(false);
    expect(isOnboardingPreview("parent", "?preview=1")).toBe(false);
    expect(isOnboardingPreview(undefined, "?preview=1")).toBe(false);
    expect(isOnboardingPreview(null, "?preview=1")).toBe(false);
  });
});

describe("isWriteMethod", () => {
  it("treats GET/HEAD/OPTIONS as reads, everything else as writes", () => {
    expect(isWriteMethod("GET")).toBe(false);
    expect(isWriteMethod("get")).toBe(false);
    expect(isWriteMethod("HEAD")).toBe(false);
    expect(isWriteMethod("OPTIONS")).toBe(false);
    expect(isWriteMethod("POST")).toBe(true);
    expect(isWriteMethod("put")).toBe(true);
    expect(isWriteMethod("PATCH")).toBe(true);
    expect(isWriteMethod("DELETE")).toBe(true);
  });

  it("defaults a missing method to GET (a read)", () => {
    expect(isWriteMethod(undefined)).toBe(false);
    expect(isWriteMethod(null)).toBe(false);
  });
});

describe("isApiUrl", () => {
  it("matches relative and absolute /api paths", () => {
    expect(isApiUrl("/api/onboarding")).toBe(true);
    expect(isApiUrl("/api")).toBe(true);
    expect(isApiUrl("/api/onboarding/parent-consent/request")).toBe(true);
    expect(isApiUrl("https://braintrack.co.za/api/onboarding")).toBe(true);
  });

  it("does not match non-api paths or lookalike prefixes", () => {
    expect(isApiUrl("/apifoo")).toBe(false);
    expect(isApiUrl("/schools/search")).toBe(false);
    expect(isApiUrl("/")).toBe(false);
  });
});

describe("createPreviewGate — the centralised mutation gate", () => {
  it("live (inPreview=false): returns the real function untouched", async () => {
    const real = vi.fn(async (a: number, b: number) => a + b);
    const simulated = vi.fn(() => -1);
    const gate = createPreviewGate(false);
    const wrapped = gate.mutation(real, simulated);

    expect(wrapped).toBe(real);
    await expect(wrapped(2, 3)).resolves.toBe(5);
    expect(real).toHaveBeenCalledTimes(1);
    expect(simulated).not.toHaveBeenCalled();
  });

  it("preview (inPreview=true): the real function is NEVER invoked", async () => {
    const real = vi.fn(async () => {
      throw new Error("real mutation ran in preview — this must never happen");
    });
    const simulated = vi.fn(() => ({ ok: true, source: "simulated" }));
    const gate = createPreviewGate(true);
    const wrapped = gate.mutation(real, simulated, { delayMs: 0 });

    await expect(wrapped()).resolves.toEqual({ ok: true, source: "simulated" });
    expect(real).not.toHaveBeenCalled();
    expect(simulated).toHaveBeenCalledTimes(1);
  });

  it("preview: forwards arguments to the simulated branch", async () => {
    const real = vi.fn(async (_x: string) => "real");
    const simulated = vi.fn((x: string) => `sim:${x}`);
    const wrapped = createPreviewGate(true).mutation(real, simulated, { delayMs: 0 });

    await expect(wrapped("abc")).resolves.toBe("sim:abc");
    expect(simulated).toHaveBeenCalledWith("abc");
    expect(real).not.toHaveBeenCalled();
  });

  it("preview: waits delayMs before resolving so pending UI can render", async () => {
    vi.useFakeTimers();
    try {
      const wrapped = createPreviewGate(true).mutation(
        async () => "real",
        () => "sim",
        { delayMs: 500 },
      );
      let settled = false;
      const p = wrapped().then((v) => {
        settled = true;
        return v;
      });
      await vi.advanceTimersByTimeAsync(499);
      expect(settled).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      await expect(p).resolves.toBe("sim");
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("resolveRequestMethod / resolveRequestUrl", () => {
  it("reads the method from init, then from a Request-like input, then defaults to GET", () => {
    expect(resolveRequestMethod("/api/x", { method: "post" })).toBe("POST");
    expect(resolveRequestMethod({ url: "/api/x", method: "patch" })).toBe("PATCH");
    expect(resolveRequestMethod("/api/x")).toBe("GET");
    // init wins over the Request object, matching fetch() semantics.
    expect(resolveRequestMethod({ url: "/api/x", method: "GET" }, { method: "DELETE" })).toBe("DELETE");
  });

  it("reads the url from strings, Request-like and URL-like inputs", () => {
    expect(resolveRequestUrl("/api/x")).toBe("/api/x");
    expect(resolveRequestUrl({ url: "/api/y" })).toBe("/api/y");
    expect(resolveRequestUrl({ href: "https://a.test/api/z" })).toBe("https://a.test/api/z");
  });
});

describe("installPreviewWriteTripwire — the fetch backstop", () => {
  function fakeWindow() {
    const calls: Array<{ input: unknown; init: unknown }> = [];
    const win = {
      fetch: vi.fn(async (input: unknown, init?: unknown) => {
        calls.push({ input, init });
        return { ok: true };
      }),
    };
    return { win, calls };
  }

  it("rejects any write to /api/* before the network is touched", async () => {
    const { win, calls } = fakeWindow();
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const uninstall = installPreviewWriteTripwire(win);
      await expect(win.fetch("/api/onboarding", { method: "POST" })).rejects.toBeInstanceOf(
        PreviewWriteBlockedError,
      );
      await expect(
        win.fetch("/api/user/language", { method: "PATCH" }),
      ).rejects.toBeInstanceOf(PreviewWriteBlockedError);
      // Request-object style calls are blocked too.
      await expect(
        win.fetch({ url: "/api/auth/reset-role", method: "POST" }),
      ).rejects.toBeInstanceOf(PreviewWriteBlockedError);
      expect(calls).toHaveLength(0);
      uninstall();
    } finally {
      errSpy.mockRestore();
    }
  });

  it("lets reads through (school search stays live in preview)", async () => {
    const { win, calls } = fakeWindow();
    const uninstall = installPreviewWriteTripwire(win);
    await expect(win.fetch("/api/schools/search?q=hoer")).resolves.toEqual({ ok: true });
    await expect(win.fetch("/api/auth/user", { method: "GET" })).resolves.toEqual({ ok: true });
    expect(calls).toHaveLength(2);
    uninstall();
  });

  it("does not interfere with non-/api requests", async () => {
    const { win, calls } = fakeWindow();
    const uninstall = installPreviewWriteTripwire(win);
    await expect(
      win.fetch("https://static.example/upload", { method: "POST" }),
    ).resolves.toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    uninstall();
  });

  it("uninstall restores the original fetch so writes work again after exit", async () => {
    const { win, calls } = fakeWindow();
    const original = win.fetch;
    const uninstall = installPreviewWriteTripwire(win);
    expect(win.fetch).not.toBe(original);
    uninstall();
    expect(win.fetch).toBe(original);
    await expect(win.fetch("/api/onboarding", { method: "POST" })).resolves.toEqual({ ok: true });
    expect(calls).toHaveLength(1);
  });
});

describe("ONBOARDING_PREVIEW_SAMPLE — seed data used by phase jumping", () => {
  /** Same SA-ID validation the onboarding page applies (13 digits, real
   *  YYMMDD, Luhn check digit) — the seed must pass it or the jumped-to
   *  identity step would render as invalid. */
  function isValidSaIdNumber(raw: string): boolean {
    const id = (raw ?? "").trim();
    if (!/^\d{13}$/.test(id)) return false;
    const month = parseInt(id.slice(2, 4), 10);
    const day = parseInt(id.slice(4, 6), 10);
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    let sum = 0;
    let alternate = false;
    for (let i = id.length - 1; i >= 0; i--) {
      let n = id.charCodeAt(i) - 48;
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  it("sample ID number passes SA-ID validation (Luhn + date)", () => {
    expect(isValidSaIdNumber(ONBOARDING_PREVIEW_SAMPLE.idNumber)).toBe(true);
  });

  it("sample DOB matches the ID number's YYMMDD prefix (page cross-checks them)", () => {
    const s = ONBOARDING_PREVIEW_SAMPLE;
    const yymmdd = s.dobYear.slice(2) + s.dobMonth.padStart(2, "0") + s.dobDay.padStart(2, "0");
    expect(s.idNumber.slice(0, 6)).toBe(yymmdd);
  });

  it("sample values are self-describing as fake", () => {
    expect(ONBOARDING_PREVIEW_SAMPLE.lastName).toContain("SAMPLE");
    expect(ONBOARDING_PREVIEW_SAMPLE.schoolName).toContain("PREVIEW");
    expect(ONBOARDING_PREVIEW_SAMPLE.consentUrl).toContain("preview-sample-token-not-real");
  });

  it("seeds the minimum six subjects the subjects phase requires", () => {
    expect(ONBOARDING_PREVIEW_SAMPLE.subjects.length).toBeGreaterThanOrEqual(6);
    const codes = new Set(ONBOARDING_PREVIEW_SAMPLE.subjects.map((s) => s.code));
    expect(codes.size).toBe(ONBOARDING_PREVIEW_SAMPLE.subjects.length);
  });
});
