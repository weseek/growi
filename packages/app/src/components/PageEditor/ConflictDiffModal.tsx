import React, { useState, FC } from 'react';
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
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
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

const INITIAL_TEXT = 'Please choose revision';

Object.keys(DMP).forEach((key) => { window[key] = DMP[key] });

type ConflictDiffModalProps = {
  isOpen: boolean | null;
  onCancel: (() => void) | null;
  pageContainer: PageContainer;
};

export const ConflictDiffModal: FC<ConflictDiffModalProps> = (props) => {
  const [resolvedRevision, SetResolvedRevision] = useState<string>(INITIAL_TEXT);
  const { t } = useTranslation('');

  const { pageContainer } = props;
  const { request, origin, latest } = pageContainer.state.revisionsOnConflict;


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
        await pageContainer.save(resolvedRevision);
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
                <div className="d-flex">
                  <p>{format(parseISO(request.createdAt), 'yyyy/MM/dd HH:mm:ss')}</p>
                  <img className="border-rounded" src={request.userImgPath} />
                </div>
                <CodeMirror
                  value={pageContainer.state.revisionsOnConflict?.request.revisionBody}
                  options={{
                    mode: 'htmlmixed',
                    lineNumbers: true,
                    tabSize: 2,
                    indentUnit: 2,
                    matchBrackets: true,
                    autoCloseBrackets: true,
                  }}
                />
                <div className="text-center my-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => { SetResolvedRevision(pageContainer.state.revisionsOnConflict?.request.revisionBody) }}
                  >
                    <i className="icon-fw icon-action-redo"></i>
                    {t('modal_resolve_conflict.resolve_and_save')}
                  </button>
                </div>
              </div>
              <div className="col-4 border border-dark">
                <h3 className="font-weight-bold my-2">Original Revision</h3>
                <div className="d-flex">
                  <p>{format(parseISO(origin.createdAt), 'yyyy/MM/dd HH:mm:ss')}</p>
                  <img className="border-rounded" src={origin.userImgPath} />
                </div>
                <CodeMirror
                  value={pageContainer.state.revisionsOnConflict?.origin.revisionBody}
                  options={{
                    mode: 'htmlmixed',
                    lineNumbers: true,
                    tabSize: 2,
                    indentUnit: 2,
                    matchBrackets: true,
                    autoCloseBrackets: true,
                  }}
                />
                <div className="text-center my-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => { SetResolvedRevision(pageContainer.state.revisionsOnConflict?.origin.revisionBody) }}
                  >
                    <i className="icon-fw icon-action-redo"></i>
                    {t('modal_resolve_conflict.resolve_and_save')}
                  </button>
                </div>
              </div>
              <div className="col-4 border border-dark">
                <h3 className="font-weight-bold my-2">Latest Revision</h3>
                <div className="d-flex">
                  <p>{format(parseISO(latest.createdAt), 'yyyy/MM/dd HH:mm:ss')}</p>
                  <img className="border-rounded" src={latest.userImgPath} />
                </div>
                <CodeMirror
                  value={pageContainer.state.revisionsOnConflict?.latest.revisionBody}
                  options={{
                    mode: 'htmlmixed',
                    lineNumbers: true,
                    tabSize: 2,
                    indentUnit: 2,
                    matchBrackets: true,
                    autoCloseBrackets: true,
                  }}
                />
                <div className="text-center my-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => { SetResolvedRevision(pageContainer.state.revisionsOnConflict?.latest.revisionBody) }}
                  >
                    <i className="icon-fw icon-action-redo"></i>
                    {t('modal_resolve_conflict.resolve_and_save')}
                  </button>
                </div>
              </div>
              <div className="col-12 border border-dark">
                <h3 className="font-weight-bold my-2">Selected Revision</h3>
                <CodeMirror
                  value={resolvedRevision}
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
          disabled={resolvedRevision === INITIAL_TEXT}
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
