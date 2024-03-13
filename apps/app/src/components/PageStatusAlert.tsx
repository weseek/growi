import React, { useCallback, useMemo } from 'react';

import { useTranslation } from 'next-i18next';

import { usePageStatusAlert } from '~/stores/alert';
import { useIsGuestUser, useIsReadOnlyUser } from '~/stores/context';
import { useEditingMarkdown } from '~/stores/editor';
import { useSWRMUTxCurrentPage, useSWRxCurrentPage } from '~/stores/page';
import { useRemoteRevisionId, useRemoteRevisionLastUpdateUser } from '~/stores/remote-latest-page';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { Username } from './User/Username';

import styles from './PageStatusAlert.module.scss';

export const PageStatusAlert = (): JSX.Element => {
  const { t } = useTranslation();
  const { mutate: mutateEditingMarkdown } = useEditingMarkdown();
  const { data: isGuestUser } = useIsGuestUser();
  const { data: isReadOnlyUser } = useIsReadOnlyUser();
  const { data: pageStatusAlertData } = usePageStatusAlert();
  const { data: editorMode } = useEditorMode();
  const { data: remoteRevisionId } = useRemoteRevisionId();
  const { data: remoteRevisionLastUpdateUser } = useRemoteRevisionLastUpdateUser();
  const { data: pageData } = useSWRxCurrentPage();
  const { trigger: mutatePageData } = useSWRMUTxCurrentPage();

  const onClickRefreshPage = useCallback(async() => {
    const updatedPageData = await mutatePageData();
    mutateEditingMarkdown(updatedPageData?.revision?.body);
  }, [mutateEditingMarkdown, mutatePageData]);

  const onClickResolveConflict = useCallback(() => {
    pageStatusAlertData?.onResolveConflict?.();
  }, [pageStatusAlertData]);

  const alertContentsForView = useMemo(() => {
    return (
      <>
        <p className="card-text grw-card-label-container">
          <Username user={remoteRevisionLastUpdateUser} /> {t('edited this page')}
        </p>
        <p className="card-text grw-card-btn-container">
          <button
            type="button"
            onClick={() => onClickRefreshPage()}
            className="btn btn-outline-white me-4"
          >
            <span className="material-symbols-outlined">refresh</span>
            {t('Load latest')}
          </button>
        </p>
      </>
    );
  }, [onClickRefreshPage, remoteRevisionLastUpdateUser, t]);

  const alertContentsForEditor = useMemo(() => {
    return (
      <>
        <p className="card-text grw-card-label-container">
          {t('modal_resolve_conflict.file_conflicting_with_newer_remote')}
        </p>
        <p className="card-text grw-card-btn-container">
          <button
            type="button"
            onClick={onClickResolveConflict}
            className="btn btn-outline-white"
          >
            <span className="material-symbols-outlined">description</span>
            {t('modal_resolve_conflict.resolve_conflict')}
          </button>
        </p>
      </>
    );
  }, [onClickResolveConflict, t]);

  const currentRevisionId = pageData?.revision?._id;
  const isRevisionOutdated = (currentRevisionId != null || remoteRevisionId != null) && currentRevisionId !== remoteRevisionId;
  if (!!isGuestUser || !!isReadOnlyUser || !isRevisionOutdated) {
    return <></>;
  }

  const hasConflictHandler = pageStatusAlertData?.onResolveConflict != null;
  if (!hasConflictHandler && editorMode === EditorMode.Editor) {
    return <></>;
  }

  return (
    <div className={`${styles['grw-page-status-alert']} card text-white fixed-bottom animated fadeInUp faster bg-warning text-dark`}>
      <div className="card-body">
        { editorMode === EditorMode.View
          ? alertContentsForView
          : alertContentsForEditor
        }
      </div>
    </div>
  );
};
