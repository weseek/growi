import { useState } from 'react';

import {
  Modal,
} from 'reactstrap';

import { useImageEditorModal } from '~/stores/modal';

import { ImageEditorEditModal } from './ImageEditorEditModal';
import { ImageEditorHistoryModal } from './ImageEditorHistoryModal';

type ModalType = 'edit' | 'history';


const ImageEditorModal = (): JSX.Element => {
  const [modalType, setModalType] = useState<ModalType>('edit');
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null);

  const { data: imageEditorModalData, close: closeImageEditorModal } = useImageEditorModal();

  const transitionHistoryButtonClickHandler = () => {
    setModalType('history');
  };

  const transitionEditButtonClickHandler = () => {
    setModalType('edit');
  };

  const restoreAttachment = (id: string) => {
    setSelectedAttachmentId(id);
    setModalType('edit');
  };

  const cleanupModal = () => {
    closeImageEditorModal();
    setSelectedAttachmentId(null);
    setModalType('edit');
  };

  return (
    <Modal
      style={{ maxWidth: '1000px' }}
      isOpen={imageEditorModalData?.isOpened ?? false}
      toggle={() => cleanupModal()}
    >
      { modalType === 'edit' && (
        <ImageEditorEditModal
          onClickTransitionHistoryButton={transitionHistoryButtonClickHandler}
          selectedAttachmentId={selectedAttachmentId}
          setSelectedAttachmentId={setSelectedAttachmentId}
          cleanupModal={cleanupModal}
        />
      )}

      { modalType === 'history' && (
        <ImageEditorHistoryModal
          onClickTransitionEditButton={transitionEditButtonClickHandler}
          onRestoreClick={restoreAttachment}
          setSelectedAttachmentId={setSelectedAttachmentId}
        />
      ) }
    </Modal>
  );
};

export default ImageEditorModal;
