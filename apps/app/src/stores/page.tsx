import { useEffect, useMemo } from 'react';

import type {
  Ref, Nullable,
  IPageInfoForEntity, IPagePopulatedToShowRevision,
  SWRInfinitePageRevisionsResponse,
} from '@growi/core';
import { isClient, pagePathUtils } from '@growi/core/dist/utils';
import useSWR, { mutate, useSWRConfig, type SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';
import useSWRInfinite, { type SWRInfiniteResponse } from 'swr/infinite';
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation';

import { apiGet } from '~/client/util/apiv1-client';
import { apiv3Get } from '~/client/util/apiv3-client';
import type {
  IPageInfo, IPageInfoForOperation,
} from '~/interfaces/page';
import type { IRecordApplicableGrant, IResIsGrantNormalized } from '~/interfaces/page-grant';
import type { IRevision, IRevisionHasId } from '~/interfaces/revision';

import type { IPageTagsInfo } from '../interfaces/tag';

import {
  useCurrentPathname, useShareLinkId, useIsGuestUser, useIsReadOnlyUser,
} from './context';
import { useStaticSWR } from './use-static-swr';

const { isPermalink: _isPermalink } = pagePathUtils;


export const useCurrentPageId = (initialData?: Nullable<string>): SWRResponse<Nullable<string>, Error> => {
  return useStaticSWR<Nullable<string>, Error>('currentPageId', initialData);
};

export const useIsLatestRevision = (initialData?: boolean): SWRResponse<boolean, any> => {
  return useStaticSWR('isLatestRevision', initialData);
};

export const useIsNotFound = (initialData?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR<boolean, Error>('isNotFound', initialData, { fallbackData: false });
};

export const useTemplateTagData = (initialData?: string[]): SWRResponse<string[], Error> => {
  return useStaticSWR<string[], Error>('templateTagData', initialData);
};

export const useTemplateBodyData = (initialData?: string): SWRResponse<string, Error> => {
  return useStaticSWR<string, Error>('templateBodyData', initialData);
};

/** "useSWRxCurrentPage" is intended for initial data retrieval only. Use "useSWRMUTxCurrentPage" for revalidation */
export const useSWRxCurrentPage = (initialData?: IPagePopulatedToShowRevision|null): SWRResponse<IPagePopulatedToShowRevision|null> => {
  const key = 'currentPage';

  const { cache } = useSWRConfig();
  const shouldMutate = initialData?._id !== cache.get(key)?.data?._id && initialData !== undefined;

  useEffect(() => {
    if (shouldMutate) {
      mutate(key, initialData, {
        optimisticData: initialData,
        populateCache: true,
        revalidate: false,
      });
    }
  }, [initialData, key, shouldMutate]);

  return useSWR(key, null, {
    keepPreviousData: true,
  });
};

export const useSWRMUTxCurrentPage = (): SWRMutationResponse<IPagePopulatedToShowRevision|null> => {
  const key = 'currentPage';

  const { data: currentPageId } = useCurrentPageId();
  const { data: shareLinkId } = useShareLinkId();

  // Get URL parameter for specific revisionId
  let revisionId: string|undefined;
  if (isClient()) {
    const urlParams = new URLSearchParams(window.location.search);
    const requestRevisionId = urlParams.get('revisionId');
    revisionId = requestRevisionId != null ? requestRevisionId : undefined;
  }

  return useSWRMutation(
    key,
    async() => {
      return apiv3Get<{ page: IPagePopulatedToShowRevision }>('/page', { pageId: currentPageId, shareLinkId, revisionId })
        .then(result => result.data.page)
        .catch((errs) => {
          if (!Array.isArray(errs)) { throw Error('error is not array') }
          const statusCode = errs[0].status;
          if (statusCode === 403 || statusCode === 404) {
            // for NotFoundPage
            return null;
          }
          throw Error('failed to get page');
        });
    },
    {
      populateCache: true,
      revalidate: false,
    },
  );
};

export const useSWRxPageByPath = (path?: string): SWRResponse<IPagePopulatedToShowRevision, Error> => {
  return useSWR(
    path != null ? ['/page', path] : null,
    ([endpoint, path]) => apiv3Get<{ page: IPagePopulatedToShowRevision }>(endpoint, { path }).then(result => result.data.page),
  );
};

export const useSWRxTagsInfo = (pageId: Nullable<string>): SWRResponse<IPageTagsInfo | undefined, Error> => {
  const { data: shareLinkId } = useShareLinkId();

  const endpoint = `/pages.getPageTag?pageId=${pageId}`;

  return useSWRImmutable(
    shareLinkId == null && pageId != null ? [endpoint, pageId] : null,
    ([endpoint, pageId]) => apiGet<IPageTagsInfo>(endpoint, { pageId }).then(result => result),
  );
};

export const mutateAllPageInfo = (): Promise<void[]> => {
  return mutate(
    key => Array.isArray(key) && key[0] === '/page/info',
  );
};

export const useSWRxPageInfo = (
    pageId: string | null | undefined,
    shareLinkId?: string | null,
    initialData?: IPageInfoForEntity,
): SWRResponse<IPageInfo | IPageInfoForOperation> => {

  // assign null if shareLinkId is undefined in order to identify SWR key only by pageId
  const fixedShareLinkId = shareLinkId ?? null;

  const key = useMemo(() => {
    return pageId != null ? ['/page/info', pageId, fixedShareLinkId] : null;
  }, [fixedShareLinkId, pageId]);

  const swrResult = useSWRImmutable(
    key,
    ([endpoint, pageId, shareLinkId]: [string, string, string|null]) => apiv3Get(endpoint, { pageId, shareLinkId }).then(response => response.data),
    { fallbackData: initialData },
  );

  useEffect(() => {
    if (initialData !== undefined) {
      mutate(key, initialData, {
        optimisticData: initialData,
        populateCache: true,
        revalidate: false,
      });
    }
  }, [initialData, key]);

  return swrResult;
};

export const useSWRMUTxPageInfo = (
    pageId: string | null | undefined,
    shareLinkId?: string | null,
): SWRMutationResponse<IPageInfo | IPageInfoForOperation> => {

  // assign null if shareLinkId is undefined in order to identify SWR key only by pageId
  const fixedShareLinkId = shareLinkId ?? null;

  const key = useMemo(() => {
    return pageId != null ? ['/page/info', pageId, fixedShareLinkId] : null;
  }, [fixedShareLinkId, pageId]);

  return useSWRMutation(
    key,
    ([endpoint, pageId, shareLinkId]: [string, string, string|null]) => apiv3Get(endpoint, { pageId, shareLinkId }).then(response => response.data),
  );
};

export const useSWRxPageRevision = (pageId: string, revisionId: Ref<IRevision>): SWRResponse<IRevisionHasId> => {
  const key = [`/revisions/${revisionId}`, pageId, revisionId];
  return useSWRImmutable(
    key,
    () => apiv3Get<{ revision: IRevisionHasId }>(`/revisions/${revisionId}`, { pageId }).then(response => response.data.revision),
  );
};

/*
 * SWR Infinite for page revision list
 */

export const useSWRxInfinitePageRevisions = (
    pageId: string,
    limit: number,
): SWRInfiniteResponse<SWRInfinitePageRevisionsResponse, Error> => {
  return useSWRInfinite(
    (pageIndex, previousRevisionData) => {
      if (previousRevisionData != null && previousRevisionData.revisions.length === 0) return null;

      if (pageIndex === 0 || previousRevisionData == null) {
        return ['/revisions/list', pageId, undefined, limit];
      }
      const offset = previousRevisionData.offset + limit;
      return ['/revisions/list', pageId, offset, limit];
    },
    ([endpoint, pageId, offset, limit]) => apiv3Get<SWRInfinitePageRevisionsResponse>(endpoint, { pageId, offset, limit }).then(response => response.data),
    {
      revalidateFirstPage: true,
      revalidateAll: false,
    },
  );
};

/*
 * Grant normalization fetching hooks
 */
export const useSWRxIsGrantNormalized = (
    pageId: string | null | undefined,
): SWRResponse<IResIsGrantNormalized, Error> => {

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: isNotFound } = useIsNotFound();

  const key = !isGuestUser && !isReadOnlyUser && !isNotFound && pageId != null
    ? ['/page/is-grant-normalized', pageId]
    : null;

  return useSWRImmutable(
    key,
    ([endpoint, pageId]) => apiv3Get(endpoint, { pageId }).then(response => response.data),
  );
};

export const useSWRxApplicableGrant = (
    pageId: string | null | undefined,
): SWRResponse<IRecordApplicableGrant, Error> => {

  return useSWRImmutable(
    pageId != null ? ['/page/applicable-grant', pageId] : null,
    ([endpoint, pageId]) => apiv3Get(endpoint, { pageId }).then(response => response.data),
  );
};


/** **********************************************************
 *                     Computed states
 *********************************************************** */

export const useCurrentPagePath = (): SWRResponse<string | undefined, Error> => {
  const { data: currentPage } = useSWRxCurrentPage();
  const { data: currentPathname } = useCurrentPathname();

  return useSWRImmutable(
    ['currentPagePath', currentPage?.path, currentPathname],
    ([, , pathname]) => {
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
    ([, pagePath]) => pagePathUtils.isTrashPage(pagePath),
    // TODO: set fallbackData
    // { fallbackData:  }
  );
};
