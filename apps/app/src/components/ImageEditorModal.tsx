import React from 'react';

import {
  Modal, ModalBody, ModalHeader, ModalFooter,
} from 'reactstrap';

import { useImageEditorModal } from '~/stores/modal';


const WorkflowModal = (): JSX.Element => {
  const { data: imageEditorModalData, close } = useImageEditorModal();

  return (
    <Modal isOpen={imageEditorModalData?.isOpened ?? false} toggle={() => close()}>
      <ModalHeader>
        ヘッダー
      </ModalHeader>

      <ModalBody>
        <img src={imageEditorModalData?.imageSrc}></img>
      </ModalBody>

      <ModalFooter>
        フッター
      </ModalFooter>
    </Modal>
  );
};

export default WorkflowModal;
