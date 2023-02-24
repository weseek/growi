import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';
import { BookmarkFolderItems } from '~/interfaces/bookmark-info';

export const useSWRxBookamrkFolderAndChild = (): SWRResponse<BookmarkFolderItems[], Error> => {

  return useSWRImmutable(
    '/bookmark-folder/list',
    endpoint => apiv3Get(endpoint).then((response) => {
      return response.data.bookmarkFolderItems;
    }),
  );
};
