import { test, expect } from '@playwright/test';

test('/Sandbox is successfully loaded', async({ page }) => {

  await page.goto('/Sandbox');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Sandbox/);
});
