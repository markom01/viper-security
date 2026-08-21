// Shared dbc navigation — single source for home + gallery pages.
// CMS labels override literals; a page passes its `pageContent.labels`.

import type { NavLink } from "@garage/shared/types";

// Footer mirror of the nav — one flat list. The shared Footer renders a
// single column with no dropdown support, so the nav's dropdown children are
// flattened here alongside the top-level destinations.
export function buildFooterNav(labels: Record<string, string>): NavLink[] {
  return [
    { label: labels["nav.home"] ?? "Home", href: "/" },
    { label: labels["nav.about"] ?? "About", href: "/#about" },
    { label: labels["nav.services"] ?? "Services", href: "/#services" },
    { label: labels["nav.howItWorks"] ?? "How It Works", href: "/#how-it-works" },
    { label: "Supercar Transport", href: "/services/supercar-transport" },
    { label: "Auction & Sale", href: "/services/auction" },
    { label: "Import & Export", href: "/services/import-export" },
    { label: "Customizing & Design", href: "/services/customizing" },
    { label: labels["nav.gallery"] ?? "Gallery", href: "/gallery" },
    { label: labels["nav.fleet"] ?? "Our Fleet", href: "/gallery" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ];
}

export function buildNav(labels: Record<string, string>): NavLink[] {
  // Mirror VIPER nav: home sections live under a dropdown trigger.
  // Shared Nav.astro renders any item with `children` as a hover dropdown.
  return [
    {
      label: labels["nav.home"],
      href: "/",
      children: [
        { label: labels["nav.about"], href: "/#about" },
        { label: labels["nav.services"], href: "/#services" },
        { label: labels["nav.howItWorks"], href: "/#how-it-works" },
      ],
    },
    {
      label: labels["nav.services"] ?? "Services",
      href: "/services/supercar-transport",
      children: [
        { label: "Supercar Transport", href: "/services/supercar-transport" },
        { label: "Auction & Sale", href: "/services/auction" },
        { label: "Import & Export", href: "/services/import-export" },
        { label: "Customizing & Design", href: "/services/customizing" },
      ],
    },
    {
      label: labels["nav.gallery"],
      href: "/gallery",
      children: [{ label: labels["nav.fleet"], href: "/gallery" }],
    },
  ];
}
