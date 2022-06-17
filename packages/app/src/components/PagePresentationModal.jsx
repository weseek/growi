import React from 'react';

import {
  Modal, ModalBody,
} from 'reactstrap';

import { usePagePresentationModal } from '~/stores/modal';

const PagePresentationModal = () => {

  const { data: presentationData, close: closePresentationModal } = usePagePresentationModal();

  return (
    <Modal
      isOpen={presentationData.isOpened}
      toggle={closePresentationModal}
      data-testid="page-presentation-modal"
      className="grw-presentation-modal"
      unmountOnClose={false}
    >
      <ModalBody className="modal-body">
        <iframe src={presentationData.href} />
      </ModalBody>
    </Modal>
  );
};

export default PagePresentationModal;
