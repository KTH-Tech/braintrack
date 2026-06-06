import { describe, it, expect } from "vitest";
import { isUnauthorizedError } from "../../client/src/lib/auth-utils";

describe("isUnauthorizedError", () => {
  it("returns true for '401: Unauthorized' prefixed messages", () => {
    const err = new Error("401: Unauthorized - please log in");
    expect(isUnauthorizedError(err)).toBe(true);
  });

  it("returns false for non-401 errors", () => {
    const err = new Error("500: Internal Server Error");
    expect(isUnauthorizedError(err)).toBe(false);
  });

  it("returns false for 403 Forbidden errors", () => {
    const err = new Error("403: Forbidden - insufficient permissions");
    expect(isUnauthorizedError(err)).toBe(false);
  });

  it("returns false for network errors", () => {
    const err = new Error("Failed to fetch");
    expect(isUnauthorizedError(err)).toBe(false);
  });

  it("returns false when message does not start with '401:'", () => {
    const err = new Error("You got 401: Unauthorized");
    expect(isUnauthorizedError(err)).toBe(false);
  });

  it("returns true for exact '401: Unauthorized' match", () => {
    const err = new Error("401: Unauthorized");
    expect(isUnauthorizedError(err)).toBe(true);
  });
});
