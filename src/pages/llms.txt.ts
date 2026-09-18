import type { APIRoute } from "astro";
import { SITE, FULL_ADDRESS } from "../config/site";
import { SECTIONS, entryPath, publishedEntries, type SectionName } from "../lib/content";

/**
 * llms.txt (https://llmstxt.org): a plain-Markdown summary for AI tools and agents.
 * Google ignores it and AI search bots rarely fetch it, so it's a low-cost extra,
 * not a ranking lever. Generated from the same config and collections as the site,
 * so it can't drift out of date.
 */
export const GET: APIRoute = async () => {
  const order: SectionName[] = ["services", "industries", "materials", "guides", "locations"];
  const sections = await Promise.all(
    order.map(async (c) => {
      const entries = await publishedEntries(c);
      if (entries.length === 0) return "";
      const lines = entries.map((e) => `- [${e.data.navLabel}](${SITE.url}${entryPath(c, e.id)}): ${e.data.summary}`);
      return `## ${SECTIONS[c].label}\n\n${lines.join("\n")}\n`;
    }),
  );

  const body = `# ${SITE.name}

> ${SITE.name} is a precision TIG welding and metal fabrication shop in Glendora, California, owned by third-generation welder ${SITE.owner} and certified to ${SITE.certifications.join(", ")} (aerospace fusion welding). It builds sanitary stainless equipment for pharmaceutical, supplement and food manufacturers, welds exotic alloys (titanium, Hastelloy, Inconel), and runs production welding for manufacturers across Los Angeles, Orange and San Bernardino counties. Machining, finishing and specialty processes are handled in-house or through a partner network, so customers get finished parts from one supplier.

## Contact

- Address: ${FULL_ADDRESS}
- Phone: ${SITE.phone}
- Email: ${SITE.email}
- Request a quote: ${SITE.url}/contact/
- Capabilities summary: ${SITE.url}/capabilities/
- Google Maps: ${SITE.googleMapsUrl}

## Best fit

Manufacturers and equipment builders that need precision, sanitary, exotic-alloy or production welding: pharmaceutical and nutraceutical producers, food and beverage plants, aerospace suppliers (tooling, fixtures, ground support equipment, components), and machine shops needing a subcontract welding partner. Not a mobile or small-repair welding service.

${sections.filter(Boolean).join("\n")}`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
