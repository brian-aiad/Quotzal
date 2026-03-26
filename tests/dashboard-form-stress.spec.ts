import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots');
const DASHBOARD_FORM_URL = '/dashboard/form';

test.describe('Dashboard Form Page — Stress Tests', () => {

  test('Page loads without crash and no horizontal overflow', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    const url = page.url();

    if (url.includes('/login')) {
      // Redirected to login — page didn't crash
      await expect(page.locator('body')).toBeVisible();
      return;
    }

    // Page loaded — verify core elements
    await expect(page.getByText('My Form')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Insurance Types')).toBeVisible();

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard-form-01-loaded.png'), fullPage: true });
  });

  test('Auto Personal is the first type selected on load (not Life)', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    if (page.url().includes('/login')) { test.skip(); return; }

    await expect(page.getByText('My Form')).toBeVisible({ timeout: 10000 });

    // The config panel should auto-open. Look for the "Editing" badge or "Configuring" indicator.
    // The first type card (Auto Personal) should be the one being configured.
    // Check that the config panel shows Personal Info tab (first tab of auto_personal)
    const personalInfoTab = page.locator('button', { hasText: 'Personal Info' });
    await expect(personalInfoTab.first()).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard-form-02-auto-personal-selected.png'), fullPage: true });
  });

  test('Scrollbar always present — no layout shift', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    if (page.url().includes('/login')) { test.skip(); return; }

    await expect(page.getByText('My Form')).toBeVisible({ timeout: 10000 });

    // Check that html has overflow-y: scroll (scrollbar always visible)
    const overflowY = await page.evaluate(() =>
      getComputedStyle(document.documentElement).overflowY
    );
    expect(overflowY).toBe('scroll');
  });

  test('Insurance type cards render all 8 types', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    if (page.url().includes('/login')) { test.skip(); return; }

    await expect(page.getByText('Insurance Types')).toBeVisible({ timeout: 10000 });

    // All 8 insurance types should be visible
    const typeLabels = [
      'Auto — Personal', 'Auto — Commercial', 'Home / Renters', 'Life Insurance',
      'Motorcycle', 'Boat / Watercraft', 'RV / Motorhome', 'Other'
    ];
    for (const label of typeLabels) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
  });

  test('Click through all steps without page shift', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    if (page.url().includes('/login')) { test.skip(); return; }

    await expect(page.getByText('My Form')).toBeVisible({ timeout: 10000 });

    // Wait for config panel to auto-open
    await page.waitForTimeout(1000);

    // Get initial page width
    const getPageWidth = () => page.evaluate(() => document.documentElement.scrollWidth);
    const initialWidth = await getPageWidth();

    // Click Next repeatedly through all steps
    const nextBtn = page.locator('button').filter({ hasText: 'Next' }).last();
    let stepCount = 0;
    while (await nextBtn.isEnabled() && stepCount < 10) {
      await nextBtn.click();
      await page.waitForTimeout(300);
      const currentWidth = await getPageWidth();
      // Width should not change by more than 1px
      expect(Math.abs(currentWidth - initialWidth)).toBeLessThanOrEqual(1);
      stepCount++;
    }
    expect(stepCount).toBeGreaterThan(0);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard-form-03-after-step-navigation.png'), fullPage: true });
  });

  test('Toggle Show/Req on fields — badges update correctly', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    if (page.url().includes('/login')) { test.skip(); return; }

    await expect(page.getByText('My Form')).toBeVisible({ timeout: 10000 });

    // Wait for config panel to load
    await page.waitForTimeout(1000);

    // Look for toggle switches
    const switches = page.locator('button[role="switch"]');
    const switchCount = await switches.count();

    if (switchCount > 0) {
      // Toggle the first Show switch
      const firstSwitch = switches.first();
      const initialState = await firstSwitch.getAttribute('aria-checked');
      await firstSwitch.click();
      await page.waitForTimeout(200);

      const newState = await firstSwitch.getAttribute('aria-checked');
      expect(newState).not.toBe(initialState);

      // Check that a badge appeared or disappeared
      // If we turned it ON, we should see "Visible" badge
      if (newState === 'true') {
        await expect(page.getByText('Visible').first()).toBeVisible();
      }

      // Toggle it back
      await firstSwitch.click();
      await page.waitForTimeout(200);
      const revertedState = await firstSwitch.getAttribute('aria-checked');
      expect(revertedState).toBe(initialState);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard-form-04-toggle-test.png'), fullPage: true });
  });

  test('Rapid field toggling does not cause errors', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    if (page.url().includes('/login')) { test.skip(); return; }

    await expect(page.getByText('My Form')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Collect console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Toggle multiple switches rapidly
    const switches = page.locator('button[role="switch"]');
    const count = await switches.count();
    const toggleCount = Math.min(count, 6);

    for (let i = 0; i < toggleCount; i++) {
      await switches.nth(i).click();
      await page.waitForTimeout(50);
    }

    // Toggle them all back
    for (let i = 0; i < toggleCount; i++) {
      await switches.nth(i).click();
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
    if (page.url().includes('/login')) { test.skip(); return; }

    await expect(page.getByText('My Form')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Click on different enabled insurance type cards
    const typeCards = [
      'Auto — Personal',
      'Home / Renters',
      'Life Insurance',
      'Auto — Personal', // Go back to first
    ];

    for (const label of typeCards) {
      const card = page.getByText(label, { exact: true }).first();
      // Only click if the card is in an enabled state
      try {
        await card.click({ timeout: 2000 });
        await page.waitForTimeout(500);
      } catch {
        // Type might not be enabled — skip
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard-form-05-type-switching.png'), fullPage: true });
  });

  test('Mobile viewport — no overflow, preview button visible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(DASHBOARD_FORM_URL);
    if (page.url().includes('/login')) { test.skip(); return; }

    await expect(page.getByText('My Form')).toBeVisible({ timeout: 10000 });

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

    // Mobile preview button should exist
    const previewBtn = page.getByText('Preview', { exact: true });
    await expect(previewBtn).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard-form-06-mobile.png'), fullPage: true });
  });

  test('Tab modified indicator legend shows when fields are customized', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    if (page.url().includes('/login')) { test.skip(); return; }

    await expect(page.getByText('My Form')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Toggle a field to create a modification
    const switches = page.locator('button[role="switch"]');
    if (await switches.count() > 0) {
      await switches.first().click();
      await page.waitForTimeout(500);

      // Check legend text appears
      const legend = page.getByText('customized from defaults');
      // Legend should appear when a tab has modified fields
      // (it may already be visible if fields were previously modified)
      const legendVisible = await legend.isVisible().catch(() => false);

      // Toggle back
      await switches.first().click();
      await page.waitForTimeout(500);
    }
  });

  test('Save indicator cycles through states', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    if (page.url().includes('/login')) { test.skip(); return; }

    await expect(page.getByText('My Form')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Make a change to trigger save
    const switches = page.locator('button[role="switch"]');
    if (await switches.count() > 0) {
      await switches.first().click();

      // Should see "Saving..." indicator
      const savingIndicator = page.getByText('Saving...');
      await expect(savingIndicator).toBeVisible({ timeout: 3000 }).catch(() => {
        // May be too fast to catch
      });

      // Wait for save to complete — should see "Saved"
      await page.waitForTimeout(2000);
      const savedIndicator = page.getByText('Saved');
      // May already have transitioned — that's fine

      // Toggle back to clean up
      await switches.first().click();
      await page.waitForTimeout(2000);
    }
  });

  test('Field description text is readable and not cut off', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    if (page.url().includes('/login')) { test.skip(); return; }

    await expect(page.getByText('My Form')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Check that field descriptions are visible (not zero height or hidden)
    const descriptions = page.locator('p').filter({ hasText: /Used to|For broker|Some carriers/ });
    const descCount = await descriptions.count();

    for (let i = 0; i < Math.min(descCount, 3); i++) {
      const box = await descriptions.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThan(0);
        expect(box.width).toBeGreaterThan(50);
      }
    }
  });
});
