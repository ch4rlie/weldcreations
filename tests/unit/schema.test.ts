import { describe, it, expect } from "vitest";
import { siteGraph, BUSINESS_ID } from "../../src/lib/schema";
import { SITE } from "../../src/config/site";

type Node = Record<string, any>;
const graph = siteGraph();
const nodes = graph["@graph"] as Node[];
const business = nodes.find((n) => n["@type"] === "ProfessionalService")!;
const website = nodes.find((n) => n["@type"] === "WebSite")!;

describe("siteGraph", () => {
  it("uses the schema.org context", () => {
    expect(graph["@context"]).toBe("https://schema.org");
  });
  it("describes the business with exact NAP from config", () => {
    expect(business["@id"]).toBe(BUSINESS_ID);
    expect(business.name).toBe(SITE.name);
    expect(business.telephone).toBe(SITE.phoneE164);
    expect(business.address).toMatchObject({
      "@type": "PostalAddress",
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    });
    expect(business.sameAs).toEqual(SITE.sameAs);
  });
  it("pins the business to its Google Business Profile location", () => {
    expect(business.geo).toEqual({ "@type": "GeoCoordinates", latitude: SITE.geo.latitude, longitude: SITE.geo.longitude });
    expect(business.hasMap).toBe(SITE.googleMapsUrl);
    expect(business.hasMap).toMatch(/^https:\/\/www\.google\.com\/maps\?cid=\d+$/);
  });
  it("lists only confirmed credentials, on the founder", () => {
    const creds = business.founder.hasCredential.map((c: Node) => c.name);
    expect(creds).toEqual(SITE.certifications);
  });
  it("links the website to the business", () => {
    expect(website.publisher).toEqual({ "@id": BUSINESS_ID });
    expect(website.url).toBe("https://weldcreations.com/");
  });
});
