/**
 * First-touch attribution for the visit: the first page viewed and the external
 * referrer (e.g. chatgpt.com, perplexity.ai). Recorded on every page, so it
 * survives a visitor landing on a guide and later opening the quote form.
 */
export interface Attribution {
  landing: string;
  referrer: string;
}

const LANDING = "wc_landing";
const REFERRER = "wc_referrer";

function externalReferrer(): string {
  try {
    return document.referrer && new URL(document.referrer).host !== location.host ? document.referrer : "";
  } catch {
    return "";
  }
}

export function recordFirstTouch(): Attribution {
  const fallback = { landing: location.pathname, referrer: externalReferrer() };
  try {
    const landing = sessionStorage.getItem(LANDING);
    if (landing !== null) return { landing, referrer: sessionStorage.getItem(REFERRER) ?? "" };
    sessionStorage.setItem(LANDING, fallback.landing);
    sessionStorage.setItem(REFERRER, fallback.referrer);
  } catch {
    // storage unavailable (private mode): attribute to this page only
  }
  return fallback;
}
