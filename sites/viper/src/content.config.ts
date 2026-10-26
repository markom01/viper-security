import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  homeSchema,
  fleetVehicleSchema,
  pricingSchema,
  membershipSchema,
  siteGlobalsSchema,
  serviceSchema,
  galleryItemSchema,
} from "@garage/shared/content/schemas";

const home = defineCollection({
  loader: glob({ pattern: "content.yaml", base: "./src/content/home" }),
  schema: homeSchema,
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

const site = defineCollection({
  loader: glob({ pattern: "content.yaml", base: "./src/content/site" }),
  schema: siteGlobalsSchema,
});

const service = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/services" }),
  schema: serviceSchema,
});

const gallery = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/gallery" }),
  schema: galleryItemSchema,
});

const selling = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/currently-selling" }),
  schema: fleetVehicleSchema,
});

export const collections = {
  home,
  fleet,
  pricing,
  membership,
  site,
  service,
  gallery,
  selling,
};
