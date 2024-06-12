import { test, expect } from '@playwright/test';


test('Visit User home', async({ page }) => {
  await page.goto('/');

  // Open PersonalDropdown
  await expect(page.getByTestId('personal-dropdown-button')).toBeVisible();
  await page.getByTestId('personal-dropdown-button').click();
  await expect(page.getByTestId('grw-personal-dropdown-menu-user-home')).toBeVisible();

  // Click UserHomeMenu
  await page.getByTestId('grw-personal-dropdown-menu-user-home').click();
  await expect(page.getByTestId('grw-users-info')).toBeVisible();
});

test('Vist User settings', async({ page }) => {
  await page.goto('/');

  // Open PersonalDropdown
  await expect(page.getByTestId('personal-dropdown-button')).toBeVisible();
  await page.getByTestId('personal-dropdown-button').click();
  await expect(page.getByTestId('grw-personal-dropdown-menu-user-home')).toBeVisible();

  // Click UserSettingsMenu
  await expect(page.getByTestId('grw-personal-dropdown-menu-user-settings')).toBeVisible();
  await expect(page.getByTestId('grw-user-settings')).toBeVisible();
});


// test('Access User information', async({ page }) => {
//   // User information
//   await page.waitForSelector('[data-testid="grw-user-settings"]', { visible: true });
//   await page.screenshot({ path: `${ssPrefix}-user-information-1.png` });
//   await page.click('[data-testid="grw-besic-info-settings-update-button"]');
//   await page.waitForSelector('.Toastify__toast', { visible: true });
//   await page.screenshot({ path: `${ssPrefix}-user-information-2.png` });

//   const toasts = await page.$$('.Toastify__toast');
//   for (const toast of toasts) {
//     await toast.click('.Toastify__close-button');
//     await toast.evaluate(t => t.querySelector('.Toastify__progress-bar').style.display = 'none');
//   }
// };

//   test('Access External account', async({ page }) => {
//     await page.click('[data-testid="grw-personal-settings"] .nav-title.nav li:nth-of-type(2) a');
//     await page.evaluate(() => window.scrollTo(0, 0));
//     await page.screenshot({ path: `${ssPrefix}-external-account-1.png` });
//     await page.click('[data-testid="grw-external-account-add-button"]');
//     await page.waitForSelector('[data-testid="grw-associate-modal"]', { visible: true });
//     await page.screenshot({ path: `${ssPrefix}-external-account-2.png` });
//     await page.click('[data-testid="grw-associate-modal"] .modal-footer button'); // click add button in modal form
//     await page.waitForSelector('.Toastify__toast', { visible: true });
//     await page.screenshot({ path: `${ssPrefix}-external-account-3.png` });

//     const toasts = await page.$$('.Toastify__toast');
//     for (const toast of toasts) {
//       await toast.click('.Toastify__close-button');
//       await toast.evaluate(t => t.querySelector('.Toastify__progress-bar').style.display = 'none');
//     }
//     await page.click('[data-testid="grw-associate-modal"] [aria-label="Close"]');
//     await page.screenshot({ path: `${ssPrefix}-external-account-4.png` });

//     await expect(page.locator('.Toastify__toast')).toHaveCount(0);
//   });

//   test('Access Password setting', async({ page }) => {
//     await page.click('[data-testid="grw-personal-settings"] .nav-title.nav li:nth-of-type(3) a');
//     await page.evaluate(() => window.scrollTo(0, 0));
//     await page.screenshot({ path: `${ssPrefix}-password-settings-1.png` });
//     await page.click('[data-testid="grw-password-settings-update-button"]');
//     await page.waitForSelector('.Toastify__toast', { visible: true });
//     await page.screenshot({ path: `${ssPrefix}-password-settings-2.png` });

//     const toasts = await page.$$('.Toastify__toast');
//     for (const toast of toasts) {
//       await toast.click('.Toastify__close-button');
//       await toast.evaluate(t => t.querySelector('.Toastify__progress-bar').style.display = 'none');
//     }
//   });

//   test('Access API setting', async({ page }) => {
//     await page.click('[data-testid="grw-personal-settings"] .nav-title.nav li:nth-of-type(4) a');
//     await page.evaluate(() => window.scrollTo(0, 0));
//     await page.screenshot({ path: `${ssPrefix}-api-setting-1.png` });
//     await page.click('[data-testid="grw-api-settings-update-button"]');
//     await page.waitForSelector('[data-testid="grw-api-settings-input"]', { visible: true });
//     await page.waitForSelector('.Toastify__toast', { visible: true });
//     await page.screenshot({ path: `${ssPrefix}-api-setting-2.png` });

//     const toasts = await page.$$('.Toastify__toast');
//     for (const toast of toasts) {
//       await toast.click('.Toastify__close-button');
//       await toast.evaluate(t => t.querySelector('.Toastify__progress-bar').style.display = 'none');
//     }
//   });

//   test('Access In-app notification setting', async({ page }) => {
//     await page.click('[data-testid="grw-personal-settings"] .nav-title.nav li:nth-of-type(5) a');
//     await page.evaluate(() => window.scrollTo(0, 0));
//     await page.screenshot({ path: `${ssPrefix}-in-app-notification-setting-1.png` });
//     await page.click('[data-testid="grw-in-app-notification-settings-update-button"]');
//     await page.waitForSelector('.Toastify__toast', { visible: true });
//     await page.screenshot({ path: `${ssPrefix}-in-app-notification-setting-2.png` });
//   });

//   test('Access Other setting', async({ page }) => {
//     await page.click('[data-testid="grw-personal-settings"] .nav-title.nav li:nth-of-type(6) a');
//     await page.evaluate(() => window.scrollTo(0, 0));
//     await page.screenshot({ path: `${ssPrefix}-other-setting-1.png` });
//     await page.click('[data-testid="grw-questionnaire-settings-update-btn"]');
//     await page.waitForSelector('.Toastify__toast', { visible: true });
//     await page.screenshot({ path: `${ssPrefix}-other-setting-2.png` });
//   });
// });

// test.describe('Access proactive questionnaire modal', () => {
//   test('Opens questionnaire modal', async({ page }) => {
//     await page.goto('/dummy');

//     // open PersonalDropdown
//     await page.waitForSelector('[data-testid="personal-dropdown-button"]', { visible: true });
//     await page.click('[data-testid="personal-dropdown-button"]');
//     await page.waitForSelector('[data-testid="grw-personal-dropdown-menu-user-home"]', { visible: true });

//     await page.click('[data-testid="grw-proactive-questionnaire-modal-toggle-btn"]');
//     await page.waitForSelector('[data-testid="grw-proactive-questionnaire-modal"]', { visible: true });

//     await page.screenshot({ path: `${ssPrefix}-opened.png` });
//   });
// });
