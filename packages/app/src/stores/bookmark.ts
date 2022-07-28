import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { IPageHasId } from '~/interfaces/page';

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

export const useSWRCurrentUserBookmarks = (page?: number| null| undefined): SWRResponse<IPageHasId[], Error> => {
  const { data: currentUser } = useCurrentUser();
  const currentPage = page ?? 1;
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
