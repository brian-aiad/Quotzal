import { test, expect } from '@playwright/test';

const DASHBOARD_FORM_URL = '/dashboard/form';

test.describe('Preview Reactivity', () => {
  test.skip(true, 'Requires authenticated session — configure storageState for dashboard tests');

  test('Toggle Occupation Show ON → preview updates immediately', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await page.waitForSelector('text=Insurance Types');

    // Click Auto Personal to open config panel
    await page.locator('text=Auto — Personal').first().click();
    await page.waitForSelector('text=Configure which fields');

    // Preview should be showing Personal Info step content
    const preview = page.locator('.sticky');

    // Verify Occupation is NOT in the preview initially (it's off by default)
    await expect(preview.locator('text=Occupation')).not.toBeVisible();

    // Toggle Occupation Show ON
    const occupationRow = page.locator('text=Occupation').first().locator('..');
    const showToggle = occupationRow.locator('button[role="switch"]').first();
    await showToggle.click();

    // Preview should NOW contain Occupation (within 500ms)
    await expect(preview.locator('text=Occupation')).toBeVisible({ timeout: 500 });

    // Toggle it back OFF
    await showToggle.click();

    // Preview should no longer contain Occupation
    await expect(preview.locator('text=Occupation')).not.toBeVisible({ timeout: 500 });
  });

  test('Click Drivers tab → preview shows drivers step', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await page.waitForSelector('text=Insurance Types');

    await page.locator('text=Auto — Personal').first().click();
    await page.waitForSelector('text=Configure which fields');

    // Click Drivers tab
    await page.locator('button:has-text("Drivers")').first().click();

    // Preview should show Driver Information
    await expect(page.locator('text=Driver Information').or(page.locator('text=Driver 1'))).toBeVisible({ timeout: 1000 });
  });

  test('Click Vehicles tab → preview shows vehicles step', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await page.waitForSelector('text=Insurance Types');

    await page.locator('text=Auto — Personal').first().click();
    await page.waitForSelector('text=Configure which fields');

    // Click Vehicles tab
    await page.locator('button:has-text("Vehicles")').first().click();

    // Preview should show Vehicle Information
    await expect(page.locator('text=Vehicle Information').or(page.locator('text=Vehicle 1'))).toBeVisible({ timeout: 1000 });
  });

  test('Toggle VIN OFF → preview vehicles step hides VIN', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await page.waitForSelector('text=Insurance Types');

    await page.locator('text=Auto — Personal').first().click();
    await page.waitForSelector('text=Configure which fields');

    // Navigate to Vehicles tab
    await page.locator('button:has-text("Vehicles")').first().click();
    await page.waitForTimeout(300);

    const preview = page.locator('.sticky');

    // VIN should be visible by default
    await expect(preview.locator('text=VIN')).toBeVisible({ timeout: 1000 });

    // Toggle VIN OFF
    const vinRow = page.locator('text=VIN').first().locator('..');
    const showToggle = vinRow.locator('button[role="switch"]').first();
    await showToggle.click();

    // VIN should disappear from preview
    await expect(preview.locator('text=VIN')).not.toBeVisible({ timeout: 500 });
  });
});
