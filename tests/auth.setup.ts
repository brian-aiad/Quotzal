import { test as setup } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '..', '.playwright-auth', 'user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.QUOTZAL_TEST_EMAIL;
  const password = process.env.QUOTZAL_TEST_PASSWORD;
  if (!email || !password) throw new Error('Configure dedicated QUOTZAL_TEST_EMAIL and QUOTZAL_TEST_PASSWORD before running authenticated tests.');
  // Navigate to login page
  await page.goto('/login');
  await page.waitForSelector('text=Welcome back', { timeout: 10000 });

  // Fill in credentials
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);

  // Click sign in
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 15000 });

  // Save the authenticated state
  await page.context().storageState({ path: AUTH_FILE });
});
