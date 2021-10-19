import React, { useState, useEffect, FC } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import CodeMirror from 'codemirror/lib/codemirror';
import { useTranslation } from 'react-i18next';

require('codemirror/lib/codemirror.css');
require('codemirror/addon/merge/merge');
require('codemirror/addon/merge/merge.css');
const DMP = require('diff_match_patch');

Object.keys(DMP).forEach((key) => { window[key] = DMP[key] });

type ConflictDiffModalProps = {
  isOpen: boolean | null;
  onCancel: (() => void) | null;
  onResolveConflict: (() => void) | null;
};

export const ConflictDiffModal: FC<ConflictDiffModalProps> = (props) => {
  const [val, setVal] = useState('value 1');
  const [orig, setOrig] = useState('value 2');
  const [codeMirrorRef, setCodeMirrorRef] = useState<HTMLDivElement | null>(null);
  const { t } = useTranslation('');

  useEffect(() => {
    if (codeMirrorRef) {
      CodeMirror.MergeView(codeMirrorRef, {
        value: val,
        origLeft: orig,
        origRight: null,
        connect: 'align',
        lineNumbers: true,
        collapseIdentical: true,
        highlightDifferences: true,
        allowEditingOriginals: false,
      });
    }
  }, [codeMirrorRef, orig, val]);

  const onCancel = () => {
    if (props.onCancel != null) {
      props.onCancel();
    }
  };

  const onResolveConflict = () => {
    if (props.onResolveConflict != null) {
      props.onResolveConflict();
    }
  };

  return (
    <Modal isOpen={props.isOpen || false} toggle={onCancel} className="modal-gfm-cheatsheet">
      <ModalHeader tag="h4" toggle={onCancel} className="bg-primary text-light">
        <i className="icon-fw icon-exclamation" />{t('modal_resolve_conflict.title')}
      </ModalHeader>
      <ModalBody>
        <div ref={(el) => { setCodeMirrorRef(el) }}></div>
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
  onResolveConflict: PropTypes.func,
};

ConflictDiffModal.defaultProps = {
  isOpen: false,
};
