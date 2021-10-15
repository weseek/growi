import React, { useState, useEffect, FC } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import CodeMirror from 'codemirror/lib/codemirror';
// import { JSHINT } from 'jshint';

require('codemirror/addon/merge/merge');
require('codemirror/lib/codemirror.css');
require('codemirror/addon/merge/merge.css');
require('codemirror/addon/merge/merge');


// Object.keys(JSHINT).forEach((key) => { window[key] = JSHINT[key] });
const DMP = require('diff_match_patch');

Object.keys(DMP).forEach((key) => { window[key] = DMP[key] });

export const ConflictDiffModal: FC = () => {


  const [val, setVal] = useState('Test Value');
  const [orig, setOrig] = useState('Original Value');
  const [codeMirrorRef, setCodeMirrorRef] = useState<HTMLDivElement | null>(null);

  const mergeViewOptions = {
    // theme: 'eclipse',
    value: val,
    origLeft: orig,
    origRight: null,
    allowEditingOriginals: false,
    lineNumbers: true,
    highlightDifferences: true,
    connect: 'align',
  };

  useEffect(() => {
    if (codeMirrorRef) {
      CodeMirror.MergeView(codeMirrorRef, mergeViewOptions);
    }
  }, [codeMirrorRef]);


  return (
    <Modal isOpen className="modal-gfm-cheatsheet">
      <ModalHeader tag="h4" className="bg-primary text-light">
        <i className="icon-fw icon-question" />Resolve Conflict
      </ModalHeader>
      <ModalBody>
        <div ref={(el) => { setCodeMirrorRef(el) }}></div>
      </ModalBody>
    </Modal>
  );
};
