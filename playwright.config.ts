import { defineConfig } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '.playwright-auth', 'user.json');

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'off',
  },
  projects: [
    // Auth setup — runs first, produces storageState
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // Public tests — no auth needed
    {
      name: 'public',
      testIgnore: /dashboard-form-stress|dashboard-full-stress|form-config|preview-reactivity|auth\.setup/,
      use: { browserName: 'chromium' },
    },
    // Dashboard tests — require authenticated session
    {
      name: 'dashboard',
      testMatch: /dashboard-form-stress|dashboard-full-stress|form-config|preview-reactivity/,
      dependencies: ['setup'],
      use: {
        browserName: 'chromium',
        storageState: AUTH_FILE,
      },
    },
  ],
});
