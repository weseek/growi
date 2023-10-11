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

  const { data: imageEditorModalData, close: closeImageEditorModal } = useImageEditorModal();

  const transitionHistoryButtonClickHandler = () => {
    setModalType('history');
  };

  const transitionEditButtonClickHandler = () => {
    setModalType('edit');
  };

  return (
    <Modal
      style={{ maxWidth: '1000px' }}
      isOpen={imageEditorModalData?.isOpened ?? false}
      toggle={() => closeImageEditorModal()}
    >
      { modalType === 'edit' && (
        <ImageEditorEditModal imageEditorModalData={imageEditorModalData} onClickTransitionHistoryButton={transitionHistoryButtonClickHandler} />
      )}

      { modalType === 'history' && (
        <ImageEditorHistoryModal imageEditorModalData={imageEditorModalData} onClickTransitionEditButton={transitionEditButtonClickHandler} />
      ) }
    </Modal>
  );
};

export default ImageEditorModal;
