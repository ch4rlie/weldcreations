import { describe, it, expect } from "vitest";
import { loadPages, visibleText } from "./helpers";
import { SITE, GUARDED_CREDENTIALS } from "../../src/config/site";

const pages = loadPages();
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const unconfirmed = GUARDED_CREDENTIALS.filter((c) => !SITE.certifications.includes(c));
const CLAIM = "(certified|certification|registered|accredited|approved|qualified)";

export function credentialClaims(text: string): string[] {
  return unconfirmed.flatMap((cred) => {
    const c = escape(cred);
    const patterns = [
      new RegExp(`\\b${c}\\b[\\w\\s-]{0,20}?\\b${CLAIM}\\b`, "gi"),
      new RegExp(`\\b${CLAIM}\\b[\\w\\s-]{0,20}?\\b${c}\\b`, "gi"),
    ];
    return patterns.flatMap((re) => text.match(re) ?? []);
  });
}

const LOW_VALUE_PHRASES = [
  /no job (is )?too small/i,
  /\bcheap(est)?\b/i,
  /mobile weld(ing|er)/i,
  /welding (classes|lessons)/i,
  /\btire carrier\b/i,
  /\btrailer hitch\b/i,
];

describe("capability-claim guardrail", () => {
  it("detects claims but allows standards references", () => {
    expect(credentialClaims("We are AS9100 certified.")).not.toEqual([]);
    expect(credentialClaims("Certified to ISO 9001 standards.")).not.toEqual([]);
    expect(credentialClaims("Welds inspected against ASME BPE requirements.")).toEqual([]);
    expect(credentialClaims("AWS D17.1 Certified")).toEqual([]);
  });

  it.each(pages.map((p) => [p.path, p]))("%s claims no unconfirmed credentials", (_path, p) => {
    expect(credentialClaims(visibleText(p))).toEqual([]);
  });
});

describe("lead-quality language (spec §4a)", () => {
  it.each(pages.map((p) => [p.path, p]))("%s avoids low-value lead phrasing", (_path, p) => {
    const text = visibleText(p);
    expect(LOW_VALUE_PHRASES.filter((re) => re.test(text)).map(String)).toEqual([]);
  });
});
