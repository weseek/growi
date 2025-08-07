import type { IPageHasId } from '@growi/core';

import type { IPageForItem } from '~/interfaces/page';

export type SelectablePage = Partial<IPageHasId> & { path: string }

export const isSelectablePage = (page: IPageForItem): page is SelectablePage => {
  return page.path != null;
};
