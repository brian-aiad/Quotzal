import { test as setup } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '..', '.playwright-auth', 'user.json');

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');
  await page.waitForSelector('text=Welcome back', { timeout: 10000 });

  // Fill in credentials
  await page.getByRole('textbox', { name: 'Email' }).fill('csbrianaiad@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');

  // Click sign in
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 15000 });

  // Save the authenticated state
  await page.context().storageState({ path: AUTH_FILE });
});
