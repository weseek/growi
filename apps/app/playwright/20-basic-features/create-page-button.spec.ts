import { test, expect } from '@playwright/test';

test.describe('Create page button', () => {
  test('click and autofocus to title text input', async({ page }) => {
    await page.goto('/');

    await page.getByTestId('grw-page-create-button').getByLabel('Create').click();
    await expect(page.getByPlaceholder('Input page name')).toBeFocused();
  });
});
