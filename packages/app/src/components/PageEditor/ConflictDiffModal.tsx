import React, { useState, useRef, FC } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { parseISO, format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import PageContainer from '../../client/services/PageContainer';
import { toastError } from '../../client/util/apiNotification';

require('codemirror/addon/lint/css-lint');
require('codemirror/addon/hint/css-hint');
require('codemirror/addon/hint/show-hint');
require('codemirror/mode/css/css');
require('~/client/util/codemirror/autorefresh.ext');

require('codemirror/addon/hint/show-hint');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
require('codemirror/mode/htmlmixed/htmlmixed');
require('~/client/util/codemirror/autorefresh.ext');

require('jquery-ui/ui/widgets/resizable');


require('jquery-ui/ui/widgets/resizable');

const DMP = require('diff_match_patch');

const INITIAL_TEXT = 'Please select revision';

Object.keys(DMP).forEach((key) => { window[key] = DMP[key] });

type ConflictDiffModalProps = {
  isOpen: boolean | null;
  onCancel: (() => void) | null;
  pageContainer: PageContainer;
};

export const ConflictDiffModal: FC<ConflictDiffModalProps> = (props) => {
  const resolvedRevision = useRef<string>('');
  const [isUnselected, setIsUnselected] = useState<boolean>(false);
  const { t } = useTranslation('');

  const { pageContainer } = props;
  const { request, origin, latest } = pageContainer.state.revisionsOnConflict || { request: {}, origin: {}, latest: {} };


  const onCancel = () => {
    if (props.onCancel != null) {
      props.onCancel();
    }
  };

  const onResolveConflict = () : void => {
    pageContainer.setState({
      revisionId: pageContainer.state.revisionsOnConflict?.latest.revisionId,
    }, async() => {
      try {
        await pageContainer.save(resolvedRevision.current);
        window.location.href = pageContainer.state.path || '/';
      }
      catch (error) {
        toastError(error);
      }
    });
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
              <div className="col-4 border border-dark">
                <h3 className="font-weight-bold my-2">Request Revision</h3>
                <div className="d-flex align-items-center my-3">
                  <div>
                    <img height="40px" className="rounded-circle" src={request.userImgPath} />
                  </div>
                  <div className="ml-3">
                    <p className="my-0 text-muted">updated by {request.userName}</p>
                    <p className="my-0 text-muted">{format(parseISO(request.createdAt), 'yyyy/MM/dd HH:mm:ss')}</p>
                  </div>
                </div>
                <CodeMirror
                  value={pageContainer.state.revisionsOnConflict?.request.revisionBody}
                  options={{
                    mode: 'htmlmixed',
                    lineNumbers: true,
                    tabSize: 2,
                    indentUnit: 2,
                    readOnly: true,
                  }}
                />
                <div className="text-center my-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      resolvedRevision.current = pageContainer.state.revisionsOnConflict?.request.revisionBody;
                    }}
                  >
                    <i className="icon-fw icon-arrow-down-circle"></i>
                    {t('modal_resolve_conflict.select_revision', { revision: 'request' })}
                  </button>
                </div>
              </div>
              <div className="col-4 border border-dark">
                <h3 className="font-weight-bold my-2">Original Revision</h3>
                <div className="d-flex align-items-center my-3">
                  <div>
                    <img height="40px" className="rounded-circle" src={origin.userImgPath} />
                  </div>
                  <div className="ml-3">
                    <p className="my-0 text-muted">updated by {origin.userName}</p>
                    <p className="my-0 text-muted">{format(parseISO(origin.createdAt), 'yyyy/MM/dd HH:mm:ss')}</p>
                  </div>
                </div>
                <CodeMirror
                  value={pageContainer.state.revisionsOnConflict?.origin.revisionBody}
                  options={{
                    mode: 'htmlmixed',
                    lineNumbers: true,
                    tabSize: 2,
                    indentUnit: 2,
                    readOnly: true,
                  }}
                />
                <div className="text-center my-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      resolvedRevision.current = pageContainer.state.revisionsOnConflict?.origin.revisionBody;
                    }}
                  >
                    <i className="icon-fw icon-arrow-down-circle"></i>
                    {t('modal_resolve_conflict.select_revision', { revision: 'origin' })}
                  </button>
                </div>
              </div>
              <div className="col-4 border border-dark">
                <h3 className="font-weight-bold my-2">Latest Revision</h3>
                <div className="d-flex align-items-center my-3">
                  <div>
                    <img height="40px" className="rounded-circle" src={latest.userImgPath} />
                  </div>
                  <div className="ml-3">
                    <p className="my-0 text-muted">updated by {latest.userName}</p>
                    <p className="my-0 text-muted">{format(parseISO(latest.createdAt), 'yyyy/MM/dd HH:mm:ss')}</p>
                  </div>
                </div>
                <CodeMirror
                  value={pageContainer.state.revisionsOnConflict?.latest.revisionBody}
                  options={{
                    mode: 'htmlmixed',
                    lineNumbers: true,
                    tabSize: 2,
                    indentUnit: 2,
                    readOnly: true,
                  }}
                />
                <div className="text-center my-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      resolvedRevision.current = pageContainer.state.revisionsOnConflict?.latest.revisionBody;
                    }}
                  >
                    <i className="icon-fw icon-arrow-down-circle"></i>
                    {t('modal_resolve_conflict.select_revision', { revision: 'latest' })}
                  </button>
                </div>
              </div>
              <div className="col-12 border border-dark">
                <h3 className="font-weight-bold my-2">Selected Revision(Editable)</h3>
                <CodeMirror
                  value={resolvedRevision.current}
                  options={{
                    mode: 'htmlmixed',
                    lineNumbers: true,
                    tabSize: 2,
                    indentUnit: 2,
                  }}
                  onChange={(editorqq, dataqq, value) => {
                    // SetResolvedRevision(value);
                    // console.log(value);
                    resolvedRevision.current = value;
                    console.log('res:', resolvedRevision.current);
                  }}
                />
              </div>
            </div>
          )
        }
        {console.log('diff:', pageContainer?.state.revisionsOnConflict)}
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
          disabled={isUnselected}
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
};

ConflictDiffModal.defaultProps = {
  isOpen: false,
};
