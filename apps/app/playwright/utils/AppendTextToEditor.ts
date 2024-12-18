import { expect, type Page } from '@playwright/test';

export const appendTextToEditor = async(page: Page, text: string): Promise<void> => {
  await page.locator('.cm-content').fill(text);
  await expect(page.getByTestId('page-editor-preview-body')).toHaveText(text);
};
