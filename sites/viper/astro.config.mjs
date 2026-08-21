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
  // Never inline bundled client scripts: Astro's @astro/plugin-scripts inlines
  // any module chunk under `build.assetsInlineLimit` (vite default 4096 B).
  // Inline <script type=module> is blocked by the strict `script-src 'self'`
  // CSP, so keep everything external as /_astro/*.js modules. Expressed via the
  // vite key so it lands in the merged Vite config the plugin reads at
  // configResolved.
  vite: { build: { assetsInlineLimit: 0 } },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Work Sans",
      cssVariable: "--font-families--body-font",
      weights: [300, 400],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Noto Serif",
      cssVariable: "--font-families--title-font",
      weights: [500, 600],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Playfair Display",
      cssVariable: "--font-families--accent-font",
      weights: [600],
      subsets: ["latin"],
    },
  ],
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/admin/") &&
        !page.includes("/luxury-cars") &&
        !page.includes("/armoured-vehicles"),
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
