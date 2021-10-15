import React, { useState, useEffect, FC } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import CodeMirror from 'codemirror/lib/codemirror';

require('codemirror/lib/codemirror.css');
require('codemirror/addon/merge/merge');
require('codemirror/addon/merge/merge.css');
const DMP = require('diff_match_patch');

Object.keys(DMP).forEach((key) => { window[key] = DMP[key] });


const val1 = 'blah laha';

const val2 = 'blah blah';


export const ConflictDiffModal: FC = () => {


  const [val, setVal] = useState(val1);
  const [orig, setOrig] = useState(val2);
  const [codeMirrorRef, setCodeMirrorRef] = useState<HTMLDivElement | null>(null);
  const [vm, setVm] = useState();


  useEffect(() => {
    if (codeMirrorRef) {
      setVm(CodeMirror.MergeView(codeMirrorRef, {
        value: val,
        origLeft: orig,
        origRight: null,
        allowEditingOriginals: false,
        lineNumbers: true,
        highlightDifferences: true,
        collapseIdentical: true,
        connect: 'align',
      }));
    }
  }, [codeMirrorRef, val, orig]);

  useEffect(() => {
    console.log(vm);
  }, [vm]);


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
