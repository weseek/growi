import React, { useState, useEffect, FC } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button,
} from 'reactstrap';
// import CodeMirror from 'codemirror/lib/codemirror';
import { useTranslation } from 'react-i18next';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import PageContainer from '../../client/services/PageContainer';

require('codemirror/addon/lint/css-lint');
require('codemirror/addon/hint/css-hint');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
require('codemirror/mode/css/css');
require('~/client/util/codemirror/autorefresh.ext');

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
  const [val, setVal] = useState('value 1');
  const [orig, setOrig] = useState('value 2');
  const [resolvedRevision, SetResolvedRevision] = useState<string>(INITIAL_TEXT);
  const [codeMirrorRef, setCodeMirrorRef] = useState<HTMLDivElement | null>(null);
  const { t } = useTranslation('');

  const { pageContainer } = props;


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
      catch (e) {
        console.log(e);
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
                <h2>{`Selected revision: ${val}`}</h2>
              </div>
              <div className="col-4 border border-dark">
                <h3 className="font-weight-bold">Previous Revision</h3>
                <CodeMirror
                  value={pageContainer.state.revisionsOnConflict?.request.revisionBody}
                  onChange={() => {
                  }}
                />
                <Button
                  outline
                  color="secondary"
                  size="sm"
                  className="btn-comment-reply"
                  onClick={() => { SetResolvedRevision(pageContainer.state.revisionsOnConflict?.request.revisionBody) }}
                >
                  <i className="icon-fw icon-action-undo"></i>Use previous
                </Button>
              </div>
              <div className="col-4 border border-dark">
                <h3 className="font-weight-bold">Original Revision</h3>
                <CodeMirror
                  value={pageContainer.state.revisionsOnConflict?.origin.revisionBody}
                />
                <Button
                  outline
                  color="secondary"
                  size="sm"
                  className="btn-comment-reply"
                  onClick={() => { SetResolvedRevision(pageContainer.state.revisionsOnConflict?.origin.revisionBody) }}
                >
                  <i className="icon-fw icon-action-undo"></i>Use Original
                </Button>
              </div>
              <div className="col-4 border border-dark">
                <h3 className="font-weight-bold">Latest Revision</h3>
                <CodeMirror
                  value={pageContainer.state.revisionsOnConflict?.latest.revisionBody}
                />
                <Button
                  outline
                  color="secondary"
                  size="sm"
                  className="btn-comment-reply"
                  onClick={() => { SetResolvedRevision(pageContainer.state.revisionsOnConflict?.latest.revisionBody) }}
                >
                  <i className="icon-fw icon-action-undo"></i>Use Latest
                </Button>
              </div>
              <div className="col-12 border border-dark">
                <h3>Selected Revision</h3>
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
          disabled={resolvedRevision === INITIAL_TEXT}
        >
          {t('Cancel')}
        </button>
        <button
          type="button"
          className="btn btn-outline-primary ml-3"
          onClick={onResolveConflict}
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
