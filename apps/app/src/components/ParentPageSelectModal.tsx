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
      <Modal isOpen={isOpened} toggle={() => closeModal()}>
        <ModalHeader>Modal title</ModalHeader>
        <ModalBody>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
        minim veniam, quis nostrud exercitation ullamco laboris nisi ut
        aliquip ex ea commodo consequat. Duis aute irure dolor in
        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
        culpa qui officia deserunt mollit anim id est laborum.
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
