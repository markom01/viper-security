import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const hero = defineCollection({
  loader: glob({ pattern: '**/hero/*.md', base: './src/content' }),
  schema: z.object({
    brand_name: z.string(),
    tagline: z.string(),
    subtitle: z.string(),
    cta_text: z.string(),
    phone_italy: z.string().optional(),
    phone_spain: z.string().optional(),
  }),
});

const servicesMarbella = defineCollection({
  loader: glob({ pattern: '**/services/marbella.md', base: './src/content' }),
  schema: z.object({
    location_name: z.string(),
    airport_routes: z.array(z.string()),
    villa_transfers: z.string(),
    yacht_marinas: z.array(z.string()),
    business_services: z.array(z.string()),
    nightlife_venues: z.array(z.string()),
  }),
});

const servicesMilano = defineCollection({
  loader: glob({ pattern: '**/services/milano.md', base: './src/content' }),
  schema: z.object({
    location_name: z.string(),
    airport_routes: z.array(z.string()),
    villa_transfers: z.string(),
    yacht_transfers_desc: z.string(),
    business_services: z.array(z.string()),
    nightlife_venues: z.array(z.string()),
  }),
});

const fleet = defineCollection({
  loader: glob({ pattern: '**/fleet/*.md', base: './src/content' }),
  schema: z.object({
    vehicle_name: z.string(),
    features: z.array(z.string()),
    capacity_passengers: z.string(),
    capacity_suitcases: z.number(),
    capacity_carryon: z.number(),
  }),
});

const pricingHourly = defineCollection({
  loader: glob({ pattern: '**/pricing/hourly.md', base: './src/content' }),
  schema: z.object({
    rates: z.array(
      z.object({
        hours: z.string(),
        price: z.number(),
      })
    ),
  }),
});

const pricingAirport = defineCollection({
  loader: glob({ pattern: '**/pricing/airport-transfers.md', base: './src/content' }),
  schema: z.object({
    routes: z.array(
      z.object({
        route: z.string(),
        price_from: z.number(),
      })
    ),
  }),
});

const membership = defineCollection({
  loader: glob({ pattern: '**/membership/*.md', base: './src/content' }),
  schema: z.object({
    tiers: z.array(
      z.object({
        name: z.string(),
        price: z.number(),
        benefits: z.array(z.string()),
        is_featured: z.boolean().default(false),
      })
    ),
  }),
});

export const collections = {
  hero,
  'services-marbella': servicesMarbella,
  'services-milano': servicesMilano,
  fleet,
  'pricing-hourly': pricingHourly,
  'pricing-airport': pricingAirport,
  membership,
};
