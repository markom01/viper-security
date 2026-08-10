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
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );
    els.forEach((el) => obs.observe(el));
  }
}