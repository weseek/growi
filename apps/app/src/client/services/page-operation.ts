import { useCallback } from 'react';

import { SubscriptionStatusType, type Nullable } from '@growi/core';
import urljoin from 'url-join';

import { OptionsToSave } from '~/interfaces/page-operation';
import { useEditingMarkdown, useIsEnabledUnsavedWarning, usePageTagsForEditors } from '~/stores/editor';
import { useCurrentPageId, useSWRMUTxCurrentPage, useSWRxTagsInfo } from '~/stores/page';
import { useSetRemoteLatestPageData } from '~/stores/remote-latest-page';
import loggerFactory from '~/utils/logger';

import { apiPost } from '../util/apiv1-client';
import { apiv3Post, apiv3Put } from '../util/apiv3-client';
import { toastError } from '../util/toastr';

const logger = loggerFactory('growi:services:page-operation');

export const toggleSubscribe = async(pageId: string, currentStatus: SubscriptionStatusType | undefined): Promise<void> => {
  try {
    const newStatus = currentStatus === SubscriptionStatusType.SUBSCRIBE
      ? SubscriptionStatusType.UNSUBSCRIBE
      : SubscriptionStatusType.SUBSCRIBE;

    await apiv3Put('/page/subscribe', { pageId, status: newStatus });
  }
  catch (err) {
    toastError(err);
  }
};

export const toggleLike = async(pageId: string, currentValue?: boolean): Promise<void> => {
  try {
    await apiv3Put('/page/likes', { pageId, bool: !currentValue });
  }
  catch (err) {
    toastError(err);
  }
};

export const toggleBookmark = async(pageId: string, currentValue?: boolean): Promise<void> => {
  try {
    await apiv3Put('/bookmarks', { pageId, bool: !currentValue });
  }
  catch (err) {
    toastError(err);
  }
};

export const updateContentWidth = async(pageId: string, newValue: boolean): Promise<void> => {
  try {
    await apiv3Put(`/page/${pageId}/content-width`, { expandContentWidth: newValue });
  }
  catch (err) {
    toastError(err);
  }
};

export const bookmark = async(pageId: string): Promise<void> => {
  try {
    await apiv3Put('/bookmarks', { pageId, bool: true });
  }
  catch (err) {
    toastError(err);
  }
};

export const unbookmark = async(pageId: string): Promise<void> => {
  try {
    await apiv3Put('/bookmarks', { pageId, bool: false });
  }
  catch (err) {
    toastError(err);
  }
};

export const exportAsMarkdown = (pageId: string, revisionId: string, format: string): void => {
  const url = new URL(urljoin(window.location.origin, '_api/v3/page/export', pageId));
  url.searchParams.append('format', format);
  url.searchParams.append('revisionId', revisionId);
  window.location.href = url.href;
};

/**
 * send request to fix broken paths caused by unexpected events such as server shutdown while renaming page paths
 */
export const resumeRenameOperation = async(pageId: string): Promise<void> => {
  await apiv3Post('/pages/resume-rename', { pageId });
};

// TODO: define return type
export const createPage = async(pagePath: string, markdown: string, tmpParams: OptionsToSave) => {
  // clone
  const params = Object.assign(tmpParams, {
    path: pagePath,
    body: markdown,
  });

  // !! WARNING !! in the case where the 'shouldReturnIfPathExists' in 'params' is true, return value might be an empty object {}.
  const res = await apiv3Post('/pages/', params);
  const { page, tags, revision } = res.data;

  return { page, tags, revision };
};

// TODO: define return type
const updatePage = async(pageId: string, revisionId: string, markdown: string, tmpParams: OptionsToSave) => {
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

type PageInfo= {
  path: string,
  pageId: Nullable<string>,
  revisionId: Nullable<string>,
}

type SaveOrUpdateFunction = (markdown: string, pageInfo: PageInfo, optionsToSave?: OptionsToSave) => any;

// TODO: define return type
export const useSaveOrUpdate = (): SaveOrUpdateFunction => {
  /* eslint-disable react-hooks/rules-of-hooks */
  const { mutate: mutateIsEnabledUnsavedWarning } = useIsEnabledUnsavedWarning();
  /* eslint-enable react-hooks/rules-of-hooks */

  return useCallback(async(markdown: string, pageInfo: PageInfo, optionsToSave?: OptionsToSave) => {
    const { path, pageId, revisionId } = pageInfo;

    const options: OptionsToSave = Object.assign({}, optionsToSave);

    let res;
    if (pageId == null || revisionId == null) {
      res = await createPage(path, markdown, options);
    }
    else {
      if (revisionId == null) {
        const msg = '\'revisionId\' is required to update page';
        throw new Error(msg);
      }
      res = await updatePage(pageId, revisionId, markdown, options);
    }

    mutateIsEnabledUnsavedWarning(false);

    return res;
  }, [mutateIsEnabledUnsavedWarning]);
};

export type UpdateStateAfterSaveOption = {
  supressEditingMarkdownMutation: boolean,
}

export const useUpdateStateAfterSave = (pageId: string|undefined|null, opts?: UpdateStateAfterSaveOption): (() => Promise<void>) | undefined => {
  const { mutate: mutateCurrentPageId } = useCurrentPageId();
  const { trigger: mutateCurrentPage } = useSWRMUTxCurrentPage();
  const { setRemoteLatestPageData } = useSetRemoteLatestPageData();
  const { mutate: mutateTagsInfo } = useSWRxTagsInfo(pageId);
  const { sync: syncTagsInfoForEditor } = usePageTagsForEditors(pageId);
  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();

  // update swr 'currentPageId', 'currentPage', remote states
  return useCallback(async() => {
    if (pageId == null) { return }

    // update tag before page: https://github.com/weseek/growi/pull/7158
    // !! DO NOT CHANGE THE ORDERS OF THE MUTATIONS !! -- 12.26 yuken-t
    await mutateTagsInfo(); // get from DB
    syncTagsInfoForEditor(); // sync global state for client

    await mutateCurrentPageId(pageId);
    const updatedPage = await mutateCurrentPage();

    if (updatedPage == null) { return }

    // supress to mutate only when updated from built-in editor
    // and see: https://github.com/weseek/growi/pull/7118
    const supressEditingMarkdownMutation = opts?.supressEditingMarkdownMutation ?? false;
    if (!supressEditingMarkdownMutation) {
      mutateEditingMarkdown(updatedPage.revision.body);
    }

    const remoterevisionData = {
      remoteRevisionId: updatedPage.revision._id,
      remoteRevisionBody: updatedPage.revision.body,
      remoteRevisionLastUpdateUser: updatedPage.lastUpdateUser,
      remoteRevisionLastUpdatedAt: updatedPage.updatedAt,
    };

    setRemoteLatestPageData(remoterevisionData);
  },
  // eslint-disable-next-line max-len
  [pageId, mutateTagsInfo, syncTagsInfoForEditor, mutateCurrentPageId, mutateCurrentPage, opts?.supressEditingMarkdownMutation, setRemoteLatestPageData, mutateEditingMarkdown]);
};

export const unlink = async(path: string): Promise<void> => {
  await apiPost('/pages.unlink', { path });
};
