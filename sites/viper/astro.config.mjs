// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://viper-security.netlify.app",
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
  ],
});
