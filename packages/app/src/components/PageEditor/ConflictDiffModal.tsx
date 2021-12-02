import React, { useState, useRef, FC } from 'react';
import PropTypes from 'prop-types';
import { UserPicture } from '@growi/ui';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { useTranslation } from 'react-i18next';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { format } from 'date-fns';
import PageContainer from '../../client/services/PageContainer';
import EditorContainer from '../../client/services/EditorContainer';
import AppContainer from '../../client/services/AppContainer';

import { IRevisionOnConflict } from '../../interfaces/revision';
import { UncontrolledCodeMirror } from '../UncontrolledCodeMirror';

require('codemirror/mode/htmlmixed/htmlmixed');
const DMP = require('diff_match_patch');

Object.keys(DMP).forEach((key) => { window[key] = DMP[key] });

type ConflictDiffModalProps = {
  isOpen: boolean | null;
  onCancel: (() => void) | null;
  pageContainer: PageContainer;
  editorContainer: EditorContainer;
  appContainer: AppContainer;
  markdownOnEdit: string;
};

type IRevisionOnConflictWithStringDate = Omit<IRevisionOnConflict, 'createdAt'> & {
  createdAt: string
}

export const ConflictDiffModal: FC<ConflictDiffModalProps> = (props) => {
  const { t } = useTranslation('');
  const resolvedRevision = useRef<string>('');
  const [isRevisionselected, setIsRevisionSelected] = useState<boolean>(false);

  const { pageContainer, editorContainer, appContainer } = props;

  const currentTime: Date = new Date();

  const request: IRevisionOnConflictWithStringDate = {
    revisionId: '',
    revisionBody: props.markdownOnEdit,
    createdAt: format(currentTime, 'yyyy/MM/dd HH:mm:ss'),
    user: appContainer.currentUser,
  };
  const origin: IRevisionOnConflictWithStringDate = {
    revisionId: pageContainer.state.revisionId || '',
    revisionBody: pageContainer.state.markdown || '',
    createdAt: pageContainer.state.updatedAt || '',
    user: pageContainer.state.revisionAuthor,
  };
  const latest: IRevisionOnConflictWithStringDate = {
    revisionId: pageContainer.state.remoteRevisionId || '',
    revisionBody: pageContainer.state.remoteRevisionBody || '',
    createdAt: format(new Date(pageContainer.state.remoteRevisionUpdateAt || currentTime.toString()), 'yyyy/MM/dd HH:mm:ss'),
    user: pageContainer.state.lastUpdateUser,
  };

  const codeMirrorRevisionOption = {
    mode: 'htmlmixed',
    lineNumbers: true,
    tabSize: 2,
    indentUnit: 2,
    readOnly: true,
  };

  const onCancel = () => {
    if (props.onCancel != null) {
      props.onCancel();
    }
  };

  const onResolveConflict = async() : Promise<void> => {
    // disable button after clicked
    setIsRevisionSelected(false);
    editorContainer.disableUnsavedWarning();
    try {
      await pageContainer.resolveConflictAndReload(
        pageContainer.state.pageId,
        latest.revisionId,
        resolvedRevision.current,
        editorContainer.getCurrentOptionsToSave(),
      );
    }
    catch (error) {
      pageContainer.showErrorToastr(error);
    }
  };

  return (
    <Modal isOpen={props.isOpen || false} toggle={onCancel} className="modal-gfm-cheatsheet" size="xl">
      <ModalHeader tag="h4" toggle={onCancel} className="bg-primary text-light">
        <i className="icon-fw icon-exclamation" />{t('modal_resolve_conflict.resolve_conflict')}
      </ModalHeader>
      <ModalBody>
        {
          pageContainer.state.isConflictDiffModalOpen
          && (
            <div className="row mx-2">
              <div className="col-12 text-center mt-2 mb-4">
                <h2 className="font-weight-bold">{t('modal_resolve_conflict.resolve_conflict_message')}</h2>
              </div>
              <div className="col-12 col-md-4 border border-dark">
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
                <CodeMirror
                  value={request.revisionBody}
                  options={codeMirrorRevisionOption}
                />
                <div className="text-center my-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setIsRevisionSelected(true);
                      resolvedRevision.current = request.revisionBody;
                    }}
                  >
                    <i className="icon-fw icon-arrow-down-circle"></i>
                    {t('modal_resolve_conflict.select_revision', { revision: 'request' })}
                  </button>
                </div>
              </div>
              <div className="col-12 col-md-4 border border-dark">
                <h3 className="font-weight-bold my-2">{t('origin_revision')}</h3>
                <div className="d-flex align-items-center my-3">
                  <div>
                    <UserPicture user={origin.user} size="lg" noLink noTooltip />
                  </div>
                  <div className="ml-3 text-muted">
                    <p className="my-0">updated by {origin.user.username}</p>
                    <p className="my-0">{origin.createdAt}</p>
                  </div>
                </div>
                <CodeMirror
                  value={origin.revisionBody}
                  options={codeMirrorRevisionOption}
                />
                <div className="text-center my-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setIsRevisionSelected(true);
                      if (resolvedRevision != null) {
                        resolvedRevision.current = origin.revisionBody;
                      }
                    }}
                  >
                    <i className="icon-fw icon-arrow-down-circle"></i>
                    {t('modal_resolve_conflict.select_revision', { revision: 'origin' })}
                  </button>
                </div>
              </div>
              <div className="col-12 col-md-4 border border-dark">
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
                <CodeMirror
                  value={latest.revisionBody}
                  options={codeMirrorRevisionOption}
                />
                <div className="text-center my-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setIsRevisionSelected(true);
                      resolvedRevision.current = latest.revisionBody;
                    }}
                  >
                    <i className="icon-fw icon-arrow-down-circle"></i>
                    {t('modal_resolve_conflict.select_revision', { revision: 'latest' })}
                  </button>
                </div>
              </div>
              <div className="col-12 border border-dark">
                <h3 className="font-weight-bold my-2">{t('modal_resolve_conflict.selected_editable_revision')}</h3>
                <UncontrolledCodeMirror
                  value={resolvedRevision.current}
                  options={{
                    placeholder: t('modal_resolve_conflict.resolve_conflict_message'),
                  }}
                  onChange={(editor, data, pageBody) => {
                    if (pageBody === '') setIsRevisionSelected(false);
                    resolvedRevision.current = pageBody;
                  }}
                />
              </div>
            </div>
          )
        }
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
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

ConflictDiffModal.propTypes = {
  isOpen: PropTypes.bool,
  onCancel: PropTypes.func,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer:  PropTypes.instanceOf(EditorContainer).isRequired,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  markdownOnEdit: PropTypes.string.isRequired,
};

ConflictDiffModal.defaultProps = {
  isOpen: false,
};
