/**
 * Single source of truth for DB Custom Garage site identity + PWA config.
 * Consumed by astro.config.mjs (PWA options) and any runtime component.
 * Theme colors here mirror the brand tokens in theme.css / CMS.
 */
export const site = {
  name: "DB Custom Garage",
  shortName: "DB Garage",
  description:
    "DB Custom Garage — supercar and classic car transport, sale & auction, import/export logistics, and bespoke customizing and design.",
  url: "https://dbcustomgarage.netlify.app",
  themeColor: "#ea580c",
  bgColor: "#000000",
  /**
   * WhatsApp number for the garage enquiry form (international format,
   * digits only, e.g. "447700900123"). Empty string disables the wa.me path
   * and the form shows a config error instead of silently failing.
   * Verified from old Wix site footer (RESEARCH §1): +34 617 201 441.
   */
  whatsappNumber: "34617201441",
};

export type SiteConfig = typeof site;
