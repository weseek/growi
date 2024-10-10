import { test, expect } from '@playwright/test';

import { openEditor } from '../utils';

test('Successfully select template and template locale', async({ page }) => {
  const jaText = '今日の目標';
  const enText = "TODAY'S GOALS";
  await page.goto('/Sandbox/TemplateModal');

  await openEditor(page);

  // open TemplateModal
  const templateModal = page.getByTestId('template-modal');
  await page.getByTestId('open-template-button').click();
  await expect(templateModal).toBeVisible();

  // select template and template locale
  await templateModal.locator('.list-group-item').nth(0).click();
  await expect(templateModal.locator('.card-body').locator('.has-data-line').nth(1)).toHaveText(enText);
  await templateModal.getByTestId('select-locale-dropdown-toggle').click();
  await templateModal.getByTestId('select-locale-dropdown-item').nth(1).click();
  await expect(templateModal.locator('.card-body').locator('.has-data-line').nth(1)).toHaveText(jaText);

  // insert
  await templateModal.locator('.btn-primary').click();
  await expect(page.locator('.has-data-line').nth(1)).toHaveText(jaText);
});
