/**
 * Page-level PhotoSwipe lightbox. Every `a[data-lightbox]` on the page (rendered
 * by the shared ZoomImage) joins one gallery, so arrows navigate across all
 * body images — EXCEPT carousel slides, which own a scoped instance inside
 * ImageCarousel.astro (`.carousel-zoom` anchors). Excluding them here avoids
 * double-binding the same anchor in two galleries (page-level would win and
 * leak hero/services/CTA images into the carousel's "1 of 5").
 *
 * DBC's gallery page uses `data-gallery` (its own per-group instances) — those
 * anchors are not `data-lightbox`, so this never double-binds them.
 */
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/dist/photoswipe.css";

function initLightbox(): void {
  if (!document.querySelector("a[data-lightbox]")) return;
  const lightbox = new PhotoSwipeLightbox({
    gallery: "body",
    children: "a[data-lightbox]:not(.carousel-zoom)",
    pswpModule: () =>
      import("photoswipe").catch((err) => {
        console.warn("[lightbox] failed to load photoswipe", err);
        throw err;
      }),
  });
  try {
    lightbox.init();
  } catch (err) {
    console.warn("[lightbox] init failed", err);
  }
}

if (typeof document !== "undefined") {
  try {
    initLightbox();
  } catch (err) {
    console.warn("[lightbox] init failed", err);
  }
}
