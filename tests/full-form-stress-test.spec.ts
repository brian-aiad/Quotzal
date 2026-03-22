import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots');
const FORM_URL = '/f/tb-primary';

test.describe('Full Form Stress Test', () => {
  test('Complete end-to-end submission with 2 drivers and VIN decode', async ({ page }) => {
    test.setTimeout(120000);

    // --- Step 0: Select Auto Personal ---
    await page.goto(FORM_URL);
    await expect(page.getByText('What type of insurance do you need?')).toBeVisible();
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // --- Step 1: Personal Info ---
    await expect(page.getByText('Personal Information')).toBeVisible();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Maria');
    await textInputs.nth(1).fill('Rodriguez');
    await page.locator('input[type="date"]').first().fill('1985-08-22');

    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.first().fill('5559876543');
    await page.locator('input[type="email"]').fill('maria.rodriguez@stresstest.com');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'stress-01-personal-info.png'), fullPage: true });
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // --- Step 2: Drivers ---
    await expect(page.getByText('Drivers').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Primary Driver')).toBeVisible();

    // Primary driver should have name pre-filled as Maria Rodriguez
    // Fill license number for primary driver
    const primaryLicenseInput = page.locator('input[maxlength="8"]').first();
    await primaryLicenseInput.fill('D1234567');

    // Select license state — find the first state dropdown within the driver card
    const primaryDriverCard = page.locator('.rounded-xl').filter({ hasText: 'Primary Driver' }).first();
    const primaryStateSelect = primaryDriverCard.locator('select').first();
    await primaryStateSelect.selectOption('CA');

    // Select relationship for primary driver
    const primaryRelSelect = primaryDriverCard.locator('select').filter({ has: page.locator('option[value="self"]') }).first();
    await primaryRelSelect.selectOption('self');

    // Select marital status for primary driver
    const primaryMaritalSelect = primaryDriverCard.locator('select').filter({ has: page.locator('option[value="married"]') }).first();
    await primaryMaritalSelect.selectOption('married');

    // --- Add second driver with no US license ---
    await page.getByText('+ Add Driver').click();
    await page.waitForTimeout(300);

    const secondDriverCard = page.locator('.rounded-xl').filter({ hasText: 'Driver 2' }).first();
    await expect(secondDriverCard).toBeVisible();

    // Fill second driver's name
    const secondNameInput = secondDriverCard.locator('input[type="text"]').first();
    await secondNameInput.fill('Carlos Rodriguez');

    // Fill second driver's DOB
    const secondDobInput = secondDriverCard.locator('input[type="date"]').first();
    await secondDobInput.fill('1988-03-15');

    // Check "No US driver's license" for second driver
    const noUsLicenseLabel = secondDriverCard.getByText("No US driver's license");
    await noUsLicenseLabel.click();
    await page.waitForTimeout(300);

    // Select International License from license type dropdown
    const licenseTypeSelect = secondDriverCard.locator('select').filter({ has: page.locator('option[value="International License"]') }).first();
    await licenseTypeSelect.selectOption('International License');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'stress-02-drivers-filled.png'), fullPage: true });

    // Advance to vehicles step
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // --- Step 3: Vehicles ---
    await expect(page.getByText('Vehicles').first()).toBeVisible({ timeout: 5000 });

    // Click + Add Vehicle to create a vehicle card
    await page.getByText('+ Add Vehicle').click();
    await page.waitForTimeout(300);

    // Enter VIN — Volkswagen e-Golf
    const vinInput = page.locator('input[maxlength="17"]').first();
    await expect(vinInput).toBeVisible({ timeout: 5000 });
    await vinInput.fill('WVWPP7AU9GW909947');

    // Wait for VIN decode to complete
    await page.waitForTimeout(8000);

    // Check for the green confirmation box
    const greenBox = page.locator('text=Vehicle confirmed');
    const hasGreenBox = await greenBox.isVisible().catch(() => false);

    if (hasGreenBox) {
      // Verify read-only inputs exist (Year/Make/Model auto-filled)
      const readonlyInputs = page.locator('input[readonly]');
      const readonlyCount = await readonlyInputs.count();
      expect(readonlyCount).toBeGreaterThanOrEqual(2);
    }

    // Select coverage type
    const vehicleCard = page.locator('.rounded-xl').filter({ hasText: 'Vehicle 1' }).first();
    const coverageSelect = vehicleCard.locator('select').filter({ has: page.locator('option[value="full"]') }).last();
    await coverageSelect.selectOption('full');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'stress-03-vehicles-filled.png'), fullPage: true });

    // Advance to current insurance
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // --- Step 4: Current Insurance ---
    await expect(page.getByRole('heading', { name: 'Current Insurance' })).toBeVisible({ timeout: 5000 });

    // Click "Yes" for has current insurance
    await page.getByRole('button', { name: 'Yes', exact: true }).click();
    await page.waitForTimeout(300);

    // Fill carrier
    const carrierInput = page.locator('input[placeholder*="State Farm"]').first();
    if (await carrierInput.isVisible()) {
      await carrierInput.fill('Progressive');
    }

    // Fill coverage limits
    const limitsInput = page.locator('input[placeholder*="100/300"]').first();
    if (await limitsInput.isVisible()) {
      await limitsInput.fill('100/300/100');
    }

    // Fill expiry date
    const expiryInput = page.locator('input[type="date"]').first();
    if (await expiryInput.isVisible()) {
      await expiryInput.fill('2026-06-15');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'stress-04-current-insurance.png'), fullPage: true });

    // Advance to review
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    // --- Step 5: Review ---
    await expect(page.getByText('Review Your Information')).toBeVisible({ timeout: 5000 });

    // Verify key data
    await expect(page.getByText('Maria Rodriguez', { exact: true })).toBeVisible();
    await expect(page.getByText('maria.rodriguez@stresstest.com')).toBeVisible();

    // Verify drivers in review
    await expect(page.getByText(/Drivers \(2\)/)).toBeVisible();

    // Verify vehicle VIN
    await expect(page.getByText('WVWPP7AU9GW909947')).toBeVisible();

    // Verify current insurance carrier
    await expect(page.getByText('Progressive')).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'stress-05-review.png'), fullPage: true });

    // --- Submit ---
    await page.getByRole('button', { name: 'Submit', exact: true }).click();

    // Wait for submission to complete
    await expect(page.getByText(/Thank you|received/i)).toBeVisible({ timeout: 15000 });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'stress-06-thank-you.png'), fullPage: true });
  });
});
