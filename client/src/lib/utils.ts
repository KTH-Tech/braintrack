import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Auto-format a user-entered phone number into South African E.164 display
// form `+27 XX XXX XXXX`. Strips non-digits, handles leading `0`, `27`, or
// `+27`, and progressively spaces the digits so input feels effortless.
export function formatSAPhone(raw: string): string {
  if (!raw) return "";
  // Keep only digits
  let digits = raw.replace(/\D+/g, "");
  // Normalize to country-code form
  if (digits.startsWith("27")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  // Cap at 9 local digits (SA numbers are 9 digits after the 0/+27)
  digits = digits.slice(0, 9);
  if (digits.length === 0) return "+27 ";
  let out = "+27 ";
  out += digits.slice(0, 2);
  if (digits.length > 2) out += " " + digits.slice(2, 5);
  if (digits.length > 5) out += " " + digits.slice(5, 9);
  return out;
}
