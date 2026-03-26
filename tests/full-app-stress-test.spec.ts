import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots');

// ═══════════════════════════════════════════════════════════════
// 1. LANDING PAGE
// ═══════════════════════════════════════════════════════════════
test.describe('Landing Page', () => {
  test('loads without crash and hero renders', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Hero headline should be visible
    await expect(page.getByRole('heading', { name: 'Stop chasing clients' })).toBeVisible({ timeout: 10000 });

    // No horizontal overflow on desktop
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing-01-hero.png'), fullPage: true });
  });

  test('nav links are clickable — Log in and Sign Up Free', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    const loginLink = page.getByRole('navigation').getByRole('link', { name: 'Log in' });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');

    const signupLink = page.getByRole('navigation').getByRole('link', { name: 'Sign Up Free' });
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toHaveAttribute('href', '/signup');
  });

  test('Log in link navigates to /login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('link', { name: 'Log in' }).click();
    await page.waitForURL('**/login');
    await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing-02-login-nav.png') });
  });

  test('Sign Up Free link navigates to /signup', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign Up Free' }).click();
    await page.waitForURL('**/signup');
    await expect(page.getByText('Start your free trial')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'landing-03-signup-nav.png') });
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. LOGIN PAGE
// ═══════════════════════════════════════════════════════════════
test.describe('Login Page', () => {
  test('renders all elements correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /start free trial/i })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login-01-rendered.png') });
  });

  test('empty form submission shows validation', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 10000 });

    // HTML5 validation should prevent submission — email is required
    const emailInput = page.locator('#login-email');
    const isRequired = await emailInput.getAttribute('required');
    expect(isRequired !== null).toBeTruthy();
  });

  test('password toggle works', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-password')).toBeVisible({ timeout: 10000 });

    const pwInput = page.locator('#login-password');
    await expect(pwInput).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: /show password/i }).click();
    await expect(pwInput).toHaveAttribute('type', 'text');

    await page.getByRole('button', { name: /hide password/i }).click();
    await expect(pwInput).toHaveAttribute('type', 'password');
  });

  test('invalid credentials show error message', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 10000 });

    await page.locator('#login-email').fill('fake@test.com');
    await page.locator('#login-password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login-02-error.png') });
  });

  test('Forgot password link navigates correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole('link', { name: /forgot password/i }).click();
    await page.waitForURL('**/forgot-password');
    await expect(page.getByText('Reset your password')).toBeVisible({ timeout: 10000 });
  });

  test('Sign up link navigates correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /start free trial/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole('link', { name: /start free trial/i }).click();
    await page.waitForURL('**/signup');
    await expect(page.getByText('Start your free trial')).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. SIGNUP PAGE
// ═══════════════════════════════════════════════════════════════
test.describe('Signup Page', () => {
  test('renders all elements correctly', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText('Start your free trial')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('30 days free')).toBeVisible();
    await expect(page.locator('#signup-email')).toBeVisible();
    await expect(page.locator('#signup-password')).toBeVisible();
    await expect(page.locator('#signup-confirm')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signup-01-rendered.png') });
  });

  test('plan selector toggles between Starter and Pro', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText('Start your free trial')).toBeVisible({ timeout: 10000 });

    // Click Pro plan
    const proButton = page.getByRole('button', { name: /Pro/i }).first();
    await proButton.click();
    // The pro card should now be selected (has emerald border)
    await expect(proButton).toHaveClass(/border-emerald/);

    // Click Starter plan
    const starterButton = page.getByRole('button', { name: /Starter/i }).first();
    await starterButton.click();
    await expect(starterButton).toHaveClass(/border-emerald/);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signup-02-plan-toggle.png') });
  });

  test('password strength indicator updates', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('#signup-password')).toBeVisible({ timeout: 10000 });

    // Type weak password (6+ chars triggers strength bar, but weak)
    await page.locator('#signup-password').fill('abcdef');
    await expect(page.getByText('Weak')).toBeVisible();

    // Type strong password
    await page.locator('#signup-password').fill('StrongPass1!');
    await expect(page.getByText('Strong')).toBeVisible();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signup-03-strength.png') });
  });

  test('password mismatch shows error', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('#signup-email')).toBeVisible({ timeout: 10000 });

    await page.locator('#signup-email').fill('test@test.com');
    await page.locator('#signup-password').fill('TestPass1!');
    await page.locator('#signup-confirm').fill('DifferentPass');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signup-04-mismatch.png') });
  });

  test('short password shows error', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('#signup-email')).toBeVisible({ timeout: 10000 });

    await page.locator('#signup-email').fill('test@test.com');
    await page.locator('#signup-password').fill('ab');
    await page.locator('#signup-confirm').fill('ab');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible({ timeout: 5000 });
  });

  test('password toggle buttons work for both fields', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('#signup-password')).toBeVisible({ timeout: 10000 });

    // Password field toggle
    await expect(page.locator('#signup-password')).toHaveAttribute('type', 'password');
    const toggleButtons = page.getByRole('button', { name: /show password/i });
    await toggleButtons.first().click();
    await expect(page.locator('#signup-password')).toHaveAttribute('type', 'text');

    // Confirm field toggle
    await expect(page.locator('#signup-confirm')).toHaveAttribute('type', 'password');
    await toggleButtons.first().click();
    await expect(page.locator('#signup-confirm')).toHaveAttribute('type', 'text');
  });

  test('Terms and Privacy links exist and point correctly', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText('Start your free trial')).toBeVisible({ timeout: 10000 });

    const termsLink = page.getByRole('link', { name: 'Terms' });
    await expect(termsLink).toBeVisible();
    await expect(termsLink).toHaveAttribute('href', '/terms');

    const privacyLink = page.getByRole('link', { name: 'Privacy Policy' });
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  test('Sign in link navigates to login', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole('link', { name: /sign in/i }).click();
    await page.waitForURL('**/login');
    await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10000 });
  });

  test('plan=pro query param pre-selects Pro', async ({ page }) => {
    await page.goto('/signup?plan=pro');
    await expect(page.getByText('Start your free trial')).toBeVisible({ timeout: 10000 });

    const proButton = page.getByRole('button', { name: /Pro/i }).first();
    await expect(proButton).toHaveClass(/border-emerald/);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. FORGOT PASSWORD PAGE
// ═══════════════════════════════════════════════════════════════
test.describe('Forgot Password Page', () => {
  test('renders all elements', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByText('Reset your password')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#reset-email')).toBeVisible();
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to sign in/i })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'forgot-pw-01-rendered.png') });
  });

  test('Back to sign in links work', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByText('Reset your password')).toBeVisible({ timeout: 10000 });

    // There are two "back to sign in" links — header and footer
    const backLinks = page.getByRole('link', { name: /sign in/i });
    await expect(backLinks.first()).toBeVisible();
    await backLinks.first().click();
    await page.waitForURL('**/login');
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. ONBOARDING PAGE (no auth required — tests UI rendering)
// ═══════════════════════════════════════════════════════════════
test.describe('Onboarding Page', () => {
  test('loads and shows step 1 — Business Info', async ({ page }) => {
    await page.goto('/onboarding');
    // May redirect to login if not authenticated
    const url = page.url();
    if (url.includes('/login')) {
      // Expected behavior for unauthenticated users
      await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'onboarding-01-redirected.png') });
      return;
    }

    // If authenticated, check step 1
    await expect(page.getByText('Set up your brokerage')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#brokerageName')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
    await expect(page.locator('#address')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'onboarding-01-step1.png') });
  });

  test('step 1 validation — empty fields show errors', async ({ page }) => {
    await page.goto('/onboarding');
    if (page.url().includes('/login')) { return; }

    // Clear any persisted state
    await page.evaluate(() => localStorage.removeItem('quotzal_onboarding_state'));
    await page.reload();
    await expect(page.getByText('Set up your brokerage')).toBeVisible({ timeout: 10000 });

    // Try to proceed without filling anything
    await page.getByRole('button', { name: /continue/i }).click();

    await expect(page.getByText('Brokerage name is required')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Valid 10-digit phone number is required')).toBeVisible();
    await expect(page.getByText('Business address is required')).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'onboarding-02-validation.png') });
  });

  test('step 1 → step 2 → step 3 navigation works', async ({ page }) => {
    await page.goto('/onboarding');
    if (page.url().includes('/login')) { return; }

    await page.evaluate(() => localStorage.removeItem('quotzal_onboarding_state'));
    await page.reload();
    await expect(page.getByText('Set up your brokerage')).toBeVisible({ timeout: 10000 });

    // Fill step 1
    await page.locator('#brokerageName').fill('Test Brokerage Inc');
    await page.locator('#phone').fill('5551234567');
    await page.locator('#address').fill('123 Main St, New York, NY 10001');
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 2 — Insurance Types
    await expect(page.getByText('Select the types of insurance')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'onboarding-03-step2.png') });

    // Try to continue without selecting any type
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText('Select at least one insurance type')).toBeVisible({ timeout: 3000 });

    // Select Auto Personal
    await page.getByRole('button', { name: /auto.*personal/i }).click();
    await expect(page.getByText('1 of')).toBeVisible();

    // Select Home
    await page.getByRole('button', { name: /home/i }).first().click();
    await expect(page.getByText('2 of')).toBeVisible();

    await page.getByRole('button', { name: /continue/i }).click();

    // Step 3 — Branding / Final
    await expect(page.getByText(/all set|almost there/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Your intake form is ready')).toBeVisible();
    await expect(page.getByRole('button', { name: /start free trial/i })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'onboarding-04-step3.png') });
  });

  test('step 2 and 3 back buttons work', async ({ page }) => {
    await page.goto('/onboarding');
    if (page.url().includes('/login')) { return; }

    await page.evaluate(() => localStorage.removeItem('quotzal_onboarding_state'));
    await page.reload();
    await expect(page.getByText('Set up your brokerage')).toBeVisible({ timeout: 10000 });

    // Fill step 1
    await page.locator('#brokerageName').fill('Test Brokerage');
    await page.locator('#phone').fill('5551234567');
    await page.locator('#address').fill('123 Main St, City, ST 12345');
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 2
    await expect(page.getByText('Select the types of insurance')).toBeVisible({ timeout: 5000 });

    // Back button to step 1
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.locator('#brokerageName')).toBeVisible({ timeout: 5000 });
    // Data should be preserved
    await expect(page.locator('#brokerageName')).toHaveValue('Test Brokerage');

    // Go forward again
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.getByText('Select the types of insurance')).toBeVisible({ timeout: 5000 });

    // Select a type and go to step 3
    await page.getByRole('button', { name: /auto.*personal/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Step 3
    await expect(page.getByText(/all set|almost there/i)).toBeVisible({ timeout: 5000 });

    // Back button to step 2
    await page.getByText('Back').click();
    await expect(page.getByText('Select the types of insurance')).toBeVisible({ timeout: 5000 });
  });

  test('phone formatting works correctly', async ({ page }) => {
    await page.goto('/onboarding');
    if (page.url().includes('/login')) { return; }

    await page.evaluate(() => localStorage.removeItem('quotzal_onboarding_state'));
    await page.reload();
    await expect(page.locator('#phone')).toBeVisible({ timeout: 10000 });

    await page.locator('#phone').fill('5551234567');
    const formatted = await page.locator('#phone').inputValue();
    expect(formatted).toBe('(555) 123-4567');
  });

  test('checkout=cancelled returns to step 3 without error', async ({ page }) => {
    await page.goto('/onboarding?checkout=cancelled');
    const url = page.url();
    if (url.includes('/login')) { return; }

    // Should not show "broker already exists" error
    const errorText = page.getByText(/already exists/i);
    await expect(errorText).not.toBeVisible({ timeout: 3000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'onboarding-05-cancelled.png') });
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. DASHBOARD PAGES (redirects to login if not authed)
// ═══════════════════════════════════════════════════════════════
test.describe('Dashboard — Page Load Tests', () => {
  const dashboardPages = [
    { path: '/dashboard', name: 'Dashboard Home' },
    { path: '/dashboard/submissions', name: 'Submissions' },
    { path: '/dashboard/form', name: 'My Form' },
    { path: '/dashboard/settings', name: 'Settings' },
    { path: '/dashboard/billing', name: 'Billing' },
  ];

  for (const pg of dashboardPages) {
    test(`${pg.name} page loads or redirects to login`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await page.goto(pg.path);
      await page.waitForLoadState('networkidle');

      const url = page.url();
      if (url.includes('/login')) {
        // Expected: redirected to login for unauthenticated users
        await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10000 });
      } else if (url.includes('/onboarding')) {
        // Broker not set up yet — redirected to onboarding
        await expect(page.locator('body')).toBeVisible();
      } else {
        // Authenticated — page loaded
        await expect(page.locator('body')).toBeVisible();
        // No JS errors
        expect(errors).toHaveLength(0);
      }

      const safeName = pg.name.toLowerCase().replace(/\s+/g, '-');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `dashboard-${safeName}.png`), fullPage: true });
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// 7. STATIC PAGES
// ═══════════════════════════════════════════════════════════════
test.describe('Static Pages', () => {
  test('Privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('body')).toBeVisible();
    // Should not have any 500 error
    const content = await page.textContent('body');
    expect(content).not.toContain('Internal Server Error');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'privacy-page.png'), fullPage: true });
  });

  test('Terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('body')).toBeVisible();
    const content = await page.textContent('body');
    expect(content).not.toContain('Internal Server Error');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'terms-page.png'), fullPage: true });
  });

  test('Demo page loads', async ({ page }) => {
    await page.goto('/demo');
    await expect(page.locator('body')).toBeVisible();
    const content = await page.textContent('body');
    expect(content).not.toContain('Internal Server Error');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'demo-page.png'), fullPage: true });
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. CROSS-PAGE NAVIGATION INTEGRITY
// ═══════════════════════════════════════════════════════════════
test.describe('Cross-Page Navigation', () => {
  test('login → signup → login round trip', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10000 });

    await page.getByRole('link', { name: /start free trial/i }).click();
    await page.waitForURL('**/signup');
    await expect(page.getByText('Start your free trial')).toBeVisible({ timeout: 10000 });

    await page.getByRole('link', { name: /sign in/i }).click();
    await page.waitForURL('**/login');
    await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10000 });
  });

  test('login → forgot-password → login round trip', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10000 });

    await page.getByRole('link', { name: /forgot password/i }).click();
    await page.waitForURL('**/forgot-password');
    await expect(page.getByText('Reset your password')).toBeVisible({ timeout: 10000 });

    await page.getByRole('link', { name: /sign in/i }).first().click();
    await page.waitForURL('**/login');
    await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10000 });
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. RESPONSIVE TESTS
// ═══════════════════════════════════════════════════════════════
test.describe('Responsive — Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('landing page mobile renders without overflow', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-landing.png'), fullPage: true });
  });

  test('login page mobile renders without overflow', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-login.png'), fullPage: true });
  });

  test('signup page mobile renders without overflow', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText('Start your free trial')).toBeVisible({ timeout: 10000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-signup.png'), fullPage: true });
  });

  test('onboarding page mobile renders without overflow', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-onboarding.png'), fullPage: true });
  });
});

// ═══════════════════════════════════════════════════════════════
// 10. NO 404/500 ON ANY ROUTE
// ═══════════════════════════════════════════════════════════════
test.describe('No Server Errors on Any Route', () => {
  const allPages = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/onboarding',
    '/dashboard',
    '/dashboard/submissions',
    '/dashboard/form',
    '/dashboard/settings',
    '/dashboard/billing',
    '/privacy',
    '/terms',
    '/demo',
  ];

  for (const route of allPages) {
    test(`${route} does not return 500`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).not.toBe(500);
      // 200 or 3xx redirect — both fine
      expect(response?.status()).toBeLessThan(500);
    });
  }
});
