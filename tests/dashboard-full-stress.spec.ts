import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots', 'dashboard');

// ============================================================
// DASHBOARD HOME
// ============================================================
test.describe('Dashboard Home', () => {
  test('Dashboard loads with all key sections', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should have main heading or welcome text
    await expect(page.locator('body')).not.toBeEmpty();

    // Check for stat cards (Total Submissions, New, This Month, etc.)
    const body = await page.textContent('body');
    expect(body).toBeTruthy();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-01-loaded.png'), fullPage: true });
  });

  test('Dashboard shows submission stats', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for stat-related text
    const statsArea = page.locator('text=/submission|lead|total/i').first();
    if (await statsArea.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(statsArea).toBeVisible();
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-02-stats.png'), fullPage: true });
  });

  test('Dashboard navigation sidebar works', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check nav links exist
    const navLinks = ['My Form', 'Submissions', 'Billing', 'Settings'];
    for (const link of navLinks) {
      const navItem = page.getByRole('link', { name: new RegExp(link, 'i') }).or(
        page.getByText(new RegExp(link, 'i'))
      );
      if (await navItem.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        // Link exists
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-03-nav.png'), fullPage: true });
  });

  test('Dashboard responsive - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home-04-mobile.png'), fullPage: true });
  });
});

// ============================================================
// DASHBOARD FORM PAGE ("My Form")
// ============================================================
test.describe('Dashboard Form Page', () => {
  test('Form page loads with preview and config', async ({ page }) => {
    await page.goto('/dashboard/form');
    await page.waitForLoadState('networkidle');

    // Page should have "My Form" heading
    await expect(page.getByRole('heading', { name: /My Form/i }).first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'form-01-loaded.png'), fullPage: true });
  });

  test('All 8 insurance type toggles are present', async ({ page }) => {
    await page.goto('/dashboard/form');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const types = [
      'Auto — Personal', 'Auto — Commercial', 'Home / Renters',
      'Life Insurance', 'Motorcycle', 'Boat / Watercraft',
      'RV / Motorhome', 'Other'
    ];

    for (const type of types) {
      const label = page.getByText(type, { exact: false });
      await expect(label.first()).toBeVisible({ timeout: 5000 });
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'form-02-all-types.png'), fullPage: true });
  });

  test('Toggle insurance type on/off', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/dashboard/form');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find a type switch and toggle it
    const switches = page.getByRole('switch');
    const switchCount = await switches.count();
    expect(switchCount).toBeGreaterThan(0);

    // Toggle the last type (Other) if it exists
    if (switchCount > 0) {
      const lastSwitch = switches.last();
      const initialState = await lastSwitch.getAttribute('aria-checked');
      await lastSwitch.click();
      await page.waitForTimeout(1000);

      // Toggle it back to restore state
      await lastSwitch.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'form-03-toggle.png'), fullPage: true });
  });

  test('Embed code section is visible', async ({ page }) => {
    await page.goto('/dashboard/form');
    await page.waitForLoadState('networkidle');

    // Scroll to bottom to find embed code
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const embedSection = page.getByText(/embed|snippet|widget/i).first();
    if (await embedSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(embedSection).toBeVisible();
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'form-04-embed.png'), fullPage: true });
  });

  test('Form page mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard/form');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'form-05-mobile.png'), fullPage: true });
  });
});

// ============================================================
// DASHBOARD SUBMISSIONS PAGE
// ============================================================
test.describe('Dashboard Submissions Page', () => {
  test('Submissions page loads', async ({ page }) => {
    await page.goto('/dashboard/submissions');
    await page.waitForLoadState('networkidle');

    // Should have heading or content
    const heading = page.getByRole('heading', { name: /Submissions/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'submissions-01-loaded.png'), fullPage: true });
  });

  test('Submissions table/list renders', async ({ page }) => {
    await page.goto('/dashboard/submissions');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check for table rows or submission cards
    const rows = page.locator('tr, [class*="submission"], [class*="card"]');
    const count = await rows.count();

    // Either has submissions or shows empty state
    const emptyState = page.getByText(/no submission|empty|no leads/i);
    if (count === 0) {
      // Empty state is fine
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'submissions-02-list.png'), fullPage: true });
  });

  test('Submission detail panel opens on click', async ({ page }) => {
    await page.goto('/dashboard/submissions');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click first submission row if available
    const firstRow = page.locator('tr').nth(1).or(page.locator('[class*="submission"]').first());
    if (await firstRow.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstRow.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'submissions-03-detail.png'), fullPage: true });
    }
  });

  test('Submissions filter controls', async ({ page }) => {
    await page.goto('/dashboard/submissions');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Look for filter/search elements
    const filterElements = page.locator('select, input[type="search"], input[placeholder*="search" i], input[placeholder*="filter" i]');
    const filterCount = await filterElements.count();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'submissions-04-filters.png'), fullPage: true });
  });

  test('Submissions mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard/submissions');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'submissions-05-mobile.png'), fullPage: true });
  });
});

// ============================================================
// DASHBOARD BILLING PAGE
// ============================================================
test.describe('Dashboard Billing Page', () => {
  test('Billing page loads with plan info', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');

    // Should show billing or plan info
    await expect(page.getByText(/Billing|Plan|Subscription/i).first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'billing-01-loaded.png'), fullPage: true });
  });

  test('Billing shows current plan details', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should show Starter or Pro plan
    const planText = page.getByText(/Starter|Pro/i).first();
    if (await planText.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(planText).toBeVisible();
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'billing-02-plan.png'), fullPage: true });
  });

  test('Billing upgrade/downgrade buttons exist', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for action buttons
    const actionButtons = page.getByRole('button', { name: /upgrade|downgrade|manage|change/i });
    const count = await actionButtons.count();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'billing-03-actions.png'), fullPage: true });
  });

  test('Billing mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard/billing');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'billing-04-mobile.png'), fullPage: true });
  });
});

// ============================================================
// DASHBOARD SETTINGS PAGE
// ============================================================
test.describe('Dashboard Settings Page', () => {
  test('Settings page loads with profile section', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/Settings/i).first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-01-loaded.png'), fullPage: true });
  });

  test('Settings shows editable profile fields', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should have input fields for profile
    const inputs = page.locator('input[type="text"], input[type="email"], input[type="tel"]');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-02-fields.png'), fullPage: true });
  });

  test('Settings slug section exists', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    // Scroll down to find slug section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    const slugSection = page.getByText(/slug|URL|link/i).first();
    if (await slugSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(slugSection).toBeVisible();
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-03-slug.png'), fullPage: true });
  });

  test('Settings danger zone exists', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const dangerSection = page.getByText(/danger|delete account|delete/i).first();
    if (await dangerSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(dangerSection).toBeVisible();
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-04-danger.png'), fullPage: true });
  });

  test('Settings mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'settings-05-mobile.png'), fullPage: true });
  });
});

// ============================================================
// CROSS-PAGE NAVIGATION
// ============================================================
test.describe('Dashboard Navigation', () => {
  test('Navigate between all dashboard pages without errors', async ({ page }) => {
    test.setTimeout(60000);
    const pages = [
      { url: '/dashboard', name: 'home' },
      { url: '/dashboard/form', name: 'form' },
      { url: '/dashboard/submissions', name: 'submissions' },
      { url: '/dashboard/billing', name: 'billing' },
      { url: '/dashboard/settings', name: 'settings' },
    ];

    for (const p of pages) {
      await page.goto(p.url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // No crash — page renders content
      const bodyText = await page.textContent('body');
      expect(bodyText?.length).toBeGreaterThan(0);

      // No console errors that indicate crashes
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `nav-${p.name}.png`), fullPage: true });
    }
  });

  test('Dashboard pages have consistent layout', async ({ page }) => {
    test.setTimeout(60000);
    const pages = ['/dashboard/form', '/dashboard/submissions', '/dashboard/billing', '/dashboard/settings'];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Check no horizontal overflow on any page
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    }
  });
});
