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
    // Disabling mobile Browser
    // {
    //   name: 'pixel',
    //   use: { ...devices['Pixel 7'],
    //   isMobile: true },
    // },
  ],
  use: {
    headless: false,
    ignoreHTTPSErrors: true,
  },
  reporter: [['line'],['html',  { open: 'never' }]],
});