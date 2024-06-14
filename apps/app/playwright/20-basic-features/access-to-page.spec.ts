import { test, expect } from '@playwright/test';

test('has title', async({ page }) => {
  await page.goto('/Sandbox');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Sandbox/);
});

test('get h1', async({ page }) => {
  await page.goto('/Sandbox');

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading').filter({ hasText: /\/Sandbox/ })).toBeVisible();
});

test('Access to /me page', async({ page }) => {
  await page.goto('/me');

  // Expect the UserSettgins-specific elements to be present when accessing /me (UserSettgins)
  await expect(page.getByTestId('grw-user-settings')).toBeVisible();
});
