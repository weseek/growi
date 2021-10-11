import React, {
  useState, useEffect, useRef, FC,
} from 'react';
import {
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';
import CodeMirror from 'codemirror';

import('codemirror/addon/merge/merge');

export const ConflictDiffModal: FC = () => {

  const codeMirrorRef = useRef(null);

  const [val, setVal] = useState('');
  const [orig, setOrig] = useState('');


  useEffect(() => {
    CodeMirror.MergeView(codeMirrorRef.current, {
      value: val,
      origLeft: orig,
      origRight: null,
      allowEditingOriginals: true,
      gutters: ['CodeMirror-lint-markers'],
      lint: true,
      connect: 'align',
    });
  });

  return (
    <Modal isOpen className="modal-gfm-cheatsheet">
      <ModalHeader tag="h4" className="bg-primary text-light">
        <i className="icon-fw icon-question" />Markdown help
      </ModalHeader>
      <ModalBody>
        <div ref={codeMirrorRef} />
      </ModalBody>
    </Modal>
  );
};
