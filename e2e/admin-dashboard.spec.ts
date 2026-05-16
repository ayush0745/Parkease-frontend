import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the login API to return an ADMIN user
    await page.route('**/api/v1/auth/login', async route => {
      const json = {
        accessToken: 'fake-jwt-token-admin',
        userId: 1,
        email: 'admin@example.com',
        role: 'ADMIN',
        fullName: 'System Admin'
      };
      await route.fulfill({ json });
    });

    // Also mock the profile fetch
    await page.route('**/api/v1/auth/profile', async route => {
      const json = {
        id: 1,
        email: 'admin@example.com',
        role: 'ADMIN',
        fullName: 'System Admin'
      };
      await route.fulfill({ json });
    });

    // Mock pending lots
    await page.route('**/api/v1/parking-lots/pending', async route => {
      const json = [
        {
          lotId: 101,
          name: 'Test Lot',
          address: '123 Test St',
          city: 'Test City',
          managerId: 2,
          createdAt: new Date().toISOString()
        }
      ];
      await route.fulfill({ json });
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL(/.*\/admin\/dashboard/);
  });

  test('Dashboard loads admin components', async ({ page }) => {
    await expect(page.locator('text="Platform Admin"')).toBeVisible();
    await expect(page.locator('text="Total Users"')).toBeVisible();
    await expect(page.locator('text="Active Lots"')).toBeVisible();
    await expect(page.locator('text="Pending Lot Approvals"')).toBeVisible();
  });

  test('Admin can see pending lots', async ({ page }) => {
    await expect(page.locator('text="Test Lot"')).toBeVisible();
    await expect(page.locator('button:has-text("Approve")')).toBeVisible();
    await expect(page.locator('button:has-text("Reject")')).toBeVisible();
  });
});
