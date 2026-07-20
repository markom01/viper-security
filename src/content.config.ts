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
    hero_image: z.string().optional(),
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
      image: z.string().optional(),
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
    image: z.string().optional(),
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
    nav: z.object({
      home: z.string().optional(),
      about: z.string().optional(),
      fleet: z.string().optional(),
      services: z.string().optional(),
      blog: z.string().optional(),
      contact: z.string().optional(),
      brand: z.string().optional(),
    }).optional(),
    hero: z.object({
      learn_more: z.string().optional(),
      explore_fleet: z.string().optional(),
    }).optional(),
    form: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      destination: z.string().optional(),
      date: z.string().optional(),
      service: z.string().optional(),
      success: z.string().optional(),
      error: z.string().optional(),
    }).optional(),
    marquee_text: z.string().optional(),
    about: z.object({
      subheadline: z.string().optional(),
      heading: z.string().optional(),
      text: z.string().optional(),
      button: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
    services: z.object({
      subheadline: z.string().optional(),
      all: z.string().optional(),
    }).optional(),
    fleet: z.object({
      subheadline: z.string().optional(),
      heading: z.string().optional(),
      year: z.string().optional(),
      seats: z.string().optional(),
      baggage: z.string().optional(),
    }).optional(),
    stats: z.object({
      heading: z.string().optional(),
      subheading: z.string().optional(),
      button: z.string().optional(),
      items: z.array(z.object({
        label: z.string(),
        title: z.string(),
      })).optional(),
    }).optional(),
    howitworks: z.object({
      subheadline: z.string().optional(),
      heading: z.string().optional(),
    }).optional(),
    cta: z.object({
      heading: z.string().optional(),
      text: z.string().optional(),
      button: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
    bottomcta: z.object({
      heading: z.string().optional(),
      button_services: z.string().optional(),
      button_fleet: z.string().optional(),
      values: z.array(z.object({
        title: z.string(),
        text: z.string(),
      })).optional(),
    }).optional(),
    footer: z.object({
      button: z.string().optional(),
      pages: z.string().optional(),
      home: z.string().optional(),
      about: z.string().optional(),
      fleet: z.string().optional(),
      services: z.string().optional(),
      contact: z.string().optional(),
      powered: z.string().optional(),
      designed: z.string().optional(),
      webflow: z.string().optional(),
      am_templates: z.string().optional(),
    }).optional(),
    pricing: z.object({
      title: z.string().optional(),
      hourly_heading: z.string().optional(),
      airport_heading: z.string().optional(),
    }).optional(),
    membership: z.object({
      title: z.string().optional(),
      heading: z.string().optional(),
      badge: z.string().optional(),
      per_year: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { hero, 'how-it-works': howItWorks, services, fleet, pricing, membership, 'page-content': pageContent };
