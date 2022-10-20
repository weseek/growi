import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { Nullable } from '~/interfaces/common';
import { IPageHasId } from '~/interfaces/page';
import { IBookmarkFolderDocument } from '~/server/models/bookmark-folder';

import { apiv3Get } from '../client/util/apiv3-client';
import { IBookmarkInfo } from '../interfaces/bookmark-info';

import { useCurrentUser } from './context';

export const useSWRBookmarkInfo = (pageId: string | null | undefined): SWRResponse<IBookmarkInfo, Error> => {
  return useSWRImmutable(
    pageId != null ? `/bookmarks/info?pageId=${pageId}` : null,
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        sumOfBookmarks: response.data.sumOfBookmarks,
        isBookmarked: response.data.isBookmarked,
        bookmarkedUsers: response.data.bookmarkedUsers,
      };
    }),
  );
};

export const useSWRxCurrentUserBookmarks = (pageNum?: Nullable<number>): SWRResponse<IPageHasId[], Error> => {
  const { data: currentUser } = useCurrentUser();
  const currentPage = pageNum ?? 1;
  return useSWRImmutable(
    currentUser != null ? `/bookmarks/${currentUser._id}` : null,
    endpoint => apiv3Get(endpoint, { page: currentPage }).then((response) => {
      const { paginationResult } = response.data;
      return paginationResult.docs.map((item) => {
        return {
          ...item.page,
        };
      });
    }),
  );
};

export const useSWRxCurrentUserBookmarkFolders = () : SWRResponse<IBookmarkFolderDocument[], Error> => {
  return useSWRImmutable(
    '/bookmark-folder/list',
    endpoint => apiv3Get(endpoint).then((response) => {
      return response.data.bookmarkFolders;
    }),
  );
};
