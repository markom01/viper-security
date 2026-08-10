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
  /**
   * WhatsApp number for the garage enquiry form (international format,
   * digits only, e.g. "447700900123"). Empty string disables the wa.me path
   * and the form shows a config error instead of silently failing.
   * Currently empty — no public WhatsApp is verified for DB Custom Garage.
   */
  whatsappNumber: "",
};

export type SiteConfig = typeof site;
