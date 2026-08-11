// Product/Offer JSON-LD for the four live BrainTrack products, shared by the
// landing and subscribe pages so search + answer engines get one consistent
// price sheet. Every amount and claim here MUST mirror the live subscribe-page
// copy (client/src/pages/subscribe.tsx PRODUCTS) — server owns the real
// amounts. Deliberately NO aggregateRating / review markup: we have no
// collected ratings and fabricating them is a Google-penalty offence.

const SUBSCRIBE_URL = "https://braintrack.tech/subscribe";

const BRAND = { "@type": "Brand", name: "BrainTrack" } as const;

const ZA = { "@type": "Country", name: "South Africa" } as const;

function offer(price: string) {
  return {
    "@type": "Offer",
    price,
    priceCurrency: "ZAR",
    url: SUBSCRIBE_URL,
    availability: "https://schema.org/InStock",
    eligibleRegion: ZA,
  };
}

export const PRODUCTS_JSONLD: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "BrainTrack Grade 12 Matric prep plans",
  url: SUBSCRIBE_URL,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Product",
        name: "Student Life",
        description:
          "Monthly subscription — full access from today, cancel anytime. Every Grade 12 CAPS subject, the full 10-year NSC past-paper archive, Rizz AI tutor, adaptive study plan and weekly parent reports. R169 per month.",
        brand: BRAND,
        url: SUBSCRIBE_URL,
        offers: {
          ...offer("169"),
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "169",
            priceCurrency: "ZAR",
            referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
          },
        },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Product",
        name: "Prelim Sprint",
        description:
          "Once-off R250 — 6 weeks of full access built for the prelim exams: prelim-mode drills, mocks and predictor, the 3 most recent years of past papers with memos, and weekly parent reports. No recurring billing.",
        brand: BRAND,
        url: SUBSCRIBE_URL,
        offers: offer("250"),
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Product",
        name: "Finals Blitz",
        description:
          "Once-off R250 — 6 weeks of full access built for the October–November NSC finals: finals-mode drills, mocks and predictor, the 3 most recent years of past papers with memos, and weekly parent reports. No recurring billing.",
        brand: BRAND,
        url: SUBSCRIBE_URL,
        offers: offer("250"),
      },
    },
    {
      "@type": "ListItem",
      position: 4,
      item: {
        "@type": "Product",
        name: "Exam Season Pass",
        description:
          "Once-off R550 — full platform access until 15 December 2026, including the full 10-year past-paper archive, Rizz AI tutor and weekly parent reports. One payment, no recurring billing.",
        brand: BRAND,
        url: SUBSCRIBE_URL,
        offers: offer("550"),
      },
    },
  ],
};
