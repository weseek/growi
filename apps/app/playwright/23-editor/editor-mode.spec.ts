import { test, expect } from '@playwright/test';

const string = 'hoge';
const longString = 'a'.repeat(10001);

test('Expect Collaborative editor mode when opening pages with content length below YJS_MAX_BODY_LENGTH', async({ page }) => {
  await page.goto('/Sandbox/collaborative-editor-mode');

  await page.getByTestId('editor-button').click();
  await expect(page.locator('.cm-editor')).toBeVisible();

  // Apend text
  await page.locator('.cm-content').fill(string);
  await expect(page.getByTestId('page-editor-preview-body')).toContainText(string);

  // Update
  await page.getByTestId('save-page-btn').click();

  // Back to editor
  await page.getByTestId('editor-button').click();
  await expect(page.locator('.cm-editor')).toBeVisible();

  // Expect to be in Collaborative Editor mode
  await expect(page.getByTestId('editing-user-list')).toBeVisible();
  await expect(page.getByTestId('single-editor-badge')).not.toBeVisible();
});

test('Expect Single editor mode when opening pages with content length above YJS_MAX_BODY_LENGTH', async({ page }) => {
  await page.goto('Sandbox/single-editor-mode');

  await page.getByTestId('editor-button').click();
  await expect(page.locator('.cm-editor')).toBeVisible();

  // Apend long string
  await page.locator('.cm-content').fill(longString);
  await expect(page.getByTestId('page-editor-preview-body')).toContainText(longString);

  // Update
  await page.getByTestId('save-page-btn').click();

  // Back to editor
  await page.getByTestId('editor-button').click();
  await expect(page.locator('.cm-editor')).toBeVisible();

  // Expect to be in Single Editor mode
  await expect(page.getByTestId('editing-user-list')).not.toBeVisible();
  await expect(page.getByTestId('single-editor-badge')).toBeVisible();
});
