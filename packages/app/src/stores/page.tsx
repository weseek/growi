import { IPageInfoForEntity, IPagePopulatedToShowRevision, Nullable } from '@growi/core';
import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiPost, apiGet } from '~/client/util/apiv1-client';
import { apiv3Get, apiv3Post } from '~/client/util/apiv3-client';
import {
  IPageInfo, IPageInfoForOperation, IPageInfoAll,
} from '~/interfaces/page';
import { IRecordApplicableGrant, IResIsGrantNormalized } from '~/interfaces/page-grant';
import { IRevisionsForPagination } from '~/interfaces/revision';
import loggerFactory from '~/utils/logger';

import { IPageTagsInfo } from '../interfaces/tag';

import { useCurrentPageId } from './context';

const logger = loggerFactory('growi:stores:page');

export const useSWRxPage = (pageId?: string|null, shareLinkId?: string): SWRResponse<IPagePopulatedToShowRevision|null, Error> => {
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
  );
};

export const useSWRxPageByPath = (path?: string): SWRResponse<IPagePopulatedToShowRevision, Error> => {
  return useSWR<IPagePopulatedToShowRevision, Error>(
    path != null ? ['/page', path] : null,
    (endpoint, path) => apiv3Get<{ page: IPagePopulatedToShowRevision }>(endpoint, { path }).then(result => result.data.page),
  );
};

export const useSWRxCurrentPage = (shareLinkId?: string, initialData?: IPagePopulatedToShowRevision): SWRResponse<IPagePopulatedToShowRevision|null, Error> => {
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

  const swrResult = useSWRImmutable<IPageInfo | IPageInfoForOperation, Error>(
    pageId != null ? ['/page/info', pageId, fixedShareLinkId] : null,
    (endpoint, pageId, shareLinkId) => apiv3Get(endpoint, { pageId, shareLinkId }).then(response => response.data),
    { fallbackData: initialData },
  );

  // use mutate because fallbackData does not work
  if (initialData != null) {
    swrResult.mutate(initialData);
  }

  return swrResult;
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

export type IPageOperation = {
  createPage: (pagePath, markdown, tmpParams) => Promise<any>
  updatePage: (pageId, revisionId, markdown, tmpParams) => Promise<any>
  saveAndReload: (optionsToSave, editorMode) => Promise<any>
}

export const useSWRxPageOperation = (pageId: string, path: string, revisionId: string): IPageOperation => {

  const createPage = async(pagePath, markdown, tmpParams) => {
    // const socketIoContainer = this.appContainer.getContainer('SocketIoContainer');

    // clone
    const params = Object.assign(tmpParams, {
      path: pagePath,
      body: markdown,
    });

    const res = await apiv3Post('/pages/', params);
    const { page, tags, revision } = res.data;

    return { page, tags, revision };
  };

  const updatePage = async(pageId, revisionId, markdown, tmpParams): Promise<any> => {
    // const socketIoContainer = this.appContainer.getContainer('SocketIoContainer');

    // clone
    const params = Object.assign(tmpParams, {
      page_id: pageId,
      revision_id: revisionId,
      body: markdown,
    });

    const res: any = await apiPost('/pages.update', params);
    if (!res.ok) {
      throw new Error(res.error);
    }
    return res;
  };


  const saveAndReload = async(optionsToSave, editorMode): Promise<void> => {
    if (optionsToSave == null) {
      const msg = '\'saveAndReload\' requires the \'optionsToSave\' param';
      throw new Error(msg);
    }

    if (editorMode == null) {
      logger.warn('\'saveAndReload\' requires the \'editorMode\' param');
      return;
    }

    // const { pageId, path } = this.state;
    // const { revisionId } = this.state;

    const options = Object.assign({}, optionsToSave);

    let markdown;
    // if (editorMode === EditorMode.HackMD) {
    //   const pageEditorByHackmd = this.appContainer.getComponentInstance('PageEditorByHackmd');
    //   markdown = await pageEditorByHackmd.getMarkdown();
    //   // set option to sync
    //   options.isSyncRevisionToHackmd = true;
    //   revisionId = this.state.revisionIdHackmdSynced;
    // }
    // else {
    // const pageEditor = this.appContainer.getComponentInstance('PageEditor');
    // markdown = pageEditor.getMarkdown();
    // }

    let res;
    if (pageId == null) {
      res = await createPage(path, markdown, options);
    }
    else {
      res = await updatePage(pageId, revisionId, markdown, options);
    }

    // const editorContainer = this.appContainer.getContainer('EditorContainer');
    // editorContainer.clearDraft(path);
    window.location.href = path;

    return res;
  };


  return {
    createPage,
    updatePage,
    saveAndReload,
  };
};
