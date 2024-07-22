import path from 'path';
import { readFileSync } from "fs";

import { test, expect, type Page } from '@playwright/test';

test('should not be cleared and should prevent GrantSelector from modified', async({ page }) => {
    await page.goto('/Sandbox/for-122040');

    // Open Editor
    await page.getByTestId('editor-button').click();
    await expect(page.getByTestId('grw-editor-navbar-bottom')).toBeVisible();

    // Open GrantSelector and select "only me"
    await page.getByTestId('grw-grant-selector').click();
    const dropdownMenu = page.getByTestId('grw-grant-selector-dropdown-menu')
    await expect(dropdownMenu).toBeVisible();
    await dropdownMenu.locator('.dropdown-item').nth(2).click();
    await expect(page.getByTestId('grw-grant-selector')).toContainText('Only me');

    // Upload attachment
    const filePath = path.resolve(__dirname, '../23-editor/assets/example.txt');
    const buffer = readFileSync(filePath).toString("base64");
    const dataTransfer = await page.evaluateHandle(
    async ({ bufferData, localFileName, localFileType }) => {
        const dt = new DataTransfer();

        const blobData = await fetch(bufferData).then((res) => res.blob());

        const file = new File([blobData], localFileName, {
        type: localFileType,
        });
        dt.items.add(file);
        return dt;
    },
    {
        bufferData: `data:application/octet-stream;base64,${buffer}`,
        localFileName: 'sample.tst',
        localFileType: 'application/octet-stream',
    }
    );
    await page.locator('.dropzone').first().dispatchEvent("drop", { dataTransfer });
    await expect(page.getByTestId('page-editor-preview-body').getByTestId('rich-attachment')).toBeVisible();

    // Save page
    await page.getByTestId('save-page-btn').click();

    // Expect grant not to be reset after uploading an attachment
    await expect(page.getByTestId('page-grant-alert')).toContainText('Browsing of this page is restricted');
})