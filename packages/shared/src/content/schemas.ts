import { z } from "astro/zod";
import type { SchemaContext } from "astro:content";

const imagePath = z.string().optional();

// Sveltia CMS "complete output" writes `null` for untouched optional objects.
// Normalize null → undefined so a CMS round-trip can never fail the build;
// valid objects pass through untouched, output type unchanged (T | undefined).
const nullToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v == null ? undefined : v), schema.optional());

export const heroSchema = ({ image: _image }: SchemaContext) =>
  z.object({
    brand_name: z.string().optional(),
    tagline: z.string().optional(),
    subtitle: z.string().optional(),
    cta_text: z.string().optional(),
    hero_image: z.string().optional(),
    phone_italy: z.string().optional(),
    phone_spain: z.string().optional(),
  });

export const offeringSummarySchema = z.object({
  region: z.string(),
  title: z.string(),
  description: z.string(),
  image: imagePath,
  slug: z.string().optional(),
});

export const serviceDetailSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
  marquee: z.string().optional(),
  seo: nullToUndefined(z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
  })),
  about_text: z.string().optional(),
  about_images: z.array(z.string()).optional(),
  hero: nullToUndefined(z.object({
    subtitle: z.string().optional(),
    cta_text: z.string().optional(),
    tagline: z.string().optional(),
    image: z.string().optional(),
  })),
  steps: z.array(z.object({ title: z.string(), description: z.string() })).optional(),
  include: z.array(z.object({
    title: z.string(), text: z.string(), image: z.string().optional(),
  })).optional(),
  stats: nullToUndefined(z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    image: z.string().optional(),
    items: z.array(z.object({ label: z.string(), title: z.string() })).optional(),
  })),
  cta: nullToUndefined(z.object({
    heading: z.string().optional(),
    text: z.string().optional(),
    image: z.string().optional(),
  })),
  // Per-service How-It-Works heading override (site-global howItWorksHeading is
  // the fallback). Steps come from serviceDetailSchema.steps.
  howitworks: nullToUndefined(z.object({ heading: z.string().optional() })),
  form_fields: z.array(z.object({
    label: z.string(), placeholder: z.string().optional(), name: z.string(),
    // "" from CMS means "plain text / unset" — DBC carries the narrow enum; the
    // preprocess keeps the shared schema tolerant of empty strings from YAML.
    type: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.enum(["text", "location", "country", "vehicle", "select", "number"]).optional(),
    ).optional(),
    // Dropdown choices for `type: "select"` (e.g. project type). Free-form
    // text list in CMS; rendered as <option> elements in order.
    options: z.array(z.string()).optional(),
    side: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.enum(["left", "right"]).optional(),
    ).optional(),
  })).optional(),
  bottomcta: nullToUndefined(z.object({
    heading: z.string().optional(),
    values: z.array(z.object({ title: z.string(), text: z.string() })).optional(),
  })),
  // DBC per-service sale-fleet heading override (import/export "Currently Selling"
  // vs site-global "Our Fleet"). Consumed by DBC [slug].astro → assembleService.
  fleet_section: nullToUndefined(z.object({
    heading: z.string().optional(),
    subheadline: z.string().optional(),
  })),
  fleet: z.array(z.object({
    name: z.string(), type: z.string().optional(),
    // CMS number widgets write raw numbers; legacy YAML carries quoted
    // strings ("2024"). Coerce both to string so display code is unchanged.
    year: z.preprocess((v) => (v === "" || v == null ? undefined : String(v)), z.string().optional()).optional(),
    seats: z.preprocess((v) => (v === "" || v == null ? undefined : String(v)), z.string().optional()).optional(),
    baggage: z.preprocess((v) => (v === "" || v == null ? undefined : String(v)), z.string().optional()).optional(),
    capacity_passengers: z.number().optional(), capacity_suitcases: z.number().optional(),
    capacity_carryon: z.number().optional(),
    specs: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    features: z.array(z.string()).optional(), image: z.string().optional(),
  })).optional(),
});

export const statsSchema = nullToUndefined(z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  image: z.string(),
  items: z.array(z.object({ label: z.string(), title: z.string() })).optional(),
}));

export const ctaSchema = nullToUndefined(z.object({
  heading: z.string().optional(), text: z.string().optional(), image: z.string().optional(),
}));

export const bottomCtaSchema = nullToUndefined(z.object({
  heading: z.string().optional(),
  values: z.array(z.object({ title: z.string(), text: z.string() })).optional(),
}));

export const aboutSchema = nullToUndefined(z.object({
  heading: z.string().optional(), text: z.string().optional(),
  image: z.string().optional(), images: z.array(z.string()).optional(),
}));

// Canonical, reusable section-block group. home / service / site each carry the
// SAME shape (seo, stats, cta, bottomcta, about, branding, labels) so every CMS
// page shares one structure. serviceSchema defines its own copy of these inline
// (per-offering fields differ); this is the shared home/site variant.
export const homePageBlocksSchema = {
  seo: nullToUndefined(z.object({
    title: z.string().optional(), description: z.string().optional(),
    theme_color: z.string().optional(), image: z.string().optional(),
  })),
  stats: statsSchema,
  cta: ctaSchema,
  bottomcta: bottomCtaSchema,
  about: aboutSchema,
  branding: nullToUndefined(z.object({
    logo: z.string().optional(),
    luxury_without_limits: z.string().optional(),
    professional_discreet_reliable: z.string().optional(),
  })),
  labels: z.record(z.string(), z.string()).optional(),
  // Home-page How It Works (heading + steps). Omitted/empty → siteGlobals
  // howItWorksHeading / howItWorksSteps fallback. (serviceDetailSchema carries
  // its own per-service `howitworks.heading` override only — steps come from its
  // own `steps` field — so this home-only block does not collide with it.)
  howitworks: nullToUndefined(z.object({
    heading: z.string().optional(),
    steps: z.array(z.object({ title: z.string(), description: z.string() })).optional(),
  })),
};

export const siteGlobalsSchema = z.object({
  jsonld: nullToUndefined(z.object({
    org_name: z.string().optional(), org_url: z.string().optional(),
    org_logo: z.string().optional(), org_description: z.string().optional(),
    phoneSpain: z.string().optional(), phoneItaly: z.string().optional(),
    phoneSpainWhatsapp: z.string().optional(),
    webSiteName: z.string().optional(), webSiteUrl: z.string().optional(),
    privacy_policy: z.string().optional(),
  })),
  booking_data: nullToUndefined(z.object({
    spain: z.object({
      label: z.string().optional(), short_label: z.string().optional(), region: z.string().optional(),
      services: z.array(z.object({
        name: z.string(), routes: z.array(z.object({ route: z.string(), price: z.string().optional() })),
      })),
    }),
    italy: z.object({
      label: z.string().optional(), short_label: z.string().optional(), region: z.string().optional(),
      services: z.array(z.object({
        name: z.string(), routes: z.array(z.object({ route: z.string(), price: z.string().optional() })),
      })),
    }),
  })),
  vehicle_name: z.string().optional(),
  labels: z.record(z.string(), z.string()).optional(),
  howItWorksSteps: z.array(z.object({
    title: z.string(), description: z.string(), image: z.string().optional(),
  })).optional(),
  branding: nullToUndefined(z.object({
    logo: z.string().optional(),
    luxury_without_limits: z.string().optional(),
    professional_discreet_reliable: z.string().optional(),
  })),
  stats: statsSchema,
  cta: ctaSchema,
  bottomcta: bottomCtaSchema,
  about: aboutSchema,
  seo: nullToUndefined(z.object({
    title: z.string().optional(), description: z.string().optional(),
    theme_color: z.string().optional(), image: z.string().optional(),
  })),
  map_embed_url: z.string().regex(/^https:\/\/(www\.)?google\.[a-z]{2,}(\/\S*)?$/i).optional(),
  /** CMS-editable company/address block rendered under the footer logo.
   *  Multiline plain text; empty/omitted → block hidden (e.g. VIPER until data exists). */
  footer_company_info: z.string().optional(),
  fleetHeading: z.string().optional(),
  howItWorksHeading: z.string().optional(),
});

export const fleetVehicleSchema = z.object({
  name: z.string(), type: z.string().optional(),
  year: z.preprocess((v) => (v === "" || v == null ? undefined : String(v)), z.string().optional()).optional(),
  seats: z.preprocess((v) => (v === "" || v == null ? undefined : String(v)), z.string().optional()).optional(),
  baggage: z.preprocess((v) => (v === "" || v == null ? undefined : String(v)), z.string().optional()).optional(),
  capacity_passengers: z.number().optional(), capacity_suitcases: z.number().optional(),
  capacity_carryon: z.number().optional(),
  specs: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  features: z.array(z.string()).optional(), image: z.string().optional(),
});

export const galleryItemSchema = z.object({
  name: z.string(), alt: z.string().optional(),
  category: z.enum(["brand", "supercar", "customizing", "auction", "import-export", "all-builds"]).default("all-builds"),
  image: z.string(),
});

export const pricingSchema = z.object({
  type: z.string().optional(),
  rates: z.array(z.object({ name: z.string(), price: z.string() })).optional(),
  routes: z.array(z.object({ route: z.string(), price: z.string() })).optional(),
});

export const membershipSchema = z.object({
  tiers: z.array(z.object({
    name: z.string(), price: z.string(), hours: z.number().optional(),
    is_featured: z.boolean().optional(), benefits: z.array(z.string()),
  })),
});

export const homeSchema = ({ image: _image }: SchemaContext) =>
  z.object({
    hero: heroSchema({ image: _image }),
    services: z.object({ offerings: z.array(offeringSummarySchema) }),
    // Canonical section blocks — mirror service/site so every DBC page shares
    // the same CMS structure. Empty object / omitted → siteGlobals fallback.
    seo: homePageBlocksSchema.seo,
    stats: homePageBlocksSchema.stats,
    cta: homePageBlocksSchema.cta,
    bottomcta: homePageBlocksSchema.bottomcta,
    about: homePageBlocksSchema.about,
    branding: homePageBlocksSchema.branding,
    labels: homePageBlocksSchema.labels,
    howitworks: homePageBlocksSchema.howitworks,
  });

export const serviceSchema = ({ image: _image }: SchemaContext) => serviceDetailSchema;

export const privacySchema = z.object({ heading: z.string().optional() });
