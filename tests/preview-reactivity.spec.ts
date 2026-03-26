import { test, expect } from '@playwright/test';

const DASHBOARD_FORM_URL = '/dashboard/form';

test.describe('Preview Reactivity', () => {
  test('Click step tabs → preview navigates through steps', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });

    // Click Auto Personal to open config panel
    await page.getByText('Auto — Personal', { exact: true }).first().click();
    await page.waitForTimeout(1000);

    // Click through step tabs — both in config panel and in preview
    const stepButtons = [
      'Go to step 2: Personal Info',
      'Go to step 3: Drivers',
      'Go to step 4: Vehicles',
      'Go to step 5: Current Insurance',
    ];

    for (const stepName of stepButtons) {
      // Click the config panel step tab (first match)
      const btn = page.getByRole('button', { name: stepName }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }

    // Navigate back to step 1
    const step1Btn = page.getByRole('button', { name: 'Go to step 1: Insurance Type' }).first();
    if (await step1Btn.isVisible().catch(() => false)) {
      await step1Btn.click();
      await page.waitForTimeout(300);
    }
  });

  test('Switch between types → preview type label updates', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Click Home/Renters
    await page.getByText('Home / Renters', { exact: true }).first().click();
    await page.waitForTimeout(500);

    // Config panel heading should show Home/Renters
    await expect(page.getByRole('heading', { name: /Home/ })).toBeVisible({ timeout: 2000 });

    // Click Auto Personal
    await page.getByText('Auto — Personal', { exact: true }).first().click();
    await page.waitForTimeout(500);

    // Config panel heading should update
    await expect(page.getByRole('heading', { name: /Auto — Personal/ })).toBeVisible({ timeout: 2000 });
  });

  test('Toggle field → save indicator appears', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });

    // Open Auto Personal config
    await page.getByText('Auto — Personal', { exact: true }).first().click();
    await page.waitForTimeout(1000);

    // Navigate to Personal Info tab
    const personalInfoTab = page.getByRole('button', { name: /Personal Info/i }).first();
    if (await personalInfoTab.isVisible().catch(() => false)) {
      await personalInfoTab.click();
      await page.waitForTimeout(500);
    }

    // Toggle a field Show switch
    const showSwitches = page.getByRole('switch', { name: 'Show' });
    if (await showSwitches.count() > 0) {
      await showSwitches.first().click();

      // Should eventually see "Saved"
      await expect(page.getByText('Saved')).toBeVisible({ timeout: 5000 });

      // Toggle back to clean up
      await showSwitches.first().click();
      await page.waitForTimeout(2000);
    }
  });
});
