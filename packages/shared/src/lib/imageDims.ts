import { join } from "node:path";
import sharp from "sharp";
import type { ImageMetadata } from "astro";

/**
 * Return {width, height} for an image that may be an Astro `ImageMetadata`
 * (dims already known) or a public-path string (e.g. `/images/cms/x.webp` —
 * served from the site root, needs on-disk probing since Astro treats public
 * URLs as remote). Astro builds run with `cwd` = the site root, so `public/`
 * resolves automatically.
 *
 * Used by ZoomImage + gallery.astro so the CMS can pick public-path images.
 */
export interface ImageDims {
  width: number;
  height: number;
}

const dimsCache = new Map<string, Promise<ImageDims>>();

export async function imageDims(src: ImageMetadata | string): Promise<ImageDims> {
  if (typeof src !== "string") {
    return { width: src.width, height: src.height };
  }
  const cached = dimsCache.get(src);
  if (cached) return cached;
  const promise = (async (): Promise<ImageDims> => {
    const file = join(process.cwd(), "public", src.replace(/^\//, ""));
    let meta: { width?: number; height?: number };
    try {
      meta = await sharp(file).metadata();
    } catch (cause) {
      throw new Error(`Failed to read image dimensions for ${src}`, { cause });
    }
    if (!meta.width || !meta.height) throw new Error(`No dimensions for ${src}`);
    return { width: meta.width, height: meta.height };
  })();
  dimsCache.set(src, promise);
  promise.catch(() => dimsCache.delete(src));
  return promise;
}
