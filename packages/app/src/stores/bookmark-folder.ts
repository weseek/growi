import { Nullable } from '@growi/core';
import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';
import { BookmarkFolderItems } from '~/server/models/bookmark-folder';

export const useSWRxBookamrkFolderAndChild = (isOpen: boolean, parentId?: Nullable<string>): SWRResponse<BookmarkFolderItems[], Error> => {
  const _parentId = parentId == null ? '' : parentId;
  return useSWRImmutable(
    isOpen ? `/bookmark-folder/list/${_parentId}` : null,
    endpoint => apiv3Get(endpoint).then((response) => {
      return response.data.bookmarkFolderItems;
    }),
  );
};
