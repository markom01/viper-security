/**
 * Single source of truth for DB Custom Garage site identity + PWA config.
 * Consumed by astro.config.mjs (PWA options) and any runtime component.
 * Theme colors here mirror the brand tokens in theme.css / CMS.
 */
export const site = {
  name: "DB Custom Garage",
  shortName: "DB Garage",
  description:
    "DB Custom Garage — bespoke custom car builds, restorations, and performance tuning.",
  url: "https://dbcustomgarage.netlify.app",
  themeColor: "#ea580c",
  bgColor: "#000000",
};

export type SiteConfig = typeof site;