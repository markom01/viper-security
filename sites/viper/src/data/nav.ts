// VIPER navigation — single source for the home page.
// Site is trimmed to home only (no service/gallery/privacy pages), so the
// menu points at the homepage's own sections. A page passes `pageContent.labels`.

import type { NavLink } from "@garage/shared/types";

export function buildFooterNav(labels: Record<string, string>): NavLink[] {
  return [
    { label: labels["nav.home"] ?? "Home", href: "/" },
    { label: labels["nav.about"] ?? "About", href: "/#about" },
    { label: labels["nav.services"] ?? "Services", href: "/#services" },
    { label: labels["nav.fleet"] ?? "Fleet", href: "/#fleet" },
    { label: labels["nav.howItWorks"] ?? "How It Works", href: "/#how-it-works" },
    { label: labels["nav.pricing"] ?? "Pricing", href: "/#pricing" },
    { label: labels["nav.contact"] ?? "Contact Us", href: "/#contact" },
  ];
}

export function buildNav(labels: Record<string, string>): NavLink[] {
  return [
    {
      label: labels["nav.home"] ?? "Home",
      href: "/",
      children: [
        { label: labels["nav.about"] ?? "About", href: "/#about" },
        { label: labels["nav.services"] ?? "Services", href: "/#services" },
        { label: labels["nav.fleet"] ?? "Fleet", href: "/#fleet" },
        { label: labels["nav.howItWorks"] ?? "How It Works", href: "/#how-it-works" },
        { label: labels["nav.pricing"] ?? "Pricing", href: "/#pricing" },
      ],
    },
    { label: labels["nav.contact"] ?? "Contact Us", href: "/#contact" },
  ];
}
