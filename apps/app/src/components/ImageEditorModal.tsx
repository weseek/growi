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
  const [attachmentId, setAttachmentId] = useState('');

  const { data: imageEditorModalData, close: closeImageEditorModal } = useImageEditorModal();

  const transitionHistoryButtonClickHandler = () => {
    setModalType('history');
  };

  const transitionEditButtonClickHandler = () => {
    setModalType('edit');
  };

  const restoreAttachment = (id: string) => {
    setAttachmentId(id);
    setModalType('edit');
  };

  return (
    <Modal
      style={{ maxWidth: '1000px' }}
      isOpen={imageEditorModalData?.isOpened ?? false}
      toggle={() => closeImageEditorModal()}
    >
      { modalType === 'edit' && (
        <ImageEditorEditModal
          imageEditorModalData={imageEditorModalData}
          onClickTransitionHistoryButton={transitionHistoryButtonClickHandler}
          attachmentId={attachmentId}
          setAttachmentId={setAttachmentId}
        />
      )}

      { modalType === 'history' && (
        <ImageEditorHistoryModal
          imageEditorModalData={imageEditorModalData}
          onClickTransitionEditButton={transitionEditButtonClickHandler}
          onRestoreClick={restoreAttachment}
        />
      ) }
    </Modal>
  );
};

export default ImageEditorModal;
