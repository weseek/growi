import type { IPageHasId } from '@growi/core';

import type { IPageForItem } from '~/interfaces/page';

export type SelectedPage = Partial<IPageHasId> & { path: string }

export const isSelectedPage = (page: IPageForItem): page is SelectedPage => {
  return page.path != null;
};
