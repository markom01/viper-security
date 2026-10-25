/**
 * Scroll-reveal via IntersectionObserver.
 * Imported by BaseLayout.astro so Astro bundles it to an external /_astro/*.js
 * module the strict `script-src 'self'` CSP permits.
 */
export function initScrollReveal(): void {
  const els = document.querySelectorAll("[data-scroll-reveal]");

  if (els.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-scroll-reveal-visible", "");
            obs.unobserve(entry.target);
          }
        }
      },
      // threshold 0 (any visible pixel): a 0.15 ratio is unreachable for
      // tall stacked grids (e.g. 6-card fleet ≈ 4200px on a phone) — the
      // section would never reveal on small screens. The 50px bottom
      // rootMargin keeps the trigger cosmetically inside the fold.
      { threshold: 0, rootMargin: "0px 0px -50px 0px" },
    );
    els.forEach((el) => obs.observe(el));
  }
}
