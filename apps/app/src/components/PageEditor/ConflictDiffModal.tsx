import React, {
  useState, useEffect, useRef, useMemo, useCallback,
} from 'react';

import type { IRevisionOnConflict } from '@growi/core/dist/interfaces';
import { UserPicture } from '@growi/ui/dist/components';
import CodeMirror from 'codemirror/lib/codemirror';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { useSaveOrUpdate } from '~/client/services/page-operation';
import { toastError, toastSuccess } from '~/client/util/toastr';
import { OptionsToSave } from '~/interfaces/page-operation';
import { useCurrentPathname, useCurrentUser } from '~/stores/context';
import { useCurrentPagePath, useSWRxCurrentPage, useCurrentPageId } from '~/stores/page';
import {
  useRemoteRevisionBody, useRemoteRevisionId, useRemoteRevisionLastUpdatedAt, useRemoteRevisionLastUpdateUser, useSetRemoteLatestPageData,
} from '~/stores/remote-latest-page';

import ExpandOrContractButton from '../ExpandOrContractButton';
import { UncontrolledCodeMirror } from '../UncontrolledCodeMirror';

require('codemirror/lib/codemirror.css');
require('codemirror/addon/merge/merge');
require('codemirror/addon/merge/merge.css');
const DMP = require('diff_match_patch');

Object.keys(DMP).forEach((key) => { window[key] = DMP[key] });

type ConflictDiffModalProps = {
  isOpen?: boolean;
  onClose?: (() => void);
  markdownOnEdit: string;
  optionsToSave: OptionsToSave | undefined;
  afterResolvedHandler: () => void,
};

type ConflictDiffModalCoreProps = {
  isOpen?: boolean;
  onClose?: (() => void);
  optionsToSave: OptionsToSave | undefined;
  request: IRevisionOnConflictWithStringDate,
  origin: IRevisionOnConflictWithStringDate,
  latest: IRevisionOnConflictWithStringDate,
  afterResolvedHandler: () => void,
};

type IRevisionOnConflictWithStringDate = Omit<IRevisionOnConflict, 'createdAt'> & {
  createdAt: string
}

const ConflictDiffModalCore = (props: ConflictDiffModalCoreProps): JSX.Element => {
  const {
    onClose, request, origin, latest, optionsToSave, afterResolvedHandler,
  } = props;

  const { t } = useTranslation('');
  const [resolvedRevision, setResolvedRevision] = useState<string>('');
  const [isRevisionselected, setIsRevisionSelected] = useState<boolean>(false);
  const [isModalExpanded, setIsModalExpanded] = useState<boolean>(false);
  const [codeMirrorRef, setCodeMirrorRef] = useState<HTMLDivElement | null>(null);

  const { data: remoteRevisionId } = useRemoteRevisionId();
  const { setRemoteLatestPageData } = useSetRemoteLatestPageData();
  const { data: pageId } = useCurrentPageId();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: currentPathname } = useCurrentPathname();

  const saveOrUpdate = useSaveOrUpdate();

  const uncontrolledRef = useRef<CodeMirror>(null);

  useEffect(() => {
    if (codeMirrorRef != null) {
      CodeMirror.MergeView(codeMirrorRef, {
        value: origin.revisionBody,
        origLeft: request.revisionBody,
        origRight: latest.revisionBody,
        lineNumbers: true,
        collapseIdentical: true,
        showDifferences: true,
        highlightDifferences: true,
        connect: 'connect',
        readOnly: true,
        revertButtons: false,
      });
    }
  }, [codeMirrorRef, origin.revisionBody, request.revisionBody, latest.revisionBody]);

  const close = useCallback(() => {
    if (onClose != null) {
      onClose();
    }
  }, [onClose]);

  const onResolveConflict = useCallback(async() => {
    if (currentPathname == null) { return }
    // disable button after clicked
    setIsRevisionSelected(false);

    const codeMirrorVal = uncontrolledRef.current?.editor.doc.getValue();

    try {
      const { page } = await saveOrUpdate(
        codeMirrorVal,
        { pageId, path: currentPagePath || currentPathname, revisionId: remoteRevisionId },
        optionsToSave,
      );
      const remotePageData = {
        remoteRevisionId: page.revision._id,
        remoteRevisionBody: page.revision.body,
        remoteRevisionLastUpdateUser: page.lastUpdateUser,
        remoteRevisionLastUpdatedAt: page.updatedAt,
        revisionIdHackmdSynced: page.revisionIdHackmdSynced,
        hasDraftOnHackmd: page.hasDraftOnHackmd,
      };
      setRemoteLatestPageData(remotePageData);
      afterResolvedHandler();

      close();

      toastSuccess('Saved successfully');
    }
    catch (error) {
      toastError(`Error occured: ${error.message}`);
    }

  }, [afterResolvedHandler, close, currentPagePath, currentPathname, optionsToSave, pageId, remoteRevisionId, saveOrUpdate, setRemoteLatestPageData]);

  const resizeAndCloseButtons = useMemo(() => (
    <div className="d-flex flex-nowrap">
      <ExpandOrContractButton
        isWindowExpanded={isModalExpanded}
        expandWindow={() => setIsModalExpanded(true)}
        contractWindow={() => setIsModalExpanded(false)}
      />
      <button type="button" className="close text-white" onClick={close} aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  ), [isModalExpanded, close]);

  const isOpen = props.isOpen ?? false;

  return (
    <Modal
      isOpen={isOpen}
      toggle={close}
      backdrop="static"
      className={`${isModalExpanded ? ' grw-modal-expanded' : ''}`}
      size="xl"
    >
      <ModalHeader tag="h4" toggle={onClose} className="bg-primary text-light align-items-center py-3" close={resizeAndCloseButtons}>
        <i className="icon-fw icon-exclamation" />{t('modal_resolve_conflict.resolve_conflict')}
      </ModalHeader>
      <ModalBody className="mx-4 my-1">
        { isOpen
        && (
          <div className="row">
            <div className="col-12 text-center mt-2 mb-4">
              <h2 className="font-weight-bold">{t('modal_resolve_conflict.resolve_conflict_message')}</h2>
            </div>
            <div className="col-4">
              <h3 className="font-weight-bold my-2">{t('modal_resolve_conflict.requested_revision')}</h3>
              <div className="d-flex align-items-center my-3">
                <div>
                  <UserPicture user={request.user} size="lg" noLink noTooltip />
                </div>
                <div className="ml-3 text-muted">
                  <p className="my-0">updated by {request.user.username}</p>
                  <p className="my-0">{request.createdAt}</p>
                </div>
              </div>
            </div>
            <div className="col-4">
              <h3 className="font-weight-bold my-2">{t('modal_resolve_conflict.origin_revision')}</h3>
              <div className="d-flex align-items-center my-3">
                <div>
                  <UserPicture user={origin.user} size="lg" noLink noTooltip />
                </div>
                <div className="ml-3 text-muted">
                  <p className="my-0">updated by {origin.user.username}</p>
                  <p className="my-0">{origin.createdAt}</p>
                </div>
              </div>
            </div>
            <div className="col-4">
              <h3 className="font-weight-bold my-2">{t('modal_resolve_conflict.latest_revision')}</h3>
              <div className="d-flex align-items-center my-3">
                <div>
                  <UserPicture user={latest.user} size="lg" noLink noTooltip />
                </div>
                <div className="ml-3 text-muted">
                  <p className="my-0">updated by {latest.user.username}</p>
                  <p className="my-0">{latest.createdAt}</p>
                </div>
              </div>
            </div>
            <div className="col-12" ref={(el) => { setCodeMirrorRef(el) }}></div>
            <div className="col-4">
              <div className="text-center my-4">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setIsRevisionSelected(true);
                    setResolvedRevision(request.revisionBody);
                  }}
                >
                  <i className="icon-fw icon-arrow-down-circle"></i>
                  {t('modal_resolve_conflict.select_revision', { revision: 'mine' })}
                </button>
              </div>
            </div>
            <div className="col-4">
              <div className="text-center my-4">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setIsRevisionSelected(true);
                    setResolvedRevision(origin.revisionBody);
                  }}
                >
                  <i className="icon-fw icon-arrow-down-circle"></i>
                  {t('modal_resolve_conflict.select_revision', { revision: 'origin' })}
                </button>
              </div>
            </div>
            <div className="col-4">
              <div className="text-center my-4">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setIsRevisionSelected(true);
                    setResolvedRevision(latest.revisionBody);
                  }}
                >
                  <i className="icon-fw icon-arrow-down-circle"></i>
                  {t('modal_resolve_conflict.select_revision', { revision: 'theirs' })}
                </button>
              </div>
            </div>
            <div className="col-12">
              <div className="border border-dark">
                <h3 className="font-weight-bold my-2 mx-2">{t('modal_resolve_conflict.selected_editable_revision')}</h3>
                <UncontrolledCodeMirror
                  ref={uncontrolledRef}
                  value={resolvedRevision}
                  options={{
                    placeholder: t('modal_resolve_conflict.resolve_conflict_message'),
                  }}
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
          className="btn btn-primary ml-3"
          onClick={onResolveConflict}
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
    isOpen, onClose, optionsToSave, afterResolvedHandler,
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

  if (!isOpen || currentUser == null || currentPage == null || isRemotePageDataInappropriate) {
    return <></>;
  }

  const currentPageCreatedAtFixed = typeof currentPage.updatedAt === 'string'
    ? parseISO(currentPage.updatedAt)
    : currentPage.updatedAt;

  const request: IRevisionOnConflictWithStringDate = {
    revisionId: '',
    revisionBody: props.markdownOnEdit,
    createdAt: format(currentTime, 'yyyy/MM/dd HH:mm:ss'),
    user: currentUser,
  };
  const origin: IRevisionOnConflictWithStringDate = {
    revisionId: currentPage?.revision._id,
    revisionBody: currentPage?.revision.body,
    createdAt: format(currentPageCreatedAtFixed, 'yyyy/MM/dd HH:mm:ss'),
    user: currentPage?.lastUpdateUser,
  };
  const latest: IRevisionOnConflictWithStringDate = {
    revisionId: remoteRevisionId,
    revisionBody: remoteRevisionBody,
    createdAt: format(new Date(remoteRevisionLastUpdatedAt || currentTime.toString()), 'yyyy/MM/dd HH:mm:ss'),
    user: remoteRevisionLastUpdateUser,
  };

  const propsForCore = {
    isOpen,
    onClose,
    optionsToSave,
    request,
    origin,
    latest,
    afterResolvedHandler,
  };

  return <ConflictDiffModalCore {...propsForCore}/>;
};
