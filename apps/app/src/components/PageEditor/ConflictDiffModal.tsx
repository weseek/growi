import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from 'react';

import {
  CodeMirrorEditor, GlobalCodeMirrorEditorKey, useCodeMirrorEditorIsolated
} from '@growi/editor';

import { MergeView } from '@codemirror/merge'

import type { IRevisionOnConflict } from '@growi/core';
import { UserPicture } from '@growi/ui/dist/components';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { useCurrentPathname, useCurrentUser } from '~/stores/context';
import { useCurrentPagePath, useSWRxCurrentPage, useCurrentPageId } from '~/stores/page';
import {
  useRemoteRevisionBody, useRemoteRevisionId, useRemoteRevisionLastUpdatedAt, useRemoteRevisionLastUpdateUser, useSetRemoteLatestPageData,
} from '~/stores/remote-latest-page';
const DMP = require('diff_match_patch');

Object.keys(DMP).forEach((key) => { window[key] = DMP[key] });

type ConflictDiffModalProps = {
  isOpen?: boolean;
  onClose?: (() => void);
  markdownOnEdit: string;
  // optionsToSave: OptionsToSave | undefined;
  // afterResolvedHandler: () => void,
};

type ConflictDiffModalCoreProps = {
  isOpen?: boolean;
  onClose?: (() => void);
  // optionsToSave: OptionsToSave | undefined;
  request: IRevisionOnConflictWithStringDate,
  latest: IRevisionOnConflictWithStringDate,
  // afterResolvedHandler: () => void,
};

type IRevisionOnConflictWithStringDate = Omit<IRevisionOnConflict, 'createdAt'> & {
  createdAt: string
}

const DiffViewer = (props: { requestRevisionBody: string, latestRevisionBody: string }) => {
  const { requestRevisionBody, latestRevisionBody } = props;
  const mergeViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mergeViewRef.current != null) {
      const view = new MergeView({
        a: {
            doc: requestRevisionBody.replace(/col1/g, "aaa") // あとで直す
        },
        b: {
            doc: latestRevisionBody
        },
        parent: mergeViewRef.current,
      });

      return () => view.destroy();
    }
  }, []);

  return <div ref={mergeViewRef} />;
};

const ConflictDiffModalCore = (props: ConflictDiffModalCoreProps): JSX.Element => {
  const {
    onClose, request, latest,
  } = props;

  const { t } = useTranslation('');
  const [resolvedRevision, setResolvedRevision] = useState<string>('');
  const [isRevisionselected, setIsRevisionSelected] = useState<boolean>(false);
  const [revisionSelectedToggler, setRevisionSelectedToggler] = useState<boolean>(false);

  const [isModalExpanded, setIsModalExpanded] = useState<boolean>(false);

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(GlobalCodeMirrorEditorKey.DIFF);

  // const [codeMirrorRef, setCodeMirrorRef] = useState<HTMLDivElement | null>(null);

  // const { data: remoteRevisionId } = useRemoteRevisionId();
  // const { setRemoteLatestPageData } = useSetRemoteLatestPageData();
  // const { data: pageId } = useCurrentPageId();
  // const { data: currentPagePath } = useCurrentPagePath();
  // const { data: currentPathname } = useCurrentPathname();


  const revisionSelectHandler = useCallback((selectedRevision: string) => {
    setResolvedRevision(selectedRevision);

    // Enable selecting the same revision after editing by including revisionSelectedToggler in the dependency array of useEffect
    setRevisionSelectedToggler(prev => !prev);
  }, []);

  const close = useCallback(() => {
    if (onClose != null) {
      onClose();
    }
  }, [onClose]);

  const isOpen = props.isOpen ?? false;

  useEffect(() => {
    codeMirrorEditor?.initDoc(resolvedRevision);
  }, [resolvedRevision, revisionSelectedToggler])

  return (
    <Modal
      isOpen={isOpen}
      toggle={close}
      backdrop="static"
      className={`${isModalExpanded ? ' grw-modal-expanded' : ''}`}
      size="xl"
    >
      <ModalHeader tag="h4" toggle={onClose} className="bg-primary text-light align-items-center py-3">
        <span className="material-symbols-outlined me-1">error</span>{t('modal_resolve_conflict.resolve_conflict')}
      </ModalHeader>
      <ModalBody className="mx-4 my-1">
        { isOpen
        && (
          <div className="row">
            <div className="col-12 text-center mt-2 mb-4">
              <h2 className="fw-bold">{t('modal_resolve_conflict.resolve_conflict_message')}</h2>
            </div>
            <div className="col-6">
              <h3 className="fw-bold my-2">{t('modal_resolve_conflict.requested_revision')}</h3>
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
              <h3 className="fw-bold my-2">{t('modal_resolve_conflict.latest_revision')}</h3>
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

            <DiffViewer
              requestRevisionBody={request.revisionBody}
              latestRevisionBody={latest.revisionBody}
             />

            <div className="col-6">
              <div className="text-center my-4">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setIsRevisionSelected(true);
                    revisionSelectHandler(request.revisionBody);
                  }}
                >
                  <span className="material-symbols-outlined">arrow_circle_down</span>
                  {t('modal_resolve_conflict.select_revision', { revision: 'mine' })}
                </button>
              </div>
            </div>

            <div className="col-6">
              <div className="text-center my-4">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setIsRevisionSelected(true);
                    revisionSelectHandler(latest.revisionBody);
                  }}
                >
                  <span className="material-symbols-outlined">arrow_circle_down</span>
                  {t('modal_resolve_conflict.select_revision', { revision: 'theirs' })}
                </button>
              </div>
            </div>
            <div className="col-12">
              <div className="border border-dark">
                <h3 className="fw-bold my-2 mx-2">{t('modal_resolve_conflict.selected_editable_revision')}</h3>
                <CodeMirrorEditor
                  editorKey={GlobalCodeMirrorEditorKey.DIFF}
                />
              </div>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onClose}
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          className="btn btn-primary ms-3"
          // onClick={onResolveConflict}
          disabled={!isRevisionselected}
        >
          {t('modal_resolve_conflict.resolve_and_save')}
        </button>
      </ModalFooter>
    </Modal>
  );
};


export const ConflictDiffModal = (props: ConflictDiffModalProps): JSX.Element => {
  const {
    isOpen, onClose,
  } = props;
  const { data: currentUser } = useCurrentUser();

  // state for current page
  const { data: currentPage } = useSWRxCurrentPage();

  // state for latest page
  const { data: remoteRevisionId } = useRemoteRevisionId();
  const { data: remoteRevisionBody } = useRemoteRevisionBody();
  const { data: remoteRevisionLastUpdateUser } = useRemoteRevisionLastUpdateUser();
  const { data: remoteRevisionLastUpdatedAt } = useRemoteRevisionLastUpdatedAt();

  const currentTime: Date = new Date();

  const isRemotePageDataInappropriate = remoteRevisionId == null || remoteRevisionBody == null || remoteRevisionLastUpdateUser == null;

  if (!isOpen || currentUser == null || currentPage == null) {
    return <></>;
  }

  const request: IRevisionOnConflictWithStringDate = {
    revisionId: '',
    revisionBody: props.markdownOnEdit,
    createdAt: format(currentTime, 'yyyy/MM/dd HH:mm:ss'),
    user: currentUser,
  };

  const latest: IRevisionOnConflictWithStringDate = {
    revisionId: '',
    revisionBody: props.markdownOnEdit,
    createdAt: format(currentTime, 'yyyy/MM/dd HH:mm:ss'),
    user: currentUser,
  };

  // const latest: IRevisionOnConflictWithStringDate = {
  //   revisionId: remoteRevisionId,
  //   revisionBody: remoteRevisionBody,
  //   createdAt: format(new Date(remoteRevisionLastUpdatedAt || currentTime.toString()), 'yyyy/MM/dd HH:mm:ss'),
  //   user: remoteRevisionLastUpdateUser,
  // };

  const propsForCore = {
    isOpen,
    onClose,
    request,
    latest,
  };

  return <ConflictDiffModalCore {...propsForCore} />;
};
