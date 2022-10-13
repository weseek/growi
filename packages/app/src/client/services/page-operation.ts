import { SubscriptionStatusType, Nullable } from '@growi/core';
import urljoin from 'url-join';

import { OptionsToSave } from '~/interfaces/editor-settings';
import loggerFactory from '~/utils/logger';


import { toastError } from '../util/apiNotification';
import { apiPost } from '../util/apiv1-client';
import { apiv3Post, apiv3Put } from '../util/apiv3-client';

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
const createPage = async(pagePath: string, markdown: string, tmpParams: OptionsToSave) => {
  // clone
  const params = Object.assign(tmpParams, {
    path: pagePath,
    body: markdown,
  });

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

// TODO: define return type
export const saveOrUpdate = async(optionsToSave: OptionsToSave, pageInfo: PageInfo, markdown: string) => {
  const { path, pageId, revisionId } = pageInfo;

  const options = Object.assign({}, optionsToSave);

  /*
  * Note: variable "markdown" will be received from params
  * please delete the following code after implemating HackMD editor function
  */
  // let markdown;
  // if (editorMode === EditorMode.HackMD) {
  // const pageEditorByHackmd = this.appContainer.getComponentInstance('PageEditorByHackmd');
  // markdown = await pageEditorByHackmd.getMarkdown();
  // // set option to sync
  // options.isSyncRevisionToHackmd = true;
  // revisionId = this.state.revisionIdHackmdSynced;
  // }
  // else {
  // const pageEditor = this.appContainer.getComponentInstance('PageEditor');
  // const pageEditor = getComponentInstance('PageEditor');
  // markdown = pageEditor.getMarkdown();
  // }

  let res;
  if (pageId == null) {
    res = await createPage(path, markdown, options);
  }
  else {
    if (revisionId == null) {
      const msg = '\'revisionId\' is required to update page';
      throw new Error(msg);
    }
    res = await updatePage(pageId, revisionId, markdown, options);
  }

  return res;
};
