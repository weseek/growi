import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import {
  useHasDraftOnHackmd, useIsHackmdDraftUpdatingInRealtime, useRemoteRevisionId, useRevisionIdHackmdSynced,
} from '~/stores/hackmd';
import { useSWRxCurrentPage } from '~/stores/page';

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

  const getContentsForSomeoneEditingAlert = useCallback(() => {
    return [
      ['bg-success', 'd-hackmd-none'],
      <>
        <i className="icon-fw icon-people"></i>
        {t('hackmd.someone_editing')}
      </>,
      <a href="#hackmd" key="btnOpenHackmdSomeoneEditing" className="btn btn-outline-white">
        <i className="fa fa-fw fa-file-text-o mr-1"></i>
        Open HackMD Editor
      </a>,
    ];
  }, [t]);

  const getContentsForDraftExistsAlert = useCallback((isRealtime) => {
    return [
      ['bg-success', 'd-hackmd-none'],
      <>
        <i className="icon-fw icon-pencil"></i>
        {t('hackmd.this_page_has_draft')}
      </>,
      <a href="#hackmd" key="btnOpenHackmdPageHasDraft" className="btn btn-outline-white">
        <i className="fa fa-fw fa-file-text-o mr-1"></i>
        Open HackMD Editor
      </a>,
    ];
  }, [t]);

  const getContentsForUpdatedAlert = useCallback(() => {
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

    return [
      ['bg-warning'],
      <>
        <i className="icon-fw icon-bulb"></i>
        {label1}
      </>,
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
    ];
  }, [t, onClickResolveConflict, refreshPage]);


  const isRevisionOutdated = revision?._id !== remoteRevisionId;
  const isHackmdDocumentOutdated = revisionIdHackmdSynced !== remoteRevisionId;

  let getContentsFunc;

  // when remote revision is newer than both
  if (isHackmdDocumentOutdated && isRevisionOutdated) {
    getContentsFunc = getContentsForUpdatedAlert;
  }
  // when someone editing with HackMD
  else if (isHackmdDraftUpdatingInRealtime) {
    getContentsFunc = getContentsForSomeoneEditingAlert;
  }
  // when the draft of HackMD is newest
  else if (hasDraftOnHackmd) {
    getContentsFunc = getContentsForDraftExistsAlert;
  }

  if (getContentsFunc === null) {
    return <></>;
  }

  const [additionalClasses, label, btn] = getContentsFunc();


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
