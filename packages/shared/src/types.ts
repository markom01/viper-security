// ---------------------------------------------------------------------------
// TypeScript interfaces derived from Astro content collection Zod schemas
// (src/content.config.ts). These mirror the exact shapes validated at build
// time so template callbacks have proper type inference.
// ---------------------------------------------------------------------------

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
  image?: string;
}

export interface FleetEntry {
  id: string;
  collection: 'fleet';
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
  image?: string;
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
