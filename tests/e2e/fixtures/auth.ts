import fs from "fs";
import { TOKENS_FILE } from "./global-setup";

export interface TestTokens {
  learnerToken: string;
  parentToken: string;
  adminToken: string;
  learnerId: string;
  parentId: string;
  adminId: string;
  linkToken: string;
}

let _cache: TestTokens | null = null;

export function getTestTokens(): TestTokens {
  if (_cache) return _cache;
  if (!fs.existsSync(TOKENS_FILE)) {
    throw new Error(
      `Test token file not found at ${TOKENS_FILE}. ` +
        "Run globalSetup or ensure the server is up and /api/test/setup succeeded."
    );
  }
  _cache = JSON.parse(fs.readFileSync(TOKENS_FILE, "utf-8")) as TestTokens;
  return _cache;
}

export function learnerAuthHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getTestTokens().learnerToken}` };
}

export function parentAuthHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getTestTokens().parentToken}` };
}

export function adminAuthHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getTestTokens().adminToken}` };
}
