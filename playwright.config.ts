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
    },
    {
      name: 'pixel',
      use: { ...devices['Pixel 7'],
      isMobile: true },
    },
  ],
  use: {
    headless: false,
    // viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  reporter: [['line'],['html',  { open: 'never' }]],
});