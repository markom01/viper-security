// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import AstroPWA from "@vite-pwa/astro";
import { pwaPluginOptions } from "@garage/shared/pwa";
import { site } from "./src/config/site";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: site.url,
  prefetch: true,
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Work Sans",
      cssVariable: "--font-families--body-font",
      weights: [300, 400, 500, 600, 700],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Noto Serif",
      cssVariable: "--font-families--title-font",
      weights: [400, 500, 600, 700],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Playfair Display",
      cssVariable: "--font-families--accent-font",
      weights: [400, 500, 600, 700, 800, 900],
      subsets: ["latin"],
    },
  ],
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/admin/"),
    }),
    AstroPWA(
      pwaPluginOptions({
        name: site.name,
        shortName: site.shortName,
        description: site.description,
        themeColor: site.themeColor,
        bgColor: site.bgColor,
      }),
    ),
  ],
});
