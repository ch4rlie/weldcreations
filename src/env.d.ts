interface ImportMetaEnv {
  readonly PUBLIC_GA4_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  dataLayer: unknown[];
  gtag?: (...args: unknown[]) => void;
  clarity?: (...args: unknown[]) => void;
}

// Package-exported stylesheet; the specifier has no .css extension for TS to match.
declare module "@splidejs/splide/css";
