import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  timeout: 60_000,
  retries: 0,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'],
      isMobile: false },
    }
  ],
  use: {
    headless: false,
    ignoreHTTPSErrors: true,
  },
  reporter: [['line'],['html',  { open: 'never' }]],
});