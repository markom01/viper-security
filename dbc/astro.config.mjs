// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// Second site (https://dbcustomgarage.netlify.app) — reuses ../shared components.
// Theme defined in public/styles/site.css; same components, different tokens.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  site: 'https://dbcustomgarage.netlify.app',
  outDir: '../dist-dbc',
  vite: {
    // Alias shared components dir so both dev and build resolve sibling ../shared.
    resolve: {
      alias: {
        '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
        // VIPER section components — reused cross-site, token-driven
        '@sections': fileURLToPath(new URL('../src/components/sections', import.meta.url)),
        // Shared layout — reused cross-site
        '@layouts': fileURLToPath(new URL('../src/layouts', import.meta.url)),
      },
    },
  },
});