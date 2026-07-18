import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const hero = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/hero" }),
  schema: z.object({
    brand_name: z.string().optional(),
    tagline: z.string().optional(),
    subtitle: z.string().optional(),
    cta_text: z.string().optional(),
    phone_italy: z.string().optional(),
    phone_spain: z.string().optional(),
  }),
});

const howItWorks = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/how-it-works" }),
  schema: z.object({
    steps: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/services" }),
  schema: z.object({
    region: z.string(),
    services: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })),
  }),
});

const fleet = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/fleet" }),
  schema: z.object({
    name: z.string(),
    type: z.string().optional(),
    year: z.string().optional(),
    seats: z.string().optional(),
    baggage: z.string().optional(),
    capacity_passengers: z.number().optional(),
    capacity_suitcases: z.number().optional(),
    capacity_carryon: z.number().optional(),
    features: z.array(z.string()).optional(),
  }),
});

const pricing = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/pricing" }),
  schema: z.object({
    type: z.string().optional(),
    rates: z.array(z.object({
      name: z.string(),
      price: z.string(),
    })).optional(),
    routes: z.array(z.object({
      route: z.string(),
      price: z.string(),
    })).optional(),
  }),
});

const membership = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/membership" }),
  schema: z.object({
    tiers: z.array(z.object({
      name: z.string(),
      price: z.string(),
      is_featured: z.boolean().optional(),
      benefits: z.array(z.string()),
    })),
  }),
});

const pageContent = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/page-content" }),
  schema: z.object({
    nav_home: z.string().optional(),
    nav_about: z.string().optional(),
    nav_fleet: z.string().optional(),
    nav_services: z.string().optional(),
    nav_blog: z.string().optional(),
    nav_contact: z.string().optional(),
    hero_learn_more: z.string().optional(),
    hero_explore_fleet: z.string().optional(),
    form_name: z.string().optional(),
    form_phone: z.string().optional(),
    form_pickup: z.string().optional(),
    form_date: z.string().optional(),
    form_service: z.string().optional(),
    form_success: z.string().optional(),
    form_error: z.string().optional(),
    marquee_text: z.string().optional(),
    about_subheadline: z.string().optional(),
    about_heading: z.string().optional(),
    about_text: z.string().optional(),
    about_button: z.string().optional(),
    services_subheadline: z.string().optional(),
    services_all: z.string().optional(),
    fleet_subheadline: z.string().optional(),
    fleet_heading: z.string().optional(),
    fleet_year: z.string().optional(),
    fleet_seats: z.string().optional(),
    fleet_baggage: z.string().optional(),
    stats_heading: z.string().optional(),
    stats_subheading: z.string().optional(),
    stats_button: z.string().optional(),
    stats_label_1: z.string().optional(),
    stats_title_1: z.string().optional(),
    stats_label_2: z.string().optional(),
    stats_title_2: z.string().optional(),
    stats_label_3: z.string().optional(),
    stats_title_3: z.string().optional(),
    stats_label_4: z.string().optional(),
    stats_title_4: z.string().optional(),
    howitworks_subheadline: z.string().optional(),
    howitworks_heading: z.string().optional(),
    cta_heading: z.string().optional(),
    cta_text: z.string().optional(),
    cta_button: z.string().optional(),
    bottomcta_heading: z.string().optional(),
    bottomcta_button_services: z.string().optional(),
    bottomcta_button_fleet: z.string().optional(),
    bottomcta_value_1_title: z.string().optional(),
    bottomcta_value_1_text: z.string().optional(),
    bottomcta_value_2_title: z.string().optional(),
    bottomcta_value_2_text: z.string().optional(),
    bottomcta_value_3_title: z.string().optional(),
    bottomcta_value_3_text: z.string().optional(),
    footer_button: z.string().optional(),
    footer_pages: z.string().optional(),
    footer_home: z.string().optional(),
    footer_about: z.string().optional(),
    footer_fleet: z.string().optional(),
    footer_services: z.string().optional(),
    footer_contact: z.string().optional(),
    footer_powered: z.string().optional(),
    footer_designed: z.string().optional(),
    footer_webflow: z.string().optional(),
    footer_am_templates: z.string().optional(),
    pricing_title: z.string().optional(),
    pricing_hourly_heading: z.string().optional(),
    pricing_airport_heading: z.string().optional(),
    membership_title: z.string().optional(),
    membership_heading: z.string().optional(),
    membership_badge: z.string().optional(),
    membership_per_year: z.string().optional(),
    nav_brand: z.string().optional(),
  }),
});

export const collections = { hero, 'how-it-works': howItWorks, services, fleet, pricing, membership, 'page-content': pageContent };
