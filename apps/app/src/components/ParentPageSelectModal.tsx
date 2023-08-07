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

  const { isOpened } = parentPageSelectModalData;

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
        <ModalHeader toggle={() => closeModal()}>モーダル</ModalHeader>
        <ModalBody >
        少年老い易く学成り難し
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
