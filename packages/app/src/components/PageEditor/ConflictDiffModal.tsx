import React, {
  useState, useEffect, useRef, FC, createElement,
} from 'react';
import ReactDOM from 'react-dom';
import {
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';
import CodeMirror from 'codemirror/lib/codemirror';
import { JSHINT } from 'jshint';

require('codemirror/addon/merge/merge');
require('codemirror/lib/codemirror.css');
require('codemirror/theme/eclipse.css');
require('codemirror/theme/neat.css');
require('codemirror/addon/lint/lint.css');
require('codemirror/addon/merge/merge.css');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/lint/lint');
require('codemirror/addon/lint/javascript-lint');
require('codemirror/addon/merge/merge');


Object.keys(JSHINT).forEach((key) => { window[key] = JSHINT[key] });
const DMP = require('diff_match_patch');

Object.keys(DMP).forEach((key) => { window[key] = DMP[key] });

export const ConflictDiffModal: FC = () => {

  const codeMirrorRef = useRef<HTMLDivElement | null>(null);

  const [val, setVal] = useState('Test Value');
  const [orig, setOrig] = useState('Original Value');

  useEffect(() => {
    const containerElem = document.getElementById('cm-mv');
    const DivElem = createElement('div');
    console.log(containerElem);
    CodeMirror.MergeView(DivElem, {
      theme: 'eclipse',
      value: val,
      origLeft: null,
      origRight: orig,
      allowEditingOriginals: true,
      lineNumbers: true,
      mode: 'javascript',
      highlightDifferences: true,
      gutters: ['CodeMirror-lint-markers'],
      lint: true,
      connect: 'align',
    });
    ReactDOM.render(DivElem, containerElem);
  }, []);


  return (
    <Modal isOpen className="modal-gfm-cheatsheet">
      <ModalHeader tag="h4" className="bg-primary text-light">
        <i className="icon-fw icon-question" />Resolve Conflict
      </ModalHeader>
      <ModalBody>
        <div id="cm-mv"></div>
      </ModalBody>
    </Modal>
  );
};
