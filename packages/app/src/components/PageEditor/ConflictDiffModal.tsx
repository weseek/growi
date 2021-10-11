import React, { FC } from 'react';
import {
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';
import { UnControlled as ReactCodeMirror } from 'react-codemirror2';

export const ConflictDiffModal: FC = () => {
  return (
    <Modal isOpen className="modal-gfm-cheatsheet">
      <ModalHeader tag="h4" className="bg-primary text-light">
        <i className="icon-fw icon-question" />Markdown help
      </ModalHeader>
      <ModalBody>
        <ReactCodeMirror />
      </ModalBody>
    </Modal>
  );
};
