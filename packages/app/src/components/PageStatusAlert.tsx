import React, { useCallback, useEffect, useMemo } from 'react';

import { useTranslation } from 'next-i18next';
import * as ReactDOMServer from 'react-dom/server';

import { SocketEventName } from '~/interfaces/websocket';
import { useGetEditingMarkdown } from '~/stores/editor';
import {
  useHasDraftOnHackmd, useIsHackmdDraftUpdatingInRealtime, useRevisionIdHackmdSynced,
} from '~/stores/hackmd';
import { useSWRxCurrentPage } from '~/stores/page';
import { useRemoteRevisionBody, useRemoteRevisionId, useRemoteRevisionLastUpdatUser } from '~/stores/remote-latest-page';
import { useGlobalSocket } from '~/stores/websocket';

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
  const { data: getEditingMarkdown } = useGetEditingMarkdown();

  // store remote latest page data
  const { data: revisionIdHackmdSynced } = useRevisionIdHackmdSynced();
  const { data: remoteRevisionId, mutate: mutateRemoteRevisionId } = useRemoteRevisionId();
  const { data: remoteRevisionBody, mutate: mutateRemoteRevisionBody } = useRemoteRevisionBody();
  const { data: remoteRevisionLastUpdateUser, mutate: mutateRemoteRevisionLastUpdateUser } = useRemoteRevisionLastUpdatUser();

  const { data: pageData } = useSWRxCurrentPage();
  const revision = pageData?.revision;
  const pageId = pageData?._id;

  const { data: socket } = useGlobalSocket();

  // method from page container
  // setLatestRemotePageData(s2cMessagePageUpdated) {
  //   const newState = {
  //     remoteRevisionId: s2cMessagePageUpdated.revisionId,
  //     remoteRevisionBody: s2cMessagePageUpdated.revisionBody,
  //     remoteRevisionUpdateAt: s2cMessagePageUpdated.revisionUpdateAt,
  //     revisionIdHackmdSynced: s2cMessagePageUpdated.revisionIdHackmdSynced,
  //     // TODO // TODO remove lastUpdateUsername and refactor parts that lastUpdateUsername is used
  //     lastUpdateUsername: s2cMessagePageUpdated.lastUpdateUsername,
  //     lastUpdateUser: s2cMessagePageUpdated.remoteLastUpdateUser,
  //   };

  //   if (s2cMessagePageUpdated.hasDraftOnHackmd != null) {
  //     newState.hasDraftOnHackmd = s2cMessagePageUpdated.hasDraftOnHackmd;
  //   }

  //   this.setState(newState);
  // }

  const setLatestRemotePageData = useCallback((s2cMessagePageUpdated: any) => {

    mutateRemoteRevisionId(s2cMessagePageUpdated.revisionId);
    mutateRemoteRevisionBody(s2cMessagePageUpdated.revisionBody);
    mutateRemoteRevisionLastUpdateUser(s2cMessagePageUpdated.remoteLastUpdateUser);

  }, [mutateRemoteRevisionBody, mutateRemoteRevisionId, mutateRemoteRevisionLastUpdateUser]);

  useEffect(() => {
    if (socket == null) { return }

    socket.on(SocketEventName.PageUpdated, (data) => {
      const { s2cMessagePageUpdated } = data;
      if (s2cMessagePageUpdated.pageId === pageId) {
        setLatestRemotePageData(s2cMessagePageUpdated);
      }
    });

    return () => { socket.off(SocketEventName.PageUpdated) };

  }, [pageId, setLatestRemotePageData, socket]);

  const refreshPage = useCallback(() => {
    window.location.reload();
  }, []);

  const onClickResolveConflict = useCallback(() => {
    // this.props.pageContainer.setState({
    //   isConflictDiffModalOpen: true,
    // });
  }, []);

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
        <a href="#hackmd" key="btnOpenHackmdPageHasDraft" className="btn btn-outline-white">
          <i className="fa fa-fw fa-file-text-o mr-1"></i>
          Open HackMD Editor
        </a>,
    };
  }, [t]);

  const getContentsForUpdatedAlert = useCallback((): AlertComponentContents => {

    let isConflictOnEdit = false;
    if (getEditingMarkdown != null) {
      const editingMarkdown = getEditingMarkdown();
      isConflictOnEdit = editingMarkdown !== remoteRevisionBody;
    }

    const usernameComponentToString = ReactDOMServer.renderToString(<Username user={remoteRevisionLastUpdateUser} />);

    const label1 = isConflictOnEdit
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
          { isConflictOnEdit && (
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
  }, [getEditingMarkdown, remoteRevisionLastUpdateUser, t, onClickResolveConflict, remoteRevisionBody, refreshPage]);

  const alertComponentContents = useMemo(() => {
    const isRevisionOutdated = revision?._id !== remoteRevisionId;
    const isHackmdDocumentOutdated = revisionIdHackmdSynced !== remoteRevisionId;

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

  if (alertComponentContents == null) { return <></> }

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
