import { useEffect } from "react";

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

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

function setJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  const id = "seo-jsonld";
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.setAttribute("type", "application/ld+json");
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(Array.isArray(data) ? data : data);
}

function removeJsonLd() {
  const el = document.getElementById("seo-jsonld");
  if (el) el.remove();
}

export function useSEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = "https://braintrack.app/og-image.png",
  ogType = "website",
  ogUrl,
  twitterCard = "summary_large_image",
  noIndex = false,
  jsonLd,
}: SEOOptions) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    setMeta("description", description);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");

    setMeta("og:title", ogTitle ?? title, "property");
    setMeta("og:description", ogDescription ?? description, "property");
    setMeta("og:image", ogImage, "property");
    setMeta("og:type", ogType, "property");
    setMeta("og:site_name", "BrainTrack", "property");
    if (ogUrl ?? canonical) setMeta("og:url", (ogUrl ?? canonical)!, "property");

    if (canonical) setCanonical(canonical);

    setMeta("twitter:card", twitterCard, "name");
    setMeta("twitter:title", ogTitle ?? title, "name");
    setMeta("twitter:description", ogDescription ?? description, "name");
    setMeta("twitter:image", ogImage, "name");

    if (jsonLd) setJsonLd(jsonLd);

    return () => {
      document.title = prevTitle;
      removeJsonLd();
    };
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, ogType, ogUrl, twitterCard, noIndex, jsonLd]);
}
