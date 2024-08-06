import { test, expect } from '@playwright/test';

test('Search page with "q" param is successfully loaded', async({ page }) => {
  // Navigate to the search page with query parameters
  await page.goto('/_search?q=labels alerts cards blocks');

  // Confirm search result elements are visible
  await expect(page.getByTestId('search-result-base')).toBeVisible();
  await expect(page.getByTestId('search-result-list')).toBeVisible();
  await expect(page.getByTestId('search-result-content')).toBeVisible();
  await expect(page.locator('.wiki')).toBeVisible();
});


test('checkboxes behaviors', async({ page }) => {
  // Navigate to the search page with query parameters
  await page.goto('/_search?q=labels alerts cards blocks');

  // Confirm search result elements are visible
  await expect(page.getByTestId('search-result-base')).toBeVisible();
  await expect(page.getByTestId('search-result-list')).toBeVisible();
  await expect(page.getByTestId('search-result-content')).toBeVisible();
  await expect(page.locator('.wiki')).toBeVisible();

  // Click the first checkbox
  await page.getByTestId('cb-select').first().click({ force: true });

  // Unclick the first checkbox
  await page.getByTestId('cb-select').first().click({ force: true });

  // Click the select all checkbox
  await page.getByTestId('delete-control-button').first().click({ force: true });
  await page.getByTestId('cb-select-all').click({ force: true });

  // Unclick the first checkbox after selecting all
  await page.getByTestId('cb-select').first().click({ force: true });

  // Click the first checkbox again
  await page.getByTestId('cb-select').first().click({ force: true });

  // Unclick the select all checkbox
  await page.getByTestId('cb-select').first().click({ force: true });
});
