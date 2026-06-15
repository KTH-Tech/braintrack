import { useLanguage } from "@/lib/language-context";

export type AppLanguage = "en" | "af";

export function localeFor(language: AppLanguage | string | undefined): string {
  return language === "af" ? "af-ZA" : "en-ZA";
}

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(
  value: Date | string | number,
  language: AppLanguage | string | undefined,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  const d = toDate(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(localeFor(language), options);
}

export function formatTime(
  value: Date | string | number,
  language: AppLanguage | string | undefined,
  options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" },
): string {
  const d = toDate(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(localeFor(language), options);
}

export function formatDateTime(
  value: Date | string | number,
  language: AppLanguage | string | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: "short", timeStyle: "short" },
): string {
  const d = toDate(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString(localeFor(language), options);
}

export function formatNumber(
  value: number,
  language: AppLanguage | string | undefined,
  options: Intl.NumberFormatOptions = {},
): string {
  if (typeof value !== "number" || !isFinite(value)) return String(value ?? "");
  return value.toLocaleString(localeFor(language), options);
}

export function formatCurrency(
  value: number,
  language: AppLanguage | string | undefined,
  options: Intl.NumberFormatOptions = {},
): string {
  if (typeof value !== "number" || !isFinite(value)) return String(value ?? "");
  return value.toLocaleString(localeFor(language), {
    style: "currency",
    currency: "ZAR",
    currencyDisplay: "symbol",
    maximumFractionDigits: 0,
    ...options,
  });
}

export function useFormatters() {
  const { language } = useLanguage();
  const locale = localeFor(language);
  return {
    language,
    locale,
    formatDate: (v: Date | string | number, o?: Intl.DateTimeFormatOptions) =>
      formatDate(v, language, o),
    formatTime: (v: Date | string | number, o?: Intl.DateTimeFormatOptions) =>
      formatTime(v, language, o),
    formatDateTime: (v: Date | string | number, o?: Intl.DateTimeFormatOptions) =>
      formatDateTime(v, language, o),
    formatNumber: (v: number, o?: Intl.NumberFormatOptions) =>
      formatNumber(v, language, o),
    formatCurrency: (v: number, o?: Intl.NumberFormatOptions) =>
      formatCurrency(v, language, o),
  };
}
