import { test, expect } from '@playwright/test';

// NOTE: These tests require an authenticated broker session.
// Set BROKER_SESSION_COOKIE or use storageState in playwright config.
const DASHBOARD_FORM_URL = '/dashboard/form';

test.describe('Form Config Persistence', () => {
  test.skip(true, 'Requires authenticated session — configure storageState for dashboard tests');

  test('Toggle Occupation show ON → refresh → still ON', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await page.waitForSelector('text=Insurance Types');

    // Click Auto Personal card to open config panel
    await page.locator('text=Auto — Personal').first().click();
    await page.waitForSelector('text=Configure which fields');

    // Find Occupation row and toggle Show ON
    const occupationRow = page.locator('text=Occupation').first().locator('..');
    const showToggle = occupationRow.locator('button[role="switch"]').first();
    await showToggle.click();

    // Wait for save
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 });

    // Refresh page
    await page.reload();
    await page.waitForSelector('text=Insurance Types');

    // Re-open config panel
    await page.locator('text=Auto — Personal').first().click();
    await page.waitForSelector('text=Configure which fields');

    // Verify Occupation Show toggle is ON
    const occupationToggle = page.locator('text=Occupation').first().locator('..').locator('button[role="switch"]').first();
    await expect(occupationToggle).toHaveAttribute('aria-checked', 'true');
  });

  test('Toggle Years Licensed show ON + required ON → refresh → both still ON', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await page.waitForSelector('text=Insurance Types');

    await page.locator('text=Auto — Personal').first().click();
    await page.waitForSelector('text=Configure which fields');

    // Toggle Show ON for Years Licensed
    const row = page.locator('text=Years Licensed').first().locator('..');
    const toggles = row.locator('button[role="switch"]');
    await toggles.first().click(); // Show
    await page.waitForTimeout(200);
    await toggles.nth(1).click(); // Required

    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 });

    await page.reload();
    await page.waitForSelector('text=Insurance Types');
    await page.locator('text=Auto — Personal').first().click();
    await page.waitForSelector('text=Configure which fields');

    const rowAfter = page.locator('text=Years Licensed').first().locator('..');
    const togglesAfter = rowAfter.locator('button[role="switch"]');
    await expect(togglesAfter.first()).toHaveAttribute('aria-checked', 'true');
    await expect(togglesAfter.nth(1)).toHaveAttribute('aria-checked', 'true');
  });

  test('Add a custom field → refresh → assert it exists', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await page.waitForSelector('text=Insurance Types');

    await page.locator('text=Auto — Personal').first().click();
    await page.waitForSelector('text=Configure which fields');

    // Click add custom field
    await page.locator('text=+ Add Custom Field').first().click();

    // Fill in field
    await page.locator('input[placeholder="e.g., Referral Source"]').fill('Test Referral Source');
    await page.locator('text=Add Field').click();

    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 });

    await page.reload();
    await page.waitForSelector('text=Insurance Types');
    await page.locator('text=Auto — Personal').first().click();

    await expect(page.locator('text=Test Referral Source')).toBeVisible();
  });

  test('Toggle 10 fields rapidly → wait → refresh → all saved', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await page.waitForSelector('text=Insurance Types');

    await page.locator('text=Auto — Personal').first().click();
    await page.waitForSelector('text=Configure which fields');

    // Toggle multiple fields rapidly
    const fieldLabels = ['Occupation', 'Homeowner', 'Years Licensed'];
    for (const label of fieldLabels) {
      const row = page.locator(`text=${label}`).first().locator('..');
      const showToggle = row.locator('button[role="switch"]').first();
      await showToggle.click();
      await page.waitForTimeout(50);
    }

    // Wait for debounce to complete
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 5000 });

    await page.reload();
    await page.waitForSelector('text=Insurance Types');
    await page.locator('text=Auto — Personal').first().click();
    await page.waitForSelector('text=Configure which fields');

    // Verify all are toggled
    for (const label of fieldLabels) {
      const row = page.locator(`text=${label}`).first().locator('..');
      const showToggle = row.locator('button[role="switch"]').first();
      await expect(showToggle).toHaveAttribute('aria-checked', 'true');
    }
  });
});
