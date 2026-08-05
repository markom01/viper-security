import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// dbc content collections — mirror VIPER's schema so shared @sections render.
// Subset only what a garage homepage needs; booking_data (chauffeur regions) omitted.

const hero = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/hero" }),
  schema: z.object({
    brand_name: z.string().optional(),
    tagline: z.string().optional(),
    subtitle: z.string().optional(),
    cta_text: z.string().optional(),
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
      webSiteName: z.string().optional(),
      webSiteUrl: z.string().optional(),
    }).optional(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      theme_color: z.string().optional(),
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
    labels: z.record(z.string(), z.string()).optional(),
  }),
});

export const collections = { hero, 'how-it-works': howItWorks, services, 'page-content': pageContent };