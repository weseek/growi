import { test, expect } from '@playwright/test';

test.describe('Create page button', () => {
  test('click and autofocus to title text input', async({ page }) => {
    await page.goto('/');

    await page.getByTestId('grw-page-create-button').getByRole('button', { name: 'Create' }).click();

    // should be focused
    await expect(page.getByPlaceholder('Input page name')).toBeFocused();
  });
});

test.describe('Create page button dropdown menu', () => {
  test('open and ', async({ page }) => {
    await page.goto('/');

    // open dropdown menu
    await page.getByTestId('grw-page-create-button').hover();
    await page.getByTestId('grw-page-create-button')
      .getByLabel('Open create page menu').click({ force: true }); // force click to prevent pointer events loop: refs https://github.com/microsoft/playwright/issues/12298#issuecomment-1170136711
    await page.getByRole('menuitem', { name: 'Create today page' }).click();

    // should not be focused
    await expect(page.getByPlaceholder('Input page name')).not.toBeFocused();
  });
});
