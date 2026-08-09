// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { fileURLToPath } from "node:url";
import AstroPWA from "@vite-pwa/astro";
import { pwaPluginOptions } from "@garage/shared/pwa";
import { site } from "./src/config/site";
import sitemap from "@astrojs/sitemap";

// DB custom garage (https://dbcustomgarage.netlify.app) — reuses @garage/shared
// layout + sections. Own content collections + single-source site config.
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  site: site.url,
  prefetch: true,
  outDir: "./dist-dbc",
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Montserrat",
      cssVariable: "--font-families--body-font",
      weights: [300, 400, 500, 600, 700],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Montserrat",
      cssVariable: "--font-families--title-font",
      weights: [400, 500, 600, 700],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Montserrat",
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
