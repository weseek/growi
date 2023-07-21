import type { IUser, IPageHasId } from '@growi/core/dist/interfaces';
import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';


import { apiv3Get } from '../client/util/apiv3-client';
import { IBookmarkInfo } from '../interfaces/bookmark-info';

import { useCurrentUser } from './context';

export const useSWRxBookmarkedUsers = (pageId: string | null): SWRResponse<IUser[], Error> => {
  return useSWR(
    pageId != null ? `/bookmarks/info?pageId=${pageId}` : null,
    endpoint => apiv3Get<IBookmarkInfo>(endpoint).then(response => response.data.bookmarkedUsers),
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
