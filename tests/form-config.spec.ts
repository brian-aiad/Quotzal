import { test, expect } from '@playwright/test';

const DASHBOARD_FORM_URL = '/dashboard/form';

test.describe('Form Config Persistence', () => {
  test('Toggle a field show ON → refresh → still ON', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });

    // Click Auto Personal card to open config panel
    await page.getByText('Auto — Personal', { exact: true }).first().click();
    await page.waitForTimeout(1000);

    // Navigate to Personal Info tab
    const personalInfoTab = page.getByRole('button', { name: /Personal Info/i }).first();
    if (await personalInfoTab.isVisible().catch(() => false)) {
      await personalInfoTab.click();
      await page.waitForTimeout(500);
    }

    // Find a "Show" switch for an optional field (e.g., Occupation which should be OFF)
    const showSwitches = page.getByRole('switch', { name: 'Show' });
    const count = await showSwitches.count();
    expect(count).toBeGreaterThan(0);

    // Use the last Show switch (likely an "OFF" field like Occupation/Homeowner)
    const targetSwitch = showSwitches.last();
    const initialState = await targetSwitch.getAttribute('aria-checked');

    // Toggle it
    await targetSwitch.click();
    await page.waitForTimeout(200);
    const newState = await targetSwitch.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);

    // Wait for save
    await page.waitForTimeout(2000);
    await expect(page.getByText('Saved')).toBeVisible({ timeout: 5000 });

    // Refresh page
    await page.reload();
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });

    // Re-open config panel
    await page.getByText('Auto — Personal', { exact: true }).first().click();
    await page.waitForTimeout(1000);

    // Navigate to same tab
    const tab = page.getByRole('button', { name: /Personal Info/i }).first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(500);
    }

    // Verify the toggle persisted
    const switchAfterReload = page.getByRole('switch', { name: 'Show' }).last();
    await expect(switchAfterReload).toHaveAttribute('aria-checked', newState!);

    // Clean up — toggle back
    await switchAfterReload.click();
    await page.waitForTimeout(2000);
  });

  test('Toggle a single field OFF → refresh → still OFF', async ({ page }) => {
    await page.goto(DASHBOARD_FORM_URL);
    await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });

    await page.getByText('Auto — Personal', { exact: true }).first().click();
    await page.waitForTimeout(1000);

    const personalInfoTab = page.getByRole('button', { name: /Personal Info/i }).first();
    if (await personalInfoTab.isVisible().catch(() => false)) {
      await personalInfoTab.click();
      await page.waitForTimeout(500);
    }

    // Find a Show switch that is currently ON (checked=true) — e.g. DOB or Phone
    const showSwitches = page.getByRole('switch', { name: 'Show' });
    const count = await showSwitches.count();
    expect(count).toBeGreaterThan(0);

    // Pick the first ON switch
    let targetIdx = -1;
    for (let i = 0; i < count; i++) {
      const state = await showSwitches.nth(i).getAttribute('aria-checked');
      if (state === 'true') { targetIdx = i; break; }
    }

    if (targetIdx >= 0) {
      // Toggle it OFF
      await showSwitches.nth(targetIdx).click();
      await page.waitForTimeout(200);
      const afterToggle = await showSwitches.nth(targetIdx).getAttribute('aria-checked');
      expect(afterToggle).toBe('false');

      // Wait for save indicator
      await expect(page.getByText('Saved')).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1000);

      // Refresh
      await page.reload();
      await expect(page.getByRole('heading', { name: 'My Form' })).toBeVisible({ timeout: 10000 });
      await page.getByText('Auto — Personal', { exact: true }).first().click();
      await page.waitForTimeout(1000);

      const tab = page.getByRole('button', { name: /Personal Info/i }).first();
      if (await tab.isVisible().catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(500);
      }

      // Verify it's still OFF after reload
      const switchAfterReload = page.getByRole('switch', { name: 'Show' }).nth(targetIdx);
      await expect(switchAfterReload).toHaveAttribute('aria-checked', 'false');

      // Clean up — toggle back ON
      await switchAfterReload.click();
      await page.waitForTimeout(3000);
    }
  });
});
