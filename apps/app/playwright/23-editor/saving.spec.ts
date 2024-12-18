import path from 'path';

import { test, expect } from '@playwright/test';

import { openEditor, appendTextToEditor } from '../utils';


test('Successfully create page under specific path', async({ page }) => {
  const newPagePath = '/child';
  const openPageCreateModalShortcutKey = 'c';

  await page.goto('/Sandbox');

  await page.keyboard.press(openPageCreateModalShortcutKey);
  await expect(page.getByTestId('page-create-modal')).toBeVisible();
  page.getByTestId('page-create-modal').locator('.rbt-input-main').fill(newPagePath);
  page.getByTestId('btn-create-page-under-below').click();
  await page.getByTestId('view-button').click();

  const createdPageId = path.basename(page.url());
  expect(createdPageId.length).toBe(24);
});


test('Successfully updating a page using a shortcut on a previously created page', async({ page }) => {
  const body1 = 'hello';
  const body2 = ' world!';
  const savePageShortcutKey = 'Control+s';

  await page.goto('/Sandbox/child');

  // 1st
  await openEditor(page);
  await appendTextToEditor(page, body1);
  await page.keyboard.press(savePageShortcutKey);
  await page.getByTestId('view-button').click();
  await expect(page.locator('.main')).toContainText(body1);

  // 2nd
  await openEditor(page);
  await appendTextToEditor(page, body1 + body2);
  await page.keyboard.press(savePageShortcutKey);
  await page.getByTestId('view-button').click();
  await expect(page.locator('.main')).toContainText(body1 + body2);
});
