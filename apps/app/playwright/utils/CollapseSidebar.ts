import { expect, type Page } from '@playwright/test';

export const collapseSidebar = async(page: Page, isCollapsed: boolean): Promise<void> => {
  const isSidebarContentsHidden = !(await page.getByTestId('grw-sidebar-contents').isVisible());
  if (isSidebarContentsHidden === isCollapsed) {
    return;
  }

  await page.getByTestId('btn-toggle-collapse').click();

  if (isCollapsed) {
    await expect(page.getByTestId('grw-sidebar-doc')).not.toBeVisible();
  }
  else {
    await expect(page.getByTestId('grw-sidebar-doc')).toBeVisible();
  }
};
