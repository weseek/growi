import React, { useState } from 'react';

import {
  Modal, ModalHeader, ModalBody, ModalFooter, Button,
} from 'reactstrap';

import { useParentPageSelectModal } from '~/stores/modal';

export const ParentPageSelectModal = () => {
  const {
    data, error, open, close,
  } = useParentPageSelectModal();

  const {
    data: parentPageSelectModalData, open: openModal, close: closeModal,
  } = useParentPageSelectModal();
  const { isOpened } = parentPageSelectModalData;

  if (error) {
    // エラーが発生した場合の処理
  }

  if (!isOpened) {
    // modalが開いていないときの処理
  }
  else {
    // modalが開いている時の処理
  }
};
