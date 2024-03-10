import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';

import type { IRevisionOnConflict } from '@growi/core';
import {
  MergeViewer, CodeMirrorEditorDiff, GlobalCodeMirrorEditorKey, useCodeMirrorEditorIsolated,
} from '@growi/editor';
import { UserPicture } from '@growi/ui/dist/components';
import { format } from 'date-fns';
import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { toastError, toastSuccess } from '~/client/util/toastr';
import { useCurrentPathname, useCurrentUser } from '~/stores/context';
import { useConflictDiffModal } from '~/stores/modal';
import { useCurrentPagePath, useSWRxCurrentPage, useCurrentPageId } from '~/stores/page';
import {
  useRemoteRevisionBody, useRemoteRevisionId, useRemoteRevisionLastUpdatedAt, useRemoteRevisionLastUpdateUser, useSetRemoteLatestPageData,
} from '~/stores/remote-latest-page';

import styles from './ConflictDiffModal.module.scss';

type ConflictDiffModalCoreProps = {
  request: IRevisionOnConflictWithStringDate,
  latest: IRevisionOnConflictWithStringDate,
};

type IRevisionOnConflictWithStringDate = Omit<IRevisionOnConflict, 'createdAt'> & {
  createdAt: string
}

const ConflictDiffModalCore = (props: ConflictDiffModalCoreProps): JSX.Element => {
  const { request, latest } = props;

  const [resolvedRevision, setResolvedRevision] = useState<string>('');
  const [isRevisionselected, setIsRevisionSelected] = useState<boolean>(false);
  const [revisionSelectedToggler, setRevisionSelectedToggler] = useState<boolean>(false);
  const [isModalExpanded, setIsModalExpanded] = useState<boolean>(false);

  const { t } = useTranslation();
  const { data: conflictDiffModalStatus, close: closeConflictDiffModal } = useConflictDiffModal();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.DIFF);

  // const { data: remoteRevisionId } = useRemoteRevisionId();
  // const { setRemoteLatestPageData } = useSetRemoteLatestPageData();
  // const { data: pageId } = useCurrentPageId();
  // const { data: currentPagePath } = useCurrentPagePath();
  // const { data: currentPathname } = useCurrentPathname();

  const selectRevisionHandler = useCallback((selectedRevision: string) => {
    setResolvedRevision(selectedRevision);
    setRevisionSelectedToggler(prev => !prev);

    if (!isRevisionselected) {
      setIsRevisionSelected(true);
    }
  }, [isRevisionselected]);

  const closeModalHandler = useCallback(() => {
    closeConflictDiffModal();
  }, [closeConflictDiffModal]);

  const resolveConflictHandler = useCallback(async() => {
    const newBody = codeMirrorEditor?.getDoc();
    if (newBody == null) {
      return;
    }

    conflictDiffModalStatus?.onResolveConflict?.(newBody);
  }, [codeMirrorEditor, conflictDiffModalStatus]);

  useEffect(() => {
    codeMirrorEditor?.initDoc(resolvedRevision);
    // Enable selecting the same revision after editing by including revisionSelectedToggler in the dependency array of useEffect
  }, [codeMirrorEditor, resolvedRevision, revisionSelectedToggler]);

  const headerButtons = useMemo(() => (
    <div className="d-flex align-items-center">
      <button type="button" className="btn" onClick={() => setIsModalExpanded(prev => !prev)}>
        <span className="material-symbols-outlined">{isModalExpanded ? 'close_fullscreen' : 'open_in_full'}</span>
      </button>
      <button type="button" className="btn" onClick={closeModalHandler} aria-label="Close">
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  ), [closeModalHandler, isModalExpanded]);

  return (
    <Modal isOpen={conflictDiffModalStatus?.isOpened} className={`${styles['conflict-diff-modal']} ${isModalExpanded ? ' grw-modal-expanded' : ''}`} size="xl">

      <ModalHeader tag="h4" className="d-flex align-items-center" close={headerButtons}>
        <span className="material-symbols-outlined me-1">error</span>{t('modal_resolve_conflict.resolve_conflict')}
      </ModalHeader>

      <ModalBody className="mx-4 my-1">
        <div className="row">
          <div className="col-12 text-center mt-2 mb-4">
            <h3 className="fw-bold text-muted">{t('modal_resolve_conflict.resolve_conflict_message')}</h3>
          </div>

          <div className="col-6">
            <h4 className="fw-bold my-2 text-muted">{t('modal_resolve_conflict.requested_revision')}</h4>
            <div className="d-flex align-items-center my-3">
              <div>
                <UserPicture user={request.user} size="lg" noLink noTooltip />
              </div>
              <div className="ms-3 text-muted">
                <p className="my-0">updated by {request.user.username}</p>
                <p className="my-0">{request.createdAt}</p>
              </div>
            </div>
          </div>

          <div className="col-6">
            <h4 className="fw-bold my-2 text-muted">{t('modal_resolve_conflict.latest_revision')}</h4>
            <div className="d-flex align-items-center my-3">
              <div>
                <UserPicture user={latest.user} size="lg" noLink noTooltip />
              </div>
              <div className="ms-3 text-muted">
                <p className="my-0">updated by {latest.user.username}</p>
                <p className="my-0">{latest.createdAt}</p>
              </div>
            </div>
          </div>

          <MergeViewer
            leftBody={request.revisionBody}
            rightBody={latest.revisionBody}
          />

          <div className="col-6">
            <div className="text-center my-4">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => { selectRevisionHandler(request.revisionBody) }}
              >
                <span className="material-symbols-outlined me-1">arrow_circle_down</span>
                {t('modal_resolve_conflict.select_revision', { revision: 'mine' })}
              </button>
            </div>
          </div>

          <div className="col-6">
            <div className="text-center my-4">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => { selectRevisionHandler(latest.revisionBody) }}
              >
                <span className="material-symbols-outlined me-1">arrow_circle_down</span>
                {t('modal_resolve_conflict.select_revision', { revision: 'theirs' })}
              </button>
            </div>
          </div>

          <div className="col-12">
            <div className="border border-dark">
              <h4 className="fw-bold my-2 mx-2 text-muted">{t('modal_resolve_conflict.selected_editable_revision')}</h4>
              <CodeMirrorEditorDiff />
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={closeModalHandler}
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          className="btn btn-primary ms-3"
          onClick={resolveConflictHandler}
          disabled={!isRevisionselected}
        >
          {t('modal_resolve_conflict.resolve_and_save')}
        </button>
      </ModalFooter>
    </Modal>
  );
};


export const ConflictDiffModal = (): JSX.Element => {
  const { data: currentUser } = useCurrentUser();

  // state for current page
  const { data: currentPage } = useSWRxCurrentPage();

  // state for latest page
  const { data: remoteRevisionId } = useRemoteRevisionId();
  const { data: remoteRevisionBody } = useRemoteRevisionBody();
  const { data: remoteRevisionLastUpdateUser } = useRemoteRevisionLastUpdateUser();
  const { data: remoteRevisionLastUpdatedAt } = useRemoteRevisionLastUpdatedAt();

  const { data: conflictDiffModalStatus } = useConflictDiffModal();

  const isRemotePageDataInappropriate = remoteRevisionId == null || remoteRevisionBody == null || remoteRevisionLastUpdateUser == null;

  if (!conflictDiffModalStatus?.isOpened || currentUser == null || currentPage == null || isRemotePageDataInappropriate) {
    return <></>;
  }

  const currentTime: Date = new Date();

  const request: IRevisionOnConflictWithStringDate = {
    revisionId: '',
    revisionBody: conflictDiffModalStatus.requestRevisionBody ?? '',
    createdAt: format(currentTime, 'yyyy/MM/dd HH:mm:ss'),
    user: currentUser,
  };

  const latest: IRevisionOnConflictWithStringDate = {
    revisionId: remoteRevisionId,
    revisionBody: remoteRevisionBody,
    createdAt: format(new Date(remoteRevisionLastUpdatedAt || currentTime.toString()), 'yyyy/MM/dd HH:mm:ss'),
    user: remoteRevisionLastUpdateUser,
  };

  return <ConflictDiffModalCore request={request} latest={latest} />;
};
