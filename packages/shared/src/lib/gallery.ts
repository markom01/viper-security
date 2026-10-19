import type { ImageMetadata } from "astro";
import { slugify } from "./slugify.ts";

/**
 * Shared gallery data helpers — single source for the sectioned-gallery
 * pipeline both sites reuse (DBC + VIPER gallery.astro pages).
 *
 * Data pipeline lives here; pages only supply their entries + section defs.
 * Rendering lives in `Gallery.astro` (props shape mirrored below).
 */

export interface GalleryItem {
  id: string;
  category: string;
  alt: string;
  width: number;
  height: number;
  href: string;
  image: string | ImageMetadata;
}

export interface GallerySectionDef {
  key: string;
  title: string;
}

export interface GallerySection extends GallerySectionDef {
  items: GalleryItem[];
}

interface GalleryEntry {
  id: string;
  data: {
    name: string;
    alt?: string | null;
    category: string;
    image: string | ImageMetadata;
  };
}

interface GalleryDeps {
  imageDims: (src: string | ImageMetadata) => Promise<{ width: number; height: number }>;
  getImage: (options: {
    src: string | ImageMetadata;
    width: number;
    height: number;
  }) => Promise<{ src: string }>;
}

/**
 * Probe intrinsic dims (PhotoSwipe) + build the lightbox href for every
 * gallery entry. Served URL reuses the original asset (sources are already
 * web-sized; a separate width cap only duplicates files).
 */
export async function resolveGalleryItems(
  entries: GalleryEntry[],
  { imageDims, getImage }: GalleryDeps,
): Promise<GalleryItem[]> {
  return Promise.all(
    entries.map(async (item) => {
      const src = item.data.image;
      let dims: { width: number; height: number };
      try {
        dims = await imageDims(src);
      } catch {
        dims = { width: 800, height: 600 };
      }
      let optimized: { src: string };
      try {
        optimized = await getImage({ src, width: dims.width, height: dims.height });
      } catch {
        optimized = { src: typeof src === "string" ? src : src.src };
      }
      return {
        id: item.id,
        category: item.data.category,
        alt: item.data.alt || item.data.name,
        width: dims.width,
        height: dims.height,
        href: optimized.src,
        image: src,
      };
    }),
  );
}

/**
 * Group items into ordered per-key sections. Empty groups are skipped so the
 * page never shows a bare heading. Lightbox nav stays within each group.
 */
export function buildGallerySections(
  items: GalleryItem[],
  defs: GallerySectionDef[],
): GallerySection[] {
  return defs
    .map((section) => ({
      ...section,
      items: items.filter((item) => item.category === section.key),
    }))
    .filter((section) => section.items.length > 0);
}

/**
 * Derive section defs from service pages — gallery sections track service
 * pages automatically (key = slug, title = CMS service title).
 */
export function serviceSectionDefs(
  services: Array<{ slug?: string | undefined; title: string }>,
): GallerySectionDef[] {
  return services.map((service) => ({
    key: service.slug ?? slugify(service.title),
    title: service.title,
  }));
}
