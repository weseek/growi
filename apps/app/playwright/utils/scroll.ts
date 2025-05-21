import type { Page } from '@playwright/test';

/**
 * Scrolls the page to the top and waits for the scroll animation to complete
 * @param page Playwright page object
 */
export const scrollToTop = async(page: Page): Promise<void> => {
  await page.evaluate(async() => {
    const waitForScrollComplete = async(): Promise<void> => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0; // For Safari and older browsers

      // Promise that resolves when scroll animation is complete
      return new Promise<void>((resolve) => {
        if (document.documentElement.scrollTop === 0) {
          resolve();
          return;
        }

        const checkScroll = () => {
          if (document.documentElement.scrollTop === 0) {
            resolve();
          }
          else {
            requestAnimationFrame(checkScroll);
          }
        };
        requestAnimationFrame(checkScroll);
      });
    };

    await waitForScrollComplete();
  });
};
