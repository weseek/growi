import { expect, type Page } from '@playwright/test';

export const collapseSidebar = async(page: Page, isCollapsed: boolean): Promise<void> => {
  const isSidebarContentsHidden = !(await page.getByTestId('grw-sidebar-contents').isVisible());
  if (isSidebarContentsHidden === isCollapsed) {
    return;
  }

  const collapseSidebarToggle = page.getByTestId('btn-toggle-collapse');
  await expect(collapseSidebarToggle).toBeVisible();

  await collapseSidebarToggle.click();

  const grwSidebarDoc = page.getByTestId('grw-sidebar-doc');

  if (isCollapsed) {
    await expect(grwSidebarDoc).not.toBeVisible();
  }
  else {
    await expect(grwSidebarDoc).toBeVisible();
  }
};
