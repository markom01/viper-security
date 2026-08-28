import type { ImageMetadata } from "astro";

export interface HomeData {
  hero: {
    brand_name?: string; tagline?: string; subtitle?: string;
    cta_text?: string; hero_image?: string; phone_italy?: string; phone_spain?: string;
  };
  services: { offerings: {
    region: string; title: string; description: string;
    image?: string; slug?: string;
  }[] };
}

export interface ServiceDetailData {
  title: string; slug?: string; description?: string; marquee?: string;
  /** Per-page SEO (title/description/og image URL) for the generated service page. */
  seo?: { title?: string; description?: string; image?: string };
  about_text?: string; about_image?: string;
  hero?: { subtitle?: string; cta_text?: string; tagline?: string; image?: string };
  steps?: { title: string; description: string }[];
  include?: { title: string; text: string; image?: string }[];
  stats?: { heading?: string; subheading?: string; image?: string; items?: { label: string; title: string }[] };
  cta?: { heading?: string; text?: string; image?: string };
  howitworks?: { heading?: string };
  form_fields?: { label: string; placeholder?: string; name: string;
    type?: "text" | "location" | "country" | "vehicle"; side?: "left" | "right" }[];
  bottomcta?: { heading?: string; values?: { title: string; text: string }[] };
  fleet_section?: { heading?: string; subheadline?: string };
  fleet?: {
    name: string; type?: string; year?: string; seats?: string; baggage?: string;
    capacity_passengers?: number; capacity_suitcases?: number; capacity_carryon?: number;
    specs?: { label: string; value: string }[]; features?: string[]; image?: string;
  }[];
}

export interface SiteGlobalsData {
  jsonld?: {
    org_name?: string; org_url?: string; org_logo?: string; org_description?: string;
    phoneSpain?: string; phoneItaly?: string; webSiteName?: string; webSiteUrl?: string;
    privacy_policy?: string;
  };
  booking_data?: {
    spain?: { label?: string; short_label?: string; region?: string;
      services?: { name: string; routes: { route: string; price?: string }[] }[] };
    italy?: { label?: string; short_label?: string; region?: string;
      services?: { name: string; routes: { route: string; price?: string }[] }[] };
  };
  vehicle_name?: string;
  labels?: Record<string, string>;
  howItWorksSteps?: { title: string; description: string; image?: string }[];
  branding?: { luxury_without_limits?: string; professional_discreet_reliable?: string };
  stats?: { subheading?: string; image: string; items?: { label: string; title: string }[] };
  cta?: { heading?: string; text?: string; image?: string };
  bottomcta?: { heading?: string; values?: { title: string; text: string }[] };
  about?: { heading?: string; text?: string; image?: string; images?: string[] };
  seo?: { title?: string; description?: string; theme_color?: string; image?: string };
  map_embed_url?: string;
  fleetHeading?: string;
  howItWorksHeading?: string;
}
