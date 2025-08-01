import type { IPageHasId } from '@growi/core';

import type { IPageForItem } from '~/interfaces/page';

export type SelectedPage = {
  page: IPageForItem | IPageHasId,
  isIncludeSubPage: boolean,
}
