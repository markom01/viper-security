/**
 * Mobile-nav open/close + aria-expanded + dropdown caret + aria-current.
 * Imported by Nav.astro so Astro bundles it to an external /_astro/*.js
 * module the strict `script-src 'self'` CSP permits.
 */
export function initNavMenu(): void {
  const navbar = document.querySelector<HTMLElement>(".navbar");

if (navbar) {
  const openBtn = navbar.querySelector<HTMLElement>(".open-menu-button");
  const closeBtn = navbar.querySelector<HTMLElement>(".close-menu-button");
  const setMenu = (open: boolean): void => {
    if (open) navbar.setAttribute("data-nav-open", "");
    else navbar.removeAttribute("data-nav-open");
    if (openBtn) openBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (closeBtn)
      closeBtn.setAttribute("aria-expanded", open ? "true" : "false");
  };
  document.addEventListener("click", (e: MouseEvent) => {
    const t = e.target as Element | null;
    if (t?.closest(".open-menu-button")) setMenu(true);
    else if (t?.closest(".close-menu-button")) setMenu(false);
    else if (t?.closest(".nav-link")) setMenu(false); // close on tap
  });
  // Dropdown caret aria-expanded follows hover/focus within the .has-dropdown
  document.querySelectorAll<HTMLElement>(".has-dropdown").forEach((dd) => {
    const toggle = dd.querySelector<HTMLElement>(".dropdown-toggle");
    if (!toggle) return;
    const setExp = (v: boolean): void =>
      toggle.setAttribute("aria-expanded", v ? "true" : "false");
    dd.addEventListener("mouseenter", () => setExp(true));
    dd.addEventListener("mouseleave", () => setExp(false));
    dd.addEventListener("focusin", () => setExp(true));
    dd.addEventListener("focusout", (e: FocusEvent) => {
      const to = e.relatedTarget as Node | null;
      if (!dd.contains(to)) setExp(false);
    });
  });
}

  // aria-current only for non-hash links matching the current path
  document.querySelectorAll<HTMLElement>(".nav-link").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.startsWith("/#")) return;
    const path = href.split("#")[0] || "/";
    if (path === location.pathname) a.setAttribute("aria-current", "page");
  });
}