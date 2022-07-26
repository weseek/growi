import { IPageInfoForEntity, IPagePopulatedToShowRevision, Nullable } from '@growi/core';
import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';
import {
  IPageInfo, IPageInfoForOperation, IPageInfoAll,
} from '~/interfaces/page';
import { IRecordApplicableGrant, IResIsGrantNormalized } from '~/interfaces/page-grant';
import { IRevisionsForPagination } from '~/interfaces/revision';

import { apiGet } from '../client/util/apiv1-client';
import { IPageTagsInfo } from '../interfaces/tag';

import { useCurrentPageId } from './context';

export const useSWRxPage = (pageId?: string|null, shareLinkId?: string): SWRResponse<IPagePopulatedToShowRevision, Error> => {
  return useSWR<IPagePopulatedToShowRevision, Error>(
    pageId != null ? ['/page', pageId, shareLinkId] : null,
    (endpoint, pageId, shareLinkId) => apiv3Get<{ page: IPagePopulatedToShowRevision }>(endpoint, { pageId, shareLinkId }).then(result => result.data.page),
  );
};

export const useSWRxPageByPath = (path?: string): SWRResponse<IPagePopulatedToShowRevision, Error> => {
  return useSWR<IPagePopulatedToShowRevision, Error>(
    path != null ? ['/page', path] : null,
    (endpoint, path) => apiv3Get<{ page: IPagePopulatedToShowRevision }>(endpoint, { path }).then(result => result.data.page),
  );
};

export const useSWRxCurrentPage = (shareLinkId?: string, initialData?: IPagePopulatedToShowRevision): SWRResponse<IPagePopulatedToShowRevision, Error> => {
  const { data: currentPageId } = useCurrentPageId();

  const swrResult = useSWRxPage(currentPageId, shareLinkId);

  // use mutate because fallbackData does not work
  // see: https://github.com/weseek/growi/commit/5038473e8d6028c9c91310e374a7b5f48b921a15
  if (initialData != null) {
    swrResult.mutate(initialData);
  }

  return swrResult;
};


export const useSWRxTagsInfo = (pageId: Nullable<string>): SWRResponse<IPageTagsInfo | undefined, Error> => {

  const endpoint = `/pages.getPageTag?pageId=${pageId}`;
  const key = [endpoint, pageId];

  const fetcher = async(endpoint: string, pageId: Nullable<string>) => {
    let tags: string[] = [];
    // when the page exists
    if (pageId != null) {
      const res = await apiGet<IPageTagsInfo>(endpoint, { pageId });
      tags = res?.tags;
    }

    return { tags };
  };

  return useSWRImmutable(key, fetcher);
};

export const useSWRxPageInfo = (
    pageId: string | null | undefined,
    shareLinkId?: string | null,
    initialData?: IPageInfoForEntity,
): SWRResponse<IPageInfo | IPageInfoForOperation, Error> => {

  // assign null if shareLinkId is undefined in order to identify SWR key only by pageId
  const fixedShareLinkId = shareLinkId ?? null;

  return useSWRImmutable<IPageInfo | IPageInfoForOperation, Error>(
    pageId != null ? ['/page/info', pageId, fixedShareLinkId] : null,
    (endpoint, pageId, shareLinkId) => apiv3Get(endpoint, { pageId, shareLinkId }).then(response => response.data),
    { fallbackData: initialData },
  );
};

export const useSWRxPageRevisions = (
    pageId: string,
    page: number, // page number of pagination
    limit: number, // max number of pages in one paginate
): SWRResponse<IRevisionsForPagination, Error> => {

  return useSWRImmutable<IRevisionsForPagination, Error>(
    ['/revisions/list', pageId, page, limit],
    (endpoint, pageId, page, limit) => {
      return apiv3Get(endpoint, { pageId, page, limit }).then((response) => {
        const revisions = {
          revisions: response.data.docs,
          totalCounts: response.data.totalDocs,
        };
        return revisions;
      });
    },
  );
};

/*
 * Grant normalization fetching hooks
 */
export const useSWRxIsGrantNormalized = (
    pageId: string | null | undefined,
): SWRResponse<IResIsGrantNormalized, Error> => {

  return useSWRImmutable(
    pageId != null ? ['/page/is-grant-normalized', pageId] : null,
    (endpoint, pageId) => apiv3Get(endpoint, { pageId }).then(response => response.data),
  );
};

export const useSWRxApplicableGrant = (
    pageId: string | null | undefined,
): SWRResponse<IRecordApplicableGrant, Error> => {

  return useSWRImmutable(
    pageId != null ? ['/page/applicable-grant', pageId] : null,
    (endpoint, pageId) => apiv3Get(endpoint, { pageId }).then(response => response.data),
  );
};
