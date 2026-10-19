// @ts-check
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 0,
  use: {
    // Dedicated port; NOT viper (4173) nor DBC dev (4322). A collision here
    // would silently serve the wrong site.
    baseURL: "http://localhost:4174",
    headless: true,
  },
  webServer: {
    command: "npx serve dist-dbc/ -p 4174 -L",
    port: 4174,
    timeout: 10000,
    // Refuse to reuse a foreign server on 4174 — fail loudly if something
    // already owns the port instead of silently testing the wrong site.
    reuseExistingServer: false,
  },
});
