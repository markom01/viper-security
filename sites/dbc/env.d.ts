/// <reference types="astro/client" />
/// <reference types="vite-plugin-pwa/client" />

// Astro 7 ships no declaration for its internal fonts virtual module.
// Supplied per Astro's adapter-reference guidance so tsserver resolves it.
declare module "virtual:astro:assets/fonts/internal" {
  export interface FontFamilyData {
    css: string;
    preloads: Array<{ url: string; type: string }>;
  }
  export const componentDataByCssVariable: Map<string, FontFamilyData>;
}
