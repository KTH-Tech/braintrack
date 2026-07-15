import {
  BookOpen,
  Sigma,
  Calculator,
  FlaskConical,
  Leaf,
  Globe2,
  Coins,
  Briefcase,
  ScrollText,
  MessageSquare,
  PenLine,
  Laptop,
  Cpu,
  Palette,
  Music2,
  Drama,
  Camera,
  Shirt,
  Utensils,
  Hammer,
  Ruler,
  Church,
  HeartHandshake,
  Wrench,
  Zap,
  Building2,
  TreePine,
  Dumbbell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function getSubjectLucide(name: string): LucideIcon {
  const n = (name || "").toLowerCase();
  if (n.includes("mathematical literacy")) return Calculator;
  if (n.includes("technical math")) return Ruler;
  if (n.includes("math")) return Sigma;
  if (n.includes("physical science")) return FlaskConical;
  if (n.includes("life science")) return Leaf;
  if (n.includes("natural science")) return Leaf;
  if (n.includes("accounting")) return Coins;
  if (n.includes("business")) return Briefcase;
  if (n.includes("economics")) return Coins;
  if (n.includes("geography")) return Globe2;
  if (n.includes("history")) return ScrollText;
  if (n.includes("tourism")) return Globe2;
  if (n.includes("afrikaans")) return MessageSquare;
  if (n.includes("english")) return PenLine;
  if (
    n.includes("zulu") ||
    n.includes("xhosa") ||
    n.includes("sotho") ||
    n.includes("tswana") ||
    n.includes("venda") ||
    n.includes("tsonga") ||
    n.includes("ndebele") ||
    n.includes("swati") ||
    n.includes("sepedi") ||
    n.includes("pedi")
  )
    return MessageSquare;
  if (n.includes("information technology")) return Laptop;
  if (n.includes("computer applications") || /\bcat\b/.test(n)) return Cpu;
  if (n.includes("visual art")) return Palette;
  if (n.includes("design")) return Palette;
  if (n.includes("music")) return Music2;
  if (n.includes("dramatic") || n.includes("drama")) return Drama;
  if (n.includes("dance")) return Drama;
  if (n.includes("consumer")) return Utensils;
  if (n.includes("hospitality")) return Utensils;
  if (n.includes("engineering graphic") || n.includes("egd")) return Hammer;
  if (n.includes("mechanical technology")) return Wrench;
  if (n.includes("electrical technology")) return Zap;
  if (n.includes("civil technology")) return Building2;
  if (n.includes("agricultural")) return TreePine;
  if (n.includes("religion")) return Church;
  if (n.includes("life orientation")) return HeartHandshake;
  if (n.includes("physical education") || n.includes("sport")) return Dumbbell;
  if (n.includes("fashion") || n.includes("textile")) return Shirt;
  if (n.includes("media") || n.includes("photograph")) return Camera;
  return BookOpen;
}

export const SUBJECT_RAINBOW = [
  "#FF8A00",
  "#FF8A00",
  "#FFE600",
  "#FFE600",
  "#00E5FF",
  "#006BFF",
  "#8A2BFF",
  "#8A2BFF",
  "#FF2BD6",
];

export function getSubjectHex(seed: string | number | undefined | null): string {
  const s = String(seed ?? "");
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return SUBJECT_RAINBOW[hash % SUBJECT_RAINBOW.length];
}
