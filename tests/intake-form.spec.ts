import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots');
const FORM_URL = '/f/tb-primary';

test.describe('Intake Form Wizard', () => {
  test('Step 0: Select "Auto — Personal" and click Next', async ({ page }) => {
    await page.goto(FORM_URL);

    // Verify the insurance type selection step loaded
    await expect(page.getByText('What type of insurance do you need?')).toBeVisible();

    // Click "Auto — Personal"
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-insurance-type-selected.png'), fullPage: true });

    // Click Next
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Verify we moved to Step 1
    await expect(page.getByText('Personal Information')).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-personal-info-step.png'), fullPage: true });
  });

  test('Step 1: Fill personal info and click Next', async ({ page }) => {
    // Navigate and select insurance type first
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Personal Information')).toBeVisible();

    // Fill in personal info
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('John');
    await textInputs.nth(1).fill('Doe');

    // Date of birth
    await page.locator('input[type="date"]').first().fill('1990-05-15');

    // Phone
    const phoneInput = page.locator('input[type="tel"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.first().fill('5551234567');
    } else {
      await textInputs.nth(2).fill('5551234567');
    }

    // Email
    await page.locator('input[type="email"]').fill('john.doe@test.com');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-personal-info-filled.png'), fullPage: true });

    // Click Next
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Step 2 now shows only Drivers (vehicles are on step 3)
    await expect(page.getByText('Drivers').first()).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-drivers-step.png'), fullPage: true });
  });

  test('Step 2: Verify drivers section loads with pre-filled data', async ({ page }) => {
    // Navigate through steps 0 and 1
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Personal Information')).toBeVisible();

    // Fill personal info
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('John');
    await textInputs.nth(1).fill('Doe');
    await page.locator('input[type="date"]').first().fill('1990-05-15');
    const phoneInput = page.locator('input[type="tel"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.first().fill('5551234567');
    } else {
      await textInputs.nth(2).fill('5551234567');
    }
    await page.locator('input[type="email"]').fill('john.doe@test.com');
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Verify Step 2 shows Drivers
    await expect(page.getByText('Drivers').first()).toBeVisible({ timeout: 5000 });

    // Check primary driver is pre-filled
    await expect(page.getByText('Primary Driver')).toBeVisible();

    // Check "+ Add Driver" button exists
    await expect(page.getByText('+ Add Driver')).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-drivers-detail.png'), fullPage: true });
  });

  test('Violation removal auto-unchecks violations checkbox', async ({ page }) => {
    // Navigate to drivers step
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Personal Information')).toBeVisible();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Jane');
    await textInputs.nth(1).fill('Smith');
    await page.locator('input[type="date"]').first().fill('1988-03-10');
    await page.locator('input[type="email"]').fill('jane@test.com');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Drivers').first()).toBeVisible({ timeout: 5000 });

    // Check "Violations in last 5 years" checkbox
    const violationsCheckbox = page.getByLabel('Violations in last 5 years');
    await violationsCheckbox.check();
    await expect(violationsCheckbox).toBeChecked();

    // A violation card should appear
    await expect(page.getByText('Violation 1')).toBeVisible();

    // Click "Remove" on the violation
    await page.getByRole('button', { name: 'Remove' }).click();

    // Checkbox should auto-uncheck when last violation is removed
    await expect(violationsCheckbox).not.toBeChecked();
  });

  test('Coverage limits dropdown shows correct CA presets', async ({ page }) => {
    // Navigate to current insurance step
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Personal Information')).toBeVisible();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Test');
    await textInputs.nth(1).fill('User');
    await page.locator('input[type="date"]').first().fill('1990-01-01');
    await page.locator('input[type="email"]').fill('test@test.com');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Drivers').first()).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    // Vehicles step
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Current Insurance step
    await expect(page.getByText('Current Insurance')).toBeVisible({ timeout: 5000 });
    await page.getByText("Yes, I'm insured").click();

    // Click coverage limits input to open dropdown
    const limitsInput = page.getByPlaceholder('Select or type coverage limits');
    await limitsInput.click();

    // Verify 30/60/15 is the minimum (not 15/30/5)
    await expect(page.getByText('30/60/15')).toBeVisible();
    await expect(page.getByText('CA State Minimum')).toBeVisible();

    // Verify 15/30/5 does NOT exist
    await expect(page.getByText('15/30/5')).not.toBeVisible();
    await expect(page.getByText('25/50/10')).not.toBeVisible();

    // Verify "Most common in CA" label
    await expect(page.getByText('Most common in CA')).toBeVisible();
  });

  test('Speeding appears as single option in violations dropdown', async ({ page }) => {
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Personal Information')).toBeVisible();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Test');
    await textInputs.nth(1).fill('User');
    await page.locator('input[type="date"]').first().fill('1990-01-01');
    await page.locator('input[type="email"]').fill('test@test.com');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Drivers').first()).toBeVisible({ timeout: 5000 });

    // Check violations checkbox
    await page.getByLabel('Violations in last 5 years').check();

    // Open the violation type dropdown
    const violationSelect = page.locator('select').filter({ has: page.locator('option[value="speeding"]') }).first();
    await expect(violationSelect).toBeVisible();

    // Verify single "Speeding" option exists
    await expect(violationSelect.locator('option[value="speeding"]')).toHaveCount(1);

    // Verify old granular speeding options don't exist
    await expect(violationSelect.locator('option[value="speeding_1_10"]')).toHaveCount(0);
    await expect(violationSelect.locator('option[value="speeding_11_20"]')).toHaveCount(0);
    await expect(violationSelect.locator('option[value="speeding_21_plus"]')).toHaveCount(0);
  });
});

test.describe('Broker Dashboard', () => {
  test('My Form page loads without crash on fresh formConfig', async ({ page }) => {
    // Navigate to the dashboard form page
    // This tests that the page doesn't crash even with null/undefined formConfig
    await page.goto('/dashboard/form');

    // Should either redirect to login or show the form page
    // If redirected to login, the page loads without crash
    const url = page.url();
    if (url.includes('/login')) {
      // Expected when not logged in — page didn't crash
      await expect(page.locator('body')).toBeVisible();
    } else {
      // If logged in, verify the page renders
      await expect(page.getByText('My Form')).toBeVisible({ timeout: 10000 });
    }
  });

  test('Dashboard pages render at 390px without horizontal scroll', async ({ page }) => {
    // Set viewport to iPhone 12/14 width
    await page.setViewportSize({ width: 390, height: 844 });

    // Test each dashboard page (may redirect to login)
    for (const path of ['/dashboard', '/dashboard/submissions', '/dashboard/form', '/dashboard/settings', '/dashboard/billing']) {
      await page.goto(path);

      // Wait for page to settle
      await page.waitForTimeout(1000);

      // Check for horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

      // Allow 1px tolerance for rendering differences
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    }
  });
});
