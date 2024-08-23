import { test, expect } from '@playwright/test';

test('Successfully rebuild index', async({ page }) => {
  await page.goto('/admin/search');

  await expect(page.getByTestId('admin-full-text-search')).toBeVisible();

  await expect(page.getByTestId('connection-status-label')).toHaveText('CONNECTED');
});

test('Search page with "q" param is successfully loaded', async({ page }) => {
  // Navigate to the search page with query parameters
  await page.goto('/_search?q=alerts');

  // Confirm search result elements are visible
  await expect(page.getByTestId('search-result-base')).toBeVisible();
});
