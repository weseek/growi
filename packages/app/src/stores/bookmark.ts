import useSWR, { SWRResponse } from 'swr';
import { apiv3Get } from '../client/util/apiv3-client';
import { IBookmarkInfo } from '../interfaces/bookmark-info';


export const useSWRBookmarkInfo = (pageId: string | null): SWRResponse<IBookmarkInfo, Error> => {
  return useSWR(pageId != null
    ? `/bookmarks/info?pageId=${pageId}` : null,
  endpoint => apiv3Get(endpoint).then((response) => {
    return {
      sumOfBookmarks: response.data.sumOfBookmarks,
      isBookmarked: response.data.isBookmarked,
    };
  }));
};
