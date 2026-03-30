import { test, expect } from '@playwright/test';

const ROLES = [
  { role: 'Admin', email: 'admin@shipnovo.com', password: 'password', dashboard: '/ops/dashboard' },
  { role: 'Ops', email: 'ops@shipnovo.com', password: 'password', dashboard: '/ops/dashboard' },
  { role: 'Customer', email: 'customer@example.com', password: 'password', dashboard: '/customer/dashboard' },
  { role: 'Partner', email: 'carrier@globalcarrier.com', password: 'password', dashboard: '/partner/dashboard' },
];

for (const user of ROLES) {
  test(`Smoke Test - Login & Dashboard for ${user.role}`, async ({ page }) => {
    // 1. Visit Login
    await page.goto('/login');
    
    // 2. Perform Login using Quick Access Button
    await page.getByRole('button', { name: user.role, exact: true }).click();

    // 3. Wait for Navigation to Dashboard (longer timeout)
    await page.waitForURL(`**${user.dashboard}`, { timeout: 15000 });
    
    // 4. Assert Key Page Elements using headings
    if (user.role === 'Customer') {
      await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
    } else if (user.role === 'Ops' || user.role === 'Admin') {
      await expect(page.locator('h1:has-text("Operations Dashboard")')).toBeVisible();
    } else if (user.role === 'Partner') {
      await expect(page.locator('h1:has-text("Partner Dashboard")')).toBeVisible();
    }
    
    // 5. Assert No Duplicate Shell (header/aside should appear once)
    const headerCount = await page.locator('header').count();
    const sidebarCount = await page.locator('aside').count();
    expect(headerCount).toBe(1);
    expect(sidebarCount).toBe(1);
  });
}

test('Public Access Smoke Test', async ({ page }) => {
  await page.goto('/');
  // Check for the brand name specifically in the header or title
  await expect(page.locator('nav >> text=ShipNovo')).toBeVisible();
  
  await page.goto('/track/tk_demo_rfq');
  await expect(page.locator('h1:has-text("Tracking")')).toBeVisible();
});

test('404 Page Verification', async ({ page }) => {
  const response = await page.goto('/non-existent-page');
  expect(response?.status() === 404 || response?.status() === 308).toBeTruthy();
});
