import useSWR, { SWRResponse } from 'swr';

import { apiv3Get } from '~/client/util/apiv3-client';
import { HasObjectId } from '~/interfaces/has-object-id';

import { IPage } from '~/interfaces/page';
import { IPagingResult } from '~/interfaces/paging-result';

import { usePageId, useTemplateTagData, useShareLinkId } from '~/stores/context';
import { GetPageTagResponse } from '~/interfaces/tag';
import { apiGet } from '~/client/util/apiv1-client';


export const useSWRxPageByPath = (path: string, initialData?: IPage): SWRResponse<IPage & HasObjectId, Error> => {
  return useSWR(
    ['/page', path],
    (endpoint, path) => apiv3Get(endpoint, { path }).then(result => result.data.page),
    {
      fallbackData: initialData,
    },
  );
};


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxRecentlyUpdated = (): SWRResponse<(IPage & HasObjectId)[], Error> => {
  return useSWR(
    '/pages/recent',
    endpoint => apiv3Get<{ pages:(IPage & HasObjectId)[] }>(endpoint).then(response => response.data?.pages),
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSWRxPageList = (
    path: string,
    pageNumber?: number,
): SWRResponse<IPagingResult<IPage>, Error> => {
  const page = pageNumber || 1;
  return useSWR(
    `/pages/list?path=${path}&page=${page}`,
    endpoint => apiv3Get<{pages: IPage[], totalCount: number, limit: number}>(endpoint).then((response) => {
      return {
        items: response.data.pages,
        totalCount: response.data.totalCount,
        limit: response.data.limit,
      };
    }),
  );
};

export const useStaticPageTags = (): SWRResponse<string[] | undefined, Error> => {
  const { data: pageId } = usePageId();
  const { data: templateTagData } = useTemplateTagData();
  const { data: shareLinkId } = useShareLinkId();

  const fetcher = async(endpoint: string) => {
    if (shareLinkId != null) {
      return;
    }

    let tags: string[] = [];
    // when the page exists or is a shared page
    if (pageId != null && shareLinkId == null) {
      const res = await apiGet<GetPageTagResponse>(endpoint, { pageId });
      tags = res?.tags;
    }
    // when the page does not exist
    else if (templateTagData != null) {
      tags = templateTagData.split(',').filter((str: string) => {
        return str !== ''; // filter empty values
      });
    }

    return tags;
  };

  return useSWR('/pages.getPageTag', fetcher);
};
