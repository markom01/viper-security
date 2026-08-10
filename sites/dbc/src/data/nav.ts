// Shared dbc navigation — single source for home + gallery pages.
// CMS labels override literals; a page passes its `pageContent.labels`.

import type { NavLink } from "@garage/shared/types";

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
      label: labels["nav.gallery"],
      href: "/gallery",
      children: [{ label: labels["nav.fleet"], href: "/gallery" }],
    },
  ];
}
