import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';
import useSWRMutation, { SWRMutationResponse } from 'swr/mutation';

import { IPageHasId } from '~/interfaces/page';

import { apiv3Get } from '../client/util/apiv3-client';
import { IBookmarkInfo } from '../interfaces/bookmark-info';

import { useCurrentUser } from './context';

export const useSWRxBookmarkInfo = (pageId: string | null): SWRResponse<IBookmarkInfo, Error> => {
  return useSWRImmutable(
    pageId != null ? `/bookmarks/info?pageId=${pageId}` : null,
    endpoint => apiv3Get(endpoint).then((response) => {
      return {
        sumOfBookmarks: response.data.sumOfBookmarks,
        isBookmarked: response.data.isBookmarked,
        bookmarkedUsers: response.data.bookmarkedUsers,
        pageId: response.data.pageId,
      };
    }),
    // supress unnecessary API requests when using for mutation purposes
    { revalidateOnMount: false },
  );
};

export const useSWRxUserBookmarks = (userId: string | null): SWRResponse<IPageHasId[], Error> => {
  return useSWRImmutable(
    userId != null ? `/bookmarks/${userId}` : null,
    endpoint => apiv3Get(endpoint).then((response) => {
      const { userRootBookmarks } = response.data;
      return userRootBookmarks.map((item) => {
        return {
          ...item.page,
        };
      });
    }),
  );
};

export const useSWRMUTxCurrentUserBookmarks = (): SWRMutationResponse<IPageHasId[], Error> => {
  const { data: currentUser } = useCurrentUser();

  return useSWRMutation(
    currentUser != null ? `/bookmarks/${currentUser?._id}` : null,
    endpoint => apiv3Get(endpoint).then((response) => {
      const { userRootBookmarks } = response.data;
      return userRootBookmarks.map((item) => {
        return {
          ...item.page,
        };
      });
    }),
  );
};
