// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { fileURLToPath } from "node:url";
import sitemap from "@astrojs/sitemap";

// DB Custom Garage (https://dbcustomgarage.netlify.app) — reuses @garage/shared
// layout + sections. Own content collections + orange theme tokens.
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  site: "https://dbcustomgarage.netlify.app",
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
  ],
});
