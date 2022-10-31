import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import {
  useHasDraftOnHackmd, useIsHackmdDraftUpdatingInRealtime, useRemoteRevisionId, useRevisionIdHackmdSynced,
} from '~/stores/hackmd';
import { useSWRxCurrentPage } from '~/stores/page';

type AlertComponent = {
  additionalClasses: string[],
  label: JSX.Element,
  btn: JSX.Element
}

export const PageStatusAlert = (): JSX.Element => {

  const { t } = useTranslation();
  const { data: isHackmdDraftUpdatingInRealtime } = useIsHackmdDraftUpdatingInRealtime();
  const { data: hasDraftOnHackmd } = useHasDraftOnHackmd();
  const { data: revisionIdHackmdSynced } = useRevisionIdHackmdSynced();
  const { data: remoteRevisionId } = useRemoteRevisionId();
  const { data: pageData } = useSWRxCurrentPage();
  const revision = pageData?.revision;

  const refreshPage = useCallback(() => {
    window.location.reload();
  }, []);

  const onClickResolveConflict = useCallback(() => {
    // this.props.pageContainer.setState({
    //   isConflictDiffModalOpen: true,
    // });
  }, []);

  const getContentsForSomeoneEditingAlert = useCallback((): AlertComponent => {
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

  const getContentsForDraftExistsAlert = useCallback((): AlertComponent => {
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

  const getContentsForUpdatedAlert = useCallback((): AlertComponent => {
    // const pageEditor = appContainer.getComponentInstance('PageEditor');

    const isConflictOnEdit = false;

    // if (pageEditor != null) {
    //   const markdownOnEdit = pageEditor.getMarkdown();
    //   isConflictOnEdit = markdownOnEdit !== pageContainer.state.markdown;
    // }

    // TODO: re-impl with Next.js way
    // const usernameComponentToString = ReactDOMServer.renderToString(<Username user={pageContainer.state.lastUpdateUser} />);

    // const label1 = isConflictOnEdit
    //   ? t('modal_resolve_conflict.file_conflicting_with_newer_remote')
    //   // eslint-disable-next-line react/no-danger
    //   : <span dangerouslySetInnerHTML={{ __html: `${usernameComponentToString} ${t('edited this page')}` }} />;
    const label1 = '(TBD -- 2022.09.13)';

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
  }, [t, onClickResolveConflict, refreshPage]);

  const getFC = useCallback(() => {
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

  const alertComponent = getFC();

  if (alertComponent === null) { return <></> }

  const { additionalClasses, label, btn } = alertComponent;

  return (
    <div className={`card grw-page-status-alert text-white fixed-bottom animated fadeInUp faster ${additionalClasses.join(' ')}`}>
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
