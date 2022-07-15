import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite, { SWRInfiniteResponse } from 'swr/infinite';

import { apiv3Get } from '../client/util/apiv3-client';
import { IBookmarkInfo } from '../interfaces/bookmark-info';


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

export const useSWRInifiniteBookmarkedPage = (userId: string | null | undefined) : SWRInfiniteResponse => {
  const getKey = (page: number) => {
    return userId != null ? `/bookmarks/${userId}/?page=${page + 1}` : null;
  };
  return useSWRInfinite(
    getKey,
    (endpoint: string) => apiv3Get<{ paginationResult }>(endpoint).then(response => response.data?.paginationResult),
    {
      revalidateFirstPage: false,
      revalidateAll: false,
    },
  );
};
