import React, { useState } from 'react';

import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button,
} from 'reactstrap';

import { useParentPageSelectModal } from '~/stores/modal';

export const ParentPageSelectModal = () => {
  const {
    data: parentPageSelectModalData,
    open: openModal,
    close: closeModal,
    error,
  } = useParentPageSelectModal();

  const { isOpened } = parentPageSelectModalData;

  if (error) {
    // エラーが発生した場合の処理
  }

  if (!isOpened) {
    // modalが開いていないときの処理
    return <></>;
  }

  // modalが開いている時の処理
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
