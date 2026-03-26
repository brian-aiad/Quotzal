import { test, expect } from '@playwright/test';

const FORM_URL = '/f/tb-primary';

test.describe('Current Insurance End-to-End', () => {
  test('Full flow: select carrier, verify on review, submit', async ({ page }) => {
    await page.goto(FORM_URL);

    // Step 0: Select Auto Personal
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 1: Fill personal info
    await page.waitForSelector('text=Personal Information');
    const inputs = page.locator('input[type="text"], input[type="email"]');
    await inputs.nth(0).fill('Test');
    await inputs.nth(1).fill('User');
    // Find email input
    const emailInput = page.locator('input[type="email"]').or(page.locator('input[placeholder*="email" i]'));
    await emailInput.fill('test-e2e@test.com');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 2: Drivers — just proceed
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 3: Vehicles — just proceed
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 4: Current Insurance
    await page.waitForTimeout(500);
    await expect(page.locator('text=Current Insurance').first()).toBeVisible({ timeout: 5000 });

    // Toggle "Yes, I'm insured"
    await page.locator('text=Yes').first().click();
    await page.waitForTimeout(300);

    // Select carrier "State Farm" from combobox
    const carrierInput = page.locator('input[placeholder*="State Farm"]').or(page.locator('input[placeholder*="carrier" i]'));
    await carrierInput.click();
    await carrierInput.fill('State Farm');
    // Click the dropdown option
    const stateOption = page.locator('button:has-text("State Farm")');
    if (await stateOption.isVisible()) {
      await stateOption.click();
    }

    // Fill policy expiry (6 months from now)
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);
    const dateStr = futureDate.toISOString().split('T')[0];
    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.isVisible()) {
      await dateInput.fill(dateStr);
    }

    // Continue to Review
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(500);

    // Step 5: Review
    await expect(page.locator('text=Review').first()).toBeVisible({ timeout: 5000 });

    // Assert carrier appears on review
    await expect(page.locator('text=State Farm')).toBeVisible();

    // Assert "Currently Insured: Yes" is shown
    await expect(page.locator('text=Yes').first()).toBeVisible();
  });

  test('No current insurance: carrier fields hidden', async ({ page }) => {
    await page.goto(FORM_URL);

    // Select Auto Personal
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Fill minimal personal info and navigate to current insurance step
    const inputs = page.locator('input[type="text"], input[type="email"]');
    await inputs.nth(0).fill('No');
    await inputs.nth(1).fill('Insurance');
    const emailInput = page.locator('input[type="email"]').or(page.locator('input[placeholder*="email" i]'));
    await emailInput.fill('no-insurance@test.com');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForTimeout(500);

    // On current insurance step
    await expect(page.locator('text=Current Insurance').first()).toBeVisible({ timeout: 5000 });

    // Click "No, I'm uninsured"
    await page.locator('text=No').first().click();

    // Carrier input should not be visible
    const carrierInput = page.locator('input[placeholder*="State Farm"]').or(page.locator('input[placeholder*="carrier" i]'));
    await expect(carrierInput).not.toBeVisible();
  });
});
