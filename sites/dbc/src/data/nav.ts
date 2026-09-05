// Shared dbc navigation — single source for home + gallery pages.
// CMS labels override literals; a page passes its `pageContent.labels`.

import type { NavLink } from "@garage/shared/types";

// ONE source of truth for nav + footer. `buildNav` returns the tree as-is
// (items with `children` render as hover dropdowns in shared Nav.astro);
// `buildFooterNav` flattens the same tree so the two can never drift.
function navTree(labels: Record<string, string>): NavLink[] {
  // Mirror VIPER nav: home sections live under a dropdown trigger.
  // Shared Nav.astro renders any item with `children` as a hover dropdown.
  return [
    {
      label: labels["nav.home"] ?? "Home",
      href: "/",
      children: [
        { label: labels["nav.about"] ?? "About", href: "/#about" },
        { label: labels["nav.services"] ?? "Services", href: "/#services" },
        { label: labels["nav.stats"] ?? "Why Choose Us", href: "/#stats" },
        { label: labels["nav.howItWorks"] ?? "How It Works", href: "/#how-it-works" },
        { label: labels["nav.ctaBanner"] ?? "Start A Build", href: "/#start-a-build" },
        { label: labels["nav.contact"] ?? "Get A Quote", href: "/#contact" },
        { label: labels["nav.bottomCta"] ?? "Your Dream Car", href: "/#your-dream-car" },
      ],
    },
    {
      label: labels["nav.services"] ?? "Services",
      href: "/services/supercar-transport",
      children: [
        { label: labels["nav.supercarTransport"] ?? "Supercar Transport", href: "/services/supercar-transport" },
        { label: labels["nav.auctionSale"] ?? "Auction & Sale", href: "/services/auction" },
        { label: labels["nav.sourcingLogistics"] ?? "Sourcing & Logistics", href: "/services/sourcing-logistics" },
        { label: labels["nav.customizingDesign"] ?? "Customizing & Design", href: "/services/customizing" },
      ],
    },
    {
      label: labels["nav.gallery"] ?? "Gallery",
      href: "/gallery",
    },
  ];
}

export function buildNav(labels: Record<string, string>): NavLink[] {
  return navTree(labels);
}

// Footer mirror of the nav — one flat list. The shared Footer renders a
// single column with no dropdown support, so the tree above is flattened:
// a plain item stays as-is, "/" keeps itself plus its sections, and any
// other dropdown trigger contributes only its children (e.g. the Services
// trigger links at its first service page, so the footer lists the pages).
// Footer-only destinations (fleet anchor, privacy) are appended here —
// everything else comes from navTree, never duplicated.
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
  push({ label: labels["nav.fleet"] ?? "Our Fleet", href: "/gallery#fleet" });
  push({ label: labels["nav.privacy"] ?? "Privacy Policy", href: "/privacy-policy" });
  return flat;
}
