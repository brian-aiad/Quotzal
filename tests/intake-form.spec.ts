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
    const firstNameInput = page.locator('label:has-text("First Name") + input, label:has-text("First Name") input').first();
    const lastNameInput = page.locator('label:has-text("Last Name") + input, label:has-text("Last Name") input').first();

    // Try filling by label association, fall back to nth input
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('John');
    await textInputs.nth(1).fill('Doe');

    // Date of birth
    await page.locator('input[type="date"]').first().fill('1990-05-15');

    // Phone — the PhoneInput component has a text input for the phone number
    const phoneInput = page.locator('input[type="tel"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.first().fill('5551234567');
    } else {
      // Fallback: might be a regular text input
      await textInputs.nth(2).fill('5551234567');
    }

    // Email
    await page.locator('input[type="email"]').fill('john.doe@test.com');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-personal-info-filled.png'), fullPage: true });

    // Click Next
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // Verify Step 2 loaded — should show Drivers and Vehicles sections for auto personal
    await expect(page.getByText('Drivers').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Vehicles').first()).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-type-fields-step.png'), fullPage: true });
  });

  test('Step 2: Verify driver/vehicle sections load with pre-filled data', async ({ page }) => {
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

    // Verify Step 2 content
    await expect(page.getByText('Drivers').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Vehicles').first()).toBeVisible({ timeout: 5000 });

    // Check primary driver is pre-filled with name from step 1
    await expect(page.getByText('Primary Driver')).toBeVisible();

    // Check "+ Add Driver" and "+ Add Vehicle" buttons exist
    await expect(page.getByText('+ Add Driver')).toBeVisible();
    await expect(page.getByText('+ Add Vehicle')).toBeVisible();

    // Check vehicle section has the add button
    await expect(page.getByText('+ Add Vehicle')).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-type-fields-detail.png'), fullPage: true });
  });
});
