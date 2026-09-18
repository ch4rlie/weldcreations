import { SITE } from "../config/site";

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
        areaServed: SITE.areaServed.map((name) => ({ "@type": "AdministrativeArea", name })),
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
