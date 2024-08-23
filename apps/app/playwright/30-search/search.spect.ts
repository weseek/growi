import { test, expect } from '@playwright/test';

test('Successfully rebuild index', async({ page }) => {
  await page.goto('/admin/search');

  await expect(page.getByTestId('admin-full-text-search')).toBeVisible();

  await expect(page.getByTestId('connection-status-label')).toHaveText('CONNECTED');
});
