import { test, expect } from '@playwright/test';

test('Presentation', async({ page }) => {
  await page.goto('/');

  // show presentation modal
  await page.getByTestId('grw-contextual-sub-nav').getByTestId('open-page-item-control-btn').click();
  await page.getByTestId('open-presentation-modal-btn').click();

  // check the content of the h1
  await expect(page.getByRole('application').getByRole('heading', { level: 1 }))
    .toHaveText(/Welcome to GROWI/);

  // forward the slide with keyboard
  await page.keyboard.press('ArrowRight');

  // check the content of the h1
  await expect(page.getByRole('application').getByRole('heading', { level: 1 }))
    .toHaveText(/What can you do with GROWI?/);
});
