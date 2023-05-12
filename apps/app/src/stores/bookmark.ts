import { IUserHasId } from '@growi/core';
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

export const useSWRxCurrentUserBookmarks = (): SWRResponse<IPageHasId[], Error> => {
  const { data: currentUser } = useCurrentUser();
  const user = currentUser as IUserHasId;
  return useSWRImmutable(
    currentUser != null ? `/bookmarks/${user._id}` : null,
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
