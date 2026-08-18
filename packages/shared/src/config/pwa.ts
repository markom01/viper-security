/**
 * Shared PWA configuration factory for the Astro sites.
 *
 * Returns the vite-plugin-pwa plugin config for a given site. Both sites use
 * identical workbox runtime-caching (hashed assets = cache-first, HTML =
 * network-first so deploys don't get trapped behind a stale service worker).
 * Theme/colors differ per site and are passed in.
 */
import type { VitePWAOptions } from "vite-plugin-pwa";

export function pwaPluginOptions({
  name,
  shortName,
  description,
  themeColor,
  bgColor,
  display = "standalone",
  startUrl = "/",
  scope = "/",
}: {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  bgColor: string;
  display?: "standalone" | "fullscreen" | "minimal-ui" | "browser";
  startUrl?: string;
  scope?: string;
}): Partial<VitePWAOptions> {
  return {
    registerType: "autoUpdate",
    // Build-time: precache the hashed, immutable build output; never cache
    // the HTML at install time (network-first below) so deploys are always
    // fresh on first load.
    workbox: {
      globPatterns: ["**/*.{js,css,woff2,png,svg,ico}"],
      globIgnores: ["admin/**", "**/*.map"],
      navigateFallback: null, // no SPA routes; HTML handled by runtime cache
      runtimeCaching: [
        {
          // HTML pages: always go to network, fall back to cache offline.
          urlPattern: ({ request }) => request.mode === "navigate",
          handler: "NetworkFirst",
          options: {
            cacheName: "pages-cache",
            networkTimeoutSeconds: 3,
            expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
        {
          // Hashed _astro/ assets are immutable → cache-first, never revalidate.
          urlPattern: ({ url }) => url.pathname.startsWith("/_astro/"),
          handler: "CacheFirst",
          options: {
            cacheName: "astro-assets-cache",
            expiration: { maxEntries: 512, maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        },
      ],
      // SW itself never shares the page CSP; keep a service worker mental model safe by
      // bounding the SW scope (already "/") and disabling dev-mode SW (see devOptions).
    },
    devOptions: { enabled: false },
    manifest: {
      name,
      short_name: shortName,
      description,
      lang: "en",
      start_url: startUrl,
      scope,
      display,
      background_color: bgColor,
      theme_color: themeColor,
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
  };
}