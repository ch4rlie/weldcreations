import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DIST, loadPages } from "./helpers";
import { SITE, FULL_ADDRESS } from "../../src/config/site";

describe("/llms.txt", () => {
  const txt = readFileSync(join(DIST, "llms.txt"), "utf8");
  it("starts with the business name as an H1 and a summary blockquote", () => {
    expect(txt.startsWith(`# ${SITE.name}\n`)).toBe(true);
    expect(txt).toMatch(/\n> .+/);
  });
  it("carries exact NAP and the confirmed certification", () => {
    expect(txt).toContain(FULL_ADDRESS);
    expect(txt).toContain(SITE.phone);
    expect(txt).toContain(SITE.email);
    for (const c of SITE.certifications) expect(txt).toContain(c);
  });
  it("links every section and content page", () => {
    const paths = loadPages()
      .map((p) => p.path)
      .filter((p) => /^\/(services|materials|industries|locations|guides)\/[^/]+\/$/.test(p) || p === "/capabilities/" || p === "/contact/");
    for (const p of paths) expect(txt, p).toContain(`${SITE.url}${p}`);
  });
});
