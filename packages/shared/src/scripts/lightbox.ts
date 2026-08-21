/**
 * Page-level PhotoSwipe lightbox. Every `a[data-lightbox]` on the page (rendered
 * by the shared ZoomImage) joins one gallery, so arrows navigate across all
 * body images. PhotoSwipeLightbox needs a gallery CONTAINER + children selector
 * (it binds clicks on the container and resolves items from children) — passing
 * a bare array of anchors makes each anchor its own single-item gallery, so we
 * use the page as the container and the anchors as children.
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
    children: "a[data-lightbox]",
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
