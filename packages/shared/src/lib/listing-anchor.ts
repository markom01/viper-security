import { slugify } from "./slugify";

/**
 * In-page anchor for a listing card. The title slug keeps shared links
 * readable; the entry id keeps two identical cars from colliding.
 * The hash is read by the browser itself (`:target`), so the card needs no
 * client-side script to scroll and highlight.
 */
export function listingAnchorId(title: string, id: string | number): string {
  const slug = slugify(title);
  return slug ? `${slug}-id${id}` : `id${id}`;
}
