import { useEffect } from "react";

// ── Site-wide SA-focused defaults ──────────────────────────────────────────
// Every learner-facing page inherits these unless explicitly overridden. They
// carry the geo signals search engines use to surface us as a South African
// Grade 12 study platform (not a generic global edtech).
const SITE_ORIGIN = "https://braintrack.co.za";
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;
const SITE_LOCALE = "en_ZA";
const GEO_REGION = "ZA";
const GEO_PLACENAME = "South Africa";
const GEO_POSITION = "-30.5595;22.9375";        // Country centroid
const ICBM = "-30.5595, 22.9375";

// Site-wide EducationalOrganization JSON-LD, attached once on <html> so search
// engines see BrainTrack as an SA-based Grade-12 platform. Rendered on every
// page via useSEO's site-graph slot alongside the page-specific jsonLd.
const SITE_JSONLD: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "BrainTrack",
  alternateName: "BrainTrack™",
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/icon-512.png`,
  email: "learn@kth-tech.com",
  areaServed: {
    "@type": "Country",
    name: "South Africa",
    alternateName: "ZA",
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "ZA",
    addressRegion: "Gauteng",
  },
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "Grade 12 matriculant",
    audienceType: "Grade 12 learners in South Africa",
  },
  educationalCredentialAwarded: "NSC (National Senior Certificate)",
  parentOrganization: {
    "@type": "Organization",
    name: "KTH Projects (Pty) Ltd t/a KTH-Tech",
    identifier: "2025/627290/07",
  },
  offers: {
    "@type": "Offer",
    price: "169.00",
    priceCurrency: "ZAR",
    category: "Education/Study Platform",
    availability: "https://schema.org/InStock",
    eligibleRegion: { "@type": "Country", name: "South Africa" },
  },
  inLanguage: ["en-ZA", "af-ZA"],
};

interface SEOOptions {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: "summary" | "summary_large_image";
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Overrides the default en-ZA locale (e.g. "af_ZA" for Afrikaans pages). */
  locale?: string;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string, hreflang?: string) {
  const sel = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.querySelector(sel) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(id: string, data: Record<string, unknown> | Record<string, unknown>[]) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.setAttribute("type", "application/ld+json");
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeById(id: string) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

export function useSEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  ogUrl,
  twitterCard = "summary_large_image",
  noIndex = false,
  jsonLd,
  locale = SITE_LOCALE,
}: SEOOptions) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    setMeta("description", description);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");

    // ── Geo signals (SA) — surface us to local search + Google Business ────
    setMeta("geo.region", GEO_REGION);
    setMeta("geo.placename", GEO_PLACENAME);
    setMeta("geo.position", GEO_POSITION);
    setMeta("ICBM", ICBM);

    // Open Graph
    setMeta("og:title", ogTitle ?? title, "property");
    setMeta("og:description", ogDescription ?? description, "property");
    setMeta("og:image", ogImage, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:site_name", "BrainTrack", "property");
    setMeta("og:locale", locale, "property");
    setMeta("og:locale:alternate", locale === "af_ZA" ? "en_ZA" : "af_ZA", "property");
    if (ogUrl ?? canonical) setMeta("og:url", (ogUrl ?? canonical)!, "property");

    // Canonical + hreflang for en-ZA / af-ZA
    if (canonical) {
      setLink("canonical", canonical);
      setLink("alternate", canonical, "en-ZA");
      setLink("alternate", canonical, "af-ZA");
      setLink("alternate", canonical, "x-default");
    }

    // Twitter
    setMeta("twitter:card", twitterCard, "name");
    setMeta("twitter:title", ogTitle ?? title, "name");
    setMeta("twitter:description", ogDescription ?? description, "name");
    setMeta("twitter:image", ogImage, "name");

    // JSON-LD: site-wide EducationalOrganization graph is always present, and
    // the page-specific graph (if any) is attached separately so page unmount
    // never wipes the site graph.
    setJsonLd("seo-jsonld-site", SITE_JSONLD);
    if (jsonLd) setJsonLd("seo-jsonld-page", jsonLd);

    return () => {
      document.title = prevTitle;
      removeById("seo-jsonld-page");
    };
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, ogType, ogUrl, twitterCard, noIndex, jsonLd, locale]);
}
