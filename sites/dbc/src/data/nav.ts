// Shared dbc navigation — single source for home + gallery pages.
// CMS labels override literals; a page passes its `pageContent.labels`.

import type { NavLink } from "@garage/shared/types";

export function buildNav(labels: Record<string, string>): NavLink[] {
  return [
    { label: labels["nav.home"] || "Home", href: "/" },
    { label: labels["nav.about"] || "About", href: "/#about" },
    { label: labels["nav.services"] || "Services", href: "/#services" },
    { label: labels["nav.gallery"] || "Gallery", href: "/gallery" },
    { label: labels["nav.fleet"] || "Builds", href: "/gallery" },
    {
      label: labels["nav.howItWorks"] || "How It Works",
      href: "/#how-it-works",
    },
  ];
}
