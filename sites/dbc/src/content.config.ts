import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

// dbc content collections — mirror VIPER's schema so shared @sections render.
// Subset only what a garage homepage needs; booking_data (chauffeur regions) omitted.

const hero = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/hero" }),
  schema: () =>
    z.object({
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
    steps: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        image: z.string().optional(),
      }),
    ),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/services" }),
  schema: () =>
    z.object({
      offerings: z.array(
        z.object({
          region: z.string(),
          title: z.string(),
          description: z.string(),
          image: z.string().optional(),
          // Per-service detail-page fields (shared shape with VIPER)
          slug: z.string().optional(),
          seo: z
            .object({
              title: z.string().optional(),
              description: z.string().optional(),
              image: z.string().optional(),
            })
            .optional(),
          hero: z
            .object({
              subtitle: z.string().optional(),
              cta_text: z.string().optional(),
              image: z.string().optional(),
              tagline: z.string().optional(),
            })
            .optional(),
          about_text: z.string().optional(),
          about_image: z.string().optional(),
          marquee: z.string().optional(),
          include: z
            .array(
              z.object({
                title: z.string(),
                text: z.string(),
                image: z.string().optional(),
              }),
            )
            .optional(),
          bottomcta: z
            .object({
              heading: z.string().optional(),
              values: z
                .array(
                  z.object({
                    title: z.string(),
                    text: z.string(),
                  }),
                )
                .optional(),
            })
            .optional(),
          form_fields: z
            .array(
              z.object({
                label: z.string(),
                placeholder: z.string().optional(),
                name: z.string(),
                // "location" → Photon address-autocomplete input; "country" → country-only
                // autocomplete (Photon layer=country); "vehicle" → car/bike model datalist;
                // "text" (default) → plain input.
                type: z.enum(["text", "location", "country", "vehicle"]).optional(),
                // Which form column the field renders in (default "left").
                side: z.enum(["left", "right"]).optional(),
              }),
            )
            .optional(),
          // Per-service fleet vehicles — only supercar-transport today. Mirrors the
          // VIPER `fleet` collection shape so the shared Fleet section renders.
          fleet: z
            .array(
              z.object({
                name: z.string(),
                type: z.string().optional(),
                year: z.string().optional(),
                seats: z.string().optional(),
                baggage: z.string().optional(),
                capacity_passengers: z.number().optional(),
                capacity_suitcases: z.number().optional(),
                capacity_carryon: z.number().optional(),
                // Right-of-image spec rows (label/value) — used when the vehicle
                // isn't a passenger car (e.g. hauler with trailer). Replaces the
                // passenger fields above when present.
                specs: z
                  .array(z.object({ label: z.string(), value: z.string() }))
                  .optional(),
                features: z.array(z.string()).optional(),
                image: z.string().optional(),
              }),
            )
            .optional(),
        }),
      ),
    }),
});

const pageContent = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/page-content" }),
  schema: () =>
    z.object({
      jsonld: z
        .object({
          org_name: z.string().optional(),
          org_url: z.string().optional(),
          org_logo: z.string().optional(),
          org_description: z.string().optional(),
          phoneSpain: z.string().optional(),
          phoneItaly: z.string().optional(),
          webSiteName: z.string().optional(),
          webSiteUrl: z.string().optional(),
        })
        .optional(),
      seo: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
          theme_color: z.string().optional(),
          image: z.string().optional(),
        })
        .optional(),
      fleet: z
        .object({
          heading: z.string().optional(),
        })
        .optional(),
      about: z
        .object({
          heading: z.string().optional(),
          text: z.string().optional(),
          image: z.string().optional(),
          images: z.array(z.string()).optional(),
        })
        .optional(),
      stats: z
        .object({
          subheading: z.string().optional(),
          image: z.string(),
          items: z
            .array(
              z.object({
                label: z.string(),
                title: z.string(),
              }),
            )
            .optional(),
        })
        .optional(),
      howitworks: z
        .object({
          heading: z.string().optional(),
        })
        .optional(),
      cta: z
        .object({
          heading: z.string().optional(),
          text: z.string().optional(),
          image: z.string().optional(),
        })
        .optional(),
      bottomcta: z
        .object({
          heading: z.string().optional(),
          values: z
            .array(
              z.object({
                title: z.string(),
                text: z.string(),
              }),
            )
            .optional(),
        })
        .optional(),
      branding: z
        .object({
          luxury_without_limits: z.string().optional(),
          professional_discreet_reliable: z.string().optional(),
        })
        .optional(),
      map_embed_url: z.string().regex(/^https:\/\/(www\.)?google\.[a-z]{2,}(\/\S*)?$/i).optional(),
      labels: z.record(z.string(), z.string()).optional(),
    }),
});

const gallery = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/gallery" }),
  schema: () =>
    z.object({
      name: z.string(),
      alt: z.string().optional(),
      // Gallery grouping key. CMS-curated categories mirror the site sections:
      // brand | supercar | customizing | auction | import-export | all-builds
      category: z
        .enum(["brand", "supercar", "customizing", "auction", "import-export", "all-builds"])
        .default("all-builds"),
      image: z.string(),
    }),
});

export const collections = {
  hero,
  "how-it-works": howItWorks,
  services,
  "page-content": pageContent,
  gallery,
};
