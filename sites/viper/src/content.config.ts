import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  homeSchema, serviceSchema, fleetVehicleSchema, pricingSchema,
  membershipSchema, privacySchema, siteGlobalsSchema,
} from "@garage/shared/content/schemas";

const home = defineCollection({
  loader: glob({ pattern: "content.yaml", base: "./src/content/home" }),
  schema: homeSchema,
});

const service = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/services" }),
  schema: serviceSchema,
});

const fleet = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/fleet" }),
  schema: fleetVehicleSchema,
});

const pricing = defineCollection({
  loader: glob({ pattern: "hourly.yaml", base: "./src/content/pricing" }),
  schema: pricingSchema,
});

const membership = defineCollection({
  loader: glob({ pattern: "tiers.yaml", base: "./src/content/membership" }),
  schema: membershipSchema,
});

const privacy = defineCollection({
  loader: glob({ pattern: "content.md", base: "./src/content/privacy" }),
  schema: privacySchema,
});

const site = defineCollection({
  loader: glob({ pattern: "content.yaml", base: "./src/content/site" }),
  schema: siteGlobalsSchema,
});

export const collections = { home, service, fleet, pricing, membership, privacy, site };
