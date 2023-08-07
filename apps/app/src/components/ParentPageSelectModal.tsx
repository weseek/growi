import React from 'react';

import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button,
} from 'reactstrap';

import { useParentPageSelectModal } from '~/stores/modal';

export const ParentPageSelectModal = (): JSX.Element => {
  const {
    data: parentPageSelectModalData,
    close: closeModal,
  } = useParentPageSelectModal();

  const isOpened = parentPageSelectModalData?.isOpened ?? false;

  if (!isOpened) {
    return <></>;
  }

  return (
    <>
      <Modal
        isOpen={isOpened}
        toggle={() => closeModal()}
        centered={true}
      >
        <ModalHeader toggle={() => closeModal()}>modal</ModalHeader>
        <ModalBody >
        Art is long, life is short.
        </ModalBody>
        <ModalFooter>
          <Button color="primary">
          Do Something
          </Button>{' '}
          <Button color="secondary">
          Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
