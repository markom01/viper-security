// ---------------------------------------------------------------------------
// TypeScript interfaces derived from Astro content collection Zod schemas
// (src/content.config.ts). These mirror the exact shapes validated at build
// time so template callbacks have proper type inference.
// ---------------------------------------------------------------------------
import type { ImageMetadata } from "astro";

// ----- Fleet ---------------------------------------------------------------
export interface FleetVehicleData {
  name: string;
  type?: string;
  year?: string;
  seats?: string;
  baggage?: string;
  capacity_passengers?: number;
  capacity_suitcases?: number;
  capacity_carryon?: number;
  features?: string[];
  image?: ImageMetadata;
}

export interface FleetEntry {
  id: string;
  collection: "fleet";
  data: FleetVehicleData;
  body?: string;
  rendered?: unknown;
  filePath?: string;
}

// ----- Services / Offerings ------------------------------------------------
export interface ServiceOffering {
  region: string;
  title: string;
  description: string;
  image?: ImageMetadata;
}

// ----- Membership ----------------------------------------------------------
export interface MembershipTier {
  name: string;
  price: string;
  is_featured?: boolean;
  benefits: string[];
}

// ----- Pricing -------------------------------------------------------------
export interface PricingRate {
  name: string;
  price: string;
}

export interface PricingRoute {
  route: string;
  price?: string;
}

export interface BookingService {
  name: string;
  routes: PricingRoute[];
}

// ----- page-content / booking_data -----------------------------------------
export interface BookingRegion {
  label: string;
  short_label?: string;
  region?: string;
  services: BookingService[];
}

export interface BookingData {
  spain: BookingRegion;
  italy: BookingRegion;
}

// ----- Pricing card (derived, not from Zod) --------------------------------
export interface PricingCardSection {
  title: string;
  routes: { label: string; price: string }[];
}

export interface PricingCard {
  name: string;
  shortLabel: string;
  sections: PricingCardSection[];
}

// ----- Navigation / Footer --------------------------------------------------
export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

// ----- page-content (shared across sites) -----------------------------------
// Mirrors the page-content content-collection Zod schema (both sites' schemas
// are structurally identical here). Sections + layouts read these fields.
// CMS-driven; most are optional and only present when configured in content.md.
export interface PageContent {
  labels?: Record<string, string>;
  seo?: {
    title?: string;
    description?: string;
    theme_color?: string;
    /** Absolute or site-root-relative og:image URL. */
    image?: string;
  };
  jsonld?: {
    org_name?: string;
    org_url?: string;
    org_logo?: string;
    org_description?: string;
    phoneSpain?: string;
    phoneItaly?: string;
    webSiteName?: string;
    webSiteUrl?: string;
    privacy_policy?: string;
  };
  fleet?: { heading?: string };
  about?: { heading?: string; text?: string; image?: ImageMetadata };
  stats?: {
    subheading?: string;
    image: ImageMetadata;
    items?: Array<{ label: string; title: string }>;
  };
  cta?: { heading?: string; text?: string; image?: ImageMetadata };
  bottomcta?: {
    heading?: string;
    values?: Array<{ title: string; text: string }>;
  };
  branding?: {
    luxury_without_limits?: string;
    professional_discreet_reliable?: string;
  };
  map_embed_url?: string;
  /** VIPER-only: booking_data used for {placeholder} templates. */
  booking_data?: {
    spain?: { short_label?: string; label?: string; region?: string };
    italy?: { short_label?: string; label?: string; region?: string };
  };
}
