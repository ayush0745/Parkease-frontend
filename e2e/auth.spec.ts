import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('User can navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text="Sign In"');
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('text="Welcome back"')).toBeVisible();
  });

  test('User can navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page.click('text="Get Started"');
    await expect(page).toHaveURL(/.*\/register/);
    await expect(page.locator('text="Create an account"')).toBeVisible();
  });

  test('Driver registration and login flow', async ({ page }) => {
    const timestamp = new Date().getTime();
    const email = `testdriver_${timestamp}@example.com`;
    const password = 'password123';

    // 1. Register
    await page.goto('/register');
    await page.fill('input[placeholder="John"]', 'Test Driver');
    await page.fill('input[placeholder="Doe"]', 'User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="tel"]', '1234567890');
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Create account")');

    // Assuming registration logs in automatically or redirects to dashboard
    // Let's wait for dashboard URL or login page
    await page.waitForURL(/.*\/dashboard|.*\/login/);

    if (page.url().includes('/login')) {
      // 2. Login if redirected
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button:has-text("Sign in")');
      await page.waitForURL(/.*\/dashboard/);
    }

    // Verify dashboard
    await expect(page.locator('app-driver-dashboard')).toBeVisible();
    await expect(page.locator('text="Welcome back"')).toBeVisible();
  });
});
