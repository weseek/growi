import React, { FC } from 'react';
import { Modal, ModalBody } from 'reactstrap';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  href: string,
}

const PagePresentationModal:FC<Props> = (props:Props) => {

  function closeModalHandler() {
    if (props.onClose === null) {
      return;
    }
    props.onClose();
  }

  return (
    <Modal isOpen={props.isOpen} toggle={closeModalHandler} className="grw-presentation-modal" unmountOnClose={false}>
      <ModalBody className="modal-body">
        <iframe src={props.href} />
      </ModalBody>
    </Modal>
  );
};

export default PagePresentationModal;
