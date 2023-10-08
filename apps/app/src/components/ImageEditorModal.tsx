import React from 'react';

import {
  Modal, ModalBody, ModalHeader, ModalFooter,
} from 'reactstrap';

import { useImageEditorModal } from '~/stores/modal';

const ImageEditorModal = (): JSX.Element => {
  const { data: imageEditorModalData, close } = useImageEditorModal();

  if (imageEditorModalData?.imageSrc == null) {
    return <></>;
  }

  return (
    <div>
      <Modal isOpen={imageEditorModalData?.isOpened ?? false} toggle={() => close()}>
        <ModalHeader>
          ヘッダー
        </ModalHeader>

        <ModalBody>
          <img src={imageEditorModalData.imageSrc}></img>
        </ModalBody>

        <ModalFooter>
          フッター
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ImageEditorModal;
