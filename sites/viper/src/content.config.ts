import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const hero = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/hero" }),
  schema: () =>
    z.object({
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
          // Per-service detail-page fields (shared shape with DBC)
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
          // Per-service How-It-Works steps — rendered on the service page when
          // present, otherwise the site-global steps from how-it-works.
          steps: z
            .array(
              z.object({
                title: z.string(),
                description: z.string(),
              }),
            )
            .optional(),
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
          stats: z
            .object({
              subheading: z.string().optional(),
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
          cta: z
            .object({
              heading: z.string().optional(),
              text: z.string().optional(),
            })
            .optional(),
          form_fields: z
            .array(
              z.object({
                label: z.string(),
                placeholder: z.string().optional(),
                name: z.string(),
                // "location" → Photon address-autocomplete input; "country" → country-only
                // autocomplete (Photon layer=country); "text" (default) → plain input.
                type: z.enum(["text", "location", "country", "vehicle"]).optional(),
              }),
            )
            .optional(),
        }),
      ),
    }),
});

const fleet = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/fleet" }),
  schema: () =>
    z.object({
      name: z.string(),
      type: z.string().optional(),
      year: z.string().optional(),
      seats: z.string().optional(),
      baggage: z.string().optional(),
      capacity_passengers: z.number().optional(),
      capacity_suitcases: z.number().optional(),
      capacity_carryon: z.number().optional(),
      // Right-of-image spec rows (label/value) — replaces the passenger fields
      // when present (shared Fleet section, shared FleetVehicleData type).
      specs: z
        .array(z.object({ label: z.string(), value: z.string() }))
        .optional(),
      features: z.array(z.string()).optional(),
      image: z.string().optional(),
    }),
});

const pricing = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/pricing" }),
  schema: z.object({
    type: z.string().optional(),
    rates: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    routes: z
      .array(
        z.object({
          route: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
  }),
});

const membership = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/membership" }),
  schema: z.object({
    tiers: z.array(
      z.object({
        name: z.string(),
        price: z.string(),
        hours: z.number().optional(),
        is_featured: z.boolean().optional(),
        benefits: z.array(z.string()),
      }),
    ),
  }),
});

const pageContent = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/page-content" }),
  schema: () =>
    z.object({
      vehicle_name: z.string().optional(),
      jsonld: z
        .object({
          org_name: z.string().optional(),
          org_url: z.string().optional(),
          org_logo: z.string().optional(),
          org_description: z.string().optional(),
          phoneSpain: z.string().optional(),
          phoneItaly: z.string().optional(),
          privacy_policy: z.string().optional(),
          webSiteName: z.string().optional(),
          webSiteUrl: z.string().optional(),
        })
        .optional(),
      map_embed_url: z.string().regex(/^https:\/\/(www\.)?google\.[a-z]{2,}(\/\S*)?$/i).optional(),
      booking_data: z
        .object({
          spain: z.object({
            label: z.string(),
            short_label: z.string().optional(),
            region: z.string().optional(),
            services: z.array(
              z.object({
                name: z.string(),
                routes: z.array(
                  z.object({
                    route: z.string(),
                    price: z.string().optional(),
                  }),
                ),
              }),
            ),
          }),
          italy: z.object({
            label: z.string(),
            short_label: z.string().optional(),
            region: z.string().optional(),
            services: z.array(
              z.object({
                name: z.string(),
                routes: z.array(
                  z.object({
                    route: z.string(),
                    price: z.string().optional(),
                  }),
                ),
              }),
            ),
          }),
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
      about: z
        .object({
          heading: z.string().optional(),
          text: z.string().optional(),
          image: z.string().optional(),
        })
        .optional(),
      fleet: z
        .object({
          heading: z.string().optional(),
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
      /**
       * CMS-editable UI labels. Flat map of dot-path keys -> string, e.g.
       * "fleet.subheadline": "Our Builds". Sections resolve overrides via
       * resolveLabels(pageContent, STRINGS); keys absent here keep STRINGS.
       */
      labels: z.record(z.string(), z.string()).optional(),
    }),
});

const privacy = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/privacy" }),
  schema: z.object({
    heading: z.string().optional(),
  }),
});

export const collections = {
  hero,
  "how-it-works": howItWorks,
  services,
  fleet,
  pricing,
  membership,
  "page-content": pageContent,
  privacy,
};
