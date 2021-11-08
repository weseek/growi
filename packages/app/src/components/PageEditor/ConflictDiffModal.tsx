import React, { useState, useRef, FC } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { parseISO, format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import PageContainer from '../../client/services/PageContainer';
import EditorContainer from '../../client/services/EditorContainer';

require('codemirror/mode/htmlmixed/htmlmixed');


const DMP = require('diff_match_patch');

Object.keys(DMP).forEach((key) => { window[key] = DMP[key] });

type ConflictDiffModalProps = {
  isOpen: boolean | null;
  onCancel: (() => void) | null;
  pageContainer: PageContainer;
  editorContainer: EditorContainer;
};

export const ConflictDiffModal: FC<ConflictDiffModalProps> = (props) => {
  const { t } = useTranslation('');
  const resolvedRevision = useRef<string>(t('modal_resolve_conflict.resolve_conflict_message'));
  const [isRevisionselected, setIsRevisionSelected] = useState<boolean>(false);

  const { pageContainer, editorContainer } = props;
  const { request, origin, latest } = pageContainer.state.revisionsOnConflict || { request: {}, origin: {}, latest: {} };

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
    try {
      await pageContainer.resolveConflictAndReload(
        pageContainer.state.pageId,
        latest.revisionId,
        resolvedRevision.current, editorContainer.getCurrentOptionsToSave(),
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
        {Object.keys(pageContainer.state.revisionsOnConflict || {}).length > 0
          && (
            <div className="row mx-2">
              <div className="col-12 text-center mt-2 mb-4">
                <h2 className="font-weight-bold">{t('modal_resolve_conflict.resolve_conflict_message')}</h2>
              </div>
              <div className="col-12 col-md-4 border border-dark">
                <h3 className="font-weight-bold my-2">{t('modal_resolve_conflict.requested_revision')}</h3>
                <div className="d-flex align-items-center my-3">
                  <div>
                    <img height="40px" className="rounded-circle" src={request.userImgPath} />
                  </div>
                  <div className="ml-3 text-muted">
                    <p className="my-0">updated by {request.userName}</p>
                    <p className="my-0">{format(parseISO(request.createdAt), 'yyyy/MM/dd HH:mm:ss')}</p>
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
                    <img height="40px" className="rounded-circle" src={origin.userImgPath} />
                  </div>
                  <div className="ml-3 text-muted">
                    <p className="my-0">updated by {origin.userName}</p>
                    <p className="my-0">{format(parseISO(origin.createdAt), 'yyyy/MM/dd HH:mm:ss')}</p>
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
                      resolvedRevision.current = origin.revisionBody;
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
                    <img height="40px" className="rounded-circle" src={latest.userImgPath} />
                  </div>
                  <div className="ml-3 text-muted">
                    <p className="my-0">updated by {latest.userName}</p>
                    <p className="my-0">{format(parseISO(latest.createdAt), 'yyyy/MM/dd HH:mm:ss')}</p>
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
                <CodeMirror
                  value={resolvedRevision.current}
                  options={{
                    mode: 'htmlmixed',
                    lineNumbers: true,
                    tabSize: 2,
                    indentUnit: 2,
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
};

ConflictDiffModal.defaultProps = {
  isOpen: false,
};
