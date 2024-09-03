import { test, expect } from '@playwright/test';

import { openEditor, appendTextToEditor } from '../utils';

test.describe.serial('Collaborative editor mode', () => {
  const text = 'hello';
  const path = '/Sandbox/collaborative-editor-mode';

  test.beforeEach(async({ page }) => {
    await page.goto(path);
  });

  test('Expect the previous input content to be reflected even after reloading', async({ page }) => {
    await openEditor(page);

    await appendTextToEditor(page, text);

    // Return to view
    await page.getByTestId('view-button').click();
    await expect(page.getByTestId('page-view-layout')).toBeVisible();

    // Reload
    await page.reload();
    await openEditor(page);
    await expect(page.getByTestId('page-editor-preview-body')).toHaveText(text);
  });

  test('Expect Collaborative editor mode when opening pages with content length below YJS_MAX_BODY_LENGTH', async({ page }) => {
    await openEditor(page);

    // Update
    await page.getByTestId('save-page-btn').click();

    // Back to editor
    await openEditor(page);

    // Expect to be in Collaborative Editor mode
    await expect(page.getByTestId('editing-user-list')).toBeVisible();
    await expect(page.getByTestId('single-editor-badge')).not.toBeVisible();
  });
});

test.describe('Single editor mode', () => {
  const text = 'a'.repeat(10001); // YJS_MAX_BODY_LENGTH + 1
  const path = '/Sandbox/single-editor-mode';

  test.beforeEach(async({ page }) => {
    await page.goto(path);
  });

  test('Expect Single editor mode when opening pages with content length above YJS_MAX_BODY_LENGTH', async({ page }) => {
    await openEditor(page);

    await appendTextToEditor(page, text);

    // Expect to be in Collaborative Editor mode
    await expect(page.getByTestId('editing-user-list')).toBeVisible();
    await expect(page.getByTestId('single-editor-badge')).not.toBeVisible();

    // Update
    await page.getByTestId('save-page-btn').click();

    // Back to editor
    await openEditor(page);

    // Expect to be in Single Editor mode
    await expect(page.getByTestId('editing-user-list')).not.toBeVisible();
    await expect(page.getByTestId('single-editor-badge')).toBeVisible();
  });
});
