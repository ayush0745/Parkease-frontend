import { test, expect } from '@playwright/test';

test.describe('Manager Dashboard Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the login API to return a MANAGER user
    await page.route('**/api/v1/auth/login', async route => {
      const json = {
        accessToken: 'fake-jwt-token-manager',
        userId: 2,
        email: 'manager@example.com',
        role: 'MANAGER',
        fullName: 'Test Manager'
      };
      await route.fulfill({ json });
    });

    // Also mock the profile fetch if it happens
    await page.route('**/api/v1/auth/profile', async route => {
      const json = {
        id: 2,
        email: 'manager@example.com',
        role: 'MANAGER',
        fullName: 'Test Manager'
      };
      await route.fulfill({ json });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'manager@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL(/.*\/manager\/dashboard/);
  });

  test('Dashboard loads manager components', async ({ page }) => {
    await expect(page.locator('text="Manager Dashboard"')).toBeVisible();
    await expect(page.locator('text="Total Lots"')).toBeVisible();
    await expect(page.locator('text="Active Bookings"')).toBeVisible();
    await expect(page.locator('text="My Parking Lots"')).toBeVisible();
  });

  test('Manager can navigate to Manage Lots', async ({ page }) => {
    await page.click('button:has-text("Manage Lots")');
    await expect(page).toHaveURL(/.*\/manager\/lots/);
  });
});
