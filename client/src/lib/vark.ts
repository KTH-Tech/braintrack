export type VarkStyle = "visual" | "auditory" | "read" | "kinesthetic";

export const VARK_STYLES: Record<VarkStyle, {
  label: string;
  labelAf: string;
  icon: string;
  tagline: string;
  taglineAf: string;
  color: string;
  contentOrder: string[];
  ctaIcons: string[];
  ctaLabels: string[];
  ctaLabelsAf: string[];
}> = {
  visual: {
    label: "Visual",
    labelAf: "Visueel",
    icon: "👁",
    tagline: "See diagrams",
    taglineAf: "Sien diagramme",
    color: "blue",
    contentOrder: ["diagram", "summary", "quiz"],
    ctaIcons: ["👁", "📊", "✏", "🔊"],
    ctaLabels: ["View Map", "See Patterns", "Start Quiz", "Ask Rizz"],
    ctaLabelsAf: ["Kyk Kaart", "Sien Patrone", "Begin Toets", "Vra Rizz"],
  },
  auditory: {
    label: "Auditory",
    labelAf: "Ouditief",
    icon: "🔊",
    tagline: "Listen & explain",
    taglineAf: "Luister & verduidelik",
    color: "cyan",
    contentOrder: ["explain", "discuss", "quiz"],
    ctaIcons: ["🔊", "💬", "✏", "📊"],
    ctaLabels: ["Ask Rizz", "Discuss", "Start Quiz", "View Stats"],
    ctaLabelsAf: ["Vra Rizz", "Bespreek", "Begin Toets", "Sien Statistieke"],
  },
  read: {
    label: "Read",
    labelAf: "Lees",
    icon: "📖",
    tagline: "Read & notes",
    taglineAf: "Lees & notas",
    color: "cyan",
    contentOrder: ["notes", "summary", "quiz"],
    ctaIcons: ["📖", "📝", "✏", "📊"],
    ctaLabels: ["Study Notes", "Summaries", "Start Quiz", "View Stats"],
    ctaLabelsAf: ["Studienotas", "Opsommings", "Begin Toets", "Sien Statistieke"],
  },
  kinesthetic: {
    label: "Practice",
    labelAf: "Oefen",
    icon: "✏",
    tagline: "Learn by doing",
    taglineAf: "Leer deur te doen",
    color: "amber",
    contentOrder: ["quiz", "feedback", "explain"],
    ctaIcons: ["✏", "⚡", "📊", "🔊"],
    ctaLabels: ["Start Quiz", "Practice", "View Stats", "Ask Rizz"],
    ctaLabelsAf: ["Begin Toets", "Oefen", "Sien Statistieke", "Vra Rizz"],
  },
};

export const SUBJECT_ICONS: Record<string, string> = {
  "Mathematics": "📊",
  "Mathematical Literacy": "📐",
  "Technical Mathematics": "📐",
  "Physical Sciences": "🧪",
  "Life Sciences": "🌿",
  "Accounting": "📈",
  "Business Studies": "💼",
  "Economics": "💰",
  "Geography": "🌍",
  "History": "📜",
  "Afrikaans Home Language": "💬",
  "Afrikaans First Additional Language": "💬",
  "English Home Language": "📝",
  "English First Additional Language": "📝",
  "Information Technology": "💻",
  "Computer Applications Technology": "🖥",
  "Tourism": "✈",
  "Agricultural Sciences": "🌾",
  "Visual Arts": "🎨",
  "Music": "🎵",
  "Dramatic Arts": "🎭",
  "Life Orientation": "🧭",
  "Religion Studies": "🕊",
  "Engineering Graphics and Design": "📐",
  "Civil Technology": "🏗",
  "Electrical Technology": "⚡",
  "Mechanical Technology": "⚙",
  "Digital Technology": "💻",
};

export const STATUS_ICONS: Record<string, string> = {
  complete: "✅",
  pending: "⏳",
  action: "⚠",
  blocked: "❌",
  restricted: "🔒",
  streak: "🔥",
  achievement: "🏆",
};

export const ADMIN_ICONS: Record<string, string> = {
  schools: "🏫",
  users: "👥",
  analytics: "📊",
  settings: "⚙",
  action: "⚠",
  onboarding: "🚀",
};

export function getSubjectIcon(name: string): string {
  return SUBJECT_ICONS[name] || "📚";
}

export function getContentOrder(style: VarkStyle): string[] {
  return VARK_STYLES[style]?.contentOrder || ["summary", "quiz", "explain"];
}

export function getPrimaryCTAs(style: VarkStyle, isAf = false): Array<{ icon: string; label: string }> {
  const info = VARK_STYLES[style];
  if (!info) return [];
  return info.ctaIcons.map((icon, i) => ({
    icon,
    label: isAf ? info.ctaLabelsAf[i] : info.ctaLabels[i],
  }));
}

export function mapLearningStyleToVark(style: string): VarkStyle {
  switch (style) {
    case "visual": return "visual";
    case "auditory": return "auditory";
    case "reading": return "read";
    case "kinesthetic": return "kinesthetic";
    default: return "kinesthetic";
  }
}
