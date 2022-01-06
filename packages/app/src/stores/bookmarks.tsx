import useSWR, { SWRResponse } from 'swr';

import { Types } from 'mongoose';
import { apiv3Get } from '~/client/util/apiv3-client';

import { IBookmarksInfo } from '~/interfaces/bookmarks';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxBookmarksInfo = <Data, Error>(pageId: Types.ObjectId):SWRResponse<IBookmarksInfo, Error> => {
  return useSWR(
    ['/bookmarks/info', pageId],
    (endpoint, pageId) => apiv3Get(endpoint, { pageId }).then((response) => {
      return {
        isBookmarked: response.data.isBookmarked,
        sumOfBookmarks: response.data.sumOfBookmarks,
      };
    }),
  );
};
