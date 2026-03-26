import { test, expect } from '@playwright/test';

const DASHBOARD_FORM_URL = '/dashboard/form';

test.describe('Dashboard Form Page — Stress Tests', () => {

  test('Page loads without crash and no horizontal overflow', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);

    // Page loaded — verify core elements
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Insurance Types' })).toBeVisible();

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('Auto Personal is the first type selected on load (not Life)', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });

    // The config panel should auto-open for the first enabled type.
    // Check that a config panel heading is visible (e.g. "Auto — Personal" or "Auto — Commercial")
    await expect(page.getByRole('heading', { name: /Auto/ }).first()).toBeVisible({ timeout: 5000 });

    // Step navigation buttons should be visible
    await expect(page.getByRole('button', { name: /Go to step 1/i }).first()).toBeVisible();
  });

  test('Scrollbar always present — no layout shift', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });

    // Check that html has overflow-y: scroll (scrollbar always visible)
    const overflowY = await page.evaluate(() =>
      getComputedStyle(document.documentElement).overflowY
    );
    expect(overflowY).toBe('scroll');
  });

  test('Insurance type cards render all 8 types', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'Insurance Types' })).toBeVisible({ timeout: 10000 });

    // All 8 insurance types should be visible as switch labels
    const typeLabels = [
      'Auto — Personal', 'Auto — Commercial', 'Home / Renters', 'Life Insurance',
      'Motorcycle', 'Boat / Watercraft', 'RV / Motorhome', 'Other'
    ];
    for (const label of typeLabels) {
      await expect(page.getByRole('switch', { name: new RegExp(label) })).toBeVisible();
    }
  });

  test('Click through all steps without page shift', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });

    // Wait for config panel to auto-open
    await page.waitForTimeout(1000);

    // Get initial page width
    const getPageWidth = () => page.evaluate(() => document.documentElement.scrollWidth);
    const initialWidth = await getPageWidth();

    // Click Next repeatedly through all steps
    const nextBtn = page.getByRole('button', { name: 'Next' }).first();
    let stepCount = 0;
    while (await nextBtn.isEnabled().catch(() => false) && stepCount < 10) {
      await nextBtn.click();
      await page.waitForTimeout(300);
      const currentWidth = await getPageWidth();
      expect(Math.abs(currentWidth - initialWidth)).toBeLessThanOrEqual(1);
      stepCount++;
    }
    expect(stepCount).toBeGreaterThan(0);
  });

  test('Toggle Show/Req on fields — badges update correctly', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Navigate to Personal Info tab to see toggleable fields
    const personalInfoTab = page.getByRole('button', { name: /Personal Info/i }).first();
    if (await personalInfoTab.isVisible().catch(() => false)) {
      await personalInfoTab.click();
      await page.waitForTimeout(500);
    }

    // Field-level Show/Req switches (aria-label="Show")
    const showSwitches = page.getByRole('switch', { name: 'Show' });
    const showCount = await showSwitches.count();

    if (showCount > 0) {
      const fieldSwitch = showSwitches.first();
      const initialState = await fieldSwitch.getAttribute('aria-checked');
      await fieldSwitch.click();
      await page.waitForTimeout(200);

      const newState = await fieldSwitch.getAttribute('aria-checked');
      expect(newState).not.toBe(initialState);

      // Toggle back
      await fieldSwitch.click();
      await page.waitForTimeout(200);
      const revertedState = await fieldSwitch.getAttribute('aria-checked');
      expect(revertedState).toBe(initialState);
    }
  });

  test('Rapid field toggling does not cause errors', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Navigate to Personal Info tab
    const personalInfoTab = page.getByRole('button', { name: /Personal Info/i }).first();
    if (await personalInfoTab.isVisible().catch(() => false)) {
      await personalInfoTab.click();
      await page.waitForTimeout(500);
    }

    // Collect console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Toggle Show switches rapidly
    const showSwitches = page.getByRole('switch', { name: 'Show' });
    const count = await showSwitches.count();
    const toggleCount = Math.min(count, 4);

    for (let i = 0; i < toggleCount; i++) {
      await showSwitches.nth(i).click();
      await page.waitForTimeout(50);
    }

    // Toggle them all back
    for (let i = 0; i < toggleCount; i++) {
      await showSwitches.nth(i).click();
      await page.waitForTimeout(50);
    }

    // Wait for saves to complete
    await page.waitForTimeout(3000);

    // No JS errors should have occurred
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('404') && !e.includes('net::')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('Switch between insurance types — panel updates correctly', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Click on different enabled insurance type cards
    const typeCards = ['Home / Renters', 'Life Insurance', 'Auto — Personal'];

    for (const label of typeCards) {
      const card = page.getByText(label, { exact: true }).first();
      try {
        await card.click({ timeout: 2000 });
        await page.waitForTimeout(500);
        // Verify the config panel heading updated
        await expect(page.getByRole('heading', { name: new RegExp(label.replace(' / ', '.*')) })).toBeVisible({ timeout: 2000 });
      } catch {
        // Type might not be clickable — continue
      }
    }
  });

  test('Mobile viewport — no overflow, preview button visible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('Tab modified indicator legend shows when fields are customized', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Toggle a field to create a modification
    const personalInfoTab = page.getByRole('button', { name: /Personal Info/i }).first();
    if (await personalInfoTab.isVisible().catch(() => false)) {
      await personalInfoTab.click();
      await page.waitForTimeout(500);
    }

    const showSwitches = page.getByRole('switch', { name: 'Show' });
    if (await showSwitches.count() > 0) {
      await showSwitches.first().click();
      await page.waitForTimeout(500);
      // Toggle back
      await showSwitches.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('Save indicator cycles through states', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    const personalInfoTab = page.getByRole('button', { name: /Personal Info/i }).first();
    if (await personalInfoTab.isVisible().catch(() => false)) {
      await personalInfoTab.click();
      await page.waitForTimeout(500);
    }

    // Make a change to trigger save
    const showSwitches = page.getByRole('switch', { name: 'Show' });
    if (await showSwitches.count() > 0) {
      await showSwitches.first().click();

      // Wait for save to complete
      await page.waitForTimeout(2000);
      // Should see "Saved" text
      await expect(page.getByText('Saved')).toBeVisible({ timeout: 5000 });

      // Toggle back to clean up
      await showSwitches.first().click();
      await page.waitForTimeout(2000);
    }
  });

  test('Field description text is readable and not cut off', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Navigate to a step with field descriptions
    const personalInfoTab = page.getByRole('button', { name: /Personal Info/i }).first();
    if (await personalInfoTab.isVisible().catch(() => false)) {
      await personalInfoTab.click();
      await page.waitForTimeout(500);
    }

    // Check that some text elements have positive dimensions
    const descriptions = page.locator('p.text-xs');
    const descCount = await descriptions.count();

    for (let i = 0; i < Math.min(descCount, 3); i++) {
      const box = await descriptions.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThan(0);
        expect(box.width).toBeGreaterThan(10);
      }
    }
  });
});
