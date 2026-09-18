import { describe, it, expect } from "vitest";
import { pageTitle, canonicalUrl, TITLE_MAX } from "../../src/lib/seo";

describe("pageTitle", () => {
  it("appends the brand when it fits", () => {
    expect(pageTitle("Hastelloy Welding Services")).toBe("Hastelloy Welding Services | Weld Creations");
  });
  it("leaves titles that already contain the brand untouched", () => {
    const t = "Weld Creations | Precision TIG Welding, Glendora CA";
    expect(pageTitle(t)).toBe(t);
  });
  it("drops the brand rather than exceed the limit", () => {
    const long = "Sanitary Stainless Steel Welding for Food Processing Plants";
    expect(pageTitle(long)).toBe(long);
    expect(pageTitle(long).length).toBeLessThanOrEqual(TITLE_MAX);
  });
});

describe("canonicalUrl", () => {
  it("builds absolute URLs with a trailing slash", () => {
    expect(canonicalUrl("/materials/hastelloy-welding")).toBe("https://weldcreations.com/materials/hastelloy-welding/");
    expect(canonicalUrl("/materials/hastelloy-welding/")).toBe("https://weldcreations.com/materials/hastelloy-welding/");
  });
  it("handles the root", () => {
    expect(canonicalUrl("/")).toBe("https://weldcreations.com/");
  });
});

describe("NAP", () => {
  it("formats the full address with USPS-style commas", async () => {
    const { FULL_ADDRESS } = await import("../../src/config/site");
    expect(FULL_ADDRESS).toBe("2041 E Gladstone St, Unit Q, Glendora, CA 91740");
  });
});
