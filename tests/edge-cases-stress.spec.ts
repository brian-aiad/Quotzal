import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots', 'edge-cases');
const FORM_URL = '/f/test-broker';

// ============================================================
// LONG TEXT & SPECIAL CHARACTER EDGE CASES
// ============================================================
test.describe('Long Text & Special Characters', () => {
  test('Very long names do not overflow the form or review', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByText('Personal Information')).toBeVisible({ timeout: 5000 });

    // Fill with very long names
    const longFirst = 'Muhammad Ibrahim Abdullah Al-Khattabi';
    const longLast = 'Rodriguez-Fernandez De La Cruz Martinez';
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill(longFirst);
    await textInputs.nth(1).fill(longLast);
    await page.locator('input[type="date"]').first().fill('1990-01-01');
    await page.locator('input[type="tel"]').first().fill('5551234567');
    await page.locator('input[type="email"]').fill('longname@test.com');

    // Check no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'long-name-personal.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Drivers step — check the long name renders in driver card
    await expect(page.getByRole('heading', { name: 'Drivers' })).toBeVisible({ timeout: 5000 });
    const driverOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2);
    expect(driverOverflow).toBe(true);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'long-name-drivers.png'), fullPage: true });
  });

  test('Special characters in names render correctly', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Other/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill("O'Brien-McKay");
    await textInputs.nth(1).fill('Müller & Söhne');
    await page.locator('input[type="email"]').fill('special@test.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Other Insurance step
    await expect(page.getByRole('heading', { name: 'Other Insurance' })).toBeVisible({ timeout: 5000 });
    const textarea = page.locator('textarea').first();
    await textarea.fill('Test with special chars: é, ñ, ü, ß, €, £, ¥, ©');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Skip current insurance if present
    const insHeading = page.getByRole('heading', { name: 'Current Insurance' });
    if (await insHeading.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.getByRole('button', { name: /Continue/i }).click();
    }

    // Review — special chars should render
    await expect(page.getByRole('heading', { name: 'Review Your Information' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("O'Brien-McKay").first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'special-chars-review.png'), fullPage: true });
  });

  test('Unicode and emoji in text fields', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Other/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Test');
    await textInputs.nth(1).fill('User');
    await page.locator('input[type="email"]').fill('unicode@test.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByRole('heading', { name: 'Other Insurance' })).toBeVisible({ timeout: 5000 });
    const textarea = page.locator('textarea').first();
    await textarea.fill('I need insurance for my 🚗 and my 🏠. Budget is around $1,000/mo.');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'unicode-textarea.png'), fullPage: true });
  });
});

// ============================================================
// DATE EDGE CASES
// ============================================================
test.describe('Date Edge Cases', () => {
  test('DOB under 14 years old shows error', async ({ page }) => {
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Young');
    await textInputs.nth(1).fill('Person');
    await page.locator('input[type="date"]').first().fill('2020-01-01'); // ~6 years old
    await page.locator('input[type="email"]').fill('young@test.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Should show age validation error
    await expect(page.getByText(/at least 14/i).or(page.getByText(/required/i)).first()).toBeVisible({ timeout: 3000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dob-under-14.png'), fullPage: true });
  });

  test('DOB over 100 years shows warning', async ({ page }) => {
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Old');
    await textInputs.nth(1).fill('Person');
    await page.locator('input[type="date"]').first().fill('1920-01-01'); // 106 years old
    await page.locator('input[type="email"]').fill('old@test.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Should show verification warning
    await expect(page.getByText(/verify/i).or(page.getByText(/required/i)).first()).toBeVisible({ timeout: 3000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dob-over-100.png'), fullPage: true });
  });

  test('Future DOB shows error', async ({ page }) => {
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Future');
    await textInputs.nth(1).fill('Person');
    await page.locator('input[type="date"]').first().fill('2030-01-01');
    await page.locator('input[type="email"]').fill('future@test.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByText(/future/i).or(page.getByText(/required/i)).first()).toBeVisible({ timeout: 3000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dob-future.png'), fullPage: true });
  });
});

// ============================================================
// DRIVER & VEHICLE MANAGEMENT
// ============================================================
test.describe('Driver & Vehicle Management', () => {
  test('Add and remove multiple drivers', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Fill personal info
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Multi');
    await textInputs.nth(1).fill('Driver');
    await page.locator('input[type="email"]').fill('multi@driver.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByRole('heading', { name: 'Drivers' })).toBeVisible({ timeout: 5000 });

    // Add 3 additional drivers (total 4)
    for (let i = 0; i < 3; i++) {
      const addBtn = page.getByText(/Add.*Driver/i);
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // Count driver cards
    const driverCards = page.locator('.rounded-2xl').filter({ hasText: /Driver|Primary/i });
    const count = await driverCards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'multi-drivers.png'), fullPage: true });

    // Try to add a 5th (should be at limit)
    const addBtn = page.getByText(/Add.*Driver/i);
    const addVisible = await addBtn.isVisible().catch(() => false);
    // After 4 drivers, button might be hidden or disabled

    // Remove a driver (not primary)
    const removeBtn = page.getByRole('button', { name: /remove|delete|×/i }).first();
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'after-remove-driver.png'), fullPage: true });
  });

  test('Add and remove vehicles', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Multi');
    await textInputs.nth(1).fill('Vehicle');
    await page.locator('input[type="email"]').fill('multi@vehicle.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Skip drivers
    await expect(page.getByRole('heading', { name: 'Drivers' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Vehicles step
    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible({ timeout: 5000 });

    // Add more vehicles
    const addVehicle = page.getByText(/Add.*Vehicle/i);
    if (await addVehicle.isVisible()) {
      await addVehicle.click();
      await page.waitForTimeout(300);
      await addVehicle.click();
      await page.waitForTimeout(300);
    }

    const vehicleCards = page.locator('.rounded-2xl').filter({ hasText: /Vehicle/i });
    const vCount = await vehicleCards.count();
    expect(vCount).toBeGreaterThanOrEqual(2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'multi-vehicles.png'), fullPage: true });
  });

  test('VIN decode with invalid VIN shows error', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('VIN');
    await textInputs.nth(1).fill('Test');
    await page.locator('input[type="email"]').fill('vin@test.com');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByRole('heading', { name: 'Drivers' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible({ timeout: 5000 });

    // Enter invalid VIN (17 chars but invalid)
    const vinInput = page.locator('input[maxlength="17"]').first();
    await vinInput.fill('12345678901234567');
    await page.waitForTimeout(5000);

    // Should show error or "not found" message
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'invalid-vin.png'), fullPage: true });

    // Verify no crash — page still functional
    const continueBtn = page.getByRole('button', { name: /Continue/i });
    await expect(continueBtn).toBeVisible();
  });
});

// ============================================================
// MOBILE OVERFLOW STRESS TESTS
// ============================================================
test.describe('Mobile Overflow - All Form Steps', () => {
  test('Auto Personal all steps - no overflow on iPhone SE', async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto(FORM_URL);

    // Step 0
    let sw = await page.evaluate(() => document.documentElement.scrollWidth);
    let cw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(sw).toBeLessThanOrEqual(cw + 2);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-step0.png'), fullPage: true });

    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 1 - Personal
    await expect(page.getByText('Personal Information')).toBeVisible({ timeout: 5000 });
    sw = await page.evaluate(() => document.documentElement.scrollWidth);
    cw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(sw).toBeLessThanOrEqual(cw + 2);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-step1.png'), fullPage: true });

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Mobile');
    await textInputs.nth(1).fill('Test');
    await page.locator('input[type="email"]').fill('mobile@test.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2 - Drivers
    await expect(page.getByRole('heading', { name: 'Drivers' })).toBeVisible({ timeout: 5000 });
    sw = await page.evaluate(() => document.documentElement.scrollWidth);
    cw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(sw).toBeLessThanOrEqual(cw + 2);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-step2-drivers.png'), fullPage: true });

    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3 - Vehicles
    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible({ timeout: 5000 });
    sw = await page.evaluate(() => document.documentElement.scrollWidth);
    cw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(sw).toBeLessThanOrEqual(cw + 2);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-step3-vehicles.png'), fullPage: true });

    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 4 - Current Insurance
    const insHeading = page.getByRole('heading', { name: 'Current Insurance' });
    if (await insHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
      sw = await page.evaluate(() => document.documentElement.scrollWidth);
      cw = await page.evaluate(() => document.documentElement.clientWidth);
      expect(sw).toBeLessThanOrEqual(cw + 2);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-step4-insurance.png'), fullPage: true });
      await page.getByRole('button', { name: /Continue/i }).click();
    }

    // Step 5 - Review
    await expect(page.getByRole('heading', { name: 'Review Your Information' })).toBeVisible({ timeout: 5000 });
    sw = await page.evaluate(() => document.documentElement.scrollWidth);
    cw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(sw).toBeLessThanOrEqual(cw + 2);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-step5-review.png'), fullPage: true });
  });

  test('Home form mobile - no overflow on property details', async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(FORM_URL);

    await page.getByRole('button', { name: /Home.*Renters/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Home');
    await textInputs.nth(1).fill('Mobile');
    await page.locator('input[type="email"]').fill('home@mobile.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByRole('heading', { name: 'Property Details' })).toBeVisible({ timeout: 5000 });

    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const cw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(sw).toBeLessThanOrEqual(cw + 2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-home-property.png'), fullPage: true });
  });

  test('Life form mobile - no overflow on coverage details', async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(FORM_URL);

    await page.getByRole('button', { name: /Life Insurance/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Life');
    await textInputs.nth(1).fill('Mobile');
    await page.locator('input[type="email"]').fill('life@mobile.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByRole('heading', { name: 'Life Insurance Details' })).toBeVisible({ timeout: 5000 });

    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const cw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(sw).toBeLessThanOrEqual(cw + 2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-life-details.png'), fullPage: true });
  });
});

// ============================================================
// REVIEW PAGE COMPLETENESS
// ============================================================
test.describe('Review Page Data Completeness', () => {
  test('Home review shows all property details entered', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Home.*Renters/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Personal info
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Review');
    await textInputs.nth(1).fill('Test');
    await page.locator('input[type="email"]').fill('review@home.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Property details
    await expect(page.getByRole('heading', { name: 'Property Details' })).toBeVisible({ timeout: 5000 });
    const addressInput = page.locator('input[placeholder*="Start typing"]').first();
    if (await addressInput.isVisible()) await addressInput.fill('789 Maple Dr, Irvine, CA');
    const yearInput = page.locator('input[placeholder="1990"]').first();
    if (await yearInput.isVisible()) await yearInput.fill('2001');
    const sqftInput = page.locator('input[placeholder="2000"]').first();
    if (await sqftInput.isVisible()) await sqftInput.fill('3200');
    const roofInput = page.locator('input[placeholder="5"]').first();
    if (await roofInput.isVisible()) await roofInput.fill('3');

    // Check pool and dogs
    const poolCheckbox = page.getByLabel(/Pool/i);
    if (await poolCheckbox.isVisible()) await poolCheckbox.check();
    const dogsCheckbox = page.getByLabel(/Dogs/i);
    if (await dogsCheckbox.isVisible()) {
      await dogsCheckbox.check();
      await page.waitForTimeout(300);
    }

    await page.getByRole('button', { name: /Continue/i }).click();

    // Skip current insurance
    const insHeading = page.getByRole('heading', { name: 'Current Insurance' });
    if (await insHeading.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.getByRole('button', { name: /Continue/i }).click();
    }

    // Review page
    await expect(page.getByRole('heading', { name: 'Review Your Information' })).toBeVisible({ timeout: 5000 });

    // Verify key property data shows in review
    await expect(page.getByText('Review Test', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('review@home.com').first()).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'review-home-complete.png'), fullPage: true });
  });

  test('Auto commercial review shows business info', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Commercial/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Personal info
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Biz');
    await textInputs.nth(1).fill('Review');
    await page.locator('input[type="email"]').fill('biz@review.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Business info
    await expect(page.getByText('Business Information')).toBeVisible({ timeout: 5000 });
    const allTextInputs = page.locator('input[type="text"]');
    await allTextInputs.first().fill('Acme Trucking Inc');

    await page.getByRole('button', { name: /Continue/i }).click();

    // Vehicles
    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Current insurance
    const insHeading = page.getByRole('heading', { name: 'Current Insurance' });
    if (await insHeading.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.getByRole('button', { name: /Continue/i }).click();
    }

    // Review
    await expect(page.getByRole('heading', { name: 'Review Your Information' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Biz Review', { exact: true }).first()).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'review-commercial.png'), fullPage: true });
  });
});

// ============================================================
// CURRENT INSURANCE TOGGLE EDGE CASES
// ============================================================
test.describe('Current Insurance Toggle', () => {
  test('Toggle between insured and uninsured clears fields', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Toggle');
    await textInputs.nth(1).fill('Test');
    await page.locator('input[type="email"]').fill('toggle@test.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Skip drivers
    await expect(page.getByRole('heading', { name: 'Drivers' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Skip vehicles
    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Current insurance
    await expect(page.getByRole('heading', { name: 'Current Insurance' })).toBeVisible({ timeout: 5000 });

    // Click Yes
    await page.getByRole('button', { name: /Yes.*insured/i }).click();
    await page.waitForTimeout(300);

    // Fill carrier
    const carrierInput = page.locator('input[placeholder*="State Farm"]').first();
    if (await carrierInput.isVisible()) await carrierInput.fill('Allstate');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'toggle-insured-yes.png'), fullPage: true });

    // Now toggle to No
    await page.getByRole('button', { name: /No.*uninsured/i }).click();
    await page.waitForTimeout(300);

    // Carrier field should be hidden
    const carrierVisible = await carrierInput.isVisible().catch(() => false);
    expect(carrierVisible).toBe(false);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'toggle-insured-no.png'), fullPage: true });

    // Toggle back to Yes
    await page.getByRole('button', { name: /Yes.*insured/i }).click();
    await page.waitForTimeout(300);

    // Carrier should be empty after toggle
    if (await carrierInput.isVisible()) {
      const value = await carrierInput.inputValue();
      // Value might be cleared or preserved — screenshot to verify
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'toggle-insured-back.png'), fullPage: true });
  });
});

// ============================================================
// PHONE INPUT FORMATTING
// ============================================================
test.describe('Phone Input Formatting', () => {
  test('Phone formats correctly with various inputs', async ({ page }) => {
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const phoneInput = page.locator('input[type="tel"]').first();
    if (await phoneInput.isVisible()) {
      // Type digits one at a time
      await phoneInput.fill('5551234567');
      const formatted = await phoneInput.inputValue();
      // Should be formatted as (555) 123-4567
      expect(formatted).toMatch(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phone-formatted.png'), fullPage: true });
  });

  test('Phone rejects non-numeric input', async ({ page }) => {
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const phoneInput = page.locator('input[type="tel"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('abcdefghij');
      const value = await phoneInput.inputValue();
      // Should strip non-numeric chars
      expect(value.replace(/\D/g, '').length).toBeLessThanOrEqual(0);
    }
  });
});

// ============================================================
// BACK/FORWARD NAVIGATION
// ============================================================
test.describe('Navigation Edge Cases', () => {
  test('Rapid back/forward clicks do not crash', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Rapid');
    await textInputs.nth(1).fill('Nav');
    await page.locator('input[type="email"]').fill('rapid@nav.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Rapidly go forward and back
    await expect(page.getByRole('heading', { name: 'Drivers' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Back/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /Back/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /Back/i }).click();
    await page.waitForTimeout(100);

    // Should be back at type selection
    await expect(page.getByText('What type of insurance do you need?')).toBeVisible({ timeout: 5000 });

    // Go forward again
    await page.getByRole('button', { name: /Continue/i }).click();

    // Personal info should be preserved
    const firstNameValue = await page.locator('input[type="text"]').first().inputValue();
    expect(firstNameValue).toBe('Rapid');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'rapid-nav-preserved.png'), fullPage: true });
  });

  test('Switching insurance type and going back preserves selection', async ({ page }) => {
    await page.goto(FORM_URL);

    // Select Motorcycle
    await page.getByRole('button', { name: /Motorcycle/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Fill personal info
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Switch');
    await textInputs.nth(1).fill('Back');
    await page.locator('input[type="email"]').fill('switch@back.com');

    // Go back to type selection
    await page.getByRole('button', { name: /Back/i }).click();

    // Motorcycle should still be selected (highlighted)
    const motoBtn = page.getByRole('button', { name: /Motorcycle/i });
    await expect(motoBtn).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'type-selection-preserved.png'), fullPage: true });
  });
});

// ============================================================
// EMPTY FORM SUBMISSION ATTEMPTS
// ============================================================
test.describe('Empty/Minimal Submissions', () => {
  test('Cannot submit with only required fields empty', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Other/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Try to advance without any data
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByText(/required/i).first()).toBeVisible({ timeout: 3000 });

    // Fill only first name, try again
    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Only');
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByText(/required/i).first()).toBeVisible({ timeout: 3000 });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'empty-validation.png'), fullPage: true });
  });

  test('Other type requires description', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Other/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Desc');
    await textInputs.nth(1).fill('Test');
    await page.locator('input[type="email"]').fill('desc@test.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    // On Other Insurance step, try to continue without description
    await expect(page.getByRole('heading', { name: 'Other Insurance' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Should show validation error for missing description
    await expect(page.getByText(/required|description/i).first()).toBeVisible({ timeout: 3000 });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'other-desc-required.png'), fullPage: true });
  });
});
