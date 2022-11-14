import type {
  IPageInfoForEntity, IPagePopulatedToShowRevision, Nullable,
} from '@growi/core';
import { pagePathUtils } from '@growi/core';
import useSWR, { Key, SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiGet } from '~/client/util/apiv1-client';
import { apiv3Get } from '~/client/util/apiv3-client';
import {
  IPageInfo, IPageInfoForOperation,
} from '~/interfaces/page';
import { IRecordApplicableGrant, IResIsGrantNormalized } from '~/interfaces/page-grant';
import { IRevisionsForPagination } from '~/interfaces/revision';

import { IPageTagsInfo } from '../interfaces/tag';

import { useCurrentPageId, useCurrentPathname } from './context';
import { useStaticSWR } from './use-static-swr';

const { isPermalink: _isPermalink } = pagePathUtils;


export const useSWRxPage = (
    pageId?: string|null,
    shareLinkId?: string,
    initialData?: IPagePopulatedToShowRevision|null,
): SWRResponse<IPagePopulatedToShowRevision|null, Error> => {
  return useSWR<IPagePopulatedToShowRevision|null, Error>(
    pageId != null ? ['/page', pageId, shareLinkId] : null,
    (endpoint, pageId, shareLinkId) => apiv3Get<{ page: IPagePopulatedToShowRevision }>(endpoint, { pageId, shareLinkId })
      .then(result => result.data.page)
      .catch((errs) => {
        if (!Array.isArray(errs)) { throw Error('error is not array') }
        const statusCode = errs[0].status;
        if (statusCode === 403 || statusCode === 404) {
          // for NotFoundPage
          return null;
        }
        throw Error('failed to get page');
      }),
    { fallbackData: initialData },
  );
};

export const useSWRxPageByPath = (path?: string): SWRResponse<IPagePopulatedToShowRevision, Error> => {
  return useSWR<IPagePopulatedToShowRevision, Error>(
    path != null ? ['/page', path] : null,
    (endpoint, path) => apiv3Get<{ page: IPagePopulatedToShowRevision }>(endpoint, { path }).then(result => result.data.page),
  );
};

export const useSWRxCurrentPage = (
    shareLinkId?: string, initialData?: IPagePopulatedToShowRevision|null,
): SWRResponse<IPagePopulatedToShowRevision|null, Error> => {
  const { data: currentPageId } = useCurrentPageId();

  const swrResult = useSWRxPage(currentPageId, shareLinkId, initialData);

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

  const swrResult = useSWRImmutable<IPageInfo | IPageInfoForOperation, Error>(
    pageId != null ? ['/page/info', pageId, fixedShareLinkId] : null,
    (endpoint, pageId, shareLinkId) => apiv3Get(endpoint, { pageId, shareLinkId }).then(response => response.data),
    { fallbackData: initialData },
  );

  return swrResult;
};

export const useSWRxPageRevisions = (
    page: number, // page number of pagination
    limit: number, // max number of pages in one paginate
    pageId: string | null | undefined,
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

export const useRequestRevisionPage = (initialData?: IPagePopulatedToShowRevision): SWRResponse<IPagePopulatedToShowRevision, Error> => {
  return useStaticSWR('requestRevisionPage', initialData);
};


/** **********************************************************
 *                     Computed states
 *********************************************************** */

export const useCurrentPagePath = (): SWRResponse<string | undefined, Error> => {
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: currentPathname } = useCurrentPathname();

  return useSWRImmutable(
    ['currentPagePath', currentPage?.path, currentPathname],
    (key: Key, pagePath: string|undefined, pathname: string|undefined) => {
      if (currentPage?.path != null) {
        return currentPage.path;
      }
      if (pathname != null && !_isPermalink(pathname)) {
        return pathname;
      }
      return undefined;
    },
    // TODO: set fallbackData
    // { fallbackData:  }
  );
};

export const useIsTrashPage = (): SWRResponse<boolean, Error> => {
  const { data: pagePath } = useCurrentPagePath();

  return useSWRImmutable(
    pagePath == null ? null : ['isTrashPage', pagePath],
    (key: Key, pagePath: string) => pagePathUtils.isTrashPage(pagePath),
    // TODO: set fallbackData
    // { fallbackData:  }
  );
};
