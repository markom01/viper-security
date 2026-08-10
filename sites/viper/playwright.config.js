// @ts-check
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 0,
  use: {
    // Dedicated port; NOT the DBC dev port (4322). A collision here would
    // silently serve the wrong site.
    baseURL: "http://localhost:4173",
    headless: true,
  },
  webServer: {
    command: "npx serve dist/ -p 4173 -L",
    port: 4173,
    timeout: 10000,
    // Refuse to reuse a foreign server on 4173 — fail loudly if something
    // already owns the port instead of silently testing the wrong site.
    reuseExistingServer: false,
  },
});
