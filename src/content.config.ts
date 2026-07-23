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
      image: z.string().optional(),
    })),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/services" }),
  schema: z.object({
    offerings: z.array(z.object({
      region: z.string(),
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
    jsonld: z.object({
      org_name: z.string().optional(),
      org_url: z.string().optional(),
      org_logo: z.string().optional(),
      org_description: z.string().optional(),
      phoneSpain: z.string().optional(),
      phoneItaly: z.string().optional(),
    }).optional(),
    booking_data: z.object({
      spain: z.object({
        label: z.string(),
        short_label: z.string().optional(),
        services: z.array(z.object({
          name: z.string(),
          routes: z.array(z.object({
            route: z.string(),
            price: z.string().optional(),
          })),
        })),
      }),
      italy: z.object({
        label: z.string(),
        short_label: z.string().optional(),
        services: z.array(z.object({
          name: z.string(),
          routes: z.array(z.object({
            route: z.string(),
            price: z.string().optional(),
          })),
        })),
      }),
    }).optional(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      theme_color: z.string().optional(),
    }).optional(),
    about: z.object({
      heading: z.string().optional(),
      text: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
    fleet: z.object({
      heading: z.string().optional(),
    }).optional(),
    stats: z.object({
      subheading: z.string().optional(),
      items: z.array(z.object({
        label: z.string(),
        title: z.string(),
      })).optional(),
    }).optional(),
    howitworks: z.object({
      heading: z.string().optional(),
    }).optional(),
    cta: z.object({
      heading: z.string().optional(),
      text: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
    bottomcta: z.object({
      heading: z.string().optional(),
      values: z.array(z.object({
        title: z.string(),
        text: z.string(),
      })).optional(),
    }).optional(),
    branding: z.object({
      luxury_without_limits: z.string().optional(),
      professional_discreet_reliable: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { hero, 'how-it-works': howItWorks, services, fleet, pricing, membership, 'page-content': pageContent };
