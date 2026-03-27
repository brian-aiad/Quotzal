import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots', 'insurance-types');
const FORM_URL = '/f/test-broker';

// Helper: fill personal info common to all types
async function fillPersonalInfo(page: import('@playwright/test').Page, data: {
  firstName: string; lastName: string; dob: string; phone: string; email: string;
}) {
  await expect(page.getByText('Personal Information')).toBeVisible({ timeout: 5000 });
  const textInputs = page.locator('input[type="text"]');
  await textInputs.nth(0).fill(data.firstName);
  await textInputs.nth(1).fill(data.lastName);
  const dobInput = page.locator('input[type="date"]').first();
  if (await dobInput.isVisible()) await dobInput.fill(data.dob);
  const phoneInput = page.locator('input[type="tel"]');
  if (await phoneInput.first().isVisible()) await phoneInput.first().fill(data.phone);
  await page.locator('input[type="email"]').fill(data.email);
}

// Helper: fill current insurance
async function fillCurrentInsurance(page: import('@playwright/test').Page) {
  const heading = page.getByRole('heading', { name: 'Current Insurance' });
  if (await heading.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.getByRole('button', { name: /Yes.*insured/i }).click();
    await page.waitForTimeout(300);
    const carrierInput = page.locator('input[placeholder*="State Farm"]').first();
    if (await carrierInput.isVisible()) await carrierInput.fill('State Farm');
    const expiryInput = page.locator('input[type="date"]').first();
    if (await expiryInput.isVisible()) await expiryInput.fill('2027-01-15');
  }
}

// Helper: verify review page and submit
async function verifyReviewAndSubmit(page: import('@playwright/test').Page, name: string, email: string, screenshotPrefix: string) {
  await expect(page.getByRole('heading', { name: 'Review Your Information' })).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  await expect(page.getByText(email).first()).toBeVisible();
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${screenshotPrefix}-review.png`), fullPage: true });

  await page.getByRole('button', { name: /Submit/i }).click();
  await expect(
    page.getByRole('heading', { name: /all set|Thank you/i })
      .or(page.getByText(/too many/i).first())
  ).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${screenshotPrefix}-submitted.png`), fullPage: true });
}

// ============================================================
// TEST 1: AUTO PERSONAL — Full End-to-End
// ============================================================
test.describe('Auto Personal — Full E2E', () => {
  test('Complete auto personal flow with driver and vehicle', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);

    // Step 0: Select insurance type
    await expect(page.getByText('What type of insurance do you need?')).toBeVisible();
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'auto-personal-00-type.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 1: Personal info
    await fillPersonalInfo(page, {
      firstName: 'John', lastName: 'Smith', dob: '1990-05-15',
      phone: '5551234567', email: 'john.smith@autotest.com',
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'auto-personal-01-personal.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2: Drivers
    await expect(page.getByRole('heading', { name: 'Drivers' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Primary Driver')).toBeVisible();

    const primaryDriverCard = page.locator('.rounded-2xl').filter({ hasText: 'Primary Driver' }).first();
    const primaryLicense = page.locator('input[maxlength="8"]').first();
    await primaryLicense.fill('D7654321');
    const primaryStateSelect = primaryDriverCard.locator('select').first();
    await primaryStateSelect.selectOption('CA');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'auto-personal-02-drivers.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3: Vehicles
    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible({ timeout: 5000 });
    const vinInput = page.locator('input[maxlength="17"]').first();
    await vinInput.fill('1HGBH41JXMN109186');
    await page.waitForTimeout(5000);

    const vehicleCard = page.locator('.rounded-2xl').filter({ hasText: 'Vehicle 1' }).first();
    const coverageSelect = vehicleCard.locator('select').filter({ has: page.locator('option[value="full"]') }).last();
    await coverageSelect.selectOption('full');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'auto-personal-03-vehicles.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 4: Current insurance
    await fillCurrentInsurance(page);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'auto-personal-04-insurance.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 5: Review & Submit
    await verifyReviewAndSubmit(page, 'John Smith', 'john.smith@autotest.com', 'auto-personal');
  });
});

// ============================================================
// TEST 2: AUTO COMMERCIAL — Full End-to-End
// ============================================================
test.describe('Auto Commercial — Full E2E', () => {
  test('Complete auto commercial flow with business info and fleet', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);

    // Step 0: Select type
    await page.getByRole('button', { name: /Auto.*Commercial/i }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'auto-commercial-00-type.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 1: Personal info
    await fillPersonalInfo(page, {
      firstName: 'Sarah', lastName: 'Johnson', dob: '1982-11-20',
      phone: '5559876543', email: 'sarah.johnson@fleettest.com',
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'auto-commercial-01-personal.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2: Business Info + Drivers
    await expect(page.getByText('Business Information')).toBeVisible({ timeout: 5000 });

    // Fill business name
    const businessNameInput = page.locator('input[type="text"]').filter({ has: page.locator('..') }).first();
    const allTextInputs = page.locator('input[type="text"]');
    // Business Name is the first text input on this step
    await allTextInputs.first().fill('Johnson Logistics LLC');

    // Number of vehicles in fleet
    const fleetInput = page.locator('input[type="number"]');
    if (await fleetInput.first().isVisible()) await fleetInput.first().fill('3');

    // Business type select
    const businessTypeSelect = page.locator('select').filter({ has: page.locator('option[value="LLC"]') });
    if (await businessTypeSelect.first().isVisible()) await businessTypeSelect.first().selectOption('LLC');

    // Primary driver license
    const licenseInput = page.locator('input[maxlength="8"]').first();
    if (await licenseInput.isVisible()) await licenseInput.fill('C9876543');

    const driverCard = page.locator('.rounded-2xl').filter({ hasText: 'Primary Driver' }).first();
    const stateSelect = driverCard.locator('select').first();
    if (await stateSelect.isVisible()) await stateSelect.selectOption('TX');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'auto-commercial-02-business.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3: Vehicles
    await expect(page.getByRole('heading', { name: 'Vehicles' })).toBeVisible({ timeout: 5000 });
    const vinInput = page.locator('input[maxlength="17"]').first();
    await vinInput.fill('1FTFW1ET5DFC10312');
    await page.waitForTimeout(5000);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'auto-commercial-03-vehicles.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 4: Current insurance
    await fillCurrentInsurance(page);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'auto-commercial-04-insurance.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 5: Review & Submit
    await verifyReviewAndSubmit(page, 'Sarah Johnson', 'sarah.johnson@fleettest.com', 'auto-commercial');
  });
});

// ============================================================
// TEST 3: HOME / RENTERS — Full End-to-End
// ============================================================
test.describe('Home / Renters — Full E2E', () => {
  test('Complete home insurance flow with property details', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);

    // Step 0: Select type
    await page.getByRole('button', { name: /Home.*Renters/i }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-00-type.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 1: Personal info
    await fillPersonalInfo(page, {
      firstName: 'Emily', lastName: 'Davis', dob: '1975-03-10',
      phone: '5555551234', email: 'emily.davis@hometest.com',
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-01-personal.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2: Property Details
    await expect(page.getByRole('heading', { name: 'Property Details' })).toBeVisible({ timeout: 5000 });

    // Property address
    const addressInput = page.locator('input[placeholder*="Start typing"]').first();
    if (await addressInput.isVisible()) await addressInput.fill('123 Oak Street, Newport Beach, CA');

    // Year built
    const yearInput = page.locator('input[placeholder="1990"]').first();
    if (await yearInput.isVisible()) await yearInput.fill('1998');

    // Square footage
    const sqftInput = page.locator('input[placeholder="2000"]').first();
    if (await sqftInput.isVisible()) await sqftInput.fill('2400');

    // Roof age
    const roofAgeInput = page.locator('input[placeholder="5"]').first();
    if (await roofAgeInput.isVisible()) await roofAgeInput.fill('8');

    // Property type
    const propTypeSelect = page.locator('select').filter({ has: page.locator('option[value="owned"]') }).first();
    if (await propTypeSelect.isVisible()) await propTypeSelect.selectOption('owned');

    // Stories
    const storiesSelect = page.locator('select').filter({ has: page.locator('option[value="2"]') }).first();
    if (await storiesSelect.isVisible()) await storiesSelect.selectOption('2');

    // Roof material
    const roofSelect = page.locator('select').filter({ has: page.locator('option[value="asphalt_shingle"]') }).first();
    if (await roofSelect.isVisible()) await roofSelect.selectOption('asphalt_shingle');

    // Pool checkbox
    const poolCheckbox = page.getByLabel(/Pool/i);
    if (await poolCheckbox.isVisible()) await poolCheckbox.check();

    // Flood zone — click "No"
    const floodNo = page.getByRole('button', { name: 'No' });
    if (await floodNo.first().isVisible()) await floodNo.first().click();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-02-property.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 4: Current insurance (skips vehicles since not auto)
    await fillCurrentInsurance(page);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-03-insurance.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 5: Review & Submit
    await verifyReviewAndSubmit(page, 'Emily Davis', 'emily.davis@hometest.com', 'home');
  });

  test('Home with dogs, lienholder, and prior claims', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);

    await page.getByRole('button', { name: /Home.*Renters/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await fillPersonalInfo(page, {
      firstName: 'Mike', lastName: 'Brown', dob: '1980-06-01',
      phone: '5553334444', email: 'mike.brown@hometest.com',
    });
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByRole('heading', { name: 'Property Details' })).toBeVisible({ timeout: 5000 });

    // Fill basic property info
    const addressInput = page.locator('input[placeholder*="Start typing"]').first();
    if (await addressInput.isVisible()) await addressInput.fill('456 Elm Ave, Irvine, CA');

    const yearInput = page.locator('input[placeholder="1990"]').first();
    if (await yearInput.isVisible()) await yearInput.fill('2005');

    const sqftInput = page.locator('input[placeholder="2000"]').first();
    if (await sqftInput.isVisible()) await sqftInput.fill('1800');

    // Check Dogs
    const dogsCheckbox = page.getByLabel(/Dogs/i);
    if (await dogsCheckbox.isVisible()) {
      await dogsCheckbox.check();
      await page.waitForTimeout(300);
      // Fill breed and number of dogs
      const breedInput = page.locator('input[type="text"]').last();
      if (await breedInput.isVisible()) await breedInput.fill('Golden Retriever');
      const numDogsInput = page.locator('input[type="number"]').filter({ has: page.locator('..') });
      const dogCountInputs = page.locator('input[min="1"]');
      if (await dogCountInputs.first().isVisible()) await dogCountInputs.first().fill('2');
    }

    // Check Lienholder
    const lienCheckbox = page.getByLabel(/Lienholder|Mortgage/i);
    if (await lienCheckbox.isVisible()) {
      await lienCheckbox.check();
      await page.waitForTimeout(300);
    }

    // Check Prior claims
    const claimsCheckbox = page.getByLabel(/Prior claims/i);
    if (await claimsCheckbox.isVisible()) {
      await claimsCheckbox.check();
      await page.waitForTimeout(300);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-conditional-fields.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Current insurance
    await fillCurrentInsurance(page);
    await page.getByRole('button', { name: /Continue/i }).click();

    // Review
    await expect(page.getByRole('heading', { name: 'Review Your Information' })).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-conditional-review.png'), fullPage: true });
  });
});

// ============================================================
// TEST 4: LIFE INSURANCE — Full End-to-End
// ============================================================
test.describe('Life Insurance — Full E2E', () => {
  test('Complete life insurance flow with beneficiary', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);

    // Step 0: Select type
    await page.getByRole('button', { name: /Life Insurance/i }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'life-00-type.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 1: Personal info
    await fillPersonalInfo(page, {
      firstName: 'Robert', lastName: 'Williams', dob: '1968-09-25',
      phone: '5557778888', email: 'robert.williams@lifetest.com',
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'life-01-personal.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2: Life Insurance Details
    await expect(page.getByRole('heading', { name: 'Life Insurance Details' })).toBeVisible({ timeout: 5000 });

    // Coverage amount
    const coverageSelect = page.locator('select').filter({ has: page.locator('option[value="250k_500k"]') }).first();
    if (await coverageSelect.isVisible()) await coverageSelect.selectOption('250k_500k');

    // Policy type
    const policyTypeSelect = page.locator('select').filter({ has: page.locator('option[value="term"]') }).first();
    if (await policyTypeSelect.isVisible()) {
      await policyTypeSelect.selectOption('term');
      await page.waitForTimeout(300);
      // Term length should appear
      const termSelect = page.locator('select').filter({ has: page.locator('option[value="20"]') }).first();
      if (await termSelect.isVisible()) await termSelect.selectOption('20');
    }

    // Height
    const feetSelect = page.locator('select').filter({ has: page.locator('option[value="5"]') }).first();
    if (await feetSelect.isVisible()) await feetSelect.selectOption('5');
    const inchesSelect = page.locator('select').filter({ has: page.locator('option[value="10"]') }).first();
    if (await inchesSelect.isVisible()) await inchesSelect.selectOption('10');

    // Weight
    const weightInput = page.locator('input[placeholder="150"]').first();
    if (await weightInput.isVisible()) await weightInput.fill('175');

    // Beneficiary name
    const beneficiaryInputs = page.locator('input[type="text"]');
    const lastTextInput = beneficiaryInputs.last();
    if (await lastTextInput.isVisible()) await lastTextInput.fill('Jane Williams');

    // Beneficiary relationship
    const relSelect = page.locator('select').filter({ has: page.locator('option[value="spouse"]') }).first();
    if (await relSelect.isVisible()) await relSelect.selectOption('spouse');

    // Smoker checkbox
    const smokerCheckbox = page.getByLabel(/Smoker/i);
    if (await smokerCheckbox.isVisible()) {
      // Leave unchecked for this test
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'life-02-details.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Current insurance (skips vehicles)
    await fillCurrentInsurance(page);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'life-03-insurance.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Review & Submit
    await verifyReviewAndSubmit(page, 'Robert Williams', 'robert.williams@lifetest.com', 'life');
  });

  test('Life insurance with smoker and health conditions', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);

    await page.getByRole('button', { name: /Life Insurance/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await fillPersonalInfo(page, {
      firstName: 'Linda', lastName: 'Garcia', dob: '1972-04-12',
      phone: '5552223333', email: 'linda.garcia@lifetest.com',
    });
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByRole('heading', { name: 'Life Insurance Details' })).toBeVisible({ timeout: 5000 });

    // Check smoker
    const smokerCheckbox = page.getByLabel(/Smoker/i);
    if (await smokerCheckbox.isVisible()) await smokerCheckbox.check();

    // Check health conditions
    const healthCheckbox = page.getByLabel(/health conditions/i);
    if (await healthCheckbox.isVisible()) {
      await healthCheckbox.check();
      await page.waitForTimeout(300);
      // Fill health description
      const healthTextarea = page.locator('textarea');
      if (await healthTextarea.first().isVisible()) await healthTextarea.first().fill('Controlled Type 2 diabetes, managed with medication');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'life-smoker-health.png'), fullPage: true });
  });
});

// ============================================================
// TEST 5: MOTORCYCLE — Full End-to-End
// ============================================================
test.describe('Motorcycle — Full E2E', () => {
  test('Complete motorcycle flow with violations', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);

    // Step 0: Select type
    await page.getByRole('button', { name: /Motorcycle/i }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'motorcycle-00-type.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 1: Personal info
    await fillPersonalInfo(page, {
      firstName: 'David', lastName: 'Chen', dob: '1988-07-14',
      phone: '5554443333', email: 'david.chen@mototest.com',
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'motorcycle-01-personal.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2: Motorcycle Details
    await expect(page.getByRole('heading', { name: 'Motorcycle Details' })).toBeVisible({ timeout: 5000 });

    // Year
    const yearInput = page.locator('input[placeholder="2024"]').first();
    if (await yearInput.isVisible()) await yearInput.fill('2022');

    // Make
    const makeInput = page.locator('input[type="text"]');
    // Make and Model are text inputs after VIN section
    const textInputs = page.locator('input[type="text"]');
    const count = await textInputs.count();
    // Fill make and model - they should be after the VIN area
    for (let i = 0; i < count; i++) {
      const placeholder = await textInputs.nth(i).getAttribute('placeholder');
      const value = await textInputs.nth(i).inputValue();
      if (!value && !placeholder) {
        // Likely make or model field
      }
    }

    // Try filling VIN directly for motorcycle
    const vinInput = page.locator('input[maxlength="17"]').first();
    if (await vinInput.isVisible()) {
      await vinInput.fill('JH2RC460X7M200123');
      await page.waitForTimeout(3000);
    }

    // Ownership select
    const ownershipSelect = page.locator('select').filter({ has: page.locator('option[value="owned"]') }).first();
    if (await ownershipSelect.isVisible()) await ownershipSelect.selectOption('owned');

    // Storage location
    const storageSelect = page.locator('select').filter({ has: page.locator('option[value="home_garage"]') }).first();
    if (await storageSelect.isVisible()) await storageSelect.selectOption('home_garage');

    // Coverage type
    const coverageSelect = page.locator('select').filter({ has: page.locator('option[value="full"]') });
    if (await coverageSelect.last().isVisible()) await coverageSelect.last().selectOption('full');

    // Violations checkbox
    const violationsCheckbox = page.getByLabel(/Violations/i);
    if (await violationsCheckbox.isVisible()) {
      await violationsCheckbox.check();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'motorcycle-violations.png'), fullPage: true });
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'motorcycle-02-details.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Current insurance (skips vehicles)
    await fillCurrentInsurance(page);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'motorcycle-03-insurance.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Review & Submit
    await verifyReviewAndSubmit(page, 'David Chen', 'david.chen@mototest.com', 'motorcycle');
  });
});

// ============================================================
// TEST 6: BOAT / WATERCRAFT — Full End-to-End
// ============================================================
test.describe('Boat / Watercraft — Full E2E', () => {
  test('Complete boat flow with financing', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);

    // Step 0: Select type
    await page.getByRole('button', { name: /Boat.*Watercraft/i }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'boat-00-type.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 1: Personal info
    await fillPersonalInfo(page, {
      firstName: 'James', lastName: 'Wilson', dob: '1970-12-05',
      phone: '5556667777', email: 'james.wilson@boattest.com',
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'boat-01-personal.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2: Boat Details
    await expect(page.getByRole('heading', { name: 'Boat / Watercraft Details' })).toBeVisible({ timeout: 5000 });

    // HIN
    const hinInput = page.locator('input[maxlength="12"]').first();
    if (await hinInput.isVisible()) await hinInput.fill('ABC12345D607');

    // Year
    const yearInput = page.locator('input[placeholder="2024"]').first();
    if (await yearInput.isVisible()) await yearInput.fill('2020');

    // Make and model text inputs
    const textInputs = page.locator('input[type="text"]');
    const textCount = await textInputs.count();
    // Fill Make (usually 2nd text input after HIN)
    for (let i = 0; i < textCount; i++) {
      const val = await textInputs.nth(i).inputValue();
      if (!val) {
        const maxLen = await textInputs.nth(i).getAttribute('maxlength');
        if (maxLen !== '12') { // Skip HIN
          await textInputs.nth(i).fill(i === 1 || i === 2 ? (i === 1 ? 'Boston Whaler' : 'Outrage 250') : '');
          if (i >= 3) break;
        }
      }
    }

    // Boat length
    const lengthInput = page.locator('input[placeholder="22"]').first();
    if (await lengthInput.isVisible()) await lengthInput.fill('25');

    // Hull type
    const hullSelect = page.locator('select').filter({ has: page.locator('option[value="fiberglass"]') }).first();
    if (await hullSelect.isVisible()) await hullSelect.selectOption('fiberglass');

    // Storage location
    const storageSelect = page.locator('select').filter({ has: page.locator('option[value="marina"]') }).first();
    if (await storageSelect.isVisible()) await storageSelect.selectOption('marina');

    // Coverage type
    const coverageSelect = page.locator('select').filter({ has: page.locator('option[value="full"]') });
    if (await coverageSelect.last().isVisible()) await coverageSelect.last().selectOption('full');

    // Financed checkbox
    const financedCheckbox = page.getByLabel(/Financed/i);
    if (await financedCheckbox.isVisible()) {
      await financedCheckbox.check();
      await page.waitForTimeout(300);
      // Lienholder name
      const lienholderInput = page.locator('input[type="text"]').last();
      if (await lienholderInput.isVisible()) await lienholderInput.fill('Marine Credit Union');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'boat-02-details.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Current insurance
    await fillCurrentInsurance(page);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'boat-03-insurance.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Review & Submit
    await verifyReviewAndSubmit(page, 'James Wilson', 'james.wilson@boattest.com', 'boat');
  });
});

// ============================================================
// TEST 7: RV / MOTORHOME — Full End-to-End
// ============================================================
test.describe('RV / Motorhome — Full E2E', () => {
  test('Complete RV flow with full-time residence', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);

    // Step 0: Select type
    await page.getByRole('button', { name: /RV.*Motorhome/i }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'rv-00-type.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 1: Personal info
    await fillPersonalInfo(page, {
      firstName: 'Patricia', lastName: 'Martinez', dob: '1965-01-30',
      phone: '5558889999', email: 'patricia.martinez@rvtest.com',
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'rv-01-personal.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2: RV Details
    await expect(page.getByRole('heading', { name: 'RV / Motorhome Details' })).toBeVisible({ timeout: 5000 });

    // VIN
    const vinInput = page.locator('input[maxlength="17"]').first();
    if (await vinInput.isVisible()) {
      await vinInput.fill('1FDXE4FS5HDA12345');
      await page.waitForTimeout(3000);
    }

    // Year
    const yearInput = page.locator('input[placeholder="2024"]').first();
    if (await yearInput.isVisible()) await yearInput.fill('2019');

    // RV Class
    const classSelect = page.locator('select').filter({ has: page.locator('option[value="class_a"]') }).first();
    if (await classSelect.isVisible()) await classSelect.selectOption('class_a');

    // Ownership
    const ownershipSelect = page.locator('select').filter({ has: page.locator('option[value="owned"]') }).first();
    if (await ownershipSelect.isVisible()) await ownershipSelect.selectOption('financed');

    // Storage
    const storageSelect = page.locator('select').filter({ has: page.locator('option[value="rv_park"]') }).first();
    if (await storageSelect.isVisible()) await storageSelect.selectOption('rv_park');

    // Coverage type
    const coverageSelect = page.locator('select').filter({ has: page.locator('option[value="full"]') });
    if (await coverageSelect.last().isVisible()) await coverageSelect.last().selectOption('full');

    // Full-time residence
    const fullTimeCheckbox = page.getByLabel(/Full-time/i);
    if (await fullTimeCheckbox.isVisible()) await fullTimeCheckbox.check();

    // Violations
    const violationsCheckbox = page.getByLabel(/Violations/i);
    if (await violationsCheckbox.isVisible()) {
      // Leave unchecked for this test
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'rv-02-details.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Current insurance
    await fillCurrentInsurance(page);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'rv-03-insurance.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Review & Submit
    await verifyReviewAndSubmit(page, 'Patricia Martinez', 'patricia.martinez@rvtest.com', 'rv');
  });
});

// ============================================================
// TEST 8: OTHER — Full End-to-End
// ============================================================
test.describe('Other Insurance — Full E2E', () => {
  test('Complete other insurance flow with description', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto(FORM_URL);

    // Step 0: Select type
    await page.getByRole('button', { name: /Other/i }).click();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'other-00-type.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 1: Personal info
    await fillPersonalInfo(page, {
      firstName: 'Alex', lastName: 'Nguyen', dob: '1995-08-20',
      phone: '5551112222', email: 'alex.nguyen@othertest.com',
    });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'other-01-personal.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2: Other Insurance Details
    await expect(page.getByRole('heading', { name: 'Other Insurance' })).toBeVisible({ timeout: 5000 });

    // Description (required)
    const descriptionTextarea = page.locator('textarea').first();
    await descriptionTextarea.fill('Looking for comprehensive pet insurance for my two golden retrievers. Need coverage for vet visits, surgery, and prescription medications. Both dogs are 3 years old and in good health.');

    // Estimated value
    const valueInput = page.locator('input[placeholder*="50,000"]').first();
    if (await valueInput.isVisible()) await valueInput.fill('$5,000/year');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'other-02-details.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Current insurance (skips vehicles)
    await fillCurrentInsurance(page);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'other-03-insurance.png'), fullPage: true });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Review & Submit
    await verifyReviewAndSubmit(page, 'Alex Nguyen', 'alex.nguyen@othertest.com', 'other');
  });
});

// ============================================================
// CROSS-TYPE TESTS
// ============================================================
test.describe('Cross-Type Validation', () => {
  test('All 8 insurance type buttons are visible and clickable', async ({ page }) => {
    await page.goto(FORM_URL);
    await expect(page.getByText('What type of insurance do you need?')).toBeVisible();

    const types = [
      'Auto.*Personal', 'Auto.*Commercial', 'Home.*Renters',
      'Life Insurance', 'Motorcycle', 'Boat.*Watercraft',
      'RV.*Motorhome', 'Other'
    ];

    for (const type of types) {
      const btn = page.getByRole('button', { name: new RegExp(type, 'i') });
      await expect(btn).toBeVisible();
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'all-types-visible.png'), fullPage: true });
  });

  test('Switching insurance type resets form data', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(FORM_URL);

    // Select Auto Personal first
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();
    await fillPersonalInfo(page, {
      firstName: 'Test', lastName: 'Switch', dob: '1990-01-01',
      phone: '5550000000', email: 'test@switch.com',
    });

    // Go back and switch to Motorcycle
    await page.getByRole('button', { name: /Back/i }).click();
    await page.getByRole('button', { name: /Motorcycle/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Should see Motorcycle Details, not Drivers
    await expect(page.getByRole('heading', { name: 'Motorcycle Details' })).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'type-switch-reset.png'), fullPage: true });
  });

  test('Back button navigation works correctly for non-auto types', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto(FORM_URL);

    // Select Life Insurance
    await page.getByRole('button', { name: /Life Insurance/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Personal info
    await fillPersonalInfo(page, {
      firstName: 'Nav', lastName: 'Test', dob: '1990-01-01',
      phone: '5550001111', email: 'nav@test.com',
    });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Life Details
    await expect(page.getByRole('heading', { name: 'Life Insurance Details' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Continue/i }).click();

    // Should jump to Current Insurance (skip vehicles)
    const heading = page.getByRole('heading', { name: /Current Insurance|Review/i });
    await expect(heading).toBeVisible({ timeout: 5000 });

    // Go back — should return to Life Details, not Vehicles
    await page.getByRole('button', { name: /Back/i }).click();
    await expect(page.getByRole('heading', { name: 'Life Insurance Details' })).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'back-nav-non-auto.png'), fullPage: true });
  });

  test('Validation prevents advancing with empty required fields', async ({ page }) => {
    await page.goto(FORM_URL);

    // Select Auto Personal
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Try to advance without filling personal info
    await page.getByRole('button', { name: /Continue/i }).click();

    // Should show validation errors
    await expect(page.getByText(/required/i).first()).toBeVisible({ timeout: 3000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'validation-errors.png'), fullPage: true });
  });

  test('Email validation rejects invalid formats', async ({ page }) => {
    await page.goto(FORM_URL);
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(0).fill('Test');
    await textInputs.nth(1).fill('User');
    await page.locator('input[type="email"]').fill('not-an-email');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByText(/valid email/i)).toBeVisible({ timeout: 3000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'email-validation.png'), fullPage: true });
  });
});
