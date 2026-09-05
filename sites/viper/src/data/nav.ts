// VIPER navigation — single source for the home page.
// Site is trimmed to home only (no service/gallery/privacy pages), so the
// menu points at the homepage's own sections. A page passes `pageContent.labels`.

import type { NavLink } from "@garage/shared/types";

// ONE source of truth for nav + footer. `buildNav` returns the tree as-is
// (items with `children` render as hover dropdowns in shared Nav.astro);
// `buildFooterNav` flattens the same tree so the two can never drift.
function navTree(labels: Record<string, string>): NavLink[] {
  return [
    {
      label: labels["nav.home"] ?? "Home",
      href: "/",
      children: [
        { label: labels["nav.about"] ?? "About", href: "/#about" },
        { label: labels["nav.services"] ?? "Services", href: "/#services" },
        { label: labels["nav.fleet"] ?? "Fleet", href: "/#fleet" },
        { label: labels["nav.stats"] ?? "Why VIPER", href: "/#stats" },
        { label: labels["nav.howItWorks"] ?? "How It Works", href: "/#how-it-works" },
        { label: labels["nav.pricing"] ?? "Pricing", href: "/#pricing" },
        { label: labels["nav.membership"] ?? "Membership", href: "/#membership" },
        { label: labels["nav.ctaBanner"] ?? "First Experience", href: "/#first-experience" },
        { label: labels["nav.contact"] ?? "Contact Us", href: "/#contact" },
        { label: labels["nav.bottomCta"] ?? "Begin Your Journey", href: "/#begin-your-journey" },
      ],
    },
    { label: labels["nav.contact"] ?? "Contact Us", href: "/#contact" },
  ];
}

export function buildNav(labels: Record<string, string>): NavLink[] {
  return navTree(labels);
}

// Footer mirror of the nav — one flat list. The shared Footer renders a
// single column with no dropdown support, so the tree above is flattened:
// a plain item stays as-is, "/" keeps itself plus its sections, and any
// other dropdown trigger contributes only its children. Everything comes
// from navTree, never duplicated.
export function buildFooterNav(labels: Record<string, string>): NavLink[] {
  const flat: NavLink[] = [];
  const seen = new Set<string>();
  const push = (link: NavLink): void => {
    if (!seen.has(link.href)) {
      seen.add(link.href);
      flat.push({ label: link.label, href: link.href });
    }
  };
  for (const item of navTree(labels)) {
    if (!item.children) {
      push(item);
      continue;
    }
    if (item.href === "/") push(item);
    item.children.forEach(push);
  }
  return flat;
}
