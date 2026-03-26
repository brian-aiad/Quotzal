import { test, expect } from '@playwright/test';

const FORM_URL = '/f/tb-primary';

test.describe('Customer Form Field Visibility', () => {
  // NOTE: These tests depend on the broker's form_config state in the database.
  // For a proper CI setup, use Supabase API to set config before each test.

  test('Personal info fields render based on config', async ({ page }) => {
    await page.goto(FORM_URL);

    // Select Auto Personal
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Core fields always visible
    await expect(page.locator('input[placeholder*="First"]').or(page.locator('label:has-text("First Name")'))).toBeVisible();
    await expect(page.locator('label:has-text("Email")').or(page.locator('input[type="email"]'))).toBeVisible();
  });

  test('Current insurance carrier flow works end-to-end', async ({ page }) => {
    await page.goto(FORM_URL);

    // Select Auto Personal
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Fill personal info
    await page.locator('input').first().fill('Test');
    await page.locator('input').nth(1).fill('User');
    const emailInput = page.locator('input[type="email"]').or(page.locator('input[placeholder*="email" i]'));
    await emailInput.fill('test@test.com');

    // Navigate through steps to current insurance
    // Step through drivers, vehicles
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(500);

    // Should be on current insurance step
    await expect(page.locator('text=Current Insurance')).toBeVisible({ timeout: 5000 });

    // Click "Yes, I'm insured"
    await page.locator('text=Yes').first().click();

    // Carrier combobox should appear
    const carrierInput = page.locator('input[placeholder*="State Farm"]').or(page.locator('input[placeholder*="carrier" i]'));
    await expect(carrierInput).toBeVisible({ timeout: 3000 });
  });

  test('Required field validation works', async ({ page }) => {
    await page.goto(FORM_URL);

    // Select Auto Personal
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Try to proceed without filling required fields
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Should show validation errors (first name, last name, email are always required)
    await expect(page.locator('text=required').or(page.locator('.text-red-500')).first()).toBeVisible({ timeout: 3000 });
  });
});
