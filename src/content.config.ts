import { defineCollection, reference, type SchemaContext } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const faq = z.object({ q: z.string(), a: z.string() });

/** One schema for every spine page. Relations are validated: a bad slug fails the build. */
const page = ({ image }: SchemaContext) =>
  z
    .object({
      title: z.string().max(60),
      h1: z.string(),
      description: z.string().min(70).max(155),
      navLabel: z.string(),
      summary: z.string().max(220),
      primaryKeyword: z.string(),
      secondaryKeywords: z.array(z.string()).default([]),
      serviceType: z.string(),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      /** Last substantive content update. Shown on the page and emitted as dateModified. */
      updated: z.coerce.date(),
      order: z.number().default(100),
      draft: z.boolean().default(false),
      faqs: z.array(faq).default([]),
      relatedServices: z.array(reference("services")).default([]),
      relatedMaterials: z.array(reference("materials")).default([]),
      relatedIndustries: z.array(reference("industries")).default([]),
      relatedLocations: z.array(reference("locations")).default([]),
    })
    .superRefine((d, ctx) => {
      if (d.heroImage && !d.heroAlt) ctx.addIssue({ code: "custom", message: "heroAlt is required when heroImage is set", path: ["heroAlt"] });
    });

const collection = (dir: string) =>
  defineCollection({ loader: glob({ pattern: "**/*.md", base: `./src/content/${dir}` }), schema: page });

export const collections = {
  services: collection("services"),
  materials: collection("materials"),
  industries: collection("industries"),
  locations: collection("locations"),
};
