import { test, expect } from '@playwright/test';

test.describe('Driver Dashboard Flows', () => {
  // Before each test, we need to log in as a driver
  test.beforeEach(async ({ page }) => {
    // Generate a unique user for this test suite
    const timestamp = new Date().getTime();
    const email = `driver_${timestamp}@example.com`;
    const password = 'password123';

    await page.goto('/register');
    await page.fill('input[placeholder="John"]', 'Test');
    await page.fill('input[placeholder="Doe"]', 'Driver');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Create account")');

    await page.waitForURL(/.*\/dashboard|.*\/login/);

    if (page.url().includes('/login')) {
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button:has-text("Sign in")');
      await page.waitForURL(/.*\/dashboard/);
    }
  });

  test('Dashboard loads main components', async ({ page }) => {
    await expect(page.locator('text="Welcome back, Driver!"')).toBeVisible();
    await expect(page.locator('text="Active Bookings"')).toBeVisible();
    await expect(page.locator('text="Total Bookings"')).toBeVisible();
    await expect(page.locator('text="Vehicles"')).toBeVisible();
    await expect(page.locator('text="Total Spent"')).toBeVisible();
  });

  test('Driver can navigate to Find Parking', async ({ page }) => {
    await page.click('button:has-text("Find Parking")');
    await expect(page).toHaveURL(/.*\/driver\/search/);
    await expect(page.locator('text="Find Parking"')).toBeVisible();
  });

  test('Driver can interact with Active Bookings', async ({ page }) => {
    // Wait for the simulated API to load
    await page.waitForTimeout(2000); 

    // The component has a 'Check In' button for CONFIRMED status
    const checkInButton = page.locator('button:has-text("Check In")');
    if (await checkInButton.count() > 0) {
      await checkInButton.first().click();
      // Should change to Check Out
      await expect(page.locator('button:has-text("Check Out")').first()).toBeVisible();
    }
  });
});
