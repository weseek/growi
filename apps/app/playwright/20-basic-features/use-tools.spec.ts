import { test, expect } from '@playwright/test';

test('Page Deletion and PutBack is executed successfully', async({ page }) => {
  await page.goto('/Sandbox/Bootstrap5');

  await expect(page.getByTestId('grw-contextual-sub-nav')).toBeVisible();
  await page.getByTestId('open-page-item-control-btn').click();
  await page.getByTestId('open-page-delete-modal-btn').click();
  await expect(page.getByTestId('page-delete-modal')).toBeVisible();
  await page.getByTestId('delete-page-button').click();
});
