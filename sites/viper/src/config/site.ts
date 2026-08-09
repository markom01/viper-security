/**
 * Single source of truth for VIPER site identity + PWA config.
 * Consumed by astro.config.mjs (PWA options) and any runtime component.
 * Theme colors here mirror the brand tokens in theme.css / CMS.
 */
export const site = {
  name: "VIPER Security",
  shortName: "VIPER",
  description:
    "VIPER Security — luxury chauffeur, executive transport, airport transfers & VIP travel in Spain and Italy.",
  url: "https://viper-security.netlify.app",
  themeColor: "#000000",
  bgColor: "#000000",
};

export type SiteConfig = typeof site;