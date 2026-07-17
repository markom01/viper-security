/**
 * Shared content types for React components.
 * Mirrors src/content.config.ts Zod schemas.
 * Data is fetched in Astro pages and passed as props to React components.
 */

/**
 * @typedef {Object} HeroData
 * @property {string} brand_name
 * @property {string} tagline
 * @property {string} subtitle
 * @property {string} cta_text
 * @property {string} [phone_italy]
 * @property {string} [phone_spain]
 */

/**
 * @typedef {Object} HowItWorksData
 * @property {Array<{step: string, title: string, text: string}>} steps
 */

/**
 * @typedef {Object} ServicesLocationData
 * @property {string} location_name
 * @property {string[]} airport_routes
 * @property {string} villa_transfers
 * @property {string[]} [yacht_marinas]
 * @property {string} [yacht_transfers_desc]
 * @property {string[]} business_services
 * @property {string[]} nightlife_venues
 */

/**
 * @typedef {Object} FleetData
 * @property {string} vehicle_name
 * @property {string[]} features
 * @property {string} capacity_passengers
 * @property {number} capacity_suitcases
 * @property {number} capacity_carryon
 */

/**
 * @typedef {Object} PricingRate
 * @property {string} hours
 * @property {number} price
 */

/**
 * @typedef {Object} PricingRoute
 * @property {string} route
 * @property {number} price_from
 */

/**
 * @typedef {Object} PricingHourlyData
 * @property {PricingRate[]} rates
 * @property {string} [body] — markdown body text
 */

/**
 * @typedef {Object} PricingAirportData
 * @property {PricingRoute[]} routes
 */

/**
 * @typedef {Object} MembershipTier
 * @property {string} name
 * @property {number} price
 * @property {string[]} benefits
 * @property {boolean} [is_featured]
 */

/**
 * @typedef {Object} MembershipData
 * @property {MembershipTier[]} tiers
 */

/**
 * @typedef {Object} FaqData
 * @property {Array<{q: string, a: string}>} questions
 */

export {};
