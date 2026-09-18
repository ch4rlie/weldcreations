import { describe, it, expect } from "vitest";
import { siteGraph, BUSINESS_ID, PERSON_ID } from "../../src/lib/schema";
import { SITE } from "../../src/config/site";

type Node = Record<string, any>;
const offers = [
  { name: "Sanitary Welding", path: "/services/sanitary-welding/" },
  { name: "Hastelloy", path: "/materials/hastelloy-welding/" },
];
const graph = siteGraph({ offers });
const nodes = graph["@graph"] as Node[];
const business = nodes.find((n) => n["@type"] === "ProfessionalService")!;
const website = nodes.find((n) => n["@type"] === "WebSite")!;
const person = nodes.find((n) => n["@type"] === "Person")!;

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
    expect(business.sameAs).toEqual([...SITE.sameAs, SITE.googleMapsUrl]);
  });
  it("describes what the business knows about", () => {
    expect(business.knowsAbout).toEqual(expect.arrayContaining(["TIG welding", "Sanitary welding", "Hastelloy welding", "AWS D17.1"]));
  });
  it("lists an offer catalog linking to each spine page", () => {
    const items = business.hasOfferCatalog.itemListElement;
    expect(items).toHaveLength(offers.length);
    expect(items[0]).toMatchObject({
      "@type": "Offer",
      itemOffered: { "@id": "https://weldcreations.com/services/sanitary-welding/#service", name: "Sanitary Welding" },
    });
  });
  it("pins the business to its Google Business Profile location", () => {
    expect(business.geo).toEqual({ "@type": "GeoCoordinates", latitude: SITE.geo.latitude, longitude: SITE.geo.longitude });
    expect(business.hasMap).toBe(SITE.googleMapsUrl);
    expect(business.hasMap).toMatch(/^https:\/\/www\.google\.com\/maps\?cid=\d+$/);
  });
  it("links the founder to a Person node with only confirmed credentials", () => {
    expect(business.founder).toEqual({ "@id": PERSON_ID });
    expect(person["@id"]).toBe(PERSON_ID);
    expect(person.name).toBe(SITE.owner);
    expect(person.worksFor).toEqual({ "@id": BUSINESS_ID });
    expect(person.hasCredential.map((c: Node) => c.name)).toEqual(SITE.certifications);
  });
  it("works without offers", () => {
    const g = siteGraph();
    const b = (g["@graph"] as Node[]).find((n) => n["@type"] === "ProfessionalService")!;
    expect(b.hasOfferCatalog).toBeUndefined();
  });
  it("links the website to the business", () => {
    expect(website.publisher).toEqual({ "@id": BUSINESS_ID });
    expect(website.url).toBe("https://weldcreations.com/");
  });
});

import { serviceSchema, breadcrumbSchema, faqSchema } from "../../src/lib/schema";

describe("serviceSchema", () => {
  const s = serviceSchema({ name: "Sanitary Welding", description: "Desc", path: "/services/sanitary-welding/", serviceType: "Sanitary welding" });
  it("is a Service provided by the business", () => {
    expect(s["@type"]).toBe("Service");
    expect(s["@id"]).toBe("https://weldcreations.com/services/sanitary-welding/#service");
    expect(s.url).toBe("https://weldcreations.com/services/sanitary-welding/");
    expect(s.provider).toEqual({ "@id": BUSINESS_ID });
    expect(s.serviceType).toBe("Sanitary welding");
    expect(s.areaServed).toEqual(SITE.areaServed.map((name) => ({ "@type": "AdministrativeArea", name })));
  });
});

describe("breadcrumbSchema", () => {
  it("numbers items from 1 with absolute URLs", () => {
    const b = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services/" }]);
    expect(b["@type"]).toBe("BreadcrumbList");
    expect(b.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://weldcreations.com/" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://weldcreations.com/services/" },
    ]);
  });
});

describe("faqSchema", () => {
  it("maps questions and answers", () => {
    const f = faqSchema([{ q: "Q1?", a: "A1." }]);
    expect(f["@type"]).toBe("FAQPage");
    expect(f.mainEntity).toEqual([{ "@type": "Question", name: "Q1?", acceptedAnswer: { "@type": "Answer", text: "A1." } }]);
  });
});
