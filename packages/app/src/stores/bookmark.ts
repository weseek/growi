import { IUserHasId, Nullable } from '@growi/core';
import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { IPageHasId } from '~/interfaces/page';
import { BookmarkFolderItems } from '~/server/models/bookmark-folder';

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
  const user = currentUser as IUserHasId;
  return useSWRImmutable(
    currentUser != null ? `/bookmarks/${user._id}` : null,
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

export const useSWRxCurrentUserBookmarkFolders = () : SWRResponse<BookmarkFolderItems[], Error> => {
  return useSWRImmutable(
    '/bookmark-folder/list',
    endpoint => apiv3Get(endpoint).then((response) => {
      return response.data.bookmarkFolderItems;
    }),
  );
};

export const useSWRxChildBookmarkFolders = (isOpen: boolean, parentId: Nullable<string>): SWRResponse<BookmarkFolderItems[], Error> => {
  return useSWRImmutable(
    isOpen && parentId != null ? `/bookmark-folder/list-child/${parentId}` : null,
    endpoint => apiv3Get(endpoint).then((response) => {
      return response.data.bookmarkFolderItems;
    }),
  );
};
