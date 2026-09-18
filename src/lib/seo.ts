import { SITE } from "../config/site";

export const TITLE_MAX = 60;
export const DESCRIPTION_MIN = 70;
export const DESCRIPTION_MAX = 155;

export function pageTitle(title: string): string {
  if (title.includes(SITE.name)) return title;
  const branded = `${title} | ${SITE.name}`;
  return branded.length <= TITLE_MAX ? branded : title;
}

export function canonicalUrl(pathname: string): string {
  const withSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return new URL(withSlash, SITE.url).href;
}
