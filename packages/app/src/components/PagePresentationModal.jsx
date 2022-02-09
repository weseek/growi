import React from 'react';
import {
  Modal, ModalBody,
} from 'reactstrap';

import { usePagePresentationModalStatus, usePagePresentationModalOpened } from '~/stores/ui';

const PagePresentationModal = () => {

  const { data: presentationData, close: closePresentationModal } = usePagePresentationModalStatus();
  const { data: isOpened } = usePagePresentationModalOpened();

  return (
    <Modal isOpen={isOpened} toggle={closePresentationModal} className="grw-presentation-modal" unmountOnClose={false}>
      <ModalBody className="modal-body">
        <iframe src={presentationData.href} />
      </ModalBody>
    </Modal>
  );
};

export default PagePresentationModal;
