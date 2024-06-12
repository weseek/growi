import path from 'node:path';

import { test as setup, expect } from '@playwright/test';

const authFile = path.resolve(__dirname, './.auth/admin.json');

setup('Authenticate as the "admin" user', async({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('/admin');

  const loginForm = await page.$('form#login-form');

  if (loginForm != null) {
    await page.getByLabel('Username or E-mail').fill('admin');
    await page.getByLabel('Password').fill('adminadmin');
    await page.locator('[type=submit]').filter({ hasText: 'Login' }).click();
  }

  await page.waitForURL('/admin');
  await expect(page).toHaveTitle(/Wiki Management Homepage/);

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
