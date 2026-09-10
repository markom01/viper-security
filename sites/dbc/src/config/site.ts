/**
 * Single source of truth for DB Custom Garage site identity + PWA config.
 * Consumed by astro.config.mjs (PWA options) and any runtime component.
 * Theme colors here mirror the brand tokens in theme.css / CMS.
 */
export const site = {
  name: "DB Custom Garage",
  shortName: "DB Custom Garage",
  description:
    "DB Custom Garage — supercar and classic car transport, sale & auction, import/export logistics, and bespoke customizing and design.",
  url: "https://dbcustomgarage.com",
  themeColor: "#ea580c",
  bgColor: "#000000",
  /**
   * WhatsApp number for the garage enquiry form (international format,
   * digits only, e.g. "447700900123"). Empty string disables the wa.me path
   * and the form shows a config error instead of silently failing.
   * Current Spain line: +34 670 038 541 (the old +34 637 137 730 stays
   * visible in the footer only).
   */
  whatsappNumber: "34670038541",
};

export type SiteConfig = typeof site;
