import useSWR, { SWRResponse } from 'swr';

import { Types } from 'mongoose';
import { apiv3Get } from '~/client/util/apiv3-client';

import { useIsGuestUser } from './context';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxBookmarksInfo = <Data, Error>(
  pageId: Types.ObjectId,
):SWRResponse<{isBookmarked: boolean | null, sumOfBookmarks: number | null, bookmarkedUserIds: Types.ObjectId[] | null }, Error> => {
  const { data: isGuestUser } = useIsGuestUser();

  const key = isGuestUser === false ? ['/bookmarks/info', pageId] : null;
  return useSWR(
    key,
    (endpoint, pageId) => apiv3Get(endpoint, { pageId }).then((response) => {
      return {
        isBookmarked: response.data.isBookmarked,
        sumOfBookmarks: response.data.sumOfBookmarks,
        bookmarkedUserIds: response.data.bookmarkedUserIds,
      };
    }),
  );
};
