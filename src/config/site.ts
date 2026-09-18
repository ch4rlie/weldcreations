export const SITE = {
  name: "Weld Creations",
  url: "https://weldcreations.com",
  owner: "Mark May",
  phone: "(626) 675-4239",
  phoneE164: "+16266754239",
  email: "weldcreations@yahoo.com",
  /**
   * USPS form (building owner and property listings use 2041 E Gladstone St, 91740).
   * Google Business Profile shows "2041 Gladstone St Unit Q, Glendora, CA 91740":
   * same place, directional omitted. Left as-is to avoid GBP re-verification.
   */
  address: {
    street: "2041 E Gladstone St, Unit Q",
    city: "Glendora",
    region: "CA",
    postalCode: "91740",
    country: "US",
  },
  /** Pin from the Google Business Profile listing. */
  geo: { latitude: 34.1148101, longitude: -117.82579 },
  googleMapsUrl: "https://www.google.com/maps?cid=16684183137107017541",
  areaServed: ["Los Angeles County", "Orange County", "San Bernardino County"],
  sameAs: [
    "https://www.yelp.com/biz/weld-creations-glendora",
    "https://www.linkedin.com/in/mark-may-3bab7735/",
  ],
  /** Confirmed credentials ONLY. Guarded by tests/site/policy.test.ts. */
  certifications: ["AWS D17.1"] as string[],
  analytics: {
    clarityId: "n18eppb8di",
    ga4Id: import.meta.env.PUBLIC_GA4_ID ?? "",
  },
  web3formsKey: "4023322a-c3d7-49be-bfd3-e3b1a76b24ae",
} as const;

export const FULL_ADDRESS = `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postalCode}`;

/** Credential names that must never be claimed unless present in SITE.certifications. */
export const GUARDED_CREDENTIALS = [
  "AWS D17.1",
  "AWS D1.1",
  "AWS D1.2",
  "AWS D1.6",
  "AWS D18.1",
  "AS9100",
  "ISO 9001",
  "ITAR",
  "NADCAP",
  "ASME",
  "CWI",
  "3-A",
];
