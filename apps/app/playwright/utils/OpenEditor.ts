import { expect, type Page } from '@playwright/test';

export const openEditor = async(page: Page): Promise<void> => {
  await expect(page.getByTestId('page-view-layout')).toBeVisible();
  await page.getByTestId('editor-button').click();
  await expect(page.getByTestId('grw-editor-navbar-bottom')).toBeVisible();
  await expect(page.locator('.cm-editor')).toBeVisible();
};
