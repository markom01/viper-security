// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4322',
    headless: true,
  },
  webServer: {
    command: 'npx serve dist/ -p 4322 -L',
    port: 4322,
    timeout: 10000,
    reuseExistingServer: true,
  },
});
