import { SITE } from "../config/site";
import { canonicalUrl } from "./seo";

export const BUSINESS_ID = `${SITE.url}/#business`;
export const WEBSITE_ID = `${SITE.url}/#website`;

export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": BUSINESS_ID,
        name: SITE.name,
        url: `${SITE.url}/`,
        logo: `${SITE.url}/logo.png`,
        image: `${SITE.url}/logo.png`,
        telephone: SITE.phoneE164,
        email: SITE.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: SITE.address.street,
          addressLocality: SITE.address.city,
          addressRegion: SITE.address.region,
          postalCode: SITE.address.postalCode,
          addressCountry: SITE.address.country,
        },
        geo: { "@type": "GeoCoordinates", latitude: SITE.geo.latitude, longitude: SITE.geo.longitude },
        hasMap: SITE.googleMapsUrl,
        areaServed: areaServed(),
        founder: {
          "@type": "Person",
          name: SITE.owner,
          jobTitle: "Owner & Master Welder",
          hasCredential: SITE.certifications.map((name) => ({
            "@type": "EducationalOccupationalCredential",
            name,
          })),
        },
        sameAs: SITE.sameAs,
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE.url}/`,
        name: SITE.name,
        publisher: { "@id": BUSINESS_ID },
      },
    ],
  };
}

const areaServed = () => SITE.areaServed.map((name) => ({ "@type": "AdministrativeArea", name }));

export function serviceSchema(o: { name: string; description: string; path: string; serviceType: string }) {
  const url = canonicalUrl(o.path);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: o.name,
    serviceType: o.serviceType,
    description: o.description,
    url,
    provider: { "@id": BUSINESS_ID },
    areaServed: areaServed(),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: canonicalUrl(it.path) })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
