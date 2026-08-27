import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import {
  homeSchema, serviceSchema, galleryItemSchema, privacySchema, siteGlobalsSchema,
} from "@garage/shared/content/schemas";

const home = defineCollection({
  loader: glob({ pattern: "content.yaml", base: "./src/content/home" }),
  schema: homeSchema,
});

const service = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/services" }),
  schema: serviceSchema,
});

const gallery = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/gallery" }),
  schema: galleryItemSchema,
});

const privacy = defineCollection({
  loader: glob({ pattern: "content.md", base: "./src/content/privacy" }),
  schema: privacySchema,
});

const site = defineCollection({
  loader: glob({ pattern: "content.yaml", base: "./src/content/site" }),
  schema: siteGlobalsSchema,
});

export const collections = { home, service, gallery, privacy, site };
