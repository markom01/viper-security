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
  /**
   * Per-vehicle spec rows rendered right of the image (label/value pairs).
   * When present they replace the legacy passenger-car fields (year/seats/
   * baggage/capacities) — e.g. a hauler with trailer has no seats/baggage.
   */
  specs?: { label: string; value: string }[];
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
  // ------ Per-service detail-page fields (shared across VIPER + DBC) -------
  /** Route slug for the generated `/services/<slug>` page. Derived from title if omitted. */
  slug?: string;
  /** Per-page SEO (title/description/og image URL) for the generated service page. */
  seo?: {
    title?: string;
    description?: string;
    /** Path/URL to the og image (matches page-content `seo.image` convention). */
    image?: string;
  };
  /** Per-service Hero overrides — subtitle, CTA label, background image. */
  hero?: {
    subtitle?: string;
    cta_text?: string;
    image?: ImageMetadata;
    tagline?: string;
  };
  /** Per-service About section copy (overrides generic page-content about). */
  about_text?: string;
  /** Per-service About section image (rendered when about_text present). */
  about_image?: ImageMetadata;
  /** Marquee band copy for the service page (falls back to site marquee label). */
  marquee?: string;
  /** "What falls under this service" items (Services / includes). */
  include?: {
    title: string;
    text: string;
    /** Per-card background image (rendered under the onyx overlay in Services.astro). */
    image?: ImageMetadata;
  }[];
  /** Why-Choose-Us band (BottomCta values) for the service page. */
  bottomcta?: {
    heading?: string;
    values?: {
      title: string;
      text: string;
    }[];
  };
  /** Service-specific lead-form extra fields (name/phone/date/message are fixed).
   *  `type: "location"` renders a Photon address-autocomplete input (Origin,
   *  Destination, ...); `type: "country"` restricts the dropdown to countries
   *  (Photon layer=country, worldwide); `type: "text"` (default) is a plain input. */
  form_fields?: {
    label: string;
    placeholder?: string;
    name: string;
    type?: "text" | "location" | "country";
    /** Which side of the form the field renders on. Default "left" (after
     *  Phone, before the date/message block). "right" places it after the
     *  date field on the right column — used to balance rows so e.g. a
     *  Vehicle type input fills the 2nd row instead of dropping to a 3rd. */
    side?: "left" | "right";
  }[];
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
  /** Display row: label + optional price (empty price = "on request"). */
  routes: { label: string; price?: string }[];
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
  howitworks?: { heading?: string };
  /** Vehicle brand/model (VIPER: "Mercedes-Benz S-Class"), from {vehicle} template. */
  vehicle_name?: string;
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
