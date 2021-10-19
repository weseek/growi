import React, { useState, useEffect, FC } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import CodeMirror from 'codemirror/lib/codemirror';

require('codemirror/lib/codemirror.css');
require('codemirror/addon/merge/merge');
require('codemirror/addon/merge/merge.css');
const DMP = require('diff_match_patch');

Object.keys(DMP).forEach((key) => { window[key] = DMP[key] });




export const ConflictDiffModal: FC = () => {
  const [val, setVal] = useState('value 1'));
  const [orig, setOrig] = useState('value 2');
  const [codeMirrorRef, setCodeMirrorRef] = useState<HTMLDivElement | null>(null);

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

      // mvInstance.on('change', (editor) => {
      //   console.log(editor.getValue());
      // });
    }
  }, [codeMirrorRef, orig, val]);


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
