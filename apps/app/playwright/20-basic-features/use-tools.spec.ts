import { test, expect } from '@playwright/test';

test('Page Deletion and PutBack is executed successfully', async({ page }) => {
  await page.goto('/Sandbox/Bootstrap5');

  // Delete
  await expect(page.getByTestId('grw-contextual-sub-nav')).toBeVisible();
  await page.getByTestId('open-page-item-control-btn').click();
  await page.getByTestId('open-page-delete-modal-btn').click();
  await expect(page.getByTestId('page-delete-modal')).toBeVisible();
  await page.getByTestId('delete-page-button').click();

  // PutBack
  await expect(page.getByTestId('trash-page-alert')).toBeVisible();
  await page.getByTestId('put-back-button').click();
  await expect(page.getByTestId('put-back-page-modal')).toBeVisible();
  await page.getByTestId('put-back-execution-button').click();
  await expect(page.getByTestId('trash-page-alert')).not.toBeVisible();
});

test('PageDuplicateModal is shown successfully', async({ page }) => {
  await page.goto('/Sandbox');

  await expect(page.getByTestId('grw-contextual-sub-nav')).toBeVisible();
  await page.getByTestId('open-page-item-control-btn').click();
  await page.getByTestId('open-page-duplicate-modal-btn').click();

  await expect(page.getByTestId('page-duplicate-modal')).toBeVisible();
});

test('PageMoveRenameModal is shown successfully', async({ page }) => {
  await page.goto('/Sandbox');

  await expect(page.getByTestId('grw-contextual-sub-nav')).toBeVisible();
  await page.getByTestId('open-page-item-control-btn').click();
  await page.getByTestId('rename-page-btn').click();

  await expect(page.getByTestId('page-rename-modal')).toBeVisible();
});

test('PresentationModal for "/" is shown successfully', async({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('grw-contextual-sub-nav')).toBeVisible();
  await page.getByTestId('open-page-item-control-btn').click();
  await page.getByTestId('open-presentation-modal-btn').click();

  expect(page.getByTestId('page-presentation-modal')).toBeVisible();
});

test.describe('Page Accessories Modal', () => {
  test.beforeEach(async({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('grw-contextual-sub-nav')).toBeVisible();
    await page.getByTestId('open-page-item-control-btn').click();
    await expect(page.getByTestId('page-item-control-menu')).toBeVisible();
  });

  test('Page History is shown successfully', async({ page }) => {
    await page.getByTestId('open-page-accessories-modal-btn-with-history-tab').click();
    await expect(page.getByTestId(('page-history'))).toBeVisible();
  });

  test('Page Attachment Data is shown successfully', async({ page }) => {
    await page.getByTestId('open-page-accessories-modal-btn-with-attachment-data-tab').click();
    await expect(page.getByTestId('page-attachment')).toBeVisible();
  });

  test('Share Link Management is shown successfully', async({ page }) => {
    await page.getByTestId('open-page-accessories-modal-btn-with-share-link-management-data-tab').click();
    await expect(page.getByTestId('share-link-management')).toBeVisible();
  });
});

test('Successfully add new tag', async({ page }) => {
  const tag = 'we';
  await page.goto('/Sandbox/Bootstrap5');

  await page.locator('#edit-tags-btn-wrapper-for-tooltip').click();
  await expect(page.locator('#edit-tag-modal')).toBeVisible();
  await page.locator('.rbt-input-main').fill(tag);
  await expect(page.locator('#tag-typeahead-asynctypeahead-item-0')).toBeVisible();
  await page.locator('#tag-typeahead-asynctypeahead-item-0').click();
  await page.getByTestId('tag-edit-done-btn').click();
  await expect(page.getByTestId('grw-tag-labels')).toContainText(tag);
});
