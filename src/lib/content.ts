import { getCollection, type CollectionEntry } from "astro:content";

export type SectionName = "services" | "materials" | "industries" | "locations" | "guides";
export type SpineEntry = CollectionEntry<SectionName>;

export const SECTIONS: Record<SectionName, { label: string; path: string }> = {
  services: { label: "Services", path: "/services/" },
  materials: { label: "Materials", path: "/materials/" },
  industries: { label: "Industries", path: "/industries/" },
  locations: { label: "Locations", path: "/locations/" },
  guides: { label: "Guides", path: "/guides/" },
};

const RELATION_FIELDS = {
  services: "relatedServices",
  materials: "relatedMaterials",
  industries: "relatedIndustries",
  locations: "relatedLocations",
  guides: "relatedGuides",
} as const;

/** Sections that describe what the business sells (offers, Specialties, capabilities). Guides are editorial. */
export const SPINE_SECTIONS: SectionName[] = ["services", "materials", "industries", "locations"];

export const entryPath = (collection: SectionName, id: string) => `/${collection}/${id}/`;

export async function publishedEntries(collection: SectionName): Promise<SpineEntry[]> {
  const entries = await getCollection(collection, (e) => !e.data.draft);
  return entries.sort((a, b) => a.data.order - b.data.order || a.data.navLabel.localeCompare(b.data.navLabel));
}

export async function allPublished(sections: SectionName[] = SPINE_SECTIONS): Promise<SpineEntry[]> {
  const lists = await Promise.all(sections.map(publishedEntries));
  return lists.flat();
}

const key = (e: { collection: string; id: string }) => `${e.collection}/${e.id}`;

/**
 * Pages this entry links to, plus pages that link to it, drafts excluded.
 * Declaring a relation on either side links both pages.
 */
export async function relatedFor(entry: SpineEntry): Promise<Record<SectionName, SpineEntry[]>> {
  const all = await allPublished(Object.keys(SECTIONS) as SectionName[]);
  const byKey = new Map(all.map((e) => [key(e), e]));
  const self = key(entry);
  const found = new Map<string, SpineEntry>();

  for (const [collection, field] of Object.entries(RELATION_FIELDS)) {
    for (const ref of entry.data[field]) {
      const target = byKey.get(`${collection}/${ref.id}`);
      if (target) found.set(key(target), target);
    }
  }
  for (const other of all) {
    const field = RELATION_FIELDS[entry.collection as SectionName];
    if (other.data[field].some((ref) => ref.id === entry.id)) found.set(key(other), other);
  }
  found.delete(self);

  const grouped: Record<SectionName, SpineEntry[]> = { services: [], materials: [], industries: [], locations: [], guides: [] };
  for (const e of found.values()) grouped[e.collection as SectionName].push(e);
  for (const list of Object.values(grouped)) list.sort((a, b) => a.data.order - b.data.order);
  return grouped;
}
