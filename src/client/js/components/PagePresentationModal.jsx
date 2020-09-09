import React from 'react';
import {
  Modal, ModalBody,
} from 'reactstrap';

const PagePresentationModal = (props) => {
  return (
    <Modal isOpen={props.isOpen} toggle={props.onClose} className="fullscreen-layer1">
      <ModalBody className="grw-presentation-page">
        <iframe src={props.href} />
      </ModalBody>
    </Modal>
  );
};

export default PagePresentationModal;
