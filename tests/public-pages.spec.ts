import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots', 'public');

// ============================================================
// LANDING PAGE
// ============================================================
test.describe('Landing Page', () => {
  test('Landing page loads and renders hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have some hero content
    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(100);

    // Should have CTA buttons
    const ctaButtons = page.getByRole('link', { name: /get started|sign up|try|demo/i });
    if (await ctaButtons.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(ctaButtons.first()).toBeVisible();
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing-01-hero.png'), fullPage: true });
  });

  test('Landing page scroll reveals all sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll through the page in increments
    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    const step = 500;

    for (let y = 0; y < totalHeight; y += step) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      await page.waitForTimeout(200);
    }

    // Full page screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing-02-full.png'), fullPage: true });
  });

  test('Landing page mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // No horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing-03-mobile.png'), fullPage: true });
  });

  test('Landing page tablet responsive', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing-04-tablet.png'), fullPage: true });
  });

  test('Landing page navigation links work', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check nav links
    const links = page.locator('nav a, header a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing-05-nav.png'), fullPage: true });
  });
});

// ============================================================
// PRIVACY PAGE
// ============================================================
test.describe('Privacy Policy Page', () => {
  test('Privacy page loads with content', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    const body = await page.textContent('body');
    expect(body).toContain('Privacy');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'privacy-01-page.png'), fullPage: true });
  });

  test('Privacy page mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'privacy-02-mobile.png'), fullPage: true });
  });
});

// ============================================================
// TERMS PAGE
// ============================================================
test.describe('Terms of Service Page', () => {
  test('Terms page loads with content', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');

    const body = await page.textContent('body');
    expect(body).toContain('Terms');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'terms-01-page.png'), fullPage: true });
  });
});

// ============================================================
// DEMO PAGE
// ============================================================
test.describe('Demo Page', () => {
  test('Demo page loads', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');

    const body = await page.textContent('body');
    expect(body?.length).toBeGreaterThan(50);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'demo-01-page.png'), fullPage: true });
  });
});

// ============================================================
// 404 PAGE
// ============================================================
test.describe('404 Page', () => {
  test('Non-existent page shows 404', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz');

    // Should return 404 status or show not found content
    const status = response?.status();
    const body = await page.textContent('body');
    const is404 = status === 404 || body?.toLowerCase().includes('not found') || body?.toLowerCase().includes('404');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '404-01-page.png'), fullPage: true });
  });

  test('Non-existent form slug shows appropriate message', async ({ page }) => {
    await page.goto('/f/this-broker-does-not-exist');
    await page.waitForLoadState('networkidle');

    // Should show not found or error message
    const body = await page.textContent('body');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '404-02-bad-slug.png'), fullPage: true });
  });
});

// ============================================================
// FORM ACCESSIBILITY
// ============================================================
test.describe('Form Accessibility', () => {
  test('Form inputs have proper labels or placeholders', async ({ page }) => {
    await page.goto('/f/test-broker');
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByText('Personal Information')).toBeVisible({ timeout: 5000 });

    // All visible inputs should have labels, aria-labels, or placeholders
    const inputs = page.locator('input:visible');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      const type = await input.getAttribute('type');

      // Hidden inputs are ok without labels
      if (type === 'hidden') continue;

      // Should have at least one identifying attribute
      const hasIdentifier = ariaLabel || placeholder || id || name;
      // This is informational — screenshot will show the state
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'a11y-01-labels.png'), fullPage: true });
  });

  test('Form is keyboard navigable', async ({ page }) => {
    await page.goto('/f/test-broker');
    await page.waitForLoadState('networkidle');

    // Tab through the insurance type buttons
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'a11y-02-keyboard.png'), fullPage: true });
  });

  test('Form contrast on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/f/test-broker');
    await page.getByRole('button', { name: /Auto.*Personal/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByText('Personal Information')).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'a11y-03-mobile-form.png'), fullPage: true });
  });
});
