// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

// DB Custom Garage (https://dbcustomgarage.netlify.app) — reuses @garage/shared
// layout + sections. Own content collections + orange theme tokens.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  site: 'https://dbcustomgarage.netlify.app',
  outDir: './dist-dbc',
  vite: {
    plugins: [tailwindcss()],
  },
});