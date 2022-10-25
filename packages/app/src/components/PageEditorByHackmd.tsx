import React, {
  useCallback, useRef, useState, useEffect,
} from 'react';

import EventEmitter from 'events';

import { useTranslation } from 'react-i18next';


import { saveOrUpdate } from '~/client/services/page-operation';
import { toastError, toastSuccess } from '~/client/util/apiNotification';
import { apiPost } from '~/client/util/apiv1-client';
import { getOptionsToSave } from '~/client/util/editor';
import { IResHackmdIntegrated, IResHackmdDiscard } from '~/interfaces/hackmd';
import {
  useCurrentPagePath, useCurrentPageId, useHackmdUri, usePageIdOnHackmd, useHasDraftOnHackmd, useRevisionIdHackmdSynced,
} from '~/stores/context';
import {
  useSWRxSlackChannels, useIsSlackEnabled, usePageTagsForEditors, useIsEnabledUnsavedWarning,
} from '~/stores/editor';
import { useSWRxCurrentPage, useSWRxTagsInfo } from '~/stores/page';
import {
  EditorMode,
  useEditorMode, useSelectedGrant,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import HackmdEditor from './PageEditorByHackmd/HackmdEditor';

const logger = loggerFactory('growi:PageEditorByHackmd');

declare const globalEmitter: EventEmitter;

type HackEditorRef = {
  getValue: () => Promise<string>
};

export const PageEditorByHackmd = (): JSX.Element => {

  const { t } = useTranslation();
  const { data: editorMode, mutate: mutateEditorMode } = useEditorMode();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: currentPathname } = useCurrentPagePath();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPagePath);
  const { data: isSlackEnabled } = useIsSlackEnabled();
  const { data: pageId } = useCurrentPageId();
  const { data: pageTags } = usePageTagsForEditors(pageId);
  const { mutate: mutateTagsInfo } = useSWRxTagsInfo(pageId);
  const { data: grant } = useSelectedGrant();
  const { data: hackmdUri } = useHackmdUri();

  // pageData
  const { data: pageData, mutate: mutatePageData } = useSWRxCurrentPage();
  const revision = pageData?.revision;

  const slackChannels = slackChannelsData?.toString();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  // for error
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorReason, setErrorReason] = useState('');

  // state from pageContainer
  const { data: pageIdOnHackmd, mutate: mutatePageIdOnHackmd } = usePageIdOnHackmd();
  const { data: hasDraftOnHackmd, mutate: mutateHasDraftOnHackmd } = useHasDraftOnHackmd();
  const { data: revisionIdHackmdSynced, mutate: mutateRevisionIdHackmdSynced } = useRevisionIdHackmdSynced();
  const { mutate: mutateIsEnabledUnsavedWarning } = useIsEnabledUnsavedWarning();
  const [isHackmdDraftUpdatingInRealtime, setIsHackmdDraftUpdatingInRealtime] = useState(false);
  const [remoteRevisionId, setRemoteRevisionId] = useState(revision?._id); // initialize

  const hackmdEditorRef = useRef<HackEditorRef>(null);

  const saveAndReturnToViewHandler = useCallback(async(opts?: {overwriteScopesOfDescendants: boolean}) => {
    if (editorMode !== EditorMode.HackMD) { return }

    try {
      if (isSlackEnabled == null || currentPathname == null || slackChannels == null || grant == null || revision == null || hackmdEditorRef.current == null) {
        throw new Error('Some materials to save are invalid');
      }

      let optionsToSave;

      const currentOptionsToSave = getOptionsToSave(
        isSlackEnabled, slackChannels, grant.grant, grant.grantedGroup?.id, grant.grantedGroup?.name, pageTags ?? [], true,
      );

      if (opts != null) {
        optionsToSave = Object.assign(currentOptionsToSave, {
          ...opts,
        });
      }
      else {
        optionsToSave = currentOptionsToSave;
      }

      const markdown = await hackmdEditorRef.current.getValue();

      await saveOrUpdate(optionsToSave, { pageId, path: currentPagePath || currentPathname, revisionId: revision?._id }, markdown);
      await mutatePageData();
      await mutateTagsInfo();
      mutateEditorMode(EditorMode.View);
      mutateIsEnabledUnsavedWarning(false);
    }
    catch (error) {
      logger.error('failed to save', error);
      toastError(error.message);
    }
  }, [editorMode,
      isSlackEnabled,
      currentPathname,
      slackChannels,
      grant,
      revision,
      pageTags,
      pageId,
      currentPagePath,
      mutatePageData,
      mutateEditorMode,
      mutateTagsInfo,
      mutateIsEnabledUnsavedWarning,
  ]);

  // set handler to save and reload Page
  useEffect(() => {
    globalEmitter.on('saveAndReturnToView', saveAndReturnToViewHandler);

    return function cleanup() {
      globalEmitter.removeListener('saveAndReturnToView', saveAndReturnToViewHandler);
    };
  }, [saveAndReturnToViewHandler]);

  const resetInitializedStatusHandler = useCallback(() => {
    setIsInitialized(false);
  }, []);


  // set handler to save and reload Page
  useEffect(() => {
    globalEmitter.on('resetInitializedHackMdStatus', resetInitializedStatusHandler);

    return function cleanup() {
      globalEmitter.removeListener('resetInitializedHackMdStatus', resetInitializedStatusHandler);
    };
  }, [resetInitializedStatusHandler]);


  const isResume = useCallback(() => {
    const isPageExistsOnHackmd = (pageIdOnHackmd != null);
    return (isPageExistsOnHackmd && hasDraftOnHackmd) || isHackmdDraftUpdatingInRealtime;
  }, [hasDraftOnHackmd, isHackmdDraftUpdatingInRealtime, pageIdOnHackmd]);

  const startToEdit = useCallback(async() => {

    if (hackmdUri == null) {
      // do nothing
      return;
    }

    setIsInitialized(false);
    setIsInitializing(true);

    try {
      const res = await apiPost<IResHackmdIntegrated>('/hackmd.integrate', { pageId });

      if (!res.ok) {
        throw new Error(res.error);
      }

      mutatePageIdOnHackmd(res.pageIdOnHackmd);
      mutateRevisionIdHackmdSynced(res.revisionIdHackmdSynced);
    }
    catch (err) {
      toastError(err.message);

      setHasError(true);
      setErrorMessage('GROWI server failed to connect to HackMD.');
      setErrorReason(err.toString());
    }

    setIsInitialized(true);
    setIsInitializing(false);
  }, [pageId, hackmdUri, mutatePageIdOnHackmd, mutateRevisionIdHackmdSynced]);

  /**
   * Start to edit w/o any api request
   */
  const resumeToEdit = useCallback(() => {
    setIsInitialized(true);
  }, []);

  const discardChanges = useCallback(async() => {

    if (pageId == null) { return }

    try {
      const res = await apiPost<IResHackmdDiscard>('/hackmd.discard', { pageId });

      if (!res.ok) {
        throw new Error(res.error);
      }

      setIsHackmdDraftUpdatingInRealtime(false);
      mutateHasDraftOnHackmd(false);
      mutatePageIdOnHackmd(res.pageIdOnHackmd);
      setRemoteRevisionId(res.revisionIdHackmdSynced);
      mutateRevisionIdHackmdSynced(res.revisionIdHackmdSynced);


    }
    catch (err) {
      logger.error(err);
      toastError(err.message);
    }
  }, [setIsHackmdDraftUpdatingInRealtime, mutateHasDraftOnHackmd, mutatePageIdOnHackmd, mutateRevisionIdHackmdSynced, pageId]);

  /**
   * save and update state of containers
   * @param {string} markdown
   */
  const onSaveWithShortcut = useCallback(async(markdown) => {
    try {
      const currentPagePathOrPathname = currentPagePath || currentPathname;
      if (
        isSlackEnabled == null || grant == null || slackChannels == null || pageId == null
        || revisionIdHackmdSynced == null || currentPagePathOrPathname == null
      ) { throw new Error('Some materials to save are invalid') }
      const optionsToSave = getOptionsToSave(
        isSlackEnabled, slackChannels, grant.grant, grant.grantedGroup?.id, grant.grantedGroup?.name, pageTags ?? [], true,
      );
      const res = await saveOrUpdate(optionsToSave, { pageId, path: currentPagePathOrPathname, revisionId: revisionIdHackmdSynced }, markdown);

      // update pageData
      mutatePageData(res);

      // set updated data
      setRemoteRevisionId(res.revision._id);
      mutateRevisionIdHackmdSynced(res.page.revisionHackmdSynced);
      mutateHasDraftOnHackmd(res.page.hasDraftOnHackmd);
      mutateTagsInfo();
      mutateIsEnabledUnsavedWarning(false);

      logger.debug('success to save');

      toastSuccess(t('successfully_saved_the_page'));
    }
    catch (error) {
      logger.error('failed to save', error);
      toastError(error.message);
    }
  }, [isSlackEnabled,
      grant,
      slackChannels,
      pageId,
      revisionIdHackmdSynced,
      currentPathname,
      pageTags,
      currentPagePath,
      mutatePageData,
      mutateRevisionIdHackmdSynced,
      mutateHasDraftOnHackmd,
      mutateTagsInfo,
      mutateIsEnabledUnsavedWarning,
      t]);

  /**
   * onChange event of HackmdEditor handler
   */
  const hackmdEditorChangeHandler = useCallback(async(body) => {

    if (hackmdUri == null || pageId == null) {
      // do nothing
      return;
    }

    if (revision?.body === body) {
      return;
    }

    try {
      await apiPost('/hackmd.saveOnHackmd', { pageId });
    }
    catch (err) {
      logger.error(err);
    }
  }, [pageId, revision?.body, hackmdUri]);

  const penpalErrorOccuredHandler = useCallback((error) => {
    toastError(error.message);

    setHasError(true);
    setErrorMessage(t('hackmd.fail_to_connect'));
    setErrorReason(error.toString());
  }, [t]);

  const renderPreInitContent = useCallback(() => {
    const isPageNotFound = pageId == null;

    let content;

    /*
     * HackMD is not setup
     */
    if (hackmdUri == null) {
      content = (
        <div>
          <p className="text-center hackmd-status-label"><i className="fa fa-file-text"></i> { t('hackmd.not_set_up')}</p>
          {/* eslint-disable-next-line react/no-danger */}
          <p dangerouslySetInnerHTML={{ __html: t('hackmd.need_to_associate_with_growi_to_use_hackmd_refer_to_this') }} />
        </div>
      );
    }

    /*
    * used HackMD from NotFound Page
    */
    else if (isPageNotFound) {
      content = (
        <div className="text-center">
          <p className="hackmd-status-label">
            <i className="fa fa-file-text mr-2" />
            { t('hackmd.used_for_not_found') }
          </p>
          {/* eslint-disable-next-line react/no-danger */}
          <p dangerouslySetInnerHTML={{ __html: t('hackmd.need_to_make_page') }} />
        </div>
      );
    }
    /*
     * Resume to edit or discard changes
     */
    else if (isResume()) {
      const isHackmdDocumentOutdated = revisionIdHackmdSynced !== remoteRevisionId;

      content = (
        <div>
          <p className="text-center hackmd-status-label"><i className="fa fa-file-text"></i> HackMD is READY!</p>
          <p className="text-center"><strong>{t('hackmd.unsaved_draft')}</strong></p>

          { isHackmdDocumentOutdated && (
            <div className="card border-warning">
              <div className="card-header bg-warning"><i className="icon-fw icon-info"></i> {t('hackmd.draft_outdated')}</div>
              <div className="card-body text-center">
                {t('hackmd.based_on_revision')}&nbsp;
                <a href={`?revision=${revisionIdHackmdSynced}`}><span className="badge badge-secondary">{revisionIdHackmdSynced?.substr(-8)}</span></a>

                <div className="text-center mt-3">
                  <button
                    className="btn btn-link btn-view-outdated-draft p-0"
                    type="button"
                    disabled={isInitializing}
                    onClick={resumeToEdit}
                  >
                    {t('hackmd.view_outdated_draft')}
                  </button>
                </div>
              </div>
            </div>
          ) }

          { !isHackmdDocumentOutdated && (
            <div className="text-center hackmd-resume-button-container mb-3">
              <button
                className="btn btn-success btn-lg waves-effect waves-light"
                type="button"
                disabled={isInitializing}
                onClick={resumeToEdit}
              >
                <span className="btn-label"><i className="icon-fw icon-control-end"></i></span>
                <span className="btn-text">{t('hackmd.resume_to_edit')}</span>
              </button>
            </div>
          ) }

          <div className="text-center hackmd-discard-button-container mb-3">
            <button
              className="btn btn-outline-secondary btn-lg waves-effect waves-light"
              type="button"
              onClick={discardChanges}
            >
              <span className="btn-label"><i className="icon-fw icon-control-start"></i></span>
              <span className="btn-text">{t('hackmd.discard_changes')}</span>
            </button>
          </div>

        </div>
      );
    }
    /*
     * Start to edit
     */
    else {
      const isRevisionOutdated = revision?._id !== remoteRevisionId;

      content = (
        <div>
          <p className="text-muted text-center hackmd-status-label"><i className="fa fa-file-text"></i> HackMD is READY!</p>
          <div className="text-center hackmd-start-button-container mb-3">
            <button
              className="btn btn-info btn-lg waves-effect waves-light"
              type="button"
              disabled={isRevisionOutdated || isInitializing}
              onClick={startToEdit}
            >
              <span className="btn-label"><i className="icon-fw icon-paper-plane"></i></span>
              {t('hackmd.start_to_edit')}
            </button>
          </div>
          <p className="text-center">{t('hackmd.clone_page_content')}</p>
        </div>
      );
    }

    return (
      <div className="hackmd-preinit d-flex justify-content-center align-items-center">
        {content}
      </div>
    );
  }, [discardChanges, isInitializing, isResume, resumeToEdit, startToEdit, t, hackmdUri, pageId, remoteRevisionId, revisionIdHackmdSynced, revision?._id]);

  if (editorMode == null || revision == null) {
    return <></>;
  }

  let content;

  // TODO: typescriptize
  // using any because ref cann't used between FC and class conponent with type safe
  const AnyEditor = HackmdEditor as any;

  if (isInitialized && hackmdUri != null) {
    content = (
      <AnyEditor
        ref={hackmdEditorRef}
        hackmdUri={hackmdUri}
        pageIdOnHackmd={pageIdOnHackmd}
        initializationMarkdown={isResume() ? null : revision.body}
        onChange={hackmdEditorChangeHandler}
        onSaveWithShortcut={(document) => {
          onSaveWithShortcut(document);
        }}
        onPenpalErrorOccured={penpalErrorOccuredHandler}
      >
      </AnyEditor>
    );
  }
  else {
    content = renderPreInitContent();
  }


  return (
    <div className="position-relative">

      {content}

      { hasError && (
        <div className="hackmd-error position-absolute d-flex flex-column justify-content-center align-items-center">
          <div className="bg-box p-5 text-center">
            <h2 className="text-warning"><i className="icon-fw icon-exclamation"></i> {t('hackmd.integration_failed')}</h2>
            <h4>{errorMessage}</h4>
            <p className="card well text-danger">
              {errorReason}
            </p>
            {/* eslint-disable-next-line react/no-danger */}
            <p dangerouslySetInnerHTML={{ __html: t('hackmd.check_configuration') }} />
          </div>
        </div>
      ) }

    </div>
  );

};
