import useSWR, { SWRResponse } from 'swr';
import { apiv3Get } from '../client/util/apiv3-client';
import { IBookmarkInfo } from '../interfaces/bookmark-info';


export const useSWRBookmarkInfo = (pageId: string | null | undefined, isOpen = true): SWRResponse<IBookmarkInfo, Error> => {
  return useSWR(
    pageId != null && isOpen
      ? `/bookmarks/info?pageId=${pageId}` : null,
    endpoint => apiv3Get(endpoint).then((response) => {
      console.log('isOpen_swr', isOpen);
      return {
        sumOfBookmarks: response.data.sumOfBookmarks,
        isBookmarked: response.data.isBookmarked,
      };
    }),
  );
};
