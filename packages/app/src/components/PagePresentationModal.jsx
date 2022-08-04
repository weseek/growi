import React from 'react';

import {
  Modal, ModalBody,
} from 'reactstrap';

import { usePagePresentationModal } from '~/stores/modal';

import styles from './PagePresentationModal.module.scss';

const PagePresentationModal = () => {

  const { data: presentationData, close: closePresentationModal } = usePagePresentationModal();

  return (
    <Modal
      isOpen={presentationData.isOpened}
      toggle={closePresentationModal}
      data-testid="page-presentation-modal"
      className={`grw-presentation-modal ${styles['grw-presentation-modal']} grw-body-only-modal-expanded`}
      unmountOnClose={false}
    >
      <ModalBody className="modal-body">
        <iframe src={presentationData.href} />
      </ModalBody>
    </Modal>
  );
};

export default PagePresentationModal;
