import React, { useCallback, useMemo } from 'react';

import { useTranslation } from 'next-i18next';
import * as ReactDOMServer from 'react-dom/server';

import { useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';
import { useEditingMarkdown, useIsConflict } from '~/stores/editor';
import {
  useHasDraftOnHackmd, useIsHackmdDraftUpdatingInRealtime, useRevisionIdHackmdSynced,
} from '~/stores/hackmd';
import { useConflictDiffModal } from '~/stores/modal';
import { useSWRMUTxCurrentPage, useSWRxCurrentPage } from '~/stores/page';
import { useRemoteRevisionId, useRemoteRevisionLastUpdateUser } from '~/stores/remote-latest-page';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { Username } from './User/Username';

import styles from './PageStatusAlert.module.scss';

type AlertComponentContents = {
  additionalClasses: string[],
  label: JSX.Element,
  btn: JSX.Element
}

export const PageStatusAlert = (): JSX.Element => {

  const { t } = useTranslation();
  const { data: isHackmdDraftUpdatingInRealtime } = useIsHackmdDraftUpdatingInRealtime();
  const { data: hasDraftOnHackmd } = useHasDraftOnHackmd();
  const { data: isConflict } = useIsConflict();
  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();
  const { open: openConflictDiffModal } = useConflictDiffModal();
  const { mutate: mutateEditorMode } = useEditorMode();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();

  // store remote latest page data
  const { data: revisionIdHackmdSynced } = useRevisionIdHackmdSynced();
  const { data: remoteRevisionId } = useRemoteRevisionId();
  const { data: remoteRevisionLastUpdateUser } = useRemoteRevisionLastUpdateUser();

  const { data: pageData } = useSWRxCurrentPage();
  const { trigger: mutatePageData } = useSWRMUTxCurrentPage();
  const revision = pageData?.revision;

  const refreshPage = useCallback(async() => {
    const updatedPageData = await mutatePageData();
    mutateEditingMarkdown(updatedPageData?.revision.body);
  }, [mutateEditingMarkdown, mutatePageData]);

  const onClickResolveConflict = useCallback(() => {
    openConflictDiffModal();
  }, [openConflictDiffModal]);

  const getContentsForSomeoneEditingAlert = useCallback((): AlertComponentContents => {
    return {
      additionalClasses: ['bg-success', 'd-hackmd-none'],
      label:
        <>
          <i className="icon-fw icon-people"></i>
          {t('hackmd.someone_editing')}
        </>,
      btn:
        <a href="#hackmd" key="btnOpenHackmdSomeoneEditing" className="btn btn-outline-white">
          <i className="fa fa-fw fa-file-text-o mr-1"></i>
          Open HackMD Editor
        </a>,
    };
  }, [t]);

  const getContentsForDraftExistsAlert = useCallback((): AlertComponentContents => {
    return {
      additionalClasses: ['bg-success', 'd-hackmd-none'],
      label:
        <>
          <i className="icon-fw icon-pencil"></i>
          {t('hackmd.this_page_has_draft')}
        </>,
      btn:
        <button onClick={() => mutateEditorMode(EditorMode.HackMD)} className="btn btn-outline-white">
          <i className="fa fa-fw fa-file-text-o mr-1"></i>
          Open HackMD Editor
        </button>,
    };
  }, [mutateEditorMode, t]);

  const getContentsForUpdatedAlert = useCallback((): AlertComponentContents => {

    const usernameComponentToString = ReactDOMServer.renderToString(<Username user={remoteRevisionLastUpdateUser} />);

    const label1 = isConflict
      ? t('modal_resolve_conflict.file_conflicting_with_newer_remote')
      // eslint-disable-next-line react/no-danger
      : <span dangerouslySetInnerHTML={{ __html: `${usernameComponentToString} ${t('edited this page')}` }} />;

    return {
      additionalClasses: ['bg-warning'],
      label:
        <>
          <i className="icon-fw icon-bulb"></i>
          {label1}
        </>,
      btn:
        <>
          <button type="button" onClick={() => refreshPage()} className="btn btn-outline-white mr-4">
            <i className="icon-fw icon-reload mr-1"></i>
            {t('Load latest')}
          </button>
          { isConflict && (
            <button
              type="button"
              onClick={onClickResolveConflict}
              className="btn btn-outline-white"
            >
              <i className="fa fa-fw fa-file-text-o mr-1"></i>
              {t('modal_resolve_conflict.resolve_conflict')}
            </button>
          )}
        </>,
    };
  }, [remoteRevisionLastUpdateUser, isConflict, t, onClickResolveConflict, refreshPage]);

  const alertComponentContents = useMemo(() => {
    const isRevisionOutdated = revision?._id !== remoteRevisionId;
    const isHackmdDocumentOutdated = revisionIdHackmdSynced !== remoteRevisionId;

    // 'revision?._id' and 'remoteRevisionId' are can not be undefined
    if (revision?._id == null || remoteRevisionId == null) { return }

    // when remote revision is newer than both
    if (isHackmdDocumentOutdated && isRevisionOutdated) {
      return getContentsForUpdatedAlert();
    }

    // when someone editing with HackMD
    if (isHackmdDraftUpdatingInRealtime) {
      return getContentsForSomeoneEditingAlert();
    }

    // when the draft of HackMD is newest
    if (hasDraftOnHackmd) {
      return getContentsForDraftExistsAlert();
    }

    return null;
  }, [
    revision?._id,
    remoteRevisionId,
    revisionIdHackmdSynced,
    isHackmdDraftUpdatingInRealtime,
    hasDraftOnHackmd,
    getContentsForUpdatedAlert,
    getContentsForSomeoneEditingAlert,
    getContentsForDraftExistsAlert,
  ]);

  if (!!isGuestUser || !!isReadOnlyUser || alertComponentContents == null) { return <></> }

  const { additionalClasses, label, btn } = alertComponentContents;

  return (
    <div className={`${styles['grw-page-status-alert']} card text-white fixed-bottom animated fadeInUp faster ${additionalClasses.join(' ')}`}>
      <div className="card-body">
        <p className="card-text grw-card-label-container">
          {label}
        </p>
        <p className="card-text grw-card-btn-container">
          {btn}
        </p>
      </div>
    </div>
  );

};
